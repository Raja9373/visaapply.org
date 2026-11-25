# VISAAPPLY.ORG — GITHUB REPOSITORY SECURITY CONFIGURATION GUIDE
## Phase 6.1 Activation Checklist & Safe Test Pull Request Procedure

**Last Updated:** 2026-11-25  
**Enforcement Layer:** GitHub Organization Teams, CODEOWNERS, Branch Protection / Rulesets, and GitHub Actions  
**Current Live GitHub Status:** **NOT YET CONFIGURED / NOT EXTERNALLY VERIFIED** — every setting below must be applied and verified manually by a GitHub Organization / Repository Administrator.

---

## Pre-Requisite: Verify Your GitHub Organization Slug

The repository currently maps editorial roles to placeholder organization team handles prefixed with `@visaapply-org/*` in:
- `.github/CODEOWNERS`
- `data/editorial-governance/role-policy.json`
- `src/schemas/editorialGovernanceSchemas.ts`

If your live GitHub Organization slug is **not** `visaapply-org` (or if the repository is hosted under a personal account rather than a GitHub Organization):
1. Replace `@visaapply-org/` across all three files above with `@<YOUR_ACTUAL_ORG_SLUG>/` (note: GitHub **Team** CODEOWNERS require a GitHub Organization; personal repositories only support individual `@username` owners).
2. Re-run `npm run editorial:verify-github-config` and `node --test --import tsx tests/phase6_1_github_security_activation.test.ts` locally before pushing.

---

## Mandatory 13-Point GitHub Security Configuration Checklist

### 1. GitHub Organization Teams and Membership
- **Exact GitHub Navigation Path:**  
  `GitHub Organization` → `Teams` → `New team`  
  Then per team: `Repository` → `Settings` → `Collaborators and teams` → `Add teams`
- **Recommended Setting:**  
  Create five explicit teams with least-privilege repository roles:
  1. `platform-admins` (`@visaapply-org/platform-admins`) → Repository role: **Admin** (or **Maintain** + explicit ruleset bypass only if approved)
  2. `senior-immigration-reviewers` (`@visaapply-org/senior-immigration-reviewers`) → Repository role: **Write** (or **Maintain**)
  3. `country-editors` (`@visaapply-org/country-editors`) → Repository role: **Write** (PR creation & draft review; blocked from high-risk CODEOWNERS paths)
  4. `evidence-reviewers` (`@visaapply-org/evidence-reviewers`) → Repository role: **Write** (monitoring review only; blocked from high-risk CODEOWNERS paths)
  5. `read-only-auditors` (`@visaapply-org/read-only-auditors`) → Repository role: **Read** (never listed in `.github/CODEOWNERS`)
- **Reason:**  
  GitHub **silently ignores** any CODEOWNERS team that does not exist in the organization or does not have explicit repository **Write** (or higher) access. Mapping each editorial role to a dedicated team enforces real server-side authorization rather than frontend checks.
- **How to Verify It Is Active:**  
  Open `Repository` → `Settings` → `Collaborators and teams`, confirm all five teams appear with exact slugs and roles, and open `.github/CODEOWNERS` on GitHub's web UI — GitHub renders a green shield / zero syntax error warnings at the top of the file when all owners resolve validly.

---

### 2. Required Two-Factor Authentication (2FA) for Reviewers
- **Exact GitHub Navigation Path:**  
  `GitHub Organization` → `Settings` → `Authentication security` → `Two-factor authentication`
- **Recommended Setting:**  
  Enable **Require two-factor authentication for everyone in the `<org>` organization** and click **Save**.
- **Reason:**  
  Because GitHub PR approvals and merges authorize publication of statutory immigration information, compromised reviewer passwords without 2FA could allow unauthorized changes to legal eligibility, fees, or official URLs.
- **How to Verify It Is Active:**  
  Visit `GitHub Organization` → `People` → filter by `2FA: Disabled` and confirm **0 members** appear, and confirm the checkbox under `Authentication security` remains enabled.

---

### 3. Accurate CODEOWNERS Team References
- **Exact GitHub Navigation Path:**  
  `Repository` → `Code` → `.github/CODEOWNERS` (view directly on default branch `main`)
