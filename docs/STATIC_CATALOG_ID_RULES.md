# VisaApply.org — Deterministic Static Catalog ID Rules

- **Implementation:** `src/schemas/idRules.ts`
- **Schema Version:** `2.0.0`

Every entity in the VisaApply.org static catalog uses a deterministic, human-auditable, collision-resistant identifier that **never depends on array index, database auto-increment sequence, or runtime clock**.

---

## 1. Canonical Identifier Formats

| Entity | Canonical Format | Generator | Validator | Examples |
| :--- | :--- | :--- | :--- | :--- |
| **Country** | `<ISO2>` (uppercase) / `<iso2>` (lowercase slug) | `normalizeCountryIso2(code)` | `isValidCanonicalIso2(code)` | `US` / `us`, `GB` / `gb`, `IN` / `in` |
| **Immigration Program** | `<ISO2>-<CATEGORY>-<SLUG>` | `generateProgramId(iso, category, slug)` | `isValidProgramId(id)` | `US-WORK-H1B-SPECIALTY`, `CA-PR-EXPRESS-ENTRY`, `DE-NOMAD-FREELANCE` |
| **Visa Detail** | `vd-<programId>` | `generateVisaDetailId(programId)` | `isValidVisaDetailId(id)` | `vd-US-WORK-H1B-SPECIALTY`, `vd-us-TOU-001` |
| **Official Source** | `SRC-<ISO2>-<AUTHORITY>` | `generateOfficialSourceId(iso, authority)` | `isValidOfficialSourceId(id)` | `SRC-US-USCIS`, `SRC-CA-IRCC`, `SRC-GB-HOME-OFFICE` |
| **Claim** | `CL-<HASH12>` | `generateClaimId(programId, sectionKey, claimKey)` | `isValidClaimId(id)` | `CL-9A4F2C10B81E` |
| **Evidence** | `EV-<HASH12>` | `generateEvidenceId(claimId, sourceUrl, excerptKey?)` | `isValidEvidenceId(id)` | `EV-3E7D01AC45F2` |
| **Bilateral Route** | `<origin-iso2>-to-<dest-iso2>` | `generateRouteId(originIso, destIso)` | `isValidRouteId(id)` | `in-to-ca`, `gb-to-au` (self-routes like `in-to-in` rejected) |
| **Changelog Entry** | `CHG-<YYYY-MM-DD>-<ISO2>-<SLUG>` | `generateChangelogId(dateIso, iso, slug)` | `isValidChangelogId(id)` | `CHG-2026-10-28-US-B1B2-FEE` |
| **Quarantine Entry** | `QRN-<ENTITY>-<HASH12>` | `generateQuarantineId(entityType, entityId)` | `validateQuarantineRecord` (`^QRN-[A-Z0-9-]+$`) | `QRN-PROGRAM-A1B2C3D4E5F6` |
| **Editorial Slug** | `<lowercase-kebab-case>` | `toDeterministicSlug(title, 'lower')` | `isValidEditorialSlug(slug)` | `in-to-ca-tourist`, `canada-express-entry-guide` |

---

## 2. Category Code Tokens (`<CATEGORY>`)

Used by `generateProgramId(countryIso2, category, slugInput)`:

| Category Value | Token |
| :--- | :--- |
| `pr` | `PR` |
| `citizenship` | `CIT` |
| `work` | `WORK` |
| `student` | `STU` |
| `family` | `FAM` |
| `business` | `BIZ` |
| `investor` | `INV` |
| `digital_nomad` | `NOMAD` |
| `retirement` | `RET` |
| `pet_travel` | `PET` |
| `tourist` | `TOU` |
| `transit` | `TRN` |

---

## 3. Authoritative ISO-249 & 15-Language Constraints

