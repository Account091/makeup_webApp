import { calculateLocationIntelligenceData } from "../src/lib/locations/location-kpi-engine";
import { calculateDistanceTravelFee, resolveRegionalServicePrice } from "../src/lib/locations/travel-pricing-engine";
import { createDestinationQuote } from "../src/lib/locations/destination-quote-engine";

function runV70Tests() {
  console.log("=========================================");
  console.log("🗺️ Running V7.0 Multi-City & Destination Test Suite");
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

  // 1. Regional Location KPI Engine
  console.log("--- 1. Testing Regional Location KPI Engine ---");
  const locData = calculateLocationIntelligenceData();
  assert(!!locData.dataAsOf, "dataAsOf timestamp is defined");
  assert(locData.summary.totalLocationsActive === 4, `Active locations count = ${locData.summary.totalLocationsActive} (Expected: 4)`);
  assert(locData.summary.totalRegionalRevenue === 1275000, `Total regional revenue = ₹${locData.summary.totalRegionalRevenue} (Expected: ₹12,75,000)`);
  assert(locData.profitability.length === 4, "Profitability metrics generated for 4 hub markets");
  assert(locData.healthScores.length === 4, "Health scores generated for 4 hub markets");

  // 2. Distance & Regional Travel Pricing Engine
  console.log("\n--- 2. Testing Distance & Regional Travel Pricing Engine ---");
  const local = calculateDistanceTravelFee(15);
  assert(local.tier === "LOCAL", `Local distance tier is '${local.tier}' (Expected: 'LOCAL')`);
  assert(local.travelFee === 0, `Local travel fee is ₹${local.travelFee} (Expected: ₹0)`);

  const outstation = calculateDistanceTravelFee(150);
  assert(outstation.tier === "OUTSTATION", `Outstation tier is '${outstation.tier}' (Expected: 'OUTSTATION')`);
  assert(outstation.travelFee === 6250, `Outstation travel fee is ₹${outstation.travelFee} (Expected: ₹6,250)`);

  const regionalPrice = resolveRegionalServicePrice("royal-bridal", "jaipur", 25000);
  assert(regionalPrice === 27000, `Regional price override for Jaipur Royal Bridal is ₹${regionalPrice} (Expected: ₹27,000)`);

  // 3. Destination Wedding Quote Engine
  console.log("\n--- 3. Testing Destination Wedding Quote Engine ---");
  const quote = createDestinationQuote({
    brideName: "Priya Rathore",
    destinationCity: "Udaipur",
    venueAddress: "Taj Lake Palace",
    travelMode: "Flight",
    functions: [
      {
        functionName: "Wedding",
        eventDate: "2026-10-15",
        readyByTime: "14:00",
        venueName: "Palace Mandap",
        guestCount: 2,
        serviceId: "royal-bridal",
        assignedArtistIds: ["artist_prachi"],
      },
    ],
    artistCount: 2,
    requiresStay: true,
  });

  assert(!!quote.quoteId, "Destination quoteId is generated");
  assert(quote.destinationCity === "Udaipur", "Destination city is 'Udaipur'");
  assert(quote.travelFeeTotal === 24000, `Flight travel fee for 2 artists is ₹${quote.travelFeeTotal} (Expected: ₹24,000)`);
  assert(quote.authoritativeTotal > 30000, `Authoritative quote total is ₹${quote.authoritativeTotal} > ₹30,000`);
  assert(quote.depositRequired > 0, `Deposit required is ₹${quote.depositRequired} > ₹0`);
  assert(quote.status === "DRAFT_QUOTE", "Quote status is 'DRAFT_QUOTE'");

  console.log("\n=========================================");
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runV70Tests();
