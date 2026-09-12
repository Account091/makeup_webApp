"use client";

import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiBeautyConciergeModal({ isOpen, onClose }: Props) {
  const [prompt, setPrompt] = useState("");
  const [eventType, setEventType] = useState("Bridal");
  const [skinType, setSkinType] = useState("Combination");
  const [response, setResponse] = useState<string | null>(null);
  const [providerInfo, setProviderInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/ai/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: prompt,
          eventType,
          skinType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect with Beauty Concierge");
      }

      setResponse(data.recommendation);
      setProviderInfo(`${data.providerUsed.toUpperCase()} (${data.modelUsed})`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl overflow-hidden glass-card rounded-2xl border border-[var(--gold-primary)]/40 shadow-2xl bg-[var(--plum-deep)] text-[var(--cream-bg)] p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--rose-gold)] to-[var(--gold-primary)] flex items-center justify-center text-black font-bold text-xl shadow-lg">
              ✨
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[var(--gold-primary)] via-[var(--rose-gold)] to-white">
                AI Beauty Concierge
              </h3>
              <p className="text-xs text-white/60">Powered by V5 AI Gateway • Hugging Face & Multi-Provider Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Consultation Form */}
        <form onSubmit={handleConsult} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--gold-light)] mb-1 font-semibold">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-primary)]"
              >
                <option value="Bridal">Bridal / Destination Wedding</option>
                <option value="Reception">Sangeet / Reception</option>
                <option value="Celebration">Celebration / Party Glam</option>
                <option value="Editorial">Editorial / High Fashion</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--gold-light)] mb-1 font-semibold">
                Skin / Style Profile
              </label>
              <select
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
                className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--gold-primary)]"
              >
                <option value="Combination">Combination / Matte Finish</option>
                <option value="Dry">Dry / Dewy Glow Finish</option>
                <option value="Sensitive">Sensitive / Hypoallergenic Prep</option>
                <option value="Oily">Oily / Long-Wear Airbrush</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--gold-light)] mb-1 font-semibold">
              Your Makeup / Skincare Question
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Which HD Airbrush package is recommended for an outdoor sunset wedding in Udaipur?"
              className="w-full bg-black/40 border border-white/15 rounded-lg p-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--gold-primary)]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-white/50 italic">
              🔒 Multi-provider failover enabled • Pricing is strictly server-authoritative
            </span>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="btn-luxury px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-[var(--gold-primary)] via-[var(--rose-gold)] to-[var(--gold-light)] hover:shadow-lg disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>Consulting AI Gateway...</span>
                </>
              ) : (
                <>
                  <span>Consult AI Concierge</span>
                  <span>✨</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Output */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs">
            ⚠️ {error}
          </div>
        )}

        {/* AI Output Result */}
        {response && (
          <div className="mt-6 p-4 rounded-xl bg-black/50 border border-[var(--gold-primary)]/30 space-y-2 animate-fadeIn max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--gold-light)] uppercase tracking-wider">
              <span>Expert Recommendation</span>
              {providerInfo && <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">{providerInfo}</span>}
            </div>
            <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
