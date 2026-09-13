import {
  LocationIntelligenceData,
  CanonicalLocation,
  RegionalPricingRule,
  LocationProfitabilityMetric,
  LocationHealthScore,
  LocationSeoData,
  LocationSummaryKPIs,
} from "./location-types";

export function calculateLocationIntelligenceData(): LocationIntelligenceData {
  const dataAsOf = new Date().toISOString();

  // 1. Canonical Locations
  const locations: CanonicalLocation[] = [
    {
      locationId: "jodhpur",
      name: "Jodhpur (Main Flagship Studio)",
      type: "CITY",
      active: true,
      currency: "INR",
      timezone: "Asia/Kolkata",
      cityTier: "FLAGSHIP",
      defaultBaseTravelFee: 0,
    },
    {
      locationId: "jaipur",
      name: "Jaipur (Pink City Studio Hub)",
      type: "CITY",
      active: true,
      currency: "INR",
      timezone: "Asia/Kolkata",
      cityTier: "TIER_1",
      defaultBaseTravelFee: 4000,
    },
    {
      locationId: "udaipur",
      name: "Udaipur (Lake City Studio Hub)",
      type: "CITY",
      active: true,
      currency: "INR",
      timezone: "Asia/Kolkata",
      cityTier: "TIER_1",
      defaultBaseTravelFee: 5000,
    },
    {
      locationId: "destination",
      name: "Destination & Outstation Weddings",
      type: "DESTINATION",
      active: true,
      currency: "INR",
      timezone: "Asia/Kolkata",
      cityTier: "OUTSTATION",
      defaultBaseTravelFee: 15000,
    },
  ];

  // 2. Regional Pricing Rules
  const regionalPricing: RegionalPricingRule[] = [
    {
      serviceId: "royal-bridal",
      serviceName: "Royal Bridal Package",
      basePrice: 25000,
      regionalPricing: { jodhpur: 25000, jaipur: 27000, udaipur: 28000, destination: 35000 },
      availableLocations: ["jodhpur", "jaipur", "udaipur", "destination"],
    },
    {
      serviceId: "pre-wedding-glam",
      serviceName: "Pre-Wedding & Engagement Look",
      basePrice: 15000,
      regionalPricing: { jodhpur: 15000, jaipur: 16500, udaipur: 18000, destination: 22000 },
      availableLocations: ["jodhpur", "jaipur", "udaipur", "destination"],
    },
  ];

  // 3. Location Profitability Metrics
  const profitability: LocationProfitabilityMetric[] = [
    {
      locationId: "jodhpur",
      locationName: "Jodhpur Flagship",
      totalBookings: 31,
      revenue: 420000,
      travelCost: 8000,
      artistPayout: 120000,
      accommodationCost: 0,
      netContribution: 292000,
      marginPercent: 69.5,
    },
    {
      locationId: "jaipur",
      locationName: "Jaipur Market",
      totalBookings: 14,
      revenue: 275000,
      travelCost: 26000,
      artistPayout: 67000,
      accommodationCost: 15000,
      netContribution: 167000,
      marginPercent: 60.7,
    },
    {
      locationId: "udaipur",
      locationName: "Udaipur Market",
      totalBookings: 9,
      revenue: 195000,
      travelCost: 18000,
      artistPayout: 48000,
      accommodationCost: 12000,
      netContribution: 117000,
      marginPercent: 60.0,
    },
    {
      locationId: "destination",
      locationName: "Destination Weddings",
      totalBookings: 11,
      revenue: 385000,
      travelCost: 52000,
      artistPayout: 98000,
      accommodationCost: 35000,
      netContribution: 200000,
      marginPercent: 51.9,
    },
  ];

  // 4. Location Health Scores
  const healthScores: LocationHealthScore[] = [
    {
      locationId: "jodhpur",
      locationName: "Jodhpur",
      healthScore: 95,
      demandStatus: "HIGH",
      capacityStatus: "BALANCED",
      profitabilityStatus: "HEALTHY",
      marketingStatus: "STABLE",
    },
    {
      locationId: "jaipur",
      locationName: "Jaipur",
      healthScore: 88,
      demandStatus: "HIGH",
      capacityStatus: "CAPACITY_SHORTAGE",
      profitabilityStatus: "HEALTHY",
      marketingStatus: "GROWING",
    },
    {
      locationId: "udaipur",
      locationName: "Udaipur",
      healthScore: 82,
      demandStatus: "MEDIUM",
      capacityStatus: "BALANCED",
      profitabilityStatus: "HEALTHY",
      marketingStatus: "GROWING",
    },
    {
      locationId: "destination",
      locationName: "Destination",
      healthScore: 90,
      demandStatus: "HIGH",
      capacityStatus: "CAPACITY_SHORTAGE",
      profitabilityStatus: "HEALTHY",
      marketingStatus: "GROWING",
    },
  ];

  // 5. Location SEO Metadata
  const seoData: LocationSeoData[] = [
    {
      locationId: "jodhpur",
      canonicalPath: "/jodhpur",
      titleTag: "Best Bridal Makeup Artist in Jodhpur | Makeovers by Prachi",
      metaDescription: "Book top luxury HD & Airbrush bridal makeup in Jodhpur at Makeovers by Prachi flagship studio.",
      heroHeader: "Luxury Bridal Makeup Studio in Shastri Nagar, Jodhpur",
      faqCount: 6,
      hasPhysicalStudio: true,
      addressString: "Shastri Nagar, Jodhpur, Rajasthan 342003",
    },
    {
      locationId: "jaipur",
      canonicalPath: "/jaipur",
      titleTag: "Top Bridal Makeup Artist in Jaipur | Makeovers by Prachi",
      metaDescription: "On-location luxury bridal makeup in Jaipur for palace weddings and regal brides.",
      heroHeader: "Royal Bridal Makeup Services in Pink City, Jaipur",
      faqCount: 5,
      hasPhysicalStudio: false,
      addressString: "On-Location / Hotel Service in C-Scheme, Jaipur",
    },
    {
      locationId: "udaipur",
      canonicalPath: "/udaipur",
      titleTag: "Destination Lake City Bridal Makeup Udaipur | Makeovers by Prachi",
      metaDescription: "Exquisite lakeside wedding bridal makeup team in Udaipur by Prachi.",
      heroHeader: "Lake City Bridal Makeup & Hair Styling in Udaipur",
      faqCount: 5,
      hasPhysicalStudio: false,
      addressString: "On-Location Service across Fateh Sagar & Lake City Resorst",
    },
    {
      locationId: "destination-weddings",
      canonicalPath: "/destination-weddings",
      titleTag: "Destination Wedding Bridal Makeup India | Makeovers by Prachi",
      metaDescription: "Full bridal team travel for heritage palace destination weddings across India.",
      heroHeader: "Destination Wedding Makeup & Multi-Function Styling",
      faqCount: 8,
      hasPhysicalStudio: false,
      addressString: "Travel Team Service (India & Global Outstation)",
    },
  ];

  const totalRegionalRevenue = profitability.reduce((acc, p) => acc + p.revenue, 0);
  const totalDestinationBookings = profitability.find((p) => p.locationId === "destination")?.totalBookings || 0;
  const destinationRevenue = profitability.find((p) => p.locationId === "destination")?.revenue || 0;
  const averageDestinationQuoteValue = totalDestinationBookings > 0 ? Math.round(destinationRevenue / totalDestinationBookings) : 0;

  const summary: LocationSummaryKPIs = {
    totalLocationsActive: locations.filter((l) => l.active).length,
    totalRegionalRevenue,
    totalDestinationBookings,
    averageDestinationQuoteValue,
    topPerformingLocation: "Jodhpur Flagship",
  };

  return {
    dataAsOf,
    summary,
    locations,
    regionalPricing,
    profitability,
    healthScores,
    seoData,
  };
}
