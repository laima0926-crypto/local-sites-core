// Unified content schema for every createmywebsite.co.uk template and client site.
// One shape so the shared components in local-sites-core can render any business type.
//
// RULE: only include claims the customer actually attested to in the intake form.
// Never fabricate insurance amounts, review counts, certifications, or FAQ answers.
// Omit a field rather than invent it — components hide sections that have no data.

export type BusinessType =
  | 'cleaning'
  | 'gardener'
  | 'pet'
  | 'restaurant'
  | 'repair'
  | 'trades'
  // Showcase-only: photography / art studios. Not offered through the intake
  // form yet, so no generator mapping exists for it.
  | 'creative'
  // Any local business that is none of the six named trades. Offered through
  // the intake form as "Something else (my business isn't listed)" and built
  // from template-flexible.
  | 'flexible'
  // Car garages, servicing, MOT and custom shops. Offered through the intake
  // form as "Car garage, servicing or custom shop" and built from
  // template-automotive. The only template whose hero is a looping video
  // rather than a photo, though it renders correctly without one.
  | 'automotive';

export interface Service {
  slug?: string;
  name: string;
  shortDescription: string;
  price: string; // e.g. "from £18 per hour", "from £120", "Get a quote"
  icon?: string;
  whoFor?: string;
  included?: string[];
  seasonal?: boolean;
  image?: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  category?: string;
  caption?: string;
}

export interface BeforeAfter {
  title: string;
  before: string;
  after: string;
  alt: string;
}

export interface Testimonial {
  quote: string;
  name: string; // first name + last initial, e.g. "Sarah M."
  location?: string;
  service?: string;
}

export interface Faq {
  question: string;
  answer: string; // always the customer's own words — never invented
}

export interface MenuItem {
  name: string;
  description?: string;
  price: string;
  tags?: string[]; // dietary, e.g. "V" (veg), "VG" (vegan), "GF" (gluten-free)
  allergens?: string; // free text, e.g. "Contains nuts, dairy"
}

export interface MenuSection {
  name: string; // e.g. "Starters", "Pizza", "Desserts"
  description?: string;
  items: MenuItem[];
}

export interface DeliveryLink {
  name: string; // e.g. "Just Eat", "Uber Eats", "Deliveroo"
  url: string;
}

export interface SiteConfig {
  businessType: BusinessType;
  url?: string; // canonical site origin, e.g. "https://acme.co.uk" (for <link rel=canonical>/og:url)
  theme?: {
    // Brand colour scale as space-separated RGB channels ("124 58 237"), keyed
    // 50–900. Injected as CSS vars by BaseLayout; Tailwind reads them via
    // rgb(var(--brand-600) / <alpha-value>). Omit to use the template default.
    brand?: Record<string, string>;
    // Optional Google Fonts stylesheet URL, loaded instead of the default
    // Inter/Plus Jakarta. The template's tailwind config sets the matching
    // font-family names for font-sans / font-display.
    fontsHref?: string;
    // Per-template visual skin name, added to <body> as `skin-<style>` so core
    // CSS can apply tailored treatments. Omit for the default look.
    style?: string;
  };
  business: {
    name: string;
    legalName?: string;
    tagline: string;
    shortDescription: string; // hero / meta description
    longDescription: string; // about page
    yearEstablished?: number;
    logo?: string; // logo image path/URL; shown in the header instead of styled text when set
    isDemo: boolean;
    heroHeadline?: string; // big H1 on the homepage hero
    heroHeadlineAccent?: string; // second line, shown in the brand colour
    heroImage?: string; // hero photo URL
    heroImageAlt?: string;
    // Looping background video for the hero, as a path to an MP4 in the site's
    // own public/ folder. Optional everywhere: templates that don't use video
    // ignore it, and a template that does must still render correctly without
    // it. Always pair it with heroVideoPoster — the poster is what shows while
    // the video loads, when autoplay is blocked (iOS Low Power Mode), and when
    // the visitor has asked for reduced motion.
    heroVideo?: string;
    heroVideoPoster?: string;
  };
  contact: {
    phone: string; // E.164 for tel: links
    phoneDisplay: string; // human-readable
    whatsapp?: string;
    email?: string; // public business email — optional; omitted from the site when not provided
    // What to PRINT. Free-form, however the business writes it.
    addressLines: string[];
    // The same address BROKEN UP, for anything that needs to know which part is
    // which. Search engines are the reason it exists.
    //
    // The LocalBusiness markup used to work the town out by taking the first
    // line and cutting at the first comma. For "Lichfield, Staffordshire" that
    // happens to be right. For "28 Bore Street, Lichfield, WS13 6LL" it told
    // Google the town was "28 Bore Street", and no amount of comma-counting
    // fixes that, because the lines are written differently on every site.
    //
    // The intake form already collects these as separate fields; they were
    // being glued into a string and the pieces thrown away. Now they survive.
    //
    // A LIST because a business can trade from more than one place. The first
    // entry is the main one: it is what the footer and the search markup use.
    // Optional throughout: a site without it falls back to reading addressLines,
    // which is what every site built before this does.
    locations?: {
      line1?: string;
      line2?: string;
      town?: string;
      county?: string;
      postcode?: string;
    }[];
    serviceAreas: string[];
    nationwide?: boolean; // covers all of the UK
    travelRadius?: string; // miles they travel for mobile work, e.g. "10". Only when they actually do mobile.
    googleMapsAreaQuery?: string;
  };
  hours: { day: string; hours: string }[];
  attestations: {
    insured?: 'public_liability' | 'professional_indemnity' | 'both';
    dbsChecked?: boolean;
    ecoProducts?: boolean;
    satisfactionGuarantee?: boolean;
  };
  certifications: string[];
  socials: {
    facebook?: string;
    instagram?: string;
    googleBusinessProfile?: string;
    checkatrade?: string;
  };
  whyChooseUs: string[];
  services: Service[];
  /**
   * The customer's own price list, as a file they uploaded, shown directly on
   * the services section.
   *
   * WHY THIS EXISTS. The intake form tells them "no need to type it all out
   * here, upload your existing price list and we'll copy your services and
   * prices from it". Transcribing it into `services` is the better answer and
   * still the goal: it is readable, searchable and editable. But until somebody
   * has done that by hand, the site showed NOTHING about prices at all, while
   * the customer had already sent them. A page with no prices is worse than a
   * page with a photograph of the real ones. Found on GYM00001-L, 2026-08-06.
   *
   * `services` takes precedence: once the prices are transcribed, the file
   * stops showing. So this is a floor, not a destination.
   *
   * Word and Excel files are deliberately not renderable here — a browser
   * cannot display them. Those still have to be transcribed.
   */
  priceListFile?: {
    url: string; // e.g. "/price-list/price-list.png"
    type: 'image' | 'pdf';
    label?: string; // optional caption / button label
  };
  gallery: GalleryImage[];
  beforeAfter: BeforeAfter[];
  testimonials: Testimonial[];
  faq: Faq[];

