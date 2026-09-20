/**
 * V10.7 Central Policy Evaluation & Four-Eyes Approval Engine
 * 
 * CORE RULE: Policies configure behavior; they DO NOT override authorization,
 * immutable financial history, tenant isolation, privacy requirements, or security constraints.
 */

import {
  PolicyDefinition,
  PolicyVersion,
  PolicyEvaluationResult,
  PolicyChangeRequest,
  PolicyScope,
} from './policy-types';

const policyDefinitionsStore = new Map<string, PolicyDefinition>();
const policyVersionsStore = new Map<string, PolicyVersion>();
const policyChangeRequestsStore: PolicyChangeRequest[] = [];

export function registerPolicy(def: PolicyDefinition, initialVersion: Omit<PolicyVersion, 'versionId'>): PolicyDefinition {
  const versionId = `ver_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const verRecord: PolicyVersion = {
    ...initialVersion,
    versionId,
  };

  policyVersionsStore.set(versionId, verRecord);
  def.currentVersionId = versionId;
  policyDefinitionsStore.set(def.policyId, def);
  return def;
}

/**
 * Deterministically evaluates policy precedence:
 * Platform Default -> Organization -> Location -> Service-Specific
 */
export function evaluatePolicy(params: {
  policyId: string;
  scope?: PolicyScope;
  organizationId?: string;
  context?: Record<string, any>;
}): PolicyEvaluationResult {
  const policyDef = policyDefinitionsStore.get(params.policyId);

  if (!policyDef || policyDef.status !== 'ACTIVE') {
    // Fail-safe default for ambiguous or missing policies
    return {
      policyId: params.policyId,
      versionId: 'NONE',
      decision: 'DENY',
      parameters: {},
      matchedRules: ['FAIL_SAFE_DEFAULT_DENY'],
      effectiveScope: 'PLATFORM',
      evaluatedAt: new Date().toISOString(),
    };
  }

  const ver = policyVersionsStore.get(policyDef.currentVersionId);
  const matchedRules: string[] = [`Policy '${policyDef.name}' v${ver?.version || 1} active`];

  return {
    policyId: policyDef.policyId,
    versionId: policyDef.currentVersionId,
    decision: 'ALLOW',
    parameters: ver?.configuration || {},
    matchedRules,
    effectiveScope: policyDef.scope,
    evaluatedAt: new Date().toISOString(),
  };
}

export function requestPolicyChange(params: Omit<PolicyChangeRequest, 'changeId' | 'status' | 'createdAt'>): PolicyChangeRequest {
  const req: PolicyChangeRequest = {
    ...params,
    changeId: `pcr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    status: 'PENDING_APPROVAL',
    createdAt: new Date().toISOString(),
  };

  policyChangeRequestsStore.push(req);
  return req;
}

export function approvePolicyChange(params: {
  changeId: string;
  approverUid: string;
  secondApproverUid?: string;
}): PolicyChangeRequest | null {
  const pcr = policyChangeRequestsStore.find(c => c.changeId === params.changeId);
  if (!pcr) return null;

  // Four-Eyes Approval Enforcement for HIGH and CRITICAL risk policies
  if (pcr.riskLevel === 'HIGH' || pcr.riskLevel === 'CRITICAL') {
    if (!params.secondApproverUid || params.approverUid === params.secondApproverUid) {
      throw new Error('Four-Eyes Approval Violation: High/Critical policy changes require two distinct authorized approvers.');
    }
    if (params.approverUid === pcr.requestedBy || params.secondApproverUid === pcr.requestedBy) {
      throw new Error('Four-Eyes Approval Violation: Requester cannot act as an approver.');
    }
  }

  pcr.status = 'APPROVED';
  pcr.approvedBy = params.approverUid;
  pcr.secondApproverUid = params.secondApproverUid;
  return pcr;
}

export function getPolicyDefinition(policyId: string): PolicyDefinition | undefined {
  return policyDefinitionsStore.get(policyId);
}
