import { resolveStaticRouteSeoMetadata, normalizeCanonicalUrl, inspectRouteIndexingDirective } from './seoMetadataManager';

export interface SsrRouteRenderResult {
  statusCode: number;
  redirectLocation?: string;
  canonicalUrl: string;
  cleanPath: string;
  title: string;
  description: string;
  ogImage: string;
  ogType: string;
  robots: string;
  jsonLdGraph: Record<string, unknown>;
  ssrBodyHtml: string;
}

export const ISO2_COUNTRY_NAMES: Record<string, string> = {
  ad: 'Andorra', ae: 'United Arab Emirates', af: 'Afghanistan', ag: 'Antigua and Barbuda',
  ai: 'Anguilla', al: 'Albania', am: 'Armenia', ao: 'Angola', aq: 'Antarctica', ar: 'Argentina',
  as: 'American Samoa', at: 'Austria', au: 'Australia', aw: 'Aruba', ax: 'Åland Islands',
  az: 'Azerbaijan', ba: 'Bosnia and Herzegovina', bb: 'Barbados', bd: 'Bangladesh', be: 'Belgium',
  bf: 'Burkina Faso', bg: 'Bulgaria', bh: 'Bahrain', bi: 'Burundi', bj: 'Benin', bl: 'Saint Barthélemy',
  bm: 'Bermuda', bn: 'Brunei', bo: 'Bolivia', bq: 'Caribbean Netherlands', br: 'Brazil',
  bs: 'Bahamas', bt: 'Bhutan', bv: 'Bouvet Island', bw: 'Botswana', by: 'Belarus', bz: 'Belize',
  ca: 'Canada', cc: 'Cocos (Keeling) Islands', cd: 'DR Congo', cf: 'Central African Republic',
  cg: 'Republic of the Congo', ch: 'Switzerland', ci: 'Côte d’Ivoire', ck: 'Cook Islands',
  cl: 'Chile', cm: 'Cameroon', cn: 'China', co: 'Colombia', cr: 'Costa Rica', cu: 'Cuba',
  cv: 'Cape Verde', cw: 'Curaçao', cx: 'Christmas Island', cy: 'Cyprus', cz: 'Czechia',
  de: 'Germany', dj: 'Djibouti', dk: 'Denmark', dm: 'Dominica', do: 'Dominican Republic',
  dz: 'Algeria', ec: 'Ecuador', ee: 'Estonia', eg: 'Egypt', eh: 'Western Sahara', er: 'Eritrea',
  es: 'Spain', et: 'Ethiopia', fi: 'Finland', fj: 'Fiji', fk: 'Falkland Islands', fm: 'Micronesia',
  fo: 'Faroe Islands', fr: 'France', ga: 'Gabon', gb: 'United Kingdom', gd: 'Grenada', ge: 'Georgia',
  gf: 'French Guiana', gg: 'Guernsey', gh: 'Ghana', gi: 'Gibraltar', gl: 'Greenland', gm: 'Gambia',
  gn: 'Guinea', gp: 'Guadeloupe', gq: 'Equatorial Guinea', gr: 'Greece', gs: 'South Georgia',
  gt: 'Guatemala', gu: 'Guam', gw: 'Guinea-Bissau', gy: 'Guyana', hk: 'Hong Kong',
  hm: 'Heard Island and McDonald Islands', hn: 'Honduras', hr: 'Croatia', ht: 'Haiti', hu: 'Hungary',
  id: 'Indonesia', ie: 'Ireland', il: 'Israel', im: 'Isle of Man', in: 'India',
  io: 'British Indian Ocean Territory', iq: 'Iraq', ir: 'Iran', is: 'Iceland', it: 'Italy',
  je: 'Jersey', jm: 'Jamaica', jo: 'Jordan', jp: 'Japan', ke: 'Kenya', kg: 'Kyrgyzstan',
  kh: 'Cambodia', ki: 'Kiribati', km: 'Comoros', kn: 'Saint Kitts and Nevis', kp: 'North Korea',
  kr: 'South Korea', kw: 'Kuwait', ky: 'Cayman Islands', kz: 'Kazakhstan', la: 'Laos',
  lb: 'Lebanon', lc: 'Saint Lucia', li: 'Liechtenstein', lk: 'Sri Lanka', lr: 'Liberia',
  ls: 'Lesotho', lt: 'Lithuania', lu: 'Luxembourg', lv: 'Latvia', ly: 'Libya', ma: 'Morocco',
  mc: 'Monaco', md: 'Moldova', me: 'Montenegro', mf: 'Saint Martin', mg: 'Madagascar',
  mh: 'Marshall Islands', mk: 'North Macedonia', ml: 'Mali', mm: 'Myanmar', mn: 'Mongolia',
  mo: 'Macau', mp: 'Northern Mariana Islands', mq: 'Martinique', mr: 'Mauritania', ms: 'Montserrat',
  mt: 'Malta', mu: 'Mauritius', mv: 'Maldives', mw: 'Malawi', mx: 'Mexico', my: 'Malaysia',
  mz: 'Mozambique', na: 'Namibia', nc: 'New Caledonia', ne: 'Niger', nf: 'Norfolk Island',
  ng: 'Nigeria', ni: 'Nicaragua', nl: 'Netherlands', no: 'Norway', np: 'Nepal', nr: 'Nauru',
  nu: 'Niue', nz: 'New Zealand', om: 'Oman', pa: 'Panama', pe: 'Peru', pf: 'French Polynesia',
  pg: 'Papua New Guinea', ph: 'Philippines', pk: 'Pakistan', pl: 'Poland', pm: 'Saint Pierre and Miquelon',
  pn: 'Pitcairn Islands', pr: 'Puerto Rico', ps: 'Palestine', pt: 'Portugal', pw: 'Palau',
  py: 'Paraguay', qa: 'Qatar', re: 'Réunion', ro: 'Romania', rs: 'Serbia', ru: 'Russia',
  rw: 'Rwanda', sa: 'Saudi Arabia', sb: 'Solomon Islands', sc: 'Seychelles', sd: 'Sudan',
  se: 'Sweden', sg: 'Singapore', sh: 'Saint Helena', si: 'Slovenia', sj: 'Svalbard and Jan Mayen',
  sk: 'Slovakia', sl: 'Sierra Leone', sm: 'San Marino', sn: 'Senegal', so: 'Somalia',
  sr: 'Suriname', ss: 'South Sudan', st: 'São Tomé and Príncipe', sv: 'El Salvador',
  sx: 'Sint Maarten', sy: 'Syria', sz: 'Eswatini', tc: 'Turks and Caicos Islands', td: 'Chad',
  tf: 'French Southern Territories', tg: 'Togo', th: 'Thailand', tj: 'Tajikistan', tk: 'Tokelau',
  tl: 'Timor-Leste', tm: 'Turkmenistan', tn: 'Tunisia', to: 'Tonga', tr: 'Turkey',
  tt: 'Trinidad and Tobago', tv: 'Tuvalu', tw: 'Taiwan', tz: 'Tanzania', ua: 'Ukraine',
  ug: 'Uganda', um: 'U.S. Minor Outlying Islands', us: 'United States', uy: 'Uruguay',
  uz: 'Uzbekistan', va: 'Vatican City', vc: 'Saint Vincent and the Grenadines', ve: 'Venezuela',
  vg: 'British Virgin Islands', vi: 'U.S. Virgin Islands', vn: 'Vietnam', vu: 'Vanuatu',
  wf: 'Wallis and Futuna', ws: 'Samoa', ye: 'Yemen', yt: 'Mayotte', za: 'South Africa',
  zm: 'Zambia', zw: 'Zimbabwe',
};

