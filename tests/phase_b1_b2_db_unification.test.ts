import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  DEFAULT_POSTGRES_TIMEOUTS,
  DatabaseConfigurationError,
  POSTGRES_MIGRATIONS,
  POSTGRES_MIGRATION_004,
  PostgresImmigrationRepository,
  buildPgPoolConfig,
  buildSessionInitSql,
  createPostgresExecutor,
  isDatabaseConfigurationError,
  isPlaceholderConnectionString,
  isProductionEnvironment,
  validatePostgresConnectionUrl,
  type PgExecutor
} from '../src/db/postgresDatabase';
import {
  closeAllDatabaseProviders,
  getDatabaseRuntimeDiagnostics,
  getMigrationRepository,
  getReadOnlyRepository,
  getReadWriteRepository,
  resolveConfiguredDatabaseDriver,
  validateDatabaseProviderConfig
} from '../src/db/databaseProvider';
import { closeSqliteDatabase, openSqliteDatabase } from '../src/db/sqliteCore';
import { getSecurityHeaders, isAiStudioPreviewRequest } from '../src/utils/securityHardening';

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function makeFullProgram(id: string, suffix: string) {
  return {
    id,
    country_code: suffix === 'v1' ? 'US' : 'CA',
    category: suffix === 'v1' ? 'work' : 'pr',
    official_name: `Program Name ${suffix}`,
    local_language_name: `Local Name ${suffix}`,
    legal_basis: `Statute ${suffix}`,
    classification_type: `Classification ${suffix}`,
    eligibility: `Eligibility ${suffix}`,
    nationality_restrictions: `Restrictions ${suffix}`,
    age_requirements: `Age ${suffix}`,
    education_requirements: `Education ${suffix}`,
    work_experience_requirements: `Experience ${suffix}`,
    min_salary_or_income: `Salary ${suffix}`,
    investment_requirement: `Investment ${suffix}`,
    required_funds_and_proof: `Funds ${suffix}`,
    residency_duration: `Duration ${suffix}`,
    renewal_rules: `Renewal ${suffix}`,
    pr_or_citizenship_transition: `Transition ${suffix}`,
    family_inclusion_rules: `Family ${suffix}`,
    work_and_study_rights: `Rights ${suffix}`,
    restrictions_and_exceptions: `Exceptions ${suffix}`,
    required_documents_json: JSON.stringify([`Passport-${suffix}`, `Proof-${suffix}`]),
    documents_and_formats: `Formats ${suffix}`,
    translation_attestation_requirements: `Translation ${suffix}`,
    application_procedure: `Procedure ${suffix}`,
    government_fees: `Fees ${suffix}`,
    processing_time: `Processing ${suffix}`,
    apply_from: `ApplyFrom ${suffix}`,
    official_application_url: `https://official.gov/${suffix}/apply`,
    official_information_url: `https://official.gov/${suffix}/info`,
    source_authority: `Authority ${suffix}`,
    source_last_updated: suffix === 'v1' ? '2026-01-01' : '2026-11-22',
    last_checked_date: suffix === 'v1' ? '2026-02-01' : '2026-11-22',
    verification_evidence: `Evidence ${suffix}`,
    verification_status: suffix === 'v1' ? 'DRAFT' : 'AVAILABLE_VERIFIED',
    updated_at: suffix === 'v1' ? '2026-02-01T00:00:00.000Z' : '2026-11-22T12:00:00.000Z'
  };
}

test('Task B.1 Security: strict TLS verification enforced, no rejectUnauthorized:false anywhere, bounded timeouts configured', () => {
  const src = fs.readFileSync(path.join(process.cwd(), 'src/db/postgresDatabase.ts'), 'utf-8');
  assert.equal(/rejectUnauthorized\s*:\s*false/.test(src), false, 'postgresDatabase.ts must never disable TLS verification');

  const validAppUrl = 'postgresql://visaapply_app_rw:placeholder_not_real@ep-cool-host-pooler.us-east-2.aws.neon.tech/neondb?sslmode=verify-full';
  const { validated, timeouts, poolConfig } = buildPgPoolConfig(validAppUrl, {
    purpose: 'app_rw',
    env: { NODE_ENV: 'production', VERCEL: '1' }
  });

  assert.equal(validated.isNeonHost, true);
  assert.equal(validated.isPooledHost, true);
  assert.equal(validated.requiresTls, true);
  assert.deepEqual(poolConfig.ssl, { rejectUnauthorized: true });
  assert.equal(poolConfig.max, 3); // Vercel serverless cap
  assert.equal(poolConfig.connectionTimeoutMillis, DEFAULT_POSTGRES_TIMEOUTS.connectionTimeoutMillis);
  assert.equal(poolConfig.idleTimeoutMillis, DEFAULT_POSTGRES_TIMEOUTS.idleTimeoutMillis);
  assert.equal(poolConfig.query_timeout, DEFAULT_POSTGRES_TIMEOUTS.queryTimeoutMs);
  assert.equal(timeouts.statementTimeoutMs, 10000);
  assert.equal(timeouts.lockTimeoutMs, 5000);
  assert.equal(timeouts.idleInTransactionSessionTimeoutMs, 15000);

  // Reject insecure sslmodes on Neon / production
  for (const badMode of ['disable', 'allow', 'prefer', 'no-verify']) {
    assert.throws(
      () =>
        validatePostgresConnectionUrl(
          `postgresql://visaapply_app_rw:secret_xyz@ep-real.us-east-2.aws.neon.tech/neondb?sslmode=${badMode}`,
          { purpose: 'app_rw', env: { NODE_ENV: 'production' } }
        ),
      (err: any) => {
        assert.match(String(err.message), /POSTGRES_INSECURE_TLS_FORBIDDEN/);
        assert.equal(String(err.message).includes('secret_xyz'), false, 'Error must never leak password');
        return true;
      }
    );
  }

  // Reject localhost on Vercel
  assert.throws(
    () =>
      validatePostgresConnectionUrl('postgresql://visaapply_app_rw:secret_xyz@127.0.0.1:5432/neondb?sslmode=require', {
        purpose: 'app_rw',
        env: { VERCEL: '1' }
      }),
    /POSTGRES_LOCALHOST_FORBIDDEN_ON_VERCEL/
  );

  // Reject owner/superuser roles on runtime readonly and app_rw endpoints
  for (const ownerUser of ['neondb_owner', 'postgres', 'custom_owner']) {
    assert.throws(
      () =>
        validatePostgresConnectionUrl(
          `postgresql://${ownerUser}:secret_owner_pw@ep-real.us-east-2.aws.neon.tech/neondb?sslmode=verify-full`,
          { purpose: 'app_rw', env: { NODE_ENV: 'production' } }
        ),
      (err: any) => {
        assert.match(String(err.message), /OWNER_ROLE_FORBIDDEN_IN_RUNTIME/);
        assert.equal(String(err.message).includes('secret_owner_pw'), false);
        return true;
      }
    );
    assert.throws(
      () =>
        validatePostgresConnectionUrl(
          `postgresql://${ownerUser}:secret_owner_pw@ep-real.us-east-2.aws.neon.tech/neondb?sslmode=verify-full`,
          { purpose: 'readonly', env: { NODE_ENV: 'production' } }
        ),
      /OWNER_ROLE_FORBIDDEN_IN_RUNTIME/
    );
  }

  // Migration purpose permits owner role on NEON_MIGRATION_DATABASE_URL
  const migValidated = validatePostgresConnectionUrl(
    'postgresql://neondb_owner:secret_mig_pw@ep-real.us-east-2.aws.neon.tech/neondb?sslmode=verify-full',
    { purpose: 'migration', env: { NODE_ENV: 'production' } }
  );
  assert.equal(migValidated.username, 'neondb_owner');
});

