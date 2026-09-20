import { runV108InventoryTests } from './v108-inventory-procurement.test';

console.log('=== Running V10.8 Inventory & Procurement Test Suite ===');
const results = runV108InventoryTests();

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
