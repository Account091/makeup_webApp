/**
 * Customer Action Origin & Trust Boundary Test Suite
 */

import {
  recordActionOrigin,
  getActionOriginsByCustomer,
} from '../src/lib/core/security/customer-action-boundary-engine';

console.log('====================================================================');
console.log('RUNNING CUSTOMER ACTION ORIGIN & TRUST BOUNDARY TEST SUITE');
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

export function runCustomerActionBoundaryTests() {
  const customerUid = 'usr_priya_sharma_99';

  // -------------------------------------------------------------
  // Test 1: Valid Customer-Originated Event Recording
  // -------------------------------------------------------------
  console.log('[Test 1] Valid Customer-Originated Event Recording...');
  const res1 = recordActionOrigin({
    eventType: 'SERVICE_AGREEMENT_ACCEPTED',
    actorType: 'CUSTOMER',
    actorId: customerUid,
    actorRole: 'CUSTOMER',
    customerUid: customerUid,
    payloadHash: 'hash_sha256_agreement_v1',
  });

  assert(res1.success === true, 'Customer agreement acceptance recorded successfully');
  assert(res1.record?.actorType === 'CUSTOMER', 'actorType recorded as CUSTOMER');
  assert(res1.record?.isCustomerOriginated === true, 'Flagged as customer-originated record');

  // -------------------------------------------------------------
  // Test 2: Admin Impersonation Rejection (Trust Boundary Guard)
  // -------------------------------------------------------------
  console.log('\n[Test 2] Admin Impersonation Rejection (Trust Boundary Guard)...');
  const res2 = recordActionOrigin({
    eventType: 'MEDIA_CONSENT_GRANTED',
    actorType: 'ADMIN',
    actorId: 'admin_prachi_1',
    actorRole: 'SUPER_ADMIN',
    customerUid: customerUid,
  });

  assert(res2.success === false, 'Admin attempting to fabricate customer media consent rejected');
  assert(res2.error?.includes('TRUST_BOUNDARY_VIOLATION') === true, 'TRUST_BOUNDARY_VIOLATION error returned');

  // -------------------------------------------------------------
  // Test 3: Customer Identity Mismatch Protection
  // -------------------------------------------------------------
  console.log('\n[Test 3] Customer Identity Mismatch Protection...');
  const res3 = recordActionOrigin({
    eventType: 'PAYMENT_PROOF_UPLOADED',
    actorType: 'CUSTOMER',
    actorId: 'usr_attacker_66', // Mismatched actor
    actorRole: 'CUSTOMER',
    customerUid: customerUid,
  });

  assert(res3.success === false, 'Identity mismatch between actorId and customerUid rejected');
  assert(res3.error?.includes('IDENTITY_MISMATCH') === true, 'IDENTITY_MISMATCH error returned');

  // -------------------------------------------------------------
  // Test 4: Valid Admin-Originated Operational Events
  // -------------------------------------------------------------
  console.log('\n[Test 4] Valid Admin-Originated Operational Events...');
  const res4 = recordActionOrigin({
    eventType: 'ADMIN_PAYMENT_VERIFIED',
    actorType: 'ADMIN',
    actorId: 'admin_prachi_1',
    actorRole: 'SUPER_ADMIN',
    customerUid: customerUid,
  });

  assert(res4.success === true, 'Admin operational payment verification event recorded successfully');
  assert(res4.record?.actorType === 'ADMIN', 'actorType recorded as ADMIN');
  assert(res4.record?.isCustomerOriginated === false, 'Correctly flagged as admin operational event');

  const history = getActionOriginsByCustomer(customerUid);
  assert(history.length === 2, 'Customer history contains 2 valid records (1 customer, 1 admin)');
}

if (require.main === module) {
  runCustomerActionBoundaryTests();
}
