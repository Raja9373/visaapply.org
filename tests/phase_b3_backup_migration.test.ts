import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';

import {
  EXPECTED_CORE_SQLITE_TABLES,
  EXPECTED_SQLITE_MIGRATION_VERSIONS,
  createVerifiedBackup,
  verifyBackupRestore
} from '../src/utils/backupManager';
import {
  closeSqliteDatabase,
  createSqliteRepository,
  openSqliteDatabase
} from '../src/db/sqliteCore';
import {
  POSTGRES_MIGRATIONS,
  PostgresImmigrationRepository,
  createPostgresExecutor,
  type PgExecutor
} from '../src/db/postgresDatabase';
import {
  SQLITE_TO_PG_IMPORT_ORDER,
  loadAndVerifyBackupSource,
  loadNonSqlitePersistentSources,
  planAndOptionallyApplyMockMigration
} from '../src/db/phaseB3MigrationEngine';
import { verifySqliteMockPostgresParity } from '../src/db/phaseB3ParityVerifier';

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function sha256(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function seedProgram(repo: ReturnType<typeof createSqliteRepository>, id: string, countryCode: string = 'US') {
  repo.db
    .prepare(
      `INSERT INTO immigration_programs (
        id, country_code, category, official_name, local_language_name, legal_basis,
        classification_type, eligibility, nationality_restrictions, age_requirements,
        education_requirements, work_experience_requirements, min_salary_or_income,
        investment_requirement, required_funds_and_proof, residency_duration,
        renewal_rules, pr_or_citizenship_transition, family_inclusion_rules,
        work_and_study_rights, restrictions_and_exceptions, required_documents_json,
        documents_and_formats, translation_attestation_requirements, application_procedure,
        government_fees, processing_time, apply_from, official_application_url,
        official_information_url, source_authority, source_last_updated, last_checked_date,
        verification_evidence, verification_status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      countryCode,
      'work',
      `Program ${id}`,
      null,
      'Statutory Rule 101',
      'Work Authorization',
      'Eligible professionals',
      'All eligible',
      '18+',
      'Degree required',
      '2 years',
      '$60,000',
      'N/A',
      'Bank statements',
      '3 years',
      'Renewable',
      'PR eligible after 5 years',
      'Spouse and children',
      'Full work rights',
      'Employer sponsorship required',
      '["Passport","Offer Letter"]',
      'Digital',
      'Certified translation',
      'Online portal + biometrics',
      '$250',
      '60 days',
      'Abroad',
      'https://official.example.gov/apply',
      'https://official.example.gov/info',
      'Ministry of Immigration',
      '2026-10-15',
      '2026-11-10',
      'https://official.example.gov/law',
      'AVAILABLE_VERIFIED',
      '2026-11-10T00:00:00.000Z'
    );
}

interface FixtureProjectOptions {
  subscriberEmail?: string;
  omitSlotStatus?: boolean;
  invalidChangelogJson?: boolean;
  reverseInsertOrder?: boolean;
  leaveUncheckpointedWalWrite?: boolean;
}

function createSampleProject(rootDir: string, opts: FixtureProjectOptions = {}) {
  const dataDbDir = path.join(rootDir, 'data_db');
  const dbPath = path.join(dataDbDir, 'immigration_hub.db');
  fs.mkdirSync(path.join(rootDir, 'src/db'), { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'src/data'), { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'content/drafts'), { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'docs'), { recursive: true });

  const db = openSqliteDatabase(dbPath, { busyTimeoutMs: 5000 });
  const repo = createSqliteRepository(db);

  if (opts.reverseInsertOrder) {
    seedProgram(repo, 'CA-WORK-02', 'CA');
    seedProgram(repo, 'US-WORK-01', 'US');
  } else {
    seedProgram(repo, 'US-WORK-01', 'US');
    seedProgram(repo, 'CA-WORK-02', 'CA');
  }

  repo.saveVisaDetails({
    id: 'vd-us-01',
    programId: 'US-WORK-01',
    countryOverviewJson: JSON.stringify({ code: 'US', title: 'United States' }),
    verificationStatus: 'VERIFIED',
    lastUpdated: '2026-11-10T00:00:00.000Z'
  });

  repo.saveVisaClaim({
    id: 'clm-us-01',
    programId: 'US-WORK-01',
    section: 'fees',
    description: 'Application filing fee',
    value: '250',
    unit: 'USD',
    status: 'VERIFIED',
    reviewTimestamp: '2026-11-10T00:00:00.000Z'
  });

  repo.saveVisaEvidence({
    id: 'ev-us-01',
    claimId: 'clm-us-01',
    sourceUrl: 'https://official.example.gov/fees',
    legalInstrument: '8 CFR 103.7',
    status: 'VERIFIED_OFFICIAL'
  });

  repo.saveVisaVersion({
    id: 'ver-us-01',
    programId: 'US-WORK-01',
    data: { snapshot: 1 },
    editorId: 'auditor-1',
    timestamp: '2026-11-10T00:00:00.000Z',
    changeReason: 'Initial verified snapshot'
  });

  if (opts.leaveUncheckpointedWalWrite) {
    // Checkpoint existing state, then disable autocheckpoint and write a new program solely to WAL
    db.pragma('wal_checkpoint(TRUNCATE)');
    db.pragma('wal_autocheckpoint = 0');
    seedProgram(repo, 'GB-WAL-99', 'GB');
    // Intentionally do NOT checkpoint before copying; closeSqliteDatabase runs without TRUNCATE
    // Actually keep db handle closed cleanly OR force WAL non-empty by setting synchronous=NORMAL and keeping wal_autocheckpoint=0:
    // Note better-sqlite3's close() only checkpoints if last connection cleanly closes; to guarantee uncheckpointed WAL file exists on disk while snapshot runs, callers can hold a read-lock or inspect WAL directly.
  }

  closeSqliteDatabase(db);

  // Non-SQLite files
  if (opts.invalidChangelogJson) {
    fs.writeFileSync(path.join(rootDir, 'src/data/immigrationChangelog.json'), '{ invalid json !!!', 'utf-8');
  } else {
    fs.writeFileSync(
      path.join(rootDir, 'src/data/immigrationChangelog.json'),
      JSON.stringify(
        [
          {
            id: 'chg-001',
            date: '2026-11-01',
            countryCode: 'us',
            countryName: 'United States',
            changeType: 'FEE_UPDATE',
            title: 'USCIS filing fee verified',
            oldValue: '$205',
            newValue: '$250',
            sourceUrl: 'https://www.uscis.gov/fees',
            autoBlogSlug: 'us-fee-update',
            emailNotified: '0',
            verifiedBy: 'auditor'
          }
        ],
        null,
        2
      ),
      'utf-8'
    );
  }

  if (!opts.omitSlotStatus) {
    fs.writeFileSync(
      path.join(rootDir, 'content/slot_status.json'),
      JSON.stringify(
        {
          lastCheckTime: '2026-11-12T10:00:00.000Z',
          embassies: {
            'USA London': { status: 'Open', lastSlotDate: '2026-12-15', lastAlertTime: 1794477600000 },
            'Schengen - Paris': { status: 'Closed', lastSlotDate: 'N/A', lastAlertTime: 1794477600000 }
          }
        },
        null,
        2
      ),
      'utf-8'
    );
  }

  const subs = opts.subscriberEmail
    ? [
        {
          id: 'sub-test-001',
          email: opts.subscriberEmail,
          country: 'US',
          city: 'London',
          visaType: 'B1/B2',
          language: 'en',
          subscribedAt: '2026-11-10T12:00:00.000Z',
          isActive: true
        }
      ]
    : [];
  fs.writeFileSync(path.join(rootDir, 'content/slot_subscribers.json'), JSON.stringify(subs, null, 2), 'utf-8');

  fs.writeFileSync(
    path.join(rootDir, 'content/immigration_sync_state.json'),
    JSON.stringify({ isRunning: false }),
    'utf-8'
  );

  fs.writeFileSync(
    path.join(rootDir, 'content/us-to-uk-tourist.md'),
    `---\ntitle: US to UK Visitor Guide\ndate: "2026-11-05"\ncategory: Tourism\n---\n\n# Visitor Requirements\n\nValid passport and ETA required.\n`,
    'utf-8'
  );

  fs.writeFileSync(
    path.join(rootDir, 'content/drafts/jp-to-ae-business.md'),
    `---\ntitle: Japan to UAE Business Draft\ndate: "2026-11-08"\nstatus: draft\n---\n\nPending human review.\n`,
    'utf-8'
  );

  fs.writeFileSync(path.join(rootDir, 'phase_b3_registry.csv'), 'id,country\nUS-WORK-01,US\nCA-WORK-02,CA\n', 'utf-8');
  fs.writeFileSync(path.join(rootDir, '.env'), 'SECRET_SHOULD_EXCLUDE=1\n', 'utf-8');
  fs.writeFileSync(path.join(rootDir, '.env.example'), 'NEON_APP_DATABASE_URL="postgres://..."\n', 'utf-8');

  return { dataDbDir, dbPath };
}

test('1 & 2. WAL-safe backup captures uncheckpointed WAL transactions and keeps source .db/-wal/-shm immutable', async () => {
  const dir = makeTempDir('b3-wal-');
  try {
    const projectRoot = path.join(dir, 'project');
    const { dbPath } = createSampleProject(projectRoot);

    // Open a live writer session with WAL autocheckpoint disabled + an active reader holding WAL open
    // so an inserted program resides ONLY in -wal and NOT yet checkpointed into the base .db file.
    const writer = new Database(dbPath);
    const reader = new Database(dbPath, { readonly: true });
    let beforeDbHash = '';
    let beforeWalHash = '';
    let beforeShmHash = '';
    try {
      writer.pragma('journal_mode = WAL');
      writer.pragma('wal_autocheckpoint = 0');
      reader.prepare('SELECT COUNT(*) FROM immigration_programs').get();

      const repo = createSqliteRepository(writer);
      seedProgram(repo, 'JP-WAL-ONLY', 'JP');

      assert.equal(fs.existsSync(`${dbPath}-wal`), true);
      assert.ok(fs.statSync(`${dbPath}-wal`).size > 0, 'Expected uncheckpointed WAL file to be non-empty');

      beforeDbHash = sha256(dbPath);
      beforeWalHash = sha256(`${dbPath}-wal`);
      beforeShmHash = fs.existsSync(`${dbPath}-shm`) ? sha256(`${dbPath}-shm`) : '';

      const backupDir = path.join(dir, 'backup_out');
      const result = await createVerifiedBackup({
        outputPath: path.join(backupDir, 'visaapply_backup.tar.gz'),
        manifestOutputPath: path.join(backupDir, 'backup_manifest.json'),
        standaloneDbOutputPath: path.join(backupDir, 'immigration_hub_standalone.db'),
        projectRoot,
        dbPath
      });

      assert.equal(result.success, true);
      assert.equal(result.manifest.databaseSnapshot.walIncludedInSnapshot, true);
      assert.equal(result.manifest.databaseSnapshot.tableCounts.immigration_programs, 3);

      // Verify original .db, -wal, -shm remained byte-for-byte immutable
      assert.equal(sha256(dbPath), beforeDbHash);
      assert.equal(sha256(`${dbPath}-wal`), beforeWalHash);
      if (beforeShmHash) {
        assert.equal(sha256(`${dbPath}-shm`), beforeShmHash);
      }

      // Verify standalone snapshot actually contains the uncheckpointed WAL row
      const snapDb = new Database(path.join(backupDir, 'immigration_hub_standalone.db'), { readonly: true });
      try {
        const walRow = snapDb
          .prepare('SELECT id, country_code FROM immigration_programs WHERE id = ?')
          .get('JP-WAL-ONLY') as { id: string; country_code: string } | undefined;
        assert.ok(walRow, 'Standalone backup snapshot must include uncheckpointed WAL row');
        assert.equal(walRow.country_code, 'JP');
      } finally {
        snapDb.close();
      }
    } finally {
      reader.close();
      writer.close();
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('3 & 4. Backup manifest accuracy, secret exclusion, and full isolated restore verification (13 tables, 3 migrations, digests, corrupt/tamper rejection)', async () => {
  const dir = makeTempDir('b3-restore-');
  try {
    const projectRoot = path.join(dir, 'project');
    const { dataDbDir, dbPath } = createSampleProject(projectRoot);
    fs.writeFileSync(path.join(projectRoot, 'private.pem'), 'PRIVATE KEY', 'utf-8');

    const backupDir = path.join(dir, 'backup_out');
    const archivePath = path.join(backupDir, 'visaapply_backup.tar.gz');
    const res = await createVerifiedBackup({
      outputPath: archivePath,
      manifestOutputPath: path.join(backupDir, 'backup_manifest.json'),
      standaloneDbOutputPath: path.join(backupDir, 'immigration_hub_standalone.db'),
      projectRoot,
      dbPath
    });

    assert.equal(res.manifest.manifestVersion, '1.1.0');
    assert.equal(res.manifest.files.some((f) => f.path === '.env' || f.path.endsWith('.pem')), false);
    assert.equal(res.manifest.files.some((f) => f.path === '.env.example'), true);
    assert.equal(res.manifest.nonSqliteInventory.changelogJson.entryCount, 1);
    assert.equal(res.manifest.nonSqliteInventory.slotStatusJson.embassyCount, 2);
    assert.equal(res.manifest.nonSqliteInventory.publishedMarkdown.count, 1);
    assert.equal(res.manifest.nonSqliteInventory.draftMarkdown.count, 1);
    assert.equal(res.manifest.nonSqliteInventory.immigrationSyncStateJson.status, 'LEGACY_SUPERSEDED');

    const verifyReport = verifyBackupRestore(archivePath);
    assert.equal(verifyReport.success, true);
    assert.equal(verifyReport.coreTablesVerified, true);
    assert.deepEqual(verifyReport.missingCoreTables, []);
    assert.equal(verifyReport.migrationsVerified, true);
    assert.deepEqual(verifyReport.missingMigrations, []);
    assert.equal(verifyReport.tableDigestsMatch, true);
    assert.equal(verifyReport.duplicateChecksPassed, true);
    assert.equal(verifyReport.orphanChecksPassed, true);
    assert.equal(verifyReport.deletedFixturesAbsent, true);
    for (const tbl of EXPECTED_CORE_SQLITE_TABLES) {
      assert.equal(typeof verifyReport.restoredTableCounts[tbl], 'number');
      assert.ok(verifyReport.restoredTableDigests[tbl]?.length === 64);
    }

    // Refuse restoring directly into data_db
    assert.throws(
      () => verifyBackupRestore(archivePath, { restoreTargetDir: dataDbDir, productionDbDir: dataDbDir }),
      /SAFETY_ABORT/
    );

    // Reject backup missing a core table / migration version
    const tamperedExtract = makeTempDir('b3-bad-tbl-');
    execFileSync('tar', ['-xzf', archivePath, '-C', tamperedExtract]);
    const extractedDb = new Database(path.join(tamperedExtract, 'data_db/immigration_hub.db'));
    extractedDb.exec('DROP TABLE operational_events; DELETE FROM schema_migrations WHERE version = \'003_phase44_operational_reliability_and_constraints\';');
    extractedDb.close();
    const badArchive = path.join(dir, 'missing_table.tar.gz');
    execFileSync('tar', ['-czf', badArchive, '-C', tamperedExtract, '.']);
    const badReport = verifyBackupRestore(badArchive);
    assert.equal(badReport.success, false);
    assert.equal(badReport.coreTablesVerified, false);
    assert.ok(badReport.missingCoreTables.includes('operational_events'));
    assert.equal(badReport.migrationsVerified, false);
    assert.ok(badReport.missingMigrations.includes(EXPECTED_SQLITE_MIGRATION_VERSIONS[2]));
    fs.rmSync(tamperedExtract, { recursive: true, force: true });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('5. SHA-256 determinism across independent insertion orders and migration plans', async () => {
  const dirA = makeTempDir('b3-det-a-');
  const dirB = makeTempDir('b3-det-b-');
  try {
    const { dbPath: dbPathA } = createSampleProject(path.join(dirA, 'proj'), { reverseInsertOrder: false });
    const { dbPath: dbPathB } = createSampleProject(path.join(dirB, 'proj'), { reverseInsertOrder: true });

    const bkpA = await createVerifiedBackup({
      outputPath: path.join(dirA, 'out/visaapply_backup.tar.gz'),
      manifestOutputPath: path.join(dirA, 'out/backup_manifest.json'),
      standaloneDbOutputPath: path.join(dirA, 'out/immigration_hub_standalone.db'),
      projectRoot: path.join(dirA, 'proj'),
      dbPath: dbPathA
    });
    const bkpB = await createVerifiedBackup({
      outputPath: path.join(dirB, 'out/visaapply_backup.tar.gz'),
      manifestOutputPath: path.join(dirB, 'out/backup_manifest.json'),
      standaloneDbOutputPath: path.join(dirB, 'out/immigration_hub_standalone.db'),
      projectRoot: path.join(dirB, 'proj'),
      dbPath: dbPathB
    });

    assert.equal(
      bkpA.manifest.databaseSnapshot.tableSha256Digests.immigration_programs,
      bkpB.manifest.databaseSnapshot.tableSha256Digests.immigration_programs
    );
    assert.equal(
      bkpA.manifest.databaseSnapshot.tableSha256Digests.schema_migrations,
      bkpB.manifest.databaseSnapshot.tableSha256Digests.schema_migrations
    );

    const planA = await planAndOptionallyApplyMockMigration({ sourcePath: path.join(dirA, 'out'), dryRun: true });
    const planB = await planAndOptionallyApplyMockMigration({ sourcePath: path.join(dirB, 'out'), dryRun: true });
    assert.equal(planA.planSha256, planB.planSha256);
  } finally {
    fs.rmSync(dirA, { recursive: true, force: true });
    fs.rmSync(dirB, { recursive: true, force: true });
  }
});

test('6, 7, 8 & 13. FK ordering, dry-run default, idempotent apply + update/conflict detection, and Markdown preservation', async () => {
  const dir = makeTempDir('b3-mig-');
  const mockExec = await createPostgresExecutor(undefined, {
    purpose: 'test',
    accessMode: 'migration',
    allowPglite: true,
    requireNeonRemote: false
  });
  try {
    const projectRoot = path.join(dir, 'project');
    const { dbPath } = createSampleProject(projectRoot);
    const backupDir = path.join(dir, 'backup');

    await createVerifiedBackup({
      outputPath: path.join(backupDir, 'visaapply_backup.tar.gz'),
      manifestOutputPath: path.join(backupDir, 'backup_manifest.json'),
      standaloneDbOutputPath: path.join(backupDir, 'immigration_hub_standalone.db'),
      projectRoot,
      dbPath
    });

    // Dry-run is default: must perform zero writes to mock destination
    const dryPlan = await planAndOptionallyApplyMockMigration({
      sourcePath: backupDir,
      mockDestinationExecutor: mockExec
    });
    assert.equal(dryPlan.mode, 'DRY_RUN');
    assert.equal(dryPlan.dryRun, true);
    assert.equal(dryPlan.executedAgainstMockDestination, false);
    assert.equal(dryPlan.liveNeonConnected, false);
    assert.equal(dryPlan.schemaMigrationsPolicy.sqliteSchemaMigrationsCopied, false);
    assert.equal(dryPlan.schemaMigrationsPolicy.postgresMigrationsAppliedCount, POSTGRES_MIGRATIONS.length);
    assert.ok(dryPlan.totals.inserts > 0);
    assert.equal(dryPlan.totals.conflicts, 0);

    // Verify FK order index places immigration_programs before visa_details, visa_detail_claims before visa_detail_evidence
    const idxProg = dryPlan.tables.find((t) => t.table === 'immigration_programs')!.importOrderIndex;
    const idxVd = dryPlan.tables.find((t) => t.table === 'visa_details')!.importOrderIndex;
    const idxClm = dryPlan.tables.find((t) => t.table === 'visa_detail_claims')!.importOrderIndex;
    const idxEv = dryPlan.tables.find((t) => t.table === 'visa_detail_evidence')!.importOrderIndex;
    assert.ok(idxProg < idxVd && idxProg < idxClm && idxClm < idxEv);
    assert.equal(SQLITE_TO_PG_IMPORT_ORDER[0], 'immigration_programs');

    const beforeCount = (await mockExec.query<{ c: number }>('SELECT COUNT(*)::int AS c FROM immigration_programs')).rows[0].c;
    assert.equal(beforeCount, 0, 'Dry-run must NOT write to destination');

    // Apply to isolated mock destination
    const appliedPlan = await planAndOptionallyApplyMockMigration({
      sourcePath: backupDir,
      dryRun: false,
      applyToMock: true,
      mockDestinationExecutor: mockExec
    });
    assert.equal(appliedPlan.mode, 'MOCK_APPLIED');
    assert.equal(appliedPlan.executedAgainstMockDestination, true);

    // Verify Markdown frontmatter & body stored in editorial_articles with proper status
    const artRes = await mockExec.query<{ slug: string; status: string; markdown_body: string }>(
      'SELECT slug, status, markdown_body FROM editorial_articles ORDER BY slug ASC'
    );
    assert.equal(artRes.rows.length, 2);
    assert.deepEqual(
      artRes.rows.map((r) => [r.slug, r.status]),
      [
        ['jp-to-ae-business', 'draft'],
        ['us-to-uk-tourist', 'published']
      ]
    );
    assert.ok(artRes.rows[1].markdown_body.includes('Valid passport and ETA required.'));

    // Re-running dry-run must be 100% SKIP_UNCHANGED idempotent
    const secondPlan = await planAndOptionallyApplyMockMigration({
      sourcePath: backupDir,
      dryRun: true,
      mockDestinationExecutor: mockExec
    });
    assert.equal(secondPlan.totals.inserts, 0);
    assert.equal(secondPlan.totals.updates, 0);
    assert.equal(secondPlan.totals.conflicts, 0);
    assert.equal(secondPlan.totals.skippedUnchanged, secondPlan.totals.totalSourceRecords);

    // Modify a destination record -> plan detects UPDATE cleanly
    await mockExec.query(`UPDATE immigration_programs SET official_name = 'Stale Name' WHERE id = 'US-WORK-01'`);
    const updatePlan = await planAndOptionallyApplyMockMigration({
      sourcePath: backupDir,
      dryRun: true,
      mockDestinationExecutor: mockExec
    });
    assert.equal(updatePlan.totals.updates, 1);

    // Restore name & inject visa_details unique program_id collision -> plan detects CONFLICT cleanly
    await mockExec.query(`UPDATE immigration_programs SET official_name = 'Program US-WORK-01' WHERE id = 'US-WORK-01'`);
    await mockExec.query(`DELETE FROM visa_details WHERE program_id = 'US-WORK-01'`);
    await mockExec.query(
      `INSERT INTO visa_details (id, program_id, verification_status) VALUES ('vd-colliding-other-id', 'US-WORK-01', 'DRAFT')`
    );
    const conflictPlan = await planAndOptionallyApplyMockMigration({
      sourcePath: backupDir,
      dryRun: true,
      mockDestinationExecutor: mockExec
    });
    assert.equal(conflictPlan.totals.conflicts, 1);
  } finally {
    await mockExec.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('9, 10, 11 & 12. Refuse live Neon, migration_export.json, raw live DB, unknown columns, missing files, and invalid JSON', async () => {
  const dir = makeTempDir('b3-guards-');
  try {
    const projectRoot = path.join(dir, 'project');
    const { dbPath } = createSampleProject(projectRoot);
    const backupDir = path.join(dir, 'backup');
    await createVerifiedBackup({
      outputPath: path.join(backupDir, 'visaapply_backup.tar.gz'),
      manifestOutputPath: path.join(backupDir, 'backup_manifest.json'),
      standaloneDbOutputPath: path.join(backupDir, 'immigration_hub_standalone.db'),
      projectRoot,
      dbPath
    });

    // Reject --execute flag
    await assert.rejects(
      () => planAndOptionallyApplyMockMigration({ sourcePath: backupDir, execute: true }),
      /LIVE_MIGRATION_FORBIDDEN_IN_PHASE_B3/
    );

    // Reject live Neon executor in both migration engine and parity verifier
    const fakeNeonExec: PgExecutor = {
      isNeonRemote: true,
      accessMode: 'migration',
      backend: 'neon-postgres',
      purpose: 'migration',
      async query() {
        return { rows: [], rowCount: 0 };
      },
      async transaction(fn) {
        return fn(fakeNeonExec);
      },
      async close() {}
    };
    await assert.rejects(
      () => planAndOptionallyApplyMockMigration({ sourcePath: backupDir, mockDestinationExecutor: fakeNeonExec }),
      /LIVE_NEON_FORBIDDEN_IN_PHASE_B3/
    );
    await assert.rejects(
      () => verifySqliteMockPostgresParity({ sourcePath: backupDir, mockDestinationExecutor: fakeNeonExec }),
      /LIVE_NEON_FORBIDDEN_IN_PHASE_B3/
    );

    // Reject outdated migration_export.json
    const exportPath = path.join(dir, 'migration_export.json');
    fs.writeFileSync(exportPath, '{}', 'utf-8');
    await assert.rejects(
      () => planAndOptionallyApplyMockMigration({ sourcePath: exportPath }),
      /UNAUTHORITATIVE_SOURCE_REJECTED/
    );

    // Reject direct read from data_db/immigration_hub.db
    await assert.rejects(
      () => planAndOptionallyApplyMockMigration({ sourcePath: path.join(process.cwd(), 'data_db/immigration_hub.db') }),
      /UNVERIFIED_SOURCE_REJECTED/
    );

    // Missing source file
    const missingProj = path.join(dir, 'missing_proj');
    const { dbPath: mDb } = createSampleProject(missingProj, { omitSlotStatus: true });
    const mBkp = path.join(dir, 'missing_bkp');
    await createVerifiedBackup({
      outputPath: path.join(mBkp, 'visaapply_backup.tar.gz'),
      manifestOutputPath: path.join(mBkp, 'backup_manifest.json'),
      standaloneDbOutputPath: path.join(mBkp, 'immigration_hub_standalone.db'),
      projectRoot: missingProj,
      dbPath: mDb
    });
    await assert.rejects(
      () => planAndOptionallyApplyMockMigration({ sourcePath: mBkp }),
      /MISSING_SOURCE_FILE/
    );

    // Invalid JSON file
    const badJsonProj = path.join(dir, 'badjson_proj');
    const { dbPath: bjDb } = createSampleProject(badJsonProj, { invalidChangelogJson: true });
    const bjBkp = path.join(dir, 'badjson_bkp');
    await createVerifiedBackup({
      outputPath: path.join(bjBkp, 'visaapply_backup.tar.gz'),
      manifestOutputPath: path.join(bjBkp, 'backup_manifest.json'),
      standaloneDbOutputPath: path.join(bjBkp, 'immigration_hub_standalone.db'),
      projectRoot: badJsonProj,
      dbPath: bjDb
    });
    await assert.rejects(
      () => planAndOptionallyApplyMockMigration({ sourcePath: bjBkp }),
      /INVALID_JSON_SOURCE/
    );

    // Unknown column detection (destination PG extra unmapped column)
    const colMock = await createPostgresExecutor(undefined, {
      purpose: 'test',
      accessMode: 'migration',
      allowPglite: true,
      requireNeonRemote: false
    });
    try {
      const repo = new PostgresImmigrationRepository(colMock);
      await repo.runTrackedMigrations(POSTGRES_MIGRATIONS);
      await colMock.query('ALTER TABLE immigration_programs ADD COLUMN unexpected_pg_col TEXT');
      await assert.rejects(
        () => planAndOptionallyApplyMockMigration({ sourcePath: backupDir, mockDestinationExecutor: colMock }),
        /UNMAPPED_DESTINATION_COLUMN/
      );
    } finally {
      await colMock.close();
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('14 & 15. Strict PII redaction for slot_subscribers and Phase 3.2 deleted fixture exclusion across backup/migration/parity', async () => {
  const dir = makeTempDir('b3-pii-p32-');
  try {
    const secretEmail = 'confidential.applicant.9981@private-domain.example';
    const projectRoot = path.join(dir, 'project');
    const { dbPath } = createSampleProject(projectRoot, { subscriberEmail: secretEmail });
    const backupDir = path.join(dir, 'backup');

    const bkp = await createVerifiedBackup({
      outputPath: path.join(backupDir, 'visaapply_backup.tar.gz'),
      manifestOutputPath: path.join(backupDir, 'backup_manifest.json'),
      standaloneDbOutputPath: path.join(backupDir, 'immigration_hub_standalone.db'),
      projectRoot,
      dbPath
    });

    const mockExec = await createPostgresExecutor(undefined, {
      purpose: 'test',
      accessMode: 'migration',
      allowPglite: true,
      requireNeonRemote: false
    });
    try {
      const plan = await planAndOptionallyApplyMockMigration({
        sourcePath: backupDir,
        dryRun: false,
        applyToMock: true,
        mockDestinationExecutor: mockExec
      });
      const parity = await verifySqliteMockPostgresParity({
        sourcePath: backupDir,
        seedIsolatedMockFromBackup: false,
        mockDestinationExecutor: mockExec
      });

      assert.equal(parity.passed, true);
      assert.equal(parity.verificationLabel, 'MOCK_VERIFICATION');
      assert.equal(parity.liveNeonVerified, false);

      // Subscriber was migrated cleanly into mock PG destination
      const subRes = await mockExec.query<{ email: string }>('SELECT email FROM slot_subscribers');
      assert.equal(subRes.rows.length, 1);
      assert.equal(subRes.rows[0].email, secretEmail);

      // Yet raw email NEVER appears anywhere in manifest, migration plan, or parity report
      assert.equal(JSON.stringify(bkp.manifest).includes(secretEmail), false);
      assert.equal(JSON.stringify(plan).includes(secretEmail), false);
      assert.equal(JSON.stringify(parity).includes(secretEmail), false);
    } finally {
      await mockExec.close();
    }

    // Deleted Phase 3.2 fixture detection: backup snapshot creation refuses to snapshot a contaminated DB
    const dirtyRoot = path.join(dir, 'dirty_proj');
    const { dbPath: dirtyDbPath } = createSampleProject(dirtyRoot);
    const dirtyDb = new Database(dirtyDbPath);
    const dirtyRepo = createSqliteRepository(dirtyDb);
    seedProgram(dirtyRepo, 'test-p322-temp-001', 'XX');
    dirtyDb.close();

    await assert.rejects(
      () =>
        createVerifiedBackup({
          outputPath: path.join(dir, 'dirty_backup.tar.gz'),
          projectRoot: dirtyRoot,
          dbPath: dirtyDbPath
        }),
      /BACKUP_SNAPSHOT_INTEGRITY_FAILED/
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('16. Mock parity verification detects missing records, unexpected records, modified values, and Markdown digest drift', async () => {
  const dir = makeTempDir('b3-parity-');
  const mockExec = await createPostgresExecutor(undefined, {
    purpose: 'test',
    accessMode: 'migration',
    allowPglite: true,
    requireNeonRemote: false
  });
  try {
    const projectRoot = path.join(dir, 'project');
    const { dbPath } = createSampleProject(projectRoot);
    const backupDir = path.join(dir, 'backup');
    await createVerifiedBackup({
      outputPath: path.join(backupDir, 'visaapply_backup.tar.gz'),
      manifestOutputPath: path.join(backupDir, 'backup_manifest.json'),
      standaloneDbOutputPath: path.join(backupDir, 'immigration_hub_standalone.db'),
      projectRoot,
      dbPath
    });

    await planAndOptionallyApplyMockMigration({
      sourcePath: backupDir,
      dryRun: false,
      applyToMock: true,
      mockDestinationExecutor: mockExec
    });

    // Clean pass first
    const cleanParity = await verifySqliteMockPostgresParity({
      sourcePath: backupDir,
      seedIsolatedMockFromBackup: false,
      mockDestinationExecutor: mockExec
    });
    assert.equal(cleanParity.passed, true);
    assert.equal(cleanParity.verificationLabel, 'MOCK_VERIFICATION');
    assert.equal(cleanParity.liveNeonVerified, false);
    assert.equal(Object.values(cleanParity.checks).every(Boolean), true);

    // 1. Corrupt Markdown body in destination
    await mockExec.query(
      `UPDATE editorial_articles SET markdown_body = 'CORRUPTED BODY' WHERE slug = 'us-to-uk-tourist'`
    );
    const mdFail = await verifySqliteMockPostgresParity({
      sourcePath: backupDir,
      seedIsolatedMockFromBackup: false,
      mockDestinationExecutor: mockExec
    });
    assert.equal(mdFail.passed, false);
    assert.equal(mdFail.checks.markdownDigestsMatch, false);
    assert.ok(mdFail.markdownDigestMismatches.some((m) => m.includes('us-to-uk-tourist')));

    // 2. Insert unexpected record in immigration_programs
    await mockExec.query(
      `INSERT INTO immigration_programs (
        id, country_code, category, official_name, legal_basis, classification_type, eligibility,
        nationality_restrictions, age_requirements, education_requirements, work_experience_requirements,
        min_salary_or_income, investment_requirement, required_funds_and_proof, residency_duration,
        required_documents_json, application_procedure, government_fees, processing_time,
        official_application_url, official_information_url, source_authority, source_last_updated,
        last_checked_date, verification_evidence, verification_status, updated_at
      ) VALUES (
        'ROGUE-99', 'ZZ', 'work', 'Rogue', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X',
        '[]', 'X', 'X', 'X', 'https://x', 'https://x', 'X', '2026-01-01', '2026-01-01', 'X', 'DRAFT', '2026-01-01'
      )`
    );
    const unexpFail = await verifySqliteMockPostgresParity({
      sourcePath: backupDir,
      seedIsolatedMockFromBackup: false,
      mockDestinationExecutor: mockExec
    });
    assert.equal(unexpFail.passed, false);
    assert.equal(unexpFail.checks.noUnexpectedRecords, false);
    assert.ok(
      unexpFail.tables.find((t) => t.table === 'immigration_programs')?.unexpectedRecords.includes('ROGUE-99')
    );

    // 3. Delete expected record -> detects missing record
    await mockExec.query(`DELETE FROM immigration_programs WHERE id = 'CA-WORK-02'`);
    const missingFail = await verifySqliteMockPostgresParity({
      sourcePath: backupDir,
      seedIsolatedMockFromBackup: false,
      mockDestinationExecutor: mockExec
    });
    assert.equal(missingFail.passed, false);
    assert.equal(missingFail.checks.noMissingRecords, false);
    assert.ok(
      missingFail.tables.find((t) => t.table === 'immigration_programs')?.missingRecords.includes('CA-WORK-02')
    );
  } finally {
    await mockExec.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('17. CLI scripts return non-zero exit codes on failures (verifyBackupRestore, migrateSqliteToNeon, verifySqliteNeonParity)', () => {
  const dir = makeTempDir('b3-cli-');
  try {
    const missingArchive = path.join(dir, 'does_not_exist.tar.gz');
    const r1 = spawnSync('npx', ['tsx', 'scripts/verifyBackupRestore.ts', '--archive', missingArchive], {
      cwd: process.cwd(),
      encoding: 'utf-8'
    });
    assert.notEqual(r1.status, 0);

    const exportJson = path.join(process.cwd(), 'migration_export.json');
    const r2 = spawnSync(
      'npx',
      ['tsx', 'scripts/migrateSqliteToNeon.ts', '--source', exportJson],
      { cwd: process.cwd(), encoding: 'utf-8' }
    );
    assert.notEqual(r2.status, 0);

    const r3 = spawnSync(
      'npx',
      ['tsx', 'scripts/migrateSqliteToNeon.ts', '--source', dir, '--execute'],
      { cwd: process.cwd(), encoding: 'utf-8' }
    );
    assert.notEqual(r3.status, 0);
    assert.ok((r3.stderr + r3.stdout).includes('LIVE_MIGRATION_FORBIDDEN_IN_PHASE_B3'));

    const r4 = spawnSync(
      'npx',
      ['tsx', 'scripts/verifySqliteNeonParity.ts', '--source', missingArchive],
      { cwd: process.cwd(), encoding: 'utf-8' }
    );
    assert.notEqual(r4.status, 0);

    // Also confirm loadAndVerifyBackupSource and loadNonSqlitePersistentSources exports work cleanly
    assert.equal(typeof loadAndVerifyBackupSource, 'function');
    assert.equal(typeof loadNonSqlitePersistentSources, 'function');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
