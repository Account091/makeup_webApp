import { NextResponse } from 'next/server';
import { approveSettlement } from '../../../../../lib/marketplace/settlement-engine';
import { placeHold, releaseHold } from '../../../../../lib/marketplace/settlement-eligibility-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, settlementId, approvedByUid, holdId, artistId, organizationId, amount, holdReason, createdByUid, releasedByUid } = body;

    if (action === 'PLACE_HOLD') {
      const hold = placeHold({
        artistId,
        organizationId,
        amount: Number(amount),
        holdReason,
        createdByUid
      });
      return NextResponse.json({ success: true, message: 'Settlement hold placed successfully.', hold });
    }

    if (action === 'RELEASE_HOLD') {
      const hold = releaseHold(holdId, releasedByUid);
      return NextResponse.json({ success: true, message: 'Settlement hold released.', hold });
    }

    if (!settlementId || !approvedByUid) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: settlementId, approvedByUid.' },
        { status: 400 }
      );
    }

    const approvedSettlement = approveSettlement({ settlementId, approvedByUid });

    return NextResponse.json({
      success: true,
      message: 'Settlement approved successfully under Dual-Control verification.',
      settlement: approvedSettlement
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
