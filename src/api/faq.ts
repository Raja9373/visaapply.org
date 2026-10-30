import { GoogleGenAI, Type } from '@google/genai';
import { FULL_VISA_DB, CountryVisas } from '../data/fullVisaDatabase';

export interface FaqItem {
  question: string;
  answer: string;
  q?: string;
  a?: string;
}

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'united states': 'US', 'usa': 'US', 'us': 'US',
  'canada': 'CA', 'ca': 'CA',
  'united kingdom': 'GB', 'uk': 'GB', 'gb': 'GB',
  'australia': 'AU', 'au': 'AU',
  'germany': 'DE', 'de': 'DE',
  'france': 'FR', 'fr': 'FR',
  'uae': 'AE', 'uae dubai': 'AE', 'dubai': 'AE', 'ae': 'AE',
  'singapore': 'SG', 'sg': 'SG',
  'japan': 'JP', 'jp': 'JP',
  'india': 'IN', 'in': 'IN',
  'brazil': 'BR', 'br': 'BR',
  'italy': 'IT', 'it': 'IT',
  'spain': 'ES', 'es': 'ES',
  'netherlands': 'NL', 'nl': 'NL',
  'new zealand': 'NZ', 'nz': 'NZ',
  'sweden': 'SE', 'se': 'SE',
  'switzerland': 'CH', 'ch': 'CH',
  'ireland': 'IE', 'ie': 'IE',
  'norway': 'NO', 'no': 'NO',
  'portugal': 'PT', 'pt': 'PT',
  'denmark': 'DK', 'dk': 'DK',
  'finland': 'FI', 'fi': 'FI',
  'belgium': 'BE', 'be': 'BE',
  'austria': 'AT', 'at': 'AT',
  'poland': 'PL', 'pl': 'PL',
  'malaysia': 'MY', 'my': 'MY',
  'thailand': 'TH', 'th': 'TH',
  'turkey': 'TR', 'tr': 'TR',
  'south africa': 'ZA', 'za': 'ZA',
  'saudi arabia': 'SA', 'saudi': 'SA', 'sa': 'SA',
  'schengen': 'DE'
};

export function getFallbackFaqs(destination: string, visaType: string, fromCountry: string = 'India'): FaqItem[] {
  const origin = fromCountry || 'India';
  const cleanOrigin = origin.toLowerCase().trim();
  const cleanDest = (destination || 'US').toLowerCase().trim();
  const originCode = COUNTRY_NAME_TO_CODE[cleanOrigin] || (origin.length === 2 ? origin.toUpperCase() : 'IN');
  const destCode = COUNTRY_NAME_TO_CODE[cleanDest] || (destination.length === 2 ? destination.toUpperCase() : 'US');
  const vType = (visaType || 'tourist').toLowerCase();
  
  const countryVisas = (FULL_VISA_DB[originCode] && FULL_VISA_DB[originCode][destCode]) || 
                       FULL_VISA_DB[destCode] || 
                       FULL_VISA_DB['US'];
  if (countryVisas) {
    let categoryKey: keyof CountryVisas = 'tourist';
    if (vType.includes('work')) categoryKey = 'work';
    else if (vType.includes('student') || vType.includes('study')) categoryKey = 'student';
    else if (vType.includes('family')) categoryKey = 'family';
    else if (vType.includes('business')) categoryKey = 'business';
    else if (vType.includes('pr') || vType.includes('golden')) categoryKey = 'pr';

    const items = countryVisas[categoryKey] || countryVisas.tourist || [];
    const matchedVisa = items.find((v: any) => v.id.toLowerCase() === vType || v.id.toLowerCase().includes(vType)) || items[0];

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
 * Helper to execute an async Gemini API call with configurable timeout and exponential backoff retry.
 * Prevents dynamic FAQ failure on transient network glitches or cold starts.
 */
async function callGeminiWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  timeoutMs: number = 15000, // Increased beyond 6 seconds to 15 seconds
  initialDelayMs: number = 1000,
  multiplier: number = 2
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    let timeoutHandle: any;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`Gemini API call timed out after ${Math.round(timeoutMs / 1000)} seconds`));
        }, timeoutMs);
      });

      const result = await Promise.race([fn(), timeoutPromise]);
      clearTimeout(timeoutHandle);
      return result;
    } catch (err: any) {
      clearTimeout(timeoutHandle);
      const isLastAttempt = attempt >= maxRetries;
      if (isLastAttempt) {
        throw err;
      }
      const delay = Math.round(initialDelayMs * Math.pow(multiplier, attempt - 1) + Math.random() * 250);
      console.info(`[Gemini FAQ] Attempt ${attempt}/${maxRetries} failed: ${err?.message || err}. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error(`Gemini API call retries exhausted after ${maxRetries} attempts`);
}

/**
 * Generates dynamic FAQs using Gemini API with exponential backoff retry and fallback to static data
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

    const response: any = await callGeminiWithRetry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
    }, 3, 15000); // 3 retries with exponential backoff and 15s timeout (strictly > 6s)

    if (response && response.text) {
      const parsed = JSON.parse(response.text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          question: String(item.question || ''),
          answer: String(item.answer || ''),
          q: String(item.question || ''),
          a: String(item.answer || '')
        })).filter(item => item.question && item.answer);
      }
    }
  } catch (error: any) {
    console.warn(`Dynamic Gemini FAQ generation failed or timed out. Falling back to FULL_VISA_DB static data: ${error?.message || error}`);
  }

  return getFallbackFaqs(destination, visaType, fromCountry);
}

/**
 * Client-side helper to fetch dynamic FAQs from the API route with retry and fallback
 */
export async function fetchFaqContent(
  destination: string,
  visaType: string,
  fromCountry: string = 'India'
): Promise<FaqItem[]> {
  const fallback = getFallbackFaqs(destination, visaType, fromCountry);
  try {
    const queryParams = new URLSearchParams({
      destination,
      visaType,
      from: fromCountry
    });

    const res = await fetch(`/api/faq?${queryParams.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data && Array.isArray(data.faqs) && data.faqs.length > 0) {
      return data.faqs;
    }
  } catch (err) {
    console.warn('Network or API failure when fetching FAQs. Utilizing robust static fallback:', err);
  }

  return fallback;
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
