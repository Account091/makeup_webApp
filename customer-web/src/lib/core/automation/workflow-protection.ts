/**
 * V10.1 Workflow Protection, Risk Integration & Communication Preferences Engine
 */

import { WorkflowRun } from './workflow-types';
import { evaluateRisk } from '../risk/risk-engine';

export interface CommunicationPreferences {
  userId: string;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  fcmEnabled: boolean;
  quietHoursActive: boolean;
}

export function canSendCommunication(params: {
  userId: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'FCM';
  prefs: CommunicationPreferences;
}): { allowed: boolean; reason?: string } {
  const { channel, prefs } = params;

  if (prefs.quietHoursActive) {
    return { allowed: false, reason: 'Communication blocked during quiet hours' };
  }

  if (channel === 'WHATSAPP' && !prefs.whatsappEnabled) {
    return { allowed: false, reason: 'Customer has disabled WhatsApp communications' };
  }

  if (channel === 'EMAIL' && !prefs.emailEnabled) {
    return { allowed: false, reason: 'Customer has disabled Email communications' };
  }

  if (channel === 'FCM' && !prefs.fcmEnabled) {
    return { allowed: false, reason: 'Customer has disabled Push notifications' };
  }

  return { allowed: true };
}

/**
 * Validates that risk signals (V9.5) override automated workflow execution.
 */
export function checkRiskWorkflowProtection(params: {
  actorUid: string;
  actorRole: 'CUSTOMER' | 'ARTIST';
  amount?: number;
  deviceId?: string;
}): { canExecuteWorkflow: boolean; riskDecision: string; reason?: string } {
  const riskResult = evaluateRisk({
    actorUid: params.actorUid,
    actorRole: params.actorRole,
    amount: params.amount,
    deviceId: params.deviceId,
  });

  if (riskResult.decision === 'HOLD' || riskResult.decision === 'ESCALATE') {
    return {
      canExecuteWorkflow: false,
      riskDecision: riskResult.decision,
      reason: `Workflow execution PAUSED due to high risk decision '${riskResult.decision}'. Human review required.`,
    };
  }

  return { canExecuteWorkflow: true, riskDecision: riskResult.decision };
}

/**
 * Ensures workflows CANNOT mutate financial ledgers directly and must use server functions.
 */
export function validateFinancialWorkflowBoundary(params: {
  actionType: string;
  usesAuthoritativeFunction: boolean;
}): { valid: boolean; error?: string } {
  if (params.actionType.startsWith('DIRECT_LEDGER_WRITE') && !params.usesAuthoritativeFunction) {
    return {
      valid: false,
      error: 'Financial Safety Violation: Direct ledger mutation from generic workflow step is forbidden. Must invoke server-authoritative ledger function.',
    };
  }

  return { valid: true };
}
