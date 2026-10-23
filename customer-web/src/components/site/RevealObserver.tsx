"use client";

import { useEffect } from "react";

/**
 * One shared IntersectionObserver for every `[data-reveal]` element on the
 * page (server components just add the attribute). Content is only hidden
 * after this script runs (html.reveal-ready), so no-JS and crawlers see
 * everything. Respects prefers-reduced-motion via CSS.
 * Optional `data-reveal-delay="120"` staggers siblings.
 */
export default function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    if (!("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-revealed");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const d = el.dataset.revealDelay;
        if (d) el.style.setProperty("--reveal-delay", `${d}ms`);
        io.observe(el);
      });
    };

    scan();
    root.classList.add("reveal-ready");

    // Pick up elements rendered after client-side navigation.
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
