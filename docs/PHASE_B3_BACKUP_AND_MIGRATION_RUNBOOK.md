# VisaApply.org — Phase B.3 WAL-Safe Backup, Migration Engine & Parity Verification Runbook

> **CRITICAL ENVIRONMENT NOTICE (`MOCK_VERIFICATION` ONLY):**
> Live Neon PostgreSQL connectivity, live migrations, and production deployments have **NOT** been executed in Phase B.3 (`liveNeonVerified = false`). All migration and parity tools in Phase B.3 default to `--dry-run` and execute verification exclusively against an isolated local PGlite/mock destination (`MOCK_VERIFICATION`). Do **NOT** execute against live Neon without an authorized Phase B.4 cutover window and explicit `NEON_MIGRATION_DATABASE_URL` provisioning.

---

## 1. WAL-Safe SQLite Backup Procedure

Live SQLite runs in WAL (`Write-Ahead Log`) mode (`data_db/immigration_hub.db`, `data_db/immigration_hub.db-wal`, `data_db/immigration_hub.db-shm`). Copying only the base `.db` file risks missing uncheckpointed WAL transactions or corrupting page state.

**Command:**

```bash
npx tsx scripts/createVerifiedBackup.ts
```

Optional flags:
- `--dir <output-dir>`: Specify a non-existing target directory (otherwise creates `backups/phase_b3_verified_<timestamp>_<hex>/`).
- `--out <archive.tar.gz>`: Write compressed archive to a specific non-existing path.
- `--skip-verify`: Skip automatic inline restore verification (not recommended).
- `--overwrite`: Explicitly allow overwriting existing backup files (disabled by default via `EEXIST` guard).

**How it works (Source-Immutable):**
1. Records SHA-256 checksums and file sizes of source `.db`, `-wal`, and `-shm` without opening or writing to `data_db/`.
2. Copies `.db`, `-wal`, and `-shm` into an isolated temporary directory (`os.tmpdir()`).
3. Runs `PRAGMA wal_checkpoint(TRUNCATE)` on the temporary copy only, capturing `rawSourceInventory`.
4. If the isolated snapshot copy is missing Phase 4.4 tracked migrations (`001`, `002`, `003`), applies `runTrackedSqliteMigrations` **exclusively on the isolated copy** while preserving all existing table records byte-for-byte.
5. Uses the SQLite Online Backup API (`snapSourceDb.backup(...)`) to materialize a clean standalone `.db` snapshot (`immigration_hub_standalone.db`).
6. Verifies `PRAGMA integrity_check`, `PRAGMA foreign_key_check`, duplicate PKs, duplicate `visa_details.program_id`, orphans, and absence of deleted Phase 3.2 fixtures.
7. Computes deterministic canonical row digests (`tableSha256Digests`) and stages `src/db`, `src/data`, `src/types`, `content`, `docs`, root registries, and `.env.example` (strictly excluding `.env`, `.env.*`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `node_modules`, `dist`, `.git`).
8. Writes `visaapply_backup.tar.gz`, `backup_manifest.json`, and `immigration_hub_standalone.db` into the unique timestamped backup directory, then automatically runs `verifyBackupRestore`.

---

## 2. Isolated Backup Restore Verification Procedure

Never restore into the live `data_db/` directory during verification (`SAFETY_ABORT` is raised automatically if targeted at `data_db/`).

**Command:**

```bash
npx tsx scripts/verifyBackupRestore.ts --backup-dir backups/phase_b3_verified_<timestamp>_<hex>
# or
npx tsx scripts/verifyBackupRestore.ts --archive backups/phase_b3_verified_<timestamp>_<hex>/visaapply_backup.tar.gz
```

**Checks Performed:**
1. Archive integrity via `tar -xzf` into an isolated temporary directory.
2. Zero forbidden secret files (`.env*`, `*.pem`, `*.key`, etc.) in extracted tree.
3. Exact size + SHA-256 verification for every file listed in `backup_manifest.json`.
4. CSV structural readability checks.
5. `PRAGMA integrity_check === ok` and `PRAGMA foreign_key_check === 0`.
6. Presence of all **13 expected core SQLite tables**.
7. Presence and checksum verification of SQLite migration versions **`001`**, **`002`**, and **`003`**.
8. Exact row count match and deterministic `tableSha256Digests` match against the manifest.
9. Zero duplicate primary keys, zero duplicate `visa_details.program_id`, zero orphans, and zero deleted Phase 3.2 test fixtures.
10. Exits non-zero (`1`) on any verification failure.

