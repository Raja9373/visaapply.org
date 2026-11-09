import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Compass,
  ShieldCheck,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { getCountryMeta, getCapitalSlug } from '../data/countryMetaData';
import { getLiveVisaCount, NAME_MAP_249, FLAG_MAP_249 } from '../data/fullVisaDatabase';
import { getEmbassyInfo } from '../data/embassyAddresses';
import { SupportedLangCode } from '../i18n/config';
import { getUIString, getLocalizedCountryName } from '../utils/autoLanguage';

interface EligibilityCheckerProps {
  countryCode?: string;
  countryName?: string;
  defaultFromCode?: string;
  showDestinationPicker?: boolean;
  onNavigate?: (path: string) => void;
  uiLang?: SupportedLangCode;
}

interface AlternativeCountryItem {
  name: string;
  code: string;
  flag: string;
  chance: string;
  reason: string;
}

interface AiEligibilityReport {
  score: number;
  verdict: 'High Chance' | 'Medium Chance' | 'Low Chance';
  source: 'gemini-ai' | 'rule-based';
  why: string;
  whatToFix: string[];
  alternativeCountries: AlternativeCountryItem[];
  documentsNeeded: string[];
}

const STRICT_DEST_CODES = new Set([
  'us', 'gb', 'uk', 'ca', 'au', 'de', 'fr', 'it', 'es', 'ch', 'nl', 'nz', 'ie', 'se', 'no', 'dk', 'at', 'be'
]);

const EASY_DEST_CODES = new Set([
  'th', 'ae', 'my', 'id', 'vn', 'lk', 'mv', 'mu', 'np', 'bt', 'kz', 'uz', 'qa', 'om'
]);

