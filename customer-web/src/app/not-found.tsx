import Link from "next/link";
import React from "react";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="section">
      <div className="container-page max-w-xl text-center">
        <p className="animate-fade-up font-serif text-[7rem] font-medium leading-none text-gold/50 sm:text-[9rem]">404</p>
        <h1 className="h-display mt-2 animate-fade-up text-4xl sm:text-5xl" style={{ animationDelay: "60ms" }}>
          This page has wandered off
        </h1>
        <p className="mt-4 animate-fade-up text-muted" style={{ animationDelay: "120ms" }}>
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to something lovely.
        </p>
        <div className="mt-10 flex animate-fade-up flex-wrap justify-center gap-3" style={{ animationDelay: "180ms" }}>
          <Link href="/book" className="btn-primary px-7">
            Book your date <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/" className="btn-ghost px-7">
            Go home
          </Link>
        </div>
        <nav aria-label="Popular pages" className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/services" className="link-gold">Services &amp; prices</Link>
          <Link href="/gallery" className="link-gold">Gallery</Link>
          <Link href="/track" className="link-gold">Track a booking</Link>
          <Link href="/contact" className="link-gold">Contact</Link>
        </nav>
      </div>
    </main>
  );
}
