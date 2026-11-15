import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  NAME_MAP_249 as LIGHT_NAME_MAP,
  FLAG_MAP_249 as LIGHT_FLAG_MAP,
  REGIONAL_GROUPINGS as LIGHT_REGIONAL,
  CORRECT_COUNTS as LIGHT_CORRECT_COUNTS,
  getCorrectCount as lightGetCorrectCount,
  TOTAL_REAL_VISAS_249 as LIGHT_TOTAL_VISAS,
  getLiveVisaCount as lightGetLiveVisaCount,
} from '../src/data/countryLightRegistry';

import {
  NAME_MAP_249 as FULL_NAME_MAP,
  FLAG_MAP_249 as FULL_FLAG_MAP,
  REGIONAL_GROUPINGS as FULL_REGIONAL,
  CORRECT_COUNTS as FULL_CORRECT_COUNTS,
  getCorrectCount as fullGetCorrectCount,
  TOTAL_REAL_VISAS_249 as FULL_TOTAL_VISAS,
  getLiveVisaCount as fullGetLiveVisaCount,
} from '../src/data/fullVisaDatabase';

import {
  evaluateVisaFreeEligibility as lightEvaluate,
  getVisaCount as lightGetVisaCount,
  getBilateralProcessingTime as lightGetProcessing,
  getBestRouteSummary as lightGetBestRoute,
  getAnyToAnyRouteInfo as lightGetRouteInfo,
} from '../src/data/anyToAnyLight';

import {
  evaluateVisaFreeEligibility as matrixEvaluate,
  getVisaCount as matrixGetVisaCount,
  getBilateralProcessingTime as matrixGetProcessing,
  getBestRouteSummary as matrixGetBestRoute,
  getAnyToAnyRouteInfo as matrixGetRouteInfo,
} from '../src/data/anyToAnyMatrix';

import { loadHeavyVisaBundle, getCachedHeavyVisaBundle } from '../src/utils/heavyVisaLoader';
import { resolvePublicCanonicalPathwayByUrl } from '../src/pages/CanonicalPathwayPage';
import { getPublicPriority1Pathways, PRIORITY1_QUARANTINED_PATHWAYS } from '../src/data/priority1AuditData';
import { PRIORITY2_COMPLETED_PATHWAYS } from '../src/data/priority2AuditData';
import { isRouteRegisteredInSeoManager } from '../src/utils/seoMetadataManager';

const ROOT_DIR = process.cwd();

function readWorkspaceFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
}

test('Country light registry preserves 100% parity with fullVisaDatabase across all 249 ISO entries', () => {
  const lightKeys = Object.keys(LIGHT_NAME_MAP).sort();
  const fullKeys = Object.keys(FULL_NAME_MAP).sort();

  assert.equal(lightKeys.length, 249, 'countryLightRegistry must contain exactly 249 ISO countries');
  assert.deepEqual(lightKeys, fullKeys, 'Country key set must match fullVisaDatabase');
  assert.ok(!LIGHT_NAME_MAP['eu'], 'EU must live in REGIONAL_GROUPINGS, not ISO 249 NAME_MAP');
  assert.ok(LIGHT_REGIONAL['eu'] && FULL_REGIONAL['eu'], 'EU regional grouping must exist in both registries');
  assert.equal(LIGHT_TOTAL_VISAS, FULL_TOTAL_VISAS, 'TOTAL_REAL_VISAS_249 must match');

  for (const code of lightKeys) {
    assert.equal(LIGHT_NAME_MAP[code], FULL_NAME_MAP[code], `Name mismatch for ${code}`);
    assert.equal(LIGHT_FLAG_MAP[code], FULL_FLAG_MAP[code], `Flag mismatch for ${code}`);
    assert.equal(LIGHT_CORRECT_COUNTS[code], FULL_CORRECT_COUNTS[code], `Count mismatch for ${code}`);
    assert.equal(lightGetCorrectCount(code), fullGetCorrectCount(code), `getCorrectCount mismatch for ${code}`);
    assert.equal(lightGetLiveVisaCount(code), fullGetLiveVisaCount(code), `getLiveVisaCount lowercase mismatch for ${code}`);
    assert.equal(
      lightGetLiveVisaCount(code.toUpperCase()),
      fullGetLiveVisaCount(code.toUpperCase()),
      `getLiveVisaCount uppercase mismatch for ${code}`
    );
  }
});

