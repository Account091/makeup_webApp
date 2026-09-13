"use client";

import React, { useState, useEffect } from "react";
import { RankingWeightConfig } from "../../lib/marketplace/marketplace-types";

export default function MarketplaceRankingSettingsScreen() {
  const [activeConfig, setActiveConfig] = useState<RankingWeightConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Form fields
  const [relevanceWeight, setRelevanceWeight] = useState(0.30);
  const [availabilityWeight, setAvailabilityWeight] = useState(0.20);
  const [trustWeight, setTrustWeight] = useState(0.15);
  const [ratingWeight, setRatingWeight] = useState(0.15);
  const [responseWeight, setResponseWeight] = useState(0.08);
  const [completionWeight, setCompletionWeight] = useState(0.07);
  const [locationWeight, setLocationWeight] = useState(0.05);

  const [minReviewsM, setMinReviewsM] = useState(5);
  const [marketplaceAvgC, setMarketplaceAvgC] = useState(4.8);

  const [maxOrgTopN, setMaxOrgTopN] = useState(2);
  const [topNSlotCount, setTopNSlotCount] = useState(10);

  const [coldStartEnabled, setColdStartEnabled] = useState(true);
  const [coldStartDays, setColdStartDays] = useState(30);
  const [coldStartBoost, setColdStartBoost] = useState(1.15);

  // Preview Simulation State
  const [simulationQuery, setSimulationQuery] = useState("Bridal Makeup Jodhpur");
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const [simulating, setSimulating] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/ranking");
      const data = await res.json();
      if (data.success && data.config) {
        const c: RankingWeightConfig = data.config;
        setActiveConfig(c);
        if (c.weights) {
          setRelevanceWeight((c.weights.relevance || 30) / 100);
          setAvailabilityWeight((c.weights.availability || 20) / 100);
          setTrustWeight((c.weights.trust || 15) / 100);
          setRatingWeight((c.weights.rating || 15) / 100);
          setResponseWeight((c.weights.responseRate || 8) / 100);
          setCompletionWeight((c.weights.completionRate || 7) / 100);
          setLocationWeight((c.weights.locationMatch || 5) / 100);
        }

        setMinReviewsM(c.minReviewThreshold ?? 5);
        setMarketplaceAvgC(4.8);
        setMaxOrgTopN(c.diversityOrgLimit ?? 2);
        setTopNSlotCount(10);
        setColdStartEnabled(true);
        setColdStartDays(30);
        setColdStartBoost((c.newProviderBoostPercent || 10) / 100);
      }
    } catch (err) {
      console.error("Failed to fetch ranking config:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const totalWeight =
    relevanceWeight +
    availabilityWeight +
    trustWeight +
    ratingWeight +
    responseWeight +
    completionWeight +
    locationWeight;

  const handleSaveNewVersion = async () => {
    if (Math.abs(totalWeight - 1.0) > 0.001) {
      alert(`Weights must sum to 100% (Current sum: ${(totalWeight * 100).toFixed(1)}%)`);
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const newVersion = `v${Date.now()}`;
      const payload: Partial<RankingWeightConfig> = {
        version: newVersion,
        weights: {
          relevance: relevanceWeight * 100,
          availability: availabilityWeight * 100,
          trust: trustWeight * 100,
          rating: ratingWeight * 100,
          responseRate: responseWeight * 100,
          completionRate: completionWeight * 100,
          locationMatch: locationWeight * 100,
        },
        minReviewThreshold: minReviewsM,
        diversityOrgLimit: maxOrgTopN,
        newProviderBoostPercent: coldStartBoost * 100,
      };

      const res = await fetch("/api/marketplace/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setNotice(`Ranking rules updated successfully! Now active as version ${newVersion}`);
        fetchConfig();
      }
    } catch (err) {
      console.error("Failed to save config:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const customConfig: Partial<RankingWeightConfig> = {
        weights: {
          relevance: relevanceWeight * 100,
          availability: availabilityWeight * 100,
          trust: trustWeight * 100,
          rating: ratingWeight * 100,
          responseRate: responseWeight * 100,
          completionRate: completionWeight * 100,
          locationMatch: locationWeight * 100,
        },
        minReviewThreshold: minReviewsM,
        diversityOrgLimit: maxOrgTopN,
        newProviderBoostPercent: coldStartBoost * 100,
      };


      const res = await fetch("/api/marketplace/ranking/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: { keyword: simulationQuery },
          customConfig,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResults(data.previewResults);
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1280, margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: "0 0 8px 0" }}>
              Marketplace Ranking & Discovery Console
            </h1>
            <p style={{ fontSize: 16, color: "#6B7280", margin: 0 }}>
              Configure versioned deterministic ranking parameters, Bayesian rating smoothing, and run preview simulations.
            </p>
          </div>
          {activeConfig && (
            <div
              style={{
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                padding: "8px 16px",
                borderRadius: 8,
                color: "#065F46",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Active Version: {activeConfig.version}
            </div>
          )}
        </div>
      </div>

      {notice && (
        <div
          style={{
            background: "#D1FAE5",
            borderLeft: "4px solid #10B981",
            padding: 16,
            borderRadius: 8,
            marginBottom: 24,
            color: "#065F46",
            fontWeight: 600,
          }}
        >
          {notice}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>Loading ranking configuration...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {/* Left Column: Configuration Controls */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              padding: 24,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 20px 0", color: "#111827" }}>
              Ranking Weight Allocation
            </h2>

            {/* Total Weight Status */}
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: Math.abs(totalWeight - 1.0) < 0.001 ? "#EFF6FF" : "#FEF2F2",
                color: Math.abs(totalWeight - 1.0) < 0.001 ? "#1E40AF" : "#991B1B",
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Total Allocated Weight:</span>
              <span>{(totalWeight * 100).toFixed(1)}% / 100%</span>
            </div>

            {/* Weight Sliders */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Relevance Match", value: relevanceWeight, setter: setRelevanceWeight },
                { label: "Availability Score", value: availabilityWeight, setter: setAvailabilityWeight },
                { label: "Trust & Verification", value: trustWeight, setter: setTrustWeight },
                { label: "Bayesian Rating", value: ratingWeight, setter: setRatingWeight },
                { label: "Response Speed", value: responseWeight, setter: setResponseWeight },
                { label: "Completion Rate", value: completionWeight, setter: setCompletionWeight },
                { label: "Location Proximity", value: locationWeight, setter: setLocationWeight },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                    <span>{item.label}</span>
                    <span>{(item.value * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.01"
                    value={item.value}
                    onChange={(e) => item.setter(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#4F46E5" }}
                  />
                </div>
              ))}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #E5E7EB", margin: "24px 0" }} />

            {/* Bayesian Smoothing & Advanced Settings */}
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px 0", color: "#111827" }}>
              Bayesian Rating Smoothing
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>
                  Min Review Threshold (m)
                </label>
                <input
                  type="number"
                  value={minReviewsM}
                  onChange={(e) => setMinReviewsM(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>
                  Marketplace Avg Rating (C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={marketplaceAvgC}
                  onChange={(e) => setMarketplaceAvgC(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB" }}
                />
              </div>
            </div>

            {/* Diversity & Cold Start */}
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px 0", color: "#111827" }}>
              Organization Diversity & Cold Start Boost
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>
                  Max per Org in Top N
                </label>
                <input
                  type="number"
                  value={maxOrgTopN}
                  onChange={(e) => setMaxOrgTopN(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 4 }}>
                  Cold Start Multiplier
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={coldStartBoost}
                  onChange={(e) => setColdStartBoost(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB" }}
                />
              </div>
            </div>

            <button
              onClick={handleSaveNewVersion}
              disabled={saving || Math.abs(totalWeight - 1.0) > 0.001}
              style={{
                width: "100%",
                padding: "14px",
                background: "#4F46E5",
                color: "#FFFFFF",
                fontWeight: 700,
                borderRadius: 10,
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: 15,
              }}
            >
              {saving ? "Deploying New Version..." : "Save & Activate New Rules Version"}
            </button>
          </div>

          {/* Right Column: Live Simulation & Preview */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              padding: 24,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px 0", color: "#111827" }}>
              Live Simulation & Ranking Preview
            </h2>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
              Test your modified weight allocation against real marketplace listings before publishing.
            </p>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <input
                type="text"
                value={simulationQuery}
                onChange={(e) => setSimulationQuery(e.target.value)}
                placeholder="Enter search prompt or keyword..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #D1D5DB" }}
              />
              <button
                onClick={handleRunSimulation}
                disabled={simulating}
                style={{
                  padding: "10px 20px",
                  background: "#111827",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {simulating ? "Simulating..." : "Run Preview"}
              </button>
            </div>

            {/* Results preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {simulationResults.length > 0 ? (
                simulationResults.map((item, index) => (
                  <div
                    key={item.listing.id}
                    style={{
                      background: "#F9FAFB",
                      padding: 14,
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: 4 }}>
                      <span>
                        #{index + 1} {item.listing.title} ({item.listing.organizationName})
                      </span>
                      <span style={{ color: "#4F46E5" }}>Score: {item.finalScore.toFixed(2)}</span>
                    </div>
                    <div style={{ color: "#6B7280", fontSize: 12 }}>
                      Rating: {item.listing.bayesianRating.toFixed(2)} ({item.listing.reviewCount} revs) • Price: ₹{item.listing.basePrice}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: 30, color: "#9CA3AF" }}>
                  Click "Run Preview" to simulate marketplace ranking order with custom settings.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
