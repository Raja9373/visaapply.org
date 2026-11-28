# VISAAPPLY.ORG — PHASE 9.6 GITHUB PUSH ERROR RECOVERY REPORT

- **Date:** 2026-11-28
- **Repository:** `Raja9373/visaapply.org`
- **Production Branch:** `main` (Protected — `fa5e3c0a1355c017153e0b5ed7c51c9840bdc76d`)
- **Intended Staging Branch:** `visaapply-staging` (Not yet created remotely)
- **Hosting Workflow:** Google AI Studio → GitHub → Vercel Hobby Free → `https://www.visaapply.org`
- **Budget:** ₹0 / $0
- **Phase 9.6 Overall Status:** `COMPLETE LOCALLY` — Remote branch creation, push, PR, and live Preview deployment are `PENDING USER AUTHORIZATION` (Phase 9.7).

---

## Executive Status Summary

| Workstream | Status | Notes |
| --- | --- | --- |
| Previous recovery & Phase 9.4/9.5 report audit | `COMPLETE` | `docs/GITHUB_PUSH_ERROR_RECOVERY_REPORT.md` did not exist; performed full read-only diagnosis alongside Phase 9.4 and 9.5 reports. |
| Root cause confirmation of push error | `VERIFIED REMOTELY` | Confirmed `main` Classic Branch Protection blocked direct AI Studio pushes; secondary Playwright `test-results/` artifact was cleaned. |
| Preservation of Phase 9.4, 9.5 & SEO work | `VERIFIED REMOTELY` | All 13 prior files landed cleanly on `origin/main` (`fa5e3c0`); exact SHA-1 audit confirmed `0` overwritten or lost files. |
| Phase 9.6 CI workflow build-before-test fix | `COMPLETE LOCALLY` | Fixed test-before-build ordering in `editorial-pr-validation.yml` and `validate-and-regenerate-catalog.yml`. |
| Local safety backup snapshot | `COMPLETE LOCALLY` | `backups/phase_9_6_recovery_snapshot/` (21 preserved files, ~187 KB; zero secrets, zero DB files). |
| Unit, catalog, editorial, TS & production build | `COMPLETE LOCALLY` | `177/177` unit/integration tests, `17/17` catalog checks, `0` GitHub config errors, `0` TS errors, clean Vite/PWA build. |
| Local Playwright preview E2E suites | `COMPLETE LOCALLY` (Partial Pass) | `test:e2e:preview`: 3/4 passed (`net::ERR_ABORTED` on rapid route nav); `test:e2e:preview:phase93`: 1/2 passed (45s test timeout on 10th of 10 route×viewport checks). Tests left unmodified per policy. |
| Remote `visaapply-staging` creation & push | `PENDING USER AUTHORIZATION` | Strictly halted per Phase 9.6 Section 11 stop condition. |

---

## 1. Confirmed Root Cause of the Push Error

**Status:** `VERIFIED REMOTELY`

Recurring error reported in Google AI Studio:
> `Failed to push commit to GitHub: Request contains an invalid argument.`

### Confirmed Primary Cause
1. **GitHub Classic Branch Protection on `main` rejected direct commits:**
   - The `main` branch of `Raja9373/visaapply.org` had Classic Branch Protection enabled with **Require a pull request before merging** and **Do not allow bypassing the above settings** active.
   - Google AI Studio's GitHub integration attempts to write commits directly to the configured target branch via the GitHub API. When GitHub rejects a direct commit to a protected branch, AI Studio surfaces the generic API failure message: `Failed to push commit to GitHub: Request contains an invalid argument.`
   - **Proof (`VERIFIED REMOTELY`):** Once repository branch protection / owner bypass was temporarily accommodated by the user, Google AI Studio's integration immediately pushed all 13 changed files—including all 4 modified `.github/workflows/*.yml` files—in commit `fa5e3c0a1355c017153e0b5ed7c51c9840bdc76d` (`2026-11-28T10:26:59Z`). This rules out payload-size corruption, invalid paths, and missing GitHub `workflow` OAuth scope.

### Confirmed Secondary Factor (Already Cleaned)
2. **Stale generated Playwright test artifact tracked in commit `9b2e3b3`:**
   - Earlier local E2E runs created `test-results/.last-run.json`, which had been committed before `test-results/` and `playwright-report/` were added to `.gitignore`.
   - `test-results/` was removed from the workspace and added to `.gitignore` (now live on `origin/main` in `fa5e3c0`).

