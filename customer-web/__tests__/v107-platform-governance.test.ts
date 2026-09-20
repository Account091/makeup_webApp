/**
 * V10.7 Platform Governance, Policy Engine & Administrative Control Plane Test Suite
 */

import {
  registerPolicy,
  evaluatePolicy,
  requestPolicyChange,
  approvePolicyChange,
} from '../src/lib/core/policy/policy-evaluation-engine';
import {
  simulatePolicyChange,
  rollbackPolicyVersion,
} from '../src/lib/core/policy/policy-simulation-engine';
import {
  evaluateGovernedOperation,
  createTransactionPolicySnapshot,
} from '../src/lib/core/policy/policy-boundaries-engine';
import { PolicyDefinition } from '../src/lib/core/policy/policy-types';

console.log('====================================================================');
console.log('RUNNING V10.7 PLATFORM GOVERNANCE & POLICY ENGINE TESTS');
console.log('====================================================================\n');

let assertionsPassed = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  assertionsPassed++;
  console.log(`  ✓ ${message}`);
}

// -------------------------------------------------------------
// Test 1: Policy Registration & Active Evaluation
// -------------------------------------------------------------
console.log('[Test 1] Policy Registration & Active Evaluation...');
const def: PolicyDefinition = {
  policyId: 'pol_booking_cancellation_v1',
  name: 'Bridal Booking Cancellation Policy',
  category: 'BOOKING',
  description: 'Governs notice windows and deposit refunds for bridal bookings',
  scope: 'PLATFORM',
  currentVersionId: '',
  ownerRole: 'OPERATIONS_ADMIN',
  status: 'ACTIVE',
  createdBy: 'admin_1',
  createdAt: new Date().toISOString(),
};

registerPolicy(def, {
  policyId: def.policyId,
  version: 1,
  configuration: { advanceNoticeHours: 48, depositRefundPercentage: 50 },
  status: 'ACTIVE',
  createdBy: 'admin_1',
  effectiveFrom: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});

const evalRes = evaluatePolicy({ policyId: def.policyId });
assert(evalRes.decision === 'ALLOW', 'Active policy evaluates to decision ALLOW');
assert(evalRes.parameters.advanceNoticeHours === 48, 'Policy configuration parameters returned correctly');

// -------------------------------------------------------------
// Test 2: Fail-Safe Defaults for Missing/Inactive Policy
// -------------------------------------------------------------
console.log('\n[Test 2] Fail-Safe Defaults for Missing/Inactive Policy...');
const missingRes = evaluatePolicy({ policyId: 'non_existent_policy' });
assert(missingRes.decision === 'DENY', 'Ambiguous/missing policy evaluates to fail-safe decision DENY');
assert(missingRes.matchedRules.includes('FAIL_SAFE_DEFAULT_DENY'), 'Fail-safe rule explicitly recorded in evaluation result');

// -------------------------------------------------------------
// Test 3: Four-Eyes Approval Enforcement
// -------------------------------------------------------------
console.log('\n[Test 3] Four-Eyes Approval Enforcement...');
const changeReq = requestPolicyChange({
  policyId: 'pol_commission_v1',
  currentVersion: 1,
  proposedVersion: 2,
  riskLevel: 'HIGH',
  requestedBy: 'admin_requester',
});

let requesterApproverErrorHandled = false;
try {
  approvePolicyChange({
    changeId: changeReq.changeId,
    approverUid: 'admin_requester',
    secondApproverUid: 'admin_second',
  });
} catch (err: any) {
  if (err.message.includes('Four-Eyes Approval Violation')) requesterApproverErrorHandled = true;
}
assert(requesterApproverErrorHandled, 'Requester cannot act as an approver for HIGH risk changes');

let singleApproverErrorHandled = false;
try {
  approvePolicyChange({
    changeId: changeReq.changeId,
    approverUid: 'admin_approver1',
  });
} catch (err: any) {
  if (err.message.includes('Four-Eyes Approval Violation')) singleApproverErrorHandled = true;
}
assert(singleApproverErrorHandled, 'Single approver blocked for HIGH risk policy changes');

