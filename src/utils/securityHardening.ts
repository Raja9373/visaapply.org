import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { recordOperationalEvent, redactSensitiveData } from './operationalObservability.js';

// ============================================================================
// 1. PATH TRAVERSAL PROTECTION (STRICT SLUG ALLOWLIST + CANONICAL CONTAINMENT)
// ============================================================================

const SAFE_SLUG_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9_-]{0,158}[a-zA-Z0-9])?$|^[a-zA-Z0-9]$/;
const ENCODED_TRAVERSAL_PATTERN = /(?:%2e|%2f|%5c|%00|\0|\.\.|\/|\\)/i;

export interface SafeSlugValidationResult {
  valid: boolean;
  slug: string;
  reason?: string;
}

/**
 * Validates a markdown slug against a strict alphanumeric/hyphen/underscore allowlist.
 * Rejects path separators, dot-segments, encoded traversal sequences, null bytes, and control chars.
 */
export function validateSafeSlug(
  rawInput: unknown,
  options: { allowMdSuffix?: boolean } = {}
): SafeSlugValidationResult {
  if (typeof rawInput !== 'string') {
    return { valid: false, slug: '', reason: 'Slug must be a non-empty string.' };
  }

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { valid: false, slug: '', reason: 'Slug is required.' };
  }

  // Reject raw control chars, null bytes, encoded separators, or dot-dot sequences before any normalization
  if (/[\x00-\x1f\x7f]/.test(trimmed) || ENCODED_TRAVERSAL_PATTERN.test(trimmed)) {
    return { valid: false, slug: '', reason: 'Invalid characters or path traversal sequence detected.' };
  }

  // Check decoded form as well to block double-encoded or percent-encoded tricks
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    return { valid: false, slug: '', reason: 'Malformed percent-encoding in slug.' };
  }

  if (decoded !== trimmed || /[\x00-\x1f\x7f]/.test(decoded) || ENCODED_TRAVERSAL_PATTERN.test(decoded)) {
    return { valid: false, slug: '', reason: 'Encoded traversal or unsafe characters detected.' };
  }

  let candidate = trimmed;
  if (options.allowMdSuffix && candidate.toLowerCase().endsWith('.md')) {
    candidate = candidate.slice(0, -3);
  }

  if (!candidate || candidate.length > 160 || !SAFE_SLUG_REGEX.test(candidate)) {
    return {
      valid: false,
      slug: '',
      reason: 'Slug must contain only letters, digits, hyphens, and underscores.'
    };
  }

  return { valid: true, slug: candidate };
}

export interface ContainedPathResult {
  valid: boolean;
  slug: string;
  resolvedPath: string;
  reason?: string;
}

/**
 * Resolves `<baseDir>/<slug>.md` canonically and enforces strict single-directory containment.
 * Also guards against symlink escapes when the file already exists.
 */
export function resolveContainedMarkdownPath(
  baseDir: string,
  rawSlug: unknown,
  options: { allowMdSuffix?: boolean } = {}
): ContainedPathResult {
  const slugCheck = validateSafeSlug(rawSlug, options);
  if (!slugCheck.valid) {
    return { valid: false, slug: '', resolvedPath: '', reason: slugCheck.reason };
  }

  const canonicalBase = path.resolve(baseDir);
  const candidate = path.resolve(canonicalBase, `${slugCheck.slug}.md`);

  // Must stay strictly inside canonicalBase (trailing path.sep prevents prefix collision like /content-evil)
  if (!candidate.startsWith(canonicalBase + path.sep) || path.dirname(candidate) !== canonicalBase) {
    return {
      valid: false,
      slug: '',
      resolvedPath: '',
      reason: 'Resolved path escapes allowed directory.'
    };
  }

  // If both baseDir and candidate exist on disk, verify realpath containment to block symlink escape
  try {
    if (fs.existsSync(canonicalBase) && fs.existsSync(candidate)) {
      const realBase = fs.realpathSync(canonicalBase);
      const realTarget = fs.realpathSync(candidate);
      if (!realTarget.startsWith(realBase + path.sep) || path.dirname(realTarget) !== realBase) {
        return {
          valid: false,
          slug: '',
          resolvedPath: '',
          reason: 'Symlink target escapes allowed directory.'
        };
      }
    }
  } catch {
    return {
      valid: false,
      slug: '',
      resolvedPath: '',
      reason: 'Unable to verify canonical filesystem containment.'
    };
  }

  return {
    valid: true,
    slug: slugCheck.slug,
    resolvedPath: candidate
  };
}

