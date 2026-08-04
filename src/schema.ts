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
    addressLines: string[];
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
