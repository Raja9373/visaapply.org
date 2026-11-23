import crypto from 'node:crypto';
import { ALL_249_ISO_FORCED } from '../data/all249Countries';
import { CANONICAL_15_LANG_CODES, type SupportedLangCode } from '../i18n/config';

/**
 * Canonical 249 ISO-3166-1 alpha-2 country/territory codes sourced directly
 * from the authoritative project registry (`src/data/all249Countries.ts`).
 */
export const CANONICAL_249_ISO2_UPPER: ReadonlySet<string> = new Set(
  ALL_249_ISO_FORCED.map((c) => c.code.trim().toUpperCase())
);

export const CANONICAL_249_ISO2_LOWER: ReadonlySet<string> = new Set(
  ALL_249_ISO_FORCED.map((c) => c.code.trim().toLowerCase())
);

export const CANONICAL_15_LANGUAGES_SET: ReadonlySet<SupportedLangCode> = new Set(
  CANONICAL_15_LANG_CODES
);

/**
 * Deleted Phase 3.2 test fixtures & synthetic placeholder prefixes that must
 * NEVER be reintroduced into static catalog data or public indexes.
 */
export const FORBIDDEN_FIXTURE_EXACT_IDS: ReadonlySet<string> = new Set([
  'test-phase-3-2-prog',
  'test-p322-temp-001',
  'test-p322-temp-002',
  'pg-test-2106',
  'empty-test'
]);

export const FORBIDDEN_FIXTURE_PREFIXES: readonly string[] = [
  'test-phase-3-2-',
  'test-p322-',
  'vd-test-phase-3-2-',
  'vd-test-p322-',
  'clm-p322-',
  'ev-p322-',
  'clm-neon-p322-',
  'ev-neon-p322-',
  'claim-32-',
  'ev-32-',
  'ver-32-pre-',
  'p1-audit-'
] as const;

/**
 * Known non-government / commercial visa agency / encyclopedia / blog / social
 * domains that must NEVER be accepted as official government authorities.
 */
export const DISALLOWED_UNOFFICIAL_DOMAINS: readonly string[] = [
  'wikipedia.org',
  'wikimedia.org',
  'visaguide.world',
  'atlys.com',
  'ivisa.com',
  'schengenvisainfo.com',
  'passportindex.org',
  'henleyglobal.com',
  'nomadcapitalist.com',
  'visahq.com',
  'pickyourtrail.com',
  'makemytrip.com',
  'yatra.com',
  'cleartrip.com',
  'acko.com',
  'medium.com',
  'substack.com',
  'blogspot.com',
  'wordpress.com',
  'wixsite.com',
  'reddit.com',
  'quora.com',
  'youtube.com',
  'youtu.be',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'linkedin.com',
  'pinterest.com',
  'forbes.com',
  'example.com',
  'example.org',
  'example.net',
  'localhost',
  '127.0.0.1'
] as const;

export const ALLOWED_CATALOG_CATEGORIES = [
  'pr',
  'citizenship',
  'work',
  'student',
  'family',
  'business',
  'investor',
  'digital_nomad',
  'retirement',
  'pet_travel',
  'tourist',
  'transit'
] as const;

export type CatalogImmigrationCategory = (typeof ALLOWED_CATALOG_CATEGORIES)[number];

const CATEGORY_CODE_TOKENS: Record<CatalogImmigrationCategory, string> = {
  pr: 'PR',
  citizenship: 'CIT',
  work: 'WORK',
  student: 'STU',
  family: 'FAM',
  business: 'BIZ',
  investor: 'INV',
  digital_nomad: 'NOMAD',
  retirement: 'RET',
  pet_travel: 'PET',
  tourist: 'TOU',
  transit: 'TRN'
};

/**
 * Checks whether an identifier matches any deleted Phase 3.2 test fixture or
 * quarantined synthetic prefix (case-insensitive).
 */
