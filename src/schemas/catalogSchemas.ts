/**
 * VISAAPPLY.ORG — PHASE 2: STRICT STATIC CATALOG SCHEMAS & TRUST VALIDATORS
 *
 * Zero-dependency strict runtime validation & TypeScript contract definitions for
 * the zero-database-first static catalog architecture (`data/`).
 *
 * Preserves full backward compatibility with existing project registries, types,
 * ISO-249 identifiers, 15 interface languages, and Phase 3.1/3.2/B.3 trust rules.
 */

import {
  EVIDENCE_STATUSES,
  REQUIREMENT_CLASSIFICATIONS,
  type EvidenceStatus,
  type RequirementClassification
} from '../types/visaComprehensiveProfile';
import type { ImmigrationProgram as LegacyImmigrationProgram } from '../data/globalImmigrationHubData';
import type { OfficialSourceEntry as LegacyOfficialSourceEntry } from '../data/officialSourceRegistry';
import type { ImmigrationChangelogItem as LegacyChangelogItem } from '../services/immigrationAutoSync';
import type { SupportedLangCode } from '../i18n/config';
import {
  ALLOWED_CATALOG_CATEGORIES,
  CANONICAL_15_LANGUAGES_SET,
  type CatalogImmigrationCategory,
  detectProhibitedPublicSecretsOrPii,
  extractProgramIdCountryIso,
  generateOfficialSourceId,
  isForbiddenFixtureId,
  isValidCanonicalIso2,
  isValidChangelogId,
  isValidClaimId,
  isValidEditorialSlug,
  isValidEvidenceId,
  isValidIsoDateOrTimestamp,
  isValidOfficialSourceId,
  isValidProgramId,
  isValidRouteId,
  isValidVisaDetailId,
  normalizeCountryIso2,
  validateOfficialHttpsUrl
} from './idRules';

export * from './idRules';

export const STATIC_CATALOG_SCHEMA_VERSION = '2.0.0' as const;

// ============================================================================
// CORE VALIDATION RESULT TYPES (ZERO-DEPENDENCY STRICT ENGINE)
// ============================================================================

export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
}

export type ValidationResult<T> =
  | { success: true; data: T; issues: [] }
  | { success: false; issues: ValidationIssue[] };

function ok<T>(data: T): ValidationResult<T> {
  return { success: true, data, issues: [] };
}

function fail<T>(issues: ValidationIssue[]): ValidationResult<T> {
  return { success: false, issues };
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return Boolean(val) && typeof val === 'object' && !Array.isArray(val);
}

function addIssue(issues: ValidationIssue[], path: string, code: string, message: string): void {
  issues.push({ path, code, message });
}

function requireNonEmptyString(
  obj: Record<string, unknown>,
  key: string,
  issues: ValidationIssue[],
  prefix: string = ''
): string {
  const path = prefix ? `${prefix}.${key}` : key;
  const val = obj[key];
  if (typeof val !== 'string' || val.trim().length === 0) {
    addIssue(issues, path, 'REQUIRED_STRING', `Field "${path}" must be a non-empty string.`);
    return '';
  }
  return val.trim();
}

function optionalNullableString(
  obj: Record<string, unknown>,
  key: string,
  issues: ValidationIssue[],
  prefix: string = ''
): string | null | undefined {
  const path = prefix ? `${prefix}.${key}` : key;
  const val = obj[key];
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (typeof val !== 'string') {
    addIssue(issues, path, 'INVALID_STRING', `Optional field "${path}" must be a string, null, or omitted.`);
    return undefined;
  }
  return val;
}

function requireEnum<T extends string>(
  val: unknown,
  allowed: readonly T[],
  path: string,
  issues: ValidationIssue[]
): T | undefined {
  if (typeof val !== 'string' || !(allowed as readonly string[]).includes(val)) {
    addIssue(issues, path, 'INVALID_ENUM', `Field "${path}" must be one of: ${allowed.join(', ')}.`);
    return undefined;
  }
  return val as T;
}

// ============================================================================
// G. VERIFICATION, PUBLICATION & QUARANTINE ENUMS
// ============================================================================

export const CATALOG_VERIFICATION_STATUSES = [
  'AVAILABLE_VERIFIED',
  'NOT_AVAILABLE_CONFIRMED',
  'AWAITING_OFFICIAL_VERIFICATION',
  'NEEDS_REVIEW',
  'CONFLICTING',
  'EXPIRED',
  'QUARANTINED',
  'TEMPORARILY_CLOSED'
] as const;

export type CatalogVerificationStatus = (typeof CATALOG_VERIFICATION_STATUSES)[number];

/**
 * Only records in these states may satisfy the public index publication gate.
 */
export const PUBLISHABLE_VERIFICATION_STATUSES: ReadonlySet<CatalogVerificationStatus> = new Set([
  'AVAILABLE_VERIFIED',
  'NOT_AVAILABLE_CONFIRMED'
]);

export const NON_PUBLISHABLE_VERIFICATION_STATUSES: ReadonlySet<CatalogVerificationStatus> = new Set([
  'AWAITING_OFFICIAL_VERIFICATION',
  'NEEDS_REVIEW',
  'CONFLICTING',
  'EXPIRED',
  'QUARANTINED',
  'TEMPORARILY_CLOSED'
]);

export const PUBLICATION_STATUSES = ['PUBLISHED', 'DRAFT', 'QUARANTINED', 'ARCHIVED'] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const RECORD_STATUSES = ['ACTIVE', 'INACTIVE', 'UNINHABITED_TERRITORY', 'QUARANTINED'] as const;
export type CountryRecordStatus = (typeof RECORD_STATUSES)[number];

export const OFFICIAL_SOURCE_CATEGORIES = [
  'SOVEREIGN_IMMIGRATION_PORTAL',
  'CONSULAR_FOREIGN_AFFAIRS',
  'OFFICIAL_GAZETTE_LEGISLATION',
  'GOVERNMENT_VISA_PORTAL',
  'MINISTRY_OF_INTERIOR',
  'CUSTOMS_AND_AGRICULTURE_PET_AUTHORITY'
] as const;
export type OfficialSourceCategory = (typeof OFFICIAL_SOURCE_CATEGORIES)[number];

export const HTTP_AVAILABILITY_STATUSES = [
  'REACHABLE_2XX',
  'REDIRECT_3XX',
  'CLIENT_ERROR_4XX',
  'SERVER_ERROR_5XX',
  'TIMEOUT',
  'UNREACHABLE',
  'NOT_YET_CHECKED'
] as const;
export type HttpAvailabilityStatus = (typeof HTTP_AVAILABILITY_STATUSES)[number];

export const PROGRAM_TYPES = [
  'Actual Immigration Program',
  'Candidate Selection Management System',
  'Administrative Application Procedure',
  'Residence Permit Subclass',
  'Citizenship Track',
  'Pet Import Authorization',
  'Expired Scheme'
] as const;
export type CatalogProgramType = (typeof PROGRAM_TYPES)[number];

export const CHANGELOG_CATEGORIES = [
  'NEW_VISA',
  'FEE_UPDATE',
  'PROCESSING_UPDATE',
  'DOCS_UPDATE',
  'VISA_FREE_UPDATE',
  'ELIGIBILITY_UPDATE',
  'PROGRAM_CLOSED',
  'SOURCE_URL_UPDATE',
  'CORRECTION'
] as const;
export type CatalogChangeCategory = (typeof CHANGELOG_CATEGORIES)[number];

export const EDITORIAL_STATUSES = ['published', 'draft', 'archived'] as const;
export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

// ============================================================================
// A. COUNTRY SCHEMA
// ============================================================================

export interface CountryRecord {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  isoCode: string; // Uppercase canonical 249 ISO-3166-1 alpha-2 (e.g., "US")
  slug: string; // Lowercase ISO code (e.g., "us")
  countryName: string;
  localizedNames: Partial<Record<SupportedLangCode, string>>;
  officialCountryDomain: string; // e.g., "gov", "gov.uk", "canada.ca", "gov.in"
  immigrationAuthorityRefs: string[]; // OfficialSource IDs (`SRC-<ISO>-<AUTH>`)
  supportedLanguages: SupportedLangCode[];
  availableImmigrationCategories: CatalogImmigrationCategory[];
  lastReviewedAt: string; // ISO date or timestamp
  recordStatus: CountryRecordStatus;
  flag?: string | null;
  continent?: string | null;
  notes?: string | null;
}

