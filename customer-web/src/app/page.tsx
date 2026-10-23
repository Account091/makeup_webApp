import Link from "next/link";
import React from "react";
import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import AvailabilityChecker from "../components/site/AvailabilityChecker";
import FadeImg from "../components/site/FadeImg";
import ServiceCard from "../components/site/ServiceCard";
import { getPublicConfig } from "../lib/booking/server";
import { whatsappLink } from "../lib/booking/types";
import { SITE_IMAGES } from "../lib/site-images";

const TRUST = [
  { icon: Sparkles, title: "HD & airbrush", text: "Long-wear, camera-ready finishes" },
  { icon: MapPin, title: "Travel across Rajasthan", text: "Jodhpur, Jaipur, Udaipur & beyond" },
  { icon: ShieldCheck, title: "Secure UPI deposit", text: "Pay any UPI app, verified by us" },
  { icon: BadgeCheck, title: "Instant booking ID", text: "Track your booking any time" },
];

const STEPS = [
  { title: "Pick your service & date", text: "Choose a package and see which dates are free. We take one bride per day." },
  { title: "Pay a small deposit by UPI", text: "Scan the QR or open your UPI app, then upload the screenshot and UTR." },
  { title: "Get confirmed", text: "We verify the payment and confirm your booking. Track it online any time." },
];

const APPROACH = [
  { title: "A consultation first", text: "We talk through your outfit, jewellery, skin and the look you have in mind." },
  { title: "Skin prep that lasts", text: "Long-wear HD or airbrush bases built for heat, tears and long ceremonies." },
  { title: "Hair & draping included", text: "Bridal packages include hair styling and poshak, dupatta or saree draping." },
];

const CITIES = [
  { href: "/jodhpur", name: "Jodhpur", note: "Our home studio", img: SITE_IMAGES.cities.jodhpur },
  { href: "/jaipur", name: "Jaipur", note: "Weddings & events", img: SITE_IMAGES.cities.jaipur },
  { href: "/udaipur", name: "Udaipur", note: "Lake-side & palace weddings", img: SITE_IMAGES.cities.udaipur },
  { href: "/destination-weddings", name: "Destination", note: "Anywhere you celebrate", img: SITE_IMAGES.cities.destination },
];

