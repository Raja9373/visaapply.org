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

import type {
  AppliedMigrationInfo,
  AutomationCheckpointInput,
  CronExecutionLogInput,
  DatabaseBackendKind,
  DatabaseIntegritySummary,
  DeadLetterItemInput,
  EditorialArticleRecord,
  EditorialArticleStatus,
  MigrationCapableRepository,
  RepositoryAccessMode,
  SlotEmailLogRecord,
  SlotEmbassyStatusRecord,
  SlotSubscriberRecord
} from './repository';
import type { OperationalEvent } from '../utils/operationalObservability';

const { Pool: PgPool } = pg;

export type PostgresConnectionPurpose = 'readonly' | 'app_rw' | 'migration' | 'test';

export interface PostgresTimeoutConfig {
  connectionTimeoutMillis: number;
  idleTimeoutMillis: number;
  queryTimeoutMs: number;
  statementTimeoutMs: number;
  lockTimeoutMs: number;
  idleInTransactionSessionTimeoutMs: number;
}

export const DEFAULT_POSTGRES_TIMEOUTS: Readonly<PostgresTimeoutConfig> = Object.freeze({
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 10000,
  queryTimeoutMs: 10000,
  statementTimeoutMs: 10000,
  lockTimeoutMs: 5000,
  idleInTransactionSessionTimeoutMs: 15000
});

export type DatabaseConfigurationErrorCode =
  | 'POSTGRES_CREDENTIALS_MISSING'
  | 'POSTGRES_INVALID_URI'
  | 'POSTGRES_INVALID_PROTOCOL'
  | 'POSTGRES_PLACEHOLDER_URL'
  | 'POSTGRES_LOCALHOST_FORBIDDEN_ON_VERCEL'
  | 'POSTGRES_INSECURE_TLS_FORBIDDEN'
  | 'POSTGRES_INVALID_SSLMODE'
  | 'OWNER_ROLE_FORBIDDEN_IN_RUNTIME'
  | 'PRODUCTION_PGLITE_FORBIDDEN'
  | 'REMOTE_NEON_REQUIRED'
  | 'SQLITE_FORBIDDEN_IN_PRODUCTION'
  | 'SQLITE_PATH_REQUIRED'
  | 'MOCK_EXECUTOR_FORBIDDEN_IN_PRODUCTION';

/**
 * Fail-safe structured error thrown when database configuration or credentials
 * are missing, placeholder, insecure, or forbidden in production/Vercel.
 * Always provides a safe publicMessage and HTTP 503 status without exposing secrets.
 */
export class DatabaseConfigurationError extends Error {
  readonly code: DatabaseConfigurationErrorCode;
  readonly httpStatus: number = 503;
  readonly publicMessage: string = 'Database service is temporarily unavailable.';
  readonly envVarName?: string;
  readonly purpose?: PostgresConnectionPurpose;

  constructor(
    code: DatabaseConfigurationErrorCode,
    detail: string,
    meta?: { envVarName?: string; purpose?: PostgresConnectionPurpose }
  ) {
    const safeDetail = redactSensitiveData(detail);
    super(`${code}: ${safeDetail}`);
    this.name = 'DatabaseConfigurationError';
    this.code = code;
    this.envVarName = meta?.envVarName;
    this.purpose = meta?.purpose;
  }
}

export function isDatabaseConfigurationError(err: unknown): err is DatabaseConfigurationError {
  return err instanceof DatabaseConfigurationError;
}

export interface CreatePostgresExecutorOptions {
  /** Role purpose determining which environment variable and access mode is used. */
  purpose?: PostgresConnectionPurpose;
  /** Explicit access mode override (defaults from purpose: readonly -> readonly, app_rw/test -> readwrite, migration -> migration). */
  accessMode?: RepositoryAccessMode;
  /** Legacy flag: false permits explicit PGlite fallback ONLY outside production/Vercel. */
  requireNeonRemote?: boolean;
  /** Explicit opt-in for isolated in-process PGlite outside production/Vercel. */
  allowPglite?: boolean;
  /** Prefer @neondatabase/serverless Pool on serverless/Vercel runtimes. */
  useServerlessDriver?: boolean;
  /** Reject owner/superuser role names (e.g., neondb_owner, postgres) for runtime purposes. Default: true for readonly/app_rw. */
  rejectOwnerRole?: boolean;
  /** Bounded timeout overrides. */
  timeouts?: Partial<PostgresTimeoutConfig>;
  /** Maximum pool size override. */
  maxPoolSize?: number;
  /** Environment object override (for deterministic unit testing). */
  env?: NodeJS.ProcessEnv;
}

export interface ValidatedPostgresUrl {
  url: string;
  host: string;
  port: number;
  database: string;
  username: string;
  isNeonHost: boolean;
  isPooledHost: boolean;
  isLocalhost: boolean;
  sslMode: string;
  requiresTls: boolean;
}

export interface PgExecutor {
  query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }>;
  transaction<T>(fn: (tx: PgExecutor) => Promise<T>): Promise<T>;
  close(): Promise<void>;
  isNeonRemote: boolean;
  accessMode: RepositoryAccessMode;
  backend: DatabaseBackendKind;
  purpose: PostgresConnectionPurpose;
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

export const POSTGRES_PHASE_B_MIGRATION_004_DDL = `
CREATE UNIQUE INDEX IF NOT EXISTS idx_pg_visa_details_program_unique ON visa_details(program_id);

CREATE TABLE IF NOT EXISTS slot_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  visa_type TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  subscribed_at TEXT NOT NULL,
  last_notified_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pg_slot_subscribers_unique ON slot_subscribers (LOWER(email), country, city, visa_type);
CREATE INDEX IF NOT EXISTS idx_pg_slot_subscribers_active ON slot_subscribers (is_active, country, city);

CREATE TABLE IF NOT EXISTS slot_embassy_status (
  embassy_key TEXT PRIMARY KEY,
  country TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  earliest_date TEXT,
  booking_link TEXT,
  last_checked_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pg_slot_embassy_country ON slot_embassy_status (country, status);

CREATE TABLE IF NOT EXISTS slot_email_logs (
  id TEXT PRIMARY KEY,
  embassy_key TEXT NOT NULL,
  recipient_hash TEXT NOT NULL,
  status TEXT NOT NULL,
  provider_message_id TEXT,
  sent_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pg_slot_email_logs_sent ON slot_email_logs (embassy_key, sent_at);

CREATE TABLE IF NOT EXISTS editorial_articles (
  slug TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'archived')),
  title TEXT NOT NULL,
  frontmatter_json TEXT NOT NULL DEFAULT '{}',
  markdown_body TEXT NOT NULL,
  source_origin TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_pg_editorial_status_updated ON editorial_articles (status, updated_at);

CREATE TABLE IF NOT EXISTS admin_revoked_sessions (
  jti TEXT PRIMARY KEY,
  revoked_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pg_admin_revoked_expires ON admin_revoked_sessions (expires_at);
`;

