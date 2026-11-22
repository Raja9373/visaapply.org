-- ============================================================================
-- VisaApply.org — Neon PostgreSQL Least-Privilege Application Role Setup
-- ============================================================================
-- PURPOSE:
--   Human-reviewed SQL script for creating a dedicated, least-privilege
--   application runtime read/write role (`visaapply_app_rw`) in Neon PostgreSQL.
--   This role is used exclusively by `NEON_APP_DATABASE_URL` for authorized
--   application writes, admin operations, and scheduled automation jobs.
--
-- ROLE SEPARATION ARCHITECTURE:
--   1. `neondb_owner` (or designated migration admin role) -> NEON_MIGRATION_DATABASE_URL
--      Used ONLY for CLI schema migrations and DBA maintenance. NEVER placed in
--      Vercel runtime environment variables or used by public/admin API endpoints.
--   2. `visaapply_app_rw` -> NEON_APP_DATABASE_URL
--      Used by authorized runtime write endpoints, admin mutations, and cron jobs.
--      Holds explicit DML (`SELECT, INSERT, UPDATE, DELETE`) ONLY on application
--      tables. Cannot create tables, alter schema, truncate tables, or mutate
--      `schema_migrations`.
--   3. `visaapply_audit_ro` -> NEON_READONLY_DATABASE_URL (see NEON_READONLY_ROLE_SETUP.sql)
--      Used by public read endpoints and read-only preflight verification.
--      Strictly read-only (`default_transaction_read_only = on`).
--
-- SAFETY NOTICE:
--   1. DO NOT execute blindly. Review Part 0 discovery output in Neon SQL Editor
--      first to confirm the target database name (`<TARGET_DB_NAME>`) and which
--      tables exist (Migrations 001-003 vs Migration 004).
--   2. NEVER commit real passwords or connection strings into source control.
--      Replace `<REPLACE_WITH_MIN_32_CHAR_PASSWORD>` and `<TARGET_DB_NAME>`
--      privately inside the Neon SQL Editor before execution.
--   3. This script DOES NOT execute migrations, modify data, or alter `neondb_owner`.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- PART 0: SCHEMA-DISCOVERY CHECKLIST (Run Read-Only Before Creating Role)
-- ----------------------------------------------------------------------------
SELECT
  current_database() AS target_database_name,
  current_user       AS executing_admin_role,
  current_schema()   AS current_schema_name,
  version()          AS postgres_server_version;

SELECT
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT
  rolname,
  rolsuper,
  rolcreaterole,
  rolcreatedb,
  rolcanlogin,
  rolbypassrls,
  rolconnlimit
FROM pg_roles
WHERE rolname NOT LIKE 'pg\_%' ESCAPE '\'
ORDER BY rolname;


-- ----------------------------------------------------------------------------
-- PART 1: CREATE DEDICATED LEAST-PRIVILEGE RUNTIME APPLICATION ROLE
-- ----------------------------------------------------------------------------
-- Creates `visaapply_app_rw` with login enabled and ALL administrative,
-- schema-creation, replication, and RLS-bypass flags disabled.
-- Replace `<REPLACE_WITH_MIN_32_CHAR_PASSWORD>` privately in Neon SQL Editor.

CREATE ROLE visaapply_app_rw WITH
  LOGIN
  PASSWORD '<REPLACE_WITH_MIN_32_CHAR_PASSWORD>'
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS
  CONNECTION LIMIT 20;

-- Enforce bounded query, lock, and idle transaction timeouts at the role level
-- to protect Neon serverless compute from runaway queries or hung transactions:
ALTER ROLE visaapply_app_rw SET statement_timeout = '10s';
ALTER ROLE visaapply_app_rw SET lock_timeout = '5s';
ALTER ROLE visaapply_app_rw SET idle_in_transaction_session_timeout = '15s';


-- ----------------------------------------------------------------------------
-- PART 2: DATABASE & SCHEMA ACCESS (MINIMUM REQUIRED ONLY — NO DDL)
-- ----------------------------------------------------------------------------
-- Replace `<TARGET_DB_NAME>` with the exact `target_database_name` from Part 0.
GRANT CONNECT ON DATABASE "<TARGET_DB_NAME>" TO visaapply_app_rw;
REVOKE TEMPORARY ON DATABASE "<TARGET_DB_NAME>" FROM visaapply_app_rw;

-- Grant schema lookup (`USAGE`) only; explicitly deny `CREATE` on `public`
-- so runtime application credentials can NEVER create tables, views, or functions.
GRANT USAGE ON SCHEMA public TO visaapply_app_rw;
REVOKE CREATE ON SCHEMA public FROM visaapply_app_rw;


-- ----------------------------------------------------------------------------
-- PART 3: EXPLICIT TABLE-LEVEL DML GRANTS (NO WILDCARDS, NO DDL, NO TRUNCATE)
-- ----------------------------------------------------------------------------

