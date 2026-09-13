export interface ConciergeRequestPayload {
  userPrompt: string;
  eventType?: string;
  skinType?: string;
  authPayload?: {
    uid?: string;
    customerId?: string;
    phone?: string;
    role?: string;
  };
  chatHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ConciergeResponseData {
  success: boolean;
  answer: string;
  sources?: string[];
  recommendations?: string[];
  requiresHumanAction?: boolean;
  actionType?: string | null;
  providerUsed?: string;
  modelUsed?: string;
  requestId?: string;
  error?: string;
}

/**
 * Client-side helper function to call the Beauty Concierge API route.
 */
export async function askBeautyConcierge(
  payload: ConciergeRequestPayload
): Promise<ConciergeResponseData> {
  const response = await fetch("/api/ai/concierge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to reach Beauty Concierge AI.");
  }

  return data;
}
