"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  Clock,
  Hash,
  IndianRupee,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";
import { formatEventDate, formatINR, whatsappLink, type SanitizedBooking } from "../../lib/booking/types";
import { WhatsAppIcon } from "../site/WhatsAppFab";

type Tone = "info" | "success" | "warn" | "error";

const COPY: Record<string, { title: string; text: string; tone: Tone }> = {
  DEPOSIT_PENDING: {
    title: "Waiting for your deposit",
    text: "Your date is on hold. Complete the UPI deposit and upload the screenshot to secure it.",
    tone: "warn",
  },
  PAYMENT_PROOF_SUBMITTED: {
    title: "Payment received, being verified",
    text: "Thank you! We're checking your payment. Your date stays held while we verify it, and we'll confirm shortly.",
    tone: "info",
  },
  CONFIRMED: {
    title: "Your booking is confirmed",
    text: "Your deposit is verified and the date is yours. We'll be in touch before the day to plan your look.",
    tone: "success",
  },
  COMPLETED: {
    title: "Event completed",
    text: "Thank you for choosing us. We hope you loved your look!",
    tone: "success",
  },
  PAYMENT_REJECTED: {
    title: "We couldn't verify your payment",
    text: "The date has been released. Please contact us on WhatsApp and we'll help you sort it out.",
    tone: "error",
  },
  EXPIRED: {
    title: "This booking request expired",
    text: "The deposit wasn't completed in time, so the date was released. You're welcome to book again.",
    tone: "error",
  },
  CANCELLED: {
    title: "This booking was cancelled",
    text: "Please contact us on WhatsApp if you have any questions.",
    tone: "error",
  },
};

const TONE_BADGE: Record<Tone, string> = {
  info: "bg-blush text-plum ring-gold/30",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  warn: "bg-amber-50 text-amber-900 ring-amber-200",
  error: "bg-red-50 text-red-800 ring-red-200",
};

type StageState = "done" | "current" | "todo" | "failed";
interface Stage {
  key: string;
  title: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
  state: StageState;
}

function buildStages(status: string): Stage[] {
  const order = ["DEPOSIT_PENDING", "PAYMENT_PROOF_SUBMITTED", "CONFIRMED", "COMPLETED"];
  const idx = order.indexOf(status);
  const base: Omit<Stage, "state">[] = [
    { key: "req", title: "Date requested", text: "Your date was held for you.", icon: CalendarCheck },
    { key: "paid", title: "Deposit & proof sent", text: "UPI payment and screenshot uploaded.", icon: Upload },
    { key: "conf", title: "Booking confirmed", text: "Payment verified by the studio.", icon: BadgeCheck },
    { key: "day", title: "Your big day", text: "Getting you ready, beautifully.", icon: Sparkles },
  ];
  if (idx >= 0) {
    // DEPOSIT_PENDING: 1 done, 2 in progress · PROOF_SUBMITTED: 2 done, 3 in progress · CONFIRMED: 3 done · COMPLETED: all done
    const doneCount = status === "COMPLETED" ? base.length : idx + 1;
    const current = status === "CONFIRMED" || status === "COMPLETED" ? -1 : doneCount;
    return base.map((s, i) => ({ ...s, state: i < doneCount ? "done" : i === current ? "current" : "todo" }));
  }
  // Ended early: show where it stopped.
  const failedAt = status === "PAYMENT_REJECTED" ? 2 : 1;
  const failTitle = status === "PAYMENT_REJECTED" ? "Payment not verified" : status === "EXPIRED" ? "Hold expired" : "Booking cancelled";
  return base.slice(0, failedAt + 1).map((s, i) => {
    if (i < failedAt) return { ...s, state: "done" as const };
    return { ...s, title: failTitle, text: "The date has been released.", icon: XCircle, state: "failed" as const };
  });
}

