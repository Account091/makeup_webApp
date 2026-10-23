"use client";

import Link from "next/link";
import React, { useState } from "react";
import { ArrowRight, CalendarHeart, CheckCircle2, Loader2 } from "lucide-react";
import { formatEventDate, todayIST } from "../../lib/booking/types";

type Result = { date: string; available: boolean } | null;

export default function AvailabilityChecker({ className = "" }: { className?: string }) {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState("");
  const today = todayIST();

  async function check(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    setResult(null);
    if (!date) {
      setError("Please pick your event date first.");
      return;
    }
    if (date < today) {
      setError("That date is in the past.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/availability?month=${date.slice(0, 7)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not check availability.");
      setResult({ date, available: !(data.unavailable as string[]).includes(date) });
    } catch (err: any) {
      setError(err?.message || "Could not check availability right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={check}
      noValidate
      className={`rounded-3xl border border-white/60 bg-white/95 p-5 text-plum shadow-float backdrop-blur-xl sm:p-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush text-gold-dark">
          <CalendarHeart className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-serif text-lg font-semibold leading-tight">Is my date free?</p>
          <p className="mt-0.5 text-sm text-muted">Prachi takes one bride per day.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <label className="sr-only" htmlFor="check-date">
          Event date
        </label>
        <input
          id="check-date"
          type="date"
          min={today}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setResult(null);
            setError("");
          }}
          className="field sm:flex-1"
        />
        <button type="submit" disabled={loading} className="btn-dark shrink-0" aria-busy={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {loading ? "Checking" : "Check date"}
        </button>
      </div>
      <div aria-live="polite" className="empty:hidden">
        {error && <p className="alert-error mt-3 animate-fade-up">{error}</p>}
        {result && result.available && (
          <div className="mt-3 flex animate-fade-up flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 text-sm text-emerald-900">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>
                <strong>{formatEventDate(result.date)}</strong> is available
              </span>
            </span>
            <Link href={`/book?date=${result.date}`} className="btn-primary min-h-[40px] shrink-0 px-4 py-2">
              Reserve it <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
        {result && !result.available && (
          <p className="alert-info mt-3 animate-fade-up">
            Sorry, <strong>{formatEventDate(result.date)}</strong> is already booked. Try a nearby date, or message us on
            WhatsApp.
          </p>
        )}
      </div>
    </form>
  );
}
