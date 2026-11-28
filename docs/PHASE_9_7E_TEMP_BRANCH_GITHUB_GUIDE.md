# Phase 9.7E — Temporary Branch Recovery & GitHub Web UI Guide (`phase-9-7b-ssr-fix`)

**Project:** VisaApply.org — Global Visa Portal  
**Repository:** `Raja9373/visaapply.org`  
**Workflow:** `Google AI Studio → GitHub temporary branch → Pull Request to main → Vercel Preview → Remote verification → Separate Production authorization`  
**Budget:** ₹0 / $0 (Google AI Studio + GitHub Free + Vercel Hobby Free)  
**Target Temporary Branch:** `phase-9-7b-ssr-fix` (replaces `visaapply-staging`, which is **not used or modified**)  
**Audit Date (Verified Remotely):** 2026-11-28

---

## 1. Critical Live Remote Discovery (Verified Read-Only)

Before creating any branch or applying manual edits, a live read-only inspection of `Raja9373/visaapply.org` and `https://www.visaapply.org` revealed a **critical state update** compared to the earlier `7395289` report:

| Item | Verified Live State |
| :--- | :--- |
| **Repository** | `Raja9373/visaapply.org` (public) |
| **Latest `origin/main` SHA** | `4923fe5d3ad5f7fc53d8d84bd17bc88966f666a9` (`protected: true`, committed `2026-11-28T13:10:20Z`) |
| **Latest `main` Commit Message** | `refactor: add explicit .js extensions for ESM imports` |
| **Previous `main` Parent SHA** | `7395289a8fb6f503bc0d4c487961d0d729d98dab` |
| **`phase-9-7b-ssr-fix` Branch Exists?** | **NO (`false`)** |
| **`visaapply-staging` Branch** | Exists at `7395289a8fb6f503bc0d4c487961d0d729d98dab` (**untouched; not used in Phase 9.7E**) |
| **Open or Closed Pull Requests** | **0** |
| **Vercel Production Deployment for `4923fe5`** | `6qmDFsyws3wDRGYFcwKDcVrt6JQL` — Status: **`success`** (`"Deployment has completed"`, `2026-11-28T13:11:24Z`) |
| **Live Production SSR Check (16/16 Routes)** | **16/16 PASS (`HTTP 200`, zero `x-vercel-error`, canonical + JSON-LD + H1 + `index, follow`)** |

### What Already Landed on `origin/main` (`4923fe5`)

Every single Phase 9.7B and Phase 9.7C code, config, and test file is **already committed on `origin/main` (`4923fe5`) with 100% byte-for-byte parity** to the local AI Studio workspace:

1. `.gitignore` (`152 B` — **EXACT MATCH**; already contains `.vercel/`)
2. `api/render.ts` (`7,241 B` — **EXACT MATCH**; explicit `.js` imports on lines 3–5)
3. `src/utils/ssrRouteRenderer.ts` (`50,441 B` — **EXACT MATCH**; explicit `.js` import on line 7)
4. `src/utils/seoMetadataManager.ts` (`48,747 B` — **EXACT MATCH**; explicit `.js` imports on lines 1–2)
5. `src/utils/autoLanguage.ts` (`13,345 B` — **EXACT MATCH**; explicit `.js` imports on lines 8–9)
6. `src/utils/securityHardening.ts` (`29,115 B` — **EXACT MATCH**; explicit `.js` import on line 4)
7. `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` (`9,293 B` — **EXACT MATCH**; full `@vercel/node` + native Node.js ESM test with `.vercel/` cleanup)

Additionally, 3 documentation files landed in `4923fe5`:
- `docs/PHASE_9_7_CONSOLIDATED_REMOTE_VERIFICATION_REPORT.md`
- `docs/PHASE_9_7B_SSR_500_ROOT_CAUSE_AND_FIX_REPORT.md`
- `docs/PHASE_9_7C_STAGING_PREVIEW_REPORT.md`