test('Task B.1 + B.2 Security: production and Vercel fail closed with zero silent PGlite or SQLite fallback', async () => {
  const prodEnv: NodeJS.ProcessEnv = { NODE_ENV: 'production' };
  const vercelEnv: NodeJS.ProcessEnv = { VERCEL: '1', DB_DRIVER: 'sqlite', ALLOW_PGLITE_FALLBACK: 'true' };

  assert.equal(isProductionEnvironment(prodEnv), true);
  assert.equal(isProductionEnvironment(vercelEnv), true);
  assert.equal(resolveConfiguredDatabaseDriver(vercelEnv), 'postgres');

  // Even when allowPglite or requireNeonRemote:false is passed, production/Vercel MUST fail closed
  await assert.rejects(
    () => createPostgresExecutor(undefined, { purpose: 'app_rw', allowPglite: true, env: prodEnv }),
    /POSTGRES_CREDENTIALS_MISSING/
  );
  await assert.rejects(
    () => createPostgresExecutor(undefined, { purpose: 'readonly', requireNeonRemote: false, env: vercelEnv }),
    /POSTGRES_CREDENTIALS_MISSING/
  );
  await assert.rejects(
    () =>
      createPostgresExecutor(
        'postgresql://visaapply_app_rw:pw@ep-real.us-east-2.aws.neon.tech/neondb?sslmode=verify-full',
        { purpose: 'app_rw', allowPglite: true, env: prodEnv }
      ),
    /PRODUCTION_PGLITE_FORBIDDEN/
  );

  // Unified databaseProvider fails closed in Vercel even if DB_DRIVER=sqlite and ALLOW_PGLITE_FALLBACK=true
  await assert.rejects(() => getReadOnlyRepository({ env: vercelEnv, disableCache: true }), /POSTGRES_CREDENTIALS_MISSING/);
  await assert.rejects(() => getReadWriteRepository({ env: vercelEnv, disableCache: true }), /POSTGRES_CREDENTIALS_MISSING/);
  await assert.rejects(() => getMigrationRepository({ env: vercelEnv }), /POSTGRES_CREDENTIALS_MISSING/);

  // Non-production without explicit PGlite opt-in also fails closed (no silent fallback!)
  await assert.rejects(
    () => createPostgresExecutor(undefined, { purpose: 'app_rw', env: { NODE_ENV: 'development' } }),
    /REMOTE_NEON_REQUIRED/
  );

  const diag = getDatabaseRuntimeDiagnostics(vercelEnv);
  assert.equal(diag.environment, 'production');
  assert.equal(diag.isVercel, true);
  assert.equal(diag.effectiveDriver, 'postgres');
  assert.equal(diag.sqlitePermitted, false);
  assert.equal(diag.pglitePermitted, false);
});

test('Task B.2 Security: SQLite is NEVER eagerly opened during module import in Vercel production', () => {
  const script = `
    import { isSqliteDbInitialized, db } from './src/db/immigrationDatabase';
    import { getDatabaseRuntimeDiagnostics, resolveConfiguredDatabaseDriver } from './src/db/databaseProvider';

    const initializedAfterImport = isSqliteDbInitialized();
    const effectiveDriver = resolveConfiguredDatabaseDriver();
    const diag = getDatabaseRuntimeDiagnostics();
    let sqliteBlocked = false;
    try {
      db.prepare('SELECT 1');
    } catch (err) {
      sqliteBlocked = String(err && err.message || err).includes('SQLITE_FORBIDDEN_IN_PRODUCTION');
    }
    console.log(JSON.stringify({ initializedAfterImport, effectiveDriver, sqlitePermitted: diag.sqlitePermitted, sqliteBlocked }));
  `;

  const stdout = execFileSync('npx', ['tsx', '-e', script], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      VERCEL: '1',
      VERCEL_ENV: 'production',
      DB_DRIVER: 'sqlite'
    },
    encoding: 'utf-8'
  });

  const result = JSON.parse(stdout.trim());
  assert.equal(result.initializedAfterImport, false, 'SQLite must NOT be initialized on module import');
  assert.equal(result.effectiveDriver, 'postgres');
  assert.equal(result.sqlitePermitted, false);
  assert.equal(result.sqliteBlocked, true, 'Accessing SQLite db proxy in Vercel production must fail closed');
});

