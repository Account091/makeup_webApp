/**
 * V10.6 Unified Business Intelligence & Executive Decision Support Types
 */

export type ValueClassification = 'ACTUAL' | 'PROJECTED' | 'FORECAST' | 'ESTIMATE';

export type MetricDataStatus = 'AVAILABLE' | 'PARTIAL' | 'STALE' | 'INSUFFICIENT_DATA' | 'ERROR';

export type ForecastConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA';

export interface ClassifiedValue {
  value: number;
  classification: ValueClassification;
  currency?: string;
  period: string;
}

export interface MetricDefinition {
  metricId: string;
  name: string;
  description: string;
  sourceCollection: string;
  calculationFormula: string;
  classification: ValueClassification;
  version: number;
  owner: string;
}

export interface ExecutiveScenario {
  scenarioId: string;
  name: string;
  type: 'BASE' | 'OPTIMISTIC' | 'CONSERVATIVE' | 'CUSTOM';
  assumptions: {
    leadVolumeMultiplier: number;
    conversionRateMultiplier: number;
    averageValueMultiplier: number;
  };
  projectedRevenue: ClassifiedValue;
  projectedBookings: ClassifiedValue;
  createdAt: string;
}

export interface ExecutiveAlert {
  alertId: string;
  metricId: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  currentValue: number;
  thresholdValue: number;
  reason: string;
  dedupFingerprint: string;
  createdAt: string;
}

export interface ExecutiveDecisionRecord {
  decisionId: string;
  question: string;
  evidence: string[];
  options: string[];
  selectedOption: string;
  decisionBy: string;
  decisionAt: string;
  followUpMetricId?: string;
}

export interface ImmutableReportSnapshot {
  snapshotId: string;
  period: string;
  reportType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  reportChecksum: string;
  dataVersion: string;
  generatedAt: string;
  generatedBy: string;
}
