# VISAAPPLY.ORG — PHASE 9.7D GITHUB WEB UI STAGING PATCH GUIDE

- **Date:** 2026-11-28
- **Repository:** `https://github.com/Raja9373/visaapply.org`
- **Target Branch (ONLY):** `visaapply-staging` *(NEVER `main`!)*
- **Verified Base Commit (`main` and `visaapply-staging`):** `7395289a8fb6f503bc0d4c487961d0d729d98dab`
- **Preserved Workflow:** `Google AI Studio → GitHub → Vercel Hobby Free → VisaApply.org`
- **Cost:** **₹0 / $0**

> **CRITICAL SAFETY RULE BEFORE YOU START:**
> - **DO NOT** click **Push / Sync / Commit** inside Google AI Studio while its GitHub panel shows `main`.
> - **DO NOT** edit any file on the `main` branch.
> - **DO NOT** click **Merge pull request** during this phase.
> - **DO NOT** disconnect Google AI Studio from GitHub or change GitHub's default branch.

---

## Quick Overview of Required Changes (Verified Against Remote `7395289`)

All 7 Phase 9.6 and Phase 9.7 files (CI build-before-test fixes, E2E reliability fixes, snapshot `.gitignore`, and Phase 9.6/9.7 reports) are **already committed** on both `main` and `visaapply-staging` at `7395289a8fb6f503bc0d4c487961d0d729d98dab`.

Only the **7 Phase 9.7B / 9.7C files** below remain pending for `visaapply-staging`:

| # | Repository-Relative Path | Type | Required for Live SSR Fix & Vercel Preview? | Safe for GitHub Web UI Editing? |
| :---: | --- | :---: | :---: | :---: |
| 1 | `api/render.ts` | Edit (3 lines) | **YES (Required)** | **YES — Very Safe** |
| 2 | `src/utils/ssrRouteRenderer.ts` | Edit (1 line) | **YES (Required)** | **YES — Very Safe** |
| 3 | `src/utils/seoMetadataManager.ts` | Edit (2 lines) | **YES (Required)** | **YES — Very Safe** |
| 4 | `src/utils/autoLanguage.ts` | Edit (2 lines) | **YES (Required)** | **YES — Very Safe** |
| 5 | `src/utils/securityHardening.ts` | Edit (1 line) | **YES (Required)** | **YES — Very Safe** |
| 6 | `.gitignore` | Edit (1 line) | **YES (Recommended Hygiene)** | **YES — Very Safe** |
| 7 | `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` | New File (`248` lines) | Recommended (CI Regression Guard) | **FLAGGED — Use GitHub "Upload files" (Safer) or Careful Raw Paste** |

**Files NOT Recommended for Manual Web Editing (Optional Docs Only):**
- `docs/PHASE_9_7_CONSOLIDATED_REMOTE_VERIFICATION_REPORT.md`
- `docs/PHASE_9_7B_SSR_500_ROOT_CAUSE_AND_FIX_REPORT.md`
- `docs/PHASE_9_7C_STAGING_PREVIEW_REPORT.md`
- `docs/PHASE_9_7D_GITHUB_STAGING_WEB_GUIDE.md`
- *Why flagged:* Large multi-hundred-line Markdown files are unnecessary to fix the SSR HTTP 500 or trigger Vercel Preview and are prone to truncation if pasted manually. Do not hand-type them; if desired later, use GitHub's **Add file → Upload files** on `visaapply-staging`.

**Files You Must NEVER Commit:**
- `.env*` secrets, credentials, API keys, `data_db/*`, `backups/phase_9_6_recovery_snapshot/`, `test-results/`, `playwright-report/`, `.vercel/`, `dist/`, `node_modules/`, or `content/in-to-ca-tourist.md` / `content/us-to-uk-tourist.md`.

---

## Step 1 — Open the `visaapply-staging` Branch on GitHub

1. Open your web browser and go directly to:
   **`https://github.com/Raja9373/visaapply.org/tree/visaapply-staging`**
