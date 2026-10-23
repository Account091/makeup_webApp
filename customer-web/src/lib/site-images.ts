/**
 * ALL public-website photography lives here.
 *
 * These are PLACEHOLDER photos from Unsplash (free licence) so the site looks
 * finished before the studio's own portfolio is ready. To use your own photos,
 * replace the URLs below — e.g. upload to Firebase Storage and paste the
 * download URL (firebasestorage.googleapis.com is already allowed in
 * next.config.js), or drop files into /public and use "/images/your-file.jpg".
 * Keep portrait-orientation photos for the hero, services and gallery.
 *
 * A service document in Firestore can also set `imageUrl`; that always wins
 * over the fallback picked here.
 */

const u = (id: string, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`;

export const SITE_IMAGES = {
  /** Home hero (portrait, bride close-up) */
  hero: u("1600685890506-593fdf55949b", 1400),
  /** "Meet the artist" / studio detail images */
  detailEyes: u("1487412947147-5cebf100ffc2", 900),
  detailPalette: u("1596704017254-9b121068fb31", 900),
  detailJewellery: u("1601121141461-9d6647bca1ed", 900),
  mehendi: u("1597157639073-69284dc0fdaf", 900),

  /** Service-card images, keyed by category (lower-case) */
  services: {
    bridal: u("1610173827043-9db50e0d8ef9", 900),
    engagement: u("1597983073493-88cd35cf93b0", 900),
    party: u("1610030469983-98e550d6193c", 900),
    destination: u("1583878545126-2f1ca0142714", 900),
    default: u("1617627143750-d86bc21e42bb", 900),
  } as Record<string, string>,

  /** City / destination pages */
  cities: {
    jodhpur: u("1599661046289-e31897846e41", 1600),
    jaipur: u("1603262110263-fb0112e7cc33", 1600),
    udaipur: u("1615836245337-f5b9b2303f10", 1600),
    destination: u("1630526720753-aa4e71acf67d", 1600),
  },
} as const;

export interface GalleryPhoto {
  src: string;
  /** Larger version for the lightbox */
  full: string;
  title: string;
  category: "Bridal" | "Engagement" | "Party" | "Destination" | "Details";
  desc: string;
  /** natural aspect ratio (w/h) so the masonry grid doesn't jump while loading */
  ratio: number;
}

const g = (id: string, ratio: number, rest: Omit<GalleryPhoto, "src" | "full" | "ratio">): GalleryPhoto => ({
  src: u(id, 700),
  full: u(id, 1600),
  ratio,
  ...rest,
});

export const GALLERY: GalleryPhoto[] = [
  g("1600685890506-593fdf55949b", 2 / 3, { title: "Rajasthani bridal look", category: "Bridal", desc: "Long-wear base, soft smoky eyes and a classic red lip with traditional jewellery." }),
  g("1597983073493-88cd35cf93b0", 2 / 3, { title: "Mehendi-day glow", category: "Engagement", desc: "Fresh, dewy skin and soft definition for a daytime function." }),
  g("1630526720753-aa4e71acf67d", 2 / 3, { title: "Lakeside wedding portrait", category: "Destination", desc: "A look built to last through a full day of outdoor functions." }),
  g("1601121141461-9d6647bca1ed", 1.44, { title: "Heirloom jewellery", category: "Details", desc: "Setting jewellery and dupatta so they stay put all night." }),
  g("1610173827043-9db50e0d8ef9", 2 / 3, { title: "Classic red bridal", category: "Bridal", desc: "HD finish with a rich, photo-ready glow." }),
  g("1610030469983-98e550d6193c", 2 / 3, { title: "Festive saree glam", category: "Party", desc: "Photo-ready glam for sangeet, reception and family functions." }),
  g("1597157639073-69284dc0fdaf", 1.5, { title: "Mehendi ceremony", category: "Details", desc: "Little moments from the days before the wedding." }),
  g("1617627143750-d86bc21e42bb", 2 / 3, { title: "Silk saree & gold", category: "Bridal", desc: "Soft gold eyes and a luminous base to match heirloom jewellery." }),
  g("1583878545126-2f1ca0142714", 1.5, { title: "Poolside pheras", category: "Destination", desc: "Sweat-proof base for warm, outdoor ceremonies." }),
  g("1583391733956-3750e0ff4e8b", 0.8, { title: "Ivory lehenga look", category: "Engagement", desc: "Soft glam and an easy, romantic hairstyle." }),
  g("1487412947147-5cebf100ffc2", 1.5, { title: "Eye detail", category: "Details", desc: "Lashes and liner tailored to your eye shape." }),
];

/** Picks the photo for a service card: Firestore `imageUrl` first, then by category / id keywords. */
export function serviceImage(s: { id: string; category?: string | null; title?: string; imageUrl?: string | null }): string {
  if (s.imageUrl) return s.imageUrl;
  const hay = `${s.category || ""} ${s.id} ${s.title || ""}`.toLowerCase();
  for (const key of ["destination", "engagement", "party", "bridal"]) {
    if (hay.includes(key)) return SITE_IMAGES.services[key];
  }
  return SITE_IMAGES.services.default;
}
