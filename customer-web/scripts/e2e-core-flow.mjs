/**
 * End-to-end test of the go-live booking flow against the Firebase emulators
 * and a running website (docs/BOOKING_CONTRACT.md).
 *
 * Customer side uses the public HTTP API. Staff side signs in with a real
 * staff account and performs the same Firestore transactions the Flutter
 * admin app does, through the real security rules.
 *
 * Prereqs: emulators (auth, firestore, storage) running with project
 * demo-makeovers, `npm run seed`, `node scripts/create-staff.js
 * staff@test.com Passw0rd!! admin`, and the site at BASE_URL.
 *
 *   BASE_URL=http://127.0.0.1:3100 node scripts/e2e-core-flow.mjs
 */
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  terminate,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3100";
const PROJECT = process.env.FIREBASE_PROJECT_ID || "demo-makeovers";

let passed = 0;
let failed = 0;
function check(name, ok, detail = "") {
  if (ok) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.error(`  FAIL  ${name} ${detail}`);
  }
}

async function api(path, init) {
  const res = await fetch(BASE + path, { ...init, signal: AbortSignal.timeout(20000) });
  let body = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON response
  }
  return { status: res.status, body };
}

const postJson = (path, data) =>
  api(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });

// 1x1 PNG
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

function proofForm(bookingId, phone, utr) {
  const fd = new FormData();
  fd.set("bookingId", bookingId);
  fd.set("phone", phone);
  fd.set("utrNumber", utr);
  fd.set("file", new Blob([PNG], { type: "image/png" }), "proof.png");
  return fd;
}

function futureDate(daysAhead) {
  const d = new Date(Date.now() + daysAhead * 86400000);
  return d.toISOString().slice(0, 10);
}

function bookingRequest(date, phone, city = "Jaipur") {
  return {
    serviceId: "bridal-signature",
    date,
    readyTime: "16:00",
    venue: "Test Palace",
    city,
    guestCount: 3,
    fullName: "E2E Bride",
    phone,
    email: "bride@example.com",
  };
}

// Staff client = what the Flutter admin app does.
const app = initializeApp({ apiKey: "demo", projectId: PROJECT, appId: "1:1:web:1" });
const auth = getAuth(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8080);

