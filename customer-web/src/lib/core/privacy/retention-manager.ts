/**
 * Retention Policy Manager — V9.1
 */

import { RetentionPolicy } from './privacy-types';

const retentionPolicies: RetentionPolicy[] = [
  { policyId: 'ret_temp_upload', category: 'TEMP_UPLOAD', retentionDays: 7, action: 'DELETE', legalHoldAllowed: false, active: true, version: '2026-09-v1' },
  { policyId: 'ret_payment_proof', category: 'PAYMENT_PROOF', retentionDays: 365, action: 'ARCHIVE', legalHoldAllowed: true, active: true, version: '2026-09-v1' },
  { policyId: 'ret_chat', category: 'CHAT', retentionDays: 180, action: 'ANONYMIZE', legalHoldAllowed: true, active: true, version: '2026-09-v1' },
  { policyId: 'ret_customer_profile', category: 'CUSTOMER_PROFILE', retentionDays: 730, action: 'ANONYMIZE', legalHoldAllowed: true, active: true, version: '2026-09-v1' },
  { policyId: 'ret_support_case', category: 'SUPPORT_CASE', retentionDays: 365, action: 'ANONYMIZE', legalHoldAllowed: true, active: true, version: '2026-09-v1' },
  { policyId: 'ret_audit_event', category: 'AUDIT_EVENT', retentionDays: 2555, action: 'ARCHIVE', legalHoldAllowed: true, active: true, version: '2026-09-v1' },
  { policyId: 'ret_financial_record', category: 'FINANCIAL_RECORD', retentionDays: 2555, action: 'ARCHIVE', legalHoldAllowed: true, active: true, version: '2026-09-v1' },
  { policyId: 'ret_marketing_event', category: 'MARKETING_EVENT', retentionDays: 90, action: 'DELETE', legalHoldAllowed: false, active: true, version: '2026-09-v1' },
  { policyId: 'ret_ai_log', category: 'AI_LOG', retentionDays: 30, action: 'DELETE', legalHoldAllowed: false, active: true, version: '2026-09-v1' },
];

export function getRetentionPolicies(): RetentionPolicy[] {
  return [...retentionPolicies];
}

export function getRetentionPolicy(category: string): RetentionPolicy | undefined {
  return retentionPolicies.find(p => p.category === category);
}

export function updateRetentionPolicy(policyId: string, updates: Partial<RetentionPolicy>): RetentionPolicy | null {
  const policy = retentionPolicies.find(p => p.policyId === policyId);
  if (policy) {
    Object.assign(policy, updates);
    return policy;
  }
  return null;
}
