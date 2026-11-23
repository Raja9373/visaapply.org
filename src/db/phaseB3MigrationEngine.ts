import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import matter from 'gray-matter';
import {
  POSTGRES_MIGRATIONS,
  PostgresImmigrationRepository,
  createPostgresExecutor,
  type PgExecutor
} from './postgresDatabase';
import { auditSqliteDatabaseIntegrity, closeSqliteDatabase } from './sqliteCore';
import {
  EXPECTED_CORE_SQLITE_TABLES,
  EXPECTED_SQLITE_MIGRATION_VERSIONS,
  type BackupManifest,
  canonicalizeJsonValue,
  checkSqliteDuplicatePrimaryKeys,
  computeCanonicalRowsDigest,
  detectDeletedPhase32FixturesInSqlite,
  isPhase32DeletedFixtureId,
  sha256File,
  sha256Text
} from '../utils/backupManager';
import { redactSensitiveData } from '../utils/operationalObservability';

export const SQLITE_TO_PG_IMPORT_ORDER = [
  'immigration_programs',
  'visa_details',
  'visa_detail_claims',
  'visa_detail_evidence',
  'visa_detail_versions',
  'batch_state',
  'changelog_entries',
  'cron_execution_logs',
  'automation_job_locks',
  'automation_checkpoints',
  'automation_dead_letter',
  'operational_events'
] as const;

export type SqliteDataTableName = (typeof SQLITE_TO_PG_IMPORT_ORDER)[number];

export interface TableMappingSpec {
  table: string;
  primaryKey: string;
  columns: readonly string[];
  jsonColumns: readonly string[];
  foreignKeys: ReadonlyArray<{ column: string; referencesTable: string; referencesColumn: string }>;
  uniqueConstraints?: readonly string[];
}

export const TABLE_MAPPING_SPECS: Record<SqliteDataTableName, TableMappingSpec> = {
  immigration_programs: {
    table: 'immigration_programs',
    primaryKey: 'id',
    columns: [
      'id',
      'country_code',
      'category',
      'official_name',
      'local_language_name',
      'legal_basis',
      'classification_type',
      'eligibility',
      'nationality_restrictions',
      'age_requirements',
      'education_requirements',
      'work_experience_requirements',
      'min_salary_or_income',
      'investment_requirement',
      'required_funds_and_proof',
      'residency_duration',
      'renewal_rules',
      'pr_or_citizenship_transition',
      'family_inclusion_rules',
      'work_and_study_rights',
      'restrictions_and_exceptions',
      'required_documents_json',
      'documents_and_formats',
      'translation_attestation_requirements',
      'application_procedure',
      'government_fees',
      'processing_time',
      'apply_from',
      'official_application_url',
      'official_information_url',
      'source_authority',
      'source_last_updated',
      'last_checked_date',
      'verification_evidence',
      'verification_status',
      'updated_at'
    ],
    jsonColumns: ['required_documents_json'],
    foreignKeys: []
  },
  visa_details: {
    table: 'visa_details',
    primaryKey: 'id',
    columns: [
      'id',
      'program_id',
      'country_overview_json',
      'visa_overview_json',
      'eligibility_json',
      'financial_json',
      'document_checklist_json',
      'application_fields_json',
      'application_steps_json',
      'interview_prep_json',
      'embassy_directory_json',
      'refusal_appeal_json',
      'after_approval_json',
      'cost_calculator_json',
      'faq_json',
      'legal_evidence_json',
      'comprehensive_sections_json',
      'last_updated',
      'verification_status'
    ],
    jsonColumns: [
      'country_overview_json',
      'visa_overview_json',
      'eligibility_json',
      'financial_json',
      'document_checklist_json',
      'application_fields_json',
      'application_steps_json',
      'interview_prep_json',
      'embassy_directory_json',
      'refusal_appeal_json',
      'after_approval_json',
      'cost_calculator_json',
      'faq_json',
      'legal_evidence_json',
      'comprehensive_sections_json'
    ],
    foreignKeys: [{ column: 'program_id', referencesTable: 'immigration_programs', referencesColumn: 'id' }],
    uniqueConstraints: ['program_id']
  },
  visa_detail_claims: {
    table: 'visa_detail_claims',
    primaryKey: 'id',
    columns: [
      'id',
      'program_id',
      'section',
      'description',
      'value',
      'unit',
      'status',
      'reviewer',
      'review_timestamp',
      'requirement_classification',
      'applicable_nationality',
      'country_iso',
      'visa_category'
    ],
    jsonColumns: [],
    foreignKeys: [{ column: 'program_id', referencesTable: 'immigration_programs', referencesColumn: 'id' }]
  },
  visa_detail_evidence: {
    table: 'visa_detail_evidence',
    primaryKey: 'id',
    columns: [
      'id',
      'claim_id',
      'source_url',
      'legal_instrument',
      'effective_date',
      'last_checked_date',
      'source_title',
      'issuing_authority',
      'publication_date',
      'access_date',
      'reviewer_notes',
      'excerpt',
      'status'
    ],
    jsonColumns: [],
    foreignKeys: [{ column: 'claim_id', referencesTable: 'visa_detail_claims', referencesColumn: 'id' }]
  },
  visa_detail_versions: {
    table: 'visa_detail_versions',
    primaryKey: 'id',
    columns: ['id', 'program_id', 'data_json', 'editor_id', 'timestamp', 'change_reason'],
    jsonColumns: ['data_json'],
    foreignKeys: [{ column: 'program_id', referencesTable: 'immigration_programs', referencesColumn: 'id' }]
  },
  batch_state: {
    table: 'batch_state',
    primaryKey: 'id',
    columns: [
      'id',
      'current_batch_index',
      'total_batches',
      'batch_size',
      'processed_country_codes',
      'pending_country_codes',
      'completed_country_codes',
      'failed_country_codes',
      'last_batch_run_date',
      'is_executing',
      'total_discovered_programs',
      'available_verified_count',
      'not_available_confirmed_count',
      'awaiting_verification_count',
      'needs_review_count',
      'temporarily_closed_count',
      'expired_count',
      'last_scheduled_execution',
      'last_actual_execution',
      'execution_start_timestamp',
      'execution_end_timestamp',
      'success_status',
      'batch_completion_status',
      'next_scheduled_execution',
      'retry_count',
      'max_retries',
      'auto_resume_on_missed',
      'last_error',
      'audit_logs_json',
      'updated_at'
    ],
    jsonColumns: [
      'processed_country_codes',
      'pending_country_codes',
      'completed_country_codes',
      'failed_country_codes',
      'audit_logs_json'
    ],
    foreignKeys: []
  },
  changelog_entries: {
    table: 'changelog_entries',
    primaryKey: 'id',
    columns: [
      'id',
      'date',
      'country_code',
      'country_name',
      'change_type',
      'title',
      'old_value',
      'new_value',
      'source_url',
      'auto_blog_slug',
      'email_notified',
      'verified_by',
      'created_at'
    ],
    jsonColumns: [],
    foreignKeys: []
  },
  cron_execution_logs: {
    table: 'cron_execution_logs',
    primaryKey: 'id',
    columns: [
      'id',
      'timestamp',
      'cron_name',
      'http_method',
      'target_countries',
      'status',
      'checked_count',
      'updates_found',
      'log_message',
      'execution_duration_ms',
      'missed_run_resumed',
      'created_at'
    ],
    jsonColumns: ['target_countries'],
    foreignKeys: []
  },
  automation_job_locks: {
    table: 'automation_job_locks',
    primaryKey: 'lock_key',
    columns: ['lock_key', 'owner_id', 'acquired_at', 'expires_at', 'metadata_json'],
    jsonColumns: ['metadata_json'],
    foreignKeys: []
  },
  automation_checkpoints: {
    table: 'automation_checkpoints',
    primaryKey: 'checkpoint_id',
    columns: [
      'checkpoint_id',
      'job_name',
      'run_id',
      'status',
      'cursor_index',
      'total_items',
      'completed_keys_json',
      'failed_keys_json',
      'idempotency_keys_json',
      'state_json',
      'updated_at'
    ],
    jsonColumns: ['completed_keys_json', 'failed_keys_json', 'idempotency_keys_json', 'state_json'],
    foreignKeys: []
  },
  automation_dead_letter: {
    table: 'automation_dead_letter',
    primaryKey: 'id',
    columns: [
      'id',
      'job_name',
      'run_id',
      'target_key',
      'failure_class',
      'error_message',
      'payload_json',
      'retry_count',
      'status',
      'created_at',
      'resolved_at'
    ],
    jsonColumns: ['payload_json'],
    foreignKeys: []
  },
  operational_events: {
    table: 'operational_events',
    primaryKey: 'id',
    columns: ['id', 'timestamp', 'category', 'severity', 'component', 'message', 'details_json'],
    jsonColumns: ['details_json'],
    foreignKeys: []
  }
};

