# VISAAPPLY.ORG — VERCEL PREVIEW / STAGING & SAFE PRODUCTION DEPLOYMENT GUIDE
## Preserving Google AI Studio → GitHub → Vercel → VisaApply.org Live

- **Last Updated:** 2026-11-25 (Updated for Phase 9.3 Zero-Cost Workflow)
- **Budget Policy:** **100% ZERO-COST** — Vercel Hobby Free + GitHub Free only. Do **NOT** upgrade to Vercel Pro, enable billing, or migrate hosting.
- **Preserved Production Architecture:** `Google AI Studio → GitHub (main) → Vercel Hobby Free → https://www.visaapply.org`
- **Staging / Testing Architecture:** `Feature Branch / PR → GitHub (visaapply-staging) → Vercel Hobby Free Preview Deployment (*.vercel.app)`
- **Authorization Boundary:** Do **NOT** connect repositories, change Vercel project settings, push/create GitHub branches, deploy Preview/Production, enable billing, or alter DNS without explicit owner authorization.

---

## 1. GitHub Branch Strategy (Simple, Zero-Cost & Maintainable)

| Branch | Purpose | Vercel Target | Protection Policy |
| :--- | :--- | :--- | :--- |
| **`main`** | Approved production releases | **Vercel Hobby Free Production (`www.visaapply.org`)** | Protected: PR only, required CI check `Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build` |
| **`visaapply-staging`** | Dedicated zero-cost integration & preview testing branch | **Vercel Hobby Free Preview (`*.vercel.app`)** | Isolated preview branch; never directly publishes to `www.visaapply.org` |
| **`feat/*` or `fix/*`** *(optional)* | Individual AI Studio / developer tasks | **Vercel Hobby Free Preview (per-PR URL)** | Short-lived; merge into `visaapply-staging` first, then promote `visaapply-staging → main` |

### End-to-End 10-Step Workflow
1. Make changes in Google AI Studio (or local checkout) on a feature branch or `visaapply-staging` — **never** commit directly to `main`.
2. Commit and push the branch to GitHub *(only when explicitly authorized)*.
3. Open or update a GitHub Pull Request targeting `visaapply-staging`.
4. Vercel Hobby Free automatically builds and deploys an isolated **Preview Deployment** (`https://<project>-git-visaapply-staging-<user>.vercel.app`) and posts the Preview URL on the GitHub PR.
5. Run the free Playwright Preview suites (`PREVIEW_URL=https://<preview-url> npm run test:e2e:preview` and `PREVIEW_URL=https://<preview-url> npm run test:e2e:preview:phase93`) plus free Lighthouse Desktop/Mobile CLI audits against the Preview URL.
6. Reviewer inspects the Preview URL, test results, and diff, then approves the PR.
7. Merge the approved PR into `visaapply-staging` (refreshes the canonical `visaapply-staging` Preview URL).
8. Open the final Production Pull Request from `visaapply-staging` → `main`.
9. Confirm the free GitHub Actions status check (`Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build`) passes.
10. Merge into `main` → Vercel Hobby Free automatically builds and deploys the approved release to `https://www.visaapply.org`.

---

## 2. Vercel Git Integration, Production Branch & Preview Deployment Settings

> **Manual Verification Required:** External Vercel dashboard access is not available from this workspace. Verify these exact settings in `Vercel Dashboard → Project → Settings → Git`:

1. **Connected Git Repository:** Confirm your existing GitHub repository is connected (do not disconnect or recreate the production project).
2. **Production Branch:** Verify **Production Branch** is explicitly set to **`main`**.
3. **Preview Deployments:** Under `Settings → Git → Deploy Hooks / Ignored Build Step`, confirm automatic **Preview Deployments** are enabled for non-`main` branches (`staging` and PR branches) and GitHub PR comments are enabled.
4. **Build & Output Settings (`Settings → General → Build & Development Settings`):**
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (or `npm ci` once `package-lock.json` is committed)
   - **Node.js Version:** `20.x`
