/**
 * V9.1 — Privacy & Data Lifecycle Automated Test Suite
 */
import { grantConsent, revokeConsent, getCustomerConsents, isConsentActive, checkMediaPublicationGuard, clearConsentStore } from '../src/lib/core/privacy/consent-manager';
import { getClassification, getProcessingPurpose } from '../src/lib/core/privacy/data-classification';
import { submitDataRequest, verifyRequestIdentity, processDataRequest, completeDataRequest, rejectDataRequest, getRequestTimeline } from '../src/lib/core/privacy/data-request-manager';
import { generateCustomerDataExport, isExportUrlValid } from '../src/lib/core/privacy/data-export';
import { assessDeletionEligibility, createDeletionPlan, executeDeletionPlan, anonymizeRetainedRecords } from '../src/lib/core/privacy/data-deletion';
import { getRetentionPolicies, getRetentionPolicy } from '../src/lib/core/privacy/retention-manager';
import { logPrivacyAccessEvent, getPrivacyAccessLog, clearPrivacyAccessLog } from '../src/lib/core/privacy/privacy-audit';
import { createPrivacyIncident, updatePrivacyIncidentStatus, getPrivacyHealthStatus } from '../src/lib/core/privacy/privacy-incident';
import { maskPhone, maskEmail, maskPaymentReference, maskSensitiveId } from '../src/lib/core/privacy/data-masking';

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) { if (!cond) { console.error(`  ✗ FAILED: ${msg}`); failed++; } else { console.log(`  ✓ ${msg}`); passed++; } }

function testConsentManagement() {
  console.log('\n[Test 1] Consent Creation, Revocation & Versioning...');
  clearConsentStore();
  const c1 = grantConsent({ customerId: 'cust_101', type: 'PORTFOLIO', version: '2026-09-v2' });
  assert(c1.status === 'GRANTED', 'Consent granted');
  assert(c1.version === '2026-09-v2', 'Version tracked');
  assert(isConsentActive('cust_101', 'PORTFOLIO'), 'PORTFOLIO consent active');
  assert(!isConsentActive('cust_101', 'INSTAGRAM'), 'INSTAGRAM consent not active');
  const revoked = revokeConsent('cust_101', 'PORTFOLIO');
  assert(revoked?.status === 'REVOKED', 'Consent revoked');
  assert(revoked?.revokedAt !== undefined, 'Revocation timestamp set');
  assert(!isConsentActive('cust_101', 'PORTFOLIO'), 'PORTFOLIO consent no longer active after revocation');
}

function testMediaPublicationGuard() {
  console.log('\n[Test 2] Media Publication Guard...');
  clearConsentStore();
  grantConsent({ customerId: 'cust_201', type: 'PORTFOLIO', version: '2026-09-v1' });
  grantConsent({ customerId: 'cust_201', type: 'BEFORE_AFTER', version: '2026-09-v1' });
  const guard = checkMediaPublicationGuard('cust_201');
  assert(guard.allowed === true, 'Publication allowed with active consent');
  assert(guard.destinations.website === true, 'Website publication allowed');
  assert(guard.destinations.instagram === false, 'Instagram blocked without consent');
  assert(guard.destinations.ads === false, 'Ads blocked without consent');

  const noConsent = checkMediaPublicationGuard('cust_none');
  assert(noConsent.allowed === false, 'Publication blocked without any consent');
}

function testDataClassification() {
  console.log('\n[Test 3] Data Classification & Processing Purpose...');
  assert(getClassification('services') === 'PUBLIC', 'Services is PUBLIC');
  assert(getClassification('paymentProof') === 'FINANCIAL', 'Payment proof is FINANCIAL');
  assert(getClassification('consultations') === 'SENSITIVE', 'Consultations is SENSITIVE');
  assert(getClassification('apiTokens') === 'AUTHENTICATION', 'API tokens is AUTHENTICATION');
  assert(getProcessingPurpose('chat') === 'Customer-artist communication', 'Chat purpose correct');
  assert(getProcessingPurpose('phone') === 'Booking/communication', 'Phone purpose correct');
}

