"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import DatePicker from "./DatePicker";
import PaymentStep from "./PaymentStep";
import FadeImg from "../site/FadeImg";
import { WhatsAppIcon } from "../site/WhatsAppFab";
import { durationLabel } from "../site/ServiceCard";
import { serviceImage } from "../../lib/site-images";
import {
  CITY_OPTIONS,
  computePrice,
  formatEventDate,
  formatINR,
  normalizePhone,
  todayIST,
  travelFeeFor,
  whatsappLink,
  type CreateSessionResponse,
  type PublicConfig,
  type PublicService,
  type SanitizedBooking,
} from "../../lib/booking/types";

export interface BookingForm {
  serviceId: string;
  date: string;
  readyTime: string;
  fullName: string;
  phone: string;
  email: string;
  venue: string;
  city: string;
  guestCount: string;
  notes: string;
}

export interface StoredSession {
  session: CreateSessionResponse;
  form: BookingForm;
  serviceTitle: string;
  submitted: boolean;
}

const STORAGE_KEY = "mbp_booking_v1";
const STEPS = ["Service", "Date & time", "Details", "Deposit"];

/** Ready-by time slots, every 30 minutes from 03:00 to 21:30, grouped for quick scanning. */
const TIME_GROUPS: { label: string; times: string[] }[] = (() => {
  const all: string[] = [];
  for (let h = 3; h <= 21; h++) for (const m of [0, 30]) all.push(`${String(h).padStart(2, "0")}:${m ? "30" : "00"}`);
  return [
    { label: "Morning", times: all.filter((t) => t < "12:00") },
    { label: "Afternoon", times: all.filter((t) => t >= "12:00" && t < "17:00") },
    { label: "Evening", times: all.filter((t) => t >= "17:00") },
  ];
})();

