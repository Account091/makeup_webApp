/**
 * Request ID & Context Propagation — V9.0
 */

import { RequestContext, CorrelationContext } from '../system-types';

export function generateRequestId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 8);
  return `req_${dateStr}_${rand}`;
}

export function extractRequestContext(reqHeaders: Headers | Record<string, string>): RequestContext {
  const getHeader = (key: string): string | undefined => {
    if (reqHeaders instanceof Headers) {
      return reqHeaders.get(key) || undefined;
    }
    return reqHeaders[key] || reqHeaders[key.toLowerCase()];
  };

  const requestId = getHeader('x-request-id') || generateRequestId();
  const actorUid = getHeader('x-actor-uid');
  const actorRole = getHeader('x-actor-role');
  const organizationId = getHeader('x-organization-id');
  const ipAddress = getHeader('x-forwarded-for') || getHeader('cf-connecting-ip');
  const userAgent = getHeader('user-agent');

  return {
    requestId,
    timestamp: new Date().toISOString(),
    actorUid,
    actorRole,
    organizationId,
    ipAddress,
    userAgent,
  };
}

export function buildCorrelationContext(
  requestId: string,
  overrides?: Partial<CorrelationContext>
): CorrelationContext {
  return {
    requestId,
    bookingId: overrides?.bookingId,
    paymentId: overrides?.paymentId,
    customerId: overrides?.customerId,
    organizationId: overrides?.organizationId,
    conversationId: overrides?.conversationId,
    aiRequestId: overrides?.aiRequestId,
  };
}
