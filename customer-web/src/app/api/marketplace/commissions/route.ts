import { NextRequest, NextResponse } from "next/server";
import { getCommissionLedger, calculateArtistEarnings, recordCommissionTransaction } from "../../../../lib/marketplace/commission-engine";
import { verifyTenantAuthorization } from "../../../../lib/marketplace/tenant-isolation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");
    const uid = searchParams.get("authUid") || "user_prachi";

    if (orgId) {
      verifyTenantAuthorization(uid, orgId);
    }

    const ledger = getCommissionLedger(orgId || undefined);
    const earnings = orgId ? calculateArtistEarnings(orgId) : null;

    return NextResponse.json({
      success: true,
      ledger,
      earnings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Commission access denied" }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { bookingId, organizationId, artistId, grossAmount, authUid } = body;

    if (!bookingId || !organizationId || !artistId || !grossAmount || !authUid) {
      return NextResponse.json({ success: false, error: "Missing required commission fields" }, { status: 400 });
    }

    verifyTenantAuthorization(authUid, organizationId);

    const tx = recordCommissionTransaction({ bookingId, organizationId, artistId, grossAmount: Number(grossAmount) });
    return NextResponse.json({ success: true, transaction: tx });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to record commission" }, { status: 403 });
  }
}
