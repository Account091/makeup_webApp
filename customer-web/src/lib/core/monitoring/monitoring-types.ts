/**
 * Production Monitoring Domain Types — V9.3
 */

export type MonitoringCheckStatus = 'PASSING' | 'DEGRADED' | 'FAILING' | 'UNKNOWN';

export interface HealthCheckResult {
  checkId: string;
  name: string;
  status: MonitoringCheckStatus;
  latencyMs: number;
  message?: string;
  lastCheckedAt: string;
}

export interface UptimeRecord {
  serviceId: string;
  date: string;
  totalChecks: number;
  passedChecks: number;
  uptimePercent: number;
}

export interface PerformanceBudget {
  metricName: string;
  targetMs: number;
  currentMs: number;
  withinBudget: boolean;
}

export type AlertChannel = 'CONSOLE' | 'AUDIT_LOG' | 'WEBHOOK';

export interface MonitoringAlert {
  alertId: string;
  checkId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  channel: AlertChannel;
  triggeredAt: string;
  acknowledged: boolean;
}

export interface SLODefinition {
  sloId: string;
  name: string;
  targetPercent: number;
  currentPercent: number;
  status: 'MET' | 'AT_RISK' | 'BREACHED';
  window: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}
