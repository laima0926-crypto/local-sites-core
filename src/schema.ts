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
  price: string; // e.g. "from £18 per hour", "from £120", "POA"
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
  business: {
    name: string;
    legalName?: string;
    tagline: string;
    shortDescription: string; // hero / meta description
    longDescription: string; // about page
    yearEstablished?: number;
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
    email: string;
    addressLines: string[];
    serviceAreas: string[];
    nationwide?: boolean; // covers all of the UK
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
  seasonalNote?: string; // gardener
  repair?: {
    turnaround?: string;
    warranty?: string;
    diagnosticFee?: string;
  };

  // Trades
  emergencyCallout?: string; // e.g. "24/7 emergency call-out across Lichfield"

  // Restaurant
  cuisine?: string; // e.g. "Italian", "Modern British"
  reservationUrl?: string; // external booking link; falls back to /contact when unset
  menuNote?: string; // shown above the menu, e.g. allergen / dietary note
  menu?: MenuSection[];
  delivery?: DeliveryLink[];
}
