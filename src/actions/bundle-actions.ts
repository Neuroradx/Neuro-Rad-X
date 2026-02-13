'use server';

import { adminDb } from '@/lib/firebase-admin';

/**
 * Generates a Firestore bundle for a specific question category.
 * This bundle is a binary representation of documents that can be cached by CDNs
 * and loaded directly into the client's local cache.
 * 
 * @param category The main_localization value (e.g., 'Head', 'Spine')
 */
export async function generateQuestionBundle(category: string): Promise<Buffer> {
  if (!adminDb) {
    throw new Error("Admin SDK is not initialized. Check server environment variables.");
  }

  try {
    console.log(`[Bundle Action] Generating bundle for category: ${category}`);

    // Create a bundle builder with a unique ID
    const bundle = adminDb.bundle(`bundle-questions-${category.toLowerCase()}`);

    // Fetch all questions for this category
    // We fetch the entire category because bundles are most effective for large, static datasets
    const questionsSnapshot = await adminDb.collection('questions')
      .where('main_localization', '==', category)
      .get();

    console.log(`[Bundle Action] Found ${questionsSnapshot.size} questions for bundle.`);

    // Add the query results to the bundle. 
    // The client will use this name to fetch the results from local cache.
    const bundleBuffer = bundle.add(`query-${category.toLowerCase()}`, questionsSnapshot).build();

    return bundleBuffer;
  } catch (error: any) {
    console.error(`[Bundle Action] Error:`, error);
    throw new Error(`Failed to generate bundle for ${category}: ${error.message}`);
  }
}
