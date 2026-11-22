import crypto from 'node:crypto';

export type OperationalHealthStatus = 'PASS' | 'WARNING' | 'FAIL' | 'NOT_VERIFIED';

export type OperationalEventCategory =
  | 'DB_CONNECTION_ERROR'
  | 'MIGRATION_EVENT'
  | 'UPDATE_JOB_RUN'
  | 'SOURCE_RETRIEVAL_FAILURE'
  | 'VERIFICATION_FAILURE'
  | 'QUARANTINED_RECORD'
  | 'RETRY_ATTEMPT'
  | 'CRON_EXECUTION'
  | 'BACKUP_OUTCOME'
  | 'RESTORE_VERIFICATION'
  | 'COUNT_DELTA_ANOMALY';

export type OperationalSeverity = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface OperationalEvent {
  id: string;
  timestamp: string;
  category: OperationalEventCategory;
  severity: OperationalSeverity;
  component: string;
  message: string;
  details?: Record<string, unknown>;
}

const SENSITIVE_KEY_PATTERN =
  /(password|passwd|secret|token|apikey|api_key|authorization|cookie|connection_?string|database_?url|neon_.*url|private_?key)/i;

const MAX_IN_MEMORY_EVENTS = 500;
const inMemoryEvents: OperationalEvent[] = [];

/**
 * Redacts credentials, connection strings, Bearer tokens, Google/Resend API keys,
 * and configured environment secrets from strings and structured objects.
 */
export function redactSensitiveData<T = unknown>(input: T, seen = new WeakSet<object>()): T {
  const configuredSecrets = [
    process.env.CRON_SECRET,
    process.env.ADMIN_PASSWORD,
    process.env.GEMINI_API_KEY,
    process.env.RESEND_API_KEY,
    process.env.NEON_TEST_DATABASE_URL,
    process.env.NEON_APP_DATABASE_URL,
    process.env.NEON_READONLY_DATABASE_URL,
    process.env.NEON_MIGRATION_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.DIRECT_URL
  ]
    .map((v) => (v || '').trim())
    .filter((v) => v.length >= 6 && v !== 'dummy_key' && !v.includes('ep-example.us-east-2.aws.neon.tech'));

  const redactString = (raw: string): string => {
    let out = raw;
    for (const secret of configuredSecrets) {
      if (out.includes(secret)) {
        out = out.split(secret).join('[REDACTED]');
      }
    }
    // Redact postgres / postgresql URLs with credentials or host details
    out = out.replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, 'postgresql://[REDACTED]');
    // Redact Bearer / Basic authorization headers
    out = out.replace(/(Bearer|Basic)\s+[A-Za-z0-9._\-+/=]{6,}/gi, '$1 [REDACTED]');
    // Redact Google / Gemini API keys (AIza...)
    out = out.replace(/\bAIza[0-9A-Za-z_-]{16,}\b/g, 'AIza[REDACTED]');
    // Redact Resend API keys (re_...)
    out = out.replace(/\bre_[0-9A-Za-z_]{12,}\b/g, 're_[REDACTED]');
    // Redact inline key=value or "secret":"..." pairs
    out = out.replace(
      /\b(CRON_SECRET|ADMIN_PASSWORD|GEMINI_API_KEY|RESEND_API_KEY|DATABASE_URL|POSTGRES_URL|DIRECT_URL|NEON_TEST_DATABASE_URL|NEON_APP_DATABASE_URL|NEON_READONLY_DATABASE_URL|NEON_MIGRATION_DATABASE_URL|x-cron-secret|x-admin-token)\s*[:=]\s*["']?[^"'\s,;}{]+["']?/gi,
      '$1=[REDACTED]'
    );
    return out;
  };

  if (typeof input === 'string') {
    return redactString(input) as unknown as T;
  }

  if (input === null || input === undefined || typeof input !== 'object') {
    return input;
  }

  if (input instanceof Error) {
    const errObj: Record<string, unknown> = {
      name: input.name,
      message: redactString(input.message || '')
    };
    if (input.stack) {
      errObj.stack = redactString(input.stack);
    }
    return errObj as unknown as T;
  }

  if (Array.isArray(input)) {
    if (seen.has(input)) return '[Circular]' as unknown as T;
    seen.add(input);
    return input.map((item) => redactSensitiveData(item, seen)) as unknown as T;
  }

  if (seen.has(input as object)) {
    return '[Circular]' as unknown as T;
  }
  seen.add(input as object);

  const sanitized: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(k)) {
      sanitized[k] = '[REDACTED]';
    } else {
      sanitized[k] = redactSensitiveData(v, seen);
    }
  }
  return sanitized as T;
}

export interface OperationalEventSink {
  insertOperationalEvent?: (event: OperationalEvent) => void;
}

