import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

import {
  CANONICAL_15_LANGUAGES_SET,
  CANONICAL_249_ISO2_UPPER,
  STATIC_CATALOG_SCHEMA_VERSION,
  adaptLegacyChangelogToStaticRecord,
  adaptLegacyOfficialSourceToStaticRecord,
  adaptLegacyProgramToStaticRecord,
  detectProhibitedPublicSecretsOrPii,
  generateChangelogId,
  generateClaimId,
  generateEvidenceId,
  generateOfficialSourceId,
  generateProgramId,
  generateQuarantineId,
  generateRouteId,
  generateVisaDetailId,
  isEligibleForPublicCatalogIndex,
  isForbiddenFixtureId,
  isValidCanonicalIso2,
  isValidClaimId,
  isValidEditorialSlug,
  isValidEvidenceId,
  isValidProgramId,
  isValidRouteId,
  isValidVisaDetailId,
  validateBilateralRouteOverride,
  validateCatalogCoverageMetrics,
  validateChangelogRecord,
  validateClaimEvidenceLinkage,
  validateClaimRecord,
  validateCountryRecord,
  validateEditorialArticleRecord,
  validateEvidenceRecord,
  validateImmigrationProgramRecord,
  validateOfficialSourceRecord,
  validateProgramCollection,
  validateQuarantineRecord,
  validateVisaDetailRecord,
  type ClaimRecord,
  type EvidenceRecord,
  type ImmigrationProgramRecord,
  type OfficialSourceRecord
} from '../src/schemas/catalogSchemas';

import { VERIFIED_IMMIGRATION_PROGRAMS } from '../src/data/globalImmigrationHubData';
import { OFFICIAL_SOURCE_REGISTRY_249 } from '../src/data/officialSourceRegistry';
import type { ImmigrationChangelogItem } from '../src/services/immigrationAutoSync';

const FIXED_NOW = new Date('2026-11-23T00:00:00.000Z');

function makeValidSource(overrides: Partial<OfficialSourceRecord> = {}): OfficialSourceRecord {
  return {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    sourceId: 'SRC-US-USCIS',
    countryIso: 'US',
    issuingAuthority: 'U.S. Citizenship and Immigration Services (USCIS)',
    officialOrganizationName: 'Department of Homeland Security — USCIS',
    officialHttpsUrl: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
    sourceCategory: 'SOVEREIGN_IMMIGRATION_PORTAL',
    sourceLanguage: 'en',
    lastCheckedDate: '2026-11-10',
    httpAvailabilityStatus: 'REACHABLE_2XX',
    evidenceNotes: 'Verified official government portal.',
    ...overrides
  };
}

function makeValidProgram(overrides: Partial<ImmigrationProgramRecord> = {}): ImmigrationProgramRecord {
  return {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    programId: 'US-WORK-H1B-SPECIALTY',
    destinationCountryIso: 'US',
    programName: 'H-1B Specialty Occupations',
    immigrationCategory: 'work',
    programType: 'Actual Immigration Program',
    eligibilitySummary: 'Employer-sponsored specialty occupation requiring a relevant degree or equivalent.',
    officialSourceRefs: [
      {
        sourceId: 'SRC-US-USCIS',
        url: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
        title: 'USCIS H-1B Specialty Occupations'
      }
    ],
    verificationStatus: 'AVAILABLE_VERIFIED',
    createdDate: '2026-01-15',
    lastVerifiedDate: '2026-11-10',
    lastUpdatedDate: '2026-11-10',
    publicationStatus: 'PUBLISHED',
    ...overrides
  };
}

