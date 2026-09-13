import { calculateLocationScores, calculateLocationGrowthScores } from "../src/lib/locations/location-score-engine";
import { generateLocationOpportunities, generateLocationOptRisks } from "../src/lib/locations/location-opportunity-engine";
import { calculateLocationOptimizationData } from "../src/lib/locations/location-opt-kpi-engine";

function runV74Tests() {
  console.log("=========================================");
  console.log("🏆 Running V7.4 Location Intelligence Test Suite");
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

  // 1. Location Score Engine
  console.log("--- 1. Testing Location Score Engine (0-100) ---");
  const scores = calculateLocationScores();
  assert(scores.length === 4, `Score records generated for 4 hubs (Count: ${scores.length})`);
  const jodhpur = scores.find((s) => s.locationId === "jodhpur");
  assert(jodhpur?.overallScore === 88, `Jodhpur overall score = ${jodhpur?.overallScore} (Expected: 88)`);
  assert(jodhpur?.scoringVersion === "1.0", `Scoring version = '${jodhpur?.scoringVersion}' (Expected: '1.0')`);
  assert(jodhpur?.classification === "EXCELLENT", `Jodhpur classification = '${jodhpur?.classification}' (Expected: 'EXCELLENT')`);

  // 2. Growth Score Engine
  console.log("\n--- 2. Testing Location Growth Engine ---");
  const growth = calculateLocationGrowthScores();
  assert(growth.length === 4, `Growth records count = ${growth.length} (Expected: 4)`);
  const jaipur = growth.find((g) => g.locationId === "jaipur");
  assert(jaipur?.revenueGrowthPercent === 32.0, `Jaipur revenue growth = ${jaipur?.revenueGrowthPercent}% (Expected: 32.0%)`);
  assert(jaipur?.capacityHeadroomPercent === 11.0, `Jaipur capacity headroom = ${jaipur?.capacityHeadroomPercent}% (Expected: 11.0%)`);

  // 3. Aggregate Optimization Data & Travel Ratios
  console.log("\n--- 3. Testing Aggregate Optimization Data & Travel Ratios ---");
  const optData = calculateLocationOptimizationData();
  assert(!!optData.dataAsOf, "dataAsOf timestamp is generated");
  assert(optData.summary.averageLocationScore === 84.0, `Average location score = ${optData.summary.averageLocationScore} (Expected: 84.0)`);
  const udaipurTr = optData.travelEfficiency.find((t) => t.locationId === "udaipur");
  assert(udaipurTr?.travelRatioPercent === 14.7, `Udaipur travel ratio = ${udaipurTr?.travelRatioPercent}% (Expected: 14.7%)`);
  assert(udaipurTr?.efficiencyStatus === "ACCEPTABLE", `Udaipur travel status = '${udaipurTr?.efficiencyStatus}' (Expected: 'ACCEPTABLE')`);

  // 4. Opportunities, Risks & Expansion Signals
  console.log("\n--- 4. Testing Opportunities, Risks & Expansion Signals ---");
  const opps = generateLocationOpportunities();
  const risks = generateLocationOptRisks();
  assert(opps.length === 2, `Active opportunities count = ${opps.length} (Expected: 2)`);
  assert(risks.length === 2, `Active risks count = ${risks.length} (Expected: 2)`);

  const expansion = optData.expansionSignals;
  const ahmedabad = expansion.find((e) => e.candidateCity === "Ahmedabad");
  assert(ahmedabad?.inquiriesCount === 17, `Ahmedabad inquiries count = ${ahmedabad?.inquiriesCount} (Expected: 17)`);
  assert(ahmedabad?.destinationInterestLevel === "HIGH", `Ahmedabad interest level = '${ahmedabad?.destinationInterestLevel}' (Expected: 'HIGH')`);

  console.log("\n=========================================");
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runV74Tests();
