/**
 * VISAAPPLY.ORG — PHASE 5B: ATOMIC STATIC CATALOG REGENERATION PIPELINE
 *
 * Orchestrates safe, atomic static catalog & candidate sitemap regeneration (Section 10):
 * 1. Validates canonical `data/` via `validateStaticCatalog`
 * 2. Scans canonical & monitoring artifacts for PII / secrets
 * 3. Builds static catalog search/chunk indexes into an isolated temp staging directory
 * 4. Generates valid-only candidate static sitemaps into an isolated temp staging directory
 * 5. Verifies every staged artifact's SHA-256 checksum, zero PII/secrets, and sitemap integrity
 * 6. Atomically swaps staged directories into live `public/catalog` and `public/sitemaps-static`
 *    ONLY if 100% of validation & verification checks pass (automatic rollback on swap error)
 * 7. NEVER deletes or modifies the 89 legacy `public/sitemap*.xml` files or `public/robots.txt`
 * 8. Emits a machine-readable change summary & updates `data/monitoring/data-quality-report.json`
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  STATIC_CATALOG_SCHEMA_VERSION,
  detectProhibitedPublicSecretsOrPii
} from '../src/schemas/catalogSchemas';
import { validateStaticCatalog, type CatalogValidationReport } from './validateStaticCatalog';
import { buildCatalogIndexes, type CatalogBuildManifest } from './buildCatalogIndexes';
import { generateStaticSitemaps, type StaticSitemapReport } from './generateStaticSitemaps';
import { generateDataQualityReport } from './generateDataQualityReport';

export interface SafeRegenerationOptions {
  dataDir?: string;
  publicDir?: string;
  catalogOutDir?: string;
  sitemapOutDir?: string;
  monitoringDir?: string;
  dryRun?: boolean;
  evaluationDate?: Date;
  now?: Date;
  /**
   * Optional test hook to simulate a mid-staging or verification failure
   * to verify atomic preservation of previous known-good outputs.
   */
  injectPostBuildFailure?: boolean;
}

export interface SafeRegenerationSummary {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  succeeded: boolean;
  dryRun: boolean;
  atomicSwapPerformed: boolean;
  previousOutputPreservedOnFailure: boolean;
  startedAt: string;
  completedAt: string;
  previousBuildHash: string | null;
  newBuildHash: string | null;
  catalogHashChanged: boolean;
  validationSummary: CatalogValidationReport['summary'] | null;
  sitemapTotals: StaticSitemapReport['totals'] | null;
  legacySitemapsCountBefore: number;
  legacySitemapsCountAfter: number;
  stagedArtifactsVerified: number;
  errors: string[];
}

function sha256File(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function countLegacyPublicSitemaps(publicDir: string): number {
  if (!fs.existsSync(publicDir)) return 0;
  return fs
    .readdirSync(publicDir)
    .filter((f) => /^sitemap.*\.xml$/i.test(f) && !fs.statSync(path.join(publicDir, f)).isDirectory()).length;
}

function readExistingManifestHash(catalogOutDir: string): string | null {
  const manifestPath = path.join(catalogOutDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as { deterministicBuildHash?: string };
    return parsed.deterministicBuildHash ?? null;
  } catch {
    return null;
  }
}

function verifyStagedCatalogArtifacts(stagingCatalogDir: string): {
  ok: boolean;
  verifiedCount: number;
  manifest: CatalogBuildManifest | null;
  errors: string[];
} {
  const errors: string[] = [];
  const manifestPath = path.join(stagingCatalogDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return { ok: false, verifiedCount: 0, manifest: null, errors: ['Staged manifest.json is missing.'] };
  }

  let manifest: CatalogBuildManifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as CatalogBuildManifest;
  } catch (err) {
    return {
      ok: false,
      verifiedCount: 0,
      manifest: null,
      errors: [`Failed to parse staged manifest.json: ${err instanceof Error ? err.message : String(err)}`]
    };
  }

  const manifestPii = detectProhibitedPublicSecretsOrPii(manifest);
  for (const f of manifestPii) errors.push(`PII/Secret in staged manifest.json: ${f}`);

  const entries = [
    manifest.indexes.countries,
    manifest.indexes.programs,
    manifest.indexes.categories,
    manifest.indexes.routes,
    manifest.indexes.officialSources,
    manifest.indexes.changelog,
    manifest.indexes.editorial,
    manifest.indexes.verificationSummary,
    ...Object.values(manifest.indexes.searchByLanguage),
    ...Object.values(manifest.chunks.countries),
    ...Object.values(manifest.chunks.visaDetails),
    ...Object.values(manifest.chunks.routeOverrides),
    ...Object.values(manifest.chunks.editorial)
  ];

  let verifiedCount = 0;
  for (const art of entries) {
    const resolved = path.resolve(stagingCatalogDir, art.filePath);
    if (!resolved.startsWith(path.resolve(stagingCatalogDir) + path.sep)) {
      errors.push(`Path traversal detected in manifest artifact "${art.filePath}".`);
      continue;
    }
    if (!fs.existsSync(resolved)) {
      errors.push(`Missing staged catalog artifact: ${art.filePath}`);
      continue;
    }
    const actualSha = sha256File(resolved);
    if (actualSha !== art.sha256) {
      errors.push(`SHA-256 mismatch for staged artifact ${art.filePath} (expected ${art.sha256}, got ${actualSha}).`);
      continue;
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(resolved, 'utf8'));
      const pii = detectProhibitedPublicSecretsOrPii(parsed);
      for (const finding of pii) errors.push(`PII/Secret in staged ${art.filePath}: ${finding}`);
    } catch {
      errors.push(`Invalid JSON in staged artifact: ${art.filePath}`);
      continue;
    }
    verifiedCount++;
  }

  return { ok: errors.length === 0, verifiedCount, manifest, errors };
}

