import React, { useState } from 'react';
import { Globe, Search, Briefcase, GraduationCap, Award, Users, Building2, Compass, ArrowRight, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { ALL_249_ISO_FORCED, ISOStandardCountry } from '../data/all249Countries';
import { getImmigrationProfileForCountry, ImmigrationCategoryKey } from '../data/globalImmigrationHubData';

interface GlobalImmigrationHubPageProps {
  navigate: (path: string) => void;
}

export function GlobalImmigrationHubPage({ navigate }: GlobalImmigrationHubPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ImmigrationCategoryKey | 'all'>('all');

  const filteredCountries = ALL_249_ISO_FORCED.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  const categories = [
    { id: 'all', label: 'All 6 Modules', icon: '🌍' },
    { id: 'pr', label: 'Permanent Residency', icon: '🏠' },
    { id: 'citizenship', label: 'Citizenship', icon: '🛂' },
    { id: 'work', label: 'Work & Employment', icon: '💼' },
    { id: 'family', label: 'Family & Spouse', icon: '👨‍👩‍👧‍👦' },
    { id: 'business', label: 'Business & Investor', icon: '📈' },
    { id: 'digital_nomad', label: 'Digital Nomad & Retirement', icon: '🌴' },
  ];

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
            Global Immigration & Residency Hub
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Explore verified Permanent Residency, Citizenship, Work Permits, Family Sponsorship, Business Investor visas, and Digital Nomad residency for all 249 countries and territories.
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
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main 249-Country Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">All 249 Country Immigration Hubs</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Showing {filteredCountries.length} of 249 countries and territories with 6 structured immigration pathways.
            </p>
          </div>
          <span className="bg-blue-100 text-[#0B3D91] px-3 py-1 rounded-full text-xs font-bold">
            100% Free Official Guidance
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCountries.map((c) => {
            const profile = getImmigrationProfileForCountry(c.code);
            const verifiedCount = profile.programs.filter((p) => p.verificationStatus === 'VERIFIED').length;
            const categoryMatchCount =
              selectedCategory === 'all'
                ? profile.programs.length
                : profile.programs.filter((p) => p.category === selectedCategory).length;

            return (
              <div
                key={c.code}
                onClick={() => navigate(`/immigration/${c.code.toLowerCase()}`)}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#0B3D91] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{c.flag}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                        verifiedCount > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {verifiedCount > 0 ? `${verifiedCount} Verified Programs` : 'Awaiting Gazette'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0B3D91] transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    6 Pathways: PR, Citizenship, Work, Family, Business, Nomad
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0B3D91]">
                  <span>Explore Hub ({categoryMatchCount} Programs)</span>
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