export const MIGRATION_004_TARGET_SPECS: Record<string, { primaryKey: string; columns: readonly string[] }> = {
  slot_embassy_status: {
    primaryKey: 'embassy_key',
    columns: [
      'embassy_key',
      'country',
      'city',
      'status',
      'earliest_date',
      'booking_link',
      'last_checked_at',
      'updated_at'
    ]
  },
  slot_subscribers: {
    primaryKey: 'id',
    columns: [
      'id',
      'email',
      'country',
      'city',
      'visa_type',
      'language',
      'subscribed_at',
      'last_notified_at',
      'is_active'
    ]
  },
  editorial_articles: {
    primaryKey: 'slug',
    columns: [
      'slug',
      'status',
      'title',
      'frontmatter_json',
      'markdown_body',
      'source_origin',
      'created_at',
      'updated_at',
      'published_at'
    ]
  }
};

export type PlanActionType = 'INSERT' | 'UPDATE' | 'SKIP_UNCHANGED' | 'CONFLICT' | 'SKIP_LEGACY_SUPERSEDED';

export interface PlannedRecordAction {
  primaryKeyValue: string;
  action: PlanActionType;
  reason?: string;
  sourceDigest: string;
}

export interface TableMigrationPlanSummary {
  table: string;
  sourceOrigin: string;
  importOrderIndex: number;
  primaryKeyColumn: string;
  sourceCount: number;
  insertCount: number;
  updateCount: number;
  skipUnchangedCount: number;
  conflictCount: number;
  sourceTableDigest: string;
  actions: PlannedRecordAction[];
}

export interface NonSqliteLoadedSources {
  changelogEntriesFromJson: Array<Record<string, unknown>>;
  slotEmbassyStatuses: Array<Record<string, unknown>>;
  slotSubscribers: Array<Record<string, unknown>>;
  editorialArticles: Array<Record<string, unknown>>;
  legacySyncState: {
    path: string;
    exists: boolean;
    validJson: boolean;
    parsed: Record<string, unknown> | null;
    sha256: string;
  };
  markdownDigests: Record<string, string>;
}

export interface VerifiedBackupExtraction {
  manifest: BackupManifest;
  dbPath: string;
  projectFilesRoot: string;
  cleanup: () => void;
}

export interface MigrationPlanReport {
  mode: 'DRY_RUN' | 'VERIFY_ONLY' | 'MOCK_APPLIED';
  verificationLabel: 'MOCK_VERIFICATION';
  liveNeonConnected: false;
  dryRun: boolean;
  verifyOnly: boolean;
  executedAgainstMockDestination: boolean;
  sourceBackupVerified: boolean;
  backupName: string;
  backupCreatedAt: string;
  schemaMigrationsPolicy: {
    sqliteSchemaMigrationsCopied: false;
    postgresMigrationsAppliedCount: number;
    postgresMigrationVersions: string[];
  };
  columnMappingValidated: boolean;
  foreignKeyOrderValidated: boolean;
  legacySyncStateStatus: {
    path: string;
    status: 'LEGACY_SUPERSEDED';
    supersededBy: string[];
    action: 'skipped_legacy_superseded';
  };
  sourceInventorySummary: {
    sqliteTableCounts: Record<string, number>;
    changelogJsonCount: number;
    slotEmbassyCount: number;
    slotSubscriberCount: number;
    publishedMarkdownCount: number;
    draftMarkdownCount: number;
  };
  totals: {
    tablesPlanned: number;
    totalSourceRecords: number;
    inserts: number;
    updates: number;
    skippedUnchanged: number;
    conflicts: number;
  };
  planSha256: string;
  tables: TableMigrationPlanSummary[];
  errors: string[];
}