// ============================================================================
// 2. DEPLOYMENT-COMPATIBLE RATE LIMITING ABSTRACTION
// ============================================================================

export interface RateLimitPolicy {
  name: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAtMs: number;
  retryAfterSeconds: number;
  backend: 'memory' | 'external';
}

export interface RateLimitStore {
  readonly backend: 'memory' | 'external';
  consume(key: string, limit: number, windowMs: number, nowMs?: number): Promise<RateLimitResult>;
  reset?(key?: string): Promise<void>;
}

/**
 * Bounded in-memory fixed-window rate limiter suitable for single-instance Node servers
 * and local verification. For multi-instance / serverless distributed enforcement, supply
 * an external store (e.g., UpstashRestRateLimitStore via UPSTASH_REDIS_REST_URL/TOKEN).
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  public readonly backend = 'memory' as const;
  private readonly buckets = new Map<string, { count: number; resetAtMs: number }>();
  private readonly maxKeys: number;

  constructor(maxKeys: number = 10_000) {
    this.maxKeys = Math.max(100, maxKeys);
  }

  async consume(
    key: string,
    limit: number,
    windowMs: number,
    nowMs: number = Date.now()
  ): Promise<RateLimitResult> {
    this.pruneExpired(nowMs);

    const existing = this.buckets.get(key);
    if (!existing || existing.resetAtMs <= nowMs) {
      if (this.buckets.size >= this.maxKeys) {
        const oldestKey = this.buckets.keys().next().value;
        if (oldestKey) this.buckets.delete(oldestKey);
      }
      const resetAtMs = nowMs + windowMs;
      this.buckets.set(key, { count: 1, resetAtMs });
      return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - 1),
        resetAtMs,
        retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000)),
        backend: this.backend
      };
    }

    existing.count += 1;
    const allowed = existing.count <= limit;
    const remaining = Math.max(0, limit - existing.count);
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAtMs - nowMs) / 1000));

    return {
      allowed,
      limit,
      remaining,
      resetAtMs: existing.resetAtMs,
      retryAfterSeconds,
      backend: this.backend
    };
  }

  async reset(key?: string): Promise<void> {
    if (key) {
      this.buckets.delete(key);
    } else {
      this.buckets.clear();
    }
  }

  private pruneExpired(nowMs: number): void {
    if (this.buckets.size < 256) return;
    for (const [k, v] of this.buckets.entries()) {
      if (v.resetAtMs <= nowMs) {
        this.buckets.delete(k);
      }
    }
  }
}

/**
 * Optional distributed REST rate-limit adapter (e.g., Upstash Redis Free Tier).
 * Falls back safely to InMemoryRateLimitStore if external network call fails.
 */
