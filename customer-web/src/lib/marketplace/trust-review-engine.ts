import {
  TrustScoreRecord,
  MarketplaceReview,
} from "./marketplace-types";

// Verified booking ledger mapping valid completed bookings
const verifiedBookingLedger: Record<string, { customerId: string; artistId: string; organizationId: string; status: "COMPLETED" | "CANCELLED" | "CONFIRMED" }> = {
  "bk_verified_01": {
    customerId: "cust_priya",
    artistId: "artist_prachi",
    organizationId: "makeovers-by-prachi",
    status: "COMPLETED",
  },
  "bk_verified_new": {
    customerId: "cust_priya",
    artistId: "artist_prachi",
    organizationId: "makeovers-by-prachi",
    status: "COMPLETED",
  },
  "bk_verified_02": {
    customerId: "cust_rhea",
    artistId: "artist_ananya",
    organizationId: "jaipur-royal-glam",
    status: "COMPLETED",
  },
};

const initialReviews: MarketplaceReview[] = [
  {
    reviewId: "rev_01",
    bookingId: "bk_verified_01",
    customerId: "cust_priya",
    artistId: "artist_prachi",
    organizationId: "makeovers-by-prachi",
    rating: 5,
    reviewText: "Prachi and her team were phenomenal for my Udaipur wedding! Highly punctual, stunning HD finish, & warm service.",
    verifiedBooking: true,
    createdAt: "2026-09-02T10:00:00.000Z",
  },
  {
    reviewId: "rev_02",
    bookingId: "bk_verified_02",
    customerId: "cust_rhea",
    artistId: "artist_ananya",
    organizationId: "jaipur-royal-glam",
    rating: 5,
    reviewText: "Beautiful Rajputi poshak draping and traditional Kundan makeup. Highly recommended in Jaipur!",
    verifiedBooking: true,
    createdAt: "2026-09-06T15:00:00.000Z",
  },
];

/**
 * Calculates deterministic Trust Score (0-100) based on audit metrics.
 */
export function calculateTrustScore(payload: {
  organizationId: string;
  artistId: string;
  completedBookingsCount: number;
  cancellationRatePercent: number;
  responseRatePercent: number;
  ratingAverage: number;
  disputeCount: number;
  isVerified: boolean;
}): TrustScoreRecord {
  // Weighted calculation:
  // Completion volume score (max 25)
  const volumeScore = Math.min(25, Math.round(payload.completedBookingsCount * 0.5));
  
  // Reliability score (max 25) - low cancellation rate
  const reliabilityScore = Math.max(0, Math.round(25 - payload.cancellationRatePercent * 2));
  
  // Response rate score (max 15)
  const responseScore = Math.round((payload.responseRatePercent / 100) * 15);
  
  // Rating score (max 25) - rating out of 5 -> scale to 25
  const ratingScore = Math.round((payload.ratingAverage / 5) * 25);
  
  // Verification bonus (10 pts)
  const verificationBonus = payload.isVerified ? 10 : 0;
  
  // Dispute penalty (-10 per dispute)
  const disputePenalty = payload.disputeCount * 10;

  const rawScore = volumeScore + reliabilityScore + responseScore + ratingScore + verificationBonus - disputePenalty;
  const overallTrustScore = Math.max(0, Math.min(100, rawScore));

  let badge: TrustScoreRecord["badge"] = "STANDARD";
  if (overallTrustScore >= 90 && payload.isVerified) {
    badge = "TOP_RATED";
  } else if (overallTrustScore >= 80 && payload.isVerified) {
    badge = "VERIFIED_PRO";
  } else if (overallTrustScore >= 70) {
    badge = "RISING_STAR";
  }

  return {
    organizationId: payload.organizationId,
    artistId: payload.artistId,
    overallTrustScore,
    factors: {
      completedBookingsCount: payload.completedBookingsCount,
      cancellationRatePercent: payload.cancellationRatePercent,
      responseRatePercent: payload.responseRatePercent,
      ratingAverage: payload.ratingAverage,
      disputeCount: payload.disputeCount,
      verificationBadgeBonus: verificationBonus,
    },
    badge,
  };
}

/**
 * Submits a verified marketplace review with strict booking verification.
 */
export function submitVerifiedReview(payload: {
  bookingId: string;
  customerId: string;
  rating: number;
  reviewText: string;
}): MarketplaceReview {
  const booking = verifiedBookingLedger[payload.bookingId];
  
  if (!booking) {
    throw new Error(`Invalid Review Submission: Booking '${payload.bookingId}' does not exist.`);
  }

  if (booking.customerId !== payload.customerId) {
    throw new Error(`Unauthorized Review Submission: Customer '${payload.customerId}' did not make booking '${payload.bookingId}'.`);
  }

  if (booking.status !== "COMPLETED") {
    throw new Error(`Review Submission Blocked: Booking '${payload.bookingId}' status is '${booking.status}'. Reviews are only permitted for COMPLETED bookings.`);
  }

  const existingReview = initialReviews.find((r) => r.bookingId === payload.bookingId);
  if (existingReview) {
    throw new Error(`Duplicate Review Blocked: A review has already been submitted for booking '${payload.bookingId}'.`);
  }

  if (payload.rating < 1 || payload.rating > 5) {
    throw new Error("Invalid Rating: Rating must be an integer between 1 and 5.");
  }

  const newReview: MarketplaceReview = {
    reviewId: `rev_${Date.now()}`,
    bookingId: payload.bookingId,
    customerId: payload.customerId,
    artistId: booking.artistId,
    organizationId: booking.organizationId,
    rating: Math.round(payload.rating),
    reviewText: payload.reviewText.trim(),
    verifiedBooking: true,
    createdAt: new Date().toISOString(),
  };

  initialReviews.push(newReview);
  return newReview;
}

export function getMarketplaceReviews(artistId?: string): MarketplaceReview[] {
  if (artistId) {
    return initialReviews.filter((r) => r.artistId === artistId);
  }
  return initialReviews;
}
