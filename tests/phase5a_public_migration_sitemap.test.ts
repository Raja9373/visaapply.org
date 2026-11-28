/**
 * VISAAPPLY.ORG — PHASE 5A VERIFICATION SUITE
 *
 * Verifies:
 * 1. Migration of 5 public modules (BlogArticleView, AutoBlogger, VisaComparison,
 *    VerificationView, SitemapPage) to the zero-DB static catalog architecture.
 * 2. Isolation of persistent-storage pages (EmbassySlotAlertPage, VisaTrackingPage)
 *    with zero localStorage PII fallback and zero fake-success on network failure.
 * 3. Feature-flag rollback controls for all 5 Phase 5A feature keys.
 * 4. Candidate valid-only sitemap output validation (`public/sitemaps-static/`):
 *    route resolution (including all 28 `/visa/:iso/:programId` URLs), canonicals,
 *    zero duplicates, zero quarantined/draft/expired/uninhabited/thin leaks, valid
 *    hreflang, intact 89 legacy sitemaps, and robots.txt consistency.
 * 5. Public artifact PII/secret scan and SQLite DB/WAL/SHM/backup SHA-256 immutability.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  StaticCatalogClient,
  isStaticCatalogEnabled,
  setStaticCatalogFeatureOverride,
  resetStaticCatalogFeatureOverrides,
} from '../src/services/staticCatalogClient';
import {
  isRouteRegisteredInSeoManager,
  normalizeCanonicalUrl,
} from '../src/utils/seoMetadataManager';
import { renderRouteSsrPayload } from '../src/utils/ssrRouteRenderer';
import { BlogArticleView } from '../src/components/BlogArticleView';
import { BlogsPage, FeaturedBlogsCarousel } from '../src/components/AutoBlogger';
import { VisaComparison } from '../src/components/VisaComparison';
import { VerificationView } from '../src/components/VerificationView';
import { SitemapPage } from '../src/pages/SitemapPage';
import { EmbassySlotAlertPage } from '../src/pages/EmbassySlotAlertPage';
import { VisaTrackingPage } from '../src/pages/VisaTrackingPage';

const ROOT_DIR = process.cwd();
const PUBLIC_CATALOG_DIR = path.join(ROOT_DIR, 'public/catalog');
const CANDIDATE_SITEMAP_DIR = path.join(ROOT_DIR, 'public/sitemaps-static');

function createFsCatalogFetch(): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const urlStr = typeof input === 'string' ? input : input.toString();
    const rel = urlStr.replace(/^https?:\/\/[^/]+/i, '').replace(/^\/catalog\//, '');
    const fullPath = path.join(PUBLIC_CATALOG_DIR, rel);
    if (!fs.existsSync(fullPath)) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }
    const body = fs.readFileSync(fullPath, 'utf8');
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/json',
        etag: `"${crypto.createHash('sha1').update(body).digest('hex')}"`,
      },
    });
  }) as typeof fetch;
}

function sha256File(relPath: string): string {
  const full = path.join(ROOT_DIR, relPath);
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(full));
  return hash.digest('hex');
}

// ---------------------------------------------------------------------------
// 1. Static Import Hygiene (Zero DB / Zero Monolith Static Imports in Migrated Modules)
// ---------------------------------------------------------------------------
test('Phase 5A migrated public modules have zero static monolith, Node, or DB imports', () => {
  const migratedFiles = [
    'src/components/BlogArticleView.tsx',
    'src/components/AutoBlogger.tsx',
    'src/components/VisaComparison.tsx',
    'src/components/VerificationView.tsx',
    'src/pages/SitemapPage.tsx',
  ];

  const forbiddenStaticImportPatterns = [
    /^\s*import\s+.*from\s+['"]\.\.?\/data\/fullVisaDatabase['"]/m,
    /^\s*import\s+.*from\s+['"]\.\.?\/data\/globalImmigrationHubData['"]/m,
    /^\s*import\s+.*from\s+['"]\.\.?\/data\/ukVisas['"]/m,
    /^\s*import\s+.*from\s+['"]\.\.?\/data\/ukAdditionalRoutes['"]/m,
    /^\s*import\s+(?!type\b).*from\s+['"]\.\.?\/data\/blogGenerator['"]/m,
    /^\s*import\s+.*from\s+['"]\.\.?\/data\/countryMetaData['"]/m,
    /better-sqlite3/,
    /@neondatabase\/serverless/,
    /from\s+['"](?:node:)?(?:fs|path|sqlite|pg)['"]/,
  ];

  for (const relPath of migratedFiles) {
    const src = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
    for (const pattern of forbiddenStaticImportPatterns) {
      assert.equal(
        pattern.test(src),
        false,
        `${relPath} must not contain forbidden static import matching ${pattern}`
      );
    }
    assert.ok(
      src.includes('staticCatalogClient'),
      `${relPath} must use staticCatalogClient`
    );
    assert.ok(
      src.includes('isStaticCatalogEnabled'),
      `${relPath} must preserve isStaticCatalogEnabled rollback feature flag`
    );
  }
});

// ---------------------------------------------------------------------------
// 2. BlogArticleView & AutoBlogger Editorial Static Catalog Contract
// ---------------------------------------------------------------------------
test('Static editorial chunks expose ONLY published articles and fail-closed on drafts', async () => {
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });

  const idx = await client.getEditorialIndex();
  assert.equal(idx.status, 'ok');
  assert.ok(idx.data);
  assert.equal(idx.data.totalPublished, 2);

  for (const art of idx.data.articles) {
    const chunk = await client.getEditorialChunk(art.slug);
    assert.equal(chunk.status, 'ok', `Published slug ${art.slug} must load`);
    assert.ok(chunk.data);
    assert.equal(chunk.data.editorialStatus, 'published');
    assert.ok(chunk.data.markdownContent.length > 100);
    assert.ok(chunk.data.officialReferences.length >= 1);
    assert.ok(chunk.data.officialReferences.every((u) => u.startsWith('https://')));
  }

  // Draft article MUST fail closed
  const draftRes = await client.getEditorialChunk('ga-to-fj-student');
  assert.equal(draftRes.status, 'unavailable');
  assert.equal(draftRes.data, null);
  assert.equal(draftRes.code, 'EDITORIAL_ARTICLE_NOT_PUBLISHED');

  // Unknown article MUST fail closed
  const unknownRes = await client.getEditorialChunk('nonexistent-fabricated-guide-2026');
  assert.equal(unknownRes.status, 'unavailable');
  assert.equal(unknownRes.data, null);
});

test('BlogArticleView and AutoBlogger enforce sanitization, accessible breadcrumbs, and no public auto-publish', () => {
  const blogSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/BlogArticleView.tsx'), 'utf8');
  assert.ok(blogSrc.includes('sanitizeHtml('), 'BlogArticleView must sanitize HTML');
  assert.ok(blogSrc.includes('sanitizeUrl('), 'BlogArticleView must sanitize external URLs');
  assert.ok(blogSrc.includes('export interface Article'), 'BlogArticleView must preserve Article export');
  assert.equal(blogSrc.includes('/api/articles'), false, 'Public BlogArticleView must not call /api/articles');
  assert.equal(blogSrc.includes('/api/faq'), false, 'Public BlogArticleView must not call /api/faq');
  assert.equal(blogSrc.includes('/api/ask-faq'), false, 'Public BlogArticleView must not call /api/ask-faq');
  assert.equal(/<span[^>]*onClick=/i.test(blogSrc), false, 'BlogArticleView must not use <span onClick>');

  const autoBloggerSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/AutoBlogger.tsx'), 'utf8');
  assert.equal(autoBloggerSrc.includes('Generate Next 10 Daily Blogs'), false, 'Public AutoBlogger must not expose auto-generation trigger');
  assert.equal(autoBloggerSrc.includes('2,490+'), false, 'Public AutoBlogger must not claim 2,490+ synthetic blogs');
  assert.equal(autoBloggerSrc.includes('6:00 AM IST'), false, 'Public AutoBlogger must not claim automated daily publishing');
});

// ---------------------------------------------------------------------------
// 3. VerificationSummary & 4 Strictly Separate Canonical Metrics
// ---------------------------------------------------------------------------
test('VerificationSummary distinguishes verified, awaiting/quarantined, expired, uninhabited, and 4 separate metrics', async () => {
  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });
  const sumRes = await client.getVerificationSummary();
  assert.equal(sumRes.status, 'ok');
  assert.ok(sumRes.data);

  const m = sumRes.data.canonicalMetrics;
  assert.equal(m.isoCountriesRegistry, 249);
  assert.equal(m.potentialBilateralRoutes, 61752);
  assert.equal(m.trackedCoverageSlots, 1743);
  assert.equal(m.verifiedActiveCountries, 14);
  assert.equal(m.awaitingOfficialVerificationCountries, 228);
  assert.equal(m.uninhabitedTerritories, 7);
  assert.equal(m.verifiedActiveCountries + m.awaitingOfficialVerificationCountries + m.uninhabitedTerritories, 249);
  assert.equal(m.verifiedAvailablePrograms, 28);
  assert.equal(m.expiredExcludedPrograms, 1);
  assert.equal(m.verifiedOfficialHttpsSources, 61);
  assert.equal(m.publishedEditorialArticles, 2);
  assert.equal(m.excludedDraftEditorialArticles, 3);

  assert.equal(sumRes.data.expiredProgramNotices.length, 1);
  assert.equal(sumRes.data.expiredProgramNotices[0].countryIso, 'PT');
  assert.equal(sumRes.data.expiredProgramNotices[0].status, 'EXPIRED');

  // Verify VerificationView preserves Phase 4.3 forbidden-claim guardrails
  const verSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/components/VerificationView.tsx'), 'utf8');
  for (const forbidden of ['11,563', '14.084', '10 Languages', '10 Auto-Detected', 'GovernmentService', '540+ Global Visas', '100% Excel Sheet']) {
    assert.equal(verSrc.includes(forbidden), false, `VerificationView must not contain "${forbidden}"`);
  }
});

// ---------------------------------------------------------------------------
// 4. Persistent-Storage Feature Isolation (EmbassySlotAlertPage & VisaTrackingPage)
// ---------------------------------------------------------------------------
test('EmbassySlotAlertPage and VisaTrackingPage do not fake persistence or store email PII in localStorage', () => {
  const slotSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/EmbassySlotAlertPage.tsx'), 'utf8');
  assert.equal(
    /catch\s*(?:\([^)]*\))?\s*\{\s*setSubscribed\(\s*true\s*\)/.test(slotSrc),
    false,
    'EmbassySlotAlertPage must never fake setSubscribed(true) on network errors'
  );
  assert.ok(
    slotSrc.includes('Persistent Backend Required'),
    'EmbassySlotAlertPage must clearly disclose persistent backend requirement'
  );
  assert.equal(slotSrc.includes('localStorage.setItem'), false, 'EmbassySlotAlertPage must not store PII in localStorage');

  const trackSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/VisaTrackingPage.tsx'), 'utf8');
  assert.equal(
    trackSrc.includes('visaapply_email_subscribers'),
    false,
    'VisaTrackingPage must not write email PII to localStorage'
  );
  assert.equal(
    /\balert\s*\(/.test(trackSrc),
    false,
    'VisaTrackingPage must not call window.alert()'
  );
  assert.ok(trackSrc.includes('https://ceac.state.gov/'), 'VisaTrackingPage must preserve official CEAC tracking link');
  assert.ok(trackSrc.includes('https://www.vfsglobal.com/'), 'VisaTrackingPage must preserve official VFS Global tracking link');
  assert.ok(trackSrc.includes('https://www.canada.ca/'), 'VisaTrackingPage must preserve official IRCC tracking link');
  assert.ok(trackSrc.includes('https://www.gov.uk/'), 'VisaTrackingPage must preserve official GOV.UK tracking link');
});

// ---------------------------------------------------------------------------
// 5. React 19 SSR Render Smoke Tests for All 5 Migrated Modules + 2 Isolated Pages
// ---------------------------------------------------------------------------
test('All 5 migrated public modules and 2 isolated pages render cleanly via React 19 renderToStaticMarkup', () => {
  const noop = () => {};

  const blogHtml = renderToStaticMarkup(
    React.createElement(BlogArticleView, { pathSlug: 'in-to-ca-tourist', navigate: noop })
  );
  assert.ok(blogHtml.includes('All Published Guides'));

  const blogsHtml = renderToStaticMarkup(
    React.createElement(BlogsPage, { navigate: noop })
  );
  assert.ok(blogsHtml.includes('Verified Editorial Directory'));

  const featuredHtml = renderToStaticMarkup(
    React.createElement(FeaturedBlogsCarousel, { navigate: noop })
  );
  assert.ok(featuredHtml.includes('Verified Editorial Visa Guides'));

  const compareHtml = renderToStaticMarkup(
    React.createElement(VisaComparison, {
      selectedCodes: ['us', 'ca'],
      onRemoveCountry: noop,
      navigate: noop,
    } as any)
  );
  assert.ok(compareHtml.includes('Verified Static Catalog Comparison'));

  const verifyHtml = renderToStaticMarkup(
    React.createElement(VerificationView, { navigate: noop })
  );
  assert.ok(verifyHtml.includes('Evidence-Based Static Catalog Verification Ledger'));

  const sitemapHtml = renderToStaticMarkup(
    React.createElement(SitemapPage, { navigate: noop })
  );
  assert.ok(sitemapHtml.includes('Verified Public Sitemap Directory'));
  assert.ok(sitemapHtml.includes('/sitemaps-static/sitemap-static-index.xml'));
  assert.equal(sitemapHtml.includes('77,806'), false, 'SitemapPage must not claim 77,806 thin pages');

  const slotHtml = renderToStaticMarkup(
    React.createElement(EmbassySlotAlertPage, { onNavigate: noop })
  );
  assert.ok(slotHtml.includes('Persistent Backend Required'));

  const trackHtml = renderToStaticMarkup(
    React.createElement(VisaTrackingPage, { onNavigate: noop })
  );
  assert.ok(trackHtml.includes('Official USA Visa Tracking Portals'));
});

// ---------------------------------------------------------------------------
// 6. Controlled Feature-Flag Rollback Tests for All 5 Phase 5A Keys
// ---------------------------------------------------------------------------
test('Controlled feature-flag rollback toggles independently for all 5 Phase 5A modules', () => {
  const phase5aKeys = [
    'blogArticle',
    'blogsDirectory',
    'visaComparisonWidget',
    'verificationView',
    'sitemapPage',
  ] as const;

  resetStaticCatalogFeatureOverrides();
  for (const key of phase5aKeys) {
    assert.equal(isStaticCatalogEnabled(key), true, `${key} should default to enabled`);
    setStaticCatalogFeatureOverride(key, false);
    assert.equal(isStaticCatalogEnabled(key), false, `${key} should toggle off for rollback`);
    setStaticCatalogFeatureOverride(key, true);
    assert.equal(isStaticCatalogEnabled(key), true, `${key} should toggle back on`);
  }
  resetStaticCatalogFeatureOverrides();
});

// ---------------------------------------------------------------------------
// 7. Candidate Valid-Only Sitemap Validation (Route Resolution, Canonical, Hreflang, Legacy Safety)
// ---------------------------------------------------------------------------
test('Candidate static sitemap output passes full URL, route-resolution, canonical, hreflang, and legacy-preservation checks', async () => {
  const indexPath = path.join(CANDIDATE_SITEMAP_DIR, 'sitemap-static-index.xml');
  assert.ok(fs.existsSync(indexPath), 'Candidate sitemap-static-index.xml must exist');

  const indexXml = fs.readFileSync(indexPath, 'utf8');
  const childLocs = Array.from(indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
  assert.equal(childLocs.length, 5, 'Candidate sitemap index must reference exactly 5 bucket files');

  const client = new StaticCatalogClient({ fetchImpl: createFsCatalogFetch() });
  const programsRes = await client.getProgramsIndex();
  assert.equal(programsRes.status, 'ok');
  const verifiedProgramSet = new Set(
    (programsRes.data?.programs || []).map((p) => `/visa/${p.countryIso.toLowerCase()}/${p.id.toLowerCase()}`)
  );

  const seenUrls = new Set<string>();
  const allUrls: string[] = [];

  for (const childLoc of childLocs) {
    assert.ok(childLoc.startsWith('https://www.visaapply.org/sitemaps-static/'));
    const fileName = path.basename(childLoc);
    const childPath = path.join(CANDIDATE_SITEMAP_DIR, fileName);
    assert.ok(fs.existsSync(childPath), `Referenced child sitemap must exist on disk: ${fileName}`);

    const xml = fs.readFileSync(childPath, 'utf8');
    const urlBlocks = xml.split('<url>').slice(1);
    assert.ok(urlBlocks.length > 0, `Child sitemap ${fileName} must contain at least 1 URL`);

    for (const block of urlBlocks) {
      const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
      assert.ok(locMatch, `Every <url> block in ${fileName} must have <loc>`);
      const loc = locMatch[1];

      // Zero duplicates
      assert.equal(seenUrls.has(loc), false, `Duplicate URL in candidate sitemap: ${loc}`);
      seenUrls.add(loc);
      allUrls.push(loc);

      // Canonical normalization & lowercase check
      assert.ok(loc.startsWith('https://www.visaapply.org/'), `Must use canonical https://www.visaapply.org/: ${loc}`);
      const urlPath = loc.slice('https://www.visaapply.org'.length) || '/';
      assert.equal(normalizeCanonicalUrl(urlPath, 'https://www.visaapply.org'), loc, `Canonical mismatch: ${loc}`);

      // Exclude admin, audit, drafts, expired, uninhabited, self-routes
      assert.equal(urlPath.startsWith('/admin'), false, `Admin URL leaked: ${loc}`);
      assert.equal(urlPath === '/audit', false, `Audit URL leaked: ${loc}`);
      assert.equal(urlPath.includes('ga-to-fj-student'), false, `Draft leaked: ${loc}`);
      assert.equal(urlPath.includes('expired'), false, `Expired program leaked: ${loc}`);
      assert.equal(/^\/immigration\/(?:aq|bv|gs|hm|io|tf|um)$/.test(urlPath), false, `Uninhabited territory leaked: ${loc}`);
      assert.equal(/^\/([a-z]{2})-to-\1$/.test(urlPath), false, `Self-route leaked: ${loc}`);

      // Verify route resolves cleanly in SEO manager & SSR renderer (HTTP 200, indexable)
      assert.equal(
        isRouteRegisteredInSeoManager(urlPath).registered,
        true,
        `Emitted URL not registered in SEO route manager: ${urlPath}`
      );
      const ssr = renderRouteSsrPayload(urlPath);
      assert.equal(ssr.statusCode, 200, `Emitted URL must resolve HTTP 200 in SSR: ${urlPath}`);
      assert.equal(ssr.robots.includes('noindex'), false, `Emitted URL must not be noindex: ${urlPath}`);

      // Verify every emitted `/visa/:iso/:programId` URL matches a verified static catalog program
      if (urlPath.startsWith('/visa/')) {
        assert.equal(
          verifiedProgramSet.has(urlPath),
          true,
          `Emitted program URL must correspond to an AVAILABLE_VERIFIED static catalog program: ${urlPath}`
        );
      }

      // Verify hreflang relationships
      const altMatches = Array.from(
        block.matchAll(/xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)
      );
      assert.ok(altMatches.length >= 2, `Missing hreflang alternates on ${loc}`);
      assert.ok(
        altMatches.some(([, lang, href]) => lang === 'en' && href === loc),
        `Missing en canonical hreflang on ${loc}`
      );
      assert.ok(
        altMatches.some(([, lang, href]) => lang === 'x-default' && href === loc),
        `Missing x-default canonical hreflang on ${loc}`
      );
    }
  }

  assert.equal(allUrls.length, 56, 'Candidate valid-only sitemap must emit exactly 56 substantive URLs');

  // Phase 9.8.5: Root public sitemaps have cut over to verified-only catalog sitemaps (3 root files)
  const rootPublicSitemaps = fs
    .readdirSync(path.join(ROOT_DIR, 'public'))
    .filter((f) => /^sitemap.*\.xml$/i.test(f))
    .sort();
  assert.deepEqual(
    rootPublicSitemaps,
    ['sitemap-index.xml', 'sitemap.xml', 'sitemap_index.xml'],
    'Root public/ must contain only the 3 verified-only public sitemap files'
  );
  const rootIndexXml = fs.readFileSync(path.join(ROOT_DIR, 'public/sitemap-index.xml'), 'utf8');
  assert.ok(rootIndexXml.includes('/sitemaps-static/sitemap-static-countries.xml'));
  assert.equal(rootIndexXml.includes('sitemap-routes-1.xml'), false, 'Legacy quarantined route chunks must not be referenced');

  // Verify robots.txt consistency
  const robotsTxt = fs.readFileSync(path.join(ROOT_DIR, 'public/robots.txt'), 'utf8');
  assert.ok(robotsTxt.includes('Sitemap: https://www.visaapply.org/sitemap-index.xml'));
  assert.ok(robotsTxt.includes('Disallow: /admin'));
});

// ---------------------------------------------------------------------------
// 8. Public Artifact PII/Secret Scan & Protected SQLite Immutability Check
// ---------------------------------------------------------------------------
test('Public static catalog contains zero PII/secrets and SQLite DB/WAL/SHM/backup hashes are unchanged', () => {
  const walkJson = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walkJson(full));
      else if (entry.name.endsWith('.json')) out.push(full);
    }
    return out;
  };

  const jsonFiles = walkJson(PUBLIC_CATALOG_DIR);
  assert.ok(jsonFiles.length >= 30, 'Expected generated static catalog JSON artifacts');
  for (const fp of jsonFiles) {
    const content = fs.readFileSync(fp, 'utf8');
    assert.equal(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(content), false, `Email PII found in ${fp}`);
    assert.equal(/(?:sk_live|AIzaSy|ghp_|DATABASE_URL|ADMIN_PASSWORD|JWT_SECRET)/i.test(content), false, `Secret pattern found in ${fp}`);
  }

  // Protected SQLite DB & backup immutability check
  assert.equal(
    sha256File('data_db/immigration_hub.db'),
    '936faacbb233ab114dc9e90393ff2aa93d7a3ff4ca5c2231de1cf1d2f48820d4'
  );
  assert.equal(
    sha256File('data_db/immigration_hub.db-wal'),
    '72698faadb3e0d3e8b9525222fd544a82b37fd2ccb13940b64676e87856be09f'
  );
  assert.equal(
    sha256File('data_db/immigration_hub.db-shm'),
    '70d1f2ac7d8a9a06c39f06e8b5ced61b1f9fd9a6d3cccd28a223713bbfcd6b7f'
  );
  assert.equal(
    sha256File('backups/phase_b3_verified_2026-11-23T10-31-07-923Z_ac57/immigration_hub_standalone.db'),
    '827494c04201f9ea4adcd7530566f41e9c7f091c1507b59abd95b1d8d7fb4e03'
  );
});
