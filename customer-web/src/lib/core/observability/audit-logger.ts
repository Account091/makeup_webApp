/**
 * Standardized Audit Event Logger — V9.0
 */

import { AuditEventRecord } from '../system-types';
import { redactSensitiveData } from '../errors/error-codes';

const inMemoryAuditLedger: AuditEventRecord[] = [];

export function logAuditEvent(params: {
  requestId: string;
  actorUid: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  organizationId?: string;
  result?: 'SUCCESS' | 'FAILED' | 'DENIED';
  metadata?: Record<string, any>;
}): AuditEventRecord {
  const event: AuditEventRecord = {
    eventId: `audit_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    requestId: params.requestId,
    actorUid: params.actorUid,
    actorRole: params.actorRole,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    organizationId: params.organizationId,
    timestamp: new Date().toISOString(),
    result: params.result || 'SUCCESS',
    metadata: params.metadata ? redactSensitiveData(params.metadata) : undefined,
  };

  inMemoryAuditLedger.push(event);
  return event;
}

export function getAuditEvents(limitCount: number = 50): AuditEventRecord[] {
  return [...inMemoryAuditLedger].reverse().slice(0, limitCount);
}

export function clearAuditLog(): void {
  inMemoryAuditLedger.length = 0;
}
