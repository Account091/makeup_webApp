"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";

interface WeddingFunction {
  id: string;
  name: string;
  date: string;
  readyByTime: string;
  venueName: string;
  city: string;
  status: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED";
  artists: string[];
}

interface InspirationItem {
  id: string;
  title: string;
  category: "POSHAK_LEHENGA" | "JEWELLERY" | "MAKEUP_LOOK";
  imageUrl: string;
  notes: string;
}

export default function MyWeddingPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("+91 98290 12345");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<"schedule" | "payments" | "prep" | "calculator" | "documents" | "ai_advisor">("schedule");

  // Hugging Face AI Bridal Advisor State
  const [aiSkinType, setAiSkinType] = useState<string>("Combination / Sensitive");
  const [aiQuestion, setAiQuestion] = useState<string>("48-Hour Emergency Skincare & Breakout Protocol");
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const handleGetAiAdvice = async (customQ?: string) => {
    setIsAiLoading(true);
    setAiResponse("");
    const query = customQ || aiCustomPrompt || aiQuestion;

    try {
      const res = await fetch("/api/ai/automate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BRIDAL_BEAUTY_ADVICE",
          payload: {
            customerName: "Radhika Jodhpur",
            weddingDate: "2026-11-28",
            question: query,
            skinType: aiSkinType,
          },
        }),
      });
      const data = await res.json();
      if (data?.result) {
        setAiResponse(data.result);
      } else {
        setAiResponse("Unable to fetch AI guidance at this moment. Please check with your lead artist directly.");
      }
    } catch {
      setAiResponse("Unable to connect to Hugging Face AI service. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Reverse-Start Calculator State
  const [readyByTime, setReadyByTime] = useState<string>("22:00");
  const [brideServiceMinutes, setBrideServiceMinutes] = useState<number>(150); // 2.5 hours for Royal Airbrush + Poshak Draping
  const [guestCount, setGuestCount] = useState<number>(2); // Mother + Sister
  const [guestMinsEach, setGuestMinsEach] = useState<number>(45);
  const [transitMinutes, setTransitMinutes] = useState<number>(30);
  const [safetyBufferMinutes, setSafetyBufferMinutes] = useState<number>(30);
  const [copiedTiming, setCopiedTiming] = useState<boolean>(false);

  // Palace Suite Readiness Checklist State
  const [suiteChecklist, setSuiteChecklist] = useState<{ [key: string]: boolean }>({
    sockets: true,
    lighting: true,
    ac: false,
    cleanSpace: true,
    entryPass: true,
  });

  // Share Modal State
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState<boolean>(false);
  const [rescheduleReason, setRescheduleReason] = useState<string>("");
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string>("");

  // Inspiration Board State
  const [dpdpConsent, setDpdpConsent] = useState<boolean>(true);
  const [inspirationItems, setInspirationItems] = useState<InspirationItem[]>([
    {
      id: "insp_1",
      title: "Royal Crimson Rajputi Poshak",
      category: "POSHAK_LEHENGA",
      imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
      notes: "Heavy gold zardozi work on crimson velvet. Needs warm golden glow base.",
    },
    {
      id: "insp_2",
      title: "Kundan Aad & Maang Tikka Setting",
      category: "JEWELLERY",
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      notes: "Heritage antique finish with emerald drops.",
    },
  ]);
  const [newInspTitle, setNewInspTitle] = useState("");
  const [newInspCategory, setNewInspCategory] = useState<"POSHAK_LEHENGA" | "JEWELLERY" | "MAKEUP_LOOK">("MAKEUP_LOOK");
  const [newInspNotes, setNewInspNotes] = useState("");

  // Wedding & Commercial Data
  const bookingId = "MBP-2026-X8K9";
  const brideName = "Radhika Jodhpur";
  const weddingDate = "2026-11-28";
  
  // Calculate Days Remaining
  const targetDate = new Date(weddingDate);
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const functions: WeddingFunction[] = [
    {
      id: "fn_1",
      name: "Sangeet & Cocktail Glam",
      date: "27 Nov 2026",
      readyByTime: "06:30 PM",
      venueName: "Gorbandh Palace Banquet, Jodhpur",
      city: "Jodhpur",
      status: "CONFIRMED",
      artists: ["Prachi (Lead)", "Ritu (Hair Stylist)"],
    },
    {
      id: "fn_2",
      name: "Royal Rajputi Pheras (Night Muhurat)",
      date: "28 Nov 2026",
      readyByTime: "10:30 PM",
      venueName: "Gorbandh Heritage Suite #402, Jodhpur",
      city: "Jodhpur",
      status: "CONFIRMED",
      artists: ["Prachi (Head Artist)", "Anita (Poshak Drapist)", "Ritu (Hair)"],
    },
  ];

  // Financial Breakdown (In Rupees)
  const basePackage = 38000;
  const travelFee = 0; // Local studio hub
  const gstTax = Math.round((basePackage + travelFee) * 0.18); // 18% salon GST
  const discount = 2000; // Auspicious advance discount
  const totalAmount = basePackage + travelFee + gstTax - discount;
  const depositPaid = 15000;
  const balanceDue = totalAmount - depositPaid;
  const balanceDueDate = "14 Nov 2026 (T-14 Days)";

  // Check saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem("mbp_customer_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setAuthError("Please enter a valid 10-digit Indian phone number.");
      return;
    }
    setAuthError("");
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otpCode === "123456" || otpCode.length >= 4) {
      setIsAuthenticated(true);
      localStorage.setItem("mbp_customer_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Invalid OTP. Use demo OTP '123456' to proceed.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("mbp_customer_auth");
    setOtpSent(false);
    setOtpCode("");
  };

  const handleAddInspiration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInspTitle) return;
    if (!dpdpConsent) {
      alert("Please accept the DPDP data consent to allow beauty undertone analysis.");
      return;
    }

    const newItem: InspirationItem = {
      id: `insp_${Date.now()}`,
      title: newInspTitle,
      category: newInspCategory,
      imageUrl: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=600&q=80",
      notes: newInspNotes || "Added for bridal look inspiration.",
    };
    setInspirationItems([newItem, ...inspirationItems]);
    setNewInspTitle("");
    setNewInspNotes("");
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/track?ref=${bookingId}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleReason) return;
    setRescheduleSuccess("Your reschedule request has been submitted to Prachi's team. We will review availability and message you on WhatsApp within 2 hours.");
    setTimeout(() => {
      setRescheduleModalOpen(false);
      setRescheduleSuccess("");
      setRescheduleReason("");
    }, 4000);
  };

  return (
    <div style={{ backgroundColor: "#FDFBF7", minHeight: "100vh", color: "#2A0845" }}>
      <Header />

      {/* ─────────────────────────────────────────────────────────────
          LOGIN / OTP SCREEN (IF NOT AUTHENTICATED)
      ─────────────────────────────────────────────────────────────── */}
      {!isAuthenticated ? (
        <main style={{ maxWidth: "560px", margin: "60px auto", padding: "0 20px" }}>
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "40px 32px",
              boxShadow: "0 16px 40px rgba(42, 8, 69, 0.08)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "8px 18px",
                backgroundColor: "#2A0845",
                color: "#D4AF37",
                borderRadius: "30px",
                fontSize: "12px",
                fontWeight: "700",
                letterSpacing: "1.5px",
                marginBottom: "20px",
              }}
            >
              👑 BRIDAL PORTAL
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: "700",
                color: "#2A0845",
                margin: "0 0 10px 0",
              }}
            >
              My Wedding Dashboard
            </h1>
            <p style={{ color: "#8C6D23", fontSize: "14px", margin: "0 0 28px 0" }}>
              Sign in with your phone number to access your wedding itinerary, pay balances, and share quotes with your family.
            </p>

            {!otpSent ? (
              <div>
                <label style={{ display: "block", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#4A3710", marginBottom: "8px" }}>
                  Registered Mobile Number
                </label>
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98290 12345"
                    style={{
                      flex: 1,
                      padding: "14px 16px",
                      borderRadius: "10px",
                      border: "1.5px solid #E8D3C7",
                      fontSize: "15px",
                      color: "#2A0845",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleSendOtp}
                    style={{
                      backgroundColor: "#2A0845",
                      color: "#D4AF37",
                      border: "none",
                      padding: "0 24px",
                      borderRadius: "10px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(42, 8, 69, 0.2)",
                    }}
                  >
                    Send OTP
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ display: "block", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#4A3710", marginBottom: "8px" }}>
                  Enter 6-Digit Verification Code (Demo: 123456)
                </label>
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    style={{
                      flex: 1,
                      padding: "14px 16px",
                      borderRadius: "10px",
                      border: "1.5px solid #D4AF37",
                      fontSize: "18px",
                      letterSpacing: "4px",
                      textAlign: "center",
                      color: "#2A0845",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleVerifyOtp}
                    style={{
                      backgroundColor: "#8C6D23",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "0 28px",
                      borderRadius: "10px",
                      fontWeight: "700",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    Verify & Enter
                  </button>
                </div>
                <div style={{ textAlign: "right", marginTop: "-12px", marginBottom: "16px" }}>
                  <button
                    onClick={() => setOtpSent(false)}
                    style={{ background: "none", border: "none", color: "#8C6D23", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Change Number
                  </button>
                </div>
              </div>
            )}

            {authError && (
              <div style={{ padding: "10px", backgroundColor: "#FDE8E8", color: "#C81E1E", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                {authError}
              </div>
            )}

            <div style={{ fontSize: "12px", color: "#8C6D23", marginTop: "20px", borderTop: "1px solid #F0EAE1", paddingTop: "16px" }}>
              🔒 Protected by <strong>DPDP Act (India)</strong>. We never share your photos or contacts with third parties.
            </div>
          </div>
        </main>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            AUTHENTICATED "MY WEDDING" DASHBOARD
        ─────────────────────────────────────────────────────────────── */
        <main style={{ maxWidth: "1240px", margin: "32px auto", padding: "0 20px" }}>
          {/* Top Banner Card */}
          <div
            style={{
              backgroundColor: "#2A0845",
              borderRadius: "20px",
              padding: "clamp(24px, 4vw, 36px)",
              color: "#FFFFFF",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(42, 8, 69, 0.2)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              marginBottom: "32px",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ backgroundColor: "#D4AF37", color: "#2A0845", padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                    CONFIRMED BRIDE
                  </span>
                  <span style={{ color: "#E8D3C7", fontSize: "13px" }}>Ref #{bookingId}</span>
                </div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3.5vw, 36px)", margin: "0 0 6px 0", color: "#FDFBF7" }}>
                  Welcome, {brideName}
                </h1>
                <p style={{ margin: 0, color: "#E8C5C8", fontSize: "15px" }}>
                  Your Royal Rajputi Wedding Journey with Head Artist Prachi
                </p>
              </div>

              {/* Countdown Tile */}
              <div
                style={{
                  backgroundColor: "rgba(253, 251, 247, 0.08)",
                  border: "1.5px solid #D4AF37",
                  borderRadius: "16px",
                  padding: "16px 24px",
                  textAlign: "center",
                  minWidth: "160px",
                }}
              >
                <div style={{ fontSize: "32px", fontWeight: "800", color: "#D4AF37", lineHeight: "1" }}>
                  {daysRemaining}
                </div>
                <div style={{ fontSize: "12px", color: "#FDFBF7", letterSpacing: "1px", textTransform: "uppercase", marginTop: "4px" }}>
                  Days Remaining
                </div>
                <div style={{ fontSize: "11px", color: "#E8D3C7", marginTop: "2px" }}>
                  28 November 2026
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(212, 175, 55, 0.2)", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              <a
                href="https://wa.me/919829012345?text=Hello%20Prachi%20I%20have%20a%20question%20regarding%20my%20bridal%20booking%20MBP-2026-X8K9"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#25D366",
                  color: "#FFFFFF",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "700",
                  textDecoration: "none",
                }}
              >
                💬 WhatsApp Prachi Directly
              </a>
              <button
                onClick={copyShareLink}
                style={{
                  backgroundColor: "rgba(253, 251, 247, 0.15)",
                  color: "#FDFBF7",
                  border: "1px solid rgba(212, 175, 55, 0.5)",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {copiedLink ? "✓ Link Copied!" : "🔗 Share Quote with Family / Groom"}
              </button>
              <button
                onClick={() => setRescheduleModalOpen(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#E8D3C7",
                  fontSize: "13px",
                  cursor: "pointer",
                  textDecoration: "underline",
                  marginLeft: "auto",
                }}
              >
                Request Date Change / Reschedule
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "#FF9B9B",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              borderBottom: "2px solid #E8D3C7",
              marginBottom: "28px",
              overflowX: "auto",
            }}
          >
            {[
              { id: "schedule", label: "🗓️ Function Itinerary" },
              { id: "payments", label: "💳 Invoices & Pay Balance" },
              { id: "calculator", label: "⏰ Start Time Calculator & Suite Prep" },
              { id: "prep", label: "💄 Preparation & Inspiration" },
              { id: "documents", label: "📜 Service Contract & Policies" },
              { id: "ai_advisor", label: "🤖 Hugging Face AI Bridal Advisor" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: "12px 20px",
                  border: "none",
                  background: "none",
                  fontSize: "15px",
                  fontWeight: activeTab === tab.id ? "700" : "500",
                  color: activeTab === tab.id ? "#2A0845" : "#8C6D23",
                  borderBottom: activeTab === tab.id ? "3px solid #2A0845" : "3px solid transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: FUNCTION ITINERARY & READY-BY TIMELINE
          ─────────────────────────────────────────────────────────────── */}
          {activeTab === "schedule" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
              {functions.map((fn, idx) => (
                <div
                  key={fn.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 8px 24px rgba(42, 8, 69, 0.06)",
                    border: "1.5px solid #E8D3C7",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#8C6D23", textTransform: "uppercase", letterSpacing: "1px" }}>
                      Event #{idx + 1}
                    </span>
                    <span style={{ backgroundColor: "#E6F4EA", color: "#137333", fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "12px" }}>
                      ● {fn.status}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", margin: "0 0 8px 0", color: "#2A0845" }}>
                    {fn.name}
                  </h3>
                  <div style={{ fontSize: "14px", color: "#4A3710", marginBottom: "6px" }}>
                    📅 <strong>{fn.date}</strong>
                  </div>
                  <div style={{ fontSize: "14px", color: "#2A0845", marginBottom: "6px" }}>
                    ⏰ Ready-By Time: <strong>{fn.readyByTime}</strong>
                  </div>
                  <div style={{ fontSize: "13px", color: "#8C6D23", marginBottom: "16px" }}>
                    📍 {fn.venueName}
                  </div>

                  <div style={{ backgroundColor: "#FDFBF7", borderRadius: "10px", padding: "12px", border: "1px solid #F0EAE1" }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "#4A3710", marginBottom: "4px" }}>
                      Assigned Studio Team:
                    </div>
                    {fn.artists.map((artist, aIdx) => (
                      <div key={aIdx} style={{ fontSize: "13px", color: "#2A0845" }}>
                        ✨ {artist}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: PAYMENTS, INVOICES & PAY BALANCE NOW
          ─────────────────────────────────────────────────────────────── */}
          {activeTab === "payments" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "28px" }}>
              {/* Commercial Summary Card */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  padding: "28px",
                  boxShadow: "0 8px 24px rgba(42, 8, 69, 0.06)",
                  border: "1.5px solid #E8D3C7",
                }}
              >
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", margin: "0 0 16px 0", color: "#2A0845" }}>
                  Wedding Commercials & Invoicing
                </h3>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0EAE1", fontSize: "14px" }}>
                  <span style={{ color: "#4A3710" }}>Base Bridal Artistry Package</span>
                  <span style={{ fontWeight: "600" }}>₹{basePackage.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0EAE1", fontSize: "14px" }}>
                  <span style={{ color: "#4A3710" }}>Outstation Vanity & Travel</span>
                  <span style={{ color: "#137333", fontWeight: "600" }}>₹{travelFee} (Local Studio)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0EAE1", fontSize: "14px" }}>
                  <span style={{ color: "#4A3710" }}>18% Salon Cosmetic GST (SAC 9997)</span>
                  <span style={{ fontWeight: "600" }}>₹{gstTax.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0EAE1", fontSize: "14px" }}>
                  <span style={{ color: "#137333" }}>Auspicious Booking Courtesy</span>
                  <span style={{ color: "#137333", fontWeight: "600" }}>-₹{discount.toLocaleString("en-IN")}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", fontSize: "17px", fontWeight: "700", color: "#2A0845" }}>
                  <span>Total Amount</span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>

                {/* Advance Paid */}
                <div style={{ backgroundColor: "#E6F4EA", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#137333" }}>✓ Advance Deposit Paid</div>
                    <div style={{ fontSize: "11px", color: "#4A3710" }}>Receipt #RC-1094 (Razorpay Verified)</div>
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#137333" }}>
                    ₹{depositPaid.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Balance Due Tile */}
                <div style={{ backgroundColor: "#FDF4E3", borderRadius: "12px", padding: "16px", border: "1.5px solid #D4AF37", marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#4A3710" }}>REMAINING BALANCE DUE:</span>
                    <span style={{ fontSize: "22px", fontWeight: "800", color: "#2A0845" }}>₹{balanceDue.toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#8C6D23", marginBottom: "16px" }}>
                    Due by: <strong>{balanceDueDate}</strong>
                  </div>

                  <button
                    onClick={() => alert("Redirecting to Razorpay Secure Gateway (UPI, Cards, NetBanking, Split)...")}
                    style={{
                      width: "100%",
                      backgroundColor: "#2A0845",
                      color: "#D4AF37",
                      border: "none",
                      padding: "14px",
                      borderRadius: "10px",
                      fontSize: "15px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 6px 16px rgba(42, 8, 69, 0.25)",
                    }}
                  >
                    💳 Pay Balance Now (Cards, UPI, Bank Transfer)
                  </button>
                </div>
              </div>

              {/* Tax Invoice Downloads & Policy */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  padding: "28px",
                  boxShadow: "0 8px 24px rgba(42, 8, 69, 0.06)",
                  border: "1.5px solid #E8D3C7",
                }}
              >
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", margin: "0 0 16px 0", color: "#2A0845" }}>
                  Official Documents & Receipts
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ border: "1px solid #E8D3C7", borderRadius: "10px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#2A0845" }}>Official Tax Invoice (GSTIN Compliant)</div>
                      <div style={{ fontSize: "12px", color: "#8C6D23" }}>Format: PDF (Includes CGST + SGST breakdown)</div>
                    </div>
                    <button
                      onClick={() => alert("Downloading PDF Invoice...")}
                      style={{ padding: "8px 14px", backgroundColor: "#FDFBF7", border: "1px solid #D4AF37", color: "#2A0845", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                    >
                      Download PDF
                    </button>
                  </div>

                  <div style={{ border: "1px solid #E8D3C7", borderRadius: "10px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#2A0845" }}>Advance Deposit Receipt #RC-1094</div>
                      <div style={{ fontSize: "12px", color: "#8C6D23" }}>Timestamp: 24 Oct 2026, 11:42 AM</div>
                    </div>
                    <button
                      onClick={() => alert("Downloading Receipt...")}
                      style={{ padding: "8px 14px", backgroundColor: "#FDFBF7", border: "1px solid #D4AF37", color: "#2A0845", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                    >
                      Download
                    </button>
                  </div>
                </div>

                <div style={{ backgroundColor: "#FDFBF7", borderRadius: "10px", padding: "16px", marginTop: "24px", fontSize: "12px", color: "#4A3710", lineHeight: "1.6" }}>
                  📌 <strong>Tax & Payment Guarantee:</strong> All transactions are processed through our licensed gateway partner (Razorpay). We do not accept cash payments of ₹2,00,000 or above in accordance with Section 269ST of the Indian Income Tax Act.
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: "WHAT TIME SHOULD WE START?" REVERSE CALCULATOR & SUITE PREP
          ─────────────────────────────────────────────────────────────── */}
          {activeTab === "calculator" && (() => {
            const totalPrepMinutes = brideServiceMinutes + (guestCount * guestMinsEach) + safetyBufferMinutes;
            const [readyH, readyM] = (readyByTime || "22:00").split(":").map(Number);
            const targetTotalMinutes = (isNaN(readyH) ? 22 : readyH) * 60 + (isNaN(readyM) ? 0 : readyM);
            const arrivalMinutes = targetTotalMinutes - totalPrepMinutes;
            const departureMinutes = arrivalMinutes - transitMinutes;

            const formatClockTime = (totalMins: number) => {
              const normalized = (totalMins + 1440 * 2) % 1440;
              const h = Math.floor(normalized / 60);
              const m = normalized % 60;
              const ampm = h >= 12 ? "PM" : "AM";
              let displayH = h % 12;
              if (displayH === 0) displayH = 12;
              return `${displayH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
            };

            const arrivalTimeString = formatClockTime(arrivalMinutes);
            const departureTimeString = formatClockTime(departureMinutes);
            const readyTimeString = formatClockTime(targetTotalMinutes);
            const totalHoursText = `${Math.floor(totalPrepMinutes / 60)}h ${totalPrepMinutes % 60}m`;

            const copyTimingSummary = () => {
              const text = `👑 Makeovers by Prachi — Wedding Day Timeline
📅 Event: Royal Rajputi Pheras (Booking #${bookingId})
🎯 Target Ready-By (Photography Time): ${readyTimeString}
⏰ Artist Team Arrival at Suite: ${arrivalTimeString}
🚗 Artist Studio Departure: ${departureTimeString}
⏳ Total Prep Duration: ${totalHoursText}
💄 Services: Bride (Airbrush + Poshak Draping) + ${guestCount} Family Members
📍 Venue: Gorbandh Palace Heritage Suite #402`;
              navigator.clipboard.writeText(text);
              setCopiedTiming(true);
              setTimeout(() => setCopiedTiming(false), 3000);
            };

            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {/* Timing Calculator Card */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    padding: "32px",
                    boxShadow: "0 8px 24px rgba(42, 8, 69, 0.06)",
                    border: "1.5px solid #E8D3C7",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
                    <div>
                      <div style={{ display: "inline-block", padding: "4px 12px", backgroundColor: "#FDF4E3", color: "#8C6D23", borderRadius: "12px", fontSize: "11px", fontWeight: "700", marginBottom: "8px" }}>
                        ⏱️ BRIDAL PLANNING ALGORITHM
                      </div>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", margin: 0, color: "#2A0845" }}>
                        "What Time Should We Start?" Calculator
                      </h3>
                      <p style={{ margin: "4px 0 0 0", color: "#8C6D23", fontSize: "14px" }}>
                        Enter your muhurat photography time and guest count. The calculator works backward to compute the exact artist arrival time.
                      </p>
                    </div>

                    <button
                      onClick={copyTimingSummary}
                      style={{
                        backgroundColor: "#2A0845",
                        color: "#D4AF37",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      {copiedTiming ? "✓ Timing Copied!" : "📋 Copy Schedule for Planner"}
                    </button>
                  </div>

                  {/* Calculator Inputs Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "28px" }}>
                    {/* Input 1: Ready-By Time */}
                    <div style={{ backgroundColor: "#FDFBF7", padding: "16px", borderRadius: "12px", border: "1px solid #E8D3C7" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4A3710", marginBottom: "8px" }}>
                        🎯 Photography / Ready-By Time
                      </label>
                      <input
                        type="time"
                        value={readyByTime}
                        onChange={(e) => setReadyByTime(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #D4AF37", fontSize: "16px", fontWeight: "700", color: "#2A0845" }}
                      />
                      <span style={{ fontSize: "11px", color: "#8C6D23", display: "block", marginTop: "4px" }}>
                        Target: {readyTimeString}
                      </span>
                    </div>

                    {/* Input 2: Bride Makeover Time */}
                    <div style={{ backgroundColor: "#FDFBF7", padding: "16px", borderRadius: "12px", border: "1px solid #E8D3C7" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4A3710", marginBottom: "8px" }}>
                        💄 Bride Styling Duration
                      </label>
                      <select
                        value={brideServiceMinutes}
                        onChange={(e) => setBrideServiceMinutes(Number(e.target.value))}
                        style={{ width: "100%", padding: "11px 12px", borderRadius: "8px", border: "1px solid #E8D3C7", fontSize: "14px", color: "#2A0845" }}
                      >
                        <option value={120}>2.0 Hours (HD Base + Simple Draping)</option>
                        <option value={150}>2.5 Hours (Airbrush + Heavy Poshak + Aad) [Recommended]</option>
                        <option value={180}>3.0 Hours (Full Royal Sabyasachi / Rajputi Masterpiece)</option>
                      </select>
                      <span style={{ fontSize: "11px", color: "#8C6D23", display: "block", marginTop: "4px" }}>
                        Includes dupatta pleating & jewelry setting
                      </span>
                    </div>

                    {/* Input 3: Family Members Styling */}
                    <div style={{ backgroundColor: "#FDFBF7", padding: "16px", borderRadius: "12px", border: "1px solid #E8D3C7" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4A3710", marginBottom: "8px" }}>
                        👨‍👩‍👧 Family & Guest Styling Count
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <select
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          style={{ flex: 1, padding: "11px 12px", borderRadius: "8px", border: "1px solid #E8D3C7", fontSize: "14px", color: "#2A0845" }}
                        >
                          <option value={0}>0 Guests (Bride Only)</option>
                          <option value={1}>1 Person (Mother of the Bride)</option>
                          <option value={2}>2 People (Mother + Sister)</option>
                          <option value={3}>3 People (Mother + 2 Sisters)</option>
                          <option value={4}>4 People (Family Draping Package)</option>
                        </select>
                      </div>
                      <span style={{ fontSize: "11px", color: "#8C6D23", display: "block", marginTop: "4px" }}>
                        Allotted: {guestCount * guestMinsEach} mins ({guestMinsEach} mins/person)
                      </span>
                    </div>

                    {/* Input 4: Transit & Safety Buffer */}
                    <div style={{ backgroundColor: "#FDFBF7", padding: "16px", borderRadius: "12px", border: "1px solid #E8D3C7" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4A3710", marginBottom: "8px" }}>
                        🚗 Travel & Emergency Buffer
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <select
                          value={transitMinutes}
                          onChange={(e) => setTransitMinutes(Number(e.target.value))}
                          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E8D3C7", fontSize: "12px" }}
                        >
                          <option value={20}>20m Transit (Local Hotel)</option>
                          <option value={35}>35m Transit (Palace Resort)</option>
                          <option value={60}>60m Transit (Outstation Fort)</option>
                        </select>
                        <select
                          value={safetyBufferMinutes}
                          onChange={(e) => setSafetyBufferMinutes(Number(e.target.value))}
                          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E8D3C7", fontSize: "12px" }}
                        >
                          <option value={15}>15m Buffer</option>
                          <option value={30}>30m Buffer (Recommended)</option>
                          <option value={45}>45m Buffer</option>
                        </select>
                      </div>
                      <span style={{ fontSize: "11px", color: "#8C6D23", display: "block", marginTop: "4px" }}>
                        Total Transit & Buffer: {transitMinutes + safetyBufferMinutes} mins
                      </span>
                    </div>
                  </div>

                  {/* Calculated Output Result Banner */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, #2A0845 0%, #3F1066 100%)",
                      borderRadius: "16px",
                      padding: "24px 28px",
                      color: "#FFFFFF",
                      border: "1.5px solid #D4AF37",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "12px", color: "#D4AF37", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px" }}>
                        CALCULATED ARRIVAL SCHEDULE
                      </div>
                      <div style={{ fontSize: "28px", fontWeight: "800", color: "#FDFBF7", marginTop: "4px" }}>
                        Artist Arrival at Suite: {arrivalTimeString}
                      </div>
                      <div style={{ fontSize: "14px", color: "#E8D3C7", marginTop: "4px" }}>
                        Studio Departure: <strong>{departureTimeString}</strong> • Total Prep Window: <strong>{totalHoursText}</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`👑 Makeovers by Prachi Timeline for 28 Nov 2026:
Target Ready-By: ${readyTimeString}
Artist Team Arrival at Suite: ${arrivalTimeString}
Total Duration: ${totalHoursText}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          backgroundColor: "#25D366",
                          color: "#FFFFFF",
                          padding: "12px 18px",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: "700",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        💬 WhatsApp to Planner
                      </a>
                    </div>
                  </div>
                </div>

                {/* Palace Suite Readiness 5-Point Checklist */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    padding: "32px",
                    boxShadow: "0 8px 24px rgba(42, 8, 69, 0.06)",
                    border: "1.5px solid #E8D3C7",
                  }}
                >
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "inline-block", padding: "4px 12px", backgroundColor: "#E6F4EA", color: "#137333", borderRadius: "12px", fontSize: "11px", fontWeight: "700", marginBottom: "8px" }}>
                      🏨 SUITE LOGISTICS AUDIT
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", margin: 0, color: "#2A0845" }}>
                      Heritage Palace Suite Readiness Checklist
                    </h3>
                    <p style={{ margin: "4px 0 0 0", color: "#8C6D23", fontSize: "14px" }}>
                      Please confirm these 5 room essentials with your hotel/palace reception 48 hours prior to prevent styling delays.
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { key: "sockets", title: "Two 15A/5A Electrical Sockets Near Mirror", desc: "Required for high-wattage airbrush compressor and styling hair tools." },
                      { key: "lighting", title: "Bright, Neutral White Mirror Lighting", desc: "Avoid yellow-only tungsten wall sconces which distort makeup undertones." },
                      { key: "ac", title: "Functional AC / Climate Control at 21°C - 22°C", desc: "Cool room temperature is vital to prevent perspiration during airbrush foundation base application." },
                      { key: "cleanSpace", title: "Clean Dressing Table Counter (Min. 4×2 ft)", desc: "Allows hygienic arrangement of sanitized makeup brushes and poshak jewellery sets." },
                      { key: "entryPass", title: "Hotel Security Gate Vehicle Clearance", desc: "Notify security guard of artist team arrival vehicle for direct parking access." },
                    ].map((item) => (
                      <div
                        key={item.key}
                        onClick={() => setSuiteChecklist({ ...suiteChecklist, [item.key]: !suiteChecklist[item.key] })}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "14px",
                          padding: "16px",
                          borderRadius: "10px",
                          backgroundColor: suiteChecklist[item.key] ? "#E6F4EA" : "#FDFBF7",
                          border: suiteChecklist[item.key] ? "1.5px solid #CEEAD6" : "1px solid #E8D3C7",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={suiteChecklist[item.key] || false}
                          onChange={() => {}}
                          style={{ marginTop: "4px", transform: "scale(1.2)" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: "700", color: suiteChecklist[item.key] ? "#137333" : "#2A0845" }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: "12px", color: suiteChecklist[item.key] ? "#4A3710" : "#8C6D23", marginTop: "2px" }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 90-Day Bridal Skincare & Wellness Countdown Card */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "16px",
                    padding: "32px",
                    boxShadow: "0 8px 24px rgba(42, 8, 69, 0.06)",
                    border: "1.5px solid #E8D3C7",
                  }}
                >
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "inline-block", padding: "4px 12px", backgroundColor: "#FDF4E3", color: "#8C6D23", borderRadius: "12px", fontSize: "11px", fontWeight: "700", marginBottom: "8px" }}>
                      🌿 PRE-WEDDING WELLNESS
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", margin: 0, color: "#2A0845" }}>
                      90-Day Bridal Beauty Roadmap
                    </h3>
                    <p style={{ margin: "4px 0 0 0", color: "#8C6D23", fontSize: "14px" }}>
                      Expert guidelines curated by Prachi for flawless bridal glow without last-minute skin reactions.
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                    <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#FDFBF7", border: "1px solid #E8D3C7" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "#8C6D23", textTransform: "uppercase" }}>T-90 to T-60 Days</span>
                      <h4 style={{ margin: "6px 0 6px 0", fontSize: "16px", color: "#2A0845" }}>Skin Hydration & Consultation</h4>
                      <p style={{ margin: 0, fontSize: "12px", color: "#4A3710", lineHeight: "1.5" }}>
                        Begin daily hyaluronic hydration routine, schedule salon patch tests, and drink 3 liters of water daily.
                      </p>
                    </div>

                    <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#FDFBF7", border: "1px solid #E8D3C7" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "#8C6D23", textTransform: "uppercase" }}>T-30 Days</span>
                      <h4 style={{ margin: "6px 0 6px 0", fontSize: "16px", color: "#2A0845" }}>In-Person Bridal Trial</h4>
                      <p style={{ margin: 0, fontSize: "12px", color: "#4A3710", lineHeight: "1.5" }}>
                        Attend studio trial session, finalize foundation undertone, and approve digital face chart formulation.
                      </p>
                    </div>

                    <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#FDE8E8", border: "1.5px solid #F98080" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "#C81E1E", textTransform: "uppercase" }}>⚠️ T-14 Days: PRODUCT FREEZE</span>
                      <h4 style={{ margin: "6px 0 6px 0", fontSize: "16px", color: "#9B1C1C" }}>Strict Skincare Freeze</h4>
                      <p style={{ margin: 0, fontSize: "12px", color: "#771D1D", lineHeight: "1.5" }}>
                        <strong>Do NOT introduce new chemical peels, retinol, or untested salon facials.</strong> Stick strictly to verified gentle products to avoid allergic flare-ups.
                      </p>
                    </div>

                    <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#E6F4EA", border: "1px solid #CEEAD6" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "#137333", textTransform: "uppercase" }}>T-1 Day</span>
                      <h4 style={{ margin: "6px 0 6px 0", fontSize: "16px", color: "#137333" }}>Night-Before Prep</h4>
                      <p style={{ margin: 0, fontSize: "12px", color: "#4A3710", lineHeight: "1.5" }}>
                        Wash and blow-dry hair cleanly without heavy oils. Apply gentle soothing sheet mask. Sleep 8 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ─────────────────────────────────────────────────────────────
              TAB 4: BRIDAL PREPARATION & INSPIRATION BOARD
          ─────────────────────────────────────────────────────────────── */}
          {activeTab === "prep" && (
            <div>
              {/* Preparation Checklist */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  padding: "24px 28px",
                  boxShadow: "0 8px 24px rgba(42, 8, 69, 0.06)",
                  border: "1.5px solid #E8D3C7",
                  marginBottom: "32px",
                }}
              >
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", margin: "0 0 16px 0", color: "#2A0845" }}>
                  Bridal Preparation Milestones
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                  <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#E6F4EA", border: "1px solid #CEEAD6" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#137333" }}>✓ 1. Skin & Allergies Form</div>
                    <div style={{ fontSize: "12px", color: "#4A3710", marginTop: "4px" }}>Sensitive skin noted (Latex-free lash glue assigned).</div>
                  </div>
                  <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#E6F4EA", border: "1px solid #CEEAD6" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#137333" }}>✓ 2. Patch Test Passed</div>
                    <div style={{ fontSize: "12px", color: "#4A3710", marginTop: "4px" }}>Verified no redness or allergy to HD base formulation.</div>
                  </div>
                  <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#FDF4E3", border: "1px solid #D4AF37" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#8C6D23" }}>⏳ 3. Bridal Trial Session</div>
                    <div style={{ fontSize: "12px", color: "#4A3710", marginTop: "4px" }}>Scheduled for 10 Nov at Jodhpur Heritage Studio.</div>
                  </div>
                  <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: "#FDFBF7", border: "1px solid #E8D3C7" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#2A0845" }}>📖 4. Wedding Day Guide</div>
                    <div style={{ fontSize: "12px", color: "#8C6D23", marginTop: "4px" }}>Wear front button-up blouse; wash hair previous night.</div>
                  </div>
                </div>
              </div>

              {/* Inspiration Board & Photo Uploader */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  padding: "28px",
                  boxShadow: "0 8px 24px rgba(42, 8, 69, 0.06)",
                  border: "1.5px solid #E8D3C7",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", margin: 0, color: "#2A0845" }}>
                      My Bridal Look Inspiration Board
                    </h3>
                    <p style={{ margin: "4px 0 0 0", color: "#8C6D23", fontSize: "14px" }}>
                      Upload photos of your wedding poshak, lehenga, jewellery (aad, maang tikka) for Prachi to customize your makeup undertone.
                    </p>
                  </div>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleAddInspiration} style={{ backgroundColor: "#FDFBF7", padding: "20px", borderRadius: "12px", border: "1px solid #E8D3C7", marginBottom: "28px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4A3710", marginBottom: "6px" }}>
                        Inspiration Title / Look Name
                      </label>
                      <input
                        type="text"
                        value={newInspTitle}
                        onChange={(e) => setNewInspTitle(e.target.value)}
                        placeholder="e.g. Sangeet Emerald Smoky Eyes"
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8D3C7", fontSize: "13px" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4A3710", marginBottom: "6px" }}>
                        Category
                      </label>
                      <select
                        value={newInspCategory}
                        onChange={(e) => setNewInspCategory(e.target.value as any)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8D3C7", fontSize: "13px" }}
                      >
                        <option value="POSHAK_LEHENGA">Royal Poshak / Lehenga</option>
                        <option value="JEWELLERY">Jewellery (Aad, Borla, Nath)</option>
                        <option value="MAKEUP_LOOK">Makeup & Hair Styling Reference</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4A3710", marginBottom: "6px" }}>
                      Notes for Prachi (Specific shades, flower preferences, drape style)
                    </label>
                    <input
                      type="text"
                      value={newInspNotes}
                      onChange={(e) => setNewInspNotes(e.target.value)}
                      placeholder="e.g. Please use matte peach lip shade; heavy dupatta needs double pin support."
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8D3C7", fontSize: "13px" }}
                    />
                  </div>

                  {/* DPDP Consent Checkbox */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
                    <input
                      type="checkbox"
                      id="dpdpCheck"
                      checked={dpdpConsent}
                      onChange={(e) => setDpdpConsent(e.target.checked)}
                      style={{ marginTop: "3px" }}
                    />
                    <label htmlFor="dpdpCheck" style={{ fontSize: "12px", color: "#4A3710", lineHeight: "1.4" }}>
                      <strong>DPDP Consent:</strong> I authorize Makeovers by Prachi to securely process my uploaded outfit and look reference photos solely for customized beauty shade formulation. Photos remain strictly confidential and will not be published publicly.
                    </label>
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#2A0845",
                      color: "#D4AF37",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontWeight: "700",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    + Add to Lookbook
                  </button>
                </form>

                {/* Inspiration Cards Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
                  {inspirationItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid #E8D3C7",
                        backgroundColor: "#FDFBF7",
                      }}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{ width: "100%", height: "200px", objectFit: "cover" }}
                      />
                      <div style={{ padding: "14px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#8C6D23", textTransform: "uppercase" }}>
                          {item.category.replace("_", " ")}
                        </span>
                        <h4 style={{ margin: "4px 0 8px 0", fontSize: "16px", color: "#2A0845" }}>
                          {item.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: "12px", color: "#4A3710", lineHeight: "1.5" }}>
                          {item.notes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 4: CONTRACT, CANCELLATION POLICIES & TERMS
          ─────────────────────────────────────────────────────────────── */}
          {activeTab === "documents" && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "0 8px 24px rgba(42, 8, 69, 0.06)",
                border: "1.5px solid #E8D3C7",
              }}
            >
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", margin: "0 0 16px 0", color: "#2A0845" }}>
                Makeovers by Prachi — Luxury Service Agreement
              </h3>
              <div style={{ fontSize: "13px", color: "#8C6D23", marginBottom: "24px" }}>
                Digitally accepted upon advance deposit on 24 Oct 2026 | Cryptographic Hash: <code>e8b4...91fa</code>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px", color: "#4A3710", lineHeight: "1.7" }}>
                <div style={{ backgroundColor: "#FDFBF7", padding: "16px", borderRadius: "10px", border: "1px solid #F0EAE1" }}>
                  <h4 style={{ margin: "0 0 6px 0", color: "#2A0845" }}>1. Date Lock & Exclusivity</h4>
                  <p style={{ margin: 0 }}>
                    Upon receipt of the advance lock deposit, your wedding date is dedicated to you. Prachi’s team will not accept concurrent conflicting bookings in the same geographic slot.
                  </p>
                </div>

                <div style={{ backgroundColor: "#FDFBF7", padding: "16px", borderRadius: "10px", border: "1px solid #F0EAE1" }}>
                  <h4 style={{ margin: "0 0 6px 0", color: "#2A0845" }}>2. Reschedule & Postponement Policy</h4>
                  <p style={{ margin: 0 }}>
                    Wedding dates may be rescheduled without penalty up to <strong>30 days prior</strong> to the function date, subject to calendar availability. Reschedules within 14 days may incur a 15% calendar realignment surcharge.
                  </p>
                </div>

                <div style={{ backgroundColor: "#FDFBF7", padding: "16px", borderRadius: "10px", border: "1px solid #F0EAE1" }}>
                  <h4 style={{ margin: "0 0 6px 0", color: "#2A0845" }}>3. Emergency Continuity & Standby Guarantee</h4>
                  <p style={{ margin: 0 }}>
                    In the extraordinary event of illness or unavoidable transit crisis affecting any artist, Makeovers by Prachi guarantees immediate deployment of an equivalent senior certified artist from our regional standby roster without disruption.
                  </p>
                </div>

                <div style={{ backgroundColor: "#FDFBF7", padding: "16px", borderRadius: "10px", border: "1px solid #F0EAE1" }}>
                  <h4 style={{ margin: "0 0 6px 0", color: "#2A0845" }}>4. Media Consent Options</h4>
                  <p style={{ margin: 0 }}>
                    You retain complete autonomy over your wedding photos. You can toggle between <em>Full Public Lookbook</em>, <em>Eyes & Hair Styling Only (No Full Face)</em>, or <em>Strictly Private</em> in your profile settings at any time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 6: HUGGING FACE AI BRIDAL ADVISOR
          ─────────────────────────────────────────────────────────────── */}
          {activeTab === "ai_advisor" && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "0 8px 24px rgba(42, 8, 69, 0.06)",
                border: "1.5px solid #E8D3C7",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#8C6D23", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Automated Beauty Science Engine
                  </span>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", margin: "4px 0 6px 0", color: "#2A0845" }}>
                    Hugging Face AI Bridal Skincare & Hair Consultant
                  </h3>
                  <p style={{ fontSize: "14px", color: "#4A3710", margin: 0 }}>
                    Instant scientific consultation on pre-wedding treatments, Rajasthani dry-climate hydration, and day-of styling prep.
                  </p>
                </div>
                <div style={{ backgroundColor: "#FDFBF7", padding: "8px 14px", borderRadius: "10px", border: "1px solid #D4AF37", fontSize: "12px", color: "#4A3710" }}>
                  ⚡ Free Hugging Face Open Inference (Qwen 2.5)
                </div>
              </div>

              {/* Quick Questions Carousel */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4A3710", marginBottom: "8px" }}>
                  💡 Frequently Asked Bridal Inquiries (Click to Ask AI)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {[
                    "48-Hour Emergency Skincare & Breakout Protocol",
                    "Can I do a hydra-facial or laser 5 days before the wedding?",
                    "How to keep heavy Rajputi poshak dupatta secure without hair strain?",
                    "Sweat-proofing techniques for heritage palace warm evening pheras",
                    "What should I do if my skin breaks out in dry Jodhpur heat?",
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAiQuestion(preset);
                        setAiCustomPrompt(preset);
                        handleGetAiAdvice(preset);
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "20px",
                        border: "1px solid #E8D3C7",
                        backgroundColor: aiCustomPrompt === preset ? "#2A0845" : "#FDFBF7",
                        color: aiCustomPrompt === preset ? "#D4AF37" : "#4A3710",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Type & Custom Input Form */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4A3710", marginBottom: "6px" }}>
                    Your Skin Type / Concern
                  </label>
                  <select
                    value={aiSkinType}
                    onChange={(e) => setAiSkinType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E8D3C7",
                      fontSize: "14px",
                      color: "#2A0845",
                    }}
                  >
                    <option value="Combination / Sensitive">Combination / Sensitive (Prone to redness)</option>
                    <option value="Dry / Dehydrated">Dry / Dehydrated (Desert climate Rajasthan)</option>
                    <option value="Oily / Acne-Prone">Oily / Acne-Prone (Need sweat-proof mattification)</option>
                    <option value="Normal / Balanced">Normal / Balanced</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#4A3710", marginBottom: "6px" }}>
                    Custom Question or Concern
                  </label>
                  <input
                    type="text"
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="e.g. Which hair styling holds best with an 800g Maang Tikka?"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #E8D3C7",
                      fontSize: "14px",
                      color: "#2A0845",
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isAiLoading}
                onClick={() => handleGetAiAdvice()}
                style={{
                  padding: "12px 28px",
                  backgroundColor: isAiLoading ? "#8C6D23" : "#2A0845",
                  color: "#D4AF37",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: isAiLoading ? "wait" : "pointer",
                  boxShadow: "0 4px 14px rgba(42, 8, 69, 0.2)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "24px",
                }}
              >
                {isAiLoading ? "Consulting Hugging Face AI..." : "⚡ Generate AI Protocol"}
              </button>

              {/* AI Response Card */}
              {isAiLoading && (
                <div style={{ padding: "24px", backgroundColor: "#FDFBF7", borderRadius: "12px", border: "1px dashed #D4AF37", textAlign: "center" }}>
                  <p style={{ color: "#8C6D23", fontSize: "14px", margin: 0 }}>
                    🧠 Hugging Face AI is formulating your bridal protocol using dermatological contraindications and Rajasthan climate data...
                  </p>
                </div>
              )}

              {aiResponse && !isAiLoading && (
                <div
                  style={{
                    backgroundColor: "#FDFBF7",
                    borderRadius: "12px",
                    padding: "24px",
                    border: "1.5px solid #D4AF37",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #E8D3C7", paddingBottom: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#8C6D23", textTransform: "uppercase" }}>
                      👑 Prachi Certified AI Consultation Note
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(aiResponse)}
                      style={{ padding: "4px 10px", fontSize: "11px", backgroundColor: "#2A0845", color: "#D4AF37", borderRadius: "6px", border: "none", cursor: "pointer" }}
                    >
                      Copy Note
                    </button>
                  </div>
                  <div style={{ whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.7", color: "#2A0845" }}>
                    {aiResponse}
                  </div>
                  <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #E8D3C7", fontSize: "11px", color: "#8C6D23" }}>
                    🔒 <em>Note: This automated guidance is tailored to your booking profile. If you have medical skin conditions, please consult your physician.</em>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              RESCHEDULE MODAL
          ─────────────────────────────────────────────────────────────── */}
          {rescheduleModalOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(42, 8, 69, 0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 2000,
                padding: "20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "16px",
                  padding: "32px",
                  maxWidth: "500px",
                  width: "100%",
                  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
                  border: "1px solid #D4AF37",
                }}
              >
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", margin: "0 0 10px 0", color: "#2A0845" }}>
                  Request Date Reschedule
                </h3>
                <p style={{ fontSize: "13px", color: "#8C6D23", margin: "0 0 20px 0" }}>
                  Booking Ref #{bookingId}. Please state the new intended date and reason.
                </p>

                {rescheduleSuccess ? (
                  <div style={{ padding: "16px", backgroundColor: "#E6F4EA", color: "#137333", borderRadius: "10px", fontSize: "14px", lineHeight: "1.5" }}>
                    {rescheduleSuccess}
                  </div>
                ) : (
                  <form onSubmit={handleRescheduleSubmit}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4A3710", marginBottom: "6px" }}>
                      New Target Wedding Date
                    </label>
                    <input
                      type="date"
                      required
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8D3C7", marginBottom: "16px" }}
                    />

                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#4A3710", marginBottom: "6px" }}>
                      Reason for Date Shift
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      placeholder="e.g. Family astrologer changed muhurat timing / venue changed"
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #E8D3C7", fontSize: "13px", marginBottom: "20px" }}
                    />

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                      <button
                        type="button"
                        onClick={() => setRescheduleModalOpen(false)}
                        style={{ padding: "10px 18px", background: "none", border: "1px solid #8C6D23", color: "#8C6D23", borderRadius: "8px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ padding: "10px 22px", backgroundColor: "#2A0845", color: "#D4AF37", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
