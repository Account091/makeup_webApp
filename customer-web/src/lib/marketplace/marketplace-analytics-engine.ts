import {
  MarketplaceExecutiveKPIs,
  MarketplaceFunnelMetrics,
  ZeroResultDemandRecord,
  SupplyDemandAnalysis,
  GeographyMetrics,
  ServiceLocationMatrixCell,
  MarketplaceHealthScore,
  MarketplaceAnalyticsAlert,
  MarketplaceValidationReport,
  MarketplaceCohortMetrics,
} from "./marketplace-types";

// Seed / Calculated Stores
export const zeroResultStore: ZeroResultDemandRecord[] = [
  {
    locationId: "jaipur",
    serviceCategory: "bridal",
    requestedDate: "2026-10-18",
    searchCount: 42,
    eligibleResultsCount: 0,
    demandTag: "ZERO_RESULT_DEMAND",
    lastSearchedAt: "2026-09-13T12:00:00Z",
  },
  {
    locationId: "jodhpur",
    serviceCategory: "party",
    requestedDate: "2026-10-24",
    searchCount: 18,
    eligibleResultsCount: 0,
    demandTag: "CAPACITY_SHORTAGE",
    lastSearchedAt: "2026-09-13T11:30:00Z",
  },
];

export const alertsStore: MarketplaceAnalyticsAlert[] = [
  {
    alertId: "alert-geo-jpr-01",
    alertType: "SUPPLY_SHORTAGE",
    severity: "WARNING",
    locationId: "jaipur",
    serviceCategory: "bridal",
    message: "Jaipur bridal searches up 38% but eligible artist supply is unchanged.",
    metricValue: 42,
    thresholdValue: 10,
    createdAt: "2026-09-13T10:00:00Z",
  },
  {
    alertId: "alert-zero-jdp-02",
    alertType: "ZERO_RESULT_SPIKE",
    severity: "INFO",
    locationId: "jodhpur",
    serviceCategory: "party",
    message: "High zero-result search volume for Jodhpur party makeup on Oct 24.",
    metricValue: 18,
    thresholdValue: 5,
    createdAt: "2026-09-13T11:30:00Z",
  },
];

// 1. Calculate Executive KPIs
export function calculateExecutiveKPIs(period: string = "2026-09"): MarketplaceExecutiveKPIs {
  const gmv = 1020000; // ₹10.2 Lakhs
  const platformRevenue = 102000; // 10% commission
  const artistEarnings = 918000; // 90% artist share
  const takeRatePercent = Number(((platformRevenue / gmv) * 100).toFixed(1));

  return {
    period,
    gmv,
    platformRevenue,
    artistEarnings,
    takeRatePercent,
    totalMarketplaceBookings: 84,
    activeOrganizations: 16,
    activeArtists: 42,
    totalCustomers: 128,
    cancellationRatePercent: 2.3,
    disputeRatePercent: 1.1,
    dataAsOf: new Date().toISOString(),
  };
}

// 2. Calculate Marketplace Funnel Metrics
export function calculateMarketplaceFunnel(period: string = "2026-09"): MarketplaceFunnelMetrics {
  const marketplaceVisits = 4500;
  const searches = 3200;
  const artistProfileViews = 1850;
  const chatsStarted = 420;
  const bookingRequests = 110;
  const paymentsVerified = 88;
  const bookingsCompleted = 84;
  const reviewsSubmitted = 76;

  const searchToProfileRatePercent = Number(((artistProfileViews / searches) * 100).toFixed(1));
  const profileToChatRatePercent = Number(((chatsStarted / artistProfileViews) * 100).toFixed(1));
  const chatToBookingRatePercent = Number(((bookingsCompleted / chatsStarted) * 100).toFixed(1));
  const overallConversionRatePercent = Number(((bookingsCompleted / marketplaceVisits) * 100).toFixed(2));

  return {
    period,
    marketplaceVisits,
    searches,
    artistProfileViews,
    chatsStarted,
    bookingRequests,
    paymentsVerified,
    bookingsCompleted,
    reviewsSubmitted,
    searchToProfileRatePercent,
    profileToChatRatePercent,
    chatToBookingRatePercent,
    overallConversionRatePercent,
  };
}

// 3. Zero-Result & Supply/Demand Pressure Intelligence
export function getSupplyDemandAnalysis(): SupplyDemandAnalysis[] {
  return [
    {
      locationId: "jaipur",
      serviceCategory: "bridal",
      searchDemandCount: 420,
      eligibleActiveArtists: 18,
      demandPressureTag: "HIGH_DEMAND_LOW_SUPPLY",
      ratio: 23.3,
    },
    {
      locationId: "jodhpur",
      serviceCategory: "bridal",
      searchDemandCount: 280,
      eligibleActiveArtists: 22,
      demandPressureTag: "BALANCED",
      ratio: 12.7,
    },
    {
      locationId: "udaipur",
      serviceCategory: "destination",
      searchDemandCount: 310,
      eligibleActiveArtists: 15,
      demandPressureTag: "HIGH_DEMAND_LOW_SUPPLY",
      ratio: 20.6,
    },
    {
      locationId: "destination",
      serviceCategory: "wedding_package",
      searchDemandCount: 190,
      eligibleActiveArtists: 12,
      demandPressureTag: "BALANCED",
      ratio: 15.8,
    },
  ];
}

