/**
 * VISAAPPLY.ORG — PHASE 5B: AUTOMATED OFFICIAL SOURCE MONITORING ENGINE
 *
 * Safe, ethical, zero-database official HTTPS source monitor with:
 * - Strict outbound URL & IP safety validation (HTTPS-only, blocks private/local/metadata IPs)
 * - Authoritative sovereign-source enforcement (third-party discovery leads skipped for statutory auth)
 * - robots.txt parsing & polite Disallow compliance
 * - Per-host rate limiting & request intervals
 * - Manual redirect chain tracking & suspicious cross-domain redirect detection
 * - Graceful handling of timeouts, HTTP 403/404/429/5xx, TLS errors, outages & anti-bot/CAPTCHA
 * - Never bypasses CAPTCHAs, authentication, access controls, or anti-bot protections
 * - Never interprets a failed source check as proof of visa program closure
 * - Deterministic content normalization, SHA-256 content fingerprinting & HTML structure signature
 * - Duplicate-run lock prevention, idempotency keys & 03:00 AM IST missed-run catch-up calculation
 */

import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

import {
  DISALLOWED_UNOFFICIAL_DOMAINS,
  deterministicShortHash,
  validateOfficialHttpsUrl,
  type OfficialSourceRecord
} from '../../src/schemas/catalogSchemas';
import {
  PHASE5B_MONITORING_SCHEMA_VERSION,
  inferOfficialSourceType,
  type MonitoredSourceRegistryEntry,
  type MonitoringRunState,
  type RedirectHopRecord,
  type SourceCheckOutcome,
  type SourceCheckResult,
  type SourceMonitoringRunReport,
  type SourceMonitoringStatus
} from '../../src/schemas/sourceMonitoringSchemas';

export const MONITOR_USER_AGENT = 'VisaApplyOfficialSourceMonitor/2.1 (+https://www.visaapply.org/verification)';
export const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;
export const DEFAULT_MAX_REDIRECTS = 5;
export const DEFAULT_MAX_RESPONSE_BYTES = 2 * 1024 * 1024; // 2 MB cap
export const DEFAULT_PER_HOST_INTERVAL_MS = 1_500;
export const DEFAULT_LOCK_TTL_MS = 45 * 60 * 1000; // 45 minutes

export interface MonitorHttpResponse {
  status: number;
  headers: Record<string, string>;
  bodyText: string;
}

export type MonitorHttpFetcher = (
  url: string,
  options: {
    method: 'GET' | 'HEAD';
    headers: Record<string, string>;
    timeoutMs: number;
    maxBytes: number;
  }
) => Promise<MonitorHttpResponse>;

export type HostIpResolver = (hostname: string) => Promise<string[]>;

export interface MonitorSourcesOptions {
  sources: MonitoredSourceRegistryEntry[];
  now?: Date;
  runId?: string;
  triggeredBy?: SourceMonitoringRunReport['triggeredBy'];
  executionMode?: SourceMonitoringRunReport['executionMode'];
  timeoutMs?: number;
  maxRedirects?: number;
  maxResponseBytes?: number;
  perHostIntervalMs?: number;
  respectRobotsTxt?: boolean;
  fetcher?: MonitorHttpFetcher;
  resolveHostIps?: HostIpResolver;
  sleep?: (ms: number) => Promise<void>;
  /**
   * Test-only toggle for deterministic local HTTP fixture servers in unit tests.
   * Production CLI NEVER enables this flag.
   */
  allowTestLocalHttp?: boolean;
  missedRunsDetected?: number;
}

// ============================================================================
// 1. OUTBOUND ADDRESS & IP SAFETY VALIDATION
// ============================================================================

export function isBlockedIpAddress(ip: string): boolean {
  const trimmed = ip.trim().toLowerCase();
  if (!trimmed) return true;

  // Handle IPv4-mapped IPv6 addresses (e.g., ::ffff:127.0.0.1 or ::ffff:169.254.169.254)
  if (trimmed.startsWith('::ffff:')) {
    const mappedV4 = trimmed.slice('::ffff:'.length);
    if (net.isIPv4(mappedV4)) return isBlockedIpAddress(mappedV4);
  }

  if (net.isIPv4(trimmed)) {
    const parts = trimmed.split('.').map(Number);
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
    const [a, b] = parts;
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8 private
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
    if (a === 127) return true; // 127.0.0.0/8 loopback
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
    if (a === 192 && b === 168) return true; // 192.168.0.0/16 private
    if (a === 198 && (b === 18 || b === 19)) return true; // benchmark
    if (a >= 224) return true; // multicast / reserved
    return false;
  }

  if (net.isIPv6(trimmed)) {
    if (trimmed === '::' || trimmed === '::1') return true;
    if (trimmed.startsWith('fc') || trimmed.startsWith('fd')) return true; // ULA fc00::/7
    if (trimmed.startsWith('fe8') || trimmed.startsWith('fe9') || trimmed.startsWith('fea') || trimmed.startsWith('feb')) {
      return true; // link-local fe80::/10
    }
    if (trimmed.startsWith('ff')) return true; // multicast
    return false;
  }

  return true;
}

