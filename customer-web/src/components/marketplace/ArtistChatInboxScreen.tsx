"use client";

import React, { useState, useEffect } from "react";
import { MarketplaceConversation, MarketplaceMessage } from "../../lib/marketplace/marketplace-types";

export default function ArtistChatInboxScreen() {
  const [conversations, setConversations] = useState<MarketplaceConversation[]>([]);
  const [activeConv, setActiveConv] = useState<MarketplaceConversation | null>(null);
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const artistId = "artist-103";

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketplace/chat/conversations?userId=${artistId}&role=ARTIST`);
      const data = await res.json();
      if (data.success && data.conversations) {
        let list: MarketplaceConversation[] = data.conversations;
        if (filter === "UNREAD") list = list.filter((c) => c.unreadForArtist > 0);
        if (filter === "BOOKED") list = list.filter((c) => c.bookingId !== null);
        if (filter === "NEW") list = list.filter((c) => !c.bookingId);
        setConversations(list);
        if (list.length > 0 && !activeConv) {
          setActiveConv(list[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/marketplace/chat/messages?conversationId=${convId}&userId=${artistId}&role=ARTIST`);
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
      // Mark read
      await fetch("/api/marketplace/chat/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, userId: artistId, userRole: "ARTIST" }),
      });
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [filter]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.conversationId);
      setAiDraft(null);
    }
  }, [activeConv?.conversationId]);

  const handleSendMessage = async (textToSend?: string) => {
    const finalMsg = textToSend || inputText;
    if (!activeConv || !finalMsg.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/marketplace/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConv.conversationId,
          senderType: "ARTIST",
          senderId: artistId,
          text: finalMsg,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInputText("");
        setAiDraft(null);
        fetchMessages(activeConv.conversationId);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateAiDraft = async () => {
    if (!activeConv || messages.length === 0) return;
    const lastCustomerMsg = [...messages].reverse().find((m) => m.senderType === "CUSTOMER")?.text || "Inquiry";

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/marketplace-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: lastCustomerMsg,
          conversationId: activeConv.conversationId,
          mode: "AI_SUGGEST",
        }),
      });
      const data = await res.json();
      if (data.success && data.aiResponse) {
        setAiDraft(data.aiResponse.draftText);
      }
    } catch (err) {
      console.error("AI Draft error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleHandoff = async () => {
    if (!activeConv) return;
    try {
      const res = await fetch("/api/marketplace/chat/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConv.conversationId, reason: "Artist requested support handoff" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Conversation transferred to Support Handoff state.");
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1280, margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 4px 0" }}>
            Artist Chat Inbox Console
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
            Manage pre-booking inquiries and active booking conversations with AI draft assistance.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, height: 700 }}>
        {/* Inbox Sidebar */}
        <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", display: "flex", flexDirection: "column" }}>
          {/* Filters */}
          <div style={{ padding: 12, borderBottom: "1px solid #E5E7EB", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["ALL", "UNREAD", "BOOKED", "NEW"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  border: "none",
                  background: filter === f ? "#111827" : "#F3F4F6",
                  color: filter === f ? "#FFFFFF" : "#374151",
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {conversations.map((conv) => {
              const isSelected = activeConv?.conversationId === conv.conversationId;
              return (
                <div
                  key={conv.conversationId}
                  onClick={() => setActiveConv(conv)}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: isSelected ? "#F3F4F6" : "#FFFFFF",
                    border: isSelected ? "2px solid #4F46E5" : "1px solid #E5E7EB",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                      Customer {conv.customerId}
                    </span>
                    {conv.unreadForArtist > 0 && (
                      <span style={{ background: "#EF4444", color: "#FFFFFF", fontSize: 10, fontWeight: 800, borderRadius: 10, padding: "2px 8px" }}>
                        {conv.unreadForArtist} NEW
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: "#4B5563", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 6 }}>
                    {conv.lastMessageText}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: conv.bookingId ? "#D1FAE5" : "#FEF3C7", color: conv.bookingId ? "#065F46" : "#92400E" }}>
                      {conv.bookingId ? `Booking: ${conv.bookingId}` : "Pre-Booking Inquiry"}
                    </span>
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        {activeConv ? (
          <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#111827" }}>
                  Customer {activeConv.customerId}
                </h3>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  Status: <strong>{activeConv.status}</strong> • {activeConv.bookingId ? `Booking ${activeConv.bookingId}` : "Pre-booking Inquiry"}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleGenerateAiDraft}
                  disabled={aiLoading}
                  style={{ background: "#EEF2FF", color: "#4F46E5", border: "1px solid #C7D2FE", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  {aiLoading ? "Generating..." : "✨ AI Suggest Reply"}
                </button>
                <button
                  onClick={handleHandoff}
                  style={{ background: "#F3F4F6", color: "#374151", border: "1px solid #D1D5DB", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  🧑‍💼 Request Support Handoff
                </button>
              </div>
            </div>

            {/* AI Draft Suggestion Box */}
            {aiDraft && (
              <div style={{ padding: 16, background: "#EEF2FF", borderBottom: "1px solid #C7D2FE" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#4F46E5", marginBottom: 6 }}>
                  ✨ AI Draft Recommendation (AI_SUGGEST Mode)
                </div>
                <div style={{ fontSize: 14, color: "#1E1B4B", marginBottom: 12, fontStyle: "italic" }}>
                  "{aiDraft}"
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => handleSendMessage(aiDraft)}
                    style={{ background: "#4F46E5", color: "#FFF", padding: "6px 14px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    Approve & Send Draft
                  </button>
                  <button
                    onClick={() => setInputText(aiDraft)}
                    style={{ background: "#FFFFFF", color: "#4F46E5", border: "1px solid #4F46E5", padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    Edit Draft in Composer
                  </button>
                  <button
                    onClick={() => setAiDraft(null)}
                    style={{ background: "none", border: "none", color: "#6B7280", fontSize: 12, cursor: "pointer" }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Message Stream */}
            <div style={{ flex: 1, padding: 24, overflowY: "auto", background: "#F9FAFB", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((msg) => {
                if (msg.messageType === "SYSTEM") {
                  return (
                    <div key={msg.messageId} style={{ alignSelf: "center", background: "#E0E7FF", color: "#3730A3", fontSize: 12, fontWeight: 600, padding: "6px 16px", borderRadius: 16 }}>
                      ⚙️ {msg.text}
                    </div>
                  );
                }

                const isArtist = msg.senderType === "ARTIST" || msg.senderType === "ORGANIZATION";
                return (
                  <div
                    key={msg.messageId}
                    style={{
                      alignSelf: isArtist ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                      background: isArtist ? "#111827" : "#FFFFFF",
                      color: isArtist ? "#FFFFFF" : "#111827",
                      padding: "12px 16px",
                      borderRadius: isArtist ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      border: isArtist ? "none" : "1px solid #E5E7EB",
                    }}
                  >
                    <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4, fontWeight: 600 }}>
                      {isArtist ? "You (Artist)" : `Customer (${msg.senderId})`}
                    </div>

                    <div style={{ fontSize: 14, lineHeight: 1.4 }}>{msg.text}</div>

                    {msg.mediaUrl && (
                      <div style={{ marginTop: 8 }}>
                        <img src={msg.mediaUrl} alt="attachment" style={{ maxWidth: "100%", borderRadius: 8, maxHeight: 200 }} />
                      </div>
                    )}

                    <div style={{ fontSize: 10, textAlign: "right", marginTop: 4, opacity: 0.7 }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Composer */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ padding: 16, borderTop: "1px solid #E5E7EB", background: "#FFFFFF", display: "flex", gap: 12 }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type response to customer..."
                style={{ flex: 1, padding: "12px 16px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, outline: "none" }}
              />

              <button
                type="submit"
                disabled={sending}
                style={{ background: "#111827", color: "#FFFFFF", fontWeight: 700, padding: "12px 24px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14 }}
              >
                {sending ? "Sending..." : "Send Reply"}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
            Select a conversation from inbox
          </div>
        )}
      </div>
    </div>
  );
}
