import React from "react";

/** Inner-page loading state: page header + a grid of image cards. */
export function PageSkeleton({ cards = 3, imageCards = true }: { cards?: number; imageCards?: boolean }) {
  return (
    <main className="section pt-10 sm:pt-16" aria-busy="true" aria-label="Loading">
      <div className="container-page">
        <div className="max-w-2xl space-y-4">
          <div className="skeleton h-3 w-28" />
          <div className="skeleton h-12 w-4/5 sm:h-14" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-sand/60 bg-white">
              {imageCards && <div className="skeleton aspect-[4/3] rounded-none" />}
              <div className="space-y-3 p-6">
                <div className="skeleton h-5 w-2/3" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/** Loading state for pages that open with a full-bleed dark hero (home, city pages). */
export function HeroSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading">
      <section className="bg-plum-dark">
        <div className="container-page space-y-5 pb-20 pt-36 sm:pb-28 sm:pt-44">
          <div className="h-3 w-40 rounded bg-white/10" />
          <div className="h-12 w-4/5 max-w-2xl rounded-lg bg-white/10 sm:h-16" />
          <div className="h-12 w-3/5 max-w-xl rounded-lg bg-white/10 sm:h-16" />
          <div className="h-4 w-full max-w-lg rounded bg-white/[0.07]" />
          <div className="flex gap-3 pt-4">
            <div className="h-12 w-40 rounded-full bg-gold/30" />
            <div className="h-12 w-40 rounded-full bg-white/10" />
          </div>
        </div>
      </section>
      <div className="container-page grid gap-6 py-16 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-64 rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
