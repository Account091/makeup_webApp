"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  CheckCircle2,
  Copy,
  Edit3,
  RefreshCw,
  Tag,
  Share2,
  FileText,
  ShieldCheck,
  Award,
} from "lucide-react";
import {
  generateContentDraft,
  saveContentDraftToFirestore,
  updateContentDraftStatus,
  ContentDraftResponseData,
} from "../../lib/ai/content-draft-client";
import { ContentDraftType } from "../../lib/ai/types";

export const AiContentDrafter: React.FC = () => {
  const [contentType, setContentType] = useState<ContentDraftType>("INSTAGRAM_POST");
  const [platform, setPlatform] = useState<string>("INSTAGRAM");
  const [serviceId, setServiceId] = useState<string>("royal-bridal");
  const [tone, setTone] = useState<string>("Luxury & Royal");
  const [language, setLanguage] = useState<string>("English");
  const [topic, setTopic] = useState<string>("Royal Rajasthani Bridal Makeup Showcase");
  const [keywords, setKeywords] = useState<string>("Jaipur Bride, HD Airbrush, Poshak Draping");
  const [callToAction, setCallToAction] = useState<string>("Book your bridal makeover date on WhatsApp!");
  const [userRole, setUserRole] = useState<string>("CONTENT_MANAGER");

  const [loading, setLoading] = useState(false);
  const [draftResult, setDraftResult] = useState<ContentDraftResponseData | null>(null);
  const [editableCaption, setEditableCaption] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() && !serviceId) return;

    setErrorMsg(null);
    setApprovalStatus(null);
    setLoading(true);

    try {
      const res = await generateContentDraft({
        contentType,
        platform,
        serviceId,
        topic: topic.trim(),
        tone,
        language,
        keywords: keywords.split(",").map((k) => k.trim()),
        callToAction: callToAction.trim(),
        authPayload: {
          role: userRole,
          uid: "admin_prachi",
        },
      });

      setDraftResult(res);
      setEditableCaption(res.generatedContent.caption || res.generatedContent.body);

      // Persist draft into Firestore contentDrafts/{id}
      await saveContentDraftToFirestore(res, "admin_prachi");
    } catch (err: any) {
      console.error("[AiContentDrafter] Error:", err);
      setErrorMsg(err.message || "Failed to generate AI content draft.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!draftResult) return;
    try {
      await updateContentDraftStatus(draftResult.draftId, "APPROVED", "admin_prachi");
      setApprovalStatus("APPROVED");
    } catch (e: any) {
      setErrorMsg("Failed to approve draft in Firestore.");
    }
  };

  const handleCopy = () => {
    if (!editableCaption) return;
    navigator.clipboard.writeText(editableCaption);
    alert("Caption copied to clipboard!");
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
      {/* Top Header Bar */}
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
              background: "linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(212, 175, 55, 0.5)",
            }}
          >
            <Sparkles size={22} style={{ color: "#000" }} />
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
              AI Content & Marketing Drafter ✨
            </h2>
            <p style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
              Instagram, Reels, WhatsApp, SEO & Campaign Copy with Mandatory Admin Approval
            </p>
          </div>
        </div>

        {/* Role Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>Role:</span>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              color: "#F3E5AB",
              borderRadius: "12px",
              padding: "6px 12px",
              fontSize: "12px",
              outline: "none",
            }}
          >
            <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
            <option value="ADMIN">ADMIN / OWNER</option>
            <option value="MANAGER">MANAGER</option>
            <option value="CUSTOMER">CUSTOMER (Test Auth Rejection)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Output */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          padding: "24px",
        }}
      >
        {/* Left Column: Form Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#F3E5AB", display: "block", marginBottom: "4px" }}>
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => {
                const val = e.target.value as ContentDraftType;
                setContentType(val);
                if (val === "INSTAGRAM_POST" || val === "INSTAGRAM_REEL") setPlatform("INSTAGRAM");
                else if (val === "WHATSAPP") setPlatform("WHATSAPP");
                else if (val === "WEBSITE" || val === "SEO") setPlatform("WEBSITE");
                else if (val === "YOUTUBE_SHORT") setPlatform("YOUTUBE");
              }}
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "10px",
                padding: "8px 12px",
                color: "#FFF",
                fontSize: "13px",
                outline: "none",
              }}
            >
              <option value="INSTAGRAM_POST">Instagram Post Caption</option>
              <option value="INSTAGRAM_REEL">Instagram Reel Script & Caption</option>
              <option value="WHATSAPP">WhatsApp Broadcast Offer</option>
              <option value="WEBSITE">Website Hero & Service Copy</option>
              <option value="SEO">SEO Meta Title & Description</option>
              <option value="BLOG">Bridal Preparation Blog Draft</option>
              <option value="YOUTUBE_SHORT">YouTube Shorts Script</option>
              <option value="CAMPAIGN">Palace Wedding Campaign Copy</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#F3E5AB", display: "block", marginBottom: "4px" }}>
                Target Service
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  color: "#FFF",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="royal-bridal">Signature Royal Bridal Makeover</option>
                <option value="engagement">Pre-Wedding & Engagement Glam</option>
                <option value="party">Party & Festive Makeover</option>
                <option value="destination">Destination Bridal Package</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#F3E5AB", display: "block", marginBottom: "4px" }}>
                Brand Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  color: "#FFF",
                  fontSize: "13px",
                  outline: "none",
                }}
              >
                <option value="Luxury & Royal">Luxury & Royal</option>
                <option value="Warm & Conversational">Warm & Conversational</option>
                <option value="Urgent Offer">Urgent Seasonal Booking</option>
                <option value="Informative Prep">Informative Skincare Prep</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#F3E5AB", display: "block", marginBottom: "4px" }}>
              Topic / Headline Focus
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Royal Rajasthani Bridal HD Airbrush Transformation"
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "10px",
                padding: "8px 12px",
                color: "#FFF",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#F3E5AB", display: "block", marginBottom: "4px" }}>
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Jaipur Bride, HD Airbrush, Poshak Draping"
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "10px",
                padding: "8px 12px",
                color: "#FFF",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "#F3E5AB", display: "block", marginBottom: "4px" }}>
              Call to Action
            </label>
            <input
              type="text"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              placeholder="Book your consultation via WhatsApp"
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                borderRadius: "10px",
                padding: "8px 12px",
                color: "#FFF",
                fontSize: "13px",
                outline: "none",
              }}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              marginTop: "10px",
              padding: "12px 20px",
              borderRadius: "24px",
              background: loading
                ? "rgba(255, 255, 255, 0.1)"
                : "linear-gradient(135deg, #D4AF37 0%, #AA771C 100%)",
              border: "none",
              color: loading ? "rgba(255, 255, 255, 0.4)" : "#000",
              fontWeight: 700,
              fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 16px rgba(212, 175, 55, 0.3)",
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Drafting AI Copy...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate AI Content Draft ✨
              </>
            )}
          </button>

          {errorMsg && (
            <div
              style={{
                padding: "10px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#FCA5A5",
                fontSize: "12px",
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Draft Preview & Approval Workstation */}
        <div
          style={{
            background: "rgba(18, 18, 24, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "18px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "14px",
              paddingBottom: "10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h4
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#F3E5AB",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FileText size={16} style={{ color: "#D4AF37" }} /> AI Draft Workstation
            </h4>
            <span
              style={{
                fontSize: "10px",
                padding: "3px 8px",
                borderRadius: "10px",
                background: approvalStatus === "APPROVED" ? "rgba(34, 197, 94, 0.2)" : "rgba(245, 158, 11, 0.2)",
                color: approvalStatus === "APPROVED" ? "#4ADE80" : "#FBBF24",
                border: approvalStatus === "APPROVED" ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(245, 158, 11, 0.4)",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {approvalStatus === "APPROVED" ? "APPROVED" : "REQUIRES ADMIN APPROVAL"}
            </span>
          </div>

          {!draftResult ? (
            <div
              style={{
                flex: 1,
                minHeight: "280px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.4)",
              }}
            >
              <Sparkles size={36} style={{ color: "#D4AF37", marginBottom: "12px" }} />
              <p style={{ margin: 0, fontSize: "14px" }}>
                Select content parameters and click "Generate AI Content Draft" to produce brand-aligned copy.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Headline / Title */}
              <div>
                <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>
                  Draft Headline
                </span>
                <h5 style={{ fontSize: "15px", fontWeight: 700, color: "#FFF", margin: "2px 0 8px 0" }}>
                  {draftResult.generatedContent.title}
                </h5>
              </div>

              {/* Editable Body / Caption */}
              <div>
                <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>
                  Generated Copy (Editable)
                </span>
                <textarea
                  rows={7}
                  value={editableCaption}
                  onChange={(e) => setEditableCaption(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    borderRadius: "12px",
                    padding: "12px",
                    color: "#FFF",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    outline: "none",
                    marginTop: "4px",
                  }}
                />
              </div>

              {/* Hashtags */}
              {draftResult.generatedContent.hashtags && draftResult.generatedContent.hashtags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {draftResult.generatedContent.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "11px",
                        padding: "3px 8px",
                        borderRadius: "10px",
                        background: "rgba(212, 175, 55, 0.12)",
                        border: "1px solid rgba(212, 175, 55, 0.3)",
                        color: "#E6C665",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* SEO Meta */}
              {draftResult.generatedContent.seoTitle && (
                <div
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#60A5FA" }}>SEO Title: {draftResult.generatedContent.seoTitle}</div>
                  <div style={{ color: "rgba(255, 255, 255, 0.7)", marginTop: "2px" }}>
                    {draftResult.generatedContent.seoDescription}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={handleApprove}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",
                    border: "none",
                    color: "#FFF",
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CheckCircle2 size={14} /> Approve & Save Draft
                </button>

                <button
                  onClick={handleCopy}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFF",
                    fontWeight: 500,
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Copy size={14} /> Copy to Clipboard
                </button>

                <button
                  onClick={handleGenerate}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "12px",
                    background: "rgba(212, 175, 55, 0.15)",
                    border: "1px solid rgba(212, 175, 55, 0.4)",
                    color: "#F3E5AB",
                    fontWeight: 500,
                    fontSize: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <RefreshCw size={14} /> Regenerate
                </button>
              </div>

              {approvalStatus === "APPROVED" && (
                <div style={{ fontSize: "12px", color: "#4ADE80", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <ShieldCheck size={14} /> Draft approved! Saved to Firestore `contentDrafts/{draftResult.draftId}` with contentAttribution tracking.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