export function validateCountryRecord(input: unknown): ValidationResult<CountryRecord> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Country record must be a JSON object.' }]);
  }

  const piiIssues = detectProhibitedPublicSecretsOrPii(input);
  for (const msg of piiIssues) {
    addIssue(issues, 'pii_or_secret', 'PROHIBITED_PUBLIC_DATA', msg);
  }

  if (input.schemaVersion !== STATIC_CATALOG_SCHEMA_VERSION) {
    addIssue(
      issues,
      'schemaVersion',
      'INVALID_SCHEMA_VERSION',
      `schemaVersion must equal "${STATIC_CATALOG_SCHEMA_VERSION}".`
    );
  }

  const rawIso = requireNonEmptyString(input, 'isoCode', issues);
  let normalizedIso = '';
  if (rawIso) {
    if (!isValidCanonicalIso2(rawIso)) {
      addIssue(issues, 'isoCode', 'INVALID_COUNTRY_ISO2', `"${rawIso}" is not in the canonical 249-ISO country registry.`);
    } else {
      normalizedIso = normalizeCountryIso2(rawIso);
    }
  }

  const slug = requireNonEmptyString(input, 'slug', issues);
  if (normalizedIso && slug && slug !== normalizedIso.toLowerCase()) {
    addIssue(issues, 'slug', 'SLUG_ISO_MISMATCH', `slug "${slug}" must equal lowercase isoCode "${normalizedIso.toLowerCase()}".`);
  }

  const countryName = requireNonEmptyString(input, 'countryName', issues);

  const localizedNames: Partial<Record<SupportedLangCode, string>> = {};
  if (input.localizedNames !== undefined) {
    if (!isPlainObject(input.localizedNames)) {
      addIssue(issues, 'localizedNames', 'INVALID_TYPE', 'localizedNames must be a map of language code to localized string.');
    } else {
      for (const [lang, val] of Object.entries(input.localizedNames)) {
        if (!CANONICAL_15_LANGUAGES_SET.has(lang as SupportedLangCode)) {
          addIssue(issues, `localizedNames.${lang}`, 'UNSUPPORTED_LANGUAGE', `Language "${lang}" is not one of the 15 supported languages.`);
        } else if (typeof val !== 'string' || !val.trim()) {
          addIssue(issues, `localizedNames.${lang}`, 'INVALID_STRING', `Localized name for "${lang}" must be a non-empty string.`);
        } else {
          localizedNames[lang as SupportedLangCode] = val.trim();
        }
      }
    }
  }

  const officialCountryDomain = requireNonEmptyString(input, 'officialCountryDomain', issues);
  if (officialCountryDomain && !/^[a-z0-9.-]+\.[a-z]{2,}$|^[a-z]{2,}$/i.test(officialCountryDomain)) {
    addIssue(issues, 'officialCountryDomain', 'INVALID_DOMAIN', `officialCountryDomain "${officialCountryDomain}" is malformed.`);
  }

  const immigrationAuthorityRefs: string[] = [];
  if (!Array.isArray(input.immigrationAuthorityRefs)) {
    addIssue(issues, 'immigrationAuthorityRefs', 'REQUIRED_ARRAY', 'immigrationAuthorityRefs must be an array of Official Source IDs.');
  } else {
    const seen = new Set<string>();
    input.immigrationAuthorityRefs.forEach((ref, idx) => {
      if (!isValidOfficialSourceId(ref)) {
        addIssue(issues, `immigrationAuthorityRefs[${idx}]`, 'INVALID_SOURCE_ID', `Invalid Official Source ID "${String(ref)}".`);
      } else if (seen.has(ref)) {
        addIssue(issues, `immigrationAuthorityRefs[${idx}]`, 'DUPLICATE_REFERENCE', `Duplicate authority reference "${ref}".`);
      } else {
        seen.add(ref);
        immigrationAuthorityRefs.push(ref);
      }
    });
  }

  const supportedLanguages: SupportedLangCode[] = [];
  if (!Array.isArray(input.supportedLanguages) || input.supportedLanguages.length === 0) {
    addIssue(issues, 'supportedLanguages', 'REQUIRED_ARRAY', 'supportedLanguages must be a non-empty array.');
  } else {
    const seen = new Set<string>();
    input.supportedLanguages.forEach((lang, idx) => {
      if (!CANONICAL_15_LANGUAGES_SET.has(lang as SupportedLangCode)) {
        addIssue(issues, `supportedLanguages[${idx}]`, 'UNSUPPORTED_LANGUAGE', `Unsupported language "${String(lang)}".`);
      } else if (!seen.has(lang as string)) {
        seen.add(lang as string);
        supportedLanguages.push(lang as SupportedLangCode);
      }
    });
  }

  const availableImmigrationCategories: CatalogImmigrationCategory[] = [];
  if (!Array.isArray(input.availableImmigrationCategories)) {
    addIssue(issues, 'availableImmigrationCategories', 'REQUIRED_ARRAY', 'availableImmigrationCategories must be an array.');
  } else {
    const seen = new Set<string>();
    input.availableImmigrationCategories.forEach((cat, idx) => {
      const checked = requireEnum(cat, ALLOWED_CATALOG_CATEGORIES, `availableImmigrationCategories[${idx}]`, issues);
      if (checked && !seen.has(checked)) {
        seen.add(checked);
        availableImmigrationCategories.push(checked);
      }
    });
  }

  const lastReviewedAt = requireNonEmptyString(input, 'lastReviewedAt', issues);
  if (lastReviewedAt && !isValidIsoDateOrTimestamp(lastReviewedAt)) {
    addIssue(issues, 'lastReviewedAt', 'INVALID_DATE', `lastReviewedAt "${lastReviewedAt}" must be a valid ISO-8601 date/timestamp.`);
  }

  const recordStatus = requireEnum(input.recordStatus, RECORD_STATUSES, 'recordStatus', issues);

  if (recordStatus === 'ACTIVE' && immigrationAuthorityRefs.length === 0) {
    addIssue(
      issues,
      'immigrationAuthorityRefs',
      'MISSING_OFFICIAL_AUTHORITY',
      'Active country records must reference at least one official immigration authority.'
    );
  }

  const flag = optionalNullableString(input, 'flag', issues);
  const continent = optionalNullableString(input, 'continent', issues);
  const notes = optionalNullableString(input, 'notes', issues);

  if (issues.length > 0 || !recordStatus) return fail(issues);

  return ok({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    isoCode: normalizedIso,
    slug,
    countryName,
    localizedNames,
    officialCountryDomain,
    immigrationAuthorityRefs,
    supportedLanguages,
    availableImmigrationCategories,
    lastReviewedAt,
    recordStatus,
    ...(flag !== undefined ? { flag } : {}),
    ...(continent !== undefined ? { continent } : {}),
    ...(notes !== undefined ? { notes } : {})
  });
}

// ============================================================================
// B. IMMIGRATION PROGRAM SCHEMA
// ============================================================================

export interface OfficialSourceReference {
  sourceId: string;
  url: string;
  title?: string | null;
}

export interface ImmigrationProgramRecord {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  programId: string;
  destinationCountryIso: string;
  programName: string;
  localLanguageName?: string | null;
  immigrationCategory: CatalogImmigrationCategory;
  programType: CatalogProgramType;
  eligibilitySummary: string;
  officialSourceRefs: OfficialSourceReference[];
  verificationStatus: CatalogVerificationStatus;
  createdDate: string;
  lastVerifiedDate: string | null;
  lastUpdatedDate: string;
  expiresAt?: string | null;
  publicationStatus: PublicationStatus;
  legalBasis?: string | null;
  applyFrom?: 'Offshore' | 'Onshore' | 'Both' | null;
  evidenceIds?: string[];
}

export function validateImmigrationProgramRecord(
  input: unknown,
  options: { nowDate?: Date } = {}
): ValidationResult<ImmigrationProgramRecord> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Immigration program record must be a JSON object.' }]);
  }

  const piiIssues = detectProhibitedPublicSecretsOrPii(input);
  for (const msg of piiIssues) {
    addIssue(issues, 'pii_or_secret', 'PROHIBITED_PUBLIC_DATA', msg);
  }

  if (input.schemaVersion !== STATIC_CATALOG_SCHEMA_VERSION) {
    addIssue(issues, 'schemaVersion', 'INVALID_SCHEMA_VERSION', `schemaVersion must equal "${STATIC_CATALOG_SCHEMA_VERSION}".`);
  }

  const programId = requireNonEmptyString(input, 'programId', issues);
  if (programId) {
    if (isForbiddenFixtureId(programId)) {
      addIssue(issues, 'programId', 'FORBIDDEN_PHASE32_FIXTURE', `Deleted Phase 3.2 or synthetic fixture ID "${programId}" is forbidden.`);
    } else if (!isValidProgramId(programId)) {
      addIssue(issues, 'programId', 'INVALID_PROGRAM_ID', `programId "${programId}" violates canonical/preserved ID rules.`);
    }
  }

  const rawIso = requireNonEmptyString(input, 'destinationCountryIso', issues);
  let destinationCountryIso = '';
  if (rawIso) {
    if (!isValidCanonicalIso2(rawIso)) {
      addIssue(issues, 'destinationCountryIso', 'INVALID_COUNTRY_ISO2', `"${rawIso}" is not a valid canonical 249-ISO country code.`);
    } else {
      destinationCountryIso = normalizeCountryIso2(rawIso);
    }
  }

  const resolvedProgramIso = programId ? extractProgramIdCountryIso(programId) : null;
  if (programId && destinationCountryIso && resolvedProgramIso && resolvedProgramIso !== destinationCountryIso) {
    addIssue(
      issues,
      'programId',
      'PROGRAM_COUNTRY_PREFIX_MISMATCH',
      `programId "${programId}" prefix (${resolvedProgramIso}) must match destinationCountryIso "${destinationCountryIso}".`
    );
  }

  const programName = requireNonEmptyString(input, 'programName', issues);
  const localLanguageName = optionalNullableString(input, 'localLanguageName', issues);
  const immigrationCategory = requireEnum(input.immigrationCategory, ALLOWED_CATALOG_CATEGORIES, 'immigrationCategory', issues);
  const programType = requireEnum(input.programType, PROGRAM_TYPES, 'programType', issues);
  const eligibilitySummary = requireNonEmptyString(input, 'eligibilitySummary', issues);

  const officialSourceRefs: OfficialSourceReference[] = [];
  if (!Array.isArray(input.officialSourceRefs)) {
    addIssue(issues, 'officialSourceRefs', 'REQUIRED_ARRAY', 'officialSourceRefs must be an array.');
  } else {
    input.officialSourceRefs.forEach((ref, idx) => {
      if (!isPlainObject(ref)) {
        addIssue(issues, `officialSourceRefs[${idx}]`, 'INVALID_TYPE', 'Official source reference must be an object.');
        return;
      }
      const sourceId = requireNonEmptyString(ref, 'sourceId', issues, `officialSourceRefs[${idx}]`);
      if (sourceId && !isValidOfficialSourceId(sourceId)) {
        addIssue(issues, `officialSourceRefs[${idx}].sourceId`, 'INVALID_SOURCE_ID', `Invalid Official Source ID "${sourceId}".`);
      }
      const urlCheck = validateOfficialHttpsUrl(ref.url);
      if (!urlCheck.valid) {
        addIssue(issues, `officialSourceRefs[${idx}].url`, 'INVALID_OFFICIAL_URL', urlCheck.reason || 'Invalid official URL.');
      }
      const title = optionalNullableString(ref, 'title', issues, `officialSourceRefs[${idx}]`);
      if (sourceId && urlCheck.valid && urlCheck.normalizedUrl) {
        officialSourceRefs.push({
          sourceId,
          url: urlCheck.normalizedUrl,
          ...(title !== undefined ? { title } : {})
        });
      }
    });
  }

  const verificationStatus = requireEnum(input.verificationStatus, CATALOG_VERIFICATION_STATUSES, 'verificationStatus', issues);
  const publicationStatus = requireEnum(input.publicationStatus, PUBLICATION_STATUSES, 'publicationStatus', issues);

  const createdDate = requireNonEmptyString(input, 'createdDate', issues);
  if (createdDate && !isValidIsoDateOrTimestamp(createdDate)) {
    addIssue(issues, 'createdDate', 'INVALID_DATE', `createdDate "${createdDate}" is not a valid ISO-8601 date.`);
  }

  const lastUpdatedDate = requireNonEmptyString(input, 'lastUpdatedDate', issues);
  if (lastUpdatedDate && !isValidIsoDateOrTimestamp(lastUpdatedDate)) {
    addIssue(issues, 'lastUpdatedDate', 'INVALID_DATE', `lastUpdatedDate "${lastUpdatedDate}" is not a valid ISO-8601 date.`);
  }

  let lastVerifiedDate: string | null = null;
  if (input.lastVerifiedDate === null || input.lastVerifiedDate === undefined) {
    lastVerifiedDate = null;
  } else if (typeof input.lastVerifiedDate === 'string' && isValidIsoDateOrTimestamp(input.lastVerifiedDate)) {
    lastVerifiedDate = input.lastVerifiedDate.trim();
  } else {
    addIssue(issues, 'lastVerifiedDate', 'INVALID_DATE', 'lastVerifiedDate must be a valid ISO-8601 date/timestamp or null.');
  }

  const expiresAt = optionalNullableString(input, 'expiresAt', issues);
  if (expiresAt && !isValidIsoDateOrTimestamp(expiresAt)) {
    addIssue(issues, 'expiresAt', 'INVALID_DATE', `expiresAt "${expiresAt}" must be a valid ISO-8601 date/timestamp.`);
  }

  const legalBasis = optionalNullableString(input, 'legalBasis', issues);
  let applyFrom: 'Offshore' | 'Onshore' | 'Both' | null | undefined = undefined;
  if (input.applyFrom !== undefined && input.applyFrom !== null) {
    applyFrom = requireEnum(input.applyFrom, ['Offshore', 'Onshore', 'Both'] as const, 'applyFrom', issues);
  } else if (input.applyFrom === null) {
    applyFrom = null;
  }

  let evidenceIds: string[] | undefined = undefined;
  if (input.evidenceIds !== undefined) {
    if (!Array.isArray(input.evidenceIds)) {
      addIssue(issues, 'evidenceIds', 'INVALID_ARRAY', 'evidenceIds must be an array of Evidence IDs.');
    } else {
      evidenceIds = [];
      input.evidenceIds.forEach((eid, idx) => {
        if (!isValidEvidenceId(eid)) {
          addIssue(issues, `evidenceIds[${idx}]`, 'INVALID_EVIDENCE_ID', `Invalid evidence ID "${String(eid)}".`);
        } else {
          evidenceIds!.push(eid);
        }
      });
    }
  }

  // STRICT IMMIGRATION TRUST RULES (Section 5)
  const now = options.nowDate ?? new Date();
  const isExpiredByDate = Boolean(expiresAt && isValidIsoDateOrTimestamp(expiresAt) && new Date(expiresAt).getTime() < now.getTime());

  if (publicationStatus === 'PUBLISHED') {
    if (!verificationStatus || !PUBLISHABLE_VERIFICATION_STATUSES.has(verificationStatus)) {
      addIssue(
        issues,
        'publicationStatus',
        'UNVERIFIED_PUBLICATION_REJECTED',
        `Cannot mark program PUBLISHED with verificationStatus="${String(verificationStatus)}". Only AVAILABLE_VERIFIED or NOT_AVAILABLE_CONFIRMED may be published.`
      );
    }
    if (officialSourceRefs.length === 0) {
      addIssue(
        issues,
        'officialSourceRefs',
        'MISSING_OFFICIAL_SOURCE_URL',
        'Every published program must have at least one valid official HTTPS source URL.'
      );
    }
    if (!lastVerifiedDate) {
      addIssue(
        issues,
        'lastVerifiedDate',
        'MISSING_VERIFICATION_DATE',
        'Published verified programs must record an actual lastVerifiedDate.'
      );
    }
    if (isExpiredByDate) {
      addIssue(
        issues,
        'expiresAt',
        'EXPIRED_PROGRAM_PUBLICATION_REJECTED',
        `Program expired on ${expiresAt} and must be transitioned to EXPIRED/QUARANTINED rather than PUBLISHED.`
      );
    }
  }

  if (verificationStatus === 'AVAILABLE_VERIFIED') {
    if (officialSourceRefs.length === 0) {
      addIssue(
        issues,
        'officialSourceRefs',
        'VERIFIED_WITHOUT_OFFICIAL_SOURCE',
        'Never label a program AVAILABLE_VERIFIED without at least one valid official source reference.'
      );
    }
    if (!lastVerifiedDate) {
      addIssue(
        issues,
        'lastVerifiedDate',
        'VERIFIED_WITHOUT_VERIFICATION_DATE',
        'AVAILABLE_VERIFIED programs must include lastVerifiedDate.'
      );
    }
    if (isExpiredByDate) {
      addIssue(
        issues,
        'verificationStatus',
        'EXPIRED_MARKED_AVAILABLE',
        `Program expired on ${expiresAt} and cannot remain AVAILABLE_VERIFIED.`
      );
    }
  }

  if (issues.length > 0 || !immigrationCategory || !programType || !verificationStatus || !publicationStatus) {
    return fail(issues);
  }

  return ok({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    programId,
    destinationCountryIso,
    programName,
    ...(localLanguageName !== undefined ? { localLanguageName } : {}),
    immigrationCategory,
    programType,
    eligibilitySummary,
    officialSourceRefs,
    verificationStatus,
    createdDate,
    lastVerifiedDate,
    lastUpdatedDate,
    ...(expiresAt !== undefined ? { expiresAt } : {}),
    publicationStatus,
    ...(legalBasis !== undefined ? { legalBasis } : {}),
    ...(applyFrom !== undefined ? { applyFrom } : {}),
    ...(evidenceIds !== undefined ? { evidenceIds } : {})
  });
}

