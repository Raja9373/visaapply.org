# VisaApply.org — Phase 7 Completion Report
## Global SEO, Performance, Accessibility, Security & Content-Quality Audit

**Date:** 2026-11-25  
**Architecture:** Zero-Database-First / Database-Light (Static JSON/Markdown Catalog + GitHub PR Governance)  
**Status:** COMPLETE (Local Audit, Safe High-Confidence Improvements & Automated Verification Passed — Stopped Before Phase 8)

---

## 1. Baseline Audit (Read-Only Pre-Change Snapshot)

Before making any code edits, an evidence-based read-only audit was executed against the actual repository state (`index.html`, `src/App.tsx`, `src/utils/seoMetadataManager.ts`, `src/utils/ssrRouteRenderer.ts`, `src/utils/securityHardening.ts`, `src/i18n/config.ts`, `server.ts`, `public/robots.txt`, `public/sitemap*.xml`, `public/sitemaps-static/`, `public/catalog/`, `data/`, and `dist/assets/`).

### Environment & Tooling Disclosure (Observed Facts vs. Unavailable Tools)
| Tool / Capability | Availability | Evidence Basis Used in Phase 7 |
|---|---|---|
| Node.js v22 + `tsx` + `node --test` | Available | Full 157-test automated verification suite + SSR route verification |
| TypeScript (`tsc --noEmit`) & Vite (`vite build`) | Available | Exact build compilation, bundle size, and gzip byte measurements |
| `bun audit` | Available | Dependency vulnerability audit executed directly |
| Headless Chromium / Chrome / Playwright / Lighthouse | **Unavailable in container** | No synthetic Lighthouse or Core Web Vitals scores were invented; browser visual/CWV checks are explicitly documented under Section 12 (Known Limitations) |

### Baseline Snapshot Summary
- **Baseline Test Suite:** `149/149` tests passing across Phases 1–6.1.
- **Initial Entry JS (`dist/assets/index-CSWcEHOB.js`):** **1,390.3 KB raw / 325.0 KB gzip** — severely bloated by an accidental eager static import (`resolvePublicCanonicalPathwayByUrl` from `./pages/CanonicalPathwayPage`) in `src/App.tsx:114`, which dragged `src/data/priority2AuditData.ts` (457.3 KB) and `src/data/priority1AuditData.ts` into the initial entry chunk despite `CanonicalPathwayPage` being wrapped in `React.lazy()`.
- **CSS Bundle (`dist/assets/index-*.css`):** **166.6 KB raw / 20.8 KB gzip**.
- **Static Catalog (`public/catalog/`):** **44 files, 752.5 KB raw / 131.2 KB gzip** (largest single file: `index-countries.*.json` at 46.9 KB raw).
- **Candidate Sitemaps (`public/sitemaps-static/`):** **6 files, 31.9 KB raw / 3.0 KB gzip**, **56 canonical URLs**, **210 hreflang links**, 0 duplicates, 0 quarantined/draft/admin/self-route leaks.
- **Legacy Sitemaps & Robots:** **89** `public/sitemap*.xml` files and `public/robots.txt` preserved untouched.
- **Canonical Catalog (`data/`):** **287 files scanned**, `17/17` checks passed, **0 errors**, **2 informational warnings** (228 countries quarantined awaiting primary sovereign HTTPS verification; 3 draft articles properly excluded from public output).

---

## 2. Global SEO Audit Findings

