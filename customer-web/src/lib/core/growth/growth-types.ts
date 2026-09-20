/**
 * V10.3 Growth, Marketing & Revenue Intelligence Types
 */

export type AcquisitionChannel =
  | 'ORGANIC_SEARCH'
  | 'PAID_SEARCH'
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'WHATSAPP'
  | 'REFERRAL'
  | 'DIRECT'
  | 'WEBSITE'
  | 'MARKETPLACE'
  | 'PARTNER'
  | 'OFFLINE'
  | 'OTHER';

export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ARCHIVED';

export interface CampaignRecord {
  campaignId: string;
  organizationId: string;
  name: string;
  objective: string;
  channels: AcquisitionChannel[];
  startAt: string;
  endAt?: string;
  budget: number;
  actualSpend: number;
  status: CampaignStatus;
  targetLocations: string[];
  targetServices: string[];
  createdBy: string;
  createdAt: string;
}

export interface CampaignPerformance {
  campaignId: string;
  visitsCount: number;
  leadsCount: number;
  qualifiedLeadsCount: number;
  bookingsCount: number;
  completedBookingsCount: number;
  revenueAttracted: number;
  revenueBooked: number;
  revenueCompleted: number; // Actual revenue from verified ledgers
}

export interface AttributionRecord {
  attributionId: string;
  entityId: string; // e.g. bookingId or leadId
  entityType: 'LEAD' | 'BOOKING' | 'REVENUE';
  channel: AcquisitionChannel;
  source: string;
  medium: string;
  campaignId?: string;
  contentId?: string;
  firstTouchAt: string;
  lastTouchAt: string;
  assistedChannels: AcquisitionChannel[];
}

export interface FunnelStageMetrics {
  visitors: number;
  leads: number;
  qualifiedLeads: number;
  consultations: number;
  quotes: number;
  bookings: number;
  confirmedBookings: number;
  completedBookings: number;
}

export interface GrowthExperiment {
  experimentId: string;
  name: string;
  hypothesis: string;
  controlVariant: string;
  testVariant: string;
  primaryMetric: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  sampleSize: number;
  resultStatus: 'INSUFFICIENT_DATA' | 'WINNER_TEST' | 'WINNER_CONTROL' | 'NO_STATISTICAL_DIFFERENCE';
  createdBy: string;
  createdAt: string;
}

export type CapacityGuardStatus = 'CAPACITY_OK' | 'CAPACITY_WARNING' | 'CAPACITY_CONSTRAINED';
