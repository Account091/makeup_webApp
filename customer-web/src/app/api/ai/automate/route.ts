import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';
import { scrubObjectPii, scrubPii } from '../../../../lib/ai/pii-scrubber';
import {
  getCircuitStatus,
  recordAIFailure,
  recordAISuccess,
  getStudioWhatsAppUrl,
} from '../../../../lib/ai/ai-circuit-breaker';

// Default Free Instruct Models on Hugging Face (Avoid Coder models for conversational styling)
const DEFAULT_HF_MODEL = process.env.AI_DEFAULT_MODEL || 'Qwen/Qwen2.5-7B-Instruct';

interface AutomateRequest {
  action:
    | 'WHATSAPP_AUTO_REPLY'
    | 'LEAD_SCORING_AUDIT'
    | 'REVIEW_SENTIMENT_RESPONSE'
    | 'BRIDAL_BEAUTY_ADVICE'
    | 'DISPATCH_INCIDENT_RESOLVER'
    | 'QUOTE_RECOMMENDER';
  payload: Record<string, any>;
  customPrompt?: string;
}

// In-Memory Fast Cache (L1) with 1-hour TTL
interface CacheEntry {
  response: string;
  structuredData: any;
  timestamp: number;
}
const aiResponseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 Hour

// Sliding-window IP Rate Limiter: Max 15 requests per minute per IP
const ipRateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;

