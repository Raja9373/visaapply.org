import pg from 'pg';
import { POSTGRES_MIGRATIONS } from '../src/db/postgresDatabase';
import { redactSensitiveData } from '../src/utils/operationalObservability';

const { Pool } = pg;

const EXPECTED_TABLES = [
  'schema_migrations',
  'batch_state',
  'immigration_programs',
  'changelog_entries',
  'cron_execution_logs',
  'visa_details',
  'visa_detail_claims',
  'visa_detail_evidence',
  'visa_detail_versions',
  'automation_job_locks',
  'automation_checkpoints',
  'automation_dead_letter',
  'operational_events'
] as const;

const EXPECTED_INDEXES = [
  'idx_pg_prog_country',
  'idx_pg_prog_status',
  'idx_pg_changelog_date',
  'idx_pg_cron_time',
  'idx_pg_visa_details_program_id',
  'idx_pg_visa_details_status',
  'idx_pg_claims_program',
  'idx_pg_claims_classification',
  'idx_pg_claims_nationality',
  'idx_pg_evidence_claim',
  'idx_pg_versions_program',
  'idx_pg_claims_status',
  'idx_pg_evidence_status',
  'idx_pg_cron_status_time',
  'idx_pg_dlq_status',
  'idx_pg_op_events_cat_time'
] as const;

const EXPECTED_FOREIGN_KEYS: Array<{ table: string; column: string; referencesTable: string }> = [
  { table: 'visa_details', column: 'program_id', referencesTable: 'immigration_programs' },
  { table: 'visa_detail_claims', column: 'program_id', referencesTable: 'immigration_programs' },
  { table: 'visa_detail_evidence', column: 'claim_id', referencesTable: 'visa_detail_claims' },
  { table: 'visa_detail_versions', column: 'program_id', referencesTable: 'immigration_programs' }
];

function sanitizeUrlCheck(rawUrl: string): { valid: boolean; reason?: string; isNeonHost: boolean; isSsl: boolean } {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return { valid: false, reason: 'NEON_READONLY_DATABASE_URL is not set or empty.', isNeonHost: false, isSsl: false };
  }
  if (trimmed.includes('ep-example.us-east-2.aws.neon.tech')) {
    return { valid: false, reason: 'NEON_READONLY_DATABASE_URL contains placeholder host.', isNeonHost: false, isSsl: false };
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: 'NEON_READONLY_DATABASE_URL is not a valid URI.', isNeonHost: false, isSsl: false };
  }
  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    return { valid: false, reason: 'Protocol must be postgres:// or postgresql://.', isNeonHost: false, isSsl: false };
  }
  const hostLower = parsed.hostname.toLowerCase();
  const isNeonHost = hostLower.endsWith('.neon.tech');
  const sslMode = (parsed.searchParams.get('sslmode') || '').toLowerCase();
  const isSsl = sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full' || isNeonHost;
  return { valid: true, isNeonHost, isSsl };
}

