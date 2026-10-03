import { NextResponse } from "next/server";
import { saveDraftEntry } from "../../../../../lib/ai/knowledge/knowledge-service";
import { KnowledgeCategory, KnowledgeLanguage } from "../../../../../lib/ai/knowledge/types";
import { verifyAdminAuthToken } from "../../../../../lib/auth/admin-auth";

/**
 * Verified Admin Bulk Import Endpoint
 * - Requires 'super_admin' or 'owner' role.
 * - Accepts ONLY user-provided approved content or live website page content.
 * - ZERO text from PLATFORM_MASTER_SPECIFICATION.md (internal architecture only).
 * - Supports previewOnly mode showing diff before saving.
 * - Saves strictly as 'draft' entries.
 */
export async function POST(req: Request) {
  const { isAuthorized, orgId, role, uid, error } = await verifyAdminAuthToken(req);

  if (!isAuthorized || (role !== "super_admin" && role !== "owner") || !orgId) {
    return NextResponse.json(
      { error: error || "Access Denied: Bulk import requires 'super_admin' or 'owner' role authorization." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { approvedEntries, previewOnly = false } = body || {};

    if (!approvedEntries || !Array.isArray(approvedEntries) || approvedEntries.length === 0) {
      return NextResponse.json(
        {
          error:
            "Missing 'approvedEntries' array. You must provide an array of approved customer-facing entries. Internal documentation cannot be imported.",
        },
        { status: 400 }
      );
    }

    // Generate diff/preview
    const previewList = approvedEntries.map((item, idx) => ({
      index: idx + 1,
      title: item.title,
      category: item.category || "general",
      language: item.language || "both",
      sourceUrl: item.sourceUrl || "/services",
      contentLength: item.content?.length || 0,
      contentSnippet: (item.content || "").slice(0, 150) + "...",
      targetStatus: "draft" as const,
    }));

    if (previewOnly) {
      return NextResponse.json({
        success: true,
        previewMode: true,
        totalEntries: previewList.length,
        preview: previewList,
        message: "Preview generated. Submit with 'previewOnly: false' to save drafts.",
      });
    }

    // Save as drafts
    const savedDrafts = [];
    for (const item of approvedEntries) {
      if (!item.title || !item.content) continue;

      const saved = await saveDraftEntry({
        orgId,
        title: item.title.trim(),
        category: (item.category || "policy") as KnowledgeCategory,
        content: item.content.trim(),
        language: (item.language || "both") as KnowledgeLanguage,
        status: "draft",
        sourceUrl: item.sourceUrl || null,
        updatedBy: uid,
      });
      savedDrafts.push(saved);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully created ${savedDrafts.length} draft knowledge entries for owner review. None are published.`,
      savedCount: savedDrafts.length,
      draftIds: savedDrafts.map((d) => d.id),
    });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge/bulk-import] Error:", error);
    return NextResponse.json({ error: error?.message || "Bulk import failed." }, { status: 500 });
  }
}