### Live Production Verification (Read-Only HTTP Check — `16/16 PASS`)

All 4 previously broken core SSR routes and 12 representative bilateral visa routes were checked read-only against `https://www.visaapply.org` and now return **`HTTP 200`** with full SSR markup and zero `ERR_MODULE_NOT_FOUND` errors:

- **Core SSR routes (4/4 `HTTP 200`):** `/immigration`, `/immigration/us`, `/in-to-ca-tourist`, `/tools/visa-comparison`
- **Representative bilateral routes (12/12 `HTTP 200`):** `/in-to-us`, `/in-to-gb`, `/in-to-au`, `/in-to-de`, `/us-to-gb`, `/us-to-jp`, `/gb-to-ca`, `/ca-to-fr`, `/au-to-sg`, `/de-to-ae`, `/in-to-us-work`, `/in-to-ca-student`
- Every tested route returned `x-vercel-error: none`, `x-robots-tag: index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`, `<link rel="canonical">`, JSON-LD (`application/ld+json`), and `<h1>`.

---

## 2. Exact Pending Files & Manual-Edit Safety Assessment

### Pending Code / Test Files
- **0 pending Phase 9.7B / 9.7C code, config, or test files.** All 7 target files are already byte-identical on `origin/main` (`4923fe5`).

### Pending Local-Only Documentation Files
Only documentation files created after `4923fe5` exist solely in the local workspace:
1. `docs/PHASE_9_7D_GITHUB_STAGING_WEB_GUIDE.md` (superseded by this Phase 9.7E guide; optional)
2. `docs/PHASE_9_7E_TEMP_BRANCH_GITHUB_GUIDE.md` (this file — safe documentation-only commit if you want to trigger a live PR + Vercel Preview + GitHub Actions verification run on `phase-9-7b-ssr-fix`)

*(Note: Never manually edit or commit untracked runtime-seeded markdown cache files if any appear in local `content/` unless explicitly part of an editorial content PR.)*

### Unsafe Manual Edits Assessment
- **Manual web-editor paste of `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` (247 lines):** If you ever need to add a large multi-hundred-line TypeScript test file via GitHub Web UI, **do NOT hand-type or copy-paste it line by line** — use **Add file → Upload files** to avoid indentation/escaping corruption. (Not needed now because this file is already byte-identical on `main` at `4923fe5`.)
- **Re-applying the 7 Phase 9.7B/9.7C edits on top of `main` (`4923fe5`):** Unnecessary and would produce zero diff because all 7 files are already present on `main`.
- **AI Studio Push/Sync button:** **Do NOT click** while AI Studio's GitHub panel is bound to `main`, as `main` is protected and directly triggers Production deployments.
- **`visaapply-staging` branch:** **Do NOT edit, push to, or open a PR from `visaapply-staging`.**

---

## 3. Beginner-Friendly GitHub Web UI Guide: Create `phase-9-7b-ssr-fix`, Open an Unmerged PR & Verify Vercel Preview

Because `4923fe5` is already on `main`, **no code patches need to be re-applied**. However, if you still want to exercise the **Temporary Branch → Open PR → Vercel Preview → GitHub Actions** workflow right now without touching Production, follow these exact steps using only GitHub Web UI (₹0 / $0).

> **Important Safety Rules Before You Start**
> - Do **NOT** click **Merge pull request**.
> - Do **NOT** use `visaapply-staging`.
> - Do **NOT** use the AI Studio Push/Sync button.
> - Do **NOT** change branch protection rules, Vercel Production settings, DNS, or environment variables.

---

### Step 1 — Create Temporary Branch `phase-9-7b-ssr-fix` from `main` (`4923fe5`)

1. Open your repository in a browser:  
   `https://github.com/Raja9373/visaapply.org`
