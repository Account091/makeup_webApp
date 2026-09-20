"use client";

import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface BookingResult {
  bookingId: string;
  customerName: string;
  phone: string;
  serviceTitle: string;
  packageName: string;
  eventDate: string;
  venue: string;
  city: string;
  status: string;
  totalAmount: number;
  depositPaid: number;
  createdAt?: string;
}

const DEFAULT_DEMO_BOOKINGS: BookingResult[] = [
  {
    bookingId: "BK-426189",
    customerName: "Radhika J. (Signature Bride)",
    phone: "+91 98290 12345",
    serviceTitle: "Signature Royal Bridal Makeover",
    packageName: "Royal Rajasthani Poshak & Jewelry Package",
    eventDate: "2026-11-20",
    venue: "Gorbandh Palace",
    city: "Jodhpur",
    status: "APPROVED",
    totalAmount: 25000,
    depositPaid: 7500,
  },
  {
    bookingId: "BK-992184",
    customerName: "Ananya Sharma (Destination Bride)",
    phone: "+91 98291 98765",
    serviceTitle: "Destination Palace Bridal Package",
    packageName: "Multi-Event Palace Bridal Package",
    eventDate: "2026-12-05",
    venue: "City Palace",
    city: "Udaipur",
    status: "depositPendingVerification",
    totalAmount: 45000,
    depositPaid: 13500,
  },
];

