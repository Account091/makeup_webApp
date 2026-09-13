import { NextRequest, NextResponse } from "next/server";
import { getMarketplaceReviews, submitVerifiedReview } from "../../../../lib/marketplace/trust-review-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const artistId = searchParams.get("artistId") || undefined;
    const reviews = getMarketplaceReviews(artistId);
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { bookingId, customerId, rating, reviewText } = body;

    if (!bookingId || !customerId || !rating || !reviewText) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: bookingId, customerId, rating, reviewText" },
        { status: 400 }
      );
    }

    const review = submitVerifiedReview({ bookingId, customerId, rating: Number(rating), reviewText });
    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to submit review" }, { status: 400 });
  }
}
