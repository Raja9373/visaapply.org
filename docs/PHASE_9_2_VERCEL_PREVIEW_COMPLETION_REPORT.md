# VISAAPPLY.ORG — PHASE 9.2 COMPLETION REPORT
## Vercel Preview / Staging Environment & Safe Production Deployment Workflow

- **Report Date:** 2026-11-25
- **Phase 9.2 Status:** **`COMPLETE`** *(All repository-side Vercel Preview configuration, dual-layer staging-only `noindex`, environment variable audit, reusable Playwright Preview suite, official Vercel commercial-use plan verification, build/regression validation, and deployment guide are complete. Zero external Vercel/GitHub/DNS/production mutations were performed.)*
- **Preserved Production Architecture:** `Google AI Studio → GitHub (main) → Vercel Production → https://www.visaapply.org`
- **Cloudflare Migration:** **NONE** *(Existing Vercel architecture retained as requested; no Cloudflare runtime dependencies added.)*
- **Production Deployment / Preview Deployment / DNS Changes / Database Changes:** **NONE**

---

## 1. Initial Read-Only Audit Findings (Local vs. External Visibility)

| Audit Question | Verified Finding | Source / Status |
| :--- | :--- | :--- |
| 1. Is Vercel connected to the GitHub repository? | **Not verifiable from local workspace** (no `.git`, no `.vercel/`, no Vercel API token). | **Pending manual dashboard verification** |
| 2. Is Production Branch configured as `main`? | **Not verifiable from local workspace.** Documented in `docs/VERCEL_PREVIEW_STAGING_GUIDE.md` for operator check under `Settings → Git`. | **Pending manual dashboard verification** |
| 3. Are Preview Deployments enabled? | **Not verifiable from local workspace.** Documented for operator verification under `Settings → Git`. | **Pending manual dashboard verification** |
| 4. Does the project use Vercel Hobby or Pro? | **Not verifiable from local workspace.** Official Vercel commercial/AdSense terms verified independently (Section 8 below). | **Pending operator billing check** |
| 5. Are current build settings compatible with Preview Deployments? | **Yes (locally verified).** `vite build` → `dist/`, `vercel.json` hosts `api/render.ts` (`includeFiles: "dist/index.html"`), and apex redirect (`visaapply.org → www.visaapply.org`) is strictly host-scoped so `*.vercel.app` previews load directly without redirecting to production. | **Locally verified** |
| 6. Could existing config accidentally expose staging pages to search engines? | **YES — GAP FOUND & FIXED IN PHASE 9.2.** Prior to Phase 9.2, `api/render.ts` ignored `VERCEL_ENV === 'preview'` and emitted `X-Robots-Tag: index, follow...` + `<meta name="robots" content="index, follow...">` on Preview deployments, and client-side `seoMetadataManager.ts` did not enforce `noindex` on `*.vercel.app` hosts. Both layers are now fixed. | **Locally implemented & unit-tested** |

---

## 2. Preserved Deployment Architecture & Minimal Vercel Configuration Changes

- **Preserved Workflow:** `Google AI Studio → GitHub (main) → Vercel Production → VisaApply.org Live`, extended cleanly with `staging` / feature branches → `Vercel Preview (*.vercel.app)` → automated Playwright/Lighthouse validation → PR approval → merge to `main`.
- **Minimal `vercel.json` Updates (Zero Breaking Production Changes):**
  - Preserved all existing `crons`, `functions` (`api/render.ts`), `redirects` (host-scoped apex + self-route 301s), legacy `sitemap*.xml` headers, and `/api/render?path=/$1` SPA catch-all rewrite.
  - Added static catalog & candidate sitemap CDN headers (`/catalog/(.*)` JSON `max-age=300, stale-while-revalidate=3600`, `/sitemaps-static/(.*)` XML `max-age=3600`, `X-Content-Type-Options: nosniff`) and explicit passthrough rewrites for `/catalog/*`, `/locales/*`, and `/sitemaps-static/*`.
  - Confirmed `vercel.json` contains **zero** global `noindex` directives.

---

## 3. GitHub Branch Strategy & Staging-Only SEO Protection

- **Branch Strategy (Documented in `docs/VERCEL_PREVIEW_STAGING_GUIDE.md` — No Branches Created/Pushed Yet):**
  - `main` → Vercel Production (`https://www.visaapply.org`)
  - `staging` → Dedicated integration & Vercel Preview URL (`*.vercel.app`)
  - Optional `feat/*` / `fix/*` → Short-lived task branches targeting `staging` PRs first
