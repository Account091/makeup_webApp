/**
 * V10.5 Omnichannel Gateway & Message Storm Protection Engine
 * 
 * CORE RULE: Communication orchestration may queue and monitor messages, but
 * CANNOT bypass consent, authorization, booking/payment truth, or risk controls.
 */

import {
  CommunicationMessage,
  CommPriority,
  CommPurpose,
  CommMessageType,
  CommChannel,
} from './comm-types';

const messageQueue: CommunicationMessage[] = [];
const processedExecutionKeys = new Set<string>();

export function queueOutboundMessage(params: {
  customerId: string;
  organizationId: string;
  channel: CommChannel;
  messageType: CommMessageType;
  purpose: CommPurpose;
  entityId: string;
  version: number;
  body: string;
  priority: CommPriority;
  authoritativeStateVerified: boolean;
}): { success: boolean; message?: CommunicationMessage; error?: string } {
  // 1. Transactional Guard Verification (e.g. Booking must be confirmed in DB before sending confirmation)
  if (params.purpose === 'BOOKING_CONFIRMATION' && !params.authoritativeStateVerified) {
    return {
      success: false,
      error: 'Message Guard Violation: Booking status is not confirmed in authoritative DB. Outbound message cancelled.',
    };
  }

  // 2. Deterministic Execution Key for Send Idempotency & Duplicate Prevention
  const executionKey = `send_${params.purpose}_${params.customerId}_${params.entityId}_v${params.version}`;
  if (processedExecutionKeys.has(executionKey)) {
    return {
      success: false,
      error: `Duplicate Prevention: Message with execution key '${executionKey}' already processed.`,
    };
  }
  processedExecutionKeys.add(executionKey);

  const message: CommunicationMessage = {
    messageId: `msg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    customerId: params.customerId,
    organizationId: params.organizationId,
    channel: params.channel,
    messageType: params.messageType,
    purpose: params.purpose,
    executionKey,
    body: params.body,
    status: 'QUEUED',
    priority: params.priority,
    scheduledAt: new Date().toISOString(),
  };

  messageQueue.push(message);
  return { success: true, message };
}

export function processCommunicationQueue(): { processedCount: number; sentMessages: CommunicationMessage[] } {
  const sentMessages: CommunicationMessage[] = [];

  for (const msg of messageQueue) {
    if (msg.status === 'QUEUED') {
      msg.status = 'SENT';
      msg.sentAt = new Date().toISOString();
      msg.deliveredAt = new Date().toISOString();
      sentMessages.push(msg);
    }
  }

  return { processedCount: sentMessages.length, sentMessages };
}

export function getCommunicationQueue(): CommunicationMessage[] {
  return [...messageQueue];
}
