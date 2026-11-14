import {
  NAME_MAP_249,
  FLAG_MAP_249,
  getLiveVisaCount,
} from './countryLightRegistry';
import {
  getVisasFixed,
  getVisasByCategoryFixed,
} from './fullVisaDatabase';
import { getCountryMeta } from './countryMetaData';

export type BilateralEligibilityStatus =
  | 'VERIFIED'
  | 'PARTIAL_TREATY_SCOPE'
  | 'AWAITING_VERIFICATION'
  | 'UNKNOWN';

export type PassportType = 'ORDINARY' | 'OFFICIAL' | 'DIPLOMATIC' | 'UNKNOWN';
export type EntryPurpose = 'SHORT_STAY_TOURISM' | 'WORK' | 'STUDY' | 'RESIDENCE' | 'TRANSIT';

export interface BilateralEligibilityContext {
  passportNationality?: string;
  passportType?: PassportType;
  entryPurpose?: EntryPurpose;
  hasThirdCountryResidencePermit?: boolean;
}

export interface BilateralEligibilityEvaluation {
  visaFree: boolean;
  eVisaEligible: boolean;
  voaEligible: boolean;
  eligibilityStatus: BilateralEligibilityStatus;
  scopeNote: string;
}

export interface AnyToAnyRouteEntry {
  fromCountry: string;
  toCountry: string;
  fromName: string;
  toName: string;
  fromFlag: string;
  toFlag: string;
  visaFree: boolean;
  eVisaEligible: boolean;
  voaEligible: boolean;
  totalVisas: number;
  processing: string;
  bestRoute: string;
  eligibilityStatus: BilateralEligibilityStatus;
  countsVerified: boolean;
  visaFreeVerified: boolean;
  disclaimer?: string;
}

const GCC_COUNTRIES = new Set(['ae', 'sa', 'qa', 'kw', 'om', 'bh']);
const FULL_SCHENGEN_EU_COUNTRIES = new Set([
  'at', 'be', 'bg', 'ch', 'cz', 'de', 'dk', 'ee', 'es', 'fi', 'fr', 'gr', 'hr', 'hu', 'is', 'it', 'li', 'lt', 'lu', 'lv', 'mt', 'nl', 'no', 'pl', 'pt', 'ro', 'se', 'si', 'sk'
]);
const EU_NON_SCHENGEN_COUNTRIES = new Set(['ie', 'cy']);
const EU_EEA_SWISS_MOBILITY = new Set([...FULL_SCHENGEN_EU_COUNTRIES, ...EU_NON_SCHENGEN_COUNTRIES]);

const INDIA_VISA_FREE_SET = new Set([
  'th', 'my', 'mu', 'np', 'bt', 'mv', 'sc', 'fj', 'bb', 'dm', 'gd', 'ht', 'jm', 'ms', 'kn', 'vc', 'tt', 'vu', 'ws', 'kz', 'ir', 'ke', 'rw', 'sn', 'ao', 'mg', 'mz'
]);

const INDIA_EVISA_VOA_SET = new Set([
  'ae', 'sg', 'vn', 'id', 'lk', 'om', 'qa', 'bh', 'kh', 'la', 'mm', 'uz', 'az', 'ge', 'am', 'eg', 'jo', 'tz', 'ug', 'et', 'zm', 'zw', 'bw', 'jp', 'kr', 'ru', 'tr', 'au', 'nz'
]);

const INDIA_VOA_VERIFIED_SET = new Set([
  'id', 'kh', 'la', 'mv', 'jo', 'mu', 'sc', 'fj', 'tz', 'rw', 'om', 'qa', 'th'
]);