// ============================================================================
// C. VISA DETAIL SCHEMA (All optional fields stay optional / null — never fabricated)
// ============================================================================

export interface VisaDetailFeeItem {
  label: string;
  amount: string;
  currency?: string | null;
  officialSourceUrl?: string | null;
}

export interface VisaDetailFaqItem {
  question: string;
  answer: string;
  officialSourceUrl?: string | null;
}

export interface VisaDetailRecord {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  detailId: string; // `vd-<programId>`
  programId: string;
  destinationCountryIso: string;
  verificationStatus: CatalogVerificationStatus;
  publicationStatus: PublicationStatus;
  lastVerifiedDate: string | null;
  lastUpdatedDate: string;
  sections: {
    overview?: string | null;
    eligibility?: string | null;
    nationalityRestrictions?: string | null;
    ageRequirements?: string | null;
    educationRequirements?: string | null;
    workExperience?: string | null;
    financialRequirements?: string | null;
    requiredDocuments?: string[] | null;
    applicationProcess?: string[] | string | null;
    applicationFees?: VisaDetailFeeItem[] | string | null;
    processingTime?: string | null;
    validity?: string | null;
    renewal?: string | null;
    familyDependentProvisions?: string | null;
    rightsAndRestrictions?: string | null;
    officialApplicationLinks?: string[] | null;
    frequentlyAskedQuestions?: VisaDetailFaqItem[] | null;
  };
  claimIds: string[];
  evidenceIds: string[];
}

export function validateVisaDetailRecord(input: unknown): ValidationResult<VisaDetailRecord> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Visa detail record must be a JSON object.' }]);
  }

  const piiIssues = detectProhibitedPublicSecretsOrPii(input);
  for (const msg of piiIssues) {
    addIssue(issues, 'pii_or_secret', 'PROHIBITED_PUBLIC_DATA', msg);
  }

  if (input.schemaVersion !== STATIC_CATALOG_SCHEMA_VERSION) {
    addIssue(issues, 'schemaVersion', 'INVALID_SCHEMA_VERSION', `schemaVersion must equal "${STATIC_CATALOG_SCHEMA_VERSION}".`);
  }

  const detailId = requireNonEmptyString(input, 'detailId', issues);
  const programId = requireNonEmptyString(input, 'programId', issues);
  if (detailId && !isValidVisaDetailId(detailId)) {
    addIssue(issues, 'detailId', 'INVALID_VISA_DETAIL_ID', `detailId "${detailId}" must follow "vd-<programId>".`);
  }
  if (programId && !isValidProgramId(programId)) {
    addIssue(issues, 'programId', 'INVALID_PROGRAM_ID', `Invalid programId "${programId}".`);
  }
  if (detailId && programId && detailId !== `vd-${programId}`) {
    addIssue(issues, 'detailId', 'DETAIL_PROGRAM_ID_MISMATCH', `detailId "${detailId}" must equal "vd-${programId}".`);
  }

  const rawIso = requireNonEmptyString(input, 'destinationCountryIso', issues);
  const destinationCountryIso = rawIso && isValidCanonicalIso2(rawIso) ? normalizeCountryIso2(rawIso) : '';
  if (rawIso && !destinationCountryIso) {
    addIssue(issues, 'destinationCountryIso', 'INVALID_COUNTRY_ISO2', `"${rawIso}" is not a canonical 249-ISO code.`);
  }

  const verificationStatus = requireEnum(input.verificationStatus, CATALOG_VERIFICATION_STATUSES, 'verificationStatus', issues);
  const publicationStatus = requireEnum(input.publicationStatus, PUBLICATION_STATUSES, 'publicationStatus', issues);

  let lastVerifiedDate: string | null = null;
  if (input.lastVerifiedDate !== null && input.lastVerifiedDate !== undefined) {
    if (typeof input.lastVerifiedDate === 'string' && isValidIsoDateOrTimestamp(input.lastVerifiedDate)) {
      lastVerifiedDate = input.lastVerifiedDate.trim();
    } else {
      addIssue(issues, 'lastVerifiedDate', 'INVALID_DATE', 'lastVerifiedDate must be ISO-8601 or null.');
    }
  }

  const lastUpdatedDate = requireNonEmptyString(input, 'lastUpdatedDate', issues);
  if (lastUpdatedDate && !isValidIsoDateOrTimestamp(lastUpdatedDate)) {
    addIssue(issues, 'lastUpdatedDate', 'INVALID_DATE', 'lastUpdatedDate must be ISO-8601.');
  }

  const sections: VisaDetailRecord['sections'] = {};
  if (!isPlainObject(input.sections)) {
    addIssue(issues, 'sections', 'REQUIRED_OBJECT', 'sections must be an object (optional keys may be null or omitted).');
  } else {
    const s = input.sections;
    const stringFields = [
      'overview',
      'eligibility',
      'nationalityRestrictions',
      'ageRequirements',
      'educationRequirements',
      'workExperience',
      'financialRequirements',
      'processingTime',
      'validity',
      'renewal',
      'familyDependentProvisions',
      'rightsAndRestrictions'
    ] as const;

    for (const field of stringFields) {
      const val = optionalNullableString(s, field, issues, 'sections');
      if (val !== undefined) sections[field] = val;
    }

    if (s.requiredDocuments !== undefined) {
      if (s.requiredDocuments === null) {
        sections.requiredDocuments = null;
      } else if (Array.isArray(s.requiredDocuments) && s.requiredDocuments.every((d) => typeof d === 'string')) {
        sections.requiredDocuments = s.requiredDocuments;
      } else {
        addIssue(issues, 'sections.requiredDocuments', 'INVALID_ARRAY', 'requiredDocuments must be string[] or null.');
      }
    }

    if (s.applicationProcess !== undefined) {
      if (
        s.applicationProcess === null ||
        typeof s.applicationProcess === 'string' ||
        (Array.isArray(s.applicationProcess) && s.applicationProcess.every((x) => typeof x === 'string'))
      ) {
        sections.applicationProcess = s.applicationProcess as string[] | string | null;
      } else {
        addIssue(issues, 'sections.applicationProcess', 'INVALID_TYPE', 'applicationProcess must be string, string[], or null.');
      }
    }

    if (s.applicationFees !== undefined) {
      if (s.applicationFees === null || typeof s.applicationFees === 'string') {
        sections.applicationFees = s.applicationFees as string | null;
      } else if (Array.isArray(s.applicationFees)) {
        const feeItems: VisaDetailFeeItem[] = [];
        s.applicationFees.forEach((f, idx) => {
          if (!isPlainObject(f)) {
            addIssue(issues, `sections.applicationFees[${idx}]`, 'INVALID_TYPE', 'Fee item must be an object.');
            return;
          }
          const label = requireNonEmptyString(f, 'label', issues, `sections.applicationFees[${idx}]`);
          const amount = requireNonEmptyString(f, 'amount', issues, `sections.applicationFees[${idx}]`);
          const currency = optionalNullableString(f, 'currency', issues, `sections.applicationFees[${idx}]`);
          const srcUrl = optionalNullableString(f, 'officialSourceUrl', issues, `sections.applicationFees[${idx}]`);
          if (srcUrl) {
            const chk = validateOfficialHttpsUrl(srcUrl);
            if (!chk.valid) {
              addIssue(issues, `sections.applicationFees[${idx}].officialSourceUrl`, 'INVALID_OFFICIAL_URL', chk.reason || 'Invalid URL');
            }
          }
          feeItems.push({ label, amount, ...(currency !== undefined ? { currency } : {}), ...(srcUrl !== undefined ? { officialSourceUrl: srcUrl } : {}) });
        });
        sections.applicationFees = feeItems;
      } else {
        addIssue(issues, 'sections.applicationFees', 'INVALID_TYPE', 'applicationFees must be FeeItem[], string, or null.');
      }
    }

    if (s.officialApplicationLinks !== undefined) {
      if (s.officialApplicationLinks === null) {
        sections.officialApplicationLinks = null;
      } else if (Array.isArray(s.officialApplicationLinks)) {
        const validLinks: string[] = [];
        s.officialApplicationLinks.forEach((link, idx) => {
          const chk = validateOfficialHttpsUrl(link);
          if (!chk.valid) {
            addIssue(issues, `sections.officialApplicationLinks[${idx}]`, 'INVALID_OFFICIAL_URL', chk.reason || 'Invalid official application link.');
          } else if (chk.normalizedUrl) {
            validLinks.push(chk.normalizedUrl);
          }
        });
        sections.officialApplicationLinks = validLinks;
      } else {
        addIssue(issues, 'sections.officialApplicationLinks', 'INVALID_ARRAY', 'officialApplicationLinks must be string[] or null.');
      }
    }

    if (s.frequentlyAskedQuestions !== undefined) {
      if (s.frequentlyAskedQuestions === null) {
        sections.frequentlyAskedQuestions = null;
      } else if (Array.isArray(s.frequentlyAskedQuestions)) {
        const faqs: VisaDetailFaqItem[] = [];
        s.frequentlyAskedQuestions.forEach((item, idx) => {
          if (!isPlainObject(item)) {
            addIssue(issues, `sections.frequentlyAskedQuestions[${idx}]`, 'INVALID_TYPE', 'FAQ item must be an object.');
            return;
          }
          const question = requireNonEmptyString(item, 'question', issues, `sections.frequentlyAskedQuestions[${idx}]`);
          const answer = requireNonEmptyString(item, 'answer', issues, `sections.frequentlyAskedQuestions[${idx}]`);
          const officialSourceUrl = optionalNullableString(item, 'officialSourceUrl', issues, `sections.frequentlyAskedQuestions[${idx}]`);
          if (officialSourceUrl) {
            const chk = validateOfficialHttpsUrl(officialSourceUrl);
            if (!chk.valid) {
              addIssue(issues, `sections.frequentlyAskedQuestions[${idx}].officialSourceUrl`, 'INVALID_OFFICIAL_URL', chk.reason || 'Invalid FAQ official URL');
            }
          }
          faqs.push({ question, answer, ...(officialSourceUrl !== undefined ? { officialSourceUrl } : {}) });
        });
        sections.frequentlyAskedQuestions = faqs;
      } else {
        addIssue(issues, 'sections.frequentlyAskedQuestions', 'INVALID_ARRAY', 'frequentlyAskedQuestions must be FAQ[] or null.');
      }
    }
  }

  const claimIds: string[] = [];
  if (!Array.isArray(input.claimIds)) {
    addIssue(issues, 'claimIds', 'REQUIRED_ARRAY', 'claimIds must be an array.');
  } else {
    input.claimIds.forEach((cid, idx) => {
      if (!isValidClaimId(cid)) addIssue(issues, `claimIds[${idx}]`, 'INVALID_CLAIM_ID', `Invalid claimId "${String(cid)}".`);
      else claimIds.push(cid);
    });
  }

  const evidenceIds: string[] = [];
  if (!Array.isArray(input.evidenceIds)) {
    addIssue(issues, 'evidenceIds', 'REQUIRED_ARRAY', 'evidenceIds must be an array.');
  } else {
    input.evidenceIds.forEach((eid, idx) => {
      if (!isValidEvidenceId(eid)) addIssue(issues, `evidenceIds[${idx}]`, 'INVALID_EVIDENCE_ID', `Invalid evidenceId "${String(eid)}".`);
      else evidenceIds.push(eid);
    });
  }

  if (publicationStatus === 'PUBLISHED') {
    if (!verificationStatus || !PUBLISHABLE_VERIFICATION_STATUSES.has(verificationStatus)) {
      addIssue(issues, 'publicationStatus', 'UNVERIFIED_PUBLICATION_REJECTED', 'Published visa details require AVAILABLE_VERIFIED or NOT_AVAILABLE_CONFIRMED.');
    }
    if (!lastVerifiedDate) {
      addIssue(issues, 'lastVerifiedDate', 'MISSING_VERIFICATION_DATE', 'Published visa details require lastVerifiedDate.');
    }
    if (!sections.officialApplicationLinks || sections.officialApplicationLinks.length === 0) {
      addIssue(issues, 'sections.officialApplicationLinks', 'MISSING_OFFICIAL_SOURCE_URL', 'Published visa details must contain at least one verified official HTTPS link.');
    }
  }

  if (issues.length > 0 || !verificationStatus || !publicationStatus) return fail(issues);

  return ok({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    detailId,
    programId,
    destinationCountryIso,
    verificationStatus,
    publicationStatus,
    lastVerifiedDate,
    lastUpdatedDate,
    sections,
    claimIds,
    evidenceIds
  });
}

