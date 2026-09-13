/**
 * Idempotency Framework — V9.0
 */

import { IdempotencyRecord } from '../system-types';

const inMemoryIdempotencyStore = new Map<string, IdempotencyRecord>();

export function checkOrCreateIdempotencyKey(params: {
  key: string;
  requestId: string;
  action: string;
  ttlSeconds?: number;
}): { isDuplicate: boolean; record: IdempotencyRecord } {
  const existing = inMemoryIdempotencyStore.get(params.key);
  if (existing) {
    return { isDuplicate: true, record: existing };
  }

  const ttl = params.ttlSeconds || 86400; // Default 24 hours
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttl * 1000).toISOString();

  const record: IdempotencyRecord = {
    key: params.key,
    requestId: params.requestId,
    action: params.action,
    status: 'PROCESSING',
    createdAt: now.toISOString(),
    expiresAt,
  };

  inMemoryIdempotencyStore.set(params.key, record);
  return { isDuplicate: false, record };
}

export function completeIdempotencyKey(key: string, responsePayload: any): void {
  const record = inMemoryIdempotencyStore.get(key);
  if (record) {
    record.status = 'COMPLETED';
    record.completedAt = new Date().toISOString();
    record.responsePayload = responsePayload;
  }
}

export function failIdempotencyKey(key: string): void {
  const record = inMemoryIdempotencyStore.get(key);
  if (record) {
    record.status = 'FAILED';
  }
}

export function clearIdempotencyStore(): void {
  inMemoryIdempotencyStore.clear();
}
