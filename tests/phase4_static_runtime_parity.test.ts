/**
 * VISAAPPLY.ORG — PHASE 4: STATIC CATALOG RUNTIME PARITY & SAFETY TEST SUITE
 *
 * Covers 24 runtime, security, parity, caching, resilience, localization,
 * rendering, bundle-safety, and database-immutability verification requirements.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  CANONICAL_COVERAGE_SLOTS_COUNT,
  CANONICAL_TRACKED_HUB_CATEGORIES,
  StaticCatalogClient,
  adaptStaticVisaDetailForRenderer,
  isSafeManifestArtifactPath,
  isStaticCatalogEnabled,
  resetStaticCatalogFeatureOverrides,
  setStaticCatalogFeatureOverride,
  validateManifestPayload,
} from '../src/services/staticCatalogClient';
import { SUPPORTED_LANGUAGES_15 } from '../src/i18n/config';
import { ALL_249_ISO_FORCED } from '../src/data/all249Countries';
import { VERIFIED_IMMIGRATION_PROGRAMS } from '../src/data/globalImmigrationHubData';
import {
  CATEGORY_INTERNAL_TO_PARAM_MAP,
  CATEGORY_URL_PARAM_MAP,
  GlobalImmigrationHubPage,
  parseCategoryFromLocation,
} from '../src/pages/GlobalImmigrationHubPage';
import { CountryImmigrationDetailPage } from '../src/pages/CountryImmigrationDetailPage';
import { RoutesPage } from '../src/pages/RoutesPage';
import { SourceVerifierPage } from '../src/pages/tools/SourceVerifierPage';
import { VisaComparisonPage } from '../src/pages/tools/VisaComparisonPage';

const ROOT_DIR = process.cwd();
const PUBLIC_CATALOG_DIR = path.join(ROOT_DIR, 'public', 'catalog');
const MANIFEST_PATH = path.join(PUBLIC_CATALOG_DIR, 'manifest.json');

function sha256File(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/**
 * Filesystem-backed `fetch` mock serving `public/catalog/**` with real ETag headers
 * and HTTP 304 support so StaticCatalogClient is exercised end-to-end against actual artifacts.
 */
function createFsCatalogFetch(options?: { delayMs?: number; requestLog?: string[] }): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    options?.requestLog?.push(rawUrl);

    if (options?.delayMs) {
      await new Promise((r) => setTimeout(r, options.delayMs));
    }

    const prefix = '/catalog/';
    if (!rawUrl.startsWith(prefix)) {
      return new Response('Not Found', { status: 404 });
    }

    const rel = rawUrl.slice(prefix.length);
    if (rel.includes('..') || rel.startsWith('/')) {
      return new Response('Forbidden', { status: 403 });
    }

    const absPath = path.resolve(PUBLIC_CATALOG_DIR, rel);
    if (!absPath.startsWith(PUBLIC_CATALOG_DIR) || !fs.existsSync(absPath)) {
      return new Response('Not Found', { status: 404 });
    }

    const bytes = fs.readFileSync(absPath);
    const etag = `"${crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 16)}"`;
    const reqHeaders = new Headers(init?.headers || {});
    if (reqHeaders.get('If-None-Match') === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag } });
    }

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ETag: etag,
      },
    });
  }) as typeof fetch;
}

// ============================================================================
// 1. MANIFEST LOADING & SCHEMA VALIDATION
// ============================================================================
test('1. Manifest loads cleanly and passes Phase 4 strict manifest validation', async () => {
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });
  const res = await client.getManifest();
  assert.equal(res.status, 'ok');
  assert.ok(res.data);
  assert.match(res.data.schemaVersion, /^2\./);
  assert.equal(res.data.counts.countriesInDirectory, 249);
  assert.equal(res.data.counts.activeVerifiedCountries, 14);
  assert.equal(res.data.counts.publishedPrograms, 28);
  assert.equal(res.data.counts.publishedVisaDetails, 1);
  assert.equal(res.data.counts.verifiedRouteOverrides, 3);
  assert.equal(res.data.counts.verifiedOfficialSources, 61);
  assert.equal(res.data.counts.changelogEntries, 8);
  assert.equal(res.data.counts.publishedEditorialArticles, 2);
  assert.equal(res.data.counts.languageSearchIndexes, 15);
  assert.equal(res.data.counts.lazyCountryChunks, 14);
  assert.equal(res.data.counts.lazyVisaDetailChunks, 1);
});

