/**
 * V10.2 — Customer Experience & Retention Intelligence Test Suite
 */

import { updateCustomerLifecycleStage, calculateCustomerExperienceHealth, resolveCustomerPreferences, calculateNextBestAction, getCustomerLifecycle } from '../src/lib/core/cx/customer-lifecycle-engine';
import { generateCustomerRecommendation, classifyCustomerSegment, getCustomerRecommendations } from '../src/lib/core/cx/cx-recommendations-engine';
import { createCustomerCase, recordFirstResponse, resolveCustomerCase, getCustomerCases } from '../src/lib/core/cx/cx-cases-engine';

console.log('=================================================');
console.log('RUNNING V10.2 CUSTOMER EXPERIENCE TESTS');
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
// Test 1: Customer Lifecycle Stage Updates & Retrieval
// -------------------------------------------------------------
console.log('[Test 1] Customer Lifecycle Stage Updates & Retrieval...');
const lc = updateCustomerLifecycleStage({
  customerId: 'cust_1001',
  organizationId: 'org_glam',
  stage: 'BOOKED',
});

assert(lc.customerId === 'cust_1001', 'Lifecycle record created for customer');
assert(lc.lifecycleStage === 'BOOKED', 'Lifecycle stage set to BOOKED');

const retrievedLc = getCustomerLifecycle('cust_1001');
assert(retrievedLc?.lifecycleStage === 'BOOKED', 'Retrieved lifecycle stage matches');

// -------------------------------------------------------------
// Test 2: Preference Resolver Hierarchy
// -------------------------------------------------------------
console.log('\n[Test 2] Preference Resolver Hierarchy...');
const explicitPref = resolveCustomerPreferences({
  explicitPreferences: { channel: 'EMAIL', location: 'Home' },
  storedApprovedPreferences: { channel: 'WHATSAPP', location: 'Studio' },
  behavioralInference: { channel: 'SMS', location: 'Studio' },
});
assert(explicitPref.preferredChannel === 'EMAIL', 'Explicit preference overrides stored & inferred preferences');
assert(explicitPref.source === 'EXPLICIT_CUSTOMER', 'Source identified as EXPLICIT_CUSTOMER');

const inferredPref = resolveCustomerPreferences({
  behavioralInference: { channel: 'WHATSAPP', location: 'Studio' },
});
assert(inferredPref.preferredChannel === 'WHATSAPP', 'Behavioral inference used when explicit is missing');
assert(inferredPref.source === 'BEHAVIORAL_INFERENCE', 'Source identified as BEHAVIORAL_INFERENCE');

// -------------------------------------------------------------
// Test 3: Customer Experience Health Classification
// -------------------------------------------------------------
console.log('\n[Test 3] Customer Experience Health Classification...');
const healthy = calculateCustomerExperienceHealth({ unansweredLead: false, delayedFollowup: false, serviceCancellation: false, hasUnresolvedComplaint: false });
assert(healthy === 'HEALTHY', 'Clean state evaluates to HEALTHY');

const attention = calculateCustomerExperienceHealth({ unansweredLead: true, delayedFollowup: false, serviceCancellation: false, hasUnresolvedComplaint: false });
assert(attention === 'ATTENTION', 'Unanswered lead evaluates to ATTENTION');

const atRisk = calculateCustomerExperienceHealth({ unansweredLead: false, delayedFollowup: false, serviceCancellation: true, hasUnresolvedComplaint: false });
assert(atRisk === 'AT_RISK', 'Service cancellation evaluates to AT_RISK');

// -------------------------------------------------------------
// Test 4: Next-Best-Action Engine
// -------------------------------------------------------------
console.log('\n[Test 4] Next-Best-Action Engine...');
const nbaCase = calculateNextBestAction({ stage: 'SERVICE_COMPLETED', cxHealth: 'HEALTHY', hasUnresolvedCase: true });
assert(nbaCase.nextAction === 'RESOLVE_CUSTOMER_CASE', 'Unresolved case triggers RESOLVE_CUSTOMER_CASE');
assert(nbaCase.priority === 'URGENT', 'Case resolution has URGENT priority');

const nbaNormal = calculateNextBestAction({ stage: 'SERVICE_COMPLETED', cxHealth: 'HEALTHY', hasUnresolvedCase: false });
assert(nbaNormal.nextAction === 'REQUEST_REVIEW_AND_THANK_YOU', 'Completed service triggers review request');

// -------------------------------------------------------------
// Test 5: Deterministic Recommendations & Segmentation
// -------------------------------------------------------------
console.log('\n[Test 5] Deterministic Recommendations & Segmentation...');
const bridalRec = generateCustomerRecommendation({ customerId: 'cust_1001', organizationId: 'org_glam', isBridalCustomer: true });
assert(bridalRec.recommendationType === 'PACKAGE', 'Bridal customer receives PACKAGE recommendation');
assert(bridalRec.source === 'DETERMINISTIC', 'Recommendation source is DETERMINISTIC');

const segment = classifyCustomerSegment({ isBridal: false, completedBookingsCount: 4, totalSpent: 60000, daysInactive: 10 });
assert(segment === 'HIGH_VALUE_CUSTOMER', 'High spend customer classified as HIGH_VALUE_CUSTOMER');

// -------------------------------------------------------------
// Test 6: Customer Case Management & SLA Resolution
// -------------------------------------------------------------
console.log('\n[Test 6] Customer Case Management & SLA Resolution...');
const cCase = createCustomerCase({ customerId: 'cust_1001', organizationId: 'org_glam', type: 'SERVICE_ISSUE', priority: 'HIGH' });
assert(cCase.status === 'OPEN', 'New customer case starts in OPEN status');

const respondedCase = recordFirstResponse(cCase.caseId, 'usr_support_rep_1');
assert(respondedCase?.status === 'IN_PROGRESS', 'Case transitions to IN_PROGRESS upon response');
assert(respondedCase?.firstResponseAt !== undefined, 'First response timestamp recorded');

const resolvedCase = resolveCustomerCase({ caseId: cCase.caseId, resolutionSummary: 'Offered complimentary touchup' });
assert(resolvedCase?.status === 'RESOLVED', 'Case status updated to RESOLVED');
assert(resolvedCase?.resolutionSummary === 'Offered complimentary touchup', 'Resolution summary recorded');

console.log('\n=================================================');
console.log(`ALL V10.2 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) 💖🏆`);
console.log('=================================================\n');
