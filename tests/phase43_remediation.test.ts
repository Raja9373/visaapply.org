import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  SUPPORTED_LANGUAGES_15,
  COUNTRY_TO_LANG_15,
  UI_TRANSLATIONS_15,
  CANONICAL_15_LANG_CODES,
  COMPLETE_UI_TRANSLATION_LANGUAGES,
  LEGAL_CONTENT_LANGUAGES,
} from '../src/i18n/config';
import { LANGUAGE_NAMES, COUNTRY_TO_LANGUAGE_MAP } from '../src/data/languageMap';
import { TRANSLATIONS } from '../src/data/translations';
import { buildLocalizedUrl, getLangFromUrlPath } from '../src/utils/autoLanguage';
import {
  VALID_OG_ASSET_PATHS,
  resolveValidOgImageUrl,
  STATIC_ROUTE_SEO_REGISTRY,
  normalizeCanonicalUrl,
  isMultiLanguageLocalizedRoute,
  getHreflangAlternatesForRoute,
  validateAndSanitizeSeoMetadata,
} from '../src/utils/seoMetadataManager';
import { renderRouteSsrPayload } from '../src/utils/ssrRouteRenderer';
import { NAME_MAP_249, REGIONAL_GROUPINGS } from '../src/data/fullVisaDatabase';

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// ---------------------------------------------------------------------------
// WORKSTREAM A: TECHNICAL SEO, OG IMAGE ASSETS, STRUCTURED DATA & SITEMAPS
// ---------------------------------------------------------------------------

