/**
 * VISAAPPLY.ORG — CANONICAL IMMIGRATION CATEGORY REGISTRY & ROUTE HELPERS
 *
 * Single source of truth shared by:
 * - Homepage Global Immigration & Residency Hub (6 category cards)
 * - GlobalImmigrationHubPage (`/immigration` & `/immigration?category=<slug>`)
 * - CountryImmigrationDetailPage (`/immigration/:code` & `/immigration/:code?category=<slug>`)
 * - StaticCatalogClient category filtering
 * - App.tsx route matching (query-string-safe)
 *
 * All category IDs strictly match the canonical IDs emitted in
 * `public/catalog/index-categories.*.json` and `src/schemas/catalogSchemas.ts`.
 */

import type { ImmigrationCategoryKey } from '../data/globalImmigrationHubData';
import { getLangFromUrlPath } from '../utils/autoLanguage';

export interface CanonicalImmigrationCategoryMeta {
  /** Authoritative catalog category ID (matches `index-categories` & `index-programs`) */
  id: ImmigrationCategoryKey;
  /** Authoritative URL query slug for `/immigration?category=<slug>` */
  slug: string;
  /** Short tab label on `/immigration` */
  tabLabel: string;
  /** Full user-facing card/section title */
  cardTitle: string;
  /** Emoji icon */
  icon: string;
  /** Short badge on homepage promo card */
  badge: string;
  /** Short description on homepage promo card */
  cardDescription: string;
  /** CTA text on homepage promo card */
  cardCta: string;
  /** Page H1 title on `/immigration?category=<slug>` */
  pageTitle: string;
  /** Page subtitle on `/immigration?category=<slug>` */
  pageDescription: string;
  /** Whether shown as one of the 6 primary homepage promo cards */
  featuredOnHomepage: boolean;
}

export const CANONICAL_IMMIGRATION_CATEGORIES: ReadonlyArray<CanonicalImmigrationCategoryMeta> = [
  {
    id: 'pr',
    slug: 'permanent-residency',
    tabLabel: 'Permanent Residency',
    cardTitle: 'Permanent Residency',
    icon: '🏠',
    badge: 'PR Pathways',
    cardDescription: 'Sovereign PR permits, points systems, and settlement pathways across 249 countries.',
    cardCta: 'Explore PR Countries',
    pageTitle: 'Permanent Residency Pathways (249 Countries Tracked)',
    pageDescription:
      'Verified sovereign PR permits, points-based selection systems, and settlement rules with official government portal links.',
    featuredOnHomepage: true,
  },
  {
    id: 'citizenship',
    slug: 'citizenship',
    tabLabel: 'Citizenship',
    cardTitle: 'Citizenship & Naturalization',
    icon: '🛂',
    badge: 'Citizenship',
    cardDescription: 'Naturalization timelines, dual citizenship laws, and statutory passport acquisition.',
    cardCta: 'Explore Citizenship Options',
    pageTitle: 'Citizenship & Naturalization Pathways (249 Countries Tracked)',
    pageDescription:
      'Verified naturalization statutes and official government citizenship application portals.',
    featuredOnHomepage: true,
  },
  {
    id: 'work',
    slug: 'work',
    tabLabel: 'Work & Employment',
    cardTitle: 'Work Immigration',
    icon: '💼',
    badge: 'Work Permits',
    cardDescription: 'Skilled worker visas, employer sponsorships, and job seeker opportunity permits.',
    cardCta: 'Explore Work Immigration',
    pageTitle: 'Work & Employment Visa Pathways (249 Countries Tracked)',
    pageDescription:
      'Verified skilled worker visas, employer sponsorships, and job seeker permits backed by sovereign portals.',
    featuredOnHomepage: true,
  },
  {
    id: 'family',
    slug: 'family',
    tabLabel: 'Family & Spouse',
    cardTitle: 'Family Immigration',
    icon: '👨‍👩‍👧‍👦',
    badge: 'Family Reunion',
    cardDescription: 'Spouse visas, dependent children, and parent sponsorships worldwide.',
    cardCta: 'Explore Family Immigration',
    pageTitle: 'Family & Spouse Reunification Pathways (249 Countries Tracked)',
    pageDescription:
      'Verified spouse visas, dependent children sponsorships, and family reunification routes.',
    featuredOnHomepage: true,
  },
  {
    id: 'business',
    slug: 'business-investor',
    tabLabel: 'Business & Investor',
    cardTitle: 'Business & Investor Immigration',
    icon: '📈',
    badge: 'Investment PR',
    cardDescription: 'Investor visas, startup entrepreneur permits, and sovereign Golden Visas.',
    cardCta: 'Explore Investor Routes',
    pageTitle: 'Business & Investor Residency Pathways (249 Countries Tracked)',
    pageDescription:
      'Verified sovereign investor visas, startup founder permits, and Golden Visa programs.',
    featuredOnHomepage: true,
  },
  {
    id: 'digital_nomad',
    slug: 'digital-nomad-retirement',
    tabLabel: 'Digital Nomad & Retirement',
    cardTitle: 'Digital Nomad & Retirement Residency',
    icon: '🌴',
    badge: 'Remote & Retire',
    cardDescription: 'Remote work permits, freelancer visas, and self-funded retirement residency.',
    cardCta: 'Explore Digital Nomad Options',
    pageTitle: 'Digital Nomad & Retirement Residency Pathways (249 Countries Tracked)',
    pageDescription:
      'Verified remote worker visas and passive-income retirement residency routes.',
    featuredOnHomepage: true,
  },
  {
    id: 'tourist',
    slug: 'tourist-visitor',
    tabLabel: 'Tourist & Visitor',
    cardTitle: 'Tourist & Visitor Visas',
    icon: '✈️',
    badge: 'Short-Stay',
    cardDescription: 'Tourism, sightseeing, and short-stay visitor visa programs.',
    cardCta: 'Explore Tourist Visas',
    pageTitle: 'Tourist & Visitor Visa Pathways (249 Countries Tracked)',
    pageDescription:
      'Verified short-stay visitor and tourist visa programs backed by primary consular portals.',
    featuredOnHomepage: false,
  },
] as const;