-- [Tier 0] Migration Metadata Table (READ-ONLY for runtime role!):
-- Runtime endpoints may inspect applied migration status for health checks,
-- but may NEVER insert, update, delete, or tamper with `schema_migrations`.
GRANT SELECT ON TABLE public.schema_migrations TO visaapply_app_rw;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.schema_migrations
  FROM visaapply_app_rw;

-- [Tier 1] Core Enrichment & Consular Registry Tables (Migrations 001-002):
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.batch_state          TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.immigration_programs TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.visa_details         TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.visa_detail_claims   TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.visa_detail_evidence TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.visa_detail_versions TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.changelog_entries    TO visaapply_app_rw;

-- [Tier 2] Operational Reliability & Automation Tables (Migration 003):
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cron_execution_logs    TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.automation_job_locks   TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.automation_checkpoints TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.automation_dead_letter TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.operational_events     TO visaapply_app_rw;

-- [Tier 3] Serverless Unification Tables (Migration 004 — execute AFTER Migration 004 runs):
-- Skip this block if Migration 004 has not yet been applied to the target Neon branch.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.slot_subscribers       TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.slot_embassy_status    TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.slot_email_logs        TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.editorial_articles     TO visaapply_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_revoked_sessions TO visaapply_app_rw;

-- Defense-in-depth revocation of destructive/DDL-adjacent privileges on all app tables:
REVOKE TRUNCATE, REFERENCES, TRIGGER
  ON TABLE
    public.batch_state,
    public.immigration_programs,
    public.visa_details,
    public.visa_detail_claims,
    public.visa_detail_evidence,
    public.visa_detail_versions,
    public.changelog_entries,
    public.cron_execution_logs,
    public.automation_job_locks,
    public.automation_checkpoints,
    public.automation_dead_letter,
    public.operational_events,
    public.slot_subscribers,
    public.slot_embassy_status,
    public.slot_email_logs,
    public.editorial_articles,
    public.admin_revoked_sessions
  FROM visaapply_app_rw;

-- NOTE ON DEFAULT PRIVILEGES:
-- We intentionally DO NOT set broad `ALTER DEFAULT PRIVILEGES` so any future
-- sensitive or migration-only table requires explicit administrator review
-- before granting access to `visaapply_app_rw`.

-- NOTE FOR `visaapply_audit_ro` AFTER MIGRATION 004:
-- Only public-safe Tier 3 tables should be granted SELECT to `visaapply_audit_ro`:
--   GRANT SELECT ON TABLE public.slot_embassy_status, public.editorial_articles TO visaapply_audit_ro;
-- Do NOT grant `visaapply_audit_ro` broad SELECT on PII-bearing `slot_subscribers`
-- unless strictly required for aggregate-count endpoints (or use a SECURITY DEFINER
-- aggregate view exposing counts only).


-- ----------------------------------------------------------------------------
-- PART 4: PRIVILEGE & ISOLATION VERIFICATION QUERIES
-- ----------------------------------------------------------------------------
-- Execute as administrator immediately after Part 3 to verify effective grants:

-- 4A. Confirm zero elevated role attributes and expected timeout settings:
SELECT
  rolname,
  rolcanlogin,
  rolsuper,
  rolcreatedb,
  rolcreaterole,
  rolreplication,
  rolbypassrls,
  rolconnlimit,
  rolconfig
FROM pg_roles
WHERE rolname = 'visaapply_app_rw';

-- 4B. Confirm `visaapply_app_rw` has USAGE (true) and NO CREATE (false) on `public`,
--     and NO TEMP database privilege:
SELECT
  has_schema_privilege('visaapply_app_rw', 'public', 'USAGE')              AS has_schema_usage,
  has_schema_privilege('visaapply_app_rw', 'public', 'CREATE')             AS has_schema_create,
  has_database_privilege('visaapply_app_rw', current_database(), 'TEMP')   AS has_db_temp;

-- 4C. Confirm exact table-level grants (`schema_migrations` MUST be SELECT-only;
--     TRUNCATE MUST be false on every table):
SELECT
  t.tablename,
  has_table_privilege('visaapply_app_rw', format('public.%I', t.tablename), 'SELECT')   AS can_select,
  has_table_privilege('visaapply_app_rw', format('public.%I', t.tablename), 'INSERT')   AS can_insert,
  has_table_privilege('visaapply_app_rw', format('public.%I', t.tablename), 'UPDATE')   AS can_update,
  has_table_privilege('visaapply_app_rw', format('public.%I', t.tablename), 'DELETE')   AS can_delete,
  has_table_privilege('visaapply_app_rw', format('public.%I', t.tablename), 'TRUNCATE') AS can_truncate
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.tablename;


-- ----------------------------------------------------------------------------
-- PART 5: REVOCATION / CLEANUP PROCEDURE (RUN IF DECOMMISSIONING ROLE)
-- ----------------------------------------------------------------------------
/*
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM visaapply_app_rw;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM visaapply_app_rw;
REVOKE USAGE ON SCHEMA public FROM visaapply_app_rw;
REVOKE CONNECT ON DATABASE "<TARGET_DB_NAME>" FROM visaapply_app_rw;
DROP ROLE IF EXISTS visaapply_app_rw;
*/
