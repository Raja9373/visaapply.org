import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DEFAULT_PUBLISHED_GUIDES } from '../src/data/defaultArticles';
import { applyRestrictedCorsHeaders } from '../src/utils/authSecurity';

export default (req: VercelRequest, res: VercelResponse) => {
  applyRestrictedCorsHeaders(req, res, 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(200).json({
    published: DEFAULT_PUBLISHED_GUIDES,
    drafts: [],
    total: DEFAULT_PUBLISHED_GUIDES.length
  });
};
