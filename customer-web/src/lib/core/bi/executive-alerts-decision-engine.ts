/**
 * V10.6 Executive Alerts, AI Decision Support & Report Snapshot Engine
 */

import {
  ExecutiveAlert,
  ExecutiveDecisionRecord,
  ImmutableReportSnapshot,
} from './bi-types';
import { createHash } from 'crypto';

const alertsStore: ExecutiveAlert[] = [];
const processedAlertFingerprints = new Set<string>();
const decisionRecordsStore: ExecutiveDecisionRecord[] = [];
const reportSnapshotsStore: ImmutableReportSnapshot[] = [];

export function evaluateExecutiveAlert(params: {
  metricId: string;
  currentValue: number;
  thresholdValue: number;
  comparisonPeriod: string;
  severity: ExecutiveAlert['severity'];
}): ExecutiveAlert | null {
  const isBreached = params.currentValue < params.thresholdValue;
  if (!isBreached) return null;

  // Deduplication Fingerprint
  const dedupFingerprint = `alert_${params.metricId}_${params.comparisonPeriod}_${params.severity}`;
  if (processedAlertFingerprints.has(dedupFingerprint)) {
    return null; // Suppress duplicate alert
  }
  processedAlertFingerprints.add(dedupFingerprint);

  const alert: ExecutiveAlert = {
    alertId: `execalert_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    metricId: params.metricId,
    severity: params.severity,
    currentValue: params.currentValue,
    thresholdValue: params.thresholdValue,
    reason: `Alert: Metric '${params.metricId}' (${params.currentValue}) breached threshold (${params.thresholdValue}) for period ${params.comparisonPeriod}.`,
    dedupFingerprint,
    createdAt: new Date().toISOString(),
  };

  alertsStore.push(alert);
  return alert;
}

export function buildEvidenceBasedAIAnswer(params: {
  question: string;
  observedFact: string;
  inferredCause?: string;
  possibleExplanation?: string;
}): { answer: string; evidenceType: 'OBSERVED' | 'INFERRED' | 'POSSIBLE' } {
  let answer = `Observed Fact: ${params.observedFact}.`;
  let evidenceType: 'OBSERVED' | 'INFERRED' | 'POSSIBLE' = 'OBSERVED';

  if (params.inferredCause) {
    answer += ` Inferred Cause: ${params.inferredCause}.`;
    evidenceType = 'INFERRED';
  }
  if (params.possibleExplanation) {
    answer += ` Possible Explanation: ${params.possibleExplanation}.`;
    evidenceType = 'POSSIBLE';
  }

  return { answer, evidenceType };
}

export function recordExecutiveDecision(params: Omit<ExecutiveDecisionRecord, 'decisionId' | 'decisionAt'>): ExecutiveDecisionRecord {
  const record: ExecutiveDecisionRecord = {
    ...params,
    decisionId: `dec_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    decisionAt: new Date().toISOString(),
  };

  decisionRecordsStore.push(record);
  return record;
}

export function generateImmutableReportSnapshot(params: {
  period: string;
  reportType: ImmutableReportSnapshot['reportType'];
  reportContentString: string;
  generatedBy: string;
}): ImmutableReportSnapshot {
  const reportChecksum = createHash('sha256').update(params.reportContentString).digest('hex');

  const snapshot: ImmutableReportSnapshot = {
    snapshotId: `snap_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    period: params.period,
    reportType: params.reportType,
    reportChecksum,
    dataVersion: 'V10.6-BI-1',
    generatedAt: new Date().toISOString(),
    generatedBy: params.generatedBy,
  };

  reportSnapshotsStore.push(snapshot);
  return snapshot;
}

export function getExecutiveAlerts(): ExecutiveAlert[] {
  return [...alertsStore];
}

export function getExecutiveDecisionRecords(): ExecutiveDecisionRecord[] {
  return [...decisionRecordsStore];
}
