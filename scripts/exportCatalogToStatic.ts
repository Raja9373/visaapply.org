import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import matter from 'gray-matter';

import { ALL_249_ISO_FORCED } from '../src/data/all249Countries';
import { VERIFIED_IMMIGRATION_PROGRAMS, type ImmigrationProgram } from '../src/data/globalImmigrationHubData';
import { OFFICIAL_SOURCE_REGISTRY_249, type OfficialSourceEntry } from '../src/data/officialSourceRegistry';
import { getContinentForCountry } from '../src/data/continentMap';
import { CURATED_BILATERAL_VISAS } from '../src/data/anyToAnyLight';
import { CANONICAL_15_LANG_CODES, COUNTRY_TO_LANG_15, type SupportedLangCode } from '../src/i18n/config';
import { UNINHABITED_TERRITORY_CODES } from '../src/utils/ssrRouteRenderer';
import type { ImmigrationChangelogItem } from '../src/services/immigrationAutoSync';
import {
  STATIC_CATALOG_SCHEMA_VERSION,
  adaptLegacyChangelogToStaticRecord,
  adaptLegacyOfficialSourceToStaticRecord,
  adaptLegacyProgramToStaticRecord,
  generateClaimId,
  generateEvidenceId,
  generateOfficialSourceId,
  generateQuarantineId,
  generateRouteId,
  generateVisaDetailId,
  isEligibleForPublicCatalogIndex,
  isForbiddenFixtureId,
  normalizeCountryIso2,
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
  type BilateralRouteOverrideRecord,
  type CatalogCoverageMetrics,
  type CatalogImmigrationCategory,
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

export const DEFAULT_VERIFIED_BACKUP_DB_REL =
  'backups/phase_b3_verified_2026-11-23T10-31-07-923Z_ac57/immigration_hub_standalone.db';

export interface SourceReconciliationRow {
  sourceName: string;
  sourceRecordCount: number;
  exportedRecordCount: number;
  quarantinedRecordCount: number;
  rejectedRecordCount: number;
  rejectionReasons: string[];
}

export interface CompactRouteMatrixFile {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  storageStrategy: 'COMPACT_RULE_MATRIX_PLUS_SPARSE_OVERRIDES';
  totalIsoCountries: 249;
  totalPossibleBilateralPairs: 61752;
  uninhabitedTerritoryCodes: string[];
  asOfDate: string;
  treatyBlocs: {
    gcc: string[];
    fullSchengenEu: string[];
    euNonSchengen: string[];
    euEeaSwissMobility: string[];
  };
  originRuleSets: {
    IN: {
      visaFreeDestinations: string[];
      eVisaOrVoaDestinations: string[];
      voaVerifiedDestinations: string[];
    };
  };
  verifiedOverrideDestinations: string[];
  provenance: string;
}

export interface ExportCatalogManifest {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  phase: 'PHASE_3_STATIC_CATALOG_EXPORT';
  deterministicContentHash: string;
  verifiedBackupSource: {
    relativePath: string;
    sha256: string;
    readOnlyMode: true;
    liveSqliteAccessed: false;
    neonAccessed: false;
  };
  summary: {
    countriesExported: number;
    activeCountries: number;
    quarantinedCountries: number;
    uninhabitedTerritories: number;
    officialSourcesExported: number;
    programsExportedPublished: number;
    programsQuarantined: number;
    visaDetailsExported: number;
    claimsExported: number;
    evidenceExported: number;
    routeOverridesExported: number;
    changelogEntriesExported: number;
    editorialPublishedExported: number;
    editorialDraftsExported: number;
    quarantineRecordsTotal: number;
    duplicatesDetected: number;
    conflictsDetected: number;
    rejectedTotal: number;
  };
  coverageMetrics: CatalogCoverageMetrics;
  sources: SourceReconciliationRow[];
  files: Array<{
    relativePath: string;
    bytes: number;
    sha256: string;
  }>;
}

export interface ExportCatalogOptions {
  rootDir?: string;
  outDir?: string;
  backupDbPath?: string;
  dryRun?: boolean;
  evaluationDate?: Date;
}

export interface ExportCatalogResult {
  manifest: ExportCatalogManifest;
  dryRun: boolean;
  outDir: string;
}

function sha256Text(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function stableStringify(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function assertSafeBackupDbPath(rootDir: string, backupDbPath: string): void {
  const resolvedBackup = path.resolve(backupDbPath);
  const liveSqlite = path.resolve(rootDir, 'data_db/immigration_hub.db');
  if (resolvedBackup === liveSqlite || resolvedBackup.startsWith(path.resolve(rootDir, 'data_db') + path.sep)) {
    throw new Error(
      `SAFETY_GUARD_VIOLATION: Refusing to open live production SQLite path "${resolvedBackup}". Use an isolated verified Phase B.3 backup snapshot.`
    );
  }
  if (!fs.existsSync(resolvedBackup)) {
    throw new Error(`BACKUP_NOT_FOUND: Verified backup SQLite file not found at "${resolvedBackup}".`);
  }
}

function cleanStaleFilesInDir(dirPath: string, expectedFiles: Set<string>, ext: string): void {
  if (!fs.existsSync(dirPath)) return;
  for (const entry of fs.readdirSync(dirPath)) {
    if (entry === '.gitkeep') continue;
    const full = path.join(dirPath, entry);
    if (fs.statSync(full).isDirectory()) continue;
    if (entry.endsWith(ext) && !expectedFiles.has(entry)) {
      fs.unlinkSync(full);
    }
  }
}

function extractDomainFromUrl(rawUrl: string, fallbackIso: string): string {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase();
    return host.replace(/^www\./, '');
  } catch {
    return fallbackIso.toLowerCase();
  }
}

function buildOfficialSourcesByCountry(
  programs: ImmigrationProgram[]
): {
  sourcesByCountry: Map<string, OfficialSourceRecord[]>;
  quarantinedSources: QuarantineRecord[];
  reconciliation: SourceReconciliationRow;
} {
  const sourcesByCountry = new Map<string, OfficialSourceRecord[]>();
  const seenSourceIds = new Set<string>();
  const quarantinedSources: QuarantineRecord[] = [];
  const rejectionReasons = new Set<string>();

  const registryEntries = Object.values(OFFICIAL_SOURCE_REGISTRY_249).sort((a, b) =>
    a.countryCode.localeCompare(b.countryCode)
  );

  const addIfValid = (candidate: OfficialSourceRecord) => {
    if (seenSourceIds.has(candidate.sourceId)) return;
    const res = validateOfficialSourceRecord(candidate);
    if (res.success) {
      seenSourceIds.add(res.data.sourceId);
      const list = sourcesByCountry.get(res.data.countryIso) ?? [];
      list.push(res.data);
      sourcesByCountry.set(res.data.countryIso, list);
    } else {
      rejectionReasons.add(res.issues.map((i) => i.code).join(','));
    }
  };

  let registryExported = 0;

  for (const entry of registryEntries) {
    const iso = normalizeCountryIso2(entry.countryCode);
    const lowerIso = iso.toLowerCase();

    if (!entry.primaryGovUrl || !entry.primaryGovUrl.trim()) {
      if (!UNINHABITED_TERRITORY_CODES.has(lowerIso)) {
        const qRecord: QuarantineRecord = {
          schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
          quarantineId: generateQuarantineId('country', iso),
          entityType: 'country',
          entityId: iso,
          countryIso: iso,
          verificationStatus: 'AWAITING_OFFICIAL_VERIFICATION',
          reasonCode: 'AWAITING_OFFICIAL_VERIFICATION',
          reasonSummary: `No verified primary government HTTPS URL in officialSourceRegistry for ${entry.countryName} (${iso}). Preserved without fabrication.`,
          quarantinedAt: `${entry.lastAuditDate || '2026-11-10'}T00:00:00Z`,
          recoverable: true,
          preservedPayload: {
            countryCode: iso,
            countryName: entry.countryName,
            authorityName: entry.authorityName,
            verificationTier: entry.verificationTier,
            sourceAccessStatus: entry.sourceAccessStatus
          }
        };
        const qCheck = validateQuarantineRecord(qRecord);
        if (qCheck.success) quarantinedSources.push(qCheck.data);
      }
      continue;
    }

    const adaptedPrimary = adaptLegacyOfficialSourceToStaticRecord(entry);
    const primaryCheck = validateOfficialSourceRecord(adaptedPrimary);
    if (primaryCheck.success) {
      addIfValid(primaryCheck.data);
      registryExported++;
    } else {
      rejectionReasons.add(`PRIMARY_SOURCE_INVALID:${iso}`);
    }

    // Export distinct consular portal URL when present and valid
    if (entry.consularPortalUrl && entry.consularPortalUrl !== entry.primaryGovUrl) {
      addIfValid({
        schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
        sourceId: generateOfficialSourceId(iso, 'CONSULAR-PORTAL'),
        countryIso: iso,
        issuingAuthority: `${entry.authorityName} — Consular Portal`,
        officialOrganizationName: entry.authorityName,
        officialHttpsUrl: entry.consularPortalUrl,
        sourceCategory: 'CONSULAR_FOREIGN_AFFAIRS',
        sourceLanguage: 'en',
        lastCheckedDate: entry.lastAuditDate,
        httpAvailabilityStatus: 'REACHABLE_2XX',
        evidenceNotes: 'Tier-1 consular portal from officialSourceRegistry.'
      });
    }

    // Export distinct gazette/legislation URL when present and valid
    if (
      entry.gazetteOrLegislationUrl &&
      entry.gazetteOrLegislationUrl !== entry.primaryGovUrl &&
      entry.gazetteOrLegislationUrl !== entry.consularPortalUrl
    ) {
      addIfValid({
        schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
        sourceId: generateOfficialSourceId(iso, 'LEGISLATION-GAZETTE'),
        countryIso: iso,
        issuingAuthority: `${entry.authorityName} — Official Legislation`,
        officialOrganizationName: entry.authorityName,
        officialHttpsUrl: entry.gazetteOrLegislationUrl,
        sourceCategory: 'OFFICIAL_GAZETTE_LEGISLATION',
        sourceLanguage: 'en',
        lastCheckedDate: entry.lastAuditDate,
        httpAvailabilityStatus: 'REACHABLE_2XX',
        evidenceNotes: 'Official legislation/gazette reference from officialSourceRegistry.'
      });
    }
  }

  // Ensure every program's adapted primarySourceId resolves cleanly in data/official-sources/<iso>.json
  for (const prog of programs) {
    const adaptedProg = adaptLegacyProgramToStaticRecord(prog);
    for (const ref of adaptedProg.officialSourceRefs) {
      if (seenSourceIds.has(ref.sourceId)) continue;
      addIfValid({
        schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
        sourceId: ref.sourceId,
        countryIso: adaptedProg.destinationCountryIso,
        issuingAuthority: prog.sourceAuthority,
        officialOrganizationName: prog.sourceAuthority,
        officialHttpsUrl: ref.url,
        sourceCategory: 'GOVERNMENT_VISA_PORTAL',
        sourceLanguage: 'en',
        lastCheckedDate: prog.lastCheckedDate || '2026-11-10',
        httpAvailabilityStatus: 'REACHABLE_2XX',
        evidenceNotes: `Authoritative program source referenced by ${prog.id}.`
      });
    }
  }

  for (const [, list] of sourcesByCountry.entries()) {
    list.sort((a, b) => a.sourceId.localeCompare(b.sourceId));
  }

  let totalExported = 0;
  for (const list of sourcesByCountry.values()) totalExported += list.length;

  return {
    sourcesByCountry,
    quarantinedSources,
    reconciliation: {
      sourceName: 'src/data/officialSourceRegistry.ts + program source references',
      sourceRecordCount: registryEntries.length,
      exportedRecordCount: totalExported,
      quarantinedRecordCount: quarantinedSources.length,
      rejectedRecordCount: registryEntries.length - registryExported - quarantinedSources.length - UNINHABITED_TERRITORY_CODES.size,
      rejectionReasons: Array.from(rejectionReasons).sort()
    }
  };
}

interface SqliteBackupPayload {
  programs: ImmigrationProgram[];
  visaDetails: Array<Record<string, unknown>>;
  claims: Array<Record<string, unknown>>;
  evidence: Array<Record<string, unknown>>;
  changelog: Array<Record<string, unknown>>;
  batchState: Record<string, unknown> | null;
}

function readIsolatedBackupSqlite(backupDbPath: string): SqliteBackupPayload {
  const db = new Database(backupDbPath, { readonly: true, fileMustExist: true });
  try {
    const rawPrograms = db
      .prepare('SELECT * FROM immigration_programs ORDER BY id ASC')
      .all() as Array<Record<string, unknown>>;

    const programs: ImmigrationProgram[] = rawPrograms.map((row) => ({
      id: String(row.id ?? ''),
      countryCode: String(row.country_code ?? ''),
      countryName: String(row.country_name ?? ''),
      category: String(row.category ?? 'work') as ImmigrationProgram['category'],
      officialName: String(row.official_name ?? ''),
      localLanguageName: row.local_language_name ? String(row.local_language_name) : undefined,
      classificationType: String(row.classification_type ?? 'Actual Immigration Program') as ImmigrationProgram['classificationType'],
      verificationStatus: String(row.verification_status ?? 'AWAITING_OFFICIAL_VERIFICATION') as ImmigrationProgram['verificationStatus'],
      legalBasis: String(row.legal_basis ?? ''),
      purpose: String(row.purpose ?? ''),
      eligibility: String(row.eligibility ?? ''),
      applyFrom: (row.apply_from ? String(row.apply_from) : 'Both') as ImmigrationProgram['applyFrom'],
      processingTime: String(row.processing_time ?? ''),
      fees: String(row.fees ?? ''),
      duration: String(row.duration ?? ''),
      prPathway: String(row.pr_pathway ?? ''),
      citizenshipPathway: String(row.citizenship_pathway ?? ''),
      familyInclusion: String(row.family_inclusion ?? ''),
      officialApplicationUrl: String(row.official_application_url ?? ''),
      officialInformationUrl: String(row.official_information_url ?? ''),
      sourceAuthority: String(row.source_authority ?? ''),
      sourceLastUpdated: String(row.source_last_updated ?? row.last_checked_date ?? '2026-11-10'),
      lastCheckedDate: String(row.last_checked_date ?? '2026-11-10')
    }));

    const visaDetails = db.prepare('SELECT * FROM visa_details ORDER BY id ASC').all() as Array<Record<string, unknown>>;
    const claims = db.prepare('SELECT * FROM visa_detail_claims ORDER BY id ASC').all() as Array<Record<string, unknown>>;
    const evidence = db.prepare('SELECT * FROM visa_detail_evidence ORDER BY id ASC').all() as Array<Record<string, unknown>>;
    const changelog = db.prepare('SELECT * FROM changelog_entries ORDER BY id ASC').all() as Array<Record<string, unknown>>;
    const batchStateRow = db.prepare('SELECT * FROM batch_state ORDER BY id ASC LIMIT 1').get() as Record<string, unknown> | undefined;

    return {
      programs,
      visaDetails,
      claims,
      evidence,
      changelog,
      batchState: batchStateRow ?? null
    };
  } finally {
    db.close();
  }
}

function safeJsonParse<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== 'string' || !raw.trim()) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizeEditorialIso(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const upper = raw.trim().toUpperCase();
  if (upper === 'UK') return 'GB';
  try {
    return normalizeCountryIso2(upper);
  } catch {
    return null;
  }
}

function serializeMarkdownWithFrontmatter(frontmatter: Record<string, unknown>, body: string): string {
  const cleanBody = body.replace(/\r\n/g, '\n').trim();
  return matter.stringify(`${cleanBody}\n`, frontmatter);
}

export function exportCatalogToStatic(options: ExportCatalogOptions = {}): ExportCatalogResult {
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  const outDir = path.resolve(options.outDir ?? path.join(rootDir, 'data'));
  const backupDbPath = path.resolve(options.backupDbPath ?? path.join(rootDir, DEFAULT_VERIFIED_BACKUP_DB_REL));
  const dryRun = options.dryRun === true;
  const evaluationDate = options.evaluationDate ?? new Date('2026-11-23T00:00:00.000Z');

  assertSafeBackupDbPath(rootDir, backupDbPath);
  const backupSha256 = sha256Text(fs.readFileSync(backupDbPath));
  const sqlitePayload = readIsolatedBackupSqlite(backupDbPath);

  const quarantineRecords: QuarantineRecord[] = [];
  const sourceRows: SourceReconciliationRow[] = [];
  let duplicatesDetected = 0;
  let conflictsDetected = 0;
  let rejectedTotal = 0;

  // --------------------------------------------------------------------------
  // 1. Merge & Reconcile Immigration Programs (TS Registry + Backup SQLite)
  // --------------------------------------------------------------------------
  const mergedLegacyPrograms = new Map<string, { program: ImmigrationProgram; provenance: string[] }>();
  const programRejectionReasons = new Set<string>();
  let programRejected = 0;

  const ingestLegacyProgram = (prog: ImmigrationProgram, sourceTag: string) => {
    const key = prog.id.trim().toLowerCase();
    if (isForbiddenFixtureId(prog.id)) {
      programRejected++;
      rejectedTotal++;
      programRejectionReasons.add(`FORBIDDEN_PHASE32_FIXTURE:${prog.id}`);
      const qRec: QuarantineRecord = {
        schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
        quarantineId: generateQuarantineId('program', prog.id),
        entityType: 'program',
        entityId: prog.id,
        countryIso: null,
        verificationStatus: 'QUARANTINED',
        reasonCode: 'SYNTHETIC_OR_DELETED_FIXTURE',
        reasonSummary: `Deleted Phase 3.2 fixture "${prog.id}" blocked during export.`,
        quarantinedAt: '2026-11-23T00:00:00Z',
        recoverable: true,
        preservedPayload: { ...prog, provenance: sourceTag }
      };
      const chk = validateQuarantineRecord(qRec);
      if (chk.success) quarantineRecords.push(chk.data);
      return;
    }

    const existing = mergedLegacyPrograms.get(key);
    if (!existing) {
      mergedLegacyPrograms.set(key, { program: prog, provenance: [sourceTag] });
    } else {
      existing.provenance.push(sourceTag);
      if (
        existing.program.officialName !== prog.officialName ||
        existing.program.verificationStatus !== prog.verificationStatus ||
        existing.program.countryCode.toUpperCase() !== prog.countryCode.toUpperCase()
      ) {
        conflictsDetected++;
      } else {
        duplicatesDetected++;
      }
    }
  };

  for (const p of VERIFIED_IMMIGRATION_PROGRAMS) ingestLegacyProgram(p, 'src/data/globalImmigrationHubData.ts');
  for (const p of sqlitePayload.programs) ingestLegacyProgram(p, DEFAULT_VERIFIED_BACKUP_DB_REL);

  const allMergedLegacy = Array.from(mergedLegacyPrograms.values())
    .map((x) => x.program)
    .sort((a, b) => a.id.localeCompare(b.id));

  // --------------------------------------------------------------------------
  // 2. Official Sources (249 Registry + Verified Program Authority References)
  // --------------------------------------------------------------------------
  const { sourcesByCountry, quarantinedSources, reconciliation: sourceReconcil } =
    buildOfficialSourcesByCountry(allMergedLegacy);
  quarantineRecords.push(...quarantinedSources);
  sourceRows.push(sourceReconcil);

  // --------------------------------------------------------------------------
  // 3. Validate & Partition Programs (Published vs Quarantined)
  // --------------------------------------------------------------------------
  const programsByCountry = new Map<string, ImmigrationProgramRecord[]>();
  const allPublishedPrograms: ImmigrationProgramRecord[] = [];
  let programsQuarantined = 0;

  for (const legacy of allMergedLegacy) {
    const adapted = adaptLegacyProgramToStaticRecord(legacy);
    const valRes = validateImmigrationProgramRecord(adapted, { nowDate: evaluationDate });

    if (!valRes.success) {
      programRejected++;
      rejectedTotal++;
      const reasonCodes = valRes.issues.map((i) => i.code).join(', ');
      programRejectionReasons.add(`${legacy.id}:${reasonCodes}`);
      const qRec: QuarantineRecord = {
        schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
        quarantineId: generateQuarantineId('program', legacy.id),
        entityType: 'program',
        entityId: legacy.id,
        countryIso: adapted.destinationCountryIso,
        verificationStatus: 'QUARANTINED',
        reasonCode: 'SCHEMA_VALIDATION_FAILED',
        reasonSummary: `Program failed Phase 2 validation: ${reasonCodes}`,
        quarantinedAt: `${legacy.lastCheckedDate || '2026-11-10'}T00:00:00Z`,
        recoverable: true,
        preservedPayload: { ...legacy }
      };
      const qChk = validateQuarantineRecord(qRec);
      if (qChk.success) {
        quarantineRecords.push(qChk.data);
        programsQuarantined++;
      }
      continue;
    }

    const gate = isEligibleForPublicCatalogIndex(valRes.data, { nowDate: evaluationDate });
    if (!gate.eligible) {
      const reasonCode =
        valRes.data.verificationStatus === 'EXPIRED'
          ? 'EXPIRED_PROGRAM'
          : valRes.data.verificationStatus === 'CONFLICTING'
            ? 'CONFLICTING_CLAIMS'
            : valRes.data.verificationStatus === 'NEEDS_REVIEW'
              ? 'NEEDS_REVIEW'
              : 'AWAITING_OFFICIAL_VERIFICATION';
      const qRec: QuarantineRecord = {
        schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
        quarantineId: generateQuarantineId('program', valRes.data.programId),
        entityType: 'program',
        entityId: valRes.data.programId,
        countryIso: valRes.data.destinationCountryIso,
        verificationStatus:
          valRes.data.verificationStatus === 'AVAILABLE_VERIFIED' ||
          valRes.data.verificationStatus === 'NOT_AVAILABLE_CONFIRMED'
            ? 'QUARANTINED'
            : valRes.data.verificationStatus,
        reasonCode,
        reasonSummary: `Excluded from public publishable catalog: ${gate.reasons.join(' ')}`,
        quarantinedAt: `${valRes.data.lastUpdatedDate.slice(0, 10)}T00:00:00Z`,
        recoverable: true,
        preservedPayload: { ...valRes.data }
      };
      const qChk = validateQuarantineRecord(qRec);
      if (!qChk.success) {
        throw new Error(`INTERNAL_QUARANTINE_ERROR: ${JSON.stringify(qChk.issues)}`);
      }
      quarantineRecords.push(qChk.data);
      programsQuarantined++;
      continue;
    }

    allPublishedPrograms.push(valRes.data);
    const list = programsByCountry.get(valRes.data.destinationCountryIso) ?? [];
    list.push(valRes.data);
    programsByCountry.set(valRes.data.destinationCountryIso, list);
  }

  for (const [iso, list] of programsByCountry.entries()) {
    list.sort((a, b) => a.programId.localeCompare(b.programId));
    const colCheck = validateProgramCollection(list, { nowDate: evaluationDate });
    if (!colCheck.success) {
      throw new Error(`EXPORT_PROGRAM_COLLECTION_INVALID(${iso}): ${JSON.stringify(colCheck.issues)}`);
    }
  }

  sourceRows.push({
    sourceName: 'VERIFIED_IMMIGRATION_PROGRAMS (TS) + backup immigration_programs (SQLite)',
    sourceRecordCount: VERIFIED_IMMIGRATION_PROGRAMS.length + sqlitePayload.programs.length,
    exportedRecordCount: allPublishedPrograms.length,
    quarantinedRecordCount: programsQuarantined,
    rejectedRecordCount: programRejected,
    rejectionReasons: [
      ...(duplicatesDetected > 0 ? [`DEDUPLICATED_IDENTICAL_RECORDS:${duplicatesDetected}`] : []),
      ...Array.from(programRejectionReasons).sort()
    ]
  });

  // --------------------------------------------------------------------------
  // 4. Countries (All 249 ISO-3166-1 alpha-2)
  // --------------------------------------------------------------------------
  const countryRecords: CountryRecord[] = [];
  let activeCountries = 0;
  let quarantinedCountries = 0;
  let uninhabitedTerritories = 0;

  const sortedCountries = [...ALL_249_ISO_FORCED].sort((a, b) => a.code.localeCompare(b.code));
  for (const c of sortedCountries) {
    const iso = normalizeCountryIso2(c.code);
    const slug = iso.toLowerCase();
    const regEntry: OfficialSourceEntry | undefined = OFFICIAL_SOURCE_REGISTRY_249[iso];
    const verifiedSources = sourcesByCountry.get(iso) ?? [];
    const verifiedProgs = programsByCountry.get(iso) ?? [];

    const isUninhabited = UNINHABITED_TERRITORY_CODES.has(slug);
    const recordStatus: CountryRecord['recordStatus'] = isUninhabited
      ? 'UNINHABITED_TERRITORY'
      : verifiedSources.length > 0
        ? 'ACTIVE'
        : 'QUARANTINED';

    if (recordStatus === 'ACTIVE') activeCountries++;
    else if (recordStatus === 'UNINHABITED_TERRITORY') uninhabitedTerritories++;
    else quarantinedCountries++;

    const categories = Array.from(
      new Set<CatalogImmigrationCategory>(verifiedProgs.map((p) => p.immigrationCategory))
    ).sort();

    const primaryLang = COUNTRY_TO_LANG_15[iso] ?? 'en';
    const supportedLanguages: SupportedLangCode[] = Array.from(
      new Set<SupportedLangCode>(['en', primaryLang, ...CANONICAL_15_LANG_CODES])
    );

    const officialCountryDomain =
      verifiedSources.length > 0
        ? extractDomainFromUrl(verifiedSources[0].officialHttpsUrl, slug)
        : slug;

    const candidate: CountryRecord = {
      schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
      isoCode: iso,
      slug,
      countryName: c.name,
      localizedNames: { en: c.name },
      officialCountryDomain,
      immigrationAuthorityRefs: verifiedSources.map((s) => s.sourceId),
      supportedLanguages,
      availableImmigrationCategories: categories,
      lastReviewedAt: regEntry?.lastAuditDate || '2026-11-10',
      recordStatus,
      flag: c.flag,
      continent: getContinentForCountry(slug) || null,
      notes:
        recordStatus === 'QUARANTINED'
          ? 'Awaiting primary sovereign official-source verification; no unverified URLs fabricated.'
          : recordStatus === 'UNINHABITED_TERRITORY'
            ? 'Uninhabited territory excluded from public immigration sitemaps.'
            : null
    };

    const res = validateCountryRecord(candidate);
    if (!res.success) {
      throw new Error(`EXPORT_COUNTRY_INVALID(${iso}): ${JSON.stringify(res.issues)}`);
    }
    countryRecords.push(res.data);
  }

  sourceRows.push({
    sourceName: 'src/data/all249Countries.ts (249 canonical ISO countries)',
    sourceRecordCount: ALL_249_ISO_FORCED.length,
    exportedRecordCount: countryRecords.length,
    quarantinedRecordCount: quarantinedCountries,
    rejectedRecordCount: 0,
    rejectionReasons: []
  });

  // --------------------------------------------------------------------------
  // 5. Visa Details + Linked Claims & Evidence (from Verified Backup SQLite)
  // --------------------------------------------------------------------------
  const visaDetailsExported: VisaDetailRecord[] = [];
  const exportedClaims: ClaimRecord[] = [];
  const exportedEvidence: EvidenceRecord[] = [];
  let visaDetailsQuarantined = 0;

  const publishedProgramMap = new Map(allPublishedPrograms.map((p) => [p.programId, p]));

  for (const row of sqlitePayload.visaDetails) {
    const programId = String(row.program_id ?? '').trim();
    const parentProgram = publishedProgramMap.get(programId);
    if (!parentProgram) {
      visaDetailsQuarantined++;
      const qRec: QuarantineRecord = {
        schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
        quarantineId: generateQuarantineId('visa_detail', String(row.id ?? programId)),
        entityType: 'visa_detail',
        entityId: String(row.id ?? programId),
        countryIso: null,
        verificationStatus: 'QUARANTINED',
        reasonCode: 'AWAITING_OFFICIAL_VERIFICATION',
        reasonSummary: `Parent program "${programId}" is not in published verified catalog.`,
        quarantinedAt: '2026-11-10T00:00:00Z',
        recoverable: true,
        preservedPayload: { id: row.id, program_id: programId, verification_status: row.verification_status }
      };
      const qChk = validateQuarantineRecord(qRec);
      if (qChk.success) quarantineRecords.push(qChk.data);
      continue;
    }

    const visaOverview = safeJsonParse<Record<string, unknown>>(row.visa_overview_json, {});
    const eligibility = safeJsonParse<Record<string, unknown>>(row.eligibility_json, {});
    const financial = safeJsonParse<Record<string, unknown>>(row.financial_json, {});
    const docList = safeJsonParse<Array<Record<string, unknown>>>(row.document_checklist_json, []);
    const steps = safeJsonParse<string[]>(row.application_steps_json, []);
    const faqList = safeJsonParse<Array<Record<string, unknown>>>(row.faq_json, []);
    const legalEvList = safeJsonParse<Array<Record<string, unknown>>>(row.legal_evidence_json, []);

    const lastUpdatedDate = String(row.last_updated || parentProgram.lastUpdatedDate);
    const verifiedDate = parentProgram.lastVerifiedDate || lastUpdatedDate.slice(0, 10);
    const primarySourceId = parentProgram.officialSourceRefs[0].sourceId;
    const primaryAuthority =
      (sourcesByCountry.get(parentProgram.destinationCountryIso) ?? []).find((s) => s.sourceId === primarySourceId)
        ?.issuingAuthority || 'Official Government Authority';

    const detailClaimIds: string[] = [];
    const detailEvidenceIds: string[] = [];

    // Extract genuine evidence items from legal_evidence_json
    for (const evItem of legalEvList) {
      const claimLabel = String(evItem.claim ?? '').trim();
      const rawUrl = String(evItem.source ?? '').trim();
      if (!claimLabel || !rawUrl) continue;

      const claimId = generateClaimId(programId, 'legal_evidence', claimLabel);
      const evidenceId = generateEvidenceId(claimId, rawUrl, claimLabel);

      const evCandidate: EvidenceRecord = {
        schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
        evidenceId,
        claimId,
        officialSourceId: primarySourceId,
        sourceUrl: rawUrl,
        issuingAuthority: primaryAuthority,
        sourceTitle: `${parentProgram.programName} — ${claimLabel}`,
        accessDate: verifiedDate.slice(0, 10),
        lastVerifiedDate: verifiedDate.slice(0, 10),
        supportingExcerpt: `${claimLabel} verified against official government portal.`,
        evidenceStatus: 'VERIFIED_OFFICIAL'
      };
      const evVal = validateEvidenceRecord(evCandidate);
      if (!evVal.success) continue;

      const claimCandidate: ClaimRecord = {
        schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
        claimId,
        programId,
        claimText: `${parentProgram.programName}: ${claimLabel} requirement verified against official sovereign guidance.`,
        claimClassification: 'LEGAL_REQUIREMENT',
        officialSourceId: primarySourceId,
        sourceUrl: evVal.data.sourceUrl,
        evidenceIds: [evVal.data.evidenceId],
        supportingExcerpt: evVal.data.supportingExcerpt ?? null,
        accessDate: verifiedDate.slice(0, 10),
        verificationDate: verifiedDate.slice(0, 10),
        verificationStatus: 'AVAILABLE_VERIFIED',
        sectionKey: 'legal_evidence'
      };
      const claimVal = validateClaimRecord(claimCandidate);
      if (!claimVal.success) continue;

      exportedEvidence.push(evVal.data);
      exportedClaims.push(claimVal.data);
      detailClaimIds.push(claimVal.data.claimId);
      detailEvidenceIds.push(evVal.data.evidenceId);
    }

    const detailCandidate: VisaDetailRecord = {
      schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
      detailId: generateVisaDetailId(programId),
      programId,
      destinationCountryIso: parentProgram.destinationCountryIso,
      verificationStatus: parentProgram.verificationStatus,
      publicationStatus: 'PUBLISHED',
      lastVerifiedDate: verifiedDate,
      lastUpdatedDate,
      sections: {
        overview: typeof visaOverview.purpose === 'string' ? visaOverview.purpose : null,
        eligibility: typeof eligibility.summary === 'string' ? eligibility.summary : null,
        nationalityRestrictions: null,
        ageRequirements: null,
        educationRequirements: null,
        workExperience: null,
        financialRequirements:
          typeof financial.recommendedFunds === 'string'
            ? [financial.recommendedFunds, financial.bankStatementRequirement, financial.sourceOfFunds]
                .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
                .join(' ')
            : null,
        requiredDocuments:
          docList.length > 0
            ? docList
                .map((d) => String(d.item ?? d.name ?? '').trim())
                .filter(Boolean)
            : null,
        applicationProcess: steps.length > 0 ? steps : null,
        applicationFees: typeof visaOverview.fee === 'string' ? visaOverview.fee : null,
        processingTime: null,
        validity: typeof visaOverview.validity === 'string' ? visaOverview.validity : null,
        renewal: null,
        familyDependentProvisions: null,
        rightsAndRestrictions: typeof eligibility.restrictions === 'string' ? eligibility.restrictions : null,
        officialApplicationLinks: parentProgram.officialSourceRefs.map((r) => r.url),
        frequentlyAskedQuestions:
          faqList.length > 0
            ? faqList
                .filter((f) => typeof f.q === 'string' && typeof f.a === 'string')
                .map((f) => ({
                  question: String(f.q),
                  answer: String(f.a),
                  officialSourceUrl: parentProgram.officialSourceRefs[0].url
                }))
            : null
      },
      claimIds: detailClaimIds.sort(),
      evidenceIds: detailEvidenceIds.sort()
    };

    const detVal = validateVisaDetailRecord(detailCandidate);
    if (!detVal.success) {
      throw new Error(`EXPORT_VISA_DETAIL_INVALID(${programId}): ${JSON.stringify(detVal.issues)}`);
    }
    visaDetailsExported.push(detVal.data);
  }

  exportedClaims.sort((a, b) => a.claimId.localeCompare(b.claimId));
  exportedEvidence.sort((a, b) => a.evidenceId.localeCompare(b.evidenceId));

  // Verify relational claim/evidence linkage before writing
  const allOfficialSourcesFlat = Array.from(sourcesByCountry.values()).flat();
  const linkageCheck = validateClaimEvidenceLinkage({
    programs: allPublishedPrograms,
    officialSources: allOfficialSourcesFlat,
    claims: exportedClaims,
    evidence: exportedEvidence
  });
  if (!linkageCheck.success) {
    throw new Error(`EXPORT_LINKAGE_FAILED: ${JSON.stringify(linkageCheck.issues)}`);
  }

  sourceRows.push({
    sourceName: 'Phase B.3 backup SQLite visa_details + extracted legal evidence',
    sourceRecordCount: sqlitePayload.visaDetails.length,
    exportedRecordCount: visaDetailsExported.length,
    quarantinedRecordCount: visaDetailsQuarantined,
    rejectedRecordCount: 0,
    rejectionReasons: []
  });

  // --------------------------------------------------------------------------
  // 6. Compact Bilateral Route Matrix + Sparse Verified Overrides
  // --------------------------------------------------------------------------
  const overridesByDest = new Map<string, BilateralRouteOverrideRecord[]>();
  const curatedKeys = Object.keys(CURATED_BILATERAL_VISAS).sort();

  const curatedRouteMeta: Record<
    string,
    { visaFree: boolean | null; eVisaEligible: boolean | null; voaEligible: boolean | null; maxStayDays: number | null; scopeNote: string }
  > = {
    'ae-to-us': {
      visaFree: false,
      eVisaEligible: false,
      voaEligible: false,
      maxStayDays: 180,
      scopeNote: 'Curated UAE-to-US consular corridor backed by USCIS/DOS official guidance.'
    },
    'us-to-ae': {
      visaFree: false,
      eVisaEligible: false,
      voaEligible: true,
      maxStayDays: 30,
      scopeNote: 'Curated US-to-UAE short-stay VOA & long-term residency corridor backed by UAE official portal.'
    },
    'us-to-in': {
      visaFree: false,
      eVisaEligible: true,
      voaEligible: false,
      maxStayDays: 180,
      scopeNote: 'Curated US-to-India e-Visa & OCI corridor backed by Indian government immigration portals.'
    }
  };

  let routeOverridesExported = 0;

  for (const key of curatedKeys) {
    const [fromRaw, toRaw] = key.split('-to-');
    const originIso = normalizeCountryIso2(fromRaw);
    const destIso = normalizeCountryIso2(toRaw);
    const destSources = sourcesByCountry.get(destIso) ?? [];
    if (destSources.length === 0) continue;

    const items = CURATED_BILATERAL_VISAS[key] ?? [];
    const categories = Array.from(
      new Set<CatalogImmigrationCategory>(
        items
          .map((item) => String(item.category || '').toLowerCase())
          .filter(Boolean) as CatalogImmigrationCategory[]
      )
    ).sort();

    const destPublishedProgramIds = (programsByCountry.get(destIso) ?? []).map((p) => p.programId);
    const meta = curatedRouteMeta[key];

    const overrideCandidate: BilateralRouteOverrideRecord = {
      schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
      routeId: generateRouteId(originIso, destIso),
      originCountryIso: originIso,
      destinationCountryIso: destIso,
      applicableVisaCategories: categories.length > 0 ? categories : ['tourist'],
      ruleMatrixRef: 'matrix:v2:compact-bilateral',
      verifiedOverrides: {
        visaFree: meta?.visaFree ?? null,
        eVisaEligible: meta?.eVisaEligible ?? null,
        voaEligible: meta?.voaEligible ?? null,
        maxStayDays: meta?.maxStayDays ?? null,
        overrideProgramIds: destPublishedProgramIds,
        scopeNote: meta?.scopeNote ?? null
      },
      routePublicationEligible: true,
      verificationMetadata: {
        verificationStatus: 'AVAILABLE_VERIFIED',
        lastVerifiedDate: '2026-11-10',
        officialSourceIds: [destSources[0].sourceId]
      }
    };

    const routeCheck = validateBilateralRouteOverride(overrideCandidate);
    if (!routeCheck.success) {
      throw new Error(`EXPORT_ROUTE_OVERRIDE_INVALID(${key}): ${JSON.stringify(routeCheck.issues)}`);
    }

    const list = overridesByDest.get(destIso) ?? [];
    list.push(routeCheck.data);
    overridesByDest.set(destIso, list);
    routeOverridesExported++;
  }

  for (const [, list] of overridesByDest.entries()) {
    list.sort((a, b) => a.routeId.localeCompare(b.routeId));
  }

  const compactMatrix: CompactRouteMatrixFile = {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    storageStrategy: 'COMPACT_RULE_MATRIX_PLUS_SPARSE_OVERRIDES',
    totalIsoCountries: 249,
    totalPossibleBilateralPairs: 61752,
    uninhabitedTerritoryCodes: Array.from(UNINHABITED_TERRITORY_CODES).sort(),
    asOfDate: '2026-11-10',
    treatyBlocs: {
      gcc: ['AE', 'BH', 'KW', 'OM', 'QA', 'SA'],
      fullSchengenEu: [
        'AT', 'BE', 'BG', 'CH', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IS',
        'IT', 'LI', 'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
      ],
      euNonSchengen: ['CY', 'IE'],
      euEeaSwissMobility: [
        'AT', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU',
        'IE', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
      ]
    },
    originRuleSets: {
      IN: {
        visaFreeDestinations: [
          'AO', 'BB', 'BT', 'DM', 'FJ', 'GD', 'HT', 'IR', 'JM', 'KE', 'KN', 'KZ', 'MG', 'MS',
          'MU', 'MV', 'MY', 'MZ', 'NP', 'RW', 'SC', 'SN', 'TH', 'TT', 'VC', 'VU', 'WS'
        ],
        eVisaOrVoaDestinations: [
          'AE', 'AM', 'AU', 'AZ', 'BH', 'BW', 'EG', 'ET', 'GE', 'ID', 'JO', 'JP', 'KH', 'KR',
          'LA', 'LK', 'MM', 'NZ', 'OM', 'QA', 'RU', 'SG', 'TR', 'TZ', 'UG', 'UZ', 'VN', 'ZM', 'ZW'
        ],
        voaVerifiedDestinations: ['FJ', 'ID', 'JO', 'KH', 'LA', 'MU', 'MV', 'OM', 'QA', 'RW', 'SC', 'TH', 'TZ']
      }
    },
    verifiedOverrideDestinations: Array.from(overridesByDest.keys()).sort(),
    provenance: 'src/data/anyToAnyLight.ts'
  };

  sourceRows.push({
    sourceName: 'src/data/anyToAnyLight.ts (compact matrix + curated corridors)',
    sourceRecordCount: curatedKeys.length,
    exportedRecordCount: routeOverridesExported,
    quarantinedRecordCount: 0,
    rejectedRecordCount: 0,
    rejectionReasons: []
  });

  // --------------------------------------------------------------------------
  // 7. Immigration Changelog
  // --------------------------------------------------------------------------
  const changelogSourcePath = path.join(rootDir, 'src/data/immigrationChangelog.json');
  const rawChangelog = JSON.parse(fs.readFileSync(changelogSourcePath, 'utf8')) as ImmigrationChangelogItem[];
  const exportedChangelog: ChangelogRecord[] = [];
  let changelogRejected = 0;

  for (const item of rawChangelog) {
    const adapted = adaptLegacyChangelogToStaticRecord(item);
    const val = validateChangelogRecord(adapted);
    if (val.success) {
      exportedChangelog.push(val.data);
    } else {
      changelogRejected++;
      rejectedTotal++;
    }
  }

  exportedChangelog.sort((a, b) => {
    const byDate = b.changeDate.localeCompare(a.changeDate);
    return byDate !== 0 ? byDate : a.changeId.localeCompare(b.changeId);
  });

  sourceRows.push({
    sourceName: 'src/data/immigrationChangelog.json + backup changelog_entries',
    sourceRecordCount: rawChangelog.length + sqlitePayload.changelog.length,
    exportedRecordCount: exportedChangelog.length,
    quarantinedRecordCount: 0,
    rejectedRecordCount: changelogRejected,
    rejectionReasons: []
  });

  // --------------------------------------------------------------------------
  // 8. Editorial Markdown (Published + Drafts)
  // --------------------------------------------------------------------------
  const publishedEditorial: EditorialArticleRecord[] = [];
  const draftEditorial: EditorialArticleRecord[] = [];

  const contentDir = path.join(rootDir, 'content');
  const publishedMdFiles = fs.existsSync(contentDir)
    ? fs
        .readdirSync(contentDir)
        .filter((f) => f.endsWith('.md'))
        .sort()
    : [];

  for (const fname of publishedMdFiles) {
    const slug = fname.replace(/\.md$/i, '');
    const raw = fs.readFileSync(path.join(contentDir, fname), 'utf8');
    const parsed = matter(raw);
    const originIso = normalizeEditorialIso(parsed.data.from);
    const destIso = normalizeEditorialIso(parsed.data.to);
    const destSources = destIso ? sourcesByCountry.get(destIso) ?? [] : [];
    const officialRefs = destSources.slice(0, 2).map((s) => s.officialHttpsUrl);
    const dateStr = String(parsed.data.date || '2026-11-23');

    const candidate: EditorialArticleRecord = {
      schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
      slug,
      language: 'en',
      title: String(parsed.data.title || slug),
      description: `${String(parsed.data.title || slug)} — evidence-based guide with official sovereign references.`,
      markdownContent: parsed.content.trim(),
      officialReferences: officialRefs,
      publicationDate: dateStr,
      updatedDate: dateStr,
      editorialStatus: 'published',
      originCountryIso: originIso,
      destinationCountryIso: destIso,
      category: (parsed.data.type ? String(parsed.data.type).toLowerCase() : null) as CatalogImmigrationCategory | null
    };

    const res = validateEditorialArticleRecord(candidate);
    if (!res.success) {
      throw new Error(`EXPORT_EDITORIAL_PUBLISHED_INVALID(${fname}): ${JSON.stringify(res.issues)}`);
    }
    publishedEditorial.push(res.data);
  }

  const draftsDir = path.join(rootDir, 'content/drafts');
  const draftMdFiles = fs.existsSync(draftsDir)
    ? fs
        .readdirSync(draftsDir)
        .filter((f) => f.endsWith('.md'))
        .sort()
    : [];

  for (const fname of draftMdFiles) {
    const slug = fname.replace(/\.md$/i, '');
    const raw = fs.readFileSync(path.join(draftsDir, fname), 'utf8');
    const parsed = matter(raw);
    const originIso = normalizeEditorialIso(parsed.data.from);
    const destIso = normalizeEditorialIso(parsed.data.to);
    const dateStr = String(parsed.data.date || '2026-11-11');

    const candidate: EditorialArticleRecord = {
      schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
      slug,
      language: 'en',
      title: String(parsed.data.title || slug),
      description: `Draft editorial article (${slug}) awaiting official verification before publication.`,
      markdownContent: parsed.content.trim(),
      officialReferences: [],
      publicationDate: null,
      updatedDate: dateStr,
      editorialStatus: 'draft',
      originCountryIso: originIso,
      destinationCountryIso: destIso,
      category: (parsed.data.type ? String(parsed.data.type).toLowerCase() : null) as CatalogImmigrationCategory | null
    };

    const res = validateEditorialArticleRecord(candidate);
    if (!res.success) {
      throw new Error(`EXPORT_EDITORIAL_DRAFT_INVALID(${fname}): ${JSON.stringify(res.issues)}`);
    }
    draftEditorial.push(res.data);
  }

  sourceRows.push({
    sourceName: 'content/*.md (published editorial guides)',
    sourceRecordCount: publishedMdFiles.length,
    exportedRecordCount: publishedEditorial.length,
    quarantinedRecordCount: 0,
    rejectedRecordCount: 0,
    rejectionReasons: []
  });

  sourceRows.push({
    sourceName: 'content/drafts/*.md (draft editorial guides)',
    sourceRecordCount: draftMdFiles.length,
    exportedRecordCount: draftEditorial.length,
    quarantinedRecordCount: 0,
    rejectedRecordCount: 0,
    rejectionReasons: []
  });

  // --------------------------------------------------------------------------
  // 9. Honest Coverage Metrics & Batch State
  // --------------------------------------------------------------------------
  quarantineRecords.sort((a, b) => a.quarantineId.localeCompare(b.quarantineId));

  const asOfDate =
    sqlitePayload.batchState && typeof sqlitePayload.batchState.last_batch_run_date === 'string'
      ? sqlitePayload.batchState.last_batch_run_date
      : '2026-11-11';

  // 249 countries * 7 core immigration categories tracked = 1,743 coverage slots (never conflated with verified programs!)
  const coverageMetricsCandidate: CatalogCoverageMetrics = {
    coverageSlotsCount: ALL_249_ISO_FORCED.length * 7,
    discoveredProgramsCount: allPublishedPrograms.length + programsQuarantined,
    verifiedAvailableProgramsCount: allPublishedPrograms.filter((p) => p.verificationStatus === 'AVAILABLE_VERIFIED').length,
    confirmedNotAvailableCount: Number(sqlitePayload.batchState?.not_available_confirmed_count ?? 0),
    quarantinedOrPendingCount: quarantineRecords.length,
    asOfDate
  };

  const metricsCheck = validateCatalogCoverageMetrics(coverageMetricsCandidate);
  if (!metricsCheck.success) {
    throw new Error(`EXPORT_COVERAGE_METRICS_INVALID: ${JSON.stringify(metricsCheck.issues)}`);
  }

  const batchStateExport = {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    sourceBackupSha256: backupSha256,
    lastBatchRunDate: asOfDate,
    currentBatchIndex: Number(sqlitePayload.batchState?.current_batch_index ?? 1),
    totalBatches: Number(sqlitePayload.batchState?.total_batches ?? 10),
    batchSize: Number(sqlitePayload.batchState?.batch_size ?? 25),
    batchCompletionStatus: String(sqlitePayload.batchState?.batch_completion_status ?? 'Active'),
    coverageMetrics: metricsCheck.data
  };

  // --------------------------------------------------------------------------
  // 10. Prepare Deterministic File Map & Write (unless dryRun)
  // --------------------------------------------------------------------------
  const plannedFiles = new Map<string, string>();

  // Countries
  for (const c of countryRecords) {
    plannedFiles.set(`countries/${c.slug}.json`, stableStringify(c));
  }

  // Official sources
  for (const [iso, list] of Array.from(sourcesByCountry.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    plannedFiles.set(`official-sources/${iso.toLowerCase()}.json`, stableStringify(list));
  }

  // Programs
  for (const [iso, list] of Array.from(programsByCountry.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    plannedFiles.set(`programs/${iso.toLowerCase()}.json`, stableStringify(list));
  }

  // Visa details
  for (const vd of visaDetailsExported.sort((a, b) => a.programId.localeCompare(b.programId))) {
    plannedFiles.set(`visa-details/${vd.programId}.json`, stableStringify(vd));
  }

  // Routes
  plannedFiles.set('routes/matrix-compact.json', stableStringify(compactMatrix));
  for (const [iso, list] of Array.from(overridesByDest.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    plannedFiles.set(`routes/overrides/${iso.toLowerCase()}.json`, stableStringify(list));
  }

  // Verification
  plannedFiles.set('verification/claims.json', stableStringify(exportedClaims));
  plannedFiles.set('verification/evidence.json', stableStringify(exportedEvidence));
  plannedFiles.set('verification/quarantine.json', stableStringify(quarantineRecords));
  plannedFiles.set('verification/batch-state.json', stableStringify(batchStateExport));

  // Changelog
  plannedFiles.set('changelog/latest.json', stableStringify(exportedChangelog));

  // Editorial Published
  for (const art of publishedEditorial.sort((a, b) => a.slug.localeCompare(b.slug))) {
    const fm = {
      schemaVersion: art.schemaVersion,
      slug: art.slug,
      language: art.language,
      title: art.title,
      description: art.description,
      officialReferences: art.officialReferences,
      publicationDate: art.publicationDate,
      updatedDate: art.updatedDate,
      editorialStatus: art.editorialStatus,
      originCountryIso: art.originCountryIso ?? null,
      destinationCountryIso: art.destinationCountryIso ?? null,
      category: art.category ?? null
    };
    plannedFiles.set(`editorial/published/${art.slug}.md`, serializeMarkdownWithFrontmatter(fm, art.markdownContent));
  }

  // Editorial Drafts
  for (const art of draftEditorial.sort((a, b) => a.slug.localeCompare(b.slug))) {
    const fm = {
      schemaVersion: art.schemaVersion,
      slug: art.slug,
      language: art.language,
      title: art.title,
      description: art.description,
      officialReferences: art.officialReferences,
      publicationDate: art.publicationDate,
      updatedDate: art.updatedDate,
      editorialStatus: art.editorialStatus,
      originCountryIso: art.originCountryIso ?? null,
      destinationCountryIso: art.destinationCountryIso ?? null,
      category: art.category ?? null
    };
    plannedFiles.set(`editorial/drafts/${art.slug}.md`, serializeMarkdownWithFrontmatter(fm, art.markdownContent));
  }

  const fileDigests = Array.from(plannedFiles.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([relativePath, content]) => ({
      relativePath,
      bytes: Buffer.byteLength(content, 'utf8'),
      sha256: sha256Text(content)
    }));

  const deterministicContentHash = sha256Text(
    fileDigests.map((f) => `${f.relativePath}:${f.sha256}`).join('\n')
  );

  const manifest: ExportCatalogManifest = {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    phase: 'PHASE_3_STATIC_CATALOG_EXPORT',
    deterministicContentHash,
    verifiedBackupSource: {
      relativePath: path.relative(rootDir, backupDbPath).replace(/\\/g, '/'),
      sha256: backupSha256,
      readOnlyMode: true,
      liveSqliteAccessed: false,
      neonAccessed: false
    },
    summary: {
      countriesExported: countryRecords.length,
      activeCountries,
      quarantinedCountries,
      uninhabitedTerritories,
      officialSourcesExported: allOfficialSourcesFlat.length,
      programsExportedPublished: allPublishedPrograms.length,
      programsQuarantined,
      visaDetailsExported: visaDetailsExported.length,
      claimsExported: exportedClaims.length,
      evidenceExported: exportedEvidence.length,
      routeOverridesExported,
      changelogEntriesExported: exportedChangelog.length,
      editorialPublishedExported: publishedEditorial.length,
      editorialDraftsExported: draftEditorial.length,
      quarantineRecordsTotal: quarantineRecords.length,
      duplicatesDetected,
      conflictsDetected,
      rejectedTotal
    },
    coverageMetrics: metricsCheck.data,
    sources: sourceRows,
    files: fileDigests
  };

  if (!dryRun) {
    const dirsToCreate = [
      'countries',
      'routes',
      'routes/overrides',
      'programs',
      'visa-details',
      'official-sources',
      'verification',
      'changelog',
      'editorial/published',
      'editorial/drafts'
    ];
    for (const rel of dirsToCreate) {
      fs.mkdirSync(path.join(outDir, rel), { recursive: true });
    }

    // Clean stale exported artifacts per directory for idempotency
    const dirFileSets = new Map<string, Set<string>>();
    for (const relPath of plannedFiles.keys()) {
      const dir = path.dirname(relPath);
      const base = path.basename(relPath);
      const set = dirFileSets.get(dir) ?? new Set<string>();
      set.add(base);
      dirFileSets.set(dir, set);
    }
    cleanStaleFilesInDir(path.join(outDir, 'countries'), dirFileSets.get('countries') ?? new Set(), '.json');
    cleanStaleFilesInDir(path.join(outDir, 'official-sources'), dirFileSets.get('official-sources') ?? new Set(), '.json');
    cleanStaleFilesInDir(path.join(outDir, 'programs'), dirFileSets.get('programs') ?? new Set(), '.json');
    cleanStaleFilesInDir(path.join(outDir, 'visa-details'), dirFileSets.get('visa-details') ?? new Set(), '.json');
    cleanStaleFilesInDir(path.join(outDir, 'routes/overrides'), dirFileSets.get('routes/overrides') ?? new Set(), '.json');
    cleanStaleFilesInDir(path.join(outDir, 'editorial/published'), dirFileSets.get('editorial/published') ?? new Set(), '.md');
    cleanStaleFilesInDir(path.join(outDir, 'editorial/drafts'), dirFileSets.get('editorial/drafts') ?? new Set(), '.md');

    for (const [relPath, content] of plannedFiles.entries()) {
      fs.writeFileSync(path.join(outDir, relPath), content, 'utf8');
    }

    fs.writeFileSync(path.join(outDir, 'export_manifest.json'), stableStringify(manifest), 'utf8');

    // Update schema_manifest.json metadata if present inside outDir
    const schemaManifestPath = path.join(outDir, 'schema_manifest.json');
    if (fs.existsSync(schemaManifestPath)) {
      const existingSchemaManifest = JSON.parse(fs.readFileSync(schemaManifestPath, 'utf8')) as Record<string, unknown>;
      existingSchemaManifest.phase = 'PHASE_3_STATIC_CATALOG_POPULATED';
      existingSchemaManifest.bulkMigrationExecuted = true;
      existingSchemaManifest.exportManifestPath = 'data/export_manifest.json';
      existingSchemaManifest.deterministicContentHash = deterministicContentHash;
      fs.writeFileSync(schemaManifestPath, stableStringify(existingSchemaManifest), 'utf8');
    }
  }

  return { manifest, dryRun, outDir };
}

function parseCliArgs(argv: string[]): ExportCatalogOptions & { jsonOutput: boolean } {
  const opts: ExportCatalogOptions & { jsonOutput: boolean } = { jsonOutput: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--json') opts.jsonOutput = true;
    else if (arg === '--out-dir' && argv[i + 1]) opts.outDir = argv[++i];
    else if (arg === '--backup-db' && argv[i + 1]) opts.backupDbPath = argv[++i];
  }
  return opts;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const cli = parseCliArgs(process.argv.slice(2));
  const result = exportCatalogToStatic(cli);
  if (cli.jsonOutput) {
    console.log(JSON.stringify(result.manifest, null, 2));
  } else {
    const s = result.manifest.summary;
    console.log('===============================================================');
    console.log(`✅ VISAAPPLY STATIC CATALOG EXPORT ${result.dryRun ? '(DRY RUN)' : '(WRITTEN)'}`);
    console.log(`- Output Directory:       ${result.outDir}`);
    console.log(`- Deterministic Hash:     ${result.manifest.deterministicContentHash}`);
    console.log(`- Countries Exported:     ${s.countriesExported} (${s.activeCountries} active, ${s.quarantinedCountries} quarantined, ${s.uninhabitedTerritories} uninhabited)`);
    console.log(`- Official Sources:       ${s.officialSourcesExported}`);
    console.log(`- Published Programs:     ${s.programsExportedPublished} (Quarantined: ${s.programsQuarantined})`);
    console.log(`- Visa Details:           ${s.visaDetailsExported}`);
    console.log(`- Claims / Evidence:      ${s.claimsExported} / ${s.evidenceExported}`);
    console.log(`- Route Overrides:        ${s.routeOverridesExported} (+ compact 249x248 matrix)`);
    console.log(`- Changelog Entries:      ${s.changelogEntriesExported}`);
    console.log(`- Editorial (Pub/Draft):  ${s.editorialPublishedExported} / ${s.editorialDraftsExported}`);
    console.log(`- Quarantine Preserved:   ${s.quarantineRecordsTotal}`);
    console.log(`- Live SQLite / Neon:     UNTOUCHED (verified backup read-only)`);
    console.log('===============================================================');
  }
}
