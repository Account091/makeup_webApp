import { runLocalCertificationSuite } from './local-certification-emulator.test';

console.log('=== Running Local Certification Environment Test Suite ===');
runLocalCertificationSuite()
  .then(() => {
    console.log('\nSummary: ALL LOCAL CERTIFICATION EMULATOR TESTS PASSED CLEANLY! ✅');
    process.exit(0);
  })
  .catch((err: any) => {
    console.error('\nSummary: TEST FAILED:', err);
    process.exit(1);
  });
