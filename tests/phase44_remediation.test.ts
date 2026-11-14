import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  SQLITE_MIGRATIONS,
  auditSqliteDatabaseIntegrity,
  closeSqliteDatabase,
  createSqliteRepository,
  getAppliedSqliteMigrations,
  openSqliteDatabase,
  runTrackedSqliteMigrations
} from '../src/db/sqliteCore';
import {
  POSTGRES_MIGRATIONS,
  PostgresImmigrationRepository,
  createPostgresExecutor
} from '../src/db/postgresDatabase';
import {
  FileCheckpointStore,
  FileJobLockStore,
  classifyAutomationError,
  evaluateSourceExtractionCandidate,
  executeWithBoundedRetry,
  runCheckpointedAutomationJob
} from '../src/utils/automationPipeline';
import {
  clearInMemoryOperationalEvents,
  computeOperationalHealthSummary,
  detectUnexpectedCountDelta,
  getRecentOperationalEvents,
  recordOperationalEvent,
  redactSensitiveData
} from '../src/utils/operationalObservability';
import { createVerifiedBackup, verifyBackupRestore } from '../src/utils/backupManager';
import { createCronHandler } from '../api/cron';

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function createMockRes() {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: any = null;
  const res: any = {
    setHeader(k: string, v: string) {
      headers[k.toLowerCase()] = v;
      return res;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(payload: any) {
      body = payload;
      return res;
    },
    end() {
      return res;
    },
    get _status() {
      return statusCode;
    },
    get _headers() {
      return headers;
    },
    get _body() {
      return body;
    }
  };
  return res;
}

function seedMinimalProgram(repo: ReturnType<typeof createSqliteRepository>, id: string = 'US-H1B') {
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
      'US',
      'work',
      'Specialty Occupation H-1B',
      null,
      'INA 101(a)(15)(H)(i)(b)',
      'Temporary Nonimmigrant Work Visa',
      'Bachelor degree or higher',
      'All eligible nationalities',
      '18+',
      'Bachelor degree',
      'Relevant specialty',
      'Prevailing wage',
      'N/A',
      'LCA + employer petition',
      '3 years',
      'Up to 6 years',
      'Eligible for EB PERM transition',
      'H-4 dependents',
      'Employer-specific authorization',
      'Annual cap applies',
      '["Passport","LCA","Form I-129"]',
      'Digital/Paper',
      'Certified English translation',
      'USCIS Form I-129 + consular visa',
      '$205 MRV + I-129 fees',
      '3-6 months',
      'Abroad or US change of status',
      'https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations',
      'https://travel.state.gov/content/travel/en/us-visas/employment/temporary-worker-visas.html',
      'USCIS / U.S. Department of State',
      '2026-10-01',
      '2026-11-10',
      'https://www.uscis.gov/h1b',
      'AVAILABLE_VERIFIED',
      new Date().toISOString()
    );
}

