/**
 * Client-side admin verification. Uses only Firestore role and does NOT
 * import admin-emails.json (allowlist stays server-only to avoid exposing it in the bundle).
 *
 * Admin access is granted if the user document in Firestore has role === 'admin'.
 * For allowlist-based admins (before they have called set-claims), use the
 * server API GET /api/admin/me with Bearer token instead.
 */
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type UserForAdminCheck = { uid: string; email?: string | null };

export async function checkIsAdmin(user: UserForAdminCheck): Promise<boolean> {
  if (!user?.uid) return false;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const data = userDoc.data();
    if (userDoc.exists() && data?.role === 'admin') {
      return true;
    }
  } catch (err) {
    console.warn('[Admin] Firestore check failed:', err);
  }

  return false;
}
