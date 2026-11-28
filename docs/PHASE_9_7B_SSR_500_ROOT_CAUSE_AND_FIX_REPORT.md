# VISAAPPLY.ORG — PHASE 9.7B PRODUCTION SSR HTTP 500 ROOT-CAUSE & SAFE FIX REPORT

- **Date:** 2026-11-28
- **Repository:** `Raja9373/visaapply.org`
- **Affected Production Deployment:** `DUtGhxth6KqYpo3NvVaozHFkFCAH` (and preceding `AqzjPMexxQTAafaeZ4h9gBQroWn5`)
- **Current Remote Commit:** `7395289a8fb6f503bc0d4c487961d0d729d98dab`
- **Preserved Workflow:** `Google AI Studio → GitHub → Vercel Hobby Free → VisaApply.org`
- **Budget:** **₹0 / $0**
- **Phase 9.7B Status:** Root cause **`VERIFIED`**, fix implemented & validated locally (**`179/179` tests PASS** + real `@vercel/node` Lambda native ESM execution **PASS**). GitHub sync and Production deployment **`NOT PERFORMED`** — awaiting explicit owner authorization.

---

## 1. Exact Root Cause (With File & Line References)

**Status:** **`VERIFIED`** (Reproduced verbatim locally using `@vercel/node` v28.0.1 + native Node.js ESM)

### Production Runtime Error Observed in Vercel Logs
```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/src/utils/ssrRouteRenderer' imported from /var/task/api/render.js
```

### Answers to All 7 Mandatory Root-Cause Investigation Questions
1. **Does `src/utils/ssrRouteRenderer` exist?**
   - **Yes.** Exact path & capitalization: `src/utils/ssrRouteRenderer.ts` (`1,029` lines, `50,438` bytes). Exports: `renderRouteSsrPayload`, `injectSsrPayloadIntoHtml`, `ISO2_COUNTRY_NAMES`, `UNINHABITED_TERRITORY_CODES`, and `SsrRouteRenderResult`.
2. **Does `api/render.ts` import it using a valid Node.js ESM-compatible path?**
   - **No.** `api/render.ts` (lines 3–5) used extensionless relative imports, AND **4 additional files** in its transitive dependency graph also used extensionless relative imports (`9` total extensionless imports across `5` files):
     - `api/render.ts:3` → `'../src/utils/ssrRouteRenderer'`
     - `api/render.ts:4` → `'../src/utils/authSecurity'`
     - `api/render.ts:5` → `'../src/utils/securityHardening'`
     - `src/utils/ssrRouteRenderer.ts:7` → `'./seoMetadataManager'`
     - `src/utils/seoMetadataManager.ts:1` → `'../i18n/config'`
     - `src/utils/seoMetadataManager.ts:2` → `'./autoLanguage'`
     - `src/utils/autoLanguage.ts:8` → `'../i18n/config'`
     - `src/utils/autoLanguage.ts:9` → `'./seoMetadataManager'`
     - `src/utils/securityHardening.ts:4` → `'./operationalObservability'`
3. **Does the TypeScript/Vite build produce the required runtime file?**
   - `npm run build` executes `vite build` (`package.json:9`), which builds only the client SPA into `dist/`. Vercel's `@vercel/node` serverless builder separately compiles `api/render.ts` and its imported `src/` TypeScript dependencies using `tsc` and `tsconfig.json`.
4. **Does Vercel's serverless function tracing include `src/utils/ssrRouteRenderer.js` in the deployed bundle?**
   - **Yes — confirmed via local `@vercel/node` v28.0.1 `build()` execution.** All 8 compiled `.js` modules (`api/render.js`, `src/utils/ssrRouteRenderer.js`, `src/utils/authSecurity.js`, `src/utils/securityHardening.js`, `src/utils/seoMetadataManager.js`, `src/utils/autoLanguage.js`, `src/utils/operationalObservability.js`, `src/i18n/config.js`), `package.json`, and `dist/index.html` **were** compiled and packaged into the Lambda output (`117` files total).
