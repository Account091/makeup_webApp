/**
 * Consent Manager — V9.1
 */

import { ConsentRecord, ConsentCategory, MediaConsentMap } from './privacy-types';

const consentStore: ConsentRecord[] = [];

export function grantConsent(params: {
  customerId: string;
  type: ConsentCategory;
  version: string;
  source?: 'CUSTOMER_PORTAL' | 'BOOKING_FLOW' | 'ADMIN' | 'API';
}): ConsentRecord {
  const record: ConsentRecord = {
    consentId: `consent_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    customerId: params.customerId,
    type: params.type,
    version: params.version,
    status: 'GRANTED',
    grantedAt: new Date().toISOString(),
    source: params.source || 'CUSTOMER_PORTAL',
  };
  consentStore.push(record);
  return record;
}

export function revokeConsent(customerId: string, type: ConsentCategory): ConsentRecord | null {
  const active = consentStore.find(c => c.customerId === customerId && c.type === type && c.status === 'GRANTED');
  if (active) {
    active.status = 'REVOKED';
    active.revokedAt = new Date().toISOString();
    return active;
  }
  return null;
}

export function getCustomerConsents(customerId: string): ConsentRecord[] {
  return consentStore.filter(c => c.customerId === customerId);
}

export function getConsentHistory(customerId: string, type: ConsentCategory): ConsentRecord[] {
  return consentStore.filter(c => c.customerId === customerId && c.type === type);
}

export function isConsentActive(customerId: string, type: ConsentCategory): boolean {
  return consentStore.some(c => c.customerId === customerId && c.type === type && c.status === 'GRANTED');
}

export function checkMediaPublicationGuard(customerId: string): { allowed: boolean; destinations: MediaConsentMap } {
  const destinations: MediaConsentMap = {
    website: isConsentActive(customerId, 'PORTFOLIO'),
    instagram: isConsentActive(customerId, 'INSTAGRAM'),
    ads: isConsentActive(customerId, 'ADVERTISEMENT'),
    beforeAfter: isConsentActive(customerId, 'BEFORE_AFTER'),
    privateOnly: !isConsentActive(customerId, 'PORTFOLIO') && !isConsentActive(customerId, 'INSTAGRAM'),
  };
  const allowed = destinations.website || destinations.instagram || destinations.ads || destinations.beforeAfter;
  return { allowed, destinations };
}

export function clearConsentStore(): void {
  consentStore.length = 0;
}
