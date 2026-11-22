# VisaApply.org — Future Staging Neon PostgreSQL Setup & Role Permissions Guide

> **STATUS:** Reference specification for a **future** authorized staging test.
> **DO NOT** run live migrations, alter production Neon branches, or commit credentials.
> No live Neon connection has been performed; all Phase B.1 / B.2 tests currently run against isolated mocks, isolated in-memory PGlite, and isolated temporary SQLite databases.

---

## 1. Exact Environment Variables Required

Never place real credentials in source code, `.env.example`, chat, or client bundles (`VITE_*`). Configure each variable strictly in the environment scope shown below.

| Environment Variable | Required Where | Neon Endpoint Type | Database Role | Required TLS Setting | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `DB_DRIVER` | Optional (`postgres` default; ignored in production/Vercel) | N/A | N/A | N/A | Set `postgres` in staging/production. `sqlite` is **only** honored locally when `NODE_ENV !== 'production'` and `VERCEL` is unset. |
| `NEON_READONLY_DATABASE_URL` | **Vercel Preview / Staging / Production Runtime** | **Pooled** (`-pooler.<region>.aws.neon.tech`) | `visaapply_audit_ro` | `sslmode=verify-full` | Used by `getReadOnlyRepository()` for public read endpoints, catalog queries, and read-only health/audit checks. |
| `NEON_APP_DATABASE_URL` | **Vercel Preview / Staging / Production Runtime** | **Pooled** (`-pooler.<region>.aws.neon.tech`) | `visaapply_app_rw` | `sslmode=verify-full` | Used by `getReadWriteRepository()` for authorized runtime writes, admin edits, slot-alert subscriptions, session revocation, and cron runs. |
| `NEON_MIGRATION_DATABASE_URL` | **Authorized CLI / CI Migration Runner ONLY** (**NEVER** in Vercel Runtime) | **Direct / Unpooled** (no `-pooler.`) | `neondb_owner` (or dedicated migration admin role) | `sslmode=verify-full` | Used exclusively by `getMigrationRepository()` to run tracked schema migrations (`001`–`004`). |
| `NEON_TEST_DATABASE_URL` | **Staging / Ephemeral CI Test Branch ONLY** (Optional) | Direct or Pooled (non-production branch only) | Dedicated staging test role | `sslmode=verify-full` | Used only for isolated integration tests targeting a disposable Neon branch. Never point to production. |
| `VISAAPPLY_SQLITE_PATH` | **Local Dev ONLY** (when `DB_DRIVER=sqlite`) | Local file path | N/A | N/A | Explicit local SQLite file path for offline developer workflows. Strictly blocked in production and Vercel. |

### Connection URI Format (Placeholders Only)
```text
# Vercel Preview / Staging / Production Runtime (Pooled endpoints, least-privilege roles):
NEON_READONLY_DATABASE_URL=postgresql://visaapply_audit_ro:<MIN_32_CHAR_RO_PASSWORD>@ep-<staging-branch>-pooler.<region>.aws.neon.tech/<target_db>?sslmode=verify-full
NEON_APP_DATABASE_URL=postgresql://visaapply_app_rw:<MIN_32_CHAR_RW_PASSWORD>@ep-<staging-branch>-pooler.<region>.aws.neon.tech/<target_db>?sslmode=verify-full

# Authorized CLI / CI Migration Runner ONLY (Direct unpooled endpoint — DO NOT add to Vercel runtime):
NEON_MIGRATION_DATABASE_URL=postgresql://<migration_owner_role>:<MIGRATION_PASSWORD>@ep-<staging-branch>.<region>.aws.neon.tech/<target_db>?sslmode=verify-full
```

---

## 2. Strict Role Separation & Permissions Matrix

Three distinct PostgreSQL roles enforce least privilege across all database operations:

### 2.1 Role Attributes, Session Limits & Schema Privileges

