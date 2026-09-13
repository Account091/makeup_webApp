import { 
  MarketplaceReviewV84, 
  ReviewFlag, 
  ReviewResponse,
  ReviewModerationStatus,
  ReviewFlagReason
} from "./marketplace-types";

// Simulated mock bookings database for verification lookup
const mockBookingsDb: Record<string, { customerId: string; artistId: string; organizationId: string; status: string }> = {
  "bk-jaipur-001": {
    customerId: "cust-101",
    artistId: "artist-101",
    organizationId: "org-jaipur-royal-glam",
    status: "COMPLETED"
  },
  "bk-jaipur-002": {
    customerId: "cust-102",
    artistId: "artist-101",
    organizationId: "org-jaipur-royal-glam",
    status: "COMPLETED"
  },
  "bk-jaipur-003": {
    customerId: "cust-103",
    artistId: "artist-101",
    organizationId: "org-jaipur-royal-glam",
    status: "COMPLETED"
  },
  "bk-pending-001": {
    customerId: "cust-103",
    artistId: "artist-102",
    organizationId: "org-jaipur-royal-glam",
    status: "PENDING"
  }
};

const reviewsStore: MarketplaceReviewV84[] = [
  {
    reviewId: "rev-001",
    bookingId: "bk-jaipur-001",
    customerId: "cust-101",
    artistId: "artist-101",
    organizationId: "org-jaipur-royal-glam",
    rating: 5,
    qualityRating: 5,
    punctualityRating: 5,
    communicationRating: 5,
    professionalismRating: 5,
    reviewText: "Absolutely stunning bridal makeup! Punctual, professional, and understood my requirements perfectly.",
    verifiedBooking: true,
    moderationStatus: "APPROVED",
    createdAt: "2026-09-10T12:00:00Z"
  },
  {
    reviewId: "rev-002",
    bookingId: "bk-jaipur-002",
    customerId: "cust-102",
    artistId: "artist-101",
    organizationId: "org-jaipur-royal-glam",
    rating: 4,
    qualityRating: 4,
    punctualityRating: 5,
    communicationRating: 4,
    professionalismRating: 5,
    reviewText: "Great experience for engagement makeup. Highly recommended!",
    verifiedBooking: true,
    moderationStatus: "APPROVED",
    createdAt: "2026-09-12T14:00:00Z"
  }
];

const flagsStore: ReviewFlag[] = [];
const responsesStore: ReviewResponse[] = [];

export function getMarketplaceReviews(filter?: { artistId?: string; organizationId?: string; status?: ReviewModerationStatus }): MarketplaceReviewV84[] {
  return reviewsStore.filter(r => {
    if (filter?.artistId && r.artistId !== filter.artistId) return false;
    if (filter?.organizationId && r.organizationId !== filter.organizationId) return false;
    if (filter?.status && r.moderationStatus !== filter.status) return false;
    return true;
  });
}

export function getReviewResponses(reviewId?: string): ReviewResponse[] {
  if (reviewId) {
    return responsesStore.filter(resp => resp.reviewId === reviewId);
  }
  return responsesStore;
}

export function getReviewFlags(): ReviewFlag[] {
  return flagsStore;
}

/**
 * Submits a verified booking review enforcing Completed Booking status, Ownership, Self-Review Prevention, & Duplicate Protection.
 */
