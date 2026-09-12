export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "name": "Makeovers by Prachi",
  "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
  "telephone": "+919829012345",
  "email": "prachi@makeoversbyprachi.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Jodhpur",
    "addressRegion": "Rajasthan",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "26.2389",
    "longitude": "73.0243"
  },
  "url": "https://makeoversbyprachi.com",
  "priceRange": "₹3,500 - ₹25,000",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "09:00",
    "closes": "20:00"
  }
};

export const defaultSeoMetadata = {
  title: "Makeovers by Prachi | Luxury Bridal Makeup Artist Jodhpur",
  description: "Premier luxury bridal makeup artist in Jodhpur, Rajasthan. Specializing in traditional Rajasthani Poshak styling, royal jewelry coordination, HD/Airbrush bridal glam, and destination weddings.",
  keywords: "Bridal makeup artist in Jodhpur, Rajasthani bridal makeup, makeup artist Jodhpur, Poshak bridal makeup, engagement makeup Jodhpur, destination wedding makeup Rajasthan",
  openGraph: {
    title: "Makeovers by Prachi | Luxury Bridal & Occasion Artistry",
    description: "Book your wedding date with Jodhpur's leading luxury bridal makeup artist.",
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200"],
    siteName: "Makeovers by Prachi",
  }
};
