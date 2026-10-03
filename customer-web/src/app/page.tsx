"use client";

import React, { useState, useEffect } from "react";
import { localBusinessSchema } from "../lib/seo";
import { FirstVisitorWelcomeCard } from "../components/customer/FirstVisitorWelcomeCard";
import { IntentBookingGuide } from "../components/customer/IntentBookingGuide";
import { SafeBookingAssistant } from "../components/ai/SafeBookingAssistant";
import { Sparkles, Calendar, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function CustomerHomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [assistantPrompt, setAssistantPrompt] = useState<string>("");

  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e.detail) {
        setLang(e.detail);
      }
    };

    const handleOpenAssistant = (e: any) => {
      setAssistantPrompt(e.detail || "Namaste! I would like to check wedding date availability.");
    };

    window.addEventListener("prachi_lang_change", handleLangChange);
    window.addEventListener("open_booking_assistant", handleOpenAssistant);

    return () => {
      window.removeEventListener("prachi_lang_change", handleLangChange);
      window.removeEventListener("open_booking_assistant", handleOpenAssistant);
    };
  }, []);

  const isHindi = lang === "hi";

  const stats = [
    { value: "1,200+", label: isHindi ? "दुल्हनें संवारीं" : "Brides Styled", icon: "👑" },
    { value: "9+ Yrs", label: isHindi ? "राजपूती विरासत" : "Heritage Legacy", icon: "🏛️" },
    { value: "4 Cities", label: isHindi ? "जोधपुर, जयपुर, उदयपुर" : "Royal Rajasthan Hubs", icon: "📍" },
    { value: "4.93★", label: isHindi ? "सत्यापित रेटिंग" : "Verified CSAT Rating", icon: "⭐" },
  ];

  const showcases = [
    {
      title: "Royal Rajasthani Poshak Look",
      subtitle: "Jodhpur & Palace Weddings",
      img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
      desc: "Traditional heavy Borla & Dupatta draping paired with 16-hour sweat-proof HD Airbrush base.",
      tag: "SIGNATURE BRIDAL",
    },
    {
      title: "Soft Dewy Engagement Glam",
      subtitle: "Pre-Wedding & Ring Ceremonies",
      img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
      desc: "Radiant glass-skin finish with customized soft textured waves for cocktail & sangeet nights.",
      tag: "ENGAGEMENT",
    },
    {
      title: "Destination Palace Bridal",
      subtitle: "Jaipur, Udaipur & Rajasthan",
      img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
      desc: "Full-day multi-event coverage with dedicated on-venue touch-up assistant station.",
      tag: "DESTINATION",
    },
  ];

  const faqs = [
    {
      q: "How far in advance should I book my wedding date?",
      a: "We recommend locking your date 3 to 6 months in advance, especially for peak wedding season (October to March) in Rajasthan.",
    },
    {
      q: "Do you travel to venues outside Jodhpur?",
      a: "Yes! Prachi and her senior team travel for destination weddings across Jaipur, Udaipur, Jaisalmer, and palace resorts across India.",
    },
    {
      q: "Is traditional Rajasthani Poshak draping included?",
      a: "Yes! Traditional Poshak & dupatta setting, Borla placement, Aad jewelry coordination, and hair extensions are included in all Signature Bridal Packages.",
    },
    {
      q: "How does the 25% deposit and date reservation work?",
      a: "When you select your date, our server places an exclusive 15-minute hold on the calendar while you pay the 25% advance via UPI QR or card. The remaining 75% is due after styling on event day.",
    },
    {
      q: "What is your cancellation and artist backup policy?",
      a: "If rescheduled 30+ days prior, 100% of your deposit transfers to any new date within 12 months. In the rare event of artist emergency, a Senior Master Artist with identical training is dispatched or you receive an immediate 100% refund.",
    },
  ];

  const scrollToDateChecker = () => {
    const el = document.getElementById("intent-booking-guide");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--champagne)" }}>
      {/* JSON-LD LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* PART 1: SHORT SKIPPABLE WELCOME CARD (Once per visitor) */}
      <FirstVisitorWelcomeCard
        onCheckDateClick={scrollToDateChecker}
        onSeePackagesClick={() => {
          const el = document.getElementById("signature-showcases");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
        onTalkToTeamClick={() => {
          setAssistantPrompt("Namaste! I want to talk to Prachi's team about bridal makeover packages.");
        }}
      />

      {/* 1. THE FIRST 10 SECONDS HERO SECTION */}
      <section
        style={{
          position: "relative",
          background:
            "linear-gradient(135deg, rgba(26, 11, 19, 0.92) 0%, rgba(42, 8, 69, 0.88) 50%, rgba(26, 11, 19, 0.95) 100%), url('https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600') center/cover no-repeat",
          color: "#FFFFFF",
          padding: "clamp(60px, 9vw, 110px) clamp(16px, 4vw, 40px)",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Eyebrow Pill */}
          <div style={{ marginBottom: "16px" }}>
            <span
              style={{
                backgroundColor: "rgba(212, 175, 55, 0.18)",
                color: "#D4AF37",
                border: "1px solid #D4AF37",
                padding: "8px 20px",
                borderRadius: "30px",
                fontSize: "clamp(11px, 1.2vw, 13px)",
                fontWeight: "700",
                letterSpacing: "2px",
                textTransform: "uppercase",
                display: "inline-block",
              }}
            >
              👑 {isHindi ? "शाही राजपूती ब्राइडल आर्टिस्ट्री" : "Royal Rajputi Bridal Artistry"}
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#D4AF37",
              fontSize: "clamp(30px, 5.5vw, 60px)",
              letterSpacing: "1.5px",
              fontWeight: "700",
              margin: "12px 0 16px 0",
              lineHeight: "1.18",
            }}
          >
            MAKEOVERS BY PRACHI
          </h1>

          {/* Explicit What & Where Statement (The First 10 Seconds) */}
          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(16px, 2.2vw, 24px)",
              color: "#FDFBF7",
              marginBottom: "16px",
              letterSpacing: "1px",
              fontWeight: "600",
            }}
          >
            {isHindi
              ? "जोधपुर, जयपुर, उदयपुर एवं डेस्टिनेशन वेडिंग्स में प्रामाणिक राजपूती ब्राइडल मेकअप"
              : "Royal Rajputi bridal makeup in Jodhpur, Jaipur, Udaipur and destination weddings."}
          </p>

          <p
            style={{
              maxWidth: "780px",
              margin: "0 auto 36px auto",
              color: "#E8D3C7",
              fontSize: "clamp(14px, 1.4vw, 16px)",
              lineHeight: "1.7",
              fontWeight: "300",
            }}
          >
            Specializing in 16-hour sweat-proof HD Airbrush base, traditional Rajputi poshak & dupatta draping, Borla and Aad jewelry coordination tailored for luxury Indian palace banquets.
          </p>

          {/* TWO CLEAR ACTION BUTTONS */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "46px",
            }}
          >
            {/* Button 1: Check my date */}
            <button
              onClick={scrollToDateChecker}
              style={{
                background: "linear-gradient(135deg, #E6CA65 0%, #D4AF37 50%, #997B1E 100%)",
                color: "#2A0845",
                padding: "14px 28px",
                borderRadius: "30px",
                fontSize: "15px",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 24px rgba(212, 175, 55, 0.4)",
              }}
            >
              <Calendar size={18} />
              <span>{isHindi ? "मेरी शादी की तारीख चेक करें" : "Check my date"}</span>
              <ArrowRight size={16} />
            </button>

            {/* Button 2: Chat / Talk to us */}
            <button
              onClick={() => {
                setAssistantPrompt("Namaste! I would like to check availability and packages for my wedding.");
              }}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#FFFFFF",
                border: "1.5px solid #D4AF37",
                padding: "14px 26px",
                borderRadius: "30px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backdropFilter: "blur(8px)",
              }}
            >
              <MessageCircle size={18} style={{ color: "#D4AF37" }} />
              <span>{isHindi ? "बातचीत करें / चैट असिस्टेंट" : "Chat / Talk to us"}</span>
            </button>
          </div>

          {/* REAL TRUST LINE WITH BACKED-UP NUMBERS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "16px",
              maxWidth: "920px",
              margin: "0 auto",
              backgroundColor: "rgba(255, 255, 255, 0.07)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              padding: "20px",
              borderRadius: "20px",
              border: "1px solid rgba(212, 175, 55, 0.35)",
            }}
          >
            {stats.map((s, idx) => (
              <div key={idx} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>{s.icon}</div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(20px, 2.5vw, 28px)",
                    fontWeight: "700",
                    color: "#D4AF37",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#E8D3C7",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontWeight: "500",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PART 1: INTENT-FIRST GUIDE ("When is your wedding?") + HOW BOOKING WORKS + WORRY REDUCTION */}
      <IntentBookingGuide
        lang={lang}
        onOpenAssistant={(customPrompt) => {
          setAssistantPrompt(customPrompt || "Hi, I want to check wedding date availability.");
        }}
      />

      {/* 2. SIGNATURE SHOWCASE SECTION */}
      <section
        id="signature-showcases"
        style={{ padding: "clamp(40px, 6vw, 80px) clamp(16px, 4vw, 36px)", maxWidth: "1200px", margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span style={{ fontSize: "12px", color: "#8C6D23", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2px" }}>
            EXQUISITE ARTISTRY
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 42px)", color: "#2A0845", margin: "8px 0 12px 0" }}>
            Signature Royal Styling
          </h2>
          <p style={{ color: "#6E6359", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
            Tailored bridal transformations honoring traditional Indian skin tones and royal heritage
          </p>
        </div>

        <div className="responsive-grid">
          {showcases.map((card, idx) => (
            <div key={idx} className="glass-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div className="zoom-img-container" style={{ height: "260px", position: "relative" }}>
                <img src={card.img} alt={card.title} className="zoom-img" />
                <span
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    backgroundColor: "#2A0845",
                    color: "#D4AF37",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    letterSpacing: "1px",
                  }}
                >
                  {card.tag}
                </span>
              </div>

              <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", color: "#2A0845", margin: "0 0 4px 0" }}>
                    {card.title}
                  </h3>
                  <div style={{ fontSize: "13px", color: "#8C6D23", fontWeight: "600", marginBottom: "12px" }}>
                    {card.subtitle}
                  </div>
                  <p style={{ color: "#6E6359", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
                    {card.desc}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAssistantPrompt(`Hi! I would like to book or get a quote for the '${card.title}'.`);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2A0845",
                    fontWeight: "700",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <span>Reserve This Look With Assistant</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. VERIFIED REVIEWS SECTION */}
      <section
        style={{
          backgroundColor: "#2A0845",
          color: "#FFFFFF",
          padding: "clamp(50px, 8vw, 90px) clamp(16px, 5vw, 40px)",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: "12px", color: "#D4AF37", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2px" }}>
            VERIFIED BRIDE REVIEWS
          </span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 42px)", color: "#D4AF37", margin: "8px 0 36px 0" }}>
            Loved by 1,200+ Royal Brides
          </h2>

          <div className="responsive-grid">
            {[
              {
                name: "Radhika J. (Bridal Client)",
                loc: "Gorbandh Palace, Jodhpur",
                text: "Prachi was an absolute dream! My poshak draping and HD eye makeup stayed flawless through the entire 12-hour wedding ceremony in October.",
                rating: "⭐⭐⭐⭐⭐",
              },
              {
                name: "Ananya S. (Destination Bride)",
                loc: "City Palace, Udaipur",
                text: "The 16-hour sweat-proof airbrush base was unbelievable. Even in November afternoon heat, my skin looked radiant and glass-smooth in every photo!",
                rating: "⭐⭐⭐⭐⭐",
              },
              {
                name: "Kavita M. (Engagement Glam)",
                loc: "Rambagh Palace, Jaipur",
                text: "Soft dewy makeup done to perfection! Everyone complimented my look. The 15-minute hold and instant WhatsApp confirmation made planning stress-free.",
                rating: "⭐⭐⭐⭐⭐",
              },
            ].map((rev, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(12px)",
                  padding: "28px",
                  borderRadius: "20px",
                  border: "1px solid rgba(212, 175, 55, 0.25)",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "18px", marginBottom: "10px" }}>{rev.rating}</div>
                <p style={{ color: "#E8D3C7", fontSize: "14px", lineHeight: "1.7", marginBottom: "16px", fontStyle: "italic" }}>
                  "{rev.text}"
                </p>
                <div style={{ fontWeight: "700", color: "#D4AF37", fontSize: "15px" }}>{rev.name}</div>
                <div style={{ fontSize: "12px", color: "#E8D3C7" }}>📍 {rev.loc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION SECTION */}
      <section style={{ padding: "clamp(50px, 8vw, 90px) clamp(16px, 5vw, 40px)", maxWidth: "850px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3.5vw, 38px)", color: "#2A0845" }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: "#6E6359", fontSize: "15px" }}>Everything you need to know before locking your wedding date</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #E5E0D8",
                padding: "20px 24px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", color: "#2A0845", margin: 0 }}>
                  {faq.q}
                </h4>
                <span style={{ fontSize: "20px", color: "#8C6D23", fontWeight: "bold" }}>
                  {activeFaq === idx ? "−" : "+"}
                </span>
              </div>
              {activeFaq === idx && (
                <p style={{ color: "#6E6359", fontSize: "14px", lineHeight: "1.6", marginTop: "14px" }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer style={{ backgroundColor: "#1A0B13", color: "#FFFFFF", padding: "60px 20px 30px 20px", textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#D4AF37", fontSize: "26px", margin: 0 }}>
          MAKEOVERS BY PRACHI
        </h3>
        <p style={{ color: "#E8D3C7", fontSize: "14px", marginTop: "8px" }}>
          Jodhpur Headquarters • Jaipur • Udaipur • Palace Destination Weddings • WhatsApp: +91 98290 12345
        </p>

        <div style={{ margin: "24px 0", display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", fontSize: "14px" }}>
          <a href="/" style={{ color: "#E5E0D8", textDecoration: "none" }}>Home</a>
          <a href="/services" style={{ color: "#E5E0D8", textDecoration: "none" }}>Services & Rates</a>
          <a href="/gallery" style={{ color: "#E5E0D8", textDecoration: "none" }}>Bridal Gallery</a>
          <a href="/reviews" style={{ color: "#E5E0D8", textDecoration: "none" }}>Reviews (4.93★)</a>
          <a href="/track" style={{ color: "#E5E0D8", textDecoration: "none" }}>Track Invoice</a>
          <a href="/privacy" style={{ color: "#E5E0D8", textDecoration: "none" }}>Privacy Policy</a>
          <a href="/book" style={{ color: "#D4AF37", fontWeight: "bold", textDecoration: "none" }}>Book Date →</a>
        </div>

        <p style={{ color: "#8E8E93", fontSize: "12px", marginTop: "30px" }}>
          © 2026 Makeovers by Prachi. All Rights Reserved. Luxury Rajputi Artistry Engine.
        </p>
      </footer>

      {/* PART 2: THE SAFE AI BOOKING ASSISTANT (Wired with voice, server tools & OTP hold) */}
      <SafeBookingAssistant initialPrompt={assistantPrompt} />
    </main>
  );
}
