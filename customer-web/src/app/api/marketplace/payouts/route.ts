import { NextResponse } from 'next/server';
import { executeSettlementPayout, getPayoutsStore, getPayoutTransactionsStore } from '../../../../lib/marketplace/payout-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const settlementId = searchParams.get('settlementId') || undefined;
    const artistId = searchParams.get('artistId') || undefined;

    const payouts = getPayoutsStore(settlementId);
    const transactions = getPayoutTransactionsStore(artistId);

    return NextResponse.json({
      success: true,
      payoutsCount: payouts.length,
      payouts,
      transactions
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settlementId, payoutMethod, payoutReference, processedByUid } = body;

    if (!settlementId || !processedByUid) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: settlementId, processedByUid.' },
        { status: 400 }
      );
    }

    const result = await executeSettlementPayout({
      settlementId,
      payoutMethod: payoutMethod || 'MANUAL',
      payoutReference,
      processedByUid
    });

    return NextResponse.json({
      success: true,
      message: 'Settlement payout executed successfully.',
      payout: result.payout,
      transaction: result.transaction
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
