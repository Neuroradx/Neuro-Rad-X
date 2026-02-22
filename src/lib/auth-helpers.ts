/**
 * Server-side auth helpers. Uses Firebase Admin SDK.
 * Import only in Server Actions or API routes.
 */
import { adminDb } from '@/lib/firebase-admin';

export async function verifyAdminRole(callerUid: string | null): Promise<boolean> {
  if (!callerUid || !adminDb) return false;
  try {
    const userDoc = await adminDb.collection('users').doc(callerUid).get();
    return userDoc.exists && userDoc.data()?.role === 'admin';
  } catch (error) {
    console.error('[verifyAdminRole] Error:', error);
    return false;
  }
}
