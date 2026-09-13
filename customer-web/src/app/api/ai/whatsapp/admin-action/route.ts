import { NextResponse } from "next/server";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, conversationId, adminUid = "admin_prachi", authPayload } = body;

    if (!conversationId || !action) {
      return NextResponse.json({ error: "Missing required fields 'conversationId' or 'action'" }, { status: 400 });
    }

    const role = authPayload?.role || "ADMIN";
    const allowedRoles = ["ADMIN", "OWNER", "MANAGER", "SUPPORT"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: `Role '${role}' is not authorized to manage WhatsApp control.` }, { status: 403 });
    }

    const convRef = doc(db, "whatsappConversations", conversationId);
    const convSnap = await getDoc(convRef);

    if (!convSnap.exists()) {
      return NextResponse.json({ error: `Conversation '${conversationId}' not found.` }, { status: 404 });
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (action === "PAUSE_AI") {
      updates.aiEnabled = false;
      updates.status = "PAUSED";
    } else if (action === "RESUME_AI") {
      updates.aiEnabled = true;
      updates.status = "ACTIVE";
    } else if (action === "TAKE_OVER") {
      updates.aiEnabled = false;
      updates.status = "HANDOFF_REQUIRED";
      updates.assignedTo = adminUid;
    } else if (action === "RESOLVE_HANDOFF") {
      updates.aiEnabled = true;
      updates.status = "ACTIVE";
      updates.assignedTo = null;
    } else {
      return NextResponse.json({ error: `Unknown action '${action}'` }, { status: 400 });
    }

    await updateDoc(convRef, updates);

    return NextResponse.json({
      success: true,
      action,
      conversationId,
      updatedState: updates,
    });
  } catch (err: any) {
    console.error("[API /api/ai/whatsapp/admin-action] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Admin action failed." },
      { status: 500 }
    );
  }
}