### Confirmed Historical GitHub Actions Failure (Related CI Issue Diagnosed & Fixed)
3. **Two CI bugs identified across prior and current audits:**
   - *Historical (Fixed in `fa5e3c0`):* Workflow runs `45606785587`, `45750592943`, `45935703504`, and `46102749023` failed on older commits (`c314224`, `9b2e3b3`) because workflows used `cache: 'npm'` and `npm ci` in a repository without `package-lock.json`. The lockfile-safe Phase 9.4 fix is now on `origin/main` (`fa5e3c0`).
   - *Newly Discovered in Phase 9.6 (Fixed Locally):* In `.github/workflows/editorial-pr-validation.yml` and `.github/workflows/validate-and-regenerate-catalog.yml`, `node --test --import tsx tests/*.test.ts` executed **before** `npm run build`. On a clean CI runner where `dist/` does not yet exist, 3 build-artifact tests (`phase45_remediation.test.ts`, `phase7_audit_seo_perf_a11y_security.test.ts`, `phase8_final_integration_launch_readiness.test.ts`) fail until `dist/` is built.

---

## 2. Exact Fix Implemented

**Status:** `COMPLETE LOCALLY` (Prior push blocker resolution `VERIFIED REMOTELY` in `fa5e3c0`)

1. **Workspace hygiene & artifact cleanup (`VERIFIED REMOTELY` + `COMPLETE LOCALLY`):**
   - Confirmed `test-results/` and `playwright-report/` are listed in `.gitignore` and verified `test-results/` is absent from `/app/applet` after all Phase 9.6 test runs.
   - Kept `public/sitemap.xml`, `public/sitemap-index.xml`, `public/robots.txt`, and production SEO headers (`X-Robots-Tag: noindex, follow` on XML sitemaps in `vercel.json`, `api/sitemap.ts`, `server.ts`) completely intact.
2. **CI Build-Before-Test Ordering Fix (`COMPLETE LOCALLY`):**
   - Updated `.github/workflows/editorial-pr-validation.yml` so `npm run build` runs **before** `node --test --import tsx tests/*.test.ts`.
   - Updated `.github/workflows/validate-and-regenerate-catalog.yml` so `npm run build` runs **before** `node --test --import tsx tests/*.test.ts`.
   - Verified `npm run editorial:verify-github-config` still passes with `0` errors after both edits.
3. **Branching & Push Policy Fix (`COMPLETE LOCALLY`):**
   - Documented the permanent zero-risk rule: **never push AI Studio changes directly to protected `main`**. Target the dedicated unprotected staging branch `visaapply-staging` (branched from verified `origin/main` `fa5e3c0`), validate Preview on Vercel Hobby Free, and merge via Pull Request only after explicit authorization.
4. **Windows 11 Git CLI Recovery Workflow Prepared (`COMPLETE LOCALLY`):**
   - Authored exact non-destructive PowerShell commands (Section 9 below) in case the user prefers local Git CLI or if AI Studio's UI cannot switch target branches directly.

---

## 3. Files Preserved

**Status:** `VERIFIED REMOTELY` (for `fa5e3c0` baseline) / `COMPLETE LOCALLY` (for local snapshot & runtime files)

An exact Git blob SHA-1 comparison was run across all **1,072 local workspace files** against all **1,070 remote blobs** on `origin/main` (`fa5e3c0`):
- **Modified vs `origin/main` prior to Phase 9.6 edits:** `0`
- **Deleted vs `origin/main`:** `0`
- **Local-only runtime-seeded markdown files preserved untouched:** `2`
  - `content/in-to-ca-tourist.md`
  - `content/us-to-uk-tourist.md`

All Phase 9.2, 9.3, 9.4, 9.5, and Google Search Console sitemap fixes are fully preserved:
- **GitHub Workflows (`.github/workflows/`):**
  - `.github/workflows/daily-source-monitoring.yml`
  - `.github/workflows/editorial-pr-validation.yml`
  - `.github/workflows/preview-staging-validation.yml`
  - `.github/workflows/propose-catalog-refresh-pr.yml`
  - `.github/workflows/validate-and-regenerate-catalog.yml`
