/**
 * V10.6 — Unified Business Intelligence & Executive Decision Support Test Suite
 */

import { getMetricDefinition, createClassifiedValue, reconcileMetricVsLedger } from '../src/lib/core/bi/metric-registry-engine';
import { forecastMetric, simulateExecutiveScenario, getExecutiveScenarios } from '../src/lib/core/bi/executive-forecasting-engine';
import { evaluateExecutiveAlert, buildEvidenceBasedAIAnswer, recordExecutiveDecision, generateImmutableReportSnapshot, getExecutiveAlerts } from '../src/lib/core/bi/executive-alerts-decision-engine';

console.log('=================================================');
console.log('RUNNING V10.6 UNIFIED BUSINESS INTELLIGENCE TESTS');
console.log('=================================================\n');

let assertionsPassed = 0;
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  assertionsPassed++;
  console.log(`  ✓ ${message}`);
}

// -------------------------------------------------------------
// Test 1: Metric Registry & Classification Enforcement
// -------------------------------------------------------------
console.log('[Test 1] Metric Registry & Classification Enforcement...');
const completedRevDef = getMetricDefinition('completedRevenue');
assert(completedRevDef?.classification === 'ACTUAL', 'Completed revenue classified as ACTUAL');

const confirmedValDef = getMetricDefinition('confirmedBookingValue');
assert(confirmedValDef?.classification === 'PROJECTED', 'Confirmed booking value classified as PROJECTED');

const expectedDemandDef = getMetricDefinition('expectedMonthlyDemand');
assert(expectedDemandDef?.classification === 'FORECAST', 'Expected demand classified as FORECAST');

const classifiedVal = createClassifiedValue({ value: 500000, classification: 'ACTUAL', period: '2026-09' });
assert(classifiedVal.value === 500000, 'Classified value set correctly');
assert(classifiedVal.classification === 'ACTUAL', 'Value classification preserved');

// -------------------------------------------------------------
// Test 2: Metric vs Ledger Financial Reconciliation
// -------------------------------------------------------------
console.log('\n[Test 2] Metric vs Ledger Financial Reconciliation...');
const cleanReconcile = reconcileMetricVsLedger({ metricValue: 500000, ledgerTotal: 500000 });
assert(cleanReconcile.reconciled === true, 'Matching totals evaluate to reconciled = true');
assert(cleanReconcile.variance === 0, 'Zero variance');

const varianceReconcile = reconcileMetricVsLedger({ metricValue: 520000, ledgerTotal: 500000 });
assert(varianceReconcile.reconciled === false, 'Mismatched totals evaluate to reconciled = false');
assert(varianceReconcile.variance === 20000, 'Variance calculated as ₹20,000');

// -------------------------------------------------------------
// Test 3: Executive Forecasting & Confidence Scoring
// -------------------------------------------------------------
console.log('\n[Test 3] Executive Forecasting & Confidence Scoring...');
const forecast = forecastMetric({
  metricId: 'monthlyRevenue',
  horizonDays: 30,
  historicalValues: [100000, 120000, 150000, 180000, 200000],
});

assert(forecast.forecastValue.classification === 'FORECAST', 'Forecast value explicitly classified as FORECAST');
assert(forecast.confidence === 'MEDIUM', '5 historical data points evaluate to MEDIUM confidence');
assert(forecast.historicalTrend.includes('UPWARD'), 'Upward historical trend detected');

// -------------------------------------------------------------
// Test 4: Scenario Planning Simulation
// -------------------------------------------------------------
console.log('\n[Test 4] Scenario Planning Simulation...');
const scenario = simulateExecutiveScenario({
  name: 'Optimistic Festive Growth Scenario',
  type: 'OPTIMISTIC',
  baseRevenue: 500000,
  baseBookings: 25,
  assumptions: {
    leadVolumeMultiplier: 1.2,
    conversionRateMultiplier: 1.1,
    averageValueMultiplier: 1.05,
  },
});

assert(scenario.scenarioId.startsWith('scen_'), 'Scenario created with valid ID');
assert(scenario.projectedRevenue.classification === 'PROJECTED', 'Scenario revenue classified as PROJECTED');
assert(scenario.projectedRevenue.value > 500000, 'Scenario projected revenue reflects multiplier increase');

// -------------------------------------------------------------
// Test 5: Executive Alerts & Fingerprint Deduplication
// -------------------------------------------------------------
console.log('\n[Test 5] Executive Alerts & Fingerprint Deduplication...');
const firstAlert = evaluateExecutiveAlert({
  metricId: 'leadConversionRate',
  currentValue: 12.4,
  thresholdValue: 18.0,
  comparisonPeriod: '2026-W37',
  severity: 'HIGH',
});

assert(firstAlert !== null, 'Alert generated when metric breaches threshold');
assert(firstAlert?.severity === 'HIGH', 'High severity alert recorded');

const duplicateAlert = evaluateExecutiveAlert({
  metricId: 'leadConversionRate',
  currentValue: 12.4,
  thresholdValue: 18.0,
  comparisonPeriod: '2026-W37',
  severity: 'HIGH',
});

assert(duplicateAlert === null, 'Duplicate alert suppressed by fingerprint deduplication');

// -------------------------------------------------------------
// Test 6: Evidence-Based AI Answer Builder
// -------------------------------------------------------------
console.log('\n[Test 6] Evidence-Based AI Answer Builder...');
const aiAnswer = buildEvidenceBasedAIAnswer({
  question: 'Why did booking conversion drop?',
  observedFact: 'Quote-to-booking conversion fell from 18% to 12%',
  inferredCause: 'Follow-up task completion rate decreased by 15%',
  possibleExplanation: 'High volume of inquiries overwhelmed current staff',
});

assert(aiAnswer.answer.includes('Observed Fact:'), 'Answer contains Observed Fact section');
assert(aiAnswer.answer.includes('Inferred Cause:'), 'Answer contains Inferred Cause section');
assert(aiAnswer.evidenceType === 'POSSIBLE', 'Evidence type correctly classified as POSSIBLE');

// -------------------------------------------------------------
// Test 7: Immutable Report Snapshotter & SHA-256 Checksum
// -------------------------------------------------------------
console.log('\n[Test 7] Immutable Report Snapshotter & SHA-256 Checksum...');
const snap = generateImmutableReportSnapshot({
  period: '2026-Q3',
  reportType: 'MONTHLY',
  reportContentString: '{"completedRevenue": 1500000, "totalBookings": 85}',
  generatedBy: 'usr_owner_prachi',
});

assert(snap.snapshotId.startsWith('snap_'), 'Snapshot created with valid ID');
assert(snap.reportChecksum.length === 64, 'SHA-256 report checksum length is 64 hex characters');

console.log('\n=================================================');
console.log(`ALL V10.6 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) 📊🏆`);
console.log('=================================================\n');
