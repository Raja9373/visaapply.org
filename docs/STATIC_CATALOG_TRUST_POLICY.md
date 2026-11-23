# VisaApply.org — Static Catalog Verification & Trust Policy

- **Enforcement Layer:** `src/schemas/catalogSchemas.ts` & `src/schemas/idRules.ts`
- **Schema Version:** `2.0.0`

VisaApply.org publishes evidence-based immigration intelligence. Every static catalog record entering public search indexes, country hubs, visa detail pages, or sitemaps must satisfy all 10 mandatory trust rules below.

---

## 1. Never Fabricate Missing Immigration Information

- Optional fields in `VisaDetailRecord.sections` (`applicationFees`, `processingTime`, `ageRequirements`, `educationRequirements`, `workExperience`, `financialRequirements`, `requiredDocuments`, `validity`, `renewal`, `familyDependentProvisions`, `rightsAndRestrictions`, `frequentlyAskedQuestions`, etc.) **must remain `null` or omitted** when not confirmed by an official government source.
- Never invent placeholder fees, estimated processing times, synthetic document checklists, or fabricated eligibility thresholds.

## 2. Official Government HTTPS Sources Only

- Every `officialSourceRefs[].url`, `officialHttpsUrl`, `sourceUrl`, `officialApplicationLinks[]`, and `officialReferences[]` entry must pass `validateOfficialHttpsUrl(...)`.
- Requirements:
  - Must use `https://` protocol (`http://`, `javascript:`, `data:`, `file:` are rejected).
  - Must not embed credentials (`user:pass@`).
  - Must resolve to a public domain (rejects `localhost`, `127.0.0.1`, `::1`, RFC-1918 private IPs, `.local`, `.internal`).
  - Must never reference commercial visa agencies, travel aggregators, encyclopedias, blogs, or social networks (`DISALLOWED_UNOFFICIAL_DOMAINS`: `wikipedia.org`, `visaguide.world`, `atlys.com`, `ivisa.com`, `schengenvisainfo.com`, `passportindex.org`, `henleyglobal.com`, `nomadcapitalist.com`, `visahq.com`, `medium.com`, `substack.com`, `reddit.com`, `quora.com`, `youtube.com`, `example.com`, etc.).

## 3. Strict Verification Lifecycle States

Every program, visa detail, route override, claim, and changelog entry carries a `verificationStatus` from `CATALOG_VERIFICATION_STATUSES`:

| Status | Public Index Eligible? | Meaning |
| :--- | :---: | :--- |
| `AVAILABLE_VERIFIED` | **Yes** (with official HTTPS URL & `lastVerifiedDate`) | Confirmed active and verified against an official sovereign source. |
| `NOT_AVAILABLE_CONFIRMED` | **Yes** (clearly labeled as confirmed unavailable) | Officially confirmed that no such pathway/program exists. |
| `AWAITING_OFFICIAL_VERIFICATION` | **No** (Quarantine) | Discovered or queued; awaiting primary sovereign verification. |
| `NEEDS_REVIEW` | **No** (Quarantine) | Source changed, stale, or flagged for human/automated re-verification. |
| `CONFLICTING` | **No** (Quarantine) | Conflicting official sources or contradictory claims detected. |
| `EXPIRED` | **No** (Quarantine / Archive) | Program closed or `expiresAt` timestamp has passed. |
| `QUARANTINED` | **No** (Quarantine) | Explicitly isolated pending remediation. |
| `TEMPORARILY_CLOSED` | **No** (Excluded from active available counts) | Legacy compatibility state for paused intake quotas/windows. |

## 4. Mandatory Verification Dates & Source Linkage

- A program with `verificationStatus: "AVAILABLE_VERIFIED"` or `publicationStatus: "PUBLISHED"` **must** include:
  1. At least one valid official HTTPS source reference (`officialSourceRefs.length >= 1`).
  2. A valid ISO-8601 `lastVerifiedDate` (never `null`).
- A claim with `verificationStatus: "AVAILABLE_VERIFIED"` **must** include:
  1. At least one linked `evidenceIds` reference.
  2. A valid ISO-8601 `verificationDate`.