5. **SPA Fallback & Static Catalog Routing (`vercel.json`):**
   - Existing `vercel.json` is preserved intact, with minimal additions for `/catalog/(.*)` (`application/json`, `max-age=300, stale-while-revalidate=3600`) and `/sitemaps-static/(.*)` (`application/xml`, `max-age=3600`) plus passthrough rewrites for `/catalog/*`, `/locales/*`, and `/sitemaps-static/*`.
   - All direct React routes (`/immigration`, `/immigration/us`, `/visa/us/us-h1b-specialty`, `/tools/visa-comparison`, etc.) rewrite cleanly to `/api/render?path=/$1`, which serves `dist/index.html` with route-specific SSR metadata and security headers.
   - Apex redirect (`visaapply.org → www.visaapply.org`) is strictly host-scoped via `"has": [{ "type": "host", "value": "visaapply.org" }]`, so `*.vercel.app` Preview URLs load directly without redirecting to production.

---

## 3. Staging-Only SEO Protection (`noindex` on Preview, Indexable on Production)

VisaApply.org enforces **dual-layer staging-only `noindex`** so Preview Deployments can never appear as duplicate production pages in Google/Bing:

1. **Server-Side Layer (`api/render.ts`):**
   - `isVercelPreviewDeployment(req)` triggers **strictly** when `VERCEL_ENV === 'preview'` OR the request hostname ends with `.vercel.app` or matches `staging.visaapply.org` / `preview.visaapply.org`.
   - On Preview deployments ONLY, `api/render.ts` emits:
     - HTTP header: `X-Robots-Tag: noindex, nofollow, noarchive`
     - HTML tags: `<meta name="robots" content="noindex, nofollow, noarchive" />`, `<meta name="googlebot" ...>`, `<meta name="bingbot" ...>`
     - Cache header: `Cache-Control: private, no-store, no-cache, must-revalidate, max-age=0`
     - Canonical link: `<link rel="canonical" href="https://www.visaapply.org/..." />` (remains anchored to production!)
   - On **Production** (`VERCEL_ENV === 'production'` on `www.visaapply.org`), `isVercelPreviewDeployment()` returns `false` — pages remain **100% indexable** (`index, follow, ...`) with normal CDN caching and untouched `public/robots.txt` + `89` legacy sitemaps.
2. **Client-Side Hydration Layer (`src/utils/seoMetadataManager.ts`):**
   - `isPreviewHostname()` checks `window.location.hostname` on every React client-side navigation and preserves `noindex, nofollow, noarchive` on `*.vercel.app` and `staging.visaapply.org` / `preview.visaapply.org`, ensuring SPA route transitions never revert SSR `noindex` back to `index`.
3. **Optional Vercel Deployment Protection (Extra Security):**
   - In `Vercel Dashboard → Project → Settings → Deployment Protection`, you may keep **Vercel Authentication** enabled on **Preview Deployments only** (disabled on Production) for private review — note that automated Playwright/Lighthouse runs against protected previews require a Vercel Protection Bypass header or temporarily unrestricted Preview access.

---

## 4. Environment Variable Isolation Table (Names Only — Zero Secret Values)

Every `process.env.*` reference across `api/`, `server.ts`, `src/`, and `scripts/` was audited. **Zero** `import.meta.env.VITE_*` variables are required by the static React bundle. Remember: any future `VITE_*` variable is compiled into public browser JavaScript and must **never** hold secrets.