test('Task B.1 Repository Fixes (isolated in-memory PGlite — NOT live Neon): 36-field program upsert, vd- normalization, batch redaction, Migration 004 UNIQUE constraint & new tables, full parity methods', async () => {
  const pgExec = await createPostgresExecutor(undefined, {
    purpose: 'migration',
    accessMode: 'migration',
    allowPglite: true,
    env: { NODE_ENV: 'test' }
  });
  const repo = new PostgresImmigrationRepository(pgExec);

  try {
    assert.equal(pgExec.isNeonRemote, false);
    assert.equal(pgExec.backend, 'pglite-test');

    // 1. Tracked migrations including Migration 004 definition (executed ONLY on isolated in-memory PGlite)
    const migRes = await repo.runTrackedMigrations();
    assert.equal(migRes.newlyApplied.length, POSTGRES_MIGRATIONS.length);
    assert.ok(migRes.newlyApplied.includes(POSTGRES_MIGRATION_004.version));

    const applied = await repo.getAppliedMigrations();
    assert.equal(applied.length, 4);

    // 2. Defect 1 Fix: saveImmigrationProgram updates ALL 35 mutable columns (not just 3)
    const v1 = makeFullProgram('prog-full-update-1', 'v1');
    const v2 = makeFullProgram('prog-full-update-1', 'v2');
    await repo.saveImmigrationProgram(v1);
    await repo.saveImmigrationProgram(v2);

    const fetched = await repo.getImmigrationProgram('prog-full-update-1');
    assert.ok(fetched);
    for (const [col, expectedVal] of Object.entries(v2)) {
      assert.equal(fetched[col], expectedVal, `Column "${col}" was not updated on saveImmigrationProgram conflict`);
    }
    const allProgs = await repo.getAllImmigrationPrograms();
    assert.equal(allProgs.length, 1);

    // 3. Defect 2 Fix: saveVisaDetails normalizes vd- prefix consistently with SQLite
    await repo.saveVisaDetails({
      id: 'vd-mismatched-prefix',
      programId: 'prog-full-update-1',
      visaOverview: { name: 'Normalized Visa', fee: '$100' },
      verificationStatus: 'DRAFT'
    });
    const loadedVd = await repo.getVisaDetails('prog-full-update-1');
    assert.ok(loadedVd);
    assert.equal(loadedVd.id, 'vd-prog-full-update-1', 'Mismatched vd- prefix must normalize to vd-<programId>');

    // Migration 004 UNIQUE constraint on visa_details(program_id) blocks duplicate program rows
    await assert.rejects(
      () =>
        repo.saveVisaDetails({
          id: 'custom-non-vd-duplicate-id',
          programId: 'prog-full-update-1',
          verificationStatus: 'DRAFT'
        }),
      /unique|duplicate/i
    );

    const allDetails = await repo.getAllVisaDetails();
    assert.equal(allDetails.length, 1);

    // 4. Defect 3 Fix: saveBatchStateToDb redacts secrets in lastError & auditLogs
    await repo.saveBatchStateToDb({
      currentBatchIndex: 2,
      totalBatches: 10,
      batchSize: 25,
      retryAndMissedRunHandling: {
        retryCount: 1,
        maxRetries: 3,
        autoResumeOnMissed: true,
        lastError: 'Failed with postgresql://visaapply_app_rw:TopSecretPW99@ep-real.neon.tech/neondb Bearer SecretToken999999'
      },
      auditLogs: [
        {
          timestamp: '2026-11-22T00:00:00Z',
          message: 'Leaked AIzaSySecretKey1234567890123 and NEON_APP_DATABASE_URL=postgresql://u:p@host/db',
          password: 'plain-password-value'
        }
      ]
    });
    const loadedBatch = await repo.getBatchStateFromDb();
    assert.ok(loadedBatch);
    assert.equal(String(loadedBatch.retryAndMissedRunHandling.lastError).includes('TopSecretPW99'), false);
    assert.equal(String(loadedBatch.retryAndMissedRunHandling.lastError).includes('SecretToken999999'), false);
    const logsSerialized = JSON.stringify(loadedBatch.auditLogs);
    assert.equal(logsSerialized.includes('AIzaSySecretKey'), false);
    assert.equal(logsSerialized.includes('plain-password-value'), false);

    // 5. Missing core methods parity: changelog, claims, claimById, evidence, operational events, integrity audit
    await repo.saveChangelogEntryToDb({
      id: 'chg-1',
      date: '2026-11-22',
      countryCode: 'CA',
      countryName: 'Canada',
      changeType: 'FEE_UPDATE',
      title: 'Fee adjustment',
      oldValue: '$100',
      newValue: '$120',
      sourceUrl: 'https://www.canada.ca/immigration',
      autoBlogSlug: 'ca-fee-update',
      emailNotified: 'Bearer SecretEmailToken12345',
      verifiedBy: 'admin'
    });
    const changelogs = await repo.getChangelogFromDb();
    assert.equal(changelogs.length, 1);
    assert.equal(changelogs[0].emailNotified.includes('SecretEmailToken12345'), false);

    await repo.saveVisaClaim({
      id: 'clm-b1-1',
      programId: 'prog-full-update-1',
      section: 'fees',
      description: 'Official fee',
      value: '120',
      unit: 'CAD',
      status: 'VERIFIED'
    });
    await repo.saveVisaEvidence({
      id: 'ev-b1-1',
      claimId: 'clm-b1-1',
      sourceUrl: 'https://www.canada.ca/immigration',
      status: 'VERIFIED_OFFICIAL'
    });
    assert.equal((await repo.getVisaClaims('prog-full-update-1')).length, 1);
    assert.equal((await repo.getVisaClaimById('clm-b1-1'))?.status, 'VERIFIED');
    assert.equal((await repo.getVisaEvidence('clm-b1-1')).length, 1);

    await repo.insertOperationalEvent({
      id: 'evt-b1-1',
      timestamp: '2026-11-22T12:00:00.000Z',
      category: 'MIGRATION_EVENT',
      severity: 'INFO',
      component: 'test-suite',
      message: 'Checked postgresql://user:secretpass@host/db',
      details: { apiKey: 'hidden-secret' }
    });
    const opEvents = await repo.getOperationalEvents(10);
    assert.equal(opEvents.length, 1);
    assert.equal(opEvents[0].message.includes('secretpass'), false);
    assert.equal(JSON.stringify(opEvents[0].details).includes('hidden-secret'), false);

    const integrity = await repo.auditIntegrity();
    assert.equal(integrity.ok, true);
    assert.equal(integrity.appliedMigrationsCount, 4);
    assert.equal(integrity.duplicates.visaDetailsProgramId.length, 0);

    // 6. Migration 004 unified tables CRUD (slot alerts, editorial articles, revoked admin sessions)
    await repo.saveSlotSubscriber({
      id: 'sub-1',
      email: 'Applicant@Example.ORG',
      country: 'USA',
      city: 'Delhi',
      visaType: 'B1/B2',
      language: 'en'
    });
    assert.equal(await repo.getSlotSubscriberCount(true), 1);
    // Case-insensitive duplicate subscription blocked by unique index
    await assert.rejects(
      () =>
        repo.saveSlotSubscriber({
          id: 'sub-2',
          email: 'applicant@example.org',
          country: 'USA',
          city: 'Delhi',
          visaType: 'B1/B2',
          language: 'en'
        }),
      /unique|duplicate/i
    );
    assert.equal(await repo.deactivateSlotSubscriber('sub-1'), true);
    assert.equal(await repo.getSlotSubscriberCount(true), 0);
    assert.equal(await repo.getSlotSubscriberCount(false), 1);

    await repo.upsertSlotEmbassyStatus({
      embassyKey: 'USA Delhi',
      country: 'USA',
      city: 'Delhi',
      status: 'WAITLIST',
      earliestDate: '2027-02-15',
      bookingLink: 'https://www.visaapply.org/embassy-slot-alert',
      lastCheckedAt: '2026-11-22T12:00:00.000Z'
    });
    const embassies = await repo.getSlotEmbassyStatuses();
    assert.equal(embassies.length, 1);
    assert.equal(embassies[0].embassyKey, 'USA Delhi');

    await repo.logSlotEmailDelivery({
      id: 'elog-1',
      embassyKey: 'USA Delhi',
      recipientHash: 'sha256:abcdef',
      status: 'SENT',
      providerMessageId: 'msg-123',
      sentAt: '2026-11-22T12:05:00.000Z'
    });
    assert.equal((await repo.getSlotEmailLogs(10)).length, 1);

    await repo.saveEditorialArticle({
      slug: 'in-to-ca-tourist',
      status: 'draft',
      title: 'India to Canada Tourist Visa',
      frontmatter: { origin: 'IN', destination: 'CA' },
      markdownBody: '# Draft content'
    });
    assert.equal((await repo.getEditorialArticles('draft')).length, 1);
    await repo.saveEditorialArticle({
      slug: 'in-to-ca-tourist',
      status: 'published',
      title: 'India to Canada Tourist Visa',
      frontmatter: { origin: 'IN', destination: 'CA' },
      markdownBody: '# Published content'
    });
    assert.equal((await repo.getEditorialArticleBySlug('in-to-ca-tourist'))?.status, 'published');
    assert.equal(await repo.deleteEditorialArticle('in-to-ca-tourist'), true);

    const futureIso = new Date(Date.now() + 60_000).toISOString();
    const pastIso = new Date(Date.now() - 60_000).toISOString();
    await repo.revokeAdminSessionJti('jti-active-1', futureIso);
    await repo.revokeAdminSessionJti('jti-expired-1', pastIso);
    assert.equal(await repo.isAdminSessionRevoked('jti-active-1'), true);
    assert.equal(await repo.isAdminSessionRevoked('jti-expired-1'), false);
    assert.equal(await repo.pruneExpiredRevokedSessions(), 1);
  } finally {
    await repo.close();
  }
});