// ============================================================================
// D. OFFICIAL SOURCE SCHEMA
// ============================================================================

export interface OfficialSourceRecord {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  sourceId: string; // `SRC-<ISO>-<AUTHORITY>`
  countryIso: string;
  issuingAuthority: string;
  officialOrganizationName: string;
  officialHttpsUrl: string;
  sourceCategory: OfficialSourceCategory;
  sourceLanguage: string;
  lastCheckedDate: string;
  httpAvailabilityStatus: HttpAvailabilityStatus;
  evidenceNotes?: string | null;
  publicationDate?: string | null;
}

export function validateOfficialSourceRecord(input: unknown): ValidationResult<OfficialSourceRecord> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Official source record must be a JSON object.' }]);
  }

  const piiIssues = detectProhibitedPublicSecretsOrPii(input);
  for (const msg of piiIssues) addIssue(issues, 'pii_or_secret', 'PROHIBITED_PUBLIC_DATA', msg);

  if (input.schemaVersion !== STATIC_CATALOG_SCHEMA_VERSION) {
    addIssue(issues, 'schemaVersion', 'INVALID_SCHEMA_VERSION', `schemaVersion must equal "${STATIC_CATALOG_SCHEMA_VERSION}".`);
  }

  const sourceId = requireNonEmptyString(input, 'sourceId', issues);
  if (sourceId && !isValidOfficialSourceId(sourceId)) {
    addIssue(issues, 'sourceId', 'INVALID_SOURCE_ID', `sourceId "${sourceId}" must follow SRC-<ISO2>-<AUTHORITY>.`);
  }

  const rawIso = requireNonEmptyString(input, 'countryIso', issues);
  const countryIso = rawIso && isValidCanonicalIso2(rawIso) ? normalizeCountryIso2(rawIso) : '';
  if (rawIso && !countryIso) {
    addIssue(issues, 'countryIso', 'INVALID_COUNTRY_ISO2', `"${rawIso}" is not a canonical 249-ISO code.`);
  }
  if (sourceId && countryIso && isValidOfficialSourceId(sourceId) && sourceId.slice(4, 6) !== countryIso) {
    addIssue(issues, 'sourceId', 'SOURCE_COUNTRY_MISMATCH', `sourceId "${sourceId}" country prefix does not match "${countryIso}".`);
  }

  const issuingAuthority = requireNonEmptyString(input, 'issuingAuthority', issues);
  const officialOrganizationName = requireNonEmptyString(input, 'officialOrganizationName', issues);

  const urlCheck = validateOfficialHttpsUrl(input.officialHttpsUrl);
  if (!urlCheck.valid) {
    addIssue(issues, 'officialHttpsUrl', 'INVALID_OFFICIAL_URL', urlCheck.reason || 'Invalid official HTTPS URL.');
  }

  const sourceCategory = requireEnum(input.sourceCategory, OFFICIAL_SOURCE_CATEGORIES, 'sourceCategory', issues);
  const sourceLanguage = requireNonEmptyString(input, 'sourceLanguage', issues);

  const lastCheckedDate = requireNonEmptyString(input, 'lastCheckedDate', issues);
  if (lastCheckedDate && !isValidIsoDateOrTimestamp(lastCheckedDate)) {
    addIssue(issues, 'lastCheckedDate', 'INVALID_DATE', 'lastCheckedDate must be a valid ISO-8601 date/timestamp.');
  }

  const httpAvailabilityStatus = requireEnum(input.httpAvailabilityStatus, HTTP_AVAILABILITY_STATUSES, 'httpAvailabilityStatus', issues);
  const evidenceNotes = optionalNullableString(input, 'evidenceNotes', issues);
  const publicationDate = optionalNullableString(input, 'publicationDate', issues);
  if (publicationDate && !isValidIsoDateOrTimestamp(publicationDate)) {
    addIssue(issues, 'publicationDate', 'INVALID_DATE', 'publicationDate must be ISO-8601 or null.');
  }

  if (issues.length > 0 || !sourceCategory || !httpAvailabilityStatus || !urlCheck.normalizedUrl) {
    return fail(issues);
  }

  return ok({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    sourceId,
    countryIso,
    issuingAuthority,
    officialOrganizationName,
    officialHttpsUrl: urlCheck.normalizedUrl,
    sourceCategory,
    sourceLanguage,
    lastCheckedDate,
    httpAvailabilityStatus,
    ...(evidenceNotes !== undefined ? { evidenceNotes } : {}),
    ...(publicationDate !== undefined ? { publicationDate } : {})
  });
}

// ============================================================================
// E. BILATERAL ROUTE SCHEMA (Rule-matrix reference + country overrides, never 61,752 copies)
// ============================================================================

export interface BilateralRouteOverrideRecord {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  routeId: string; // `<origin-lower>-to-<dest-lower>`
  originCountryIso: string;
  destinationCountryIso: string;
  applicableVisaCategories: CatalogImmigrationCategory[];
  ruleMatrixRef: string; // e.g., `matrix:v2:schengen-short-stay` or `matrix:v2:default`
  verifiedOverrides: {
    visaFree?: boolean | null;
    eVisaEligible?: boolean | null;
    voaEligible?: boolean | null;
    maxStayDays?: number | null;
    overrideProgramIds?: string[];
    scopeNote?: string | null;
  };
  routePublicationEligible: boolean;
  verificationMetadata: {
    verificationStatus: CatalogVerificationStatus;
    lastVerifiedDate: string | null;
    officialSourceIds: string[];
  };
}