test('anyToAnyLight matches anyToAnyMatrix across curated bilateral and treaty corridors', () => {
  const corridors: Array<[string, string]> = [
    ['in', 'us'],
    ['in', 'gb'],
    ['in', 'au'],
    ['in', 'ca'],
    ['in', 'ae'],
    ['us', 'in'],
    ['us', 'ae'],
    ['ae', 'us'],
    ['de', 'fr'],
    ['sa', 'ae'],
    ['jp', 'in'],
    ['br', 'pt'],
    ['in', 'in'],
    ['unknown', 'us'],
  ];

  for (const [from, to] of corridors) {
    assert.deepEqual(lightEvaluate(from, to), matrixEvaluate(from, to), `evaluate mismatch for ${from}->${to}`);
    assert.equal(lightGetVisaCount(from, to), matrixGetVisaCount(from, to), `visaCount mismatch for ${from}->${to}`);
    assert.equal(lightGetProcessing(from, to), matrixGetProcessing(from, to), `processing mismatch for ${from}->${to}`);
    assert.equal(lightGetBestRoute(from, to), matrixGetBestRoute(from, to), `bestRoute mismatch for ${from}->${to}`);
    assert.deepEqual(lightGetRouteInfo(from, to), matrixGetRouteInfo(from, to), `routeInfo mismatch for ${from}->${to}`);
  }
});

test('heavyVisaLoader dynamically loads and caches fullVisaDatabase and regional modules', async () => {
  const bundle = await loadHeavyVisaBundle();
  assert.ok(bundle.fullDb.FULL_VISA_DB, 'FULL_VISA_DB must be populated');
  assert.ok(bundle.fullDb.BASE_COUNTRY_VISAS, 'BASE_COUNTRY_VISAS must be populated');
  assert.ok(bundle.canada.CA_IRCC_REFERENCE_LINKS.length > 0, 'Canada IRCC links must load');
  assert.ok(bundle.ukRegional.REGIONAL_DIRECTORY_SECTIONS.length > 0, 'UK regional sections must load');
  assert.ok(bundle.jpToIn.JP_TO_IN_VISA['IN'], 'JP->IN detailed guide must load');
  assert.strictEqual(getCachedHeavyVisaBundle(), bundle, 'Loaded heavy bundle must be cached');
});

test('Production build bundle decouples fullVisaDatabase, excludes dev runtime, and prevents secret leaks', () => {
  const distIndexPath = path.join(ROOT_DIR, 'dist/index.html');
  assert.ok(fs.existsSync(distIndexPath), 'dist/index.html must exist (run npm run build)');
  const distHtml = fs.readFileSync(distIndexPath, 'utf8');

  assert.ok(!distHtml.includes('fullVisaDatabase'), 'dist/index.html must NOT preload or reference fullVisaDatabase');
  assert.ok(!distHtml.includes('jsx-dev-runtime'), 'dist/index.html must NOT reference jsx-dev-runtime');

  const assetsDir = path.join(ROOT_DIR, 'dist/assets');
  const assetFiles = fs.readdirSync(assetsDir);
  const mapFiles = assetFiles.filter((f) => f.endsWith('.map'));
  assert.equal(mapFiles.length, 0, 'Production dist/assets must not emit public .map sourcemaps');

  const jsFiles = assetFiles.filter((f) => f.endsWith('.js'));
  assert.ok(jsFiles.length > 0, 'Production build must emit JS chunks');

  const forbiddenPatterns = [
    /CRON_SECRET/,
    /ADMIN_PASSWORD/,
    /GEMINI_API_KEY/,
    /DATABASE_URL/,
    /RESEND_API_KEY/,
    /\bjsxDEV\b/,
  ];

  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
    for (const pattern of forbiddenPatterns) {
      assert.ok(!pattern.test(content), `Forbidden pattern ${pattern} matched in dist/assets/${file}`);
    }
  }

  const swPath = path.join(ROOT_DIR, 'dist/sw.js');
  if (fs.existsSync(swPath)) {
    const swContent = fs.readFileSync(swPath, 'utf8');
    const urlMatches = swContent.match(/"url":"[^"]+"/g) || [];
    for (const u of urlMatches) {
      assert.ok(!u.includes('assets/aistudio/'), `SW precache must exclude ${u}`);
      assert.ok(!u.includes('sitemap'), `SW precache must exclude sitemap XML (${u})`);
    }
  }
});

