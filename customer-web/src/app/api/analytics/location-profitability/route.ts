import { NextResponse } from "next/server";
import { calculateLocationOptimizationData } from "../../../../lib/locations/location-opt-kpi-engine";

export async function GET() {
  try {
    const data = calculateLocationOptimizationData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch location profitability analytics" },
      { status: 500 }
    );
  }
}
