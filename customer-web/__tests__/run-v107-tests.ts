import { runV107GovernanceTests } from './v107-platform-governance.test';

console.log('=== Running V10.7 Platform Governance Test Suite ===');
const results = runV107GovernanceTests();

let passed = 0;
let failed = 0;

for (const r of results) {
  if (r.passed) {
    console.log(`✅ [PASS] ${r.name}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${r.name}: ${r.details}`);
    failed++;
  }
}

console.log(`\nSummary: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
