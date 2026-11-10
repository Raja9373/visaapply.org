import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(process.cwd(), 'data_db');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'immigration_hub.db');

export const db = new Database(DB_PATH);

// Enable Write-Ahead Logging (WAL) for safe concurrent reads & writes
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

/**
 * Initialize database schema
 */
export function initDatabaseSchema() {
  db.exec(`
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
  `);
}

initDatabaseSchema();

// Helper statement getters
export function getBatchStateFromDb() {
  try {
    const row = db.prepare('SELECT * FROM batch_state WHERE id = 1').get() as any;
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
  } catch (e) {
    return null;
  }
}

export function saveBatchStateToDb(state: any) {
  const stmt = db.prepare(`
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

  const nowStr = new Date().toISOString();
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
    state.retryAndMissedRunHandling?.lastError || null,
    JSON.stringify(state.auditLogs || []),
    nowStr
  );
}

export function saveChangelogEntryToDb(entry: any) {
  const stmt = db.prepare(`
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
    entry.emailNotified,
    entry.verifiedBy,
    new Date().toISOString()
  );
}

export function getChangelogFromDb(): any[] {
  try {
    const rows = db.prepare('SELECT * FROM changelog_entries ORDER BY date DESC, created_at DESC').all() as any[];
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
  } catch (e) {
    return [];
  }
}

export function logCronExecutionToDb(log: {
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
  const stmt = db.prepare(`
    INSERT INTO cron_execution_logs (
      id, timestamp, cron_name, http_method, target_countries, status,
      checked_count, updates_found, log_message, execution_duration_ms, missed_run_resumed, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const id = `cron-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const nowStr = new Date().toISOString();

  stmt.run(
    id,
    nowStr,
    log.cronName,
    log.httpMethod,
    JSON.stringify(log.targetCountries || []),
    log.status,
    log.checkedCount,
    log.updatesFound,
    log.logMessage,
    log.executionDurationMs,
    log.missedRunResumed ? 1 : 0,
    nowStr
  );
}

export function getCronExecutionLogsFromDb(limit: number = 20): any[] {
  try {
    const rows = db.prepare('SELECT * FROM cron_execution_logs ORDER BY timestamp DESC LIMIT ?').all(limit) as any[];
    return rows.map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      cronName: r.cron_name,
      httpMethod: r.http_method,
      targetCountries: JSON.parse(r.target_countries || '[]'),
      status: r.status,
      checkedCount: r.checked_count,
      updatesFound: r.updates_found,
      logMessage: r.log_message,
      executionDurationMs: r.execution_duration_ms,
      missedRunResumed: Boolean(r.missed_run_resumed)
    }));
  } catch (e) {
    return [];
  }
}
