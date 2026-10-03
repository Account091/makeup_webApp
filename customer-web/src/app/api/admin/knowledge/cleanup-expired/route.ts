import { NextResponse } from "next/server";
import { cleanupExpiredEntries } from "../../../../../lib/ai/knowledge/knowledge-service";
import { verifyAdminAuthToken } from "../../../../../lib/auth/admin-auth";

export async function POST(req: Request) {
  const { isAuthorized, orgId, role, error } = await verifyAdminAuthToken(req);
  if (!isAuthorized || role !== "super_admin" || !orgId) {
    return NextResponse.json(
      { error: error || "Access Denied: Cleanup operations require 'super_admin' authorization." },
      { status: 403 }
    );
  }

  try {
    const result = await cleanupExpiredEntries(orgId);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge/cleanup-expired] Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to cleanup expired entries" }, { status: 500 });
  }
}
