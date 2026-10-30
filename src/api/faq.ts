import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { FULL_VISA_DB, CountryVisas } from '../data/fullVisaDatabase';
import { fetchWithRetry } from '../utils/fetchWithRetry';

export interface FaqItem {
  question: string;
  answer: string;
  q?: string;
  a?: string;
}

const faqCache = new Map<string, FaqItem[]>();
const inFlightFaqRequests = new Map<string, Promise<FaqItem[]>>();

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

    const allVisas = [
      ...(countryVisas.tourist || []),
      ...(countryVisas.work || []),
      ...(countryVisas.student || []),
      ...(countryVisas.family || []),
      ...(countryVisas.business || []),
      ...(countryVisas.pr || []),
    ];
    const items = countryVisas[categoryKey] || countryVisas.tourist || [];
    const matchedVisa =
      allVisas.find((v: any) => v.id.toLowerCase() === vType) ||
      items.find((v: any) => v.id.toLowerCase() === vType || v.id.toLowerCase().includes(vType)) ||
      items[0];

    if (matchedVisa && matchedVisa.faq && matchedVisa.faq.length > 0) {
      return matchedVisa.faq.map((f: any) => ({
        question: f.q || f.question,
        answer: f.a || f.answer,
        q: f.q || f.question,
        a: f.a || f.answer
      }));
    }
  }

  const destName = destCode;
  return [
    {
      question: `What are the mandatory passport and photo specifications for a ${visaType} visa to ${destName}?`,
      answer: `Applicants from ${origin} must possess a valid passport with at least 6 months validity beyond their planned departure date from ${destName}, along with a minimum of 2 blank visa pages. Two recent passport-size photographs meeting official consular biometric standards (white/light background) are required.`,
      q: `What are the mandatory passport and photo specifications for a ${visaType} visa to ${destName}?`,
      a: `Applicants from ${origin} must possess a valid passport with at least 6 months validity beyond their planned departure date from ${destName}, along with a minimum of 2 blank visa pages. Two recent passport-size photographs meeting official consular biometric standards (white/light background) are required.`
    },
    {
      question: `How long does processing take for a ${visaType} visa from ${origin} to ${destName}?`,
      answer: `Consular processing times typically average between 15 and 30 business days for standard applications. Processing may take longer during peak travel seasons or if additional administrative review or biometrics appointments are required.`,
      q: `How long does processing take for a ${visaType} visa from ${origin} to ${destName}?`,
      a: `Consular processing times typically average between 15 and 30 business days for standard applications. Processing may take longer during peak travel seasons or if additional administrative review or biometrics appointments are required.`
    },
    {
      question: `What financial proof is required when applying for a ${visaType} visa to ${destName}?`,
      answer: `Applicants must provide official bank statements for the past 3 to 6 months demonstrating sufficient liquidated balance to cover lodging, living expenses, and round-trip transport during their stay in ${destName}.`,
      q: `What financial proof is required when applying for a ${visaType} visa to ${destName}?`,
      a: `Applicants must provide official bank statements for the past 3 to 6 months demonstrating sufficient liquidated balance to cover lodging, living expenses, and round-trip transport during their stay in ${destName}.`
    },
    {
      question: `Can a ${visaType} visa be extended or converted after arriving in ${destName}?`,
      answer: `In most cases, short-term ${visaType} visas cannot be converted or extended from within ${destName} unless authorized under rare emergency or humanitarian circumstances. Visitors must leave before their authorized stay expires.`,
      q: `Can a ${visaType} visa be extended or converted after arriving in ${destName}?`,
      a: `In most cases, short-term ${visaType} visas cannot be converted or extended from within ${destName} unless authorized under rare emergency or humanitarian circumstances. Visitors must leave before their authorized stay expires.`
    }
  ];
}

function isRetryableGeminiError(err: any): boolean {
  const msg = String(err?.message || err || '').toLowerCase();
  const status = Number(err?.status || err?.code || 0);
  if (status === 400 || status === 401 || status === 403 || status === 404) {
    return false;
  }
  if (
    msg.includes('404') ||
    msg.includes('not_found') ||
    msg.includes('invalid_argument') ||
    msg.includes('permission_denied') ||
    msg.includes('api_key_invalid')
  ) {
    return false;
  }
  return true;
}

/**
 * Executes an async Gemini API call with a 30-second timeout and exponential backoff with jitter.
 * Accommodates complex FAQ generations and prevents transient timeout failures.
 */
