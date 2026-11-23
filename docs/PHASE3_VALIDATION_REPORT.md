# VisaApply.org — Phase 3 Static Catalog Validation Report

- **Validator Script:** `scripts/validateStaticCatalog.ts` (`npm run catalog:validate`)
- **Authoritative Target Directory:** `data/`
- **Schema Version Enforced:** `2.0.0` (`src/schemas/catalogSchemas.ts`, `src/schemas/idRules.ts`)
- **Execution Status:** **PASSED** (`exit code 0`)
- **Files Scanned:** `287`
- **Checks Executed:** `17 / 17 PASSED` (`0` errors, `2` informational warnings)

---

## 1. Validation Summary

| Entity / Collection | Records Validated | Errors | Warnings |
| :--- | :---: | :---: | :---: |
| Countries (`data/countries/*.json`) | 249 (`14` ACTIVE, `228` QUARANTINED, `7` UNINHABITED) | 0 | 1 (informational) |
| Official Sources (`data/official-sources/*.json`) | 61 | 0 | 0 |
| Immigration Programs (`data/programs/*.json`) | 28 | 0 | 0 |
| Visa Details (`data/visa-details/*.json`) | 1 | 0 | 0 |
| Route Matrix & Overrides (`data/routes/`) | 1 compact matrix + 3 overrides | 0 | 0 |
| Claims (`data/verification/claims.json`) | 1 | 0 | 0 |
| Evidence (`data/verification/evidence.json`) | 1 | 0 | 0 |
| Quarantine (`data/verification/quarantine.json`) | 229 | 0 | 0 |
| Changelog (`data/changelog/latest.json`) | 8 | 0 | 0 |
| Published Editorial (`data/editorial/published/*.md`) | 2 | 0 | 0 |
| Draft Editorial (`data/editorial/drafts/*.md`) | 3 | 0 | 1 (informational) |
| **Total** | **287 files scanned** | **0** | **2** |

---

## 2. All 17 Automated Validation Checks

