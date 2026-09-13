export interface ForecastingSummaryKPIs {
  next7DaysRevenue: number;
  next30DaysRevenue: number;
  next90DaysRevenue: number;
  next30DaysBookings: number;
  expectedDemandLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  capacityUtilizationPercent: number;
  projectedOutstandingCollection: number;
}

export interface RevenueForecastRecord {
  periodLabel: "7-Day" | "30-Day" | "90-Day";
  projectedRevenue: number;
  expectedRangeLower: number;
  expectedRangeUpper: number;
  confidenceIntervalPercent: number;
  method: "WEIGHTED_MOVING_AVERAGE" | "SEASONAL_TREND";
  modelVersion: string;
  classification: "FORECAST";
}

export interface BookingDemandForecastRecord {
  serviceName: string;
  expectedRequests: number;
  confirmedBookings: number;
  demandLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  peakMonthOrWeekend: string;
}

export interface LeadForecastRecord {
  inquiriesProjected: number;
  qualifiedLeadsProjected: number;
  quotesSentProjected: number;
  depositsExpected: number;
  confirmedBookingsProjected: number;
  conversionRatePercent: number;
}

export interface ArtistCapacityMetric {
  artistId: string;
  artistName: string;
  availableHours: number;
  bookedHours: number;
  forecastDemandHours: number;
  travelHours: number;
  utilizationPercent: number;
  status: "OPTIMAL" | "CAPACITY_RISK" | "UNDER_UTILIZED";
}

export interface CityCapacityMetric {
  city: string;
  projectedBookings: number;
  availableCapacitySlots: number;
  revenueProjected: number;
  capacityStatus: "BALANCED" | "CAPACITY_SHORTAGE" | "SURPLUS";
}

export interface TravelCapacityRiskRecord {
  bookingId: string;
  customerName: string;
  destinationCity: string;
  eventDate: string;
  travelBlockStart: string;
  travelBlockEnd: string;
  conflictRiskLevel: "HIGH" | "MEDIUM" | "LOW";
  bufferNotes: string;
}

export interface ExpenseCashflowForecastRecord {
  period: string;
  projectedInflow: number;
  projectedOutflow: number;
  projectedNetCashflow: number;
  expectedExpensesBreakdown: {
    artistPayouts: number;
    travelExpenses: number;
    marketingSpend: number;
    suppliesAndOps: number;
  };
}

export interface ForecastScenarioSet {
  conservative: { revenue: number; bookings: number; utilization: number };
  base: { revenue: number; bookings: number; utilization: number };
  optimistic: { revenue: number; bookings: number; utilization: number };
}

export interface ForecastAccuracyMetric {
  metricName: string;
  trainingWindowDays: number;
  mapePercent: number; // Mean Absolute Percentage Error
  mae: number; // Mean Absolute Error
  accuracyScorePercent: number;
  historicalObservationsCount: number;
}

export interface ForecastAlertRecord {
  id: string;
  type:
    | "CAPACITY_SHORTAGE"
    | "ARTIST_OVERLOAD"
    | "DEMAND_SPIKE"
    | "REVENUE_DECLINE"
    | "CASHFLOW_RISK"
    | "CITY_CAPACITY_RISK";
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  status: "ACTIVE" | "RESOLVED";
  detectedAt: string;
}

export interface CalendarHeatmapDay {
  date: string;
  dayOfWeek: string;
  demandLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  bookedCount: number;
  capacityLimit: number;
}

export interface ForecastingIntelligenceData {
  dataAsOf: string;
  summary: ForecastingSummaryKPIs;
  revenueForecasts: RevenueForecastRecord[];
  bookingDemand: BookingDemandForecastRecord[];
  leadForecast: LeadForecastRecord;
  artistCapacity: ArtistCapacityMetric[];
  cityCapacity: CityCapacityMetric[];
  travelRisks: TravelCapacityRiskRecord[];
  cashflowForecast: ExpenseCashflowForecastRecord;
  scenarios: ForecastScenarioSet;
  accuracy: ForecastAccuracyMetric[];
  alerts: ForecastAlertRecord[];
  heatmap: CalendarHeatmapDay[];
}
