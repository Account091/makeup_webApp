import { NextRequest, NextResponse } from "next/server";
import { getOrganizationVerification, updateVerificationStatus } from "../../../../lib/marketplace/organization-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    if (!orgId) {
      return NextResponse.json({ success: false, error: "Missing required parameter: organizationId" }, { status: 400 });
    }

    const verif = getOrganizationVerification(orgId);
    return NextResponse.json({ success: true, verification: verif });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch verification" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { organizationId, newStatus, adminUid, rejectionReason } = body;

    if (!organizationId || !newStatus || !adminUid) {
      return NextResponse.json({ success: false, error: "Missing organizationId, newStatus, or adminUid" }, { status: 400 });
    }

    const updated = updateVerificationStatus(organizationId, newStatus, adminUid, rejectionReason);
    return NextResponse.json({ success: true, verification: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update verification" }, { status: 400 });
  }
}
