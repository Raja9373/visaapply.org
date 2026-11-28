# VISAAPPLY.ORG — PHASE 9.9 GITHUB WEB UI RELEASE & PREVIEW GUIDE

**Repository:** `https://github.com/Raja9373/visaapply.org`  
**Verified Base Branch (`main`) HEAD SHA:** `2cd099072aeadf90ddd9d717208e08843d7fc077` (`2026-11-28T13:44:27Z` — `"docs: update phase 9.7 documentation"`)  
**Target Temporary Branch:** `phase-9-8-remediation` *(does not exist remotely yet; branch from `main` at `2cd099072aeadf90ddd9d717208e08843d7fc077`)*  
**Pull Request Plan:** **1 OPEN, UNMERGED PR** (`phase-9-8-remediation` → `main`)  
**Cost:** **$0** (GitHub Free + Vercel Hobby Free)

> **STRICT SAFETY RULES:**
> - **DO NOT** click **Push / Sync / Commit** in Google AI Studio while its GitHub panel points to `main`.
> - **DO NOT** commit directly to `main`.
> - **DO NOT** use, edit, or push to `visaapply-staging` (currently at `7395289a8fb6f503bc0d4c487961d0d729d98dab`).
> - **DO NOT** merge the Pull Request, force-push, or promote/deploy to Production.
> - **DO NOT** upload `.env*`, `data_db/*`, `backups/phase_9_6_recovery_snapshot/`, `dist/`, `node_modules/`, `test-results/`, `playwright-report/`, `.vercel/`, or runtime-seeded `content/in-to-ca-tourist.md` & `content/us-to-uk-tourist.md`.

---

## 1. Create Temporary Branch `phase-9-8-remediation` in GitHub Web UI

1. Open **`https://github.com/Raja9373/visaapply.org`** in your browser.
2. Confirm the top-left branch selector displays **`main`** at commit **`2cd0990`** (`2cd099072aeadf90ddd9d717208e08843d7fc077`).
3. Click the **`main`** dropdown.
4. Type the exact branch name into **"Find or create a branch..."**:
   ```text
   phase-9-8-remediation
   ```
5. Click **"Create branch: `phase-9-8-remediation` from `main`"**.
6. Verify the branch selector now shows **`phase-9-8-remediation`** and the URL ends with `/tree/phase-9-8-remediation`.

---

## 2. Exact Pending Release Inventory (Verified Against `origin/main` `2cd0990`)

- **Modified files:** `49`
- **New release files:** `8` (`3` pages, `1` Node test, `1` Playwright E2E spec, `3` Phase 9.8/9.9 docs)
- **Obsolete files to delete from `public/`:** `86` legacy quarantined sitemap XML chunks (`public/sitemap-*.xml` outside `public/sitemaps-static/`)
- **Untouched protected files (zero diff vs `main`):** All `249` `data/countries/*.json` files, `data_db/immigration_hub.db*`, `backups/phase_b3_verified_*/immigration_hub_standalone.db`.

---

## 3. Safe Commit Grouping (Commit ONLY to `phase-9-8-remediation`)

Export the changed files from Google AI Studio (download project ZIP or export individual modified/new files), then upload in **5 logical commits** using **Add file → Upload files** on `https://github.com/Raja9373/visaapply.org/tree/phase-9-8-remediation` (always verify **"Commit directly to the `phase-9-8-remediation` branch"** is selected before committing!).

### Commit 1 — Serverless ESM Entrypoints, Runtime APIs & Security Headers (`19` files)
Upload into their matching folders (`api/`, `src/api/`, `src/utils/`, `src/data/`, and root):
- `vercel.json` *(adds global `/(.*)` and `/api/(.*)` security headers + `api/sitemap.ts` `includeFiles`)*
- `server.ts` *(true HTTP 404 & `noindex, nofollow` SSR parity)*
- `api/admin.ts`, `api/ai-eligibility.ts`, `api/countries.ts`, `api/cron.ts`, `api/faq.ts`, `api/guides.ts`, `api/render.ts`, `api/sitemap.ts`
- `src/api/aiEligibility.ts`, `src/api/faq.ts`
- `src/utils/automationPipeline.ts`
- `src/data/canadaVisas.ts`, `src/data/defaultArticles.ts`, `src/data/fullVisaDatabase.ts`, `src/data/specialVisasAudit.ts`, `src/data/ukVisas.ts`, `src/data/usaVisas.ts`
- **Suggested Commit Message:** `fix(api,security): enforce Node ESM .js imports and global vercel.json security headers`

