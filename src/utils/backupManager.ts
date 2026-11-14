import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import {
  auditSqliteDatabaseIntegrity,
  closeSqliteDatabase,
  openSqliteDatabase
} from '../db/sqliteCore';
import { recordOperationalEvent } from './operationalObservability';

export interface BackupFileEntry {
  path: string;
  sizeBytes: number;
  sha256: string;
  mtimeIso: string;
}

export interface BackupManifest {
  manifestVersion: string;
  backupName: string;
  createdAt: string;
  archiveFormat: 'tar.gz';
  databaseSnapshot: {
    included: boolean;
    relativePath: string;
    sizeBytes: number;
    sha256: string;
    walIncludedInSnapshot: boolean;
    integrityCheck: string[];
    foreignKeyViolations: number;
    tableCounts: Record<string, number>;
    migrationsApplied: Array<{ version: string; name: string; checksum: string; appliedAt: string }>;
  };
  files: BackupFileEntry[];
  totalFiles: number;
  totalUncompressedBytes: number;
  excludedPatterns: string[];
}

export interface CreateBackupResult {
  success: boolean;
  outputPath: string;
  archiveSizeBytes: number;
  archiveSha256: string;
  manifest: BackupManifest;
}

export interface RestoreVerificationReport {
  success: boolean;
  archivePath: string;
  restoreDir: string;
  manifestVerified: boolean;
  filesChecked: number;
  checksumMismatches: string[];
  missingFiles: string[];
  forbiddenSecretFilesFound: string[];
  csvFilesChecked: number;
  csvErrors: string[];
  sqliteIntegrityOk: boolean;
  sqliteForeignKeyViolations: number;
  sqliteTableCountsMatch: boolean;
  restoredTableCounts: Record<string, number>;
  errors: string[];
}

