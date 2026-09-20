/**
 * V9.6 AI Security Policy & Kill Switch Control
 */

export interface AISecurityPolicy {
  enabled: boolean;
  maxInputLength: number;
  maxOutputTokens: number;
  maxRequestsPerUser: number;
  maxRequestsPerTenant: number;
  dailyBudget: number;
  monthlyBudget: number;

  allowCustomerTools: boolean;
  allowAdminTools: boolean;
  allowMarketplaceTools: boolean;

  requireConfirmationForSensitiveTools: boolean;
  blockSensitiveDataInPrompt: boolean;
}

export type AIKillSwitchKey =
  | 'AI_GLOBAL'
  | 'CUSTOMER_CONCIERGE'
  | 'ADMIN_COPILOT'
  | 'CONTENT_DRAFTER'
  | 'WHATSAPP_ASSISTANT'
  | 'PAYMENT_VISION';

const defaultPolicy: AISecurityPolicy = {
  enabled: true,
  maxInputLength: 4000,
  maxOutputTokens: 1000,
  maxRequestsPerUser: 50,
  maxRequestsPerTenant: 500,
  dailyBudget: 1000, // ₹0-first estimated token budget
  monthlyBudget: 30000,

  allowCustomerTools: true,
  allowAdminTools: true,
  allowMarketplaceTools: true,

  requireConfirmationForSensitiveTools: true,
  blockSensitiveDataInPrompt: true,
};

const killSwitches: Record<AIKillSwitchKey, boolean> = {
  AI_GLOBAL: true,
  CUSTOMER_CONCIERGE: true,
  ADMIN_COPILOT: true,
  CONTENT_DRAFTER: true,
  WHATSAPP_ASSISTANT: true,
  PAYMENT_VISION: true,
};

export function getAISecurityPolicy(): AISecurityPolicy {
  return { ...defaultPolicy };
}

export function isKillSwitchActive(key: AIKillSwitchKey): boolean {
  if (!killSwitches.AI_GLOBAL) return false;
  return killSwitches[key] ?? false;
}

export function setKillSwitch(key: AIKillSwitchKey, enabled: boolean): void {
  killSwitches[key] = enabled;
}
