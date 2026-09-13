import { NextRequest, NextResponse } from "next/server";
import { recordCommissionRefundReversal } from "../../../../../lib/marketplace/commission-calculation-engine";
import { verifyTenantAuthorization } from "../../../../../lib/marketplace/tenant-isolation";
import { hasOrganizationPermission } from "../../../../../lib/marketplace/tenant-permissions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, parentTransactionId, refundAmount, reason, organizationId, authUid } = body;

    if (!organizationId || !authUid) {
      return NextResponse.json({ success: false, error: "Missing organizationId or authUid" }, { status: 400 });
    }

    verifyTenantAuthorization(authUid, organizationId);
    const canManageFinance = hasOrganizationPermission(authUid, organizationId, "finance.read");
    if (!canManageFinance) {
      return NextResponse.json({ success: false, error: "Permission Denied: Requires 'finance.read' permission." }, { status: 403 });
    }

    if (action === "refund_reversal") {
      if (!parentTransactionId || !refundAmount) {
        return NextResponse.json({ success: false, error: "Missing parentTransactionId or refundAmount" }, { status: 400 });
      }

      const reversal = recordCommissionRefundReversal(parentTransactionId, Number(refundAmount), reason || "Customer refund");
      return NextResponse.json({ success: true, reversal });
    }

    return NextResponse.json({ success: false, error: "Unsupported adjustment action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to record adjustment" }, { status: 403 });
  }
}
