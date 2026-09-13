import { NextRequest, NextResponse } from "next/server";
import { getOrganizationSettings, getPublicOrganizationProfile, updateOrganizationSettings } from "../../../../lib/marketplace/tenant-settings-engine";
import { verifyTenantAuthorization } from "../../../../lib/marketplace/tenant-isolation";
import { hasOrganizationPermission } from "../../../../lib/marketplace/tenant-permissions";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const isPublic = searchParams.get("public") === "true";
    const authUid = searchParams.get("authUid");

    if (!orgId) {
      return NextResponse.json({ success: false, error: "Missing organizationId" }, { status: 400 });
    }

    if (isPublic) {
      const publicProfile = getPublicOrganizationProfile(orgId);
      return NextResponse.json({ success: true, profile: publicProfile });
    }

    if (!authUid) {
      return NextResponse.json({ success: false, error: "Missing authUid for private settings access" }, { status: 401 });
    }

    verifyTenantAuthorization(authUid, orgId);
    const settings = getOrganizationSettings(orgId);
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch settings" }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { organizationId, authUid, updatedFields } = body;

    if (!organizationId || !authUid || !updatedFields) {
      return NextResponse.json({ success: false, error: "Missing organizationId, authUid, or updatedFields" }, { status: 400 });
    }

    verifyTenantAuthorization(authUid, organizationId);
    const canManage = hasOrganizationPermission(authUid, organizationId, "settings.manage");
    if (!canManage) {
      return NextResponse.json({ success: false, error: "Permission Denied: Requires 'settings.manage' permission." }, { status: 403 });
    }

    const updated = updateOrganizationSettings(organizationId, updatedFields);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update settings" }, { status: 403 });
  }
}
