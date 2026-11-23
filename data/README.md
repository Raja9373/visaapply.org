# VisaApply.org Canonical Static Catalog (`data/`)

- **Schema Version:** `2.0.0`
- **Current Phase:** Phase 3 — Populated Authoritative Static Catalog (`data/export_manifest.json`)

This directory is the **authoritative Git-versioned source of truth** for VisaApply.org's zero-database-first static immigration catalog.

Generated build-time search indexes, lazy chunks, and static sitemaps are written separately to `public/catalog/` and `public/sitemaps-static/` and must never be edited by hand.

## Pipeline Commands

- Export deterministically from authoritative sources + verified Phase B.3 backup: `npm run catalog:export`
- Validate every file under `data/` (17 strict checks): `npm run catalog:validate`
- Build content-hashed search indexes & lazy chunks into `public/catalog/`: `npm run catalog:build-indexes`
- Generate valid-only static catalog sitemaps into `public/sitemaps-static/`: `npm run catalog:sitemaps`

## Specifications

- Directory & chunking layout: [`docs/STATIC_CATALOG_ARCHITECTURE.md`](../docs/STATIC_CATALOG_ARCHITECTURE.md)
- Deterministic ID rules & blocklist: [`docs/STATIC_CATALOG_ID_RULES.md`](../docs/STATIC_CATALOG_ID_RULES.md)
- Trust, quarantine & verification policy: [`docs/STATIC_CATALOG_TRUST_POLICY.md`](../docs/STATIC_CATALOG_TRUST_POLICY.md)
- Phase 3 Export / Validation / Index / Sitemap Reports: `docs/PHASE3_*.md`
