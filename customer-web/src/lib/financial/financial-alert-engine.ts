import { ExecutiveFinancialDataPackage, FinancialAlertItem } from "./financial-types";

/**
 * Deterministic Financial Alert Engine: Evaluates financial thresholds and generates alerts.
 */
export function generateFinancialAlerts(finData: ExecutiveFinancialDataPackage): FinancialAlertItem[] {
  const alerts: FinancialAlertItem[] = [];
  const now = new Date().toISOString();

  // Rule 1: Outstanding Balance Spike / Overdue Check
  if (finData.cashCollection.overdueAmount > 30000) {
    alerts.push({
      id: "falt_outstanding_001",
      type: "OUTSTANDING_SPIKE",
      severity: "HIGH",
      title: "Overdue Balance Spike Alert",
      currentValue: finData.cashCollection.overdueAmount,
      baselineValue: 20000,
      differenceAmount: finData.cashCollection.overdueAmount - 20000,
      detectedAt: now,
      message: `Overdue balances reached ₹${finData.cashCollection.overdueAmount.toLocaleString("en-IN")}. ${finData.outstandingBalances.length} client payments are overdue.`,
      recommendedAction: "Trigger automated WhatsApp payment reminders to clients with HIGH risk rating.",
    });
  }

  // Rule 2: UPI Manual Verification Backlog
  if (finData.upiVerification.aiNeedsReviewCount > 2) {
    alerts.push({
      id: "falt_upi_002",
      type: "PAYMENT_BACKLOG",
      severity: "MEDIUM",
      title: "UPI Verification Backlog Alert",
      currentValue: finData.upiVerification.aiNeedsReviewCount,
      baselineValue: 0,
      differenceAmount: finData.upiVerification.aiNeedsReviewCount,
      detectedAt: now,
      message: `${finData.upiVerification.aiNeedsReviewCount} payment screenshot submissions require manual Admin verification.`,
      recommendedAction: "Review pending payment screenshots in Admin WhatsApp / Payment Verification Console.",
    });
  }

  // Rule 3: Reconciliation Mismatch Check
  if (finData.reconciliation.overallStatus !== "MATCHED") {
    alerts.push({
      id: "falt_recon_003",
      type: "RECONCILIATION_MISMATCH",
      severity: "HIGH",
      title: "Financial Reconciliation Discrepancy",
      currentValue: finData.reconciliation.differenceAmount,
      baselineValue: 0,
      differenceAmount: finData.reconciliation.differenceAmount,
      detectedAt: now,
      message: `Discrepancy of ₹${finData.reconciliation.differenceAmount} detected between Bookings and Payment Ledger.`,
      recommendedAction: "Perform universal audit check to reconcile invoice transaction entries.",
    });
  }

  return alerts;
}
