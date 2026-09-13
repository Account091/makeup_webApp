"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Sparkles,
  Phone,
  PauseCircle,
  PlayCircle,
  UserCheck,
  AlertCircle,
  Send,
  FileText,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import {
  simulateWhatsAppMessage,
  executeWhatsAppAdminAction,
  WhatsAppSimulationResponse,
} from "../../lib/ai/whatsapp-assistant-client";

export const WhatsAppAssistantAdmin: React.FC = () => {
  const [phoneInput, setPhoneInput] = useState("+91 9829012345");
  const [messageInput, setMessageInput] = useState("Hi, what is my booking status?");
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [convStatus, setConvStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);

  const [chatLog, setChatLog] = useState<
    Array<{
      id: string;
      direction: "INBOUND" | "OUTBOUND";
      text: string;
      isImage?: boolean;
      status: string;
      timestamp: string;
    }>
  >([
    {
      id: "msg_init_1",
      direction: "INBOUND",
      text: "Hi, I uploaded my payment screenshot for Royal Bridal.",
      isImage: true,
      status: "RECEIVED",
      timestamp: "10:15 AM",
    },
    {
      id: "msg_init_2",
      direction: "OUTBOUND",
      text: "Payment proof received! AI screening: SUCCESS. Amount detected: ₹7,500. Status: Awaiting manual verification by team.",
      status: "SENT",
      timestamp: "10:15 AM",
    },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSimulateSend = async (customText?: string) => {
    const textToSend = customText || messageInput.trim();
    if (!textToSend || loading) return;

    setErrorMsg(null);
    setLoading(true);

    const userTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Add Inbound
    setChatLog((prev) => [
      ...prev,
      {
        id: `in_${Date.now()}`,
        direction: "INBOUND",
        text: textToSend,
        isImage: Boolean(mediaUrlInput),
        status: "RECEIVED",
        timestamp: userTimestamp,
      },
    ]);

    try {
      const res: WhatsAppSimulationResponse = await simulateWhatsAppMessage({
        phone: phoneInput.trim(),
        message: textToSend,
        mediaUrl: mediaUrlInput || undefined,
        isImage: Boolean(mediaUrlInput),
      });

      const aiTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setConvStatus(res.conversationStatus);

      if (res.aiReplied) {
        setChatLog((prev) => [
          ...prev,
          {
            id: `out_${Date.now()}`,
            direction: "OUTBOUND",
            text: res.replyText,
            status: "SENT",
            timestamp: aiTimestamp,
          },
        ]);
      } else {
        setChatLog((prev) => [
          ...prev,
          {
            id: `out_sys_${Date.now()}`,
            direction: "OUTBOUND",
            text: "💬 [SYSTEM] AI is paused for this conversation. Message routed to Human Support Inbox.",
            status: "HANDOFF",
            timestamp: aiTimestamp,
          },
        ]);
      }

      if (!customText) setMessageInput("");
    } catch (err: any) {
      console.error("[WhatsAppAssistantAdmin] Error:", err);
      setErrorMsg(err.message || "Failed to process WhatsApp message.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (action: "PAUSE_AI" | "RESUME_AI" | "TAKE_OVER" | "RESOLVE_HANDOFF") => {
    const conversationId = `conv_${phoneInput.replace(/[^0-9]/g, "")}`;
    try {
      const res = await executeWhatsAppAdminAction({
        action,
        conversationId,
        adminUid: "admin_prachi",
      });

      if (action === "PAUSE_AI" || action === "TAKE_OVER") {
        setAiEnabled(false);
        setConvStatus(action === "TAKE_OVER" ? "HANDOFF_REQUIRED" : "PAUSED");
      } else {
        setAiEnabled(true);
        setConvStatus("ACTIVE");
      }

      alert(`WhatsApp Action '${action}' executed successfully.`);
    } catch (e: any) {
      setErrorMsg(e.message || "Admin action failed.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "1150px",
        margin: "0 auto",
        background: "rgba(10, 10, 14, 0.95)",
        border: "1px solid rgba(212, 175, 55, 0.35)",
        borderRadius: "24px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 175, 55, 0.15)",
        backdropFilter: "blur(20px)",
        color: "#FFF",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          background: "linear-gradient(90deg, rgba(20, 18, 26, 0.95) 0%, rgba(35, 28, 15, 0.95) 100%)",
          borderBottom: "1px solid rgba(212, 175, 55, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #22C55E 0%, #15803D 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(34, 197, 94, 0.5)",
            }}
          >
            <MessageSquare size={22} style={{ color: "#FFF" }} />
          </div>
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#F3E5AB",
                margin: 0,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              AI WhatsApp Assistant Console 🟢
            </h2>
            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
              Meta WhatsApp Cloud API Integration • Customer 360 & Human Takeover Control
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "16px",
              background: aiEnabled ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
              border: aiEnabled ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(245, 158, 11, 0.4)",
              color: aiEnabled ? "#4ADE80" : "#FBBF24",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: aiEnabled ? "#22C55E" : "#F59E0B",
              }}
            />
            AI Status: {aiEnabled ? "● ACTIVE" : "PAUSED"} ({convStatus})
          </span>
        </div>
      </div>

      {/* Admin Action Controls Bar */}
      <div
        style={{
          padding: "14px 24px",
          background: "rgba(255, 255, 255, 0.03)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Phone size={14} style={{ color: "#D4AF37" }} />
          <span style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.7)" }}>Active Phone:</span>
          <input
            type="text"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              borderRadius: "8px",
              padding: "4px 10px",
              color: "#FFF",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {aiEnabled ? (
            <button
              onClick={() => handleAdminAction("PAUSE_AI")}
              style={{
                padding: "6px 12px",
                borderRadius: "10px",
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.4)",
                color: "#FBBF24",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <PauseCircle size={14} /> Pause AI
            </button>
          ) : (
            <button
              onClick={() => handleAdminAction("RESUME_AI")}
              style={{
                padding: "6px 12px",
                borderRadius: "10px",
                background: "rgba(34, 197, 94, 0.15)",
                border: "1px solid rgba(34, 197, 94, 0.4)",
                color: "#4ADE80",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <PlayCircle size={14} /> Resume AI
            </button>
          )}

          <button
            onClick={() => handleAdminAction("TAKE_OVER")}
            style={{
              padding: "6px 12px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#FCA5A5",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <UserCheck size={14} /> Human Takeover
          </button>
        </div>
      </div>

      {/* Main Transcript & Simulator Area */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "0" }}>
        {/* Left Column: Live WhatsApp Transcript */}
        <div
          style={{
            padding: "20px",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            height: "520px",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
            {chatLog.map((msg) => {
              const isInbound = msg.direction === "INBOUND";
              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: isInbound ? "flex-start" : "flex-end",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "12px 16px",
                      borderRadius: isInbound ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                      background: isInbound
                        ? "rgba(30, 30, 40, 0.9)"
                        : "linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(20, 100, 50, 0.3) 100%)",
                      border: isInbound
                        ? "1px solid rgba(255, 255, 255, 0.12)"
                        : "1px solid rgba(34, 197, 94, 0.4)",
                      color: "#FFF",
                      fontSize: "13px",
                      lineHeight: "1.5",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: isInbound ? "#D4AF37" : "#4ADE80",
                        marginBottom: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {isInbound ? "CUSTOMER (WhatsApp)" : "AI WHATSAPP ASSISTANT ✨"}
                      <span>• {msg.timestamp}</span>
                    </div>

                    {msg.isImage && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#FBBF24",
                          background: "rgba(245, 158, 11, 0.15)",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          marginBottom: "6px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <ImageIcon size={12} /> Payment Proof Image Attached
                      </div>
                    )}

                    <div>{msg.text}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simulation Input Bar */}
          <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Simulate customer WhatsApp message (e.g. 'What is my booking status?')..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSimulateSend();
              }}
              disabled={loading}
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "20px",
                padding: "10px 16px",
                color: "#FFF",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              onClick={() => handleSimulateSend()}
              disabled={loading || !messageInput.trim()}
              style={{
                padding: "10px 16px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #22C55E 0%, #15803D 100%)",
                border: "none",
                color: "#FFF",
                fontWeight: 600,
                fontSize: "13px",
                cursor: loading || !messageInput.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Send size={14} /> Send
            </button>
          </div>
        </div>

        {/* Right Column: Preset Quick Prompts & WhatsApp Rules */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#F3E5AB", margin: 0, textTransform: "uppercase" }}>
            Test Conversational Scenarios
          </h4>

          {[
            { label: "Packages query", text: "What's included in your royal bridal package?" },
            { label: "Payment status", text: "I uploaded my payment screenshot. What's the status?" },
            { label: "Appointment timing", text: "When is my makeup appointment?" },
            { label: "Date change (Escalation)", text: "I want to change my wedding date to October 4." },
            { label: "Invoice request", text: "Can you send me my invoice?" },
            { label: "Bridal prep tips", text: "What should I prepare before my bridal consultation?" },
          ].map((scenario, idx) => (
            <button
              key={idx}
              onClick={() => handleSimulateSend(scenario.text)}
              disabled={loading}
              style={{
                textAlign: "left",
                padding: "8px 12px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#E5E7EB",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(34, 197, 94, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
              }}
            >
              <div style={{ fontWeight: 600, color: "#4ADE80" }}>{scenario.label}</div>
              <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>"{scenario.text}"</div>
            </button>
          ))}

          {errorMsg && (
            <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.2)", color: "#FCA5A5", fontSize: "12px" }}>
              ⚠️ {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
