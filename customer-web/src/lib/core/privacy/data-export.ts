/**
 * Data Export Generator — V9.1
 */

import { DataExportManifest } from './privacy-types';

export function generateCustomerDataExport(customerId: string): DataExportManifest {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 min expiry

  const sections = ['profile', 'bookings', 'payments', 'reviews', 'consents', 'chat_metadata', 'documents'];
  const recordCount = 42 + Math.floor(Math.random() * 20); // Simulated

  return {
    exportId: `export_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    customerId,
    sections,
    generatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    recordCount,
    secureUrl: `https://storage.example.com/exports/${customerId}/customer-data-export.zip?token=short_lived_${Date.now()}&expires=${expiresAt.getTime()}`,
  };
}

export function isExportUrlValid(manifest: DataExportManifest): boolean {
  return new Date(manifest.expiresAt).getTime() > Date.now();
}
