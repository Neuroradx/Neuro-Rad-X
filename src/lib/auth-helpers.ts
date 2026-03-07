/**
 * Server-side auth helpers. Uses Firebase Admin SDK.
 * Import only in Server Actions or API routes.
 */
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import adminEmails from '@/lib/admin-emails.json';

const ADMIN_EMAILS: string[] = adminEmails as string[];

export async function verifyAdminRole(callerUid: string | null): Promise<boolean> {
  if (!callerUid) {
    return false;
  }
  if (!adminDb) {
    return false;
  }
  try {
    // 1. Check Custom Claims (New & Most Reliable)
    if (adminAuth) {
      const userRecord = await adminAuth.getUser(callerUid);
      if (userRecord.customClaims?.admin === true) {
        return true;
      }
    }

    // 2. Fallback to Firestore role
    const userDocRef = adminDb.collection('users').doc(callerUid);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      const data = userDoc.data();
      if (data?.role === 'admin') {
        return true;
      }
    }

    // 3. Fallback to email allowlist (do not log allowlist or user email)
    if (adminAuth) {
      const userRecord = await adminAuth.getUser(callerUid);
      if (userRecord.email) {
        const emailLower = userRecord.email.trim().toLowerCase();
        const isAllowed = ADMIN_EMAILS.some((e) => String(e).trim().toLowerCase() === emailLower);
        if (isAllowed) {
          return true;
        }
      }
    }

    return false;
  } catch (error: any) {
    console.error('[verifyAdminRole] Exception:', error?.message ?? 'unknown');
    return false;
  }
}