export function validateBilateralRouteOverride(input: unknown): ValidationResult<BilateralRouteOverrideRecord> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Bilateral route override must be a JSON object.' }]);
  }

  if (input.schemaVersion !== STATIC_CATALOG_SCHEMA_VERSION) {
    addIssue(issues, 'schemaVersion', 'INVALID_SCHEMA_VERSION', `schemaVersion must equal "${STATIC_CATALOG_SCHEMA_VERSION}".`);
  }

  const routeId = requireNonEmptyString(input, 'routeId', issues);
  if (routeId && !isValidRouteId(routeId)) {
    addIssue(issues, 'routeId', 'INVALID_ROUTE_ID', `routeId "${routeId}" must follow "<from>-to-<to>" with distinct canonical ISO-2 codes.`);
  }

  const rawFrom = requireNonEmptyString(input, 'originCountryIso', issues);
  const rawTo = requireNonEmptyString(input, 'destinationCountryIso', issues);
  const originCountryIso = rawFrom && isValidCanonicalIso2(rawFrom) ? normalizeCountryIso2(rawFrom) : '';
  const destinationCountryIso = rawTo && isValidCanonicalIso2(rawTo) ? normalizeCountryIso2(rawTo) : '';

  if (rawFrom && !originCountryIso) addIssue(issues, 'originCountryIso', 'INVALID_COUNTRY_ISO2', `Invalid origin ISO "${rawFrom}".`);
  if (rawTo && !destinationCountryIso) addIssue(issues, 'destinationCountryIso', 'INVALID_COUNTRY_ISO2', `Invalid destination ISO "${rawTo}".`);
  if (originCountryIso && destinationCountryIso) {
    if (originCountryIso === destinationCountryIso) {
      addIssue(issues, 'destinationCountryIso', 'SELF_ROUTE_FORBIDDEN', 'Origin and destination country cannot be identical.');
    } else if (routeId && routeId !== `${originCountryIso.toLowerCase()}-to-${destinationCountryIso.toLowerCase()}`) {
      addIssue(issues, 'routeId', 'ROUTE_ISO_MISMATCH', `routeId "${routeId}" does not match origin/destination ISO codes.`);
    }
  }

  const applicableVisaCategories: CatalogImmigrationCategory[] = [];
  if (!Array.isArray(input.applicableVisaCategories) || input.applicableVisaCategories.length === 0) {
    addIssue(issues, 'applicableVisaCategories', 'REQUIRED_ARRAY', 'applicableVisaCategories must be a non-empty array.');
  } else {
    input.applicableVisaCategories.forEach((cat, idx) => {
      const checked = requireEnum(cat, ALLOWED_CATALOG_CATEGORIES, `applicableVisaCategories[${idx}]`, issues);
      if (checked) applicableVisaCategories.push(checked);
    });
  }

  const ruleMatrixRef = requireNonEmptyString(input, 'ruleMatrixRef', issues);

  const verifiedOverrides: BilateralRouteOverrideRecord['verifiedOverrides'] = {};
  if (!isPlainObject(input.verifiedOverrides)) {
    addIssue(issues, 'verifiedOverrides', 'REQUIRED_OBJECT', 'verifiedOverrides must be an object.');
  } else {
    const ov = input.verifiedOverrides;
    for (const boolKey of ['visaFree', 'eVisaEligible', 'voaEligible'] as const) {
      if (ov[boolKey] !== undefined && ov[boolKey] !== null && typeof ov[boolKey] !== 'boolean') {
        addIssue(issues, `verifiedOverrides.${boolKey}`, 'INVALID_BOOLEAN', `${boolKey} must be boolean, null, or omitted.`);
      } else if (ov[boolKey] !== undefined) {
        verifiedOverrides[boolKey] = ov[boolKey] as boolean | null;
      }
    }
    if (ov.maxStayDays !== undefined && ov.maxStayDays !== null) {
      if (typeof ov.maxStayDays !== 'number' || !Number.isInteger(ov.maxStayDays) || ov.maxStayDays <= 0) {
        addIssue(issues, 'verifiedOverrides.maxStayDays', 'INVALID_INTEGER', 'maxStayDays must be a positive integer or null.');
      } else {
        verifiedOverrides.maxStayDays = ov.maxStayDays;
      }
    } else if (ov.maxStayDays === null) {
      verifiedOverrides.maxStayDays = null;
    }
    if (ov.overrideProgramIds !== undefined) {
      if (!Array.isArray(ov.overrideProgramIds)) {
        addIssue(issues, 'verifiedOverrides.overrideProgramIds', 'INVALID_ARRAY', 'overrideProgramIds must be an array.');
      } else {
        verifiedOverrides.overrideProgramIds = [];
        ov.overrideProgramIds.forEach((pid, idx) => {
          if (!isValidProgramId(pid)) {
            addIssue(issues, `verifiedOverrides.overrideProgramIds[${idx}]`, 'INVALID_PROGRAM_ID', `Invalid programId "${String(pid)}".`);
          } else {
            verifiedOverrides.overrideProgramIds!.push(pid);
          }
        });
      }
    }
    const scopeNote = optionalNullableString(ov, 'scopeNote', issues, 'verifiedOverrides');
    if (scopeNote !== undefined) verifiedOverrides.scopeNote = scopeNote;
  }

  if (typeof input.routePublicationEligible !== 'boolean') {
    addIssue(issues, 'routePublicationEligible', 'REQUIRED_BOOLEAN', 'routePublicationEligible must be a boolean.');
  }
  const routePublicationEligible = Boolean(input.routePublicationEligible);

  let vmStatus: CatalogVerificationStatus | undefined;
  let vmDate: string | null = null;
  const vmSources: string[] = [];

  if (!isPlainObject(input.verificationMetadata)) {
    addIssue(issues, 'verificationMetadata', 'REQUIRED_OBJECT', 'verificationMetadata is required.');
  } else {
    const vm = input.verificationMetadata;
    vmStatus = requireEnum(vm.verificationStatus, CATALOG_VERIFICATION_STATUSES, 'verificationMetadata.verificationStatus', issues);
    if (vm.lastVerifiedDate !== null && vm.lastVerifiedDate !== undefined) {
      if (typeof vm.lastVerifiedDate === 'string' && isValidIsoDateOrTimestamp(vm.lastVerifiedDate)) {
        vmDate = vm.lastVerifiedDate.trim();
      } else {
        addIssue(issues, 'verificationMetadata.lastVerifiedDate', 'INVALID_DATE', 'lastVerifiedDate must be ISO-8601 or null.');
      }
    }
    if (!Array.isArray(vm.officialSourceIds)) {
      addIssue(issues, 'verificationMetadata.officialSourceIds', 'REQUIRED_ARRAY', 'officialSourceIds must be an array.');
    } else {
      vm.officialSourceIds.forEach((sid, idx) => {
        if (!isValidOfficialSourceId(sid)) {
          addIssue(issues, `verificationMetadata.officialSourceIds[${idx}]`, 'INVALID_SOURCE_ID', `Invalid Official Source ID "${String(sid)}".`);
        } else {
          vmSources.push(sid);
        }
      });
    }
  }

  if (routePublicationEligible) {
    if (!vmStatus || !PUBLISHABLE_VERIFICATION_STATUSES.has(vmStatus)) {
      addIssue(
        issues,
        'routePublicationEligible',
        'UNVERIFIED_ROUTE_PUBLICATION_REJECTED',
        'Only routes with AVAILABLE_VERIFIED or NOT_AVAILABLE_CONFIRMED verificationStatus may be routePublicationEligible.'
      );
    }
    if (!vmDate || vmSources.length === 0) {
      addIssue(
        issues,
        'verificationMetadata',
        'MISSING_ROUTE_VERIFICATION_METADATA',
        'Publishable routes require lastVerifiedDate and at least one officialSourceId.'
      );
    }
  }

  if (issues.length > 0 || !vmStatus) return fail(issues);

  return ok({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    routeId,
    originCountryIso,
    destinationCountryIso,
    applicableVisaCategories,
    ruleMatrixRef,
    verifiedOverrides,
    routePublicationEligible,
    verificationMetadata: {
      verificationStatus: vmStatus,
      lastVerifiedDate: vmDate,
      officialSourceIds: vmSources
    }
  });
}

// ============================================================================
// F. EVIDENCE & CLAIM SCHEMAS + LINKAGE VALIDATION
// ============================================================================

export interface EvidenceRecord {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  evidenceId: string; // `EV-<STABLE-ID>`
  claimId: string;
  officialSourceId: string;
  sourceUrl: string;
  issuingAuthority: string;
  sourceTitle: string;
  publicationDate?: string | null;
  accessDate: string;
  lastVerifiedDate: string | null;
  supportingExcerpt?: string | null;
  evidenceStatus: EvidenceStatus;
  reviewerNotes?: string | null;
}

export interface ClaimRecord {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  claimId: string; // `CL-<STABLE-ID>`
  programId: string;
  claimText: string;
  claimClassification: RequirementClassification;
  officialSourceId: string;
  sourceUrl: string;
  evidenceIds: string[];
  supportingExcerpt?: string | null;
  accessDate: string;
  verificationDate: string | null;
  verificationStatus: CatalogVerificationStatus;
  reviewer?: string | null;
  sectionKey?: string | null;
  applicableNationality?: string | null;
}

export function validateEvidenceRecord(input: unknown): ValidationResult<EvidenceRecord> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Evidence record must be a JSON object.' }]);
  }

  const piiIssues = detectProhibitedPublicSecretsOrPii(input);
  for (const msg of piiIssues) addIssue(issues, 'pii_or_secret', 'PROHIBITED_PUBLIC_DATA', msg);

  if (input.schemaVersion !== STATIC_CATALOG_SCHEMA_VERSION) {
    addIssue(issues, 'schemaVersion', 'INVALID_SCHEMA_VERSION', `schemaVersion must equal "${STATIC_CATALOG_SCHEMA_VERSION}".`);
  }

  const evidenceId = requireNonEmptyString(input, 'evidenceId', issues);
  if (evidenceId && !isValidEvidenceId(evidenceId)) {
    addIssue(issues, 'evidenceId', 'INVALID_EVIDENCE_ID', `Invalid evidenceId "${evidenceId}".`);
  }

  const claimId = requireNonEmptyString(input, 'claimId', issues);
  if (claimId && !isValidClaimId(claimId)) {
    addIssue(issues, 'claimId', 'INVALID_CLAIM_ID', `Invalid claimId "${claimId}".`);
  }

  const officialSourceId = requireNonEmptyString(input, 'officialSourceId', issues);
  if (officialSourceId && !isValidOfficialSourceId(officialSourceId)) {
    addIssue(issues, 'officialSourceId', 'INVALID_SOURCE_ID', `Invalid officialSourceId "${officialSourceId}".`);
  }

  const urlCheck = validateOfficialHttpsUrl(input.sourceUrl);
  if (!urlCheck.valid) {
    addIssue(issues, 'sourceUrl', 'INVALID_OFFICIAL_URL', urlCheck.reason || 'Invalid official HTTPS source URL.');
  }

  const issuingAuthority = requireNonEmptyString(input, 'issuingAuthority', issues);
  const sourceTitle = requireNonEmptyString(input, 'sourceTitle', issues);
  const publicationDate = optionalNullableString(input, 'publicationDate', issues);
  if (publicationDate && !isValidIsoDateOrTimestamp(publicationDate)) {
    addIssue(issues, 'publicationDate', 'INVALID_DATE', 'publicationDate must be ISO-8601 or null.');
  }

  const accessDate = requireNonEmptyString(input, 'accessDate', issues);
  if (accessDate && !isValidIsoDateOrTimestamp(accessDate)) {
    addIssue(issues, 'accessDate', 'INVALID_DATE', 'accessDate must be ISO-8601.');
  }

  let lastVerifiedDate: string | null = null;
  if (input.lastVerifiedDate !== null && input.lastVerifiedDate !== undefined) {
    if (typeof input.lastVerifiedDate === 'string' && isValidIsoDateOrTimestamp(input.lastVerifiedDate)) {
      lastVerifiedDate = input.lastVerifiedDate.trim();
    } else {
      addIssue(issues, 'lastVerifiedDate', 'INVALID_DATE', 'lastVerifiedDate must be ISO-8601 or null.');
    }
  }

  const supportingExcerpt = optionalNullableString(input, 'supportingExcerpt', issues);
  const evidenceStatus = requireEnum(input.evidenceStatus, EVIDENCE_STATUSES, 'evidenceStatus', issues);
  const reviewerNotes = optionalNullableString(input, 'reviewerNotes', issues);

  if (evidenceStatus === 'VERIFIED_OFFICIAL' && !lastVerifiedDate) {
    addIssue(issues, 'lastVerifiedDate', 'MISSING_VERIFICATION_DATE', 'VERIFIED_OFFICIAL evidence must specify lastVerifiedDate.');
  }

  if (issues.length > 0 || !evidenceStatus || !urlCheck.normalizedUrl) return fail(issues);

  return ok({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    evidenceId,
    claimId,
    officialSourceId,
    sourceUrl: urlCheck.normalizedUrl,
    issuingAuthority,
    sourceTitle,
    ...(publicationDate !== undefined ? { publicationDate } : {}),
    accessDate,
    lastVerifiedDate,
    ...(supportingExcerpt !== undefined ? { supportingExcerpt } : {}),
    evidenceStatus,
    ...(reviewerNotes !== undefined ? { reviewerNotes } : {})
  });
}

