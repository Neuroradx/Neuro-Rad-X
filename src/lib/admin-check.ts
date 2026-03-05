/**
 * Admin verification with Firestore + email allowlist fallback.
 * Use when Firestore may be empty, misconfigured, or in a different project.
 * Admin access is granted if:
 * 1. User document in Firestore has role === 'admin', OR
 * 2. User email is in admin-emails.json (fallback)
 */
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import adminEmails from '@/lib/admin-emails.json';

const ADMIN_EMAILS: string[] = adminEmails as string[];

export type UserForAdminCheck = { uid: string; email: string | null };

function isEmailInAllowlist(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailLower = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((e) => String(e).trim().toLowerCase() === emailLower);
}

export async function checkIsAdmin(user: UserForAdminCheck): Promise<boolean> {
  if (!user?.uid) return false;

  let emailToCheck = user.email;

  // 1. Primary: Firestore document with role === 'admin'
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const data = userDoc.data();
    if (userDoc.exists() && data?.role === 'admin') {
      return true;
    }
    // If Auth email is null, use email from Firestore doc for allowlist check
    if (!emailToCheck && data?.email) {
      emailToCheck = String(data.email);
    }
  } catch (err) {
    console.warn('[Admin] Firestore check failed, using email fallback:', err);
  }

  // 2. Fallback: email in allowlist (admin-emails.json)
  if (isEmailInAllowlist(emailToCheck)) {
    return true;
  }

  return false;
}