export function timeLabel(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${suffix}`;
}

function shortDate(date: string) {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function addYears(date: string, years: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function readStored(): StoredSession | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export function writeStored(value: StoredSession | null) {
  try {
    if (value) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable: the flow still works without persistence */
  }
}

type FieldKey = "fullName" | "phone" | "email" | "venue" | "guestCount";

function fieldError(key: FieldKey, form: BookingForm): string | null {
  switch (key) {
    case "fullName":
      return form.fullName.trim().length < 2 ? "Please enter your full name." : null;
    case "phone":
      return normalizePhone(form.phone) ? null : "Please enter a valid 10-digit mobile number.";
    case "email":
      return form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? "Please check your email address." : null;
    case "venue":
      return form.venue.trim().length < 2 ? "Tell us where you'll get ready (venue or area)." : null;
    case "guestCount": {
      const g = Number(form.guestCount);
      return !Number.isInteger(g) || g < 1 || g > 50 ? "Number of people should be between 1 and 50." : null;
    }
  }
}
const FIELD_ORDER: FieldKey[] = ["fullName", "phone", "email", "venue", "guestCount"];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export default function BookingWizard() {
  const params = useSearchParams();
  const today = todayIST();
  const maxDate = addYears(today, 2);
  const rootRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<number | null>(null);

  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState<1 | -1>(1);
  const [form, setForm] = useState<BookingForm>(() => {
    const cityParam = params.get("city") || "";
    const city = CITY_OPTIONS.find((c) => c.toLowerCase() === cityParam.toLowerCase()) || "Jodhpur";
    const dateParam = params.get("date") || "";
    return {
      serviceId: "",
      date: /^\d{4}-\d{2}-\d{2}$/.test(dateParam) && dateParam >= today ? dateParam : "",
      readyTime: "",
      fullName: "",
      phone: "",
      email: "",
      venue: "",
      city,
      guestCount: "1",
      notes: "",
    };
  });
  const [stored, setStored] = useState<StoredSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dateConflict, setDateConflict] = useState(false);
  const [takenDate, setTakenDate] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const [availabilityKey, setAvailabilityKey] = useState(0);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const urlPreselectDone = useRef(false);

  // Load services + settings
  useEffect(() => {
    let cancelled = false;
    fetch("/api/public-config", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: PublicConfig) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => {
        if (!cancelled) setConfigError("We couldn't load our services. Please refresh the page.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Restore an in-progress booking (e.g. after a refresh on the payment step),
  // or resume one from the Track page (?resume=MBP-XXXXXX&phone=...).
  useEffect(() => {
    const resumeId = (params.get("resume") || "").toUpperCase();
    const resumePhone = params.get("phone") || "";
    const s = readStored();
    if (s && (!resumeId || s.session.bookingId === resumeId) && (s.submitted || s.session.expiresAt > Date.now())) {
      setStored(s);
      setForm(s.form);
      setStep(4);
      return;
    }
    if (s && s.session.expiresAt <= Date.now() && !s.submitted) writeStored(null);
    if (!resumeId || !resumePhone) return;

    let cancelled = false;
    fetch("/api/booking/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: resumeId, phone: resumePhone }),
    })
      .then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }))
      .then(({ ok, data }) => {
        if (cancelled) return;
        const b: SanitizedBooking | undefined = data?.booking;
        if (!ok || !b) {
          setError(data?.error || "We couldn't find that booking.");
          return;
        }
        const expiresAt = b.expiresAt ? Date.parse(b.expiresAt) : 0;
        if (b.status !== "DEPOSIT_PENDING" || !b.payment.upiId || expiresAt <= Date.now()) {
          setError("This booking is no longer waiting for payment. Check its status on the Track booking page.");
          return;
        }
        const resumedForm: BookingForm = {
          serviceId: "",
          date: b.event.date,
          readyTime: b.event.readyByTime,
          fullName: b.customerName,
          phone: resumePhone,
          email: "",
          venue: b.event.venue,
          city: b.event.city,
          guestCount: String(b.event.guestCount),
          notes: "",
        };
        const next: StoredSession = {
          session: {
            bookingId: b.bookingId,
            totalAmount: b.commercials.totalAmount,
            depositAmount: b.commercials.depositRequired,
            expiresAt,
            upiId: b.payment.upiId,
            payeeName: b.payment.payeeName || "",
          },
          form: resumedForm,
          serviceTitle: b.serviceTitle,
          submitted: false,
        };
        writeStored(next);
        setStored(next);
        setForm(resumedForm);
        setStep(4);
      })
      .catch(() => {
        if (!cancelled) setError("Network problem. Please refresh and try again.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preselect service from ?service= (id or title) — and skip straight to the date step.
  useEffect(() => {
    if (!config || form.serviceId) return;
    const fromUrl = (params.get("service") || "").trim().toLowerCase();
    const wanted = fromUrl || (stored?.serviceTitle || "").trim().toLowerCase();
    if (!wanted) return;
    const match = config.services.find((s) => s.id.toLowerCase() === wanted || s.title.toLowerCase() === wanted);
    if (match && match.price) {
      setForm((f) => ({ ...f, serviceId: match.id }));
      if (fromUrl && !urlPreselectDone.current && step === 1) {
        urlPreselectDone.current = true;
        setStep(2);
      }
    }
  }, [config, params, form.serviceId, stored, step]);

  const services = useMemo(() => (config?.services || []).filter((s) => s.price), [config]);
  const selectedService = services.find((s) => s.id === form.serviceId) || null;
  const settings = config?.settings;
  const price = selectedService && settings ? computePrice(selectedService.price as number, form.city, settings) : null;
  const wa = settings ? whatsappLink(settings.whatsappNumber, "Hi Prachi, I need help with my online booking.") : null;
  const bookingOpen = Boolean(config && services.length > 0 && config.available && settings?.upiId);

  // Tell the page chrome about the sticky booking bar (lifts the WhatsApp button,
  // pads the page bottom) and hide the WhatsApp button on the payment step.
  useEffect(() => {
    const root = document.documentElement;
    if (bookingOpen && step < 4) root.dataset.bookbar = "1";
    else delete root.dataset.bookbar;
    if (step === 4) root.dataset.hideFab = "1";
    else delete root.dataset.hideFab;
    return () => {
      delete root.dataset.bookbar;
      delete root.dataset.hideFab;
    };
  }, [bookingOpen, step]);

  useEffect(() => () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
  }, []);

  // Bring a submit error into view (the mobile submit button lives in the bottom bar).
  useEffect(() => {
    if (error && step === 3) {
      errorRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
    }
  }, [error, step]);

  const update = useCallback(<K extends keyof BookingForm>(key: K, value: BookingForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  function go(n: number) {
    setError("");
    setDir(n >= step ? 1 : -1);
    setStep(n);
    const el = rootRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      if (window.scrollY > top) window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  }

  function chooseService(id: string) {
    update("serviceId", id);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    // Let the selected state register visually, then glide to the next step.
    advanceTimer.current = window.setTimeout(() => go(2), prefersReducedMotion() ? 0 : 280);
  }

  function chooseDate(d: string) {
    update("date", d);
    setDateConflict(false);
    setError("");
    // On phones the time chips sit below the calendar: bring them into view.
    if (!form.readyTime && window.innerWidth < 768 && timeRef.current) {
      window.setTimeout(() => {
        timeRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      }, 120);
    }
  }

  const errors = useMemo(() => {
    const out: Partial<Record<FieldKey, string>> = {};
    for (const k of FIELD_ORDER) {
      const e = fieldError(k, form);
      if (e) out[k] = e;
    }
    return out;
  }, [form]);

  async function createSession(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const firstBad = FIELD_ORDER.find((k) => errors[k]);
    if (firstBad) {
      setTouched({ fullName: true, phone: true, email: true, venue: true, guestCount: true });
      document.getElementById(firstBad === "guestCount" ? "guests" : firstBad)?.focus();
      return;
    }
    setSubmitting(true);
    setError("");
    setDateConflict(false);
    try {
      const res = await fetch("/api/booking/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: form.serviceId,
          date: form.date,
          readyTime: form.readyTime,
          venue: form.venue.trim(),
          city: form.city,
          guestCount: Number(form.guestCount),
          fullName: form.fullName.trim(),
          phone: form.phone,
          email: form.email.trim(),
          notes: form.notes.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setDateConflict(true);
          setAvailabilityKey((k) => k + 1);
        }
        setError(data?.error || "Something went wrong. Please try again.");
        return;
      }
      const next: StoredSession = {
        session: data as CreateSessionResponse,
        form,
        serviceTitle: selectedService?.title || "",
        submitted: false,
      };
      writeStored(next);
      setStored(next);
      go(4);
    } catch {
      setError("Network problem. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function pickAnotherDate() {
    setTakenDate(form.date);
    setError("");
    update("date", "");
    setAvailabilityKey((k) => k + 1);
    go(2);
  }

  function startOver() {
    writeStored(null);
    setStored(null);
    setForm((f) => ({ ...f, date: "", readyTime: "" }));
    setAvailabilityKey((k) => k + 1);
    go(2);
  }

  if (configError) {
    return (
      <div className="card flex items-start gap-3 p-6">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
        <div>
          <p className="font-semibold">{configError}</p>
          <button type="button" className="btn-dark mt-4" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    );
  }
  if (!config) return <WizardSkeleton />;
  if (!bookingOpen || !settings) {
    return (
      <div className="card p-8 text-center sm:p-12">
        <p className="font-serif text-3xl font-semibold">Online booking is resting for a moment</p>
        <p className="mx-auto mt-3 max-w-md text-muted">Please message or call us and we&apos;ll reserve your date personally.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary">
              WhatsApp us
            </a>
          )}
          <Link href="/contact" className="btn-ghost">
            Contact details
          </Link>
        </div>
      </div>
    );
  }

  const anim = dir > 0 ? "animate-step-in-right" : "animate-step-in-left";
  const summaryTitle = (stored && step === 4 ? stored.serviceTitle : selectedService?.title) || "";

  return (
    <div ref={rootRef} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
      <div className="min-w-0">
        <Stepper step={step} complete={Boolean(stored?.submitted && step === 4)} onJump={(n) => n < step && step < 4 && go(n)} />

        {error && step === 1 && <p className="alert-error mb-4" role="alert">{error}</p>}

        <div className="mt-8">
          {/* ---------------- Step 1 ---------------- */}
          {step === 1 && (
            <section key="s1" className={anim} aria-labelledby="step1">
              <StepHeading id="step1" eyebrow="Step 1 of 4" title="Choose your look" hint="Tap a package to continue. You can change it later." />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {services.map((s, i) => (
                  <ServiceOption
                    key={s.id}
                    service={s}
                    selected={s.id === form.serviceId}
                    onSelect={() => chooseService(s.id)}
                    index={i}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ---------------- Step 2 ---------------- */}
          {step === 2 && (
            <section key="s2" className={anim} aria-labelledby="step2">
              <StepHeading id="step2" eyebrow="Step 2 of 4" title="Pick your date & time" hint="We take one bride per day. Booked dates are crossed out." />
              {dateConflict && (
                <div className="alert-error mt-5 flex items-start gap-2" role="alert">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    That date was just taken by someone else. Please choose another — your details are saved.
                  </span>
                </div>
              )}
              <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:items-start">
                <DatePicker value={form.date} onChange={chooseDate} min={today} max={maxDate} refreshKey={availabilityKey} initialMonth={takenDate} />
                <div ref={timeRef} className="scroll-mt-24">
                  <TimePicker value={form.readyTime} onChange={(t) => update("readyTime", t)} />
                </div>
              </div>
              <div className="mt-8 hidden items-center justify-between gap-3 lg:flex">
                <button type="button" className="btn-ghost" onClick={() => go(1)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                </button>
                <button type="button" className="btn-dark px-8" disabled={!form.date || !form.readyTime} onClick={() => go(3)}>
                  Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <button type="button" className="link-gold mt-6 text-sm lg:hidden" onClick={() => go(1)}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Change service
              </button>
            </section>
          )}

          {/* ---------------- Step 3 ---------------- */}
          {step === 3 && (
            <section key="s3" className={anim} aria-labelledby="step3">
              <StepHeading id="step3" eyebrow="Step 3 of 4" title="A little about you" hint="We'll use these to reach you about your booking." />
              <form id="details-form" onSubmit={createSession} noValidate className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field id="fullName" label="Full name" error={touched.fullName ? errors.fullName : undefined} className="sm:col-span-2">
                  <input
                    id="fullName"
                    className={`field ${touched.fullName && errors.fullName ? "field-invalid" : ""}`}
                    autoComplete="name"
                    maxLength={80}
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                    aria-invalid={Boolean(touched.fullName && errors.fullName)}
                    aria-describedby={touched.fullName && errors.fullName ? "fullName-error" : undefined}
                  />
                </Field>
                <Field id="phone" label="Mobile number (WhatsApp)" error={touched.phone ? errors.phone : undefined}>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-muted">+91</span>
                    <input
                      id="phone"
                      className={`field pl-14 tabular-nums ${touched.phone && errors.phone ? "field-invalid" : ""}`}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="98xxxxxxxx"
                      maxLength={16}
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                      aria-invalid={Boolean(touched.phone && errors.phone)}
                      aria-describedby={touched.phone && errors.phone ? "phone-error" : undefined}
                    />
                  </div>
                </Field>
                <Field id="email" label="Email" optional error={touched.email ? errors.email : undefined}>
                  <input
                    id="email"
                    className={`field ${touched.email && errors.email ? "field-invalid" : ""}`}
                    type="email"
                    autoComplete="email"
                    maxLength={120}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    aria-invalid={Boolean(touched.email && errors.email)}
                    aria-describedby={touched.email && errors.email ? "email-error" : undefined}
                  />
                </Field>
                <Field id="venue" label="Where will you get ready?" error={touched.venue ? errors.venue : undefined} className="sm:col-span-2">
                  <input
                    id="venue"
                    className={`field ${touched.venue && errors.venue ? "field-invalid" : ""}`}
                    placeholder="Home area, hotel or venue name"
                    maxLength={200}
                    value={form.venue}
                    onChange={(e) => update("venue", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, venue: true }))}
                    aria-invalid={Boolean(touched.venue && errors.venue)}
                    aria-describedby={touched.venue && errors.venue ? "venue-error" : undefined}
                  />
                </Field>

                <fieldset className="sm:col-span-2">
                  <legend className="field-label">City</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="City">
                    {CITY_OPTIONS.map((c) => {
                      const active = form.city === c;
                      const fee = travelFeeFor(c, settings.travelFees);
                      return (
                        <button
                          key={c}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => update("city", c)}
                          className={`flex min-h-[60px] flex-col items-start justify-center rounded-xl border px-4 py-2 text-left transition duration-200 ease-out-expo active:scale-[0.98] ${
                            active ? "border-plum bg-plum text-white shadow-soft" : "border-sand bg-white text-plum hover:border-gold/70"
                          }`}
                        >
                          <span className="text-sm font-semibold">{c === "Other" ? "Other city" : c}</span>
                          <span className={`text-xs ${active ? "text-gold-light" : "text-muted"}`}>
                            {fee > 0 ? `+ ${formatINR(fee)} travel` : "No travel fee"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <Field id="guests" label="People getting ready" error={touched.guestCount ? errors.guestCount : undefined}>
                  <div className="flex h-12 items-center justify-between rounded-xl border border-sand bg-white p-1">
                    <button
                      type="button"
                      aria-label="Fewer people"
                      disabled={Number(form.guestCount) <= 1}
                      onClick={() => update("guestCount", String(Math.max(1, (Number(form.guestCount) || 1) - 1)))}
                      className="inline-flex h-10 w-11 items-center justify-center rounded-lg text-plum transition hover:bg-blush active:scale-95 disabled:opacity-30"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <input
                      id="guests"
                      className="w-16 bg-transparent text-center text-base font-semibold tabular-nums text-plum focus:outline-none"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={50}
                      value={form.guestCount}
                      onChange={(e) => update("guestCount", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, guestCount: true }))}
                      aria-describedby="guests-hint"
                    />
                    <button
                      type="button"
                      aria-label="More people"
                      disabled={Number(form.guestCount) >= 50}
                      onClick={() => update("guestCount", String(Math.min(50, (Number(form.guestCount) || 0) + 1)))}
                      className="inline-flex h-10 w-11 items-center justify-center rounded-lg text-plum transition hover:bg-blush active:scale-95 disabled:opacity-30"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  <p id="guests-hint" className="mt-1.5 text-xs text-muted">
                    Including you. Extra people are quoted separately.
                  </p>
                </Field>

                <Field id="notes" label="Notes" optional className="sm:col-span-2">
                  <textarea
                    id="notes"
                    className="field min-h-[96px]"
                    rows={3}
                    maxLength={1000}
                    placeholder="Outfit colours, the look you have in mind, other functions…"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                  />
                </Field>

                {price && (
                  <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-blush/80 to-ivory p-5 sm:col-span-2 lg:hidden">
                    <PriceRows title={selectedService?.title || ""} city={form.city} price={price} depositPercent={settings.depositPercent} />
                  </div>
                )}

                <div ref={errorRef} aria-live="assertive" className="scroll-mt-24 sm:col-span-2 empty:hidden">
                  {error && !dateConflict && (
                    <p className="alert-error flex items-start gap-2" role="alert">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
                    </p>
                  )}
                  {dateConflict && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900" role="alert">
                      <p className="flex items-start gap-2 font-semibold">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        {formatEventDate(form.date)} was just booked by someone else.
                      </p>
                      <p className="mt-1 pl-6 text-red-800">Your details are saved — pick another date and you&apos;re done.</p>
                      <button type="button" className="btn-dark ml-6 mt-3" onClick={pickAnotherDate}>
                        <CalendarDays className="h-4 w-4" aria-hidden="true" /> Pick another date
                      </button>
                    </div>
                  )}
                </div>

                <div className="hidden items-center justify-between gap-3 sm:col-span-2 lg:flex">
                  <button type="button" className="btn-ghost" onClick={() => go(2)}>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
                  </button>
                  <button type="submit" className="btn-primary px-8" disabled={submitting} aria-busy={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                    {submitting ? "Reserving your date…" : `Reserve & pay ${price ? formatINR(price.depositAmount) : "deposit"}`}
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-muted sm:col-span-2">
                  Your date is held for {settings.holdMinutes} minutes while you pay. By continuing you agree to our{" "}
                  <Link href="/privacy" className="underline underline-offset-2">
                    privacy policy
                  </Link>
                  .
                </p>
                <button type="button" className="link-gold justify-self-start text-sm lg:hidden" onClick={() => go(2)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Change date or time
                </button>
              </form>
            </section>
          )}

          {/* ---------------- Step 4 ---------------- */}
          {step === 4 && stored && (
            <div key="s4" className={anim}>
              <PaymentStep
                stored={stored}
                whatsappNumber={settings.whatsappNumber}
                holdMinutes={settings.holdMinutes}
                onSubmitted={() => {
                  const next = { ...stored, submitted: true };
                  writeStored(next);
                  setStored(next);
                }}
                onChangeDetails={() => go(3)}
                onStartOver={startOver}
                onDone={() => {
                  writeStored(null);
                }}
              />
            </div>
          )}
          {step === 4 && !stored && <WizardSkeleton compact />}
        </div>
      </div>

      {/* ---------------- Desktop summary ---------------- */}
      <aside className="hidden lg:block" aria-label="Booking summary">
        <div className="sticky top-28 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-sand/80 bg-white shadow-soft">
            {selectedService || (stored && step === 4) ? (
              <div className="relative h-36 overflow-hidden bg-blush">
                <FadeImg
                  key={selectedService?.id || "stored"}
                  src={serviceImage(selectedService || { id: stored?.serviceTitle || "", title: stored?.serviceTitle || "" })}
                  alt=""
                  sizes="340px"
                  className="h-full w-full object-cover"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-plum-dark/80 via-plum-dark/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-light">Your booking</p>
                  <p className="mt-0.5 font-serif text-lg font-semibold leading-snug">{summaryTitle}</p>
                </div>
              </div>
            ) : (
              <div className="px-5 pt-5">
                <p className="font-serif text-lg font-semibold">Your booking</p>
              </div>
            )}

            <div className="p-5">
              {!selectedService && !(stored && step === 4) ? (
                <div className="flex items-start gap-3 rounded-xl bg-champagne p-4 text-sm text-muted">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" aria-hidden="true" />
                  <span>Choose a look to begin. Your date, time and price will appear here as you go.</span>
                </div>
              ) : (
                <dl className="space-y-3 text-sm">
                  {form.date && (
                    <SummaryRow icon={CalendarDays} label="Date" value={formatEventDate(form.date)} />
                  )}
                  {form.readyTime && <SummaryRow icon={Clock} label="Ready by" value={timeLabel(form.readyTime)} />}
                  {step >= 3 && <SummaryRow icon={MapPin} label="City" value={form.city === "Other" ? "Other city" : form.city} />}
                  {step >= 3 && Number(form.guestCount) > 1 && (
                    <SummaryRow icon={Users} label="People" value={String(form.guestCount)} />
                  )}
                  {!form.date && (
                    <p className="rounded-xl bg-champagne px-3 py-2.5 text-xs text-muted">Next: pick your date and the time you need to be ready.</p>
                  )}
                </dl>
              )}

              {step === 4 && stored ? (
                <div className="mt-5 border-t border-sand/70 pt-4 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>Total</span>
                    <span className="tabular-nums">{formatINR(stored.session.totalAmount)}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between font-semibold">
                    <span>Deposit now</span>
                    <span className="text-2xl font-semibold tracking-tight tabular-nums">{formatINR(stored.session.depositAmount)}</span>
                  </div>
                </div>
              ) : price ? (
                <div className="mt-5 border-t border-sand/70 pt-4">
                  <PriceRows title="Package" city={form.city} price={price} depositPercent={settings.depositPercent} />
                </div>
              ) : null}
            </div>
          </div>

          <ul className="space-y-2.5 px-1 text-xs text-muted">
            <li className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-gold-dark" aria-hidden="true" />{" "}
              {stored?.submitted
                ? "Your date stays held while we verify your payment"
                : `Date held for ${settings.holdMinutes} min while you pay`}
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold-dark" aria-hidden="true" /> Pay by any UPI app — no card details needed
            </li>
          </ul>
          {wa && (
            <p className="px-1 text-sm text-muted">
              Need help?{" "}
              <a href={wa} target="_blank" rel="noopener noreferrer" className="link-gold">
                WhatsApp us
              </a>
            </p>
          )}
        </div>
      </aside>

      {/* ---------------- Mobile sticky action bar ---------------- */}
      {step < 4 && (
        <MobileBar
          step={step}
          service={selectedService}
          price={price}
          date={form.date}
          readyTime={form.readyTime}
          submitting={submitting}
          whatsappHref={wa}
          onContinue={() => {
            if (step === 1 && form.serviceId) go(2);
            else if (step === 2 && form.date && form.readyTime) go(3);
          }}
        />
      )}
    </div>
  );
}

/* ======================================================================== */

function Stepper({ step, complete = false, onJump }: { step: number; complete?: boolean; onJump: (n: number) => void }) {
  const pct = complete ? 100 : ((step - 1) / (STEPS.length - 1)) * 100;
  return (
    <nav aria-label="Booking progress">
      <div className="relative">
        <div aria-hidden="true" className="absolute left-5 right-5 top-5 h-0.5 rounded-full bg-sand">
          <div className="h-full rounded-full bg-gold-gradient transition-[width] duration-500 ease-out-expo" style={{ width: `${pct}%` }} />
        </div>
        <ol className="relative grid grid-cols-4">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const state = complete || n < step ? "done" : n === step ? "current" : "todo";
            const clickable = state === "done" && step < 4;
            return (
              <li key={label} className="flex flex-col items-center text-center" aria-current={state === "current" ? "step" : undefined}>
                <button
                  type="button"
                  onClick={() => onJump(n)}
                  disabled={!clickable}
                  aria-label={`Step ${n}: ${label}${state === "done" ? " (completed)" : ""}`}
                  className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition duration-300 ease-out-expo disabled:cursor-default ${
                    state === "done"
                      ? "border-plum bg-plum text-gold-light hover:scale-105"
                      : state === "current"
                        ? "border-gold bg-white text-plum shadow-[0_0_0_5px_rgba(212,175,55,0.18)]"
                        : "border-sand bg-ivory text-muted"
                  }`}
                >
                  {state === "done" ? <Check className="h-4 w-4 animate-pop" aria-hidden="true" /> : n}
                </button>
                <span className={`mt-2 text-[11px] font-semibold tracking-wide sm:text-xs ${state === "todo" ? "text-muted" : "text-plum"}`}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

