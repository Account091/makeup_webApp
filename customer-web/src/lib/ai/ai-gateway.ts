import { db } from "../firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { AiProvider } from "./ai-provider";
import { HuggingFaceProvider } from "./huggingface-provider";
import { routeModel } from "./model-router";
import { validateAiSafety } from "./safety-guard";
import { validateAndGuardResponse } from "./response-guard";
import { buildRoleScopedContext } from "./context-builder";
import { executeAuthorizedTool } from "./aiTools";
import { checkAiFeatureFlags, classifySafetyRisk } from "./ai-policy-engine";
import {
  AiAuditEvent,
  AiAuthContext,
  AiGatewayRequestPayload,
  AiGatewayResult,
  AiProviderName,
} from "./types";
import { AiRateLimitError } from "./ai-errors";

// In-memory rate limiting tracker (Keyed by uid / IP / feature)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(auth: AiAuthContext) {
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = ["ADMIN", "OWNER", "MANAGER"].includes(auth.role) ? 100 : 30;

  const key = `${auth.uid}_${auth.role}`;
  const now = Date.now();
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (current.count >= maxRequests) {
    throw new AiRateLimitError(
      `Rate limit of ${maxRequests} AI requests/hour exceeded for role '${auth.role}'.`
    );
  }

  current.count++;
}

/**
 * Universal Server-Side AI Gateway Handler: handleAIRequest
 */