### Commit 2 — SSR 404/noindex, Multilingual RTL, Single JSON-LD & Tool SEO (`3` files)
- `src/utils/ssrRouteRenderer.ts` *(404 semantics, `uk -> gb` normalization, honest RTL/fallback banner, single `Organization` JSON-LD `@id`)*
- `src/utils/seoMetadataManager.ts` *(dedicated `/tools/visa-comparison` metadata, concise bilateral descriptions, `15`-lang `hreflang` gating, omit `<link rel="canonical">` on `noindex`/404)*
- `src/pages/NotFoundPage.tsx` *(new dedicated client 404 view)*
- **Suggested Commit Message:** `fix(seo,ssr): enforce true HTTP 404, honest RTL/hreflang, and single Organization JSON-LD`

### Commit 3 — Performance & Lazy Bundle Splitting (`14` files)
- `vite.config.ts` *(exclude heavy lazy chunks from Workbox SW precache)*
- `src/App.tsx` *(lazy-load legal/admin/404 views and trim duplicate entry views)*
- `src/pages/StaticLegalViews.tsx` *(new extracted lazy legal views)*
- `src/pages/AdminInlineViews.tsx` *(new extracted lazy admin views)*
- `src/pages/VisaMapPage.tsx` *(`countries-50m.json` → `countries-110m.json`)*
- `src/components/EligibilityChecker.tsx` *(on-click dynamic `jsPDF`)*
- `src/pages/BankStatementGuidePage.tsx`, `src/pages/CoverLetterGeneratorPage.tsx`, `src/pages/DummyTicketPage.tsx`, `src/pages/MultiCountryPlannerPage.tsx`, `src/pages/PassportSevaGuidePage.tsx`, `src/pages/SopGeneratorPage.tsx`, `src/pages/VisaRejectionAppealPage.tsx`, `src/pages/tools/DocumentChecklistPage.tsx` *(on-click dynamic `jsPDF`)*
- **Suggested Commit Message:** `perf(bundle): split legal/admin views, shrink geo-map to 110m, and lazy-load jsPDF`

### Commit 4 — Verified-Only Sitemaps & Obsolete Chunk Removal (`5` updated + `86` deleted)
- **Update/Upload (`5` files):**
  - `scripts/generateStaticSitemaps.ts`
  - `scripts/generateSitemaps.ts`
  - `public/sitemap-index.xml`
  - `public/sitemap_index.xml`
  - `public/sitemap.xml`
- **Delete (`86` obsolete legacy files in `public/`):**
  - Remove `public/sitemap-countries.xml`, `public/sitemap-categories.xml`, `public/sitemap-blogs.xml`, `public/sitemap-visas-1.xml` through `public/sitemap-visas-12.xml`, and `public/sitemap-routes-1.xml` through `public/sitemap-routes-70.xml` (all `86` obsolete root `public/sitemap-*.xml` chunks, leaving ONLY `public/sitemap-index.xml`, `public/sitemap_index.xml`, `public/sitemap.xml`, and `public/sitemaps-static/*.xml`).
  - *GitHub Web UI Note:* GitHub's web editor deletes only one file per commit (`... → Delete file`). If removing 86 files individually via the Web UI is impractical, clone your exported branch locally in an authenticated personal Git terminal outside AI Studio (`git checkout -b phase-9-8-remediation`), delete those 86 files in one commit (`rm public/sitemap-*.xml` while keeping `sitemap-index.xml`, `sitemap_index.xml`, `sitemap.xml`, and `sitemaps-static/`), verify `git diff --stat`, and `git push -u origin phase-9-8-remediation` (never pushing to `main`).
- **Suggested Commit Message:** `fix(seo,sitemap): publish verified-only 56-URL sitemaps and remove quarantined legacy chunks`

### Commit 5 — Phase 9.8/9.9 Tests, E2E Specs & Documentation (`16` files)
- `tests/phase9_8_master_remediation.test.ts` *(new)*
- `e2e/phase9_8_remediation.spec.ts` *(new)*
- Updated regression suites (`11` files):
  - `tests/phase43_remediation.test.ts`
  - `tests/phase45_remediation.test.ts`
  - `tests/phase4_static_runtime_parity.test.ts`
  - `tests/phase5a_public_migration_sitemap.test.ts`
  - `tests/phase5b_source_monitoring_pipeline.test.ts`
  - `tests/phase7_audit_seo_perf_a11y_security.test.ts`
  - `tests/phase8_final_integration_launch_readiness.test.ts`
  - `tests/phase9_2_vercel_preview_workflow.test.ts`
  - `tests/phase9_3_zero_cost_preview_validation.test.ts`
  - `tests/phase9_cloudflare_staging_readiness.test.ts`
  - `tests/phase_a_security.test.ts`
