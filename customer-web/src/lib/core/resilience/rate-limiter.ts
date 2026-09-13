/**
 * Server-Side Rate Limiter — V9.0
 */

import { RateLimitRecord } from '../system-types';

const rateLimitStore = new Map<string, { count: number; windowStartMs: number }>();

export function checkRateLimit(params: {
  subject: string;
  endpoint: string;
  maxRequests: number;
  windowSeconds: number;
}): RateLimitRecord {
  const key = `${params.subject}:${params.endpoint}`;
  const now = Date.now();
  const windowMs = params.windowSeconds * 1000;

  let entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStartMs > windowMs) {
    entry = { count: 1, windowStartMs: now };
    rateLimitStore.set(key, entry);
    return {
      subject: params.subject,
      endpoint: params.endpoint,
      windowStart: new Date(entry.windowStartMs).toISOString(),
      count: 1,
      limit: params.maxRequests,
      blocked: false,
    };
  }

  entry.count += 1;
  const blocked = entry.count > params.maxRequests;

  return {
    subject: params.subject,
    endpoint: params.endpoint,
    windowStart: new Date(entry.windowStartMs).toISOString(),
    count: entry.count,
    limit: params.maxRequests,
    blocked,
  };
}

export function clearRateLimits(): void {
  rateLimitStore.clear();
}
