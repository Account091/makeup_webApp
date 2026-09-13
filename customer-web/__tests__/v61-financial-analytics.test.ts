import { calculateFinancialIntelligenceData } from "../src/lib/financial/financial-kpi-engine";
import { validateMultiWayReconciliation } from "../src/lib/financial/financial-reconciliation-engine";
import { generateFinancialAlerts } from "../src/lib/financial/financial-alert-engine";

describe("V6.1 Advanced Revenue & Financial Intelligence Suite", () => {
  test("💰 Deterministic Financial Engine calculates Net Revenue (Gross - Discounts - Refunds)", () => {
    const finData = calculateFinancialIntelligenceData();

    expect(finData.dataAsOf).toBeDefined();
    expect(finData.topCards.length).toBeGreaterThanOrEqual(5);

    const grossRev = finData.revenueBreakdown.grossRevenue;
    const discounts = finData.revenueBreakdown.discountsAmount;
    const refunds = finData.revenueBreakdown.refundsAmount;
    const netRev = finData.revenueBreakdown.netRevenue;

    expect(netRev).toBe(grossRev - discounts - refunds);
  });

  test("🔄 Multi-Way Financial Reconciliation Engine verifies ₹0 ledger difference", () => {
    const finData = calculateFinancialIntelligenceData();
    const recon = validateMultiWayReconciliation(finData);

    expect(recon.differenceAmount).toBe(0);
    expect(recon.overallStatus).toBe("MATCHED");
    expect(recon.sheetsSyncStatus).toBe("SYNCED");
  });

  test("⚠️ Financial Alert Engine generates risk alerts for overdue balances & UPI backlogs", () => {
    const finData = calculateFinancialIntelligenceData();
    const alerts = generateFinancialAlerts(finData);

    expect(alerts.length).toBeGreaterThan(0);
    const outstandingAlert = alerts.find((a) => a.type === "OUTSTANDING_SPIKE");
    expect(outstandingAlert).toBeDefined();
    expect(outstandingAlert?.severity).toBe("HIGH");
  });

  test("📈 Profitability & UPI Screening Funnel calculate correct margins", () => {
    const finData = calculateFinancialIntelligenceData();

    expect(finData.bookingProfitability.length).toBeGreaterThanOrEqual(2);
    expect(finData.bookingProfitability[0].marginPercent).toBeGreaterThan(50);
    expect(finData.upiVerification.totalSubmissions).toBe(28);
    expect(finData.taxSummary.activeTaxRuleVersion).toContain("v1.4");
  });
});
