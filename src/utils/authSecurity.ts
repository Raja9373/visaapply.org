import crypto from 'crypto';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.visaapply.org',
  'https://visaapply.org',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

export function timingSafeEqualStrings(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (!a || !b) return false;
  const hashA = crypto.createHash('sha256').update(a, 'utf8').digest();
  const hashB = crypto.createHash('sha256').update(b, 'utf8').digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function deriveAdminToken(adminPassword: string): string {
  const trimmed = (adminPassword || '').trim();
  if (!trimmed) return '';
  return crypto.createHmac('sha256', trimmed).update('visaapply-admin-v1').digest('hex');
}

export function verifyAdminPassword(candidate: unknown, adminPassword?: string): boolean {
  const expected = (adminPassword ?? process.env.ADMIN_PASSWORD ?? '').trim();
  if (!expected || typeof candidate !== 'string' || candidate.length === 0) {
    return false;
  }
  return timingSafeEqualStrings(candidate, expected);
}

export function verifyAdminToken(candidateToken: string, adminPassword?: string): boolean {
  const expectedPass = (adminPassword ?? process.env.ADMIN_PASSWORD ?? '').trim();
  if (!expectedPass || !candidateToken) return false;
  const expectedToken = deriveAdminToken(expectedPass);
  return timingSafeEqualStrings(candidateToken.trim(), expectedToken);
}

export function parseAdminSessionCookie(cookieHeader: unknown): string {
  const raw = String(cookieHeader || '');
  const match = raw.match(/(?:^|;\s*)visaapply_admin_session=([^;]+)/);
  if (!match) return '';
  try {
    return decodeURIComponent(match[1].trim());
  } catch {
    return '';
  }
}

export function extractAdminTokenFromRequest(req: { headers?: Record<string, any> }): string {
  const headers = req?.headers || {};
  const authHeader = String(headers.authorization || headers.Authorization || '')
    .replace(/^Bearer\s+/i, '')
    .trim();
  const customHeader = String(headers['x-admin-token'] || headers['X-Admin-Token'] || '').trim();
  const cookieToken = parseAdminSessionCookie(headers.cookie || headers.Cookie);
  return authHeader || customHeader || cookieToken;
}

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
  const adminToken = extractAdminTokenFromRequest(req);

  if (options?.allowAdminSession && adminToken && verifyAdminToken(adminToken)) {
    return {
      authorized: true,
      statusCode: 200,
      status: 'AUTHORIZED',
      message: 'Authorized via admin session.'
    };
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
  headersList: string = 'Content-Type, Authorization, X-Admin-Token, X-Cron-Secret'
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
