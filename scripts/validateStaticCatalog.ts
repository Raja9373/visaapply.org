import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

import {
  CANONICAL_249_ISO2_UPPER,
  PUBLISHABLE_VERIFICATION_STATUSES,
  STATIC_CATALOG_SCHEMA_VERSION,
  detectProhibitedPublicSecretsOrPii,
  isEligibleForPublicCatalogIndex,
  isForbiddenFixtureId,
  isValidCanonicalIso2,
  isValidRouteId,
  validateBilateralRouteOverride,
  validateCatalogCoverageMetrics,
  validateChangelogRecord,
  validateClaimEvidenceLinkage,
  validateClaimRecord,
  validateCountryRecord,
  validateEditorialArticleRecord,
  validateEvidenceRecord,
  validateOfficialSourceRecord,
  validateProgramCollection,
  validateQuarantineRecord,
  validateVisaDetailRecord,
  type BilateralRouteOverrideRecord,
  type ChangelogRecord,
  type ClaimRecord,
  type CountryRecord,
  type EditorialArticleRecord,
  type EvidenceRecord,
  type ImmigrationProgramRecord,
  type OfficialSourceRecord,
  type QuarantineRecord,
  type VisaDetailRecord
} from '../src/schemas/catalogSchemas';

export interface CatalogValidationDiagnostic {
  severity: 'ERROR' | 'WARNING';
  check: string;
  filePath: string;
  recordId?: string;
  code: string;
  message: string;
}

export interface CatalogValidationSummary {
  filesScanned: number;
  countriesChecked: number;
  activeCountries: number;
  quarantinedCountries: number;
  uninhabitedTerritories: number;
  officialSourcesChecked: number;
  programsChecked: number;
  visaDetailsChecked: number;
  routeOverridesChecked: number;
  claimsChecked: number;
  evidenceChecked: number;
  quarantineRecordsChecked: number;
  changelogEntriesChecked: number;
  editorialPublishedChecked: number;
  editorialDraftsChecked: number;
  errorCount: number;
  warningCount: number;
  passedChecks: number;
  failedChecks: number;
}

export interface CatalogValidationReport {
  valid: boolean;
  dataDir: string;
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  summary: CatalogValidationSummary;
  checks: Array<{ id: number; name: string; status: 'PASS' | 'FAIL'; errorCount: number }>;
  errors: CatalogValidationDiagnostic[];
  warnings: CatalogValidationDiagnostic[];
}

export interface ValidateCatalogOptions {
  dataDir?: string;
  evaluationDate?: Date;
}

const CHECK_NAMES: ReadonlyArray<{ id: number; key: string; name: string }> = [
  { id: 1, key: 'json_syntax', name: 'JSON syntax' },
  { id: 2, key: 'schema_compliance', name: 'Phase 2 schema compliance' },
  { id: 3, key: 'country_iso', name: 'Country ISO identifiers' },
  { id: 4, key: 'program_id', name: 'Program ID validity' },
  { id: 5, key: 'duplicate_ids', name: 'Case-insensitive duplicate IDs' },
  { id: 6, key: 'official_https', name: 'Official HTTPS source validity' },
  { id: 7, key: 'evidence_claim_linkage', name: 'Evidence and claim relationships' },
  { id: 8, key: 'quarantine_integrity', name: 'Quarantine integrity' },
  { id: 9, key: 'pii_secrets', name: 'Public PII and secret detection' },
  { id: 10, key: 'phase32_fixtures', name: 'Deleted Phase 3.2 fixture exclusion' },
  { id: 11, key: 'route_integrity', name: 'Route matrix and override integrity' },
  { id: 12, key: 'editorial_frontmatter', name: 'Editorial Markdown frontmatter' },
  { id: 13, key: 'changelog_consistency', name: 'Changelog consistency' },
  { id: 14, key: 'country_program_links', name: 'Country-to-program relationships' },
  { id: 15, key: 'publication_eligibility', name: 'Publication eligibility' },
  { id: 16, key: 'coverage_metrics', name: 'Coverage metric consistency' },
  { id: 17, key: 'publishable_purity', name: 'No unverified records in publishable collections' }
];

function relPath(baseDir: string, fullPath: string): string {
  return path.relative(baseDir, fullPath).replace(/\\/g, '/');
}

function listFilesByExt(dirPath: string, ext: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(ext) && !fs.statSync(path.join(dirPath, f)).isDirectory())
    .sort()
    .map((f) => path.join(dirPath, f));
}

