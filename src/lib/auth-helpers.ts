/**
 * Server-side auth helpers. Uses Firebase Admin SDK.
 * Import only in Server Actions or API routes.
 */
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import adminEmails from '@/lib/admin-emails.json';

const ADMIN_EMAILS: string[] = adminEmails as string[];

export async function verifyAdminRole(callerUid: string | null): Promise<boolean> {
  console.error('[verifyAdminRole] Checking UID:', callerUid);
  if (!callerUid) {
    console.warn('[verifyAdminRole] No callerUid provided');
    return false;
  }
  if (!adminDb) {
    console.error('[verifyAdminRole] adminDb is not initialized');
    return false;
  }
  try {
    // 1. Check Custom Claims (New & Most Reliable)
    if (adminAuth) {
      const userRecord = await adminAuth.getUser(callerUid);
      if (userRecord.customClaims?.admin === true) {
        console.error('[verifyAdminRole] Success: User has admin CUSTOM CLAIM');
        return true;
      }
    }

    // 2. Fallback to Firestore role
    const userDocRef = adminDb.collection('users').doc(callerUid);
    console.error(`[verifyAdminRole] Fetching doc for UID: ${callerUid}`);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
      const data = userDoc.data();
      console.error(`[verifyAdminRole] Doc exists. Role: ${data?.role}, Email: ${data?.email}`);
      if (data?.role === 'admin') {
        console.error('[verifyAdminRole] Success: User has admin role in Firestore');
        return true;
      }
    } else {
      console.error(`[verifyAdminRole] Document for UID ${callerUid} DOES NOT EXIST in Firestore`);
    }

    // 3. Fallback to email allowlist
    if (adminAuth) {
      console.log('[verifyAdminRole] Firestore check failed or role not admin, trying email fallback...');
      const userRecord = await adminAuth.getUser(callerUid); // Re-fetch or use existing
      if (userRecord.email) {
        const emailLower = userRecord.email.trim().toLowerCase();
        console.error('[verifyAdminRole] User email:', emailLower);
        const isAllowed = ADMIN_EMAILS.some((e) => String(e).trim().toLowerCase() === emailLower);
        if (isAllowed) {
          console.error('[verifyAdminRole] Success: Email is in allowlist');
          return true;
        } else {
          console.error(`[verifyAdminRole] Email NOT in allowlist. User: "${emailLower}", Allowed: ${JSON.stringify(ADMIN_EMAILS)}`);
        }
      }
    }

    console.warn('[verifyAdminRole] Access Denied for UID:', callerUid);
    return false;
  } catch (error: any) {
    console.error('[verifyAdminRole] EXCEPTION during verification:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return false;
  }
}