export function validateClaimRecord(input: unknown): ValidationResult<ClaimRecord> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Claim record must be a JSON object.' }]);
  }

  const piiIssues = detectProhibitedPublicSecretsOrPii(input);
  for (const msg of piiIssues) addIssue(issues, 'pii_or_secret', 'PROHIBITED_PUBLIC_DATA', msg);

  if (input.schemaVersion !== STATIC_CATALOG_SCHEMA_VERSION) {
    addIssue(issues, 'schemaVersion', 'INVALID_SCHEMA_VERSION', `schemaVersion must equal "${STATIC_CATALOG_SCHEMA_VERSION}".`);
  }

  const claimId = requireNonEmptyString(input, 'claimId', issues);
  if (claimId && !isValidClaimId(claimId)) {
    addIssue(issues, 'claimId', 'INVALID_CLAIM_ID', `Invalid claimId "${claimId}".`);
  }

  const programId = requireNonEmptyString(input, 'programId', issues);
  if (programId && !isValidProgramId(programId)) {
    addIssue(issues, 'programId', 'INVALID_PROGRAM_ID', `Invalid programId "${programId}".`);
  }

  const claimText = requireNonEmptyString(input, 'claimText', issues);
  const claimClassification = requireEnum(input.claimClassification, REQUIREMENT_CLASSIFICATIONS, 'claimClassification', issues);

  const officialSourceId = requireNonEmptyString(input, 'officialSourceId', issues);
  if (officialSourceId && !isValidOfficialSourceId(officialSourceId)) {
    addIssue(issues, 'officialSourceId', 'INVALID_SOURCE_ID', `Invalid officialSourceId "${officialSourceId}".`);
  }

  const urlCheck = validateOfficialHttpsUrl(input.sourceUrl);
  if (!urlCheck.valid) {
    addIssue(issues, 'sourceUrl', 'INVALID_OFFICIAL_URL', urlCheck.reason || 'Invalid official source URL.');
  }

  const evidenceIds: string[] = [];
  if (!Array.isArray(input.evidenceIds)) {
    addIssue(issues, 'evidenceIds', 'REQUIRED_ARRAY', 'evidenceIds must be an array.');
  } else {
    input.evidenceIds.forEach((eid, idx) => {
      if (!isValidEvidenceId(eid)) {
        addIssue(issues, `evidenceIds[${idx}]`, 'INVALID_EVIDENCE_ID', `Invalid evidenceId "${String(eid)}".`);
      } else {
        evidenceIds.push(eid);
      }
    });
  }

  const supportingExcerpt = optionalNullableString(input, 'supportingExcerpt', issues);
  const accessDate = requireNonEmptyString(input, 'accessDate', issues);
  if (accessDate && !isValidIsoDateOrTimestamp(accessDate)) {
    addIssue(issues, 'accessDate', 'INVALID_DATE', 'accessDate must be ISO-8601.');
  }

  let verificationDate: string | null = null;
  if (input.verificationDate !== null && input.verificationDate !== undefined) {
    if (typeof input.verificationDate === 'string' && isValidIsoDateOrTimestamp(input.verificationDate)) {
      verificationDate = input.verificationDate.trim();
    } else {
      addIssue(issues, 'verificationDate', 'INVALID_DATE', 'verificationDate must be ISO-8601 or null.');
    }
  }

  const verificationStatus = requireEnum(input.verificationStatus, CATALOG_VERIFICATION_STATUSES, 'verificationStatus', issues);
  const reviewer = optionalNullableString(input, 'reviewer', issues);
  const sectionKey = optionalNullableString(input, 'sectionKey', issues);
  const applicableNationality = optionalNullableString(input, 'applicableNationality', issues);

  if (verificationStatus === 'AVAILABLE_VERIFIED') {
    if (evidenceIds.length === 0) {
      addIssue(issues, 'evidenceIds', 'VERIFIED_CLAIM_MISSING_EVIDENCE', 'AVAILABLE_VERIFIED claim must reference at least one evidenceId.');
    }
    if (!verificationDate) {
      addIssue(issues, 'verificationDate', 'MISSING_VERIFICATION_DATE', 'AVAILABLE_VERIFIED claim must specify verificationDate.');
    }
  }

  if (issues.length > 0 || !claimClassification || !verificationStatus || !urlCheck.normalizedUrl) {
    return fail(issues);
  }

  return ok({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    claimId,
    programId,
    claimText,
    claimClassification,
    officialSourceId,
    sourceUrl: urlCheck.normalizedUrl,
    evidenceIds,
    ...(supportingExcerpt !== undefined ? { supportingExcerpt } : {}),
    accessDate,
    verificationDate,
    verificationStatus,
    ...(reviewer !== undefined ? { reviewer } : {}),
    ...(sectionKey !== undefined ? { sectionKey } : {}),
    ...(applicableNationality !== undefined ? { applicableNationality } : {})
  });
}

// ============================================================================
// G. QUARANTINE & COVERAGE METRICS SCHEMAS
// ============================================================================

export type QuarantineReasonCode =
  | 'AWAITING_OFFICIAL_VERIFICATION'
  | 'NEEDS_REVIEW'
  | 'CONFLICTING_CLAIMS'
  | 'EXPIRED_PROGRAM'
  | 'BROKEN_OFFICIAL_SOURCE'
  | 'UNOFFICIAL_SOURCE_DOMAIN'
  | 'SYNTHETIC_OR_DELETED_FIXTURE'
  | 'SCHEMA_VALIDATION_FAILED';

export interface QuarantineRecord {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  quarantineId: string;
  entityType: 'country' | 'program' | 'visa_detail' | 'route' | 'claim' | 'evidence' | 'editorial';
  entityId: string;
  countryIso?: string | null;
  verificationStatus: Exclude<CatalogVerificationStatus, 'AVAILABLE_VERIFIED' | 'NOT_AVAILABLE_CONFIRMED'>;
  reasonCode: QuarantineReasonCode;
  reasonSummary: string;
  quarantinedAt: string;
  recoverable: true;
  preservedPayload: Record<string, unknown>;
}

export function validateQuarantineRecord(input: unknown): ValidationResult<QuarantineRecord> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Quarantine record must be a JSON object.' }]);
  }

  const piiIssues = detectProhibitedPublicSecretsOrPii(input);
  for (const msg of piiIssues) addIssue(issues, 'pii_or_secret', 'PROHIBITED_PUBLIC_DATA', msg);

  if (input.schemaVersion !== STATIC_CATALOG_SCHEMA_VERSION) {
    addIssue(issues, 'schemaVersion', 'INVALID_SCHEMA_VERSION', `schemaVersion must equal "${STATIC_CATALOG_SCHEMA_VERSION}".`);
  }

  const quarantineId = requireNonEmptyString(input, 'quarantineId', issues);
  if (quarantineId && !/^QRN-[A-Z0-9-]+$/.test(quarantineId)) {
    addIssue(issues, 'quarantineId', 'INVALID_QUARANTINE_ID', `quarantineId "${quarantineId}" must start with "QRN-".`);
  }

  const entityType = requireEnum(
    input.entityType,
    ['country', 'program', 'visa_detail', 'route', 'claim', 'evidence', 'editorial'] as const,
    'entityType',
    issues
  );
  const entityId = requireNonEmptyString(input, 'entityId', issues);

  let countryIso: string | null | undefined = undefined;
  if (input.countryIso !== undefined && input.countryIso !== null) {
    if (!isValidCanonicalIso2(input.countryIso)) {
      addIssue(issues, 'countryIso', 'INVALID_COUNTRY_ISO2', `Invalid countryIso "${String(input.countryIso)}".`);
    } else {
      countryIso = normalizeCountryIso2(input.countryIso);
    }
  } else if (input.countryIso === null) {
    countryIso = null;
  }

  const verificationStatus = requireEnum(
    input.verificationStatus,
    ['AWAITING_OFFICIAL_VERIFICATION', 'NEEDS_REVIEW', 'CONFLICTING', 'EXPIRED', 'QUARANTINED', 'TEMPORARILY_CLOSED'] as const,
    'verificationStatus',
    issues
  );

  const reasonCode = requireEnum(
    input.reasonCode,
    [
      'AWAITING_OFFICIAL_VERIFICATION',
      'NEEDS_REVIEW',
      'CONFLICTING_CLAIMS',
      'EXPIRED_PROGRAM',
      'BROKEN_OFFICIAL_SOURCE',
      'UNOFFICIAL_SOURCE_DOMAIN',
      'SYNTHETIC_OR_DELETED_FIXTURE',
      'SCHEMA_VALIDATION_FAILED'
    ] as const,
    'reasonCode',
    issues
  );

  const reasonSummary = requireNonEmptyString(input, 'reasonSummary', issues);
  const quarantinedAt = requireNonEmptyString(input, 'quarantinedAt', issues);
  if (quarantinedAt && !isValidIsoDateOrTimestamp(quarantinedAt)) {
    addIssue(issues, 'quarantinedAt', 'INVALID_DATE', 'quarantinedAt must be ISO-8601.');
  }

  if (input.recoverable !== true) {
    addIssue(issues, 'recoverable', 'QUARANTINE_MUST_BE_RECOVERABLE', 'Quarantine records must keep recoverable=true and preserve payloads.');
  }

  if (!isPlainObject(input.preservedPayload)) {
    addIssue(issues, 'preservedPayload', 'REQUIRED_OBJECT', 'preservedPayload must preserve the unverified/quarantined object for audit & recovery.');
  }

  if (issues.length > 0 || !entityType || !verificationStatus || !reasonCode || !isPlainObject(input.preservedPayload)) {
    return fail(issues);
  }

  return ok({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    quarantineId,
    entityType,
    entityId,
    ...(countryIso !== undefined ? { countryIso } : {}),
    verificationStatus,
    reasonCode,
    reasonSummary,
    quarantinedAt,
    recoverable: true,
    preservedPayload: input.preservedPayload
  });
}

/**
 * Mandatory Trust Metric Separation (Section 5):
 * Strictly separates coverage slots, discovered programs, and verified available programs.
 */
export interface CatalogCoverageMetrics {
  coverageSlotsCount: number;
  discoveredProgramsCount: number;
  verifiedAvailableProgramsCount: number;
  confirmedNotAvailableCount: number;
  quarantinedOrPendingCount: number;
  asOfDate: string;
}

