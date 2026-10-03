"use client";

import React, { useState } from "react";
import { Calendar, MapPin, CheckCircle2, ShieldCheck, Clock, CreditCard, Sparkles, AlertCircle, ArrowRight } from "lucide-react";

interface IntentBookingGuideProps {
  onOpenAssistant: (initialQuery?: string) => void;
  lang?: "en" | "hi";
}

export const IntentBookingGuide: React.FC<IntentBookingGuideProps> = ({ onOpenAssistant, lang = "en" }) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("Jodhpur");
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const isHindi = lang === "hi";

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      // Default to next month peak date for demonstration if empty
      setSelectedDate("2026-12-12");
    }
    setHasSearched(true);
  };

  const cityHighlights: Record<string, { venue: string; advice: string; review: string; bride: string }> = {
    Jodhpur: {
      venue: "Umaid Bhawan & Mehrangarh Fort Specialists",
      advice: "Headquarters team with zero travel charges. Includes authentic Borla, Aad setting & royal Rajputi poshak draping.",
      review: "Prachi and team styled me at Gorbandh Palace. The 16-hour sweat-proof base didn't budge even through the afternoon pheras!",
      bride: "Radhika J., Jodhpur",
    },
    Jaipur: {
      venue: "Rambagh Palace & Fairmont Jaipur Destination Hub",
      advice: "Dedicated mobile artist van with professional ring lights & steam touch-up station. Travel fee: ₹3,500.",
      review: "Flawless royal Rajasthani look for my palace wedding in Jaipur. The jewelry coordination and poshak pleating were perfection.",
      bride: "Shivani S., Jaipur",
    },
    Udaipur: {
      venue: "City Palace, Jagmandir & Lake Pichola Banquets",
      advice: "Specialized humidity-proof airbrush formulations for outdoor lakeside wedding banquets. Travel fee: ₹3,500.",
      review: "The lakeside wind and humidity didn't affect my makeup at all. Felt like a Maharani from start to finish!",
      bride: "Ananya R., Udaipur",
    },
    Destination: {
      venue: "Pan-Rajasthan & Luxury Heritage Palaces (Jaisalmer, Pushkar, Bikaner)",
      advice: "Full-day multi-event coverage with dedicated touch-up assistants throughout sangeet, mehendi, and wedding pheras.",
      review: "Prachi's senior team flew out to our destination resort and styled 8 family members alongside me effortlessly.",
      bride: "Meera K., Destination Bride",
    },
  };

  const currentInfo = cityHighlights[selectedCity] || cityHighlights.Jodhpur;

  return (
    <section
      id="intent-booking-guide"
      style={{
        padding: "clamp(40px, 6vw, 70px) clamp(16px, 4vw, 36px)",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* 1. INTENT-FIRST QUERY CARD */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          padding: "clamp(24px, 4vw, 40px)",
          boxShadow: "0 12px 40px rgba(42, 8, 69, 0.08)",
          border: "1.5px solid rgba(212, 175, 55, 0.35)",
          marginBottom: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #D4AF37 0%, #2A0845 50%, #D4AF37 100%)",
          }}
        />

        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 28px auto" }}>
          <span
            style={{
              fontSize: "12px",
              color: "#8C6D23",
              fontWeight: "700",
              letterSpacing: "2px",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "8px",
            }}
          >
            {isHindi ? "✨ अपनी शादी की तारीख चेक करें" : "✨ CHECK YOUR WEDDING DATE FIRST"}
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#2A0845",
              fontSize: "clamp(24px, 3.5vw, 36px)",
              margin: "0 0 10px 0",
              fontWeight: "700",
            }}
          >
            {isHindi ? "आपकी शादी कब है?" : "When is your wedding celebration?"}
          </h2>
          <p style={{ color: "#6E6359", fontSize: "15px", lineHeight: "1.6", margin: 0 }}>
            {isHindi
              ? "अपनी तारीख और शहर चुनें। हम तुरंत स्लॉट उपलब्धता, पैकेज और वास्तविक ब्राइडल रिव्यू दिखाएंगे।"
              : "Tell us your date and destination. We'll instantly personalize availability, package pricing, and real palace bridal reviews."}
          </p>
        </div>

        {/* Form Inputs */}
        <form
          onSubmit={handleCheck}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            alignItems: "end",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div>
            <label
              htmlFor="wedding-date-input"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#2A0845",
                marginBottom: "6px",
              }}
            >
              <Calendar size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px", color: "#8C6D23" }} />
              {isHindi ? "शादी की तारीख" : "Wedding Date"}
            </label>
            <input
              id="wedding-date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setHasSearched(true);
              }}
              min={new Date().toISOString().split("T")[0]}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1.5px solid #E5E0D8",
                fontSize: "14px",
                backgroundColor: "#FDFBF7",
                color: "#2A0845",
                fontWeight: "500",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="wedding-city-select"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#2A0845",
                marginBottom: "6px",
              }}
            >
              <MapPin size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px", color: "#8C6D23" }} />
              {isHindi ? "शहर / वेडिंग वेन्यू" : "City / Wedding Venue"}
            </label>
            <select
              id="wedding-city-select"
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setHasSearched(true);
              }}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                border: "1.5px solid #E5E0D8",
                fontSize: "14px",
                backgroundColor: "#FDFBF7",
                color: "#2A0845",
                fontWeight: "500",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="Jodhpur">Jodhpur (Studio HQ • ₹0 Travel)</option>
              <option value="Jaipur">Jaipur (Palace Hub • ₹3,500)</option>
              <option value="Udaipur">Udaipur (Lakeview Banquets • ₹3,500)</option>
              <option value="Destination">Destination (Jaisalmer, Pushkar, Pan-India)</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "13px 20px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #E6CA65 0%, #D4AF37 50%, #997B1E 100%)",
                color: "#2A0845",
                border: "none",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(212, 175, 55, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>{isHindi ? "तारीख की उपलब्धता देखें" : "Check Date Availability"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        {/* TAILORED RESULT BANNER (Appears once date is selected or checked) */}
        {hasSearched && (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "rgba(212, 175, 55, 0.08)",
              border: "1.5px solid rgba(212, 175, 55, 0.4)",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#2A0845",
                    color: "#D4AF37",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                >
                  ✨
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#2A0845", fontWeight: "700" }}>
                    {selectedDate
                      ? `${selectedCity} Slot Open for ${selectedDate}`
                      : `${selectedCity} Bridal Team Available for Season 2026`}
                  </h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#6E6359" }}>
                    {currentInfo.venue} • {currentInfo.advice}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  onOpenAssistant(
                    `Hi, I want to book for ${selectedDate || "December 2026"} in ${selectedCity}. Can you check packages and hold my date?`
                  )
                }
                style={{
                  padding: "10px 18px",
                  borderRadius: "20px",
                  backgroundColor: "#2A0845",
                  color: "#D4AF37",
                  border: "1px solid #D4AF37",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Sparkles size={14} />
                <span>{isHindi ? "इस तारीख को असिस्टेंट से लॉक करें" : "Hold Date with Assistant"}</span>
              </button>
            </div>

            {/* Matched City Testimonial */}
            <div
              style={{
                marginTop: "14px",
                paddingTop: "12px",
                borderTop: "1px dashed rgba(212, 175, 55, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
                color: "#4A3710",
              }}
            >
              <span>💬</span>
              <em>"{currentInfo.review}"</em>
              <strong style={{ color: "#2A0845", whiteSpace: "nowrap" }}>— {currentInfo.bride}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 2. HOW BOOKING WORKS STRIP (4 CLEAR STEPS) */}
      <div style={{ marginBottom: "50px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "12px", color: "#8C6D23", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>
            TRANSPARENT 4-STEP PROCESS
          </span>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(22px, 3vw, 32px)",
              color: "#2A0845",
              margin: "6px 0 0 0",
              fontWeight: "700",
            }}
          >
            {isHindi ? "बुकिंग कैसे काम करती है" : "How Booking Works"}
          </h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          {[
            {
              step: "01",
              title: isHindi ? "तारीख चुनें" : "1. Choose Your Date",
              desc: isHindi
                ? "हमारे लाइव सिस्टम से शादी का दिन और शहर तुरंत वेरिफाई करें।"
                : "Verify real-time calendar availability for your wedding day and venue in Rajasthan.",
              icon: <Calendar size={22} style={{ color: "#D4AF37" }} />,
            },
            {
              step: "02",
              title: isHindi ? "पैकेज चुनें" : "2. Choose Your Package",
              desc: isHindi
                ? "रॉयल राजपूती सिग्नेचर, पैलेस एचडी या गेस्ट आर्टिस्ट्री सेलेक्ट करें।"
                : "Select Royal Rajputi Signature (poshak + aad draping) or Palace Luxury HD.",
              icon: <Sparkles size={22} style={{ color: "#D4AF37" }} />,
            },
            {
              step: "03",
              title: isHindi ? "25% एडवांस डिपॉजिट" : "3. Pay 25% Deposit",
              desc: isHindi
                ? "सुरक्षित UPI QR या कार्ड से 15 मिनट का प्रोविजनल स्लॉट लॉक करें।"
                : "Lock your exclusive calendar slot with a 15-minute provisional hold via UPI QR or card.",
              icon: <CreditCard size={22} style={{ color: "#D4AF37" }} />,
            },
            {
              step: "04",
              title: isHindi ? "तुरंत कन्फर्मेशन" : "4. Get Confirmation",
              desc: isHindi
                ? "व्हाट्सएप वाउचर, जीएसटी इनवॉइस और ब्राइडल स्किन कंसल्टेशन पाएं।"
                : "Receive your WhatsApp voucher, Google Calendar link, and bespoke bridal prep questionnaire.",
              icon: <CheckCircle2 size={22} style={{ color: "#D4AF37" }} />,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "18px",
                padding: "24px",
                border: "1px solid #E5E0D8",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "rgba(42, 8, 69, 0.06)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </div>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "18px", color: "#8C6D23", fontWeight: "700" }}>
                    {item.step}
                  </span>
                </div>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#2A0845", margin: "0 0 8px 0" }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: "13px", color: "#6E6359", lineHeight: "1.6", margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. REDUCE WORRY EARLY (TRANSPARENT GUARANTEES STRIP) */}
      <div
        style={{
          backgroundColor: "#2A0845",
          borderRadius: "24px",
          padding: "clamp(24px, 4vw, 36px)",
          color: "#FFFFFF",
          boxShadow: "0 16px 40px rgba(42, 8, 69, 0.2)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span style={{ fontSize: "12px", color: "#D4AF37", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase" }}>
            PEACE OF MIND GUARANTEES
          </span>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(22px, 3.5vw, 30px)",
              color: "#D4AF37",
              margin: "6px 0 0 0",
              fontWeight: "700",
            }}
          >
            {isHindi ? "बिना किसी चिंता के शादी की तारीख बुक करें" : "Book With Complete Confidence"}
          </h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "14px" }}>
            <div style={{ color: "#D4AF37", flexShrink: 0 }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#FDFBF7", fontWeight: "600" }}>
                {isHindi ? "पारदर्शी 25% डिपॉजिट" : "25% Transparent Deposit"}
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#E8D3C7", lineHeight: "1.6" }}>
                {isHindi
                  ? "तारीख होल्ड करने के लिए सिर्फ 25% एडवांस। बाकी 75% शादी के दिन मेकअप पूरा होने के बाद देय है।"
                  : "Only 25% required to securely lock your wedding calendar. Remaining 75% is paid on event day after styling."}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "14px" }}>
            <div style={{ color: "#D4AF37", flexShrink: 0 }}>
              <Clock size={26} />
            </div>
            <div>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#FDFBF7", fontWeight: "600" }}>
                {isHindi ? "स्पष्ट कैंसिलेशन पॉलिसी" : "Flexible Rescheduling"}
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#E8D3C7", lineHeight: "1.6" }}>
                {isHindi
                  ? "शादी से 30+ दिन पहले तारीख बदलने पर 100% डिपॉजिट क्रेडिट 12 महीने के लिए मान्य रहता है।"
                  : "Rescheduling 30+ days prior transfers 100% of your deposit credit to any new date within 12 months."}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "14px" }}>
            <div style={{ color: "#D4AF37", flexShrink: 0 }}>
              <Sparkles size={26} />
            </div>
            <div>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", color: "#FDFBF7", fontWeight: "600" }}>
                {isHindi ? "आर्टिस्ट अनअवेलेबिलिटी बैकअप" : "100% Artistry Backup Guarantee"}
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#E8D3C7", lineHeight: "1.6" }}>
                {isHindi
                  ? "इमरजेंसी होने पर समान पोर्टफोलियो और 5+ वर्ष अनुभव वाली सीनियर मास्टर आर्टिस्ट अथवा 100% तत्काल रिफंड।"
                  : "In any emergency, an identically trained Senior Master Artist is dispatched at zero extra fee, or receive an immediate 100% refund."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
