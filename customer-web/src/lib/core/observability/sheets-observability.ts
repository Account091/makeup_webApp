/**
 * Google Sheets Observability — V9.0
 */

import { SheetsSyncMetrics, SheetsSyncStatus } from '../system-types';

const sheetsMetricsState: SheetsSyncMetrics = {
  totalSynced: 1248,
  totalPending: 3,
  totalFailed: 1,
  lastSyncedAt: new Date().toISOString(),
};

export function recordSheetsSyncEvent(status: SheetsSyncStatus): void {
  if (status === 'SYNCED') {
    sheetsMetricsState.totalSynced += 1;
    if (sheetsMetricsState.totalPending > 0) sheetsMetricsState.totalPending -= 1;
    sheetsMetricsState.lastSyncedAt = new Date().toISOString();
  } else if (status === 'PENDING' || status === 'RETRYING') {
    sheetsMetricsState.totalPending += 1;
  } else if (status === 'FAILED') {
    sheetsMetricsState.totalFailed += 1;
  }
}

export function getSheetsObservabilityMetrics(): SheetsSyncMetrics {
  return { ...sheetsMetricsState };
}
