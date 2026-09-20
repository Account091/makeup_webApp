/**
 * V9.6 AI Tool Classification, Authorization & Business Rule Boundary Guard
 */

export type AIToolRiskLevel = 'READ_ONLY' | 'CONTROLLED_WRITE' | 'HIGHLY_SENSITIVE';

export interface AIToolDefinition {
  toolName: string;
  riskLevel: AIToolRiskLevel;
  allowedRoles: string[];
  requiresHumanConfirmation: boolean;
}

export const REGISTERED_AI_TOOLS: Record<string, AIToolDefinition> = {
  // Read-only tools
  searchServices: { toolName: 'searchServices', riskLevel: 'READ_ONLY', allowedRoles: ['CUSTOMER', 'ARTIST', 'SUPER_ADMIN'], requiresHumanConfirmation: false },
  getBooking: { toolName: 'getBooking', riskLevel: 'READ_ONLY', allowedRoles: ['CUSTOMER', 'ARTIST', 'SUPER_ADMIN'], requiresHumanConfirmation: false },
  getAvailability: { toolName: 'getAvailability', riskLevel: 'READ_ONLY', allowedRoles: ['CUSTOMER', 'ARTIST', 'SUPER_ADMIN'], requiresHumanConfirmation: false },
  getCustomerSummary: { toolName: 'getCustomerSummary', riskLevel: 'READ_ONLY', allowedRoles: ['ARTIST', 'SUPER_ADMIN'], requiresHumanConfirmation: false },
  
  // Controlled write tools
  createDraft: { toolName: 'createDraft', riskLevel: 'CONTROLLED_WRITE', allowedRoles: ['ARTIST', 'SUPER_ADMIN'], requiresHumanConfirmation: false },
  createFollowupTask: { toolName: 'createFollowupTask', riskLevel: 'CONTROLLED_WRITE', allowedRoles: ['ARTIST', 'SUPER_ADMIN'], requiresHumanConfirmation: false },
  
  // Highly sensitive mutation tools (BLOCKED from autonomous execution)
  approvePayment: { toolName: 'approvePayment', riskLevel: 'HIGHLY_SENSITIVE', allowedRoles: ['SUPER_ADMIN'], requiresHumanConfirmation: true },
  refund: { toolName: 'refund', riskLevel: 'HIGHLY_SENSITIVE', allowedRoles: ['SUPER_ADMIN'], requiresHumanConfirmation: true },
  ledgerReversal: { toolName: 'ledgerReversal', riskLevel: 'HIGHLY_SENSITIVE', allowedRoles: ['SUPER_ADMIN'], requiresHumanConfirmation: true },
  tenantDeletion: { toolName: 'tenantDeletion', riskLevel: 'HIGHLY_SENSITIVE', allowedRoles: ['SUPER_ADMIN'], requiresHumanConfirmation: true },
};

export function authorizeAIToolCall(params: {
  toolName: string;
  actorRole: string;
  isAutonomousExecution: boolean;
}): { authorized: boolean; reason?: string } {
  const tool = REGISTERED_AI_TOOLS[params.toolName];
  if (!tool) {
    return { authorized: false, reason: `Unknown tool '${params.toolName}' rejected by tool allowlist.` };
  }

  if (!tool.allowedRoles.includes(params.actorRole)) {
    return { authorized: false, reason: `Role '${params.actorRole}' is not authorized to invoke tool '${params.toolName}'.` };
  }

  // Highly sensitive tools CANNOT be executed autonomously by AI
  if (tool.riskLevel === 'HIGHLY_SENSITIVE' && params.isAutonomousExecution) {
    return {
      authorized: false,
      reason: `Tool '${params.toolName}' is HIGHLY_SENSITIVE. Autonomous AI execution is DENIED; explicit human confirmation is required.`,
    };
  }

  return { authorized: true };
}

/**
 * Validates that an AI recommendation cannot override deterministic business rules.
 * e.g., AI recommending booking approval when payment is unverified.
 */
export function evaluateBusinessRuleOverride(params: {
  aiRecommendation: string;
  deterministicState: { paymentVerified: boolean; calendarAvailable: boolean };
}): { actionAllowed: boolean; finalStatus: string; reason?: string } {
  if (params.aiRecommendation === 'APPROVE_BOOKING' && !params.deterministicState.paymentVerified) {
    return {
      actionAllowed: false,
      finalStatus: 'PENDING_PAYMENT_VERIFICATION',
      reason: 'AI recommendation overridden: Payment verification is strictly server-authoritative and incomplete.',
    };
  }

  return { actionAllowed: true, finalStatus: 'APPROVED' };
}
