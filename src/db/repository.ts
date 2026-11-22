import type { OperationalEvent } from '../utils/operationalObservability';

export type DatabaseBackendKind = 'neon-postgres' | 'pglite-test' | 'sqlite-local';
export type RepositoryAccessMode = 'readonly' | 'readwrite' | 'migration';

export interface AppliedMigrationInfo {
  version: string;
  name: string;
  checksum: string;
  appliedAt: string;
  rollbackNotes: string;
}

export interface DatabaseIntegritySummary {
  backend: DatabaseBackendKind;
  ok: boolean;
  appliedMigrationsCount: number;
  expectedMigrationsCount: number;
  duplicates: {
    visaDetailsProgramId: Array<{ programId: string; count: number }>;
  };
  orphans: {
    visaDetailsWithoutProgram: number;
    claimsWithoutProgram: number;
    evidenceWithoutClaim: number;
    versionsWithoutProgram: number;
  };
  staleLocksCount: number;
}

export interface CronExecutionLogInput {
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
}

export interface AutomationCheckpointInput {
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
}

export interface DeadLetterItemInput {
  id?: string;
  jobName: string;
  runId: string;
  targetKey: string;
  failureClass: string;
  errorMessage: string;
  payload?: Record<string, unknown>;
  retryCount?: number;
  status?: string;
}

export interface SlotSubscriberRecord {
  id: string;
  email: string;
  country: string;
  city: string;
  visaType: string;
  language: string;
  subscribedAt: string;
  lastNotifiedAt?: string | null;
  isActive: boolean;
}

export interface SlotEmbassyStatusRecord {
  embassyKey: string;
  country: string;
  city: string;
  status: string;
  earliestDate?: string | null;
  bookingLink?: string | null;
  lastCheckedAt: string;
  updatedAt: string;
}

export interface SlotEmailLogRecord {
  id: string;
  embassyKey: string;
  recipientHash: string;
  status: string;
  providerMessageId?: string | null;
  sentAt: string;
}

export type EditorialArticleStatus = 'published' | 'draft' | 'archived';

export interface EditorialArticleRecord {
  slug: string;
  status: EditorialArticleStatus;
  title: string;
  frontmatter: Record<string, unknown>;
  markdownBody: string;
  sourceOrigin?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface AdminRevokedSessionRecord {
  jti: string;
  revokedAt: string;
  expiresAt: string;
}

/**
 * Strictly read-only asynchronous repository contract.
 * Used by public read endpoints and read-only health/audit views via NEON_READONLY_DATABASE_URL.
 */
export interface ReadOnlyImmigrationRepository {
  readonly backend: DatabaseBackendKind;
  readonly accessMode: RepositoryAccessMode;

  getAppliedMigrations(): Promise<AppliedMigrationInfo[]>;
  getBatchStateFromDb(): Promise<any | null>;
  getImmigrationProgram(programId: string): Promise<any | null>;
  getAllImmigrationPrograms(): Promise<any[]>;
  getChangelogFromDb(): Promise<any[]>;
  getCronExecutionLogsFromDb(limit?: number): Promise<any[]>;
  getVisaDetails(programId: string): Promise<any | null>;
  getAllVisaDetails(): Promise<any[]>;
  getPaginatedVisaDetails(
    page: number,
    limit: number,
    search?: string,
    status?: string,
    category?: string
  ): Promise<{ data: any[]; total: number }>;
  getDashboardStats(): Promise<any>;
  getVisaClaims(programId: string): Promise<any[]>;
  getVisaClaimsWithEvidence(programId: string, targetNationality?: string): Promise<any[]>;
  getVisaClaimById(claimId: string): Promise<any | null>;
  getVisaEvidence(claimId: string): Promise<any[]>;
  getVisaVersions(programId: string): Promise<any[]>;
  getAutomationCheckpoint(checkpointId: string): Promise<any | null>;
  getDeadLetterItems(status?: string): Promise<any[]>;
  getOperationalEvents(limit?: number): Promise<OperationalEvent[]>;
  auditIntegrity(): Promise<DatabaseIntegritySummary>;

  // Migration 004 read contracts (serverless unified persistent stores)
  getSlotSubscriberCount(activeOnly?: boolean): Promise<number>;
  getSlotSubscribers(activeOnly?: boolean): Promise<SlotSubscriberRecord[]>;
  getSlotEmbassyStatuses(): Promise<SlotEmbassyStatusRecord[]>;
  getSlotEmailLogs(limit?: number): Promise<SlotEmailLogRecord[]>;
  getEditorialArticles(status?: EditorialArticleStatus): Promise<EditorialArticleRecord[]>;
  getEditorialArticleBySlug(slug: string): Promise<EditorialArticleRecord | null>;
  isAdminSessionRevoked(jti: string): Promise<boolean>;

