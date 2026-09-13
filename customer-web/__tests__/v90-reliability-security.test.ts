/**
 * V9.0 — Reliability, Security & Observability Automated Test Suite
 */

import { generateRequestId, extractRequestContext, buildCorrelationContext } from '../src/lib/core/observability/request-context';
import { AppError } from '../src/lib/core/errors/app-error';
import { mapToAppError } from '../src/lib/core/errors/error-mapper';
import { redactSensitiveData } from '../src/lib/core/errors/error-codes';
import { checkOrCreateIdempotencyKey, completeIdempotencyKey, clearIdempotencyStore } from '../src/lib/core/resilience/idempotency';
import { determineRetryPolicy } from '../src/lib/core/resilience/retry-policy';
import { recordFailedEvent, updateFailedEventStatus, getDLQEvents } from '../src/lib/core/resilience/dead-letter-queue';
import { checkRateLimit, clearRateLimits } from '../src/lib/core/resilience/rate-limiter';
import { validateSystemDataConsistency } from '../src/lib/core/resilience/data-consistency';
import { runRuntimeHealthChecks } from '../src/lib/core/health/health-checker';
import { getMaintenanceConfig, updateMaintenanceConfig, getFeatureKillSwitches, updateFeatureKillSwitches, isFeatureAllowed } from '../src/lib/core/health/maintenance-manager';
import { logAuditEvent, getAuditEvents, clearAuditLog } from '../src/lib/core/observability/audit-logger';
import { logSecurityEvent, getSecurityEvents, clearSecurityEvents } from '../src/lib/core/observability/security-logger';
import { recordRequestMetric, getMetricsSummary, resetMetrics } from '../src/lib/core/observability/metrics-collector';
import { recordAITelemetry, getAIObservabilitySummary } from '../src/lib/core/observability/ai-observability';
import { recordSheetsSyncEvent, getSheetsObservabilityMetrics } from '../src/lib/core/observability/sheets-observability';
import { validateWebhookSignature, clearProcessedWebhooks } from '../src/lib/core/security/webhook-validator';
import { validateFileUpload, PAYMENT_PROOF_POLICY } from '../src/lib/core/security/file-security';
import { hasPermission } from '../src/lib/core/security/permission-matrix';
import { verifyTenantIsolation } from '../src/lib/core/security/tenant-verifier';
import { createIncident, updateIncidentStatus, getActiveIncidents, getSystemAlerts } from '../src/lib/core/incidents/incident-manager';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ✗ FAILED: ${msg}`);
    failed++;
  } else {
    console.log(`  ✓ ${msg}`);
    passed++;
  }
}

// 1. Request ID & Correlation
function testRequestIdAndCorrelation() {
  console.log('\n[Test 1] Request ID Generation & Correlation Context...');
  const rid = generateRequestId();
  assert(rid.startsWith('req_'), 'Request ID has req_ prefix');
  assert(rid.length > 10, 'Request ID has sufficient entropy');

  const ctx = buildCorrelationContext(rid, { bookingId: 'bk_101', organizationId: 'org_jaipur' });
  assert(ctx.requestId === rid, 'Correlation context carries requestId');
  assert(ctx.bookingId === 'bk_101', 'Correlation context carries bookingId');
  assert(ctx.organizationId === 'org_jaipur', 'Correlation context carries organizationId');
}

// 2. Error Normalization & Redaction
function testErrorNormalization() {
  console.log('\n[Test 2] Error Normalization & Sensitive Data Redaction...');
  const err = new AppError({ code: 'FORBIDDEN', message: 'Access denied', httpStatus: 403, requestId: 'req_test01' });
  assert(err.code === 'FORBIDDEN', 'AppError code preserved');
  assert(err.httpStatus === 403, 'AppError HTTP status preserved');

  const resp = err.toJSONResponse();
  assert(resp.success === false, 'Error response has success=false');
  assert(resp.error.code === 'FORBIDDEN', 'Response contains error code');
  assert(!JSON.stringify(resp).includes('stack'), 'Stack trace not exposed in response');

  const mapped = mapToAppError(new Error('permission-denied'), 'req_test02');
  assert(mapped.code === 'FORBIDDEN', 'Firestore permission-denied maps to FORBIDDEN');

  const redacted = redactSensitiveData({ hf_token: 'abc123', name: 'Test', apiKey: 'secret' });
  assert(redacted.hf_token === '[REDACTED]', 'hf_token redacted');
  assert(redacted.apiKey === '[REDACTED]', 'apiKey redacted');
  assert(redacted.name === 'Test', 'Non-sensitive data preserved');
}

// 3. Idempotency
function testIdempotency() {
  console.log('\n[Test 3] Idempotency Framework...');
  clearIdempotencyStore();
  const first = checkOrCreateIdempotencyKey({ key: 'booking_create_bk101', requestId: 'req_01', action: 'BOOKING_CREATE' });
  assert(first.isDuplicate === false, 'First request is not a duplicate');
  assert(first.record.status === 'PROCESSING', 'Status is PROCESSING');

  completeIdempotencyKey('booking_create_bk101', { bookingId: 'bk101' });

  const second = checkOrCreateIdempotencyKey({ key: 'booking_create_bk101', requestId: 'req_02', action: 'BOOKING_CREATE' });
  assert(second.isDuplicate === true, 'Duplicate request detected');
  assert(second.record.status === 'COMPLETED', 'Original record is COMPLETED');
}

// 4. Retry Policy
function testRetryPolicy() {
  console.log('\n[Test 4] Retry Policy Categorization...');
  assert(determineRetryPolicy({ actionCategory: 'FINANCIAL', errorCode: 'TIMEOUT' }) === 'MANUAL_REVIEW', 'Financial mutations → MANUAL_REVIEW');
  assert(determineRetryPolicy({ actionCategory: 'FINANCIAL', errorCode: 'TIMEOUT', isDuplicate: true }) === 'NO_RETRY', 'Duplicate financial → NO_RETRY');
  assert(determineRetryPolicy({ actionCategory: 'SHEETS', errorCode: 'TIMEOUT' }) === 'SAFE_RETRY', 'Sheets timeout → SAFE_RETRY');
  assert(determineRetryPolicy({ actionCategory: 'WHATSAPP', errorCode: 'DEPENDENCY_UNAVAILABLE' }) === 'RETRY_WITH_BACKOFF', 'WhatsApp unavailable → RETRY_WITH_BACKOFF');
  assert(determineRetryPolicy({ actionCategory: 'AI', errorCode: 'RATE_LIMITED' }) === 'RETRY_WITH_BACKOFF', 'AI rate limited → RETRY_WITH_BACKOFF');
}

// 5. Dead-Letter Queue
function testDLQ() {
  console.log('\n[Test 5] Dead-Letter Queue (DLQ) State Transitions...');
  const allEvents = getDLQEvents();
  assert(allEvents.length >= 2, 'DLQ has seed failed events');

  const newEvent = recordFailedEvent({
    eventType: 'FCM_NOTIFICATION',
    requestId: 'req_fcm_01',
    resourceId: 'notif_001',
    errorCode: 'PROVIDER_TIMEOUT',
    errorMessage: 'FCM delivery timeout',
    payload: { token: 'device_token_abc' },
  });
  assert(newEvent.status === 'PENDING', 'New failed event starts as PENDING');
  assert(newEvent.attemptCount === 1, 'First attempt count is 1');

  const retried = updateFailedEventStatus(newEvent.eventId, 'RETRYING');
  assert(retried?.status === 'RETRYING', 'Event transitions to RETRYING');
  assert(retried?.attemptCount === 2, 'Attempt count incremented');

  const resolved = updateFailedEventStatus(newEvent.eventId, 'RESOLVED');
  assert(resolved?.status === 'RESOLVED', 'Event transitions to RESOLVED');
}

// 6. Health Checks & Dependency Verification
function testHealthChecks() {
  console.log('\n[Test 6] Runtime Health Checks & Dependency Verification...');
  const health = runRuntimeHealthChecks();
  assert(health.dependencies.length === 6, '6 dependencies monitored');
  assert(health.overallStatus === 'DEGRADED', 'Overall DEGRADED due to Sheets');

  const firestore = health.dependencies.find(d => d.serviceId === 'firestore');
  assert(firestore?.status === 'HEALTHY', 'Firestore is HEALTHY');
  assert(firestore?.verificationLevel === 'SANDBOX_VERIFIED', 'Firestore verification level is SANDBOX_VERIFIED');

  const whatsapp = health.dependencies.find(d => d.serviceId === 'whatsapp');
  assert(whatsapp?.status === 'NOT_CONFIGURED', 'WhatsApp is NOT_CONFIGURED');
  assert(whatsapp?.verificationLevel === 'CODE_CONFIGURED', 'WhatsApp verification is CODE_CONFIGURED only');
}

// 7. Audit & Security Events
function testAuditAndSecurityEvents() {
  console.log('\n[Test 7] Audit Events & Security Event Logging...');
  clearAuditLog();
  clearSecurityEvents();

  const audit = logAuditEvent({
    requestId: 'req_aud_01',
    actorUid: 'admin_01',
    actorRole: 'SUPER_ADMIN',
    action: 'BOOKING_CONFIRMED',
    resourceType: 'BOOKING',
    resourceId: 'bk_9921',
    organizationId: 'org_jaipur_glam',
    metadata: { apiKey: 'secret123', note: 'confirmed' },
  });
  assert(audit.eventId.startsWith('audit_'), 'Audit event has correct prefix');
  assert(audit.result === 'SUCCESS', 'Audit event result is SUCCESS');
  assert(audit.metadata?.apiKey === '[REDACTED]', 'Sensitive metadata redacted in audit');
  assert(audit.metadata?.note === 'confirmed', 'Non-sensitive metadata preserved');

  const secEvent = logSecurityEvent({
    eventType: 'TENANT_ACCESS_ATTEMPT',
    requestId: 'req_sec_01',
    actorUid: 'user_bad',
    organizationId: 'org_other',
    details: { targetOrg: 'org_jaipur_glam' },
  });
  assert(secEvent.eventType === 'TENANT_ACCESS_ATTEMPT', 'Security event type recorded');
  assert(secEvent.severity === 'HIGH', 'Tenant access attempt is HIGH severity');
}

// 8. Rate Limiting & File Upload Security
function testRateLimitingAndUploads() {
  console.log('\n[Test 8] Server-Side Rate Limiting & File Upload Validation...');
  clearRateLimits();

  for (let i = 0; i < 10; i++) {
    checkRateLimit({ subject: 'user_1', endpoint: '/api/ai/chat', maxRequests: 5, windowSeconds: 60 });
  }
  const final_rl = checkRateLimit({ subject: 'user_1', endpoint: '/api/ai/chat', maxRequests: 5, windowSeconds: 60 });
  assert(final_rl.blocked === true, 'Rate limit blocks after exceeding max requests');
  assert(final_rl.count > 5, 'Count exceeds limit');

  const validUpload = validateFileUpload({
    filename: 'proof.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 2 * 1024 * 1024,
    policy: PAYMENT_PROOF_POLICY,
    destinationPath: '/payments/proofs/proof.jpg',
  });
  assert(validUpload.valid === true, 'Valid payment proof accepted');

  const badMime = validateFileUpload({
    filename: 'script.exe',
    mimeType: 'application/x-executable',
    sizeBytes: 1024,
    policy: PAYMENT_PROOF_POLICY,
    destinationPath: '/payments/proofs/script.exe',
  });
  assert(badMime.valid === false, 'Executable MIME type rejected');

  const tooLarge = validateFileUpload({
    filename: 'huge.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 50 * 1024 * 1024,
    policy: PAYMENT_PROOF_POLICY,
    destinationPath: '/payments/proofs/huge.jpg',
  });
  assert(tooLarge.valid === false, 'Oversized file rejected');

  const pathTraversal = validateFileUpload({
    filename: 'proof.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 1024,
    policy: PAYMENT_PROOF_POLICY,
    destinationPath: '../../etc/proof.jpg',
  });
  assert(pathTraversal.valid === false, 'Path traversal attempt blocked');
}

// 9. Webhook Signature & Replay Protection
function testWebhookSecurity() {
  console.log('\n[Test 9] Webhook Signature Validation & Replay Protection...');
  clearProcessedWebhooks();

  const valid = validateWebhookSignature({
    provider: 'PAYMENT',
    signature: 'sha256=mock_secret_key',
    payloadString: '{"event": "payment_success"}',
    secret: 'mock_secret_key',
    eventId: 'evt_pay_001',
  });
  assert(valid.valid === true, 'Valid webhook accepted');
  assert(valid.isReplay === false, 'First event is not a replay');

  const replay = validateWebhookSignature({
    provider: 'PAYMENT',
    signature: 'sha256=mock_secret_key',
    payloadString: '{"event": "payment_success"}',
    secret: 'mock_secret_key',
    eventId: 'evt_pay_001',
  });
  assert(replay.valid === true, 'Replay is valid but flagged');
  assert(replay.isReplay === true, 'Duplicate event detected as replay');

  const invalidSig = validateWebhookSignature({
    provider: 'PAYMENT',
    signature: 'sha256=wrong_key',
    payloadString: '{}',
    secret: 'mock_secret_key',
    eventId: 'evt_pay_002',
  });
  assert(invalidSig.valid === false, 'Invalid signature rejected');
}

// 10. Tenant Isolation
function testTenantIsolation() {
  console.log('\n[Test 10] Cross-Tenant Isolation Verification...');
  const sameOrg = verifyTenantIsolation({
    actorUid: 'artist_01', actorRole: 'ARTIST', actorOrgId: 'org_jaipur_glam', targetOrgId: 'org_jaipur_glam',
  });
  assert(sameOrg.authorized === true, 'Same-org access allowed');

  const crossOrg = verifyTenantIsolation({
    actorUid: 'artist_01', actorRole: 'ARTIST', actorOrgId: 'org_jaipur_glam', targetOrgId: 'org_udaipur_beauty',
  });
  assert(crossOrg.authorized === false, 'Cross-org access denied');
  assert(crossOrg.reason!.includes('isolation violation'), 'Violation reason provided');

  const adminCross = verifyTenantIsolation({
    actorUid: 'admin_01', actorRole: 'SUPER_ADMIN', actorOrgId: 'org_platform', targetOrgId: 'org_udaipur_beauty',
  });
  assert(adminCross.authorized === true, 'SUPER_ADMIN can cross tenant boundaries');

  const noOrg = verifyTenantIsolation({
    actorUid: 'rogue_user', actorRole: 'CUSTOMER', targetOrgId: 'org_jaipur_glam',
  });
  assert(noOrg.authorized === false, 'User without org membership denied');
}

// 11. Permission Matrix
function testPermissionMatrix() {
  console.log('\n[Test 11] Role Permission Matrix...');
  assert(hasPermission('SUPER_ADMIN', 'risk.manage') === true, 'SUPER_ADMIN has risk.manage');
  assert(hasPermission('SUPER_ADMIN', 'finance.adjust') === true, 'SUPER_ADMIN has finance.adjust');
  assert(hasPermission('CUSTOMER', 'bookings.create') === true, 'CUSTOMER can create bookings');
  assert(hasPermission('CUSTOMER', 'finance.adjust') === false, 'CUSTOMER cannot adjust finance');
  assert(hasPermission('ARTIST', 'payments.verify') === false, 'ARTIST cannot verify payments');
  assert(hasPermission('ORGANIZATION_ADMIN', 'staff.manage') === true, 'ORG_ADMIN can manage staff');
}

// 12. Incident Lifecycle & Alerts
function testIncidentsAndAlerts() {
  console.log('\n[Test 12] Incident Lifecycle & Operational Alerts...');
  const inc = createIncident({
    severity: 'SEV2',
    summary: 'Payment verification backlog exceeding 30 minutes',
    affectedServices: ['ai', 'payments'],
    requestIds: ['req_pay_backlog_01'],
  });
  assert(inc.status === 'OPEN', 'New incident starts as OPEN');
  assert(inc.severity === 'SEV2', 'Severity preserved');

  const updated = updateIncidentStatus(inc.incidentId, 'INVESTIGATING');
  assert(updated?.status === 'INVESTIGATING', 'Incident transitions to INVESTIGATING');

  const resolved = updateIncidentStatus(inc.incidentId, 'RESOLVED');
  assert(resolved?.resolvedAt !== undefined, 'ResolvedAt timestamp set');

  const alerts = getSystemAlerts();
  assert(alerts.length >= 2, 'System alerts present');
}

// 13. Maintenance & Kill Switches
function testMaintenanceAndKillSwitches() {
  console.log('\n[Test 13] Maintenance Mode & Feature Kill Switches...');
  const initial = getMaintenanceConfig();
  assert(initial.maintenanceMode === false, 'Maintenance mode off by default');

  updateMaintenanceConfig({ maintenanceMode: true, maintenanceMessage: 'Scheduled update' });
  const active = getMaintenanceConfig();
  assert(active.maintenanceMode === true, 'Maintenance mode enabled');

  updateMaintenanceConfig({ maintenanceMode: false });

  assert(isFeatureAllowed('bookingEnabled') === true, 'Booking feature enabled');
  updateFeatureKillSwitches({ aiEnabled: false });
  assert(isFeatureAllowed('aiEnabled') === false, 'AI feature disabled via kill switch');
  updateFeatureKillSwitches({ aiEnabled: true }); // restore
}

// 14. Sheets & AI Observability
function testObservability() {
  console.log('\n[Test 14] Sheets Sync & AI Observability Monitoring...');
  const sheets = getSheetsObservabilityMetrics();
  assert(sheets.totalSynced >= 1248, 'Sheets synced count tracked');

  recordSheetsSyncEvent('FAILED');
  const updated = getSheetsObservabilityMetrics();
  assert(updated.totalFailed > sheets.totalFailed, 'Sheets failure count incremented');

  recordAITelemetry({
    requestId: 'req_ai_01', feature: 'CONCIERGE', model: 'mixtral',
    provider: 'HUGGINGFACE', status: 'SUCCESS', latencyMs: 200, timestamp: new Date().toISOString(),
  });
  recordAITelemetry({
    requestId: 'req_ai_02', feature: 'PAYMENT_VISION', model: 'detr',
    provider: 'HUGGINGFACE', status: 'FAILED', latencyMs: 5000, timestamp: new Date().toISOString(), errorMessage: 'Timeout',
  });

  const aiSummary = getAIObservabilitySummary();
  assert(aiSummary.totalCalls >= 2, 'AI calls tracked');
  assert(aiSummary.failures >= 1, 'AI failures tracked');
}

// 15. Data Consistency
function testDataConsistency() {
  console.log('\n[Test 15] Data Consistency & Relationship Validation...');
  const result = validateSystemDataConsistency();
  assert(result.passed === true, 'All entity relationships valid');
  assert(result.orphanCount === 0, 'Zero orphaned records');
  assert(result.totalChecked >= 8, 'At least 8 relationships checked');
}

// Run all
console.log('=================================================');
console.log('RUNNING V9.0 RELIABILITY & SECURITY TESTS');
console.log('=================================================');

testRequestIdAndCorrelation();
testErrorNormalization();
testIdempotency();
testRetryPolicy();
testDLQ();
testHealthChecks();
testAuditAndSecurityEvents();
testRateLimitingAndUploads();
testWebhookSecurity();
testTenantIsolation();
testPermissionMatrix();
testIncidentsAndAlerts();
testMaintenanceAndKillSwitches();
testObservability();
testDataConsistency();

console.log('\n=================================================');
if (failed === 0) {
  console.log(`ALL V9.0 TESTS PASSED SUCCESSFULLY! (${passed} assertions) 🛡️`);
} else {
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
}
console.log('=================================================');

process.exit(failed > 0 ? 1 : 0);
