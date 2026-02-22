'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdminRole } from '@/lib/auth-helpers';

const DETAILED_ADMIN_SDK_ERROR = "Server configuration error: The Admin SDK is not initialized.";

/**
 * Registers a new subcategory under a main category in Firestore.
 * Requires admin role.
 */
export async function registerSubcategoryAction(
    mainCategory: string,
    subcategoryName: string,
    callerUid: string
): Promise<{ success: boolean; error?: string }> {
    if (!await verifyAdminRole(callerUid)) return { success: false, error: 'Unauthorized access.' };
    if (!adminDb) {
        return { success: false, error: DETAILED_ADMIN_SDK_ERROR };
    }
    if (!mainCategory || !subcategoryName.trim()) {
        return { success: false, error: 'Main category and subcategory name are required.' };
    }
    try {
        const ref = adminDb.collection('subcategories').doc(mainCategory);
        await ref.set(
            { subcats: FieldValue.arrayUnion(subcategoryName.trim()) },
            { merge: true }
        );
        return { success: true };
    } catch (error: any) {
        console.error(`[registerSubcategoryAction] Error:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches the list of custom (dynamic) subcategories for a given main category.
 * Requires admin role (used in admin edit-question flow).
 */
export async function getSubcategoriesAction(
    mainCategory: string,
    callerUid: string
): Promise<{ success: boolean; subcats?: string[]; error?: string }> {
    if (!await verifyAdminRole(callerUid)) return { success: false, error: 'Unauthorized access.' };
    if (!adminDb) {
        return { success: false, error: DETAILED_ADMIN_SDK_ERROR };
    }
    if (!mainCategory) {
        return { success: true, subcats: [] };
    }
    try {
        const ref = adminDb.collection('subcategories').doc(mainCategory);
        const snap = await ref.get();
        if (!snap.exists) {
            return { success: true, subcats: [] };
        }
        const data = snap.data();
        return { success: true, subcats: data?.subcats || [] };
    } catch (error: any) {
        console.error(`[getSubcategoriesAction] Error:`, error);
        return { success: false, error: error.message };
    }
}
