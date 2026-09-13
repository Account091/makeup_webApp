export interface MarketingSummaryKPIs {
  marketingLeads: number;
  qualifiedLeads: number;
  bookings: number;
  revenueAttributed: number;
  marketingSpend: number;
  roas: number;
  cac: number;
  conversionRate: number;
  previousPeriodComparison: {
    marketingLeadsChange: number;
    bookingsChange: number;
    revenueChange: number;
    roasChange: number;
    cacChange: number;
  };
}

export interface ChannelPerformanceMetric {
  channelId: string;
  channelName: string;
  impressionsOrViews: number; // *marked as first-party website/tracked metrics
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  bookings: number;
  revenue: number;
  conversionRate: number;
  cost: number;
  roi: number;
}

export interface ContentAttributionMetric {
  contentId: string;
  title: string;
  mediaType: "REEL" | "POST" | "CAROUSEL" | "STORY" | "YOUTUBE_SHORT" | "BLOG";
  firstTouchLeads: number;
  lastTouchBookings: number;
  assistedBookings: number;
  attributedRevenue: number;
  contentPerformanceScore: number; // Calculated deterministically
}

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "ACTIVE" | "PAUSED" | "COMPLETED";

export interface CampaignPerformanceMetric {
  campaignId: string;
  name: string;
  status: CampaignStatus;
  platform: string;
  reach: number;
  clicks: number;
  leads: number;
  bookings: number;
  revenue: number;
  spend: number;
  cac: number;
  roas: number;
  conversionRate: number;
}

export interface CouponAttributionMetric {
  code: string;
  couponsIssued: number;
  couponsUsed: number;
  discountValueTotal: number;
  bookingsGenerated: number;
  revenueGenerated: number;
  averageDiscount: number;
  profitabilityImpact: number;
}

export interface ReferralAttributionMetric {
  referralCodesActive: number;
  referralsCreated: number;
  qualifiedReferrals: number;
  bookingsGenerated: number;
  revenueGenerated: number;
  rewardValueTotal: number;
  conversionRate: number;
  referralCac: number;
  referralRoi: number;
}

export interface ServiceChannelMatrixRow {
  serviceName: string;
  instagramLeads: number;
  referralLeads: number;
  organicLeads: number;
  whatsappLeads: number;
  topChannel: string;
}

export interface LocationMarketingMetric {
  city: string;
  leads: number;
  bookings: number;
  revenue: number;
  cac: number;
  conversionRate: number;
  topService: string;
  topChannel: string;
}

export interface AttributionQualityMetric {
  totalBookings: number;
  attributedBookings: number;
  unattributedBookings: number;
  multipleTouchBookings: number;
  attributionCoveragePercent: number;
  missingSourceCount: number;
  missingCampaignCount: number;
}

export interface MarketingAlertRecord {
  id: string;
  type:
    | "CAC_SPIKE"
    | "ROAS_DROP"
    | "BOOKING_DROP"
    | "LEAD_QUALITY_DROP"
    | "ATTRIBUTION_COVERAGE_DROP"
    | "CAMPAIGN_BUDGET_RISK"
    | "CONTENT_PERFORMANCE_DROP"
    | "CHANNEL_DECLINE";
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  status: "ACTIVE" | "RESOLVED";
  detectedAt: string;
}

export interface UtmContext {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

export interface MarketingIntelligenceData {
  dataAsOf: string;
  summary: MarketingSummaryKPIs;
  channels: ChannelPerformanceMetric[];
  contentAttribution: ContentAttributionMetric[];
  campaigns: CampaignPerformanceMetric[];
  coupons: CouponAttributionMetric[];
  referrals: ReferralAttributionMetric;
  serviceChannelMatrix: ServiceChannelMatrixRow[];
  locationMarketing: LocationMarketingMetric[];
  attributionQuality: AttributionQualityMetric;
  alerts: MarketingAlertRecord[];
}

export interface CampaignPlanRequest {
  goal: string;
  targetCity: string;
  targetService: string;
  budget: number;
  durationDays: number;
  platform: string;
  offerDescription: string;
}

export interface CampaignPlanResult {
  campaignObjective: string;
  audienceSuggestion: string;
  creativeIdeas: string[];
  suggestedCaption: string;
  ctaText: string;
  utmStructure: UtmContext;
  suggestedKpiTargets: {
    targetLeads: number;
    targetBookings: number;
    targetRoas: number;
    targetCac: number;
  };
}
