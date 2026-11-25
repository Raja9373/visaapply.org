# Editorial Change Proposals & Quarantine Releases

All proposed editorial changes submitted via GitHub Pull Requests may include structured JSON proposals in this directory (`PROP-<YYYY-MM-DD>-<ISO>-<SEQ>.json`) conforming to `EditorialChangeProposal` in `src/schemas/editorialGovernanceSchemas.ts`.

## Lifecycle
1. Automated official source monitoring (`npm run catalog:monitor`) detects a source fingerprint or structure change and queues an evidence proposal under `data/monitoring/changes/`.
2. A Country Editor or Evidence Reviewer creates a GitHub branch and Pull Request with a structured proposal referencing an official HTTPS government source URL and verbatim excerpt.
3. `.github/workflows/editorial-pr-validation.yml` runs `npm run editorial:validate-pr` automatically with read-only permissions (zero secret exposure to untrusted PRs).
4. **Low-Risk Changes** (non-legal display metadata, source descriptions, formatting, spelling) pass automated validation and streamlined review.
5. **High-Risk Changes** (eligibility, visa availability, fees, processing times, financial thresholds, work rights, family sponsorship, citizenship, statutory rules, or quarantine releases) strictly require independent human approval by a **Senior Immigration Reviewer** or **Administrator** via GitHub Pull Request review (enforced by `.github/CODEOWNERS` and branch protection).
6. Upon authorized merge to `main`, an append-only SHA-256 chain-hashed event is preserved in `data/editorial-governance/audit-log.json` alongside Git commit history, and static catalog + candidate sitemap regeneration runs atomically.
