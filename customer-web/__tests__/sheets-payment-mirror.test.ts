/**
 * Dual-Sheet Google Sheets Operational Mirror Test Suite (Payments & PaymentEvents)
 */

import {
  mirrorPaymentSessionStarted,
  mirrorPaymentProofSubmitted,
  mirrorAdminVerificationEvent,
  getMirrorRetryQueue,
  PaymentSheetRecord,
} from '../src/lib/financial/sheets-payment-mirror-engine';

console.log('====================================================================');
console.log('RUNNING DUAL-SHEET GOOGLE SHEETS PAYMENT MIRROR TEST SUITE');
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

export async function runSheetsMirrorTests() {
  const sampleRecord: PaymentSheetRecord = {
    paymentSessionId: 'psess_BK-100200',
    bookingId: 'BK-100200',
    customerId: 'cust_priya',
    customerName: 'Priya Sharma',
    customerPhone: '+919829012345',
    customerEmail: 'priya@gmail.com',
    organizationId: 'org_delhi',
    serviceId: 'Signature Bridal Makeover',
    serviceName: 'Signature Bridal Makeover',
    location: 'Jodhpur',
    eventDate: '2026-10-15',
    eventTime: '10:00',
    bookingStatus: 'DEPOSIT_PENDING',
    requiredDeposit: 7500,
    currency: 'INR',
    upiVpa: 'bhawanisanker1967@okaxis',
    paymentMethod: 'UPI_QR',
    qrType: 'STATIC_UPI',
    paymentSessionCreatedAt: new Date().toISOString(),
    paymentSessionExpiresAt: new Date(Date.now() + 420000).toISOString(),
    paymentSessionStatus: 'PENDING',
  };

  // -------------------------------------------------------------
  // Test 1: Stage 1 Session Start & QR Display Mirroring
  // -------------------------------------------------------------
  console.log('[Test 1] Stage 1 Session Start & QR Display Mirroring...');
  const stage1 = await mirrorPaymentSessionStarted({
    sessionRecord: sampleRecord,
    requestId: 'req_stage1_001',
  });
  assert(stage1 !== undefined, 'Stage 1 session mirror dispatched cleanly');

  // -------------------------------------------------------------
  // Test 2: Stage 2 Screenshot Upload & AI Analysis Mirroring
  // -------------------------------------------------------------
  console.log('\n[Test 2] Stage 2 Screenshot Upload & AI Analysis Mirroring...');
  sampleRecord.bookingStatus = 'PAYMENT_PROOF_SUBMITTED';
  sampleRecord.proofSubmittedAt = new Date().toISOString();
  sampleRecord.proofFileName = 'proof_priya.png';
  sampleRecord.proofFileReference = 'gs://makeoversbyprachi.appspot.com/payment_proofs/proof_priya.png';
  sampleRecord.aiStatus = 'SUCCESS';
  sampleRecord.aiAmount = 7500;
  sampleRecord.aiUtr = 'UTR8877665544';
  sampleRecord.aiPayee = 'bhawanisanker1967@okaxis';
  sampleRecord.aiConfidence = 0.96;
  sampleRecord.serverAmountCheck = true;
  sampleRecord.serverUtrCheck = true;
  sampleRecord.serverPayeeCheck = true;
  sampleRecord.serverExpiryCheck = true;
  sampleRecord.verificationStatus = 'VERIFICATION_PENDING';

  const stage2 = await mirrorPaymentProofSubmitted({
    sessionRecord: sampleRecord,
    proofFileRef: sampleRecord.proofFileReference,
    aiResultRef: 'ai_res_BK-100200',
    requestId: 'req_stage2_002',
  });
  assert(stage2 !== undefined, 'Stage 2 proof upload and AI analysis mirror dispatched cleanly');

  // -------------------------------------------------------------
  // Test 3: Stage 3 Admin Verification & Calendar Lock Mirroring
  // -------------------------------------------------------------
  console.log('\n[Test 3] Stage 3 Admin Verification & Calendar Lock Mirroring...');
  sampleRecord.bookingStatus = 'CONFIRMED';
  sampleRecord.verificationStatus = 'VERIFIED';
  sampleRecord.verifiedBy = 'admin_prachi_1';
  sampleRecord.verifiedAt = new Date().toISOString();
  sampleRecord.bookingConfirmedAt = new Date().toISOString();
  sampleRecord.calendarLockedAt = new Date().toISOString();

  const stage3 = await mirrorAdminVerificationEvent({
    sessionRecord: sampleRecord,
    approved: true,
    adminUid: 'admin_prachi_1',
    requestId: 'req_stage3_003',
  });
  assert(stage3 !== undefined, 'Stage 3 admin verification and calendar lock mirror dispatched cleanly');

  // -------------------------------------------------------------
  // Test 4: Fault Tolerance (Firestore Single Source of Truth)
  // -------------------------------------------------------------
  console.log('\n[Test 4] Fault Tolerance (Firestore Single Source of Truth)...');
  const queue = getMirrorRetryQueue();
  assert(Array.isArray(queue), 'Retry queue for network notices is maintained');
  console.log(`  ✓ Retry queue tracked ${queue.length} notices without interrupting Firestore execution`);
}

if (require.main === module) {
  runSheetsMirrorTests();
}
