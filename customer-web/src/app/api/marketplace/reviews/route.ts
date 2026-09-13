import { NextResponse } from 'next/server';
import { 
  getMarketplaceReviews, 
  submitVerifiedReview, 
  getRatingAggregation 
} from '../../../../lib/marketplace/review-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get('artistId') || undefined;
    const orgId = searchParams.get('organizationId') || undefined;

    const reviews = getMarketplaceReviews({ artistId, organizationId: orgId });
    const ratingAggregation = artistId ? getRatingAggregation(artistId) : undefined;

    return NextResponse.json({
      success: true,
      count: reviews.length,
      reviews,
      ratingAggregation
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, customerId, rating, qualityRating, punctualityRating, communicationRating, professionalismRating, reviewText } = body;

    if (!bookingId || !customerId || !rating || !reviewText) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: bookingId, customerId, rating, reviewText.' },
        { status: 400 }
      );
    }

    const review = submitVerifiedReview({
      bookingId,
      customerId,
      rating: Number(rating),
      qualityRating: qualityRating ? Number(qualityRating) : undefined,
      punctualityRating: punctualityRating ? Number(punctualityRating) : undefined,
      communicationRating: communicationRating ? Number(communicationRating) : undefined,
      professionalismRating: professionalismRating ? Number(professionalismRating) : undefined,
      reviewText
    });

    return NextResponse.json({
      success: true,
      message: 'Verified booking review published successfully.',
      review
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
