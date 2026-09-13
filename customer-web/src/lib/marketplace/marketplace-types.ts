export type OrganizationType =
  | "ARTIST_BUSINESS"
  | "SALON"
  | "STUDIO"
  | "FREELANCE_ARTIST"
  | "AGENCY";

export type OrganizationStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

export interface Organization {
  organizationId: string;
  name: string;
  slug: string;
  type: OrganizationType;
  status: OrganizationStatus;
  verified: boolean;
  contactEmail: string;
  contactPhone: string;
  city: string;
  createdAt: string;
  updatedAt: string;
}

export type OrganizationRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "MAKEUP_ARTIST"
  | "HAIR_ARTIST"
  | "DRAPING_ARTIST"
  | "CONTENT_MANAGER"
  | "ACCOUNTANT"
  | "SUPPORT";

export interface OrganizationMembership {
  membershipId: string;
  organizationId: string;
  uid: string;
  role: OrganizationRole;
  status: "ACTIVE" | "REVOKED";
  createdAt: string;
}

export interface ArtistProfile {
  artistId: string;
  organizationId: string;
  displayName: string;
  slug: string;
  bio: string;
  specialties: ("BRIDAL" | "ENGAGEMENT" | "PARTY" | "HAIR" | "DRAPING" | "DESTINATION")[];
  serviceLocations: string[];
  experienceYears: number;
  status: "ACTIVE" | "PAUSED" | "SUSPENDED";
  verified: boolean;
  ratingSummary: number;
  reviewCount: number;
  portfolioUrls: string[];
}

export type ListingStatus = "DRAFT" | "PUBLISHED" | "PAUSED" | "SUSPENDED";

export interface MarketplaceListing {
  listingId: string;
  organizationId: string;
  artistId: string;
  serviceIds: string[];
  locationIds: string[];
  title: string;
  description: string;
  startingPrice: number;
  portfolioUrls: string[];
  ratingSummary: number;
  reviewCount: number;
  status: ListingStatus;
  createdAt: string;
}

export interface CommissionRule {
  ruleId: string;
  version: string;
  platformPercent: number; // e.g. 10
  gatewayPercent: number; // e.g. 2
  artistPercent: number; // e.g. 88
  active: boolean;
  effectiveFrom: string;
}

export interface CommissionTransaction {
  id: string;
  bookingId: string;
  organizationId: string;
  artistId: string;
  grossAmount: number;
  platformCommission: number;
  gatewayFee: number;
  artistShare: number;
  currency: string;
  ruleVersion: string;
  createdAt: string;
  isReversal?: boolean;
  parentTransactionId?: string;
}

export type SettlementStatus =
  | "CALCULATED"
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "REVERSED";

export interface ArtistSettlement {
  settlementId: string;
  organizationId: string;
  artistId: string;
  grossAmountTotal: number;
  platformCommissionTotal: number;
  gatewayFeeTotal: number;
  netArtistShareTotal: number;
  status: SettlementStatus;
  transactionCount: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  paidAt?: string;
}

export type VerificationStatus =
  | "UNVERIFIED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED";

export interface OrganizationVerification {
  id: string;
  organizationId: string;
  status: VerificationStatus;
  businessName: string;
  taxRegistrationNumber?: string;
  identityDocumentSubmitted: boolean;
  portfolioVerified: boolean;
  rejectionReason?: string;
  submittedAt: string;
  verifiedAt?: string;
}

export interface TrustScoreRecord {
  organizationId: string;
  artistId: string;
  overallTrustScore: number; // 0 - 100
  factors: {
    completedBookingsCount: number;
    cancellationRatePercent: number;
    responseRatePercent: number;
    ratingAverage: number;
    disputeCount: number;
    verificationBadgeBonus: number;
  };
  badge: "TOP_RATED" | "VERIFIED_PRO" | "RISING_STAR" | "STANDARD";
}

export interface MarketplaceReview {
  reviewId: string;
  bookingId: string;
  customerId: string;
  artistId: string;
  organizationId: string;
  rating: number; // 1 to 5
  reviewText: string;
  verifiedBooking: boolean;
  createdAt: string;
}

export interface CustomerFavorite {
  favoriteId: string;
  customerId: string;
  targetType: "ARTIST" | "SERVICE";
  targetId: string; // artistId or listingId
  createdAt: string;
}

export interface MarketplaceAuditEvent {
  id: string;
  organizationId: string;
  uid: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface MarketplaceSearchQuery {
  city?: string;
  serviceCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minExperience?: number;
  verifiedOnly?: boolean;
}
