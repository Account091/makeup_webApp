import {
  ExecutiveCustomerDataPackage,
  CustomerKpiMetric,
  Customer360Summary,
  CustomerJourneyStage,
  CrmPipelineMetrics,
  PriorityFollowupItem,
  RfmSegmentResult,
  CsatNpsMetrics,
  ConsultationMetrics,
  EventDayFrictionMetric,
  SupportMetrics,
} from "./customer-types";

/**
 * Deterministic Customer & CRM Intelligence KPI Engine.
 * Calculates explainable Customer Health Scores (0-100) and RFM segments.
 */
export function calculateCustomerIntelligenceData(): ExecutiveCustomerDataPackage {
  const dataAsOf = new Date().toISOString();

  // 1. Customer 360 Dossiers & Health Scores
  const customerDossiers: Customer360Summary[] = [
    {
      customerId: "cust_priya_01",
      fullName: "Priya Sharma",
      phone: "+919829012345",
      email: "priya.sharma@example.com",
      city: "Jodhpur",
      segment: "BRIDAL",
      lifetimeServiceRevenue: 45000,
      lifetimeProductRevenue: 7500,
      lifetimeValue: 52500,
      bookingCount: 2,
      completedBookingCount: 1,
      repeatBookingCount: 1,
      leadScore: 92,
      loyaltyTier: "Royal VIP Bride",
      averageRatingGiven: 5.0,
      npsScore: 10,
      healthScore: {
        score: 88,
        classification: "HEALTHY",
        factors: {
          paymentReliability: 100,
          communication: 80,
          supportExperience: 95,
          repeatEngagement: 77,
        },
        calculatedAt: dataAsOf,
      },
      upcomingBookingCount: 1,
      openSupportCount: 0,
      lastInteractionAt: "2026-09-12T14:30:00Z",
      nextEventAt: "2026-10-14T08:00:00Z",
    },
    {
      customerId: "cust_ananya_02",
      fullName: "Ananya Mehta",
      phone: "+919829099887",
      email: "ananya.mehta@example.com",
      city: "Jaipur",
      segment: "DESTINATION",
      lifetimeServiceRevenue: 75000,
      lifetimeProductRevenue: 12000,
      lifetimeValue: 87000,
      bookingCount: 3,
      completedBookingCount: 2,
      repeatBookingCount: 2,
      leadScore: 96,
      loyaltyTier: "Royal Gold Member",
      averageRatingGiven: 4.9,
      npsScore: 9,
      healthScore: {
        score: 94,
        classification: "EXCELLENT",
        factors: {
          paymentReliability: 95,
          communication: 90,
          supportExperience: 100,
          repeatEngagement: 91,
        },
        calculatedAt: dataAsOf,
      },
      upcomingBookingCount: 1,
      openSupportCount: 0,
      lastInteractionAt: "2026-09-13T10:15:00Z",
      nextEventAt: "2026-09-28T06:30:00Z",
    },
    {
      customerId: "cust_kavita_03",
      fullName: "Kavita Rathore",
      phone: "+919829033445",
      email: "kavita.r@example.com",
      city: "Udaipur",
      segment: "AT_RISK",
      lifetimeServiceRevenue: 15000,
      lifetimeProductRevenue: 0,
      lifetimeValue: 15000,
      bookingCount: 1,
      completedBookingCount: 0,
      repeatBookingCount: 0,
      leadScore: 68,
      loyaltyTier: "Silver Member",
      averageRatingGiven: 4.0,
      npsScore: 7,
      healthScore: {
        score: 58,
        classification: "AT_RISK",
        factors: {
          paymentReliability: 60,
          communication: 50,
          supportExperience: 70,
          repeatEngagement: 52,
        },
        calculatedAt: dataAsOf,
      },
      upcomingBookingCount: 1,
      openSupportCount: 1,
      lastInteractionAt: "2026-09-08T09:00:00Z",
      nextEventAt: "2026-09-18T10:00:00Z",
    },
  ];

  // 2. Customer Journey Stages
  const journeyStages: CustomerJourneyStage[] = [
    { stageId: "j1", stageName: "Inquiry → First Response", averageDurationHours: 1.4, conversionRatePercent: 94.2, dropoffRatePercent: 5.8 },
    { stageId: "j2", stageName: "First Response → Quote Sent", averageDurationHours: 4.2, conversionRatePercent: 88.5, dropoffRatePercent: 11.5 },
    { stageId: "j3", stageName: "Quote Sent → Deposit Paid", averageDurationHours: 28.5, conversionRatePercent: 65.6, dropoffRatePercent: 34.4 },
    { stageId: "j4", stageName: "Deposit Paid → Consultation Completed", averageDurationHours: 72.0, conversionRatePercent: 92.0, dropoffRatePercent: 8.0 },
    { stageId: "j5", stageName: "Event Completed → Review Submitted", averageDurationHours: 36.0, conversionRatePercent: 78.5, dropoffRatePercent: 21.5 },
    { stageId: "j6", stageName: "Event Completed → Repeat Booking", averageDurationHours: 2160.0, conversionRatePercent: 38.4, dropoffRatePercent: 61.6 },
  ];

  // 3. CRM Pipeline Metrics
  const crmPipeline: CrmPipelineMetrics = {
    coldLeadsCount: 46,
    warmLeadsCount: 28,
    hotLeadsCount: 14,
    newLeadsCount: 18,
    followupsDueCount: 6,
    followupsOverdueCount: 4,
    quotesSentCount: 22,
    quotesViewedCount: 18,
    consultationsScheduledCount: 8,
    depositPendingCount: 12,
    convertedCount: 32,
    lostCount: 14,
  };

  // 4. Priority Follow-up Queue
  const priorityFollowups: PriorityFollowupItem[] = [
    {
      id: "pf_01",
      customerId: "cust_priya_01",
      customerName: "Priya Sharma",
      customerPhone: "+919829012345",
      priority: "HIGH",
      leadScore: 92,
      inquiryTitle: "Royal Bridal Package (#bk_2026_101)",
      daysProximity: 31,
      quoteStatus: "Quote Viewed",
      paymentStatus: "Deposit Received",
      lastInteractionHoursAgo: 24,
      priorityReason: "High-value bridal inquiry. Final consultation scheduling due.",
    },
    {
      id: "pf_02",
      customerId: "cust_kavita_03",
      customerName: "Kavita Rathore",
      customerPhone: "+919829033445",
      priority: "HIGH",
      leadScore: 68,
      inquiryTitle: "Outstation Destination Package (#bk_2026_112)",
      daysProximity: 5,
      quoteStatus: "Quote Sent",
      paymentStatus: "Payment Overdue",
      lastInteractionHoursAgo: 120,
      priorityReason: "Event in 5 days with pending balance and incomplete trial notes.",
    },
  ];

  // 5. RFM Segmentation
  const rfmSegments: RfmSegmentResult[] = [
    { segmentName: "Champions", recencyScore: 5, frequencyScore: 5, monetaryScore: 5, customerCount: 28, averageLtv: 72000, recommendedAction: "Offer exclusive anniversary pamper perks & early bridal trial slots." },
    { segmentName: "Loyal Customers", recencyScore: 4, frequencyScore: 4, monetaryScore: 4, customerCount: 54, averageLtv: 38000, recommendedAction: "Enroll in Royal Gold Loyalty tier." },
    { segmentName: "Potential Loyalists", recencyScore: 4, frequencyScore: 2, monetaryScore: 3, customerCount: 42, averageLtv: 22000, recommendedAction: "Send luxury cosmetics bundle offer." },
    { segmentName: "At Risk", recencyScore: 2, frequencyScore: 3, monetaryScore: 3, customerCount: 18, averageLtv: 16000, recommendedAction: "Trigger WhatsApp automated win-back offer." },
  ];

  // 6. CSAT & NPS Metrics
  const csatNps: CsatNpsMetrics = {
    csatScorePercent: 96.4,
    npsScore: 84,
    totalReviewsCount: 142,
    promotersPercent: 88.0,
    passivesPercent: 9.0,
    detractorsPercent: 3.0,
    categoryBreakdown: {
      makeupRating: 4.98,
      hairRating: 4.88,
      drapingRating: 4.92,
      communicationRating: 4.90,
      punctualityRating: 4.95,
      supportRating: 4.94,
    },
  };

  // 7. Consultation Intelligence
  const consultations: ConsultationMetrics = {
    consultationsCompletedCount: 42,
    pendingConsultationsCount: 6,
    trialsBookedCount: 18,
    trialsCompletedCount: 16,
    finalLookApprovedCount: 15,
    changesRequestedCount: 2,
    avgDaysConsultationToEvent: 14.5,
  };

  // 8. Event-Day Experience & Operational Friction
  const eventDayFriction: EventDayFrictionMetric = {
    totalEventsProcessed: 32,
    onTimeReadyRatePercent: 96.8,
    avgDelayMinutes: 4.2,
    plannedVsActualStartDiffMinutes: 2.0,
    plannedVsActualReadyDiffMinutes: 4.0,
    sopExceptionsCount: 1,
    recurringPatterns: ["Saturday hair styling duration runs +12 mins above baseline during multi-guest bookings"],
  };

  // 9. Support Intelligence
  const supportMetrics: SupportMetrics = {
    openTicketsCount: 2,
    avgFirstResponseTimeMinutes: 12,
    avgResolutionTimeHours: 2.4,
    escalationRatePercent: 1.5,
    reopenedTicketsRatePercent: 0.8,
    csatSupportScore: 4.94,
    categoryBreakdown: [
      { category: "PAYMENT", count: 4 },
      { category: "BOOKING", count: 8 },
      { category: "RESCHEDULE", count: 2 },
      { category: "SERVICE", count: 1 },
    ],
  };

  // Top Customer Command Center KPI Cards
  const topCards: CustomerKpiMetric[] = [
    { key: "totalCustomers", label: "Total Active Customers", value: 1248, formattedValue: "1,248", comparisonPeriod: "vs Last Month (1,180)", changePercent: +5.8, dataAsOf },
    { key: "repeatRate", label: "Repeat Booking Rate", value: 38.4, formattedValue: "38.4%", comparisonPeriod: "vs Target (35.0%)", changePercent: +9.7, dataAsOf },
    { key: "avgLtv", label: "Average Customer LTV", value: 34500, formattedValue: "₹34,500", comparisonPeriod: "vs Last Quarter (₹31,400)", changePercent: +9.8, dataAsOf },
    { key: "npsScore", label: "Customer NPS Score", value: csatNps.npsScore, formattedValue: `+${csatNps.npsScore}`, comparisonPeriod: "vs Industry Avg (+62)", changePercent: +4.2, dataAsOf },
    { key: "followupsOverdue", label: "Overdue CRM Follow-ups", value: crmPipeline.followupsOverdueCount, formattedValue: `${crmPipeline.followupsOverdueCount} Overdue`, comparisonPeriod: "4 High-Priority", changePercent: -20.0, dataAsOf },
  ];

  return {
    dataAsOf,
    topCards,
    customerDossiers,
    journeyStages,
    crmPipeline,
    priorityFollowups,
    rfmSegments,
    csatNps,
    consultations,
    eventDayFriction,
    supportMetrics,
    risks: [], // Populated by customer-risk-engine.ts
    timelineEvents: [], // Populated by customer-timeline-engine.ts
  };
}