export class ExternalRestRateLimitStore implements RateLimitStore {
  public readonly backend = 'external' as const;
  private readonly fallback = new InMemoryRateLimitStore();

  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async consume(
    key: string,
    limit: number,
    windowMs: number,
    nowMs: number = Date.now()
  ): Promise<RateLimitResult> {
    const windowId = Math.floor(nowMs / windowMs);
    const bucketKey = `visaapply:rl:${key}:${windowId}`;
    const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000));

    try {
      const resp = await this.fetchImpl(`${this.baseUrl.replace(/\/+$/, '')}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          ['INCR', bucketKey],
          ['EXPIRE', bucketKey, ttlSeconds, 'NX']
        ])
      });

      if (!resp.ok) {
        return this.fallback.consume(key, limit, windowMs, nowMs);
      }

      const data: any = await resp.json();
      const count = Number(data?.[0]?.result ?? 1);
      const resetAtMs = (windowId + 1) * windowMs;
      return {
        allowed: count <= limit,
        limit,
        remaining: Math.max(0, limit - count),
        resetAtMs,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAtMs - nowMs) / 1000)),
        backend: this.backend
      };
    } catch {
      return this.fallback.consume(key, limit, windowMs, nowMs);
    }
  }
}

export function createRateLimitStoreFromEnv(): RateLimitStore {
  const restUrl = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
  const restToken = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();
  if (restUrl && restToken && restUrl.startsWith('https://')) {
    return new ExternalRestRateLimitStore(restUrl, restToken);
  }
  return new InMemoryRateLimitStore();
}

export const defaultRateLimitStore: RateLimitStore = createRateLimitStoreFromEnv();

export const RATE_LIMIT_POLICIES: Record<string, RateLimitPolicy> = {
  adminLogin: {
    name: 'admin-login',
    limit: 10,
    windowMs: 15 * 60 * 1000 // 10 attempts per 15 minutes
  },
  slotAlertSubscribe: {
    name: 'slot-alert-subscribe',
    limit: 10,
    windowMs: 15 * 60 * 1000 // 10 subscriptions per 15 minutes
  },
  askFaq: {
    name: 'ask-faq',
    limit: 30,
    windowMs: 5 * 60 * 1000 // 30 requests per 5 minutes
  },
  aiEligibility: {
    name: 'ai-eligibility',
    limit: 20,
    windowMs: 5 * 60 * 1000 // 20 requests per 5 minutes
  }
};

export function extractClientIp(req: {
  ip?: string;
  headers?: Record<string, any>;
  socket?: { remoteAddress?: string };
}): string {
  const headers = req?.headers || {};
  const cfIp = String(headers['cf-connecting-ip'] || '').trim();
  if (cfIp) return cfIp.slice(0, 64);

  const realIp = String(headers['x-real-ip'] || '').trim();
  if (realIp) return realIp.slice(0, 64);

  const forwarded = String(headers['x-forwarded-for'] || '').trim();
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first.slice(0, 64);
  }

  return String(req?.ip || req?.socket?.remoteAddress || 'unknown').slice(0, 64);
}

export async function enforceRateLimit(
  req: any,
  res: any,
  policy: RateLimitPolicy,
  store: RateLimitStore = defaultRateLimitStore,
  nowMs?: number
): Promise<boolean> {
  const ip = extractClientIp(req);
  const key = `${policy.name}:${ip}`;
  const result = await store.consume(key, policy.limit, policy.windowMs, nowMs);

  if (res?.setHeader) {
    res.setHeader('X-RateLimit-Limit', String(result.limit));
    res.setHeader('X-RateLimit-Remaining', String(result.remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAtMs / 1000)));
  }

  if (!result.allowed) {
    if (res?.setHeader) {
      res.setHeader('Retry-After', String(result.retryAfterSeconds));
    }
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfterSeconds: result.retryAfterSeconds
    });
    return false;
  }

  return true;
}

export function createRateLimitMiddleware(
  policy: RateLimitPolicy,
  store: RateLimitStore = defaultRateLimitStore
) {
  return async (req: any, res: any, next: any) => {
    const allowed = await enforceRateLimit(req, res, policy, store);
    if (allowed) {
      next();
    }
  };
}

// ============================================================================
// 3. SECURITY HEADERS & DOCUMENTED CSP ALLOWLIST
// ============================================================================

/**
 * External origins explicitly allowlisted in Content-Security-Policy to preserve
 * existing VisaApply.org functionality (Google AdSense, Travelpayouts, FlagCDN, Google Fonts).
 */
export const CSP_EXTERNAL_SCRIPT_ALLOWLIST = [
  'https://pagead2.googlesyndication.com',
  'https://googleads.g.doubleclick.net',
  'https://tpc.googlesyndication.com',
  'https://ep1.adtrafficquality.google',
  'https://ep2.adtrafficquality.google',
  'https://emrldco.com',
  'https://tp.media'
] as const;

export const CSP_EXTERNAL_CONNECT_ALLOWLIST = [
  'https://api.country.is',
  'https://ipwho.is',
  'https://freeipapi.com',
  'https://api.exchangerate-api.com',
  'https://open.er-api.com',
  'https://api.open-meteo.com'
] as const;

const AISTUDIO_FRAME_ANCESTORS =
  "'self' https://*.google.com https://localhost.corp.google.com:26001";

function sanitizePreviewFrameAncestors(): string {
  const raw = (process.env.CSP_HEADER_VALUE || '').trim();
  const match = raw.match(/frame-ancestors\s+([^;]+)/i);
  if (match && match[1]) {
    const tokens = match[1]
      .trim()
      .split(/\s+/)
      .filter((t) =>
        t === "'self'" ||
        t.startsWith('https://*.google.com') ||
        t.startsWith('https://localhost.corp.google.com')
      );
    if (tokens.length > 0) {
      if (!tokens.includes("'self'")) tokens.unshift("'self'");
      return tokens.join(' ');
    }
  }
  return AISTUDIO_FRAME_ANCESTORS;
}

/**
 * Returns true ONLY when the incoming request is served in the local/Cloud Run AI Studio preview iframe
 * (never on Vercel production and never on visaapply.org hosts).
 */
export function isAiStudioPreviewRequest(req?: {
  headers?: Record<string, any>;
  hostname?: string;
}): boolean {
  if (
    process.env.VERCEL === '1' ||
    process.env.VERCEL === 'true' ||
    Boolean((process.env.VERCEL_ENV || '').trim())
  ) {
    return false;
  }

  const headers = req?.headers || {};
  const forwardedHost = String(headers['x-forwarded-host'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .split(':')[0];
  const host = String(headers.host || req?.hostname || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .split(':')[0];
  const effectiveHost = forwardedHost || host;

  // Production domains NEVER allow third-party iframe embedding
  if (effectiveHost === 'visaapply.org' || effectiveHost.endsWith('.visaapply.org')) {
    return false;
  }

  if (process.env.ALLOW_AISTUDIO_PREVIEW === 'true') {
    return true;
  }

  let appUrlHost = '';
  if (process.env.APP_URL) {
    try {
      appUrlHost = new URL(process.env.APP_URL).hostname.toLowerCase();
    } catch {
      appUrlHost = '';
    }
  }

  const isCloudRunPreviewHost =
    /^ais-(?:dev|pre)-[a-z0-9-]+\.[a-z0-9-]+\.run\.app$/i.test(effectiveHost) ||
    effectiveHost.endsWith('.a.run.app') ||
    (Boolean(appUrlHost) && effectiveHost === appUrlHost && appUrlHost.endsWith('.run.app'));

  if (isCloudRunPreviewHost) {
    return true;
  }

  const referer = String(headers.referer || '').toLowerCase();
  const isIframeSecDest = String(headers['sec-fetch-dest'] || '').toLowerCase() === 'iframe';
  if (
    Boolean((process.env.APPLET_ID || '').trim()) &&
    isIframeSecDest &&
    referer.startsWith('https://aistudio.google.com/')
  ) {
    return true;
  }

  return false;
}

export function buildContentSecurityPolicy(options?: { allowPreviewFraming?: boolean }): string {
  const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    ...CSP_EXTERNAL_SCRIPT_ALLOWLIST
  ].join(' ');

  const connectSources = [
    "'self'",
    'https://pagead2.googlesyndication.com',
    'https://googleads.g.doubleclick.net',
    'https://ep1.adtrafficquality.google',
    'https://ep2.adtrafficquality.google',
    'https://emrldco.com',
    'https://*.emrldco.com',
    'https://tp.media',
    'https://*.tp.media',
    'https://travelpayouts.com',
    'https://*.travelpayouts.com',
    ...CSP_EXTERNAL_CONNECT_ALLOWLIST
  ].join(' ');

  const frameAncestors = options?.allowPreviewFraming
    ? sanitizePreviewFrameAncestors()
    : "'self'";

  return [
    "default-src 'self'",
    `script-src ${scriptSources}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://emrldco.com https://*.emrldco.com https://tp.media https://*.tp.media",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://flagcdn.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://emrldco.com https://*.emrldco.com https://tp.media https://*.tp.media",
    `connect-src ${connectSources}`,
    "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://ep2.adtrafficquality.google https://www.google.com https://tp.media https://*.tp.media https://c121.travelpayouts.com https://*.travelpayouts.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`
  ].join('; ');
}

