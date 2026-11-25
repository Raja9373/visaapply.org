/**
 * VISAAPPLY.ORG — PHASE 5B: AUTOMATED OFFICIAL SOURCE MONITORING,
 * CHANGE DETECTION, EVIDENCE, QUARANTINE & SAFE PUBLISHING SCHEMAS
 *
 * Additive, zero-dependency TypeScript contracts & runtime validators built on top
 * of Phase 2–5A `src/schemas/catalogSchemas.ts`. Preserves 100% backward compatibility
 * with existing `data/` records and all 128 Phase 1–5A tests.
 */

import {
  STATIC_CATALOG_SCHEMA_VERSION,
  detectProhibitedPublicSecretsOrPii,
  isValidCanonicalIso2,
  isValidClaimId,
  isValidEvidenceId,
  isValidIsoDateOrTimestamp,
  isValidOfficialSourceId,
  isValidProgramId,
  normalizeCountryIso2,
  validateOfficialHttpsUrl,
  type ValidationIssue,
  type ValidationResult
} from './catalogSchemas';

export const PHASE5B_MONITORING_SCHEMA_VERSION = '2.1.0' as const;

// ============================================================================
// 1. SOURCE AUTHORITY TIER, SOURCE TYPES & MONITORING STATUSES
// ============================================================================

/**
 * Strictly distinguishes sovereign government authorities from third-party
 * discovery leads. Third-party leads may NEVER independently authorize
 * publication of statutory immigration claims.
 */
export const SOURCE_AUTHORITY_TIERS = [
  'OFFICIAL_GOVERNMENT',
  'DISCOVERY_LEAD_ONLY'
] as const;
export type SourceAuthorityTier = (typeof SOURCE_AUTHORITY_TIERS)[number];

export const OFFICIAL_SOURCE_TYPES = [
  'IMMIGRATION_DEPARTMENT',
  'GOVERNMENT_VISA_PORTAL',
  'EMBASSY_CONSULATE',
  'OFFICIAL_LEGISLATION_GAZETTE',
  'GOVERNMENT_FEE_SCHEDULE',
  'GOVERNMENT_APPLICATION_PORTAL'
] as const;
export type OfficialSourceType = (typeof OFFICIAL_SOURCE_TYPES)[number];

export const SOURCE_MONITORING_STATUSES = [
  'AWAITING_INITIAL_CHECK',
  'VERIFIED_UNCHANGED',
  'SOURCE_CHANGED',
  'SOURCE_UNAVAILABLE',
  'REDIRECTED_OFFICIAL',
  'REDIRECTED_SUSPICIOUS',
  'ROBOTS_RESTRICTED',
  'RATE_LIMITED',
  'ANTI_BOT_PROTECTED',
  'TLS_CERTIFICATE_ERROR',
  'STRUCTURE_CHANGED'
] as const;
export type SourceMonitoringStatus = (typeof SOURCE_MONITORING_STATUSES)[number];

/**
 * Mandatory distinct lifecycle states (Phase 5B Section 4).
 * Never collapse a raw source change or content extraction into verified/approved claim status.
 */
export const CHANGE_PIPELINE_STATUSES = [
  'SOURCE_CHANGED',
  'SOURCE_UNAVAILABLE',
  'SOURCE_CONTENT_EXTRACTED',
  'CLAIM_INDEPENDENTLY_VERIFIED',
  'CLAIM_AWAITING_REVIEW',
  'CLAIM_APPROVED_FOR_PUBLICATION'
] as const;
export type ChangePipelineStatus = (typeof CHANGE_PIPELINE_STATUSES)[number];

export const CLAIM_REVIEWER_STATUSES = [
  'PENDING_HUMAN_REVIEW',
  'APPROVED',
  'REJECTED',
  'NEEDS_MORE_EVIDENCE',
  'DEFERRED'
] as const;
export type ClaimReviewerStatus = (typeof CLAIM_REVIEWER_STATUSES)[number];

/**
 * Strict high-risk immigration claim categories (Phase 5B Section 5).
 * Every category listed here requires verified official government evidence
 * and explicit human approval before any public catalog mutation.
 */
