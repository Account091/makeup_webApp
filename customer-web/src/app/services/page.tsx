"use client";

import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface ServiceItem {
  id: string;
  title: string;
  price: string;
  deposit: string;
  duration: string;
  category: string;
  description: string;
  inclusions: string[];
  popular?: boolean;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "bridal",
    title: "Signature Royal Bridal Makeover",
    price: "₹25,000",
    deposit: "₹7,500 (30% Lock)",
    duration: "4.0 Hours",
    category: "BRIDAL",
    description: "Full Royal Rajasthani Bridal Artistry by Prachi with 16-hour sweat-proof HD Airbrush base, custom lash extensions, and traditional Poshak draping.",
    inclusions: ["HD Airbrushing / Glass Skin Base", "Custom Lash Design & Eye Makeup", "Royal Poshak & Dupatta Setting", "Bridal Hair Styling & Fresh Flowers", "Emergency Touch-Up Kit"],
    popular: true,
  },
  {
    id: "engagement",
    title: "Pre-Wedding & Engagement Glam",
    price: "₹15,000",
    deposit: "₹4,500 (30% Lock)",
    duration: "2.5 Hours",
    category: "ENGAGEMENT",
    description: "Romantic dewy glam tailored for Ring Ceremonies, Sangeet nights, and pre-wedding photo shoots.",
    inclusions: ["Long-Wear HD Makeup Base", "Soft Waves / Textured Updo", "Lehenga / Saree Draping", "Lash Application"],
    popular: false,
  },
  {
    id: "party",
    title: "Party & Festive Makeover",
    price: "₹8,500",
    deposit: "₹2,500 (30% Lock)",
    duration: "1.5 Hours",
    category: "PARTY",
    description: "Radiant, photo-ready glam for bridesmaids, sisters of the bride, and wedding guests.",
    inclusions: ["Flawless Base & Eye Look", "Curls / Blowdry Hair Styling", "Basic Draping"],
    popular: false,
  },
  {
    id: "destination",
    title: "Destination Bridal Package",
    price: "₹45,000",
    deposit: "₹13,500 (30% Lock)",
    duration: "Full Multi-Event Coverage",
    category: "DESTINATION",
    description: "Comprehensive multi-event coverage for Palace Destination Weddings across Rajasthan and India.",
    inclusions: ["Main Wedding + Sangeet Makeovers", "Dedicated On-Venue Artist Station", "Senior Assistant Artist Included", "Pre-Wedding Consultation"],
    popular: true,
  },
];

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);

  // DYNAMIC FIRESTORE REAL-TIME LISTENER
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(
        collection(db, "services"),
        (snapshot) => {
          if (!snapshot.empty) {
            const dynamicList: ServiceItem[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title || "Beauty Service",
                price: data.price || (data.startingPrice ? `₹${data.startingPrice}` : "₹15,000"),
                deposit: data.deposit || "30% Deposit",
                duration: data.duration || "2 - 3 Hours",
                category: (data.category || "BRIDAL").toUpperCase(),
                description: data.description || "Luxury makeover service by Prachi.",
                inclusions: Array.isArray(data.inclusions) ? data.inclusions : ["HD Makeup Base", "Hair Styling"],
                popular: data.popular ?? data.isFeatured ?? false,
              };
            });
            setServices(dynamicList);
          }
          setLoading(false);
        },
        (error) => {
          console.warn("[Services] Firestore real-time notice, using default items:", error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn("[Services] Error setting up listener:", e);
      setLoading(false);
    }
  }, []);

  const categories = ["ALL", "BRIDAL", "ENGAGEMENT", "PARTY", "DESTINATION"];

  const filteredServices = selectedCategory === "ALL"
    ? services
    : services.filter((s) => s.category === selectedCategory);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--champagne)", padding: "clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px)" }}>
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        
        {/* Header Title */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span style={{ fontSize: "12px", color: "var(--rose-gold)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2px" }}>
            TRANSPARENT PRICING & INCLUSIONS • DYNAMIC FIRESTORE LEDGER
          </span>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--primary-plum)", fontSize: "clamp(30px, 4.5vw, 48px)", margin: "10px 0" }}>
            Luxury Beauty Packages
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
            Handcrafted makeover packages managed dynamically via Admin Console with HD Airbrush bases, royal Poshak draping, and zero hidden fees.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "40px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                backgroundColor: selectedCategory === cat ? "var(--primary-plum)" : "#FFFFFF",
                color: selectedCategory === cat ? "var(--rose-gold)" : "var(--primary-plum)",
                border: selectedCategory === cat ? "1.5px solid var(--rose-gold)" : "1px solid #E5E0D8",
                padding: "10px 22px",
                borderRadius: "24px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: selectedCategory === cat ? "0 4px 15px rgba(44, 19, 32, 0.2)" : "none",
              }}
            >
              {cat === "ALL" ? "All Packages" : cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--primary-plum)" }}>
            Loading live packages from Firestore...
          </div>
        ) : (
          <div className="responsive-grid">
            {filteredServices.map((s) => (
              <div key={s.id} className="glass-card" style={{ padding: "30px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
                {s.popular && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-12px",
                      right: "24px",
                      backgroundColor: "var(--rose-gold)",
                      color: "var(--primary-plum)",
                      padding: "4px 14px",
                      borderRadius: "16px",
                      fontSize: "11px",
                      fontWeight: "800",
                      letterSpacing: "1px",
                      boxShadow: "0 4px 10px rgba(212, 175, 55, 0.4)",
                    }}
                  >
                    MOST POPULAR
                  </span>
                )}

                <div>
                  <span style={{ fontSize: "11px", backgroundColor: "var(--blush-pink)", color: "var(--primary-plum)", padding: "4px 12px", borderRadius: "14px", fontWeight: "bold" }}>
                    {s.category}
                  </span>

                  <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--primary-plum)", fontSize: "24px", margin: "14px 0 6px 0" }}>
                    {s.title}
                  </h2>

                  <div style={{ margin: "0 0 16px 0" }}>
                    <span style={{ fontSize: "26px", fontWeight: "800", color: "var(--rose-gold)", fontFamily: "'Playfair Display', serif" }}>
                      {s.price}
                    </span>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)", marginLeft: "8px" }}>
                      ({s.duration})
                    </span>
                    <div style={{ fontSize: "12px", color: "#28A745", fontWeight: "600", marginTop: "2px" }}>
                      30% Lock Deposit: {s.deposit}
                    </div>
                  </div>

                  <p style={{ color: "var(--text-dark)", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
                    {s.description}
                  </p>

                  <h4 style={{ fontSize: "13px", color: "var(--primary-plum)", margin: "0 0 12px 0", fontWeight: "bold", textTransform: "uppercase" }}>
                    ✨ Package Inclusions:
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
                    {s.inclusions.map((inc, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
                        <span style={{ color: "var(--rose-gold)", fontWeight: "bold" }}>✓</span>
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={`/book?service=${encodeURIComponent(s.title)}`}
                  className="btn-gold"
                  style={{ justifyContent: "center", width: "100%" }}
                >
                  Book {s.title} →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
