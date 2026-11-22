import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyRestrictedCorsHeaders,
  buildAdminSessionCookies,
  buildClearAdminSessionCookies,
  createAdminSession,
  extractAdminAuthFromRequest,
  isSecureRequest,
  revokeAdminSession,
  verifyAdminCsrfRequest,
  verifyAdminPassword,
  verifyAdminSession
} from '../src/utils/authSecurity';
import {
  RATE_LIMIT_POLICIES,
  type RateLimitStore,
  applySecurityHeaders,
  defaultRateLimitStore,
  enforceRateLimit
} from '../src/utils/securityHardening';

export function createAdminHandler(options?: { rateLimitStore?: RateLimitStore }) {
  const rateLimitStore = options?.rateLimitStore ?? defaultRateLimitStore;

  return async (req: VercelRequest, res: VercelResponse) => {
    applySecurityHeaders(res, { isApi: true });
    applyRestrictedCorsHeaders(
      req,
      res,
      'POST, GET, DELETE, OPTIONS',
      'Content-Type, Authorization, X-Admin-Token, X-CSRF-Token, X-Requested-With'
    );
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'DELETE') {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const adminPass = (process.env.ADMIN_PASSWORD || '').trim();
    if (!adminPass) {
      return res.status(503).json({
        success: false,
        authenticated: false,
        message: 'ADMIN_PASSWORD environment variable is not configured.'
      });
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    if (req.method === 'GET') {
      const auth = extractAdminAuthFromRequest(req);
      const session = verifyAdminSession(auth.token, adminPass);
      if (session.valid && session.payload) {
        return res.status(200).json({
          success: true,
          authenticated: true,
          csrfToken: session.payload.csrf,
          expiresAt: session.payload.exp
        });
      }
      return res.status(401).json({ success: false, authenticated: false });
    }

    if (req.method === 'DELETE') {
      const auth = extractAdminAuthFromRequest(req);
      const session = verifyAdminSession(auth.token, adminPass);
      if (session.valid && session.payload) {
        const csrfCheck = verifyAdminCsrfRequest(req, session.payload, auth.source);
        if (!csrfCheck.valid) {
          return res.status(403).json({
            success: false,
            error: csrfCheck.reason || 'CSRF validation failed.'
          });
        }
        revokeAdminSession(auth.token, adminPass);
      }
      res.setHeader('Set-Cookie', buildClearAdminSessionCookies({ isSecure: isSecureRequest(req as any) }));
      return res.status(200).json({ success: true, authenticated: false });
    }

    // POST login: enforce rate limiting and Origin CSRF guard
    const allowed = await enforceRateLimit(req, res, RATE_LIMIT_POLICIES.adminLogin, rateLimitStore);
    if (!allowed) return;

    const originCheck = verifyAdminCsrfRequest(req, undefined, 'none');
    if (!originCheck.valid) {
      return res.status(403).json({
        success: false,
        authenticated: false,
        message: originCheck.reason || 'Cross-origin login request rejected.'
      });
    }

    let body: any = {};
    if (typeof req.body === 'string') {
      try {
        body = req.body ? JSON.parse(req.body) : {};
      } catch {
        return res.status(400).json({ success: false, authenticated: false, message: 'Invalid JSON body' });
      }
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    }

    if (verifyAdminPassword(body?.password, adminPass)) {
      const session = createAdminSession(adminPass);
      res.setHeader(
        'Set-Cookie',
        buildAdminSessionCookies(session, { isSecure: isSecureRequest(req as any) })
      );
      return res.status(200).json({
        success: true,
        authenticated: true,
        csrfToken: session.csrfToken,
        expiresAt: session.expiresAt
      });
    }

    return res.status(401).json({
      success: false,
      authenticated: false,
      message: 'Invalid admin password'
    });
  };
}

export default createAdminHandler();