export function validateCatalogCoverageMetrics(input: unknown): ValidationResult<CatalogCoverageMetrics> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Coverage metrics must be an object.' }]);
  }

  const numKeys = [
    'coverageSlotsCount',
    'discoveredProgramsCount',
    'verifiedAvailableProgramsCount',
    'confirmedNotAvailableCount',
    'quarantinedOrPendingCount'
  ] as const;

  const vals: Record<string, number> = {};
  for (const k of numKeys) {
    const v = input[k];
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0) {
      addIssue(issues, k, 'INVALID_NON_NEGATIVE_INT', `${k} must be a non-negative integer.`);
    } else {
      vals[k] = v;
    }
  }

  const asOfDate = requireNonEmptyString(input, 'asOfDate', issues);
  if (asOfDate && !isValidIsoDateOrTimestamp(asOfDate)) {
    addIssue(issues, 'asOfDate', 'INVALID_DATE', 'asOfDate must be ISO-8601.');
  }

  if (
    vals.verifiedAvailableProgramsCount !== undefined &&
    vals.discoveredProgramsCount !== undefined &&
    vals.verifiedAvailableProgramsCount > vals.discoveredProgramsCount
  ) {
    addIssue(
      issues,
      'verifiedAvailableProgramsCount',
      'METRIC_INVARIANT_VIOLATION',
      'verifiedAvailableProgramsCount cannot exceed discoveredProgramsCount.'
    );
  }

  if (issues.length > 0) return fail(issues);

  return ok({
    coverageSlotsCount: vals.coverageSlotsCount,
    discoveredProgramsCount: vals.discoveredProgramsCount,
    verifiedAvailableProgramsCount: vals.verifiedAvailableProgramsCount,
    confirmedNotAvailableCount: vals.confirmedNotAvailableCount,
    quarantinedOrPendingCount: vals.quarantinedOrPendingCount,
    asOfDate
  });
}

// ============================================================================
// H. EDITORIAL SCHEMA (Published & Draft Markdown Frontmatter + Body)
// ============================================================================

export interface EditorialArticleRecord {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  slug: string;
  language: SupportedLangCode;
  title: string;
  description: string;
  markdownContent: string;
  officialReferences: string[];
  publicationDate: string | null;
  updatedDate: string;
  editorialStatus: EditorialStatus;
  originCountryIso?: string | null;
  destinationCountryIso?: string | null;
  category?: CatalogImmigrationCategory | null;
}

export function validateEditorialArticleRecord(input: unknown): ValidationResult<EditorialArticleRecord> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Editorial article must be a JSON object.' }]);
  }

  const piiIssues = detectProhibitedPublicSecretsOrPii(input);
  for (const msg of piiIssues) addIssue(issues, 'pii_or_secret', 'PROHIBITED_PUBLIC_DATA', msg);

  if (input.schemaVersion !== STATIC_CATALOG_SCHEMA_VERSION) {
    addIssue(issues, 'schemaVersion', 'INVALID_SCHEMA_VERSION', `schemaVersion must equal "${STATIC_CATALOG_SCHEMA_VERSION}".`);
  }

  const slug = requireNonEmptyString(input, 'slug', issues);
  if (slug && !isValidEditorialSlug(slug)) {
    addIssue(issues, 'slug', 'INVALID_SLUG', `slug "${slug}" must be lowercase kebab-case ASCII with no path traversal.`);
  }

  const language = requireNonEmptyString(input, 'language', issues) as SupportedLangCode;
  if (language && !CANONICAL_15_LANGUAGES_SET.has(language)) {
    addIssue(issues, 'language', 'UNSUPPORTED_LANGUAGE', `Language "${language}" is not in the 15 supported languages.`);
  }

  const title = requireNonEmptyString(input, 'title', issues);
  const description = requireNonEmptyString(input, 'description', issues);
  const markdownContent = requireNonEmptyString(input, 'markdownContent', issues);
  const editorialStatus = requireEnum(input.editorialStatus, EDITORIAL_STATUSES, 'editorialStatus', issues);

  const officialReferences: string[] = [];
  if (!Array.isArray(input.officialReferences)) {
    addIssue(issues, 'officialReferences', 'REQUIRED_ARRAY', 'officialReferences must be an array of HTTPS URLs.');
  } else {
    input.officialReferences.forEach((url, idx) => {
      const chk = validateOfficialHttpsUrl(url);
      if (!chk.valid) {
        addIssue(issues, `officialReferences[${idx}]`, 'INVALID_OFFICIAL_URL', chk.reason || 'Invalid official reference URL.');
      } else if (chk.normalizedUrl) {
        officialReferences.push(chk.normalizedUrl);
      }
    });
  }

  let publicationDate: string | null = null;
  if (input.publicationDate !== null && input.publicationDate !== undefined) {
    if (typeof input.publicationDate === 'string' && isValidIsoDateOrTimestamp(input.publicationDate)) {
      publicationDate = input.publicationDate.trim();
    } else {
      addIssue(issues, 'publicationDate', 'INVALID_DATE', 'publicationDate must be ISO-8601 or null.');
    }
  }

  const updatedDate = requireNonEmptyString(input, 'updatedDate', issues);
  if (updatedDate && !isValidIsoDateOrTimestamp(updatedDate)) {
    addIssue(issues, 'updatedDate', 'INVALID_DATE', 'updatedDate must be ISO-8601.');
  }

  if (editorialStatus === 'published') {
    if (!publicationDate) {
      addIssue(issues, 'publicationDate', 'MISSING_PUBLICATION_DATE', 'Published editorial articles must specify publicationDate.');
    }
    if (officialReferences.length === 0) {
      addIssue(issues, 'officialReferences', 'MISSING_OFFICIAL_REFERENCES', 'Published editorial articles must cite at least one official HTTPS reference.');
    }
  }

  let originCountryIso: string | null | undefined = undefined;
  if (input.originCountryIso !== undefined && input.originCountryIso !== null) {
    if (!isValidCanonicalIso2(input.originCountryIso)) {
      addIssue(issues, 'originCountryIso', 'INVALID_COUNTRY_ISO2', `Invalid originCountryIso "${String(input.originCountryIso)}".`);
    } else {
      originCountryIso = normalizeCountryIso2(input.originCountryIso);
    }
  } else if (input.originCountryIso === null) {
    originCountryIso = null;
  }

  let destinationCountryIso: string | null | undefined = undefined;
  if (input.destinationCountryIso !== undefined && input.destinationCountryIso !== null) {
    if (!isValidCanonicalIso2(input.destinationCountryIso)) {
      addIssue(issues, 'destinationCountryIso', 'INVALID_COUNTRY_ISO2', `Invalid destinationCountryIso "${String(input.destinationCountryIso)}".`);
    } else {
      destinationCountryIso = normalizeCountryIso2(input.destinationCountryIso);
    }
  } else if (input.destinationCountryIso === null) {
    destinationCountryIso = null;
  }

  let category: CatalogImmigrationCategory | null | undefined = undefined;
  if (input.category !== undefined && input.category !== null) {
    category = requireEnum(input.category, ALLOWED_CATALOG_CATEGORIES, 'category', issues);
  } else if (input.category === null) {
    category = null;
  }

  if (issues.length > 0 || !editorialStatus) return fail(issues);

  return ok({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    slug,
    language,
    title,
    description,
    markdownContent,
    officialReferences,
    publicationDate,
    updatedDate,
    editorialStatus,
    ...(originCountryIso !== undefined ? { originCountryIso } : {}),
    ...(destinationCountryIso !== undefined ? { destinationCountryIso } : {}),
    ...(category !== undefined ? { category } : {})
  });
}

// ============================================================================
// I. CHANGELOG SCHEMA
// ============================================================================

export interface ChangelogRecord {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  changeId: string;
  affectedCountryIso: string;
  affectedProgramId?: string | null;
  changeCategory: CatalogChangeCategory;
  title: string;
  previousValue?: string | null;
  newValue?: string | null;
  sourceReference: {
    sourceId?: string | null;
    url: string;
  };
  changeDate: string;
  verificationStatus: CatalogVerificationStatus;
  verifiedBy?: string | null;
  relatedEditorialSlug?: string | null;
}

export function validateChangelogRecord(input: unknown): ValidationResult<ChangelogRecord> {
  const issues: ValidationIssue[] = [];
  if (!isPlainObject(input)) {
    return fail([{ path: '', code: 'INVALID_TYPE', message: 'Changelog record must be a JSON object.' }]);
  }

  const piiIssues = detectProhibitedPublicSecretsOrPii(input);
  for (const msg of piiIssues) addIssue(issues, 'pii_or_secret', 'PROHIBITED_PUBLIC_DATA', msg);

  if (input.schemaVersion !== STATIC_CATALOG_SCHEMA_VERSION) {
    addIssue(issues, 'schemaVersion', 'INVALID_SCHEMA_VERSION', `schemaVersion must equal "${STATIC_CATALOG_SCHEMA_VERSION}".`);
  }

  const changeId = requireNonEmptyString(input, 'changeId', issues);
  if (changeId && !isValidChangelogId(changeId)) {
    addIssue(issues, 'changeId', 'INVALID_CHANGELOG_ID', `Invalid changeId "${changeId}".`);
  }

  const rawIso = requireNonEmptyString(input, 'affectedCountryIso', issues);
  const affectedCountryIso = rawIso && isValidCanonicalIso2(rawIso) ? normalizeCountryIso2(rawIso) : '';
  if (rawIso && !affectedCountryIso) {
    addIssue(issues, 'affectedCountryIso', 'INVALID_COUNTRY_ISO2', `Invalid affectedCountryIso "${rawIso}".`);
  }

  const affectedProgramId = optionalNullableString(input, 'affectedProgramId', issues);
  if (affectedProgramId && !isValidProgramId(affectedProgramId)) {
    addIssue(issues, 'affectedProgramId', 'INVALID_PROGRAM_ID', `Invalid affectedProgramId "${affectedProgramId}".`);
  }

  const changeCategory = requireEnum(input.changeCategory, CHANGELOG_CATEGORIES, 'changeCategory', issues);
  const title = requireNonEmptyString(input, 'title', issues);
  const previousValue = optionalNullableString(input, 'previousValue', issues);
  const newValue = optionalNullableString(input, 'newValue', issues);

  let sourceUrl = '';
  let sourceId: string | null | undefined = undefined;
  if (!isPlainObject(input.sourceReference)) {
    addIssue(issues, 'sourceReference', 'REQUIRED_OBJECT', 'sourceReference is required.');
  } else {
    const chk = validateOfficialHttpsUrl(input.sourceReference.url);
    if (!chk.valid || !chk.normalizedUrl) {
      addIssue(issues, 'sourceReference.url', 'INVALID_OFFICIAL_URL', chk.reason || 'Invalid changelog official source URL.');
    } else {
      sourceUrl = chk.normalizedUrl;
    }
    sourceId = optionalNullableString(input.sourceReference, 'sourceId', issues, 'sourceReference');
    if (sourceId && !isValidOfficialSourceId(sourceId)) {
      addIssue(issues, 'sourceReference.sourceId', 'INVALID_SOURCE_ID', `Invalid sourceId "${sourceId}".`);
    }
  }

  const changeDate = requireNonEmptyString(input, 'changeDate', issues);
  if (changeDate && !isValidIsoDateOrTimestamp(changeDate)) {
    addIssue(issues, 'changeDate', 'INVALID_DATE', 'changeDate must be ISO-8601.');
  }

  const verificationStatus = requireEnum(input.verificationStatus, CATALOG_VERIFICATION_STATUSES, 'verificationStatus', issues);
  const verifiedBy = optionalNullableString(input, 'verifiedBy', issues);
  const relatedEditorialSlug = optionalNullableString(input, 'relatedEditorialSlug', issues);
  if (relatedEditorialSlug && !isValidEditorialSlug(relatedEditorialSlug)) {
    addIssue(issues, 'relatedEditorialSlug', 'INVALID_SLUG', `Invalid editorial slug "${relatedEditorialSlug}".`);
  }

  if (issues.length > 0 || !changeCategory || !verificationStatus) return fail(issues);

  return ok({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    changeId,
    affectedCountryIso,
    ...(affectedProgramId !== undefined ? { affectedProgramId } : {}),
    changeCategory,
    title,
    ...(previousValue !== undefined ? { previousValue } : {}),
    ...(newValue !== undefined ? { newValue } : {}),
    sourceReference: {
      ...(sourceId !== undefined ? { sourceId } : {}),
      url: sourceUrl
    },
    changeDate,
    verificationStatus,
    ...(verifiedBy !== undefined ? { verifiedBy } : {}),
    ...(relatedEditorialSlug !== undefined ? { relatedEditorialSlug } : {})
  });
}