// Curated bilateral corridors with actual authored visa records in getVisasForAnyRoute
const CURATED_BILATERAL_VISAS: Record<string, any[]> = {
  'ae-to-us': [
    {
      id: `ae-to-us-tourist-b1b2-uae`,
      name: `US B1/B2 10-Year Multiple Entry Visa (Abu Dhabi / Dubai Embassy)`,
      officialCode: 'B-1/B-2',
      category: 'tourist',
      icon: '🇺🇸',
      fee: '$185 USD (~680 AED)',
      processing: '5-12 Working Days (US Embassy Abu Dhabi / Dubai Consulate)',
      validity: 'Up to 10 Years Multiple Entry',
      purpose: `Tourism, family visit, medical treatment & business conferences in the United States for UAE citizens and UAE Golden/Employment residency holders.`,
      docs: [
        'Valid Passport (6+ Months) & Valid UAE Emirates ID / UAE Residence Visa',
        'DS-160 Confirmation Page & US Visa Appointment Confirmation (ais.usvisa-info.com/en-ae)',
        'Last 6 Months UAE Bank Statements (ADCB, Emirates NBD, FAB) showing 35,000+ AED balance',
        'UAE Employer Salary Certificate / NOC or UAE Trade License',
      ],
      popular: true,
      highlight: true,
      isActive: true,
    },
    {
      id: `ae-to-us-student-f1-uae`,
      name: `US F-1 Academic Student Visa (from UAE)`,
      officialCode: 'F-1',
      category: 'student',
      icon: '🎓',
      fee: '$185 MRV + $350 SEVIS (~1,965 AED)',
      processing: '3-7 Working Days in Abu Dhabi / Dubai',
      validity: 'Duration of Study + OPT (Up to 3 Years STEM)',
      purpose: `Full-time university degree or language study at SEVP-certified US institutions for applicants applying in Abu Dhabi or Dubai.`,
      docs: [
        'Form I-20 signed by US University DSO',
        'SEVIS I-901 Fee Payment Receipt',
        'UAE Sponsor Bank Statements & Scholarship / Financial Guarantee Letter',
        'Academic Transcripts, IELTS/TOEFL & Valid UAE Residency',
      ],
      popular: true,
      highlight: true,
      isActive: true,
    },
    {
      id: `ae-to-us-work-h1b-uae`,
      name: `US H-1B Specialty Occupation Work Visa (UAE Consular Stamping)`,
      officialCode: 'H-1B',
      category: 'work',
      icon: '💼',
      fee: '$205 USD Petition Visa Fee',
      processing: '5-10 Working Days',
      validity: '3 Years (Extendable to 6 Years)',
      purpose: `Professional employment in IT, engineering, finance, and healthcare in the United States with USCIS Form I-797 approval.`,
      docs: [
        'Approved Form I-797 Notice of Action from USCIS',
        'Labor Condition Application (LCA) & US Employer Offer Letter',
        'University Degree Certificates & UAE Experience Letters',
        'Valid Passport & Emirates ID',
      ],
      popular: true,
      highlight: true,
      isActive: true,
    }
  ],
  'us-to-in': [
    {
      id: `us-to-in-tourist-etourist-5y`,
      name: `India 5-Year Multiple Entry e-Tourist Visa for US Citizens`,
      officialCode: 'e-TV 5Y',
      category: 'tourist',
      icon: '🇮🇳',
      fee: '$80 USD Official e-Visa Fee',
      processing: '24-72 Hours Online (indianvisaonline.gov.in)',
      validity: '5 Years Multiple Entry (180 Days Max per Visit)',
      purpose: `Tourism, sightseeing, visiting friends/relatives, and short-term yoga retreats across India for United States passport holders.`,
      docs: [
        'US Passport valid for at least 6 months with 2 blank pages',
        'Digital 2x2 inch White Background Photograph',
        'Return or Onward Flight Ticket & Hotel Booking in India',
      ],
      popular: true,
      highlight: true,
      isActive: true,
    },
    {
      id: `us-to-in-business-ebusiness`,
      name: `India 1-Year Multiple Entry e-Business Visa for US Nationals`,
      officialCode: 'e-BV',
      category: 'business',
      icon: '🤝',
      fee: '$80 USD',
      processing: '24-72 Hours Online',
      validity: '1 Year Multiple Entry (180 Days Stay)',
      purpose: `Commercial meetings, setting up industrial/business ventures, trade fairs, and technical consultations in India.`,
      docs: [
        'US Passport PDF Scan',
        'Business Card & Invitation Letter from Indian Host Company',
        'Letter of Incorporation / Employer Dispatch Letter from US Firm',
      ],
      popular: true,
      highlight: true,
      isActive: true,
    },
    {
      id: `us-to-in-pr-oci-card`,
      name: `OCI Card (Overseas Citizen of India) Lifelong Visa-Free Status`,
      officialCode: 'OCI',
      category: 'pr',
      icon: '🏠',
      fee: '$275 USD (VFS Global USA)',
      processing: '4-6 Weeks via VFS USA (NY, SF, Chicago, Houston, Atlanta, DC)',
      validity: 'Lifelong Multiple Entry & Work/Residence Parity',
      purpose: `Lifelong visa-free entry, work, and property rights in India for US citizens of Indian origin and their spouses.`,
      docs: [
        'Current US Passport & Naturalization Certificate',
        'Proof of Former Indian Citizenship (Cancelled Indian Passport / Surrender Certificate)',
        'Birth Certificate / Parents or Grandparents Indian Origin Proof',
      ],
      popular: true,
      highlight: true,
      isActive: true,
    }
  ],
  'us-to-ae': [
    {
      id: `us-to-ae-tourist-voa30`,
      name: `UAE 30-Day Free Visa on Arrival for US Passport Holders`,
      officialCode: 'VOA-30',
      category: 'tourist',
      icon: '🇦🇪',
      fee: 'FREE ($0 USD on Arrival at DXB / AUH)',
      processing: 'Instant at Dubai / Abu Dhabi Airport Immigration',
      validity: '30 Days (+ 10 Days Grace or Extendable for 30 Days)',
      purpose: `Instant visa-free entry on arrival at Dubai, Abu Dhabi, and Sharjah airports for United States citizens.`,
      docs: [
        'US Passport valid for at least 6 months from arrival date',
        'Confirmed Return or Onward Airline Ticket',
        'Hotel Reservation in Dubai / Abu Dhabi',
      ],
      popular: true,
      highlight: true,
      isActive: true,
    },
    {
      id: `us-to-ae-pr-golden-10y`,
      name: `UAE 10-Year Golden Residency Visa for US Investors & Executives`,
      officialCode: 'GOLDEN-10Y',
      category: 'pr',
      icon: '🏆',
      fee: 'AED 2,800 - AED 4,800 (~$760 - $1,300 USD)',
      processing: '5-10 Working Days (GDRFA Dubai / ICP)',
      validity: '10 Years Renewable (No Sponsor Required)',
      purpose: `Long-term self-sponsored UAE residency for US real estate investors (AED 2M+), entrepreneurs, executives (AED 30,000+/mo), and specialized talents.`,
      docs: [
        'US Passport & UAE Medical Fitness Certificate',
        'Title Deed (AED 2M+ Property) or Equivalency Degree + AED 30k Salary Contract',
        'UAE Health Insurance & Emirates ID Biometrics',
      ],
      popular: true,
      highlight: true,
      isActive: true,
    }
  ],
};

