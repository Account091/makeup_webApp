"use client";

import React, { useState, useEffect } from "react";
import {
  GeographyMetrics,
  ServiceLocationMatrixCell,
  SupplyDemandAnalysis,
  ZeroResultDemandRecord,
} from "../../lib/marketplace/marketplace-types";

export default function MarketplaceGeographyScreen() {
  const [geography, setGeography] = useState<GeographyMetrics[]>([]);
  const [matrix, setMatrix] = useState<ServiceLocationMatrixCell[]>([]);
  const [supplyDemand, setSupplyDemand] = useState<SupplyDemandAnalysis[]>([]);
  const [zeroResult, setZeroResult] = useState<ZeroResultDemandRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resGeo, resSupply] = await Promise.all([
        fetch("/api/analytics/marketplace/geography"),
        fetch("/api/analytics/marketplace/supply-demand"),
      ]);

      const dataGeo = await resGeo.json();
      if (dataGeo.success) {
        setGeography(dataGeo.geography);
        setMatrix(dataGeo.serviceLocationMatrix);
      }

      const dataSupply = await resSupply.json();
      if (dataSupply.success) {
        setSupplyDemand(dataSupply.supplyDemand);
        setZeroResult(dataSupply.zeroResultDemand);
      }
    } catch (err) {
      console.error("Failed to fetch geography data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1280, margin: "0 auto", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: "0 0 8px 0" }}>
          Marketplace Geography & Regional Supply Console
        </h1>
        <p style={{ fontSize: 16, color: "#6B7280", margin: 0 }}>
          Monitor regional demand, supply pressure, zero-result search intelligence, and Service x Location matrix.
        </p>
      </div>

      {/* City Performance Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        {geography.map((g) => (
          <div key={g.locationId} style={{ background: "#FFFFFF", padding: 20, borderRadius: 12, border: "1px solid #E5E7EB" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <strong style={{ fontSize: 16, color: "#111827" }}>{g.locationName}</strong>
              <span style={{ fontSize: 11, fontWeight: 700, background: g.demandLevel === "HIGH" ? "#FEE2E2" : "#FEF3C7", color: g.demandLevel === "HIGH" ? "#991B1B" : "#92400E", padding: "2px 8px", borderRadius: 4 }}>
                {g.demandLevel} DEMAND
              </span>
            </div>

            <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 4 }}>
              ₹{g.gmv.toLocaleString("en-IN")}
            </div>

            <div style={{ fontSize: 13, color: "#4B5563" }}>
              {g.bookingsCount} Bookings • {g.activeArtistsCount} Active Artists
            </div>

            <div style={{ fontSize: 12, color: "#059669", marginTop: 8, fontWeight: 600 }}>
              Conversion: {g.conversionRatePercent}%
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Supply Demand Pressure & Zero Result */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
        {/* Supply / Demand Pressure */}
        <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E5E7EB" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px 0", color: "#111827" }}>
            Supply / Demand Pressure Indicators
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {supplyDemand.map((sd, idx) => (
              <div key={idx} style={{ padding: 14, borderRadius: 8, background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <strong style={{ fontSize: 14, color: "#111827" }}>
                    {sd.locationId.toUpperCase()} • {sd.serviceCategory.toUpperCase()}
                  </strong>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: sd.demandPressureTag === "HIGH_DEMAND_LOW_SUPPLY" ? "#FEE2E2" : "#D1FAE5", color: sd.demandPressureTag === "HIGH_DEMAND_LOW_SUPPLY" ? "#991B1B" : "#065F46" }}>
                    {sd.demandPressureTag}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>
                  Search Demand: {sd.searchDemandCount} searches • Eligible Artists: {sd.eligibleActiveArtists} (Ratio: {sd.ratio})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zero Result Demand */}
        <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E5E7EB" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px 0", color: "#111827" }}>
            Zero-Result Search Intelligence
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {zeroResult.map((zr, idx) => (
              <div key={idx} style={{ padding: 14, borderRadius: 8, background: "#FEF3C7", border: "1px solid #FDE68A", fontSize: 13, color: "#92400E" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: 4 }}>
                  <span>{zr.locationId.toUpperCase()} • {zr.serviceCategory.toUpperCase()}</span>
                  <span>{zr.searchCount} Zero-Result Searches</span>
                </div>
                <div>Requested Date: {zr.requestedDate || "Any Date"}</div>
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.8 }}>
                  Tag: <strong>{zr.demandTag}</strong> (Expansion opportunity)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service x Location Matrix */}
      <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #E5E7EB" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px 0", color: "#111827" }}>
          Service × Location Performance Matrix
        </h2>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "2px solid #E5E7EB", textAlign: "left" }}>
              <th style={{ padding: 12 }}>Service Category</th>
              <th style={{ padding: 12 }}>Location</th>
              <th style={{ padding: 12 }}>Demand Label</th>
              <th style={{ padding: 12, textAlign: "right" }}>GMV</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((m, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #F3F4F6" }}>
                <td style={{ padding: 12, fontWeight: 600, color: "#111827" }}>{m.serviceCategory}</td>
                <td style={{ padding: 12, color: "#4B5563" }}>{m.locationId.toUpperCase()}</td>
                <td style={{ padding: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: m.demandLabel === "VERY_HIGH" ? "#FEE2E2" : "#FEF3C7", color: m.demandLabel === "VERY_HIGH" ? "#991B1B" : "#92400E" }}>
                    {m.demandLabel}
                  </span>
                </td>
                <td style={{ padding: 12, textAlign: "right", fontWeight: 700, color: "#111827" }}>
                  ₹{m.gmv.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
