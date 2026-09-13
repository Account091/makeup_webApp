"use client";

import React, { useState, useEffect } from "react";
import { MarketplaceConversation, MarketplaceMessage } from "../../lib/marketplace/marketplace-types";

export default function CustomerMarketplaceChatScreen() {
  const [conversations, setConversations] = useState<MarketplaceConversation[]>([]);
  const [activeConv, setActiveConv] = useState<MarketplaceConversation | null>(null);
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const customerId = "cust-101";

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketplace/chat/conversations?userId=${customerId}&role=CUSTOMER`);
      const data = await res.json();
      if (data.success && data.conversations) {
        setConversations(data.conversations);
        if (data.conversations.length > 0 && !activeConv) {
          setActiveConv(data.conversations[0]);
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
      const res = await fetch(`/api/marketplace/chat/messages?conversationId=${convId}&userId=${customerId}&role=CUSTOMER`);
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
      // Mark read
      await fetch("/api/marketplace/chat/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, userId: customerId, userRole: "CUSTOMER" }),
      });
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.conversationId);
    }
  }, [activeConv?.conversationId]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConv || (!inputText.trim() && !mediaUrl)) return;

    setSending(true);
    setNotice(null);
    try {
      const res = await fetch("/api/marketplace/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConv.conversationId,
          senderType: "CUSTOMER",
          senderId: customerId,
          text: inputText,
          mediaUrl: mediaUrl || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInputText("");
        setMediaUrl("");
        setShowAttachModal(false);
        fetchMessages(activeConv.conversationId);
      } else if (data.error) {
        setNotice(`⚠️ ${data.error}`);
      }
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleReport = async () => {
    if (!activeConv) return;
    const reason = prompt("Enter report reason (HARASSMENT, SPAM, FRAUD, SAFETY):", "HARASSMENT");
    if (!reason) return;
    try {
      const res = await fetch("/api/marketplace/chat/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConv.conversationId,
          reportedBy: customerId,
          reason,
          description: "Customer reported conversation safety violation.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Conversation reported to Platform Safety Team.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 4px 0" }}>
          Customer ↔ Artist Marketplace Chat
        </h1>
        <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
          Discuss bridal requirements, event preparation, and styling pre-booking or post-booking securely.
        </p>
      </div>

      {notice && (
        <div style={{ background: "#FEF2F2", borderLeft: "4px solid #EF4444", padding: 12, borderRadius: 8, marginBottom: 20, color: "#991B1B", fontSize: 14 }}>
          {notice}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24, height: 680 }}>
        {/* Conversations Sidebar */}
        <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", fontWeight: 700, fontSize: 16, color: "#111827" }}>
            My Conversations
          </div>

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
                    background: isSelected ? "#EFF6FF" : "#F9FAFB",
                    border: isSelected ? "1px solid #3B82F6" : "1px solid #E5E7EB",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                      Artist {conv.artistId}
                    </span>
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: "#4B5563", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 6 }}>
                    {conv.lastMessageText || "No messages yet"}
                  </div>

                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: conv.bookingId ? "#D1FAE5" : "#FEF3C7", color: conv.bookingId ? "#065F46" : "#92400E" }}>
                      {conv.bookingId ? `Booking: ${conv.bookingId}` : "Pre-Booking Inquiry"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Chat Window */}
        {activeConv ? (
          <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#111827" }}>
                    Artist {activeConv.artistId} ({activeConv.organizationId})
                  </h3>
                  <span style={{ background: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
                    ✓ Verified Artist
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  Status: <strong>{activeConv.status}</strong> • {activeConv.bookingId ? `Linked Booking: ${activeConv.bookingId}` : "Pre-Booking Inquiry"}
                </div>
              </div>

              <button
                onClick={handleReport}
                style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5", padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                🚩 Report Safety Issue
              </button>
            </div>

            {/* Message Stream */}
            <div style={{ flex: 1, padding: 24, overflowY: "auto", background: "#F9FAFB", display: "flex", flexDirection: "column", gap: 14 }}>
              {messages.map((msg) => {
                if (msg.messageType === "SYSTEM") {
                  return (
                    <div key={msg.messageId} style={{ alignSelf: "center", background: "#E0E7FF", color: "#3730A3", fontSize: 12, fontWeight: 600, padding: "6px 16px", borderRadius: 16 }}>
                      ⚙️ {msg.text}
                    </div>
                  );
                }

                const isCustomer = msg.senderType === "CUSTOMER";
                return (
                  <div
                    key={msg.messageId}
                    style={{
                      alignSelf: isCustomer ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                      background: isCustomer ? "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)" : "#FFFFFF",
                      color: isCustomer ? "#FFFFFF" : "#111827",
                      padding: "12px 16px",
                      borderRadius: isCustomer ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      border: isCustomer ? "none" : "1px solid #E5E7EB",
                    }}
                  >
                    <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4, fontWeight: 600 }}>
                      {msg.senderType === "CUSTOMER" ? "You" : msg.senderType === "AI" ? "AI Assistant" : `Artist (${msg.senderId})`}
                    </div>

                    <div style={{ fontSize: 14, lineHeight: 1.4 }}>{msg.text}</div>

                    {msg.mediaUrl && (
                      <div style={{ marginTop: 8 }}>
                        <img src={msg.mediaUrl} alt="attachment" style={{ maxWidth: "100%", borderRadius: 8, maxHeight: 200 }} />
                      </div>
                    )}

                    {msg.flaggedForModeration && (
                      <div style={{ marginTop: 6, fontSize: 11, background: "#FEF2F2", color: "#991B1B", padding: "4px 8px", borderRadius: 4 }}>
                        ⚠️ Message flagged for review ({msg.moderationReason})
                      </div>
                    )}

                    <div style={{ fontSize: 10, textAlign: "right", marginTop: 4, opacity: 0.7 }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} style={{ padding: 16, borderTop: "1px solid #E5E7EB", background: "#FFFFFF", display: "flex", gap: 12, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setShowAttachModal(!showAttachModal)}
                style={{ background: "#F3F4F6", border: "1px solid #D1D5DB", padding: "10px 14px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}
              >
                📷 Attachment
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message to artist..."
                style={{ flex: 1, padding: "12px 16px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14, outline: "none" }}
              />

              <button
                type="submit"
                disabled={sending}
                style={{ background: "#4F46E5", color: "#FFFFFF", fontWeight: 700, padding: "12px 24px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14 }}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>

            {/* Image Attachment Modal */}
            {showAttachModal && (
              <div style={{ padding: 16, background: "#F9FAFB", borderTop: "1px solid #E5E7EB", display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Paste private media reference URL (e.g. /uploads/chat/reference.jpg)"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #D1D5DB", fontSize: 13 }}
                />
                <button
                  type="button"
                  onClick={() => setShowAttachModal(false)}
                  style={{ background: "#111827", color: "#FFF", padding: "8px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12 }}
                >
                  Attach & Close
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
