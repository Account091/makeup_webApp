/**
 * Canonical Error Mapper — V9.0
 */

import { AppError } from './app-error';

export function mapToAppError(
  err: any,
  requestId: string = `req_${Date.now().toString(36)}`
): AppError {
  if (err instanceof AppError) {
    return err;
  }

  const msg = err?.message || String(err || 'Unknown error');

  if (msg.includes('permission-denied') || msg.includes('unauthorized')) {
    return new AppError({
      code: 'FORBIDDEN',
      message: 'Access denied: insufficient permissions',
      httpStatus: 403,
      requestId,
      internalDetails: msg,
    });
  }

  if (msg.includes('not-found') || msg.includes('does not exist')) {
    return new AppError({
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
      httpStatus: 404,
      requestId,
      internalDetails: msg,
    });
  }

  if (msg.includes('rate-limit') || msg.includes('too many requests')) {
    return new AppError({
      code: 'RATE_LIMITED',
      message: 'Rate limit exceeded. Please try again later.',
      httpStatus: 429,
      requestId,
      internalDetails: msg,
    });
  }

  if (msg.includes('unavailable') || msg.includes('timeout') || msg.includes('network')) {
    return new AppError({
      code: 'DEPENDENCY_UNAVAILABLE',
      message: 'External service dependency unavailable',
      httpStatus: 503,
      requestId,
      internalDetails: msg,
    });
  }

  return new AppError({
    code: 'INTERNAL_ERROR',
    message: 'An internal server error occurred',
    httpStatus: 500,
    requestId,
    internalDetails: msg,
  });
}
