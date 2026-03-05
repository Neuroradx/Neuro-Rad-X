import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import adminEmails from '@/lib/admin-emails.json';

const ADMIN_EMAILS: string[] = adminEmails as string[];

/**
 * POST /api/admin/set-claims
 *
 * Sets the Firebase Custom Claim { admin: true } for the currently authenticated user,
 * IF their email is in the admin allowlist.
 *
 * Custom Claims are the most robust way to verify admin status because:
 * - They are stored in the Firebase Auth token itself (no Firestore read needed)
 * - They survive across sessions
 * - They work even if Firestore is misconfigured
 *
 * After calling this endpoint, the user must sign out and sign back in
 * for the new token (with the claim) to take effect.
 *
 * IMPORTANT: This endpoint also sets role='admin' in Firestore as a belt-and-suspenders backup.
 */
export async function POST(request: Request) {
    try {
        if (!adminAuth || !adminDb) {
            return NextResponse.json(
                {
                    error: 'Admin SDK not initialized. The ADMIN_SERVICE_ACCOUNT secret is missing from the production environment.',
                    hint: 'Check that apphosting.yaml exists and the secret is stored in Google Secret Manager.',
                },
                { status: 500 }
            );
        }

        // Verify caller's identity
        const authHeader = request.headers.get('Authorization');
        const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!idToken) {
            return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
        }

        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken);
        } catch (e: any) {
            return NextResponse.json({ error: `Invalid token: ${e.message}` }, { status: 401 });
        }

        const uid = decodedToken.uid;

        // Get the user's email from Firebase Auth (more reliable than the token)
        const userRecord = await adminAuth.getUser(uid);
        const email = userRecord.email;

        if (!email) {
            return NextResponse.json({ error: 'User has no email address' }, { status: 400 });
        }

        const emailLower = email.trim().toLowerCase();
        const isInAllowlist = ADMIN_EMAILS.some((e) => String(e).trim().toLowerCase() === emailLower);

        if (!isInAllowlist) {
            return NextResponse.json(
                {
                    error: 'Access denied: your email is not in the admin allowlist.',
                    email: emailLower,
                    allowlist: ADMIN_EMAILS,
                },
                { status: 403 }
            );
        }

        // Set the custom claim — this is the primary fix
        await adminAuth.setCustomUserClaims(uid, { admin: true });

        // Also ensure the Firestore document has role:'admin' as fallback
        const userDocRef = adminDb.collection('users').doc(uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
            await userDocRef.update({
                role: 'admin',
                status: 'approved',
                subscriptionLevel: 'Owner',
            });
        } else {
            // Create the document if it doesn't exist
            await userDocRef.set({
                uid,
                email,
                role: 'admin',
                status: 'approved',
                subscriptionLevel: 'Owner',
                displayName: userRecord.displayName || email,
                firstName: userRecord.displayName?.split(' ')[0] || '',
                lastName: userRecord.displayName?.split(' ').slice(1).join(' ') || '',
                createdAt: new Date().toISOString(),
                totalQuestionsAnsweredAllTime: 0,
                totalCorrectAnswersAllTime: 0,
            });
        }

        return NextResponse.json({
            success: true,
            message: `Custom claim { admin: true } set for ${email}. Firestore role also set to 'admin'.`,
            action_required: '⚠️ The user must SIGN OUT and SIGN IN AGAIN for the new token (with custom claims) to take effect.',
            uid,
            email,
        });
    } catch (error: any) {
        console.error('[set-claims] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
