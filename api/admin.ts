import type { VercelRequest, VercelResponse } from '@vercel/node';
export default (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const adminPass = process.env.ADMIN_PASSWORD || 'Alokms98';
  if (body?.password === adminPass) return res.status(200).json({ success: true });
  return res.status(401).json({ success: false });
};
