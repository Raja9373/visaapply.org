# VISAAPPLY.ORG — PHASE 9.7E TEMPORARY BRANCH RECOVERY & GITHUB WEB UI GUIDE

- **Date (Verified Remotely):** 2026-11-28
- **Repository:** `https://github.com/Raja9373/visaapply.org`
- **Target Temporary Branch (ONLY):** `phase-9-7b-ssr-fix` *(replaces `visaapply-staging`, which is **NOT** used or modified)*
- **Latest Verified Remote `main` SHA:** `98c1ab9a70e6ca5042886a9ac82a374d9eaa1a3c` (`2026-11-28T13:27:44Z`)
- **Workflow:** `Google AI Studio → GitHub temporary branch → Pull Request to main → Vercel Preview → Remote verification → Separate Production authorization`
- **Cost:** **₹0 / $0** (Google AI Studio + GitHub Free + Vercel Hobby Free)

> **CRITICAL SAFETY RULES BEFORE YOU START:**
> - **DO NOT** click **Push / Sync / Commit** inside Google AI Studio while its GitHub panel targets `main` — notice that previous pushes from AI Studio already landed directly on `main` (`4923fe5` and `98c1ab9`).
> - **DO NOT** edit any file directly on `main`.
> - **DO NOT** use, edit, push to, or open a PR from `visaapply-staging`.
> - **DO NOT** click **Merge pull request**.
> - **DO NOT** promote or deploy to Production, or change DNS, domains, databases, or Production environment variables.

---

## STEP 1 — VERIFIED CURRENT REMOTE STATE (READ-ONLY LIVE AUDIT)

An independent read-only check of `Raja9373/visaapply.org` and `https://www.visaapply.org` revealed **two newer commits on `origin/main`** since the earlier `7395289` audit:

| Item | Live Verified Status |
| :--- | :--- |
| **Repository** | `Raja9373/visaapply.org` |
| **Latest `origin/main` SHA** | `98c1ab9a70e6ca5042886a9ac82a374d9eaa1a3c` (`protected: true`, `2026-11-28T13:27:44Z` — `"docs: update Phase 9.7 documentation"`) |
| **Previous `origin/main` SHA** | `4923fe5d3ad5f7fc53d8d84bd17bc88966f666a9` (`2026-11-28T13:10:20Z` — `"refactor: add explicit .js extensions for ESM imports"`) |
| **Earlier Audit `main` SHA** | `7395289a8fb6f503bc0d4c487961d0d729d98dab` (`2026-11-28T11:34:23Z` — `"test: fix CI workflow order and increase E2E timeouts"`) |
| **Does `phase-9-7b-ssr-fix` exist?** | **NO (`false`)** |
| **Does `visaapply-staging` exist?** | Yes, at `7395289a8fb6f503bc0d4c487961d0d729d98dab` (`protected: false`) — **untouched and NOT used** |
| **Open or Closed Pull Requests** | **0** |
| **Latest Vercel Production Deployments** | `4923fe5` → `6qmDFsyws3wDRGYFcwKDcVrt6JQL` (**`success`**); `98c1ab9` → `8wPrio2vajdBUkqtY38jwNov6gdc` (**`success`**) |
| **Live Production SSR Verification (`16/16` Routes)** | **16/16 PASS (`HTTP 200`, zero `x-vercel-error`, canonical + JSON-LD + `<h1>` + `index, follow`)** |

### Critical Parity Finding — All 7 Phase 9.7B/9.7C Files Are Already on `origin/main` (`98c1ab9`)

A byte-for-byte comparison confirmed that **all 7 Phase 9.7B / 9.7C files were already committed to `origin/main` in `4923fe5` and remain byte-identical at `98c1ab9`**:

| # | Repository-Relative Path | Remote Status on `main` (`98c1ab9`) | Local vs Remote Parity |
| :---: | --- | :---: | :---: |
| 1 | `api/render.ts` | **ALREADY APPLIED** (in `4923fe5`) | `7,241 B` — **EXACT MATCH** |
| 2 | `src/utils/ssrRouteRenderer.ts` | **ALREADY APPLIED** (in `4923fe5`) | `50,441 B` — **EXACT MATCH** |
| 3 | `src/utils/seoMetadataManager.ts` | **ALREADY APPLIED** (in `4923fe5`) | `48,747 B` — **EXACT MATCH** |
| 4 | `src/utils/autoLanguage.ts` | **ALREADY APPLIED** (in `4923fe5`) | `13,345 B` — **EXACT MATCH** |
| 5 | `src/utils/securityHardening.ts` | **ALREADY APPLIED** (in `4923fe5`) | `29,115 B` — **EXACT MATCH** |
| 6 | `.gitignore` | **ALREADY APPLIED** (in `4923fe5`) | `152 B` — **EXACT MATCH** |
| 7 | `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` | **ALREADY APPLIED** (in `4923fe5`) | `248 lines / 9,293 B` — **EXACT MATCH** |

- **Pending code/test files to patch:** **0** (all 7 are already on `main` and live in Production).
- **Pending local-only documentation diff:** Only this updated revision of `docs/PHASE_9_7E_TEMP_BRANCH_GITHUB_GUIDE.md` (which records `98c1ab9` and the complete Step 3 before/after verification reference).
- **What this means for `phase-9-7b-ssr-fix`:** When you create `phase-9-7b-ssr-fix` from latest `main` (`98c1ab9`), all 7 files below will **already have the "After" code**. You do **NOT** need to re-edit Files 1–7. Use the Step 3 before/after blocks below to **verify** they are already in place (or as your exact patch guide if you ever branch from an older base). To open a verification PR from `phase-9-7b-ssr-fix` → `main` so GitHub Actions and Vercel Preview run cleanly, upload this updated `docs/PHASE_9_7E_TEMP_BRANCH_GITHUB_GUIDE.md` as your single safe non-code commit on `phase-9-7b-ssr-fix`.

---

## STEP 2 — CREATE TEMPORARY BRANCH `phase-9-7b-ssr-fix` IN GITHUB WEB UI

Because `phase-9-7b-ssr-fix` does **not** exist yet, create it cleanly from the latest verified `main` (`98c1ab9`):

1. Open your repository in a browser:  
   **`https://github.com/Raja9373/visaapply.org`**
2. Look at the **top-left branch dropdown** above the file list and confirm it shows **`main`** at latest commit **`98c1ab9`** (`docs: update Phase 9.7 documentation`).
3. Click the **`main`** branch dropdown.
4. In the **"Find or create a branch..."** input box, type the exact branch name:
   ```text
   phase-9-7b-ssr-fix
   ```
5. Click **"Create branch: `phase-9-7b-ssr-fix` from `main`"**.
6. Confirm:
   - The top-left branch selector now reads **`phase-9-7b-ssr-fix`**.
   - The browser URL contains **`/tree/phase-9-7b-ssr-fix`**.
   - You **never** edit files while the selector shows `main` or `visaapply-staging`.

---

## STEP 3 — EXACT PATCH & VERIFICATION INSTRUCTIONS FOR ALL 7 FILES

> **Status Reminder:** All 7 files below are **ALREADY APPLIED on `main` (`98c1ab9`)**, so when you create `phase-9-7b-ssr-fix` from `main`, every file already contains the **After** code.
> - **Do NOT re-apply edits that are already present** (GitHub will show zero changes).
> - Use the exact Before/After code below to **verify** each file on `phase-9-7b-ssr-fix`, OR to apply the exact edit safely via GitHub Web UI if a file ever still shows the **Before** code.
> - **Safe GitHub Web UI Editing Pattern (Files 1–6 only):** Open the file on **`phase-9-7b-ssr-fix`** → confirm the top-left branch says **`phase-9-7b-ssr-fix`** → click the **pencil icon (`Edit this file`)** → apply only the exact replacement → inspect the **Preview / diff** → click **Commit changes...** → confirm **"Commit directly to the `phase-9-7b-ssr-fix` branch"** (NEVER `main`) → commit.

---

