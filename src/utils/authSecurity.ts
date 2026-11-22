import crypto from 'crypto';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.visaapply.org',
  'https://visaapply.org',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

export const ADMIN_SESSION_COOKIE_NAME = 'visaapply_admin_session';
export const ADMIN_CSRF_COOKIE_NAME = 'visaapply_admin_csrf';
export const DEFAULT_ADMIN_SESSION_TTL_SECONDS = 2 * 60 * 60; // 2 hours
const MAX_ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 hours hard cap

export function timingSafeEqualStrings(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (!a || !b) return false;
  const hashA = crypto.createHash('sha256').update(a, 'utf8').digest();
  const hashB = crypto.createHash('sha256').update(b, 'utf8').digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// ============================================================================
// SESSION REVOCATION STORE (IN-MEMORY DEFAULT + PLUGGABLE DISTRIBUTED HOOK)
// ============================================================================

export interface SessionRevocationStore {
  revoke(jti: string, expiresAtMs: number): void;
  isRevoked(jti: string, nowMs?: number): boolean;
  clear(): void;
}

class InMemorySessionRevocationStore implements SessionRevocationStore {
  private readonly revoked = new Map<string, number>();

  revoke(jti: string, expiresAtMs: number): void {
    if (!jti) return;
    this.prune(Date.now());
    this.revoked.set(jti, Math.max(expiresAtMs, Date.now() + 60_000));
  }

  isRevoked(jti: string, nowMs: number = Date.now()): boolean {
    if (!jti) return false;
    const exp = this.revoked.get(jti);
    if (exp === undefined) return false;
    if (exp <= nowMs) {
      this.revoked.delete(jti);
      return false;
    }
    return true;
  }

  clear(): void {
    this.revoked.clear();
  }

  private prune(nowMs: number): void {
    if (this.revoked.size < 128) return;
    for (const [k, exp] of this.revoked.entries()) {
      if (exp <= nowMs) {
        this.revoked.delete(k);
      }
    }
  }
}

const defaultRevocationStore = new InMemorySessionRevocationStore();

export function resetRevokedAdminSessions(): void {
  defaultRevocationStore.clear();
}

// ============================================================================
// SHORT-LIVED SIGNED ADMIN SESSIONS (EXPIRING + REVOCABLE + CSRF BOUND)
// ============================================================================

export interface AdminSessionPayload {
  v: 2;
  sub: 'admin';
  jti: string;
  iat: number; // unix seconds
  exp: number; // unix seconds
  csrf: string;
}

export interface IssuedAdminSession {
  token: string;
  csrfToken: string;
  jti: string;
  issuedAt: number; // unix seconds
  expiresAt: number; // unix seconds
  ttlSeconds: number;
}

export interface AdminSessionVerificationResult {
  valid: boolean;
  payload?: AdminSessionPayload;
  reason?:
    | 'MISSING_CONFIG'
    | 'MISSING_TOKEN'
    | 'MALFORMED_TOKEN'
    | 'INVALID_SIGNATURE'
    | 'EXPIRED'
    | 'REVOKED'
    | 'INVALID_CLAIMS';
}

function deriveSessionSigningKey(adminPassword: string): Buffer {
  const sessionSecret = (process.env.ADMIN_SESSION_SECRET || '').trim();
  const keyMaterial = sessionSecret ? `${adminPassword}:${sessionSecret}` : adminPassword;
  return crypto.createHmac('sha256', keyMaterial).update('visaapply-admin-session-signing-v2').digest();
}

function signPayloadEncoded(encodedPayload: string, adminPassword: string): string {
  const key = deriveSessionSigningKey(adminPassword);
  return crypto.createHmac('sha256', key).update(encodedPayload, 'utf8').digest('base64url');
}

/**
 * Issues a short-lived, uniquely identified, HMAC-SHA256 signed admin session token
 * bound to a per-session CSRF secret. Never deterministic across logins.
 */
export function createAdminSession(
  adminPassword?: string,
  options?: { ttlSeconds?: number; nowMs?: number }
): IssuedAdminSession {
  const expectedPass = (adminPassword ?? process.env.ADMIN_PASSWORD ?? '').trim();
  if (!expectedPass) {
    throw new Error('ADMIN_PASSWORD is not configured.');
  }

  const nowMs = options?.nowMs ?? Date.now();
  const issuedAt = Math.floor(nowMs / 1000);
  const rawTtl = options?.ttlSeconds ?? DEFAULT_ADMIN_SESSION_TTL_SECONDS;
  const ttlSeconds = Math.max(60, Math.min(MAX_ADMIN_SESSION_TTL_SECONDS, Math.floor(rawTtl)));
  const expiresAt = issuedAt + ttlSeconds;
  const jti = crypto.randomUUID();
  const csrfToken = crypto.randomBytes(24).toString('base64url');

  const payload: AdminSessionPayload = {
    v: 2,
    sub: 'admin',
    jti,
    iat: issuedAt,
    exp: expiresAt,
    csrf: csrfToken
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = signPayloadEncoded(encodedPayload, expectedPass);
  const token = `v2.${encodedPayload}.${signature}`;

  return {
    token,
    csrfToken,
    jti,
    issuedAt,
    expiresAt,
    ttlSeconds
  };
}

/**
 * @deprecated Legacy static token derivation is intentionally disabled for session auth.
 * Returns a fresh short-lived signed session token instead so static tokens are never issued.
 */
export function deriveAdminToken(adminPassword: string): string {
  const trimmed = (adminPassword || '').trim();
  if (!trimmed) return '';
  return createAdminSession(trimmed).token;
}

export function verifyAdminPassword(candidate: unknown, adminPassword?: string): boolean {
  const expected = (adminPassword ?? process.env.ADMIN_PASSWORD ?? '').trim();
  if (!expected || typeof candidate !== 'string' || candidate.length === 0) {
    return false;
  }
  return timingSafeEqualStrings(candidate, expected);
}

export function verifyAdminSession(
  candidateToken: string,
  adminPassword?: string,
  options?: { nowMs?: number; revocationStore?: SessionRevocationStore }
): AdminSessionVerificationResult {
  const expectedPass = (adminPassword ?? process.env.ADMIN_PASSWORD ?? '').trim();
  if (!expectedPass) {
    return { valid: false, reason: 'MISSING_CONFIG' };
  }

  const trimmed = String(candidateToken || '').trim();
  if (!trimmed) {
    return { valid: false, reason: 'MISSING_TOKEN' };
  }

  const parts = trimmed.split('.');
  if (parts.length !== 3 || parts[0] !== 'v2' || !parts[1] || !parts[2]) {
    return { valid: false, reason: 'MALFORMED_TOKEN' };
  }

  const [, encodedPayload, providedSig] = parts;
  const expectedSig = signPayloadEncoded(encodedPayload, expectedPass);
  if (!timingSafeEqualStrings(providedSig, expectedSig)) {
    return { valid: false, reason: 'INVALID_SIGNATURE' };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    return { valid: false, reason: 'MALFORMED_TOKEN' };
  }

  if (
    !parsed ||
    parsed.v !== 2 ||
    parsed.sub !== 'admin' ||
    typeof parsed.jti !== 'string' ||
    !parsed.jti ||
    typeof parsed.iat !== 'number' ||
    typeof parsed.exp !== 'number' ||
    typeof parsed.csrf !== 'string' ||
    !parsed.csrf ||
    parsed.exp <= parsed.iat
  ) {
    return { valid: false, reason: 'INVALID_CLAIMS' };
  }

  const nowMs = options?.nowMs ?? Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  if (nowSec >= parsed.exp || parsed.iat > nowSec + 60) {
    return { valid: false, reason: 'EXPIRED' };
  }

  const store = options?.revocationStore ?? defaultRevocationStore;
  if (store.isRevoked(parsed.jti, nowMs)) {
    return { valid: false, reason: 'REVOKED' };
  }

  return {
    valid: true,
    payload: parsed as AdminSessionPayload
  };
}

export function verifyAdminToken(
  candidateToken: string,
  adminPassword?: string,
  options?: { nowMs?: number; revocationStore?: SessionRevocationStore }
): boolean {
  return verifyAdminSession(candidateToken, adminPassword, options).valid;
}

export function revokeAdminSession(
  tokenOrJti: string,
  adminPassword?: string,
  options?: { revocationStore?: SessionRevocationStore }
): boolean {
  const store = options?.revocationStore ?? defaultRevocationStore;
  const trimmed = String(tokenOrJti || '').trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('v2.')) {
    const check = verifyAdminSession(trimmed, adminPassword, { revocationStore: store });
    if (check.valid && check.payload) {
      store.revoke(check.payload.jti, check.payload.exp * 1000);
      return true;
    }
    // Even if signature check used a different env var, parse jti safely only if verified
    return false;
  }

  store.revoke(trimmed, Date.now() + MAX_ADMIN_SESSION_TTL_SECONDS * 1000);
  return true;
}

// ============================================================================
// COOKIE & REQUEST EXTRACTION HELPERS
// ============================================================================

export function parseCookieValue(cookieHeader: unknown, cookieName: string): string {
  const raw = String(cookieHeader || '');
  if (!raw) return '';
  const pairs = raw.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    if (key === cookieName) {
      const val = pair.slice(idx + 1).trim();
      try {
        return decodeURIComponent(val);
      } catch {
        return '';
      }
    }
  }
  return '';
}

