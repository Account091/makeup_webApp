/**
 * Standardized Error Response Generator — V9.0
 */

import { NextResponse } from 'next/server';
import { AppError } from './app-error';
import { AppErrorCode } from '../system-types';
import { ERROR_HTTP_STATUS } from './error-codes';

export function createErrorResponse(
  error: AppError | Error | unknown,
  defaultCode: AppErrorCode = 'INTERNAL_ERROR',
  requestId: string = `req_${Date.now().toString(36)}`
): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSONResponse(), { status: error.httpStatus });
  }

  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred';
  const status = ERROR_HTTP_STATUS[defaultCode] || 500;

  return NextResponse.json(
    {
      success: false,
      error: {
        code: defaultCode,
        message,
        requestId,
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}