  close(): Promise<void>;
}

/**
 * Runtime read-write asynchronous repository contract for authorized application writes.
 * Intentionally excludes DDL/schema migration methods so runtime roles cannot mutate schema.
 */
export interface ReadWriteImmigrationRepository extends ReadOnlyImmigrationRepository {
  saveBatchStateToDb(state: any): Promise<void>;
  saveImmigrationProgram(prog: any): Promise<void>;
  saveChangelogEntryToDb(entry: any): Promise<void>;
  logCronExecutionToDb(log: CronExecutionLogInput): Promise<string>;
  saveVisaDetails(details: any): Promise<void>;
  updateVisaStatus(programId: string, status: string): Promise<void>;
  restoreVersion(
    versionId: string,
    editorId?: string
  ): Promise<{ success: boolean; restoredVersionId: string; newVersionId: string }>;
  saveVisaClaim(claim: any): Promise<void>;
  deleteVisaClaim(claimId: string): Promise<void>;
  saveVisaEvidence(
    evidence: any,
    options?: { skipReconcile?: boolean }
  ): Promise<{ downgradedClaim?: boolean; newClaimStatus?: string; versionId?: string }>;
  deleteVisaEvidence(
    evidenceId: string
  ): Promise<{ downgradedClaim?: boolean; newClaimStatus?: string; claimId?: string; versionId?: string }>;
  reconcileClaimVerificationAfterEvidenceChange(
    claimId: string,
    reasonTrigger: string
  ): Promise<{
    downgraded: boolean;
    previousStatus?: string;
    newStatus?: string;
    claimId: string;
    programId?: string;
    versionId?: string;
  }>;
  saveVisaVersion(version: any): Promise<void>;
  acquireJobLock(
    lockKey: string,
    ownerId: string,
    ttlMs?: number,
    metadata?: Record<string, unknown>
  ): Promise<{ acquired: boolean; existingOwner?: string; expiresAt?: string }>;
  releaseJobLock(lockKey: string, ownerId: string): Promise<boolean>;
  saveAutomationCheckpoint(cp: AutomationCheckpointInput): Promise<void>;
  recordDeadLetterItem(item: DeadLetterItemInput): Promise<string>;
  insertOperationalEvent(event: OperationalEvent): Promise<void>;

