import path from 'node:path';
import {
  DatabaseConfigurationError,
  PostgresImmigrationRepository,
  createPostgresExecutor,
  isDatabaseConfigurationError,
  isPlaceholderConnectionString,
  isProductionEnvironment,
  isVercelRuntime,
  validatePostgresConnectionUrl,
  type PgExecutor,
  type PostgresConnectionPurpose,
  type PostgresTimeoutConfig
} from './postgresDatabase';
import {
  createAsyncSqliteRepositoryAdapter,
  type DatabaseBackendKind,
  type MigrationCapableRepository,
  type ReadOnlyImmigrationRepository,
  type ReadWriteImmigrationRepository
} from './repository';

export { DatabaseConfigurationError, isDatabaseConfigurationError };

export type ConfiguredDbDriver = 'postgres' | 'sqlite';

export interface DatabaseProviderOptions {
  /** Override environment variables (used for deterministic unit testing). */
  env?: NodeJS.ProcessEnv;
  /** Explicit local-dev SQLite file path override (ignored in production / Vercel). */
  sqlitePath?: string;
  /** Explicit isolated in-memory PGlite opt-in (forbidden in production / Vercel). */
  allowPglite?: boolean;
  /** Isolated mock PgExecutor for unit tests (strictly forbidden in production / Vercel). */
  mockExecutor?: PgExecutor;
  /** Custom timeout overrides for PostgreSQL pools. */
  timeouts?: Partial<PostgresTimeoutConfig>;
  /** Bypass module-level singleton cache (recommended for isolated tests). */
  disableCache?: boolean;
}

export interface RoleConfigCheckResult {
  envVarName: string;
  purpose: PostgresConnectionPurpose;
  configured: boolean;
  valid: boolean;
  code?: string;
  message: string;
  isNeonHost?: boolean;
  isPooledHost?: boolean;
  requiresTls?: boolean;
}

export interface DatabaseProviderConfigValidation {
  ready: boolean;
  environment: 'production' | 'development';
  isVercel: boolean;
  effectiveDriver: ConfiguredDbDriver;
  roles: {
    readonly: RoleConfigCheckResult;
    appReadWrite: RoleConfigCheckResult;
    migration: RoleConfigCheckResult;
  };
  warnings: string[];
  errors: string[];
}

export interface DatabaseRuntimeDiagnostics {
  environment: 'production' | 'development';
  isVercel: boolean;
  effectiveDriver: ConfiguredDbDriver;
  sqliteExplicitlyRequested: boolean;
  sqlitePermitted: boolean;
  pglitePermitted: boolean;
  credentialsConfigured: {
    readonly: boolean;
    appReadWrite: boolean;
    migration: boolean;
    test: boolean;
  };
  cachedBackends: {
    readonly: DatabaseBackendKind | null;
    readwrite: DatabaseBackendKind | null;
  };
}

let cachedReadOnlyRepo: ReadOnlyImmigrationRepository | null = null;
let cachedReadWriteRepo: ReadWriteImmigrationRepository | null = null;
let pendingReadOnlyInit: Promise<ReadOnlyImmigrationRepository> | null = null;
let pendingReadWriteInit: Promise<ReadWriteImmigrationRepository> | null = null;

/**
 * Resolves the configured database driver.
 * Production / Vercel ALWAYS enforces PostgreSQL (fail-closed) and ignores DB_DRIVER=sqlite.
 */
export function resolveConfiguredDatabaseDriver(env: NodeJS.ProcessEnv = process.env): ConfiguredDbDriver {
  if (isProductionEnvironment(env)) {
    return 'postgres';
  }
  const raw = (env.DB_DRIVER || '').trim().toLowerCase();
  if (raw === 'sqlite') {
    return 'sqlite';
  }
  return 'postgres';
}

function assertSqliteAllowed(env: NodeJS.ProcessEnv): void {
  if (isProductionEnvironment(env)) {
    throw new DatabaseConfigurationError(
      'SQLITE_FORBIDDEN_IN_PRODUCTION',
      'SQLite fallback is strictly prohibited in production and Vercel environments. Configure NEON_READONLY_DATABASE_URL and NEON_APP_DATABASE_URL.'
    );
  }
}

