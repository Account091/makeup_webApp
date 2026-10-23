"use client";

import Link from "next/link";
import QRCode from "qrcode";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ImagePlus,
  Info,
  Loader2,
  RefreshCw,
  Smartphone,
  Trash2,
  Upload,
} from "lucide-react";
import { buildUpiUri, formatEventDate, formatINR, normalizePhone, whatsappLink } from "../../lib/booking/types";
import { WhatsAppIcon } from "../site/WhatsAppFab";
import type { StoredSession } from "./BookingWizard";

interface Props {
  stored: StoredSession;
  whatsappNumber: string;
  /** Hold length in minutes (for the countdown ring); defaults to 15 */
  holdMinutes?: number;
  onSubmitted: () => void;
  onChangeDetails: () => void;
  onStartOver: () => void;
  onDone: () => void;
}

const MAX_BYTES = 5 * 1024 * 1024;

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [active]);
  return now;
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  async function copy(key: string, text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(null), 2000);
      return true;
    } catch {
      return false;
    }
  }
  return { copied, copy };
}

export default function PaymentStep({ stored, whatsappNumber, holdMinutes = 15, onSubmitted, onChangeDetails, onStartOver, onDone }: Props) {
  const { session, form, serviceTitle, submitted } = stored;
  const [qr, setQr] = useState<string>("");
  const [utr, setUtr] = useState("");
  const [utrTouched, setUtrTouched] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [expiredByServer, setExpiredByServer] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { copied, copy } = useCopy();

  const now = useNow(!submitted);
  const remainingMs = session.expiresAt - now;
  const expired = !submitted && (remainingMs <= 0 || expiredByServer);
  const mins = Math.max(0, Math.floor(remainingMs / 60000));
  const secs = Math.max(0, Math.floor((remainingMs % 60000) / 1000));
  const totalMs = Math.max(holdMinutes * 60000, remainingMs);
  const fraction = Math.max(0, Math.min(1, remainingMs / totalMs));
  const urgent = remainingMs < 120000;

  const upiUri = useMemo(
    () =>
      buildUpiUri({
        upiId: session.upiId,
        payeeName: session.payeeName,
        amount: session.depositAmount,
        note: session.bookingId,
      }),
    [session]
  );

  useEffect(() => {
    QRCode.toDataURL(upiUri, { width: 320, margin: 1, errorCorrectionLevel: "M", color: { dark: "#1A0B13", light: "#FFFFFF" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [upiUri]);

  // Object-URL preview of the chosen screenshot
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const phone = normalizePhone(form.phone) || "";
  const trackHref = `/track?id=${encodeURIComponent(session.bookingId)}&phone=${encodeURIComponent(phone)}`;
  const wa = whatsappLink(
    whatsappNumber,
    `Hi Prachi, my booking ID is ${session.bookingId} (${formatEventDate(form.date)}). I need help with the payment.`
  );

  const cleanUtr = utr.replace(/\s+/g, "").toUpperCase();
  const utrValid = /^[A-Z0-9]{10,22}$/.test(cleanUtr);
  const utrError = utrTouched && !utrValid ? "Enter the 12-digit UPI reference (UTR) from your payment app." : "";

  async function copyUpi() {
    const ok = await copy("upi", session.upiId);
    if (!ok) setError(`Couldn't copy automatically. The UPI ID is ${session.upiId}`);
  }

  function acceptFile(f: File | null) {
    setError("");
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image (screenshot) of your payment.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("That image is larger than 5 MB. Please choose a smaller screenshot.");
      return;
    }
    setFile(f);
  }

  function clearFile() {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submitProof(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setError("");
    setUtrTouched(true);
    if (!utrValid) {
      setError("Please enter the 12-digit UPI reference (UTR) number shown in your payment app.");
      document.getElementById("utr")?.focus();
      return;
    }
    if (!file) {
      setError("Please attach a screenshot of the successful payment.");
      return;
    }
    setSending(true);
    try {
      const body = new FormData();
      body.append("bookingId", session.bookingId);
      body.append("phone", phone);
      body.append("utrNumber", cleanUtr);
      body.append("file", file, file.name || "payment.png");
      const res = await fetch("/api/booking/submit-proof", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 410) setExpiredByServer(true);
        setError(data?.error || "Upload failed. Please try again.");
        return;
      }
      onSubmitted();
    } catch {
      setError("Network problem while uploading. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  /* -------------------------- Success -------------------------- */
  if (submitted) {
    const shareText = `My Makeovers by Prachi booking\nBooking ID: ${session.bookingId}\nDate: ${formatEventDate(form.date)}\nTrack: ${
      typeof window !== "undefined" ? window.location.origin : ""
    }${trackHref}`;
    return (
      <section className="relative overflow-hidden rounded-3xl border border-sand/80 bg-white px-6 py-10 text-center shadow-lift sm:px-10 sm:py-14" aria-live="polite">
        <Confetti />
        <div className="relative mx-auto h-20 w-20">
          <svg viewBox="0 0 80 80" className="h-20 w-20" aria-hidden="true">
            <circle cx="40" cy="40" r="36" fill="#F3E6BF" className="origin-center animate-pop" />
            <path
              d="M25 41l10 10 20-22"
              fill="none"
              stroke="#2C1320"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="60"
              strokeDashoffset="60"
              className="animate-draw"
            />
          </svg>
        </div>
        <p className="eyebrow mt-6 justify-center">Payment proof received</p>
        <h2 className="h-display mt-2 text-3xl sm:text-4xl">Thank you, {form.fullName.split(" ")[0]}!</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">
          We&apos;ll verify your deposit and confirm your booking. Your date stays held meanwhile, and you can check the status anytime with your booking ID.
        </p>

        <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-gold/40 bg-gradient-to-br from-blush/70 to-ivory p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Your booking ID</p>
          <div className="mt-1 flex items-center justify-center gap-3">
            <p className="font-serif text-3xl font-semibold tracking-wider text-plum">{session.bookingId}</p>
            <button
              type="button"
              onClick={() => copy("id", session.bookingId)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sand bg-white text-plum transition hover:border-gold active:scale-95"
              aria-label={copied === "id" ? "Booking ID copied" : "Copy booking ID"}
            >
              {copied === "id" ? <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            {formatEventDate(form.date)} · {serviceTitle}
          </p>
        </div>
        <p className="mt-3 text-xs text-muted" aria-live="polite">
          {copied === "id" ? "Copied to clipboard" : "Keep this ID — you'll need it with your phone number to track your booking."}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={trackHref} className="btn-dark px-7" onClick={onDone}>
            Track my booking <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost px-7"
          >
            <WhatsAppIcon className="h-4 w-4 text-[#1DA851]" /> Save to WhatsApp
          </a>
        </div>
        <button type="button" className="link-gold mt-6 text-sm" onClick={onStartOver}>
          Book another date
        </button>
      </section>
    );
  }

  /* -------------------------- Expired -------------------------- */
  if (expired) {
    return (
      <section className="card p-6 sm:p-10" aria-live="polite">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="h-display mt-4 text-3xl">Your hold has expired</h2>
        <p className="mt-3 max-w-xl text-muted">
          The time to pay for booking <strong className="text-plum">{session.bookingId}</strong> ran out, so the date was
          released. If you already paid, please don&apos;t pay again — message us with your booking ID and payment screenshot
          and we&apos;ll sort it out.
        </p>
        {error && <p className="alert-error mt-4">{error}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={onStartOver}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Pick a date again
          </button>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <WhatsAppIcon className="h-4 w-4 text-[#1DA851]" /> I already paid
            </a>
          )}
        </div>
      </section>
    );
  }

  /* -------------------------- Pay -------------------------- */
  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <section className="space-y-5" aria-labelledby="step4">
      {/* Amount + countdown */}
      <div className="relative overflow-hidden rounded-3xl bg-plum-dark p-6 text-white shadow-lift sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_90%_at_100%_0%,rgba(212,175,55,0.22),transparent_60%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow text-gold-light">Step 4 of 4 · Deposit</p>
            <h2 id="step4" className="mt-2 font-serif text-2xl font-medium sm:text-3xl">
              Pay to reserve your date
            </h2>
            <p className="mt-1 truncate text-sm text-white/70">
              {serviceTitle} · {formatEventDate(form.date)}
            </p>
          </div>
          <div className="relative h-[68px] w-[68px] shrink-0" role="timer" aria-label={`Date held for ${mins} minutes ${secs} seconds`}>
            <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
              <circle cx="32" cy="32" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
              <circle
                cx="32"
                cy="32"
                r={R}
                fill="none"
                stroke={urgent ? "#F87171" : "#E6CA65"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - fraction)}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-mono text-sm font-semibold tabular-nums ${urgent ? "text-red-300" : "text-white"}`}>
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white/50">held</span>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Deposit to pay now</p>
            <p className="mt-1 text-[2.75rem] font-bold leading-none tracking-tight tabular-nums text-gold-light">{formatINR(session.depositAmount)}</p>
          </div>
          <div className="text-right text-sm text-white/70">
            <p>
              Total <span className="tabular-nums text-white">{formatINR(session.totalAmount)}</span>
            </p>
            <p>
              Booking ID <span className="font-semibold tracking-wider text-white">{session.bookingId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 1. Pay */}
      <div className="card p-5 sm:p-7">
        <StepTitle n={1} title="Pay the deposit by UPI" />

        <a href={upiUri} className="btn-primary mt-5 w-full py-4 text-base sm:hidden">
          <Smartphone className="h-5 w-5" aria-hidden="true" /> Pay with UPI app
        </a>
        <p className="mt-2 text-center text-xs text-muted sm:hidden">Opens GPay, PhonePe, Paytm or BHIM with the amount filled in.</p>

        <div className="mt-6 grid items-center gap-6 sm:mt-5 sm:grid-cols-[auto_1fr]">
          <div className="mx-auto">
            <div className="rounded-2xl border border-sand bg-white p-3 shadow-soft">
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qr}
                  alt={`UPI QR code to pay ${formatINR(session.depositAmount)} to ${session.payeeName}`}
                  width={208}
                  height={208}
                  className="h-[208px] w-[208px] animate-fade-in"
                />
              ) : (
                <div className="skeleton h-[208px] w-[208px]" aria-label="Generating QR code" />
              )}
            </div>
            <p className="mt-2 text-center text-xs text-muted">Scan with any UPI app</p>
          </div>

          <div className="space-y-4 text-sm">
            <p className="hidden text-plum sm:block">
              Scan the QR with <strong>GPay, PhonePe, Paytm or BHIM</strong>. The amount and booking ID are filled in for you.
            </p>
            <div className="rounded-xl border border-sand bg-champagne/60 p-4">
              <p className="text-xs text-muted">Or pay to UPI ID</p>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span className="break-all font-mono text-[15px] font-semibold text-plum">{session.upiId}</span>
                <button
                  type="button"
                  onClick={copyUpi}
                  className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-xs font-semibold transition duration-200 active:scale-95 ${
                    copied === "upi" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-sand bg-white text-plum hover:border-gold"
                  }`}
                  aria-live="polite"
                >
                  {copied === "upi" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                  {copied === "upi" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted">Name: {session.payeeName}</p>
            </div>
            <p className="flex items-start gap-2 text-xs text-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-dark" aria-hidden="true" />
              Pay exactly {formatINR(session.depositAmount)} and add {session.bookingId} as the note if your app asks.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Proof */}
      <form onSubmit={submitProof} noValidate className="card p-5 sm:p-7">
        <StepTitle n={2} title="Upload your payment proof" />

        <div className="mt-5">
          <label htmlFor="utr" className="field-label">
            UPI reference / UTR number
          </label>
          <input
            id="utr"
            className={`field font-mono tracking-wider ${utrError ? "field-invalid" : ""}`}
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="e.g. 412345678901"
            maxLength={30}
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            onBlur={() => setUtrTouched(true)}
            aria-invalid={Boolean(utrError)}
            aria-describedby="utr-help"
          />
          <div id="utr-help" className="mt-2 text-xs text-muted">
            {utrError ? (
              <p className="flex items-center gap-1.5 font-medium text-red-700">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> {utrError}
              </p>
            ) : (
              <p>
                Open the payment in your UPI app. It&apos;s the 12-digit number labelled <strong>UTR</strong> (PhonePe),{" "}
                <strong>UPI transaction ID</strong> (GPay) or <strong>UPI Ref No.</strong> (Paytm, BHIM).
              </p>
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="field-label" id="proof-label">
            Payment screenshot
          </p>
          <input
            ref={fileRef}
            id="proof"
            type="file"
            accept="image/*"
            className="sr-only"
            aria-labelledby="proof-label"
            onChange={(e) => acceptFile(e.target.files?.[0] || null)}
          />
          {file && preview ? (
            <div className="flex animate-scale-in items-center gap-4 rounded-2xl border border-sand bg-champagne/60 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Selected payment screenshot" className="h-20 w-16 shrink-0 rounded-lg bg-white object-cover ring-1 ring-sand" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-plum">{file.name || "screenshot"}</p>
                <p className="text-xs text-muted">{Math.max(1, Math.round(file.size / 1024))} KB · ready to upload</p>
              </div>
              <button type="button" onClick={() => fileRef.current?.click()} className="link-gold text-xs">
                Change
              </button>
              <button
                type="button"
                onClick={clearFile}
                aria-label="Remove screenshot"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-white hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                acceptFile(e.dataTransfer.files?.[0] || null);
              }}
              className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition duration-200 ${
                dragging ? "border-gold bg-gold-pale/40" : "border-sand bg-champagne/40 hover:border-gold/70 hover:bg-champagne"
              }`}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-gold-dark shadow-soft">
                {dragging ? <Upload className="h-5 w-5" aria-hidden="true" /> : <ImagePlus className="h-5 w-5" aria-hidden="true" />}
              </span>
              <span className="text-sm font-semibold text-plum">
                <span className="sm:hidden">Tap to add screenshot</span>
                <span className="hidden sm:inline">Drop your screenshot here, or click to browse</span>
              </span>
              <span className="text-xs text-muted">PNG or JPG, up to 5 MB</span>
            </button>
          )}
        </div>

        <div aria-live="assertive" className="empty:hidden">
          {error && (
            <p className="alert-error mt-5 flex items-start gap-2" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
            </p>
          )}
        </div>

        <button type="submit" className="btn-primary mt-6 w-full py-4 text-base" disabled={sending} aria-busy={sending}>
          {sending ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : null}
          {sending ? "Uploading…" : "Submit payment proof"}
        </button>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <button type="button" className="link-gold" onClick={onChangeDetails}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Change details
          </button>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="link-gold">
              <WhatsAppIcon className="h-4 w-4" /> Problem paying?
            </a>
          )}
        </div>
      </form>
    </section>
  );
}

function StepTitle({ n, title }: { n: number; title: string }) {
  return (
    <h3 className="flex items-center gap-3 font-serif text-xl font-semibold text-plum">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-plum font-sans text-sm text-gold-light">{n}</span>
      {title}
    </h3>
  );
}

const CONFETTI_COLORS = ["#D4AF37", "#E6CA65", "#2C1320", "#F3E6BF", "#C08497", "#997B1E"];

/** Lightweight CSS confetti: 28 pieces, one burst, skipped for reduced motion. */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 7) * 70}ms`,
        dx: `${((i * 53) % 120) - 60}px`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        w: 6 + (i % 3) * 2,
        round: i % 4 === 0,
      })),
    []
  );
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 overflow-hidden motion-reduce:hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={
            {
              left: p.left,
              width: p.w,
              height: p.round ? p.w : p.w * 1.6,
              borderRadius: p.round ? "999px" : "2px",
              background: p.color,
              animation: `confetti-fall 1600ms cubic-bezier(0.2, 0.6, 0.4, 1) ${p.delay} both`,
              "--dx": p.dx,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
