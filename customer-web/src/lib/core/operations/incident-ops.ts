/**
 * V10.0 Post-Incident Review, Runbook Mapping & Severity Matrix
 */

import {
  IncidentSeverity,
  CustomerImpactLevel,
  PostIncidentReview,
} from './operations-types';

const postIncidentReviewsStore: PostIncidentReview[] = [];

export interface OperationalRunbook {
  runbookId: string;
  topic: string;
  severity: IncidentSeverity;
  detection: string;
  verification: string;
  containment: string;
  authorizedActions: string[];
  recoverySteps: string[];
}

export const OPERATIONAL_RUNBOOKS: Record<string, OperationalRunbook> = {
  PAYMENT_FAILURE: {
    runbookId: 'rb_pay_01',
    topic: 'Payment Gateway / Settlement Failure',
    severity: 'SEV-1',
    detection: 'Alert on payment failure rate > 5%',
    verification: 'Check payment log webhook response codes & bank status page',
    containment: 'Switch payment option display to manual UTR fallback',
    authorizedActions: ['ENABLE_MANUAL_PAYMENT_FALLBACK', 'PAUSE_GATEWAY'],
    recoverySteps: ['Verify gateway webhook endpoint', 'Re-test test transaction', 'Resume gateway'],
  },
  WHATSAPP_OUTAGE: {
    runbookId: 'rb_wa_01',
    topic: 'WhatsApp Meta API Delivery Outage',
    severity: 'SEV-2',
    detection: 'WhatsApp message status callback failure spike',
    verification: 'Check Meta Business status dashboard',
    containment: 'Fallback notification delivery to SMS & FCM in-app',
    authorizedActions: ['ENABLE_SMS_FALLBACK'],
    recoverySteps: ['Verify Meta access token validity', 'Flush pending queue'],
  },
  AI_OUTAGE: {
    runbookId: 'rb_ai_01',
    topic: 'Hugging Face AI Inference Failure',
    severity: 'SEV-3',
    detection: 'AI Circuit Breaker status = OPEN',
    verification: 'Check Hugging Face model API health status',
    containment: 'Activate static FAQ & manual support fallback matrix',
    authorizedActions: ['TOGGLE_AI_KILL_SWITCH'],
    recoverySteps: ['Verify API health', 'Reset circuit breaker'],
  },
};

export function createPostIncidentReview(params: {
  incidentId: string;
  severity: IncidentSeverity;
  customerImpact: CustomerImpactLevel;
  rootCause: string;
  contributingFactors: string[];
  impactSummary: string;
  detectionGap: string;
  resolution: string;
  preventiveActions: string[];
  owner: string;
  dueDate: string;
}): PostIncidentReview {
  const review: PostIncidentReview = {
    reviewId: `pir_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    incidentId: params.incidentId,
    severity: params.severity,
    customerImpact: params.customerImpact,
    rootCause: params.rootCause,
    contributingFactors: params.contributingFactors,
    impactSummary: params.impactSummary,
    detectionGap: params.detectionGap,
    resolution: params.resolution,
    preventiveActions: params.preventiveActions,
    owner: params.owner,
    dueDate: params.dueDate,
    createdAt: new Date().toISOString(),
  };

  postIncidentReviewsStore.push(review);
  return review;
}

export function getPostIncidentReviews(): PostIncidentReview[] {
  return [...postIncidentReviewsStore];
}