/** Exact 6 primary category cards displayed on the Homepage Global Immigration & Residency Hub */
export const IMMIGRATION_HUB_PROMO_CATEGORIES: ReadonlyArray<CanonicalImmigrationCategoryMeta> =
  CANONICAL_IMMIGRATION_CATEGORIES.filter((c) => c.featuredOnHomepage);

/** Canonical URL slug & internal ID alias map -> authoritative ImmigrationCategoryKey */
export const CATEGORY_URL_PARAM_MAP: Record<string, ImmigrationCategoryKey> = {
  'permanent-residency': 'pr',
  citizenship: 'citizenship',
  work: 'work',
  family: 'family',
  'business-investor': 'business',
  'digital-nomad-retirement': 'digital_nomad',
  'tourist-visitor': 'tourist',
  // Canonical internal IDs accepted directly as aliases
  pr: 'pr',
  business: 'business',
  digital_nomad: 'digital_nomad',
  tourist: 'tourist',
};

/** Authoritative ImmigrationCategoryKey -> canonical URL query slug */
export const CATEGORY_INTERNAL_TO_PARAM_MAP: Record<ImmigrationCategoryKey, string> = {
  pr: 'permanent-residency',
  citizenship: 'citizenship',
  work: 'work',
  family: 'family',
  business: 'business-investor',
  digital_nomad: 'digital-nomad-retirement',
  tourist: 'tourist-visitor',
};

export const HONEST_EMPTY_CATEGORY_MESSAGE =
  'No verified programs are currently published in this category. Please check back after official verification.';

export function normalizeCanonicalCategory(raw: string | null | undefined): ImmigrationCategoryKey | null {
  if (!raw) return null;
  const key = String(raw).trim().toLowerCase();
  if (!key) return null;
  return CATEGORY_URL_PARAM_MAP[key] ?? null;
}

export function getCanonicalCategoryMeta(
  category: ImmigrationCategoryKey | 'all'
): CanonicalImmigrationCategoryMeta | null {
  if (category === 'all') return null;
  return CANONICAL_IMMIGRATION_CATEGORIES.find((c) => c.id === category) ?? null;
}

export interface ParsedImmigrationCategoryQuery {
  category: ImmigrationCategoryKey | 'all';
  canonicalSlug: string | null;
  invalidCategoryParam: string | null;
}

/**
 * Parses a URL search string (e.g. `?category=permanent-residency`) or full path+query
 * against the single canonical category registry.
 * Never throws; invalid category parameters are reported cleanly in `invalidCategoryParam`
 * so the page can display a clear invalid-filter notice instead of a 404.
 */
