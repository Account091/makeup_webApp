import React, { Suspense } from "react";
import type { Metadata } from "next";
import BookingWizard, { WizardSkeleton } from "../../components/booking/BookingWizard";

export const metadata: Metadata = {
  title: "Book your date",
  description: "Choose your service, check your date and reserve it with a UPI deposit. Makeovers by Prachi, Jodhpur.",
};

export default function BookPage() {
  return (
    <main className="pb-16 pt-8 sm:pb-24 sm:pt-12">
      <div className="container-page">
        <header className="mb-8 max-w-2xl sm:mb-10">
          <p className="eyebrow eyebrow-line">Book online</p>
          <h1 className="h-display mt-3 text-4xl sm:text-5xl">Reserve your date</h1>
          <p className="mt-3 text-muted">Four quick steps. Your date is held the moment you reach payment.</p>
        </header>
        <Suspense fallback={<WizardSkeleton />}>
          <BookingWizard />
        </Suspense>
      </div>
    </main>
  );
}
