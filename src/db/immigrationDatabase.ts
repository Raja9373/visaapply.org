import fs from 'node:fs';
import path from 'node:path';
import type Database from 'better-sqlite3';
import {
  EVIDENCE_STATUSES,
  INVALIDATING_EVIDENCE_STATUSES,
  QUALIFYING_OFFICIAL_EVIDENCE_STATUSES,
  REQUIREMENT_CLASSIFICATIONS,
  REQUIREMENT_CLASSIFICATION_META,
  SIX_LIFECYCLE_STAGES,
  SQLITE_MIGRATIONS,
  THIRTY_SECTIONS_REGISTRY,
  TWENTY_TWO_SPECIAL_TOPICS_REGISTRY,
  auditSqliteDatabaseIntegrity,
  closeSqliteDatabase,
  computeMigrationChecksum,
  createDefaultApplicantSpecialTopics,
  createSqliteRepository,
  denormalize30SectionsToLegacy13,
  evaluateClaimIntegrity,
  getAppliedSqliteMigrations,
  isInvalidatingEvidenceStatus,
  isQualifyingOfficialEvidence,
  isSectionSubstantivelyPopulated,
  isTopicSubstantivelyPopulated,
  isValidRequirementClassification,
  normalizeEvidenceStatus,
  normalizeVisaDetailTo30Sections,
  openSqliteDatabase,
  runTrackedSqliteMigrations,
  sanitizeVisaDetailsForPublic,
  sync30SectionsToLegacyDetails,
  syncLegacyDetailsTo30Sections,
  validateComprehensiveProfileHonesty
} from './sqliteCore';
import type {
  AppliedMigrationRecord,
  EvidenceStatus,
  EvidenceVerificationStatus,
  RequirementClassification,
  SqliteIntegrityAuditReport,
  SqliteMigrationDefinition,
  SqliteOpenOptions,
  VisaApplicantSpecialTopics,
  VisaComprehensiveProfile
} from './sqliteCore';

export {
  REQUIREMENT_CLASSIFICATIONS,
  REQUIREMENT_CLASSIFICATION_META,
  THIRTY_SECTIONS_REGISTRY,
  SIX_LIFECYCLE_STAGES,
  TWENTY_TWO_SPECIAL_TOPICS_REGISTRY,
  EVIDENCE_STATUSES,
  QUALIFYING_OFFICIAL_EVIDENCE_STATUSES,
  INVALIDATING_EVIDENCE_STATUSES,
  SQLITE_MIGRATIONS,
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
  sanitizeVisaDetailsForPublic,
  openSqliteDatabase,
  closeSqliteDatabase,
  createSqliteRepository,
  runTrackedSqliteMigrations,
  getAppliedSqliteMigrations,
  auditSqliteDatabaseIntegrity,
  computeMigrationChecksum
};
export type {
  RequirementClassification,
  EvidenceStatus,
  EvidenceVerificationStatus,
  VisaComprehensiveProfile,
  VisaApplicantSpecialTopics,
  AppliedMigrationRecord,
  SqliteIntegrityAuditReport,
  SqliteMigrationDefinition,
  SqliteOpenOptions
};

const DB_DIR = path.join(process.cwd(), 'data_db');
const DEFAULT_DB_PATH = path.join(DB_DIR, 'immigration_hub.db');

function isProductionOrVercelRuntime(env: NodeJS.ProcessEnv = process.env): boolean {
  return (
    env.NODE_ENV === 'production' ||
    env.VERCEL === '1' ||
    env.VERCEL === 'true' ||
    Boolean((env.VERCEL_ENV || '').trim())
  );
}

function resolveConfiguredDbPath(): string {
  const override = (process.env.VISAAPPLY_SQLITE_PATH || '').trim();
  if (override) {
    return path.resolve(override);
  }
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  return DEFAULT_DB_PATH;
}

let lazyDb: Database.Database | null = null;
let lazyRepo: ReturnType<typeof createSqliteRepository> | null = null;

