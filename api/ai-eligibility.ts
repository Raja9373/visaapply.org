import type { VercelRequest, VercelResponse } from '@vercel/node';
import handleAiEligibilityRequest from '../src/api/aiEligibility';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handleAiEligibilityRequest(req, res);
}
