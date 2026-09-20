/**
 * V10.5 — Unified Omnichannel Communication & Customer Engagement Test Suite
 */

import { selectCommunicationChannel } from '../src/lib/core/comm/channel-selector';
import { queueOutboundMessage, processCommunicationQueue, getCommunicationQueue } from '../src/lib/core/comm/omnichannel-gateway';
import { getOrCreateThread, recordAutomatedTurn, triggerHumanHandoff, sanitizeCustomerPayload, getHandoffEscalations } from '../src/lib/core/comm/support-handoff-engine';
import { CommunicationProfile } from '../src/lib/core/comm/comm-types';

console.log('=================================================');
console.log('RUNNING V10.5 OMNICHANNEL COMMUNICATION TESTS');
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

const mockProfile: CommunicationProfile = {
  customerId: 'cust_7001',
  organizationId: 'org_glam',
  preferredChannel: 'WHATSAPP',
  allowedChannels: ['WHATSAPP', 'EMAIL', 'PORTAL'],
  transactionalPreferences: { enabled: true },
  marketingPreferences: { enabled: false }, // Opted out of marketing
  quietHoursActive: false,
  timezone: 'Asia/Kolkata',
};

// -------------------------------------------------------------
// Test 1: Channel Selection & Consent Enforcement
// -------------------------------------------------------------
console.log('[Test 1] Channel Selection & Consent Enforcement...');
const mktSelect = selectCommunicationChannel({
  purpose: 'MARKETING_PROMOTION',
  messageType: 'MARKETING',
  profile: mockProfile,
});
assert(mktSelect.allowed === false, 'Marketing message BLOCKED due to customer opt-out');
assert(mktSelect.reason?.includes('blocked by customer opt-out') === true, 'Opt-out reason reported');

const quietProfile: CommunicationProfile = { ...mockProfile, quietHoursActive: true };
const quietSelect = selectCommunicationChannel({
  purpose: 'APPOINTMENT_REMINDER',
  messageType: 'REMINDER',
  profile: quietProfile,
});
assert(quietSelect.allowed === false, 'Non-essential reminder BLOCKED during quiet hours');

// -------------------------------------------------------------
// Test 2: Message Guard Verification & Execution Key Idempotency
// -------------------------------------------------------------
console.log('\n[Test 2] Message Guard Verification & Execution Key Idempotency...');
const unverifiedGuard = queueOutboundMessage({
  customerId: 'cust_7001',
  organizationId: 'org_glam',
  channel: 'WHATSAPP',
  messageType: 'TRANSACTIONAL',
  purpose: 'BOOKING_CONFIRMATION',
  entityId: 'bk_3001',
  version: 1,
  body: 'Your booking is confirmed!',
  priority: 'HIGH',
  authoritativeStateVerified: false, // State not verified in DB
});

assert(unverifiedGuard.success === false, 'Outbound booking confirmation BLOCKED when DB state is unverified');
assert(unverifiedGuard.error?.includes('Message Guard Violation') === true, 'Message guard violation error reported');

const validQueue = queueOutboundMessage({
  customerId: 'cust_7001',
  organizationId: 'org_glam',
  channel: 'WHATSAPP',
  messageType: 'TRANSACTIONAL',
  purpose: 'BOOKING_CONFIRMATION',
  entityId: 'bk_3001',
  version: 1,
  body: 'Your booking is confirmed!',
  priority: 'HIGH',
  authoritativeStateVerified: true,
});

assert(validQueue.success === true, 'Valid booking confirmation queued successfully');

const duplicateQueue = queueOutboundMessage({
  customerId: 'cust_7001',
  organizationId: 'org_glam',
  channel: 'WHATSAPP',
  messageType: 'TRANSACTIONAL',
  purpose: 'BOOKING_CONFIRMATION',
  entityId: 'bk_3001',
  version: 1,
  body: 'Your booking is confirmed!',
  priority: 'HIGH',
  authoritativeStateVerified: true,
});

assert(duplicateQueue.success === false, 'Duplicate execution key message BLOCKED by send idempotency');
assert(duplicateQueue.error?.includes('Duplicate Prevention') === true, 'Duplicate prevention error reported');

// -------------------------------------------------------------
// Test 3: Queue Processing Engine
// -------------------------------------------------------------
console.log('\n[Test 3] Queue Processing Engine...');
const queueResult = processCommunicationQueue();
assert(queueResult.processedCount >= 1, 'Messages processed from communication queue');
assert(queueResult.sentMessages[0].status === 'SENT', 'Processed message status updated to SENT');
assert(queueResult.sentMessages[0].deliveredAt !== undefined, 'Delivered timestamp recorded');

// -------------------------------------------------------------
// Test 4: Conversation Loop Protection & Human Handoff
// -------------------------------------------------------------
console.log('\n[Test 4] Conversation Loop Protection & Human Handoff...');
const thread = getOrCreateThread({ customerId: 'cust_7001', organizationId: 'org_glam', channel: 'WHATSAPP' });

recordAutomatedTurn(thread.threadId); // Turn 1
recordAutomatedTurn(thread.threadId); // Turn 2
const turn3 = recordAutomatedTurn(thread.threadId); // Turn 3 -> Trigger Escalation

assert(turn3.allowed === false, '4th automated turn BLOCKED by loop protection');
assert(turn3.escalationTriggered === true, 'Human handoff escalation triggered');
assert(getHandoffEscalations().length >= 1, 'Handoff escalation logged in escalations store');

// -------------------------------------------------------------
// Test 5: Internal Notes Protection
// -------------------------------------------------------------
console.log('\n[Test 5] Internal Notes Protection...');
const internalSanitize = sanitizeCustomerPayload({ body: 'Customer is demanding refund; check risk log', internalNoteOnly: true });
assert(internalSanitize.isDeliveredToCustomer === false, 'Internal note marked not delivered to customer');
assert(internalSanitize.safePayload === '', 'Internal note stripped from customer payload');

const customerSanitize = sanitizeCustomerPayload({ body: 'Hello Pooja, your appointment is set for 10 AM.', internalNoteOnly: false });
assert(customerSanitize.isDeliveredToCustomer === true, 'Customer message delivered');
assert(customerSanitize.safePayload.includes('appointment is set'), 'Customer payload preserved');

console.log('\n=================================================');
console.log(`ALL V10.5 TESTS PASSED SUCCESSFULLY! (${assertionsPassed} assertions) 💬🏆`);
console.log('=================================================\n');
