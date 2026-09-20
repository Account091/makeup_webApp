/**
 * V10.1 — Business Automation & Workflow Orchestration Test Suite
 */

import { registerWorkflow, triggerWorkflowEvent, getWorkflowRuns } from '../src/lib/core/automation/workflow-engine';
import { canSendCommunication, checkRiskWorkflowProtection, validateFinancialWorkflowBoundary } from '../src/lib/core/automation/workflow-protection';

console.log('=================================================');
console.log('RUNNING V10.1 WORKFLOW ORCHESTRATION TESTS');
console.log('=================================================\n');

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
// Test 1: Workflow Registration & Event-Driven Execution
// -------------------------------------------------------------
console.log('[Test 1] Workflow Registration & Event-Driven Execution...');
const wf = registerWorkflow({
  name: 'Booking Confirmation Notification Workflow',
  description: 'Sends confirmation notification upon booking confirmation',
  scope: 'ORGANIZATION',
  organizationId: 'org_glam',
  triggerType: 'EVENT',
  triggerEvent: 'booking.confirmed',
  conditions: [{ field: 'depositPaid', operator: 'EQUALS', value: true }],
  steps: [
    { stepId: 'step_1', name: 'Send Customer Notification', type: 'SEND_NOTIFICATION', params: {} },
    { stepId: 'step_2', name: 'Create Followup Task', type: 'CREATE_TASK', params: {} },
  ],
  status: 'ACTIVE',
  version: 1,
  createdBy: 'usr_admin',
});

assert(wf.workflowId.startsWith('wf_'), 'Workflow registered with valid ID');
assert(wf.status === 'ACTIVE', 'Workflow registered in ACTIVE status');

// -------------------------------------------------------------
// Test 2: Event Idempotency & Condition Matching
// -------------------------------------------------------------
console.log('\n[Test 2] Event Idempotency & Condition Matching...');
const trigger1 = triggerWorkflowEvent({
  eventType: 'booking.confirmed',
  entityType: 'booking',
  entityId: 'bk_1001',
  entityVersion: 1,
  entityData: { depositPaid: true },
  actorRole: 'CUSTOMER',
  actorOrgId: 'org_glam',
});

assert(trigger1.triggeredRunsCount === 1, '1 workflow triggered for matching event and conditions');
assert(trigger1.skippedDuplicates === false, 'First event processing is not skipped');

const triggerDuplicate = triggerWorkflowEvent({
  eventType: 'booking.confirmed',
  entityType: 'booking',
  entityId: 'bk_1001',
  entityVersion: 1,
  entityData: { depositPaid: true },
  actorRole: 'CUSTOMER',
  actorOrgId: 'org_glam',
});

assert(triggerDuplicate.triggeredRunsCount === 0, '0 workflows triggered for duplicate event');
assert(triggerDuplicate.skippedDuplicates === true, 'Duplicate event safely skipped by event idempotency key');

// -------------------------------------------------------------
// Test 3: Dry-Run / Test Simulation Mode
// -------------------------------------------------------------
console.log('\n[Test 3] Dry-Run / Test Simulation Mode...');
const dryRunResult = triggerWorkflowEvent({
  eventType: 'booking.confirmed',
  entityType: 'booking',
  entityId: 'bk_1002',
  entityVersion: 1,
  entityData: { depositPaid: true },
  actorRole: 'CUSTOMER',
  actorOrgId: 'org_glam',
  dryRun: true,
});

assert(dryRunResult.triggeredRunsCount === 1, 'Dry-run evaluates matching workflow');
assert(dryRunResult.runs[0].status === 'COMPLETED', 'Dry-run completes without mutating active state');

// -------------------------------------------------------------
// Test 4: Action Authorization Guard & RBAC Policy
// -------------------------------------------------------------
console.log('\n[Test 4] Action Authorization Guard & RBAC Policy...');
const rbacWf = registerWorkflow({
  name: 'Privileged Financial Adjust Workflow',
  description: 'Attempts to call financial adjust function',
  scope: 'ORGANIZATION',
  organizationId: 'org_glam',
  triggerType: 'EVENT',
  triggerEvent: 'invoice.overdue',
  conditions: [],
  steps: [
    {
      stepId: 'step_priv',
      name: 'Call Financial Adjust',
      type: 'CALL_AUTHORIZED_FUNCTION',
      params: { requiredPermission: 'finance.adjust' },
    },
  ],
  status: 'ACTIVE',
  version: 1,
  createdBy: 'usr_admin',
});

const unauthTrigger = triggerWorkflowEvent({
  eventType: 'invoice.overdue',
  entityType: 'invoice',
  entityId: 'inv_5001',
  entityVersion: 1,
  entityData: {},
  actorRole: 'CUSTOMER', // CUSTOMER lacks finance.adjust
  actorOrgId: 'org_glam',
});

assert(unauthTrigger.runs[0].status === 'FAILED', 'Workflow execution FAILED due to unauthorized role');
assert(unauthTrigger.runs[0].failureCode?.includes('AUTHORIZATION_DENIED') === true, 'Authorization denied error logged');

// -------------------------------------------------------------
// Test 5: Risk Engine Integration & Protection
// -------------------------------------------------------------
console.log('\n[Test 5] Risk Engine Integration & Protection...');
const highRiskCheck = checkRiskWorkflowProtection({
  actorUid: 'usr_bad_actor',
  actorRole: 'CUSTOMER',
  amount: 80000,
  deviceId: 'dev_suspicious_multi_acc_99',
});

assert(highRiskCheck.canExecuteWorkflow === false, 'High risk request PAUSES workflow execution');
assert(highRiskCheck.riskDecision === 'ESCALATE' || highRiskCheck.riskDecision === 'HOLD', 'Risk decision triggers hold/escalate');

// -------------------------------------------------------------
// Test 6: Financial Boundary Safeguards
// -------------------------------------------------------------
console.log('\n[Test 6] Financial Boundary Safeguards...');
const directLedgerCheck = validateFinancialWorkflowBoundary({
  actionType: 'DIRECT_LEDGER_WRITE_ATTEMPT',
  usesAuthoritativeFunction: false,
});

assert(directLedgerCheck.valid === false, 'Direct ledger mutation from workflow step BLOCKED');
assert(directLedgerCheck.error?.includes('Financial Safety Violation') === true, 'Financial safety violation error returned');

// -------------------------------------------------------------
// Test 7: Communication Preference & Quiet Hours Enforcement
// -------------------------------------------------------------
console.log('\n[Test 7] Communication Preference & Quiet Hours Enforcement...');
const quietHoursCheck = canSendCommunication({
  userId: 'usr_cust_1',
  channel: 'WHATSAPP',
  prefs: { userId: 'usr_cust_1', whatsappEnabled: true, emailEnabled: true, fcmEnabled: true, quietHoursActive: true },
});
assert(quietHoursCheck.allowed === false, 'Communication BLOCKED during quiet hours');

const optOutCheck = canSendCommunication({
  userId: 'usr_cust_2',
  channel: 'WHATSAPP',
  prefs: { userId: 'usr_cust_2', whatsappEnabled: false, emailEnabled: true, fcmEnabled: true, quietHoursActive: false },
});
assert(optOutCheck.allowed === false, 'Communication BLOCKED when customer opts out of WhatsApp');

console.log('\n=================================================');
console.log(`ALL V10.1 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) ⚡🏆`);
console.log('=================================================\n');