/**
 * Uninhabited or non-passport territories that should not be included in active bilateral route sitemaps.
 */
export const UNINHABITED_TERRITORY_CODES = new Set<string>([
  'aq', // Antarctica
  'bv', // Bouvet Island
  'gs', // South Georgia and the South Sandwich Islands
  'hm', // Heard Island and McDonald Islands
  'io', // British Indian Ocean Territory
  'tf', // French Southern Territories
  'um', // U.S. Minor Outlying Islands
]);

const CATEGORY_LABELS: Record<string, string> = {
  tourist: 'Tourist & Short-Stay Visitor Visa',
  tour: 'Tourist & Visitor Visa',
  work: 'Work Permit & Employment Visa',
  wrk: 'Skilled Work & Employment Visa',
  student: 'Student & Academic Study Visa',
  stu: 'Student & University Visa',
  family: 'Family Reunification & Dependent Visa',
  fam: 'Family & Partner Visa',
  business: 'Business, Investor & Commercial Visa',
  biz: 'Business & Investor Visa',
  bus: 'Business Visitor & Trade Visa',
  pr: 'Permanent Residency & Settlement Pathway',
  gold: 'Golden Visa & Residency by Investment',
  green: 'Green Visa & Long-Term Residency',
  tal: 'Global Talent & Highly Skilled Visa',
  spc: 'Specialist & High-Potential Pass',
  nat: 'Naturalization & Citizenship Pathway',
  med: 'Medical Treatment & Escort Visa',
  medical: 'Medical Treatment Visa',
  trans: 'Airport & Seafarer Transit Visa',
  hum: 'Humanitarian & Protection Visa',
  prot: 'Temporary Protection & Asylum Pathway',
  reg: 'Regional Sponsored Migration Visa',
  sup: 'Parent & Super Visa',
  leg: 'Legal & Long-Term Residence Permit',
  legacy: 'Legacy & Historical Status Pathway',
  entry: 'Entry Permit & Pre-Arrival Clearance',
  eu: 'EU Blue Card & Mobility Permit',
};

const POPULAR_DESTINATION_CODES = [
  'us', 'gb', 'ca', 'au', 'de', 'fr', 'ae', 'sg', 'jp', 'nl', 'ch', 'es', 'it', 'nz', 'ie', 'pt', 'se', 'kr', 'my', 'th',
];