export function isForbiddenFixtureId(rawId: unknown): boolean {
  if (typeof rawId !== 'string') return false;
  const trimmed = rawId.trim().toLowerCase();
  if (!trimmed) return false;
  if (FORBIDDEN_FIXTURE_EXACT_IDS.has(trimmed)) return true;
  return FORBIDDEN_FIXTURE_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

/**
 * Validates whether a country code is an exact member of the canonical
 * 249-country ISO-3166-1 alpha-2 registry.
 */
export function isValidCanonicalIso2(code: unknown): code is string {
  if (typeof code !== 'string') return false;
  const trimmed = code.trim();
  if (!/^[A-Za-z]{2}$/.test(trimmed)) return false;
  return CANONICAL_249_ISO2_UPPER.has(trimmed.toUpperCase());
}

/**
 * Normalizes a validated ISO-2 code to uppercase (e.g., "us" -> "US").
 * Throws if the code is not in the canonical 249-country registry.
 */
export function normalizeCountryIso2(code: string): string {
  const trimmed = String(code ?? '').trim().toUpperCase();
  if (!CANONICAL_249_ISO2_UPPER.has(trimmed)) {
    throw new Error(`INVALID_COUNTRY_ISO2: "${code}" is not a recognized canonical 249-ISO country code.`);
  }
  return trimmed;
}

/**
 * Converts arbitrary human text into a deterministic ASCII uppercase/lowercase slug token.
 */
export function toDeterministicSlug(input: string, caseMode: 'upper' | 'lower' = 'lower'): string {
  const normalized = String(input ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  if (!normalized) {
    throw new Error(`INVALID_SLUG_INPUT: Unable to derive non-empty slug from "${input}".`);
  }
  return caseMode === 'upper' ? normalized.toUpperCase() : normalized.toLowerCase();
}

/**
 * Deterministic 12-hex SHA-256 fingerprint for stable non-positional IDs.
 */
export function deterministicShortHash(parts: readonly string[]): string {
  const canonicalPayload = parts.map((p) => String(p ?? '').trim()).join('|');
  return crypto.createHash('sha256').update(canonicalPayload, 'utf8').digest('hex').slice(0, 12).toUpperCase();
}

/**
 * Deterministic program identifier generator: `<COUNTRY>-<CATEGORY>-<SLUG>`
 * Never depends on array index or runtime clock.
 */
export function generateProgramId(
  countryIso2: string,
  category: CatalogImmigrationCategory,
  slugInput: string
): string {
  const iso = normalizeCountryIso2(countryIso2);
  const catToken = CATEGORY_CODE_TOKENS[category];
  if (!catToken) {
    throw new Error(`INVALID_CATEGORY: Unsupported category "${category}".`);
  }
  const slug = toDeterministicSlug(slugInput, 'upper');
  const candidate = `${iso}-${catToken}-${slug}`;
  if (isForbiddenFixtureId(candidate)) {
    throw new Error(`FORBIDDEN_FIXTURE_ID: Generated program ID "${candidate}" collides with a deleted fixture.`);
  }
  return candidate;
}

/**
 * Explicit preserved legacy program ID prefix aliases already in production
 * (`src/data/globalImmigrationHubData.ts`: `uk-*` -> GB, `uae-*` -> AE).
 * Never used when minting NEW IDs via `generateProgramId`, and never valid as `isoCode`.
 */
export const PRESERVED_LEGACY_PROGRAM_PREFIX_ALIASES: Readonly<Record<string, string>> = {
  uk: 'GB',
  uae: 'AE'
};

/**
 * Resolves the canonical ISO-2 country code represented by a programId prefix,
 * supporting both canonical `<ISO2>-*` and preserved legacy `uk-*`/`uae-*` IDs.
 * Returns null if the prefix is not a valid canonical 249-ISO code or preserved alias.
 */
export function extractProgramIdCountryIso(id: string): string | null {
  const trimmed = String(id ?? '').trim();
  const dashIdx = trimmed.indexOf('-');
  if (dashIdx < 2 || dashIdx > 3) return null;
  const rawPrefix = trimmed.slice(0, dashIdx);
  const lowerPrefix = rawPrefix.toLowerCase();
  if (PRESERVED_LEGACY_PROGRAM_PREFIX_ALIASES[lowerPrefix]) {
    return PRESERVED_LEGACY_PROGRAM_PREFIX_ALIASES[lowerPrefix];
  }
  if (rawPrefix.length === 2) {
    const upper = rawPrefix.toUpperCase();
    if (CANONICAL_249_ISO2_UPPER.has(upper)) return upper;
  }
  return null;
}

/**
 * Validates a program ID. Accepts both:
 * 1. Canonical Phase 2 format: `<ISO2>-<CATEGORY>-<SLUG>` (e.g., `US-WORK-H1B-SPECIALTY`)
 * 2. Existing preserved legacy IDs (e.g., `us-TOU-001`, `us-eb2-niw`, `uk-skilled-worker`, `uae-golden-visa-investor`)
 * Strictly rejects path traversal, whitespace, empty strings, and forbidden Phase 3.2 fixtures.
 */
export function isValidProgramId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length < 4 || trimmed.length > 120) return false;
  if (isForbiddenFixtureId(trimmed)) return false;
  if (!/^[A-Za-z]{2,3}-[A-Za-z0-9][A-Za-z0-9_-]{1,116}$/.test(trimmed)) return false;
  return extractProgramIdCountryIso(trimmed) !== null;
}

