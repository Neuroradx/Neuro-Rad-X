import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { verifyAdminRole } from '@/lib/auth-helpers';

/**
 * GET /api/admin/me
 *
 * Returns { isAdmin: boolean } for the authenticated user.
 * Uses server-side verification (custom claims, Firestore role, allowlist).
 * Does not expose any sensitive data (e.g. allowlist).
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken || !adminAuth) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    const isAdmin = await verifyAdminRole(decodedToken.uid);
    return NextResponse.json({ isAdmin }, { status: 200 });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}
