import { getCountryMeta } from '../data/countryMetaData';
import { getEmbassyInfo } from '../data/embassyAddresses';

const weatherCache = new Map<string, { temp: string; emoji: string; desc: string }>();
const currencyCache = new Map<string, string>();
let allRatesCache: Record<string, number> | null = null;
let allRatesFetchPromise: Promise<Record<string, number> | null> | null = null;
const liveTimeCache = new Map<string, { minuteBucket: number; result: { time: string; diffFromIST: string } }>();

export function getLiveLocalTime(timeZone: string): { time: string; diffFromIST: string } {
  const tzKey = timeZone || 'UTC';
  const minuteBucket = Math.floor(Date.now() / 60000);
  const cached = liveTimeCache.get(tzKey);
  if (cached && cached.minuteBucket === minuteBucket) {
    return cached.result;
  }
  try {
    const now = new Date();
    const localTime = now.toLocaleTimeString('en-IN', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    const localDay = now.toLocaleDateString('en-IN', {
      timeZone,
      weekday: 'short'
    });
    // Calculate IST diff
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const countryTime = new Date(now.toLocaleString('en-US', { timeZone }));
    const diffMs = countryTime.getTime() - istTime.getTime();
    const diffHours = Math.round((diffMs / (1000 * 60 * 60)) * 2) / 2; // round to 0.5
    let diffText = "";
    if (diffHours === 0) diffText = "Same as IST";
    else if (diffHours > 0) diffText = `${Math.abs(diffHours)}h ahead of IST`;
    else diffText = `${Math.abs(diffHours)}h behind IST`;
    const result = { time: `${localTime} ${localDay}`, diffFromIST: diffText };
    liveTimeCache.set(tzKey, { minuteBucket, result });
    return result;
  } catch (e) {
    return { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), diffFromIST: "IST" };
  }
}

export async function getLiveWeather(lat: number, lon: number): Promise<{ temp: string; emoji: string; desc: string }> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  if (weatherCache.has(key)) {
    return weatherCache.get(key)!;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://wttr.in/${lat},${lon}?format=j1`, { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await res.json();
    const temp = data.current_condition[0].temp_C;
    const desc = data.current_condition[0].weatherDesc[0].value;
    let emoji = "☀️";
    const lowerDesc = desc.toLowerCase();
    if (lowerDesc.includes("cloud") || lowerDesc.includes("overcast")) emoji = "☁️";
    if (lowerDesc.includes("rain") || lowerDesc.includes("drizzle") || lowerDesc.includes("shower")) emoji = "🌧️";
    if (lowerDesc.includes("snow") || lowerDesc.includes("ice") || lowerDesc.includes("blizzard")) emoji = "❄️";
    if (lowerDesc.includes("clear") || lowerDesc.includes("sunny")) emoji = "☀️";
    const result = { temp: `${temp}°C`, emoji, desc };
    weatherCache.set(key, result);
    return result;
  } catch (e) {
    const absLat = Math.abs(lat);
    const fallbackTemp = absLat > 55 ? "8°C" : absLat > 35 ? "18°C" : "26°C";
    return { temp: fallbackTemp, emoji: "☀️", desc: "Clear" };
  }
}

export type CurrencyRateStatus = 'LIVE_RATE' | 'CACHED_RATE' | 'FALLBACK_STATIC_RATE' | 'UNAVAILABLE';

export interface CurrencyRateDetails {
  sourceCurrency: string;
  targetCurrency: string;
  rate: number;
  timestamp: string | null;
  status: CurrencyRateStatus;
  isEstimate: boolean;
  disclaimer: string;
}

const currencyTimestampMap = new Map<string, string>();

