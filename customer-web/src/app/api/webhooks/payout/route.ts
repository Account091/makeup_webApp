import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-payout-signature');
    const body = await request.json();

    const { eventType, providerPayoutId, settlementId, status, failureReason } = body;

    // Foundation webhook handler for payout status notifications
    console.log(`[Payout Webhook] Event: ${eventType}, Settlement: ${settlementId}, ProviderId: ${providerPayoutId}, Status: ${status}`);

    return NextResponse.json({
      success: true,
      message: 'Payout webhook event processed successfully.',
      receivedEvent: eventType,
      settlementId,
      status
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
