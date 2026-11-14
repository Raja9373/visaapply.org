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

const DB_PATH = resolveConfiguredDbPath();

export const db: Database.Database = openSqliteDatabase(DB_PATH);

export function applyPhase31SqliteMigrations(targetDb: Database.Database = db) {
  return runTrackedSqliteMigrations(targetDb);
}

export function initDatabaseSchema(targetDb: Database.Database = db) {
  return runTrackedSqliteMigrations(targetDb);
}

const defaultRepo = createSqliteRepository(db);

export const getBatchStateFromDb = defaultRepo.getBatchStateFromDb;
export const saveBatchStateToDb = defaultRepo.saveBatchStateToDb;
export const saveChangelogEntryToDb = defaultRepo.saveChangelogEntryToDb;
export const getChangelogFromDb = defaultRepo.getChangelogFromDb;
export const logCronExecutionToDb = defaultRepo.logCronExecutionToDb;
export const getCronExecutionLogsFromDb = defaultRepo.getCronExecutionLogsFromDb;
export const getVisaDetails = defaultRepo.getVisaDetails;
export const getAllVisaDetails = defaultRepo.getAllVisaDetails;
export const getPaginatedVisaDetails = defaultRepo.getPaginatedVisaDetails;
export const saveVisaDetails = defaultRepo.saveVisaDetails;
export const getDashboardStats = defaultRepo.getDashboardStats;
export const updateVisaStatus = defaultRepo.updateVisaStatus;
export const restoreVersion = defaultRepo.restoreVersion;
export const getVisaClaims = defaultRepo.getVisaClaims;
export const getVisaClaimsWithEvidence = defaultRepo.getVisaClaimsWithEvidence;
export const getVisaClaimById = defaultRepo.getVisaClaimById;
export const reconcileClaimVerificationAfterEvidenceChange = defaultRepo.reconcileClaimVerificationAfterEvidenceChange;
export const saveVisaClaim = defaultRepo.saveVisaClaim;
export const deleteVisaClaim = defaultRepo.deleteVisaClaim;
export const getVisaEvidence = defaultRepo.getVisaEvidence;
export const saveVisaEvidence = defaultRepo.saveVisaEvidence;
export const deleteVisaEvidence = defaultRepo.deleteVisaEvidence;
export const getVisaVersions = defaultRepo.getVisaVersions;
export const saveVisaVersion = defaultRepo.saveVisaVersion;
export const acquireJobLock = defaultRepo.acquireJobLock;
export const releaseJobLock = defaultRepo.releaseJobLock;
export const saveAutomationCheckpoint = defaultRepo.saveAutomationCheckpoint;
export const getAutomationCheckpoint = defaultRepo.getAutomationCheckpoint;
export const recordDeadLetterItem = defaultRepo.recordDeadLetterItem;
export const getDeadLetterItems = defaultRepo.getDeadLetterItems;
export const getOperationalEvents = defaultRepo.getOperationalEvents;