export function getSecurityHeaders(options?: {
  isApi?: boolean;
  allowPreviewFraming?: boolean;
}): Record<string, string> {
  const allowPreview = Boolean(!options?.isApi && options?.allowPreviewFraming);
  const headers: Record<string, string> = {
    'Content-Security-Policy': options?.isApi
      ? "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
      : buildContentSecurityPolicy({ allowPreviewFraming: allowPreview }),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
  };

  if (options?.isApi) {
    headers['X-Frame-Options'] = 'DENY';
  } else if (!allowPreview) {
    // Omit X-Frame-Options in scoped AI Studio preview iframe so CSP frame-ancestors controls embedding cleanly
    headers['X-Frame-Options'] = 'SAMEORIGIN';
  }

  return headers;
}

export function applySecurityHeaders(
  res: { setHeader?: (k: string, v: string) => any },
  options?: { isApi?: boolean; allowPreviewFraming?: boolean }
): void {
  if (!res?.setHeader) return;
  const headers = getSecurityHeaders(options);
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
}

export function securityHeadersMiddleware(req: any, res: any, next: any): void {
  const isApi = String(req?.path || req?.url || '').startsWith('/api');
  const allowPreviewFraming = !isApi && isAiStudioPreviewRequest(req);
  applySecurityHeaders(res, { isApi, allowPreviewFraming });
  next();
}