async function createExplicitLocalSqliteRepository(
  accessMode: 'readonly' | 'readwrite',
  options: DatabaseProviderOptions
): Promise<ReadOnlyImmigrationRepository | ReadWriteImmigrationRepository> {
  const env = options.env ?? process.env;
  assertSqliteAllowed(env);

  // Dynamic import ensures better-sqlite3 native module is NEVER eagerly loaded or opened at import time.
  const sqliteCore = await import('./sqliteCore');
  const configuredPath = (options.sqlitePath || env.VISAAPPLY_SQLITE_PATH || '').trim();
  if (!configuredPath) {
    throw new DatabaseConfigurationError(
      'SQLITE_PATH_REQUIRED',
      'When DB_DRIVER=sqlite is explicitly enabled for local development, provide VISAAPPLY_SQLITE_PATH or options.sqlitePath.',
      { envVarName: 'VISAAPPLY_SQLITE_PATH' }
    );
  }

  const resolvedPath = path.resolve(configuredPath);
  const db = sqliteCore.openSqliteDatabase(resolvedPath, {
    readonly: accessMode === 'readonly',
    skipMigrations: accessMode === 'readonly'
  });
  const syncRepo = sqliteCore.createSqliteRepository(db);

  return createAsyncSqliteRepositoryAdapter(syncRepo, {
    accessMode,
    onClose: () => sqliteCore.closeSqliteDatabase(db)
  });
}

function wrapAsReadOnlyProxy(repo: PostgresImmigrationRepository): ReadOnlyImmigrationRepository {
  const readOnlySurface: ReadOnlyImmigrationRepository = {
    backend: repo.backend,
    accessMode: 'readonly',
    getAppliedMigrations: () => repo.getAppliedMigrations(),
    getBatchStateFromDb: () => repo.getBatchStateFromDb(),
    getImmigrationProgram: (id) => repo.getImmigrationProgram(id),
    getAllImmigrationPrograms: () => repo.getAllImmigrationPrograms(),
    getChangelogFromDb: () => repo.getChangelogFromDb(),
    getCronExecutionLogsFromDb: (limit) => repo.getCronExecutionLogsFromDb(limit),
    getVisaDetails: (programId) => repo.getVisaDetails(programId),
    getAllVisaDetails: () => repo.getAllVisaDetails(),
    getPaginatedVisaDetails: (page, limit, search, status, category) =>
      repo.getPaginatedVisaDetails(page, limit, search, status, category),
    getDashboardStats: () => repo.getDashboardStats(),
    getVisaClaims: (programId) => repo.getVisaClaims(programId),
    getVisaClaimsWithEvidence: (programId, targetNationality) =>
      repo.getVisaClaimsWithEvidence(programId, targetNationality),
    getVisaClaimById: (claimId) => repo.getVisaClaimById(claimId),
    getVisaEvidence: (claimId) => repo.getVisaEvidence(claimId),
    getVisaVersions: (programId) => repo.getVisaVersions(programId),
    getAutomationCheckpoint: (checkpointId) => repo.getAutomationCheckpoint(checkpointId),
    getDeadLetterItems: (status) => repo.getDeadLetterItems(status),
    getOperationalEvents: (limit) => repo.getOperationalEvents(limit),
    auditIntegrity: () => repo.auditIntegrity(),
    getSlotSubscriberCount: (activeOnly) => repo.getSlotSubscriberCount(activeOnly),
    getSlotSubscribers: (activeOnly) => repo.getSlotSubscribers(activeOnly),
    getSlotEmbassyStatuses: () => repo.getSlotEmbassyStatuses(),
    getSlotEmailLogs: (limit) => repo.getSlotEmailLogs(limit),
    getEditorialArticles: (status) => repo.getEditorialArticles(status),
    getEditorialArticleBySlug: (slug) => repo.getEditorialArticleBySlug(slug),
    isAdminSessionRevoked: (jti) => repo.isAdminSessionRevoked(jti),
    close: () => repo.close()
  };
  return Object.freeze(readOnlySurface);
}

