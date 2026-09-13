import { TravelTier } from "./location-types";

export function calculateDistanceTravelFee(distanceKm: number): { tier: TravelTier; travelFee: number } {
  if (distanceKm <= 20) {
    return { tier: "LOCAL", travelFee: 0 };
  } else if (distanceKm <= 50) {
    return { tier: "TIER_1", travelFee: 2500 };
  } else if (distanceKm <= 100) {
    return { tier: "TIER_2", travelFee: 5000 };
  } else {
    const extraKm = distanceKm - 100;
    return { tier: "OUTSTATION", travelFee: 5000 + Math.round(extraKm * 25) };
  }
}

export function resolveRegionalServicePrice(serviceId: string, locationId: string, basePrice: number): number {
  const overrides: Record<string, Record<string, number>> = {
    "royal-bridal": {
      jodhpur: 25000,
      jaipur: 27000,
      udaipur: 28000,
      destination: 35000,
    },
    "pre-wedding-glam": {
      jodhpur: 15000,
      jaipur: 16500,
      udaipur: 18000,
      destination: 22000,
    },
  };

  if (overrides[serviceId] && overrides[serviceId][locationId]) {
    return overrides[serviceId][locationId];
  }
  return basePrice;
}
