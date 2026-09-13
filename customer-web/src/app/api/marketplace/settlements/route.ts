import { NextResponse } from 'next/server';
import { 
  getSettlementsStore, 
  createSettlementBatch,
  getSettlementPeriods 
} from '../../../../lib/marketplace/settlement-engine';
import { 
  calculateSettlementEligibility,
  getPayoutRules 
} from '../../../../lib/marketplace/settlement-eligibility-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId') || undefined;
    const artistId = searchParams.get('artistId') || undefined;
    const status = searchParams.get('status') as any || undefined;

    const settlements = getSettlementsStore({ organizationId: orgId, artistId, status });
    const periods = getSettlementPeriods();
    const rules = getPayoutRules();

    return NextResponse.json({
      success: true,
      count: settlements.length,
      settlements,
      periods,
      payoutRules: rules
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, organizationId, artistId, periodId, preparedByUid } = body;

    if (action === 'EVALUATE_ELIGIBILITY') {
      const eligibility = calculateSettlementEligibility({
        artistId: artistId || 'artist-101',
        organizationId: organizationId || 'org-jaipur-royal-glam'
      });
      return NextResponse.json({ success: true, eligibility });
    }

    if (!organizationId || !artistId || !periodId || !preparedByUid) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: organizationId, artistId, periodId, preparedByUid.' },
        { status: 400 }
      );
    }

    const batch = createSettlementBatch({
      organizationId,
      artistId,
      periodId,
      preparedByUid
    });

    return NextResponse.json({
      success: true,
      message: 'Settlement batch created successfully.',
      settlement: batch.settlement,
      itemsCount: batch.items.length
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
