import { LocationScoreRecord, LocationGrowthScoreRecord } from "./location-opt-types";

export function calculateLocationScores(): LocationScoreRecord[] {
  const scoringVersion = "1.0";

  return [
    {
      locationId: "jodhpur",
      locationName: "Jodhpur Flagship",
      overallScore: 88,
      scoringVersion,
      factors: {
        demandScore: 90,
        growthScore: 78,
        profitabilityScore: 95,
        capacityScore: 85,
        conversionScore: 88,
        satisfactionScore: 94,
        marketingRoiScore: 85,
      },
      classification: "EXCELLENT",
    },
    {
      locationId: "jaipur",
      locationName: "Jaipur Market",
      overallScore: 84,
      scoringVersion,
      factors: {
        demandScore: 92,
        growthScore: 95,
        profitabilityScore: 82,
        capacityScore: 70, // 89% utilization creates capacity pressure
        conversionScore: 80,
        satisfactionScore: 90,
        marketingRoiScore: 88,
      },
      classification: "HEALTHY",
    },
    {
      locationId: "udaipur",
      locationName: "Udaipur Market",
      overallScore: 78,
      scoringVersion,
      factors: {
        demandScore: 75,
        growthScore: 82,
        profitabilityScore: 80,
        capacityScore: 88,
        conversionScore: 72,
        satisfactionScore: 88,
        marketingRoiScore: 75,
      },
      classification: "HEALTHY",
    },
    {
      locationId: "destination",
      locationName: "Destination Weddings",
      overallScore: 86,
      scoringVersion,
      factors: {
        demandScore: 94,
        growthScore: 88,
        profitabilityScore: 80,
        capacityScore: 75,
        conversionScore: 85,
        satisfactionScore: 92,
        marketingRoiScore: 90,
      },
      classification: "EXCELLENT",
    },
  ];
}

export function calculateLocationGrowthScores(): LocationGrowthScoreRecord[] {
  return [
    {
      locationId: "jodhpur",
      locationName: "Jodhpur Flagship",
      bookingGrowthPercent: 11.2,
      leadGrowthPercent: 14.0,
      revenueGrowthPercent: 15.5,
      capacityHeadroomPercent: 29.0,
      growthStatus: "MODERATE",
    },
    {
      locationId: "jaipur",
      locationName: "Jaipur Market",
      bookingGrowthPercent: 26.4,
      leadGrowthPercent: 28.0,
      revenueGrowthPercent: 32.0,
      capacityHeadroomPercent: 11.0,
      growthStatus: "STRONG",
    },
    {
      locationId: "udaipur",
      locationName: "Udaipur Market",
      bookingGrowthPercent: 14.0,
      leadGrowthPercent: 16.5,
      revenueGrowthPercent: 18.0,
      capacityHeadroomPercent: 37.0,
      growthStatus: "MODERATE",
    },
    {
      locationId: "destination",
      locationName: "Destination Weddings",
      bookingGrowthPercent: 22.0,
      leadGrowthPercent: 25.0,
      revenueGrowthPercent: 28.5,
      capacityHeadroomPercent: 18.0,
      growthStatus: "STRONG",
    },
  ];
}
