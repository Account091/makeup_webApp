import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, MessageSquare, ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Contact Us | Makeovers by Prachi — Luxury Rajputi Bridal Studio",
  description:
    "Direct contact and concierge assistance for Makeovers by Prachi. Inquire about bridal dates, Rajasthan destination weddings, trials, and consultation.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0d090a] text-[#FAF6F0] selection:bg-[#D4AF37]/30">
      {/* Top Banner */}
      <header className="border-b border-[#D4AF37]/20 bg-[#160f11]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs tracking-widest text-[#D4AF37] uppercase hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Studio
          </Link>
          <div className="text-right">
            <span className="text-sm font-serif text-[#FAF6F0] tracking-wide">
              Makeovers by Prachi
            </span>
            <span className="block text-[10px] tracking-widest text-[#D4AF37] uppercase">
              Official Contact Concierge
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-xs text-[#D4AF37] tracking-widest uppercase mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            Official Studio Desk
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-[#FAF6F0] tracking-tight">
            Connect with Prachi's Team
          </h1>
          <p className="mt-4 text-sm md:text-base text-[#FAF6F0]/70 max-w-xl mx-auto font-light leading-relaxed">
            Whether inquiring about wedding calendar availability, poshak draping consultations, or personalized destination packages, our senior management team is at your service.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Direct Support */}
          <div className="bg-[#181113] border border-[#D4AF37]/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
            <h2 className="text-xl font-serif text-[#FAF6F0] mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#D4AF37]" /> Direct Concierge
            </h2>

            <div className="space-y-6 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#FAF6F0]">Direct Studio Line</h3>
                  <p className="text-xs text-[#FAF6F0]/60 mt-0.5">Verified Studio WhatsApp & Calls</p>
                  <p className="text-sm font-mono text-[#D4AF37] mt-1 font-semibold">
                    Available in Studio Directory
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#FAF6F0]">Bridal Inquiries & RFPs</h3>
                  <p className="text-xs text-[#FAF6F0]/60 mt-0.5">Proposals & vendor agreements</p>
                  <a
                    href="mailto:contact@makeoversbyprachi.com"
                    className="text-sm text-[#D4AF37] hover:underline mt-1 block"
                  >
                    contact@makeoversbyprachi.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#FAF6F0]">Concierge Hours</h3>
                  <p className="text-xs text-[#FAF6F0]/60 mt-0.5">
                    Monday – Sunday: 10:00 AM – 8:00 PM IST
                  </p>
                  <p className="text-[11px] text-[#D4AF37]/80 mt-1">
                    Event-day emergency artist dispatch operates 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Physical Studio & Hubs */}
          <div className="bg-[#181113] border border-[#D4AF37]/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-serif text-[#FAF6F0] mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#D4AF37]" /> Studio Locations
            </h2>

            <div className="space-y-5 text-sm">
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <h3 className="text-[#FAF6F0] font-medium flex items-center justify-between">
                  Flagship Studio — Jodhpur
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] uppercase">
                    Central Hub
                  </span>
                </h3>
                <p className="text-xs text-[#FAF6F0]/60 mt-1">
                  Sardarpura / Circuit House Road, Jodhpur, Rajasthan
                </p>
                <p className="text-[11px] text-[#FAF6F0]/40 mt-1">
                  Private bridal trials by appointment only.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <h3 className="text-[#FAF6F0] font-medium flex items-center justify-between">
                  Jaipur & Udaipur Hubs
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70 uppercase">
                    Destination Ops
                  </span>
                </h3>
                <p className="text-xs text-[#FAF6F0]/60 mt-1">
                  Palace resort on-site artistry across Jaipur, Udaipur, Jaisalmer & Kumbhalgarh.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/book"
                  className="block w-full text-center py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-[#0d090a] font-semibold text-xs tracking-wider uppercase shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 transition-all"
                >
                  Check Real-Time Date Availability
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