function testDataRequestLifecycle() {
  console.log('\n[Test 4] Data Request Lifecycle & Identity Verification...');
  const req = submitDataRequest({ customerId: 'cust_101', type: 'EXPORT' });
  assert(req.status === 'SUBMITTED', 'Request starts as SUBMITTED');
  assert(req.timeline.length === 1, 'Timeline has submission entry');

  verifyRequestIdentity(req.requestId, 'admin_01');
  assert(req.status === 'VERIFYING', 'Request transitions to VERIFYING');

  processDataRequest(req.requestId);
  assert(req.status === 'PROCESSING', 'Request transitions to PROCESSING');

  completeDataRequest(req.requestId);
  assert(req.status === 'COMPLETED', 'Request transitions to COMPLETED');

  const timeline = getRequestTimeline(req.requestId);
  assert(timeline.length === 4, 'Timeline has all 4 entries');

  const rejected = submitDataRequest({ customerId: 'cust_bad', type: 'DELETE' });
  rejectDataRequest(rejected.requestId, 'Identity verification failed');
  assert(rejected.status === 'REJECTED', 'Request can be rejected');
}

function testDataExport() {
  console.log('\n[Test 5] Data Export & Secure URL...');
  const manifest = generateCustomerDataExport('cust_101');
  assert(manifest.sections.includes('profile'), 'Export includes profile');
  assert(manifest.sections.includes('payments'), 'Export includes payments');
  assert(manifest.recordCount > 0, 'Export has records');
  assert(manifest.secureUrl !== undefined, 'Secure URL generated');
  assert(isExportUrlValid(manifest), 'URL is currently valid');
  assert(manifest.expiresAt !== undefined, 'Expiry set (15 min)');
}

function testDeletionPlan() {
  console.log('\n[Test 6] Deletion Eligibility & Plan...');
  const items = assessDeletionEligibility('cust_101');
  const deletable = items.filter(i => i.eligibility === 'DELETABLE');
  const anonymizable = items.filter(i => i.eligibility === 'ANONYMIZABLE');
  const retained = items.filter(i => i.eligibility === 'RETENTION_REQUIRED');
  assert(deletable.length > 0, 'Some records are DELETABLE');
  assert(anonymizable.length > 0, 'Some records are ANONYMIZABLE');
  assert(retained.length > 0, 'Financial/audit records are RETENTION_REQUIRED');

  const plan = createDeletionPlan('cust_101');
  assert(plan.totalDeletable > 0, 'Plan has deletable count');
  assert(plan.totalRetained > 0, 'Plan has retained count');
  assert(plan.status === 'PLANNED', 'Plan starts as PLANNED');

  const executed = executeDeletionPlan(plan);
  assert(executed.status === 'COMPLETED', 'Executed plan is COMPLETED');
}

function testAnonymization() {
  console.log('\n[Test 7] Anonymization...');
  const result = anonymizeRetainedRecords('cust_101', 'chatMessages');
  assert(result.anonymized === true, 'Anonymization succeeded');
  assert(result.anonymizedRef.includes('****'), 'Reference is masked');
  assert(result.originalRef !== result.anonymizedRef, 'Original and anonymized differ');
}

function testRetentionPolicies() {
  console.log('\n[Test 8] Retention Policy Configuration...');
  const policies = getRetentionPolicies();
  assert(policies.length >= 9, 'At least 9 retention policies configured');

  const tempUpload = getRetentionPolicy('TEMP_UPLOAD');
  assert(tempUpload?.retentionDays === 7, 'Temp uploads retained 7 days');
  assert(tempUpload?.action === 'DELETE', 'Temp uploads action is DELETE');

  const paymentProof = getRetentionPolicy('PAYMENT_PROOF');
  assert(paymentProof?.retentionDays === 365, 'Payment proofs retained 365 days');
  assert(paymentProof?.legalHoldAllowed === true, 'Payment proof supports legal hold');

  const aiLog = getRetentionPolicy('AI_LOG');
  assert(aiLog?.retentionDays === 30, 'AI logs retained 30 days');
  assert(aiLog?.action === 'DELETE', 'AI logs deleted after retention');
}

