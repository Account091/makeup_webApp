import { NextRequest, NextResponse } from "next/server";
import {
  getGeographyMetrics,
  getServiceLocationMatrix,
} from "../../../../../lib/marketplace/marketplace-analytics-engine";

export async function GET(req: NextRequest) {
  try {
    const geography = getGeographyMetrics();
    const serviceLocationMatrix = getServiceLocationMatrix();

    return NextResponse.json({
      success: true,
      geography,
      serviceLocationMatrix,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