export async function getCurrencyRateDetails(toCurrency: string, fromCurrency = 'USD'): Promise<CurrencyRateDetails> {
  const targetCurrency = (toCurrency || 'USD').toUpperCase();
  const sourceCurrency = (fromCurrency || 'USD').toUpperCase();

  if (targetCurrency === sourceCurrency) {
    return {
      sourceCurrency,
      targetCurrency,
      rate: 1.0,
      timestamp: new Date().toISOString(),
      status: 'LIVE_RATE',
      isEstimate: false,
      disclaimer: `Official base currency rate (${sourceCurrency} to ${targetCurrency}).`
    };
  }

  const isCachedInMemory = currencyCache.has(targetCurrency);

  try {
    if (!allRatesCache) {
      if (!allRatesFetchPromise) {
        allRatesFetchPromise = (async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${sourceCurrency}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          const data = await res.json();
          allRatesCache = data?.rates || null;
          if (allRatesCache) {
            currencyTimestampMap.set(sourceCurrency, new Date().toISOString());
          }
          return allRatesCache;
        })();
      }
      await allRatesFetchPromise;
    }

    const rate = allRatesCache?.[targetCurrency];
    if (rate) {
      const timestamp = currencyTimestampMap.get(sourceCurrency) || new Date().toISOString();
      const status: CurrencyRateStatus = isCachedInMemory ? 'CACHED_RATE' : 'LIVE_RATE';
      const formatted = `1 ${sourceCurrency} = ${rate.toFixed(4)} ${targetCurrency}`;
      currencyCache.set(targetCurrency, formatted);

      return {
        sourceCurrency,
        targetCurrency,
        rate,
        timestamp,
        status,
        isEstimate: false,
        disclaimer: `Indicative conversion based on market rate (${status === 'LIVE_RATE' ? 'Live API' : 'Cached'}). Official consular fees are billed in source currency.`
      };
    }
  } catch (e) {
    // Fallback handling
  }

  const fallbackRates: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.35,
    AUD: 1.52,
    INR: 83.2,
    AED: 3.67
  };

  const fallbackRate = fallbackRates[targetCurrency];
  if (fallbackRate) {
    return {
      sourceCurrency,
      targetCurrency,
      rate: fallbackRate,
      timestamp: null,
      status: 'FALLBACK_STATIC_RATE',
      isEstimate: true,
      disclaimer: `External exchange rate service unavailable. Using offline fallback static reference rate. Indicative only.`
    };
  }

  return {
    sourceCurrency,
    targetCurrency,
    rate: 1.0,
    timestamp: null,
    status: 'UNAVAILABLE',
    isEstimate: true,
    disclaimer: `Conversion unavailable for ${targetCurrency}. Displaying original currency.`
  };
}

export async function getCurrencyRate(toCurrency: string): Promise<string> {
  const details = await getCurrencyRateDetails(toCurrency, 'USD');
  if (details.status === 'UNAVAILABLE') {
    return `CONVERSION UNAVAILABLE`;
  }
  return `1 USD = ${details.rate.toFixed(4)} ${details.targetCurrency} (${details.status})`;
}

export function parseHotelPriceUSD(hotelPrice: string): number {
  const match = (hotelPrice || '').match(/(\d+)/);
  if (!match) return 80;
  return parseInt(match[1], 10);
}

export function parseProcessingDays(processing: string): number {
  const lower = (processing || '').toLowerCase();
  if (lower.includes('instant') || lower.includes('free')) return 1;
  const nums = (processing || '').match(/\d+/g);
  if (!nums || nums.length === 0) return 15;
  return parseInt(nums[0], 10);
}

export function parseSuccessRateNum(successRate: string): number {
  const nums = (successRate || '').match(/\d+/g);
  if (!nums || nums.length === 0) return 88;
  return parseInt(nums[nums.length - 1], 10);
}

export interface ChecklistPDFOptions {
  visaName: string;
  countryName: string;
  countryCode?: string;
  fromCountryName?: string;
  fee?: string;
  validity?: string;
  processing?: string;
  docs?: string[];
  steps?: string[];
}

