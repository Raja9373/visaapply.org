import { getCanonicalBaseOrigin, getLangFromUrlPath } from './autoLanguage';

export interface SeoMetadataPayload {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  googlebot: string;
  bingbot: string;
  ogType: 'website' | 'article';
  ogSiteName: string;
  ogLocale: string;
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage: string;
  ogImageSecureUrl: string;
  ogImageType: string;
  ogImageWidth: string;
  ogImageHeight: string;
  ogImageAlt: string;
  twitterCard: 'summary_large_image' | 'summary';
  twitterSite: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterImageAlt: string;
}

export interface MandatorySeoTagSpec {
  id: string;
  field: keyof SeoMetadataPayload;
  selector: string;
  attribute: 'textContent' | 'content' | 'href';
  minLength?: number;
  mustMatchPrefix?: string;
  description: string;
}

/**
 * Authoritative list of mandatory SEO tags checked before rendering every route.
 */
export const MANDATORY_SEO_TAG_LIST: ReadonlyArray<MandatorySeoTagSpec> = [
  {
    id: 'title',
    field: 'title',
    selector: 'title',
    attribute: 'textContent',
    minLength: 15,
    description: 'Document <title> tag (branded, non-empty)',
  },
  {
    id: 'meta:description',
    field: 'description',
    selector: 'meta[name="description"]',
    attribute: 'content',
    minLength: 50,
    description: 'Primary <meta name="description"> tag (50+ chars)',
  },
  {
    id: 'link:canonical',
    field: 'canonical',
    selector: 'link[rel="canonical"]',
    attribute: 'href',
    mustMatchPrefix: 'https://www.visaapply.org',
    description: 'Canonical URL <link rel="canonical">',
  },
  {
    id: 'meta:robots',
    field: 'robots',
    selector: 'meta[name="robots"]',
    attribute: 'content',
    minLength: 5,
    description: 'Crawler directive <meta name="robots">',
  },
  {
    id: 'meta:googlebot',
    field: 'googlebot',
    selector: 'meta[name="googlebot"]',
    attribute: 'content',
    minLength: 5,
    description: 'Googlebot directive <meta name="googlebot">',
  },
  {
    id: 'meta:bingbot',
    field: 'bingbot',
    selector: 'meta[name="bingbot"]',
    attribute: 'content',
    minLength: 5,
    description: 'Bingbot directive <meta name="bingbot">',
  },
  {
    id: 'og:type',
    field: 'ogType',
    selector: 'meta[property="og:type"]',
    attribute: 'content',
    minLength: 4,
    description: 'OpenGraph type <meta property="og:type">',
  },
  {
    id: 'og:site_name',
    field: 'ogSiteName',
    selector: 'meta[property="og:site_name"]',
    attribute: 'content',
    minLength: 5,
    description: 'OpenGraph site name <meta property="og:site_name">',
  },
  {
    id: 'og:locale',
    field: 'ogLocale',
    selector: 'meta[property="og:locale"]',
    attribute: 'content',
    minLength: 2,
    description: 'OpenGraph locale <meta property="og:locale">',
  },
  {
    id: 'og:title',
    field: 'ogTitle',
    selector: 'meta[property="og:title"]',
    attribute: 'content',
    minLength: 15,
    description: 'OpenGraph title <meta property="og:title">',
  },
  {
    id: 'og:description',
    field: 'ogDescription',
    selector: 'meta[property="og:description"]',
    attribute: 'content',
    minLength: 50,
    description: 'OpenGraph description <meta property="og:description">',
  },
  {
    id: 'og:url',
    field: 'ogUrl',
    selector: 'meta[property="og:url"]',
    attribute: 'content',
    mustMatchPrefix: 'https://www.visaapply.org',
    description: 'OpenGraph canonical URL <meta property="og:url">',
  },
  {
    id: 'og:image',
    field: 'ogImage',
    selector: 'meta[property="og:image"]',
    attribute: 'content',
    mustMatchPrefix: 'https://www.visaapply.org/',
    description: 'OpenGraph image URL <meta property="og:image">',
  },
  {
    id: 'og:image:secure_url',
    field: 'ogImageSecureUrl',
    selector: 'meta[property="og:image:secure_url"]',
    attribute: 'content',
    mustMatchPrefix: 'https://www.visaapply.org/',
    description: 'OpenGraph secure image URL <meta property="og:image:secure_url">',
  },
  {
    id: 'og:image:type',
    field: 'ogImageType',
    selector: 'meta[property="og:image:type"]',
    attribute: 'content',
    minLength: 5,
    description: 'OpenGraph image MIME type <meta property="og:image:type">',
  },
  {
    id: 'og:image:width',
    field: 'ogImageWidth',
    selector: 'meta[property="og:image:width"]',
    attribute: 'content',
    minLength: 3,
    description: 'OpenGraph image width <meta property="og:image:width">',
  },
  {
    id: 'og:image:height',
    field: 'ogImageHeight',
    selector: 'meta[property="og:image:height"]',
    attribute: 'content',
    minLength: 3,
    description: 'OpenGraph image height <meta property="og:image:height">',
  },
  {
    id: 'og:image:alt',
    field: 'ogImageAlt',
    selector: 'meta[property="og:image:alt"]',
    attribute: 'content',
    minLength: 10,
    description: 'OpenGraph image alt text <meta property="og:image:alt">',
  },
  {
    id: 'twitter:card',
    field: 'twitterCard',
    selector: 'meta[name="twitter:card"]',
    attribute: 'content',
    minLength: 7,
    description: 'Twitter card type <meta name="twitter:card">',
  },
  {
    id: 'twitter:site',
    field: 'twitterSite',
    selector: 'meta[name="twitter:site"]',
    attribute: 'content',
    minLength: 3,
    description: 'Twitter site handle <meta name="twitter:site">',
  },
  {
    id: 'twitter:title',
    field: 'twitterTitle',
    selector: 'meta[name="twitter:title"]',
    attribute: 'content',
    minLength: 15,
    description: 'Twitter title <meta name="twitter:title">',
  },
  {
    id: 'twitter:description',
    field: 'twitterDescription',
    selector: 'meta[name="twitter:description"]',
    attribute: 'content',
    minLength: 50,
    description: 'Twitter description <meta name="twitter:description">',
  },
  {
    id: 'twitter:image',
    field: 'twitterImage',
    selector: 'meta[name="twitter:image"]',
    attribute: 'content',
    mustMatchPrefix: 'https://www.visaapply.org/',
    description: 'Twitter card image <meta name="twitter:image">',
  },
  {
    id: 'twitter:image:alt',
    field: 'twitterImageAlt',
    selector: 'meta[name="twitter:image:alt"]',
    attribute: 'content',
    minLength: 10,
    description: 'Twitter card image alt text <meta name="twitter:image:alt">',
  },
];

