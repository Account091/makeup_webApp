"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Phone,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  step?: number;
  source?: string;
  chips?: string[];
  showDatePicker?: boolean;
  packageSelection?: boolean;
  otpCard?: boolean;
  summaryCard?: {
    clientName: string;
    phone: string;
    eventDate: string;
    city: string;
    packageName: string;
    guestCount: number;
    totalEstimated: number;
    depositRequired: number;
  };
  paymentCard?: {
    bookingId: string;
    depositRequired: number;
    qrCodeUrl: string;
    upiUrl: string;
    expiresAt: string;
  };
}

interface SafeBookingAssistantProps {
  initialPrompt?: string;
  isOpenDefault?: boolean;
}

export const SafeBookingAssistant: React.FC<SafeBookingAssistantProps> = ({
  initialPrompt = "",
  isOpenDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [lang, setLang] = useState<"en" | "hi" | "hinglish">("hinglish");
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [conversationId] = useState(`conv_${Date.now()}`);

  // Booking Flow State
  const [bookingState, setBookingState] = useState<{
    eventDate?: string;
    city?: string;
    packageId?: string;
    packageName?: string;
    guestCount?: number;
    clientName?: string;
    phone?: string;
    otpSent?: boolean;
    otpVerified?: boolean;
    otpInput?: string;
    provisionalHoldId?: string;
  }>({
    city: "Jodhpur",
    guestCount: 0,
  });

  // Voice Input State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "assistant",
      text:
        "Namaste! ✨ Welcome to Makeovers by Prachi. I am your verified AI Booking Concierge.\n\nMain aapki wedding date availability check karne aur Rajputi bridal packages explore karne mein help kar sakti hoon.\n\nAapki wedding date aur city kya hai?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      step: 1,
      source: "Official Flagship Concierge Rules",
      chips: ["Check Dec 2026 in Jodhpur", "12 Dec 2026, Jaipur", "See Rajputi Packages", "Talk on WhatsApp"],
      showDatePicker: true,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  useEffect(() => {
    if (initialPrompt && !isOpen) {
      setIsOpen(true);
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Text to Speech
  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ""));
      utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS Error:", e);
    }
  };

  // Voice Input via Web Speech API
  const startVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use the text input below.");
      return;
    }

    try {
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setVoiceTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Microphone access error:", err);
      setIsRecording(false);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setVoiceTranscript(null);
    setLoading(true);

    try {
      const lower = textToSend.toLowerCase();

      // Rule 1: Medical / Skin query check
      if (
        lower.includes("acne") ||
        lower.includes("steroid") ||
        lower.includes("allergy") ||
        lower.includes("sensitive skin") ||
        lower.includes("retinol")
      ) {
        const res = await fetch("/api/ai/booking-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "query_grounded_knowledge",
            payload: { query: textToSend },
            conversationId,
          }),
        });
        const data = await res.json();

        addAssistantMessage(
          `Hum medical prescriptions ya clinical treatments advise nahi karte. Sensitive aur reactive skin ke liye hum sabhi brides ke liye wedding se 3–4 weeks pehle ek customized patch test aur consultation conduct karte hain.\n\nHum strictly international hypoallergenic cosmetics (Dior, Charlotte Tilbury, NARS, MAC Pro) use karte hain.`,
          {
            source: "Safety: Hypoallergenic & Patch Test Protocol",
            chips: ["Check Bridal Packages", "Talk on WhatsApp", "Book Consultation"],
          }
        );
        setLoading(false);
        return;
      }

      // Rule 2: Booking Availability Check
      if (
        lower.includes("check") ||
        lower.includes("date") ||
        lower.includes("december") ||
        lower.includes("november") ||
        lower.includes("2026") ||
        lower.includes("jodhpur") ||
        lower.includes("jaipur") ||
        lower.includes("udaipur")
      ) {
        // Extract or default date
        const dateMatch = textToSend.match(/202[4-9]-\d{2}-\d{2}/) || textToSend.match(/\d{1,2}\s+(dec|nov|jan|feb|mar|oct)\w*/i);
        const cityMatch = lower.includes("jaipur")
          ? "Jaipur"
          : lower.includes("udaipur")
          ? "Udaipur"
          : lower.includes("jaisalmer")
          ? "Jaisalmer"
          : "Jodhpur";

        const targetDate = dateMatch ? (dateMatch[0].length === 10 ? dateMatch[0] : "2026-12-12") : "2026-12-12";

        const res = await fetch("/api/ai/booking-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "check_availability",
            payload: { eventDate: targetDate, city: cityMatch },
            conversationId,
          }),
        });
        const data = await res.json();

        if (data.available) {
          setBookingState((prev) => ({ ...prev, eventDate: targetDate, city: cityMatch }));
          setCurrentStep(2);
          addAssistantMessage(
            `✨ Great news! Date **${targetDate}** is **AVAILABLE** in **${cityMatch}** with Prachi's Senior Bridal Artistry Team!\n\nAap kis package mein interested hain?\n\n1. **The Royal Rajputi Heritage Signature** (₹45,000) — Traditional poshak draping, Borla/Aad setting & 16-hr sweat-proof HD.\n2. **Palace Luxury HD Bridal** (₹35,000) — Dewy glass-skin, dupatta setting & floral styling.\n3. **Pre-Wedding & Engagement Glam** (₹18,000).\n\nKitne family members ya bridesmaids ke liye makeup required hai?`,
            {
              step: 2,
              source: "Live Calendar Check: Firestore asia-south1",
              chips: ["Royal Rajputi Signature", "Palace Luxury HD", "Bride Only (0 Guests)", "Bride + 3 Family Members"],
              packageSelection: true,
            }
          );
        } else {
          addAssistantMessage(
            `Selected date **${targetDate}** in **${cityMatch}** par already ek priority booking reservation hai.\n\nAlternatives:\n• Adjacent day morning slot\n• Associate Senior Artist option\n• Connect directly with Prachi on WhatsApp for waitlist.`,
            {
              source: "Calendar Conflict Manager",
              chips: ["Try Adjacent Date (13 Dec)", "Talk to Prachi on WhatsApp"],
            }
          );
        }
        setLoading(false);
        return;
      }

      // Rule 3: Package Selection & Quote Calculation
      if (
        lower.includes("royal") ||
        lower.includes("signature") ||
        lower.includes("palace") ||
        lower.includes("engagement") ||
        lower.includes("package")
      ) {
        let pkgId = "royal_rajputi_signature";
        if (lower.includes("palace")) pkgId = "palace_luxury_hd";
        if (lower.includes("engagement")) pkgId = "contemporary_glam";

        let guests = bookingState.guestCount || 0;
        if (lower.includes("3")) guests = 3;
        if (lower.includes("2")) guests = 2;
        if (lower.includes("4")) guests = 4;

        const res = await fetch("/api/ai/booking-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get_quote",
            payload: {
              eventDate: bookingState.eventDate || "2026-12-12",
              city: bookingState.city || "Jodhpur",
              packageId: pkgId,
              guestCount: guests,
            },
            conversationId,
          }),
        });
        const data = await res.json();
        const q = data.quote;

        setBookingState((prev) => ({
          ...prev,
          packageId: pkgId,
          packageName: q.packageName,
          guestCount: guests,
        }));
        setCurrentStep(3);

        addAssistantMessage(
          `Official verified quote calculated by our pricing engine:\n\n• **${q.packageName}**: ₹${q.packageBasePrice.toLocaleString()}\n• **Guest Artistry (${q.guestCount} pax)**: ₹${q.guestTotal.toLocaleString()}\n• **Travel & Logistics (${q.city})**: ₹${q.travelFee.toLocaleString()}\n• **Total Estimated**: ₹${q.totalEstimated.toLocaleString()}\n• **25% Advance to Hold Date**: **₹${q.depositRequired.toLocaleString()}**\n\nDate ko provisional hold karne ke liye please apna **Full Name** aur **WhatsApp Mobile Number** share karein.`,
          {
            step: 3,
            source: "Pricing Engine Rules (Single Source of Truth)",
            chips: ["Enter Details Below", "Modify City", "Ask Cancellation Policy"],
          }
        );
        setLoading(false);
        return;
      }

      // Rule 4: Phone & Name Input -> Send OTP
      const phoneExtract = textToSend.match(/(\+91|0)?[6-9]\d{9}/);
      if (phoneExtract) {
        const rawPhone = phoneExtract[0];
        const clientNameGuess = textToSend.replace(rawPhone, "").replace(/my name is|i am|mera naam/gi, "").trim() || "Bride-to-be";

        const res = await fetch("/api/ai/booking-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send_otp",
            payload: { phone: rawPhone },
            conversationId,
          }),
        });
        const data = await res.json();

        setBookingState((prev) => ({
          ...prev,
          phone: rawPhone,
          clientName: clientNameGuess,
          otpSent: true,
        }));
        setCurrentStep(4);

        addAssistantMessage(
          `Thank you, **${clientNameGuess}** ji! Calendar spam bots aur duplicate locks prevent karne ke liye humne aapke number **${data.phoneMasked}** par ek 4-digit verification code bheja hai.\n\n*(Demo Sandbox Hint: Enter **${data.devCodeHint || "8421"}** below)*`,
          {
            step: 4,
            source: "Security Gateway: OTP Rate Limiter",
            otpCard: true,
          }
        );
        setLoading(false);
        return;
      }

      // Rule 5: Fallback Knowledge Query
      const res = await fetch("/api/ai/booking-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "query_grounded_knowledge",
          payload: { query: textToSend },
          conversationId,
        }),
      });
      const data = await res.json();

      if (data.success && data.answer) {
        addAssistantMessage(data.answer, {
          source: data.source || "Official Website Content",
          chips: ["Check my date", "See packages & prices", "Talk on WhatsApp"],
        });
      } else {
        addAssistantMessage(
          "I don't have that specific policy verified in our knowledge base. Would you like me to connect you directly with Prachi's team on WhatsApp?",
          {
            source: "Zero-Hallucination Safe Fallback",
            chips: ["Connect on WhatsApp", "Check Date Availability", "View Rates"],
          }
        );
      }
    } catch (err) {
      console.error("AI Assistant Turn Error:", err);
      addAssistantMessage("Connection glitch. You can directly chat with Prachi's studio team on WhatsApp at +91 98290 12345.", {
        source: "Fail-safe WhatsApp Fallback",
        chips: ["Open WhatsApp (+91 98290 12345)"],
      });
    } finally {
      setLoading(false);
    }
  };

  const addAssistantMessage = (text: string, options: Partial<Message> = {}) => {
    const newMsg: Message = {
      id: `ast_${Date.now()}`,
      sender: "assistant",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ...options,
    };
    setMessages((prev) => [...prev, newMsg]);
    speakText(text);
  };

  // OTP Verification Handler
  const handleVerifyOtp = async (code: string) => {
    if (!code || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/ai/booking-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_otp",
          payload: { phone: bookingState.phone, otp: code },
          conversationId,
        }),
      });
      const data = await res.json();

      if (data.verified) {
        setBookingState((prev) => ({ ...prev, otpVerified: true }));
        setCurrentStep(5);

        // Fetch quote data to generate exact summary
        const pkgId = bookingState.packageId || "royal_rajputi_signature";
        const quoteRes = await fetch("/api/ai/booking-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get_quote",
            payload: {
              eventDate: bookingState.eventDate || "2026-12-12",
              city: bookingState.city || "Jodhpur",
              packageId: pkgId,
              guestCount: bookingState.guestCount || 0,
            },
            conversationId,
          }),
        });
        const quoteData = await quoteRes.json();
        const q = quoteData.quote;

        addAssistantMessage(
          `Phone verified successfully! ✅\n\nHere is your verified booking summary. Please review and tap **"Yes, Lock My Date & Pay Deposit"** to generate your 15-minute provisional reservation hold.`,
          {
            step: 5,
            source: "Verified Security Token",
            summaryCard: {
              clientName: bookingState.clientName || "Bride-to-be",
              phone: bookingState.phone || "+91 98290 12345",
              eventDate: bookingState.eventDate || "2026-12-12",
              city: bookingState.city || "Jodhpur",
              packageName: q.packageName,
              guestCount: bookingState.guestCount || 0,
              totalEstimated: q.totalEstimated,
              depositRequired: q.depositRequired,
            },
          }
        );
      } else {
        alert(data.error || "Incorrect OTP. Try entering 8421 or 1234.");
      }
    } catch (e) {
      console.error("OTP verification error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Final Explicit Tap: Create Provisional Hold
  const handleCreateHold = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/booking-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_provisional_hold",
          payload: {
            clientName: bookingState.clientName || "Bride-to-be",
            phone: bookingState.phone || "+91 98290 12345",
            eventDate: bookingState.eventDate || "2026-12-12",
            city: bookingState.city || "Jodhpur",
            packageId: bookingState.packageId || "royal_rajputi_signature",
            guestCount: bookingState.guestCount || 0,
          },
          conversationId,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setBookingState((prev) => ({ ...prev, provisionalHoldId: data.bookingId }));
        addAssistantMessage(
          `🎉 Provisional Reservation **${data.bookingId}** Created!\n\nYour wedding date **${bookingState.eventDate}** is held for **15 minutes** while deposit verification completes. Please scan the UPI QR code below or open the secure gateway.`,
          {
            source: "Server Hold: 15-Minute Expiry Engine",
            paymentCard: {
              bookingId: data.bookingId,
              depositRequired: data.summary.depositRequired,
              qrCodeUrl: data.payment.qrCodeUrl,
              upiUrl: data.payment.upiUrl,
              expiresAt: data.holdExpiresAt,
            },
          }
        );
      }
    } catch (err) {
      console.error("Hold creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 1. QUIET FLOATING BUTTON (Bottom-Right Corner) */}
      {!isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Subtle one-line prompt badge */}
          <div
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: "rgba(42, 8, 69, 0.95)",
              color: "#FDFBF7",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              border: "1px solid rgba(212, 175, 55, 0.5)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <Sparkles size={14} style={{ color: "#D4AF37" }} />
            <span>Ask me anything or book by voice</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Booking Assistant"
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #E6CA65 0%, #D4AF37 50%, #997B1E 100%)",
              color: "#2A0845",
              border: "2px solid #FDFBF7",
              boxShadow: "0 8px 25px rgba(212, 175, 55, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
          >
            <Sparkles size={26} />
          </button>
        </div>
      )}

      {/* 2. CHAT PANEL (Mobile-friendly, Thumb-Reachable) */}
      {isOpen && (
        <aside
          aria-label="AI Booking Concierge"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "clamp(12px, 3vw, 24px)",
            width: "clamp(320px, 94vw, 440px)",
            height: "clamp(540px, 82vh, 720px)",
            backgroundColor: "#FDFBF7",
            borderRadius: "24px",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
            border: "1.5px solid rgba(212, 175, 55, 0.45)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000,
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#2A0845",
              color: "#FFFFFF",
              padding: "16px 18px",
              borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(212, 175, 55, 0.2)",
                    border: "1px solid #D4AF37",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#D4AF37",
                    fontSize: "18px",
                  }}
                >
                  👑
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", fontFamily: "'Playfair Display', serif", color: "#D4AF37" }}>
                    Makeovers by Prachi
                  </h3>
                  <div style={{ fontSize: "11px", color: "#E8D3C7", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#48BB78" }} />
                    AI Booking Concierge • Rules First
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* TTS Toggle */}
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  title={ttsEnabled ? "Voice replies enabled" : "Voice replies muted"}
                  style={{
                    background: "none",
                    border: "none",
                    color: ttsEnabled ? "#D4AF37" : "#A0AEC0",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#E8D3C7",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Sub-bar: Always visible "Talk to a person" & Language Switcher */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
              <a
                href="https://wa.me/919829012345?text=Hi%20Prachi%2C%20I%20want%20to%20talk%20to%20a%20human%20about%20bridal%20makeup."
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#68D391",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: "600",
                }}
              >
                <MessageCircle size={13} />
                <span>Talk to Prachi's Team on WhatsApp</span>
              </a>

              <div style={{ display: "flex", gap: "6px", color: "#E8D3C7" }}>
                <span
                  onClick={() => setLang("en")}
                  style={{ cursor: "pointer", fontWeight: lang === "en" ? "bold" : "normal", color: lang === "en" ? "#D4AF37" : "#E8D3C7" }}
                >
                  EN
                </span>
                |
                <span
                  onClick={() => setLang("hi")}
                  style={{ cursor: "pointer", fontWeight: lang === "hi" ? "bold" : "normal", color: lang === "hi" ? "#D4AF37" : "#E8D3C7" }}
                >
                  हिन्दी
                </span>
                |
                <span
                  onClick={() => setLang("hinglish")}
                  style={{
                    cursor: "pointer",
                    fontWeight: lang === "hinglish" ? "bold" : "normal",
                    color: lang === "hinglish" ? "#D4AF37" : "#E8D3C7",
                  }}
                >
                  Hinglish
                </span>
              </div>
            </div>

            {/* Progress Hint */}
            <div style={{ fontSize: "11px", color: "#D4AF37", fontWeight: "600" }}>
              Step {currentStep} of 5:{" "}
              {currentStep === 1
                ? "Wedding Date & City"
                : currentStep === 2
                ? "Artistry Package & Guests"
                : currentStep === 3
                ? "Quote Review"
                : currentStep === 4
                ? "OTP Phone Verification"
                : "Provisional 15-Min Hold"}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              backgroundColor: "#FDFBF7",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: m.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    backgroundColor: m.sender === "user" ? "#2A0845" : "#FFFFFF",
                    color: m.sender === "user" ? "#FFFFFF" : "#2A0845",
                    border: m.sender === "user" ? "none" : "1px solid #E5E0D8",
                    fontSize: "13.5px",
                    lineHeight: "1.55",
                    whiteSpace: "pre-line",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  {m.text}
                </div>

                {/* Grounded Source Badge */}
                {m.source && (
                  <div style={{ fontSize: "10.5px", color: "#8C6D23", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ShieldCheck size={12} />
                    <span>{m.source}</span>
                  </div>
                )}

                {/* Inline Date Picker (Step 1) */}
                {m.showDatePicker && (
                  <div
                    style={{
                      marginTop: "6px",
                      backgroundColor: "#FFFFFF",
                      padding: "12px",
                      borderRadius: "14px",
                      border: "1px solid #E5E0D8",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "#2A0845", marginBottom: "6px" }}>
                      📅 Select Your Wedding Date:
                    </div>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSendMessage(`I want to check date ${e.target.value} in Jodhpur`);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #D4AF37",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                )}

                {/* OTP Verification Card (Step 4) */}
                {m.otpCard && !bookingState.otpVerified && (
                  <div
                    style={{
                      marginTop: "8px",
                      backgroundColor: "#FFFFFF",
                      padding: "14px",
                      borderRadius: "14px",
                      border: "1.5px solid #D4AF37",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: "#2A0845", marginBottom: "8px" }}>
                      🔒 Enter 4-Digit SMS / WhatsApp Code:
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 8421"
                        value={bookingState.otpInput || ""}
                        onChange={(e) => setBookingState((prev) => ({ ...prev, otpInput: e.target.value }))}
                        style={{
                          width: "100px",
                          textAlign: "center",
                          fontSize: "18px",
                          fontWeight: "bold",
                          letterSpacing: "4px",
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1.5px solid #2A0845",
                        }}
                      />
                      <button
                        onClick={() => handleVerifyOtp(bookingState.otpInput || "")}
                        style={{
                          flex: 1,
                          backgroundColor: "#2A0845",
                          color: "#D4AF37",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        Verify Code
                      </button>
                    </div>
                  </div>
                )}

                {/* Explicit Summary Confirmation Tap Card (Step 5) */}
                {m.summaryCard && !bookingState.provisionalHoldId && (
                  <div
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#FFFFFF",
                      padding: "16px",
                      borderRadius: "16px",
                      border: "1.5px solid #D4AF37",
                      boxShadow: "0 6px 18px rgba(212, 175, 55, 0.2)",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#2A0845", marginBottom: "10px" }}>
                      📋 Booking Summary to Lock:
                    </div>
                    <div style={{ fontSize: "12px", color: "#4A3710", lineHeight: "1.6", marginBottom: "14px" }}>
                      <div>
                        <strong>Bride:</strong> {m.summaryCard.clientName} ({m.summaryCard.phone})
                      </div>
                      <div>
                        <strong>Event Date:</strong> {m.summaryCard.eventDate} ({m.summaryCard.city})
                      </div>
                      <div>
                        <strong>Selected:</strong> {m.summaryCard.packageName}
                      </div>
                      <div>
                        <strong>Guest Artistry:</strong> {m.summaryCard.guestCount} pax
                      </div>
                      <div>
                        <strong>Total:</strong> ₹{m.summaryCard.totalEstimated.toLocaleString()}
                      </div>
                      <div style={{ color: "#2A0845", fontSize: "13px", marginTop: "4px" }}>
                        <strong>25% Deposit Required:</strong>{" "}
                        <span style={{ color: "#D4AF37", fontWeight: "bold" }}>
                          ₹{m.summaryCard.depositRequired.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCreateHold}
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #E6CA65 0%, #D4AF37 50%, #997B1E 100%)",
                        color: "#2A0845",
                        border: "none",
                        fontWeight: "700",
                        fontSize: "13.5px",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(212, 175, 55, 0.35)",
                      }}
                    >
                      🔒 Yes, Lock My Date & Pay ₹{m.summaryCard.depositRequired.toLocaleString()}
                    </button>
                  </div>
                )}

                {/* 15-Minute Payment Card */}
                {m.paymentCard && (
                  <div
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#FFFFFF",
                      padding: "16px",
                      borderRadius: "16px",
                      border: "2px solid #D4AF37",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", color: "#C53030", fontWeight: "bold", fontSize: "13px" }}>
                      <Clock size={16} />
                      <span>15-Minute Calendar Hold Active</span>
                    </div>

                    <div style={{ margin: "14px auto", maxWidth: "160px" }}>
                      <img
                        src={m.paymentCard.qrCodeUrl}
                        alt="UPI Payment QR"
                        style={{ width: "100%", borderRadius: "8px", border: "1px solid #E5E0D8" }}
                      />
                    </div>

                    <p style={{ fontSize: "12px", color: "#4A3710", margin: "0 0 10px 0" }}>
                      Scan UPI QR with Google Pay / PhonePe / Paytm to deposit ₹{m.paymentCard.depositRequired.toLocaleString()}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <a
                        href={m.paymentCard.upiUrl}
                        style={{
                          backgroundColor: "#2A0845",
                          color: "#D4AF37",
                          padding: "10px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        Open UPI App Directly
                      </a>
                      <a
                        href={`https://wa.me/919829012345?text=I%20have%20initiated%20deposit%20for%20hold%20${m.paymentCard.bookingId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          border: "1px solid #25D366",
                          color: "#25D366",
                          padding: "8px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontSize: "11px",
                          fontWeight: "bold",
                        }}
                      >
                        Share Payment Screenshot on WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                {/* Quick Reply Chips */}
                {m.chips && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                    {m.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        style={{
                          backgroundColor: "rgba(212, 175, 55, 0.12)",
                          border: "1px solid rgba(212, 175, 55, 0.5)",
                          color: "#4A3710",
                          borderRadius: "14px",
                          padding: "5px 10px",
                          fontSize: "11.5px",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px", color: "#8C6D23", fontSize: "12px" }}>
                <RefreshCw size={14} className="animate-spin" />
                <span>Checking verified server rules...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice Transcript Review Card (Before Sending) */}
          {voiceTranscript !== null && (
            <div
              style={{
                backgroundColor: "rgba(212, 175, 55, 0.15)",
                borderTop: "1px solid #D4AF37",
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#2A0845", display: "flex", justifyContent: "space-between" }}>
                <span>🎙️ Spoken Transcript (Review & Edit):</span>
                <span onClick={() => setVoiceTranscript(null)} style={{ cursor: "pointer", color: "#C53030" }}>
                  Cancel
                </span>
              </div>
              <input
                type="text"
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid #2A0845",
                  fontSize: "13px",
                }}
              />
              <button
                onClick={() => handleSendMessage(voiceTranscript)}
                style={{
                  alignSelf: "flex-end",
                  backgroundColor: "#2A0845",
                  color: "#D4AF37",
                  border: "none",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Send Transcript →
              </button>
            </div>
          )}

          {/* Privacy Consent Notice */}
          <div
            style={{
              padding: "4px 14px",
              backgroundColor: "#FAF7F2",
              fontSize: "10px",
              color: "#6E6359",
              borderTop: "1px solid #E5E0D8",
              textAlign: "center",
            }}
          >
            🔒 Prices & availability are server-authoritative. Voice & phone data is masked for privacy.
          </div>

          {/* Input Box & Voice Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            style={{
              padding: "10px 12px",
              backgroundColor: "#FFFFFF",
              borderTop: "1px solid #E5E0D8",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {/* Mic Button */}
            <button
              type="button"
              onClick={startVoiceInput}
              title={isRecording ? "Listening..." : "Tap to speak in Hindi or English"}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: isRecording ? "#C53030" : "rgba(212, 175, 55, 0.15)",
                color: isRecording ? "#FFFFFF" : "#2A0845",
                border: "1px solid #D4AF37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              placeholder={lang === "hi" ? "शादी की तारीख या पैकेज पूछें..." : "Ask dates, packages, or policies..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "20px",
                border: "1px solid #E5E0D8",
                fontSize: "13px",
                outline: "none",
                backgroundColor: "#FDFBF7",
              }}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: inputText.trim() ? "#2A0845" : "#E2E8F0",
                color: inputText.trim() ? "#D4AF37" : "#A0AEC0",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: inputText.trim() ? "pointer" : "default",
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </aside>
      )}
    </>
  );
};
