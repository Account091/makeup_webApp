import { NextResponse } from "next/server";
import { reindexAllPublished } from "../../../../../lib/ai/knowledge/knowledge-service";
import { verifyAdminAuthToken } from "../../../../../lib/auth/admin-auth";

export async function POST(req: Request) {
  const { isAuthorized, orgId, role, uid, error } = await verifyAdminAuthToken(req);
  if (!isAuthorized || role !== "super_admin" || !orgId) {
    return NextResponse.json(
      { error: error || "Access Denied: Re-indexing operations require 'super_admin' authorization." },
      { status: 403 }
    );
  }

  try {
    const result = await reindexAllPublished(orgId, uid);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge/reindex] Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to reindex published entries" }, { status: 500 });
  }
}