export function parseImmigrationCategoryQuery(
  searchOrPath?: string | null
): ParsedImmigrationCategoryQuery {
  let rawSearch = '';
  if (typeof searchOrPath === 'string') {
    const qIdx = searchOrPath.indexOf('?');
    if (qIdx >= 0) {
      rawSearch = searchOrPath.slice(qIdx).split('#')[0];
    } else if (searchOrPath.startsWith('category=') || searchOrPath.includes('=')) {
      rawSearch = `?${searchOrPath.split('#')[0]}`;
    }
  } else if (typeof window !== 'undefined') {
    rawSearch = window.location.search || '';
  }

  if (!rawSearch) {
    return { category: 'all', canonicalSlug: null, invalidCategoryParam: null };
  }

  const params = new URLSearchParams(rawSearch);
  const rawCategory = params.get('category');
  if (rawCategory === null || rawCategory.trim() === '') {
    return { category: 'all', canonicalSlug: null, invalidCategoryParam: null };
  }

  const normalized = normalizeCanonicalCategory(rawCategory);
  if (!normalized) {
    return {
      category: 'all',
      canonicalSlug: null,
      invalidCategoryParam: rawCategory.trim().slice(0, 80),
    };
  }

  return {
    category: normalized,
    canonicalSlug: CATEGORY_INTERNAL_TO_PARAM_MAP[normalized],
    invalidCategoryParam: null,
  };
}

export function parseCategoryFromLocation(searchOverride?: string | null): ImmigrationCategoryKey | 'all' {
  return parseImmigrationCategoryQuery(searchOverride).category;
}

export function buildImmigrationHubUrl(category: ImmigrationCategoryKey | 'all' = 'all'): string {
  if (category === 'all') return '/immigration';
  const slug = CATEGORY_INTERNAL_TO_PARAM_MAP[category];
  return slug ? `/immigration?category=${slug}` : '/immigration';
}

export function buildCountryImmigrationUrl(
  countrySlug: string,
  category?: ImmigrationCategoryKey | 'all' | null
): string {
  const cleanCode = String(countrySlug || '').trim().toLowerCase();
  if (!cleanCode) return '/immigration';
  if (!category || category === 'all') return `/immigration/${cleanCode}`;
  const slug = CATEGORY_INTERNAL_TO_PARAM_MAP[category];
  return slug ? `/immigration/${cleanCode}?category=${slug}` : `/immigration/${cleanCode}`;
}

/**
 * Splits a raw SPA path (possibly containing `?query` and/or `#hash`) into a clean
 * pathname for exact route matching plus its preserved query string.
 */
export function splitRoutePathAndSearch(rawPath: string): {
  pathname: string;
  search: string;
  hash: string;
} {
  const str = String(rawPath || '/');
  const hashIdx = str.indexOf('#');
  const hash = hashIdx >= 0 ? str.slice(hashIdx) : '';
  const withoutHash = hashIdx >= 0 ? str.slice(0, hashIdx) : str;

  const qIdx = withoutHash.indexOf('?');
  const pathname = (qIdx >= 0 ? withoutHash.slice(0, qIdx) : withoutHash) || '/';
  const search = qIdx >= 0 ? withoutHash.slice(qIdx) : '';

  return { pathname, search, hash };
}

export type ImmigrationRouteMatch =
  | { type: 'hub'; pathname: string; search: string; parsedQuery: ParsedImmigrationCategoryQuery }
  | {
      type: 'country';
      countryCode: string;
      pathname: string;
      search: string;
      parsedQuery: ParsedImmigrationCategoryQuery;
    }
  | null;

/**
 * Pure route matcher for `/immigration` and `/immigration/:code` (including optional
 * language prefix such as `/de/immigration?category=work`, trailing slashes, and query parameters).
 * Returns `null` for genuinely unknown routes so real 404 handling remains strictly enforced.
 */
export function matchImmigrationRoute(rawUrl: string): ImmigrationRouteMatch {
  const { pathname: rawPathname, search } = splitRoutePathAndSearch(rawUrl);
  const { strippedPath } = getLangFromUrlPath(rawPathname);
  const normalizedPath = strippedPath || '/';

  if (normalizedPath === '/immigration' || normalizedPath === '/immigration/') {
    return {
      type: 'hub',
      pathname: normalizedPath,
      search,
      parsedQuery: parseImmigrationCategoryQuery(search),
    };
  }

  const countryMatch = normalizedPath.match(/^\/immigration\/([a-z]{2,3})\/?$/i);
  if (countryMatch) {
    return {
      type: 'country',
      countryCode: countryMatch[1].toUpperCase(),
      pathname: normalizedPath,
      search,
      parsedQuery: parseImmigrationCategoryQuery(search),
    };
  }

  return null;
}
