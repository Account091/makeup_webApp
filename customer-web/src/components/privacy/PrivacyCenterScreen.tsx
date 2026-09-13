'use client';

import React, { useState } from 'react';

const CONSENT_TYPES = [
  { key: 'SERVICE_COMMUNICATION', label: 'Service Communication', desc: 'Booking updates and reminders' },
  { key: 'MARKETING_WHATSAPP', label: 'WhatsApp Marketing', desc: 'Promotional messages via WhatsApp' },
  { key: 'MARKETING_EMAIL', label: 'Email Marketing', desc: 'Newsletter and offers' },
  { key: 'PORTFOLIO', label: 'Portfolio / Website', desc: 'Use photos on our website' },
  { key: 'INSTAGRAM', label: 'Instagram', desc: 'Use photos on Instagram' },
  { key: 'ADVERTISEMENT', label: 'Advertisements', desc: 'Use photos in advertising' },
  { key: 'BEFORE_AFTER', label: 'Before/After Gallery', desc: 'Show transformation photos' },
  { key: 'DATA_PROCESSING', label: 'Data Processing', desc: 'Process personal data for services' },
  { key: 'AI_ASSISTANCE', label: 'AI Assistance', desc: 'AI-powered recommendations' },
];

const DATA_CATEGORIES = ['Profile', 'Bookings', 'Payments', 'Consultations', 'Reviews', 'Chat', 'Uploaded Images', 'Documents'];

export default function PrivacyCenterScreen() {
  const [consents, setConsents] = useState<Record<string, boolean>>({
    SERVICE_COMMUNICATION: true, MARKETING_WHATSAPP: false, MARKETING_EMAIL: false,
    PORTFOLIO: true, INSTAGRAM: false, ADVERTISEMENT: false, BEFORE_AFTER: true,
    DATA_PROCESSING: true, AI_ASSISTANCE: true,
  });
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const toggleConsent = (key: string) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, system-ui, sans-serif', background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>🔒 Privacy Center</h1>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Manage your data, consent preferences, and privacy requests.</p>

      {/* My Data */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>My Data</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.6rem' }}>
          {DATA_CATEGORIES.map(cat => (
            <div key={cat} style={{ padding: '0.6rem 0.8rem', background: '#1e293b', borderRadius: 8, fontSize: '0.9rem' }}>📄 {cat}</div>
          ))}
        </div>
      </section>

      {/* Consent Management */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Manage Consent</h2>
        {CONSENT_TYPES.map(ct => (
          <div key={ct.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #1e293b' }}>
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{ct.label}</p>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ct.desc}</p>
            </div>
            <button
              onClick={() => toggleConsent(ct.key)}
              style={{ padding: '4px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                background: consents[ct.key] ? '#22c55e' : '#374151', color: consents[ct.key] ? '#000' : '#9ca3af' }}
            >
              {consents[ct.key] ? 'GRANTED' : 'REVOKED'}
            </button>
          </div>
        ))}
      </section>

      {/* Actions */}
      <section style={{ background: '#111827', borderRadius: 12, padding: '1.25rem', border: '1px solid #1e293b' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Privacy Actions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {['Request My Data', 'Download My Data', 'Request Correction', 'Request Deletion'].map(action => (
            <button key={action} onClick={() => setRequestSubmitted(true)}
              style={{ padding: '0.6rem 1.2rem', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}>
              {action}
            </button>
          ))}
        </div>
        {requestSubmitted && (
          <p style={{ marginTop: '0.75rem', color: '#22c55e', fontSize: '0.85rem' }}>✅ Request submitted successfully. You will be notified when it is ready.</p>
        )}
      </section>
    </div>
  );
}
