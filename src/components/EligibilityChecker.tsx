import React, { useState, useEffect } from 'react';
import { getCountryMeta, getCapitalSlug } from '../data/countryMetaData';
import { getLiveVisaCount, NAME_MAP_249, FLAG_MAP_249 } from '../data/fullVisaDatabase';
import { getEmbassyInfo } from '../data/embassyAddresses';
import { generateChecklistPDF } from '../utils/countryLiveUtils';
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
  const [checked, setChecked] = useState<boolean>(false);

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
  const meta = getCountryMeta(destCode);
  const count = getLiveVisaCount(destCode);
  const embassy = getEmbassyInfo(destCode.toUpperCase());
  const capitalSlug = getCapitalSlug(meta.capital);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).checkEligibility = () => setChecked(true);
    }
  }, []);

  const isPassportInvalid = passportValidity.includes('Less than 6 Months');
  const isTourist = purpose.includes('Tourist');
  const isWork = purpose.includes('Work');
  const isStudent = purpose.includes('Student');
  const isBusiness = purpose.includes('Business');
  const isShortStay =
    duration.includes('15 Days') || duration.includes('30 Days') || duration.includes('90 Days');

  const getStatusBanner = () => {
    if (isPassportInvalid) {
      return {
        tone: 'red',
        bg: 'bg-red-950/90 border-red-500/60 text-red-100',
        badge: 'bg-red-600 text-white',
        title: `❌ Not Eligible - Passport must have 6+ months validity - Renew first`,
        subtitle: `Most consulates and airlines for ${resolvedName} strictly enforce the 6-month minimum passport validity rule beyond your intended departure date.`,
        fee: 'Renew Passport First ($40-$150)',
        docs: [
          'Current expiring passport + self-attested copies',
          'Passport renewal application receipt (PSK / Consulate)',
          'Address proof & identity verification'
        ]
      };
    }

    if (isTourist && isShortStay) {
      return {
        tone: 'green',
        bg: 'bg-emerald-950/90 border-emerald-500/60 text-emerald-100',
        badge: 'bg-emerald-500 text-slate-950',
        title: `✅ Highly Eligible - ${resolvedName} Tourist Visa (${meta.processing}) - Success Rate ${meta.successRate} - ${count} visa options`,
        subtitle: `Strong approval profile for ${duration.replace('📅 ', '')} tourist stay in ${resolvedName}. Apply online or via VFS Global with standard financial & travel proofs.`,
        fee: '$35 - $185 (Official Tourist Visa Fee)',
        docs: [
          'Valid Passport (6+ months validity, 2 blank pages)',
          'Recent Bank Statements (last 6 months showing sufficient funds)',
          'Confirmed Return Flight Ticket & Hotel Booking in ' + meta.capital,
          'Travel Medical Insurance ($50,000 coverage)',
          'Income Tax Returns (ITR) / Salary Slips & Employer NOC'
        ]
      };
    }

    if (isWork) {
      return {
        tone: 'yellow',
        bg: 'bg-amber-950/90 border-amber-500/60 text-amber-100',
        badge: 'bg-amber-400 text-slate-950',
        title: `⚠️ Eligible with Job Offer - Need ${resolvedName} work permit + LMIA/Employer sponsorship`,
        subtitle: `Top hiring sectors in ${resolvedName}: ${meta.topJobs}. Requires an approved employment contract and sponsor license from a registered ${resolvedName} employer.`,
        fee: '$190 - $1,000 (Work Permit / Sponsorship Fee)',
        docs: [
          `Official Job Offer & Signed Employment Contract from ${resolvedName} Employer`,
          'Employer Sponsorship Certificate / Labor Market Test (LMIA / CoS)',
          'University Degree Certificates & Professional Experience Letters',
          'Police Clearance Certificate (PCC) & Medical Fitness Report',
          'Valid Passport (6+ months validity) & CV/Resume'
        ]
      };
    }

    if (isStudent) {
      return {
        tone: 'yellow',
        bg: 'bg-amber-950/90 border-amber-500/60 text-amber-100',
        badge: 'bg-amber-400 text-slate-950',
        title: `🎓 Eligible with Admission Offer - ${resolvedName} Student Visa (${meta.processing})`,
        subtitle: `Top Universities in ${resolvedName}: ${meta.topUnis}. Requires an unconditional Letter of Acceptance (CAS / I-20 / LOA) and proof of tuition + living funds.`,
        fee: '$150 - $450 (Student Visa Application Fee)',
        docs: [
          `Official Letter of Acceptance from a recognized ${resolvedName} institution`,
          'Proof of Tuition Fee Payment & 1-Year Living Expenses (Bank/Education Loan)',
          'IELTS / TOEFL / PTE English Proficiency Score Report',
          'Academic Transcripts, Degree Certificates & Statement of Purpose (SOP)',
          'Medical Insurance & Valid Passport (6+ months validity)'
        ]
      };
    }

    if (isBusiness) {
      return {
        tone: 'green',
        bg: 'bg-emerald-950/90 border-emerald-500/60 text-emerald-100',
        badge: 'bg-emerald-500 text-slate-950',
        title: `✅ Eligible - ${resolvedName} Business Visa (${meta.processing}) - Success Rate ${meta.successRate}`,
        subtitle: `Ideal for corporate meetings, conferences, and trade events in ${meta.capital}. Requires an official business invitation letter from the host company.`,
        fee: '$80 - $220 (Business Visa Fee)',
        docs: [
          `Official Business Invitation Letter from host company in ${resolvedName}`,
          'Employer Dispatch / Sponsorship Letter stating purpose and funding',
          'Company Registration / GST / Incorporation Certificate & 6-Month Bank Statement',
          'Personal 6-Month Bank Statements & ITR (last 3 years)',
          'Return Flight Itinerary & Hotel Reservation in ' + meta.capital
        ]
      };
    }

    return {
      tone: 'yellow',
      bg: 'bg-blue-950/90 border-blue-400/60 text-blue-100',
      badge: 'bg-blue-400 text-slate-950',
      title: `✅ Eligible for ${resolvedName} ${purpose.replace(/^[^\s]+\s/, '')} Pathway (${count} Visa Options Available)`,
      subtitle: `Processing time averages ${meta.processing} with a ${meta.successRate} approval rate for complete applications.`,
      fee: '$120 - $600 (Official Consular Fee)',
      docs: [
        'Valid Passport (minimum 6+ months validity)',
        'Sponsor / Relationship / Eligibility Proof & Civil Documents',
        'Last 6 Months Verified Bank Statements & Tax Returns (ITR)',
        'Police Clearance Certificate (PCC) & Medical Examination',
        'Confirmed Accommodation & Return/Onward Travel Booking'
      ]
    };
  };

  const status = getStatusBanner();
  const allCountryCodes = Object.keys(NAME_MAP_249).sort((a, b) =>
    (NAME_MAP_249[a] || a).localeCompare(NAME_MAP_249[b] || b)
  );

  return (
    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-[20px] p-5 sm:p-6 text-white mb-6 border border-slate-700/80 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-[22px] font-extrabold tracking-tight flex items-center gap-2">
            <span>{ui.eligibility}</span>
          </h2>
          <p className="text-[#94a3b8] text-[13px] mt-1">
            {ui.eligibilitySub.replace('{country}', `${resolvedFlag} ${resolvedName}`)} ({count} {ui.visas})
          </p>
        </div>
        {showDestinationPicker && (
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-600 rounded-xl px-3 py-1.5 text-xs">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <select
          id="elig-from"
          aria-label="Select your passport or origin country"
          value={fromCode}
          onChange={(e) => setFromCode(e.target.value)}
          className="p-3 rounded-[10px] bg-[#1e293b] text-white border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-400 cursor-pointer"
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

        <select
          id="elig-purpose"
          aria-label="Select your travel purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="p-3 rounded-[10px] bg-[#1e293b] text-white border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-400 cursor-pointer"
        >
          <option>🎯 Tourist</option>
          <option>💼 Business</option>
          <option>💻 Work</option>
          <option>🎓 Student</option>
          <option>👨‍👩‍👧 Family</option>
          <option>🏠 PR</option>
        </select>

        <select
          id="elig-duration"
          aria-label="Select intended duration of stay"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="p-3 rounded-[10px] bg-[#1e293b] text-white border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-400 cursor-pointer"
        >
          <option>📅 15 Days</option>
          <option>📅 30 Days</option>
          <option>📅 90 Days</option>
          <option>📅 6 Months</option>
          <option>📅 1 Year+</option>
        </select>

        <select
          id="elig-passport"
          aria-label="Select passport validity status"
          value={passportValidity}
          onChange={(e) => setPassportValidity(e.target.value)}
          className="p-3 rounded-[10px] bg-[#1e293b] text-white border border-[#334155] text-xs sm:text-sm font-semibold focus:outline-none focus:border-blue-400 cursor-pointer"
        >
          <option>📘 Passport Validity 6+ Months</option>
          <option>📕 Less than 6 Months</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => setChecked(true)}
        className="mt-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white py-3 px-6 rounded-[10px] font-extrabold text-sm cursor-pointer w-full transition-colors shadow-md"
      >
        Check Eligibility Now →
      </button>

      {/* Result Container */}
      <div
        id="elig-result"
        style={{ display: checked ? 'block' : 'none' }}
        className={`mt-4 p-4 sm:p-5 rounded-xl border ${status.bg} space-y-3`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-extrabold text-sm sm:text-base">{status.title}</div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${status.badge}`}>
            Success Rate: {meta.successRate}
          </span>
        </div>
        <p className="text-xs sm:text-sm opacity-90 leading-relaxed">{status.subtitle}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div className="bg-black/25 p-2.5 rounded-lg border border-white/10">
            <span className="text-slate-300 block font-semibold">⏱ Processing Time</span>
            <span className="font-bold text-white mt-0.5 block">{meta.processing}</span>
          </div>
          <div className="bg-black/25 p-2.5 rounded-lg border border-white/10">
            <span className="text-slate-300 block font-semibold">💵 Estimated Visa Fee</span>
            <span className="font-bold text-white mt-0.5 block">{status.fee}</span>
          </div>
          <div className="bg-black/25 p-2.5 rounded-lg border border-white/10">
            <span className="text-slate-300 block font-semibold">🏛 Embassy / VFS</span>
            <span className="font-bold text-white mt-0.5 block truncate">
              {embassy.inIndia?.[0]?.city || `Embassy of ${resolvedName}, New Delhi`}
            </span>
          </div>
        </div>

        <div className="bg-black/20 p-3 rounded-lg border border-white/10 text-xs">
          <div className="font-bold text-white mb-1.5">📋 Mandatory Documents Needed:</div>
          <ul className="space-y-1 list-disc list-inside opacity-95">
            {status.docs.map((doc, i) => (
              <li key={i}>{doc}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() =>
              generateChecklistPDF({
                visaName: `${resolvedName} ${purpose.replace(/^[^\s]+\s/, '')} Visa`,
                countryName: resolvedName,
                countryCode: destCode,
                fee: status.fee,
                processing: meta.processing,
                docs: status.docs
              })
            }
            className="bg-white text-slate-900 hover:bg-slate-100 px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition-colors"
          >
            📄 Download Checklist PDF
          </button>

          <a
            href={`https://www.booking.com/city/${destCode}/${capitalSlug}.html?aid=8119919&label=elig-${fromCode}-to-${destCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#003580] hover:bg-[#002860] text-white px-3.5 py-2 rounded-lg text-xs font-extrabold no-underline transition-colors"
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
              className="bg-blue-500 hover:bg-blue-400 text-white px-3.5 py-2 rounded-lg text-xs font-extrabold cursor-pointer transition-colors"
            >
              Explore All {count} {resolvedName} Visas →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
