import Link from "next/link";
import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { getPublicConfig } from "../../lib/booking/server";
import { formatINR, travelFeeFor, whatsappLink } from "../../lib/booking/types";
import { SITE_IMAGES, serviceImage } from "../../lib/site-images";
import FadeImg from "./FadeImg";
import { WhatsAppIcon } from "./WhatsAppFab";

interface Props {
  eyebrow: string;
  title: string;
  intro: string;
  /** travelFees key; omit for destination weddings (quoted individually) */
  cityKey?: string;
  bookCity?: string;
  highlights: string[];
  path: string;
  heroImage: string;
}

const OTHER_PLACES = [
  { href: "/jodhpur", name: "Jodhpur", img: SITE_IMAGES.cities.jodhpur },
  { href: "/jaipur", name: "Jaipur", img: SITE_IMAGES.cities.jaipur },
  { href: "/udaipur", name: "Udaipur", img: SITE_IMAGES.cities.udaipur },
  { href: "/destination-weddings", name: "Destination weddings", img: SITE_IMAGES.cities.destination },
];

export default async function CityPage({ eyebrow, title, intro, cityKey, bookCity, highlights, path, heroImage }: Props) {
  const { services, settings } = await getPublicConfig();
  const priced = services.filter((s) => s.price);
  const fee = cityKey ? travelFeeFor(cityKey, settings.travelFees) : null;
  const wa = whatsappLink(settings.whatsappNumber, `Hi Prachi, I'm planning an event (${eyebrow}). Could you share details?`);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://makeoversbyprachi.com";

  const schema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: settings.businessName,
    url: `${siteUrl}${path}`,
    areaServed: eyebrow,
    ...(settings.phoneDisplay ? { telephone: settings.phoneDisplay.replace(/[^0-9+]/g, "") } : {}),
    ...(settings.studioAddress
      ? { address: { "@type": "PostalAddress", streetAddress: settings.studioAddress, addressLocality: "Jodhpur", addressRegion: "Rajasthan", addressCountry: "IN" } }
      : {}),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="relative isolate flex min-h-[560px] items-end overflow-hidden bg-plum-dark text-white sm:min-h-[640px]">
        <FadeImg src={heroImage} alt="" loading="eager" sizes="100vw" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-plum-dark via-plum-dark/45 to-plum-dark/40" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-plum-dark/70 via-transparent to-transparent" />
        <div className="container-page pb-14 pt-32 sm:pb-20">
          <p className="eyebrow eyebrow-line animate-fade-up text-gold-light">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl animate-fade-up font-serif text-[2.6rem] font-medium leading-[1.05] tracking-tight sm:text-6xl" style={{ animationDelay: "60ms" }}>
            {title}
          </h1>
          <p className="mt-5 max-w-2xl animate-fade-up text-white/80 sm:text-lg" style={{ animationDelay: "120ms" }}>
            {intro}
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
            <Link href={bookCity ? `/book?city=${encodeURIComponent(bookCity)}` : "/book"} className="btn-primary px-7">
              Check date &amp; book <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-light px-7">
                <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow eyebrow-line" data-reveal>
              What to expect
            </p>
            <h2 className="h-display mt-3 text-4xl" data-reveal>
              Everything taken care of
            </h2>
            <ul className="mt-8 space-y-4">
              {highlights.map((h, i) => (
                <li key={h} className="flex gap-4" data-reveal data-reveal-delay={i * 70}>
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-pale text-plum">
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="leading-relaxed text-plum/85">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="card h-fit p-6 sm:p-8" data-reveal data-reveal-delay="100">
            <h2 className="font-serif text-2xl font-semibold">Prices{cityKey ? ` for ${eyebrow}` : ""}</h2>
            {priced.length > 0 ? (
              <ul className="mt-5 space-y-3 text-sm">
                {priced.map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-blush">
                      <FadeImg src={serviceImage(s)} alt="" sizes="44px" className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0 flex-1 text-plum">{s.title}</span>
                    <span className="shrink-0 font-semibold tabular-nums">{formatINR(s.price)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">Prices on request.</p>
            )}
            <div className="mt-6 space-y-1.5 rounded-xl bg-champagne p-4 text-sm text-muted">
              <p>
                {fee === null
                  ? "Travel and stay for destination weddings are quoted for your venue and dates."
                  : fee > 0
                    ? `Travel fee for ${eyebrow}: ${formatINR(fee)}, added to the package price.`
                    : `No travel fee within ${eyebrow}.`}
              </p>
              <p>A {settings.depositPercent}% deposit reserves your date.</p>
            </div>
            <Link href="/services" className="link-gold mt-5 text-sm">
              Full service details <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>

      <section className="container-page" aria-label="Other places we work">
        <p className="eyebrow eyebrow-line" data-reveal>
          Also travelling to
        </p>
        <div className="no-scrollbar -mx-5 mt-6 flex snap-x scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
          {OTHER_PLACES.filter((p) => p.href !== path).map((p, i) => (
            <Link
              key={p.href}
              href={p.href}
              data-reveal
              data-reveal-delay={i * 70}
              className="group relative block aspect-[16/10] w-[70%] shrink-0 snap-start overflow-hidden rounded-2xl bg-plum sm:w-auto"
            >
              <FadeImg src={p.img} alt="" sizes="(min-width: 640px) 33vw, 70vw" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105" />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-plum-dark/80 to-transparent" />
              <p className="absolute bottom-4 left-5 font-serif text-xl font-semibold text-white">{p.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
