import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  OperationalEventSink,
  recordOperationalEvent,
  redactSensitiveData
} from './operationalObservability.js';

export type AutomationFailureClass =
  | 'MISSING_CREDENTIALS'
  | 'AUTH_ERROR'
  | 'QUOTA_EXHAUSTED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'SOURCE_UNAVAILABLE'
  | 'VALIDATION_ERROR'
  | 'EXPIRED_EVIDENCE'
  | 'CONFLICT'
  | 'UNKNOWN_ERROR';

export interface ClassifiedAutomationError {
  failureClass: AutomationFailureClass;
  retryable: boolean;
  httpStatus?: number;
  message: string;
}

export function classifyAutomationError(err: unknown, explicitStatus?: number): ClassifiedAutomationError {
  const anyErr = err as any;
  const status = Number(explicitStatus ?? anyErr?.status ?? anyErr?.statusCode ?? anyErr?.code ?? 0) || undefined;
  const rawMsg =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : anyErr?.message
          ? String(anyErr.message)
          : String(err ?? 'Unknown error');
  const safeMsg = redactSensitiveData(rawMsg);
  const lower = safeMsg.toLowerCase();

  if (
    lower.includes('missing_credentials') ||
    lower.includes('cron_secret') ||
    lower.includes('gemini_api_key') ||
    lower.includes('not configured')
  ) {
    return { failureClass: 'MISSING_CREDENTIALS', retryable: false, httpStatus: status || 503, message: safeMsg };
  }
  if (
    status === 401 ||
    status === 403 ||
    lower.includes('unauthorized') ||
    lower.includes('api_key_invalid') ||
    lower.includes('permission_denied') ||
    lower.includes('forbidden')
  ) {
    return { failureClass: 'AUTH_ERROR', retryable: false, httpStatus: status || 401, message: safeMsg };
  }
  if (
    status === 429 ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('resource_exhausted') ||
    lower.includes('too many requests')
  ) {
    return { failureClass: 'QUOTA_EXHAUSTED', retryable: true, httpStatus: 429, message: safeMsg };
  }
  if (
    anyErr?.name === 'AbortError' ||
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('aborted') ||
    lower.includes('etimedout')
  ) {
    return { failureClass: 'TIMEOUT', retryable: true, httpStatus: status || 504, message: safeMsg };
  }
  if (
    lower.includes('econnrefused') ||
    lower.includes('enotfound') ||
    lower.includes('econnreset') ||
    lower.includes('network') ||
    lower.includes('fetch failed') ||
    lower.includes('socket hang up')
  ) {
    return { failureClass: 'NETWORK_ERROR', retryable: true, httpStatus: status || 502, message: safeMsg };
  }
  if (status === 404 || status === 410 || (status !== undefined && status >= 500) || lower.includes('source unavailable')) {
    return {
      failureClass: 'SOURCE_UNAVAILABLE',
      retryable: status === undefined || status >= 500,
      httpStatus: status || 502,
      message: safeMsg
    };
  }
  if (lower.includes('expired') || lower.includes('stale')) {
    return { failureClass: 'EXPIRED_EVIDENCE', retryable: false, httpStatus: status || 422, message: safeMsg };
  }
  if (lower.includes('conflict') || lower.includes('already in progress') || lower.includes('lock')) {
    return { failureClass: 'CONFLICT', retryable: false, httpStatus: status || 409, message: safeMsg };
  }
  if (
    status === 400 ||
    status === 422 ||
    lower.includes('invalid json') ||
    lower.includes('validation') ||
    lower.includes('malformed') ||
    lower.includes('schema')
  ) {
    return { failureClass: 'VALIDATION_ERROR', retryable: false, httpStatus: status || 400, message: safeMsg };
  }

  return { failureClass: 'UNKNOWN_ERROR', retryable: false, httpStatus: status || 500, message: safeMsg };
}

export interface BoundedRetryOptions {
  maxAttempts?: number;
  timeoutMs?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitterMs?: number;
  component?: string;
  eventSink?: OperationalEventSink;
  onRetry?: (attempt: number, delayMs: number, classified: ClassifiedAutomationError) => void;
}

