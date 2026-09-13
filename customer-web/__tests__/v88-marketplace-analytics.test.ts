import {
  calculateExecutiveKPIs,
  calculateMarketplaceFunnel,
  getSupplyDemandAnalysis,
  getGeographyMetrics,
  getServiceLocationMatrix,
  calculateMarketplaceHealthScore,
  reconcileMarketplaceData,
  exportMarketplaceAnalyticsCSV,
  zeroResultStore,
  alertsStore,
} from "../src/lib/marketplace/marketplace-analytics-engine";
import { answerMarketplaceAnalystQuery } from "../src/lib/ai/marketplace-ai-analyst";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

export async function runV88MarketplaceAnalyticsTests() {
  console.log("=================================================");
  console.log("RUNNING V8.8 MARKETPLACE ANALYTICS TESTS");
  console.log("=================================================\n");

  // 1. Executive KPIs & Take Rate Test
  console.log("[Test 1] Testing Executive KPIs & Take Rate Formula...");
  const kpis = calculateExecutiveKPIs("2026-09");

  assert(kpis.gmv === 1020000, `Expected GMV ₹10,20,000, got ₹${kpis.gmv}`);
  assert(kpis.platformRevenue === 102000, `Expected Revenue ₹1,02,000, got ₹${kpis.platformRevenue}`);
  assert(kpis.artistEarnings === 918000, `Expected Artist Share ₹9,18,000, got ₹${kpis.artistEarnings}`);
  assert(kpis.takeRatePercent === 10.0, `Expected Take Rate 10.0%, got ${kpis.takeRatePercent}%`);
  console.log("  ✓ GMV, Platform Revenue, Artist Share, and Take Rate verified.");

  // 2. Financial Reconciliation & $0 Discrepancy Test
  console.log("\n[Test 2] Testing Financial Reconciliation & Ledger Validation...");
  const recon = reconcileMarketplaceData();

  assert(recon.reconciled === true, "Financial reconciliation failed");
  assert(recon.discrepancyAmount === 0, `Expected $0 discrepancy, got ₹${recon.discrepancyAmount}`);
  assert(recon.totalBookingGMV === recon.totalCommissionLedger + recon.totalArtistEarnings, "GMV formula mismatch");
  console.log("  ✓ $0 Discrepancy confirmed across GMV = Commission + Artist Earnings ledgers.");

  // 3. Marketplace Conversion Funnel Test
  console.log("\n[Test 3] Testing Marketplace Conversion Funnel...");
  const funnel = calculateMarketplaceFunnel("2026-09");

  assert(funnel.marketplaceVisits > funnel.searches, "Visits must exceed searches");
  assert(funnel.searches > funnel.artistProfileViews, "Searches must exceed profile views");
  assert(funnel.artistProfileViews > funnel.chatsStarted, "Profile views must exceed chats");
  assert(funnel.chatsStarted > funnel.bookingsCompleted, "Chats must exceed completed bookings");
  assert(funnel.overallConversionRatePercent > 0, "Overall conversion rate must be positive");
  console.log(`  ✓ Funnel metrics verified: Overall Conversion = ${funnel.overallConversionRatePercent}%.`);

  // 4. Zero-Result & Supply/Demand Pressure Intelligence Test
  console.log("\n[Test 4] Testing Zero-Result Search & Supply/Demand Pressure...");
  const supplyDemand = getSupplyDemandAnalysis();
  const highDemand = supplyDemand.find((s) => s.demandPressureTag === "HIGH_DEMAND_LOW_SUPPLY");

  assert(highDemand !== undefined, "High demand pressure record not found");
  assert(zeroResultStore.length > 0, "Zero result search demand store must contain records");
  assert(zeroResultStore[0].demandTag === "ZERO_RESULT_DEMAND", "Zero result demand tag mismatch");
  console.log(`  ✓ Supply/Demand pressure tag verified for location ${highDemand?.locationId}.`);

  // 5. Geography & Service x Location Matrix Test
  console.log("\n[Test 5] Testing Geography Metrics & Service Location Matrix...");
  const geo = getGeographyMetrics();
  const matrix = getServiceLocationMatrix();

  assert(geo.length === 4, "Expected 4 regional location records");
  assert(matrix.length > 0, "Service location matrix must contain cells");
  assert(matrix[0].demandLabel.length > 0, "Demand label missing in matrix cell");
  console.log(`  ✓ Geography metrics & Service x Location matrix generated across ${geo.length} locations.`);

  // 6. Marketplace Health Score Test
  console.log("\n[Test 6] Testing Marketplace Health Score...");
  const health = calculateMarketplaceHealthScore();

  assert(health.overallScore >= 90.0, `Expected Health Score >= 90, got ${health.overallScore}`);
  assert(health.factors.supplyDemandBalanceScore > 0, "Supply/Demand factor score invalid");
  console.log(`  ✓ Marketplace Health Score calculated: ${health.overallScore}/100.`);

  // 7. Active Alerts Test
  console.log("\n[Test 7] Testing Active Intelligence Alerts...");
  assert(alertsStore.length > 0, "Alerts store should contain records");
  assert(alertsStore[0].alertType.length > 0, "Alert type missing");
  console.log(`  ✓ ${alertsStore.length} active intelligence alert(s) verified.`);

  // 8. AI Marketplace Analyst Assistant Test
  console.log("\n[Test 8] Testing AI Marketplace Analyst Assistant & Read-Only Enforcement...");
  const aiRes = answerMarketplaceAnalystQuery("Which city is growing fastest?");

  assert(aiRes.answer.includes("Jaipur"), "AI Analyst answer missing Jaipur data");
  assert(aiRes.dataSources.includes("geographyMetrics"), "Data source attribution missing");
  assert(aiRes.readOnlyEnforced === true, "AI Analyst must strictly enforce readOnlyEnforced: true");
  console.log(`  ✓ AI Analyst answered query with data attribution: "${aiRes.answer}"`);

  // 9. CSV Dataset Export Test
  console.log("\n[Test 9] Testing CSV Dataset Export Generator...");
  const csvOverview = exportMarketplaceAnalyticsCSV("overview");
  const csvGeo = exportMarketplaceAnalyticsCSV("geography");

  assert(csvOverview.includes("GMV,PlatformRevenue"), "Overview CSV header invalid");
  assert(csvGeo.includes("LocationID,LocationName"), "Geography CSV header invalid");
  console.log("  ✓ Executive overview and geography CSV datasets exported successfully.");

  console.log("\n=================================================");
  console.log("ALL V8.8 MARKETPLACE ANALYTICS TESTS PASSED SUCCESSFULLY! 🎯");
  console.log("=================================================\n");
}
