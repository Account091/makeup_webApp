/**
 * V10.5 Support Handoff, Conversation Loop Protection & Internal Notes Engine
 */

import { CommunicationThread, HandoffEscalation } from './comm-types';

const threadsStore = new Map<string, CommunicationThread>();
const escalationsStore: HandoffEscalation[] = [];

export function getOrCreateThread(params: {
  customerId: string;
  organizationId: string;
  channel: CommunicationThread['channel'];
}): CommunicationThread {
  const threadId = `thread_${params.customerId}_${params.organizationId}`;
  let thread = threadsStore.get(threadId);

  if (!thread) {
    thread = {
      threadId,
      customerId: params.customerId,
      organizationId: params.organizationId,
      channel: params.channel,
      status: 'OPEN',
      automatedTurnsCount: 0,
      lastMessageAt: new Date().toISOString(),
    };
    threadsStore.set(threadId, thread);
  }

  return thread;
}

export function recordAutomatedTurn(threadId: string): { allowed: boolean; thread: CommunicationThread; escalationTriggered: boolean } {
  const thread = threadsStore.get(threadId);
  if (!thread) throw new Error('Thread not found');

  thread.automatedTurnsCount++;
  thread.lastMessageAt = new Date().toISOString();

  // Loop Protection: Max 3 automated turns before triggering human handoff
  if (thread.automatedTurnsCount >= 3) {
    thread.status = 'WAITING_FOR_TEAM';
    triggerHumanHandoff({
      threadId: thread.threadId,
      customerId: thread.customerId,
      reason: 'AI_UNCERTAINTY',
    });
    return { allowed: false, thread, escalationTriggered: true };
  }

  return { allowed: true, thread, escalationTriggered: false };
}

export function triggerHumanHandoff(params: {
  threadId: string;
  customerId: string;
  reason: HandoffEscalation['reason'];
}): HandoffEscalation {
  const escalation: HandoffEscalation = {
    escalationId: `esc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    threadId: params.threadId,
    customerId: params.customerId,
    reason: params.reason,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  escalationsStore.push(escalation);
  return escalation;
}

export function sanitizeCustomerPayload(params: {
  body: string;
  internalNoteOnly?: boolean;
}): { safePayload: string; isDeliveredToCustomer: boolean } {
  if (params.internalNoteOnly) {
    return { safePayload: '', isDeliveredToCustomer: false };
  }

  return { safePayload: params.body, isDeliveredToCustomer: true };
}

export function getHandoffEscalations(): HandoffEscalation[] {
  return [...escalationsStore];
}