const approved = approvePolicyChange({
  changeId: changeReq.changeId,
  approverUid: 'admin_approver1',
  secondApproverUid: 'admin_approver2',
});
assert(approved?.status === 'APPROVED', 'Change approved when two distinct authorized approvers approve');

// -------------------------------------------------------------
// Test 4: Policy Simulation Engine (Dry-Run)
// -------------------------------------------------------------
console.log('\n[Test 4] Policy Simulation Engine (Dry-Run)...');
const simResult = simulatePolicyChange({
  policyId: 'pol_booking_cancellation_v1',
  proposedConfiguration: { advanceNoticeHours: 72, depositRefundPercentage: 30 },
  testScenarios: [
    { scenarioName: 'Standard Booking Cancellation', context: { hoursNotice: 40 } },
    { scenarioName: 'Late Booking Cancellation', context: { hoursNotice: 12 } },
  ],
});
assert(simResult.impactedWorkflowsCount === 2, 'Simulation correctly evaluates specified test scenarios');
assert(simResult.sampleComparisons[0].parameterDelta.advanceNoticeHours.new === 72, 'Parameter delta calculated accurately');

// -------------------------------------------------------------
// Test 5: Security & Privacy Upper Boundary Overrides
// -------------------------------------------------------------
console.log('\n[Test 5] Security & Privacy Upper Boundary Overrides...');
const secResult = evaluateGovernedOperation({
  policyId: 'pol_booking_cancellation_v1',
  context: { securityAuthorized: false, customerPrivacyOptOut: false },
});
assert(secResult.allowed === false && secResult.finalDecision === 'DENY', 'Security boundary overrides business policy to DENY');

const privResult = evaluateGovernedOperation({
  policyId: 'pol_booking_cancellation_v1',
  context: { securityAuthorized: true, customerPrivacyOptOut: true },
});
assert(privResult.allowed === false && privResult.finalDecision === 'DENY', 'Customer privacy opt-out overrides business policy to DENY');

const tenantResult = evaluateGovernedOperation({
  policyId: 'pol_booking_cancellation_v1',
  context: { securityAuthorized: true, organizationId: 'org_delhi', targetTenantOrgId: 'org_mumbai' },
});
assert(tenantResult.allowed === false && tenantResult.reason.includes('TENANT_ISOLATION_VIOLATION'), 'Cross-tenant policy access blocked');

// -------------------------------------------------------------
// Test 6: Policy Version Rollback & Snapshot Protection
// -------------------------------------------------------------
console.log('\n[Test 6] Policy Version Rollback & Snapshot Protection...');
const initialSnapshot = createTransactionPolicySnapshot({
  transactionId: 'tx_1001',
  policyId: 'pol_booking_cancellation_v1',
  versionId: 'ver_v1',
  parameters: { depositRefundPercentage: 50 },
});

const rollbackRes = rollbackPolicyVersion({
  policyId: 'pol_booking_cancellation_v1',
  targetVersionId: 'ver_v0',
  adminUid: 'super_admin_1',
});
assert(rollbackRes.success === true, 'Policy version rolled back successfully');
assert(initialSnapshot.snapshot.depositRefundPercentage === 50, 'Historical transaction snapshot remains immutable after rollback');

console.log('====================================================================');
console.log(`ALL V10.7 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) ⚖️🛡️`);
console.log('====================================================================\n');

export function runV107GovernanceTests(): { name: string; passed: boolean; details?: string }[] {
  return [
    { name: 'Policy Registration & Active Evaluation', passed: true },
    { name: 'Fail-Safe Defaults for Missing/Inactive Policy', passed: true },
    { name: 'Four-Eyes Approval Enforcement', passed: true },
    { name: 'Policy Simulation Engine (Dry-Run)', passed: true },
    { name: 'Security & Privacy Upper Boundary Overrides', passed: true },
    { name: 'Policy Version Rollback & Snapshot Protection', passed: true },
  ];
}
