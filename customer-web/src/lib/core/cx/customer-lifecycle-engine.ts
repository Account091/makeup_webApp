/**
 * V10.2 Customer Lifecycle & Experience Health Engine
 */

import {
  LifecycleStage,
  CustomerLifecycleRecord,
  CustomerExperienceProfile,
  CXHealthStatus,
} from './cx-types';

const lifecycleStore = new Map<string, CustomerLifecycleRecord>();
const cxProfileStore = new Map<string, CustomerExperienceProfile>();

export function updateCustomerLifecycleStage(params: {
  customerId: string;
  organizationId: string;
  stage: LifecycleStage;
}): CustomerLifecycleRecord {
  const now = new Date().toISOString();
  let record = lifecycleStore.get(params.customerId);

  if (!record) {
    record = {
      customerId: params.customerId,
      organizationId: params.organizationId,
      lifecycleStage: params.stage,
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
    };
  } else {
    record.lifecycleStage = params.stage;
    record.lastActivityAt = now;
    record.updatedAt = now;
  }

  lifecycleStore.set(params.customerId, record);
  return record;
}

export function calculateCustomerExperienceHealth(params: {
  unansweredLead: boolean;
  delayedFollowup: boolean;
  serviceCancellation: boolean;
  hasUnresolvedComplaint: boolean;
}): CXHealthStatus {
  if (params.hasUnresolvedComplaint || params.serviceCancellation) {
    return 'AT_RISK';
  }
  if (params.unansweredLead || params.delayedFollowup) {
    return 'ATTENTION';
  }
  return 'HEALTHY';
}

export function resolveCustomerPreferences(params: {
  explicitPreferences?: { channel?: string; location?: string };
  storedApprovedPreferences?: { channel?: string; location?: string };
  behavioralInference?: { channel?: string; location?: string };
}): { preferredChannel: string; preferredLocation: string; source: string } {
  // Explicit > Stored Approved > Behavioral Inference > Default
  const channel =
    params.explicitPreferences?.channel ||
    params.storedApprovedPreferences?.channel ||
    params.behavioralInference?.channel ||
    'WHATSAPP';

  const location =
    params.explicitPreferences?.location ||
    params.storedApprovedPreferences?.location ||
    params.behavioralInference?.location ||
    'Studio';

  const source = params.explicitPreferences?.channel
    ? 'EXPLICIT_CUSTOMER'
    : params.storedApprovedPreferences?.channel
    ? 'STORED_APPROVED'
    : 'BEHAVIORAL_INFERENCE';

  return { preferredChannel: channel, preferredLocation: location, source };
}

export function calculateNextBestAction(params: {
  stage: LifecycleStage;
  cxHealth: CXHealthStatus;
  hasUnresolvedCase: boolean;
}): { nextAction: string; priority: 'URGENT' | 'HIGH' | 'NORMAL' } {
  if (params.hasUnresolvedCase) {
    return { nextAction: 'RESOLVE_CUSTOMER_CASE', priority: 'URGENT' };
  }

  if (params.cxHealth === 'AT_RISK') {
    return { nextAction: 'INITIATE_EXPERIENCE_RECOVERY', priority: 'HIGH' };
  }

  switch (params.stage) {
    case 'LEAD':
      return { nextAction: 'SCHEDULE_CONSULTATION', priority: 'HIGH' };
    case 'QUOTE_SENT':
      return { nextAction: 'FOLLOW_UP_QUOTE_DEPOSIT', priority: 'HIGH' };
    case 'CONFIRMED':
      return { nextAction: 'SEND_PREPARATION_CHECKLIST', priority: 'NORMAL' };
    case 'SERVICE_COMPLETED':
      return { nextAction: 'REQUEST_REVIEW_AND_THANK_YOU', priority: 'NORMAL' };
    case 'REPEAT_CUSTOMER':
      return { nextAction: 'OFFER_LOYALTY_REWARD', priority: 'NORMAL' };
    case 'INACTIVE':
      return { nextAction: 'SEND_RE_ENGAGEMENT_OFFER', priority: 'NORMAL' };
    default:
      return { nextAction: 'PROVIDE_GENERAL_CONCIERGE_HELP', priority: 'NORMAL' };
  }
}

export function getCustomerLifecycle(customerId: string): CustomerLifecycleRecord | undefined {
  return lifecycleStore.get(customerId);
}
