import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

const VALID_ROLES = ['user', 'admin', 'tester'] as const;
type ValidRole = typeof VALID_ROLES[number];

/**
 * API Route Handler to update a user's role.
 * Uses the Firebase Admin SDK to bypass Firestore client-side security rules.
 * The caller must be authenticated (their own ID token is required).
 */
export async function POST(request: Request) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify Firebase authentication via Bearer token
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const isCallerAdmin = decodedToken.admin === true;

    // Enforce that only administrators can change roles
    if (!isCallerAdmin) {
      return NextResponse.json(
        { error: 'Permission denied. Only administrators can change roles.' },
        { status: 403 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const { role } = body;

    if (!role || !VALID_ROLES.includes(role as ValidRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    // Use Admin SDK to update the role field (bypasses Firestore client rules)
    const userDocRef = adminDb.collection('users').doc(uid);
    await userDocRef.update({ role });

    // Synchronize Custom Claims for Admin role
    // This ensures centralized route guards work as expected
    if (role === 'admin') {
      await adminAuth.setCustomUserClaims(uid, { admin: true });
    } else {
      // Remove admin claim if changing to user or tester
      await adminAuth.setCustomUserClaims(uid, { admin: false });
    }

    return NextResponse.json({ success: true, role }, { status: 200 });
  } catch (error: any) {
    console.error('[API update-role] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
