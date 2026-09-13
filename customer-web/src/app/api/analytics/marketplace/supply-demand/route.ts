import { NextRequest, NextResponse } from "next/server";
import {
  getSupplyDemandAnalysis,
  zeroResultStore,
} from "../../../../../lib/marketplace/marketplace-analytics-engine";

export async function GET(req: NextRequest) {
  try {
    const supplyDemand = getSupplyDemandAnalysis();
    return NextResponse.json({
      success: true,
      supplyDemand,
      zeroResultDemand: zeroResultStore,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
