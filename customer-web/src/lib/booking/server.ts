import "server-only";
import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin";
import type { PublicConfig, PublicService, PublicSettings } from "./types";

export const BOOKING_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const DEFAULT_TRAVEL_FEES: Record<string, number> = { jodhpur: 0, jaipur: 3500, udaipur: 3500, other: 8500 };

/** How long a calendar HOLD is extended once proof is submitted, so the date stays held while admin reviews. */
export const REVIEW_HOLD_EXTENSION_MS = 30 * 24 * 60 * 60 * 1000;

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function generateBookingId(): string {
  let out = "MBP-";
  for (let i = 0; i < 6; i++) out += BOOKING_ID_ALPHABET[randomInt(BOOKING_ID_ALPHABET.length)];
  return out;
}

function envWhatsapp(): string {
  return (process.env.NEXT_PUBLIC_STUDIO_WHATSAPP || process.env.STUDIO_WHATSAPP || "").replace(/[^0-9]/g, "");
}

function num(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback;
}

export function settingsFromDoc(data: Record<string, unknown> | undefined): PublicSettings {
  const d = data || {};
  const rawFees = (d.travelFees && typeof d.travelFees === "object" ? d.travelFees : {}) as Record<string, unknown>;
  const travelFees: Record<string, number> = {};
  for (const [k, v] of Object.entries({ ...DEFAULT_TRAVEL_FEES, ...rawFees })) {
    travelFees[k.toLowerCase()] = num(v, 0);
  }
  const whatsapp = str(d.whatsappNumber).replace(/[^0-9]/g, "") || envWhatsapp();
  return {
    businessName: str(d.businessName) || "Makeovers by Prachi",
    upiId: str(d.upiId),
    payeeName: str(d.payeeName) || str(d.businessName) || "Makeovers by Prachi",
    whatsappNumber: whatsapp,
    phoneDisplay: str(d.phoneDisplay) || (whatsapp ? `+${whatsapp}` : ""),
    email: str(d.email),
    studioAddress: str(d.studioAddress),
    depositPercent: Math.min(100, Math.max(0, num(d.depositPercent, 30))),
    holdMinutes: Math.min(24 * 60, Math.max(5, num(d.holdMinutes, 15))),
    travelFees,
  };
}

export function serviceFromDoc(id: string, d: Record<string, any>): PublicService {
  const price = Number(d.price);
  return {
    id,
    title: str(d.title) || "Makeup service",
    description: str(d.description),
    price: Number.isFinite(price) && price > 0 ? price : null,
    category: str(d.category),
    durationMinutes: Number.isFinite(Number(d.durationMinutes)) ? Number(d.durationMinutes) : null,
    imageUrl: str(d.imageUrl) || null,
    sortOrder: num(d.sortOrder, 999),
  };
}

export async function loadSettings(db: Firestore): Promise<{ settings: PublicSettings; exists: boolean }> {
  const snap = await db.doc("settings/business").get();
  return { settings: settingsFromDoc(snap.data()), exists: snap.exists };
}

export async function loadActiveServices(db: Firestore): Promise<PublicService[]> {
  // Single-field filter only (no composite index needed); sort in memory.
  const snap = await db.collection("services").where("active", "==", true).get();
  return snap.docs
    .map((doc) => serviceFromDoc(doc.id, doc.data()))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

const PUBLIC_DATA_TTL_S = 60;

/**
 * Firestore read for services + settings, kept in Next's data cache for 60s.
 * Unlike a module-level variable this survives dev hot-reloads and is shared by
 * every page render and the /api/public-config route, so public pages render
 * without a Firestore round-trip on each navigation. It throws on failure so an
 * error result is never cached. (Booking/pricing API routes read Firestore
 * directly and are NOT affected by this cache.)
 */
const loadPublicConfigCached = unstable_cache(
  async (): Promise<PublicConfig> => {
    const db = adminDb();
    const [{ settings, exists }, services] = await Promise.all([loadSettings(db), loadActiveServices(db)]);
    return { services, settings, available: exists };
  },
  ["public-config-v1"],
  { revalidate: PUBLIC_DATA_TTL_S, tags: ["public-config"] }
);

/** Services + public settings, cached for 60s. Never throws. */
export async function getPublicConfig(): Promise<PublicConfig> {
  try {
    return await loadPublicConfigCached();
  } catch (err: any) {
    console.error("[public-config] Could not load config from Firestore:", err?.message || err);
    return { services: [], settings: settingsFromDoc(undefined), available: false };
  }
}

export interface ApprovedReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  eventType: string;
  date: string;
}

const loadApprovedReviewsCached = unstable_cache(
  async (limit: number): Promise<ApprovedReview[]> => {
    const snap = await adminDb().collection("reviews").where("approved", "==", true).limit(limit).get();
    return snap.docs
      .map((doc) => {
        const d = doc.data();
        const rawDate = d.date?.toDate ? d.date.toDate().toISOString().slice(0, 10) : str(d.date);
        return {
          id: doc.id,
          name: str(d.name) || "Client",
          rating: Math.min(5, Math.max(1, Math.round(num(d.rating, 5)))),
          text: str(d.text),
          eventType: str(d.eventType),
          date: rawDate,
        };
      })
      .filter((r) => r.text)
      .sort((a, b) => b.date.localeCompare(a.date));
  },
  ["approved-reviews-v1"],
  { revalidate: PUBLIC_DATA_TTL_S, tags: ["reviews"] }
);

/** Approved reviews, cached for 60s. Never throws. */
export async function getApprovedReviews(limit = 50): Promise<ApprovedReview[]> {
  try {
    return await loadApprovedReviewsCached(limit);
  } catch (err: any) {
    console.error("[reviews] Could not load reviews:", err?.message || err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Very small in-memory rate limiter (per server instance). Good enough to slow
// down brute-force lookups; not a distributed limit.
// ---------------------------------------------------------------------------
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) {
    buckets.forEach((v, k) => {
      if (v.resetAt < now) buckets.delete(k);
    });
  }
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export function isHoldActive(cal: { status?: string; expiresAt?: string } | undefined, nowMs = Date.now()): boolean {
  if (!cal) return false;
  if (cal.status !== "HOLD") return false;
  const exp = cal.expiresAt ? Date.parse(cal.expiresAt) : NaN;
  return Number.isFinite(exp) && exp > nowMs;
}

export function isDateUnavailable(cal: { status?: string; expiresAt?: string } | undefined, nowMs = Date.now()): boolean {
  if (!cal) return false;
  if (cal.status === "BOOKED" || cal.status === "BLOCKED") return true;
  return isHoldActive(cal, nowMs);
}

/** Mark a lapsed DEPOSIT_PENDING booking EXPIRED and release its calendar hold. */
export async function expireBooking(bookingId: string) {
  const db = adminDb();
  const ref = db.doc(`bookings/${bookingId}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const b = snap.data();
    if (!b || b.status !== "DEPOSIT_PENDING") return;
    if (Date.parse(b.expiresAt || "") > Date.now()) return; // still within the hold
    const calRef = db.doc(`calendar/${b.event?.date}`);
    const calSnap = await tx.get(calRef);
    const cal = calSnap.data();
    tx.update(ref, { status: "EXPIRED", "payment.status": "EXPIRED", updatedAt: FieldValue.serverTimestamp() });
    if (cal && cal.status === "HOLD" && cal.bookingId === bookingId) tx.delete(calRef);
  });
}
