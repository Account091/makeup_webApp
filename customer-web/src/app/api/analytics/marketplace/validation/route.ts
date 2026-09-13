import { NextRequest, NextResponse } from "next/server";
import { reconcileMarketplaceData } from "../../../../../lib/marketplace/marketplace-analytics-engine";

export async function GET(req: NextRequest) {
  try {
    const report = reconcileMarketplaceData();
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