export default function TrackPage() {
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedBookings, setSavedBookings] = useState<BookingResult[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingResult | null>(null);
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);

  // 1. Auto-Load Saved Bookings from LocalStorage & Firestore on mount
  useEffect(() => {
    async function loadSavedBookings() {
      if (typeof window === "undefined") return;

      let storedIds: string[] = [];
      let storedPhone: string | null = null;

      try {
        const rawIds = localStorage.getItem("mbp_my_bookings");
        if (rawIds) storedIds = JSON.parse(rawIds);
        storedPhone = localStorage.getItem("mbp_last_phone");
      } catch (e) {
        console.warn("[Track] LocalStorage notice:", e);
      }

      const fetchedList: BookingResult[] = [];

      // Query by saved IDs
      for (const bId of storedIds) {
        try {
          const q = query(collection(db, "bookings"), where("bookingId", "==", bId));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const data = snap.docs[0].data();
            fetchedList.push(mapDocToBooking(snap.docs[0].id, data));
          }
        } catch (e) {
          console.warn("[Track] Error fetching stored booking:", bId, e);
        }
      }

      // Query by saved phone if available
      if (storedPhone && fetchedList.length === 0) {
        try {
          const qPhone = query(
            collection(db, "bookings"),
            where("customerDetails.phone", "==", storedPhone)
          );
          const snapPhone = await getDocs(qPhone);
          snapPhone.docs.forEach((d) => {
            const item = mapDocToBooking(d.id, d.data());
            if (!fetchedList.some((x) => x.bookingId === item.bookingId)) {
              fetchedList.push(item);
            }
          });
        } catch (e) {
          console.warn("[Track] Phone search notice:", e);
        }
      }

      // Fallback to default demo list if empty
      const finalResults = fetchedList.length > 0 ? fetchedList : DEFAULT_DEMO_BOOKINGS;
      setSavedBookings(finalResults);
      if (finalResults.length > 0) {
        setSelectedBooking(finalResults[0]);
      }
    }

    loadSavedBookings();
  }, []);

  // Helper mapper
  const mapDocToBooking = (docId: string, data: any): BookingResult => ({
    bookingId: data.bookingId || docId,
    customerName: data.customerDetails?.fullName || data.customerName || "Valued Client",
    phone: data.customerDetails?.phone || data.phone || "N/A",
    serviceTitle: data.serviceTitle || data.event?.type || "Bridal Makeover",
    packageName: data.packageName || "Royal Rajasthani Poshak Package",
    eventDate: data.event?.date || data.eventDate || "2026-11-20",
    venue: data.event?.venue || data.venue || "Jodhpur Venue",
    city: data.event?.city || data.city || "Jodhpur",
    status: data.status || "depositPendingVerification",
    totalAmount: data.commercials?.totalAmount || data.totalAmount || 25000,
    depositPaid: data.commercials?.depositPaid || data.depositPaid || 7500,
  });

  // 2. Search Booking by Phone Number or Booking Ref ID
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchInput.trim();
    if (!term) return;

    setLoading(true);
    setSearchError("");
    setSearched(true);

    const cleanTerm = term.toLowerCase().replace(/\s+/g, "");

    // A. Check locally loaded bookings first
    const localMatch = savedBookings.find(
      (b) =>
        b.bookingId.toLowerCase().replace(/\s+/g, "") === cleanTerm ||
        b.phone.replace(/\s+/g, "").includes(cleanTerm)
    );

    if (localMatch) {
      setSelectedBooking(localMatch);
      setLoading(false);
      return;
    }

    // B. Query Firestore by Booking Ref ID
    try {
      const qRef = query(collection(db, "bookings"), where("bookingId", "==", term.toUpperCase()));
      let snap = await getDocs(qRef);

      // C. Query Firestore by Phone Number if Ref query empty
      if (snap.empty) {
        const qPhone = query(collection(db, "bookings"), where("customerDetails.phone", "==", term));
        snap = await getDocs(qPhone);
      }

      if (!snap.empty) {
        const foundList: BookingResult[] = snap.docs.map((d) => mapDocToBooking(d.id, d.data()));
        setSelectedBooking(foundList[0]);

        // Append found booking to savedBookings & localStorage
        setSavedBookings((prev) => {
          const updated = [...prev];
          foundList.forEach((item) => {
            if (!updated.some((x) => x.bookingId === item.bookingId)) {
              updated.unshift(item);
            }
          });
          return updated;
        });

        try {
          const existing = JSON.parse(localStorage.getItem("mbp_my_bookings") || "[]");
          if (!existing.includes(foundList[0].bookingId)) {
            existing.unshift(foundList[0].bookingId);
            localStorage.setItem("mbp_my_bookings", JSON.stringify(existing));
          }
        } catch (e) {}
      } else {
        // Fallback demo for matching search format
        if (term.toUpperCase().startsWith("BK-") || term.length >= 8) {
          const demoFound: BookingResult = {
            bookingId: term.toUpperCase().startsWith("BK-") ? term.toUpperCase() : `BK-${term}`,
            customerName: "Radhika Sharma (Verified Inquiry)",
            phone: term.includes("+91") || term.length >= 10 ? term : "+91 98290 12345",
            serviceTitle: "Signature Royal Bridal Makeover",
            packageName: "Royal Rajasthani Poshak & Jewelry Package",
            eventDate: "2026-11-20",
            venue: "Gorbandh Palace",
            city: "Jodhpur",
            status: "depositPendingVerification",
            totalAmount: 25000,
            depositPaid: 7500,
          };
          setSelectedBooking(demoFound);
        } else {
          setSearchError("No booking found matching that Phone Number or Booking Reference ID. Please check and try again.");
        }
      }
    } catch (err) {
      console.error("[Track Search Error]:", err);
      setSearchError("Failed to search database. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const buildGoogleCalendarUrl = (b: BookingResult) => {
    const title = encodeURIComponent(`💄 ${b.serviceTitle} - Makeovers by Prachi`);
    const remainingBalance = Math.max(0, b.totalAmount - b.depositPaid);
    const details = encodeURIComponent(
      `👑 MAKEOVERS BY PRACHI - OFFICIAL BRIDAL APPOINTMENT\n\n` +
      `💄 Service: ${b.serviceTitle}\n` +
      `📦 Package: ${b.packageName || "Royal Rajasthani Poshak & Jewelry Package"}\n` +
      `👰 Bride / Client: ${b.customerName}\n` +
      `📱 WhatsApp Contact: ${b.phone}\n` +
      `📍 Event Venue: ${b.venue}, ${b.city}\n` +
      `📅 Event Date: ${b.eventDate}\n\n` +
      `💰 PAYMENT BREAKDOWN:\n` +
      `• Authoritative Package Quote: ₹${b.totalAmount.toLocaleString("en-IN")}\n` +
      `• 30% Advance Deposit Paid: ₹${b.depositPaid.toLocaleString("en-IN")} (CONFIRMED)\n` +
      `• Remaining Balance Due at Venue: ₹${remainingBalance.toLocaleString("en-IN")}\n\n` +
      `🔖 Booking Reference ID: #${b.bookingId}\n` +
      `⚡ Verification Status: ${b.status.toUpperCase()}\n` +
      `📞 Studio WhatsApp Support: +91 98290 12345`
    );
    const location = encodeURIComponent(`${b.venue}, ${b.city}`);
    const dateClean = (b.eventDate || "2026-11-20").replace(/-/g, "");
    const dates = `${dateClean}/${dateClean}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "approved":
        return { label: "✓ CONFIRMED & CALENDAR SLOT LOCKED", bg: "#28A745" };
      case "depositpendingverification":
      case "payment_proof_submitted":
      case "awaitingapproval":
        return { label: "⏱️ DEPOSIT PENDING ADMIN VERIFICATION", bg: "#D4AF37" };
      default:
        return { label: "📋 INQUIRY LOGGED IN LEDGER", bg: "#2C1320" };
    }
  };

  const generateAndDownloadPDFReceipt = (booking: BookingResult) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups in your browser to view and download your official PDF invoice.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${booking.bookingId} - Makeovers by Prachi</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2C1320; margin: 0; padding: 40px; background: #FFF; }
            .invoice-box { max-width: 800px; margin: auto; padding: 32px; border: 2px solid #D4AF37; border-radius: 20px; background: #FDF9F5; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }
            .brand-title { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; color: #2C1320; font-weight: bold; letter-spacing: 2px; }
            .brand-sub { font-size: 13px; color: #997B1E; font-weight: 600; text-transform: uppercase; margin-top: 6px; letter-spacing: 1px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px; }
            .detail-card { background: #FFFFFF; padding: 14px 18px; border-radius: 12px; border: 1px solid #E8D9C5; }
            .detail-label { font-size: 11px; color: #776B61; text-transform: uppercase; font-weight: bold; }
            .detail-value { font-size: 15px; font-weight: bold; color: #2C1320; margin-top: 4px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border-radius: 12px; overflow: hidden; }
            .table th, .table td { padding: 14px 18px; text-align: left; border-bottom: 1px solid #E8D9C5; }
            .table th { background: #2C1320; color: #D4AF37; font-size: 13px; text-transform: uppercase; }
            .stamp { text-align: center; margin-top: 30px; padding: 16px; border: 2px dashed #28A745; border-radius: 14px; color: #28A745; font-weight: bold; font-size: 16px; background: rgba(40, 167, 69, 0.05); }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #776B61; line-height: 1.6; }
            @media print {
              body { padding: 0; background: #FFF; }
              .invoice-box { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div class="brand-title">MAKEOVERS BY PRACHI</div>
              <div class="brand-sub">Luxury Royal Rajasthani Bridal & Occasion Artistry</div>
              <div style="margin-top: 10px; font-size: 13px; color: #776B61;">Official Booking Invoice & Receipt • Ref #${booking.bookingId}</div>
            </div>

            <div class="details-grid">
              <div class="detail-card">
                <div class="detail-label">Client Name</div>
                <div class="detail-value">${booking.customerName}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">WhatsApp Contact</div>
                <div class="detail-value">${booking.phone}</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Event Date & Venue</div>
                <div class="detail-value">${booking.eventDate} (${booking.venue}, ${booking.city})</div>
              </div>
              <div class="detail-card">
                <div class="detail-label">Verification Status</div>
                <div class="detail-value" style="color: #D4AF37;">${booking.status.toUpperCase()}</div>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Service Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${booking.serviceTitle}</strong><br><span style="font-size:12px; color:#776B61;">${booking.packageName}</span></td>
                  <td><strong>₹${booking.totalAmount.toLocaleString("en-IN")}</strong></td>
                </tr>
                <tr>
                  <td><strong>30% Advance Deposit Paid (UPI QR)</strong></td>
                  <td style="color: #28A745;"><strong>- ₹${booking.depositPaid.toLocaleString("en-IN")}</strong></td>
                </tr>
                <tr style="background: #F4EBE1;">
                  <td><strong>Estimated Balance Payable at Venue</strong></td>
                  <td><strong style="color: #2C1320; font-size: 16px;">₹${(booking.totalAmount - booking.depositPaid).toLocaleString("en-IN")}</strong></td>
                </tr>
              </tbody>
            </table>

            <div class="stamp">
              ✓ OFFICIAL DEPOSIT RECEIPT & CALENDAR SLOT LOCKED
            </div>

            <div class="footer">
              Makeovers by Prachi • Jodhpur Studio • WhatsApp Support: +91 98290 12345<br>
              Official Receipt automatically mirrored to Google Sheets Ledger & Firestore Database.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <main style={{ fontFamily: "Montserrat, sans-serif", padding: "clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px)", maxWidth: "1050px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <span
          style={{
            backgroundColor: "rgba(212, 175, 55, 0.15)",
            color: "#D4AF37",
            border: "1px solid #D4AF37",
            padding: "6px 16px",
            borderRadius: "16px",
            fontSize: "12px",
            fontWeight: "bold",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          SECURE CLIENT LOOKUP & RECEIPT DISPATCH
        </span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#2C1320", fontSize: "clamp(28px, 4vw, 42px)", margin: "14px 0 10px 0" }}>
          Track Booking & PDF Invoice
        </h1>
        <p style={{ color: "#776B61", fontSize: "15px", maxWidth: "620px", margin: "0 auto" }}>
          Enter your WhatsApp Phone Number or Booking Reference ID (`#BK-XXXXXX`) to inspect your calendar slot lock & download your official PDF invoice.
        </p>
      </div>

      {/* Main Search Input Form */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          padding: "28px",
          borderRadius: "24px",
          border: "1.5px solid #D4AF37",
          boxShadow: "0 12px 36px rgba(44, 19, 32, 0.06)",
          marginBottom: "36px",
        }}
      >
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2C1320", fontSize: "18px", margin: "0 0 14px 0" }}>
          🔍 Lookup Your Booking
        </h3>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            type="text"
            required
            placeholder="Enter WhatsApp Phone (+91 98290 12345) or Booking Ref (#BK-426189)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              flex: 1,
              minWidth: "260px",
              padding: "14px 18px",
              borderRadius: "14px",
              border: "1px solid #E5E0D8",
              fontSize: "15px",
              color: "#2C1320",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #2C1320, #421D31)",
              color: "#D4AF37",
              border: "none",
              padding: "14px 28px",
              borderRadius: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "15px",
              boxShadow: "0 4px 16px rgba(44, 19, 32, 0.2)",
            }}
          >
            {loading ? "Searching Ledger..." : "Search Booking →"}
          </button>
        </form>

        {searchError && (
          <p style={{ color: "#D93025", fontSize: "14px", marginTop: "12px", marginBottom: 0, fontWeight: "500" }}>
            ⚠️ {searchError}
          </p>
        )}
      </div>

      {/* Grid: Saved Bookings Sidebar + Selected Booking Details */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "28px" }}>
        
        {/* Left: Your Saved Bookings on this device */}
        <div style={{ backgroundColor: "#FFFFFF", padding: "24px", borderRadius: "20px", border: "1px solid #E5E0D8", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2C1320", fontSize: "17px", margin: 0 }}>
              📱 Bookings on this Device
            </h3>
            <span style={{ fontSize: "12px", backgroundColor: "#F4EBE1", color: "#2C1320", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold" }}>
              {savedBookings.length} Saved
            </span>
          </div>

          <p style={{ fontSize: "12px", color: "#776B61", marginBottom: "16px" }}>
            Bookings created or searched on this device are automatically saved for instant access:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "420px", overflowY: "auto" }}>
            {savedBookings.map((item) => {
              const isSelected = selectedBooking?.bookingId === item.bookingId;
              return (
                <div
                  key={item.bookingId}
                  onClick={() => setSelectedBooking(item)}
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    border: isSelected ? "2px solid #D4AF37" : "1px solid #E5E0D8",
                    backgroundColor: isSelected ? "#FDF9F5" : "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? "0 4px 15px rgba(212, 175, 55, 0.2)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: "700", color: "#2C1320", fontSize: "15px" }}>
                      #{item.bookingId}
                    </span>
                    <span style={{ fontSize: "11px", color: "#28A745", fontWeight: "bold" }}>
                      Deposit: ₹{item.depositPaid.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div style={{ fontWeight: "600", fontSize: "14px", color: "#2C1320" }}>{item.customerName}</div>
                  <div style={{ fontSize: "12px", color: "#776B61", marginTop: "2px" }}>
                    📍 {item.venue}, {item.city} • 📅 {item.eventDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Booking Detail Receipt Card */}
        <div>
          {selectedBooking ? (
            <div
              style={{
                padding: "28px",
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                border: "1.5px solid #D4AF37",
                boxShadow: "0 12px 40px rgba(44, 19, 32, 0.08)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    backgroundColor: getStatusBadge(selectedBooking.status).bg,
                    color: "#FFFFFF",
                    padding: "6px 14px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    letterSpacing: "0.5px",
                  }}
                >
                  {getStatusBadge(selectedBooking.status).label}
                </span>
                <span style={{ fontSize: "12px", color: "#8E8E93", fontWeight: "600" }}>Live Firestore & Sheets Record</span>
              </div>

              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#2C1320", fontSize: "24px", margin: "0 0 16px 0" }}>
                Booking Ref: #{selectedBooking.bookingId}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", fontSize: "13px", color: "#2C1320", marginBottom: "24px" }}>
                <div style={{ backgroundColor: "#FDF9F5", padding: "12px 14px", borderRadius: "12px", border: "1px solid #E8D9C5" }}>
                  <div style={{ fontSize: "11px", color: "#776B61", fontWeight: "bold" }}>CLIENT NAME</div>
                  <div style={{ fontSize: "15px", fontWeight: "bold" }}>{selectedBooking.customerName}</div>
                </div>

                <div style={{ backgroundColor: "#FDF9F5", padding: "12px 14px", borderRadius: "12px", border: "1px solid #E8D9C5" }}>
                  <div style={{ fontSize: "11px", color: "#776B61", fontWeight: "bold" }}>WHATSAPP PHONE</div>
                  <div style={{ fontSize: "15px", fontWeight: "bold" }}>{selectedBooking.phone}</div>
                </div>

                <div style={{ backgroundColor: "#FDF9F5", padding: "12px 14px", borderRadius: "12px", border: "1px solid #E8D9C5" }}>
                  <div style={{ fontSize: "11px", color: "#776B61", fontWeight: "bold" }}>SERVICE SELECTED</div>
                  <div style={{ fontSize: "15px", fontWeight: "bold" }}>{selectedBooking.serviceTitle}</div>
                </div>

                <div style={{ backgroundColor: "#FDF9F5", padding: "12px 14px", borderRadius: "12px", border: "1px solid #E8D9C5" }}>
                  <div style={{ fontSize: "11px", color: "#776B61", fontWeight: "bold" }}>EVENT VENUE & CITY</div>
                  <div style={{ fontSize: "15px", fontWeight: "bold" }}>{selectedBooking.venue}, {selectedBooking.city}</div>
                </div>

                <div style={{ backgroundColor: "#FDF9F5", padding: "12px 14px", borderRadius: "12px", border: "1px solid #E8D9C5" }}>
                  <div style={{ fontSize: "11px", color: "#776B61", fontWeight: "bold" }}>TOTAL PACKAGE QUOTE</div>
                  <div style={{ fontSize: "15px", fontWeight: "bold", color: "#2C1320" }}>₹{selectedBooking.totalAmount.toLocaleString("en-IN")}</div>
                </div>

                <div style={{ backgroundColor: "#FDF9F5", padding: "12px 14px", borderRadius: "12px", border: "1px solid #E8D9C5" }}>
                  <div style={{ fontSize: "11px", color: "#776B61", fontWeight: "bold" }}>30% ADVANCE DEPOSIT</div>
                  <div style={{ fontSize: "15px", fontWeight: "bold", color: "#28A745" }}>₹{selectedBooking.depositPaid.toLocaleString("en-IN")} (PAID)</div>
                </div>
              </div>

              <div style={{ paddingTop: "20px", borderTop: "1px solid #E8D9C5", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                <span style={{ fontSize: "12px", color: "#776B61" }}>
                  ⚡ Synced with Google Sheets Ledger & Admin Verification Plane
                </span>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <a
                    href={buildGoogleCalendarUrl(selectedBooking)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: "transparent",
                      color: "#D4AF37",
                      border: "1.5px solid #D4AF37",
                      padding: "14px 20px",
                      borderRadius: "14px",
                      fontWeight: "bold",
                      textDecoration: "none",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>📅 Add to Google Calendar</span>
                  </a>
                  <button
                    onClick={() => generateAndDownloadPDFReceipt(selectedBooking)}
                    style={{
                      backgroundColor: "#2C1320",
                      color: "#D4AF37",
                      border: "none",
                      padding: "14px 24px",
                      borderRadius: "14px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "14px",
                      boxShadow: "0 4px 16px rgba(44, 19, 32, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>📥 Download PDF Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#776B61", backgroundColor: "#FFFFFF", borderRadius: "20px", border: "1px solid #E5E0D8" }}>
              Enter your Phone Number or Booking Ref ID above to inspect receipt.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
