import type { VercelRequest, VercelResponse } from '@vercel/node';
import handleFaqRequest from '../src/api/faq';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handleFaqRequest(req, res);
}