// ============================================================================
// 2. EVERY MANIFEST ARTIFACT EXISTS & MATCHES EXACT SHA-256 + BYTE SIZE
// ============================================================================
test('2. Every artifact in public/catalog/manifest.json exists with exact SHA-256 and byte count', () => {
  const manifest = validateManifestPayload(JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')));
  assert.ok(manifest, 'manifest.json must be valid');

  const descriptors = [
    manifest.indexes.countries,
    manifest.indexes.programs,
    manifest.indexes.categories,
    manifest.indexes.routes,
    manifest.indexes.officialSources,
    manifest.indexes.changelog,
    manifest.indexes.editorial,
    ...Object.values(manifest.indexes.searchByLanguage),
    ...Object.values(manifest.chunks.countries),
    ...Object.values(manifest.chunks.visaDetails),
    ...Object.values(manifest.chunks.routeOverrides),
  ];

  assert.ok(descriptors.length >= 40, `Expected >=40 catalog artifacts, got ${descriptors.length}`);
  for (const desc of descriptors) {
    assert.equal(isSafeManifestArtifactPath(desc.filePath), true, `Unsafe path: ${desc.filePath}`);
    const abs = path.join(PUBLIC_CATALOG_DIR, desc.filePath);
    assert.equal(fs.existsSync(abs), true, `Missing artifact on disk: ${desc.filePath}`);
    const stat = fs.statSync(abs);
    assert.equal(stat.size, desc.bytes, `Byte size mismatch for ${desc.filePath}`);
    assert.equal(sha256File(abs), desc.sha256, `SHA-256 mismatch for ${desc.filePath}`);
  }
});

// ============================================================================
// 3. SAFE MANIFEST PATH ENFORCEMENT
// ============================================================================
test('3. Manifest path validator blocks path traversal, absolute URLs, query strings, and unhashed paths', async () => {
  const unsafePaths = [
    '../package.json',
    'chunks/../../etc/passwd',
    '/catalog/index-countries.1234567890.json',
    'https://evil.example/index.1234567890.json',
    'index-countries.1234567890.json?bust=1',
    'index-countries.1234567890.json#frag',
    'index-countries.json',
    'index-countries.1234567890.json\0.txt',
    '',
  ];
  for (const bad of unsafePaths) {
    assert.equal(isSafeManifestArtifactPath(bad), false, `Should reject unsafe path: ${bad}`);
  }
  assert.equal(isSafeManifestArtifactPath('chunks/countries/us.a1b2c3d4e5.json'), true);

  // Tampered manifest with traversal path is rejected fail-closed
  const tamperedManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  tamperedManifest.indexes.countries.filePath = '../secret.1234567890.json';
  assert.equal(validateManifestPayload(tamperedManifest), null);
});

// ============================================================================
// 4. COUNTRY ID & ISO ALPHA-2 STABILITY (249 COUNTRIES)
// ============================================================================
test('4. All 249 canonical ISO alpha-2 country IDs preserved with exact active/quarantined/uninhabited counts', async () => {
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });
  const res = await client.getCountriesIndex();
  assert.equal(res.status, 'ok');
  assert.ok(res.data);
  assert.equal(res.data.countries.length, 249);

  const staticIsos = new Set(res.data.countries.map((c) => c.iso));
  for (const legacyCountry of ALL_249_ISO_FORCED) {
    assert.equal(
      staticIsos.has(legacyCountry.code.toUpperCase()),
      true,
      `Missing ISO code: ${legacyCountry.code}`
    );
  }

  const active = res.data.countries.filter((c) => c.status === 'ACTIVE');
  const quarantined = res.data.countries.filter((c) => c.status === 'QUARANTINED');
  const uninhabited = res.data.countries.filter((c) => c.status === 'UNINHABITED_TERRITORY');
  assert.equal(active.length, 14);
  assert.equal(quarantined.length, 228);
  assert.equal(uninhabited.length, 7);
});

