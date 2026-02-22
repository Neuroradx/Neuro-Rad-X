import { NextResponse } from 'next/server';
import { generateQuestionBundle } from '@/actions/bundle-actions';
import { adminAuth } from '@/lib/firebase-admin';

/**
 * API Route Handler to serve Firestore Bundles.
 * Requires Firebase authentication. The client must pass the ID token in the Authorization header.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    // Verify Firebase authentication
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken || !adminAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { category } = await params;

    if (!category) {
      return NextResponse.json({ error: "Category parameter is missing" }, { status: 400 });
    }

    // Call the server action to build the binary bundle
    const bundleBuffer = await generateQuestionBundle(category);

    // Return the binary response
    return new NextResponse(bundleBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        // CDN Caching: 
        // s-maxage=3600: Cache in CDN for 1 hour
        // stale-while-revalidate=86400: Serve stale content for up to 24h while updating in background
        'Cache-Control': 'private, max-age=3600',
        'Content-Disposition': `attachment; filename="questions-${category.toLowerCase()}.bundle"`,
      },
    });
  } catch (error: any) {
    console.error(`[API Bundles] Error serving bundle:`, error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
