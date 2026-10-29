import { GoogleGenAI, Type } from '@google/genai';
import { FULL_VISA_DB } from '../data/fullVisaDatabase';

export interface FaqItem {
  question: string;
  answer: string;
  q?: string;
  a?: string;
}

export function getFallbackFaqs(destination: string, visaType: string, fromCountry: string = 'India'): FaqItem[] {
  const destCode = (destination || 'US').toUpperCase();
  const vType = (visaType || 'tourist').toLowerCase();
  const origin = fromCountry || 'India';

  // 1. Try pulling static FAQs directly from FULL_VISA_DB
  const countryVisas = FULL_VISA_DB[destCode] || FULL_VISA_DB['US'];
  if (countryVisas) {
    let categoryKey: any = 'tourist';
    if (vType.includes('work')) categoryKey = 'work';
    else if (vType.includes('student') || vType.includes('study')) categoryKey = 'student';
    else if (vType.includes('family')) categoryKey = 'family';
    else if (vType.includes('business')) categoryKey = 'business';
    else if (vType.includes('pr') || vType.includes('golden')) categoryKey = 'pr';

    const items = countryVisas[categoryKey] || countryVisas.tourist || [];
    const matchedVisa = items.find((v: any) => v.id.toLowerCase() === vType) || items[0];

    if (matchedVisa && matchedVisa.faq && matchedVisa.faq.length > 0) {
      return matchedVisa.faq.map((f: any) => ({
        question: f.q || f.question,
        answer: f.a || f.answer,
        q: f.q || f.question,
        a: f.a || f.answer
      }));
    }
  }

  // 2. Default rich fallback FAQs if not found in database
  const destName = destCode;
  return [
    {
      question: `What are the mandatory passport and photo specifications for a ${visaType} visa to ${destName}?`,
      answer: `Applicants from ${origin} must possess a valid passport with at least 6 months validity beyond their planned departure date from ${destName}, along with a minimum of 2 blank visa pages. Two recent passport-size photographs meeting official consular biometric standards (white/light background) are required.`
    },
    {
      question: `How long does processing take for a ${visaType} visa from ${origin} to ${destName}?`,
      answer: `Consular processing times typically average between 15 and 30 business days for standard applications. Processing may take longer during peak travel seasons or if additional administrative review or biometrics appointments are required.`
    },
    {
      question: `What financial proof is required when applying for a ${visaType} visa to ${destName}?`,
      answer: `Applicants must provide official bank statements for the past 3 to 6 months demonstrating sufficient liquidated balance to cover lodging, living expenses, and round-trip transport during their stay in ${destName}.`
    },
    {
      question: `Can a ${visaType} visa be extended or converted after arriving in ${destName}?`,
      answer: `In most cases, short-term ${visaType} visas cannot be converted or extended from within ${destName} unless authorized under rare emergency or humanitarian circumstances. Visitors must leave before their authorized stay expires.`
    }
  ];
}

/**
 * Generates dynamic FAQs using Gemini API with fallback to static data
 */
export async function generateFaqsWithGemini(
  destination: string,
  visaType: string,
  fromCountry: string = 'India'
): Promise<FaqItem[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'dummy_key') {
    return getFallbackFaqs(destination, visaType, fromCountry);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const prompt = `Generate 4 concise, official, and highly accurate Frequently Asked Questions (FAQs) with detailed answers for travelers from ${fromCountry} applying for a ${visaType} visa to ${destination}.

Focus on official consular requirements, processing times, required financial documentation, and visa validity rules.`;

    const apiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'List of FAQ objects',
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: 'The frequently asked question text'
              },
              answer: {
                type: Type.STRING,
                description: 'Comprehensive and helpful answer'
              }
            },
            required: ['question', 'answer']
          }
        }
      }
    });

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 6 seconds')), 6000)
    );

    const response: any = await Promise.race([apiPromise, timeoutPromise]);

    if (response && response.text) {
      const parsed = JSON.parse(response.text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          question: String(item.question || ''),
          answer: String(item.answer || '')
        })).filter(item => item.question && item.answer);
      }
    }
  } catch (error) {
    console.warn('Dynamic Gemini FAQ generation failed or timed out. Falling back to FULL_VISA_DB static data:', error);
  }

  return getFallbackFaqs(destination, visaType, fromCountry);
}

/**
 * Client-side helper to fetch dynamic FAQs from the API route with fallback
 */
export async function fetchFaqContent(
  destination: string,
  visaType: string,
  fromCountry: string = 'India'
): Promise<FaqItem[]> {
  try {
    const queryParams = new URLSearchParams({
      destination,
      visaType,
      from: fromCountry
    });

    const response = await fetch(`/api/faq?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (data && Array.isArray(data.faqs) && data.faqs.length > 0) {
      return data.faqs;
    }
  } catch (err) {
    console.warn('Network or API failure when fetching FAQs. Utilizing robust static fallback:', err);
  }

  return getFallbackFaqs(destination, visaType, fromCountry);
}

/**
 * Universal serverless / Express request handler
 */
export default async function handleFaqRequest(req: any, res: any) {
  if (res.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(200).end() : res.end();
  }

  const destination = (req.query?.destination || req.query?.to || req.body?.destination || req.body?.to || 'United States') as string;
  const visaType = (req.query?.visaType || req.query?.type || req.body?.visaType || req.body?.type || 'Tourist') as string;
  const fromCountry = (req.query?.from || req.body?.from || 'India') as string;

  try {
    const faqs = await generateFaqsWithGemini(destination, visaType, fromCountry);
    return res.status(200).json({
      success: true,
      faqs
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      source: 'fallback',
      faqs: getFallbackFaqs(destination, visaType, fromCountry)
    });
  }
}