- **Preview Staging, SEO & Config:**
  - `vercel.json`
  - `api/render.ts`
  - `api/sitemap.ts`
  - `server.ts`
  - `src/utils/seoMetadataManager.ts`
  - `playwright.config.ts`
  - `.gitignore`
- **Tests & E2E Specs:**
  - `tests/phase9_2_vercel_preview_workflow.test.ts`
  - `tests/phase9_3_zero_cost_preview_validation.test.ts`
  - `tests/phase9_4_github_actions_audit.test.ts`
  - `e2e/phase9_2_preview_staging.spec.ts`
  - `e2e/phase9_3_zero_cost_preview.spec.ts`
- **Documentation & Reports:**
  - `docs/VERCEL_PREVIEW_STAGING_GUIDE.md`
  - `docs/PHASE_9_2_VERCEL_PREVIEW_COMPLETION_REPORT.md`
  - `docs/PHASE_9_3_ZERO_COST_STAGING_VALIDATION_REPORT.md`
  - `docs/PHASE_9_4_GITHUB_ACTIONS_STAGING_PREP_REPORT.md`
  - `docs/PHASE_9_5_STAGING_VALIDATION_REPORT.md`
- **Production Assets & Backups Untouched:**
  - `public/sitemap.xml`, `public/sitemap-index.xml`, `public/robots.txt`
  - `data_db/` SQLite files and `backups/phase_b3_verified_2026-11-23T10-31-07-923Z_ac57/`

---

## 4. Files Modified (Phase 9.6 Delta vs `origin/main` `fa5e3c0`)

**Status:** `COMPLETE LOCALLY`

| File Path | Action | Reason |
| --- | --- | --- |
| `.github/workflows/editorial-pr-validation.yml` | Modified | Moved `npm run build` ahead of `node --test --import tsx tests/*.test.ts` so `dist/`-inspecting tests pass on clean CI runners. |
| `.github/workflows/validate-and-regenerate-catalog.yml` | Modified | Moved `npm run build` ahead of `node --test --import tsx tests/*.test.ts` so `dist/`-inspecting tests pass on clean CI runners. |
| `docs/PHASE_9_6_GITHUB_PUSH_RECOVERY_REPORT.md` | Created | Required Phase 9.6 recovery report with all 14 mandatory audit sections. |
| `backups/phase_9_6_recovery_snapshot/*` (21 files) | Created (Local Backup) | Safe local recovery snapshot (~187 KB) of all Phase 9.2–9.6 workflow, config, SEO, test, and report files. Do **not** include in Git commits unless explicitly desired. |

---

## 5. Backup Status

**Status:** `COMPLETE LOCALLY`

- **Location:** `backups/phase_9_6_recovery_snapshot/`
- **Contents:** `21` files totaling `~187 KB` (updated to include the two Phase 9.6 CI workflow ordering fixes):
  - All 5 `.github/workflows/*.yml` files
  - `vercel.json`, `api/render.ts`, `api/sitemap.ts`, `src/utils/seoMetadataManager.ts`, `playwright.config.ts`, `.gitignore`
  - `tests/phase9_2_vercel_preview_workflow.test.ts`, `tests/phase9_3_zero_cost_preview_validation.test.ts`, `tests/phase9_4_github_actions_audit.test.ts`
  - `e2e/phase9_2_preview_staging.spec.ts`, `e2e/phase9_3_zero_cost_preview.spec.ts`
  - `docs/VERCEL_PREVIEW_STAGING_GUIDE.md` and Phase 9.2–9.5 completion/validation reports
- **Security Hygiene Verified:** Zero `.env` files, zero secrets/tokens, zero database files (`*.db`, `*.sqlite`, WAL/SHM).
- **Pre-existing Phase B.3 verified backups:** Untouched.

---

## 6. Git Workspace Status

**Status:** `COMPLETE LOCALLY`

- **`.git` Directory in AI Studio Container (`/app/applet`):** **Absent** (standard for Google AI Studio sandbox workspaces; Git history is managed remotely on GitHub rather than via a local `.git` folder).
- **Git CLI Binary in Container:** `/usr/bin/git` (`git version 2.34.1`) is installed.
- **Safety Compliance:** No artificial `git init` was run and no fake Git history was fabricated (strictly honoring Section 5).
- **GitHub Credentials in Container:** Not present and not requested.

---

## 7. GitHub Remote State

**Status:** `VERIFIED REMOTELY` (Read-Only Inspection)

