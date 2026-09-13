import {
  ForecastingIntelligenceData,
  ForecastingSummaryKPIs,
  RevenueForecastRecord,
  BookingDemandForecastRecord,
  LeadForecastRecord,
  ExpenseCashflowForecastRecord,
  ForecastScenarioSet,
  ForecastAccuracyMetric,
} from "./forecasting-types";
import {
  calculateArtistCapacity,
  calculateCityCapacity,
  calculateTravelRisks,
  generateCalendarHeatmap,
} from "./forecasting-capacity-engine";
import { generateForecastAlerts } from "./forecasting-alert-engine";

export function calculateForecastingIntelligenceData(): ForecastingIntelligenceData {
  const dataAsOf = new Date().toISOString();

  // 1. Revenue Forecast Records
  const revenueForecasts: RevenueForecastRecord[] = [
    {
      periodLabel: "7-Day",
      projectedRevenue: 105000,
      expectedRangeLower: 92000,
      expectedRangeUpper: 118000,
      confidenceIntervalPercent: 90,
      method: "WEIGHTED_MOVING_AVERAGE",
      modelVersion: "WEIGHTED_MOVING_AVERAGE_v1.0",
      classification: "FORECAST",
    },
    {
      periodLabel: "30-Day",
      projectedRevenue: 385000,
      expectedRangeLower: 335000,
      expectedRangeUpper: 420000,
      confidenceIntervalPercent: 90,
      method: "WEIGHTED_MOVING_AVERAGE",
      modelVersion: "WEIGHTED_MOVING_AVERAGE_v1.0",
      classification: "FORECAST",
    },
    {
      periodLabel: "90-Day",
      projectedRevenue: 1250000,
      expectedRangeLower: 1100000,
      expectedRangeUpper: 1400000,
      confidenceIntervalPercent: 85,
      method: "SEASONAL_TREND",
      modelVersion: "SEASONAL_TREND_v1.2",
      classification: "FORECAST",
    },
  ];

  // 2. Booking Demand Forecast
  const bookingDemand: BookingDemandForecastRecord[] = [
    {
      serviceName: "Royal Bridal Package",
      expectedRequests: 18,
      confirmedBookings: 12,
      demandLevel: "VERY_HIGH",
      peakMonthOrWeekend: "Sep 25 - Oct 10",
    },
    {
      serviceName: "Destination Bridal Experience",
      expectedRequests: 8,
      confirmedBookings: 4,
      demandLevel: "HIGH",
      peakMonthOrWeekend: "Oct 15 - Nov 05",
    },
    {
      serviceName: "Party & Festive Glam",
      expectedRequests: 24,
      confirmedBookings: 14,
      demandLevel: "MEDIUM",
      peakMonthOrWeekend: "Oct 20 - Nov 12",
    },
  ];

  // 3. Lead Conversion Forecast
  const leadForecast: LeadForecastRecord = {
    inquiriesProjected: 120,
    qualifiedLeadsProjected: 45,
    quotesSentProjected: 32,
    depositsExpected: 22,
    confirmedBookingsProjected: 18,
    conversionRatePercent: 15.0,
  };

  // 4. Expense & Cashflow Forecast
  const cashflowForecast: ExpenseCashflowForecastRecord = {
    period: "Next 30 Days",
    projectedInflow: 385000,
    projectedOutflow: 135000,
    projectedNetCashflow: 250000,
    expectedExpensesBreakdown: {
      artistPayouts: 65000,
      travelExpenses: 28000,
      marketingSpend: 30000,
      suppliesAndOps: 12000,
    },
  };

  // 5. Scenario Modeling
  const scenarios: ForecastScenarioSet = {
    conservative: { revenue: 310000, bookings: 14, utilization: 72.0 },
    base: { revenue: 385000, bookings: 18, utilization: 82.5 },
    optimistic: { revenue: 440000, bookings: 22, utilization: 92.0 },
  };

  // 6. Accuracy Tracking
  const accuracy: ForecastAccuracyMetric[] = [
    {
      metricName: "30-Day Revenue Forecast",
      trainingWindowDays: 180,
      mapePercent: 8.2,
      mae: 28000,
      accuracyScorePercent: 91.8,
      historicalObservationsCount: 12,
    },
    {
      metricName: "Booking Demand Count",
      trainingWindowDays: 180,
      mapePercent: 11.6,
      mae: 2,
      accuracyScorePercent: 88.4,
      historicalObservationsCount: 12,
    },
  ];

  // Artist & City Capacity calculations
  const artistCapacity = calculateArtistCapacity();
  const cityCapacity = calculateCityCapacity();
  const travelRisks = calculateTravelRisks();
  const heatmap = generateCalendarHeatmap();

  const jaipurCity = cityCapacity.find((c) => c.city === "Jaipur");
  const jaipurShortfall = jaipurCity ? Math.max(0, jaipurCity.projectedBookings - jaipurCity.availableCapacitySlots) : 0;
  const leadArtist = artistCapacity.find((a) => a.artistId === "artist_prachi");

  const alerts = generateForecastAlerts({
    leadArtistUtilization: leadArtist?.utilizationPercent || 93.75,
    jaipurShortfall,
    cashflowNet: cashflowForecast.projectedNetCashflow,
  });

  const summary: ForecastingSummaryKPIs = {
    next7DaysRevenue: revenueForecasts[0].projectedRevenue,
    next30DaysRevenue: revenueForecasts[1].projectedRevenue,
    next90DaysRevenue: revenueForecasts[2].projectedRevenue,
    next30DaysBookings: 18,
    expectedDemandLevel: "HIGH",
    capacityUtilizationPercent: 82.5,
    projectedOutstandingCollection: 95000,
  };

  return {
    dataAsOf,
    summary,
    revenueForecasts,
    bookingDemand,
    leadForecast,
    artistCapacity,
    cityCapacity,
    travelRisks,
    cashflowForecast,
    scenarios,
    accuracy,
    alerts,
    heatmap,
  };
}
