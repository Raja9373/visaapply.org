import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import express from 'express';

import {
  validateSafeSlug,
  resolveContainedMarkdownPath,
  InMemoryRateLimitStore,
  ExternalRestRateLimitStore,
  RATE_LIMIT_POLICIES,
  createRateLimitMiddleware,
  enforceRateLimit,
  CSP_EXTERNAL_SCRIPT_ALLOWLIST,
  getSecurityHeaders,
  securityHeadersMiddleware,
  sendSafeServerError,
  sendSafeTextServerError,
  escapeHtml,
  validateHttpsBookingLink,
  buildLocalizedSlotAlertEmail,
  deliverEmailViaResend,
  isValidEmailAddress
} from '../src/utils/securityHardening';
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_CSRF_COOKIE_NAME,
  createAdminSession,
  verifyAdminSession,
  verifyAdminToken,
  revokeAdminSession,
  resetRevokedAdminSessions,
  buildAdminSessionCookies,
  buildClearAdminSessionCookies,
  extractAdminAuthFromRequest,
  verifyAdminCsrfRequest
} from '../src/utils/authSecurity';
import { getRecentOperationalEvents } from '../src/utils/operationalObservability';
import { createAdminHandler } from '../api/admin';
import renderHandler from '../api/render';
import { createAiEligibilityHandler } from '../src/api/aiEligibility';

function createMockRes() {
  const headers: Record<string, any> = {};
  let statusCode = 200;
  let body: any = null;
  let sentText: string | null = null;
  const res: any = {
    setHeader(k: string, v: any) {
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
    send(payload: any) {
      sentText = typeof payload === 'string' ? payload : JSON.stringify(payload);
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
    },
    get _text() {
      return sentText;
    }
  };
  return res;
}

function startTestServer(app: express.Express): Promise<{ server: http.Server; baseUrl: string }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('Failed to bind ephemeral port'));
        return;
      }
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
    server.on('error', reject);
  });
}

function stopTestServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

function rawHttpRequest(
  baseUrl: string,
  method: string,
  rawPath: string,
  headers: Record<string, string> = {},
  body?: string
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(baseUrl);
    const req = http.request(
      {
        hostname: u.hostname,
        port: Number(u.port),
        method,
        path: rawPath,
        headers
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: data
          });
        });
      }
    );
    req.on('error', reject);
    if (body !== undefined) {
      req.write(body);
    }
    req.end();
  });
}

// ============================================================================
// A. SUBSCRIBER PRIVACY
// ============================================================================

test('Phase A [A - Subscriber Privacy]: server.ts strips subscriber PII from public /api/slot-alert/status and restricts /api/admin/slot-alert/subscribers', () => {
  const serverSrc = fs.readFileSync(path.join(process.cwd(), 'server.ts'), 'utf8');

  // Public status endpoint must exist and NOT expose subscribers list
  const publicRouteStart = serverSrc.indexOf("app.get('/api/slot-alert/status'");
  const adminRouteStart = serverSrc.indexOf("app.get('/api/admin/slot-alert/subscribers'");
  assert.ok(publicRouteStart > 0, 'GET /api/slot-alert/status must exist');
  assert.ok(adminRouteStart > publicRouteStart, 'GET /api/admin/slot-alert/subscribers must exist');

  const publicBlock = serverSrc.slice(publicRouteStart, adminRouteStart);
  assert.equal(publicBlock.includes('subscribers:'), false, 'Public /api/slot-alert/status must not include subscribers array');
  assert.equal(publicBlock.includes('totalSubscribers'), true, 'Public /api/slot-alert/status must return aggregate totalSubscribers count');

  // Admin subscriber management route must enforce requireAdminAuth and no-store cache control
  const adminBlock = serverSrc.slice(adminRouteStart, adminRouteStart + 500);
  assert.equal(adminBlock.includes('requireAdminAuth'), true, 'GET /api/admin/slot-alert/subscribers must require admin authentication');
  assert.equal(adminBlock.includes('no-store'), true, 'Admin subscribers endpoint must disable caching');

  // Frontend AdminSlotAlertPage must call the authenticated admin route instead of public status
  const adminInlineSrc = fs.readFileSync(path.join(process.cwd(), 'src/pages/AdminInlineViews.tsx'), 'utf8');
  assert.equal(adminInlineSrc.includes("fetch('/api/admin/slot-alert/subscribers'"), true);
});

// ============================================================================
// B. PATH TRAVERSAL PROTECTION
// ============================================================================