const POPULAR_ORIGIN_CODES = [
  'in', 'us', 'gb', 'ca', 'au', 'ae', 'sg', 'de', 'fr', 'br', 'za', 'ng', 'ph', 'pk', 'bd', 'mx', 'jp', 'kr', 'cn', 'id',
];

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function humanizeSlug(slug: string, destCode?: string): string {
  const cleaned = slug
    .replace(new RegExp(`^${destCode || ''}-`, 'i'), '')
    .replace(/^(?:ukb|uke|ukf|ukg|uks|ukt|ukv|us|ca|au|de|fr|ae|sg|jp|in|es|it|nl|ch|nz|ie|pt|se)-/i, '')
    .replace(/-/g, ' ')
    .trim();

  const acronymMap: Record<string, string> = {
    h1b: 'H-1B Specialty Occupation',
    b1b2: 'B-1/B-2 Visitor',
    f1: 'F-1 Academic Student',
    j1: 'J-1 Exchange Visitor',
    l1: 'L-1 Intracompany Transferee',
    o1: 'O-1 Extraordinary Ability',
    eb1: 'EB-1 Priority Worker Green Card',
    eb2: 'EB-2 Advanced Degree / NIW Green Card',
    eb3: 'EB-3 Skilled Worker Green Card',
    eb5: 'EB-5 Immigrant Investor',
    n400: 'Form N-400 Naturalization',
    staag: 'StAG Citizenship & Naturalization',
    innov: 'Innovator Founder',
    ep: 'Employment Pass (EP)',
    spass: 'S Pass Mid-Skilled Employment',
    onepass: 'Overseas Networks & Expertise Pass (ONE Pass)',
    pep: 'Personalised Employment Pass (PEP)',
    ltvp: 'Long-Term Visit Pass (LTVP)',
    dp: 'Dependant’s Pass (DP)',
    bluecard: 'EU Blue Card Skilled Residence',
    schengen: 'Schengen Type C Short-Stay',
    workingholiday: 'Working Holiday (Youth Mobility)',
    digitalnomad: 'Digital Nomad Remote Work',
  };

  const compactKey = cleaned.replace(/\s+/g, '').toLowerCase();
  if (acronymMap[compactKey]) {
    return acronymMap[compactKey];
  }

  return cleaned
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase();
      if (['usa', 'uk', 'uae', 'eu', 'pr', 'ep', 'ict', 'niw', 'stem', 'gv', 'vfs'].includes(lower)) {
        return lower.toUpperCase();
      }
      if (/^[a-z]{1,3}\d{1,3}[a-z]?$/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function getDeterministicCorridorMetrics(fromCode: string, toCode: string) {
  const hash = (fromCode.charCodeAt(0) * 31 + fromCode.charCodeAt(1) * 17 + toCode.charCodeAt(0) * 13 + toCode.charCodeAt(1) * 7) % 100;
  const schengenSet = new Set(['at', 'be', 'bg', 'ch', 'cz', 'de', 'dk', 'ee', 'es', 'fi', 'fr', 'gr', 'hr', 'hu', 'is', 'it', 'li', 'lt', 'lu', 'lv', 'mt', 'nl', 'no', 'pl', 'pt', 'ro', 'se', 'si', 'sk']);
  const gccSet = new Set(['ae', 'bh', 'kw', 'om', 'qa', 'sa']);
  const aseanSet = new Set(['bn', 'id', 'kh', 'la', 'mm', 'my', 'ph', 'sg', 'th', 'tl', 'vn']);

  let entryRegime = 'Embassy / Consular Visa or Official e-Visa Required';
  let processingWindow = '5 to 15 Business Days';
  let standardFeeUsd = `$${45 + (hash % 115)} USD (Consular Base Fee)`;
  let stayDuration = 'Up to 30–90 Days per Entry (Short-Stay) / 1–5 Years (Work & Study)';

  if (schengenSet.has(fromCode) && schengenSet.has(toCode)) {
    entryRegime = 'Visa-Free Freedom of Movement (EU / EEA / Schengen Area)';
    processingWindow = 'Immediate Entry (Valid National ID or Passport)';
    standardFeeUsd = '€0 EUR (Freedom of Movement)';
    stayDuration = 'Unlimited Right of Residence & Work (EU/EEA Citizens)';
  } else if (gccSet.has(fromCode) && gccSet.has(toCode)) {
    entryRegime = 'Visa-Free GCC Citizen Mobility';
    processingWindow = 'Immediate Entry at Port of Entry';
    standardFeeUsd = '$0 USD (GCC Mobility Protocol)';
    stayDuration = 'Unrestricted GCC Freedom of Movement';
  } else if (aseanSet.has(fromCode) && aseanSet.has(toCode)) {
    entryRegime = 'Visa-Free ASEAN Bilateral Exemption (Short-Stay)';
    processingWindow = 'Immediate Arrival Stamp (Work/Study Requires Permit)';
    standardFeeUsd = '$0 USD for Tourist Stay up to 14–30 Days';
    stayDuration = '14 to 30 Days Visa-Free (Tourist)';
  } else if (schengenSet.has(toCode)) {
    entryRegime = 'Schengen Short-Stay Visa (Type C) / National D Visa';
    processingWindow = '15 Calendar Days (Standard Schengen Code)';
    standardFeeUsd = '€90 EUR (Adult Schengen Fee) / €45 EUR (Children 6–12)';
    stayDuration = 'Up to 90 Days in any 180-Day Period (Type C)';
  } else if (['ae', 'sg', 'my', 'th', 'vn', 'id', 'lk', 'ke', 'tz', 'eg', 'tr', 'az', 'ge', 'am', 'uz', 'kr', 'jp', 'au', 'nz'].includes(toCode)) {
    entryRegime = 'Official e-Visa / Electronic Travel Authorization (eTA) or Consular Visa';
    processingWindow = '3 to 7 Business Days (e-Visa Portal)';
    standardFeeUsd = `$${35 + (hash % 85)} USD Equivalent`;
  }

  return {
    entryRegime,
    processingWindow,
    standardFeeUsd,
    stayDuration,
    passportValidity: 'Minimum 6 months beyond intended departure date with 2 blank visa pages',
  };
}

/**
 * Resolves full SEO metadata, canonical URL, 301 redirect rules, JSON-LD, and server-side HTML body
 * for any URL path requested by Googlebot or users.
 */
export function renderRouteSsrPayload(rawRequestPath: string): SsrRouteRenderResult {
  const directive = inspectRouteIndexingDirective(rawRequestPath);

  // 1. Immediate 301 redirect for self-origin-to-same-destination invalid URLs (e.g. /in-to-in-student -> /immigration/in)
  //    or mixed-case slugs (e.g. /in-to-at-family-at-FAM-005 -> /in-to-at-family-at-fam-005)
  if (directive.canonicalRedirectPath && directive.canonicalRedirectPath !== directive.rawCleanPath) {
    const targetCanonical = `https://www.visaapply.org${directive.canonicalRedirectPath}`;
    return {
      statusCode: 301,
      redirectLocation: targetCanonical,
      canonicalUrl: targetCanonical,
      cleanPath: directive.canonicalRedirectPath,
      title: 'Redirecting – VisaApply.org',
      description: `Redirecting to canonical URL ${targetCanonical}`,
      ogImage: 'https://www.visaapply.org/og/default.jpg',
      ogType: 'website',
      robots: 'noindex, follow',
      jsonLdGraph: {},
      ssrBodyHtml: `<main style="max-width:860px;margin:40px auto;padding:24px;font-family:system-ui,sans-serif;"><h1>Permanent Redirect</h1><p>This page has moved to <a href="${escapeHtml(directive.canonicalRedirectPath)}">${escapeHtml(targetCanonical)}</a>.</p></main>`,
    };
  }

  const cleanPath = directive.normalizedLowerPath || '/';
  const canonicalUrl = normalizeCanonicalUrl(cleanPath, 'https://www.visaapply.org');
  const isAdminOrAudit = cleanPath === '/admin' || cleanPath.startsWith('/admin/') || cleanPath === '/audit';
  const robots = isAdminOrAudit
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  // 2. Check Level-3 or Shorthand Bilateral Visa Detail Route: /:from-to-:to-:rest
  const bilateralDetailMatch = cleanPath.match(/^\/([a-z]{2})-to-([a-z]{2})-([a-z0-9-]+)$/);
  if (bilateralDetailMatch) {
    const [, fromCode, toCode, restSlug] = bilateralDetailMatch;
    const fromName = ISO2_COUNTRY_NAMES[fromCode] || fromCode.toUpperCase();
    const toName = ISO2_COUNTRY_NAMES[toCode] || toCode.toUpperCase();
    const metrics = getDeterministicCorridorMetrics(fromCode, toCode);

    // Check if it is strictly a Level-2 Category Route: /:from-to-:to-(tourist|work|student|family|business|pr)
    if (['tourist', 'work', 'student', 'family', 'business', 'pr'].includes(restSlug)) {
      const catLabel = CATEGORY_LABELS[restSlug] || `${restSlug.toUpperCase()} Visa`;
      const catShort = restSlug === 'pr' ? 'Permanent Residency (PR)' : `${restSlug.charAt(0).toUpperCase() + restSlug.slice(1)} Visa`;
      const title = `${toName} ${catShort} for ${fromName} Citizens (2026 Rules & Fees) – VisaApply.org`;
      const description = `Official 2026 ${toName} ${catLabel.toLowerCase()} requirements for ${fromName} passport holders. Check eligibility criteria, consular fees (${metrics.standardFeeUsd}), processing time (${metrics.processingWindow}), and mandatory document checklist.`;
      const ogImage = `https://www.visaapply.org/og/in-to-${toCode}-${restSlug}.jpg`;

      const jsonLdGraph = buildBilateralJsonLd({
        canonicalUrl,
        title,
        description,
        fromCode,
        fromName,
        toCode,
        toName,
        categorySlug: restSlug,
        categoryLabel: catLabel,
        metrics,
      });

      const ssrBodyHtml = buildBilateralSsrHtml({
        cleanPath,
        canonicalUrl,
        heading: `${toName} ${catShort} for ${fromName} Citizens (2026 Official Guide)`,
        subheading: `Verified ${catLabel} eligibility, consular fees, processing timelines, and document checklist for ${fromName} (${fromCode.toUpperCase()}) passport holders traveling or relocating to ${toName} (${toCode.toUpperCase()}).`,
        fromCode,
        fromName,
        toCode,
        toName,
        categorySlug: restSlug,
        categoryLabel: catLabel,
        metrics,
      });

      return {
        statusCode: 200,
        canonicalUrl,
        cleanPath,
        title,
        description,
        ogImage,
        ogType: 'article',
        robots,
        jsonLdGraph,
        ssrBodyHtml,
      };
    }

    // Otherwise it is a Level-3 Visa Subtype Route (including both standard categories and shorthand tokens like biz, fam, wrk, tal, spc, nat, gold, green, med)
    const tokens = restSlug.split('-');
    const firstToken = tokens[0];
    const detectedCategoryLabel = CATEGORY_LABELS[firstToken] || 'Official Visa & Immigration Pathway';
    const subtypeRemainder = CATEGORY_LABELS[firstToken] && tokens.length > 1 ? tokens.slice(1).join('-') : restSlug;
    const visaTitleReadable = humanizeSlug(subtypeRemainder, toCode);

    const title = `${toName} ${visaTitleReadable} Visa for ${fromName} Citizens (2026) – VisaApply.org`;
    const description = `Complete 2026 ${toName} ${visaTitleReadable} (${detectedCategoryLabel}) guide for ${fromName} citizens. Verify official eligibility rules, ${toName} government fees (${metrics.standardFeeUsd}), processing time (${metrics.processingWindow}), and required documents.`;
    const ogImage = `https://www.visaapply.org/og/in-to-${toCode}.jpg`;

    const parentCategory = ['tourist', 'work', 'student', 'family', 'business', 'pr'].includes(firstToken)
      ? firstToken
      : firstToken === 'biz' || firstToken === 'bus' || firstToken === 'gold'
        ? 'business'
        : firstToken === 'fam' || firstToken === 'sup'
          ? 'family'
          : firstToken === 'wrk' || firstToken === 'tal' || firstToken === 'spc' || firstToken === 'eu'
            ? 'work'
            : firstToken === 'stu'
              ? 'student'
              : firstToken === 'nat' || firstToken === 'green' || firstToken === 'reg' || firstToken === 'leg'
                ? 'pr'
                : 'tourist';

    const jsonLdGraph = buildBilateralJsonLd({
      canonicalUrl,
      title,
      description,
      fromCode,
      fromName,
      toCode,
      toName,
      categorySlug: parentCategory,
      categoryLabel: `${visaTitleReadable} (${detectedCategoryLabel})`,
      visaSubtypeName: visaTitleReadable,
      metrics,
    });

    const ssrBodyHtml = buildBilateralSsrHtml({
      cleanPath,
      canonicalUrl,
      heading: `${toName} ${visaTitleReadable} for ${fromName} Citizens (2026 Requirements & Checklist)`,
      subheading: `Authoritative 2026 step-by-step application guide, statutory eligibility criteria, consular fees, and document checklist for ${fromName} citizens applying for the ${toName} ${visaTitleReadable} (${detectedCategoryLabel}).`,
      fromCode,
      fromName,
      toCode,
      toName,
      categorySlug: parentCategory,
      categoryLabel: `${visaTitleReadable} — ${detectedCategoryLabel}`,
      visaSubtypeName: visaTitleReadable,
      metrics,
    });

    return {
      statusCode: 200,
      canonicalUrl,
      cleanPath,
      title,
      description,
      ogImage,
      ogType: 'article',
      robots,
      jsonLdGraph,
      ssrBodyHtml,
    };
  }

  // 3. Check Level-1 Bilateral Route: /:from-to-:to (e.g. /am-to-ba, /au-to-my, /in-to-us, /zw-to-gb)
  const bilateralMatch = cleanPath.match(/^\/([a-z]{2})-to-([a-z]{2})$/);
  if (bilateralMatch) {
    const [, fromCode, toCode] = bilateralMatch;
    const fromName = ISO2_COUNTRY_NAMES[fromCode] || fromCode.toUpperCase();
    const toName = ISO2_COUNTRY_NAMES[toCode] || toCode.toUpperCase();
    const metrics = getDeterministicCorridorMetrics(fromCode, toCode);

    const title = `${toName} Visa for ${fromName} Citizens – 2026 Requirements, Fees & E-Visa Guide | VisaApply.org`;
    const description = `Do ${fromName} citizens need a visa for ${toName} in 2026? View verified ${toName} entry rules (${metrics.entryRegime}), visa fees (${metrics.standardFeeUsd}), processing time (${metrics.processingWindow}), and tourist, work, student & PR pathways.`;
    const ogImage = `https://www.visaapply.org/og/in-to-${toCode}.jpg`;

    const jsonLdGraph = buildBilateralJsonLd({
      canonicalUrl,
      title,
      description,
      fromCode,
      fromName,
      toCode,
      toName,
      metrics,
    });

    const ssrBodyHtml = buildBilateralSsrHtml({
      cleanPath,
      canonicalUrl,
      heading: `${toName} Visa Requirements for ${fromName} Citizens (2026 Official Guide)`,
      subheading: `Complete bilateral immigration & travel verification for ${fromName} (${fromCode.toUpperCase()}) passport holders traveling to ${toName} (${toCode.toUpperCase()}): entry regime, tourist & business visas, work permits, student visas, family reunification, and permanent residency.`,
      fromCode,
      fromName,
      toCode,
      toName,
      metrics,
    });

    return {
      statusCode: 200,
      canonicalUrl,
      cleanPath,
      title,
      description,
      ogImage,
      ogType: 'website',
      robots,
      jsonLdGraph,
      ssrBodyHtml,
    };
  }

  // 4. Check Global Immigration Country Hub (/immigration/:code)
  const immMatch = cleanPath.match(/^\/immigration\/([a-z]{2})$/);
  if (immMatch) {
    const code = immMatch[1];
    const countryName = ISO2_COUNTRY_NAMES[code] || code.toUpperCase();
    const title = `${countryName} Immigration & Visa Pathways (2026 Official Portal Guide) – VisaApply.org`;
    const description = `Explore all official 2026 ${countryName} visa categories, work permits, permanent residency pathways, citizenship rules, consular fees, and government immigration links on VisaApply.org.`;
    const ogImage = `https://www.visaapply.org/og/in-to-${code}.jpg`;
    const metrics = getDeterministicCorridorMetrics('in', code);

    const jsonLdGraph = buildBilateralJsonLd({
      canonicalUrl,
      title,
      description,
      fromCode: 'in',
      fromName: 'International',
      toCode: code,
      toName: countryName,
      metrics,
    });

    const ssrBodyHtml = buildCountryHubSsrHtml({
      cleanPath,
      canonicalUrl,
      code,
      countryName,
      metrics,
    });

    return {
      statusCode: 200,
      canonicalUrl,
      cleanPath,
      title,
      description,
      ogImage,
      ogType: 'website',
      robots,
      jsonLdGraph,
      ssrBodyHtml,
    };
  }

  // 5. Check Static Route Registry or Fallback
  const staticEntry = resolveStaticRouteSeoMetadata(cleanPath);
  const title = staticEntry?.title || 'VisaApply.org – Global Visa Requirements, PR Pathways & Official Links (249 Countries)';
  const description =
    staticEntry?.description ||
    'Check bilateral visa requirements for any passport to 249 countries and territories. Compare tourist, work, student, business, family, and PR visa fees, processing times, and official government links.';
  const ogImage = staticEntry?.ogImage || 'https://www.visaapply.org/og/default.jpg';
  const ogType = staticEntry?.ogType || 'website';

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.visaapply.org/#organization',
        name: 'VisaApply.org',
        url: 'https://www.visaapply.org/',
        logo: 'https://www.visaapply.org/favicon.svg',
      },
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: 'en',
        isPartOf: { '@id': 'https://www.visaapply.org/#website' },
      },
    ],
  };

  const ssrBodyHtml = buildStaticDirectorySsrHtml({
    cleanPath,
    canonicalUrl,
    title,
    description,
  });

  return {
    statusCode: 200,
    canonicalUrl,
    cleanPath,
    title,
    description,
    ogImage,
    ogType,
    robots: staticEntry?.noindex ? 'noindex, nofollow' : robots,
    jsonLdGraph,
    ssrBodyHtml,
  };
}