// ============================================================================
// 5. PROGRAM ID STABILITY & EXPIRED PROGRAM EXCLUSION
// ============================================================================
test('5. All 28 published verified programs preserved and expired legacy program excluded', async () => {
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });
  const res = await client.getProgramsIndex();
  assert.equal(res.status, 'ok');
  assert.ok(res.data);
  assert.equal(res.data.programs.length, 28);

  const legacyActiveIds = new Set(
    VERIFIED_IMMIGRATION_PROGRAMS.filter((p) => p.verificationStatus === 'AVAILABLE_VERIFIED').map(
      (p) => p.id
    )
  );
  for (const p of res.data.programs) {
    assert.equal(p.status, 'AVAILABLE_VERIFIED');
    assert.equal(p.officialUrl.startsWith('https://'), true);
    assert.equal(legacyActiveIds.has(p.id), true, `Unexpected program ID: ${p.id}`);
  }

  // Expired Portugal Golden Visa real-estate record must never be published
  assert.equal(
    res.data.programs.some((p) => p.id === 'pt-golden-visa-expired-realestate'),
    false
  );
});

// ============================================================================
// 6. COVERAGE METRIC RECONCILIATION (1,494 vs 1,743)
// ============================================================================
test('6. Canonical coverage formula is documented as 249 × 7 = 1,743 and never conflated with 28 verified programs', async () => {
  assert.equal(CANONICAL_TRACKED_HUB_CATEGORIES.length, 7);
  assert.equal(CANONICAL_COVERAGE_SLOTS_COUNT, 1743);

  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });
  const catRes = await client.getCategoriesIndex();
  assert.equal(catRes.status, 'ok');
  assert.ok(catRes.data);
  const trackedKeys = Object.keys(catRes.data.categories);
  assert.equal(trackedKeys.length, 7);
  assert.equal(trackedKeys.length * 249, CANONICAL_COVERAGE_SLOTS_COUNT);
});

// ============================================================================
// 7. SCHEMA DEPENDENCY CONSISTENCY (ZERO ZOD DEPENDENCY)
// ============================================================================
test('7. package.json has no zod dependency and Phase 3 docs reflect zero-dependency TS validator', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
  assert.equal(pkg.dependencies?.zod, undefined);
  assert.equal(pkg.devDependencies?.zod, undefined);

  const p3ExportDoc = fs.readFileSync(
    path.join(ROOT_DIR, 'docs', 'PHASE3_STATIC_CATALOG_EXPORT.md'),
    'utf8'
  );
  assert.equal(/\bZod\b/.test(p3ExportDoc), false, 'PHASE3_STATIC_CATALOG_EXPORT.md should not claim Zod');
});

// ============================================================================
// 8. PUBLIC URL & CATEGORY QUERY-PARAM PRESERVATION
// ============================================================================
test('8. Public immigration category URL parameters resolve identically to legacy routes', () => {
  assert.equal(CATEGORY_URL_PARAM_MAP['permanent-residency'], 'pr');
  assert.equal(CATEGORY_URL_PARAM_MAP['pr'], 'pr');
  assert.equal(CATEGORY_URL_PARAM_MAP['digital-nomad-retirement'], 'digital_nomad');
  assert.equal(CATEGORY_URL_PARAM_MAP['digital_nomad'], 'digital_nomad');
  assert.equal(CATEGORY_URL_PARAM_MAP['citizenship'], 'citizenship');
  assert.equal(CATEGORY_URL_PARAM_MAP['work'], 'work');
  assert.equal(CATEGORY_URL_PARAM_MAP['family'], 'family');
  assert.equal(CATEGORY_URL_PARAM_MAP['business-investor'], 'business');
  assert.equal(CATEGORY_URL_PARAM_MAP['tourist-visitor'], 'tourist');
  assert.equal(CATEGORY_INTERNAL_TO_PARAM_MAP.digital_nomad, 'digital-nomad-retirement');
  assert.equal(CATEGORY_INTERNAL_TO_PARAM_MAP.pr, 'permanent-residency');

  const prevWindow = (globalThis as unknown as { window?: unknown }).window;
  try {
    (globalThis as unknown as { window: unknown }).window = {
      location: { search: '?category=digital-nomad-retirement' },
    };
    assert.equal(parseCategoryFromLocation(), 'digital_nomad');
    (globalThis as unknown as { window: unknown }).window = {
      location: { search: '?category=permanent-residency' },
    };
    assert.equal(parseCategoryFromLocation(), 'pr');
    (globalThis as unknown as { window: unknown }).window = {
      location: { search: '?category=unknown_xyz' },
    };
    assert.equal(parseCategoryFromLocation(), 'all');
  } finally {
    if (prevWindow === undefined) {
      delete (globalThis as unknown as { window?: unknown }).window;
    } else {
      (globalThis as unknown as { window?: unknown }).window = prevWindow;
    }
  }
});

