/**
 * V9.2 — Backup & Disaster Recovery Automated Test Suite
 */
import { createFirestoreBackup, verifyBackup, reconcileFinancialBackup, getBackupFreshness, isSecretExcluded, exportConfiguration, getBackupManifests, clearBackupStore } from '../src/lib/core/backup/backup-engine';
import { requestRecovery, approveRecovery, executeRecovery, runRecoveryDrill, createBackupAlert, getBackupAlerts } from '../src/lib/core/backup/recovery-manager';

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) { if (!cond) { console.error(`  ✗ FAILED: ${msg}`); failed++; } else { console.log(`  ✓ ${msg}`); passed++; } }

function testBackupCreation() {
  console.log('\n[Test 1] Backup Creation & Manifest...');
  clearBackupStore();
  const backup = createFirestoreBackup('DAILY');
  assert(backup.backupId.startsWith('backup_'), 'Backup ID has correct prefix');
  assert(backup.status === 'COMPLETED', 'Backup status is COMPLETED');
  assert(backup.collections >= 30, 'At least 30 collections backed up');
  assert(backup.documents > 14000, 'Over 14,000 documents backed up');
  assert(backup.checksum.length === 64, 'SHA-256 checksum is 64 hex chars');
  assert(backup.destination === 'GOOGLE_DRIVE', 'Destination is GOOGLE_DRIVE');
  assert(backup.categories.includes('DATA'), 'Categories include DATA');
}

function testBackupVerification() {
  console.log('\n[Test 2] Backup Verification & Record Count...');
  const backup = createFirestoreBackup('MANUAL');
  const result = verifyBackup(backup.backupId);
  assert(result.verified === true, 'Backup verified successfully');
  assert(result.difference === 0, 'Zero document count difference');
  assert(result.expectedDocs === result.backupDocs, 'Expected matches backup');

  const manifests = getBackupManifests();
  const verified = manifests.find(m => m.backupId === backup.backupId);
  assert(verified?.status === 'VERIFIED', 'Manifest status updated to VERIFIED');
  assert(verified?.verifiedAt !== undefined, 'Verification timestamp set');
}

function testFinancialReconciliation() {
  console.log('\n[Test 3] Financial Backup Reconciliation...');
  const backup = createFirestoreBackup('DAILY');
  const recon = reconcileFinancialBackup(backup.backupId);
  assert(recon!.paymentLedgerTotal === 540000, 'Payment ledger total: ₹540,000');
  assert(recon!.backupLedgerTotal === 540000, 'Backup ledger total: ₹540,000');
  assert(recon!.difference === 0, 'Financial difference: ₹0');
  assert(recon!.commissionTotal === 54000, 'Commission total: ₹54,000');
  assert(recon!.backupCommissionTotal === 54000, 'Backup commission: ₹54,000');
}

function testSecretExclusion() {
  console.log('\n[Test 4] Secret Exclusion from Backups...');
  assert(isSecretExcluded('HF_TOKEN') === true, 'HF_TOKEN excluded');
  assert(isSecretExcluded('API_KEY') === true, 'API_KEY excluded');
  assert(isSecretExcluded('WEBHOOK_SECRET') === true, 'WEBHOOK_SECRET excluded');
  assert(isSecretExcluded('PASSWORD') === true, 'PASSWORD excluded');
  assert(isSecretExcluded('PRIVATE_KEY') === true, 'PRIVATE_KEY excluded');
  assert(isSecretExcluded('customerName') === false, 'customerName NOT excluded');
  assert(isSecretExcluded('bookingId') === false, 'bookingId NOT excluded');
}

function testConfigurationExport() {
  console.log('\n[Test 5] Configuration Export...');
  const config = exportConfiguration();
  assert(config.secretsExcluded === true, 'Secrets excluded from config export');
  assert(config.collections.includes('settings'), 'Settings included');
  assert(config.collections.includes('pricingRules'), 'Pricing rules included');
  assert(config.configVersion.startsWith('cfg_'), 'Config version has prefix');
}

