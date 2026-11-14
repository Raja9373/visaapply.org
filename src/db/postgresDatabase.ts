import crypto from 'node:crypto';
import pg from 'pg';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { PGlite } from '@electric-sql/pglite';
import { recordOperationalEvent, redactSensitiveData } from '../utils/operationalObservability';
import {
  REQUIREMENT_CLASSIFICATIONS,
  EVIDENCE_STATUSES,
  normalizeEvidenceStatus,
  isQualifyingOfficialEvidence,
  isInvalidatingEvidenceStatus,
  isValidRequirementClassification,
  normalizeVisaDetailTo30Sections,
  denormalize30SectionsToLegacy13,
  validateComprehensiveProfileHonesty,
  evaluateClaimIntegrity
} from '../types/visaComprehensiveProfile';
import type {
  RequirementClassification,
  EvidenceStatus,
  VisaComprehensiveProfile,
  VisaApplicantSpecialTopics
} from '../types/visaComprehensiveProfile';

export {
  REQUIREMENT_CLASSIFICATIONS,
  EVIDENCE_STATUSES,
  normalizeEvidenceStatus,
  isQualifyingOfficialEvidence,
  isInvalidatingEvidenceStatus,
  isValidRequirementClassification,
  normalizeVisaDetailTo30Sections,
  denormalize30SectionsToLegacy13,
  validateComprehensiveProfileHonesty,
  evaluateClaimIntegrity
};
export type {
  RequirementClassification,
  EvidenceStatus,
  VisaComprehensiveProfile,
  VisaApplicantSpecialTopics
};

const { Pool: PgPool } = pg;

export interface PgExecutor {
  query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }>;
  transaction<T>(fn: (tx: PgExecutor) => Promise<T>): Promise<T>;
  close(): Promise<void>;
  isNeonRemote: boolean;
}

/**
 * Isolated PostgreSQL Schema DDL for all 8 enrichment tables
 */
