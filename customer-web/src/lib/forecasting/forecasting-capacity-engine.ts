import {
  ArtistCapacityMetric,
  CityCapacityMetric,
  TravelCapacityRiskRecord,
  CalendarHeatmapDay,
} from "./forecasting-types";

export function calculateArtistCapacity(): ArtistCapacityMetric[] {
  const artists: ArtistCapacityMetric[] = [
    {
      artistId: "artist_prachi",
      artistName: "Prachi (Lead Bridal Master)",
      availableHours: 80,
      bookedHours: 61,
      forecastDemandHours: 14,
      travelHours: 12,
      utilizationPercent: 93.75,
      status: "CAPACITY_RISK",
    },
    {
      artistId: "artist_ananya",
      artistName: "Ananya (Senior Hair Stylist)",
      availableHours: 80,
      bookedHours: 48,
      forecastDemandHours: 16,
      travelHours: 8,
      utilizationPercent: 80.0,
      status: "OPTIMAL",
    },
    {
      artistId: "artist_rahul",
      artistName: "Rahul (Draping & Assistant)",
      availableHours: 80,
      bookedHours: 36,
      forecastDemandHours: 18,
      travelHours: 6,
      utilizationPercent: 67.5,
      status: "OPTIMAL",
    },
  ];

  return artists;
}

export function calculateCityCapacity(): CityCapacityMetric[] {
  return [
    {
      city: "Jaipur",
      projectedBookings: 11,
      availableCapacitySlots: 8,
      revenueProjected: 275000,
      capacityStatus: "CAPACITY_SHORTAGE",
    },
    {
      city: "Jodhpur",
      projectedBookings: 6,
      availableCapacitySlots: 8,
      revenueProjected: 150000,
      capacityStatus: "BALANCED",
    },
    {
      city: "Udaipur Destination",
      projectedBookings: 4,
      availableCapacitySlots: 5,
      revenueProjected: 180000,
      capacityStatus: "BALANCED",
    },
  ];
}

export function calculateTravelRisks(): TravelCapacityRiskRecord[] {
  return [
    {
      bookingId: "bk_destination_udr_99",
      customerName: "Sunita (Palace Wedding)",
      destinationCity: "Udaipur Destination",
      eventDate: "2026-09-27",
      travelBlockStart: "2026-09-26 14:00",
      travelBlockEnd: "2026-09-28 12:00",
      conflictRiskLevel: "HIGH",
      bufferNotes: "Overnight outstation travel creates a 48h block; overlaps with Sep 26 Jaipur inquiries.",
    },
  ];
}

export function generateCalendarHeatmap(): CalendarHeatmapDay[] {
  return [
    { date: "2026-09-20", dayOfWeek: "Sunday", demandLevel: "HIGH", bookedCount: 3, capacityLimit: 4 },
    { date: "2026-09-21", dayOfWeek: "Monday", demandLevel: "LOW", bookedCount: 1, capacityLimit: 4 },
    { date: "2026-09-22", dayOfWeek: "Tuesday", demandLevel: "MEDIUM", bookedCount: 2, capacityLimit: 4 },
    { date: "2026-09-23", dayOfWeek: "Wednesday", demandLevel: "LOW", bookedCount: 1, capacityLimit: 4 },
    { date: "2026-09-24", dayOfWeek: "Thursday", demandLevel: "HIGH", bookedCount: 3, capacityLimit: 4 },
    { date: "2026-09-25", dayOfWeek: "Friday", demandLevel: "VERY_HIGH", bookedCount: 4, capacityLimit: 4 },
    { date: "2026-09-26", dayOfWeek: "Saturday", demandLevel: "VERY_HIGH", bookedCount: 4, capacityLimit: 4 },
    { date: "2026-09-27", dayOfWeek: "Sunday", demandLevel: "VERY_HIGH", bookedCount: 4, capacityLimit: 4 },
  ];
}
