import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const adminPass = (process.env.ADMIN_PASSWORD || '').trim();
  if (!adminPass) {
    return res.status(503).json({
      success: false,
      authenticated: false,
      message: 'ADMIN_PASSWORD environment variable is not configured.'
    });
  }

  const expectedToken = crypto.createHmac('sha256', adminPass).update('visaapply-admin-v1').digest('hex');

  if (req.method === 'GET') {
    const authHeader = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    const tokenHeader = String(req.headers['x-admin-token'] || '').trim();
    const token = authHeader || tokenHeader;
    if (token && token === expectedToken) {
      return res.status(200).json({ success: true, authenticated: true });
    }
    return res.status(401).json({ success: false, authenticated: false });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (body?.password && String(body.password) === adminPass) {
    return res.status(200).json({ success: true, authenticated: true, token: expectedToken });
  }
  return res.status(401).json({ success: false, authenticated: false, message: 'Invalid admin password' });
};

