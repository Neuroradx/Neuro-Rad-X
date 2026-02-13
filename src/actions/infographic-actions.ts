
'use server';

import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { COMPONENT_INFOGRAPHICS } from '@/lib/infographic-registry'; // Import from the central registry

export async function autoCreateOrUpdateInfographics() {
  if (!adminDb) {
    console.error("[Auto-Sync] Infographics: Firestore admin is not initialized.");
    return { success: false, error: "Firestore admin not available" };
  }

  const infographicsRef = adminDb.collection('infographics');
  const validComponentIds = new Set(COMPONENT_INFOGRAPHICS.map(info => info.id));

  try {
    // Step 1: Sync by deleting obsolete infographics
    const deleteBatch = adminDb.batch();
    const snapshot = await infographicsRef.get();
    let deletedCount = 0;
    
    snapshot.forEach(doc => {
      // Only consider deleting documents that were marked as components,
      // to avoid deleting manually added HTML infographics in the future.
      if (doc.data().isComponent && !validComponentIds.has(doc.id)) {
        deleteBatch.delete(doc.ref);
        deletedCount++;
        console.log(`[Auto-Sync] Scheduling deletion for obsolete infographic: ${doc.id}`);
      }
    });
    
    if (deletedCount > 0) {
      await deleteBatch.commit();
      console.log(`[Auto-Sync] Successfully deleted ${deletedCount} obsolete infographics.`);
    }

    // Step 2: Create or update infographics from the registry
    const upsertBatch = adminDb.batch();
    for (const info of COMPONENT_INFOGRAPHICS) {
      const docRef = infographicsRef.doc(info.id);
      const docSnap = await docRef.get();

      const infographicData = {
          id: info.id,
          title: info.title,
          isComponent: true,
          createdAt: FieldValue.serverTimestamp(),
      };

      if (!docSnap.exists) {
        upsertBatch.set(docRef, infographicData);
        console.log(`[Auto-Sync] Scheduling creation for infographic: ${info.id}`);
      } else {
        const existingData = docSnap.data();
        const updates: {[key: string]: any} = {};
        if (existingData?.isComponent !== true) updates.isComponent = true;
        if (existingData?.title !== info.title) updates.title = info.title;
        if (!existingData?.createdAt) updates.createdAt = FieldValue.serverTimestamp();
        
        if (Object.keys(updates).length > 0) {
           upsertBatch.update(docRef, updates);
           console.log(`[Auto-Sync] Scheduling update for infographic: ${info.id} with updates:`, Object.keys(updates));
        }
      }
    }

    await upsertBatch.commit();
    return { success: true, message: "Infographics checked and synced successfully." };
  } catch (error) {
    console.error("Error in autoCreateOrUpdateInfographics:", error);
    return { success: false, error: (error as Error).message };
  }
}