function makeValidClaim(overrides: Partial<ClaimRecord> = {}): ClaimRecord {
  const claimId = overrides.claimId ?? generateClaimId('US-WORK-H1B-SPECIALTY', 'eligibility', 'specialty-degree');
  const evId = generateEvidenceId(claimId, 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations', 'degree-req');
  return {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    claimId,
    programId: 'US-WORK-H1B-SPECIALTY',
    claimText: 'Applicants must hold a U.S. bachelor degree or higher (or equivalent) required by the specialty occupation.',
    claimClassification: 'LEGAL_REQUIREMENT',
    officialSourceId: 'SRC-US-USCIS',
    sourceUrl: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
    evidenceIds: [evId],
    supportingExcerpt: 'Specialty occupation requires theoretical and practical application of a body of highly specialized knowledge.',
    accessDate: '2026-11-10',
    verificationDate: '2026-11-10',
    verificationStatus: 'AVAILABLE_VERIFIED',
    ...overrides
  };
}

function makeValidEvidence(claim: ClaimRecord, overrides: Partial<EvidenceRecord> = {}): EvidenceRecord {
  return {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    evidenceId: claim.evidenceIds[0],
    claimId: claim.claimId,
    officialSourceId: claim.officialSourceId,
    sourceUrl: claim.sourceUrl,
    issuingAuthority: 'U.S. Citizenship and Immigration Services (USCIS)',
    sourceTitle: 'H-1B Specialty Occupations | USCIS',
    accessDate: '2026-11-10',
    lastVerifiedDate: '2026-11-10',
    supportingExcerpt: claim.supportingExcerpt ?? null,
    evidenceStatus: 'VERIFIED_OFFICIAL',
    ...overrides
  };
}

// ----------------------------------------------------------------------------
// 1. Valid country records
// ----------------------------------------------------------------------------
test('1. Country schema validates canonical 249-ISO country records (US, GB, IN, uninhabited AQ)', () => {
  assert.equal(CANONICAL_249_ISO2_UPPER.size, 249);
  assert.equal(CANONICAL_15_LANGUAGES_SET.size, 15);

  const usRes = validateCountryRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    isoCode: 'US',
    slug: 'us',
    countryName: 'United States',
    localizedNames: { en: 'United States', es: 'Estados Unidos', hi: 'संयुक्त राज्य अमेरिका' },
    officialCountryDomain: 'gov',
    immigrationAuthorityRefs: ['SRC-US-USCIS', 'SRC-US-DOS'],
    supportedLanguages: ['en', 'es', 'hi'],
    availableImmigrationCategories: ['pr', 'citizenship', 'work', 'student', 'family', 'business', 'investor', 'tourist', 'pet_travel'],
    lastReviewedAt: '2026-11-10T00:00:00Z',
    recordStatus: 'ACTIVE',
    continent: 'North America'
  });
  assert.equal(usRes.success, true);
  if (usRes.success) {
    assert.equal(usRes.data.isoCode, 'US');
    assert.equal(usRes.data.slug, 'us');
  }

  const gbRes = validateCountryRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    isoCode: 'gb', // normalized to GB
    slug: 'gb',
    countryName: 'United Kingdom',
    localizedNames: { en: 'United Kingdom', fr: 'Royaume-Uni' },
    officialCountryDomain: 'gov.uk',
    immigrationAuthorityRefs: ['SRC-GB-HOME-OFFICE'],
    supportedLanguages: ['en', 'fr'],
    availableImmigrationCategories: ['work', 'family', 'student', 'citizenship'],
    lastReviewedAt: '2026-11-10',
    recordStatus: 'ACTIVE'
  });
  assert.equal(gbRes.success, true);
  if (gbRes.success) assert.equal(gbRes.data.isoCode, 'GB');

  const aqRes = validateCountryRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    isoCode: 'AQ',
    slug: 'aq',
    countryName: 'Antarctica',
    localizedNames: { en: 'Antarctica' },
    officialCountryDomain: 'aq',
    immigrationAuthorityRefs: [],
    supportedLanguages: ['en'],
    availableImmigrationCategories: [],
    lastReviewedAt: '2026-11-10',
    recordStatus: 'UNINHABITED_TERRITORY'
  });
  assert.equal(aqRes.success, true);
});

// ----------------------------------------------------------------------------
// 2. Invalid country identifiers
// ----------------------------------------------------------------------------
test('2. Country schema rejects non-249 ISO codes (XX, UK, USA), slug mismatch, unsupported lang, and ACTIVE without authority', () => {
  assert.equal(isValidCanonicalIso2('US'), true);
  assert.equal(isValidCanonicalIso2('GB'), true);
  assert.equal(isValidCanonicalIso2('UK'), false);
  assert.equal(isValidCanonicalIso2('XX'), false);
  assert.equal(isValidCanonicalIso2('USA'), false);

  const badIso = validateCountryRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    isoCode: 'UK',
    slug: 'uk',
    countryName: 'United Kingdom',
    localizedNames: {},
    officialCountryDomain: 'gov.uk',
    immigrationAuthorityRefs: ['SRC-GB-HOME-OFFICE'],
    supportedLanguages: ['en'],
    availableImmigrationCategories: ['work'],
    lastReviewedAt: '2026-11-10',
    recordStatus: 'ACTIVE'
  });
  assert.equal(badIso.success, false);
  if (!badIso.success) {
    assert.ok(badIso.issues.some((i) => i.code === 'INVALID_COUNTRY_ISO2'));
  }

  const badSlugAndAuthority = validateCountryRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    isoCode: 'IN',
    slug: 'india',
    countryName: 'India',
    localizedNames: { klingon: 'India' },
    officialCountryDomain: 'gov.in',
    immigrationAuthorityRefs: [],
    supportedLanguages: ['en'],
    availableImmigrationCategories: ['tourist'],
    lastReviewedAt: '2026-11-10',
    recordStatus: 'ACTIVE'
  });
  assert.equal(badSlugAndAuthority.success, false);
  if (!badSlugAndAuthority.success) {
    assert.ok(badSlugAndAuthority.issues.some((i) => i.code === 'SLUG_ISO_MISMATCH'));
    assert.ok(badSlugAndAuthority.issues.some((i) => i.code === 'UNSUPPORTED_LANGUAGE'));
    assert.ok(badSlugAndAuthority.issues.some((i) => i.code === 'MISSING_OFFICIAL_AUTHORITY'));
  }
});

