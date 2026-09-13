import { NextRequest, NextResponse } from "next/server";
import {
  getOrganizationPaymentSettings,
  updateOrganizationPaymentSettings,
  validateTenantUpiVpa,
} from "../../../../lib/marketplace/tenant-payment-config";
import { verifyTenantAuthorization } from "../../../../lib/marketplace/tenant-isolation";
import { hasOrganizationPermission } from "../../../../lib/marketplace/tenant-permissions";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const authUid = searchParams.get("authUid");

    if (!orgId || !authUid) {
      return NextResponse.json({ success: false, error: "Missing organizationId or authUid" }, { status: 400 });
    }

    verifyTenantAuthorization(authUid, orgId);
    const canReadFinance = hasOrganizationPermission(authUid, orgId, "payments.read");
    if (!canReadFinance) {
      return NextResponse.json({ success: false, error: "Permission Denied: Requires 'payments.read' permission." }, { status: 403 });
    }

    const settings = getOrganizationPaymentSettings(orgId);
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch payment config" }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, organizationId, authUid, updatedPaymentSettings, detectedVpa } = body;

    if (!organizationId || !authUid) {
      return NextResponse.json({ success: false, error: "Missing organizationId or authUid" }, { status: 400 });
    }

    verifyTenantAuthorization(authUid, organizationId);

    if (action === "verify_vpa_screenshot") {
      const vpaResult = validateTenantUpiVpa(organizationId, detectedVpa || "");
      return NextResponse.json({ success: true, ...vpaResult });
    }

    const canManageSettings = hasOrganizationPermission(authUid, organizationId, "settings.manage");
    if (!canManageSettings) {
      return NextResponse.json({ success: false, error: "Permission Denied: Requires 'settings.manage' permission." }, { status: 403 });
    }

    const updated = updateOrganizationPaymentSettings(organizationId, updatedPaymentSettings);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update payment config" }, { status: 403 });
  }
}
