/**
 * V9.5 — Marketplace Fraud & Risk Hardening Test Suite
 */

import { evaluateRisk, getPendingRiskCases, resolveRiskCase } from '../src/lib/core/risk/risk-engine';

console.log('=================================================');
console.log('RUNNING V9.5 MARKETPLACE FRAUD & RISK TESTS');
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
// Test 1: Low-Risk Request Evaluation (ALLOW)
// -------------------------------------------------------------
console.log('[Test 1] Low-Risk Request Evaluation (ALLOW)...');
const lowRisk = evaluateRisk({
  actorUid: 'usr_clean_customer',
  actorRole: 'CUSTOMER',
  email: 'clean.customer@example.com',
  amount: 2500,
});
assert(lowRisk.riskScore === 0, 'Clean request returns 0 risk score');
assert(lowRisk.decision === 'ALLOW', 'Clean request gets ALLOW decision');
assert(lowRisk.requiresHumanReview === false, 'No human review required for clean request');

// -------------------------------------------------------------
// Test 2: Fake Account & Disposable Email Signals (REVIEW)
// -------------------------------------------------------------
console.log('\n[Test 2] Fake Account & Disposable Email Signals (REVIEW)...');
const medRisk = evaluateRisk({
  actorUid: 'usr_suspicious_1',
  actorRole: 'CUSTOMER',
  deviceId: 'dev_suspicious_multi_acc_99',
  email: 'test@tempmail.com',
  amount: 1500,
});
assert(medRisk.riskScore === 60, 'Score accumulated correctly (35 + 25 = 60)');
assert(medRisk.decision === 'REVIEW', 'Score 60 triggers REVIEW decision');
assert(medRisk.requiresHumanReview === true, 'Flagged request requires human review');
assert(medRisk.signals.length === 2, '2 signals collected');

// -------------------------------------------------------------
// Test 3: High-Risk Transaction & Settlement Fraud (HOLD / ESCALATE)
// -------------------------------------------------------------
console.log('\n[Test 3] High-Risk Transaction & Settlement Fraud (HOLD / ESCALATE)...');
const highRisk = evaluateRisk({
  actorUid: 'usr_bad_actor',
  actorRole: 'ARTIST',
  deviceId: 'dev_suspicious_multi_acc_88',
  bookingId: 'bk_fake_completion_001',
  amount: 75000,
});
assert(highRisk.riskScore === 100, 'Score capped at max 100 (35 + 60 + 40 = 135 -> 100)');
assert(highRisk.decision === 'ESCALATE', 'Score 100 triggers ESCALATE decision');
assert(highRisk.reasons.length >= 3, 'Multiple risk reasons recorded');

// -------------------------------------------------------------
// Test 4: Core Rule Verification — Engine non-destructiveness
// -------------------------------------------------------------
console.log('\n[Test 4] Core Rule Verification — Engine non-destructiveness...');
// Verify that evaluateRisk returns structured decision payload without mutating business state directly
assert(typeof highRisk.decision === 'string', 'Engine returns policy decision string');
assert(highRisk.decision !== 'CONFISCATE', 'Engine never returns autonomous confiscation action');
assert(highRisk.decision !== 'PERMANENT_SUSPEND', 'Engine never returns autonomous permanent suspension action');

// -------------------------------------------------------------
// Test 5: Human-in-the-Loop Review & Case Override Workflow
// -------------------------------------------------------------
console.log('\n[Test 5] Human-in-the-Loop Review & Case Override Workflow...');
const pendingCases = getPendingRiskCases();
assert(pendingCases.length >= 2, 'Pending risk cases created in engine');

const targetCase = pendingCases[0];
assert(targetCase.currentStatus === 'PENDING_REVIEW', 'Case status is PENDING_REVIEW');

const resolved = resolveRiskCase({
  caseId: targetCase.caseId,
  reviewerUid: 'usr_risk_officer_42',
  action: 'APPROVED',
  overrideDecision: 'ALLOW',
  notes: 'Verified ID document with customer via phone call. Legitimate booking.',
});

assert(resolved !== null, 'Case resolved successfully');
assert(resolved?.currentStatus === 'APPROVED', 'Case status updated to APPROVED');
assert(resolved?.assignedReviewerUid === 'usr_risk_officer_42', 'Reviewer UID recorded');
assert(resolved?.decisionOverride === 'ALLOW', 'Decision override recorded');
assert(resolved?.reviewNotes?.includes('Verified ID') === true, 'Audit notes saved');

console.log('\n=================================================');
console.log(`ALL V9.5 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) 🕵️‍♂️`);
console.log('=================================================\n');
