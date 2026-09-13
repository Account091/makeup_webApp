import { calculateDestinationOpsData } from "../src/lib/destination-ops/destination-wedding-engine";
import { generateDestinationRisks } from "../src/lib/destination-ops/destination-risk-engine";

function runV72Tests() {
  console.log("=========================================");
  console.log("🏰 Running V7.2 Destination Operations Test Suite");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(` ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Destination Weddings & Functions Engine
  console.log("--- 1. Testing Destination Weddings & Functions Engine ---");
  const destData = calculateDestinationOpsData();
  assert(!!destData.dataAsOf, "dataAsOf timestamp is defined");
  assert(destData.summary.totalActiveWeddings === 2, `Active weddings count = ${destData.summary.totalActiveWeddings} (Expected: 2)`);
  assert(destData.summary.pipelineQuoteValue === 560000, `Total pipeline quote value = ₹${destData.summary.pipelineQuoteValue} (Expected: ₹5,60,000)`);
  assert(destData.functions.length >= 3, `Functions count = ${destData.functions.length} >= 3`);
  assert(destData.venues.length > 0, "Registered venue records exist");

  // 2. Logistics & Staged Payment Milestones
  console.log("\n--- 2. Testing Logistics & Staged Payment Milestones ---");
  assert(destData.travelItineraries.length > 0, "Travel itineraries exist");
  assert(destData.accommodations.length > 0, "Accommodation plans exist");
  assert(destData.paymentSchedules.length === 3, "Staged payment schedule contains 3 milestones (Deposit, 2nd, Balance)");
  const deposit = destData.paymentSchedules.find((p) => p.milestoneLabel === "DEPOSIT");
  assert(deposit?.status === "PAID", "Deposit milestone status is 'PAID'");

  // 3. Lookboards & Anomaly Risk Engine
  console.log("\n--- 3. Testing Bridal Lookboards & Anomaly Risk Engine ---");
  assert(destData.lookboards.length > 0, "Wedding lookboard records exist");
  const risks = generateDestinationRisks({
    travel: destData.travelItineraries,
    accommodations: destData.accommodations,
    payments: destData.paymentSchedules,
    lookboards: destData.lookboards,
  });
  assert(Array.isArray(risks), "Destination risk engine ran successfully");

  console.log("\n=========================================");
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runV72Tests();
