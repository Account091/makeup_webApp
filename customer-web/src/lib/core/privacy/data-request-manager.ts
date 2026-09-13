/**
 * Data Request Manager — V9.1
 */

import { PrivacyDataRequest, PrivacyRequestType, PrivacyRequestStatus } from './privacy-types';

const requestStore: PrivacyDataRequest[] = [];

export function submitDataRequest(params: {
  customerId: string;
  type: PrivacyRequestType;
}): PrivacyDataRequest {
  const now = new Date().toISOString();
  const request: PrivacyDataRequest = {
    requestId: `prv_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    customerId: params.customerId,
    type: params.type,
    status: 'SUBMITTED',
    submittedAt: now,
    timeline: [{ timestamp: now, action: 'REQUEST_SUBMITTED', detail: `${params.type} request submitted by customer` }],
  };
  requestStore.push(request);
  return request;
}

export function verifyRequestIdentity(requestId: string, verifierUid: string): PrivacyDataRequest | null {
  const req = requestStore.find(r => r.requestId === requestId);
  if (!req) return null;
  const now = new Date().toISOString();
  req.status = 'VERIFYING';
  req.verifiedAt = now;
  req.timeline.push({ timestamp: now, action: 'IDENTITY_VERIFIED', detail: `Verified by ${verifierUid}` });
  return req;
}

export function processDataRequest(requestId: string): PrivacyDataRequest | null {
  const req = requestStore.find(r => r.requestId === requestId);
  if (!req) return null;
  const now = new Date().toISOString();
  req.status = 'PROCESSING';
  req.processedAt = now;
  req.timeline.push({ timestamp: now, action: 'PROCESSING_STARTED', detail: 'Data request processing initiated' });
  return req;
}

export function completeDataRequest(requestId: string): PrivacyDataRequest | null {
  const req = requestStore.find(r => r.requestId === requestId);
  if (!req) return null;
  const now = new Date().toISOString();
  req.status = 'COMPLETED';
  req.completedAt = now;
  req.timeline.push({ timestamp: now, action: 'COMPLETED', detail: 'Request fulfilled' });
  return req;
}

export function rejectDataRequest(requestId: string, reason: string): PrivacyDataRequest | null {
  const req = requestStore.find(r => r.requestId === requestId);
  if (!req) return null;
  const now = new Date().toISOString();
  req.status = 'REJECTED';
  req.rejectedAt = now;
  req.rejectionReason = reason;
  req.timeline.push({ timestamp: now, action: 'REJECTED', detail: reason });
  return req;
}

export function getDataRequests(customerId?: string): PrivacyDataRequest[] {
  if (customerId) return requestStore.filter(r => r.customerId === customerId);
  return [...requestStore];
}

export function getRequestTimeline(requestId: string) {
  const req = requestStore.find(r => r.requestId === requestId);
  return req?.timeline || [];
}
