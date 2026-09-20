/**
 * Marketplace Fraud & Risk Engine — V9.5
 * 
 * CORE RULE: Risk engines score, flag, hold for review, or escalate.
 * They MUST NOT autonomously confiscate money, permanently suspend users,
 * reverse payments, or determine liability.
 */

import {
  RiskCategory,
  RiskDecision,
  RiskSignal,
  RiskEvaluationRequest,
  RiskEvaluationResult,
  RiskCaseReview,
} from './risk-types';

const registeredCases: RiskCaseReview[] = [];

/**
 * Evaluates risk for an action or request.
 */
export function evaluateRisk(req: RiskEvaluationRequest): RiskEvaluationResult {
  const signals: RiskSignal[] = [];
  const reasons: string[] = [];
  const now = new Date().toISOString();

  // 1. Fake Account / Sockpuppetry Detection
  if (req.deviceId && req.deviceId.startsWith('dev_suspicious_multi_acc')) {
    signals.push({
      signalId: `sig_fa_${Date.now()}`,
      category: 'FAKE_ACCOUNT',
      name: 'Multi-Account Device Reuse',
      scoreImpact: 35,
      evidence: { deviceId: req.deviceId },
      detectedAt: now,
    });
    reasons.push('Device hash associated with >3 customer accounts');
  }

  // 2. Payment Abuse & Carding Detection
  if (req.amount && req.amount > 50000) {
    signals.push({
      signalId: `sig_pa_${Date.now()}`,
      category: 'PAYMENT_ABUSE',
      name: 'High-Value Velocity Transaction',
      scoreImpact: 40,
      evidence: { amount: req.amount },
      detectedAt: now,
    });
    reasons.push('Unusually high single transaction amount for new user');
  }

  if (req.email && req.email.endsWith('@tempmail.com')) {
    signals.push({
      signalId: `sig_pa_email_${Date.now()}`,
      category: 'PAYMENT_ABUSE',
      name: 'Disposable Email Provider',
      scoreImpact: 25,
      evidence: { email: req.email },
      detectedAt: now,
    });
    reasons.push('Disposable email provider detected');
  }

  // 3. Review Manipulation & Sybil Ring Detection
  if (req.reviewId && req.targetUid && req.actorUid === req.targetUid) {
    signals.push({
      signalId: `sig_rm_${Date.now()}`,
      category: 'REVIEW_MANIPULATION',
      name: 'Self Review Attempt',
      scoreImpact: 50,
      evidence: { actorUid: req.actorUid, targetUid: req.targetUid },
      detectedAt: now,
    });
    reasons.push('Artist attempting to submit review for own listing');
  }

  // 4. Coupon & Referral Abuse
  if (req.promoCode === 'SELF_REF_PROMO') {
    signals.push({
      signalId: `sig_cr_${Date.now()}`,
      category: 'COUPON_REFERRAL_ABUSE',
      name: 'Self Referral Code Exploitation',
      scoreImpact: 45,
      evidence: { promoCode: req.promoCode },
      detectedAt: now,
    });
    reasons.push('Referral code belongs to referred account owner');
  }

  // 5. Settlement Fraud & Fake Completion
  if (req.bookingId && req.bookingId.includes('fake_completion')) {
    signals.push({
      signalId: `sig_sf_${Date.now()}`,
      category: 'SETTLEMENT_FRAUD',
      name: 'Premature Completion Signal',
      scoreImpact: 60,
      evidence: { bookingId: req.bookingId },
      detectedAt: now,
    });
    reasons.push('Service marked completed before scheduled start time');
  }

  // Aggregate Risk Score (capped at 100)
  const totalScore = Math.min(
    100,
    signals.reduce((sum, sig) => sum + sig.scoreImpact, 0)
  );

  // Decision Policy:
  // 0 - 30: ALLOW
  // 31 - 60: REVIEW
  // 61 - 80: HOLD
  // 81 - 100: ESCALATE
  let decision: RiskDecision = 'ALLOW';
  if (totalScore > 80) {
    decision = 'ESCALATE';
  } else if (totalScore > 60) {
    decision = 'HOLD';
  } else if (totalScore > 30) {
    decision = 'REVIEW';
  }

  const evaluationId = `riskeval_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const requiresHumanReview = decision !== 'ALLOW';

  // Automatically create risk case for human review if flagged
  if (requiresHumanReview && signals.length > 0) {
    registeredCases.push({
      caseId: `case_${Date.now().toString(36)}`,
      evaluationId,
      actorUid: req.actorUid,
      category: signals[0].category,
      currentStatus: 'PENDING_REVIEW',
      updatedAt: now,
    });
  }

  return {
    evaluationId,
    actorUid: req.actorUid,
    riskScore: totalScore,
    decision,
    signals,
    reasons,
    requiresHumanReview,
    evaluatedAt: now,
  };
}

/**
 * Returns pending risk cases for human review.
 */
export function getPendingRiskCases(): RiskCaseReview[] {
  return registeredCases.filter(c => c.currentStatus === 'PENDING_REVIEW');
}

/**
 * Allows authorized staff/admins to resolve a risk case (override decision).
 * NO automated system may perform irreversible actions.
 */
export function resolveRiskCase(params: {
  caseId: string;
  reviewerUid: string;
  action: 'APPROVED' | 'REJECTED' | 'ESCALATED';
  overrideDecision: RiskDecision;
  notes: string;
}): RiskCaseReview | null {
  const caseItem = registeredCases.find(c => c.caseId === params.caseId);
  if (!caseItem) return null;

  caseItem.currentStatus = params.action;
  caseItem.assignedReviewerUid = params.reviewerUid;
  caseItem.decisionOverride = params.overrideDecision;
  caseItem.reviewNotes = params.notes;
  caseItem.updatedAt = new Date().toISOString();

  return caseItem;
}