async function staffApprove(bookingId) {
  await runTransaction(db, async (tx) => {
    const ref = doc(db, "bookings", bookingId);
    const snap = await tx.get(ref);
    const data = snap.data();
    if (data.status !== "PAYMENT_PROOF_SUBMITTED") throw new Error(`status is ${data.status}`);
    const calRef = doc(db, "calendar", data.event.date);
    await tx.get(calRef);
    tx.update(ref, {
      status: "CONFIRMED",
      "payment.status": "VERIFIED",
      "payment.verifiedAt": serverTimestamp(),
      "payment.verifiedBy": auth.currentUser.email,
      "commercials.depositPaid": data.commercials.depositRequired,
      confirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    tx.set(calRef, { status: "BOOKED", bookingId, updatedAt: serverTimestamp() });
  });
}

async function staffReject(bookingId, reason) {
  await runTransaction(db, async (tx) => {
    const ref = doc(db, "bookings", bookingId);
    const data = (await tx.get(ref)).data();
    const calRef = doc(db, "calendar", data.event.date);
    const cal = await tx.get(calRef);
    tx.update(ref, {
      status: "PAYMENT_REJECTED",
      "payment.status": "REJECTED",
      "payment.rejectionReason": reason,
      updatedAt: serverTimestamp(),
    });
    if (cal.exists() && cal.data().bookingId === bookingId) tx.delete(calRef);
  });
}

async function main() {
  const suffix = String(Date.now()).slice(-4);
  const dateA = futureDate(120 + (Number(suffix) % 200));
  const dateB = futureDate(400 + (Number(suffix) % 200));
  const phoneA = `98765${suffix}1`.slice(0, 10);
  const phoneB = `91234${suffix}2`.slice(0, 10);
  const utrA = `4${suffix}${suffix}123`.slice(0, 12);
  const utrB = `5${suffix}${suffix}456`.slice(0, 12);

  console.log("public site");
  for (const p of ["/", "/services", "/book", "/track", "/contact", "/gallery", "/reviews", "/privacy", "/jaipur"]) {
    const res = await fetch(BASE + p, { signal: AbortSignal.timeout(20000) });
    check(`GET ${p} -> 200`, res.status === 200, `(got ${res.status})`);
  }
  for (const p of ["/marketplace", "/platform-admin", "/financial", "/my-wedding"]) {
    const res = await fetch(BASE + p, { signal: AbortSignal.timeout(20000) });
    check(`hidden page ${p} -> 404`, res.status === 404, `(got ${res.status})`);
  }
  const fcm = await postJson("/api/system/send-fcm", { title: "x", body: "y" });
  check("internal API /api/system/send-fcm -> 401", fcm.status === 401, `(got ${fcm.status})`);
  const spoof = await api("/api/admin/knowledge", { headers: { "x-user-role": "admin" } });
  check("x-user-role header does not grant admin", spoof.status === 401 || spoof.status === 403, `(got ${spoof.status})`);

  const cfg = await api("/api/public-config");
  check("public-config lists services", cfg.body?.services?.length > 0);
  check("public-config has UPI id", Boolean(cfg.body?.settings?.upiId));

  console.log("customer A: book -> pay -> admin approves");
  const s1 = await postJson("/api/booking/create-session", bookingRequest(dateA, phoneA));
  check("create-session 200", s1.status === 200, JSON.stringify(s1.body));
  const idA = s1.body?.bookingId;
  check("booking id format MBP-XXXXXX", /^MBP-[A-Z2-9]{6}$/.test(idA || ""), idA);
  check("price = 25000 + 3500 travel", s1.body?.totalAmount === 28500, String(s1.body?.totalAmount));
  check("deposit = 30%", s1.body?.depositAmount === 8550, String(s1.body?.depositAmount));

  const clash = await postJson("/api/booking/create-session", bookingRequest(dateA, phoneB));
  check("another customer cannot hold the same date (409)", clash.status === 409, `(got ${clash.status})`);

  const avail = await api(`/api/availability?month=${dateA.slice(0, 7)}`);
  check("held date shows unavailable", avail.body?.unavailable?.includes(dateA), JSON.stringify(avail.body));

  const wrongPhone = await api("/api/booking/submit-proof", { method: "POST", body: proofForm(idA, phoneB, utrA) });
  check("proof with wrong phone rejected", wrongPhone.status >= 400 && wrongPhone.status < 500, `(got ${wrongPhone.status})`);

  const p1 = await api("/api/booking/submit-proof", { method: "POST", body: proofForm(idA, phoneA, utrA) });
  check("submit-proof 200", p1.status === 200, JSON.stringify(p1.body));

  const l1 = await postJson("/api/booking/lookup", { bookingId: idA, phone: phoneA });
  check("track shows PAYMENT_PROOF_SUBMITTED", l1.body?.booking?.status === "PAYMENT_PROOF_SUBMITTED", JSON.stringify(l1.body));
  const lWrong = await postJson("/api/booking/lookup", { bookingId: idA, phone: phoneB });
  check("track with wrong phone -> 404", lWrong.status === 404, `(got ${lWrong.status})`);

  await signInWithEmailAndPassword(auth, "staff@test.com", "Passw0rd!!");
  const staffView = await getDoc(doc(db, "bookings", idA));
  check("staff can read the booking", staffView.exists());
  check("proof stored in Storage path", String(staffView.data()?.payment?.proofPath || "").startsWith(`payment_proofs/${idA}/`));
  await staffApprove(idA);

  const l2 = await postJson("/api/booking/lookup", { bookingId: idA, phone: phoneA });
  check("customer now sees CONFIRMED", l2.body?.booking?.status === "CONFIRMED", JSON.stringify(l2.body?.booking?.status));
  check("deposit recorded as paid", l2.body?.booking?.commercials?.depositPaid === 8550);
  const cal = await getDoc(doc(db, "calendar", dateA));
  check("calendar date BOOKED", cal.data()?.status === "BOOKED" && cal.data()?.bookingId === idA);
  const again = await postJson("/api/booking/create-session", bookingRequest(dateA, phoneB));
  check("booked date cannot be booked again (409)", again.status === 409, `(got ${again.status})`);

  console.log("customer B: pay -> admin rejects -> date is free");
  const s2 = await postJson("/api/booking/create-session", bookingRequest(dateB, phoneB, "Jodhpur"));
  check("create-session 200 (Jodhpur, no travel)", s2.status === 200 && s2.body?.totalAmount === 25000, JSON.stringify(s2.body));
  const idB = s2.body?.bookingId;
  const dupUtr = await api("/api/booking/submit-proof", { method: "POST", body: proofForm(idB, phoneB, utrA) });
  check("reused UTR rejected (409)", dupUtr.status === 409, `(got ${dupUtr.status})`);
  const p2 = await api("/api/booking/submit-proof", { method: "POST", body: proofForm(idB, phoneB, utrB) });
  check("submit-proof 200", p2.status === 200, JSON.stringify(p2.body));
  await staffReject(idB, "Amount on screenshot does not match");
  const l3 = await postJson("/api/booking/lookup", { bookingId: idB, phone: phoneB });
  check("customer sees PAYMENT_REJECTED with reason",
    l3.body?.booking?.status === "PAYMENT_REJECTED" && /does not match/.test(l3.body?.booking?.payment?.rejectionReason || ""),
    JSON.stringify(l3.body?.booking));
  const freed = await postJson("/api/booking/create-session", bookingRequest(dateB, phoneA));
  check("rejected date is bookable again", freed.status === 200, `(got ${freed.status})`);

  console.log("validation");
  const past = await postJson("/api/booking/create-session", bookingRequest("2020-01-01", phoneA));
  check("past date rejected (400)", past.status === 400, `(got ${past.status})`);
  const badPhone = await postJson("/api/booking/create-session", bookingRequest(futureDate(700), "12345"));
  check("invalid phone rejected (400)", badPhone.status === 400, `(got ${badPhone.status})`);

  await terminate(db);
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed === 0 ? 0 : 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