- **Dual-Layer Staging-Only `noindex` Implementation:**
  1. **Server Layer (`api/render.ts`):** Added `isVercelPreviewDeployment(req, env)` detecting `VERCEL_ENV === 'preview'`, `*.vercel.app`, and `staging.visaapply.org` / `preview.visaapply.org` (never `www.visaapply.org`, `visaapply.org`, or `localhost`). On Preview deployments ONLY, emits:
     - `X-Robots-Tag: noindex, nofollow, noarchive`
     - `<meta name="robots" content="noindex, nofollow, noarchive" />` (plus `googlebot` and `bingbot`)
     - `Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0`
     - Preserves production `<link rel="canonical" href="https://www.visaapply.org/..." />`
  2. **Client Hydration Layer (`src/utils/seoMetadataManager.ts`):** Added `isPreviewHostname()` so SPA route changes on `*.vercel.app` or `staging.visaapply.org` preserve `noindex, nofollow, noarchive` without affecting production indexability.
  3. **Production Sitemap & `robots.txt` Safety:** All `89` legacy `public/sitemap*.xml` files, `6` candidate `public/sitemaps-static/*.xml` files, and `public/robots.txt` remain untouched with **zero** `vercel.app` or `staging.` URLs.

---

## 4. Environment Variable Isolation Summary

Full `process.env.*` inventory (27 server-side variables across `api/`, `server.ts`, `src/`, `scripts/`; **0** required client-side `VITE_*` variables) is documented in `docs/VERCEL_PREVIEW_STAGING_GUIDE.md` (Section 4) with **names only and zero secret values**:
- **Zero-DB Public Frontend:** Requires zero database or secret environment variables to build or serve static catalog routes in Preview.
- **Production-Only Secrets (Never Scope to Preview):** `CRON_SECRET`, `RESEND_API_KEY`, `ADMIN_ALERT_EMAIL`, `UPSTASH_REDIS_REST_*`, Production `ADMIN_PASSWORD`, Production `ADMIN_SESSION_SECRET`, and any legacy Postgres/Neon URLs.
- **Browser Safety:** Verified `0` `import.meta.env.VITE_*` secrets in `src/` and `0` secrets/PII in `dist/`.

---

## 5. Official Vercel Plan & Commercial-Use Verification

Verified directly against Vercel's official Terms of Service and Fair Use Guidelines:
- **Vercel Hobby (Free):** Strictly limited to **personal, non-commercial use**. Running **Google AdSense, display ads, sponsored placements, or affiliate links** (such as Travelpayouts) is classified as commercial monetization and is **prohibited on Vercel Hobby**. Hobby also enforces hard monthly usage caps (e.g., 100 GB Fast Data Transfer, 1M function invocations).
- **Compliant Paths (Owner Decision Required — No Migration Performed):**
  - **Recommended to preserve current workflow:** Confirm/upgrade to **Vercel Pro** (**$20/month** per seat, includes $20/month usage credit + pay-as-you-go scaling), which explicitly permits commercial operations, AdSense, and affiliate links while keeping `Google AI Studio → GitHub → Vercel → VisaApply.org` unchanged.
  - **Zero-cost alternative (only if explicitly authorized later):** Cloudflare Pages Free permits commercial/AdSense/affiliate sites (guide retained in `docs/CLOUDFLARE_STAGING_DEPLOYMENT_GUIDE.md`).

---

## 6. Files Created or Modified in Phase 9.2

| File | Action | Purpose |
| :--- | :---: | :--- |
| `api/render.ts` | Modified | Added `isVercelPreviewDeployment()` + staging-only `X-Robots-Tag` & HTML `noindex, nofollow, noarchive` + `no-store` cache policy on Preview |
| `src/utils/seoMetadataManager.ts` | Modified | Added `isPreviewHostname()` client-side guard so SPA hydration on `*.vercel.app` / `staging.*` preserves `noindex` |
| `vercel.json` | Modified | Added `/catalog/(.*)` and `/sitemaps-static/(.*)` cache/content-type headers and passthrough rewrites while preserving all existing production config |
| `playwright.config.ts` | Modified | Added `PREVIEW_URL` / `BASE_URL` env support for running tests against any Vercel Preview URL |
| `package.json` | Modified | Added `"test:e2e:preview": "playwright test e2e/phase9_2_preview_staging.spec.ts"` |
| `e2e/phase9_2_preview_staging.spec.ts` | Created | Reusable Preview URL E2E suite (JS errors, critical requests, mixed content, secrets, robots/canonical, 6 categories, refresh/Back/Forward, RTL, 404, admin, `/immigration/us` CLS) |
| `tests/phase9_2_vercel_preview_workflow.test.ts` | Created | 5 unit/integration tests verifying `api/render.ts` preview `noindex` vs production `index`, `isPreviewHostname`, `vercel.json`, sitemap hygiene, and guide completeness |
| `docs/VERCEL_PREVIEW_STAGING_GUIDE.md` | Created | Complete Vercel Preview & Safe Production Deployment Guide (branching, env table, `noindex`, plan terms, Playwright + Lighthouse commands, rollback) |
| `docs/PHASE_9_2_VERCEL_PREVIEW_COMPLETION_REPORT.md` | Created | This Phase 9.2 completion report |

