# Static Catalog Schemas (`src/schemas/`)

Schema Version: **`2.0.0`** (`STATIC_CATALOG_SCHEMA_VERSION`)

This directory defines the canonical TypeScript contracts, deterministic identifier rules, and zero-dependency strict runtime validators for VisaApply.org's **Zero-Database-First Static Catalog Architecture** (Phase 2).

---

## Design Decisions

1. **Zero Added Dependencies:** `zod` is not installed in `package.json`. Rather than adding a new runtime package unnecessarily, `catalogSchemas.ts` and `idRules.ts` implement a strict, deterministic TypeScript validation engine returning structured `ValidationResult<T>` objects (`{ success: true, data, issues: [] }` or `{ success: false, issues }`).
2. **Authoritative Registry Alignment:** All ISO-3166-1 alpha-2 country validations source directly from `ALL_249_ISO_FORCED` (`src/data/all249Countries.ts`) and all language validations source directly from `CANONICAL_15_LANG_CODES` (`src/i18n/config.ts`).
3. **Evidence & Classification Alignment:** Claim classifications (`REQUIREMENT_CLASSIFICATIONS`) and evidence lifecycle statuses (`EVIDENCE_STATUSES`) reuse the canonical definitions in `src/types/visaComprehensiveProfile.ts`.
4. **Backward Compatibility:** Existing production identifiers (`us-TOU-001`, `us-eb2-niw`, `vd-us-TOU-001`, `sync-2026-10-28-us-fee`, `in-to-ca-tourist`) remain valid while newly minted identifiers follow canonical Phase 2 deterministic rules.

---

## Modules

| File | Responsibility |
| :--- | :--- |
| `src/schemas/idRules.ts` | Canonical 249-ISO and 15-language sets, deterministic non-positional ID generators & validators, official HTTPS URL validator (blocking commercial visa agencies/blogs/localhost/non-HTTPS), deleted Phase 3.2 fixture blocklist, and public PII/secret scanner. |
| `src/schemas/catalogSchemas.ts` | Strict schema interfaces, runtime validators (`validate*`), public-index publication gate (`isEligibleForPublicCatalogIndex`), collection uniqueness validator (`validateProgramCollection`), cross-file relational integrity validator (`validateClaimEvidenceLinkage`), coverage metric invariant validator (`validateCatalogCoverageMetrics`), and legacy backward-compatibility adapters (`adaptLegacy*`). |

---

## Schema Matrix

| Domain | Interface | Validator |
| :--- | :--- | :--- |
| **A. Country** | `CountryRecord` | `validateCountryRecord(input)` |
| **B. Immigration Program** | `ImmigrationProgramRecord` | `validateImmigrationProgramRecord(input, { nowDate? })` |
| **C. Visa Detail** | `VisaDetailRecord` | `validateVisaDetailRecord(input)` |
| **D. Official Source** | `OfficialSourceRecord` | `validateOfficialSourceRecord(input)` |
| **E. Bilateral Route Override** | `BilateralRouteOverrideRecord` | `validateBilateralRouteOverride(input)` |
| **F. Evidence & Claim** | `EvidenceRecord`, `ClaimRecord` | `validateEvidenceRecord(input)`, `validateClaimRecord(input)`, `validateClaimEvidenceLinkage(...)` |
| **G. Verification & Quarantine** | `QuarantineRecord`, `CatalogCoverageMetrics` | `validateQuarantineRecord(input)`, `validateCatalogCoverageMetrics(input)`, `isEligibleForPublicCatalogIndex(...)` |
| **H. Editorial** | `EditorialArticleRecord` | `validateEditorialArticleRecord(input)` |
| **I. Changelog** | `ChangelogRecord` | `validateChangelogRecord(input)` |

---

## Usage Examples

### Validating a Program Record

```ts
import {
  STATIC_CATALOG_SCHEMA_VERSION,
  generateProgramId,
  generateOfficialSourceId,
  validateImmigrationProgramRecord,
  isEligibleForPublicCatalogIndex
} from './catalogSchemas';

const programId = generateProgramId('US', 'work', 'h1b-specialty-occupation');
const sourceId = generateOfficialSourceId('US', 'USCIS');

const result = validateImmigrationProgramRecord({
  schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
  programId,
  destinationCountryIso: 'US',
  programName: 'H-1B Specialty Occupations',
  immigrationCategory: 'work',
  programType: 'Actual Immigration Program',
  eligibilitySummary: 'Employer-sponsored specialty occupation requiring a bachelor degree or equivalent.',
  officialSourceRefs: [
    { sourceId, url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations' }
  ],
  verificationStatus: 'AVAILABLE_VERIFIED',
  createdDate: '2026-01-15',
  lastVerifiedDate: '2026-10-28',
  lastUpdatedDate: '2026-10-28',
  publicationStatus: 'PUBLISHED'
});

if (result.success) {
  const gate = isEligibleForPublicCatalogIndex(result.data);
  console.log('Publishable:', gate.eligible);
} else {
  console.error('Validation issues:', result.issues);
}
```

### Adapting Legacy Data Models

```ts
import { VERIFIED_IMMIGRATION_PROGRAMS } from '../data/globalImmigrationHubData';
import { adaptLegacyProgramToStaticRecord, validateImmigrationProgramRecord } from './catalogSchemas';

for (const legacy of VERIFIED_IMMIGRATION_PROGRAMS) {
  const record = adaptLegacyProgramToStaticRecord(legacy);
  const check = validateImmigrationProgramRecord(record);
  if (!check.success) {
    throw new Error(`Invalid adapted program ${legacy.id}: ${JSON.stringify(check.issues)}`);
  }
}
```

---

## Related Specifications

- [`docs/STATIC_CATALOG_ARCHITECTURE.md`](../../docs/STATIC_CATALOG_ARCHITECTURE.md) — Canonical `data/` directory layout, chunking, and lazy-loading rules
- [`docs/STATIC_CATALOG_ID_RULES.md`](../../docs/STATIC_CATALOG_ID_RULES.md) — Deterministic identifier specification & deleted Phase 3.2 fixture blocklist
- [`docs/STATIC_CATALOG_TRUST_POLICY.md`](../../docs/STATIC_CATALOG_TRUST_POLICY.md) — Mandatory immigration verification, quarantine, and data safety rules
