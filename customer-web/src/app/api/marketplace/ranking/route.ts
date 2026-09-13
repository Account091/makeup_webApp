import { NextResponse } from 'next/server';
import { getActiveRankingConfig, updateRankingWeights } from '../../../../lib/marketplace/ranking-config-engine';

export async function GET() {
  try {
    const config = getActiveRankingConfig();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { weights, minReviewThreshold, newProviderBoostPercent, diversityOrgLimit, updatedByUid } = body;

    if (!weights || !updatedByUid) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: weights, updatedByUid.' },
        { status: 400 }
      );
    }

    const updatedConfig = updateRankingWeights({
      weights,
      minReviewThreshold,
      newProviderBoostPercent,
      diversityOrgLimit,
      updatedByUid
    });

    return NextResponse.json({
      success: true,
      message: 'Ranking weights and parameters updated successfully.',
      config: updatedConfig
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
