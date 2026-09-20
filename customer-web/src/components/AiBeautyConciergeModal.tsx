"use client";

import React from "react";
import { BeautyConcierge } from "./ai/BeautyConcierge";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiBeautyConciergeModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(12px, 3vw, 24px)",
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "fadeIn 0.3s ease forwards",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "680px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <BeautyConcierge isFloating={true} onClose={onClose} />
      </div>
    </div>
  );
}