### Audited Dimensions
- **Unique Titles & Meta Descriptions:** `auditAllStaticRoutesSeo()` validated all static routes in `STATIC_ROUTE_SEO_REGISTRY` with **0 invalid routes**.
- **Duplicate Crawler Meta Tags Found (FIXED):** `index.html` emitted `<meta name="robots">`, `<meta name="googlebot">`, and `<meta name="bingbot">` **twice** (lines 8–10 and lines 127–129).
- **Missing Baseline Static JSON-LD Found (FIXED):** `index.html` lacked a static `<script type="application/ld+json">` block for non-JS crawlers (JSON-LD was previously only injected dynamically at runtime).
- **Hardcoded `og:locale` Found (FIXED):** Both `index.html` and `src/utils/seoMetadataManager.ts:963` hardcoded `og:locale` to `en_IN` regardless of the active route language.
- **Missing Explicit Registry Entry for `/admin/editorial-review` Found (FIXED):** `/admin/editorial-review` relied on the generic `/admin/` prefix fallback rather than an explicit `noindex: true` entry in `STATIC_ROUTE_SEO_REGISTRY`.
- **Canonical URLs & Hreflang:**
  - Canonical origin strictly enforces `https://www.visaapply.org/...` with lowercase normalization and self-route (`/xx-to-xx`) 301 canonical redirect to `/immigration/:iso`.
  - Localized UI routes (`/`, `/routes`, bilateral route matrices) accurately emit all 15 language alternates + `x-default` (16 tags).
  - English-only statutory/detail/tool routes (e.g., `/immigration/us`, `/visa/us/...`) honestly emit strictly `en` + `x-default` without fabricating fake translated alternates.
  - Restricted routes (`/admin`, `/admin/login`, `/admin/editorial-review`, `/audit`) emit `noindex, nofollow` and `0` hreflang alternates.
- **Images & Alt Text:** Verified `0` `<img>` tags missing `alt` attributes across `src/`.
- **Candidate Sitemaps vs. Legacy Sitemaps:**
  - `sitemap-static-core.xml`: 9 URLs (46 hreflang links)
  - `sitemap-static-countries.xml`: 14 active verified countries (28 hreflang links)
  - `sitemap-static-programs.xml`: 28 verified published programs (56 hreflang links)
  - `sitemap-static-routes.xml`: 3 verified route overrides (48 hreflang links)
  - `sitemap-static-editorial.xml`: 2 verified published editorial guides (32 hreflang links)
  - Total: **56 canonical URLs**, **0 duplicates**, **0 quarantined/draft/expired/admin/self-routes**.

---

## 3. Performance Audit Findings

### Root Cause of Initial Bundle Bloat
`src/App.tsx:79` declared `CanonicalPathwayPage` via `React.lazy()`, but line 114 statically imported `resolvePublicCanonicalPathwayByUrl` from `./pages/CanonicalPathwayPage`. Because `CanonicalPathwayPage.tsx` imports `priority2AuditData.ts` (457.3 KB) and `priority1AuditData.ts`, Vite was forced to bundle the entire statutory audit dataset into the initial `index-*.js` entry chunk on every route load.

### Verification of Safe Code-Splitting Boundary
Auditing all `canonicalUrl` values across `src/data/priority1AuditData.ts` and `src/data/priority2AuditData.ts` proved **0** Priority 1/2 canonical URLs use 2-letter ISO codes (all use full country slugs like `/visa/japan/digital-nomad-visa`), whereas static catalog program routes strictly use 2-letter ISO codes (`/visa/:iso2/:programId`). Removing the eager import from `src/App.tsx` decoupled `CanonicalPathwayPage` + `priority2AuditData` cleanly into lazy chunks with zero routing regressions.

### Explicit Phase 7 Performance Budgets (Automated in CI/Tests)
| Asset Category | Phase 7 Budget | Post-Fix Measured Value | Status |
|---|---|---|---|
| Initial Entry JS (`index-*.js`) | < 960 KB raw / < 240 KB gzip | **894.9 KB raw / 205.3 KB gzip** | PASS |
| Lazy `CanonicalPathwayPage` Chunk | Split out of entry bundle | **42.4 KB raw / 10.3 KB gzip** (+ lazy audit data chunk) | PASS |
| Global CSS (`index-*.css`) | < 200 KB raw / < 30 KB gzip | **166.9 KB raw / 20.8 KB gzip** | PASS |
| Total Static Catalog (`public/catalog/`) | < 900 KB raw / < 160 KB gzip | **752.5 KB raw / 131.2 KB gzip** (44 files) | PASS |
| Largest Single Catalog JSON | < 60 KB raw | **46.9 KB raw** (`index-countries.*.json`) | PASS |

---

## 4. Accessibility Audit Findings (WCAG 2.2 AA Target — Code-Level Audit)