- **Repository:** `https://github.com/Raja9373/visaapply.org` (Public)
- **Existing Remote Branches:**
  - `main`: SHA `fa5e3c0a1355c017153e0b5ed7c51c9840bdc76d` (`2026-11-28T10:26:59Z`), `protected: true`.
- **Intended Staging Branch (`visaapply-staging`):** Does **not** exist remotely (`HTTP 404` confirmed). No history conflict exists.
- **Live Production Verification (`VERIFIED REMOTELY`):**
  - `https://www.visaapply.org/sitemap.xml` returns `HTTP/2 200` with `x-robots-tag: noindex, follow` (confirming Vercel Hobby Free successfully deployed commit `fa5e3c0`).
- **Remote Mutations Performed in Phase 9.6:** **NONE** (`0` branches created, `0` commits pushed, `0` PRs opened, `0` settings modified).

---

## 8. Whether AI Studio GitHub Integration Is Working

**Status:** `VERIFIED REMOTELY` — **WORKING (Subject to Branch Protection Rules)**

- **Verified Evidence:** Commit `fa5e3c0` (`2026-11-28T10:26:59Z`) pushed **13 files**—including 4 files under `.github/workflows/`—directly from Google AI Studio to `Raja9373/visaapply.org` once `main` branch protection allowed the commit.
- **Operational Constraint:** AI Studio's GitHub integration cannot bypass GitHub Classic Branch Protection on `main` when *"Require a pull request before merging"* + *"Do not allow bypassing"* are enforced.
- **Recommended Operating Mode:**
  - Keep `main` branch protection **strictly enabled**.
  - Do **not** repeatedly click Push targeting protected `main`.
  - Use the unprotected `visaapply-staging` branch (either via AI Studio branch selection if exposed, or via the Windows 11 Git CLI workflow below) for all staging commits, then open a PR into `main` only after Preview validation succeeds.
  - Do **not** disconnect the existing GitHub integration.

---

## 9. Safe Git Commit Groups & Windows 11 Git CLI Alternative

**Status:** `COMPLETE LOCALLY`

### Logical Commit Groups (Section 4 Compliance)
Because Phase 9.4, Phase 9.5, and the sitemap SEO fixes are already committed on `origin/main` (`fa5e3c0`), only the remaining Phase 9.6 delta needs to be committed onto `visaapply-staging`:

| Group | Scope | Status on `origin/main` (`fa5e3c0`) | Pending Files for `visaapply-staging` (Phase 9.7) |
| --- | --- | --- | --- |
| **Group A** | GitHub workflow corrections | Phase 9.4 lockfile fixes `VERIFIED REMOTELY` | `.github/workflows/editorial-pr-validation.yml`, `.github/workflows/validate-and-regenerate-catalog.yml` (Phase 9.6 build-before-test fix) |
| **Group B** | Preview staging configuration | `VERIFIED REMOTELY` (`vercel.json`, `api/render.ts`, `api/sitemap.ts`, `src/utils/seoMetadataManager.ts`, `.gitignore`) | None (already synced) |
| **Group C** | Tests and validation | `VERIFIED REMOTELY` (`tests/phase9_*`, `e2e/phase9_*`, `playwright.config.ts`) | None (already synced; tests untouched per Section 8) |
| **Group D** | Documentation and reports | Phase 9.2–9.5 reports `VERIFIED REMOTELY` | `docs/PHASE_9_6_GITHUB_PUSH_RECOVERY_REPORT.md` |

> **Commit Hygiene Guardrail:** Never stage `.env*`, credentials, SQLite/WAL/SHM databases, `test-results/`, `playwright-report/`, or `backups/phase_9_6_recovery_snapshot/`.

### Staging Branch Plan (`visaapply-staging`)
- **Base Ref:** Latest verified `origin/main` (`fa5e3c0a1355c017153e0b5ed7c51c9840bdc76d`).
- **Target Branch:** `visaapply-staging` (new branch — never push directly to `main`, never force-push).
- **Vercel Preview Behavior:** Pushing `visaapply-staging` on Vercel Hobby Free automatically creates an isolated Preview deployment with `X-Robots-Tag: noindex, nofollow` without touching `https://www.visaapply.org` Production.

### Windows 11 PowerShell / Git CLI Recovery Procedure (Execute ONLY After Phase 9.7 Authorization)

