/**
 * VISAAPPLY.ORG — PHASE 5B: AUTOMATED OFFICIAL SOURCE MONITORING CLI
 *
 * Orchestrates:
 * 1. Missed-run detection (03:00 AM IST / 21:30 UTC daily schedule) & safe catch-up
 * 2. Idempotent run-lock acquisition (prevents duplicate overlapping executions)
 * 3. Safe HTTPS official-source checking (respects robots.txt, rate limits, redirects, anti-bot)
 * 4. Change detection & human-review evidence proposal generation (preserves published catalog!)
 * 5. Automated record-level quarantine candidate emission (never quarantines an entire country for 1 outage)
 * 6. Persistence of check history + updated Data Quality Dashboard report under `data/monitoring/`
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  deterministicShortHash,
  type ClaimRecord,
  type ImmigrationProgramRecord
} from '../src/schemas/catalogSchemas';
import type {
  ChangeDetectionRecord,
  DataQualityDashboardReport,
  EvidenceReviewProposal,
  MonitoredSourceRegistryEntry,
  RecordLevelQuarantineAction,
  SourceMonitoringRunReport
} from '../src/schemas/sourceMonitoringSchemas';
import {
  acquireMonitoringRunLock,
  buildMonitoredRegistryFromCanonical,
  detectMissedScheduledRuns,
  getLatestScheduledSlotUtc,
  loadRunState,
  releaseMonitoringRunLock,
  runOfficialSourceMonitoring,
  type HostIpResolver,
  type MonitorHttpFetcher
} from './lib/officialSourceMonitor';
import { processMonitoringReportForChangesAndQuarantine } from './lib/changeEvidenceQuarantineEngine';
import { generateDataQualityReport } from './generateDataQualityReport';

export interface ExecuteMonitoringPipelineOptions {
  dataDir?: string;
  monitoringDir?: string;
  publicCatalogDir?: string;
  dryRun?: boolean;
  forceDuplicateSlot?: boolean;
  limit?: number;
  now?: Date;
  triggeredBy?: SourceMonitoringRunReport['triggeredBy'];
  fetcher?: MonitorHttpFetcher;
  resolveHostIps?: HostIpResolver;
  sleep?: (ms: number) => Promise<void>;
  perHostIntervalMs?: number;
  timeoutMs?: number;
  allowTestLocalHttp?: boolean;
  /**
   * Optional explicit source overrides for deterministic tests.
   */
  overrideSources?: MonitoredSourceRegistryEntry[];
}

export interface ExecuteMonitoringPipelineResult {
  skipped: boolean;
  skipCode?: 'RUN_ALREADY_ACTIVE' | 'IDEMPOTENT_SLOT_ALREADY_EXECUTED';
  skipReason?: string;
  missedRunsDetected: number;
  report: SourceMonitoringRunReport | null;
  changeRecords: ChangeDetectionRecord[];
  evidenceProposals: EvidenceReviewProposal[];
  recordQuarantines: RecordLevelQuarantineAction[];
  dataQualityReport: DataQualityDashboardReport | null;
}