export async function validateOutboundMonitorUrl(
  rawUrl: string,
  options: { allowTestLocalHttp?: boolean; resolveHostIps?: HostIpResolver } = {}
): Promise<{ safe: boolean; normalizedUrl?: string; hostname?: string; reason?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { safe: false, reason: 'Malformed URL syntax.' };
  }

  if (parsed.username || parsed.password) {
    return { safe: false, reason: 'Embedded credentials in source URL are forbidden.' };
  }

  if (!options.allowTestLocalHttp) {
    const officialCheck = validateOfficialHttpsUrl(rawUrl);
    if (!officialCheck.valid || !officialCheck.normalizedUrl || !officialCheck.hostname) {
      return { safe: false, reason: officialCheck.reason || 'URL failed official HTTPS validation.' };
    }

    const hostname = officialCheck.hostname;
    if (net.isIP(hostname) && isBlockedIpAddress(hostname)) {
      return { safe: false, reason: `Direct private or local IP "${hostname}" is blocked.` };
    }

    if (options.resolveHostIps) {
      try {
        const ips = await options.resolveHostIps(hostname);
        if (ips.length === 0) {
          return { safe: false, reason: `DNS resolution returned no addresses for "${hostname}".` };
        }
        for (const ip of ips) {
          if (isBlockedIpAddress(ip)) {
            return { safe: false, reason: `Hostname "${hostname}" resolved to blocked address "${ip}".` };
          }
        }
      } catch (err) {
        return {
          safe: false,
          reason: `DNS lookup failed for "${hostname}": ${err instanceof Error ? err.message : String(err)}`
        };
      }
    }

    return { safe: true, normalizedUrl: officialCheck.normalizedUrl, hostname };
  }

  // Test-only fixture mode (still restricts protocol to http/https)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, reason: `Unsupported protocol "${parsed.protocol}".` };
  }
  return { safe: true, normalizedUrl: parsed.toString(), hostname: parsed.hostname.toLowerCase() };
}

/**
 * Checks whether a redirect target remains within the same authoritative domain family
 * (e.g., `uscis.gov` -> `www.uscis.gov` or `gov.uk` -> `visas-immigration.service.gov.uk`)
 * vs redirecting unexpectedly to a third-party or disallowed commercial domain.
 */
export function evaluateRedirectDomainRelation(originalUrl: string, targetUrl: string): {
  sameAuthorityDomain: boolean;
  officialDomainValid: boolean;
} {
  try {
    const orig = new URL(originalUrl);
    const dest = new URL(targetUrl);
    const origHost = orig.hostname.toLowerCase();
    const destHost = dest.hostname.toLowerCase();

    const isUnofficial = DISALLOWED_UNOFFICIAL_DOMAINS.some(
      (d) => destHost === d || destHost.endsWith(`.${d}`)
    );
    const officialDomainValid = dest.protocol === 'https:' && !isUnofficial;

    if (origHost === destHost) {
      return { sameAuthorityDomain: true, officialDomainValid };
    }

    const getRegistrableRoot = (host: string): string => {
      const labels = host.split('.');
      if (labels.length <= 2) return host;
      const lastTwo = labels.slice(-2).join('.');
      // Recognize common sovereign second-level domains (gov.uk, gov.au, gov.in, gov.sg, go.jp, go.th, gouv.fr, gob.es, gc.ca, govt.nz)
      if (/^(gov|gouv|gob|govt|go|gc)\.[a-z]{2}$/.test(lastTwo)) {
        return lastTwo;
      }
      if (labels[labels.length - 1] === 'gov') {
        return labels.slice(-2).join('.');
      }
      return lastTwo;
    };

    const origRoot = getRegistrableRoot(origHost);
    const destRoot = getRegistrableRoot(destHost);
    const sameAuthorityDomain =
      origHost.endsWith(`.${destHost}`) ||
      destHost.endsWith(`.${origHost}`) ||
      origRoot === destRoot;

    return { sameAuthorityDomain, officialDomainValid };
  } catch {
    return { sameAuthorityDomain: false, officialDomainValid: false };
  }
}

// ============================================================================
// 2. ROBOTS.TXT PARSING & COMPLIANCE
// ============================================================================

export interface ParsedRobotsPolicy {
  disallowedPaths: string[];
  allowedPaths: string[];
  crawlDelayMs: number | null;
}

