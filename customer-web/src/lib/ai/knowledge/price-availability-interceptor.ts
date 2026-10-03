export interface PriceAvailabilityCheckResult {
  isPriceQuery: boolean;
  isAvailabilityQuery: boolean;
  isFalsePositive: boolean;
  helpfulResponse?: string;
  suggestedAction?: "open_quote_tool" | "check_calendar";
  requiresToolCall: boolean;
}

/**
 * Price and Availability Interceptor
 * Intercepts billing, price negotiation, and calendar queries before knowledge retrieval.
 * Supports English, Hindi, Hinglish, and Marwari dialectal phrases with strict false-positive filtering.
 */
export function checkPriceOrAvailabilityIntent(query: string): PriceAvailabilityCheckResult {
  const q = (query || "").toLowerCase().trim();

  // 1. False Positive & Policy Bypass Guard
  // (a) Duration, Guest Count, Timing, Garment counts (NOT pricing)
  // (b) Policy questions: refund, cancellation, rescheduling, advance policies (Must go to Knowledge Retrieval, NOT price quote!)
  const falsePositivePatterns = [
    /\bkitna\s+time\b/i,
    /\bkitna\s+samay\b/i,
    /\bkitni\s+der\b/i,
    /\bkitne\s+ghante\b/i,
    /\bkitne\s+ghanto\b/i,
    /\bkitne\s+baje\b/i,
    /\bkitne\s+din\b/i,
    /\bkitne\s+log\b/i,
    /\bkitne\s+members\b/i,
    /\bkitni\s+poshak\b/i,
    /\bhow\s+much\s+time\b/i,
    /\bhow\s+long\b/i,
    /\bhow\s+many\s+people\b/i,
    /\bhow\s+many\s+hours\b/i,
    /\bhow\s+many\s+days\b/i,
    /\bhow\s+many\s+bridesmaids\b/i,
    /\bcall\s+time\b/i,
    /\bwhat\s+time\b/i,
    /\bduration\b/i,
    // Policy Bypasses -> Handled by Grounded Knowledge Retrieval
    /\bcancellation\b/i,
    /\bcancel\b/i,
    /\brefund\b/i,
    /\bpaisa\s+wapas\b/i,
    /\bpaise\s+wapas\b/i,
    /\breschedule\b/i,
    /\bdate\s+change\b/i,
    /\btareekh\s+badal/i,
    /\btarikh\s+badal/i,
    /\bpostpone\b/i,
    /\badvance\s+policy\b/i,
    /\badvance\s+kitn[oa]\b/i,
    /\badvance\s+kitno\b/i,
    /\badvance\s+amount\b/i,
    /\bdeposit\s+policy\b/i,
    /\bdeposit\s+amount\b/i,
    /\bterms\s+and\s+conditions\b/i,
    /\bshartein\b/i,
    /\bniyam\b/i,
    /\bbooking\s+cancel\b/i,
  ];

  for (const pattern of falsePositivePatterns) {
    if (pattern.test(q)) {
      return {
        isPriceQuery: false,
        isAvailabilityQuery: false,
        isFalsePositive: true,
        requiresToolCall: false,
      };
    }
  }

  // 2. Dynamic Price & Package Quote Query Patterns (English, Hindi, Hinglish, Marwari)
  const pricePatterns = [
    /\bkitna\s+lagega\b/i,
    /\bkya\s+rate\b/i,
    /\brate\s+bata\b/i,
    /\brates?\b/i,
    /\bcharges?\b/i,
    /\bprice\b/i,
    /\bpricing\b/i,
    /\bcost\b/i,
    /\bfees?\b/i,
    /\bdiscount\b/i,
    /\bkitne\s+rupaye\b/i,
    /\bkitna\s+paisa\b/i,
    /\bkitna\s+charge\b/i,
    /\bkitne\s+paise\b/i,
    /\bkitna\s+rupya\b/i,
    /\bkitno\s+rupya\b/i, // Marwari
    /\bkitno\s+rupyo\b/i, // Marwari
    /\bkitno\s+deuno\b/i, // Marwari
    /\bquote\b/i,
    /\bquotation\b/i,
    /\bhow\s+much\s+does\b/i,
    /\bhow\s+much\s+for\b/i,
    /\bhow\s+much\s+to\b/i,
    /\bhow\s+much\s+is\b/i,
    /\bwhat\s+is\s+the\s+(?:price|rate|cost|fee|charge)\b/i,
    /\bpackage\s+rate\b/i,
  ];

  // 3. Availability Query Patterns
  const availabilityPatterns = [
    /\bdate\s+(?:available|khali|free|booked)\b/i,
    /\bavailable\s+hai\b/i,
    /\bkhali\s+hai\b/i,
    /\bslot\s+(?:milega|available|free)\b/i,
    /\btarikh\s+(?:khali|available)\b/i,
    /\bis\s+(?:my\s+)?date\s+available\b/i,
    /\bcheck\s+(?:my\s+)?availability\b/i,
    /\bcan\s+i\s+book\s+on\b/i,
    /\bfree\s+on\b/i,
    /\bavailable\s+on\b/i,
  ];

  const isPrice = pricePatterns.some((p) => p.test(q));
  const isAvailability = availabilityPatterns.some((p) => p.test(q));

  if (isPrice) {
    return {
      isPriceQuery: true,
      isAvailabilityQuery: false,
      isFalsePositive: false,
      requiresToolCall: true,
      suggestedAction: "open_quote_tool",
      helpfulResponse:
        "Makeovers by Prachi ke verified rates hamare official pricing engine dwara calculate hote hain:\n\n" +
        "• **The Royal Rajputi Heritage Signature**: ₹45,000 (Includes poshak draping, borla & aad setting)\n" +
        "• **Palace Luxury HD Bridal**: ₹35,000\n" +
        "• **Pre-Wedding & Engagement Glam**: ₹18,000\n" +
        "• **Guest / Family Makeover**: ₹7,000 per person\n\n" +
        "Aapki wedding date, city aur guest count kya hai? Main live quote calculate karke aapki date hold karne mein help kar sakti hoon.",
    };
  }

  if (isAvailability) {
    return {
      isPriceQuery: false,
      isAvailabilityQuery: true,
      isFalsePositive: false,
      requiresToolCall: true,
      suggestedAction: "check_calendar",
      helpfulResponse:
        "Dates real-time server calendar dwara verify hoti hain taaki double-booking na ho.\n\n" +
        "Please apni **Wedding Date** (YYYY-MM-DD) aur **City** (Jodhpur, Jaipur, Udaipur, ya Destination) batayein, aur main turant slot availability check kar dungi!",
    };
  }

  return {
    isPriceQuery: false,
    isAvailabilityQuery: false,
    isFalsePositive: false,
    requiresToolCall: false,
  };
}