// Curated bilateral corridor counts reflect ONLY verified authored records (never guessed hashes)
export const ROUTE_COUNTS: Record<string, number> = {
  'ae-to-us': CURATED_BILATERAL_VISAS['ae-to-us'].length,
  'us-to-in': CURATED_BILATERAL_VISAS['us-to-in'].length,
  'us-to-ae': CURATED_BILATERAL_VISAS['us-to-ae'].length,
};

function normalizeCountryCode(raw: string | undefined | null): string {
  const cleaned = (raw || '').trim().toLowerCase();
  if (!cleaned) return '';
  if (cleaned === 'uk') return 'gb';
  if (cleaned === 'eu' || cleaned === 'sch' || cleaned === 'schengen') return 'sc';
  return cleaned;
}

function isKnownIsoCode(code: string): boolean {
  return Boolean(code && code.length === 2 && NAME_MAP_249[code]);
}

export function evaluateVisaFreeEligibility(
  fromRaw: string,
  toRaw: string,
  context?: BilateralEligibilityContext
): BilateralEligibilityEvaluation {
  const effectiveOrigin = context?.passportNationality !== undefined ? context.passportNationality : fromRaw;
  const from = normalizeCountryCode(effectiveOrigin);
  const to = normalizeCountryCode(toRaw);

  if (
    !effectiveOrigin ||
    context?.passportNationality?.toUpperCase() === 'UNKNOWN' ||
    context?.passportType === 'UNKNOWN' ||
    !isKnownIsoCode(from) ||
    !isKnownIsoCode(to)
  ) {
    return {
      visaFree: false,
      eVisaEligible: false,
      voaEligible: false,
      eligibilityStatus: 'UNKNOWN',
      scopeNote: 'Passport nationality or passport type is unknown/unspecified; bilateral visa-free status cannot be assumed.',
    };
  }

  // Residence permit in another country does not confer that country's passport visa-free rights
  if (context?.hasThirdCountryResidencePermit) {
    return {
      visaFree: false,
      eVisaEligible: false,
      voaEligible: false,
      eligibilityStatus: 'AWAITING_VERIFICATION',
      scopeNote: 'Entry exemptions depend on passport citizenship rather than third-country residence permits; verify on official embassy portal.',
    };
  }

  // Citizenship return right
  if (from === to) {
    return {
      visaFree: true,
      eVisaEligible: false,
      voaEligible: false,
      eligibilityStatus: 'VERIFIED',
      scopeNote: 'Citizens returning to their country of nationality enter visa-free with a valid national passport.',
    };
  }

  const purpose: EntryPurpose = context?.entryPurpose || 'SHORT_STAY_TOURISM';
  const isShortStay = purpose === 'SHORT_STAY_TOURISM';

  // GCC Freedom of Movement (applies strictly to GCC citizens, not expatriate residents)
  if (GCC_COUNTRIES.has(from) && GCC_COUNTRIES.has(to)) {
    return {
      visaFree: true,
      eVisaEligible: false,
      voaEligible: false,
      eligibilityStatus: 'VERIFIED',
      scopeNote: 'GCC Citizen Mobility Protocol applies strictly to GCC nationals holding valid GCC passports/IDs (excludes non-citizen residents).',
    };
  }

  // EU / EEA / Swiss citizen mobility
  if (EU_EEA_SWISS_MOBILITY.has(from) && EU_EEA_SWISS_MOBILITY.has(to)) {
    const partial = EU_NON_SCHENGEN_COUNTRIES.has(from) || EU_NON_SCHENGEN_COUNTRIES.has(to) || purpose === 'TRANSIT';
    return {
      visaFree: true,
      eVisaEligible: false,
      voaEligible: false,
      eligibilityStatus: partial ? 'PARTIAL_TREATY_SCOPE' : 'VERIFIED',
      scopeNote: partial
        ? 'EU/EEA/Swiss citizen mobility applies to nationals holding valid citizenship documents; Ireland/Cyprus maintain separate border controls outside full Schengen.'
        : 'Freedom of movement applies to EU/EEA/Swiss citizens holding ordinary passports/national IDs.',
    };
  }

  // Purpose guard: visa-free / e-Visa / VOA tables below apply only to short-stay tourism/visitor travel
  if (!isShortStay) {
    return {
      visaFree: false,
      eVisaEligible: false,
      voaEligible: false,
      eligibilityStatus: 'AWAITING_VERIFICATION',
      scopeNote: `Short-stay visa waivers do not grant ${purpose.toLowerCase()} authorization; dedicated national visa or permit verification required.`,
    };
  }

  // India passport verified short-stay rules
  if (from === 'in') {
    const vf = INDIA_VISA_FREE_SET.has(to);
    const ev = vf || INDIA_EVISA_VOA_SET.has(to);
    const voa = INDIA_VOA_VERIFIED_SET.has(to);
    if (vf || ev || voa) {
      return {
        visaFree: vf,
        eVisaEligible: ev,
        voaEligible: voa,
        eligibilityStatus: 'VERIFIED',
        scopeNote: 'Verified short-stay tourism entry rule for Indian ordinary passport holders; verify conditions before travel.',
      };
    }
    return {
      visaFree: false,
      eVisaEligible: false,
      voaEligible: false,
      eligibilityStatus: 'AWAITING_VERIFICATION',
      scopeNote: 'Standard consular or pre-departure visa verification required on destination embassy portal.',
    };
  }

  // Explicitly curated non-India short-stay pairs
  if (from === 'us' && to === 'ae') {
    return {
      visaFree: true,
      eVisaEligible: false,
      voaEligible: true,
      eligibilityStatus: 'VERIFIED',
      scopeNote: 'US ordinary passport holders receive a 30-day visa on arrival in the UAE for short-stay visits.',
    };
  }
  if (from === 'us' && to === 'in') {
    return {
      visaFree: false,
      eVisaEligible: true,
      voaEligible: false,
      eligibilityStatus: 'VERIFIED',
      scopeNote: 'US ordinary passport holders are eligible for India e-Visa for short-stay tourism/business.',
    };
  }
  if (from === 'ae' && to === 'us') {
    return {
      visaFree: false,
      eVisaEligible: false,
      voaEligible: false,
      eligibilityStatus: 'VERIFIED',
      scopeNote: 'UAE citizens require a valid US visa (or applicable US authorization) verified via the US Embassy.',
    };
  }

  // All other arbitrary corridors: fail closed — never guess from destination-only sets or unrelated passport lists
  return {
    visaFree: false,
    eVisaEligible: false,
    voaEligible: false,
    eligibilityStatus: 'AWAITING_VERIFICATION',
    scopeNote: 'Bilateral passport rules for this corridor are awaiting independent source verification; confirm on the destination government portal.',
  };
}