export function parseRobotsTxtForAgent(robotsContent: string, agentToken = 'visaapplyofficialsourcemonitor'): ParsedRobotsPolicy {
  const lines = robotsContent.split(/\r?\n/);
  const specificRules = { allow: [] as string[], disallow: [] as string[], crawlDelayMs: null as number | null };
  const wildcardRules = { allow: [] as string[], disallow: [] as string[], crawlDelayMs: null as number | null };

  let currentTargets: Array<'specific' | 'wildcard'> = [];
  let sawRuleInGroup = false;

  for (const rawLine of lines) {
    const clean = rawLine.replace(/#.*$/, '').trim();
    if (!clean) {
      currentTargets = [];
      sawRuleInGroup = false;
      continue;
    }

    const colonIdx = clean.indexOf(':');
    if (colonIdx === -1) continue;
    const directive = clean.slice(0, colonIdx).trim().toLowerCase();
    const value = clean.slice(colonIdx + 1).trim();

    if (directive === 'user-agent') {
      if (sawRuleInGroup) {
        currentTargets = [];
        sawRuleInGroup = false;
      }
      const uaLower = value.toLowerCase();
      if (uaLower === '*') {
        if (!currentTargets.includes('wildcard')) currentTargets.push('wildcard');
      } else if (agentToken.toLowerCase().includes(uaLower) || uaLower.includes(agentToken.toLowerCase())) {
        if (!currentTargets.includes('specific')) currentTargets.push('specific');
      }
      continue;
    }

    if (currentTargets.length === 0) continue;
    sawRuleInGroup = true;

    for (const target of currentTargets) {
      const bucket = target === 'specific' ? specificRules : wildcardRules;
      if (directive === 'disallow' && value) {
        bucket.disallow.push(value);
      } else if (directive === 'allow' && value) {
        bucket.allow.push(value);
      } else if (directive === 'crawl-delay') {
        const secs = Number(value);
        if (Number.isFinite(secs) && secs >= 0 && secs <= 120) {
          bucket.crawlDelayMs = Math.round(secs * 1000);
        }
      }
    }
  }

  const hasSpecific =
    specificRules.allow.length > 0 || specificRules.disallow.length > 0 || specificRules.crawlDelayMs !== null;
  const chosen = hasSpecific ? specificRules : wildcardRules;

  return {
    disallowedPaths: chosen.disallow,
    allowedPaths: chosen.allow,
    crawlDelayMs: chosen.crawlDelayMs
  };
}

export function isPathAllowedByRobots(pathnameWithQuery: string, policy: ParsedRobotsPolicy): boolean {
  let longestDisallow = -1;
  let longestAllow = -1;

  for (const rule of policy.disallowedPaths) {
    if (rule === '/' || pathnameWithQuery.startsWith(rule)) {
      longestDisallow = Math.max(longestDisallow, rule.length);
    }
  }
  for (const rule of policy.allowedPaths) {
    if (pathnameWithQuery.startsWith(rule)) {
      longestAllow = Math.max(longestAllow, rule.length);
    }
  }

  if (longestDisallow === -1) return true;
  return longestAllow >= longestDisallow;
}

// ============================================================================
// 3. CONTENT NORMALIZATION, FINGERPRINTING, STRUCTURE & ANTI-BOT DETECTION
// ============================================================================

export function normalizeOfficialContentForFingerprint(rawBody: string, contentType: string | null): {
  normalizedText: string;
  contentFingerprint: string;
  structureSignature: string;
  excerpt: string | null;
} {
  const isHtml = !contentType || contentType.toLowerCase().includes('html') || /<html|<body|<main/i.test(rawBody);

  let structureTokens = '';
  let text = rawBody;

  if (isHtml) {
    // Capture deterministic structural skeleton (heading + semantic landmark tags) to detect layout/structure shifts
    const landmarkMatches = rawBody.match(/<(?:main|article|section|h1|h2|h3|table|form)\b/gi) || [];
    structureTokens = landmarkMatches.map((m) => m.toLowerCase().replace(/^</, '')).slice(0, 200).join('|');

    // Strip non-content volatile noise (scripts, styles, comments, CSRF/nonce attributes)
    text = rawBody
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ');
  } else {
    structureTokens = contentType?.split(';')[0].trim().toLowerCase() || 'text/plain';
  }

  // Collapse whitespace deterministically
  const normalizedText = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();

  const contentFingerprint = crypto.createHash('sha256').update(normalizedText, 'utf8').digest('hex');
  const structureSignature = crypto.createHash('sha256').update(structureTokens, 'utf8').digest('hex').slice(0, 16);
  const excerpt = normalizedText ? normalizedText.slice(0, 320) : null;

  return { normalizedText, contentFingerprint, structureSignature, excerpt };
}

export function detectAntiBotOrCaptchaChallenge(status: number, headers: Record<string, string>, bodyText: string): boolean {
  const lowerBody = bodyText.slice(0, 12_000).toLowerCase();
  const cfMitigated = (headers['cf-mitigated'] || '').toLowerCase();
  if (cfMitigated.includes('challenge')) return true;

  const challengeSignals = [
    'cf-challenge',
    'checking your browser before accessing',
    'just a moment...',
    'attention required! | cloudflare',
    'g-recaptcha',
    'hcaptcha',
    'please verify you are a human',
    'access denied - sucuri',
    'pardon our interruption'
  ];

  if (status === 403 || status === 503 || status === 429 || status === 200) {
    return challengeSignals.some((sig) => lowerBody.includes(sig));
  }
  return false;
}

// ============================================================================
// 4. DEFAULT LIVE NODE FETCH ADAPTER (WITH TIMEOUT & SIZE CAP)
// ============================================================================

export async function defaultLiveHttpFetcher(
  url: string,
  options: {
    method: 'GET' | 'HEAD';
    headers: Record<string, string>;
    timeoutMs: number;
    maxBytes: number;
  }
): Promise<MonitorHttpResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('REQUEST_TIMEOUT')), options.timeoutMs);

  try {
    const res = await fetch(url, {
      method: options.method,
      headers: options.headers,
      redirect: 'manual',
      signal: controller.signal
    });

    const headers: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      headers[key.toLowerCase()] = val;
    });

    let bodyText = '';
    if (options.method !== 'HEAD' && res.body) {
      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.byteLength;
          if (totalBytes > options.maxBytes) {
            const allowedSlice = value.slice(0, Math.max(0, options.maxBytes - (totalBytes - value.byteLength)));
            if (allowedSlice.byteLength > 0) chunks.push(allowedSlice);
            await reader.cancel();
            break;
          }
          chunks.push(value);
        }
      }
      bodyText = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf8');
    }

    return { status: res.status, headers, bodyText };
  } finally {
    clearTimeout(timer);
  }
}

export async function defaultResolveHostIps(hostname: string): Promise<string[]> {
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  return records.map((r) => r.address);
}

// ============================================================================
// 5. RUN LOCK, DUPLICATE-RUN PREVENTION & 03:00 AM IST MISSED-RUN CATCH-UP
// ============================================================================

/**
 * Computes the most recent scheduled 03:00 AM IST (21:30 UTC) slot at or before `now`.
 */
export function getLatestScheduledSlotUtc(now: Date): string {
  const slot = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 21, 30, 0, 0));
  if (slot.getTime() > now.getTime()) {
    slot.setUTCDate(slot.getUTCDate() - 1);
  }
  return slot.toISOString();
}