export async function POST(req: Request) {
  try {
    // 0. IP Rate Limiting Guard
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const now = Date.now();
    const rateData = ipRateLimits.get(clientIp);

    if (rateData && now < rateData.resetAt) {
      if (rateData.count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json(
          {
            error: 'Too many requests. Please wait a moment before sending another inquiry.',
            rateLimited: true,
            whatsappSupport: getStudioWhatsAppUrl(),
          },
          { status: 429 }
        );
      }
      rateData.count++;
    } else {
      ipRateLimits.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    }

    const body: AutomateRequest = await req.json();
    const { action, payload, customPrompt } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    // 1. Prompt Injection & Jailbreak Defense
    const userPromptContent = `${customPrompt || ''} ${JSON.stringify(payload || {})}`;
    if (detectPromptInjection(userPromptContent)) {
      console.warn('[PromptDefense] Injection pattern detected from IP:', clientIp);
      return NextResponse.json({
        success: true,
        action,
        provider: 'prompt_defense_guard',
        result:
          'Special offer requests, custom discounts, and date authorizations must be approved by Prachi Studio Management. Inquiries can be submitted to our team on WhatsApp: ' +
          getStudioWhatsAppUrl(),
        data: {
          flagged: true,
          reason: 'PROMPT_INJECTION_DETECTED',
        },
      });
    }

    // 2. DPDP Act 2023 Compliance: Scrub PII before any prompt assembly or external call
    const sanitizedPayload = scrubObjectPii(payload || {});
    const sanitizedCustomPrompt = customPrompt ? scrubPii(customPrompt).scrubbedText : undefined;

    // 3. Cache Lookup: Identical queries return immediately at 0 cost
    const cacheKey = `${action}:${JSON.stringify(sanitizedPayload)}:${sanitizedCustomPrompt || ''}`;
    const cached = aiResponseCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        action,
        provider: 'cache_lru',
        model: DEFAULT_HF_MODEL,
        result: cached.response,
        data: cached.structuredData,
        cached: true,
        timestamp: new Date(cached.timestamp).toISOString(),
      });
    }

    // 4. Circuit Breaker Check (Honors 402 Month-Long Lockout & 429 Short Cooldown)
    const circuit = await getCircuitStatus();
    if (circuit.state === 'OPEN') {
      console.warn(`[HF Automate API] Circuit is OPEN (${circuit.reason}). Serving deterministic fallback.`);
      const fallbackResult = generateSmartDomainAutomation(action, sanitizedPayload);
      return NextResponse.json({
        success: true,
        action,
        provider: 'deterministic_rules_fallback',
        model: 'studio_knowledge_engine',
        result: fallbackResult,
        circuitBreakerActive: true,
        cooldownUntil: circuit.cooldownUntil,
        humanHandoffUrl: getStudioWhatsAppUrl(),
      });
    }

    const token =
      process.env.HF_TOKEN ||
      process.env.HUGGINGFACE_API_KEY ||
      process.env.HF_INFERENCE_TOKEN;

    const { systemPrompt, userPrompt } = buildAutomationPrompts(
      action,
      sanitizedPayload,
      sanitizedCustomPrompt
    );

    let aiResponseText = '';
    let usedProvider = 'huggingface_free_api';

    if (token) {
      try {
        const hf = new HfInference(token);
        const response = await hf.chatCompletion({
          model: DEFAULT_HF_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 450, // Strict token limit to preserve monthly credit pool
          temperature: 0.5,
        });

        aiResponseText = response.choices?.[0]?.message?.content || '';
        await recordAISuccess();
      } catch (hfError: any) {
        // Handle 402 Credit Pool Exhaustion ($0.10 limit) or 429 Rate Limit
        const isCreditLimit =
          hfError?.status === 402 ||
          hfError?.statusCode === 402 ||
          hfError?.message?.includes('402') ||
          hfError?.message?.includes('Payment Required');

        const isRateLimit =
          hfError?.status === 429 ||
          hfError?.statusCode === 429 ||
          hfError?.message?.includes('429');

        if (isCreditLimit) {
          console.warn('[HF Automate API] 402 Credit Wall Hit ($0.10 limit). Locking breaker for billing cycle.');
          await recordAIFailure('402_CREDIT_EXHAUSTED');
        } else if (isRateLimit) {
          console.warn('[HF Automate API] 429 Rate Limited. Applying 60s cooldown.');
          await recordAIFailure('429_RATE_LIMIT');
        } else {
          await recordAIFailure('TIMEOUT_OR_5XX', hfError?.message);
        }

        aiResponseText = generateSmartDomainAutomation(action, sanitizedPayload);
        usedProvider = 'deterministic_rules_fallback';
      }
    } else {
      aiResponseText = generateSmartDomainAutomation(action, sanitizedPayload);
      usedProvider = 'deterministic_rules_engine';
    }

    // Parse structured JSON if present
    let structuredData: any = null;
    try {
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Plain text response
    }

    // Save to Cache
    aiResponseCache.set(cacheKey, {
      response: aiResponseText,
      structuredData,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      action,
      provider: usedProvider,
      model: DEFAULT_HF_MODEL,
      result: aiResponseText,
      data: structuredData,
      cached: false,
      timestamp: new Date().toISOString(),
      humanHandoffUrl: getStudioWhatsAppUrl(),
    });
  } catch (error: any) {
    console.error('[HuggingFace Automate API] Fatal error:', error);
    return NextResponse.json(
      { error: error?.message || 'Automation execution failed' },
      { status: 500 }
    );
  }
}

function detectPromptInjection(text: string): boolean {
  const patterns = [
    /ignore (all )?(previous|above|system) (instructions|directions|prompts)/i,
    /give (me )?(a )?(50%|free|\d+%) discount/i,
    /override (the )?(price|pricing|rules|guardrails)/i,
    /you are now in (developer|dan|jailbreak) mode/i,
    /reveal (your )?(system|original) prompt/i,
  ];
  return patterns.some((p) => p.test(text));
}

