"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  /** CSS sizes hint for the responsive srcset (Unsplash URLs only) */
  sizes?: string;
};

const WIDTHS = [480, 800, 1200, 1600];

/** Builds a width-based srcset for Unsplash URLs (they resize on the fly). */
function unsplashSrcSet(src: string): string | undefined {
  if (!src.includes("images.unsplash.com")) return undefined;
  return WIDTHS.map((w) => `${src.replace(/([?&])w=\d+/, `$1w=${w}`)} ${w}w`).join(", ");
}

/** Plain <img> that fades in once decoded, with a soft placeholder tone behind it. */
export default function FadeImg({ src, alt, className = "", sizes = "100vw", loading = "lazy", ...rest }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, [src]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      srcSet={unsplashSrcSet(src)}
      sizes={sizes}
      alt={alt}
      loading={loading}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`img-fade ${loaded ? "is-loaded" : ""} ${className}`}
      {...rest}
    />
  );
}