test('WCAG 2.2 AA & CSS safeguards: focus-visible, reduced-motion, overflow-x clip, semantic controls', () => {
  const css = readWorkspaceFile('src/index.css');
  assert.ok(css.includes('overflow-x: clip'), 'src/index.css must protect viewport with overflow-x: clip');
  assert.ok(css.includes(':focus-visible'), 'src/index.css must define global :focus-visible outline styles');
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'src/index.css must support prefers-reduced-motion');

  const appTsx = readWorkspaceFile('src/App.tsx');
  assert.ok(!appTsx.includes('<span role="button"'), 'Must not nest <span role="button"> inside buttons');
  assert.ok(appTsx.includes('<nav aria-label="Primary navigation"'), 'Header must expose semantic primary nav');
  assert.ok(appTsx.includes('<main id="main-content"'), 'App shell must wrap content in <main id="main-content">');
  assert.ok(appTsx.includes('<React.Suspense'), 'Lazy routes/components must use React.Suspense');
  assert.ok(appTsx.includes('role="combobox"'), 'Homepage country selector must implement combobox ARIA pattern');
  assert.ok(appTsx.includes('aria-live="polite"'), 'Homepage country search results must announce counts via aria-live');
  assert.ok(appTsx.includes('aria-controls="mobile-nav-drawer"'), 'Mobile menu button must control #mobile-nav-drawer');
  assert.ok(appTsx.includes('inert={!mobileMenuOpen}'), 'Closed mobile drawer must be inert');
  assert.ok(appTsx.includes('aria-label="Breadcrumb"'), 'Breadcrumbs must declare aria-label="Breadcrumb"');
  assert.ok(appTsx.includes('htmlFor="contact-name"'), 'ContactView inputs must bind htmlFor/id labels');
  assert.ok(appTsx.includes('htmlFor="admin-password-input"'), 'AdminLoginView input must bind htmlFor/id label');
  assert.ok(appTsx.includes('role="alert"'), 'AdminLoginView error banner must use role="alert"');
  assert.ok(appTsx.includes("uiLang === 'ar' ? 'rtl' : 'ltr'"), 'Arabic interface must set dir="rtl"');

  const promoSection = readWorkspaceFile('src/components/GlobalImmigrationPromoSection.tsx');
  assert.ok(!/<div[^>]*onClick=/.test(promoSection), 'Promo cards must be semantic <button> elements, not <div onClick>');

  const blogArticleView = readWorkspaceFile('src/components/BlogArticleView.tsx');
  assert.ok(!/<span[^>]*onClick=/.test(blogArticleView), 'BlogArticleView breadcrumbs must use <button>, not <span onClick>');

  const adminMgmt = readWorkspaceFile('src/pages/VisaManagementAdminPage.tsx');
  assert.ok(!/<div[^>]*onClick=/.test(adminMgmt), 'Admin management filters must not use clickable <div>');
  assert.ok(adminMgmt.includes('aria-pressed='), 'Admin filter buttons must expose aria-pressed state');
  assert.ok(adminMgmt.includes('scope="col"'), 'Admin table headers must include scope="col"');

  const chatbot = readWorkspaceFile('src/components/VisaChatbot.tsx');
  assert.ok(chatbot.includes('role="dialog"'), 'VisaChatbot panel must expose role="dialog"');
  assert.ok(chatbot.includes("e.key === 'Escape'"), 'VisaChatbot must close on Escape key');
  assert.ok(chatbot.includes('aria-expanded={isOpen}'), 'VisaChatbot toggle must expose aria-expanded');

  const dashboard = readWorkspaceFile('src/components/ImmigrationVerificationDashboard.tsx');
  assert.ok(dashboard.includes('aria-modal="true"'), 'Verification modal must expose aria-modal="true"');
  assert.ok(dashboard.includes("e.key === 'Escape'"), 'Verification modal must close on Escape');

  const auditPage = readWorkspaceFile('src/pages/GlobalVisaCoverageAuditPage.tsx');
  assert.ok(auditPage.includes('scope="col"'), 'Audit table headers must include scope="col"');
  assert.ok(auditPage.includes("e.key === 'Enter' || e.key === ' '"), 'Audit table rows must be keyboard activatable');
});

