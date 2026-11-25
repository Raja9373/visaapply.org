# VISAAPPLY.ORG — PHASE 9 STAGING VALIDATION REPORT
## Cloudflare Pages Staging Preparation, CLS & Accessibility Optimization, and Launch Validation

- **Report Date:** 2026-11-25
- **Phase 9 Status:** **`PARTIAL`** *(All repository-side Cloudflare Pages staging files, deployment guide, CLS optimization, automated accessibility fixes, security/data hygiene checks, and local real-browser verification are complete; live Cloudflare Pages deployment, real CDN Lighthouse audits, manual screen-reader checks, and live GitHub repository security activation remain pending explicit user authorization and external platform access.)*
- **Staging Deployment Status:** **NOT AUTHORIZED / NOT DEPLOYED** *(Per Section 3 Authorization Gate — zero Cloudflare projects created, zero builds uploaded, zero GitHub connections made, zero DNS records modified.)*
- **Staging URL:** **None created yet** *(Awaiting explicit authorization to deploy `dist/` to Cloudflare Pages Free.)*
- **Database Changes:** **NONE**
- **Production Deployment:** **NONE**
- **DNS Changes:** **NONE**
- **Final Launch Recommendation:** **`NOT READY`** *(Ready for authorized Cloudflare Pages staging deployment; NOT ready for Controlled Production Launch until the remaining external staging, CDN Lighthouse, manual screen-reader, and GitHub security activation gates are completed.)*

---

## 1. Read-Only Audit Findings (Repository & Build Baseline)

| Area Audited | Exact Repository State Observed |
| :--- | :--- |
| **Git Branch & Working Tree** | `.git` is not initialized in this build workspace (`fatal: not a git repository`). No commits were pushed and no uncommitted files were overwritten. |
| **Build Tooling & Output** | `npm run build` (`vite build`, Vite + React + Tailwind CSS + `vite-plugin-pwa`) outputs `316` static files into `dist/`. Zero server runtime required for public routes. |
| **SPA Routing & Fallback** | `dist/` intentionally omits `404.html`, enabling Cloudflare Pages native SPA fallback (`/index.html` HTTP `200` for unmatched client routes while React renders the 404 UI with `noindex`). |
| **Static Catalog & Sitemap Artifacts** | `public/catalog/` and `public/sitemaps-static/` (`56` candidate URLs) copy cleanly into `dist/`. All **89** legacy `public/sitemap*.xml` files and `public/robots.txt` remain untouched. |
| **Client Environment Variables** | `grep` across `src/` confirmed **zero** `import.meta.env.*` references — static Cloudflare Pages builds require no frontend secrets (only `NODE_VERSION=20` for the build image). |
| **Legacy Hosting Config** | `vercel.json` remains preserved untouched for historical rollback reference; Cloudflare Pages Free is the recommended commercial/AdSense-compatible static staging target. |
| **GitHub Actions Workflows** | All 4 workflows under `.github/workflows/` remain intact and locally validated (least-privilege, zero auto-merge). |

---

## 2. Cloudflare Pages Staging Configuration (Prepared — Not Deployed)

The following deployment-ready files were created and verified inside the compiled `dist/` artifact:

1. **`public/_headers` → verified in `dist/_headers`:**
   - Global security headers (`/*`): `Content-Security-Policy`, `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`, `X-Frame-Options: SAMEORIGIN`.
   - CDN caching rules: `/assets/*` (`public, max-age=31536000, immutable`), `/catalog/*` (`public, max-age=300, stale-while-revalidate=3600`), `/locales/*` (`public, max-age=3600, stale-while-revalidate=86400`), `/sitemaps-static/*` (`public, max-age=3600`), `/index.html` (`public, max-age=0, must-revalidate`).
   - Admin edge lockdown (`/admin`, `/admin/*`): `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store, private`.
2. **`public/_redirects` → verified in `dist/_redirects`:**
   - Canonical 301 self-route redirects (`/in-to-in → /immigration/in 301`, `/in-to-in-* → /immigration/in 301`), with no invalid `/* /index.html 200` loop and no `dist/404.html`.
3. **Deployment Guide Created:** **`docs/CLOUDFLARE_STAGING_DEPLOYMENT_GUIDE.md`** documenting build command (`npm run build`), output directory (`dist`), env var names only (`NODE_VERSION`), GitHub connection steps, `*.pages.dev` preview isolation (`X-Robots-Tag: noindex, nofollow` Transform Rule), optional custom staging subdomain steps, post-staging validation commands, and instant rollback instructions.

