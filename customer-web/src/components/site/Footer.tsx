import Link from "next/link";
import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { whatsappLink, type PublicSettings } from "../../lib/booking/types";
import { WhatsAppIcon } from "./WhatsAppFab";

const EXPLORE = [
  { href: "/services", label: "Services & prices" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/book", label: "Book your date" },
  { href: "/track", label: "Track a booking" },
];
const PLACES = [
  { href: "/jodhpur", label: "Jodhpur" },
  { href: "/jaipur", label: "Jaipur" },
  { href: "/udaipur", label: "Udaipur" },
  { href: "/destination-weddings", label: "Destination weddings" },
];

export default function Footer({ settings }: { settings: PublicSettings }) {
  const wa = whatsappLink(settings.whatsappNumber);
  const tel = settings.phoneDisplay ? settings.phoneDisplay.replace(/[^0-9+]/g, "") : "";
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 overflow-hidden bg-plum-dark text-white/75">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_0%_0%,rgba(212,175,55,0.10),transparent_60%)]"
      />
      <div className="container-page relative grid gap-10 py-14 sm:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-12">
        <div className="max-w-sm">
          <p className="font-serif text-2xl font-semibold text-white">
            Makeovers <span className="font-medium italic text-gold-light">by Prachi</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            Bridal, engagement and party makeup from our Jodhpur studio, and on location across Rajasthan.
          </p>
          <Link href="/book" className="btn-primary mt-6 px-5">
            Book your date
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-8 lg:contents">
          <FooterGroup title="Explore" links={EXPLORE} />
          <FooterGroup title="Where we work" links={PLACES} />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-light">Contact</p>
          <ul className="mt-4 space-y-3 text-sm">
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 transition-colors hover:text-gold-light">
                  <WhatsAppIcon className="h-4 w-4 text-gold-light" /> WhatsApp us
                </a>
              </li>
            )}
            {tel && (
              <li>
                <a href={`tel:${tel}`} className="inline-flex items-center gap-2.5 transition-colors hover:text-gold-light">
                  <Phone className="h-4 w-4 text-gold-light" aria-hidden="true" /> {settings.phoneDisplay}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2.5 break-all transition-colors hover:text-gold-light">
                  <Mail className="h-4 w-4 shrink-0 text-gold-light" aria-hidden="true" /> {settings.email}
                </a>
              </li>
            )}
            <li className="flex items-start gap-2.5 leading-relaxed">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" aria-hidden="true" />
              <span>{settings.studioAddress || "Jodhpur, Rajasthan"}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div
          className="container-page flex flex-col gap-2 py-5 pr-20 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between"
          style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <p>
            © {year} {settings.businessName}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-gold-light">
              Privacy policy
            </Link>
            <Link href="/contact" className="transition-colors hover:text-gold-light">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-light">{title}</p>
      <ul className="mt-4 space-y-1 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-block py-1.5 transition-colors hover:text-gold-light">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
