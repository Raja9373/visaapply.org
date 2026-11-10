import React, { useState, useEffect } from 'react';
import { Globe, Search, ArrowRight, Shield, CheckCircle2, AlertCircle, Ban, Clock, XCircle } from 'lucide-react';
import { ALL_249_ISO_FORCED, ISOStandardCountry } from '../data/all249Countries';
import { getImmigrationProfileForCountry, ImmigrationCategoryKey, PathwayVerificationStatus } from '../data/globalImmigrationHubData';

interface GlobalImmigrationHubPageProps {
  navigate: (path: string) => void;
}

export const CATEGORY_URL_PARAM_MAP: Record<string, ImmigrationCategoryKey> = {
  'permanent-residency': 'pr',
  'citizenship': 'citizenship',
  'work': 'work',
  'family': 'family',
  'business-investor': 'business',
  'digital-nomad-retirement': 'digital_nomad',
  'pr': 'pr',
  'business': 'business',
  'digital_nomad': 'digital_nomad'
};

export const CATEGORY_INTERNAL_TO_PARAM_MAP: Record<ImmigrationCategoryKey, string> = {
  'pr': 'permanent-residency',
  'citizenship': 'citizenship',
  'work': 'work',
  'family': 'family',
  'business': 'business-investor',
  'digital_nomad': 'digital-nomad-retirement'
};

export function parseCategoryFromLocation(): ImmigrationCategoryKey | 'all' {
  if (typeof window === 'undefined') return 'all';
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('category');
  if (!catParam) return 'all';
  const mapped = CATEGORY_URL_PARAM_MAP[catParam.toLowerCase()];
  return mapped || 'all';
}