test('Workstream A1: Every OG image URL resolves exclusively to an existing file on disk in public/', () => {
  for (const relPath of VALID_OG_ASSET_PATHS) {
    const absPath = path.join(PUBLIC_DIR, relPath.replace(/^\//, ''));
    assert.ok(fs.existsSync(absPath), `Expected valid OG asset file to exist: ${absPath}`);
  }

  // Nonexistent legacy paths & arbitrary country codes must resolve to real files
  const candidates = [
    resolveValidOgImageUrl('default'),
    resolveValidOgImageUrl('golden-visa'),
    resolveValidOgImageUrl('de'),
    resolveValidOgImageUrl('fr'),
    resolveValidOgImageUrl('https://www.visaapply.org/og/de.jpg'),
    resolveValidOgImageUrl('https://www.visaapply.org/og/default.jpg'),
    resolveValidOgImageUrl('https://www.visaapply.org/og/golden-visa.jpg'),
    resolveValidOgImageUrl('us'),
    resolveValidOgImageUrl('flights'),
  ];

  for (const url of candidates) {
    assert.ok(url.startsWith('https://www.visaapply.org/'), `Unexpected OG origin: ${url}`);
    const rel = url.replace('https://www.visaapply.org', '');
    assert.ok(VALID_OG_ASSET_PATHS.has(rel), `Resolved OG URL ${url} must belong to VALID_OG_ASSET_PATHS`);
    assert.ok(fs.existsSync(path.join(PUBLIC_DIR, rel.replace(/^\//, ''))), `Missing OG file on disk for ${url}`);
  }

  for (const [route, entry] of Object.entries(STATIC_ROUTE_SEO_REGISTRY)) {
    const { metadata: sanitized } = validateAndSanitizeSeoMetadata(
      {
        title: entry.title,
        description: entry.description,
        ogImage: entry.ogImage,
        canonical: normalizeCanonicalUrl(route),
      },
      route
    );
    const rel = (sanitized.ogImage || '').replace('https://www.visaapply.org', '');
    assert.ok(VALID_OG_ASSET_PATHS.has(rel), `Static route ${route} produced invalid OG image: ${sanitized.ogImage}`);
  }
});

test('Workstream A2: SSR schema omits GovernmentService, adds non-gov disclosure, and emits FAQPage only when FAQ DOM is rendered', () => {
  const bilateralSsr = renderRouteSsrPayload('/in-to-us');
  assert.ok(bilateralSsr, 'Expected SSR payload for /in-to-us');
  assert.ok(bilateralSsr.robots.startsWith('index, follow'), `Expected index, follow directive, got: ${bilateralSsr.robots}`);
  const biGraph = Array.isArray((bilateralSsr.jsonLdGraph as any)?.['@graph']) ? (bilateralSsr.jsonLdGraph as any)['@graph'] : [];
  assert.equal(biGraph.some((s: any) => s['@type'] === 'GovernmentService'), false);
  assert.equal(biGraph.some((s: any) => s['@type'] === 'FAQPage'), true);
  assert.ok(
    bilateralSsr.ssrBodyHtml.includes('aria-label="Frequently Asked Questions"'),
    'Bilateral SSR HTML must visibly render the FAQ section matching FAQPage schema'
  );
  assert.ok(
    bilateralSsr.ssrBodyHtml.toLowerCase().includes('not affiliated with') || bilateralSsr.ssrBodyHtml.toLowerCase().includes('independent'),
    'Bilateral SSR HTML must display non-government disclaimer'
  );
  const ogImg = bilateralSsr.ogImage.replace('https://www.visaapply.org', '');
  assert.ok(VALID_OG_ASSET_PATHS.has(ogImg), `SSR OG image must exist on disk: ${bilateralSsr.ogImage}`);

  // Germany SSR must not point to nonexistent /og/de.jpg
  const deSsr = renderRouteSsrPayload('/in-to-de');
  assert.ok(deSsr, 'Expected SSR payload for /in-to-de');
  assert.equal(deSsr.ogImage, 'https://www.visaapply.org/og-image.jpg');

  // Immigration hub SSR has no FAQ section in SSR HTML, so must not emit FAQPage JSON-LD
  const immHubSsr = renderRouteSsrPayload('/immigration/ca');
  assert.ok(immHubSsr, 'Expected SSR payload for /immigration/ca');
  const immGraph = Array.isArray((immHubSsr.jsonLdGraph as any)?.['@graph']) ? (immHubSsr.jsonLdGraph as any)['@graph'] : [];
  assert.equal(immGraph.some((s: any) => s['@type'] === 'FAQPage'), false);
  assert.equal(immGraph.some((s: any) => s['@type'] === 'GovernmentService'), false);
  assert.ok(immHubSsr.ssrBodyHtml.toLowerCase().includes('not affiliated with any government'));
});

test('Workstream A3: Canonical URLs and route-aware hreflang prevent English-only fake alternates and noindex leakage', () => {
  // /en stripped, uppercase lowercased, English-only prefixed route canonicalizes to English root path
  assert.equal(normalizeCanonicalUrl('/en'), 'https://www.visaapply.org/');
  assert.equal(normalizeCanonicalUrl('/en/IN-TO-US/'), 'https://www.visaapply.org/in-to-us');
  assert.equal(normalizeCanonicalUrl('/de/about'), 'https://www.visaapply.org/about');
  assert.equal(normalizeCanonicalUrl('/ar/scholarship-finder'), 'https://www.visaapply.org/scholarship-finder');
  assert.equal(normalizeCanonicalUrl('/fr/in-to-us'), 'https://www.visaapply.org/fr/in-to-us');
  assert.equal(normalizeCanonicalUrl('/in-to-in'), 'https://www.visaapply.org/immigration/in');

  // Route classification
  assert.equal(isMultiLanguageLocalizedRoute('/'), true);
  assert.equal(isMultiLanguageLocalizedRoute('/routes'), true);
  assert.equal(isMultiLanguageLocalizedRoute('/in-to-us'), true);
  assert.equal(isMultiLanguageLocalizedRoute('/in-to-us-tourist'), true);
  assert.equal(isMultiLanguageLocalizedRoute('/about'), false);
  assert.equal(isMultiLanguageLocalizedRoute('/scholarship-finder'), false);
  assert.equal(isMultiLanguageLocalizedRoute('/immigration/us'), false);

  // Hreflang alternates
  assert.deepEqual(getHreflangAlternatesForRoute('/admin'), []);
  assert.deepEqual(getHreflangAlternatesForRoute('/admin/updates'), []);
  assert.deepEqual(getHreflangAlternatesForRoute('/audit'), []);
  assert.deepEqual(getHreflangAlternatesForRoute('/in-to-in'), []);

  const aboutAlternates = getHreflangAlternatesForRoute('/about');
  assert.deepEqual(aboutAlternates, [
    { hreflang: 'en', href: 'https://www.visaapply.org/about' },
    { hreflang: 'x-default', href: 'https://www.visaapply.org/about' },
  ]);

  const homeAlternates = getHreflangAlternatesForRoute('/');
  assert.equal(homeAlternates.length, 16); // 15 canonical languages + x-default
  for (const code of CANONICAL_15_LANG_CODES) {
    assert.ok(homeAlternates.some((a) => a.hreflang === code), `Missing hreflang=${code} on localized route`);
  }
  assert.ok(homeAlternates.some((a) => a.hreflang === 'x-default' && a.href === 'https://www.visaapply.org/'));
});

test('Workstream A4: Generated XML sitemaps and robots.txt contain zero synthetic padding, quarantined routes, uninhabited territories, or /audit exposure', () => {
  const robotsTxt = fs.readFileSync(path.join(PUBLIC_DIR, 'robots.txt'), 'utf8');
  assert.ok(robotsTxt.includes('Disallow: /admin'), 'robots.txt must disallow /admin');
  assert.ok(robotsTxt.includes('Disallow: /audit'), 'robots.txt must disallow /audit');
  assert.ok(robotsTxt.includes('Disallow: /api/'), 'robots.txt must disallow /api/');

  const serverTs = fs.readFileSync(path.join(ROOT_DIR, 'server.ts'), 'utf8');
  assert.ok(serverTs.includes('Disallow: /audit'), 'server.ts inline robots.txt fallback must disallow /audit');

  const sitemapFiles = [
    ...fs.readdirSync(PUBLIC_DIR).filter((f) => /^sitemap.*\.xml$/i.test(f)).map((f) => path.join(PUBLIC_DIR, f)),
    ...fs
      .readdirSync(path.join(PUBLIC_DIR, 'sitemaps-static'))
      .filter((f) => f.endsWith('.xml'))
      .map((f) => path.join(PUBLIC_DIR, 'sitemaps-static', f))
  ];
  assert.equal(sitemapFiles.length, 3 + 6, 'Expected 3 verified root public sitemaps + 6 static verified bucket sitemaps');

  let flatVerifiedUrls = 0;
  for (const filePath of sitemapFiles) {
    const file = path.basename(filePath);
    const xml = fs.readFileSync(filePath, 'utf8');
    assert.ok(!xml.includes('p1-audit-'), `${file} leaked quarantined p1-audit- pathway`);
    assert.ok(!xml.includes('-pathway-'), `${file} leaked synthetic -pathway- URL`);
    assert.ok(!xml.includes('/admin'), `${file} leaked /admin URL`);
    assert.ok(!xml.includes('/audit'), `${file} leaked /audit URL`);
    for (const uninhabited of ['aq', 'bv', 'gs', 'hm', 'io', 'tf', 'um']) {
      assert.ok(!xml.includes(`in-to-${uninhabited}<`), `${file} included uninhabited territory in-to-${uninhabited}`);
      assert.ok(!xml.includes(`/immigration/${uninhabited}<`), `${file} included uninhabited territory /immigration/${uninhabited}`);
    }
    if (file === 'sitemap.xml') {
      const urlMatches = xml.match(/<url>/g);
      flatVerifiedUrls = urlMatches ? urlMatches.length : 0;
    }
  }

  assert.equal(flatVerifiedUrls, 56, `Expected 56 verified, published URLs in public/sitemap.xml, got ${flatVerifiedUrls}`);
});

// ---------------------------------------------------------------------------
// WORKSTREAM B: COMPLETE 15-LANGUAGE LOCALIZATION & ARABIC RTL PARITY
// ---------------------------------------------------------------------------

test('Workstream B1: All 15 canonical languages exist across i18n/config, languageMap, translations, and public/locales/*/common.json with 100% key parity', () => {
  assert.equal(SUPPORTED_LANGUAGES_15.length, 15);
  assert.equal(CANONICAL_15_LANG_CODES.length, 15);
  assert.equal(COMPLETE_UI_TRANSLATION_LANGUAGES.length, 15);
  assert.deepEqual(LEGAL_CONTENT_LANGUAGES, ['en']);

  const expectedCodes = ['en', 'hi', 'de', 'es', 'pl', 'fr', 'ar', 'ru', 'zh', 'ja', 'pt', 'it', 'nl', 'tr', 'ko'];
  assert.deepEqual([...CANONICAL_15_LANG_CODES], expectedCodes);

  // Confirm all 15 exist in LANGUAGE_NAMES and TRANSLATIONS
  for (const code of expectedCodes) {
    assert.ok(LANGUAGE_NAMES[code], `LANGUAGE_NAMES missing ${code}`);
    assert.ok((TRANSLATIONS as any)[code], `TRANSLATIONS missing ${code}`);
  }

  // Verify zero unsupported 'sv' in country->language maps
  for (const [country, lang] of Object.entries(COUNTRY_TO_LANG_15)) {
    assert.ok(
      (CANONICAL_15_LANG_CODES as readonly string[]).includes(lang),
      `COUNTRY_TO_LANG_15[${country}] maps to unsupported lang '${lang}'`
    );
  }
  for (const [country, lang] of Object.entries(COUNTRY_TO_LANGUAGE_MAP)) {
    assert.ok(
      (CANONICAL_15_LANG_CODES as readonly string[]).includes(lang),
      `COUNTRY_TO_LANGUAGE_MAP[${country}] maps to unsupported lang '${lang}'`
    );
  }

  // Verify Turkish Cyrillic typo is gone
  const trAll = JSON.stringify((TRANSLATIONS as any).tr || {});
  assert.equal(trAll.includes('порта'), false, 'Turkish translation must not contain Cyrillic characters');

  // Verify 100% key parity & non-empty strings & identical template tokens across UI_TRANSLATIONS_15
  const enStrings = UI_TRANSLATIONS_15.en;
  const enKeys = Object.keys(enStrings).sort();
  assert.ok(enKeys.length >= 60, `Expected comprehensive I18nStrings key set, got ${enKeys.length}`);

  for (const code of expectedCodes) {
    const dict = UI_TRANSLATIONS_15[code as keyof typeof UI_TRANSLATIONS_15];
    assert.ok(dict, `Missing UI_TRANSLATIONS_15 dictionary for ${code}`);
    assert.deepEqual(Object.keys(dict).sort(), enKeys, `Key mismatch in UI_TRANSLATIONS_15 for ${code}`);

    for (const k of enKeys) {
      const val = (dict as any)[k];
      assert.equal(typeof val, 'string', `Non-string key ${code}.${k}`);
      assert.ok(val.trim().length > 0, `Empty translation string ${code}.${k}`);
    }

    // Check placeholder preservation
    assert.ok(
      dict.detectedBanner.includes('{country}') && dict.detectedBanner.includes('{lang}'),
      `${code}.detectedBanner missing placeholders`
    );
    assert.ok(dict.englishFallbackNotice.includes('{lang}'), `${code}.englishFallbackNotice missing {lang}`);
    assert.ok(dict.fromToLabel.includes('{from}') && dict.fromToLabel.includes('{to}'), `${code}.fromToLabel missing placeholders`);
  }

  // Verify public/locales/<lang>/common.json parity
  for (const code of expectedCodes) {
    const commonPath = path.join(PUBLIC_DIR, 'locales', code, 'common.json');
    assert.ok(fs.existsSync(commonPath), `Missing locale JSON file: ${commonPath}`);
    const parsed = JSON.parse(fs.readFileSync(commonPath, 'utf8'));
    const enCommon = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'locales', 'en', 'common.json'), 'utf8'));
    assert.deepEqual(Object.keys(parsed).sort(), Object.keys(enCommon).sort(), `common.json key mismatch for ${code}`);
  }
});

test('Workstream B2: Arabic RTL configuration and URL query/hash preservation work correctly', () => {
  const arOpt = SUPPORTED_LANGUAGES_15.find((l) => l.code === 'ar');
  assert.ok(arOpt, 'Arabic must be in SUPPORTED_LANGUAGES_15');
  assert.equal(arOpt.dir, 'rtl');

  for (const opt of SUPPORTED_LANGUAGES_15) {
    if (opt.code !== 'ar') {
      assert.equal(opt.dir, 'ltr', `Language ${opt.code} must be ltr`);
    }
  }

  assert.equal(buildLocalizedUrl('/in-to-us?category=work#fees', 'ar'), '/ar/in-to-us?category=work#fees');
  assert.equal(buildLocalizedUrl('/ar/in-to-us?category=work#fees', 'en'), '/in-to-us?category=work#fees');
  assert.equal(buildLocalizedUrl('/pt/?tab=overview', 'ko'), '/ko?tab=overview');
  assert.deepEqual(getLangFromUrlPath('/ko/in-to-us'), { lang: 'ko', strippedPath: '/in-to-us' });

  const appTsx = fs.readFileSync(path.join(ROOT_DIR, 'src/App.tsx'), 'utf8');
  assert.ok(appTsx.includes("dir={uiLang === 'ar' ? 'rtl' : 'ltr'}"), 'App.tsx root layout must toggle RTL for Arabic');
  assert.ok(appTsx.includes('englishFallbackNotice'), 'App.tsx must surface English fallback disclosure for localized views');
});

// ---------------------------------------------------------------------------
// WORKSTREAM C & D: CONTENT INTEGRITY, DISCLAIMERS & REGRESSION GUARDS
// ---------------------------------------------------------------------------

test('Workstream C: No inflated 11,563+ / 14.084+ claims remain in active public UI or SEO metadata', () => {
  const checkedFiles = [
    'index.html',
    'api/render.ts',
    'src/App.tsx',
    'src/utils/seoMetadataManager.ts',
    'src/utils/ssrRouteRenderer.ts',
    'src/pages/RoutesPage.tsx',
    'src/pages/AtlysVsVisaApplyPage.tsx',
    'src/components/VerificationView.tsx',
    'src/i18n/config.ts',
  ];

  for (const rel of checkedFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert.equal(content.includes('11,563'), false, `${rel} still contains inflated 11,563 claim`);
    assert.equal(content.includes('14.084'), false, `${rel} still contains inflated 14.084 claim`);
    assert.equal(content.includes('10 Languages'), false, `${rel} still says 10 Languages instead of 15`);
    assert.equal(content.includes('10 Auto-Detected'), false, `${rel} still says 10 Auto-Detected`);
    assert.equal(content.includes('GovernmentService'), false, `${rel} still contains GovernmentService schema`);
  }

  // Country database still keeps 249 ISO entries cleanly separated from regional groupings
  assert.equal(Object.keys(NAME_MAP_249).length, 249);
  assert.ok('eu' in REGIONAL_GROUPINGS);
  assert.equal('eu' in NAME_MAP_249, false);
});
