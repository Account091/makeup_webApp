/**
 * V10.7 Policy Boundaries, Security/Privacy Overrides & Snapshot Immutability Engine
 * 
 * CORE BOUNDARY RULES:
 * 1. Security & Privacy constraints are upper boundaries that OVERRIDE lower business policies (e.g. Marketing = ALLOW + Customer Privacy Opt-out = DENY => DENY).
 * 2. Tenant isolation: Organization-level policies must match target tenant/org context.
 * 3. Historical Transaction Protection: Policy changes apply only to future operations. Historical transaction snapshots remain immutable.
 */

import { PolicyEvaluationResult } from './policy-types';
import { evaluatePolicy } from './policy-evaluation-engine';

export interface GovernedOperationParams {
  policyId: string;
  context: {
    securityAuthorized: boolean;
    customerPrivacyOptOut?: boolean;
    organizationId?: string;
    targetTenantOrgId?: string;
    [key: string]: any;
  };
}

export interface FinalDecisionResult {
  allowed: boolean;
  finalDecision: 'ALLOW' | 'DENY' | 'HOLD' | 'REVIEW';
  reason: string;
  appliedPolicyVersionId: string;
  policySnapshot?: Record<string, any>;
  boundaryOverrideApplied: boolean;
}

export function evaluateGovernedOperation(params: GovernedOperationParams): FinalDecisionResult {
  // 1. Hard Security Boundary Check
  if (!params.context.securityAuthorized) {
    return {
      allowed: false,
      finalDecision: 'DENY',
      reason: 'SECURITY_BOUNDARY_OVERRIDE: Unauthorized by system security/RBAC rules',
      appliedPolicyVersionId: 'SECURITY_GUARD',
      boundaryOverrideApplied: true,
    };
  }

  // 2. Hard Privacy Boundary Check
  if (params.context.customerPrivacyOptOut) {
    return {
      allowed: false,
      finalDecision: 'DENY',
      reason: 'PRIVACY_BOUNDARY_OVERRIDE: Customer consent opt-out overrides policy ALLOW decision',
      appliedPolicyVersionId: 'PRIVACY_GUARD',
      boundaryOverrideApplied: true,
    };
  }

  // 3. Tenant Isolation Guard
  if (
    params.context.organizationId &&
    params.context.targetTenantOrgId &&
    params.context.organizationId !== params.context.targetTenantOrgId
  ) {
    return {
      allowed: false,
      finalDecision: 'DENY',
      reason: 'TENANT_ISOLATION_VIOLATION: Cross-tenant policy access denied',
      appliedPolicyVersionId: 'TENANT_GUARD',
      boundaryOverrideApplied: true,
    };
  }

  // 4. Standard Policy Evaluation
  const evalResult: PolicyEvaluationResult = evaluatePolicy({
    policyId: params.policyId,
    organizationId: params.context.organizationId,
    context: params.context,
  });

  return {
    allowed: evalResult.decision === 'ALLOW',
    finalDecision: evalResult.decision,
    reason: evalResult.matchedRules.join('; '),
    appliedPolicyVersionId: evalResult.versionId,
    policySnapshot: { ...evalResult.parameters },
    boundaryOverrideApplied: false,
  };
}

/**
 * Creates an immutable snapshot record for a transaction.
 */
export function createTransactionPolicySnapshot(params: {
  transactionId: string;
  policyId: string;
  versionId: string;
  parameters: Record<string, any>;
}): Readonly<{
  transactionId: string;
  policyId: string;
  versionId: string;
  snapshot: Record<string, any>;
  createdAt: string;
}> {
  return Object.freeze({
    transactionId: params.transactionId,
    policyId: params.policyId,
    versionId: params.versionId,
    snapshot: Object.freeze({ ...params.parameters }),
    createdAt: new Date().toISOString(),
  });
}