- **Recommended Setting:**  
  Ensure `.github/CODEOWNERS` on `main` matches the hardened Phase 6.1 file:
  - Catch-all `* @visaapply-org/platform-admins`
  - High-risk statutory, quarantine, verification, source-registry, published editorial, changelog, and catalog paths restricted **exclusively** to `@visaapply-org/senior-immigration-reviewers` and `@visaapply-org/platform-admins` (no lower-privilege team listed on the same line, preventing logical-OR bypasses)
  - Non-published drafts (`/data/editorial/drafts/`) mapped to `@visaapply-org/country-editors @visaapply-org/senior-immigration-reviewers`
  - Monitoring intake (`/data/monitoring/`) mapped to `@visaapply-org/evidence-reviewers @visaapply-org/senior-immigration-reviewers`
  - CI/scripts/tests/sitemaps/package manifests mapped exclusively to `@visaapply-org/platform-admins`
  - `@visaapply-org/read-only-auditors` **never** listed anywhere in `.github/CODEOWNERS`
- **Reason:**  
  In GitHub CODEOWNERS, multiple owners on one line act as **logical OR** (any one listed member satisfies review). Separating high-risk paths from lower-privilege teams eliminates privilege escalation, and GitHub's native parser validates that every handle resolves to a real team with write access.
- **How to Verify It Is Active:**  
  1. Locally run `npm run editorial:verify-github-config` and verify exit code `0`.
  2. On GitHub, view `.github/CODEOWNERS` on `main` and confirm GitHub displays **This CODEOWNERS file is valid** with zero yellow/red line warnings.

---

### 4. Main Branch Protection or Repository Ruleset
- **Exact GitHub Navigation Path:**  
  - **Recommended (Rulesets):** `Repository` → `Settings` → `Rules` → `Rulesets` → `New ruleset` → `New branch ruleset`  
  - **Classic Alternative:** `Repository` → `Settings` → `Branches` → `Add branch protection rule`
- **Recommended Setting:**  
  - Ruleset Name: `Protect main — Editorial Governance Gate`
  - Enforcement status: **Active**
  - Target branches: **Include default branch** (`main`)
  - Enable **Restrict deletions** and **Block force pushes**
- **Reason:**  
  Prevents history rewriting, accidental deletion of `main`, or rewriting of the append-only `data/editorial-governance/audit-log.json` chain.
- **How to Verify It Is Active:**  
  Open `Repository` → `Settings` → `Rules` → `Rulesets` (or `Branches`) and confirm the rule shows **Active** targeting `main`. Attempt `git push --force origin main` from a test checkout (or inspect branch shield icon on `Branches` page) and confirm rejection.

---

### 5. Require Pull Requests Before Merging
- **Exact GitHub Navigation Path:**  
  Inside `main` Ruleset (`Rules` → `Rulesets` → `Protect main`) → **Require a pull request before merging**  
  *(Classic: `Settings` → `Branches` → `main` → **Require a pull request before merging**)*
- **Recommended Setting:**  
  - Enable **Require a pull request before merging**
  - Required approvals: **1** minimum (or **2** if dual-senior sign-off is desired for legal releases)
  - Enable **Require conversation resolution before merging**
- **Reason:**  
  Forces every catalog, evidence, schema, script, and governance change through an auditable Pull Request with linked review decisions and commit history.
- **How to Verify It Is Active:**  
  Confirm on a test branch PR that the merge button remains blocked until the Pull Request review requirement shows a green checkmark, and verify direct commits to `main` are rejected by GitHub.

---

### 6. Require CODEOWNERS Review
- **Exact GitHub Navigation Path:**  
  Inside `main` Ruleset → **Require a pull request before merging** → **Require review from Code Owners**  
  *(Classic: `Settings` → `Branches` → `main` → **Require review from Code Owners**)*
- **Recommended Setting:**  
  Enable **Require review from Code Owners** (`checked`).
- **Reason:**  
  Without this checkbox enabled, `.github/CODEOWNERS` only auto-requests reviewers as a suggestion — any collaborator with write access could still approve and merge high-risk statutory immigration data.
