import { runCustomerFacingFeaturesAuditTests } from './customer-facing-features-audit.test';

console.log('=== Running Customer-Facing Features Audit Test Suite ===');
try {
  runCustomerFacingFeaturesAuditTests();
  console.log('\nSummary: ALL CUSTOMER AUDIT TESTS PASSED CLEANLY! ✅');
  process.exit(0);
} catch (err: any) {
  console.error('\nSummary: TEST FAILED:', err.message);
  process.exit(1);
}