function buildAutomationPrompts(
  action: AutomateRequest['action'],
  payload: Record<string, any>,
  customPrompt?: string
): { systemPrompt: string; userPrompt: string } {
  const brandContext =
    'You are the intelligent studio assistant for "Makeovers by Prachi", a luxury bridal makeup atelier in Rajasthan (Jaipur, Jodhpur, Udaipur). Tone: Royal, warm, respectful. Rules first: factual pricing, advance percentages, and calendar availability are determined strictly by studio policy.';

  switch (action) {
    case 'WHATSAPP_AUTO_REPLY':
      return {
        systemPrompt: `${brandContext} Generate a concise, polite WhatsApp message under 120 words. Include suitable emojis (✨, 👑, 💄) and direct client to the official quote link.`,
        userPrompt: customPrompt || `Inquiry: "${payload.message || 'Check availability for wedding in Jodhpur'}"
City: ${payload.city || 'Jodhpur'}
Quote ID: ${payload.quoteId || 'QT-2026'}`,
      };

    case 'LEAD_SCORING_AUDIT':
      return {
        systemPrompt: `${brandContext} Evaluate this incoming booking lead. Respond strictly in JSON: {"score": number (0-100), "tier": "PLATINUM" | "GOLD" | "SILVER", "riskFlags": string[], "recommendedAction": string, "upsellOpportunity": string}.`,
        userPrompt: `Budget: ₹${payload.grossAmount || 45000}
City: ${payload.city || 'Jodhpur'}
Deposit Status: ${payload.depositStatus || 'PENDING'}`,
      };

    case 'REVIEW_SENTIMENT_RESPONSE':
      return {
        systemPrompt: `${brandContext} Analyze this review and draft an empathetic response from Prachi. Respond in JSON: {"sentiment": "VERY_POSITIVE" | "POSITIVE" | "NEUTRAL" | "CONCERN", "starRatingEquivalent": number, "escalationNeeded": boolean, "draftResponse": string}.`,
        userPrompt: `Review: "${payload.reviewText}"
Rating: ${payload.rating || 5} Stars`,
      };

    case 'BRIDAL_BEAUTY_ADVICE':
      return {
        systemPrompt: `${brandContext} You are a Senior Bridal Skincare Consultant. Explain why harsh chemical peels are strictly avoided 14 days before wedding and provide desert climate hydration advice. Keep it practical and reassuring.`,
        userPrompt: customPrompt || `Question: "${payload.question || 'Emergency skincare routine'}"
Skin Type: ${payload.skinType || 'Combination / Sensitive'}`,
      };

    case 'DISPATCH_INCIDENT_RESOLVER':
      return {
        systemPrompt: `${brandContext} Solve wedding-day transit delays. Respond in JSON: {"severity": "LOW" | "MEDIUM" | "CRITICAL", "immediateAction": string, "backupArtistAssigned": string, "clientMessageDraft": string}.`,
        userPrompt: `Incident: "${payload.incidentDescription || 'Traffic delay on highway'}"
Ready Time: ${payload.readyByTime}
Venue: ${payload.venue}`,
      };

    case 'QUOTE_RECOMMENDER':
      return {
        systemPrompt: `${brandContext} Recommend the optimal bridal package based on party size and venue climate.`,
        userPrompt: customPrompt || `Guest Count: ${payload.guestCount || 4}
City: ${payload.city || 'Rajasthan'}`,
      };

    default:
      return {
        systemPrompt: brandContext,
        userPrompt: customPrompt || JSON.stringify(payload),
      };
  }
}

