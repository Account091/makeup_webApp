/**
 * V10.0 — Production Operations & Continuous Improvement Test Suite
 */

import { createChangeRequest, approveChangeRequest, advanceChangeStatus, getChangeRequests } from '../src/lib/core/operations/release-manager';
import { runDataConsistencyAudit, proposeDataRepair, approveAndExecuteDataRepair, getDataRepairCases } from '../src/lib/core/operations/data-reconciliation';
import { createPostIncidentReview, getPostIncidentReviews, OPERATIONAL_RUNBOOKS } from '../src/lib/core/operations/incident-ops';
import { checkConfigurationDrift, getProductionAssetInventory, getConfigurationDriftEvents } from '../src/lib/core/operations/config-drift';
import { evaluateProductionOperations } from '../src/lib/core/operations/v10-operations-engine';

console.log('=================================================');
console.log('RUNNING V10.0 PRODUCTION OPERATIONS TESTS');
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
// Test 1: Production Release Management & Risk Control
// -------------------------------------------------------------
console.log('[Test 1] Production Release Management & Risk Control...');
const change = createChangeRequest({
  title: 'Update Booking Pricing Engine Thresholds',
  description: 'Adjust deposit percentage for premium packages',
  category: 'PRICING_ENGINE',
  riskLevel: 'CRITICAL',
  requestedBy: 'usr_dev_1',
  affectedSystems: ['PricingEngine', 'BookingService', 'Ledger'],
  testPlan: 'Run V8.2 and V9.0 unit and integration tests',
  rollbackPlan: 'Revert pricing config to commit SHA v9.7-rc1',
});

assert(change.changeId.startsWith('change_'), 'Change request created with valid ID');
assert(change.status === 'DRAFT', 'New change request starts in DRAFT status');

// Self-approval for CRITICAL change should throw error
let caughtSelfApprove = false;
try {
  approveChangeRequest({ changeId: change.changeId, approverUid: 'usr_dev_1' });
} catch (err: any) {
  if (err.message.includes('Risk Policy Violation')) {
    caughtSelfApprove = true;
  }
}
assert(caughtSelfApprove === true, 'Self-approval for CRITICAL change strictly BLOCKED by risk policy');

const approvedChange = approveChangeRequest({ changeId: change.changeId, approverUid: 'usr_lead_admin_99' });
assert(approvedChange?.status === 'APPROVED', 'Independent approval granted by lead admin');

const deployingChange = advanceChangeStatus(change.changeId, 'DEPLOYING');
assert(deployingChange?.status === 'DEPLOYING', 'Change advanced to DEPLOYING');

const verifiedChange = advanceChangeStatus(change.changeId, 'VERIFIED');
assert(verifiedChange?.status === 'VERIFIED', 'Change advanced to VERIFIED');

// -------------------------------------------------------------
// Test 2: Data Reconciliation Audits & Controlled Repair Queue
// -------------------------------------------------------------
console.log('\n[Test 2] Data Reconciliation Audits & Controlled Repair Queue...');
const audit = runDataConsistencyAudit();
assert(audit.entitiesChecked >= 1000, 'Reconciliation audit scanned over 1000 entities');
assert(audit.integrityScorePercent === 100, 'Integrity score is 100%');
assert(audit.discrepanciesCount === 0, 'Zero discrepancies found');

const repair = proposeDataRepair({
  issueDescription: 'Calendar reservation timestamp mismatch',
  proposedCorrection: 'Realign reservation timestamp using reversal/correction model',
});
assert(repair.status === 'PROPOSED', 'Proposed repair case created');

const executedRepair = approveAndExecuteDataRepair({ caseId: repair.caseId, approverUid: 'usr_ops_admin' });
assert(executedRepair?.status === 'EXECUTED', 'Repair executed by authorized admin');
assert(executedRepair?.executedAt !== undefined, 'Execution timestamp recorded');

// -------------------------------------------------------------
// Test 3: Incident Operations, Runbooks & Severity Classification
// -------------------------------------------------------------
console.log('\n[Test 3] Incident Operations, Runbooks & Severity Classification...');
assert(OPERATIONAL_RUNBOOKS.PAYMENT_FAILURE.severity === 'SEV-1', 'Payment failure classified as SEV-1');
assert(OPERATIONAL_RUNBOOKS.WHATSAPP_OUTAGE.severity === 'SEV-2', 'WhatsApp outage classified as SEV-2');
assert(OPERATIONAL_RUNBOOKS.AI_OUTAGE.severity === 'SEV-3', 'AI outage classified as SEV-3');

const pir = createPostIncidentReview({
  incidentId: 'inc_9901',
  severity: 'SEV-1',
  customerImpact: 'CUSTOMER_PARTIAL',
  rootCause: 'Transient payment gateway timeout',
  contributingFactors: ['Upstream bank latency spike'],
  impactSummary: '3 deposit attempts required manual UTR verification',
  detectionGap: 'Alert threshold trigger delayed by 2 minutes',
  resolution: 'Switched to UTR manual fallback engine',
  preventiveActions: ['Lower payment alert trigger window to 1 minute'],
  owner: 'usr_risk_officer_1',
  dueDate: '2026-09-20',
});

assert(pir.reviewId.startsWith('pir_'), 'PIR created with valid prefix');
assert(pir.customerImpact === 'CUSTOMER_PARTIAL', 'Customer impact level recorded');

// -------------------------------------------------------------
// Test 4: Configuration Drift Detection & Asset Inventory
// -------------------------------------------------------------
console.log('\n[Test 4] Configuration Drift Detection & Asset Inventory...');
const assets = getProductionAssetInventory();
assert(assets.length >= 4, 'Production asset inventory tracks core infrastructure assets');
assert(assets.some(a => a.name === 'makeoversbyprachi.com'), 'Main domain asset tracked in inventory');

const noDrift = checkConfigurationDrift({
  assetName: 'makeup-webapp-prod',
  expectedHash: 'hash_abc123',
  actualHash: 'hash_abc123',
});
assert(noDrift === null, 'Matching hashes produce zero drift');

const drift = checkConfigurationDrift({
  assetName: 'makeup-webapp-prod',
  expectedHash: 'hash_abc123',
  actualHash: 'hash_modified999',
});
assert(drift !== null, 'Config drift detected when hashes mismatch');
assert(drift?.severity === 'CRITICAL', 'Config drift flagged as CRITICAL');

// -------------------------------------------------------------
// Test 5: Master V10.0 Operations Engine Summary
// -------------------------------------------------------------
console.log('\n[Test 5] Master V10.0 Operations Engine Summary...');
const opsSummary = evaluateProductionOperations();
assert(opsSummary.engineVersion === 'V10.0', 'Ops engine version is V10.0');
assert(opsSummary.costGovernanceStatus === 'ZERO_COST_COMPLIANT', '₹0-first cost governance status verified');
assert(opsSummary.totalAssetsCount >= 4, 'Total asset count reported');

console.log('\n=================================================');
console.log(`ALL V10.0 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) ⚙️🏆`);
console.log('=================================================\n');
