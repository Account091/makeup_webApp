'use client';

import React, { useState, useEffect } from 'react';

interface DependencyStatusView {
  serviceId: string;
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';
  verificationLevel: string;
  latencyMs: number;
  message?: string;
}

interface FailedEventView {
  eventId: string;
  eventType: string;
  status: string;
  attemptCount: number;
  lastErrorMessage: string;
}

interface IncidentView {
  incidentId: string;
  severity: string;
  status: string;
  summary: string;
  startedAt: string;
}

interface AlertView {
  alertId: string;
  alertType: string;
  severity: string;
  message: string;
  acknowledged: boolean;
}

const statusIcon = (s: string) =>
  s === 'HEALTHY' ? '✅' : s === 'DEGRADED' ? '🟡' : s === 'UNAVAILABLE' ? '🔴' : '⚪';

const sevColor = (s: string) =>
  s === 'SEV1' ? '#ef4444' : s === 'SEV2' ? '#f59e0b' : s === 'SEV3' ? '#3b82f6' : '#6b7280';

export default function SystemHealthScreen() {
  const [deps, setDeps] = useState<DependencyStatusView[]>([]);
  const [failedEvents, setFailedEvents] = useState<FailedEventView[]>([]);
  const [incidents, setIncidents] = useState<IncidentView[]>([]);
  const [alerts, setAlerts] = useState<AlertView[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [maintenance, setMaintenance] = useState<any>(null);
  const [killSwitches, setKillSwitches] = useState<any>(null);
  const [overallStatus, setOverallStatus] = useState('HEALTHY');

  useEffect(() => {
    // Simulated fetch from /api/health, /api/system/*
    setDeps([
      { serviceId: 'firestore', name: 'Firestore Database', status: 'HEALTHY', verificationLevel: 'SANDBOX_VERIFIED', latencyMs: 14 },
      { serviceId: 'storage', name: 'Firebase Storage', status: 'HEALTHY', verificationLevel: 'SANDBOX_VERIFIED', latencyMs: 22 },
      { serviceId: 'fcm', name: 'Firebase Cloud Messaging', status: 'HEALTHY', verificationLevel: 'INTEGRATION_TESTED', latencyMs: 38 },
      { serviceId: 'sheets', name: 'Google Sheets API', status: 'DEGRADED', verificationLevel: 'INTEGRATION_TESTED', latencyMs: 420, message: 'Intermittent latency spikes' },
      { serviceId: 'whatsapp', name: 'Meta WhatsApp Business', status: 'NOT_CONFIGURED', verificationLevel: 'CODE_CONFIGURED', latencyMs: 0, message: 'Production webhook pending' },
      { serviceId: 'huggingface', name: 'HuggingFace AI Gateway', status: 'HEALTHY', verificationLevel: 'SANDBOX_VERIFIED', latencyMs: 180 },
    ]);
    setOverallStatus('DEGRADED');

    setFailedEvents([
      { eventId: 'failed_event_101', eventType: 'SHEETS_MIRROR_SYNC', status: 'PENDING', attemptCount: 3, lastErrorMessage: 'Google Sheets API timeout' },
      { eventId: 'failed_event_102', eventType: 'WHATSAPP_NOTIFICATION', status: 'MANUAL_REVIEW', attemptCount: 5, lastErrorMessage: 'Meta API throttling limit exceeded' },
    ]);

    setIncidents([
      { incidentId: 'inc_20260913_01', severity: 'SEV3', status: 'INVESTIGATING', summary: 'Sheets mirror API latency spike', startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
    ]);

    setAlerts([
      { alertId: 'alt_901', alertType: 'DEPENDENCY_DEGRADED', severity: 'SEV3', message: 'Google Sheets API >400ms latency', acknowledged: false },
      { alertId: 'alt_902', alertType: 'FAILED_EVENT_QUEUE_BACKLOG', severity: 'SEV3', message: '2 events in DLQ', acknowledged: false },
    ]);

    setMetrics({
      system: { totalRequests: 14820, errorRequests: 37, successRate: 99.75, avgLatencyMs: 92, retryCount: 12, dependencyFailures: 3 },
      ai: { totalCalls: 1240, failures: 8, rateLimited: 3, toolDenied: 1, avgLatencyMs: 210 },
      sheets: { totalSynced: 1248, totalPending: 3, totalFailed: 1 },
    });

    setMaintenance({ maintenanceMode: false, maintenanceMessage: 'Scheduled maintenance.' });
    setKillSwitches({
      bookingEnabled: true, paymentProofEnabled: true, aiEnabled: true,
      whatsappEnabled: true, marketplaceEnabled: true, chatEnabled: true,
    });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif', background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>🛡️ System Health & Observability</h1>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        Overall: <span style={{ color: overallStatus === 'HEALTHY' ? '#22c55e' : overallStatus === 'DEGRADED' ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>{overallStatus}</span>
      </p>

      {/* Dependency Health */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Dependencies</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem 0' }}>Service</th>
              <th>Status</th>
              <th>Verification</th>
              <th>Latency</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {deps.map((d) => (
              <tr key={d.serviceId} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={{ padding: '0.6rem 0', fontWeight: 500 }}>{d.name}</td>
                <td>{statusIcon(d.status)} {d.status}</td>
                <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{d.verificationLevel}</td>
                <td>{d.latencyMs}ms</td>
                <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{d.message || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Metrics Overview */}
      {metrics && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Total Requests', value: metrics.system.totalRequests.toLocaleString() },
            { label: 'Error Rate', value: `${(100 - metrics.system.successRate).toFixed(2)}%` },
            { label: 'Avg Latency', value: `${metrics.system.avgLatencyMs}ms` },
            { label: 'Retries', value: metrics.system.retryCount },
            { label: 'AI Calls', value: metrics.ai.totalCalls },
            { label: 'Sheets Synced', value: metrics.sheets.totalSynced },
          ].map((m) => (
            <div key={m.label} style={{ background: '#111827', borderRadius: 10, padding: '1rem', border: '1px solid #1e293b' }}>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>{m.label}</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 700 }}>{m.value}</p>
            </div>
          ))}
        </section>
      )}

      {/* Active Alerts */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Active Alerts ({alerts.length})</h2>
        {alerts.map((a) => (
          <div key={a.alertId} style={{ padding: '0.75rem', borderRadius: 8, background: '#1e293b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: sevColor(a.severity), fontWeight: 700, fontSize: '0.8rem' }}>{a.severity}</span>
            <span style={{ flex: 1 }}>{a.message}</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{a.alertType}</span>
          </div>
        ))}
      </section>

      {/* Open Incidents */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Open Incidents ({incidents.length})</h2>
        {incidents.map((inc) => (
          <div key={inc.incidentId} style={{ padding: '0.75rem', borderRadius: 8, background: '#1e293b', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500 }}>{inc.summary}</span>
              <span style={{ color: sevColor(inc.severity), fontWeight: 700, fontSize: '0.8rem' }}>{inc.severity}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>Status: {inc.status} • Started: {new Date(inc.startedAt).toLocaleString()}</p>
          </div>
        ))}
      </section>

      {/* Failed Events (DLQ) */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Failed Events / DLQ ({failedEvents.length})</h2>
        {failedEvents.map((fe) => (
          <div key={fe.eventId} style={{ padding: '0.75rem', borderRadius: 8, background: '#1e293b', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500 }}>{fe.eventType}</span>
              <span style={{ fontSize: '0.8rem', color: fe.status === 'MANUAL_REVIEW' ? '#f59e0b' : '#3b82f6' }}>{fe.status}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>Attempts: {fe.attemptCount} • {fe.lastErrorMessage}</p>
          </div>
        ))}
      </section>

      {/* Feature Kill Switches */}
      {killSwitches && (
        <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #1e293b' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Feature Kill Switches</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {Object.entries(killSwitches).filter(([k]) => k !== 'updatedAt').map(([key, val]) => (
              <div key={key} style={{ padding: '0.6rem', borderRadius: 8, background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem' }}>{key.replace('Enabled', '')}</span>
                <span style={{ color: val ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{val ? 'ON' : 'OFF'}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Maintenance Mode */}
      {maintenance && (
        <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', border: '1px solid #1e293b' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Maintenance Mode</h2>
          <p>Status: <span style={{ color: maintenance.maintenanceMode ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{maintenance.maintenanceMode ? 'ACTIVE' : 'INACTIVE'}</span></p>
        </section>
      )}
    </div>
  );
}