export interface SeoValidationReport {
  isValid: boolean;
  route: string;
  canonical: string;
  missingPreRenderTags: string[];
  fixedFields: string[];
  warnings: string[];
  errors: string[];
  checkedAt: string;
}

const DEFAULT_TITLE =
  "VisaApply.org - World's Largest Visa Portal - 249 Countries, 61,752 Routes, 10 Languages";
const DEFAULT_DESCRIPTION =
  '249 countries, 11,563+ live visas, 61,752 ANY-TO-ANY routes, 10 languages auto, daily 3AM auto-sync from 249 gov sites, live time/weather/currency, Booking.com + Travelpayouts flights';
const DEFAULT_OG_IMAGE = 'https://www.visaapply.org/og-image.jpg';
const DEFAULT_OG_IMAGE_ALT = 'VisaApply.org - 249 Countries, 61,752 Routes';

export interface StaticRouteSeoEntry {
  title: string;
  description: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  breadcrumbName?: string;
}

/**
 * Centralized registry of all static, service, legal, and admin routes.
 */
export const STATIC_ROUTE_SEO_REGISTRY: Record<string, StaticRouteSeoEntry> = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: DEFAULT_OG_IMAGE_ALT,
    breadcrumbName: 'Home',
  },
  '/routes': {
    title: '61,752 Global Visa Routes (249 × 248 Any-to-Any Country Matrix) – VisaApply.org',
    description:
      'Search all 61,752 bilateral visa routes between 249 countries and territories. Check Visa-Free, e-Visa, Visa on Arrival (VOA), and Embassy Visa requirements for any passport.',
    breadcrumbName: '61,752 Visa Routes',
  },
  '/flights': {
    title: 'Cheap Flights from India - 249 Countries - From ₹12,500 - VisaApply.org',
    description:
      'Search 100+ airlines - Delhi to Dubai ₹14,800, Delhi to USA ₹45,200 - Compare lowest visa-friendly airfares across 249 countries on VisaApply.org.',
    ogImage: 'https://www.visaapply.org/og/flights.jpg',
    ogImageAlt: 'Cheap Flights from India - 249 Countries - VisaApply.org',
    breadcrumbName: 'Cheap Flights (249 Countries)',
  },
  '/blogs': {
    title: '2026 Global Visa Blogs & Travel Guides (2,490+ Official Articles) – VisaApply.org',
    description:
      'Explore 2,490+ SEO visa blogs across 249 countries: fees, e-Visa vs VOA comparisons, work permits, student scholarships, and consular interview guides.',
    breadcrumbName: 'Visa Blogs',
  },
  '/golden-visa': {
    title: 'Golden Visa & Residency by Investment (2026 Sovereign Directory) – VisaApply.org',
    description:
      'Official 2026 guide to sovereign Golden Visas & Residency by Investment: UAE, Portugal, Greece, Italy, Malta, Cyprus, US EB-5, Caribbean CBI. Requirements, minimum capital, and statutory rules.',
    ogImage: 'https://www.visaapply.org/og/golden-visa.jpg',
    ogImageAlt: 'Golden Visa & Residency by Investment 2026 - VisaApply.org',
    breadcrumbName: 'Golden Visa',
  },
  '/atlys-vs-visaapply': {
    title: 'Atlys vs VisaApply.org (2026 Breakdown) – Free Official Guides vs Agency Markup',
    description:
      'Independent comparison between Atlys and VisaApply.org. Compare 249 countries vs ~80, $0 service fees vs agency markup, zero-document storage privacy, and 11,563+ official visa types.',
    breadcrumbName: 'Atlys vs VisaApply',
  },
  '/dummy-ticket': {
    title: 'Dummy Ticket - Flight + Hotel Reservation for Visa – VisaApply.org',
    description:
      'Official verifiable flight and hotel reservations for visa applications. Real GDS airline PNR and hotel booking voucher valid for 7–14 days. Instant free sample guides and booking tools.',
    breadcrumbName: 'Dummy Ticket',
  },
  '/cover-letter-generator': {
    title: 'Free Cover Letter Generator for Visa – VisaApply.org',
    description:
      'Auto-generate a proper formal visa cover letter in English for Schengen, USA, UK, Canada, and 249 nations. Free instant PDF download with ties to home country.',
    breadcrumbName: 'Cover Letter Generator',
  },
  '/embassy-slot-alert': {
    title: 'Embassy Slot Alert - USA / Schengen – VisaApply.org',
    description:
      'Automated 24/7 consular slot tracking on Email for US, Schengen, UK, Canada, and global embassies across 249 countries.',
    breadcrumbName: 'Embassy Slot Alert',
  },
  '/photo-resizer': {
    title: 'Visa Photo Resizer - Free Online – VisaApply.org',
    description:
      'Free online visa photo resizer and cropper. 35x45mm (Schengen/UK), 2x2 inch (USA DS-160), or 51x51mm at 300 DPI. 100% private client-side browser processing.',
    breadcrumbName: 'Visa Photo Resizer',
  },
  '/visa-rejection-appeal': {
    title: 'Visa Rejection Appeal Guide - Why Was Your Visa Rejected? – VisaApply.org',
    description:
      'Check why your USA, Schengen, UK, or Canada visa was rejected. Get a clear step-by-step fix checklist, when to re-apply, and generate a 100% Free Visa Appeal Letter PDF.',
    breadcrumbName: 'Visa Rejection Appeal Guide',
  },
  '/sop-generator': {
    title: 'Free SOP Generator for Student Visa – VisaApply.org',
    description:
      'Auto-generate a complete 800-word Statement of Purpose (SOP) for Student Visa (Canada, UK, USA, Australia, Germany). 100% free instant Copy and PDF download with no login.',
    breadcrumbName: 'Free SOP Generator',
  },
  '/visa-tracking': {
    title: 'Track Your Visa Application Status – VisaApply.org',
    description:
      'Track your visa application status on official portals: VFS Global, CGI Federal / CEAC (USA), TLScontact (UK), IRCC (Canada), and ImmiAccount. Free status guide & email reminder.',
    breadcrumbName: 'Visa Application Status Tracker',
  },
  '/visa-map': {
    title: 'Global Visa Map - Interactive World Map (249 Passports) – VisaApply.org',
    description:
      'Interactive World Map showing Visa-Free, Visa on Arrival, e-Visa, and Embassy Visa requirements across 249 passports. 100% Free to explore, filter, and share.',
    breadcrumbName: 'Global Visa Map',
  },
  '/multi-country-planner': {
    title: 'Multi-Country Trip Visa Planner (Check All Visas in 1 Min) – VisaApply.org',
    description:
      'Free Multi-Country Trip Planner: Select your passport and add 2-5 destination countries. Check all visas, Schengen rules, Dubai transit visa warnings, total cost, and download Full Trip Plan PDF.',
    breadcrumbName: 'Multi-Country Trip Planner',
  },
  '/bank-statement-guide': {
    title: 'Bank Statement Guide for Visa - How Much Balance Do You Need? – VisaApply.org',
    description:
      'Calculate required bank balance for USA, Schengen, UK & Canada Tourist or Student visas. View 6-month statement sample, 5 tips, and download free Bank Statement Checklist PDF.',
    breadcrumbName: 'Bank Statement Guide for Visa',
  },
  '/travel-insurance-compare': {
    title: 'Travel Insurance Compare - Best Insurance for Your Visa – VisaApply.org',
    description:
      '100% Free Compare: Tata AIG, HDFC Ergo, and Niva Bupa VFS-approved travel medical insurance starting at Rs 499. Meets mandatory €30,000 Schengen requirement.',
    breadcrumbName: 'Travel Insurance Compare',
  },
  '/esim-249': {
    title: 'eSIM for 249 Countries - Buy eSIM for Your Trip – VisaApply.org',
    description:
      'Free Compare of Airalo, Holafly, and Nomad travel eSIM plans across 249 countries in USD and INR. Instant QR activation and 5G data roaming.',
    breadcrumbName: 'eSIM for 249 Countries',
  },
  '/forex-card-compare': {
    title: 'Forex Card Compare - Best Card to Carry Abroad – VisaApply.org',
    description:
      'Compare Niyo Global, Wise, HDFC ForexPlus, and BookMyForex zero-markup forex cards for USA, Europe, Dubai, and Thailand. Save up to 4.13% forex markup.',
    breadcrumbName: 'Forex Card Compare',
  },
  '/sponsorship-finder': {
    title: 'Visa Sponsorship Finder (USA, UK, Canada, Australia, Germany) – VisaApply.org',
    description:
      '100% Free Directory of verified companies sponsoring H1B, UK Skilled Worker, Canada LMIA/GTS, Australia TSS 482, and Germany EU Blue Card across IT, Healthcare, Engineering, and Nursing.',
    breadcrumbName: 'Visa Sponsorship Finder',
  },
  '/work-permit-guide': {
    title: 'Work Permit Guide - Jobs Abroad with Visa Sponsorship – VisaApply.org',
    description:
      '100% Free Work Permit Guide: Compare visa types, salary ranges, processing times, and sponsorship rules across Gulf (UAE, Qatar, Saudi), Europe (Germany, Poland, Portugal), Canada, and Australia.',
    breadcrumbName: 'Work Permit Guide',
  },
  '/student-visa-university': {
    title: 'Student Visa + University Finder (With & Without IELTS) – VisaApply.org',
    description:
      'Free Student Visa + University Finder for USA, UK, Canada, Australia, and Germany. Compare 5 universities by course, budget (Rs 10L / 20L / 40L), IELTS requirement, and post-study work rights.',
    breadcrumbName: 'Student Visa + University Finder',
  },
  '/passport-seva-guide': {
    title: 'Passport Seva Guide - New Passport, Renewal, Tatkal – VisaApply.org',
    description:
      'Complete 5-step Indian Passport Seva guide for New Passport, Re-issue/Renewal, Tatkal (1–3 days), and Lost Passport. Check official fees (Rs 1,500 / Rs 3,500), documents, and download PDF checklist.',
    breadcrumbName: 'Passport Seva Guide',
  },
  '/oci-pio-guide': {
    title: 'OCI / PIO Card Guide for NRI - Eligibility, Fee ($275) & Checklist – VisaApply.org',
    description:
      'Official OCI / PIO Card Guide for NRIs in USA, UK, Canada, and Australia. Check OCI eligibility, $275 VFS fee, 30-60 days processing time, required documents, and OCI vs PIO vs Visa comparison.',
    breadcrumbName: 'OCI / PIO Card Guide for NRI',
  },
  '/scholarship-finder': {
    title: 'Scholarship Finder (USA, UK, Canada, Australia, Germany) – VisaApply.org',
    description:
      '100% Free Scholarship Finder: Compare 15 Fully Funded, Partial, and Merit scholarships (Fulbright, Chevening, DAAD, Vanier, Gates Cambridge) with live deadline calendar and official apply links.',
    breadcrumbName: 'Scholarship Finder',
  },
  '/immigration': {
    title: 'Global Immigration & Residency Hub (249 Countries) – VisaApply.org',
    description:
      'Explore official Permanent Residency, Citizenship, Work Permits, Family Sponsorship, Business Investor visas, and Digital Nomad residency for all 249 countries.',
    breadcrumbName: 'Global Immigration Hub',
  },
  '/about': {
    title: 'About Us, Editorial Policy & Free Visa Backlink Widget – VisaApply.org',
    description:
      'Learn about VisaApply.org editorial verification standards, E-E-A-T immigration research methodology, and embed our free live 249-country visa status widget on your website.',
    breadcrumbName: 'About Us & Editorial Policy',
  },
  '/backlink-widget': {
    title: 'Free Live 249-Country Visa Status Backlink Widget – VisaApply.org',
    description:
      'Embed our free live 249-country visa status widget on your travel blog or university portal. Verified daily against official government immigration portals.',
    breadcrumbName: 'Free Visa Backlink Widget',
  },
  '/contact': {
    title: 'Contact Us & Consular Support Desk – VisaApply.org',
    description:
      'Get in touch with VisaApply.org editorial and consular research team. Email contact@visaapply.org for visa inquiries, partnerships, or advertising.',
    breadcrumbName: 'Contact Us',
  },
  '/privacy': {
    title: 'Privacy Policy, Cookie & Google AdSense Disclosure – VisaApply.org',
    description:
      'Official Privacy Policy, Google AdSense DART cookie disclosure, and GDPR/DPDP data protection terms for VisaApply.org.',
    breadcrumbName: 'Privacy Policy',
  },
  '/terms': {
    title: 'Terms of Service & Editorial Disclaimer – VisaApply.org',
    description:
      'Official Terms of Service, user responsibilities, and non-governmental consular disclaimer for VisaApply.org.',
    breadcrumbName: 'Terms of Service',
  },
  '/sitemap': {
    title: 'All 11,563+ Visa Guides & 61,752 Routes Directory [2026] | VisaApply.org',
    description:
      'Explore complete visa requirements, official fees, and document checklists across all 249 global destination countries, 61,752 bilateral routes, and 6 visa categories.',
    breadcrumbName: 'All 11,563+ Visa Guides Directory',
  },
  '/audit': {
    title: 'Live Database Audit & 249-Country Verification Report – VisaApply.org',
    description:
      'Real-time database integrity audit verifying all 249 ISO countries, 11,563+ official visa subclasses, and 61,752 bilateral routes on VisaApply.org.',
    noindex: true,
    breadcrumbName: 'Live Database Audit',
  },
  '/verification': {
    title: 'Consular Data Verification & Official Sources Directory – VisaApply.org',
    description:
      'Verify official government immigration portals, consular fee schedules, and real-time database integrity across all 249 countries on VisaApply.org.',
    breadcrumbName: 'Consular Data Verification',
  },
  '/admin': {
    title: 'Admin Editorial Portal – VisaApply.org',
    description: 'Manage AI-generated visa guide drafts and publish official immigration content.',
    noindex: true,
    breadcrumbName: 'Admin Portal',
  },
  '/admin/login': {
    title: 'Admin Login – VisaApply.org',
    description: 'Restricted administrator login for VisaApply.org.',
    noindex: true,
    breadcrumbName: 'Admin Login',
  },
  '/admin/updates': {
    title: 'Last 30 Days Immigration Changes (Auto-Synced Daily) – VisaApply.org',
    description:
      'Real-time immigration policy changes, visa fee updates, processing time shifts, and new visa announcements across 249 official government portals.',
    noindex: true,
    breadcrumbName: 'Admin Immigration Updates',
  },
  '/admin/slot-alert': {
    title: 'Embassy Slot Auto Monitor – Admin Portal – VisaApply.org',
    description:
      'Restricted administrator console for monitoring embassy appointment slot checks and subscriber alerts across 249 countries.',
    noindex: true,
    breadcrumbName: 'Admin Slot Monitor',
  },
};

