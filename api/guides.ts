import type { VercelRequest, VercelResponse } from '@vercel/node';
export default (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({ published: [], drafts: [], total: 0 });
};
