/**
 * Marketplace Fraud & Risk Hardening Domain Types — V9.5
 */

export type RiskCategory =
  | 'FAKE_ACCOUNT'
  | 'PAYMENT_ABUSE'
  | 'REVIEW_MANIPULATION'
  | 'COUPON_REFERRAL_ABUSE'
  | 'SETTLEMENT_FRAUD'
  | 'IMPERSONATION'
  | 'SUSPICIOUS_BOOKING';

export type RiskDecision = 'ALLOW' | 'REVIEW' | 'HOLD' | 'ESCALATE';

export interface RiskSignal {
  signalId: string;
  category: RiskCategory;
  name: string;
  scoreImpact: number; // 0 to 100
  evidence: Record<string, any>;
  detectedAt: string;
}

export interface RiskEvaluationRequest {
  actorUid: string;
  actorRole: 'CUSTOMER' | 'ARTIST';
  deviceId?: string;
  ipAddress?: string;
  phone?: string;
  email?: string;
  bookingId?: string;
  amount?: number;
  paymentMethodId?: string;
  promoCode?: string;
  referralCode?: string;
  reviewId?: string;
  targetUid?: string;
}

export interface RiskEvaluationResult {
  evaluationId: string;
  actorUid: string;
  riskScore: number; // 0 to 100 aggregate
  decision: RiskDecision;
  signals: RiskSignal[];
  reasons: string[];
  requiresHumanReview: boolean;
  evaluatedAt: string;
}

export interface RiskCaseReview {
  caseId: string;
  evaluationId: string;
  actorUid: string;
  category: RiskCategory;
  currentStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  assignedReviewerUid?: string;
  decisionOverride?: RiskDecision;
  reviewNotes?: string;
  updatedAt: string;
}