export interface MigrateOptions {
  sourcePath: string;
  manifestPath?: string;
  projectRoot?: string;
  dryRun?: boolean;
  verifyOnly?: boolean;
  execute?: boolean;
  applyToMock?: boolean;
  mockDestinationExecutor?: PgExecutor;
}

function assertNotForbiddenSource(sourcePath: string, productionDbPath: string): void {
  const resolved = path.resolve(sourcePath);
  const base = path.basename(resolved).toLowerCase();
  if (base === 'migration_export.json') {
    throw new Error(
      'UNAUTHORITATIVE_SOURCE_REJECTED: Root migration_export.json is outdated and forbidden as a migration source.'
    );
  }
  if (resolved === path.resolve(productionDbPath)) {
    throw new Error(
      'UNVERIFIED_SOURCE_REJECTED: Direct reads from live data_db/immigration_hub.db are forbidden. Pass a verified WAL-safe backup directory or archive.'
    );
  }
}

function assertNonNeonDestination(exec?: PgExecutor): void {
  if (!exec) return;
  if (exec.isNeonRemote || exec.backend === 'neon-postgres') {
    throw new Error(
      'LIVE_NEON_FORBIDDEN_IN_PHASE_B3: Phase B.3 migration engine refuses connections or writes to live Neon PostgreSQL. Use isolated mock/PGlite destination only.'
    );
  }
}

/**
 * Loads and cryptographically verifies a WAL-safe backup (archive, timestamped directory, or standalone DB + manifest).
 */
export function loadAndVerifyBackupSource(
  sourcePathInput: string,
  manifestPathInput?: string,
  projectRootOverride?: string
): VerifiedBackupExtraction {
  const prodDbPath = path.join(process.cwd(), 'data_db', 'immigration_hub.db');
  assertNotForbiddenSource(sourcePathInput, prodDbPath);

  const resolvedSource = path.resolve(sourcePathInput);
  if (!fs.existsSync(resolvedSource)) {
    throw new Error(`MISSING_SOURCE_FILE: Backup source does not exist: ${resolvedSource}`);
  }

  let tempExtractDir: string | null = null;
  let dbPath: string;
  let manifestPath: string;
  let projectFilesRoot: string;

  const stat = fs.statSync(resolvedSource);
  if (stat.isDirectory()) {
    const archiveCandidate = path.join(resolvedSource, 'visaapply_backup.tar.gz');
    const standaloneCandidate = path.join(resolvedSource, 'immigration_hub_standalone.db');
    const manifestCandidate = manifestPathInput
      ? path.resolve(manifestPathInput)
      : path.join(resolvedSource, 'backup_manifest.json');

    if (fs.existsSync(archiveCandidate)) {
      tempExtractDir = fs.mkdtempSync(path.join(os.tmpdir(), 'visaapply-b3-mig-src-'));
      execFileSync('tar', ['-xzf', archiveCandidate, '-C', tempExtractDir], { stdio: 'pipe' });
      manifestPath = manifestPathInput ? path.resolve(manifestPathInput) : path.join(tempExtractDir, 'backup_manifest.json');
      projectFilesRoot = projectRootOverride ? path.resolve(projectRootOverride) : tempExtractDir;
      dbPath = fs.existsSync(standaloneCandidate)
        ? standaloneCandidate
        : path.join(tempExtractDir, 'data_db', 'immigration_hub.db');
    } else if (fs.existsSync(standaloneCandidate) && fs.existsSync(manifestCandidate)) {
      manifestPath = manifestCandidate;
      dbPath = standaloneCandidate;
      projectFilesRoot = projectRootOverride ? path.resolve(projectRootOverride) : process.cwd();
    } else {
      throw new Error(
        `MISSING_BACKUP_ARTIFACTS: Backup directory ${resolvedSource} missing visaapply_backup.tar.gz or backup_manifest.json`
      );
    }
  } else if (resolvedSource.endsWith('.tar.gz')) {
    tempExtractDir = fs.mkdtempSync(path.join(os.tmpdir(), 'visaapply-b3-mig-src-'));
    execFileSync('tar', ['-xzf', resolvedSource, '-C', tempExtractDir], { stdio: 'pipe' });
    manifestPath = manifestPathInput
      ? path.resolve(manifestPathInput)
      : path.join(tempExtractDir, 'backup_manifest.json');
    dbPath = path.join(tempExtractDir, 'data_db', 'immigration_hub.db');
    projectFilesRoot = projectRootOverride ? path.resolve(projectRootOverride) : tempExtractDir;
  } else {
    if (!manifestPathInput) {
      throw new Error(
        'MANIFEST_REQUIRED: When specifying a standalone .db snapshot directly, --manifest <backup_manifest.json> is required.'
      );
    }
    manifestPath = path.resolve(manifestPathInput);
    dbPath = resolvedSource;
    projectFilesRoot = projectRootOverride ? path.resolve(projectRootOverride) : process.cwd();
  }

  const cleanup = () => {
    if (tempExtractDir) {
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
    }
  };

  try {
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`MISSING_MANIFEST: Backup manifest not found at ${manifestPath}`);
    }
    if (!fs.existsSync(dbPath)) {
      throw new Error(`MISSING_BACKUP_DB: Verified SQLite snapshot not found at ${dbPath}`);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as BackupManifest;
    if (!manifest?.databaseSnapshot?.included) {
      throw new Error('INVALID_MANIFEST: backup_manifest.json does not include a databaseSnapshot.');
    }

    const actualDbSha = sha256File(dbPath);
    if (actualDbSha !== manifest.databaseSnapshot.sha256) {
      throw new Error(
        `BACKUP_SHA256_MISMATCH: Database snapshot hash mismatch (expected ${manifest.databaseSnapshot.sha256}, actual ${actualDbSha})`
      );
    }

    const checkDb = new Database(dbPath, { readonly: true, fileMustExist: true });
    try {
      const audit = auditSqliteDatabaseIntegrity(checkDb);
      if (!audit.ok) {
        throw new Error(
          `BACKUP_INTEGRITY_FAILED: integrity=${audit.integrityCheck.join(',')}, fk=${audit.foreignKeyViolations}`
        );
      }
      for (const tbl of EXPECTED_CORE_SQLITE_TABLES) {
        if (typeof audit.tableCounts[tbl] !== 'number') {
          throw new Error(`MISSING_CORE_TABLE: Backup snapshot is missing expected table "${tbl}".`);
        }
      }
      const appliedSet = new Set(audit.migrationsApplied.map((m) => m.version));
      for (const v of EXPECTED_SQLITE_MIGRATION_VERSIONS) {
        if (!appliedSet.has(v)) {
          throw new Error(`MISSING_MIGRATION_VERSION: Backup snapshot is missing migration "${v}".`);
        }
      }
      const deletedFound = detectDeletedPhase32FixturesInSqlite(checkDb);
      if (deletedFound.length > 0) {
        throw new Error(`DELETED_FIXTURES_PRESENT: Phase 3.2 deleted fixtures found: ${deletedFound.join(', ')}`);
      }
      const dupPk = checkSqliteDuplicatePrimaryKeys(checkDb);
      if (dupPk.length > 0) {
        throw new Error(`DUPLICATE_PRIMARY_KEYS: ${dupPk.join(', ')}`);
      }
    } finally {
      closeSqliteDatabase(checkDb);
    }

    return { manifest, dbPath, projectFilesRoot, cleanup };
  } catch (err) {
    cleanup();
    throw err;
  }
}

