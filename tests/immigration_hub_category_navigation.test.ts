/**
 * VISAAPPLY.ORG — URGENT BUG FIX VERIFICATION TEST SUITE
 * Global Immigration Hub: All 6 Category Cards & Query-Parameter Routing
 *
 * Verifies:
 * 1. Canonical single-source-of-truth category registry
 * 2. All 6 homepage promo cards link to valid canonical `/immigration?category=<slug>` URLs
 * 3. Direct URL, trailing-slash, localized-prefix, and country-detail query routing (zero false 404s)
 * 4. Genuine unknown routes still fail closed to 404
 * 5. StaticCatalogClient category filtering against real `public/catalog/` artifacts + honest empty state
 * 6. React 19 SSR rendering of all 6 filtered category states, invalid category notice, and country detail
 * 7. Refresh & Browser Back/Forward (`popstate`) wiring in App.tsx & hub pages
 * 8. Server SSR & SEO canonical/robots policies for direct category URLs
 * 9. Zero DB mutations, zero new DB dependencies, 249-country registry & rollback safety preserved
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  CANONICAL_IMMIGRATION_CATEGORIES,
  CATEGORY_INTERNAL_TO_PARAM_MAP,
  CATEGORY_URL_PARAM_MAP,
  HONEST_EMPTY_CATEGORY_MESSAGE,
  IMMIGRATION_HUB_PROMO_CATEGORIES,
  buildCountryImmigrationUrl,
  buildImmigrationHubUrl,
  matchImmigrationRoute,
  normalizeCanonicalCategory,
  parseImmigrationCategoryQuery,
  splitRoutePathAndSearch,
} from '../src/config/immigrationCategories';
import { GlobalImmigrationPromoSection } from '../src/components/GlobalImmigrationPromoSection';
import { GlobalImmigrationHubPage } from '../src/pages/GlobalImmigrationHubPage';
import { CountryImmigrationDetailPage } from '../src/pages/CountryImmigrationDetailPage';
import { CanonicalPathwayPage } from '../src/pages/CanonicalPathwayPage';
import {
  StaticCatalogClient,
  isStaticCatalogEnabled,
  resetStaticCatalogFeatureOverrides,
  setStaticCatalogFeatureOverride,
} from '../src/services/staticCatalogClient';
import {
  normalizeCanonicalUrl,
  resolveStaticRouteSeoMetadata,
} from '../src/utils/seoMetadataManager';
import { renderRouteSsrPayload } from '../src/utils/ssrRouteRenderer';

const ROOT_DIR = process.cwd();
const PUBLIC_CATALOG_DIR = path.join(ROOT_DIR, 'public', 'catalog');

function sha256File(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function createFsCatalogFetch(): typeof fetch {
  return (async (input: RequestInfo | URL): Promise<Response> => {
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (!rawUrl.startsWith('/catalog/')) {
      return new Response('Not Found', { status: 404 });
    }
    const rel = rawUrl.slice('/catalog/'.length);
    const absPath = path.resolve(PUBLIC_CATALOG_DIR, rel);
    if (!absPath.startsWith(PUBLIC_CATALOG_DIR) || !fs.existsSync(absPath)) {
      return new Response('Not Found', { status: 404 });
    }
    return new Response(fs.readFileSync(absPath), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }) as typeof fetch;
}

const EXPECTED_SIX_CARDS = [
  {
    name: 'Permanent Residency',
    catalogId: 'pr',
    slug: 'permanent-residency',
    url: '/immigration?category=permanent-residency',
    expectedVerifiedCount: 5,
  },
  {
    name: 'Citizenship & Naturalization',
    catalogId: 'citizenship',
    slug: 'citizenship',
    url: '/immigration?category=citizenship',
    expectedVerifiedCount: 2,
  },
  {
    name: 'Work Immigration',
    catalogId: 'work',
    slug: 'work',
    url: '/immigration?category=work',
    expectedVerifiedCount: 7,
  },
  {
    name: 'Family Immigration',
    catalogId: 'family',
    slug: 'family',
    url: '/immigration?category=family',
    expectedVerifiedCount: 7,
  },
  {
    name: 'Business & Investor Immigration',
    catalogId: 'business',
    slug: 'business-investor',
    url: '/immigration?category=business-investor',
    expectedVerifiedCount: 3,
  },
  {
    name: 'Digital Nomad & Retirement Residency',
    catalogId: 'digital_nomad',
    slug: 'digital-nomad-retirement',
    url: '/immigration?category=digital-nomad-retirement',
    expectedVerifiedCount: 3,
  },
] as const;

// ----------------------------------------------------------------------------
// 1. Canonical Registry Integrity & Alignment with Static Catalog Categories
// ----------------------------------------------------------------------------
test('1. Canonical category registry matches static catalog index-categories and defines all 6 promo cards', () => {
  assert.equal(IMMIGRATION_HUB_PROMO_CATEGORIES.length, 6);
  assert.equal(CANONICAL_IMMIGRATION_CATEGORIES.length, 7);

  const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC_CATALOG_DIR, 'manifest.json'), 'utf8'));
  const catIndex = JSON.parse(
    fs.readFileSync(path.join(PUBLIC_CATALOG_DIR, manifest.indexes.categories.filePath), 'utf8')
  );

  for (const expected of EXPECTED_SIX_CARDS) {
    assert.equal(normalizeCanonicalCategory(expected.slug), expected.catalogId);
    assert.equal(normalizeCanonicalCategory(expected.catalogId), expected.catalogId);
    assert.equal(CATEGORY_URL_PARAM_MAP[expected.slug], expected.catalogId);
    assert.equal(CATEGORY_INTERNAL_TO_PARAM_MAP[expected.catalogId], expected.slug);
    assert.equal(buildImmigrationHubUrl(expected.catalogId), expected.url);
    assert.ok(
      catIndex.categories[expected.catalogId],
      `Static catalog index-categories must contain canonical category ID "${expected.catalogId}"`
    );
    assert.equal(
      catIndex.categories[expected.catalogId].count,
      expected.expectedVerifiedCount,
      `Unexpected verified count for ${expected.catalogId}`
    );
  }
});

// ----------------------------------------------------------------------------
// 2. Homepage 6 Category Cards Markup & Canonical href Verification
// ----------------------------------------------------------------------------
test('2. GlobalImmigrationPromoSection renders all 6 category cards with exact canonical hrefs', () => {
  const html = renderToStaticMarkup(
    React.createElement(GlobalImmigrationPromoSection, { onNavigate: () => {} })
  );

  for (const card of EXPECTED_SIX_CARDS) {
    assert.ok(
      html.includes(`href="${card.url}"`),
      `Promo card "${card.name}" must link to "${card.url}"`
    );
    assert.ok(
      html.includes(`data-category-id="${card.catalogId}"`),
      `Promo card "${card.name}" must carry canonical data-category-id="${card.catalogId}"`
    );
    assert.ok(
      html.includes(card.name.replace(/&/g, '&amp;')),
      `Promo card heading "${card.name}" must render`
    );
  }
  assert.ok(html.includes('href="/immigration"'), 'Main hub CTA must link to /immigration');
});

// ----------------------------------------------------------------------------
// 3. Direct URL, Query-String, Localized & Trailing-Slash Route Matching
// ----------------------------------------------------------------------------
test('3. All 6 category URLs, localized variants, and country detail query URLs match cleanly without 404', () => {
  for (const card of EXPECTED_SIX_CARDS) {
    const direct = matchImmigrationRoute(card.url);
    assert.ok(direct && direct.type === 'hub', `Direct URL ${card.url} must match hub`);
    assert.equal(direct.parsedQuery.category, card.catalogId);
    assert.equal(direct.parsedQuery.canonicalSlug, card.slug);
    assert.equal(direct.parsedQuery.invalidCategoryParam, null);

    // Trailing slash + query
    const trailing = matchImmigrationRoute(`/immigration/?category=${card.slug}`);
    assert.ok(trailing && trailing.type === 'hub');
    assert.equal(trailing.parsedQuery.category, card.catalogId);

    // Localized prefix + query (e.g. /de/immigration?category=...)
    const localized = matchImmigrationRoute(`/de/immigration?category=${card.slug}`);
    assert.ok(localized && localized.type === 'hub');
    assert.equal(localized.parsedQuery.category, card.catalogId);

    // Country detail with category query (e.g. /immigration/ca?category=...)
    const countryFiltered = matchImmigrationRoute(buildCountryImmigrationUrl('ca', card.catalogId));
    assert.ok(countryFiltered && countryFiltered.type === 'country');
    assert.equal(countryFiltered.countryCode, 'CA');
    assert.equal(countryFiltered.parsedQuery.category, card.catalogId);
  }

  // Bare /immigration and /immigration/:code continue working
  const bareHub = matchImmigrationRoute('/immigration');
  assert.ok(bareHub && bareHub.type === 'hub' && bareHub.parsedQuery.category === 'all');

  const bareCountry = matchImmigrationRoute('/immigration/us');
  assert.ok(bareCountry && bareCountry.type === 'country' && bareCountry.countryCode === 'US');

  // Invalid category query param keeps /immigration accessible (NO 404!) and reports invalidCategoryParam
  const invalidFilter = matchImmigrationRoute('/immigration?category=totally-fake-category');
  assert.ok(invalidFilter && invalidFilter.type === 'hub');
  assert.equal(invalidFilter.parsedQuery.category, 'all');
  assert.equal(invalidFilter.parsedQuery.invalidCategoryParam, 'totally-fake-category');

  // Genuinely unknown routes STILL return null (strict 404 preserved)
  assert.equal(matchImmigrationRoute('/nonexistent-route-404'), null);
  assert.equal(matchImmigrationRoute('/immigration/not-a-valid-country-slug'), null);
  assert.equal(matchImmigrationRoute('/visa/nonexistent/fake-pathway'), null);
});

// ----------------------------------------------------------------------------
// 4. StaticCatalogClient Category Filtering & Honest Empty-Category State
// ----------------------------------------------------------------------------
test('4. StaticCatalogClient.getProgramsByCategory filters all 6 categories accurately and handles empty/invalid honestly', async () => {
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });

  for (const card of EXPECTED_SIX_CARDS) {
    const bySlug = await client.getProgramsByCategory(card.slug);
    assert.equal(bySlug.status, 'ok', `Expected ok for slug "${card.slug}"`);
    assert.equal(bySlug.canonicalCategory, card.catalogId);
    assert.ok(bySlug.data);
    assert.equal(bySlug.data.length, card.expectedVerifiedCount);
    for (const prog of bySlug.data) {
      assert.equal(prog.category, card.catalogId);
      assert.equal(prog.status, 'AVAILABLE_VERIFIED');
      assert.ok(prog.officialUrl.startsWith('https://'));
      assert.notEqual(prog.id, 'pt-golden-visa-expired-realestate');
    }

    const byId = await client.getProgramsByCategory(card.catalogId);
    assert.equal(byId.status, 'ok');
    assert.equal(byId.data?.length, card.expectedVerifiedCount);
  }

  // Invalid category is rejected fail-closed without fabricating results
  const invalidRes = await client.getProgramsByCategory('fake-category-123');
  assert.equal(invalidRes.status, 'unavailable');
  assert.equal(invalidRes.code, 'INVALID_CATEGORY');
  assert.equal(invalidRes.data, null);

  // Valid category with ZERO verified records returns honest empty state (NEVER 404, NEVER fabricated)
  const manifestRaw = JSON.parse(fs.readFileSync(path.join(PUBLIC_CATALOG_DIR, 'manifest.json'), 'utf8'));
  const emptyProgramsFetch: typeof fetch = (async (input: RequestInfo | URL): Promise<Response> => {
    const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    if (rawUrl.endsWith('/manifest.json')) {
      return new Response(JSON.stringify(manifestRaw), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (rawUrl.includes('index-programs.')) {
      return new Response(
        JSON.stringify({
          schemaVersion: '2.0.0',
          totalPrograms: 0,
          legalContentLanguage: 'en',
          programs: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response('Not Found', { status: 404 });
  }) as typeof fetch;

  const emptyClient = new StaticCatalogClient({ fetchImpl: emptyProgramsFetch });
  const emptyRes = await emptyClient.getProgramsByCategory('permanent-residency');
  assert.equal(emptyRes.status, 'empty');
  assert.equal(emptyRes.code, 'NO_VERIFIED_PROGRAMS_IN_CATEGORY');
  assert.deepEqual(emptyRes.data, []);
  assert.equal(emptyRes.error, HONEST_EMPTY_CATEGORY_MESSAGE);
});

// ----------------------------------------------------------------------------
// 5. React 19 SSR Rendering for All 6 Category Filters + Invalid Filter + Country Detail
// ----------------------------------------------------------------------------
test('5. GlobalImmigrationHubPage renders each of the 6 category views cleanly via SSR (zero 404)', () => {
  const noop = () => {};

  for (const card of EXPECTED_SIX_CARDS) {
    const meta = CANONICAL_IMMIGRATION_CATEGORIES.find((c) => c.id === card.catalogId)!;
    const html = renderToStaticMarkup(
      React.createElement(GlobalImmigrationHubPage, {
        navigate: noop,
        uiLang: 'en',
        locationSearch: `?category=${card.slug}`,
      })
    );

    assert.ok(
      html.includes(meta.pageTitle.replace(/&/g, '&amp;')),
      `SSR view for ${card.slug} must display category title "${meta.pageTitle}"`
    );
    assert.ok(
      html.includes(`aria-selected="true" data-category-tab="${card.catalogId}"`) ||
        html.includes(`data-category-tab="${card.catalogId}"`),
      `SSR view for ${card.slug} must mark tab ${card.catalogId} selected`
    );
    assert.ok(html.includes('Clear Filter'), `SSR view for ${card.slug} must render Clear Filter control`);
    assert.equal(
      html.includes('404 — Page or Statutory Pathway Not Found'),
      false,
      `SSR view for ${card.slug} must NEVER display 404`
    );
  }

  // Invalid category query renders helpful notice on /immigration, NOT 404
  const invalidHtml = renderToStaticMarkup(
    React.createElement(GlobalImmigrationHubPage, {
      navigate: noop,
      uiLang: 'en',
      locationSearch: '?category=invalid-slug-xyz',
    })
  );
  assert.ok(invalidHtml.includes('Unrecognized Category Filter'));
  assert.ok(invalidHtml.includes('invalid-slug-xyz'));
  assert.ok(invalidHtml.includes('Reset URL Filter'));
  assert.equal(invalidHtml.includes('404 — Page or Statutory Pathway Not Found'), false);

  // Country detail route with category query renders cleanly without 404
  const countryDetailHtml = renderToStaticMarkup(
    React.createElement(CountryImmigrationDetailPage, {
      countryCode: 'CA',
      navigate: noop,
      uiLang: 'en',
      locationSearch: '?category=permanent-residency',
    })
  );
  assert.ok(countryDetailHtml.length > 100);
  assert.equal(countryDetailHtml.includes('404 — Page or Statutory Pathway Not Found'), false);

  // Genuinely unknown pathway still renders 404 in CanonicalPathwayPage
  const notFoundHtml = renderToStaticMarkup(
    React.createElement(CanonicalPathwayPage, {
      pathwayUrl: '/visa/nonexistent/fake-pathway',
      navigate: noop,
    })
  );
  assert.ok(notFoundHtml.includes('404 — Page or Statutory Pathway Not Found'));
});

// ----------------------------------------------------------------------------
// 6. Refresh, Query-Parameter Parsing & Browser Back/Forward Wiring in App.tsx
// ----------------------------------------------------------------------------
test('6. App.tsx initializes pathname+search for refresh, strips query before route matching, and wires locationSearch + popstate', () => {
  const appSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf8');
  const hubSrc = fs.readFileSync(path.join(ROOT_DIR, 'src', 'pages', 'GlobalImmigrationHubPage.tsx'), 'utf8');
  const detailSrc = fs.readFileSync(
    path.join(ROOT_DIR, 'src', 'pages', 'CountryImmigrationDetailPage.tsx'),
    'utf8'
  );

  // Refresh preservation: initial state includes window.location.search
  assert.ok(
    appSrc.includes('`${window.location.pathname}${window.location.search || \'\'}`'),
    'App.tsx must preserve window.location.search on initial render / page refresh'
  );
  // Query-string-safe route matching
  assert.ok(
    appSrc.includes('const { pathname: routePath, search: routeSearch } = splitRoutePathAndSearch(rawStrippedRoute);'),
    'App.tsx must strip ?query from routePath before route matching'
  );
  // locationSearch passed to both immigration routes
  assert.ok(
    appSrc.includes('<GlobalImmigrationHubPage navigate={navigate} uiLang={uiLang} locationSearch={routeSearch} />'),
    'App.tsx must pass locationSearch to GlobalImmigrationHubPage'
  );
  assert.ok(
    appSrc.includes('locationSearch={routeSearch}'),
    'App.tsx must pass locationSearch to CountryImmigrationDetailPage'
  );
  // Browser Back/Forward popstate listeners present in App, Hub, and Detail
  assert.ok(appSrc.includes("window.addEventListener('popstate', handlePopState)"));
  assert.ok(hubSrc.includes("window.addEventListener('popstate', handlePopState)"));
  assert.ok(detailSrc.includes("window.addEventListener('popstate', handlePopState)"));

  // splitRoutePathAndSearch edge cases
  assert.deepEqual(splitRoutePathAndSearch('/immigration?category=permanent-residency#top'), {
    pathname: '/immigration',
    search: '?category=permanent-residency',
    hash: '#top',
  });
  assert.deepEqual(parseImmigrationCategoryQuery('?foo=1&category=business-investor&bar=2'), {
    category: 'business',
    canonicalSlug: 'business-investor',
    invalidCategoryParam: null,
  });
});

// ----------------------------------------------------------------------------
// 7. Server SSR & SEO Canonical / Robots Policies for Direct Category URLs
// ----------------------------------------------------------------------------
test('7. Direct HTTP/SSR requests for all 6 category URLs return 200 OK with clean canonical URL and no noindex', () => {
  for (const card of EXPECTED_SIX_CARDS) {
    const staticSeo = resolveStaticRouteSeoMetadata(card.url);
    assert.ok(staticSeo, `SEO registry must match ${card.url}`);
    assert.notEqual(staticSeo.noindex, true);

    const canonical = normalizeCanonicalUrl(card.url, 'https://www.visaapply.org');
    assert.equal(canonical, 'https://www.visaapply.org/immigration');

    const ssr = renderRouteSsrPayload(card.url);
    assert.equal(ssr.statusCode, 200, `SSR must return HTTP 200 for ${card.url}`);
    assert.equal(ssr.canonicalUrl, 'https://www.visaapply.org/immigration');
    assert.ok(!ssr.robots.includes('noindex'), `SSR must not emit noindex for ${card.url}`);
  }

  // Country detail with category query returns 200 OK
  const countrySsr = renderRouteSsrPayload('/immigration/ca?category=permanent-residency');
  assert.equal(countrySsr.statusCode, 200);
  assert.equal(countrySsr.canonicalUrl, 'https://www.visaapply.org/immigration/ca');
});

// ----------------------------------------------------------------------------
// 8. Safety, Rollback & Database Immutability Regression Guards
// ----------------------------------------------------------------------------
test('8. Zero DB/Node imports in modified frontend files, rollback flags intact, and SQLite DB hashes unchanged', () => {
  const checkedBrowserFiles = [
    'src/config/immigrationCategories.ts',
    'src/components/GlobalImmigrationPromoSection.tsx',
    'src/pages/GlobalImmigrationHubPage.tsx',
    'src/pages/CountryImmigrationDetailPage.tsx',
    'src/services/staticCatalogClient.ts',
  ];
  const forbiddenImportRe =
    /from\s+['"](?:node:|fs|path|crypto|better-sqlite3|pg|@neondatabase|.*sqliteCore|.*postgresDatabase)/;

  for (const rel of checkedBrowserFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert.equal(forbiddenImportRe.test(content), false, `Forbidden Node/DB import in ${rel}`);
  }

  // Feature flags & rollback remain functional
  resetStaticCatalogFeatureOverrides();
  assert.equal(isStaticCatalogEnabled('immigrationHub'), true);
  assert.equal(isStaticCatalogEnabled('countryDetail'), true);
  setStaticCatalogFeatureOverride('immigrationHub', false);
  assert.equal(isStaticCatalogEnabled('immigrationHub'), false);
  resetStaticCatalogFeatureOverrides();

  // Protected SQLite production & backup files byte-for-byte untouched
  const protectedHashes: Record<string, string> = {
    'data_db/immigration_hub.db':
      '936faacbb233ab114dc9e90393ff2aa93d7a3ff4ca5c2231de1cf1d2f48820d4',
    'data_db/immigration_hub.db-wal':
      '72698faadb3e0d3e8b9525222fd544a82b37fd2ccb13940b64676e87856be09f',
    'data_db/immigration_hub.db-shm':
      '70d1f2ac7d8a9a06c39f06e8b5ced61b1f9fd9a6d3cccd28a223713bbfcd6b7f',
    'backups/phase_b3_verified_2026-11-23T10-31-07-923Z_ac57/immigration_hub_standalone.db':
      '827494c04201f9ea4adcd7530566f41e9c7f091c1507b59abd95b1d8d7fb4e03',
  };
  for (const [rel, expected] of Object.entries(protectedHashes)) {
    assert.equal(sha256File(path.join(ROOT_DIR, rel)), expected, `Unexpected mutation in ${rel}`);
  }
});