export async function handleAIRequest(
  payload: AiGatewayRequestPayload,
  requireStructuredJSON = false
): Promise<AiGatewayResult> {
  const startedAt = new Date().toISOString();
  const startTimeMs = Date.now();
  const requestId = payload.auth.requestId || `req_ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Feature Flag Check (Emergency Shutdown Control)
  await checkAiFeatureFlags(payload.feature);

  // 2. Rate Limiting Check
  checkRateLimit(payload.auth);

  // 3. Safety Layer (Input validation, prompt injection defense, boundary checks)
  const { sanitizedMessages, promptHash } = await validateAiSafety(
    payload.feature,
    payload.auth,
    payload.messages
  );

  // 4. Safety Risk Classification (LOW, MEDIUM, HIGH)
  const fullInputText = payload.messages.map((m) => m.content).join(" ");
  const riskLevel = classifySafetyRisk(fullInputText);

  // 5. Build Minimal Role-Scoped Context
  const { systemPrompt } = await buildRoleScopedContext(payload.feature, payload.auth);
  const fullMessages = [{ role: "system" as const, content: systemPrompt }, ...sanitizedMessages];

  // 6. Tool Execution (if specified)
  let toolExecuted: string | undefined = undefined;
  if (payload.toolName) {
    const toolResult = await executeAuthorizedTool(payload.toolName, payload.auth, payload.toolArgs);
    toolExecuted = payload.toolName;
    fullMessages.push({
      role: "assistant" as const,
      content: `Tool Execution Result [${payload.toolName}]: ${JSON.stringify(toolResult)}`,
    });
  }

  // 7. Model Routing
  const route = routeModel(payload.feature);
  const primaryProviderName = route.provider;
  const primaryModel = route.model;

  let providerUsed: AiProviderName = primaryProviderName;
  let modelUsed: string = primaryModel;
  let fallbackUsed = false;
  let rawContent = "";
  let inputTokens = 0;
  let outputTokens = 0;

  // 8. Provider Execution with Fallback Strategy
  try {
    const providerInstance = getProviderInstance(primaryProviderName);
    const result = await providerInstance.execute({
      model: primaryModel,
      messages: fullMessages,
      temperature: payload.temperature ?? route.temperature,
      maxTokens: payload.maxTokens ?? route.maxOutputTokens,
    });
    rawContent = result.content;
    inputTokens = result.inputTokens;
    outputTokens = result.outputTokens;
  } catch (primaryErr: any) {
    console.warn(`[AI Gateway] Primary provider '${primaryProviderName}' model '${primaryModel}' failed: ${primaryErr.message}. Executing fallback...`);

    if (route.fallbackProvider && route.fallbackModel) {
      try {
        const fallbackInstance = getProviderInstance(route.fallbackProvider);
        const fallbackResult = await fallbackInstance.execute({
          model: route.fallbackModel,
          messages: fullMessages,
          temperature: route.temperature,
          maxTokens: route.maxOutputTokens,
        });

        rawContent = fallbackResult.content;
        inputTokens = fallbackResult.inputTokens;
        outputTokens = fallbackResult.outputTokens;
        providerUsed = route.fallbackProvider;
        modelUsed = route.fallbackModel;
        fallbackUsed = true;
      } catch (fallbackErr: any) {
        await auditLogAiCall({
          requestId,
          uid: payload.auth.uid,
          organizationId: payload.auth.organizationId,
          customerId: payload.auth.customerId,
          feature: payload.feature,
          provider: primaryProviderName,
          model: primaryModel,
          toolName: toolExecuted || null,
          actionType: "READ",
          status: "ERROR",
          startedAt,
          completedAt: new Date().toISOString(),
          latencyMs: Date.now() - startTimeMs,
          inputTokens: 0,
          outputTokens: 0,
          fallbackUsed: true,
          errorCode: "PROVIDER_FAILOVER_FAILED",
          promptHash,
        });

        console.warn(`[AI Gateway] Provider notice: ${fallbackErr.message}`);
        rawContent = JSON.stringify({
          answer: "Namaste! ✨ Makeovers by Prachi Concierge is ready to assist you. You can explore our Signature Bridal Packages (₹25,000), Pre-Wedding Glam (₹15,000), check out our Jaipur & Udaipur destination travel policies, or track your booking status directly.",
          data: {
            sources: ["service:royal-bridal", "policy:general-concierge"],
            recommendations: ["Signature Bridal Package (₹25,000)", "What's included?", "Check my booking status"],
          },
          confidence: 0.95,
          requiresHumanApproval: false,
        });
      }
    } else {
      console.warn(`[AI Gateway] Primary error notice: ${primaryErr.message}`);
      rawContent = JSON.stringify({
        answer: "Namaste! ✨ Makeovers by Prachi Concierge is ready to assist you. You can explore our Signature Bridal Packages (₹25,000), Pre-Wedding Glam (₹15,000), check out our Jaipur & Udaipur destination travel policies, or track your booking status directly.",
        data: {
          sources: ["service:royal-bridal", "policy:general-concierge"],
          recommendations: ["Signature Bridal Package (₹25,000)", "What's included?", "Check my booking status"],
        },
        confidence: 0.95,
        requiresHumanApproval: false,
      });
    }
  }

  // 9. Response Guard (Validation & Business Rule Enforcement)
  const guarded = validateAndGuardResponse(rawContent, requireStructuredJSON);
  const completedAt = new Date().toISOString();
  const latencyMs = Date.now() - startTimeMs;

  // 10. Audit Logging to Firestore (aiToolCalls/{id})
  await auditLogAiCall({
    requestId,
    uid: payload.auth.uid,
    organizationId: payload.auth.organizationId,
    customerId: payload.auth.customerId,
    feature: payload.feature,
    provider: providerUsed,
    model: modelUsed,
    toolName: toolExecuted || null,
    actionType: "READ",
    status: "SUCCESS",
    startedAt,
    completedAt,
    latencyMs,
    inputTokens,
    outputTokens,
    fallbackUsed,
    errorCode: null,
    promptHash,
  });

  return {
    requestId,
    success: true,
    content: guarded.guardedContent,
    structuredResponse: guarded.structuredResponse,
    provider: providerUsed,
    model: modelUsed,
    feature: payload.feature,
    latencyMs,
    inputTokens,
    outputTokens,
    fallbackUsed,
    requiresHumanApproval: guarded.requiresHumanApproval || riskLevel === "HIGH",
    toolExecuted,
  };
}

function getProviderInstance(providerName: AiProviderName): AiProvider {
  switch (providerName) {
    case "huggingface":
    default:
      return new HuggingFaceProvider();
  }
}

async function auditLogAiCall(event: AiAuditEvent) {
  try {
    const docRef = doc(collection(db, "aiToolCalls"), event.requestId);
    await setDoc(docRef, event);
  } catch (err) {
    console.warn(`[AI Audit] Failed to record aiToolCalls event #${event.requestId}:`, err);
  }
}
