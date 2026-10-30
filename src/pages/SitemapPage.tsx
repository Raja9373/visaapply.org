import React, { useState } from 'react';
import { BASE_COUNTRY_VISAS, FULL_VISA_DB, COUNTRY_VISA_COUNTS, VisaItem, CountryVisas } from '../data/fullVisaDatabase';

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

  const categoriesList: (keyof CountryVisas)[] = ['tourist', 'work', 'student', 'family', 'business', 'pr'];
  let totalVisasCount = 0;
  countryCodes.forEach(code => {
    const countryData: CountryVisas = BASE_COUNTRY_VISAS[code] || FULL_VISA_DB[code];
    if (countryData) {
      categoriesList.forEach(cat => {
        totalVisasCount += countryData[cat]?.length || 0;
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
          const countryData: CountryVisas = BASE_COUNTRY_VISAS[code] || FULL_VISA_DB[code];
          if (!countryData) return null;

          const categories: (keyof CountryVisas)[] = ['tourist', 'work', 'student', 'family', 'business', 'pr'];

          let cTotal = 0;
          categories.forEach(cat => {
            cTotal += countryData[cat]?.length || 0;
          });

          return (
            <div key={code} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded">
                    {code}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    Visa Guides for {cName}
                  </h2>
                  {code === 'US' ? (
                    <>
                      <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-200">
                        164 Official Visas
                      </span>
                      <span className="text-xs font-bold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-200">
                        + 37 Immigration Programmes = {cTotal} Total
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                      {cTotal} Visa Types
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs font-semibold">
                  {code === 'AU' && (
                    <a
                      href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 hover:underline"
                    >
                      🏛️ Official Home Affairs Register ↗
                    </a>
                  )}
                  {code === 'US' && (
                    <a
                      href="https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/all-visa-categories.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:underline"
                    >
                      🏛️ Official U.S. State Dept & USCIS Register ↗
                    </a>
                  )}
                  {code === 'CA' && (
                    <a
                      href="https://www.canada.ca/en/immigration-refugees-citizenship/services/come-canada.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 hover:underline"
                    >
                      🏛️ Official IRCC Canada Portal ↗
                    </a>
                  )}
                  {code === 'GB' && (
                    <a
                      href="https://www.gov.uk/browse/visas-immigration"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 hover:underline"
                    >
                      🏛️ Official GOV.UK Visas & Immigration ↗
                    </a>
                  )}
                  <a
                    href={`/in-to-${code.toLowerCase()}`}
                    onClick={(e) => { if (navigate) { e.preventDefault(); navigate(`/in-to-${code.toLowerCase()}`); } }}
                    className="text-blue-600 hover:underline"
                  >
                    Level 1: /in-to-{code.toLowerCase()} →
                  </a>
                </div>
              </div>

              {/* USA Regional Clarification & 2-Directory Architecture Banner */}
              {code === 'US' && (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-extrabold text-[#0B3D91] flex items-center gap-1.5">
                      <span>🇺🇸</span>
                      <span>USA 2-Directory Architecture: 164 Official Visa Classification Codes + 37 Non-Visa Programmes/Set-Asides/Forms/Travel Auth = 201 Total Entries</span>
                    </span>
                    <span className="text-[11px] font-bold bg-[#0B3D91] text-white px-2 py-0.5 rounded">
                      No Australia Regional / No DAMA
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    <strong>Clarification:</strong> USA mein Australia jaisa Regional Migration, Designated Regional Areas/Postcodes ya DAMA visa system nahi hai. Ye Australian programmes hain. USA mein iske closest concepts <strong>EB-5 Targeted Employment Area (TEA: Rural / High-Unemployment / Infrastructure)</strong>, <strong>H-2A/H-2B labour certification areas</strong>, aur <strong>EB-5 Regional Center Programme</strong> hain — ye alag visa subclasses nahi hain, balki investment set-aside aur programme hain.
                  </p>
                </div>
              )}

              {/* Australia Regional Migration 7-Category Summary Box */}
              {code === 'AU' && (
                <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-xl text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-extrabold text-teal-950 flex items-center gap-1.5">
                      <span>🌄</span>
                      <span>Australia Regional Migration — 7 Official Categories (AUS-REG-01 to AUS-REG-07) — Zero Duplicate Entries (135 Total)</span>
                    </span>
                    <span className="text-[11px] font-bold bg-teal-900 text-white px-2 py-0.5 rounded">
                      Cat 2 & Cat 3 Designated Postcodes
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-teal-950">
                    <div className="bg-white p-2.5 rounded-lg border border-teal-200">
                      <strong className="block text-teal-900">🟢 Main Current Regional Visas:</strong>
                      Subclass 491 (AUS-491-SN / AUS-491-FS), Subclass 494 (AUS-494-ES / AUS-494-LA), Subclass 191 (AUS-191-RP / AUS-191-HK)
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-teal-200">
                      <strong className="block text-indigo-900">🤝 Related Regional Pathways:</strong>
                      DAMA Agreements (AUS-DAMA-482 / 494 / 186), Subclass 485 Regional Extension (AUS-485-2PSW / REG), Subclass 417 & 462 (2Y / 3Y)
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-teal-200">
                      <strong className="block text-amber-900">📜 Closed / Legacy Regional Routes:</strong>
                      Subclass 489 (Provisional Closed), Subclass 887 (Legacy PR Stage), Subclass 187 (RSMS Transitional)
                    </div>
                  </div>
                </div>
              )}

              {code === 'US' ? (
                <div className="space-y-6">
                  {/* DIRECTORY 1: 164 OFFICIAL USA VISA CATEGORIES */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-blue-900 text-white px-4 py-2.5 rounded-xl">
                      <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                        🛂 Directory 1: USA Official Visa Categories (164 Official INA Visa Classification Codes)
                      </span>
                      <span className="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded">
                        Tourist 12 · Work 49 · Student 11 · Family 35 · Business 18 · PR 39
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categories.map(cat => {
                        const officialVisas: VisaItem[] = (countryData[cat] || []).filter(v => v.isVisa !== false);
                        if (officialVisas.length === 0) return null;

                        return (
                          <div key={`us-visa-${cat}`} className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                              <span className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                                {cat} Official Visas ({officialVisas.length})
                              </span>
                              <a
                                href={`/in-to-us-${cat}`}
                                onClick={(e) => { if (navigate) { e.preventDefault(); navigate(`/in-to-us-${cat}`); } }}
                                className="text-[11px] font-semibold text-blue-600 hover:underline"
                              >
                                View Category →
                              </a>
                            </div>

                            <ul className="space-y-1.5 pt-1 text-xs">
                              {officialVisas.map(v => {
                                const prefixRegex = new RegExp(`^[a-z]{2,3}-to-us-${cat}-`, 'i');
                                const shortId = v.id.replace(prefixRegex, '');
                                const url = `/in-to-us-${cat}-${shortId}`;
                                return (
                                  <li key={v.id} className="flex justify-between items-center text-slate-700 hover:text-blue-700">
                                    <a
                                      href={url}
                                      onClick={(e) => { if (navigate) { e.preventDefault(); navigate(url); } }}
                                      className="hover:underline truncate pr-2 font-medium flex items-center"
                                    >
                                      {v.officialCode && (
                                        <span className="bg-blue-100 text-blue-900 font-mono text-[9px] px-1 py-0.5 rounded font-bold mr-1 shrink-0">
                                          {v.officialCode}
                                        </span>
                                      )}
                                      <span className="truncate">• {v.name}</span>
                                      <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[8px] px-1 py-0.2 rounded font-semibold ml-1 shrink-0">
                                        Visa
                                      </span>
                                      {v.isLegacy ? (
                                        <span className="bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded font-semibold ml-1 shrink-0">
                                          Legacy
                                        </span>
                                      ) : (
                                        <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1 py-0.2 rounded font-semibold ml-1 shrink-0">
                                          Active
                                        </span>
                                      )}
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

                  {/* DIRECTORY 2: 37 NON-VISA USA IMMIGRATION PROGRAMMES & PATHWAYS */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap items-center justify-between bg-purple-900 text-white px-4 py-2.5 rounded-xl gap-2">
                      <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                        📋 Directory 2: USA Immigration Programmes, EB-5 Set-Asides, USCIS Forms & Travel Authorizations (37 Non-Visa Entries)
                      </span>
                      <span className="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded">
                        Not Standalone Visa Subclasses (Set-Asides · USCIS Forms · Regional Equiv · Humanitarian · Travel Auth)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          groupTitle: "EB-5 Regional Set-Asides & USCIS Forms (7)",
                          filterFn: (v: VisaItem) => v.programmeCategory === 'EB-5 Set-Aside' || v.programmeCategory === 'EB-5 USCIS Form',
                          catSlug: 'pr'
                        },
                        {
                          groupTitle: "USA Regional Migration Equivalent Programmes & TEA Designations (7)",
                          filterFn: (v: VisaItem) => v.programmeCategory === 'Regional Equivalent Programme',
                          catSlug: 'pr'
                        },
                        {
                          groupTitle: "Humanitarian, Refugee, Asylum, Special Relief & Parole Programmes (19)",
                          filterFn: (v: VisaItem) => v.programmeCategory === 'Humanitarian & Relief Programme',
                          catSlug: 'pr'
                        },
                        {
                          groupTitle: "Visa Waiver & Visa-Exempt Travel Authorizations (4)",
                          filterFn: (v: VisaItem) => v.programmeCategory === 'Travel Authorization',
                          catSlug: 'tourist'
                        }
                      ].map(group => {
                        const allUsItems: VisaItem[] = [
                          ...(countryData.tourist || []),
                          ...(countryData.work || []),
                          ...(countryData.student || []),
                          ...(countryData.family || []),
                          ...(countryData.business || []),
                          ...(countryData.pr || [])
                        ];
                        const progItems = allUsItems.filter(v => v.isVisa === false && group.filterFn(v));
                        return (
                          <div key={group.groupTitle} className="bg-purple-50/50 border border-purple-200 p-4 rounded-xl space-y-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-purple-200">
                              <span className="font-bold text-xs uppercase text-purple-950 tracking-wider">
                                {group.groupTitle}
                              </span>
                              <a
                                href={`/in-to-us-${group.catSlug}`}
                                onClick={(e) => { if (navigate) { e.preventDefault(); navigate(`/in-to-us-${group.catSlug}`); } }}
                                className="text-[11px] font-semibold text-purple-700 hover:underline shrink-0"
                              >
                                View in {group.catSlug.toUpperCase()} →
                              </a>
                            </div>
                            <ul className="space-y-1.5 pt-1 text-xs">
                              {progItems.map(v => {
                                const catCode = v.categoryCode || group.catSlug;
                                const prefixRegex = new RegExp(`^[a-z]{2,3}-to-us-${catCode}-`, 'i');
                                const shortId = v.id.replace(prefixRegex, '');
                                const url = `/in-to-us-${catCode}-${shortId}`;
                                return (
                                  <li key={v.id} className="flex justify-between items-center text-slate-700 hover:text-purple-800">
                                    <a
                                      href={url}
                                      onClick={(e) => { if (navigate) { e.preventDefault(); navigate(url); } }}
                                      className="hover:underline truncate pr-2 font-medium flex items-center"
                                    >
                                      {v.officialCode && (
                                        <span className="bg-purple-200 text-purple-950 font-mono text-[9px] px-1 py-0.5 rounded font-bold mr-1 shrink-0">
                                          {v.officialCode}
                                        </span>
                                      )}
                                      <span className="truncate">• {v.name}</span>
                                      <span className="bg-purple-100 text-purple-900 border border-purple-300 text-[8px] px-1 py-0.2 rounded font-semibold ml-1 shrink-0">
                                        Programme
                                      </span>
                                      {v.isLegacy ? (
                                        <span className="bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded font-semibold ml-1 shrink-0">
                                          Legacy
                                        </span>
                                      ) : (
                                        <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1 py-0.2 rounded font-semibold ml-1 shrink-0">
                                          Active
                                        </span>
                                      )}
                                    </a>
                                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{v.fee}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Categories Grid for Non-US Countries */
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
                            const prefixRegex = new RegExp(`^[a-z]{2,3}-to-${code.toLowerCase()}-${cat}-`, 'i');
                            const shortId = v.id.replace(prefixRegex, '');
                            const url = `/in-to-${code.toLowerCase()}-${cat}-${shortId}`;
                            return (
                              <li key={v.id} className="flex justify-between items-center text-slate-700 hover:text-blue-700">
                                <a
                                  href={url}
                                  onClick={(e) => { if (navigate) { e.preventDefault(); navigate(url); } }}
                                  className="hover:underline truncate pr-2 font-medium flex items-center"
                                >
                                  {v.officialCode && (
                                    <span className="bg-slate-200 text-slate-800 font-mono text-[9px] px-1 py-0.5 rounded font-bold mr-1 shrink-0">
                                      {v.officialCode}
                                    </span>
                                  )}
                                  {v.regionalCategory && (
                                    <span className="bg-teal-100 text-teal-900 font-mono text-[8px] px-1 py-0.5 rounded font-bold mr-1 shrink-0">
                                      {v.regionalCategory}
                                    </span>
                                  )}
                                  <span className="truncate">• {v.name}</span>
                                  {v.isLegacy ? (
                                    <span className="bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded font-semibold ml-1 shrink-0">
                                      Legacy
                                    </span>
                                  ) : (
                                    (code === 'GB' || code === 'CA' || code === 'AU') && (
                                      <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1 py-0.2 rounded font-semibold ml-1 shrink-0">
                                        Active
                                      </span>
                                    )
                                  )}
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