test('SQLite integrity: tracked idempotent migrations, checksum verification, PRAGMA enforcement, and transaction rollback', () => {
  const dir = makeTempDir('p44-sqlite-');
  const dbPath = path.join(dir, 'test.db');

  try {
    const db = openSqliteDatabase(dbPath, { busyTimeoutMs: 5000 });
    try {
      const fkMode = db.pragma('foreign_keys', { simple: true });
      const busyTimeout = db.pragma('busy_timeout', { simple: true });
      const journalMode = db.pragma('journal_mode', { simple: true });
      assert.equal(fkMode, 1);
      assert.equal(busyTimeout, 5000);
      assert.equal(String(journalMode).toLowerCase(), 'wal');

      // Re-running tracked migrations must be idempotent
      const secondRun = runTrackedSqliteMigrations(db);
      assert.deepEqual(secondRun.newlyApplied, []);
      assert.equal(secondRun.alreadyApplied.length, SQLITE_MIGRATIONS.length);

      const applied = getAppliedSqliteMigrations(db);
      assert.equal(applied.length, SQLITE_MIGRATIONS.length);
      assert.ok(applied.every((m) => m.checksum.length === 64 && m.rollbackNotes.length > 0));

      // Checksum tamper detection fails closed
      db.prepare('UPDATE schema_migrations SET checksum = ? WHERE version = ?').run(
        'tampered-checksum',
        SQLITE_MIGRATIONS[0].version
      );
      assert.throws(() => runTrackedSqliteMigrations(db), /MIGRATION_CHECKSUM_MISMATCH/);

      // Restore valid checksum for further tests
      db.prepare('UPDATE schema_migrations SET checksum = ? WHERE version = ?').run(
        applied[0].checksum,
        SQLITE_MIGRATIONS[0].version
      );

      const repo = createSqliteRepository(db);
      seedMinimalProgram(repo, 'US-H1B');

      // Foreign key rejection: cannot insert visa_details for non-existent program
      assert.throws(() => {
        repo.saveVisaDetails({ programId: 'NON-EXISTENT-PROG', verificationStatus: 'DRAFT' });
      }, /FOREIGN KEY constraint failed/);

      // Transaction rollback safety: partial error inside transaction leaves 0 partial writes
      assert.throws(() => {
        const tx = db.transaction(() => {
          repo.saveVisaClaim({
            id: 'CLM-TX-1',
            programId: 'US-H1B',
            section: 'fees',
            description: 'MRV fee',
            value: '205',
            unit: 'USD',
            status: 'NEEDS_EVIDENCE'
          });
          throw new Error('SIMULATED_MID_TRANSACTION_FAILURE');
        });
        tx();
      }, /SIMULATED_MID_TRANSACTION_FAILURE/);

      assert.equal(repo.getVisaClaims('US-H1B').length, 0);

      // Transactional claim + evidence + downgrade guard + delete cascade
      repo.saveVisaClaim({
        id: 'CLM-VER-1',
        programId: 'US-H1B',
        section: 'fees',
        description: 'Official USCIS filing baseline',
        status: 'VERIFIED'
      });
      repo.saveVisaEvidence({
        id: 'EV-1',
        claimId: 'CLM-VER-1',
        sourceUrl: 'https://www.uscis.gov/h1b',
        status: 'VERIFIED_OFFICIAL'
      });
      assert.equal(repo.getVisaClaimById('CLM-VER-1')?.status, 'VERIFIED');

      // Deleting qualifying evidence transactionally downgrades claim to NEEDS_EVIDENCE and records audit version
      const delRes = repo.deleteVisaEvidence('EV-1');
      assert.equal(delRes.downgradedClaim, true);
      assert.equal(repo.getVisaClaimById('CLM-VER-1')?.status, 'NEEDS_EVIDENCE');

      const audit = repo.auditIntegrity();
      assert.equal(audit.ok, true);
      assert.equal(audit.foreignKeyViolations, 0);
      assert.equal(audit.orphans.claimsWithoutProgram, 0);
      assert.equal(audit.duplicates.visaDetailsProgramId.length, 0);
    } finally {
      closeSqliteDatabase(db);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('PostgreSQL repository parity (isolated PGlite): tracked migrations, locks, checkpoints, dead-letter, and redacted cron logs', async () => {
  const pgExec = await createPostgresExecutor(undefined, { requireNeonRemote: false });
  const repo = new PostgresImmigrationRepository(pgExec);

  try {
    assert.equal(pgExec.isNeonRemote, false);
    const firstMig = await repo.runTrackedMigrations();
    assert.equal(firstMig.newlyApplied.length, POSTGRES_MIGRATIONS.length);

    const secondMig = await repo.runTrackedMigrations();
    assert.equal(secondMig.newlyApplied.length, 0);
    assert.equal(secondMig.alreadyApplied.length, POSTGRES_MIGRATIONS.length);

    // Job lock conflict & release in Postgres
    const lock1 = await repo.acquireJobLock('pg:sync', 'owner-1', 60000);
    assert.equal(lock1.acquired, true);
    const lock2 = await repo.acquireJobLock('pg:sync', 'owner-2', 60000);
    assert.equal(lock2.acquired, false);
    assert.equal(lock2.existingOwner, 'owner-1');
    assert.equal(await repo.releaseJobLock('pg:sync', 'owner-1'), true);

    // Checkpoint & Dead-letter persistence
    await repo.saveAutomationCheckpoint({
      checkpointId: 'pg-cp-1',
      jobName: 'pg-sync',
      runId: 'run-1',
      status: 'PARTIAL_FAILED',
      cursorIndex: 1,
      totalItems: 2,
      completedKeys: ['US'],
      failedKeys: ['GB']
    });
    const cp = await repo.getAutomationCheckpoint('pg-cp-1');
    assert.ok(cp);
    assert.deepEqual(cp.completedKeys, ['US']);
    assert.deepEqual(cp.failedKeys, ['GB']);

    await repo.recordDeadLetterItem({
      jobName: 'pg-sync',
      runId: 'run-1',
      targetKey: 'GB',
      failureClass: 'TIMEOUT',
      errorMessage: 'Failed connecting with postgresql://admin:supersecret@db.host/prod',
      retryCount: 3
    });
    const dlq = await repo.getDeadLetterItems('QUARANTINED');
    assert.equal(dlq.length, 1);
    assert.equal(dlq[0].errorMessage.includes('supersecret'), false);

    // Cron log secret redaction in Postgres
    await repo.logCronExecutionToDb({
      cronName: 'immigration-sync',
      httpMethod: 'POST',
      targetCountries: ['US'],
      status: 'ERROR',
      checkedCount: 1,
      updatesFound: 0,
      logMessage: 'Upstream error Bearer abcdef1234567890 AIzaSyDummySecretKeyValue12345678',
      executionDurationMs: 42
    });
    const logs = await repo.getCronExecutionLogsFromDb(5);
    assert.equal(logs[0].logMessage.includes('abcdef1234567890'), false);
    assert.equal(logs[0].logMessage.includes('AIzaSyDummy'), false);
  } finally {
    await pgExec.close();
  }
});

test('maintenance.ts fails closed without explicit destructive confirmation flags', () => {
  let failedSafely = false;
  try {
    execFileSync('npx', ['tsx', 'maintenance.ts'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      env: { ...process.env, ALLOW_DESTRUCTIVE_DB_RESET: '' }
    });
  } catch (err: any) {
    failedSafely = true;
    const stderr = String(err?.stderr || err?.message || '');
    assert.ok(stderr.includes('SAFETY_ABORT'), `Expected SAFETY_ABORT, got: ${stderr}`);
  }
  assert.equal(failedSafely, true);
});

test('Automation pipeline: failure classification, bounded retry + AbortController, checkpoint resume, duplicate lock guard, and strict staging gate', async () => {
  const dir = makeTempDir('p44-pipeline-');
  clearInMemoryOperationalEvents();

  try {
    // 1. Failure classification
    assert.equal(classifyAutomationError(new Error('429 Too Many Requests quota exceeded')).failureClass, 'QUOTA_EXHAUSTED');
    assert.equal(classifyAutomationError(new Error('Operation timeout after 100ms')).failureClass, 'TIMEOUT');
    assert.equal(classifyAutomationError(new Error('ECONNREFUSED 127.0.0.1')).failureClass, 'NETWORK_ERROR');
    assert.equal(classifyAutomationError(new Error('Invalid JSON schema')).failureClass, 'VALIDATION_ERROR');
    assert.equal(classifyAutomationError(new Error('HTTP 401 Unauthorized')).failureClass, 'AUTH_ERROR');
    assert.equal(classifyAutomationError(new Error('GEMINI_API_KEY not configured')).failureClass, 'MISSING_CREDENTIALS');

    // 2. Bounded retry recovers from transient failures; non-retryable aborts immediately
    let transientCalls = 0;
    const retryRes = await executeWithBoundedRetry(
      async () => {
        transientCalls++;
        if (transientCalls < 3) throw new Error('ECONNRESET network blip');
        return 'ok';
      },
      { maxAttempts: 4, baseDelayMs: 5, jitterMs: 2, timeoutMs: 1000 }
    );
    assert.equal(retryRes.result, 'ok');
    assert.equal(retryRes.attempts, 3);

    let authCalls = 0;
    await assert.rejects(
      () =>
        executeWithBoundedRetry(
          async () => {
            authCalls++;
            const err: any = new Error('HTTP 401 Unauthorized');
            err.status = 401;
            throw err;
          },
          { maxAttempts: 4, baseDelayMs: 5, timeoutMs: 1000 }
        ),
      /AUTH_ERROR/
    );
    assert.equal(authCalls, 1);

    // 3. Timeout triggers AbortController signal
    let abortedObserved = false;
    await assert.rejects(
      () =>
        executeWithBoundedRetry(
          (signal) =>
            new Promise((_resolve, reject) => {
              signal.addEventListener('abort', () => {
                abortedObserved = true;
                reject(new Error('Aborted due to timeout'));
              });
            }),
          { maxAttempts: 1, timeoutMs: 60 }
        ),
      /TIMEOUT/
    );
    assert.equal(abortedObserved, true);

    // 4. Partial-failure checkpoint & resume + idempotency
    const lockStore = new FileJobLockStore(path.join(dir, 'locks'));
    const cpStore = new FileCheckpointStore(path.join(dir, 'checkpoints'));
    const processedLog: string[] = [];
    let failSecondItem = true;

    const firstRun = await runCheckpointedAutomationJob({
      jobName: 'source-sync',
      checkpointId: 'sync-batch-1',
      items: ['US', 'GB', 'CA'],
      getItemKey: (c) => c,
      lockStore,
      checkpointStore: cpStore,
      retryOptions: { maxAttempts: 2, baseDelayMs: 5, jitterMs: 1, timeoutMs: 500 },
      processItem: async (code) => {
        processedLog.push(`run1:${code}`);
        if (code === 'GB' && failSecondItem) {
          const e: any = new Error('HTTP 503 source unavailable');
          e.status = 503;
          throw e;
        }
        return `checked:${code}`;
      }
    });

    assert.equal(firstRun.status, 'PARTIAL_FAILED');
    assert.equal(firstRun.succeededCount, 2); // US & CA succeeded
    assert.equal(firstRun.failedCount, 1); // GB quarantined

    // Second run resumes without re-processing US & CA, and recovers GB
    failSecondItem = false;
    const secondRun = await runCheckpointedAutomationJob({
      jobName: 'source-sync',
      checkpointId: 'sync-batch-1',
      items: ['US', 'GB', 'CA'],
      getItemKey: (c) => c,
      lockStore,
      checkpointStore: cpStore,
      retryOptions: { maxAttempts: 2, baseDelayMs: 5, jitterMs: 1, timeoutMs: 500 },
      processItem: async (code) => {
        processedLog.push(`run2:${code}`);
        return `checked:${code}`;
      }
    });

    assert.equal(secondRun.status, 'COMPLETED');
    assert.equal(secondRun.resumedFromCheckpoint, true);
    assert.equal(secondRun.skippedCount, 2); // US & CA skipped idempotently
    assert.equal(secondRun.succeededCount, 1); // Only GB executed
    assert.equal(processedLog.includes('run2:US'), false);
    assert.equal(processedLog.includes('run2:CA'), false);
    assert.equal(processedLog.includes('run2:GB'), true);

    // 5. Concurrent lock rejection
    const lockAcquire = await lockStore.acquireLock('lock:overlap-test', 'worker-a', 10000);
    assert.equal(lockAcquire.acquired, true);
    const overlapRun = await runCheckpointedAutomationJob({
      jobName: 'overlap-test',
      lockKey: 'lock:overlap-test',
      checkpointId: 'overlap-cp',
      items: ['US'],
      getItemKey: (c) => c,
      lockStore,
      checkpointStore: cpStore,
      processItem: async () => 'should-not-run'
    });
    assert.equal(overlapRun.status, 'DUPLICATE_IN_PROGRESS');
    assert.equal(await lockStore.releaseLock('lock:overlap-test', 'worker-a'), true);

    // 6. Evidence & Staging Gate checks (fail-closed)
    const wikiReject = evaluateSourceExtractionCandidate({
      sourceUrl: 'https://en.wikipedia.org/wiki/Visa_policy_of_India',
      excerpt: 'Official visa fee is $80 effective 2026 for tourist applications.',
      hasConcreteChange: true,
      newValue: '$80'
    });
    assert.equal(wikiReject.acceptedForStaging, false);
    assert.equal(wikiReject.gateStatus, 'NEEDS_REVIEW');
    assert.equal(wikiReject.autoPublished, false);

    const expiredGate = evaluateSourceExtractionCandidate({
      sourceUrl: 'https://www.uscis.gov/forms/filing-fees',
      excerpt: 'USCIS H-1B registration fee rule effective until 2025-01-01.',
      hasConcreteChange: true,
      newValue: '$215',
      expirationDate: '2025-01-01',
      nowDate: new Date('2026-11-14T00:00:00Z')
    });
    assert.equal(expiredGate.acceptedForStaging, false);
    assert.equal(expiredGate.gateStatus, 'QUARANTINED_EXPIRED');
    assert.equal(expiredGate.verificationStatus, 'EXPIRED');
    assert.equal(expiredGate.autoPublished, false);

    const conflictGate = evaluateSourceExtractionCandidate({
      sourceUrl: 'https://www.gov.uk/skilled-worker-visa',
      excerpt: 'Skilled Worker salary threshold updated to £38,700 or £41,700 depending on transitional rule.',
      hasConcreteChange: true,
      newValue: '£38,700',
      conflictingValues: true
    });
    assert.equal(conflictGate.acceptedForStaging, false);
    assert.equal(conflictGate.gateStatus, 'NEEDS_REVIEW');
    assert.equal(conflictGate.autoPublished, false);

    const validGate = evaluateSourceExtractionCandidate({
      sourceUrl: 'https://www.gov.uk/skilled-worker-visa',
      excerpt: 'Official GOV.UK update: Standard Skilled Worker visa application fee updated to £719 for up to 3 years.',
      hasConcreteChange: true,
      newValue: '£719'
    });
    assert.equal(validGate.acceptedForStaging, true);
    assert.equal(validGate.gateStatus, 'STAGED_PENDING_REVIEW');
    assert.equal(validGate.publicationStatus, 'PENDING_HUMAN_REVIEW');
    assert.equal(validGate.verificationStatus, 'AWAITING_VERIFICATION');
    assert.equal(validGate.autoPublished, false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('api/cron handler: quota exhaustion fails visibly, retries are idempotent, and overlapping executions rejected', async () => {
  const dir = makeTempDir('p44-cron-');
  const prevCron = process.env.CRON_SECRET;
  const prevGemini = process.env.GEMINI_API_KEY;

  try {
    process.env.CRON_SECRET = 'phase44-test-cron-secret';
    process.env.GEMINI_API_KEY = 'AIzaTestMockKeyForPhase44Testing123456';

    const lockStore = new FileJobLockStore(path.join(dir, 'locks'));
    const cpStore = new FileCheckpointStore(path.join(dir, 'checkpoints'));

    // 1. Quota exhausted (429) fails visibly without synthetic draft fabrication
    const quotaHandler = createCronHandler({
      lockStore,
      checkpointStore: cpStore,
      checkpointId: 'cron-quota-test',
      topics: [{ from: 'India', to: 'UK', type: 'Visitor Visa' }],
      maxAttempts: 2,
      baseDelayMs: 5,
      timeoutMs: 500,
      generateTopicContent: async () => {
        const err: any = new Error('429 RESOURCE_EXHAUSTED quota exceeded');
        err.status = 429;
        throw err;
      }
    });
    const quotaRes = createMockRes();
    await quotaHandler(
      { method: 'POST', headers: { authorization: 'Bearer phase44-test-cron-secret' } } as any,
      quotaRes
    );
    assert.equal(quotaRes._status, 429);
    assert.equal(quotaRes._body.success, false);
    assert.equal(quotaRes._body.failureClass, 'QUOTA_EXHAUSTED');

    // 2. Idempotent re-run on same day/checkpoint generates 0 duplicate drafts
    let callCount = 0;
    const idempHandler = createCronHandler({
      lockStore,
      checkpointStore: cpStore,
      checkpointId: 'cron-idemp-test',
      topics: [
        { from: 'India', to: 'UK', type: 'Visitor Visa' },
        { from: 'India', to: 'UAE', type: 'Tourist Visa' }
      ],
      generateTopicContent: async (t) => {
        callCount++;
        return `# Guide for ${t.from} to ${t.to} ${t.type}\n` + 'Official consular details verified. '.repeat(12);
      }
    });

    const firstRes = createMockRes();
    await idempHandler(
      { method: 'POST', headers: { authorization: 'Bearer phase44-test-cron-secret' } } as any,
      firstRes
    );
    assert.equal(firstRes._status, 200);
    assert.equal(firstRes._body.count, 2);
    assert.equal(firstRes._body.drafts.every((d: any) => d.autoPublished === false && d.status === 'PENDING_HUMAN_REVIEW'), true);

    const secondRes = createMockRes();
    await idempHandler(
      { method: 'POST', headers: { authorization: 'Bearer phase44-test-cron-secret' } } as any,
      secondRes
    );
    assert.equal(secondRes._status, 200);
    assert.equal(secondRes._body.count, 0);
    assert.equal(secondRes._body.skippedCount, 2);
    assert.equal(callCount, 2);

    // 3. Overlapping lock returns 409 DUPLICATE_IN_PROGRESS
    await lockStore.acquireLock('lock:vercel-cron-drafts', 'active-worker', 30000);
    const overlapRes = createMockRes();
    await idempHandler(
      { method: 'POST', headers: { authorization: 'Bearer phase44-test-cron-secret' } } as any,
      overlapRes
    );
    assert.equal(overlapRes._status, 409);
    assert.equal(overlapRes._body.status, 'DUPLICATE_IN_PROGRESS');
    await lockStore.releaseLock('lock:vercel-cron-drafts', 'active-worker');
  } finally {
    if (prevCron === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = prevCron;
    if (prevGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevGemini;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('Observability & Redaction: strips secrets/DSNs, detects unexpected count deltas, and reports PASS/WARNING/FAIL/NOT_VERIFIED accurately', () => {
  const prevSecret = process.env.CRON_SECRET;
  const prevPass = process.env.ADMIN_PASSWORD;

  try {
    process.env.CRON_SECRET = 'SecretCronValue999';
    process.env.ADMIN_PASSWORD = 'AdminPassSecretValue999';
    clearInMemoryOperationalEvents();

    const dirtyInput = {
      message:
        'Connect error postgresql://neondb_owner:mypassword123@ep-real.neon.tech/neondb?sslmode=require Bearer token12345678 AIzaSyFakeKey123456789012345 re_live_1234567890abcdef SecretCronValue999',
      headers: {
        authorization: 'Bearer SecretCronValue999',
        'x-admin-token': 'AdminPassSecretValue999'
      },
      nestedError: new Error('Auth failed with postgresql://u:p@host/db and AIzaSyAnotherLeak1234567890')
    };

    const redacted = redactSensitiveData(dirtyInput);
    const serialized = JSON.stringify(redacted);
    assert.equal(serialized.includes('mypassword123'), false);
    assert.equal(serialized.includes('ep-real.neon.tech'), false);
    assert.equal(serialized.includes('SecretCronValue999'), false);
    assert.equal(serialized.includes('AdminPassSecretValue999'), false);
    assert.equal(serialized.includes('AIzaSyFakeKey'), false);
    assert.equal(serialized.includes('re_live_1234567890'), false);
    assert.equal(serialized.includes('u:p@host'), false);

    // Count delta anomaly detection
    const deltaReport = detectUnexpectedCountDelta(
      { immigration_programs: 210, visa_details: 210 },
      { immigration_programs: 0, visa_details: 210 }
    );
    assert.equal(deltaReport.hasAnomaly, true);
    assert.equal(deltaReport.findings.find((f) => f.table === 'immigration_programs')?.anomalous, true);

    recordOperationalEvent({
      category: 'MIGRATION_EVENT',
      severity: 'INFO',
      component: 'test',
      message: 'Verified check with SecretCronValue999'
    });
    const events = getRecentOperationalEvents(5);
    assert.equal(events[0].message.includes('SecretCronValue999'), false);

    // Operational health summary honors NOT_VERIFIED when Neon remote is unconfigured
    const health = computeOperationalHealthSummary({
      sqliteIntegrityOk: true,
      sqliteForeignKeyViolations: 0,
      sqliteMigrationsApplied: 3,
      sqliteMigrationsExpected: 3,
      postgresStatus: 'NOT_VERIFIED',
      lastBackupVerified: true,
      lastRestoreVerified: true,
      cronScheduleConfigured: '30 21 * * *'
    });
    assert.equal(health.checks.find((c) => c.name === 'postgres_database')?.status, 'NOT_VERIFIED');
    assert.equal(health.checks.find((c) => c.name === 'sqlite_database')?.status, 'PASS');
  } finally {
    if (prevSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = prevSecret;
    if (prevPass === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = prevPass;
  }
});

test('Backup & Isolated Restore Verification: SQLite WAL snapshot, secret exclusion, no-overwrite guard, corruption detection, and full isolated temp restore', async () => {
  const dir = makeTempDir('p44-backup-');

  try {
    const projectRoot = path.join(dir, 'project');
    const dataDbDir = path.join(projectRoot, 'data_db');
    const dbPath = path.join(dataDbDir, 'immigration_hub.db');
    fs.mkdirSync(path.join(projectRoot, 'src/db'), { recursive: true });
    fs.mkdirSync(path.join(projectRoot, 'src/data'), { recursive: true });
    fs.mkdirSync(path.join(projectRoot, 'docs'), { recursive: true });

    // Create sample SQLite DB in WAL mode with uncheckpointed WAL write
    const testDb = openSqliteDatabase(dbPath);
    const repo = createSqliteRepository(testDb);
    seedMinimalProgram(repo, 'US-H1B');
    repo.saveVisaDetails({ programId: 'US-H1B', verificationStatus: 'VERIFIED' });
    repo.saveVisaClaim({
      id: 'CLM-BKP-1',
      programId: 'US-H1B',
      section: 'fees',
      description: 'Backup verification claim',
      status: 'VERIFIED'
    });
    repo.saveVisaEvidence({
      id: 'EV-BKP-1',
      claimId: 'CLM-BKP-1',
      sourceUrl: 'https://www.uscis.gov/h1b',
      status: 'VERIFIED_OFFICIAL'
    });
    closeSqliteDatabase(testDb);

    // Record exact source DB hash before backup to prove backup NEVER mutates source DB
    const beforeHash = crypto.createHash('sha256').update(fs.readFileSync(dbPath)).digest('hex');

    // Create registry CSV, .env secret (must be excluded!), and dummy node_modules (must be excluded!)
    fs.writeFileSync(path.join(projectRoot, 'phase_4_4_test_registry.csv'), 'id,status\nUS-H1B,VERIFIED\n', 'utf-8');
    fs.writeFileSync(path.join(projectRoot, '.env'), 'CRON_SECRET=MUST_NOT_BE_BACKED_UP\n', 'utf-8');
    fs.writeFileSync(path.join(projectRoot, '.env.production'), 'ADMIN_PASSWORD=TOP_SECRET\n', 'utf-8');
    fs.writeFileSync(path.join(projectRoot, '.env.example'), 'CRON_SECRET="YOUR_CRON_SECRET"\n', 'utf-8');
    fs.mkdirSync(path.join(projectRoot, 'node_modules/fake-pkg'), { recursive: true });
    fs.writeFileSync(path.join(projectRoot, 'node_modules/fake-pkg/index.js'), 'module.exports = 1;', 'utf-8');
    fs.writeFileSync(path.join(projectRoot, 'docs/DATA_RECOVERY_RUNBOOK.md'), '# Runbook\n', 'utf-8');

    const archivePath = path.join(dir, 'verified_test_backup.tar.gz');
    const bkpResult = await createVerifiedBackup({
      outputPath: archivePath,
      projectRoot,
      dbPath
    });

    assert.equal(bkpResult.success, true);
    assert.ok(bkpResult.archiveSizeBytes > 0);
    assert.equal(bkpResult.manifest.databaseSnapshot.included, true);
    assert.equal(bkpResult.manifest.databaseSnapshot.tableCounts.immigration_programs, 1);
    assert.equal(bkpResult.manifest.databaseSnapshot.tableCounts.visa_detail_claims, 1);

    // Source DB must remain byte-for-byte untouched
    const afterHash = crypto.createHash('sha256').update(fs.readFileSync(dbPath)).digest('hex');
    assert.equal(afterHash, beforeHash);

    // No-overwrite protection
    await assert.rejects(
      () => createVerifiedBackup({ outputPath: archivePath, projectRoot, dbPath }),
      /EEXIST/
    );

    // Verify secrets and node_modules excluded
    assert.equal(bkpResult.manifest.files.some((f) => f.path === '.env' || f.path === '.env.production'), false);
    assert.equal(bkpResult.manifest.files.some((f) => f.path.includes('node_modules')), false);
    assert.equal(bkpResult.manifest.files.some((f) => f.path === '.env.example'), true);

    // Full isolated temporary directory restore verification
    const restoreReport = verifyBackupRestore(archivePath);
    assert.equal(restoreReport.success, true);
    assert.equal(restoreReport.manifestVerified, true);
    assert.equal(restoreReport.forbiddenSecretFilesFound.length, 0);
    assert.equal(restoreReport.csvFilesChecked, 1);
    assert.equal(restoreReport.csvErrors.length, 0);
    assert.equal(restoreReport.sqliteIntegrityOk, true);
    assert.equal(restoreReport.sqliteForeignKeyViolations, 0);
    assert.equal(restoreReport.sqliteTableCountsMatch, true);
    assert.equal(restoreReport.restoredTableCounts.immigration_programs, 1);

    // Guard against restoring directly into production data_db
    assert.throws(
      () =>
        verifyBackupRestore(archivePath, {
          restoreTargetDir: dataDbDir,
          productionDbDir: dataDbDir
        }),
      /SAFETY_ABORT/
    );

    // Corrupt / truncated archive must fail restore verification
    const corruptPath = path.join(dir, 'corrupt.tar.gz');
    const validBytes = fs.readFileSync(archivePath);
    fs.writeFileSync(corruptPath, validBytes.subarray(0, Math.floor(validBytes.length / 2)));
    const corruptReport = verifyBackupRestore(corruptPath);
    assert.equal(corruptReport.success, false);
    assert.ok(corruptReport.errors.length > 0);

    // Tampered manifest checksum detection
    const tamperExtract = makeTempDir('p44-tamper-');
    execFileSync('tar', ['-xzf', archivePath, '-C', tamperExtract]);
    fs.writeFileSync(path.join(tamperExtract, 'phase_4_4_test_registry.csv'), 'tampered,data\n1,2\n');
    const tamperedArchive = path.join(dir, 'tampered.tar.gz');
    execFileSync('tar', ['-czf', tamperedArchive, '-C', tamperExtract, '.']);
    const tamperReport = verifyBackupRestore(tamperedArchive);
    assert.equal(tamperReport.success, false);
    assert.ok(tamperReport.checksumMismatches.includes('phase_4_4_test_registry.csv'));
    fs.rmSync(tamperExtract, { recursive: true, force: true });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
