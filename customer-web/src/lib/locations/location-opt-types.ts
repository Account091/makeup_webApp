export interface LocationScoreRecord {
  locationId: string;
  locationName: string;
  overallScore: number; // 0 - 100
  scoringVersion: string; // e.g. "1.0"
  factors: {
    demandScore: number;
    growthScore: number;
    profitabilityScore: number;
    capacityScore: number;
    conversionScore: number;
    satisfactionScore: number;
    marketingRoiScore: number;
  };
  classification: "EXCELLENT" | "HEALTHY" | "MODERATE" | "NEEDS_ATTENTION";
}

export interface LocationGrowthScoreRecord {
  locationId: string;
  locationName: string;
  bookingGrowthPercent: number;
  leadGrowthPercent: number;
  revenueGrowthPercent: number;
  capacityHeadroomPercent: number;
  growthStatus: "STRONG" | "MODERATE" | "SLUGGISH";
}

export interface LocationTravelEfficiencyRecord {
  locationId: string;
  locationName: string;
  travelBookingsCount: number;
  travelHoursTotal: number;
  travelCostTotal: number;
  revenueTotal: number;
  travelRatioPercent: number; // travelCost / revenue Total
  efficiencyStatus: "HIGHLY_EFFICIENT" | "ACCEPTABLE" | "HIGH_TRAVEL_COST";
}

export interface LocationServiceMixRow {
  locationId: string;
  locationName: string;
  bridalPercent: number;
  engagementPercent: number;
  partyPercent: number;
  otherPercent: number;
  topServiceCategory: string;
}

export interface LocationChannelMatrixRow {
  locationId: string;
  locationName: string;
  instagramSharePercent: number;
  referralSharePercent: number;
  organicSharePercent: number;
  whatsappSharePercent: number;
  topChannel: string;
}

export interface LocationBenchmarkRow {
  metricLabel: string;
  jodhpurValue: string;
  jaipurValue: string;
  udaipurValue: string;
  destinationValue: string;
}

export type OpportunityType =
  | "HIGH_DEMAND_LOW_CAPACITY"
  | "HIGH_PROFIT_LOW_MARKETING"
  | "HIGH_LEADS_LOW_CONVERSION"
  | "CAPACITY_EXPANSION_OPPORTUNITY";

export interface LocationOpportunityRecord {
  opportunityId: string;
  locationId: string;
  locationName: string;
  type: OpportunityType;
  title: string;
  description: string;
  impactScore: number;
  recommendedAction: string;
}

export type LocationOptRiskType =
  | "DEMAND_DECLINE"
  | "CAPACITY_SHORTAGE"
  | "LOW_MARGIN"
  | "HIGH_TRAVEL_COST"
  | "CUSTOMER_SATISFACTION_DROP";

export interface LocationOptRiskRecord {
  riskId: string;
  locationId: string;
  locationName: string;
  type: LocationOptRiskType;
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "ACTIVE" | "RESOLVED";
}

export interface ExpansionCandidateSignal {
  candidateCity: string;
  inquiriesCount: number;
  qualifiedLeadsCount: number;
  confirmedBookingsCount: number;
  destinationInterestLevel: "HIGH" | "MEDIUM" | "LOW";
  recommendation: string;
}

export interface LocationOptSummaryKPIs {
  averageLocationScore: number;
  topPerformingCity: string;
  highestMarginCity: string;
  highestGrowthCity: string;
  activeOpportunitiesCount: number;
  activeRisksCount: number;
}

export interface LocationOptimizationData {
  dataAsOf: string;
  summary: LocationOptSummaryKPIs;
  scores: LocationScoreRecord[];
  growth: LocationGrowthScoreRecord[];
  travelEfficiency: LocationTravelEfficiencyRecord[];
  serviceMix: LocationServiceMixRow[];
  channelMatrix: LocationChannelMatrixRow[];
  benchmarks: LocationBenchmarkRow[];
  opportunities: LocationOpportunityRecord[];
  risks: LocationOptRiskRecord[];
  expansionSignals: ExpansionCandidateSignal[];
}
