# VISAAPPLY.ORG — PHASE 9.4 REPORT
## GitHub Actions Verification & Zero-Cost Staging Preparation

- **Report Date:** 2026-11-25
- **Preserved Architecture:** `Google AI Studio → GitHub (main) → Vercel Hobby Free → VisaApply.org`
- **Budget:** **₹0 / $0 (100% ZERO-COST — Vercel Hobby Free + GitHub Free)**
- **Overall Phase 9.4 Status:** **`COMPLETE LOCALLY — EXTERNAL VERIFICATION PENDING`**

---

## 1. Live Read-Only GitHub Repository & `main` Protection Audit

Read-only unauthenticated GET audit of `https://api.github.com/repos/Raja9373/visaapply.org` (zero mutations, zero auth tokens):

- **Repository:** `Raja9373/visaapply.org` (**Public**, `default_branch: main`) — **Note:** Because the repository is public, GitHub Actions standard Linux runners (`ubuntu-latest`) are **100% free with unlimited minutes** on GitHub Free.
- **Branches on Remote (`GET /branches`):** `[{ name: "main", protected: true, sha: "9b2e3b3" }]`.
- **`main` Branch Protection Audit:**
  - `protected: true` is **confirmed** via public GitHub API.
  - Granular Classic Branch Protection toggles (`GET /branches/main/protection`) returned `HTTP 401 Requires authentication`. Therefore, individual rule settings shown in user screenshots (*Require a pull request before merging: ENABLED; Require approvals: DISABLED; Require status checks: DISABLED; Do not allow bypassing: ENABLED; Allow force pushes: DISABLED; Allow deletions: DISABLED*) are **`NOT VERIFIED`** via API and were **NOT** modified.
  - **Lockout Safety Note:** Because `Raja9373/visaapply.org` is a solo/owner repository with `Do not allow bypassing: ENABLED`, keeping `Require approvals: DISABLED` prevents self-lockout, and `Require status checks` must remain DISABLED until the exact check names are verified from an actual passing PR run on GitHub Actions.
- **Pull Requests on Remote (`GET /pulls?state=all`):** `0` PRs exist yet.

---

## 2. GitHub Actions Workflow Audit (All 5 Files Under `.github/workflows/`)

### Exact Workflow Filenames, Workflow Names, Job IDs & Job Names

| Filename | Workflow `name:` | Job ID | Job `name:` (Expected Status Check Name) | Triggers | Permissions | Live GitHub Actions Execution Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `.github/workflows/editorial-pr-validation.yml` | `Editorial Pull Request Validation Gate` | `editorial-pr-gate` | `Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build` | `pull_request` (`main`, `visaapply-staging`), `workflow_dispatch` | `contents: read` | **`NOT VERIFIED`** *(0 runs on GitHub yet)* |
| `.github/workflows/preview-staging-validation.yml` | `Zero-Cost Staging & Preview Validation` | `zero-cost-staging-checks`<br>`optional-live-preview-e2e` | `Zero-Cost Staging Validation (TS, Build, Regression, Catalog, Editorial & SEO)`<br>`Optional Live Vercel Preview E2E, Accessibility & CLS Check` | `pull_request` (`visaapply-staging`, `main` — gated strictly to staging-involved PRs), `workflow_dispatch` | `contents: read` | **`NOT VERIFIED`** *(0 runs on GitHub yet)* |
| `.github/workflows/validate-and-regenerate-catalog.yml` | `Validate Canonical Catalog & Verify Atomic Regeneration` | `validate-and-verify-regeneration` | `Validate Catalog, Run Pipeline Tests & Dry-Run Atomic Build` | `pull_request` (path-filtered), `push` (`main`, path-filtered), `workflow_dispatch` | `contents: read` | **FAILED ON LIVE RUN `45606785587`** *(2026-11-25T11:41:33Z, `push` to `main`)* — **Root Cause Fixed Locally in Phase 9.4** |
| `.github/workflows/daily-source-monitoring.yml` | `Daily Official Source Monitoring (03:00 AM IST)` | `monitor-official-sources` | `Monitor Official HTTPS Sources & Generate Evidence Report` | `schedule` (`30 21 * * *`), `workflow_dispatch` | `contents: read` | **`NOT VERIFIED`** *(0 runs yet; same lockfile bug fixed locally)* |
| `.github/workflows/propose-catalog-refresh-pr.yml` | `Propose Official Source Refresh Pull Request` | `propose-refresh-pr` | `Monitor Sources & Open Human-Review Pull Request` | `workflow_dispatch` only | `contents: write`, `pull-requests: write` | **`NOT VERIFIED`** *(0 runs yet; same lockfile bug fixed locally)* |

