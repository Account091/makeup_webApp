import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { AiQuestionLog, KnowledgeEntry } from "../../../../../lib/ai/knowledge/types";
import { saveDraftEntry } from "../../../../../lib/ai/knowledge/knowledge-service";

export async function GET(req: Request) {
  const orgId = req.headers.get("x-org-id") || process.env.DEFAULT_ORG_ID || "makeovers_by_prachi";

  try {
    const q = query(
      collection(db, "aiQuestionLog"),
      where("orgId", "==", orgId),
      where("outcome", "==", "fallback")
    );
    const snap = await getDocs(q);

    const questions: AiQuestionLog[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));

    questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, questions, count: questions.length });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge/unanswered GET] Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to list fallback questions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const orgId = req.headers.get("x-org-id") || process.env.DEFAULT_ORG_ID || "makeovers_by_prachi";
  const uid = req.headers.get("x-user-uid") || "admin_console";

  try {
    const body = await req.json();
    const { questionLogId, questionText } = body || {};

    let targetQuestion = questionText;
    if (questionLogId) {
      const snap = await getDoc(doc(db, "aiQuestionLog", questionLogId));
      if (snap.exists()) {
        targetQuestion = snap.data().scrubbedQuestion;
      }
    }

    if (!targetQuestion) {
      return NextResponse.json({ error: "Missing question details" }, { status: 400 });
    }

    // Create a new draft knowledge entry with a clean template for Prachi's team to fill
    const newDraft = await saveDraftEntry({
      orgId,
      title: `FAQ: ${targetQuestion.slice(0, 70)}...`,
      category: "faq",
      content: `Question: ${targetQuestion}\n\nOfficial Studio Answer:\n[Add verified answer here. Do not include customer names or specific booking IDs.]`,
      language: "both",
      status: "draft",
      updatedBy: uid,
    });

    return NextResponse.json({ success: true, draftEntry: newDraft });
  } catch (error: any) {
    console.error("[API /api/admin/knowledge/unanswered POST] Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create draft from question" }, { status: 500 });
  }
}
