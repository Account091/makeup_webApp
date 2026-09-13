/**
 * Operational Incident & Alert Manager — V9.0
 */

import { IncidentRecord, IncidentSeverity, IncidentStatus, SystemAlertRecord } from '../system-types';

const inMemoryIncidents: IncidentRecord[] = [
  {
    incidentId: 'inc_20260913_01',
    severity: 'SEV3',
    status: 'INVESTIGATING',
    summary: 'Google Sheets mirror API latency spike during peak booking sync',
    affectedServices: ['sheets'],
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    detectedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    ownerUid: 'admin_user_01',
    requestIds: ['req_20260913_sheets01'],
  },
];

const inMemorySystemAlerts: SystemAlertRecord[] = [
  {
    alertId: 'alt_901',
    alertType: 'DEPENDENCY_DEGRADED',
    severity: 'SEV3',
    message: 'Google Sheets API responding with latency >400ms',
    triggeredAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    acknowledged: false,
    details: { serviceId: 'sheets', avgLatencyMs: 420 },
  },
  {
    alertId: 'alt_902',
    alertType: 'FAILED_EVENT_QUEUE_BACKLOG',
    severity: 'SEV3',
    message: '2 events currently in DLQ pending retry',
    triggeredAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    acknowledged: false,
    details: { pendingCount: 2 },
  },
];

export function createIncident(params: {
  severity: IncidentSeverity;
  summary: string;
  affectedServices: string[];
  ownerUid?: string;
  requestIds?: string[];
}): IncidentRecord {
  const incident: IncidentRecord = {
    incidentId: `inc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    severity: params.severity,
    status: 'OPEN',
    summary: params.summary,
    affectedServices: params.affectedServices,
    startedAt: new Date().toISOString(),
    detectedAt: new Date().toISOString(),
    ownerUid: params.ownerUid,
    requestIds: params.requestIds || [],
  };

  inMemoryIncidents.push(incident);
  return incident;
}

export function updateIncidentStatus(
  incidentId: string,
  newStatus: IncidentStatus
): IncidentRecord | null {
  const incident = inMemoryIncidents.find((i) => i.incidentId === incidentId);
  if (incident) {
    incident.status = newStatus;
    if (newStatus === 'RESOLVED' || newStatus === 'CLOSED') {
      incident.resolvedAt = new Date().toISOString();
    }
    return incident;
  }
  return null;
}

export function getActiveIncidents(): IncidentRecord[] {
  return inMemoryIncidents.filter((i) => i.status !== 'CLOSED');
}

export function getSystemAlerts(): SystemAlertRecord[] {
  return [...inMemorySystemAlerts];
}

export function acknowledgeAlert(alertId: string): boolean {
  const alert = inMemorySystemAlerts.find((a) => a.alertId === alertId);
  if (alert) {
    alert.acknowledged = true;
    return true;
  }
  return false;
}