test('Task B.2 Unified Provider: read-only vs read-write role isolation, runtime DDL denial, and explicit local-dev SQLite isolation', async () => {
  // 1. Read-only PostgreSQL repository rejects all writes and DDL
  const roExec = await createPostgresExecutor(undefined, {
    purpose: 'readonly',
    accessMode: 'readonly',
    allowPglite: true,
    env: { NODE_ENV: 'test' }
  });
  const roRepoRaw = new PostgresImmigrationRepository(roExec);
  try {
    await assert.rejects(() => roRepoRaw.saveBatchStateToDb({}), /READONLY_REPOSITORY_WRITE_DENIED/);
    await assert.rejects(() => roRepoRaw.runTrackedMigrations(), /READONLY_REPOSITORY_DDL_DENIED/);
  } finally {
    await roRepoRaw.close();
  }

  // 2. Runtime app_rw remote executor forbids DDL migrations even if called directly
  const fakeRemoteAppExec = {
    isNeonRemote: true,
    accessMode: 'readwrite' as const,
    backend: 'neon-postgres' as const,
    purpose: 'app_rw' as const,
    async query() {
      return { rows: [], rowCount: 0 };
    },
    async transaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
      return fn(fakeRemoteAppExec);
    },
    async close() {}
  };
  const remoteAppRepo = new PostgresImmigrationRepository(fakeRemoteAppExec);
  await assert.rejects(() => remoteAppRepo.runTrackedMigrations(), /RUNTIME_DDL_FORBIDDEN/);
  await assert.rejects(() => remoteAppRepo.applyPhase31Migrations(), /RUNTIME_DDL_FORBIDDEN/);

  // 3. Provider proxies omit DDL methods on runtime repositories
  const roProvider = await getReadOnlyRepository({
    allowPglite: true,
    disableCache: true,
    env: { NODE_ENV: 'test' }
  });
  const rwProvider = await getReadWriteRepository({
    allowPglite: true,
    disableCache: true,
    env: { NODE_ENV: 'test' }
  });
  try {
    assert.equal(roProvider.accessMode, 'readonly');
    assert.equal(rwProvider.accessMode, 'readwrite');
    assert.equal('saveVisaDetails' in roProvider, false, 'ReadOnly repository must not expose write methods');
    assert.equal('runTrackedMigrations' in rwProvider, false, 'Runtime ReadWrite repository must not expose DDL methods');
  } finally {
    await roProvider.close();
    await rwProvider.close();
    await closeAllDatabaseProviders();
  }

  // 4. Explicit local-dev SQLite via isolated temp DB (NEVER touches data_db/immigration_hub.db)
  const tmpDir = makeTempDir('phase-b2-sqlite-');
  const tmpDbPath = path.join(tmpDir, 'local_dev_test.db');
  try {
    // Initialize isolated temp DB cleanly first
    const initDb = openSqliteDatabase(tmpDbPath);
    closeSqliteDatabase(initDb);

    const localDevEnv: NodeJS.ProcessEnv = {
      NODE_ENV: 'development',
      DB_DRIVER: 'sqlite',
      VISAAPPLY_SQLITE_PATH: tmpDbPath
    };

    const sqliteRw = await getReadWriteRepository({ env: localDevEnv, disableCache: true });
    try {
      assert.equal(sqliteRw.backend, 'sqlite-local');
      await sqliteRw.saveImmigrationProgram(makeFullProgram('sqlite-prog-1', 'v1'));
      await sqliteRw.saveImmigrationProgram(makeFullProgram('sqlite-prog-1', 'v2'));
      const p = await sqliteRw.getImmigrationProgram('sqlite-prog-1');
      assert.equal(p?.country_code, 'CA');
      assert.equal(p?.government_fees, 'Fees v2');
    } finally {
      await sqliteRw.close();
    }

    const sqliteRo = await getReadOnlyRepository({ env: localDevEnv, disableCache: true });
    try {
      assert.equal(sqliteRo.backend, 'sqlite-local');
      assert.equal(sqliteRo.accessMode, 'readonly');
      assert.equal((await sqliteRo.getImmigrationProgram('sqlite-prog-1'))?.official_name, 'Program Name v2');
    } finally {
      await sqliteRo.close();
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Task B.2 SQL artifact: docs/NEON_APP_ROLE_SETUP.sql enforces least-privilege grants with no DDL or hardcoded passwords', () => {
  const sql = fs.readFileSync(path.join(process.cwd(), 'docs/NEON_APP_ROLE_SETUP.sql'), 'utf-8');
  assert.match(sql, /CREATE ROLE visaapply_app_rw WITH/i);
  assert.match(sql, /NOSUPERUSER/);
  assert.match(sql, /NOCREATEDB/);
  assert.match(sql, /NOCREATEROLE/);
  assert.match(sql, /REVOKE CREATE ON SCHEMA public FROM visaapply_app_rw/i);
  assert.match(sql, /REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER\s+ON TABLE public\.schema_migrations\s+FROM visaapply_app_rw/i);
  assert.match(sql, /statement_timeout = '10s'/);
  assert.match(sql, /lock_timeout = '5s'/);
  assert.match(sql, /idle_in_transaction_session_timeout = '15s'/);
  assert.match(sql, /<REPLACE_WITH_MIN_32_CHAR_PASSWORD>/);
});

test('Task B.1 + B.2 Fail-Safe Errors: structured DatabaseConfigurationError (HTTP 503, safe public message, placeholder & protocol rejection)', async () => {
  const prodEnv: NodeJS.ProcessEnv = { NODE_ENV: 'production', VERCEL: '1' };

  await assert.rejects(
    () => getReadOnlyRepository({ env: prodEnv, disableCache: true }),
    (err: unknown) => {
      assert.equal(isDatabaseConfigurationError(err), true);
      const dbErr = err as DatabaseConfigurationError;
      assert.equal(dbErr.code, 'POSTGRES_CREDENTIALS_MISSING');
      assert.equal(dbErr.httpStatus, 503);
      assert.equal(dbErr.publicMessage, 'Database service is temporarily unavailable.');
      assert.equal(dbErr.envVarName, 'NEON_READONLY_DATABASE_URL');
      return true;
    }
  );

  const placeholderEnv: NodeJS.ProcessEnv = {
    NODE_ENV: 'production',
    VERCEL: '1',
    NEON_APP_DATABASE_URL:
      'postgresql://visaapply_app_rw:<REPLACE_WITH_MIN_32_CHAR_PASSWORD>@ep-staging-pooler.us-east-2.aws.neon.tech/neondb?sslmode=verify-full'
  };
  assert.equal(isPlaceholderConnectionString(placeholderEnv.NEON_APP_DATABASE_URL!), true);
  await assert.rejects(
    () => getReadWriteRepository({ env: placeholderEnv, disableCache: true }),
    (err: unknown) => {
      assert.equal(isDatabaseConfigurationError(err), true);
      const dbErr = err as DatabaseConfigurationError;
      assert.equal(dbErr.code, 'POSTGRES_PLACEHOLDER_URL');
      assert.equal(dbErr.httpStatus, 503);
      assert.equal(dbErr.message.includes('REPLACE_WITH_MIN_32_CHAR_PASSWORD'), false);
      return true;
    }
  );

  assert.throws(
    () =>
      validatePostgresConnectionUrl('mysql://user:SuperSecretPass123@ep-real.us-east-2.aws.neon.tech/neondb', {
        purpose: 'app_rw',
        env: prodEnv
      }),
    (err: unknown) => {
      assert.equal(isDatabaseConfigurationError(err), true);
      assert.equal((err as DatabaseConfigurationError).code, 'POSTGRES_INVALID_PROTOCOL');
      assert.equal((err as Error).message.includes('SuperSecretPass123'), false);
      return true;
    }
  );

  assert.throws(
    () =>
      validatePostgresConnectionUrl('not a valid uri SuperSecretPass456', {
        purpose: 'readonly',
        env: prodEnv
      }),
    (err: unknown) => {
      assert.equal(isDatabaseConfigurationError(err), true);
      assert.equal((err as DatabaseConfigurationError).code, 'POSTGRES_INVALID_URI');
      assert.equal((err as Error).message.includes('SuperSecretPass456'), false);
      return true;
    }
  );

  await assert.rejects(
    () => getReadOnlyRepository({ env: { NODE_ENV: 'development', DB_DRIVER: 'sqlite' }, disableCache: true }),
    (err: unknown) => {
      assert.equal(isDatabaseConfigurationError(err), true);
      assert.equal((err as DatabaseConfigurationError).code, 'SQLITE_PATH_REQUIRED');
      assert.equal((err as DatabaseConfigurationError).httpStatus, 503);
      return true;
    }
  );
});

test('Task B.2 Pre-Flight Validator: validateDatabaseProviderConfig verifies staging/prod configs with zero network sockets and zero secret echoes', () => {
  const emptyProd = validateDatabaseProviderConfig({
    NODE_ENV: 'production',
    VERCEL: '1',
    DB_DRIVER: 'sqlite',
    ALLOW_PGLITE_FALLBACK: 'true'
  });
  assert.equal(emptyProd.ready, false);
  assert.equal(emptyProd.effectiveDriver, 'postgres');
  assert.equal(emptyProd.roles.readonly.code, 'POSTGRES_CREDENTIALS_MISSING');
  assert.equal(emptyProd.roles.appReadWrite.code, 'POSTGRES_CREDENTIALS_MISSING');
  assert.ok(emptyProd.warnings.some((w) => w.includes('DB_DRIVER=sqlite is ignored')));
  assert.ok(emptyProd.warnings.some((w) => w.includes('ALLOW_PGLITE_FALLBACK=true is ignored')));

  const roSecret = 'mock_ro_secret_value_never_echoed_123456';
  const rwSecret = 'mock_rw_secret_value_never_echoed_789012';
  const validStaging = validateDatabaseProviderConfig({
    NODE_ENV: 'production',
    VERCEL: '1',
    NEON_READONLY_DATABASE_URL: `postgresql://visaapply_audit_ro:${roSecret}@ep-staging-01-pooler.us-east-2.aws.neon.tech/neondb?sslmode=verify-full`,
    NEON_APP_DATABASE_URL: `postgresql://visaapply_app_rw:${rwSecret}@ep-staging-01-pooler.us-east-2.aws.neon.tech/neondb?sslmode=verify-full`
  });
  assert.equal(validStaging.ready, true);
  assert.equal(validStaging.errors.length, 0);
  assert.equal(validStaging.warnings.length, 0);
  assert.equal(validStaging.roles.readonly.valid, true);
  assert.equal(validStaging.roles.readonly.isPooledHost, true);
  assert.equal(validStaging.roles.appReadWrite.valid, true);
  assert.equal(validStaging.roles.appReadWrite.isPooledHost, true);
  const serializedValid = JSON.stringify(validStaging);
  assert.equal(serializedValid.includes(roSecret), false);
  assert.equal(serializedValid.includes(rwSecret), false);

  const misconfiguredRoles = validateDatabaseProviderConfig({
    NODE_ENV: 'production',
    VERCEL: '1',
    NEON_READONLY_DATABASE_URL: `postgresql://visaapply_app_rw:${rwSecret}@ep-staging-01.us-east-2.aws.neon.tech/neondb?sslmode=verify-full`,
    NEON_APP_DATABASE_URL: `postgresql://visaapply_app_rw:${rwSecret}@ep-staging-01.us-east-2.aws.neon.tech/neondb?sslmode=verify-full`,
    NEON_MIGRATION_DATABASE_URL: `postgresql://neondb_owner:mig_secret_xyz@ep-staging-01-pooler.us-east-2.aws.neon.tech/neondb?sslmode=verify-full`
  });
  assert.equal(misconfiguredRoles.ready, true);
  assert.ok(misconfiguredRoles.warnings.some((w) => w.includes('same database role username')));
  assert.ok(misconfiguredRoles.warnings.some((w) => w.includes('NEON_MIGRATION_DATABASE_URL should NOT be set in Vercel')));
  assert.ok(misconfiguredRoles.warnings.some((w) => w.includes('direct (non-pooled) endpoint')));
  assert.equal(JSON.stringify(misconfiguredRoles).includes('mig_secret_xyz'), false);

  const localSqlite = validateDatabaseProviderConfig({
    NODE_ENV: 'development',
    DB_DRIVER: 'sqlite',
    VISAAPPLY_SQLITE_PATH: '/tmp/isolated-local.db'
  });
  assert.equal(localSqlite.ready, true);
  assert.equal(localSqlite.effectiveDriver, 'sqlite');
});

test('Task B.1 + B.2 Mock Executor & Session Guards: session SQL verification, mock routing in test mode, and production rejection', async () => {
  const roSessionSql = buildSessionInitSql('readonly', DEFAULT_POSTGRES_TIMEOUTS);
  assert.deepEqual(roSessionSql, [
    "SET statement_timeout = '10000ms'",
    "SET lock_timeout = '5000ms'",
    "SET idle_in_transaction_session_timeout = '15000ms'",
    'SET default_transaction_read_only = on'
  ]);
  const rwSessionSql = buildSessionInitSql('readwrite', DEFAULT_POSTGRES_TIMEOUTS);
  assert.equal(rwSessionSql.length, 3);
  assert.equal(rwSessionSql.includes('SET default_transaction_read_only = on'), false);

  const executedSql: string[] = [];
  let closedCount = 0;
  const mockExec: PgExecutor = {
    isNeonRemote: false,
    accessMode: 'readwrite',
    backend: 'pglite-test',
    purpose: 'test',
    async query<T = any>(sql: string) {
      executedSql.push(sql.trim());
      if (sql.includes('FROM schema_migrations')) {
        return {
          rows: [
            {
              version: '004_phaseB_serverless_unification',
              name: 'Mock Migration 004',
              checksum: 'abc123',
              applied_at: '2026-11-22T00:00:00.000Z',
              rollback_notes: 'none'
            }
          ] as unknown as T[],
          rowCount: 1
        };
      }
      return { rows: [] as T[], rowCount: 0 };
    },
    async transaction<T>(fn: (tx: PgExecutor) => Promise<T>): Promise<T> {
      return fn(mockExec);
    },
    async close() {
      closedCount += 1;
    }
  };

  await assert.rejects(
    () => getReadOnlyRepository({ env: { NODE_ENV: 'production' }, mockExecutor: mockExec }),
    (err: unknown) =>
      isDatabaseConfigurationError(err) && err.code === 'MOCK_EXECUTOR_FORBIDDEN_IN_PRODUCTION'
  );
  await assert.rejects(
    () => getReadWriteRepository({ env: { VERCEL: '1' }, mockExecutor: mockExec }),
    (err: unknown) =>
      isDatabaseConfigurationError(err) && err.code === 'MOCK_EXECUTOR_FORBIDDEN_IN_PRODUCTION'
  );
  await assert.rejects(
    () => getMigrationRepository({ env: { NODE_ENV: 'production' }, mockExecutor: mockExec }),
    (err: unknown) =>
      isDatabaseConfigurationError(err) && err.code === 'MOCK_EXECUTOR_FORBIDDEN_IN_PRODUCTION'
  );

  const roMock = await getReadOnlyRepository({ env: { NODE_ENV: 'test' }, mockExecutor: mockExec });
  const migs = await roMock.getAppliedMigrations();
  assert.equal(migs.length, 1);
  assert.equal(migs[0].version, '004_phaseB_serverless_unification');
  assert.equal('saveVisaDetails' in roMock, false);
  await roMock.close();
  assert.equal(closedCount, 1);
  assert.ok(executedSql.some((q) => q.includes('FROM schema_migrations')));
});

test('Task B.1 + B.2 Cross-Backend Parity: isolated in-memory PGlite and isolated temp SQLite produce identical domain behavior', async () => {
  const tmpDir = makeTempDir('phase-b-parity-');
  const tmpDbPath = path.join(tmpDir, 'parity_temp.db');

  const rawSqlite = openSqliteDatabase(tmpDbPath);
  closeSqliteDatabase(rawSqlite);

  const pgMigRepo = await getMigrationRepository({ allowPglite: true, env: { NODE_ENV: 'test' } });
  await pgMigRepo.runTrackedMigrations();

  const sqliteRw = await getReadWriteRepository({
    env: { NODE_ENV: 'development', DB_DRIVER: 'sqlite', VISAAPPLY_SQLITE_PATH: tmpDbPath },
    disableCache: true
  });

  try {
    const runParityScenario = async (repo: typeof sqliteRw) => {
      await repo.saveImmigrationProgram(makeFullProgram('parity-prog-1', 'v1'));
      await repo.saveImmigrationProgram(makeFullProgram('parity-prog-1', 'v2'));
      const prog = await repo.getImmigrationProgram('parity-prog-1');

      await repo.saveVisaDetails({
        id: 'vd-wrong-prefix',
        programId: 'parity-prog-1',
        visaOverview: { name: 'Parity Skilled Visa', category: 'Work' },
        verificationStatus: 'DRAFT'
      });
      const vd = await repo.getVisaDetails('parity-prog-1');

      await repo.saveVisaClaim({
        id: 'parity-claim-1',
        programId: 'parity-prog-1',
        section: 'fees',
        description: 'Official application fee',
        value: '250',
        unit: 'USD',
        status: 'VERIFIED'
      });
      await repo.saveVisaEvidence({
        id: 'parity-ev-1',
        claimId: 'parity-claim-1',
        sourceUrl: 'https://www.uscis.gov/fees',
        status: 'VERIFIED_OFFICIAL'
      });
      const delRes = await repo.deleteVisaEvidence('parity-ev-1');
      const claimAfterDelete = await repo.getVisaClaimById('parity-claim-1');

      const lock1 = await repo.acquireJobLock('parity-cron-lock', 'worker-a', 60_000);
      const lock2 = await repo.acquireJobLock('parity-cron-lock', 'worker-b', 60_000);
      const released = await repo.releaseJobLock('parity-cron-lock', 'worker-a');

      await repo.saveAutomationCheckpoint({
        checkpointId: 'cp-parity-1',
        jobName: 'nightly-audit',
        runId: 'run-1',
        status: 'IN_PROGRESS',
        cursorIndex: 12,
        totalItems: 50,
        completedKeys: ['US', 'CA'],
        failedKeys: []
      });
      const cp = await repo.getAutomationCheckpoint('cp-parity-1');

      await repo.recordDeadLetterItem({
        id: 'dlq-parity-1',
        jobName: 'nightly-audit',
        runId: 'run-1',
        targetKey: 'DE-work',
        failureClass: 'NETWORK_TIMEOUT',
        errorMessage: 'Timeout reaching postgresql://user:Secret99@host/db'
      });
      const dlq = await repo.getDeadLetterItems();

      const integrity = await repo.auditIntegrity();

      return {
        progCountry: prog?.country_code,
        progFees: prog?.government_fees,
        vdId: vd?.id,
        downgradedOnEvidenceDelete: delRes.downgradedClaim,
        claimStatusAfterDelete: claimAfterDelete?.status,
        lock1Acquired: lock1.acquired,
        lock2Acquired: lock2.acquired,
        lock2ExistingOwner: lock2.existingOwner,
        lockReleased: released,
        cpCursor: cp?.cursorIndex,
        dlqCount: dlq.length,
        dlqRedacted: !String(dlq[0]?.errorMessage || '').includes('Secret99'),
        integrityOk: integrity.ok,
        orphanCount:
          integrity.orphans.visaDetailsWithoutProgram +
          integrity.orphans.claimsWithoutProgram +
          integrity.orphans.evidenceWithoutClaim +
          integrity.orphans.versionsWithoutProgram
      };
    };

    const pgResult = await runParityScenario(pgMigRepo);
    const sqliteResult = await runParityScenario(sqliteRw);

    assert.deepEqual(pgResult, sqliteResult, 'PostgreSQL (PGlite) and SQLite repositories must match identically');
    assert.equal(pgResult.vdId, 'vd-parity-prog-1');
    assert.equal(pgResult.downgradedOnEvidenceDelete, true);
    assert.equal(pgResult.claimStatusAfterDelete, 'NEEDS_EVIDENCE');
    assert.equal(pgResult.lock1Acquired, true);
    assert.equal(pgResult.lock2Acquired, false);
    assert.equal(pgResult.lock2ExistingOwner, 'worker-a');
    assert.equal(pgResult.lockReleased, true);
    assert.equal(pgResult.dlqRedacted, true);
    assert.equal(pgResult.integrityOk, true);
    assert.equal(pgResult.orphanCount, 0);
  } finally {
    await pgMigRepo.close();
    await sqliteRw.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Task B.2 Documentation: docs/STAGING_NEON_SETUP_GUIDE.md documents exact env vars, 3-role matrix, TLS, and PII isolation without secrets', () => {
  const doc = fs.readFileSync(path.join(process.cwd(), 'docs/STAGING_NEON_SETUP_GUIDE.md'), 'utf-8');
  for (const requiredToken of [
    'NEON_READONLY_DATABASE_URL',
    'NEON_APP_DATABASE_URL',
    'NEON_MIGRATION_DATABASE_URL',
    'NEON_TEST_DATABASE_URL',
    'visaapply_audit_ro',
    'visaapply_app_rw',
    'neondb_owner',
    'sslmode=verify-full',
    'slot_subscribers',
    'POSTGRES_CREDENTIALS_MISSING',
    'OWNER_ROLE_FORBIDDEN_IN_RUNTIME'
  ]) {
    assert.ok(doc.includes(requiredToken), `STAGING_NEON_SETUP_GUIDE.md must document ${requiredToken}`);
  }
  assert.equal(/ep-[a-z0-9-]+\.[a-z0-9-]+\.aws\.neon\.tech/.test(doc), false);
});

test('Preview Security: AI Studio preview iframe framing allowed ONLY on scoped preview hosts while production & API remain locked down', () => {
  assert.equal(
    isAiStudioPreviewRequest({ headers: { host: 'www.visaapply.org', 'x-forwarded-host': 'www.visaapply.org' } }),
    false
  );
  assert.equal(
    isAiStudioPreviewRequest({
      headers: {
        'x-forwarded-host': 'www.visaapply.org',
        referer: 'https://aistudio.google.com/',
        'sec-fetch-dest': 'iframe'
      }
    }),
    false
  );
  assert.equal(
    isAiStudioPreviewRequest({
      headers: {
        host: 'localhost:3000',
        'x-forwarded-host': 'ais-dev-7wbpfjmpwjxdalwisoefhr-763359983009.asia-east1.run.app'
      }
    }),
    true
  );

  const previewHtmlHeaders = getSecurityHeaders({ isApi: false, allowPreviewFraming: true });
  assert.equal(previewHtmlHeaders['X-Frame-Options'], undefined);
  assert.match(previewHtmlHeaders['Content-Security-Policy'], /frame-ancestors 'self' https:\/\/\*\.google\.com/);
  assert.match(previewHtmlHeaders['Content-Security-Policy'], /https:\/\/api\.country\.is/);

  // API endpoints ALWAYS deny framing even inside AI Studio preview
  const previewApiHeaders = getSecurityHeaders({ isApi: true, allowPreviewFraming: true });
  assert.equal(previewApiHeaders['X-Frame-Options'], 'DENY');
  assert.match(previewApiHeaders['Content-Security-Policy'], /frame-ancestors 'none'/);

  // Production CSP permits Travelpayouts/Emerald tooltip stylesheets and check_auth origins
  const prodHtmlHeaders = getSecurityHeaders({ isApi: false, allowPreviewFraming: false });
  assert.match(prodHtmlHeaders['Content-Security-Policy'], /style-src[^;]*https:\/\/emrldco\.com/);
  assert.match(prodHtmlHeaders['Content-Security-Policy'], /connect-src[^;]*https:\/\/\*\.travelpayouts\.com/);

  // index.html skips injecting third-party ad/affiliate scripts (emrldco.com / adsbygoogle) on preview/local/iframe hosts
  const indexHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
  assert.ok(indexHtml.includes('host.endsWith(".run.app")'), 'index.html must skip preview *.run.app hosts for ad scripts');
  assert.ok(indexHtml.includes('window.self !== window.top'), 'index.html must skip embedded iframes for ad scripts');
  assert.ok(indexHtml.includes('isPreviewOrLocalHost'), 'index.html must gate loadThirdPartyScripts cleanly');
});