| Capability / Setting | `visaapply_audit_ro` (`NEON_READONLY_DATABASE_URL`) | `visaapply_app_rw` (`NEON_APP_DATABASE_URL`) | `neondb_owner` / Migration Role (`NEON_MIGRATION_DATABASE_URL`) |
| :--- | :--- | :--- | :--- |
| SQL Provisioning Script | `docs/NEON_READONLY_ROLE_SETUP.sql` | `docs/NEON_APP_ROLE_SETUP.sql` | Managed by Neon project/branch |
| `LOGIN` | Yes | Yes | Yes |
| `SUPERUSER / CREATEDB / CREATEROLE / REPLICATION / BYPASSRLS` | **All NO** | **All NO** | Neon project owner defaults |
| `CONNECTION LIMIT` | `5` (increase to `15` if staging public read load requires) | `20` | Neon default (migration runner caps pool `max: 1`) |
| `default_transaction_read_only` | **`on`** (enforced at role + session level) | `off` | `off` |
| `statement_timeout` | `15s` role / `10s` session | `10s` role + session | `10s` default (overridable for DDL) |
| `lock_timeout` | `5s` session | `5s` role + session | `5s` default |
| `idle_in_transaction_session_timeout` | `15s` role + session | `15s` role + session | `15s` |
| `CONNECT ON DATABASE` | `GRANT` | `GRANT` | Owner |
| `TEMPORARY ON DATABASE` | **`REVOKE`** | **`REVOKE`** | Owner |
| `USAGE ON SCHEMA public` | `GRANT` | `GRANT` | Owner |
| `CREATE ON SCHEMA public` (DDL) | **`REVOKE` (DENIED)** | **`REVOKE` (DENIED)** | Owner (`GRANT` for CLI migrations only) |
| Permitted in Vercel Runtime? | **YES** | **YES** | **NO — Blocked by `OWNER_ROLE_FORBIDDEN_IN_RUNTIME`** |

### 2.2 Table-by-Table Permission Matrix (Migrations 001–004)

| Migration Tier | Table Name | `visaapply_audit_ro` | `visaapply_app_rw` | Migration Role | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 0** | `public.schema_migrations` | `SELECT` only | `SELECT` only (**No writes**) | `ALL` (DDL + tracking) | Runtime can verify migration state; cannot tamper with history. |
| **Tier 1 (001–002)** | `public.batch_state` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | Owner | Secrets redacted via `redactSensitiveData()` before write. |
| **Tier 1 (001–002)** | `public.immigration_programs` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | Owner | 36-column registry (35 mutable fields updated on upsert). |
| **Tier 1 (001–002)** | `public.visa_details` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | Owner | Migration 004 adds `UNIQUE` index on `program_id`. |
| **Tier 1 (001–002)** | `public.visa_detail_claims` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | Owner | 5-tier claim integrity & verification records. |
| **Tier 1 (001–002)** | `public.visa_detail_evidence` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | Owner | Official evidence linked to claims. |
| **Tier 1 (001–002)** | `public.visa_detail_versions` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | Owner | Immutable snapshot & restore history. |
| **Tier 1 (001–002)** | `public.changelog_entries` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | Owner | Policy change audit trail. |
| **Tier 2 (003)** | `public.cron_execution_logs` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | Owner | Scheduled automation execution records. |
| **Tier 2 (003)** | `public.automation_job_locks` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | Owner | Distributed lease locks preventing overlapping cron runs. |
| **Tier 2 (003)** | `public.automation_checkpoints` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | Owner | Resumable batch processing checkpoints. |
| **Tier 2 (003)** | `public.automation_dead_letter` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | Owner | Quarantined automation failure queue. |
| **Tier 2 (003)** | `public.operational_events` | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` | Owner | Redacted operational telemetry. |
| **Tier 3 (004)** | `public.slot_embassy_status` | `SELECT` (grant after M004) | `SELECT, INSERT, UPDATE, DELETE` | Owner | Public-safe embassy wait status. |
| **Tier 3 (004)** | `public.editorial_articles` | `SELECT` (grant after M004) | `SELECT, INSERT, UPDATE, DELETE` | Owner | Published/draft editorial guides (public endpoints filter `status = 'published'`). |
| **Tier 3 (004)** | `public.slot_subscribers` | **NONE** (PII isolation) | `SELECT, INSERT, UPDATE, DELETE` | Owner | Contains subscriber emails. Do **not** grant broad `SELECT` to `visaapply_audit_ro` (use aggregate count via `app_rw` or a count-only view). |
| **Tier 3 (004)** | `public.slot_email_logs` | **NONE** | `SELECT, INSERT, UPDATE, DELETE` | Owner | Hashed recipient delivery audit trail. |
| **Tier 3 (004)** | `public.admin_revoked_sessions` | **NONE** | `SELECT, INSERT, UPDATE, DELETE` | Owner | Revoked admin JWT `jti` blocklist checked during admin auth. |

> **Explicitly Revoked Across ALL Tables for Runtime Roles:** `TRUNCATE`, `REFERENCES`, `TRIGGER`, `CREATE`, `ALTER`, `DROP`.

---

## 3. Fail-Safe Runtime Guarantees When Credentials Are Absent or Invalid

When running in production (`NODE_ENV=production`) or Vercel (`VERCEL=1` / `VERCEL_ENV` set), `src/db/databaseProvider.ts` and `src/db/postgresDatabase.ts` enforce strict fail-closed behavior with **zero silent fallback** to SQLite or in-memory PGlite:

| Misconfiguration Scenario | Error Code (`DatabaseConfigurationError.code`) | HTTP Status | Public Safe Message | Behavior |
| :--- | :--- | :---: | :--- | :--- |
| Missing `NEON_READONLY_DATABASE_URL` or `NEON_APP_DATABASE_URL` | `POSTGRES_CREDENTIALS_MISSING` | `503` | `Database service is temporarily unavailable.` | Throws immediately before opening any socket or file. |
| Unreplaced template or example host (e.g., `ep-example...`, `<REPLACE_WITH...>`) | `POSTGRES_PLACEHOLDER_URL` | `503` | `Database service is temporarily unavailable.` | Rejected before pool initialization; never leaks password. |
| Malformed URI or wrong scheme (`http://`, `mysql://`) | `POSTGRES_INVALID_URI` / `POSTGRES_INVALID_PROTOCOL` | `503` | `Database service is temporarily unavailable.` | Rejected safely without echoing raw URI. |
| Insecure `sslmode` (`disable`, `allow`, `prefer`, `no-verify`) | `POSTGRES_INSECURE_TLS_FORBIDDEN` | `503` | `Database service is temporarily unavailable.` | Rejected; strict `ssl: { rejectUnauthorized: true }` enforced. |
| `localhost` / `127.0.0.1` in Vercel runtime | `POSTGRES_LOCALHOST_FORBIDDEN_ON_VERCEL` | `503` | `Database service is temporarily unavailable.` | Rejected immediately. |
| Owner/superuser role (`neondb_owner`, `postgres`, `*_owner`, `*_admin`) in runtime URL | `OWNER_ROLE_FORBIDDEN_IN_RUNTIME` | `503` | `Database service is temporarily unavailable.` | Blocked on `readonly` and `app_rw`; permitted only on `migration`. |
| `DB_DRIVER=sqlite` in production/Vercel | Ignored (`resolveConfiguredDatabaseDriver` returns `postgres`) / `SQLITE_FORBIDDEN_IN_PRODUCTION` | `503` | `Database service is temporarily unavailable.` | `better-sqlite3` is never imported or opened in production. |
| `allowPglite: true` or `mockExecutor` in production/Vercel | `PRODUCTION_PGLITE_FORBIDDEN` / `MOCK_EXECUTOR_FORBIDDEN_IN_PRODUCTION` | `503` | `Database service is temporarily unavailable.` | Blocked immediately. |

