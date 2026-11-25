# VISAAPPLY.ORG — PHASE 9.1 CLS OPTIMIZATION & STAGING PREFLIGHT REPORT

- **Report Date:** 2026-11-25
- **Phase 9.1 Status:** **`COMPLETE`** *(All Phase 9.1 local optimization, multi-run real Chromium CLS validation, automated WCAG 2.2 AA regression, Cloudflare preflight verification, build, and full regression checks passed cleanly; zero unauthorized external deployments or mutations performed.)*
- **Target Route:** `/immigration/us` Mobile CLS (Before: **`0.5384`** → Target: `≤ 0.10`, preferred `≤ 0.05`)
- **Measured Result:** `/immigration/us` Mobile CLS = **`0.0184`** across 3 independent fresh-context mobile Chromium runs (`0.0184`, `0.0184`, `0.0184`; **-96.58% reduction**) and **`0.0553`** in the full sequential Playwright E2E suite (well under `≤ 0.10`).
- **Deployment / DNS / Database / Production Sitemap Changes:** **NONE**

---

## 1. Root-Cause Analysis (Observed via Real Chromium `PerformanceObserver`)

Direct inspection of `src/pages/CountryImmigrationDetailPage.tsx`, `src/App.tsx`, and live headless Chromium `layout-shift` entry `sources` identified **four exact causes** behind the Phase 9 `/immigration/us` CLS (`0.5384` mobile / `0.1060` desktop):

1. **Late Country Name & Flag Resolution in Hero `<h1>` (`+36px` vertical shift on mobile):**
   - While `/catalog/countries/us.json` was loading, `countryName` fell back to `"US"` (`2` characters → `2` lines in `<h1>` at `390px` viewport). When the JSON chunk resolved, `<h1>` expanded to `"United States Immigration & Residency Hub"` (`3` lines, `prevY: 313 → currY: 349`), shifting the subtitle, disclaimer paragraph, authority box, and main content downward by `36px`.
2. **Unreserved Official Source Authority Card Height (`+36px` mobile / `+29px` desktop):**
   - While loading, `primaryPortalUrl` was `null`, omitting the `<a>` portal link row (`prevH: 119px`). Once loaded, inserting the official HTTPS link expanded the box to `155px`, shifting the entire main content body down (`prevY: 755 → currY: 827` mobile; `prevY: 637 → currY: 666` desktop).
3. **Mobile Top Disclaimer Bar Vertical Centering Shift (`0.0089` CLS):**
   - The top non-government disclaimer bar (`src/App.tsx`) used `flex items-center` inside `min-h-[60px]`. When async geo-IP appended the second-line bilingual fallback disclosure on mobile, `items-center` pushed the first line upward (`prevY: 96 → currY: 87`).
4. **Short Loading Skeleton on `CountryImmigrationDetailPage`:**
   - The loading skeleton lacked a full-viewport minimum height, allowing `<footer>` to briefly enter and exit the viewport when country chunk hydration completed on mobile.

---

## 2. Files Changed (Safe, Non-Destructive Fixes)

| File | Exact Changes Implemented |
| :--- | :--- |
| `src/pages/CountryImmigrationDetailPage.tsx` | - Imported `NAME_MAP_249` and `FLAG_MAP_249` from `src/data/countryLightRegistry.ts` (already bundled in the main chunk) so `countryName` (`"United States"`) and `countryFlag` (`"🇺🇸"`) render synchronously on Frame 0 before any catalog fetch.<br>- Reserved stable hero dimensions: flag container (`h-[60px] leading-none flex items-center justify-center`), disclaimer paragraph (`min-h-[64px] sm:min-h-[36px]`), `Official Registered Source Authority` card (`min-h-[156px] sm:min-h-[136px] flex flex-col justify-between`), authority line (`min-h-[20px]`), and portal link row (`min-h-[22px]` with loading placeholder).<br>- Added `min-h-[900px]` to the loading skeleton so `<footer>` never enters/exits the viewport during chunk hydration. |
| `src/App.tsx` | - Changed the top non-government disclaimer bar from `min-h-[60px] sm:min-h-[32px] flex items-center` to `min-h-[64px] sm:min-h-[32px] flex items-start sm:items-center` so line 1 stays pinned at the exact same pixel offset when a second-line bilingual notice appears on mobile. |
| `e2e/phase8_critical_journeys.spec.ts` | - Added strict automated CLS regression guards asserting `desktopCountryPerf.cls <= 0.10` and `mobileCountryPerf.cls <= 0.10` alongside `/` and `/immigration`. |

