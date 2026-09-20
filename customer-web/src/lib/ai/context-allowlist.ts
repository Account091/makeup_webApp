/**
 * V9.6 Data-Minimization Context Allowlisting & Tenant Scope Guard
 */

export interface CustomerConciergeContext {
  servicePreferences?: string[];
  eventType?: string;
  selectedStyle?: string;
  savedLooks?: string[];
  approvedConsultationInfo?: string;
}

export const BLOCKED_CUSTOMER_FIELDS = [
  'adminNotes',
  'internalRiskScore',
  'paymentCredentials',
  'securityMetadata',
  'otherCustomersData',
  'privateOperationalNotes',
];

export function buildMinimisedCustomerContext(rawCustomerData: Record<string, any>): CustomerConciergeContext {
  const cleanContext: CustomerConciergeContext = {};

  if (Array.isArray(rawCustomerData.servicePreferences)) {
    cleanContext.servicePreferences = [...rawCustomerData.servicePreferences];
  }
  if (typeof rawCustomerData.eventType === 'string') {
    cleanContext.eventType = rawCustomerData.eventType;
  }
  if (typeof rawCustomerData.selectedStyle === 'string') {
    cleanContext.selectedStyle = rawCustomerData.selectedStyle;
  }
  if (Array.isArray(rawCustomerData.savedLooks)) {
    cleanContext.savedLooks = [...rawCustomerData.savedLooks];
  }
  if (typeof rawCustomerData.approvedConsultationInfo === 'string') {
    cleanContext.approvedConsultationInfo = rawCustomerData.approvedConsultationInfo;
  }

  return cleanContext;
}

/**
 * Ensures tenant scope is derived ONLY from trusted auth membership, NEVER model input.
 */
export function getTrustedTenantScope(params: {
  authOrgId: string;
  requestedOrgId?: string;
}): { valid: boolean; tenantOrgId: string; error?: string } {
  // Ignore model/requested tenant ID; strictly enforce trusted authOrgId
  if (!params.authOrgId) {
    return { valid: false, tenantOrgId: '', error: 'Unauthenticated or missing organization membership' };
  }

  return { valid: true, tenantOrgId: params.authOrgId };
}
