/**
 * Core System Domain Types — V9.0 Reliability, Security & Observability Foundation
 */

export interface RequestContext {
  requestId: string;
  timestamp: string;
  actorUid?: string;
  actorRole?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CorrelationContext {
  requestId: string;
  bookingId?: string;
  paymentId?: string;
  customerId?: string;
  organizationId?: string;
  conversationId?: string;
  aiRequestId?: string;
}

export type AppErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'CONFLICT'
  | 'EXPIRED'
  | 'RATE_LIMITED'
  | 'DEPENDENCY_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export interface AppErrorOptions {
  code: AppErrorCode;
  message: string;
  httpStatus: number;
  requestId?: string;
  details?: Record<string, any>;
  internalDetails?: string; // Strictly omitted in client responses
}

export interface ErrorResponse {
  success: false;
  error: {
    code: AppErrorCode;
    message: string;
    requestId: string;
    timestamp: string;
    details?: Record<string, any>;
  };
}

export type RetryPolicyType =
  | 'NO_RETRY'
  | 'SAFE_RETRY'
  | 'RETRY_WITH_BACKOFF'
  | 'MANUAL_REVIEW';

export interface IdempotencyRecord {
  key: string;
  requestId: string;
  action: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  responsePayload?: any;
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
}

export type FailedEventStatus =
  | 'PENDING'
  | 'RETRYING'
  | 'FAILED'
  | 'MANUAL_REVIEW'
  | 'RESOLVED';

export interface FailedEventRecord {
  eventId: string;
  eventType: string;
  requestId: string;
  resourceId?: string;
  attemptCount: number;
  maxAttempts: number;
  lastErrorCode: string;
  lastErrorMessage: string;
  lastAttemptAt: string;
  nextRetryAt?: string;
  status: FailedEventStatus;
  payload: Record<string, any>;
}

export type DependencyHealthStatus =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'UNAVAILABLE'
  | 'NOT_CONFIGURED';

export type IntegrationVerificationLevel =
  | 'CODE_CONFIGURED'
  | 'INTEGRATION_TESTED'
  | 'SANDBOX_VERIFIED'
  | 'PRODUCTION_VERIFIED';

export interface DependencyStatus {
  serviceId: string;
  name: string;
  status: DependencyHealthStatus;
  verificationLevel: IntegrationVerificationLevel;
  latencyMs: number;
  lastCheckedAt: string;
  message?: string;
}

export interface SystemHealthOverview {
  overallStatus: DependencyHealthStatus;
  checkedAt: string;
  dependencies: DependencyStatus[];
  openIncidentsCount: number;
  failedEventsCount: number;
  maintenanceMode: boolean;
}

export interface AuditEventRecord {
  eventId: string;
  requestId: string;
  organizationId?: string;
  actorUid: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  result: 'SUCCESS' | 'FAILED' | 'DENIED';
  metadata?: Record<string, any>;
}

export type SecurityEventType =
  | 'AUTH_FAILURE'
  | 'FORBIDDEN_ACCESS'
  | 'TENANT_ACCESS_ATTEMPT'
  | 'RATE_LIMIT_TRIGGERED'
  | 'INVALID_WEBHOOK_SIGNATURE'
  | 'SUSPICIOUS_UPLOAD'
  | 'AI_TOOL_DENIED';

export interface SecurityEventRecord {
  eventId: string;
  eventType: SecurityEventType;
  requestId: string;
  actorUid?: string;
  ipAddress?: string;
  organizationId?: string;
  details: Record<string, any>;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RateLimitRecord {
  subject: string;
  endpoint: string;
  windowStart: string;
  count: number;
  limit: number;
  blocked: boolean;
}

export interface FileUploadPolicy {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  allowedExtensions: string[];
  restrictedPathPrefixes: string[];
}

export interface WebhookValidationResult {
  valid: boolean;
  providerEventId?: string;
  error?: string;
  isReplay?: boolean;
}

export type IncidentSeverity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';
export type IncidentStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'MITIGATED'
  | 'RESOLVED'
  | 'CLOSED';

export interface IncidentRecord {
  incidentId: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  summary: string;
  affectedServices: string[];
  startedAt: string;
  detectedAt: string;
  resolvedAt?: string;
  ownerUid?: string;
  requestIds: string[];
}

export interface SystemAlertRecord {
  alertId: string;
  alertType: string;
  severity: IncidentSeverity;
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
  details?: Record<string, any>;
}

export interface MaintenanceConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowedRoles: string[];
  updatedAt: string;
}

export interface FeatureKillSwitches {
  bookingEnabled: boolean;
  paymentProofEnabled: boolean;
  aiEnabled: boolean;
  whatsappEnabled: boolean;
  marketplaceEnabled: boolean;
  chatEnabled: boolean;
  updatedAt: string;
}

export type SheetsSyncStatus = 'SYNCED' | 'PENDING' | 'RETRYING' | 'FAILED';

export interface SheetsSyncMetrics {
  totalSynced: number;
  totalPending: number;
  totalFailed: number;
  lastSyncedAt: string;
}