| # | Check Name | Status | Errors | Enforcement Scope |
| :-: | :--- | :---: | :-: | :--- |
| 1 | JSON syntax | **PASS** | 0 | Parses every `.json` file strictly; rejects malformed JSON or truncated files. |
| 2 | Phase 2 schema compliance | **PASS** | 0 | Validates every record against strict zero-dependency TypeScript contracts in `src/schemas/catalogSchemas.ts`. |
| 3 | Country ISO identifiers | **PASS** | 0 | Verifies exact 249-country parity against `ALL_249_COUNTRIES`, uppercase ISO alpha-2 codes, and lowercase filename match (`<iso>.json`). |
| 4 | Program ID validity | **PASS** | 0 | Validates legacy & canonical program ID rules (`src/schemas/idRules.ts`) and destination-file grouping. |
| 5 | Case-insensitive duplicate IDs | **PASS** | 0 | Rejects any case-insensitive ID collision across countries, official sources, programs, visa details, claims, evidence, routes, and quarantine. |
| 6 | Official HTTPS source validity | **PASS** | 0 | Enforces `https://`, rejects `http://`, `localhost`, `example.com`, RFC1918 private IPs, and disallowed unofficial/commercial/blog domains (`wikipedia.org`, `visaguide.world`, `nomadlist.com`, etc.). |
| 7 | Evidence and claim relationships | **PASS** | 0 | Verifies every `claim.evidenceIds` resolves to an existing `VERIFIED_OFFICIAL` evidence record, detects conflicting active claims on the same `(programId, sectionKey)`, and ensures every `visaDetail` links to valid program/evidence records. |
| 8 | Quarantine integrity | **PASS** | 0 | Confirms quarantined records carry explicit non-empty `reasonCode`, `originalSource`, and `rawPayload` for recoverability, and do not simultaneously appear in publishable collections. |
| 9 | Public PII and secret detection | **PASS** | 0 | Scans all public JSON/Markdown files for leaked secrets (`postgres://`, `sk_live_`, `AIza`, `ghp_`, `BEGIN PRIVATE KEY`, `JWT_SECRET`, `ADMIN_PASSWORD_HASH`) and personal PII (personal emails, SSNs, passport numbers). |
| 10 | Deleted Phase 3.2 fixture exclusion | **PASS** | 0 | Blocks re-introduction of deleted test/placeholder fixtures (e.g., `qa-test-*`, `dummy-*`, `mock-visa-*`, `TEST-FIXTURE-*`, `placeholder-program`). |
| 11 | Route matrix and override integrity | **PASS** | 0 | Validates compact treaty matrix, ISO alpha-2 membership, `fromIso !== toIso`, and verified official source references on curated route overrides. |
| 12 | Editorial Markdown frontmatter | **PASS** | 0 | Parses YAML frontmatter against `EditorialFrontmatterSchema`, enforces `status: PUBLISHED` inside `editorial/published/` (blocking drafts), and enforces `status: DRAFT` inside `editorial/drafts/`. |
| 13 | Changelog consistency | **PASS** | 0 | Validates every changelog entry's ISO code, HTTPS official source, date format, and unique ID. |
| 14 | Country-to-program relationships | **PASS** | 0 | Ensures every published program references an `ACTIVE` destination country and existing `officialSourceIds` in `data/official-sources/<iso>.json`. |
| 15 | Publication eligibility | **PASS** | 0 | Enforces `STATIC_CATALOG_TRUST_POLICY.md`: every record in `data/programs/` must have `publicationStatus: "PUBLISHED"` and `availabilityStatus: "AVAILABLE_VERIFIED"`. Expired/draft/unverified records fail with non-zero exit. |
| 16 | Coverage metric consistency | **PASS** | 0 | Verifies `batch-state.json` coverage metrics (`coverageSlotsCount = 1743`, `verifiedAvailableProgramsCount = 28`, `confirmedNotAvailableCount = 7`, `quarantinedOrPendingCount = 229`) reconcile mathematically with on-disk files. |
| 17 | No unverified records in publishable collections | **PASS** | 0 | Hard gate blocking `UNVERIFIED`, `AWAITING_OFFICIAL_SOURCE_VERIFICATION`, `EXPIRED`, `DISCONTINUED`, `SUSPENDED`, or `DRAFT` records from entering publishable collections (`programs/`, `visa-details/`, `editorial/published/`). |

---

## 3. Informational Warnings (Non-Blocking)

Two expected, honest informational warnings were reported:

1. **`COUNTRIES_AWAITING_OFFICIAL_VERIFICATION` (`countries/`):** `228` countries remain in `QUARANTINED` status awaiting primary sovereign HTTPS official-source verification. They are never fabricated or published as active hubs.
2. **`DRAFTS_EXCLUDED_FROM_PUBLIC` (`editorial/drafts/`):** `3` draft editorial articles are stored in `editorial/drafts/` and excluded from public indexes and sitemaps.

---

## 4. Negative Verification Proof (Automated Failure Testing)

Verified in `tests/phase3_static_catalog.test.ts` that `validateStaticCatalog()` exits with non-zero status and explicit error codes when presented with tampered fixtures:

- Case-insensitive duplicate program ID (`US-TOU-001` colliding with `us-TOU-001`) -> **REJECTED**
- Unofficial domain (`https://en.wikipedia.org/...`) or plaintext `http://` source URL -> **REJECTED**
- `EXPIRED` or `UNVERIFIED` program injected into `data/programs/` -> **REJECTED**
- Conflicting active claims on the same `(programId, sectionKey)` -> **REJECTED**
- Broken `evidenceIds` pointer -> **REJECTED**
- Leaked `postgres://` connection string or personal PII email -> **REJECTED**
- Deleted Phase 3.2 fixture ID (`qa-test-dummy-visa`) -> **REJECTED**
- Draft Markdown article placed inside `data/editorial/published/` -> **REJECTED**

---

## 5. CLI Usage

```bash
# Run full human-readable validation report (exits non-zero on any error)
npm run catalog:validate

# Output machine-readable JSON validation report (CI / Phase 6 ready)
./node_modules/.bin/tsx scripts/validateStaticCatalog.ts --json

# Validate an alternate directory
./node_modules/.bin/tsx scripts/validateStaticCatalog.ts --dir /path/to/data
```
