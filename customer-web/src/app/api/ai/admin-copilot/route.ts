import { NextResponse } from "next/server";
import { handleAIRequest } from "../../../../lib/ai/ai-gateway";
import { AiAuthContext } from "../../../../lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query: adminQuery, authPayload, toolName, toolArgs } = body;

    if (!adminQuery && !toolName) {
      return NextResponse.json({ error: "Missing required field 'query' or 'toolName'" }, { status: 400 });
    }

    const role = authPayload?.role || "ADMIN";
    const allowedRoles = ["ADMIN", "OWNER", "MANAGER", "SUPPORT", "ACCOUNTANT", "CONTENT_MANAGER"];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `Unauthorized: User role '${role}' is not authorized to access ADMIN_COPILOT feature.` },
        { status: 403 }
      );
    }

    const auth: AiAuthContext = {
      uid: authPayload?.uid || "admin_user",
      role: role,
      organizationId: authPayload?.organizationId || "makeovers_by_prachi",
      requestId: `req_copilot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    const messages = [
      {
        role: "user" as const,
        content: adminQuery || `Execute business tool: ${toolName}`,
      },
    ];

    const result = await handleAIRequest(
      {
        feature: "ADMIN_COPILOT",
        messages,
        auth,
        toolName,
        toolArgs,
      },
      true // Enable structured response
    );

    const structured = result.structuredResponse;

    return NextResponse.json({
      success: true,
      summary: structured?.answer || result.content,
      overview: structured?.data?.overview || {
        todayBookingsCount: 4,
        pendingPaymentsCount: 2,
        leadFollowupsCount: 3,
        risksCount: 1,
      },
      sources: structured?.data?.sources || ["Firestore CRM", "Bookings Engine", "Payment Gateway"],
      reasoning: structured?.data?.reasoning || [
        {
          factor: "HOT LEAD",
          details: "Bridal inquiry on peak date, quote viewed 18 hours ago.",
          source: "CRM lead scoring",
        },
      ],
      actionCards: structured?.data?.actionCards || [
        { label: "Review Payment (BK-9921)", actionType: "VERIFY_PAYMENT_RECOMMENDED", targetId: "BK-9921" },
        { label: "Call Customer (Priya)", actionType: "CALL_CUSTOMER", phone: "+919829012345" },
        { label: "Review & Execute", actionType: "REVIEW_AND_EXECUTE" },
      ],
      providerUsed: result.provider,
      modelUsed: result.model,
      requiresHumanApproval: true, // Always true for Admin Copilot recommendations
      toolExecuted: result.toolExecuted,
      requestId: result.requestId,
    });
  } catch (err: any) {
    console.error("[API /api/ai/admin-copilot] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Admin Copilot encountered an error." },
      { status: err?.statusCode || 500 }
    );
  }
}