/**
 * Deterministic Official Source ID generator: `SRC-<COUNTRY>-<AUTHORITY>`
 */
export function generateOfficialSourceId(countryIso2: string, authoritySlug: string): string {
  const iso = normalizeCountryIso2(countryIso2);
  const auth = toDeterministicSlug(authoritySlug, 'upper');
  return `SRC-${iso}-${auth}`;
}

export function isValidOfficialSourceId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (isForbiddenFixtureId(trimmed)) return false;
  const match = /^SRC-([A-Z]{2})-([A-Z0-9][A-Z0-9-]{1,90})$/.exec(trimmed);
  if (!match) return false;
  return CANONICAL_249_ISO2_UPPER.has(match[1]);
}

/**
 * Deterministic Claim ID generator: `CL-<STABLE-ID>`
 */
export function generateClaimId(programId: string, sectionKey: string, claimKey: string): string {
  if (!isValidProgramId(programId)) {
    throw new Error(`INVALID_PROGRAM_ID: Cannot generate claim ID for invalid programId "${programId}".`);
  }
  const stableHash = deterministicShortHash([programId.toUpperCase(), sectionKey.toLowerCase(), claimKey.toLowerCase()]);
  return `CL-${stableHash}`;
}

/**
 * Validates Claim ID. Accepts canonical `CL-<STABLE-ID>` and preserved legacy `CLM-*`/`clm-*` IDs.
 */
export function isValidClaimId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length < 5 || trimmed.length > 100) return false;
  if (isForbiddenFixtureId(trimmed)) return false;
  return /^(CL|CLM|clm)-[A-Za-z0-9][A-Za-z0-9_-]{1,94}$/.test(trimmed);
}

/**
 * Deterministic Evidence ID generator: `EV-<STABLE-ID>`
 */
export function generateEvidenceId(claimId: string, sourceUrl: string, excerptKey: string = ''): string {
  if (!isValidClaimId(claimId)) {
    throw new Error(`INVALID_CLAIM_ID: Cannot generate evidence ID for invalid claimId "${claimId}".`);
  }
  const stableHash = deterministicShortHash([claimId.toUpperCase(), sourceUrl.trim().toLowerCase(), excerptKey.trim()]);
  return `EV-${stableHash}`;
}

/**
 * Validates Evidence ID. Accepts canonical `EV-<STABLE-ID>` and preserved legacy `ev-*` IDs.
 */