export default async function HomePage() {
  const { services, settings } = await getPublicConfig();
  const featured = services.slice(0, 3);
  const wa = whatsappLink(settings.whatsappNumber, "Hi Prachi, I'd like to know more about bridal makeup.");

  return (
    <main>
      {/* ---------------- Hero ---------------- */}
      <section className="relative isolate overflow-hidden bg-plum-dark text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_15%_20%,rgba(212,175,55,0.14),transparent_60%),radial-gradient(60%_60%_at_90%_90%,rgba(91,51,71,0.6),transparent_70%)]"
        />

        {/* Mobile: photo first, softly fading into the plum ground */}
        <div className="relative h-[62vh] max-h-[560px] min-h-[420px] lg:hidden">
          <FadeImg
            src={SITE_IMAGES.hero}
            alt="A bride in traditional jewellery with soft smoky eye makeup"
            loading="eager"
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover object-[50%_25%]"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-plum-dark/60 via-transparent to-plum-dark" />
        </div>

        <div className="container-page grid gap-10 pb-16 lg:min-h-[760px] lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-32">
          <div className="-mt-28 relative lg:mt-0">
            <p className="eyebrow eyebrow-line animate-fade-up text-gold-light">Bridal makeup · Jodhpur<span className="hidden sm:inline">, Rajasthan</span></p>
            <h1
              className="mt-5 animate-fade-up font-serif text-[2.6rem] font-medium leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.4rem]"
              style={{ animationDelay: "60ms" }}
            >
              Bridal makeup that feels like <em className="font-medium text-gold-light">you</em>, on your biggest day.
            </h1>
            <p
              className="mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-white/75 sm:text-lg"
              style={{ animationDelay: "120ms" }}
            >
              Traditional Rajasthani bridal looks, HD and airbrush finishes, hair and poshak draping — by Prachi and her
              team, in Jodhpur and across Rajasthan.
            </p>
            <div className="mt-8 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "180ms" }}>
              <Link href="/book" className="btn-primary px-7 py-3.5 text-[15px]">
                Book your date <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/services" className="btn-light px-7 py-3.5 text-[15px]">
                Services &amp; prices
              </Link>
            </div>
            <div className="mt-10 animate-fade-up lg:hidden" style={{ animationDelay: "240ms" }}>
              <AvailabilityChecker />
            </div>
          </div>

          {/* Desktop: arched portrait with the date checker floating over it */}
          <div className="relative hidden lg:block">
            <div className="relative ml-auto aspect-[4/5] w-full max-w-[480px] animate-scale-in overflow-hidden rounded-t-[999px] rounded-b-[2rem] ring-1 ring-gold/30">
              <FadeImg
                src={SITE_IMAGES.hero}
                alt="A bride in traditional jewellery with soft smoky eye makeup"
                loading="eager"
                sizes="480px"
                className="h-full w-full object-cover object-[50%_30%]"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-plum-dark/40 via-transparent to-transparent" />
            </div>
            <div aria-hidden="true" className="absolute -right-4 -top-4 h-28 w-28 rounded-full border border-gold/30" />
            <div className="absolute -bottom-10 -left-10 w-[380px] animate-fade-up" style={{ animationDelay: "260ms" }}>
              <AvailabilityChecker />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Trust strip ---------------- */}
      <section aria-label="Why book with us" className="border-b border-sand/70 bg-ivory">
        <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-6 py-8 sm:py-10 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, text }, i) => (
            <li key={title} data-reveal data-reveal-delay={i * 60} className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold-dark">
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-plum">{title}</span>
                <span className="mt-0.5 block text-xs leading-snug text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- Services ---------------- */}
      <section className="section">
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" data-reveal>
            <div>
              <p className="eyebrow eyebrow-line">Services</p>
              <h2 className="h-display mt-3 text-4xl sm:text-5xl">Looks for every celebration</h2>
            </div>
            <Link href="/services" className="link-gold text-sm">
              All services &amp; prices <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((s, i) => (
                <ServiceCard key={s.id} service={s} delay={i * 80} />
              ))}
            </div>
          ) : (
            <p className="alert-info mt-10">
              Prices on request. Our service list is being updated, so please{" "}
              <Link href="/contact" className="font-semibold underline">
                contact us
              </Link>{" "}
              for a quote.
            </p>
          )}
        </div>
      </section>

      {/* ---------------- Approach (editorial) ---------------- */}
      <section className="section bg-blush/50">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative mx-auto w-full max-w-md lg:max-w-none" data-reveal>
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3 overflow-hidden rounded-[1.75rem] shadow-lift">
                <FadeImg src={SITE_IMAGES.services.bridal} alt="Bridal look with red dupatta and gold jewellery" sizes="(min-width:1024px) 320px, 60vw" className="aspect-[3/4] h-full w-full object-cover" />
              </div>
              <div className="col-span-2 flex flex-col gap-4 pt-10">
                <div className="overflow-hidden rounded-[1.5rem] shadow-soft">
                  <FadeImg src={SITE_IMAGES.detailJewellery} alt="Close-up of traditional gold jewellery" sizes="200px" className="aspect-square w-full object-cover" />
                </div>
                <div className="overflow-hidden rounded-[1.5rem] shadow-soft">
                  <FadeImg src={SITE_IMAGES.detailPalette} alt="Eyeshadow palette and brush" sizes="200px" className="aspect-[4/5] w-full object-cover" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="eyebrow eyebrow-line" data-reveal>
              Our approach
            </p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl" data-reveal>
              Made for long days, <em className="font-medium text-gold-dark">bright lights</em> and every photo.
            </h2>
            <p className="lead mt-5" data-reveal>
              Every bride is different. We plan your look around your outfit, skin and the rituals of your day, so it
              still looks fresh at the last pheras.
            </p>
            <ul className="mt-8 space-y-5">
              {APPROACH.map((a, i) => (
                <li key={a.title} className="flex gap-4" data-reveal data-reveal-delay={i * 80}>
                  <span className="mt-1 font-serif text-lg italic text-gold-dark">0{i + 1}</span>
                  <span>
                    <span className="block font-semibold text-plum">{a.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">{a.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/gallery" className="link-gold mt-8 text-sm" data-reveal>
              See the gallery <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- How booking works ---------------- */}
      <section className="section">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center" data-reveal>
            <p className="eyebrow">How booking works</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl">Secure your date in minutes</h2>
          </div>
          <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-8 md:before:absolute md:before:left-[16%] md:before:right-[16%] md:before:top-7 md:before:h-px md:before:bg-gradient-to-r md:before:from-transparent md:before:via-gold/50 md:before:to-transparent md:before:content-['']">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative text-center" data-reveal data-reveal-delay={i * 100}>
                <span className="relative mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-ivory font-serif text-xl font-semibold text-gold-dark shadow-soft">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-serif text-xl font-semibold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-10 max-w-xl text-center text-sm text-muted" data-reveal>
            A {settings.depositPercent}% deposit reserves your date. It&apos;s held for {settings.holdMinutes} minutes while
            you complete the UPI payment.
          </p>
          <div className="mt-8 text-center" data-reveal>
            <Link href="/book" className="btn-dark px-7">
              Start booking <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Where we work ---------------- */}
      <section className="section pt-0">
        <div className="container-page">
          <div data-reveal>
            <p className="eyebrow eyebrow-line">Where we work</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl">Based in Jodhpur, travelling across Rajasthan</h2>
          </div>
          <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {CITIES.map((c, i) => (
              <Link
                key={c.href}
                href={c.href}
                data-reveal
                data-reveal-delay={i * 70}
                className="group relative block aspect-[3/4] w-[72%] shrink-0 snap-start overflow-hidden rounded-2xl bg-plum shadow-soft sm:w-auto"
              >
                <FadeImg src={c.img} alt="" sizes="(min-width:1024px) 280px, (min-width:640px) 50vw, 72vw" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-plum-dark/85 via-plum-dark/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-serif text-2xl font-semibold">{c.name}</p>
                  <p className="mt-1 flex items-center justify-between text-sm text-white/80">
                    {c.note}
                    <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="container-page">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-plum px-6 py-14 text-center text-white sm:px-12 sm:py-20" data-reveal>
          <FadeImg src={SITE_IMAGES.mehendi} alt="" sizes="1100px" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-plum-dark/90 via-plum/80 to-plum-light/70" />
          <p className="eyebrow text-gold-light">Questions first?</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-serif text-4xl font-medium sm:text-5xl">Let&apos;s talk about your day</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/75">
            Message us about looks, trials, timings or travel and we&apos;ll get back to you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary px-7">
                Chat on WhatsApp
              </a>
            )}
            <Link href="/contact" className="btn-light px-7">
              Contact details
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