function wrapAsRuntimeReadWriteProxy(repo: PostgresImmigrationRepository): ReadWriteImmigrationRepository {
  // Intentionally omits runTrackedMigrations / applyPhase31Migrations / initSchema so runtime roles cannot invoke DDL
  const runtimeSurface: ReadWriteImmigrationRepository = {
    backend: repo.backend,
    accessMode: 'readwrite',
    getAppliedMigrations: () => repo.getAppliedMigrations(),
    getBatchStateFromDb: () => repo.getBatchStateFromDb(),
    getImmigrationProgram: (id) => repo.getImmigrationProgram(id),
    getAllImmigrationPrograms: () => repo.getAllImmigrationPrograms(),
    getChangelogFromDb: () => repo.getChangelogFromDb(),
    getCronExecutionLogsFromDb: (limit) => repo.getCronExecutionLogsFromDb(limit),
    getVisaDetails: (programId) => repo.getVisaDetails(programId),
    getAllVisaDetails: () => repo.getAllVisaDetails(),
    getPaginatedVisaDetails: (page, limit, search, status, category) =>
      repo.getPaginatedVisaDetails(page, limit, search, status, category),
    getDashboardStats: () => repo.getDashboardStats(),
    getVisaClaims: (programId) => repo.getVisaClaims(programId),
    getVisaClaimsWithEvidence: (programId, targetNationality) =>
      repo.getVisaClaimsWithEvidence(programId, targetNationality),
    getVisaClaimById: (claimId) => repo.getVisaClaimById(claimId),
    getVisaEvidence: (claimId) => repo.getVisaEvidence(claimId),
    getVisaVersions: (programId) => repo.getVisaVersions(programId),
    getAutomationCheckpoint: (checkpointId) => repo.getAutomationCheckpoint(checkpointId),
    getDeadLetterItems: (status) => repo.getDeadLetterItems(status),
    getOperationalEvents: (limit) => repo.getOperationalEvents(limit),
    auditIntegrity: () => repo.auditIntegrity(),
    getSlotSubscriberCount: (activeOnly) => repo.getSlotSubscriberCount(activeOnly),
    getSlotSubscribers: (activeOnly) => repo.getSlotSubscribers(activeOnly),
    getSlotEmbassyStatuses: () => repo.getSlotEmbassyStatuses(),
    getSlotEmailLogs: (limit) => repo.getSlotEmailLogs(limit),
    getEditorialArticles: (status) => repo.getEditorialArticles(status),
    getEditorialArticleBySlug: (slug) => repo.getEditorialArticleBySlug(slug),
    isAdminSessionRevoked: (jti) => repo.isAdminSessionRevoked(jti),
    saveBatchStateToDb: (state) => repo.saveBatchStateToDb(state),
    saveImmigrationProgram: (prog) => repo.saveImmigrationProgram(prog),
    saveChangelogEntryToDb: (entry) => repo.saveChangelogEntryToDb(entry),
    logCronExecutionToDb: (log) => repo.logCronExecutionToDb(log),
    saveVisaDetails: (details) => repo.saveVisaDetails(details),
    updateVisaStatus: (programId, status) => repo.updateVisaStatus(programId, status),
    restoreVersion: (versionId, editorId) => repo.restoreVersion(versionId, editorId),
    saveVisaClaim: (claim) => repo.saveVisaClaim(claim),
    deleteVisaClaim: (claimId) => repo.deleteVisaClaim(claimId),
    saveVisaEvidence: (evidence, opts) => repo.saveVisaEvidence(evidence, opts),
    deleteVisaEvidence: (evidenceId) => repo.deleteVisaEvidence(evidenceId),
    reconcileClaimVerificationAfterEvidenceChange: (claimId, reasonTrigger) =>
      repo.reconcileClaimVerificationAfterEvidenceChange(claimId, reasonTrigger),
    saveVisaVersion: (version) => repo.saveVisaVersion(version),
    acquireJobLock: (lockKey, ownerId, ttlMs, metadata) =>
      repo.acquireJobLock(lockKey, ownerId, ttlMs, metadata),
    releaseJobLock: (lockKey, ownerId) => repo.releaseJobLock(lockKey, ownerId),
    saveAutomationCheckpoint: (cp) => repo.saveAutomationCheckpoint(cp),
    recordDeadLetterItem: (item) => repo.recordDeadLetterItem(item),
    insertOperationalEvent: (event) => repo.insertOperationalEvent(event),
    saveSlotSubscriber: (sub) => repo.saveSlotSubscriber(sub),
    deactivateSlotSubscriber: (id) => repo.deactivateSlotSubscriber(id),
    upsertSlotEmbassyStatus: (entry) => repo.upsertSlotEmbassyStatus(entry),
    logSlotEmailDelivery: (entry) => repo.logSlotEmailDelivery(entry),
    saveEditorialArticle: (article) => repo.saveEditorialArticle(article),
    deleteEditorialArticle: (slug) => repo.deleteEditorialArticle(slug),
    revokeAdminSessionJti: (jti, expiresAt) => repo.revokeAdminSessionJti(jti, expiresAt),
    pruneExpiredRevokedSessions: (nowIso) => repo.pruneExpiredRevokedSessions(nowIso),
    close: () => repo.close()
  };
  return Object.freeze(runtimeSurface);
}

