import { calculateExecutiveBiData } from "../src/lib/bi/kpi-engine";
import { validateAnalyticsReconciliation } from "../src/lib/bi/bi-reconciliation";
import { generateBusinessAlerts } from "../src/lib/bi/bi-alert-engine";

describe("V6.0 Business Intelligence & AI Analyst Engine Suite", () => {
  test("📊 Deterministic KPI Engine calculates top-level financial metrics and metadata", () => {
    const biData = calculateExecutiveBiData();

    expect(biData.dataAsOf).toBeDefined();
    expect(biData.calculationVersion).toContain("v6.0");
    expect(biData.topKpis.length).toBeGreaterThanOrEqual(4);

    const revenueKpi = biData.topKpis.find((k) => k.key === "monthlyRevenue");
    expect(revenueKpi).toBeDefined();
    expect(revenueKpi?.value).toBe(635000); // 540000 net service + 95000 product
    expect(revenueKpi?.status).toBe("PASS");
  });

  test("🔄 Analytics Reconciliation Engine compares ledger vs analytics totals", () => {
    const biData = calculateExecutiveBiData();
    const recon = validateAnalyticsReconciliation(biData);

    expect(recon.financialLedgerRevenue).toBe(635000);
    expect(recon.analyticsRevenue).toBe(635000);
    expect(recon.difference).toBe(0);
    expect(recon.status).toBe("PASS");
    expect(recon.healthCode).toBe("PASS");
  });

  test("⚠️ Business Alert Engine deterministically generates threshold alerts", () => {
    const biData = calculateExecutiveBiData();
    const alerts = generateBusinessAlerts(biData);

    expect(alerts.length).toBeGreaterThan(0);
    const capacityAlert = alerts.find((a) => a.type === "CAPACITY_RISK");
    expect(capacityAlert).toBeDefined();
    expect(capacityAlert?.severity).toBe("HIGH");
  });

  test("🎯 Booking Funnel & Marketing Attribution metrics validate funnel stages", () => {
    const biData = calculateExecutiveBiData();

    expect(biData.bookingFunnel.length).toBe(8);
    expect(biData.marketingAttribution.length).toBeGreaterThanOrEqual(3);
    expect(biData.servicePerformance.length).toBeGreaterThanOrEqual(3);
  });
});