### File 1 of 7: `api/render.ts`
- **Exact Path:** `api/render.ts`
- **Status on `main` (`98c1ab9`):** **Already applied** (`3` lines changed in `4923fe5`)
- **GitHub Web UI Safety:** Very safe (3-line targeted edit)
- **Direct URL (`phase-9-7b-ssr-fix`):** `https://github.com/Raja9373/visaapply.org/blob/phase-9-7b-ssr-fix/api/render.ts`
- **Exact Source Code — BEFORE (`7395289`):**
  ```ts
  import fs from 'fs';
  import path from 'path';
  import { renderRouteSsrPayload, injectSsrPayloadIntoHtml } from '../src/utils/ssrRouteRenderer';
  import { extractAdminTokenFromRequest, verifyAdminToken } from '../src/utils/authSecurity';
  import { applySecurityHeaders } from '../src/utils/securityHardening';
  ```
- **Exact Source Code — AFTER (`4923fe5` / `98c1ab9` / Current Workspace):**
  ```ts
  import fs from 'fs';
  import path from 'path';
  import { renderRouteSsrPayload, injectSsrPayloadIntoHtml } from '../src/utils/ssrRouteRenderer.js';
  import { extractAdminTokenFromRequest, verifyAdminToken } from '../src/utils/authSecurity.js';
  import { applySecurityHeaders } from '../src/utils/securityHardening.js';
  ```
- **Verification Step:** Open `api/render.ts` on `phase-9-7b-ssr-fix` and confirm lines 3, 4, and 5 all end with `.js';`.

---

### File 2 of 7: `src/utils/ssrRouteRenderer.ts`
- **Exact Path:** `src/utils/ssrRouteRenderer.ts`
- **Status on `main` (`98c1ab9`):** **Already applied** (`1` line changed in `4923fe5`)
- **GitHub Web UI Safety:** Very safe (1-line targeted edit)
- **Direct URL (`phase-9-7b-ssr-fix`):** `https://github.com/Raja9373/visaapply.org/blob/phase-9-7b-ssr-fix/src/utils/ssrRouteRenderer.ts`
- **Exact Source Code — BEFORE (`7395289`):**
  ```ts
  import {
    resolveStaticRouteSeoMetadata,
    normalizeCanonicalUrl,
    inspectRouteIndexingDirective,
    resolveValidOgImageUrl,
    getHreflangAlternatesForRoute,
  } from './seoMetadataManager';
  ```
- **Exact Source Code — AFTER (`4923fe5` / `98c1ab9` / Current Workspace):**
  ```ts
  import {
    resolveStaticRouteSeoMetadata,
    normalizeCanonicalUrl,
    inspectRouteIndexingDirective,
    resolveValidOgImageUrl,
    getHreflangAlternatesForRoute,
  } from './seoMetadataManager.js';
  ```
- **Verification Step:** Open `src/utils/ssrRouteRenderer.ts` on `phase-9-7b-ssr-fix` and confirm line 7 reads `} from './seoMetadataManager.js';`.

---

### File 3 of 7: `src/utils/seoMetadataManager.ts`
- **Exact Path:** `src/utils/seoMetadataManager.ts`
- **Status on `main` (`98c1ab9`):** **Already applied** (`2` lines changed in `4923fe5`)
- **GitHub Web UI Safety:** Very safe (2-line targeted edit)
- **Direct URL (`phase-9-7b-ssr-fix`):** `https://github.com/Raja9373/visaapply.org/blob/phase-9-7b-ssr-fix/src/utils/seoMetadataManager.ts`
- **Exact Source Code — BEFORE (`7395289`):**
  ```ts
  import { CANONICAL_15_LANG_CODES } from '../i18n/config';
  import { getCanonicalBaseOrigin, getLangFromUrlPath } from './autoLanguage';
  ```
- **Exact Source Code — AFTER (`4923fe5` / `98c1ab9` / Current Workspace):**
  ```ts
  import { CANONICAL_15_LANG_CODES } from '../i18n/config.js';
  import { getCanonicalBaseOrigin, getLangFromUrlPath } from './autoLanguage.js';
  ```