### Authorization Gate (Required Before Any Deployment Action)
Explicit owner authorization is required before executing any of the following external actions:
- Connecting the GitHub repository to Cloudflare Pages
- Creating or modifying a Cloudflare Pages project (`visaapply-staging`)
- Uploading a `dist/` build artifact
- Creating a custom staging subdomain or changing any DNS record

---

## 3. Immigration Page Layout Shift (CLS) Root-Cause Investigation & Verified Before/After

### Root Causes Identified via Real Chromium `PerformanceObserver` (`layout-shift` entries)
1. **`PageLoadingFallback` height (`src/App.tsx`):** `min-h-[50vh]` pulled `<footer>` into the viewport during `React.lazy` chunk loading and then blasted it offscreen upon hydration — responsible for **~90% of `/immigration` CLS** (`0.2367` desktop / `0.3495` mobile single-frame jump).
2. **Async `Language Coverage Disclosure` banner (`src/pages/GlobalImmigrationHubPage.tsx`):** Injected above the Coverage Metrics Banner after geo-IP resolved a non-English language, pushing all below-hero content down by `72px`.
3. **Unreserved disclaimer bar height & nav wrapping (`src/App.tsx`):** Late geo-IP bilingual fallback text expanded the top disclaimer bar by `21px` on mobile, and header nav items wrapped across languages on desktop.
4. **Initial `body` default margin (`index.html`):** Browser default `8px` body margin applied briefly before stylesheet execution.

### Safe Fixes Implemented
- `src/App.tsx`: Increased `PageLoadingFallback` from `min-h-[50vh]` to `min-h-[110vh]`; added `whitespace-nowrap` and tightened desktop nav gap (`gap-2.5 xl:gap-3.5 text-xs`) to prevent wrapping/overflow; reserved stable `min-h-[60px] sm:min-h-[32px]` on the top disclaimer bar.
- `src/pages/GlobalImmigrationHubPage.tsx`: Relocated `Language Coverage Disclosure` into the main flow below the view controls (preventing above-the-fold push) and stabilized loading skeleton dimensions (`min-h-[1000px]`, `h-[230px]` cards) plus tabular-num category count placeholders.
- `index.html`: Added minimal inline base reset `<style>html,body{margin:0;padding:0;}</style>`.

### Real-Browser Chromium CLS Before vs. After (Local Server Baseline)

| Route & Viewport | Phase 8 Before | Phase 9 After | Improvement | Target (`≤ 0.10`) |
| :--- | :---: | :---: | :---: | :---: |
| **`/immigration` — Desktop (`1280×800`)** | **0.7789** | **0.0019** | **-99.76%** | **PASS** |
| **`/immigration` — Mobile (`390×844`)** | **0.7405** | **0.0013** | **-99.82%** | **PASS** |
| **`/` Homepage — Desktop (`1280×800`)** | 0.0278 | **0.0000** | **-100.0%** | **PASS** |
| **`/` Homepage — Mobile (`390×844`)** | 0.0791 | **0.0000** | **-100.0%** | **PASS** |

> **Honest Staging Caveat:** These before/after measurements were executed in real headless Chromium against the local server (`http://127.0.0.1:3000`). They must be **re-measured against the live Cloudflare Pages staging URL** after authorized deployment before closing CDN CLS sign-off. Additionally, expanding 5-route measurement caught elevated CLS on **`/immigration/us`** (`0.1060` desktop / `0.5384` mobile) from its country-detail skeleton height, which is logged as a concrete polish item below.

---

## 4. Real CDN Performance & Lighthouse Results

- **Live Cloudflare CDN Staging Measurements:** **PENDING** *(Not yet executed — staging deployment has not been authorized.)*
- **Lighthouse Scores (Performance, Accessibility, Best Practices, SEO, INP):** **UNAVAILABLE** in this build container (`lighthouse` CLI is not installed, and no live staging URL exists yet). **Zero Lighthouse scores are invented or estimated.**

### Local Real-Browser Chromium 5-Route Baseline (Non-CDN Reference Only)

| Route | Desktop TTFB / FCP / LCP / CLS | Mobile TTFB / FCP / LCP / CLS |
| :--- | :---: | :---: |
| `/` (Homepage) | 14 ms / 212 ms / 212 ms / **0.0000** | 71 ms / 188 ms / 188 ms / **0.0000** |
| `/immigration` (Global Hub) | 12 ms / 1032 ms / 2032 ms / **0.0019** | 8 ms / 300 ms / 300 ms / **0.0013** |
| `/immigration/us` (Country Detail) | 79 ms / 304 ms / 304 ms / **0.1060** | 66 ms / 192 ms / 192 ms / **0.5384** |
| `/tools/visa-comparison` | 19 ms / 200 ms / 200 ms / **0.0027** | 15 ms / 108 ms / 108 ms / **0.0021** |
| `/in-to-ca-tourist` (Published Blog) | 60 ms / 200 ms / 200 ms / **0.0034** | 11 ms / 180 ms / 180 ms / **0.0026** |