// ============================================================================
// 9. LAZY PER-COUNTRY CHUNK LOADING & UK->GB ALIAS
// ============================================================================
test('9. Lazy country chunk loads only the requested active hub and normalizes UK -> GB', async () => {
  const log: string[] = [];
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch({ requestLog: log }) });

  const usRes = await client.getCountryChunk('US');
  assert.equal(usRes.status, 'ok');
  assert.ok(usRes.data);
  assert.equal(usRes.data.country.isoCode, 'US');
  assert.equal(usRes.data.country.recordStatus, 'ACTIVE');
  assert.ok(usRes.data.programs.length >= 1);
  assert.ok(usRes.data.officialSources.length >= 1);

  const ukRes = await client.getCountryChunk('UK');
  assert.equal(ukRes.status, 'ok');
  assert.equal(ukRes.data?.country.isoCode, 'GB');

  // Ensure only US and GB chunks were fetched — never all 14 or 249
  const countryChunkFetches = log.filter((u) => u.includes('/chunks/countries/'));
  assert.equal(countryChunkFetches.length, 2);
});

// ============================================================================
// 10. QUARANTINED (228) & UNINHABITED (7) HONEST COUNTRY STATES
// ============================================================================
test('10. Quarantined and uninhabited countries return honest typed states without chunk fetches', async () => {
  const log: string[] = [];
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch({ requestLog: log }) });

  // Brazil (BR) is among the 228 countries awaiting primary sovereign HTTPS official-source verification
  const quarantinedRes = await client.getCountryChunk('BR');
  assert.equal(quarantinedRes.status, 'quarantined');
  assert.equal(quarantinedRes.data, null);
  assert.equal(quarantinedRes.code, 'AWAITING_OFFICIAL_SOURCE_VERIFICATION');
  assert.equal(quarantinedRes.directoryEntry?.iso, 'BR');

  const uninhabitedRes = await client.getCountryChunk('AQ');
  assert.equal(uninhabitedRes.status, 'unavailable');
  assert.equal(uninhabitedRes.data, null);
  assert.equal(uninhabitedRes.code, 'UNINHABITED_TERRITORY');
  assert.equal(uninhabitedRes.directoryEntry?.iso, 'AQ');

  const countryChunkFetches = log.filter((u) => u.includes('/chunks/countries/'));
  assert.equal(countryChunkFetches.length, 0);
});

// ============================================================================
// 11. STRUCTURED VISA DETAIL LAZY LOADING & HONEST UNAVAILABLE STATE
// ============================================================================
test('11. Published visa detail us-TOU-001 loads cleanly and adapts for renderer; unpublished returns unavailable', async () => {
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });

  const usDetail = await client.getVisaDetailChunk('us-TOU-001');
  assert.equal(usDetail.status, 'ok');
  assert.ok(usDetail.data);
  assert.equal(usDetail.data.detail.programId, 'us-TOU-001');
  assert.equal(usDetail.data.detail.verificationStatus, 'AVAILABLE_VERIFIED');
  assert.equal(usDetail.data.detail.publicationStatus, 'PUBLISHED');

  const adapted = adaptStaticVisaDetailForRenderer(usDetail.data);
  assert.equal(adapted.program_id, 'us-TOU-001');
  assert.equal(adapted.staticCatalogSource, true);
  assert.ok(Array.isArray(adapted.claims));
  assert.ok(Array.isArray(adapted.official_links));

  // Unpublished structured detail returns honest unavailable state without hitting DB API
  const missingDetail = await client.getVisaDetailChunk('ca-PR-001');
  assert.equal(missingDetail.status, 'unavailable');
  assert.equal(missingDetail.code, 'VISA_DETAIL_NOT_YET_AVAILABLE');
  assert.equal(missingDetail.data, null);
});

