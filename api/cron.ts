import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      return res.status(200).json({ success: false, message: 'GEMINI_API_KEY missing in env' });
    }

    // Trending visa topics for today
    const topics = [
      { from: "India", to: "UAE", type: "Dubai Tourist Visa" },
      { from: "India", to: "Canada", type: "Work Visa" },
      { from: "India", to: "USA", type: "Student Visa" },
      { from: "India", to: "UK", type: "Visitor Visa" },
      { from: "USA", to: "Schengen", type: "Tourist Visa" }
    ];

    const drafts = [];

    for (let i = 0; i < 5; i++) {
      const topic = topics[i];
      const prompt = `Write a detailed 800-word SEO visa guide for ${topic.from} to ${topic.to} ${topic.type} 2026. Include: fees, documents, processing time, eligibility, application steps, tips. Use markdown. Make it helpful, accurate, human-like. Title: ${topic.from} to ${topic.to} ${topic.type} Guide 2026`;

      // Call Gemini API
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const geminiData = await geminiRes.json();
      const content = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || `Sample guide for ${topic.from} to ${topic.to} ${topic.type}`;

      drafts.push({
        id: `draft-${Date.now()}-${i}`,
        title: `${topic.from} to ${topic.to} ${topic.type} 2026 - Complete Guide`,
        route: `${topic.from.toLowerCase()}-to-${topic.to.toLowerCase()}-${topic.type.toLowerCase().replace(/\s+/g, '-')}`,
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
