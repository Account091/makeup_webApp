/**
 * V10.7 Platform Governance, Policy Engine & Control Plane Types
 */

export type PolicyCategory =
  | 'BOOKING'
  | 'PRICING'
  | 'PAYMENT'
  | 'FINANCE'
  | 'TAX'
  | 'CALENDAR'
  | 'OPERATIONS'
  | 'MARKETING'
  | 'COMMUNICATION'
  | 'CRM'
  | 'LOYALTY'
  | 'REFERRAL'
  | 'MARKETPLACE'
  | 'RISK'
  | 'PRIVACY'
  | 'SECURITY'
  | 'AI'
  | 'AUTOMATION'
  | 'DOCUMENT';

export type PolicyScope = 'PLATFORM' | 'ORGANIZATION' | 'LOCATION' | 'SERVICE';

export type PolicyStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'SCHEDULED' | 'PAUSED' | 'RETIRED';

export interface PolicyVersion {
  versionId: string;
  policyId: string;
  version: number;
  configuration: Record<string, any>;
  status: PolicyStatus;
  createdBy: string;
  approvedBy?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
}

export interface PolicyDefinition {
  policyId: string;
  name: string;
  category: PolicyCategory;
  description: string;
  scope: PolicyScope;
  organizationId?: string;
  currentVersionId: string;
  ownerRole: string;
  status: PolicyStatus;
  createdBy: string;
  createdAt: string;
}

export interface PolicyEvaluationResult {
  policyId: string;
  versionId: string;
  decision: 'ALLOW' | 'DENY' | 'HOLD' | 'REVIEW';
  parameters: Record<string, any>;
  matchedRules: string[];
  effectiveScope: PolicyScope;
  evaluatedAt: string;
}

export interface PolicyChangeRequest {
  changeId: string;
  policyId: string;
  currentVersion: number;
  proposedVersion: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  requestedBy: string;
  approvedBy?: string;
  secondApproverUid?: string; // Required for four-eyes approval on HIGH/CRITICAL changes
  createdAt: string;
}
