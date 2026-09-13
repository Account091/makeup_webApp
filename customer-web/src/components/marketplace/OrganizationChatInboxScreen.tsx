"use client";

import React, { useState, useEffect } from "react";
import { MarketplaceConversation, MarketplaceMessage } from "../../lib/marketplace/marketplace-types";

export default function OrganizationChatInboxScreen() {
  const [conversations, setConversations] = useState<MarketplaceConversation[]>([]);
  const [activeConv, setActiveConv] = useState<MarketplaceConversation | null>(null);
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const orgId = "org-jaipur-royal-glam";
  const adminId = "admin_user_01";

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketplace/chat/conversations?userId=${adminId}&role=ORGANIZATION_ADMIN&status=${statusFilter}`);
      const data = await res.json();
      if (data.success && data.conversations) {
        setConversations(data.conversations);
        if (data.conversations.length > 0 && !activeConv) {
          setActiveConv(data.conversations[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch org conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/marketplace/chat/messages?conversationId=${convId}&userId=${adminId}&role=ORGANIZATION_ADMIN`);
      const data = await res.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [statusFilter]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.conversationId);
    }
  }, [activeConv?.conversationId]);

  const handleSendAdminResponse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConv || !inputText.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/marketplace/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConv.conversationId,
          senderType: "ORGANIZATION",
          senderId: adminId,
          text: `[Organization Admin] ${inputText}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInputText("");
        fetchMessages(activeConv.conversationId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1280, margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 4px 0" }}>
            Organization Chat Oversight Console
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>
            Monitor organization conversations, audit moderation flags, and intervene in human handoff escalation cases.
          </p>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 12, border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>Total Conversations</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>15</div>
        </div>

        <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 12, border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>Avg First Response</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#059669" }}>12 mins</div>
        </div>

        <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 12, border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>Chat → Booking Conversion</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#4F46E5" }}>42.5%</div>
        </div>

        <div style={{ background: "#FFFFFF", padding: 20, borderRadius: 12, border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>Handoff Escalations</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#D97706" }}>
            {conversations.filter((c) => c.status === "HUMAN_HANDOFF").length}
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, height: 620 }}>
        {/* Sidebar List */}
        <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: 12, borderBottom: "1px solid #E5E7EB", display: "flex", gap: 6 }}>
            {["ALL", "ACTIVE", "HUMAN_HANDOFF", "CLOSED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  border: "none",
                  background: statusFilter === s ? "#111827" : "#F3F4F6",
                  color: statusFilter === s ? "#FFFFFF" : "#374151",
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {conversations.map((c) => {
              const isSelected = activeConv?.conversationId === c.conversationId;
              return (
                <div
                  key={c.conversationId}
                  onClick={() => setActiveConv(c)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: isSelected ? "#EFF6FF" : "#F9FAFB",
                    border: isSelected ? "1px solid #3B82F6" : "1px solid #E5E7EB",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    <span>Customer {c.customerId}</span>
                    <span style={{ color: "#6B7280", fontSize: 11 }}>{c.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#4B5563", marginBottom: 4 }}>
                    Artist: {c.artistId}
                  </div>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                    {c.bookingId ? `Booking: ${c.bookingId}` : "Pre-booking Inquiry"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit / Intervention Chat Stream */}
        {activeConv ? (
          <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#111827" }}>
                  Conversation {activeConv.conversationId} (Customer {activeConv.customerId} ↔ Artist {activeConv.artistId})
                </h3>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  Org: <strong>{activeConv.organizationId}</strong> • Status: <strong>{activeConv.status}</strong>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, padding: 24, overflowY: "auto", background: "#F9FAFB", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m) => (
                <div
                  key={m.messageId}
                  style={{
                    alignSelf: m.senderType === "CUSTOMER" ? "flex-start" : "flex-end",
                    maxWidth: "75%",
                    background: m.senderType === "CUSTOMER" ? "#FFFFFF" : m.senderType === "ORGANIZATION" ? "#FEF3C7" : "#F3F4F6",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 11, color: "#4B5563", marginBottom: 2 }}>
                    {m.senderType} ({m.senderId})
                  </div>
                  <div>{m.text}</div>
                  {m.flaggedForModeration && (
                    <div style={{ color: "#DC2626", fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                      🚩 Flagged: {m.moderationReason}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Admin Intervention Composer */}
            <form onSubmit={handleSendAdminResponse} style={{ padding: 16, borderTop: "1px solid #E5E7EB", display: "flex", gap: 12 }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Send official organization admin intervention message..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14 }}
              />
              <button
                type="submit"
                disabled={sending}
                style={{ background: "#D97706", color: "#FFFFFF", fontWeight: 700, padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer" }}
              >
                Send Admin Note
              </button>
            </form>
          </div>
        ) : (
          <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
            Select conversation to audit
          </div>
        )}
      </div>
    </div>
  );
}
