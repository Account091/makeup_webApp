import { runCheckpoint1LiveUpiGateVerification } from './live-gate-checkpoint1-upi.test';

console.log('=== Running Checkpoint 1 — Live UPI Payment Gate Test Runner ===');
runCheckpoint1LiveUpiGateVerification()
  .then((res) => {
    if (res.passed) {
      console.log('\nSummary: CHECKPOINT 1 LIVE UPI PAYMENT GATE FULLY PASSED & CERTIFIED! 💳🏆');
      process.exit(0);
    } else {
      console.error('\nSummary: CHECKPOINT 1 VERIFICATION FAILED');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('\nSummary: UNEXPECTED FAILURE:', err);
    process.exit(1);
  });