  // Optional / business-type-specific
  petAnimals?: string[]; // pet — animals the groomer accepts, e.g. ["Dogs (small)", "Cats", "Rats"]
  seasonalNote?: string; // gardener
  repair?: {
    turnaround?: string;
    warranty?: string;
    diagnosticFee?: string;
    serviceModel?: string[]; // how customers get a repair done, e.g. ["Walk-in", "Postal"]
    visitAddress?: string; // where customers walk in / drop off / post items to
  };

  // Trades
  emergencyCallout?: string; // e.g. "24/7 emergency call-out across Lichfield"

  // The customer's existing booking system, embedded on /book. PAID ADD-ON — the free tier
  // is `reservationUrl` alone. Requires `reservationUrl`, which is the visible fallback link
  // when the embed is blocked or fails. Consumed by PrivacyPolicy (cookie wording) and, from
  // Phase C, by BookingEmbed.
  //
  // DO NOT SET THIS UNTIL PHASE C SHIPS. Setting it makes the privacy policy point visitors
  // at /book, and that page does not exist yet — it would be a dead link on a live site.
  booking?: {
    provider: string; // shown to the visitor and named in the privacy policy, e.g. "Treatwell"
    src: string; // the embed address; checked against an allowlist at build time
    height?: number; // px, default 700
    intro?: string; // optional line above the booking card
  };

  // Restaurant
  cuisine?: string; // e.g. "Italian", "Modern British"
  // The customer's OWN booking system (Treatwell, Booksy, Fresha, Calendly…). Used by every
  // business type, not just restaurants: adds a "Book" nav item, a hero button, a contact-page
  // card and a footer link, and feeds `acceptsReservations` in the structured data. We never
  // run the booking — it stays in the customer's account. Unset means none of that renders.
  reservationUrl?: string;
  menuNote?: string; // shown above the menu, e.g. allergen / dietary note
  menu?: MenuSection[];
  // The customer's own menu file, shown directly when there are no structured
  // `menu` sections (image inline; PDF as a viewer + download). Structured `menu`
  // takes precedence when present — it's the accessible/SEO/editable upgrade.
  menuFile?: {
    url: string; // e.g. "/menu/menu.pdf" or "/menu/menu.jpg"
    type: 'image' | 'pdf';
    label?: string; // optional caption / button label
  };
  delivery?: DeliveryLink[];
}

/**
 * Where the site's "Book" links should point, and whether that is off-site.
 *
 * One rule in one place, because four things ask the same question: the header nav,
 * every template's hero, the footer and the contact card. Paid sites keep the visitor
 * on the site (/book carries the embed); free sites hand them to the booking company.
 *
 * Returns null when the customer has no booking system at all, which is the signal to
 * render nothing rather than an empty link.
 */
export function bookingLink(site: SiteConfig): { href: string; external: boolean } | null {
  if (site.booking) return { href: '/book', external: false };
  if (site.reservationUrl) return { href: site.reservationUrl, external: true };
  return null;
}