2. Confirm the branch dropdown at the top-left says **`main`** and the latest commit shown is **`4923fe5`** (`refactor: add explicit .js extensions for ESM imports`).
3. Click the **`main`** branch dropdown.
4. In the **"Find or create a branch..."** input box, type exactly:
   ```text
   phase-9-7b-ssr-fix
   ```
5. Click **"Create branch: `phase-9-7b-ssr-fix` from `main`"**.
6. Verify the top-left branch selector now displays **`phase-9-7b-ssr-fix`**.

---

### Step 2 — Add One Safe Non-Code Verification File (Only Needed Because All 7 Code Files Are Already on `main`)

GitHub will only let you open a Pull Request (and trigger a fresh Vercel Preview + GitHub Actions run) when `phase-9-7b-ssr-fix` is at least 1 commit ahead of `main`.

Since all 7 Phase 9.7B/9.7C code/test files are already identical on `main` (`4923fe5`), commit this documentation guide (`docs/PHASE_9_7E_TEMP_BRANCH_GITHUB_GUIDE.md`) to `phase-9-7b-ssr-fix`:

1. Make sure the top-left branch dropdown shows **`phase-9-7b-ssr-fix`** (NEVER `main`).
2. Click the **`docs`** folder.
3. Click **Add file** → **Upload files** (recommended) — or **Create new file** named `PHASE_9_7E_TEMP_BRANCH_GITHUB_GUIDE.md` — to add `docs/PHASE_9_7E_TEMP_BRANCH_GITHUB_GUIDE.md`.
4. Scroll to the **Commit changes** section at the bottom:
   - **Commit message:** `docs: add Phase 9.7E temporary branch verification guide`
   - **Target option:** Select **`Commit directly to the phase-9-7b-ssr-fix branch`**.
   - Double-check that it does **NOT** say `main`.
5. Click **Commit changes**.

*(Reference Check Only — if you want to visually confirm the 7 Phase 9.7B/9.7C files are already present on `phase-9-7b-ssr-fix`, open any of them on GitHub and verify: `.gitignore` ends with `.vercel/`; `api/render.ts` lines 3–5 import `../src/utils/ssrRouteRenderer.js`, `../src/utils/securityHardening.js`, `../src/utils/autoLanguage.js`; and `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts` exists.)*

---

### Step 3 — Open One Unmerged Pull Request (`phase-9-7b-ssr-fix` → `main`)

1. Go to the **Pull requests** tab:  
   `https://github.com/Raja9373/visaapply.org/pulls`
2. Click **New pull request**.
3. Set the branch selectors carefully:
   - **base:** `main`
   - **compare:** `phase-9-7b-ssr-fix`
4. Verify **Files changed** shows only the expected documentation file (no accidental edits to source code, workflows, or `visaapply-staging`).
5. Click **Create pull request**.
6. Fill in:
   - **Title:** `Phase 9.7E: Temporary branch preview & CI verification (phase-9-7b-ssr-fix)`
   - **Description:** `Non-merged verification PR to confirm Vercel Hobby Preview deployment, Preview noindex headers, and GitHub Actions CI gate on top of 4923fe5. Do NOT merge.`
7. Click **Create pull request** — and **STOP. Do NOT click Merge pull request.**

---

### Step 4 — Verify Automatic GitHub Actions & Vercel Preview Deployment

Wait 1–3 minutes on the open Pull Request page and verify both checks:

#### A. GitHub Actions Checks on the PR
1. **`Editorial Pull Request Validation Gate` (`.github/workflows/editorial-pr-validation.yml`)** — runs **automatically** on every PR targeting `main`, executing:
   - `npm run lint` (`tsc --noEmit`)
   - `npm run catalog:validate` (17 catalog checks)
   - `npm run editorial:verify-github-config`
   - `npx tsx scripts/validateEditorialPullRequest.ts`
   - `npm run build`
   - `node --test --import tsx tests/*.test.ts` (includes `tests/phase9_7b_vercel_ssr_esm_packaging.test.ts`, running the full `@vercel/node` packaging & native ESM test in CI!)
