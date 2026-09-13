import { NextRequest, NextResponse } from "next/server";
import { getArtistProfiles, getArtistBySlug } from "../../../../lib/marketplace/marketplace-catalog-engine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const artist = getArtistBySlug(slug);
      if (!artist) {
        return NextResponse.json({ success: false, error: `Artist '${slug}' not found` }, { status: 404 });
      }
      return NextResponse.json({ success: true, artist });
    }

    const artists = getArtistProfiles();
    return NextResponse.json({ success: true, artists });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch artists" }, { status: 500 });
  }
}
