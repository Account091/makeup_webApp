import { calculateCustomerIntelligenceData } from "../src/lib/customer/customer-kpi-engine";
import { generateCustomerRisks } from "../src/lib/customer/customer-risk-engine";
import { generateCustomerTimelineEvents } from "../src/lib/customer/customer-timeline-engine";

describe("V6.2 Customer & CRM Intelligence Suite", () => {
  test("❤️ Deterministic Customer Engine calculates explainable Health Scores", () => {
    const custData = calculateCustomerIntelligenceData();

    expect(custData.dataAsOf).toBeDefined();
    expect(custData.customerDossiers.length).toBeGreaterThanOrEqual(3);

    const priya = custData.customerDossiers.find((c) => c.customerId === "cust_priya_01");
    expect(priya).toBeDefined();
    expect(priya?.healthScore.score).toBe(88);
    expect(priya?.healthScore.classification).toBe("HEALTHY");
    expect(priya?.healthScore.factors.paymentReliability).toBe(100);
  });

  test("🎯 CRM Pipeline & Priority Follow-up Queue validate lead scoring", () => {
    const custData = calculateCustomerIntelligenceData();

    expect(custData.crmPipeline.hotLeadsCount).toBeGreaterThan(0);
    expect(custData.priorityFollowups.length).toBeGreaterThan(0);

    const topPf = custData.priorityFollowups[0];
    expect(topPf.priority).toBe("HIGH");
    expect(topPf.leadScore).toBeGreaterThan(80);
  });

  test("⚠️ Customer Risk Engine generates PAYMENT_RISK & EXPERIENCE_RISK alerts", () => {
    const custData = calculateCustomerIntelligenceData();
    const risks = generateCustomerRisks(custData);

    expect(risks.length).toBeGreaterThan(0);
    const payRisk = risks.find((r) => r.riskType === "PAYMENT_RISK");
    expect(payRisk).toBeDefined();
    expect(payRisk?.severity).toBe("HIGH");
  });

  test("📜 Activity Timeline Engine generates standardized chronological events", () => {
    const timeline = generateCustomerTimelineEvents("cust_priya_01");

    expect(timeline.length).toBeGreaterThanOrEqual(5);
    expect(timeline[0].type).toBe("INQUIRY");
    expect(timeline[0].visibility).toBe("ADMIN");
  });
});
