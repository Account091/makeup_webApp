import { NextResponse } from 'next/server';
import { analyzeReviewThemes, draftReviewResponse } from '../../../../lib/ai/review-ai-assistant';
import { getMarketplaceReviews } from '../../../../lib/marketplace/review-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, reviewId, reviewText, rating } = body;

    let review = getMarketplaceReviews().find(r => r.reviewId === reviewId);
    if (!review && reviewText && rating) {
      review = {
        reviewId: reviewId || 'temp-01',
        bookingId: 'bk-temp',
        customerId: 'cust-temp',
        artistId: 'artist-temp',
        organizationId: 'org-temp',
        rating: Number(rating),
        reviewText,
        verifiedBooking: true,
        moderationStatus: 'APPROVED',
        createdAt: new Date().toISOString()
      };
    }

    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found for AI analysis.' }, { status: 404 });
    }

    if (action === 'DRAFT_RESPONSE') {
      const draft = draftReviewResponse(review);
      return NextResponse.json({ success: true, draft });
    }

    const themeAnalysis = analyzeReviewThemes(review);
    return NextResponse.json({ success: true, themeAnalysis });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
