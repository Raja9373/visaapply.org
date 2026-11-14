import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { applyRestrictedCorsHeaders, verifyCronAuth } from '../src/utils/authSecurity';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-4-hydrogen';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyRestrictedCorsHeaders(
    req,
    res,
    'GET, POST, OPTIONS',
    'Content-Type, Authorization, X-Cron-Secret'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = verifyCronAuth(req, { allowedMethods: ['GET', 'POST'] });
  if (!auth.authorized) {
    return res.status(auth.statusCode).json({
      success: false,
      status: auth.status,
      error: auth.message
    });
  }

  try {
    const GEMINI_KEY = (process.env.GEMINI_API_KEY || '').trim();
    if (!GEMINI_KEY || GEMINI_KEY === 'dummy_key') {
      return res.status(503).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured in environment.'
      });
    }

    const ai = new GoogleGenAI({
      apiKey: GEMINI_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Trending visa topics for today
    const topics = [
      { from: 'India', to: 'UAE', type: 'Dubai Tourist Visa' },
      { from: 'India', to: 'Canada', type: 'Work Visa' },
      { from: 'India', to: 'USA', type: 'Student Visa' },
      { from: 'India', to: 'UK', type: 'Visitor Visa' },
      { from: 'USA', to: 'Schengen', type: 'Tourist Visa' }
    ];

    const drafts = [];
    const failedTopics: string[] = [];
    const uniqueSuffix = Date.now().toString(36);

    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const prompt = `Write a detailed 800-word SEO visa guide for ${topic.from} to ${topic.to} ${topic.type} 2026. Include: fees, documents, processing time, eligibility, application steps, tips. Use markdown. Make it helpful, accurate, human-like. Only cite verifiable consular facts. Title: ${topic.from} to ${topic.to} ${topic.type} Guide 2026`;

      let content = '';
      const maxRetries = 4;
      const timeoutMs = 30000;
      const maxDelayMs = 12000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        let timeoutHandle: any;
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
          });
          const apiPromise = ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW
              }
            }
          });
          const response: any = await Promise.race([apiPromise, timeoutPromise]);
          clearTimeout(timeoutHandle);

          if (response?.text && String(response.text).trim().length > 100) {
            content = String(response.text).trim();
            break;
          }
        } catch {
          clearTimeout(timeoutHandle);
          if (attempt < maxRetries) {
            const delay = Math.min(maxDelayMs, Math.round(1000 * Math.pow(2, attempt - 1) + Math.random() * 350));
            await new Promise((r) => setTimeout(r, delay));
          }
        }
      }

      if (!content) {
        failedTopics.push(`${topic.from} to ${topic.to} ${topic.type}`);
        continue;
      }

      const randomId = Math.random().toString(36).substring(2, 7);
      drafts.push({
        id: `draft-${uniqueSuffix}-${i}-${randomId}`,
        title: `${topic.from} to ${topic.to} ${topic.type} 2026 - Complete Guide (${randomId})`,
        route: `${topic.from.toLowerCase()}-to-${topic.to.toLowerCase()}-${topic.type.toLowerCase().replace(/\s+/g, '-')}-${randomId}`,
        visaType: topic.type,
        content,
        date: new Date().toISOString(),
        status: 'PENDING_HUMAN_REVIEW',
        reviewRequired: true,
        autoPublished: false,
        fees: 'Verify on official embassy portal before publication',
        docs: 'Passport, Financial Proofs, Application Form'
      });
    }

    if (drafts.length === 0) {
      return res.status(502).json({
        success: false,
        error: 'Gemini generation failed for all topics; zero drafts created.',
        failedTopics
      });
    }

    return res.status(200).json({
      success: true,
      message: `Generated ${drafts.length} drafts pending human review`,
      drafts,
      count: drafts.length,
      failedTopics
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Cron execution failed' });
  }
}
