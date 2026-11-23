import Database from 'better-sqlite3';
import {
  POSTGRES_MIGRATIONS,
  PostgresImmigrationRepository,
  createPostgresExecutor,
  type PgExecutor
} from './postgresDatabase';
import { closeSqliteDatabase } from './sqliteCore';
import {
  MIGRATION_004_TARGET_SPECS,
  SQLITE_TO_PG_IMPORT_ORDER,
  TABLE_MAPPING_SPECS,
  loadAndVerifyBackupSource,
  loadNonSqlitePersistentSources,
  planAndOptionallyApplyMockMigration
} from './phaseB3MigrationEngine';
import {
  computeCanonicalRowsDigest,
  isPhase32DeletedFixtureId,
  sha256Text
} from '../utils/backupManager';

export interface TableParityResult {
  table: string;
  primaryKeyColumn: string;
  sourceCount: number;
  destinationCount: number;
  countsMatch: boolean;
  sourceDigest: string;
  destinationDigest: string;
  digestsMatch: boolean;
  missingRecords: string[];
  unexpectedRecords: string[];
  duplicatePrimaryKeys: string[];
  passed: boolean;
}

export interface ParityVerificationReport {
  verificationLabel: 'MOCK_VERIFICATION';
  liveNeonVerified: false;
  passed: boolean;
  checkedAt: string;
  backupName: string;
  checks: {
    tableCountsAndDigestsMatch: boolean;
    noMissingRecords: boolean;
    noUnexpectedRecords: boolean;
    noDuplicatePrimaryKeys: boolean;
    noDuplicateVisaDetailsProgramId: boolean;
    noForeignKeyViolations: boolean;
    noOrphanRecords: boolean;
    jsonPayloadsValid: boolean;
    markdownDigestsMatch: boolean;
    deletedPhase32FixturesExcluded: boolean;
  };
  duplicateVisaDetailsProgramIds: {
    source: string[];
    destination: string[];
  };
  orphanRecords: {
    visaDetailsWithoutProgram: number;
    claimsWithoutProgram: number;
    evidenceWithoutClaim: number;
    versionsWithoutProgram: number;
  };
  jsonValidationErrors: string[];
  markdownDigestMismatches: string[];
  deletedFixturesFound: string[];
  tables: TableParityResult[];
  errors: string[];
}

export interface VerifyParityOptions {
  sourcePath: string;
  manifestPath?: string;
  projectRoot?: string;
  /** Optional pre-populated isolated mock/PGlite executor (strictly non-Neon). */
  mockDestinationExecutor?: PgExecutor;
  /** When true (default when mockDestinationExecutor is omitted), populates an isolated temp PGlite mock via migration engine first. */
  seedIsolatedMockFromBackup?: boolean;
}

function redactPkForReport(table: string, pk: string, row?: Record<string, unknown>): string {
  if (table === 'slot_subscribers') {
    const emailHash = row?.email
      ? sha256Text(String(row.email).trim().toLowerCase()).slice(0, 12)
      : 'redacted';
    return `${pk}[email_sha256=${emailHash}]`;
  }
  return pk;
}

function validateJsonStringField(label: string, raw: unknown, errors: string[]): void {
  if (raw === null || raw === undefined || raw === '') return;
  if (typeof raw !== 'string') {
    errors.push(`${label}: expected JSON string`);
    return;
  }
  try {
    JSON.parse(raw);
  } catch (err: any) {
    errors.push(`${label}: invalid JSON (${err?.message || 'parse error'})`);
  }
}

