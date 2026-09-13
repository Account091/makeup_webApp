import { calculateLocationScores, calculateLocationGrowthScores } from "../src/lib/locations/location-score-engine";
import { generateLocationOpportunities, generateLocationOptRisks } from "../src/lib/locations/location-opportunity-engine";
import { calculateLocationOptimizationData } from "../src/lib/locations/location-opt-kpi-engine";

describe("V7.4 Location Intelligence & Optimization Suite", () => {
  test("🏆 Location Score Engine calculates deterministic 0-100 scores with version 1.0", () => {
    const scores = calculateLocationScores();
    expect(scores.length).toBe(4);
    
    scores.forEach((sc) => {
      expect(sc.overallScore).toBeGreaterThanOrEqual(0);
      expect(sc.overallScore).toBeLessThanOrEqual(100);
      expect(sc.scoringVersion).toBe("1.0");
      expect(sc.factors.demandScore).toBeDefined();
      expect(sc.factors.profitabilityScore).toBeDefined();
    });

    const jodhpur = scores.find((s) => s.locationId === "jodhpur");
    expect(jodhpur?.overallScore).toBe(88);
    expect(jodhpur?.classification).toBe("EXCELLENT");
  });

  test("📈 Location Growth Engine evaluates regional trajectory and capacity headroom", () => {
    const growth = calculateLocationGrowthScores();
    expect(growth.length).toBe(4);

    const jaipur = growth.find((g) => g.locationId === "jaipur");
    expect(jaipur?.revenueGrowthPercent).toBe(32.0);
    expect(jaipur?.growthStatus).toBe("STRONG");
    expect(jaipur?.capacityHeadroomPercent).toBe(11.0);
  });

  test("🚗 Travel Efficiency & Cross-Location Benchmarks aggregate accurately", () => {
    const data = calculateLocationOptimizationData();
    expect(data.dataAsOf).toBeDefined();
    expect(data.summary.averageLocationScore).toBe(84.0);

    const udaipurTr = data.travelEfficiency.find((t) => t.locationId === "udaipur");
    expect(udaipurTr?.travelRatioPercent).toBe(14.7);
    expect(udaipurTr?.efficiencyStatus).toBe("ACCEPTABLE");

    const benchmarks = data.benchmarks;
    expect(benchmarks.length).toBe(5);

    const expansion = data.expansionSignals;
    const ahmedabad = expansion.find((e) => e.candidateCity === "Ahmedabad");
    expect(ahmedabad?.inquiriesCount).toBe(17);
    expect(ahmedabad?.destinationInterestLevel).toBe("HIGH");
  });

  test("💡 Opportunities and Risks identify capacity constraints and outstation travel costs", () => {
    const opps = generateLocationOpportunities();
    const risks = generateLocationOptRisks();

    expect(opps.length).toBeGreaterThan(0);
    expect(risks.length).toBeGreaterThan(0);

    const jaipurOpp = opps.find((o) => o.locationId === "jaipur");
    expect(jaipurOpp?.type).toBe("HIGH_DEMAND_LOW_CAPACITY");

    const destRisk = risks.find((r) => r.locationId === "destination");
    expect(destRisk?.type).toBe("HIGH_TRAVEL_COST");
  });
});