function buildClientRuleFallback(params: {
  fromCountryName: string;
  toCountryName: string;
  toCode: string;
  visaType: string;
  duration: string;
  passportValidity: string;
  monthlyIncome: string;
  bankBalance: string;
  travelHistory: string;
  jobType: string;
}): AiEligibilityReport {
  const toKey = (params.toCode || 'us').toLowerCase();
  const isStrict = STRICT_DEST_CODES.has(toKey);
  const isEasy = EASY_DEST_CODES.has(toKey);
  const isPassportInvalid = params.passportValidity.toLowerCase().includes('less than 6');
  const cleanVisaType = params.visaType.replace(/^[^\w]+/, '').trim();

  if (isPassportInvalid) {
    return {
      score: 15,
      verdict: 'Low Chance',
      source: 'rule-based',
      why: `Your passport has less than 6 months validity. Consulates and airlines for ${params.toCountryName} require a minimum of 6 months passport validity beyond your return date before a visa can be issued.`,
      whatToFix: [
        'Apply for Passport Renewal first (Normal takes 7–15 days, Tatkal takes 1–3 working days).',
        params.bankBalance === '< Rs 1L'
          ? 'Increase your bank balance to at least Rs 3L+ with steady monthly credits before filing your visa.'
          : 'Maintain your bank balance steadily over the next 3–6 months without sudden cash deposits.',
        'Gather your last 6 months bank statements, ITR, and employment/student proof while your passport renews.'
      ],
      alternativeCountries: [
        {
          name: 'Thailand',
          code: 'th',
          flag: '🇹🇭',
          chance: '99% (Once Renewed)',
          reason: '60-Day Visa-Free entry for Indian passports once your renewed passport has 6+ months validity.'
        },
        {
          name: 'Dubai (UAE)',
          code: 'ae',
          flag: '🇦🇪',
          chance: '95% (Once Renewed)',
          reason: 'Fast 3–4 day online e-Visa approval once your passport is renewed.'
        }
      ],
      documentsNeeded: [
        'Renewed Passport with at least 6+ months validity and 2 blank pages',
        'Old passport attached showing any previous travel stamps',
        'Last 6 months bank statements showing consistent savings',
        'Biometric visa photographs (35x45mm or 2x2 inch white background)'
      ]
    };
  }

  let score = isEasy ? 72 : isStrict ? 44 : 58;

  if (params.bankBalance === 'Rs 5L+') score += 20;
  else if (params.bankBalance === 'Rs 3L-5L') score += 14;
  else if (params.bankBalance === 'Rs 1L-3L') score += isEasy ? 10 : 3;
  else score -= isStrict ? 18 : isEasy ? 4 : 10;

  if (params.monthlyIncome === 'Rs 1L+') score += 14;
  else if (params.monthlyIncome === 'Rs 60k-1L') score += 10;
  else if (params.monthlyIncome === 'Rs 30k-60k') score += isEasy ? 8 : 3;
  else score -= isStrict ? 10 : 3;

  if (params.travelHistory === '3+ Countries') score += 14;
  else if (params.travelHistory === '1-2 Countries') score += 7;
  else score -= isStrict ? 8 : 0;

  if (params.jobType === 'Salaried') score += 8;
  else if (params.jobType === 'Business') score += 7;
  else if (params.jobType === 'Student') score += 4;
  else if (params.jobType === 'Unemployed') score -= isStrict ? 14 : 6;

  score = Math.max(12, Math.min(98, Math.round(score)));
  const verdict: 'High Chance' | 'Medium Chance' | 'Low Chance' =
    score >= 80 ? 'High Chance' : score >= 50 ? 'Medium Chance' : 'Low Chance';

  let why = '';
  if (verdict === 'High Chance') {
    why = `Your profile demonstrates strong financial stability (${params.bankBalance} balance, ${params.monthlyIncome} monthly income) and clear home-country ties (${params.jobType}) for a ${params.toCountryName} ${cleanVisaType} Visa. Combined with ${params.travelHistory.toLowerCase()} travel history and 6+ months passport validity, your application meets key consular benchmarks.`;
  } else if (verdict === 'Medium Chance') {
    why = `You have a moderate approval chance for a ${params.toCountryName} ${cleanVisaType} Visa with your current ${params.bankBalance} bank balance, ${params.monthlyIncome} income, and ${params.travelHistory.toLowerCase()} background. Strengthening your liquid bank balance and submitting a strong cover letter with ${params.jobType.toLowerCase()} ties will improve your approval odds.`;
  } else {
    why = `Your current profile (${params.bankBalance} bank balance, ${params.monthlyIncome} monthly income, ${params.travelHistory}, ${params.jobType}) is below the typical consular threshold for ${params.toCountryName}. Visa officers for ${params.toCountryName} closely scrutinize financial reserves and prior international travel history before approving a ${cleanVisaType} visa.`;
  }

  const whatToFix: string[] = [];
  if (params.bankBalance === '< Rs 1L' || (isStrict && params.bankBalance === 'Rs 1L-3L')) {
    whatToFix.push(
      isStrict
        ? 'Increase your bank balance to Rs 3L–5L+ steadily over 3–6 months (avoid sudden lump-sum cash deposits).'
        : 'Increase your closing bank balance to at least Rs 1.5L–3L with regular monthly account activity.'
    );
  }
  if (params.travelHistory === 'No Travel' && isStrict) {
    whatToFix.push(
      `Build travel history with Thailand, Dubai (UAE), or Singapore first before applying for ${params.toCountryName}.`
    );
  }
  if (params.jobType === 'Unemployed') {
    whatToFix.push(
      'Add a notarized Financial Sponsorship Affidavit from a parent or spouse along with their 6-month bank statement and ITR.'
    );
  } else if (params.jobType === 'Student') {
    whatToFix.push(
      'Include your College/University Bona Fide Certificate, NOC, and parent sponsorship bank statements + ITR.'
    );
  } else if (params.jobType === 'Business') {
    whatToFix.push(
      'Include your GST / MSME registration, company current account statement, and last 3 years Income Tax Returns (ITR).'
    );
  } else {
    whatToFix.push(
      'Attach your Employer Leave Sanction (NOC) letter, last 3 months salary slips, and last 2–3 years ITR / Form-16.'
    );
  }
  if (whatToFix.length < 3) {
    whatToFix.push(
      `Submit a clear day-by-day itinerary, verifiable flight & hotel reservation, and a signed Cover Letter explaining ties to ${params.fromCountryName}.`
    );
  }

  const alternativeCountries: AlternativeCountryItem[] = [
    {
      name: 'Thailand',
      code: 'th',
      flag: '🇹🇭',
      chance: '99% Approval',
      reason: 'Visa-Free / Exemption entry for Indian passports; best first stamp to build international travel history.'
    },
    {
      name: 'Dubai (UAE)',
      code: 'ae',
      flag: '🇦🇪',
      chance: '95% Approval',
      reason: 'Fast 3–4 day online e-Visa with simple documentation and high approval rate.'
    }
  ];

  const documentsNeeded: string[] = [
    'Valid Passport (6+ months validity & minimum 2 blank visa pages)',
    `Last 6 months bank statements showing ${params.bankBalance} balance & regular credits`,
    `Verifiable Return Flight Ticket & Hotel Booking for ${params.duration.replace('📅 ', '')}`
  ];

  if (params.jobType === 'Salaried') {
    documentsNeeded.push('Last 3 months Salary Slips, Employer Leave NOC & 2–3 years Income Tax Returns (ITR)');
  } else if (params.jobType === 'Business') {
    documentsNeeded.push('Business Registration (GST / MSME), Company Bank Statement & 3 years ITR');
  } else if (params.jobType === 'Student') {
    documentsNeeded.push('Student ID Card, Institution NOC, Parent Sponsorship Letter & Parent 6-Month Bank Statement');
  } else {
    documentsNeeded.push('Family Sponsor Affidavit, Sponsor 6-Month Bank Statements, ITR & Property/Family Ties Proof');
  }

  documentsNeeded.push(
    `Formal Visa Cover Letter & Travel Medical Insurance ($50,000 / €30,000 coverage)`
  );

  return {
    score,
    verdict,
    source: 'rule-based',
    why,
    whatToFix: whatToFix.slice(0, 3),
    alternativeCountries,
    documentsNeeded
  };
}