export async function verifySqliteMockPostgresParity(
  options: VerifyParityOptions
): Promise<ParityVerificationReport> {
  if (options.mockDestinationExecutor) {
    if (
      options.mockDestinationExecutor.isNeonRemote ||
      options.mockDestinationExecutor.backend === 'neon-postgres'
    ) {
      throw new Error(
        'LIVE_NEON_FORBIDDEN_IN_PHASE_B3: verifySqliteMockPostgresParity refuses live Neon connections. Label is strictly MOCK_VERIFICATION.'
      );
    }
  }

  let ownMockExec: PgExecutor | null = null;
  let destExec: PgExecutor;
  let extraction: ReturnType<typeof loadAndVerifyBackupSource> | null = null;
  let sqliteDb: Database.Database | null = null;

  try {
    if (options.mockDestinationExecutor) {
      destExec = options.mockDestinationExecutor;
    } else {
      ownMockExec = await createPostgresExecutor(undefined, {
        purpose: 'test',
        accessMode: 'migration',
        allowPglite: true,
        requireNeonRemote: false
      });
      destExec = ownMockExec;
    }

    const migRepo = new PostgresImmigrationRepository(destExec);
    await migRepo.runTrackedMigrations(POSTGRES_MIGRATIONS);

    const shouldSeed =
      options.seedIsolatedMockFromBackup !== undefined
        ? options.seedIsolatedMockFromBackup
        : !options.mockDestinationExecutor;

    if (shouldSeed) {
      await planAndOptionallyApplyMockMigration({
        sourcePath: options.sourcePath,
        manifestPath: options.manifestPath,
        projectRoot: options.projectRoot,
        dryRun: false,
        applyToMock: true,
        mockDestinationExecutor: destExec
      });
    }

    extraction = loadAndVerifyBackupSource(options.sourcePath, options.manifestPath, options.projectRoot);
    sqliteDb = new Database(extraction.dbPath, { readonly: true, fileMustExist: true });

    const nonSqlite = loadNonSqlitePersistentSources(extraction.projectFilesRoot, {
      requireAllFiles: true
    });

    const jsonValidationErrors: string[] = [];
    const deletedFixturesFound: string[] = [];
    const errors: string[] = [];

    // 1. Build authoritative source record sets in deterministic PK order
    const sourceSets = new Map<
      string,
      { pkCol: string; columns: readonly string[]; jsonCols: readonly string[]; rows: Array<Record<string, unknown>> }
    >();

    for (const table of SQLITE_TO_PG_IMPORT_ORDER) {
      const spec = TABLE_MAPPING_SPECS[table];
      const rawRows = sqliteDb
        .prepare(`SELECT * FROM "${table}" ORDER BY "${spec.primaryKey}" ASC`)
        .all() as Array<Record<string, unknown>>;

      let finalRows = rawRows;
      if (table === 'changelog_entries') {
        const mergedMap = new Map<string, Record<string, unknown>>();
        for (const r of nonSqlite.changelogEntriesFromJson) mergedMap.set(String(r.id), r);
        for (const r of rawRows) mergedMap.set(String(r.id), r);
        finalRows = Array.from(mergedMap.values()).sort((a, b) =>
          String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0
        );
      }

      for (const r of finalRows) {
        const pk = String(r[spec.primaryKey] ?? '');
        if (isPhase32DeletedFixtureId(pk)) {
          deletedFixturesFound.push(`source:${table}:${pk}`);
        }
        for (const jCol of spec.jsonColumns) {
          validateJsonStringField(`source:${table}(${pk}).${jCol}`, r[jCol], jsonValidationErrors);
        }
      }

      sourceSets.set(table, {
        pkCol: spec.primaryKey,
        columns: spec.columns,
        jsonCols: spec.jsonColumns,
        rows: finalRows
      });
    }

    // Migration 004 non-SQLite sources
    sourceSets.set('slot_embassy_status', {
      pkCol: 'embassy_key',
      columns: MIGRATION_004_TARGET_SPECS.slot_embassy_status.columns,
      jsonCols: [],
      rows: [...nonSqlite.slotEmbassyStatuses].sort((a, b) =>
        String(a.embassy_key).localeCompare(String(b.embassy_key))
      )
    });
    sourceSets.set('slot_subscribers', {
      pkCol: 'id',
      columns: MIGRATION_004_TARGET_SPECS.slot_subscribers.columns,
      jsonCols: [],
      rows: [...nonSqlite.slotSubscribers].sort((a, b) => String(a.id).localeCompare(String(b.id)))
    });
    sourceSets.set('editorial_articles', {
      pkCol: 'slug',
      columns: MIGRATION_004_TARGET_SPECS.editorial_articles.columns,
      jsonCols: ['frontmatter_json'],
      rows: [...nonSqlite.editorialArticles].sort((a, b) => String(a.slug).localeCompare(String(b.slug)))
    });

    // 2. Compare each table between source and destination
    const tableResults: TableParityResult[] = [];
    for (const [table, def] of sourceSets.entries()) {
      const destRes = await destExec.query<Record<string, unknown>>(
        `SELECT * FROM "${table}" ORDER BY "${def.pkCol}" ASC`
      );

      const srcMap = new Map<string, Record<string, unknown>>();
      const srcDupPks: string[] = [];
      for (const r of def.rows) {
        const pk = String(r[def.pkCol]);
        if (srcMap.has(pk)) srcDupPks.push(`source:${redactPkForReport(table, pk, r)}`);
        srcMap.set(pk, r);
      }

      const destMap = new Map<string, Record<string, unknown>>();
      const destDupPks: string[] = [];
      for (const dr of destRes.rows) {
        const pk = String(dr[def.pkCol]);
        if (destMap.has(pk)) destDupPks.push(`dest:${redactPkForReport(table, pk, dr)}`);
        destMap.set(pk, dr);

        if (isPhase32DeletedFixtureId(pk)) {
          deletedFixturesFound.push(`dest:${table}:${pk}`);
        }
        for (const jCol of def.jsonCols) {
          validateJsonStringField(
            `dest:${table}(${redactPkForReport(table, pk, dr)}).${jCol}`,
            dr[jCol],
            jsonValidationErrors
          );
        }
      }

      const missingRecords: string[] = [];
      for (const [pk, sr] of srcMap.entries()) {
        if (!destMap.has(pk)) {
          missingRecords.push(redactPkForReport(table, pk, sr));
        }
      }

      const unexpectedRecords: string[] = [];
      for (const [pk, dr] of destMap.entries()) {
        if (!srcMap.has(pk)) {
          unexpectedRecords.push(redactPkForReport(table, pk, dr));
        }
      }

      const srcDigest = computeCanonicalRowsDigest(table, def.rows, def.pkCol);
      const destDigest = computeCanonicalRowsDigest(table, destRes.rows, def.pkCol);

      const countsMatch = def.rows.length === destRes.rows.length;
      const digestsMatch = srcDigest === destDigest;
      const duplicatePrimaryKeys = [...srcDupPks, ...destDupPks];
      const passed =
        countsMatch &&
        digestsMatch &&
        missingRecords.length === 0 &&
        unexpectedRecords.length === 0 &&
        duplicatePrimaryKeys.length === 0;

      if (!passed) {
        errors.push(
          `Parity mismatch in ${table}: src=${def.rows.length}, dest=${destRes.rows.length}, digestMatch=${digestsMatch}, missing=${missingRecords.length}, unexpected=${unexpectedRecords.length}`
        );
      }

      tableResults.push({
        table,
        primaryKeyColumn: def.pkCol,
        sourceCount: def.rows.length,
        destinationCount: destRes.rows.length,
        countsMatch,
        sourceDigest: srcDigest,
        destinationDigest: destDigest,
        digestsMatch,
        missingRecords,
        unexpectedRecords,
        duplicatePrimaryKeys,
        passed
      });
    }

    // 3. Duplicate visa_details.program_id checks
    const srcDupVd = (
      sqliteDb
        .prepare('SELECT program_id FROM visa_details GROUP BY program_id HAVING COUNT(*) > 1')
        .all() as Array<{ program_id: string }>
    ).map((r) => r.program_id);
    const destDupVdRes = await destExec.query<{ program_id: string }>(
      'SELECT program_id FROM visa_details GROUP BY program_id HAVING COUNT(*) > 1'
    );
    const destDupVd = destDupVdRes.rows.map((r) => r.program_id);

    // 4. Foreign-key & orphan checks in destination
    const destIntegrity = await migRepo.auditIntegrity();
    const fkRowsSqlite = sqliteDb.pragma('foreign_key_check') as Array<unknown>;
    const noFkViolations = fkRowsSqlite.length === 0;
    if (!noFkViolations) {
      errors.push(`SQLite source foreign_key_check returned ${fkRowsSqlite.length} violation(s).`);
    }

    const orphanRecords = {
      visaDetailsWithoutProgram: destIntegrity.orphans.visaDetailsWithoutProgram,
      claimsWithoutProgram: destIntegrity.orphans.claimsWithoutProgram,
      evidenceWithoutClaim: destIntegrity.orphans.evidenceWithoutClaim,
      versionsWithoutProgram: destIntegrity.orphans.versionsWithoutProgram
    };
    const noOrphanRecords =
      orphanRecords.visaDetailsWithoutProgram === 0 &&
      orphanRecords.claimsWithoutProgram === 0 &&
      orphanRecords.evidenceWithoutClaim === 0 &&
      orphanRecords.versionsWithoutProgram === 0;
    if (!noOrphanRecords) {
      errors.push(`Destination orphan records detected: ${JSON.stringify(orphanRecords)}`);
    }

    // 5. Verify Markdown frontmatter + body content digests match editorial_articles in destination
    const markdownDigestMismatches: string[] = [];
    const destArticlesRes = await destExec.query<{
      slug: string;
      status: string;
      title: string;
      frontmatter_json: string;
      markdown_body: string;
      source_origin: string;
    }>('SELECT slug, status, title, frontmatter_json, markdown_body, source_origin FROM editorial_articles');
    const destByOrigin = new Map(destArticlesRes.rows.map((r) => [r.source_origin, r]));

    for (const [origin, expectedDigest] of Object.entries(nonSqlite.markdownDigests)) {
      const destArt = destByOrigin.get(origin);
      if (!destArt) {
        markdownDigestMismatches.push(`missing:${origin}`);
        continue;
      }
      let parsedFm: Record<string, unknown> = {};
      try {
        parsedFm = JSON.parse(destArt.frontmatter_json || '{}');
      } catch {
        markdownDigestMismatches.push(`invalid_frontmatter_json:${origin}`);
        continue;
      }
      const actualDigest = sha256Text(
        JSON.stringify({
          slug: destArt.slug,
          status: destArt.status,
          title: destArt.title,
          frontmatter: parsedFm,
          markdownBody: destArt.markdown_body
        })
      );
      if (actualDigest !== expectedDigest) {
        markdownDigestMismatches.push(`digest_mismatch:${origin}`);
      }
    }
    if (markdownDigestMismatches.length > 0) {
      errors.push(`Markdown content digest mismatches: ${markdownDigestMismatches.join(', ')}`);
    }

    const checks = {
      tableCountsAndDigestsMatch: tableResults.every((t) => t.countsMatch && t.digestsMatch),
      noMissingRecords: tableResults.every((t) => t.missingRecords.length === 0),
      noUnexpectedRecords: tableResults.every((t) => t.unexpectedRecords.length === 0),
      noDuplicatePrimaryKeys: tableResults.every((t) => t.duplicatePrimaryKeys.length === 0),
      noDuplicateVisaDetailsProgramId: srcDupVd.length === 0 && destDupVd.length === 0,
      noForeignKeyViolations: noFkViolations,
      noOrphanRecords,
      jsonPayloadsValid: jsonValidationErrors.length === 0,
      markdownDigestsMatch: markdownDigestMismatches.length === 0,
      deletedPhase32FixturesExcluded: deletedFixturesFound.length === 0
    };

    const passed = Object.values(checks).every(Boolean) && errors.length === 0;

    return {
      verificationLabel: 'MOCK_VERIFICATION',
      liveNeonVerified: false,
      passed,
      checkedAt: new Date().toISOString(),
      backupName: extraction.manifest.backupName,
      checks,
      duplicateVisaDetailsProgramIds: {
        source: srcDupVd,
        destination: destDupVd
      },
      orphanRecords,
      jsonValidationErrors,
      markdownDigestMismatches,
      deletedFixturesFound,
      tables: tableResults,
      errors
    };
  } finally {
    closeSqliteDatabase(sqliteDb);
    if (ownMockExec) {
      await ownMockExec.close();
    }
    if (extraction) {
      extraction.cleanup();
    }
  }
}