export const HIGH_RISK_IMMIGRATION_CLAIM_CATEGORIES = [
  'ELIGIBILITY_CRITERIA',
  'VISA_CATEGORIES_AND_SUBCLASSES',
  'GOVERNMENT_FEES',
  'PROCESSING_TIMES',
  'INCOME_AND_INVESTMENT_THRESHOLDS',
  'REQUIRED_DOCUMENTS',
  'AGE_LIMITS',
  'WORK_RIGHTS',
  'FAMILY_SPONSORSHIP_RULES',
  'PERMANENT_RESIDENCY_PATHWAYS',
  'CITIZENSHIP_REQUIREMENTS',
  'APPLICATION_DEADLINES',
  'PROGRAM_AVAILABILITY_AND_CLOSURE'
] as const;
export type HighRiskImmigrationClaimCategory = (typeof HIGH_RISK_IMMIGRATION_CLAIM_CATEGORIES)[number];

export const CHANGE_RISK_CLASSES = [
  'LOW_RISK_METADATA',
  'HIGH_RISK_LEGAL_OR_ELIGIBILITY'
] as const;
export type ChangeRiskClass = (typeof CHANGE_RISK_CLASSES)[number];

/**
 * Deterministic low-risk metadata fields that may be refreshed automatically
 * ONLY when deterministically verified by official HTTPS monitoring.
 */
export const ALLOWED_AUTO_LOW_RISK_FIELDS: ReadonlySet<string> = new Set([
  'lastCheckedDate',
  'lastCheckedTimestamp',
  'httpAvailabilityStatus',
  'lastHttpStatusCode',
  'contentFingerprint',
  'sourceStatus'
]);

/**
 * Automated record-level quarantine trigger codes (Phase 5B Section 6).
 */
export const PHASE5B_QUARANTINE_TRIGGER_CODES = [
  'UNVERIFIABLE_OFFICIAL_SOURCE',
  'CONFLICTING_OFFICIAL_SOURCES',
  'MISSING_SUPPORTING_EVIDENCE',
  'EXPIRED_INFORMATION',
  'UNCERTAIN_PROGRAM_AVAILABILITY',
  'INCOMPLETE_CONTENT_EXTRACTION',
  'SCHEMA_VALIDATION_FAILURE',
  'SUSPICIOUS_OR_UNEXPECTED_REDIRECT',
  'MATERIAL_LEGAL_CHANGE_AWAITING_REVIEW'
] as const;
export type Phase5BQuarantineTriggerCode = (typeof PHASE5B_QUARANTINE_TRIGGER_CODES)[number];

// ============================================================================
// 2. MONITORED OFFICIAL SOURCE REGISTRY RECORD
// ============================================================================

export interface MonitoredSourceRegistryEntry {
  schemaVersion: typeof PHASE5B_MONITORING_SCHEMA_VERSION;
  sourceId: string;
  countryIso: string;
  officialGovernmentAuthority: string;
  sourceUrl: string;
  sourceCategory: string;
  language: string;
  sourceType: OfficialSourceType;
  authorityTier: SourceAuthorityTier;
  lastCheckedTimestamp: string | null;
  lastSuccessfulVerificationTimestamp: string | null;
  httpStatus: number | null;
  contentFingerprint: string | null;
  structureSignature: string | null;
  currentSourceStatus: SourceMonitoringStatus;
  consecutiveFailures: number;
  redirectTargetUrl: string | null;
  verificationNotes: string;
}

// ============================================================================
// 3. SOURCE CHECK EXECUTION RECORD & VERIFICATION REPORT
// ============================================================================

export type SourceCheckOutcome =
  | 'REACHABLE_UNCHANGED'
  | 'REACHABLE_CHANGED'
  | 'REDIRECTED_OFFICIAL'
  | 'REDIRECTED_SUSPICIOUS'
  | 'HTTP_403_FORBIDDEN'
  | 'HTTP_404_NOT_FOUND'
  | 'HTTP_429_RATE_LIMITED'
  | 'HTTP_5XX_SERVER_ERROR'
  | 'TIMEOUT'
  | 'TLS_CERTIFICATE_ERROR'
  | 'ROBOTS_DISALLOWED'
  | 'ANTI_BOT_OR_CAPTCHA_DETECTED'
  | 'NETWORK_UNAVAILABLE'
  | 'INVALID_OR_UNSAFE_URL'
  | 'STRUCTURE_CHANGED'
  | 'DISCOVERY_LEAD_SKIPPED';

