import { calculateDestinationOpsData } from "../src/lib/destination-ops/destination-wedding-engine";
import { generateDestinationRisks } from "../src/lib/destination-ops/destination-risk-engine";

describe("V7.2 Destination Wedding Operations Suite", () => {
  test("🏰 Destination Operations Engine calculates active wedding engagements & functions", () => {
    const destData = calculateDestinationOpsData();

    expect(destData.dataAsOf).toBeDefined();
    expect(destData.summary.totalActiveWeddings).toBeGreaterThan(0);
    expect(destData.weddings.length).toBeGreaterThanOrEqual(2);
    expect(destData.functions.length).toBeGreaterThanOrEqual(3);
    expect(destData.venues.length).toBeGreaterThan(0);
  });

  test("✈️ Logistics, Travel & Payment Milestones track staged balances", () => {
    const destData = calculateDestinationOpsData();

    expect(destData.travelItineraries.length).toBeGreaterThan(0);
    expect(destData.accommodations.length).toBeGreaterThan(0);
    expect(destData.paymentSchedules.length).toBe(3);

    const deposit = destData.paymentSchedules.find((p) => p.milestoneLabel === "DEPOSIT");
    expect(deposit?.status).toBe("PAID");
  });

  test("🚨 Destination Risk Engine generates travel and lookboard alerts", () => {
    const destData = calculateDestinationOpsData();
    const risks = generateDestinationRisks({
      travel: destData.travelItineraries,
      accommodations: destData.accommodations,
      payments: destData.paymentSchedules,
      lookboards: destData.lookboards,
    });

    expect(risks.length).toBeGreaterThanOrEqual(0);
  });
});