export function parseAdminSessionCookie(cookieHeader: unknown): string {
  return parseCookieValue(cookieHeader, ADMIN_SESSION_COOKIE_NAME);
}

export function parseAdminCsrfCookie(cookieHeader: unknown): string {
  return parseCookieValue(cookieHeader, ADMIN_CSRF_COOKIE_NAME);
}

export function extractAdminAuthFromRequest(req: { headers?: Record<string, any> }): {
  token: string;
  source: 'cookie' | 'header' | 'none';
} {
  const headers = req?.headers || {};
  const cookieToken = parseAdminSessionCookie(headers.cookie || headers.Cookie);
  if (cookieToken) {
    return { token: cookieToken, source: 'cookie' };
  }

  const authHeader = String(headers.authorization || headers.Authorization || '')
    .replace(/^Bearer\s+/i, '')
    .trim();
  const customHeader = String(headers['x-admin-token'] || headers['X-Admin-Token'] || '').trim();
  const headerToken = authHeader || customHeader;
  if (headerToken) {
    return { token: headerToken, source: 'header' };
  }

  return { token: '', source: 'none' };
}

export function extractAdminTokenFromRequest(req: { headers?: Record<string, any> }): string {
  return extractAdminAuthFromRequest(req).token;
}

export function isSecureRequest(req: {
  secure?: boolean;
  headers?: Record<string, any>;
}): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  if (req?.secure) return true;
  const proto = String(req?.headers?.['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  return proto === 'https';
}

export function buildAdminSessionCookies(
  session: IssuedAdminSession,
  options?: { isSecure?: boolean }
): string[] {
  const secureFlag = options?.isSecure ? '; Secure' : '';
  const sessionCookie = `${ADMIN_SESSION_COOKIE_NAME}=${encodeURIComponent(session.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${session.ttlSeconds}${secureFlag}`;
  const csrfCookie = `${ADMIN_CSRF_COOKIE_NAME}=${encodeURIComponent(session.csrfToken)}; Path=/; SameSite=Lax; Max-Age=${session.ttlSeconds}${secureFlag}`;
  return [sessionCookie, csrfCookie];
}

export function buildClearAdminSessionCookies(options?: { isSecure?: boolean }): string[] {
  const secureFlag = options?.isSecure ? '; Secure' : '';
  return [
    `${ADMIN_SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`,
    `${ADMIN_CSRF_COOKIE_NAME}=; Path=/; SameSite=Lax; Max-Age=0${secureFlag}`
  ];
}

// ============================================================================
// CSRF PROTECTION (ORIGIN/REFERER + DOUBLE-SUBMIT + SESSION-BOUND CSRF TOKEN)
// ============================================================================

const SAFE_HTTP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function isOriginAllowedForRequest(
  originHeader: string,
  req: { headers?: Record<string, any> }
): boolean {
  const normalized = originHeader.trim();
  if (!normalized) return false;

  const allowed = getAllowedCorsOrigins();
  if (allowed.includes(normalized)) return true;

  // Also allow exact same-origin match against Host / X-Forwarded-Host (e.g., AI Studio preview / staging URL)
  const host = String(req?.headers?.['x-forwarded-host'] || req?.headers?.host || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  if (!host) return false;

  try {
    const parsed = new URL(normalized);
    return parsed.host.toLowerCase() === host && (parsed.protocol === 'https:' || parsed.protocol === 'http:');
  } catch {
    return false;
  }
}

export interface CsrfValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates state-changing requests against CSRF attacks:
 * 1. Verifies Origin (or Referer fallback) when present against allowed/same-origin hosts.
 * 2. When authenticated via cookie session, requires X-CSRF-Token matching BOTH the
 *    session-bound csrf claim inside the signed HttpOnly cookie AND the csrf cookie.
 */
export function verifyAdminCsrfRequest(
  req: { method?: string; headers?: Record<string, any> },
  sessionPayload?: AdminSessionPayload,
  authSource: 'cookie' | 'header' | 'none' = 'cookie'
): CsrfValidationResult {
  const method = String(req?.method || 'GET').toUpperCase();
  if (SAFE_HTTP_METHODS.has(method)) {
    return { valid: true };
  }

  const headers = req?.headers || {};
  const origin = String(headers.origin || headers.Origin || '').trim();
  const referer = String(headers.referer || headers.Referer || '').trim();

  if (origin) {
    if (!isOriginAllowedForRequest(origin, req)) {
      return { valid: false, reason: 'Cross-origin request rejected by CSRF policy.' };
    }
  } else if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (!isOriginAllowedForRequest(refOrigin, req)) {
        return { valid: false, reason: 'Cross-origin referer rejected by CSRF policy.' };
      }
    } catch {
      return { valid: false, reason: 'Invalid referer header.' };
    }
  }

  // Cookie-authenticated state-changing requests must present a valid double-submit CSRF token
  if (authSource === 'cookie') {
    const headerCsrf = String(headers['x-csrf-token'] || headers['X-CSRF-Token'] || '').trim();
    const cookieCsrf = parseAdminCsrfCookie(headers.cookie || headers.Cookie);

    if (!headerCsrf) {
      return { valid: false, reason: 'Missing X-CSRF-Token header.' };
    }

    if (sessionPayload && !timingSafeEqualStrings(headerCsrf, sessionPayload.csrf)) {
      return { valid: false, reason: 'Invalid CSRF token for active session.' };
    }

    if (cookieCsrf && !timingSafeEqualStrings(headerCsrf, cookieCsrf)) {
      return { valid: false, reason: 'CSRF header does not match CSRF cookie.' };
    }
  }

  return { valid: true };
}

