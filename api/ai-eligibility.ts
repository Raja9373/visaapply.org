import type { VercelRequest, VercelResponse } from '@vercel/node';
import handleAiEligibilityRequest from '../src/api/aiEligibility.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handleAiEligibilityRequest(req, res);
}