test('Phase A [B - Path Traversal]: validateSafeSlug and resolveContainedMarkdownPath reject traversal, encoded sequences, null bytes, and symlinks', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'visaapply-phase-a-path-'));
  const contentDir = path.join(tmpRoot, 'content');
  const outsideFile = path.join(tmpRoot, 'secret-outside.md');
  fs.mkdirSync(contentDir, { recursive: true });
  fs.writeFileSync(outsideFile, '# Secret Outside File', 'utf8');
  fs.writeFileSync(path.join(contentDir, 'valid-guide-2026.md'), '# Valid Guide', 'utf8');

  const symlinkPath = path.join(contentDir, 'sneaky-link.md');
  fs.symlinkSync(outsideFile, symlinkPath);

  try {
    const maliciousInputs = [
      '../secret-outside',
      '../../etc/passwd',
      '..\\secret-outside',
      '%2e%2e%2fsecret-outside',
      '%2e%2e/secret-outside',
      '%252e%252e%252fsecret-outside',
      '..%2fsecret-outside',
      'valid-guide\0.txt',
      'valid-guide%00',
      '/etc/passwd',
      'sub/dir/file',
      '.hidden',
      '../content-evil/file',
      '   ',
      '',
      'a'.repeat(161),
      'slug with spaces',
      'slug$bad!'
    ];

    for (const bad of maliciousInputs) {
      const slugRes = validateSafeSlug(bad);
      assert.equal(slugRes.valid, false, `Expected validateSafeSlug to reject: ${JSON.stringify(bad)}`);

      const pathRes = resolveContainedMarkdownPath(contentDir, bad);
      assert.equal(pathRes.valid, false, `Expected resolveContainedMarkdownPath to reject: ${JSON.stringify(bad)}`);
    }

    // Symlink pointing outside contentDir must be rejected
    const symlinkRes = resolveContainedMarkdownPath(contentDir, 'sneaky-link');
    assert.equal(symlinkRes.valid, false, 'Symlink escaping contentDir must be rejected');

    // Valid slug resolves inside contentDir
    const okRes = resolveContainedMarkdownPath(contentDir, 'valid-guide-2026');
    assert.equal(okRes.valid, true);
    assert.equal(okRes.slug, 'valid-guide-2026');
    assert.equal(okRes.resolvedPath, path.resolve(contentDir, 'valid-guide-2026.md'));

    // Optional .md suffix stripping works for safe names only
    const okMdRes = resolveContainedMarkdownPath(contentDir, 'valid-guide-2026.md', { allowMdSuffix: true });
    assert.equal(okMdRes.valid, true);
    assert.equal(okMdRes.slug, 'valid-guide-2026');
    assert.equal(resolveContainedMarkdownPath(contentDir, '../secret-outside.md', { allowMdSuffix: true }).valid, false);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test('Phase A [B - Path Traversal HTTP]: live Express endpoints reject raw, encoded traversal, null bytes, and malformed slugs with 400', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'visaapply-phase-a-http-path-'));
  const contentDir = path.join(tmpRoot, 'content');
  const draftsDir = path.join(tmpRoot, 'drafts');
  fs.mkdirSync(contentDir, { recursive: true });
  fs.mkdirSync(draftsDir, { recursive: true });
  fs.writeFileSync(path.join(tmpRoot, 'outside.md'), 'SECRET', 'utf8');
  fs.writeFileSync(path.join(contentDir, 'india-to-usa-guide.md'), '# India to USA', 'utf8');
  fs.writeFileSync(path.join(draftsDir, 'pending-draft-1.md'), '# Draft 1', 'utf8');

  const app = express();
  app.use(express.json());
  app.use(securityHeadersMiddleware);

  app.get('/api/articles/:slug', (req, res) => {
    const target = resolveContainedMarkdownPath(contentDir, req.params.slug);
    if (!target.valid) return res.status(400).json({ error: target.reason });
    if (!fs.existsSync(target.resolvedPath)) return res.status(404).json({ error: 'Not found' });
    res.json({ slug: target.slug, content: fs.readFileSync(target.resolvedPath, 'utf8') });
  });

  app.post('/api/admin/approve', (req, res) => {
    const draftTarget = resolveContainedMarkdownPath(draftsDir, req.body?.slug);
    const pubTarget = resolveContainedMarkdownPath(contentDir, req.body?.slug);
    if (!draftTarget.valid || !pubTarget.valid) return res.status(400).json({ error: 'Invalid slug' });
    if (!fs.existsSync(draftTarget.resolvedPath)) return res.status(404).json({ error: 'Draft not found' });
    res.json({ success: true, slug: draftTarget.slug });
  });

  app.delete('/api/admin/drafts/:slug', (req, res) => {
    const draftTarget = resolveContainedMarkdownPath(draftsDir, req.params.slug);
    if (!draftTarget.valid) return res.status(400).json({ error: draftTarget.reason });
    res.json({ success: true, slug: draftTarget.slug });
  });

  const { server, baseUrl } = await startTestServer(app);
  try {
    // Encoded traversal on GET /api/articles/:slug
    const encRes = await rawHttpRequest(baseUrl, 'GET', '/api/articles/%2e%2e%2foutside');
    assert.equal(encRes.status, 400);

    const doubleEncRes = await rawHttpRequest(baseUrl, 'GET', '/api/articles/%252e%252e%252foutside');
    assert.equal(doubleEncRes.status, 400);

    const nullByteRes = await rawHttpRequest(baseUrl, 'GET', '/api/articles/india-to-usa-guide%00');
    assert.equal(nullByteRes.status, 400);

    // Valid slug succeeds
    const validRes = await rawHttpRequest(baseUrl, 'GET', '/api/articles/india-to-usa-guide');
    assert.equal(validRes.status, 200);
    assert.equal(JSON.parse(validRes.body).slug, 'india-to-usa-guide');

    // Traversal in POST /api/admin/approve body
    for (const badSlug of ['../outside', '%2e%2e%2foutside', 'draft\0.md', '..\\outside']) {
      const approveBad = await rawHttpRequest(
        baseUrl,
        'POST',
        '/api/admin/approve',
        { 'Content-Type': 'application/json' },
        JSON.stringify({ slug: badSlug })
      );
      assert.equal(approveBad.status, 400, `Expected 400 for approve slug ${badSlug}`);
    }

    // Valid approve passes validation
    const approveGood = await rawHttpRequest(
      baseUrl,
      'POST',
      '/api/admin/approve',
      { 'Content-Type': 'application/json' },
      JSON.stringify({ slug: 'pending-draft-1' })
    );
    assert.equal(approveGood.status, 200);

    // Encoded traversal on DELETE /api/admin/drafts/:slug
    const delBad = await rawHttpRequest(baseUrl, 'DELETE', '/api/admin/drafts/%2e%2e%2foutside');
    assert.equal(delBad.status, 400);
    assert.equal(fs.existsSync(path.join(tmpRoot, 'outside.md')), true, 'Outside file must remain untouched');
  } finally {
    await stopTestServer(server);
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }

  // Confirm server.ts actually wires resolveContainedMarkdownPath into all 3 routes
  const serverSrc = fs.readFileSync(path.join(process.cwd(), 'server.ts'), 'utf8');
  assert.ok(serverSrc.includes("app.get('/api/articles/:slug'") && serverSrc.includes('resolveContainedMarkdownPath(CONTENT_DIR, req.params.slug'));
  assert.ok(serverSrc.includes("app.post('/api/admin/approve'") && serverSrc.includes('resolveContainedMarkdownPath(DRAFTS_DIR, rawSlug)'));
  assert.ok(serverSrc.includes("app.delete('/api/admin/drafts/:slug'") && serverSrc.includes('resolveContainedMarkdownPath(DRAFTS_DIR, req.params.slug)'));
});

