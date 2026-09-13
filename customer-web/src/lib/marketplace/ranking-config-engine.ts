import { 
  RankingWeightConfig, 
  ListingPromotionRule 
} from "./marketplace-types";

const rankingConfigsStore: RankingWeightConfig[] = [
  {
    version: "2026-09-v1",
    weights: {
      relevance: 30,
      availability: 20,
      trust: 15,
      rating: 15,
      responseRate: 8,
      completionRate: 7,
      locationMatch: 5
    },
    minReviewThreshold: 5,
    newProviderBoostPercent: 10,
    diversityOrgLimit: 2,
    active: true,
    updatedAt: "2026-09-01T00:00:00Z"
  }
];

const promotionRulesStore: ListingPromotionRule[] = [
  {
    promotionId: "promo-001",
    listingId: "list-jaipur-bridal-01",
    organizationId: "org-jaipur-royal-glam",
    badgeLabel: "FEATURED PARTNER",
    priority: 10,
    active: true,
    expiresAt: "2027-01-01T00:00:00Z"
  }
];

export function getActiveRankingConfig(): RankingWeightConfig {
  const active = rankingConfigsStore.find(c => c.active);
  if (!active) {
    return rankingConfigsStore[0];
  }
  return active;
}

export function updateRankingWeights(payload: {
  weights?: RankingWeightConfig["weights"];
  relevanceWeight?: number;
  availabilityWeight?: number;
  trustWeight?: number;
  ratingWeight?: number;
  responseWeight?: number;
  completionWeight?: number;
  locationWeight?: number;
  minReviewThreshold?: number;
  newProviderBoostPercent?: number;
  diversityOrgLimit?: number;
  version?: string;
  updatedByUid?: string;
}): RankingWeightConfig {
  rankingConfigsStore.forEach(c => c.active = false);

  const newVersion = payload.version || `2026-09-v${rankingConfigsStore.length + 1}`;
  
  const weights: RankingWeightConfig["weights"] = payload.weights || {
    relevance: (payload.relevanceWeight ?? 0.30) * 100,
    availability: (payload.availabilityWeight ?? 0.20) * 100,
    trust: (payload.trustWeight ?? 0.15) * 100,
    rating: (payload.ratingWeight ?? 0.15) * 100,
    responseRate: (payload.responseWeight ?? 0.08) * 100,
    completionRate: (payload.completionWeight ?? 0.07) * 100,
    locationMatch: (payload.locationWeight ?? 0.05) * 100,
  };

  const newConfig: RankingWeightConfig = {
    version: newVersion,
    weights,
    minReviewThreshold: payload.minReviewThreshold ?? 5,
    newProviderBoostPercent: payload.newProviderBoostPercent ?? 10,
    diversityOrgLimit: payload.diversityOrgLimit ?? 2,
    active: true,
    updatedAt: new Date().toISOString(),
    updatedByUid: payload.updatedByUid || "admin_user"
  };

  rankingConfigsStore.push(newConfig);
  return newConfig;
}

export const createRankingConfigVersion = updateRankingWeights;

export function getPromotionRules(): ListingPromotionRule[] {
  return promotionRulesStore.filter(p => p.active);
}
