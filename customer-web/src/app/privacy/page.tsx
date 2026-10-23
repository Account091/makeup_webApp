import React from "react";
import type { Metadata } from "next";
import { getPublicConfig } from "../../lib/booking/server";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Makeovers by Prachi collects, uses and protects your personal information.",
};

export default async function PrivacyPage() {
  const { settings } = await getPublicConfig();
  const contact = [settings.email, settings.phoneDisplay].filter(Boolean).join(" or ");

  return (
    <main className="section pt-10 sm:pt-16">
      <article className="container-page max-w-3xl">
        <p className="eyebrow eyebrow-line animate-fade-up">Privacy policy</p>
        <h1 className="h-display mt-3 animate-fade-up text-5xl sm:text-6xl">Your privacy</h1>
        <p className="mt-3 text-sm text-muted">Last updated: October 2026</p>

        <div className="mt-10 space-y-6 text-[15px] leading-relaxed text-plum/85">
          <section className="card p-6 sm:p-8" data-reveal>
            <h2 className="font-serif text-2xl font-semibold text-plum">Who we are</h2>
            <p className="mt-3">
              {settings.businessName} is a makeup studio based in Jodhpur, Rajasthan. This policy explains what personal
              information we collect through this website and how we use it.
            </p>
          </section>

          <section className="card p-6 sm:p-8" data-reveal>
            <h2 className="font-serif text-2xl font-semibold text-plum">What we collect</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-gold">
              <li>Your name, mobile number and (optionally) email address.</li>
              <li>Event details: date, ready-by time, venue, city, number of people and any notes you add.</li>
              <li>Payment details you give us: the UPI reference (UTR) number and the screenshot of your deposit payment.</li>
              <li>Basic technical information (such as IP address) used to protect the site from abuse.</li>
            </ul>
            <p className="mt-3">We do not collect card or bank account details. UPI payments happen in your own payment app.</p>
          </section>

          <section className="card p-6 sm:p-8" data-reveal>
            <h2 className="font-serif text-2xl font-semibold text-plum">Why we use it</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-gold">
              <li>To reserve your date, verify your deposit and confirm your booking.</li>
              <li>To contact you about your booking by phone, WhatsApp or email.</li>
              <li>To keep accounting and tax records.</li>
            </ul>
            <p className="mt-3">We do not sell your information or use it for third-party advertising.</p>
          </section>

          <section className="card p-6 sm:p-8" data-reveal>
            <h2 className="font-serif text-2xl font-semibold text-plum">Where it is stored</h2>
            <p className="mt-3">
              Booking information and payment screenshots are stored securely with Google Firebase. Only the studio owner
              and authorised staff can view them. If you message us on WhatsApp, that conversation is also subject to
              WhatsApp&apos;s own privacy policy.
            </p>
          </section>

          <section className="card p-6 sm:p-8" data-reveal>
            <h2 className="font-serif text-2xl font-semibold text-plum">How long we keep it</h2>
            <p className="mt-3">
              We keep booking records for as long as needed for your event and for our accounting and legal obligations
              (generally up to 8 years for financial records). Payment screenshots are deleted once they are no longer
              needed for verification or accounts. Unpaid booking requests that expire may be deleted sooner.
            </p>
          </section>

          <section className="card p-6 sm:p-8" data-reveal>
            <h2 className="font-serif text-2xl font-semibold text-plum">Your choices</h2>
            <p className="mt-3">
              You can ask us for a copy of the information we hold about you, ask us to correct it, or ask us to delete it
              where we are not required to keep it.
            </p>
          </section>

          <section className="card p-6 sm:p-8" data-reveal>
            <h2 className="font-serif text-2xl font-semibold text-plum">Contact</h2>
            <p className="mt-3">
              For any privacy question or request, contact {settings.businessName}
              {contact ? ` at ${contact}` : " through the Contact page"}
              {settings.studioAddress ? `, or write to us at ${settings.studioAddress}` : ""}.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
