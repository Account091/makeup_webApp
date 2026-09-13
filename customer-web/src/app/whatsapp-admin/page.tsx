"use client";

import React from "react";
import Header from "../../components/Header";
import { WhatsAppAssistantAdmin } from "../../components/ai/WhatsAppAssistantAdmin";

export default function WhatsAppAdminPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0A080C",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.12) 0%, rgba(15, 10, 20, 0.95) 75%)",
        color: "#FFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <main
        style={{
          flex: 1,
          maxWidth: "1240px",
          width: "100%",
          margin: "0 auto",
          padding: "30px 20px",
        }}
      >
        <WhatsAppAssistantAdmin />
      </main>
    </div>
  );
}