// ----------------------------------------------------------------------------
// 3. Valid immigration program records (canonical + preserved legacy IDs)
// ----------------------------------------------------------------------------
test('3. Immigration program schema validates canonical and preserved legacy IDs', () => {
  const canonical = validateImmigrationProgramRecord(makeValidProgram(), { nowDate: FIXED_NOW });
  assert.equal(canonical.success, true);

  const legacyPreserved = validateImmigrationProgramRecord(
    makeValidProgram({
      programId: 'us-TOU-001',
      immigrationCategory: 'tourist',
      programName: 'B-1/B-2 Visitor Visa'
    }),
    { nowDate: FIXED_NOW }
  );
  assert.equal(legacyPreserved.success, true);

  const countryPrefixMismatch = validateImmigrationProgramRecord(
    makeValidProgram({ programId: 'CA-WORK-LMIA', destinationCountryIso: 'US' }),
    { nowDate: FIXED_NOW }
  );
  assert.equal(countryPrefixMismatch.success, false);
  if (!countryPrefixMismatch.success) {
    assert.ok(countryPrefixMismatch.issues.some((i) => i.code === 'PROGRAM_COUNTRY_PREFIX_MISMATCH'));
  }
});

// ----------------------------------------------------------------------------
// 4. Duplicate program IDs
// ----------------------------------------------------------------------------
test('4. Program collection validator rejects exact and case-variant duplicate program IDs', () => {
  const p1 = makeValidProgram({ programId: 'US-WORK-H1B-SPECIALTY' });
  const p2 = makeValidProgram({ programId: 'us-work-h1b-specialty' });

  const dupRes = validateProgramCollection([p1, p2], { nowDate: FIXED_NOW });
  assert.equal(dupRes.success, false);
  if (!dupRes.success) {
    assert.ok(dupRes.issues.some((i) => i.code === 'DUPLICATE_PROGRAM_ID'));
  }

  const p3 = makeValidProgram({ programId: 'US-PR-EB2-NIW', immigrationCategory: 'pr', programName: 'EB-2 NIW' });
  const uniqueRes = validateProgramCollection([p1, p3], { nowDate: FIXED_NOW });
  assert.equal(uniqueRes.success, true);
});

// ----------------------------------------------------------------------------
// 5. Missing official source URLs
// ----------------------------------------------------------------------------
test('5. Missing official source URLs are rejected for PUBLISHED and AVAILABLE_VERIFIED programs', () => {
  const noSourcePublished = validateImmigrationProgramRecord(
    makeValidProgram({ officialSourceRefs: [] }),
    { nowDate: FIXED_NOW }
  );
  assert.equal(noSourcePublished.success, false);
  if (!noSourcePublished.success) {
    assert.ok(noSourcePublished.issues.some((i) => i.code === 'MISSING_OFFICIAL_SOURCE_URL'));
    assert.ok(noSourcePublished.issues.some((i) => i.code === 'VERIFIED_WITHOUT_OFFICIAL_SOURCE'));
  }

  // Quarantined pending record without official URL yet is preserved (not published)
  const pendingQuarantined = validateImmigrationProgramRecord(
    makeValidProgram({
      officialSourceRefs: [],
      verificationStatus: 'AWAITING_OFFICIAL_VERIFICATION',
      publicationStatus: 'QUARANTINED',
      lastVerifiedDate: null
    }),
    { nowDate: FIXED_NOW }
  );
  assert.equal(pendingQuarantined.success, true);
  if (pendingQuarantined.success) {
    const gate = isEligibleForPublicCatalogIndex(pendingQuarantined.data, { nowDate: FIXED_NOW });
    assert.equal(gate.eligible, false);
  }
});

// ----------------------------------------------------------------------------
// 6. Invalid or non-HTTPS official source URLs (blogs/commercial agencies/localhost)
// ----------------------------------------------------------------------------
test('6. Official source validator rejects HTTP, javascript:, localhost, private IPs, and commercial/blog domains', () => {
  const badUrls = [
    'http://www.uscis.gov/h1b',
    'javascript:alert(1)',
    'https://user:pass@www.uscis.gov/',
    'https://localhost:3000/visa',
    'https://127.0.0.1/visa',
    'https://192.168.1.10/visa',
    'https://en.wikipedia.org/wiki/H-1B_visa',
    'https://www.atlys.com/en-US/us-visa',
    'https://www.ivisa.com/usa-visa',
    'https://www.schengenvisainfo.com/germany/',
    'https://visaguide.world/us-visa/',
    'https://medium.com/@someone/us-visa-guide',
    'https://example.com/official-visa'
  ];

  for (const url of badUrls) {
    const res = validateOfficialSourceRecord(makeValidSource({ officialHttpsUrl: url }));
    assert.equal(res.success, false, `Expected unofficial/invalid URL to be rejected: ${url}`);
    if (!res.success) {
      assert.ok(res.issues.some((i) => i.code === 'INVALID_OFFICIAL_URL'), `Missing INVALID_OFFICIAL_URL for ${url}`);
    }
  }

  const validGov = validateOfficialSourceRecord(makeValidSource());
  assert.equal(validGov.success, true);
});