export const EligibilityChecker: React.FC<EligibilityCheckerProps> = ({
  countryCode = 'us',
  countryName,
  defaultFromCode = 'in',
  showDestinationPicker = false,
  onNavigate,
  uiLang = 'en'
}) => {
  const [fromCode, setFromCode] = useState<string>((defaultFromCode || 'in').toLowerCase());
  const [destCode, setDestCode] = useState<string>((countryCode || 'us').toLowerCase());
  const [purpose, setPurpose] = useState<string>('🎯 Tourist');
  const [duration, setDuration] = useState<string>('📅 15 Days');
  const [passportValidity, setPassportValidity] = useState<string>('📘 Passport Validity 6+ Months');

  // 4 New Optional AI Profile Fields
  const [monthlyIncome, setMonthlyIncome] = useState<string>('Rs 60k-1L');
  const [bankBalance, setBankBalance] = useState<string>('Rs 3L-5L');
  const [travelHistory, setTravelHistory] = useState<string>('1-2 Countries');
  const [jobType, setJobType] = useState<string>('Salaried');

  const [checked, setChecked] = useState<boolean>(false);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<AiEligibilityReport | null>(null);

  useEffect(() => {
    if (countryCode) {
      setDestCode(countryCode.toLowerCase());
    }
  }, [countryCode]);

  useEffect(() => {
    if (defaultFromCode) {
      setFromCode(defaultFromCode.toLowerCase());
    }
  }, [defaultFromCode]);

  const ui = getUIString(uiLang);
  const rawEnglishName =
    countryName && !showDestinationPicker
      ? countryName
      : NAME_MAP_249[destCode] || destCode.toUpperCase();
  const resolvedName = getLocalizedCountryName(destCode, uiLang, rawEnglishName);
  const resolvedFlag = FLAG_MAP_249[destCode] || '🌍';
  const fromEnglishName = NAME_MAP_249[fromCode] || fromCode.toUpperCase();
  const meta = getCountryMeta(destCode);
  const count = getLiveVisaCount(destCode);
  const embassy = getEmbassyInfo(destCode.toUpperCase());
  const capitalSlug = getCapitalSlug(meta.capital);

  const runAiEligibilityCheck = async () => {
    setChecked(true);
    setLoadingAi(true);

    const payload = {
      fromCountry: fromEnglishName,
      toCountry: rawEnglishName,
      toCode: destCode,
      visaType: purpose.replace(/^[^\w]+/, '').trim(),
      duration: duration.replace('📅 ', '').trim(),
      passportValidity: passportValidity.replace(/^[^\w]+/, '').trim(),
      monthlyIncome,
      bankBalance,
      travelHistory,
      jobType
    };

    const localFallback = buildClientRuleFallback({
      fromCountryName: fromEnglishName,
      toCountryName: rawEnglishName,
      toCode: destCode,
      visaType: purpose,
      duration,
      passportValidity,
      monthlyIncome,
      bankBalance,
      travelHistory,
      jobType
    });

    try {
      const res = await fetch('/api/ai-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.score === 'number') {
          setAiReport(data as AiEligibilityReport);
          setLoadingAi(false);
          return;
        }
      }
      setAiReport(localFallback);
    } catch {
      setAiReport(localFallback);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).checkEligibility = () => {
        runAiEligibilityCheck();
      };
    }
  }, [fromCode, destCode, purpose, duration, passportValidity, monthlyIncome, bankBalance, travelHistory, jobType]);

  const handleDownloadAiReportPdf = () => {
    const report =
      aiReport ||
      buildClientRuleFallback({
        fromCountryName: fromEnglishName,
        toCountryName: rawEnglishName,
        toCode: destCode,
        visaType: purpose,
        duration,
        passportValidity,
        monthlyIncome,
        bankBalance,
        travelHistory,
        jobType
      });

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 44;

    // Header Banner
    doc.setFillColor(11, 61, 145);
    doc.rect(0, 0, pageW, 82, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('VisaApply.org — AI Visa Eligibility Report', 40, 36);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      `Route: ${fromEnglishName} to ${rawEnglishName} (${purpose.replace(/^[^\w]+/, '').trim()} Visa)  |  Generated: ${new Date().toISOString().split('T')[0]}`,
      40,
      58
    );

    y = 108;

    // Score & Verdict Box
    if (report.verdict === 'High Chance') {
      doc.setFillColor(220, 252, 231);
      doc.setTextColor(6, 95, 70);
    } else if (report.verdict === 'Medium Chance') {
      doc.setFillColor(254, 243, 199);
      doc.setTextColor(146, 64, 14);
    } else {
      doc.setFillColor(254, 226, 226);
      doc.setTextColor(153, 27, 27);
    }
    doc.roundedRect(40, y, pageW - 80, 56, 8, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(
      `AI Eligibility Score: ${report.score}/100  —  Verdict: ${report.verdict}`,
      56,
      y + 26
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(
      `Profile: Income ${monthlyIncome} | Bank Balance ${bankBalance} | Travel: ${travelHistory} | Job: ${jobType}`,
      56,
      y + 44
    );

    y += 78;

    // Why Section
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. Why You Received This Score:', 40, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const whyLines = doc.splitTextToSize(report.why, pageW - 80);
    doc.text(whyLines, 40, y);
    y += whyLines.length * 14 + 14;

    // What to Fix Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('2. What to Fix / How to Improve Approval Odds:', 40, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    report.whatToFix.forEach((tip, i) => {
      const tipLines = doc.splitTextToSize(`${i + 1}. ${tip}`, pageW - 90);
      doc.text(tipLines, 46, y);
      y += tipLines.length * 14 + 6;
    });

    y += 10;

    // Alternative Countries
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. Best High-Approval Alternative Destinations:', 40, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    report.alternativeCountries.forEach((alt) => {
      const altLines = doc.splitTextToSize(
        `• ${alt.name} (${alt.chance}): ${alt.reason}`,
        pageW - 90
      );
      doc.text(altLines, 46, y);
      y += altLines.length * 14 + 6;
    });

    y += 10;

    // Documents Needed
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`4. Documents Needed for Your Profile (${jobType}):`, 40, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    report.documentsNeeded.forEach((d) => {
      const dLines = doc.splitTextToSize(`[ ] ${d}`, pageW - 90);
      doc.text(dLines, 46, y);
      y += dLines.length * 14 + 5;
    });

    // Footer Disclaimer
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Disclaimer: AI Score is an estimate based on common consular patterns, not a guarantee. Final decision is the embassy's. Portal: https://www.visaapply.org",
      40,
      doc.internal.pageSize.getHeight() - 30
    );

    const safeDest = rawEnglishName.replace(/[^a-zA-Z0-9]+/g, '_');
    doc.save(`VisaApply_AI_Eligibility_Report_${safeDest}.pdf`);
  };

  const allCountryCodes = Object.keys(NAME_MAP_249).sort((a, b) =>
    (NAME_MAP_249[a] || a).localeCompare(NAME_MAP_249[b] || b)
  );

  const activeReport =
    aiReport ||
    buildClientRuleFallback({
      fromCountryName: fromEnglishName,
      toCountryName: rawEnglishName,
      toCode: destCode,
      visaType: purpose,
      duration,
      passportValidity,
      monthlyIncome,
      bankBalance,
      travelHistory,
      jobType
    });

  const isHigh = activeReport.verdict === 'High Chance';
  const isMedium = activeReport.verdict === 'Medium Chance';

  const circleColor = isHigh ? '#10b981' : isMedium ? '#f59e0b' : '#ef4444';
  const verdictBadgeClass = isHigh
    ? 'bg-emerald-500 text-slate-950'
    : isMedium
    ? 'bg-amber-400 text-slate-950'
    : 'bg-rose-600 text-white';
  const verdictContainerClass = isHigh
    ? 'bg-emerald-950/80 border-emerald-500/60'
    : isMedium
    ? 'bg-amber-950/80 border-amber-500/60'
    : 'bg-rose-950/80 border-rose-500/60';

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.max(0, Math.min(100, activeReport.score)) / 100) * circumference;

  return (
    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[20px] p-5 sm:p-6 text-white mb-6 border border-slate-700/80 shadow-lg">
      {/* Header Row with Powered by AI Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Powered by AI</span>
            </span>
            <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider">
              100% FREE • No Login
            </span>
          </div>
          <h2 className="text-xl sm:text-[22px] font-extrabold tracking-tight flex items-center gap-2">
            <span>{ui.eligibility}</span>
          </h2>
          <p className="text-[#94a3b8] text-[13px] mt-1">
            {ui.eligibilitySub.replace('{country}', `${resolvedFlag} ${resolvedName}`)} ({count} {ui.visas}) — Get your personalized AI Score (0–100), fix tips &amp; PDF report.
          </p>
        </div>

        {showDestinationPicker && (
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-600 rounded-xl px-3 py-2 text-xs shrink-0">
            <label htmlFor="elig-destination" className="text-slate-200 font-semibold">
              {ui.toDestination}:
            </label>
            <select
              id="elig-destination"
              aria-label="Select destination country for visa eligibility check"
              value={destCode}
              onChange={(e) => {
                setDestCode(e.target.value);
                setChecked(false);
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {allCountryCodes.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {FLAG_MAP_249[c] || '🌍'} {getLocalizedCountryName(c, uiLang, NAME_MAP_249[c])}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Row 1: Core Trip Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <div>
          <label htmlFor="elig-from" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            1. Your Passport
          </label>
          <select
            id="elig-from"
            aria-label="Select your passport or origin country"
            value={fromCode}
            onChange={(e) => setFromCode(e.target.value)}
            className="w-full p-2.5 rounded-[10px] bg-[#1e293b] text-white border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option value="in">🇮🇳 India (Default)</option>
            <option value="us">🇺🇸 USA</option>
            <option value="gb">🇬🇧 UK</option>
            <option value="ae">🇦🇪 UAE</option>
            <option value="ca">🇨🇦 Canada</option>
            <option value="au">🇦🇺 Australia</option>
            <option value="sg">🇸🇬 Singapore</option>
            <option value="de">🇩🇪 Germany</option>
          </select>
        </div>

        <div>
          <label htmlFor="elig-purpose" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            2. Visa Type
          </label>
          <select
            id="elig-purpose"
            aria-label="Select your travel purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full p-2.5 rounded-[10px] bg-[#1e293b] text-white border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option>🎯 Tourist</option>
            <option>💼 Business</option>
            <option>💻 Work</option>
            <option>🎓 Student</option>
            <option>👨‍👩‍👧 Family</option>
            <option>🏠 PR</option>
          </select>
        </div>

        <div>
          <label htmlFor="elig-duration" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            3. Trip Duration
          </label>
          <select
            id="elig-duration"
            aria-label="Select intended duration of stay"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-2.5 rounded-[10px] bg-[#1e293b] text-white border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option>📅 15 Days</option>
            <option>📅 30 Days</option>
            <option>📅 90 Days</option>
            <option>📅 6 Months</option>
            <option>📅 1 Year+</option>
          </select>
        </div>

        <div>
          <label htmlFor="elig-passport" className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            4. Passport Validity
          </label>
          <select
            id="elig-passport"
            aria-label="Select passport validity status"
            value={passportValidity}
            onChange={(e) => setPassportValidity(e.target.value)}
            className="w-full p-2.5 rounded-[10px] bg-[#1e293b] text-white border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-400 cursor-pointer"
          >
            <option>📘 Passport Validity 6+ Months</option>
            <option>📕 Less than 6 Months</option>
          </select>
        </div>
      </div>

      {/* Row 2: 4 New AI Score Profile Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-700/70">
        <div>
          <label htmlFor="elig-income" className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
            5. Monthly Income (For AI Score)
          </label>
          <select
            id="elig-income"
            aria-label="Select Monthly Income"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="w-full p-2.5 rounded-[10px] bg-[#1e293b] text-white border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="< Rs 30k">&lt; Rs 30k / month</option>
            <option value="Rs 30k-60k">Rs 30k – 60k / month</option>
            <option value="Rs 60k-1L">Rs 60k – 1L / month</option>
            <option value="Rs 1L+">Rs 1L+ / month</option>
          </select>
        </div>

        <div>
          <label htmlFor="elig-balance" className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
            6. Bank Balance (For AI Score)
          </label>
          <select
            id="elig-balance"
            aria-label="Select Bank Balance"
            value={bankBalance}
            onChange={(e) => setBankBalance(e.target.value)}
            className="w-full p-2.5 rounded-[10px] bg-[#1e293b] text-white border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="< Rs 1L">&lt; Rs 1L Savings</option>
            <option value="Rs 1L-3L">Rs 1L – 3L Savings</option>
            <option value="Rs 3L-5L">Rs 3L – 5L Savings</option>
            <option value="Rs 5L+">Rs 5L+ Savings</option>
          </select>
        </div>

        <div>
          <label htmlFor="elig-travel" className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
            7. Travel History (For AI Score)
          </label>
          <select
            id="elig-travel"
            aria-label="Select Travel History"
            value={travelHistory}
            onChange={(e) => setTravelHistory(e.target.value)}
            className="w-full p-2.5 rounded-[10px] bg-[#1e293b] text-white border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="No Travel">No Travel (Fresh Passport)</option>
            <option value="1-2 Countries">1–2 Countries Visited</option>
            <option value="3+ Countries">3+ Countries Visited</option>
          </select>
        </div>

        <div>
          <label htmlFor="elig-job" className="block text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
            8. Job Type (For AI Score)
          </label>
          <select
            id="elig-job"
            aria-label="Select Job Type"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full p-2.5 rounded-[10px] bg-[#1e293b] text-white border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="Salaried">Salaried Employee</option>
            <option value="Business">Business / Self-Employed</option>
            <option value="Student">Student</option>
            <option value="Unemployed">Unemployed / Homemaker</option>
          </select>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={runAiEligibilityCheck}
        disabled={loadingAi}
        className="mt-4 bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] hover:from-[#1e40af] hover:to-[#1d4ed8] text-white py-3.5 px-6 rounded-xl font-black text-sm cursor-pointer w-full transition-all shadow-md flex items-center justify-center gap-2"
      >
        {loadingAi ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Calculating Your AI Eligibility Score...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Check Eligibility Now →</span>
          </>
        )}
      </button>

      {/* AI Result Container */}
      <div
        id="elig-result"
        style={{ display: checked ? 'block' : 'none' }}
        className={`mt-5 p-4 sm:p-6 rounded-2xl border ${verdictContainerClass} space-y-5`}
      >
        {/* Top Row: Big Circular Score + Progress Bar + Verdict + Why */}
        <div className="flex flex-col md:flex-row items-center gap-5 pb-4 border-b border-white/15">
          {/* Big Score Circle (e.g., 72/100) */}
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="9"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={circleColor}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white leading-none">
                {activeReport.score}<span className="text-xs font-bold text-slate-300">/100</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300 mt-1">
                {activeReport.source === 'rule-based' ? 'Rule-Based' : 'AI Score'}
              </span>
            </div>
          </div>

          {/* Progress Bar + Verdict + Why */}
          <div className="flex-1 space-y-2.5 w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${verdictBadgeClass}`}>
                  {activeReport.verdict} ({activeReport.score}/100)
                </span>
                <span className="text-xs font-bold text-slate-300 bg-black/30 px-2.5 py-1 rounded-full border border-white/10">
                  {activeReport.source === 'rule-based' ? 'AI Score (Rule-Based)' : 'AI Score (Gemini AI)'}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-200">
                {resolvedFlag} {resolvedName} • Processing: {meta.processing}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(5, Math.min(100, activeReport.score))}%`,
                  backgroundColor: circleColor
                }}
              />
            </div>

            {/* Why? — 2-3 lines in simple Pure English */}
            <div className="bg-black/25 p-3.5 rounded-xl border border-white/10">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-300 mb-1">
                Why This Score?
              </div>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                {activeReport.why}
              </p>
            </div>
          </div>
        </div>

        {/* What to Fix? — 2-3 Actionable Tips in Cards */}
        <div className="space-y-2.5">
          <div className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>What to Fix &amp; Actionable Tips to Boost Your Score:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeReport.whatToFix.map((tip, idx) => (
              <div
                key={idx}
                className="bg-white text-slate-900 p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-blue-100 text-[#0B3D91] px-2 py-0.5 rounded-full">
                    Tip #{idx + 1}
                  </span>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">{tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Alternative Countries + Tailored Documents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Best Alternative Countries */}
          <div className="bg-black/25 p-4 rounded-xl border border-white/15 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>Best Alternative Countries (High Approval First):</span>
              </div>
            </div>
            <div className="space-y-2.5">
              {activeReport.alternativeCountries.map((alt, i) => (
                <div
                  key={i}
                  className="bg-slate-900/90 p-3 rounded-xl border border-slate-700 flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                      <span>{alt.flag}</span>
                      <span>Try {alt.name}</span>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] font-black">
                        {alt.chance}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{alt.reason}</p>
                  </div>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate(`/${fromCode}-to-${alt.code}`)}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black rounded-lg shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents Needed for This User */}
          <div className="bg-black/25 p-4 rounded-xl border border-white/15 space-y-2.5">
            <div className="text-xs font-black uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Documents Needed for Your Profile ({jobType}):</span>
            </div>
            <ul className="space-y-1.5 text-xs text-white/95">
              {activeReport.documentsNeeded.map((docItem, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-black mt-0.5">✓</span>
                  <span>{docItem}</span>
                </li>
              ))}
            </ul>
            <div className="pt-1 text-[11px] text-slate-300">
              🏛 Consular Jurisdiction:{' '}
              <strong className="text-white">
                {embassy.inIndia?.[0]?.city || `Embassy of ${resolvedName}, New Delhi`}
              </strong>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadAiReportPdf}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black cursor-pointer transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download My AI Report PDF</span>
          </button>

          <a
            href={`https://www.booking.com/city/${destCode}/${capitalSlug}.html?aid=8119919&label=elig-${fromCode}-to-${destCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#003580] hover:bg-[#002860] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold no-underline transition-colors"
          >
            🏨 Hotels in {meta.capital} from {meta.hotelPrice} (Booking.com) →
          </a>

          {onNavigate && (
            <button
              type="button"
              onClick={() => {
                const catMap: Record<string, string> = {
                  Tourist: 'tourist',
                  Business: 'business',
                  Work: 'work',
                  Student: 'student',
                  Family: 'family',
                  PR: 'pr'
                };
                const cleanKey = Object.keys(catMap).find((k) => purpose.includes(k)) || 'Tourist';
                onNavigate(`/${fromCode}-to-${destCode}-${catMap[cleanKey]}`);
              }}
              className="bg-white/15 hover:bg-white/25 border border-white/25 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer transition-colors"
            >
              Explore All {count} {resolvedName} Visas →
            </button>
          )}
        </div>

        {/* Mandatory Disclaimer */}
        <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
          <span>
            <strong>Disclaimer:</strong> AI Score is an estimate based on common patterns, not a guarantee. Final decision is embassy&apos;s.
          </span>
        </div>
      </div>
    </div>
  );
};