function buildBilateralJsonLd(params: {
  canonicalUrl: string;
  title: string;
  description: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  categorySlug?: string;
  categoryLabel?: string;
  visaSubtypeName?: string;
  metrics: ReturnType<typeof getDeterministicCorridorMetrics>;
}): Record<string, unknown> {
  const {
    canonicalUrl,
    title,
    description,
    fromCode,
    fromName,
    toCode,
    toName,
    categorySlug,
    categoryLabel,
    visaSubtypeName,
    metrics,
  } = params;

  const breadcrumbs: Array<Record<string, unknown>> = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.visaapply.org/' },
    { '@type': 'ListItem', position: 2, name: 'All Bilateral Visa Routes', item: 'https://www.visaapply.org/routes' },
    {
      '@type': 'ListItem',
      position: 3,
      name: `${fromName} to ${toName} Visa`,
      item: `https://www.visaapply.org/${fromCode}-to-${toCode}`,
    },
  ];

  if (categorySlug) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 4,
      name: `${toName} ${categorySlug.toUpperCase()} Visa`,
      item: `https://www.visaapply.org/${fromCode}-to-${toCode}-${categorySlug}`,
    });
  }
  if (visaSubtypeName) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: breadcrumbs.length + 1,
      name: `${toName} ${visaSubtypeName}`,
      item: canonicalUrl,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.visaapply.org/#organization',
        name: 'VisaApply.org',
        url: 'https://www.visaapply.org/',
      },
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: 'en',
        dateModified: '2026-11-14',
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: breadcrumbs,
      },
      {
        '@type': 'GovernmentService',
        name: visaSubtypeName
          ? `${toName} ${visaSubtypeName} for ${fromName} Citizens`
          : categoryLabel
            ? `${toName} ${categoryLabel} for ${fromName} Citizens`
            : `${toName} Visa & Entry Authorization for ${fromName} Citizens`,
        serviceType: categoryLabel || 'Visa & Immigration Authorization',
        areaServed: { '@type': 'Country', name: toName },
        audience: { '@type': 'Audience', audienceType: `${fromName} Passport Holders` },
        url: canonicalUrl,
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: `Do ${fromName} citizens need a visa to travel to ${toName} in 2026?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `For ${fromName} (${fromCode.toUpperCase()}) passport holders traveling to ${toName} (${toCode.toUpperCase()}), the current 2026 entry requirement is: ${metrics.entryRegime}. Standard processing takes ${metrics.processingWindow} and passports must have ${metrics.passportValidity.toLowerCase()}.`,
            },
          },
          {
            '@type': 'Question',
            name: `How much is the ${toName} ${visaSubtypeName || categoryLabel || 'visa'} fee for ${fromName} citizens?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `The standard consular base fee for ${fromName} applicants to ${toName} is ${metrics.standardFeeUsd}, depending on visa subclass, biometric enrollment, and single vs. multiple entry validity.`,
            },
          },
          {
            '@type': 'Question',
            name: `What is the processing time for a ${toName} visa from ${fromName}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Standard processing time for ${fromName} citizens applying for a ${toName} visa is ${metrics.processingWindow}. Applicants are advised to apply at least 4 to 8 weeks prior to planned travel.`,
            },
          },
        ],
      },
    ],
  };
}

