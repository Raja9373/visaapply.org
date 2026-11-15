-- ============================================================================
-- VisaApply.org — Neon PostgreSQL Least-Privilege Read-Only Role Setup
-- ============================================================================
-- PURPOSE:
--   Human-reviewed SQL script for creating a dedicated, strictly read-only
--   audit role (`visaapply_audit_ro`) in Neon PostgreSQL so automated
--   preflight verification can inspect schema, migrations, privileges, and
--   aggregate integrity counts without any write capability.
--
-- SAFETY NOTICE:
--   1. DO NOT execute blindly. Review the Schema Discovery Checklist (Part 0)
--      in the Neon SQL Editor first to confirm the target database name and
--      exact list of existing tables in schema `public`.
--   2. NEVER commit real passwords or connection strings into source control.
--      Replace `<REPLACE_WITH_MIN_32_CHAR_PASSWORD>` and `<TARGET_DB_NAME>`
--      privately inside the Neon SQL Editor before execution.
--   3. This script DOES NOT modify the existing application write role
--      (e.g. `neondb_owner`), existing data, or schema migrations.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- PART 0: SCHEMA-DISCOVERY CHECKLIST (Run Read-Only Before Creating Role)
-- ----------------------------------------------------------------------------
-- Run these read-only queries first in Neon SQL Editor to confirm the target
-- database name (`<TARGET_DB_NAME>`, typically `neondb`), existing roles, and
-- which of the 13 application tables already exist in `public`:

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
  rolbypassrls
FROM pg_roles
WHERE rolname NOT LIKE 'pg\_%' ESCAPE '\'
ORDER BY rolname;


-- ----------------------------------------------------------------------------
-- PART 1: CREATE DEDICATED LEAST-PRIVILEGE READ-ONLY ROLE
-- ----------------------------------------------------------------------------
-- Creates `visaapply_audit_ro` with login enabled and ALL administrative,
-- schema-creation, replication, and RLS-bypass flags disabled.
-- Replace `<REPLACE_WITH_MIN_32_CHAR_PASSWORD>` privately in Neon SQL Editor.

CREATE ROLE visaapply_audit_ro WITH
  LOGIN
  PASSWORD '<REPLACE_WITH_MIN_32_CHAR_PASSWORD>'
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS
  CONNECTION LIMIT 5;

-- Enforce read-only transactions and short bounded query/idle timeouts
-- whenever `visaapply_audit_ro` connects:
ALTER ROLE visaapply_audit_ro SET default_transaction_read_only = on;
ALTER ROLE visaapply_audit_ro SET statement_timeout = '15s';
ALTER ROLE visaapply_audit_ro SET idle_in_transaction_session_timeout = '15s';


-- ----------------------------------------------------------------------------
-- PART 2: DATABASE & SCHEMA ACCESS (MINIMUM REQUIRED ONLY)
-- ----------------------------------------------------------------------------
-- Replace `<TARGET_DB_NAME>` with the exact `target_database_name` returned
-- by Part 0 (on Neon projects this is typically `neondb`).
-- Grants are strictly additive/scoped to `visaapply_audit_ro` and DO NOT alter
-- `PUBLIC` or any existing production role permissions.

GRANT CONNECT ON DATABASE "<TARGET_DB_NAME>" TO visaapply_audit_ro;
REVOKE TEMPORARY ON DATABASE "<TARGET_DB_NAME>" FROM visaapply_audit_ro;

-- Grant schema lookup (`USAGE`) only; explicitly deny `CREATE` on `public`.
-- Note: On PostgreSQL 15+ (Neon default), `PUBLIC` no longer holds `CREATE`
-- on `public`. If Part 4B shows `has_schema_create = true` (legacy PG 14),
-- review `REVOKE CREATE ON SCHEMA public FROM PUBLIC;` before running audit.
GRANT USAGE ON SCHEMA public TO visaapply_audit_ro;
REVOKE CREATE ON SCHEMA public FROM visaapply_audit_ro;