5. **Exact 3-Way Configuration Mismatch Causing the Crash:**
   - **`package.json:5`** declares `"type": "module"`, instructing Vercel's `nodejs24.x` Lambda runtime to execute `/var/task/api/render.js` and `/var/task/src/**/*.js` as **strict Native Node.js ESM**, where explicit `.js` file extensions on every relative `import` are mandatory.
   - **`tsconfig.json:6,9-10`** declares `"module": "ESNext"`, `"moduleResolution": "bundler"`, and `"allowImportingTsExtensions": true`. Under `moduleResolution: "bundler"`, TypeScript accepts extensionless imports during type-checking AND emits unbundled `.js` files with those extensionless specifiers **unchanged verbatim**.
   - Local development (`tsx server.ts`) and local tests (`node --test --import tsx`) masked the failure because `tsx` resolves extensionless `.ts` paths dynamically via esbuild, whereas Vercel runs native Node.js ESM without `tsx`.
6. **Verbatim Local Reproduction (Before Fix):**
   Running `@vercel/node`'s `build()` on `api/render.ts` and importing the emitted `api/render.js` in plain `node --input-type=module` reproduced the exact Vercel production crash:
   ```text
   RUNTIME_ERROR: ERR_MODULE_NOT_FOUND Cannot find module '/tmp/vercel-lambda-before/src/utils/ssrRouteRenderer' imported from /tmp/vercel-lambda-before/api/render.js
   ```
   *(Note: Fixing ONLY `api/render.ts:3` would have immediately failed on `api/render.ts:4`, `api/render.ts:5`, and then each of the remaining 6 transitive extensionless imports across `ssrRouteRenderer.ts`, `seoMetadataManager.ts`, `autoLanguage.ts`, and `securityHardening.ts`.)*
7. **Were `vercel.json` includeFiles/rewrites at fault?**
   - **No.** `vercel.json:8-12` (`"api/render.ts": { "includeFiles": "dist/index.html" }`) and `vercel.json:140` (`destination: "/api/render?path=/$1"`) were valid and included `dist/index.html` cleanly in the Lambda bundle.

---

## 2. Before / After Code Changes

All 9 relative imports across the 5 source files in `api/render.ts`'s transitive dependency graph were updated to explicit Node.js ESM `.js` extensions (100% compatible with native Node.js ESM, `@vercel/node`, `tsc --noEmit`, `vite build`, and `tsx`):

### 1. `api/render.ts` (Lines 3–5)
```diff
-import { renderRouteSsrPayload, injectSsrPayloadIntoHtml } from '../src/utils/ssrRouteRenderer';
-import { extractAdminTokenFromRequest, verifyAdminToken } from '../src/utils/authSecurity';
-import { applySecurityHeaders } from '../src/utils/securityHardening';
+import { renderRouteSsrPayload, injectSsrPayloadIntoHtml } from '../src/utils/ssrRouteRenderer.js';
+import { extractAdminTokenFromRequest, verifyAdminToken } from '../src/utils/authSecurity.js';
+import { applySecurityHeaders } from '../src/utils/securityHardening.js';
```

### 2. `src/utils/ssrRouteRenderer.ts` (Line 7)
```diff
-} from './seoMetadataManager';
+} from './seoMetadataManager.js';
```

### 3. `src/utils/seoMetadataManager.ts` (Lines 1–2)
```diff
-import { CANONICAL_15_LANG_CODES } from '../i18n/config';
-import { getCanonicalBaseOrigin, getLangFromUrlPath } from './autoLanguage';
+import { CANONICAL_15_LANG_CODES } from '../i18n/config.js';
+import { getCanonicalBaseOrigin, getLangFromUrlPath } from './autoLanguage.js';
```

### 4. `src/utils/autoLanguage.ts` (Lines 8–9)
```diff
-} from '../i18n/config';
-import { getHreflangAlternatesForRoute } from './seoMetadataManager';
+} from '../i18n/config.js';
+import { getHreflangAlternatesForRoute } from './seoMetadataManager.js';
```

### 5. `src/utils/securityHardening.ts` (Line 4)
```diff
-import { recordOperationalEvent, redactSensitiveData } from './operationalObservability';
+import { recordOperationalEvent, redactSensitiveData } from './operationalObservability.js';
```