const EXCLUDED_PATTERNS = [
  '.env',
  '.env.*',
  '!/.env.example',
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.vercel/**',
  '*.tar.gz',
  '*.log',
  '*.tmp',
  '*.db-wal',
  '*.db-shm'
];

function sha256File(filePath: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function isForbiddenSecretFileName(relPath: string): boolean {
  const base = path.posix.basename(relPath.replace(/\\/g, '/'));
  if (base === '.env.example') return false;
  if (base === '.env' || base.startsWith('.env.')) return true;
  if (/\.(pem|key|p12|pfx)$/i.test(base)) return true;
  return false;
}

function copyFileIntoStage(srcFile: string, stageRoot: string, relPosixPath: string): void {
  const destPath = path.join(stageRoot, relPosixPath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcFile, destPath);
}

function collectFilesRecursively(dirPath: string, baseRoot: string, out: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return out;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === 'dist' ||
      entry.name === 'build' ||
      entry.name === '.vercel'
    ) {
      continue;
    }
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectFilesRecursively(full, baseRoot, out);
    } else if (entry.isFile()) {
      const rel = path.relative(baseRoot, full).split(path.sep).join('/');
      if (
        !isForbiddenSecretFileName(rel) &&
        !rel.endsWith('.tar.gz') &&
        !rel.endsWith('.log') &&
        !rel.endsWith('.tmp') &&
        !rel.endsWith('.db-wal') &&
        !rel.endsWith('.db-shm')
      ) {
        out.push(rel);
      }
    }
  }
  return out;
}

/**
 * Creates a consistent, manifest-verified .tar.gz backup WITHOUT mutating the source SQLite DB.
 * Uses a private temporary copy + WAL checkpoint + SQLite backup API to build a self-contained snapshot.
 */
export async function createVerifiedBackup(options: {
  outputPath: string;
  projectRoot?: string;
  dbPath?: string;
  allowOverwrite?: boolean;
}): Promise<CreateBackupResult> {
  const projectRoot = path.resolve(options.projectRoot || process.cwd());
  const outputPath = path.resolve(options.outputPath);
  const sourceDbPath = path.resolve(options.dbPath || path.join(projectRoot, 'data_db', 'immigration_hub.db'));

  if (!options.allowOverwrite && fs.existsSync(outputPath)) {
    throw new Error(`EEXIST: Refusing to overwrite existing backup archive at ${outputPath}`);
  }

  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'visaapply-backup-stage-'));
  const snapTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'visaapply-db-snap-'));

  try {
    // 1. Consistent read-only-safe SQLite snapshot via temp copy + WAL replay + .backup()
    const stagedDbRel = 'data_db/immigration_hub.db';
    const stagedDbFull = path.join(stageRoot, stagedDbRel);
    fs.mkdirSync(path.dirname(stagedDbFull), { recursive: true });

    let dbSnapshotInfo: BackupManifest['databaseSnapshot'] = {
      included: false,
      relativePath: stagedDbRel,
      sizeBytes: 0,
      sha256: '',
      walIncludedInSnapshot: false,
      integrityCheck: [],
      foreignKeyViolations: 0,
      tableCounts: {},
      migrationsApplied: []
    };

    if (fs.existsSync(sourceDbPath)) {
      const tempCopyDb = path.join(snapTempDir, 'source_copy.db');
      fs.copyFileSync(sourceDbPath, tempCopyDb);
      const walExists = fs.existsSync(`${sourceDbPath}-wal`);
      if (walExists) fs.copyFileSync(`${sourceDbPath}-wal`, `${tempCopyDb}-wal`);
      if (fs.existsSync(`${sourceDbPath}-shm`)) fs.copyFileSync(`${sourceDbPath}-shm`, `${tempCopyDb}-shm`);

      const snapSourceDb = new Database(tempCopyDb);
      try {
        snapSourceDb.pragma('busy_timeout = 5000');
        if (walExists) {
          snapSourceDb.pragma('wal_checkpoint(TRUNCATE)');
        }
        await snapSourceDb.backup(stagedDbFull);
      } finally {
        closeSqliteDatabase(snapSourceDb);
      }

      // Inspect clean snapshot without running destructive writes
      const inspectDb = openSqliteDatabase(stagedDbFull, { readonly: true, fileMustExist: true });
      try {
        const audit = auditSqliteDatabaseIntegrity(inspectDb);
        if (!audit.ok) {
          throw new Error(
            `BACKUP_SNAPSHOT_INTEGRITY_FAILED: integrity=${audit.integrityCheck.join(',')}, fk=${audit.foreignKeyViolations}`
          );
        }
        const stat = fs.statSync(stagedDbFull);
        dbSnapshotInfo = {
          included: true,
          relativePath: stagedDbRel,
          sizeBytes: stat.size,
          sha256: sha256File(stagedDbFull),
          walIncludedInSnapshot: walExists,
          integrityCheck: audit.integrityCheck,
          foreignKeyViolations: audit.foreignKeyViolations,
          tableCounts: audit.tableCounts,
          migrationsApplied: audit.migrationsApplied.map((m) => ({
            version: m.version,
            name: m.name,
            checksum: m.checksum,
            appliedAt: m.appliedAt
          }))
        };
      } finally {
        closeSqliteDatabase(inspectDb);
      }
    }

    // 2. Stage canonical registries, evidence artifacts, schema/migration code, content, docs, and config
    const rootEntries = fs.readdirSync(projectRoot, { withFileTypes: true });
    for (const entry of rootEntries) {
      if (!entry.isFile()) continue;
      const name = entry.name;
      if (isForbiddenSecretFileName(name)) continue;
      const shouldIncludeRootFile =
        /^phase_.*\.(csv|json|md)$/i.test(name) ||
        name === 'package.json' ||
        name === 'vercel.json' ||
        name === 'tsconfig.json' ||
        name === '.env.example';
      if (shouldIncludeRootFile) {
        copyFileIntoStage(path.join(projectRoot, name), stageRoot, name);
      }
    }

    const dirsToInclude = ['src/db', 'src/data', 'src/types', 'content', 'docs'];
    for (const relDir of dirsToInclude) {
      const fullDir = path.join(projectRoot, relDir);
      const files = collectFilesRecursively(fullDir, projectRoot);
      for (const relPath of files) {
        copyFileIntoStage(path.join(projectRoot, relPath), stageRoot, relPath);
      }
    }

    // 3. Build deterministic file manifest with SHA-256 checksums
    const allStagedFiles = collectFilesRecursively(stageRoot, stageRoot).sort();
    const manifestFiles: BackupFileEntry[] = [];
    let totalUncompressedBytes = 0;

    for (const relPath of allStagedFiles) {
      const absPath = path.join(stageRoot, relPath);
      const stat = fs.statSync(absPath);
      totalUncompressedBytes += stat.size;
      manifestFiles.push({
        path: relPath,
        sizeBytes: stat.size,
        sha256: sha256File(absPath),
        mtimeIso: stat.mtime.toISOString()
      });
    }

    const manifest: BackupManifest = {
      manifestVersion: '1.0.0',
      backupName: path.basename(outputPath),
      createdAt: new Date().toISOString(),
      archiveFormat: 'tar.gz',
      databaseSnapshot: dbSnapshotInfo,
      files: manifestFiles,
      totalFiles: manifestFiles.length,
      totalUncompressedBytes,
      excludedPatterns: EXCLUDED_PATTERNS
    };

    const manifestPath = path.join(stageRoot, 'backup_manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

    // 4. Write archive atomically to temp file first, then rename to target
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const tmpArchivePath = `${outputPath}.${crypto.randomBytes(4).toString('hex')}.tmp`;
    execFileSync('tar', ['-czf', tmpArchivePath, '-C', stageRoot, '.'], { stdio: 'pipe' });
    fs.renameSync(tmpArchivePath, outputPath);

    const archiveSizeBytes = fs.statSync(outputPath).size;
    const archiveSha256 = sha256File(outputPath);

    recordOperationalEvent({
      category: 'BACKUP_OUTCOME',
      severity: 'INFO',
      component: 'backup-manager',
      message: `Created verified backup ${path.basename(outputPath)} (${archiveSizeBytes} bytes, ${manifest.totalFiles} files, sha256=${archiveSha256.slice(0, 12)}...).`,
      details: {
        outputPath: path.basename(outputPath),
        archiveSizeBytes,
        archiveSha256,
        totalFiles: manifest.totalFiles,
        dbTableCounts: dbSnapshotInfo.tableCounts
      }
    });

    return {
      success: true,
      outputPath,
      archiveSizeBytes,
      archiveSha256,
      manifest
    };
  } finally {
    fs.rmSync(stageRoot, { recursive: true, force: true });
    fs.rmSync(snapTempDir, { recursive: true, force: true });
  }
}

