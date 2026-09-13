import { NextRequest, NextResponse } from "next/server";
import { calculateMarketplaceFunnel } from "../../../../../lib/marketplace/marketplace-analytics-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "2026-09";

    const funnel = calculateMarketplaceFunnel(period);
    return NextResponse.json({ success: true, funnel });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
