import { NextResponse } from "next/server";
import { getMarketplaceListings } from "../../../../lib/marketplace/marketplace-catalog-engine";

export async function GET() {
  try {
    const listings = getMarketplaceListings();
    return NextResponse.json({ success: true, listings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch listings" }, { status: 500 });
  }
}
