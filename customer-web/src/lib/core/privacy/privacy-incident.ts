/**
 * Privacy Incident Manager — V9.1
 */

import { PrivacyIncident, PrivacyIncidentType, PrivacyHealthStatus } from './privacy-types';

const incidentStore: PrivacyIncident[] = [];

export function createPrivacyIncident(params: {
  type: PrivacyIncidentType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  affectedUserIds?: string[];
  requestIds?: string[];
}): PrivacyIncident {
  const incident: PrivacyIncident = {
    incidentId: `pinc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    type: params.type,
    severity: params.severity,
    status: 'OPEN',
    summary: params.summary,
    affectedUserIds: params.affectedUserIds || [],
    requestIds: params.requestIds || [],
    detectedAt: new Date().toISOString(),
  };
  incidentStore.push(incident);
  return incident;
}

export function updatePrivacyIncidentStatus(incidentId: string, status: PrivacyIncident['status'], resolution?: string): PrivacyIncident | null {
  const inc = incidentStore.find(i => i.incidentId === incidentId);
  if (inc) {
    inc.status = status;
    if (status === 'RESOLVED' || status === 'CLOSED') inc.resolvedAt = new Date().toISOString();
    if (resolution) inc.resolution = resolution;
    return inc;
  }
  return null;
}

export function getActivePrivacyIncidents(): PrivacyIncident[] {
  return incidentStore.filter(i => i.status !== 'CLOSED');
}

export function getPrivacyHealthStatus(): PrivacyHealthStatus {
  const openIncidents = incidentStore.filter(i => i.status !== 'CLOSED' && i.status !== 'RESOLVED').length;
  return {
    openDataRequests: 2,
    pendingDeletions: 1,
    expiredRetentionJobs: 0,
    consentIssues: 0,
    publicMediaViolations: 0,
    privacyIncidents: openIncidents,
    overallStatus: openIncidents > 0 ? 'WARNING' : 'HEALTHY',
  };
}
