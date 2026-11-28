# PHASE 9.7F — LIVE PRODUCTION INDEPENDENT AUDIT & RELEASE VERIFICATION

- **Project:** VisaApply.org (`https://www.visaapply.org`)
- **Repository:** `Raja9373/visaapply.org`
- **Audit Date (UTC):** 2026-11-28
- **Audit Mode:** **STRICT READ-ONLY** (zero code edits, zero GitHub writes/branches/PRs/merges, zero Vercel redeployments/promotions, zero DNS/DB/env changes, ₹0 / $0)
- **Overall Status:** **`PASS WITH WARNINGS`**

---

## 1. Verified Production Deployment & Repository State

Independently verified via live GitHub REST API (`api.github.com/repos/Raja9373/visaapply.org`) and live HTTP responses from `https://www.visaapply.org`:

| Verification Item | Verified Live Value |
| :--- | :--- |
| **Current `origin/main` HEAD SHA** | `98c1ab9a70e6ca5042886a9ac82a374d9eaa1a3c` (`protected: true`, committed `2026-11-28T13:27:44Z`) |
| **Current `origin/main` Commit Message** | `docs: update Phase 9.7 documentation` |
| **Preceding `origin/main` SSR Fix Commit** | `4923fe5d3ad5f7fc53d8d84bd17bc88966f666a9` (`2026-11-28T13:10:20Z` — `refactor: add explicit .js extensions for ESM imports`) |
| **Latest Vercel Production Deployment ID** | `8wPrio2vajdBUkqtY38jwNov6gdc` (`https://vercel.com/alokmohansharmadelhi-1029s-projects/visaapply-org/8wPrio2vajdBUkqtY38jwNov6gdc`) |
| **Preceding Vercel Production Deployment ID (`4923fe5`)** | `6qmDFsyws3wDRGYFcwKDcVrt6JQL` (`https://vercel.com/alokmohansharmadelhi-1029s-projects/visaapply-org/6qmDFsyws3wDRGYFcwKDcVrt6JQL`) |
| **Deployment Status (`98c1ab9`)** | **`success`** (`"Deployment has completed"`) |
| **Production Domain & Live Serving Evidence** | `https://www.visaapply.org` (`server: Vercel`, `x-vercel-id`, live SSR bundle `/assets/index-DE5lMZM8.js`) |
| **Matches Current `main` / Non-Stale Release?** | **YES** — `98c1ab9` is the latest commit on `main`, its Vercel Production deployment succeeded, all 7 Phase 9.7B/9.7C files match `origin/main` byte-for-byte, and live `/api/render` executes the `.js` ESM fix with `HTTP 200` across 16/16 routes (no stale `7395289` HTTP 500 behavior remains). |
| **Remote Branches & Pull Requests** | `main` (`98c1ab9`, protected), `visaapply-staging` (`7395289`, untouched). `phase-9-7b-ssr-fix`: does **not** exist. Open/closed PRs: **0**. |

---

## 2. All 16 Live SSR Routes — Independent Verification Results

Exact 16-route list retrieved directly from `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` (`REQUIRED_CORE_ROUTES` + `REPRESENTATIVE_BILATERAL_ROUTES`). Every route was checked via live HTTP fetch (redirect trace, headers, HTML, JSON-LD parsing) AND live headless Chromium (`pageerror` / console / failed requests):

