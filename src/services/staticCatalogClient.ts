/**
 * VISAAPPLY.ORG — PHASE 4: BROWSER-SAFE STATIC CATALOG CLIENT
 *
 * Zero-database runtime reader for `public/catalog/manifest.json` and its
 * content-hashed indexes and lazy chunks.
 *
 * Security & Reliability Guarantees:
 * - Strictly browser-safe (zero Node.js built-ins, zero SQLite/Neon imports).
 * - Manifest-only path resolution (rejects arbitrary paths, `..`, protocols).
 * - In-memory cache with ETag (`If-None-Match` / HTTP 304) support.
 * - Concurrent request deduplication (in-flight Promise coalescing).
 * - Fail-closed schema validation & public-only trust filtering (never exposes
 *   quarantined records, expired programs, or private subscriber PII).
 * - Controlled rollback feature-flag boundary (`isStaticCatalogEnabled`).
 */

import { SUPPORTED_LANGUAGES_15, type SupportedLangCode } from '../i18n/config';
import type {
  CatalogArtifactDescriptor,
  CatalogLoadResult,
  CategoriesIndexPayload,
  ChangelogIndexPayload,
  CompactRoutesIndexPayload,
  CountriesIndexPayload,
  CountryChunkPayload,
  CountryIndexEntry,
  EditorialIndexPayload,
  OfficialSourcesIndexPayload,
  ProgramsIndexPayload,
  ResolvedCompactRoute,
  RouteOverrideChunkPayload,
  SearchIndexPayload,
  StaticCatalogFeatureKey,
  StaticCatalogManifest,
  StaticRouteOverrideRecord,
  VisaDetailChunkPayload,
} from '../types/staticCatalog';

export const STATIC_CATALOG_SCHEMA_MAJOR = '2.';
export const DEFAULT_CATALOG_BASE_URL = '/catalog';

/**
 * Canonical coverage formula reconciliation (Phase 4):
 * - 249 ISO countries × 7 tracked hub categories
 *   (pr, citizenship, work, family, business, digital_nomad, tourist) = 1,743 slots.
 * - Legacy pre-tourist formula was 249 × 6 = 1,494 slots.
 * - Neither figure may ever be conflated with `verifiedAvailableProgramsCount` (28).
 */
export const CANONICAL_TRACKED_HUB_CATEGORIES = [
  'pr',
  'citizenship',
  'work',
  'family',
  'business',
  'digital_nomad',
  'tourist',
] as const;

export const CANONICAL_COVERAGE_SLOTS_COUNT = 249 * CANONICAL_TRACKED_HUB_CATEGORIES.length; // 1,743

// ============================================================================
// CONTROLLED MIGRATION & ROLLBACK FEATURE FLAGS
// ============================================================================

const runtimeFeatureOverrides: Partial<Record<StaticCatalogFeatureKey, boolean>> = {};

function readEnvStaticCatalogDefault(): boolean {
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
    if (metaEnv && typeof metaEnv.VITE_USE_STATIC_CATALOG === 'string') {
      return metaEnv.VITE_USE_STATIC_CATALOG.toLowerCase() !== 'false';
    }
  } catch {
    // Non-Vite test runtime
  }
  return true;
}

export function isStaticCatalogEnabled(feature?: StaticCatalogFeatureKey): boolean {
  if (feature && typeof runtimeFeatureOverrides[feature] === 'boolean') {
    return runtimeFeatureOverrides[feature] as boolean;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const globalOverride = window.localStorage.getItem('visaapply_use_static_catalog');
      if (globalOverride === 'false') return false;
      if (feature) {
        const featureOverride = window.localStorage.getItem(`visaapply_static_${feature}`);
        if (featureOverride === 'false') return false;
        if (featureOverride === 'true') return true;
      }
    }
  } catch {
    // Ignore storage restriction errors
  }
  return readEnvStaticCatalogDefault();
}

export function setStaticCatalogFeatureOverride(
  feature: StaticCatalogFeatureKey,
  enabled: boolean | null
): void {
  if (enabled === null) {
    delete runtimeFeatureOverrides[feature];
  } else {
    runtimeFeatureOverrides[feature] = enabled;
  }
}

export function resetStaticCatalogFeatureOverrides(): void {
  (Object.keys(runtimeFeatureOverrides) as StaticCatalogFeatureKey[]).forEach((k) => {
    delete runtimeFeatureOverrides[k];
  });
}

// ============================================================================
// SAFE MANIFEST PATH VALIDATION
// ============================================================================

const SAFE_ARTIFACT_REL_PATH_RE = /^[a-z0-9/_-]+\.[a-f0-9]{10}\.json$/i;

export function isSafeManifestArtifactPath(relPath: unknown): relPath is string {
  if (typeof relPath !== 'string') return false;
  const trimmed = relPath.trim();
  if (!trimmed || trimmed.length > 220) return false;
  if (trimmed.startsWith('/') || trimmed.startsWith('\\')) return false;
  if (trimmed.includes('..') || trimmed.includes('\\') || trimmed.includes('://')) return false;
  if (trimmed.includes('?') || trimmed.includes('#') || trimmed.includes('\0')) return false;
  return SAFE_ARTIFACT_REL_PATH_RE.test(trimmed);
}

function normalizeIso2(raw: string): string {
  const cleaned = String(raw || '').trim().toUpperCase();
  if (cleaned === 'UK') return 'GB';
  return cleaned;
}

function resolveCanonicalLang(rawLang?: string): SupportedLangCode {
  const cleaned = String(rawLang || 'en').trim().toLowerCase();
  const match = SUPPORTED_LANGUAGES_15.find((l) => l.code === cleaned);
  return match ? match.code : 'en';
}