export function isVisaFree(
  fromRaw: string,
  toRaw: string,
  context?: BilateralEligibilityContext
): boolean {
  return evaluateVisaFreeEligibility(fromRaw, toRaw, context).visaFree;
}

export function isEVisaEligible(
  fromRaw: string,
  toRaw: string,
  context?: BilateralEligibilityContext
): boolean {
  return evaluateVisaFreeEligibility(fromRaw, toRaw, context).eVisaEligible;
}

export function isVOAEligible(
  fromRaw: string,
  toRaw: string,
  context?: BilateralEligibilityContext
): boolean {
  return evaluateVisaFreeEligibility(fromRaw, toRaw, context).voaEligible;
}

export function getVisaCount(selectedOrigin: string, destinationCode: string): number {
  const from = normalizeCountryCode(selectedOrigin);
  const to = normalizeCountryCode(destinationCode);

  if (!from || !to || from === to) return 0;

  // 1. India to Any verified destination count
  if (from === 'in') {
    if (!NAME_MAP_249[to] && to !== 'sc') return 0;
    return getLiveVisaCount(to);
  }

  // 2. Curated bilateral corridors only (exact count of genuine curated items)
  const key = `${from}-to-${to}`;
  if (ROUTE_COUNTS[key] !== undefined) {
    return ROUTE_COUNTS[key];
  }

  // 3. Unverified arbitrary corridors return 0 instead of fabricated/hash estimates
  return 0;
}