function StepHeading({ id, eyebrow, title, hint }: { id: string; eyebrow: string; title: string; hint?: string }) {
  return (
    <header>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="h-display mt-2 text-3xl sm:text-4xl" tabIndex={-1}>
        {title}
      </h2>
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
    </header>
  );
}

function ServiceOption({ service, selected, onSelect, index }: { service: PublicService; selected: boolean; onSelect: () => void; index: number }) {
  const dur = durationLabel(service.durationMinutes);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{ animationDelay: `${index * 50}ms` }}
      className={`group relative flex animate-fade-up overflow-hidden rounded-2xl border bg-white text-left shadow-soft transition duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.99] sm:flex-col ${
        selected ? "border-plum ring-2 ring-gold ring-offset-2 ring-offset-champagne" : "border-sand/80 hover:border-gold/60"
      }`}
    >
      <div className="relative w-28 shrink-0 overflow-hidden bg-blush sm:aspect-[16/10] sm:w-full">
        <FadeImg
          src={serviceImage(service)}
          alt=""
          sizes="(min-width: 640px) 360px, 112px"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
        <div aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-t from-plum-dark/40 to-transparent sm:block" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        {service.category && <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-dark">{service.category}</p>}
        <p className="mt-1 pr-8 font-serif text-lg font-semibold leading-snug text-plum">{service.title}</p>
        {service.description && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{service.description}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="text-sm">
            <span className="text-muted">from </span>
            <span className="font-semibold text-plum">{formatINR(service.price)}</span>
          </p>
          {dur && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {dur}
            </span>
          )}
        </div>
      </div>
      <span
        aria-hidden="true"
        className={`absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border transition duration-300 ease-out-expo ${
          selected ? "scale-100 border-plum bg-plum text-gold-light" : "scale-90 border-sand bg-white/90 text-transparent"
        }`}
      >
        <Check className="h-4 w-4" />
      </span>
    </button>
  );
}