// ----------------------------------------------------------------------------
// 7. Missing verification metadata
// ----------------------------------------------------------------------------
test('7. Missing verification dates are rejected on PUBLISHED/AVAILABLE_VERIFIED programs, details, claims, and VERIFIED_OFFICIAL evidence', () => {
  const progNoDate = validateImmigrationProgramRecord(
    makeValidProgram({ lastVerifiedDate: null }),
    { nowDate: FIXED_NOW }
  );
  assert.equal(progNoDate.success, false);
  if (!progNoDate.success) {
    assert.ok(progNoDate.issues.some((i) => i.code === 'MISSING_VERIFICATION_DATE'));
  }

  const claimNoDate = validateClaimRecord(makeValidClaim({ verificationDate: null }));
  assert.equal(claimNoDate.success, false);
  if (!claimNoDate.success) {
    assert.ok(claimNoDate.issues.some((i) => i.code === 'MISSING_VERIFICATION_DATE'));
  }

  const baseClaim = makeValidClaim();
  const evNoDate = validateEvidenceRecord(makeValidEvidence(baseClaim, { lastVerifiedDate: null }));
  assert.equal(evNoDate.success, false);
  if (!evNoDate.success) {
    assert.ok(evNoDate.issues.some((i) => i.code === 'MISSING_VERIFICATION_DATE'));
  }
});

// ----------------------------------------------------------------------------
// 8. Expired program publication rejection
// ----------------------------------------------------------------------------
test('8. Expired programs are rejected from PUBLISHED and AVAILABLE_VERIFIED, and accepted when quarantined as EXPIRED', () => {
  const expiredPublished = validateImmigrationProgramRecord(
    makeValidProgram({ expiresAt: '2026-06-30' }),
    { nowDate: FIXED_NOW }
  );
  assert.equal(expiredPublished.success, false);
  if (!expiredPublished.success) {
    assert.ok(expiredPublished.issues.some((i) => i.code === 'EXPIRED_PROGRAM_PUBLICATION_REJECTED'));
    assert.ok(expiredPublished.issues.some((i) => i.code === 'EXPIRED_MARKED_AVAILABLE'));
  }

  const expiredStatusPublished = validateImmigrationProgramRecord(
    makeValidProgram({ verificationStatus: 'EXPIRED', publicationStatus: 'PUBLISHED' }),
    { nowDate: FIXED_NOW }
  );
  assert.equal(expiredStatusPublished.success, false);
  if (!expiredStatusPublished.success) {
    assert.ok(expiredStatusPublished.issues.some((i) => i.code === 'UNVERIFIED_PUBLICATION_REJECTED'));
  }

  const expiredQuarantined = validateImmigrationProgramRecord(
    makeValidProgram({
      verificationStatus: 'EXPIRED',
      publicationStatus: 'QUARANTINED',
      expiresAt: '2026-06-30'
    }),
    { nowDate: FIXED_NOW }
  );
  assert.equal(expiredQuarantined.success, true);
  if (expiredQuarantined.success) {
    const gate = isEligibleForPublicCatalogIndex(expiredQuarantined.data, { nowDate: FIXED_NOW });
    assert.equal(gate.eligible, false);
  }
});

// ----------------------------------------------------------------------------
// 9. Conflicting claim rejection
// ----------------------------------------------------------------------------
test('9. Conflicting claims block published program eligibility and cross-file linkage validation', () => {
  const source = makeValidSource();
  const program = makeValidProgram();
  const conflictingClaim = makeValidClaim({
    verificationStatus: 'CONFLICTING',
    verificationDate: null
  });
  const evidence = makeValidEvidence(conflictingClaim, { evidenceStatus: 'PENDING_REVIEW', lastVerifiedDate: null });

  const claimRes = validateClaimRecord(conflictingClaim);
  assert.equal(claimRes.success, true);

  const gate = isEligibleForPublicCatalogIndex(program, {
    nowDate: FIXED_NOW,
    linkedClaims: [conflictingClaim]
  });
  assert.equal(gate.eligible, false);
  assert.ok(gate.reasons.some((r) => r.includes('conflicting claim')));

  const linkage = validateClaimEvidenceLinkage({
    programs: [program],
    officialSources: [source],
    claims: [conflictingClaim],
    evidence: [evidence]
  });
  assert.equal(linkage.success, false);
  if (!linkage.success) {
    assert.ok(linkage.issues.some((i) => i.code === 'CONFLICTING_CLAIM_ON_PUBLISHED_PROGRAM'));
  }
});

