import { NextResponse } from "next/server";
import { FieldPath } from "firebase-admin/firestore";
import { adminDb } from "../../../lib/firebase-admin";
import { isDateUnavailable, jsonError } from "../../../lib/booking/server";

export const dynamic = "force-dynamic";

/** GET /api/availability?month=YYYY-MM -> { unavailable: ["YYYY-MM-DD", ...] } */
export async function GET(req: Request) {
  const month = new URL(req.url).searchParams.get("month") || "";
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return jsonError("Please pass month=YYYY-MM.", 400);

  try {
    const snap = await adminDb()
      .collection("calendar")
      .where(FieldPath.documentId(), ">=", `${month}-01`)
      .where(FieldPath.documentId(), "<=", `${month}-31`)
      .get();
    const now = Date.now();
    const unavailable = snap.docs
      .filter((d) => isDateUnavailable(d.data() as { status?: string; expiresAt?: string }, now))
      .map((d) => d.id)
      .sort();
    return NextResponse.json({ month, unavailable }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[availability] error:", err);
    return jsonError("Could not check availability right now.", 500);
  }
}