**Preservation Confirmed:** Zero changes to SSR rendering logic, SEO metadata, canonical URLs, robots directives, JSON-LD structured data, route resolution, immigration data (`src/data/*`, `data/*`), `vercel.json`, `tsconfig.json`, or `package.json`.

---

## 3. Files Modified & Added

| File Path | Action | Reason |
| --- | :---: | --- |
| `api/render.ts` | Modified | Explicit `.js` ESM extensions on all 3 relative imports. |
| `src/utils/ssrRouteRenderer.ts` | Modified | Explicit `.js` ESM extension on `./seoMetadataManager.js`. |
| `src/utils/seoMetadataManager.ts` | Modified | Explicit `.js` ESM extensions on `../i18n/config.js` and `./autoLanguage.js`. |
| `src/utils/autoLanguage.ts` | Modified | Explicit `.js` ESM extensions on `../i18n/config.js` and `./seoMetadataManager.js`. |
| `src/utils/securityHardening.ts` | Modified | Explicit `.js` ESM extension on `./operationalObservability.js`. |
| `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` | Added | Permanent missing-module/ESM regression guard + real `@vercel/node` Lambda packaging & native Node.js ESM execution test across 4 core routes + 12 bilateral country-to-country routes + Preview `noindex`. |
| `docs/PHASE_9_7B_SSR_500_ROOT_CAUSE_AND_FIX_REPORT.md` | Added | This Phase 9.7B root-cause and fix report. |

---

## 4. Actual Build & Test Results

All required validations were executed after applying the fix:

| Check / Command | Actual Result | Exact Observed Output |
| --- | :---: | --- |
| TypeScript type check (`npx tsc --noEmit`) | **PASS** | Exit code `0`, `0` errors. |
| Production build (`npm run build`) | **PASS** | `✓ built in 5.20s`; PWA v2.0.0 precached `90` entries (`7670.26 KiB`). |
| Vercel SSR ESM & Lambda Packaging Suite (`node --test --import tsx tests/phase9_7b_vercel_ssr_esm_packaging.test.ts`) | **PASS — 2/2** | `0` failed (`5.44s`). Verified missing-module regression guard across all 8 modules AND native Node.js ESM execution of compiled `@vercel/node` Lambda bundle. |
| Full Regression Test Suite (`node --test --import tsx tests/*.test.ts`) | **PASS — 179/179** | `179` passed, `0` failed, `0` skipped (`102.7s`) — includes all existing SSR, SEO, security, Phase 5B/6/7/8/9.2/9.3/9.4 tests + 2 new Phase 9.7B tests. |
| Static Catalog Validation (`npm run catalog:validate`) | **PASS — 17/17** | `0` errors, `2` expected governance warnings (`249` countries, `61` official sources, `28` programs). |
| GitHub Governance Config (`npm run editorial:verify-github-config`) | **PASS** | `0` errors (`27` CODEOWNERS rules validated). |
| Editorial PR Validation (`npm run editorial:validate-pr`) | **PASS** | `Static Catalog Valid: true`, `PII & Secret Scan Clean: true`, `Atomic Regen Dry-Run: true`. |
| Final Applet Compile & Lint (`compile_applet` + `lint_applet`) | **PASS** | Verified immediately after saving this report. |

---

## 5. Vercel Function Packaging & Native Node.js ESM Verification

**Status:** **`VERIFIED`** (Locally via real `@vercel/node` v28.0.1 `build()` + plain `node --input-type=module` without `tsx`)

### Bundled Lambda Artifact Verification
- **Runtime target:** `nodejs24.x` (`handler: api/render.js`, `117` bundled files)
- **Verified present in compiled Lambda bundle:**
  - `api/render.js`
  - `dist/index.html`
  - `package.json`
  - `src/utils/ssrRouteRenderer.js`
  - `src/utils/seoMetadataManager.js`
  - `src/utils/autoLanguage.js`
  - `src/utils/authSecurity.js`
  - `src/utils/securityHardening.js`
  - `src/utils/operationalObservability.js`
  - `src/i18n/config.js`