export function isValidEvidenceId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length < 5 || trimmed.length > 100) return false;
  if (isForbiddenFixtureId(trimmed)) return false;
  return /^(EV|ev)-[A-Za-z0-9][A-Za-z0-9_-]{1,94}$/.test(trimmed);
}

/**
 * Deterministic Bilateral Route ID generator: `<origin-iso2>-to-<destination-iso2>`
 * Rejects self-routes (e.g., `in-to-in`).
 */
export function generateRouteId(originIso2: string, destinationIso2: string): string {
  const from = normalizeCountryIso2(originIso2).toLowerCase();
  const to = normalizeCountryIso2(destinationIso2).toLowerCase();
  if (from === to) {
    throw new Error(`INVALID_SELF_ROUTE: Origin and destination cannot be identical ("${from}").`);
  }
  return `${from}-to-${to}`;
}

export function isValidRouteId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  const match = /^([a-z]{2})-to-([a-z]{2})$/.exec(id.trim());
  if (!match) return false;
  const [, from, to] = match;
  if (from === to) return false;
  return CANONICAL_249_ISO2_LOWER.has(from) && CANONICAL_249_ISO2_LOWER.has(to);
}

/**
 * Deterministic Visa Detail ID generator preserving existing `vd-<programId>` convention.
 */
export function generateVisaDetailId(programId: string): string {
  if (!isValidProgramId(programId)) {
    throw new Error(`INVALID_PROGRAM_ID: Cannot generate visa detail ID for invalid programId "${programId}".`);
  }
  return `vd-${programId}`;
}

export function isValidVisaDetailId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (isForbiddenFixtureId(trimmed)) return false;
  if (!trimmed.startsWith('vd-')) return false;
  return isValidProgramId(trimmed.slice(3));
}

/**
 * Deterministic Changelog ID generator: `CHG-<YYYY-MM-DD>-<COUNTRY>-<SLUG>`
 * Preserves existing legacy `sync-YYYY-MM-DD-*` identifiers on validation.
 */
export function generateChangelogId(dateIso: string, countryIso2: string, slugInput: string): string {
  if (!isValidIsoDateOrTimestamp(dateIso)) {
    throw new Error(`INVALID_DATE: "${dateIso}" is not a valid ISO date.`);
  }
  const datePart = dateIso.slice(0, 10);
  const iso = normalizeCountryIso2(countryIso2);
  const slug = toDeterministicSlug(slugInput, 'upper');
  return `CHG-${datePart}-${iso}-${slug}`;
}

export function isValidChangelogId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length < 6 || trimmed.length > 120) return false;
  if (isForbiddenFixtureId(trimmed)) return false;
  return /^(CHG-\d{4}-\d{2}-\d{2}-[A-Z]{2}-[A-Z0-9-]+|sync-\d{4}-\d{2}-\d{2}-[a-z0-9-]+|chg-[a-zA-Z0-9_-]+)$/.test(
    trimmed
  );
}

/**
 * Deterministic Quarantine ID generator: `QRN-<ENTITY>-<HASH12>`
 */
export function generateQuarantineId(entityType: string, entityId: string): string {
  const kind = toDeterministicSlug(entityType, 'upper');
  const hash = deterministicShortHash([kind, entityId]);
  return `QRN-${kind}-${hash}`;
}

export function isValidEditorialSlug(slug: unknown): slug is string {
  if (typeof slug !== 'string') return false;
  const trimmed = slug.trim();
  if (trimmed.length < 3 || trimmed.length > 140) return false;
  if (isForbiddenFixtureId(trimmed)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed);
}

/**
 * Validates ISO-8601 date (`YYYY-MM-DD`) or UTC/offset timestamp (`YYYY-MM-DDTHH:mm:ss...Z`).
 */
