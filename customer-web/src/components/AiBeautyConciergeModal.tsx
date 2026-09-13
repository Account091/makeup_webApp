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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl flex items-center justify-center">
        <BeautyConcierge isFloating={true} onClose={onClose} />
      </div>
    </div>
  );
}