2. Look at the **top-left branch button** above the file list.
3. Confirm it says **`visaapply-staging`** (with a branch icon).
   - **STOP** if it says `main`! Click the dropdown and select **`visaapply-staging`** before opening any file.
4. Keep an eye on the browser URL bar for every edit below — it must always include **`/visaapply-staging/`** (never `/main/`).

---

## Step 2 — Apply the 6 Safe File Edits on `visaapply-staging`

For **each** of the 6 files below, follow the exact same 6-click pattern:
1. Click the direct `visaapply-staging` link below (or browse to the file while on `visaapply-staging`).
2. Confirm the branch selector at the top-left still shows **`visaapply-staging`**.
3. Click the **pencil icon (`Edit this file`)** in the top-right of the code viewer.
4. Make **only** the exact line change shown below.
5. Click the **Preview** tab (or check **Commit changes...** diff preview) and confirm **only** the expected `.js` / `.vercel/` lines changed.
6. Click **Commit changes...**, enter the suggested commit message, make sure **"Commit directly to the `visaapply-staging` branch"** is selected (NEVER `main`!), and click **Commit changes**.

---

### File 1 of 7: `api/render.ts`
- **Action:** Edit existing file (`3` lines changed)
- **Safe for GitHub Web UI:** **YES — Very Safe**
- **Direct URL (`visaapply-staging`):** `https://github.com/Raja9373/visaapply.org/blob/visaapply-staging/api/render.ts`
- **Exact lines to locate (Lines 1–5):**
  ```ts
  import fs from 'fs';
  import path from 'path';
  import { renderRouteSsrPayload, injectSsrPayloadIntoHtml } from '../src/utils/ssrRouteRenderer';
  import { extractAdminTokenFromRequest, verifyAdminToken } from '../src/utils/authSecurity';
  import { applySecurityHeaders } from '../src/utils/securityHardening';
  ```
- **Exact replacement code (Lines 1–5):**
  ```ts
  import fs from 'fs';
  import path from 'path';
  import { renderRouteSsrPayload, injectSsrPayloadIntoHtml } from '../src/utils/ssrRouteRenderer.js';
  import { extractAdminTokenFromRequest, verifyAdminToken } from '../src/utils/authSecurity.js';
  import { applySecurityHeaders } from '../src/utils/securityHardening.js';
  ```
- **Suggested commit message (to `visaapply-staging`):**
  `fix(ssr): add .js ESM extensions in api/render.ts`
- **How to verify:** After committing, view `api/render.ts` on `visaapply-staging` and confirm lines 3, 4, and 5 all end with `.js';`.

---

### File 2 of 7: `src/utils/ssrRouteRenderer.ts`
- **Action:** Edit existing file (`1` line changed)
- **Safe for GitHub Web UI:** **YES — Very Safe**
- **Direct URL (`visaapply-staging`):** `https://github.com/Raja9373/visaapply.org/blob/visaapply-staging/src/utils/ssrRouteRenderer.ts`
- **Exact lines to locate (Lines 1–8):**
  ```ts
  import {
    resolveStaticRouteSeoMetadata,
    normalizeCanonicalUrl,
    inspectRouteIndexingDirective,
    resolveValidOgImageUrl,
    getHreflangAlternatesForRoute,
  } from './seoMetadataManager';
  ```
- **Exact replacement code (Lines 1–8):**
  ```ts
  import {
    resolveStaticRouteSeoMetadata,
    normalizeCanonicalUrl,
    inspectRouteIndexingDirective,
    resolveValidOgImageUrl,
    getHreflangAlternatesForRoute,
  } from './seoMetadataManager.js';
  ```
- **Suggested commit message (to `visaapply-staging`):**
  `fix(ssr): add .js ESM extension in src/utils/ssrRouteRenderer.ts`
- **How to verify:** Confirm line 7 reads `} from './seoMetadataManager.js';` and no other lines changed.

---

