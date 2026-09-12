import React from "react";

export default function ServicesPage() {
  const services = [
    {
      title: "Signature Royal Bridal Makeover",
      price: "₹25,000",
      duration: "4.0 Hours",
      category: "BRIDAL EXCLUSIVE",
      description: "Full Royal Rajasthani Bridal Artistry by Prachi with HD Airbrush base, custom lash extensions, and traditional Poshak draping.",
      inclusions: ["HD Airbrushing / Glass Skin Base", "Custom Lash Design & Eye Makeup", "Royal Poshak & Dupatta Setting", "Bridal Hair Styling & Fresh Flowers", "Emergency Touch-Up Kit"],
    },
    {
      title: "Pre-Wedding & Engagement Glam",
      price: "₹15,000",
      duration: "2.5 Hours",
      category: "ENGAGEMENT",
      description: "Romantic dewy glam tailored for Ring Ceremonies, Sangeet nights, and pre-wedding photo shoots.",
      inclusions: ["Long-Wear HD Makeup Base", "Soft Waves / Textured Updo", "Lehenga / Saree Draping", "Lash Application"],
    },
    {
      title: "Party & Festive Makeover",
      price: "₹8,500",
      duration: "1.5 Hours",
      category: "PARTY GLAM",
      description: "Radiant, photo-ready glam for bridesmaids, sisters of the bride, and wedding guests.",
      inclusions: ["Flawless Base & Eye Look", "Curls / Blowdry Hair Styling", "Basic Draping"],
    },
    {
      title: "Destination Bridal Package",
      price: "₹45,000",
      duration: "Full Multi-Event Coverage",
      description: "Comprehensive multi-event coverage for Palace Destination Weddings across Rajasthan.",
      inclusions: ["Main Wedding + Sangeet Makeovers", "Dedicated On-Venue Artist Station", "Senior Assistant Artist Included", "Pre-Wedding Consultation"],
    },
  ];

  return (
    <main style={{ fontFamily: "Montserrat, sans-serif", padding: "60px 20px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ fontFamily: "Playfair Display, serif", color: "#2C1320", fontSize: "36px", margin: "0 0 10px 0" }}>
          Luxury Beauty Services & Packages
        </h1>
        <p style={{ color: "#8E8E93", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
          Transparent pricing and detailed inclusions for your wedding & occasion makeover
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px" }}>
        {services.map((s, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "30px",
              border: "1px solid #E5E0D8",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", backgroundColor: "#E8C5C8", color: "#2C1320", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold" }}>
                {s.category}
              </span>
              <h3 style={{ fontFamily: "Playfair Display, serif", color: "#2C1320", fontSize: "22px", margin: "14px 0 6px 0" }}>
                {s.title}
              </h3>
              <p style={{ color: "#D4AF37", fontSize: "20px", fontWeight: "bold", margin: "0 0 12px 0" }}>
                {s.price} <span style={{ fontSize: "12px", color: "#8E8E93", fontWeight: "normal" }}>({s.duration})</span>
              </p>
              <p style={{ color: "#2C1320", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px" }}>
                {s.description}
              </p>

              <h4 style={{ fontSize: "13px", color: "#2C1320", margin: "0 0 10px 0", fontWeight: "bold" }}>Key Inclusions:</h4>
              <ul style={{ paddingLeft: "20px", margin: "0 0 24px 0", fontSize: "13px", color: "#555" }}>
                {s.inclusions.map((inc, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>{inc}</li>
                ))}
              </ul>
            </div>

            <a
              href="/book"
              style={{
                display: "block",
                textAlign: "center",
                backgroundColor: "#2C1320",
                color: "#D4AF37",
                padding: "12px 20px",
                borderRadius: "20px",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Book {s.title} →
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
