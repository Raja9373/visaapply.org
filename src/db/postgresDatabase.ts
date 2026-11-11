import pg from 'pg';
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { PGlite } from '@electric-sql/pglite';

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
  review_timestamp TEXT
);
CREATE INDEX IF NOT EXISTS idx_pg_claims_program ON visa_detail_claims(program_id);

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

    const executor: PgExecutor = {
      isNeonRemote: true,
      async query<T = any>(sql: string, params: any[] = []) {
        const res = await pool.query(sql, params);
        return { rows: res.rows as T[], rowCount: res.rowCount ?? res.rows.length };
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

  async initSchema(): Promise<void> {
    const statements = POSTGRES_ENRICHMENT_SCHEMA_DDL.split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    for (const stmt of statements) {
      await this.pg.query(stmt);
    }
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
    return {
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
    await exec.query(
      `
      INSERT INTO visa_details (
        id, program_id, country_overview_json, visa_overview_json, eligibility_json,
        financial_json, document_checklist_json, application_fields_json,
        application_steps_json, interview_prep_json, embassy_directory_json,
        refusal_appeal_json, after_approval_json, cost_calculator_json,
        faq_json, legal_evidence_json, last_updated, verification_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
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
        details.lastUpdated || new Date().toISOString(),
        details.verificationStatus || 'VERIFIED'
      ]
    );
  }

  async updateVisaStatus(programId: string, status: string, exec: PgExecutor = this.pg): Promise<void> {
    await exec.query('UPDATE visa_details SET verification_status = $1 WHERE program_id = $2', [
      status,
      programId
    ]);
  }

  async getVisaClaimsWithEvidence(programId: string, exec: PgExecutor = this.pg): Promise<any[]> {
    // Optimized 2-query batch fetch (avoids N+1 queries)
    const claimsRes = await exec.query(
      'SELECT * FROM visa_detail_claims WHERE program_id = $1 ORDER BY section ASC, description ASC',
      [programId]
    );
    if (claimsRes.rows.length === 0) return [];

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
        status: r.status || 'NEEDS_REVIEW'
      });
    }

    return claimsRes.rows.map((r: any) => ({
      id: r.id,
      programId: r.program_id,
      section: r.section,
      description: r.description,
      value: r.value,
      unit: r.unit,
      status: r.status,
      reviewer: r.reviewer,
      reviewTimestamp: r.review_timestamp,
      evidence: evByClaim[r.id] || []
    }));
  }

  async saveVisaClaim(claim: any, exec: PgExecutor = this.pg): Promise<void> {
    await exec.query(
      `
      INSERT INTO visa_detail_claims (id, program_id, section, description, value, unit, status, reviewer, review_timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT(id) DO UPDATE SET
        section = EXCLUDED.section,
        description = EXCLUDED.description,
        value = EXCLUDED.value,
        unit = EXCLUDED.unit,
        status = EXCLUDED.status,
        reviewer = EXCLUDED.reviewer,
        review_timestamp = EXCLUDED.review_timestamp
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
        claim.reviewTimestamp || claim.review_timestamp || new Date().toISOString()
      ]
    );
  }

  async deleteVisaClaim(claimId: string, exec: PgExecutor = this.pg): Promise<void> {
    await exec.query('DELETE FROM visa_detail_evidence WHERE claim_id = $1', [claimId]);
    await exec.query('DELETE FROM visa_detail_claims WHERE id = $1', [claimId]);
  }

  async saveVisaEvidence(evidence: any, exec: PgExecutor = this.pg): Promise<void> {
    await exec.query(
      `
      INSERT INTO visa_detail_evidence (
        id, claim_id, source_url, legal_instrument, effective_date, last_checked_date,
        source_title, issuing_authority, publication_date, access_date, reviewer_notes, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
        status = EXCLUDED.status
      `,
      [
        evidence.id,
        evidence.claimId || evidence.claim_id,
        evidence.sourceUrl || evidence.source_url || '',
        evidence.legalInstrument || evidence.legal_instrument || '',
        evidence.effectiveDate || evidence.effective_date || '',
        evidence.lastCheckedDate || evidence.last_checked_date || new Date().toISOString().split('T')[0],
        evidence.sourceTitle || evidence.source_title || '',
        evidence.issuingAuthority || evidence.issuing_authority || '',
        evidence.publicationDate || evidence.publication_date || '',
        evidence.accessDate || evidence.access_date || new Date().toISOString().split('T')[0],
        evidence.reviewerNotes || evidence.reviewer_notes || '',
        evidence.status || 'NEEDS_REVIEW'
      ]
    );
  }

  async deleteVisaEvidence(evidenceId: string, exec: PgExecutor = this.pg): Promise<void> {
    await exec.query('DELETE FROM visa_detail_evidence WHERE id = $1', [evidenceId]);
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
              await this.saveVisaEvidence({ ...ev, claimId: c.id }, tx);
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
}