export function GlobalImmigrationHubPage({ navigate }: GlobalImmigrationHubPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ImmigrationCategoryKey | 'all'>(parseCategoryFromLocation());

  // Listen to browser Back/Forward popstate changes
  useEffect(() => {
    const handlePopState = () => {
      setSelectedCategory(parseCategoryFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Also sync state if URL search param changes via external props
  useEffect(() => {
    setSelectedCategory(parseCategoryFromLocation());
  }, []);

  const handleSelectCategory = (catId: ImmigrationCategoryKey | 'all') => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      window.history.pushState({}, '', '/immigration');
    } else {
      const paramSlug = CATEGORY_INTERNAL_TO_PARAM_MAP[catId];
      window.history.pushState({}, '', `/immigration?category=${paramSlug}`);
    }
  };

  const filteredCountries = ALL_249_ISO_FORCED.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  const categories = [
    { id: 'all', paramSlug: '', label: 'All 6 Modules', icon: '🌍' },
    { id: 'pr', paramSlug: 'permanent-residency', label: 'Permanent Residency', icon: '🏠' },
    { id: 'citizenship', paramSlug: 'citizenship', label: 'Citizenship', icon: '🛂' },
    { id: 'work', paramSlug: 'work', label: 'Work & Employment', icon: '💼' },
    { id: 'family', paramSlug: 'family', label: 'Family & Spouse', icon: '👨‍👩‍👧‍👦' },
    { id: 'business', paramSlug: 'business-investor', label: 'Business & Investor', icon: '📈' },
    { id: 'digital_nomad', paramSlug: 'digital-nomad-retirement', label: 'Digital Nomad & Retirement', icon: '🌴' },
  ];

  // Dynamic Header Copy based on Active Category
  const getHeaderMeta = () => {
    switch (selectedCategory) {
      case 'pr':
        return {
          title: 'Permanent Residency Pathways (249 Countries Audited)',
          description: 'Sovereign PR permits, points-based selection systems, and permanent settlement rules across 249 audited countries.',
          badge: 'PR Pathways'
        };
      case 'citizenship':
        return {
          title: 'Citizenship & Naturalization Pathways (249 Countries Audited)',
          description: 'Naturalization timelines, dual citizenship statutes, and statutory passport acquisition rules across 249 audited countries.',
          badge: 'Citizenship'
        };
      case 'work':
        return {
          title: 'Work & Employment Visa Pathways (249 Countries Audited)',
          description: 'Skilled worker visas, employer sponsorship thresholds, and job seeker opportunity permits across 249 audited countries.',
          badge: 'Work Permits'
        };
      case 'family':
        return {
          title: 'Family & Spouse Reunification Pathways (249 Countries Audited)',
          description: 'Spouse visas, dependent children sponsorships, and parent reunification rules across 249 audited countries.',
          badge: 'Family Reunion'
        };
      case 'business':
        return {
          title: 'Business & Investor Residency Pathways (249 Countries Audited)',
          description: 'Sovereign Golden Visas, capital investment thresholds, and entrepreneur permits across 249 audited countries.',
          badge: 'Investment PR'
        };
      case 'digital_nomad':
        return {
          title: 'Digital Nomad & Retirement Residency Pathways (249 Countries Audited)',
          description: 'Remote worker visas, freelancer income thresholds, and self-funded retirement residency across 249 audited countries.',
          badge: 'Digital Nomad'
        };
      default:
        return {
          title: 'Global Immigration & Residency Hub (All 249 Countries)',
          description: 'Explore verified Permanent Residency, Citizenship, Work Permits, Family Sponsorship, Business Investor visas, and Digital Nomad residency for all 249 countries and territories.',
          badge: 'All 6 Modules'
        };
    }
  };

  const headerMeta = getHeaderMeta();

  // Metrics calculation
  let totalVerifiedProgramsInActiveCat = 0;
  let totalConfirmedUnavailableInActiveCat = 0;

  ALL_249_ISO_FORCED.forEach((c) => {
    const prof = getImmigrationProfileForCountry(c.code);
    if (selectedCategory === 'all') {
      totalVerifiedProgramsInActiveCat += prof.programs.filter((p) => p.verificationStatus === 'AVAILABLE_VERIFIED').length;
      totalConfirmedUnavailableInActiveCat += prof.programs.filter((p) => p.verificationStatus === 'NOT_AVAILABLE_CONFIRMED').length;
    } else {
      const match = prof.programs.find((p) => p.category === selectedCategory);
      if (match?.verificationStatus === 'AVAILABLE_VERIFIED') totalVerifiedProgramsInActiveCat++;
      if (match?.verificationStatus === 'NOT_AVAILABLE_CONFIRMED') totalConfirmedUnavailableInActiveCat++;
    }
  });

  const getStatusBadgeUI = (status: PathwayVerificationStatus) => {
    switch (status) {
      case 'AVAILABLE_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>AVAILABLE VERIFIED</span>
          </span>
        );
      case 'NOT_AVAILABLE_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 border border-slate-400 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
            <Ban className="w-3 h-3 text-slate-600" />
            <span>NOT AVAILABLE CONFIRMED</span>
          </span>
        );
      case 'AWAITING_OFFICIAL_VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-blue-700" />
            <span>AUDIT PENDING</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-rose-700" />
            <span>EXPIRED SCHEME</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
            <span>AWAITING VERIFICATION</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0B3D91] to-[#072a68] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1.5 rounded-full text-xs text-blue-200">
            <Globe className="w-3.5 h-3.5" />
            <span>Global Immigration Intelligence Platform • All 249 Countries Covered</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {headerMeta.title}
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            {headerMeta.description}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-6 bg-white p-2 rounded-2xl shadow-xl flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any country — e.g. Canada, United States, Germany, UAE..."
              className="w-full bg-transparent text-slate-900 font-medium text-sm sm:text-base focus:outline-none py-2"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-4">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Audit Stats Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-extrabold text-slate-900">
                Audited Coverage: 249 Countries &amp; Territories
              </div>
              <div className="text-slate-500 text-xs">
                Every country displays structured pathway data derived from primary sovereign government portals.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1.5 rounded-xl font-bold">
              {totalVerifiedProgramsInActiveCat} Verified Programs
            </div>
            <div className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-medium">
              {selectedCategory === 'all' ? '1,494 Coverage Slots' : '249 Country Slots'}
            </div>
          </div>
        </div>
      </div>

      {/* Main 249-Country Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {selectedCategory === 'all'
                ? 'All 249 Country Immigration Hubs'
                : `${categories.find((c) => c.id === selectedCategory)?.label} Directory`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Showing {filteredCountries.length} of 249 countries and territories.
            </p>
          </div>
          <span className="bg-blue-100 text-[#0B3D91] px-3 py-1 rounded-full text-xs font-bold">
            100% Free Sovereign Information
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCountries.map((c) => {
            const profile = getImmigrationProfileForCountry(c.code);
            const paramSlug = selectedCategory !== 'all' ? CATEGORY_INTERNAL_TO_PARAM_MAP[selectedCategory] : '';
            const destinationUrl = `/immigration/${c.code.toLowerCase()}${paramSlug ? `?category=${paramSlug}` : ''}`;

            if (selectedCategory === 'all') {
              const verifiedCount = profile.programs.filter((p) => p.verificationStatus === 'AVAILABLE_VERIFIED').length;
              return (
                <div
                  key={c.code}
                  onClick={() => navigate(destinationUrl)}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#0B3D91] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{c.flag}</span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          verifiedCount > 0
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}
                      >
                        {verifiedCount > 0 ? `${verifiedCount} Verified Programs` : 'Awaiting Gazette'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0B3D91] transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      6 Modules: PR, Citizenship, Work, Family, Business, Nomad
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0B3D91]">
                    <span>Explore Country Hub</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            }

            // Single Category View
            const prog = profile.programs.find((p) => p.category === selectedCategory);
            const status = prog?.verificationStatus || 'AWAITING_OFFICIAL_VERIFICATION';

            return (
              <div
                key={c.code}
                onClick={() => navigate(destinationUrl)}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#0B3D91] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{c.flag}</span>
                    {getStatusBadgeUI(status)}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0B3D91] transition-colors">
                    {c.name}
                  </h3>

                  {prog && status === 'AVAILABLE_VERIFIED' && (
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-emerald-950">{prog.officialName}</div>
                      <div className="text-[11px] text-emerald-800 line-clamp-2">{prog.verificationEvidence}</div>
                    </div>
                  )}

                  {prog && status === 'NOT_AVAILABLE_CONFIRMED' && (
                    <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700">
                      <div className="font-bold">Statutory Finding:</div>
                      <div className="text-[11px] line-clamp-2">{prog.eligibility}</div>
                    </div>
                  )}

                  {prog && status === 'AWAITING_OFFICIAL_VERIFICATION' && (
                    <div className="bg-blue-50/60 border border-blue-100 p-2.5 rounded-xl text-xs text-blue-900">
                      <div className="font-semibold">{prog.officialName}</div>
                      <div className="text-[11px] text-blue-700">Consular review in progress</div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0B3D91]">
                  <span>Explore {categories.find((cat) => cat.id === selectedCategory)?.label}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