export function calculateVisaCount(fromRaw: string, toRaw: string): number {
  return getVisaCount(fromRaw, toRaw);
}

export function getBilateralProcessingTime(fromRaw: string, toRaw: string): string {
  const from = normalizeCountryCode(fromRaw);
  const to = normalizeCountryCode(toRaw);
  if (from === 'in' && (NAME_MAP_249[to] || to === 'sc')) {
    return getCountryMeta(to).processing;
  }
  const evaluation = evaluateVisaFreeEligibility(from, to);
  if (from === 'ae' && to === 'us') {
    return '5-12 Days (US Embassy Abu Dhabi / Dubai)';
  }
  if (from === 'us' && to === 'in') {
    return '24-72 Hours e-Visa Online';
  }
  if (from === 'us' && to === 'ae') {
    return 'Instant Visa on Arrival (Short-Stay)';
  }
  if (evaluation.eligibilityStatus === 'VERIFIED' || evaluation.eligibilityStatus === 'PARTIAL_TREATY_SCOPE') {
    if (evaluation.visaFree) return 'Visa-Free / Treaty Entry (Verify Passport Rules)';
    if (evaluation.eVisaEligible) return '2-5 Days Official e-Visa';
  }
  return 'Awaiting Bilateral Verification — Check Official Embassy';
}