// ============================================================================
// LIGHTWEIGHT BROWSER SCHEMA VALIDATORS (ZERO NODE / ZERO ZOD DEPS)
// ============================================================================

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function isValidDescriptor(v: unknown): v is CatalogArtifactDescriptor {
  if (!isPlainObject(v)) return false;
  return (
    typeof v.logicalId === 'string' &&
    isSafeManifestArtifactPath(v.filePath) &&
    typeof v.sha256 === 'string' &&
    /^[a-f0-9]{64}$/i.test(v.sha256) &&
    typeof v.bytes === 'number' &&
    v.bytes > 0
  );
}

export function validateManifestPayload(raw: unknown): StaticCatalogManifest | null {
  if (!isPlainObject(raw)) return null;
  if (typeof raw.schemaVersion !== 'string' || !raw.schemaVersion.startsWith(STATIC_CATALOG_SCHEMA_MAJOR)) {
    return null;
  }
  if (!isPlainObject(raw.indexes) || !isPlainObject(raw.chunks) || !isPlainObject(raw.counts)) {
    return null;
  }

  const idx = raw.indexes as Record<string, unknown>;
  const requiredIndexKeys = [
    'countries',
    'programs',
    'categories',
    'routes',
    'officialSources',
    'changelog',
    'editorial',
  ];
  for (const key of requiredIndexKeys) {
    if (!isValidDescriptor(idx[key])) return null;
  }

  if (!isPlainObject(idx.searchByLanguage)) return null;
  for (const desc of Object.values(idx.searchByLanguage)) {
    if (!isValidDescriptor(desc)) return null;
  }

  const chunks = raw.chunks as Record<string, unknown>;
  for (const bucket of ['countries', 'visaDetails', 'routeOverrides']) {
    if (!isPlainObject(chunks[bucket])) return null;
    for (const desc of Object.values(chunks[bucket] as Record<string, unknown>)) {
      if (!isValidDescriptor(desc)) return null;
    }
  }

  return raw as unknown as StaticCatalogManifest;
}

function validateCountriesIndex(raw: unknown): CountriesIndexPayload | null {
  if (!isPlainObject(raw) || !Array.isArray(raw.countries)) return null;
  if (typeof raw.schemaVersion !== 'string') return null;
  return raw as unknown as CountriesIndexPayload;
}

function validateProgramsIndex(raw: unknown): ProgramsIndexPayload | null {
  if (!isPlainObject(raw) || !Array.isArray(raw.programs)) return null;
  if (typeof raw.schemaVersion !== 'string') return null;
  // Public trust filter: never leak expired, draft, or unverified programs
  const verifiedOnly = (raw.programs as Array<Record<string, unknown>>).filter(
    (p) =>
      isPlainObject(p) &&
      p.status === 'AVAILABLE_VERIFIED' &&
      typeof p.id === 'string' &&
      typeof p.officialUrl === 'string' &&
      p.officialUrl.startsWith('https://')
  );
  return {
    ...(raw as unknown as ProgramsIndexPayload),
    programs: verifiedOnly as unknown as ProgramsIndexPayload['programs'],
    totalPrograms: verifiedOnly.length,
  };
}

function validateCategoriesIndex(raw: unknown): CategoriesIndexPayload | null {
  if (!isPlainObject(raw) || !isPlainObject(raw.categories)) return null;
  return raw as unknown as CategoriesIndexPayload;
}

function validateOfficialSourcesIndex(raw: unknown): OfficialSourcesIndexPayload | null {
  if (!isPlainObject(raw) || !isPlainObject(raw.sourcesByCountry)) return null;
  const sanitizedByCountry: OfficialSourcesIndexPayload['sourcesByCountry'] = {};
  for (const [iso, list] of Object.entries(raw.sourcesByCountry)) {
    if (!Array.isArray(list)) continue;
    const httpsOnly = list.filter(
      (s): s is OfficialSourcesIndexPayload['sourcesByCountry'][string][number] =>
        isPlainObject(s) && typeof s.url === 'string' && s.url.startsWith('https://')
    );
    if (httpsOnly.length > 0) {
      sanitizedByCountry[iso.toUpperCase()] = httpsOnly;
    }
  }
  return {
    schemaVersion: String(raw.schemaVersion || '2.0.0'),
    verifiedCountryCount: Object.keys(sanitizedByCountry).length,
    sourcesByCountry: sanitizedByCountry,
  };
}

function validateChangelogIndex(raw: unknown): ChangelogIndexPayload | null {
  if (!isPlainObject(raw) || !Array.isArray(raw.entries)) return null;
  const verifiedOnly = (raw.entries as Array<Record<string, unknown>>).filter(
    (e) =>
      isPlainObject(e) &&
      e.verificationStatus === 'AVAILABLE_VERIFIED' &&
      isPlainObject(e.sourceReference) &&
      typeof e.sourceReference.url === 'string' &&
      e.sourceReference.url.startsWith('https://')
  );
  return {
    schemaVersion: String(raw.schemaVersion || '2.0.0'),
    totalEntries: verifiedOnly.length,
    entries: verifiedOnly as unknown as ChangelogIndexPayload['entries'],
  };
}

function validateEditorialIndex(raw: unknown): EditorialIndexPayload | null {
  if (!isPlainObject(raw) || !Array.isArray(raw.articles)) return null;
  return raw as unknown as EditorialIndexPayload;
}

function validateSearchIndex(raw: unknown): SearchIndexPayload | null {
  if (
    !isPlainObject(raw) ||
    !isPlainObject(raw.language) ||
    !isPlainObject(raw.translationCoverage) ||
    !Array.isArray(raw.countries) ||
    !Array.isArray(raw.programs) ||
    !Array.isArray(raw.editorial)
  ) {
    return null;
  }
  return raw as unknown as SearchIndexPayload;
}

