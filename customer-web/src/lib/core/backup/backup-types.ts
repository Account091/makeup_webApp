/**
 * Backup & Disaster Recovery Domain Types — V9.2
 */

export type BackupStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'VERIFIED' | 'FAILED' | 'PARTIAL';
export type BackupCategory = 'DATA' | 'CONFIGURATION' | 'MEDIA' | 'AUDIT' | 'ANALYTICS';
export type MediaBackupPriority = 'CRITICAL' | 'IMPORTANT' | 'RECREATABLE';

export interface BackupPolicy {
  enabled: boolean;
  firestoreFrequency: 'HOURLY' | 'DAILY' | 'WEEKLY';
  storageFrequency: 'DAILY' | 'WEEKLY';
  configurationFrequency: 'DAILY' | 'WEEKLY';
  retentionDays: number;
  verificationEnabled: boolean;
}

export interface BackupManifest {
  backupId: string;
  type: 'DAILY' | 'WEEKLY' | 'MANUAL' | 'PRE_DEPLOY';
  startedAt: string;
  completedAt?: string;
  status: BackupStatus;
  collections: number;
  documents: number;
  mediaFiles: number;
  checksum: string;
  destination: 'GOOGLE_DRIVE' | 'LOCAL' | 'GITHUB';
  categories: BackupCategory[];
  verifiedAt?: string;
  financialReconciliation?: {
    paymentLedgerTotal: number;
    backupLedgerTotal: number;
    difference: number;
    commissionTotal: number;
    backupCommissionTotal: number;
  };
}

export interface StorageBackupManifest {
  manifestId: string;
  items: Array<{
    path: string;
    size: number;
    mimeType: string;
    hash: string;
    priority: MediaBackupPriority;
    createdAt: string;
  }>;
  totalSize: number;
  totalFiles: number;
  backedUpAt: string;
}

export type RecoveryScope = 'FULL' | 'COLLECTION' | 'DOCUMENT' | 'MEDIA' | 'CONFIGURATION';
export type RecoveryStatus = 'REQUESTED' | 'REVIEWED' | 'APPROVED' | 'RESTORING' | 'VALIDATING' | 'COMPLETED' | 'FAILED';

export interface RecoveryPlan {
  recoveryId: string;
  backupId: string;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  scope: RecoveryScope;
  targetCollections?: string[];
  targetDocumentIds?: string[];
  status: RecoveryStatus;
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;
  conflictsDetected: number;
}

export interface RecoveryTestReport {
  reportId: string;
  backupId: string;
  testStartedAt: string;
  testCompletedAt: string;
  documentsRestored: number;
  mediaRestored: number;
  reconciliationStatus: 'PASSED' | 'FAILED' | 'PARTIAL';
  failedChecks: string[];
  result: 'PASS' | 'FAIL';
}

export type BackupAlertType =
  | 'BACKUP_FAILED'
  | 'BACKUP_PARTIAL'
  | 'BACKUP_NOT_VERIFIED'
  | 'BACKUP_TOO_OLD'
  | 'RESTORE_FAILED'
  | 'RECONCILIATION_FAILED';

export interface BackupAlert {
  alertId: string;
  type: BackupAlertType;
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
}

export type BackupFreshness = 'HEALTHY' | 'WARNING' | 'CRITICAL';
