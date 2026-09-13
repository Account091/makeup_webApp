import { calculateLocationIntelligenceData } from "../src/lib/locations/location-kpi-engine";
import { calculateDistanceTravelFee, resolveRegionalServicePrice } from "../src/lib/locations/travel-pricing-engine";
import { createDestinationQuote } from "../src/lib/locations/destination-quote-engine";

describe("V7.0 Multi-City & Destination Intelligence Suite", () => {
  test("🗺️ Location Engine aggregates regional revenue and health scores", () => {
    const locData = calculateLocationIntelligenceData();

    expect(locData.dataAsOf).toBeDefined();
    expect(locData.summary.totalLocationsActive).toBe(4);
    expect(locData.summary.totalRegionalRevenue).toBeGreaterThan(0);
    expect(locData.profitability.length).toBe(4);
    expect(locData.healthScores.length).toBe(4);
  });

  test("🚗 Travel Pricing Engine calculates distance tiers & regional overrides", () => {
    const local = calculateDistanceTravelFee(15);
    expect(local.tier).toBe("LOCAL");
    expect(local.travelFee).toBe(0);

    const outstation = calculateDistanceTravelFee(150);
    expect(outstation.tier).toBe("OUTSTATION");
    expect(outstation.travelFee).toBeGreaterThan(5000);

    const regionalPrice = resolveRegionalServicePrice("royal-bridal", "jaipur", 25000);
    expect(regionalPrice).toBe(27000);
  });

  test("✈️ Destination Quote Engine generates authoritative quotes", () => {
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

    expect(quote.quoteId).toBeDefined();
    expect(quote.authoritativeTotal).toBeGreaterThan(30000);
    expect(quote.depositRequired).toBeGreaterThan(0);
    expect(quote.status).toBe("DRAFT_QUOTE");
  });
});
