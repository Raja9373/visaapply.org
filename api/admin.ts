import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyRestrictedCorsHeaders,
  deriveAdminToken,
  verifyAdminPassword,
  verifyAdminToken
} from '../src/utils/authSecurity';

export default (req: VercelRequest, res: VercelResponse) => {
  applyRestrictedCorsHeaders(
    req,
    res,
    'POST, GET, OPTIONS',
    'Content-Type, Authorization, X-Admin-Token'
  );
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET' && req.method !== 'POST') {
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

  if (req.method === 'GET') {
    const authHeader = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    const tokenHeader = String(req.headers['x-admin-token'] || '').trim();
    const token = authHeader || tokenHeader;
    if (token && verifyAdminToken(token, adminPass)) {
      return res.status(200).json({ success: true, authenticated: true });
    }
    return res.status(401).json({ success: false, authenticated: false });
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
    const token = deriveAdminToken(adminPass);
    return res.status(200).json({ success: true, authenticated: true, token });
  }
  return res.status(401).json({ success: false, authenticated: false, message: 'Invalid admin password' });
};