- **Verification Step:** Open `src/utils/seoMetadataManager.ts` on `phase-9-7b-ssr-fix` and confirm lines 1 and 2 end with `../i18n/config.js';` and `./autoLanguage.js';`.

---

### File 4 of 7: `src/utils/autoLanguage.ts`
- **Exact Path:** `src/utils/autoLanguage.ts`
- **Status on `main` (`98c1ab9`):** **Already applied** (`2` lines changed in `4923fe5`)
- **GitHub Web UI Safety:** Very safe (2-line targeted edit)
- **Direct URL (`phase-9-7b-ssr-fix`):** `https://github.com/Raja9373/visaapply.org/blob/phase-9-7b-ssr-fix/src/utils/autoLanguage.ts`
- **Exact Source Code — BEFORE (`7395289`):**
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
- **Exact Source Code — AFTER (`4923fe5` / `98c1ab9` / Current Workspace):**
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
- **Verification Step:** Open `src/utils/autoLanguage.ts` on `phase-9-7b-ssr-fix` and confirm lines 8 and 9 end with `../i18n/config.js';` and `./seoMetadataManager.js';`.

---

### File 5 of 7: `src/utils/securityHardening.ts`
- **Exact Path:** `src/utils/securityHardening.ts`
- **Status on `main` (`98c1ab9`):** **Already applied** (`1` line changed in `4923fe5`)
- **GitHub Web UI Safety:** Very safe (1-line targeted edit)
- **Direct URL (`phase-9-7b-ssr-fix`):** `https://github.com/Raja9373/visaapply.org/blob/phase-9-7b-ssr-fix/src/utils/securityHardening.ts`
- **Exact Source Code — BEFORE (`7395289`):**
  ```ts
  import crypto from 'node:crypto';
  import fs from 'node:fs';
  import path from 'node:path';
  import { recordOperationalEvent, redactSensitiveData } from './operationalObservability';
  ```
- **Exact Source Code — AFTER (`4923fe5` / `98c1ab9` / Current Workspace):**
  ```ts
  import crypto from 'node:crypto';
  import fs from 'node:fs';
  import path from 'node:path';
  import { recordOperationalEvent, redactSensitiveData } from './operationalObservability.js';
  ```
- **Verification Step:** Open `src/utils/securityHardening.ts` on `phase-9-7b-ssr-fix` and confirm line 4 ends with `./operationalObservability.js';`.

---

### File 6 of 7: `.gitignore`
- **Exact Path:** `.gitignore`
- **Status on `main` (`98c1ab9`):** **Already applied** (`1` line added in `4923fe5`)
- **GitHub Web UI Safety:** Very safe (1-line append)
- **Direct URL (`phase-9-7b-ssr-fix`):** `https://github.com/Raja9373/visaapply.org/blob/phase-9-7b-ssr-fix/.gitignore`
- **Exact Source Code — BEFORE (`7395289`, lines 9–11):**
  ```gitignore
  test-results/
  playwright-report/
  backups/phase_9_6_recovery_snapshot/
  ```
- **Exact Source Code — AFTER (`4923fe5` / `98c1ab9` / Current Workspace, lines 9–12):**
  ```gitignore
  test-results/
  playwright-report/
  backups/phase_9_6_recovery_snapshot/
  .vercel/
  ```
- **Verification Step:** Open `.gitignore` on `phase-9-7b-ssr-fix` and confirm the final entry is `.vercel/`.

---