export function recordOperationalEvent(
  eventInput: Omit<OperationalEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string },
  sink?: OperationalEventSink
): OperationalEvent {
  const safeEvent: OperationalEvent = {
    id: eventInput.id || `evt-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: eventInput.timestamp || new Date().toISOString(),
    category: eventInput.category,
    severity: eventInput.severity,
    component: redactSensitiveData(eventInput.component),
    message: redactSensitiveData(eventInput.message),
    details: eventInput.details ? (redactSensitiveData(eventInput.details) as Record<string, unknown>) : {}
  };

  inMemoryEvents.push(safeEvent);
  if (inMemoryEvents.length > MAX_IN_MEMORY_EVENTS) {
    inMemoryEvents.splice(0, inMemoryEvents.length - MAX_IN_MEMORY_EVENTS);
  }

  if (sink?.insertOperationalEvent) {
    try {
      sink.insertOperationalEvent(safeEvent);
    } catch {
      // Never allow observability persistence failures to crash primary operations
    }
  }

  return safeEvent;
}

export function getRecentOperationalEvents(limit: number = 100): OperationalEvent[] {
  const safeLimit = Math.max(1, Math.min(limit, MAX_IN_MEMORY_EVENTS));
  return inMemoryEvents.slice(-safeLimit).reverse();
}

export function clearInMemoryOperationalEvents(): void {
  inMemoryEvents.length = 0;
}

export interface CountDeltaFinding {
  table: string;
  previousCount: number;
  currentCount: number;
  delta: number;
  ratioChange: number;
  anomalous: boolean;
}

export function detectUnexpectedCountDelta(
  previousCounts: Record<string, number>,
  currentCounts: Record<string, number>,
  thresholdRatio: number = 0.2
): { hasAnomaly: boolean; findings: CountDeltaFinding[] } {
  const tables = Array.from(new Set([...Object.keys(previousCounts), ...Object.keys(currentCounts)])).sort();
  const findings: CountDeltaFinding[] = [];

  for (const table of tables) {
    const prev = Number(previousCounts[table] ?? 0);
    const curr = Number(currentCounts[table] ?? 0);
    const delta = curr - prev;
    const ratioChange = prev > 0 ? Math.abs(delta) / prev : curr > 0 ? 1 : 0;
    const droppedToZero = prev > 0 && curr === 0;
    const largeDrop = prev > 0 && delta < 0 && Math.abs(delta) / prev >= thresholdRatio;
    const unexpectedSpike = prev >= 5 && delta > 0 && delta / prev >= thresholdRatio * 2;
    const anomalous = droppedToZero || largeDrop || unexpectedSpike;

    findings.push({
      table,
      previousCount: prev,
      currentCount: curr,
      delta,
      ratioChange: Number(ratioChange.toFixed(4)),
      anomalous
    });
  }

  return {
    hasAnomaly: findings.some((f) => f.anomalous),
    findings
  };
}

export interface HealthCheckItem {
  name: string;
  status: OperationalHealthStatus;
  summary: string;
  details?: Record<string, unknown>;
}

export interface OperationalHealthInput {
  sqliteIntegrityOk?: boolean | null;
  sqliteForeignKeyViolations?: number;
  sqliteMigrationsApplied?: number;
  sqliteMigrationsExpected?: number;
  postgresStatus?: OperationalHealthStatus;
  postgresSummary?: string;
  lastCronStatus?: string | null;
  lastBackupVerified?: boolean | null;
  lastRestoreVerified?: boolean | null;
  quarantinedCount?: number;
  deadLetterCount?: number;
  recentEvents?: OperationalEvent[];
  cronScheduleConfigured?: string;
}

export interface OperationalHealthSummary {
  generatedAt: string;
  overallStatus: OperationalHealthStatus;
  checks: HealthCheckItem[];
  counters: {
    dbConnectionErrors: number;
    migrationEvents: number;
    updateJobRuns: number;
    sourceRetrievalFailures: number;
    verificationFailures: number;
    quarantinedRecords: number;
    retryAttempts: number;
    cronOutcomes: number;
    backupOrRestoreEvents: number;
    countDeltaAnomalies: number;
    deadLetterPending: number;
  };
  recentEvents: OperationalEvent[];
}

export function computeOperationalHealthSummary(input: OperationalHealthInput): OperationalHealthSummary {
  const events = input.recentEvents ?? getRecentOperationalEvents(100);
  const countByCat = (cat: OperationalEventCategory) => events.filter((e) => e.category === cat).length;

  const checks: HealthCheckItem[] = [];

  if (input.sqliteIntegrityOk === undefined || input.sqliteIntegrityOk === null) {
    checks.push({
      name: 'sqlite_database',
      status: 'NOT_VERIFIED',
      summary: 'SQLite integrity check was not executed for this summary.'
    });
  } else if (
    input.sqliteIntegrityOk &&
    (input.sqliteForeignKeyViolations ?? 0) === 0 &&
    (input.sqliteMigrationsApplied ?? 0) >= (input.sqliteMigrationsExpected ?? 0)
  ) {
    checks.push({
      name: 'sqlite_database',
      status: 'PASS',
      summary: 'SQLite integrity_check=ok, zero foreign key violations, migrations current.',
      details: {
        migrationsApplied: input.sqliteMigrationsApplied ?? 0,
        migrationsExpected: input.sqliteMigrationsExpected ?? 0
      }
    });
  } else {
    checks.push({
      name: 'sqlite_database',
      status: 'FAIL',
      summary: 'SQLite integrity, foreign key, or migration check failed.',
      details: {
        sqliteIntegrityOk: input.sqliteIntegrityOk,
        sqliteForeignKeyViolations: input.sqliteForeignKeyViolations ?? 0,
        migrationsApplied: input.sqliteMigrationsApplied ?? 0,
        migrationsExpected: input.sqliteMigrationsExpected ?? 0
      }
    });
  }

  checks.push({
    name: 'postgres_database',
    status: input.postgresStatus || 'NOT_VERIFIED',
    summary: input.postgresSummary || 'PostgreSQL / Neon remote connection not verified in current runtime.'
  });

  const hasCronSecret = Boolean((process.env.CRON_SECRET || '').trim());
  const hasGeminiKey = Boolean(
    (process.env.GEMINI_API_KEY || '').trim() && process.env.GEMINI_API_KEY !== 'dummy_key'
  );
  checks.push({
    name: 'automation_credentials',
    status: hasCronSecret && hasGeminiKey ? 'PASS' : hasCronSecret ? 'WARNING' : 'FAIL',
    summary: !hasCronSecret
      ? 'CRON_SECRET is missing (cron endpoints fail closed with 503).'
      : hasGeminiKey
        ? 'CRON_SECRET and GEMINI_API_KEY configured.'
        : 'CRON_SECRET configured; GEMINI_API_KEY absent (extraction steps fail closed without fabrication).'
  });

  if (input.cronScheduleConfigured) {
    checks.push({
      name: 'cron_schedule',
      status: input.cronScheduleConfigured === '30 21 * * *' ? 'PASS' : 'WARNING',
      summary: `Configured Vercel cron schedule: ${input.cronScheduleConfigured}`
    });
  }

  if (input.lastBackupVerified === true && input.lastRestoreVerified === true) {
    checks.push({
      name: 'backup_and_restore',
      status: 'PASS',
      summary: 'Latest backup checksums and isolated temporary directory restore passed.'
    });
  } else if (input.lastBackupVerified === false || input.lastRestoreVerified === false) {
    checks.push({
      name: 'backup_and_restore',
      status: 'FAIL',
      summary: 'Latest backup or isolated restore verification failed.'
    });
  } else {
    checks.push({
      name: 'backup_and_restore',
      status: 'NOT_VERIFIED',
      summary: 'Backup/restore verification has not run in current process.'
    });
  }

  const deadLetterCount = input.deadLetterCount ?? 0;
  const quarantinedCount = input.quarantinedCount ?? countByCat('QUARANTINED_RECORD');
  if (deadLetterCount > 0) {
    checks.push({
      name: 'quarantine_and_dead_letter',
      status: 'WARNING',
      summary: `${deadLetterCount} quarantined/dead-letter item(s) awaiting human review.`
    });
  } else {
    checks.push({
      name: 'quarantine_and_dead_letter',
      status: 'PASS',
      summary: 'No unresolved dead-letter items.'
    });
  }

  let overallStatus: OperationalHealthStatus = 'PASS';
  if (checks.some((c) => c.status === 'FAIL') || countByCat('COUNT_DELTA_ANOMALY') > 0) {
    overallStatus = 'FAIL';
  } else if (checks.some((c) => c.status === 'WARNING')) {
    overallStatus = 'WARNING';
  } else if (checks.every((c) => c.status === 'NOT_VERIFIED')) {
    overallStatus = 'NOT_VERIFIED';
  }

  return {
    generatedAt: new Date().toISOString(),
    overallStatus,
    checks,
    counters: {
      dbConnectionErrors: countByCat('DB_CONNECTION_ERROR'),
      migrationEvents: countByCat('MIGRATION_EVENT'),
      updateJobRuns: countByCat('UPDATE_JOB_RUN'),
      sourceRetrievalFailures: countByCat('SOURCE_RETRIEVAL_FAILURE'),
      verificationFailures: countByCat('VERIFICATION_FAILURE'),
      quarantinedRecords: quarantinedCount,
      retryAttempts: countByCat('RETRY_ATTEMPT'),
      cronOutcomes: countByCat('CRON_EXECUTION'),
      backupOrRestoreEvents: countByCat('BACKUP_OUTCOME') + countByCat('RESTORE_VERIFICATION'),
      countDeltaAnomalies: countByCat('COUNT_DELTA_ANOMALY'),
      deadLetterPending: deadLetterCount
    },
    recentEvents: events.slice(0, 25)
  };
}