- **How to Verify It Is Active:**  
  Open a test PR modifying a file owned by `@visaapply-org/platform-admins` or `@visaapply-org/senior-immigration-reviewers`. Have a member of a **non-owner** team (e.g., `country-editors`) submit an approval and confirm GitHub **still blocks merge** stating `Review required from Code Owners`.

---

### 7. Require the Actual Editorial PR Validation Status Check
- **Exact GitHub Navigation Path:**  
  Inside `main` Ruleset → **Require status checks to pass** → **Add checks**  
  *(Classic: `Settings` → `Branches` → `main` → **Require status checks to pass before merging**)*
- **Recommended Setting:**  
  - Enable **Require status checks to pass**
  - Enable **Require branches to be up to date before merging** (strict status checks)
  - Add exact required status check name:  
    `Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build`  
    *(Workflow: `.github/workflows/editorial-pr-validation.yml`, Job ID: `editorial-pr-gate`)*
- **Reason:**  
  Blocks merge whenever catalog schemas, official HTTPS URLs, evidence expiry, fail-closed risk classification, 5-gate quarantine release checks, SHA-256 append-only audit trail checks, CODEOWNERS config checks, PII/secret scans, automated tests, TypeScript lint, or production builds fail. Because `editorial-pr-validation.yml` intentionally has **no `paths:` filter**, this check runs and reports deterministically on every PR to `main` (including docs-only PRs) without deadlocking.
- **How to Verify It Is Active:**  
  Note: GitHub only lists a check in the search box after the workflow has run at least once on the repository. After pushing `.github/workflows/editorial-pr-validation.yml` and running it once (via `workflow_dispatch` or the Step 5 Test PR), add the exact check name above, then verify the PR checks box displays a **`Required`** badge next to `Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build`.

---

### 8. Restrict Direct Pushes to `main`
- **Exact GitHub Navigation Path:**  
  Inside `main` Ruleset → **Require a pull request before merging** + **Restrict updates** (or Classic: `Settings` → `Branches` → `main` → **Restrict who can push to matching branches** + **Do not allow bypassing the above settings**)
- **Recommended Setting:**  
  - Block all direct pushes to `main` by human users and bots.
  - Ensure **no** automated workflow (including `propose-catalog-refresh-pr.yml`) has permission to push directly to `main` — it pushes only to a proposal branch (`chore/official-source-monitoring-refresh`) and opens a human-review PR.
- **Reason:**  
  Direct pushes would bypass Pull Request validation, CODEOWNERS review, and the append-only audit trail comparison against `origin/main`.
- **How to Verify It Is Active:**  
  Confirm `git push origin main` from a non-bypass collaborator account fails with `remote: error: GH006: Protected branch update failed` (or `GH013: Repository rule violations found`).

---

### 9. Dismiss Stale Approvals When New Commits Are Pushed
- **Exact GitHub Navigation Path:**  
  Inside `main` Ruleset → **Require a pull request before merging** → **Dismiss stale pull request approvals when new commits are pushed**  
  *(Classic: `Settings` → `Branches` → `main` → **Dismiss stale pull request approvals when new commits are pushed**)*
- **Recommended Setting:**  
  Enable **Dismiss stale pull request approvals when new commits are pushed** (`checked`).
- **Reason:**  
  Prevents a bait-and-switch attack where a PR author gets Senior Immigration Reviewer approval on a benign change and then pushes a new commit altering fees, eligibility, or audit logs before merging.
- **How to Verify It Is Active:**  
  On a test PR, after an authorized reviewer approves, push one harmless whitespace/comment commit to the test branch and verify GitHub immediately marks the prior approval **Stale** and re-blocks the merge button.

---

### 10. Require Approval From Someone Other Than the PR Author
- **Exact GitHub Navigation Path:**  
  Inside `main` Ruleset → **Require a pull request before merging** → **Require approval of the most recent reviewable push**  
  *(Classic: `Settings` → `Branches` → `main` → **Require approval of the most recent reviewable push**)*
- **Recommended Setting:**  
  Enable **Require approval of the most recent reviewable push** (`checked`), in addition to GitHub's native ban on approving your own Pull Request.