export interface PgMigrationDefinition {
  version: string;
  name: string;
  ddl: string;
  rollbackNotes: string;
}

export const POSTGRES_MIGRATION_004: PgMigrationDefinition = {
  version: '004_phaseB_serverless_unification',
  name: 'Phase B unique visa_details(program_id) constraint and serverless unified tables (slot alerts, editorial articles, revoked admin sessions)',
  ddl: POSTGRES_PHASE_B_MIGRATION_004_DDL,
  rollbackNotes:
    'DROP INDEX IF EXISTS idx_pg_visa_details_program_unique; DROP TABLE IF EXISTS admin_revoked_sessions, editorial_articles, slot_email_logs, slot_embassy_status, slot_subscribers.'
};

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
  },
  POSTGRES_MIGRATION_004
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

const PLACEHOLDER_NEON_HOSTS = [
  'ep-example.us-east-2.aws.neon.tech',
  'example.com',
  'your-neon-host',
  'placeholder.neon.tech'
];
const PLACEHOLDER_URI_PATTERNS = [
  /<replace_with[^>]*>/i,
  /<target_db_name>/i,
  /<password>/i,
  /<host>/i,
  /replace_with_min_32_char_password/i,
  /your_password_here/i
];
const INSECURE_SSL_MODES = new Set(['disable', 'allow', 'prefer', 'no-verify']);
const LOCAL_LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

export function isPlaceholderConnectionString(rawUrl: string): boolean {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();
  if (PLACEHOLDER_NEON_HOSTS.some((ph) => lower.includes(ph))) {
    return true;
  }
  return PLACEHOLDER_URI_PATTERNS.some((re) => re.test(trimmed));
}

export function isProductionEnvironment(env: NodeJS.ProcessEnv = process.env): boolean {
  return (
    env.NODE_ENV === 'production' ||
    env.VERCEL === '1' ||
    env.VERCEL === 'true' ||
    Boolean((env.VERCEL_ENV || '').trim())
  );
}

export function isVercelRuntime(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VERCEL === '1' || env.VERCEL === 'true' || Boolean((env.VERCEL_ENV || '').trim());
}

export function getEnvVarNameForPurpose(purpose: PostgresConnectionPurpose): string {
  switch (purpose) {
    case 'readonly':
      return 'NEON_READONLY_DATABASE_URL';
    case 'app_rw':
      return 'NEON_APP_DATABASE_URL';
    case 'migration':
      return 'NEON_MIGRATION_DATABASE_URL';
    case 'test':
    default:
      return 'NEON_TEST_DATABASE_URL';
  }
}

export function isOwnerOrPrivilegedRoleName(username: string): boolean {
  const normalized = (username || '').trim().toLowerCase();
  if (!normalized) return false;
  return (
    normalized === 'neondb_owner' ||
    normalized === 'postgres' ||
    normalized === 'superuser' ||
    normalized.endsWith('_owner') ||
    normalized.endsWith('_admin')
  );
}

/**
 * Strictly validates a PostgreSQL connection URI without ever echoing credentials or host secrets in errors.
 */
export function validatePostgresConnectionUrl(
  rawUrl: string,
  options: {
    purpose: PostgresConnectionPurpose;
    env?: NodeJS.ProcessEnv;
    rejectOwnerRole?: boolean;
  }
): ValidatedPostgresUrl {
  const env = options.env ?? process.env;
  const prod = isProductionEnvironment(env);
  const vercel = isVercelRuntime(env);
  const trimmed = (rawUrl || '').trim();
  const envVarName = getEnvVarNameForPurpose(options.purpose);
  const meta = { envVarName, purpose: options.purpose };

  if (!trimmed) {
    throw new DatabaseConfigurationError(
      'POSTGRES_CREDENTIALS_MISSING',
      `${envVarName} is not configured for "${options.purpose}" database access.`,
      meta
    );
  }

  if (PLACEHOLDER_URI_PATTERNS.some((re) => re.test(trimmed))) {
    throw new DatabaseConfigurationError(
      'POSTGRES_PLACEHOLDER_URL',
      `${envVarName} contains an unreplaced template placeholder value.`,
      meta
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new DatabaseConfigurationError(
      'POSTGRES_INVALID_URI',
      `${envVarName} is not a valid PostgreSQL connection URI.`,
      meta
    );
  }

  if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
    throw new DatabaseConfigurationError(
      'POSTGRES_INVALID_PROTOCOL',
      `${envVarName} must use postgres:// or postgresql://.`,
      meta
    );
  }

  const host = parsed.hostname.toLowerCase();
  if (!host || PLACEHOLDER_NEON_HOSTS.some((ph) => host === ph || host.includes(ph))) {
    throw new DatabaseConfigurationError(
      'POSTGRES_PLACEHOLDER_URL',
      `${envVarName} points to a placeholder or empty host.`,
      meta
    );
  }

  const isLocalhost = LOCAL_LOOPBACK_HOSTS.has(host);
  if (vercel && isLocalhost) {
    throw new DatabaseConfigurationError(
      'POSTGRES_LOCALHOST_FORBIDDEN_ON_VERCEL',
      `${envVarName} cannot target localhost in Vercel runtime.`,
      meta
    );
  }

  const isNeonHost = host.endsWith('.neon.tech');
  const isPooledHost = host.includes('-pooler.');
  const sslMode = (parsed.searchParams.get('sslmode') || '').trim().toLowerCase();
  const requiresTls = !isLocalhost || prod || isNeonHost;

  if (requiresTls && sslMode && INSECURE_SSL_MODES.has(sslMode)) {
    throw new DatabaseConfigurationError(
      'POSTGRES_INSECURE_TLS_FORBIDDEN',
      `${envVarName} specifies insecure sslmode="${sslMode}". Strict TLS verification (sslmode=verify-full or require with rejectUnauthorized=true) is mandatory.`,
      meta
    );
  }

  if ((prod || isNeonHost) && sslMode && sslMode !== 'require' && sslMode !== 'verify-ca' && sslMode !== 'verify-full') {
    throw new DatabaseConfigurationError(
      'POSTGRES_INVALID_SSLMODE',
      `${envVarName} must use sslmode=verify-full, verify-ca, or require for Neon/production connections.`,
      meta
    );
  }

  const username = decodeURIComponent(parsed.username || '').trim();
  const shouldRejectOwner =
    options.rejectOwnerRole !== undefined
      ? options.rejectOwnerRole
      : options.purpose === 'readonly' || options.purpose === 'app_rw';

  if (shouldRejectOwner && isOwnerOrPrivilegedRoleName(username)) {
    throw new DatabaseConfigurationError(
      'OWNER_ROLE_FORBIDDEN_IN_RUNTIME',
      `${envVarName} must use a least-privilege role (visaapply_audit_ro or visaapply_app_rw), never an owner/superuser role.`,
      meta
    );
  }

  const database = parsed.pathname.replace(/^\/+/, '');
  const port = parsed.port ? Number(parsed.port) : 5432;

  return {
    url: trimmed,
    host,
    port: Number.isFinite(port) && port > 0 ? port : 5432,
    database,
    username,
    isNeonHost,
    isPooledHost,
    isLocalhost,
    sslMode: sslMode || (requiresTls ? 'require' : 'prefer'),
    requiresTls
  };
}

