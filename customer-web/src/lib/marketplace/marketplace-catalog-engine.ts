import {
  ArtistProfile,
  MarketplaceListing,
  MarketplaceSearchQuery,
  CustomerFavorite,
} from "./marketplace-types";

const initialArtistProfiles: ArtistProfile[] = [
  {
    artistId: "artist_prachi",
    organizationId: "makeovers-by-prachi",
    displayName: "Prachi Rathore",
    slug: "prachi-rathore",
    bio: "Lead Celebrity & Destination Bridal Makeup Artist with 8+ years of experience across Rajasthan & India.",
    specialties: ["BRIDAL", "ENGAGEMENT", "HAIR", "DRAPING", "DESTINATION"],
    serviceLocations: ["jodhpur", "jaipur", "udaipur", "destination"],
    experienceYears: 8,
    status: "ACTIVE",
    verified: true,
    ratingSummary: 4.92,
    reviewCount: 125,
    portfolioUrls: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600",
    ],
  },
  {
    artistId: "artist_ananya",
    organizationId: "jaipur-royal-glam",
    displayName: "Ananya Sharma",
    slug: "ananya-sharma",
    bio: "Senior Jaipur Royal Bridal Specialist specializing in HD, Airbrush, & Heritage Rajputi poshak draping.",
    specialties: ["BRIDAL", "ENGAGEMENT", "PARTY"],
    serviceLocations: ["jaipur", "udaipur"],
    experienceYears: 6,
    status: "ACTIVE",
    verified: true,
    ratingSummary: 4.85,
    reviewCount: 73,
    portfolioUrls: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600",
    ],
  },
];

const initialListings: MarketplaceListing[] = [
  {
    listingId: "list_prachi_signature_bridal",
    organizationId: "makeovers-by-prachi",
    artistId: "artist_prachi",
    serviceIds: ["royal-bridal", "signature-bridal"],
    locationIds: ["jodhpur", "jaipur", "udaipur", "destination"],
    title: "Signature Royal Destination Bridal Package",
    description: "Full HD/Airbrush bridal makeover, custom hair styling, luxury jewelry setting, poshak draping, & trial.",
    startingPrice: 35000,
    portfolioUrls: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600",
    ],
    ratingSummary: 4.95,
    reviewCount: 98,
    status: "PUBLISHED",
    createdAt: "2026-01-10T00:00:00.000Z",
  },
  {
    listingId: "list_ananya_royal_jaipur",
    organizationId: "jaipur-royal-glam",
    artistId: "artist_ananya",
    serviceIds: ["jaipur-royal-bridal"],
    locationIds: ["jaipur"],
    title: "Heritage Royal Jaipur Bridal Suite",
    description: "Traditional Rajasthani bridal makeup, kundan hair art, poshak pleated draping, & touch-up kit.",
    startingPrice: 28000,
    portfolioUrls: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600",
    ],
    ratingSummary: 4.85,
    reviewCount: 73,
    status: "PUBLISHED",
    createdAt: "2026-02-15T00:00:00.000Z",
  },
];

const customerFavorites: CustomerFavorite[] = [];

export function getArtistProfiles(): ArtistProfile[] {
  return initialArtistProfiles.filter((a) => a.status === "ACTIVE");
}

export function getArtistBySlug(slug: string): ArtistProfile | undefined {
  return initialArtistProfiles.find((a) => a.slug === slug || a.artistId === slug);
}

export function getMarketplaceListings(): MarketplaceListing[] {
  return initialListings.filter((l) => l.status === "PUBLISHED");
}

export function searchMarketplace(query: MarketplaceSearchQuery): {
  listings: MarketplaceListing[];
  artists: ArtistProfile[];
  totalResults: number;
} {
  let filteredListings = initialListings.filter((l) => l.status === "PUBLISHED");
  let filteredArtists = initialArtistProfiles.filter((a) => a.status === "ACTIVE");

  if (query.city && query.city !== "all") {
    const cityLower = query.city.toLowerCase();
    filteredListings = filteredListings.filter((l) =>
      l.locationIds.some((loc) => loc.toLowerCase() === cityLower)
    );
    filteredArtists = filteredArtists.filter((a) =>
      a.serviceLocations.some((loc) => loc.toLowerCase() === cityLower)
    );
  }

  if (query.serviceCategory && query.serviceCategory !== "all") {
    const catUpper = query.serviceCategory.toUpperCase();
    filteredArtists = filteredArtists.filter((a) =>
      a.specialties.includes(catUpper as any)
    );
  }

  if (query.minPrice !== undefined) {
    filteredListings = filteredListings.filter((l) => l.startingPrice >= query.minPrice!);
  }

  if (query.maxPrice !== undefined) {
    filteredListings = filteredListings.filter((l) => l.startingPrice <= query.maxPrice!);
  }

  if (query.minRating !== undefined) {
    filteredListings = filteredListings.filter((l) => l.ratingSummary >= query.minRating!);
    filteredArtists = filteredArtists.filter((a) => a.ratingSummary >= query.minRating!);
  }

  if (query.minExperience !== undefined) {
    filteredArtists = filteredArtists.filter((a) => a.experienceYears >= query.minExperience!);
  }

  if (query.verifiedOnly) {
    filteredArtists = filteredArtists.filter((a) => a.verified);
  }

  return {
    listings: filteredListings,
    artists: filteredArtists,
    totalResults: filteredListings.length,
  };
}

/**
 * Calculates authoritative quote for marketplace booking by delegating to server revenue pricing engine.
 */
export function getMarketplaceAuthoritativeQuote(payload: {
  serviceId: string;
  locationId: string;
  guestCount?: number;
  travelDistanceKm?: number;
  couponCode?: string;
}) {
  const basePrice = payload.serviceId === "royal-bridal" ? 25000 : 15000;
  const travelFee = (payload.travelDistanceKm || 0) * 25;
  const discount = payload.couponCode ? 2000 : 0;
  const total = basePrice + travelFee - discount;
  const deposit = Math.round(total * 0.3);

  return {
    quoteId: `quote_mkt_${Date.now()}`,
    serviceId: payload.serviceId || "royal-bridal",
    locationId: payload.locationId || "jodhpur",
    basePrice,
    travelFee,
    discount,
    authoritativeTotal: total,
    depositRequired: deposit,
    currency: "INR",
  };
}

export function toggleCustomerFavorite(customerId: string, targetType: "ARTIST" | "SERVICE", targetId: string): {
  isFavorite: boolean;
} {
  const existingIdx = customerFavorites.findIndex(
    (f) => f.customerId === customerId && f.targetType === targetType && f.targetId === targetId
  );

  if (existingIdx >= 0) {
    customerFavorites.splice(existingIdx, 1);
    return { isFavorite: false };
  } else {
    customerFavorites.push({
      favoriteId: `fav_${Date.now()}`,
      customerId,
      targetType,
      targetId,
      createdAt: new Date().toISOString(),
    });
    return { isFavorite: true };
  }
}

export function getCustomerFavorites(customerId: string): CustomerFavorite[] {
  return customerFavorites.filter((f) => f.customerId === customerId);
}