> **Honest Scope Note:** Because headless Chromium/Playwright/axe-core browser execution is unavailable in this environment, accessibility findings reflect static DOM/JSX, CSS, ARIA, semantic landmark, keyboard semantics, and RTL attribute audits — **not** an accredited WCAG certification.

### Verified Existing Strengths
- Semantic landmarks present: `<header>`, `<nav aria-label>`, `<main id="main-content" tabIndex={-1}>`, `<footer>`, and skip-to-content link (`href="#main-content"`).
- Keyboard focus visibility (`:focus-visible`) and reduced motion (`prefers-reduced-motion`) rules active in `src/index.css`.
- `<html lang>` and `dir="rtl"` dynamically applied for Arabic (`ar`) via `applyDocumentLangAttributes` and root `<div dir={...}>`.
- All 6 Global Immigration Hub category cards in `GlobalImmigrationPromoSection.tsx` render as native `<a href="/immigration?category=...">` elements.

### Gaps Found & Remediated
1. **Unlinked Form Labels in `FlightSearchWidget.tsx` & `HotelBookingWidget.tsx` (FIXED):** All 8 `<label>` elements lacked `htmlFor`/`id` associations to their `<input>`/`<select>` controls. Added React `useId()` bindings, `aria-label` on `<form>`, `aria-hidden="true"` on decorative icons/emojis, and visible `focus-visible:ring-2` focus indicators.
2. **Promo Section Landmark & Decorative Icons in `GlobalImmigrationPromoSection.tsx` (FIXED):** Added `aria-labelledby="global-immigration-hub-heading"` on `<section>`, matching `id` on `<h2>`, `aria-hidden="true"` on decorative SVG icons and blur accents, and high-visibility `focus-visible` ring on the primary CTA link.

---

## 5. Defensive Security Audit Findings

### Issues Found & Remediated in Phase 7
1. **DOM Injection / Raw `innerHTML` & Inline `onclick` Sink (`src/App.tsx:215–268`, `renderCountryPageFixed`) — FIXED:**
   - Previously interpolated `countryCode` directly into an inline `onclick="..."` attribute and assigned raw HTML to `container.innerHTML`.
   - Fixed by enforcing a strict `/^[a-z]{2,3}$/` allowlist (returning early on invalid input) and replacing raw HTML string assignment with safe DOM API construction (`createElement`, `textContent`, `addEventListener`, `replaceChildren`).
2. **External `target="_blank"` Links Missing `noopener` (4 Instances) — FIXED:**
   - `src/App.tsx:6940` (`embedCode` widget): updated `rel="dofollow"` → `rel="noopener"`.
   - `src/components/ImmigrationVerificationDashboard.tsx` (lines 472 & 632): updated `rel="noreferrer"` → `rel="noopener noreferrer"`.
   - `src/components/admin/ClaimsManager.tsx` (line 1505): updated `rel="noreferrer"` → `rel="noopener noreferrer"`.
3. **Outbound `window.open(..., '_blank')` Without `noopener,noreferrer` & Input Sanitization — FIXED:**
   - `src/components/FlightSearchWidget.tsx` and `src/components/HotelBookingWidget.tsx`: added strict IATA/date/guest validation, explicit `https://` origin prefix checks, `'noopener,noreferrer'` window features, and `opened.opener = null`.
4. **Missing `Permissions-Policy` Response Header — FIXED:**
   - Added `'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'` to `getSecurityHeaders()` in `src/utils/securityHardening.ts`.

### Audited Controls Confirmed Intact
- **Server Route Access Control (`server.ts`):** Every `/api/admin/*`, `/api/drafts`, and `/api/cron*` endpoint enforces `requireAdminAuth` (HttpOnly signed session + CSRF + origin check) or `requireCronOrAdminAuth` (fail-closed if `CRON_SECRET` unset).
- **Public Catalog & Sitemap Data Hygiene:** Zero secrets, API keys, DB URIs, or private user emails present in `public/catalog/` or `public/sitemaps-static/`.
- **Database Immutability:** Protected SQLite files (`data_db/immigration_hub.db`, `-wal`, `-shm`) and Phase B.3 standalone backup verified byte-for-byte identical via SHA-256 checksums.