// ----------------------------------------------------------------------------
// 10. Evidence linkage validation
// ----------------------------------------------------------------------------
test('10. Cross-file claim/evidence linkage validates intact graphs and rejects dangling, mismatched, orphan, or broken evidence', () => {
  const source = makeValidSource();
  const program = makeValidProgram();
  const claim = makeValidClaim();
  const evidence = makeValidEvidence(claim);

  const okLinkage = validateClaimEvidenceLinkage({
    programs: [program],
    officialSources: [source],
    claims: [claim],
    evidence: [evidence]
  });
  assert.equal(okLinkage.success, true);
  if (okLinkage.success) assert.equal(okLinkage.data.validLinks, 1);

  // Dangling evidence + dangling source + dangling program
  const badRefs = validateClaimEvidenceLinkage({
    programs: [],
    officialSources: [],
    claims: [claim],
    evidence: []
  });
  assert.equal(badRefs.success, false);
  if (!badRefs.success) {
    assert.ok(badRefs.issues.some((i) => i.code === 'DANGLING_PROGRAM_REF'));
    assert.ok(badRefs.issues.some((i) => i.code === 'DANGLING_SOURCE_REF'));
    assert.ok(badRefs.issues.some((i) => i.code === 'DANGLING_EVIDENCE_REF'));
  }

  // Evidence belonging to a different claim + orphan evidence
  const mismatchEvidence = makeValidEvidence(claim, { claimId: 'CL-OTHER0000001' });
  const mismatchRes = validateClaimEvidenceLinkage({
    programs: [program],
    officialSources: [source],
    claims: [claim],
    evidence: [mismatchEvidence]
  });
  assert.equal(mismatchRes.success, false);
  if (!mismatchRes.success) {
    assert.ok(mismatchRes.issues.some((i) => i.code === 'EVIDENCE_CLAIM_MISMATCH'));
    assert.ok(mismatchRes.issues.some((i) => i.code === 'ORPHAN_EVIDENCE'));
  }

  // BROKEN_LINK evidence on AVAILABLE_VERIFIED claim
  const brokenEvidence = makeValidEvidence(claim, { evidenceStatus: 'BROKEN_LINK' });
  const brokenRes = validateClaimEvidenceLinkage({
    programs: [program],
    officialSources: [source],
    claims: [claim],
    evidence: [brokenEvidence]
  });
  assert.equal(brokenRes.success, false);
  if (!brokenRes.success) {
    assert.ok(brokenRes.issues.some((i) => i.code === 'INVALIDATING_EVIDENCE_ON_VERIFIED_CLAIM'));
  }
});

// ----------------------------------------------------------------------------
// 11. Quarantine preservation & coverage metric separation
// ----------------------------------------------------------------------------
test('11. Quarantine records preserve unverified payloads as recoverable=true and reject verified states inside quarantine', () => {
  const qId = generateQuarantineId('program', 'DE-NOMAD-PENDING');
  assert.match(qId, /^QRN-PROGRAM-[A-F0-9]{12}$/);

  const validQuarantine = validateQuarantineRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    quarantineId: qId,
    entityType: 'program',
    entityId: 'DE-NOMAD-PENDING',
    countryIso: 'DE',
    verificationStatus: 'AWAITING_OFFICIAL_VERIFICATION',
    reasonCode: 'AWAITING_OFFICIAL_VERIFICATION',
    reasonSummary: 'Pending primary legislation confirmation from BMI.',
    quarantinedAt: '2026-11-23T00:00:00Z',
    recoverable: true,
    preservedPayload: { programId: 'DE-NOMAD-PENDING', draftNotes: 'Awaiting gazette link' }
  });
  assert.equal(validQuarantine.success, true);

  const badQuarantine = validateQuarantineRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    quarantineId: qId,
    entityType: 'program',
    entityId: 'DE-NOMAD-PENDING',
    verificationStatus: 'AVAILABLE_VERIFIED',
    reasonCode: 'NEEDS_REVIEW',
    reasonSummary: 'Invalid quarantine status',
    quarantinedAt: '2026-11-23T00:00:00Z',
    recoverable: false,
    preservedPayload: null
  });
  assert.equal(badQuarantine.success, false);
  if (!badQuarantine.success) {
    assert.ok(badQuarantine.issues.some((i) => i.code === 'INVALID_ENUM'));
    assert.ok(badQuarantine.issues.some((i) => i.code === 'QUARANTINE_MUST_BE_RECOVERABLE'));
  }

  // Coverage metric separation invariant
  const okMetrics = validateCatalogCoverageMetrics({
    coverageSlotsCount: 1743,
    discoveredProgramsCount: 412,
    verifiedAvailableProgramsCount: 165,
    confirmedNotAvailableCount: 48,
    quarantinedOrPendingCount: 247,
    asOfDate: '2026-11-23'
  });
  assert.equal(okMetrics.success, true);

  const inflatedMetrics = validateCatalogCoverageMetrics({
    coverageSlotsCount: 1743,
    discoveredProgramsCount: 100,
    verifiedAvailableProgramsCount: 150,
    confirmedNotAvailableCount: 0,
    quarantinedOrPendingCount: 0,
    asOfDate: '2026-11-23'
  });
  assert.equal(inflatedMetrics.success, false);
  if (!inflatedMetrics.success) {
    assert.ok(inflatedMetrics.issues.some((i) => i.code === 'METRIC_INVARIANT_VIOLATION'));
  }
});

