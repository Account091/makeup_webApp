import { runCustomerActionBoundaryTests } from './customer-action-boundary.test';

console.log('=== Running Customer Action Origin & Trust Boundary Test Runner ===');
try {
  runCustomerActionBoundaryTests();
  console.log('\nSummary: ALL CUSTOMER ACTION BOUNDARY TESTS PASSED CLEANLY! ✅');
  process.exit(0);
} catch (err: any) {
  console.error('\nSummary: TEST FAILED:', err.message);
  process.exit(1);
}