### File 3 of 7: `src/utils/seoMetadataManager.ts`
- **Action:** Edit existing file (`2` lines changed)
- **Safe for GitHub Web UI:** **YES — Very Safe**
- **Direct URL (`visaapply-staging`):** `https://github.com/Raja9373/visaapply.org/blob/visaapply-staging/src/utils/seoMetadataManager.ts`
- **Exact lines to locate (Lines 1–2):**
  ```ts
  import { CANONICAL_15_LANG_CODES } from '../i18n/config';
  import { getCanonicalBaseOrigin, getLangFromUrlPath } from './autoLanguage';
  ```
- **Exact replacement code (Lines 1–2):**
  ```ts
  import { CANONICAL_15_LANG_CODES } from '../i18n/config.js';
  import { getCanonicalBaseOrigin, getLangFromUrlPath } from './autoLanguage.js';
  ```
- **Suggested commit message (to `visaapply-staging`):**
  `fix(ssr): add .js ESM extensions in src/utils/seoMetadataManager.ts`
- **How to verify:** Confirm lines 1 and 2 end with `../i18n/config.js';` and `./autoLanguage.js';`.

---

### File 4 of 7: `src/utils/autoLanguage.ts`
- **Action:** Edit existing file (`2` lines changed)
- **Safe for GitHub Web UI:** **YES — Very Safe**
- **Direct URL (`visaapply-staging`):** `https://github.com/Raja9373/visaapply.org/blob/visaapply-staging/src/utils/autoLanguage.ts`
- **Exact lines to locate (Lines 1–9):**
  ```ts
  import {
    SUPPORTED_LANGUAGES_15,
    COUNTRY_TO_LANG_15,
    UI_TRANSLATIONS_15,
    SupportedLangCode,
    I18nStrings,
    LanguageOption,
  } from '../i18n/config';
  import { getHreflangAlternatesForRoute } from './seoMetadataManager';
  ```
- **Exact replacement code (Lines 1–9):**
  ```ts
  import {
    SUPPORTED_LANGUAGES_15,
    COUNTRY_TO_LANG_15,
    UI_TRANSLATIONS_15,
    SupportedLangCode,
    I18nStrings,
    LanguageOption,
  } from '../i18n/config.js';
  import { getHreflangAlternatesForRoute } from './seoMetadataManager.js';
  ```
- **Suggested commit message (to `visaapply-staging`):**
  `fix(ssr): add .js ESM extensions in src/utils/autoLanguage.ts`
- **How to verify:** Confirm lines 8 and 9 end with `../i18n/config.js';` and `./seoMetadataManager.js';`.

---

### File 5 of 7: `src/utils/securityHardening.ts`
- **Action:** Edit existing file (`1` line changed)
- **Safe for GitHub Web UI:** **YES — Very Safe**
- **Direct URL (`visaapply-staging`):** `https://github.com/Raja9373/visaapply.org/blob/visaapply-staging/src/utils/securityHardening.ts`
- **Exact lines to locate (Lines 1–4):**
  ```ts
  import crypto from 'node:crypto';
  import fs from 'node:fs';
  import path from 'node:path';
  import { recordOperationalEvent, redactSensitiveData } from './operationalObservability';
  ```
- **Exact replacement code (Lines 1–4):**
  ```ts
  import crypto from 'node:crypto';
  import fs from 'node:fs';
  import path from 'node:path';
  import { recordOperationalEvent, redactSensitiveData } from './operationalObservability.js';
  ```
- **Suggested commit message (to `visaapply-staging`):**
  `fix(ssr): add .js ESM extension in src/utils/securityHardening.ts`
- **How to verify:** Confirm line 4 ends with `./operationalObservability.js';`.

> **Milestone Check:** As soon as Files 1–5 are committed to `visaapply-staging`, the **entire Production SSR HTTP 500 fix is on `visaapply-staging`**, and Vercel Hobby Free will already begin building a **Preview deployment** for `visaapply-staging`!