export async function executeWithBoundedRetry<T>(
  operation: (signal: AbortSignal, attempt: number) => Promise<T>,
  options: BoundedRetryOptions = {}
): Promise<{ result: T; attempts: number }> {
  const maxAttempts = Math.max(1, Math.min(options.maxAttempts ?? 3, 5));
  const timeoutMs = Math.max(50, options.timeoutMs ?? 15000);
  const baseDelayMs = Math.max(0, options.baseDelayMs ?? 250);
  const maxDelayMs = Math.max(baseDelayMs, options.maxDelayMs ?? 5000);
  const jitterMs = Math.max(0, options.jitterMs ?? 100);

  let lastClassified: ClassifiedAutomationError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          controller.abort();
          reject(new Error(`Operation timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      const result = await Promise.race([operation(controller.signal, attempt), timeoutPromise]);
      if (timeoutHandle) clearTimeout(timeoutHandle);
      return { result, attempts: attempt };
    } catch (err: any) {
      if (timeoutHandle) clearTimeout(timeoutHandle);
      const classified = classifyAutomationError(err);
      lastClassified = classified;

      if (!classified.retryable || attempt >= maxAttempts) {
        const finalErr = new Error(`[${classified.failureClass}] ${classified.message}`) as Error & {
          failureClass?: AutomationFailureClass;
          httpStatus?: number;
          attempts?: number;
        };
        finalErr.failureClass = classified.failureClass;
        finalErr.httpStatus = classified.httpStatus;
        finalErr.attempts = attempt;
        throw finalErr;
      }

      const expDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1));
      const delay = Math.min(maxDelayMs, Math.round(expDelay + Math.random() * jitterMs));

      if (options.onRetry) {
        options.onRetry(attempt, delay, classified);
      }

      recordOperationalEvent(
        {
          category: 'RETRY_ATTEMPT',
          severity: 'WARN',
          component: options.component || 'automation-retry',
          message: `Attempt ${attempt}/${maxAttempts} failed (${classified.failureClass}); retrying in ${delay}ms: ${classified.message}`,
          details: { attempt, maxAttempts, delayMs: delay, failureClass: classified.failureClass }
        },
        options.eventSink
      );

      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(lastClassified?.message || 'Retry loop exhausted');
}

export interface JobLockStore {
  acquireLock(
    lockKey: string,
    ownerId: string,
    ttlMs: number,
    metadata?: Record<string, unknown>
  ): Promise<{ acquired: boolean; existingOwner?: string; expiresAt?: string }>;
  releaseLock(lockKey: string, ownerId: string): Promise<boolean>;
}

export class FileJobLockStore implements JobLockStore {
  private readonly lockDir: string;

  constructor(lockDir: string = path.join(os.tmpdir(), 'visaapply-job-locks')) {
    this.lockDir = lockDir;
    if (!fs.existsSync(this.lockDir)) {
      fs.mkdirSync(this.lockDir, { recursive: true });
    }
  }

  private lockPath(lockKey: string): string {
    const safeName = lockKey.replace(/[^a-zA-Z0-9._-]/g, '_');
    return path.join(this.lockDir, `${safeName}.lock.json`);
  }

  async acquireLock(
    lockKey: string,
    ownerId: string,
    ttlMs: number = 5 * 60 * 1000,
    metadata: Record<string, unknown> = {}
  ): Promise<{ acquired: boolean; existingOwner?: string; expiresAt?: string }> {
    const filePath = this.lockPath(lockKey);
    const now = Date.now();
    const expiresAt = new Date(now + Math.max(500, ttlMs)).toISOString();
    const payload = JSON.stringify({
      lockKey,
      ownerId,
      acquiredAt: new Date(now).toISOString(),
      expiresAt,
      metadata: redactSensitiveData(metadata)
    });

    for (let tryCount = 0; tryCount < 2; tryCount++) {
      try {
        const fd = fs.openSync(filePath, 'wx');
        try {
          fs.writeFileSync(fd, payload, 'utf-8');
        } finally {
          fs.closeSync(fd);
        }
        return { acquired: true, expiresAt };
      } catch (err: any) {
        if (err?.code !== 'EEXIST') {
          throw err;
        }
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(raw);
          if (parsed?.ownerId === ownerId) {
            fs.writeFileSync(filePath, payload, 'utf-8');
            return { acquired: true, expiresAt };
          }
          if (parsed?.expiresAt && Date.parse(parsed.expiresAt) <= now) {
            // Reclaim expired lock
            fs.unlinkSync(filePath);
            continue;
          }
          return {
            acquired: false,
            existingOwner: parsed?.ownerId || 'unknown',
            expiresAt: parsed?.expiresAt
          };
        } catch {
          // Corrupt lock file; unlink and retry once
          try {
            fs.unlinkSync(filePath);
          } catch {}
        }
      }
    }

    return { acquired: false, existingOwner: 'contended' };
  }

  async releaseLock(lockKey: string, ownerId: string): Promise<boolean> {
    const filePath = this.lockPath(lockKey);
    try {
      if (!fs.existsSync(filePath)) return false;
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (parsed?.ownerId === ownerId) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export interface CheckpointState {
  checkpointId: string;
  jobName: string;
  runId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL_FAILED' | 'FAILED';
  cursorIndex: number;
  totalItems: number;
  completedKeys: string[];
  failedKeys: string[];
  idempotencyKeys: string[];
  state?: Record<string, unknown>;
  updatedAt: string;
}

export interface CheckpointStore {
  getCheckpoint(checkpointId: string): Promise<CheckpointState | null>;
  saveCheckpoint(cp: Omit<CheckpointState, 'updatedAt'>): Promise<void>;
  recordDeadLetter?(item: {
    jobName: string;
    runId: string;
    targetKey: string;
    failureClass: string;
    errorMessage: string;
    payload?: Record<string, unknown>;
    retryCount?: number;
  }): Promise<string | void>;
}

export class FileCheckpointStore implements CheckpointStore {
  private readonly baseDir: string;

  constructor(baseDir: string = path.join(os.tmpdir(), 'visaapply-checkpoints')) {
    this.baseDir = baseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private cpPath(checkpointId: string): string {
    const safe = checkpointId.replace(/[^a-zA-Z0-9._-]/g, '_');
    return path.join(this.baseDir, `${safe}.json`);
  }

  private dlqPath(): string {
    return path.join(this.baseDir, 'dead_letter_queue.json');
  }

  async getCheckpoint(checkpointId: string): Promise<CheckpointState | null> {
    const filePath = this.cpPath(checkpointId);
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CheckpointState;
    } catch {
      return null;
    }
  }

  async saveCheckpoint(cp: Omit<CheckpointState, 'updatedAt'>): Promise<void> {
    const filePath = this.cpPath(cp.checkpointId);
    const tmpPath = `${filePath}.${crypto.randomBytes(3).toString('hex')}.tmp`;
    const payload: CheckpointState = {
      ...cp,
      state: cp.state ? (redactSensitiveData(cp.state) as Record<string, unknown>) : {},
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
  }

  async recordDeadLetter(item: {
    jobName: string;
    runId: string;
    targetKey: string;
    failureClass: string;
    errorMessage: string;
    payload?: Record<string, unknown>;
    retryCount?: number;
  }): Promise<string> {
    const dlqFile = this.dlqPath();
    let list: any[] = [];
    try {
      if (fs.existsSync(dlqFile)) {
        list = JSON.parse(fs.readFileSync(dlqFile, 'utf-8'));
      }
    } catch {
      list = [];
    }
    const id = `dlq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    list.push({
      id,
      jobName: item.jobName,
      runId: item.runId,
      targetKey: item.targetKey,
      failureClass: item.failureClass,
      errorMessage: redactSensitiveData(item.errorMessage),
      payload: redactSensitiveData(item.payload || {}),
      retryCount: item.retryCount ?? 0,
      status: 'QUARANTINED',
      createdAt: new Date().toISOString()
    });
    fs.writeFileSync(dlqFile, JSON.stringify(list.slice(-500), null, 2), 'utf-8');
    return id;
  }
}

export interface CandidateGateInput {
  sourceUrl: string;
  excerpt: string;
  hasConcreteChange: boolean;
  newValue?: string;
  oldValue?: string;
  legalProvision?: string;
  expirationDate?: string;
  conflictingValues?: boolean;
  nowDate?: Date;
}

export interface CandidateGateDecision {
  acceptedForStaging: boolean;
  gateStatus: 'STAGED_PENDING_REVIEW' | 'NEEDS_REVIEW' | 'QUARANTINED_EXPIRED' | 'NO_VERIFIED_CHANGE';
  publicationStatus: 'PENDING_HUMAN_REVIEW';
  verificationStatus: 'AWAITING_VERIFICATION' | 'EXPIRED';
  autoPublished: false;
  reasons: string[];
}

const DISALLOWED_SOURCE_DOMAINS = [
  'wikipedia.org',
  'reddit.com',
  'quora.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'youtube.com'
];

export function evaluateSourceExtractionCandidate(input: CandidateGateInput): CandidateGateDecision {
  const reasons: string[] = [];
  const urlStr = (input.sourceUrl || '').trim();
  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(urlStr);
  } catch {
    parsedUrl = null;
  }

  if (!parsedUrl || parsedUrl.protocol !== 'https:') {
    reasons.push('Official source URL is missing or not HTTPS.');
    return {
      acceptedForStaging: false,
      gateStatus: 'NEEDS_REVIEW',
      publicationStatus: 'PENDING_HUMAN_REVIEW',
      verificationStatus: 'AWAITING_VERIFICATION',
      autoPublished: false,
      reasons
    };
  }

  const host = parsedUrl.hostname.toLowerCase();
  if (DISALLOWED_SOURCE_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) {
    reasons.push(`Non-official source domain rejected (${host}).`);
    return {
      acceptedForStaging: false,
      gateStatus: 'NEEDS_REVIEW',
      publicationStatus: 'PENDING_HUMAN_REVIEW',
      verificationStatus: 'AWAITING_VERIFICATION',
      autoPublished: false,
      reasons
    };
  }

  if (!input.excerpt || input.excerpt.trim().length < 40) {
    reasons.push('Fetched official excerpt is too short to substantiate extraction.');
    return {
      acceptedForStaging: false,
      gateStatus: 'NO_VERIFIED_CHANGE',
      publicationStatus: 'PENDING_HUMAN_REVIEW',
      verificationStatus: 'AWAITING_VERIFICATION',
      autoPublished: false,
      reasons
    };
  }

  if (input.expirationDate) {
    const expMs = Date.parse(input.expirationDate);
    const nowMs = (input.nowDate || new Date()).getTime();
    if (!Number.isNaN(expMs) && expMs < nowMs) {
      reasons.push(`Evidence expired on ${input.expirationDate}; quarantined from publication.`);
      return {
        acceptedForStaging: false,
        gateStatus: 'QUARANTINED_EXPIRED',
        publicationStatus: 'PENDING_HUMAN_REVIEW',
        verificationStatus: 'EXPIRED',
        autoPublished: false,
        reasons
      };
    }
  }

  if (!input.hasConcreteChange || !input.newValue || !input.newValue.trim()) {
    reasons.push('No concrete verified policy or fee change detected in official excerpt.');
    return {
      acceptedForStaging: false,
      gateStatus: 'NO_VERIFIED_CHANGE',
      publicationStatus: 'PENDING_HUMAN_REVIEW',
      verificationStatus: 'AWAITING_VERIFICATION',
      autoPublished: false,
      reasons
    };
  }

  if (input.conflictingValues) {
    reasons.push('Conflicting extraction values detected; held in NEEDS_REVIEW pending human arbitration.');
    return {
      acceptedForStaging: false,
      gateStatus: 'NEEDS_REVIEW',
      publicationStatus: 'PENDING_HUMAN_REVIEW',
      verificationStatus: 'AWAITING_VERIFICATION',
      autoPublished: false,
      reasons
    };
  }

  return {
    acceptedForStaging: true,
    gateStatus: 'STAGED_PENDING_REVIEW',
    publicationStatus: 'PENDING_HUMAN_REVIEW',
    verificationStatus: 'AWAITING_VERIFICATION',
    autoPublished: false,
    reasons: ['Passed fail-closed official evidence gate; staged for mandatory human review.']
  };
}

