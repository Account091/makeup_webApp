import { HfInference } from "@huggingface/inference";
import { AiProvider, ProviderExecutionOptions, ProviderExecutionResult } from "./ai-provider";
import { AiModelTimeoutError } from "./ai-errors";
import {
  recordAIFailure,
  recordAISuccess,
  getCircuitStatus,
  getStudioWhatsAppUrl,
} from "./ai-circuit-breaker";
import { scrubPii } from "./pii-scrubber";

export class HuggingFaceProvider implements AiProvider {
  public readonly name = "huggingface" as const;

  public async execute(options: ProviderExecutionOptions): Promise<ProviderExecutionResult> {
    const circuit = await getCircuitStatus();
    if (circuit.state === "OPEN") {
      console.warn(
        `[HuggingFaceProvider] Circuit breaker is OPEN (Reason: ${circuit.reason || "Cooldown active"}). Fast-failing to deterministic studio knowledge engine.`
      );
      return {
        content: generateSmartSimulatedResponse(options, "circuit_open"),
        provider: "huggingface",
        model: options.model,
        inputTokens: 0,
        outputTokens: 0,
      };
    }

    const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || process.env.HF_INFERENCE_TOKEN;

    // When HF_TOKEN is not configured, serve deterministic engine without error
    if (!token) {
      const simulatedContent = generateSmartSimulatedResponse(options, "unconfigured_token");
      return {
        content: simulatedContent,
        provider: "huggingface",
        model: options.model,
        inputTokens: 40,
        outputTokens: 35,
      };
    }

    const providerConfig = process.env.HF_PROVIDER || options.providerPolicy || "auto";
    const hf = new HfInference(token);

    const controller = new AbortController();
    const timeoutMs = options.timeoutMs || parseInt(process.env.AI_REQUEST_TIMEOUT_MS || "30000", 10);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // 1. DPDP Compliance: Scrub PII with verified order of operations
      const scrubbedMessages = (options.messages as Array<{ role: string; content: string }>).map((m) => ({
        role: m.role,
        content: scrubPii(m.content || "").scrubbedText,
      }));

      // 2. Execute via official HfInference SDK chatCompletion
      const chatOptions: any = {
        model: options.model,
        messages: scrubbedMessages,
        max_tokens: options.maxTokens || 400,
        temperature: options.temperature ?? 0.6,
      };

      if (providerConfig && providerConfig !== "auto") {
        chatOptions.provider = providerConfig;
      }

      const response = await hf.chatCompletion(chatOptions);

      clearTimeout(timeoutId);
      await recordAISuccess();

      const content = response.choices?.[0]?.message?.content || "";
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;

      return {
        content,
        provider: "huggingface",
        model: options.model,
        inputTokens,
        outputTokens,
        rawResponse: response,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      // Check for 402 Credit Exhaustion ($0.10 limit) or 429 Rate Limit
      const isCreditExhausted =
        err?.status === 402 ||
        err?.statusCode === 402 ||
        err?.message?.includes("402") ||
        err?.message?.includes("Payment Required") ||
        err?.message?.includes("exceeded your current quota");

      const isRateLimited =
        err?.status === 429 ||
        err?.statusCode === 429 ||
        err?.message?.includes("429") ||
        err?.message?.includes("Rate limit");

      if (isCreditExhausted) {
        console.warn(
          "[HuggingFaceProvider] 402 Monthly Credit Wall Reached ($0.10 limit). Locking breaker for billing cycle."
        );
        await recordAIFailure("402_CREDIT_EXHAUSTED");
        return {
          content: generateSmartSimulatedResponse(options, "credit_pool_exhausted"),
          provider: "huggingface",
          model: "deterministic_rules_fallback",
          inputTokens: 0,
          outputTokens: 0,
        };
      }

      if (isRateLimited) {
        console.warn("[HuggingFaceProvider] 429 Rate Limited. Applying 60s cooldown.");
        await recordAIFailure("429_RATE_LIMIT");
        return {
          content: generateSmartSimulatedResponse(options, "rate_limited"),
          provider: "huggingface",
          model: "deterministic_rules_fallback",
          inputTokens: 0,
          outputTokens: 0,
        };
      }

      if (err.name === "AbortError") {
        await recordAIFailure("TIMEOUT_OR_5XX", "Timeout exceeded");
        throw new AiModelTimeoutError(`Hugging Face request timed out after ${timeoutMs}ms`);
      }

      await recordAIFailure("TIMEOUT_OR_5XX", err?.message || "Inference error");
      return {
        content: generateSmartSimulatedResponse(options, "api_error"),
        provider: "huggingface",
        model: "deterministic_rules_fallback",
        inputTokens: 0,
        outputTokens: 0,
      };
    }
  }
}

