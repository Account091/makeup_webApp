/**
 * Security Event Logger — V9.0
 */

import { SecurityEventRecord, SecurityEventType } from '../system-types';
import { redactSensitiveData } from '../errors/error-codes';

const inMemorySecurityEvents: SecurityEventRecord[] = [];

export function logSecurityEvent(params: {
  eventType: SecurityEventType;
  requestId: string;
  actorUid?: string;
  ipAddress?: string;
  organizationId?: string;
  details?: Record<string, any>;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}): SecurityEventRecord {
  const event: SecurityEventRecord = {
    eventId: `sec_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    eventType: params.eventType,
    requestId: params.requestId,
    actorUid: params.actorUid,
    ipAddress: params.ipAddress,
    organizationId: params.organizationId,
    details: params.details ? redactSensitiveData(params.details) : {},
    timestamp: new Date().toISOString(),
    severity: params.severity || (params.eventType === 'TENANT_ACCESS_ATTEMPT' ? 'HIGH' : 'MEDIUM'),
  };

  inMemorySecurityEvents.push(event);
  return event;
}

export function getSecurityEvents(limitCount: number = 50): SecurityEventRecord[] {
  return [...inMemorySecurityEvents].reverse().slice(0, limitCount);
}

export function clearSecurityEvents(): void {
  inMemorySecurityEvents.length = 0;
}