| # | Route | HTTP | Redirects | SSR (`<main>` + `<h1>`) | Title | Meta Desc Len | Canonical Matches Route | JSON-LD (Valid/Invalid) | Uncaught `pageerror` | `ERR_MODULE_NOT_FOUND` |
| :---: | :--- | :---: | :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 1 | `/immigration` | **200** | 0 | **YES** | `Global Immigration & Residency Hub (249 Countries) – VisaApply.org` | 160 | **YES** | **2 / 0** (`Organization, WebSite, WebPage`) | 0 | **NO** |
| 2 | `/immigration/us` | **200** | 0 | **YES** | `United States Immigration & Visa Pathways (2026 Official Portal Guide) – VisaApply.org` | 185 | **YES** | **2 / 0** (`..., BreadcrumbList, Article`) | 0 | **NO** |
| 3 | `/in-to-ca-tourist` | **200** | 0 | **YES** | `Canada Tourist Visa for India Citizens (2026 Rules & Fees) – VisaApply.org` | 330 *(long)* | **YES** | **2 / 0** (`..., BreadcrumbList, Article, FAQPage`) | 0 | **NO** |
| 4 | `/tools/visa-comparison` | **200** | 0 | **YES** | `VisaApply.org – Global Visa Requirements, PR Pathways & Official Links (249 Countries)` *(generic fallback)* | 201 | **YES** | **2 / 0** (`Organization, WebSite, WebPage`) | 0 | **NO** |
| 5 | `/in-to-us` | **200** | 0 | **YES** | `United States Visa for India Citizens – 2026 Requirements, Fees & E-Visa Guide \| VisaApply.org` | 408 *(long)* | **YES** | **2 / 0** (`..., Article, FAQPage`) | 0 | **NO** |
| 6 | `/in-to-gb` | **200** | 0 | **YES** | `United Kingdom Visa for India Citizens – 2026 Requirements, Fees & E-Visa Guide \| VisaApply.org` | 410 *(long)* | **YES** | **2 / 0** (`..., Article, FAQPage`) | 0 | **NO** |
| 7 | `/in-to-au` | **200** | 0 | **YES** | `Australia Visa for India Citizens – 2026 Requirements, Fees & E-Visa Guide \| VisaApply.org` | 400 *(long)* | **YES** | **2 / 0** (`..., Article, FAQPage`) | 0 | **NO** |
| 8 | `/in-to-de` | **200** | 0 | **YES** | `Germany Visa for India Citizens – 2026 Requirements, Fees & E-Visa Guide \| VisaApply.org` | 419 *(long)* | **YES** | **2 / 0** (`..., Article, FAQPage`) | 0 | **NO** |
| 9 | `/us-to-gb` | **200** | 0 | **YES** | `United Kingdom Visa for United States Citizens – 2026 Requirements, Fees & E-Visa Guide \| VisaApply.org` | 418 *(long)* | **YES** | **2 / 0** (`..., Article, FAQPage`) | 0 | **NO** |
| 10 | `/us-to-jp` | **200** | 0 | **YES** | `Japan Visa for United States Citizens – 2026 Requirements, Fees & E-Visa Guide \| VisaApply.org` | 400 *(long)* | **YES** | **2 / 0** (`..., Article, FAQPage`) | 0 | **NO** |
| 11 | `/gb-to-ca` | **200** | 0 | **YES** | `Canada Visa for United Kingdom Citizens – 2026 Requirements, Fees & E-Visa Guide \| VisaApply.org` | 403 *(long)* | **YES** | **2 / 0** (`..., Article, FAQPage`) | 0 | **NO** |
| 12 | `/ca-to-fr` | **200** | 0 | **YES** | `France Visa for Canada Citizens – 2026 Requirements, Fees & E-Visa Guide \| VisaApply.org` | 418 *(long)* | **YES** | **2 / 0** (`..., Article, FAQPage`) | 0 | **NO** |
| 13 | `/au-to-sg` | **200** | 0 | **YES** | `Singapore Visa for Australia Citizens – 2026 Requirements, Fees & E-Visa Guide \| VisaApply.org` | 404 *(long)* | **YES** | **2 / 0** (`..., Article, FAQPage`) | 0 | **NO** |
| 14 | `/de-to-ae` | **200** | 0 | **YES** | `United Arab Emirates Visa for Germany Citizens – 2026 Requirements, Fees & E-Visa Guide \| VisaApply.org` | 424 *(long)* | **YES** | **2 / 0** (`..., Article, FAQPage`) | 0 | **NO** |
| 15 | `/in-to-us-work` | **200** | 0 | **YES** | `United States Work Visa for India Citizens (2026 Rules & Fees) – VisaApply.org` | 333 *(long)* | **YES** | **2 / 0** (`..., Article, FAQPage`) | 0 | **NO** |
| 16 | `/in-to-ca-student` | **200** | 0 | **YES** | `Canada Student Visa for India Citizens (2026 Rules & Fees) – VisaApply.org` | 326 *(long)* | **YES** | **2 / 0** (`..., Article, FAQPage`) | 0 | **NO** |