export function isValidIsoDateOrTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(trimmed)) {
    return false;
  }
  const datePart = trimmed.slice(0, 10);
  const [y, m, d] = datePart.split('-').map(Number);
  const parsed = new Date(trimmed.length === 10 ? `${trimmed}T00:00:00.000Z` : trimmed);
  if (Number.isNaN(parsed.getTime())) return false;
  if (trimmed.length === 10) {
    return parsed.getUTCFullYear() === y && parsed.getUTCMonth() + 1 === m && parsed.getUTCDate() === d;
  }
  return true;
}

export interface OfficialUrlCheckResult {
  valid: boolean;
  normalizedUrl?: string;
  hostname?: string;
  reason?: string;
}

function isPrivateOrLocalHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower === '::1' || lower === '[::1]' || lower.endsWith('.local') || lower.endsWith('.internal')) {
    return true;
  }
  if (/^127\./.test(lower) || /^10\./.test(lower) || /^192\.168\./.test(lower) || /^169\.254\./.test(lower)) {
    return true;
  }
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(lower)) {
    return true;
  }
  return false;
}

/**
 * Strictly validates an official government/sovereign HTTPS source URL.
 * Rejects non-HTTPS protocols, credentials in URL, private/local hosts,
 * and disallowed unofficial blogs/encyclopedias/commercial visa agencies.
 */
export function validateOfficialHttpsUrl(rawUrl: unknown): OfficialUrlCheckResult {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return { valid: false, reason: 'Official source URL is required and must be a non-empty string.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { valid: false, reason: 'Official source URL is not a syntactically valid URL.' };
  }

  if (parsed.protocol !== 'https:') {
    return { valid: false, reason: `Official source URL must use HTTPS (received "${parsed.protocol}").` };
  }

  if (parsed.username || parsed.password) {
    return { valid: false, reason: 'Official source URL must not embed credentials.' };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || !hostname.includes('.')) {
    return { valid: false, reason: 'Official source URL must include a valid public domain.' };
  }

  if (isPrivateOrLocalHostname(hostname)) {
    return { valid: false, reason: `Private or local host "${hostname}" is not a valid official source.` };
  }

  const matchedUnofficial = DISALLOWED_UNOFFICIAL_DOMAINS.find(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
  if (matchedUnofficial) {
    return {
      valid: false,
      reason: `Unofficial, commercial agency, or blog domain "${hostname}" cannot be registered as an official government source.`
    };
  }

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
    hostname
  };
}

/**
 * Scans serialized public catalog values for prohibited PII (emails) or leaked secrets
 * (DB URIs, API keys, bearer tokens, private keys).
 */
export function detectProhibitedPublicSecretsOrPii(value: unknown, pathPrefix: string = ''): string[] {
  const findings: string[] = [];

  const scanString = (str: string, currentPath: string) => {
    if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(str)) {
      findings.push(`${currentPath || 'root'}: prohibited email address / PII detected in public catalog record`);
    }
    if (/(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s"']+/i.test(str)) {
      findings.push(`${currentPath || 'root'}: prohibited database connection URI detected`);
    }
    if (/\b(?:AIzaSy[0-9A-Za-z_-]{20,}|re_(?:live|test)_[0-9A-Za-z_]{16,}|gh[pousr]_[0-9A-Za-z]{20,}|sk-[0-9A-Za-z]{20,})\b/.test(str)) {
      findings.push(`${currentPath || 'root'}: prohibited API key or token pattern detected`);
    }
    if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(str)) {
      findings.push(`${currentPath || 'root'}: prohibited private key material detected`);
    }
  };

  const walk = (node: unknown, currentPath: string) => {
    if (typeof node === 'string') {
      scanString(node, currentPath);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item, idx) => walk(item, `${currentPath}[${idx}]`));
      return;
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        const nextPath = currentPath ? `${currentPath}.${k}` : k;
        if (/^(password|secret|privateKey|apiKey|subscriberEmail|accessToken)$/i.test(k) && v) {
          findings.push(`${nextPath}: prohibited secret or PII field name in public catalog`);
        }
        walk(v, nextPath);
      }
    }
  };

  walk(value, pathPrefix);
  return findings;
}