### File 7 of 7: `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` (248 Lines — Upload Only, Never Hand-Reconstruct)
- **Exact Path:** `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts`
- **Status on `main` (`98c1ab9`):** **Already applied** (`248` lines / `9,293 B` added in `4923fe5`, exact match with workspace)
- **Direct URL (`phase-9-7b-ssr-fix`):** `https://github.com/Raja9373/visaapply.org/blob/phase-9-7b-ssr-fix/tests/phase9_7b_vercel_ssr_esm_packaging.test.ts`
- **Exact Source Code — BEFORE (`7395289`):** File did not exist.
- **Exact Source Code — AFTER (`4923fe5` / `98c1ab9` / Current Workspace):** Complete `248`-line `@vercel/node` Lambda packaging + native Node.js ESM execution + Preview `noindex` + automatic `.vercel/` cleanup test suite.
- **Unsafe Manual Edit Warning:** **DO NOT manually reconstruct or retype this 248-line file in GitHub's web editor** (it contains nested backtick template literals that break easily if hand-edited).
- **Safe GitHub Web UI Procedure (Only if missing on a branch):**
  1. Export/download `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` directly from Google AI Studio.
  2. Open `https://github.com/Raja9373/visaapply.org/tree/phase-9-7b-ssr-fix/tests` and verify the branch dropdown says **`phase-9-7b-ssr-fix`**.
  3. Click **Add file → Upload files**, drag-and-drop `phase9_7b_vercel_ssr_esm_packaging.test.ts`, select **"Commit directly to the `phase-9-7b-ssr-fix` branch"**, and commit.
- **Verification Step:** Confirm `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` exists on `phase-9-7b-ssr-fix` with `248` lines (`9.08 KB` / `9,293 B`).

---

### Note on Large Phase 9.7 Markdown Reports & Untracked Files
- **Do NOT manually paste** large Phase 9.7 Markdown reports (they are already on `main` at `4923fe5`/`98c1ab9` anyway).
- **Never commit** `.env*`, secrets, credentials, `data_db/*`, `.vercel/`, `dist/`, `node_modules/`, `test-results/`, `playwright-report/`, `backups/phase_9_6_recovery_snapshot/`, or local runtime-seeded `content/` files.

---

## STEP 4 — PULL REQUEST PLAN (ONE OPEN, UNMERGED PR: `phase-9-7b-ssr-fix` → `main`)

> **Important Prerequisite Because `98c1ab9` Already Contains Files 1–7:**
> GitHub requires at least **1 commit difference** between `phase-9-7b-ssr-fix` and `main` to open a Pull Request. Because Files 1–7 are already identical on `main` (`98c1ab9`), if you want to open a verification PR right now to test Vercel Preview and GitHub Actions without touching code:
> 1. On **`phase-9-7b-ssr-fix`**, upload this updated `docs/PHASE_9_7E_TEMP_BRANCH_GITHUB_GUIDE.md` via `docs/` → **Add file → Upload files** (selecting **"Commit directly to the `phase-9-7b-ssr-fix` branch"**).

### How to Open the Single Unmerged Pull Request
1. Open **`https://github.com/Raja9373/visaapply.org/compare/main...phase-9-7b-ssr-fix`**.
2. Confirm the branch selectors at the top read EXACTLY:
   - **`base: main`** ← **`compare: phase-9-7b-ssr-fix`**
3. Inspect **Files changed** and confirm zero secrets, zero unintended edits, and zero changes to `visaapply-staging`.
4. Click **Create pull request**.
5. Enter:
   - **Title:** `[PREVIEW VERIFICATION — DO NOT MERGE] Phase 9.7E: Temporary branch Preview & CI verification (phase-9-7b-ssr-fix)`
   - **Description:**
     ```markdown
     ## Temporary Branch Preview Verification — KEEP OPEN AND UNMERGED

     - **Source branch:** `phase-9-7b-ssr-fix`
     - **Target branch:** `main`
     - **Purpose:** Verify Vercel Hobby Free Preview deployment, Preview `noindex` headers/canonical behavior, native Node.js ESM SSR resolution across core + 12 bilateral routes, and GitHub Actions CI gate without modifying Production or `visaapply-staging`.
     - **Hold Rule:** Keep this PR **OPEN and UNMERGED** pending remote verification and separate Production authorization.
     ```
6. Click **Create pull request** — and **STOP. DO NOT click "Merge pull request".**

### How to Check GitHub Actions & Vercel Preview on the Open PR
1. **GitHub Actions Check (`Editorial Pull Request Validation Gate` — `.github/workflows/editorial-pr-validation.yml`):**
   - Triggers **automatically** on every PR targeting `main` (including `phase-9-7b-ssr-fix` → `main`).
   - Open the PR **Checks** tab and wait for **`Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build`** to turn **green** (runs `npm run lint`, `npm run catalog:validate`, `npm run editorial:verify-github-config`, `scripts/validateEditorialPullRequest.ts`, `npm run build`, and `node --test --import tsx tests/*.test.ts`, including `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts`).