/**
 * Detects how many daily 03:00 AM IST (21:30 UTC) scheduled slots were missed
 * since `lastScheduledSlotExecutedUtc`.
 */
export function detectMissedScheduledRuns(
  lastScheduledSlotExecutedUtc: string | null,
  now: Date
): { missedRunsCount: number; latestScheduledSlotUtc: string; catchUpRecommended: boolean } {
  const latestSlotIso = getLatestScheduledSlotUtc(now);
  if (!lastScheduledSlotExecutedUtc) {
    return { missedRunsCount: 0, latestScheduledSlotUtc: latestSlotIso, catchUpRecommended: false };
  }

  const lastMs = new Date(lastScheduledSlotExecutedUtc).getTime();
  const latestMs = new Date(latestSlotIso).getTime();
  if (Number.isNaN(lastMs) || latestMs <= lastMs) {
    return { missedRunsCount: 0, latestScheduledSlotUtc: latestSlotIso, catchUpRecommended: false };
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const slotsElapsed = Math.floor((latestMs - lastMs) / dayMs);
  const missedRunsCount = Math.max(0, slotsElapsed - 1);

  return {
    missedRunsCount,
    latestScheduledSlotUtc: latestSlotIso,
    catchUpRecommended: missedRunsCount > 0
  };
}

export function createDefaultRunState(): MonitoringRunState {
  return {
    schemaVersion: PHASE5B_MONITORING_SCHEMA_VERSION,
    scheduleCronUtc: '30 21 * * *',
    scheduleLabel: '03:00 AM IST Daily (21:30 UTC)',
    activeRunLock: {
      locked: false,
      runId: null,
      acquiredAt: null,
      expiresAt: null
    },
    lastRunId: null,
    lastRunStartedAt: null,
    lastRunCompletedAt: null,
    lastSuccessfulMonitoringRunAt: null,
    lastScheduledSlotExecutedUtc: null,
    recentIdempotencyKeys: []
  };
}

export function loadRunState(statePath: string): MonitoringRunState {
  if (!fs.existsSync(statePath)) return createDefaultRunState();
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8')) as MonitoringRunState;
  } catch {
    return createDefaultRunState();
  }
}