### Dependency Audit (`bun audit` Baseline)
- `bun audit` reported **24 transitive advisories** (7 high, 13 moderate, 4 low), originating exclusively from two build/dev-only dependency trees:
  - `@vercel/node` (devDependency; pulls `undici@5.28.4`, `@fastify/busboy@2.1.1`, `path-to-regexp@6.1.0`) — not imported in `src/` or `server.ts`.
  - `vite-plugin-pwa > workbox-build` (build-time devDependency; pulls `ajv`, `glob`, `minimatch`) — never bundled into browser runtime.
- Per Phase 7 safety constraints (no breaking dependency upgrades or package deletions), these are documented in Section 13 with a clean upgrade path for a dedicated maintenance PR.

---

## 6. Immigration Content-Quality Audit Findings

Validated directly via `npm run catalog:validate` (`scripts/validateStaticCatalog.ts`) and Phase 7 automated checks:
- **Catalog Validation Status:** **PASSED (`17/17` checks, `0` errors, `2` informational warnings)**.
- **Programs (`data/programs/*.json` — 9 country files):** **28/28** programs are `AVAILABLE_VERIFIED` and `PUBLISHED`.
  - **28/28** include official `https://` government references (**44/44** source URLs use `https://`).
  - **28/28** include `legalBasis`, `eligibilitySummary`, and `lastVerifiedDate`.
  - **0** expired programs published; **0** conflicting claims published.
- **Visa Details (`data/visa-details/`):** **1** published detail (`us-TOU-001`, `AVAILABLE_VERIFIED`, `lastVerifiedDate: 2026-11-10`).
- **Claims & Evidence (`data/verification/`):** **1** verified claim (`CL-1B9EC8518621`) backed by **1** verified official evidence record (`EV-551B510D7A95`, `https://travel.state.gov/`).
- **Quarantine Isolation (`data/verification/quarantine.json`):** **229** quarantined records (`228` countries with `AWAITING_OFFICIAL_VERIFICATION`, `1` expired program with `EXPIRED_PROGRAM`) — strictly excluded from public program indexes and candidate sitemaps.
- **Editorial Separation (`data/editorial/`):** **2** verified published articles included; **3** private drafts excluded from public output.
- **Zero unverified legal data was published, invented, or silently altered.**

---

## 7. 15-Language & RTL Localization Audit

Audited all 15 supported languages (`en, hi, de, es, pl, fr, ar, ru, zh, ja, pt, it, nl, tr, ko`) in `src/i18n/config.ts` and `src/utils/seoMetadataManager.ts`:
- **UI Dictionary Completeness:** **15/15 languages** have **65/65 non-empty keys (`100%` coverage, `0` missing keys)**.
- **Fixed Untranslated String:** Dutch (`nl.downloadChecklistPdf`) previously retained English `'📄 Download Checklist PDF'`; localized cleanly to `'📄 PDF-checklist downloaden'`.
- **RTL Support:** Arabic (`ar`) declares `dir: 'rtl'`, triggers `dir="rtl"` on `<html>` and the root container, and resolves `og:locale` to `ar_AE`.
- **Legal Content Fallback Honesty:** `LEGAL_CONTENT_LANGUAGES = ['en']` and `englishFallbackNotice` exist across all 15 languages so statutory clauses are never machine-fabricated in non-English languages.
- **Dynamic `og:locale`:** Now dynamically resolves all 15 supported languages (`en_US`, `hi_IN`, `de_DE`, `es_ES`, `pl_PL`, `fr_FR`, `ar_AE`, `ru_RU`, `zh_CN`, `ja_JP`, `pt_BR`, `it_IT`, `nl_NL`, `tr_TR`, `ko_KR`).

---

## 8. Broken Links & Route Resolution Results

Verified via automated route-parser and SSR route-renderer tests (`renderRouteSsrPayload`, `parseImmigrationCategoryQuery`, `buildImmigrationHubUrl`):
- **All 6 Global Immigration Hub Category Cards:**
  1. Permanent Residency → `/immigration?category=permanent-residency` (`pr`) — PASS
  2. Citizenship & Naturalization → `/immigration?category=citizenship` (`citizenship`) — PASS
  3. Work Immigration → `/immigration?category=work-immigration` (`work`) — PASS
  4. Family Immigration → `/immigration?category=family-immigration` (`family`) — PASS
  5. Business & Investor Immigration → `/immigration?category=business-investor` (`business`) — PASS
  6. Digital Nomad & Retirement Residency → `/immigration?category=digital-nomad-retirement` (`digital_nomad`) — PASS
  - Valid categories with zero verified records show an honest empty state (not 404).