2. **Note on `Zero-Cost Staging & Preview Validation` (`.github/workflows/preview-staging-validation.yml`):**
   - Line 28 currently limits automatic PR runs to `visaapply-staging` (`github.base_ref == 'visaapply-staging' || github.head_ref == 'visaapply-staging'`).
   - To run it manually against your new Vercel Preview URL without modifying workflow code:
     1. Open **Actions** → **Zero-Cost Staging & Preview Validation** → **Run workflow**.
     2. Choose branch **`phase-9-7b-ssr-fix`**.
     3. Paste the exact `https://<your-preview>.vercel.app` URL (no trailing slash or path) into **`preview_url`**.
     4. Click **Run workflow** (runs free Playwright E2E + `X-Robots-Tag: noindex` checks against the live Preview URL).

#### B. Vercel Preview Deployment Checks
1. On the open Pull Request (or in **Vercel Dashboard → `visaapply-org` → Deployments → Preview**), locate the new Preview deployment for branch **`phase-9-7b-ssr-fix`**.
2. Wait until status is **Ready**, then copy the exact Preview URL (`https://<generated-preview-host>.vercel.app`).
3. Verify the Preview deployment (do **NOT** promote to Production):
   - **Preview Indexation Guard:** Confirm HTTP response header includes `X-Robots-Tag: noindex, nofollow, noarchive` and `<meta name="robots" content="noindex, nofollow, noarchive">` so search engines never index the Preview URL.
   - **4 Core SSR Routes return `HTTP 200` with full SSR HTML & zero errors:**
     - `/immigration`
     - `/immigration/us`
     - `/in-to-ca-tourist`
     - `/tools/visa-comparison`
   - **Representative Bilateral Routes return `HTTP 200`:**
     - `/in-to-us`, `/in-to-gb`, `/in-to-au`, `/in-to-de`, `/us-to-gb`, `/us-to-jp`, `/gb-to-ca`, `/ca-to-fr`, `/au-to-sg`, `/de-to-ae`, `/in-to-us-work`, `/in-to-ca-student`
   - **Vercel Runtime Logs (Preview Deployment):** Confirm zero `ERR_MODULE_NOT_FOUND` errors.
4. Share the generated Preview URL and PR number back in Google AI Studio if you want an automated read-only remote verification audit of the Preview deployment.

---

## 4. Reusable Reference: Applying Future Code Changes via a Temporary Branch (GitHub Web UI)

For future phases (such as hardening the remaining non-SSR serverless API routes like `api/admin.ts`, `api/countries.ts`, `api/cron.ts`, `api/ai-eligibility.ts`, `api/guides.ts`, and `api/faq.ts` for Node.js native ESM):

1. Always create a fresh descriptive temporary branch from latest `main` (never push directly to `main`, never reuse `visaapply-staging`).
2. For small targeted edits (1–15 lines), GitHub Web UI's pencil (**Edit this file**) button on the temporary branch is safe — always verify **"Commit directly to the `<temp-branch>` branch"**.
3. For new files or large files (100+ lines), always use **Add file → Upload files** on the temporary branch instead of manual copy-paste.
4. Open a PR targeting `main`, verify **both** GitHub Actions (`Editorial Pull Request Validation Gate`) and the live **Vercel Preview** deployment, and only merge after explicit Production approval.

---

## 5. Safety Confirmation

- **Remote writes performed in Phase 9.7E:** None (0 commits, 0 pushes, 0 branch creations, 0 PRs opened or merged).
- **Production changes performed in Phase 9.7E:** None. (Commit `4923fe5` and Vercel Production Deployment `6qmDFsyws3wDRGYFcwKDcVrt6JQL` were already live prior to Phase 9.7E and were verified read-only.)
- **`visaapply-staging` modified:** No (untouched).
- **Code/test/workflow files modified in Phase 9.7E:** None.
- **Cost incurred:** ₹0 / $0.