---

## 4. Future Staging Test Execution Sequence (DO NOT RUN YET)

When ready to perform an authorized **staging-only** verification on a dedicated Neon staging branch:

1. **Create an isolated Neon Staging Branch** cloned from your target Neon database (never test directly on the production branch).
2. **Provision least-privilege roles** privately in the Neon SQL Editor on the **staging branch**:
   - Execute `docs/NEON_READONLY_ROLE_SETUP.sql` (`visaapply_audit_ro`) with a strong unique ≥32-character password and verify Part 4 queries return `has_schema_create = false` and `can_insert/update/delete/truncate = false`.
   - Execute `docs/NEON_APP_ROLE_SETUP.sql` (`visaapply_app_rw`) with a distinct strong ≥32-character password and verify Part 4 queries confirm `schema_migrations` is `SELECT`-only, `has_schema_create = false`, and `can_truncate = false` on all tables.
3. **Run Zero-Network Pre-Flight Validation** (`validateDatabaseProviderConfig(process.env)`) in the staging shell to confirm:
   - `ready === true`, `errors.length === 0`, and zero role-overlap or Vercel-migration-URL warnings.
4. **Execute Read-Only Preflight Against Staging Branch** using `NEON_READONLY_DATABASE_URL` only to inspect existing tables, row counts, and `schema_migrations`.
5. **Run Tracked Migration 004 on Staging Branch** using `NEON_MIGRATION_DATABASE_URL` via `getMigrationRepository().runTrackedMigrations()` and re-run Tier 3 `GRANT` statements from `docs/NEON_APP_ROLE_SETUP.sql`.
6. **Verify Runtime Role Enforcement on Staging Branch**:
   - Confirm `getReadOnlyRepository()` can read public tables and PostgreSQL rejects any attempted write.
   - Confirm `getReadWriteRepository()` can execute DML on Tier 1–3 tables and PostgreSQL rejects DDL (`CREATE TABLE`) and writes to `schema_migrations`.
7. **Rollback / Cleanup:** If staging verification uncovers issues, drop or reset the isolated staging branch without affecting production data or `data_db/immigration_hub.db`.
