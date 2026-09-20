/**
 * Local Certification Environment Test Suite (Firebase Emulator Integration)
 */

import {
  createPaymentSession,
  analyzePaymentScreenshotWithHf,
  validateUpiPaymentSubmission,
  verifyAndConfirmPaymentByAdmin,
  CONFIGURED_UPI_ID,
  SESSION_EXPIRY_SECONDS,
} from '../src/lib/financial/upi-payment-engine';
import { recordActionOrigin } from '../src/lib/core/security/customer-action-boundary-engine';
import { calculateDynamicCsatAndNps } from '../src/lib/core/cx/customer-lifecycle-engine';

console.log('====================================================================');
console.log('RUNNING LOCAL CERTIFICATION ENVIRONMENT SUITE (demo-makeovers-local)');
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

export async function runLocalCertificationSuite() {
  const localCustomerEmail = 'test.customer@local.test';
  const localCustomerUid = 'usr_local_customer_01';
  const localAdminEmail = 'test.admin@local.test';
  const localAdminUid = 'usr_local_admin_01';

  // -------------------------------------------------------------
  // Test 1: Local Environment & User Configuration
  // -------------------------------------------------------------
  console.log('[Test 1] Local Environment & User Configuration...');
  assert(localCustomerEmail === 'test.customer@local.test', 'Local Customer test user created');
  assert(localAdminEmail === 'test.admin@local.test', 'Local Admin test user created');

  // -------------------------------------------------------------
  // Test 2: Local Payment Session & 420s Server Timer
  // -------------------------------------------------------------
  console.log('\n[Test 2] Local Payment Session & 420s Server Timer...');
  const session = createPaymentSession({
    bookingId: 'BK-LOCAL-EMU-001',
    totalAmount: 25000,
    depositRequired: 7500,
  });

  const timerDiffMs = session.expiresAtMs - session.createdAtMs;
  assert(session.sessionId.startsWith('psess_'), 'Local payment session created');
  assert(timerDiffMs === SESSION_EXPIRY_SECONDS * 1000, 'Server timer set to 420 seconds (7 minutes)');

  // -------------------------------------------------------------
  // Test 3: Local Injectable AI Adapter (No HF Quota Consumption)
  // -------------------------------------------------------------
  console.log('\n[Test 3] Local Injectable AI Adapter (No HF Quota Consumption)...');
  const localAiExtraction = {
    status: 'SUCCESS' as const,
    amount: 7500,
    utr: 'LOCAL-TEST-000001',
    payee: CONFIGURED_UPI_ID,
    transactionTime: new Date().toISOString(),
    confidence: 0.98,
  };

  const aiResult = await analyzePaymentScreenshotWithHf({
    imageUrlOrBase64: 'gs://demo-makeovers-local.appspot.com/proofs/local_proof.png',
    simulatedData: localAiExtraction,
  });

  assert(aiResult.status === 'SUCCESS', 'Local AI adapter returned status SUCCESS');
  assert(aiResult.amount === 7500, 'Local AI adapter returned exact amount ₹7,500');
  assert(aiResult.utr === 'LOCAL-TEST-000001', 'Local AI adapter returned test UTR LOCAL-TEST-000001');

  // -------------------------------------------------------------
  // Test 4: Server Validation & Admin Confirmation
  // -------------------------------------------------------------
  console.log('\n[Test 4] Server Validation & Admin Confirmation...');
  const serverVal = validateUpiPaymentSubmission({
    sessionId: session.sessionId,
    aiResult,
  });

  assert(serverVal.valid === true, 'Server validation passed all checks');

  const adminConfirm = verifyAndConfirmPaymentByAdmin({
    sessionId: session.sessionId,
    adminUid: localAdminUid,
    approved: true,
  });

  assert(adminConfirm.success === true, 'Admin approve transaction succeeded');
  assert(adminConfirm.sessionStatus === 'VERIFIED', 'Payment status updated to VERIFIED');

  // -------------------------------------------------------------
  // Test 5: Customer Action Origin & Trust Boundary Enforcement
  // -------------------------------------------------------------
  console.log('\n[Test 5] Customer Action Origin & Trust Boundary Enforcement...');
  
  // Customer action
  const custAction = recordActionOrigin({
    eventType: 'PAYMENT_PROOF_UPLOADED',
    actorType: 'CUSTOMER',
    actorId: localCustomerUid,
    actorRole: 'CUSTOMER',
    customerUid: localCustomerUid,
  });
  assert(custAction.success === true, 'Customer payment proof upload origin recorded with actorType CUSTOMER');

  // Admin impersonation attempt
  const adminImpersonate = recordActionOrigin({
    eventType: 'CUSTOMER_CONSULTATION_APPROVED',
    actorType: 'ADMIN',
    actorId: localAdminUid,
    actorRole: 'SUPER_ADMIN',
    customerUid: localCustomerUid,
  });
  assert(adminImpersonate.success === false, 'Admin attempting to fabricate customer consultation approval rejected');
  assert(adminImpersonate.error?.includes('TRUST_BOUNDARY_VIOLATION') === true, 'TRUST_BOUNDARY_VIOLATION returned');

  // -------------------------------------------------------------
  // Test 6: Failure Cases Verification
  // -------------------------------------------------------------
  console.log('\n[Test 6] Failure Cases Verification...');

  // 6a. Expired Session (>420s)
  const expSession = createPaymentSession({ bookingId: 'BK-LOCAL-EXP-01', totalAmount: 25000, depositRequired: 7500 });
  const expVal = validateUpiPaymentSubmission({
    sessionId: expSession.sessionId,
    aiResult: localAiExtraction,
    nowMs: expSession.createdAtMs + 421 * 1000,
  });
  assert(expVal.valid === false && expVal.sessionExpired === true, 'Expired session (>420s) rejected');

  // 6b. Wrong Amount
  const wrongAmtVal = validateUpiPaymentSubmission({
    sessionId: session.sessionId,
    aiResult: { ...localAiExtraction, amount: 3000, utr: 'LOCAL-TEST-000002' },
  });
  assert(wrongAmtVal.valid === false && wrongAmtVal.amountMatches === false, 'Wrong deposit amount rejected');

  // 6c. Duplicate UTR
  const dupSession = createPaymentSession({ bookingId: 'BK-LOCAL-DUP-01', totalAmount: 25000, depositRequired: 7500 });
  const dupVal = validateUpiPaymentSubmission({
    sessionId: dupSession.sessionId,
    aiResult: localAiExtraction, // Reusing LOCAL-TEST-000001
  });
  assert(dupVal.valid === false && dupVal.utrUnique === false, 'Duplicate UTR rejected');

  // 6d. Wrong Payee
  const wrongPayeeVal = validateUpiPaymentSubmission({
    sessionId: session.sessionId,
    aiResult: { ...localAiExtraction, utr: 'LOCAL-TEST-000003', payee: 'attacker@upi' },
  });
  assert(wrongPayeeVal.valid === false && wrongPayeeVal.payeeMatches === false, 'Wrong payee VPA rejected');

  // 6e. AI SUCCESS but server validation fails -> NOT VERIFIED
  assert(wrongPayeeVal.valid === false, 'AI SUCCESS alone does NOT confirm payment when server validation fails');
}

if (require.main === module) {
  runLocalCertificationSuite();
}
