import React, { useState } from 'react';
import { FULL_VISA_DB, COUNTRY_VISA_COUNTS, VisaItem, CountryVisas } from '../data/fullVisaDatabase';

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", CA: "Canada", GB: "United Kingdom", AU: "Australia",
  DE: "Germany", FR: "France", AE: "UAE Dubai", SG: "Singapore",
  JP: "Japan", IN: "India", BR: "Brazil", IT: "Italy", ES: "Spain",
  NL: "Netherlands", NZ: "New Zealand", SE: "Sweden", CH: "Switzerland",
  IE: "Ireland", NO: "Norway", PT: "Portugal", DK: "Denmark", FI: "Finland",
  BE: "Belgium", AT: "Austria", PL: "Poland", MY: "Malaysia", TH: "Thailand",
  TR: "Turkey", ZA: "South Africa", SA: "Saudi Arabia"
};

export function SitemapPage({ navigate }: { navigate?: (path: string) => void }) {
  const [search, setSearch] = useState('');

  const countryCodes = Object.keys(COUNTRY_NAMES);

  const filteredCodes = countryCodes.filter(code => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = COUNTRY_NAMES[code]?.toLowerCase() || '';
    return code.toLowerCase().includes(q) || name.includes(q);
  });

  let totalVisasCount = 0;
  countryCodes.forEach(code => {
    const data = FULL_VISA_DB[code];
    if (data) {
      Object.values(data).forEach((arr: any) => {
        if (Array.isArray(arr)) totalVisasCount += arr.length;
      });
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
          <button onClick={() => navigate?.('/')} className="hover:underline text-blue-600">Home</button>
          <span>&gt;</span>
          <span className="text-slate-900 font-bold">Sitemap</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
          VisaApply.org - Global Visa Sitemap & Links ({totalVisasCount}+ Pages)
        </h1>
        <p className="text-gray-600 text-sm">
          Complete index of all {totalVisasCount}+ visa requirement guides, fee breakdowns, and application workflows across 30 global destination countries.
        </p>
      </div>

      {/* Quick Search & Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-xs">
        <div className="w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destination country (e.g., US, Germany, Dubai)..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>
        <div className="text-xs sm:text-sm font-semibold text-blue-900 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 shrink-0">
          Total Indexed Visa Routes: <span className="font-extrabold text-blue-700">{totalVisasCount}+</span>
        </div>
      </div>

      {/* Grouped Links by Country */}
      <div className="space-y-8">
        {filteredCodes.map(code => {
          const cName = COUNTRY_NAMES[code];
          const countryData = FULL_VISA_DB[code];
          if (!countryData) return null;

          const categories: (keyof CountryVisas)[] = ['tourist', 'work', 'student', 'family', 'business', 'pr'];

          let cTotal = 0;
          categories.forEach(cat => {
            cTotal += countryData[cat]?.length || 0;
          });

          return (
            <div key={code} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded">
                    {code}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Visa Guides for {cName}
                  </h2>
                  <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {cTotal} Visa Types
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  <a
                    href={`/in-to-${code.toLowerCase()}`}
                    onClick={(e) => { if (navigate) { e.preventDefault(); navigate(`/in-to-${code.toLowerCase()}`); } }}
                    className="text-blue-600 hover:underline"
                  >
                    Level 1: /in-to-{code.toLowerCase()} →
                  </a>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => {
                  const visas: VisaItem[] = countryData[cat] || [];
                  if (visas.length === 0) return null;

                  return (
                    <div key={cat} className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                        <span className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                          {cat} Visas ({visas.length})
                        </span>
                        <a
                          href={`/in-to-${code.toLowerCase()}-${cat}`}
                          onClick={(e) => { if (navigate) { e.preventDefault(); navigate(`/in-to-${code.toLowerCase()}-${cat}`); } }}
                          className="text-[11px] font-semibold text-blue-600 hover:underline"
                        >
                          View Category →
                        </a>
                      </div>

                      <ul className="space-y-1.5 pt-1 text-xs">
                        {visas.map(v => {
                          const url = `/in-to-${code.toLowerCase()}-${cat}-${v.id}`;
                          return (
                            <li key={v.id} className="flex justify-between items-center text-slate-700 hover:text-blue-700">
                              <a
                                href={url}
                                onClick={(e) => { if (navigate) { e.preventDefault(); navigate(url); } }}
                                className="hover:underline truncate pr-2 font-medium"
                              >
                                • {v.name}
                              </a>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">{v.fee}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
