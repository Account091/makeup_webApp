'use client';

import React from 'react';

export default function PrivacyAdminScreen() {
  const healthData = {
    openDataRequests: 2, pendingDeletions: 1, expiredRetentionJobs: 0,
    consentIssues: 0, publicMediaViolations: 0, privacyIncidents: 0,
  };

  const requests = [
    { id: 'prv_req_01', customer: 'Priya Sharma', type: 'EXPORT', status: 'PROCESSING', date: '13 Sep 11:20' },
    { id: 'prv_req_02', customer: 'Anita Verma', type: 'DELETE', status: 'VERIFYING', date: '13 Sep 10:45' },
  ];

  const retentionPolicies = [
    { category: 'TEMP_UPLOAD', days: 7, action: 'DELETE' },
    { category: 'PAYMENT_PROOF', days: 365, action: 'ARCHIVE' },
    { category: 'CHAT', days: 180, action: 'ANONYMIZE' },
    { category: 'AI_LOG', days: 30, action: 'DELETE' },
    { category: 'FINANCIAL_RECORD', days: 2555, action: 'ARCHIVE' },
  ];

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif', background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>🛡️ Privacy Admin Console</h1>

      {/* Health */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Privacy Health</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(healthData).map(([k, v]) => (
            <div key={k} style={{ padding: '0.8rem', background: '#1e293b', borderRadius: 8 }}>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{k.replace(/([A-Z])/g, ' $1')}</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: v === 0 ? '#22c55e' : '#f59e0b' }}>{v}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '0.75rem', color: '#22c55e', fontWeight: 600 }}>Status: ✅ HEALTHY</p>
      </section>

      {/* Open Requests */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Open Data Requests</h2>
        {requests.map(r => (
          <div key={r.id} style={{ padding: '0.75rem', background: '#1e293b', borderRadius: 8, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontWeight: 500 }}>{r.customer}</span>
              <span style={{ marginLeft: 8, fontSize: '0.8rem', color: '#94a3b8' }}>{r.type}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: r.status === 'PROCESSING' ? '#3b82f6' : '#f59e0b', fontWeight: 600 }}>{r.status}</span>
              <span style={{ marginLeft: 8, fontSize: '0.75rem', color: '#94a3b8' }}>{r.date}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Retention Policies */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Retention Policies</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'left' }}><th style={{ padding: '0.5rem 0' }}>Category</th><th>Retention</th><th>Action</th></tr></thead>
          <tbody>
            {retentionPolicies.map(p => (
              <tr key={p.category} style={{ borderTop: '1px solid #1e293b' }}>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>{p.category}</td>
                <td>{p.days} days</td>
                <td style={{ color: p.action === 'DELETE' ? '#ef4444' : p.action === 'ANONYMIZE' ? '#f59e0b' : '#3b82f6' }}>{p.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
