import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

import {
  STATIC_ROUTE_SEO_REGISTRY,
  OG_LOCALE_BY_LANG,
  resolveOgLocaleForPath,
  validateAndSanitizeSeoMetadata,
  getHreflangAlternatesForRoute,
  auditAllStaticRoutesSeo,
  resolveStaticRouteSeoMetadata,
} from '../src/utils/seoMetadataManager';
import { getSecurityHeaders } from '../src/utils/securityHardening';
import { validateStaticCatalog } from '../scripts/validateStaticCatalog';
import {
  SUPPORTED_LANGUAGES_15,
  UI_TRANSLATIONS_15,
  LEGAL_CONTENT_LANGUAGES,
} from '../src/i18n/config';
import {
  IMMIGRATION_HUB_PROMO_CATEGORIES,
  buildImmigrationHubUrl,
  parseImmigrationCategoryQuery,
} from '../src/config/immigrationCategories';
import { renderRouteSsrPayload } from '../src/utils/ssrRouteRenderer';

const ROOT = process.cwd();

function sha256File(relPath: string): string {
  const buf = fs.readFileSync(path.join(ROOT, relPath));
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function walkFiles(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

// ============================================================================
// 1. GLOBAL SEO AUDIT VERIFICATION
// ============================================================================

test('Phase 7 SEO: index.html has zero duplicate crawler meta tags and valid baseline JSON-LD', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');

  const robotsMatches = html.match(/<meta\s+name="robots"[^>]*>/gi) || [];
  const googlebotMatches = html.match(/<meta\s+name="googlebot"[^>]*>/gi) || [];
  const bingbotMatches = html.match(/<meta\s+name="bingbot"[^>]*>/gi) || [];

  assert.equal(robotsMatches.length, 1, 'Expected exactly one <meta name="robots"> in index.html');
  assert.equal(googlebotMatches.length, 1, 'Expected exactly one <meta name="googlebot"> in index.html');
  assert.equal(bingbotMatches.length, 1, 'Expected exactly one <meta name="bingbot"> in index.html');

  const ldMatch = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  assert.ok(ldMatch, 'Expected baseline <script type="application/ld+json"> in index.html');
  const ldJson = JSON.parse(ldMatch[1]);
  assert.equal(ldJson['@context'], 'https://schema.org');
  assert.ok(Array.isArray(ldJson['@graph']), 'Expected @graph array in baseline JSON-LD');
  const types = ldJson['@graph'].map((n: any) => n['@type']);
  assert.ok(types.includes('Organization'), 'Expected Organization schema in baseline JSON-LD');
  assert.ok(types.includes('WebSite'), 'Expected WebSite schema in baseline JSON-LD');
});

test('Phase 7 SEO: static route registry passes audit, covers /admin/editorial-review noindex, and maps og:locale for all 15 languages', () => {
  const audit = auditAllStaticRoutesSeo();
  assert.equal(audit.invalidRoutesCount, 0, `Invalid static SEO routes found: ${JSON.stringify(audit.results.filter((r) => !r.isValid))}`);

  const editorialReview = resolveStaticRouteSeoMetadata('/admin/editorial-review');
  assert.ok(editorialReview, 'Expected explicit /admin/editorial-review registry entry');
  assert.equal(editorialReview.noindex, true, '/admin/editorial-review must be noindex');

  const { metadata: editorialMeta } = validateAndSanitizeSeoMetadata(editorialReview, '/admin/editorial-review');
  assert.equal(editorialMeta.robots, 'noindex, nofollow');

  assert.equal(Object.keys(OG_LOCALE_BY_LANG).length, 15, 'Expected og:locale mapping for all 15 supported languages');
  for (const lang of SUPPORTED_LANGUAGES_15) {
    const pathForLang = lang.code === 'en' ? '/' : `/${lang.code}/in-to-us`;
    const resolvedLocale = resolveOgLocaleForPath(pathForLang);
    assert.equal(resolvedLocale, OG_LOCALE_BY_LANG[lang.code], `Unexpected og:locale for ${lang.code}`);
  }
  assert.equal(resolveOgLocaleForPath('/ar/in-to-us'), 'ar_AE');
  assert.equal(resolveOgLocaleForPath('/hi/in-to-us'), 'hi_IN');
  assert.equal(resolveOgLocaleForPath('/de/in-to-us'), 'de_DE');
  assert.equal(resolveOgLocaleForPath('/'), 'en_US');

  // Verify hreflang honesty: localized routes emit 15 + x-default; English-only routes emit en + x-default; admin emits 0
  const homeAlternates = getHreflangAlternatesForRoute('/');
  assert.equal(homeAlternates.length, 16, 'Homepage should emit 15 languages + x-default');
  const immigrationAlternates = getHreflangAlternatesForRoute('/immigration/us');
  assert.deepEqual(
    immigrationAlternates.map((a) => a.hreflang),
    ['en', 'x-default'],
    'English-only legal detail page should emit strictly en + x-default'
  );
  assert.equal(getHreflangAlternatesForRoute('/admin/editorial-review').length, 0);
});

// ============================================================================
// 2. CANDIDATE SITEMAPS & LEGACY SAFETY
// ============================================================================

test('Phase 7 Sitemaps: candidate static sitemaps are clean and legacy production sitemaps + robots.txt remain untouched', () => {
  const staticDir = path.join(ROOT, 'public/sitemaps-static');
  const expectedFiles = [
    'sitemap-static-index.xml',
    'sitemap-static-core.xml',
    'sitemap-static-countries.xml',
    'sitemap-static-programs.xml',
    'sitemap-static-routes.xml',
    'sitemap-static-editorial.xml',
  ];
  for (const f of expectedFiles) {
    assert.ok(fs.existsSync(path.join(staticDir, f)), `Missing candidate sitemap: ${f}`);
  }

  const subFiles = expectedFiles.filter((f) => f !== 'sitemap-static-index.xml');
  const allLocs: string[] = [];
  for (const f of subFiles) {
    const xml = fs.readFileSync(path.join(staticDir, f), 'utf-8');
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    allLocs.push(...locs);
  }

  assert.equal(allLocs.length, 56, 'Expected 56 canonical URLs across candidate sitemaps');
  assert.equal(new Set(allLocs).size, allLocs.length, 'Candidate sitemaps must contain zero duplicate URLs');
  for (const loc of allLocs) {
    assert.ok(loc.startsWith('https://www.visaapply.org/'), `Non-canonical origin in sitemap: ${loc}`);
    assert.ok(!/\/admin(\/|$)/i.test(loc), `Admin URL leaked into sitemap: ${loc}`);
    assert.ok(!/\/audit(\/|$)/i.test(loc), `Audit URL leaked into sitemap: ${loc}`);
    assert.ok(!/\/([a-z]{2})-to-\1(?:-|$)/i.test(loc), `Self-route leaked into sitemap: ${loc}`);
  }

  // Legacy production sitemaps & robots.txt must remain untouched
  const legacySitemaps = fs.readdirSync(path.join(ROOT, 'public')).filter((f) => /^sitemap.*\.xml$/.test(f));
  assert.equal(legacySitemaps.length, 89, 'All 89 legacy production sitemap files must remain untouched');

  const robots = fs.readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf-8');
  assert.ok(robots.includes('Disallow: /admin'), 'robots.txt must disallow /admin');
  assert.ok(robots.includes('Disallow: /audit'), 'robots.txt must disallow /audit');
  assert.ok(robots.includes('Disallow: /api/'), 'robots.txt must disallow /api/');
  assert.ok(
    robots.includes('Sitemap: https://www.visaapply.org/sitemap-index.xml'),
    'robots.txt must still point to legacy sitemap-index.xml until explicit cutover'
  );
  assert.ok(!robots.includes('sitemaps-static'), 'robots.txt must not auto-cutover to candidate sitemaps in Phase 7');
});

// ============================================================================
// 3. PERFORMANCE BUDGETS & CODE-SPLITTING VERIFICATION
// ============================================================================

test('Phase 7 Performance: initial bundle code-splits CanonicalPathwayPage and meets Phase 7 budgets', () => {
  const distAssetsDir = path.join(ROOT, 'dist/assets');
  assert.ok(fs.existsSync(distAssetsDir), 'dist/assets must exist after production build');

  const assetFiles = fs.readdirSync(distAssetsDir);
  const indexJsFile = assetFiles.find((f) => /^index-[a-zA-Z0-9_-]+\.js$/.test(f));
  const indexCssFile = assetFiles.find((f) => /^index-[a-zA-Z0-9_-]+\.css$/.test(f));
  const canonicalPathwayChunk = assetFiles.find((f) => /^CanonicalPathwayPage-[a-zA-Z0-9_-]+\.js$/.test(f));

  assert.ok(indexJsFile, 'Expected built index-*.js entry chunk');
  assert.ok(indexCssFile, 'Expected built index-*.css stylesheet');
  assert.ok(
    canonicalPathwayChunk,
    'CanonicalPathwayPage (+ priority2AuditData) must be code-split into its own lazy chunk'
  );

  const indexJsBuf = fs.readFileSync(path.join(distAssetsDir, indexJsFile));
  const indexJsGzip = zlib.gzipSync(indexJsBuf).length;
  const indexCssBuf = fs.readFileSync(path.join(distAssetsDir, indexCssFile));
  const indexCssGzip = zlib.gzipSync(indexCssBuf).length;

  // Phase 7 explicit performance budgets (improved from 1,390.3 KB raw / 325.0 KB gzip baseline)
  assert.ok(
    indexJsBuf.length < 960 * 1024,
    `Initial entry JS exceeds 960 KB raw budget: ${(indexJsBuf.length / 1024).toFixed(1)} KB`
  );
  assert.ok(
    indexJsGzip < 240 * 1024,
    `Initial entry JS exceeds 240 KB gzip budget: ${(indexJsGzip / 1024).toFixed(1)} KB`
  );
  assert.ok(
    indexCssBuf.length < 200 * 1024,
    `CSS bundle exceeds 200 KB raw budget: ${(indexCssBuf.length / 1024).toFixed(1)} KB`
  );
  assert.ok(
    indexCssGzip < 30 * 1024,
    `CSS bundle exceeds 30 KB gzip budget: ${(indexCssGzip / 1024).toFixed(1)} KB`
  );

  // Static catalog total & max-file payload budgets
  const catalogFiles = walkFiles(path.join(ROOT, 'public/catalog'), ['.json']);
  assert.ok(catalogFiles.length >= 40, 'Expected exported static catalog JSON files');
  let totalRaw = 0;
  let totalGzip = 0;
  let maxSingleRaw = 0;
  for (const cf of catalogFiles) {
    const buf = fs.readFileSync(cf);
    totalRaw += buf.length;
    totalGzip += zlib.gzipSync(buf).length;
    if (buf.length > maxSingleRaw) maxSingleRaw = buf.length;
  }
  assert.ok(totalRaw < 900 * 1024, `Static catalog total raw exceeds 900 KB: ${(totalRaw / 1024).toFixed(1)} KB`);
  assert.ok(totalGzip < 160 * 1024, `Static catalog total gzip exceeds 160 KB: ${(totalGzip / 1024).toFixed(1)} KB`);
  assert.ok(maxSingleRaw < 60 * 1024, `Largest catalog JSON exceeds 60 KB: ${(maxSingleRaw / 1024).toFixed(1)} KB`);
});

// ============================================================================
// 4. ACCESSIBILITY (WCAG 2.2 AA TARGETS)
// ============================================================================

test('Phase 7 Accessibility: landmarks, skip link, keyboard-accessible cards, form labels, and RTL support', () => {
  const appSrc = fs.readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf-8');
  assert.ok(appSrc.includes('href="#main-content"'), 'App.tsx must include skip-to-content link');
  assert.ok(appSrc.includes('id="main-content"'), 'App.tsx must include #main-content main landmark');
  assert.ok(appSrc.includes("dir={uiLang === 'ar' ? 'rtl' : 'ltr'}"), 'App.tsx must toggle dir="rtl" for Arabic');

  const cssSrc = fs.readFileSync(path.join(ROOT, 'src/index.css'), 'utf-8');
  assert.ok(cssSrc.includes(':focus-visible'), 'index.css must define visible keyboard focus styles');
  assert.ok(cssSrc.includes('prefers-reduced-motion'), 'index.css must respect prefers-reduced-motion');

  const promoSrc = fs.readFileSync(path.join(ROOT, 'src/components/GlobalImmigrationPromoSection.tsx'), 'utf-8');
  assert.ok(promoSrc.includes('aria-labelledby="global-immigration-hub-heading"'), 'Promo section needs aria-labelledby');
  assert.ok(promoSrc.includes('id="global-immigration-hub-heading"'), 'Promo heading needs matching id');
  assert.ok(promoSrc.includes('href={targetUrl}'), 'Category cards must render native <a> links');

  // Verify FlightSearchWidget & HotelBookingWidget bind every label via htmlFor
  for (const widgetPath of ['src/components/FlightSearchWidget.tsx', 'src/components/HotelBookingWidget.tsx']) {
    const src = fs.readFileSync(path.join(ROOT, widgetPath), 'utf-8');
    const labels = src.match(/<label\b[^>]*>/g) || [];
    assert.ok(labels.length >= 4, `${widgetPath} should contain 4 form labels`);
    for (const lbl of labels) {
      assert.ok(lbl.includes('htmlFor='), `Unbound <label> found in ${widgetPath}: ${lbl}`);
    }
  }
});

// ============================================================================
// 5. SECURITY HARDENING & POC VERIFICATION
// ============================================================================

test('Phase 7 Security: XSS sink removed in renderCountryPageFixed, headers complete, no tabnabbing, DBs immutable', () => {
  // 5a. Permissions-Policy and full security headers
  const pageHeaders = getSecurityHeaders({ isApi: false, allowPreviewFraming: false });
  assert.ok(pageHeaders['Content-Security-Policy'], 'CSP header required');
  assert.ok(pageHeaders['Strict-Transport-Security'], 'HSTS header required');
  assert.equal(pageHeaders['X-Content-Type-Options'], 'nosniff');
  assert.equal(pageHeaders['Referrer-Policy'], 'strict-origin-when-cross-origin');
  assert.equal(pageHeaders['X-Frame-Options'], 'SAMEORIGIN');
  assert.equal(
    pageHeaders['Permissions-Policy'],
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // 5b. renderCountryPageFixed has ZERO raw innerHTML or inline onclick interpolation
  const appSrc = fs.readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf-8');
  const fnStart = appSrc.indexOf('export function renderCountryPageFixed');
  const fnEnd = appSrc.indexOf('// OVERRIDE GLOBAL', fnStart);
  assert.ok(fnStart !== -1 && fnEnd > fnStart, 'renderCountryPageFixed must exist');
  const fnBody = appSrc.slice(fnStart, fnEnd);
  assert.ok(fnBody.includes('/^[a-z]{2,3}$/'), 'renderCountryPageFixed must enforce strict ISO allowlist');
  assert.ok(!fnBody.includes('.innerHTML'), 'renderCountryPageFixed must not assign raw innerHTML');
  assert.ok(!fnBody.includes('onclick='), 'renderCountryPageFixed must not emit inline onclick handlers');

  // 5c. Zero target="_blank" without noopener across src/
  const srcFiles = walkFiles(path.join(ROOT, 'src'), ['.ts', '.tsx']);
  const unsafeBlankLinks: string[] = [];
  const unsafeWindowOpen: string[] = [];
  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const blankTags = content.match(/<a\b[^>]*target=["']_blank["'][^>]*>/gs) || [];
    for (const tag of blankTags) {
      if (!/rel=["'][^"']*noopener/i.test(tag)) {
        unsafeBlankLinks.push(`${path.relative(ROOT, file)}: ${tag.slice(0, 120)}`);
      }
    }
    const openCalls = content.match(/window\.open\([^)]*\)/g) || [];
    for (const call of openCalls) {
      if (call.includes('_blank') && !call.includes('noopener')) {
        unsafeWindowOpen.push(`${path.relative(ROOT, file)}: ${call}`);
      }
    }
  }
  assert.deepEqual(unsafeBlankLinks, [], `target="_blank" links missing noopener: ${unsafeBlankLinks.join('; ')}`);
  assert.deepEqual(unsafeWindowOpen, [], `window.open('_blank') calls missing noopener: ${unsafeWindowOpen.join('; ')}`);

  // 5d. Zero secrets or PII emails in exported public/catalog/
  const catalogFiles = walkFiles(path.join(ROOT, 'public/catalog'), ['.json']);
  for (const cf of catalogFiles) {
    const raw = fs.readFileSync(cf, 'utf-8');
    assert.ok(!/ADMIN_PASSWORD|CRON_SECRET|GEMINI_API_KEY|RESEND_API_KEY/i.test(raw), `Secret keyword found in ${cf}`);
    assert.ok(!/[a-zA-Z0-9._%+-]+@(?!visaapply\.org)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(raw), `Unexpected email in ${cf}`);
  }

  // 5e. Protected SQLite DB & backup files untouched byte-for-byte
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

// ============================================================================
// 6. IMMIGRATION CONTENT QUALITY & 15-LANGUAGE AUDIT
// ============================================================================

test('Phase 7 Content & i18n: canonical catalog is verified, quarantine excluded, and all 15 languages have 100% UI keys', () => {
  const report = validateStaticCatalog({ dataDir: path.join(ROOT, 'data') });
  assert.equal(report.valid, true, `Catalog validation failed: ${JSON.stringify(report.errors)}`);
  assert.equal(report.errors.length, 0);
  assert.equal(report.summary.programsChecked, 28);
  assert.equal(report.summary.quarantineRecordsChecked, 229);

  // Check all 28 programs across country JSON files have official HTTPS sources & non-expired verified status
  const programDir = path.join(ROOT, 'data/programs');
  const programFiles = fs.readdirSync(programDir).filter((f) => f.endsWith('.json'));
  const allPrograms: any[] = [];
  for (const pf of programFiles) {
    const parsed = JSON.parse(fs.readFileSync(path.join(programDir, pf), 'utf-8'));
    const list = Array.isArray(parsed) ? parsed : [parsed];
    allPrograms.push(...list);
  }
  assert.equal(allPrograms.length, 28, 'Expected 28 total canonical programs across data/programs/*.json');
  for (const p of allPrograms) {
    assert.equal(p.verificationStatus, 'AVAILABLE_VERIFIED', `${p.programId} must be AVAILABLE_VERIFIED`);
    assert.equal(p.publicationStatus, 'PUBLISHED', `${p.programId} must be PUBLISHED`);
    assert.ok(Array.isArray(p.officialSourceRefs) && p.officialSourceRefs.length >= 1, `${p.programId} missing official sources`);
    for (const ref of p.officialSourceRefs) {
      assert.ok(String(ref.url || '').startsWith('https://'), `${p.programId} has non-HTTPS official source URL`);
    }
    assert.ok(p.legalBasis && p.eligibilitySummary && p.lastVerifiedDate, `${p.programId} missing required verification fields`);
  }

  // 15 languages completeness & RTL check
  assert.equal(SUPPORTED_LANGUAGES_15.length, 15);
  assert.deepEqual(LEGAL_CONTENT_LANGUAGES, ['en']);
  const arLang = SUPPORTED_LANGUAGES_15.find((l) => l.code === 'ar');
  assert.equal(arLang?.dir, 'rtl');

  const enKeys = Object.keys(UI_TRANSLATIONS_15.en);
  assert.equal(enKeys.length, 65);
  for (const lang of SUPPORTED_LANGUAGES_15) {
    const dict = UI_TRANSLATIONS_15[lang.code];
    assert.ok(dict, `Missing UI translation dictionary for ${lang.code}`);
    for (const key of enKeys) {
      const val = (dict as any)[key];
      assert.ok(typeof val === 'string' && val.trim().length > 0, `Missing key ${key} in ${lang.code}`);
    }
  }
  assert.notEqual(
    UI_TRANSLATIONS_15.nl.downloadChecklistPdf,
    UI_TRANSLATIONS_15.en.downloadChecklistPdf,
    'Dutch downloadChecklistPdf should be localized rather than English fallback'
  );
});

// ============================================================================
// 7. BROKEN LINKS, 6 CATEGORY HUB CARDS & ROUTE RESOLUTION MATRIX
// ============================================================================

test('Phase 7 Routes: all 6 Global Immigration Hub categories and key public/admin routes resolve cleanly', () => {
  assert.equal(IMMIGRATION_HUB_PROMO_CATEGORIES.length, 6);
  for (const cat of IMMIGRATION_HUB_PROMO_CATEGORIES) {
    const url = buildImmigrationHubUrl(cat.id);
    assert.equal(url, `/immigration?category=${cat.slug}`);
    const parsed = parseImmigrationCategoryQuery(`?category=${cat.slug}`);
    assert.equal(parsed.category, cat.id);
    assert.equal(parsed.invalidCategoryParam, null);
  }

  const publicRoutes = [
    '/',
    '/immigration',
    '/immigration/us',
    '/routes',
    '/in-to-us',
    '/in-to-ca-tourist',
    '/visa/us/us-pr-eb2-niw',
    '/visa/japan/digital-nomad-visa',
    '/tools/cost-calculator',
    '/verification',
    '/sitemap',
    '/about',
    '/privacy',
    '/terms',
    '/contact',
  ];

  for (const route of publicRoutes) {
    const ssr = renderRouteSsrPayload(route);
    assert.equal(ssr.statusCode, 200, `Expected HTTP 200 SSR payload for ${route}, got ${ssr.statusCode}`);
    assert.ok(ssr.title.length >= 15, `Short title on ${route}`);
    assert.ok(ssr.description.length >= 40, `Short description on ${route}`);
    assert.ok(ssr.canonicalUrl.startsWith('https://www.visaapply.org/'), `Bad canonical on ${route}`);
    assert.ok(!ssr.robots.includes('noindex'), `Public route ${route} should not be noindex`);
  }

  // Self-route returns 301 redirect to /immigration/:iso
  const selfSsr = renderRouteSsrPayload('/in-to-in');
  assert.equal(selfSsr.statusCode, 301);
  assert.equal(selfSsr.cleanPath, '/immigration/in');

  // Admin & audit routes are strictly noindex
  for (const restricted of ['/admin', '/admin/login', '/admin/editorial-review', '/audit']) {
    const ssr = renderRouteSsrPayload(restricted);
    assert.ok(ssr.robots.includes('noindex'), `Restricted route ${restricted} must emit noindex`);
  }
});
