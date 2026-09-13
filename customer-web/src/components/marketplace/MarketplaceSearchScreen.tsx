"use client";

import React, { useState, useEffect } from "react";
import {
  MarketplaceSearchQueryV85,
  MarketplaceSearchResultV85,
  RankedListingResult,
} from "../../lib/marketplace/marketplace-types";

export default function MarketplaceSearchScreen() {
  const [naturalPrompt, setNaturalPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const [query, setQuery] = useState<MarketplaceSearchQueryV85>({
    locationId: undefined,
    serviceCategory: undefined,
    eventDate: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    verifiedOnly: false,
    sort: "RECOMMENDED",
    page: 1,
    pageSize: 6,
  });


  const [searchResult, setSearchResult] = useState<MarketplaceSearchResultV85 | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedListingId, setExpandedListingId] = useState<string | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  const executeSearch = async (searchParams: MarketplaceSearchQueryV85) => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchParams),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResult(data.result);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!naturalPrompt.trim()) return;

    setAiLoading(true);
    setAiExplanation(null);
    try {
      const res = await fetch("/api/ai/marketplace-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: naturalPrompt, page: 1, limit: 6 }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResult(data.searchResult);
        setAiExplanation(data.aiExplanation);
        if (data.parsedQuery) {
          setQuery((prev) => ({ ...prev, ...data.parsedQuery }));
        }
      }
    } catch (err) {
      console.error("AI Search failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(query);
  }, [query.page, query.sort, query.verifiedOnly, query.locationId, query.serviceCategory]);


  const handleFilterChange = (field: keyof MarketplaceSearchQueryV85, value: any) => {
    setQuery((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : value,
      page: 1, // reset page on filter change
    }));
  };

  const handleApplyFilters = () => {
    executeSearch({ ...query, page: 1 });
  };

  const handleCreateAlert = async () => {
    try {
      const res = await fetch("/api/marketplace/search-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user_customer_demo",
          locationId: query.locationId,
          serviceCategory: query.serviceCategory,
          maxPrice: query.maxPrice,
          searchQueryText: naturalPrompt || "marketplace search",

        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlertSuccess("Search alert saved! You'll be notified of new matching listings.");
        setTimeout(() => setAlertSuccess(null), 4000);
      }
    } catch (err) {
      console.error("Save alert failed:", err);
    }
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1280, margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: "0 0 8px 0" }}>
          Marketplace Discovery & Search
        </h1>
        <p style={{ fontSize: 16, color: "#6B7280", margin: 0 }}>
          Find verified makeup artists & beauty organizations across Rajasthan with deterministic transparent ranking.
        </p>
      </div>

      {/* AI Search Bar */}
      <div
        style={{
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
          borderRadius: 16,
          padding: 24,
          color: "#FFFFFF",
          marginBottom: 32,
          boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 20 }}>✨</span>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>AI Marketplace Discovery Assistant</h2>
        </div>
        <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 16 }}>
          Describe what you're looking for in natural language. Our AI safely parses your intent into verified search criteria.
        </p>
        <form onSubmit={handleAiSearch} style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            value={naturalPrompt}
            onChange={(e) => setNaturalPrompt(e.target.value)}
            placeholder="e.g. Premium bridal makeup artist in Jaipur under ₹20,000 for December 15..."
            style={{
              flex: 1,
              padding: "14px 18px",
              borderRadius: 10,
              border: "none",
              fontSize: 15,
              color: "#111827",
              outline: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
          <button
            type="submit"
            disabled={aiLoading}
            style={{
              background: "#FFFFFF",
              color: "#4F46E5",
              fontWeight: 700,
              padding: "14px 24px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              transition: "transform 0.1s",
            }}
          >
            {aiLoading ? "Analyzing Intent..." : "Find Artists"}
          </button>
        </form>

        {/* Quick Prompts */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {[
            "Top rated bridal makeup in Jodhpur",
            "Jaipur wedding artist under ₹15,000",
            "Udaipur destination package with verified reviews",
          ].map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => {
                setNaturalPrompt(promptText);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.18)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* AI Explanation Banner */}
      {aiExplanation && (
        <div
          style={{
            background: "#EFF6FF",
            borderLeft: "4px solid #3B82F6",
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            fontSize: 14,
            color: "#1E40AF",
          }}
        >
          <strong>🧠 AI Discovery Engine:</strong> {aiExplanation}
        </div>
      )}

      {/* Main Grid: Filters & Results */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 32 }}>
        {/* Sidebar Filters */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 12,
            border: "1px solid #E5E7EB",
            padding: 20,
            height: "fit-content",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#111827" }}>Search Filters</h3>
            <button
              onClick={() => {
                setQuery({
                  locationId: undefined,
                  serviceCategory: undefined,
                  eventDate: undefined,
                  minPrice: undefined,
                  maxPrice: undefined,
                  minRating: undefined,
                  verifiedOnly: false,
                  sort: "RECOMMENDED",
                  page: 1,
                  pageSize: 6,
                });

                setNaturalPrompt("");
                setAiExplanation(null);
              }}
              style={{ background: "none", border: "none", color: "#6B7280", fontSize: 13, cursor: "pointer" }}
            >
              Reset
            </button>
          </div>

          {/* Location */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              City / Location
            </label>
            <select
              value={query.locationId || ""}
              onChange={(e) => handleFilterChange("locationId", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #D1D5DB" }}
            >
              <option value="">All Locations</option>
              <option value="jodhpur">Jodhpur</option>
              <option value="jaipur">Jaipur</option>
              <option value="udaipur">Udaipur</option>
              <option value="destination">Destination Weddings</option>
            </select>
          </div>

          {/* Service Category */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Service Type
            </label>
            <select
              value={query.serviceCategory || ""}
              onChange={(e) => handleFilterChange("serviceCategory", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #D1D5DB" }}
            >
              <option value="">All Services</option>
              <option value="Bridal Makeup">Bridal Makeup</option>
              <option value="Sangeet & Engagement">Sangeet & Engagement</option>
              <option value="Party Makeup">Party Makeup</option>
              <option value="Hair Styling & Draping">Hair Styling & Draping</option>
            </select>
          </div>

          {/* Event Date */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Event Date (Availability)
            </label>
            <input
              type="date"
              value={query.eventDate || ""}
              onChange={(e) => handleFilterChange("eventDate", e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #D1D5DB" }}
            />
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Max Budget (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 25000"
              value={query.maxPrice || ""}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #D1D5DB" }}
            />
          </div>

          {/* Verified Only */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={query.verifiedOnly || false}
                onChange={(e) => handleFilterChange("verifiedOnly", e.target.checked)}
              />
              <span style={{ fontWeight: 600, color: "#111827" }}>Verified Providers Only</span>
            </label>
          </div>

          <button
            onClick={handleApplyFilters}
            style={{
              width: "100%",
              padding: "12px",
              background: "#111827",
              color: "#FFFFFF",
              fontWeight: 600,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            Apply Filters
          </button>

          <button
            onClick={handleCreateAlert}
            style={{
              width: "100%",
              padding: "10px",
              background: "#F3F4F6",
              color: "#374151",
              fontWeight: 600,
              borderRadius: 8,
              border: "1px solid #D1D5DB",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            🔔 Save Search Alert
          </button>

          {alertSuccess && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#059669", textAlign: "center" }}>
              {alertSuccess}
            </div>
          )}
        </div>

        {/* Results Column */}
        <div>
          {/* Controls Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",

              marginBottom: 20,
              background: "#FFFFFF",
              padding: "16px 20px",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
            }}
          >
            <div style={{ fontSize: 14, color: "#6B7280" }}>
              Showing{" "}
              <strong style={{ color: "#111827" }}>
                {searchResult ? searchResult.results.length : 0}
              </strong>{" "}
              of <strong style={{ color: "#111827" }}>{searchResult ? searchResult.totalEligibleCount : 0}</strong> verified options
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>Sort By:</label>
              <select
                value={query.sort || "RECOMMENDED"}
                onChange={(e) => handleFilterChange("sort", e.target.value as any)}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 14 }}
              >
                <option value="RECOMMENDED">✨ Recommended (V8.5 Engine)</option>
                <option value="RATING_HIGH">⭐ Highest Bayesian Rating</option>
                <option value="PRICE_LOW">💰 Price: Low to High</option>
                <option value="PRICE_HIGH">💎 Price: High to Low</option>
                <option value="EXPERIENCE">👑 Most Experienced</option>
              </select>
            </div>

          </div>

          {/* Results Grid / List */}
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>Searching marketplace...</div>
          ) : searchResult && searchResult.results.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {searchResult.results.map((item: any) => {
                const listing = item.listing;
                const exp = item.explanation;
                const id = listing.listingId;
                const isExpanded = expandedListingId === id;

                return (
                  <div
                    key={id}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 12,
                      border: exp.isPromoted ? "2px solid #8B5CF6" : "1px solid #E5E7EB",
                      padding: 20,
                      boxShadow: exp.isPromoted ? "0 4px 12px rgba(139, 92, 246, 0.15)" : "none",
                      position: "relative",
                    }}
                  >
                    {/* Promoted Badge */}
                    {exp.isPromoted && (
                      <div
                        style={{
                          position: "absolute",
                          top: 14,
                          right: 16,
                          background: "#8B5CF6",
                          color: "#FFFFFF",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 12,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Sponsored
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 20 }}>
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 10,
                          background: "#F3F4F6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 32,
                        }}
                      >
                        💄
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <h4 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#111827" }}>
                            {listing.title}
                          </h4>
                          <span
                            style={{
                              background: "#D1FAE5",
                              color: "#065F46",
                              fontSize: 12,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 6,
                            }}
                          >
                            ✓ Verified
                          </span>
                          {exp.isNewProviderBoost && (
                            <span
                              style={{
                                background: "#FEF3C7",
                                color: "#92400E",
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 6,
                              }}
                            >
                              NEW PRO
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 14, color: "#4B5563", marginBottom: 8 }}>
                          Organization: <strong>{listing.organizationId}</strong> ({listing.locationIds?.join(", ").toUpperCase()})
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 14 }}>
                          <div style={{ color: "#D97706", fontWeight: 700 }}>
                            ★ {(listing.ratingSummary || 5.0).toFixed(2)}{" "}
                            <span style={{ color: "#6B7280", fontWeight: 400 }}>
                              ({listing.reviewCount} reviews)
                            </span>
                          </div>

                          <div style={{ fontWeight: 800, color: "#111827", fontSize: 16 }}>
                            ₹{listing.startingPrice?.toLocaleString("en-IN")}
                          </div>

                          <div style={{ fontSize: 12, color: "#059669", background: "#ECFDF5", padding: "2px 8px", borderRadius: 4 }}>
                            Verified Provider
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expand Score Breakdown Button */}
                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 12,
                        borderTop: "1px solid #F3F4F6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",

                      }}
                    >
                      <button
                        onClick={() => setExpandedListingId(isExpanded ? null : id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#4F46E5",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        {isExpanded
                          ? "Hide Ranking Score Breakdown ▲"
                          : `View Deterministic Score Breakdown (Score: ${(exp.totalScore || 90).toFixed(1)}) ▼`}
                      </button>

                      <button
                        style={{
                          background: "#4F46E5",
                          color: "#FFFFFF",
                          fontWeight: 600,
                          padding: "8px 16px",
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        Book Listing
                      </button>
                    </div>

                    {/* Detailed Score breakdown */}
                    {isExpanded && exp.breakdown && (
                      <div
                        style={{
                          marginTop: 12,
                          background: "#F9FAFB",
                          padding: 16,
                          borderRadius: 8,
                          border: "1px solid #E5E7EB",
                          fontSize: 13,
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: 8, color: "#111827" }}>
                          Transparent Ranking Metrics (Total Weight Score: {(exp.totalScore || 90).toFixed(2)})
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                          <div>Relevance Score: <strong>{exp.breakdown.relevanceScore?.toFixed(1)}</strong></div>
                          <div>Bayesian Rating: <strong>{exp.breakdown.smoothedRatingScore?.toFixed(1)}</strong></div>
                          <div>Trust Score: <strong>{exp.breakdown.trustScore?.toFixed(1)}</strong></div>
                          <div>Availability: <strong>{exp.breakdown.availabilityScore?.toFixed(1)}</strong></div>
                          <div>Response Rate: <strong>{exp.breakdown.responseScore?.toFixed(1)}</strong></div>
                          <div>Completion Rate: <strong>{exp.breakdown.completionScore?.toFixed(1)}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          ) : (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                padding: 40,
                textAlign: "center",
                color: "#6B7280",
              }}
            >
              No verified marketplace listings found matching your search criteria.
            </div>
          )}

          {/* Pagination Controls */}
          {searchResult && searchResult.totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",

                gap: 16,
                marginTop: 24,
              }}
            >
              <button
                disabled={query.page === 1}
                onClick={() => setQuery((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  background: query.page === 1 ? "#F3F4F6" : "#FFFFFF",
                  cursor: query.page === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>
                Page {searchResult.page} of {searchResult.totalPages}
              </span>
              <button
                disabled={query.page === searchResult.totalPages}
                onClick={() => setQuery((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  background: query.page === searchResult.totalPages ? "#F3F4F6" : "#FFFFFF",
                  cursor: query.page === searchResult.totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
