
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Question } from '@/types';

const DETAILED_ADMIN_SDK_ERROR = "Server configuration error: The Admin SDK is not initialized. Check server startup logs for errors related to 'firebase_service_account'.";

export async function getQuestionById(questionId: string): Promise<{ success: boolean; question?: Question; error?: string }> {
  if (!adminDb) {
    return { success: false, error: DETAILED_ADMIN_SDK_ERROR };
  }
  try {
    const questionRef = adminDb.collection('questions').doc(questionId);
    const docSnap = await questionRef.get();

    if (!docSnap.exists) {
      return { success: false, error: 'Question not found.' };
    }
    const questionData = docSnap.data() as Question;
    questionData.id = docSnap.id;

    // --- FIX: Serialize Firestore Timestamps ---
    // Convert any Timestamp objects to serializable ISO strings before returning to the client.
    if (questionData.lastUpdatedAt && questionData.lastUpdatedAt instanceof Timestamp) {
        questionData.lastUpdatedAt = questionData.lastUpdatedAt.toDate().toISOString();
    }
    if (questionData.Question_revised_at && questionData.Question_revised_at instanceof Timestamp) {
        questionData.Question_revised_at = questionData.Question_revised_at.toDate().toISOString();
    }
    
    return { success: true, question: questionData };
  } catch (error: any) {
    console.error(`Error fetching question ${questionId}:`, error);
    return { success: false, error: error.message };
  }
}

export async function updateQuestion(questionId: string, data: Partial<Question>): Promise<{ success: boolean; error?: string }> {
  if (!adminDb) {
    return { success: false, error: DETAILED_ADMIN_SDK_ERROR };
  }
  try {
    const questionRef = adminDb.collection('questions').doc(questionId);
    // Ensure we add a timestamp for the update
    const updateData: {[key: string]: any} = {
        ...data,
        lastUpdatedAt: FieldValue.serverTimestamp(),
    };

    if (data.scientificArticle && data.scientificArticle.doi === '') {
      updateData['scientificArticle.doi'] = null;
    }


    await questionRef.update(updateData);
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating question ${questionId}:`, error);
    return { success: false, error: error.message };
  }
}

export async function deleteQuestionById(questionId: string): Promise<{ success: boolean; message: string }> {
    if (!adminDb) {
      return { success: false, message: DETAILED_ADMIN_SDK_ERROR };
    }
    try {
        const questionRef = adminDb.collection("questions").doc(questionId);
        await questionRef.delete();
        return { success: true, message: "Question successfully deleted." };
    } catch (error: any) {
        return { success: false, message: `Failed to delete question: ${error.message}` };
    }
}
