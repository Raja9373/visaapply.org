import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  EVIDENCE_STATUSES,
  INVALIDATING_EVIDENCE_STATUSES,
  QUALIFYING_OFFICIAL_EVIDENCE_STATUSES,
  REQUIREMENT_CLASSIFICATIONS,
  REQUIREMENT_CLASSIFICATION_META,
  SIX_LIFECYCLE_STAGES,
  THIRTY_SECTIONS_REGISTRY,
  TWENTY_TWO_SPECIAL_TOPICS_REGISTRY,
  createDefaultApplicantSpecialTopics,
  denormalize30SectionsToLegacy13,
  evaluateClaimIntegrity,
  isInvalidatingEvidenceStatus,
  isQualifyingOfficialEvidence,
  isSectionSubstantivelyPopulated,
  isTopicSubstantivelyPopulated,
  isValidRequirementClassification,
  normalizeEvidenceStatus,
  normalizeVisaDetailTo30Sections,
  sanitizeVisaDetailsForPublic,
  sync30SectionsToLegacyDetails,
  syncLegacyDetailsTo30Sections,
  validateComprehensiveProfileHonesty
} from '../types/visaComprehensiveProfile';
import type {
  EvidenceStatus,
  EvidenceVerificationStatus,
  RequirementClassification,
  VisaApplicantSpecialTopics,
  VisaComprehensiveProfile
} from '../types/visaComprehensiveProfile';
import {
  OperationalEvent,
  OperationalEventSink,
  recordOperationalEvent,
  redactSensitiveData
} from '../utils/operationalObservability';

export {
  REQUIREMENT_CLASSIFICATIONS,
  REQUIREMENT_CLASSIFICATION_META,
  THIRTY_SECTIONS_REGISTRY,
  SIX_LIFECYCLE_STAGES,
  TWENTY_TWO_SPECIAL_TOPICS_REGISTRY,
  EVIDENCE_STATUSES,
  QUALIFYING_OFFICIAL_EVIDENCE_STATUSES,
  INVALIDATING_EVIDENCE_STATUSES,
  normalizeEvidenceStatus,
  isQualifyingOfficialEvidence,
  isInvalidatingEvidenceStatus,
  isValidRequirementClassification,
  normalizeVisaDetailTo30Sections,
  denormalize30SectionsToLegacy13,
  sync30SectionsToLegacyDetails,
  syncLegacyDetailsTo30Sections,
  isSectionSubstantivelyPopulated,
  isTopicSubstantivelyPopulated,
  validateComprehensiveProfileHonesty,
  evaluateClaimIntegrity,
  createDefaultApplicantSpecialTopics,
  sanitizeVisaDetailsForPublic
};
export type {
  RequirementClassification,
  EvidenceStatus,
  EvidenceVerificationStatus,
  VisaComprehensiveProfile,
  VisaApplicantSpecialTopics
};

export interface SqliteMigrationDefinition {
  version: string;
  name: string;
  rollbackNotes: string;
  apply: (targetDb: Database.Database) => void;
  checksumSource: string;
}

export interface SqliteOpenOptions {
  readonly?: boolean;
  fileMustExist?: boolean;
  busyTimeoutMs?: number;
  walMode?: boolean;
  skipMigrations?: boolean;
}

export function computeMigrationChecksum(source: string): string {
  return crypto.createHash('sha256').update(source, 'utf8').digest('hex');
}

