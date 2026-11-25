/**
 * VISAAPPLY.ORG — PHASE 5B: DATA QUALITY & COVERAGE DASHBOARD REPORT GENERATOR
 *
 * Produces a deterministic, machine-readable JSON dashboard report
 * (`data/monitoring/data-quality-report.json`) strictly separating:
 * - 249 ISO countries/territories in registry
 * - 61,752 potential bilateral routes
 * - 1,743 seven-category tracked slots
 * - Actual verified available programs (28 currently)
 * - Verified official sources registered (61 currently)
 * - Monitoring reachability, changes, pending claims, quarantines & timestamps
 *
 * NEVER manufactures coverage percentages or conflates tracked slots with verified programs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  STATIC_CATALOG_SCHEMA_VERSION,
  detectProhibitedPublicSecretsOrPii,
  type ClaimRecord,
  type CountryRecord,
  type ImmigrationProgramRecord,
  type OfficialSourceRecord,
  type QuarantineRecord
} from '../src/schemas/catalogSchemas';
import {
  PHASE5B_MONITORING_SCHEMA_VERSION,
  type DataQualityDashboardReport,
  type EvidenceReviewProposal,
  type MonitoredSourceRegistryEntry,
  type MonitoringRunState,
  type RecordLevelQuarantineAction,
  type SourceMonitoringRunReport
} from '../src/schemas/sourceMonitoringSchemas';

export interface GenerateDataQualityReportOptions {
  dataDir?: string;
  monitoringDir?: string;
  publicCatalogDir?: string;
  outputPath?: string;
  writeToDisk?: boolean;
  now?: Date;
}

function listFiles(dirPath: string, ext: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(ext) && !fs.statSync(path.join(dirPath, f)).isDirectory())
    .sort()
    .map((f) => path.join(dirPath, f));
}

function readJsonSafe<T>(fp: string, fallback: T): T {
  if (!fs.existsSync(fp)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

export function generateDataQualityReport(
  options: GenerateDataQualityReportOptions = {}
): { report: DataQualityDashboardReport; outputPath: string } {
  const rootDir = process.cwd();
  const dataDir = path.resolve(options.dataDir ?? path.join(rootDir, 'data'));
  const monitoringDir = path.resolve(options.monitoringDir ?? path.join(dataDir, 'monitoring'));
  const publicCatalogDir = path.resolve(options.publicCatalogDir ?? path.join(rootDir, 'public/catalog'));
  const outputPath = path.resolve(options.outputPath ?? path.join(monitoringDir, 'data-quality-report.json'));
  const now = options.now ?? new Date();

  // 1. Canonical countries
  const countries = listFiles(path.join(dataDir, 'countries'), '.json').map((fp) =>
    readJsonSafe<CountryRecord | null>(fp, null)
  ).filter((c): c is CountryRecord => Boolean(c));

  const activeCountries = countries.filter((c) => c.recordStatus === 'ACTIVE').length;
  const awaitingVerificationCountries = countries.filter((c) => c.recordStatus === 'QUARANTINED').length;
  const uninhabitedTerritories = countries.filter((c) => c.recordStatus === 'UNINHABITED_TERRITORY').length;

  // 2. Canonical official sources
  let verifiedOfficialSourcesRegistered = 0;
  for (const fp of listFiles(path.join(dataDir, 'official-sources'), '.json')) {
    const arr = readJsonSafe<OfficialSourceRecord[]>(fp, []);
    verifiedOfficialSourcesRegistered += arr.length;
  }

  // 3. Canonical programs
  const programs: ImmigrationProgramRecord[] = [];
  for (const fp of listFiles(path.join(dataDir, 'programs'), '.json')) {
    programs.push(...readJsonSafe<ImmigrationProgramRecord[]>(fp, []));
  }
  const verifiedAvailablePrograms = programs.filter(
    (p) => p.publicationStatus === 'PUBLISHED' && p.verificationStatus === 'AVAILABLE_VERIFIED'
  ).length;
  const confirmedUnavailableProgramsInProgramsDir = programs.filter(
    (p) => p.verificationStatus === 'NOT_AVAILABLE_CONFIRMED'
  ).length;

  // 4. Canonical claims, quarantine, routes, editorial
  const claims = readJsonSafe<ClaimRecord[]>(path.join(dataDir, 'verification/claims.json'), []);
  const quarantine = readJsonSafe<QuarantineRecord[]>(path.join(dataDir, 'verification/quarantine.json'), []);
  const expiredOrUnavailableProgramsInQuarantine = quarantine.filter(
    (q) => q.entityType === 'program' && q.reasonCode === 'EXPIRED_PROGRAM'
  ).length;
  const quarantinedCountriesCount = quarantine.filter((q) => q.entityType === 'country').length;
  const quarantinedProgramsCount = quarantine.filter((q) => q.entityType === 'program').length;

  let verifiedRouteOverrides = 0;
  for (const fp of listFiles(path.join(dataDir, 'routes/overrides'), '.json')) {
    const arr = readJsonSafe<Array<{ routePublicationEligible?: boolean }>>(fp, []);
    verifiedRouteOverrides += arr.filter((r) => r.routePublicationEligible).length;
  }

  const publishedEditorialArticles = listFiles(path.join(dataDir, 'editorial/published'), '.md').length;
  const excludedDraftEditorialArticles = listFiles(path.join(dataDir, 'editorial/drafts'), '.md').length;

  // 5. Phase 5B monitoring state, latest run report, pending proposals & record-level quarantines
  const runState = readJsonSafe<MonitoringRunState | null>(path.join(monitoringDir, 'run-state.json'), null);
  const sourceRegistryState = readJsonSafe<MonitoredSourceRegistryEntry[]>(
    path.join(monitoringDir, 'source-registry-state.json'),
    []
  );
  const latestRunReport = readJsonSafe<SourceMonitoringRunReport | null>(
    path.join(monitoringDir, 'latest-run-report.json'),
    null
  );
  const pendingEvidenceProposals = readJsonSafe<EvidenceReviewProposal[]>(
    path.join(monitoringDir, 'changes/pending-evidence-proposals.json'),
    []
  );
  const recordLevelQuarantines = readJsonSafe<RecordLevelQuarantineAction[]>(
    path.join(monitoringDir, 'record-level-quarantines.json'),
    []
  );

  // Derive source monitoring metrics accurately from actual run records (never fabricated)
  const sourcesReachable = sourceRegistryState.filter(
    (s) => s.currentSourceStatus === 'VERIFIED_UNCHANGED' || s.currentSourceStatus === 'REDIRECTED_OFFICIAL'
  ).length;
  const sourcesChanged = sourceRegistryState.filter(
    (s) => s.currentSourceStatus === 'SOURCE_CHANGED' || s.currentSourceStatus === 'STRUCTURE_CHANGED'
  ).length;
  const sourcesUnavailable = sourceRegistryState.filter(
    (s) =>
      s.currentSourceStatus === 'SOURCE_UNAVAILABLE' ||
      s.currentSourceStatus === 'REDIRECTED_SUSPICIOUS' ||
      s.currentSourceStatus === 'ROBOTS_RESTRICTED' ||
      s.currentSourceStatus === 'RATE_LIMITED' ||
      s.currentSourceStatus === 'ANTI_BOT_PROTECTED' ||
      s.currentSourceStatus === 'TLS_CERTIFICATE_ERROR'
  ).length;
  const sourcesAwaitingInitialCheck =
    sourceRegistryState.length > 0
      ? sourceRegistryState.filter((s) => s.currentSourceStatus === 'AWAITING_INITIAL_CHECK').length
      : verifiedOfficialSourcesRegistered;

  const claimsVerified = claims.filter(
    (c) => c.verificationStatus === 'AVAILABLE_VERIFIED' || c.verificationStatus === 'NOT_AVAILABLE_CONFIRMED'
  ).length;
  const claimsAwaitingReviewInCanonical = claims.filter(
    (c) =>
      c.verificationStatus === 'AWAITING_OFFICIAL_VERIFICATION' ||
      c.verificationStatus === 'NEEDS_REVIEW' ||
      c.verificationStatus === 'CONFLICTING'
  ).length;
  const pendingReviewProposalsCount = pendingEvidenceProposals.filter(
    (p) => p.reviewerStatus === 'PENDING_HUMAN_REVIEW'
  ).length;

  // 6. Latest static catalog manifest hash & mtime
  const manifestPath = path.join(publicCatalogDir, 'manifest.json');
  const manifest = readJsonSafe<{ deterministicBuildHash?: string } | null>(manifestPath, null);
  let latestCatalogGenerationTime: string | null = null;
  if (fs.existsSync(manifestPath)) {
    latestCatalogGenerationTime = fs.statSync(manifestPath).mtime.toISOString();
  }

  const totalCountries = countries.length;
  const report: DataQualityDashboardReport = {
    schemaVersion: PHASE5B_MONITORING_SCHEMA_VERSION,
    catalogSchemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    generatedAt: now.toISOString(),
    reportIntegrity: {
      noFabricatedCoveragePercentages: true,
      strictMetricSeparationEnforced: true,
      liveExternalMonitoringExecutedInThisReport: Boolean(
        latestRunReport && latestRunReport.executionMode === 'LIVE_HTTPS' && latestRunReport.totals.sourcesChecked > 0
      )
    },
    canonicalScopeMetrics: {
      totalCountriesAndTerritoriesInRegistry: totalCountries,
      potentialBilateralRoutes: totalCountries * Math.max(0, totalCountries - 1),
      trackedSevenCategoryCoverageSlots: totalCountries * 7,
      activeVerifiedCountries: activeCountries,
      awaitingVerificationCountries,
      uninhabitedTerritories
    },
    verifiedCatalogMetrics: {
      verifiedAvailablePrograms,
      programsConfirmedUnavailableOrExpired:
        confirmedUnavailableProgramsInProgramsDir + expiredOrUnavailableProgramsInQuarantine,
      verifiedOfficialSourcesRegistered,
      verifiedRouteOverrides,
      publishedEditorialArticles,
      excludedDraftEditorialArticles
    },
    monitoringMetrics: {
      sourcesCheckedInLatestRun: latestRunReport?.totals.sourcesChecked ?? 0,
      sourcesReachable,
      sourcesUnavailable,
      sourcesChanged,
      sourcesAwaitingInitialCheck,
      claimsVerified,
      claimsAwaitingReview: claimsAwaitingReviewInCanonical + pendingReviewProposalsCount,
      recordsQuarantinedTotal: quarantine.length + recordLevelQuarantines.length,
      quarantinedCountriesCount,
      quarantinedProgramsCount,
      recordLevelMonitoringQuarantinesCount: recordLevelQuarantines.length
    },
    timestamps: {
      lastSuccessfulMonitoringRun: runState?.lastSuccessfulMonitoringRunAt ?? null,
      latestCatalogBuildHash: manifest?.deterministicBuildHash ?? null,
      latestCatalogGenerationTime
    }
  };

  // Enforce zero PII / secret leaks in the report
  const piiFindings = detectProhibitedPublicSecretsOrPii(report);
  if (piiFindings.length > 0) {
    throw new Error(`PII_OR_SECRET_LEAK_IN_REPORT: ${piiFindings.join('; ')}`);
  }

  if (options.writeToDisk !== false) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const tmpPath = `${outputPath}.tmp-${process.pid}-${Date.now()}`;
    fs.writeFileSync(tmpPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    fs.renameSync(tmpPath, outputPath);
  }

  return { report, outputPath };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const args = process.argv.slice(2);
  let dataDir: string | undefined;
  let monitoringDir: string | undefined;
  let outputPath: string | undefined;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--data-dir' && args[i + 1]) dataDir = args[++i];
    else if (args[i] === '--monitoring-dir' && args[i + 1]) monitoringDir = args[++i];
    else if (args[i] === '--out' && args[i + 1]) outputPath = args[++i];
    else if (args[i] === '--json') jsonOutput = true;
  }

  const { report, outputPath: writtenPath } = generateDataQualityReport({
    dataDir,
    monitoringDir,
    outputPath
  });

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const s = report.canonicalScopeMetrics;
    const v = report.verifiedCatalogMetrics;
    const m = report.monitoringMetrics;
    console.log('===============================================================');
    console.log('VISAAPPLY.ORG — DATA QUALITY & COVERAGE DASHBOARD REPORT');
    console.log(`- Written To:               ${writtenPath}`);
    console.log(`- Countries Registry:       ${s.totalCountriesAndTerritoriesInRegistry} (${s.activeVerifiedCountries} active, ${s.awaitingVerificationCountries} awaiting verification, ${s.uninhabitedTerritories} uninhabited)`);
    console.log(`- Potential Bilateral Pairs:${s.potentialBilateralRoutes.toLocaleString()} | 7-Cat Slots: ${s.trackedSevenCategoryCoverageSlots.toLocaleString()}`);
    console.log(`- Verified Programs:        ${v.verifiedAvailablePrograms} available | ${v.programsConfirmedUnavailableOrExpired} expired/unavailable`);
    console.log(`- Official HTTPS Sources:   ${v.verifiedOfficialSourcesRegistered} registered (checked=${m.sourcesCheckedInLatestRun}, reachable=${m.sourcesReachable}, changed=${m.sourcesChanged}, unavailable=${m.sourcesUnavailable}, awaiting=${m.sourcesAwaitingInitialCheck})`);
    console.log(`- Claims (Verified/Pending):${m.claimsVerified} / ${m.claimsAwaitingReview}`);
    console.log(`- Quarantined Records:      ${m.recordsQuarantinedTotal} total (${m.quarantinedCountriesCount} countries, ${m.quarantinedProgramsCount} programs, ${m.recordLevelMonitoringQuarantinesCount} monitoring record-level)`);
    console.log(`- Last Monitoring Run:      ${report.timestamps.lastSuccessfulMonitoringRun ?? 'NONE (not yet externally executed)'}`);
    console.log(`- Latest Catalog Hash:      ${report.timestamps.latestCatalogBuildHash ?? 'NONE'}`);
    console.log('===============================================================');
  }
}