export interface RedirectHopRecord {
  fromUrl: string;
  toUrl: string;
  statusCode: number;
  sameAuthorityDomain: boolean;
  officialDomainValid: boolean;
}

export interface SourceCheckResult {
  checkId: string;
  runId: string;
  sourceId: string;
  countryIso: string;
  sourceUrl: string;
  checkedAt: string;
  durationMs: number;
  outcome: SourceCheckOutcome;
  pipelineStatus: ChangePipelineStatus | 'SOURCE_VERIFIED_UNCHANGED';
  httpStatus: number | null;
  finalUrl: string;
  redirectChain: RedirectHopRecord[];
  previousFingerprint: string | null;
  newFingerprint: string | null;
  fingerprintChanged: boolean;
  previousStructureSignature: string | null;
  newStructureSignature: string | null;
  structureChanged: boolean;
  robotsAllowed: boolean;
  antiBotDetected: boolean;
  responseContentType: string | null;
  extractedExcerpt: string | null;
  /**
   * Safety invariant: A failed check NEVER means a visa program has closed.
   */
  impliesProgramClosure: false;
  notes: string;
}

export interface SourceMonitoringRunReport {
  schemaVersion: typeof PHASE5B_MONITORING_SCHEMA_VERSION;
  runId: string;
  idempotencyKey: string;
  startedAt: string;
  completedAt: string;
  executionMode: 'LIVE_HTTPS' | 'MOCK_INJECTED' | 'DRY_RUN';
  triggeredBy: 'SCHEDULED_0300_IST' | 'CATCH_UP' | 'MANUAL_CLI' | 'CI_WORKFLOW';
  scheduledSlotUtc: string;
  missedRunsDetected: number;
  totals: {
    sourcesConsidered: number;
    sourcesChecked: number;
    reachableUnchanged: number;
    changedDetected: number;
    unavailableOrError: number;
    robotsRestricted: number;
    rateLimited: number;
    antiBotProtected: number;
    suspiciousRedirects: number;
    discoveryLeadsSkipped: number;
  };
  results: SourceCheckResult[];
}

// ============================================================================
// 4. CHANGE DETECTION, EVIDENCE & CLAIM REVIEW SCHEMAS
// ============================================================================

export interface ChangeDetectionRecord {
  schemaVersion: typeof PHASE5B_MONITORING_SCHEMA_VERSION;
  changeDetectionId: string;
  runId: string;
  sourceId: string;
  countryIso: string;
  sourceUrl: string;
  detectedAt: string;
  previousFingerprint: string | null;
  newFingerprint: string | null;
  pipelineStatus: ChangePipelineStatus;
  affectedProgramIds: string[];
  affectedClaimIds: string[];
  previousPublishedPreserved: true;
  requiresHumanReview: true;
  evidenceProposalId: string;
  summary: string;
}

export interface EvidenceReviewProposal {
  schemaVersion: typeof PHASE5B_MONITORING_SCHEMA_VERSION;
  proposalId: string;
  changeDetectionId: string;
  sourceId: string;
  countryIso: string;
  evidenceUrl: string;
  retrievalTimestamp: string;
  previousFingerprint: string | null;
  newFingerprint: string | null;
  extractedExcerpt: string | null;
  pipelineStatus: 'SOURCE_CHANGED' | 'SOURCE_CONTENT_EXTRACTED' | 'CLAIM_AWAITING_REVIEW';
  reviewerStatus: ClaimReviewerStatus;
  notes: string;
}

export interface ClaimVerificationReviewRecord {
  schemaVersion: typeof PHASE5B_MONITORING_SCHEMA_VERSION;
  claimId: string;
  programId: string;
  countryIso: string;
  claimCategory: HighRiskImmigrationClaimCategory;
  riskClass: ChangeRiskClass;
  claimText: string;
  officialSourceId: string;
  sourceAuthorityTier: SourceAuthorityTier;
  evidenceUrl: string;
  evidenceExcerpt: string | null;
  retrievalTimestamp: string;
  effectiveDate: string | null;
  verificationStatus: ChangePipelineStatus;
  reviewerStatus: ClaimReviewerStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  previousValue: string | null;
  proposedNewValue: string | null;
  isAiGeneratedProposal: boolean;
  isUnverifiedTranslation: boolean;
  conflictingOfficialSourceIds: string[];
  expiresAt: string | null;
}

