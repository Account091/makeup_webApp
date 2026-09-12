import React from "react";

export default function ReviewsPage() {
  const reviews = [
    {
      name: "Priya Sharma",
      event: "Royal Bridal Makeover (Gorbandh Palace, Jodhpur)",
      rating: "5.0 ★",
      comment: "Prachi was an absolute dream! She styled my traditional Poshak so authentically. The airbrush base lasted through the 14-hour wedding ceremony without single touch-up!",
      date: "February 2026",
    },
    {
      name: "Ananya Rathore",
      event: "Engagement Glam (Udaipur)",
      rating: "5.0 ★",
      comment: "Super professional! Her team arrived on time at our venue. The dewy glass-skin finish was exactly what I envisioned for my sunset ring ceremony.",
      date: "January 2026",
    },
    {
      name: "Pooja Mehta",
      event: "Destination Sangeet & Bridal (Jaipur)",
      rating: "4.9 ★",
      comment: "Prachi and her team handled 8 of our family members smoothly. Highly recommended for any royal Rajasthani bride!",
      date: "December 2025",
    },
  ];

  return (
    <main style={{ fontFamily: "Montserrat, sans-serif", padding: "60px 20px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ fontFamily: "Playfair Display, serif", color: "#2C1320", fontSize: "36px", margin: "0 0 10px 0" }}>
          Client Reviews & Satisfaction Score
        </h1>
        <div style={{ fontSize: "28px", color: "#D4AF37", fontWeight: "bold" }}>
          4.93 / 5.0 ★ <span style={{ fontSize: "14px", color: "#8E8E93" }}>(NPS +88 Score)</span>
        </div>
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {reviews.map((r, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid #E5E0D8",
              boxShadow: "0 6px 20px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div>
                <h3 style={{ fontFamily: "Playfair Display, serif", color: "#2C1320", fontSize: "18px", margin: 0 }}>
                  {r.name}
                </h3>
                <span style={{ fontSize: "12px", color: "#8E8E93" }}>{r.event}</span>
              </div>
              <span style={{ backgroundColor: "#2C1320", color: "#D4AF37", padding: "6px 12px", borderRadius: "12px", fontWeight: "bold", fontSize: "14px" }}>
                {r.rating}
              </span>
            </div>
            <p style={{ color: "#2C1320", fontSize: "14px", lineHeight: "1.6", fontStyle: "italic", margin: "12px 0 6px 0" }}>
              "{r.comment}"
            </p>
            <span style={{ fontSize: "11px", color: "#8E8E93" }}>{r.date}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