| Variable Name | Purpose | Required for Production? | Required for Preview? | Scope | Safe Handling Instructions |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `VERCEL` / `VERCEL_ENV` | Platform-injected runtime & environment discriminator (`production` / `preview`) | Auto (Vercel) | Auto (Vercel) | Server-only | System-managed by Vercel; never override manually; drives Preview `noindex` in `api/render.ts`. |
| `NODE_ENV` | Node runtime mode (`production`) | Auto | Auto | Server-only | Automatically set by Vite/Vercel build. |
| `APP_URL` | Canonical application origin override | Optional | Optional (set Preview URL or omit) | Server-only | Never point Preview to production write webhooks. |
| `ALLOWED_ORIGIN` / `ALLOWED_ORIGINS` | Additional CORS/CSRF trusted origins | Optional | Optional | Server-only | Keep Preview origins separate from Production origins. |
| `ADMIN_PASSWORD` | Legacy single-passphrase admin API login | Optional (only if legacy admin API enabled) | **No** (leave unset or use separate throwaway Preview secret) | Server-only | **Never** reuse Production `ADMIN_PASSWORD` in Preview; omit entirely if legacy admin API is retired. |
| `ADMIN_SESSION_SECRET` | HMAC signing key for admin `v2` session cookies | Optional (required only if `ADMIN_PASSWORD` is set) | **No** (separate Preview value if tested) | Server-only | High-entropy random secret scoped strictly to Production environment in Vercel. |
| `CRON_SECRET` | Bearer secret authorizing `/api/cron/*` jobs | Optional (if Vercel cron active) | **No** (do NOT set in Preview) | Server-only | Scope to **Production only** so Preview deployments never execute production cron jobs. |
| `GEMINI_API_KEY` | Server-side Gemini API calls (`/api/ask-faq`, `/api/ai-eligibility`) | Optional (only if AI endpoints active) | Optional (use low-quota test key or omit) | Server-only | Never expose via `VITE_`; restrict API key quota and keep server-side only. |
| `GEMINI_MODEL` | Optional Gemini model alias override | Optional | Optional | Server-only | Non-secret configuration string. |
| `RESEND_API_KEY` | Outbound email delivery for slot alerts | Optional (only if slot alert emails active) | **No** (leave unset in Preview so previews never email real subscribers) | Server-only | Scope strictly to **Production only**. |
| `ADMIN_ALERT_EMAIL` | Destination address for admin alerts | Optional | **No** (omit or use test mailbox) | Server-only | Scope to Production only. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional distributed rate-limiter store | Optional | **No** | Server-only | Scope to Production only (in-memory fallback is sufficient for Preview). |
| `CSP_HEADER_VALUE` | Optional custom preview CSP frame-ancestors override | **No** | **No** | Server-only | Leave unset on Vercel so hardened `buildContentSecurityPolicy()` defaults apply (`frame-ancestors 'self'`). |
| `ALLOW_AISTUDIO_PREVIEW` / `APPLET_ID` | AI Studio preview iframe detection | **No** | **No** | Server-only | Never set on Vercel Production or Preview (`isAiStudioPreviewRequest` always returns `false` on Vercel). |
| `DATABASE_URL` / `POSTGRES_URL` / `DIRECT_URL` / `NEON_*_DATABASE_URL` | Legacy/optional Postgres/Neon migration scripts | **No** (Zero-DB-First public site) | **No** | Server-only | **Do NOT set** in Vercel Preview; static public catalog has zero database runtime dependency. |
| `VISAAPPLY_SQLITE_PATH` / `ALLOW_SQLITE_IN_PROD` | Local SQLite legacy development path | **No** | **No** | Server-only | Never set on Vercel serverless runtime. |

---

## 5. Vercel Plan & Commercial-Use Restrictions (Zero-Cost Hobby Free Policy & Workarounds)

Under the **100% ZERO-COST** budget rule, VisaApply.org remains on **Vercel Hobby Free** (`Google AI Studio → GitHub (main) → Vercel Hobby Free → VisaApply.org`). **Do NOT purchase Vercel Pro or any paid plan.**

- **Documented Vercel Hobby Free Limitations & Zero-Cost Workarounds:**
  1. **Non-Commercial Fair Use Policy:** Vercel Hobby Free is restricted to personal, non-commercial informational usage; paid ads (AdSense) or commercial monetization should remain inactive while hosted on Vercel Hobby Free so terms are never violated.
  2. **Usage Caps (100 GB Fast Data Transfer / 1M Edge Requests / 100 daily builds):** Keep static catalog JSON and assets aggressively cached (`vercel.json` immutable `/assets/*` + `s-maxage` `/catalog/*`) and run GitHub Actions only on `visaapply-staging`/`main` PRs or manual dispatch to minimize builds and stay well within Hobby Free limits.
  3. **No Paid Preview Password Protection / Team RBAC Add-ons:** Instead of paid Vercel Deployment Protection addons, rely on our built-in zero-cost dual-layer Preview `noindex` (`api/render.ts` HTTP `X-Robots-Tag: noindex, nofollow, noarchive` + `Cache-Control: private, no-store` + `seoMetadataManager.ts` client guard) and GitHub Free pull-request review workflow.
  4. **No Paid Synthetic Monitoring:** Use our free local/GitHub Actions Playwright suites (`test:e2e:preview`, `test:e2e:preview:phase93` with bundled `axe-core`) and free Lighthouse CLI.

---

## 6. Preview URL Testing & Performance Validation Commands

Once an authorized Vercel Hobby Free Preview Deployment URL is generated (e.g., `https://visaapply-git-visaapply-staging-xxxx.vercel.app`), run the exact zero-cost suite below:

