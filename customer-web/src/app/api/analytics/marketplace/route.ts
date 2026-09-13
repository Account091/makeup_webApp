import { NextRequest, NextResponse } from "next/server";
import {
  calculateExecutiveKPIs,
  calculateMarketplaceHealthScore,
  alertsStore,
} from "../../../../lib/marketplace/marketplace-analytics-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "2026-09";

    const kpis = calculateExecutiveKPIs(period);
    const health = calculateMarketplaceHealthScore();

    return NextResponse.json({
      success: true,
      kpis,
      healthScore: health,
      alerts: alertsStore,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
