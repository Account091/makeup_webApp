/**
 * Error Codes & HTTP Status Mapping — V9.0
 */

import { AppErrorCode } from '../system-types';

export const ERROR_HTTP_STATUS: Record<AppErrorCode, number> = {
  AUTH_REQUIRED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_FAILED: 400,
  CONFLICT: 409,
  EXPIRED: 410,
  RATE_LIMITED: 429,
  DEPENDENCY_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

export const SENSITIVE_PATTERNS = [
  /token/i,
  /password/i,
  /secret/i,
  /api[_-]?key/i,
  /authorization/i,
  /bearer/i,
  /private[_-]?key/i,
  /credential/i,
  /card/i,
  /cvv/i,
];

export function redactSensitiveData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(data))) {
      return '[REDACTED]';
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }
  if (typeof data === 'object') {
    const redacted: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSensitiveData(value);
      }
    }
    return redacted;
  }
  return data;
}