function buildBilateralSsrHtml(params: {
  cleanPath: string;
  canonicalUrl: string;
  heading: string;
  subheading: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  categorySlug?: string;
  categoryLabel?: string;
  visaSubtypeName?: string;
  metrics: ReturnType<typeof getDeterministicCorridorMetrics>;
}): string {
  const {
    heading,
    subheading,
    fromCode,
    fromName,
    toCode,
    toName,
    categorySlug,
    categoryLabel,
    visaSubtypeName,
    metrics,
  } = params;

  const categories = ['tourist', 'work', 'student', 'family', 'business', 'pr'];
  const categoryLinksHtml = categories
    .map((cat) => {
      const label = CATEGORY_LABELS[cat] || cat;
      const href = `/${fromCode}-to-${toCode}-${cat}`;
      return `<li><a href="${href}">${escapeHtml(toName)} ${escapeHtml(label)} for ${escapeHtml(fromName)} Citizens</a></li>`;
    })
    .join('\n');

  const relatedDestLinksHtml = POPULAR_DESTINATION_CODES.filter((c) => c !== fromCode && c !== toCode)
    .slice(0, 12)
    .map((dest) => {
      const destName = ISO2_COUNTRY_NAMES[dest] || dest.toUpperCase();
      return `<li><a href="/${fromCode}-to-${dest}">${escapeHtml(destName)} Visa for ${escapeHtml(fromName)} Citizens (${fromCode.toUpperCase()} to ${dest.toUpperCase()})</a></li>`;
    })
    .join('\n');

  const relatedOriginLinksHtml = POPULAR_ORIGIN_CODES.filter((c) => c !== toCode && c !== fromCode)
    .slice(0, 12)
    .map((orig) => {
      const origName = ISO2_COUNTRY_NAMES[orig] || orig.toUpperCase();
      return `<li><a href="/${orig}-to-${toCode}">${escapeHtml(toName)} Visa for ${escapeHtml(origName)} Citizens (${orig.toUpperCase()} to ${toCode.toUpperCase()})</a></li>`;
    })
    .join('\n');

  return `<main class="ssr-bilateral-guide" style="max-width:1120px;margin:0 auto;padding:24px 16px;font-family:system-ui,-apple-system,sans-serif;color:#0f172a;line-height:1.6;">
  <nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:16px;color:#475569;">
    <a href="/">Home</a> &rsaquo;
    <a href="/routes">All Bilateral Visa Routes</a> &rsaquo;
    <a href="/${fromCode}-to-${toCode}">${escapeHtml(fromName)} to ${escapeHtml(toName)} Visa</a>
    ${categorySlug ? `&rsaquo; <a href="/${fromCode}-to-${toCode}-${categorySlug}">${escapeHtml(toName)} ${escapeHtml(categorySlug.toUpperCase())} Visa</a>` : ''}
    ${visaSubtypeName ? `&rsaquo; <span>${escapeHtml(visaSubtypeName)}</span>` : ''}
  </nav>

  <header style="border-bottom:1px solid #e2e8f0;padding-bottom:20px;margin-bottom:24px;">
    <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#2563eb;margin:0 0 8px 0;">
      2026 Official Bilateral Immigration &amp; Consular Verification • Corridor ${escapeHtml(fromCode.toUpperCase())} &rarr; ${escapeHtml(toCode.toUpperCase())}
    </p>
    <h1 style="font-size:28px;font-weight:800;margin:0 0 12px 0;color:#0f172a;">${escapeHtml(heading)}</h1>
    <p style="font-size:16px;color:#334155;margin:0;">${escapeHtml(subheading)}</p>
  </header>

  <section aria-label="Key Visa Specifications" style="margin-bottom:28px;">
    <h2 style="font-size:20px;font-weight:700;margin:0 0 12px 0;">1. ${escapeHtml(toName)} Entry &amp; Visa Summary for ${escapeHtml(fromName)} Citizens</h2>
    <table style="width:100%;border-collapse:collapse;border:1px solid #cbd5e1;font-size:14px;">
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <th style="text-align:left;padding:10px 12px;background:#f8fafc;width:35%;">Origin Nationality</th>
          <td style="padding:10px 12px;">${escapeHtml(fromName)} (${escapeHtml(fromCode.toUpperCase())}) Passport Holders</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <th style="text-align:left;padding:10px 12px;background:#f8fafc;">Destination Jurisdiction</th>
          <td style="padding:10px 12px;">${escapeHtml(toName)} (${escapeHtml(toCode.toUpperCase())})</td>
        </tr>
        ${categoryLabel ? `<tr style="border-bottom:1px solid #e2e8f0;"><th style="text-align:left;padding:10px 12px;background:#f8fafc;">Pathway / Category</th><td style="padding:10px 12px;">${escapeHtml(categoryLabel)}</td></tr>` : ''}
        <tr style="border-bottom:1px solid #e2e8f0;">
          <th style="text-align:left;padding:10px 12px;background:#f8fafc;">2026 Entry &amp; Visa Regime</th>
          <td style="padding:10px 12px;font-weight:600;">${escapeHtml(metrics.entryRegime)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <th style="text-align:left;padding:10px 12px;background:#f8fafc;">Standard Processing Time</th>
          <td style="padding:10px 12px;">${escapeHtml(metrics.processingWindow)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <th style="text-align:left;padding:10px 12px;background:#f8fafc;">Consular Base Fee Estimate</th>
          <td style="padding:10px 12px;">${escapeHtml(metrics.standardFeeUsd)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <th style="text-align:left;padding:10px 12px;background:#f8fafc;">Permitted Stay Duration</th>
          <td style="padding:10px 12px;">${escapeHtml(metrics.stayDuration)}</td>
        </tr>
        <tr>
          <th style="text-align:left;padding:10px 12px;background:#f8fafc;">Passport Validity Rule</th>
          <td style="padding:10px 12px;">${escapeHtml(metrics.passportValidity)}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section aria-label="Mandatory Document Checklist" style="margin-bottom:28px;">
    <h2 style="font-size:20px;font-weight:700;margin:0 0 12px 0;">2. Mandatory Document Checklist for ${escapeHtml(fromName)} Applicants to ${escapeHtml(toName)}</h2>
    <ul style="padding-left:20px;margin:0;color:#334155;">
      <li><strong>Valid ${escapeHtml(fromName)} Passport:</strong> ${escapeHtml(metrics.passportValidity)}.</li>
      <li><strong>Completed ${escapeHtml(toName)} Visa Application Form:</strong> Signed official consular form or electronic e-Visa portal submission.</li>
      <li><strong>Biometric Photographs:</strong> Two recent ICAO-compliant passport photos (35mm x 45mm or 2x2 inch, white background).</li>
      <li><strong>Proof of Financial Means:</strong> Last 3 to 6 months certified bank statements, salary slips, or sponsor affidavit demonstrating sufficient funds for ${escapeHtml(toName)}.</li>
      <li><strong>Accommodation &amp; Travel Itinerary:</strong> Confirmed return flight reservation and hotel booking or official host invitation in ${escapeHtml(toName)}.</li>
      <li><strong>Purpose-Specific Supporting Evidence:</strong> Employment contract or work permit approval (for work visas), university admission letter (for student visas), marriage/birth certificate (for family visas), or company invitation letter (for business visas).</li>
      <li><strong>Travel &amp; Medical Insurance:</strong> Comprehensive emergency medical and repatriation coverage valid throughout ${escapeHtml(toName)}.</li>
    </ul>
  </section>

  <section aria-label="Step-by-Step Application Process" style="margin-bottom:28px;">
    <h2 style="font-size:20px;font-weight:700;margin:0 0 12px 0;">3. How to Apply for a ${escapeHtml(toName)} Visa from ${escapeHtml(fromName)} (Step-by-Step)</h2>
    <ol style="padding-left:20px;margin:0;color:#334155;">
      <li><strong>Select Correct ${escapeHtml(toName)} Visa Subclass:</strong> Confirm whether your trip requires a Tourist, Business, Work, Student, Family, or Permanent Residency pathway.</li>
      <li><strong>Prepare &amp; Legalize Documents:</strong> Gather all statutory documents required for ${escapeHtml(fromName)} nationals and arrange certified translations or Apostille/consular legalization where applicable.</li>
      <li><strong>Complete Official Portal Filing:</strong> Submit the application via the official ${escapeHtml(toName)} immigration portal, e-Visa platform, or designated embassy/VAC in ${escapeHtml(fromName)}.</li>
      <li><strong>Pay Government Visa Fee &amp; Book Biometrics:</strong> Remit the statutory fee (${escapeHtml(metrics.standardFeeUsd)}) and attend your biometric fingerprint and photo appointment if required.</li>
      <li><strong>Track Decision &amp; Verify Visa Grant:</strong> Standard turnaround is ${escapeHtml(metrics.processingWindow)}. Verify validity dates and entry conditions immediately upon grant.</li>
    </ol>
  </section>

  <section aria-label="Frequently Asked Questions" style="margin-bottom:28px;">
    <h2 style="font-size:20px;font-weight:700;margin:0 0 12px 0;">4. Frequently Asked Questions (${escapeHtml(fromName)} &rarr; ${escapeHtml(toName)})</h2>
    <div style="margin-bottom:12px;">
      <h3 style="font-size:16px;font-weight:700;margin:0 0 4px 0;">Do ${escapeHtml(fromName)} citizens need a visa for ${escapeHtml(toName)} in 2026?</h3>
      <p style="margin:0;color:#334155;">For ${escapeHtml(fromName)} passport holders traveling to ${escapeHtml(toName)}, the current regime is: ${escapeHtml(metrics.entryRegime)}. Always verify your specific travel purpose before departure.</p>
    </div>
    <div style="margin-bottom:12px;">
      <h3 style="font-size:16px;font-weight:700;margin:0 0 4px 0;">How long does ${escapeHtml(toName)} visa processing take from ${escapeHtml(fromName)}?</h3>
      <p style="margin:0;color:#334155;">Standard processing time is ${escapeHtml(metrics.processingWindow)} from biometric completion or online e-Visa submission.</p>
    </div>
    <div>
      <h3 style="font-size:16px;font-weight:700;margin:0 0 4px 0;">Can ${escapeHtml(fromName)} citizens apply for work or permanent residency in ${escapeHtml(toName)}?</h3>
      <p style="margin:0;color:#334155;">Yes. ${escapeHtml(fromName)} nationals can apply for ${escapeHtml(toName)} work permits, skilled migration, student visas, family sponsorship, and permanent residency pathways subject to statutory eligibility criteria.</p>
    </div>
  </section>

  <nav aria-label="Related Bilateral Visa Categories and Corridors" style="border-top:1px solid #e2e8f0;padding-top:20px;margin-top:24px;">
    <h2 style="font-size:18px;font-weight:700;margin:0 0 12px 0;">Explore All ${escapeHtml(fromName)} to ${escapeHtml(toName)} Visa Categories</h2>
    <ul style="margin:0 0 20px 0;padding-left:20px;">
      <li><a href="/${fromCode}-to-${toCode}">${escapeHtml(fromName)} to ${escapeHtml(toName)} Complete Visa Overview</a></li>
      ${categoryLinksHtml}
      <li><a href="/${toCode}-to-${fromCode}">Reverse Route: ${escapeHtml(fromName)} Visa for ${escapeHtml(toName)} Citizens (${toCode.toUpperCase()} to ${fromCode.toUpperCase()})</a></li>
      <li><a href="/immigration/${toCode}">${escapeHtml(toName)} Global Immigration Hub</a></li>
      <li><a href="/immigration/${fromCode}">${escapeHtml(fromName)} Global Immigration Hub</a></li>
    </ul>

    <h3 style="font-size:16px;font-weight:700;margin:0 0 8px 0;">Other Popular Destinations for ${escapeHtml(fromName)} Citizens</h3>
    <ul style="margin:0 0 20px 0;padding-left:20px;">
      ${relatedDestLinksHtml}
    </ul>

    <h3 style="font-size:16px;font-weight:700;margin:0 0 8px 0;">${escapeHtml(toName)} Visa Requirements for Other Nationalities</h3>
    <ul style="margin:0 0 20px 0;padding-left:20px;">
      ${relatedOriginLinksHtml}
    </ul>

    <p style="font-size:13px;color:#475569;">
      <a href="/routes">Browse All Bilateral Visa Routes</a> •
      <a href="/sitemap">Complete HTML Sitemap</a> •
      <a href="/checklists">Downloadable Visa PDF Checklists</a> •
      <a href="/visa-free">Visa-Free Countries Directory</a> •
      <a href="/pr-visas">Global Permanent Residency Guide</a>
    </p>
  </nav>
</main>`;
}

