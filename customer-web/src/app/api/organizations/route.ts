import { NextRequest, NextResponse } from "next/server";
import { getOrganizations, createOrganization } from "../../../lib/marketplace/organization-engine";

export async function GET() {
  try {
    const orgs = getOrganizations();
    return NextResponse.json({ success: true, organizations: orgs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch organizations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, slug, type, contactEmail, contactPhone, city, ownerUid } = body;

    if (!name || !slug || !type || !contactEmail || !contactPhone || !city || !ownerUid) {
      return NextResponse.json({ success: false, error: "Missing required organization creation fields" }, { status: 400 });
    }

    const result = createOrganization({
      name,
      slug,
      type,
      contactEmail,
      contactPhone,
      city,
      ownerUid,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to create organization" }, { status: 400 });
  }
}
