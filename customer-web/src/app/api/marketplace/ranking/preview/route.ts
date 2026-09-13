import { NextResponse } from 'next/server';
import { executeMarketplaceSearch } from '../../../../../lib/marketplace/marketplace-search-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { locationId, serviceCategory, eventDate } = body;

    const simulation = executeMarketplaceSearch({
      locationId: locationId || 'jaipur',
      serviceCategory: serviceCategory || 'bridal',
      eventDate
    });

    const rankingBreakdown = simulation.results.map((r, idx) => ({
      rank: idx + 1,
      listingTitle: r.listing.title,
      artistId: r.listing.artistId,
      organizationId: r.listing.organizationId,
      totalScore: r.explanation.totalScore,
      isPromoted: r.explanation.isPromoted,
      isNewProviderBoost: r.explanation.isNewProviderBoost,
      breakdown: r.explanation.breakdown
    }));

    return NextResponse.json({
      success: true,
      rankingVersion: simulation.rankingVersion,
      totalCandidates: simulation.totalEligibleCount,
      rankingBreakdown
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
