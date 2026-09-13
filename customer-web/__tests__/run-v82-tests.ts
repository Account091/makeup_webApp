import { runV82CommissionEngineTests } from './v82-commission-engine.test';

try {
  runV82CommissionEngineTests();
  process.exit(0);
} catch (error) {
  console.error('Test execution failed:', error);
  process.exit(1);
}
