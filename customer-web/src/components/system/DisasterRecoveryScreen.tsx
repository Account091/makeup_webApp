'use client';

import React from 'react';

export default function DisasterRecoveryScreen() {
  const lastBackup = { id: 'backup_20260913_a1b2', status: 'VERIFIED', completedAt: '13 Sep 01:00', verifiedAt: '13 Sep 01:12', documents: 14320, media: 834, freshness: 'HEALTHY' };
  const financialRecon = { paymentTotal: '₹5,40,000', backupTotal: '₹5,40,000', difference: '₹0', commissionTotal: '₹54,000', backupCommission: '₹54,000' };
  const drillResults = [
    { test: 'Firestore restore', result: '✅ PASS' },
    { test: 'Storage restore', result: '✅ PASS' },
    { test: 'Financial reconcile', result: '✅ PASS' },
    { test: 'Tenant isolation', result: '✅ PASS' },
    { test: 'Configuration restore', result: '✅ PASS' },
  ];
  const backupAge = '10h';

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif', background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>🛡️ Disaster Recovery</h1>

      {/* Last Backup */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Latest Backup</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Last Backup', value: lastBackup.completedAt, color: '#22c55e' },
            { label: 'Last Verified', value: lastBackup.verifiedAt, color: '#22c55e' },
            { label: 'Backup Age', value: backupAge, color: '#22c55e' },
            { label: 'Status', value: lastBackup.status, color: '#22c55e' },
            { label: 'Documents', value: lastBackup.documents.toLocaleString(), color: '#e2e8f0' },
            { label: 'Media Files', value: lastBackup.media.toLocaleString(), color: '#e2e8f0' },
          ].map(m => (
            <div key={m.label} style={{ background: '#1e293b', borderRadius: 8, padding: '0.8rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.label}</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Financial Reconciliation */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Financial Reconciliation</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'left' }}><th style={{ padding: '0.5rem 0' }}>Ledger</th><th>Production</th><th>Backup</th><th>Diff</th></tr></thead>
          <tbody>
            <tr style={{ borderTop: '1px solid #1e293b' }}><td style={{ padding: '0.5rem 0' }}>Payments</td><td>{financialRecon.paymentTotal}</td><td>{financialRecon.backupTotal}</td><td style={{ color: '#22c55e', fontWeight: 700 }}>{financialRecon.difference}</td></tr>
            <tr style={{ borderTop: '1px solid #1e293b' }}><td style={{ padding: '0.5rem 0' }}>Commissions</td><td>{financialRecon.commissionTotal}</td><td>{financialRecon.backupCommission}</td><td style={{ color: '#22c55e', fontWeight: 700 }}>₹0</td></tr>
          </tbody>
        </table>
      </section>

      {/* Recovery Drill Results */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Recovery Tests</h2>
        {drillResults.map(d => (
          <div key={d.test} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #1e293b' }}>
            <span>{d.test}</span><span>{d.result}</span>
          </div>
        ))}
      </section>

      {/* Actions */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Actions</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['Create Backup', 'Test Restore', 'View History'].map(a => (
            <button key={a} style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', cursor: 'pointer', fontWeight: 500 }}>{a}</button>
          ))}
        </div>
      </section>
    </div>
  );
}
