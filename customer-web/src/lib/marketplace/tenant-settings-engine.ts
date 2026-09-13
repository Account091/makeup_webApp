import { OrganizationSettings } from "./marketplace-types";
import { getOrganizationById } from "./organization-engine";

const organizationSettingsStore: Record<string, OrganizationSettings> = {
  "makeovers-by-prachi": {
    organizationId: "makeovers-by-prachi",
    businessName: "Makeovers by Prachi Studio & Academy",
    logoUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200",
    description: "Rajasthan's premier luxury bridal makeup studio and academy specializing in HD Airbrush and Royal Rajputi poshak draping.",
    contactEmail: "prachi@makeoversbyprachi.com",
    contactPhone: "+91-98290-00000",
    whatsappNumber: "+91-98290-00000",
    serviceLocations: ["jodhpur", "jaipur", "udaipur", "destination"],
    currency: "INR",
    timezone: "Asia/Kolkata",
    depositPercentDefault: 30,
    cancellationPolicyText: "Cancellations accepted up to 14 days prior to event with 50% deposit refund. Non-refundable within 14 days.",
    updatedAt: "2026-09-01T00:00:00.000Z",
  },
  "jaipur-royal-glam": {
    organizationId: "jaipur-royal-glam",
    businessName: "Jaipur Royal Glam Studio",
    logoUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200",
    description: "Heritage Jaipur bridal makeover studio specializing in Kundan bridal styling and traditional hair artistry.",
    contactEmail: "info@jaipurroyalglam.com",
    contactPhone: "+91-98291-11111",
    whatsappNumber: "+91-98291-11111",
    serviceLocations: ["jaipur", "udaipur"],
    currency: "INR",
    timezone: "Asia/Kolkata",
    depositPercentDefault: 30,
    cancellationPolicyText: "Deposit non-refundable within 10 days of booking date.",
    updatedAt: "2026-09-02T00:00:00.000Z",
  },
};

export function getOrganizationSettings(orgId: string): OrganizationSettings {
  const existing = organizationSettingsStore[orgId];
  if (existing) return existing;

  const org = getOrganizationById(orgId);
  return {
    organizationId: orgId,
    businessName: org?.name || "Beauty Studio",
    logoUrl: "",
    description: "Luxury bridal makeup services.",
    contactEmail: org?.contactEmail || "",
    contactPhone: org?.contactPhone || "",
    whatsappNumber: org?.contactPhone || "",
    serviceLocations: [org?.city.toLowerCase() || "jodhpur"],
    currency: "INR",
    timezone: "Asia/Kolkata",
    depositPercentDefault: 30,
    cancellationPolicyText: "Standard cancellation policy applies.",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Public Organization Profile view (Sanitized - excludes private billing, internal policies, & risk data).
 */
export function getPublicOrganizationProfile(orgId: string) {
  const settings = getOrganizationSettings(orgId);
  const org = getOrganizationById(orgId);

  return {
    organizationId: orgId,
    name: settings.businessName || org?.name,
    slug: org?.slug,
    logoUrl: settings.logoUrl,
    description: settings.description,
    city: org?.city,
    serviceLocations: settings.serviceLocations,
    contactEmail: settings.contactEmail,
    contactPhone: settings.contactPhone,
    verified: org?.verified || false,
  };
}

export function updateOrganizationSettings(
  orgId: string,
  updatedFields: Partial<OrganizationSettings>
): OrganizationSettings {
  const current = getOrganizationSettings(orgId);
  const updated: OrganizationSettings = {
    ...current,
    ...updatedFields,
    organizationId: orgId,
    updatedAt: new Date().toISOString(),
  };

  organizationSettingsStore[orgId] = updated;
  return updated;
}