export function loadNonSqlitePersistentSources(
  projectFilesRoot: string,
  options: { requireAllFiles?: boolean } = {}
): NonSqliteLoadedSources {
  const root = path.resolve(projectFilesRoot);
  const requireFiles = options.requireAllFiles !== false;

  // 1. src/data/immigrationChangelog.json
  const changelogPath = path.join(root, 'src', 'data', 'immigrationChangelog.json');
  if (!fs.existsSync(changelogPath)) {
    if (requireFiles) throw new Error(`MISSING_SOURCE_FILE: ${changelogPath}`);
  }
  let changelogEntriesFromJson: Array<Record<string, unknown>> = [];
  if (fs.existsSync(changelogPath)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(fs.readFileSync(changelogPath, 'utf-8'));
    } catch (err: any) {
      throw new Error(`INVALID_JSON_SOURCE (${changelogPath}): ${err?.message || 'parse error'}`);
    }
    if (!Array.isArray(parsed)) {
      throw new Error(`INVALID_JSON_SCHEMA (${changelogPath}): Expected JSON array.`);
    }
    changelogEntriesFromJson = parsed.map((item: any) => {
      if (!item?.id || !item?.date || !item?.countryCode) {
        throw new Error(`INVALID_CHANGELOG_RECORD: Missing required id/date/countryCode in immigrationChangelog.json`);
      }
      const fallbackCreated = `${String(item.date).slice(0, 10)}T00:00:00.000Z`;
      return {
        id: String(item.id),
        date: String(item.date),
        country_code: String(item.countryCode).toLowerCase(),
        country_name: String(item.countryName || ''),
        change_type: String(item.changeType || 'UPDATE'),
        title: String(item.title || ''),
        old_value: String(item.oldValue || ''),
        new_value: String(item.newValue || ''),
        source_url: String(item.sourceUrl || ''),
        auto_blog_slug: String(item.autoBlogSlug || ''),
        email_notified: String(item.emailNotified || ''),
        verified_by: String(item.verifiedBy || ''),
        created_at: String(item.createdAt || fallbackCreated)
      };
    });
  }

  // 2. content/slot_status.json
  const slotStatusPath = path.join(root, 'content', 'slot_status.json');
  if (!fs.existsSync(slotStatusPath)) {
    if (requireFiles) throw new Error(`MISSING_SOURCE_FILE: ${slotStatusPath}`);
  }
  const slotEmbassyStatuses: Array<Record<string, unknown>> = [];
  if (fs.existsSync(slotStatusPath)) {
    let parsed: any;
    try {
      parsed = JSON.parse(fs.readFileSync(slotStatusPath, 'utf-8'));
    } catch (err: any) {
      throw new Error(`INVALID_JSON_SOURCE (${slotStatusPath}): ${err?.message || 'parse error'}`);
    }
    if (!parsed || typeof parsed !== 'object' || !parsed.embassies || typeof parsed.embassies !== 'object') {
      throw new Error(`INVALID_JSON_SCHEMA (${slotStatusPath}): Expected { embassies: { ... } }.`);
    }
    const checkTs = String(parsed.lastCheckTime || '1970-01-01T00:00:00.000Z');
    for (const embassyKey of Object.keys(parsed.embassies).sort()) {
      const info = parsed.embassies[embassyKey] || {};
      const isUsa = embassyKey.toUpperCase().startsWith('USA ');
      const country = isUsa ? 'US' : embassyKey.replace(/^Schengen\s*-\s*/i, '').trim() || 'GLOBAL';
      const city = isUsa ? embassyKey.slice(4).trim() : '';
      const alertMs = typeof info.lastAlertTime === 'number' ? info.lastAlertTime : null;
      const checkedIso = alertMs !== null && Number.isFinite(alertMs) ? new Date(alertMs).toISOString() : checkTs;
      slotEmbassyStatuses.push({
        embassy_key: embassyKey,
        country,
        city,
        status: String(info.status || 'Closed'),
        earliest_date: info.lastSlotDate && info.lastSlotDate !== 'N/A' ? String(info.lastSlotDate) : null,
        booking_link: null,
        last_checked_at: checkedIso,
        updated_at: checkTs
      });
    }
  }

  // 3. content/slot_subscribers.json (PII kept out of all logs/reports)
  const subsPath = path.join(root, 'content', 'slot_subscribers.json');
  if (!fs.existsSync(subsPath)) {
    if (requireFiles) throw new Error(`MISSING_SOURCE_FILE: ${subsPath}`);
  }
  const slotSubscribers: Array<Record<string, unknown>> = [];
  if (fs.existsSync(subsPath)) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(fs.readFileSync(subsPath, 'utf-8'));
    } catch (err: any) {
      throw new Error(`INVALID_JSON_SOURCE (${subsPath}): ${err?.message || 'parse error'}`);
    }
    if (!Array.isArray(parsed)) {
      throw new Error(`INVALID_JSON_SCHEMA (${subsPath}): Expected JSON array.`);
    }
    for (const item of parsed as any[]) {
      const email = String(item?.email || '').trim().toLowerCase();
      if (!email) {
        throw new Error(`INVALID_SUBSCRIBER_RECORD: Subscriber record missing email in ${subsPath}`);
      }
      const country = String(item.country || item.toCountry || 'US');
      const city = String(item.city || item.embassyCity || 'Capital Hub');
      const visaType = String(item.visaType || item.fromCountry || 'standard');
      const id = String(item.id || `sub-${sha256Text(`${email}|${country}|${city}|${visaType}`).slice(0, 16)}`);
      slotSubscribers.push({
        id,
        email,
        country,
        city,
        visa_type: visaType,
        language: String(item.language || 'en'),
        subscribed_at: String(item.subscribedAt || '1970-01-01T00:00:00.000Z'),
        last_notified_at: item.lastNotifiedAt ? String(item.lastNotifiedAt) : null,
        is_active: item.isActive === false || item.isActive === 0 ? 0 : 1
      });
    }
  }

  // 4. content/immigration_sync_state.json (LEGACY_SUPERSEDED)
  const syncPath = path.join(root, 'content', 'immigration_sync_state.json');
  if (!fs.existsSync(syncPath)) {
    if (requireFiles) throw new Error(`MISSING_SOURCE_FILE: ${syncPath}`);
  }
  let syncParsed: Record<string, unknown> | null = null;
  let syncValidJson = false;
  let syncSha = '';
  if (fs.existsSync(syncPath)) {
    syncSha = sha256File(syncPath);
    try {
      const raw = JSON.parse(fs.readFileSync(syncPath, 'utf-8'));
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error('Expected JSON object');
      }
      syncParsed = raw as Record<string, unknown>;
      syncValidJson = true;
    } catch (err: any) {
      throw new Error(`INVALID_JSON_SOURCE (${syncPath}): ${err?.message || 'parse error'}`);
    }
  }

  // 5. content/*.md and content/drafts/*.md
  const editorialArticles: Array<Record<string, unknown>> = [];
  const markdownDigests: Record<string, string> = {};

  const readMarkdownDir = (relDir: string, status: 'published' | 'draft') => {
    const dir = path.join(root, relDir);
    if (!fs.existsSync(dir)) return;
    const files = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
      .map((e) => e.name)
      .sort();

    for (const fileName of files) {
      const abs = path.join(dir, fileName);
      const rawText = fs.readFileSync(abs, 'utf-8');
      const parsed = matter(rawText);
      const slug = fileName.replace(/\.md$/i, '');
      const frontmatter = canonicalizeJsonValue(parsed.data || {}) as Record<string, unknown>;
      const title = String(frontmatter.title || slug);
      const rawDate = frontmatter.date ? String(frontmatter.date) : '';
      let isoDate = '2026-11-01T00:00:00.000Z';
      if (rawDate) {
        const d = new Date(rawDate);
        if (!Number.isNaN(d.getTime())) isoDate = d.toISOString();
      }
      const sourceOrigin = `${relDir}/${fileName}`.replace(/\\/g, '/');
      markdownDigests[sourceOrigin] = sha256Text(
        JSON.stringify({ slug, status, title, frontmatter, markdownBody: parsed.content })
      );
      editorialArticles.push({
        slug,
        status,
        title,
        frontmatter_json: JSON.stringify(frontmatter),
        markdown_body: parsed.content,
        source_origin: sourceOrigin,
        created_at: isoDate,
        updated_at: isoDate,
        published_at: status === 'published' ? isoDate : null
      });
    }
  };

  readMarkdownDir('content', 'published');
  readMarkdownDir('content/drafts', 'draft');

  return {
    changelogEntriesFromJson,
    slotEmbassyStatuses,
    slotSubscribers,
    editorialArticles,
    legacySyncState: {
      path: 'content/immigration_sync_state.json',
      exists: fs.existsSync(syncPath),
      validJson: syncValidJson,
      parsed: syncParsed,
      sha256: syncSha
    },
    markdownDigests
  };
}