**Safe GitHub Authentication (No Shared Tokens or Passwords):**
- Install/verify Git for Windows (`git --version`) or GitHub CLI (`gh --version`).
- Authenticate locally via **Git Credential Manager (browser OAuth)** on first HTTPS push, or run `gh auth login` (choose `GitHub.com` → `HTTPS` → `Login with a web browser`). Never paste personal access tokens into chat, scripts, or committed files.

**Exact Windows 11 PowerShell Commands (For Phase 9.7 — Do NOT Run Yet Without Authorization):**

```powershell
# 1. Clone the existing repository cleanly (never fabricate history)
mkdir C:\Projects -ErrorAction SilentlyContinue
cd C:\Projects
git clone https://github.com/Raja9373/visaapply.org.git
cd visaapply.org

# 2. Verify latest origin/main and confirm visaapply-staging does not exist remotely
git fetch origin
git log -n 1 --oneline origin/main
git ls-remote --heads origin visaapply-staging

# 3. Create staging branch from verified origin/main
git checkout -b visaapply-staging origin/main

# 4. Copy ONLY the 3 Phase 9.6 files from your exported AI Studio workspace / backup:
#    - .github\workflows\editorial-pr-validation.yml
#    - .github\workflows\validate-and-regenerate-catalog.yml
#    - docs\PHASE_9_6_GITHUB_PUSH_RECOVERY_REPORT.md
#    (Do NOT copy .env*, test-results\, or backups\phase_9_6_recovery_snapshot\)

# 5. Verify status & diff before committing (must show ONLY the 3 expected files)
git status
git diff --stat

# 6. Group A commit: GitHub workflow build-before-test ordering fix
git add .github/workflows/editorial-pr-validation.yml .github/workflows/validate-and-regenerate-catalog.yml
git commit -m "ci(phase-9.6): run production build before dist-dependent tests in workflows"

# 7. Group D commit: Phase 9.6 recovery report
git add docs/PHASE_9_6_GITHUB_PUSH_RECOVERY_REPORT.md
git commit -m "docs(phase-9.6): add GitHub push error recovery report"

# 8. Push ONLY to visaapply-staging (NEVER main, NEVER --force)
git push -u origin visaapply-staging
```

---

## 10. Actual Test Results (Section 8 Validation Matrix)

**Status:** `COMPLETE LOCALLY` (Tests were **not** modified to force passes)

| # | Command | Result | Exact Observed Output / Details |
| --- | --- | --- | --- |
| 1 | `node --test --import tsx tests/*.test.ts` (pre-build) | **174 passed, 3 failed** | Fresh container lacked `dist/`. Failed: `phase45_remediation.test.ts`, `phase7_audit_seo_perf_a11y_security.test.ts`, `phase8_final_integration_launch_readiness.test.ts`. Exposed the CI ordering bug fixed in Phase 9.6. |
| 1b | `node --test --import tsx tests/*.test.ts` (post-build) | **PASS — 177 passed, 0 failed, 0 skipped** | All unit, catalog, security, SEO, Phase 9.2, 9.3, and 9.4 workflow audit tests passed cleanly. |
| 2 | `npm run catalog:validate` | **PASS — 17/17 checks passed, 0 failed** | `0` errors, `2` warnings, `287` files scanned. |
| 3 | `npm run editorial:verify-github-config` | **PASS — 0 errors** | Validated all 5 workflow files and `27` CODEOWNERS rules after the Phase 9.6 CI ordering fix. |
| 4 | `npm run editorial:validate-pr` | **PASS** | `Static Catalog Valid: true`, `PII & Secret Scan Clean: true`. |
| 5 | `npm run test:e2e:preview` | **3 passed, 1 failed** (57.5s) | **Passed (3):** Tests 2, 3, 4 (Desktop CLS max `0.0024`, Mobile CLS max `0.0184` on `/immigration/us`, `0` on `/`). **Failed (1):** Test 1 (`e2e/phase9_2_preview_staging.spec.ts:28:3`) failed at line 104 (`expect(failedCriticalRequests).toEqual([])`) with `["GET http://127.0.0.1:3000/catalog/manifest.json: net::ERR_ABORTED"]` because the loop uses `waitUntil: 'domcontentloaded'` and navigating quickly to the next route aborts an in-flight background fetch. Left unmodified per Section 8. |
| 6 | `npm run test:e2e:preview:phase93` | **1 passed, 1 failed** (58.2s) | **Passed (1):** Test 2 (`9.8s`, `8` internal links checked, `0` broken, zero sitemap/robots contamination). **Failed (1):** Test 1 (`e2e/phase9_3_zero_cost_preview.spec.ts:32:3`) hit the `45000ms` per-test timeout at line 86 (`waitUntil: 'networkidle'`) on the 10th of 10 route×viewport checks (`mobile` `/in-to-ca-tourist`). All 5 desktop routes (`CLS 0.0000–0.0024`) and first 4 mobile routes (`CLS 0.0000–0.0184`) passed with `0` JS/a11y/secret errors before the timeout fired. Left unmodified per Section 8. |
| 7 | `npx tsc --noEmit` | **PASS — 0 errors** | Exit code `0`. |
| 8 | `npm run build` | **PASS** | Exit code `0`; Vite + PWA built cleanly (`90` precached entries / `7670.26 KiB`). |

