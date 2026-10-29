import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = req.query || {};
  const from = (query.from as string) || 'IN';
  const to = (query.to as string) || 'US';
  const type = (query.type as string) || 'tourist';

  try {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
      return res.status(200).json({
        faqs: [
          { question: `What are the photo and passport requirements for a ${type} visa from ${from} to ${to}?`, answer: `You need a passport valid for at least 6 months beyond your planned stay with at least two blank pages, and recent passport-sized color photographs adhering to official specifications.` },
          { question: `How long does processing take for a ${type} visa to ${to}?`, answer: `Standard processing typically takes between 15 to 30 business days, though expedited options may be available depending on your nationality and consulate workload.` },
          { question: `Can I extend my ${type} visa once I arrive in ${to}?`, answer: `Visa extensions depend on the specific visa subclass. Generally, tourist and visitor visas cannot be extended from within the country without exiting and reapplying.` }
        ]
      });
    }

    const prompt = `Generate 4 frequently asked questions (FAQs) with detailed answers for traveling from ${from} to ${to} on a ${type} visa. Return valid JSON only in this exact format: [{"question": "...", "answer": "..."}]`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let faqs = [];
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        faqs = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      faqs = [
        { question: `What are the financial requirements for a ${type} visa to ${to}?`, answer: `You must demonstrate sufficient funds (typically bank statements for the last 3-6 months) to cover your entire stay without working locally.` },
        { question: `Do I need travel insurance for a ${type} visa from ${from} to ${to}?`, answer: `Yes, comprehensive travel and medical insurance covering emergency repatriation is mandatory for most international visa applications.` }
      ];
    }

    return res.status(200).json({ faqs });
  } catch (err: any) {
    return res.status(200).json({
      faqs: [
        { question: `What is the application procedure for a ${type} visa from ${from} to ${to}?`, answer: `The application process involves submitting online forms, paying official fees, booking a biometric appointment, and attending an interview if required.` }
      ]
    });
  }
}