function generateSmartDomainAutomation(
  action: AutomateRequest['action'],
  payload: Record<string, any>
): string {
  const whatsappUrl = getStudioWhatsAppUrl();

  switch (action) {
    case 'WHATSAPP_AUTO_REPLY':
      return `Namaste! ✨\n\nThank you for reaching out to Makeovers by Prachi. We are pleased to confirm that we currently have availability for your wedding celebrations in ${payload.city || 'Rajasthan'}! 👑\n\nAll Signature Airbrush & HD Bridal packages include 18-hour sweat-proof formulation, custom jewellery coordination, and luxury touch-up kits.\n\nYou can review your verified proposal, compare tiers, or lock your date here:\n🔗 https://makeoversbyprachi.com/quote/${payload.quoteId || 'QT-2026'}\n\nWarmest regards,\nTeam Makeovers by Prachi 💄\n💬 Direct Studio WhatsApp: ${whatsappUrl}`;

    case 'LEAD_SCORING_AUDIT':
      const amount = payload.grossAmount || 45000;
      const isDestination = ['Jodhpur', 'Udaipur', 'Jaipur'].includes(payload.city);
      const score = Math.min(98, (isDestination ? 40 : 25) + (amount > 50000 ? 45 : 30) + 15);
      const tier = score >= 85 ? 'PLATINUM' : score >= 70 ? 'GOLD' : 'SILVER';
      return JSON.stringify(
        {
          score,
          tier,
          riskFlags: [
            ...(payload.depositStatus !== 'PAID' ? ['Deposit pending (48h lock window)'] : []),
            ...(amount > 100000 ? ['High-value destination logistics review advised'] : []),
          ],
          recommendedAction:
            score >= 85
              ? 'Assign Senior Concierge immediately and secure lead artist calendar.'
              : 'Send WhatsApp quote follow-up with real bride transformation video.',
          upsellOpportunity:
            'Propose 2-associate family styling package for Mother and Sister (+₹15,000).',
        },
        null,
        2
      );

    case 'REVIEW_SENTIMENT_RESPONSE':
      return JSON.stringify(
        {
          sentiment: 'VERY_POSITIVE',
          starRatingEquivalent: 5,
          escalationNeeded: false,
          draftResponse: `Thank you so much! 💖 It was an absolute honour for me and the entire team to be a part of your royal wedding celebrations. You looked breathtaking in every portrait! Wishing you a lifetime of joy and radiance. — Warmly, Prachi & Team ✨`,
        },
        null,
        2
      );

    case 'BRIDAL_BEAUTY_ADVICE':
      return `✨ **Personalized Bridal Skincare & Prep Protocol**\n\nAdvisory for **${payload.skinType || 'Bridal'}** skin in Rajasthan:\n\n1. **Hydration & Barrier Shield:** Switch to hyaluronic acid serum on damp skin followed by a ceramide moisturizer. Heritage palace interiors and desert winds can cause sudden dehydration.\n2. **Strict Warning:** ⚠️ DO NOT introduce new chemical peels, retinol, or unfamiliar salon facials within 21 days of your wedding day to prevent allergic purging.\n3. **Night-Before Call Time:** Sleep with an extra pillow to prevent facial puffiness, drink 2.5L water with electrolytes, and ensure face is washed with a gentle cream cleanser before our team arrives.\n\n💬 Need to consult Prachi directly? WhatsApp: ${whatsappUrl}`;

    case 'DISPATCH_INCIDENT_RESOLVER':
      return JSON.stringify(
        {
          severity: 'MEDIUM',
          immediateAction:
            'Reroute lead vehicle via bypass corridor. Dispatch standby assistant Anita to venue 20 mins early for hair sectioning and skin prep.',
          backupArtistAssigned: 'Anita (Senior Associate, 4.9★, 6km away)',
          clientMessageDraft:
            'Namaste! Our lead team is navigating slight venue traffic with revised ETA. Senior Stylist Anita is already in the hotel suite setting up daylight mirrors and starting hair hydration prep so we finish strictly on schedule! 👑',
        },
        null,
        2
      );

    case 'QUOTE_RECOMMENDER':
      return `Based on your celebration with ${payload.guestCount || 4} guests in ${payload.city || 'Rajasthan'}, we recommend the **Royal Airbrush Signature Package** (₹55,000).\n\n**Key Inclusions:**\n- **18-Hour Humidity Resistance:** Airbrush silicone formula withstands palace heat, heavy poshak embroidery, and flash photography.\n- **Entourage Continuity:** Includes 2 Senior Styling Associates so your family is ready without stress before the baraat arrival.\n- **Complimentary Trial:** Pre-wedding 3D face trial included so there are zero surprises on your big day.`;
  }
}
