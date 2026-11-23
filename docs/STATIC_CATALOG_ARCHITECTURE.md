# VisaApply.org — Static Catalog Architecture Specification

- **Architecture Track:** Option B — Zero-Database-First / Database-Light Architecture
- **Phase:** Phase 2 — Static Data Schemas & Canonical Source-of-Truth Architecture
- **Schema Version:** `2.0.0`
- **Status:** Canonical Contract & Directory Skeleton Established (Bulk data migration deferred to Phase 3+)

---

## 1. Architectural Principles

1. **GitHub as the Authoritative Source of Truth:** Public immigration catalog data lives in version-controlled JSON and Markdown files under `data/`. Every change is auditable via Git history and pull requests.
2. **Zero Runtime Database Dependency for Public Read Traffic:** Public pages (country hubs, visa detail pages, search/filtering, bilateral routes, official source registries, editorial articles, and changelogs) are served from static JSON chunks and generated indexes — never requiring Neon, Supabase, or SQLite at runtime.
3. **Never Materialize 61,752 Duplicated Full Route Files:** Bilateral coverage across all 249 ISO countries (`249 × 248 = 61,752` ordered pairs) is modeled as:
   - One compact base rule matrix (`data/routes/matrix-compact.json`) — extending the existing compact passport/bloc logic in `src/data/anyToAnyLight.ts`, plus
   - Sparse destination-partitioned verified override files (`data/routes/overrides/<destination-iso2>.json`).
4. **Lazy-Loaded, Content-Hashed Static Chunks:** Browser clients fetch only the lightweight search index initially and lazy-load per-country or per-program JSON chunks on demand.
5. **Non-Destructive Quarantine Preservation:** Unverified, pending, expired, conflicting, or broken-source records are preserved in `data/verification/quarantine.json` with `recoverable: true` — never silently deleted, and never leaked into public search indexes or sitemaps.

---

## 2. Canonical `data/` Directory Layout

```text
data/
├── README.md                              # Pointer to architecture & schema docs
├── schema_manifest.json                   # Structural manifest (schemaVersion, phase, directory contracts)
├── countries/
│   └── <iso2>.json                        # 1 file per ISO-2 country (lowercase, e.g., us.json, gb.json, in.json)
├── routes/
│   ├── matrix-compact.json                # Compact bilateral rule matrix (249x248 base rules; never 61,752 copies)
│   └── overrides/
│       └── <destination-iso2>.json        # Sparse verified bilateral route overrides grouped by destination ISO-2
├── programs/
│   └── <destination-iso2>.json            # Array of ImmigrationProgramRecord entries per destination ISO-2
├── visa-details/
│   └── <program-id>.json                  # Structured VisaDetailRecord per program (lazy-loaded on detail page)
├── official-sources/
│   └── <iso2>.json                        # Verified OfficialSourceRecord array per country ISO-2
├── verification/
│   ├── claims.json                        # Structured ClaimRecord registry (claim-to-program & claim-to-source links)
│   ├── evidence.json                      # Structured EvidenceRecord registry (excerpt, access date, HTTP status)
│   ├── quarantine.json                    # Preserved QuarantineRecord entries (recoverable=true; excluded from public index)
│   └── batch-state.json                   # Resumable GitHub Actions verification checkpoint state (Phase 4+)
├── changelog/
│   └── latest.json                        # Verified ChangelogRecord entries (chronologically ordered, newest first)
└── editorial/
    ├── published/
    │   └── <slug>.md                      # Published Markdown articles with validated YAML frontmatter
    └── drafts/
        └── <slug>.md                      # Draft Markdown articles (excluded from public index & sitemap)
```

> **Phase 2 Boundary:** In Phase 2, all directories above exist as a clean skeleton (`data/README.md`, `data/schema_manifest.json`, and `.gitkeep` placeholders). Bulk export/migration from `src/data/*.ts`, `content/*.md`, and `data_db/immigration_hub.db` is intentionally deferred until Phase 3/4 after the static catalog validator and index builder are in place.

---

## 3. File Formats, Naming Rules & Schema Mapping