1. **249 Canonical ISO-3166-1 alpha-2 Codes:** Sourced exclusively from `ALL_249_ISO_FORCED` in `src/data/all249Countries.ts`.
   - Non-standard aliases (e.g., `UK` instead of `GB`, `USA` instead of `US`, `XX`, `ZZ`, `EU`) are **strictly rejected**.
   - Every country's `slug` must equal `isoCode.toLowerCase()`.
   - Every program's `programId` 2-letter prefix must match `destinationCountryIso`.
   - Every official source's `SRC-<ISO2>-*` code must match `countryIso`.
2. **15 Supported Interface Languages:** Sourced exclusively from `CANONICAL_15_LANG_CODES` in `src/i18n/config.ts` (`en`, `hi`, `es`, `fr`, `de`, `pt`, `ar`, `zh`, `ja`, `ko`, `ru`, `it`, `nl`, `tr`, `vi`).

---

## 4. Non-Positional Determinism & Legacy ID Preservation

1. **Zero Array-Index Dependency:**
   - `CL-<HASH12>` hashes `SHA-256(programId.toUpperCase() | sectionKey.toLowerCase() | claimKey.toLowerCase()).slice(0, 12).toUpperCase()`.
   - `EV-<HASH12>` hashes `SHA-256(claimId.toUpperCase() | sourceUrl.toLowerCase() | excerptKey).slice(0, 12).toUpperCase()`.
   - Reordering items in JSON arrays never alters any generated ID.
2. **Preserved Existing Production Identifiers:**
   - Existing program IDs in `src/data/globalImmigrationHubData.ts` and `data_db/immigration_hub.db` (e.g., `us-TOU-001`, `us-eb2-niw`, `ca-express-entry`, `US-H1B`) are accepted by `isValidProgramId` provided their prefix resolves to a valid canonical ISO-2 code.
   - Two pre-existing legacy prefix aliases already in production (`uk-*` mapped to `GB`, e.g., `uk-skilled-worker`, and `uae-*` mapped to `AE`, e.g., `uae-golden-visa-investor`) are explicitly preserved via `PRESERVED_LEGACY_PROGRAM_PREFIX_ALIASES` so existing URLs are never silently renamed. All **newly minted** program IDs via `generateProgramId(...)` strictly use canonical `GB-*` / `AE-*`, and `CountryRecord.isoCode` / `destinationCountryIso` strictly require canonical 249-ISO codes (`GB`, `AE`).
   - Existing legacy claim/evidence IDs (`CLM-*`, `clm-*`, `ev-*`) and changelog IDs (`sync-YYYY-MM-DD-*`, `chg-*`) remain accepted by their respective validators so Phase 3 migration does not break existing URLs or citations.
   - Existing `vd-<programId>` visa detail identifiers are preserved verbatim.
3. **Case-Insensitive Uniqueness:** `validateProgramCollection` rejects duplicate `programId` values case-insensitively (e.g., `US-WORK-H1B` and `us-work-h1b` cannot coexist).

---

## 5. Deleted Phase 3.2 & Synthetic Fixture Blocklist

To guarantee previously deleted test/audit records can never re-enter the static catalog or search indexes, `isForbiddenFixtureId(...)` strictly rejects all of the following (case-insensitive):

- **Exact IDs:**
  - `test-phase-3-2-prog`
  - `test-p322-temp-001`
  - `test-p322-temp-002`
  - `pg-test-2106`
  - `empty-test`
- **Forbidden Prefixes:**
  - `test-phase-3-2-`
  - `test-p322-`
  - `vd-test-phase-3-2-`
  - `vd-test-p322-`
  - `clm-p322-`
  - `ev-p322-`
  - `clm-neon-p322-`
  - `ev-neon-p322-`
  - `claim-32-`
  - `ev-32-`
  - `ver-32-pre-`
  - `p1-audit-`

Any record containing a blocklisted ID fails schema validation with code `FORBIDDEN_PHASE32_FIXTURE` (or `INVALID_*_ID`) and is rejected by `isEligibleForPublicCatalogIndex`.
