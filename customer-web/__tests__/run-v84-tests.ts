import { runV84TrustReviewsTests } from './v84-trust-reviews.test';

try {
  runV84TrustReviewsTests();
  process.exit(0);
} catch (error) {
  console.error('Test execution failed:', error);
  process.exit(1);
}