async function main() {
  const startedAt = new Date().toISOString();
  const rawConn = (process.env.NEON_READONLY_DATABASE_URL || '').trim();
  const check = sanitizeUrlCheck(rawConn);

  if (!check.valid) {
    console.log(
      JSON.stringify(
        {
          mission: 'VISAApply.org — LIVE NEON READ-ONLY VERIFICATION',
          timestamp: startedAt,
          status: 'NOT_VERIFIED',
          authorizedCredentialsAvailable: false,
          reason: check.reason,
          writesExecuted: false,
          migrationsExecuted: false
        },
        null,
        2
      )
    );
    process.exitCode = 2;
    return;
  }

  const pool = new Pool({
    connectionString: rawConn,
    max: 2,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    ssl: check.isSsl ? { rejectUnauthorized: true } : undefined
  });

  const client = await pool.connect();
  let txActive = false;

  try {
    // Enforce read-only transaction before issuing any inspection queries
    await client.query('BEGIN READ ONLY');
    txActive = true;

    const txReadOnlyRes = await client.query<{ transaction_read_only: string }>('SHOW transaction_read_only');
    const txReadOnly = txReadOnlyRes.rows[0]?.transaction_read_only === 'on';
    if (!txReadOnly) {
      throw new Error('READ_ONLY_GUARD_FAILED: Session transaction_read_only did not activate.');
    }

    const identityRes = await client.query<{
      server_version: string;
      db_name: string;
      role_name: string;
      schema_name: string;
    }>(
      `SELECT
        version()          AS server_version,
        current_database() AS db_name,
        current_user       AS role_name,
        current_schema()   AS schema_name`
    );
    const identity = identityRes.rows[0];

    // Verify role attributes and absence of write/DDL privileges
    const roleFlagsRes = await client.query<{
      rolsuper: boolean;
      rolcreatedb: boolean;
      rolcreaterole: boolean;
      rolreplication: boolean;
      rolbypassrls: boolean;
    }>(
      `SELECT rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls
       FROM pg_roles
       WHERE rolname = current_user`
    );
    const roleFlags = roleFlagsRes.rows[0];

    const schemaPrivRes = await client.query<{ can_usage: boolean; can_create: boolean }>(
      `SELECT
        has_schema_privilege(current_user, 'public', 'USAGE')  AS can_usage,
        has_schema_privilege(current_user, 'public', 'CREATE') AS can_create`
    );
    const schemaPriv = schemaPrivRes.rows[0];

    const tablesRes = await client.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );
    const existingTables = tablesRes.rows.map((r) => r.table_name);

    const writePrivilegeViolations: Array<{ table: string; privilege: string }> = [];
    for (const tbl of existingTables) {
      const privRes = await client.query<{
        can_select: boolean;
        can_insert: boolean;
        can_update: boolean;
        can_delete: boolean;
        can_truncate: boolean;
      }>(
        `SELECT
          has_table_privilege(current_user, format('public.%I', $1::text), 'SELECT')   AS can_select,
          has_table_privilege(current_user, format('public.%I', $1::text), 'INSERT')   AS can_insert,
          has_table_privilege(current_user, format('public.%I', $1::text), 'UPDATE')   AS can_update,
          has_table_privilege(current_user, format('public.%I', $1::text), 'DELETE')   AS can_delete,
          has_table_privilege(current_user, format('public.%I', $1::text), 'TRUNCATE') AS can_truncate`,
        [tbl]
      );
      const p = privRes.rows[0];
      if (p?.can_insert) writePrivilegeViolations.push({ table: tbl, privilege: 'INSERT' });
      if (p?.can_update) writePrivilegeViolations.push({ table: tbl, privilege: 'UPDATE' });
      if (p?.can_delete) writePrivilegeViolations.push({ table: tbl, privilege: 'DELETE' });
      if (p?.can_truncate) writePrivilegeViolations.push({ table: tbl, privilege: 'TRUNCATE' });
    }

    const isStrictlyReadOnlyRole =
      txReadOnly &&
      !roleFlags?.rolsuper &&
      !roleFlags?.rolcreatedb &&
      !roleFlags?.rolcreaterole &&
      !roleFlags?.rolreplication &&
      !roleFlags?.rolbypassrls &&
      !schemaPriv?.can_create &&
      writePrivilegeViolations.length === 0;

    if (!isStrictlyReadOnlyRole) {
      console.error(
        JSON.stringify(
          {
            mission: 'VISAApply.org — LIVE NEON READ-ONLY VERIFICATION',
            status: 'SECURITY_ABORT_WRITE_PRIVILEGES_DETECTED',
            roleName: identity?.role_name,
            roleFlags,
            schemaPriv,
            writePrivilegeViolations,
            action: 'Aborted verification without executing data queries or mutations. Fix role grants manually before retrying.'
          },
          null,
          2
        )
      );
      process.exitCode = 3;
      return;
    }

    // Schema compatibility inspection (columns, PKs, FKs, indexes, migrations)
    const missingTables = EXPECTED_TABLES.filter((t) => !existingTables.includes(t));
    const unexpectedTables = existingTables.filter((t) => !(EXPECTED_TABLES as readonly string[]).includes(t));

    const columnsRes = await client.query<{
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
    }>(
      `SELECT table_name, column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public'
       ORDER BY table_name, ordinal_position`
    );

    const columnCountByTable: Record<string, number> = {};
    for (const c of columnsRes.rows) {
      columnCountByTable[c.table_name] = (columnCountByTable[c.table_name] || 0) + 1;
    }

    const pkRes = await client.query<{ table_name: string; column_name: string }>(
      `SELECT tc.table_name, kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = 'public' AND tc.constraint_type = 'PRIMARY KEY'
       ORDER BY tc.table_name`
    );

    const fkRes = await client.query<{
      table_name: string;
      column_name: string;
      foreign_table_name: string;
    }>(
      `SELECT
         tc.table_name,
         kcu.column_name,
         ccu.table_name AS foreign_table_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
       JOIN information_schema.constraint_column_usage ccu
         ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
       WHERE tc.table_schema = 'public' AND tc.constraint_type = 'FOREIGN KEY'
       ORDER BY tc.table_name`
    );
    const missingForeignKeys = EXPECTED_FOREIGN_KEYS.filter(
      (efk) => !fkRes.rows.some((r) => r.table_name === efk.table && r.column_name === efk.column && r.foreign_table_name === efk.referencesTable)
    );

    const idxRes = await client.query<{ indexname: string }>(
      `SELECT indexname
       FROM pg_indexes
       WHERE schemaname = 'public'
       ORDER BY indexname`
    );
    const existingIndexes = idxRes.rows.map((r) => r.indexname);
    const missingIndexes = EXPECTED_INDEXES.filter((idx) => !existingIndexes.includes(idx));

    let appliedMigrations: Array<{ version: string; checksum: string; applied_at: string }> = [];
    if (existingTables.includes('schema_migrations')) {
      const migRes = await client.query<{ version: string; checksum: string; applied_at: string }>(
        'SELECT version, checksum, applied_at FROM schema_migrations ORDER BY version ASC'
      );
      appliedMigrations = migRes.rows;
    }
    const expectedMigrationVersions = POSTGRES_MIGRATIONS.map((m) => m.version);
    const missingMigrations = expectedMigrationVersions.filter(
      (v) => !appliedMigrations.some((am) => am.version === v)
    );

    // Aggregate counts, duplicates & orphans (only for readable existing tables)
    const tableCounts: Record<string, number | string> = {};
    for (const tbl of existingTables) {
      try {
        const cntRes = await client.query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM public."${tbl.replace(/"/g, '')}"`);
        tableCounts[tbl] = Number(cntRes.rows[0]?.c || 0);
      } catch {
        tableCounts[tbl] = 'NO_SELECT_PERMISSION';
      }
    }

    let duplicateProgramIds = 0;
    let orphanVisaDetails = 0;
    let orphanClaims = 0;
    let orphanEvidence = 0;
    let orphanVersions = 0;

    if (existingTables.includes('visa_details') && typeof tableCounts['visa_details'] === 'number') {
      const dupRes = await client.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM (
           SELECT program_id FROM public.visa_details GROUP BY program_id HAVING COUNT(*) > 1
         ) sub`
      );
      duplicateProgramIds = Number(dupRes.rows[0]?.c || 0);

      if (existingTables.includes('immigration_programs') && typeof tableCounts['immigration_programs'] === 'number') {
        const oVdRes = await client.query<{ c: string }>(
          `SELECT COUNT(*)::text AS c FROM public.visa_details vd
           WHERE NOT EXISTS (SELECT 1 FROM public.immigration_programs p WHERE p.id = vd.program_id)`
        );
        orphanVisaDetails = Number(oVdRes.rows[0]?.c || 0);
      }
    }

    if (existingTables.includes('visa_detail_claims') && typeof tableCounts['visa_detail_claims'] === 'number' && typeof tableCounts['immigration_programs'] === 'number') {
      const oClmRes = await client.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM public.visa_detail_claims c
         WHERE NOT EXISTS (SELECT 1 FROM public.immigration_programs p WHERE p.id = c.program_id)`
      );
      orphanClaims = Number(oClmRes.rows[0]?.c || 0);
    }

    if (existingTables.includes('visa_detail_evidence') && typeof tableCounts['visa_detail_evidence'] === 'number' && typeof tableCounts['visa_detail_claims'] === 'number') {
      const oEvRes = await client.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM public.visa_detail_evidence e
         WHERE NOT EXISTS (SELECT 1 FROM public.visa_detail_claims c WHERE c.id = e.claim_id)`
      );
      orphanEvidence = Number(oEvRes.rows[0]?.c || 0);
    }

    if (existingTables.includes('visa_detail_versions') && typeof tableCounts['visa_detail_versions'] === 'number' && typeof tableCounts['immigration_programs'] === 'number') {
      const oVerRes = await client.query<{ c: string }>(
        `SELECT COUNT(*)::text AS c FROM public.visa_detail_versions v
         WHERE NOT EXISTS (SELECT 1 FROM public.immigration_programs p WHERE p.id = v.program_id)`
      );
      orphanVersions = Number(oVerRes.rows[0]?.c || 0);
    }

    const report = {
      mission: 'VISAApply.org — LIVE NEON READ-ONLY VERIFICATION',
      timestamp: startedAt,
      connection: {
        status: 'PASS',
        isNeonDomain: check.isNeonHost,
        tlsEnforced: check.isSsl,
        serverVersion: identity?.server_version,
        sanitizedDatabaseName: identity?.db_name,
        effectiveRole: identity?.role_name,
        schemaName: identity?.schema_name,
        transactionReadOnly: txReadOnly
      },
      security: {
        strictReadOnlyVerified: isStrictlyReadOnlyRole,
        roleFlags,
        schemaPriv,
        writePrivilegeViolations
      },
      schema: {
        compatible:
          missingTables.length === 0 &&
          missingForeignKeys.length === 0 &&
          missingIndexes.length === 0 &&
          missingMigrations.length === 0,
        existingTables,
        missingTables,
        unexpectedTables,
        columnCountByTable,
        primaryKeyCount: pkRes.rows.length,
        missingForeignKeys,
        missingIndexes,
        appliedMigrations: appliedMigrations.map((m) => ({ version: m.version, applied_at: m.applied_at })),
        missingMigrations
      },
      integrity: {
        ok:
          duplicateProgramIds === 0 &&
          orphanVisaDetails === 0 &&
          orphanClaims === 0 &&
          orphanEvidence === 0 &&
          orphanVersions === 0,
        tableCounts,
        duplicateProgramIds,
        orphans: {
          visaDetails: orphanVisaDetails,
          claims: orphanClaims,
          evidence: orphanEvidence,
          versions: orphanVersions
        }
      },
      writesExecuted: false,
      migrationsExecuted: false
    };

    console.log(JSON.stringify(redactSensitiveData(report), null, 2));
  } catch (err: any) {
    console.error(
      JSON.stringify(
        {
          mission: 'VISAApply.org — LIVE NEON READ-ONLY VERIFICATION',
          timestamp: startedAt,
          status: 'FAIL',
          error: redactSensitiveData(err?.message || 'Unexpected error during read-only inspection'),
          writesExecuted: false,
          migrationsExecuted: false
        },
        null,
        2
      )
    );
    process.exitCode = 1;
  } finally {
    if (txActive) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Best-effort rollback on connection teardown
      }
    }
    client.release();
    await pool.end();
  }
}

main();