-- ----------------------------------------------------------------------------
-- PART 3: EXPLICIT TABLE-LEVEL SELECT GRANTS (NO WILDCARDS, NO WRITES)
-- ----------------------------------------------------------------------------
-- Based on confirmed tables in `src/db/postgresDatabase.ts` (Migrations 001-003).
-- Only grant SELECT on tables that actually exist in Part 0 output.
-- (If any table does not exist yet because migrations have not run on Neon,
-- skip that table's GRANT line until after authorized migration cutover.)

-- [Tier 1] Core Migration, Registry & Consular Content Tables (8 tables):
GRANT SELECT ON TABLE public.schema_migrations     TO visaapply_audit_ro;
GRANT SELECT ON TABLE public.batch_state           TO visaapply_audit_ro;
GRANT SELECT ON TABLE public.immigration_programs  TO visaapply_audit_ro;
GRANT SELECT ON TABLE public.visa_details          TO visaapply_audit_ro;
GRANT SELECT ON TABLE public.visa_detail_claims    TO visaapply_audit_ro;
GRANT SELECT ON TABLE public.visa_detail_evidence  TO visaapply_audit_ro;
GRANT SELECT ON TABLE public.visa_detail_versions  TO visaapply_audit_ro;
GRANT SELECT ON TABLE public.changelog_entries     TO visaapply_audit_ro;

-- [Tier 2] Phase 4.4 Operational & Cron Telemetry Tables (5 tables):
-- Note: In VisaApply.org, `operationalObservability.ts` redacts secrets before
-- persisting to these tables, and zero user PII/password tables exist.
-- However, if the administrator prefers strict content-only audit scope,
-- comment out any Tier 2 tables below that should remain invisible to the auditor:
GRANT SELECT ON TABLE public.cron_execution_logs   TO visaapply_audit_ro;
GRANT SELECT ON TABLE public.automation_job_locks  TO visaapply_audit_ro;
GRANT SELECT ON TABLE public.automation_checkpoints TO visaapply_audit_ro;
GRANT SELECT ON TABLE public.automation_dead_letter TO visaapply_audit_ro;
GRANT SELECT ON TABLE public.operational_events    TO visaapply_audit_ro;

-- Explicit defense-in-depth revocation of all mutating / DDL table privileges:
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE
    public.schema_migrations,
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
    public.operational_events
  FROM visaapply_audit_ro;

-- NOTE ON DEFAULT PRIVILEGES (DO NOT ENABLE BROADLY WITHOUT REVIEW):
-- We intentionally DO NOT run `ALTER DEFAULT PRIVILEGES ... GRANT SELECT ON TABLES`
-- so that any future sensitive tables created by the owner role are NOT
-- automatically exposed to `visaapply_audit_ro` without explicit administrator approval.


-- ----------------------------------------------------------------------------
-- PART 4: PRIVILEGE & ISOLATION VERIFICATION QUERIES
-- ----------------------------------------------------------------------------
-- Execute as administrator immediately after Part 3 to verify effective grants:

-- 4A. Confirm zero elevated role attributes:
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
WHERE rolname = 'visaapply_audit_ro';

-- 4B. Confirm `visaapply_audit_ro` has USAGE (true) and NO CREATE (false) on `public`:
SELECT
  has_schema_privilege('visaapply_audit_ro', 'public', 'USAGE')  AS has_schema_usage,
  has_schema_privilege('visaapply_audit_ro', 'public', 'CREATE') AS has_schema_create;

-- 4C. Confirm ONLY SELECT is granted across all public tables (write privileges must ALL be false):
SELECT
  t.tablename,
  has_table_privilege('visaapply_audit_ro', format('public.%I', t.tablename), 'SELECT')   AS can_select,
  has_table_privilege('visaapply_audit_ro', format('public.%I', t.tablename), 'INSERT')   AS can_insert,
  has_table_privilege('visaapply_audit_ro', format('public.%I', t.tablename), 'UPDATE')   AS can_update,
  has_table_privilege('visaapply_audit_ro', format('public.%I', t.tablename), 'DELETE')   AS can_delete,
  has_table_privilege('visaapply_audit_ro', format('public.%I', t.tablename), 'TRUNCATE') AS can_truncate
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.tablename;

-- 4D. Inspect `information_schema.role_table_grants` for `visaapply_audit_ro`:
SELECT
  table_schema,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'visaapply_audit_ro'
ORDER BY table_name, privilege_type;


-- ----------------------------------------------------------------------------
-- PART 5: REVOCATION / CLEANUP PROCEDURE (RUN IF DECOMMISSIONING ROLE)
-- ----------------------------------------------------------------------------
-- Execute these statements as the database owner / administrator if rotating,
-- decommissioning, or revoking `visaapply_audit_ro`:
/*
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM visaapply_audit_ro;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM visaapply_audit_ro;
REVOKE USAGE ON SCHEMA public FROM visaapply_audit_ro;
REVOKE CONNECT ON DATABASE "<TARGET_DB_NAME>" FROM visaapply_audit_ro;
DROP ROLE IF EXISTS visaapply_audit_ro;
*/
