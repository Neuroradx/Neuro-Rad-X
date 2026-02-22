
"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import admin from 'firebase-admin';
import { type FieldValue, type Timestamp, type DocumentData } from "firebase-admin/firestore";
import { sendApprovalEmail } from "@/actions/email-actions";
import type { UserProfile, IssueReport as IssueReportType, UserQuestionState, ScientificArticle } from "@/types";
import adminEmails from '@/lib/admin-emails.json';
import testerEmails from '@/lib/tester-emails.json';

// Distributed Counters Configuration
const NUM_SHARDS = 10;

/**
 * Helper to recursively convert Firestore Timestamps to ISO strings
 * to ensure objects are plain and serializable for Next.js Server-to-Client communication.
 */
function serializeData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  // Handle Firestore Timestamp
  if (typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map(serializeData);
  }

  // Handle Objects
  const serialized: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      serialized[key] = serializeData(data[key]);
    }
  }
  return serialized;
}

/**
 * Increments the user's total answered and correct counts using a random shard.
 * This avoids write contention on the user document.
 */
export async function updateUserCounters(userId: string, answeredIncrement: number, correctIncrement: number) {
  if (!adminDb) return { success: false, error: "Admin SDK not initialized." };

  try {
    const shardId = Math.floor(Math.random() * NUM_SHARDS).toString();
    const shardRef = adminDb.collection('users').doc(userId).collection('shards').doc(shardId);

    await shardRef.set({
      answeredCount: admin.firestore.FieldValue.increment(answeredIncrement),
      correctCount: admin.firestore.FieldValue.increment(correctIncrement),
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.error(`[updateUserCounters] Error for user ${userId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Records an individual question attempt and updates distributed counters.
 */
export async function recordQuestionAttempt(userId: string, questionId: string, isCorrect: boolean) {
  if (!adminDb) return { success: false, error: "Admin SDK not initialized." };

  try {
    const userQuestionRef = adminDb.collection('users').doc(userId).collection('userQuestions').doc(questionId);

    // Update individual question state
    await userQuestionRef.set({
      questionId,
      seenCount: admin.firestore.FieldValue.increment(1),
      correctCount: admin.firestore.FieldValue.increment(isCorrect ? 1 : 0),
      incorrectCount: admin.firestore.FieldValue.increment(isCorrect ? 0 : 1),
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Update distributed counters
    await updateUserCounters(userId, 1, isCorrect ? 1 : 0);

    return { success: true };
  } catch (error: any) {
    console.error(`[recordQuestionAttempt] Error:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Saves a completed quiz session to the database.
 */
export async function saveQuizSessionAction(userId: string, sessionData: any) {
  if (!adminDb) return { success: false, error: "Admin SDK not initialized." };
  try {
    const sessionRef = adminDb.collection('users').doc(userId).collection('quiz_sessions').doc();
    await sessionRef.set({
      ...sessionData,
      userId,
      quizDate: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, sessionId: sessionRef.id };
  } catch (error: any) {
    console.error(`[saveQuizSessionAction] Error:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Aggregates all shards for a user to get the total stats.
 */
export async function getUserAggregateStats(userId: string): Promise<{ totalAnswered: number; totalCorrect: number }> {
  if (!adminDb) return { totalAnswered: 0, totalCorrect: 0 };

  try {
    const shardsSnapshot = await adminDb.collection('users').doc(userId).collection('shards').get();
    let totalAnswered = 0;
    let totalCorrect = 0;

    shardsSnapshot.forEach(doc => {
      const data = doc.data();
      totalAnswered += data.answeredCount || 0;
      totalCorrect += data.correctCount || 0;
    });

    return { totalAnswered, totalCorrect };
  } catch (error) {
    console.error(`[getUserAggregateStats] Error for user ${userId}:`, error);
    return { totalAnswered: 0, totalCorrect: 0 };
  }
}

async function verifyAdminRole(callerUid: string | null) {
  if (!callerUid || !adminDb) return false;
  try {
    const userDoc = await adminDb.collection('users').doc(callerUid).get();
    return userDoc.exists && userDoc.data()?.role === 'admin';
  } catch (error) {
    console.error("[verifyAdminRole] Error:", error);
    return false;
  }
}

interface FirestoreUserData extends DocumentData {
  email?: string | null;
  displayName?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  role?: string;
  subscriptionLevel?: string;
  subscriptionExpiresAt?: Timestamp | null;
  totalQuestionsAnsweredAllTime?: number;
  totalCorrectAnswersAllTime?: number;
  createdAt?: Timestamp;
}

const DETAILED_ADMIN_SDK_ERROR = "Server configuration error: The Admin SDK is not initialized.";

export async function getAdminSummaryStats(callerUid: string) {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: "Unauthorized access." };
  if (!adminDb) return { success: false, error: DETAILED_ADMIN_SDK_ERROR };

  try {
    const questionsRef = adminDb.collection('questions');
    const usersRef = adminDb.collection('users');
    const reportsRef = adminDb.collection('issueReports');

    const [totalQs, reviewedQs, totalUsers, pendingUsers, activeReports] = await Promise.all([
      questionsRef.count().get(),
      questionsRef.where('Question_revised', '==', 'yes').count().get(),
      usersRef.count().get(),
      usersRef.where('status', '==', 'pending').count().get(),
      reportsRef.where('status', 'in', ['new', 'acknowledged', 'in-progress']).count().get(),
    ]);

    const totalCount = totalQs.data().count;
    const reviewedCount = reviewedQs.data().count;

    return {
      success: true,
      stats: {
        totalQuestions: totalCount,
        reviewedQuestions: reviewedCount,
        pendingQuestions: Math.max(0, totalCount - reviewedCount),
        totalUsers: totalUsers.data().count,
        pendingUsers: pendingUsers.data().count,
        activeReports: activeReports.data().count,
      }
    };
  } catch (error: any) {
    console.error("Error fetching admin summary stats:", error);
    return { success: false, error: error.message };
  }
}

export async function syncUserProfile(userData: {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  country?: string;
  institution?: string;
}) {
  if (!adminDb) return { success: false, error: DETAILED_ADMIN_SDK_ERROR };

  try {
    const { uid, email, firstName, lastName, country, institution } = userData;
    const displayName = `${firstName} ${lastName}`.trim();

    let userRole = 'user';
    let userStatus = 'pending';
    let subscriptionLevel: UserProfile['subscriptionLevel'] = 'Trial';
    let subscriptionExpiresAt: admin.firestore.Timestamp | null = null;

    if (adminEmails.includes(email)) {
      userRole = 'admin';
      userStatus = 'approved';
      subscriptionLevel = 'Owner';
    } else if (testerEmails.includes(email)) {
      userRole = 'tester';
      userStatus = 'approved';
      subscriptionLevel = 'Evaluator';
    } else {
      const trialExpirationDate = new Date();
      trialExpirationDate.setDate(trialExpirationDate.getDate() + 30);
      subscriptionExpiresAt = admin.firestore.Timestamp.fromDate(trialExpirationDate);
    }

    const userDocRef = adminDb.collection("users").doc(uid);
    const existingDoc = await userDocRef.get();

    const profileData = {
      uid,
      firstName,
      lastName,
      displayName,
      email,
      status: userStatus,
      role: userRole,
      country: country || "",
      institution: institution || "",
      subscriptionLevel,
      subscriptionExpiresAt,
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!existingDoc.exists) {
      await userDocRef.set({
        ...profileData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        totalQuestionsAnsweredAllTime: 0,
        totalCorrectAnswersAllTime: 0,
      });
    } else {
      const currentData = existingDoc.data();
      await userDocRef.update({
        ...profileData,
        role: currentData?.role || userRole,
        status: currentData?.status || userStatus,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in syncUserProfile:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchAllActiveUsers(page: number, pageSize: number, callerUid: string): Promise<{ success: boolean; users?: any[]; totalCount?: number; error?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: "Unauthorized access." };

  if (!adminDb || !adminAuth) return { success: false, error: DETAILED_ADMIN_SDK_ERROR };

  try {
    const usersRef = adminDb.collection('users');
    const allUsersSnapshot = await usersRef.orderBy("totalQuestionsAnsweredAllTime", "desc").get();
    const allUsersData = allUsersSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as FirestoreUserData) }));

    const totalCount = allUsersData.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedUsersData = allUsersData.slice(startIndex, startIndex + pageSize);

    const combinedUsers = await Promise.all(paginatedUsersData.map(async (firestoreUser) => {
      const authRecord = await adminAuth.getUser(firestoreUser.id).catch(() => null);
      const notificationsSnapshot = await adminDb.collection('notifications').where('userId', '==', firestoreUser.id).get();

      // Get distributed stats
      const aggregateStats = await getUserAggregateStats(firestoreUser.id);

      return {
        id: firestoreUser.id,
        email: authRecord?.email || firestoreUser.email || null,
        displayName: authRecord?.displayName || firestoreUser.displayName || '(No name set)',
        avatarUrl: authRecord?.photoURL || firestoreUser.avatarUrl,
        createdAt: authRecord?.metadata.creationTime,
        lastSignInTime: authRecord?.metadata.lastSignInTime,
        status: firestoreUser.status || 'unknown',
        role: firestoreUser.role || 'user',
        subscriptionLevel: firestoreUser.subscriptionLevel || 'free',
        subscriptionExpiresAt: (firestoreUser.subscriptionExpiresAt as Timestamp)?.toDate()?.toISOString() || null,
        // Use aggregated stats if available, otherwise fallback to root doc
        totalQuestionsAnsweredAllTime: aggregateStats.totalAnswered || firestoreUser.totalQuestionsAnsweredAllTime || 0,
        totalCorrectAnswersAllTime: aggregateStats.totalCorrect || firestoreUser.totalCorrectAnswersAllTime || 0,
        notificationCount: notificationsSnapshot.size,
      };
    }));

    return { success: true, users: serializeData(combinedUsers), totalCount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUserAndTheirData(userId: string, callerUid: string): Promise<{ success: boolean; message?: string }> {
  if (callerUid !== userId && !await verifyAdminRole(callerUid)) {
    return { success: false, message: "Unauthorized access." };
  }

  if (!userId || !adminDb || !adminAuth) return { success: false, message: DETAILED_ADMIN_SDK_ERROR };

  try {
    const subCollections = ["quiz_sessions", "userQuestions", "seenFacts", "bookmarkedQuestions", "questionNotes", "shards"];
    for (const sub of subCollections) {
      const snapshot = await adminDb.collection(`users/${userId}/${sub}`).limit(500).get();
      if (!snapshot.empty) {
        const batch = adminDb.batch();
        snapshot.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    }
    await adminDb.collection("users").doc(userId).delete();
    await adminAuth.deleteUser(userId);
    return { success: true, message: "User deleted successfully." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function resetUserStatistics(userId: string, callerUid: string): Promise<{ success: boolean; message?: string }> {
  if (callerUid !== userId && !await verifyAdminRole(callerUid)) return { success: false, message: "Unauthorized access." };
  if (!userId || !adminDb) return { success: false, message: "Invalid parameters." };

  try {
    await adminDb.collection("users").doc(userId).update({
      totalQuestionsAnsweredAllTime: 0,
      totalCorrectAnswersAllTime: 0,
    });

    const subCollections = ["quiz_sessions", "userQuestions", "seenFacts", "bookmarkedQuestions", "questionNotes", "shards"];
    for (const sub of subCollections) {
      const snapshot = await adminDb.collection(`users/${userId}/${sub}`).limit(500).get();
      if (!snapshot.empty) {
        const batch = adminDb.batch();
        snapshot.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
    }
    return { success: true, message: "User statistics reset successfully." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function approveUser(userData: { userId: string; email: string; displayName?: string; firstName?: string; }, callerUid: string): Promise<{ success: boolean; message?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, message: "Unauthorized access." };
  if (!userData.userId || !adminDb) return { success: false, message: "Invalid data." };

  try {
    await adminDb.collection('users').doc(userData.userId).update({ status: 'approved' });
    await sendApprovalEmail(userData);
    return { success: true, message: "User approved successfully." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateUserSubscription(userId: string, subscriptionLevel: string, callerUid: string): Promise<{ success: boolean; message?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, message: "Unauthorized access." };
  if (!userId || !adminDb) return { success: false, message: "Invalid data." };

  try {
    let expires: admin.firestore.Timestamp | null = null;
    if (subscriptionLevel === 'Trial') {
      expires = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    } else if (subscriptionLevel === 'ECMINT') {
      expires = admin.firestore.Timestamp.fromDate(new Date('2025-06-28T23:59:59Z'));
    }
    await adminDb.collection("users").doc(userId).update({
      subscriptionLevel,
      subscriptionExpiresAt: expires
    });
    return { success: true, message: "Subscription updated." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function fetchSimpleUserDetails(userId: string, callerUid: string): Promise<{ success: boolean; user?: any; error?: string }> {
  if (!await verifyAdminRole(callerUid) && callerUid !== userId) return { success: false, error: "Unauthorized." };
  if (!userId || !adminDb) return { success: false, error: "Invalid ID." };
  try {
    const docSnap = await adminDb.collection("users").doc(userId).get();
    if (!docSnap.exists) return { success: false, error: "User not found." };
    const data = docSnap.data() as FirestoreUserData;
    const authRecord = adminAuth ? await adminAuth.getUser(userId).catch(() => null) : null;
    const reports = await adminDb.collection('issueReports').where('userId', '==', userId).get();
    const notifications = await adminDb.collection('notifications').where('userId', '==', userId).get();

    // Get aggregated stats from shards
    const aggregateStats = await getUserAggregateStats(userId);

    return {
      success: true,
      user: serializeData({
        id: userId,
        email: authRecord?.email || data.email,
        displayName: authRecord?.displayName || data.displayName,
        avatarUrl: authRecord?.photoURL || data.avatarUrl,
        role: data.role || 'user',
        status: data.status || 'unknown',
        subscriptionLevel: data.subscriptionLevel || 'free',
        totalReports: reports.size,
        notificationCount: notifications.size,
        totalQuestionsAnsweredAllTime: aggregateStats.totalAnswered || data.totalQuestionsAnsweredAllTime || 0,
        totalCorrectAnswersAllTime: aggregateStats.totalCorrect || data.totalCorrectAnswersAllTime || 0,
        createdAt: data.createdAt, // This will be serialized by serializeData
        subscriptionExpiresAt: data.subscriptionExpiresAt, // This will be serialized by serializeData
      })
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function searchUsers(searchTerm: string, callerUid: string): Promise<{ success: boolean; users?: any[]; error?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: "Unauthorized access." };

  if (!searchTerm || searchTerm.trim().length < 3) {
    return { success: false, error: "Search term must be at least 3 characters long." };
  }

  try {
    if (!adminDb || !adminAuth) return { success: false, error: DETAILED_ADMIN_SDK_ERROR };

    const firestore = adminDb;
    const auth = adminAuth;
    const trimmedSearchTerm = searchTerm.trim();
    const usersMap = new Map<string, { auth?: admin.auth.UserRecord, firestore?: FirestoreUserData }>();

    const addUserToMap = (userRecord: admin.auth.UserRecord) => {
      usersMap.set(userRecord.uid, { ...usersMap.get(userRecord.uid), auth: userRecord });
    };

    try {
      const userRecord = await auth.getUsers([{ email: trimmedSearchTerm }]);
      if (userRecord.users.length > 0) addUserToMap(userRecord.users[0]);
    } catch (error: any) { }

    try {
      const userRecord = await auth.getUser(trimmedSearchTerm);
      addUserToMap(userRecord);
    } catch (error: any) { }

    const usersRef = firestore.collection('users');
    const [displayNameSnapshot, firstNameSnapshot, lastNameSnapshot] = await Promise.all([
      usersRef.where('displayName', '>=', trimmedSearchTerm).where('displayName', '<=', trimmedSearchTerm + '\uf8ff').get(),
      usersRef.where('firstName', '>=', trimmedSearchTerm).where('firstName', '<=', trimmedSearchTerm + '\uf8ff').get(),
      usersRef.where('lastName', '>=', trimmedSearchTerm).where('lastName', '<=', trimmedSearchTerm + '\uf8ff').get(),
    ]);

    displayNameSnapshot.forEach(doc => usersMap.set(doc.id, { ...usersMap.get(doc.id), firestore: doc.data() as FirestoreUserData }));
    firstNameSnapshot.forEach(doc => usersMap.set(doc.id, { ...usersMap.get(doc.id), firestore: doc.data() as FirestoreUserData }));
    lastNameSnapshot.forEach(doc => usersMap.set(doc.id, { ...usersMap.get(doc.id), firestore: doc.data() as FirestoreUserData }));

    if (usersMap.size === 0) return { success: true, users: [] };

    const combinedUsersPromises = Array.from(usersMap.entries()).map(async ([uid, data]) => {
      const authRecord = data.auth || (adminAuth ? await adminAuth.getUser(uid).catch(() => null) : null);
      const firestoreProfile: FirestoreUserData = data.firestore || (adminDb ? (await adminDb.collection('users').doc(uid).get()).data() || {} : {});

      const notificationsSnapshot = await firestore.collection('notifications').where('userId', '==', uid).get();

      // Aggregation for search results
      const aggregateStats = await getUserAggregateStats(uid);

      return {
        id: uid,
        email: authRecord?.email || firestoreProfile.email || null,
        displayName: authRecord?.displayName || firestoreProfile.displayName || '(No name set)',
        avatarUrl: authRecord?.photoURL || firestoreProfile.avatarUrl,
        createdAt: authRecord?.metadata.creationTime,
        lastSignInTime: authRecord?.metadata.lastSignInTime,
        status: firestoreProfile.status || 'unknown',
        role: firestoreProfile.role || 'user',
        subscriptionLevel: firestoreProfile.subscriptionLevel || 'free',
        subscriptionExpiresAt: (firestoreProfile.subscriptionExpiresAt as Timestamp)?.toDate()?.toISOString() || null,
        totalQuestionsAnsweredAllTime: aggregateStats.totalAnswered || firestoreProfile.totalQuestionsAnsweredAllTime || 0,
        totalCorrectAnswersAllTime: aggregateStats.totalCorrect || firestoreProfile.totalCorrectAnswersAllTime || 0,
        notificationCount: notificationsSnapshot.size,
      };
    });

    const combinedUsers = await Promise.all(combinedUsersPromises);
    return { success: true, users: serializeData(combinedUsers) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchReportedIssues(page: number, pageSize: number, callerUid: string): Promise<{ success: boolean; reports?: any[]; totalCount?: number; error?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: "Unauthorized access." };
  if (!adminDb) return { success: false, error: DETAILED_ADMIN_SDK_ERROR };

  try {
    const snapshot = await adminDb.collection('issueReports').where('status', '!=', 'archived').orderBy('status').orderBy('timestamp', 'desc').get();
    const allReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timestamp: (doc.data().timestamp as admin.firestore.Timestamp).toDate().toISOString() }));

    const startIndex = (page - 1) * pageSize;
    const paginated = allReports.slice(startIndex, startIndex + pageSize);

    const reportsWithUsers = await Promise.all(paginated.map(async (report: any) => {
      if (report.userId === 'anonymous') return report;
      const user = await fetchSimpleUserDetails(report.userId, callerUid);
      return { ...report, reporterProfile: user.success ? user.user : null };
    }));

    return { success: true, reports: serializeData(reportsWithUsers), totalCount: allReports.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateIssueStatus(
  reportId: string,
  newStatus: string,
  sendNotification: boolean,
  context: { userId: string; questionId: string },
  callerUid: string
) {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: "Unauthorized access." };
  if (!adminDb) return { success: false, error: "Admin SDK not initialized." };

  try {
    await adminDb.collection('issueReports').doc(reportId).update({ status: newStatus });

    if (sendNotification && context.userId !== 'anonymous') {
      await adminDb.collection("notifications").add({
        userId: context.userId,
        titleKey: "notifications.issueReportUpdateTitle",
        messageKey: "notifications.issueReportUpdateBody",
        messageParams: {
          questionId: context.questionId,
          statusKey: newStatus
        },
        type: "issueReportUpdate",
        status: "unread",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        icon: "AlertCircle",
        link: `/questions/${context.questionId}`
      });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchPendingUsers(page: number, pageSize: number, callerUid: string): Promise<{ success: boolean; users?: any[]; totalCount?: number; error?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: "Unauthorized access." };
  if (!adminDb || !adminAuth) return { success: false, error: DETAILED_ADMIN_SDK_ERROR };

  try {
    const snapshot = await adminDb.collection('users').where('status', '==', 'pending').get();
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const paginated = all.slice((page - 1) * pageSize, page * pageSize);

    const users = await Promise.all(paginated.map(async (u: any) => {
      const authRec = await adminAuth.getUser(u.id).catch(() => null);
      return { ...u, email: authRec?.email || u.email, displayName: authRec?.displayName || u.displayName };
    }));

    return { success: true, users: serializeData(users), totalCount: all.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchUsersBySubscription(subscriptionLevel: string, page: number, pageSize: number, callerUid: string): Promise<{ success: boolean; users?: any[]; totalCount?: number; error?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: "Unauthorized access." };
  if (!adminDb || !adminAuth) return { success: false, error: DETAILED_ADMIN_SDK_ERROR };

  try {
    const snapshot = await adminDb.collection('users').where('subscriptionLevel', '==', subscriptionLevel).get();
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const paginated = all.slice((page - 1) * pageSize, page * pageSize);

    const users = await Promise.all(paginated.map(async (u: any) => {
      const authRec = await adminAuth.getUser(u.id).catch(() => null);

      // Get aggregated stats for subscription list
      const aggregateStats = await getUserAggregateStats(u.id);

      return {
        ...u,
        email: authRec?.email || u.email,
        displayName: authRec?.displayName || u.displayName,
        totalQuestionsAnsweredAllTime: aggregateStats.totalAnswered || u.totalQuestionsAnsweredAllTime || 0,
        totalCorrectAnswersAllTime: aggregateStats.totalCorrect || u.totalCorrectAnswersAllTime || 0,
      };
    }));

    return { success: true, users: serializeData(users), totalCount: all.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchReviewerStats(callerUid: string) {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: 'Unauthorized access.' };
  if (!adminDb || !adminAuth) return { success: false, error: DETAILED_ADMIN_SDK_ERROR };
  try {
    const reviewersQuery = await adminDb.collection('users').where('role', 'in', ['admin', 'tester', 'Owner', 'Evaluator']).get();
    if (reviewersQuery.empty) return { success: true, stats: [] };

    const reviewerIds = reviewersQuery.docs.map(doc => doc.id);
    const [reviewed, edited] = await Promise.all([
      adminDb.collection('questions').where('Question_revised_by', 'in', reviewerIds).get(),
      adminDb.collection('questions').where('lastUpdatedBy', 'in', reviewerIds).get()
    ]);

    const reviewedCounts: Record<string, number> = {};
    reviewed.forEach(doc => { const id = doc.data().Question_revised_by; if (id) reviewedCounts[id] = (reviewedCounts[id] || 0) + 1; });

    const editedCounts: Record<string, number> = {};
    edited.forEach(doc => { const id = doc.data().lastUpdatedBy; if (id) editedCounts[id] = (editedCounts[id] || 0) + 1; });

    const stats = reviewersQuery.docs.map(doc => {
      const userData = doc.data() as UserProfile;
      return {
        id: doc.id,
        displayName: userData.displayName || 'N/A',
        email: userData.email || 'N/A',
        avatarUrl: userData.avatarUrl,
        subscriptionLevel: userData.subscriptionLevel || 'free',
        reviewedCount: reviewedCounts[doc.id] || 0,
        editedCount: editedCounts[doc.id] || 0,
      };
    }).sort((a, b) => (b.reviewedCount + b.editedCount) - (a.reviewedCount + a.editedCount));

    return { success: true, stats };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchIncorrectlyAnsweredQuestions(userId: string, callerUid: string) {
  if (callerUid !== userId && !await verifyAdminRole(callerUid)) {
    return { success: false, error: 'Unauthorized access.' };
  }
  if (!adminDb) return { success: false, error: "Admin SDK not initialized." };
  try {
    const q = await adminDb.collection(`users/${userId}/userQuestions`)
      .where('incorrectCount', '>', 0)
      .get();

    const ids = q.docs.map(doc => doc.id);
    return { success: true, questionIds: ids };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchQuestionStatsAndIdsForReview(
  callerUid: string,
  options?: { category?: string; subcategory?: string }
) {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: 'Unauthorized access.' };
  if (!adminDb) return { success: false, error: "Admin SDK not initialized." };
  try {
    const questionsRef = adminDb.collection('questions');
    const category = options?.category?.trim();
    const subcategory = options?.subcategory?.trim();

    let snapshot;
    if (category) {
      let query = questionsRef.where('main_localization', '==', category).limit(500);
      if (subcategory) {
        query = query.where('sub_main_location', '==', subcategory).limit(500);
      }
      snapshot = await query.get();
    } else {
      snapshot = await questionsRef.limit(500).get();
    }

    const unreviewedIds = snapshot.docs
      .filter(doc => {
        const d = doc.data();
        if (d.Question_revised === 'yes') return false;
        return true;
      })
      .slice(0, 100)
      .map(doc => doc.id);

    const totalSnapshot = await questionsRef.count().get();
    const reviewedSnapshot = await questionsRef.where('Question_revised', '==', 'yes').count().get();

    return {
      success: true,
      unreviewedIds,
      reviewedCount: reviewedSnapshot.data().count,
      totalCount: totalSnapshot.data().count
    };
  } catch (error: any) {
    console.error("Error in fetchQuestionStatsAndIdsForReview:", error);
    return { success: false, error: error.message };
  }
}

export async function markQuestionAsReviewed(questionId: string, reviewerUid: string, scientificArticle?: ScientificArticle) {
  if (!await verifyAdminRole(reviewerUid)) return { success: false, error: 'Unauthorized access.' };
  if (!adminDb) return { success: false, error: "Admin SDK not initialized." };
  try {
    const updateData: any = {
      Question_revised: 'yes',
      Question_revised_by: reviewerUid,
      Question_revised_at: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (scientificArticle) {
      updateData.scientificArticle = scientificArticle;
    }
    await adminDb.collection('questions').doc(questionId).update(updateData);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

const PAGE_SIZE_LAST_REVIEWED = 10;

export type LastReviewedQuestionItem = {
  id: string;
  questionText: string;
};

/**
 * Fetches the last reviewed questions with cursor-based pagination (10 per page).
 * Requires admin. Returns questions ordered by Question_revised_at desc.
 */
export async function fetchLastReviewedQuestions(
  callerUid: string,
  options: { afterDocId?: string; beforeDocId?: string }
): Promise<{
  success: boolean;
  questions?: LastReviewedQuestionItem[];
  totalCount?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  nextPageDocId?: string;
  prevPageDocId?: string;
  error?: string;
}> {
  if (!(await verifyAdminRole(callerUid))) return { success: false, error: 'Unauthorized access.' };
  if (!adminDb) return { success: false, error: 'Admin SDK not initialized.' };
  try {
    const questionsRef = adminDb.collection('questions');
    const baseQuery = questionsRef
      .where('Question_revised', '==', 'yes')
      .orderBy('Question_revised_at', 'desc');

    const [countSnap, ...rest] = await Promise.all([
      questionsRef.where('Question_revised', '==', 'yes').count().get(),
      options.afterDocId
        ? questionsRef.doc(options.afterDocId).get()
        : Promise.resolve(null),
      options.beforeDocId
        ? questionsRef.doc(options.beforeDocId).get()
        : Promise.resolve(null),
    ]);
    const totalCount = countSnap.data().count;
    const afterDoc = rest[0] as admin.firestore.DocumentSnapshot | null;
    const beforeDoc = rest[1] as admin.firestore.DocumentSnapshot | null;

    let query: admin.firestore.Query = baseQuery.limit(PAGE_SIZE_LAST_REVIEWED + 1);
    if (afterDoc?.exists) query = query.startAfter(afterDoc);
    else if (beforeDoc?.exists) query = query.endBefore(beforeDoc).limit(PAGE_SIZE_LAST_REVIEWED + 1);

    const snapshot = await query.get();
    const allDocs = snapshot.docs;
    const hasMore = allDocs.length > PAGE_SIZE_LAST_REVIEWED;
    const docs = hasMore ? allDocs.slice(0, PAGE_SIZE_LAST_REVIEWED) : allDocs;
    const questions: LastReviewedQuestionItem[] = docs.map((d) => {
      const data = d.data();
      const en = data.translations?.en;
      const questionText = (en?.questionText ?? '').trim() || '(no text)';
      return { id: d.id, questionText };
    });
    const firstDocId = docs[0]?.id;
    const lastDocId = docs[docs.length - 1]?.id;

    return {
      success: true,
      questions,
      totalCount,
      hasNextPage: options.beforeDocId ? true : hasMore,
      hasPrevPage: options.afterDocId ? true : hasMore,
      nextPageDocId: (options.beforeDocId ? lastDocId : hasMore ? lastDocId : undefined),
      prevPageDocId: firstDocId,
    };
  } catch (error: any) {
    console.error('Error in fetchLastReviewedQuestions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Resets review progress to 0: removes Question_revised, Question_revised_by, Question_revised_at
 * from all questions that were marked as reviewed. Admin only.
 */
export async function resetReviewProgress(callerUid: string): Promise<{ success: boolean; resetCount?: number; error?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: 'Unauthorized access.' };
  if (!adminDb) return { success: false, error: "Admin SDK not initialized." };
  try {
    const snapshot = await adminDb.collection('questions').where('Question_revised', '==', 'yes').get();
    const deleteField = admin.firestore.FieldValue.delete();
    const BATCH_SIZE = 500;
    let committed = 0;
    for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
      const batch = adminDb.batch();
      const chunk = snapshot.docs.slice(i, i + BATCH_SIZE);
      chunk.forEach(doc => {
        batch.update(doc.ref, {
          Question_revised: deleteField,
          Question_revised_by: deleteField,
          Question_revised_at: deleteField,
        });
      });
      await batch.commit();
      committed += chunk.length;
    }
    return { success: true, resetCount: committed };
  } catch (error: any) {
    console.error("Error in resetReviewProgress:", error);
    return { success: false, error: error.message };
  }
}
