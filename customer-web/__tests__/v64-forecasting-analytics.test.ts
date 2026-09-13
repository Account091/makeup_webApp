import { calculateForecastingIntelligenceData } from "../src/lib/forecasting/forecasting-kpi-engine";
import { calculateArtistCapacity, calculateCityCapacity } from "../src/lib/forecasting/forecasting-capacity-engine";
import { generateForecastAlerts } from "../src/lib/forecasting/forecasting-alert-engine";

describe("V6.4 Forecasting & Capacity Intelligence Suite", () => {
  test("📈 Deterministic Time-Series Engine calculates revenue & demand forecasts", () => {
    const fData = calculateForecastingIntelligenceData();

    expect(fData.dataAsOf).toBeDefined();
    expect(fData.summary.next30DaysRevenue).toBeGreaterThan(0);
    expect(fData.summary.next30DaysBookings).toBeGreaterThan(0);
    expect(fData.revenueForecasts.length).toBe(3);
    expect(fData.revenueForecasts[1].classification).toBe("FORECAST");
  });

  test("🎨 Artist Capacity Engine calculates utilization & overflow risk", () => {
    const artists = calculateArtistCapacity();

    expect(artists.length).toBeGreaterThanOrEqual(3);
    const prachi = artists.find((a) => a.artistId === "artist_prachi");
    expect(prachi).toBeDefined();
    expect(prachi?.utilizationPercent).toBeGreaterThan(90);
    expect(prachi?.status).toBe("CAPACITY_RISK");
  });

  test("⚖️ Scenario & Cash-Flow Engine computes Conservative, Base & Optimistic scenarios", () => {
    const fData = calculateForecastingIntelligenceData();

    expect(fData.scenarios.conservative.revenue).toBeLessThan(fData.scenarios.base.revenue);
    expect(fData.scenarios.optimistic.revenue).toBeGreaterThan(fData.scenarios.base.revenue);
    expect(fData.cashflowForecast.projectedNetCashflow).toBeGreaterThan(0);
  });

  test("🚨 Forecast Alert Engine generates Capacity & Overload alerts", () => {
    const alerts = generateForecastAlerts({ leadArtistUtilization: 93.8, jaipurShortfall: 3, cashflowNet: 250000 });

    expect(alerts.length).toBeGreaterThanOrEqual(3);
    const overloadAlert = alerts.find((a) => a.type === "ARTIST_OVERLOAD");
    expect(overloadAlert).toBeDefined();
    expect(overloadAlert?.severity).toBe("HIGH");
  });
});