- Evidence with `evidenceStatus: "VERIFIED_OFFICIAL"` **must** include a valid ISO-8601 `lastVerifiedDate`.

## 5. Expired Program Publication Rejection

- If `expiresAt` is earlier than the evaluation date (`nowDate`), `validateImmigrationProgramRecord` and `isEligibleForPublicCatalogIndex` **reject** both `publicationStatus: "PUBLISHED"` and `verificationStatus: "AVAILABLE_VERIFIED"`.
- Expired programs must be transitioned to `verificationStatus: "EXPIRED"` and `publicationStatus: "QUARANTINED"` (or `"ARCHIVED"`).

## 6. Conflicting Claims & Broken Evidence Rejection

- `validateClaimEvidenceLinkage(...)` enforces strict cross-file integrity:
  - No dangling `programId`, `officialSourceId`, or `evidenceId` references.
  - Every `EvidenceRecord.claimId` must match the `ClaimRecord.claimId` that links to it.
  - No orphan evidence records without a parent claim.
  - A `ClaimRecord` marked `CONFLICTING` blocks its parent program from remaining `PUBLISHED` (`CONFLICTING_CLAIM_ON_PUBLISHED_PROGRAM`) and causes `isEligibleForPublicCatalogIndex` to return `eligible: false`.
  - A claim marked `AVAILABLE_VERIFIED` cannot depend on evidence with status `REJECTED`, `BROKEN_LINK`, or `OUTDATED`.

## 7. Non-Destructive Quarantine Preservation

- Uncertain, unverified, expired, or conflicting records **must never be silently deleted**.
- They are preserved in `data/verification/quarantine.json` as `QuarantineRecord` entries requiring:
  - `quarantineId` (`QRN-<ENTITY>-<HASH12>`)
  - Non-publishable `verificationStatus` (rejects `AVAILABLE_VERIFIED` and `NOT_AVAILABLE_CONFIRMED` inside quarantine)
  - Structured `reasonCode` & `reasonSummary`
  - `recoverable: true`
  - `preservedPayload` containing the full record for audit and future recovery.

## 8. Zero PII & Zero Secrets in Public Catalog Files

- Every validator invokes `detectProhibitedPublicSecretsOrPii(...)` recursively across all nested objects and arrays.
- Automatically rejects:
  - Email addresses (e.g., personal/admin/subscriber emails)
  - Database connection strings (`postgresql://`, `postgres://`, `mysql://`, `mongodb://`)
  - API keys & tokens (`AIzaSy*`, `re_live_*`, `re_test_*`, `ghp_*`/`gho_*`/`ghu_*`/`ghs_*`/`ghr_*`, `sk-*`)
  - PEM private key blocks (`-----BEGIN ... PRIVATE KEY-----`)
  - Prohibited secret/PII property names (`password`, `secret`, `privateKey`, `apiKey`, `subscriberEmail`, `accessToken`).

## 9. Deleted Phase 3.2 Fixture Exclusion

- All deleted Phase 3.2 test and audit fixtures (`test-phase-3-2-prog`, `test-p322-temp-001`, `test-p322-temp-002`, `pg-test-2106`, `empty-test`, `p1-audit-*`, etc.) are permanently blocked from every schema validator and public index gate.

## 10. Strict Coverage Metric Separation

- `CatalogCoverageMetrics` (`validateCatalogCoverageMetrics`) enforces honest, non-inflated reporting by separating:
  1. `coverageSlotsCount` — Total country × category coverage slots tracked across the 249-country matrix.
  2. `discoveredProgramsCount` — Total distinct immigration programs discovered (across verified and pending states).
  3. `verifiedAvailableProgramsCount` — Strictly programs with `AVAILABLE_VERIFIED` status and passing public trust gates.
  4. `confirmedNotAvailableCount` — Slots officially confirmed as unavailable.
  5. `quarantinedOrPendingCount` — Records held in quarantine or awaiting verification.
- Invariant enforced at runtime: `verifiedAvailableProgramsCount <= discoveredProgramsCount`.
