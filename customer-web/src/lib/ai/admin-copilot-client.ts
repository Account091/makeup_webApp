export interface AdminCopilotPayload {
  query: string;
  toolName?: string;
  toolArgs?: Record<string, any>;
  authPayload?: {
    uid?: string;
    role?: string;
    organizationId?: string;
  };
}

export interface ActionCardItem {
  label: string;
  actionType: string;
  targetId?: string;
  phone?: string;
}

export interface ReasoningItem {
  factor: string;
  details: string;
  source: string;
}

export interface AdminCopilotResponseData {
  success: boolean;
  summary: string;
  overview?: {
    todayBookingsCount?: number;
    pendingPaymentsCount?: number;
    leadFollowupsCount?: number;
    risksCount?: number;
  };
  sources?: string[];
  reasoning?: ReasoningItem[];
  actionCards?: ActionCardItem[];
  providerUsed?: string;
  modelUsed?: string;
  requiresHumanApproval?: boolean;
  toolExecuted?: string;
  requestId?: string;
  error?: string;
}

/**
 * Client-side helper function to execute Admin AI Copilot queries.
 */
export async function askAdminCopilot(
  payload: AdminCopilotPayload
): Promise<AdminCopilotResponseData> {
  const response = await fetch("/api/ai/admin-copilot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Admin AI Copilot service encountered an error.");
  }

  return data;
}
