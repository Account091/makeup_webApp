import { NextResponse } from "next/server";
import { validateStudioWhatsAppConfig } from "../../../lib/ai/ai-circuit-breaker";
import { getVectorStoreStatus } from "../../../lib/ai/knowledge/vector-store";

export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; mode?: string; warning?: string }> = {};
  let isAllHealthy = true;

  // 1. WhatsApp Config Validation (ZERO config values or phone numbers leaked)
  try {
    validateStudioWhatsAppConfig();
    checks.whatsapp = { status: "ok" };
  } catch (_: any) {
    checks.whatsapp = { status: "error", warning: "Studio WhatsApp number is unconfigured or set to placeholder." };
    isAllHealthy = false;
  }

  // 2. Embedding Configuration Check (ZERO URLs or secrets leaked)
  const isProduction = process.env.NODE_ENV === "production";
  const hasEmbeddingUrl = !!process.env.EMBEDDING_SERVICE_URL;

  if (isProduction && !hasEmbeddingUrl) {
    checks.embeddingService = {
      status: "error",
      warning: "EMBEDDING_SERVICE_URL is required in production.",
    };
    isAllHealthy = false;
  } else {
    checks.embeddingService = {
      status: "ok",
      mode: hasEmbeddingUrl ? "cloud_run_service" : "mock_provider",
    };
  }

  // 3. VectorStore Status & Fallback Reporting
  const vsStatus = getVectorStoreStatus();
  checks.vectorStore = {
    status: "ok",
    mode: vsStatus.mode,
    ...(vsStatus.warning ? { warning: vsStatus.warning } : {}),
  };

  return NextResponse.json(
    {
      status: isAllHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: isAllHealthy ? 200 : 503 }
  );
}