function assertMockExecutorAllowed(env: NodeJS.ProcessEnv, purpose: PostgresConnectionPurpose): void {
  if (isProductionEnvironment(env)) {
    throw new DatabaseConfigurationError(
      'MOCK_EXECUTOR_FORBIDDEN_IN_PRODUCTION',
      'Injecting a mock database executor is strictly prohibited in production and Vercel environments.',
      { purpose }
    );
  }
}

/**
 * Returns a strictly read-only asynchronous repository for public read operations.
 * Uses NEON_READONLY_DATABASE_URL in PostgreSQL mode. Fails closed in production/Vercel.
 */
export async function getReadOnlyRepository(
  options: DatabaseProviderOptions = {}
): Promise<ReadOnlyImmigrationRepository> {
  const useCache =
    !options.disableCache && !options.env && !options.sqlitePath && !options.allowPglite && !options.mockExecutor;
  if (useCache && cachedReadOnlyRepo) {
    return cachedReadOnlyRepo;
  }
  if (useCache && pendingReadOnlyInit) {
    return pendingReadOnlyInit;
  }

  const initPromise = (async (): Promise<ReadOnlyImmigrationRepository> => {
    const env = options.env ?? process.env;
    if (options.mockExecutor) {
      assertMockExecutorAllowed(env, 'readonly');
      const forcedReadOnlyExec: PgExecutor = {
        ...options.mockExecutor,
        accessMode: 'readonly',
        purpose: 'readonly'
      };
      return wrapAsReadOnlyProxy(new PostgresImmigrationRepository(forcedReadOnlyExec));
    }

    const driver = resolveConfiguredDatabaseDriver(env);
    if (driver === 'sqlite') {
      return createExplicitLocalSqliteRepository('readonly', options);
    }

    const exec = await createPostgresExecutor(undefined, {
      purpose: 'readonly',
      accessMode: 'readonly',
      allowPglite: options.allowPglite,
      rejectOwnerRole: true,
      timeouts: options.timeouts,
      env
    });
    return wrapAsReadOnlyProxy(new PostgresImmigrationRepository(exec));
  })();

  if (useCache) {
    pendingReadOnlyInit = initPromise;
  }

  try {
    const repo = await initPromise;
    if (useCache) {
      cachedReadOnlyRepo = repo;
    }
    return repo;
  } finally {
    if (useCache && pendingReadOnlyInit === initPromise) {
      pendingReadOnlyInit = null;
    }
  }
}

/**
 * Returns a runtime read-write asynchronous repository for authorized writes, admin operations, and cron jobs.
 * Uses NEON_APP_DATABASE_URL in PostgreSQL mode. Never uses owner credentials and never exposes DDL methods.
 */
export async function getReadWriteRepository(
  options: DatabaseProviderOptions = {}
): Promise<ReadWriteImmigrationRepository> {
  const useCache =
    !options.disableCache && !options.env && !options.sqlitePath && !options.allowPglite && !options.mockExecutor;
  if (useCache && cachedReadWriteRepo) {
    return cachedReadWriteRepo;
  }
  if (useCache && pendingReadWriteInit) {
    return pendingReadWriteInit;
  }

  const initPromise = (async (): Promise<ReadWriteImmigrationRepository> => {
    const env = options.env ?? process.env;
    if (options.mockExecutor) {
      assertMockExecutorAllowed(env, 'app_rw');
      const forcedRwExec: PgExecutor = {
        ...options.mockExecutor,
        accessMode: 'readwrite',
        purpose: 'app_rw'
      };
      return wrapAsRuntimeReadWriteProxy(new PostgresImmigrationRepository(forcedRwExec));
    }

    const driver = resolveConfiguredDatabaseDriver(env);
    if (driver === 'sqlite') {
      return (await createExplicitLocalSqliteRepository('readwrite', options)) as ReadWriteImmigrationRepository;
    }

    const exec = await createPostgresExecutor(undefined, {
      purpose: 'app_rw',
      accessMode: 'readwrite',
      allowPglite: options.allowPglite,
      rejectOwnerRole: true,
      timeouts: options.timeouts,
      env
    });
    return wrapAsRuntimeReadWriteProxy(new PostgresImmigrationRepository(exec));
  })();

  if (useCache) {
    pendingReadWriteInit = initPromise;
  }

  try {
    const repo = await initPromise;
    if (useCache) {
      cachedReadWriteRepo = repo;
    }
    return repo;
  } finally {
    if (useCache && pendingReadWriteInit === initPromise) {
      pendingReadWriteInit = null;
    }
  }
}

