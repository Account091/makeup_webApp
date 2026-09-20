/**
 * V10.6 Unified Metric Registry & Classification Engine
 * 
 * CORE RULE: BI reads authoritative data and produces metrics. It NEVER becomes
 * a second source of truth and NEVER mutates business/financial ledgers directly.
 */

import { MetricDefinition, ClassifiedValue, ValueClassification } from './bi-types';

const metricRegistryStore = new Map<string, MetricDefinition>();

// Seed core KPI definitions
const CORE_METRICS: MetricDefinition[] = [
  {
    metricId: 'completedRevenue',
    name: 'Completed Revenue',
    description: 'Actual revenue from completed bookings and verified payment ledgers',
    sourceCollection: 'paymentLedgers',
    calculationFormula: 'SUM(paymentLedger.amount WHERE status == "VERIFIED" AND service == "COMPLETED")',
    classification: 'ACTUAL',
    version: 1,
    owner: 'Accountant',
  },
  {
    metricId: 'confirmedBookingValue',
    name: 'Confirmed Future Booking Value',
    description: 'Projected revenue from confirmed upcoming bookings',
    sourceCollection: 'bookings',
    calculationFormula: 'SUM(booking.totalAmount WHERE status == "CONFIRMED")',
    classification: 'PROJECTED',
    version: 1,
    owner: 'Operations Admin',
  },
  {
    metricId: 'expectedMonthlyDemand',
    name: 'Expected Next-Month Demand',
    description: 'Forecasted revenue based on seasonal demand trends & lead volume',
    sourceCollection: 'growthSnapshots',
    calculationFormula: 'FORECAST(leadVolume * conversionRate * avgBookingValue)',
    classification: 'FORECAST',
    version: 1,
    owner: 'Growth Lead',
  },
];

for (const m of CORE_METRICS) {
  metricRegistryStore.set(m.metricId, m);
}

export function registerMetricDefinition(def: MetricDefinition): MetricDefinition {
  metricRegistryStore.set(def.metricId, def);
  return def;
}

export function getMetricDefinition(metricId: string): MetricDefinition | undefined {
  return metricRegistryStore.get(metricId);
}

export function createClassifiedValue(params: {
  value: number;
  classification: ValueClassification;
  period: string;
  currency?: string;
}): ClassifiedValue {
  return {
    value: params.value,
    classification: params.classification,
    currency: params.currency || 'INR',
    period: params.period,
  };
}

export function reconcileMetricVsLedger(params: {
  metricValue: number;
  ledgerTotal: number;
}): { reconciled: boolean; variance: number; message: string } {
  const variance = params.metricValue - params.ledgerTotal;
  const reconciled = variance === 0;

  return {
    reconciled,
    variance,
    message: reconciled
      ? 'Metric perfectly reconciled with authoritative ledger total.'
      : `Reconciliation Variance Alert: Metric differs from ledger total by ₹${variance}.`,
  };
}
