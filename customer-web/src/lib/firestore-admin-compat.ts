import "server-only";
/**
 * Tiny adapter exposing the client-SDK style helpers (doc/getDoc/setDoc/...)
 * on top of firebase-admin, so server routes written against the client SDK
 * can run with service-account privileges without a full rewrite.
 */
import { FieldValue, type CollectionReference, type DocumentReference, type Firestore } from "firebase-admin/firestore";
import { adminDb } from "./firebase-admin";

export function getDb(): Firestore {
  return adminDb();
}

export function collection(db: Firestore, path: string): CollectionReference {
  return db.collection(path);
}

export function doc(parent: Firestore | CollectionReference, ...segments: string[]): DocumentReference {
  const path = segments.join("/");
  if (typeof (parent as CollectionReference).add === "function") {
    return path ? (parent as CollectionReference).doc(path) : (parent as CollectionReference).doc();
  }
  return (parent as Firestore).doc(path);
}

export async function getDoc(ref: DocumentReference) {
  const snap = await ref.get();
  return { id: snap.id, exists: () => snap.exists, data: () => snap.data() };
}

export async function setDoc(ref: DocumentReference, data: Record<string, unknown>, options?: { merge?: boolean }) {
  await ref.set(data, options || {});
}

export async function updateDoc(ref: DocumentReference, data: Record<string, unknown>) {
  await ref.update(data);
}

export async function addDoc(ref: CollectionReference, data: Record<string, unknown>) {
  return ref.add(data);
}

export function serverTimestamp() {
  return FieldValue.serverTimestamp();
}