### Observable Console / Runtime Notes Across the 16 Routes
- **Zero first-party runtime crashes (`0/16` uncaught `pageerror`, `0/16` `ERR_MODULE_NOT_FOUND`, `0/16` `x-vercel-error`).**
- **Third-party ad/affiliate console noise** observed intermittently in headless Chromium (on `/immigration/us`, `/in-to-ca-tourist`, `/tools/visa-comparison`, `/au-to-sg`):
  - `emrldco.com/entrypoint_config` blocked by third-party CORS (`No 'Access-Control-Allow-Origin' header`) followed by `config is not valid`.
  - `sentry-relay.avs.io` blocked by VisaApply's own `Content-Security-Policy` `connect-src` (expected CSP enforcement, causes console noise).
  - `googleads.g.doubleclick.net/pagead/ads` returned `HTTP 400` in headless Chromium.

---

## 3. SEO & Indexability Audit

### Indexation & Preview vs Production Separation
- **Production public pages (16/16 SSR routes + `/`):** **Zero accidental `noindex`** on any tested public HTML page.
  - All 16 SSR routes emit `X-Robots-Tag: index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` and `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`.
  - Sitemap XML files intentionally emit `X-Robots-Tag: noindex, follow` (standard SEO best practice so XML files are crawled for URLs without appearing as search results).
  - *Preview vs Production distinction:* Preview-only `noindex, nofollow, noarchive` protection is gated to non-production hosts/environments (`VERCEL_ENV !== 'production'` or `*.vercel.app`) and is **not** leaking onto `https://www.visaapply.org`.

### HTTP/HTTPS & `www` / Non-`www` Redirect Consistency
- `http://visaapply.org/` → `308` → `https://visaapply.org/` → `308` → `https://www.visaapply.org/` (`200`) — **PASS** (2-hop HSTS/canonical redirect; canonical `<link>` points to `https://www.visaapply.org/`).
- `http://www.visaapply.org/` → `308` → `https://www.visaapply.org/` (`200`) — **PASS**.
- `https://visaapply.org/` → `308` → `https://www.visaapply.org/` (`200`) — **PASS**.
- `https://visaapply.org/immigration/us` → `308` → `https://www.visaapply.org/immigration/us` (`200`) — **PASS**.
- `https://www.visaapply.org/immigration/` (trailing slash) → `200` (no redirect), canonical correctly normalizes to `https://www.visaapply.org/immigration` — **PASS WITH MINOR NOTE** (optional 308 trailing-slash redirect could further consolidate crawl budget).

### SEO Warnings Found
1. **Soft-404 on nonexistent routes (MEDIUM-HIGH):** `https://www.visaapply.org/nonexistent-route-audit-97f` returned **`HTTP 200`** with `X-Robots-Tag: index, follow, ...` and self-referencing `<link rel="canonical" href="https://www.visaapply.org/nonexistent-route-audit-97f" />` instead of `HTTP 404` + `noindex`.
2. **Generic title fallback on `/tools/visa-comparison` (LOW-MEDIUM):** Returns the generic homepage `<title>` instead of a dedicated Visa Comparison title.
3. **Overly long bilateral `<meta name="description">` values (LOW):** Bilateral routes produce 326–424 character meta descriptions due to inline disclaimers, well above the ~155–160 character search snippet target.
4. **Duplicate `Organization` entity in JSON-LD `@graph` (LOW):** Every SSR route renders 2 JSON-LD `<script>` blocks (base `index.html` + SSR injected `#ssr-route-jsonld`), each declaring an `Organization` node. Valid JSON, but consolidating into a single `@id`-linked `Organization` is cleaner.

