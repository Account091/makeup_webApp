import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Bridal Makeup Artist in Jaipur | Makeovers by Prachi Pink City Hub',
  description: 'Book luxury bridal makeup services at Makeovers by Prachi Pink City Hub in Jaipur, Rajasthan. Heritage bridal packages, airbrush makeup, and destination weddings.',
  keywords: ['Bridal Makeup Jaipur', 'Best Makeup Artist Jaipur', 'Pink City Bridal Makeup', 'Prachi Gurjar Jaipur'],
};

export default function JaipurLocationPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: 'Makeovers by Prachi — Jaipur Studio Hub',
    image: 'https://makeoversbyprachi.com/images/jaipur-studio.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'C-Scheme',
      addressLocality: 'Jaipur',
      addressRegion: 'Rajasthan',
      postalCode: '302001',
      addressCountry: 'IN',
    },
    url: 'https://makeoversbyprachi.com/jaipur',
    telephone: '+919829000000',
    priceRange: '₹20,000 - ₹60,000',
  };

  return (
    <main className="min-h-screen bg-[#F9F5F0] text-[#2C1320] p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-[#2C1320] mb-4">
          Luxury Bridal Makeup Hub in Jaipur
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Makeovers by Prachi Pink City Hub in C-Scheme, Jaipur. Deluxe wedding packages, heritage palace bridal looks, and outstation beauty teams across Jaipur and Shekhawati.
        </p>
        <div className="bg-white p-6 rounded-xl shadow-md border border-[#D4AF37]">
          <h2 className="text-xl font-semibold mb-2 text-[#D4AF37]">Jaipur Studio Location</h2>
          <p className="text-sm text-gray-600">C-Scheme, Jaipur, Rajasthan 302001</p>
          <p className="text-sm text-gray-600 font-bold mt-2">Starting Base Price: ₹20,000</p>
          <a
            href="/book"
            className="inline-block mt-4 px-6 py-3 bg-[#2C1320] text-[#D4AF37] font-semibold rounded-lg hover:bg-[#3d1c2e] transition-all"
          >
            Book Jaipur Appointment
          </a>
        </div>
      </div>
    </main>
  );
}