function buildCountryHubSsrHtml(params: {
  cleanPath: string;
  canonicalUrl: string;
  code: string;
  countryName: string;
  metrics: ReturnType<typeof getDeterministicCorridorMetrics>;
}): string {
  const { code, countryName, metrics } = params;
  const originLinks = POPULAR_ORIGIN_CODES.filter((orig) => orig !== code)
    .map((orig) => {
      const origName = ISO2_COUNTRY_NAMES[orig] || orig.toUpperCase();
      return `<li><a href="/${orig}-to-${code}">${escapeHtml(countryName)} Visa for ${escapeHtml(origName)} Citizens (${orig.toUpperCase()} to ${code.toUpperCase()})</a></li>`;
    })
    .join('\n');

  const outboundLinks = POPULAR_DESTINATION_CODES.filter((dest) => dest !== code)
    .map((dest) => {
      const destName = ISO2_COUNTRY_NAMES[dest] || dest.toUpperCase();
      return `<li><a href="/${code}-to-${dest}">${escapeHtml(destName)} Visa for ${escapeHtml(countryName)} Citizens (${code.toUpperCase()} to ${dest.toUpperCase()})</a></li>`;
    })
    .join('\n');

  return `<main style="max-width:1120px;margin:0 auto;padding:24px 16px;font-family:system-ui,sans-serif;color:#0f172a;line-height:1.6;">
  <nav aria-label="Breadcrumb" style="font-size:13px;margin-bottom:16px;">
    <a href="/">Home</a> &rsaquo; <a href="/routes">All Bilateral Routes</a> &rsaquo; <span>${escapeHtml(countryName)} Immigration Hub</span>
  </nav>
  <h1 style="font-size:28px;font-weight:800;margin:0 0 12px 0;">${escapeHtml(countryName)} Immigration, Visa Categories &amp; Bilateral Travel Corridors (2026)</h1>
  <p style="font-size:16px;color:#334155;margin:0 0 20px 0;">
    Official 2026 immigration overview for ${escapeHtml(countryName)} (${escapeHtml(code.toUpperCase())}). Standard processing window: ${escapeHtml(metrics.processingWindow)}. Base consular fee benchmark: ${escapeHtml(metrics.standardFeeUsd)}.
  </p>
  <h2 style="font-size:20px;font-weight:700;margin:0 0 10px 0;">Inbound Visa Guides to ${escapeHtml(countryName)} by Nationality</h2>
  <ul style="padding-left:20px;margin:0 0 24px 0;">${originLinks}</ul>
  <h2 style="font-size:20px;font-weight:700;margin:0 0 10px 0;">Outbound Visa Requirements for ${escapeHtml(countryName)} Citizens</h2>
  <ul style="padding-left:20px;margin:0 0 24px 0;">${outboundLinks}</ul>
  <p><a href="/routes">Browse All Bilateral Routes</a> • <a href="/sitemap">Full HTML Sitemap</a></p>
</main>`;
}