- **Reason:**  
  Prevents a reviewer who pushed the final commit onto someone else's PR from approving their own code, reinforcing the Phase 6 engine's `SELF_APPROVAL_FORBIDDEN_FOR_HIGH_RISK` control at the GitHub platform level.
- **How to Verify It Is Active:**  
  Verify the checkbox is active in the `main` Ruleset and confirm in a test PR that the last pusher cannot satisfy the approval gate themselves.

---

### 11. Prevent Bypassing Required Protections Except Explicitly Authorized Administrators
- **Exact GitHub Navigation Path:**  
  - **Rulesets:** `Repository` → `Settings` → `Rules` → `Rulesets` → `Protect main` → **Bypass list**  
  - **Classic:** `Repository` → `Settings` → `Branches` → `main` → **Do not allow bypassing the above settings**
- **Recommended Setting:**  
  - **Preferred Strict Mode:** Leave **Bypass list** completely **empty** (even administrators must open a PR, pass CI, and obtain independent review).
  - **Emergency Break-Glass Mode (only if policy requires):** Add **only** `@visaapply-org/platform-admins` with **Pull request only** bypass mode (never direct push), and audit every bypass via GitHub Audit Log.
- **Reason:**  
  Prevents accidental or unilateral administrator merges that skip the Editorial PR Validation Gate or CODEOWNERS review.
- **How to Verify It Is Active:**  
  Inspect the `Bypass list` on the active `main` Ruleset (confirm empty or strictly limited to `@visaapply-org/platform-admins` with PR-only mode) and verify an admin viewing a failing PR sees merge blocked (or explicit break-glass warning if configured).

---

### 12. Set Minimal GitHub Actions Workflow Permissions
- **Exact GitHub Navigation Path:**  
  `Repository` → `Settings` → `Actions` → `General` → **Workflow permissions**
- **Recommended Setting:**  
  - Select **Read repository contents and packages permissions** (default least-privilege `GITHUB_TOKEN`).
  - **UNCHECK** `Allow GitHub Actions to create and approve pull requests` — OR if `propose-catalog-refresh-pr.yml` requires creating monitoring PRs via `GITHUB_TOKEN`, explicitly document that **GitHub Actions MUST NEVER approve PRs** (and keep `propose-catalog-refresh-pr.yml` strictly scoped to `workflow_dispatch` only, never `pull_request`).
  - Under **Fork pull request workflows from outside collaborators**: select **Require approval for all outside collaborators**.