---

## 3. Backup Manifest Structure (`manifestVersion: "1.1.0"`)

`backup_manifest.json` contains:
- `backupName`, `createdAt`, `archiveFormat` (`tar.gz`), `totalFiles`, `totalUncompressedBytes`, `excludedPatterns`.
- `databaseSnapshot`:
  - `relativePath`, `sizeBytes`, `sha256`, `walIncludedInSnapshot`.
  - `sourceFilesObserved`: byte sizes & SHA-256 checksums of `.db`, `-wal`, `-shm`.
  - `rawSourceInventory`: pre-normalization tables, row counts, and migrations recorded directly in the source copy (`schemaNormalizedOnIsolatedCopy`, `newlyAppliedMigrationsOnCopy`).
  - `integrityCheck`, `foreignKeyViolations`, `duplicateVisaDetailsProgramIds`, `orphanCounts`, `deletedPhase32FixturesFound`.
  - `tableCounts`, `tableSha256Digests`, `migrationsApplied`.
- `nonSqliteInventory` (PII-free):
  - `changelogJson` (`src/data/immigrationChangelog.json`)
  - `slotSubscribersJson` (`content/slot_subscribers.json`, `piiRedacted: true`, count + SHA-256 only — no emails)
  - `slotStatusJson` (`content/slot_status.json`, embassy count, `lastCheckTime`, SHA-256)
  - `immigrationSyncStateJson` (`content/immigration_sync_state.json`, marked `LEGACY_SUPERSEDED`, superseded by `["batch_state", "automation_job_locks"]`)
  - `publishedMarkdown` (`content/*.md`, slug + path + SHA-256 list)
  - `draftMarkdown` (`content/drafts/*.md`, slug + path + SHA-256 list)
- `files`: per-file `{ path, sizeBytes, sha256, mtimeIso }`.

---

## 4. Dry-Run Migration Procedure (`migrateSqliteToNeon.ts`)

`scripts/migrateSqliteToNeon.ts` enforces `--dry-run` by default, rejects `--execute`, rejects live Neon executors (`LIVE_NEON_FORBIDDEN_IN_PHASE_B3`), rejects `migration_export.json` (`UNAUTHORITATIVE_SOURCE_REJECTED`), and rejects direct reads from `data_db/immigration_hub.db` (`UNVERIFIED_SOURCE_REJECTED`).

**Commands:**

```bash
# Plan dry-run against isolated PGlite mock destination (default)
npx tsx scripts/migrateSqliteToNeon.ts --source backups/phase_b3_verified_<timestamp>_<hex> --dry-run

# Verify source checksums, column mappings, FKs, and plan determinism only
npx tsx scripts/migrateSqliteToNeon.ts --source backups/phase_b3_verified_<timestamp>_<hex> --verify-only

# Optionally save deterministic plan JSON artifact
npx tsx scripts/migrateSqliteToNeon.ts --source backups/phase_b3_verified_<timestamp>_<hex> --dry-run --out /tmp/b3_plan.json
```

**Data Source Mapping & Foreign-Key Import Order:**
1. `immigration_programs` (root parent)
2. `visa_details` (FK `program_id -> immigration_programs.id`, unique `program_id`)
3. `visa_detail_claims` (FK `program_id -> immigration_programs.id`)
4. `visa_detail_evidence` (FK `claim_id -> visa_detail_claims.id`)
5. `visa_detail_versions` (FK `program_id -> immigration_programs.id`)
6. `batch_state`
7. `changelog_entries` (merges SQLite `changelog_entries` + `src/data/immigrationChangelog.json` deterministically by `id`)
8. `cron_execution_logs`
9. `automation_job_locks`
10. `automation_checkpoints`
11. `automation_dead_letter`
12. `operational_events`
13. `slot_embassy_status` (from `content/slot_status.json`, Migration 004 target)
14. `slot_subscribers` (from `content/slot_subscribers.json`, Migration 004 target; PII redacted from all logs/reports)
15. `editorial_articles` (from `content/*.md` as `'published'` + `content/drafts/*.md` as `'draft'`, preserving YAML frontmatter JSON & Markdown body)