export interface RecordLevelQuarantineAction {
  schemaVersion: typeof PHASE5B_MONITORING_SCHEMA_VERSION;
  quarantineId: string;
  scope: 'RECORD_ONLY';
  entityType: 'program' | 'claim' | 'source' | 'visa_detail' | 'route';
  entityId: string;
  countryIso: string;
  triggerCode: Phase5BQuarantineTriggerCode;
  reasonSummary: string;
  quarantinedAt: string;
  recoverable: true;
  reReviewEligible: true;
  excludedFromPublicListings: true;
  excludedFromIndexableSitemaps: true;
  /**
   * Safety invariant: A single record or source failure NEVER quarantines an entire country.
   */
  entireCountryQuarantined: false;
  evidenceAuditTrail: {
    runId?: string;
    sourceId?: string;
    changeDetectionId?: string;
    previousPublishedSnapshotPreserved: boolean;
  };
}

// ============================================================================
// 5. RUN LOCK, MISSED-RUN CATCH-UP & DATA QUALITY DASHBOARD REPORT
// ============================================================================

export interface MonitoringRunState {
  schemaVersion: typeof PHASE5B_MONITORING_SCHEMA_VERSION;
  scheduleCronUtc: '30 21 * * *';
  scheduleLabel: '03:00 AM IST Daily (21:30 UTC)';
  activeRunLock: {
    locked: boolean;
    runId: string | null;
    acquiredAt: string | null;
    expiresAt: string | null;
  };
  lastRunId: string | null;
  lastRunStartedAt: string | null;
  lastRunCompletedAt: string | null;
  lastSuccessfulMonitoringRunAt: string | null;
  lastScheduledSlotExecutedUtc: string | null;
  recentIdempotencyKeys: string[];
}

export interface DataQualityDashboardReport {
  schemaVersion: typeof PHASE5B_MONITORING_SCHEMA_VERSION;
  catalogSchemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  generatedAt: string;
  reportIntegrity: {
    noFabricatedCoveragePercentages: true;
    strictMetricSeparationEnforced: true;
    liveExternalMonitoringExecutedInThisReport: boolean;
  };
  canonicalScopeMetrics: {
    totalCountriesAndTerritoriesInRegistry: number;
    potentialBilateralRoutes: number;
    trackedSevenCategoryCoverageSlots: number;
    activeVerifiedCountries: number;
    awaitingVerificationCountries: number;
    uninhabitedTerritories: number;
  };
  verifiedCatalogMetrics: {
    verifiedAvailablePrograms: number;
    programsConfirmedUnavailableOrExpired: number;
    verifiedOfficialSourcesRegistered: number;
    verifiedRouteOverrides: number;
    publishedEditorialArticles: number;
    excludedDraftEditorialArticles: number;
  };
  monitoringMetrics: {
    sourcesCheckedInLatestRun: number;
    sourcesReachable: number;
    sourcesUnavailable: number;
    sourcesChanged: number;
    sourcesAwaitingInitialCheck: number;
    claimsVerified: number;
    claimsAwaitingReview: number;
    recordsQuarantinedTotal: number;
    quarantinedCountriesCount: number;
    quarantinedProgramsCount: number;
    recordLevelMonitoringQuarantinesCount: number;
  };
  timestamps: {
    lastSuccessfulMonitoringRun: string | null;
    latestCatalogBuildHash: string | null;
    latestCatalogGenerationTime: string | null;
  };
}

// ============================================================================
// 6. STRICT RUNTIME VALIDATORS (ZERO-DEPENDENCY)
// ============================================================================

function ok<T>(data: T): ValidationResult<T> {
  return { success: true, data, issues: [] };
}

function fail<T>(issues: ValidationIssue[]): ValidationResult<T> {
  return { success: false, issues };
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return Boolean(val) && typeof val === 'object' && !Array.isArray(val);
}