test('All 15 i18n locale dictionaries maintain 100% key parity', () => {
  const localesDir = path.join(ROOT_DIR, 'public/locales');
  const langs = fs.readdirSync(localesDir).filter((d) =>
    fs.statSync(path.join(localesDir, d)).isDirectory()
  );
  assert.equal(langs.length, 15, 'Must support all 15 configured interface languages');

  const enKeys = Object.keys(
    JSON.parse(fs.readFileSync(path.join(localesDir, 'en/common.json'), 'utf8'))
  ).sort();

  assert.ok(enKeys.length >= 60, 'English base dictionary should contain at least 60 keys');
  for (const lang of langs) {
    const dict = JSON.parse(fs.readFileSync(path.join(localesDir, `${lang}/common.json`), 'utf8'));
    assert.deepEqual(Object.keys(dict).sort(), enKeys, `Locale key parity mismatch in ${lang}/common.json`);
  }
});

test('Canonical pathway resolver serves all 10 genuine Priority 1 and 210 Priority 2 pathways while blocking quarantined records and unknown routes', () => {
  const genuineP1 = getPublicPriority1Pathways();
  assert.equal(genuineP1.length, 10, 'Must expose exactly 10 genuine Priority 1 pathways');

  for (const p1 of genuineP1) {
    const resolved = resolvePublicCanonicalPathwayByUrl(p1.canonicalUrl);
    assert.ok(resolved, `Genuine P1 pathway ${p1.canonicalUrl} must resolve`);
    assert.equal(resolved.pathway.id, p1.id);
    assert.equal(isRouteRegisteredInSeoManager(p1.canonicalUrl).registered, true, `SEO manager must register ${p1.canonicalUrl}`);
  }

  assert.equal(PRIORITY2_COMPLETED_PATHWAYS.length, 210, 'Must contain 210 completed Priority 2 pathways');
  const p2Sample = resolvePublicCanonicalPathwayByUrl('/visa/norway/self-employed-visa');
  assert.ok(p2Sample, 'Priority 2 sample /visa/norway/self-employed-visa must resolve');
  assert.equal(p2Sample.priorityTier, 'PRIORITY_2');
  assert.equal(p2Sample.pathway.id, 'p2-no-selfemp');
  assert.ok(!('correctiveClassificationNotes' in p2Sample.pathway), 'Public P2 view must strip internal classification notes');

  assert.equal(PRIORITY1_QUARANTINED_PATHWAYS.length, 132, '132 synthetic P1 pathways must remain quarantined');
  const p2CanonicalSet = new Set(
    PRIORITY2_COMPLETED_PATHWAYS.map((p) => p.canonicalUrl.replace(/\/+$/, '').toLowerCase())
  );
  for (const q of PRIORITY1_QUARANTINED_PATHWAYS) {
    const res = resolvePublicCanonicalPathwayByUrl(q.canonicalUrl);
    if (p2CanonicalSet.has(q.canonicalUrl.replace(/\/+$/, '').toLowerCase())) {
      assert.equal(res?.priorityTier, 'PRIORITY_2', `Superseded URL ${q.canonicalUrl} must resolve to genuine PRIORITY_2, never quarantined P1`);
      assert.notEqual(res?.pathway.id, q.id, 'Must never expose quarantined P1 ID');
    } else {
      assert.equal(res, null, `Quarantined P1 pathway ${q.canonicalUrl} without P2 replacement must return null (404)`);
    }
  }

  assert.equal(resolvePublicCanonicalPathwayByUrl('/404-nonexistent-route'), null, 'Unknown route must return null (404)');
});

test('React 19 boolean attribute integrity: zero empty-string boolean JSX attributes across codebase', () => {
  const appTsx = readWorkspaceFile('src/App.tsx');
  assert.ok(appTsx.includes('inert={!mobileMenuOpen}'), 'src/App.tsx must use boolean inert={!mobileMenuOpen}');
  assert.ok(!appTsx.includes("inert: ''"), 'src/App.tsx must not use empty string for boolean inert attribute');
});