function testBackupFreshness() {
  console.log('\n[Test 6] Backup Freshness Monitoring...');
  const backup = createFirestoreBackup('DAILY');
  const freshness = getBackupFreshness(backup.backupId);
  assert(freshness === 'HEALTHY', 'Recent backup is HEALTHY');
  assert(getBackupFreshness('nonexistent') === 'CRITICAL', 'Missing backup is CRITICAL');
}

function testRecoveryWorkflow() {
  console.log('\n[Test 7] Recovery Request/Approve/Execute Workflow...');
  const backup = createFirestoreBackup('DAILY');
  const plan = requestRecovery({
    backupId: backup.backupId, requestedBy: 'admin_01',
    reason: 'Accidental service deletion', scope: 'COLLECTION',
    targetCollections: ['services'],
  });
  assert(plan.status === 'REQUESTED', 'Recovery plan starts as REQUESTED');
  assert(plan.scope === 'COLLECTION', 'Scope is COLLECTION (selective)');
  assert(plan.targetCollections?.includes('services'), 'Target collection specified');

  const approved = approveRecovery(plan.recoveryId, 'owner_01');
  assert(approved?.status === 'APPROVED', 'Plan approved');
  assert(approved?.approvedBy === 'owner_01', 'Approver recorded');

  const executed = executeRecovery(plan.recoveryId);
  assert(executed?.status === 'COMPLETED', 'Recovery completed');
  assert(executed?.completedAt !== undefined, 'Completion timestamp set');
  assert(executed?.conflictsDetected === 0, 'No conflicts detected');
}

function testRecoveryDrill() {
  console.log('\n[Test 8] Recovery Drill & Test Report...');
  const backup = createFirestoreBackup('DAILY');
  const report = runRecoveryDrill(backup.backupId);
  assert(report.result === 'PASS', 'Drill test result: PASS');
  assert(report.documentsRestored > 14000, 'Documents restored in drill');
  assert(report.mediaRestored > 800, 'Media restored in drill');
  assert(report.reconciliationStatus === 'PASSED', 'Financial reconciliation passed');
  assert(report.failedChecks.length === 0, 'Zero failed checks');
}

function testBackupAlerts() {
  console.log('\n[Test 9] Backup Failure Alerts...');
  createBackupAlert('BACKUP_FAILED', 'Firestore export timeout', 'CRITICAL');
  createBackupAlert('BACKUP_TOO_OLD', 'Last backup >48h old', 'WARNING');
  const alerts = getBackupAlerts();
  assert(alerts.length >= 2, 'Backup alerts generated');
  assert(alerts.some(a => a.type === 'BACKUP_FAILED'), 'BACKUP_FAILED alert present');
  assert(alerts.some(a => a.severity === 'CRITICAL'), 'Critical severity recorded');
}

function testSelectiveRecovery() {
  console.log('\n[Test 10] Selective Recovery (Single Document)...');
  const backup = createFirestoreBackup('DAILY');
  const plan = requestRecovery({
    backupId: backup.backupId, requestedBy: 'admin_01',
    reason: 'Restore single booking BK-2026-001', scope: 'DOCUMENT',
    targetDocumentIds: ['BK-2026-001'],
  });
  assert(plan.scope === 'DOCUMENT', 'Scope is DOCUMENT');
  assert(plan.targetDocumentIds?.includes('BK-2026-001'), 'Specific document targeted');

  approveRecovery(plan.recoveryId, 'owner_01');
  const executed = executeRecovery(plan.recoveryId);
  assert(executed?.status === 'COMPLETED', 'Selective document recovery completed');
}

console.log('=================================================');
console.log('RUNNING V9.2 BACKUP & DISASTER RECOVERY TESTS');
console.log('=================================================');

testBackupCreation();
testBackupVerification();
testFinancialReconciliation();
testSecretExclusion();
testConfigurationExport();
testBackupFreshness();
testRecoveryWorkflow();
testRecoveryDrill();
testBackupAlerts();
testSelectiveRecovery();

console.log('\n=================================================');
if (failed === 0) {
  console.log(`ALL V9.2 TESTS PASSED SUCCESSFULLY! (${passed} assertions) 🛡️`);
} else {
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
}
console.log('=================================================');
process.exit(failed > 0 ? 1 : 0);