| Directory / Path | Format | Filename Pattern | Authoritative Schema Validator |
| :--- | :--- | :--- | :--- |
| `data/countries/<iso2>.json` | JSON object | `^[a-z]{2}\.json$` (member of 249 ISO registry) | `validateCountryRecord` |
| `data/routes/matrix-compact.json` | JSON object | Fixed filename | Compact bilateral rule matrix (Phase 3 builder) |
| `data/routes/overrides/<destination-iso2>.json` | JSON array | `^[a-z]{2}\.json$` | `validateBilateralRouteOverride` (per item) |
| `data/programs/<destination-iso2>.json` | JSON array | `^[a-z]{2}\.json$` | `validateProgramCollection` |
| `data/visa-details/<program-id>.json` | JSON object | `<programId>.json` (validated via `isValidProgramId`) | `validateVisaDetailRecord` |
| `data/official-sources/<iso2>.json` | JSON array | `^[a-z]{2}\.json$` | `validateOfficialSourceRecord` (per item) |
| `data/verification/claims.json` | JSON array | Fixed filename | `validateClaimRecord` + `validateClaimEvidenceLinkage` |
| `data/verification/evidence.json` | JSON array | Fixed filename | `validateEvidenceRecord` + `validateClaimEvidenceLinkage` |
| `data/verification/quarantine.json` | JSON array | Fixed filename | `validateQuarantineRecord` (per item) |
| `data/changelog/latest.json` | JSON array | Fixed filename | `validateChangelogRecord` (per item) |
| `data/editorial/published/<slug>.md` | Markdown + YAML frontmatter | `^[a-z0-9]+(?:-[a-z0-9]+)*\.md$` | `validateEditorialArticleRecord` (`editorialStatus: 'published'`) |
| `data/editorial/drafts/<slug>.md` | Markdown + YAML frontmatter | `^[a-z0-9]+(?:-[a-z0-9]+)*\.md$` | `validateEditorialArticleRecord` (`editorialStatus: 'draft'`) |

---

## 4. Scalability & Lazy-Loading Strategy (249 Countries / 61,752 Routes / 15 Languages)

To keep browser bundle sizes minimal and page loads near-instant on zero-cost static hosting:

1. **Build-Time Generated Indexes (Phase 3):**
   - `public/catalog/index-countries.json` — Compact list of 249 country slugs, codes, localized display labels, and verified program counts.
   - `public/catalog/index-programs.json` — Only records passing `isEligibleForPublicCatalogIndex(...)` (stripped of verbose sections, optimized for client search & category filtering).
   - `public/catalog/manifest.json` — Content SHA-256 hashes per generated chunk for immutable CDN cache-busting.
2. **On-Demand Country & Detail Chunks:**
   - Navigating to `/country/ca` fetches only `programs/ca.json` and `official-sources/ca.json`.
   - Navigating to `/visa/ca-express-entry` fetches only `visa-details/ca-express-entry.json` and its linked claim/evidence slice.
   - Navigating to a bilateral route `/visa/in-to-ca` evaluates `routes/matrix-compact.json` merged with `routes/overrides/ca.json` (never downloading 61,752 pairs).
3. **Strict Public Index Boundary:**
   - Nothing inside `data/verification/quarantine.json` or `data/editorial/drafts/` is ever emitted into `public/catalog/` or `public/sitemap*.xml`.

---

## 5. Legacy Compatibility & Non-Destructive Transition

During Phase 2, all existing runtime modules remain 100% intact and untouched:

- `src/data/all249Countries.ts` (authoritative 249 ISO registry)
- `src/data/globalImmigrationHubData.ts` (legacy TypeScript program catalog — adapted via `adaptLegacyProgramToStaticRecord`)
- `src/data/officialSourceRegistry.ts` (legacy 249-country source registry — adapted via `adaptLegacyOfficialSourceToStaticRecord`)
- `src/data/immigrationChangelog.json` (legacy changelog — adapted via `adaptLegacyChangelogToStaticRecord`)
- `src/data/anyToAnyLight.ts` (compact bilateral matrix seed)
- `content/*.md` (existing Markdown guides)
- `data_db/immigration_hub.db` and `backups/phase_b3_verified_2026-11-23T10-31-07-923Z_ac57/` (completely untouched read-only snapshots)
