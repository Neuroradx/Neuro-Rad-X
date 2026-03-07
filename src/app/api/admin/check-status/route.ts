import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

/**
 * GET /api/admin/check-status
 *
 * DIAGNOSTIC ENDPOINT — Checks the status of the Admin SDK and the
 * current user's admin role in Firestore and Firebase Auth.
 *
 * Use this endpoint to diagnose production admin permission failures.
 * Access it in the browser while logged in to see your current state.
 *
 * @returns JSON with adminDbStatus, adminAuthStatus, uid, role, email, customClaims
 */
export async function GET(request: Request) {
    const status = {
        adminDbStatus: adminDb ? 'initialized' : 'NULL ❌',
        adminAuthStatus: adminAuth ? 'initialized' : 'NULL ❌',
        envConfigured: !!(
            process.env.ADMIN_SERVICE_ACCOUNT ||
            process.env.FIREBASE_SERVICE_ACCOUNT ||
            process.env.firebase_service_account
        ),
        uid: null as string | null,
        email: null as string | null,
        firestoreRole: null as string | null,
        customClaims: null as object | null,
        isAdmin: false,
        errors: [] as string[],
    };

    try {
        // Extract token from Authorization header
        const authHeader = request.headers.get('Authorization');
        const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!idToken) {
            return NextResponse.json({
                ...status,
                note: 'No Authorization header provided. To check your own status, you need to pass your Firebase ID token as: Authorization: Bearer <token>. Or navigate to this page while logged in and use the browser console to call: firebase.auth().currentUser.getIdToken().then(t => fetch("/api/admin/check-status", {headers:{Authorization:"Bearer "+t}}).then(r=>r.json()).then(console.log))',
            });
        }

        if (!adminAuth) {
            status.errors.push('adminAuth is null — Admin SDK not initialized. Check secret configuration.');
            return NextResponse.json(status);
        }

        // Verify the token
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken);
            status.uid = decodedToken.uid;
            status.email = decodedToken.email ?? null;
        } catch (e: any) {
            status.errors.push(`Token verification failed: ${e.message}`);
            return NextResponse.json(status);
        }

        // Privacy Guard: Only allow admins to see infrastructure details
        if (decodedToken.admin !== true) {
            return NextResponse.json({
                error: 'Unauthorized. Infrastructure diagnostic information is restricted to administrators.',
                uid: status.uid,
                email: status.email,
                isAdmin: false
            }, { status: 403 });
        }

        // Check custom claims
        try {
            const userRecord = await adminAuth.getUser(decodedToken.uid);
            status.customClaims = userRecord.customClaims ?? {};
            if ((userRecord.customClaims as any)?.admin === true) {
                status.isAdmin = true;
            }
        } catch (e: any) {
            status.errors.push(`Custom claims check failed: ${e.message}`);
        }

        // Check Firestore role
        if (adminDb) {
            try {
                const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
                if (userDoc.exists) {
                    const data = userDoc.data();
                    status.firestoreRole = data?.role ?? 'field missing';
                    if (data?.role === 'admin') {
                        status.isAdmin = true;
                    }
                } else {
                    status.firestoreRole = 'DOCUMENT DOES NOT EXIST ❌';
                    status.errors.push('User document not found in Firestore — this will block admin access.');
                }
            } catch (e: any) {
                status.errors.push(`Firestore check failed: ${e.message}`);
            }
        }

        return NextResponse.json(status);
    } catch (error: any) {
        status.errors.push(`Unexpected error: ${error.message}`);
        return NextResponse.json(status, { status: 500 });
    }
}
