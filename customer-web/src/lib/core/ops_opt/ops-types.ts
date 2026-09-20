/**
 * V10.4 Advanced Operations & Resource Optimization Types
 */

export type ResourceType = 'ARTIST' | 'STUDIO' | 'STATION' | 'EQUIPMENT' | 'TRAVEL';

export type ResourceCapacityStatus =
  | 'CAPACITY_AVAILABLE'
  | 'CAPACITY_TIGHT'
  | 'CAPACITY_CONSTRAINED'
  | 'CAPACITY_OVERLOADED';

export interface ResourceProfile {
  resourceId: string;
  organizationId: string;
  resourceType: ResourceType;
  name: string;
  skills: string[];
  location: string;
  serviceArea: string[];
  active: boolean;
}

export interface CandidateArtistRecommendation {
  artistId: string;
  artistName: string;
  fitScore: number; // 0 to 100
  reasons: string[];
  constraintsSatisfied: boolean;
  hardConstraintViolation?: string;
}

export type WaitlistStatus =
  | 'WAITING'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'FULFILLED';

export interface WaitlistEntry {
  waitlistId: string;
  customerId: string;
  organizationId: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  status: WaitlistStatus;
  createdAt: string;
}

export type OperationalReadinessStatus = 'READY' | 'ATTENTION_REQUIRED' | 'NOT_READY';

export interface BookingOperationalReadiness {
  bookingId: string;
  status: OperationalReadinessStatus;
  paymentVerified: boolean;
  calendarLocked: boolean;
  artistAssigned: boolean;
  travelConfirmed: boolean;
  documentsComplete: boolean;
  missingItems: string[];
}