/**
 * Validates that every SQLite column and every mapped PostgreSQL column matches TABLE_MAPPING_SPECS strictly.
 * Fails immediately on unknown or unmapped columns.
 */
export async function validateAllTableColumnMappings(
  sqliteDb: Database.Database,
  destPgExec?: PgExecutor
): Promise<void> {
  for (const table of SQLITE_TO_PG_IMPORT_ORDER) {
    const spec = TABLE_MAPPING_SPECS[table];
    const sqliteCols = (sqliteDb.pragma(`table_info("${table}")`) as Array<{ name: string }>).map((c) => c.name);
    const expectedSet = new Set(spec.columns);

    for (const srcCol of sqliteCols) {
      if (!expectedSet.has(srcCol)) {
        throw new Error(
          `UNKNOWN_SOURCE_COLUMN: Table "${table}" has unmapped SQLite column "${srcCol}".`
        );
      }
    }
    for (const expCol of spec.columns) {
      if (!sqliteCols.includes(expCol)) {
        throw new Error(
          `MISSING_SOURCE_COLUMN: Table "${table}" is missing expected mapped column "${expCol}".`
        );
      }
    }

    if (destPgExec) {
      const pgColsRes = await destPgExec.query<{ column_name: string }>(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
        [table]
      );
      const pgColNames = pgColsRes.rows.map((r) => r.column_name);
      for (const destCol of pgColNames) {
        if (!expectedSet.has(destCol)) {
          throw new Error(
            `UNMAPPED_DESTINATION_COLUMN: PostgreSQL table "${table}" has unmapped column "${destCol}".`
          );
        }
      }
      for (const expCol of spec.columns) {
        if (!pgColNames.includes(expCol)) {
          throw new Error(
            `MISSING_DESTINATION_COLUMN: PostgreSQL table "${table}" is missing expected column "${expCol}".`
          );
        }
      }
    }
  }

  if (destPgExec) {
    for (const [table, spec] of Object.entries(MIGRATION_004_TARGET_SPECS)) {
      const pgColsRes = await destPgExec.query<{ column_name: string }>(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
        [table]
      );
      const pgColNames = pgColsRes.rows.map((r) => r.column_name);
      for (const col of spec.columns) {
        if (!pgColNames.includes(col)) {
          throw new Error(
            `MISSING_DESTINATION_COLUMN: PostgreSQL Migration 004 table "${table}" is missing column "${col}".`
          );
        }
      }
    }
  }
}

