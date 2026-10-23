import Link from "next/link";
import React from "react";
import type { Metadata } from "next";
import { ArrowRight, Quote, Star } from "lucide-react";
import FadeImg from "../../components/site/FadeImg";
import PageHeader from "../../components/site/PageHeader";
import { WhatsAppIcon } from "../../components/site/WhatsAppFab";
import { getApprovedReviews, getPublicConfig } from "../../lib/booking/server";
import { formatEventDate, whatsappLink } from "../../lib/booking/types";
import { SITE_IMAGES } from "../../lib/site-images";

export const metadata: Metadata = {
  title: "Reviews",
  description: "What brides and families say about Makeovers by Prachi.",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? "fill-gold text-gold" : "fill-sand text-sand"}`} aria-hidden="true" />
      ))}
    </span>
  );
}

export default async function ReviewsPage() {
  const [reviews, { settings }] = await Promise.all([getApprovedReviews(), getPublicConfig()]);
  const wa = whatsappLink(settings.whatsappNumber, "Hi Prachi, I'd like to share a review of my makeup.");

  return (
    <main className="section pt-10 sm:pt-16">
      <div className="container-page">
        <PageHeader eyebrow="Reviews" title="Kind words from our brides" />

        {reviews.length > 0 ? (
          <div className="mt-12 columns-1 gap-6 md:columns-2 lg:columns-3">
            {reviews.map((r, i) => (
              <article key={r.id} className="card mb-6 break-inside-avoid p-6 sm:p-7" data-reveal data-reveal-delay={(i % 3) * 70}>
                <div className="flex items-center justify-between">
                  <Stars rating={r.rating} />
                  <Quote className="h-6 w-6 text-gold/40" aria-hidden="true" />
                </div>
                <blockquote className="mt-4 font-serif text-lg leading-relaxed text-plum">“{r.text}”</blockquote>
                <footer className="mt-5 flex items-center gap-3 border-t border-sand/70 pt-4 text-sm">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blush font-serif text-base font-semibold text-gold-dark" aria-hidden="true">
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <span className="block font-semibold">{r.name}</span>
                    <span className="block text-xs text-muted">
                      {[r.eventType, r.date && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? formatEventDate(r.date) : r.date]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </footer>
              </article>
            ))}
          </div>
        ) : (
          <section className="mt-12 overflow-hidden rounded-3xl border border-sand/80 bg-white shadow-soft" data-reveal>
            <div className="grid md:grid-cols-[1fr_1.1fr]">
              <div className="relative min-h-[240px] bg-blush md:min-h-[420px]">
                <FadeImg
                  src={SITE_IMAGES.services.bridal}
                  alt=""
                  sizes="(min-width: 768px) 480px, 100vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-plum-dark/50 to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/10" />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <span className="inline-flex gap-1" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                  ))}
                </span>
                <h2 className="h-display mt-5 text-3xl sm:text-4xl">Our first stories are on their way</h2>
                <p className="mt-4 leading-relaxed text-muted">
                  We&apos;re gathering words from our recent brides and their families. Were you one of them? We&apos;d be
                  so grateful to hear how your day went — a few lines on WhatsApp is perfect.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {wa && (
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-dark px-6">
                      <WhatsAppIcon className="h-4 w-4" /> Share your experience
                    </a>
                  )}
                  <Link href="/book" className="btn-ghost px-6">
                    Book your date <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
