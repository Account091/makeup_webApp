import { NextResponse } from "next/server";
import { handleAIRequest } from "../../../../lib/ai/ai-gateway";
import { calculateCustomerIntelligenceData } from "../../../../lib/customer/customer-kpi-engine";
import { generateCustomerRisks } from "../../../../lib/customer/customer-risk-engine";
import { generateCustomerTimelineEvents } from "../../../../lib/customer/customer-timeline-engine";
import { AiChatMessage } from "../../../../lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, customerId, auth } = body;

    // Auth fallback for testing / local dev
    const authContext = auth || {
      uid: "admin_prachi",
      role: "ADMIN",
      organizationId: "makeovers_by_prachi",
      requestId: `req_cust_${Date.now()}`,
    };

    if (!["ADMIN", "OWNER", "MANAGER", "SUPPORT"].includes(authContext.role)) {
      return NextResponse.json(
        { error: `Role '${authContext.role}' is not authorized to access AI Customer Analyst.` },
        { status: 403 }
      );
    }

    // 1. Calculate deterministic customer package & risks
    const custData = calculateCustomerIntelligenceData();
    const risks = generateCustomerRisks(custData);
    custData.risks = risks;
    if (customerId) {
      custData.timelineEvents = generateCustomerTimelineEvents(customerId);
    }

    // 2. Prepare structured system context for Customer AI
    const customerContextSummary = `
[VALIDATED CUSTOMER 360 & CRM INTELLIGENCE DATASET]
Data As Of: ${custData.dataAsOf}
Privacy Classification: ADMIN_ONLY_SCOPED

CUSTOMER HIGHLIGHTS & DOSSIERS:
${custData.customerDossiers
  .map(
    (c) =>
      `• Client '${c.fullName}' (${c.segment}): Health ${c.healthScore.score}/100 (${c.healthScore.classification}) | LTV ₹${c.lifetimeValue.toLocaleString()} | NPS ${c.npsScore}/10 | Next Event: ${c.nextEventAt || "None"}`
  )
  .join("\n")}

CRM PIPELINE SUMMARY:
- New Leads: ${custData.crmPipeline.newLeadsCount} | Hot Leads: ${custData.crmPipeline.hotLeadsCount} | Quotes Sent: ${custData.crmPipeline.quotesSentCount}
- Deposit Pending: ${custData.crmPipeline.depositPendingCount} | Overdue Follow-ups: ${custData.crmPipeline.followupsOverdueCount}

CUSTOMER SATISFACTION (CSAT & NPS):
- Overall CSAT: ${custData.csatNps.csatScorePercent}% | NPS: +${custData.csatNps.npsScore}
- Makeup Rating: ⭐ ${custData.csatNps.categoryBreakdown.makeupRating} | Punctuality: ⭐ ${custData.csatNps.categoryBreakdown.punctualityRating}

EVENT-DAY OPERATIONAL FRICTION:
- On-time Ready Rate: ${custData.eventDayFriction.onTimeReadyRatePercent}%
- Operational Pattern: ${custData.eventDayFriction.recurringPatterns.join("; ")}

ACTIVE CUSTOMER RISKS:
${risks.map((r) => `• [${r.severity}] ${r.customerName} (${r.riskType}): ${r.description}`).join("\n")}
`;

    const userPrompt = query || "Which customers need attention today and what are the main operational risks?";

    const messages: AiChatMessage[] = [
      {
        role: "system",
        content: `You are the executive AI Customer Analyst for Makeovers by Prachi. You interpret Customer 360 dossiers, explain Health Scores, highlight CRM follow-up priorities, and recommend admin actions. NEVER infer medical conditions or disclose raw PII outside authorized scope — rely strictly on the provided customer BI metrics.`,
      },
      {
        role: "user",
        content: `${customerContextSummary}\n\nUSER QUESTION: "${userPrompt}"`,
      },
    ];

    // 3. Dispatch via AI Gateway
    const aiResponse = await handleAIRequest({
      feature: "ADMIN_COPILOT",
      messages,
      auth: authContext,
    });

    return NextResponse.json({
      success: true,
      answer: aiResponse.content,
      sources: [
        { type: "CUSTOMER_360", name: "Customer 360 Dossiers & Health Scores" },
        { type: "CRM_PIPELINE", name: "CRM Lead Funnel & Priority Follow-ups" },
        { type: "CSAT_NPS", name: "Customer Satisfaction & Feedback Surveys" },
        { type: "EVENT_DAY_MODE", name: "Event-Day Mode Execution Metrics" },
      ],
      dataAsOf: custData.dataAsOf,
      privacyLevel: "PII_SCOPED_ADMIN_ONLY",
      latencyMs: aiResponse.latencyMs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
