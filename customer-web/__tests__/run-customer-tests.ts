import { calculateCustomerIntelligenceData } from "../src/lib/customer/customer-kpi-engine";
import { generateCustomerRisks } from "../src/lib/customer/customer-risk-engine";
import { generateCustomerTimelineEvents } from "../src/lib/customer/customer-timeline-engine";

function runV62Tests() {
  console.log("=========================================");
  console.log("🧪 Running V6.2 Customer & CRM Intelligence Test Suite");
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

  // 1. Health Score Engine
  console.log("--- 1. Testing Customer Health Score & Dossier Engine ---");
  const custData = calculateCustomerIntelligenceData();
  assert(!!custData.dataAsOf, "dataAsOf timestamp is defined");
  assert(custData.customerDossiers.length >= 3, `Dossiers generated count = ${custData.customerDossiers.length} >= 3`);

  const priya = custData.customerDossiers.find((c) => c.customerId === "cust_priya_01");
  assert(!!priya, "Found dossier for cust_priya_01");
  assert(priya?.healthScore.score === 88, `Priya health score is ${priya?.healthScore.score} (Expected: 88)`);
  assert(priya?.healthScore.classification === "HEALTHY", `Priya health status is ${priya?.healthScore.classification} (Expected: HEALTHY)`);
  assert(priya?.healthScore.factors.paymentReliability === 100, "Priya payment reliability is 100%");

  // 2. CRM Pipeline & Priority Follow-ups
  console.log("\n--- 2. Testing CRM Pipeline & Priority Follow-ups ---");
  assert(custData.crmPipeline.hotLeadsCount > 0, `Hot leads count = ${custData.crmPipeline.hotLeadsCount} > 0`);
  assert(custData.priorityFollowups.length > 0, `Priority follow-ups count = ${custData.priorityFollowups.length} > 0`);
  const topPf = custData.priorityFollowups[0];
  assert(topPf?.priority === "HIGH", `Top follow-up priority is ${topPf?.priority} (Expected: HIGH)`);
  assert(topPf?.leadScore > 80, `Top follow-up lead score is ${topPf?.leadScore} > 80`);

  // 3. Customer Risk Engine
  console.log("\n--- 3. Testing Customer Risk Engine ---");
  const risks = generateCustomerRisks(custData);
  assert(risks.length > 0, `Generated ${risks.length} risk alerts`);
  const payRisk = risks.find((r) => r.riskType === "PAYMENT_RISK");
  assert(!!payRisk, "PAYMENT_RISK alert generated for high balance");
  assert(payRisk?.severity === "HIGH", `PAYMENT_RISK severity is ${payRisk?.severity} (Expected: HIGH)`);

  // 4. Activity Timeline Engine
  console.log("\n--- 4. Testing Activity Timeline Engine ---");
  const timeline = generateCustomerTimelineEvents("cust_priya_01");
  assert(timeline.length >= 5, `Timeline events count = ${timeline.length} >= 5`);
  assert(timeline[0]?.type === "INQUIRY", `First event type is ${timeline[0]?.type} (Expected: INQUIRY)`);
  assert(timeline[0]?.visibility === "ADMIN", `First event visibility is ${timeline[0]?.visibility} (Expected: ADMIN)`);

  console.log("\n=========================================");
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runV62Tests();
