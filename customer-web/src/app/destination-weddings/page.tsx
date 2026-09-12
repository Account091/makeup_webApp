import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Destination Wedding Makeup Packages & Travel Team | Makeovers by Prachi',
  description: 'Book luxury outstation destination wedding makeup by Prachi Gurjar. Dedicated hair specialists, draping team, flight logistics, and resort stay travel quotes across India.',
  keywords: ['Destination Wedding Makeup India', 'Outstation Makeup Artist', 'Royal Palace Wedding Makeup', 'Prachi Gurjar Destination Weddings'],
};

export default function DestinationWeddingsPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Destination Wedding Makeup & Travel Team Service',
    provider: {
      '@type': 'BeautySalon',
      name: 'Makeovers by Prachi',
      url: 'https://makeoversbyprachi.com',
    },
    areaServed: 'India & International',
    url: 'https://makeoversbyprachi.com/destination-weddings',
  };

  return (
    <main className="min-h-screen bg-[#F9F5F0] text-[#2C1320] p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-[#2C1320] mb-4">
          Destination Wedding Makeup & Travel Team
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Makeovers by Prachi provides full outstation bridal teams across India and abroad. Complete with senior makeup artists, hair stylists, saree/poshak draping experts, outstation travel buffers, and resort accommodation coordination.
        </p>
        <div className="bg-white p-6 rounded-xl shadow-md border border-[#D4AF37]">
          <h2 className="text-xl font-semibold mb-2 text-[#D4AF37]">Outstation & Destination Travel Engine</h2>
          <p className="text-sm text-gray-600">Includes 1-day travel buffer, flight/train booking, resort suite stay allowance, and multi-function schedule coordination.</p>
          <a
            href="/book"
            className="inline-block mt-4 px-6 py-3 bg-[#2C1320] text-[#D4AF37] font-semibold rounded-lg hover:bg-[#3d1c2e] transition-all"
          >
            Request Destination Quote
          </a>
        </div>
      </div>
    </main>
  );
}