- **Core Public Routes (HTTP 200 + Valid Title, Description, Canonical, Indexable Robots):** `/`, `/immigration`, `/immigration/us`, `/routes`, `/in-to-us`, `/in-to-ca-tourist`, `/visa/us/us-pr-eb2-niw`, `/visa/japan/digital-nomad-visa`, `/tools/cost-calculator`, `/verification`, `/sitemap`, `/about`, `/privacy`, `/terms`, `/contact` — **ALL PASS**.
- **Self-Route Canonicalization:** `/in-to-in` → **HTTP 301** redirect to `/immigration/in` — **PASS**.
- **Restricted Admin & Audit Routes:** `/admin`, `/admin/login`, `/admin/editorial-review`, `/audit` → **`noindex, nofollow`** enforced — **PASS**.

---

## 9. Fixes Implemented

| Area | File(s) Modified | Change Summary |
|---|---|---|
| SEO | `index.html` | Removed duplicate `robots`/`googlebot`/`bingbot` meta tags; updated default `og:locale` to `en_US`; added baseline `Organization` + `WebSite` JSON-LD `@graph`. |
| SEO & i18n | `src/utils/seoMetadataManager.ts` | Registered `/admin/editorial-review` explicitly with `noindex: true`; added `OG_LOCALE_BY_LANG` & `resolveOgLocaleForPath()` for all 15 supported languages. |
| Performance & Security | `src/App.tsx` | Removed eager static import of `resolvePublicCanonicalPathwayByUrl` to code-split `CanonicalPathwayPage` + `priority2AuditData` out of initial `index-*.js`; replaced raw `.innerHTML`/inline `onclick` in `renderCountryPageFixed` with strict ISO allowlist + DOM APIs; upgraded embed badge link to `rel="noopener"`. |
| Security | `src/utils/securityHardening.ts` | Added `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()` to `getSecurityHeaders()`. |
| Security & A11y | `src/components/FlightSearchWidget.tsx`, `src/components/HotelBookingWidget.tsx` | Bound all `<label htmlFor>` to `<input id>`/`<select id>` via `useId()`; hid decorative icons (`aria-hidden="true"`); added `focus-visible` rings; added strict IATA/date/guest validation, `https://` checks, and `noopener,noreferrer` window opening. |
| Accessibility | `src/components/GlobalImmigrationPromoSection.tsx` | Added `aria-labelledby`, heading `id`, `aria-hidden="true"` on decorative icons/accents, and `focus-visible` ring on primary CTA. |
| Security | `src/components/ImmigrationVerificationDashboard.tsx`, `src/components/admin/ClaimsManager.tsx` | Upgraded all 3 remaining `target="_blank" rel="noreferrer"` links to `rel="noopener noreferrer"`. |
| i18n | `src/i18n/config.ts` | Localized Dutch `nl.downloadChecklistPdf` to `'📄 PDF-checklist downloaden'`. |
| Testing | `tests/phase7_audit_seo_perf_a11y_security.test.ts` | Added 8 automated Phase 7 tests enforcing SEO, sitemap isolation, bundle budgets, accessibility markup, security invariants, catalog quality, i18n, and route resolution. |

---

## 10. Before / After Measurements

