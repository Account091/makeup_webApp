"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  value: string;
  onChange: (date: string) => void;
  min: string; // YYYY-MM-DD
  max: string; // YYYY-MM-DD
  /** bump to force a refetch (e.g. after a 409) */
  refreshKey?: number;
  /** YYYY-MM-DD whose month to open on when there is no value (e.g. the date that was just taken) */
  initialMonth?: string;
}

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKDAYS_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function monthKey(y: number, m: number) {
  return `${y}-${pad(m + 1)}`;
}

function longLabel(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Month calendar for picking the event date. Booked/blocked dates (from
 * /api/availability) are struck through and disabled. Arrow keys move focus
 * between days; PageUp/PageDown change month.
 */
export default function DatePicker({ value, onChange, min, max, refreshKey = 0, initialMonth }: Props) {
  const initial = value || (initialMonth && initialMonth >= min ? initialMonth : "") || min;
  const [year, setYear] = useState(Number(initial.slice(0, 4)));
  const [month, setMonth] = useState(Number(initial.slice(5, 7)) - 1);
  const [dir, setDir] = useState<1 | -1>(1);
  const [unavailable, setUnavailable] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);

  const key = monthKey(year, month);

  const load = useCallback(async (k: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/availability?month=${k}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not load availability");
      setUnavailable((prev) => ({ ...prev, [k]: data.unavailable || [] }));
    } catch {
      setError("Couldn't load availability for this month. You can still pick a date; we'll double-check it.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(key);
  }, [key, refreshKey, load]);

  // Move focus to a requested day after a month change re-render.
  useEffect(() => {
    if (!pendingFocus.current) return;
    const el = gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${pendingFocus.current}"]`);
    pendingFocus.current = null;
    el?.focus();
  });

  const minMonth = min.slice(0, 7);
  const maxMonth = max.slice(0, 7);
  const canPrev = key > minMonth;
  const canNext = key < maxMonth;

  function shift(delta: number) {
    const d = new Date(Date.UTC(year, month + delta, 1));
    const k = monthKey(d.getUTCFullYear(), d.getUTCMonth());
    if (k < minMonth || k > maxMonth) return;
    setDir(delta > 0 ? 1 : -1);
    setYear(d.getUTCFullYear());
    setMonth(d.getUTCMonth());
  }

  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7; // Monday-first
  const taken = new Set(unavailable[key] || []);
  const known = key in unavailable;
  const label = first.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });

  const cells: Array<{ date: string; day: number } | null> = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: `${key}-${pad(d)}`, day: d });

  function onGridKey(e: React.KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const date = target.dataset.date;
    if (!date) return;
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      shift(e.key === "PageUp" ? -1 : 1);
      return;
    }
    if (!(e.key in step)) return;
    e.preventDefault();
    const d = new Date(`${date}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + step[e.key]);
    const next = d.toISOString().slice(0, 10);
    if (next < min || next > max) return;
    if (next.slice(0, 7) !== key) {
      pendingFocus.current = next;
      shift(next.slice(0, 7) > key ? 1 : -1);
      return;
    }
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${next}"]`)?.focus();
  }

  const todayKey = min;
  // Roving tabindex: exactly one day in the grid is reachable with Tab.
  const enabled = cells.filter((c): c is { date: string; day: number } => !!c && c.date >= min && c.date <= max && !taken.has(c.date));
  const focusDate =
    (value.startsWith(key) && value) || enabled.find((c) => c.date === todayKey)?.date || enabled[0]?.date || "";

  return (
    <div className="rounded-2xl border border-sand/80 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={!canPrev}
          aria-label="Previous month"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-plum transition hover:bg-blush active:scale-95 disabled:opacity-25"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="font-serif text-lg font-semibold" aria-live="polite">
          {label}
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={!canNext}
          aria-label="Next month"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-plum transition hover:bg-blush active:scale-95 disabled:opacity-25"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wider text-muted" aria-hidden="true">
        {WEEKDAYS.map((w, i) => (
          <div key={i} title={WEEKDAYS_LONG[i]} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div
        key={key}
        ref={gridRef}
        role="group"
        aria-label={`Dates in ${label}`}
        onKeyDown={onGridKey}
        className={`mt-1 grid grid-cols-7 gap-y-1 ${dir > 0 ? "animate-step-in-right" : "animate-step-in-left"}`}
      >
        {cells.map((c, i) => {
          if (!c) return <div key={`e${i}`} />;
          const outOfRange = c.date < min || c.date > max;
          const isTaken = taken.has(c.date);
          const disabled = outOfRange || isTaken;
          const selected = c.date === value;
          const isToday = c.date === todayKey;
          const pendingLoad = loading && !known && !outOfRange;
          return (
            <div key={c.date} className="flex justify-center">
              <button
                type="button"
                data-date={c.date}
                disabled={disabled}
                tabIndex={c.date === focusDate ? 0 : -1}
                onClick={() => onChange(c.date)}
                aria-pressed={selected}
                aria-label={`${longLabel(c.date)}${isTaken ? ", already booked" : outOfRange ? ", unavailable" : ""}`}
                className={`relative inline-flex aspect-square w-full max-w-[46px] items-center justify-center rounded-full text-sm tabular-nums transition duration-200 ease-out-expo focus-visible:outline-offset-1 ${
                  selected
                    ? "animate-pop bg-plum font-semibold text-gold-light shadow-lift"
                    : isTaken
                      ? "cursor-not-allowed text-plum/30 line-through decoration-red-400/70 decoration-2"
                      : outOfRange
                        ? "cursor-not-allowed text-plum/20"
                        : pendingLoad
                          ? "text-plum/50"
                          : "font-medium text-plum hover:bg-blush active:scale-95"
                }`}
              >
                {c.day}
                {isToday && !selected && <span aria-hidden="true" className="absolute bottom-1 h-1 w-1 rounded-full bg-gold" />}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-sand/70 pt-3 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-plum" aria-hidden="true" /> Your date
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-plum/40 line-through decoration-red-400 decoration-2" aria-hidden="true">
            14
          </span>{" "}
          Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" /> Today
        </span>
        <span className={`ml-auto inline-flex items-center gap-1.5 transition-opacity ${loading ? "opacity-100" : "opacity-0"}`} aria-hidden={!loading}>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" /> Checking dates
        </span>
      </div>
      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}
    </div>
  );
}