---

## 5. Accessibility Final Validation & Screen-Reader Status

### Resolution of the 3 Phase 8 `axe-core` `incomplete` Items
1. **`aria-valid-attr-value` (Resolved):** Updated the desktop `Services` button (`src/App.tsx`) to pass `aria-controls={servicesDropdownOpen ? 'desktop-services-menu' : undefined}` so it never references an unmounted DOM node while collapsed.
2. **`label-content-name-mismatch` (Resolved):** Updated `#visa-chatbot-btn` (`src/components/VisaChatbot.tsx`) to use `<span className="sr-only">Toggle 249-Country Visa Assistant</span>` + conditional `aria-controls={isOpen ? 'visa-chatbot-window' : undefined}`.
3. **`color-contrast` (Audited & Hardened):**
   - Fixing desktop nav wrapping unmasked **1 genuine contrast violation** on the header language `<select>` (`bg-transparent text-white` overflowing onto `#f9fbfc` at `1.03:1`). Fixed in `src/App.tsx` by tightening desktop nav spacing (`gap-2.5 xl:gap-3.5 text-xs`) and setting an explicit solid dark navy background (`bg-[#072963] text-white`, **14.2:1 WCAG AAA contrast**).
   - Remaining `1` `incomplete` across all 5 routes is strictly `axe-core`'s automated gradient limitation on `#FFFFFF` (`10.1:1`) and `#DBEAFE` (`8.3:1`) text rendered over the `#0B3D91` → `#072a68` hero gradient (both exceed WCAG 2.2 AA `4.5:1` and AAA `7.0:1`).

### Real-Browser `axe-core` WCAG 2.2 AA Results (All 5 Routes)

| Route | Automated Passes | Violations | Incomplete |
| :--- | :---: | :---: | :---: |
| `/` (Homepage) | **31** | **0** | 1 (hero gradient only) |
| `/immigration` | **29** | **0** | 1 (hero gradient only) |
| `/immigration/us` | **23** | **0** | 1 (hero gradient only) |
| `/tools/visa-comparison` | **25** | **0** | 1 (hero gradient only) |
| `/in-to-ca-tourist` | **24** | **0** | 1 (hero gradient only) |

### Manual Screen-Reader Testing Status (NVDA / VoiceOver / TalkBack)
- **Status:** **PENDING.** Manual assistive-technology testing with NVDA (Windows), VoiceOver (macOS/iOS), and TalkBack (Android) cannot be executed inside this headless Linux container.
- **No formal WCAG 2.2 AA certification is claimed.** Manual verification of navigation landmarks, category cards, search/filters, form controls, language switching, Arabic RTL reading order, and error/empty states must be completed on the live staging URL before Controlled Launch.

---

## 6. GitHub Security Activation Status (Phase 6.1 External Checklist)

Because `.git` is not connected to a remote GitHub repository and no GitHub credentials/API access exist in this container, **live GitHub security enforcement is NOT active/verified externally**:

| Phase 6.1 External Requirement | Local Repository Readiness | Live GitHub Status |
| :--- | :---: | :---: |
| Five organization teams exist & memberships verified | Team slugs defined in `.github/CODEOWNERS` & `role-policy.json` | **PENDING** |
| Organization-wide 2FA requirement active | Documented in `docs/GITHUB_SECURITY_CONFIGURATION_GUIDE.md` | **PENDING** |
| `.github/CODEOWNERS` resolves cleanly on GitHub | `27` rules locally validated (`npm run editorial:verify-github-config`) | **PENDING** |
| `main` branch protection / ruleset active | Documented | **PENDING** |
| Required status check (`Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build`) enforced | Exact job name verified locally in `.github/workflows/editorial-pr-validation.yml` | **PENDING** |
| Direct pushes & force pushes restricted | Documented | **PENDING** |
| Documentation-only test PR passes required checks (without merging) | Procedure documented in Phase 6.1 guide | **PENDING** |

---

## 7. Functional Testing Results (Local Real-Browser vs. Live Staging)

