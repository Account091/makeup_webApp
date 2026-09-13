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

export type CommissionBaseType =
  | "GROSS_AFTER_DISCOUNT"
  | "PRE_TAX_NET"
  | "SERVICE_ONLY"
  | "FULL_GROSS";

export type CommissionRecognitionEvent =
  | "PAYMENT_VERIFIED"
  | "BOOKING_CONFIRMED"
  | "EVENT_COMPLETED";

export interface CommissionRule {
  ruleId: string;
  category: "STANDARD" | "PREMIUM" | "PROMOTIONAL" | "SERVICE_SPECIFIC" | "ORGANIZATION_SPECIFIC";
  version: number;
  platformPercent: number; // e.g. 10
  gatewayPercent: number; // e.g. 2
  artistPercent: number; // e.g. 88
  commissionBaseType: CommissionBaseType;
  recognitionEvent: CommissionRecognitionEvent;
  organizationId?: string;
  serviceId?: string;
  active: boolean;
  effectiveFrom: string;
  effectiveUntil?: string;
}

export type CommissionTransactionType =
  | "EARNED"
  | "REVERSAL"
  | "REFUND"
  | "ADJUSTMENT"
  | "BONUS"
  | "PENALTY";

export interface CommissionTransaction {
  id: string;
  bookingId: string;
  organizationId: string;
  artistId: string;
  grossAmount: number;
  discountAmount: number;
  taxAmount: number;
  commissionBase: number;
  platformCommission: number;
  gatewayFee: number;
  artistShare: number;
  currency: string;
  ruleId: string;
  ruleVersion: number;
  transactionType: CommissionTransactionType;
  idempotencyKey: string;
  createdAt: string;
  requestId?: string;
  isReversal?: boolean;
  parentTransactionId?: string;
  overrideReason?: string;
  authorizedByUid?: string;
}

export interface ArtistEarningsTransaction {
  id: string;
  bookingId: string;
  commissionTransactionId: string;
  organizationId: string;
  artistId: string;
  grossAmount: number;
  netArtistShare: number;
  type: CommissionTransactionType;
  createdAt: string;
}

export interface ArtistEarningsAdjustment {
  adjustmentId: string;
  artistId: string;
  organizationId: string;
  type: "BONUS" | "INCENTIVE" | "PENALTY" | "MANUAL_ADJUSTMENT";
  amount: number;
  reason: string;
  authorizedByUid: string;
  createdAt: string;
}

export type SettlementCandidateStatus =
  | "READY_FOR_SETTLEMENT"
  | "HELD_FOR_DISPUTE"
  | "BELOW_MINIMUM_THRESHOLD"
  | "SETTLED";

export interface SettlementCandidate {
  candidateId: string;
  artistId: string;
  organizationId: string;
  availableAmount: number;
  heldAmount: number;
  eligibleAmount: number;
  currency: string;
  status: SettlementCandidateStatus;
  hasVerifiedPayment: boolean;
  hasCompletedEvent: boolean;
  hasNoOpenDisputes: boolean;
  meetsMinimumThreshold: boolean;
  updatedAt: string;
}

