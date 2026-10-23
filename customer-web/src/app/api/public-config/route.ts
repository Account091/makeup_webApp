import { NextResponse } from "next/server";
import { getPublicConfig } from "../../../lib/booking/server";

export const dynamic = "force-dynamic";

/** GET /api/public-config -> active services (sorted) + public studio settings. */
export async function GET() {
  const config = await getPublicConfig();
  return NextResponse.json(config, {
    status: 200,
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