---

## 4. Sitemap & `/robots.txt` Findings

| Check | Result | Details |
| :--- | :---: | :--- |
| **`/robots.txt`** | **PASS** | `HTTP 200`, `text/plain; charset=utf-8`. Allows `/`, `/ads.txt`, `/llms.txt`; disallows `/admin`, `/audit`, `/api/`; declares `Sitemap: https://www.visaapply.org/sitemap-index.xml`. |
| **`/sitemap-index.xml`** | **PASS** | `HTTP 200`, `application/xml; charset=utf-8`, `10,459 B`, lists **85 child sitemaps**. |
| **`/sitemap.xml`** | **PASS** | `HTTP 200`, `application/xml; charset=utf-8`, identical 85-child `<sitemapindex>`. |
| **All 85 Child Sitemaps** | **PASS** | **85/85 returned `HTTP 200`** (`0` broken child sitemaps): `sitemap-countries.xml` (242), `sitemap-categories.xml` (1,452), `sitemap-visas-1..12.xml` (11,556), `sitemap-blogs.xml` (2,673), `sitemap-routes-1..70.xml` (58,322) = **74,245 total URLs**. |
| **Duplicates / Non-Canonical Hosts / `lastmod`** | **PASS** | `0` within-shard duplicates, `0` non-`https://www.visaapply.org` URLs, `0` invalid ISO dates, `0` future `lastmod` dates (all valid `2026-11-14`). |
| **Live Sampled Sitemap URLs** | **PASS** | **255/255** sampled URLs (3 per shard across all 85 child sitemaps) returned **`HTTP 200`**, `0` redirects, `0` accidental `noindex`. |
| **Dynamic `/api/sitemap` Endpoint** | **FAIL (Secondary)** | Returns **`HTTP 500` (`Error generating sitemap`)** because `api/sitemap.ts` line 12 references CommonJS `__dirname` under `"type": "module"`. Does **not** break public `/sitemap.xml` or `/sitemap-index.xml` (which serve static files from `public/`), and `/api/` is disallowed in `robots.txt`. |

---

## 5. Security & HTTP Response Headers Audit

| Header | Homepage `/` (Static `dist/index.html`) | SSR Routes (`/immigration`, `/immigration/us`, `/in-to-ca-tourist`) | Assessment |
| :--- | :--- | :--- | :--- |
| **`Strict-Transport-Security`** | `max-age=63072000` *(missing `includeSubDomains`)* | `max-age=31536000; includeSubDomains` | Present on all; inconsistent across `/` vs SSR |
| **`Content-Security-Policy`** | **MISSING (`null`)** | Present (strict `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'self'`; uses `'unsafe-inline'` in `script-src`/`style-src` for ads/Tailwind) | **HIGH WARNING on `/`**; solid baseline on SSR routes (note `'unsafe-inline'`) |
| **`X-Content-Type-Options`** | **MISSING (`null`)** | `nosniff` | **WARNING on `/`** |
| **`Referrer-Policy`** | **MISSING (`null`)** | `strict-origin-when-cross-origin` | **WARNING on `/`** |
| **`Permissions-Policy`** | **MISSING (`null`)** | `camera=(), microphone=(), geolocation=(), payment=()` | **WARNING on `/`** |
| **`X-Frame-Options`** | **MISSING (`null`)** | `SAMEORIGIN` (paired with CSP `frame-ancestors 'self'`) | **WARNING on `/`** |
| **`Cache-Control`** | `public, max-age=0, must-revalidate` | `public, max-age=3600` | Good (static HTML revalidates; SSR caches 1h) |
| **`X-Robots-Tag`** | **MISSING (`null`)** *(HTML meta covers indexing)* | `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` | Acceptable on `/` (meta tag present); explicit on SSR |
| **`Cross-Origin-Opener-Policy` / `CORP`** | `null` | `null` | Optional hardening |
| **`X-Powered-By`** | `null` (not exposed) | `null` (not exposed) | **PASS** |