/**
 * Returns a migration-capable PostgreSQL repository isolated strictly for authorized CLI migration runners.
 * Uses NEON_MIGRATION_DATABASE_URL exclusively (never cached for runtime endpoints).
 */
export async function getMigrationRepository(
  options: Pick<DatabaseProviderOptions, 'env' | 'allowPglite' | 'timeouts' | 'mockExecutor'> = {}
): Promise<MigrationCapableRepository> {
  const env = options.env ?? process.env;
  if (options.mockExecutor) {
    assertMockExecutorAllowed(env, 'migration');
    const forcedMigExec: PgExecutor = {
      ...options.mockExecutor,
      accessMode: 'migration',
      purpose: 'migration'
    };
    return new PostgresImmigrationRepository(forcedMigExec);
  }
  const exec = await createPostgresExecutor(undefined, {
    purpose: 'migration',
    accessMode: 'migration',
    allowPglite: options.allowPglite,
    rejectOwnerRole: false,
    useServerlessDriver: false,
    maxPoolSize: 1,
    timeouts: options.timeouts,
    env
  });
  return new PostgresImmigrationRepository(exec);
}

export async function closeAllDatabaseProviders(): Promise<void> {
  const toClose: Array<Promise<void>> = [];
  pendingReadOnlyInit = null;
  pendingReadWriteInit = null;
  if (cachedReadOnlyRepo) {
    const r = cachedReadOnlyRepo;
    cachedReadOnlyRepo = null;
    toClose.push(r.close());
  }
  if (cachedReadWriteRepo) {
    const r = cachedReadWriteRepo;
    cachedReadWriteRepo = null;
    toClose.push(r.close());
  }
  await Promise.allSettled(toClose);
}

/**
 * Pure, zero-network pre-flight configuration validator for staging, production, and local environments.
 * Never opens sockets, never executes queries, and never echoes passwords, tokens, or connection URIs.
 */