// ============================================================================
// CRON AUTHENTICATION & RESTRICTED CORS
// ============================================================================

export interface CronAuthResult {
  authorized: boolean;
  statusCode: number;
  status: 'AUTHORIZED' | 'UNAUTHORIZED' | 'CONFIG_ERROR' | 'METHOD_NOT_ALLOWED';
  message: string;
}

export function verifyCronAuth(
  req: { method?: string; headers?: Record<string, any> },
  options?: { allowAdminSession?: boolean; allowedMethods?: string[] }
): CronAuthResult {
  const method = String(req?.method || 'GET').toUpperCase();
  const allowedMethods = options?.allowedMethods || ['GET', 'POST'];
  if (!allowedMethods.includes(method)) {
    return {
      authorized: false,
      statusCode: 405,
      status: 'METHOD_NOT_ALLOWED',
      message: `Method ${method} not allowed.`
    };
  }

  const headers = req?.headers || {};
  const cronSecret = (process.env.CRON_SECRET || '').trim();
  const adminAuth = extractAdminAuthFromRequest(req);

  if (options?.allowAdminSession && adminAuth.token) {
    const sessionCheck = verifyAdminSession(adminAuth.token);
    if (sessionCheck.valid && sessionCheck.payload) {
      const csrfCheck = verifyAdminCsrfRequest(req, sessionCheck.payload, adminAuth.source);
      if (csrfCheck.valid) {
        return {
          authorized: true,
          statusCode: 200,
          status: 'AUTHORIZED',
          message: 'Authorized via admin session.'
        };
      }
      return {
        authorized: false,
        statusCode: 403,
        status: 'UNAUTHORIZED',
        message: csrfCheck.reason || 'CSRF validation failed.'
      };
    }
  }

  // Fail closed whenever CRON_SECRET is not configured
  if (!cronSecret) {
    return {
      authorized: false,
      statusCode: 503,
      status: 'CONFIG_ERROR',
      message: 'CRON_SECRET environment variable is not configured (fail-closed).'
    };
  }

  const authHeader = String(headers.authorization || headers.Authorization || '')
    .replace(/^Bearer\s+/i, '')
    .trim();
  const cronHeader = String(headers['x-cron-secret'] || headers['X-Cron-Secret'] || '').trim();
  const providedSecret = authHeader || cronHeader;

  if (providedSecret && timingSafeEqualStrings(providedSecret, cronSecret)) {
    return {
      authorized: true,
      statusCode: 200,
      status: 'AUTHORIZED',
      message: 'Authorized via CRON_SECRET.'
    };
  }

  return {
    authorized: false,
    statusCode: 401,
    status: 'UNAUTHORIZED',
    message: 'Unauthorized cron invocation.'
  };
}

export function getAllowedCorsOrigins(): string[] {
  const extra = [
    ...(process.env.ALLOWED_ORIGINS || '').split(','),
    process.env.ALLOWED_ORIGIN || ''
  ]
    .map((o) => o.trim())
    .filter(Boolean);

  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...extra]));
}

export function applyRestrictedCorsHeaders(
  req: { headers?: Record<string, any> },
  res: { setHeader?: (k: string, v: string) => any },
  methods: string = 'GET, POST, OPTIONS',
  headersList: string = 'Content-Type, Authorization, X-Admin-Token, X-Cron-Secret, X-CSRF-Token, X-Requested-With'
): string | null {
  if (!res?.setHeader) return null;
  const origin = String(req?.headers?.origin || req?.headers?.Origin || '').trim();
  const allowed = getAllowedCorsOrigins();
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', headersList);

  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return origin;
  }
  return null;
}
