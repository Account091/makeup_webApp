export type KpiStatus = "PASS" | "WARNING" | "FAIL";
export type ForecastType = "ACTUAL" | "PROJECTED" | "MOVING_AVERAGE_FORECAST" | "ESTIMATE";

export interface KpiMetric {
  key: string;
  label: string;
  value: number;
  formattedValue: string;
  comparisonPeriod: string;
  changePercent: number;
  dataAsOf: string;
  calculationVersion: string;
  status: KpiStatus;
  category: "REVENUE" | "BOOKING" | "CUSTOMER" | "LEAD" | "MARKETING" | "CAPACITY" | "ARTIST" | "ECOMMERCE";
}

export interface RevenueMetrics {
  grossServiceRevenue: number;
  netServiceRevenue: number;
  productRevenue: number;
  taxAmount: number;
  travelRevenue: number;
  discountsAmount: number;
  refundsAmount: number;
  gatewayFeesAmount: number;
  expensesAmount: number;
  netOperatingResult: number;
}

export interface FunnelStage {
  stageId: string;
  stageName: string;
  count: number;
  conversionRateFromPrevious: number;
  dropoffRatePercent: number;
}

export interface ServicePerformanceMetric {
  serviceId: string;
  title: string;
  category: string;
  bookingsCount: number;
  totalRevenue: number;
  averageBookingValue: number;
  conversionRatePercent: number;
  cancellationRatePercent: number;
  averageRating: number;
  reviewCount: number;
  repeatPurchaseRatePercent: number;
}

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomersCount: number;
  returningCustomersCount: number;
  repeatCustomerRatePercent: number;
  averageUnifiedLtv: number;
  averageServiceValue: number;
  averageProductOrderValue: number;
  rfmSegments: {
    segmentName: string;
    customerCount: number;
    averageLtv: number;
    repeatPurchaseRate: number;
    recommendedAction: string;
  }[];
}

export interface CrmMetrics {
  hotLeadsCount: number;
  warmLeadsCount: number;
  coldLeadsCount: number;
  followupsOverdueCount: number;
  quotesAwaitingResponseCount: number;
  consultationsPendingCount: number;
  highValueLeadsCount: number;
  overallLeadConversionRatePercent: number;
  averageResponseTimeHours: number;
}

export interface AttributionMetric {
  channelOrSource: string;
  identifier: string;
  views: number;
  clicks: number;
  leadsGenerated: number;
  bookingsConverted: number;
  attributedRevenue: number;
  estimatedCost: number;
  roiMultiplier: number;
}

export interface CapacityMetrics {
  totalAvailableHours: number;
  bookedHours: number;
  travelHours: number;
  prepHours: number;
  idleHours: number;
  capacityUtilizationPercent: number;
  peakDates: string[];
  underutilizedDates: string[];
}

export interface ArtistMetrics {
  artistId: string;
  artistName: string;
  bookingsHandled: number;
  totalRevenueGenerated: number;
  hoursWorked: number;
  utilizationPercent: number;
  travelHours: number;
  customerRating: number;
  onTimeRatePercent: number;
  cancellationRatePercent: number;
  commissionEarned: number;
}

export interface EcommerceMetrics {
  productRevenue: number;
  unitsSold: number;
  averageOrderValue: number;
  cartAbandonmentRatePercent: number;
  returnRatePercent: number;
  refundValue: number;
  stockTurnoverRate: number;
  topSellingProducts: { productId: string; name: string; unitsSold: number; revenue: number }[];
  lowStockProducts: { productId: string; name: string; currentStock: number; minThreshold: number }[];
}

export interface ForecastSnapshot {
  period: string;
  projectedBookings: number;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedNetProfit: number;
  movingAverage7Day: number;
  movingAverage30Day: number;
  forecastType: ForecastType;
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
}

export interface BusinessAlertItem {
  id: string;
  type: "REVENUE_DROP" | "BOOKING_DROP" | "CAPACITY_RISK" | "PAYMENT_BACKLOG" | "LEAD_BACKLOG" | "SERVICE_SPIKE" | "SERVICE_DECLINE" | "INVENTORY_RISK";
  severity: "HIGH" | "MEDIUM" | "INFO";
  title: string;
  metric: string;
  currentValue: number;
  baselineValue: number;
  changePercent: number;
  detectedAt: string;
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  message: string;
  recommendedAction: string;
}

export interface ReconciliationReport {
  timestamp: string;
  financialLedgerRevenue: number;
  analyticsRevenue: number;
  difference: number;
  status: KpiStatus;
  reconciledBookingsCount: number;
  transactionalBookingsCount: number;
  healthCode: "PASS" | "WARNING_DISCREPANCY_DETECTED";
}

export interface BiFilterOptions {
  dateRange?: string; // e.g. "THIS_MONTH", "LAST_30_DAYS", "THIS_QUARTER", "THIS_YEAR"
  city?: string; // "Jodhpur", "Jaipur", "Udaipur", "Destination", "ALL"
  serviceId?: string;
  artistId?: string;
  bookingStatus?: string;
}

export interface ExecutiveBiDataPackage {
  dataAsOf: string;
  calculationVersion: string;
  filters: BiFilterOptions;
  topKpis: KpiMetric[];
  revenueMetrics: RevenueMetrics;
  bookingFunnel: FunnelStage[];
  servicePerformance: ServicePerformanceMetric[];
  customerMetrics: CustomerMetrics;
  crmMetrics: CrmMetrics;
  marketingAttribution: AttributionMetric[];
  capacityMetrics: CapacityMetrics;
  artistMetrics: ArtistMetrics[];
  ecommerceMetrics: EcommerceMetrics;
  forecast: ForecastSnapshot;
  alerts: BusinessAlertItem[];
  reconciliation: ReconciliationReport;
}
