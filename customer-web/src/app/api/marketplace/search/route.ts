import { NextResponse } from 'next/server';
import { executeMarketplaceSearch } from '../../../../lib/marketplace/marketplace-search-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId') || undefined;
    const serviceCategory = searchParams.get('serviceCategory') || undefined;
    const eventDate = searchParams.get('eventDate') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 10;

    const searchResult = executeMarketplaceSearch({
      locationId,
      serviceCategory,
      eventDate,
      minPrice,
      maxPrice,
      verifiedOnly,
      page,
      pageSize
    });

    return NextResponse.json({
      success: true,
      searchResult
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const searchResult = executeMarketplaceSearch(body);
    return NextResponse.json({ success: true, searchResult });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
