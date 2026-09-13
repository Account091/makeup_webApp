import { CommissionRule } from "./marketplace-types";

const commissionRulesStore: CommissionRule[] = [
  {
    ruleId: "rule_standard_v1",
    category: "STANDARD",
    version: 1,
    platformPercent: 10,
    gatewayPercent: 2,
    artistPercent: 88,
    commissionBaseType: "GROSS_AFTER_DISCOUNT",
    recognitionEvent: "PAYMENT_VERIFIED",
    active: true,
    effectiveFrom: "2026-01-01T00:00:00.000Z",
  },
  {
    ruleId: "rule_jaipur_premium_v1",
    category: "ORGANIZATION_SPECIFIC",
    organizationId: "jaipur-royal-glam",
    version: 1,
    platformPercent: 8,
    gatewayPercent: 2,
    artistPercent: 90,
    commissionBaseType: "GROSS_AFTER_DISCOUNT",
    recognitionEvent: "PAYMENT_VERIFIED",
    active: true,
    effectiveFrom: "2026-02-01T00:00:00.000Z",
  },
];

export function getCommissionRules(): CommissionRule[] {
  return commissionRulesStore;
}

/**
 * Resolves the authoritative active commission rule based on precedence:
 * ORGANIZATION_SPECIFIC > SERVICE_SPECIFIC > PROMOTIONAL > PREMIUM > STANDARD
 */
export function resolveActiveCommissionRule(payload: {
  organizationId?: string;
  serviceId?: string;
  transactionDate?: string;
}): CommissionRule {
  const targetDate = payload.transactionDate ? new Date(payload.transactionDate) : new Date();

  const validRules = commissionRulesStore.filter((r) => {
    if (!r.active) return false;
    const start = new Date(r.effectiveFrom);
    if (targetDate < start) return false;
    if (r.effectiveUntil) {
      const end = new Date(r.effectiveUntil);
      if (targetDate > end) return false;
    }
    return true;
  });

  // 1. Check Organization-specific rule
  if (payload.organizationId) {
    const orgRule = validRules.find(
      (r) => r.category === "ORGANIZATION_SPECIFIC" && r.organizationId === payload.organizationId
    );
    if (orgRule) return orgRule;
  }

  // 2. Check Service-specific rule
  if (payload.serviceId) {
    const serviceRule = validRules.find(
      (r) => r.category === "SERVICE_SPECIFIC" && r.serviceId === payload.serviceId
    );
    if (serviceRule) return serviceRule;
  }

  // 3. Check Promotional or Premium rule
  const promoRule = validRules.find((r) => r.category === "PROMOTIONAL" || r.category === "PREMIUM");
  if (promoRule) return promoRule;

  // 4. Default to Standard rule
  const standardRule = validRules.find((r) => r.category === "STANDARD");
  if (standardRule) return standardRule;

  // Fallback default
  return {
    ruleId: "rule_fallback_std",
    category: "STANDARD",
    version: 1,
    platformPercent: 10,
    gatewayPercent: 2,
    artistPercent: 88,
    commissionBaseType: "GROSS_AFTER_DISCOUNT",
    recognitionEvent: "PAYMENT_VERIFIED",
    active: true,
    effectiveFrom: "2026-01-01T00:00:00.000Z",
  };
}

/**
 * Creates an authorized commission rule override or new rule version.
 */
export function createCommissionRuleOverride(payload: {
  category: CommissionRule["category"];
  platformPercent: number;
  gatewayPercent: number;
  organizationId?: string;
  serviceId?: string;
  authorizedByUid: string;
  overrideReason: string;
}): CommissionRule {
  if (!payload.authorizedByUid) {
    throw new Error("Unauthorized: Admin UID required to create commission rule override.");
  }

  const artistPercent = 100 - payload.platformPercent - payload.gatewayPercent;
  if (artistPercent < 0) {
    throw new Error("Invalid Rule: Platform + Gateway percentage cannot exceed 100%.");
  }

  const newRule: CommissionRule = {
    ruleId: `rule_${Date.now()}`,
    category: payload.category,
    version: commissionRulesStore.length + 1,
    platformPercent: payload.platformPercent,
    gatewayPercent: payload.gatewayPercent,
    artistPercent,
    commissionBaseType: "GROSS_AFTER_DISCOUNT",
    recognitionEvent: "PAYMENT_VERIFIED",
    organizationId: payload.organizationId,
    serviceId: payload.serviceId,
    active: true,
    effectiveFrom: new Date().toISOString(),
  };

  commissionRulesStore.push(newRule);
  return newRule;
}