// ============================================================================
// COLLECTION, UNIQUENESS, CLAIM/EVIDENCE LINKAGE & PUBLIC GATE VALIDATORS
// ============================================================================

export function isEligibleForPublicCatalogIndex(
  program: ImmigrationProgramRecord,
  options: { nowDate?: Date; linkedClaims?: ClaimRecord[] } = {}
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const now = options.nowDate ?? new Date();

  if (isForbiddenFixtureId(program.programId)) {
    reasons.push('Deleted Phase 3.2 or synthetic fixture ID is forbidden.');
  }
  if (program.publicationStatus !== 'PUBLISHED') {
    reasons.push(`publicationStatus is "${program.publicationStatus}" (must be "PUBLISHED").`);
  }
  if (!PUBLISHABLE_VERIFICATION_STATUSES.has(program.verificationStatus)) {
    reasons.push(`verificationStatus "${program.verificationStatus}" is not publishable.`);
  }
  if (!program.lastVerifiedDate) {
    reasons.push('Missing lastVerifiedDate.');
  }
  if (program.officialSourceRefs.length === 0) {
    reasons.push('Missing official source URL reference.');
  }
  if (program.expiresAt && new Date(program.expiresAt).getTime() < now.getTime()) {
    reasons.push(`Program expired at ${program.expiresAt}.`);
  }
  if (options.linkedClaims) {
    const conflicting = options.linkedClaims.filter((c) => c.verificationStatus === 'CONFLICTING');
    if (conflicting.length > 0) {
      reasons.push(`Program has ${conflicting.length} conflicting claim(s): ${conflicting.map((c) => c.claimId).join(', ')}.`);
    }
  }

  return { eligible: reasons.length === 0, reasons };
}

/**
 * Validates uniqueness of IDs across a program collection and rejects duplicate IDs.
 */
export function validateProgramCollection(
  programs: unknown[],
  options: { nowDate?: Date } = {}
): ValidationResult<ImmigrationProgramRecord[]> {
  const issues: ValidationIssue[] = [];
  const validated: ImmigrationProgramRecord[] = [];
  const seenIds = new Map<string, number>();

  programs.forEach((raw, idx) => {
    const res = validateImmigrationProgramRecord(raw, options);
    if (!res.success) {
      for (const iss of res.issues) {
        addIssue(issues, `[${idx}].${iss.path}`.replace(/\.$/, ''), iss.code, iss.message);
      }
      return;
    }
    const key = res.data.programId.toUpperCase();
    if (seenIds.has(key)) {
      addIssue(
        issues,
        `[${idx}].programId`,
        'DUPLICATE_PROGRAM_ID',
        `Duplicate programId "${res.data.programId}" (already defined at index ${seenIds.get(key)}).`
      );
      return;
    }
    seenIds.set(key, idx);
    validated.push(res.data);
  });

  return issues.length > 0 ? fail(issues) : ok(validated);
}

/**
 * Validates cross-file relational integrity between programs, official sources, claims, and evidence.
 * Rejects dangling evidence links, conflicting claims on published programs, and missing official sources.
 */
export function validateClaimEvidenceLinkage(params: {
  programs: ImmigrationProgramRecord[];
  officialSources: OfficialSourceRecord[];
  claims: ClaimRecord[];
  evidence: EvidenceRecord[];
}): ValidationResult<{ validLinks: number }> {
  const issues: ValidationIssue[] = [];

  const programMap = new Map(params.programs.map((p) => [p.programId, p]));
  const sourceMap = new Map(params.officialSources.map((s) => [s.sourceId, s]));
  const claimMap = new Map<string, ClaimRecord>();
  const evidenceMap = new Map<string, EvidenceRecord>();

  for (const c of params.claims) {
    if (claimMap.has(c.claimId)) {
      addIssue(issues, `claims.${c.claimId}`, 'DUPLICATE_CLAIM_ID', `Duplicate claimId "${c.claimId}".`);
    }
    claimMap.set(c.claimId, c);
  }

  for (const e of params.evidence) {
    if (evidenceMap.has(e.evidenceId)) {
      addIssue(issues, `evidence.${e.evidenceId}`, 'DUPLICATE_EVIDENCE_ID', `Duplicate evidenceId "${e.evidenceId}".`);
    }
    evidenceMap.set(e.evidenceId, e);
  }

  let validLinks = 0;

  for (const c of params.claims) {
    const prog = programMap.get(c.programId);
    if (!prog) {
      addIssue(issues, `claims.${c.claimId}.programId`, 'DANGLING_PROGRAM_REF', `Claim "${c.claimId}" references unknown program "${c.programId}".`);
    }
    if (!sourceMap.has(c.officialSourceId)) {
      addIssue(issues, `claims.${c.claimId}.officialSourceId`, 'DANGLING_SOURCE_REF', `Claim "${c.claimId}" references unknown source "${c.officialSourceId}".`);
    }
    if (c.verificationStatus === 'CONFLICTING' && prog?.publicationStatus === 'PUBLISHED') {
      addIssue(
        issues,
        `claims.${c.claimId}.verificationStatus`,
        'CONFLICTING_CLAIM_ON_PUBLISHED_PROGRAM',
        `Conflicting claim "${c.claimId}" prevents program "${c.programId}" from remaining PUBLISHED.`
      );
    }

    for (const eid of c.evidenceIds) {
      const ev = evidenceMap.get(eid);
      if (!ev) {
        addIssue(issues, `claims.${c.claimId}.evidenceIds`, 'DANGLING_EVIDENCE_REF', `Claim "${c.claimId}" references missing evidence "${eid}".`);
      } else if (ev.claimId !== c.claimId) {
        addIssue(
          issues,
          `evidence.${eid}.claimId`,
          'EVIDENCE_CLAIM_MISMATCH',
          `Evidence "${eid}" belongs to claim "${ev.claimId}", not "${c.claimId}".`
        );
      } else if (c.verificationStatus === 'AVAILABLE_VERIFIED' && (ev.evidenceStatus === 'REJECTED' || ev.evidenceStatus === 'BROKEN_LINK' || ev.evidenceStatus === 'OUTDATED')) {
        addIssue(
          issues,
          `claims.${c.claimId}`,
          'INVALIDATING_EVIDENCE_ON_VERIFIED_CLAIM',
          `Verified claim "${c.claimId}" cannot rely on "${ev.evidenceStatus}" evidence "${eid}".`
        );
      } else {
        validLinks++;
      }
    }
  }

  for (const e of params.evidence) {
    if (!claimMap.has(e.claimId)) {
      addIssue(issues, `evidence.${e.evidenceId}.claimId`, 'ORPHAN_EVIDENCE', `Evidence "${e.evidenceId}" references unknown claim "${e.claimId}".`);
    }
    if (!sourceMap.has(e.officialSourceId)) {
      addIssue(issues, `evidence.${e.evidenceId}.officialSourceId`, 'DANGLING_SOURCE_REF', `Evidence "${e.evidenceId}" references unknown source "${e.officialSourceId}".`);
    }
  }

  return issues.length > 0 ? fail(issues) : ok({ validLinks });
}

// ============================================================================
// BACKWARD-COMPATIBILITY ADAPTERS (Legacy Phase 1/3/B Data Models -> Phase 2)
// ============================================================================

export function adaptLegacyProgramToStaticRecord(legacy: LegacyImmigrationProgram): ImmigrationProgramRecord {
  const iso = normalizeCountryIso2(legacy.countryCode);
  const primarySourceId = generateOfficialSourceId(iso, legacy.sourceAuthority.slice(0, 40) || 'IMMIGRATION-AUTHORITY');
  const refs: OfficialSourceReference[] = [];
  if (validateOfficialHttpsUrl(legacy.officialInformationUrl).valid) {
    refs.push({ sourceId: primarySourceId, url: legacy.officialInformationUrl, title: `${legacy.sourceAuthority} — Information` });
  }
  if (
    legacy.officialApplicationUrl &&
    legacy.officialApplicationUrl !== legacy.officialInformationUrl &&
    validateOfficialHttpsUrl(legacy.officialApplicationUrl).valid
  ) {
    refs.push({ sourceId: primarySourceId, url: legacy.officialApplicationUrl, title: `${legacy.sourceAuthority} — Application Portal` });
  }

  const isPublishable = PUBLISHABLE_VERIFICATION_STATUSES.has(legacy.verificationStatus as CatalogVerificationStatus);

  return {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    programId: legacy.id,
    destinationCountryIso: iso,
    programName: legacy.officialName,
    localLanguageName: legacy.localLanguageName ?? null,
    immigrationCategory: legacy.category,
    programType: legacy.classificationType,
    eligibilitySummary: legacy.eligibility,
    officialSourceRefs: refs,
    verificationStatus: legacy.verificationStatus,
    createdDate: legacy.sourceLastUpdated || legacy.lastCheckedDate,
    lastVerifiedDate: isPublishable ? legacy.lastCheckedDate : null,
    lastUpdatedDate: legacy.lastCheckedDate,
    publicationStatus: isPublishable && refs.length > 0 ? 'PUBLISHED' : 'QUARANTINED',
    legalBasis: legacy.legalBasis,
    applyFrom: legacy.applyFrom ?? null
  };
}

export function adaptLegacyOfficialSourceToStaticRecord(legacy: LegacyOfficialSourceEntry): OfficialSourceRecord {
  const iso = normalizeCountryIso2(legacy.countryCode);
  return {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    sourceId: generateOfficialSourceId(iso, legacy.authorityName.slice(0, 48)),
    countryIso: iso,
    issuingAuthority: legacy.authorityName,
    officialOrganizationName: legacy.authorityName,
    officialHttpsUrl: legacy.primaryGovUrl,
    sourceCategory:
      legacy.verificationTier === 'Tier-2 Consular / Foreign Affairs'
        ? 'CONSULAR_FOREIGN_AFFAIRS'
        : legacy.verificationTier === 'Tier-3 Official Gazette / Legislation'
          ? 'OFFICIAL_GAZETTE_LEGISLATION'
          : 'SOVEREIGN_IMMIGRATION_PORTAL',
    sourceLanguage: 'en',
    lastCheckedDate: legacy.lastAuditDate,
    httpAvailabilityStatus:
      legacy.sourceAccessStatus.toLowerCase().includes('reachable') ||
      legacy.sourceAccessStatus.includes('200')
        ? 'REACHABLE_2XX'
        : 'NOT_YET_CHECKED',
    evidenceNotes: `Adapted from officialSourceRegistry (${legacy.verificationTier}).`
  };
}

export function adaptLegacyChangelogToStaticRecord(legacy: LegacyChangelogItem): ChangelogRecord {
  const iso = normalizeCountryIso2(legacy.countryCode);
  return {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    changeId: legacy.id,
    affectedCountryIso: iso,
    affectedProgramId: null,
    changeCategory: legacy.changeType,
    title: legacy.title,
    previousValue: legacy.oldValue || null,
    newValue: legacy.newValue || null,
    sourceReference: {
      url: legacy.sourceUrl
    },
    changeDate: legacy.date,
    verificationStatus: 'AVAILABLE_VERIFIED',
    verifiedBy: legacy.verifiedBy || null,
    relatedEditorialSlug: legacy.autoBlogSlug || null
  };
}
