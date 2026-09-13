import { OrganizationPaymentSettings } from "./marketplace-types";

const paymentSettingsStore: Record<string, OrganizationPaymentSettings> = {
  "makeovers-by-prachi": {
    organizationId: "makeovers-by-prachi",
    upiVpa: "makeoversbyprachi@upi",
    accountHolderName: "Makeovers by Prachi LLP",
    bankName: "HDFC Bank",
    accountNumberMasked: "XXXX-XXXX-9012",
    ifscCode: "HDFC0000123",
    gstin: "08AAAAA0000A1Z5",
    manualUpiEnabled: true,
    gatewayEnabled: true,
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
  "jaipur-royal-glam": {
    organizationId: "jaipur-royal-glam",
    upiVpa: "jaipurroyalglam@icici",
    accountHolderName: "Jaipur Royal Glam Studio Pvt Ltd",
    bankName: "ICICI Bank",
    accountNumberMasked: "XXXX-XXXX-4567",
    ifscCode: "ICIC0000456",
    gstin: "08BBBBB1111B1Z2",
    manualUpiEnabled: true,
    gatewayEnabled: false,
    updatedAt: "2026-09-02T00:00:00.000Z",
  },
};

export function getOrganizationPaymentSettings(orgId: string): OrganizationPaymentSettings {
  const existing = paymentSettingsStore[orgId];
  if (existing) return existing;

  return {
    organizationId: orgId,
    upiVpa: `${orgId.replace(/[^a-z0-9]/g, "")}@upi`,
    accountHolderName: "Beauty Studio",
    bankName: "State Bank of India",
    accountNumberMasked: "XXXX-XXXX-0000",
    ifscCode: "SBIN0000001",
    manualUpiEnabled: true,
    gatewayEnabled: true,
    updatedAt: new Date().toISOString(),
  };
}

export function updateOrganizationPaymentSettings(
  orgId: string,
  updatedFields: Partial<OrganizationPaymentSettings>
): OrganizationPaymentSettings {
  const current = getOrganizationPaymentSettings(orgId);
  const updated: OrganizationPaymentSettings = {
    ...current,
    ...updatedFields,
    organizationId: orgId,
    updatedAt: new Date().toISOString(),
  };

  paymentSettingsStore[orgId] = updated;
  return updated;
}

/**
 * Tenant-Specific Vision AI VPA Matching Helper.
 * Compares detected VPA in screenshot against target organization's configured VPA.
 */
export function validateTenantUpiVpa(
  orgId: string,
  detectedVpaInScreenshot: string
): {
  isMatch: boolean;
  configuredVpa: string;
  detectedVpa: string;
} {
  const settings = getOrganizationPaymentSettings(orgId);
  const configuredVpa = settings.upiVpa.toLowerCase().trim();
  const detectedVpa = detectedVpaInScreenshot.toLowerCase().trim();

  const isMatch = configuredVpa === detectedVpa;

  return {
    isMatch,
    configuredVpa,
    detectedVpa,
  };
}