function generateSmartSimulatedResponse(
  options: ProviderExecutionOptions,
  reason: "unconfigured_token" | "circuit_open" | "credit_pool_exhausted" | "rate_limited" | "api_error" = "unconfigured_token"
): string {
  const userMsg = (options.messages.slice().reverse().find((m) => m.role === "user")?.content || "").toLowerCase();
  const whatsappUrl = getStudioWhatsAppUrl();

  let answer = "";
  let sources = ["service:royal-bridal", "policy:general-concierge"];
  let recommendations = ["Bridal packages & pricing", "What's included?", "Check my booking status"];

  if (userMsg.includes("status") || userMsg.includes("check") || userMsg.includes("track") || userMsg.includes("invoice")) {
    answer =
      "To check your live booking status or download your official GST invoice receipt, please use the input field at the top of this Concierge to enter your Phone Number or Booking Ref ID (e.g. BK-426189), or visit our Track Invoice page directly.";
    sources = ["policy:booking-lookup", "ledger:firestore"];
    recommendations = ["Track Invoice page", "Reschedule date request", "Contact Prachi on WhatsApp"];
  } else if (userMsg.includes("included") || userMsg.includes("inclusion") || userMsg.includes("prep") || userMsg.includes("what's included")) {
    answer =
      "All Signature Royal Bridal Packages include: 16-Hour Sweat-Proof HD Airbrush Base, Custom Lash Design & Eye Makeup, Bridal Hair Styling with fresh flowers, Traditional Rajasthani Poshak & Dupatta Setting, Borla & Royal Jewelry Coordination, and an Emergency Touch-Up Kit.";
    sources = ["guideline:bridal-prep", "service:royal-bridal"];
    recommendations = ["Book Signature Bridal Package (₹25,000)", "Jaipur & Udaipur travel policy", "Advance payment policy"];
  } else if (userMsg.includes("book") || userMsg.includes("reserve") || userMsg.includes("slot") || userMsg.includes("wizard")) {
    answer =
      "To lock your date for the Signature Royal Bridal Package (₹25,000), please click 'Book Date' to open our Booking Wizard. Select your event date, enter venue details, and complete the 30% advance deposit via UPI QR Code to lock your calendar slot.";
    sources = ["service:royal-bridal", "policy:booking-wizard"];
    recommendations = ["What's included?", "Jaipur & Udaipur travel policy", "Check my booking status"];
  } else if (userMsg.includes("pric") || userMsg.includes("cost") || userMsg.includes("rate") || userMsg.includes("package")) {
    answer =
      "Our packages are transparently priced with zero hidden fees: Signature Royal Bridal: ₹25,000 | Pre-Wedding Engagement Glam: ₹15,000 | Party & Guest Makeover: ₹8,500 | Destination Bridal Package: ₹45,000. All bookings require a 30% advance deposit to lock your date.";
    sources = ["service:royal-bridal", "policy:pricing-ledger"];
    recommendations = ["Book Signature Bridal Package (₹25,000)", "What's included?", "Jaipur & Udaipur travel policy"];
  } else if (userMsg.includes("travel") || userMsg.includes("jaipur") || userMsg.includes("udaipur") || userMsg.includes("destination") || userMsg.includes("jodhpur")) {
    answer =
      "Prachi & her senior team travel for palace destination weddings across Jaipur, Udaipur, Jaisalmer, and all major cities in Rajasthan & India. Destination packages are ₹45,000 for full multi-event coverage with a dedicated on-venue touch-up station.";
    sources = ["policy:travel-policy", "service:destination-bridal"];
    recommendations = ["Destination Bridal Package (₹45,000)", "Book Date →", "Consultation inquiry"];
  } else if (userMsg.includes("reschedule") || userMsg.includes("cancel") || userMsg.includes("change date")) {
    answer =
      "Date reschedules are permitted up to 14 days prior to your event date subject to slot availability on Prachi's master calendar. You can submit a reschedule request from your Track Booking dashboard.";
    sources = ["policy:reschedule-policy"];
    recommendations = ["Track Booking page", "Check master calendar", `WhatsApp Support (${whatsappUrl})`];
  } else if (userMsg.includes("advance") || userMsg.includes("payment") || userMsg.includes("deposit") || userMsg.includes("qr")) {
    answer =
      "Dates are locked on a first-come, first-served basis upon payment of the 30% advance deposit via UPI QR Code. Your slot is held for 5 minutes during the checkout session while your payment proof is recorded.";
    sources = ["policy:payment-gate", "financial:sheets-mirror"];
    recommendations = ["Proceed to Booking Wizard", "Track payment status", "Cancellation policy"];
  } else {
    answer =
      "Namaste! ✨ I am your AI Beauty Concierge at Makeovers by Prachi. I can assist you with package details, traditional Rajasthani Poshak draping, destination travel policies across Jodhpur/Jaipur/Udaipur, or checking your live booking status!";
  }

  if (reason === "credit_pool_exhausted" || reason === "circuit_open" || reason === "rate_limited") {
    answer += `\n\n💬 Need instant bespoke assistance? Chat directly with Prachi on WhatsApp: ${whatsappUrl}`;
  }

  return JSON.stringify({
    answer,
    data: {
      sources,
      recommendations,
      fallbackMode: reason,
      humanHandoffUrl: whatsappUrl,
    },
  });
}