function validateJsonColumns(table: string, rows: Array<Record<string, unknown>>, jsonCols: readonly string[]): void {
  for (const row of rows) {
    for (const col of jsonCols) {
      const raw = row[col];
      if (raw === null || raw === undefined || raw === '') continue;
      if (typeof raw !== 'string') {
        throw new Error(`INVALID_JSON_VALUE: ${table}.${col} must be JSON text string.`);
      }
      try {
        JSON.parse(raw);
      } catch (err: any) {
        throw new Error(
          `INVALID_JSON_VALUE: ${table}.${col} contains invalid JSON: ${err?.message || 'parse error'}`
        );
      }
    }
  }
}

function buildRowDigest(table: string, row: Record<string, unknown>, columns: readonly string[]): string {
  const ordered: Record<string, unknown> = {};
  for (const col of [...columns].sort()) {
    ordered[col] = row[col] === undefined ? null : row[col];
  }
  return sha256Text(JSON.stringify({ table, row: ordered }));
}

function sanitizeRowForPiiLog(table: string, pkVal: string, row: Record<string, unknown>): string {
  if (table === 'slot_subscribers') {
    const emailHash = sha256Text(String(row.email || '').trim().toLowerCase()).slice(0, 12);
    return `${pkVal}[email_sha256=${emailHash}]`;
  }
  return pkVal;
}

/**
 * Computes a deterministic SQLite -> PostgreSQL migration plan from a verified WAL-safe backup
 * and compares every record against an isolated mock/PGlite destination adapter.
 *
 * Strictly dry-run by default; refuses live Neon writes or connections.
 */