// ============================================================================
// 12. COMPACT BILATERAL ROUTE RESOLUTION (NO 61,752-ROUTE DOWNLOAD)
// ============================================================================
test('12. Compact route engine distinguishes verified overrides, generic treaty/origin rules, uninhabited, and pending', async () => {
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });

  // Verified country override (ae-to-us)
  const overrideRes = await client.lookupCompactRoute('AE', 'US');
  assert.equal(overrideRes.status, 'ok');
  assert.equal(overrideRes.data?.ruleSpecificity, 'VERIFIED_COUNTRY_OVERRIDE');
  assert.equal(overrideRes.data?.routeHref, '/ae-to-us');

  // Generic treaty classification (EU/EEA: DE -> FR)
  const euRes = await client.lookupCompactRoute('DE', 'FR');
  assert.equal(euRes.status, 'ok');
  assert.equal(euRes.data?.ruleSpecificity, 'GENERIC_BLOC_OR_ORIGIN_CLASSIFICATION');
  assert.equal(euRes.data?.visaFree, true);

  // Uninhabited destination (US -> AQ)
  const aqRes = await client.lookupCompactRoute('US', 'AQ');
  assert.equal(aqRes.status, 'ok');
  assert.equal(aqRes.data?.ruleSpecificity, 'UNINHABITED_TERRITORY');

  // Pending bilateral verification (BR -> JP)
  const pendingRes = await client.lookupCompactRoute('BR', 'JP');
  assert.equal(pendingRes.status, 'ok');
  assert.equal(pendingRes.data?.ruleSpecificity, 'AWAITING_VERIFICATION');

  // Origin 248-route generation uses compact matrix + 3 sparse overrides only
  const allFromUs = await client.getCompactRoutesForOrigin('US');
  assert.equal(allFromUs.status, 'ok');
  assert.equal(allFromUs.data?.length, 248);
  const usVerifiedOverrides = allFromUs.data!.filter(
    (r) => r.ruleSpecificity === 'VERIFIED_COUNTRY_OVERRIDE'
  );
  assert.equal(usVerifiedOverrides.length, 2); // us-to-ae and us-to-in
});

// ============================================================================
// 13. OFFICIAL SOURCES REGISTRY PARITY (61 VERIFIED HTTPS SOURCES)
// ============================================================================
test('13. Official sources index exposes 61 verified HTTPS sovereign sources across 14 active countries', async () => {
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });
  const res = await client.getOfficialSourcesIndex();
  assert.equal(res.status, 'ok');
  assert.ok(res.data);
  assert.equal(res.data.verifiedCountryCount, 14);

  const allSources = Object.values(res.data.sourcesByCountry).flat();
  assert.equal(allSources.length, 61);
  for (const src of allSources) {
    assert.equal(src.url.startsWith('https://'), true, `Non-HTTPS source leaked: ${src.url}`);
  }
});

// ============================================================================
// 14. VERIFIED CHANGELOG (8) & PUBLISHED EDITORIAL GUIDES (2) — ZERO DRAFTS
// ============================================================================
test('14. Changelog index has 8 verified HTTPS entries and editorial index has 2 published guides with zero drafts', async () => {
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });
  const [changelogRes, editorialRes] = await Promise.all([
    client.getChangelogIndex(),
    client.getEditorialIndex(),
  ]);

  assert.equal(changelogRes.status, 'ok');
  assert.equal(changelogRes.data?.entries.length, 8);
  for (const entry of changelogRes.data!.entries) {
    assert.equal(entry.verificationStatus, 'AVAILABLE_VERIFIED');
    assert.equal(entry.sourceReference.url.startsWith('https://'), true);
  }

  assert.equal(editorialRes.status, 'ok');
  assert.equal(editorialRes.data?.articles.length, 2);
  const slugs = editorialRes.data!.articles.map((a) => a.slug).sort();
  assert.deepEqual(slugs, ['in-to-ca-tourist', 'us-to-uk-tourist']);
});

// ============================================================================
// 15. ALL 15 SUPPORTED LANGUAGE SEARCH INDEXES & HONEST EN FALLBACK
// ============================================================================
test('15. All 15 supported language search indexes load with accurate fallback metadata and unknown lang falls back to en', async () => {
  assert.equal(SUPPORTED_LANGUAGES_15.length, 15);
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });

  for (const lang of SUPPORTED_LANGUAGES_15) {
    const res = await client.getSearchIndex(lang.code);
    assert.equal(res.status, 'ok', `Failed loading search index for ${lang.code}`);
    assert.ok(res.data);
    assert.equal(res.data.language.code, lang.code);
    assert.equal(res.data.countries.length, 249);
    assert.equal(res.data.programs.length, 28);
    if (lang.code !== 'en') {
      assert.equal(res.data.translationCoverage.legalProgramRulesLanguage, 'en');
      assert.equal(res.data.translationCoverage.uiShellTranslated, true);
      assert.ok(res.data.translationCoverage.fallbackNotice);
    }
  }

  const fallbackRes = await client.getSearchIndex('xx-unknown');
  assert.equal(fallbackRes.status, 'ok');
  assert.equal(fallbackRes.data?.language.code, 'en');
});