### Routes Verified in Native Node.js ESM Against the Compiled `@vercel/node` Lambda Bundle
All **16 routes** below returned **`HTTP 200`**, full SSR `<main>` + `<h1>` semantic HTML, valid `<script id="ssr-route-jsonld" type="application/ld+json">`, exact production `<link rel="canonical" href="https://www.visaapply.org...">` + HTTP `Link` canonical header, `X-Robots-Tag: index, follow...` (Production mode), and never fell back to `FALLBACK_HTML_TEMPLATE`:

- **4 Explicitly Named Affected Routes:**
  1. `/immigration` — `HTTP 200` (`PASS`)
  2. `/immigration/us` — `HTTP 200` (`PASS`)
  3. `/in-to-ca-tourist` — `HTTP 200` (`PASS`)
  4. `/tools/visa-comparison` — `HTTP 200` (`PASS`)
- **12 Representative Country-to-Country Bilateral Visa Routes:**
  1. `/in-to-us` — `HTTP 200` (`PASS`)
  2. `/in-to-gb` — `HTTP 200` (`PASS`)
  3. `/in-to-au` — `HTTP 200` (`PASS`)
  4. `/in-to-de` — `HTTP 200` (`PASS`)
  5. `/us-to-gb` — `HTTP 200` (`PASS`)
  6. `/us-to-jp` — `HTTP 200` (`PASS`)
  7. `/gb-to-ca` — `HTTP 200` (`PASS`)
  8. `/ca-to-fr` — `HTTP 200` (`PASS`)
  9. `/au-to-sg` — `HTTP 200` (`PASS`)
  10. `/de-to-ae` — `HTTP 200` (`PASS`)
  11. `/in-to-us-work` — `HTTP 200` (`PASS`)
  12. `/in-to-ca-student` — `HTTP 200` (`PASS`)
- **Preview Mode Guard (`VERCEL_ENV=preview`, host `visaapply-git-visaapply-staging.vercel.app`):**
  - `/immigration/us` → `HTTP 200`, `X-Robots-Tag: noindex, nofollow, noarchive`, `Cache-Control: private, no-store...`, HTML meta `noindex, nofollow, noarchive`, production canonical `https://www.visaapply.org/immigration/us` (`PASS`).

---

## 6. Remaining Risks

1. **Other Non-SSR Serverless Endpoints Under `api/` (Out of Scope for Minimal Phase 9.7B Fix):**
   - `api/sitemap.ts` has `0` extensionless relative imports (already works live in production).
   - `api/admin.ts`, `api/countries.ts`, `api/cron.ts`, `api/ai-eligibility.ts`, `api/guides.ts`, and `api/faq.ts` still contain extensionless relative imports (including `src/data/*.ts` for `api/faq.ts` and `api/guides.ts`). Per Phase 9.7B scope rules (*smallest reliable fix; do not modify immigration data*), those endpoints were intentionally left untouched and should be audited/fixed in a separate dedicated API ESM hardening pass if those serverless endpoints are invoked on Vercel.
2. **AI Studio GitHub Integration Default-Branch Binding (`main`):**
   - Google AI Studio's GitHub Sync panel is bound to `main` (`default_branch`). Clicking Push in AI Studio without verifying the target branch would push directly to `main` (triggering Production deployment) instead of `visaapply-staging`.
3. **Live Production Still Affected Until Authorized Deployment:**
   - Because Phase 9.7B prohibits pushing to GitHub or deploying Production, live `https://www.visaapply.org` sub-routes remain on commit `7395289` (`HTTP 500`) until the owner authorizes Phase 9.7C deployment.

---

## 7. Safe Deployment Procedure & Can Preview Be Tested Without Touching Production?

### Can a Preview Deployment Be Tested Without Touching Production?
**YES — at ₹0 / $0.** Pushing the Phase 9.7B commit onto branch **`visaapply-staging`** (leaving `main` untouched) creates a commit ahead of `main` (`ahead_by: 1`), which automatically triggers a **Vercel Hobby Free Preview deployment** (`VERCEL_ENV=preview`, `X-Robots-Tag: noindex, nofollow, noarchive`) completely isolated from `https://www.visaapply.org`.

