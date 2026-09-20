/**
 * V9.4 — Security Hardening Test Suite
 */

import { hasPermission, ROLE_PERMISSION_MATRIX } from '../src/lib/core/security/permission-matrix';
import { verifyTenantIsolation } from '../src/lib/core/security/tenant-verifier';
import { validateWebhookSignature, clearProcessedWebhooks } from '../src/lib/core/security/webhook-validator';
import { validateFileUpload, PAYMENT_PROOF_POLICY, GENERAL_MEDIA_POLICY } from '../src/lib/core/security/file-security';

console.log('=================================================');
console.log('RUNNING V9.4 SECURITY HARDENING TESTS');
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
// Test 1: Role-Based Access Control (RBAC)
// -------------------------------------------------------------
console.log('[Test 1] Role-Based Access Control (RBAC)...');
assert(hasPermission('SUPER_ADMIN', 'finance.adjust') === true, 'SUPER_ADMIN has finance.adjust');
assert(hasPermission('ORGANIZATION_ADMIN', 'finance.adjust') === false, 'ORGANIZATION_ADMIN lacks finance.adjust');
assert(hasPermission('ARTIST', 'bookings.read') === true, 'ARTIST has bookings.read');
assert(hasPermission('ARTIST', 'finance.adjust') === false, 'ARTIST lacks finance.adjust');
assert(hasPermission('CUSTOMER', 'bookings.create') === true, 'CUSTOMER has bookings.create');
assert(hasPermission('CUSTOMER', 'staff.manage') === false, 'CUSTOMER lacks staff.manage');

// -------------------------------------------------------------
// Test 2: Tenant Isolation & Boundary Verification
// -------------------------------------------------------------
console.log('\n[Test 2] Tenant Isolation & Boundary Verification...');
const sameOrg = verifyTenantIsolation({
  actorUid: 'usr_artist_1',
  actorRole: 'ARTIST',
  actorOrgId: 'org_glam_studio',
  targetOrgId: 'org_glam_studio',
});
assert(sameOrg.authorized === true, 'Same tenant access is authorized');

const diffOrg = verifyTenantIsolation({
  actorUid: 'usr_artist_1',
  actorRole: 'ARTIST',
  actorOrgId: 'org_glam_studio',
  targetOrgId: 'org_luxe_salon',
});
assert(diffOrg.authorized === false, 'Cross-tenant access is BLOCKED');
assert(diffOrg.reason?.includes('Tenant isolation violation') === true, 'Violation reason recorded');

const adminCross = verifyTenantIsolation({
  actorUid: 'usr_admin',
  actorRole: 'SUPER_ADMIN',
  actorOrgId: 'org_admin',
  targetOrgId: 'org_luxe_salon',
});
assert(adminCross.authorized === true, 'SUPER_ADMIN bypasses tenant isolation for management');

// -------------------------------------------------------------
// Test 3: Webhook HMAC Validation & Replay Prevention
// -------------------------------------------------------------
console.log('\n[Test 3] Webhook HMAC Validation & Replay Prevention...');
clearProcessedWebhooks();
const validWebhook = validateWebhookSignature({
  provider: 'PAYMENT',
  signature: 'mock_secret_key',
  payloadString: '{"event":"payment.captured"}',
  secret: 'mock_secret_key',
  eventId: 'evt_pay_98231',
});
assert(validWebhook.valid === true, 'Valid HMAC signature accepted');
assert(validWebhook.isReplay === false, 'First event is not replay');

const replayWebhook = validateWebhookSignature({
  provider: 'PAYMENT',
  signature: 'mock_secret_key',
  payloadString: '{"event":"payment.captured"}',
  secret: 'mock_secret_key',
  eventId: 'evt_pay_98231',
});
assert(replayWebhook.valid === true, 'Replay webhook flagged as valid format');
assert(replayWebhook.isReplay === true, 'Replay attack DETECTED and flagged');

const badSigWebhook = validateWebhookSignature({
  provider: 'PAYMENT',
  signature: 'invalid_sig',
  payloadString: '{"event":"payment.captured"}',
  secret: 'mock_secret_key',
  eventId: 'evt_pay_98232',
});
assert(badSigWebhook.valid === false, 'Invalid HMAC signature BLOCKED');

// -------------------------------------------------------------
// Test 4: File Upload Security & Path Traversal Safeguards
// -------------------------------------------------------------
console.log('\n[Test 4] File Upload Security & Path Traversal Safeguards...');
const validFile = validateFileUpload({
  filename: 'receipt.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: 1024 * 1024,
  policy: PAYMENT_PROOF_POLICY,
  destinationPath: '/payments/proofs/receipt.jpg',
});
assert(validFile.valid === true, 'Valid file upload accepted');

const badMimeFile = validateFileUpload({
  filename: 'exploit.exe',
  mimeType: 'application/x-executable',
  sizeBytes: 1024,
  policy: PAYMENT_PROOF_POLICY,
  destinationPath: '/payments/proofs/exploit.exe',
});
assert(badMimeFile.valid === false, 'Unallowed MIME type BLOCKED');

const oversizedFile = validateFileUpload({
  filename: 'huge_photo.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: 10 * 1024 * 1024, // 10MB > 5MB
  policy: PAYMENT_PROOF_POLICY,
  destinationPath: '/payments/proofs/huge_photo.jpg',
});
assert(oversizedFile.valid === false, 'Oversized file BLOCKED');

const traversalFile = validateFileUpload({
  filename: 'hack.png',
  mimeType: 'image/png',
  sizeBytes: 500,
  policy: PAYMENT_PROOF_POLICY,
  destinationPath: '/payments/proofs/../../etc/passwd',
});
assert(traversalFile.valid === false, 'Path traversal attempt BLOCKED');

console.log('\n=================================================');
console.log(`ALL V9.4 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) 🔒`);
console.log('=================================================\n');
