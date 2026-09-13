import { NextRequest, NextResponse } from "next/server";
import { getSettlements, updateSettlementStatus } from "../../../../lib/marketplace/commission-engine";
import { verifyTenantAuthorization } from "../../../../lib/marketplace/tenant-isolation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const uid = searchParams.get("authUid") || "user_prachi";

    if (orgId) {
      verifyTenantAuthorization(uid, orgId);
    }

    const settlementsList = getSettlements(orgId || undefined);
    return NextResponse.json({ success: true, settlements: settlementsList });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Settlement access denied" }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { settlementId, newStatus, authUid, organizationId } = body;

    if (!settlementId || !newStatus || !authUid || !organizationId) {
      return NextResponse.json({ success: false, error: "Missing required settlement fields" }, { status: 400 });
    }

    verifyTenantAuthorization(authUid, organizationId);

    const updated = updateSettlementStatus(settlementId, newStatus);
    return NextResponse.json({ success: true, settlement: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update settlement" }, { status: 400 });
  }
}
