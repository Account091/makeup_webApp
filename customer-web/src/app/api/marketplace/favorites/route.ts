import { NextRequest, NextResponse } from "next/server";
import { getCustomerFavorites, toggleCustomerFavorite } from "../../../../lib/marketplace/marketplace-catalog-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    if (!customerId) {
      return NextResponse.json({ success: false, error: "Missing required parameter: customerId" }, { status: 400 });
    }

    const favorites = getCustomerFavorites(customerId);
    return NextResponse.json({ success: true, favorites });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { customerId, targetType, targetId } = body;

    if (!customerId || !targetType || !targetId) {
      return NextResponse.json({ success: false, error: "Missing customerId, targetType, or targetId" }, { status: 400 });
    }

    const result = toggleCustomerFavorite(customerId, targetType, targetId);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to toggle favorite" }, { status: 500 });
  }
}
