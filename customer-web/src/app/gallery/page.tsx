import Link from "next/link";
import React from "react";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import GalleryGrid from "../../components/site/GalleryGrid";
import { GALLERY } from "../../lib/site-images";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Bridal, engagement, party and destination makeup looks by Makeovers by Prachi.",
};

export default function GalleryPage() {
  return (
    <main className="section pt-10 sm:pt-16">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow eyebrow-line animate-fade-up">Gallery</p>
          <h1 className="h-display mt-3 animate-fade-up text-5xl sm:text-6xl" style={{ animationDelay: "60ms" }}>
            Looks we love creating
          </h1>
          <p className="lead mt-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
            A glimpse of the styles we work in. Ask us on WhatsApp for more photos of real brides in the look you have in mind.
          </p>
        </header>
        <GalleryGrid items={GALLERY} />
        <p className="mt-6 text-xs text-muted">Some images are representative photos used for illustration.</p>
        <div className="mt-12 flex flex-col items-center gap-3 text-center" data-reveal>
          <p className="font-serif text-2xl">Found a look you love?</p>
          <Link href="/book" className="btn-primary px-7">
            Book your date <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