export default function TrackBooking({ whatsappNumber }: { whatsappNumber: string }) {
  const params = useSearchParams();
  const [bookingId, setBookingId] = useState(params.get("id") || "");
  const [phone, setPhone] = useState(params.get("phone") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<SanitizedBooking | null>(null);
  const [lookedUpPhone, setLookedUpPhone] = useState("");
  const autoRan = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const lookup = useCallback(async (id: string, ph: string) => {
    setError("");
    if (!id.trim() || !ph.trim()) {
      setError("Please enter both your booking ID and mobile number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/booking/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, phone: ph }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBooking(null);
        setError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      setBooking(data.booking);
      setLookedUpPhone(ph);
      if (window.innerWidth < 768) {
        window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      }
    } catch {
      setError("Network problem. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    const id = params.get("id");
    const ph = params.get("phone");
    if (id && ph) lookup(id, ph);
  }, [params, lookup]);

  const wa = whatsappLink(
    whatsappNumber,
    booking ? `Hi Prachi, I have a question about my booking ${booking.bookingId}.` : "Hi Prachi, I need help finding my booking."
  );

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(bookingId, phone);
        }}
        className="card grid gap-4 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-7"
        noValidate
      >
        <div>
          <label htmlFor="track-id" className="field-label">
            Booking ID
          </label>
          <div className="relative">
            <Hash className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              id="track-id"
              className="field pl-10 font-mono uppercase tracking-wider"
              placeholder="MBP-XXXXXX"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={12}
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="track-phone" className="field-label">
            Mobile number
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-muted">+91</span>
            <input
              id="track-phone"
              className="field pl-14 tabular-nums"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="10-digit mobile"
              maxLength={16}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="btn-dark px-7" disabled={loading} aria-busy={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
          {loading ? "Checking" : "Track"}
        </button>
      </form>

      <div ref={resultRef} aria-live="polite" className="scroll-mt-24">
        {error && (
          <div className="alert-error flex animate-fade-up items-start gap-2" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {error}
              {wa && error.startsWith("No booking") && (
                <>
                  {" "}
                  Lost your ID?{" "}
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                    Ask us on WhatsApp
                  </a>
                  .
                </>
              )}
            </span>
          </div>
        )}
        {loading && !booking && <TrackSkeleton />}
        {booking && <BookingStatus key={booking.bookingId + booking.status} booking={booking} wa={wa} phone={lookedUpPhone} />}
      </div>
    </div>
  );
}

function BookingStatus({ booking, wa, phone }: { booking: SanitizedBooking; wa: string | null; phone: string }) {
  const copy = COPY[booking.status] || { title: booking.status, text: "", tone: "info" as const };
  const stages = buildStages(booking.status);
  const holdActive = booking.status === "DEPOSIT_PENDING" && booking.expiresAt && Date.parse(booking.expiresAt) > Date.now();

  return (
    <section className="animate-fade-up overflow-hidden rounded-3xl border border-sand/80 bg-white shadow-lift">
      <div className="relative bg-plum-dark p-6 text-white sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_90%_at_100%_0%,rgba(212,175,55,0.2),transparent_60%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              {booking.customerName ? `Hi ${booking.customerName.split(" ")[0]} · ` : ""}Booking
            </p>
            <p className="mt-1 font-serif text-3xl font-semibold tracking-wider text-gold-light">{booking.bookingId}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${TONE_BADGE[copy.tone]}`}>
            {copy.title}
          </span>
        </div>
        <p className="relative mt-4 max-w-xl text-sm leading-relaxed text-white/75">{copy.text}</p>
        {booking.status === "PAYMENT_REJECTED" && booking.payment.rejectionReason && (
          <p className="relative mt-2 text-sm text-white/90">
            <strong>Reason:</strong> {booking.payment.rejectionReason}
          </p>
        )}
      </div>

      <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_1.1fr]">
        {/* Timeline */}
        <ol className="relative" aria-label="Booking progress">
          {stages.map((s, i) => {
            const Icon = s.icon;
            const last = i === stages.length - 1;
            return (
              <li key={s.key + s.title} className="relative flex gap-4 pb-7 last:pb-0" style={{ animationDelay: `${i * 80}ms` }}>
                {!last && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 rounded-full ${s.state === "done" ? "bg-gold" : "bg-sand"}`}
                  />
                )}
                <span
                  className={`relative z-[1] inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    s.state === "done"
                      ? "bg-plum text-gold-light"
                      : s.state === "current"
                        ? "bg-white text-gold-dark ring-2 ring-gold shadow-[0_0_0_6px_rgba(212,175,55,0.15)]"
                        : s.state === "failed"
                          ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                          : "bg-champagne text-muted"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  {s.state === "current" && (
                    <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full ring-2 ring-gold/40 motion-reduce:hidden" style={{ animationDuration: "2.2s" }} />
                  )}
                </span>
                <div className="pt-1.5">
                  <p className={`text-sm font-semibold ${s.state === "todo" ? "text-muted" : s.state === "failed" ? "text-red-800" : "text-plum"}`}>
                    {s.title}
                    {s.state === "current" && <span className="ml-2 text-xs font-medium text-gold-dark">In progress</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{s.text}</p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Summary */}
        <div>
          <dl className="grid gap-4 text-sm">
            <Detail icon={Sparkles} label="Service" value={`${booking.serviceTitle}${booking.packageName ? ` · ${booking.packageName}` : ""}`} />
            <Detail
              icon={CalendarDays}
              label="Date"
              value={booking.event.date ? formatEventDate(booking.event.date) : "To be confirmed"}
            />
            {booking.event.readyByTime && <Detail icon={Clock} label="Ready by" value={readyLabel(booking.event.readyByTime)} />}
            <Detail icon={MapPin} label="Venue" value={[booking.event.venue, booking.event.city].filter(Boolean).join(", ") || "To be confirmed"} />
            <Detail
              icon={IndianRupee}
              label="Amounts"
              value={`Total ${formatINR(booking.commercials.totalAmount)} · Deposit ${formatINR(booking.commercials.depositRequired)}${
                booking.commercials.depositPaid > 0 ? ` (paid ${formatINR(booking.commercials.depositPaid)})` : ""
              }`}
            />
            {booking.payment.utrLast4 && <Detail icon={Hash} label="UPI reference" value={`ending ${booking.payment.utrLast4}`} />}
          </dl>
        </div>
      </div>

      {/* Next action */}
      <div className="border-t border-sand/70 bg-champagne/60 p-6 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {holdActive && (
            <Link
              href={`/book?resume=${encodeURIComponent(booking.bookingId)}&phone=${encodeURIComponent(phone)}`}
              className="btn-primary px-7"
            >
              Complete payment <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
          {(booking.status === "EXPIRED" || booking.status === "PAYMENT_REJECTED" || booking.status === "CANCELLED") && (
            <Link href="/book" className="btn-primary px-7">
              Book again <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-ghost px-6">
              <WhatsAppIcon className="h-4 w-4 text-[#1DA851]" /> {booking.status === "CONFIRMED" ? "Plan your look with us" : "Questions? WhatsApp us"}
            </a>
          )}
        </div>
        {holdActive && (
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Payment details: UPI ID <strong className="text-plum">{booking.payment.upiId}</strong>
            {booking.payment.payeeName ? ` (${booking.payment.payeeName})` : ""}, amount {formatINR(booking.commercials.depositRequired)}, note{" "}
            {booking.bookingId}. Hold ends{" "}
            {new Date(booking.expiresAt as string).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}.
          </p>
        )}
      </div>
    </section>
  );
}

function Detail({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-champagne text-gold-dark">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] uppercase tracking-wider text-muted">{label}</dt>
        <dd className="font-medium text-plum">{value}</dd>
      </div>
    </div>
  );
}

export function TrackSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-sand/60 bg-white" aria-busy="true" aria-label="Loading booking">
      <div className="space-y-3 bg-plum-dark/95 p-8">
        <div className="h-3 w-24 rounded bg-white/10" />
        <div className="h-8 w-48 rounded bg-white/15" />
        <div className="h-3 w-2/3 rounded bg-white/10" />
      </div>
      <div className="grid gap-8 p-8 md:grid-cols-2">
        <div className="space-y-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="skeleton h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function readyLabel(t: string) {
  const m = /^(\d{2}):(\d{2})$/.exec(t);
  if (!m) return t;
  const h = Number(m[1]);
  return `${h % 12 === 0 ? 12 : h % 12}:${m[2]} ${h >= 12 ? "PM" : "AM"}`;
}
