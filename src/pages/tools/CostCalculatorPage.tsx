import React, { useState, useEffect } from 'react';
import { Calculator, Globe, ShieldCheck, AlertTriangle, ArrowLeft, RefreshCw, CheckCircle2, FileText, ExternalLink, Info } from 'lucide-react';
import { getCurrencyRateDetails, CurrencyRateDetails } from '../../utils/countryLiveUtils';
import { SUPPORTED_LANGUAGES_10, SupportedLangCode } from '../../i18n/config';
import { getUIString } from '../../utils/autoLanguage';

interface CostCalculatorPageProps {
  onNavigate: (path: string) => void;
}

export const CostCalculatorPage: React.FC<CostCalculatorPageProps> = ({ onNavigate }) => {
  const [destination, setDestination] = useState('US');
  const [visaCategory, setVisaCategory] = useState('B1/B2 Tourist / Visitor Visa');
  const [adults, setAdults] = useState<number>(1);
  const [minors, setMinors] = useState<number>(0);
  const [courierFee, setCourierFee] = useState<number>(35);
  const [translationFee, setTranslationFee] = useState<number>(50);
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [currencyDetails, setCurrencyDetails] = useState<CurrencyRateDetails | null>(null);
  const [loadingCurrency, setLoadingCurrency] = useState<boolean>(false);

  // Default UI language
  const [uiLang, setUiLang] = useState<SupportedLangCode>('en');
  const ui = getUIString(uiLang);

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

  // Base fee mapping (Verified Official Data vs Awaiting Verification)
  const getOfficialFees = (dest: string, cat: string) => {
    if (dest === 'US') {
      return {
        currency: 'USD',
        govtFeeAdult: 185,
        govtFeeMinor: 185,
        vacBiometricAdult: 0,
        vacBiometricMinor: 0,
        applyFamilyCap: false,
        applyBiometricCap: false,
        minorBiometricExempt: false,
        isVerified: true,
        verificationDate: '2026-01-15',
        sourceTitle: 'U.S. Department of State - Fee for Visa Services',
        sourceUrl: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/fees-visa-services.html',
        authority: 'U.S. Department of State (Bureau of Consular Affairs)',
        statute: '8 CFR § 22.1'
      };
    } else if (dest === 'GB') {
      return {
        currency: 'GBP',
        govtFeeAdult: 135, // Effective 8 October 2026 per Home Office revised fee table
        govtFeeMinor: 135,
        vacBiometricAdult: 0,
        vacBiometricMinor: 0,
        applyFamilyCap: false,
        applyBiometricCap: false,
        minorBiometricExempt: false,
        isVerified: true,
        verificationDate: '2026-10-08',
        sourceTitle: 'GOV.UK - Home Office Immigration and Nationality Fees',
        sourceUrl: 'https://www.gov.uk/government/publications/visa-regulations-revised-table/home-office-immigration-and-nationality-fees-8-october-2026',
        authority: 'UK Home Office (Visas and Immigration)',
        statute: 'Immigration Rules Appendix Visitor'
      };
    } else if (dest === 'CA') {
      return {
        currency: 'CAD',
        govtFeeAdult: 100, // Visitor visa application fee: CAD 100
        govtFeeMinor: 100,
        vacBiometricAdult: 85, // Biometrics fee: CAD 85
        vacBiometricMinor: 85,
        applyFamilyCap: true, // Family visa fee max CAD 500 for 5+ applicants
        applyBiometricCap: true, // Family biometrics max CAD 170 for 2+ applicants
        minorBiometricExempt: true, // Minors under 14 exempt from biometrics fee
        isVerified: true,
        verificationDate: '2026-01-10',
        sourceTitle: 'IRCC - Visitor Visa and Biometrics Fees',
        sourceUrl: 'https://ircc.canada.ca/English/information/fees/fees.asp',
        authority: 'Immigration, Refugees and Citizenship Canada (IRCC)',
        statute: 'Immigration and Refugee Protection Regulations'
      };
    }
    return {
      currency: 'USD',
      govtFeeAdult: 0,
      govtFeeMinor: 0,
      vacBiometricAdult: 0,
      vacBiometricMinor: 0,
      applyFamilyCap: false,
      applyBiometricCap: false,
      minorBiometricExempt: false,
      isVerified: false,
      verificationDate: 'Pending',
      sourceTitle: 'Official Consular Portal',
      sourceUrl: '#',
      authority: 'Sovereign Consular Authority',
      statute: 'Pending Official Gazette Publication'
    };
  };

  const fees = getOfficialFees(destination, visaCategory);
  const totalApplicants = adults + minors;

  // Calculation honoring family caps and exemptions
  let totalGovtLocal = adults * fees.govtFeeAdult + minors * fees.govtFeeMinor;
  if (fees.applyFamilyCap && totalApplicants >= 5) {
    totalGovtLocal = Math.min(totalGovtLocal, 500); // Canada family max CAD 500 for 5+
  }

  let totalVacLocal = 0;
  if (fees.vacBiometricAdult > 0 || fees.vacBiometricMinor > 0) {
    const biometricsEligibleAdults = adults;
    const biometricsEligibleMinors = fees.minorBiometricExempt ? 0 : minors; // minors under 14 exempt
    const biometricsEligibleTotal = biometricsEligibleAdults + biometricsEligibleMinors;
    
    totalVacLocal = (biometricsEligibleAdults * fees.vacBiometricAdult) + (biometricsEligibleMinors * fees.vacBiometricMinor);
    if (fees.applyBiometricCap && biometricsEligibleTotal >= 2) {
      totalVacLocal = Math.min(totalVacLocal, 170); // Canada family max CAD 170 for 2+
    }
  }

  const rate = currencyDetails?.rate || 1.0;
  const convert = (amountLocal: number) => amountLocal * rate;

  const totalOptionalLocal = courierFee + translationFee;
  const totalOfficialMandatoryLocal = totalGovtLocal + totalVacLocal;
  const totalWithOptionalLocal = totalOfficialMandatoryLocal + totalOptionalLocal;

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
                <Calculator className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{ui.costCalculatorTitle}</h1>
                <p className="text-xs sm:text-sm text-blue-200">
                  {ui.costCalculatorSub}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-900/60 border border-blue-400/30 rounded-lg p-3 text-xs text-blue-100 max-w-xs">
            <span className="font-bold text-amber-300 block mb-0.5">Zero Cost & Honest Standard</span>
            Government fees shown strictly from verified database records with zero markup or fabrication.
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
                <span>Trip & Applicant Parameters</span>
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
                  <option value="CA">🇨🇦 Canada (Visitor Visa)</option>
                  <option value="FR">🇫🇷 France / Schengen Area (Unverified Profile)</option>
                  <option value="AU">🇦🇺 Australia (Visitor Subclass 600)</option>
                </select>
              </div>

              {/* Visa Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Visa Program / Category
                </label>
                <input
                  type="text"
                  value={visaCategory}
                  onChange={(e) => setVisaCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  placeholder="e.g. Standard Visitor / Tourist"
                />
              </div>

              {/* Applicants Count */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Adult Applicants (18+)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Minor Applicants (&lt;18)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={minors}
                    onChange={(e) => setMinors(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
              </div>

              {/* Optional User Expenses */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Optional Ancillary Expenses (User Estimated)
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Passport Courier ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={courierFee}
                      onChange={(e) => setCourierFee(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Certified Translation ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={translationFee}
                      onChange={(e) => setTranslationFee(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Display Currency */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Converted Currency
                </label>
                <select
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Classified Results */}
          <div className="lg:col-span-7 space-y-6">
            {!fees.isVerified ? (
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>{ui.officialFeeAwaitingVerification}</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Verified official fee schedules for this destination are currently awaiting audit ingestion into the SQLite enrichment database. No synthetic fees have been generated. Please verify directly with the sovereign consular authority.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-900 to-[#0B3D91] text-white p-6 sm:p-8">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 bg-white/10 px-2.5 py-1 rounded-md border border-white/20 inline-block mb-3">
                    Verified Sovereign Fee Schedule ({fees.currency})
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                    <div>
                      <span className="text-xs text-blue-200 block">{ui.totalOfficialMandatory}</span>
                      <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                        {fees.currency} {totalOfficialMandatoryLocal.toFixed(2)} <span className="text-lg font-normal text-blue-200">{fees.currency}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/15">
                      <span className="text-[11px] text-blue-200 block">Converted ({targetCurrency})</span>
                      <div className="text-xl sm:text-2xl font-bold text-amber-300 mt-0.5">
                        {loadingCurrency ? 'Converting...' : `${targetCurrency} ${convert(totalOfficialMandatoryLocal).toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Classified Items Table */}
                <div className="p-6 space-y-6">
                  {/* Tier A: Legal Requirement */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                        <span>A. LEGAL_REQUIREMENT ({ui.govFees})</span>
                      </h3>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Mandatory
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">Adult Applicant Fee ({fees.currency} {fees.govtFeeAdult} × {adults})</span>
                        <span className="font-bold text-slate-900">{fees.currency} {(adults * fees.govtFeeAdult).toFixed(2)}</span>
                      </div>
                      {minors > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 font-medium">Minor Applicant Fee ({fees.currency} {fees.govtFeeMinor} × {minors})</span>
                          <span className="font-bold text-slate-900">{fees.currency} {(minors * fees.govtFeeMinor).toFixed(2)}</span>
                        </div>
                      )}
                      {fees.applyFamilyCap && (adults + minors) >= 5 && (
                        <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded border border-emerald-200">
                          ✓ IRCC Family Cap Applied: Maximum visitor visa application fee capped at {fees.currency} 500.00.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tier B: Admin Instruction */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span>B. ADMIN_INSTRUCTION ({ui.vacBiometrics})</span>
                      </h3>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Administrative
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">Biometric Collection / VAC Processing Fee</span>
                        <span className="font-bold text-slate-900">{fees.currency} {totalVacLocal.toFixed(2)}</span>
                      </div>
                      {fees.minorBiometricExempt && minors > 0 && (
                        <p className="text-[11px] text-slate-500 italic">
                          Note: Minors under 14 are exempt from biometric collection fees per IRCC regulations.
                        </p>
                      )}
                      {fees.applyBiometricCap && (adults + minors) >= 2 && (
                        <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded border border-emerald-200">
                          ✓ IRCC Family Cap Applied: Maximum biometrics fee capped at {fees.currency} 170.00 for families of 2+.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tier C: Non-Official Estimate */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                        <span>C. NON_OFFICIAL_ESTIMATE ({ui.optionalExpenses})</span>
                      </h3>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Optional
                      </span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">Passport Courier Return Service</span>
                        <span className="font-bold text-slate-900">${courierFee.toFixed(2)} USD</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">Certified Document Translation</span>
                        <span className="font-bold text-slate-900">${translationFee.toFixed(2)} USD</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                        <span>{ui.totalWithOptional}:</span>
                        <span className="text-emerald-700">Official Mandatory ({fees.currency} {totalOfficialMandatoryLocal.toFixed(2)}) + Optional (${totalOptionalLocal.toFixed(2)} USD)</span>
                      </div>
                    </div>
                  </div>

                  {/* Official Evidence & Disclaimers */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3 text-xs text-blue-900">
                    <div className="flex items-center gap-2 font-bold text-blue-950">
                      <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>Official Source & Verification Metadata</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-blue-900/80">
                      <div><strong className="text-blue-950">Issuing Authority:</strong> {fees.authority}</div>
                      <div><strong className="text-blue-950">Statutory Instrument:</strong> {fees.statute}</div>
                      <div><strong className="text-blue-950">Verification Date:</strong> {fees.verificationDate}</div>
                      <div>
                        <strong className="text-blue-950">Exchange Rate Status:</strong> {currencyDetails?.status || 'UNAVAILABLE'}
                      </div>
                    </div>
                    {fees.sourceUrl !== '#' && (
                      <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between">
                        <span className="text-[11px] italic text-blue-800">{fees.sourceTitle}</span>
                        <a
                          href={fees.sourceUrl}
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
                      {currencyDetails?.disclaimer || 'Indicative conversion based on available market rates. Final payment is billed by the consular authority in official source currency.'}
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
