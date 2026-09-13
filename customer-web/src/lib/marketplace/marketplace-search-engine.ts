import { 
  MarketplaceSearchQueryV85, 
  MarketplaceListing, 
  RankingExplanation,
  RankingWeightConfig
} from "./marketplace-types";
import { getActiveRankingConfig, getPromotionRules } from "./ranking-config-engine";
import { getOrganizationVerification } from "./verification-engine";
import { calculateTrustScore } from "./trust-score-engine";
import { getRatingAggregation } from "./review-engine";

// Mock candidate listings store
const candidateListingsStore: (MarketplaceListing & { serviceCategory: string; experienceYears: number })[] = [
  {
    listingId: "list-jaipur-bridal-01",
    organizationId: "org-jaipur-royal-glam",
    artistId: "artist-101",
    serviceIds: ["srv-jaipur-bridal"],
    serviceCategory: "bridal",
    locationIds: ["jaipur", "udaipur"],
    title: "Royal Jaipur Bridal Makeup & Draping",
    description: "HD & Airbrush Luxury Bridal Makeup by Pravershika.",
    startingPrice: 25000,
    portfolioUrls: ["/portfolio/bridal1.jpg"],
    ratingSummary: 4.93,
    reviewCount: 127,
    status: "PUBLISHED",
    experienceYears: 8,
    createdAt: "2026-01-01T00:00:00Z"
  },
  {
    listingId: "list-jaipur-party-02",
    organizationId: "org-jaipur-royal-glam",
    artistId: "artist-102",
    serviceIds: ["srv-jaipur-party"],
    serviceCategory: "party",
    locationIds: ["jaipur"],
    title: "Glamorous Party & Engagement Makeup",
    description: "Soft glam and engagement styling.",
    startingPrice: 12000,
    portfolioUrls: ["/portfolio/party1.jpg"],
    ratingSummary: 4.8,
    reviewCount: 45,
    status: "PUBLISHED",
    experienceYears: 5,
    createdAt: "2026-02-01T00:00:00Z"
  },
  {
    listingId: "list-jodhpur-luxe-01",
    organizationId: "org-jodhpur-luxe",
    artistId: "artist-103",
    serviceIds: ["srv-jodhpur-bridal"],
    serviceCategory: "bridal",
    locationIds: ["jodhpur", "jaipur"],
    title: "Traditional Marwari Bridal Makeover",
    description: "Royal Marwari bridal and jewelry draping.",
    startingPrice: 30000,
    portfolioUrls: ["/portfolio/marwari.jpg"],
    ratingSummary: 5.0,
    reviewCount: 1, // Single 5.0 star review (Tested with Bayesian smoothing)
    status: "PUBLISHED",
    experienceYears: 3,
    createdAt: "2026-09-01T00:00:00Z" // Newly verified provider (< 30 days)
  },
  {
    listingId: "list-draft-01",
    organizationId: "org-unverified-01",
    artistId: "artist-unverified",
    serviceIds: ["srv-unverified"],
    serviceCategory: "bridal",
    locationIds: ["jaipur"],
    title: "Unpublished Draft Listing",
    description: "Draft",
    startingPrice: 10000,
    portfolioUrls: [],
    ratingSummary: 3.0,
    reviewCount: 0,
    status: "DRAFT", // Excluded by Hard Eligibility Filter
    experienceYears: 1,
    createdAt: "2026-09-05T00:00:00Z"
  }
];

// Simulated calendar bookings for availability check
const bookedDatesStore: Record<string, string[]> = {
  "artist-102": ["2026-10-18"] // Artist-102 is booked on 2026-10-18
};

export interface SearchResultItem {
  listing: MarketplaceListing;
  explanation: RankingExplanation;
}

export interface MarketplaceSearchResult {
  query: MarketplaceSearchQueryV85;
  rankingVersion: string;
  totalEligibleCount: number;
  excludedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: SearchResultItem[];
}

/**
 * Bayesian Smoothed Rating Calculator.
 * Formula: adjustedRating = (v / (v + m)) * R + (m / (v + m)) * C
 * Prevents single 5-star reviews from outranking providers with 150 verified 4.9 reviews.
 */
export function calculateBayesianRating(rating: number, reviewCount: number, minThreshold: number = 5, marketplaceAvg: number = 4.8): number {
  const v = reviewCount;
  const m = minThreshold;
  const R = rating;
  const C = marketplaceAvg;
  return (v / (v + m)) * R + (m / (v + m)) * C;
}

/**
 * Multi-Stage Marketplace Search Engine.
 * Enforces Hard Eligibility Filters, Deterministic Weighted Scoring, Bayesian Rating Normalization,
 * Cold-Start Boosts, Organization Diversity Limits, Promoted Listing Demarcation, & Server Pagination.
 */
