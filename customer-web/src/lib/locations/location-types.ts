export type LocationType = "CITY" | "DESTINATION";

export interface CanonicalLocation {
  locationId: string; // "jodhpur", "jaipur", "udaipur", "destination"
  name: string;
  type: LocationType;
  active: boolean;
  currency: string;
  timezone: string;
  cityTier: "FLAGSHIP" | "TIER_1" | "TIER_2" | "OUTSTATION";
  defaultBaseTravelFee: number;
}

export interface RegionalPricingRule {
  serviceId: string;
  serviceName: string;
  basePrice: number;
  regionalPricing: Record<string, number>; // e.g. { jodhpur: 25000, jaipur: 27000, udaipur: 28000 }
  availableLocations: string[];
}

export type TravelTier = "LOCAL" | "TIER_1" | "TIER_2" | "TIER_3" | "OUTSTATION" | "DESTINATION" | "CUSTOM_QUOTE";

export interface DestinationFunctionItem {
  functionName: "Mehndi" | "Haldi" | "Sangeet" | "Wedding" | "Reception";
  eventDate: string;
  readyByTime: string;
  venueName: string;
  guestCount: number;
  serviceId: string;
  assignedArtistIds: string[];
}

export interface DestinationQuoteRequest {
  brideName: string;
  destinationCity: string;
  venueAddress: string;
  travelMode: "Flight" | "Train" | "Luxury Cab";
  functions: DestinationFunctionItem[];
  artistCount: number;
  requiresStay: boolean;
}

export interface DestinationQuoteResult {
  quoteId: string;
  brideName: string;
  destinationCity: string;
  serviceFeesTotal: number;
  artistFeesTotal: number;
  travelFeeTotal: number;
  accommodationFeeTotal: number;
  logisticsFeeTotal: number;
  taxAmount: number;
  discountAmount: number;
  authoritativeTotal: number;
  depositRequired: number;
  outstationBufferDays: number;
  status: "DRAFT_QUOTE" | "APPROVED" | "CONFIRMED";
  calculatedAt: string;
}

export interface LocationProfitabilityMetric {
  locationId: string;
  locationName: string;
  totalBookings: number;
  revenue: number;
  travelCost: number;
  artistPayout: number;
  accommodationCost: number;
  netContribution: number;
  marginPercent: number;
}

export interface LocationHealthScore {
  locationId: string;
  locationName: string;
  healthScore: number;
  demandStatus: "HIGH" | "MEDIUM" | "LOW";
  capacityStatus: "BALANCED" | "CAPACITY_SHORTAGE" | "SURPLUS";
  profitabilityStatus: "HEALTHY" | "MODERATE" | "LOW_MARGIN";
  marketingStatus: "GROWING" | "STABLE" | "DECLINING";
}

export interface LocationSeoData {
  locationId: string;
  canonicalPath: string; // "/jaipur", "/jodhpur", "/udaipur", "/destination-weddings"
  titleTag: string;
  metaDescription: string;
  heroHeader: string;
  faqCount: number;
  hasPhysicalStudio: boolean;
  addressString: string;
}

export interface LocationSummaryKPIs {
  totalLocationsActive: number;
  totalRegionalRevenue: number;
  totalDestinationBookings: number;
  averageDestinationQuoteValue: number;
  topPerformingLocation: string;
}

export interface LocationIntelligenceData {
  dataAsOf: string;
  summary: LocationSummaryKPIs;
  locations: CanonicalLocation[];
  regionalPricing: RegionalPricingRule[];
  profitability: LocationProfitabilityMetric[];
  healthScores: LocationHealthScore[];
  seoData: LocationSeoData[];
}
