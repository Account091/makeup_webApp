"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  Archive,
  History,
  Sparkles,
  AlertTriangle,
  Send,
  UploadCloud,
  Clock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  KnowledgeEntry,
  KnowledgeCategory,
  KnowledgeLanguage,
  AiQuestionLog,
} from "../../../lib/ai/knowledge/types";

export default function KnowledgeBaseAdminPage() {
  const [activeTab, setActiveTab] = useState<"list" | "edit" | "unanswered" | "ops">("list");
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [needsReviewFilter, setNeedsReviewFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Editor Form State
  const [currentEntry, setCurrentEntry] = useState<Partial<KnowledgeEntry>>({
    title: "",
    category: "policy",
    content: "",
    language: "both",
    status: "draft",
    sourceUrl: "",
    appliesTo: { cities: ["all"], services: ["all"] },
  });

  // Dry-run Test Box State
  const [testQuestion, setTestQuestion] = useState("");
  const [testResult, setTestResult] = useState<{
    score: number;
    bestChunkText: string;
    simulatedAnswer: string;
  } | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Unanswered Questions State
  const [unanswered, setUnanswered] = useState<AiQuestionLog[]>([]);
  const [unansweredLoading, setUnansweredLoading] = useState(false);

  // Status notice
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (needsReviewFilter) params.append("needsReview", "true");

      const res = await fetch(`/api/admin/knowledge?${params.toString()}`);
      const data = await res.json();
      if (data.entries) {
        setEntries(data.entries);
      }
    } catch (e) {
      console.error("Failed to fetch entries:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnanswered = async () => {
    setUnansweredLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge/unanswered");
      const data = await res.json();
      if (data.questions) {
        setUnanswered(data.questions);
      }
    } catch (e) {
      console.error("Failed to fetch unanswered questions:", e);
    } finally {
      setUnansweredLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") fetchEntries();
    if (activeTab === "unanswered") fetchUnanswered();
  }, [activeTab, categoryFilter, statusFilter, needsReviewFilter]);

  const handleSaveDraft = async () => {
    if (!currentEntry.title || !currentEntry.content) {
      alert("Title and Content are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_draft",
          payload: currentEntry,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Draft '${data.entry.title}' saved successfully.`);
        setCurrentEntry(data.entry);
        fetchEntries();
      }
    } catch (err) {
      alert("Failed to save draft.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id?: string) => {
    const targetId = id || currentEntry.id;
    if (!targetId) return;

    if (!confirm("Are you sure you want to publish this entry? New chunks will be staged and atomic-swapped.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          payload: { entryId: targetId },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Entry '${data.entry.title}' published successfully! (Version ${data.entry.version})`);
        if (currentEntry.id === targetId) {
          setCurrentEntry(data.entry);
        }
        fetchEntries();
      }
    } catch (err) {
      alert("Failed to publish entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this entry? Its search chunks will be permanently purged from index.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "archive",
          payload: { entryId: id },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice("Entry archived and index chunks removed.");
        fetchEntries();
      }
    } catch (err) {
      alert("Failed to archive entry.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestDraft = async () => {
    if (!testQuestion.trim() || !currentEntry.content) {
      alert("Please provide draft content and a test question.");
      return;
    }
    setTestLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_draft",
          payload: {
            draftTitle: currentEntry.title || "Untitled Draft",
            draftContent: currentEntry.content || "",
            testQuestion,
          },
        }),
      });
      const data = await res.json();
      if (data.dryRun) {
        setTestResult(data.dryRun);
      }
    } catch (e) {
      alert("Failed to run test question.");
    } finally {
      setTestLoading(false);
    }
  };

  const handleCreateDraftFromQuestion = async (q: AiQuestionLog) => {
    try {
      const res = await fetch("/api/admin/knowledge/unanswered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionLogId: q.id }),
      });
      const data = await res.json();
      if (data.draftEntry) {
        setCurrentEntry(data.draftEntry);
        setActiveTab("edit");
        setActionNotice(`Created draft from question: "${q.scrubbedQuestion}"`);
      }
    } catch (e) {
      alert("Failed to create draft.");
    }
  };

  const handleBulkImport = async () => {
    if (!confirm("Import verified website policies and FAQs as drafts?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge/bulk-import", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        setActiveTab("list");
        fetchEntries();
      }
    } catch (e) {
      alert("Bulk import failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupExpired = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge/cleanup-expired", { method: "POST" });
      const data = await res.json();
      alert(`Cleanup complete. Purged ${data.cleanedCount} expired entries.`);
      fetchEntries();
    } catch (e) {
      alert("Cleanup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReindex = async () => {
    if (!confirm("Re-index all published entries? This will re-embed using multilingual-e5-small.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge/reindex", { method: "POST" });
      const data = await res.json();
      alert(`Re-index complete. Re-indexed ${data.reindexedCount} entries.`);
      fetchEntries();
    } catch (e) {
      alert("Reindex failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FDFBF7", color: "#2A0845" }}>
      {/* Top Header */}
      <header
        style={{
          backgroundColor: "#2A0845",
          color: "#FFFFFF",
          padding: "20px 32px",
          borderBottom: "2px solid #D4AF37",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>👑</span>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", color: "#D4AF37", margin: 0 }}>
              Makeovers by Prachi — Knowledge Base Console
            </h1>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#E8D3C7" }}>
            Admin-Managed Grounded Knowledge & Zero-Hallucination Vector Architecture
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTab("list")}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: activeTab === "list" ? "#D4AF37" : "rgba(255,255,255,0.1)",
              color: activeTab === "list" ? "#2A0845" : "#FFFFFF",
              border: "none",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            📚 Entries List
          </button>
          <button
            onClick={() => {
              setCurrentEntry({
                title: "",
                category: "policy",
                content: "",
                language: "both",
                status: "draft",
                sourceUrl: "",
                appliesTo: { cities: ["all"], services: ["all"] },
              });
              setTestResult(null);
              setActiveTab("edit");
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: activeTab === "edit" ? "#D4AF37" : "rgba(255,255,255,0.1)",
              color: activeTab === "edit" ? "#2A0845" : "#FFFFFF",
              border: "none",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ✍️ Add / Edit Entry
          </button>
          <button
            onClick={() => setActiveTab("unanswered")}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: activeTab === "unanswered" ? "#D4AF37" : "rgba(255,255,255,0.1)",
              color: activeTab === "unanswered" ? "#2A0845" : "#FFFFFF",
              border: "none",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ❓ Unanswered ({unanswered.length})
          </button>
          <button
            onClick={() => setActiveTab("ops")}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              backgroundColor: activeTab === "ops" ? "#D4AF37" : "rgba(255,255,255,0.1)",
              color: activeTab === "ops" ? "#2A0845" : "#FFFFFF",
              border: "none",
              fontWeight: "bold",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ⚙️ Operations
          </button>
        </div>
      </header>

      {/* Action Notice Banner */}
      {actionNotice && (
        <div
          style={{
            backgroundColor: "rgba(212, 175, 55, 0.15)",
            borderBottom: "1px solid #D4AF37",
            padding: "10px 32px",
            color: "#4A3710",
            fontSize: "13px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>✨ {actionNotice}</span>
          <button
            onClick={() => setActionNotice(null)}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
          >
            ✕
          </button>
        </div>
      )}

      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 24px" }}>
        {/* TAB 1: LIST ENTRIES */}
        {activeTab === "list" && (
          <div>
            {/* Filter Bar */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "18px",
                borderRadius: "16px",
                border: "1px solid #E5E0D8",
                display: "flex",
                flexWrap: "wrap",
                gap: "14px",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "220px" }}>
                <Search size={16} style={{ color: "#8C6D23" }} />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #E5E0D8",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #E5E0D8", fontSize: "13px" }}
                >
                  <option value="all">All Categories</option>
                  <option value="packages">Packages</option>
                  <option value="policy">Policy</option>
                  <option value="faq">FAQ</option>
                  <option value="city">City</option>
                  <option value="prep">Prep</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #E5E0D8", fontSize: "13px" }}
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="indexing">Indexing</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={needsReviewFilter}
                  onChange={(e) => setNeedsReviewFilter(e.target.checked)}
                />
                <span>Needs Review (&gt;90d / expired)</span>
              </label>

              <button
                onClick={fetchEntries}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  backgroundColor: "#2A0845",
                  color: "#D4AF37",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* Entries Table */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #E5E0D8",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#2A0845", color: "#FDFBF7" }}>
                    <th style={{ padding: "14px 18px" }}>Title</th>
                    <th style={{ padding: "14px 18px" }}>Category</th>
                    <th style={{ padding: "14px 18px" }}>Status</th>
                    <th style={{ padding: "14px 18px" }}>Version</th>
                    <th style={{ padding: "14px 18px" }}>Language</th>
                    <th style={{ padding: "14px 18px" }}>Last Updated</th>
                    <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries
                    .filter((e) => !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((entry) => (
                      <tr key={entry.id} style={{ borderBottom: "1px solid #E5E0D8" }}>
                        <td style={{ padding: "14px 18px", fontWeight: "600", color: "#2A0845" }}>
                          {entry.title}
                          {entry.sourceUrl && (
                            <div style={{ fontSize: "11px", color: "#8C6D23" }}>Source: {entry.sourceUrl}</div>
                          )}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              backgroundColor: "rgba(212, 175, 55, 0.15)",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "bold",
                            }}
                          >
                            {entry.category}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span
                            style={{
                              backgroundColor:
                                entry.status === "published"
                                  ? "#DEF7EC"
                                  : entry.status === "indexing"
                                  ? "#FEF08A"
                                  : entry.status === "draft"
                                  ? "#E2E8F0"
                                  : "#FEE2E2",
                              color:
                                entry.status === "published"
                                  ? "#03543F"
                                  : entry.status === "indexing"
                                  ? "#713F12"
                                  : entry.status === "draft"
                                  ? "#475569"
                                  : "#991B1B",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "bold",
                              textTransform: "uppercase",
                            }}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          v{entry.version} {entry.indexedVersion > 0 && `(idx: v${entry.indexedVersion})`}
                        </td>
                        <td style={{ padding: "14px 18px" }}>{entry.language}</td>
                        <td style={{ padding: "14px 18px", fontSize: "11px", color: "#6E6359" }}>
                          {new Date(entry.updatedAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => {
                                setCurrentEntry(entry);
                                setTestResult(null);
                                setActiveTab("edit");
                              }}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid #D4AF37",
                                backgroundColor: "transparent",
                                color: "#2A0845",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              Edit
                            </button>

                            {entry.status !== "published" && (
                              <button
                                onClick={() => handlePublish(entry.id)}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  border: "none",
                                  backgroundColor: "#2A0845",
                                  color: "#D4AF37",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                }}
                              >
                                Publish
                              </button>
                            )}

                            {entry.status !== "archived" && (
                              <button
                                onClick={() => handleArchive(entry.id)}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid #CBD5E1",
                                  backgroundColor: "transparent",
                                  color: "#991B1B",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                }}
                              >
                                Archive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {entries.length === 0 && !loading && (
                <div style={{ padding: "40px", textAlign: "center", color: "#6E6359" }}>
                  No knowledge entries found matching the filter criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADD / EDIT ENTRY WITH TEST QUESTION DRY-RUN */}
        {activeTab === "edit" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
            {/* Editor Form */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "24px",
                borderRadius: "18px",
                border: "1px solid #E5E0D8",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* Important Guardrail Notice Banner */}
              <div
                style={{
                  backgroundColor: "#FFFBEB",
                  border: "1.5px solid #F59E0B",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  display: "flex",
                  gap: "10px",
                  color: "#92400E",
                  fontSize: "12.5px",
                  lineHeight: "1.5",
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div>
                  <strong>Mandatory Grounding Guardrail:</strong>
                  <div>
                    Do not put prices that live elsewhere, customer personal data, or internal confidential notes
                    here. Prices and dates are managed by the live server engine.
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "bold", marginBottom: "6px" }}>
                  Entry Title:
                </label>
                <input
                  type="text"
                  value={currentEntry.title || ""}
                  onChange={(e) => setCurrentEntry((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Traditional Poshak Draping & Jewellery Protocol"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #E5E0D8",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>
                    Category:
                  </label>
                  <select
                    value={currentEntry.category || "policy"}
                    onChange={(e) => setCurrentEntry((prev) => ({ ...prev, category: e.target.value as any }))}
                    style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #E5E0D8" }}
                  >
                    <option value="policy">Policy</option>
                    <option value="packages">Packages</option>
                    <option value="faq">FAQ</option>
                    <option value="city">City</option>
                    <option value="prep">Prep</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>
                    Language:
                  </label>
                  <select
                    value={currentEntry.language || "both"}
                    onChange={(e) => setCurrentEntry((prev) => ({ ...prev, language: e.target.value as any }))}
                    style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #E5E0D8" }}
                  >
                    <option value="both">Both (En + Hi)</option>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "bold", marginBottom: "6px" }}>
                  Knowledge Content:
                </label>
                <textarea
                  rows={10}
                  value={currentEntry.content || ""}
                  onChange={(e) => setCurrentEntry((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter verified reference text. This text will be chunked into ~150-300 words with title prepended."
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #E5E0D8",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>
                  Source URL (for verification attribution):
                </label>
                <input
                  type="text"
                  value={currentEntry.sourceUrl || ""}
                  onChange={(e) => setCurrentEntry((prev) => ({ ...prev, sourceUrl: e.target.value }))}
                  placeholder="/services or /destination-weddings"
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #E5E0D8", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#2A0845",
                    color: "#D4AF37",
                    border: "none",
                    fontWeight: "bold",
                    fontSize: "13.5px",
                    cursor: "pointer",
                  }}
                >
                  Save As Draft
                </button>

                <button
                  type="button"
                  onClick={() => handlePublish()}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #E6CA65 0%, #D4AF37 50%, #997B1E 100%)",
                    color: "#2A0845",
                    border: "none",
                    fontWeight: "bold",
                    fontSize: "13.5px",
                    cursor: "pointer",
                  }}
                >
                  Publish (Staged)
                </button>
              </div>
            </div>

            {/* Dry-Run Draft Test Box */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "24px",
                borderRadius: "18px",
                border: "1.5px solid #D4AF37",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} style={{ color: "#D4AF37" }} />
                <h3 style={{ margin: 0, fontSize: "16px", color: "#2A0845", fontFamily: "'Playfair Display', serif" }}>
                  Draft Test Question (Dry-Run Box)
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "#6E6359" }}>
                Test your draft text against customer queries <strong>in memory only</strong>. No draft chunks are written to
                the production index.
              </p>

              <div>
                <input
                  type="text"
                  placeholder="Enter a test question e.g. Do you provide poshak draping?"
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #E5E0D8",
                    fontSize: "13px",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleTestDraft}
                disabled={testLoading}
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#2A0845",
                  color: "#D4AF37",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {testLoading ? "Evaluating In Memory..." : "Run Test Retrieval"}
              </button>

              {testResult && (
                <div
                  style={{
                    backgroundColor: "rgba(212, 175, 55, 0.08)",
                    border: "1px solid rgba(212, 175, 55, 0.4)",
                    borderRadius: "12px",
                    padding: "14px",
                    fontSize: "12.5px",
                    lineHeight: "1.5",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <strong>Cosine Similarity Score:</strong>
                    <span
                      style={{
                        color: testResult.score >= 0.72 ? "#03543F" : "#C53030",
                        fontWeight: "bold",
                      }}
                    >
                      {testResult.score} {testResult.score >= 0.72 ? "(Pass >= 0.72)" : "(Below 0.72 Threshold)"}
                    </span>
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    <strong>Best Matching Chunk:</strong>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        backgroundColor: "#FFFFFF",
                        padding: "8px",
                        borderRadius: "6px",
                        fontSize: "11.5px",
                        margin: "4px 0 0 0",
                        border: "1px solid #E5E0D8",
                      }}
                    >
                      {testResult.bestChunkText}
                    </pre>
                  </div>

                  <div>
                    <strong>Simulated Customer Answer:</strong>
                    <p style={{ margin: "4px 0 0 0", color: "#2A0845" }}>{testResult.simulatedAnswer}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: UNANSWERED QUESTIONS */}
        {activeTab === "unanswered" && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #E5E0D8",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#2A0845", fontFamily: "'Playfair Display', serif" }}>
                Unanswered Customer Questions (Fallback Triage)
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#6E6359" }}>
                These questions triggered a WhatsApp fallback because their similarity score was below the verified 0.72
                threshold. Click "Create Draft Entry" to add them to your knowledge base.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {unanswered.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #E5E0D8",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#2A0845" }}>
                      "{item.scrubbedQuestion}"
                    </div>
                    <div style={{ fontSize: "11px", color: "#8C6D23", marginTop: "2px" }}>
                      Top Score: {item.topScore} • Date: {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCreateDraftFromQuestion(item)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#2A0845",
                      color: "#D4AF37",
                      border: "none",
                      fontSize: "12.5px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>Create Draft Entry</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}

              {unanswered.length === 0 && !unansweredLoading && (
                <div style={{ padding: "30px", textAlign: "center", color: "#6E6359" }}>
                  🎉 No unanswered fallback questions! Your knowledge base is currently answering all inquiries.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: OPERATIONS & MAINTENANCE */}
        {activeTab === "ops" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {/* Card 1: Bulk Import */}
            <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "16px", border: "1px solid #E5E0D8" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <UploadCloud size={22} style={{ color: "#D4AF37" }} />
                <h4 style={{ margin: 0, fontSize: "16px", color: "#2A0845" }}>Bulk Import Existing Content</h4>
              </div>
              <p style={{ fontSize: "13px", color: "#6E6359", lineHeight: "1.5", marginBottom: "16px" }}>
                Imports verified policies, traditional poshak draping terms, and FAQs from the existing website directly as
                <strong> draft</strong> entries for your review.
              </p>
              <button
                onClick={handleBulkImport}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#2A0845",
                  color: "#D4AF37",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Run Bulk Import
              </button>
            </div>

            {/* Card 2: Expired Entries Cleanup */}
            <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "16px", border: "1px solid #E5E0D8" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <Clock size={22} style={{ color: "#D4AF37" }} />
                <h4 style={{ margin: 0, fontSize: "16px", color: "#2A0845" }}>Purge Expired Chunks</h4>
              </div>
              <p style={{ fontSize: "13px", color: "#6E6359", lineHeight: "1.5", marginBottom: "16px" }}>
                Runs the scheduled janitor job to archive entries whose <code>expiresAt</code> has passed and permanently
                deletes their vector chunks from the index.
              </p>
              <button
                onClick={handleCleanupExpired}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#2A0845",
                  color: "#D4AF37",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Run Expired Cleanup
              </button>
            </div>

            {/* Card 3: Re-index All Published */}
            <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "16px", border: "1px solid #E5E0D8" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <RefreshCw size={22} style={{ color: "#D4AF37" }} />
                <h4 style={{ margin: 0, fontSize: "16px", color: "#2A0845" }}>Re-index Vector Embeddings</h4>
              </div>
              <p style={{ fontSize: "13px", color: "#6E6359", lineHeight: "1.5", marginBottom: "16px" }}>
                Re-chunks and re-embeds all currently published entries using the standard <code>multilingual-e5-small</code>{" "}
                model and bumps the global KB version.
              </p>
              <button
                onClick={handleReindex}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "#2A0845",
                  color: "#D4AF37",
                  border: "none",
                  fontWeight: "bold",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Re-index All Published
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
