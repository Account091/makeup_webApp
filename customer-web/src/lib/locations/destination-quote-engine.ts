import { DestinationQuoteRequest, DestinationQuoteResult } from "./location-types";
import { resolveRegionalServicePrice } from "./travel-pricing-engine";

export function createDestinationQuote(req: DestinationQuoteRequest): DestinationQuoteResult {
  const quoteId = `dest_quote_${Date.now()}`;
  const now = new Date().toISOString();

  // 1. Calculate Service & Artist Fees
  let serviceFeesTotal = 0;
  const functionCount = req.functions.length || 1;

  for (const fn of req.functions) {
    const base = resolveRegionalServicePrice(fn.serviceId || "royal-bridal", "destination", 25000);
    serviceFeesTotal += base;
  }

  const artistFeesTotal = Math.round(serviceFeesTotal * 0.35);

  // 2. Travel & Stay Logistics
  let travelFeeTotal = 0;
  if (req.travelMode === "Flight") {
    travelFeeTotal = 12000 * Math.max(1, req.artistCount);
  } else if (req.travelMode === "Train") {
    travelFeeTotal = 4000 * Math.max(1, req.artistCount);
  } else {
    travelFeeTotal = 8000;
  }

  const accommodationFeeTotal = req.requiresStay ? 6000 * functionCount * Math.max(1, req.artistCount) : 0;
  const logisticsFeeTotal = 3000 * functionCount;

  // 3. Tax, Discount, Total
  const subtotal = serviceFeesTotal + travelFeeTotal + accommodationFeeTotal + logisticsFeeTotal;
  const discountAmount = functionCount >= 3 ? Math.round(subtotal * 0.05) : 0;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = Math.round(taxableAmount * 0.18); // 18% GST
  const authoritativeTotal = taxableAmount + taxAmount;
  const depositRequired = Math.round(authoritativeTotal * 0.3); // 30% advance deposit

  return {
    quoteId,
    brideName: req.brideName,
    destinationCity: req.destinationCity,
    serviceFeesTotal,
    artistFeesTotal,
    travelFeeTotal,
    accommodationFeeTotal,
    logisticsFeeTotal,
    taxAmount,
    discountAmount,
    authoritativeTotal,
    depositRequired,
    outstationBufferDays: Math.min(2, functionCount),
    status: "DRAFT_QUOTE",
    calculatedAt: now,
  };
}