// ============================================================================
// 4. SAFE ERROR HANDLING (GENERIC PUBLIC 500 + REDACTED SERVER DIAGNOSTICS)
// ============================================================================

export function sendSafeServerError(
  res: { status: (code: number) => any },
  component: string,
  err: unknown,
  options?: { statusCode?: number; publicMessage?: string }
): string {
  const requestId = `err-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
  const rawMessage = err instanceof Error ? err.message : String(err || 'Unknown server error');
  const redactedMessage = redactSensitiveData(rawMessage);

  recordOperationalEvent({
    category: 'VERIFICATION_FAILURE',
    severity: 'ERROR',
    component,
    message: `[${requestId}] ${redactedMessage}`
  });

  console.error(`[${component}] [${requestId}]`, redactedMessage);

  const statusCode = options?.statusCode ?? 500;
  const publicMessage = options?.publicMessage || 'Internal server error';
  res.status(statusCode).json({
    success: false,
    error: publicMessage,
    requestId
  });
  return requestId;
}

export function sendSafeTextServerError(
  res: { status: (code: number) => any },
  component: string,
  err: unknown,
  publicMessage: string = 'Internal server error'
): string {
  const requestId = `err-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
  const rawMessage = err instanceof Error ? err.message : String(err || 'Unknown server error');
  const redactedMessage = redactSensitiveData(rawMessage);

  recordOperationalEvent({
    category: 'VERIFICATION_FAILURE',
    severity: 'ERROR',
    component,
    message: `[${requestId}] ${redactedMessage}`
  });

  console.error(`[${component}] [${requestId}]`, redactedMessage);
  res.status(500).send(publicMessage);
  return requestId;
}

