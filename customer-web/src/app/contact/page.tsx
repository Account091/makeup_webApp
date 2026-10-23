import Link from "next/link";
import React from "react";
import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import EnquiryForm from "../../components/site/EnquiryForm";
import PageHeader from "../../components/site/PageHeader";
import { WhatsAppIcon } from "../../components/site/WhatsAppFab";
import { getPublicConfig } from "../../lib/booking/server";
import { whatsappLink } from "../../lib/booking/types";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Makeovers by Prachi on WhatsApp or phone for bridal and party makeup in Jodhpur, Jaipur and Udaipur.",
};

function ContactCard({
  href,
  external,
  icon,
  iconClass,
  title,
  detail,
  delay,
}: {
  href?: string | null;
  external?: boolean;
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  detail: React.ReactNode;
  delay: number;
}) {
  const inner = (
    <>
      <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClass}`} aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-plum">{title}</span>
        <span className="mt-0.5 block break-words text-sm text-muted">{detail}</span>
      </span>
      {href && (
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-dark"
          aria-hidden="true"
        />
      )}
    </>
  );
  const cls = "group card flex items-center gap-4 p-5";
  return href ? (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${cls} card-hover`}
      data-reveal
      data-reveal-delay={delay}
    >
      {inner}
    </a>
  ) : (
    <div className={cls} data-reveal data-reveal-delay={delay}>
      {inner}
    </div>
  );
}

export default async function ContactPage() {
  const { settings } = await getPublicConfig();
  const wa = whatsappLink(settings.whatsappNumber, "Hi Prachi, I have a question about makeup for my event.");
  const tel = settings.phoneDisplay ? settings.phoneDisplay.replace(/[^0-9+]/g, "") : "";
  const address = settings.studioAddress || "Jodhpur, Rajasthan";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.studioAddress || "Jodhpur, Rajasthan")}`;

  return (
    <main className="section pt-10 sm:pt-16">
      <div className="container-page">
        <PageHeader
          eyebrow="Contact"
          title="Let's plan your look"
          intro="WhatsApp is the quickest way to reach us. Send your event date, city and outfit photos and we'll help you choose the right package."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {wa && (
                <ContactCard
                  href={wa}
                  external
                  icon={<WhatsAppIcon className="h-6 w-6" />}
                  iconClass="bg-[#25D366] text-white"
                  title="WhatsApp"
                  detail="Chat with the studio — fastest reply"
                  delay={0}
                />
              )}
              {tel && (
                <ContactCard
                  href={`tel:${tel}`}
                  icon={<Phone className="h-5 w-5" />}
                  iconClass="bg-plum text-gold-light"
                  title="Call"
                  detail={settings.phoneDisplay}
                  delay={60}
                />
              )}
              {settings.email && (
                <ContactCard
                  href={`mailto:${settings.email}`}
                  icon={<Mail className="h-5 w-5" />}
                  iconClass="bg-blush text-gold-dark"
                  title="Email"
                  detail={settings.email}
                  delay={120}
                />
              )}
              <ContactCard
                href={mapsUrl}
                external
                icon={<MapPin className="h-5 w-5" />}
                iconClass="bg-gold-pale text-plum"
                title="Studio"
                detail={address}
                delay={180}
              />
            </div>

            <p className="pt-2 text-sm text-muted">
              Already booked?{" "}
              <Link href="/track" className="link-gold">
                Track your booking
              </Link>
            </p>
          </div>

          <div className="card p-6 sm:p-8" data-reveal data-reveal-delay="100">
            <h2 className="font-serif text-2xl font-semibold">Send an enquiry</h2>
            <p className="mt-1 text-sm text-muted">
              This opens WhatsApp with your details filled in, so you can review and send the message yourself.
            </p>
            <EnquiryForm whatsappNumber={settings.whatsappNumber} />
          </div>
        </div>
      </div>
    </main>
  );
}