### A. Reusable Playwright Preview Suites (Functional, SEO, Broken Links, Accessibility, Security & CLS)
```bash
PREVIEW_URL=https://<your-preview-url>.vercel.app npm run test:e2e:preview
PREVIEW_URL=https://<your-preview-url>.vercel.app npm run test:e2e:preview:phase93
```
Or run all Playwright E2E suites together:
```bash
PREVIEW_URL=https://<your-preview-url>.vercel.app npm run test:e2e
```

### B. Edge Header & Staging-Only `noindex` Verification
```bash
# Must show X-Robots-Tag: noindex, nofollow, noarchive and Cache-Control: private, no-store...
curl -sI https://<your-preview-url>.vercel.app/
curl -sI https://<your-preview-url>.vercel.app/immigration
curl -sI https://<your-preview-url>.vercel.app/immigration/us
curl -sI https://<your-preview-url>.vercel.app/admin/editorial-review

# Static catalog JSON must return HTTP 200 + application/json
curl -sI https://<your-preview-url>.vercel.app/catalog/manifest.json
```

### C. Real CDN Lighthouse Audits (Desktop & Mobile — 5 Required Routes)
Pay special attention to **CLS on `/immigration/us`** (target `≤ 0.10`, preferred `≤ 0.05`):
```bash
# Desktop
npx lighthouse https://<your-preview-url>.vercel.app/ --preset=desktop --output=html --output-path=./lh-home-desktop.html
npx lighthouse https://<your-preview-url>.vercel.app/immigration --preset=desktop --output=html --output-path=./lh-hub-desktop.html
npx lighthouse https://<your-preview-url>.vercel.app/immigration/us --preset=desktop --output=html --output-path=./lh-us-desktop.html
npx lighthouse https://<your-preview-url>.vercel.app/tools/visa-comparison --preset=desktop --output=html --output-path=./lh-compare-desktop.html
npx lighthouse https://<your-preview-url>.vercel.app/in-to-ca-tourist --preset=desktop --output=html --output-path=./lh-blog-desktop.html

# Mobile
npx lighthouse https://<your-preview-url>.vercel.app/ --form-factor=mobile --output=html --output-path=./lh-home-mobile.html
npx lighthouse https://<your-preview-url>.vercel.app/immigration --form-factor=mobile --output=html --output-path=./lh-hub-mobile.html
npx lighthouse https://<your-preview-url>.vercel.app/immigration/us --form-factor=mobile --output=html --output-path=./lh-us-mobile.html
npx lighthouse https://<your-preview-url>.vercel.app/tools/visa-comparison --form-factor=mobile --output=html --output-path=./lh-compare-mobile.html
npx lighthouse https://<your-preview-url>.vercel.app/in-to-ca-tourist --form-factor=mobile --output=html --output-path=./lh-blog-mobile.html
```

### D. Automated Core Web Vitals Measurement (TTFB, FCP, LCP & CLS — All 5 Routes, Desktop & Mobile)
```bash
PREVIEW_URL=https://<your-preview-url>.vercel.app npx playwright test e2e/phase9_2_preview_staging.spec.ts -g "Core Web Vitals"
```

---

## 7. Production Merge & Instant Rollback Procedure

### Production Merge Procedure (`staging` → `main`)
1. Confirm all Preview tests (`npm run test:e2e:preview`), Lighthouse Desktop/Mobile checks, and manual screen-reader checks pass on the latest `staging` Preview URL.
2. Open a Pull Request from `staging` → `main`.
3. Verify the required GitHub Actions check (`Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build`) is green and an authorized CODEOWNER has approved.
4. Merge into `main` → Vercel builds and promotes Production to `https://www.visaapply.org`.
5. Immediately verify `curl -sI https://www.visaapply.org/` returns `X-Robots-Tag: index, follow...` (confirming production remains indexable).

### Instant Rollback Procedure (< 30 Seconds)
1. **Vercel Instant Rollback:** Open `Vercel Dashboard → Project → Deployments` → locate the last known-good **Production** deployment → click `...` → **Instant Rollback**.
2. **Git Revert:** Open a revert PR against `main` so GitHub history and Vercel Production stay synchronized (never force-push `main`).
3. **Zero Data Loss:** No database migrations, DNS changes, or legacy sitemap removals are coupled to Vercel Preview/Production deployments (`89` legacy sitemaps, `public/robots.txt`, and Phase B.3 SQLite backups remain intact).