- Documentation (`3` files):
  - `docs/PHASE_9_8_LOCAL_REMEDIATION_REPORT.md` *(new)*
  - `docs/PHASE_9_9_GITHUB_RELEASE_GUIDE.md` *(new)*
  - `docs/PHASE_9_9_RELEASE_READINESS_REPORT.md` *(new)*
- **Suggested Commit Message:** `test,docs(phase9.8): add Vercel ESM packaging, E2E/a11y tests, and Phase 9.8/9.9 reports`

---

## 4. Diff Review Checklist (Before Opening PR)

Compare `https://github.com/Raja9373/visaapply.org/compare/main...phase-9-8-remediation` and confirm:
1. Total files changed matches the Phase 9.8/9.9 inventory (`49` modified + `8` new + `86` deleted `public/sitemap-*.xml`).
2. **Zero** changes to `data/countries/*`, `data_db/*`, or `backups/*`.
3. **Zero** `.env*`, API keys, passwords, `dist/`, `node_modules/`, `.vercel/`, `test-results/`, or runtime `content/in-to-ca-tourist.md` / `content/us-to-uk-tourist.md`.
4. `vercel.json` contains global `/(.*)` and `/api/(.*)` security headers with zero `noindex` on global `/(.*)`.

---

## 5. Create the Single Unmerged Pull Request (`phase-9-8-remediation` → `main`)

1. Open **`https://github.com/Raja9373/visaapply.org/compare/main...phase-9-8-remediation`**.
2. Confirm exact branch selectors:
   - **`base: main`** ← **`compare: phase-9-8-remediation`**
3. Click **Create pull request**.
4. Enter title and description:
   - **Title:** `[PREVIEW ONLY — DO NOT MERGE] Phase 9.8 Remediation: API ESM, Security Headers, 404/SEO, Verified Sitemaps & Bundle Splits`
   - **Description:**
     ```markdown
     ## Phase 9.8 Master Remediation — HOLD OPEN & UNMERGED FOR VERCEL PREVIEW

     - **Source branch:** `phase-9-8-remediation`
     - **Target branch:** `main`
     - **Scope:** Remediates all Phase 9.7F Production audit findings (`api/*.ts` native Node ESM, global `vercel.json` security headers, true HTTP 404 + noindex, multilingual/RTL SSR & single Organization JSON-LD, verified-only 56-URL public sitemaps, and bundle splitting).
     - **Hold Rule:** Keep OPEN and UNMERGED pending GitHub Actions pass and live Vercel Preview verification. Do not promote to Production.
     ```
5. Click **Create pull request** — and **STOP. DO NOT click "Merge pull request".**

---

## 6. Confirm GitHub Actions Status & Locate Vercel Preview URL

1. **GitHub Actions (Required Check):**
   - `.github/workflows/editorial-pr-validation.yml` runs automatically on every PR targeting `main`.
   - Open the PR **Checks** tab and confirm **`Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build`** completes green (`npm run lint`, `npm run catalog:validate`, `npm run editorial:verify-github-config`, `validateEditorialPullRequest.ts`, `npm run build`, and `node --test --import tsx tests/*.test.ts`).
   - Note: `.github/workflows/preview-staging-validation.yml` skips automatic PR runs when the PR does not involve `visaapply-staging`; once you have the Vercel Preview URL below, you may manually trigger it at `$0` via **Actions → Zero-Cost Staging & Preview Validation → Run workflow** (`branch: phase-9-8-remediation`, `preview_url: <exact https://...vercel.app URL>`).
2. **Locate Exact Vercel Preview URL:**
   - Check the PR **Conversation / Checks** box for the **Vercel** deployment status → click **Visit Preview** (or open **Vercel Dashboard → `visaapply-org` → Deployments → Preview** for branch `phase-9-8-remediation`).
   - Wait for status **`Ready`** and copy the exact `https://<generated-subdomain>.vercel.app` URL.
   - **DO NOT** click **Promote to Production**.