// ----------------------------------------------------------------------------
// 12. Optional fields and unknown values (no fabricated visa detail sections)
// ----------------------------------------------------------------------------
test('12. Visa detail schema accepts null/omitted optional sections cleanly without fabricating missing facts', () => {
  const detailId = generateVisaDetailId('US-WORK-H1B-SPECIALTY');
  assert.equal(detailId, 'vd-US-WORK-H1B-SPECIALTY');
  assert.equal(isValidVisaDetailId(detailId), true);

  const sparsePublished = validateVisaDetailRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    detailId,
    programId: 'US-WORK-H1B-SPECIALTY',
    destinationCountryIso: 'US',
    verificationStatus: 'AVAILABLE_VERIFIED',
    publicationStatus: 'PUBLISHED',
    lastVerifiedDate: '2026-11-10',
    lastUpdatedDate: '2026-11-10',
    sections: {
      overview: 'Specialty occupation work authorization sponsored by a U.S. employer.',
      applicationFees: null,
      processingTime: null,
      ageRequirements: null,
      requiredDocuments: null,
      officialApplicationLinks: ['https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations']
    },
    claimIds: [],
    evidenceIds: []
  });
  assert.equal(sparsePublished.success, true);
  if (sparsePublished.success) {
    assert.equal(sparsePublished.data.sections.applicationFees, null);
    assert.equal(sparsePublished.data.sections.processingTime, null);
  }

  // Published detail missing officialApplicationLinks fails
  const missingOfficialLink = validateVisaDetailRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    detailId,
    programId: 'US-WORK-H1B-SPECIALTY',
    destinationCountryIso: 'US',
    verificationStatus: 'AVAILABLE_VERIFIED',
    publicationStatus: 'PUBLISHED',
    lastVerifiedDate: '2026-11-10',
    lastUpdatedDate: '2026-11-10',
    sections: { overview: 'Overview only' },
    claimIds: [],
    evidenceIds: []
  });
  assert.equal(missingOfficialLink.success, false);
  if (!missingOfficialLink.success) {
    assert.ok(missingOfficialLink.issues.some((i) => i.code === 'MISSING_OFFICIAL_SOURCE_URL'));
  }
});

// ----------------------------------------------------------------------------
// 13. Deterministic ID generation & bilateral route override validation
// ----------------------------------------------------------------------------
test('13. Deterministic ID generators produce stable non-positional IDs and reject self-routes', () => {
  const pidA = generateProgramId('ca', 'pr', 'Express Entry — Federal Skilled Worker');
  const pidB = generateProgramId('CA', 'pr', 'Express Entry — Federal Skilled Worker');
  assert.equal(pidA, 'CA-PR-EXPRESS-ENTRY-FEDERAL-SKILLED-WORKER');
  assert.equal(pidA, pidB);

  const srcA = generateOfficialSourceId('gb', 'Home Office');
  assert.equal(srcA, 'SRC-GB-HOME-OFFICE');

  const cl1 = generateClaimId(pidA, 'fees', 'principal-applicant-fee');
  const cl2 = generateClaimId(pidA, 'fees', 'principal-applicant-fee');
  assert.equal(cl1, cl2);
  assert.match(cl1, /^CL-[A-F0-9]{12}$/);

  const ev1 = generateEvidenceId(cl1, 'https://www.canada.ca/en/immigration-refugees-citizenship.html', 'fee-table');
  const ev2 = generateEvidenceId(cl1, 'https://www.canada.ca/en/immigration-refugees-citizenship.html', 'fee-table');
  assert.equal(ev1, ev2);
  assert.match(ev1, /^EV-[A-F0-9]{12}$/);

  assert.equal(generateRouteId('IN', 'CA'), 'in-to-ca');
  assert.equal(isValidRouteId('in-to-ca'), true);
  assert.equal(isValidRouteId('in-to-in'), false);
  assert.throws(() => generateRouteId('IN', 'IN'), /INVALID_SELF_ROUTE/);

  const chg = generateChangelogId('2026-11-23', 'US', 'H1B Fee Update');
  assert.equal(chg, 'CHG-2026-11-23-US-H1B-FEE-UPDATE');

  // Bilateral route override validation
  const validRoute = validateBilateralRouteOverride({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    routeId: 'in-to-ca',
    originCountryIso: 'IN',
    destinationCountryIso: 'CA',
    applicableVisaCategories: ['tourist', 'work', 'pr'],
    ruleMatrixRef: 'matrix:v2:default',
    verifiedOverrides: {
      visaFree: false,
      eVisaEligible: false,
      maxStayDays: 180,
      overrideProgramIds: [pidA]
    },
    routePublicationEligible: true,
    verificationMetadata: {
      verificationStatus: 'AVAILABLE_VERIFIED',
      lastVerifiedDate: '2026-11-10',
      officialSourceIds: ['SRC-CA-IRCC']
    }
  });
  assert.equal(validRoute.success, true);

  const unverifiedPublishableRoute = validateBilateralRouteOverride({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    routeId: 'in-to-ca',
    originCountryIso: 'IN',
    destinationCountryIso: 'CA',
    applicableVisaCategories: ['tourist'],
    ruleMatrixRef: 'matrix:v2:default',
    verifiedOverrides: {},
    routePublicationEligible: true,
    verificationMetadata: {
      verificationStatus: 'AWAITING_OFFICIAL_VERIFICATION',
      lastVerifiedDate: null,
      officialSourceIds: []
    }
  });
  assert.equal(unverifiedPublishableRoute.success, false);
  if (!unverifiedPublishableRoute.success) {
    assert.ok(unverifiedPublishableRoute.issues.some((i) => i.code === 'UNVERIFIED_ROUTE_PUBLICATION_REJECTED'));
  }
});