export function validateStaticCatalog(options: ValidateCatalogOptions = {}): CatalogValidationReport {
  const dataDir = path.resolve(options.dataDir ?? path.join(process.cwd(), 'data'));
  const evaluationDate = options.evaluationDate ?? new Date('2026-11-23T00:00:00.000Z');

  const errors: CatalogValidationDiagnostic[] = [];
  const warnings: CatalogValidationDiagnostic[] = [];
  let filesScanned = 0;

  const addError = (check: string, filePath: string, code: string, message: string, recordId?: string) => {
    errors.push({ severity: 'ERROR', check, filePath, ...(recordId ? { recordId } : {}), code, message });
  };
  const addWarning = (check: string, filePath: string, code: string, message: string, recordId?: string) => {
    warnings.push({ severity: 'WARNING', check, filePath, ...(recordId ? { recordId } : {}), code, message });
  };

  const readJson = (filePath: string): { ok: true; data: unknown } | { ok: false } => {
    filesScanned++;
    const r = relPath(dataDir, filePath);
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw) as unknown;
      // Check #9: PII & Secret detection across all parsed JSON
      const piiFindings = detectProhibitedPublicSecretsOrPii(parsed);
      for (const finding of piiFindings) {
        addError('pii_secrets', r, 'PROHIBITED_PUBLIC_DATA', finding);
      }
      return { ok: true, data: parsed };
    } catch (err) {
      addError(
        'json_syntax',
        r,
        'INVALID_JSON',
        `Failed to parse JSON: ${err instanceof Error ? err.message : String(err)}`
      );
      return { ok: false };
    }
  };

  // Registries for cross-file relational checks
  const countryMap = new Map<string, CountryRecord>();
  const sourceMap = new Map<string, OfficialSourceRecord>();
  const programMap = new Map<string, ImmigrationProgramRecord>();
  const visaDetailsList: VisaDetailRecord[] = [];
  const claimsList: ClaimRecord[] = [];
  const evidenceList: EvidenceRecord[] = [];
  const quarantineList: QuarantineRecord[] = [];
  const routeOverridesList: BilateralRouteOverrideRecord[] = [];
  const changelogList: ChangelogRecord[] = [];
  const publishedEditorialList: EditorialArticleRecord[] = [];
  const draftEditorialList: EditorialArticleRecord[] = [];

  const seenProgramIdsUpper = new Map<string, string>();
  const seenSourceIdsUpper = new Map<string, string>();
  const seenRouteIdsLower = new Map<string, string>();
  const seenChangelogIdsUpper = new Map<string, string>();
  const seenQuarantineIdsUpper = new Map<string, string>();
  const seenEditorialSlugs = new Map<string, string>();

  // --------------------------------------------------------------------------
  // 1. Validate Countries (`data/countries/<iso2>.json`)
  // --------------------------------------------------------------------------
  const countryFiles = listFilesByExt(path.join(dataDir, 'countries'), '.json');
  if (countryFiles.length !== 249) {
    addError(
      'country_iso',
      'countries/',
      'INCOMPLETE_COUNTRY_REGISTRY',
      `Expected 249 country JSON files in data/countries/, found ${countryFiles.length}.`
    );
  }

  for (const fp of countryFiles) {
    const r = relPath(dataDir, fp);
    const parsed = readJson(fp);
    if (!parsed.ok) continue;

    const baseSlug = path.basename(fp, '.json');
    if (isForbiddenFixtureId(baseSlug)) {
      addError('phase32_fixtures', r, 'FORBIDDEN_PHASE32_FIXTURE', `Forbidden fixture filename "${baseSlug}".`, baseSlug);
    }

    const val = validateCountryRecord(parsed.data);
    if (!val.success) {
      for (const iss of val.issues) {
        const checkKey = iss.code === 'INVALID_COUNTRY_ISO2' || iss.code === 'SLUG_ISO_MISMATCH' ? 'country_iso' : 'schema_compliance';
        addError(checkKey, r, iss.code, `${iss.path}: ${iss.message}`, baseSlug);
      }
      continue;
    }

    if (val.data.slug !== baseSlug) {
      addError('country_iso', r, 'FILENAME_ISO_MISMATCH', `Filename "${baseSlug}.json" does not match country slug "${val.data.slug}".`, val.data.isoCode);
    }
    if (countryMap.has(val.data.isoCode)) {
      addError('duplicate_ids', r, 'DUPLICATE_COUNTRY_ISO', `Duplicate country ISO "${val.data.isoCode}".`, val.data.isoCode);
    } else {
      countryMap.set(val.data.isoCode, val.data);
    }
  }

  // Verify every canonical 249 ISO code is present
  for (const iso of CANONICAL_249_ISO2_UPPER) {
    if (!countryMap.has(iso)) {
      addError('country_iso', `countries/${iso.toLowerCase()}.json`, 'MISSING_CANONICAL_COUNTRY', `Missing canonical country record for ISO "${iso}".`, iso);
    }
  }

  // --------------------------------------------------------------------------
  // 2. Validate Official Sources (`data/official-sources/<iso2>.json`)
  // --------------------------------------------------------------------------
  const sourceFiles = listFilesByExt(path.join(dataDir, 'official-sources'), '.json');
  for (const fp of sourceFiles) {
    const r = relPath(dataDir, fp);
    const parsed = readJson(fp);
    if (!parsed.ok) continue;

    if (!Array.isArray(parsed.data)) {
      addError('schema_compliance', r, 'EXPECTED_ARRAY', 'Official source country file must be a JSON array.');
      continue;
    }

    const fileIso = path.basename(fp, '.json').toUpperCase();
    for (const rawItem of parsed.data) {
      const val = validateOfficialSourceRecord(rawItem);
      if (!val.success) {
        for (const iss of val.issues) {
          const checkKey = iss.code === 'INVALID_OFFICIAL_URL' ? 'official_https' : 'schema_compliance';
          addError(checkKey, r, iss.code, `${iss.path}: ${iss.message}`, String((rawItem as Record<string, unknown>)?.sourceId ?? ''));
        }
        continue;
      }

      if (val.data.countryIso !== fileIso) {
        addError('country_iso', r, 'SOURCE_FILE_ISO_MISMATCH', `Official source "${val.data.sourceId}" countryIso "${val.data.countryIso}" does not match filename "${fileIso.toLowerCase()}.json".`, val.data.sourceId);
      }

      const upperId = val.data.sourceId.toUpperCase();
      if (seenSourceIdsUpper.has(upperId)) {
        addError('duplicate_ids', r, 'DUPLICATE_SOURCE_ID', `Duplicate sourceId "${val.data.sourceId}" (already in ${seenSourceIdsUpper.get(upperId)}).`, val.data.sourceId);
      } else {
        seenSourceIdsUpper.set(upperId, r);
        sourceMap.set(val.data.sourceId, val.data);
      }
    }
  }

  // Verify ACTIVE country authority refs exist in sourceMap
  for (const country of countryMap.values()) {
    for (const refId of country.immigrationAuthorityRefs) {
      if (!sourceMap.has(refId)) {
        addError(
          'official_https',
          `countries/${country.slug}.json`,
          'DANGLING_COUNTRY_AUTHORITY_REF',
          `Country "${country.isoCode}" references missing official source "${refId}".`,
          country.isoCode
        );
      }
    }
  }

  // --------------------------------------------------------------------------
  // 3. Validate Immigration Programs (`data/programs/<destination-iso2>.json`)
  // --------------------------------------------------------------------------
  const programFiles = listFilesByExt(path.join(dataDir, 'programs'), '.json');
  for (const fp of programFiles) {
    const r = relPath(dataDir, fp);
    const parsed = readJson(fp);
    if (!parsed.ok) continue;

    if (!Array.isArray(parsed.data)) {
      addError('schema_compliance', r, 'EXPECTED_ARRAY', 'Program country file must be a JSON array.');
      continue;
    }

    const fileIso = path.basename(fp, '.json').toUpperCase();

    // Check forbidden fixtures & raw records before collection check
    for (const rawItem of parsed.data) {
      const rec = rawItem as Record<string, unknown>;
      const pid = String(rec?.programId ?? '');
      if (isForbiddenFixtureId(pid)) {
        addError('phase32_fixtures', r, 'FORBIDDEN_PHASE32_FIXTURE', `Deleted Phase 3.2 fixture "${pid}" found in programs collection.`, pid);
      }
    }

    const colVal = validateProgramCollection(parsed.data, { nowDate: evaluationDate });
    if (!colVal.success) {
      for (const iss of colVal.issues) {
        const checkKey =
          iss.code === 'DUPLICATE_PROGRAM_ID'
            ? 'duplicate_ids'
            : iss.code === 'FORBIDDEN_PHASE32_FIXTURE'
              ? 'phase32_fixtures'
              : iss.code === 'INVALID_PROGRAM_ID' || iss.code === 'PROGRAM_COUNTRY_PREFIX_MISMATCH'
                ? 'program_id'
                : iss.code === 'INVALID_OFFICIAL_URL' || iss.code === 'MISSING_OFFICIAL_SOURCE_URL' || iss.code === 'VERIFIED_WITHOUT_OFFICIAL_SOURCE'
                  ? 'official_https'
                  : iss.code === 'UNVERIFIED_PUBLICATION_REJECTED' || iss.code === 'EXPIRED_PROGRAM_PUBLICATION_REJECTED' || iss.code === 'EXPIRED_MARKED_AVAILABLE'
                    ? 'publishable_purity'
                    : 'schema_compliance';
        addError(checkKey, r, iss.code, `${iss.path}: ${iss.message}`);
      }
      continue;
    }

    for (const prog of colVal.data) {
      if (prog.destinationCountryIso !== fileIso) {
        addError('country_program_links', r, 'PROGRAM_FILE_ISO_MISMATCH', `Program "${prog.programId}" destination "${prog.destinationCountryIso}" does not match filename "${fileIso.toLowerCase()}.json".`, prog.programId);
      }

      const upperId = prog.programId.toUpperCase();
      if (seenProgramIdsUpper.has(upperId)) {
        addError('duplicate_ids', r, 'DUPLICATE_PROGRAM_ID', `Duplicate programId "${prog.programId}" across files (already in ${seenProgramIdsUpper.get(upperId)}).`, prog.programId);
      } else {
        seenProgramIdsUpper.set(upperId, r);
        programMap.set(prog.programId, prog);
      }

      // Check #14: Country-to-program relationship
      const parentCountry = countryMap.get(prog.destinationCountryIso);
      if (!parentCountry) {
        addError('country_program_links', r, 'MISSING_PARENT_COUNTRY', `Program "${prog.programId}" references unknown country "${prog.destinationCountryIso}".`, prog.programId);
      } else if (parentCountry.recordStatus !== 'ACTIVE') {
        addError('country_program_links', r, 'PROGRAM_ON_NON_ACTIVE_COUNTRY', `Published program "${prog.programId}" belongs to non-ACTIVE country "${prog.destinationCountryIso}" (${parentCountry.recordStatus}).`, prog.programId);
      }

      // Check #6: Every program officialSourceRef.sourceId must resolve to data/official-sources/
      for (const ref of prog.officialSourceRefs) {
        if (!sourceMap.has(ref.sourceId)) {
          addError('official_https', r, 'DANGLING_PROGRAM_SOURCE_ID', `Program "${prog.programId}" references unknown official source "${ref.sourceId}".`, prog.programId);
        }
      }

      // Check #15 & #17: Publishable collection purity & public index gate
      const gate = isEligibleForPublicCatalogIndex(prog, { nowDate: evaluationDate });
      if (!gate.eligible) {
        addError('publishable_purity', r, 'INELIGIBLE_PROGRAM_IN_PUBLISHABLE_DIR', `Program "${prog.programId}" in data/programs/ failed publication gate: ${gate.reasons.join(' ')}`, prog.programId);
        addError('publication_eligibility', r, 'PUBLICATION_GATE_FAILED', gate.reasons.join(' '), prog.programId);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 4. Validate Visa Details (`data/visa-details/<program-id>.json`)
  // --------------------------------------------------------------------------
  const visaDetailFiles = listFilesByExt(path.join(dataDir, 'visa-details'), '.json');
  const seenDetailIdsUpper = new Set<string>();
  for (const fp of visaDetailFiles) {
    const r = relPath(dataDir, fp);
    const parsed = readJson(fp);
    if (!parsed.ok) continue;

    const val = validateVisaDetailRecord(parsed.data);
    if (!val.success) {
      for (const iss of val.issues) {
        addError('schema_compliance', r, iss.code, `${iss.path}: ${iss.message}`);
      }
      continue;
    }

    if (isForbiddenFixtureId(val.data.programId) || isForbiddenFixtureId(val.data.detailId)) {
      addError('phase32_fixtures', r, 'FORBIDDEN_PHASE32_FIXTURE', `Forbidden fixture ID in visa detail "${val.data.detailId}".`, val.data.detailId);
    }

    const expectedFile = `${val.data.programId}.json`;
    if (path.basename(fp) !== expectedFile) {
      addError('program_id', r, 'VISA_DETAIL_FILENAME_MISMATCH', `Visa detail filename "${path.basename(fp)}" must match "${expectedFile}".`, val.data.detailId);
    }

    if (seenDetailIdsUpper.has(val.data.detailId.toUpperCase())) {
      addError('duplicate_ids', r, 'DUPLICATE_VISA_DETAIL_ID', `Duplicate detailId "${val.data.detailId}".`, val.data.detailId);
    } else {
      seenDetailIdsUpper.add(val.data.detailId.toUpperCase());
    }

    if (!programMap.has(val.data.programId)) {
      addError('country_program_links', r, 'ORPHAN_VISA_DETAIL', `Visa detail "${val.data.detailId}" references missing/unpublished program "${val.data.programId}".`, val.data.detailId);
    }

    if (val.data.publicationStatus !== 'PUBLISHED' || !PUBLISHABLE_VERIFICATION_STATUSES.has(val.data.verificationStatus)) {
      addError('publishable_purity', r, 'UNVERIFIED_VISA_DETAIL_IN_PUBLISHABLE_DIR', `Visa detail "${val.data.detailId}" is not PUBLISHED + verified.`, val.data.detailId);
    }

    visaDetailsList.push(val.data);
  }

  // --------------------------------------------------------------------------
  // 5. Validate Verification Files (`claims.json`, `evidence.json`, `quarantine.json`, `batch-state.json`)
  // --------------------------------------------------------------------------
  const claimsPath = path.join(dataDir, 'verification/claims.json');
  if (fs.existsSync(claimsPath)) {
    const parsed = readJson(claimsPath);
    if (parsed.ok) {
      if (!Array.isArray(parsed.data)) {
        addError('schema_compliance', 'verification/claims.json', 'EXPECTED_ARRAY', 'claims.json must be a JSON array.');
      } else {
        for (const item of parsed.data) {
          const val = validateClaimRecord(item);
          if (!val.success) {
            for (const iss of val.issues) {
              addError(iss.code === 'INVALID_OFFICIAL_URL' ? 'official_https' : 'schema_compliance', 'verification/claims.json', iss.code, `${iss.path}: ${iss.message}`);
            }
          } else {
            if (isForbiddenFixtureId(val.data.claimId) || isForbiddenFixtureId(val.data.programId)) {
              addError('phase32_fixtures', 'verification/claims.json', 'FORBIDDEN_PHASE32_FIXTURE', `Forbidden fixture in claim "${val.data.claimId}".`, val.data.claimId);
            }
            claimsList.push(val.data);
          }
        }
      }
    }
  } else {
    addError('evidence_claim_linkage', 'verification/claims.json', 'MISSING_REQUIRED_FILE', 'Missing data/verification/claims.json.');
  }

  const evidencePath = path.join(dataDir, 'verification/evidence.json');
  if (fs.existsSync(evidencePath)) {
    const parsed = readJson(evidencePath);
    if (parsed.ok) {
      if (!Array.isArray(parsed.data)) {
        addError('schema_compliance', 'verification/evidence.json', 'EXPECTED_ARRAY', 'evidence.json must be a JSON array.');
      } else {
        for (const item of parsed.data) {
          const val = validateEvidenceRecord(item);
          if (!val.success) {
            for (const iss of val.issues) {
              addError(iss.code === 'INVALID_OFFICIAL_URL' ? 'official_https' : 'schema_compliance', 'verification/evidence.json', iss.code, `${iss.path}: ${iss.message}`);
            }
          } else {
            if (isForbiddenFixtureId(val.data.evidenceId) || isForbiddenFixtureId(val.data.claimId)) {
              addError('phase32_fixtures', 'verification/evidence.json', 'FORBIDDEN_PHASE32_FIXTURE', `Forbidden fixture in evidence "${val.data.evidenceId}".`, val.data.evidenceId);
            }
            evidenceList.push(val.data);
          }
        }
      }
    }
  } else {
    addError('evidence_claim_linkage', 'verification/evidence.json', 'MISSING_REQUIRED_FILE', 'Missing data/verification/evidence.json.');
  }

  // Check #7: Cross-file claim/evidence linkage
  const linkage = validateClaimEvidenceLinkage({
    programs: Array.from(programMap.values()),
    officialSources: Array.from(sourceMap.values()),
    claims: claimsList,
    evidence: evidenceList
  });
  if (!linkage.success) {
    for (const iss of linkage.issues) {
      const checkKey = iss.code === 'DUPLICATE_CLAIM_ID' || iss.code === 'DUPLICATE_EVIDENCE_ID' ? 'duplicate_ids' : 'evidence_claim_linkage';
      addError(checkKey, 'verification/claims.json', iss.code, `${iss.path}: ${iss.message}`);
    }
  }

  // Verify claims linked to programs do not fail isEligibleForPublicCatalogIndex
  const claimsByProgram = new Map<string, ClaimRecord[]>();
  for (const cl of claimsList) {
    const arr = claimsByProgram.get(cl.programId) ?? [];
    arr.push(cl);
    claimsByProgram.set(cl.programId, arr);
  }
  for (const prog of programMap.values()) {
    const gate = isEligibleForPublicCatalogIndex(prog, {
      nowDate: evaluationDate,
      linkedClaims: claimsByProgram.get(prog.programId) ?? []
    });
    if (!gate.eligible) {
      addError('publication_eligibility', `programs/${prog.destinationCountryIso.toLowerCase()}.json`, 'CONFLICTING_OR_INELIGIBLE_PROGRAM', gate.reasons.join(' '), prog.programId);
    }
  }

  // Verify visa-details claimIds and evidenceIds resolve
  const claimIdSet = new Set(claimsList.map((c) => c.claimId));
  const evidenceIdSet = new Set(evidenceList.map((e) => e.evidenceId));
  for (const vd of visaDetailsList) {
    for (const cid of vd.claimIds) {
      if (!claimIdSet.has(cid)) {
        addError('evidence_claim_linkage', `visa-details/${vd.programId}.json`, 'DANGLING_DETAIL_CLAIM_REF', `Visa detail "${vd.detailId}" references missing claim "${cid}".`, vd.detailId);
      }
    }
    for (const eid of vd.evidenceIds) {
      if (!evidenceIdSet.has(eid)) {
        addError('evidence_claim_linkage', `visa-details/${vd.programId}.json`, 'DANGLING_DETAIL_EVIDENCE_REF', `Visa detail "${vd.detailId}" references missing evidence "${eid}".`, vd.detailId);
      }
    }
  }

  // Check #8: Quarantine Integrity (`data/verification/quarantine.json`)
  const quarantinePath = path.join(dataDir, 'verification/quarantine.json');
  if (fs.existsSync(quarantinePath)) {
    const parsed = readJson(quarantinePath);
    if (parsed.ok) {
      if (!Array.isArray(parsed.data)) {
        addError('quarantine_integrity', 'verification/quarantine.json', 'EXPECTED_ARRAY', 'quarantine.json must be a JSON array.');
      } else {
        for (const item of parsed.data) {
          const val = validateQuarantineRecord(item);
          if (!val.success) {
            for (const iss of val.issues) {
              addError('quarantine_integrity', 'verification/quarantine.json', iss.code, `${iss.path}: ${iss.message}`, String((item as Record<string, unknown>)?.quarantineId ?? ''));
            }
          } else {
            const upperQ = val.data.quarantineId.toUpperCase();
            if (seenQuarantineIdsUpper.has(upperQ)) {
              addError('duplicate_ids', 'verification/quarantine.json', 'DUPLICATE_QUARANTINE_ID', `Duplicate quarantineId "${val.data.quarantineId}".`, val.data.quarantineId);
            } else {
              seenQuarantineIdsUpper.set(upperQ, 'verification/quarantine.json');
              quarantineList.push(val.data);
            }
          }
        }
      }
    }
  } else {
    addError('quarantine_integrity', 'verification/quarantine.json', 'MISSING_REQUIRED_FILE', 'Missing data/verification/quarantine.json.');
  }

  // Check #16: Coverage Metric Consistency (`data/verification/batch-state.json`)
  const batchStatePath = path.join(dataDir, 'verification/batch-state.json');
  if (fs.existsSync(batchStatePath)) {
    const parsed = readJson(batchStatePath);
    if (parsed.ok && parsed.data && typeof parsed.data === 'object') {
      const bs = parsed.data as Record<string, unknown>;
      const mVal = validateCatalogCoverageMetrics(bs.coverageMetrics);
      if (!mVal.success) {
        for (const iss of mVal.issues) {
          addError('coverage_metrics', 'verification/batch-state.json', iss.code, `${iss.path}: ${iss.message}`);
        }
      } else {
        const actualVerifiedAvailable = Array.from(programMap.values()).filter(
          (p) => p.verificationStatus === 'AVAILABLE_VERIFIED'
        ).length;
        if (mVal.data.verifiedAvailableProgramsCount !== actualVerifiedAvailable) {
          addError(
            'coverage_metrics',
            'verification/batch-state.json',
            'VERIFIED_COUNT_MISMATCH',
            `coverageMetrics.verifiedAvailableProgramsCount (${mVal.data.verifiedAvailableProgramsCount}) does not match actual exported AVAILABLE_VERIFIED programs (${actualVerifiedAvailable}).`
          );
        }
        if (mVal.data.coverageSlotsCount === mVal.data.verifiedAvailableProgramsCount && mVal.data.coverageSlotsCount > 100) {
          addError(
            'coverage_metrics',
            'verification/batch-state.json',
            'SLOTS_CONFLATED_WITH_VERIFIED',
            'coverageSlotsCount must never be reported as verifiedAvailableProgramsCount.'
          );
        }
      }
    } else if (parsed.ok) {
      addError('coverage_metrics', 'verification/batch-state.json', 'INVALID_TYPE', 'batch-state.json must be a JSON object.');
    }
  } else {
    addError('coverage_metrics', 'verification/batch-state.json', 'MISSING_REQUIRED_FILE', 'Missing data/verification/batch-state.json.');
  }

  // --------------------------------------------------------------------------
  // 6. Validate Routes (`data/routes/matrix-compact.json` + `data/routes/overrides/<dest>.json`)
  // --------------------------------------------------------------------------
  const matrixPath = path.join(dataDir, 'routes/matrix-compact.json');
  if (fs.existsSync(matrixPath)) {
    const parsed = readJson(matrixPath);
    if (parsed.ok && parsed.data && typeof parsed.data === 'object') {
      const mx = parsed.data as Record<string, unknown>;
      if (mx.schemaVersion !== STATIC_CATALOG_SCHEMA_VERSION) {
        addError('route_integrity', 'routes/matrix-compact.json', 'INVALID_SCHEMA_VERSION', `matrix-compact.json schemaVersion must be "${STATIC_CATALOG_SCHEMA_VERSION}".`);
      }
      if (mx.storageStrategy !== 'COMPACT_RULE_MATRIX_PLUS_SPARSE_OVERRIDES') {
        addError('route_integrity', 'routes/matrix-compact.json', 'INVALID_ROUTE_STORAGE_STRATEGY', 'Route matrix must use COMPACT_RULE_MATRIX_PLUS_SPARSE_OVERRIDES.');
      }
      if (mx.totalIsoCountries !== 249 || mx.totalPossibleBilateralPairs !== 61752) {
        addError('route_integrity', 'routes/matrix-compact.json', 'INVALID_MATRIX_DIMENSIONS', 'Matrix must declare 249 countries and 61,752 pairs.');
      }
      const blocs = mx.treatyBlocs as Record<string, unknown> | undefined;
      if (blocs && typeof blocs === 'object') {
        for (const [blocName, codes] of Object.entries(blocs)) {
          if (!Array.isArray(codes)) {
            addError('route_integrity', 'routes/matrix-compact.json', 'INVALID_BLOC_ARRAY', `treatyBlocs.${blocName} must be an array.`);
            continue;
          }
          for (const c of codes) {
            if (!isValidCanonicalIso2(c)) {
              addError('route_integrity', 'routes/matrix-compact.json', 'INVALID_MATRIX_ISO2', `Invalid ISO code "${String(c)}" in treatyBlocs.${blocName}.`);
            }
          }
        }
      }
    }
  } else {
    addError('route_integrity', 'routes/matrix-compact.json', 'MISSING_REQUIRED_FILE', 'Missing data/routes/matrix-compact.json.');
  }

  const routeOverrideFiles = listFilesByExt(path.join(dataDir, 'routes/overrides'), '.json');
  if (routeOverrideFiles.length > 249) {
    addError('route_integrity', 'routes/overrides/', 'EXCESSIVE_ROUTE_FILES', `Found ${routeOverrideFiles.length} route override files; never materialize 61,752 duplicated route files.`);
  }
  for (const fp of routeOverrideFiles) {
    const r = relPath(dataDir, fp);
    const parsed = readJson(fp);
    if (!parsed.ok) continue;

    if (!Array.isArray(parsed.data)) {
      addError('route_integrity', r, 'EXPECTED_ARRAY', 'Route override file must be a JSON array.');
      continue;
    }

    const fileDestIso = path.basename(fp, '.json').toUpperCase();
    for (const rawRoute of parsed.data) {
      const val = validateBilateralRouteOverride(rawRoute);
      if (!val.success) {
        for (const iss of val.issues) {
          addError('route_integrity', r, iss.code, `${iss.path}: ${iss.message}`, String((rawRoute as Record<string, unknown>)?.routeId ?? ''));
        }
        continue;
      }

      if (!isValidRouteId(val.data.routeId)) {
        addError('route_integrity', r, 'INVALID_ROUTE_ID', `Invalid routeId "${val.data.routeId}".`, val.data.routeId);
      }
      if (val.data.destinationCountryIso !== fileDestIso) {
        addError('route_integrity', r, 'ROUTE_FILE_DEST_MISMATCH', `Route "${val.data.routeId}" destination "${val.data.destinationCountryIso}" does not match filename "${fileDestIso.toLowerCase()}.json".`, val.data.routeId);
      }
      for (const sid of val.data.verificationMetadata.officialSourceIds) {
        if (!sourceMap.has(sid)) {
          addError('official_https', r, 'DANGLING_ROUTE_SOURCE_ID', `Route "${val.data.routeId}" references missing official source "${sid}".`, val.data.routeId);
        }
      }
      const lowerRid = val.data.routeId.toLowerCase();
      if (seenRouteIdsLower.has(lowerRid)) {
        addError('duplicate_ids', r, 'DUPLICATE_ROUTE_ID', `Duplicate routeId "${val.data.routeId}".`, val.data.routeId);
      } else {
        seenRouteIdsLower.set(lowerRid, r);
        routeOverridesList.push(val.data);
      }
    }
  }

  // --------------------------------------------------------------------------
  // 7. Validate Changelog (`data/changelog/latest.json`)
  // --------------------------------------------------------------------------
  const changelogPath = path.join(dataDir, 'changelog/latest.json');
  if (fs.existsSync(changelogPath)) {
    const parsed = readJson(changelogPath);
    if (parsed.ok) {
      if (!Array.isArray(parsed.data)) {
        addError('changelog_consistency', 'changelog/latest.json', 'EXPECTED_ARRAY', 'changelog/latest.json must be a JSON array.');
      } else {
        let prevDate = '9999-99-99';
        for (const rawChg of parsed.data) {
          const val = validateChangelogRecord(rawChg);
          if (!val.success) {
            for (const iss of val.issues) {
              addError(iss.code === 'INVALID_OFFICIAL_URL' ? 'official_https' : 'changelog_consistency', 'changelog/latest.json', iss.code, `${iss.path}: ${iss.message}`, String((rawChg as Record<string, unknown>)?.changeId ?? ''));
            }
            continue;
          }
          if (val.data.changeDate > prevDate) {
            addError('changelog_consistency', 'changelog/latest.json', 'UNSORTED_CHANGELOG', `Changelog entries must be ordered newest first ("${val.data.changeId}" date ${val.data.changeDate} > ${prevDate}).`, val.data.changeId);
          }
          prevDate = val.data.changeDate;

          const upperCid = val.data.changeId.toUpperCase();
          if (seenChangelogIdsUpper.has(upperCid)) {
            addError('duplicate_ids', 'changelog/latest.json', 'DUPLICATE_CHANGELOG_ID', `Duplicate changeId "${val.data.changeId}".`, val.data.changeId);
          } else {
            seenChangelogIdsUpper.set(upperCid, 'changelog/latest.json');
            changelogList.push(val.data);
          }
        }
      }
    }
  } else {
    addError('changelog_consistency', 'changelog/latest.json', 'MISSING_REQUIRED_FILE', 'Missing data/changelog/latest.json.');
  }

  // --------------------------------------------------------------------------
  // 8. Validate Editorial Markdown (`published/` and `drafts/`)
  // --------------------------------------------------------------------------
  const validateEditorialDir = (subdir: string, expectedStatus: 'published' | 'draft', targetArr: EditorialArticleRecord[]) => {
    const files = listFilesByExt(path.join(dataDir, subdir), '.md');
    for (const fp of files) {
      filesScanned++;
      const r = relPath(dataDir, fp);
      const raw = fs.readFileSync(fp, 'utf8');
      const parsed = matter(raw);

      const piiFindings = detectProhibitedPublicSecretsOrPii({ ...parsed.data, content: parsed.content });
      for (const f of piiFindings) {
        addError('pii_secrets', r, 'PROHIBITED_PUBLIC_DATA', f);
      }

      const fileSlug = path.basename(fp, '.md');
      if (isForbiddenFixtureId(fileSlug)) {
        addError('phase32_fixtures', r, 'FORBIDDEN_PHASE32_FIXTURE', `Forbidden fixture slug "${fileSlug}".`, fileSlug);
      }

      const candidate = {
        ...parsed.data,
        markdownContent: parsed.content.trim()
      };
      const val = validateEditorialArticleRecord(candidate);
      if (!val.success) {
        for (const iss of val.issues) {
          addError('editorial_frontmatter', r, iss.code, `${iss.path}: ${iss.message}`, fileSlug);
        }
        continue;
      }

      if (val.data.slug !== fileSlug) {
        addError('editorial_frontmatter', r, 'EDITORIAL_FILENAME_SLUG_MISMATCH', `Filename "${fileSlug}.md" must match frontmatter slug "${val.data.slug}".`, val.data.slug);
      }
      if (val.data.editorialStatus !== expectedStatus) {
        addError(
          expectedStatus === 'published' ? 'publishable_purity' : 'editorial_frontmatter',
          r,
          'EDITORIAL_STATUS_DIRECTORY_MISMATCH',
          `File in ${subdir} must have editorialStatus="${expectedStatus}" (got "${val.data.editorialStatus}").`,
          val.data.slug
        );
      }

      const slugKey = val.data.slug.toLowerCase();
      if (seenEditorialSlugs.has(slugKey)) {
        addError('duplicate_ids', r, 'DUPLICATE_EDITORIAL_SLUG', `Duplicate editorial slug "${val.data.slug}" (already in ${seenEditorialSlugs.get(slugKey)}).`, val.data.slug);
      } else {
        seenEditorialSlugs.set(slugKey, r);
        targetArr.push(val.data);
      }
    }
  };

  validateEditorialDir('editorial/published', 'published', publishedEditorialList);
  validateEditorialDir('editorial/drafts', 'draft', draftEditorialList);

  // Informational warnings (never override trust failures)
  const activeCount = Array.from(countryMap.values()).filter((c) => c.recordStatus === 'ACTIVE').length;
  const quarantinedCountryCount = Array.from(countryMap.values()).filter((c) => c.recordStatus === 'QUARANTINED').length;
  const uninhabitedCount = Array.from(countryMap.values()).filter((c) => c.recordStatus === 'UNINHABITED_TERRITORY').length;

  if (quarantinedCountryCount > 0) {
    addWarning(
      'official_https',
      'countries/',
      'COUNTRIES_AWAITING_OFFICIAL_VERIFICATION',
      `${quarantinedCountryCount} countries remain in QUARANTINED status awaiting primary sovereign HTTPS official-source verification.`
    );
  }
  if (draftEditorialList.length > 0) {
    addWarning(
      'editorial_frontmatter',
      'editorial/drafts/',
      'DRAFTS_EXCLUDED_FROM_PUBLIC',
      `${draftEditorialList.length} draft editorial articles are stored in editorial/drafts/ and excluded from public indexes/sitemaps.`
    );
  }

  const checkResults = CHECK_NAMES.map((chk) => {
    const count = errors.filter((e) => e.check === chk.key).length;
    return {
      id: chk.id,
      name: chk.name,
      status: count === 0 ? ('PASS' as const) : ('FAIL' as const),
      errorCount: count
    };
  });

  const passedChecks = checkResults.filter((c) => c.status === 'PASS').length;
  const failedChecks = checkResults.filter((c) => c.status === 'FAIL').length;

  return {
    valid: errors.length === 0,
    dataDir,
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    summary: {
      filesScanned,
      countriesChecked: countryMap.size,
      activeCountries: activeCount,
      quarantinedCountries: quarantinedCountryCount,
      uninhabitedTerritories: uninhabitedCount,
      officialSourcesChecked: sourceMap.size,
      programsChecked: programMap.size,
      visaDetailsChecked: visaDetailsList.length,
      routeOverridesChecked: routeOverridesList.length,
      claimsChecked: claimsList.length,
      evidenceChecked: evidenceList.length,
      quarantineRecordsChecked: quarantineList.length,
      changelogEntriesChecked: changelogList.length,
      editorialPublishedChecked: publishedEditorialList.length,
      editorialDraftsChecked: draftEditorialList.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      passedChecks,
      failedChecks
    },
    checks: checkResults,
    errors,
    warnings
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const args = process.argv.slice(2);
  let dataDir: string | undefined;
  let jsonOutput = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--data-dir' && args[i + 1]) dataDir = args[++i];
    else if (args[i] === '--json') jsonOutput = true;
  }

  const report = validateStaticCatalog({ dataDir });
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const s = report.summary;
    console.log('===============================================================');
    console.log(report.valid ? '✅ STATIC CATALOG VALIDATION PASSED' : '❌ STATIC CATALOG VALIDATION FAILED');
    console.log(`- Data Directory:   ${report.dataDir}`);
    console.log(`- Files Scanned:    ${s.filesScanned}`);
    console.log(`- Checks Passed:    ${s.passedChecks}/${report.checks.length} (Failed: ${s.failedChecks})`);
    console.log(`- Errors / Warns:   ${s.errorCount} / ${s.warningCount}`);
    console.log(`- Countries:        ${s.countriesChecked} (${s.activeCountries} active, ${s.quarantinedCountries} quarantined, ${s.uninhabitedTerritories} uninhabited)`);
    console.log(`- Official Sources: ${s.officialSourcesChecked}`);
    console.log(`- Programs:         ${s.programsChecked} | Visa Details: ${s.visaDetailsChecked}`);
    console.log(`- Claims/Evidence:  ${s.claimsChecked} / ${s.evidenceChecked} | Quarantine: ${s.quarantineRecordsChecked}`);
    console.log(`- Route Overrides:  ${s.routeOverridesChecked} | Changelog: ${s.changelogEntriesChecked}`);
    console.log(`- Editorial (P/D):  ${s.editorialPublishedChecked} / ${s.editorialDraftsChecked}`);
    if (report.errors.length > 0) {
      console.log('\nErrors:');
      for (const err of report.errors) {
        console.log(`  [${err.check}] ${err.filePath}${err.recordId ? ` (${err.recordId})` : ''}: ${err.code} — ${err.message}`);
      }
    }
    if (report.warnings.length > 0) {
      console.log('\nWarnings:');
      for (const warn of report.warnings) {
        console.log(`  [${warn.check}] ${warn.filePath}: ${warn.code} — ${warn.message}`);
      }
    }
    console.log('===============================================================');
  }

  process.exit(report.valid ? 0 : 1);
}