- **Live Staging URL Functional Tests:** **PENDING** *(Awaiting authorized staging deployment to run `BASE_URL=https://<staging-url> npm run test:e2e`.)*
- **Local Real-Browser Playwright Chromium Suite (`npm run test:e2e`):** **11/11 PASSED (0 failed)** — verified all 6 category cards (pointer + keyboard-only), country details (`/immigration/us`, `/immigration/in`), visa program detail (`/visa/us/us-h1b-specialty`), language switching + Arabic RTL, search/empty-state/reset, blog listing + `/in-to-ca-tourist`, visa comparison, verification official HTTPS links (`noopener`), 404 `noindex`, admin redirect + `noindex`, and mobile nav toggle.
- **Full Automated Node Regression Suite (`node --test --import tsx tests/*.test.ts`):** **165/165 PASSED (0 failed, 0 skipped)** — includes `4/4` new Phase 9 Cloudflare staging readiness tests in `tests/phase9_cloudflare_staging_readiness.test.ts`.
- **TypeScript & Vite Build:** `tsc --noEmit` (**PASS**, 0 errors) and `vite build` (**PASS**, `316` files built cleanly into `dist/`).

---

## 8. Final Security & Data Integrity Verification (`dist/` & Protected Files)

| Check | Result | Evidence |
| :--- | :---: | :--- |
| Public secrets or PII in `dist/` (`316` files) & `public/catalog/` | **PASS (`0` found)** | Verified zero API keys, PEM keys, DB URIs, or private user emails across all built assets |
| Security headers in `dist/_headers` | **PASS** | CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, admin `X-Robots-Tag: noindex, nofollow, noarchive` verified |
| Mixed content (`http://` asset refs in `dist/index.html`) | **PASS (`0` found)** | All scripts, styles, icons, and fonts use relative or `https://` URLs |
| Insecure external links (`target="_blank"` without `noopener`) | **PASS (`0` found)** | Re-verified in automated regression + Playwright `/verification` test |
| Public admin pages & noindex protection | **PASS** | `/admin/*` protected by `dist/_headers` (`noindex, nofollow, noarchive`, `no-store`) and React login gate + `<meta name="robots" content="noindex">` |
| Quarantined or draft records in public output | **PASS (`0` leaked)** | `228` quarantined countries transparently marked; `0` quarantined/expired programs and `0` drafts (`3` excluded) in public indexes/sitemaps |
| Database or `.env` files exposed in `public/` or `dist/` | **PASS (`0` found)** | Verified zero `.db`, `.db-wal`, `.db-shm`, `.sqlite`, or `.env*` files under `public/` or `dist/` |
| Production sitemaps & protected SQLite/backup integrity | **PASS** | All **89** legacy `public/sitemap*.xml` files and `public/robots.txt` untouched; all 4 SQLite & Phase B.3 backup SHA-256 checksums byte-for-byte identical |

---

## 9. Remaining Launch Blockers (Must Clear Before Controlled Launch)

1. **Authorized Cloudflare Pages Staging Deployment:** Obtain explicit owner authorization, connect GitHub to Cloudflare Pages Free (`visaapply-staging`), deploy `dist/`, and enable staging `X-Robots-Tag: noindex, nofollow` Transform Rule.
2. **Real CDN Performance & Lighthouse Verification:** Run Lighthouse (Desktop + Mobile) and `BASE_URL=https://<staging-url> npm run test:e2e` against the live staging URL across all 5 routes (`/`, `/immigration`, `/immigration/us`, `/tools/visa-comparison`, `/in-to-ca-tourist`).
3. **Country Detail Mobile CLS Polish:** Reduce `/immigration/us` mobile CLS (`0.5384` local baseline) to `≤ 0.10` before Controlled Launch.
4. **Manual Screen-Reader Testing:** Execute manual NVDA and/or VoiceOver checks across landmarks, category cards, filters, forms, language switcher, Arabic RTL, and empty/error states on staging.
5. **Live GitHub Security Activation (Phase 6.1):** Create the 5 GitHub Organization teams, enforce 2FA, verify CODEOWNERS on GitHub, activate `main` branch protection + required status check, and verify a documentation-only test PR (without merging).
6. **Transitive Dependency Maintenance (Recommended):** Upgrade `@vercel/node`, `vite-plugin-pwa`, and `express` transitive advisories flagged by `bun audit` (`24` dev/server advisories).

---

## 10. Rollback Procedure

- **Cloudflare Pages Staging Rollback:** `Cloudflare Dashboard → Workers & Pages → visaapply-staging → Deployments → ... → Rollback to this deployment` (< 30 seconds).
- **Repository Rollback:** Revert any Phase 9 static file changes (`public/_headers`, `public/_redirects`, CLS/ARIA fixes) via standard Git PR revert.
- **Production Safety:** Production hosting, live DNS, all **89** legacy sitemaps, `public/robots.txt`, SQLite database files, and Phase B.3 verified backups were **not modified** during Phase 9.