export interface ItemOutcome<TResult = unknown> {
  key: string;
  idempotencyKey: string;
  status: 'SUCCEEDED' | 'SKIPPED_IDEMPOTENT' | 'FAILED_QUARANTINED';
  attempts: number;
  failureClass?: AutomationFailureClass;
  errorMessage?: string;
  result?: TResult;
}

export interface CheckpointedJobResult<TResult = unknown> {
  runId: string;
  jobName: string;
  checkpointId: string;
  status: 'COMPLETED' | 'PARTIAL_FAILED' | 'FAILED' | 'DUPLICATE_IN_PROGRESS';
  startedAt: string;
  endedAt: string;
  durationMs: number;
  resumedFromCheckpoint: boolean;
  totalItems: number;
  succeededCount: number;
  skippedCount: number;
  failedCount: number;
  outcomes: ItemOutcome<TResult>[];
}

export async function runCheckpointedAutomationJob<TItem, TResult = unknown>(options: {
  jobName: string;
  checkpointId: string;
  lockKey?: string;
  lockTtlMs?: number;
  items: TItem[];
  getItemKey: (item: TItem) => string;
  getIdempotencyKey?: (item: TItem) => string;
  processItem: (item: TItem, signal: AbortSignal) => Promise<TResult>;
  retryOptions?: BoundedRetryOptions;
  lockStore: JobLockStore;
  checkpointStore: CheckpointStore;
  eventSink?: OperationalEventSink;
  runId?: string;
}): Promise<CheckpointedJobResult<TResult>> {
  const startedMs = Date.now();
  const startedAt = new Date(startedMs).toISOString();
  const runId = options.runId || `run-${startedMs}-${crypto.randomBytes(3).toString('hex')}`;
  const lockKey = options.lockKey || `lock:${options.jobName}`;

  const lockRes = await options.lockStore.acquireLock(lockKey, runId, options.lockTtlMs ?? 5 * 60 * 1000, {
    jobName: options.jobName,
    checkpointId: options.checkpointId
  });

  if (!lockRes.acquired) {
    recordOperationalEvent(
      {
        category: 'UPDATE_JOB_RUN',
        severity: 'WARN',
        component: options.jobName,
        message: `Rejected overlapping execution (${runId}); active lock held by ${lockRes.existingOwner}.`,
        details: { runId, lockKey, existingOwner: lockRes.existingOwner }
      },
      options.eventSink
    );
    return {
      runId,
      jobName: options.jobName,
      checkpointId: options.checkpointId,
      status: 'DUPLICATE_IN_PROGRESS',
      startedAt,
      endedAt: new Date().toISOString(),
      durationMs: Date.now() - startedMs,
      resumedFromCheckpoint: false,
      totalItems: options.items.length,
      succeededCount: 0,
      skippedCount: 0,
      failedCount: 0,
      outcomes: []
    };
  }

  try {
    const existingCp = await options.checkpointStore.getCheckpoint(options.checkpointId);
    const resumedFromCheckpoint = Boolean(existingCp);
    const completedSet = new Set<string>(existingCp?.completedKeys || []);
    const idempotencySet = new Set<string>(existingCp?.idempotencyKeys || []);
    const failedSet = new Set<string>();
    const outcomes: ItemOutcome<TResult>[] = [];

    for (let i = 0; i < options.items.length; i++) {
      const item = options.items[i];
      const key = options.getItemKey(item);
      const idempotencyKey = options.getIdempotencyKey ? options.getIdempotencyKey(item) : `${options.checkpointId}:${key}`;

      if (completedSet.has(key) || idempotencySet.has(idempotencyKey)) {
        outcomes.push({
          key,
          idempotencyKey,
          status: 'SKIPPED_IDEMPOTENT',
          attempts: 0
        });
        continue;
      }

      try {
        const { result, attempts } = await executeWithBoundedRetry(
          (signal) => options.processItem(item, signal),
          {
            ...options.retryOptions,
            component: options.jobName,
            eventSink: options.eventSink
          }
        );

        completedSet.add(key);
        idempotencySet.add(idempotencyKey);
        outcomes.push({
          key,
          idempotencyKey,
          status: 'SUCCEEDED',
          attempts,
          result
        });
      } catch (err: any) {
        const classified = classifyAutomationError(err, err?.httpStatus);
        const attempts = Number(err?.attempts || 1);
        failedSet.add(key);

        if (options.checkpointStore.recordDeadLetter) {
          await options.checkpointStore.recordDeadLetter({
            jobName: options.jobName,
            runId,
            targetKey: key,
            failureClass: classified.failureClass,
            errorMessage: classified.message,
            retryCount: attempts,
            payload: { checkpointId: options.checkpointId, idempotencyKey }
          });
        }

        recordOperationalEvent(
          {
            category:
              classified.failureClass === 'SOURCE_UNAVAILABLE' ||
              classified.failureClass === 'TIMEOUT' ||
              classified.failureClass === 'NETWORK_ERROR'
                ? 'SOURCE_RETRIEVAL_FAILURE'
                : 'VERIFICATION_FAILURE',
            severity: 'ERROR',
            component: options.jobName,
            message: `Item ${key} failed (${classified.failureClass}): ${classified.message}`,
            details: { runId, key, failureClass: classified.failureClass, attempts }
          },
          options.eventSink
        );

        outcomes.push({
          key,
          idempotencyKey,
          status: 'FAILED_QUARANTINED',
          attempts,
          failureClass: classified.failureClass,
          errorMessage: classified.message
        });
      }

      const intermediateStatus =
        failedSet.size > 0 ? 'PARTIAL_FAILED' : i === options.items.length - 1 ? 'COMPLETED' : 'IN_PROGRESS';

      await options.checkpointStore.saveCheckpoint({
        checkpointId: options.checkpointId,
        jobName: options.jobName,
        runId,
        status: intermediateStatus,
        cursorIndex: i + 1,
        totalItems: options.items.length,
        completedKeys: Array.from(completedSet),
        failedKeys: Array.from(failedSet),
        idempotencyKeys: Array.from(idempotencySet)
      });
    }

    const succeededCount = outcomes.filter((o) => o.status === 'SUCCEEDED').length;
    const skippedCount = outcomes.filter((o) => o.status === 'SKIPPED_IDEMPOTENT').length;
    const failedCount = outcomes.filter((o) => o.status === 'FAILED_QUARANTINED').length;

    const finalStatus: CheckpointedJobResult['status'] =
      failedCount === 0 ? 'COMPLETED' : succeededCount + skippedCount > 0 ? 'PARTIAL_FAILED' : 'FAILED';

    await options.checkpointStore.saveCheckpoint({
      checkpointId: options.checkpointId,
      jobName: options.jobName,
      runId,
      status: finalStatus,
      cursorIndex: options.items.length,
      totalItems: options.items.length,
      completedKeys: Array.from(completedSet),
      failedKeys: Array.from(failedSet),
      idempotencyKeys: Array.from(idempotencySet)
    });

    const endedAt = new Date().toISOString();
    const durationMs = Date.now() - startedMs;

    recordOperationalEvent(
      {
        category: 'UPDATE_JOB_RUN',
        severity: failedCount > 0 ? 'WARN' : 'INFO',
        component: options.jobName,
        message: `Run ${runId} finished with status=${finalStatus} (succeeded=${succeededCount}, skipped=${skippedCount}, failed=${failedCount}) in ${durationMs}ms.`,
        details: { runId, finalStatus, succeededCount, skippedCount, failedCount, durationMs }
      },
      options.eventSink
    );

    return {
      runId,
      jobName: options.jobName,
      checkpointId: options.checkpointId,
      status: finalStatus,
      startedAt,
      endedAt,
      durationMs,
      resumedFromCheckpoint,
      totalItems: options.items.length,
      succeededCount,
      skippedCount,
      failedCount,
      outcomes
    };
  } finally {
    await options.lockStore.releaseLock(lockKey, runId);
  }
}
