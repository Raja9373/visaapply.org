/**
 * VISAAPPLY.ORG — PHASE 6: EDITORIAL PULL REQUEST VALIDATION CLI
 *
 * Enforces all Section 6 mandatory Pull Request validation checks before merge:
 * 1. Canonical static catalog validation (schemas, stable IDs, official HTTPS sources,
 *    duplicate IDs, invalid URLs, quarantine integrity, claim/evidence linkage, PII/secrets)
 * 2. Editorial change proposals (`data/editorial-governance/proposals/*.json`):
 *    - Schema correctness, official source registry references, valid HTTPS URLs,
 *      non-expired evidence, claim status transitions, high-risk approval requirements,
 *      duplicate/self/AI approval prevention, RBAC role enforcement
 * 3. Quarantine release requests (`data/editorial-governance/quarantine-releases/*.json`):
 *    - Enforces all 5 mandatory gates; blocks release triggered solely by reachability
 * 4. Append-only audit trail (`data/editorial-governance/audit-log.json`):
 *    - SHA-256 chain verification, required fields, zero PII/secrets, and optional
 *      prefix immutability check against `--base-audit-log`
 * 5. Atomic dry-run static catalog export, search index generation, and candidate
 *    sitemap generation (`runSafeCatalogRegeneration({ dryRun: true })`)
 *
 * Exits with code 1 on ANY error so GitHub Branch Protection blocks merge.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  detectProhibitedPublicSecretsOrPii,
  type OfficialSourceRecord
} from '../src/schemas/catalogSchemas';
import {
  PHASE6_GOVERNANCE_SCHEMA_VERSION,
  type EditorialAuditEvent,
  type EditorialChangeProposal,
  type QuarantineReleaseRequest
} from '../src/schemas/editorialGovernanceSchemas';
import {
  evaluateQuarantineRelease,
  validateEditorialChangeProposal,
  verifyAppendOnlyAuditTrail
} from './lib/editorialApprovalEngine';
import { validateStaticCatalog } from './validateStaticCatalog';
import { runSafeCatalogRegeneration } from './runSafeCatalogRegeneration';

export interface ValidateEditorialPrOptions {
  dataDir?: string;
  governanceDir?: string;
  publicDir?: string;
  baseAuditLogPath?: string;
  skipCatalogDryRun?: boolean;
  evaluationDate?: Date;
  now?: Date;
}

export interface EditorialPrValidationReport {
  schemaVersion: typeof PHASE6_GOVERNANCE_SCHEMA_VERSION;
  valid: boolean;
  checkedAt: string;
  checks: {
    staticCatalogValid: boolean;
    proposalsChecked: number;
    quarantineReleasesChecked: number;
    auditEventsChecked: number;
    auditTrailValid: boolean;
    piiAndSecretScanClean: boolean;
    atomicRegenerationDryRunPassed: boolean;
  };
  errors: string[];
}

function listJsonFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith('.json') && !fs.statSync(path.join(dirPath, f)).isDirectory())
    .sort()
    .map((f) => path.join(dirPath, f));
}

function loadOfficialSourceIdSet(dataDir: string): Set<string> {
  const ids = new Set<string>();
  const dir = path.join(dataDir, 'official-sources');
  for (const fp of listJsonFiles(dir)) {
    try {
      const list = JSON.parse(fs.readFileSync(fp, 'utf8')) as OfficialSourceRecord[];
      for (const s of list) {
        if (s && typeof s.sourceId === 'string') ids.add(s.sourceId);
      }
    } catch {
      // Handled by validateStaticCatalog
    }
  }
  return ids;
}

export function validateEditorialPullRequest(
  options: ValidateEditorialPrOptions = {}
): EditorialPrValidationReport {
  const rootDir = process.cwd();
  const dataDir = path.resolve(options.dataDir ?? path.join(rootDir, 'data'));
  const governanceDir = path.resolve(options.governanceDir ?? path.join(dataDir, 'editorial-governance'));
  const publicDir = path.resolve(options.publicDir ?? path.join(rootDir, 'public'));
  const now = options.now ?? new Date();
  const errors: string[] = [];

  // 1. Canonical 17-check static catalog validation
  const catalogVal = validateStaticCatalog({ dataDir, evaluationDate: options.evaluationDate });
  if (!catalogVal.valid) {
    for (const err of catalogVal.errors) {
      errors.push(`[CATALOG:${err.check}] ${err.filePath}: ${err.code} — ${err.message}`);
    }
  }

  const knownOfficialSourceIds = loadOfficialSourceIdSet(dataDir);
  let piiClean = true;

  // 2. Validate role-policy.json if present (zero PII/secrets)
  const rolePolicyPath = path.join(governanceDir, 'role-policy.json');
  if (fs.existsSync(rolePolicyPath)) {
    try {
      const policy = JSON.parse(fs.readFileSync(rolePolicyPath, 'utf8'));
      const pii = detectProhibitedPublicSecretsOrPii(policy);
      if (pii.length > 0) {
        piiClean = false;
        errors.push(...pii.map((m) => `[ROLE_POLICY_PII] ${m}`));
      }
    } catch (err) {
      errors.push(`[ROLE_POLICY] Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 3. Validate all editorial change proposals (`proposals/*.json`)
  const proposalFiles = listJsonFiles(path.join(governanceDir, 'proposals'));
  const seenProposalIds = new Set<string>();
  let proposalsChecked = 0;

  for (const fp of proposalFiles) {
    const rel = path.relative(governanceDir, fp).replace(/\\/g, '/');
    try {
      const raw = JSON.parse(fs.readFileSync(fp, 'utf8')) as EditorialChangeProposal;
      proposalsChecked++;

      const pii = detectProhibitedPublicSecretsOrPii(raw);
      if (pii.length > 0) {
        piiClean = false;
        errors.push(...pii.map((m) => `[PROPOSAL_PII:${rel}] ${m}`));
      }

      if (raw.proposalId) {
        const key = raw.proposalId.toUpperCase();
        if (seenProposalIds.has(key)) {
          errors.push(`[PROPOSAL:${rel}] DUPLICATE_PROPOSAL_ID: "${raw.proposalId}" already exists.`);
        }
        seenProposalIds.add(key);
      }

      const res = validateEditorialChangeProposal(raw, { now, knownOfficialSourceIds });
      if (!res.valid) {
        for (const e of res.errors) {
          errors.push(`[PROPOSAL:${rel}] ${e}`);
        }
      }
    } catch (err) {
      errors.push(`[PROPOSAL:${rel}] Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 4. Validate all quarantine release requests (`quarantine-releases/*.json`)
  const releaseFiles = listJsonFiles(path.join(governanceDir, 'quarantine-releases'));
  let quarantineReleasesChecked = 0;

  for (const fp of releaseFiles) {
    const rel = path.relative(governanceDir, fp).replace(/\\/g, '/');
    try {
      const req = JSON.parse(fs.readFileSync(fp, 'utf8')) as QuarantineReleaseRequest;
      quarantineReleasesChecked++;

      const pii = detectProhibitedPublicSecretsOrPii(req);
      if (pii.length > 0) {
        piiClean = false;
        errors.push(...pii.map((m) => `[QUARANTINE_RELEASE_PII:${rel}] ${m}`));
      }

      if (req.officialSourceId && !knownOfficialSourceIds.has(req.officialSourceId)) {
        errors.push(
          `[QUARANTINE_RELEASE:${rel}] UNKNOWN_OFFICIAL_SOURCE_REF: Source "${req.officialSourceId}" not registered in data/official-sources/.`
        );
      }

      const relEval = evaluateQuarantineRelease(
        {
          ...req,
          staticCatalogValidationPassed: req.staticCatalogValidationPassed && catalogVal.valid
        },
        { now }
      );
      if (!relEval.releaseAllowed) {
        for (const e of relEval.errors) {
          errors.push(`[QUARANTINE_RELEASE:${rel}] ${e}`);
        }
      }
    } catch (err) {
      errors.push(`[QUARANTINE_RELEASE:${rel}] Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 5. Validate append-only audit trail (`audit-log.json`)
  let auditEventsChecked = 0;
  let auditTrailValid = true;
  const auditLogPath = path.join(governanceDir, 'audit-log.json');
  if (fs.existsSync(auditLogPath)) {
    try {
      const events = JSON.parse(fs.readFileSync(auditLogPath, 'utf8')) as EditorialAuditEvent[];
      let baselineEvents: EditorialAuditEvent[] | undefined;
      if (options.baseAuditLogPath && fs.existsSync(options.baseAuditLogPath)) {
        baselineEvents = JSON.parse(fs.readFileSync(options.baseAuditLogPath, 'utf8')) as EditorialAuditEvent[];
      }
      const auditRes = verifyAppendOnlyAuditTrail(events, baselineEvents);
      auditEventsChecked = auditRes.eventCount;
      auditTrailValid = auditRes.valid;
      if (!auditRes.valid) {
        for (const e of auditRes.errors) {
          if (e.includes('PII/secret')) piiClean = false;
          errors.push(`[AUDIT_TRAIL] ${e}`);
        }
      }
    } catch (err) {
      auditTrailValid = false;
      errors.push(`[AUDIT_TRAIL] Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 6. Atomic dry-run static catalog export, search indexes & candidate sitemaps
  let atomicRegenerationDryRunPassed = true;
  if (!options.skipCatalogDryRun) {
    if (catalogVal.valid) {
      const dryRunRes = runSafeCatalogRegeneration({
        dataDir,
        publicDir,
        dryRun: true,
        evaluationDate: options.evaluationDate,
        now
      });
      atomicRegenerationDryRunPassed = dryRunRes.succeeded;
      if (!dryRunRes.succeeded) {
        for (const e of dryRunRes.errors) {
          errors.push(`[ATOMIC_REGEN_DRY_RUN] ${e}`);
        }
      }
    } else {
      atomicRegenerationDryRunPassed = false;
    }
  }

  return {
    schemaVersion: PHASE6_GOVERNANCE_SCHEMA_VERSION,
    valid: errors.length === 0,
    checkedAt: now.toISOString(),
    checks: {
      staticCatalogValid: catalogVal.valid,
      proposalsChecked,
      quarantineReleasesChecked,
      auditEventsChecked,
      auditTrailValid,
      piiAndSecretScanClean: piiClean,
      atomicRegenerationDryRunPassed
    },
    errors
  };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const args = process.argv.slice(2);
  let dataDir: string | undefined;
  let governanceDir: string | undefined;
  let baseAuditLogPath: string | undefined;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--data-dir' && args[i + 1]) dataDir = args[++i];
    else if (args[i] === '--governance-dir' && args[i + 1]) governanceDir = args[++i];
    else if (args[i] === '--base-audit-log' && args[i + 1]) baseAuditLogPath = args[++i];
    else if (args[i] === '--json') jsonOutput = true;
  }

  const report = validateEditorialPullRequest({
    dataDir,
    governanceDir,
    baseAuditLogPath
  });

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const c = report.checks;
    console.log('===============================================================');
    console.log(report.valid ? '✅ EDITORIAL PULL REQUEST VALIDATION PASSED' : '❌ EDITORIAL PULL REQUEST VALIDATION FAILED (MERGE BLOCKED)');
    console.log(`- Static Catalog Valid:        ${c.staticCatalogValid}`);
    console.log(`- Proposals Validated:         ${c.proposalsChecked}`);
    console.log(`- Quarantine Releases Checked: ${c.quarantineReleasesChecked}`);
    console.log(`- Audit Trail Events:          ${c.auditEventsChecked} (valid=${c.auditTrailValid})`);
    console.log(`- PII & Secret Scan Clean:     ${c.piiAndSecretScanClean}`);
    console.log(`- Atomic Regen Dry-Run:        ${c.atomicRegenerationDryRunPassed}`);
    if (report.errors.length > 0) {
      console.log('\nBlocking Errors:');
      for (const e of report.errors) console.log(`  - ${e}`);
    }
    console.log('===============================================================');
  }

  process.exit(report.valid ? 0 : 1);
}
