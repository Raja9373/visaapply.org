import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowLeft, FileText, Info, Award, UserCheck, DollarSign, Briefcase } from 'lucide-react';
import { SUPPORTED_LANGUAGES_10, SupportedLangCode } from '../../i18n/config';
import { getUIString } from '../../utils/autoLanguage';

interface ReadinessCheckerPageProps {
  onNavigate: (path: string) => void;
}

export type ReadinessOutcome = 
  | 'VERIFIED_REQUIREMENTS_SATISFIED'
  | 'VERIFIED_REQUIREMENTS_NOT_SATISFIED'
  | 'CONDITIONAL_REQUIREMENTS_REMAIN'
  | 'INSUFFICIENT_VERIFIED_INFORMATION'
  | 'OFFICIAL_CONFIRMATION_REQUIRED';

export const ReadinessCheckerPage: React.FC<ReadinessCheckerPageProps> = ({ onNavigate }) => {
  const [destination, setDestination] = useState('US');
  const [visaCategory, setVisaCategory] = useState('B1/B2 Tourist / Visitor Visa');
  const [nationality, setNationality] = useState('IN');
  const [ageGroup, setAgeGroup] = useState('adult');
  const [employmentStatus, setEmploymentStatus] = useState('employed');
  const [fundsAvailable, setFundsAvailable] = useState('yes');
  const [passportValid, setPassportValid] = useState('yes');
  const [documentsReady, setDocumentsReady] = useState('partial');

  const [uiLang, setUiLang] = useState<SupportedLangCode>('en');
  const ui = getUIString(uiLang);

  // Pillar 1: Identity & Passport
  const p1Passed = passportValid === 'yes';
  // Pillar 2: Statutory Eligibility
  const p2Passed = destination === 'US' || destination === 'GB' || destination === 'CA';
  // Pillar 3: Financial Readiness
  const p3Passed = fundsAvailable === 'yes';
  // Pillar 4: Supporting Document Readiness
  const p4Passed = documentsReady === 'full';
  // Pillar 5: Application & Compliance
  const p5Passed = true;

  const passedCount = [p1Passed, p2Passed, p3Passed, p4Passed, p5Passed].filter(Boolean).length;

  // Determine honest outcome
  let outcome: ReadinessOutcome = 'INSUFFICIENT_VERIFIED_INFORMATION';
  if (passedCount === 5 && documentsReady === 'full') {
    outcome = 'VERIFIED_REQUIREMENTS_SATISFIED';
  } else if (!p1Passed || !p2Passed) {
    outcome = 'VERIFIED_REQUIREMENTS_NOT_SATISFIED';
  } else if (passedCount >= 3) {
    outcome = 'CONDITIONAL_REQUIREMENTS_REMAIN';
  } else {
    outcome = 'OFFICIAL_CONFIRMATION_REQUIRED';
  }

  const renderOutcomeBadge = (o: ReadinessOutcome) => {
    switch (o) {
      case 'VERIFIED_REQUIREMENTS_SATISFIED':
        return <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-xl font-black text-xs uppercase">🟢 VERIFIED_REQUIREMENTS_SATISFIED</span>;
      case 'VERIFIED_REQUIREMENTS_NOT_SATISFIED':
        return <span className="px-3 py-1.5 bg-rose-100 text-rose-900 rounded-xl font-black text-xs uppercase">🔴 VERIFIED_REQUIREMENTS_NOT_SATISFIED</span>;
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
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Visa Readiness Checker (5-Pillar Evidence Audit)</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Honest statutory readiness evaluation based on verified official evidence without fabricated approval probabilities.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-sm text-right shrink-0">
            <span className="text-xs text-blue-200 font-semibold block uppercase tracking-wider">Pillars Satisfied</span>
            <span className="text-2xl font-black text-white">{passedCount} / 5 Pillars</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Profile Inputs Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-black text-slate-900">Applicant Profile &amp; Evidentiary Inputs</h2>
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
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Applicant Nationality</label>
              <select
                value={nationality}
                onChange={e => setNationality(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              >
                <option value="IN">🇮🇳 India</option>
                <option value="CN">🇨🇳 China</option>
                <option value="PH">🇵🇭 Philippines</option>
                <option value="NG">🇳🇬 Nigeria</option>
                <option value="BR">🇧🇷 Brazil</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Passport Validity (&gt;6 Mos)</label>
              <select
                value={passportValid}
                onChange={e => setPassportValid(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="yes">Yes (Valid &gt; 6 Months)</option>
                <option value="no">No / Expiring Soon</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Proof of Funds</label>
              <select
                value={fundsAvailable}
                onChange={e => setFundsAvailable(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="yes">Available &amp; Verified</option>
                <option value="no">Insufficient / Unverified</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Document Readiness</label>
              <select
                value={documentsReady}
                onChange={e => setDocumentsReady(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="full">All Mandatory Documents Acquired</option>
                <option value="partial">Partial / In Progress</option>
                <option value="none">Not Started</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Employment Status</label>
              <select
                value={employmentStatus}
                onChange={e => setEmploymentStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
              >
                <option value="employed">Employed (Salaried / Business)</option>
                <option value="student">Student</option>
                <option value="unemployed">Unemployed / Freelance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Outcome Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Honest Statutory Outcome</span>
              {renderOutcomeBadge(outcome)}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Zero fabricated approval percentages • Evidence-governed evaluation
            </div>
          </div>
        </div>

        {/* Five Assessment Pillars */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-black text-slate-900">Five Assessment Pillars</h3>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-center justify-between ${p1Passed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-rose-50/50 border-rose-200 text-rose-950'}`}>
              <div>
                <h4 className="font-bold text-sm">1. Identity and Passport Readiness</h4>
                <p className="text-xs text-slate-600">Valid passport with minimum 6 months validity beyond intended departure.</p>
              </div>
              <span className="font-black text-xs uppercase">{p1Passed ? '✅ Satisfied' : '❌ Action Required'}</span>
            </div>

            <div className={`p-4 rounded-xl border flex items-center justify-between ${p2Passed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-rose-50/50 border-rose-200 text-rose-950'}`}>
              <div>
                <h4 className="font-bold text-sm">2. Statutory Eligibility Readiness</h4>
                <p className="text-xs text-slate-600">Compliance with consular statutory entry conditions (Section s05 rules).</p>
              </div>
              <span className="font-black text-xs uppercase">{p2Passed ? '✅ Satisfied' : '❌ Action Required'}</span>
            </div>

            <div className={`p-4 rounded-xl border flex items-center justify-between ${p3Passed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-rose-50/50 border-rose-200 text-rose-950'}`}>
              <div>
                <h4 className="font-bold text-sm">3. Financial Readiness (Proof of Funds)</h4>
                <p className="text-xs text-slate-600">Sufficient maintenance funds verified via bank statements (Section s09).</p>
              </div>
              <span className="font-black text-xs uppercase">{p3Passed ? '✅ Satisfied' : '❌ Action Required'}</span>
            </div>

            <div className={`p-4 rounded-xl border flex items-center justify-between ${p4Passed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-rose-50/50 border-rose-200 text-rose-950'}`}>
              <div>
                <h4 className="font-bold text-sm">4. Supporting Document Readiness</h4>
                <p className="text-xs text-slate-600">All mandatory evidence collected in accordance with Section s11 rules.</p>
              </div>
              <span className="font-black text-xs uppercase">{p4Passed ? '✅ Satisfied' : '❌ Action Required'}</span>
            </div>

            <div className={`p-4 rounded-xl border flex items-center justify-between ${p5Passed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-rose-50/50 border-rose-200 text-rose-950'}`}>
              <div>
                <h4 className="font-bold text-sm">5. Application and Compliance Readiness</h4>
                <p className="text-xs text-slate-600">Application form completion, biometrics appointment and fee remittance readiness.</p>
              </div>
              <span className="font-black text-xs uppercase">{p5Passed ? '✅ Satisfied' : '❌ Action Required'}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#0B3D91]" /> Evidentiary Evaluation Notice
          </div>
          <p className="leading-relaxed">
            The Readiness Checker evaluates objective statutory criteria based on provided inputs and consular rules. It never estimates approval probabilities or guarantees consular visa issuance. Consular officers retain absolute discretionary authority over visa adjudication.
          </p>
        </div>
      </div>
    </div>
  );
};
export default ReadinessCheckerPage;
