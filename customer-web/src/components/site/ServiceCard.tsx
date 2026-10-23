import Link from "next/link";
import React from "react";
import { ArrowUpRight, Clock } from "lucide-react";
import { formatINR, type PublicService } from "../../lib/booking/types";
import { serviceImage } from "../../lib/site-images";
import FadeImg from "./FadeImg";

export function durationLabel(mins: number | null): string | null {
  if (!mins) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export default function ServiceCard({ service, delay = 0 }: { service: PublicService; delay?: number }) {
  const dur = durationLabel(service.durationMinutes);
  const href = service.price ? `/book?service=${encodeURIComponent(service.id)}` : "/contact";
  return (
    <article
      data-reveal
      data-reveal-delay={delay || undefined}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sand/80 bg-white shadow-soft transition duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-blush">
        <FadeImg
          src={serviceImage(service)}
          alt=""
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
          className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-plum-dark/50 via-transparent to-transparent" />
        {service.category && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-plum backdrop-blur">
            {service.category}
          </span>
        )}
        {dur && (
          <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 text-xs font-medium text-white">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Approx. {dur}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl font-semibold leading-snug text-plum">{service.title}</h3>
        {service.description && <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{service.description}</p>}
        <div className="mt-6 flex items-end justify-between gap-3 border-t border-sand/70 pt-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{service.price ? "Starting at" : "Pricing"}</p>
            <p className="mt-0.5 text-xl font-bold tracking-tight text-plum">
              {service.price ? formatINR(service.price) : "On request"}
            </p>
          </div>
          <Link
            href={href}
            className="btn-dark px-5 after:absolute after:inset-0 after:content-['']"
            aria-label={`${service.price ? "Book" : "Enquire about"} ${service.title}`}
          >
            {service.price ? "Book" : "Enquire"}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