// ============================================================================
// C. DRAFT PRIVACY
// ============================================================================

test('Phase A [C - Draft Privacy]: GET /api/drafts requires admin auth and returns 401 when unauthenticated', async () => {
  const serverSrc = fs.readFileSync(path.join(process.cwd(), 'server.ts'), 'utf8');
  assert.equal(
    serverSrc.includes("app.get('/api/drafts', requireAdminAuth,"),
    true,
    'GET /api/drafts must enforce requireAdminAuth middleware'
  );
  const draftsIdx = serverSrc.indexOf("app.get('/api/drafts', requireAdminAuth,");
  const draftsSlice = serverSrc.slice(draftsIdx, draftsIdx + 300);
  assert.equal(draftsSlice.includes('no-store'), true, 'GET /api/drafts should set no-store Cache-Control');

  // Live Express verification of requireAdminAuth pattern on /api/drafts and /api/admin/slot-alert/subscribers
  const prevAdminPass = process.env.ADMIN_PASSWORD;
  process.env.ADMIN_PASSWORD = 'draft-privacy-test-pass';
  resetRevokedAdminSessions();

  const app = express();
  app.use(securityHeadersMiddleware);
  const authMw = (req: any, res: any, next: any) => {
    const auth = extractAdminAuthFromRequest(req);
    const check = verifyAdminSession(auth.token);
    if (!check.valid) return res.status(401).json({ success: false, error: 'Unauthorized' });
    next();
  };
  app.get('/api/drafts', authMw, (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, private');
    res.json({ drafts: [{ slug: 'internal-draft-1' }] });
  });
  app.get('/api/slot-alert/status', (_req, res) => {
    res.json({ success: true, totalSubscribers: 2, embassies: { 'US New Delhi': { status: 'Closed' } } });
  });
  app.get('/api/admin/slot-alert/subscribers', authMw, (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, private');
    res.json({ success: true, totalSubscribers: 2, subscribers: [{ id: '1', email: 'private@example.test' }] });
  });

  const { server, baseUrl } = await startTestServer(app);
  try {
    // Public status never leaks subscriber emails
    const pubStatus = await rawHttpRequest(baseUrl, 'GET', '/api/slot-alert/status');
    assert.equal(pubStatus.status, 200);
    assert.equal(pubStatus.body.includes('private@example.test'), false);
    assert.equal(JSON.parse(pubStatus.body).subscribers, undefined);
    assert.equal(JSON.parse(pubStatus.body).totalSubscribers, 2);

    // Unauthenticated requests to private endpoints return 401
    const unauthDrafts = await rawHttpRequest(baseUrl, 'GET', '/api/drafts');
    assert.equal(unauthDrafts.status, 401);
    const unauthSubs = await rawHttpRequest(baseUrl, 'GET', '/api/admin/slot-alert/subscribers');
    assert.equal(unauthSubs.status, 401);

    // Authenticated admin cookie succeeds
    const session = createAdminSession(undefined, { ttlSeconds: 300 });
    const cookie = `${ADMIN_SESSION_COOKIE_NAME}=${encodeURIComponent(session.token)}`;
    const authDrafts = await rawHttpRequest(baseUrl, 'GET', '/api/drafts', { cookie });
    assert.equal(authDrafts.status, 200);
    assert.ok(String(authDrafts.headers['cache-control']).includes('no-store'));

    const authSubs = await rawHttpRequest(baseUrl, 'GET', '/api/admin/slot-alert/subscribers', { cookie });
    assert.equal(authSubs.status, 200);
    assert.equal(JSON.parse(authSubs.body).subscribers.length, 1);
  } finally {
    await stopTestServer(server);
    if (prevAdminPass === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = prevAdminPass;
    resetRevokedAdminSessions();
  }
});

// ============================================================================
// D. ADMIN AUTHENTICATION (SIGNED SESSIONS, EXPIRY, REVOCATION, COOKIES, CSRF, NO LOCALSTORAGE)
// ============================================================================

test('Phase A [D - Admin Auth]: short-lived signed sessions, expiry, revocation, HttpOnly/Secure/SameSite=Lax cookies, CSRF, and zero storage tokens', async () => {
  const prevAdminPass = process.env.ADMIN_PASSWORD;
  const prevNodeEnv = process.env.NODE_ENV;
  resetRevokedAdminSessions();

  try {
    process.env.ADMIN_PASSWORD = 'phase-a-strong-admin-password';
    const fixedNow = 1_800_000_000_000;

    // 1. Two sessions for the same password have unique JTIs, unique CSRF tokens, and non-deterministic tokens
    const s1 = createAdminSession(undefined, { ttlSeconds: 300, nowMs: fixedNow });
    const s2 = createAdminSession(undefined, { ttlSeconds: 300, nowMs: fixedNow });
    assert.notEqual(s1.token, s2.token);
    assert.notEqual(s1.jti, s2.jti);
    assert.notEqual(s1.csrfToken, s2.csrfToken);

    // 2. Valid within TTL
    const validCheck = verifyAdminSession(s1.token, undefined, { nowMs: fixedNow + 60_000 });
    assert.equal(validCheck.valid, true);
    assert.equal(validCheck.payload?.jti, s1.jti);

    // 3. Rejects expired session after TTL
    const expiredCheck = verifyAdminSession(s1.token, undefined, { nowMs: fixedNow + 301_000 });
    assert.equal(expiredCheck.valid, false);
    assert.equal(expiredCheck.reason, 'EXPIRED');

    // 4. Rejects tampered signature or legacy static token
    const tampered = `${s1.token.slice(0, -4)}AAAA`;
    assert.equal(verifyAdminSession(tampered, undefined, { nowMs: fixedNow + 1000 }).valid, false);
    assert.equal(verifyAdminToken('legacy-static-hex-token-abcdef0123456789'), false);

    // 5. Revocation immediately invalidates an otherwise valid session
    const sLive = createAdminSession(undefined, { ttlSeconds: 600 });
    assert.equal(verifyAdminToken(sLive.token), true);
    assert.equal(revokeAdminSession(sLive.token), true);
    const revokedCheck = verifyAdminSession(sLive.token);
    assert.equal(revokedCheck.valid, false);
    assert.equal(revokedCheck.reason, 'REVOKED');

    // 6. Cookie attributes: HttpOnly, SameSite=Lax, Max-Age, and Secure in production
    const prodCookies = buildAdminSessionCookies(sLive, { isSecure: true });
    const sessionCookie = prodCookies.find((c) => c.startsWith(`${ADMIN_SESSION_COOKIE_NAME}=`))!;
    const csrfCookie = prodCookies.find((c) => c.startsWith(`${ADMIN_CSRF_COOKIE_NAME}=`))!;
    assert.ok(sessionCookie.includes('HttpOnly'));
    assert.ok(sessionCookie.includes('SameSite=Lax'));
    assert.ok(sessionCookie.includes('Secure'));
    assert.ok(csrfCookie.includes('SameSite=Lax'));
    assert.ok(csrfCookie.includes('Secure'));
    assert.equal(csrfCookie.includes('HttpOnly'), false, 'CSRF cookie must remain readable by same-origin JS for double-submit');

    const cleared = buildClearAdminSessionCookies({ isSecure: true });
    assert.equal(cleared.every((c) => c.includes('Max-Age=0') && c.includes('SameSite=Lax') && c.includes('Secure')), true);

    // 7. CSRF protection on state-changing requests
    const active = createAdminSession(undefined, { ttlSeconds: 600 });
    const activePayload = verifyAdminSession(active.token).payload!;
    const cookieHeader = `${ADMIN_SESSION_COOKIE_NAME}=${encodeURIComponent(active.token)}; ${ADMIN_CSRF_COOKIE_NAME}=${encodeURIComponent(active.csrfToken)}`;

    // Safe GET allowed without X-CSRF-Token
    assert.equal(verifyAdminCsrfRequest({ method: 'GET', headers: { cookie: cookieHeader } }, activePayload, 'cookie').valid, true);

    // POST missing X-CSRF-Token rejected
    assert.equal(
      verifyAdminCsrfRequest({ method: 'POST', headers: { host: 'www.visaapply.org', origin: 'https://www.visaapply.org', cookie: cookieHeader } }, activePayload, 'cookie').valid,
      false
    );

    // POST with mismatched X-CSRF-Token rejected
    assert.equal(
      verifyAdminCsrfRequest(
        { method: 'POST', headers: { host: 'www.visaapply.org', origin: 'https://www.visaapply.org', cookie: cookieHeader, 'x-csrf-token': 'wrong-token' } },
        activePayload,
        'cookie'
      ).valid,
      false
    );

    // POST with cross-origin Origin rejected even with valid CSRF token
    assert.equal(
      verifyAdminCsrfRequest(
        { method: 'POST', headers: { host: 'www.visaapply.org', origin: 'https://evil.attacker.example', cookie: cookieHeader, 'x-csrf-token': active.csrfToken } },
        activePayload,
        'cookie'
      ).valid,
      false
    );

    // POST with same-origin + matching X-CSRF-Token allowed
    assert.equal(
      verifyAdminCsrfRequest(
        { method: 'POST', headers: { host: 'www.visaapply.org', origin: 'https://www.visaapply.org', cookie: cookieHeader, 'x-csrf-token': active.csrfToken } },
        activePayload,
        'cookie'
      ).valid,
      true
    );

    // 8. api/admin.ts full login -> GET session -> DELETE logout + revocation flow in production mode
    process.env.NODE_ENV = 'production';
    const isolatedStore = new InMemoryRateLimitStore();
    const handler = createAdminHandler({ rateLimitStore: isolatedStore });

    const loginRes = createMockRes();
    await handler(
      {
        method: 'POST',
        headers: { host: 'www.visaapply.org', origin: 'https://www.visaapply.org', 'x-forwarded-for': '203.0.113.10' },
        body: { password: 'phase-a-strong-admin-password' }
      },
      loginRes
    );
    assert.equal(loginRes._status, 200);
    assert.equal(loginRes._body.authenticated, true);
    assert.equal(loginRes._body.token, undefined, 'Raw session token must NOT be returned in JSON body');
    assert.ok(loginRes._body.csrfToken);
    const setCookies: string[] = loginRes._headers['set-cookie'];
    assert.ok(Array.isArray(setCookies) && setCookies.length === 2);
    assert.ok(setCookies[0].includes('HttpOnly') && setCookies[0].includes('Secure') && setCookies[0].includes('SameSite=Lax'));

    const extractedToken = decodeURIComponent(setCookies[0].match(/^visaapply_admin_session=([^;]+)/)![1]);
    const extractedCsrf = decodeURIComponent(setCookies[1].match(/^visaapply_admin_csrf=([^;]+)/)![1]);
    const reqCookie = `${ADMIN_SESSION_COOKIE_NAME}=${encodeURIComponent(extractedToken)}; ${ADMIN_CSRF_COOKIE_NAME}=${encodeURIComponent(extractedCsrf)}`;

    // Verify GET session check succeeds
    const sessRes = createMockRes();
    await handler({ method: 'GET', headers: { cookie: reqCookie } }, sessRes);
    assert.equal(sessRes._status, 200);
    assert.equal(sessRes._body.authenticated, true);

    // Verify DELETE logout without CSRF token is rejected with 403
    const badLogoutRes = createMockRes();
    await handler({ method: 'DELETE', headers: { host: 'www.visaapply.org', origin: 'https://www.visaapply.org', cookie: reqCookie } }, badLogoutRes);
    assert.equal(badLogoutRes._status, 403);

    // Verify DELETE logout WITH valid CSRF token succeeds and revokes token
    const goodLogoutRes = createMockRes();
    await handler(
      {
        method: 'DELETE',
        headers: {
          host: 'www.visaapply.org',
          origin: 'https://www.visaapply.org',
          cookie: reqCookie,
          'x-csrf-token': extractedCsrf
        }
      },
      goodLogoutRes
    );
    assert.equal(goodLogoutRes._status, 200);

    // Subsequent GET session check with revoked cookie returns 401
    const afterLogoutRes = createMockRes();
    await handler({ method: 'GET', headers: { cookie: reqCookie } }, afterLogoutRes);
    assert.equal(afterLogoutRes._status, 401);

    // 9. Static check: zero localStorage/sessionStorage writes of admin auth tokens across src/
    const filesToCheck = [
      'src/App.tsx',
      'src/utils/adminAuth.ts',
      'src/pages/VisaDetailEditorPage.tsx',
      'src/pages/VisaManagementAdminPage.tsx',
      'src/components/admin/ClaimsManager.tsx',
      'src/components/admin/VersionHistoryManager.tsx',
      'src/pages/ImmigrationUpdatesPage.tsx',
      'src/services/immigrationAutoSync.ts'
    ];
    for (const rel of filesToCheck) {
      const content = fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
      assert.equal(
        /(?:localStorage|sessionStorage)\.setItem\([^)]*(?:admin_token|adminToken|visaapply_admin)/i.test(content),
        false,
        `${rel} must not store admin auth tokens in localStorage/sessionStorage`
      );
      assert.equal(
        /(?:localStorage|sessionStorage)\.getItem\([^)]*(?:admin_token|adminToken|visaapply_admin)/i.test(content),
        false,
        `${rel} must not read admin auth tokens from localStorage/sessionStorage`
      );
    }

    // Also verify extractAdminAuthFromRequest prefers cookie source
    const extractedAuth = extractAdminAuthFromRequest({ headers: { cookie: reqCookie } });
    assert.equal(extractedAuth.source, 'cookie');
    assert.equal(extractedAuth.token, extractedToken);
  } finally {
    if (prevAdminPass === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = prevAdminPass;
    if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNodeEnv;
    resetRevokedAdminSessions();
  }
});

// ============================================================================
// E. RATE LIMITING
// ============================================================================

test('Phase A [E - Rate Limiting]: enforces HTTP 429 on /api/admin/login, /api/slot-alert/subscribe, /api/ask-faq, and /api/ai-eligibility', async () => {
  const prevAdminPass = process.env.ADMIN_PASSWORD;
  process.env.ADMIN_PASSWORD = 'rate-limit-test-password';

  try {
    // 1. /api/admin (login) rate limit
    const adminStore = new InMemoryRateLimitStore();
    const adminHandler = createAdminHandler({ rateLimitStore: adminStore });
    for (let i = 0; i < RATE_LIMIT_POLICIES.adminLogin.limit; i++) {
      const r = createMockRes();
      await adminHandler(
        { method: 'POST', headers: { 'x-forwarded-for': '198.51.100.1' }, body: { password: 'wrong' } },
        r
      );
      assert.equal(r._status, 401);
    }
    const blockedLogin = createMockRes();
    await adminHandler(
      { method: 'POST', headers: { 'x-forwarded-for': '198.51.100.1' }, body: { password: 'wrong' } },
      blockedLogin
    );
    assert.equal(blockedLogin._status, 429);
    assert.ok(blockedLogin._headers['retry-after']);
    assert.equal(blockedLogin._headers['x-ratelimit-remaining'], '0');

    // 2. /api/ai-eligibility rate limit
    const eligStore = new InMemoryRateLimitStore();
    const eligHandler = createAiEligibilityHandler({ rateLimitStore: eligStore });
    for (let i = 0; i < RATE_LIMIT_POLICIES.aiEligibility.limit; i++) {
      const r = createMockRes();
      await eligHandler(
        {
          method: 'POST',
          headers: { 'x-forwarded-for': '198.51.100.2' },
          body: { nationality: 'IN', destination: 'US', purpose: 'tourism', savingsUsd: 5000, monthlyIncomeUsd: 2000, travelHistory: 'none', hasJobOrBusiness: true }
        },
        r
      );
      assert.equal(r._status, 200);
    }
    const blockedElig = createMockRes();
    await eligHandler(
      { method: 'POST', headers: { 'x-forwarded-for': '198.51.100.2' }, body: { nationality: 'IN', destination: 'US' } },
      blockedElig
    );
    assert.equal(blockedElig._status, 429);
    assert.ok(blockedElig._headers['retry-after']);

    // 3. Express middleware rate limits for /api/slot-alert/subscribe and /api/ask-faq
    const subStore = new InMemoryRateLimitStore();
    const faqStore = new InMemoryRateLimitStore();
    const app = express();
    app.use(express.json());
    app.post('/api/slot-alert/subscribe', createRateLimitMiddleware({ name: 'slot-alert-subscribe', limit: 3, windowMs: 60_000 }, subStore), (_req, res) => {
      res.json({ success: true });
    });
    app.get('/api/ask-faq', createRateLimitMiddleware({ name: 'ask-faq', limit: 3, windowMs: 60_000 }, faqStore), (_req, res) => {
      res.json({ answer: 'ok' });
    });

    const { server, baseUrl } = await startTestServer(app);
    try {
      for (let i = 0; i < 3; i++) {
        const subOk = await rawHttpRequest(baseUrl, 'POST', '/api/slot-alert/subscribe', { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.3' }, JSON.stringify({ email: 'a@example.com' }));
        assert.equal(subOk.status, 200);
      }
      const subBlocked = await rawHttpRequest(baseUrl, 'POST', '/api/slot-alert/subscribe', { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.3' }, JSON.stringify({ email: 'a@example.com' }));
      assert.equal(subBlocked.status, 429);
      assert.ok(subBlocked.headers['retry-after']);

      for (let i = 0; i < 3; i++) {
        const faqOk = await rawHttpRequest(baseUrl, 'GET', '/api/ask-faq?q=visa', { 'x-forwarded-for': '198.51.100.4' });
        assert.equal(faqOk.status, 200);
      }
      const faqBlocked = await rawHttpRequest(baseUrl, 'GET', '/api/ask-faq?q=visa', { 'x-forwarded-for': '198.51.100.4' });
      assert.equal(faqBlocked.status, 429);
    } finally {
      await stopTestServer(server);
    }

    // 4. ExternalRestRateLimitStore degrades safely to in-memory fallback when external store errors
    const failingFetch: any = async () => {
      throw new Error('network unreachable');
    };
    const extStore = new ExternalRestRateLimitStore('https://redis.example.test', 'secret', failingFetch);
    const res1 = await enforceRateLimit({ headers: { 'x-forwarded-for': '198.51.100.5' } }, createMockRes(), { name: 'ext-test', limit: 1, windowMs: 60_000 }, extStore);
    const res2 = await enforceRateLimit({ headers: { 'x-forwarded-for': '198.51.100.5' } }, createMockRes(), { name: 'ext-test', limit: 1, windowMs: 60_000 }, extStore);
    assert.equal(res1, true);
    assert.equal(res2, false);

    // 5. Confirm server.ts attaches rate limit middleware to all required routes
    const serverSrc = fs.readFileSync(path.join(process.cwd(), 'server.ts'), 'utf8');
    assert.equal(serverSrc.includes('adminLoginRateLimiter'), true);
    assert.equal(serverSrc.includes('slotAlertSubscribeRateLimiter'), true);
    assert.equal(serverSrc.includes('askFaqRateLimiter'), true);
  } finally {
    if (prevAdminPass === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = prevAdminPass;
  }
});

// ============================================================================
// F. SECURITY HEADERS
// ============================================================================

test('Phase A [F - Security Headers]: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy applied on HTML and API responses', async () => {
  const htmlHeaders = getSecurityHeaders({ isApi: false });
  const apiHeaders = getSecurityHeaders({ isApi: true });

  for (const requiredHeader of [
    'Content-Security-Policy',
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy'
  ]) {
    assert.ok(htmlHeaders[requiredHeader], `HTML security headers missing ${requiredHeader}`);
    assert.ok(apiHeaders[requiredHeader], `API security headers missing ${requiredHeader}`);
  }

  assert.equal(htmlHeaders['X-Content-Type-Options'], 'nosniff');
  assert.equal(htmlHeaders['X-Frame-Options'], 'SAMEORIGIN');
  assert.equal(apiHeaders['X-Frame-Options'], 'DENY');
  assert.equal(htmlHeaders['Referrer-Policy'], 'strict-origin-when-cross-origin');
  assert.ok(htmlHeaders['Strict-Transport-Security'].includes('max-age=31536000'));

  // External script allowlist is explicitly included in HTML CSP
  for (const origin of CSP_EXTERNAL_SCRIPT_ALLOWLIST) {
    assert.equal(htmlHeaders['Content-Security-Policy'].includes(origin), true, `CSP missing allowlisted script origin ${origin}`);
  }

  // Verify api/render.ts sets security headers
  const renderRes = createMockRes();
  renderHandler({ query: { path: '/in-to-us' }, url: '/in-to-us', headers: {} }, renderRes);
  assert.equal(renderRes._status, 200);
  assert.ok(renderRes._headers['content-security-policy']);
  assert.ok(renderRes._headers['strict-transport-security']);
  assert.equal(renderRes._headers['x-content-type-options'], 'nosniff');
  assert.equal(renderRes._headers['x-frame-options'], 'SAMEORIGIN');
  assert.equal(renderRes._headers['referrer-policy'], 'strict-origin-when-cross-origin');

  // Verify Express middleware distinguishes /api vs HTML
  const app = express();
  app.use(securityHeadersMiddleware);
  app.get('/api/ping', (_req, res) => res.json({ ok: true }));
  app.get('/page', (_req, res) => res.type('html').send('<html><body>ok</body></html>'));
  const { server, baseUrl } = await startTestServer(app);
  try {
    const apiPing = await rawHttpRequest(baseUrl, 'GET', '/api/ping');
    assert.equal(apiPing.headers['x-frame-options'], 'DENY');
    assert.equal(apiPing.headers['x-content-type-options'], 'nosniff');
    assert.ok(apiPing.headers['content-security-policy']?.includes("default-src 'none'"));

    const htmlPage = await rawHttpRequest(baseUrl, 'GET', '/page');
    assert.equal(htmlPage.headers['x-frame-options'], 'SAMEORIGIN');
    assert.ok(htmlPage.headers['content-security-policy']?.includes("default-src 'self'"));
    assert.ok(htmlPage.headers['strict-transport-security']?.includes('max-age=31536000'));
  } finally {
    await stopTestServer(server);
  }
});

// ============================================================================
// G. SAFE ERROR HANDLING
// ============================================================================

test('Phase A [G - Error Handling]: strips raw internal err.message from HTTP 500 responses and redacts server-side diagnostics', () => {
  const secretErr = new Error(
    'SQLITE_CANTOPEN: postgres://admin:SuperSecretPass@ep-db.neon.tech/neondb failed with Bearer secret-token-1234567890'
  );

  const jsonRes = createMockRes();
  const reqId = sendSafeServerError(jsonRes, 'test-db-route', secretErr);
  assert.equal(jsonRes._status, 500);
  assert.equal(jsonRes._body.success, false);
  assert.equal(jsonRes._body.error, 'Internal server error');
  assert.equal(jsonRes._body.requestId, reqId);
  const serialized = JSON.stringify(jsonRes._body);
  assert.equal(serialized.includes('SuperSecretPass'), false);
  assert.equal(serialized.includes('SQLITE_CANTOPEN'), false);
  assert.equal(serialized.includes('secret-token-1234567890'), false);

  const textRes = createMockRes();
  sendSafeTextServerError(textRes, 'test-sitemap', secretErr, 'Failed to generate sitemap');
  assert.equal(textRes._status, 500);
  assert.equal(textRes._text, 'Failed to generate sitemap');
  assert.equal(textRes._text.includes('SuperSecretPass'), false);

  // Operational events record must also be redacted
  const recent = getRecentOperationalEvents(10);
  const recorded = recent.find((e) => e.message.includes(reqId));
  assert.ok(recorded, 'Expected operational event to be logged');
  assert.equal(recorded.message.includes('SuperSecretPass'), false);
  assert.equal(recorded.message.includes('secret-token-1234567890'), false);

  // Static audit of server.ts: zero raw res.status(500).json({ ... err.message }) or res.status(500).send(err.message)
  const serverSrc = fs.readFileSync(path.join(process.cwd(), 'server.ts'), 'utf8');
  assert.equal(
    /res\.status\(\s*500\s*\)\.(?:json|send)\([^)]*(?:err|e|error)\.message/i.test(serverSrc),
    false,
    'server.ts must not leak raw err.message in HTTP 500 responses'
  );
});

// ============================================================================
// H. EMAIL SECURITY
// ============================================================================

test('Phase A [H - Email Security]: escapes HTML variables, enforces public HTTPS booking links, and fails honestly when RESEND_API_KEY is unset', async () => {
  // 1. HTML escaping utility
  assert.equal(
    escapeHtml('<script>alert("xss")</script> & \'test\''),
    '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#39;test&#39;'
  );

  // 2. Booking link validation
  assert.equal(validateHttpsBookingLink('https://www.usvisascheduling.com/'), 'https://www.usvisascheduling.com/');
  assert.equal(validateHttpsBookingLink('http://insecure.example.com/book'), null);
  assert.equal(validateHttpsBookingLink('javascript:alert(1)'), null);
  assert.equal(validateHttpsBookingLink('data:text/html,<script>alert(1)</script>'), null);
  assert.equal(validateHttpsBookingLink('https://user:pass@example.com/book'), null);
  assert.equal(validateHttpsBookingLink('https://127.0.0.1/admin'), null);
  assert.equal(validateHttpsBookingLink('https://localhost:3000/slot'), null);
  assert.equal(validateHttpsBookingLink('https://192.168.1.5/slot'), null);

  // 3. Localized email templates escape HTML injection and strip CRLF from subjects
  const maliciousEmbassy = 'New Delhi <script>alert(1)</script>\r\nBcc: attacker@evil.example';
  const maliciousDate = '2026-12-01" onmouseover="alert(2)';
  const built = buildLocalizedSlotAlertEmail(
    'IN',
    maliciousEmbassy,
    maliciousDate,
    'https://www.usvisascheduling.com/en-US/'
  );
  assert.equal(built.html.includes('<script>'), false);
  assert.equal(built.html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), true);
  assert.equal(built.html.includes('" onmouseover="'), false);
  assert.equal(built.html.includes('&quot; onmouseover=&quot;'), true);
  assert.equal(/[\r\n]/.test(built.subject), false, 'Email subject must not contain CR/LF header injection');
  assert.equal(built.html.includes('href="https://www.usvisascheduling.com/en-US/"'), true);

  // Arabic & French localized templates also escape properly
  const builtAr = buildLocalizedSlotAlertEmail('AE', '<b>Dubai</b>', '2026-12-02', 'https://ais.usvisa-info.com/');
  assert.equal(builtAr.html.includes('<b>Dubai</b>'), false);
  assert.equal(builtAr.html.includes('&lt;b&gt;Dubai&lt;/b&gt;'), true);

  const builtFr = buildLocalizedSlotAlertEmail('FR', '<img src=x onerror=alert(1)>', '2026-12-03', 'https://france-visas.gouv.fr/');
  assert.equal(builtFr.html.includes('<img'), false);
  assert.equal(builtFr.html.includes('&lt;img'), true);

  // Rejects non-HTTPS booking links
  assert.throws(
    () => buildLocalizedSlotAlertEmail('IN', 'New Delhi', '2026-12-01', 'javascript:alert(1)'),
    /INVALID_BOOKING_LINK/
  );
  assert.throws(
    () => buildLocalizedSlotAlertEmail('IN', 'New Delhi', '2026-12-01', 'http://usvisascheduling.com/'),
    /INVALID_BOOKING_LINK/
  );

  // 4. Unconfigured RESEND_API_KEY must NOT silently report { success: true, mock: true }
  const prevResend = process.env.RESEND_API_KEY;
  try {
    delete process.env.RESEND_API_KEY;
    const unconfiguredRes = await deliverEmailViaResend('user@example.com', 'Slot Open', '<p>Hello</p>');
    assert.equal(unconfiguredRes.success, false);
    assert.equal(unconfiguredRes.configured, false);
    assert.equal((unconfiguredRes as any).mock, undefined);

    // Invalid email rejected cleanly
    assert.equal(isValidEmailAddress('not-an-email'), false);
    const invalidRecipient = await deliverEmailViaResend('bad-email', 'Subject', '<p>Hi</p>', { apiKey: 're_test_key' });
    assert.equal(invalidRecipient.success, false);

    // Legitimate configured delivery succeeds through sendFn
    let capturedPayload: any = null;
    const okRes = await deliverEmailViaResend(
      'applicant@example.org',
      'Slot Alert\r\nInjected: nope',
      built.html,
      {
        apiKey: 're_test_configured_key',
        sendFn: async (payload) => {
          capturedPayload = payload;
          return { id: 'msg_123' };
        }
      }
    );
    assert.equal(okRes.success, true);
    assert.equal(okRes.configured, true);
    assert.ok(capturedPayload);
    assert.equal(/[\r\n]/.test(capturedPayload.subject), false);
    assert.deepEqual(capturedPayload.to, ['applicant@example.org']);
  } finally {
    if (prevResend === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = prevResend;
  }
});