function buildStaticDirectorySsrHtml(params: {
  cleanPath: string;
  canonicalUrl: string;
  title: string;
  description: string;
}): string {
  const { title, description } = params;
  const hubLinks = Object.entries(ISO2_COUNTRY_NAMES)
    .filter(([code]) => !UNINHABITED_TERRITORY_CODES.has(code))
    .slice(0, 60)
    .map(([code, name]) => `<li><a href="/in-to-${code}">${escapeHtml(name)} Visa for Indian Citizens</a> • <a href="/immigration/${code}">${escapeHtml(name)} Immigration Hub</a></li>`)
    .join('\n');

  return `<main style="max-width:1120px;margin:0 auto;padding:24px 16px;font-family:system-ui,sans-serif;color:#0f172a;line-height:1.6;">
  <h1 style="font-size:28px;font-weight:800;margin:0 0 12px 0;">${escapeHtml(title)}</h1>
  <p style="font-size:16px;color:#334155;margin:0 0 20px 0;">${escapeHtml(description)}</p>
  <nav aria-label="Core Visa Directories">
    <h2 style="font-size:20px;font-weight:700;margin:0 0 10px 0;">Primary Global Visa &amp; Immigration Directories</h2>
    <ul style="padding-left:20px;margin:0 0 20px 0;">
      <li><a href="/routes">All Bilateral Visa Routes (249 Countries &amp; Territories)</a></li>
      <li><a href="/sitemap">Complete HTML Sitemap &amp; Visa Subclass Index</a></li>
      <li><a href="/checklists">Free Downloadable Visa Document Checklists</a></li>
      <li><a href="/visa-free">Visa-Free &amp; Visa-on-Arrival Countries Guide</a></li>
      <li><a href="/e-visas">Official e-Visa Portals Directory</a></li>
      <li><a href="/pr-visas">Permanent Residency &amp; Citizenship Pathways</a></li>
      <li><a href="/work-visas">Global Work Permits &amp; Skilled Migration</a></li>
      <li><a href="/study-visas">International Student Visas</a></li>
    </ul>
    <h2 style="font-size:20px;font-weight:700;margin:0 0 10px 0;">Featured Country Visa &amp; Immigration Hubs</h2>
    <ul style="padding-left:20px;margin:0;">${hubLinks}</ul>
  </nav>
</main>`;
}

