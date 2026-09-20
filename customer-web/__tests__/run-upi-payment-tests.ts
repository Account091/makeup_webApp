import { runUpiPaymentFlowTests } from './upi-payment-flow.test';

console.log('=== Running UPI QR Payment & HF Vision AI Verification Suite ===');
try {
  runUpiPaymentFlowTests();
  console.log('\nSummary: ALL UPI PAYMENT TESTS PASSED CLEANLY! ✅');
  process.exit(0);
} catch (err: any) {
  console.error('\nSummary: TEST FAILED:', err.message);
  process.exit(1);
}
