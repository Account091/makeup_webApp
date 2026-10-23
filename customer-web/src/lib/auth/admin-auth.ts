import { adminAuth } from "../firebase-admin";

/**
 * Firebase Admin Auth (shared singleton from lib/firebase-admin).
 */
export function getFirebaseAdminAuth() {
  return adminAuth();
}

/** The x-user-role header shortcut is ONLY honoured against the local Auth emulator, never in production. */
function mockHeadersAllowed(): boolean {
  return Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST) && process.env.NODE_ENV !== "production";
}

export interface AdminAuthResult {
  isAuthorized: boolean;
  role: string | null;
  orgId: string | null;
  uid: string | null;
  error?: string;
  isMocked?: boolean;
}

/**
 * Authoritative admin authentication verifier
 * Supports:
 * 1. REAL Firebase ID-token verification (Authorization: Bearer <idToken>)
 *    Verified against Firebase Auth Emulator or Production Firebase Auth.
 * 2. Mocked header fallback (x-user-role, x-org-id) — emulator + non-production only
 */
export async function verifyAdminAuthToken(req: Request): Promise<AdminAuthResult> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.substring(7).trim();
    try {
      const auth = getFirebaseAdminAuth();
      const decoded = await auth.verifyIdToken(idToken);

      const role = (decoded.role as string) || null;
      const orgId = (decoded.orgId as string) || null;
      const uid = decoded.uid || null;

      const isAuthorized = role === "admin" || role === "owner" || role === "super_admin";
      return {
        isAuthorized,
        role,
        orgId,
        uid,
        isMocked: false,
      };
    } catch (err: any) {
      return {
        isAuthorized: false,
        role: null,
        orgId: null,
        uid: null,
        error: `Invalid ID Token: ${err?.message || "Token verification failed"}`,
        isMocked: false,
      };
    }
  }

  // Header shortcut: emulator + non-production only
  const mockRole = mockHeadersAllowed() ? req.headers.get("x-user-role") : null;
  if (mockRole) {
    const role = mockRole;
    const orgId = req.headers.get("x-org-id") || process.env.DEFAULT_ORG_ID || "makeovers_by_prachi";
    const uid = req.headers.get("x-user-uid") || "admin_console";
    const isAuthorized = role === "admin" || role === "owner" || role === "super_admin";
    return {
      isAuthorized,
      role,
      orgId,
      uid,
      isMocked: true,
    };
  }

  return {
    isAuthorized: false,
    role: null,
    orgId: null,
    uid: null,
    error: "Missing authorization credentials (Bearer token required)",
    isMocked: false,
  };
}
