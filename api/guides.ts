import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DEFAULT_PUBLISHED_GUIDES } from '../src/data/defaultArticles';

export default (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    published: DEFAULT_PUBLISHED_GUIDES,
    drafts: [],
    total: DEFAULT_PUBLISHED_GUIDES.length
  });
};
