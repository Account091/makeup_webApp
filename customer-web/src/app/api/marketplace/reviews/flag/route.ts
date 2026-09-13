import { NextResponse } from 'next/server';
import { flagReview, getReviewFlags } from '../../../../../lib/marketplace/review-engine';

export async function GET() {
  try {
    const flags = getReviewFlags();
    return NextResponse.json({ success: true, count: flags.length, flags });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, flaggedByUid, flagReason, notes } = body;

    if (!reviewId || !flaggedByUid || !flagReason) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: reviewId, flaggedByUid, flagReason.' },
        { status: 400 }
      );
    }

    const flag = flagReview({ reviewId, flaggedByUid, flagReason, notes });

    return NextResponse.json({
      success: true,
      message: 'Review flagged for moderation.',
      flag
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