### Real Live GitHub Actions Failure Discovered & Fixed Locally
- Inspecting live GitHub Actions Run **`45606785587`** (`Validate Canonical Catalog & Verify Atomic Regeneration` on `push` to `main`, commit `9b2e3b3`) showed:
  - Step 1 `Set up job` → `success`
  - Step 2 `Checkout repository` → `success`
  - **Step 3 `Setup Node.js 22` → `failure`** (Steps 4–11 skipped)
- **Root Cause:** `validate-and-regenerate-catalog.yml`, `daily-source-monitoring.yml`, and `propose-catalog-refresh-pr.yml` specified `cache: 'npm'` in `actions/setup-node@v4` and ran bare `npm ci`, which **crashes immediately when `package-lock.json` is not committed** in the repository.
- **Phase 9.4 Safe Local Fix:** Removed `cache: 'npm'` and replaced bare `npm ci` with the lockfile-safe fallback (`if [ -f package-lock.json ]; then npm ci; else npm install --no-audit --no-fund; fi`) across all 3 affected workflows.
- **Verified Status Check Names:** Because **zero** PR runs have succeeded on GitHub Actions yet (the only run on record failed at Step 3 on `push`), exact PR status check names remain **`NOT VERIFIED`** via live execution. **Do NOT enable `Require status checks` on `main` yet** until after an authorized PR runs and reports green check names on GitHub.

---

## 3. Preview Workflow Audit (`.github/workflows/preview-staging-validation.yml`)

- **Gap Found:** In Phase 9.3, `preview-staging-validation.yml` only listed `pull_request: branches: [visaapply-staging]`, meaning a **PR from `visaapply-staging` → `main`** (whose base branch is `main`) would NOT have triggered `preview-staging-validation.yml`.
- **Phase 9.4 Fix Applied Locally:**
  - Added `main` alongside `visaapply-staging` under `pull_request.branches`, with an explicit job guard:
    `if: github.event_name == 'workflow_dispatch' || github.base_ref == 'visaapply-staging' || github.head_ref == 'visaapply-staging'`
  - Runs ONLY on staging-related PRs (`feature → visaapply-staging` or `visaapply-staging → main`) or manual `workflow_dispatch` — zero wasted runs on unrelated PRs.
  - Strict least-privilege `permissions: contents: read`, zero `secrets.*`, `concurrency: cancel-in-progress: true`, lockfile-safe install, runs `npm run lint`, `npm run catalog:validate`, `npm run editorial:verify-github-config`, `npm run editorial:validate-pr`, Preview unit tests (`phase9_2` + `phase9_3`), and `npm run build` (plus optional live `preview_url` Playwright E2E on `workflow_dispatch`).
  - Never deploys production and never modifies databases.
  - Live GitHub Actions execution remains **`NOT VERIFIED`** until pushed in an authorized phase.

---

## 4. Staging Branch (`visaapply-staging`) Status & Safe Preparation Instructions

- **Remote Existence Check (`GET /repos/Raja9373/visaapply.org/branches/visaapply-staging`):** Returned **`HTTP 404`** — **`visaapply-staging` DOES NOT EXIST REMOTELY**.
- **Local Git Check:** No `.git` directory exists in this container.
- **Status:** **`PENDING USER AUTHORIZATION`** (No branch was created or pushed).
- **Verified Vercel Settings (Preserved — Zero Modifications Made):**
  - Connected repo: `Raja9373/visaapply.org`
  - Production Branch: `main`
  - Preview Branch Tracking: Enabled (applies to all unassigned branches → pushing `visaapply-staging` will automatically create an isolated Vercel Hobby Free Preview Deployment, never touching Production).

### Exact Safe Creation Commands (Run ONLY After Explicit Authorization in Phase 9.5)
```bash
# Option A: Via GitHub Web UI (zero CLI risk to main)
# 1. Open https://github.com/Raja9373/visaapply.org
# 2. Click the branch dropdown ("main")
# 3. Type: visaapply-staging
# 4. Click "Create branch: visaapply-staging from main"

# Option B: Via local Git checkout synced with origin/main
git fetch origin
git checkout -b visaapply-staging origin/main
git push -u origin visaapply-staging
```

---

## 5. Vercel Environment-Variable Secret-Scope Audit Checklist

**Status:** **`NOT VERIFIED`** *(Partially observed from user screenshots only; Shared Environment Variables and full variable list have NOT been audited in Vercel Dashboard.)*

