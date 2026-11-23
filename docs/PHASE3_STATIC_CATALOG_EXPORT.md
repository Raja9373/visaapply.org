# VisaApply.org — Phase 3 Static Catalog Export Report

- **Phase:** Phase 3 — Static Catalog Exporter, Strict Validator, Search Index Builder & Valid-Only Sitemap
- **Architecture Mode:** Option B — Zero-Database-First / Database-Light Architecture
- **Schema Contract:** `src/schemas/catalogSchemas.ts` (`v2.0.0`) & `src/schemas/idRules.ts`
- **Exporter Script:** `scripts/exportCatalogToStatic.ts` (`npm run catalog:export`)
- **Authoritative Catalog Output:** `data/` (version-controlled source of truth)
- **Export Manifest:** `data/export_manifest.json`
- **Deterministic Content Hash:** `a31a06267e50f6cd43004edc665bc8e52f7e4bd23204b74d6af2b5e2655d6768`

---

## 1. Authoritative Source vs. Generated Build Artifacts

Phase 3 establishes a strict separation between **authoritative catalog files** and **generated runtime/SEO artifacts**:

| Layer | Directory | Authoritative? | Purpose |
| :--- | :--- | :---: | :--- |
| **Authoritative Static Catalog** | `data/` | **YES** | Canonical JSON/Markdown records validated against Phase 2 zero-dependency TypeScript contracts; GitHub-versioned source of truth. |
| **Generated Search Indexes & Lazy Chunks** | `public/catalog/` | No (Derived) | Content-hashed, compressed-friendly static JSON indexes and lazy chunks built deterministically from `data/`. |
| **Generated Valid-Only Static Sitemaps** | `public/sitemaps-static/` | No (Derived) | XML sitemaps containing only verified, substantive canonical URLs built strictly from `data/`. |
| **Legacy Runtime & Database Sources** | `data_db/`, `src/data/`, `public/sitemap*.xml` | Legacy (Untouched) | Preserved unchanged in Phase 3 until Phase 4/5 parity sign-off. |

---

## 2. Database Safety & Provenance Guarantees

`scripts/exportCatalogToStatic.ts` enforces strict non-destructive isolation:

1. **Zero Live SQLite Access:** Opening any file inside `data_db/` raises an immediate `SAFETY_GUARD_VIOLATION` error before any database handle is created.
2. **Read-Only Isolated Phase B.3 Backup Only:** SQLite records are read strictly from the verified Phase B.3 WAL-safe standalone backup:
   - **Path:** `backups/phase_b3_verified_2026-11-23T10-31-07-923Z_ac57/immigration_hub_standalone.db`
   - **Verified SHA-256:** `827494c04201f9ea4adcd7530566f41e9c7f091c1507b59abd95b1d8d7fb4e03`
   - **SQLite Open Mode:** `{ readonly: true, fileMustExist: true }`
3. **Zero Neon Connections & Zero Migrations:** No `pg`, `DATABASE_URL`, or Neon driver is imported or invoked.
4. **Byte-for-Byte Determinism & Idempotency:** Running `--dry-run` and repeated full export executions produce the exact same deterministic SHA-256 content hash (`a31a06267e50f6cd43004edc665bc8e52f7e4bd23204b74d6af2b5e2655d6768`) with sorted keys, sorted record arrays, and zero run-timestamp drift.

---

## 3. Source-by-Source Export Reconciliation

Every input source is mapped through Phase 2 zero-dependency TypeScript normalization adapters (`src/schemas/catalogSchemas.ts`) with full provenance, deduplication, and conflict tracking:

| Source Input | Source Records | Exported (Authoritative) | Quarantined | Rejected | Notes / Deduplication |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/data/all249Countries.ts` | 249 | 249 (`data/countries/*.json`) | 228 | 0 | `14` `ACTIVE` Tier-1 hubs, `228` `QUARANTINED` awaiting sovereign HTTPS verification, `7` `UNINHABITED_TERRITORY` (`AQ, BV, GS, HM, IO, TF, UM`). |
| `src/data/officialSourceRegistry.ts` + program source URLs | 249 | 61 (`data/official-sources/*.json`) | 228 | 0 | `61` distinct official HTTPS source records across the 14 Tier-1 countries (`AE, AU, CA, DE, ES, FR, GB, IN, IT, JP, NZ, PT, SG, US`). Zero fabricated URLs. |
| `VERIFIED_IMMIGRATION_PROGRAMS` (TS) + backup `immigration_programs` (SQLite) | 58 (29 + 29) | 28 (`data/programs/*.json`) | 1 | 0 | `29` identical TS/SQLite duplicates deduplicated (`0` conflicts). `28` `AVAILABLE_VERIFIED` + `PUBLISHED` programs exported across 9 destination files (`ae, au, ca, de, es, fr, gb, pt, us`); `1` `EXPIRED` program (`pt-golden-visa-expired-realestate`) preserved in `data/verification/quarantine.json`. |
| Phase B.3 backup `visa_details` + `legal_evidence_json` | 1 | 1 (`data/visa-details/us-TOU-001.json`) | 0 | 0 | `vd-us-TOU-001` exported with `1` linked claim (`data/verification/claims.json`) and `1` verified official evidence record (`data/verification/evidence.json` -> `https://travel.state.gov`). |
| `src/data/anyToAnyLight.ts` (compact rules + curated corridors) | 3 overrides + compact matrix | 3 overrides (`data/routes/overrides/{ae,in,us}.json`) + `data/routes/matrix-compact.json` | 0 | 0 | Covers all `61,752` bilateral pairs compactly without generating 61,752 duplicated route files. Curated verified corridors: `ae-to-us`, `us-to-ae`, `us-to-in`. |
| `src/data/immigrationChangelog.json` + backup `changelog_entries` | 8 | 8 (`data/changelog/latest.json`) | 0 | 0 | Preserves all 8 verified immigration changelog records deterministically sorted. |
| `content/*.md` (Published editorial guides) | 2 | 2 (`data/editorial/published/*.md`) | 0 | 0 | `in-to-ca-tourist.md` and `us-to-uk-tourist.md` (legacy `to: "UK"` normalized to canonical ISO `GB` while preserving URL slug `us-to-uk-tourist`). |
| `content/drafts/*.md` (Draft editorial guides) | 3 | 3 (`data/editorial/drafts/*.md`) | 0 | 0 | `ga-to-fj-student.md`, `ga-to-fj-work.md`, `jp-to-ae-business.md` isolated in `drafts/` and excluded from public indexes/sitemaps. |

---

## 4. Honest Coverage Metrics Separation

In accordance with `docs/STATIC_CATALOG_TRUST_POLICY.md`, Phase 3 strictly separates total ISO/category slots from verified published records (`data/verification/batch-state.json` & `data/export_manifest.json`):

| Metric | Value | Definition |
| :--- | :---: | :--- |
| `coverageSlotsCount` | **1,743** | `249` ISO countries × `7` core immigration categories (total theoretical coverage slots). |
| `discoveredProgramsCount` | **29** | Total distinct program records discovered across TS + verified SQLite backup. |
| `verifiedAvailableProgramsCount` | **28** | Currently active, `AVAILABLE_VERIFIED` + `PUBLISHED` programs backed by official HTTPS sources. |
| `confirmedNotAvailableCount` | **7** | Confirmed uninhabited territories (`AQ, BV, GS, HM, IO, TF, UM`) where immigration residency programs do not apply. |
| `quarantinedOrPendingCount` | **229** | `228` countries awaiting official HTTPS verification + `1` expired program (`pt-golden-visa-expired-realestate`). |
| `asOfDate` | **2026-11-11** | Latest verified dataset snapshot date from the source records. |

---

## 5. Populated Directory Summary (`data/`)

- `data/countries/` — 249 canonical country JSON files (`ad.json` .. `zw.json`)
- `data/official-sources/` — 14 verified Tier-1 official source collections (61 HTTPS official source records)
- `data/programs/` — 9 destination country collections (28 `AVAILABLE_VERIFIED` + `PUBLISHED` programs)
- `data/visa-details/` — 1 verified visa detail file (`us-TOU-001.json`)
- `data/routes/` — `matrix-compact.json` + `overrides/{ae,in,us}.json` (3 curated bilateral corridors)
- `data/verification/` — `claims.json` (1), `evidence.json` (1), `quarantine.json` (229 recoverable records), `batch-state.json`
- `data/changelog/` — `latest.json` (8 verified entries)
- `data/editorial/` — `published/` (2 Markdown guides), `drafts/` (3 isolated Markdown drafts)
- `data/export_manifest.json` — Complete SHA-256 inventory and reconciliation manifest
- `data/schema_manifest.json` — Updated to `phase: "PHASE_3_STATIC_CATALOG_POPULATED"`, `bulkMigrationExecuted: true`

---

## 6. CLI Usage

```bash
# Preview export deterministically without writing to disk
./node_modules/.bin/tsx scripts/exportCatalogToStatic.ts --dry-run

# Execute authoritative static catalog export into data/
npm run catalog:export

# Export to an isolated temporary directory (used in automated tests)
./node_modules/.bin/tsx scripts/exportCatalogToStatic.ts --out /tmp/catalog-test
```