export function validateMonitoredSourceRegistryEntry(
  input: unknown
): ValidationResult<MonitoredSourceRegistryEntry> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Monitored source entry must be a JSON object.' }]);
  }

  for (const finding of detectProhibitedPublicSecretsOrPii(input)) {
    issues.push({ path: 'pii_or_secret', code: 'PROHIBITED_PUBLIC_DATA', message: finding });
  }

  if (input.schemaVersion !== PHASE5B_MONITORING_SCHEMA_VERSION) {
    issues.push({
      path: 'schemaVersion',
      code: 'INVALID_SCHEMA_VERSION',
      message: `schemaVersion must equal "${PHASE5B_MONITORING_SCHEMA_VERSION}".`
    });
  }

  const sourceId = typeof input.sourceId === 'string' ? input.sourceId.trim() : '';
  if (!isValidOfficialSourceId(sourceId)) {
    issues.push({ path: 'sourceId', code: 'INVALID_SOURCE_ID', message: `Invalid sourceId "${sourceId}".` });
  }

  const rawIso = typeof input.countryIso === 'string' ? input.countryIso.trim() : '';
  const countryIso = isValidCanonicalIso2(rawIso) ? normalizeCountryIso2(rawIso) : '';
  if (!countryIso) {
    issues.push({ path: 'countryIso', code: 'INVALID_COUNTRY_ISO2', message: `Invalid countryIso "${rawIso}".` });
  }

  const authorityTier = input.authorityTier as SourceAuthorityTier;
  if (!SOURCE_AUTHORITY_TIERS.includes(authorityTier)) {
    issues.push({
      path: 'authorityTier',
      code: 'INVALID_AUTHORITY_TIER',
      message: `authorityTier must be one of: ${SOURCE_AUTHORITY_TIERS.join(', ')}.`
    });
  }

  const sourceType = input.sourceType as OfficialSourceType;
  if (!OFFICIAL_SOURCE_TYPES.includes(sourceType)) {
    issues.push({
      path: 'sourceType',
      code: 'INVALID_SOURCE_TYPE',
      message: `sourceType must be one of: ${OFFICIAL_SOURCE_TYPES.join(', ')}.`
    });
  }

  const currentSourceStatus = input.currentSourceStatus as SourceMonitoringStatus;
  if (!SOURCE_MONITORING_STATUSES.includes(currentSourceStatus)) {
    issues.push({
      path: 'currentSourceStatus',
      code: 'INVALID_SOURCE_STATUS',
      message: `currentSourceStatus must be one of: ${SOURCE_MONITORING_STATUSES.join(', ')}.`
    });
  }

  // Authoritative government sources MUST pass strict official HTTPS domain validation
  const sourceUrl = typeof input.sourceUrl === 'string' ? input.sourceUrl.trim() : '';
  if (authorityTier === 'OFFICIAL_GOVERNMENT') {
    const urlCheck = validateOfficialHttpsUrl(sourceUrl);
    if (!urlCheck.valid) {
      issues.push({
        path: 'sourceUrl',
        code: 'INVALID_OFFICIAL_URL',
        message: urlCheck.reason || 'Official government source must have a valid sovereign HTTPS URL.'
      });
    }
  } else {
    try {
      const parsed = new URL(sourceUrl);
      if (parsed.protocol !== 'https:') {
        issues.push({ path: 'sourceUrl', code: 'HTTPS_REQUIRED', message: 'Discovery lead URL must use HTTPS.' });
      }
    } catch {
      issues.push({ path: 'sourceUrl', code: 'INVALID_URL', message: 'Invalid URL syntax.' });
    }
  }

  if (
    input.lastCheckedTimestamp !== null &&
    (typeof input.lastCheckedTimestamp !== 'string' || !isValidIsoDateOrTimestamp(input.lastCheckedTimestamp))
  ) {
    issues.push({ path: 'lastCheckedTimestamp', code: 'INVALID_TIMESTAMP', message: 'Must be ISO-8601 or null.' });
  }

  if (
    input.lastSuccessfulVerificationTimestamp !== null &&
    (typeof input.lastSuccessfulVerificationTimestamp !== 'string' ||
      !isValidIsoDateOrTimestamp(input.lastSuccessfulVerificationTimestamp))
  ) {
    issues.push({
      path: 'lastSuccessfulVerificationTimestamp',
      code: 'INVALID_TIMESTAMP',
      message: 'Must be ISO-8601 or null.'
    });
  }

  if (
    input.contentFingerprint !== null &&
    (typeof input.contentFingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(input.contentFingerprint))
  ) {
    issues.push({
      path: 'contentFingerprint',
      code: 'INVALID_FINGERPRINT',
      message: 'contentFingerprint must be a 64-char SHA-256 hex digest or null.'
    });
  }

  if (issues.length > 0) return fail(issues);

  return ok({
    schemaVersion: PHASE5B_MONITORING_SCHEMA_VERSION,
    sourceId,
    countryIso,
    officialGovernmentAuthority: String(input.officialGovernmentAuthority || '').trim(),
    sourceUrl,
    sourceCategory: String(input.sourceCategory || '').trim(),
    language: String(input.language || 'en').trim(),
    sourceType,
    authorityTier,
    lastCheckedTimestamp: input.lastCheckedTimestamp as string | null,
    lastSuccessfulVerificationTimestamp: input.lastSuccessfulVerificationTimestamp as string | null,
    httpStatus: typeof input.httpStatus === 'number' ? input.httpStatus : null,
    contentFingerprint: input.contentFingerprint as string | null,
    structureSignature: typeof input.structureSignature === 'string' ? input.structureSignature : null,
    currentSourceStatus,
    consecutiveFailures: typeof input.consecutiveFailures === 'number' ? input.consecutiveFailures : 0,
    redirectTargetUrl: typeof input.redirectTargetUrl === 'string' ? input.redirectTargetUrl : null,
    verificationNotes: String(input.verificationNotes || '').trim()
  });
}

