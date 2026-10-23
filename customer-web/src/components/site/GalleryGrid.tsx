"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, Loader2, X } from "lucide-react";
import type { GalleryPhoto } from "../../lib/site-images";
import FadeImg from "./FadeImg";

export default function GalleryGrid({ items }: { items: GalleryPhoto[] }) {
  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const [active, setActive] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const shown = active === "All" ? items : items.filter((i) => i.category === active);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    window.setTimeout(() => lastTrigger.current?.focus(), 0);
  }, []);

  return (
    <>
      <div className="no-scrollbar -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter gallery">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={active === c}
            onClick={() => setActive(c)}
            className={`chip shrink-0 ${active === c ? "chip-active" : ""}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div key={active} className="mt-8 animate-fade-in columns-2 gap-3 sm:gap-5 lg:columns-3">
        {shown.map((item, i) => (
          <figure key={item.src} className="mb-3 break-inside-avoid sm:mb-5">
            <button
              type="button"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setOpen(i);
              }}
              className="group relative block w-full overflow-hidden rounded-2xl bg-blush text-left shadow-soft"
              aria-label={`Open photo: ${item.title}`}
            >
              <div style={{ aspectRatio: String(item.ratio) }}>
                <FadeImg
                  src={item.src}
                  alt={item.title}
                  sizes="(min-width: 1024px) 360px, 50vw"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/75 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
              <figcaption className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-light sm:block">{item.category}</span>
                <span className="mt-0.5 block font-serif text-sm font-semibold leading-snug sm:text-lg">{item.title}</span>
              </figcaption>
              <span className="absolute right-3 top-3 hidden h-9 w-9 items-center justify-center rounded-full bg-white/85 text-plum opacity-0 transition duration-300 group-hover:opacity-100 sm:inline-flex">
                <Expand className="h-4 w-4" aria-hidden="true" />
              </span>
            </button>
          </figure>
        ))}
      </div>

      {open !== null && shown[open] && (
        <Lightbox items={shown} index={open} onIndex={setOpen} onClose={close} />
      )}
    </>
  );
}

function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: GalleryPhoto[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const dialogRef = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [dx, setDx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const go = useCallback(
    (delta: number) => {
      setDir(delta > 0 ? 1 : -1);
      onIndex((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndex]
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Tab" && dialogRef.current) {
        const f = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button"));
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  // Preload neighbours so swiping feels instant
  useEffect(() => {
    [1, -1].forEach((d) => {
      const n = items[(index + d + items.length) % items.length];
      const img = new Image();
      img.src = n.full;
    });
  }, [index, items]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} — photo ${index + 1} of ${items.length}`}
      className="fixed inset-0 z-[80] flex animate-fade-in flex-col bg-plum-dark/[0.97]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6" style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))" }}>
        <p className="text-sm tabular-nums text-white/70">
          {index + 1} / {items.length}
        </p>
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          aria-label="Close"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-2 sm:px-20"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={(e) => {
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchMove={(e) => {
          if (!touch.current) return;
          const ddx = e.touches[0].clientX - touch.current.x;
          const ddy = e.touches[0].clientY - touch.current.y;
          if (Math.abs(ddx) > Math.abs(ddy)) setDx(ddx);
        }}
        onTouchEnd={() => {
          if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
          setDx(0);
          touch.current = null;
        }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/30" />
        </div>
        <figure
          key={item.full}
          className={`relative max-h-full ${dir > 0 ? "animate-step-in-right" : "animate-step-in-left"}`}
        >
          <div
            className="flex max-h-full flex-col items-center transition-transform duration-200 ease-out-expo"
            style={dx ? { transform: `translateX(${dx}px)`, transitionDuration: "0ms" } : undefined}
          >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.full}
            alt={item.title}
            className="max-h-[calc(100dvh-11rem)] w-auto max-w-full select-none rounded-xl object-contain shadow-float"
            draggable={false}
          />
          <figcaption className="mt-4 max-w-xl px-4 text-center text-white">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-light">{item.category}</span>
            <span className="mt-1 block font-serif text-xl">{item.title}</span>
            <span className="mt-1 block text-sm text-white/70">{item.desc}</span>
          </figcaption>
          </div>
        </figure>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95 sm:inline-flex"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95 sm:inline-flex"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <p className="pb-4 text-center text-xs text-white/50 sm:hidden" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
        Swipe to see more
      </p>
    </div>
  );
}
