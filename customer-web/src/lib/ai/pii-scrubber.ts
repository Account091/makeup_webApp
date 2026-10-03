/**
 * DPDP Act 2023 Compliant PII Scrubber
 * 
 * Order of execution is critical to prevent over-matching and mislabeling:
 * 1. Explicit Bank Transaction / UTR numbers (e.g. UTR: 426189012345, Ref# 987654321012)
 * 2. UPI Handles (e.g. radhika@oksbi, 9829012345@paytm) - Must run before generic email
 * 3. Email addresses (e.g. bride.radhika@gmail.com)
 * 4. Indian PAN Card (e.g. ABCDE1234F)
 * 5. Aadhaar Numbers (e.g. 2345 6789 0123, 2345-6789-0123, 234567890123)
 * 6. Indian Phone Numbers (e.g. +91 98290 12345, +91-9829012345, 09829012345, 98290 12345, 9829012345)
 * 7. Standalone 12-digit numbers (tagged as IDENTIFIER)
 * 
 * NOTE: Regexes are created per invocation or reset to avoid stateful lastIndex bugs in JS.
 */

export interface PiiScrubResult {
  scrubbedText: string;
  hasRedactions: boolean;
  redactionTypes: string[];
}

export function scrubPii(text: string): PiiScrubResult {
  if (!text || typeof text !== "string") {
    return { scrubbedText: text || "", hasRedactions: false, redactionTypes: [] };
  }

  let scrubbed = text;
  const redactionTypes: string[] = [];

  // Step 1: Explicit UTR / Bank Reference (must run before phone to preserve "UTR: 1234...")
  const explicitUtrRegex = /\b(?:UTR|Ref|Txn|Transaction|IMPS|NEFT|RTGS|RefNo)[:\s#-]*([A-Za-z0-9]{10,22})\b/gi;
  if (explicitUtrRegex.test(scrubbed)) {
    explicitUtrRegex.lastIndex = 0;
    scrubbed = scrubbed.replace(explicitUtrRegex, () => {
      redactionTypes.push("UTR");
      return "UTR:[UTR_REDACTED]";
    });
  }

  // Step 2: UPI Handles
  const upiRegex = /\b[a-zA-Z0-9.\-_]{2,64}@(oksbi|okhdfcbank|okicici|okaxis|paytm|ybl|ibl|upi|axl|apl|barodampay|federal|kotak|pnb)\b/gi;
  if (upiRegex.test(scrubbed)) {
    upiRegex.lastIndex = 0;
    scrubbed = scrubbed.replace(upiRegex, () => {
      redactionTypes.push("UPI_ID");
      return "[UPI_ID_REDACTED]";
    });
  }

  // Step 3: Generic Emails
  const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
  if (emailRegex.test(scrubbed)) {
    emailRegex.lastIndex = 0;
    scrubbed = scrubbed.replace(emailRegex, () => {
      redactionTypes.push("EMAIL");
      return "[EMAIL_REDACTED]";
    });
  }

  // Step 4: PAN Card
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
  if (panRegex.test(scrubbed)) {
    panRegex.lastIndex = 0;
    scrubbed = scrubbed.replace(panRegex, () => {
      redactionTypes.push("PAN");
      return "[PAN_REDACTED]";
    });
  }

  // Step 5: Indian Phone Numbers (Must run before unspaced 12-digit Aadhaar to catch 91+10digit phones)
  const phoneRegex = /(?:\+?91[\s\-]?)?(?:0)?[6-9]\d{4}[\s\-]?\d{5}\b|(?:\+?91[\s\-]?)?(?:0)?[6-9]\d{2}[\s\-]?\d{3}[\s\-]?\d{4}\b|(?:\+?91[\s\-]?)?(?:0)?[6-9]\d{9}\b/g;
  if (phoneRegex.test(scrubbed)) {
    phoneRegex.lastIndex = 0;
    scrubbed = scrubbed.replace(phoneRegex, () => {
      redactionTypes.push("PHONE");
      return "[PHONE_REDACTED]";
    });
  }

  // Step 6: Aadhaar Numbers
  const aadhaarRegex = /\b[2-9]{1}[0-9]{3}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}\b/g;
  if (aadhaarRegex.test(scrubbed)) {
    aadhaarRegex.lastIndex = 0;
    scrubbed = scrubbed.replace(aadhaarRegex, () => {
      redactionTypes.push("AADHAAR");
      return "[AADHAAR_REDACTED]";
    });
  }

  // Step 7: Standalone 12-digit number (if any remaining after phone & Aadhaar)
  const standalone12Regex = /\b\d{12}\b/g;
  if (standalone12Regex.test(scrubbed)) {
    standalone12Regex.lastIndex = 0;
    scrubbed = scrubbed.replace(standalone12Regex, () => {
      redactionTypes.push("IDENTIFIER");
      return "[IDENTIFIER_REDACTED]";
    });
  }

  return {
    scrubbedText: scrubbed,
    hasRedactions: redactionTypes.length > 0,
    redactionTypes: Array.from(new Set(redactionTypes)),
  };
}

/**
 * Recursively scrubs any payload object or array before external AI calls
 */
export function scrubObjectPii(obj: any): any {
  if (typeof obj === "string") {
    return scrubPii(obj).scrubbedText;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => scrubObjectPii(item));
  }
  if (typeof obj === "object" && obj !== null) {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      cleaned[k] = scrubObjectPii(v);
    }
    return cleaned;
  }
  return obj;
}