### Safe Deployment Options (Require Explicit Owner Authorization — NOT Performed Yet)

- **Recommended Option 1 — Staging-First Preview Validation (`visaapply-staging` → Preview → PR → `main`):**
  1. **Do NOT click AI Studio Push while its GitHub panel targets `main`.**
  2. Apply the 5 minimal `.js` import fixes (+ `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` + this report) onto branch **`visaapply-staging`** on GitHub (`Raja9373/visaapply.org`), leaving `main` and GitHub's default branch untouched.
  3. Open one Pull Request (`visaapply-staging` → `main`) — **do not merge yet**.
  4. Verify both:
     - GitHub Actions PR checks (`Validate Editorial PR...`, `Zero-Cost Staging Validation...`) pass green (including `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts`), and
     - Automatic **Vercel Hobby Free Preview URL** returns `HTTP 200` + `X-Robots-Tag: noindex, nofollow, noarchive` on `/immigration`, `/immigration/us`, `/in-to-ca-tourist`, `/tools/visa-comparison`, and bilateral routes.
  5. Only after live Preview & CI are verified green, merge the PR into `main` so Vercel automatically deploys the verified fix to `https://www.visaapply.org`, then verify live Production HTTP `200` + `X-Robots-Tag: index, follow` + canonicals.

- **Option 2 — Owner-Authorized Direct Hotfix Sync via AI Studio (`main`):**
  - If the owner explicitly prefers an immediate Production hotfix because live SSR routes are currently returning `HTTP 500`, the owner may explicitly authorize pushing these verified local changes via Google AI Studio's GitHub panel (keeping `main` protection rules intact or using an authorized PR flow), followed by immediate live verification on `https://www.visaapply.org`.

---

## 8. Final Status Summary

1. **Root cause:** **`VERIFIED`** (`package.json` `"type": "module"` + `tsconfig.json` `"moduleResolution": "bundler"` caused `@vercel/node` to emit unbundled ESM `.js` files with 9 extensionless relative imports across 5 files starting at `api/render.ts:3-5`, crashing Vercel's `nodejs24.x` runtime with `ERR_MODULE_NOT_FOUND` even though all `.js` files were present in `/var/task`).
2. **Fix implemented:** **`YES`** (explicit `.js` ESM extensions across all 5 files in `api/render.ts`'s transitive dependency graph + permanent regression & Vercel packaging test).
3. **Build and tests:**
   - `npx tsc --noEmit`: **PASS (`0` errors)**
   - `npm run build`: **PASS (`5.20s`, PWA `90` entries / `7670.26 KiB`)**
   - `node --test --import tsx tests/phase9_7b_vercel_ssr_esm_packaging.test.ts`: **PASS (`2/2`)** (4 core routes + 12 bilateral routes + Preview `noindex` in native Node.js ESM)
   - `node --test --import tsx tests/*.test.ts`: **PASS (`179/179`, `0` failed)**
   - `npm run catalog:validate`: **PASS (`17/17`, `0` errors)**
   - `npm run editorial:verify-github-config` & `npm run editorial:validate-pr`: **PASS (`0` errors)**
4. **Vercel function packaging:** **`VERIFIED`** (real `@vercel/node` v28.0.1 `build()` packaged all 10 required runtime files + `dist/index.html`, executed cleanly in plain native Node.js ESM).
5. **Production HTTP 500:** **`NOT YET VERIFIED`** (fixed and verified locally; live `https://www.visaapply.org` remains untouched until authorized deployment).
6. **GitHub synchronization:** **`NOT PERFORMED`** (per Section 5 strict safety rules).
7. **Production deployment:** **`NOT PERFORMED`** (per Section 5 strict safety rules).
8. **Cost:** **`₹0 / $0`** (zero paid services).
9. **Exact next action and next phase:**
   - **Next Phase:** **Phase 9.7C — Authorized Staging Preview Deployment (`visaapply-staging`) & Controlled Production SSR Recovery**
   - **Required Owner Decision:** Explicitly authorize whether to deploy first to `visaapply-staging` for live Vercel Preview & GitHub Actions PR verification (Recommended — Option 1) or authorize a direct Production hotfix (Option 2).