export function validateClaimVerificationReviewRecord(
  input: unknown
): ValidationResult<ClaimVerificationReviewRecord> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Claim verification review record must be a JSON object.' }]);
  }

  for (const finding of detectProhibitedPublicSecretsOrPii(input)) {
    issues.push({ path: 'pii_or_secret', code: 'PROHIBITED_PUBLIC_DATA', message: finding });
  }

  if (input.schemaVersion !== PHASE5B_MONITORING_SCHEMA_VERSION) {
    issues.push({
      path: 'schemaVersion',
      code: 'INVALID_SCHEMA_VERSION',
      message: `schemaVersion must equal "${PHASE5B_MONITORING_SCHEMA_VERSION}".`
    });
  }

  const claimId = typeof input.claimId === 'string' ? input.claimId.trim() : '';
  if (!isValidClaimId(claimId)) {
    issues.push({ path: 'claimId', code: 'INVALID_CLAIM_ID', message: `Invalid claimId "${claimId}".` });
  }

  const programId = typeof input.programId === 'string' ? input.programId.trim() : '';
  if (!isValidProgramId(programId)) {
    issues.push({ path: 'programId', code: 'INVALID_PROGRAM_ID', message: `Invalid programId "${programId}".` });
  }

  const rawIso = typeof input.countryIso === 'string' ? input.countryIso.trim() : '';
  const countryIso = isValidCanonicalIso2(rawIso) ? normalizeCountryIso2(rawIso) : '';
  if (!countryIso) {
    issues.push({ path: 'countryIso', code: 'INVALID_COUNTRY_ISO2', message: `Invalid countryIso "${rawIso}".` });
  }

  const claimCategory = input.claimCategory as HighRiskImmigrationClaimCategory;
  if (!HIGH_RISK_IMMIGRATION_CLAIM_CATEGORIES.includes(claimCategory)) {
    issues.push({
      path: 'claimCategory',
      code: 'INVALID_CLAIM_CATEGORY',
      message: `claimCategory must be one of the defined high-risk immigration categories.`
    });
  }

  const riskClass = input.riskClass as ChangeRiskClass;
  if (!CHANGE_RISK_CLASSES.includes(riskClass)) {
    issues.push({ path: 'riskClass', code: 'INVALID_RISK_CLASS', message: 'Invalid riskClass.' });
  }

  const officialSourceId = typeof input.officialSourceId === 'string' ? input.officialSourceId.trim() : '';
  if (!isValidOfficialSourceId(officialSourceId)) {
    issues.push({
      path: 'officialSourceId',
      code: 'INVALID_SOURCE_ID',
      message: `Invalid officialSourceId "${officialSourceId}".`
    });
  }

  const sourceAuthorityTier = input.sourceAuthorityTier as SourceAuthorityTier;
  if (!SOURCE_AUTHORITY_TIERS.includes(sourceAuthorityTier)) {
    issues.push({ path: 'sourceAuthorityTier', code: 'INVALID_AUTHORITY_TIER', message: 'Invalid authority tier.' });
  }

  const evidenceUrl = typeof input.evidenceUrl === 'string' ? input.evidenceUrl.trim() : '';
  if (sourceAuthorityTier === 'OFFICIAL_GOVERNMENT') {
    const chk = validateOfficialHttpsUrl(evidenceUrl);
    if (!chk.valid) {
      issues.push({ path: 'evidenceUrl', code: 'INVALID_OFFICIAL_URL', message: chk.reason || 'Invalid official URL.' });
    }
  }

  const verificationStatus = input.verificationStatus as ChangePipelineStatus;
  if (!CHANGE_PIPELINE_STATUSES.includes(verificationStatus)) {
    issues.push({
      path: 'verificationStatus',
      code: 'INVALID_PIPELINE_STATUS',
      message: `verificationStatus must be one of: ${CHANGE_PIPELINE_STATUSES.join(', ')}.`
    });
  }

  const reviewerStatus = input.reviewerStatus as ClaimReviewerStatus;
  if (!CLAIM_REVIEWER_STATUSES.includes(reviewerStatus)) {
    issues.push({
      path: 'reviewerStatus',
      code: 'INVALID_REVIEWER_STATUS',
      message: `reviewerStatus must be one of: ${CLAIM_REVIEWER_STATUSES.join(', ')}.`
    });
  }

  const retrievalTimestamp = typeof input.retrievalTimestamp === 'string' ? input.retrievalTimestamp.trim() : '';
  if (!isValidIsoDateOrTimestamp(retrievalTimestamp)) {
    issues.push({
      path: 'retrievalTimestamp',
      code: 'INVALID_TIMESTAMP',
      message: 'retrievalTimestamp must be a valid ISO-8601 timestamp.'
    });
  }

  // Strict trust invariants: third-party leads can NEVER be approved for publication
  if (
    sourceAuthorityTier === 'DISCOVERY_LEAD_ONLY' &&
    (verificationStatus === 'CLAIM_INDEPENDENTLY_VERIFIED' ||
      verificationStatus === 'CLAIM_APPROVED_FOR_PUBLICATION')
  ) {
    issues.push({
      path: 'sourceAuthorityTier',
      code: 'THIRD_PARTY_CANNOT_AUTHORIZE_PUBLICATION',
      message: 'Third-party discovery leads cannot independently verify or authorize publication of statutory claims.'
    });
  }

  if (verificationStatus === 'CLAIM_APPROVED_FOR_PUBLICATION' && reviewerStatus !== 'APPROVED') {
    issues.push({
      path: 'reviewerStatus',
      code: 'APPROVAL_WITHOUT_HUMAN_REVIEW',
      message: 'CLAIM_APPROVED_FOR_PUBLICATION requires reviewerStatus="APPROVED".'
    });
  }

  if (issues.length > 0) return fail(issues);

  return ok({
    schemaVersion: PHASE5B_MONITORING_SCHEMA_VERSION,
    claimId,
    programId,
    countryIso,
    claimCategory,
    riskClass,
    claimText: String(input.claimText || '').trim(),
    officialSourceId,
    sourceAuthorityTier,
    evidenceUrl,
    evidenceExcerpt: typeof input.evidenceExcerpt === 'string' ? input.evidenceExcerpt : null,
    retrievalTimestamp,
    effectiveDate: typeof input.effectiveDate === 'string' ? input.effectiveDate : null,
    verificationStatus,
    reviewerStatus,
    reviewedBy: typeof input.reviewedBy === 'string' ? input.reviewedBy : null,
    reviewedAt: typeof input.reviewedAt === 'string' ? input.reviewedAt : null,
    previousValue: typeof input.previousValue === 'string' ? input.previousValue : null,
    proposedNewValue: typeof input.proposedNewValue === 'string' ? input.proposedNewValue : null,
    isAiGeneratedProposal: Boolean(input.isAiGeneratedProposal),
    isUnverifiedTranslation: Boolean(input.isUnverifiedTranslation),
    conflictingOfficialSourceIds: Array.isArray(input.conflictingOfficialSourceIds)
      ? input.conflictingOfficialSourceIds.map(String)
      : [],
    expiresAt: typeof input.expiresAt === 'string' ? input.expiresAt : null
  });
}