- SQLite `schema_migrations` is **never** raw-copied; PostgreSQL executes tracked `POSTGRES_MIGRATIONS` (`001`–`004`).
- `content/immigration_sync_state.json` is recorded as `LEGACY_SUPERSEDED` (`batch_state` + `automation_job_locks`) and skipped cleanly.

---

## 5. Parity Verification Procedure (`verifySqliteNeonParity.ts`)

**Command:**

```bash
npx tsx scripts/verifySqliteNeonParity.ts --source backups/phase_b3_verified_<timestamp>_<hex>
```

**Checks Executed (`verificationLabel: "MOCK_VERIFICATION"`, `liveNeonVerified: false`):**
- Row count & canonical primary-key-sorted SHA-256 table digest parity across all 15 unified tables.
- Missing record detection & unexpected extra record detection (subscriber emails SHA-256 redacted in output).
- Duplicate primary keys & duplicate `visa_details.program_id`.
- Foreign key integrity & orphan checks (`visa_details`, `visa_detail_claims`, `visa_detail_evidence`, `visa_detail_versions`).
- JSON column & source file syntax validation.
- Markdown frontmatter + body content digest comparison against `editorial_articles`.
- Confirmation that deleted Phase 3.2 fixtures (`test-phase-3-2-prog`, `test-p322-temp-001`, `test-p322-temp-002`, `pg-test-2106`, etc.) are absent.
- Exits non-zero (`1`) on any mismatch.

---

## 6. Recovery & Failure Scenarios

| Failure Code / Symptom | Meaning & Cause | Recovery Action |
|---|---|---|
| `BACKUP_SHA256_MISMATCH` / `TAR_EXTRACTION_FAILED` | Backup archive tampered or truncated | Discard archive; re-run `createVerifiedBackup.ts` or switch to an earlier verified timestamped backup. |
| `MISSING_CORE_TABLE` / `MISSING_MIGRATION_VERSION` | Archive predates Phase 4.4 normalization or was manually altered | Re-generate backup with `createVerifiedBackup.ts` (isolated copy normalization). |
| `UNKNOWN_SOURCE_COLUMN` / `UNMAPPED_DESTINATION_COLUMN` | Schema drift between SQLite and `TABLE_MAPPING_SPECS` / `POSTGRES_MIGRATIONS` | Update `TABLE_MAPPING_SPECS` and tracked PG migrations cleanly before planning cutover. |
| `INVALID_JSON_SOURCE` / `INVALID_JSON_VALUE` | Corrupt JSON file or SQLite `*_json` column | Inspect offending table/file in isolated temp extract, repair source validation, re-run backup. |
| `DELETED_FIXTURES_PRESENT` | Deleted Phase 3.2 test fixture reappeared | Abort migration immediately; isolate and purge fixture before creating a fresh backup. |
| `LIVE_NEON_FORBIDDEN_IN_PHASE_B3` | Attempted `--execute` or Neon remote connection in Phase B.3 | Expected fail-closed guard. Live Neon cutover requires separate Phase B.4 authorization. |

---

## 7. Future Staging / Phase B.4 Prerequisites

Before any future authorized staging test (Phase B.4):
1. Configure isolated Neon staging branch with distinct least-privilege roles (`docs/NEON_APP_ROLE_SETUP.sql`, `docs/NEON_READONLY_ROLE_SETUP.sql`).
2. Enforce `sslmode=verify-full` and set separate environment variables:
   - `NEON_MIGRATION_DATABASE_URL` (schema + data migration only)
   - `NEON_APP_DATABASE_URL` (application read/write)
   - `NEON_READONLY_DATABASE_URL` (public read-only endpoints)
   - `NEON_TEST_DATABASE_URL` (ephemeral test branch)
3. Apply tracked `POSTGRES_MIGRATIONS` (`001` through `004`).
4. Never use owner/superuser credentials (`neondb_owner`, `postgres`) in runtime Vercel deployments.

---

## 8. Verification Status Summary

- **Live Neon PostgreSQL Migration Status:** **NOT PERFORMED**
- **Live Neon Verification Status:** **NOT VERIFIED** (`liveNeonVerified = false`)
- **Automated Backup / Restore / Dry-Run / Parity Suite:** **MOCK_VERIFICATION** against isolated temporary SQLite snapshots and in-memory PGlite only.
