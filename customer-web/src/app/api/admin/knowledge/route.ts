import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import {
  saveDraftEntry,
  publishEntryStaged,
  archiveEntry,
  restoreEntryVersion,
  testDraftQuestion,
} from "../../../../lib/ai/knowledge/knowledge-service";
import { KnowledgeEntry } from "../../../../lib/ai/knowledge/types";
import { verifyAdminAuthToken } from "../../../../lib/auth/admin-auth";

// GET: List entries with filters
export async function GET(req: Request) {
  const { isAuthorized, orgId, role, error } = await verifyAdminAuthToken(req);
  if (!isAuthorized || !orgId) {
    return NextResponse.json({ error: error || "Unauthorized access" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const requestedOrgId = searchParams.get("orgId");
  
  // Cross-tenant guard: only super_admin can query another org
  if (requestedOrgId && requestedOrgId !== orgId && role !== "super_admin") {
    return NextResponse.json(
      { error: `Access Denied: Tenant admin for '${orgId}' cannot access records for '${requestedOrgId}'.` },
      { status: 403 }
    );
  }

  const targetOrgId = role === "super_admin" && requestedOrgId ? requestedOrgId : orgId;
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const needsReview = searchParams.get("needsReview") === "true";

  try {
    const colRef = collection(db, "knowledgeEntries");
    const q = query(colRef, where("orgId", "==", targetOrgId));
    const snap = await getDocs(q);

    const now = Date.now();
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

    let entries: KnowledgeEntry[] = snap.docs.map((d) => d.data() as KnowledgeEntry);

    // Apply Filters in memory
    if (category && category !== "all") {
      entries = entries.filter((e) => e.category === category);
    }
    if (status && status !== "all") {
      entries = entries.filter((e) => e.status === status);
    }
    if (needsReview) {
      entries = entries.filter((e) => {
        const updateTime = new Date(e.updatedAt).getTime();
        const isOld = updateTime < ninetyDaysAgo;
        const isExpired = e.expiresAt ? new Date(e.expiresAt).getTime() < now : false;
        return isOld || isExpired;
      });
    }

    // Sort by updatedAt descending
    entries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({ success: true, entries, count: entries.length });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge GET] Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to list entries" }, { status: 500 });
  }
}

// POST: Admin Actions (save_draft, publish, archive, restore_version, test_draft)
export async function POST(req: Request) {
  const { isAuthorized, orgId, role, uid, error } = await verifyAdminAuthToken(req);
  if (!isAuthorized || !orgId) {
    return NextResponse.json({ error: error || "Unauthorized access" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, payload } = body || {};

    // Cross-tenant payload tamper guard: body orgId MUST NOT override token orgId
    if (payload && payload.orgId && payload.orgId !== orgId && role !== "super_admin") {
      return NextResponse.json(
        { error: `Security Violation: Token orgId '${orgId}' does not match body orgId '${payload.orgId}'. Cross-tenant mutation rejected.` },
        { status: 403 }
      );
    }

    switch (action) {
      case "save_draft": {
        const saved = await saveDraftEntry({
          ...payload,
          orgId, // Server authoritative orgId from token
          updatedBy: uid,
        });
        return NextResponse.json({ success: true, entry: saved });
      }

      case "publish": {
        const { entryId } = payload || {};
        if (!entryId) {
          return NextResponse.json({ error: "Missing entryId" }, { status: 400 });
        }
        const published = await publishEntryStaged(entryId, orgId, uid);
        return NextResponse.json({ success: true, entry: published });
      }

      case "archive": {
        const { entryId } = payload || {};
        if (!entryId) {
          return NextResponse.json({ error: "Missing entryId" }, { status: 400 });
        }
        await archiveEntry(entryId, orgId, uid);
        return NextResponse.json({ success: true, archived: true });
      }

      case "restore_version": {
        const { entryId, version } = payload || {};
        if (!entryId || version === undefined) {
          return NextResponse.json({ error: "Missing entryId or version" }, { status: 400 });
        }
        const restored = await restoreEntryVersion(entryId, Number(version), orgId, uid);
        return NextResponse.json({ success: true, entry: restored });
      }

      case "test_draft": {
        const { draftTitle, draftContent, testQuestion } = payload || {};
        if (!draftTitle || !draftContent || !testQuestion) {
          return NextResponse.json({ error: "Missing draftTitle, draftContent, or testQuestion" }, { status: 400 });
        }
        const dryRun = await testDraftQuestion(draftTitle, draftContent, testQuestion);
        return NextResponse.json({ success: true, dryRun });
      }

      default:
        return NextResponse.json({ error: `Unknown action: '${action}'` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[API /api/admin/knowledge POST] Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
