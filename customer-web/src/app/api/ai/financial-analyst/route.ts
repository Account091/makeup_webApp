import { NextResponse } from "next/server";
import { handleAIRequest } from "../../../../lib/ai/ai-gateway";
import { calculateFinancialIntelligenceData } from "../../../../lib/financial/financial-kpi-engine";
import { generateFinancialAlerts } from "../../../../lib/financial/financial-alert-engine";
import { validateMultiWayReconciliation } from "../../../../lib/financial/financial-reconciliation-engine";
import { AiChatMessage } from "../../../../lib/ai/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, auth } = body;

    // Auth fallback for testing / local dev
    const authContext = auth || {
      uid: "admin_prachi",
      role: "ADMIN",
      organizationId: "makeovers_by_prachi",
      requestId: `req_fin_${Date.now()}`,
    };

    if (!["ADMIN", "OWNER", "ACCOUNTANT", "MANAGER"].includes(authContext.role)) {
      return NextResponse.json(
        { error: `Role '${authContext.role}' is not authorized to access Financial AI Analyst.` },
        { status: 403 }
      );
    }

    // 1. Calculate deterministic financial package & alerts
    const finData = calculateFinancialIntelligenceData();
    const alerts = generateFinancialAlerts(finData);
    finData.alerts = alerts;
    const reconciliation = validateMultiWayReconciliation(finData);

    // 2. Prepare structured system context for Financial AI
    const financialContextSummary = `
[AUTHORITATIVE DETERMINISTIC FINANCIAL INTELLIGENCE DATASET]
Data As Of: ${finData.dataAsOf}
Reconciliation Status: ${reconciliation.overallStatus} (Discrepancy: ₹${reconciliation.differenceAmount})
Financial Period: ${finData.periodStatus.currentPeriod} (${finData.periodStatus.status})
Google Sheets Mirror Sync: ${reconciliation.sheetsSyncStatus}

EXECUTIVE FINANCIAL COMMAND CENTER:
- Gross Revenue: ₹${finData.revenueBreakdown.grossRevenue.toLocaleString("en-IN")}
- Net Revenue: ₹${finData.revenueBreakdown.netRevenue.toLocaleString("en-IN")} (Discounts: ₹${finData.revenueBreakdown.discountsAmount}, Refunds: ₹${finData.revenueBreakdown.refundsAmount})
- Cash Collected: ₹${finData.cashCollection.collectedAmount.toLocaleString("en-IN")} (${finData.cashCollection.collectedPercentage}% of contract value)
- Outstanding Balance: ₹${finData.cashCollection.pendingAmount.toLocaleString("en-IN")} (Overdue: ₹${finData.cashCollection.overdueAmount.toLocaleString("en-IN")})
- Operating Expenses: ₹${finData.expenseBreakdown.reduce((a, c) => a + c.totalAmount, 0).toLocaleString("en-IN")}
- Net Profit: ₹${(finData.revenueBreakdown.netRevenue - finData.expenseBreakdown.reduce((a, c) => a + c.totalAmount, 0)).toLocaleString("en-IN")}

MANUAL UPI & RECONCILIATION FUNNEL:
- Total Submissions: ${finData.upiVerification.totalSubmissions} (AI Pass: ${finData.upiVerification.aiPassCount}, Review Needed: ${finData.upiVerification.aiNeedsReviewCount}, Rejected: ${finData.upiVerification.aiRejectedCount})
- Admin Verified: ${finData.upiVerification.adminVerifiedCount}

PROFITABILITY HIGHLIGHTS:
- Royal Bridal Package: Gross ₹25,000 | Net Contribution ₹14,400 (Margin 57.6%)
- Destination Package: Gross ₹45,000 | Net Contribution ₹22,400 (Margin 49.8%)

TAX INTELLIGENCE:
- Taxable Value: ₹${finData.taxSummary.taxableValue.toLocaleString("en-IN")} | Tax Collected (GST 9%+9%): ₹${finData.taxSummary.taxCollected.toLocaleString("en-IN")}

ACTIVE FINANCIAL ALERTS:
${alerts.map((a) => `• [${a.severity}] ${a.title}: ${a.message}`).join("\n")}
`;

    const userPrompt = query || "Provide executive financial summary, analyze cash collection, and recommend next steps.";

    const messages: AiChatMessage[] = [
      {
        role: "system",
        content: `You are the executive AI Financial Analyst for Makeovers by Prachi. You interpret authoritative financial ledger datasets, explain cash collection trends, highlight overdue risks, and summarize profitability. NEVER recalculate or invent raw financial numbers — rely strictly on the provided BI financial metrics.`,
      },
      {
        role: "user",
        content: `${financialContextSummary}\n\nUSER QUESTION: "${userPrompt}"`,
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
        { type: "INVOICES", name: "Authoritative Invoices & Tax Snapshots" },
        { type: "PAYMENT_LEDGER", name: "Immutable Payment Transaction Ledger" },
        { type: "EXPENSE_LEDGER", name: "Approved Operating Expense Ledger" },
        { type: "UPI_VISION", name: "UPI Screenshot Verification Engine" },
      ],
      dataAsOf: finData.dataAsOf,
      reconciliationStatus: reconciliation.overallStatus,
      sheetsSyncStatus: reconciliation.sheetsSyncStatus,
      latencyMs: aiResponse.latencyMs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
