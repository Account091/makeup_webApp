import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Luxury Bridal Makeup Artist in Jodhpur | Makeovers by Prachi',
  description: 'Book premiere luxury bridal makeup, royal outstation weddings, and party makeup services at Makeovers by Prachi flagship studio in Jodhpur, Rajasthan.',
  keywords: ['Bridal Makeup Jodhpur', 'Best Makeup Artist Jodhpur', 'Royal Poshak Makeup', 'Prachi Gurjar Jodhpur'],
};

export default function JodhpurLocationPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: 'Makeovers by Prachi — Flagship Jodhpur Studio',
    image: 'https://makeoversbyprachi.com/images/jodhpur-studio.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shastri Nagar',
      addressLocality: 'Jodhpur',
      addressRegion: 'Rajasthan',
      postalCode: '342003',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.2389,
      longitude: 73.0243,
    },
    url: 'https://makeoversbyprachi.com/jodhpur',
    telephone: '+919829000000',
    priceRange: '₹15,000 - ₹50,000',
  };

  return (
    <main className="min-h-screen bg-[#F9F5F0] text-[#2C1320] p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-[#2C1320] mb-4">
          Luxury Bridal Makeup Artist in Jodhpur
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Welcome to the main flagship studio of Makeovers by Prachi in Jodhpur, Rajasthan. Specializing in traditional Rajputi Poshak styling, HD bridal glow, and outstation royal weddings.
        </p>
        <div className="bg-white p-6 rounded-xl shadow-md border border-[#D4AF37]">
          <h2 className="text-xl font-semibold mb-2 text-[#D4AF37]">Jodhpur Studio Location</h2>
          <p className="text-sm text-gray-600">Shastri Nagar, Jodhpur, Rajasthan 342003</p>
          <p className="text-sm text-gray-600 font-bold mt-2">Starting Base Price: ₹18,000</p>
          <a
            href="/book"
            className="inline-block mt-4 px-6 py-3 bg-[#2C1320] text-[#D4AF37] font-semibold rounded-lg hover:bg-[#3d1c2e] transition-all"
          >
            Book Jodhpur Appointment
          </a>
        </div>
      </div>
    </main>
  );
}