export async function callGeminiWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 4,
  timeoutMs: number = 30000, // Increased from 6s to 30s
  initialDelayMs: number = 1000,
  multiplier: number = 2,
  maxDelayMs: number = 12000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    let timeoutHandle: any;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`Request exceeded ${Math.round(timeoutMs / 1000)}s limit`));
        }, timeoutMs);
      });

      const result = await Promise.race([fn(), timeoutPromise]);
      clearTimeout(timeoutHandle);
      return result;
    } catch (err: any) {
      clearTimeout(timeoutHandle);
      const isLastAttempt = attempt >= maxRetries;
      if (isLastAttempt || !isRetryableGeminiError(err)) {
        throw err;
      }
      const exponentialDelay = Math.min(
        maxDelayMs,
        initialDelayMs * Math.pow(multiplier, attempt - 1)
      );
      const jitter = Math.round(Math.random() * 350);
      const delay = Math.round(exponentialDelay + jitter);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error(`Retries exhausted after ${maxRetries} attempts`);
}

/**
 * Generates dynamic FAQs using Gemini API with 30s timeout, exponential backoff retry,
 * in-flight request deduplication, and fallback to static FULL_VISA_DB data.
 */
export async function generateFaqsWithGemini(
  destination: string,
  visaType: string,
  fromCountry: string = 'India',
  forceDynamic: boolean = false
): Promise<FaqItem[]> {
  const cacheKey = `${fromCountry.toLowerCase()}-${destination.toLowerCase()}-${visaType.toLowerCase()}`;
  const cached = faqCache.get(cacheKey);
  if (cached && cached.length > 0 && !forceDynamic) {
    return cached;
  }

  const staticFaqs = getFallbackFaqs(destination, visaType, fromCountry);
  if (!forceDynamic && staticFaqs && staticFaqs.length > 0) {
    faqCache.set(cacheKey, staticFaqs);
    return staticFaqs;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_key') {
    return staticFaqs;
  }

  const existingInFlight = inFlightFaqRequests.get(cacheKey);
  if (existingInFlight) {
    return existingInFlight;
  }

  const generationPromise = (async (): Promise<FaqItem[]> => {
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
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW
            },
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
      }, 4, 30000); // 4 attempts with exponential backoff and 30-second timeout

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((item: any) => ({
            question: String(item.question || ''),
            answer: String(item.answer || ''),
            q: String(item.question || ''),
            a: String(item.answer || '')
          })).filter(item => item.question && item.answer);
          if (formatted.length > 0) {
            faqCache.set(cacheKey, formatted);
            return formatted;
          }
        }
      }
    } catch {
      // Gracefully fall back to FULL_VISA_DB static data
    } finally {
      inFlightFaqRequests.delete(cacheKey);
    }

    faqCache.set(cacheKey, staticFaqs);
    return staticFaqs;
  })();

  inFlightFaqRequests.set(cacheKey, generationPromise);
  return generationPromise;
}

/**
 * Client-side helper to fetch dynamic FAQs from the API route with 30s timeout, exponential backoff retry, and fallback
 */
export async function fetchFaqContent(
  destination: string,
  visaType: string,
  fromCountry: string = 'India'
): Promise<FaqItem[]> {
  const fallback = getFallbackFaqs(destination, visaType, fromCountry);
  const queryParams = new URLSearchParams({
    destination,
    visaType,
    from: fromCountry
  });

  const data = await fetchWithRetry<{ success?: boolean; faqs?: FaqItem[] }>(
    `/api/faq?${queryParams.toString()}`,
    {},
    {
      retries: 4,
      initialDelay: 1000,
      maxDelay: 12000,
      backoffMultiplier: 2,
      timeoutMs: 30000, // 30s timeout
      fallback: { success: true, faqs: fallback }
    }
  );

  if (data && Array.isArray(data.faqs) && data.faqs.length > 0) {
    return data.faqs;
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
  const forceDynamic = req.query?.dynamic === 'true' || req.body?.dynamic === true;

  try {
    const faqs = await generateFaqsWithGemini(destination, visaType, fromCountry, forceDynamic);
    return res.status(200).json({
      success: true,
      faqs
    });
  } catch {
    return res.status(200).json({
      success: true,
      source: 'fallback',
      faqs: getFallbackFaqs(destination, visaType, fromCountry)
    });
  }
}