2. **Optional GitHub Actions Check (`Zero-Cost Staging & Preview Validation` — `.github/workflows/preview-staging-validation.yml`):**
   - Line 28 of this workflow filters automatic PR execution to `visaapply-staging`, so on a `phase-9-7b-ssr-fix` → `main` PR it will show as skipped automatically.
   - Once you have the real Vercel Preview URL below, you can run it manually at ₹0 via **Actions → Zero-Cost Staging & Preview Validation → Run workflow**, choosing branch **`phase-9-7b-ssr-fix`** and pasting the exact `https://<generated-preview-host>.vercel.app` URL (no trailing slash) into **`preview_url`**.
3. **Vercel Preview Check:**
   - Look on the PR **Conversation / Checks** section for the **Vercel** Preview check (`Details / Visit Preview`), or check **Vercel Dashboard → `visaapply-org` → Deployments → Preview** for branch **`phase-9-7b-ssr-fix`**.
   - Wait until status is **`Ready`** and copy the **exact generated `https://...vercel.app` URL** (never guess or invent a Preview URL).
   - **DO NOT** click **Promote to Production**.

---

## STEP 5 — VERCEL PREVIEW VERIFICATION PLAN

Once the real Vercel Preview URL is generated for `phase-9-7b-ssr-fix`, share the **PR URL**, **commit SHA**, and **exact generated Preview URL** in your next prompt so every item below can be independently verified against the live Preview deployment:

### 1. Core SSR Routes (4 Routes)
- `/immigration`
- `/immigration/us`
- `/in-to-ca-tourist`
- `/tools/visa-comparison`

### 2. Representative Bilateral Visa Routes (12 Routes)
- `/in-to-us`
- `/in-to-gb`
- `/in-to-au`
- `/in-to-de`
- `/us-to-gb`
- `/us-to-jp`
- `/gb-to-ca`
- `/ca-to-fr`
- `/au-to-sg`
- `/de-to-ae`
- `/in-to-us-work`
- `/in-to-ca-student`

### 3. Required Assertions on Every Preview Route (16/16 Routes)
- **HTTP Status & SSR:** Returns `HTTP 200` with full server-rendered HTML (`<main>`, route-specific `<h1>`, and `<script id="ssr-route-jsonld" type="application/ld+json">`).
- **Native Node.js ESM Resolution & Zero Runtime Crash:** `x-vercel-error` header absent; zero `ERR_MODULE_NOT_FOUND` errors in Vercel Preview Runtime Logs.
- **Preview Indexation Block (HTTP Header):** `X-Robots-Tag: noindex, nofollow, noarchive` present on every Preview response (and `Cache-Control` prevents public indexing/caching).
- **Preview Robots Meta & Canonical Behavior:**
  - `<meta name="robots" content="noindex, nofollow, noarchive" />` (plus `googlebot` / `bingbot` noindex directives).
  - `<link rel="canonical" href="https://www.visaapply.org/..." />` pointing strictly to canonical `https://www.visaapply.org` (never to `*.vercel.app`).
- **Optional Live Playwright E2E (via `workflow_dispatch` or local check against real Preview URL):**
  - `PREVIEW_URL=<actual-preview-url> npm run test:e2e:preview`
  - `PREVIEW_URL=<actual-preview-url> npm run test:e2e:preview:phase93`

---

## SAFETY CONFIRMATION (PHASE 9.7E)

- Zero remote writes, commits, pushes, branch creations, PR creations, or merges performed by AI Studio.
- Zero Production deployments or promotions triggered by AI Studio (`4923fe5` and `98c1ab9` were already pushed to `main` and deployed by Vercel prior to this read-only audit).
- `visaapply-staging` was not used or modified.
- Zero changes to DNS, domains, databases, Production environment variables, or paid services (**₹0 / $0**).