// ----------------------------------------------------------------------------
// 14. Deleted Phase 3.2 fixture rejection
// ----------------------------------------------------------------------------
test('14. Deleted Phase 3.2 and synthetic audit fixture IDs are permanently rejected across all validators', () => {
  const forbiddenIds = [
    'test-phase-3-2-prog',
    'test-p322-temp-001',
    'test-p322-temp-002',
    'pg-test-2106',
    'empty-test',
    'p1-audit-program-1',
    'vd-test-phase-3-2-prog',
    'clm-p322-001',
    'ev-p322-001',
    'claim-32-foo',
    'ev-32-bar',
    'ver-32-pre-check'
  ];

  for (const id of forbiddenIds) {
    assert.equal(isForbiddenFixtureId(id), true, `Expected forbidden fixture ID: ${id}`);
    assert.equal(isValidProgramId(id), false);
    assert.equal(isValidClaimId(id), false);
    assert.equal(isValidEvidenceId(id), false);
    assert.equal(isValidVisaDetailId(id), false);
    assert.equal(isValidEditorialSlug(id), false);
  }

  const progRes = validateImmigrationProgramRecord(
    makeValidProgram({ programId: 'test-phase-3-2-prog' }),
    { nowDate: FIXED_NOW }
  );
  assert.equal(progRes.success, false);
  if (!progRes.success) {
    assert.ok(progRes.issues.some((i) => i.code === 'FORBIDDEN_PHASE32_FIXTURE'));
  }
});

// ----------------------------------------------------------------------------
// 15. Editorial schema & frontmatter validation
// ----------------------------------------------------------------------------
test('15. Editorial schema validates published/draft articles and rejects traversal slugs or unsupported languages', () => {
  const published = validateEditorialArticleRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    slug: 'canada-express-entry-guide',
    language: 'en',
    title: 'Canada Express Entry Official Guide',
    description: 'Evidence-based overview of Canada Express Entry federal programs.',
    markdownContent: '# Canada Express Entry\n\nOfficial federal skilled worker eligibility overview.',
    officialReferences: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html'],
    publicationDate: '2026-11-10',
    updatedDate: '2026-11-23',
    editorialStatus: 'published',
    destinationCountryIso: 'CA',
    category: 'pr'
  });
  assert.equal(published.success, true);

  const draft = validateEditorialArticleRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    slug: 'draft-portugal-d7-notes',
    language: 'pt',
    title: 'Portugal D7 Draft Notes',
    description: 'Draft pending AIMA source verification.',
    markdownContent: '# Draft\n\nPending verification.',
    officialReferences: [],
    publicationDate: null,
    updatedDate: '2026-11-23',
    editorialStatus: 'draft',
    destinationCountryIso: 'PT',
    category: 'retirement'
  });
  assert.equal(draft.success, true);

  const badPublished = validateEditorialArticleRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    slug: '../etc/passwd',
    language: 'xx',
    title: 'Bad Article',
    description: 'Missing pub date & refs',
    markdownContent: 'Body',
    officialReferences: [],
    publicationDate: null,
    updatedDate: '2026-11-23',
    editorialStatus: 'published'
  });
  assert.equal(badPublished.success, false);
  if (!badPublished.success) {
    assert.ok(badPublished.issues.some((i) => i.code === 'INVALID_SLUG'));
    assert.ok(badPublished.issues.some((i) => i.code === 'UNSUPPORTED_LANGUAGE'));
    assert.ok(badPublished.issues.some((i) => i.code === 'MISSING_PUBLICATION_DATE'));
    assert.ok(badPublished.issues.some((i) => i.code === 'MISSING_OFFICIAL_REFERENCES'));
  }
});

// ----------------------------------------------------------------------------
// 16. Changelog validation
// ----------------------------------------------------------------------------
test('16. Changelog schema validates canonical & legacy IDs and rejects unofficial URLs or PII', () => {
  const okChg = validateChangelogRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    changeId: 'CHG-2026-11-23-US-H1B-FEE',
    affectedCountryIso: 'US',
    affectedProgramId: 'US-WORK-H1B-SPECIALTY',
    changeCategory: 'FEE_UPDATE',
    title: 'USCIS H-1B registration fee schedule update',
    previousValue: '$10',
    newValue: '$215',
    sourceReference: {
      sourceId: 'SRC-US-USCIS',
      url: 'https://www.uscis.gov/newsroom'
    },
    changeDate: '2026-11-23',
    verificationStatus: 'AVAILABLE_VERIFIED',
    verifiedBy: 'Automated Official Gazette Check'
  });
  assert.equal(okChg.success, true);

  const badChg = validateChangelogRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    changeId: 'CHG-2026-11-23-US-LEAK',
    affectedCountryIso: 'US',
    changeCategory: 'FEE_UPDATE',
    title: 'Leaked admin email admin@example.org',
    sourceReference: { url: 'https://www.ivisa.com/us-fee' },
    changeDate: '2026-11-23',
    verificationStatus: 'AVAILABLE_VERIFIED'
  });
  assert.equal(badChg.success, false);
  if (!badChg.success) {
    assert.ok(badChg.issues.some((i) => i.code === 'PROHIBITED_PUBLIC_DATA'));
    assert.ok(badChg.issues.some((i) => i.code === 'INVALID_OFFICIAL_URL'));
  }
});