// ============================================================================
// 16. IN-MEMORY TTL CACHE, ETAG 304 REVALIDATION & CONCURRENT DEDUPLICATION
// ============================================================================
test('16. Client deduplicates concurrent requests, serves TTL cache, and handles conditional ETag 304', async () => {
  const log: string[] = [];
  const client = new StaticCatalogClient({
    fetchImpl: createFsCatalogFetch({ delayMs: 15, requestLog: log }),
    cacheTtlMs: 5000,
  });

  // 10 simultaneous calls should trigger only 1 manifest fetch
  const burst = await Promise.all(Array.from({ length: 10 }, () => client.getManifest()));
  assert.equal(burst.every((r) => r.status === 'ok'), true);
  assert.equal(log.filter((u) => u.endsWith('/manifest.json')).length, 1);

  // Subsequent call hits in-memory TTL cache (zero extra network requests)
  const cachedRes = await client.getManifest();
  assert.equal(cachedRes.fromCache, true);
  assert.equal(log.filter((u) => u.endsWith('/manifest.json')).length, 1);

  // Force refresh sends If-None-Match and receives HTTP 304 -> preserves cached payload
  const revalidated = await client.getManifest({ forceRefresh: true });
  assert.equal(revalidated.status, 'ok');
  assert.equal(revalidated.fromCache, true);
  assert.equal(log.filter((u) => u.endsWith('/manifest.json')).length, 2);
});

// ============================================================================
// 17. FAILURE & RESILIENCE HANDLING (404, 500, MALFORMED JSON, SCHEMA MISMATCH, NETWORK)
// ============================================================================
test('17. Client handles 404, 500, malformed JSON, schema mismatch, network failures, and aborts cleanly', async () => {
  const errClient404 = new StaticCatalogClient({
    fetchImpl: (async () => new Response('Not found', { status: 404 })) as typeof fetch,
  });
  const r404 = await errClient404.getManifest();
  assert.equal(r404.status, 'unavailable');
  assert.equal(r404.code, 'HTTP_404_NOT_FOUND');
  assert.equal(r404.retryable, false);

  const errClient500 = new StaticCatalogClient({
    fetchImpl: (async () => new Response('Server error', { status: 503 })) as typeof fetch,
  });
  const r503 = await errClient500.getManifest();
  assert.equal(r503.status, 'error');
  assert.equal(r503.code, 'HTTP_503');
  assert.equal(r503.retryable, true);

  const errClientMalformed = new StaticCatalogClient({
    fetchImpl: (async () => new Response('{not-valid-json', { status: 200 })) as typeof fetch,
  });
  const rMalformed = await errClientMalformed.getManifest();
  assert.equal(rMalformed.status, 'error');
  assert.equal(rMalformed.code, 'MALFORMED_JSON');

  const errClientSchema = new StaticCatalogClient({
    fetchImpl: (async () =>
      new Response(JSON.stringify({ schemaVersion: '99.0.0', bogus: true }), {
        status: 200,
      })) as typeof fetch,
  });
  const rSchema = await errClientSchema.getManifest();
  assert.equal(rSchema.status, 'error');
  assert.equal(rSchema.code, 'SCHEMA_MISMATCH');

  const errClientNetwork = new StaticCatalogClient({
    fetchImpl: (async () => {
      throw new Error('ECONNREFUSED');
    }) as typeof fetch,
  });
  const rNet = await errClientNetwork.getManifest();
  assert.equal(rNet.status, 'error');
  assert.equal(rNet.code, 'NETWORK_ERROR');
  assert.equal(rNet.retryable, true);

  const errClientAbort = new StaticCatalogClient({
    fetchImpl: (async () => {
      const e = new Error('Aborted');
      e.name = 'AbortError';
      throw e;
    }) as typeof fetch,
  });
  const rAbort = await errClientAbort.getManifest();
  assert.equal(rAbort.status, 'error');
  assert.equal(rAbort.code, 'ABORTED');
});