export interface CommissionReconciliationReport {
  bookingId: string;
  bookingTotal: number;
  paymentLedgerTotal: number;
  commissionBase: number;
  platformCommission: number;
  artistShare: number;
  reconciled: boolean;
  discrepancyAmount: number;
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

export type OrganizationPermission =
  | "bookings.read"
  | "bookings.create"
  | "bookings.update"
  | "payments.read"
  | "payments.verify"
  | "finance.read"
  | "finance.export"
  | "staff.manage"
  | "catalog.manage"
  | "content.manage"
  | "analytics.read"
  | "support.manage"
  | "settings.manage";

export type PlatformRole =
  | "PLATFORM_OWNER"
  | "PLATFORM_ADMIN"
  | "PLATFORM_SUPPORT"
  | "PLATFORM_FINANCE"
  | "PLATFORM_RISK";

export interface OrganizationSettings {
  organizationId: string;
  businessName: string;
  logoUrl: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  serviceLocations: string[];
  currency: string; // e.g. "INR"
  timezone: string; // e.g. "Asia/Kolkata"
  depositPercentDefault: number; // e.g. 30
  cancellationPolicyText: string;
  updatedAt: string;
}

export interface OrganizationPaymentSettings {
  organizationId: string;
  upiVpa: string; // e.g. "makeoversbyprachi@upi"
  accountHolderName: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  gstin?: string;
  manualUpiEnabled: boolean;
  gatewayEnabled: boolean;
  updatedAt: string;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

export interface OrganizationInvitation {
  invitationId: string;
  organizationId: string;
  inviteeEmail: string;
  assignedRole: OrganizationRole;
  status: InvitationStatus;
  invitedByUid: string;
  createdAt: string;
  expiresAt: string;
}

export interface OrganizationOnboardingChecklist {
  organizationId: string;
  profileComplete: boolean;
  servicesComplete: boolean;
  artistsComplete: boolean;
  calendarConfigured: boolean;
  paymentConfigured: boolean;
  verificationComplete: boolean;
  marketplaceReady: boolean;
  updatedAt: string;
}

export interface MarketplaceReadinessScore {
  organizationId: string;
  readinessScorePercent: number; // 0 - 100
  status: "READY" | "NEEDS_ATTENTION" | "INCOMPLETE";
  completedStepsCount: number;
  totalStepsCount: number;
  pendingItems: string[];
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

// ==========================================
// V8.3 SETTLEMENTS & PAYOUTS DOMAIN MODELS
// ==========================================

export type SettlementStatusV83 =
  | "CALCULATING"
  | "READY"
  | "APPROVED"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "ON_HOLD"
  | "CANCELLED"
  | "REVERSED";

export type SettlementPeriodCadence = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "MANUAL";

export interface SettlementPeriod {
  periodId: string;
  name: string;
  cadence: SettlementPeriodCadence;
  periodStart: string;
  periodEnd: string;
  timezone: string;
}

export interface Settlement {
  settlementId: string;
  organizationId: string;
  artistId: string;
  periodId: string;
  grossEarnings: number;
  adjustments: number;
  holds: number;
  eligibleAmount: number;
  payoutAmount: number;
  currency: string;
  status: SettlementStatusV83;
  preparedByUid?: string;
  approvedByUid?: string;
  payoutReference?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementItem {
  itemId: string;
  settlementId: string;
  artistEarningsTransactionId: string;
  bookingId: string;
  grossAmount: number;
  artistShare: number;
  adjustment: number;
  eligibleAmount: number;
}

export type HoldReason =
  | "OPEN_DISPUTE"
  | "REFUND_WINDOW"
  | "RISK_REVIEW"
  | "MISSING_BANK_DETAILS"
  | "COMPLIANCE_REVIEW"
  | "MANUAL_HOLD";

export interface SettlementHold {
  holdId: string;
  artistId: string;
  organizationId: string;
  bookingId?: string;
  amount: number;
  holdReason: HoldReason;
  createdByUid: string;
  createdAt: string;
  expiresAt?: string;
  releasedByUid?: string;
  releasedAt?: string;
  active: boolean;
}

export type PayoutMethod = "BANK_TRANSFER" | "UPI" | "MANUAL" | "FUTURE_PROVIDER";

export interface ArtistPayoutProfile {
  artistId: string;
  organizationId: string;
  payoutMethod: PayoutMethod;
  accountStatus: "VERIFIED" | "PENDING_VERIFICATION" | "UNVERIFIED" | "REJECTED";
  providerCustomerId?: string;
  providerAccountId?: string;
  maskedAccountReference: string;
  bankName?: string;
  ifscCode?: string;
  upiVpa?: string;
  verifiedAt?: string;
}

export type PayoutStatus =
  | "CREATED"
  | "PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REVERSED";

export interface Payout {
  payoutId: string;
  settlementId: string;
  organizationId: string;
  artistId: string;
  amount: number;
  currency: string;
  payoutMethod: PayoutMethod;
  providerId: string;
  idempotencyKey: string;
  status: PayoutStatus;
  payoutReference?: string;
  processedAt?: string;
  processedByUid?: string;
  failureReason?: string;
}

export interface PayoutTransaction {
  id: string;
  organizationId: string;
  artistId: string;
  settlementId: string;
  payoutId: string;
  amount: number;
  currency: string;
  transactionType: "PAYOUT" | "PAYOUT_REVERSAL" | "FEE";
  status: PayoutStatus;
  payoutReference?: string;
  createdAt: string;
}

export interface PayoutRules {
  minimumPayoutAmount: number;
  currency: string;
  autoApproveThreshold: number;
  dualControlRequired: boolean;
}

// ==========================================
// V8.4 TRUST, REVIEWS & VERIFICATION MODELS
// ==========================================

export type VerificationStatusV84 =
  | "UNVERIFIED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED"
  | "EXPIRED";

export type VerificationArea =
  | "IDENTITY"
  | "PROFESSIONAL_PROFILE"
  | "PORTFOLIO"
  | "SERVICE_INFORMATION"
  | "BUSINESS_ASSOCIATION";

export interface OrganizationVerificationRecord {
  id: string;
  organizationId: string;
  verificationType: "BUSINESS_TAX" | "IDENTITY_PORTFOLIO";
  status: VerificationStatusV84;
  submittedAt: string;
  reviewedAt?: string;
  reviewedByUid?: string;
  verificationVersion: number;
  expiryDate?: string;
  evidenceIds: string[];
}

export interface ArtistVerificationRecord {
  id: string;
  artistId: string;
  organizationId: string;
  verificationAreas: VerificationArea[];
  status: VerificationStatusV84;
  submittedAt: string;
  reviewedAt?: string;
  verifiedBadgeActive: boolean;
}

export interface VerificationEvidence {
  id: string;
  verificationId: string;
  type: string;
  storagePath: string;
  submittedAt: string;
  reviewedAt?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export type ReviewModerationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "FLAGGED"
  | "HIDDEN";

export type ReviewFlagReason =
  | "SPAM"
  | "ABUSE"
  | "PERSONAL_INFORMATION"
  | "FALSE_CLAIM"
  | "IRRELEVANT"
  | "THREAT"
  | "OTHER";

export interface MarketplaceReviewV84 {
  reviewId: string;
  bookingId: string;
  customerId: string;
  artistId: string;
  organizationId: string;
  rating: number; // 1 to 5
  qualityRating?: number;
  punctualityRating?: number;
  communicationRating?: number;
  professionalismRating?: number;
  reviewText: string;
  verifiedBooking: boolean;
  moderationStatus: ReviewModerationStatus;
  createdAt: string;
}

export interface ReviewFlag {
  flagId: string;
  reviewId: string;
  flaggedByUid: string;
  flagReason: ReviewFlagReason;
  notes?: string;
  createdAt: string;
}

export interface ReviewResponse {
  responseId: string;
  reviewId: string;
  organizationId: string;
  artistId: string;
  responseText: string;
  moderationStatus: ReviewModerationStatus;
  createdAt: string;
}

export interface TrustScoreRecordV84 {
  organizationId: string;
  artistId: string;
  overallTrustScore: number; // 0 - 100
  factors: {
    verificationScore: number; // 0-100
    completionRatePercent: number; // 0-100
    averageRating: number; // 1-5
    responseRatePercent: number; // 0-100
    cancellationRatePercent: number; // 0-100
  };
  badge: "VERIFIED_PRO" | "TOP_RATED" | "RISING_STAR" | "STANDARD";
  version: string;
  updatedAt: string;
}

export type TrustAlertType =
  | "RATING_DROP"
  | "CANCELLATION_SPIKE"
  | "COMPLAINT_SPIKE"
  | "REVIEW_FLAG_SPIKE"
  | "VERIFICATION_EXPIRING"
  | "RESPONSE_RATE_DROP"
  | "DISPUTE_SPIKE";

export interface TrustAlert {
  alertId: string;
  organizationId: string;
  artistId?: string;
  alertType: TrustAlertType;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
  resolved: boolean;
  createdAt: string;
}

export interface ProfileCompleteness {
  organizationId: string;
  artistId?: string;
  completenessPercent: number; // 0 - 100
  missingItems: string[];
  updatedAt: string;
}

// ===================================================
// V8.5 MARKETPLACE RANKING & DISCOVERY DOMAIN MODELS
// ===================================================

export interface MarketplaceSearchQueryV85 {
  locationId?: string;
  serviceCategory?: string;
  eventDate?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  verifiedOnly?: boolean;
  sort?: "RECOMMENDED" | "RATING_HIGH" | "PRICE_LOW" | "PRICE_HIGH" | "EXPERIENCE";
  page?: number;
  pageSize?: number;
}

export interface RankedListingResult {
  listing: MarketplaceListing;
  explanation: RankingExplanation;
}

export interface MarketplaceSearchResultV85 {
  query: MarketplaceSearchQueryV85;
  rankingVersion: string;
  totalEligibleCount: number;
  excludedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  results: RankedListingResult[];
}


export interface RankingWeightConfig {
  version: string;
  weights: {
    relevance: number; // e.g. 30
    availability: number; // e.g. 20
    trust: number; // e.g. 15
    rating: number; // e.g. 15
    responseRate: number; // e.g. 8
    completionRate: number; // e.g. 7
    locationMatch: number; // e.g. 5
  };
  minReviewThreshold: number; // Bayesian smoothing m factor (e.g. 5)
  newProviderBoostPercent: number; // Cold start boost (e.g. 10%)
  diversityOrgLimit: number; // Max listings per organization in top N (e.g. 2)
  active: boolean;
  updatedAt: string;
  updatedByUid?: string;
}

export interface RankingExplanation {
  listingId: string;
  artistId: string;
  organizationId: string;
  totalScore: number;
  breakdown: {
    relevanceScore: number;
    availabilityScore: number;
    trustScore: number;
    smoothedRatingScore: number;
    responseScore: number;
    completionScore: number;
    locationScore: number;
  };
  isPromoted: boolean;
  isNewProviderBoost: boolean;
}

export interface ListingPromotionRule {
  promotionId: string;
  listingId: string;
  organizationId: string;
  badgeLabel: string;
  priority: number;
  active: boolean;
  expiresAt: string;
}

export interface MarketplaceSearchAlert {
  alertId: string;
  customerId: string;
  locationId: string;
  serviceCategory: string;
  eventDate?: string;
  active: boolean;
  createdAt: string;
}

export interface CustomerPreferenceSignal {
  customerId: string;
  preferredServices: string[];
  preferredLocations: string[];
  preferredPriceRange: "BUDGET" | "MID" | "LUXURY" | "ALL";
  updatedAt: string;
}



