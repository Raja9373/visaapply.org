import React, { useState } from 'react';
import { Globe, ArrowRight, Shield, CheckCircle2, AlertCircle, ExternalLink, Calendar, FileText, DollarSign, Clock, Check } from 'lucide-react';
import { getImmigrationProfileForCountry, ImmigrationCategoryKey, ImmigrationProgram } from '../data/globalImmigrationHubData';
import { CountryPAAFaqSection } from '../components/CountryPAAFaqSection';

interface CountryImmigrationDetailPageProps {
  countryCode: string;
  navigate: (path: string) => void;
}

export function CountryImmigrationDetailPage({ countryCode, navigate }: CountryImmigrationDetailPageProps) {
  const normCode = (countryCode || 'US').trim().toUpperCase();
  const profile = getImmigrationProfileForCountry(normCode);

  const [activeCategory, setActiveCategory] = useState<ImmigrationCategoryKey>('pr');

  const categories: Array<{ id: ImmigrationCategoryKey; label: string; icon: string; desc: string }> = [
    { id: 'pr', label: 'Permanent Residency', icon: '🏠', desc: 'Sovereign PR permits, points systems, and settlement pathways.' },
    { id: 'citizenship', label: 'Citizenship & Naturalization', icon: '🛂', desc: 'Naturalization rules, dual citizenship, and passport acquisition.' },
    { id: 'work', label: 'Work Immigration', icon: '💼', desc: 'Skilled worker visas, employer sponsorships, and job seeker permits.' },
    { id: 'family', label: 'Family & Spouse', icon: '👨‍👩‍👧‍👦', desc: 'Spouse visas, dependent children, and parent sponsorships.' },
    { id: 'business', label: 'Business & Investor', icon: '📈', desc: 'Investor visas, entrepreneur startups, and Golden Visas.' },
    { id: 'digital_nomad', label: 'Digital Nomad & Retirement', icon: '🌴', desc: 'Remote work permits, freelancer visas, and retirement residency.' },
  ];

  const currentCategoryPrograms = profile.programs.filter((p) => p.category === activeCategory);
  const activeCategoryMeta = categories.find((c) => c.id === activeCategory) || categories[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Sticky Back Button Bar */}
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

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0B3D91] to-[#072a68] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="text-6xl mb-2">{profile.flag}</div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {profile.countryName} Immigration & Residency Hub
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Official verified immigration, PR, work permit, citizenship, and digital nomad requirements for {profile.countryName}.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
              Status: {profile.overallStatus}
            </span>
            <span className="bg-blue-500/20 border border-blue-400/30 text-blue-200 px-3 py-1 rounded-full text-xs font-bold">
              Last Verified: {profile.lastCheckedDate}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {categories.map((cat) => {
            const count = profile.programs.filter((p) => p.category === cat.id).length;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
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
                <div className={`mt-4 text-[11px] font-bold ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                  {count} {count === 1 ? 'Program' : 'Programs'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Category Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{activeCategoryMeta.icon}</span>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{activeCategoryMeta.label} in {profile.countryName}</h2>
              <p className="text-xs sm:text-sm text-slate-600">{activeCategoryMeta.desc}</p>
            </div>
          </div>
        </div>

        {/* Programs List */}
        <div className="space-y-6">
          {currentCategoryPrograms.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 text-slate-500">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 text-base">No Verified Programs Found for this Category</h3>
              <p className="text-xs text-slate-500 mt-1">
                Official immigration rules for this pathway in {profile.countryName} are awaiting official government gazette verification.
              </p>
            </div>
          ) : (
            currentCategoryPrograms.map((prog) => (
              <div key={prog.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        prog.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {prog.verificationStatus}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                        (prog.applyFrom || 'Offshore') === 'Onshore'
                          ? 'bg-purple-50 text-purple-900 border-purple-200'
                          : (prog.applyFrom || 'Offshore') === 'Both'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-blue-50 text-blue-900 border-blue-200'
                      }`}>
                        {(prog.applyFrom || 'Offshore') === 'Onshore' ? '🏠 Apply From: Onshore' : (prog.applyFrom || 'Offshore') === 'Both' ? '🌐🏠 Apply From: Offshore & Onshore' : '🌐 Apply From: Offshore'}
                      </span>
                      <span className="text-xs text-slate-400">• Last Verified: {prog.lastVerifiedDate}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">{prog.name}</h3>
                  </div>
                  <a
                    href={prog.officialSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#0B3D91] border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>Official Source ({prog.sourceTitle})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
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
                    <span className="font-bold text-slate-900">{prog.minInvestmentOrIncome || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Eligibility Requirements</h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      {prog.eligibility}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2">Required Document Checklist</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prog.documents.map((doc, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Application Process</h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {prog.applicationProcess}
                    </p>
                  </div>

                  {prog.exceptionsAndConditions && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900">
                      <b>Important Conditions & Exceptions:</b> {prog.exceptionsAndConditions}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Top 20 People Also Ask (PAA) FAQ Section for Google Ranking */}
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
