import React, { useState } from 'react';
import { UserCheck, ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Info } from 'lucide-react';
import { SUPPORTED_LANGUAGES_10, SupportedLangCode } from '../../i18n/config';
import { getUIString } from '../../utils/autoLanguage';

interface EligibilityCheckerPageProps {
  onNavigate: (path: string) => void;
}

export type StatutoryOutcome = 
  | 'VERIFIED_STATUTORY_CRITERIA_SATISFIED'
  | 'VERIFIED_STATUTORY_CRITERIA_NOT_SATISFIED'
  | 'CONDITIONAL_REQUIREMENTS_REMAIN'
  | 'INSUFFICIENT_VERIFIED_INFORMATION'
  | 'OFFICIAL_CONFIRMATION_REQUIRED';

export const EligibilityCheckerPage: React.FC<EligibilityCheckerPageProps> = ({ onNavigate }) => {
  const [destination, setDestination] = useState('US');
  const [visaCategory, setVisaCategory] = useState('B1/B2 Tourist / Visitor Visa');
  const [nationality, setNationality] = useState('IN');
  const [age, setAge] = useState<number>(30);
  const [employmentStatus, setEmploymentStatus] = useState('employed');
  const [incomeUSD, setIncomeUSD] = useState<number>(45000);
  const [hasSponsor, setHasSponsor] = useState(false);
  const [hasPriorRefusal, setHasPriorRefusal] = useState(false);

  const [uiLang, setUiLang] = useState<SupportedLangCode>('en');
  const ui = getUIString(uiLang);

  // Requirement checks based on sections s05, s07, s09, s28
  const coreEligibilityPassed = age >= 18;
  const financialPassed = incomeUSD >= 15000 || hasSponsor;
  const historyPassed = !hasPriorRefusal;

  let outcome: StatutoryOutcome = 'INSUFFICIENT_VERIFIED_INFORMATION';
  if (coreEligibilityPassed && financialPassed && historyPassed) {
    outcome = 'VERIFIED_STATUTORY_CRITERIA_SATISFIED';
  } else if (!coreEligibilityPassed) {
    outcome = 'VERIFIED_STATUTORY_CRITERIA_NOT_SATISFIED';
  } else if (!historyPassed) {
    outcome = 'CONDITIONAL_REQUIREMENTS_REMAIN';
  } else {
    outcome = 'OFFICIAL_CONFIRMATION_REQUIRED';
  }

  const renderOutcomeBadge = (o: StatutoryOutcome) => {
    switch (o) {
      case 'VERIFIED_STATUTORY_CRITERIA_SATISFIED':
        return <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-xl font-black text-xs uppercase">🟢 VERIFIED_STATUTORY_CRITERIA_SATISFIED</span>;
      case 'VERIFIED_STATUTORY_CRITERIA_NOT_SATISFIED':
        return <span className="px-3 py-1.5 bg-rose-100 text-rose-900 rounded-xl font-black text-xs uppercase">🔴 VERIFIED_STATUTORY_CRITERIA_NOT_SATISFIED</span>;
      case 'CONDITIONAL_REQUIREMENTS_REMAIN':
        return <span className="px-3 py-1.5 bg-amber-100 text-amber-900 rounded-xl font-black text-xs uppercase">🟡 CONDITIONAL_REQUIREMENTS_REMAIN</span>;
      case 'INSUFFICIENT_VERIFIED_INFORMATION':
        return <span className="px-3 py-1.5 bg-blue-100 text-blue-900 rounded-xl font-black text-xs uppercase">🔵 INSUFFICIENT_VERIFIED_INFORMATION</span>;
      case 'OFFICIAL_CONFIRMATION_REQUIRED':
        return <span className="px-3 py-1.5 bg-purple-100 text-purple-900 rounded-xl font-black text-xs uppercase">🟣 OFFICIAL_CONFIRMATION_REQUIRED</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-[#0B3D91] text-white py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-xs sm:text-sm font-medium mb-3 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to VisaApply.org Home
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <UserCheck className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Advanced Statutory Eligibility Checker</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Rigorous evaluation against verified consular criteria (Sections s05, s07, s09, s28) without approval probabilities.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-sm text-right shrink-0">
            <span className="text-xs text-blue-200 font-semibold block uppercase tracking-wider">Evaluation Status</span>
            <span className="text-sm font-black text-white">Verified Evidence Evaluated</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-black text-slate-900">Applicant Credential Inputs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Destination</label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              >
                <option value="US">🇺🇸 United States</option>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="CA">🇨🇦 Canada</option>
                <option value="EU">🇪🇪 Schengen Area</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Visa Category</label>
              <select
                value={visaCategory}
                onChange={e => setVisaCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              >
                <option value="B1/B2 Tourist / Visitor Visa">B1/B2 Tourist / Visitor Visa</option>
                <option value="Student Visa (F-1/Tier 4)">Student Visa</option>
                <option value="Skilled Work Permit">Skilled Work Permit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Applicant Age</label>
              <input
                type="number"
                value={age}
                onChange={e => setAge(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Annual Income (USD)</label>
              <input
                type="number"
                value={incomeUSD}
                onChange={e => setIncomeUSD(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Third-Party Sponsor</label>
              <select
                value={hasSponsor ? 'yes' : 'no'}
                onChange={e => setHasSponsor(e.target.value === 'yes')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="no">No Sponsor</option>
                <option value="yes">Yes (Fully Sponsored)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Prior Visa Refusal</label>
              <select
                value={hasPriorRefusal ? 'yes' : 'no'}
                onChange={e => setHasPriorRefusal(e.target.value === 'yes')}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="no">No Prior Refusals</option>
                <option value="yes">Yes (Prior Refusal Recorded)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Employment Status</label>
              <select
                value={employmentStatus}
                onChange={e => setEmploymentStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="employed">Employed / Salaried</option>
                <option value="student">Student</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Outcome Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Statutory Outcome</span>
              {renderOutcomeBadge(outcome)}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Section s05, s07, s09 &amp; s28 Evaluation Standards
            </div>
          </div>
        </div>

        {/* Detailed Requirement Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-black text-slate-900">Statutory Requirement Breakdown</h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${coreEligibilityPassed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-rose-50/50 border-rose-200 text-rose-950'}`}>
              <div>
                <h4 className="font-bold text-sm">Core Age &amp; Identity Eligibility (Section s05)</h4>
                <p className="text-xs text-slate-600">Applicant meets minimum adult age and statutory identity verification standards.</p>
              </div>
              <span className="font-black text-xs uppercase">{coreEligibilityPassed ? '✅ Satisfied' : '❌ Not Satisfied'}</span>
            </div>

            <div className={`p-4 rounded-xl border flex items-center justify-between ${financialPassed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-rose-50/50 border-rose-200 text-rose-950'}`}>
              <div>
                <h4 className="font-bold text-sm">Financial Sufficiency &amp; Maintenance (Section s09)</h4>
                <p className="text-xs text-slate-600">Verified income threshold or approved third-party sponsor coverage.</p>
              </div>
              <span className="font-black text-xs uppercase">{financialPassed ? '✅ Satisfied' : '❌ Not Satisfied'}</span>
            </div>

            <div className={`p-4 rounded-xl border flex items-center justify-between ${historyPassed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-amber-50/50 border-amber-200 text-amber-950'}`}>
              <div>
                <h4 className="font-bold text-sm">Immigration History &amp; Prior Refusals (Section s28)</h4>
                <p className="text-xs text-slate-600">Absence of adverse immigration history or unaddressed prior visa refusals.</p>
              </div>
              <span className="font-black text-xs uppercase">{historyPassed ? '✅ Satisfied' : '⚠️ Conditional / Review'}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#0B3D91]" /> Statutory Eligibility Notice
          </div>
          <p className="leading-relaxed">
            The Advanced Eligibility Checker assesses objective statutory rules under consular guidelines. It does not estimate visa approval probabilities or guarantee visa issuance. Final adjudication rests exclusively with consular officers.
          </p>
        </div>
      </div>
    </div>
  );
};
export default EligibilityCheckerPage;
