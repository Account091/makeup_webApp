import React from "react";

export default function GalleryPage() {
  const galleryItems = [
    {
      title: "Royal Rajasthani Poshak Look",
      category: "Jodhpur Palace Bridal",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
      description: "Airbrush finish with traditional Borla & heavy velvet Poshak draping.",
    },
    {
      title: "Soft Dewy Ring Ceremony Glam",
      category: "Engagement",
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
      description: "Glowing glass skin base with soft romantic waves.",
    },
    {
      title: "Jaipur Destination Royal Wedding",
      category: "Destination Wedding",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800",
      description: "Full day palace coverage with gold leaf highlights.",
    },
    {
      title: "Udaipur Lakefront Reception Look",
      category: "Reception Glam",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
      description: "Classic bold lip with textured vintage Hollywood waves.",
    },
  ];

  return (
    <main style={{ fontFamily: "Montserrat, sans-serif", padding: "60px 20px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <h1 style={{ fontFamily: "Playfair Display, serif", color: "#2C1320", fontSize: "36px", margin: "0 0 10px 0" }}>
          Bridal Portfolio & Transformation Gallery
        </h1>
        <p style={{ color: "#8E8E93", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
          Explore real brides styled by Prachi across Jodhpur, Jaipur, Udaipur & Destination venues
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        {galleryItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid #E5E0D8",
              boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{ width: "100%", height: "260px", objectFit: "cover" }}
            />
            <div style={{ padding: "20px" }}>
              <span style={{ fontSize: "11px", color: "#D4AF37", fontWeight: "bold", textTransform: "uppercase" }}>
                {item.category}
              </span>
              <h3 style={{ fontFamily: "Playfair Display, serif", color: "#2C1320", fontSize: "18px", margin: "8px 0" }}>
                {item.title}
              </h3>
              <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "60px", textAlign: "center", backgroundColor: "#2C1320", padding: "40px 20px", borderRadius: "20px", color: "#FFFFFF" }}>
        <h2 style={{ fontFamily: "Playfair Display, serif", color: "#D4AF37", fontSize: "28px" }}>Love What You See?</h2>
        <p style={{ color: "#E8C5C8", margin: "12px 0 24px 0" }}>Lock your wedding date before dates are taken.</p>
        <a
          href="/book"
          style={{
            backgroundColor: "#D4AF37",
            color: "#2C1320",
            padding: "14px 28px",
            borderRadius: "20px",
            fontWeight: "bold",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Check Availability & Book →
        </a>
      </div>
    </main>
  );
}
