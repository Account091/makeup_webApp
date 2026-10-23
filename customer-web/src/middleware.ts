import { NextResponse, type NextRequest } from "next/server";

/**
 * Go-live gate. Only the core public flows are reachable. Internal/experimental
 * tools stay in the codebase but are hidden unless ENABLE_INTERNAL_TOOLS=true:
 *   - their pages respond 404
 *   - every API route not in PUBLIC_API respond 401 JSON
 */

const HIDDEN_PAGE_PREFIXES = [
  "/marketplace",
  "/marketplace-admin",
  "/artist",
  "/organization",
  "/platform-admin",
  "/bi",
  "/financial",
  "/whatsapp-admin",
  "/admin-copilot",
  "/ai-safety",
  "/content-draft",
  "/customer-intelligence",
  "/marketing-intelligence",
  "/forecasting-intelligence",
  "/location-intelligence",
  "/location-optimization",
  "/destination-ops",
  "/my-wedding",
  "/quote",
  "/concierge",
  "/ai-concierge",
];

/** API routes the public site needs. Everything else under /api is internal. */
const PUBLIC_API = [
  "/api/booking/create-session",
  "/api/booking/submit-proof",
  "/api/booking/lookup",
  "/api/availability",
  "/api/public-config",
  "/api/health",
  "/api/ai/whatsapp/webhook",
];

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function middleware(req: NextRequest) {
  if (process.env.ENABLE_INTERNAL_TOOLS === "true") return NextResponse.next();

  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/")) {
    // /api/health is public, /api/health/dependencies is not.
    const allowed = PUBLIC_API.some((p) => pathname === p || pathname === `${p}/`);
    if (allowed) return NextResponse.next();
    return NextResponse.json({ error: "Not available." }, { status: 401 });
  }

  if (HIDDEN_PAGE_PREFIXES.some((p) => matches(pathname, p))) {
    // Render the site's 404 page with a real 404 status.
    const url = req.nextUrl.clone();
    url.pathname = "/404";
    return NextResponse.rewrite(url, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
