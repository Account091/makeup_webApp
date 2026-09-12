"use client";

import React, { useState } from "react";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("ALL");

  const galleryItems = [
    {
      id: 1,
      title: "Royal Rajasthani Bridal Poshak",
      category: "BRIDAL",
      location: "Gorbandh Palace, Jodhpur",
      img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
      desc: "16-Hour Airbrush HD base with traditional Borla & Dupatta setting.",
    },
    {
      id: 2,
      title: "Soft Dewy Engagement Glam",
      category: "ENGAGEMENT",
      location: "Rambagh Palace, Jaipur",
      img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
      desc: "Glowing glass skin finish paired with textured soft glam waves.",
    },
    {
      id: 3,
      title: "Palace Destination Wedding",
      category: "DESTINATION",
      location: "City Palace, Udaipur",
      img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      desc: "Multi-event royal bridal look with customized touch-up station.",
    },
    {
      id: 4,
      title: "Party & Festive Makeover",
      category: "PARTY",
      location: "Indana Palace, Jodhpur",
      img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800",
      desc: "Photo-ready radiant look for bridesmaids & family members.",
    },
    {
      id: 5,
      title: "Traditional Borla & Jewelry Setting",
      category: "BRIDAL",
      location: "Umaid Bhawan, Jodhpur",
      img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200",
      desc: "Authentic Rajasthani bridal jewelry arrangement and Poshak draping.",
    },
    {
      id: 6,
      title: "Sangeet Night Smokey Eye Glam",
      category: "ENGAGEMENT",
      location: "Fairmont, Jaipur",
      img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200",
      desc: "Bold glam eye design with custom lash extensions.",
    },
  ];

  const categories = ["ALL", "BRIDAL", "ENGAGEMENT", "PARTY", "DESTINATION"];

  const filteredItems = activeCategory === "ALL" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--champagne)", padding: "clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span style={{ fontSize: "12px", color: "var(--rose-gold)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2px" }}>
            REAL TRANSFORMATIONS & BRIDAL PORTFOLIO
          </span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--primary-plum)", fontSize: "clamp(30px, 4.5vw, 48px)", margin: "10px 0" }}>
            Bridal Artistry Gallery
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
            Explore real transformations, Rajasthani Poshak draping, and royal bridal makeovers by Prachi.
          </p>
        </div>

        {/* Category Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "40px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                backgroundColor: activeCategory === cat ? "var(--primary-plum)" : "#FFFFFF",
                color: activeCategory === cat ? "var(--rose-gold)" : "var(--primary-plum)",
                border: activeCategory === cat ? "1.5px solid var(--rose-gold)" : "1px solid #E5E0D8",
                padding: "10px 22px",
                borderRadius: "24px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {cat === "ALL" ? "All Photos" : cat}
            </button>
          ))}
        </div>

        {/* Responsive Gallery Grid */}
        <div className="responsive-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="glass-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="zoom-img-container" style={{ height: "300px", position: "relative" }}>
                <img src={item.img} alt={item.title} className="zoom-img" />
                <span
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "12px",
                    backgroundColor: "rgba(26, 11, 19, 0.85)",
                    color: "var(--rose-gold)",
                    padding: "4px 12px",
                    borderRadius: "14px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  📍 {item.location}
                </span>
              </div>

              <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "var(--primary-plum)", margin: "0 0 6px 0" }}>
                    {item.title}
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.5", margin: 0 }}>
                    {item.desc}
                  </p>
                </div>

                <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid #E5E0D8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", backgroundColor: "var(--blush-pink)", color: "var(--primary-plum)", padding: "3px 10px", borderRadius: "10px", fontWeight: "bold" }}>
                    {item.category}
                  </span>
                  <a href="/book" style={{ color: "var(--primary-plum)", fontWeight: "bold", textDecoration: "none", fontSize: "13px" }}>
                    Book Similar Look →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