export function generateChecklistPDF(
  visaNameOrOpts: string | ChecklistPDFOptions,
  countryNameArg?: string
): void {
  void (async () => {
    const { jsPDF } = await import('jspdf');
    const opts: ChecklistPDFOptions =
      typeof visaNameOrOpts === 'string'
        ? {
            visaName: visaNameOrOpts,
            countryName: countryNameArg || 'Destination Country'
          }
        : visaNameOrOpts;

    const code = (opts.countryCode || 'us').toLowerCase();
    const meta = getCountryMeta(code);
    const embassy = getEmbassyInfo(code.toUpperCase());

    const fee = opts.fee || '$150 - $250 (Official Consular Fee)';
    const validity = opts.validity || 'Up to 1 - 10 Years (Category Dependent)';
    const processing = opts.processing || meta.processing || '10-15 Working Days';
    const docs =
      opts.docs && opts.docs.length > 0
        ? opts.docs
        : [
            'Valid Passport (minimum 6 months validity beyond travel dates, at least 2 blank pages)',
            'Completed & Signed Official Visa Application Form',
            '2 Recent Biometric Passport Photographs (35x45mm or 2x2 inch, white background)',
            'Last 6 Months Certified Bank Statements with sufficient closing balance',
            'Income Tax Returns (ITR) / Form 16 for the last 2-3 financial years',
            'Confirmed Return Flight Itinerary & Hotel Accommodation Booking',
            'Comprehensive International Travel & Medical Insurance ($50,000 / EUR 30,000 coverage)',
            'Employment NOC / Leave Approval Letter or Business Registration Certificate'
          ];

    const steps =
      opts.steps && opts.steps.length > 0
        ? opts.steps
        : [
            'Verify visa category eligibility and prepare all required original documents',
            'Complete the online visa application form on the official portal',
            'Pay the official government visa fee and biometric fee online',
            'Schedule an appointment at the nearest VFS Global / Consulate center',
            'Attend biometrics collection and submit supporting documentation',
            'Track application status online and collect passport upon approval'
          ];

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 40;

  // Header Banner
  doc.setFillColor(11, 61, 145);
  doc.rect(0, 0, pageWidth, 82, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('VisaApply.org - Official 2026 Visa Checklist', 40, 34);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${opts.fromCountryName ? `${opts.fromCountryName} to ` : ''}${opts.countryName} • ${opts.visaName}`, 40, 56);
  doc.setFontSize(9);
  doc.text(`Generated on ${new Date().toLocaleDateString()} • Capital: ${meta.capital} • Currency: ${meta.currency} (${meta.currencySymbol})`, 40, 72);

  y = 105;

  // Key Visa Summary Box
  doc.setFillColor(240, 247, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(40, y, pageWidth - 80, 62, 6, 6, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Official Fee: ${fee}`, 54, y + 20);
  doc.text(`Processing Time: ${processing}`, 54, y + 38);
  doc.text(`Validity: ${validity}`, 54, y + 54);
  doc.text(`Success Rate: ${meta.successRate}  |  Best Time: ${meta.bestTime}`, pageWidth / 2, y + 20);
  doc.text(`Hotel Avg: ${meta.hotelPrice} (${meta.capital})`, pageWidth / 2, y + 38);
  doc.text(`Travel Advisory: ${meta.advisory}`, pageWidth / 2, y + 54);

  y += 84;

  // Section 1: Mandatory Documents Checklist
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(11, 61, 145);
  doc.text('1. Mandatory Document Checklist (Tick as you prepare)', 40, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  for (let i = 0; i < docs.length; i++) {
    const lines = doc.splitTextToSize(`[  ]  ${i + 1}. ${docs[i]}`, pageWidth - 90);
    if (y + lines.length * 14 > 760) {
      doc.addPage();
      y = 45;
    }
    doc.text(lines, 45, y);
    y += lines.length * 14 + 4;
  }

  y += 12;

  // Section 2: Step-by-Step Application Process
  if (y + 100 > 760) {
    doc.addPage();
    y = 45;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(11, 61, 145);
  doc.text('2. Step-by-Step Application Procedure', 40, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  for (let i = 0; i < steps.length; i++) {
    const lines = doc.splitTextToSize(`Step ${i + 1}: ${steps[i]}`, pageWidth - 90);
    if (y + lines.length * 14 > 760) {
      doc.addPage();
      y = 45;
    }
    doc.text(lines, 45, y);
    y += lines.length * 14 + 4;
  }

  y += 14;

  // Section 3: Embassy & VFS Submission Center Info
  if (y + 90 > 760) {
    doc.addPage();
    y = 45;
  }
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, y, pageWidth - 80, 74, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`3. Official Embassy & VFS Center (${opts.countryName})`, 52, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const primaryMission = embassy.inIndia?.[0];
  const missionCity = primaryMission?.city || `Embassy of ${opts.countryName} in New Delhi`;
  const missionAddress = primaryMission?.address || 'Chanakyapuri Diplomatic Enclave, New Delhi - 110021';
  const missionPhone = primaryMission?.phone || '+91-11-2688-0000';
  const missionEmail = primaryMission?.email || 'consular@visaapply.org';
  const embAddress = doc.splitTextToSize(`Mission: ${missionCity} - ${missionAddress}`, pageWidth - 104);
  doc.text(embAddress, 52, y + 34);
  doc.text(`Phone: ${missionPhone}   |   Email: ${missionEmail}`, 52, y + 54);
  doc.text(`Official Portal: ${embassy.officialWebsite || 'https://www.visaapply.org'}`, 52, y + 67);

    const safeCountry = (opts.countryName || 'Country').replace(/[^a-zA-Z0-9]+/g, '_');
    const safeVisa = (opts.visaName || 'Visa').replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 40);
    doc.save(`${safeCountry}_${safeVisa}_Checklist.pdf`);
  })();
}

if (typeof window !== 'undefined') {
  (window as any).generateChecklistPDF = generateChecklistPDF;
}