  // Migration 004 write contracts (serverless unified persistent stores)
  saveSlotSubscriber(sub: Omit<SlotSubscriberRecord, 'subscribedAt' | 'isActive'> & { subscribedAt?: string; isActive?: boolean }): Promise<void>;
  deactivateSlotSubscriber(id: string): Promise<boolean>;
  upsertSlotEmbassyStatus(entry: Omit<SlotEmbassyStatusRecord, 'updatedAt'> & { updatedAt?: string }): Promise<void>;
  logSlotEmailDelivery(entry: SlotEmailLogRecord): Promise<void>;
  saveEditorialArticle(article: Omit<EditorialArticleRecord, 'createdAt' | 'updatedAt'> & { createdAt?: string; updatedAt?: string }): Promise<void>;
  deleteEditorialArticle(slug: string): Promise<boolean>;
  revokeAdminSessionJti(jti: string, expiresAt: string): Promise<void>;
  pruneExpiredRevokedSessions(nowIso?: string): Promise<number>;
}

/**
 * Migration-only repository contract isolated for authorized schema migration runners.
 * Must NEVER be exposed to normal public or admin runtime endpoints.
 */
export interface MigrationCapableRepository extends ReadWriteImmigrationRepository {
  runTrackedMigrations(): Promise<{ newlyApplied: string[]; alreadyApplied: string[] }>;
}

/**
 * Structural subset of the synchronous SQLite repository returned by createSqliteRepository(),
 * allowing an async adapter without importing better-sqlite3 at the top level.
 */
export interface SyncSqliteRepositoryLike {
  db: any;
  eventSink?: { insertOperationalEvent?: (event: OperationalEvent) => void };
  getBatchStateFromDb: () => any | null;
  saveBatchStateToDb: (state: any) => void;
  saveChangelogEntryToDb: (entry: any) => void;
  getChangelogFromDb: () => any[];
  logCronExecutionToDb: (log: CronExecutionLogInput) => string;
  getCronExecutionLogsFromDb: (limit?: number) => any[];
  getVisaDetails: (programId: string) => any | null;
  getAllVisaDetails: () => any[];
  getPaginatedVisaDetails: (
    page: number,
    limit: number,
    search?: string,
    status?: string,
    category?: string
  ) => { data: any[]; total: number };
  saveVisaDetails: (details: any) => void;
  getDashboardStats: () => any;
  updateVisaStatus: (programId: string, status: string) => void;
  restoreVersion: (
    versionId: string,
    editorId?: string
  ) => { success: boolean; restoredVersionId: string; newVersionId: string };
  getVisaClaims: (programId: string) => any[];
  getVisaClaimsWithEvidence: (programId: string, targetNationality?: string) => any[];
  getVisaClaimById: (claimId: string) => any | null;
  reconcileClaimVerificationAfterEvidenceChange: (
    claimId: string,
    reasonTrigger: string
  ) => {
    downgraded: boolean;
    previousStatus?: string;
    newStatus?: string;
    claimId: string;
    programId?: string;
    versionId?: string;
  };
  saveVisaClaim: (claim: any) => void;
  deleteVisaClaim: (claimId: string) => void;
  getVisaEvidence: (claimId: string) => any[];
  saveVisaEvidence: (
    evidence: any,
    options?: { skipReconcile?: boolean }
  ) => { downgradedClaim?: boolean; newClaimStatus?: string; versionId?: string };
  deleteVisaEvidence: (
    evidenceId: string
  ) => { downgradedClaim?: boolean; newClaimStatus?: string; claimId?: string; versionId?: string };
  getVisaVersions: (programId: string) => any[];
  saveVisaVersion: (version: any) => void;
  acquireJobLock: (
    lockKey: string,
    ownerId: string,
    ttlMs?: number,
    metadata?: Record<string, unknown>
  ) => { acquired: boolean; existingOwner?: string; expiresAt?: string };
  releaseJobLock: (lockKey: string, ownerId: string) => boolean;
  saveAutomationCheckpoint: (cp: AutomationCheckpointInput) => void;
  getAutomationCheckpoint: (checkpointId: string) => any | null;
  recordDeadLetterItem: (item: DeadLetterItemInput) => string;
  getDeadLetterItems: (status?: string) => any[];
  getOperationalEvents: (limit?: number) => OperationalEvent[];
  auditIntegrity: () => any;
}

/**
 * Wraps a synchronous local-dev SQLite repository into the unified async repository contract.
 * Intended strictly for explicit local-development fallback (never production / Vercel).
 */
export function createAsyncSqliteRepositoryAdapter(
  syncRepo: SyncSqliteRepositoryLike,
  options: {
    accessMode: 'readonly' | 'readwrite';
    onClose?: () => void;
  }
): ReadOnlyImmigrationRepository | ReadWriteImmigrationRepository {
  const assertWritable = (operation: string) => {
    if (options.accessMode === 'readonly') {
      throw new Error(`READONLY_REPOSITORY_WRITE_DENIED: Cannot execute "${operation}" on a read-only repository.`);
    }
  };

  const readOnlyApi: ReadOnlyImmigrationRepository = {
    backend: 'sqlite-local',
    accessMode: options.accessMode,

    async getAppliedMigrations() {
      try {
        const rows = syncRepo.db
          .prepare('SELECT version, name, checksum, applied_at, rollback_notes FROM schema_migrations ORDER BY version ASC')
          .all() as any[];
        return rows.map((r) => ({
          version: r.version,
          name: r.name,
          checksum: r.checksum,
          appliedAt: r.applied_at,
          rollbackNotes: r.rollback_notes
        }));
      } catch {
        return [];
      }
    },

    async getBatchStateFromDb() {
      return syncRepo.getBatchStateFromDb();
    },

    async getImmigrationProgram(programId: string) {
      const row = syncRepo.db.prepare('SELECT * FROM immigration_programs WHERE id = ?').get(programId) as any;
      return row || null;
    },

    async getAllImmigrationPrograms() {
      return syncRepo.db.prepare('SELECT * FROM immigration_programs ORDER BY id ASC').all() as any[];
    },

    async getChangelogFromDb() {
      return syncRepo.getChangelogFromDb();
    },

    async getCronExecutionLogsFromDb(limit: number = 20) {
      return syncRepo.getCronExecutionLogsFromDb(limit);
    },

    async getVisaDetails(programId: string) {
      return syncRepo.getVisaDetails(programId);
    },

    async getAllVisaDetails() {
      return syncRepo.getAllVisaDetails();
    },

    async getPaginatedVisaDetails(page, limit, search = '', status = '', category = '') {
      return syncRepo.getPaginatedVisaDetails(page, limit, search, status, category);
    },

    async getDashboardStats() {
      return syncRepo.getDashboardStats();
    },

    async getVisaClaims(programId: string) {
      return syncRepo.getVisaClaims(programId);
    },

    async getVisaClaimsWithEvidence(programId: string, targetNationality?: string) {
      return syncRepo.getVisaClaimsWithEvidence(programId, targetNationality);
    },

    async getVisaClaimById(claimId: string) {
      return syncRepo.getVisaClaimById(claimId);
    },

    async getVisaEvidence(claimId: string) {
      return syncRepo.getVisaEvidence(claimId);
    },

    async getVisaVersions(programId: string) {
      return syncRepo.getVisaVersions(programId);
    },

    async getAutomationCheckpoint(checkpointId: string) {
      return syncRepo.getAutomationCheckpoint(checkpointId);
    },

    async getDeadLetterItems(status?: string) {
      return syncRepo.getDeadLetterItems(status);
    },

    async getOperationalEvents(limit: number = 50) {
      return syncRepo.getOperationalEvents(limit);
    },

    async auditIntegrity(): Promise<DatabaseIntegritySummary> {
      const raw = syncRepo.auditIntegrity();
      return {
        backend: 'sqlite-local',
        ok: Boolean(raw.ok),
        appliedMigrationsCount: Number(raw.appliedMigrationsCount ?? 0),
        expectedMigrationsCount: Number(raw.expectedMigrationsCount ?? 0),
        duplicates: {
          visaDetailsProgramId: raw.duplicates?.visaDetailsProgramId || []
        },
        orphans: {
          visaDetailsWithoutProgram: Number(raw.orphans?.visaDetailsWithoutProgram ?? 0),
          claimsWithoutProgram: Number(raw.orphans?.claimsWithoutProgram ?? 0),
          evidenceWithoutClaim: Number(raw.orphans?.evidenceWithoutClaim ?? 0),
          versionsWithoutProgram: Number(raw.orphans?.versionsWithoutProgram ?? 0)
        },
        staleLocksCount: Number(raw.staleLocksCount ?? 0)
      };
    },

    // Migration 004 tables are PostgreSQL-unified; local SQLite returns empty/unrevoked safely.
    async getSlotSubscriberCount() {
      return 0;
    },
    async getSlotSubscribers() {
      return [];
    },
    async getSlotEmbassyStatuses() {
      return [];
    },
    async getSlotEmailLogs() {
      return [];
    },
    async getEditorialArticles() {
      return [];
    },
    async getEditorialArticleBySlug() {
      return null;
    },
    async isAdminSessionRevoked() {
      return false;
    },

    async close() {
      if (options.onClose) {
        options.onClose();
      }
    }
  };

  if (options.accessMode === 'readonly') {
    return Object.freeze(readOnlyApi);
  }

  const readWriteApi: ReadWriteImmigrationRepository = {
    ...readOnlyApi,

    async saveBatchStateToDb(state: any) {
      assertWritable('saveBatchStateToDb');
      syncRepo.saveBatchStateToDb(state);
    },

    async saveImmigrationProgram(prog: any) {
      assertWritable('saveImmigrationProgram');
      syncRepo.db
        .prepare(
          `INSERT INTO immigration_programs (
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
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )
          ON CONFLICT(id) DO UPDATE SET
            country_code = excluded.country_code,
            category = excluded.category,
            official_name = excluded.official_name,
            local_language_name = excluded.local_language_name,
            legal_basis = excluded.legal_basis,
            classification_type = excluded.classification_type,
            eligibility = excluded.eligibility,
            nationality_restrictions = excluded.nationality_restrictions,
            age_requirements = excluded.age_requirements,
            education_requirements = excluded.education_requirements,
            work_experience_requirements = excluded.work_experience_requirements,
            min_salary_or_income = excluded.min_salary_or_income,
            investment_requirement = excluded.investment_requirement,
            required_funds_and_proof = excluded.required_funds_and_proof,
            residency_duration = excluded.residency_duration,
            renewal_rules = excluded.renewal_rules,
            pr_or_citizenship_transition = excluded.pr_or_citizenship_transition,
            family_inclusion_rules = excluded.family_inclusion_rules,
            work_and_study_rights = excluded.work_and_study_rights,
            restrictions_and_exceptions = excluded.restrictions_and_exceptions,
            required_documents_json = excluded.required_documents_json,
            documents_and_formats = excluded.documents_and_formats,
            translation_attestation_requirements = excluded.translation_attestation_requirements,
            application_procedure = excluded.application_procedure,
            government_fees = excluded.government_fees,
            processing_time = excluded.processing_time,
            apply_from = excluded.apply_from,
            official_application_url = excluded.official_application_url,
            official_information_url = excluded.official_information_url,
            source_authority = excluded.source_authority,
            source_last_updated = excluded.source_last_updated,
            last_checked_date = excluded.last_checked_date,
            verification_evidence = excluded.verification_evidence,
            verification_status = excluded.verification_status,
            updated_at = excluded.updated_at`
        )
        .run(
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
        );
    },

    async saveChangelogEntryToDb(entry: any) {
      assertWritable('saveChangelogEntryToDb');
      syncRepo.saveChangelogEntryToDb(entry);
    },

    async logCronExecutionToDb(log: CronExecutionLogInput) {
      assertWritable('logCronExecutionToDb');
      return syncRepo.logCronExecutionToDb(log);
    },

    async saveVisaDetails(details: any) {
      assertWritable('saveVisaDetails');
      syncRepo.saveVisaDetails(details);
    },

    async updateVisaStatus(programId: string, status: string) {
      assertWritable('updateVisaStatus');
      syncRepo.updateVisaStatus(programId, status);
    },

    async restoreVersion(versionId: string, editorId: string = 'admin') {
      assertWritable('restoreVersion');
      return syncRepo.restoreVersion(versionId, editorId);
    },

    async saveVisaClaim(claim: any) {
      assertWritable('saveVisaClaim');
      syncRepo.saveVisaClaim(claim);
    },

    async deleteVisaClaim(claimId: string) {
      assertWritable('deleteVisaClaim');
      syncRepo.deleteVisaClaim(claimId);
    },

    async saveVisaEvidence(evidence: any, opts?: { skipReconcile?: boolean }) {
      assertWritable('saveVisaEvidence');
      return syncRepo.saveVisaEvidence(evidence, opts);
    },

    async deleteVisaEvidence(evidenceId: string) {
      assertWritable('deleteVisaEvidence');
      return syncRepo.deleteVisaEvidence(evidenceId);
    },

    async reconcileClaimVerificationAfterEvidenceChange(claimId: string, reasonTrigger: string) {
      assertWritable('reconcileClaimVerificationAfterEvidenceChange');
      return syncRepo.reconcileClaimVerificationAfterEvidenceChange(claimId, reasonTrigger);
    },

    async saveVisaVersion(version: any) {
      assertWritable('saveVisaVersion');
      syncRepo.saveVisaVersion(version);
    },

    async acquireJobLock(lockKey, ownerId, ttlMs, metadata) {
      assertWritable('acquireJobLock');
      return syncRepo.acquireJobLock(lockKey, ownerId, ttlMs, metadata);
    },

    async releaseJobLock(lockKey, ownerId) {
      assertWritable('releaseJobLock');
      return syncRepo.releaseJobLock(lockKey, ownerId);
    },

    async saveAutomationCheckpoint(cp) {
      assertWritable('saveAutomationCheckpoint');
      syncRepo.saveAutomationCheckpoint(cp);
    },

    async recordDeadLetterItem(item) {
      assertWritable('recordDeadLetterItem');
      return syncRepo.recordDeadLetterItem(item);
    },

    async insertOperationalEvent(event: OperationalEvent) {
      assertWritable('insertOperationalEvent');
      syncRepo.eventSink?.insertOperationalEvent?.(event);
    },

    async saveSlotSubscriber() {
      throw new Error('SQLITE_UNSUPPORTED_STORE: slot_subscribers requires PostgreSQL Migration 004.');
    },
    async deactivateSlotSubscriber() {
      throw new Error('SQLITE_UNSUPPORTED_STORE: slot_subscribers requires PostgreSQL Migration 004.');
    },
    async upsertSlotEmbassyStatus() {
      throw new Error('SQLITE_UNSUPPORTED_STORE: slot_embassy_status requires PostgreSQL Migration 004.');
    },
    async logSlotEmailDelivery() {
      throw new Error('SQLITE_UNSUPPORTED_STORE: slot_email_logs requires PostgreSQL Migration 004.');
    },
    async saveEditorialArticle() {
      throw new Error('SQLITE_UNSUPPORTED_STORE: editorial_articles requires PostgreSQL Migration 004.');
    },
    async deleteEditorialArticle() {
      throw new Error('SQLITE_UNSUPPORTED_STORE: editorial_articles requires PostgreSQL Migration 004.');
    },
    async revokeAdminSessionJti() {
      throw new Error('SQLITE_UNSUPPORTED_STORE: admin_revoked_sessions requires PostgreSQL Migration 004.');
    },
    async pruneExpiredRevokedSessions() {
      return 0;
    }
  };

  return readWriteApi;
}
