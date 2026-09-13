import { calculateForecastingIntelligenceData } from "../src/lib/forecasting/forecasting-kpi-engine";
import { calculateArtistCapacity, calculateCityCapacity } from "../src/lib/forecasting/forecasting-capacity-engine";
import { generateForecastAlerts } from "../src/lib/forecasting/forecasting-alert-engine";

function runV64Tests() {
  console.log("=========================================");
  console.log("📈 Running V6.4 Forecasting Intelligence Test Suite");
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

  // 1. Time-Series Revenue & Demand Forecasting
  console.log("--- 1. Testing Revenue & Demand Forecasting Engine ---");
  const fData = calculateForecastingIntelligenceData();
  assert(!!fData.dataAsOf, "dataAsOf timestamp is defined");
  assert(fData.summary.next30DaysRevenue === 385000, `Next 30D revenue forecast is ₹${fData.summary.next30DaysRevenue} (Expected: ₹3,85,000)`);
  assert(fData.summary.next30DaysBookings === 18, `Next 30D bookings forecast is ${fData.summary.next30DaysBookings} (Expected: 18)`);
  assert(fData.revenueForecasts.length === 3, "Generated 7D, 30D, 90D revenue forecasts");
  assert(fData.revenueForecasts[1].classification === "FORECAST", "Revenue forecast properly classified as 'FORECAST'");

  // 2. Artist & City Capacity Engine
  console.log("\n--- 2. Testing Artist & City Capacity Engine ---");
  const artists = calculateArtistCapacity();
  assert(artists.length >= 3, `Artist count = ${artists.length} >= 3`);
  const prachi = artists.find((a) => a.artistId === "artist_prachi");
  assert(!!prachi, "Found capacity record for Master Artist Prachi");
  assert(prachi?.utilizationPercent === 93.75, `Prachi utilization is ${prachi?.utilizationPercent}% (Expected: 93.75%)`);
  assert(prachi?.status === "CAPACITY_RISK", "Prachi capacity status is 'CAPACITY_RISK'");

  const cities = calculateCityCapacity();
  const jaipur = cities.find((c) => c.city === "Jaipur");
  assert(jaipur?.capacityStatus === "CAPACITY_SHORTAGE", "Jaipur city status identified as 'CAPACITY_SHORTAGE'");

  // 3. Scenarios & Cash-Flow Projections
  console.log("\n--- 3. Testing Forecast Scenarios & Cash-Flow Projections ---");
  assert(fData.scenarios.conservative.revenue < fData.scenarios.base.revenue, "Conservative scenario revenue < Base scenario revenue");
  assert(fData.scenarios.optimistic.revenue > fData.scenarios.base.revenue, "Optimistic scenario revenue > Base scenario revenue");
  assert(fData.cashflowForecast.projectedNetCashflow === 250000, `Net projected cashflow is ₹${fData.cashflowForecast.projectedNetCashflow}`);

  // 4. Model Accuracy & Forecast Risk Alerts
  console.log("\n--- 4. Testing Model Accuracy & Forecast Risk Alerts ---");
  assert(fData.accuracy[0].accuracyScorePercent === 91.8, `Revenue forecast accuracy is ${fData.accuracy[0].accuracyScorePercent}%`);
  const alerts = generateForecastAlerts({ leadArtistUtilization: 93.8, jaipurShortfall: 3, cashflowNet: 250000 });
  assert(alerts.length >= 3, `Alerts generated count = ${alerts.length} >= 3`);
  const overloadAlert = alerts.find((a) => a.type === "ARTIST_OVERLOAD");
  assert(!!overloadAlert, "ARTIST_OVERLOAD alert generated for high utilization");
  assert(overloadAlert?.severity === "HIGH", `ARTIST_OVERLOAD severity is ${overloadAlert?.severity} (Expected: HIGH)`);

  console.log("\n=========================================");
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runV64Tests();