- **Reason:**  
  Enforces least privilege across all workflows, prevents bots/Actions from approving Pull Requests (matching Phase 6's `AI_ONLY_HIGH_RISK_APPROVAL_FORBIDDEN` and `BOT_MERGE_FORBIDDEN` rules), and stops untrusted fork PRs from executing CI unapproved.
- **How to Verify It Is Active:**  
  Inspect `Repository` → `Settings` → `Actions` → `General` → **Workflow permissions** and verify the radio button is set to **Read repository contents and packages permissions** and outside-collaborator fork approval is enabled.

---

### 13. Prevent Untrusted Pull Request Code From Accessing Secrets
- **Exact GitHub Navigation Path:**  
  - `Repository` → `Settings` → `Secrets and variables` → `Actions`  
  - `Repository` → `Settings` → `Code security` (or `Security & analysis`)  
  - `.github/workflows/editorial-pr-validation.yml`
- **Recommended Setting:**  
  1. Keep `.github/workflows/editorial-pr-validation.yml` strictly on the standard `pull_request` trigger with `permissions: { contents: read }` and **zero** `secrets.*` references (verified locally by `npm run editorial:verify-github-config`).
  2. Never attach production deployment secrets or write tokens to workflows triggered by `pull_request`. If deployment environments are added later, require **Environment protection rules** with manual reviewer sign-off and branch restriction to `main` only.
  3. Under `Settings` → `Code security`, enable **Secret scanning** and **Push protection** (and Dependabot alerts).
- **Reason:**  
  Untrusted fork or branch PRs execute attacker-controlled code from the PR head commit. Using read-only `pull_request` with zero secrets guarantees PR code cannot exfiltrate credentials or modify the repository.
- **How to Verify It Is Active:**  
  1. Run `npm run editorial:verify-github-config` locally (confirms zero `secrets.*`, read-only permissions, safe `env:` variable passing, and no privileged PR triggers).
  2. Inspect `Settings` → `Code security` and confirm **Secret scanning** and **Push protection** show **Enabled**.

---

## Step 5 — Safe Test Pull Request Verification Procedure

> **STRICT SAFETY RULE:**  
> Do **NOT** modify production immigration records, SQLite files, backups, or production sitemaps during this test.  
> Do **NOT** merge any test Pull Request without explicit user authorization. Close the test PR and delete the test branch once verification is complete.

### Preparation (Harmless Non-Production Change)
1. Ensure Phase 6 and Phase 6.1 commits (including `.github/CODEOWNERS`, `.github/pull_request_template.md`, `.github/workflows/editorial-pr-validation.yml`, and `scripts/verifyGithubGovernanceConfig.ts`) are already present on `main`, and Items #1–#13 above have been applied in GitHub settings.
2. From an up-to-date `main` branch, create a harmless documentation-only test branch:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b test/phase-6-1-governance-verification
   ```
3. Make a harmless, non-production documentation-only edit (for example, append a single temporary verification timestamp comment to `data/editorial-governance/proposals/README.md` — this path is inside `/data/editorial-governance/`, which directly exercises high-risk CODEOWNERS ownership by `@visaapply-org/senior-immigration-reviewers` and `@visaapply-org/platform-admins` WITHOUT touching any live visa/program record!).
4. Commit and push the test branch (only when explicitly authorized by the user):
   ```bash
   git add data/editorial-governance/proposals/README.md
   git commit -m "test(governance): verify Phase 6.1 PR gate and CODEOWNERS (DO NOT MERGE)"
   git push -u origin test/phase-6-1-governance-verification
   ```

### 7-Point Live Verification Checklist (Record Pass/Fail for Each)

| # | Check | Action on GitHub | Expected Result |
|---|---|---|---|
| **1** | **Pull Request opens successfully** | Open a Pull Request from `test/phase-6-1-governance-verification` → `main` titled `[TEST - DO NOT MERGE] Phase 6.1 GitHub Security Activation Check`. | PR opens cleanly and auto-populates `.github/pull_request_template.md`. |
| **2** | **Editorial validation workflow runs** | Open the **Checks** tab on the PR. | Workflow `Editorial Pull Request Validation Gate` starts automatically on `pull_request` with read-only permissions. |
| **3** | **Required status check appears** | Inspect the merge box at the bottom of the PR. | Check `Validate Editorial PR, Governance, Audit Trail & Atomic Catalog Build` appears with a **`Required`** label and runs `lint`, `editorial:verify-github-config`, `validateEditorialPullRequest.ts`, full test suite, and `vite build`. |
| **4** | **CODEOWNERS review is requested** | Inspect the **Reviewers** sidebar on the PR. | GitHub automatically requests review from `@visaapply-org/senior-immigration-reviewers` and/or `@visaapply-org/platform-admins` (and shows the CODEOWNERS shield icon next to the requested team). |
| **5** | **Unauthorized approval is rejected** | Have a non-CODEOWNER collaborator (e.g., a member of `country-editors` or `evidence-reviewers`) submit an **Approve** review — and verify the PR author cannot self-approve. | Merge button **remains BLOCKED** (`Review required from Code Owners`). |
| **6** | **Authorized review is recognized** | Have a different human member of `@visaapply-org/senior-immigration-reviewers` or `@visaapply-org/platform-admins` (NOT the PR author) submit an **Approve** review. | Code Owner approval requirement turns **green**; pushing a trivial follow-up commit immediately dismisses the approval as **Stale** (verifying Setting #9). |
| **7** | **Merge is blocked until all conditions are met** | Confirm merge is blocked while the required check is running or failing, OR while CODEOWNERS approval is missing/stale. | Merge button stays disabled until BOTH the `Required` validation check passes AND an un-stale authorized CODEOWNER approval is present. |

### Safe Teardown (No Merge)
5. **Do NOT click Merge.**
6. Record screenshots or audit notes confirming Checks 1–7, then **Close** the test Pull Request and delete the temporary remote branch `test/phase-6-1-governance-verification`.
