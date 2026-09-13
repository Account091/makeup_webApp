/**
 * Centralized AppError Class — V9.0
 */

import { AppErrorCode, AppErrorOptions } from '../system-types';
import { ERROR_HTTP_STATUS, redactSensitiveData } from './error-codes';

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly httpStatus: number;
  public readonly requestId: string;
  public readonly timestamp: string;
  public readonly details?: Record<string, any>;
  public readonly internalDetails?: string;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.httpStatus = options.httpStatus || ERROR_HTTP_STATUS[options.code] || 500;
    this.requestId = options.requestId || `req_${Date.now().toString(36)}`;
    this.timestamp = new Date().toISOString();
    this.details = options.details ? redactSensitiveData(options.details) : undefined;
    this.internalDetails = options.internalDetails;

    // Preserve stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  public toJSONResponse() {
    return {
      success: false as const,
      error: {
        code: this.code,
        message: this.message,
        requestId: this.requestId,
        timestamp: this.timestamp,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}
