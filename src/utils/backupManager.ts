import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import matter from 'gray-matter';
import {
  SQLITE_MIGRATIONS,
  auditSqliteDatabaseIntegrity,
  closeSqliteDatabase,
  openSqliteDatabase,
  runTrackedSqliteMigrations
} from '../db/sqliteCore';
import { recordOperationalEvent } from './operationalObservability';

export const EXPECTED_CORE_SQLITE_TABLES = [
  'batch_state',
  'immigration_programs',
  'changelog_entries',
  'cron_execution_logs',
  'visa_details',
  'visa_detail_claims',
  'visa_detail_evidence',
  'visa_detail_versions',
  'automation_job_locks',
  'automation_checkpoints',
  'automation_dead_letter',
  'operational_events',
  'schema_migrations'
] as const;

export const EXPECTED_SQLITE_MIGRATION_VERSIONS = [
  '001_baseline_enrichment_tables',
  '002_phase31_comprehensive_and_classification',
  '003_phase44_operational_reliability_and_constraints'
] as const;

export const DELETED_PHASE_32_FIXTURE_EXACT_IDS = [
  'test-phase-3-2-prog',
  'test-p322-temp-001',
  'test-p322-temp-002',
  'pg-test-2106',
  'empty-test'
] as const;

export const DELETED_PHASE_32_FIXTURE_PREFIXES = [
  'test-phase-3-2-',
  'test-p322-',
  'vd-test-phase-3-2-',
  'vd-test-p322-',
  'clm-p322-',
  'ev-p322-',
  'clm-neon-p322-',
  'ev-neon-p322-',
  'claim-32-',
  'ev-32-',
  'ver-32-pre-'
] as const;

export const TABLE_PRIMARY_KEY_COLUMNS: Record<string, string> = {
  batch_state: 'id',
  immigration_programs: 'id',
  changelog_entries: 'id',
  cron_execution_logs: 'id',
  visa_details: 'id',
  visa_detail_claims: 'id',
  visa_detail_evidence: 'id',
  visa_detail_versions: 'id',
  automation_job_locks: 'lock_key',
  automation_checkpoints: 'checkpoint_id',
  automation_dead_letter: 'id',
  operational_events: 'id',
  schema_migrations: 'version'
};

export interface BackupFileEntry {
  path: string;
  sizeBytes: number;
  sha256: string;
  mtimeIso: string;
}

export interface NonSqliteSourceInventory {
  changelogJson: {
    path: string;
    exists: boolean;
    validJson: boolean;
    entryCount: number;
    sha256: string;
  };
  slotSubscribersJson: {
    path: string;
    exists: boolean;
    validJson: boolean;
    subscriberCount: number;
    piiRedacted: true;
    sha256: string;
  };
  slotStatusJson: {
    path: string;
    exists: boolean;
    validJson: boolean;
    embassyCount: number;
    lastCheckTime: string | null;
    sha256: string;
  };
  immigrationSyncStateJson: {
    path: string;
    exists: boolean;
    validJson: boolean;
    status: 'LEGACY_SUPERSEDED';
    supersededBy: string[];
    sha256: string;
  };
  publishedMarkdown: {
    directory: string;
    count: number;
    articles: Array<{ slug: string; path: string; sha256: string }>;
  };
  draftMarkdown: {
    directory: string;
    count: number;
    articles: Array<{ slug: string; path: string; sha256: string }>;
  };
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
    sourceFilesObserved: {
      dbBytes: number;
      walBytes: number;
      shmBytes: number;
      dbSha256: string;
      walSha256: string | null;
      shmSha256: string | null;
    };
    rawSourceInventory: {
      tablesPresent: string[];
      tableCounts: Record<string, number>;
      migrationsRecordedOnDisk: string[];
      schemaNormalizedOnIsolatedCopy: boolean;
      newlyAppliedMigrationsOnCopy: string[];
    };
    integrityCheck: string[];
    foreignKeyViolations: number;
    duplicateVisaDetailsProgramIds: number;
    orphanCounts: {
      visaDetailsWithoutProgram: number;
      claimsWithoutProgram: number;
      evidenceWithoutClaim: number;
      versionsWithoutProgram: number;
    };
    deletedPhase32FixturesFound: string[];
    tableCounts: Record<string, number>;
    tableSha256Digests: Record<string, string>;
    migrationsApplied: Array<{ version: string; name: string; checksum: string; appliedAt: string }>;
  };
  nonSqliteInventory: NonSqliteSourceInventory;
  files: BackupFileEntry[];
  totalFiles: number;
  totalUncompressedBytes: number;
  excludedPatterns: string[];
}

