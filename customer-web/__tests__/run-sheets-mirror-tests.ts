import { runSheetsMirrorTests } from './sheets-payment-mirror.test';

console.log('=== Running Google Sheets Dual-Sheet Payment Mirror Suite ===');
runSheetsMirrorTests()
  .then(() => {
    console.log('\nSummary: ALL GOOGLE SHEETS MIRROR TESTS PASSED CLEANLY! ✅');
    process.exit(0);
  })
  .catch((err: any) => {
    console.error('\nSummary: TEST FAILED:', err.message);
    process.exit(1);
  });