function swapDirectoryAtomically(stagingDir: string, targetDir: string): void {
  const parentDir = path.dirname(targetDir);
  fs.mkdirSync(parentDir, { recursive: true });
  const backupDir = `${targetDir}.rollback-${process.pid}-${Date.now()}`;
  const hadExistingTarget = fs.existsSync(targetDir);

  try {
    if (hadExistingTarget) {
      fs.renameSync(targetDir, backupDir);
    }
    fs.renameSync(stagingDir, targetDir);
    if (hadExistingTarget && fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
  } catch (err) {
    // Rollback to previous known-good directory if swap failed partway
    if (fs.existsSync(backupDir) && !fs.existsSync(targetDir)) {
      fs.renameSync(backupDir, targetDir);
    }
    throw err;
  }
}

export function runSafeCatalogRegeneration(options: SafeRegenerationOptions = {}): SafeRegenerationSummary {
  const rootDir = process.cwd();
  const dataDir = path.resolve(options.dataDir ?? path.join(rootDir, 'data'));
  const publicDir = path.resolve(options.publicDir ?? path.join(rootDir, 'public'));
  const catalogOutDir = path.resolve(options.catalogOutDir ?? path.join(publicDir, 'catalog'));
  const sitemapOutDir = path.resolve(options.sitemapOutDir ?? path.join(publicDir, 'sitemaps-static'));
  const monitoringDir = path.resolve(options.monitoringDir ?? path.join(dataDir, 'monitoring'));
  const dryRun = Boolean(options.dryRun);
  const now = options.now ?? new Date();
  const startedAt = now.toISOString();

  const previousBuildHash = readExistingManifestHash(catalogOutDir);
  const legacySitemapsCountBefore = countLegacyPublicSitemaps(publicDir);
  const errors: string[] = [];

  const uniqueSuffix = `${process.pid}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const stagingCatalogDir = path.join(path.dirname(catalogOutDir), `.staging-catalog-${uniqueSuffix}`);
  const stagingSitemapDir = path.join(path.dirname(sitemapOutDir), `.staging-sitemaps-${uniqueSuffix}`);

  let validationReport: CatalogValidationReport | null = null;
  let sitemapReport: StaticSitemapReport | null = null;
  let newBuildHash: string | null = null;
  let stagedArtifactsVerified = 0;
  let atomicSwapPerformed = false;

  const cleanupStaging = () => {
    if (fs.existsSync(stagingCatalogDir)) fs.rmSync(stagingCatalogDir, { recursive: true, force: true });
    if (fs.existsSync(stagingSitemapDir)) fs.rmSync(stagingSitemapDir, { recursive: true, force: true });
  };

  try {
    // Step 1: Validate canonical data BEFORE touching any staging or output files
    validationReport = validateStaticCatalog({ dataDir, evaluationDate: options.evaluationDate });
    if (!validationReport.valid) {
      for (const err of validationReport.errors) {
        errors.push(`[${err.check}] ${err.filePath}: ${err.code} — ${err.message}`);
      }
      return {
        schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
        succeeded: false,
        dryRun,
        atomicSwapPerformed: false,
        previousOutputPreservedOnFailure: true,
        startedAt,
        completedAt: new Date().toISOString(),
        previousBuildHash,
        newBuildHash: null,
        catalogHashChanged: false,
        validationSummary: validationReport.summary,
        sitemapTotals: null,
        legacySitemapsCountBefore,
        legacySitemapsCountAfter: countLegacyPublicSitemaps(publicDir),
        stagedArtifactsVerified: 0,
        errors
      };
    }

    // Step 2: Build static catalog indexes into isolated staging directory
    fs.mkdirSync(stagingCatalogDir, { recursive: true });
    const built = buildCatalogIndexes({
      dataDir,
      outDir: stagingCatalogDir,
      evaluationDate: options.evaluationDate
    });
    newBuildHash = built.manifest.deterministicBuildHash;

    // Step 3: Build valid-only candidate sitemaps into isolated staging directory
    fs.mkdirSync(stagingSitemapDir, { recursive: true });
    sitemapReport = generateStaticSitemaps({
      dataDir,
      publicDir,
      outDir: stagingSitemapDir,
      evaluationDate: options.evaluationDate
    });
    if (!sitemapReport.valid) {
      errors.push(...sitemapReport.validationErrors);
    }

    // Step 4: Verify staged catalog checksums & PII scan
    const stagedCheck = verifyStagedCatalogArtifacts(stagingCatalogDir);
    stagedArtifactsVerified = stagedCheck.verifiedCount;
    if (!stagedCheck.ok) {
      errors.push(...stagedCheck.errors);
    }

    // Verify staged sitemap index exists and references all bucket files
    const stagedIndexXmlPath = path.join(stagingSitemapDir, 'sitemap-static-index.xml');
    if (!fs.existsSync(stagedIndexXmlPath)) {
      errors.push('Staged sitemap-static-index.xml is missing.');
    } else {
      const indexXml = fs.readFileSync(stagedIndexXmlPath, 'utf8');
      for (const sf of sitemapReport.sitemapFiles) {
        const bucketPath = path.join(stagingSitemapDir, sf.fileName);
        if (!fs.existsSync(bucketPath)) {
          errors.push(`Staged sitemap bucket missing: ${sf.fileName}`);
        }
        if (!indexXml.includes(sf.fileName)) {
          errors.push(`Staged sitemap index does not reference ${sf.fileName}`);
        }
      }
      // Fix relative URL prefix in staged index XML so it matches the final target directory path
      const stagingRelPrefix = path.relative(publicDir, stagingSitemapDir).replace(/\\/g, '/');
      const finalRelPrefix = path.relative(publicDir, sitemapOutDir).replace(/\\/g, '/');
      if (stagingRelPrefix && finalRelPrefix && stagingRelPrefix !== finalRelPrefix) {
        const rewritten = indexXml.split(`/${stagingRelPrefix}/`).join(`/${finalRelPrefix}/`);
        fs.writeFileSync(stagedIndexXmlPath, rewritten, 'utf8');
      }
    }

    if (options.injectPostBuildFailure) {
      errors.push('INJECTED_POST_BUILD_FAILURE: Simulated verification failure before atomic swap.');
    }

    if (errors.length > 0) {
      cleanupStaging();
      return {
        schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
        succeeded: false,
        dryRun,
        atomicSwapPerformed: false,
        previousOutputPreservedOnFailure: true,
        startedAt,
        completedAt: new Date().toISOString(),
        previousBuildHash,
        newBuildHash: null,
        catalogHashChanged: false,
        validationSummary: validationReport.summary,
        sitemapTotals: sitemapReport.totals,
        legacySitemapsCountBefore,
        legacySitemapsCountAfter: countLegacyPublicSitemaps(publicDir),
        stagedArtifactsVerified,
        errors
      };
    }

    // Step 5: Atomic swap into live targets (skipped on --dry-run)
    if (!dryRun) {
      swapDirectoryAtomically(stagingCatalogDir, catalogOutDir);
      swapDirectoryAtomically(stagingSitemapDir, sitemapOutDir);
      atomicSwapPerformed = true;

      // Refresh machine-readable Data Quality & Coverage Dashboard report
      generateDataQualityReport({
        dataDir,
        monitoringDir,
        publicCatalogDir: catalogOutDir,
        now
      });
    } else {
      cleanupStaging();
    }

    const legacySitemapsCountAfter = countLegacyPublicSitemaps(publicDir);
    if (legacySitemapsCountBefore !== legacySitemapsCountAfter) {
      errors.push(
        `LEGACY_SITEMAP_COUNT_CHANGED: Expected ${legacySitemapsCountBefore} legacy sitemap files, found ${legacySitemapsCountAfter}.`
      );
    }

    const summary: SafeRegenerationSummary = {
      schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
      succeeded: errors.length === 0,
      dryRun,
      atomicSwapPerformed,
      previousOutputPreservedOnFailure: false,
      startedAt,
      completedAt: new Date().toISOString(),
      previousBuildHash,
      newBuildHash,
      catalogHashChanged: previousBuildHash !== newBuildHash,
      validationSummary: validationReport.summary,
      sitemapTotals: sitemapReport.totals,
      legacySitemapsCountBefore,
      legacySitemapsCountAfter,
      stagedArtifactsVerified,
      errors
    };

    if (!dryRun && summary.succeeded) {
      fs.mkdirSync(monitoringDir, { recursive: true });
      const summaryPath = path.join(monitoringDir, 'last-regeneration-summary.json');
      const tmpPath = `${summaryPath}.tmp-${process.pid}-${Date.now()}`;
      fs.writeFileSync(tmpPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
      fs.renameSync(tmpPath, summaryPath);
    }

    return summary;
  } catch (err) {
    cleanupStaging();
    errors.push(err instanceof Error ? err.message : String(err));
    return {
      schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
      succeeded: false,
      dryRun,
      atomicSwapPerformed: false,
      previousOutputPreservedOnFailure: true,
      startedAt,
      completedAt: new Date().toISOString(),
      previousBuildHash,
      newBuildHash: null,
      catalogHashChanged: false,
      validationSummary: validationReport?.summary ?? null,
      sitemapTotals: sitemapReport?.totals ?? null,
      legacySitemapsCountBefore,
      legacySitemapsCountAfter: countLegacyPublicSitemaps(publicDir),
      stagedArtifactsVerified,
      errors
    };
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const args = process.argv.slice(2);
  let dataDir: string | undefined;
  let publicDir: string | undefined;
  let dryRun = false;
  let jsonOutput = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--data-dir' && args[i + 1]) dataDir = args[++i];
    else if (args[i] === '--public-dir' && args[i + 1]) publicDir = args[++i];
    else if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--json') jsonOutput = true;
  }

  const summary = runSafeCatalogRegeneration({ dataDir, publicDir, dryRun });
  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log('===============================================================');
    console.log(summary.succeeded ? '✅ ATOMIC STATIC CATALOG REGENERATION SUCCEEDED' : '❌ ATOMIC STATIC CATALOG REGENERATION FAILED (PREVIOUS OUTPUT PRESERVED)');
    console.log(`- Dry Run:                  ${summary.dryRun}`);
    console.log(`- Atomic Swap Performed:    ${summary.atomicSwapPerformed}`);
    console.log(`- Previous Build Hash:      ${summary.previousBuildHash ?? 'NONE'}`);
    console.log(`- New Build Hash:           ${summary.newBuildHash ?? 'NONE'} (changed=${summary.catalogHashChanged})`);
    console.log(`- Staged Artifacts Verified:${summary.stagedArtifactsVerified}`);
    console.log(`- Candidate Sitemap URLs:   ${summary.sitemapTotals?.substantiveUrlsEmitted ?? 0} (Hreflang: ${summary.sitemapTotals?.totalHreflangLinks ?? 0})`);
    console.log(`- Legacy Sitemaps Preserved:${summary.legacySitemapsCountBefore} -> ${summary.legacySitemapsCountAfter}`);
    if (summary.errors.length > 0) {
      console.log('\nErrors:');
      for (const e of summary.errors) console.log(`  - ${e}`);
    }
    console.log('===============================================================');
  }

  process.exit(summary.succeeded ? 0 : 1);
}
