import { NextRequest, NextResponse } from "next/server";
import { exportMarketplaceAnalyticsCSV } from "../../../../../lib/marketplace/marketplace-analytics-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dataset = searchParams.get("dataset") || "overview";

    const csvContent = exportMarketplaceAnalyticsCSV(dataset);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="marketplace_${dataset}_report_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
