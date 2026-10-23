import Link from "next/link";
import React from "react";
import type { Metadata } from "next";
import { ArrowRight, Car, ShieldCheck, Timer, Upload } from "lucide-react";
import PageHeader from "../../components/site/PageHeader";
import ServiceCard from "../../components/site/ServiceCard";
import { getPublicConfig } from "../../lib/booking/server";
import { formatINR } from "../../lib/booking/types";

export const metadata: Metadata = {
  title: "Services & Prices",
  description: "Bridal, engagement, party and destination makeup packages by Makeovers by Prachi, with transparent starting prices.",
};

function cityLabel(key: string) {
  return key === "other" ? "Other cities" : key.charAt(0).toUpperCase() + key.slice(1);
}

export default async function ServicesPage() {
  const { services, settings } = await getPublicConfig();
  const fees = Object.entries(settings.travelFees).sort(([a], [b]) => (a === "other" ? 1 : b === "other" ? -1 : a.localeCompare(b)));

  return (
    <main className="section pt-10 sm:pt-16">
      <div className="container-page">
        <PageHeader
          eyebrow="Services & prices"
          title="Choose your look"
          intro="Every package starts with a consultation about your outfit, jewellery and the look you want. Prices are starting prices for one person getting ready in Jodhpur."
        />

        {services.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} delay={(i % 3) * 80} />
            ))}
          </div>
        ) : (
          <div className="alert-info mt-12">
            Prices on request. Our service list is being updated, so please{" "}
            <Link href="/contact" className="font-semibold underline">
              contact us
            </Link>{" "}
            for a quote.
          </div>
        )}

        <section className="mt-16 grid gap-6 lg:grid-cols-2" aria-label="Travel and deposit">
          <div className="card p-6 sm:p-8" data-reveal>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blush text-gold-dark">
                <Car className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-serif text-2xl font-semibold">Travel fees</h2>
            </div>
            <p className="mt-3 text-sm text-muted">Added to the package price depending on where you&apos;re getting ready.</p>
            <ul className="mt-5 divide-y divide-sand/70 text-sm">
              {fees.map(([city, fee]) => (
                <li key={city} className="flex items-center justify-between py-3">
                  <span className="text-plum">{cityLabel(city)}</span>
                  <span className={`font-semibold tabular-nums ${fee > 0 ? "text-plum" : "text-emerald-700"}`}>
                    {fee > 0 ? formatINR(fee) : "No travel fee"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-plum-dark p-6 text-white shadow-lift sm:p-8" data-reveal data-reveal-delay="80">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_100%_0%,rgba(212,175,55,0.2),transparent_60%)]" />
            <h2 className="relative font-serif text-2xl font-semibold">How the deposit works</h2>
            <ul className="relative mt-6 space-y-5 text-sm leading-relaxed text-white/80">
              <li className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-light" aria-hidden="true" />
                <span>
                  A <strong className="text-white">{settings.depositPercent}% deposit</strong> of the total reserves your date. The
                  balance is settled directly with the studio.
                </span>
              </li>
              <li className="flex gap-3">
                <Timer className="mt-0.5 h-5 w-5 shrink-0 text-gold-light" aria-hidden="true" />
                <span>
                  When you book online your date is held for <strong className="text-white">{settings.holdMinutes} minutes</strong>{" "}
                  while you pay by UPI.
                </span>
              </li>
              <li className="flex gap-3">
                <Upload className="mt-0.5 h-5 w-5 shrink-0 text-gold-light" aria-hidden="true" />
                <span>Upload your payment screenshot and UPI reference; we confirm once it&apos;s verified.</span>
              </li>
            </ul>
            <Link href="/book" className="btn-primary relative mt-8 px-7">
              Book your date <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
