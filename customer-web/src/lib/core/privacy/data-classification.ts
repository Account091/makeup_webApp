/**
 * Data Classification Registry — V9.1
 */

import { DataClassificationEntry, DataClassificationLevel } from './privacy-types';

export const DATA_CLASSIFICATION_REGISTRY: DataClassificationEntry[] = [
  { domain: 'services', classification: 'PUBLIC', processingPurpose: 'Service catalog display', retentionCategory: 'INDEFINITE' },
  { domain: 'packages', classification: 'PUBLIC', processingPurpose: 'Service pricing', retentionCategory: 'INDEFINITE' },
  { domain: 'customerProfile', classification: 'CUSTOMER_PRIVATE', processingPurpose: 'Customer identity & CRM', retentionCategory: 'CUSTOMER_PROFILE' },
  { domain: 'bookings', classification: 'CUSTOMER_PRIVATE', processingPurpose: 'Booking management', retentionCategory: 'FINANCIAL_RECORD' },
  { domain: 'consultations', classification: 'SENSITIVE', processingPurpose: 'Service personalization/planning', retentionCategory: 'SUPPORT_CASE' },
  { domain: 'bridalQuestionnaire', classification: 'SENSITIVE', processingPurpose: 'Event-day planning', retentionCategory: 'SUPPORT_CASE' },
  { domain: 'paymentProof', classification: 'FINANCIAL', processingPurpose: 'Payment verification', retentionCategory: 'PAYMENT_PROOF' },
  { domain: 'paymentRecords', classification: 'FINANCIAL', processingPurpose: 'Financial ledger', retentionCategory: 'FINANCIAL_RECORD' },
  { domain: 'invoices', classification: 'FINANCIAL', processingPurpose: 'Billing & invoicing', retentionCategory: 'FINANCIAL_RECORD' },
  { domain: 'commissions', classification: 'FINANCIAL', processingPurpose: 'Platform commission tracking', retentionCategory: 'FINANCIAL_RECORD' },
  { domain: 'settlements', classification: 'FINANCIAL', processingPurpose: 'Artist payout settlement', retentionCategory: 'FINANCIAL_RECORD' },
  { domain: 'chat', classification: 'CUSTOMER_PRIVATE', processingPurpose: 'Customer-artist communication', retentionCategory: 'CHAT' },
  { domain: 'reviews', classification: 'CUSTOMER_PRIVATE', processingPurpose: 'Marketplace trust signals', retentionCategory: 'INDEFINITE' },
  { domain: 'documents', classification: 'SENSITIVE', processingPurpose: 'Contract/legal documents', retentionCategory: 'FINANCIAL_RECORD' },
  { domain: 'aiLogs', classification: 'INTERNAL', processingPurpose: 'AI observability & debugging', retentionCategory: 'AI_LOG' },
  { domain: 'apiTokens', classification: 'AUTHENTICATION', processingPurpose: 'Service authentication', retentionCategory: 'SECRET' },
  { domain: 'phone', classification: 'CUSTOMER_PRIVATE', processingPurpose: 'Booking/communication', retentionCategory: 'CUSTOMER_PROFILE' },
  { domain: 'marketplaceListings', classification: 'PUBLIC', processingPurpose: 'Artist marketplace presence', retentionCategory: 'INDEFINITE' },
];

export function getClassification(domain: string): DataClassificationLevel {
  const entry = DATA_CLASSIFICATION_REGISTRY.find(e => e.domain === domain);
  return entry?.classification || 'INTERNAL';
}

export function getProcessingPurpose(domain: string): string {
  const entry = DATA_CLASSIFICATION_REGISTRY.find(e => e.domain === domain);
  return entry?.processingPurpose || 'Unknown purpose';
}
