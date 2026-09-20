/**
 * V9.7 — Production Certification Test Suite
 */

import { runProductionCertification } from '../src/lib/core/certification/production-certification';

console.log('=================================================');
console.log('RUNNING V9.7 PRODUCTION CERTIFICATION TESTS');
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
// Test 1: Automated Certification & Pending Live Gates Status
// -------------------------------------------------------------
console.log('[Test 1] Automated Certification & Pending Live Gates Status...');
const report = runProductionCertification('PRODUCTION');

assert(report.certificationId.startsWith('prodcert_v97_'), 'Certification ID generated with valid prefix');
assert(report.automatedProgressPercent === 100, 'Automated certification score is 100%');
assert(report.overallStatus === 'PENDING_EXTERNAL_VERIFICATION', 'Status is PENDING_EXTERNAL_VERIFICATION prior to live gate completion');
assert(
  report.officialWording === 'V9.7 Certification Suite Passed — Pending Live External Verification',
  'Official wording correctly preserves pending live external gate status'
);

// -------------------------------------------------------------
// Test 2: Mandatory External Live Gates Classification
// -------------------------------------------------------------
console.log('\n[Test 2] Mandatory External Live Gates Classification...');
const mandatoryGates = report.categories.filter(c => c.isMandatoryLiveGate);
assert(mandatoryGates.length === 3, 'Exactly 3 mandatory external live gates defined');

const paymentGate = report.categories.find(c => c.categoryId === 'payments');
const whatsappGate = report.categories.find(c => c.categoryId === 'whatsapp');
const drGate = report.categories.find(c => c.categoryId === 'disasterRecovery');

assert(paymentGate?.externalStatus === 'NOT_VERIFIED', 'Payment live settlement gate initially NOT_VERIFIED');
assert(whatsappGate?.externalStatus === 'NOT_VERIFIED', 'WhatsApp Meta API delivery gate initially NOT_VERIFIED');
assert(drGate?.externalStatus === 'NOT_VERIFIED', 'Disaster Recovery restore drill gate initially NOT_VERIFIED');

// -------------------------------------------------------------
// Test 3: Full Live External Verification Gate Execution
// -------------------------------------------------------------
console.log('\n[Test 3] Full Live External Verification Gate Execution...');
const certifiedReport = runProductionCertification('PRODUCTION', {
  paymentLiveVerified: true,
  whatsappLiveVerified: true,
  drRestoreLiveVerified: true,
});

assert(certifiedReport.externalProgressPercent === 100, 'External progress reaches 100% after live gate verification');
assert(certifiedReport.overallStatus === 'CERTIFIED', 'Status transitions to CERTIFIED when all live gates pass');
assert(certifiedReport.officialWording === 'Production Fully Certified', 'Official wording reflects full certification');

// -------------------------------------------------------------
// Test 4: Release Build Metadata Integrity
// -------------------------------------------------------------
console.log('\n[Test 4] Release Build Metadata Integrity...');
const meta = report.buildMetadata;
assert(meta.version === 'V9.7', 'Certification version recorded');
assert(meta.flutterVersion.length > 0, 'Flutter release version recorded');
assert(meta.webVersion.length > 0, 'Next.js web release version recorded');
assert(meta.functionsVersion.length > 0, 'Cloud Functions release version recorded');
assert(meta.firebaseProjectId === 'makeup-webapp-prod', 'Firebase production project ID verified');
assert(meta.sourceCommit.length > 0, 'Git source commit SHA recorded');
assert(meta.releaseTag === 'v9.7-prod-rc1', 'Release tag recorded');

// -------------------------------------------------------------
// Test 5: Certification Evidence Collection & Audit Trail
// -------------------------------------------------------------
console.log('\n[Test 5] Certification Evidence Collection & Audit Trail...');
assert(report.evidenceRecords.length === 12, '12 evidence records collected for all 12 categories');
assert(report.evidenceRecords.every(e => e.sourceCommit === meta.sourceCommit), 'All evidence records reference identical source commit');
assert(report.evidenceRecords.every(e => typeof e.summary === 'string' && e.summary.length > 0), 'Every evidence record contains summary details');

console.log('\n=================================================');
console.log(`ALL V9.7 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) 🎓🏆`);
console.log('=================================================\n');
