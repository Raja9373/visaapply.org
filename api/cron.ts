import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY || GEMINI_KEY === 'dummy_key') {
      return res.status(200).json({ success: false, message: 'GEMINI_API_KEY missing in env' });
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
      { from: "India", to: "UAE", type: "Dubai Tourist Visa" },
      { from: "India", to: "Canada", type: "Work Visa" },
      { from: "India", to: "USA", type: "Student Visa" },
      { from: "India", to: "UK", type: "Visitor Visa" },
      { from: "USA", to: "Schengen", type: "Tourist Visa" }
    ];

    const drafts = [];
    const uniqueSuffix = Date.now().toString(36);

    for (let i = 0; i < 5; i++) {
      const topic = topics[i];
      const prompt = `Write a detailed 800-word SEO visa guide for ${topic.from} to ${topic.to} ${topic.type} 2026. Include: fees, documents, processing time, eligibility, application steps, tips. Use markdown. Make it helpful, accurate, human-like. Title: ${topic.from} to ${topic.to} ${topic.type} Guide 2026`;

      let content = `Sample guide for ${topic.from} to ${topic.to} ${topic.type}`;
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
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              thinkingConfig: {
                thinkingLevel: ThinkingLevel.LOW
              }
            }
          });
          const response: any = await Promise.race([apiPromise, timeoutPromise]);
          clearTimeout(timeoutHandle);

          if (response?.text) {
            content = response.text;
            break;
          }
        } catch {
          clearTimeout(timeoutHandle);
          if (attempt < maxRetries) {
            const delay = Math.min(maxDelayMs, Math.round(1000 * Math.pow(2, attempt - 1) + Math.random() * 350));
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }

      const randomId = Math.random().toString(36).substring(2, 7);
      drafts.push({
        id: `draft-${uniqueSuffix}-${i}-${randomId}`,
        title: `${topic.from} to ${topic.to} ${topic.type} 2026 - Complete Guide (${randomId})`,
        route: `${topic.from.toLowerCase()}-to-${topic.to.toLowerCase()}-${topic.type.toLowerCase().replace(/\s+/g, '-')}-${randomId}`,
        visaType: topic.type,
        content: content,
        date: new Date().toISOString(),
        status: 'draft',
        fees: 'Standard Govt Fees',
        docs: 'Passport, Financial Proofs, Application Form'
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Generated ${drafts.length} drafts`,
      drafts: drafts,
      count: drafts.length
    });

  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
