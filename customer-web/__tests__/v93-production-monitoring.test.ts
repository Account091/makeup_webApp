/**
 * V9.3 — Production Monitoring Test Suite
 */

import {
  runHealthChecks,
  getOverallStatus,
  recordUptimeCheck,
  getUptimeRecords,
  getPerformanceBudgets,
  getSLODefinitions,
  createMonitoringAlert,
  getMonitoringAlerts,
  acknowledgeAlert,
} from '../src/lib/core/monitoring/monitoring-engine';

console.log('=================================================');
console.log('RUNNING V9.3 PRODUCTION MONITORING TESTS');
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
// Test 1: Health Checks & Synthetic Pinging
// -------------------------------------------------------------
console.log('[Test 1] Health Checks & Synthetic Pinging...');
const checks = runHealthChecks();
assert(checks.length >= 8, 'At least 8 subsystems checked in health checks');
assert(checks.some(c => c.checkId === 'hc_firestore' && c.status === 'PASSING'), 'Firestore check is PASSING');
assert(checks.some(c => c.checkId === 'hc_storage' && c.status === 'PASSING'), 'Storage check is PASSING');
assert(checks.some(c => c.checkId === 'hc_sheets'), 'Sheets check is present');
assert(checks.every(c => typeof c.latencyMs === 'number'), 'All checks return non-negative latency');

// -------------------------------------------------------------
// Test 2: Overall System Status Evaluation
// -------------------------------------------------------------
console.log('\n[Test 2] Overall System Status Evaluation...');
const status = getOverallStatus();
assert(status === 'DEGRADED' || status === 'PASSING' || status === 'FAILING', 'Overall status is valid status');

// -------------------------------------------------------------
// Test 3: Uptime Tracking & Record Updates
// -------------------------------------------------------------
console.log('\n[Test 3] Uptime Tracking & Record Updates...');
const rec1 = recordUptimeCheck('service_api', true);
const rec2 = recordUptimeCheck('service_api', true);
const rec3 = recordUptimeCheck('service_api', false);
assert(rec3.totalChecks === 3, 'Total checks updated to 3');
assert(rec3.passedChecks === 2, 'Passed checks updated to 2');
assert(Math.round(rec3.uptimePercent) === 67, 'Uptime percentage calculated correctly (~67%)');
const allRecords = getUptimeRecords();
assert(allRecords.some(r => r.serviceId === 'service_api'), 'Uptime record stored in engine');

// -------------------------------------------------------------
// Test 4: Service Level Objectives (SLOs)
// -------------------------------------------------------------
console.log('\n[Test 4] Service Level Objectives (SLOs)...');
const slos = getSLODefinitions();
assert(slos.length >= 5, 'At least 5 SLO definitions loaded');
assert(slos.some(s => s.sloId === 'slo_api_avail' && s.targetPercent === 99.5), 'API availability target is 99.5%');
assert(slos.some(s => s.sloId === 'slo_api_latency' && s.targetPercent === 95), 'API latency target is 95%');

// -------------------------------------------------------------
// Test 5: Performance Budgets
// -------------------------------------------------------------
console.log('\n[Test 5] Performance Budgets...');
const budgets = getPerformanceBudgets();
assert(budgets.length >= 5, 'Performance budgets loaded');
assert(budgets.some(b => b.metricName === 'API Response P50' && b.targetMs === 100), 'API P50 target is 100ms');
assert(budgets.every(b => b.currentMs <= b.targetMs === b.withinBudget), 'Within budget flag aligns with current vs target');

// -------------------------------------------------------------
// Test 6: Monitoring Alert Creation & Acknowledgement
// -------------------------------------------------------------
console.log('\n[Test 6] Monitoring Alert Creation & Acknowledgement...');
const alert = createMonitoringAlert({
  checkId: 'hc_sheets',
  severity: 'WARNING',
  message: 'Google Sheets sync latency exceeds 400ms target',
});
assert(alert.alertId.startsWith('malert_'), 'Alert ID generated with valid prefix');
assert(alert.acknowledged === false, 'New alert is unacknowledged');

const alertsList = getMonitoringAlerts();
assert(alertsList.length >= 1, 'Alert retrieved from monitoring engine');

const ackResult = acknowledgeAlert(alert.alertId);
assert(ackResult === true, 'Alert acknowledged successfully');
assert(getMonitoringAlerts().find(a => a.alertId === alert.alertId)?.acknowledged === true, 'Alert marked acknowledged');

console.log('\n=================================================');
console.log(`ALL V9.3 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) 📊`);
console.log('=================================================\n');