---

### File 6 of 7: `.gitignore`
- **Action:** Edit existing file (`1` line added at bottom)
- **Safe for GitHub Web UI:** **YES — Very Safe**
- **Direct URL (`visaapply-staging`):** `https://github.com/Raja9373/visaapply.org/blob/visaapply-staging/.gitignore`
- **Exact lines to locate (Lines 9–11):**
  ```gitignore
  test-results/
  playwright-report/
  backups/phase_9_6_recovery_snapshot/
  ```
- **Exact replacement code (Lines 9–12):**
  ```gitignore
  test-results/
  playwright-report/
  backups/phase_9_6_recovery_snapshot/
  .vercel/
  ```
- **Suggested commit message (to `visaapply-staging`):**
  `chore(staging): ignore generated .vercel build metadata directory`
- **How to verify:** Confirm `.gitignore` has 12 non-empty lines ending with `.vercel/`.

---

### File 7 of 7 (FLAGGED — Larger New Test File): `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts`
- **Action:** New file (`248` lines)
- **Safe for GitHub Web UI?** **FLAGGED — Moderate Risk if Hand-Edited**
  - *Why flagged:* This file is `248` lines long and contains nested JavaScript template strings (backticks inside backticks) that can be accidentally altered if typed by hand.
  - **Safer Alternative (Recommended):** Download/export `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` from Google AI Studio's file tree, open **`https://github.com/Raja9373/visaapply.org/tree/visaapply-staging/tests`**, click **Add file → Upload files**, drag-and-drop `phase9_7b_vercel_ssr_esm_packaging.test.ts`, confirm **"Commit directly to the `visaapply-staging` branch"**, and commit with:
    `test(ssr): add @vercel/node Lambda packaging and native Node ESM regression test`
  - **Optional Fallback (Create new file in GitHub Web UI):** Only if uploading is inconvenient, open `https://github.com/Raja9373/visaapply.org/new/visaapply-staging/tests`, name the file `phase9_7b_vercel_ssr_esm_packaging.test.ts`, and copy-paste the exact unmodified 248-line file directly from Google AI Studio's `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` code viewer (do not retype).
  - **How to verify:** Confirm the file exists at `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` on `visaapply-staging`, has `248` lines, and passes automatically inside GitHub Actions once the PR is opened in Step 4.

---

## Step 3 — Confirm the Resulting Staging Commit SHA

1. Open **`https://github.com/Raja9373/visaapply.org/commits/visaapply-staging`**.
2. Confirm:
   - Your new commits appear at the top of **`visaapply-staging`** (above `7395289`).
   - Copy the **latest full commit SHA** on `visaapply-staging` (click the copy icon next to the top commit).
3. Double-check **`https://github.com/Raja9373/visaapply.org/commits/main`**:
   - Confirm `main` is **STILL** at `7395289` (untouched!).

---

## Step 4 — Open Exactly One OPEN, UNMERGED Pull Request (`visaapply-staging` → `main`)

1. Open **`https://github.com/Raja9373/visaapply.org/compare/main...visaapply-staging`**.
2. Verify the branch arrows at the top read EXACTLY:
   - **`base: main`** ← **`compare: visaapply-staging`**
3. Scroll down and verify the **Files changed** tab shows ONLY your 6 or 7 Phase 9.7B/9.7C files (zero secrets, zero `.env`, zero `data_db/`, zero `.vercel/`).
4. Click **Create pull request**.
5. Enter:
   - **Title:** `[STAGING VALIDATION — DO NOT MERGE] Phase 9.7D: Fix Production SSR ESM 500 & Verify Vercel Preview`
   - **Description:**
     ```markdown
     ## Staging Validation Pull Request — DO NOT MERGE

     - **Purpose:** Validate the Phase 9.7B Node.js ESM `.js` import fix for `/api/render` on a live Vercel Hobby Free Preview deployment and confirm GitHub Actions PR checks pass before any Production promotion.
     - **Included Changes:**
       - Explicit `.js` ESM extensions across the 5 files in `api/render.ts`'s transitive dependency graph (`api/render.ts`, `src/utils/ssrRouteRenderer.ts`, `src/utils/seoMetadataManager.ts`, `src/utils/autoLanguage.ts`, `src/utils/securityHardening.ts`).
       - `.gitignore` exclusion for generated `.vercel/` directory.
       - Permanent `@vercel/node` packaging & native Node.js ESM regression test (`tests/phase9_7b_vercel_ssr_esm_packaging.test.ts`).
     - **Safety Hold:** Keep this PR **OPEN and UNMERGED**. Do not merge or deploy to Production until live Preview and GitHub Actions checks are verified green.
     ```