const KNOWN_DYNAMIC_ROUTE_PATTERNS: ReadonlyArray<{ name: string; regex: RegExp }> = [
  { name: 'Consular Interview Prep (/interview-prep/:code)', regex: /^\/interview-prep\/([a-z]{2,3})$/i },
  { name: 'Level 1 Country Visa (/in-to-:to or /:to-visa)', regex: /^\/([a-z]{2,3})-to-([a-z]{2,3})$/i },
  { name: 'Short Country Visa (/:to-visa)', regex: /^\/([a-z]{2,3})-visa$/i },
  {
    name: 'Level 2 Visa Category (/:from-to-:to-:category)',
    regex: /^\/([a-z]{2,3})-to-([a-z]{2,3})-(tourist|work|student|family|business|pr)$/i,
  },
  {
    name: 'Level 3 Visa Detail (/:from-to-:to-:category-:sub)',
    regex: /^\/([a-z]{2,3})-to-([a-z]{2,3})-(tourist|work|student|family|business|pr)-([a-z0-9-]+)$/i,
  },
  {
    name: 'Direct Visa Subtype (/:from-to-:to-:sub)',
    regex: /^\/([a-z]{2,3})-to-([a-z]{2,3})-([a-z0-9-]+)$/i,
  },
  {
    name: 'Global Immigration Country Hub (/immigration/:code)',
    regex: /^\/immigration\/([a-z]{2,3})$/i,
  },
  {
    name: 'Blog / Guide Article Slug',
    regex: /^\/(?:blog\/|blogs\/)?([a-z0-9-]+(?:guide|blog|visa)[a-z0-9-]*)$/i,
  },
];

