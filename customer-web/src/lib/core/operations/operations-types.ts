/**
 * V10.0 Production Operations & Continuous Improvement Types
 */

export type ChangeRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ChangeRequestStatus =
  | 'DRAFT'
  | 'REVIEW'
  | 'APPROVED'
  | 'DEPLOYING'
  | 'VERIFIED'
  | 'ROLLED_BACK'
  | 'REJECTED';

export interface ChangeRequest {
  changeId: string;
  title: string;
  description: string;
  category: string;
  riskLevel: ChangeRiskLevel;
  requestedBy: string;
  approvedBy?: string;
  affectedSystems: string[];
  testPlan: string;
  rollbackPlan: string;
  status: ChangeRequestStatus;
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
}

export type IncidentSeverity = 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4';

export type CustomerImpactLevel =
  | 'CUSTOMER_NONE'
  | 'CUSTOMER_PARTIAL'
  | 'CUSTOMER_MAJOR'
  | 'CUSTOMER_CRITICAL';

export interface PostIncidentReview {
  reviewId: string;
  incidentId: string;
  severity: IncidentSeverity;
  customerImpact: CustomerImpactLevel;
  rootCause: string;
  contributingFactors: string[];
  impactSummary: string;
  detectionGap: string;
  resolution: string;
  preventiveActions: string[];
  owner: string;
  dueDate: string;
  completedAt?: string;
  createdAt: string;
}

export type ReconciliationDiscrepancyType =
  | 'ORPHAN'
  | 'MISSING'
  | 'DUPLICATE'
  | 'MISMATCH'
  | 'INVALID_STATE';

export interface DataReconciliationResult {
  auditId: string;
  auditedAt: string;
  entitiesChecked: number;
  discrepanciesCount: number;
  discrepancies: {
    entityType: string;
    entityId: string;
    type: ReconciliationDiscrepancyType;
    details: string;
  }[];
  integrityScorePercent: number;
}

export interface ConfigurationDriftEvent {
  eventId: string;
  detectedAt: string;
  assetName: string;
  expectedConfigHash: string;
  actualConfigHash: string;
  driftDetails: string;
  severity: 'WARNING' | 'CRITICAL';
}

export interface ControlledDataRepairCase {
  caseId: string;
  issueDescription: string;
  proposedCorrection: string;
  approvedBy?: string;
  status: 'PROPOSED' | 'APPROVED' | 'EXECUTED' | 'REJECTED';
  executedAt?: string;
}
