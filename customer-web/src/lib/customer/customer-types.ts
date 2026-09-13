export type HealthClassification = "EXCELLENT" | "HEALTHY" | "AT_RISK" | "CRITICAL";
export type CustomerSegment = "NEW" | "ACTIVE" | "BRIDAL" | "REPEAT" | "HIGH_VALUE" | "AT_RISK" | "DORMANT" | "DESTINATION" | "PRODUCT_CUSTOMER";
export type CustomerRiskType = "PAYMENT_RISK" | "CONVERSION_RISK" | "EXPERIENCE_RISK" | "SUPPORT_RISK";
export type RiskSeverity = "HIGH" | "MEDIUM" | "INFO";

export interface CustomerKpiMetric {
  key: string;
  label: string;
  value: number;
  formattedValue: string;
  comparisonPeriod: string;
  changePercent: number;
  dataAsOf: string;
}

export interface CustomerHealthScore {
  score: number; // 0 - 100
  classification: HealthClassification;
  factors: {
    paymentReliability: number;
    communication: number;
    supportExperience: number;
    repeatEngagement: number;
  };
  calculatedAt: string;
}

export interface Customer360Summary {
  customerId: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  segment: CustomerSegment;
  lifetimeServiceRevenue: number;
  lifetimeProductRevenue: number;
  lifetimeValue: number;
  bookingCount: number;
  completedBookingCount: number;
  repeatBookingCount: number;
  leadScore: number;
  loyaltyTier: string;
  averageRatingGiven: number;
  npsScore: number;
  healthScore: CustomerHealthScore;
  upcomingBookingCount: number;
  openSupportCount: number;
  lastInteractionAt: string;
  nextEventAt?: string;
}

export interface CustomerJourneyStage {
  stageId: string;
  stageName: string;
  averageDurationHours: number;
  conversionRatePercent: number;
  dropoffRatePercent: number;
}

export interface CrmPipelineMetrics {
  coldLeadsCount: number;
  warmLeadsCount: number;
  hotLeadsCount: number;
  newLeadsCount: number;
  followupsDueCount: number;
  followupsOverdueCount: number;
  quotesSentCount: number;
  quotesViewedCount: number;
  consultationsScheduledCount: number;
  depositPendingCount: number;
  convertedCount: number;
  lostCount: number;
}

export interface PriorityFollowupItem {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  leadScore: number;
  inquiryTitle: string;
  daysProximity: number;
  quoteStatus: string;
  paymentStatus: string;
  lastInteractionHoursAgo: number;
  priorityReason: string;
}

export interface RfmSegmentResult {
  segmentName: string;
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  customerCount: number;
  averageLtv: number;
  recommendedAction: string;
}

export interface CsatNpsMetrics {
  csatScorePercent: number;
  npsScore: number;
  totalReviewsCount: number;
  promotersPercent: number;
  passivesPercent: number;
  detractorsPercent: number;
  categoryBreakdown: {
    makeupRating: number;
    hairRating: number;
    drapingRating: number;
    communicationRating: number;
    punctualityRating: number;
    supportRating: number;
  };
}

export interface ConsultationMetrics {
  consultationsCompletedCount: number;
  pendingConsultationsCount: number;
  trialsBookedCount: number;
  trialsCompletedCount: number;
  finalLookApprovedCount: number;
  changesRequestedCount: number;
  avgDaysConsultationToEvent: number;
}

export interface EventDayFrictionMetric {
  totalEventsProcessed: number;
  onTimeReadyRatePercent: number;
  avgDelayMinutes: number;
  plannedVsActualStartDiffMinutes: number;
  plannedVsActualReadyDiffMinutes: number;
  sopExceptionsCount: number;
  recurringPatterns: string[];
}

export interface SupportMetrics {
  openTicketsCount: number;
  avgFirstResponseTimeMinutes: number;
  avgResolutionTimeHours: number;
  escalationRatePercent: number;
  reopenedTicketsRatePercent: number;
  csatSupportScore: number;
  categoryBreakdown: { category: string; count: number }[];
}

export interface CustomerRiskRecord {
  id: string;
  customerId: string;
  customerName: string;
  riskType: CustomerRiskType;
  severity: RiskSeverity;
  title: string;
  description: string;
  detectedAt: string;
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
}

export interface CustomerTimelineEvent {
  id: string;
  customerId: string;
  type: "INQUIRY" | "LEAD_SCORE_CHANGED" | "QUOTE_SENT" | "QUOTE_VIEWED" | "CONSULTATION" | "BOOKING" | "PAYMENT" | "WHATSAPP" | "SUPPORT" | "EVENT" | "REVIEW" | "LOYALTY" | "PRODUCT_PURCHASE";
  source: "WEBSITE" | "MOBILE_APP" | "WHATSAPP" | "ADMIN_CONSOLE" | "PAYMENT_GATEWAY";
  referenceId: string;
  title: string;
  description: string;
  timestamp: string;
  visibility: "ADMIN" | "CUSTOMER";
}

export interface ExecutiveCustomerDataPackage {
  dataAsOf: string;
  topCards: CustomerKpiMetric[];
  customerDossiers: Customer360Summary[];
  journeyStages: CustomerJourneyStage[];
  crmPipeline: CrmPipelineMetrics;
  priorityFollowups: PriorityFollowupItem[];
  rfmSegments: RfmSegmentResult[];
  csatNps: CsatNpsMetrics;
  consultations: ConsultationMetrics;
  eventDayFriction: EventDayFrictionMetric;
  supportMetrics: SupportMetrics;
  risks: CustomerRiskRecord[];
  timelineEvents: CustomerTimelineEvent[];
}
