import React, { useState, useEffect } from 'react';
import { Shield, Check, ExternalLink, Clock, XCircle, Building2 } from 'lucide-react';
import { getImmigrationProfileForCountry, ImmigrationCategoryKey, ImmigrationProgram, PathwayVerificationStatus } from '../data/globalImmigrationHubData';
import { CountryPAAFaqSection } from '../components/CountryPAAFaqSection';
import { CATEGORY_URL_PARAM_MAP, CATEGORY_INTERNAL_TO_PARAM_MAP } from './GlobalImmigrationHubPage';
import { VisaDetailRenderer } from '../components/VisaDetailRenderer';

function parseCategoryFromUrl(): ImmigrationCategoryKey {
  if (typeof window === 'undefined') return 'pr';
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('category');
  if (!catParam) return 'pr';
  return CATEGORY_URL_PARAM_MAP[catParam.toLowerCase()] || 'pr';
}

interface CountryImmigrationDetailPageProps {
  countryCode: string;
  navigate: (path: string) => void;
}

export function CountryImmigrationDetailPage({ countryCode, navigate }: CountryImmigrationDetailPageProps) {
  const normCode = (countryCode || 'US').trim().toUpperCase();
  const profile = getImmigrationProfileForCountry(normCode);

  const [activeCategory, setActiveCategory] = useState<ImmigrationCategoryKey>(parseCategoryFromUrl());
  const [applicantNationality, setApplicantNationality] = useState<string>('ALL');

  useEffect(() => {
    setActiveCategory(parseCategoryFromUrl());
  }, [countryCode]);

  const categories: Array<{ id: ImmigrationCategoryKey; label: string; icon: string; desc: string }> = [
    { id: 'pr', label: 'Permanent Residency', icon: '🏠', desc: 'Sovereign PR permits, points systems, and settlement pathways.' },
    { id: 'citizenship', label: 'Citizenship & Naturalization', icon: '🛂', desc: 'Naturalization rules, dual citizenship, and passport acquisition.' },
    { id: 'work', label: 'Work Immigration', icon: '💼', desc: 'Skilled worker visas, employer sponsorships, and job seeker permits.' },
    { id: 'family', label: 'Family & Spouse', icon: '👨‍👩‍👧‍👦', desc: 'Spouse visas, dependent children, and parent sponsorships.' },
    { id: 'business', label: 'Business & Investor', icon: '📈', desc: 'Investor visas, entrepreneur startups, and Golden Visas.' },
    { id: 'digital_nomad', label: 'Digital Nomad & Retirement', icon: '🌴', desc: 'Remote work permits, freelancer visas, and retirement residency.' },
    { id: 'tourist', label: 'Tourist & Visitor', icon: '✈️', desc: 'Tourism, sightseeing, and visitor visas.' },
  ];

  const currentCategoryPrograms = profile.programs.filter((p) => p.category === activeCategory);
  const activeCategoryMeta = categories.find((c) => c.id === activeCategory) || categories[0];

  const hasUnverifiedOnly = currentCategoryPrograms.every(
    (p) => p.verificationStatus !== 'AVAILABLE_VERIFIED'
  );

  useEffect(() => {
    let existingMeta = document.querySelector('meta[name="robots"]');
    if (hasUnverifiedOnly) {
      if (!existingMeta) {
        existingMeta = document.createElement('meta');
        existingMeta.setAttribute('name', 'robots');
        document.head.appendChild(existingMeta);
      }
      existingMeta.setAttribute('content', 'noindex, follow');
    } else {
      if (existingMeta) {
        existingMeta.setAttribute('content', 'index, follow');
      }
    }

    return () => {
      if (existingMeta) {
        existingMeta.setAttribute('content', 'index, follow');
      }
    };
  }, [hasUnverifiedOnly, normCode, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 py-3 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/immigration')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Global Immigration Hub
          </button>
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            Official 2026 Consular Directory • {profile.countryName}
          </span>
        </div>
      </div>

      <section className="bg-gradient-to-b from-[#0B3D91] to-[#072a68] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="text-6xl mb-2">{profile.flag}</div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {profile.countryName} Immigration &amp; Residency Hub
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Official verified immigration requirements, permanent residency, work permits, citizenship, and digital nomad options for {profile.countryName}.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl max-w-xl mx-auto text-xs text-left space-y-1">
            <div className="font-bold text-blue-200 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-300" />
              <span>Official Registered Source Authority:</span>
            </div>
            <div className="text-white font-semibold">{profile.officialSource.authorityName}</div>
            <div className="text-blue-300 text-[11px] flex items-center gap-2 pt-1">
              <span>Tier: {profile.officialSource.verificationTier}</span>
              <span>•</span>
              <span>Audited: {profile.lastCheckedDate}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {categories.map((cat) => {
            const prog = profile.programs.find((p) => p.category === cat.id);
            const status = prog?.verificationStatus || 'AWAITING_OFFICIAL_VERIFICATION';
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  const paramSlug = CATEGORY_INTERNAL_TO_PARAM_MAP[cat.id];
                  window.history.pushState({}, '', `/immigration/${normCode.toLowerCase()}?category=${paramSlug}`);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#0B3D91] text-white border-[#0B3D91] shadow-lg'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <h3 className="font-bold text-sm tracking-tight">{cat.label}</h3>
                </div>
                <div className="mt-3">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                    status === 'AVAILABLE_VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : status === 'NOT_AVAILABLE_CONFIRMED'
                      ? 'bg-slate-100 text-slate-600 border border-slate-300'
                      : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                  }`}>
                    {status === 'AVAILABLE_VERIFIED' ? 'Verified' : status === 'NOT_AVAILABLE_CONFIRMED' ? 'Not Available' : 'Audit Pending'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{activeCategoryMeta.icon}</span>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{activeCategoryMeta.label} in {profile.countryName}</h2>
              <p className="text-xs sm:text-sm text-slate-600">{activeCategoryMeta.desc}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {currentCategoryPrograms.map((prog) => (
            <ProgramCard
              key={prog.id}
              prog={prog}
              applicantNationality={applicantNationality}
              onNationalityChange={setApplicantNationality}
            />
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <CountryPAAFaqSection
            countryName={profile.countryName}
            countryCode={normCode}
            fromCountryName="India"
            fromCode="IN"
            onNavigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}

function renderStatusBadge(status: PathwayVerificationStatus) {
  switch (status) {
    case 'AVAILABLE_VERIFIED':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">✅ AVAILABLE - VERIFIED</span>;
    case 'NOT_AVAILABLE_CONFIRMED':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-200 text-slate-800 border border-slate-400">🚫 CONFIRMED NOT AVAILABLE</span>;
    case 'AWAITING_OFFICIAL_VERIFICATION':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">⏳ AWAITING OFFICIAL VERIFICATION</span>;
    case 'NEEDS_REVIEW':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">⚠️ NEEDS REVIEW</span>;
    case 'TEMPORARILY_CLOSED':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">⏸️ TEMPORARILY CLOSED</span>;
    case 'EXPIRED':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">❌ EXPIRED / TERMINATED</span>;
  }
}

function ProgramCard({ prog, applicantNationality, onNationalityChange }: { prog: ImmigrationProgram; applicantNationality?: string; onNationalityChange?: (nat: string) => void }) {
  const [details, setDetails] = useState<any>(null);
  const [currentNat, setCurrentNat] = useState<string>(applicantNationality || 'ALL');

  useEffect(() => {
    if (applicantNationality) {
      setCurrentNat(applicantNationality);
    }
  }, [applicantNationality]);

  useEffect(() => {
    if (prog.verificationStatus === 'AVAILABLE_VERIFIED') {
      const natQuery = currentNat && currentNat !== 'ALL' ? `?nationality=${encodeURIComponent(currentNat)}` : '';
      fetch(`/api/visa-details/${prog.id}${natQuery}`)
        .then(res => res.json())
        .then(data => setDetails(data))
        .catch(() => {});
    }
  }, [prog.id, prog.verificationStatus, currentNat]);

  const handleNatChange = (nat: string) => {
    setCurrentNat(nat);
    if (onNationalityChange) {
      onNationalityChange(nat);
    }
  };

  if (details) {
    return (
      <VisaDetailRenderer
        details={details}
        selectedNationality={currentNat}
        onNationalityChange={handleNatChange}
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {renderStatusBadge(prog.verificationStatus)}
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200">
              Apply: {prog.applyFrom || 'Offshore'}
            </span>
            <span className="text-xs text-slate-400">• Last Checked: {prog.lastCheckedDate}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">{prog.officialName}</h3>
          {prog.localLanguageName && (
            <div className="text-xs font-semibold text-slate-500 italic mt-0.5">
              Local Name: {prog.localLanguageName}
            </div>
          )}
        </div>
        <a
          href={prog.officialInformationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#0B3D91] border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <span>Official Govt Source</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700 my-4 space-y-1">
        <div className="font-bold text-slate-900 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official Source Verification Evidence &amp; Audit Trail:</span>
        </div>
        <p className="font-mono text-[11px] text-slate-600">
          "{prog.verificationEvidence}"
        </p>
        <div className="text-[10px] text-slate-400 pt-0.5">
          Authority: <strong>{prog.sourceAuthority}</strong> • Checked on: {prog.lastCheckedDate}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 text-sm">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Government Fees</span>
          <span className="font-bold text-slate-900">{prog.governmentFees}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Processing Time</span>
          <span className="font-bold text-slate-900">{prog.processingTime || 'Variable'}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Min Investment / Income</span>
          <span className="font-bold text-slate-900">{prog.minSalaryOrIncome || prog.investmentRequirement || 'N/A'}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Eligibility Criteria</h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            {prog.eligibility}
          </p>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-2">Required Document Checklist</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(prog.requiredDocuments || []).map((doc, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Application Procedure</h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {prog.applicationProcedure}
          </p>
        </div>
      </div>
    </div>
  );
}
