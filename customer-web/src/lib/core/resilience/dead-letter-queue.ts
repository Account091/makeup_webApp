/**
 * Dead-Letter Queue (DLQ) Manager — V9.0
 */

import { FailedEventRecord, FailedEventStatus } from '../system-types';

const inMemoryDLQ: FailedEventRecord[] = [
  {
    eventId: 'failed_event_101',
    eventType: 'SHEETS_MIRROR_SYNC',
    requestId: 'req_20260913_sheets01',
    resourceId: 'booking_9921',
    attemptCount: 3,
    maxAttempts: 5,
    lastErrorCode: 'DEPENDENCY_UNAVAILABLE',
    lastErrorMessage: 'Google Sheets API timeout',
    lastAttemptAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    nextRetryAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    status: 'PENDING',
    payload: { bookingId: 'booking_9921', action: 'SYNC_ROW' },
  },
  {
    eventId: 'failed_event_102',
    eventType: 'WHATSAPP_NOTIFICATION',
    requestId: 'req_20260913_wa01',
    resourceId: 'conv_8812',
    attemptCount: 5,
    maxAttempts: 5,
    lastErrorCode: 'PROVIDER_RATE_LIMIT',
    lastErrorMessage: 'Meta API throttling limit exceeded',
    lastAttemptAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: 'MANUAL_REVIEW',
    payload: { conversationId: 'conv_8812', recipientPhone: '+919876543210' },
  },
];

export function recordFailedEvent(params: {
  eventType: string;
  requestId: string;
  resourceId?: string;
  errorCode: string;
  errorMessage: string;
  payload: Record<string, any>;
  maxAttempts?: number;
}): FailedEventRecord {
  const event: FailedEventRecord = {
    eventId: `failed_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    eventType: params.eventType,
    requestId: params.requestId,
    resourceId: params.resourceId,
    attemptCount: 1,
    maxAttempts: params.maxAttempts || 3,
    lastErrorCode: params.errorCode,
    lastErrorMessage: params.errorMessage,
    lastAttemptAt: new Date().toISOString(),
    nextRetryAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
    status: 'PENDING',
    payload: params.payload,
  };

  inMemoryDLQ.push(event);
  return event;
}

export function updateFailedEventStatus(
  eventId: string,
  newStatus: FailedEventStatus
): FailedEventRecord | null {
  const event = inMemoryDLQ.find((e) => e.eventId === eventId);
  if (event) {
    event.status = newStatus;
    if (newStatus === 'RETRYING') {
      event.attemptCount += 1;
      event.lastAttemptAt = new Date().toISOString();
    }
    return event;
  }
  return null;
}

export function getDLQEvents(statusFilter?: FailedEventStatus): FailedEventRecord[] {
  if (statusFilter) {
    return inMemoryDLQ.filter((e) => e.status === statusFilter);
  }
  return [...inMemoryDLQ];
}