*Post-E2E cleanup verified:* `test-results/` was removed after Playwright runs so zero temporary test artifacts remain in the workspace.

---

## 11. Build and TypeScript Results

**Status:** `COMPLETE LOCALLY`

- **`npx tsc --noEmit`:** `PASS` (exit code `0`, `0` TypeScript errors).
- **`npm run build`:** `PASS` (exit code `0`; production client bundle + PWA service worker precached `90` entries / `7670.26 KiB`).
- **Applet Compilation & Lint Verification:** Co-verified via `compile_applet` and `lint_applet` at the end of Phase 9.6.

---

## 12. Production Safety Confirmation

**Status:** `VERIFIED REMOTELY` & `COMPLETE LOCALLY`

Confirmed zero prohibited actions were taken during Phase 9.6:
- No force push (`git push --force` never executed).
- No remote history reset.
- No remote branch created and no commits pushed.
- No Pull Request opened or merged into `main`.
- No Production or Preview deployment triggered.
- No DNS changes (`visaapply.org` / `www.visaapply.org` untouched).
- No Vercel Production Branch or environment variable changes.
- No production database modifications or deletions.
- No deletion of `public/sitemap.xml`, `public/sitemap-index.xml`, or `public/robots.txt`.
- Existing `main` branch protection preserved intact (`protected: true` confirmed via GitHub API).

---

## 13. ₹0 Cost Confirmation

**Status:** `COMPLETE`

- **Hosting:** Vercel Hobby Free (`₹0 / $0`) — no upgrade, no hosting migration.
- **Source Control & CI:** GitHub Free (`₹0 / $0`) on public repository `Raja9373/visaapply.org`.
- **Workflow:** Existing Google AI Studio → GitHub → Vercel Hobby Free flow preserved.
- **Paid APIs / Paid Databases / Paid Services Added:** **NONE (`₹0 / $0`)**.

---

## 14. Exact Next Action Required

**Status:** `PENDING USER AUTHORIZATION`

Per Phase 9.6 Section 11 (**Stop Condition**), all local diagnosis, CI workflow build-before-test fixes, backups, validations, and Windows 11 CLI recovery instructions are complete, and **all remote GitHub write operations are paused**.

**Next Phase:** **Phase 9.7 — Controlled Staging Branch Creation, GitHub Push & Live Preview Validation**

To proceed, please explicitly authorize Phase 9.7 and confirm:
1. Approval to create the remote `visaapply-staging` branch from verified `origin/main` (`fa5e3c0`) and push the 2 logical commit groups (**Group A**: the 2 workflow build-before-test fixes; **Group D**: `docs/PHASE_9_6_GITHUB_PUSH_RECOVERY_REPORT.md`) via the Windows 11 Git CLI workflow (or AI Studio targeting `visaapply-staging`).
2. Confirmation that `main` remains protected with no direct pushes and no merge until the Vercel Hobby Free Preview URL for `visaapply-staging` passes live validation.
3. *(Optional for Phase 9.7)* Whether you also want a small test-reliability hardening commit in Phase 9.7 to address the 2 Playwright timing issues observed locally (`net::ERR_ABORTED` on rapid route switching in `phase9_2_preview_staging.spec.ts` and the `45s` timeout across 10 serial `networkidle` navigations in `phase9_3_zero_cost_preview.spec.ts`) — kept strictly untouched during Phase 9.6 per Section 8.