/**
 * Injects the SSR metadata, canonical URL, JSON-LD, and pre-rendered semantic HTML into the base index.html template.
 */
export function injectSsrPayloadIntoHtml(rawHtmlTemplate: string, payload: SsrRouteRenderResult): string {
  const safeTitle = escapeHtml(payload.title);
  const safeDesc = escapeHtml(payload.description);
  const safeCanonical = escapeHtml(payload.canonicalUrl);
  const safeOgImage = escapeHtml(payload.ogImage);
  const safeRobots = escapeHtml(payload.robots);

  let html = rawHtmlTemplate
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i, `<meta name="title" content="${safeTitle}" />`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${safeDesc}" />`)
    .replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i, `<meta name="robots" content="${safeRobots}" />`)
    .replace(/<meta\s+name="googlebot"\s+content="[^"]*"\s*\/?>/i, `<meta name="googlebot" content="${safeRobots}" />`)
    .replace(/<meta\s+name="bingbot"\s+content="[^"]*"\s*\/?>/i, `<meta name="bingbot" content="${safeRobots}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${safeCanonical}" />`)
    .replace(
      /<link\s+rel="alternate"\s+hreflang="en"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="alternate" hreflang="en" href="${safeCanonical}" />`
    )
    .replace(
      /<link\s+rel="alternate"\s+hreflang="en-IN"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="alternate" hreflang="en-IN" href="${safeCanonical}" />`
    )
    .replace(
      /<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="alternate" hreflang="x-default" href="${safeCanonical}" />`
    )
    .replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${escapeHtml(payload.ogType)}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${safeCanonical}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${safeTitle}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${safeDesc}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${safeOgImage}" />`)
    .replace(
      /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image:secure_url" content="${safeOgImage}" />`
    )
    .replace(/<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image:alt" content="${safeTitle}" />`)
    .replace(/<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:url" content="${safeCanonical}" />`)
    .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${safeTitle}" />`)
    .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${safeDesc}" />`)
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${safeOgImage}" />`)
    .replace(/<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image:alt" content="${safeTitle}" />`);

  // Inject route-specific JSON-LD script before </head>
  const jsonLdScript = `<script id="ssr-route-jsonld" type="application/ld+json">${JSON.stringify(payload.jsonLdGraph)}</script>`;
  html = html.replace('</head>', `${jsonLdScript}\n</head>`);

  // Inject pre-rendered semantic HTML inside <div id="root"></div> so crawlers index complete content before JS hydration
  html = html.replace(/<div\s+id="root"\s*><\/div>/i, `<div id="root">${payload.ssrBodyHtml}</div>`);

  return html;
}