function clampTimeout(value: number | undefined, fallback: number, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(value)));
}

export function resolvePostgresTimeouts(overrides?: Partial<PostgresTimeoutConfig>): PostgresTimeoutConfig {
  return {
    connectionTimeoutMillis: clampTimeout(
      overrides?.connectionTimeoutMillis,
      DEFAULT_POSTGRES_TIMEOUTS.connectionTimeoutMillis,
      1000,
      30000
    ),
    idleTimeoutMillis: clampTimeout(
      overrides?.idleTimeoutMillis,
      DEFAULT_POSTGRES_TIMEOUTS.idleTimeoutMillis,
      1000,
      60000
    ),
    queryTimeoutMs: clampTimeout(
      overrides?.queryTimeoutMs,
      DEFAULT_POSTGRES_TIMEOUTS.queryTimeoutMs,
      1000,
      60000
    ),
    statementTimeoutMs: clampTimeout(
      overrides?.statementTimeoutMs,
      DEFAULT_POSTGRES_TIMEOUTS.statementTimeoutMs,
      1000,
      60000
    ),
    lockTimeoutMs: clampTimeout(
      overrides?.lockTimeoutMs,
      DEFAULT_POSTGRES_TIMEOUTS.lockTimeoutMs,
      500,
      30000
    ),
    idleInTransactionSessionTimeoutMs: clampTimeout(
      overrides?.idleInTransactionSessionTimeoutMs,
      DEFAULT_POSTGRES_TIMEOUTS.idleInTransactionSessionTimeoutMs,
      1000,
      60000
    )
  };
}

/**
 * Builds a strict TLS-verified, timeout-bounded PostgreSQL pool configuration.
 * Always enforces full TLS certificate verification (rejectUnauthorized: true).
 */
export function buildPgPoolConfig(
  rawUrl: string,
  options: {
    purpose: PostgresConnectionPurpose;
    env?: NodeJS.ProcessEnv;
    timeouts?: Partial<PostgresTimeoutConfig>;
    maxPoolSize?: number;
    rejectOwnerRole?: boolean;
  }
): {
  validated: ValidatedPostgresUrl;
  timeouts: PostgresTimeoutConfig;
  poolConfig: pg.PoolConfig;
} {
  const env = options.env ?? process.env;
  const validated = validatePostgresConnectionUrl(rawUrl, {
    purpose: options.purpose,
    env,
    rejectOwnerRole: options.rejectOwnerRole
  });
  const timeouts = resolvePostgresTimeouts(options.timeouts);
  const vercel = isVercelRuntime(env);

  const defaultMax =
    options.purpose === 'migration' ? 1 : vercel ? 3 : 5;
  const max = clampTimeout(options.maxPoolSize, defaultMax, 1, 20);

  const poolConfig: pg.PoolConfig = {
    connectionString: validated.url,
    max,
    idleTimeoutMillis: timeouts.idleTimeoutMillis,
    connectionTimeoutMillis: timeouts.connectionTimeoutMillis,
    query_timeout: timeouts.queryTimeoutMs,
    allowExitOnIdle: true,
    application_name: `visaapply_${options.purpose}`,
    ssl: validated.requiresTls ? { rejectUnauthorized: true } : undefined
  };

  return { validated, timeouts, poolConfig };
}

export function buildSessionInitSql(accessMode: RepositoryAccessMode, timeouts: PostgresTimeoutConfig): string[] {
  const statements = [
    `SET statement_timeout = '${timeouts.statementTimeoutMs}ms'`,
    `SET lock_timeout = '${timeouts.lockTimeoutMs}ms'`,
    `SET idle_in_transaction_session_timeout = '${timeouts.idleInTransactionSessionTimeoutMs}ms'`
  ];
  if (accessMode === 'readonly') {
    statements.push('SET default_transaction_read_only = on');
  }
  return statements;
}

/**
 * Creates a hardened PostgreSQL executor using separated role credentials:
 *   - readonly  -> NEON_READONLY_DATABASE_URL
 *   - app_rw    -> NEON_APP_DATABASE_URL
 *   - migration -> NEON_MIGRATION_DATABASE_URL
 *   - test      -> NEON_TEST_DATABASE_URL
 *
 * Security invariants:
 *   - Strict TLS verification (rejectUnauthorized: true) enforced on all remote/Neon connections.
 *   - Production / Vercel environments ALWAYS fail closed if credentials are missing and NEVER fall back to PGlite.
 *   - Isolated PGlite is allowed ONLY outside production/Vercel when explicitly requested.
 *   - Owner role names are rejected for normal runtime purposes (readonly / app_rw).
 */
