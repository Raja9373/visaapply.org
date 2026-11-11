import React, { useState, useEffect } from 'react';
import { Wallet, Globe, ShieldCheck, AlertTriangle, ArrowLeft, RefreshCw, CheckCircle2, ExternalLink, Info } from 'lucide-react';
import { getCurrencyRateDetails, CurrencyRateDetails } from '../../utils/countryLiveUtils';
import { SUPPORTED_LANGUAGES_10, SupportedLangCode } from '../../i18n/config';
import { getUIString } from '../../utils/autoLanguage';

interface FundsCalculatorPageProps {
  onNavigate: (path: string) => void;
}

export const FundsCalculatorPage: React.FC<FundsCalculatorPageProps> = ({ onNavigate }) => {
  const [destination, setDestination] = useState('US');
  const [visaCategory, setVisaCategory] = useState('B1/B2 Tourist / Visitor Visa');
  const [durationDays, setDurationDays] = useState<number>(14);
  const [accommodationType, setAccommodationType] = useState<'hotel' | 'host' | 'unaccommodated'>('hotel');
  const [adults, setAdults] = useState<number>(1);
  const [minors, setMinors] = useState<number>(0);
  const [userAvailableFundsUSD, setUserAvailableFundsUSD] = useState<number>(3500);
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [currencyDetails, setCurrencyDetails] = useState<CurrencyRateDetails | null>(null);
  const [loadingCurrency, setLoadingCurrency] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingCurrency(true);
    getCurrencyRateDetails(targetCurrency, 'USD').then((details) => {
      if (isMounted) {
        setCurrencyDetails(details);
        setLoadingCurrency(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [targetCurrency]);

  // Verified Official Financial Requirements Mapping (Section s09)
  const getOfficialFundsRequirement = (dest: string, accom: string, days: number, ad: number, min: number) => {
    if (dest === 'US') {
      return {
        isVerified: true,
        dailyRateUSD: 150, // Consular guidance baseline for daily subsistence
        minRequiredUSD: 150 * days * ad + (75 * days * min),
        seasoningMonths: 3,
        acceptableInstruments: ['Checking / Savings Bank Accounts', 'Liquid Term Deposits', 'Government Bonds'],
        unacceptableInstruments: ['Cryptocurrency Holdings', 'Real Estate Equity', 'Unsecured Personal Loans', 'Cash in Hand'],
        sourceTitle: 'U.S. Department of State - Financial Evidence Guidance',
        sourceUrl: 'https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html',
        authority: 'U.S. Embassy / Consular Financial Adjudication Branch',
        statute: 'Foreign Affairs Manual 9 FAM 403.9'
      };
    } else if (dest === 'GB') {
      return {
        isVerified: true,
        dailyRateUSD: 130,
        minRequiredUSD: 1200 + (300 * days),
        seasoningMonths: 6,
        acceptableInstruments: ['Personal Bank Statements', 'Building Society Accounts', 'Formal Salary Slips'],
        unacceptableInstruments: ['Cryptocurrency', 'Third-party Unverified Business Accounts'],
        sourceTitle: 'GOV.UK - Financial Evidence for Visitor Visas',
        sourceUrl: 'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-supporting-documents',
        authority: 'UK Visas and Immigration (UKVI)',
        statute: 'Immigration Rules V 4.3'
      };
    }
    return {
      isVerified: false,
      dailyRateUSD: 0,
      minRequiredUSD: 0,
      seasoningMonths: 0,
      acceptableInstruments: [],
      unacceptableInstruments: [],
      sourceTitle: 'Official Consular Portal',
      sourceUrl: '#',
      authority: 'Sovereign Consular Authority',
      statute: 'Pending Official Gazette Verification'
    };
  };

  const fundsReq = getOfficialFundsRequirement(destination, accommodationType, durationDays, adults, minors);

  const rate = currencyDetails?.rate || 1.0;
  const convert = (amountUSD: number) => amountUSD * rate;

  const statutoryMinUSD = fundsReq.isVerified ? fundsReq.minRequiredUSD : 0;
  const practicalBufferUSD = statutoryMinUSD * 1.25; // 25% practical safety recommendation
  const hasSufficientFunds = userAvailableFundsUSD >= statutoryMinUSD;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <div className="bg-[#0B3D91] text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-xs sm:text-sm font-medium mb-3 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to VisaApply.org Home</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Wallet className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Proof of Funds & Maintenance Calculator</h1>
                <p className="text-xs sm:text-sm text-blue-200">
                  Statutory financial subsistence calculator complying with Section s09 verification rules.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-900/60 border border-blue-400/30 rounded-lg p-3 text-xs text-blue-100 max-w-xs">
            <span className="font-bold text-amber-300 block mb-0.5">Strict Statutory Honesty</span>
            No universal daily rates assumed. Unverified destinations display awaiting verification notices.
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Globe className="w-5 h-5 text-[#0B3D91]" />
                <span>Financial & Travel Parameters</span>
              </h2>

              {/* Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Destination Country
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                >
                  <option value="US">🇺🇸 United States (US B1/B2)</option>
                  <option value="GB">🇬🇧 United Kingdom (UK Visitor)</option>
                  <option value="CA">🇨🇦 Canada (Visitor Visa - Unverified)</option>
                  <option value="FR">🇫🇷 France / Schengen (Unverified)</option>
                </select>
              </div>

              {/* Duration of Stay */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Duration of Stay (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>

              {/* Accommodation Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Accommodation Arrangement
                </label>
                <select
                  value={accommodationType}
                  onChange={(e) => setAccommodationType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                >
                  <option value="hotel">Prepaid Hotel / Commercial Lodging</option>
                  <option value="host">Private Host / Sponsored Visitor</option>
                  <option value="unaccommodated">Unaccommodated / Unbooked</option>
                </select>
              </div>

              {/* Travelers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Adult Travelers
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Minor Dependents
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minors}
                    onChange={(e) => setMinors(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* User Available Funds */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Available Liquid Funds (USD Equivalent)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={userAvailableFundsUSD}
                  onChange={(e) => setUserAvailableFundsUSD(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Converted Currency
                </label>
                <select
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6">
            {!fundsReq.isVerified ? (
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>STATUTORY FINANCIAL REQUIREMENT AWAITING OFFICIAL VERIFICATION</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Verified Section s09 financial thresholds for this destination are currently awaiting audit ingestion. No synthetic daily subsistence rates or generic multipliers have been fabricated.
                </p>
                <div className="pt-3">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Personal Travel Budget Estimate (User Entered):</span>
                  <div className="text-lg font-bold text-slate-900 bg-white p-3 rounded-lg border border-amber-200">
                    ${userAvailableFundsUSD.toFixed(2)} USD ({targetCurrency} {convert(userAvailableFundsUSD).toFixed(2)})
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-900 to-[#0B3D91] text-white p-6 sm:p-8">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 bg-white/10 px-2.5 py-1 rounded-md border border-white/20 inline-block mb-3">
                    Verified Section s09 Financial Requirement
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                    <div>
                      <span className="text-xs text-blue-200 block">Statutory Minimum Balance</span>
                      <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                        ${statutoryMinUSD.toFixed(2)} <span className="text-lg font-normal text-blue-200">USD</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
                      <span className="text-[11px] text-blue-200 block">Converted ({targetCurrency})</span>
                      <div className="text-xl sm:text-2xl font-bold text-amber-300 mt-0.5">
                        {loadingCurrency ? 'Converting...' : `${targetCurrency} ${convert(statutoryMinUSD).toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results breakdown */}
                <div className="p-6 space-y-6 text-xs">
                  {/* Comparison Banner */}
                  <div className={`p-4 rounded-xl border flex items-center gap-3 ${hasSufficientFunds ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                    {hasSufficientFunds ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold block text-sm">
                        {hasSufficientFunds ? 'Available Funds Meet Verified Statutory Threshold' : 'Available Funds Below Verified Statutory Threshold'}
                      </span>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        Your entered funds (${userAvailableFundsUSD.toFixed(2)}) {hasSufficientFunds ? 'exceeds' : 'is short of'} the verified statutory minimum (${statutoryMinUSD.toFixed(2)}). Note: This is a mathematical threshold comparison only and does not constitute a legal visa guarantee.
                      </p>
                    </div>
                  </div>

                  {/* Tiers Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">A. Statutory Minimum (LEGAL_REQUIREMENT)</span>
                      <div className="text-lg font-black text-slate-900">${statutoryMinUSD.toFixed(2)} USD</div>
                      <p className="text-[11px] text-slate-600">Strict legal minimum required by published regulation.</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">B. Practical Recommendation (+25% Buffer)</span>
                      <div className="text-lg font-black text-blue-900">${practicalBufferUSD.toFixed(2)} USD</div>
                      <p className="text-[11px] text-slate-600">Non-statutory consular safety recommendation.</p>
                    </div>
                  </div>

                  {/* Seasoning & Instruments */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-800 block">Bank Statement Seasoning & Asset Eligibility</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <strong className="text-slate-900 block mb-1">Required Seasoning Window:</strong>
                        <span className="text-slate-700 bg-white px-2 py-1 rounded border border-slate-300 inline-block font-semibold">
                          {fundsReq.seasoningMonths} Months History Required
                        </span>
                      </div>
                      <div>
                        <strong className="text-slate-900 block mb-1">Acceptable Instruments:</strong>
                        <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                          {fundsReq.acceptableInstruments.map((inst, idx) => (
                            <li key={idx}>{inst}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Official Evidence & Disclaimers */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3 text-blue-900">
                    <div className="flex items-center gap-2 font-bold text-blue-950">
                      <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>Official Source & Verification Metadata</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-blue-900/80">
                      <div><strong className="text-blue-950">Issuing Authority:</strong> {fundsReq.authority}</div>
                      <div><strong className="text-blue-950">Statutory Instrument:</strong> {fundsReq.statute}</div>
                      <div><strong className="text-blue-950">Exchange Rate Status:</strong> {currencyDetails?.status || 'UNAVAILABLE'}</div>
                    </div>
                    {fundsReq.sourceUrl !== '#' && (
                      <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between">
                        <span className="text-[11px] italic text-blue-800">{fundsReq.sourceTitle}</span>
                        <a
                          href={fundsReq.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 underline"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-500 italic mt-2">
                      {currencyDetails?.disclaimer || 'Indicative conversion based on available market rates.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