- **Root Cause Identified (Read-Only):** `vercel.json` has no global `"source": "/(.*)"` header rule, and Vercel serves `/` as static `dist/index.html` without invoking `api/render.ts` (`applySecurityHeaders()`).

---

## 6. Performance & Accessibility Audit

### Checks Run vs Not Run
- **Lighthouse CLI (`lighthouse`):** **`NOT RUN`** — Lighthouse CLI is not installed in this runtime environment.
- **Headless Chromium Live Navigation + `PerformanceObserver` (Desktop `1440x900` & Mobile `390x844`):** **RUN LIVE** on `https://www.visaapply.org`.
- **Accessibility (`axe-core` v4.14.1 — WCAG 2.0/2.1 Level A & AA):** **RUN LIVE** on 5 representative routes across both Desktop and Mobile (`10` scans).

### Live Core Web Vitals Proxy (Playwright Chromium `PerformanceObserver`)

| Route | Desktop TTFB / FCP / LCP | Desktop CLS | Mobile TTFB / FCP / LCP | Mobile CLS | `axe-core` WCAG 2.1 AA Violations (Desktop / Mobile) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `/` | `141ms` / *(not fired in cold nav)* / *(not fired)* | `0.0000` | `75ms` / `1092ms` / `1092ms` | `0.0528` | **0 / 0** (`30` passes) |
| `/immigration` | `5ms` / `644ms` / `772ms` | `0.0013` | `7ms` / `756ms` / `860ms` | `0.0001` | **0 / 0** (`28` passes) |
| `/immigration/us` | `3ms` / `692ms` / `1008ms` | `0.0019` | `3ms` / `760ms` / `888ms` | `0.0184` | **0 / 0** (`24` passes) |
| `/in-to-ca-tourist` | `4ms` / `748ms` / `1592ms` | `0.0037` | `5ms` / `784ms` / **`2508ms`** *(borderline)* | `0.0011` | **0 / 0** (`23` passes) |
| `/tools/visa-comparison` | `3ms` / `788ms` / `884ms` | `0.0006` | `6ms` / `708ms` / `776ms` | `0.0000` | **0 / 0** (`26` passes) |

