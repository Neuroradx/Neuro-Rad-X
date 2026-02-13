"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { z } from "zod";
import { Notification } from "@/types";

/**
 * SECURITY HELPER
 * Verifies if the caller has an 'admin' role in Firestore.
 */
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

const sendNotificationSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  title: z.string().min(1, "Title is required."),
  message: z.string().min(1, "Message is required."),
  type: z.enum(["issueReportUpdate", "adminMessage", "newFeature", "systemAlert"]),
  link: z.string().url().optional().or(z.literal("")),
  icon: z.string().optional()
});

/**
 * Sends a custom notification to a specific user.
 * Requires admin privileges.
 */
export async function sendCustomNotification(formData: {
  userId: string;
  title: string;
  message: string;
  type: "issueReportUpdate" | "adminMessage" | "newFeature" | "systemAlert";
  link?: string;
  icon?: string;
}, callerUid: string) {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: "Unauthorized access." };

  try {
    if (!adminDb) return { success: false, error: "Admin SDK not initialized." };

    const validationResult = sendNotificationSchema.safeParse(formData);
    if (!validationResult.success) return { success: false, error: "Invalid data." };

    const { userId, title, message, type, link, icon } = validationResult.data;
    await adminDb.collection("notifications").add({
      userId,
      titleKey: title,
      messageKey: message,
      type,
      link: link || null,
      icon: icon || null,
      status: "unread",
      createdAt: FieldValue.serverTimestamp(),
    });
    return { success: true, message: "Notification sent successfully." };
  } catch (error) {
    console.error("[sendCustomNotification] Error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Archives a notification so it doesn't show in the active lists.
 * Requires admin privileges.
 */
export async function archiveNotification(notificationId: string, callerUid: string): Promise<{ success: boolean, error?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: "Unauthorized access." };
  if (!adminDb) return { success: false, error: "Admin SDK not initialized." };

  try {
    await adminDb.collection("notifications").doc(notificationId).update({ status: 'archived' });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetches notifications for a specific user.
 */
export async function fetchUserNotifications(userId: string, callerUid: string): Promise<{ success: boolean; notifications?: any[]; error?: string }> {
  // A user can only fetch their own notifications unless they are an admin
  if (callerUid !== userId && !await verifyAdminRole(callerUid)) {
    return { success: false, error: "Unauthorized access." };
  }

  if (!adminDb) return { success: false, error: "Admin SDK not initialized." };

  try {
    const querySnapshot = await adminDb.collection("notifications")
      .where("userId", "==", userId)
      .where("status", "!=", "archived")
      .orderBy("status", "asc")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const notifications = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = (data.createdAt as Timestamp)?.toDate?.()?.toISOString() || new Date().toISOString();
      return { id: doc.id, ...data, createdAt };
    });
    return { success: true, notifications };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Marks a notification as read.
 */
export async function markNotificationAsRead(notificationId: string, callerUid: string): Promise<{ success: boolean, error?: string }> {
  if (!adminDb || !callerUid) return { success: false, error: "Unauthorized." };
  try {
    const docRef = adminDb.collection("notifications").doc(notificationId);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.userId !== callerUid) return { success: false, error: "Unauthorized." };
    await docRef.update({ status: "read" });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Deletes a notification.
 */
export async function deleteNotification(notificationId: string, callerUid: string): Promise<{ success: boolean, error?: string }> {
  if (!adminDb || !callerUid) return { success: false, error: "Unauthorized." };
  try {
    const docRef = adminDb.collection("notifications").doc(notificationId);
    const docSnap = await docRef.get();
    if (!docSnap.exists || docSnap.data()?.userId !== callerUid) return { success: false, error: "Unauthorized." };
    await docRef.delete();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all sent notifications for admin review.
 * Requires admin privileges.
 */
export async function fetchAllSentNotifications(page: number, pageSize: number, callerUid: string): Promise<{ success: boolean; notifications?: any[]; totalCount?: number; error?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: "Unauthorized." };
  if (!adminDb) return { success: false, error: "Admin SDK not initialized." };

  try {
    const snapshot = await adminDb.collection("notifications")
      .where('status', '!=', 'archived')
      .orderBy("status", "asc")
      .orderBy("createdAt", "desc")
      .get();

    const all = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(), 
      createdAt: (doc.data().createdAt as Timestamp).toDate().toISOString() 
    }));

    const paginated = all.slice((page - 1) * pageSize, page * pageSize);

    // Enrich with user profiles
    const enriched = await Promise.all(paginated.map(async (n: any) => {
      const userDoc = await adminDb.collection('users').doc(n.userId).get();
      return { ...n, userProfile: userDoc.exists ? userDoc.data() : null };
    }));

    return { success: true, notifications: enriched, totalCount: all.length };
  } catch (error: any) {
    console.error("[fetchAllSentNotifications] Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Combined fetch for a user and their notifications history.
 */
export async function fetchUserWithNotifications(userId: string, callerUid: string): Promise<{ success: boolean, user?: any, notifications?: any[], error?: string }> {
  if (!await verifyAdminRole(callerUid) && callerUid !== userId) return { success: false, error: "Unauthorized." };
  if (!adminDb) return { success: false, error: "Admin SDK not initialized." };

  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) return { success: false, error: "User not found." };
    const notificationsResult = await fetchUserNotifications(userId, callerUid);
    return { 
      success: true, 
      user: userDoc.data(), 
      notifications: notificationsResult.notifications 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