export function validateEvidenceProposalRecord(input: unknown): ValidationResult<EvidenceReviewProposal> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Evidence proposal must be an object.' }]);
  }
  for (const finding of detectProhibitedPublicSecretsOrPii(input)) {
    issues.push({ path: 'pii_or_secret', code: 'PROHIBITED_PUBLIC_DATA', message: finding });
  }
  if (input.schemaVersion !== PHASE5B_MONITORING_SCHEMA_VERSION) {
    issues.push({ path: 'schemaVersion', code: 'INVALID_SCHEMA_VERSION', message: 'Invalid schemaVersion.' });
  }
  const proposalId = typeof input.proposalId === 'string' ? input.proposalId.trim() : '';
  if (!isValidEvidenceId(proposalId)) {
    issues.push({ path: 'proposalId', code: 'INVALID_EVIDENCE_ID', message: `Invalid proposalId "${proposalId}".` });
  }
  const sourceId = typeof input.sourceId === 'string' ? input.sourceId.trim() : '';
  if (!isValidOfficialSourceId(sourceId)) {
    issues.push({ path: 'sourceId', code: 'INVALID_SOURCE_ID', message: `Invalid sourceId "${sourceId}".` });
  }
  const urlCheck = validateOfficialHttpsUrl(input.evidenceUrl);
  if (!urlCheck.valid || !urlCheck.normalizedUrl) {
    issues.push({ path: 'evidenceUrl', code: 'INVALID_OFFICIAL_URL', message: urlCheck.reason || 'Invalid URL.' });
  }
  const retrievalTimestamp = typeof input.retrievalTimestamp === 'string' ? input.retrievalTimestamp.trim() : '';
  if (!isValidIsoDateOrTimestamp(retrievalTimestamp)) {
    issues.push({ path: 'retrievalTimestamp', code: 'INVALID_TIMESTAMP', message: 'Invalid retrievalTimestamp.' });
  }

  if (issues.length > 0 || !urlCheck.normalizedUrl) return fail(issues);

  return ok({
    schemaVersion: PHASE5B_MONITORING_SCHEMA_VERSION,
    proposalId,
    changeDetectionId: String(input.changeDetectionId || '').trim(),
    sourceId,
    countryIso: normalizeCountryIso2(String(input.countryIso || '')),
    evidenceUrl: urlCheck.normalizedUrl,
    retrievalTimestamp,
    previousFingerprint: typeof input.previousFingerprint === 'string' ? input.previousFingerprint : null,
    newFingerprint: typeof input.newFingerprint === 'string' ? input.newFingerprint : null,
    extractedExcerpt: typeof input.extractedExcerpt === 'string' ? input.extractedExcerpt : null,
    pipelineStatus: (input.pipelineStatus as EvidenceReviewProposal['pipelineStatus']) || 'SOURCE_CHANGED',
    reviewerStatus: (input.reviewerStatus as ClaimReviewerStatus) || 'PENDING_HUMAN_REVIEW',
    notes: String(input.notes || '').trim()
  });
}

/**
 * Helper: Maps existing `OfficialSourceCategory` to Phase 5B `OfficialSourceType`.
 */
export function inferOfficialSourceType(sourceCategory: string, url: string): OfficialSourceType {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('fee') || lowerUrl.includes('tariff') || lowerUrl.includes('schedule')) {
    return 'GOVERNMENT_FEE_SCHEDULE';
  }
  if (lowerUrl.includes('apply') || lowerUrl.includes('portal') || lowerUrl.includes('immiaccount') || lowerUrl.includes('ceac')) {
    return 'GOVERNMENT_APPLICATION_PORTAL';
  }
  switch (sourceCategory) {
    case 'CONSULAR_FOREIGN_AFFAIRS':
      return 'EMBASSY_CONSULATE';
    case 'OFFICIAL_GAZETTE_LEGISLATION':
      return 'OFFICIAL_LEGISLATION_GAZETTE';
    case 'GOVERNMENT_VISA_PORTAL':
      return 'GOVERNMENT_VISA_PORTAL';
    default:
      return 'IMMIGRATION_DEPARTMENT';
  }
}
