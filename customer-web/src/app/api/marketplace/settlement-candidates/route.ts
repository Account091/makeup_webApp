import { NextRequest, NextResponse } from "next/server";
import { getSettlementCandidates, evaluateSettlementEligibility } from "../../../../lib/marketplace/settlement-candidate-engine";
import { verifyTenantAuthorization } from "../../../../lib/marketplace/tenant-isolation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const authUid = searchParams.get("authUid") || "user_prachi";

    if (orgId) {
      verifyTenantAuthorization(authUid, orgId);
    }

    const candidates = getSettlementCandidates(orgId || undefined);
    return NextResponse.json({ success: true, candidates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch settlement candidates" }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { artistId, organizationId, authUid } = body;

    if (!artistId || !organizationId || !authUid) {
      return NextResponse.json({ success: false, error: "Missing artistId, organizationId, or authUid" }, { status: 400 });
    }

    verifyTenantAuthorization(authUid, organizationId);
    const candidate = evaluateSettlementEligibility({ artistId, organizationId });

    return NextResponse.json({ success: true, candidate });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to evaluate settlement candidate" }, { status: 403 });
  }
}