function addColumnIfMissing(targetDb: Database.Database, table: string, column: string, definition: string): void {
  const cols = targetDb.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  const exists = cols.some((c) => c.name === column);
  if (!exists) {
    targetDb.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}

const BASELINE_SQL = `
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

CREATE INDEX IF NOT EXISTS idx_prog_country ON immigration_programs(country_code);
CREATE INDEX IF NOT EXISTS idx_prog_status ON immigration_programs(verification_status);
CREATE INDEX IF NOT EXISTS idx_changelog_date ON changelog_entries(date);
CREATE INDEX IF NOT EXISTS idx_cron_time ON cron_execution_logs(timestamp);

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
  last_updated TEXT,
  verification_status TEXT
);
CREATE INDEX IF NOT EXISTS idx_visa_details_program_id ON visa_details(program_id);

CREATE TABLE IF NOT EXISTS visa_detail_claims (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES immigration_programs(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  description TEXT NOT NULL,
  value TEXT,
  unit TEXT,
  status TEXT NOT NULL DEFAULT 'NEEDS_EVIDENCE',
  reviewer TEXT,
  review_timestamp TEXT
);
CREATE INDEX IF NOT EXISTS idx_claims_program ON visa_detail_claims(program_id);

CREATE TABLE IF NOT EXISTS visa_detail_evidence (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL REFERENCES visa_detail_claims(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  legal_instrument TEXT,
  effective_date TEXT,
  last_checked_date TEXT
);
CREATE INDEX IF NOT EXISTS idx_evidence_claim ON visa_detail_evidence(claim_id);

CREATE TABLE IF NOT EXISTS visa_detail_versions (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL REFERENCES immigration_programs(id) ON DELETE CASCADE,
  data_json TEXT NOT NULL,
  editor_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  change_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_versions_program ON visa_detail_versions(program_id);
`;

const PHASE_44_OPERATIONAL_TABLES_SQL = `
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

CREATE INDEX IF NOT EXISTS idx_claims_status ON visa_detail_claims(program_id, status);
CREATE INDEX IF NOT EXISTS idx_evidence_status ON visa_detail_evidence(claim_id, status);
CREATE INDEX IF NOT EXISTS idx_cron_status_time ON cron_execution_logs(cron_name, status, timestamp);
CREATE INDEX IF NOT EXISTS idx_dlq_status ON automation_dead_letter(status, job_name, created_at);
CREATE INDEX IF NOT EXISTS idx_op_events_cat_time ON operational_events(category, timestamp);
`;

export const SQLITE_MIGRATIONS: SqliteMigrationDefinition[] = [
  {
    version: '001_baseline_enrichment_tables',
    name: 'Baseline 8 enrichment tables and primary indexes',
    rollbackNotes: 'Non-destructive CREATE IF NOT EXISTS; rollback via verified pre-migration backup.',
    checksumSource: 'sqlite:001_baseline_enrichment_tables:v1',
    apply: (targetDb) => {
      targetDb.exec(BASELINE_SQL);
    }
  },
  {
    version: '002_phase31_comprehensive_and_classification',
    name: 'Phase 3.1/3.2 evidence metadata, 30-section JSON, and 5-tier claim classification',
    rollbackNotes: 'Additive columns; preserve via verified pre-migration backup.',
    checksumSource: 'sqlite:002_phase31_comprehensive_and_classification:v1',
    apply: (targetDb) => {
      const evidenceCols = [
        { name: 'source_title', type: 'TEXT' },
        { name: 'issuing_authority', type: 'TEXT' },
        { name: 'publication_date', type: 'TEXT' },
        { name: 'access_date', type: 'TEXT' },
        { name: 'reviewer_notes', type: 'TEXT' },
        { name: 'excerpt', type: "TEXT DEFAULT ''" },
        { name: 'status', type: "TEXT DEFAULT 'NEEDS_REVIEW'" }
      ];
      for (const col of evidenceCols) {
        addColumnIfMissing(targetDb, 'visa_detail_evidence', col.name, col.type);
      }

      addColumnIfMissing(targetDb, 'visa_details', 'comprehensive_sections_json', "TEXT DEFAULT '{}'");

      const claimCols = [
        { name: 'requirement_classification', type: "TEXT NOT NULL DEFAULT 'ADMIN_INSTRUCTION'" },
        { name: 'applicable_nationality', type: "TEXT NOT NULL DEFAULT 'ALL'" },
        { name: 'country_iso', type: "TEXT NOT NULL DEFAULT ''" },
        { name: 'visa_category', type: "TEXT NOT NULL DEFAULT ''" }
      ];
      for (const col of claimCols) {
        addColumnIfMissing(targetDb, 'visa_detail_claims', col.name, col.type);
      }

      targetDb.exec(`
        CREATE INDEX IF NOT EXISTS idx_claims_classification ON visa_detail_claims(program_id, requirement_classification);
        CREATE INDEX IF NOT EXISTS idx_claims_nationality ON visa_detail_claims(program_id, applicable_nationality);
      `);
    }
  },
  {
    version: '003_phase44_operational_reliability_and_constraints',
    name: 'Phase 4.4 job locks, checkpoints, dead-letter quarantine, operational telemetry, and indexes',
    rollbackNotes: 'DROP TABLE IF EXISTS automation_job_locks, automation_checkpoints, automation_dead_letter, operational_events; DROP INDEXES.',
    checksumSource: 'sqlite:003_phase44_operational_reliability_and_constraints:v1',
    apply: (targetDb) => {
      targetDb.exec(PHASE_44_OPERATIONAL_TABLES_SQL);
      // Enforce unique program_id on visa_details if no pre-existing duplicate rows conflict
      const dupCheck = targetDb
        .prepare('SELECT program_id FROM visa_details GROUP BY program_id HAVING COUNT(*) > 1 LIMIT 1')
        .get();
      if (!dupCheck) {
        targetDb.exec(
          'CREATE UNIQUE INDEX IF NOT EXISTS idx_visa_details_program_unique ON visa_details(program_id);'
        );
      }
    }
  }
];

export interface AppliedMigrationRecord {
  version: string;
  name: string;
  checksum: string;
  appliedAt: string;
  rollbackNotes: string;
}

export function ensureSchemaMigrationsTable(targetDb: Database.Database): void {
  targetDb.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      checksum TEXT NOT NULL,
      applied_at TEXT NOT NULL,
      rollback_notes TEXT NOT NULL
    );
  `);
}

export function getAppliedSqliteMigrations(targetDb: Database.Database): AppliedMigrationRecord[] {
  const hasTable = targetDb
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'")
    .get();
  if (!hasTable) return [];
  const rows = targetDb
    .prepare('SELECT version, name, checksum, applied_at, rollback_notes FROM schema_migrations ORDER BY version ASC')
    .all() as any[];
  return rows.map((r) => ({
    version: r.version,
    name: r.name,
    checksum: r.checksum,
    appliedAt: r.applied_at,
    rollbackNotes: r.rollback_notes
  }));
}

/**
 * Idempotent, transactional, checksum-verified SQLite migration runner.
 */
export function runTrackedSqliteMigrations(
  targetDb: Database.Database,
  migrations: SqliteMigrationDefinition[] = SQLITE_MIGRATIONS
): { newlyApplied: string[]; alreadyApplied: string[] } {
  targetDb.pragma('foreign_keys = ON');
  ensureSchemaMigrationsTable(targetDb);

  const newlyApplied: string[] = [];
  const alreadyApplied: string[] = [];

  for (const mig of migrations) {
    const expectedChecksum = computeMigrationChecksum(mig.checksumSource);
    const existing = targetDb
      .prepare('SELECT version, checksum FROM schema_migrations WHERE version = ?')
      .get(mig.version) as { version: string; checksum: string } | undefined;

    if (existing) {
      if (existing.checksum !== expectedChecksum) {
        throw new Error(
          `MIGRATION_CHECKSUM_MISMATCH for ${mig.version}: expected ${expectedChecksum}, recorded ${existing.checksum}`
        );
      }
      alreadyApplied.push(mig.version);
      continue;
    }

    const tx = targetDb.transaction(() => {
      mig.apply(targetDb);
      targetDb
        .prepare(
          `INSERT INTO schema_migrations (version, name, checksum, applied_at, rollback_notes) VALUES (?, ?, ?, ?, ?)`
        )
        .run(mig.version, mig.name, expectedChecksum, new Date().toISOString(), mig.rollbackNotes);
    });
    tx();
    newlyApplied.push(mig.version);
    recordOperationalEvent({
      category: 'MIGRATION_EVENT',
      severity: 'INFO',
      component: 'sqlite-migrator',
      message: `Applied SQLite migration ${mig.version}: ${mig.name}`
    });
  }

  return { newlyApplied, alreadyApplied };
}

export function openSqliteDatabase(dbPath: string, options: SqliteOpenOptions = {}): Database.Database {
  const dir = path.dirname(dbPath);
  if (!options.readonly && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const instance = new Database(dbPath, {
    readonly: Boolean(options.readonly),
    fileMustExist: Boolean(options.fileMustExist)
  });

  instance.pragma(`busy_timeout = ${options.busyTimeoutMs ?? 5000}`);
  instance.pragma('foreign_keys = ON');
  if (!options.readonly) {
    if (options.walMode !== false) {
      instance.pragma('journal_mode = WAL');
    }
    instance.pragma('synchronous = NORMAL');
    if (!options.skipMigrations) {
      runTrackedSqliteMigrations(instance);
    }
  }
  return instance;
}

export function closeSqliteDatabase(targetDb: Database.Database | null | undefined): void {
  if (!targetDb) return;
  try {
    if (targetDb.open) {
      targetDb.close();
    }
  } catch {
    // Best-effort safe shutdown
  }
}

export interface SqliteIntegrityAuditReport {
  ok: boolean;
  integrityCheck: string[];
  foreignKeyViolations: number;
  duplicates: {
    visaDetailsProgramId: Array<{ program_id: string; count: number }>;
  };
  orphans: {
    visaDetailsWithoutProgram: number;
    claimsWithoutProgram: number;
    evidenceWithoutClaim: number;
    versionsWithoutProgram: number;
  };
  migrationsApplied: AppliedMigrationRecord[];
  expectedMigrationsCount: number;
  tableCounts: Record<string, number>;
  staleLocksCount: number;
}

export function auditSqliteDatabaseIntegrity(targetDb: Database.Database): SqliteIntegrityAuditReport {
  const integrityRows = targetDb.pragma('integrity_check') as Array<{ integrity_check: string }>;
  const integrityCheck = integrityRows.map((r) => r.integrity_check);
  const fkRows = targetDb.pragma('foreign_key_check') as Array<unknown>;

  const tables = targetDb
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all() as Array<{ name: string }>;
  const tableCounts: Record<string, number> = {};
  for (const t of tables) {
    tableCounts[t.name] = (targetDb.prepare(`SELECT COUNT(*) AS c FROM "${t.name}"`).get() as { c: number }).c;
  }

  const hasTable = (name: string) => tables.some((t) => t.name === name);

  const visaDetailsProgramId = hasTable('visa_details')
    ? (targetDb
        .prepare('SELECT program_id, COUNT(*) AS count FROM visa_details GROUP BY program_id HAVING COUNT(*) > 1')
        .all() as Array<{ program_id: string; count: number }>)
    : [];

  const visaDetailsWithoutProgram =
    hasTable('visa_details') && hasTable('immigration_programs')
      ? (
          targetDb
            .prepare('SELECT COUNT(*) AS c FROM visa_details WHERE program_id NOT IN (SELECT id FROM immigration_programs)')
            .get() as { c: number }
        ).c
      : 0;

  const claimsWithoutProgram =
    hasTable('visa_detail_claims') && hasTable('immigration_programs')
      ? (
          targetDb
            .prepare(
              'SELECT COUNT(*) AS c FROM visa_detail_claims WHERE program_id NOT IN (SELECT id FROM immigration_programs)'
            )
            .get() as { c: number }
        ).c
      : 0;

  const evidenceWithoutClaim =
    hasTable('visa_detail_evidence') && hasTable('visa_detail_claims')
      ? (
          targetDb
            .prepare('SELECT COUNT(*) AS c FROM visa_detail_evidence WHERE claim_id NOT IN (SELECT id FROM visa_detail_claims)')
            .get() as { c: number }
        ).c
      : 0;

  const versionsWithoutProgram =
    hasTable('visa_detail_versions') && hasTable('immigration_programs')
      ? (
          targetDb
            .prepare(
              'SELECT COUNT(*) AS c FROM visa_detail_versions WHERE program_id NOT IN (SELECT id FROM immigration_programs)'
            )
            .get() as { c: number }
        ).c
      : 0;

  const migrationsApplied = getAppliedSqliteMigrations(targetDb);

  let staleLocksCount = 0;
  if (hasTable('automation_job_locks')) {
    staleLocksCount = (
      targetDb
        .prepare('SELECT COUNT(*) AS c FROM automation_job_locks WHERE expires_at <= ?')
        .get(new Date().toISOString()) as { c: number }
    ).c;
  }

  const ok =
    integrityCheck.length === 1 &&
    integrityCheck[0] === 'ok' &&
    fkRows.length === 0 &&
    visaDetailsProgramId.length === 0 &&
    visaDetailsWithoutProgram === 0 &&
    claimsWithoutProgram === 0 &&
    evidenceWithoutClaim === 0 &&
    versionsWithoutProgram === 0;

  return {
    ok,
    integrityCheck,
    foreignKeyViolations: fkRows.length,
    duplicates: { visaDetailsProgramId },
    orphans: {
      visaDetailsWithoutProgram,
      claimsWithoutProgram,
      evidenceWithoutClaim,
      versionsWithoutProgram
    },
    migrationsApplied,
    expectedMigrationsCount: SQLITE_MIGRATIONS.length,
    tableCounts,
    staleLocksCount
  };
}

function mapSqliteVisaDetailRow(row: any) {
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

export function createSqliteRepository(targetDb: Database.Database) {
  const eventSink: OperationalEventSink = {
    insertOperationalEvent(ev: OperationalEvent) {
      const hasTable = targetDb
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='operational_events'")
        .get();
      if (!hasTable) return;
      targetDb
        .prepare(
          `INSERT OR REPLACE INTO operational_events (id, timestamp, category, severity, component, message, details_json)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          ev.id,
          ev.timestamp,
          ev.category,
          ev.severity,
          ev.component,
          ev.message,
          JSON.stringify(ev.details || {})
        );
    }
  };

  function getBatchStateFromDb() {
    try {
      const row = targetDb.prepare('SELECT * FROM batch_state WHERE id = 1').get() as any;
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
    } catch {
      return null;
    }
  }

  function saveBatchStateToDb(state: any) {
    const tx = targetDb.transaction(() => {
      const nowStr = new Date().toISOString();
      const stmt = targetDb.prepare(`
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
          1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        ON CONFLICT(id) DO UPDATE SET
          current_batch_index = excluded.current_batch_index,
          total_batches = excluded.total_batches,
          batch_size = excluded.batch_size,
          processed_country_codes = excluded.processed_country_codes,
          pending_country_codes = excluded.pending_country_codes,
          completed_country_codes = excluded.completed_country_codes,
          failed_country_codes = excluded.failed_country_codes,
          last_batch_run_date = excluded.last_batch_run_date,
          is_executing = excluded.is_executing,
          total_discovered_programs = excluded.total_discovered_programs,
          available_verified_count = excluded.available_verified_count,
          not_available_confirmed_count = excluded.not_available_confirmed_count,
          awaiting_verification_count = excluded.awaiting_verification_count,
          needs_review_count = excluded.needs_review_count,
          temporarily_closed_count = excluded.temporarily_closed_count,
          expired_count = excluded.expired_count,
          last_scheduled_execution = excluded.last_scheduled_execution,
          last_actual_execution = excluded.last_actual_execution,
          execution_start_timestamp = excluded.execution_start_timestamp,
          execution_end_timestamp = excluded.execution_end_timestamp,
          success_status = excluded.success_status,
          batch_completion_status = excluded.batch_completion_status,
          next_scheduled_execution = excluded.next_scheduled_execution,
          retry_count = excluded.retry_count,
          max_retries = excluded.max_retries,
          auto_resume_on_missed = excluded.auto_resume_on_missed,
          last_error = excluded.last_error,
          audit_logs_json = excluded.audit_logs_json,
          updated_at = excluded.updated_at
      `);

      const safeLastError = state.retryAndMissedRunHandling?.lastError
        ? redactSensitiveData(String(state.retryAndMissedRunHandling.lastError))
        : null;

      stmt.run(
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
        safeLastError,
        JSON.stringify(redactSensitiveData(state.auditLogs || [])),
        nowStr
      );
    });
    tx();
  }

  function saveChangelogEntryToDb(entry: any) {
    const tx = targetDb.transaction(() => {
      const stmt = targetDb.prepare(`
        INSERT INTO changelog_entries (
          id, date, country_code, country_name, change_type, title,
          old_value, new_value, source_url, auto_blog_slug, email_notified, verified_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          date = excluded.date,
          change_type = excluded.change_type,
          title = excluded.title,
          old_value = excluded.old_value,
          new_value = excluded.new_value,
          source_url = excluded.source_url,
          auto_blog_slug = excluded.auto_blog_slug,
          email_notified = excluded.email_notified,
          verified_by = excluded.verified_by
      `);

      stmt.run(
        entry.id,
        entry.date,
        entry.countryCode,
        entry.countryName,
        entry.changeType,
        entry.title,
        entry.oldValue,
        entry.newValue,
        entry.sourceUrl,
        entry.autoBlogSlug,
        redactSensitiveData(String(entry.emailNotified || '')),
        entry.verifiedBy,
        new Date().toISOString()
      );
    });
    tx();
  }

  function getChangelogFromDb(): any[] {
    try {
      const rows = targetDb.prepare('SELECT * FROM changelog_entries ORDER BY date DESC, created_at DESC').all() as any[];
      return rows.map((r) => ({
        id: r.id,
        date: r.date,
        countryCode: r.country_code,
        countryName: r.country_name,
        changeType: r.change_type,
        title: r.title,
        oldValue: r.old_value,
        newValue: r.new_value,
        sourceUrl: r.source_url,
        autoBlogSlug: r.auto_blog_slug,
        emailNotified: r.email_notified,
        verifiedBy: r.verified_by
      }));
    } catch {
      return [];
    }
  }

  function logCronExecutionToDb(log: {
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
  }) {
    const id = log.id || `cron-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const nowStr = new Date().toISOString();
    const safeMsg = redactSensitiveData(String(log.logMessage || ''));
    const tx = targetDb.transaction(() => {
      targetDb
        .prepare(
          `
          INSERT INTO cron_execution_logs (
            id, timestamp, cron_name, http_method, target_countries, status,
            checked_count, updates_found, log_message, execution_duration_ms, missed_run_resumed, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        )
        .run(
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
        );
    });
    tx();

    recordOperationalEvent(
      {
        category: 'CRON_EXECUTION',
        severity:
          log.status.includes('ERROR') || log.status.includes('FAILED') || log.status === 'CONFIG_ERROR'
            ? 'ERROR'
            : 'INFO',
        component: `cron:${log.cronName}`,
        message: `[${log.status}] ${safeMsg}`,
        details: {
          runId: id,
          status: log.status,
          checkedCount: log.checkedCount,
          updatesFound: log.updatesFound,
          executionDurationMs: log.executionDurationMs
        }
      },
      eventSink
    );
    return id;
  }

  function getCronExecutionLogsFromDb(limit: number = 20): any[] {
    try {
      const rows = targetDb.prepare('SELECT * FROM cron_execution_logs ORDER BY timestamp DESC LIMIT ?').all(limit) as any[];
      return rows.map((r) => ({
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
    } catch {
      return [];
    }
  }

  function getVisaDetails(programId: string): any | null {
    try {
      const row = targetDb.prepare('SELECT * FROM visa_details WHERE program_id = ?').get(programId) as any;
      if (!row) return null;
      return mapSqliteVisaDetailRow(row);
    } catch {
      return null;
    }
  }

  function getAllVisaDetails(): any[] {
    try {
      const rows = targetDb.prepare('SELECT * FROM visa_details ORDER BY id').all() as any[];
      return rows.map((row) => mapSqliteVisaDetailRow(row));
    } catch {
      return [];
    }
  }

  function getPaginatedVisaDetails(
    page: number,
    limit: number,
    search: string = '',
    status: string = '',
    _category: string = ''
  ): { data: any[]; total: number } {
    try {
      const offset = (page - 1) * limit;
      const filters = [];
      const params: any[] = [];

      if (search) {
        filters.push('(id LIKE ? OR program_id LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }
      if (status) {
        filters.push('verification_status = ?');
        params.push(status);
      }

      const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
      const totalRow = targetDb.prepare(`SELECT COUNT(*) as count FROM visa_details ${whereClause}`).get(...params) as any;
      const rows = targetDb
        .prepare(`SELECT * FROM visa_details ${whereClause} ORDER BY id LIMIT ? OFFSET ?`)
        .all(...params, limit, offset) as any[];

      return {
        total: totalRow.count,
        data: rows.map((row) => mapSqliteVisaDetailRow(row))
      };
    } catch {
      return { data: [], total: 0 };
    }
  }

  function saveVisaDetails(details: any) {
    const tx = targetDb.transaction(() => {
      const lastUpdated = details.lastUpdated || new Date().toISOString();
      const verificationStatus = details.verificationStatus || 'VERIFIED';
      const normalizedComp = normalizeVisaDetailTo30Sections({
        ...details,
        lastUpdated,
        verificationStatus
      });

      const recordId =
        details.id && (!details.id.startsWith('vd-') || details.id === `vd-${details.programId}`)
          ? details.id
          : `vd-${details.programId}`;

      targetDb
        .prepare(
          `
          INSERT INTO visa_details (
            id, program_id, country_overview_json, visa_overview_json, eligibility_json,
            financial_json, document_checklist_json, application_fields_json,
            application_steps_json, interview_prep_json, embassy_directory_json,
            refusal_appeal_json, after_approval_json, cost_calculator_json,
            faq_json, legal_evidence_json, comprehensive_sections_json, last_updated, verification_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            country_overview_json = excluded.country_overview_json,
            visa_overview_json = excluded.visa_overview_json,
            eligibility_json = excluded.eligibility_json,
            financial_json = excluded.financial_json,
            document_checklist_json = excluded.document_checklist_json,
            application_fields_json = excluded.application_fields_json,
            application_steps_json = excluded.application_steps_json,
            interview_prep_json = excluded.interview_prep_json,
            embassy_directory_json = excluded.embassy_directory_json,
            refusal_appeal_json = excluded.refusal_appeal_json,
            after_approval_json = excluded.after_approval_json,
            cost_calculator_json = excluded.cost_calculator_json,
            faq_json = excluded.faq_json,
            legal_evidence_json = excluded.legal_evidence_json,
            comprehensive_sections_json = excluded.comprehensive_sections_json,
            last_updated = excluded.last_updated,
            verification_status = excluded.verification_status
        `
        )
        .run(
          recordId,
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
        );
    });
    tx();
  }

  function getDashboardStats() {
    try {
      const stats = targetDb
        .prepare(
          `
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN verification_status = 'DRAFT' THEN 1 ELSE 0 END) as draft,
            SUM(CASE WHEN verification_status = 'NEEDS_EVIDENCE' THEN 1 ELSE 0 END) as needs_evidence,
            SUM(CASE WHEN verification_status = 'UNDER_REVIEW' THEN 1 ELSE 0 END) as under_review,
            SUM(CASE WHEN verification_status = 'VERIFIED' THEN 1 ELSE 0 END) as verified,
            SUM(CASE WHEN verification_status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN verification_status = 'PUBLISHED' THEN 1 ELSE 0 END) as published,
            SUM(CASE WHEN verification_status = 'UPDATE_REQUIRED' THEN 1 ELSE 0 END) as update_required,
            SUM(CASE WHEN verification_status = 'EXPIRED' THEN 1 ELSE 0 END) as expired,
            SUM(CASE WHEN verification_status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
            SUM(CASE WHEN verification_status = 'QUARANTINED' THEN 1 ELSE 0 END) as quarantined
        FROM visa_details;
      `
        )
        .get() as any;

      const claimsStats = targetDb
        .prepare(
          `
        SELECT
          COUNT(DISTINCT c.id) as totalClaims,
          SUM(CASE WHEN e.id IS NULL THEN 1 ELSE 0 END) as claimsWithoutEvidence
        FROM visa_detail_claims c
        LEFT JOIN visa_detail_evidence e ON c.id = e.claim_id
      `
        )
        .get() as any;

      return { ...stats, ...claimsStats };
    } catch {
      return null;
    }
  }

  function updateVisaStatus(programId: string, status: string) {
    targetDb.prepare('UPDATE visa_details SET verification_status = ? WHERE program_id = ?').run(status, programId);
  }

  function getVisaClaims(programId: string): any[] {
    const rows = targetDb
      .prepare('SELECT * FROM visa_detail_claims WHERE program_id = ? ORDER BY section ASC, description ASC')
      .all(programId) as any[];
    return rows.map((r) => ({
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
      visaCategory: r.visa_category || ''
    }));
  }

  function getVisaEvidence(claimId: string): any[] {
    const rows = targetDb.prepare('SELECT * FROM visa_detail_evidence WHERE claim_id = ?').all(claimId) as any[];
    return rows.map((r) => ({
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
    }));
  }

  function getVisaClaimsWithEvidence(programId: string, targetNationality?: string): any[] {
    const claims = getVisaClaims(programId);
    let progRow: any = null;
    try {
      progRow = targetDb.prepare('SELECT country_code, category FROM immigration_programs WHERE id = ?').get(programId) as any;
    } catch {
      progRow = null;
    }

    return claims.map((c) => {
      const evidence = getVisaEvidence(c.id);
      const claimWithEv = { ...c, evidence };
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

  function getVisaClaimById(claimId: string): any | null {
    const r = targetDb.prepare('SELECT * FROM visa_detail_claims WHERE id = ?').get(claimId) as any;
    if (!r) return null;
    return {
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
      visaCategory: r.visa_category || ''
    };
  }

  function getVisaVersions(programId: string): any[] {
    const rows = targetDb
      .prepare('SELECT * FROM visa_detail_versions WHERE program_id = ? ORDER BY timestamp DESC')
      .all(programId) as any[];
    return rows.map((r) => ({
      id: r.id,
      programId: r.program_id,
      data: JSON.parse(r.data_json || '{}'),
      editorId: r.editor_id,
      timestamp: r.timestamp,
      changeReason: r.change_reason
    }));
  }

  function saveVisaVersion(version: any) {
    targetDb
      .prepare(
        `
      INSERT INTO visa_detail_versions (id, program_id, data_json, editor_id, timestamp, change_reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        version.id,
        version.programId,
        JSON.stringify(version.data),
        version.editorId,
        version.timestamp,
        version.changeReason
      );
  }

  function reconcileClaimVerificationAfterEvidenceChange(
    claimId: string,
    reasonTrigger: string
  ): {
    downgraded: boolean;
    previousStatus?: string;
    newStatus?: string;
    claimId: string;
    programId?: string;
    versionId?: string;
  } {
    const claimRow = targetDb.prepare('SELECT * FROM visa_detail_claims WHERE id = ?').get(claimId) as any;
    if (!claimRow) return { downgraded: false, claimId };

    const currentEv = getVisaEvidence(claimId);
    const integrity = evaluateClaimIntegrity({ ...claimRow, evidence: currentEv });

    if (claimRow.status === 'VERIFIED' && !integrity.hasQualifyingOfficialEvidence) {
      const tx = targetDb.transaction(() => {
        const nowIso = new Date().toISOString();
        targetDb
          .prepare('UPDATE visa_detail_claims SET status = ?, review_timestamp = ? WHERE id = ?')
          .run('NEEDS_EVIDENCE', nowIso, claimId);

        const programId = claimRow.program_id;
        const details = getVisaDetails(programId);
        const claimsSnapshot = getVisaClaimsWithEvidence(programId);
        const versionId = `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        saveVisaVersion({
          id: versionId,
          programId,
          data: { details, claims: claimsSnapshot },
          editorId: 'system-integrity-guard',
          timestamp: nowIso,
          changeReason: `Auto-downgraded claim ${claimId} from VERIFIED to NEEDS_EVIDENCE (${reasonTrigger})`
        });

        return {
          downgraded: true,
          previousStatus: 'VERIFIED',
          newStatus: 'NEEDS_EVIDENCE',
          claimId,
          programId,
          versionId
        };
      });

      return tx();
    }

    return {
      downgraded: false,
      previousStatus: claimRow.status,
      newStatus: claimRow.status,
      claimId,
      programId: claimRow.program_id
    };
  }

  function saveVisaClaim(claim: any) {
    const rawClassification = claim.requirementClassification || claim.requirement_classification;
    const requirementClassification: RequirementClassification = isValidRequirementClassification(rawClassification)
      ? rawClassification
      : 'ADMIN_INSTRUCTION';
    const applicableNationality =
      String(claim.applicableNationality || claim.applicable_nationality || 'ALL').trim() || 'ALL';
    const countryIso = String(claim.countryIso ?? claim.country_iso ?? '').trim();
    const visaCategory = String(claim.visaCategory ?? claim.visa_category ?? '').trim();

    targetDb
      .prepare(
        `
      INSERT INTO visa_detail_claims (
        id, program_id, section, description, value, unit, status, reviewer, review_timestamp,
        requirement_classification, applicable_nationality, country_iso, visa_category
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        section = excluded.section,
        description = excluded.description,
        value = excluded.value,
        unit = excluded.unit,
        status = excluded.status,
        reviewer = excluded.reviewer,
        review_timestamp = excluded.review_timestamp,
        requirement_classification = excluded.requirement_classification,
        applicable_nationality = excluded.applicable_nationality,
        country_iso = excluded.country_iso,
        visa_category = excluded.visa_category
    `
      )
      .run(
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
      );
  }

  function deleteVisaClaim(claimId: string) {
    const tx = targetDb.transaction(() => {
      targetDb.prepare('DELETE FROM visa_detail_evidence WHERE claim_id = ?').run(claimId);
      targetDb.prepare('DELETE FROM visa_detail_claims WHERE id = ?').run(claimId);
    });
    tx();
  }

  function saveVisaEvidence(
    evidence: any,
    options?: { skipReconcile?: boolean }
  ): { downgradedClaim?: boolean; newClaimStatus?: string; versionId?: string } {
    const tx = targetDb.transaction(() => {
      const normalizedStatus = normalizeEvidenceStatus(evidence.status);
      const claimId = evidence.claimId || evidence.claim_id;
      targetDb
        .prepare(
          `
        INSERT INTO visa_detail_evidence (
          id, claim_id, source_url, legal_instrument, effective_date, last_checked_date,
          source_title, issuing_authority, publication_date, access_date, reviewer_notes, excerpt, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          source_url = excluded.source_url,
          legal_instrument = excluded.legal_instrument,
          effective_date = excluded.effective_date,
          last_checked_date = excluded.last_checked_date,
          source_title = excluded.source_title,
          issuing_authority = excluded.issuing_authority,
          publication_date = excluded.publication_date,
          access_date = excluded.access_date,
          reviewer_notes = excluded.reviewer_notes,
          excerpt = excluded.excerpt,
          status = excluded.status
      `
        )
        .run(
          evidence.id,
          claimId,
          evidence.sourceUrl || evidence.source_url || '',
          evidence.legalInstrument || evidence.legal_instrument || '',
          evidence.effectiveDate || evidence.effective_date || '',
          evidence.lastCheckedDate || evidence.last_checked_date || new Date().toISOString().split('T')[0],
          evidence.sourceTitle || evidence.source_title || '',
          evidence.issuingAuthority || evidence.issuing_authority || '',
          evidence.publicationDate || evidence.publication_date || '',
          evidence.accessDate ||
            evidence.access_date ||
            evidence.lastCheckedDate ||
            evidence.last_checked_date ||
            new Date().toISOString().split('T')[0],
          evidence.reviewerNotes || evidence.reviewer_notes || '',
          evidence.excerpt || '',
          normalizedStatus
        );

      if (!options?.skipReconcile && claimId) {
        const rec = reconcileClaimVerificationAfterEvidenceChange(
          claimId,
          `Evidence ${evidence.id} status set to ${normalizedStatus}`
        );
        return {
          downgradedClaim: rec.downgraded,
          newClaimStatus: rec.newStatus,
          versionId: rec.versionId
        };
      }
      return {};
    });
    return tx();
  }

  function deleteVisaEvidence(evidenceId: string): {
    downgradedClaim?: boolean;
    newClaimStatus?: string;
    claimId?: string;
    versionId?: string;
  } {
    const tx = targetDb.transaction(() => {
      const evRow = targetDb.prepare('SELECT claim_id FROM visa_detail_evidence WHERE id = ?').get(evidenceId) as any;
      targetDb.prepare('DELETE FROM visa_detail_evidence WHERE id = ?').run(evidenceId);
      if (evRow?.claim_id) {
        const rec = reconcileClaimVerificationAfterEvidenceChange(evRow.claim_id, `Evidence ${evidenceId} deleted`);
        return {
          downgradedClaim: rec.downgraded,
          newClaimStatus: rec.newStatus,
          claimId: evRow.claim_id,
          versionId: rec.versionId
        };
      }
      return {};
    });
    return tx();
  }

  function restoreVersion(versionId: string, editorId: string = 'admin') {
    const tx = targetDb.transaction(() => {
      const version = targetDb.prepare('SELECT * FROM visa_detail_versions WHERE id = ?').get(versionId) as any;
      if (!version) throw new Error('Version not found');

      const parsed = JSON.parse(version.data_json);
      const details = parsed.details || parsed;
      const programId = version.program_id;

      saveVisaDetails({ ...details, programId });

      if (Array.isArray(parsed.claims)) {
        const existingClaims = targetDb
          .prepare('SELECT id FROM visa_detail_claims WHERE program_id = ?')
          .all(programId) as any[];
        for (const ec of existingClaims) {
          targetDb.prepare('DELETE FROM visa_detail_evidence WHERE claim_id = ?').run(ec.id);
        }
        targetDb.prepare('DELETE FROM visa_detail_claims WHERE program_id = ?').run(programId);

        for (const c of parsed.claims) {
          saveVisaClaim({ ...c, programId });
          if (Array.isArray(c.evidence)) {
            for (const ev of c.evidence) {
              saveVisaEvidence({ ...ev, claimId: c.id }, { skipReconcile: true });
            }
          }
        }
      }

      const newVersionId = `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      saveVisaVersion({
        id: newVersionId,
        programId,
        data: parsed,
        editorId,
        timestamp: new Date().toISOString(),
        changeReason: `Restored from version ${versionId} (${version.change_reason || 'Previous state'})`
      });

      return { success: true, restoredVersionId: versionId, newVersionId };
    });

    return tx();
  }

  // --- Phase 4.4 Durable Job Locks, Checkpoints, Dead-Letter Quarantine, and Telemetry ---

  function acquireJobLock(
    lockKey: string,
    ownerId: string,
    ttlMs: number = 5 * 60 * 1000,
    metadata: Record<string, unknown> = {}
  ): { acquired: boolean; existingOwner?: string; expiresAt?: string } {
    const tx = targetDb.transaction(() => {
      const now = Date.now();
      const nowIso = new Date(now).toISOString();
      const expiresIso = new Date(now + Math.max(1000, ttlMs)).toISOString();

      // Remove expired stale locks safely inside transaction
      targetDb.prepare('DELETE FROM automation_job_locks WHERE lock_key = ? AND expires_at <= ?').run(lockKey, nowIso);

      const existing = targetDb
        .prepare('SELECT owner_id, expires_at FROM automation_job_locks WHERE lock_key = ?')
        .get(lockKey) as { owner_id: string; expires_at: string } | undefined;

      if (existing && existing.owner_id !== ownerId) {
        return {
          acquired: false,
          existingOwner: existing.owner_id,
          expiresAt: existing.expires_at
        };
      }

      targetDb
        .prepare(
          `INSERT INTO automation_job_locks (lock_key, owner_id, acquired_at, expires_at, metadata_json)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(lock_key) DO UPDATE SET
             owner_id = excluded.owner_id,
             acquired_at = excluded.acquired_at,
             expires_at = excluded.expires_at,
             metadata_json = excluded.metadata_json`
        )
        .run(lockKey, ownerId, nowIso, expiresIso, JSON.stringify(redactSensitiveData(metadata)));

      return { acquired: true, expiresAt: expiresIso };
    });
    return tx();
  }

  function releaseJobLock(lockKey: string, ownerId: string): boolean {
    const res = targetDb
      .prepare('DELETE FROM automation_job_locks WHERE lock_key = ? AND owner_id = ?')
      .run(lockKey, ownerId);
    return res.changes > 0;
  }

  function saveAutomationCheckpoint(cp: {
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
  }): void {
    targetDb
      .prepare(
        `INSERT INTO automation_checkpoints (
           checkpoint_id, job_name, run_id, status, cursor_index, total_items,
           completed_keys_json, failed_keys_json, idempotency_keys_json, state_json, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(checkpoint_id) DO UPDATE SET
           run_id = excluded.run_id,
           status = excluded.status,
           cursor_index = excluded.cursor_index,
           total_items = excluded.total_items,
           completed_keys_json = excluded.completed_keys_json,
           failed_keys_json = excluded.failed_keys_json,
           idempotency_keys_json = excluded.idempotency_keys_json,
           state_json = excluded.state_json,
           updated_at = excluded.updated_at`
      )
      .run(
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
      );
  }

  function getAutomationCheckpoint(checkpointId: string): {
    checkpointId: string;
    jobName: string;
    runId: string;
    status: string;
    cursorIndex: number;
    totalItems: number;
    completedKeys: string[];
    failedKeys: string[];
    idempotencyKeys: string[];
    state: Record<string, unknown>;
    updatedAt: string;
  } | null {
    const row = targetDb
      .prepare('SELECT * FROM automation_checkpoints WHERE checkpoint_id = ?')
      .get(checkpointId) as any;
    if (!row) return null;
    return {
      checkpointId: row.checkpoint_id,
      jobName: row.job_name,
      runId: row.run_id,
      status: row.status,
      cursorIndex: row.cursor_index,
      totalItems: row.total_items,
      completedKeys: JSON.parse(row.completed_keys_json || '[]'),
      failedKeys: JSON.parse(row.failed_keys_json || '[]'),
      idempotencyKeys: JSON.parse(row.idempotency_keys_json || '[]'),
      state: JSON.parse(row.state_json || '{}'),
      updatedAt: row.updated_at
    };
  }

  function recordDeadLetterItem(item: {
    id?: string;
    jobName: string;
    runId: string;
    targetKey: string;
    failureClass: string;
    errorMessage: string;
    payload?: Record<string, unknown>;
    retryCount?: number;
    status?: string;
  }): string {
    const id = item.id || `dlq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const safeError = redactSensitiveData(String(item.errorMessage || 'Unknown failure'));
    targetDb
      .prepare(
        `INSERT INTO automation_dead_letter (
           id, job_name, run_id, target_key, failure_class, error_message, payload_json, retry_count, status, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           failure_class = excluded.failure_class,
           error_message = excluded.error_message,
           retry_count = excluded.retry_count,
           status = excluded.status`
      )
      .run(
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
      );

    recordOperationalEvent(
      {
        category: 'QUARANTINED_RECORD',
        severity: 'WARN',
        component: item.jobName,
        message: `Quarantined ${item.targetKey} (${item.failureClass}): ${safeError}`,
        details: { id, runId: item.runId, targetKey: item.targetKey, failureClass: item.failureClass }
      },
      eventSink
    );
    return id;
  }

  function getDeadLetterItems(status?: string): any[] {
    const rows = status
      ? (targetDb
          .prepare('SELECT * FROM automation_dead_letter WHERE status = ? ORDER BY created_at DESC')
          .all(status) as any[])
      : (targetDb.prepare('SELECT * FROM automation_dead_letter ORDER BY created_at DESC').all() as any[]);
    return rows.map((r) => ({
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

  function getOperationalEvents(limit: number = 50): OperationalEvent[] {
    try {
      const rows = targetDb
        .prepare('SELECT * FROM operational_events ORDER BY timestamp DESC LIMIT ?')
        .all(limit) as any[];
      return rows.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        category: r.category,
        severity: r.severity,
        component: r.component,
        message: r.message,
        details: JSON.parse(r.details_json || '{}')
      }));
    } catch {
      return [];
    }
  }

  return {
    db: targetDb,
    eventSink,
    getBatchStateFromDb,
    saveBatchStateToDb,
    saveChangelogEntryToDb,
    getChangelogFromDb,
    logCronExecutionToDb,
    getCronExecutionLogsFromDb,
    getVisaDetails,
    getAllVisaDetails,
    getPaginatedVisaDetails,
    saveVisaDetails,
    getDashboardStats,
    updateVisaStatus,
    restoreVersion,
    getVisaClaims,
    getVisaClaimsWithEvidence,
    getVisaClaimById,
    reconcileClaimVerificationAfterEvidenceChange,
    saveVisaClaim,
    deleteVisaClaim,
    getVisaEvidence,
    saveVisaEvidence,
    deleteVisaEvidence,
    getVisaVersions,
    saveVisaVersion,
    acquireJobLock,
    releaseJobLock,
    saveAutomationCheckpoint,
    getAutomationCheckpoint,
    recordDeadLetterItem,
    getDeadLetterItems,
    getOperationalEvents,
    auditIntegrity: () => auditSqliteDatabaseIntegrity(targetDb),
    runMigrations: () => runTrackedSqliteMigrations(targetDb)
  };
}