/**
 * Lazily opens the local-development SQLite database on first use.
 * Fails closed in production / Vercel unless an explicit isolated test path is provided.
 */
export function getLazySqliteDb(): Database.Database {
  if (lazyDb) {
    return lazyDb;
  }
  if (isProductionOrVercelRuntime() && process.env.ALLOW_SQLITE_IN_PROD !== 'true') {
    throw new Error(
      'SQLITE_FORBIDDEN_IN_PRODUCTION: SQLite is disabled in production and Vercel environments. Configure NEON_READONLY_DATABASE_URL and NEON_APP_DATABASE_URL instead.'
    );
  }
  const dbPath = resolveConfiguredDbPath();
  lazyDb = openSqliteDatabase(dbPath);
  return lazyDb;
}

export function isSqliteDbInitialized(): boolean {
  return lazyDb !== null;
}

function getDefaultRepo(): ReturnType<typeof createSqliteRepository> {
  if (!lazyRepo) {
    lazyRepo = createSqliteRepository(getLazySqliteDb());
  }
  return lazyRepo;
}

export function closeDefaultSqliteDb(): void {
  if (lazyDb) {
    closeSqliteDatabase(lazyDb);
    lazyDb = null;
    lazyRepo = null;
  }
}

/**
 * Lazy proxy preserving backward compatibility for legacy local callers (`db.prepare(...)`)
 * without opening data_db/immigration_hub.db during module import.
 */
