# VISAAPPLY.ORG — PHASE 9.11 CI DEPENDENCY COMPATIBILITY REMEDIATION REPORT

**Project:** VisaApply.org (`https://www.visaapply.org`)  
**Repository:** `Raja9373/visaapply.org`  
**Audit & Remediation Timestamp (UTC):** 2026-11-28T15:59Z  
**Execution Mode:** Isolated Local Workspace Remediation & Verification (Zero Remote Pushes, Zero PRs, Zero Merges, Zero Production Deploys)  
**Cost Incurred:** `$0`

---

## 1. Root Cause Audit (`46160585175` GitHub Actions Failure)

### 1.1 Remote Run Verification (`https://api.github.com/repos/Raja9373/visaapply.org/actions/runs/46160585175/jobs`)
- **Workflow:** `Validate Canonical Catalog & Verify Atomic Regeneration` (`.github/workflows/validate-and-regenerate-catalog.yml`, Node.js `22`)
- **Step 1–3 (`Set up job`, `Checkout repository`, `Setup Node.js 22`):** `success`
- **Step 4 (`Install dependencies (lockfile-safe)`):** **`failure`**
- **Steps 5–21 (`lint`, `catalog:validate`, `regenerate-safe`, `build`, `tests/*.test.ts`, `quality-report`, artifact upload):** `skipped`

### 1.2 Local Reproduction & Dependency Graph Findings
Running `npm install --dry-run --no-audit --no-fund` on Node `v22.23.5` / npm `10.9.9` reproduced the exact failure:

```text
npm error code ERESOLVE
npm error ERESOLVE could not resolve
npm error While resolving: vite@8.3.5
npm error Found: esbuild@0.25.12
npm error node_modules/esbuild
npm error   dev esbuild@"^0.25.0" from the root project
npm error Could not resolve dependency:
npm error peerOptional esbuild@"^0.27.0 || ^0.28.0" from vite@8.3.5
```

- **Direct conflict:** `package.json` pinned `"esbuild": "^0.25.0"` in `devDependencies`, whereas `vite@^8.3.0` (`8.3.5` / `8.4.0`) declares `peerOptional esbuild: "^0.27.0 || ^0.28.0"`.
- **Why Bun passed locally while npm CI failed:** The repository previously tracked `bun.lock` (`bun install v1.4.4`) without a committed `package-lock.json`. All 5 GitHub Actions workflows fall back to `npm install --no-audit --no-fund` when `package-lock.json` is absent, and npm v7+ rejects explicit root dependencies that violate `peerOptional` version ranges.
- **Secondary peer check:** No other direct or transitive peer dependency conflicts exist across `vite@8.3.5`, `@vitejs/plugin-react@6.1.2`, `@tailwindcss/vite@4.3.3`, `vite-plugin-pwa@2.0.0`, `@vercel/node@28.0.1`, `tsx@4.23.15`, `react@19.3.1`, or `typescript@7.0.2`.
- **Governance & Vercel lockfile check:**
  - `.github/CODEOWNERS` line 55 explicitly tracks `/bun.lock @visaapply-org/platform-admins`, and `scripts/verifyGithubGovernanceConfig.ts` fails with `CODEOWNERS_MISSING_PATH` if `/bun.lock` is removed. Therefore `bun.lock` must remain on disk and stay synchronized with `package.json`.
  - `@vercel/build-utils` selects `package-lock.json` (`cliType = "npm"`) ahead of `bun.lock` when both exist, while keeping `bun.lock` updated prevents any lockfile-drift failure if Bun is ever invoked.

---

## 2. Exact Dependency, Lockfile & Workflow Changes

| Artifact | Action | Exact Change & Rationale |
|---|---|---|
| `package.json` | Modified (line 63) | Updated `"esbuild": "^0.25.0"` → `"esbuild": "^0.28.0"` in `devDependencies`. Preserves Vite 8 (`^8.3.0`) and satisfies `peerOptional esbuild@"^0.27.0 || ^0.28.0"`. Zero `--force` or `--legacy-peer-deps`. |
| `package-lock.json` | Created | Generated cleanly via `npm install --package-lock-only --no-audit --no-fund` (`lockfileVersion: 3`, `692` entries, locks `esbuild@0.28.2`, `vite@8.3.5`, `@vercel/node@28.0.1`). |
| `bun.lock` | Updated | Synced via `bun install --lockfile-only` (`793` packages) so `/bun.lock` matches `package.json` (`"esbuild": "^0.28.0"`) and satisfies `.github/CODEOWNERS` line 55. |
| `.github/workflows/*.yml` (`5` files) | Audited (unchanged) | All 5 workflows (`editorial-pr-validation.yml`, `preview-staging-validation.yml` both jobs, `validate-and-regenerate-catalog.yml`, `daily-source-monitoring.yml`, `propose-catalog-refresh-pr.yml`) already use `actions/setup-node@v4` (`node-version: '22'`) and `if [ -f package-lock.json ]; then npm ci; else npm install --no-audit --no-fund; fi`. With `package-lock.json` committed, all 5 workflows automatically run deterministic `npm ci`. |

---

## 3. Clean Install (`npm ci`) & Dependency Tree Verification

Executed in `/app/applet` on Node `v22.23.5` / npm `10.9.9` without `--force` or `--legacy-peer-deps`:

- **`npm ci --no-audit --no-fund`:** **PASS** (`added 640 packages in 27s`, exit code `0`, `better-sqlite3` native bindings built cleanly).
- **`npm ls --depth=0`:** **PASS** (exit code `0`; `esbuild@0.28.2`, `vite@8.3.5`, `@vercel/node@28.0.1`, `typescript@7.0.2`, `react@19.3.1`, `react-dom@19.3.1`, `@playwright/test@1.65.1`).
- **`npm ls` (full tree check for `ERR!`, `invalid`, `missing`, `extraneous`, `peer`):** **PASS** (0 errors).
- **`npm install --dry-run --no-audit --no-fund`:** **PASS** (exit code `0`, zero `ERESOLVE` errors).

---

## 4. Full Local Regression & E2E Validation Results

All checks ran locally **after** the final `package.json` / `package-lock.json` / `bun.lock` / `npm ci` changes:

| Check / Suite | Command | Outcome | Notes |
|---|---|---|---|
| TypeScript check | `npx tsc --noEmit` & `npm run lint` | **PASS** | 0 errors |
| Production build | `npm run build` | **PASS** | Built in `3.43s`; PWA v2.0.0 generated (`87` precached entries); `index` entry `583.63 kB` (`169.28 kB` gzip), `geo-map` `130.44 kB` (`48.60 kB` gzip) |
| Static catalog validation | `npm run catalog:validate` | **PASS (`17/17`)** | `249` countries (`14` active, `228` quarantined, `7` uninhabited), `61` official sources, `28` programs, `0` errors |
| GitHub governance audit | `npm run editorial:verify-github-config` | **PASS** | `27` CODEOWNERS rules verified (including `/bun.lock`), all 5 workflow security invariants valid |
| Editorial PR validator | `npm run editorial:validate-pr` | **PASS** | Static catalog valid, PII/secret scan clean, atomic dry-run passed |
| Full Node.js test suite | `node --test --import tsx tests/*.test.ts` | **PASS (`186/186`)** | `0` failed, `0` skipped; includes all `8` `@vercel/node` Lambda packaging & native Node.js ESM execution tests (`9.8.1b`), security headers (`9.8.2`), 404/noindex (`9.8.3`), SEO/RTL (`9.8.4`), sitemaps (`9.8.5`), bundle budgets (`9.8.6`), and CI workflow audit (`phase9_4`) |
| Playwright Phase 8 Critical Journeys & CWV/a11y | `npx playwright test e2e/phase8_critical_journeys.spec.ts` | **PASS (`11/11`)** | Desktop & Mobile CWV + `axe-core` WCAG 2.2 AA (`0` violations across all 5 audited views) |
| Playwright Phase 9.3 Preview SEO & Links | `npx playwright test e2e/phase9_3_zero_cost_preview.spec.ts` | **PASS (`2/2`)** | Desktop & Mobile 5 routes + `8/8` internal links checked (`0` broken) |
| Playwright Phase 9.8 Remediation E2E | `npx playwright test e2e/phase9_8_remediation.spec.ts` | **PASS (`2/2`)** | Desktop (`1440x900`) & Mobile (`390x844`) 9 target routes + `axe-core` + live HTTP check of all `16` SSR routes, true `404`, APIs & sitemaps |
| Protected files & artifacts cleanup | Filesystem check | **PASS** | `data_db/*`, `backups/phase_b3_*/*`, and `249` `data/countries/*.json` intact; `test-results/`, `playwright-report/`, `.vercel/` removed |

---

## 5. Remaining Warnings & Observations

1. **Remote GitHub Actions Status (Not Yet Executed Remotely):** Remote GitHub Actions has **not** re-run against these local edits because Phase 9.11 is strictly local (no push or PR created). Remote CI green status can only be confirmed after a separately authorized branch/PR triggers GitHub Actions.
2. **Pre-Existing `catalog:validate` Warnings (`2`):**
   - `228` countries remain `QUARANTINED` awaiting primary sovereign HTTPS verification.
   - `3` editorial drafts remain in `data/editorial/drafts/` and excluded from public sitemaps.
3. **Pre-Existing `vite build` Chunk Warnings:**
   - `fullVisaDatabase` (`2,961.17 kB`), `pdf-tools` (`600.46 kB`), and `index` (`583.63 kB`) exceed Vite's `500 kB` raw chunk notice; all remain within Phase 9.8 gzip/entry budgets (`169.28 kB` gzip entry) and lazy chunks remain excluded from Workbox precaching.
   - `[INEFFECTIVE_DYNAMIC_IMPORT]` notice for `marked.esm.js` (also statically imported by blog views).
4. **Transient Browser Navigation Timing Note:** During the initial combined Playwright run, one iteration of `e2e/phase9_8_remediation.spec.ts` observed Chromium aborting the `4000ms` deferred background editorial warmup (`index-editorial.cb677dc269.json`, `net::ERR_ABORTED`) when `page.goto()` navigated away right at the 4-second mark; re-running `e2e/phase9_8_remediation.spec.ts` passed `2/2` cleanly.
5. **External GitHub Org Reminder:** `editorial:verify-github-config` retains the informational reminder to verify `@visaapply-org/*` team slugs/permissions in live GitHub repository settings.

---

## 6. Next Step (Requires Explicit Separate Authorization)

When ready to validate remotely via GitHub Actions and Vercel Preview without pushing directly to `main`:
1. Commit `package.json`, `package-lock.json`, `bun.lock`, and `docs/PHASE_9_11_CI_DEPENDENCY_REMEDIATION_REPORT.md` to a temporary branch (e.g. `phase-9-11-ci-dependency-fix`).
2. Open a Pull Request targeting `main` and verify all GitHub Actions checks (`Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build` and `Validate Canonical Catalog & Verify Atomic Regeneration`) and Vercel Preview pass green before any merge.
