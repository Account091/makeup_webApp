import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Destination Bridal Makeup Artist in Udaipur | Makeovers by Prachi Lake City Hub',
  description: 'Book luxury destination wedding bridal makeup at Makeovers by Prachi Lake City Hub in Udaipur. Specialized for Lake Palace, Jagmandir, and Oberoi Udaivilas weddings.',
  keywords: ['Bridal Makeup Udaipur', 'Destination Wedding Makeup Udaipur', 'Lake Palace Makeup Artist', 'Prachi Gurjar Udaipur'],
};

export default function UdaipurLocationPage() {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: 'Makeovers by Prachi — Udaipur Lake City Hub',
    image: 'https://makeoversbyprachi.com/images/udaipur-studio.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Fateh Sagar Lake Road',
      addressLocality: 'Udaipur',
      addressRegion: 'Rajasthan',
      postalCode: '313001',
      addressCountry: 'IN',
    },
    url: 'https://makeoversbyprachi.com/udaipur',
    telephone: '+919829000000',
    priceRange: '₹22,000 - ₹75,000',
  };

  return (
    <main className="min-h-screen bg-[#F9F5F0] text-[#2C1320] p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-[#2C1320] mb-4">
          Destination Bridal Makeup Hub in Udaipur
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Makeovers by Prachi Lake City Hub in Udaipur. The ultimate luxury destination bridal team for royal weddings along Fateh Sagar Lake and Lake Pichola.
        </p>
        <div className="bg-white p-6 rounded-xl shadow-md border border-[#D4AF37]">
          <h2 className="text-xl font-semibold mb-2 text-[#D4AF37]">Udaipur Studio Location</h2>
          <p className="text-sm text-gray-600">Fateh Sagar Lake Road, Udaipur, Rajasthan 313001</p>
          <p className="text-sm text-gray-600 font-bold mt-2">Starting Base Price: ₹22,000</p>
          <a
            href="/book"
            className="inline-block mt-4 px-6 py-3 bg-[#2C1320] text-[#D4AF37] font-semibold rounded-lg hover:bg-[#3d1c2e] transition-all"
          >
            Book Udaipur Appointment
          </a>
        </div>
      </div>
    </main>
  );
}