function testDataMasking() {
  console.log('\n[Test 9] Sensitive Data Masking...');
  assert(maskPhone('+919876543210').endsWith('3210'), 'Phone last 4 digits visible');
  assert(maskPhone('+919876543210').includes('*'), 'Phone has masked characters');
  assert(maskEmail('priya@example.com').includes('@example.com'), 'Email domain preserved');
  assert(maskEmail('priya@example.com').includes('*'), 'Email local part masked');
  assert(maskPaymentReference('REF9876543210').startsWith('****'), 'Payment ref starts with ****');
  assert(maskSensitiveId('customer_12345').includes('•'), 'Sensitive ID masked with dots');
}

function testPrivacyAudit() {
  console.log('\n[Test 10] Privacy Access Audit Log...');
  clearPrivacyAccessLog();
  const event = logPrivacyAccessEvent({
    eventType: 'DATA_EXPORT', uid: 'admin_01', resourceType: 'CUSTOMER', resourceId: 'cust_101', requestId: 'req_prv_01',
  });
  assert(event.eventType === 'DATA_EXPORT', 'Event type recorded');
  assert(event.result === 'ALLOWED', 'Default result is ALLOWED');

  const denied = logPrivacyAccessEvent({
    eventType: 'PAYMENT_PROOF_ACCESS', uid: 'content_mgr_01', resourceType: 'PAYMENT', resourceId: 'pay_001', requestId: 'req_prv_02', result: 'DENIED',
  });
  assert(denied.result === 'DENIED', 'Denied access recorded');

  const log = getPrivacyAccessLog();
  assert(log.length === 2, 'Both events in log');
}

function testPrivacyIncidents() {
  console.log('\n[Test 11] Privacy Incident Workflow...');
  const inc = createPrivacyIncident({
    type: 'PUBLIC_MEDIA_EXPOSURE', severity: 'HIGH', summary: 'Customer photo published without INSTAGRAM consent',
    affectedUserIds: ['cust_201'],
  });
  assert(inc.status === 'OPEN', 'Incident starts OPEN');
  assert(inc.severity === 'HIGH', 'Severity preserved');

  updatePrivacyIncidentStatus(inc.incidentId, 'RESOLVED', 'Photo removed from Instagram');
  assert(inc.status === 'RESOLVED', 'Incident resolved');
  assert(inc.resolution === 'Photo removed from Instagram', 'Resolution recorded');
}

function testPrivacyHealth() {
  console.log('\n[Test 12] Privacy Health Status...');
  const health = getPrivacyHealthStatus();
  assert(health.openDataRequests >= 0, 'Open data requests tracked');
  assert(health.pendingDeletions >= 0, 'Pending deletions tracked');
  assert(['HEALTHY', 'WARNING', 'CRITICAL'].includes(health.overallStatus), 'Overall status valid');
}

console.log('=================================================');
console.log('RUNNING V9.1 PRIVACY & DATA LIFECYCLE TESTS');
console.log('=================================================');

testConsentManagement();
testMediaPublicationGuard();
testDataClassification();
testDataRequestLifecycle();
testDataExport();
testDeletionPlan();
testAnonymization();
testRetentionPolicies();
testDataMasking();
testPrivacyAudit();
testPrivacyIncidents();
testPrivacyHealth();

console.log('\n=================================================');
if (failed === 0) {
  console.log(`ALL V9.1 TESTS PASSED SUCCESSFULLY! (${passed} assertions) 🔒`);
} else {
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
}
console.log('=================================================');
process.exit(failed > 0 ? 1 : 0);