function writeJsonAtomic(filePath: string, payload: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function readJsonArraySafe<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function loadCanonicalProgramsAndClaims(dataDir: string): {
  programs: ImmigrationProgramRecord[];
  claims: ClaimRecord[];
} {
  const programsDir = path.join(dataDir, 'programs');
  const programs: ImmigrationProgramRecord[] = [];
  if (fs.existsSync(programsDir)) {
    for (const f of fs.readdirSync(programsDir).filter((x) => x.endsWith('.json')).sort()) {
      programs.push(...readJsonArraySafe<ImmigrationProgramRecord>(path.join(programsDir, f)));
    }
  }
  const claims = readJsonArraySafe<ClaimRecord>(path.join(dataDir, 'verification/claims.json'));
  return { programs, claims };
}

export async function executeSourceMonitoringPipeline(
  options: ExecuteMonitoringPipelineOptions = {}
): Promise<ExecuteMonitoringPipelineResult> {
  const rootDir = process.cwd();
  const dataDir = path.resolve(options.dataDir ?? path.join(rootDir, 'data'));
  const monitoringDir = path.resolve(options.monitoringDir ?? path.join(dataDir, 'monitoring'));
  const publicCatalogDir = path.resolve(options.publicCatalogDir ?? path.join(rootDir, 'public/catalog'));
  const now = options.now ?? new Date();

  const runStatePath = path.join(monitoringDir, 'run-state.json');
  const registryStatePath = path.join(monitoringDir, 'source-registry-state.json');

  const priorState = loadRunState(runStatePath);
  const missedCheck = detectMissedScheduledRuns(priorState.lastScheduledSlotExecutedUtc, now);
  const scheduledSlotUtc = getLatestScheduledSlotUtc(now);
  const effectiveTrigger: SourceMonitoringRunReport['triggeredBy'] =
    options.triggeredBy ?? (missedCheck.catchUpRecommended ? 'CATCH_UP' : 'MANUAL_CLI');

  let sources = options.overrideSources
    ? options.overrideSources.map((s) => ({ ...s }))
    : buildMonitoredRegistryFromCanonical(dataDir, registryStatePath);

  if (typeof options.limit === 'number' && options.limit > 0) {
    sources = sources.slice(0, options.limit);
  }

  const runId = `MON-${now.toISOString().slice(0, 10)}-${deterministicShortHash([now.toISOString(), String(sources.length), effectiveTrigger])}`;
  const idempotencyKey = `slot:${scheduledSlotUtc}:sources:${sources.length}`;

  if (!options.dryRun) {
    const lock = acquireMonitoringRunLock(runStatePath, {
      runId,
      idempotencyKey,
      now,
      allowDuplicateSlot: options.forceDuplicateSlot
    });
    if (!lock.acquired) {
      return {
        skipped: true,
        skipCode: lock.code,
        skipReason: lock.reason,
        missedRunsDetected: missedCheck.missedRunsCount,
        report: null,
        changeRecords: [],
        evidenceProposals: [],
        recordQuarantines: [],
        dataQualityReport: null
      };
    }
  }

  let succeeded = false;
  try {
    const executionMode: SourceMonitoringRunReport['executionMode'] = options.dryRun
      ? 'DRY_RUN'
      : options.fetcher
        ? 'MOCK_INJECTED'
        : 'LIVE_HTTPS';

    const { report, updatedRegistry } = await runOfficialSourceMonitoring({
      sources,
      now,
      runId,
      triggeredBy: effectiveTrigger,
      executionMode,
      missedRunsDetected: missedCheck.missedRunsCount,
      fetcher: options.fetcher,
      resolveHostIps: options.resolveHostIps,
      sleep: options.sleep,
      perHostIntervalMs: options.perHostIntervalMs,
      timeoutMs: options.timeoutMs,
      allowTestLocalHttp: options.allowTestLocalHttp
    });

    const { programs, claims } = loadCanonicalProgramsAndClaims(dataDir);
    const { changeRecords, evidenceProposals, recordQuarantines } = processMonitoringReportForChangesAndQuarantine({
      report,
      programs,
      claims
    });

    let dataQualityReport: DataQualityDashboardReport | null = null;

    if (!options.dryRun) {
      // Persist updated source registry monitoring state (never mutates published program rules!)
      const existingFullRegistry = buildMonitoredRegistryFromCanonical(dataDir, registryStatePath);
      const updatedById = new Map(updatedRegistry.map((u) => [u.sourceId, u]));
      const mergedRegistry =
        options.overrideSources
          ? updatedRegistry
          : existingFullRegistry.map((entry) => updatedById.get(entry.sourceId) ?? entry);

      writeJsonAtomic(registryStatePath, mergedRegistry);
      writeJsonAtomic(path.join(monitoringDir, 'latest-run-report.json'), report);

      // Append to bounded source-check history directory
      const historyFile = path.join(monitoringDir, 'history', `${now.toISOString().slice(0, 10)}_${runId}.json`);
      writeJsonAtomic(historyFile, report);

      // Merge change-detection records & pending evidence proposals idempotently by ID
      const changesPath = path.join(monitoringDir, 'changes/change-detections.json');
      const existingChanges = readJsonArraySafe<ChangeDetectionRecord>(changesPath);
      const changesById = new Map(existingChanges.map((c) => [c.changeDetectionId, c]));
      for (const ch of changeRecords) changesById.set(ch.changeDetectionId, ch);
      writeJsonAtomic(changesPath, Array.from(changesById.values()));

      const proposalsPath = path.join(monitoringDir, 'changes/pending-evidence-proposals.json');
      const existingProposals = readJsonArraySafe<EvidenceReviewProposal>(proposalsPath);
      const proposalsById = new Map(existingProposals.map((p) => [p.proposalId, p]));
      for (const ep of evidenceProposals) proposalsById.set(ep.proposalId, ep);
      writeJsonAtomic(proposalsPath, Array.from(proposalsById.values()));

      // Merge record-level quarantines idempotently by quarantineId
      const rlqPath = path.join(monitoringDir, 'record-level-quarantines.json');
      const existingRlq = readJsonArraySafe<RecordLevelQuarantineAction>(rlqPath);
      const rlqById = new Map(existingRlq.map((q) => [q.quarantineId, q]));
      for (const rq of recordQuarantines) rlqById.set(rq.quarantineId, rq);
      writeJsonAtomic(rlqPath, Array.from(rlqById.values()));

      succeeded = true;
      releaseMonitoringRunLock(runStatePath, {
        runId,
        idempotencyKey,
        completedAt: new Date(),
        succeeded: true,
        scheduledSlotUtc
      });

      dataQualityReport = generateDataQualityReport({
        dataDir,
        monitoringDir,
        publicCatalogDir,
        now
      }).report;
    } else {
      dataQualityReport = generateDataQualityReport({
        dataDir,
        monitoringDir,
        publicCatalogDir,
        writeToDisk: false,
        now
      }).report;
      succeeded = true;
    }

    return {
      skipped: false,
      missedRunsDetected: missedCheck.missedRunsCount,
      report,
      changeRecords,
      evidenceProposals,
      recordQuarantines,
      dataQualityReport
    };
  } finally {
    if (!options.dryRun && !succeeded) {
      releaseMonitoringRunLock(runStatePath, {
        runId,
        idempotencyKey,
        completedAt: new Date(),
        succeeded: false,
        scheduledSlotUtc
      });
    }
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const args = process.argv.slice(2);
  let dataDir: string | undefined;
  let monitoringDir: string | undefined;
  let dryRun = false;
  let forceDuplicateSlot = false;
  let jsonOutput = false;
  let limit: number | undefined;
  let triggeredBy: SourceMonitoringRunReport['triggeredBy'] | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--data-dir' && args[i + 1]) dataDir = args[++i];
    else if (args[i] === '--monitoring-dir' && args[i + 1]) monitoringDir = args[++i];
    else if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--force-slot') forceDuplicateSlot = true;
    else if (args[i] === '--json') jsonOutput = true;
    else if (args[i] === '--limit' && args[i + 1]) limit = Number(args[++i]);
    else if (args[i] === '--triggered-by' && args[i + 1]) {
      triggeredBy = args[++i] as SourceMonitoringRunReport['triggeredBy'];
    }
  }

  executeSourceMonitoringPipeline({
    dataDir,
    monitoringDir,
    dryRun,
    forceDuplicateSlot,
    limit,
    triggeredBy
  })
    .then((res) => {
      if (jsonOutput) {
        console.log(JSON.stringify(res, null, 2));
      } else if (res.skipped) {
        console.log(`⏭️  Monitoring run skipped (${res.skipCode}): ${res.skipReason}`);
      } else if (res.report) {
        const t = res.report.totals;
        console.log('===============================================================');
        console.log(`✅ OFFICIAL SOURCE MONITORING RUN COMPLETE (${res.report.runId})`);
        console.log(`- Mode / Trigger:      ${res.report.executionMode} / ${res.report.triggeredBy}`);
        console.log(`- Sources Checked:     ${t.sourcesChecked}/${t.sourcesConsidered}`);
        console.log(`- Reachable Unchanged: ${t.reachableUnchanged}`);
        console.log(`- Changes Detected:    ${t.changedDetected} (Evidence Proposals: ${res.evidenceProposals.length})`);
        console.log(`- Unavailable/Errors:  ${t.unavailableOrError} | Robots: ${t.robotsRestricted} | Rate-Limited: ${t.rateLimited} | Anti-Bot: ${t.antiBotProtected}`);
        console.log(`- Suspicious Redirects:${t.suspiciousRedirects} | Record-Level Quarantines: ${res.recordQuarantines.length}`);
        console.log('===============================================================');
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ OFFICIAL SOURCE MONITORING FAILED:', err instanceof Error ? err.message : String(err));
      process.exit(1);
    });
}