### Internal Links & Bundle Size Findings
- **Internal Links Checked:** `8/8` discovered live DOM `<a href="/...">` links returned `HTTP 200` (`0` broken); `255/255` sampled sitemap URLs returned `HTTP 200`.
- **Large Bundle / Asset Warnings (`dist/assets/` & Live Transfer):**
  - `fullVisaDatabase-*.js`: **`3,315.6 KB`** raw (lazy-loaded chunk, very large)
  - `geo-map-*.js`: **`1,196.7 KB`** raw
  - `pdf-tools-*.js`: **`946.5 KB`** raw (live `pdf-tools-rYpyxfbx.js` `586 KB` decoded)
  - Main entry `index-*.js`: **`896.0 KB`** local / **`610 KB`** decoded live (`index-DE5lMZM8.js`)
  - `react-vendor-*.js`: **`664.3 KB`** raw
  - `priority2AuditData-*.js`: **`422.9 KB`** raw
  - Mobile homepage `/` cold transfer weight was **`781 KB`** (`Desktop: 495 KB`), and mobile `/in-to-ca-tourist` LCP hit **`2508ms`** (slightly above Google's 2500ms "Good" boundary).

---

## 7. Content, Catalog & Language Integrity Audit

### Static Catalog Validation (`npm run catalog:validate`)
- **Result:** **`PASS` (`17/17` checks passed, `0` errors, `2` transparent governance warnings)** across `287` files scanned.
- **Countries (`249` total):**
  - **`14` `ACTIVE`:** `AE, AU, CA, DE, ES, FR, GB, IN, IT, JP, NZ, PT, SG, US`.
  - **`228` `QUARANTINED`:** Explicitly isolated pending primary sovereign HTTPS verification (`229` quarantine records in `data/verification/quarantine.json`).
  - **`7` `UNINHABITED_TERRITORY`**.
- **Official Sources (`61` total):** **`61/61` (100%)** use valid `https://` (`officialHttpsUrl`), `0` non-HTTPS URLs.
- **Immigration Programs (`28` total):** **`28/28`** are `PUBLISHED` and `AVAILABLE_VERIFIED`, `0` missing `officialSourceRefs`, `0` broken source references, **`0` expired/closed/suspended/unsupported programs**.
- **Claims & Evidence:** `1` verified claim (`CL-1B9EC8518621`) backed by `1` official evidence record (`EV-551B510D7A95`, U.S. Department of State `https://travel.state.gov/`); zero unverified/fabricated claims in the structured catalog.
- **Editorial Articles:** `2` published (`in-to-ca-tourist.md`, `us-to-uk-tourist.md`); `3` drafts (`ga-to-fj-student.md`, `ga-to-fj-work.md`, `jp-to-ae-business.md`) cleanly excluded from public indexes/sitemaps.

### Catalog & Language Route Warnings Found
1. **Sitemap vs Quarantined Country Governance Gap (MEDIUM):** While `data/countries/` properly quarantines `228` unverified countries, live `sitemap-countries.xml` (`242` URLs) and `sitemap-routes-1..70.xml` (`58,322` URLs) continue to publish bilateral routes for quarantined destinations (e.g., `/in-to-af`, `/in-to-ad`, `/in-to-ag`).
2. **15-Language SSR Route Integrity (`en, hi, de, es, pl, fr, ar, ru, zh, ja, pt, it, nl, tr, ko`) (MEDIUM):**
   - All `15/15` `/<lang>/immigration` routes return **`HTTP 200`** with zero server errors.
   - However, all 14 non-English routes (`/hi/immigration`, `/de/immigration`, `/ar/immigration`, etc.) currently render English SSR HTML (`<html lang="en">`, no `dir="rtl"` on `/ar/`, English `<title>`, only `2` `hreflang` links) and canonicalize to `https://www.visaapply.org/immigration`. While canonicalizing unlocalized pages avoids duplicate-content penalties, localized SSR HTML + full 15-language `hreflang` + RTL `dir="rtl"` for Arabic are not active in SSR output.

---

## 8. Summary of Failures, Warnings & Checks Not Run

### Secondary Failures Observed (Outside the 16 Core SSR Routes)
1. **Other `/api/*` Serverless Functions Return `HTTP 500` on Live Production:**
   - `/api/countries` → `HTTP 500` (`FUNCTION_INVOCATION_FAILED`)
   - `/api/guides` → `HTTP 500` (`FUNCTION_INVOCATION_FAILED`)
   - `/api/faq` → `HTTP 500` (`FUNCTION_INVOCATION_FAILED`)
   - `/api/sitemap` → `HTTP 500` (`Error generating sitemap` — `__dirname` in ESM)
   - *(Cause: Phase 9.7B fixed `api/render.ts` and its transitive graph only; other `api/*.ts` handlers still use extensionless ESM imports or `__dirname`.)*

### Warnings Observed
1. **HIGH:** Homepage `/` serves static `dist/index.html` without `CSP`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or `X-Frame-Options`.
2. **MEDIUM-HIGH:** Nonexistent URLs (e.g., `/nonexistent-route-audit-97f`) return **Soft-404 (`HTTP 200` + `index, follow` + self-canonical)** instead of `HTTP 404` + `noindex`.
3. **MEDIUM:** Public sitemaps (`74,245` URLs) include bilateral pages for `228` `QUARANTINED` countries.
4. **MEDIUM:** Non-English `/<lang>/immigration` routes render English `<html lang="en">` SSR HTML without RTL (`ar`) or 15-language `hreflang` alternates.
5. **MEDIUM:** Large client JS bundles (`fullVisaDatabase` 3.3 MB, `geo-map` 1.2 MB, `pdf-tools` 946 KB, main `index` 610–896 KB); mobile `/in-to-ca-tourist` LCP measured `2508ms`.
6. **LOW-MEDIUM:** `/tools/visa-comparison` falls back to the generic homepage `<title>`; bilateral meta descriptions run 326–424 chars; duplicate `Organization` node across 2 JSON-LD blocks; third-party ad/CORS console errors (`emrldco.com`, `sentry-relay.avs.io`, `doubleclick.net`).

### Checks NOT RUN
- **Lighthouse CLI (Mobile & Desktop composite scores / INP / TBT):** **`NOT RUN`** (`lighthouse` package not installed in this environment; PerformanceObserver LCP/CLS/FCP/TTFB and `axe-core` WCAG 2.1 AA were run live instead).
- **Authenticated `/api/admin` & `/api/cron/*` probes:** **`NOT RUN`** (intentionally excluded under strict read-only & zero-credential-exposure rules).
- **Live upstream HTTP liveness sweep of all 61 external sovereign government URLs:** **`NOT RUN`** (catalog schema/HTTPS validation ran locally; external government sites not mass-crawled).

---

## 9. Prioritized Recommendations (For Future Authorized Remediation — Do Not Apply Yet)

1. **P1 (Security & API Reliability — Next Recommended Phase 9.8):**
   - Add global security headers (`"source": "/(.*)"`) in `vercel.json` so `/` and all static routes receive `CSP`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: SAMEORIGIN`, and `HSTS; includeSubDomains`.
   - Fix Node.js native ESM imports (`.js` extensions + replace `__dirname` with `import.meta.url`) across the remaining `api/*.ts` serverless endpoints (`api/countries.ts`, `api/guides.ts`, `api/faq.ts`, `api/sitemap.ts`, `api/admin.ts`, `api/cron.ts`, `api/ai-eligibility.ts`) and add a `@vercel/node` packaging test covering every `api/*.ts` entrypoint.
2. **P2 (SEO & Crawl Integrity):**
   - Return genuine `HTTP 404` + `X-Robots-Tag: noindex, nofollow` for unknown/unmatched routes in `api/render.ts` to eliminate Soft-404 index bloat.
   - Add dedicated SEO title/description metadata for `/tools/visa-comparison` and trim bilateral `<meta name="description">` strings to `145–160` characters.
   - Decide and align sitemap inclusion policy for `228` `QUARANTINED` countries so search engines prioritize verified `ACTIVE` country content.
3. **P3 (Performance, Bundles & i18n SSR):**
   - Code-split or externally serve `fullVisaDatabase`, `geo-map`, and `pdf-tools` on-demand, trim initial homepage transfer below 300 KB, and bring mobile `/in-to-ca-tourist` LCP safely under `2000ms`.
   - Implement proper localized `<html lang>`, RTL `dir="rtl"` for `ar`, and full 15-language `hreflang` output in SSR for `/<lang>/*` routes (or keep strict canonical-to-English intentionally documented).
   - Audit third-party `emrldco.com` script integration to eliminate CORS console errors.

---

## 10. Strict Read-Only & Zero-Change Statement

This Phase 9.7F audit was executed **100% READ-ONLY**. No code, configuration, catalog, or workflow files were modified; no GitHub commits, pushes, branches, PRs, or merges were created; no Vercel redeployments or promotions were triggered; no DNS, domain, database, or environment variables were touched; no secrets were exposed; and **₹0 / $0** was spent. The only file written locally is this audit report (`docs/PHASE_9_7F_PRODUCTION_INDEPENDENT_AUDIT.md`).