| Metric | Baseline (Before Phase 7) | Post-Phase 7 (Measured) | Delta |
|---|---|---|---|
| Initial Entry JS (`dist/assets/index-*.js`) Raw | 1,390.3 KB (`index-CSWcEHOB.js`) | **894.9 KB** (`index-BHF2Zf3u.js`) | **-495.4 KB (-35.6%)** |
| Initial Entry JS (`dist/assets/index-*.js`) Gzip | 325.0 KB | **205.3 KB** | **-119.7 KB (-36.8%)** |
| Lazy `CanonicalPathwayPage` Chunk | Not split (inlined in entry) | **42.4 KB raw / 10.3 KB gzip** (separate chunk) | **Cleanly code-split** |
| Global CSS (`dist/assets/index-*.css`) | 166.6 KB raw / 20.8 KB gzip | **166.9 KB raw / 20.8 KB gzip** | +0.3 KB raw / 0.0 KB gzip |
| Duplicate Crawler Meta Tags in `index.html` | 3 duplicated tags | **0** | **-100%** |
| Static JSON-LD in `index.html` | 0 | **1 (`Organization` + `WebSite` `@graph`)** | Added |
| `og:locale` Languages Supported | 1 hardcoded (`en_IN`) | **15 dynamic locales** | +14 locales |
| `target="_blank"` Links Missing `noopener` | 4 | **0** | **-100%** |
| Unsafe `window.open('_blank')` Calls | 2 | **0** | **-100%** |
| Raw `.innerHTML` / Inline `onclick` Legacy Sink | 1 (`renderCountryPageFixed`) | **0** | **-100%** |
| Unbound Form Labels in Travel Widgets | 8 | **0** | **-100%** |
| `Permissions-Policy` Security Header | Missing | **Active** | Added |
| Automated Passing Tests | 149 / 149 | **157 / 157** | **+8 tests (100% pass)** |

---

## 11. Tests and Build Results

- **TypeScript Check (`tsc --noEmit` / `lint_applet`):** PASSED (0 errors).
- **Production Vite Build (`vite build` / `compile_applet`):** PASSED cleanly across 81 JS chunks + 1 CSS bundle.
- **Static Catalog Validation (`npm run catalog:validate`):** PASSED (`17/17` checks, 0 errors, 2 informational warnings).
- **Editorial PR Validation (`npm run editorial:validate-pr`):** PASSED.
- **GitHub Config Verification (`npm run editorial:verify-github-config`):** PASSED.
- **Automated Test Suite (`node --test --import tsx tests/*.test.ts`):**
  - Prior Phases 1–6.1 regression tests: **149 / 149 PASSED**
  - New Phase 7 audit test suite (`tests/phase7_audit_seo_perf_a11y_security.test.ts`): **8 / 8 PASSED**
  - **Grand Total: 157 / 157 PASSED (0 failed, 0 skipped)**

---

## 12. Known Limitations

1. **No Headless Browser / Lighthouse / Real-Device CWV Execution in Container:** `chromium`, `playwright`, and `lighthouse` are not installed in this build environment. Real-browser LCP/INP/CLS measurements, screen-reader voice testing (NVDA/VoiceOver), and visual color-contrast pixel inspection must be executed in a staging browser environment before claiming production CWV or WCAG conformance.
2. **Remaining Entry Bundle Size (894.9 KB raw / 205.3 KB gzip):** While reduced by 35.6% (-495.4 KB raw), `src/App.tsx` itself (7,867 lines) still bundles inline route components (`HomeView`, `ArticleView`, `VisaCategoryListView`) and static lookup tables (`countryMetaData.ts`, `translations.ts`, `defaultArticles.ts`). Extracting those views into lazy-loaded modules can further bring initial JS below 450 KB raw / 120 KB gzip in a future refactor without touching routes.
3. **228 Quarantined Countries:** By design, 228 countries remain in `QUARANTINED` status until verified against primary sovereign HTTPS authorities through the Phase 5B/6 editorial PR workflow.
4. **English-Only Statutory Text:** Detailed statutory clauses remain in authoritative English (`LEGAL_CONTENT_LANGUAGES = ['en']`) with localized disclaimers (`englishFallbackNotice`) in all 15 UI languages until certified legal translations are reviewed.

---

## 13. Remaining Risks

1. **Transitive Dev/Build Dependency Advisories (`bun audit` — 24 findings):**
   - `@vercel/node` pulls vulnerable transitive `undici@5.28.4`, `@fastify/busboy@2.1.1`, and `path-to-regexp@6.1.0`.
   - `vite-plugin-pwa > workbox-build` pulls vulnerable transitive `ajv`, `glob`, and `minimatch`.
   - **Risk Level:** Low for public browser runtime (neither package is bundled into `dist/` browser code), Medium for serverless/CI build hosts if `@vercel/node` is executed in Vercel serverless runtime.
   - **Recommended Remediation:** Upgrade `@vercel/node` and `vite-plugin-pwa` in an isolated dependency-maintenance PR with full staging verification.