export async function createPostgresExecutor(
  connectionString?: string,
  options: CreatePostgresExecutorOptions = {}
): Promise<PgExecutor> {
  const env = options.env ?? process.env;
  const prod = isProductionEnvironment(env);
  const vercel = isVercelRuntime(env);
  const purpose: PostgresConnectionPurpose = options.purpose ?? 'test';
  const accessMode: RepositoryAccessMode =
    options.accessMode ??
    (purpose === 'readonly' ? 'readonly' : purpose === 'migration' ? 'migration' : 'readwrite');

  const envVarName = getEnvVarNameForPurpose(purpose);
  const rawConn = (connectionString ?? env[envVarName] ?? '').trim();

  // Explicit PGlite opt-in check (strictly forbidden in production / Vercel!)
  const explicitPgliteRequested =
    options.allowPglite === true ||
    options.requireNeonRemote === false ||
    env.ALLOW_PGLITE_FALLBACK === 'true';

  if (prod && !rawConn) {
    throw new DatabaseConfigurationError(
      'POSTGRES_CREDENTIALS_MISSING',
      `${envVarName} is required in production/Vercel for "${purpose}" access. Refusing silent fallback to PGlite or SQLite.`,
      { envVarName, purpose }
    );
  }

  if (prod && options.allowPglite === true) {
    throw new DatabaseConfigurationError(
      'PRODUCTION_PGLITE_FORBIDDEN',
      'In-memory PGlite is strictly disabled in production and Vercel environments.',
      { envVarName, purpose }
    );
  }

  const looksLikePlaceholder = isPlaceholderConnectionString(rawConn);

  if (prod && looksLikePlaceholder) {
    throw new DatabaseConfigurationError(
      'POSTGRES_PLACEHOLDER_URL',
      `${envVarName} contains a placeholder value in production/Vercel. Configure a real least-privilege Neon connection URI.`,
      { envVarName, purpose }
    );
  }

  if (!looksLikePlaceholder) {
    const { validated, timeouts, poolConfig } = buildPgPoolConfig(rawConn, {
      purpose,
      env,
      timeouts: options.timeouts,
      maxPoolSize: options.maxPoolSize,
      rejectOwnerRole: options.rejectOwnerRole
    });

    const useServerless =
      options.useServerlessDriver !== undefined
        ? options.useServerlessDriver
        : vercel && validated.isNeonHost && purpose !== 'migration';

    const pool: any = useServerless
      ? (() => {
          neonConfig.pipelineConnect = false;
          return new NeonPool({
            connectionString: poolConfig.connectionString,
            max: poolConfig.max,
            idleTimeoutMillis: poolConfig.idleTimeoutMillis,
            connectionTimeoutMillis: poolConfig.connectionTimeoutMillis
          });
        })()
      : new PgPool(poolConfig);

    const sessionInitStatements = buildSessionInitSql(accessMode, timeouts);

    pool.on('error', (err: any) => {
      const safeMsg = redactSensitiveData(err?.message || 'Unexpected idle PostgreSQL client error');
      recordOperationalEvent({
        category: 'DB_CONNECTION_ERROR',
        severity: 'ERROR',
        component: `postgres-pool:${purpose}`,
        message: safeMsg
      });
    });

    const applySessionGuards = async (client: any) => {
      for (const stmt of sessionInitStatements) {
        await client.query(stmt);
      }
    };

    const executor: PgExecutor = {
      isNeonRemote: true,
      accessMode,
      backend: 'neon-postgres',
      purpose,
      async query<T = any>(sql: string, params: any[] = []) {
        const client = await pool.connect();
        try {
          await applySessionGuards(client);
          const res = await client.query(sql, params);
          return { rows: res.rows as T[], rowCount: res.rowCount ?? res.rows.length };
        } catch (err: any) {
          const safeMsg = redactSensitiveData(err?.message || 'PostgreSQL query error');
          recordOperationalEvent({
            category: 'DB_CONNECTION_ERROR',
            severity: 'ERROR',
            component: `postgres-query:${purpose}`,
            message: safeMsg
          });
          throw new Error(safeMsg);
        } finally {
          client.release();
        }
      },
      async transaction<T>(fn: (tx: PgExecutor) => Promise<T>): Promise<T> {
        const client = await pool.connect();
        try {
          await applySessionGuards(client);
          await client.query(accessMode === 'readonly' ? 'BEGIN READ ONLY' : 'BEGIN');
          const txExec: PgExecutor = {
            isNeonRemote: true,
            accessMode,
            backend: 'neon-postgres',
            purpose,
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
        } catch (err: any) {
          try {
            await client.query('ROLLBACK');
          } catch {
            // Ignore secondary rollback failure on broken socket
          }
          const safeMsg = redactSensitiveData(err?.message || 'PostgreSQL transaction error');
          throw new Error(safeMsg);
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

  // If credentials are missing or placeholder:
  if (prod || !explicitPgliteRequested) {
    throw new DatabaseConfigurationError(
      'REMOTE_NEON_REQUIRED',
      `${envVarName} is not present or empty for "${purpose}" access. Refusing silent fallback to PGlite or SQLite.`,
      { envVarName, purpose }
    );
  }

  // Explicit isolated in-process PGlite PostgreSQL engine (test / non-production dev ONLY)
  const pglite = new PGlite();
  await pglite.waitReady;

  const timeouts = resolvePostgresTimeouts(options.timeouts);
  const sessionInitStatements = buildSessionInitSql(accessMode, timeouts);
  for (const stmt of sessionInitStatements) {
    try {
      await pglite.query(stmt);
    } catch {
      // Some session GUCs (e.g. lock_timeout) may vary in WASM PGlite; enforce read-only explicitly below
    }
  }

  let txLock: Promise<any> = Promise.resolve();

  const executor: PgExecutor = {
    isNeonRemote: false,
    accessMode,
    backend: 'pglite-test',
    purpose,
    async query<T = any>(sql: string, params: any[] = []) {
      const res = await pglite.query<T>(sql, params);
      return { rows: res.rows, rowCount: res.affectedRows ?? res.rows.length };
    },
    async transaction<T>(fn: (tx: PgExecutor) => Promise<T>): Promise<T> {
      const runTx = async () => {
        await pglite.query(accessMode === 'readonly' ? 'BEGIN READ ONLY' : 'BEGIN');
        try {
          const txExec: PgExecutor = {
            isNeonRemote: false,
            accessMode,
            backend: 'pglite-test',
            purpose,
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
 * PostgreSQL Repository implementing the unified VisaApply.org async data contracts
 * with strict access-mode enforcement (readonly / readwrite / migration).
 */
export class PostgresImmigrationRepository implements MigrationCapableRepository {
  public readonly backend: DatabaseBackendKind;
  public readonly accessMode: RepositoryAccessMode;

  constructor(public readonly pg: PgExecutor) {
    this.backend = pg.backend;
    this.accessMode = pg.accessMode;
  }

  private assertWritable(operation: string): void {
    if (this.pg.accessMode === 'readonly') {
      throw new Error(
        `READONLY_REPOSITORY_WRITE_DENIED: Cannot execute "${operation}" on a read-only PostgreSQL repository.`
      );
    }
  }

  private assertMigrationAllowed(operation: string): void {
    if (this.pg.accessMode === 'readonly') {
      throw new Error(
        `READONLY_REPOSITORY_DDL_DENIED: Cannot execute "${operation}" on a read-only PostgreSQL repository.`
      );
    }
    if (this.pg.isNeonRemote && this.pg.accessMode !== 'migration') {
      throw new Error(
        `RUNTIME_DDL_FORBIDDEN: Cannot execute "${operation}" using runtime role "${this.pg.purpose}". Use NEON_MIGRATION_DATABASE_URL via an authorized migration runner.`
      );
    }
  }

  async close(): Promise<void> {
    await this.pg.close();
  }

  async applyPhase31Migrations(): Promise<void> {
    this.assertMigrationAllowed('applyPhase31Migrations');
    const statements = splitSqlStatements(POSTGRES_PHASE_3_1_MIGRATION_DDL);
    for (const stmt of statements) {
      await this.pg.query(stmt);
    }
  }

  async runTrackedMigrations(
    migrations: PgMigrationDefinition[] = POSTGRES_MIGRATIONS
  ): Promise<{ newlyApplied: string[]; alreadyApplied: string[] }> {
    this.assertMigrationAllowed('runTrackedMigrations');
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
    this.assertWritable('saveBatchStateToDb');
    const nowStr = new Date().toISOString();
    const safeLastError = state.retryAndMissedRunHandling?.lastError
      ? redactSensitiveData(String(state.retryAndMissedRunHandling.lastError))
      : null;
    const safeAuditLogsJson = JSON.stringify(redactSensitiveData(state.auditLogs || []));

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
        safeLastError,
        safeAuditLogsJson,
        nowStr
      ]
    );
  }

  async getImmigrationProgram(programId: string, exec: PgExecutor = this.pg): Promise<any | null> {
    const { rows } = await exec.query('SELECT * FROM immigration_programs WHERE id = $1', [programId]);
    return rows[0] || null;
  }

  async getAllImmigrationPrograms(exec: PgExecutor = this.pg): Promise<any[]> {
    const { rows } = await exec.query('SELECT * FROM immigration_programs ORDER BY id ASC');
    return rows;
  }

  async saveImmigrationProgram(prog: any): Promise<void> {
    this.assertWritable('saveImmigrationProgram');
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
        country_code = EXCLUDED.country_code,
        category = EXCLUDED.category,
        official_name = EXCLUDED.official_name,
        local_language_name = EXCLUDED.local_language_name,
        legal_basis = EXCLUDED.legal_basis,
        classification_type = EXCLUDED.classification_type,
        eligibility = EXCLUDED.eligibility,
        nationality_restrictions = EXCLUDED.nationality_restrictions,
        age_requirements = EXCLUDED.age_requirements,
        education_requirements = EXCLUDED.education_requirements,
        work_experience_requirements = EXCLUDED.work_experience_requirements,
        min_salary_or_income = EXCLUDED.min_salary_or_income,
        investment_requirement = EXCLUDED.investment_requirement,
        required_funds_and_proof = EXCLUDED.required_funds_and_proof,
        residency_duration = EXCLUDED.residency_duration,
        renewal_rules = EXCLUDED.renewal_rules,
        pr_or_citizenship_transition = EXCLUDED.pr_or_citizenship_transition,
        family_inclusion_rules = EXCLUDED.family_inclusion_rules,
        work_and_study_rights = EXCLUDED.work_and_study_rights,
        restrictions_and_exceptions = EXCLUDED.restrictions_and_exceptions,
        required_documents_json = EXCLUDED.required_documents_json,
        documents_and_formats = EXCLUDED.documents_and_formats,
        translation_attestation_requirements = EXCLUDED.translation_attestation_requirements,
        application_procedure = EXCLUDED.application_procedure,
        government_fees = EXCLUDED.government_fees,
        processing_time = EXCLUDED.processing_time,
        apply_from = EXCLUDED.apply_from,
        official_application_url = EXCLUDED.official_application_url,
        official_information_url = EXCLUDED.official_information_url,
        source_authority = EXCLUDED.source_authority,
        source_last_updated = EXCLUDED.source_last_updated,
        last_checked_date = EXCLUDED.last_checked_date,
        verification_evidence = EXCLUDED.verification_evidence,
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

  async saveChangelogEntryToDb(entry: any): Promise<void> {
    this.assertWritable('saveChangelogEntryToDb');
    await this.pg.query(
      `
      INSERT INTO changelog_entries (
        id, date, country_code, country_name, change_type, title,
        old_value, new_value, source_url, auto_blog_slug, email_notified, verified_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT(id) DO UPDATE SET
        date = EXCLUDED.date,
        country_code = EXCLUDED.country_code,
        country_name = EXCLUDED.country_name,
        change_type = EXCLUDED.change_type,
        title = EXCLUDED.title,
        old_value = EXCLUDED.old_value,
        new_value = EXCLUDED.new_value,
        source_url = EXCLUDED.source_url,
        auto_blog_slug = EXCLUDED.auto_blog_slug,
        email_notified = EXCLUDED.email_notified,
        verified_by = EXCLUDED.verified_by
      `,
      [
        entry.id,
        entry.date,
        entry.countryCode || entry.country_code || '',
        entry.countryName || entry.country_name || '',
        entry.changeType || entry.change_type || '',
        entry.title || '',
        entry.oldValue ?? entry.old_value ?? '',
        entry.newValue ?? entry.new_value ?? '',
        entry.sourceUrl || entry.source_url || '',
        entry.autoBlogSlug || entry.auto_blog_slug || '',
        redactSensitiveData(String(entry.emailNotified ?? entry.email_notified ?? '')),
        entry.verifiedBy || entry.verified_by || '',
        entry.createdAt || entry.created_at || new Date().toISOString()
      ]
    );
  }

  async getChangelogFromDb(exec: PgExecutor = this.pg): Promise<any[]> {
    const { rows } = await exec.query('SELECT * FROM changelog_entries ORDER BY date DESC, created_at DESC');
    return rows.map((r: any) => ({
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

  async getAllVisaDetails(exec: PgExecutor = this.pg): Promise<any[]> {
    const { rows } = await exec.query('SELECT * FROM visa_details ORDER BY id ASC');
    return rows.map((r) => this.mapVisaDetailRow(r));
  }

  async getPaginatedVisaDetails(
    page: number,
    limit: number,
    search: string = '',
    status: string = '',
    _category: string = ''
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
    this.assertWritable('saveVisaDetails');
    const lastUpdated = details.lastUpdated || new Date().toISOString();
    const verificationStatus = details.verificationStatus || 'VERIFIED';
    const normalizedComp = normalizeVisaDetailTo30Sections({
      ...details,
      lastUpdated,
      verificationStatus
    });

    // Normalize vd- identifier consistently with SQLite (sqliteCore.ts)
    const recordId =
      details.id && (!String(details.id).startsWith('vd-') || details.id === `vd-${details.programId}`)
        ? details.id
        : `vd-${details.programId}`;

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
      ]
    );
  }

  async updateVisaStatus(programId: string, status: string, exec: PgExecutor = this.pg): Promise<void> {
    this.assertWritable('updateVisaStatus');
    await exec.query('UPDATE visa_details SET verification_status = $1 WHERE program_id = $2', [
      status,
      programId
    ]);
  }

  async getVisaClaims(programId: string, exec: PgExecutor = this.pg): Promise<any[]> {
    const { rows } = await exec.query(
      'SELECT * FROM visa_detail_claims WHERE program_id = $1 ORDER BY section ASC, description ASC',
      [programId]
    );
    return rows.map((r: any) => ({
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

  async getVisaClaimById(claimId: string, exec: PgExecutor = this.pg): Promise<any | null> {
    const { rows } = await exec.query('SELECT * FROM visa_detail_claims WHERE id = $1', [claimId]);
    const r = rows[0];
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

  async getVisaEvidence(claimId: string, exec: PgExecutor = this.pg): Promise<any[]> {
    const { rows } = await exec.query('SELECT * FROM visa_detail_evidence WHERE claim_id = $1', [claimId]);
    return rows.map((r: any) => ({
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

  async getVisaClaimsWithEvidence(
    programId: string,
    execOrNationality?: PgExecutor | string,
    targetNationality?: string
  ): Promise<any[]> {
    const exec: PgExecutor =
      execOrNationality && typeof execOrNationality !== 'string' ? execOrNationality : this.pg;
    const resolvedNationality =
      typeof execOrNationality === 'string' ? execOrNationality : targetNationality;

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
        targetNationality: resolvedNationality
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
    this.assertWritable('reconcileClaimVerificationAfterEvidenceChange');
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
    this.assertWritable('saveVisaClaim');
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
    this.assertWritable('deleteVisaClaim');
    const runDelete = async (targetExec: PgExecutor) => {
      await targetExec.query('DELETE FROM visa_detail_evidence WHERE claim_id = $1', [claimId]);
      await targetExec.query('DELETE FROM visa_detail_claims WHERE id = $1', [claimId]);
    };
    if (exec) return runDelete(exec);
    return this.pg.transaction(runDelete);
  }

  async saveVisaEvidence(
    evidence: any,
    execOrOptions?: PgExecutor | { skipReconcile?: boolean },
    options?: { skipReconcile?: boolean }
  ): Promise<{ downgradedClaim?: boolean; newClaimStatus?: string; versionId?: string }> {
    this.assertWritable('saveVisaEvidence');
    const isExec = Boolean(execOrOptions && typeof (execOrOptions as PgExecutor).query === 'function');
    const exec = isExec ? (execOrOptions as PgExecutor) : undefined;
    const resolvedOptions = isExec ? options : (execOrOptions as { skipReconcile?: boolean } | undefined) ?? options;

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

      if (!resolvedOptions?.skipReconcile && claimId) {
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
    this.assertWritable('deleteVisaEvidence');
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
    this.assertWritable('saveVisaVersion');
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
    this.assertWritable('restoreVersion');
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

  async logCronExecutionToDb(log: CronExecutionLogInput): Promise<string> {
    this.assertWritable('logCronExecutionToDb');
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
    this.assertWritable('acquireJobLock');
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
    this.assertWritable('releaseJobLock');
    const res = await this.pg.query('DELETE FROM automation_job_locks WHERE lock_key = $1 AND owner_id = $2', [
      lockKey,
      ownerId
    ]);
    return res.rowCount > 0;
  }

  async saveAutomationCheckpoint(cp: AutomationCheckpointInput): Promise<void> {
    this.assertWritable('saveAutomationCheckpoint');
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

  async recordDeadLetterItem(item: DeadLetterItemInput): Promise<string> {
    this.assertWritable('recordDeadLetterItem');
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

  async insertOperationalEvent(event: OperationalEvent): Promise<void> {
    this.assertWritable('insertOperationalEvent');
    await this.pg.query(
      `INSERT INTO operational_events (id, timestamp, category, severity, component, message, details_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT(id) DO NOTHING`,
      [
        event.id,
        event.timestamp,
        event.category,
        event.severity,
        redactSensitiveData(event.component),
        redactSensitiveData(event.message),
        JSON.stringify(redactSensitiveData(event.details || {}))
      ]
    );
  }

  async getOperationalEvents(limit: number = 50): Promise<OperationalEvent[]> {
    const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
    const { rows } = await this.pg.query(
      'SELECT * FROM operational_events ORDER BY timestamp DESC LIMIT $1',
      [safeLimit]
    );
    return rows.map((r: any) => ({
      id: r.id,
      timestamp: r.timestamp,
      category: r.category,
      severity: r.severity,
      component: r.component,
      message: redactSensitiveData(String(r.message || '')),
      details: JSON.parse(r.details_json || '{}')
    }));
  }

  async auditIntegrity(): Promise<DatabaseIntegritySummary> {
    const [appliedRes, dupRes, orphanDetRes, orphanClmRes, orphanEvRes, orphanVerRes, staleLockRes] =
      await Promise.all([
        this.pg.query<{ count: string }>('SELECT COUNT(*) AS count FROM schema_migrations'),
        this.pg.query<{ program_id: string; count: string }>(
          'SELECT program_id, COUNT(*) AS count FROM visa_details GROUP BY program_id HAVING COUNT(*) > 1'
        ),
        this.pg.query<{ count: string }>(
          'SELECT COUNT(*) AS count FROM visa_details d LEFT JOIN immigration_programs p ON d.program_id = p.id WHERE p.id IS NULL'
        ),
        this.pg.query<{ count: string }>(
          'SELECT COUNT(*) AS count FROM visa_detail_claims c LEFT JOIN immigration_programs p ON c.program_id = p.id WHERE p.id IS NULL'
        ),
        this.pg.query<{ count: string }>(
          'SELECT COUNT(*) AS count FROM visa_detail_evidence e LEFT JOIN visa_detail_claims c ON e.claim_id = c.id WHERE c.id IS NULL'
        ),
        this.pg.query<{ count: string }>(
          'SELECT COUNT(*) AS count FROM visa_detail_versions v LEFT JOIN immigration_programs p ON v.program_id = p.id WHERE p.id IS NULL'
        ),
        this.pg.query<{ count: string }>(
          'SELECT COUNT(*) AS count FROM automation_job_locks WHERE expires_at < $1',
          [new Date().toISOString()]
        )
      ]);

    const appliedMigrationsCount = Number(appliedRes.rows[0]?.count || 0);
    const duplicates = dupRes.rows.map((r) => ({ programId: r.program_id, count: Number(r.count) }));
    const orphans = {
      visaDetailsWithoutProgram: Number(orphanDetRes.rows[0]?.count || 0),
      claimsWithoutProgram: Number(orphanClmRes.rows[0]?.count || 0),
      evidenceWithoutClaim: Number(orphanEvRes.rows[0]?.count || 0),
      versionsWithoutProgram: Number(orphanVerRes.rows[0]?.count || 0)
    };
    const staleLocksCount = Number(staleLockRes.rows[0]?.count || 0);
    const ok =
      duplicates.length === 0 &&
      orphans.visaDetailsWithoutProgram === 0 &&
      orphans.claimsWithoutProgram === 0 &&
      orphans.evidenceWithoutClaim === 0 &&
      orphans.versionsWithoutProgram === 0;

    return {
      backend: this.backend,
      ok,
      appliedMigrationsCount,
      expectedMigrationsCount: POSTGRES_MIGRATIONS.length,
      duplicates: { visaDetailsProgramId: duplicates },
      orphans,
      staleLocksCount
    };
  }

  // --- Migration 004 Serverless Unified Store Methods ---

  async getSlotSubscriberCount(activeOnly: boolean = true): Promise<number> {
    const { rows } = activeOnly
      ? await this.pg.query<{ count: string }>('SELECT COUNT(*) AS count FROM slot_subscribers WHERE is_active = 1')
      : await this.pg.query<{ count: string }>('SELECT COUNT(*) AS count FROM slot_subscribers');
    return Number(rows[0]?.count || 0);
  }

  async getSlotSubscribers(activeOnly: boolean = true): Promise<SlotSubscriberRecord[]> {
    const { rows } = activeOnly
      ? await this.pg.query('SELECT * FROM slot_subscribers WHERE is_active = 1 ORDER BY subscribed_at DESC')
      : await this.pg.query('SELECT * FROM slot_subscribers ORDER BY subscribed_at DESC');
    return rows.map((r: any) => ({
      id: r.id,
      email: r.email,
      country: r.country,
      city: r.city,
      visaType: r.visa_type,
      language: r.language || 'en',
      subscribedAt: r.subscribed_at,
      lastNotifiedAt: r.last_notified_at ?? null,
      isActive: Boolean(r.is_active)
    }));
  }

  async saveSlotSubscriber(
    sub: Omit<SlotSubscriberRecord, 'subscribedAt' | 'isActive'> & { subscribedAt?: string; isActive?: boolean }
  ): Promise<void> {
    this.assertWritable('saveSlotSubscriber');
    const normalizedEmail = String(sub.email || '').trim().toLowerCase();
    const nowIso = sub.subscribedAt || new Date().toISOString();
    await this.pg.query(
      `INSERT INTO slot_subscribers (
         id, email, country, city, visa_type, language, subscribed_at, last_notified_at, is_active
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         country = EXCLUDED.country,
         city = EXCLUDED.city,
         visa_type = EXCLUDED.visa_type,
         language = EXCLUDED.language,
         last_notified_at = EXCLUDED.last_notified_at,
         is_active = EXCLUDED.is_active`,
      [
        sub.id,
        normalizedEmail,
        sub.country,
        sub.city,
        sub.visaType,
        sub.language || 'en',
        nowIso,
        sub.lastNotifiedAt ?? null,
        sub.isActive === false ? 0 : 1
      ]
    );
  }

  async deactivateSlotSubscriber(id: string): Promise<boolean> {
    this.assertWritable('deactivateSlotSubscriber');
    const res = await this.pg.query('UPDATE slot_subscribers SET is_active = 0 WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  async getSlotEmbassyStatuses(): Promise<SlotEmbassyStatusRecord[]> {
    const { rows } = await this.pg.query('SELECT * FROM slot_embassy_status ORDER BY embassy_key ASC');
    return rows.map((r: any) => ({
      embassyKey: r.embassy_key,
      country: r.country,
      city: r.city || '',
      status: r.status,
      earliestDate: r.earliest_date ?? null,
      bookingLink: r.booking_link ?? null,
      lastCheckedAt: r.last_checked_at,
      updatedAt: r.updated_at
    }));
  }

  async upsertSlotEmbassyStatus(
    entry: Omit<SlotEmbassyStatusRecord, 'updatedAt'> & { updatedAt?: string }
  ): Promise<void> {
    this.assertWritable('upsertSlotEmbassyStatus');
    const nowIso = entry.updatedAt || new Date().toISOString();
    await this.pg.query(
      `INSERT INTO slot_embassy_status (
         embassy_key, country, city, status, earliest_date, booking_link, last_checked_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (embassy_key) DO UPDATE SET
         country = EXCLUDED.country,
         city = EXCLUDED.city,
         status = EXCLUDED.status,
         earliest_date = EXCLUDED.earliest_date,
         booking_link = EXCLUDED.booking_link,
         last_checked_at = EXCLUDED.last_checked_at,
         updated_at = EXCLUDED.updated_at`,
      [
        entry.embassyKey,
        entry.country,
        entry.city || '',
        entry.status,
        entry.earliestDate ?? null,
        entry.bookingLink ?? null,
        entry.lastCheckedAt,
        nowIso
      ]
    );
  }

  async logSlotEmailDelivery(entry: SlotEmailLogRecord): Promise<void> {
    this.assertWritable('logSlotEmailDelivery');
    await this.pg.query(
      `INSERT INTO slot_email_logs (id, embassy_key, recipient_hash, status, provider_message_id, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [
        entry.id,
        entry.embassyKey,
        entry.recipientHash,
        entry.status,
        entry.providerMessageId ?? null,
        entry.sentAt
      ]
    );
  }

  async getSlotEmailLogs(limit: number = 50): Promise<SlotEmailLogRecord[]> {
    const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
    const { rows } = await this.pg.query('SELECT * FROM slot_email_logs ORDER BY sent_at DESC LIMIT $1', [safeLimit]);
    return rows.map((r: any) => ({
      id: r.id,
      embassyKey: r.embassy_key,
      recipientHash: r.recipient_hash,
      status: r.status,
      providerMessageId: r.provider_message_id ?? null,
      sentAt: r.sent_at
    }));
  }

  async getEditorialArticles(status?: EditorialArticleStatus): Promise<EditorialArticleRecord[]> {
    const { rows } = status
      ? await this.pg.query('SELECT * FROM editorial_articles WHERE status = $1 ORDER BY updated_at DESC', [status])
      : await this.pg.query('SELECT * FROM editorial_articles ORDER BY updated_at DESC');
    return rows.map((r: any) => ({
      slug: r.slug,
      status: r.status,
      title: r.title,
      frontmatter: JSON.parse(r.frontmatter_json || '{}'),
      markdownBody: r.markdown_body,
      sourceOrigin: r.source_origin ?? null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      publishedAt: r.published_at ?? null
    }));
  }

  async getEditorialArticleBySlug(slug: string): Promise<EditorialArticleRecord | null> {
    const { rows } = await this.pg.query('SELECT * FROM editorial_articles WHERE slug = $1', [slug]);
    const r = rows[0];
    if (!r) return null;
    return {
      slug: r.slug,
      status: r.status,
      title: r.title,
      frontmatter: JSON.parse(r.frontmatter_json || '{}'),
      markdownBody: r.markdown_body,
      sourceOrigin: r.source_origin ?? null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      publishedAt: r.published_at ?? null
    };
  }

  async saveEditorialArticle(
    article: Omit<EditorialArticleRecord, 'createdAt' | 'updatedAt'> & { createdAt?: string; updatedAt?: string }
  ): Promise<void> {
    this.assertWritable('saveEditorialArticle');
    const nowIso = new Date().toISOString();
    await this.pg.query(
      `INSERT INTO editorial_articles (
         slug, status, title, frontmatter_json, markdown_body, source_origin, created_at, updated_at, published_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (slug) DO UPDATE SET
         status = EXCLUDED.status,
         title = EXCLUDED.title,
         frontmatter_json = EXCLUDED.frontmatter_json,
         markdown_body = EXCLUDED.markdown_body,
         source_origin = EXCLUDED.source_origin,
         updated_at = EXCLUDED.updated_at,
         published_at = EXCLUDED.published_at`,
      [
        article.slug,
        article.status,
        article.title,
        JSON.stringify(article.frontmatter || {}),
        article.markdownBody,
        article.sourceOrigin ?? null,
        article.createdAt || nowIso,
        article.updatedAt || nowIso,
        article.publishedAt ?? (article.status === 'published' ? nowIso : null)
      ]
    );
  }

  async deleteEditorialArticle(slug: string): Promise<boolean> {
    this.assertWritable('deleteEditorialArticle');
    const res = await this.pg.query('DELETE FROM editorial_articles WHERE slug = $1', [slug]);
    return res.rowCount > 0;
  }

  async revokeAdminSessionJti(jti: string, expiresAt: string): Promise<void> {
    this.assertWritable('revokeAdminSessionJti');
    await this.pg.query(
      `INSERT INTO admin_revoked_sessions (jti, revoked_at, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (jti) DO UPDATE SET
         revoked_at = EXCLUDED.revoked_at,
         expires_at = EXCLUDED.expires_at`,
      [jti, new Date().toISOString(), expiresAt]
    );
  }

  async isAdminSessionRevoked(jti: string): Promise<boolean> {
    const { rows } = await this.pg.query<{ jti: string }>(
      'SELECT jti FROM admin_revoked_sessions WHERE jti = $1 AND expires_at > $2',
      [jti, new Date().toISOString()]
    );
    return rows.length > 0;
  }

  async pruneExpiredRevokedSessions(nowIso: string = new Date().toISOString()): Promise<number> {
    this.assertWritable('pruneExpiredRevokedSessions');
    const res = await this.pg.query('DELETE FROM admin_revoked_sessions WHERE expires_at <= $1', [nowIso]);
    return res.rowCount;
  }
}

