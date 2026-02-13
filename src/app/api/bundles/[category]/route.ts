import { NextResponse } from 'next/server';
import { generateQuestionBundle } from '@/actions/bundle-actions';

/**
 * API Route Handler to serve Firestore Bundles.
 * This route is designed to be cached by the CDN (Content Delivery Network).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
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
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
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
