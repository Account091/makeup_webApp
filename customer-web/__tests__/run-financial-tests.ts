import { calculateFinancialIntelligenceData } from "../src/lib/financial/financial-kpi-engine";
import { validateMultiWayReconciliation } from "../src/lib/financial/financial-reconciliation-engine";
import { generateFinancialAlerts } from "../src/lib/financial/financial-alert-engine";

export async function runFinancialTests() {
  console.log("---------------------------------------------------------");
  console.log("🧪 V6.1 FINANCIAL INTELLIGENCE & RECONCILIATION RUNNER");
  console.log("---------------------------------------------------------");

  // Test 1: Deterministic Revenue Formula (Gross - Discounts - Refunds = Net)
  const finData = calculateFinancialIntelligenceData();
  const netRevCalculated = finData.revenueBreakdown.grossRevenue - finData.revenueBreakdown.discountsAmount - finData.revenueBreakdown.refundsAmount;
  if (finData.revenueBreakdown.netRevenue !== netRevCalculated) {
    throw new Error(`Revenue calculation discrepancy! ${finData.revenueBreakdown.netRevenue} != ${netRevCalculated}`);
  }
  console.log(`✅ TEST 1 PASSED: Gross Revenue (₹${finData.revenueBreakdown.grossRevenue}) - Discounts (₹${finData.revenueBreakdown.discountsAmount}) = Net Revenue (₹${finData.revenueBreakdown.netRevenue})`);

  // Test 2: Multi-Way Financial Reconciliation Engine
  const recon = validateMultiWayReconciliation(finData);
  if (recon.differenceAmount !== 0 || recon.overallStatus !== "MATCHED") {
    throw new Error(`Financial reconciliation failed! Status: ${recon.overallStatus}, Diff: ₹${recon.differenceAmount}`);
  }
  console.log(`✅ TEST 2 PASSED: Multi-Way Financial Reconciliation Status = '${recon.overallStatus}' (Bookings = Invoices = Ledger = Analytics)`);

  // Test 3: Financial Risk Alert Engine
  const alerts = generateFinancialAlerts(finData);
  if (alerts.length === 0) {
    throw new Error("Financial alert engine failed to generate risk alerts!");
  }
  console.log(`✅ TEST 3 PASSED: Alert Engine generated ${alerts.length} financial alerts (${alerts[0].type} - ${alerts[0].severity})`);

  // Test 4: Booking & Service Profitability Margins
  const royalBridal = finData.bookingProfitability[0];
  if (!royalBridal || royalBridal.marginPercent < 50) {
    throw new Error("Profitability margin calculation error!");
  }
  console.log(`✅ TEST 4 PASSED: Booking Profitability calculated for '${royalBridal.title}' (Contribution: ₹${royalBridal.netContribution}, Margin: ${royalBridal.marginPercent}%)`);

  // Test 5: Manual UPI Screening Funnel & Tax Rules Snapshot
  if (finData.upiVerification.totalSubmissions !== 28 || !finData.taxSummary.activeTaxRuleVersion) {
    throw new Error("UPI verification or tax snapshot error!");
  }
  console.log(`✅ TEST 5 PASSED: Manual UPI Verification Funnel (${finData.upiVerification.adminVerifiedCount}/${finData.upiVerification.totalSubmissions} Verified) & Tax Snapshot '${finData.taxSummary.activeTaxRuleVersion}'`);

  console.log("---------------------------------------------------------");
  console.log("🎉 ALL V6.1 FINANCIAL INTELLIGENCE TESTS PASSED (100%)!");
  console.log("---------------------------------------------------------");
}

if (require.main === module) {
  runFinancialTests().catch((err) => {
    console.error("❌ FINANCIAL TEST RUNNER FAILED:", err);
    process.exit(1);
  });
}
