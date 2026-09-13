/**
 * Privacy Access Audit Logger — V9.1
 */

import { PrivacyAccessEvent, PrivacyAccessEventType } from './privacy-types';

const accessLog: PrivacyAccessEvent[] = [];

export function logPrivacyAccessEvent(params: {
  eventType: PrivacyAccessEventType;
  uid: string;
  resourceType: string;
  resourceId: string;
  requestId: string;
  organizationId?: string;
  result?: 'ALLOWED' | 'DENIED';
}): PrivacyAccessEvent {
  const event: PrivacyAccessEvent = {
    eventId: `pae_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    eventType: params.eventType,
    uid: params.uid,
    organizationId: params.organizationId,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    timestamp: new Date().toISOString(),
    requestId: params.requestId,
    result: params.result || 'ALLOWED',
  };
  accessLog.push(event);
  return event;
}

export function getPrivacyAccessLog(limit: number = 50): PrivacyAccessEvent[] {
  return [...accessLog].reverse().slice(0, limit);
}

export function clearPrivacyAccessLog(): void {
  accessLog.length = 0;
}
