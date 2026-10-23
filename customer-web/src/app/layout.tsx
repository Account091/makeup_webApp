import React from "react";
import type { Metadata, Viewport } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/site/Footer";
import RevealObserver from "../components/site/RevealObserver";
import WhatsAppFab from "../components/site/WhatsAppFab";
import { getPublicConfig } from "../lib/booking/server";
import { whatsappLink } from "../lib/booking/types";
import "./globals.css";

// Every page reads live studio settings (WhatsApp, prices) from Firestore.
export const dynamic = "force-dynamic";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const body = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://makeoversbyprachi.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Makeovers by Prachi | Bridal Makeup Artist in Jodhpur",
    template: "%s | Makeovers by Prachi",
  },
  description:
    "Bridal, engagement and party makeup by Prachi in Jodhpur, Rajasthan. Travelling to Jaipur, Udaipur and destination weddings. Check your date and book online.",
  openGraph: {
    siteName: "Makeovers by Prachi",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A0B13",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getPublicConfig();
  const wa = whatsappLink(settings.whatsappNumber, "Hi Prachi, I'd like to enquire about makeup for my event.");
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col bg-champagne font-sans text-plum antialiased">
        <noscript>
          <style>{".img-fade{opacity:1}"}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only z-[70] rounded-full bg-plum px-4 py-2 text-sm text-gold-light focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Header whatsappHref={wa} />
        <div id="main" className="flex-1">
          {children}
        </div>
        <Footer settings={settings} />
        <WhatsAppFab whatsappNumber={settings.whatsappNumber} />
        <RevealObserver />
      </body>
    </html>
  );
}
