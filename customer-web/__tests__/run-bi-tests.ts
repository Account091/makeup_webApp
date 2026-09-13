import { calculateExecutiveBiData } from "../src/lib/bi/kpi-engine";
import { validateAnalyticsReconciliation } from "../src/lib/bi/bi-reconciliation";
import { generateBusinessAlerts } from "../src/lib/bi/bi-alert-engine";

export async function runBiTests() {
  console.log("---------------------------------------------------------");
  console.log("🧪 V6.0 BUSINESS INTELLIGENCE & AI ANALYST TEST RUNNER");
  console.log("---------------------------------------------------------");

  // Test 1: Deterministic KPI Engine
  const biData = calculateExecutiveBiData({ city: "Jodhpur", dateRange: "THIS_MONTH" });
  if (!biData.dataAsOf || biData.topKpis.length < 4) {
    throw new Error("KPI engine failed to calculate top-level metrics!");
  }
  const revKpi = biData.topKpis.find((k) => k.key === "monthlyRevenue");
  console.log(`✅ TEST 1 PASSED: Deterministic KPI Engine calculated Total Revenue = ${revKpi?.formattedValue}`);

  // Test 2: Reconciliation Engine
  const recon = validateAnalyticsReconciliation(biData);
  if (recon.difference !== 0 || recon.status !== "PASS") {
    throw new Error(`Data reconciliation failed! Difference: ₹${recon.difference}`);
  }
  console.log(`✅ TEST 2 PASSED: Data Reconciliation verified (Ledger: ₹${recon.financialLedgerRevenue} = Analytics: ₹${recon.analyticsRevenue})`);

  // Test 3: Business Risk Alert Engine
  const alerts = generateBusinessAlerts(biData);
  if (alerts.length === 0) {
    throw new Error("Business alert engine failed to trigger alerts!");
  }
  console.log(`✅ TEST 3 PASSED: Alert Engine generated ${alerts.length} business risk alerts (${alerts[0].type} - ${alerts[0].severity})`);

  // Test 4: All 10 Domain Datasets & Forecast Classification
  if (
    !biData.revenueMetrics ||
    !biData.bookingFunnel ||
    !biData.servicePerformance ||
    !biData.customerMetrics ||
    !biData.crmMetrics ||
    !biData.marketingAttribution ||
    !biData.capacityMetrics ||
    !biData.artistMetrics ||
    !biData.ecommerceMetrics ||
    !biData.forecast
  ) {
    throw new Error("Missing domain datasets in BI package!");
  }
  console.log(`✅ TEST 4 PASSED: All 10 BI Domains & Moving Average Forecast classified as '${biData.forecast.forecastType}'`);

  console.log("---------------------------------------------------------");
  console.log("🎉 ALL V6.0 BUSINESS INTELLIGENCE TESTS PASSED (100%)!");
  console.log("---------------------------------------------------------");
}

if (require.main === module) {
  runBiTests().catch((err) => {
    console.error("❌ BI TEST RUNNER FAILED:", err);
    process.exit(1);
  });
}
