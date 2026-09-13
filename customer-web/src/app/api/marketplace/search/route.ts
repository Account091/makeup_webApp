import { NextRequest, NextResponse } from "next/server";
import { searchMarketplace } from "../../../../lib/marketplace/marketplace-catalog-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || undefined;
    const serviceCategory = searchParams.get("serviceCategory") || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";

    const results = searchMarketplace({
      city,
      serviceCategory,
      minPrice,
      maxPrice,
      minRating,
      verifiedOnly,
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to search marketplace" },
      { status: 500 }
    );
  }
}