export function saveRunStateAtomic(statePath: string, state: MonitoringRunState): void {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const tmpPath = `${statePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  fs.renameSync(tmpPath, statePath);
}

/**
 * Prevents duplicate overlapping runs AND prevents redundant execution of the same
 * idempotency key (e.g., same scheduled UTC slot unless forced).
 */
export function acquireMonitoringRunLock(
  statePath: string,
  params: { runId: string; idempotencyKey: string; now: Date; lockTtlMs?: number; allowDuplicateSlot?: boolean }
): { acquired: true; state: MonitoringRunState } | { acquired: false; reason: string; code: 'RUN_ALREADY_ACTIVE' | 'IDEMPOTENT_SLOT_ALREADY_EXECUTED' } {
  const state = loadRunState(statePath);
  const nowMs = params.now.getTime();

  // Check active non-expired lock
  if (state.activeRunLock.locked && state.activeRunLock.expiresAt) {
    const expMs = new Date(state.activeRunLock.expiresAt).getTime();
    if (!Number.isNaN(expMs) && expMs > nowMs) {
      return {
        acquired: false,
        code: 'RUN_ALREADY_ACTIVE',
        reason: `Monitoring run "${state.activeRunLock.runId}" is already active until ${state.activeRunLock.expiresAt}.`
      };
    }
  }

  // Check idempotency key
  if (!params.allowDuplicateSlot && state.recentIdempotencyKeys.includes(params.idempotencyKey)) {
    return {
      acquired: false,
      code: 'IDEMPOTENT_SLOT_ALREADY_EXECUTED',
      reason: `Idempotency key "${params.idempotencyKey}" already completed; skipping duplicate run.`
    };
  }

  const ttlMs = params.lockTtlMs ?? DEFAULT_LOCK_TTL_MS;
  state.activeRunLock = {
    locked: true,
    runId: params.runId,
    acquiredAt: params.now.toISOString(),
    expiresAt: new Date(nowMs + ttlMs).toISOString()
  };
  state.lastRunId = params.runId;
  state.lastRunStartedAt = params.now.toISOString();

  saveRunStateAtomic(statePath, state);
  return { acquired: true, state };
}

export function releaseMonitoringRunLock(
  statePath: string,
  params: {
    runId: string;
    idempotencyKey: string;
    completedAt: Date;
    succeeded: boolean;
    scheduledSlotUtc: string;
  }
): MonitoringRunState {
  const state = loadRunState(statePath);
  state.activeRunLock = {
    locked: false,
    runId: null,
    acquiredAt: null,
    expiresAt: null
  };
  state.lastRunCompletedAt = params.completedAt.toISOString();
  if (params.succeeded) {
    state.lastSuccessfulMonitoringRunAt = params.completedAt.toISOString();
    state.lastScheduledSlotExecutedUtc = params.scheduledSlotUtc;
    if (!state.recentIdempotencyKeys.includes(params.idempotencyKey)) {
      state.recentIdempotencyKeys = [...state.recentIdempotencyKeys.slice(-29), params.idempotencyKey];
    }
  }
  saveRunStateAtomic(statePath, state);
  return state;
}

// ============================================================================
// 6. REGISTRY LOADING HELPER (FROM CANONICAL `data/official-sources/*.json`)
// ============================================================================

export function buildMonitoredRegistryFromCanonical(
  dataDir: string,
  existingStatePath?: string
): MonitoredSourceRegistryEntry[] {
  const existingMap = new Map<string, MonitoredSourceRegistryEntry>();
  if (existingStatePath && fs.existsSync(existingStatePath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(existingStatePath, 'utf8')) as MonitoredSourceRegistryEntry[];
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item.sourceId === 'string') existingMap.set(item.sourceId, item);
        }
      }
    } catch {
      // Ignore corrupt cache and rebuild from canonical sources
    }
  }

  const sourcesDir = path.join(dataDir, 'official-sources');
  if (!fs.existsSync(sourcesDir)) return [];

  const files = fs
    .readdirSync(sourcesDir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const entries: MonitoredSourceRegistryEntry[] = [];
  for (const f of files) {
    const list = JSON.parse(fs.readFileSync(path.join(sourcesDir, f), 'utf8')) as OfficialSourceRecord[];
    for (const src of list) {
      const prev = existingMap.get(src.sourceId);
      entries.push({
        schemaVersion: PHASE5B_MONITORING_SCHEMA_VERSION,
        sourceId: src.sourceId,
        countryIso: src.countryIso,
        officialGovernmentAuthority: src.issuingAuthority,
        sourceUrl: src.officialHttpsUrl,
        sourceCategory: src.sourceCategory,
        language: src.sourceLanguage,
        sourceType: prev?.sourceType ?? inferOfficialSourceType(src.sourceCategory, src.officialHttpsUrl),
        authorityTier: 'OFFICIAL_GOVERNMENT',
        lastCheckedTimestamp: prev?.lastCheckedTimestamp ?? null,
        lastSuccessfulVerificationTimestamp: prev?.lastSuccessfulVerificationTimestamp ?? null,
        httpStatus: prev?.httpStatus ?? null,
        contentFingerprint: prev?.contentFingerprint ?? null,
        structureSignature: prev?.structureSignature ?? null,
        currentSourceStatus: prev?.currentSourceStatus ?? 'AWAITING_INITIAL_CHECK',
        consecutiveFailures: prev?.consecutiveFailures ?? 0,
        redirectTargetUrl: prev?.redirectTargetUrl ?? null,
        verificationNotes: prev?.verificationNotes ?? (src.evidenceNotes || 'Registered in canonical official-sources.')
      });
    }
  }

  return entries.sort((a, b) => a.sourceId.localeCompare(b.sourceId));
}

// ============================================================================
// 7. CORE AUTOMATED SOURCE MONITOR PIPELINE
// ============================================================================

function classifyFetchError(err: unknown): { outcome: SourceCheckOutcome; note: string } {
  const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  const causeCode =
    err && typeof err === 'object' && 'cause' in err && (err as { cause?: { code?: string } }).cause?.code
      ? String((err as { cause?: { code?: string } }).cause?.code)
      : '';
  const combined = `${msg} ${causeCode}`.toLowerCase();

  if (combined.includes('timeout') || combined.includes('abort')) {
    return { outcome: 'TIMEOUT', note: `Request timed out without completing (${msg}).` };
  }
  if (
    combined.includes('cert') ||
    combined.includes('tls') ||
    combined.includes('ssl') ||
    combined.includes('self_signed') ||
    combined.includes('unable_to_verify_leaf_signature')
  ) {
    return { outcome: 'TLS_CERTIFICATE_ERROR', note: `TLS/SSL certificate validation error (${msg}).` };
  }
  return { outcome: 'NETWORK_UNAVAILABLE', note: `Temporary network/source outage (${msg}).` };
}

function outcomeToSourceStatus(outcome: SourceCheckOutcome): SourceMonitoringStatus {
  switch (outcome) {
    case 'REACHABLE_UNCHANGED':
      return 'VERIFIED_UNCHANGED';
    case 'REACHABLE_CHANGED':
      return 'SOURCE_CHANGED';
    case 'STRUCTURE_CHANGED':
      return 'STRUCTURE_CHANGED';
    case 'REDIRECTED_OFFICIAL':
      return 'REDIRECTED_OFFICIAL';
    case 'REDIRECTED_SUSPICIOUS':
      return 'REDIRECTED_SUSPICIOUS';
    case 'ROBOTS_DISALLOWED':
      return 'ROBOTS_RESTRICTED';
    case 'HTTP_429_RATE_LIMITED':
      return 'RATE_LIMITED';
    case 'ANTI_BOT_OR_CAPTCHA_DETECTED':
      return 'ANTI_BOT_PROTECTED';
    case 'TLS_CERTIFICATE_ERROR':
      return 'TLS_CERTIFICATE_ERROR';
    default:
      return 'SOURCE_UNAVAILABLE';
  }
}

export async function runOfficialSourceMonitoring(options: MonitorSourcesOptions): Promise<{
  report: SourceMonitoringRunReport;
  updatedRegistry: MonitoredSourceRegistryEntry[];
}> {
  const now = options.now ?? new Date();
  const scheduledSlotUtc = getLatestScheduledSlotUtc(now);
  const runId = options.runId ?? `MON-${now.toISOString().slice(0, 10)}-${deterministicShortHash([now.toISOString(), String(options.sources.length)])}`;
  const idempotencyKey = `slot:${scheduledSlotUtc}:sources:${options.sources.length}`;

  const timeoutMs = options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const maxResponseBytes = options.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
  const perHostIntervalMs = options.perHostIntervalMs ?? DEFAULT_PER_HOST_INTERVAL_MS;
  const respectRobotsTxt = options.respectRobotsTxt ?? true;
  const fetcher = options.fetcher ?? defaultLiveHttpFetcher;
  const resolveHostIps = options.allowTestLocalHttp ? undefined : (options.resolveHostIps ?? defaultResolveHostIps);
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));

  const robotsCache = new Map<string, ParsedRobotsPolicy>();
  const lastHostRequestMs = new Map<string, number>();

  const results: SourceCheckResult[] = [];
  const updatedRegistry: MonitoredSourceRegistryEntry[] = [];

  const totals: SourceMonitoringRunReport['totals'] = {
    sourcesConsidered: options.sources.length,
    sourcesChecked: 0,
    reachableUnchanged: 0,
    changedDetected: 0,
    unavailableOrError: 0,
    robotsRestricted: 0,
    rateLimited: 0,
    antiBotProtected: 0,
    suspiciousRedirects: 0,
    discoveryLeadsSkipped: 0
  };

  const enforceHostPoliteness = async (host: string, robotsCrawlDelayMs: number | null) => {
    const requiredDelay = Math.max(perHostIntervalMs, robotsCrawlDelayMs ?? 0);
    const prevMs = lastHostRequestMs.get(host);
    if (prevMs !== undefined && requiredDelay > 0) {
      const elapsed = Date.now() - prevMs;
      if (elapsed < requiredDelay) {
        await sleep(requiredDelay - elapsed);
      }
    }
    lastHostRequestMs.set(host, Date.now());
  };

  const getRobotsPolicyForOrigin = async (origin: string, host: string): Promise<ParsedRobotsPolicy> => {
    const cached = robotsCache.get(origin);
    if (cached) return cached;

    const emptyPolicy: ParsedRobotsPolicy = { disallowedPaths: [], allowedPaths: [], crawlDelayMs: null };
    if (!respectRobotsTxt) {
      robotsCache.set(origin, emptyPolicy);
      return emptyPolicy;
    }

    try {
      const robotsUrl = `${origin}/robots.txt`;
      const safeRobots = await validateOutboundMonitorUrl(robotsUrl, {
        allowTestLocalHttp: options.allowTestLocalHttp,
        resolveHostIps
      });
      if (!safeRobots.safe) {
        robotsCache.set(origin, emptyPolicy);
        return emptyPolicy;
      }
      await enforceHostPoliteness(host, null);
      const res = await fetcher(robotsUrl, {
        method: 'GET',
        headers: { 'user-agent': MONITOR_USER_AGENT, accept: 'text/plain,*/*;q=0.5' },
        timeoutMs: Math.min(timeoutMs, 8_000),
        maxBytes: 128 * 1024
      });
      const parsed = res.status >= 200 && res.status < 300 ? parseRobotsTxtForAgent(res.bodyText) : emptyPolicy;
      robotsCache.set(origin, parsed);
      return parsed;
    } catch {
      robotsCache.set(origin, emptyPolicy);
      return emptyPolicy;
    }
  };

  for (const src of options.sources) {
    const startedAtMs = Date.now();
    const checkedAt = now.toISOString();
    const checkId = `CHK-${deterministicShortHash([runId, src.sourceId, checkedAt])}`;

    // Third-party discovery leads are NEVER treated as authoritative statutory sources
    if (src.authorityTier === 'DISCOVERY_LEAD_ONLY') {
      totals.discoveryLeadsSkipped++;
      results.push({
        checkId,
        runId,
        sourceId: src.sourceId,
        countryIso: src.countryIso,
        sourceUrl: src.sourceUrl,
        checkedAt,
        durationMs: Date.now() - startedAtMs,
        outcome: 'DISCOVERY_LEAD_SKIPPED',
        pipelineStatus: 'SOURCE_UNAVAILABLE',
        httpStatus: null,
        finalUrl: src.sourceUrl,
        redirectChain: [],
        previousFingerprint: src.contentFingerprint,
        newFingerprint: null,
        fingerprintChanged: false,
        previousStructureSignature: src.structureSignature,
        newStructureSignature: null,
        structureChanged: false,
        robotsAllowed: true,
        antiBotDetected: false,
        responseContentType: null,
        extractedExcerpt: null,
        impliesProgramClosure: false,
        notes: 'Third-party discovery lead skipped for authoritative verification; cannot authorize statutory claims.'
      });
      updatedRegistry.push({ ...src });
      continue;
    }

    totals.sourcesChecked++;

    // Pre-flight outbound URL & IP safety validation
    const initialValidation = await validateOutboundMonitorUrl(src.sourceUrl, {
      allowTestLocalHttp: options.allowTestLocalHttp,
      resolveHostIps
    });

    if (!initialValidation.safe || !initialValidation.normalizedUrl || !initialValidation.hostname) {
      totals.unavailableOrError++;
      results.push({
        checkId,
        runId,
        sourceId: src.sourceId,
        countryIso: src.countryIso,
        sourceUrl: src.sourceUrl,
        checkedAt,
        durationMs: Date.now() - startedAtMs,
        outcome: 'INVALID_OR_UNSAFE_URL',
        pipelineStatus: 'SOURCE_UNAVAILABLE',
        httpStatus: null,
        finalUrl: src.sourceUrl,
        redirectChain: [],
        previousFingerprint: src.contentFingerprint,
        newFingerprint: null,
        fingerprintChanged: false,
        previousStructureSignature: src.structureSignature,
        newStructureSignature: null,
        structureChanged: false,
        robotsAllowed: false,
        antiBotDetected: false,
        responseContentType: null,
        extractedExcerpt: null,
        impliesProgramClosure: false,
        notes: `Outbound check blocked: ${initialValidation.reason}`
      });
      updatedRegistry.push({
        ...src,
        lastCheckedTimestamp: checkedAt,
        currentSourceStatus: 'SOURCE_UNAVAILABLE',
        consecutiveFailures: src.consecutiveFailures + 1,
        verificationNotes: `Outbound URL rejected: ${initialValidation.reason}`
      });
      continue;
    }

    let currentUrl = initialValidation.normalizedUrl;
    const redirectChain: RedirectHopRecord[] = [];
    let finalOutcome: SourceCheckOutcome | null = null;
    let finalHttpStatus: number | null = null;
    let finalResponse: MonitorHttpResponse | null = null;
    let robotsAllowed = true;
    let antiBotDetected = false;
    let note = '';

    for (let hop = 0; hop <= maxRedirects; hop++) {
      const parsedCur = new URL(currentUrl);
      const robotsPolicy = await getRobotsPolicyForOrigin(parsedCur.origin, parsedCur.hostname.toLowerCase());
      const pathAndQuery = `${parsedCur.pathname}${parsedCur.search}`;

      if (!isPathAllowedByRobots(pathAndQuery, robotsPolicy)) {
        robotsAllowed = false;
        finalOutcome = 'ROBOTS_DISALLOWED';
        note = `Path "${pathAndQuery}" disallowed by ${parsedCur.origin}/robots.txt. Respected without bypassing.`;
        break;
      }

      await enforceHostPoliteness(parsedCur.hostname.toLowerCase(), robotsPolicy.crawlDelayMs);

      let resp: MonitorHttpResponse;
      try {
        resp = await fetcher(currentUrl, {
          method: 'GET',
          headers: {
            'user-agent': MONITOR_USER_AGENT,
            accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,text/plain;q=0.8,*/*;q=0.5'
          },
          timeoutMs,
          maxBytes: maxResponseBytes
        });
      } catch (err) {
        const classified = classifyFetchError(err);
        finalOutcome = classified.outcome;
        note = classified.note;
        break;
      }

      finalHttpStatus = resp.status;
      finalResponse = resp;

      // Handle redirects explicitly (manual redirect chain inspection)
      if (resp.status >= 300 && resp.status < 400 && resp.headers.location) {
        let nextUrl: string;
        try {
          nextUrl = new URL(resp.headers.location, currentUrl).toString();
        } catch {
          finalOutcome = 'REDIRECTED_SUSPICIOUS';
          note = `Malformed redirect Location header "${resp.headers.location}".`;
          break;
        }

        const rel = evaluateRedirectDomainRelation(src.sourceUrl, nextUrl);
        redirectChain.push({
          fromUrl: currentUrl,
          toUrl: nextUrl,
          statusCode: resp.status,
          sameAuthorityDomain: rel.sameAuthorityDomain,
          officialDomainValid: options.allowTestLocalHttp ? true : rel.officialDomainValid
        });

        // Re-validate redirect target against outbound SSRF / official domain rules
        const nextSafe = await validateOutboundMonitorUrl(nextUrl, {
          allowTestLocalHttp: options.allowTestLocalHttp,
          resolveHostIps
        });
        if (!nextSafe.safe) {
          finalOutcome = 'REDIRECTED_SUSPICIOUS';
          note = `Redirect target "${nextUrl}" failed safety/official-domain validation: ${nextSafe.reason}`;
          currentUrl = nextUrl;
          break;
        }

        if (!rel.sameAuthorityDomain || (!options.allowTestLocalHttp && !rel.officialDomainValid)) {
          finalOutcome = 'REDIRECTED_SUSPICIOUS';
          note = `Unexpected cross-domain redirect from "${src.sourceUrl}" to "${nextUrl}". Flagged for review & record-level quarantine.`;
          currentUrl = nextUrl;
          break;
        }

        if (hop === maxRedirects) {
          finalOutcome = 'REDIRECTED_SUSPICIOUS';
          note = `Exceeded maximum redirect hops (${maxRedirects}).`;
          break;
        }

        currentUrl = nextUrl;
        continue;
      }

      // Check for CAPTCHA / anti-bot protection without bypassing
      if (detectAntiBotOrCaptchaChallenge(resp.status, resp.headers, resp.bodyText)) {
        antiBotDetected = true;
        finalOutcome = 'ANTI_BOT_OR_CAPTCHA_DETECTED';
        note = `Anti-bot or CAPTCHA challenge detected (HTTP ${resp.status}). Respected without bypassing; requires manual verification.`;
        break;
      }

      // Classify non-2xx HTTP status codes
      if (resp.status === 403) {
        finalOutcome = 'HTTP_403_FORBIDDEN';
        note = 'Official source returned HTTP 403 Forbidden. Access control respected; does NOT indicate program closure.';
        break;
      }
      if (resp.status === 404 || resp.status === 410) {
        finalOutcome = 'HTTP_404_NOT_FOUND';
        note = `Official source returned HTTP ${resp.status}. Link may have moved; requires human verification (never assumed closed).`;
        break;
      }
      if (resp.status === 429) {
        finalOutcome = 'HTTP_429_RATE_LIMITED';
        note = `Official source returned HTTP 429 Too Many Requests${resp.headers['retry-after'] ? ` (Retry-After: ${resp.headers['retry-after']})` : ''}. Backed off safely.`;
        break;
      }
      if (resp.status >= 500) {
        finalOutcome = 'HTTP_5XX_SERVER_ERROR';
        note = `Temporary government portal error (HTTP ${resp.status}). Outage never implies program closure.`;
        break;
      }
      if (resp.status < 200 || resp.status >= 300) {
        finalOutcome = 'NETWORK_UNAVAILABLE';
        note = `Unexpected HTTP status ${resp.status}.`;
        break;
      }

      // 2xx Success!
      break;
    }

    let newFingerprint: string | null = null;
    let newStructureSignature: string | null = null;
    let fingerprintChanged = false;
    let structureChanged = false;
    let extractedExcerpt: string | null = null;
    const responseContentType = finalResponse?.headers['content-type'] ?? null;

    if (!finalOutcome && finalResponse && finalHttpStatus !== null && finalHttpStatus >= 200 && finalHttpStatus < 300) {
      const normalized = normalizeOfficialContentForFingerprint(finalResponse.bodyText, responseContentType);
      newFingerprint = normalized.contentFingerprint;
      newStructureSignature = normalized.structureSignature;
      extractedExcerpt = normalized.excerpt;

      fingerprintChanged = Boolean(src.contentFingerprint && src.contentFingerprint !== newFingerprint);
      structureChanged = Boolean(src.structureSignature && src.structureSignature !== newStructureSignature);

      if (fingerprintChanged && structureChanged) {
        finalOutcome = 'STRUCTURE_CHANGED';
        note = 'Official source content fingerprint AND HTML page structure changed; queued for evidence capture & human review.';
      } else if (fingerprintChanged) {
        finalOutcome = 'REACHABLE_CHANGED';
        note = 'Official source content fingerprint changed; queued for evidence capture & human review.';
      } else if (redirectChain.length > 0) {
        finalOutcome = 'REDIRECTED_OFFICIAL';
        note = `Official source redirected cleanly within authority domain (${redirectChain.length} hop(s)) with unchanged content.`;
      } else {
        finalOutcome = 'REACHABLE_UNCHANGED';
        note = src.contentFingerprint
          ? 'Official source reachable with matching SHA-256 content fingerprint.'
          : 'Initial baseline content fingerprint captured from official HTTPS source.';
      }
    }

    const resolvedOutcome: SourceCheckOutcome = finalOutcome ?? 'NETWORK_UNAVAILABLE';

    // Update totals
    if (resolvedOutcome === 'REACHABLE_UNCHANGED' || resolvedOutcome === 'REDIRECTED_OFFICIAL') {
      totals.reachableUnchanged++;
    } else if (resolvedOutcome === 'REACHABLE_CHANGED' || resolvedOutcome === 'STRUCTURE_CHANGED') {
      totals.changedDetected++;
    } else if (resolvedOutcome === 'ROBOTS_DISALLOWED') {
      totals.robotsRestricted++;
    } else if (resolvedOutcome === 'HTTP_429_RATE_LIMITED') {
      totals.rateLimited++;
    } else if (resolvedOutcome === 'ANTI_BOT_OR_CAPTCHA_DETECTED') {
      totals.antiBotProtected++;
    } else if (resolvedOutcome === 'REDIRECTED_SUSPICIOUS') {
      totals.suspiciousRedirects++;
    } else {
      totals.unavailableOrError++;
    }

    const pipelineStatus: SourceCheckResult['pipelineStatus'] =
      resolvedOutcome === 'REACHABLE_CHANGED' || resolvedOutcome === 'STRUCTURE_CHANGED'
        ? 'SOURCE_CHANGED'
        : resolvedOutcome === 'REACHABLE_UNCHANGED' || resolvedOutcome === 'REDIRECTED_OFFICIAL'
          ? 'SOURCE_VERIFIED_UNCHANGED'
          : 'SOURCE_UNAVAILABLE';

    const wasSuccessfulFetch =
      resolvedOutcome === 'REACHABLE_UNCHANGED' ||
      resolvedOutcome === 'REACHABLE_CHANGED' ||
      resolvedOutcome === 'STRUCTURE_CHANGED' ||
      resolvedOutcome === 'REDIRECTED_OFFICIAL';

    results.push({
      checkId,
      runId,
      sourceId: src.sourceId,
      countryIso: src.countryIso,
      sourceUrl: src.sourceUrl,
      checkedAt,
      durationMs: Date.now() - startedAtMs,
      outcome: resolvedOutcome,
      pipelineStatus,
      httpStatus: finalHttpStatus,
      finalUrl: currentUrl,
      redirectChain,
      previousFingerprint: src.contentFingerprint,
      newFingerprint,
      fingerprintChanged,
      previousStructureSignature: src.structureSignature,
      newStructureSignature,
      structureChanged,
      robotsAllowed,
      antiBotDetected,
      responseContentType,
      extractedExcerpt,
      impliesProgramClosure: false,
      notes: note
    });

    updatedRegistry.push({
      ...src,
      lastCheckedTimestamp: checkedAt,
      lastSuccessfulVerificationTimestamp: wasSuccessfulFetch ? checkedAt : src.lastSuccessfulVerificationTimestamp,
      httpStatus: finalHttpStatus,
      contentFingerprint: newFingerprint ?? src.contentFingerprint,
      structureSignature: newStructureSignature ?? src.structureSignature,
      currentSourceStatus: outcomeToSourceStatus(resolvedOutcome),
      consecutiveFailures: wasSuccessfulFetch ? 0 : src.consecutiveFailures + 1,
      redirectTargetUrl: redirectChain.length > 0 ? currentUrl : null,
      verificationNotes: note
    });
  }

  const report: SourceMonitoringRunReport = {
    schemaVersion: PHASE5B_MONITORING_SCHEMA_VERSION,
    runId,
    idempotencyKey,
    startedAt: now.toISOString(),
    completedAt: new Date().toISOString(),
    executionMode: options.executionMode ?? (options.fetcher ? 'MOCK_INJECTED' : 'LIVE_HTTPS'),
    triggeredBy: options.triggeredBy ?? 'MANUAL_CLI',
    scheduledSlotUtc,
    missedRunsDetected: options.missedRunsDetected ?? 0,
    totals,
    results
  };

  return { report, updatedRegistry };
}