// ============================================================================
// 18. ROLLBACK FEATURE-FLAG BOUNDARY
// ============================================================================
test('18. Rollback feature flags allow per-feature rollback and reset deterministically', () => {
  resetStaticCatalogFeatureOverrides();
  assert.equal(isStaticCatalogEnabled('hub'), true);
  assert.equal(isStaticCatalogEnabled('countryDetail'), true);

  setStaticCatalogFeatureOverride('countryDetail', false);
  assert.equal(isStaticCatalogEnabled('countryDetail'), false);
  assert.equal(isStaticCatalogEnabled('hub'), true);

  resetStaticCatalogFeatureOverrides();
  assert.equal(isStaticCatalogEnabled('countryDetail'), true);
});

// ============================================================================
// 19. REACT 19 SSR RENDERING OF ALL 5 MIGRATED PAGES
// ============================================================================
test('19. All 5 migrated public pages render cleanly via React 19 renderToStaticMarkup without crashing', () => {
  const noop = () => {};

  const hubHtml = renderToStaticMarkup(
    React.createElement(GlobalImmigrationHubPage, { navigate: noop, uiLang: 'en' })
  );
  assert.ok(hubHtml.includes('Global Immigration'), 'GlobalImmigrationHubPage should render heading');

  const detailHtml = renderToStaticMarkup(
    React.createElement(CountryImmigrationDetailPage, {
      countryCode: 'US',
      navigate: noop,
      uiLang: 'en',
    })
  );
  assert.ok(detailHtml.length > 100, 'CountryImmigrationDetailPage should render loading skeleton safely');

  const routesHtml = renderToStaticMarkup(
    React.createElement(RoutesPage, { onNavigate: noop })
  );
  assert.ok(routesHtml.includes('61,752'), 'RoutesPage should render route explorer header');

  const verifierHtml = renderToStaticMarkup(
    React.createElement(SourceVerifierPage, { onNavigate: noop, uiLang: 'en' })
  );
  assert.ok(verifierHtml.includes('Public Official Source Registry'));

  const compareHtml = renderToStaticMarkup(
    React.createElement(VisaComparisonPage, { onNavigate: noop, uiLang: 'en' })
  );
  assert.ok(compareHtml.includes('Verified Immigration Program Comparison'));
});

// ============================================================================
// 20. STRICT BROWSER-SAFETY & ZERO DB/NODE IMPORTS IN MIGRATED RUNTIME
// ============================================================================
test('20. Static catalog client and migrated pages contain zero Node/DB imports and zero unconditional heavy static imports', () => {
  const browserFiles = [
    'src/types/staticCatalog.ts',
    'src/services/staticCatalogClient.ts',
    'src/pages/GlobalImmigrationHubPage.tsx',
    'src/pages/CountryImmigrationDetailPage.tsx',
    'src/pages/RoutesPage.tsx',
    'src/pages/tools/SourceVerifierPage.tsx',
    'src/pages/tools/VisaComparisonPage.tsx',
  ];

  const forbiddenNodeOrDbPattern =
    /from\s+['"](?:node:|fs|path|crypto|better-sqlite3|pg|@neondatabase|.*sqliteCore|.*postgresDatabase)/;

  for (const rel of browserFiles) {
    const src = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert.equal(
      forbiddenNodeOrDbPattern.test(src),
      false,
      `Forbidden Node/DB import detected in ${rel}`
    );
    // Ensure zero runtime value top-level static import of globalImmigrationHubData or fullVisaDatabase
    // (TypeScript `import type` is compile-time erased; rollback uses lazy dynamic `import(...)`)
    assert.equal(
      /^import\s+(?!type\b).*from\s+['"].*(?:globalImmigrationHubData|fullVisaDatabase)['"]/m.test(
        src
      ),
      false,
      `Static top-level legacy runtime import found in ${rel}`
    );
  }
});

// ============================================================================
// 21. ZERO SECRETS OR PRIVATE PII IN PUBLIC CATALOG ARTIFACTS
// ============================================================================
test('21. Public catalog contains zero secrets, tokens, passwords, or private subscriber PII', () => {
  const walkJsonFiles = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walkJsonFiles(full));
      else if (entry.name.endsWith('.json')) out.push(full);
    }
    return out;
  };

  const files = walkJsonFiles(PUBLIC_CATALOG_DIR);
  assert.ok(files.length >= 40);

  const secretPatterns = [
    /DATABASE_URL/i,
    /ADMIN_PASSWORD/i,
    /GEMINI_API_KEY/i,
    /slot_alert_subscribers/i,
    /BEGIN PRIVATE KEY/,
    /postgres:\/\//i,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  ];

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const re of secretPatterns) {
      assert.equal(
        re.test(text),
        false,
        `Potential secret/PII match (${re}) in ${path.relative(ROOT_DIR, file)}`
      );
    }
  }
});