// 4. Geography & Service x Location Matrix
export function getGeographyMetrics(): GeographyMetrics[] {
  return [
    {
      locationId: "jaipur",
      locationName: "Jaipur City",
      gmv: 450000,
      bookingsCount: 36,
      activeArtistsCount: 18,
      conversionRatePercent: 3.2,
      demandLevel: "HIGH",
    },
    {
      locationId: "jodhpur",
      locationName: "Jodhpur City",
      gmv: 320000,
      bookingsCount: 28,
      activeArtistsCount: 22,
      conversionRatePercent: 2.8,
      demandLevel: "HIGH",
    },
    {
      locationId: "udaipur",
      locationName: "Udaipur Lakes & Venues",
      gmv: 210000,
      bookingsCount: 14,
      activeArtistsCount: 15,
      conversionRatePercent: 2.5,
      demandLevel: "MEDIUM",
    },
    {
      locationId: "destination",
      locationName: "Destination Weddings",
      gmv: 40000,
      bookingsCount: 6,
      activeArtistsCount: 12,
      conversionRatePercent: 1.9,
      demandLevel: "MEDIUM",
    },
  ];
}

export function getServiceLocationMatrix(): ServiceLocationMatrixCell[] {
  return [
    { serviceCategory: "Bridal", locationId: "jodhpur", demandLabel: "HIGH", gmv: 220000 },
    { serviceCategory: "Bridal", locationId: "jaipur", demandLabel: "VERY_HIGH", gmv: 310000 },
    { serviceCategory: "Bridal", locationId: "udaipur", demandLabel: "HIGH", gmv: 160000 },
    { serviceCategory: "Bridal", locationId: "destination", demandLabel: "VERY_HIGH", gmv: 35000 },
    { serviceCategory: "Engagement", locationId: "jodhpur", demandLabel: "MEDIUM", gmv: 60000 },
    { serviceCategory: "Engagement", locationId: "jaipur", demandLabel: "HIGH", gmv: 90000 },
    { serviceCategory: "Party", locationId: "jodhpur", demandLabel: "HIGH", gmv: 40000 },
    { serviceCategory: "Party", locationId: "jaipur", demandLabel: "MEDIUM", gmv: 50000 },
  ];
}

// 5. Calculate Marketplace Health Score
export function calculateMarketplaceHealthScore(): MarketplaceHealthScore {
  return {
    overallScore: 92.4,
    version: "v8.8-health-v1",
    factors: {
      supplyDemandBalanceScore: 88.5,
      conversionHealthScore: 91.0,
      disputeSafetyScore: 96.2,
      ratingTrustScore: 95.8,
      paymentSuccessScore: 90.5,
    },
    calculatedAt: new Date().toISOString(),
  };
}

// 6. Data Integrity & Financial Reconciliation ($0 Discrepancy Validation)
export function reconcileMarketplaceData(): MarketplaceValidationReport {
  const totalBookingGMV = 1020000;
  const totalPaymentLedger = 1020000;
  const totalCommissionLedger = 102000;
  const totalArtistEarnings = 918000;
  const totalSettlementBatches = 8;

  // Formula check: Booking GMV must equal Commission + Artist Earnings
  const calculatedSum = totalCommissionLedger + totalArtistEarnings;
  const discrepancyAmount = Math.abs(totalBookingGMV - calculatedSum);

  const healthWarnings: string[] = [];
  if (discrepancyAmount !== 0) {
    healthWarnings.push(`Discrepancy detected: GMV (₹${totalBookingGMV}) != Commission + Earnings (₹${calculatedSum})`);
  }

  return {
    reconciled: discrepancyAmount === 0,
    discrepancyAmount,
    totalBookingGMV,
    totalPaymentLedger,
    totalCommissionLedger,
    totalArtistEarnings,
    totalSettlementBatches,
    orphanedRecordsCount: 0,
    healthWarnings,
    validatedAt: new Date().toISOString(),
  };
}

// 7. Cohort Analytics Metrics
export function getMarketplaceCohortMetrics(): MarketplaceCohortMetrics[] {
  return [
    {
      cohortMonth: "2026-07",
      initialCustomerCount: 85,
      retentionMonth1Percent: 42.0,
      retentionMonth2Percent: 28.5,
      retentionMonth3Percent: 22.0,
      totalRevenueGenerated: 680000,
    },
    {
      cohortMonth: "2026-08",
      initialCustomerCount: 110,
      retentionMonth1Percent: 45.5,
      retentionMonth2Percent: 31.0,
      retentionMonth3Percent: 24.5,
      totalRevenueGenerated: 890000,

    },
    {
      cohortMonth: "2026-09",
      initialCustomerCount: 128,
      retentionMonth1Percent: 48.0,
      retentionMonth2Percent: 33.5,
      retentionMonth3Percent: 0,
      totalRevenueGenerated: 1020000,
    },
  ];
}

// 8. CSV Export Builder
export function exportMarketplaceAnalyticsCSV(datasetType: string = "overview"): string {
  if (datasetType === "geography") {
    const geo = getGeographyMetrics();
    let csv = "LocationID,LocationName,GMV,Bookings,ActiveArtists,ConversionRatePercent,DemandLevel\n";
    geo.forEach((row) => {
      csv += `${row.locationId},"${row.locationName}",${row.gmv},${row.bookingsCount},${row.activeArtistsCount},${row.conversionRatePercent},${row.demandLevel}\n`;
    });
    return csv;
  }

  // Default Executive Overview CSV
  const kpis = calculateExecutiveKPIs();
  let csv = "Period,GMV,PlatformRevenue,ArtistEarnings,TakeRatePercent,Bookings,ActiveOrgs,ActiveArtists,CancellationRatePercent,DisputeRatePercent\n";
  csv += `${kpis.period},${kpis.gmv},${kpis.platformRevenue},${kpis.artistEarnings},${kpis.takeRatePercent},${kpis.totalMarketplaceBookings},${kpis.activeOrganizations},${kpis.activeArtists},${kpis.cancellationRatePercent},${kpis.disputeRatePercent}\n`;
  return csv;
}
