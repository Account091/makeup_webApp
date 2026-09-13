import { NextResponse } from 'next/server';
import { createReviewResponse, getReviewResponses } from '../../../../../lib/marketplace/review-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId') || undefined;

    const responses = getReviewResponses(reviewId);
    return NextResponse.json({ success: true, count: responses.length, responses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, organizationId, artistId, responseText } = body;

    if (!reviewId || !organizationId || !artistId || !responseText) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: reviewId, organizationId, artistId, responseText.' },
        { status: 400 }
      );
    }

    const response = createReviewResponse({ reviewId, organizationId, artistId, responseText });

    return NextResponse.json({
      success: true,
      message: 'Artist review response published.',
      response
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