function TimePicker({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  const initialGroup = Math.max(0, TIME_GROUPS.findIndex((g) => g.times.includes(value)));
  const [group, setGroup] = useState(initialGroup);
  return (
    <div className="rounded-2xl border border-sand/80 bg-white p-4 shadow-soft sm:p-5">
      <p className="font-serif text-lg font-semibold" id="time-label">
        Ready by
      </p>
      <p className="mt-0.5 text-xs text-muted">The time you need to be fully ready. We&apos;ll plan the start time with you.</p>
      <div className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-champagne p-1" role="tablist" aria-label="Time of day">
        {TIME_GROUPS.map((g, i) => (
          <button
            key={g.label}
            type="button"
            role="tab"
            aria-selected={group === i}
            onClick={() => setGroup(i)}
            className={`min-h-[40px] rounded-full text-xs font-semibold transition duration-200 ease-out-expo ${
              group === i ? "bg-white text-plum shadow-soft" : "text-muted hover:text-plum"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div key={group} role="radiogroup" aria-labelledby="time-label" className="mt-4 grid animate-fade-in grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-3">
        {TIME_GROUPS[group].times.map((t) => {
          const active = value === t;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(t)}
              className={`chip px-2 text-[13px] tabular-nums ${active ? "chip-active" : ""}`}
            >
              {timeLabel(t)}
            </button>
          );
        })}
      </div>
      {value && !TIME_GROUPS[group].times.includes(value) && (
        <p className="mt-3 text-xs text-muted">
          Selected: <strong className="text-plum">{timeLabel(value)}</strong>
        </p>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  optional,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex animate-fade-in items-center gap-1.5 text-xs font-medium text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex animate-fade-up items-start gap-3">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-champagne text-gold-dark">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <dt className="text-[11px] uppercase tracking-wider text-muted">{label}</dt>
        <dd className="font-medium text-plum">{value}</dd>
      </div>
    </div>
  );
}

function PriceRows({
  title,
  city,
  price,
  depositPercent,
}: {
  title: string;
  city: string;
  price: { basePrice: number; travelFee: number; totalAmount: number; depositAmount: number };
  depositPercent: number;
}) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between gap-3">
        <dt className="text-muted">{title}</dt>
        <dd className="tabular-nums">{formatINR(price.basePrice)}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-muted">Travel · {city === "Other" ? "other city" : city}</dt>
        <dd className="tabular-nums">{price.travelFee ? formatINR(price.travelFee) : "Free"}</dd>
      </div>
      <div className="flex justify-between gap-3 border-t border-sand/70 pt-2 font-semibold">
        <dt>Total</dt>
        <dd className="tabular-nums">{formatINR(price.totalAmount)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-3 rounded-xl bg-gold-pale/60 px-3 py-2.5">
        <dt className="font-semibold text-plum">Deposit now ({depositPercent}%)</dt>
        <dd className="text-xl font-bold tracking-tight tabular-nums text-plum">{formatINR(price.depositAmount)}</dd>
      </div>
    </dl>
  );
}

function MobileBar({
  step,
  service,
  price,
  date,
  readyTime,
  submitting,
  whatsappHref,
  onContinue,
}: {
  step: number;
  service: PublicService | null;
  price: { totalAmount: number; depositAmount: number } | null;
  date: string;
  readyTime: string;
  submitting: boolean;
  whatsappHref: string | null;
  onContinue: () => void;
}) {
  let primary = "";
  let secondary = "";
  if (!service) {
    primary = "Choose a look";
    secondary = "Tap a package above";
  } else if (step === 3 && price) {
    primary = `Deposit ${formatINR(price.depositAmount)}`;
    secondary = `Total ${formatINR(price.totalAmount)}`;
  } else {
    primary = price ? formatINR(price.totalAmount) : formatINR(service.price);
    secondary = date ? `${shortDate(date)}${readyTime ? ` · ${timeLabel(readyTime)}` : " · pick a time"}` : service.title;
  }
  const canContinue = (step === 1 && Boolean(service)) || (step === 2 && Boolean(date && readyTime));

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-sand/80 bg-ivory/90 shadow-[0_-12px_30px_-18px_rgba(44,19,32,0.35)] backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="container-page flex h-[76px] items-center gap-3">
        <div className="min-w-0 flex-1" aria-live="polite">
          <p key={primary} className="animate-fade-in truncate text-lg font-bold tracking-tight tabular-nums text-plum">
            {primary}
          </p>
          <p className="truncate text-xs text-muted">{secondary}</p>
        </div>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Need help? Chat on WhatsApp"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sand bg-white text-[#1DA851] transition active:scale-95"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        )}
        {step === 3 ? (
          <button type="submit" form="details-form" className="btn-primary shrink-0 px-6" disabled={submitting} aria-busy={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {submitting ? "Reserving…" : "Reserve & pay"}
          </button>
        ) : (
          <button type="button" className="btn-dark shrink-0 px-6" disabled={!canContinue} onClick={onContinue}>
            Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export function WizardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12" aria-busy="true" aria-label="Loading booking">
      <div>
        {!compact && (
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="skeleton h-3 w-14" />
              </div>
            ))}
          </div>
        )}
        <div className="skeleton mt-10 h-3 w-24" />
        <div className="skeleton mt-3 h-9 w-64" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-sand/60 bg-white">
              <div className="skeleton aspect-[16/10] rounded-none" />
              <div className="space-y-2 p-5">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden lg:block">
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    </div>
  );
}
