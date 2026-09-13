import { NextRequest, NextResponse } from "next/server";
import { calculateMarketplaceCommission } from "../../../../../lib/marketplace/commission-calculation-engine";
import { verifyTenantAuthorization } from "../../../../../lib/marketplace/tenant-isolation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { bookingId, organizationId, artistId, grossAmount, discountAmount, taxAmount, idempotencyKey, authUid } = body;

    if (!bookingId || !organizationId || !artistId || !grossAmount || !authUid) {
      return NextResponse.json({ success: false, error: "Missing required fields: bookingId, organizationId, artistId, grossAmount, authUid" }, { status: 400 });
    }

    verifyTenantAuthorization(authUid, organizationId);

    const transaction = calculateMarketplaceCommission({
      bookingId,
      organizationId,
      artistId,
      grossAmount: Number(grossAmount),
      discountAmount: discountAmount ? Number(discountAmount) : 0,
      taxAmount: taxAmount ? Number(taxAmount) : 0,
      idempotencyKey,
    });

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to calculate commission" }, { status: 403 });
  }
}