function validateCountryChunk(raw: unknown): CountryChunkPayload | null {
  if (!isPlainObject(raw) || !isPlainObject(raw.country)) return null;
  if (raw.country.recordStatus !== 'ACTIVE') return null; // Never return quarantined/uninhabited via active chunk
  const verifiedPrograms = Array.isArray(raw.programs)
    ? raw.programs.filter(
        (p) =>
          isPlainObject(p) &&
          p.verificationStatus === 'AVAILABLE_VERIFIED' &&
          p.publicationStatus === 'PUBLISHED'
      )
    : [];
  const verifiedSources = Array.isArray(raw.officialSources)
    ? raw.officialSources.filter(
        (s) => isPlainObject(s) && typeof s.officialHttpsUrl === 'string' && s.officialHttpsUrl.startsWith('https://')
      )
    : [];
  return {
    ...(raw as unknown as CountryChunkPayload),
    programs: verifiedPrograms as unknown as CountryChunkPayload['programs'],
    officialSources: verifiedSources as unknown as CountryChunkPayload['officialSources'],
  };
}

function validateVisaDetailChunk(raw: unknown): VisaDetailChunkPayload | null {
  if (!isPlainObject(raw) || !isPlainObject(raw.detail)) return null;
  if (
    raw.detail.verificationStatus !== 'AVAILABLE_VERIFIED' ||
    raw.detail.publicationStatus !== 'PUBLISHED'
  ) {
    return null;
  }
  return raw as unknown as VisaDetailChunkPayload;
}

function validateRoutesIndex(raw: unknown): CompactRoutesIndexPayload | null {
  if (
    !isPlainObject(raw) ||
    !isPlainObject(raw.treatyBlocs) ||
    !isPlainObject(raw.originRuleSets) ||
    !Array.isArray(raw.uninhabitedTerritoryCodes)
  ) {
    return null;
  }
  return raw as unknown as CompactRoutesIndexPayload;
}

function validateRouteOverrideChunk(raw: unknown): RouteOverrideChunkPayload | null {
  if (!isPlainObject(raw) || !Array.isArray(raw.overrides)) return null;
  const eligibleOnly = (raw.overrides as Array<Record<string, unknown>>).filter(
    (o) =>
      isPlainObject(o) &&
      o.routePublicationEligible === true &&
      isPlainObject(o.verificationMetadata) &&
      o.verificationMetadata.verificationStatus === 'AVAILABLE_VERIFIED'
  );
  return {
    schemaVersion: String(raw.schemaVersion || '2.0.0'),
    destinationCountryIso: String(raw.destinationCountryIso || '').toUpperCase(),
    overrides: eligibleOnly as unknown as StaticRouteOverrideRecord[],
  };
}

// ============================================================================
// STATIC CATALOG CLIENT CLASS (CACHING, ETAG, DEDUPLICATION, SAFE RESOLUTION)
// ============================================================================

interface CacheEntry<T> {
  data: T;
  etag: string | null;
  fetchedAt: number;
}

export interface StaticCatalogClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  cacheTtlMs?: number;
}