export function validateDatabaseProviderConfig(
  env: NodeJS.ProcessEnv = process.env
): DatabaseProviderConfigValidation {
  const prod = isProductionEnvironment(env);
  const vercel = isVercelRuntime(env);
  const effectiveDriver = resolveConfiguredDatabaseDriver(env);
  const warnings: string[] = [];
  const errors: string[] = [];

  if (prod && (env.DB_DRIVER || '').trim().toLowerCase() === 'sqlite') {
    warnings.push('DB_DRIVER=sqlite is ignored in production/Vercel; PostgreSQL is enforced.');
  }
  if (prod && env.ALLOW_PGLITE_FALLBACK === 'true') {
    warnings.push('ALLOW_PGLITE_FALLBACK=true is ignored in production/Vercel; PGlite is forbidden.');
  }

  const checkRole = (
    envVarName: string,
    purpose: PostgresConnectionPurpose,
    rejectOwnerRole: boolean
  ): { result: RoleConfigCheckResult; username?: string } => {
    const raw = (env[envVarName] || '').trim();
    if (!raw) {
      return {
        result: {
          envVarName,
          purpose,
          configured: false,
          valid: false,
          code: 'POSTGRES_CREDENTIALS_MISSING',
          message: `${envVarName} is not configured.`
        }
      };
    }
    try {
      const validated = validatePostgresConnectionUrl(raw, { purpose, env, rejectOwnerRole });
      return {
        username: validated.username.toLowerCase(),
        result: {
          envVarName,
          purpose,
          configured: true,
          valid: true,
          message: `${envVarName} passed TLS, host, and role-policy validation.`,
          isNeonHost: validated.isNeonHost,
          isPooledHost: validated.isPooledHost,
          requiresTls: validated.requiresTls
        }
      };
    } catch (err: any) {
      const code = isDatabaseConfigurationError(err) ? err.code : 'POSTGRES_INVALID_URI';
      return {
        result: {
          envVarName,
          purpose,
          configured: true,
          valid: false,
          code,
          message: String(err?.message || `${envVarName} failed validation.`)
        }
      };
    }
  };

  const roCheck = checkRole('NEON_READONLY_DATABASE_URL', 'readonly', true);
  const rwCheck = checkRole('NEON_APP_DATABASE_URL', 'app_rw', true);
  const migCheck = checkRole('NEON_MIGRATION_DATABASE_URL', 'migration', false);

  if (effectiveDriver === 'sqlite') {
    const sqlitePath = (env.VISAAPPLY_SQLITE_PATH || '').trim();
    if (!sqlitePath) {
      errors.push('SQLITE_PATH_REQUIRED: Set VISAAPPLY_SQLITE_PATH when DB_DRIVER=sqlite in local development.');
    }
  } else {
    if (!roCheck.result.valid) {
      errors.push(roCheck.result.message);
    }
    if (!rwCheck.result.valid) {
      errors.push(rwCheck.result.message);
    }
    if (roCheck.result.valid && rwCheck.result.valid && roCheck.username && roCheck.username === rwCheck.username) {
      warnings.push(
        'NEON_READONLY_DATABASE_URL and NEON_APP_DATABASE_URL use the same database role username; use separate least-privilege roles (visaapply_audit_ro and visaapply_app_rw).'
      );
    }
    if (roCheck.result.valid && roCheck.result.isNeonHost && !roCheck.result.isPooledHost && vercel) {
      warnings.push('NEON_READONLY_DATABASE_URL should use Neon pooled endpoint (-pooler.) on Vercel Serverless.');
    }
    if (rwCheck.result.valid && rwCheck.result.isNeonHost && !rwCheck.result.isPooledHost && vercel) {
      warnings.push('NEON_APP_DATABASE_URL should use Neon pooled endpoint (-pooler.) on Vercel Serverless.');
    }
    if (vercel && migCheck.result.configured) {
      warnings.push(
        'NEON_MIGRATION_DATABASE_URL should NOT be set in Vercel runtime environment variables; keep migration credentials restricted to authorized CLI/CI migration runners.'
      );
    }
    if (migCheck.result.configured && migCheck.result.valid && migCheck.result.isPooledHost) {
      warnings.push('NEON_MIGRATION_DATABASE_URL should use Neon direct (non-pooled) endpoint for DDL migrations.');
    }
  }

  return {
    ready: errors.length === 0,
    environment: prod ? 'production' : 'development',
    isVercel: vercel,
    effectiveDriver,
    roles: {
      readonly: roCheck.result,
      appReadWrite: rwCheck.result,
      migration: migCheck.result
    },
    warnings,
    errors
  };
}

export function getDatabaseRuntimeDiagnostics(env: NodeJS.ProcessEnv = process.env): DatabaseRuntimeDiagnostics {
  const prod = isProductionEnvironment(env);
  const vercel = isVercelRuntime(env);
  const effectiveDriver = resolveConfiguredDatabaseDriver(env);
  const hasRealUrl = (val?: string) => {
    const trimmed = (val || '').trim();
    return Boolean(
      trimmed &&
        (trimmed.startsWith('postgres://') || trimmed.startsWith('postgresql://')) &&
        !isPlaceholderConnectionString(trimmed)
    );
  };

  return {
    environment: prod ? 'production' : 'development',
    isVercel: vercel,
    effectiveDriver,
    sqliteExplicitlyRequested: (env.DB_DRIVER || '').trim().toLowerCase() === 'sqlite',
    sqlitePermitted: !prod,
    pglitePermitted: !prod,
    credentialsConfigured: {
      readonly: hasRealUrl(env.NEON_READONLY_DATABASE_URL),
      appReadWrite: hasRealUrl(env.NEON_APP_DATABASE_URL),
      migration: hasRealUrl(env.NEON_MIGRATION_DATABASE_URL),
      test: hasRealUrl(env.NEON_TEST_DATABASE_URL)
    },
    cachedBackends: {
      readonly: cachedReadOnlyRepo ? cachedReadOnlyRepo.backend : null,
      readwrite: cachedReadWriteRepo ? cachedReadWriteRepo.backend : null
    }
  };
}
