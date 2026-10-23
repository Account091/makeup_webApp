"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/destination-weddings", label: "Destinations" },
  { href: "/track", label: "Track booking" },
  { href: "/contact", label: "Contact" },
];

/** Routes that open with a full-bleed dark hero: the header floats over it. */
const OVERLAY_ROUTES = new Set(["/", "/jodhpur", "/jaipur", "/udaipur", "/destination-weddings"]);

export default function Header({ whatsappHref }: { whatsappHref?: string | null }) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const overlayRoute = OVERLAY_ROUTES.has(pathname);
  const transparent = overlayRoute && !scrolled && !open;
  const dark = overlayRoute || open;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Body scroll lock + Escape + focus trap while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    const first = headerRef.current?.querySelector<HTMLElement>("#mobile-menu a");
    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !headerRef.current) return;
      const items = Array.from(
        headerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = useCallback(
    (href: string) => (href === "/" ? pathname === "/" : Boolean(pathname.startsWith(href))),
    [pathname]
  );

  // NB: no backdrop-filter while the menu is open — it would turn the header
  // into the containing block of the fixed menu sheet.
  const shell = open
    ? "border-white/10 bg-plum-dark"
    : transparent
    ? "border-transparent bg-gradient-to-b from-plum-dark/70 via-plum-dark/25 to-transparent"
    : dark
      ? "border-white/10 bg-plum-dark/85 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      : scrolled
        ? "border-sand bg-ivory/85 shadow-soft backdrop-blur-xl"
        : "border-sand/70 bg-ivory/70 backdrop-blur-xl";

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ease-out-expo ${shell}`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-3 lg:h-20">
          <Link href="/" className="group min-w-0 leading-none" aria-label="Makeovers by Prachi, home">
            <span className={`block whitespace-nowrap font-serif text-[1.15rem] font-semibold tracking-tight min-[400px]:text-[1.3rem] sm:text-2xl ${dark ? "text-white" : "text-plum"}`}>
              Makeovers <span className={`font-medium italic ${dark ? "text-gold-light" : "text-gold-dark"}`}>by Prachi</span>
            </span>
            <span className={`mt-1 hidden text-[10px] font-medium uppercase tracking-[0.28em] sm:block ${dark ? "text-white/60" : "text-muted"}`}>
              Bridal makeup studio · Jodhpur
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-3 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:transition-transform after:duration-300 after:ease-out-expo hover:after:scale-x-100 ${
                    dark ? "after:bg-gold-light" : "after:bg-gold-dark"
                  } ${
                    active
                      ? dark
                        ? "text-gold-light after:scale-x-100"
                        : "text-gold-dark after:scale-x-100"
                      : dark
                        ? "text-white/85 hover:text-white"
                        : "text-plum/80 hover:text-plum"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/book" className="btn-primary ml-3 px-5">
              Book your date
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            {!open && pathname !== "/book" && (
              <Link href="/book" className="btn-primary min-h-[40px] px-4 py-2 text-xs">
                Book now
              </Link>
            )}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition active:scale-95 ${
                dark ? "border-white/25 text-white hover:bg-white/10" : "border-plum/15 text-plum hover:bg-plum/5"
              }`}
            >
              {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {open && (
          <nav
            id="mobile-menu"
            aria-label="Mobile"
            className="fixed inset-x-0 bottom-0 top-16 flex animate-sheet-down flex-col overflow-y-auto bg-plum-dark text-white lg:hidden"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_100%_0%,rgba(212,175,55,0.16),transparent_70%)]"
            />
            <ul className="container-page relative flex flex-col pt-4">
              {[{ href: "/", label: "Home" }, ...NAV].map((item, i) => (
                <li key={item.href} className="animate-fade-up" style={{ animationDelay: `${40 + i * 30}ms` }}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`flex min-h-[56px] items-center justify-between border-b border-white/10 font-serif text-2xl ${
                      isActive(item.href) ? "text-gold-light" : "text-white"
                    }`}
                  >
                    {item.label}
                    <ArrowRight className="h-4 w-4 text-white/40" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
            <div
              className="container-page relative mt-auto grid gap-3 pb-6 pt-8"
              style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
            >
              <Link href="/book" onClick={() => setOpen(false)} className="btn-primary w-full py-4 text-base">
                Book your date
              </Link>
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-light w-full py-4 text-base">
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </nav>
        )}
      </header>
      {/* Pages without a hero start below the fixed header */}
      {!overlayRoute && <div aria-hidden="true" className="h-16 lg:h-20" />}
    </>
  );
}
