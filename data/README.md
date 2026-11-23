# VisaApply.org Canonical Static Catalog (`data/`)

- **Schema Version:** `2.0.0`
- **Current Phase:** Phase 2 — Canonical Directory Skeleton Only (`bulkMigrationExecuted: false`)

This directory is the canonical Git-versioned source of truth for VisaApply.org's zero-database-first static immigration catalog.

No bulk data migration has been executed yet in Phase 2. Population of static JSON/Markdown files, catalog validation scripts, search index generation, and valid-only sitemap generation are scheduled for Phase 3+.

## Specifications

- Directory & chunking layout: [`docs/STATIC_CATALOG_ARCHITECTURE.md`](../docs/STATIC_CATALOG_ARCHITECTURE.md)
- Deterministic ID rules & blocklist: [`docs/STATIC_CATALOG_ID_RULES.md`](../docs/STATIC_CATALOG_ID_RULES.md)
- Trust, quarantine & verification policy: [`docs/STATIC_CATALOG_TRUST_POLICY.md`](../docs/STATIC_CATALOG_TRUST_POLICY.md)
- Runtime validators & TypeScript contracts: [`src/schemas/README.md`](../src/schemas/README.md)