// ============================================================================
// 5. EMAIL SECURITY (HTML ESCAPING, HTTPS LINK VALIDATION, HONEST DELIVERY)
// ============================================================================

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;'
};

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"'`]/g, (ch) => HTML_ESCAPE_MAP[ch] || ch);
}

export function stripEmailHeaderInjection(value: unknown): string {
  return String(value ?? '')
    .replace(/[\r\n\0]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const PRIVATE_OR_LOCAL_HOST_REGEX =
  /^(?:localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|::1|\[::1\]|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|.+\.local)$/i;

export const DEFAULT_SAFE_SLOT_BOOKING_LINK = 'https://www.visaapply.org/embassy-slot-alert';

/**
 * Strictly validates that a booking URL uses HTTPS, contains no embedded credentials
 * or control characters, and does not target loopback/private network hosts.
 */
export function validateHttpsBookingLink(rawUrl: unknown): string | null {
  if (typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed || /[\x00-\x1f\x7f\s]/.test(trimmed)) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return null;
    if (parsed.username || parsed.password) return null;
    if (!parsed.hostname || PRIVATE_OR_LOCAL_HOST_REGEX.test(parsed.hostname)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function buildLocalizedSlotAlertEmail(
  fromCountry: string,
  embassyName: string,
  slotDate: string,
  bookingLink: string
): { subject: string; html: string; bookingLink: string } {
  const safeBookingLink = validateHttpsBookingLink(bookingLink);
  if (!safeBookingLink) {
    throw new Error('INVALID_BOOKING_LINK: Booking link must be a valid public https:// URL.');
  }

  const safeEmbassySubject = stripEmailHeaderInjection(embassyName);
  const safeDateSubject = stripEmailHeaderInjection(slotDate);

  const safeEmbassyHtml = escapeHtml(safeEmbassySubject);
  const safeDateHtml = escapeHtml(safeDateSubject);
  const safeHrefHtml = escapeHtml(safeBookingLink);

  const fc = String(fromCountry || 'IN').trim().toUpperCase();

  if (fc === 'AE') {
    return {
      subject: `🔔 [${safeEmbassySubject}] موعد متاح - ${safeDateSubject} - احجز الآن!`,
      bookingLink: safeBookingLink,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; direction: rtl; text-align: right;">
          <h2 style="color: #0B3D91;">VisaApply.org - تنبيه موعد السفارة</h2>
          <p>مرحباً،</p>
          <p>تم فتح موعد جديد في <strong>${safeEmbassyHtml}</strong>!</p>
          <p style="background: #f1f5f9; padding: 12px; border-radius: 8px;">
            <strong>التاريخ المتاح:</strong> ${safeDateHtml}<br/>
            <strong>الحالة:</strong> متاح (مفحوص تلقائياً)
          </p>
          <p>
            <a href="${safeHrefHtml}" target="_blank" rel="noopener noreferrer" style="background: #10b981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              حجز الموعد الآن ↗
            </a>
          </p>
        </div>
      `
    };
  }

  if (fc === 'FR') {
    return {
      subject: `🔔 [${safeEmbassySubject}] Créneau ouvert - ${safeDateSubject} - Réservez vite !`,
      bookingLink: safeBookingLink,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #0B3D91;">VisaApply.org - Alerte de Rendez-vous</h2>
          <p>Bonjour,</p>
          <p>Le créneau de rendez-vous pour <strong>${safeEmbassyHtml}</strong> est ouvert !</p>
          <p style="background: #f1f5f9; padding: 12px; border-radius: 8px;">
            <strong>Date disponible :</strong> ${safeDateHtml}<br/>
            <strong>Statut :</strong> OUVERT
          </p>
          <p>
            <a href="${safeHrefHtml}" target="_blank" rel="noopener noreferrer" style="background: #10b981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Réserver maintenant ↗
            </a>
          </p>
        </div>
      `
    };
  }

  return {
    subject: `🔔 [${safeEmbassySubject}] Slot OPEN - ${safeDateSubject} - Jaldi Karo!`,
    bookingLink: safeBookingLink,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #0B3D91;">VisaApply.org - Auto Embassy Slot Alert</h2>
        <p>Hi,</p>
        <p><strong>${safeEmbassyHtml}</strong> ka appointment slot khul gaya hai!</p>
        <p style="background: #f1f5f9; padding: 12px; border-radius: 8px;">
          <strong>Available Date:</strong> ${safeDateHtml}<br/>
          <strong>Status:</strong> OPEN (Verified by 30-min Automated Cron)
        </p>
        <p>
          <a href="${safeHrefHtml}" target="_blank" rel="noopener noreferrer" style="background: #10b981; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Book Appointment Now ↗
          </a>
        </p>
        <p style="color: #64748b; font-size: 12px; margin-top: 16px;">
          Embassy appointment slots fill within 10-15 minutes. Please book immediately.<br/>
          <a href="https://www.visaapply.org/embassy-slot-alert" style="color: #94a3b8;">Click here to manage or unsubscribe from slot alerts</a>
        </p>
      </div>
    `
  };
}

export interface EmailDeliveryResult {
  success: boolean;
  configured: boolean;
  data?: unknown;
  error?: string;
}

const BASIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmailAddress(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  return trimmed.length >= 5 && trimmed.length <= 254 && BASIC_EMAIL_REGEX.test(trimmed);
}

/**
 * Delivers an email via Resend. Fails explicitly (never reports mock success)
 * when RESEND_API_KEY is unconfigured, and never logs recipient addresses or secrets.
 */
export async function deliverEmailViaResend(
  to: string,
  subject: string,
  htmlContent: string,
  options?: {
    apiKey?: string;
    sendFn?: (payload: { from: string; to: string[]; subject: string; html: string }) => Promise<unknown>;
  }
): Promise<EmailDeliveryResult> {
  if (!isValidEmailAddress(to)) {
    return {
      success: false,
      configured: Boolean((options?.apiKey ?? process.env.RESEND_API_KEY ?? '').trim()),
      error: 'Invalid recipient email address.'
    };
  }

  const apiKey = (options?.apiKey ?? process.env.RESEND_API_KEY ?? '').trim();
  if (!apiKey) {
    recordOperationalEvent({
      category: 'SOURCE_RETRIEVAL_FAILURE',
      severity: 'WARN',
      component: 'resend-email',
      message: 'Email delivery skipped: RESEND_API_KEY is not configured.'
    });
    return {
      success: false,
      configured: false,
      error: 'Email delivery provider is not configured (RESEND_API_KEY missing).'
    };
  }

  const cleanSubject = stripEmailHeaderInjection(subject);
  const payload = {
    from: 'VisaApply Auto System <alerts@visaapply.org>',
    to: [to.trim()],
    subject: cleanSubject,
    html: htmlContent
  };

  try {
    if (options?.sendFn) {
      const data = await options.sendFn(payload);
      return { success: true, configured: true, data };
    }
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const data = await resend.emails.send(payload);
    return { success: true, configured: true, data };
  } catch (err: any) {
    const redacted = redactSensitiveData(err?.message || 'Email delivery failed');
    recordOperationalEvent({
      category: 'SOURCE_RETRIEVAL_FAILURE',
      severity: 'ERROR',
      component: 'resend-email',
      message: redacted
    });
    console.error('[resend-email] Delivery failed:', redacted);
    return {
      success: false,
      configured: true,
      error: 'Email delivery failed.'
    };
  }
}
