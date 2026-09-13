/**
 * Retry Policy Engine — V9.0
 */

import { RetryPolicyType } from '../system-types';

export function determineRetryPolicy(params: {
  actionCategory: 'FINANCIAL' | 'WEBHOOK' | 'SHEETS' | 'WHATSAPP' | 'AI' | 'GENERAL';
  errorCode: string;
  isDuplicate?: boolean;
}): RetryPolicyType {
  // Financial mutations must NEVER be blindly retried
  if (params.actionCategory === 'FINANCIAL') {
    if (params.isDuplicate) return 'NO_RETRY';
    return 'MANUAL_REVIEW';
  }

  // Duplicate webhook events produce NO_RETRY
  if (params.isDuplicate) {
    return 'NO_RETRY';
  }

  // Google Sheets timeout -> SAFE_RETRY
  if (params.actionCategory === 'SHEETS') {
    return 'SAFE_RETRY';
  }

  // WhatsApp temporary provider failure -> RETRY_WITH_BACKOFF
  if (params.actionCategory === 'WHATSAPP' || params.actionCategory === 'WEBHOOK') {
    if (params.errorCode === 'DEPENDENCY_UNAVAILABLE' || params.errorCode === 'TIMEOUT') {
      return 'RETRY_WITH_BACKOFF';
    }
    return 'SAFE_RETRY';
  }

  // AI service temporary failure -> RETRY_WITH_BACKOFF
  if (params.actionCategory === 'AI') {
    if (params.errorCode === 'RATE_LIMITED') return 'RETRY_WITH_BACKOFF';
    return 'SAFE_RETRY';
  }

  return 'SAFE_RETRY';
}
