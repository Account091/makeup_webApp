/**
 * Privacy & Data Lifecycle Domain Types — V9.1
 */

export type DataClassificationLevel =
  | 'PUBLIC'
  | 'CUSTOMER_PRIVATE'
  | 'SENSITIVE'
  | 'FINANCIAL'
  | 'AUTHENTICATION'
  | 'INTERNAL';

export interface DataClassificationEntry {
  domain: string;
  classification: DataClassificationLevel;
  processingPurpose: string;
  retentionCategory: string;
}

export type ConsentCategory =
  | 'SERVICE_COMMUNICATION'
  | 'MARKETING_WHATSAPP'
  | 'MARKETING_EMAIL'
  | 'PORTFOLIO'
  | 'INSTAGRAM'
  | 'ADVERTISEMENT'
  | 'BEFORE_AFTER'
  | 'DATA_PROCESSING'
  | 'AI_ASSISTANCE';

export interface ConsentRecord {
  consentId: string;
  customerId: string;
  type: ConsentCategory;
  version: string;
  status: 'GRANTED' | 'REVOKED';
  grantedAt?: string;
  revokedAt?: string;
  source: 'CUSTOMER_PORTAL' | 'BOOKING_FLOW' | 'ADMIN' | 'API';
}

export interface MediaConsentMap {
  website: boolean;
  instagram: boolean;
  ads: boolean;
  beforeAfter: boolean;
  privateOnly: boolean;
}

export type PrivacyRequestType = 'ACCESS' | 'CORRECTION' | 'DELETE' | 'EXPORT' | 'RESTRICTION';
export type PrivacyRequestStatus =
  | 'SUBMITTED'
  | 'VERIFYING'
  | 'PROCESSING'
  | 'READY'
  | 'COMPLETED'
  | 'REJECTED';

export interface PrivacyDataRequest {
  requestId: string;
  customerId: string;
  type: PrivacyRequestType;
  status: PrivacyRequestStatus;
  submittedAt: string;
  verifiedAt?: string;
  processedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  timeline: Array<{ timestamp: string; action: string; detail: string }>;
}

export interface DataExportManifest {
  exportId: string;
  customerId: string;
  sections: string[];
  generatedAt: string;
  expiresAt: string;
  recordCount: number;
  secureUrl?: string;
}

export type DeletionEligibility = 'DELETABLE' | 'ANONYMIZABLE' | 'RETENTION_REQUIRED';

export interface DeletionPlanItem {
  domain: string;
  recordCount: number;
  eligibility: DeletionEligibility;
  reason: string;
}

export interface DeletionPlan {
  planId: string;
  customerId: string;
  items: DeletionPlanItem[];
  totalDeletable: number;
  totalAnonymizable: number;
  totalRetained: number;
  status: 'PLANNED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
}

export interface RetentionPolicy {
  policyId: string;
  category: string;
  retentionDays: number;
  action: 'DELETE' | 'ANONYMIZE' | 'ARCHIVE';
  legalHoldAllowed: boolean;
  active: boolean;
  version: string;
}

export type PrivacyAccessEventType =
  | 'DATA_EXPORT'
  | 'DATA_DELETE'
  | 'DATA_VIEW'
  | 'CONSENT_CHANGE'
  | 'MEDIA_ACCESS'
  | 'PAYMENT_PROOF_ACCESS'
  | 'DOCUMENT_ACCESS';

export interface PrivacyAccessEvent {
  eventId: string;
  eventType: PrivacyAccessEventType;
  uid: string;
  organizationId?: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  requestId: string;
  result: 'ALLOWED' | 'DENIED';
}

export type PrivacyIncidentType =
  | 'UNAUTHORIZED_ACCESS'
  | 'DATA_EXPOSURE'
  | 'WRONG_RECIPIENT'
  | 'PUBLIC_MEDIA_EXPOSURE'
  | 'DELETION_FAILURE'
  | 'EXPORT_FAILURE'
  | 'RETENTION_FAILURE';

export interface PrivacyIncident {
  incidentId: string;
  type: PrivacyIncidentType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED' | 'CLOSED';
  summary: string;
  affectedResource?: string;
  affectedOrganizationId?: string;
  affectedUserIds: string[];
  requestIds: string[];
  mitigation?: string;
  resolution?: string;
  detectedAt: string;
  resolvedAt?: string;
}

export interface PrivacyHealthStatus {
  openDataRequests: number;
  pendingDeletions: number;
  expiredRetentionJobs: number;
  consentIssues: number;
  publicMediaViolations: number;
  privacyIncidents: number;
  overallStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}
