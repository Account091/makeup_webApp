"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, RefreshCw, UserCheck, Phone, ShieldCheck, Minimize2 } from "lucide-react";
import { askBeautyConcierge, ConciergeResponseData } from "../../lib/ai/concierge-client";
import { ChatMessage } from "./ChatMessage";
import { ConciergeSuggestions } from "./ConciergeSuggestions";

export interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  recommendations?: string[];
  requiresHumanAction?: boolean;
  actionType?: string | null;
  timestamp: string;
}

export interface BeautyConciergeProps {
  isFloating?: boolean;
  initialPhone?: string;
  onClose?: () => void;
}

export const BeautyConcierge: React.FC<BeautyConciergeProps> = ({
  isFloating = false,
  initialPhone = "",
  onClose,
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome_msg",
      role: "assistant",
      content:
        "Namaste! ✨ I'm your AI Beauty Concierge at Makeovers by Prachi. How may I assist with your bridal makeover, package details, travel inquiry, or booking status today?",
      sources: ["policy:general-concierge"],
      recommendations: [
        "Bridal packages & pricing",
        "Check my booking status",
        "Jaipur travel policy",
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState(initialPhone);
  const [showPhoneInput, setShowPhoneInput] = useState(!initialPhone);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt.trim();
    if (!textToSend || loading) return;

    setErrorMsg(null);
    const userTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMessageItem: MessageItem = {
      id: `user_${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: userTimestamp,
    };

    setMessages((prev) => [...prev, userMessageItem]);
    if (!customPrompt) setInputPrompt("");
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res: ConciergeResponseData = await askBeautyConcierge({
        userPrompt: textToSend,
        authPayload: {
          phone: customerPhone.trim() || undefined,
          uid: customerPhone.trim() || "guest_user",
        },
        chatHistory: historyPayload,
      });

      const assistantTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const assistantMessageItem: MessageItem = {
        id: `ast_${Date.now()}`,
        role: "assistant",
        content: res.answer,
        sources: res.sources || [],
        recommendations: res.recommendations || [],
        requiresHumanAction: res.requiresHumanAction || false,
        actionType: res.actionType || null,
        timestamp: assistantTimestamp,
      };

      setMessages((prev) => [...prev, assistantMessageItem]);
    } catch (err: any) {
      console.error("[BeautyConcierge] API call failed:", err);
      setErrorMsg(err.message || "Failed to communicate with Beauty Concierge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleActionTrigger = (actionType: string) => {
    if (actionType === "RESCHEDULE_REQUEST") {
      window.location.href = "/track?action=reschedule";
    } else {
      window.location.href = "/track";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: isFloating ? "640px" : "100%",
        width: "100%",
        maxWidth: isFloating ? "680px" : "1000px",
        maxHeight: isFloating ? "82vh" : "800px",
        margin: "0 auto",
        background: "rgba(10, 10, 14, 0.94)",
        border: "1px solid rgba(212, 175, 55, 0.4)",
        borderRadius: "24px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.2)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          padding: "16px 20px",
          background: "linear-gradient(90deg, rgba(20, 20, 26, 0.95) 0%, rgba(35, 30, 18, 0.95) 100%)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(212, 175, 55, 0.5)",
            }}
          >
            <Sparkles size={20} style={{ color: "#000" }} />
          </div>
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#F3E5AB",
                margin: 0,
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Beauty Concierge
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 6px",
                  borderRadius: "8px",
                  background: "rgba(212, 175, 55, 0.2)",
                  color: "#D4AF37",
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  textTransform: "uppercase",
                }}
              >
                AI Gateway V5.1
              </span>
            </h3>
            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
              Official Assistant for Packages, Bookings & Prep
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setShowPhoneInput(!showPhoneInput)}
            title="Authenticate phone for booking lookup"
            style={{
              background: customerPhone ? "rgba(34, 197, 94, 0.15)" : "rgba(255, 255, 255, 0.08)",
              border: customerPhone ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(255, 255, 255, 0.2)",
              color: customerPhone ? "#4ADE80" : "#D1D5DB",
              borderRadius: "12px",
              padding: "6px 10px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Phone size={13} />
            <span>{customerPhone ? customerPhone : "Add Phone"}</span>
          </button>

          {isFloating && onClose && (
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "50%",
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Customer Phone Identification Drawer */}
      {showPhoneInput && (
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(30, 27, 18, 0.95)",
            borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <ShieldCheck size={16} style={{ color: "#D4AF37", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Enter Phone Number or Booking ID (e.g. 9829012345 / BK-9921)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            style={{
              flex: 1,
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: "8px",
              padding: "6px 12px",
              color: "#FFF",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <button
            onClick={() => setShowPhoneInput(false)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: "#D4AF37",
              color: "#000",
              fontWeight: 600,
              fontSize: "12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Save Session
          </button>
        </div>
      )}

      {/* Main Chat Content Area */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            sources={msg.sources}
            recommendations={msg.recommendations}
            requiresHumanAction={msg.requiresHumanAction}
            actionType={msg.actionType}
            timestamp={msg.timestamp}
            onRecommendationClick={(recPrompt) => handleSend(recPrompt)}
            onActionClick={handleActionTrigger}
          />
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "10px 0 16px 0" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "rgba(212, 175, 55, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={13} style={{ color: "#D4AF37" }} />
            </div>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(212, 175, 55, 0.2)",
                color: "#D4AF37",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RefreshCw size={14} className="animate-spin" />
              <span>Checking authoritative knowledge base...</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#FCA5A5",
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestions Drawer */}
      <div style={{ padding: "0 20px 8px 20px" }}>
        <ConciergeSuggestions onSelectSuggestion={(prompt) => handleSend(prompt)} disabled={loading} />
      </div>

      {/* Input Bar */}
      <div
        style={{
          padding: "14px 20px",
          background: "rgba(15, 15, 20, 0.95)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Ask anything about packages, booking, bridal prep..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          style={{
            flex: 1,
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "24px",
            padding: "12px 18px",
            color: "#FFF",
            fontSize: "14px",
            outline: "none",
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.4)",
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputPrompt.trim() || loading}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background:
              !inputPrompt.trim() || loading
                ? "rgba(255, 255, 255, 0.1)"
                : "linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)",
            border: "none",
            color: !inputPrompt.trim() || loading ? "rgba(255, 255, 255, 0.3)" : "#000",
            cursor: !inputPrompt.trim() || loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              !inputPrompt.trim() || loading
                ? "none"
                : "0 4px 15px rgba(212, 175, 55, 0.4)",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
