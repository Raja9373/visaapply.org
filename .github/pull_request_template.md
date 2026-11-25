## VisaApply.org Editorial Pull Request

### 1. Change Identification
- **Change Proposal ID:** `PROP-YYYY-MM-DD-ISO-001`
- **Affected Record ID(s):** (Program ID / Claim ID / Source ID / Route ID)
- **Country / Jurisdiction (ISO-2):**
- **Risk Classification:**
  - [ ] `LOW_RISK` (Non-legal display metadata, source description, formatting, spelling only)
  - [ ] `HIGH_RISK` (Eligibility, availability, fees, processing times, thresholds, work rights, family, citizenship, statutory rules, or quarantine release)

### 2. Official Government Evidence (Mandatory)
- **Official Source ID (in `data/official-sources/`):**
- **Official HTTPS Government URL:**
- **Source Last-Checked Timestamp (UTC):**
- **Verbatim Supporting Excerpt:**
- **Previous Published Value:**
- **Proposed New Value:**

### 3. Quarantine Release 5-Gate Checklist (Complete Only If Releasing a Quarantined Record)
- [ ] **Gate 1:** Verified, non-expired official HTTPS government evidence is attached (NOT website reachability alone)
- [ ] **Gate 2:** Canonical schema validation passes
- [ ] **Gate 3:** Required authorized human reviewer approval is obtained
- [ ] **Gate 4:** High-risk Senior Immigration Reviewer / Administrator review is satisfied
- [ ] **Gate 5:** Full static catalog validation (`npm run editorial:validate-pr`) passes

### 4. Mandatory Safety Attestations
- [ ] No AI-only approval for high-risk statutory changes
- [ ] No commercial visa agency, blog, forum, or unverified translation cited as authoritative proof
- [ ] Conflicting official sources (if any) are resolved or kept quarantined
- [ ] Zero PII, emails, API keys, or credentials included in public data or audit records
- [ ] `data/editorial-governance/audit-log.json` remains strictly append-only (no prior events rewritten/deleted)