export const db: Database.Database = new Proxy({} as Database.Database, {
  get(_target, prop, receiver) {
    const instance = getLazySqliteDb();
    const value = Reflect.get(instance as unknown as object, prop, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
  set(_target, prop, value, receiver) {
    const instance = getLazySqliteDb();
    return Reflect.set(instance as unknown as object, prop, value, receiver);
  }
});

export function applyPhase31SqliteMigrations(targetDb: Database.Database = getLazySqliteDb()) {
  return runTrackedSqliteMigrations(targetDb);
}

export function initDatabaseSchema(targetDb: Database.Database = getLazySqliteDb()) {
  return runTrackedSqliteMigrations(targetDb);
}

export const getBatchStateFromDb: ReturnType<typeof createSqliteRepository>['getBatchStateFromDb'] = (...args) =>
  getDefaultRepo().getBatchStateFromDb(...args);
export const saveBatchStateToDb: ReturnType<typeof createSqliteRepository>['saveBatchStateToDb'] = (...args) =>
  getDefaultRepo().saveBatchStateToDb(...args);
export const saveChangelogEntryToDb: ReturnType<typeof createSqliteRepository>['saveChangelogEntryToDb'] = (...args) =>
  getDefaultRepo().saveChangelogEntryToDb(...args);
export const getChangelogFromDb: ReturnType<typeof createSqliteRepository>['getChangelogFromDb'] = (...args) =>
  getDefaultRepo().getChangelogFromDb(...args);
export const logCronExecutionToDb: ReturnType<typeof createSqliteRepository>['logCronExecutionToDb'] = (...args) =>
  getDefaultRepo().logCronExecutionToDb(...args);
export const getCronExecutionLogsFromDb: ReturnType<typeof createSqliteRepository>['getCronExecutionLogsFromDb'] = (...args) =>
  getDefaultRepo().getCronExecutionLogsFromDb(...args);
export const getVisaDetails: ReturnType<typeof createSqliteRepository>['getVisaDetails'] = (...args) =>
  getDefaultRepo().getVisaDetails(...args);
export const getAllVisaDetails: ReturnType<typeof createSqliteRepository>['getAllVisaDetails'] = (...args) =>
  getDefaultRepo().getAllVisaDetails(...args);
export const getPaginatedVisaDetails: ReturnType<typeof createSqliteRepository>['getPaginatedVisaDetails'] = (...args) =>
  getDefaultRepo().getPaginatedVisaDetails(...args);
export const saveVisaDetails: ReturnType<typeof createSqliteRepository>['saveVisaDetails'] = (...args) =>
  getDefaultRepo().saveVisaDetails(...args);
export const getDashboardStats: ReturnType<typeof createSqliteRepository>['getDashboardStats'] = (...args) =>
  getDefaultRepo().getDashboardStats(...args);
export const updateVisaStatus: ReturnType<typeof createSqliteRepository>['updateVisaStatus'] = (...args) =>
  getDefaultRepo().updateVisaStatus(...args);
export const restoreVersion: ReturnType<typeof createSqliteRepository>['restoreVersion'] = (...args) =>
  getDefaultRepo().restoreVersion(...args);
export const getVisaClaims: ReturnType<typeof createSqliteRepository>['getVisaClaims'] = (...args) =>
  getDefaultRepo().getVisaClaims(...args);
export const getVisaClaimsWithEvidence: ReturnType<typeof createSqliteRepository>['getVisaClaimsWithEvidence'] = (...args) =>
  getDefaultRepo().getVisaClaimsWithEvidence(...args);
export const getVisaClaimById: ReturnType<typeof createSqliteRepository>['getVisaClaimById'] = (...args) =>
  getDefaultRepo().getVisaClaimById(...args);
export const reconcileClaimVerificationAfterEvidenceChange: ReturnType<typeof createSqliteRepository>['reconcileClaimVerificationAfterEvidenceChange'] = (...args) =>
  getDefaultRepo().reconcileClaimVerificationAfterEvidenceChange(...args);
export const saveVisaClaim: ReturnType<typeof createSqliteRepository>['saveVisaClaim'] = (...args) =>
  getDefaultRepo().saveVisaClaim(...args);
export const deleteVisaClaim: ReturnType<typeof createSqliteRepository>['deleteVisaClaim'] = (...args) =>
  getDefaultRepo().deleteVisaClaim(...args);
export const getVisaEvidence: ReturnType<typeof createSqliteRepository>['getVisaEvidence'] = (...args) =>
  getDefaultRepo().getVisaEvidence(...args);
export const saveVisaEvidence: ReturnType<typeof createSqliteRepository>['saveVisaEvidence'] = (...args) =>
  getDefaultRepo().saveVisaEvidence(...args);
export const deleteVisaEvidence: ReturnType<typeof createSqliteRepository>['deleteVisaEvidence'] = (...args) =>
  getDefaultRepo().deleteVisaEvidence(...args);
export const getVisaVersions: ReturnType<typeof createSqliteRepository>['getVisaVersions'] = (...args) =>
  getDefaultRepo().getVisaVersions(...args);
export const saveVisaVersion: ReturnType<typeof createSqliteRepository>['saveVisaVersion'] = (...args) =>
  getDefaultRepo().saveVisaVersion(...args);
export const acquireJobLock: ReturnType<typeof createSqliteRepository>['acquireJobLock'] = (...args) =>
  getDefaultRepo().acquireJobLock(...args);
export const releaseJobLock: ReturnType<typeof createSqliteRepository>['releaseJobLock'] = (...args) =>
  getDefaultRepo().releaseJobLock(...args);
export const saveAutomationCheckpoint: ReturnType<typeof createSqliteRepository>['saveAutomationCheckpoint'] = (...args) =>
  getDefaultRepo().saveAutomationCheckpoint(...args);
export const getAutomationCheckpoint: ReturnType<typeof createSqliteRepository>['getAutomationCheckpoint'] = (...args) =>
  getDefaultRepo().getAutomationCheckpoint(...args);
export const recordDeadLetterItem: ReturnType<typeof createSqliteRepository>['recordDeadLetterItem'] = (...args) =>
  getDefaultRepo().recordDeadLetterItem(...args);
export const getDeadLetterItems: ReturnType<typeof createSqliteRepository>['getDeadLetterItems'] = (...args) =>
  getDefaultRepo().getDeadLetterItems(...args);
export const getOperationalEvents: ReturnType<typeof createSqliteRepository>['getOperationalEvents'] = (...args) =>
  getDefaultRepo().getOperationalEvents(...args);