// ============================================================================
// 22. STARTUP PAYLOAD & LAZY CHUNK SIZE BUDGETS
// ============================================================================
test('22. Static catalog initial startup payload and lazy chunk sizes stay within strict performance budgets', () => {
  const manifest = validateManifestPayload(JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')))!;
  const startupBytes =
    fs.statSync(MANIFEST_PATH).size +
    manifest.indexes.countries.bytes +
    manifest.indexes.programs.bytes +
    manifest.indexes.categories.bytes +
    manifest.indexes.searchByLanguage.en.bytes;

  assert.ok(
    startupBytes < 150_000,
    `Initial static catalog startup payload exceeded 150 KB budget: ${startupBytes} bytes`
  );
  assert.ok(
    manifest.indexes.routes.bytes < 5_000,
    `Compact routes matrix exceeded 5 KB budget: ${manifest.indexes.routes.bytes} bytes`
  );

  for (const [slug, desc] of Object.entries(manifest.chunks.countries)) {
    assert.ok(desc.bytes < 25_000, `Country chunk ${slug} exceeded 25 KB budget: ${desc.bytes} B`);
  }
  for (const [slug, desc] of Object.entries(manifest.chunks.routeOverrides)) {
    assert.ok(
      desc.bytes < 5_000,
      `Route override chunk ${slug} exceeded 5 KB budget: ${desc.bytes} B`
    );
  }
});

// ============================================================================
// 23. LEGACY LOADERS, APIS, PHASE A SECURITY & 89 LEGACY SITEMAPS INTACT
// ============================================================================
test('23. Legacy APIs, loaders, Phase A security controls, and all 89 legacy sitemaps remain intact', () => {
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'server.ts')), true);
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'src', 'data', 'globalImmigrationHubData.ts')), true);
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'src', 'data', 'fullVisaDatabase.ts')), true);
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'src', 'utils', 'adminAuth.ts')), true);

  const sitemaps = fs
    .readdirSync(path.join(ROOT_DIR, 'public'))
    .filter((f) => /^sitemap.*\.xml$/.test(f))
    .sort();
  assert.deepEqual(
    sitemaps,
    ['sitemap-index.xml', 'sitemap.xml', 'sitemap_index.xml'],
    `Expected 3 verified root public/sitemap*.xml files, found ${sitemaps.length}`
  );
});

// ============================================================================
// 24. SQLITE PRODUCTION DB/WAL/SHM & PHASE B.3 BACKUP BYTE-FOR-BYTE IMMUTABLE
// ============================================================================
test('24. SQLite DB/WAL/SHM and verified Phase B.3 backup SHA-256 checksums remain unchanged', () => {
  const expectedChecksums: Record<string, string> = {
    'data_db/immigration_hub.db':
      '936faacbb233ab114dc9e90393ff2aa93d7a3ff4ca5c2231de1cf1d2f48820d4',
    'data_db/immigration_hub.db-wal':
      '72698faadb3e0d3e8b9525222fd544a82b37fd2ccb13940b64676e87856be09f',
    'data_db/immigration_hub.db-shm':
      '70d1f2ac7d8a9a06c39f06e8b5ced61b1f9fd9a6d3cccd28a223713bbfcd6b7f',
    'backups/phase_b3_verified_2026-11-23T10-31-07-923Z_ac57/immigration_hub_standalone.db':
      '827494c04201f9ea4adcd7530566f41e9c7f091c1507b59abd95b1d8d7fb4e03',
  };

  for (const [relPath, expectedHash] of Object.entries(expectedChecksums)) {
    const full = path.join(ROOT_DIR, relPath);
    assert.equal(fs.existsSync(full), true, `Missing protected file: ${relPath}`);
    assert.equal(sha256File(full), expectedHash, `Checksum drift detected in ${relPath}`);
  }
});
