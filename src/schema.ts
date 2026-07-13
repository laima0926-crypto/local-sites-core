// Unified content schema for every createmywebsite.co.uk template and client site.
// One shape so the shared components in local-sites-core can render any business type.
//
// RULE: only include claims the customer actually attested to in the intake form.
// Never fabricate insurance amounts, review counts, certifications, or FAQ answers.
// Omit a field rather than invent it — components hide sections that have no data.

export type BusinessType = 'cleaning' | 'gardener' | 'pet' | 'restaurant' | 'repair' | 'trades';

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

  // Booking (Phase 2 — on-site "request a slot" form; emails the owner, no payment, no availability engine)
  booking?: {
    enabled: boolean; // when true: shows /book page, Book nav item, and points the header CTA at it
    intro?: string; // optional custom intro line; a sensible per-business-type default is used when unset
  };

  // Restaurant
  cuisine?: string; // e.g. "Italian", "Modern British"
  reservationUrl?: string; // external booking link; falls back to /contact when unset
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
