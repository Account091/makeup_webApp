/**
 * UPI QR Code Payment Flow, 7-Minute Server Timer & HF Vision AI Verification Test Suite
 */

import {
  createPaymentSession,
  getPaymentSession,
  analyzePaymentScreenshotWithHf,
  validateUpiPaymentSubmission,
  verifyAndConfirmPaymentByAdmin,
  CONFIGURED_UPI_ID,
  SESSION_EXPIRY_SECONDS,
} from '../src/lib/financial/upi-payment-engine';

console.log('====================================================================');
console.log('RUNNING UPI QR PAYMENT, 7-MIN TIMER & HF VISION AI TEST SUITE');
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

export function runUpiPaymentFlowTests() {
  // -------------------------------------------------------------
  // Test 1: Server-Authoritative 7-Minute Timer (420 Seconds) Creation
  // -------------------------------------------------------------
  console.log('[Test 1] 7-Minute Server-Authoritative Timer (420 Seconds)...');
  const session = createPaymentSession({
    bookingId: 'bkg_bridal_test_1',
    totalAmount: 25000,
    depositRequired: 7500,
  });

  assert(session.sessionId.startsWith('psess_'), 'Payment session created with valid prefix');
  assert(session.upiVpa === CONFIGURED_UPI_ID, `Configured UPI ID is '${CONFIGURED_UPI_ID}'`);
  assert(session.expiresAtMs - session.createdAtMs === SESSION_EXPIRY_SECONDS * 1000, 'Session expiry is set to exactly 420,000ms (7 minutes)');
  assert(session.status === 'PENDING', 'Initial payment session status is PENDING');

  // -------------------------------------------------------------
  // Test 2: Hugging Face Vision AI Screenshot Extraction
  // -------------------------------------------------------------
  console.log('\n[Test 2] Hugging Face Vision AI Screenshot Evidence Extraction...');
  const simulatedExtraction = {
    status: 'SUCCESS' as const,
    amount: 7500,
    utr: 'UTR9988776655',
    payee: CONFIGURED_UPI_ID,
    transactionTime: new Date().toISOString(),
    confidence: 0.96,
  };

  const aiResult = analyzePaymentScreenshotWithHf({
    imageUrlOrBase64: 'data:image/png;base64,sample_screenshot_data',
    simulatedData: simulatedExtraction,
  });

  aiResult.then((extracted) => {
    assert(extracted.status === 'SUCCESS', 'Vision AI extracted status SUCCESS');
    assert(extracted.amount === 7500, 'Vision AI extracted exact deposit amount ₹7,500');
    assert(extracted.utr === 'UTR9988776655', 'Vision AI extracted UTR number UTR9988776655');
    assert(extracted.payee === CONFIGURED_UPI_ID, 'Vision AI extracted payee UPI ID');
  });

  // -------------------------------------------------------------
  // Test 3: Deterministic Server Validation Checks
  // -------------------------------------------------------------
  console.log('\n[Test 3] Deterministic Server Validation Checks...');
  const valResult = validateUpiPaymentSubmission({
    sessionId: session.sessionId,
    aiResult: simulatedExtraction,
  });

  assert(valResult.valid === true, 'Valid submission passes all deterministic server checks');
  assert(valResult.sessionExpired === false, 'Session evaluated within 7-minute window');
  assert(valResult.amountMatches === true, 'Deposit amount matches session requirement');
  assert(valResult.utrUnique === true, 'UTR is unique and recorded');
  assert(valResult.payeeMatches === true, 'Payee matches configured UPI VPA');

  // -------------------------------------------------------------
  // Test 4: Duplicate UTR Detection
  // -------------------------------------------------------------
  console.log('\n[Test 4] Duplicate UTR Rejection...');
  const dupSession = createPaymentSession({
    bookingId: 'bkg_bridal_test_2',
    totalAmount: 25000,
    depositRequired: 7500,
  });

  const dupResult = validateUpiPaymentSubmission({
    sessionId: dupSession.sessionId,
    aiResult: simulatedExtraction, // Reusing UTR9988776655
  });

  assert(dupResult.valid === false, 'Duplicate UTR submission rejected');
  assert(dupResult.utrUnique === false, 'Duplicate UTR flagged');

  // -------------------------------------------------------------
  // Test 5: 7-Minute Timer Expiry Enforcement (Simulated 421s later)
  // -------------------------------------------------------------
  console.log('\n[Test 5] 7-Minute Timer Expiry Enforcement...');
  const expiredSession = createPaymentSession({
    bookingId: 'bkg_bridal_test_3',
    totalAmount: 25000,
    depositRequired: 7500,
  });

  const expiredTimeMs = expiredSession.createdAtMs + (SESSION_EXPIRY_SECONDS + 1) * 1000; // 421 seconds later
  const expiredValidation = validateUpiPaymentSubmission({
    sessionId: expiredSession.sessionId,
    aiResult: {
      status: 'SUCCESS',
      amount: 7500,
      utr: 'UTR1122334455',
      payee: CONFIGURED_UPI_ID,
      transactionTime: new Date().toISOString(),
      confidence: 0.95,
    },
    nowMs: expiredTimeMs,
  });

  assert(expiredValidation.valid === false, 'Submission after 7 minutes rejected');
  assert(expiredValidation.sessionExpired === true, 'Session marked as EXPIRED');

  // -------------------------------------------------------------
  // Test 6: Admin Verification as Final Authority
  // -------------------------------------------------------------
  console.log('\n[Test 6] Admin Verification as Final Authority...');
  const adminRes = verifyAndConfirmPaymentByAdmin({
    sessionId: session.sessionId,
    adminUid: 'admin_prachi_1',
    approved: true,
  });

  assert(adminRes.success === true, 'Admin verification succeeded');
  assert(adminRes.sessionStatus === 'VERIFIED', 'Payment status updated to VERIFIED');

  const updatedSession = getPaymentSession(session.sessionId);
  assert(updatedSession?.status === 'VERIFIED', 'Session status persisted as VERIFIED');
}

if (require.main === module) {
  runUpiPaymentFlowTests();
}
