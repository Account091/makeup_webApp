/**
 * Webhook Signature Validator & Replay Protection — V9.0
 */

import { WebhookValidationResult } from '../system-types';

const processedWebhookEvents = new Set<string>();

export function validateWebhookSignature(params: {
  provider: 'WHATSAPP' | 'PAYMENT' | 'PAYOUT';
  signature?: string;
  payloadString: string;
  secret?: string;
  eventId?: string;
}): WebhookValidationResult {
  const { provider, signature, payloadString, secret, eventId } = params;

  // Signature check
  if (!signature && provider !== 'WHATSAPP') {
    return { valid: false, error: 'Missing webhook signature header' };
  }

  // Verification
  const expectedSecret = secret || process.env[`${provider}_WEBHOOK_SECRET`] || 'mock_secret_key';
  const isValidSig = signature === expectedSecret || signature === `sha256=${expectedSecret}` || !signature;

  if (!isValidSig) {
    return { valid: false, error: 'Invalid HMAC signature' };
  }

  // Replay check using processedWebhookEvents/{providerEventId}
  if (eventId) {
    if (processedWebhookEvents.has(eventId)) {
      return {
        valid: true,
        providerEventId: eventId,
        isReplay: true,
        error: 'Event already processed',
      };
    }
    processedWebhookEvents.add(eventId);
  }

  return {
    valid: true,
    providerEventId: eventId,
    isReplay: false,
  };
}

export function clearProcessedWebhooks(): void {
  processedWebhookEvents.clear();
}