export function executeMarketplaceSearch(query: MarketplaceSearchQueryV85): MarketplaceSearchResult {
  const config = getActiveRankingConfig();
  const promotions = getPromotionRules();

  // STAGE 1: HARD ELIGIBILITY FILTERS
  let allCandidates = candidateListingsStore.filter(listing => {
    // 1. Must be PUBLISHED
    if (listing.status !== "PUBLISHED") return false;

    // 2. Service Category Filter
    if (query.serviceCategory && query.serviceCategory !== "all" && listing.serviceCategory !== query.serviceCategory) {
      return false;
    }

    // 3. Location Match Filter
    if (query.locationId && !listing.locationIds.includes(query.locationId)) {
      return false;
    }

    // 4. Verified Only Filter
    if (query.verifiedOnly) {
      const verif = getOrganizationVerification(listing.organizationId);
      if (verif?.status !== "VERIFIED") return false;
    }

    // 5. Price Range Filter
    if (query.minPrice !== undefined && listing.startingPrice < query.minPrice) return false;
    if (query.maxPrice !== undefined && listing.startingPrice > query.maxPrice) return false;

    // 6. Minimum Rating Filter
    if (query.minRating !== undefined && listing.ratingSummary < query.minRating) return false;

    // 7. Authoritative Calendar Availability Check
    if (query.eventDate) {
      const bookedDates = bookedDatesStore[listing.artistId] || [];
      if (bookedDates.includes(query.eventDate)) {
        return false; // Hard exclude if requested date is booked
      }
    }

    return true;
  });

  const totalEligibleCount = allCandidates.length;
  const excludedCount = candidateListingsStore.length - totalEligibleCount;

  // STAGE 2: DETERMINISTIC WEIGHTED SCORING
  const scoredItems: SearchResultItem[] = allCandidates.map(listing => {
    const isPromoted = promotions.some(p => p.listingId === listing.listingId && p.active);
    
    // Check if new provider (< 30 days old)
    const ageDays = (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 86400);
    const isNewProvider = ageDays <= 30 && listing.reviewCount < 5;

    // 1. Relevance Score (0 - 100)
    let relevanceScore = 100;
    if (query.serviceCategory && listing.serviceCategory === query.serviceCategory) relevanceScore += 10;

    // 2. Availability Score (0 - 100)
    const availabilityScore = query.eventDate ? 100 : 80;

    // 3. Trust Score (0 - 100)
    const trustRecord = calculateTrustScore({ organizationId: listing.organizationId, artistId: listing.artistId });
    const trustScore = trustRecord.overallTrustScore;

    // 4. Bayesian Smoothed Rating Score (0 - 100)
    const smoothedRating = calculateBayesianRating(listing.ratingSummary, listing.reviewCount, config.minReviewThreshold, 4.8);
    const smoothedRatingScore = (smoothedRating / 5.0) * 100;

    // 5. Response & Completion Scores
    const responseScore = 94;
    const completionScore = 98;
    const locationScore = query.locationId && listing.locationIds[0] === query.locationId ? 100 : 75;

    // Weighted Score Formula
    const weights = config.weights;
    let totalScore = 
      (relevanceScore * weights.relevance / 100) +
      (availabilityScore * weights.availability / 100) +
      (trustScore * weights.trust / 100) +
      (smoothedRatingScore * weights.rating / 100) +
      (responseScore * weights.responseRate / 100) +
      (completionScore * weights.completionRate / 100) +
      (locationScore * weights.locationMatch / 100);

    // Apply Cold-Start Boost for Newly Verified Providers
    if (isNewProvider) {
      totalScore += config.newProviderBoostPercent;
    }

    // Apply Promoted Priority Boost
    if (isPromoted) {
      totalScore += 15;
    }

    const explanation: RankingExplanation = {
      listingId: listing.listingId,
      artistId: listing.artistId,
      organizationId: listing.organizationId,
      totalScore: Number(totalScore.toFixed(2)),
      breakdown: {
        relevanceScore: Number(relevanceScore.toFixed(1)),
        availabilityScore: Number(availabilityScore.toFixed(1)),
        trustScore: Number(trustScore.toFixed(1)),
        smoothedRatingScore: Number(smoothedRatingScore.toFixed(1)),
        responseScore: Number(responseScore.toFixed(1)),
        completionScore: Number(completionScore.toFixed(1)),
        locationScore: Number(locationScore.toFixed(1))
      },
      isPromoted,
      isNewProviderBoost: isNewProvider
    };

    return { listing, explanation };
  });

  // Sort by Total Score descending
  scoredItems.sort((a, b) => b.explanation.totalScore - a.explanation.totalScore);

  // STAGE 3: ORGANIZATION DIVERSITY & CONCENTRATION RULES
  const orgCountMap: Record<string, number> = {};
  const maxOrgLimit = config.diversityOrgLimit;

  const diversifiedResults: SearchResultItem[] = [];
  const deferredResults: SearchResultItem[] = [];

  scoredItems.forEach(item => {
    const orgId = item.listing.organizationId;
    const count = orgCountMap[orgId] || 0;
    if (count < maxOrgLimit) {
      orgCountMap[orgId] = count + 1;
      diversifiedResults.push(item);
    } else {
      deferredResults.push(item);
    }
  });

  const finalRanked = [...diversifiedResults, ...deferredResults];

  // STAGE 4: SERVER PAGINATION
  const page = query.page || 1;
  const pageSize = query.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const paginatedResults = finalRanked.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(totalEligibleCount / pageSize) || 1;

  return {
    query,
    rankingVersion: config.version,
    totalEligibleCount,
    excludedCount,
    page,
    pageSize,
    totalPages,
    results: paginatedResults,
  };
}

export const searchMarketplaceV85 = executeMarketplaceSearch;
export const mockListingsStore = candidateListingsStore;