// ----------------------------------------------------------------------------
// 17. Existing data-model compatibility, PII/secret scanner, & Phase 2 skeleton
// ----------------------------------------------------------------------------
test('17a. Existing VERIFIED_IMMIGRATION_PROGRAMS, Tier-1 OFFICIAL_SOURCE_REGISTRY_249, immigrationChangelog.json, and Markdown guide adapt cleanly', () => {
  // 1) All real entries in VERIFIED_IMMIGRATION_PROGRAMS
  assert.ok(VERIFIED_IMMIGRATION_PROGRAMS.length > 0);
  for (const legacyProg of VERIFIED_IMMIGRATION_PROGRAMS) {
    const adapted = adaptLegacyProgramToStaticRecord(legacyProg);
    const res = validateImmigrationProgramRecord(adapted, { nowDate: FIXED_NOW });
    assert.equal(
      res.success,
      true,
      `Failed adapting legacy program "${legacyProg.id}": ${!res.success ? JSON.stringify(res.issues) : ''}`
    );
  }

  // 2) Tier-1 entries in OFFICIAL_SOURCE_REGISTRY_249 (those with primaryGovUrl populated)
  const allRegistryEntries = Object.values(OFFICIAL_SOURCE_REGISTRY_249);
  assert.equal(allRegistryEntries.length, 249);
  const tier1WithUrls = allRegistryEntries.filter((e) => Boolean(e.primaryGovUrl));
  assert.ok(tier1WithUrls.length >= 10);
  for (const entry of tier1WithUrls) {
    const adapted = adaptLegacyOfficialSourceToStaticRecord(entry);
    const res = validateOfficialSourceRecord(adapted);
    assert.equal(
      res.success,
      true,
      `Failed adapting Tier-1 official source "${entry.countryCode}": ${!res.success ? JSON.stringify(res.issues) : ''}`
    );
    if (res.success) {
      assert.equal(res.data.httpAvailabilityStatus, 'REACHABLE_2XX');
    }
  }

  // Unverified registry entries with empty primaryGovUrl MUST NOT pass as valid official sources
  const pendingEntry = allRegistryEntries.find((e) => !e.primaryGovUrl);
  assert.ok(pendingEntry);
  if (pendingEntry) {
    const adaptedPending = adaptLegacyOfficialSourceToStaticRecord(pendingEntry);
    const resPending = validateOfficialSourceRecord(adaptedPending);
    assert.equal(resPending.success, false);
  }

  // 3) All entries in src/data/immigrationChangelog.json
  const changelogRaw = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'src/data/immigrationChangelog.json'), 'utf8')
  ) as ImmigrationChangelogItem[];
  assert.ok(changelogRaw.length >= 8);
  for (const item of changelogRaw) {
    const adapted = adaptLegacyChangelogToStaticRecord(item);
    const res = validateChangelogRecord(adapted);
    assert.equal(
      res.success,
      true,
      `Failed adapting legacy changelog "${item.id}": ${!res.success ? JSON.stringify(res.issues) : ''}`
    );
  }

  // 4) Real Markdown guide content/in-to-ca-tourist.md via gray-matter
  const mdRaw = fs.readFileSync(path.resolve(process.cwd(), 'content/in-to-ca-tourist.md'), 'utf8');
  const parsed = matter(mdRaw);
  const editorialRes = validateEditorialArticleRecord({
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    slug: 'in-to-ca-tourist',
    language: 'en',
    title: String(parsed.data.title),
    description: 'India to Canada Visitor Visa (TRV) step-by-step official guide.',
    markdownContent: parsed.content.trim(),
    officialReferences: ['https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html'],
    publicationDate: String(parsed.data.date),
    updatedDate: String(parsed.data.date),
    editorialStatus: 'published',
    originCountryIso: String(parsed.data.from),
    destinationCountryIso: String(parsed.data.to),
    category: parsed.data.type
  });
  assert.equal(editorialRes.success, true);
});

test('17b. Public PII & secret scanner detects emails, DB URIs, API keys, PEM keys, and secret field names', () => {
  const findings = detectProhibitedPublicSecretsOrPii({
    note: 'Contact user.name@domain.com for help',
    db: 'postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require',
    token: 'ghp_1234567890abcdefghij1234567890abcd',
    gemini: 'AIzaSyD1234567890abcdefghij1234567890',
    pem: '-----BEGIN RSA PRIVATE KEY-----\nMIIE...',
    subscriberEmail: 'hidden-value'
  });
  assert.ok(findings.length >= 6, `Expected >= 6 security findings, got ${findings.length}`);
});

test('17c. Canonical data/ directory layout and schema_manifest.json integrity', () => {
  const manifestPath = path.resolve(process.cwd(), 'data/schema_manifest.json');
  assert.equal(fs.existsSync(manifestPath), true);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.schemaVersion, STATIC_CATALOG_SCHEMA_VERSION);
  assert.ok(
    manifest.phase === 'PHASE_2_SKELETON_ONLY' || manifest.phase === 'PHASE_3_STATIC_CATALOG_POPULATED',
    `Unexpected schema_manifest phase: ${String(manifest.phase)}`
  );

  const requiredDirs = [
    'data/countries',
    'data/routes',
    'data/routes/overrides',
    'data/programs',
    'data/visa-details',
    'data/official-sources',
    'data/verification',
    'data/changelog',
    'data/editorial/published',
    'data/editorial/drafts'
  ];

  for (const rel of requiredDirs) {
    const abs = path.resolve(process.cwd(), rel);
    assert.equal(fs.existsSync(abs), true, `Missing required canonical directory: ${rel}`);
  }
});