- **Observed from User Screenshots (Production-only scope):**
  - `GEMINI_API_KEY` → Production scope
  - `ADMIN_PASSWORD` → Production scope
- **Manual Owner Checklist (`Vercel Dashboard → Project Settings → Environment Variables` AND `Team/Account → Shared Environment Variables`):**
  1. [ ] Inspect **Project Environment Variables** AND **Shared Environment Variables** (ensure no shared variables leak into `Preview`).
  2. [ ] Confirm **ALL** production-only secrets are checked ONLY for **Production** (UNCHECKED for **Preview** and **Development**):
     - `GEMINI_API_KEY`
     - `ADMIN_PASSWORD`
     - `ADMIN_SESSION_SECRET`
     - `CRON_SECRET`
     - `RESEND_API_KEY`
     - `ADMIN_ALERT_EMAIL`
     - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
     - Any legacy database URLs (`DATABASE_URL`, `POSTGRES_URL`, `DIRECT_URL`, `NEON_*_DATABASE_URL`)
  3. [ ] Confirm zero `VITE_*` variables exist with sensitive values.
  4. [ ] Never paste or commit secret values in chat, logs, or Git.

---

## 6. Fresh Phase 9.4 Local Verification Results (vs. Historical Phase 9.3 Baseline)

| Check / Suite | Phase 9.3 Historical Baseline | Phase 9.4 Fresh Actual Result | Status |
| :--- | :---: | :---: | :---: |
| TypeScript (`tsc --noEmit`) | `0` errors | **`0` errors (PASS)** | **`COMPLETE`** |
| Production Build (`vite build`) | PASS | **PASS** | **`COMPLETE`** |
| Full Node Regression Suite (`node --test --import tsx tests/*.test.ts`) | `175/175` PASS | **`177/177` PASS (`0` failed)** *(+2 new Phase 9.4 workflow tests)* | **`COMPLETE`** |
| Static Catalog Validation (`npm run catalog:validate`) | `17/17` PASS | **`17/17` PASS (`0` errors)** | **`COMPLETE`** |
| GitHub Governance Config (`npm run editorial:verify-github-config`) | PASS | **PASS (`0` errors)** | **`COMPLETE`** |
| Editorial PR Validation (`npm run editorial:validate-pr`) | PASS | **PASS (`0` errors)** | **`COMPLETE`** |
| Baseline Preview E2E (`npm run test:e2e:preview`) | `4/4` PASS | **`4/4` PASS (54.4s)** *(max CLS `0.0528`)* | **`COMPLETE`** |
| Phase 9.3 Zero-Cost Desktop & Mobile E2E (`npm run test:e2e:preview:phase93`) | `2/2` PASS | **`2/2` PASS (51.0s)** *(`8/8` internal links OK, `0` broken, `0` critical/serious axe violations, `0` overflow, max CLS `0.0184`)* | **`COMPLETE`** |

---

## 7. Zero-Cost & Strict Safety Confirmations

- **Zero-Cost Confirmation:** **₹0 / $0 spent.** Preserved `Google AI Studio → GitHub (main) → Vercel Hobby Free → VisaApply.org`. Zero paid plans, zero paid APIs/databases/monitoring, zero Cloudflare migration.
- **Production Safety Confirmation:** **NONE** — zero changes to production code deployments, `main` branch, Vercel Production settings, custom domains, DNS, legacy sitemaps (`89`), `robots.txt`, or SQLite/backup databases.
- **Remote Branch / Push Confirmation:** **NONE** — zero commits pushed, zero remote branches created (`visaapply-staging` remains uncreated), zero PRs opened or merged, zero GitHub settings changed.

---

## 8. Exact Next Action Required & Phase 9.5 Recommendation

1. Complete the 4-item **Vercel Environment-Variable & Shared-Variable Audit Checklist** in Section 5 above (confirming no production secret is scoped to Preview).
2. Explicitly authorize **Phase 9.5 — Authorized `visaapply-staging` Creation, GitHub Actions Live PR Verification & Zero-Cost Vercel Hobby Preview Validation**:
   - Create and push `visaapply-staging` (carrying the Phase 9.4 lockfile-safe workflow fixes),
   - Open a draft/review PR from `visaapply-staging` → `main` (**without merging**) to verify actual green GitHub Actions execution and capture exact live status check names,
   - Verify the generated `https://*-git-visaapply-staging-*.vercel.app` Preview URL returns `X-Robots-Tag: noindex, nofollow, noarchive` and passes live Desktop/Mobile Playwright & CLS checks — all at **₹0 / $0** and completely separate from production.