---

## 7. Build, Automated Test & Verification Results

| Check | Scope | Result |
| :--- | :--- | :---: |
| TypeScript Typecheck (`tsc --noEmit`) | Entire repo including `api/render.ts` | **PASS** (`0` errors) |
| Production Build (`vite build`) | `dist/` production bundle | **PASS** |
| Full Automated Node Regression Suite (`node --test --import tsx tests/*.test.ts`) | All unit & integration suites (incl. 5 new Phase 9.2 tests) | **PASS** (`170/170` passed, `0` failed) |
| Static Catalog Validation (`npm run catalog:validate`) | `287` data files, `17/17` checks | **PASS** (`0` errors) |
| Editorial PR Validation (`npm run editorial:validate-pr`) | Governance, audit chain, PII/secret & atomic dry-run | **PASS** |
| Reusable Playwright Preview Suite (`npm run test:e2e:preview`) | Executed locally in real headless Chromium (`4/4` tests; 5-route Desktop & Mobile CWV measured: `/immigration/us` CLS = `0.0024` desktop / `0.0184` mobile, `/` CLS = `0.0144` / `0.0528`, `/immigration` CLS = `0.0009` / `0.0001`, `/tools/visa-comparison` CLS = `0.0007` / `0`, `/in-to-ca-tourist` CLS = `0.0007` / `0`; `0` JS errors; `0` mixed content; `0` secrets) | **PASS (Local)** *(Live Preview URL run pending Phase 9.3)* |
| Vercel Preview `noindex` vs. Production `index` Proof | Unit-tested directly against `api/render.ts` handler & `seoMetadataManager.ts` | **PASS (Local)** *(Live Preview header curl pending Phase 9.3)* |
| Secret, PII & Sitemap Hygiene Scan | `dist/` + `89` legacy & `6` candidate sitemaps | **PASS** (`0` secrets, `0` staging URLs in sitemaps, protected SQLite/backups untouched) |

---

## 8. Clear Boundary: Locally Implemented vs. Externally Verified vs. Pending

- **Locally Implemented & Verified:** Dual-layer Preview `noindex` (`api/render.ts` + `seoMetadataManager.ts`), minimal `vercel.json` catalog headers, `PREVIEW_URL`-driven Playwright suite (`npm run test:e2e:preview`), 5 automated verification tests (`170/170` total passing), complete env-isolation audit, official Vercel Hobby vs Pro plan verification, and `docs/VERCEL_PREVIEW_STAGING_GUIDE.md`.
- **Externally Verified:** **NONE.** (No live Vercel account, GitHub remote, Preview URL, or live Lighthouse CDN check has been accessed from this workspace.)
- **Pending Manual Actions / Remaining Blockers (Phase 9.3):**
  1. Confirm Vercel billing plan (`Vercel Pro` required for compliant commercial/AdSense/affiliate production traffic).
  2. Verify Vercel Dashboard `Settings → Git` (connected GitHub repo, Production Branch = `main`, Preview Deployments enabled) and scope production-only secrets strictly to Production (`Settings → Environment Variables`).
  3. Complete Phase 6.1 GitHub security activation (5 org teams, 2FA, CODEOWNERS, `main` branch protection + required status check).
  4. Authorize creating/pushing the `staging` branch to GitHub to generate the first live Vercel Preview URL.
  5. Execute `PREVIEW_URL=https://<preview>.vercel.app npm run test:e2e:preview`, live `curl -sI` Preview `noindex` check, real CDN Lighthouse Desktop/Mobile audits across all 5 routes (focusing on `/immigration/us` CLS), and manual NVDA/VoiceOver screen-reader verification on the live Preview URL.

---

## 9. Rollback Instructions

- **Repository Rollback:** Revert Phase 9.2 commits via standard Git PR revert; `vercel.json` retains 100% backward compatibility with all prior production routes.
- **Vercel Production Rollback:** `Vercel Dashboard → Project → Deployments → last known-good Production deployment → ... → Instant Rollback` (< 30 seconds).
- **Protected Assets:** Zero DNS changes, zero database changes, zero changes to `89` legacy sitemaps or `public/robots.txt`, and zero changes to Phase B.3 SQLite backups.