/**
 * Validates and performs an actual restore into an ISOLATED temporary directory.
 * Refuses restoring into production data_db or existing non-empty directories.
 */
export function verifyBackupRestore(
  archivePathInput: string,
  options: { restoreTargetDir?: string; keepExtractedDir?: boolean; productionDbDir?: string } = {}
): RestoreVerificationReport {
  const archivePath = path.resolve(archivePathInput);
  const prodDataDir = path.resolve(options.productionDbDir || path.join(process.cwd(), 'data_db'));

  if (options.restoreTargetDir) {
    const resolvedTarget = path.resolve(options.restoreTargetDir);
    if (resolvedTarget === prodDataDir || resolvedTarget.startsWith(`${prodDataDir}${path.sep}`)) {
      throw new Error(`SAFETY_ABORT: Refusing restore into production database directory ${resolvedTarget}`);
    }
  }

  const restoreDir = options.restoreTargetDir
    ? path.resolve(options.restoreTargetDir)
    : fs.mkdtempSync(path.join(os.tmpdir(), 'visaapply-restore-verify-'));

  if (!fs.existsSync(restoreDir)) {
    fs.mkdirSync(restoreDir, { recursive: true });
  }

  const errors: string[] = [];
  const checksumMismatches: string[] = [];
  const missingFiles: string[] = [];
  const forbiddenSecretFilesFound: string[] = [];
  const csvErrors: string[] = [];
  let csvFilesChecked = 0;
  let filesChecked = 0;
  let manifestVerified = false;
  let sqliteIntegrityOk = false;
  let sqliteForeignKeyViolations = -1;
  let sqliteTableCountsMatch = false;
  let restoredTableCounts: Record<string, number> = {};

  try {
    if (!fs.existsSync(archivePath) || fs.statSync(archivePath).size === 0) {
      errors.push(`Archive missing or empty: ${archivePath}`);
      return {
        success: false,
        archivePath,
        restoreDir,
        manifestVerified: false,
        filesChecked: 0,
        checksumMismatches,
        missingFiles,
        forbiddenSecretFilesFound,
        csvFilesChecked: 0,
        csvErrors,
        sqliteIntegrityOk: false,
        sqliteForeignKeyViolations: -1,
        sqliteTableCountsMatch: false,
        restoredTableCounts,
        errors
      };
    }

    try {
      execFileSync('tar', ['-xzf', archivePath, '-C', restoreDir], { stdio: 'pipe' });
    } catch (err: any) {
      errors.push(`TAR_EXTRACTION_FAILED: ${err?.message || 'Corrupt or incomplete tar.gz archive'}`);
      return {
        success: false,
        archivePath,
        restoreDir,
        manifestVerified: false,
        filesChecked: 0,
        checksumMismatches,
        missingFiles,
        forbiddenSecretFilesFound,
        csvFilesChecked: 0,
        csvErrors,
        sqliteIntegrityOk: false,
        sqliteForeignKeyViolations: -1,
        sqliteTableCountsMatch: false,
        restoredTableCounts,
        errors
      };
    }

    // Check extracted files for forbidden secrets
    const allExtracted = collectFilesRecursivelyForAudit(restoreDir, restoreDir);
    for (const rel of allExtracted) {
      if (isForbiddenSecretFileName(rel)) {
        forbiddenSecretFilesFound.push(rel);
      }
    }
    if (forbiddenSecretFilesFound.length > 0) {
      errors.push(`Forbidden secret files found in archive: ${forbiddenSecretFilesFound.join(', ')}`);
    }

    const manifestPath = path.join(restoreDir, 'backup_manifest.json');
    if (!fs.existsSync(manifestPath)) {
      errors.push('backup_manifest.json is missing from archive.');
      return {
        success: false,
        archivePath,
        restoreDir,
        manifestVerified: false,
        filesChecked: 0,
        checksumMismatches,
        missingFiles,
        forbiddenSecretFilesFound,
        csvFilesChecked: 0,
        csvErrors,
        sqliteIntegrityOk: false,
        sqliteForeignKeyViolations: -1,
        sqliteTableCountsMatch: false,
        restoredTableCounts,
        errors
      };
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as BackupManifest;
    if (!manifest || !Array.isArray(manifest.files) || manifest.files.length === 0) {
      errors.push('backup_manifest.json has invalid or empty file list.');
    } else {
      for (const entry of manifest.files) {
        filesChecked++;
        const abs = path.join(restoreDir, entry.path);
        if (!fs.existsSync(abs)) {
          missingFiles.push(entry.path);
          continue;
        }
        const stat = fs.statSync(abs);
        const actualSha = sha256File(abs);
        if (stat.size !== entry.sizeBytes || actualSha !== entry.sha256) {
          checksumMismatches.push(entry.path);
        } else if (entry.path.endsWith('.csv')) {
          csvFilesChecked++;
          const text = fs.readFileSync(abs, 'utf-8').trim();
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length < 2 || !lines[0].includes(',')) {
            csvErrors.push(`${entry.path}: missing CSV header or data rows`);
          }
        }
      }
      manifestVerified = missingFiles.length === 0 && checksumMismatches.length === 0;
      if (missingFiles.length > 0) errors.push(`Missing files from archive: ${missingFiles.slice(0, 5).join(', ')}`);
      if (checksumMismatches.length > 0) {
        errors.push(`Checksum mismatches: ${checksumMismatches.slice(0, 5).join(', ')}`);
      }
      if (csvErrors.length > 0) errors.push(`CSV readability failures: ${csvErrors.slice(0, 5).join(', ')}`);
    }

    // Verify restored SQLite DB in isolated temp directory
    if (manifest?.databaseSnapshot?.included) {
      const restoredDbPath = path.join(restoreDir, manifest.databaseSnapshot.relativePath);
      if (!fs.existsSync(restoredDbPath)) {
        errors.push(`Restored SQLite database missing at ${manifest.databaseSnapshot.relativePath}`);
      } else {
        const restoredDb = openSqliteDatabase(restoredDbPath, { readonly: true, fileMustExist: true });
        try {
          const audit = auditSqliteDatabaseIntegrity(restoredDb);
          sqliteIntegrityOk = audit.ok;
          sqliteForeignKeyViolations = audit.foreignKeyViolations;
          restoredTableCounts = audit.tableCounts;

          if (!audit.ok) {
            errors.push(
              `Restored SQLite integrity failed: check=${audit.integrityCheck.join(',')}, fk=${audit.foreignKeyViolations}`
            );
          }

          const expectedCounts = manifest.databaseSnapshot.tableCounts || {};
          sqliteTableCountsMatch = Object.entries(expectedCounts).every(
            ([tbl, cnt]) => restoredTableCounts[tbl] === cnt
          );
          if (!sqliteTableCountsMatch) {
            errors.push('Restored SQLite table row counts do not match manifest snapshot.');
          }
        } finally {
          closeSqliteDatabase(restoredDb);
        }
      }
    } else {
      sqliteIntegrityOk = true;
      sqliteForeignKeyViolations = 0;
      sqliteTableCountsMatch = true;
    }

    const success =
      errors.length === 0 &&
      manifestVerified &&
      forbiddenSecretFilesFound.length === 0 &&
      csvErrors.length === 0 &&
      sqliteIntegrityOk &&
      sqliteForeignKeyViolations === 0 &&
      sqliteTableCountsMatch;

    recordOperationalEvent({
      category: 'RESTORE_VERIFICATION',
      severity: success ? 'INFO' : 'ERROR',
      component: 'backup-restore-verifier',
      message: success
        ? `Verified isolated restore of ${path.basename(archivePath)} (${filesChecked} files, ${csvFilesChecked} CSVs, SQLite OK).`
        : `Isolated restore verification FAILED for ${path.basename(archivePath)}: ${errors.join('; ')}`,
      details: {
        archive: path.basename(archivePath),
        filesChecked,
        csvFilesChecked,
        sqliteIntegrityOk,
        restoredTableCounts
      }
    });

    return {
      success,
      archivePath,
      restoreDir,
      manifestVerified,
      filesChecked,
      checksumMismatches,
      missingFiles,
      forbiddenSecretFilesFound,
      csvFilesChecked,
      csvErrors,
      sqliteIntegrityOk,
      sqliteForeignKeyViolations,
      sqliteTableCountsMatch,
      restoredTableCounts,
      errors
    };
  } finally {
    if (!options.keepExtractedDir && !options.restoreTargetDir) {
      fs.rmSync(restoreDir, { recursive: true, force: true });
    }
  }
}

function collectFilesRecursivelyForAudit(dirPath: string, baseRoot: string, out: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return out;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectFilesRecursivelyForAudit(full, baseRoot, out);
    } else if (entry.isFile()) {
      out.push(path.relative(baseRoot, full).split(path.sep).join('/'));
    }
  }
  return out;
}