export class StaticCatalogClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly cacheTtlMs: number;
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly inFlight = new Map<string, Promise<CatalogLoadResult<unknown>>>();
  private networkRequestCount = 0;

  constructor(options: StaticCatalogClientOptions = {}) {
    this.baseUrl = (options.baseUrl || DEFAULT_CATALOG_BASE_URL).replace(/\/+$/, '');
    this.fetchImpl = options.fetchImpl || ((...args: Parameters<typeof fetch>) => fetch(...args));
    this.cacheTtlMs = options.cacheTtlMs ?? 5 * 60 * 1000; // 5 min soft TTL before ETag revalidation
  }

  public clearCache(): void {
    this.cache.clear();
    this.inFlight.clear();
    this.networkRequestCount = 0;
  }

  public getDiagnostics(): { cachedKeys: string[]; inFlightCount: number; networkRequestCount: number } {
    return {
      cachedKeys: Array.from(this.cache.keys()),
      inFlightCount: this.inFlight.size,
      networkRequestCount: this.networkRequestCount,
    };
  }

  private async fetchJsonValidated<T>(
    cacheKey: string,
    url: string,
    validator: (raw: unknown) => T | null,
    options?: { forceRefresh?: boolean; signal?: AbortSignal }
  ): Promise<CatalogLoadResult<T>> {
    const now = Date.now();
    const existing = this.cache.get(cacheKey) as CacheEntry<T> | undefined;

    if (existing && !options?.forceRefresh && now - existing.fetchedAt < this.cacheTtlMs) {
      return {
        status: 'ok',
        data: existing.data,
        retryable: false,
        fromCache: true,
        source: 'static_catalog',
      };
    }

    // Prevent duplicate concurrent requests for the same artifact
    const pending = this.inFlight.get(cacheKey) as Promise<CatalogLoadResult<T>> | undefined;
    if (pending && !options?.forceRefresh) {
      return pending;
    }

    const requestPromise = (async (): Promise<CatalogLoadResult<T>> => {
      try {
        const headers: Record<string, string> = {
          Accept: 'application/json',
        };
        if (existing?.etag) {
          headers['If-None-Match'] = existing.etag;
        }

        this.networkRequestCount += 1;
        const response = await this.fetchImpl(url, {
          method: 'GET',
          headers,
          signal: options?.signal,
        });

        // Conditional ETag hit (304 Not Modified)
        if (response.status === 304 && existing) {
          this.cache.set(cacheKey, { ...existing, fetchedAt: Date.now() });
          return {
            status: 'ok',
            data: existing.data,
            retryable: false,
            fromCache: true,
            source: 'static_catalog',
          };
        }

        if (response.status === 404) {
          return {
            status: 'unavailable',
            data: null,
            code: 'HTTP_404_NOT_FOUND',
            error: 'Requested catalog artifact was not found.',
            retryable: false,
            fromCache: false,
            source: 'static_catalog',
          };
        }

        if (!response.ok) {
          return {
            status: 'error',
            data: null,
            code: `HTTP_${response.status}`,
            error: `Catalog server responded with HTTP ${response.status}.`,
            retryable: response.status >= 500 || response.status === 429,
            fromCache: false,
            source: 'static_catalog',
          };
        }

        let parsed: unknown;
        try {
          parsed = await response.json();
        } catch {
          return {
            status: 'error',
            data: null,
            code: 'MALFORMED_JSON',
            error: 'Catalog artifact returned malformed JSON.',
            retryable: true,
            fromCache: false,
            source: 'static_catalog',
          };
        }

        const validated = validator(parsed);
        if (!validated) {
          return {
            status: 'error',
            data: null,
            code: 'SCHEMA_MISMATCH',
            error: 'Catalog artifact failed Phase 2/4 schema or trust validation.',
            retryable: false,
            fromCache: false,
            source: 'static_catalog',
          };
        }

        const etag = response.headers?.get ? response.headers.get('etag') : null;
        this.cache.set(cacheKey, {
          data: validated,
          etag,
          fetchedAt: Date.now(),
        });

        return {
          status: 'ok',
          data: validated,
          retryable: false,
          fromCache: false,
          source: 'static_catalog',
        };
      } catch (err: unknown) {
        const errName = (err as { name?: string })?.name;
        if (errName === 'AbortError') {
          return {
            status: 'error',
            data: null,
            code: 'ABORTED',
            error: 'Request was cancelled.',
            retryable: true,
            fromCache: false,
            source: 'static_catalog',
          };
        }
        return {
          status: 'error',
          data: null,
          code: 'NETWORK_ERROR',
          error:
            err instanceof Error
              ? err.message
              : 'Network error while fetching static catalog artifact.',
          retryable: true,
          fromCache: false,
          source: 'static_catalog',
        };
      } finally {
        this.inFlight.delete(cacheKey);
      }
    })();

    this.inFlight.set(cacheKey, requestPromise as Promise<CatalogLoadResult<unknown>>);
    return requestPromise;
  }

  private resolveSafeManifestUrl(descriptor: CatalogArtifactDescriptor | undefined): string | null {
    if (!descriptor || !isSafeManifestArtifactPath(descriptor.filePath)) {
      return null;
    }
    return `${this.baseUrl}/${descriptor.filePath}`;
  }

  public async getManifest(options?: {
    forceRefresh?: boolean;
    signal?: AbortSignal;
  }): Promise<CatalogLoadResult<StaticCatalogManifest>> {
    return this.fetchJsonValidated<StaticCatalogManifest>(
      'manifest',
      `${this.baseUrl}/manifest.json`,
      validateManifestPayload,
      options
    );
  }

  public async getCountriesIndex(options?: {
    forceRefresh?: boolean;
    signal?: AbortSignal;
  }): Promise<CatalogLoadResult<CountriesIndexPayload>> {
    const manifestRes = await this.getManifest(options);
    if (manifestRes.status !== 'ok' || !manifestRes.data) {
      return { ...manifestRes, data: null };
    }
    const url = this.resolveSafeManifestUrl(manifestRes.data.indexes.countries);
    if (!url) {
      return {
        status: 'error',
        data: null,
        code: 'INVALID_MANIFEST_PATH',
        error: 'Countries index path failed manifest safety checks.',
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }
    return this.fetchJsonValidated<CountriesIndexPayload>(
      manifestRes.data.indexes.countries.logicalId,
      url,
      validateCountriesIndex,
      options
    );
  }

  public async getProgramsIndex(options?: {
    forceRefresh?: boolean;
    signal?: AbortSignal;
  }): Promise<CatalogLoadResult<ProgramsIndexPayload>> {
    const manifestRes = await this.getManifest(options);
    if (manifestRes.status !== 'ok' || !manifestRes.data) {
      return { ...manifestRes, data: null };
    }
    const url = this.resolveSafeManifestUrl(manifestRes.data.indexes.programs);
    if (!url) {
      return {
        status: 'error',
        data: null,
        code: 'INVALID_MANIFEST_PATH',
        error: 'Programs index path failed manifest safety checks.',
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }
    return this.fetchJsonValidated<ProgramsIndexPayload>(
      manifestRes.data.indexes.programs.logicalId,
      url,
      validateProgramsIndex,
      options
    );
  }

  public async getCategoriesIndex(options?: {
    forceRefresh?: boolean;
    signal?: AbortSignal;
  }): Promise<CatalogLoadResult<CategoriesIndexPayload>> {
    const manifestRes = await this.getManifest(options);
    if (manifestRes.status !== 'ok' || !manifestRes.data) {
      return { ...manifestRes, data: null };
    }
    const url = this.resolveSafeManifestUrl(manifestRes.data.indexes.categories);
    if (!url) {
      return {
        status: 'error',
        data: null,
        code: 'INVALID_MANIFEST_PATH',
        error: 'Categories index path failed manifest safety checks.',
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }
    return this.fetchJsonValidated<CategoriesIndexPayload>(
      manifestRes.data.indexes.categories.logicalId,
      url,
      validateCategoriesIndex,
      options
    );
  }

  public async getOfficialSourcesIndex(options?: {
    forceRefresh?: boolean;
    signal?: AbortSignal;
  }): Promise<CatalogLoadResult<OfficialSourcesIndexPayload>> {
    const manifestRes = await this.getManifest(options);
    if (manifestRes.status !== 'ok' || !manifestRes.data) {
      return { ...manifestRes, data: null };
    }
    const url = this.resolveSafeManifestUrl(manifestRes.data.indexes.officialSources);
    if (!url) {
      return {
        status: 'error',
        data: null,
        code: 'INVALID_MANIFEST_PATH',
        error: 'Official sources index path failed manifest safety checks.',
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }
    return this.fetchJsonValidated<OfficialSourcesIndexPayload>(
      manifestRes.data.indexes.officialSources.logicalId,
      url,
      validateOfficialSourcesIndex,
      options
    );
  }

  public async getChangelogIndex(options?: {
    forceRefresh?: boolean;
    signal?: AbortSignal;
  }): Promise<CatalogLoadResult<ChangelogIndexPayload>> {
    const manifestRes = await this.getManifest(options);
    if (manifestRes.status !== 'ok' || !manifestRes.data) {
      return { ...manifestRes, data: null };
    }
    const url = this.resolveSafeManifestUrl(manifestRes.data.indexes.changelog);
    if (!url) {
      return {
        status: 'error',
        data: null,
        code: 'INVALID_MANIFEST_PATH',
        error: 'Changelog index path failed manifest safety checks.',
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }
    return this.fetchJsonValidated<ChangelogIndexPayload>(
      manifestRes.data.indexes.changelog.logicalId,
      url,
      validateChangelogIndex,
      options
    );
  }

  public async getEditorialIndex(options?: {
    forceRefresh?: boolean;
    signal?: AbortSignal;
  }): Promise<CatalogLoadResult<EditorialIndexPayload>> {
    const manifestRes = await this.getManifest(options);
    if (manifestRes.status !== 'ok' || !manifestRes.data) {
      return { ...manifestRes, data: null };
    }
    const url = this.resolveSafeManifestUrl(manifestRes.data.indexes.editorial);
    if (!url) {
      return {
        status: 'error',
        data: null,
        code: 'INVALID_MANIFEST_PATH',
        error: 'Editorial index path failed manifest safety checks.',
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }
    return this.fetchJsonValidated<EditorialIndexPayload>(
      manifestRes.data.indexes.editorial.logicalId,
      url,
      validateEditorialIndex,
      options
    );
  }

  public async getSearchIndex(
    lang?: string,
    options?: { forceRefresh?: boolean; signal?: AbortSignal }
  ): Promise<CatalogLoadResult<SearchIndexPayload>> {
    const manifestRes = await this.getManifest(options);
    if (manifestRes.status !== 'ok' || !manifestRes.data) {
      return { ...manifestRes, data: null };
    }
    const canonicalLang = resolveCanonicalLang(lang);
    const descriptor =
      manifestRes.data.indexes.searchByLanguage[canonicalLang] ||
      manifestRes.data.indexes.searchByLanguage.en;
    const url = this.resolveSafeManifestUrl(descriptor);
    if (!url) {
      return {
        status: 'error',
        data: null,
        code: 'INVALID_MANIFEST_PATH',
        error: `Search index for "${canonicalLang}" failed manifest safety checks.`,
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }
    return this.fetchJsonValidated<SearchIndexPayload>(
      descriptor.logicalId,
      url,
      validateSearchIndex,
      options
    );
  }

  /**
   * Fetches a lazy per-country chunk ONLY when the country is ACTIVE in the manifest.
   * Quarantined (228) and uninhabited (7) countries return honest typed states without
   * exposing quarantined payloads or attempting speculative fetches.
   */
  public async getCountryChunk(
    countryIso: string,
    options?: { forceRefresh?: boolean; signal?: AbortSignal }
  ): Promise<
    CatalogLoadResult<CountryChunkPayload> & { directoryEntry?: CountryIndexEntry | null }
  > {
    const normIso = normalizeIso2(countryIso);
    if (!/^[A-Z]{2}$/.test(normIso)) {
      return {
        status: 'unavailable',
        data: null,
        directoryEntry: null,
        code: 'INVALID_COUNTRY_ISO',
        error: `Invalid ISO alpha-2 country code: "${countryIso}".`,
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }

    const [manifestRes, countriesRes] = await Promise.all([
      this.getManifest(options),
      this.getCountriesIndex(options),
    ]);

    if (manifestRes.status !== 'ok' || !manifestRes.data) {
      return { ...manifestRes, data: null, directoryEntry: null };
    }

    const dirEntry =
      countriesRes.status === 'ok' && countriesRes.data
        ? countriesRes.data.countries.find((c) => c.iso === normIso) || null
        : null;

    if (dirEntry?.status === 'UNINHABITED_TERRITORY') {
      return {
        status: 'unavailable',
        data: null,
        directoryEntry: dirEntry,
        code: 'UNINHABITED_TERRITORY',
        error: `${dirEntry.name} is an uninhabited territory; standard immigration residency programs do not apply.`,
        retryable: false,
        fromCache: countriesRes.fromCache,
        source: 'static_catalog',
      };
    }

    if (dirEntry?.status === 'QUARANTINED') {
      return {
        status: 'quarantined',
        data: null,
        directoryEntry: dirEntry,
        code: 'AWAITING_OFFICIAL_SOURCE_VERIFICATION',
        error: `${dirEntry.name} is currently awaiting primary sovereign HTTPS official-source verification.`,
        retryable: false,
        fromCache: countriesRes.fromCache,
        source: 'static_catalog',
      };
    }

    const slug = normIso.toLowerCase();
    const descriptor = manifestRes.data.chunks.countries[slug];
    if (!descriptor) {
      return {
        status: 'unavailable',
        data: null,
        directoryEntry: dirEntry,
        code: 'COUNTRY_CHUNK_NOT_AVAILABLE',
        error: `Verified static country catalog chunk is not yet available for ${normIso}.`,
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }

    const url = this.resolveSafeManifestUrl(descriptor);
    if (!url) {
      return {
        status: 'error',
        data: null,
        directoryEntry: dirEntry,
        code: 'INVALID_MANIFEST_PATH',
        error: `Country chunk path for "${slug}" failed manifest safety checks.`,
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }

    const chunkRes = await this.fetchJsonValidated<CountryChunkPayload>(
      descriptor.logicalId,
      url,
      validateCountryChunk,
      options
    );
    return { ...chunkRes, directoryEntry: dirEntry };
  }

  /**
   * Fetches a lazy structured visa detail chunk ONLY if listed in `manifest.chunks.visaDetails`.
   * Returns `status: 'unavailable'` cleanly when structured detail data is not yet published.
   */
  public async getVisaDetailChunk(
    programId: string,
    options?: { forceRefresh?: boolean; signal?: AbortSignal }
  ): Promise<CatalogLoadResult<VisaDetailChunkPayload>> {
    const cleanId = String(programId || '').trim();
    if (!cleanId || cleanId.includes('..') || cleanId.includes('/') || cleanId.includes('\\')) {
      return {
        status: 'unavailable',
        data: null,
        code: 'INVALID_PROGRAM_ID',
        error: 'Invalid program identifier.',
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }

    const manifestRes = await this.getManifest(options);
    if (manifestRes.status !== 'ok' || !manifestRes.data) {
      return { ...manifestRes, data: null };
    }

    // Resolve exact or case-insensitive match strictly against manifest keys
    const exactDescriptor = manifestRes.data.chunks.visaDetails[cleanId];
    const matchedKey =
      exactDescriptor
        ? cleanId
        : Object.keys(manifestRes.data.chunks.visaDetails).find(
            (k) => k.toLowerCase() === cleanId.toLowerCase()
          );
    const descriptor = matchedKey ? manifestRes.data.chunks.visaDetails[matchedKey] : undefined;

    if (!descriptor) {
      return {
        status: 'unavailable',
        data: null,
        code: 'VISA_DETAIL_NOT_YET_AVAILABLE',
        error: `Structured 30-section visa detail is not yet published for "${cleanId}". Consult the official government portal linked on the program card.`,
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }

    const url = this.resolveSafeManifestUrl(descriptor);
    if (!url) {
      return {
        status: 'error',
        data: null,
        code: 'INVALID_MANIFEST_PATH',
        error: `Visa detail path for "${cleanId}" failed manifest safety checks.`,
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }

    return this.fetchJsonValidated<VisaDetailChunkPayload>(
      descriptor.logicalId,
      url,
      validateVisaDetailChunk,
      options
    );
  }

  public async getRoutesIndex(options?: {
    forceRefresh?: boolean;
    signal?: AbortSignal;
  }): Promise<CatalogLoadResult<CompactRoutesIndexPayload>> {
    const manifestRes = await this.getManifest(options);
    if (manifestRes.status !== 'ok' || !manifestRes.data) {
      return { ...manifestRes, data: null };
    }
    const url = this.resolveSafeManifestUrl(manifestRes.data.indexes.routes);
    if (!url) {
      return {
        status: 'error',
        data: null,
        code: 'INVALID_MANIFEST_PATH',
        error: 'Routes index path failed manifest safety checks.',
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }
    return this.fetchJsonValidated<CompactRoutesIndexPayload>(
      manifestRes.data.indexes.routes.logicalId,
      url,
      validateRoutesIndex,
      options
    );
  }

  public async getRouteOverrideChunk(
    destinationIso: string,
    options?: { forceRefresh?: boolean; signal?: AbortSignal }
  ): Promise<CatalogLoadResult<RouteOverrideChunkPayload>> {
    const slug = normalizeIso2(destinationIso).toLowerCase();
    const manifestRes = await this.getManifest(options);
    if (manifestRes.status !== 'ok' || !manifestRes.data) {
      return { ...manifestRes, data: null };
    }
    const descriptor = manifestRes.data.chunks.routeOverrides[slug];
    if (!descriptor) {
      return {
        status: 'empty',
        data: null,
        code: 'NO_CURATED_OVERRIDE_FOR_DESTINATION',
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }
    const url = this.resolveSafeManifestUrl(descriptor);
    if (!url) {
      return {
        status: 'error',
        data: null,
        code: 'INVALID_MANIFEST_PATH',
        error: `Route override chunk path for "${slug}" failed manifest safety checks.`,
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }
    return this.fetchJsonValidated<RouteOverrideChunkPayload>(
      descriptor.logicalId,
      url,
      validateRouteOverrideChunk,
      options
    );
  }

  /**
   * Resolves a single bilateral route using ONLY the 1.26 KB compact rule matrix
   * plus (when available) the sparse per-destination override chunk (<1 KB).
   * Never downloads 61,752 route objects or `fullVisaDatabase`.
   */
  public async lookupCompactRoute(
    fromIsoRaw: string,
    toIsoRaw: string,
    options?: { forceRefresh?: boolean; signal?: AbortSignal }
  ): Promise<CatalogLoadResult<ResolvedCompactRoute>> {
    const fromIso = normalizeIso2(fromIsoRaw);
    const toIso = normalizeIso2(toIsoRaw);

    if (!/^[A-Z]{2}$/.test(fromIso) || !/^[A-Z]{2}$/.test(toIso) || fromIso === toIso) {
      return {
        status: 'unavailable',
        data: null,
        code: 'INVALID_ROUTE_PAIR',
        error: 'Origin and destination must be two distinct ISO alpha-2 country codes.',
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }

    const [routesRes, countriesRes, overrideRes] = await Promise.all([
      this.getRoutesIndex(options),
      this.getCountriesIndex(options),
      this.getRouteOverrideChunk(toIso, options),
    ]);

    if (routesRes.status !== 'ok' || !routesRes.data) {
      return { ...routesRes, data: null };
    }
    if (countriesRes.status !== 'ok' || !countriesRes.data) {
      return { ...countriesRes, data: null };
    }

    const fromCountry = countriesRes.data.countries.find((c) => c.iso === fromIso);
    const toCountry = countriesRes.data.countries.find((c) => c.iso === toIso);

    const route = resolveRouteFromCompactData(
      fromIso,
      toIso,
      routesRes.data,
      fromCountry,
      toCountry,
      overrideRes.status === 'ok' && overrideRes.data ? overrideRes.data.overrides : []
    );

    return {
      status: 'ok',
      data: route,
      retryable: false,
      fromCache: routesRes.fromCache && countriesRes.fromCache,
      source: 'static_catalog',
    };
  }

  /**
   * Computes all 248 bilateral routes for a chosen origin using the compact matrix
   * and lazy-loading only the 3 sparse destination override chunks (total ~2.2 KB raw).
   */
  public async getCompactRoutesForOrigin(
    fromIsoRaw: string,
    options?: { forceRefresh?: boolean; signal?: AbortSignal }
  ): Promise<CatalogLoadResult<ResolvedCompactRoute[]>> {
    const fromIso = normalizeIso2(fromIsoRaw);
    if (!/^[A-Z]{2}$/.test(fromIso)) {
      return {
        status: 'unavailable',
        data: null,
        code: 'INVALID_ORIGIN_ISO',
        error: `Invalid origin ISO code "${fromIsoRaw}".`,
        retryable: false,
        fromCache: false,
        source: 'static_catalog',
      };
    }

    const [manifestRes, routesRes, countriesRes] = await Promise.all([
      this.getManifest(options),
      this.getRoutesIndex(options),
      this.getCountriesIndex(options),
    ]);

    if (manifestRes.status !== 'ok' || !manifestRes.data) {
      return { ...manifestRes, data: null };
    }
    if (routesRes.status !== 'ok' || !routesRes.data) {
      return { ...routesRes, data: null };
    }
    if (countriesRes.status !== 'ok' || !countriesRes.data) {
      return { ...countriesRes, data: null };
    }

    const overrideDestSlugs = Object.keys(manifestRes.data.chunks.routeOverrides);
    const overrideChunks = await Promise.all(
      overrideDestSlugs.map((slug) => this.getRouteOverrideChunk(slug, options))
    );
    const overridesByDest = new Map<string, StaticRouteOverrideRecord[]>();
    overrideChunks.forEach((res) => {
      if (res.status === 'ok' && res.data) {
        overridesByDest.set(res.data.destinationCountryIso.toUpperCase(), res.data.overrides);
      }
    });

    const fromCountry = countriesRes.data.countries.find((c) => c.iso === fromIso);
    const list: ResolvedCompactRoute[] = countriesRes.data.countries
      .filter((c) => c.iso !== fromIso)
      .map((toCountry) =>
        resolveRouteFromCompactData(
          fromIso,
          toCountry.iso,
          routesRes.data!,
          fromCountry,
          toCountry,
          overridesByDest.get(toCountry.iso) || []
        )
      );

    return {
      status: 'ok',
      data: list,
      retryable: false,
      fromCache: routesRes.fromCache && countriesRes.fromCache,
      source: 'static_catalog',
    };
  }
}

/**
 * Pure deterministic compact route resolver shared by single-corridor and 248-route origin views.
 * Never fabricates country-specific legal rules when no verified override exists.
 */
export function resolveRouteFromCompactData(
  fromIso: string,
  toIso: string,
  matrix: CompactRoutesIndexPayload,
  fromCountry?: CountryIndexEntry,
  toCountry?: CountryIndexEntry,
  destinationOverrides: StaticRouteOverrideRecord[] = []
): ResolvedCompactRoute {
  const fromLower = fromIso.toLowerCase();
  const toLower = toIso.toLowerCase();
  const routeId = `${fromLower}-to-${toLower}`;
  const routeHref = `/${routeId}`;
  const fromName = fromCountry?.name || fromIso;
  const toName = toCountry?.name || toIso;
  const fromFlag = fromCountry?.flag || '🌍';
  const toFlag = toCountry?.flag || '🌍';
  const verifiedProgramCount = toCountry?.verifiedProgramCount || 0;

  // 1. Confirmed uninhabited territory
  if (
    matrix.uninhabitedTerritoryCodes.includes(toLower) ||
    toCountry?.status === 'UNINHABITED_TERRITORY'
  ) {
    return {
      routeId,
      fromIso,
      toIso,
      fromName,
      toName,
      fromFlag,
      toFlag,
      visaFree: false,
      eVisaEligible: false,
      voaEligible: false,
      maxStayDays: null,
      ruleSpecificity: 'UNINHABITED_TERRITORY',
      classificationLabel: 'Uninhabited Territory — No Standard Visa Issuance',
      disclaimer:
        'Uninhabited territory without ordinary consular immigration processing; access generally requires special scientific or sovereign authorization.',
      lastVerifiedDate: null,
      verifiedProgramCount: 0,
      overrideProgramIds: [],
      scopeNote: null,
      routeHref,
    };
  }

  // 2. Verified country-specific curated route override
  const exactOverride = destinationOverrides.find(
    (o) =>
      o.originCountryIso.toUpperCase() === fromIso &&
      o.destinationCountryIso.toUpperCase() === toIso &&
      o.routePublicationEligible
  );
  if (exactOverride) {
    const v = exactOverride.verifiedOverrides;
    return {
      routeId,
      fromIso,
      toIso,
      fromName,
      toName,
      fromFlag,
      toFlag,
      visaFree: Boolean(v.visaFree),
      eVisaEligible: Boolean(v.eVisaEligible),
      voaEligible: Boolean(v.voaEligible),
      maxStayDays: v.maxStayDays ?? null,
      ruleSpecificity: 'VERIFIED_COUNTRY_OVERRIDE',
      classificationLabel: v.visaFree
        ? 'Verified Corridor: Visa-Free'
        : v.eVisaEligible
          ? 'Verified Corridor: e-Visa Eligible'
          : v.voaEligible
            ? 'Verified Corridor: Visa on Arrival'
            : 'Verified Corridor: Consular Visa Required',
      disclaimer:
        'Curated corridor backed by official sovereign references. Informational guide only — confirm final requirements on the official embassy portal.',
      lastVerifiedDate: exactOverride.verificationMetadata.lastVerifiedDate,
      verifiedProgramCount,
      overrideProgramIds: v.overrideProgramIds || [],
      scopeNote: v.scopeNote || null,
      routeHref,
    };
  }

  // 3. Generic treaty-bloc or compact origin rule classification (NOT country-specific legal advice)
  const inEuEeaMobility =
    matrix.treatyBlocs.euEeaSwissMobility.includes(fromIso) &&
    matrix.treatyBlocs.euEeaSwissMobility.includes(toIso);
  const inGccMobility =
    matrix.treatyBlocs.gcc.includes(fromIso) && matrix.treatyBlocs.gcc.includes(toIso);

  if (inEuEeaMobility || inGccMobility) {
    return {
      routeId,
      fromIso,
      toIso,
      fromName,
      toName,
      fromFlag,
      toFlag,
      visaFree: true,
      eVisaEligible: false,
      voaEligible: false,
      maxStayDays: null,
      ruleSpecificity: 'GENERIC_BLOC_OR_ORIGIN_CLASSIFICATION',
      classificationLabel: inEuEeaMobility
        ? 'Generic Treaty Classification: EU/EEA/Swiss Mobility Zone'
        : 'Generic Treaty Classification: GCC Mobility Zone',
      disclaimer:
        'Generic regional treaty classification — not a verified corridor-specific legal ruling. Confirm national ID/passport rules with the official border authority.',
      lastVerifiedDate: null,
      verifiedProgramCount,
      overrideProgramIds: [],
      scopeNote: null,
      routeHref,
    };
  }

  const originRules = matrix.originRuleSets[fromIso];
  if (originRules) {
    const isVf = originRules.visaFreeDestinations.includes(toIso);
    const isVoa = originRules.voaVerifiedDestinations.includes(toIso);
    const isEv = originRules.eVisaOrVoaDestinations.includes(toIso);
    if (isVf || isVoa || isEv) {
      return {
        routeId,
        fromIso,
        toIso,
        fromName,
        toName,
        fromFlag,
        toFlag,
        visaFree: isVf,
        eVisaEligible: isEv && !isVf,
        voaEligible: isVoa && !isVf,
        maxStayDays: null,
        ruleSpecificity: 'GENERIC_BLOC_OR_ORIGIN_CLASSIFICATION',
        classificationLabel: isVf
          ? 'Generic Origin Matrix: Visa-Free Scope'
          : isVoa
            ? 'Generic Origin Matrix: VOA / e-Visa Scope'
            : 'Generic Origin Matrix: e-Visa Scope',
        disclaimer:
          'Generic compact-matrix classification only (not official legal advice). Verify stay limits, fees, and eligibility directly with the destination embassy.',
        lastVerifiedDate: null,
        verifiedProgramCount,
        overrideProgramIds: [],
        scopeNote: null,
        routeHref,
      };
    }
  }

  // 4. Default honest verification-pending state (never fabricate bilateral rules)
  return {
    routeId,
    fromIso,
    toIso,
    fromName,
    toName,
    fromFlag,
    toFlag,
    visaFree: false,
    eVisaEligible: false,
    voaEligible: false,
    maxStayDays: null,
    ruleSpecificity: 'AWAITING_VERIFICATION',
    classificationLabel: 'Bilateral Verification Pending',
    disclaimer:
      'No verified corridor-specific rule is published yet for this pair. VisaApply.org does not fabricate bilateral visa rules — consult the destination embassy.',
    lastVerifiedDate: null,
    verifiedProgramCount,
    overrideProgramIds: [],
    scopeNote: null,
    routeHref,
  };
}

/**
 * Adapts a validated static `VisaDetailChunkPayload` into the object shape
 * expected by `VisaDetailRenderer` (zero runtime SQLite/Neon API dependency).
 */
export function adaptStaticVisaDetailForRenderer(chunk: VisaDetailChunkPayload) {
  const { detail, claims, evidence } = chunk;
  const s = detail.sections;
  return {
    id: detail.detailId,
    program_id: detail.programId,
    country_code: detail.destinationCountryIso,
    verification_status: detail.verificationStatus,
    publication_status: detail.publicationStatus,
    last_verified_date: detail.lastVerifiedDate,
    updated_at: detail.lastUpdatedDate,
    overview: s.overview,
    eligibility_criteria: s.eligibility,
    nationality_restrictions: s.nationalityRestrictions,
    age_requirements: s.ageRequirements,
    education_requirements: s.educationRequirements,
    work_experience: s.workExperience,
    financial_requirements: s.financialRequirements,
    processing_time: s.processingTime,
    validity: s.validity,
    renewal: s.renewal,
    family_provisions: s.familyDependentProvisions,
    rights_and_restrictions: s.rightsAndRestrictions,
    required_documents: s.requiredDocuments || [],
    application_process: s.applicationProcess || [],
    fees: s.applicationFees,
    official_links: s.officialApplicationLinks || [],
    faqs: s.frequentlyAskedQuestions || [],
    claims: claims.map((c) => ({
      id: c.claimId,
      claim_text: c.claimText,
      classification: c.claimClassification,
      section_key: c.sectionKey,
      verification_status: c.verificationStatus,
      verification_date: c.verificationDate,
      source_url: c.sourceUrl,
      supporting_excerpt: c.supportingExcerpt,
      evidence: evidence
        .filter((e) => c.evidenceIds.includes(e.evidenceId))
        .map((e) => ({
          id: e.evidenceId,
          source_url: e.sourceUrl,
          issuing_authority: e.issuingAuthority,
          source_title: e.sourceTitle,
          last_verified_date: e.lastVerifiedDate,
          evidence_status: e.evidenceStatus,
          supporting_excerpt: e.supportingExcerpt,
        })),
    })),
    staticCatalogSource: true,
  };
}

// Singleton default browser client
export const staticCatalogClient = new StaticCatalogClient();