export function getBestRouteSummary(fromRaw: string, toRaw: string): string {
  const from = normalizeCountryCode(fromRaw);
  const to = normalizeCountryCode(toRaw);
  const evaluation = evaluateVisaFreeEligibility(from, to);

  if (evaluation.eligibilityStatus === 'UNKNOWN') {
    return 'Passport Nationality Unknown — Consular Verification Required';
  }
  if (evaluation.eligibilityStatus === 'AWAITING_VERIFICATION') {
    return 'Awaiting Bilateral Verification — Verify on Official Embassy Portal';
  }
  if (evaluation.visaFree) {
    return 'Verified Treaty / Short-Stay Visa-Free Entry';
  }
  if (evaluation.eVisaEligible) {
    return 'Official e-Visa Portal Application';
  }
  return 'Official Embassy / Consular Application';
}

const routeEntryCache = new Map<string, AnyToAnyRouteEntry>();

export function getAnyToAnyRouteInfo(fromRaw: string, toRaw: string): AnyToAnyRouteEntry {
  const from = normalizeCountryCode(fromRaw) || 'unknown';
  const to = normalizeCountryCode(toRaw) || 'unknown';
  const cacheKey = `${from}-${to}`;
  const cached = routeEntryCache.get(cacheKey);
  if (cached) return cached;

  const evaluation = evaluateVisaFreeEligibility(from, to);
  const totalVisas = calculateVisaCount(from, to);
  const countsVerified = from === 'in' || Boolean(CURATED_BILATERAL_VISAS[`${from}-to-${to}`]);
  const visaFreeVerified =
    evaluation.eligibilityStatus === 'VERIFIED' ||
    evaluation.eligibilityStatus === 'PARTIAL_TREATY_SCOPE';

  const entry: AnyToAnyRouteEntry = {
    fromCountry: from.toUpperCase(),
    toCountry: to.toUpperCase(),
    fromName: NAME_MAP_249[from] || from.toUpperCase(),
    toName: NAME_MAP_249[to] || to.toUpperCase(),
    fromFlag: FLAG_MAP_249[from] || '🏳️',
    toFlag: FLAG_MAP_249[to] || '🏳️',
    visaFree: evaluation.visaFree,
    eVisaEligible: evaluation.eVisaEligible,
    voaEligible: evaluation.voaEligible,
    totalVisas,
    processing: getBilateralProcessingTime(from, to),
    bestRoute: getBestRouteSummary(from, to),
    eligibilityStatus: evaluation.eligibilityStatus,
    countsVerified,
    visaFreeVerified,
    disclaimer: evaluation.scopeNote,
  };

  routeEntryCache.set(cacheKey, entry);
  return entry;
}

export const TOP_20_FROM_COUNTRIES = [
  'in', 'us', 'gb', 'ae', 'ca', 'au', 'de', 'sg', 'sa', 'qa',
  'kw', 'om', 'my', 'th', 'fr', 'jp', 'cn', 'ru', 'br', 'za', 'kr'
];

export const ANY_TO_ANY_MATRIX: Record<string, Record<string, AnyToAnyRouteEntry>> = new Proxy(
  {},
  {
    get(_target, fromProp: string) {
      if (typeof fromProp !== 'string') return undefined;
      const fromCode = fromProp.toLowerCase();
      return new Proxy(
        {},
        {
          get(_innerTarget, toProp: string) {
            if (typeof toProp !== 'string') return undefined;
            const toCode = toProp.toLowerCase();
            return getAnyToAnyRouteInfo(fromCode, toCode);
          },
        }
      );
    },
  }
);

export function getVisasForAnyRoute(fromRaw: string, toRaw: string, category?: string): any[] {
  const from = normalizeCountryCode(fromRaw);
  const to = normalizeCountryCode(toRaw);

  if (!from || !to || from === to) return [];

  // For India origin, preserve existing BASE_COUNTRY_VISAS records
  if (from === 'in') {
    return category ? getVisasByCategoryFixed(to, category) : getVisasFixed(to);
  }

  // Return strictly curated bilateral records — never synthesize/pad fake visas
  const key = `${from}-to-${to}`;
  const curated = CURATED_BILATERAL_VISAS[key] || [];
  if (category) {
    const catLower = category.toLowerCase();
    return curated.filter((v) => (v.category || '').toLowerCase() === catLower);
  }
  return [...curated];
}
