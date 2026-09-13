import { NextResponse } from 'next/server';
import { calculateTrustScore, calculateProfileCompleteness } from '../../../../lib/marketplace/trust-score-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('organizationId') || 'org-jaipur-royal-glam';
    const artistId = searchParams.get('artistId') || 'artist-101';

    const trustScore = calculateTrustScore({ organizationId: orgId, artistId });
    const completeness = calculateProfileCompleteness(orgId);

    return NextResponse.json({
      success: true,
      trustScore,
      completeness
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