/**
 * Normalizes any pathname into a clean canonical URL on https://www.visaapply.org
 */
export function normalizeCanonicalUrl(rawPath: string, baseOrigin?: string): string {
  const base = (baseOrigin || getCanonicalBaseOrigin() || 'https://www.visaapply.org').replace(/\/+$/, '');
  const withoutQueryOrHash = String(rawPath || '/').split('?')[0].split('#')[0].trim();

  let cleanedPath = withoutQueryOrHash
    .replace(/\/oci-%20pio-guide/gi, '/oci-pio-guide')
    .replace(/\/oci-\s+pio-guide/gi, '/oci-pio-guide');

  if (!cleanedPath.startsWith('/')) {
    cleanedPath = `/${cleanedPath}`;
  }

  if (cleanedPath.length > 1) {
    cleanedPath = cleanedPath.replace(/\/+$/, '');
  }

  if (cleanedPath === '/en') {
    cleanedPath = '/';
  } else if (cleanedPath.startsWith('/en/')) {
    cleanedPath = cleanedPath.replace(/^\/en\//, '/');
  }

  return `${base}${cleanedPath === '/' ? '/' : cleanedPath}`;
}

/**
 * Resolves static route metadata if the path matches a known static/service route.
 */
export function resolveStaticRouteSeoMetadata(rawPath: string): StaticRouteSeoEntry | null {
  const { strippedPath } = getLangFromUrlPath(rawPath || '/');
  const clean =
    strippedPath
      .split('?')[0]
      .split('#')[0]
      .replace(/\/oci-%20pio-guide/gi, '/oci-pio-guide')
      .replace(/\/oci-\s+pio-guide/gi, '/oci-pio-guide')
      .replace(/\/+$/, '') || '/';

  if (STATIC_ROUTE_SEO_REGISTRY[clean]) {
    return STATIC_ROUTE_SEO_REGISTRY[clean];
  }
  if (clean.startsWith('/admin/')) {
    return {
      title: 'Admin Portal – VisaApply.org',
      description: 'Restricted administrator portal for VisaApply.org.',
      noindex: true,
      breadcrumbName: 'Admin Portal',
    };
  }
  return null;
}

/**
 * Checks whether a route is registered in STATIC_ROUTE_SEO_REGISTRY or matches a known dynamic route pattern.
 */
export function isRouteRegisteredInSeoManager(rawPath: string): {
  registered: boolean;
  matchedSource: string;
} {
  const staticEntry = resolveStaticRouteSeoMetadata(rawPath);
  if (staticEntry) {
    return { registered: true, matchedSource: 'STATIC_ROUTE_SEO_REGISTRY' };
  }

  const { strippedPath } = getLangFromUrlPath(rawPath || '/');
  const clean = strippedPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

  for (const pattern of KNOWN_DYNAMIC_ROUTE_PATTERNS) {
    if (pattern.regex.test(clean)) {
      return { registered: true, matchedSource: pattern.name };
    }
  }

  return { registered: false, matchedSource: 'UNREGISTERED_ROUTE' };
}

/**
 * Cleans strings of accidental undefined/null/NaN tokens or repeated whitespace.
 */
function sanitizeMetaText(input: string | undefined | null, fallback: string): string {
  if (!input || typeof input !== 'string') return fallback;
  const cleaned = input
    .replace(/\b(?:undefined|null|NaN)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned.length >= 10 ? cleaned : fallback;
}

/**
 * Pre-render validation function:
 * Checks a route and its incoming metadata payload against MANDATORY_SEO_TAG_LIST
 * BEFORE rendering to the DOM, flagging any missing, empty, or malformed entries
 * in the console for immediate developer action.
 */
export function validateRouteSeoBeforeRender(
  rawPath: string,
  incomingPayload: Partial<SeoMetadataPayload> & { noindex?: boolean }
): {
  isValid: boolean;
  route: string;
  routeRegistration: { registered: boolean; matchedSource: string };
  missingMandatoryTags: Array<{ id: string; selector: string; reason: string }>;
} {
  const route = rawPath || '/';
  const routeRegistration = isRouteRegisteredInSeoManager(route);
  const missingMandatoryTags: Array<{ id: string; selector: string; reason: string }> = [];

  if (!routeRegistration.registered) {
    missingMandatoryTags.push({
      id: 'route:registry',
      selector: route,
      reason: `Route "${route}" is not registered in STATIC_ROUTE_SEO_REGISTRY or known dynamic patterns; falling back to default SEO metadata.`,
    });
  }

  // Primary route-specific fields that callers MUST supply before derived tags are computed
  const primaryRouteFields: Array<{
    id: string;
    field: keyof SeoMetadataPayload;
    selector: string;
    minLength?: number;
    mustMatchPrefix?: string;
  }> = [
    { id: 'title', field: 'title', selector: 'title', minLength: 15 },
    { id: 'meta:description', field: 'description', selector: 'meta[name="description"]', minLength: 50 },
    {
      id: 'link:canonical',
      field: 'canonical',
      selector: 'link[rel="canonical"]',
      mustMatchPrefix: 'https://www.visaapply.org',
    },
    {
      id: 'og:image',
      field: 'ogImage',
      selector: 'meta[property="og:image"]',
      mustMatchPrefix: 'https://www.visaapply.org/',
    },
    { id: 'og:image:alt', field: 'ogImageAlt', selector: 'meta[property="og:image:alt"]', minLength: 10 },
  ];

  for (const spec of primaryRouteFields) {
    const rawVal = incomingPayload[spec.field];
    const strVal = typeof rawVal === 'string' ? rawVal.trim() : '';

    if (!strVal) {
      missingMandatoryTags.push({
        id: spec.id,
        selector: spec.selector,
        reason: `Missing mandatory SEO field "${spec.field}" (${spec.selector}) for route "${route}".`,
      });
      continue;
    }

    if (/\b(?:undefined|null|NaN)\b/i.test(strVal)) {
      missingMandatoryTags.push({
        id: spec.id,
        selector: spec.selector,
        reason: `Field "${spec.field}" (${spec.selector}) contains invalid token (undefined/null/NaN): "${strVal}".`,
      });
    }

    if (spec.minLength && strVal.length < spec.minLength) {
      missingMandatoryTags.push({
        id: spec.id,
        selector: spec.selector,
        reason: `Field "${spec.field}" (${spec.selector}) is too short (${strVal.length} chars, minimum ${spec.minLength} required): "${strVal}".`,
      });
    }

    if (spec.mustMatchPrefix && !strVal.startsWith(spec.mustMatchPrefix)) {
      missingMandatoryTags.push({
        id: spec.id,
        selector: spec.selector,
        reason: `Field "${spec.field}" (${spec.selector}) must start with "${spec.mustMatchPrefix}", got "${strVal}".`,
      });
    }
  }

  if (missingMandatoryTags.length > 0 && typeof console !== 'undefined') {
    console.warn(
      `[SEO Metadata Manager] ⚠️ Pre-render validation flagged ${missingMandatoryTags.length} issue(s) on route "${route}" (auto-healing with fallback defaults):`,
      missingMandatoryTags
    );
  }

  return {
    isValid: missingMandatoryTags.length === 0,
    route,
    routeRegistration,
    missingMandatoryTags,
  };
}

/**
 * Validates and sanitizes a partial SEO metadata payload against MANDATORY_SEO_TAG_LIST,
 * ensuring all 23 mandatory Title, Description, Canonical, Robots, OpenGraph, and Twitter Card
 * fields are present and valid.
 */
export function validateAndSanitizeSeoMetadata(
  partial: Partial<SeoMetadataPayload> & { noindex?: boolean },
  rawPath: string
): { metadata: SeoMetadataPayload; validation: SeoValidationReport } {
  const fixedFields: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  const { strippedPath } = getLangFromUrlPath(rawPath || '/');
  const isAdminOrAudit =
    Boolean(partial.noindex) ||
    strippedPath === '/admin' ||
    strippedPath.startsWith('/admin/') ||
    strippedPath === '/audit';

  const canonical = normalizeCanonicalUrl(
    partial.canonical ? new URL(partial.canonical, 'https://www.visaapply.org').pathname : rawPath
  );
  if (!partial.canonical || partial.canonical !== canonical) {
    fixedFields.push('canonical');
  }

  let title = sanitizeMetaText(partial.title, DEFAULT_TITLE);
  if (title === DEFAULT_TITLE && partial.title !== DEFAULT_TITLE) {
    fixedFields.push('title');
  }
  if (!/VisaApply/i.test(title) && !/\(2026 Guide\)$/i.test(title)) {
    title = `${title} – VisaApply.org`;
    fixedFields.push('title:brand_suffix');
  }

  let description = sanitizeMetaText(partial.description, DEFAULT_DESCRIPTION);
  if (description === DEFAULT_DESCRIPTION && partial.description !== DEFAULT_DESCRIPTION) {
    fixedFields.push('description');
  }
  if (description.length < 50) {
    description = `${description} Explore official 2026 visa requirements, fees, processing times, and free PDF checklists on VisaApply.org.`;
    fixedFields.push('description:min_length');
  }

  let ogImage = sanitizeMetaText(partial.ogImage, DEFAULT_OG_IMAGE);
  if (!/^https?:\/\//i.test(ogImage)) {
    ogImage = `https://www.visaapply.org${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
    fixedFields.push('ogImage:absolute_url');
  }

  const ogImageAlt = sanitizeMetaText(partial.ogImageAlt, title || DEFAULT_OG_IMAGE_ALT);

  // Run pre-render check against mandatory fields and log any missing entries for immediate developer action
  const preRenderReport = validateRouteSeoBeforeRender(rawPath, {
    ...partial,
    canonical: partial.canonical || canonical,
    ogImage: partial.ogImage || ogImage,
    ogImageAlt: partial.ogImageAlt || ogImageAlt,
  });

  const ogTitle = sanitizeMetaText(partial.ogTitle, title);
  const ogDescription = sanitizeMetaText(partial.ogDescription, description);
  const twitterTitle = sanitizeMetaText(partial.twitterTitle, title);
  const twitterDescription = sanitizeMetaText(partial.twitterDescription, description);

  const robotsValue = isAdminOrAudit
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const botValue = isAdminOrAudit
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large';

  const metadata: SeoMetadataPayload = {
    title,
    description,
    canonical,
    robots: partial.robots || robotsValue,
    googlebot: partial.googlebot || botValue,
    bingbot: partial.bingbot || botValue,
    ogType: partial.ogType || 'website',
    ogSiteName: partial.ogSiteName || 'VisaApply.org',
    ogLocale: partial.ogLocale || 'en_IN',
    ogTitle,
    ogDescription,
    ogUrl: canonical,
    ogImage,
    ogImageSecureUrl: ogImage,
    ogImageType: partial.ogImageType || 'image/jpeg',
    ogImageWidth: partial.ogImageWidth || '1200',
    ogImageHeight: partial.ogImageHeight || '630',
    ogImageAlt,
    twitterCard: partial.twitterCard || 'summary_large_image',
    twitterSite: partial.twitterSite || '@VisaApplyOrg',
    twitterTitle,
    twitterDescription,
    twitterImage: ogImage,
    twitterImageAlt: ogImageAlt,
  };

  // Final verification against every item in MANDATORY_SEO_TAG_LIST
  for (const spec of MANDATORY_SEO_TAG_LIST) {
    const val = String(metadata[spec.field] || '').trim();
    if (!val) {
      errors.push(`Missing mandatory tag ${spec.id} (${spec.selector})`);
    } else if (spec.minLength && val.length < spec.minLength) {
      warnings.push(`Tag ${spec.id} (${spec.selector}) length ${val.length} < ${spec.minLength}`);
    } else if (spec.mustMatchPrefix && !val.startsWith(spec.mustMatchPrefix)) {
      errors.push(`Tag ${spec.id} (${spec.selector}) does not match prefix ${spec.mustMatchPrefix}`);
    }
  }

  if (errors.length > 0 && typeof console !== 'undefined') {
    console.warn(`[SEO Metadata Manager] ❌ Validation errors on route "${rawPath}":`, errors);
  }

  return {
    metadata,
    validation: {
      isValid: errors.length === 0,
      route: rawPath || '/',
      canonical: metadata.canonical,
      missingPreRenderTags: preRenderReport.missingMandatoryTags.map((m) => `${m.id}: ${m.reason}`),
      fixedFields,
      warnings,
      errors,
      checkedAt: new Date().toISOString(),
    },
  };
}

let lastAppliedMetadata: SeoMetadataPayload | null = null;
let lastValidationReport: SeoValidationReport | null = null;

function setOrCreateMetaTag(attrName: 'name' | 'property', attrVal: string, contentVal: string) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  if (el.getAttribute('content') !== contentVal) {
    el.setAttribute('content', contentVal);
  }
}

function setOrCreateLinkTag(relVal: string, hrefVal: string) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector(`link[rel="${relVal}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', relVal);
    document.head.appendChild(link);
  }
  if (link.getAttribute('href') !== hrefVal) {
    link.setAttribute('href', hrefVal);
  }
}

/**
 * Validates the route against MANDATORY_SEO_TAG_LIST before rendering, then synchronizes
 * all required SEO, Canonical, OpenGraph, and Twitter tags to the live DOM.
 */
export function applySeoMetadataToDom(
  partial: Partial<SeoMetadataPayload> & { noindex?: boolean },
  rawPath: string
): { metadata: SeoMetadataPayload; validation: SeoValidationReport } {
  const { metadata, validation } = validateAndSanitizeSeoMetadata(partial, rawPath);

  if (typeof document !== 'undefined') {
    if (document.title !== metadata.title) {
      document.title = metadata.title;
    }

    // Core SEO & Crawler directives
    setOrCreateMetaTag('name', 'description', metadata.description);
    setOrCreateMetaTag('name', 'robots', metadata.robots);
    setOrCreateMetaTag('name', 'googlebot', metadata.googlebot);
    setOrCreateMetaTag('name', 'bingbot', metadata.bingbot);

    // Canonical Link
    setOrCreateLinkTag('canonical', metadata.canonical);

    // OpenGraph Tags
    setOrCreateMetaTag('property', 'og:type', metadata.ogType);
    setOrCreateMetaTag('property', 'og:site_name', metadata.ogSiteName);
    setOrCreateMetaTag('property', 'og:locale', metadata.ogLocale);
    setOrCreateMetaTag('property', 'og:title', metadata.ogTitle);
    setOrCreateMetaTag('property', 'og:description', metadata.ogDescription);
    setOrCreateMetaTag('property', 'og:url', metadata.ogUrl);
    setOrCreateMetaTag('property', 'og:image', metadata.ogImage);
    setOrCreateMetaTag('property', 'og:image:secure_url', metadata.ogImageSecureUrl);
    setOrCreateMetaTag('property', 'og:image:type', metadata.ogImageType);
    setOrCreateMetaTag('property', 'og:image:width', metadata.ogImageWidth);
    setOrCreateMetaTag('property', 'og:image:height', metadata.ogImageHeight);
    setOrCreateMetaTag('property', 'og:image:alt', metadata.ogImageAlt);

    // Twitter Card Tags
    setOrCreateMetaTag('name', 'twitter:card', metadata.twitterCard);
    setOrCreateMetaTag('name', 'twitter:site', metadata.twitterSite);
    setOrCreateMetaTag('name', 'twitter:title', metadata.twitterTitle);
    setOrCreateMetaTag('name', 'twitter:description', metadata.twitterDescription);
    setOrCreateMetaTag('name', 'twitter:image', metadata.twitterImage);
    setOrCreateMetaTag('name', 'twitter:image:alt', metadata.twitterImageAlt);
  }

  lastAppliedMetadata = metadata;
  lastValidationReport = validation;
  return { metadata, validation };
}

/**
 * Inspects the current browser DOM against every tag in MANDATORY_SEO_TAG_LIST
 * and flags any missing or mismatched entries in the console.
 */
export function validateCurrentDomMetadata(autoFix = true): {
  isValid: boolean;
  discrepancies: string[];
  currentDom: Record<string, string | null>;
} {
  if (typeof document === 'undefined') {
    return { isValid: true, discrepancies: [], currentDom: {} };
  }

  const currentDom: Record<string, string | null> = {};
  const discrepancies: string[] = [];

  for (const spec of MANDATORY_SEO_TAG_LIST) {
    let val: string | null = null;
    if (spec.attribute === 'textContent') {
      val = document.title || null;
    } else {
      const el = document.querySelector(spec.selector);
      val = el ? el.getAttribute(spec.attribute) : null;
    }
    currentDom[spec.id] = val;

    if (!val || val.trim().length === 0) {
      discrepancies.push(`Missing mandatory DOM tag: ${spec.id} (${spec.selector})`);
    } else if (spec.minLength && val.trim().length < spec.minLength) {
      discrepancies.push(
        `DOM tag ${spec.id} (${spec.selector}) is shorter than ${spec.minLength} chars: "${val}"`
      );
    } else if (spec.mustMatchPrefix && !val.startsWith(spec.mustMatchPrefix)) {
      discrepancies.push(
        `DOM tag ${spec.id} (${spec.selector}) must start with "${spec.mustMatchPrefix}", found "${val}"`
      );
    }
  }

  if (currentDom['title'] && currentDom['og:title'] && currentDom['title'] !== currentDom['og:title']) {
    discrepancies.push(
      `Title mismatch: document.title ("${currentDom['title']}") !== og:title ("${currentDom['og:title']}")`
    );
  }

  if (currentDom['link:canonical'] && currentDom['og:url'] && currentDom['link:canonical'] !== currentDom['og:url']) {
    discrepancies.push(
      `Canonical mismatch: link[rel=canonical] ("${currentDom['link:canonical']}") !== og:url ("${currentDom['og:url']}")`
    );
  }

  if (discrepancies.length > 0) {
    console.warn(
      `[SEO Metadata Manager] ⚠️ DOM validation detected ${discrepancies.length} issue(s) on "${window.location.pathname}":`,
      discrepancies
    );
    if (autoFix && lastAppliedMetadata) {
      applySeoMetadataToDom(lastAppliedMetadata, window.location.pathname);
    }
  }

  return {
    isValid: discrepancies.length === 0,
    discrepancies,
    currentDom,
  };
}

/**
 * Audits all registered static routes + representative dynamic routes against MANDATORY_SEO_TAG_LIST,
 * flagging any missing entries in the console for immediate developer action.
 */
export function auditAllStaticRoutesSeo(): {
  totalRoutesChecked: number;
  validRoutesCount: number;
  invalidRoutesCount: number;
  results: Array<{
    route: string;
    isValid: boolean;
    title: string;
    canonical: string;
    missingPreRenderTags: string[];
    fixedFields: string[];
  }>;
} {
  const routes = Object.keys(STATIC_ROUTE_SEO_REGISTRY);
  const results = routes.map((route) => {
    const entry = STATIC_ROUTE_SEO_REGISTRY[route];
    const { metadata, validation } = validateAndSanitizeSeoMetadata(
      {
        title: entry.title,
        description: entry.description,
        canonical: normalizeCanonicalUrl(route, 'https://www.visaapply.org'),
        ogImage: entry.ogImage || DEFAULT_OG_IMAGE,
        ogImageAlt: entry.ogImageAlt || entry.title,
        ogType: entry.ogType || 'website',
        noindex: entry.noindex,
      },
      route
    );
    return {
      route,
      isValid: validation.isValid && validation.missingPreRenderTags.length === 0,
      title: metadata.title,
      canonical: metadata.canonical,
      missingPreRenderTags: validation.missingPreRenderTags,
      fixedFields: validation.fixedFields,
    };
  });

  const invalidRoutes = results.filter((r) => !r.isValid);
  if (invalidRoutes.length > 0 && typeof console !== 'undefined') {
    console.warn(
      `[SEO Metadata Manager] ⚠️ Route Registry Audit found ${invalidRoutes.length} route(s) with missing mandatory SEO tags:`,
      invalidRoutes
    );
  }

  const validRoutesCount = results.filter((r) => r.isValid).length;
  return {
    totalRoutesChecked: results.length,
    validRoutesCount,
    invalidRoutesCount: results.length - validRoutesCount,
    results,
  };
}

// Run startup route registry validation in browser dev/runtime and expose inspection API
if (typeof window !== 'undefined') {
  (window as any).__SEO_METADATA_MANAGER__ = {
    MANDATORY_SEO_TAG_LIST,
    validateRouteBeforeRender: validateRouteSeoBeforeRender,
    validateDom: () => validateCurrentDomMetadata(true),
    auditAllStaticRoutes: () => auditAllStaticRoutesSeo(),
    getCurrentMetadata: () => lastAppliedMetadata,
    getLastValidationReport: () => lastValidationReport,
    applySeoMetadataToDom,
  };
}