export function submitVerifiedReview(payload: {
  bookingId: string;
  customerId: string;
  rating: number;
  qualityRating?: number;
  punctualityRating?: number;
  communicationRating?: number;
  professionalismRating?: number;
  reviewText: string;
}): MarketplaceReviewV84 {
  const booking = mockBookingsDb[payload.bookingId];
  if (!booking) {
    throw new Error(`Review Submission Failed: Booking '${payload.bookingId}' does not exist.`);
  }

  // 1. Verify Customer Ownership
  if (booking.customerId !== payload.customerId) {
    throw new Error(`Review Submission Failed: User '${payload.customerId}' did not participate in booking '${payload.bookingId}'.`);
  }

  // 2. Verify Booking Completion
  if (booking.status !== "COMPLETED") {
    throw new Error(`Review Submission Failed: Booking '${payload.bookingId}' status is '${booking.status}'. Reviews require COMPLETED bookings.`);
  }

  // 3. Self-Review Prevention
  if (payload.customerId === booking.artistId) {
    throw new Error(`Review Submission Failed: Artists cannot write reviews for their own bookings.`);
  }

  // 4. Duplicate Review Prevention
  const existing = reviewsStore.find(r => r.bookingId === payload.bookingId);
  if (existing) {
    throw new Error(`Review Submission Failed: Booking '${payload.bookingId}' has already been reviewed.`);
  }

  const review: MarketplaceReviewV84 = {
    reviewId: `rev_${Date.now()}`,
    bookingId: payload.bookingId,
    customerId: payload.customerId,
    artistId: booking.artistId,
    organizationId: booking.organizationId,
    rating: Math.max(1, Math.min(5, payload.rating)),
    qualityRating: payload.qualityRating,
    punctualityRating: payload.punctualityRating,
    communicationRating: payload.communicationRating,
    professionalismRating: payload.professionalismRating,
    reviewText: payload.reviewText,
    verifiedBooking: true,
    moderationStatus: "APPROVED", // Published automatically according to verified booking policy
    createdAt: new Date().toISOString()
  };

  reviewsStore.push(review);
  return review;
}

/**
 * Flags a review for human moderation review.
 */
export function flagReview(payload: {
  reviewId: string;
  flaggedByUid: string;
  flagReason: ReviewFlagReason;
  notes?: string;
}): ReviewFlag {
  const review = reviewsStore.find(r => r.reviewId === payload.reviewId);
  if (!review) {
    throw new Error(`Review '${payload.reviewId}' not found.`);
  }

  review.moderationStatus = "FLAGGED";

  const flag: ReviewFlag = {
    flagId: `flag_${Date.now()}`,
    reviewId: payload.reviewId,
    flaggedByUid: payload.flaggedByUid,
    flagReason: payload.flagReason,
    notes: payload.notes,
    createdAt: new Date().toISOString()
  };

  flagsStore.push(flag);
  return flag;
}

/**
 * Creates an artist response to a customer review.
 */
export function createReviewResponse(payload: {
  reviewId: string;
  organizationId: string;
  artistId: string;
  responseText: string;
}): ReviewResponse {
  const review = reviewsStore.find(r => r.reviewId === payload.reviewId);
  if (!review) {
    throw new Error(`Review '${payload.reviewId}' not found for response.`);
  }

  const response: ReviewResponse = {
    responseId: `resp_${Date.now()}`,
    reviewId: payload.reviewId,
    organizationId: payload.organizationId,
    artistId: payload.artistId,
    responseText: payload.responseText,
    moderationStatus: "APPROVED",
    createdAt: new Date().toISOString()
  };

  responsesStore.push(response);
  return response;
}

/**
 * Computes deterministic Rating Aggregation for artist profiles.
 */
export function getRatingAggregation(artistId: string): {
  averageRating: number;
  reviewCount: number;
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  qualityAvg: number;
  punctualityAvg: number;
  communicationAvg: number;
  professionalismAvg: number;
} {
  const artistReviews = reviewsStore.filter(r => r.artistId === artistId && r.moderationStatus === "APPROVED");
  
  if (artistReviews.length === 0) {
    return {
      averageRating: 5.0,
      reviewCount: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      qualityAvg: 5.0,
      punctualityAvg: 5.0,
      communicationAvg: 5.0,
      professionalismAvg: 5.0
    };
  }

  const total = artistReviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = Number((total / artistReviews.length).toFixed(2));

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  artistReviews.forEach(r => {
    const star = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
    if (distribution[star] !== undefined) distribution[star]++;
  });

  const qualityAvg = Number((artistReviews.reduce((sum, r) => sum + (r.qualityRating || r.rating), 0) / artistReviews.length).toFixed(2));
  const punctualityAvg = Number((artistReviews.reduce((sum, r) => sum + (r.punctualityRating || r.rating), 0) / artistReviews.length).toFixed(2));
  const communicationAvg = Number((artistReviews.reduce((sum, r) => sum + (r.communicationRating || r.rating), 0) / artistReviews.length).toFixed(2));
  const professionalismAvg = Number((artistReviews.reduce((sum, r) => sum + (r.professionalismRating || r.rating), 0) / artistReviews.length).toFixed(2));

  return {
    averageRating: avg,
    reviewCount: artistReviews.length,
    distribution,
    qualityAvg,
    punctualityAvg,
    communicationAvg,
    professionalismAvg
  };
}