2. **CSP `'unsafe-inline'` in `script-src` / `style-src`:** Required by inline canonical sync/AdSense bootstrap scripts in `index.html` and Tailwind inline styles; migrating inline scripts to external hashed/nonce scripts is recommended in a future CSP hardening pass.
3. **Live External Government Link Drift:** Official government URLs can change over time; continued scheduled runs of the Phase 5B source-monitoring workflow and Phase 6 PR review workflow are required to catch broken official URLs promptly.

---

## 14. Rollback Instructions

All Phase 7 changes are localized, non-destructive source edits with zero database, schema, sitemap, or `robots.txt` mutations:

```bash
# 1. Inspect modified Phase 7 files
git status

# 2. Revert individual Phase 7 files if needed
git checkout -- index.html \
  src/App.tsx \
  src/utils/seoMetadataManager.ts \
  src/utils/securityHardening.ts \
  src/components/FlightSearchWidget.tsx \
  src/components/HotelBookingWidget.tsx \
  src/components/GlobalImmigrationPromoSection.tsx \
  src/components/ImmigrationVerificationDashboard.tsx \
  src/components/admin/ClaimsManager.tsx \
  src/i18n/config.ts

# 3. Remove Phase 7 test & report if rolling back completely
rm -f tests/phase7_audit_seo_perf_a11y_security.test.ts docs/PHASE_7_COMPLETION_REPORT.md

# 4. Rebuild and verify baseline
npm run lint && npm run build && node --test --import tsx tests/*.test.ts
```

---

## 15. Sitemap Cutover Recommendations (For a Later Authorized Phase — NOT Executed in Phase 7)

In strict compliance with Phase 7 safety rules, **all 89 legacy `public/sitemap*.xml` files and `public/robots.txt` remain completely untouched**. When the team is ready to cut over to the verified static candidate sitemaps (`public/sitemaps-static/sitemap-static-index.xml`, 56 verified URLs), follow this controlled rollout plan:

1. **Pre-Cutover Verification:**
   - Re-run `npm run catalog:validate` and `npm run sitemaps:generate-static` to confirm 0 errors and fresh `<lastmod>` dates.
   - Confirm in staging that all 56 URLs in `public/sitemaps-static/` return HTTP `200` with matching `<link rel="canonical">` and zero `noindex` headers.
   - Confirm whether legacy programmatic bilateral route URLs (`sitemap-routes-*.xml`) should be phased out gradually (to avoid sudden Search Console de-indexing shocks) or kept in a separate legacy sitemap index during transition.
2. **Staged Cutover Execution (Authorized Phase Only):**
   - Submit `https://www.visaapply.org/sitemaps-static/sitemap-static-index.xml` in Google Search Console alongside the existing index first to monitor crawl/indexing rates for 7–14 days.
   - Once verified healthy in Search Console (0 4xx/5xx errors, canonical acceptance >= 95%), update `public/robots.txt` `Sitemap:` directive and `server.ts` `/sitemap.xml` handler to serve the verified static sitemap index.
3. **Instant Rollback Plan:** Keep the 89 legacy `public/sitemap*.xml` files archived in git so reverting `public/robots.txt` and `server.ts` restores the previous sitemap index within one deployment.

---

## 16. Exact Next Phase

**STOP HERE — Do NOT start Phase 8 automatically.**  
Pending user review and sign-off on Phase 7, the logical next phase (**Phase 8 — Staging Deployment Readiness, Real-Browser CWV/Accessibility Verification & Controlled Sitemap/Static-Hosting Cutover**) should:
1. Run real headless Chromium / Playwright E2E, axe-core WCAG 2.2 AA, and Lighthouse Core Web Vitals checks against a live staging build.
2. Execute the isolated devDependency maintenance upgrade (`@vercel/node`, `vite-plugin-pwa`) and verify clean `bun audit`.
3. Follow the Section 15 Staged Sitemap Cutover Plan only after explicit user authorization.
