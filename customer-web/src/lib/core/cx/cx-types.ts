/**
 * V10.2 Customer Experience & Retention Intelligence Types
 */

export type LifecycleStage =
  | 'FIRST_CONTACT'
  | 'LEAD'
  | 'CONSULTATION'
  | 'QUOTE_SENT'
  | 'BOOKED'
  | 'CONFIRMED'
  | 'SERVICE_COMPLETED'
  | 'POST_SERVICE'
  | 'REPEAT_CUSTOMER'
  | 'LOYAL_CUSTOMER'
  | 'INACTIVE';

export interface CustomerLifecycleRecord {
  customerId: string;
  organizationId: string;
  lifecycleStage: LifecycleStage;
  lastActivityAt: string;
  nextRecommendedActionAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerJourneyEventType =
  | 'LEAD_CREATED'
  | 'CONSULTATION_COMPLETED'
  | 'QUOTE_SENT'
  | 'BOOKING_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'PAYMENT_COMPLETED'
  | 'SERVICE_COMPLETED'
  | 'REVIEW_SUBMITTED'
  | 'REFERRAL_CREATED'
  | 'REPEAT_BOOKING'
  | 'LOYALTY_EVENT';

export interface CustomerJourneyEvent {
  eventId: string;
  customerId: string;
  organizationId: string;
  eventType: CustomerJourneyEventType;
  entityType: string;
  entityId: string;
  timestamp: string;
  source: string;
}

export type CXHealthStatus = 'HEALTHY' | 'ATTENTION' | 'AT_RISK';

export interface CustomerExperienceProfile {
  customerId: string;
  organizationId: string;
  preferredServices: string[];
  preferredLocation?: string;
  bookingFrequencyDays?: number;
  averageBookingValue: number;
  lastBookingAt?: string;
  nextLikelyServiceWindow?: string;
  cxHealth: CXHealthStatus;
  loyaltyTier: string;
  totalReferralsCount: number;
  updatedAt: string;
}

export type CustomerCaseType =
  | 'COMPLAINT'
  | 'SERVICE_ISSUE'
  | 'PAYMENT_ISSUE'
  | 'BOOKING_ISSUE'
  | 'COMMUNICATION_ISSUE';

export interface CustomerCase {
  caseId: string;
  customerId: string;
  organizationId: string;
  type: CustomerCaseType;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  assignedTo?: string;
  openedAt: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  resolutionSummary?: string;
}

export interface CustomerRecommendation {
  recommendationId: string;
  customerId: string;
  organizationId: string;
  recommendationType: 'SERVICE' | 'PACKAGE' | 'CONTENT' | 'RE_ENGAGEMENT' | 'LOYALTY_REWARD';
  title: string;
  reason: string;
  confidence: number;
  source: 'DETERMINISTIC' | 'AI_ASSISTED';
  createdAt: string;
  expiresAt: string;
}

export type CustomerSegment =
  | 'NEW_CUSTOMER'
  | 'BRIDAL_CUSTOMER'
  | 'REPEAT_CUSTOMER'
  | 'HIGH_VALUE_CUSTOMER'
  | 'LOYALTY_CUSTOMER'
  | 'INACTIVE_CUSTOMER';