export const POSTGRES_ENRICHMENT_SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS batch_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  current_batch_index INTEGER NOT NULL DEFAULT 1,
  total_batches INTEGER NOT NULL DEFAULT 10,
  batch_size INTEGER NOT NULL DEFAULT 25,
  processed_country_codes TEXT NOT NULL,
  pending_country_codes TEXT NOT NULL,
  completed_country_codes TEXT NOT NULL,
  failed_country_codes TEXT NOT NULL,
  last_batch_run_date TEXT NOT NULL,
  is_executing INTEGER NOT NULL DEFAULT 0,
  total_discovered_programs INTEGER NOT NULL DEFAULT 1494,
  available_verified_count INTEGER NOT NULL DEFAULT 27,
  not_available_confirmed_count INTEGER NOT NULL DEFAULT 7,
  awaiting_verification_count INTEGER NOT NULL DEFAULT 1459,
  needs_review_count INTEGER NOT NULL DEFAULT 0,
  temporarily_closed_count INTEGER NOT NULL DEFAULT 0,
  expired_count INTEGER NOT NULL DEFAULT 1,
  last_scheduled_execution TEXT NOT NULL,
  last_actual_execution TEXT NOT NULL,
  execution_start_timestamp TEXT NOT NULL,
  execution_end_timestamp TEXT NOT NULL,
  success_status INTEGER NOT NULL DEFAULT 1,
  batch_completion_status TEXT NOT NULL,
  next_scheduled_execution TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  auto_resume_on_missed INTEGER NOT NULL DEFAULT 1,
  last_error TEXT,
  audit_logs_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS immigration_programs (
  id TEXT PRIMARY KEY,
  country_code TEXT NOT NULL,
  category TEXT NOT NULL,
  official_name TEXT NOT NULL,
  local_language_name TEXT,
  legal_basis TEXT NOT NULL,
  classification_type TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  nationality_restrictions TEXT NOT NULL,
  age_requirements TEXT NOT NULL,
  education_requirements TEXT NOT NULL,
  work_experience_requirements TEXT NOT NULL,
  min_salary_or_income TEXT NOT NULL,
  investment_requirement TEXT NOT NULL,
  required_funds_and_proof TEXT NOT NULL,
  residency_duration TEXT NOT NULL,
  renewal_rules TEXT,
  pr_or_citizenship_transition TEXT,
  family_inclusion_rules TEXT,
  work_and_study_rights TEXT,
  restrictions_and_exceptions TEXT,
  required_documents_json TEXT NOT NULL,
  documents_and_formats TEXT,
  translation_attestation_requirements TEXT,
  application_procedure TEXT NOT NULL,
  government_fees TEXT NOT NULL,
  processing_time TEXT NOT NULL,
  apply_from TEXT,
  official_application_url TEXT NOT NULL,
  official_information_url TEXT NOT NULL,
  source_authority TEXT NOT NULL,
  source_last_updated TEXT NOT NULL,
  last_checked_date TEXT NOT NULL,
  verification_evidence TEXT NOT NULL,
  verification_status TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS changelog_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  change_type TEXT NOT NULL,
  title TEXT NOT NULL,
  old_value TEXT NOT NULL,
  new_value TEXT NOT NULL,
  source_url TEXT NOT NULL,
  auto_blog_slug TEXT NOT NULL,
  email_notified TEXT NOT NULL,
  verified_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cron_execution_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  cron_name TEXT NOT NULL,
  http_method TEXT NOT NULL,
  target_countries TEXT NOT NULL,
  status TEXT NOT NULL,
  checked_count INTEGER NOT NULL,
  updates_found INTEGER NOT NULL,
  log_message TEXT NOT NULL,
  execution_duration_ms INTEGER NOT NULL,
  missed_run_resumed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pg_prog_country ON immigration_programs(country_code);
CREATE INDEX IF NOT EXISTS idx_pg_prog_status ON immigration_programs(verification_status);
CREATE INDEX IF NOT EXISTS idx_pg_changelog_date ON changelog_entries(date);
CREATE INDEX IF NOT EXISTS idx_pg_cron_time ON cron_execution_logs(timestamp);

CREATE TABLE IF NOT EXISTS visa_details (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES immigration_programs(id) ON DELETE CASCADE,
  country_overview_json TEXT,
  visa_overview_json TEXT,
  eligibility_json TEXT,
  financial_json TEXT,
  document_checklist_json TEXT,
  application_fields_json TEXT,
  application_steps_json TEXT,
  interview_prep_json TEXT,
  embassy_directory_json TEXT,
  refusal_appeal_json TEXT,
  after_approval_json TEXT,
  cost_calculator_json TEXT,
  faq_json TEXT,
  legal_evidence_json TEXT,
  comprehensive_sections_json TEXT DEFAULT '{}',
  last_updated TEXT,
  verification_status TEXT
);
CREATE INDEX IF NOT EXISTS idx_pg_visa_details_program_id ON visa_details(program_id);
CREATE INDEX IF NOT EXISTS idx_pg_visa_details_status ON visa_details(verification_status);

CREATE TABLE IF NOT EXISTS visa_detail_claims (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES immigration_programs(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  description TEXT NOT NULL,
  value TEXT,
  unit TEXT,
  status TEXT NOT NULL DEFAULT 'NEEDS_EVIDENCE',
  reviewer TEXT,
  review_timestamp TEXT,
  requirement_classification TEXT NOT NULL DEFAULT 'ADMIN_INSTRUCTION',
  applicable_nationality TEXT NOT NULL DEFAULT 'ALL',
  country_iso TEXT NOT NULL DEFAULT '',
  visa_category TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_pg_claims_program ON visa_detail_claims(program_id);
CREATE INDEX IF NOT EXISTS idx_pg_claims_classification ON visa_detail_claims(program_id, requirement_classification);
CREATE INDEX IF NOT EXISTS idx_pg_claims_nationality ON visa_detail_claims(program_id, applicable_nationality);

CREATE TABLE IF NOT EXISTS visa_detail_evidence (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES visa_detail_claims(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  legal_instrument TEXT,
  effective_date TEXT,
  last_checked_date TEXT,
  source_title TEXT,
  issuing_authority TEXT,
  publication_date TEXT,
  access_date TEXT,
  reviewer_notes TEXT,
  excerpt TEXT DEFAULT '',
  status TEXT DEFAULT 'NEEDS_REVIEW'
);
CREATE INDEX IF NOT EXISTS idx_pg_evidence_claim ON visa_detail_evidence(claim_id);

CREATE TABLE IF NOT EXISTS visa_detail_versions (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES immigration_programs(id) ON DELETE CASCADE,
  data_json TEXT NOT NULL,
  editor_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  change_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_pg_versions_program ON visa_detail_versions(program_id);
`;

export const POSTGRES_PHASE_3_1_MIGRATION_DDL = `
ALTER TABLE visa_details ADD COLUMN IF NOT EXISTS comprehensive_sections_json TEXT DEFAULT '{}';
ALTER TABLE visa_detail_claims ADD COLUMN IF NOT EXISTS requirement_classification TEXT NOT NULL DEFAULT 'ADMIN_INSTRUCTION';
ALTER TABLE visa_detail_claims ADD COLUMN IF NOT EXISTS applicable_nationality TEXT NOT NULL DEFAULT 'ALL';
ALTER TABLE visa_detail_claims ADD COLUMN IF NOT EXISTS country_iso TEXT NOT NULL DEFAULT '';
ALTER TABLE visa_detail_claims ADD COLUMN IF NOT EXISTS visa_category TEXT NOT NULL DEFAULT '';
ALTER TABLE visa_detail_evidence ADD COLUMN IF NOT EXISTS excerpt TEXT DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_pg_claims_classification ON visa_detail_claims(program_id, requirement_classification);
CREATE INDEX IF NOT EXISTS idx_pg_claims_nationality ON visa_detail_claims(program_id, applicable_nationality);
`;

export const POSTGRES_PHASE_4_4_MIGRATION_DDL = `
CREATE TABLE IF NOT EXISTS automation_job_locks (
  lock_key TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  acquired_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS automation_checkpoints (
  checkpoint_id TEXT PRIMARY KEY,
  job_name TEXT NOT NULL,
  run_id TEXT NOT NULL,
  status TEXT NOT NULL,
  cursor_index INTEGER NOT NULL DEFAULT 0,
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_keys_json TEXT NOT NULL DEFAULT '[]',
  failed_keys_json TEXT NOT NULL DEFAULT '[]',
  idempotency_keys_json TEXT NOT NULL DEFAULT '[]',
  state_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS automation_dead_letter (
  id TEXT PRIMARY KEY,
  job_name TEXT NOT NULL,
  run_id TEXT NOT NULL,
  target_key TEXT NOT NULL,
  failure_class TEXT NOT NULL,
  error_message TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  retry_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'QUARANTINED',
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS operational_events (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  component TEXT NOT NULL,
  message TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_pg_claims_status ON visa_detail_claims(program_id, status);
CREATE INDEX IF NOT EXISTS idx_pg_evidence_status ON visa_detail_evidence(claim_id, status);
CREATE INDEX IF NOT EXISTS idx_pg_cron_status_time ON cron_execution_logs(cron_name, status, timestamp);
CREATE INDEX IF NOT EXISTS idx_pg_dlq_status ON automation_dead_letter(status, job_name, created_at);
CREATE INDEX IF NOT EXISTS idx_pg_op_events_cat_time ON operational_events(category, timestamp);
`;

export interface PgMigrationDefinition {
  version: string;
  name: string;
  ddl: string;
  rollbackNotes: string;
}

export const POSTGRES_MIGRATIONS: PgMigrationDefinition[] = [
  {
    version: '001_baseline_enrichment_tables',
    name: 'Baseline 8 enrichment tables and primary indexes',
    ddl: POSTGRES_ENRICHMENT_SCHEMA_DDL,
    rollbackNotes: 'Non-destructive CREATE IF NOT EXISTS; rollback via verified pre-migration backup.'
  },
  {
    version: '002_phase31_comprehensive_and_classification',
    name: 'Phase 3.1/3.2 evidence metadata, 30-section JSON, and 5-tier claim classification',
    ddl: POSTGRES_PHASE_3_1_MIGRATION_DDL,
    rollbackNotes: 'Additive columns; preserve via verified pre-migration backup.'
  },
  {
    version: '003_phase44_operational_reliability_and_constraints',
    name: 'Phase 4.4 job locks, checkpoints, dead-letter quarantine, operational telemetry, and indexes',
    ddl: POSTGRES_PHASE_4_4_MIGRATION_DDL,
    rollbackNotes: 'DROP TABLE IF EXISTS automation_job_locks, automation_checkpoints, automation_dead_letter, operational_events.'
  }
];

function computePgMigrationChecksum(version: string, ddl: string): string {
  return crypto.createHash('sha256').update(`${version}:${ddl}`, 'utf8').digest('hex');
}

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(/;\s*(?=\n|$)/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Create a PostgreSQL executor using either NEON_TEST_DATABASE_URL (pg.Pool)
 * or an isolated in-process PGlite PostgreSQL engine for offline verification.
 */
export async function createPostgresExecutor(
  connectionString?: string,
  options: { requireNeonRemote?: boolean } = {}
): Promise<PgExecutor> {
  const connUrl = (connectionString || process.env.NEON_TEST_DATABASE_URL || '').trim();
  const isValidUrl = connUrl.startsWith('postgres://') || connUrl.startsWith('postgresql://');

  if (isValidUrl && !connUrl.includes('ep-example.us-east-2.aws.neon.tech')) {
    const pool = new PgPool({
      connectionString: connUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false }
    });

    pool.on('error', (err) => {
      const safeMsg = redactSensitiveData(err?.message || 'Unexpected idle PostgreSQL client error');
      recordOperationalEvent({
        category: 'DB_CONNECTION_ERROR',
        severity: 'ERROR',
        component: 'postgres-pool',
        message: safeMsg
      });
    });

    const executor: PgExecutor = {
      isNeonRemote: true,
      async query<T = any>(sql: string, params: any[] = []) {
        try {
          const res = await pool.query(sql, params);
          return { rows: res.rows as T[], rowCount: res.rowCount ?? res.rows.length };
        } catch (err: any) {
          const safeMsg = redactSensitiveData(err?.message || 'PostgreSQL query error');
          recordOperationalEvent({
            category: 'DB_CONNECTION_ERROR',
            severity: 'ERROR',
            component: 'postgres-query',
            message: safeMsg
          });
          throw new Error(safeMsg);
        }
      },
      async transaction<T>(fn: (tx: PgExecutor) => Promise<T>): Promise<T> {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const txExec: PgExecutor = {
            isNeonRemote: true,
            async query<R = any>(sql: string, params: any[] = []) {
              const r = await client.query(sql, params);
              return { rows: r.rows as R[], rowCount: r.rowCount ?? r.rows.length };
            },
            transaction: (innerFn) => innerFn(txExec),
            close: async () => {}
          };
          const out = await fn(txExec);
          await client.query('COMMIT');
          return out;
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      },
      async close() {
        await pool.end();
      }
    };
    return executor;
  }

  if (options.requireNeonRemote) {
    throw new Error(
      'REMOTE_NEON_REQUIRED: NEON_TEST_DATABASE_URL is not present or empty in process.env. Refusing to fall back to PGlite or SQLite.'
    );
  }

  // Fallback isolated PostgreSQL engine (PGlite) when NEON_TEST_DATABASE_URL is not yet configured
  const pglite = new PGlite();
  await pglite.waitReady;

  let txLock: Promise<any> = Promise.resolve();

  const executor: PgExecutor = {
    isNeonRemote: false,
    async query<T = any>(sql: string, params: any[] = []) {
      const res = await pglite.query<T>(sql, params);
      return { rows: res.rows, rowCount: res.affectedRows ?? res.rows.length };
    },
    async transaction<T>(fn: (tx: PgExecutor) => Promise<T>): Promise<T> {
      const runTx = async () => {
        await pglite.query('BEGIN');
        try {
          const txExec: PgExecutor = {
            isNeonRemote: false,
            async query<R = any>(sql: string, params: any[] = []) {
              const r = await pglite.query<R>(sql, params);
              return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length };
            },
            transaction: (innerFn) => innerFn(txExec),
            close: async () => {}
          };
          const result = await fn(txExec);
          await pglite.query('COMMIT');
          return result;
        } catch (err) {
          await pglite.query('ROLLBACK');
          throw err;
        }
      };
      const next = txLock.then(runTx, runTx);
      txLock = next.catch(() => {});
      return next;
    },
    async close() {
      await pglite.close();
    }
  };
  return executor;
}

/**
 * PostgreSQL Repository implementing the exact VisaApply.org enrichment data contracts
 */
export class PostgresImmigrationRepository {
  constructor(public readonly pg: PgExecutor) {}

  async applyPhase31Migrations(): Promise<void> {
    const statements = splitSqlStatements(POSTGRES_PHASE_3_1_MIGRATION_DDL);
    for (const stmt of statements) {
      await this.pg.query(stmt);
    }
  }

  async runTrackedMigrations(
    migrations: PgMigrationDefinition[] = POSTGRES_MIGRATIONS
  ): Promise<{ newlyApplied: string[]; alreadyApplied: string[] }> {
    await this.pg.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        checksum TEXT NOT NULL,
        applied_at TEXT NOT NULL,
        rollback_notes TEXT NOT NULL
      )
    `);

    const newlyApplied: string[] = [];
    const alreadyApplied: string[] = [];

    for (const mig of migrations) {
      const expectedChecksum = computePgMigrationChecksum(mig.version, mig.ddl);
      const existing = await this.pg.query<{ version: string; checksum: string }>(
        'SELECT version, checksum FROM schema_migrations WHERE version = $1',
        [mig.version]
      );

      if (existing.rows.length > 0) {
        const recorded = existing.rows[0].checksum;
        if (recorded !== expectedChecksum) {
          throw new Error(
            `MIGRATION_CHECKSUM_MISMATCH for ${mig.version}: expected ${expectedChecksum}, recorded ${recorded}`
          );
        }
        alreadyApplied.push(mig.version);
        continue;
      }

      await this.pg.transaction(async (tx) => {
        for (const stmt of splitSqlStatements(mig.ddl)) {
          await tx.query(stmt);
        }
        await tx.query(
          `INSERT INTO schema_migrations (version, name, checksum, applied_at, rollback_notes) VALUES ($1, $2, $3, $4, $5)`,
          [mig.version, mig.name, expectedChecksum, new Date().toISOString(), mig.rollbackNotes]
        );
      });
      newlyApplied.push(mig.version);
      recordOperationalEvent({
        category: 'MIGRATION_EVENT',
        severity: 'INFO',
        component: 'postgres-migrator',
        message: `Applied PostgreSQL migration ${mig.version}: ${mig.name}`
      });
    }

    return { newlyApplied, alreadyApplied };
  }

  async getAppliedMigrations(): Promise<
    Array<{ version: string; name: string; checksum: string; appliedAt: string; rollbackNotes: string }>
  > {
    const { rows } = await this.pg.query(
      'SELECT version, name, checksum, applied_at, rollback_notes FROM schema_migrations ORDER BY version ASC'
    );
    return rows.map((r: any) => ({
      version: r.version,
      name: r.name,
      checksum: r.checksum,
      appliedAt: r.applied_at,
      rollbackNotes: r.rollback_notes
    }));
  }

  async initSchema(): Promise<void> {
    await this.runTrackedMigrations();
  }

  async getBatchStateFromDb(): Promise<any | null> {
    const { rows } = await this.pg.query('SELECT * FROM batch_state WHERE id = $1', [1]);
    const row = rows[0];
    if (!row) return null;
    return {
      currentBatchIndex: row.current_batch_index,
      totalBatches: row.total_batches,
      batchSize: row.batch_size,
      processedCountryCodes: JSON.parse(row.processed_country_codes || '[]'),
      pendingCountryCodes: JSON.parse(row.pending_country_codes || '[]'),
      completedCountryCodes: JSON.parse(row.completed_country_codes || '[]'),
      failedCountryCodes: JSON.parse(row.failed_country_codes || '[]'),
      lastBatchRunDate: row.last_batch_run_date,
      isExecuting: Boolean(row.is_executing),
      totalDiscoveredPrograms: row.total_discovered_programs,
      availableVerifiedCount: row.available_verified_count,
      notAvailableConfirmedCount: row.not_available_confirmed_count,
      awaitingVerificationCount: row.awaiting_verification_count,
      needsReviewCount: row.needs_review_count,
      temporarilyClosedCount: row.temporarily_closed_count,
      expiredCount: row.expired_count,
      lastScheduledExecution: row.last_scheduled_execution,
      lastActualExecution: row.last_actual_execution,
      executionStartTimestamp: row.execution_start_timestamp,
      executionEndTimestamp: row.execution_end_timestamp,
      successStatus: Boolean(row.success_status),
      batchCompletionStatus: row.batch_completion_status,
      nextScheduledExecution: row.next_scheduled_execution,
      retryAndMissedRunHandling: {
        retryCount: row.retry_count,
        maxRetries: row.max_retries,
        autoResumeOnMissed: Boolean(row.auto_resume_on_missed),
        lastError: row.last_error
      },
      auditLogs: JSON.parse(row.audit_logs_json || '[]')
    };
  }

  async saveBatchStateToDb(state: any): Promise<void> {
    const nowStr = new Date().toISOString();
    await this.pg.query(
      `
      INSERT INTO batch_state (
        id, current_batch_index, total_batches, batch_size,
        processed_country_codes, pending_country_codes, completed_country_codes, failed_country_codes,
        last_batch_run_date, is_executing, total_discovered_programs,
        available_verified_count, not_available_confirmed_count, awaiting_verification_count,
        needs_review_count, temporarily_closed_count, expired_count,
        last_scheduled_execution, last_actual_execution, execution_start_timestamp, execution_end_timestamp,
        success_status, batch_completion_status, next_scheduled_execution,
        retry_count, max_retries, auto_resume_on_missed, last_error, audit_logs_json, updated_at
      ) VALUES (
        1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
      )
      ON CONFLICT(id) DO UPDATE SET
        current_batch_index = EXCLUDED.current_batch_index,
        total_batches = EXCLUDED.total_batches,
        batch_size = EXCLUDED.batch_size,
        processed_country_codes = EXCLUDED.processed_country_codes,
        pending_country_codes = EXCLUDED.pending_country_codes,
        completed_country_codes = EXCLUDED.completed_country_codes,
        failed_country_codes = EXCLUDED.failed_country_codes,
        last_batch_run_date = EXCLUDED.last_batch_run_date,
        is_executing = EXCLUDED.is_executing,
        total_discovered_programs = EXCLUDED.total_discovered_programs,
        available_verified_count = EXCLUDED.available_verified_count,
        not_available_confirmed_count = EXCLUDED.not_available_confirmed_count,
        awaiting_verification_count = EXCLUDED.awaiting_verification_count,
        needs_review_count = EXCLUDED.needs_review_count,
        temporarily_closed_count = EXCLUDED.temporarily_closed_count,
        expired_count = EXCLUDED.expired_count,
        last_scheduled_execution = EXCLUDED.last_scheduled_execution,
        last_actual_execution = EXCLUDED.last_actual_execution,
        execution_start_timestamp = EXCLUDED.execution_start_timestamp,
        execution_end_timestamp = EXCLUDED.execution_end_timestamp,
        success_status = EXCLUDED.success_status,
        batch_completion_status = EXCLUDED.batch_completion_status,
        next_scheduled_execution = EXCLUDED.next_scheduled_execution,
        retry_count = EXCLUDED.retry_count,
        max_retries = EXCLUDED.max_retries,
        auto_resume_on_missed = EXCLUDED.auto_resume_on_missed,
        last_error = EXCLUDED.last_error,
        audit_logs_json = EXCLUDED.audit_logs_json,
        updated_at = EXCLUDED.updated_at
      `,
      [
        state.currentBatchIndex || 1,
        state.totalBatches || 10,
        state.batchSize || 25,
        JSON.stringify(state.processedCountryCodes || []),
        JSON.stringify(state.pendingCountryCodes || []),
        JSON.stringify(state.completedCountryCodes || []),
        JSON.stringify(state.failedCountryCodes || []),
        state.lastBatchRunDate || nowStr.split('T')[0],
        state.isExecuting ? 1 : 0,
        state.totalDiscoveredPrograms || 1494,
        state.availableVerifiedCount || 27,
        state.notAvailableConfirmedCount || 7,
        state.awaitingVerificationCount || 1459,
        state.needsReviewCount || 0,
        state.temporarilyClosedCount || 0,
        state.expiredCount || 1,
        state.lastScheduledExecution || nowStr,
        state.lastActualExecution || nowStr,
        state.executionStartTimestamp || nowStr,
        state.executionEndTimestamp || nowStr,
        state.successStatus !== false ? 1 : 0,
        state.batchCompletionStatus || 'Active',
        state.nextScheduledExecution || nowStr,
        state.retryAndMissedRunHandling?.retryCount || 0,
        state.retryAndMissedRunHandling?.maxRetries || 3,
        state.retryAndMissedRunHandling?.autoResumeOnMissed !== false ? 1 : 0,
        state.retryAndMissedRunHandling?.lastError || null,
        JSON.stringify(state.auditLogs || []),
        nowStr
      ]
    );
  }

  async saveImmigrationProgram(prog: any): Promise<void> {
    await this.pg.query(
      `
      INSERT INTO immigration_programs (
        id, country_code, category, official_name, local_language_name, legal_basis,
        classification_type, eligibility, nationality_restrictions, age_requirements,
        education_requirements, work_experience_requirements, min_salary_or_income,
        investment_requirement, required_funds_and_proof, residency_duration,
        renewal_rules, pr_or_citizenship_transition, family_inclusion_rules,
        work_and_study_rights, restrictions_and_exceptions, required_documents_json,
        documents_and_formats, translation_attestation_requirements, application_procedure,
        government_fees, processing_time, apply_from, official_application_url,
        official_information_url, source_authority, source_last_updated,
        last_checked_date, verification_evidence, verification_status, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36
      )
      ON CONFLICT(id) DO UPDATE SET
        official_name = EXCLUDED.official_name,
        verification_status = EXCLUDED.verification_status,
        updated_at = EXCLUDED.updated_at
      `,
      [
        prog.id,
        prog.country_code || prog.countryCode,
        prog.category,
        prog.official_name || prog.officialName,
        prog.local_language_name ?? prog.localLanguageName ?? '',
        prog.legal_basis || prog.legalBasis,
        prog.classification_type || prog.classificationType,
        prog.eligibility,
        prog.nationality_restrictions || prog.nationalityRestrictions,
        prog.age_requirements || prog.ageRequirements,
        prog.education_requirements || prog.educationRequirements,
        prog.work_experience_requirements || prog.workExperienceRequirements,
        prog.min_salary_or_income || prog.minSalaryOrIncome,
        prog.investment_requirement || prog.investmentRequirement,
        prog.required_funds_and_proof || prog.requiredFundsAndProof,
        prog.residency_duration || prog.residencyDuration,
        prog.renewal_rules ?? prog.renewalRules ?? '',
        prog.pr_or_citizenship_transition ?? prog.prOrCitizenshipTransition ?? '',
        prog.family_inclusion_rules ?? prog.familyInclusionRules ?? '',
        prog.work_and_study_rights ?? prog.workAndStudyRights ?? '',
        prog.restrictions_and_exceptions ?? prog.restrictionsAndExceptions ?? '',
        prog.required_documents_json || JSON.stringify(prog.requiredDocuments || []),
        prog.documents_and_formats ?? prog.documentsAndFormats ?? '',
        prog.translation_attestation_requirements ?? prog.translationAttestationRequirements ?? '',
        prog.application_procedure || prog.applicationProcedure,
        prog.government_fees || prog.governmentFees,
        prog.processing_time || prog.processingTime,
        prog.apply_from ?? prog.applyFrom ?? '',
        prog.official_application_url || prog.officialApplicationUrl,
        prog.official_information_url || prog.officialInformationUrl,
        prog.source_authority || prog.sourceAuthority,
        prog.source_last_updated || prog.sourceLastUpdated,
        prog.last_checked_date || prog.lastCheckedDate,
        prog.verification_evidence || prog.verificationEvidence,
        prog.verification_status || prog.verificationStatus,
        prog.updated_at || new Date().toISOString()
      ]
    );
  }

  async getVisaDetails(programId: string, exec: PgExecutor = this.pg): Promise<any | null> {
    const { rows } = await exec.query('SELECT * FROM visa_details WHERE program_id = $1', [programId]);
    const row = rows[0];
    if (!row) return null;
    return this.mapVisaDetailRow(row);
  }

  private mapVisaDetailRow(row: any) {
    let rawComp: any = null;
    try {
      const parsedComp = JSON.parse(row.comprehensive_sections_json || '{}');
      if (parsedComp && parsedComp.sections) {
        rawComp = parsedComp;
      }
    } catch {
      rawComp = null;
    }

    const baseRecord: any = {
      id: row.id,
      programId: row.program_id,
      countryOverview: JSON.parse(row.country_overview_json || '{}'),
      visaOverview: JSON.parse(row.visa_overview_json || '{}'),
      eligibility: JSON.parse(row.eligibility_json || '{}'),
      financial: JSON.parse(row.financial_json || '{}'),
      documentChecklist: JSON.parse(row.document_checklist_json || '[]'),
      applicationFields: JSON.parse(row.application_fields_json || '[]'),
      applicationSteps: JSON.parse(row.application_steps_json || '[]'),
      interviewPrep: JSON.parse(row.interview_prep_json || '{}'),
      embassyDirectory: JSON.parse(row.embassy_directory_json || '[]'),
      refusalAppeal: JSON.parse(row.refusal_appeal_json || '{}'),
      afterApproval: JSON.parse(row.after_approval_json || '{}'),
      costCalculator: JSON.parse(row.cost_calculator_json || '{}'),
      faq: JSON.parse(row.faq_json || '[]'),
      legalEvidence: JSON.parse(row.legal_evidence_json || '[]'),
      lastUpdated: row.last_updated,
      verificationStatus: row.verification_status
    };

    baseRecord.comprehensiveSections = normalizeVisaDetailTo30Sections({
      ...baseRecord,
      comprehensiveSections: rawComp
    });

    return baseRecord;
  }

  async getPaginatedVisaDetails(
    page: number,
    limit: number,
    search: string = '',
    status: string = ''
  ): Promise<{ data: any[]; total: number }> {
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(id ILIKE $${params.length} OR program_id ILIKE $${params.length})`);
    }
    if (status) {
      params.push(status);
      conditions.push(`verification_status = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await this.pg.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM visa_details ${whereClause}`,
      params
    );
    const total = Number(countRes.rows[0]?.count || 0);

    const rowParams = [...params, limit, offset];
    const rowsRes = await this.pg.query(
      `SELECT * FROM visa_details ${whereClause} ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      rowParams
    );

    return {
      total,
      data: rowsRes.rows.map(r => this.mapVisaDetailRow(r))
    };
  }

  async saveVisaDetails(details: any, exec: PgExecutor = this.pg): Promise<void> {
    const lastUpdated = details.lastUpdated || new Date().toISOString();
    const verificationStatus = details.verificationStatus || 'VERIFIED';
    const normalizedComp = normalizeVisaDetailTo30Sections({
      ...details,
      lastUpdated,
      verificationStatus
    });

    await exec.query(
      `
      INSERT INTO visa_details (
        id, program_id, country_overview_json, visa_overview_json, eligibility_json,
        financial_json, document_checklist_json, application_fields_json,
        application_steps_json, interview_prep_json, embassy_directory_json,
        refusal_appeal_json, after_approval_json, cost_calculator_json,
        faq_json, legal_evidence_json, comprehensive_sections_json, last_updated, verification_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      )
      ON CONFLICT(id) DO UPDATE SET
        country_overview_json = EXCLUDED.country_overview_json,
        visa_overview_json = EXCLUDED.visa_overview_json,
        eligibility_json = EXCLUDED.eligibility_json,
        financial_json = EXCLUDED.financial_json,
        document_checklist_json = EXCLUDED.document_checklist_json,
        application_fields_json = EXCLUDED.application_fields_json,
        application_steps_json = EXCLUDED.application_steps_json,
        interview_prep_json = EXCLUDED.interview_prep_json,
        embassy_directory_json = EXCLUDED.embassy_directory_json,
        refusal_appeal_json = EXCLUDED.refusal_appeal_json,
        after_approval_json = EXCLUDED.after_approval_json,
        cost_calculator_json = EXCLUDED.cost_calculator_json,
        faq_json = EXCLUDED.faq_json,
        legal_evidence_json = EXCLUDED.legal_evidence_json,
        comprehensive_sections_json = EXCLUDED.comprehensive_sections_json,
        last_updated = EXCLUDED.last_updated,
        verification_status = EXCLUDED.verification_status
      `,
      [
        details.id || `vd-${details.programId}`,
        details.programId,
        JSON.stringify(details.countryOverview || {}),
        JSON.stringify(details.visaOverview || {}),
        JSON.stringify(details.eligibility || {}),
        JSON.stringify(details.financial || {}),
        JSON.stringify(details.documentChecklist || []),
        JSON.stringify(details.applicationFields || []),
        JSON.stringify(details.applicationSteps || []),
        JSON.stringify(details.interviewPrep || {}),
        JSON.stringify(details.embassyDirectory || []),
        JSON.stringify(details.refusalAppeal || {}),
        JSON.stringify(details.afterApproval || {}),
        JSON.stringify(details.costCalculator || {}),
        JSON.stringify(details.faq || []),
        JSON.stringify(details.legalEvidence || []),
        JSON.stringify(normalizedComp),
        lastUpdated,
        verificationStatus
      ]
    );
  }

  async updateVisaStatus(programId: string, status: string, exec: PgExecutor = this.pg): Promise<void> {
    await exec.query('UPDATE visa_details SET verification_status = $1 WHERE program_id = $2', [
      status,
      programId
    ]);
  }

  async getVisaClaimsWithEvidence(
    programId: string,
    exec: PgExecutor = this.pg,
    targetNationality?: string
  ): Promise<any[]> {
    // Optimized 2-query batch fetch (avoids N+1 queries)
    const claimsRes = await exec.query(
      'SELECT * FROM visa_detail_claims WHERE program_id = $1 ORDER BY section ASC, description ASC',
      [programId]
    );
    if (claimsRes.rows.length === 0) return [];

    let progRow: any = null;
    try {
      const pRes = await exec.query(
        'SELECT country_code, category FROM immigration_programs WHERE id = $1',
        [programId]
      );
      progRow = pRes.rows[0] || null;
    } catch {
      progRow = null;
    }

    const claimIds = claimsRes.rows.map((r: any) => r.id);
    const placeholders = claimIds.map((_, i) => `$${i + 1}`).join(', ');
    const evRes = await exec.query(
      `SELECT * FROM visa_detail_evidence WHERE claim_id IN (${placeholders})`,
      claimIds
    );

    const evByClaim: Record<string, any[]> = {};
    for (const r of evRes.rows) {
      const cid = r.claim_id;
      if (!evByClaim[cid]) evByClaim[cid] = [];
      evByClaim[cid].push({
        id: r.id,
        claimId: r.claim_id,
        sourceUrl: r.source_url,
        legalInstrument: r.legal_instrument,
        effectiveDate: r.effective_date,
        lastCheckedDate: r.last_checked_date,
        sourceTitle: r.source_title || '',
        issuingAuthority: r.issuing_authority || '',
        publicationDate: r.publication_date || '',
        accessDate: r.access_date || r.last_checked_date || '',
        reviewerNotes: r.reviewer_notes || '',
        excerpt: r.excerpt || '',
        rawStatus: r.status || 'NEEDS_REVIEW',
        status: normalizeEvidenceStatus(r.status)
      });
    }

    return claimsRes.rows.map((r: any) => {
      const claimWithEv = {
        id: r.id,
        programId: r.program_id,
        section: r.section,
        description: r.description,
        value: r.value,
        unit: r.unit,
        status: r.status,
        reviewer: r.reviewer,
        reviewTimestamp: r.review_timestamp,
        requirementClassification: isValidRequirementClassification(r.requirement_classification)
          ? r.requirement_classification
          : 'ADMIN_INSTRUCTION',
        applicableNationality: r.applicable_nationality || 'ALL',
        countryIso: r.country_iso || '',
        visaCategory: r.visa_category || '',
        evidence: evByClaim[r.id] || []
      };
      const integrity = evaluateClaimIntegrity(claimWithEv, {
        expectedCountryIso: progRow?.country_code || (programId || '').split('-')[0] || '',
        expectedVisaCategory: progRow?.category || '',
        targetNationality
      });
      return {
        ...claimWithEv,
        staleOrMissingEvidence: integrity.staleOrMissingEvidence,
        canPresentAsVerified: integrity.canPresentAsVerified,
        warnings: integrity.warnings,
        integrity
      };
    });
  }

  async reconcileClaimVerificationAfterEvidenceChange(
    claimId: string,
    reasonTrigger: string,
    exec: PgExecutor = this.pg
  ): Promise<{
    downgraded: boolean;
    previousStatus?: string;
    newStatus?: string;
    claimId: string;
    programId?: string;
    versionId?: string;
  }> {
    const claimRes = await exec.query('SELECT * FROM visa_detail_claims WHERE id = $1', [claimId]);
    const claimRow = claimRes.rows[0];
    if (!claimRow) return { downgraded: false, claimId };

    const evRes = await exec.query('SELECT * FROM visa_detail_evidence WHERE claim_id = $1', [claimId]);
    const currentEv = evRes.rows.map((r: any) => ({
      ...r,
      status: normalizeEvidenceStatus(r.status)
    }));

    const integrity = evaluateClaimIntegrity({ ...claimRow, evidence: currentEv });

    if (claimRow.status === 'VERIFIED' && !integrity.hasQualifyingOfficialEvidence) {
      const nowIso = new Date().toISOString();
      await exec.query(
        'UPDATE visa_detail_claims SET status = $1, review_timestamp = $2 WHERE id = $3',
        ['NEEDS_EVIDENCE', nowIso, claimId]
      );

      const programId = claimRow.program_id;
      const details = await this.getVisaDetails(programId, exec);
      const claimsSnapshot = await this.getVisaClaimsWithEvidence(programId, exec);
      const versionId = `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await this.saveVisaVersion(
        {
          id: versionId,
          programId,
          data: { details, claims: claimsSnapshot },
          editorId: 'system-integrity-guard',
          timestamp: nowIso,
          changeReason: `Auto-downgraded claim ${claimId} from VERIFIED to NEEDS_EVIDENCE (${reasonTrigger})`
        },
        exec
      );

      return {
        downgraded: true,
        previousStatus: 'VERIFIED',
        newStatus: 'NEEDS_EVIDENCE',
        claimId,
        programId,
        versionId
      };
    }

    return {
      downgraded: false,
      previousStatus: claimRow.status,
      newStatus: claimRow.status,
      claimId,
      programId: claimRow.program_id
    };
  }

  async saveVisaClaim(claim: any, exec: PgExecutor = this.pg): Promise<void> {
    const rawClassification = claim.requirementClassification || claim.requirement_classification;
    const requirementClassification: RequirementClassification = isValidRequirementClassification(rawClassification)
      ? rawClassification
      : 'ADMIN_INSTRUCTION';
    const applicableNationality = String(claim.applicableNationality || claim.applicable_nationality || 'ALL').trim() || 'ALL';
    const countryIso = String(claim.countryIso ?? claim.country_iso ?? '').trim();
    const visaCategory = String(claim.visaCategory ?? claim.visa_category ?? '').trim();

    await exec.query(
      `
      INSERT INTO visa_detail_claims (
        id, program_id, section, description, value, unit, status, reviewer, review_timestamp,
        requirement_classification, applicable_nationality, country_iso, visa_category
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT(id) DO UPDATE SET
        section = EXCLUDED.section,
        description = EXCLUDED.description,
        value = EXCLUDED.value,
        unit = EXCLUDED.unit,
        status = EXCLUDED.status,
        reviewer = EXCLUDED.reviewer,
        review_timestamp = EXCLUDED.review_timestamp,
        requirement_classification = EXCLUDED.requirement_classification,
        applicable_nationality = EXCLUDED.applicable_nationality,
        country_iso = EXCLUDED.country_iso,
        visa_category = EXCLUDED.visa_category
      `,
      [
        claim.id,
        claim.programId || claim.program_id,
        claim.section,
        claim.description,
        claim.value || '',
        claim.unit || '',
        claim.status || 'NEEDS_EVIDENCE',
        claim.reviewer || 'admin',
        claim.reviewTimestamp || claim.review_timestamp || new Date().toISOString(),
        requirementClassification,
        applicableNationality,
        countryIso,
        visaCategory
      ]
    );
  }

  async deleteVisaClaim(claimId: string, exec?: PgExecutor): Promise<void> {
    const runDelete = async (targetExec: PgExecutor) => {
      await targetExec.query('DELETE FROM visa_detail_evidence WHERE claim_id = $1', [claimId]);
      await targetExec.query('DELETE FROM visa_detail_claims WHERE id = $1', [claimId]);
    };
    if (exec) return runDelete(exec);
    return this.pg.transaction(runDelete);
  }

  async saveVisaEvidence(
    evidence: any,
    exec?: PgExecutor,
    options?: { skipReconcile?: boolean }
  ): Promise<{ downgradedClaim?: boolean; newClaimStatus?: string; versionId?: string }> {
    const runSave = async (targetExec: PgExecutor) => {
      const normalizedStatus = normalizeEvidenceStatus(evidence.status);
      const claimId = evidence.claimId || evidence.claim_id;
      await targetExec.query(
        `
        INSERT INTO visa_detail_evidence (
          id, claim_id, source_url, legal_instrument, effective_date, last_checked_date,
          source_title, issuing_authority, publication_date, access_date, reviewer_notes, excerpt, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT(id) DO UPDATE SET
          source_url = EXCLUDED.source_url,
          legal_instrument = EXCLUDED.legal_instrument,
          effective_date = EXCLUDED.effective_date,
          last_checked_date = EXCLUDED.last_checked_date,
          source_title = EXCLUDED.source_title,
          issuing_authority = EXCLUDED.issuing_authority,
          publication_date = EXCLUDED.publication_date,
          access_date = EXCLUDED.access_date,
          reviewer_notes = EXCLUDED.reviewer_notes,
          excerpt = EXCLUDED.excerpt,
          status = EXCLUDED.status
        `,
        [
          evidence.id,
          claimId,
          evidence.sourceUrl || evidence.source_url || '',
          evidence.legalInstrument || evidence.legal_instrument || '',
          evidence.effectiveDate || evidence.effective_date || '',
          evidence.lastCheckedDate || evidence.last_checked_date || new Date().toISOString().split('T')[0],
          evidence.sourceTitle || evidence.source_title || '',
          evidence.issuingAuthority || evidence.issuing_authority || '',
          evidence.publicationDate || evidence.publication_date || '',
          evidence.accessDate || evidence.access_date || new Date().toISOString().split('T')[0],
          evidence.reviewerNotes || evidence.reviewer_notes || '',
          evidence.excerpt || '',
          normalizedStatus
        ]
      );

      if (!options?.skipReconcile && claimId) {
        const rec = await this.reconcileClaimVerificationAfterEvidenceChange(
          claimId,
          `Evidence ${evidence.id} status set to ${normalizedStatus}`,
          targetExec
        );
        return {
          downgradedClaim: rec.downgraded,
          newClaimStatus: rec.newStatus,
          versionId: rec.versionId
        };
      }
      return {};
    };

    if (exec) return runSave(exec);
    return this.pg.transaction(runSave);
  }

  async deleteVisaEvidence(
    evidenceId: string,
    exec?: PgExecutor
  ): Promise<{ downgradedClaim?: boolean; newClaimStatus?: string; claimId?: string; versionId?: string }> {
    const runDelete = async (targetExec: PgExecutor) => {
      const evRes = await targetExec.query('SELECT claim_id FROM visa_detail_evidence WHERE id = $1', [
        evidenceId
      ]);
      const claimId = evRes.rows[0]?.claim_id;
      await targetExec.query('DELETE FROM visa_detail_evidence WHERE id = $1', [evidenceId]);
      if (claimId) {
        const rec = await this.reconcileClaimVerificationAfterEvidenceChange(
          claimId,
          `Evidence ${evidenceId} deleted`,
          targetExec
        );
        return {
          downgradedClaim: rec.downgraded,
          newClaimStatus: rec.newStatus,
          claimId,
          versionId: rec.versionId
        };
      }
      return {};
    };

    if (exec) return runDelete(exec);
    return this.pg.transaction(runDelete);
  }

  async getVisaVersions(programId: string, exec: PgExecutor = this.pg): Promise<any[]> {
    const { rows } = await exec.query(
      'SELECT * FROM visa_detail_versions WHERE program_id = $1 ORDER BY timestamp DESC',
      [programId]
    );
    return rows.map((r: any) => ({
      id: r.id,
      programId: r.program_id,
      data: JSON.parse(r.data_json || '{}'),
      editorId: r.editor_id,
      timestamp: r.timestamp,
      changeReason: r.change_reason
    }));
  }

  async saveVisaVersion(version: any, exec: PgExecutor = this.pg): Promise<void> {
    await exec.query(
      `
      INSERT INTO visa_detail_versions (id, program_id, data_json, editor_id, timestamp, change_reason)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT(id) DO UPDATE SET
        data_json = EXCLUDED.data_json,
        change_reason = EXCLUDED.change_reason
      `,
      [
        version.id,
        version.programId || version.program_id,
        typeof version.data === 'string' ? version.data : JSON.stringify(version.data),
        version.editorId || version.editor_id || 'admin',
        version.timestamp || new Date().toISOString(),
        version.changeReason || version.change_reason || 'Snapshot'
      ]
    );
  }

  async restoreVersion(versionId: string, editorId: string = 'admin'): Promise<{
    success: boolean;
    restoredVersionId: string;
    newVersionId: string;
  }> {
    return this.pg.transaction(async tx => {
      const verRes = await tx.query('SELECT * FROM visa_detail_versions WHERE id = $1', [versionId]);
      const version = verRes.rows[0];
      if (!version) throw new Error('Version not found');

      const parsed = JSON.parse(version.data_json);
      const details = parsed.details || parsed;
      const programId = version.program_id;

      await this.saveVisaDetails({ ...details, programId }, tx);

      if (Array.isArray(parsed.claims)) {
        const existingClaims = await tx.query('SELECT id FROM visa_detail_claims WHERE program_id = $1', [
          programId
        ]);
        for (const ec of existingClaims.rows) {
          await tx.query('DELETE FROM visa_detail_evidence WHERE claim_id = $1', [ec.id]);
        }
        await tx.query('DELETE FROM visa_detail_claims WHERE program_id = $1', [programId]);

        for (const c of parsed.claims) {
          await this.saveVisaClaim({ ...c, programId }, tx);
          if (Array.isArray(c.evidence)) {
            for (const ev of c.evidence) {
              await this.saveVisaEvidence({ ...ev, claimId: c.id }, tx, { skipReconcile: true });
            }
          }
        }
      }

      const newVersionId = `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await this.saveVisaVersion(
        {
          id: newVersionId,
          programId,
          data: parsed,
          editorId,
          timestamp: new Date().toISOString(),
          changeReason: `Restored from version ${versionId} (${version.change_reason || 'Previous state'})`
        },
        tx
      );

      return { success: true, restoredVersionId: versionId, newVersionId };
    });
  }

  async getDashboardStats(): Promise<any> {
    const statsRes = await this.pg.query(`
      SELECT
        COUNT(*)::int as total,
         COALESCE(SUM(CASE WHEN verification_status = 'DRAFT' THEN 1 ELSE 0 END), 0)::int as draft,
        COALESCE(SUM(CASE WHEN verification_status = 'NEEDS_EVIDENCE' THEN 1 ELSE 0 END), 0)::int as needs_evidence,
        COALESCE(SUM(CASE WHEN verification_status = 'UNDER_REVIEW' THEN 1 ELSE 0 END), 0)::int as under_review,
        COALESCE(SUM(CASE WHEN verification_status = 'VERIFIED' THEN 1 ELSE 0 END), 0)::int as verified,
        COALESCE(SUM(CASE WHEN verification_status = 'APPROVED' THEN 1 ELSE 0 END), 0)::int as approved,
        COALESCE(SUM(CASE WHEN verification_status = 'PUBLISHED' THEN 1 ELSE 0 END), 0)::int as published,
        COALESCE(SUM(CASE WHEN verification_status = 'UPDATE_REQUIRED' THEN 1 ELSE 0 END), 0)::int as update_required,
        COALESCE(SUM(CASE WHEN verification_status = 'EXPIRED' THEN 1 ELSE 0 END), 0)::int as expired,
        COALESCE(SUM(CASE WHEN verification_status = 'REJECTED' THEN 1 ELSE 0 END), 0)::int as rejected,
        COALESCE(SUM(CASE WHEN verification_status = 'QUARANTINED' THEN 1 ELSE 0 END), 0)::int as quarantined
      FROM visa_details
    `);

    const claimsRes = await this.pg.query(`
      SELECT
        COUNT(DISTINCT c.id)::int as "totalClaims",
        COALESCE(SUM(CASE WHEN e.id IS NULL THEN 1 ELSE 0 END), 0)::int as "claimsWithoutEvidence"
      FROM visa_detail_claims c
      LEFT JOIN visa_detail_evidence e ON c.id = e.claim_id
    `);

    return {
      ...(statsRes.rows[0] || {}),
      ...(claimsRes.rows[0] || {})
    };
  }

  async logCronExecutionToDb(log: {
    id?: string;
    cronName: string;
    httpMethod: string;
    targetCountries: string[];
    status: string;
    checkedCount: number;
    updatesFound: number;
    logMessage: string;
    executionDurationMs: number;
    missedRunResumed?: boolean;
  }): Promise<string> {
    const id = log.id || `cron-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const nowStr = new Date().toISOString();
    const safeMsg = redactSensitiveData(String(log.logMessage || ''));
    await this.pg.query(
      `INSERT INTO cron_execution_logs (
        id, timestamp, cron_name, http_method, target_countries, status,
        checked_count, updates_found, log_message, execution_duration_ms, missed_run_resumed, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        nowStr,
        log.cronName,
        log.httpMethod,
        JSON.stringify(log.targetCountries || []),
        log.status,
        log.checkedCount,
        log.updatesFound,
        safeMsg,
        log.executionDurationMs,
        log.missedRunResumed ? 1 : 0,
        nowStr
      ]
    );
    return id;
  }

  async getCronExecutionLogsFromDb(limit: number = 20): Promise<any[]> {
    const { rows } = await this.pg.query('SELECT * FROM cron_execution_logs ORDER BY timestamp DESC LIMIT $1', [
      limit
    ]);
    return rows.map((r: any) => ({
      id: r.id,
      timestamp: r.timestamp,
      cronName: r.cron_name,
      httpMethod: r.http_method,
      targetCountries: JSON.parse(r.target_countries || '[]'),
      status: r.status,
      checkedCount: r.checked_count,
      updatesFound: r.updates_found,
      logMessage: redactSensitiveData(String(r.log_message || '')),
      executionDurationMs: r.execution_duration_ms,
      missedRunResumed: Boolean(r.missed_run_resumed)
    }));
  }

  async acquireJobLock(
    lockKey: string,
    ownerId: string,
    ttlMs: number = 5 * 60 * 1000,
    metadata: Record<string, unknown> = {}
  ): Promise<{ acquired: boolean; existingOwner?: string; expiresAt?: string }> {
    return this.pg.transaction(async (tx) => {
      const now = Date.now();
      const nowIso = new Date(now).toISOString();
      const expiresIso = new Date(now + Math.max(1000, ttlMs)).toISOString();

      await tx.query('DELETE FROM automation_job_locks WHERE lock_key = $1 AND expires_at <= $2', [
        lockKey,
        nowIso
      ]);

      const existingRes = await tx.query<{ owner_id: string; expires_at: string }>(
        'SELECT owner_id, expires_at FROM automation_job_locks WHERE lock_key = $1',
        [lockKey]
      );
      const existing = existingRes.rows[0];
      if (existing && existing.owner_id !== ownerId) {
        return {
          acquired: false,
          existingOwner: existing.owner_id,
          expiresAt: existing.expires_at
        };
      }

      await tx.query(
        `INSERT INTO automation_job_locks (lock_key, owner_id, acquired_at, expires_at, metadata_json)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT(lock_key) DO UPDATE SET
           owner_id = EXCLUDED.owner_id,
           acquired_at = EXCLUDED.acquired_at,
           expires_at = EXCLUDED.expires_at,
           metadata_json = EXCLUDED.metadata_json`,
        [lockKey, ownerId, nowIso, expiresIso, JSON.stringify(redactSensitiveData(metadata))]
      );

      return { acquired: true, expiresAt: expiresIso };
    });
  }

  async releaseJobLock(lockKey: string, ownerId: string): Promise<boolean> {
    const res = await this.pg.query('DELETE FROM automation_job_locks WHERE lock_key = $1 AND owner_id = $2', [
      lockKey,
      ownerId
    ]);
    return res.rowCount > 0;
  }

  async saveAutomationCheckpoint(cp: {
    checkpointId: string;
    jobName: string;
    runId: string;
    status: string;
    cursorIndex: number;
    totalItems: number;
    completedKeys: string[];
    failedKeys: string[];
    idempotencyKeys?: string[];
    state?: Record<string, unknown>;
  }): Promise<void> {
    await this.pg.query(
      `INSERT INTO automation_checkpoints (
         checkpoint_id, job_name, run_id, status, cursor_index, total_items,
         completed_keys_json, failed_keys_json, idempotency_keys_json, state_json, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT(checkpoint_id) DO UPDATE SET
         run_id = EXCLUDED.run_id,
         status = EXCLUDED.status,
         cursor_index = EXCLUDED.cursor_index,
         total_items = EXCLUDED.total_items,
         completed_keys_json = EXCLUDED.completed_keys_json,
         failed_keys_json = EXCLUDED.failed_keys_json,
         idempotency_keys_json = EXCLUDED.idempotency_keys_json,
         state_json = EXCLUDED.state_json,
         updated_at = EXCLUDED.updated_at`,
      [
        cp.checkpointId,
        cp.jobName,
        cp.runId,
        cp.status,
        cp.cursorIndex,
        cp.totalItems,
        JSON.stringify(cp.completedKeys || []),
        JSON.stringify(cp.failedKeys || []),
        JSON.stringify(cp.idempotencyKeys || []),
        JSON.stringify(redactSensitiveData(cp.state || {})),
        new Date().toISOString()
      ]
    );
  }

  async getAutomationCheckpoint(checkpointId: string): Promise<any | null> {
    const { rows } = await this.pg.query('SELECT * FROM automation_checkpoints WHERE checkpoint_id = $1', [
      checkpointId
    ]);
    const r = rows[0];
    if (!r) return null;
    return {
      checkpointId: r.checkpoint_id,
      jobName: r.job_name,
      runId: r.run_id,
      status: r.status,
      cursorIndex: r.cursor_index,
      totalItems: r.total_items,
      completedKeys: JSON.parse(r.completed_keys_json || '[]'),
      failedKeys: JSON.parse(r.failed_keys_json || '[]'),
      idempotencyKeys: JSON.parse(r.idempotency_keys_json || '[]'),
      state: JSON.parse(r.state_json || '{}'),
      updatedAt: r.updated_at
    };
  }

  async recordDeadLetterItem(item: {
    id?: string;
    jobName: string;
    runId: string;
    targetKey: string;
    failureClass: string;
    errorMessage: string;
    payload?: Record<string, unknown>;
    retryCount?: number;
    status?: string;
  }): Promise<string> {
    const id = item.id || `dlq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const safeError = redactSensitiveData(String(item.errorMessage || 'Unknown failure'));
    await this.pg.query(
      `INSERT INTO automation_dead_letter (
         id, job_name, run_id, target_key, failure_class, error_message, payload_json, retry_count, status, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT(id) DO UPDATE SET
         failure_class = EXCLUDED.failure_class,
         error_message = EXCLUDED.error_message,
         retry_count = EXCLUDED.retry_count,
         status = EXCLUDED.status`,
      [
        id,
        item.jobName,
        item.runId,
        item.targetKey,
        item.failureClass,
        safeError,
        JSON.stringify(redactSensitiveData(item.payload || {})),
        item.retryCount ?? 0,
        item.status || 'QUARANTINED',
        new Date().toISOString()
      ]
    );
    return id;
  }

  async getDeadLetterItems(status?: string): Promise<any[]> {
    const { rows } = status
      ? await this.pg.query('SELECT * FROM automation_dead_letter WHERE status = $1 ORDER BY created_at DESC', [status])
      : await this.pg.query('SELECT * FROM automation_dead_letter ORDER BY created_at DESC');
    return rows.map((r: any) => ({
      id: r.id,
      jobName: r.job_name,
      runId: r.run_id,
      targetKey: r.target_key,
      failureClass: r.failure_class,
      errorMessage: r.error_message,
      payload: JSON.parse(r.payload_json || '{}'),
      retryCount: r.retry_count,
      status: r.status,
      createdAt: r.created_at,
      resolvedAt: r.resolved_at
    }));
  }
}