export interface CreateBackupResult {
  success: boolean;
  outputPath: string;
  manifestPath?: string;
  standaloneDbPath?: string;
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
  coreTablesVerified: boolean;
  missingCoreTables: string[];
  migrationsVerified: boolean;
  missingMigrations: string[];
  tableDigestsMatch: boolean;
  digestMismatches: string[];
  duplicateChecksPassed: boolean;
  orphanChecksPassed: boolean;
  deletedFixturesAbsent: boolean;
  deletedFixturesFound: string[];
  restoredTableCounts: Record<string, number>;
  restoredTableDigests: Record<string, string>;
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
  '*.db-shm',
  '*.pem',
  '*.key',
  '*.p12',
  '*.pfx'
];

export function sha256File(filePath: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

export function sha256Text(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

export function canonicalizeJsonValue(val: unknown): unknown {
  if (val === null || val === undefined) return null;
  if (Array.isArray(val)) return val.map((v) => canonicalizeJsonValue(v));
  if (typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(val as Record<string, unknown>).sort()) {
      out[k] = canonicalizeJsonValue((val as Record<string, unknown>)[k]);
    }
    return out;
  }
  return val;
}

export function computeCanonicalRowsDigest(
  tableName: string,
  rows: Array<Record<string, unknown>>,
  primaryKeyCol: string
): string {
  const sorted = [...rows].sort((a, b) => {
    const ka = String(a[primaryKeyCol] ?? '');
    const kb = String(b[primaryKeyCol] ?? '');
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });

  // For schema_migrations, exclude volatile applied_at timestamp when verifying deterministic table content
  const normalized = sorted.map((row) => {
    const copy: Record<string, unknown> = {};
    for (const col of Object.keys(row).sort()) {
      if (tableName === 'schema_migrations' && col === 'applied_at') continue;
      copy[col] = row[col] === undefined ? null : row[col];
    }
    return copy;
  });

  return sha256Text(JSON.stringify({ table: tableName, rows: normalized }));
}

export function computeSqliteTableDigests(targetDb: Database.Database): Record<string, string> {
  const tables = targetDb
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all() as Array<{ name: string }>;

  const digests: Record<string, string> = {};
  for (const { name } of tables) {
    const pkCol = TABLE_PRIMARY_KEY_COLUMNS[name] || 'rowid';
    const cols = (targetDb.pragma(`table_info("${name}")`) as Array<{ name: string }>).map((c) => c.name);
    const orderByCol = cols.includes(pkCol) ? `"${pkCol}"` : 'rowid';
    const rows = targetDb.prepare(`SELECT * FROM "${name}" ORDER BY ${orderByCol} ASC`).all() as Array<
      Record<string, unknown>
    >;
    digests[name] = computeCanonicalRowsDigest(name, rows, cols.includes(pkCol) ? pkCol : 'rowid');
  }
  return digests;
}

export function isPhase32DeletedFixtureId(rawId: unknown): boolean {
  const id = String(rawId ?? '').trim();
  if (!id) return false;
  if ((DELETED_PHASE_32_FIXTURE_EXACT_IDS as readonly string[]).includes(id)) return true;
  return DELETED_PHASE_32_FIXTURE_PREFIXES.some((prefix) => id.startsWith(prefix));
}

export function detectDeletedPhase32FixturesInSqlite(targetDb: Database.Database): string[] {
  const found = new Set<string>();
  const checks: Array<{ table: string; column: string }> = [
    { table: 'immigration_programs', column: 'id' },
    { table: 'visa_details', column: 'id' },
    { table: 'visa_details', column: 'program_id' },
    { table: 'visa_detail_claims', column: 'id' },
    { table: 'visa_detail_claims', column: 'program_id' },
    { table: 'visa_detail_evidence', column: 'id' },
    { table: 'visa_detail_versions', column: 'id' },
    { table: 'visa_detail_versions', column: 'program_id' }
  ];

  const existingTables = new Set(
    (
      targetDb
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .all() as Array<{ name: string }>
    ).map((t) => t.name)
  );

  for (const chk of checks) {
    if (!existingTables.has(chk.table)) continue;
    const rows = targetDb.prepare(`SELECT "${chk.column}" AS val FROM "${chk.table}"`).all() as Array<{ val: unknown }>;
    for (const r of rows) {
      if (isPhase32DeletedFixtureId(r.val)) {
        found.add(`${chk.table}.${chk.column}:${String(r.val)}`);
      }
    }
  }
  return Array.from(found).sort();
}

export function checkSqliteDuplicatePrimaryKeys(targetDb: Database.Database): string[] {
  const duplicates: string[] = [];
  const existingTables = new Set(
    (
      targetDb
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        .all() as Array<{ name: string }>
    ).map((t) => t.name)
  );

  for (const [table, pk] of Object.entries(TABLE_PRIMARY_KEY_COLUMNS)) {
    if (!existingTables.has(table)) continue;
    const rows = targetDb
      .prepare(`SELECT "${pk}" AS pk, COUNT(*) AS cnt FROM "${table}" GROUP BY "${pk}" HAVING COUNT(*) > 1`)
      .all() as Array<{ pk: unknown; cnt: number }>;
    for (const r of rows) {
      duplicates.push(`${table}(${pk}=${String(r.pk)}, count=${r.cnt})`);
    }
  }
  return duplicates;
}

export function collectNonSqliteSourceInventory(projectRootInput: string): NonSqliteSourceInventory {
  const projectRoot = path.resolve(projectRootInput);

  const changelogPath = path.join(projectRoot, 'src', 'data', 'immigrationChangelog.json');
  let changelogValid = false;
  let changelogCount = 0;
  let changelogSha = '';
  if (fs.existsSync(changelogPath)) {
    changelogSha = sha256File(changelogPath);
    try {
      const parsed = JSON.parse(fs.readFileSync(changelogPath, 'utf-8'));
      if (Array.isArray(parsed)) {
        changelogValid = true;
        changelogCount = parsed.length;
      }
    } catch {
      changelogValid = false;
    }
  }

  const subsPath = path.join(projectRoot, 'content', 'slot_subscribers.json');
  let subsValid = false;
  let subsCount = 0;
  let subsSha = '';
  if (fs.existsSync(subsPath)) {
    subsSha = sha256File(subsPath);
    try {
      const parsed = JSON.parse(fs.readFileSync(subsPath, 'utf-8'));
      if (Array.isArray(parsed)) {
        subsValid = true;
        subsCount = parsed.length;
      }
    } catch {
      subsValid = false;
    }
  }

  const statusPath = path.join(projectRoot, 'content', 'slot_status.json');
  let statusValid = false;
  let embassyCount = 0;
  let lastCheckTime: string | null = null;
  let statusSha = '';
  if (fs.existsSync(statusPath)) {
    statusSha = sha256File(statusPath);
    try {
      const parsed = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
      if (parsed && typeof parsed === 'object' && parsed.embassies && typeof parsed.embassies === 'object') {
        statusValid = true;
        embassyCount = Object.keys(parsed.embassies).length;
        lastCheckTime = typeof parsed.lastCheckTime === 'string' ? parsed.lastCheckTime : null;
      }
    } catch {
      statusValid = false;
    }
  }

  const syncPath = path.join(projectRoot, 'content', 'immigration_sync_state.json');
  let syncValid = false;
  let syncSha = '';
  if (fs.existsSync(syncPath)) {
    syncSha = sha256File(syncPath);
    try {
      const parsed = JSON.parse(fs.readFileSync(syncPath, 'utf-8'));
      syncValid = Boolean(parsed && typeof parsed === 'object');
    } catch {
      syncValid = false;
    }
  }

  const collectMarkdown = (dirRel: string) => {
    const fullDir = path.join(projectRoot, dirRel);
    const articles: Array<{ slug: string; path: string; sha256: string }> = [];
    if (fs.existsSync(fullDir)) {
      const files = fs
        .readdirSync(fullDir, { withFileTypes: true })
        .filter((e) => e.isFile() && e.name.endsWith('.md'))
        .map((e) => e.name)
        .sort();
      for (const file of files) {
        const abs = path.join(fullDir, file);
        // Parse frontmatter to ensure validity without storing raw content twice
        matter(fs.readFileSync(abs, 'utf-8'));
        articles.push({
          slug: file.replace(/\.md$/i, ''),
          path: `${dirRel}/${file}`.replace(/\\/g, '/'),
          sha256: sha256File(abs)
        });
      }
    }
    return articles;
  };

  const publishedArticles = collectMarkdown('content');
  const draftArticles = collectMarkdown('content/drafts');

  return {
    changelogJson: {
      path: 'src/data/immigrationChangelog.json',
      exists: fs.existsSync(changelogPath),
      validJson: changelogValid,
      entryCount: changelogCount,
      sha256: changelogSha
    },
    slotSubscribersJson: {
      path: 'content/slot_subscribers.json',
      exists: fs.existsSync(subsPath),
      validJson: subsValid,
      subscriberCount: subsCount,
      piiRedacted: true,
      sha256: subsSha
    },
    slotStatusJson: {
      path: 'content/slot_status.json',
      exists: fs.existsSync(statusPath),
      validJson: statusValid,
      embassyCount,
      lastCheckTime,
      sha256: statusSha
    },
    immigrationSyncStateJson: {
      path: 'content/immigration_sync_state.json',
      exists: fs.existsSync(syncPath),
      validJson: syncValid,
      status: 'LEGACY_SUPERSEDED',
      supersededBy: ['batch_state', 'automation_job_locks'],
      sha256: syncSha
    },
    publishedMarkdown: {
      directory: 'content',
      count: publishedArticles.length,
      articles: publishedArticles
    },
    draftMarkdown: {
      directory: 'content/drafts',
      count: draftArticles.length,
      articles: draftArticles
    }
  };
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
 * Creates a consistent, WAL-aware, manifest-verified .tar.gz backup WITHOUT mutating the source SQLite DB.
 * Uses an isolated temporary copy (db + -wal + -shm), replays WAL, applies tracked migrations only on the
 * isolated copy if needed, runs SQLite Online Backup API (.backup()), and checks integrity & foreign keys.
 */
export async function createVerifiedBackup(options: {
  outputPath: string;
  projectRoot?: string;
  dbPath?: string;
  allowOverwrite?: boolean;
  manifestOutputPath?: string;
  standaloneDbOutputPath?: string;
}): Promise<CreateBackupResult> {
  const projectRoot = path.resolve(options.projectRoot || process.cwd());
  const outputPath = path.resolve(options.outputPath);
  const sourceDbPath = path.resolve(options.dbPath || path.join(projectRoot, 'data_db', 'immigration_hub.db'));

  if (!options.allowOverwrite && fs.existsSync(outputPath)) {
    throw new Error(`EEXIST: Refusing to overwrite existing backup archive at ${outputPath}`);
  }
  if (options.manifestOutputPath && !options.allowOverwrite && fs.existsSync(path.resolve(options.manifestOutputPath))) {
    throw new Error(`EEXIST: Refusing to overwrite existing backup manifest at ${options.manifestOutputPath}`);
  }
  if (
    options.standaloneDbOutputPath &&
    !options.allowOverwrite &&
    fs.existsSync(path.resolve(options.standaloneDbOutputPath))
  ) {
    throw new Error(`EEXIST: Refusing to overwrite existing standalone snapshot at ${options.standaloneDbOutputPath}`);
  }

  const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'visaapply-backup-stage-'));
  const snapTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'visaapply-db-snap-'));

  try {
    // 1. Consistent read-only-safe SQLite snapshot via isolated temp copy + WAL replay + .backup()
    const stagedDbRel = 'data_db/immigration_hub.db';
    const stagedDbFull = path.join(stageRoot, stagedDbRel);
    fs.mkdirSync(path.dirname(stagedDbFull), { recursive: true });

    let dbSnapshotInfo: BackupManifest['databaseSnapshot'] = {
      included: false,
      relativePath: stagedDbRel,
      sizeBytes: 0,
      sha256: '',
      walIncludedInSnapshot: false,
      sourceFilesObserved: {
        dbBytes: 0,
        walBytes: 0,
        shmBytes: 0,
        dbSha256: '',
        walSha256: null,
        shmSha256: null
      },
      rawSourceInventory: {
        tablesPresent: [],
        tableCounts: {},
        migrationsRecordedOnDisk: [],
        schemaNormalizedOnIsolatedCopy: false,
        newlyAppliedMigrationsOnCopy: []
      },
      integrityCheck: [],
      foreignKeyViolations: 0,
      duplicateVisaDetailsProgramIds: 0,
      orphanCounts: {
        visaDetailsWithoutProgram: 0,
        claimsWithoutProgram: 0,
        evidenceWithoutClaim: 0,
        versionsWithoutProgram: 0
      },
      deletedPhase32FixturesFound: [],
      tableCounts: {},
      tableSha256Digests: {},
      migrationsApplied: []
    };

    if (fs.existsSync(sourceDbPath)) {
      const walSrc = `${sourceDbPath}-wal`;
      const shmSrc = `${sourceDbPath}-shm`;
      const walExists = fs.existsSync(walSrc);
      const shmExists = fs.existsSync(shmSrc);

      const sourceFilesObserved = {
        dbBytes: fs.statSync(sourceDbPath).size,
        walBytes: walExists ? fs.statSync(walSrc).size : 0,
        shmBytes: shmExists ? fs.statSync(shmSrc).size : 0,
        dbSha256: sha256File(sourceDbPath),
        walSha256: walExists ? sha256File(walSrc) : null,
        shmSha256: shmExists ? sha256File(shmSrc) : null
      };

      const tempCopyDb = path.join(snapTempDir, 'source_copy.db');
      fs.copyFileSync(sourceDbPath, tempCopyDb);
      if (walExists) fs.copyFileSync(walSrc, `${tempCopyDb}-wal`);
      if (shmExists) fs.copyFileSync(shmSrc, `${tempCopyDb}-shm`);

      let rawTablesPresent: string[] = [];
      const rawTableCounts: Record<string, number> = {};
      let rawMigrations: string[] = [];
      let newlyAppliedMigrationsOnCopy: string[] = [];

      const snapSourceDb = new Database(tempCopyDb);
      try {
        snapSourceDb.pragma('busy_timeout = 5000');
        snapSourceDb.pragma('foreign_keys = ON');
        if (walExists) {
          snapSourceDb.pragma('wal_checkpoint(TRUNCATE)');
        }

        // Capture raw pre-normalization source inventory from the WAL-replayed isolated temp copy
        const rawTblRows = snapSourceDb
          .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
          .all() as Array<{ name: string }>;
        rawTablesPresent = rawTblRows.map((t) => t.name);
        for (const tName of rawTablesPresent) {
          rawTableCounts[tName] = (snapSourceDb.prepare(`SELECT COUNT(*) AS c FROM "${tName}"`).get() as { c: number }).c;
        }
        if (rawTablesPresent.includes('schema_migrations')) {
          const migRows = snapSourceDb
            .prepare('SELECT version FROM schema_migrations ORDER BY version ASC')
            .all() as Array<{ version: string }>;
          rawMigrations = migRows.map((m) => m.version);
        }

        // Apply tracked SQLite schema migrations (001..003) ONLY on the isolated temp copy when missing,
        // without altering any existing table data or touching the original data_db/immigration_hub.db*.
        const migResult = runTrackedSqliteMigrations(snapSourceDb, SQLITE_MIGRATIONS);
        newlyAppliedMigrationsOnCopy = migResult.newlyApplied;

        await snapSourceDb.backup(stagedDbFull);
      } finally {
        closeSqliteDatabase(snapSourceDb);
      }

      // Inspect clean standalone snapshot read-only
      const inspectDb = openSqliteDatabase(stagedDbFull, { readonly: true, fileMustExist: true });
      try {
        const audit = auditSqliteDatabaseIntegrity(inspectDb);
        const dupPk = checkSqliteDuplicatePrimaryKeys(inspectDb);
        const deletedFixturesFound = detectDeletedPhase32FixturesInSqlite(inspectDb);
        if (!audit.ok || dupPk.length > 0 || deletedFixturesFound.length > 0) {
          throw new Error(
            `BACKUP_SNAPSHOT_INTEGRITY_FAILED: integrity=${audit.integrityCheck.join(',')}, fk=${audit.foreignKeyViolations}, dupPk=${dupPk.join('|')}, deletedFixtures=${deletedFixturesFound.join('|')}`
          );
        }
        const stat = fs.statSync(stagedDbFull);
        const tableDigests = computeSqliteTableDigests(inspectDb);

        dbSnapshotInfo = {
          included: true,
          relativePath: stagedDbRel,
          sizeBytes: stat.size,
          sha256: sha256File(stagedDbFull),
          walIncludedInSnapshot: walExists,
          sourceFilesObserved,
          rawSourceInventory: {
            tablesPresent: rawTablesPresent,
            tableCounts: rawTableCounts,
            migrationsRecordedOnDisk: rawMigrations,
            schemaNormalizedOnIsolatedCopy: newlyAppliedMigrationsOnCopy.length > 0,
            newlyAppliedMigrationsOnCopy
          },
          integrityCheck: audit.integrityCheck,
          foreignKeyViolations: audit.foreignKeyViolations,
          duplicateVisaDetailsProgramIds: audit.duplicates.visaDetailsProgramId.length,
          orphanCounts: audit.orphans,
          deletedPhase32FixturesFound: deletedFixturesFound,
          tableCounts: audit.tableCounts,
          tableSha256Digests: tableDigests,
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

    // 3. Collect PII-free inventory of non-SQLite persistent sources
    const nonSqliteInventory = collectNonSqliteSourceInventory(projectRoot);

    // 4. Build deterministic file manifest with SHA-256 checksums
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
      manifestVersion: '1.1.0',
      backupName: path.basename(outputPath),
      createdAt: new Date().toISOString(),
      archiveFormat: 'tar.gz',
      databaseSnapshot: dbSnapshotInfo,
      nonSqliteInventory,
      files: manifestFiles,
      totalFiles: manifestFiles.length,
      totalUncompressedBytes,
      excludedPatterns: EXCLUDED_PATTERNS
    };

    const manifestJson = JSON.stringify(manifest, null, 2);
    const manifestPathInStage = path.join(stageRoot, 'backup_manifest.json');
    fs.writeFileSync(manifestPathInStage, manifestJson, 'utf-8');

    // 5. Write archive atomically to temp file first, then rename to target
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    const tmpArchivePath = `${outputPath}.${crypto.randomBytes(4).toString('hex')}.tmp`;
    execFileSync('tar', ['-czf', tmpArchivePath, '-C', stageRoot, '.'], { stdio: 'pipe' });
    fs.renameSync(tmpArchivePath, outputPath);

    let resolvedManifestOut: string | undefined;
    if (options.manifestOutputPath) {
      resolvedManifestOut = path.resolve(options.manifestOutputPath);
      fs.mkdirSync(path.dirname(resolvedManifestOut), { recursive: true });
      fs.writeFileSync(resolvedManifestOut, manifestJson, 'utf-8');
    }

    let resolvedStandaloneOut: string | undefined;
    if (options.standaloneDbOutputPath && fs.existsSync(stagedDbFull)) {
      resolvedStandaloneOut = path.resolve(options.standaloneDbOutputPath);
      fs.mkdirSync(path.dirname(resolvedStandaloneOut), { recursive: true });
      fs.copyFileSync(stagedDbFull, resolvedStandaloneOut);
    }

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
      manifestPath: resolvedManifestOut,
      standaloneDbPath: resolvedStandaloneOut,
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
 * Verifies integrity, FKs, all 13 expected core tables, migrations 001/002/003,
 * table counts, deterministic table-level SHA-256 digests, duplicate/orphan checks,
 * and confirms deleted Phase 3.2 test fixtures have not reappeared.
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
  let coreTablesVerified = false;
  let missingCoreTables: string[] = [];
  let migrationsVerified = false;
  let missingMigrations: string[] = [];
  let tableDigestsMatch = false;
  const digestMismatches: string[] = [];
  let duplicateChecksPassed = false;
  let orphanChecksPassed = false;
  let deletedFixturesAbsent = false;
  let deletedFixturesFound: string[] = [];
  let restoredTableCounts: Record<string, number> = {};
  let restoredTableDigests: Record<string, string> = {};

  const buildReport = (success: boolean): RestoreVerificationReport => ({
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
    coreTablesVerified,
    missingCoreTables,
    migrationsVerified,
    missingMigrations,
    tableDigestsMatch,
    digestMismatches,
    duplicateChecksPassed,
    orphanChecksPassed,
    deletedFixturesAbsent,
    deletedFixturesFound,
    restoredTableCounts,
    restoredTableDigests,
    errors
  });

  try {
    if (!fs.existsSync(archivePath) || fs.statSync(archivePath).size === 0) {
      errors.push(`Archive missing or empty: ${archivePath}`);
      return buildReport(false);
    }

    try {
      execFileSync('tar', ['-xzf', archivePath, '-C', restoreDir], { stdio: 'pipe' });
    } catch (err: any) {
      errors.push(`TAR_EXTRACTION_FAILED: ${err?.message || 'Corrupt or incomplete tar.gz archive'}`);
      return buildReport(false);
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
      return buildReport(false);
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
          sqliteIntegrityOk =
            audit.integrityCheck.length === 1 &&
            audit.integrityCheck[0] === 'ok' &&
            audit.foreignKeyViolations === 0;
          sqliteForeignKeyViolations = audit.foreignKeyViolations;
          restoredTableCounts = audit.tableCounts;
          restoredTableDigests = computeSqliteTableDigests(restoredDb);

          if (!sqliteIntegrityOk) {
            errors.push(
              `Restored SQLite integrity failed: check=${audit.integrityCheck.join(',')}, fk=${audit.foreignKeyViolations}`
            );
          }

          // 1. Verify all 13 expected core tables exist
          missingCoreTables = EXPECTED_CORE_SQLITE_TABLES.filter(
            (tbl) => typeof restoredTableCounts[tbl] !== 'number'
          );
          coreTablesVerified = missingCoreTables.length === 0;
          if (!coreTablesVerified) {
            errors.push(`Missing expected core tables: ${missingCoreTables.join(', ')}`);
          }

          // 2. Verify migrations 001, 002, and 003
          const appliedVersions = new Set(audit.migrationsApplied.map((m) => m.version));
          missingMigrations = EXPECTED_SQLITE_MIGRATION_VERSIONS.filter((v) => !appliedVersions.has(v));
          migrationsVerified = missingMigrations.length === 0;
          if (!migrationsVerified) {
            errors.push(`Missing expected SQLite migration versions: ${missingMigrations.join(', ')}`);
          }

          // 3. Compare table row counts with manifest
          const expectedCounts = manifest.databaseSnapshot.tableCounts || {};
          sqliteTableCountsMatch =
            Object.entries(expectedCounts).every(([tbl, cnt]) => restoredTableCounts[tbl] === cnt) &&
            Object.keys(expectedCounts).length === Object.keys(restoredTableCounts).length;
          if (!sqliteTableCountsMatch) {
            errors.push('Restored SQLite table row counts do not match manifest snapshot.');
          }

          // 4. Compare deterministic table-level SHA-256 digests with manifest
          const expectedDigests = manifest.databaseSnapshot.tableSha256Digests || {};
          for (const [tbl, expDigest] of Object.entries(expectedDigests)) {
            if (restoredTableDigests[tbl] !== expDigest) {
              digestMismatches.push(tbl);
            }
          }
          for (const tbl of Object.keys(restoredTableDigests)) {
            if (expectedDigests[tbl] === undefined && Object.keys(expectedDigests).length > 0) {
              digestMismatches.push(tbl);
            }
          }
          tableDigestsMatch = Object.keys(expectedDigests).length > 0 && digestMismatches.length === 0;
          if (!tableDigestsMatch) {
            errors.push(`Table SHA-256 digest mismatches: ${digestMismatches.join(', ') || 'missing digests in manifest'}`);
          }

          // 5. Duplicate & orphan checks
          const dupPks = checkSqliteDuplicatePrimaryKeys(restoredDb);
          duplicateChecksPassed = audit.duplicates.visaDetailsProgramId.length === 0 && dupPks.length === 0;
          if (!duplicateChecksPassed) {
            errors.push(
              `Duplicate records detected: visaDetailsProgramId=${audit.duplicates.visaDetailsProgramId.length}, pk=${dupPks.join(', ')}`
            );
          }

          orphanChecksPassed =
            audit.orphans.visaDetailsWithoutProgram === 0 &&
            audit.orphans.claimsWithoutProgram === 0 &&
            audit.orphans.evidenceWithoutClaim === 0 &&
            audit.orphans.versionsWithoutProgram === 0;
          if (!orphanChecksPassed) {
            errors.push(`Orphan records detected: ${JSON.stringify(audit.orphans)}`);
          }

          // 6. Confirm deleted Phase 3.2 test fixtures have not reappeared
          deletedFixturesFound = detectDeletedPhase32FixturesInSqlite(restoredDb);
          deletedFixturesAbsent = deletedFixturesFound.length === 0;
          if (!deletedFixturesAbsent) {
            errors.push(`Deleted Phase 3.2 test fixtures reappeared: ${deletedFixturesFound.join(', ')}`);
          }
        } finally {
          closeSqliteDatabase(restoredDb);
        }
      }
    } else {
      sqliteIntegrityOk = true;
      sqliteForeignKeyViolations = 0;
      sqliteTableCountsMatch = true;
      coreTablesVerified = true;
      migrationsVerified = true;
      tableDigestsMatch = true;
      duplicateChecksPassed = true;
      orphanChecksPassed = true;
      deletedFixturesAbsent = true;
    }

    const success =
      errors.length === 0 &&
      manifestVerified &&
      forbiddenSecretFilesFound.length === 0 &&
      csvErrors.length === 0 &&
      sqliteIntegrityOk &&
      sqliteForeignKeyViolations === 0 &&
      sqliteTableCountsMatch &&
      coreTablesVerified &&
      migrationsVerified &&
      tableDigestsMatch &&
      duplicateChecksPassed &&
      orphanChecksPassed &&
      deletedFixturesAbsent;

    recordOperationalEvent({
      category: 'RESTORE_VERIFICATION',
      severity: success ? 'INFO' : 'ERROR',
      component: 'backup-restore-verifier',
      message: success
        ? `Verified isolated restore of ${path.basename(archivePath)} (${filesChecked} files, ${csvFilesChecked} CSVs, 13 tables, 3 migrations, digests OK).`
        : `Isolated restore verification FAILED for ${path.basename(archivePath)}: ${errors.join('; ')}`,
      details: {
        archive: path.basename(archivePath),
        filesChecked,
        csvFilesChecked,
        sqliteIntegrityOk,
        coreTablesVerified,
        migrationsVerified,
        tableDigestsMatch,
        restoredTableCounts
      }
    });

    return buildReport(success);
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
