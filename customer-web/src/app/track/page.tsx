import React, { Suspense } from "react";
import type { Metadata } from "next";
import PageHeader from "../../components/site/PageHeader";
import TrackBooking from "../../components/booking/TrackBooking";
import { getPublicConfig } from "../../lib/booking/server";

export const metadata: Metadata = {
  title: "Track your booking",
  description: "Check the status of your Makeovers by Prachi booking with your booking ID and phone number.",
};

export default async function TrackPage() {
  const { settings } = await getPublicConfig();
  return (
    <main className="section pt-10 sm:pt-16">
      <div className="container-page max-w-4xl">
        <PageHeader
          eyebrow="Track booking"
          title="Where's my booking?"
          intro="Enter the booking ID (e.g. MBP-7K2QXD) and the mobile number you booked with."
        />
        <div className="mt-10">
          <Suspense fallback={<div className="skeleton h-40 rounded-2xl" />}>
            <TrackBooking whatsappNumber={settings.whatsappNumber} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