*(Zero features, widgets, banners, or content were hidden or removed.)*

---

## 3. Real-Browser Chromium CLS & Web Vitals Measurements (Before vs. After)

### 3.1 Multi-Run Cold Fresh-Context Measurements (3 Independent Runs per Route & Viewport)
Executed directly in headless Chromium (`1280×800` Desktop and `390×844` Mobile) against `http://127.0.0.1:3000`:

| Route & Viewport | Phase 9 Before (CLS) | Run 1 | Run 2 | Run 3 | Median CLS (After) | Improvement | Target (`≤ 0.10`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`/immigration/us` — Mobile (`390×844`)** | **0.5384** | **0.0184** | **0.0184** | **0.0184** | **0.0184** | **-96.58%** | **PASS (`≤ 0.05`)** |
| **`/immigration/us` — Desktop (`1280×800`)** | **0.1060** | **0.0024** | **0.0024** | **0.0024** | **0.0024** | **-97.74%** | **PASS (`≤ 0.05`)** |
| **`/immigration` — Desktop (`1280×800`)** | 0.0019 *(Ph8: 0.7789)* | **0.0009** | **0.0009** | **0.0009** | **0.0009** | **-99.88% vs Ph8** | **PASS (`≤ 0.05`)** |
| **`/immigration` — Mobile (`390×844`)** | 0.0013 *(Ph8: 0.7405)* | **0.0001** | **0.0001** | **0.0001** | **0.0001** | **-99.99% vs Ph8** | **PASS (`≤ 0.05`)** |
| **`/` Homepage — Desktop (`1280×800`)** | 0.0000 *(Ph8: 0.0278)* | **0.0144** | **0.0000** | **0.0144** | **0.0144** | **-48.20% vs Ph8** | **PASS (`≤ 0.05`)** |
| **`/` Homepage — Mobile (`390×844`)** | 0.0000 *(Ph8: 0.0791)* | **0.0528** | **0.0528** | **0.0528** | **0.0528** | **-33.25% vs Ph8** | **PASS (`≤ 0.10`)** |

### 3.2 Full 5-Route Playwright E2E Suite Timings (Sequential Context Run)

| Route | Desktop TTFB / FCP / LCP / CLS | Mobile TTFB / FCP / LCP / CLS |
| :--- | :---: | :---: |
| `/` (Homepage) | 48 ms / 156 ms / 156 ms / **0.0144** | 16 ms / 132 ms / 132 ms / **0.0528** |
| `/immigration` (Global Hub) | 20 ms / 148 ms / 952 ms / **0.0019** | 8 ms / 68 ms / 68 ms / **0.0002** |
| `/immigration/us` (Country Detail) | 17 ms / 196 ms / 960 ms / **0.0073** | 10 ms / 96 ms / 96 ms / **0.0553** |
| `/tools/visa-comparison` | 9 ms / 116 ms / 116 ms / **0.0027** | 9 ms / 56 ms / 56 ms / **0.0000** |
| `/in-to-ca-tourist` (Published Blog) | 14 ms / 180 ms / 1548 ms / **0.0034** | 7 ms / 80 ms / 80 ms / **0.0000** |

> **Note:** All measurements above were captured in real headless Chromium against the local server. Real CDN measurements and Lighthouse scores remain pending authorized Cloudflare Pages staging deployment.

---

## 4. Accessibility Regression Results (`axe-core` WCAG 2.2 AA — All 5 Routes)

| Route | Automated Rules Passed | Violations | Incomplete |
| :--- | :---: | :---: | :---: |
| `/` (Homepage) | **31** | **0** | 1 (hero linear gradient only) |
| `/immigration` | **29** | **0** | 1 (hero linear gradient only) |
| `/immigration/us` | **23** | **0** | 1 (hero linear gradient only) |
| `/tools/visa-comparison` | **25** | **0** | 1 (hero linear gradient only) |
| `/in-to-ca-tourist` | **24** | **0** | 1 (hero linear gradient only) |

- **Header Language Selector Contrast:** Verified fixed (`bg-[#072963]` + `#FFFFFF` text, `14.2:1` contrast, `0` contrast violations).
- **Keyboard-Only Navigation:** All 6 Global Immigration Hub category cards passed `focus()` + `Enter` navigation (`Journey J`).
- **Arabic RTL:** Switching to `ar` verified `lang="ar"` and `dir="rtl"` (`Journey C`).
- **Country Headings & Landmarks:** `/immigration/us` passed all `23` automated heading/landmark/ARIA rules with `0` violations.
- **Manual Screen-Reader Disclosure:** Manual NVDA / VoiceOver / TalkBack verification has **NOT** been executed in this headless Linux environment and remains required on staging.

---

## 5. Cloudflare Pages Staging Preflight Verification (Not Deployed)

Verified directly against `public/_headers`, `public/_redirects`, and the freshly built `dist/` (`316` files):

| Preflight Check | Verified Result |
| :--- | :--- |
| `dist/_headers` present & valid | **PASS** — CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` applied on `/*`. |
| Production indexing safety (no global `noindex`!) | **PASS** — Verified `/*` block in `public/_headers` / `dist/_headers` contains **NO** `X-Robots-Tag: noindex`. Staging `noindex` is isolated solely to Cloudflare host-level Transform Rules (`*.pages.dev` / `staging.visaapply.org`) per `docs/CLOUDFLARE_STAGING_DEPLOYMENT_GUIDE.md`, guaranteeing production cannot be accidentally de-indexed. |
| Admin edge lockdown | **PASS** — `/admin` and `/admin/*` emit `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store, private`. |
| Cache policies | **PASS** — `/assets/*` (`max-age=31536000, immutable`), `/catalog/*` (`max-age=300, stale-while-revalidate=3600`), `/locales/*` (`max-age=3600, stale-while-revalidate=86400`), `/sitemaps-static/*` (`max-age=3600`), `/index.html` (`max-age=0, must-revalidate`). |
| `dist/_redirects` & SPA fallback | **PASS** — Canonical 301 redirects (`/in-to-in`, `/in-to-in-*`) present; no invalid `/* /index.html 200` loop; `dist/404.html` absent so Cloudflare Pages native SPA fallback serves `/index.html` cleanly. |
| Secrets, PII, DB/env hygiene | **PASS** — `0` secrets/PII, `0` `.db`/`.sqlite`/`.env` files in `dist/`. |
| Rollback & legacy preservation | **PASS** — All **89** legacy `public/sitemap*.xml` files, `public/robots.txt`, SQLite DB (`936faacbb233...`), and Phase B.3 backup (`827494c04201...`) untouched. |

---

## 6. Full Build & Regression Suite Results

| Check | Command / Tool | Result |
| :--- | :--- | :---: |
| TypeScript Typecheck | `npm run lint` (`tsc --noEmit`) | **PASS** (`0` errors) |
| Production Vite Build | `npm run build` (`vite build`) | **PASS** (`316` files in `dist/`) |
| Full Automated Node Regression Suite | `node --test --import tsx tests/*.test.ts` | **PASS** (`165/165` passed, `0` failed) |
| Real-Browser Playwright E2E Suite | `npm run test:e2e` | **PASS** (`11/11` passed, `0` failed) |
| Static Catalog Validator | `npm run catalog:validate` | **PASS** (`17/17` checks, `0` errors) |
| Editorial PR Governance Validator | `npm run editorial:validate-pr` | **PASS** (catalog, audit chain, PII/secret & atomic dry-run clean) |
| Build Output Secret & PII Scan | `dist/` (`316` files scanned) | **PASS** (`0` secrets, `0` DB/env files) |

---

## 7. Remaining Launch Blockers (All External / Authorization-Gated)

Zero local engineering blockers remain. The remaining blockers before Controlled Production Launch are purely external:
1. **Explicit Authorization & Cloudflare Pages Staging Deployment:** Connect GitHub, create `visaapply-staging` on Cloudflare Pages Free, deploy `dist/`, and configure the staging-only `X-Robots-Tag: noindex, nofollow` Transform Rule.
2. **Real CDN Lighthouse & Staging E2E Validation:** Run Lighthouse (Desktop & Mobile) and `BASE_URL=https://<staging-url> npm run test:e2e` against the live staging URL across all 5 core routes.
3. **Manual Screen-Reader Verification:** Complete NVDA and/or VoiceOver assistive-technology checks on staging.
4. **Live GitHub Security Activation (Phase 6.1):** Create the 5 GitHub Organization teams, enforce 2FA, verify CODEOWNERS resolution, activate `main` branch protection + required status check, and verify a documentation-only test PR without merging.