6. Click **Create pull request**.
7. **STOP — DO NOT CLICK "Merge pull request"!** Copy the real PR URL (e.g., `https://github.com/Raja9373/visaapply.org/pull/1`).

---

## Step 5 — Locate the Automatic Vercel Hobby Free Preview Deployment

1. Within ~30–90 seconds of your first commit to `visaapply-staging` (and opening the PR), the existing Vercel GitHub integration will automatically build a **Preview** deployment.
2. Find the actual Preview URL in either place (never guess or invent a URL):
   - **On the GitHub PR page:** Look for the **Vercel** bot comment or the **Checks** section (`Vercel — Preview` → **Details / Visit Preview**), OR
   - **In Vercel Dashboard:** Go to `Vercel Dashboard → visaapply-org → Deployments`, filter by **Preview** (or look for branch **`visaapply-staging`**), wait for status **`Ready`**, and copy the **`https://...vercel.app`** URL.
3. **Do NOT** attach a custom domain and **do NOT** click **Promote to Production**.

---

## Step 6 — Verification Checklist Once the Real Preview URL Exists

Paste the **PR URL**, **latest `visaapply-staging` commit SHA**, and **actual Vercel Preview URL** back into your next prompt (Phase 9.7E — Live Remote Preview & CI Verification). We will independently verify every item below against the real Preview URL and real GitHub Actions runs:

1. **HTTP 200 & Native Node.js ESM SSR (Zero `ERR_MODULE_NOT_FOUND`):**
   - Core routes: `/immigration`, `/immigration/us`, `/in-to-ca-tourist`, `/tools/visa-comparison`
   - 12 representative bilateral visa routes: `/in-to-us`, `/in-to-gb`, `/in-to-au`, `/in-to-de`, `/us-to-gb`, `/us-to-jp`, `/gb-to-ca`, `/ca-to-fr`, `/au-to-sg`, `/de-to-ae`, `/in-to-us-work`, `/in-to-ca-student`
   - Confirm full server-rendered `<main>`, `<h1>`, and `<script id="ssr-route-jsonld" type="application/ld+json">` on every route.
2. **Preview-Only SEO `noindex` & Canonical Protection:**
   - HTTP response header: `X-Robots-Tag: noindex, nofollow, noarchive`
   - HTML meta tags: `<meta name="robots" content="noindex, nofollow, noarchive" />` (plus `googlebot` & `bingbot`)
   - Canonical tag: `<link rel="canonical" href="https://www.visaapply.org/..." />` (zero `.vercel.app` canonicals)
   - `Cache-Control` includes `no-store` (no public Preview caching)
3. **GitHub Actions Live PR Checks:**
   - `Editorial Pull Request Validation Gate` → `Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build`
   - `Zero-Cost Staging & Preview Validation` → `Zero-Cost Staging Validation (TS, Build, Regression, Catalog, Editorial & SEO)`
4. **Live Playwright Preview E2E Suites:**
   - `PREVIEW_URL=<actual-preview-url> npm run test:e2e:preview`
   - `PREVIEW_URL=<actual-preview-url> npm run test:e2e:preview:phase93`
5. **Production Untouched Check:**
   - Confirm `main` remains at `7395289` and no Production deployment was triggered.
