export type DataClassification = "ACTUAL" | "PROJECTED" | "FORECAST" | "ESTIMATE";
export type ReconciliationStatus = "MATCHED" | "UNMATCHED" | "DUPLICATE" | "FAILED" | "REFUNDED" | "PENDING";
export type SheetsSyncStatus = "SYNCED" | "MISSING" | "OUTDATED" | "DUPLICATE" | "ERROR";
export type BalanceRiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type PeriodLockStatus = "OPEN" | "LOCKED";

export interface FinancialKpiMetric {
  key: string;
  label: string;
  value: number;
  formattedValue: string;
  comparisonPeriod: string;
  changePercent: number;
  dataAsOf: string;
  classification: DataClassification;
  source: string;
}

export interface RevenueBreakdownSummary {
  serviceRevenue: number;
  travelRevenue: number;
  productRevenue: number;
  discountsAmount: number;
  refundsAmount: number;
  taxAmount: number;
  gatewayFeesAmount: number;
  otherIncomeAmount: number;
  grossRevenue: number;
  netRevenue: number;
}

export interface CashCollectionMetrics {
  expectedRevenue: number;
  collectedAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  totalConfirmedBookings: number;
  contractValue: number;
  collectedPercentage: number;
}

export interface UpiVerificationMetrics {
  totalSubmissions: number;
  aiPassCount: number;
  aiNeedsReviewCount: number;
  aiRejectedCount: number;
  adminVerifiedCount: number;
  adminRejectedCount: number;
  wrongAmountCount: number;
  duplicateUtrCount: number;
  expiredHoldsCount: number;
}

export interface PaymentFunnelStage {
  stageId: string;
  stageName: string;
  count: number;
  conversionRateFromPrevious: number;
  failureRatePercent: number;
}

export interface OutstandingBalanceRecord {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  eventDate: string;
  totalPrice: number;
  paidAmount: number;
  remainingBalance: number;
  dueDate: string;
  daysOutstanding: number;
  riskLevel: BalanceRiskLevel;
}

export interface ExpenseCategoryBreakdown {
  category: "Travel" | "Products" | "Artist Payouts" | "Studio Costs" | "Advertising" | "Software" | "Supplies" | "Other";
  totalAmount: number;
  percentageOfTotal: number;
  expensePerBooking: number;
}

export interface BookingProfitabilityItem {
  bookingId: string;
  title: string;
  grossRevenue: number;
  artistPayout: number;
  travelExpense: number;
  materialsCost: number;
  discounts: number;
  gatewayFee: number;
  netContribution: number;
  marginPercent: number;
}

export interface ServiceProfitabilityItem {
  serviceId: string;
  title: string;
  category: string;
  bookingsCount: number;
  totalRevenue: number;
  avgRevenuePerBooking: number;
  avgCostPerBooking: number;
  avgContribution: number;
  marginPercent: number;
}

export interface TaxIntelligenceSummary {
  taxableValue: number;
  taxCollected: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  invoicesIssuedCount: number;
  taxAdjustmentsCount: number;
  activeTaxRuleVersion: string;
}

export interface RefundMetrics {
  totalRefundRequests: number;
  refundedAmount: number;
  refundRatePercent: number;
  reasonsBreakdown: { reason: string; count: number; amount: number }[];
  byService: { serviceTitle: string; count: number; amount: number }[];
}

export interface FinancialPeriodStatus {
  currentPeriod: string;
  status: PeriodLockStatus;
  lockedAt?: string;
  lockedBy?: string;
  auditHash?: string;
}

export interface FinancialReconciliationPackage {
  timestamp: string;
  bookingValue: number;
  invoiceValue: number;
  paymentLedgerValue: number;
  analyticsRevenueValue: number;
  taxInvoiceSnapshotsValue: number;
  differenceAmount: number;
  overallStatus: "MATCHED" | "MISMATCH_ALERT";
  sheetsSyncStatus: SheetsSyncStatus;
  sheetsLedgerDifference: number;
}

export interface FinancialAlertItem {
  id: string;
  type: "OUTSTANDING_SPIKE" | "PAYMENT_BACKLOG" | "RECONCILIATION_MISMATCH" | "REFUND_SPIKE" | "REVENUE_DROP" | "MARGIN_DROP" | "EXPENSE_SPIKE" | "TAX_REVIEW" | "SHEET_SYNC_FAILURE";
  severity: "HIGH" | "MEDIUM" | "INFO";
  title: string;
  currentValue: number;
  baselineValue: number;
  differenceAmount: number;
  detectedAt: string;
  message: string;
  recommendedAction: string;
}

export interface ExecutiveFinancialDataPackage {
  dataAsOf: string;
  topCards: FinancialKpiMetric[];
  revenueBreakdown: RevenueBreakdownSummary;
  cashCollection: CashCollectionMetrics;
  upiVerification: UpiVerificationMetrics;
  paymentFunnel: PaymentFunnelStage[];
  outstandingBalances: OutstandingBalanceRecord[];
  expenseBreakdown: ExpenseCategoryBreakdown[];
  bookingProfitability: BookingProfitabilityItem[];
  serviceProfitability: ServiceProfitabilityItem[];
  taxSummary: TaxIntelligenceSummary;
  refundMetrics: RefundMetrics;
  periodStatus: FinancialPeriodStatus;
  reconciliation: FinancialReconciliationPackage;
  alerts: FinancialAlertItem[];
}
