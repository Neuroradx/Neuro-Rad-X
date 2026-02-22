
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Question } from '@/types';
import { algoliaAdminClient, QUESTIONS_INDEX_NAME } from '@/lib/algolia';
import { verifyAdminRole } from '@/lib/auth-helpers';

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

export async function updateQuestion(
  questionId: string,
  data: Partial<Question>,
  callerUid: string
): Promise<{ success: boolean; error?: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, error: 'Unauthorized access.' };
  if (!adminDb) {
    return { success: false, error: DETAILED_ADMIN_SDK_ERROR };
  }
  try {
    const questionRef = adminDb.collection('questions').doc(questionId);
    // Ensure we add a timestamp for the update
    const updateData: { [key: string]: any } = {
      ...data,
      lastUpdatedAt: FieldValue.serverTimestamp(),
    };

    if (data.scientificArticle && data.scientificArticle.doi === '') {
      updateData['scientificArticle.doi'] = null;
    }


    await questionRef.update(updateData);

    // --- Algolia Sync ---
    if (algoliaAdminClient) {
      const fullDoc = await questionRef.get();
      const data = fullDoc.data() as any;
      const translations = data.translations || {};

      await algoliaAdminClient.saveObjects({
        indexName: QUESTIONS_INDEX_NAME,
        objects: [{
          objectID: questionId,
          main_localization: data.main_localization,
          sub_main_location: data.sub_main_location,
          difficulty: data.difficulty,
          type: data.type,
          questionText_en: translations.en?.questionText || '',
          questionText_es: translations.es?.questionText || '',
          questionText_de: translations.de?.questionText || '',
          explanation_en: translations.en?.explanation || '',
          explanation_es: translations.es?.explanation || '',
          explanation_de: translations.de?.explanation || '',
          Question_revised: data.Question_revised,
        }]
      }).catch(err => console.error('[Algolia Sync Error]:', err));
    }

    return { success: true };
  } catch (error: any) {
    console.error(`Error updating question ${questionId}:`, error);
    return { success: false, error: error.message };
  }
}

export async function deleteQuestionById(questionId: string, callerUid: string): Promise<{ success: boolean; message: string }> {
  if (!await verifyAdminRole(callerUid)) return { success: false, message: 'Unauthorized access.' };
  if (!adminDb) {
    return { success: false, message: DETAILED_ADMIN_SDK_ERROR };
  }
  try {
    const questionRef = adminDb.collection("questions").doc(questionId);
    await questionRef.delete();

    // --- Algolia Sync ---
    if (algoliaAdminClient) {
      await algoliaAdminClient.deleteObject({
        indexName: QUESTIONS_INDEX_NAME,
        objectID: questionId
      }).catch(err => console.error('[Algolia Sync Error]:', err));
    }

    return { success: true, message: "Question successfully deleted." };
  } catch (error: any) {
    return { success: false, message: `Failed to delete question: ${error.message}` };
  }
}
