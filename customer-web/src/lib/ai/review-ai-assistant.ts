import { MarketplaceReviewV84 } from "../marketplace/marketplace-types";

export interface ReviewThemeAnalysis {
  reviewId: string;
  themes: ("quality" | "punctuality" | "communication" | "professionalism" | "pricing" | "travel")[];
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  suggestedAction: "NO_ACTION" | "THANK_CUSTOMER" | "HUMAN_MODERATION_REVIEW";
}

/**
 * AI Review Assistant Theme Extractor.
 * Analyzes verified customer reviews and categorizes key feedback themes.
 */
export function analyzeReviewThemes(review: MarketplaceReviewV84): ReviewThemeAnalysis {
  const text = review.reviewText.toLowerCase();
  const themes: ReviewThemeAnalysis["themes"] = [];

  if (text.includes("makeup") || text.includes("draping") || text.includes("look") || text.includes("stunning") || text.includes("quality")) {
    themes.push("quality");
  }
  if (text.includes("time") || text.includes("punctual") || text.includes("early") || text.includes("schedule")) {
    themes.push("punctuality");
  }
  if (text.includes("communicat") || text.includes("understood") || text.includes("responsive") || text.includes("helpful")) {
    themes.push("communication");
  }
  if (text.includes("profess") || text.includes("polite") || text.includes("hygiene") || text.includes("behavior")) {
    themes.push("professionalism");
  }

  const sentiment = review.rating >= 4 ? "POSITIVE" : review.rating === 3 ? "NEUTRAL" : "NEGATIVE";

  return {
    reviewId: review.reviewId,
    themes,
    sentiment,
    suggestedAction: sentiment === "POSITIVE" ? "THANK_CUSTOMER" : sentiment === "NEGATIVE" ? "HUMAN_MODERATION_REVIEW" : "NO_ACTION"
  };
}

/**
 * AI Review Assistant Response Drafter.
 * Generates a polite draft response for the artist/organization to review, edit, and approve.
 * AI CANNOT auto-publish or mutate review records directly.
 */
export function draftReviewResponse(review: MarketplaceReviewV84): {
  draftText: string;
  disclaimer: string;
} {
  let draftText = `Thank you so much for your kind words! It was an absolute pleasure working with you for your booking. We wish you the very best!`;

  if (review.rating < 4) {
    draftText = `Thank you for taking the time to share your feedback. We sincerely appreciate your input and will use it to continuously improve our services. Please feel free to reach out to our team directly.`;
  }

  return {
    draftText,
    disclaimer: "AI draft generated for human review. Artist or Organization owner must approve before publishing."
  };
}