export async function planAndOptionallyApplyMockMigration(options: MigrateOptions): Promise<MigrationPlanReport> {
  if (options.execute) {
    throw new Error(
      'LIVE_MIGRATION_FORBIDDEN_IN_PHASE_B3: Actual database writes via --execute are strictly refused in Phase B.3. Use --dry-run (default) or isolated mock verification.'
    );
  }
  assertNonNeonDestination(options.mockDestinationExecutor);

  const dryRun = options.verifyOnly ? true : options.dryRun !== false && !options.applyToMock;
  const verifyOnly = Boolean(options.verifyOnly);
  const executeMock = Boolean(options.applyToMock && !verifyOnly);

  const extraction = loadAndVerifyBackupSource(options.sourcePath, options.manifestPath, options.projectRoot);
  const sqliteDb = new Database(extraction.dbPath, { readonly: true, fileMustExist: true });

  let ownMockExec: PgExecutor | null = null;
  let destExec: PgExecutor;

  try {
    if (options.mockDestinationExecutor) {
      destExec = options.mockDestinationExecutor;
    } else {
      ownMockExec = await createPostgresExecutor(undefined, {
        purpose: 'test',
        accessMode: 'migration',
        allowPglite: true,
        requireNeonRemote: false
      });
      destExec = ownMockExec;
    }

    assertNonNeonDestination(destExec);

    const migRepo = new PostgresImmigrationRepository(destExec);
    await migRepo.runTrackedMigrations(POSTGRES_MIGRATIONS);

    // 1. Validate all SQLite and destination column mappings strictly
    await validateAllTableColumnMappings(sqliteDb, destExec);

    // 2. Load non-SQLite persistent sources
    const nonSqlite = loadNonSqlitePersistentSources(extraction.projectFilesRoot, {
      requireAllFiles: true
    });

    // 3. Collect all source rows in strict FK order + validate JSON + validate FKs + validate no deleted fixtures
    const sourceTableRows = new Map<string, Array<Record<string, unknown>>>();

    for (const table of SQLITE_TO_PG_IMPORT_ORDER) {
      const spec = TABLE_MAPPING_SPECS[table];
      const rows = sqliteDb
        .prepare(`SELECT * FROM "${table}" ORDER BY "${spec.primaryKey}" ASC`)
        .all() as Array<Record<string, unknown>>;
      validateJsonColumns(table, rows, spec.jsonColumns);

      for (const row of rows) {
        const pk = String(row[spec.primaryKey] ?? '');
        if (isPhase32DeletedFixtureId(pk)) {
          throw new Error(`DELETED_FIXTURE_DETECTED: Deleted Phase 3.2 fixture "${pk}" found in ${table}.`);
        }
      }

      if (table === 'changelog_entries') {
        // Merge SQLite changelog_entries + src/data/immigrationChangelog.json idempotently by id
        const byId = new Map<string, Record<string, unknown>>();
        for (const r of nonSqlite.changelogEntriesFromJson) {
          byId.set(String(r.id), r);
        }
        for (const r of rows) {
          byId.set(String(r.id), r);
        }
        const merged = Array.from(byId.values()).sort((a, b) =>
          String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0
        );
        sourceTableRows.set(table, merged);
      } else {
        sourceTableRows.set(table, rows);
      }
    }

    // Add Migration 004 non-SQLite sources sorted deterministically by PK
    sourceTableRows.set(
      'slot_embassy_status',
      [...nonSqlite.slotEmbassyStatuses].sort((a, b) =>
        String(a.embassy_key).localeCompare(String(b.embassy_key))
      )
    );
    sourceTableRows.set(
      'slot_subscribers',
      [...nonSqlite.slotSubscribers].sort((a, b) => String(a.id).localeCompare(String(b.id)))
    );
    sourceTableRows.set(
      'editorial_articles',
      [...nonSqlite.editorialArticles].sort((a, b) => String(a.slug).localeCompare(String(b.slug)))
    );

    // 4. Validate foreign keys across collected source datasets (parent keys exist in source or dest)
    const programIdsInSource = new Set(
      (sourceTableRows.get('immigration_programs') || []).map((r) => String(r.id))
    );
    const claimIdsInSource = new Set(
      (sourceTableRows.get('visa_detail_claims') || []).map((r) => String(r.id))
    );
    for (const vd of sourceTableRows.get('visa_details') || []) {
      if (!programIdsInSource.has(String(vd.program_id))) {
        throw new Error(`FK_DEPENDENCY_MISSING: visa_details(${vd.id}) references unknown program_id ${vd.program_id}`);
      }
    }
    for (const clm of sourceTableRows.get('visa_detail_claims') || []) {
      if (!programIdsInSource.has(String(clm.program_id))) {
        throw new Error(
          `FK_DEPENDENCY_MISSING: visa_detail_claims(${clm.id}) references unknown program_id ${clm.program_id}`
        );
      }
    }
    for (const ev of sourceTableRows.get('visa_detail_evidence') || []) {
      if (!claimIdsInSource.has(String(ev.claim_id))) {
        throw new Error(
          `FK_DEPENDENCY_MISSING: visa_detail_evidence(${ev.id}) references unknown claim_id ${ev.claim_id}`
        );
      }
    }
    for (const ver of sourceTableRows.get('visa_detail_versions') || []) {
      if (!programIdsInSource.has(String(ver.program_id))) {
        throw new Error(
          `FK_DEPENDENCY_MISSING: visa_detail_versions(${ver.id}) references unknown program_id ${ver.program_id}`
        );
      }
    }

    // 5. Build deterministic plan against destination mock state (all 12 SQLite tables + 3 Migration 004 tables)
    const allPlannedTables: Array<{
      table: string;
      sourceOrigin: string;
      pkCol: string;
      columns: readonly string[];
    }> = [
      ...SQLITE_TO_PG_IMPORT_ORDER.map((t) => ({
        table: t,
        sourceOrigin:
          t === 'changelog_entries'
            ? 'sqlite:changelog_entries + src/data/immigrationChangelog.json'
            : `sqlite:${t}`,
        pkCol: TABLE_MAPPING_SPECS[t].primaryKey,
        columns: TABLE_MAPPING_SPECS[t].columns
      })),
      {
        table: 'slot_embassy_status',
        sourceOrigin: 'content/slot_status.json',
        pkCol: 'embassy_key',
        columns: MIGRATION_004_TARGET_SPECS.slot_embassy_status.columns
      },
      {
        table: 'slot_subscribers',
        sourceOrigin: 'content/slot_subscribers.json',
        pkCol: 'id',
        columns: MIGRATION_004_TARGET_SPECS.slot_subscribers.columns
      },
      {
        table: 'editorial_articles',
        sourceOrigin: 'content/*.md + content/drafts/*.md',
        pkCol: 'slug',
        columns: MIGRATION_004_TARGET_SPECS.editorial_articles.columns
      }
    ];

    const tablePlans: TableMigrationPlanSummary[] = [];
    let totalSourceRecords = 0;
    let totalInserts = 0;
    let totalUpdates = 0;
    let totalSkipped = 0;
    let totalConflicts = 0;

    for (let idx = 0; idx < allPlannedTables.length; idx++) {
      const def = allPlannedTables[idx];
      const sourceRows = sourceTableRows.get(def.table) || [];
      totalSourceRecords += sourceRows.length;

      const destRes = await destExec.query<Record<string, unknown>>(
        `SELECT * FROM "${def.table}" ORDER BY "${def.pkCol}" ASC`
      );
      const destByPk = new Map<string, Record<string, unknown>>();
      const destVisaProgramToId = new Map<string, string>();
      const destSubCompositeToId = new Map<string, string>();

      for (const dr of destRes.rows) {
        destByPk.set(String(dr[def.pkCol]), dr);
        if (def.table === 'visa_details') {
          destVisaProgramToId.set(String(dr.program_id), String(dr.id));
        }
        if (def.table === 'slot_subscribers') {
          const compKey = `${String(dr.email || '').toLowerCase()}|${dr.country}|${dr.city}|${dr.visa_type}`;
          destSubCompositeToId.set(compKey, String(dr.id));
        }
      }

      const actions: PlannedRecordAction[] = [];
      let insertCount = 0;
      let updateCount = 0;
      let skipUnchangedCount = 0;
      let conflictCount = 0;

      for (const row of sourceRows) {
        const pkVal = String(row[def.pkCol]);
        const srcDigest = buildRowDigest(def.table, row, def.columns);
        const existing = destByPk.get(pkVal);

        let action: PlanActionType = 'INSERT';
        let reason: string | undefined;

        if (def.table === 'visa_details') {
          const existingIdForProg = destVisaProgramToId.get(String(row.program_id));
          if (existingIdForProg && existingIdForProg !== pkVal) {
            action = 'CONFLICT';
            reason = `Unique constraint conflict on visa_details.program_id=${String(row.program_id)} (existing id=${existingIdForProg})`;
          }
        }
        if (def.table === 'slot_subscribers' && action !== 'CONFLICT') {
          const compKey = `${String(row.email || '').toLowerCase()}|${row.country}|${row.city}|${row.visa_type}`;
          const existingSubId = destSubCompositeToId.get(compKey);
          if (existingSubId && existingSubId !== pkVal) {
            action = 'CONFLICT';
            reason = `Unique subscriber composite collision (different id=${existingSubId})`;
          }
        }

        if (action !== 'CONFLICT' && existing) {
          const destDigest = buildRowDigest(def.table, existing, def.columns);
          if (destDigest === srcDigest) {
            action = 'SKIP_UNCHANGED';
          } else {
            action = 'UPDATE';
            reason = 'Destination record differs from verified backup source digest';
          }
        }

        if (action === 'INSERT') insertCount++;
        else if (action === 'UPDATE') updateCount++;
        else if (action === 'SKIP_UNCHANGED') skipUnchangedCount++;
        else if (action === 'CONFLICT') conflictCount++;

        actions.push({
          primaryKeyValue: sanitizeRowForPiiLog(def.table, pkVal, row),
          action,
          ...(reason ? { reason: redactSensitiveData(reason) } : {}),
          sourceDigest: srcDigest
        });
      }

      totalInserts += insertCount;
      totalUpdates += updateCount;
      totalSkipped += skipUnchangedCount;
      totalConflicts += conflictCount;

      tablePlans.push({
        table: def.table,
        sourceOrigin: def.sourceOrigin,
        importOrderIndex: idx + 1,
        primaryKeyColumn: def.pkCol,
        sourceCount: sourceRows.length,
        insertCount,
        updateCount,
        skipUnchangedCount,
        conflictCount,
        sourceTableDigest: computeCanonicalRowsDigest(def.table, sourceRows, def.pkCol),
        actions
      });
    }

    // 6. Execute ONLY against isolated mock destination when applyToMock is explicitly true (never live Neon!)
    if (executeMock) {
      if (totalConflicts > 0) {
        throw new Error(`MIGRATION_CONFLICTS_DETECTED: ${totalConflicts} unresolved destination conflict(s).`);
      }
      await destExec.transaction(async (tx) => {
        for (const def of allPlannedTables) {
          const rows = sourceTableRows.get(def.table) || [];
          const colList = def.columns.map((c) => `"${c}"`).join(', ');
          const placeholders = def.columns.map((_, i) => `$${i + 1}`).join(', ');
          const nonPkCols = def.columns.filter((c) => c !== def.pkCol);
          const updateSet = nonPkCols.map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');
          const sql =
            nonPkCols.length > 0
              ? `INSERT INTO "${def.table}" (${colList}) VALUES (${placeholders}) ON CONFLICT ("${def.pkCol}") DO UPDATE SET ${updateSet}`
              : `INSERT INTO "${def.table}" (${colList}) VALUES (${placeholders}) ON CONFLICT ("${def.pkCol}") DO NOTHING`;

          for (const row of rows) {
            const values = def.columns.map((c) => (row[c] === undefined ? null : row[c]));
            await tx.query(sql, values);
          }
        }
      });
    }

    const sqliteCountsSnapshot: Record<string, number> = {};
    for (const t of SQLITE_TO_PG_IMPORT_ORDER) {
      sqliteCountsSnapshot[t] = (
        sqliteDb.prepare(`SELECT COUNT(*) AS c FROM "${t}"`).get() as { c: number }
      ).c;
    }

    const planSha256 = sha256Text(
      JSON.stringify({
        tables: tablePlans.map((t) => ({
          table: t.table,
          importOrderIndex: t.importOrderIndex,
          sourceTableDigest: t.sourceTableDigest,
          actions: t.actions
        }))
      })
    );

    const mode: MigrationPlanReport['mode'] = executeMock
      ? 'MOCK_APPLIED'
      : verifyOnly
        ? 'VERIFY_ONLY'
        : 'DRY_RUN';

    return {
      mode,
      verificationLabel: 'MOCK_VERIFICATION',
      liveNeonConnected: false,
      dryRun,
      verifyOnly,
      executedAgainstMockDestination: executeMock,
      sourceBackupVerified: true,
      backupName: extraction.manifest.backupName,
      backupCreatedAt: extraction.manifest.createdAt,
      schemaMigrationsPolicy: {
        sqliteSchemaMigrationsCopied: false,
        postgresMigrationsAppliedCount: POSTGRES_MIGRATIONS.length,
        postgresMigrationVersions: POSTGRES_MIGRATIONS.map((m) => m.version)
      },
      columnMappingValidated: true,
      foreignKeyOrderValidated: true,
      legacySyncStateStatus: {
        path: 'content/immigration_sync_state.json',
        status: 'LEGACY_SUPERSEDED',
        supersededBy: ['batch_state', 'automation_job_locks'],
        action: 'skipped_legacy_superseded'
      },
      sourceInventorySummary: {
        sqliteTableCounts: sqliteCountsSnapshot,
        changelogJsonCount: nonSqlite.changelogEntriesFromJson.length,
        slotEmbassyCount: nonSqlite.slotEmbassyStatuses.length,
        slotSubscriberCount: nonSqlite.slotSubscribers.length,
        publishedMarkdownCount: nonSqlite.editorialArticles.filter((a) => a.status === 'published').length,
        draftMarkdownCount: nonSqlite.editorialArticles.filter((a) => a.status === 'draft').length
      },
      totals: {
        tablesPlanned: tablePlans.length,
        totalSourceRecords,
        inserts: totalInserts,
        updates: totalUpdates,
        skippedUnchanged: totalSkipped,
        conflicts: totalConflicts
      },
      planSha256,
      tables: tablePlans,
      errors: []
    };
  } finally {
    closeSqliteDatabase(sqliteDb);
    if (ownMockExec) {
      await ownMockExec.close();
    }
    extraction.cleanup();
  }
}
