import React, { useState } from 'react';
import { FULL_VISA_DB, BASE_COUNTRY_VISAS, COUNTRY_INFO, VisaItem, CountryVisas } from '../data/fullVisaDatabase';
import { UK_111_VISAS } from '../data/ukVisas';
import {
  UK_GROUP_1_REGIONAL_WORK,
  UK_GROUP_2_FAMILY_SPECIAL,
  UK_GROUP_3_EUSS_ROUTES,
  UK_GROUP_4_BNO_ROUTES,
  UK_GROUP_5_UKRAINE_SCHEMES,
  UK_GROUP_6_PROTECTION_STATELESS,
  UK_GROUP_7_SETTLEMENT_ROUTES,
  UK_GROUP_8_NATIONALITY_CITIZENSHIP,
  UK_GROUP_9_ENTRY_STATUS,
  UK_GROUP_10_ARMED_FORCES,
  UK_GROUP_11_LEGACY_ROUTES
} from '../data/ukAdditionalRoutes';

export function SitemapPage({ navigate }: { navigate?: (path: string) => void }) {
  const [search, setSearch] = useState('');

  const countryCodes = Object.keys(COUNTRY_INFO).filter(code => code === code.toUpperCase());

  const filteredCodes = countryCodes.filter(code => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = COUNTRY_INFO[code]?.name.toLowerCase() || '';
    return code.toLowerCase().includes(q) || name.includes(q);
  });

  const categoriesList: (keyof CountryVisas)[] = ['tourist', 'work', 'student', 'family', 'business', 'pr'];
  
  let totalUniqueRecords = 0;
  countryCodes.forEach(toCode => {
    const cData = BASE_COUNTRY_VISAS[toCode] || FULL_VISA_DB[toCode];
    if (cData) {
      categoriesList.forEach(cat => {
        totalUniqueRecords += cData[cat]?.length || 0;
      });
    }
  });

  const ukAdditionalGroups = [
    { title: "1. Regional Work, Salary & Shortage Classifications (11)", items: UK_GROUP_1_REGIONAL_WORK },
    { title: "2. Family Circumstance & Breakdown Routes (6)", items: UK_GROUP_2_FAMILY_SPECIAL },
    { title: "3. EU Settlement Scheme (EUSS) Complete Routes (8)", items: UK_GROUP_3_EUSS_ROUTES },
    { title: "4. Hong Kong BN(O) Additional Routes (5)", items: UK_GROUP_4_BNO_ROUTES },
    { title: "5. Ukraine Schemes (6)", items: UK_GROUP_5_UKRAINE_SCHEMES },
    { title: "6. Protection, Asylum & Stateless Routes (8)", items: UK_GROUP_6_PROTECTION_STATELESS },
    { title: "7. Settlement & Indefinite Leave to Remain (ILR) Routes (11)", items: UK_GROUP_7_SETTLEMENT_ROUTES },
    { title: "8. British Nationality & Citizenship Registration Routes (13)", items: UK_GROUP_8_NATIONALITY_CITIZENSHIP },
    { title: "9. Permission to Enter, Electronic Status & Special Entry (13)", items: UK_GROUP_9_ENTRY_STATUS },
    { title: "10. Armed Forces & Dependants Routes (7)", items: UK_GROUP_10_ARMED_FORCES },
    { title: "11. Historical & Legacy UK Visa Classifications (23)", items: UK_GROUP_11_LEGACY_ROUTES },
  ];

  const buildVisaUrl = (fromCode: string, toCode: string, cat: string, v: VisaItem) => {
    if (/^in-to-/i.test(v.id)) {
      return `/${v.id.replace(/^in-to-/i, `${fromCode.toLowerCase()}-to-`)}`;
    }
    const prefixRegex = new RegExp(`^[a-z]{2,3}-to-${toCode.toLowerCase()}-${cat}-`, 'i');
    const shortId = v.id.replace(prefixRegex, '');
    return `/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${cat}-${shortId}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
          <button onClick={() => navigate?.('/')} className="hover:underline text-blue-600 cursor-pointer">Home</button>
          <span>&gt;</span>
          <span className="text-slate-900 font-bold">Global Visa Sitemap (1209+ Pages)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
          VisaApply.org - Global Visa Sitemap (1209+ Pages / {totalUniqueRecords}+ Records)
        </h1>
        <p className="text-gray-600 text-sm">
          Complete index of all {totalUniqueRecords}+ unique visa & immigration programme guides (including UK 222 Complete 2-Directory Architecture: 111 Official Visas + 111 Additional Routes, USA 201, Canada 130+, Australia 135, Germany 138, UAE 135, Singapore 109, Japan 128, Thailand 113).
        </p>
      </div>

      <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search destination country (e.g. United Kingdom, GB, US, Canada, Australia)..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
        />
      </div>

      <div className="space-y-8">
        {filteredCodes.map(toCode => {
          const cName = COUNTRY_INFO[toCode]?.name;
          const cFlag = COUNTRY_INFO[toCode]?.flag || '🌍';
          
          return (
            <div key={toCode} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span>{cFlag}</span>
                  <span>Visa & Immigration Guides for {cName} ({toCode})</span>
                </h2>
                {toCode === 'GB' && (
                  <span className="bg-indigo-600 text-white text-xs font-extrabold px-3 py-1 rounded-full">
                    🇬🇧 222 Total UK Records (111 Official Visas + 111 Additional Routes)
                  </span>
                )}
              </div>

              {/* Special 2-Directory Breakdown for United Kingdom (GB) */}
              {toCode === 'GB' && (
                <div className="space-y-6 bg-indigo-50/40 border border-indigo-200 rounded-2xl p-5">
                  <div>
                    <h3 className="text-base font-extrabold text-indigo-950 mb-1">
                      🛂 Directory 1: Official UK Visa & Immigration Documents (111 Entries)
                    </h3>
                    <p className="text-xs text-slate-600 mb-3">
                      Tourist (13) · Work (32) · Student (10) · Family (27) · Business (9) · PR & Settlement (20)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoriesList.map(cat => {
                        const visas = UK_111_VISAS[cat] || [];
                        return (
                          <div key={`uk-dir1-${cat}`} className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                            <h4 className="text-xs font-extrabold uppercase text-indigo-900 mb-2 flex justify-between">
                              <span>{cat} Visas</span>
                              <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">{visas.length}</span>
                            </h4>
                            <ul className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                              {visas.map(v => {
                                const url = buildVisaUrl('IN', 'GB', cat, v);
                                return (
                                  <li key={v.id} className="text-xs flex items-start justify-between gap-2 border-b border-slate-100 pb-1">
                                    <a
                                      href={url}
                                      onClick={(e) => { if (navigate) { e.preventDefault(); navigate(url); } }}
                                      className="text-blue-600 hover:underline font-medium"
                                    >
                                      {v.officialCode ? `[${v.officialCode}] ` : ''}{v.name}
                                    </a>
                                    <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded shrink-0">
                                      {v.record_type || 'VISA_ROUTE'}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-indigo-200">
                    <h3 className="text-base font-extrabold text-purple-950 mb-1">
                      📋 Directory 2: Additional UK Routes, Schemes & Classifications (111 Entries)
                    </h3>
                    <p className="text-xs text-slate-600 mb-3">
                      Grouped across 11 statutory categories with record_type, application status, and official GOV.UK verification links.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ukAdditionalGroups.map((grp, idx) => (
                        <div key={`uk-dir2-${idx}`} className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-2xs">
                          <h4 className="text-xs font-extrabold text-purple-950 mb-2">{grp.title}</h4>
                          <ul className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                            {grp.items.map(v => {
                              const url = buildVisaUrl('IN', 'GB', v.category || 'pr', v);
                              return (
                                <li key={v.id} className="text-xs flex flex-col gap-0.5 border-b border-slate-100 pb-1.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <a
                                      href={url}
                                      onClick={(e) => { if (navigate) { e.preventDefault(); navigate(url); } }}
                                      className="text-blue-700 hover:underline font-semibold"
                                    >
                                      [{v.officialCode}] {v.officialName || v.name}
                                    </a>
                                    <span className="text-[10px] font-mono bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded shrink-0">
                                      {v.record_type}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                                    <span>Status: <strong>{v.status || 'Active'}</strong> ({v.application_status || 'OPEN'})</span>
                                    {v.officialSource && (
                                      <a href={v.officialSource} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                        GOV.UK ↗
                                      </a>
                                    )}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Standard Country Matrix (Showing Primary Origin IN + Dual Access) */}
              {['IN', 'US', 'GB', 'CA', 'AU'].map(fromCode => {
                if (fromCode === toCode) return null;
                const countryData: CountryVisas = FULL_VISA_DB[fromCode]?.[toCode] || BASE_COUNTRY_VISAS[toCode];
                if (!countryData) return null;

                return (
                  <div key={`${fromCode}-to-${toCode}`} className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-700">From {COUNTRY_INFO[fromCode]?.name || fromCode} to {cName}:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoriesList.map(cat => {
                        const visas = countryData[cat] || [];
                        if (visas.length === 0) return null;
                        return (
                          <div key={cat} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2 flex justify-between">
                              <span>{cat}</span>
                              <span>({visas.length})</span>
                            </h4>
                            <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                              {visas.map(v => {
                                const url = buildVisaUrl(fromCode, toCode, cat, v);
                                return (
                                  <li key={v.id} className="text-xs">
                                    <a href={url} onClick={(e) => { if (navigate) { e.preventDefault(); navigate(url); } }} className="text-blue-600 hover:underline">
                                      {v.name}
                                    </a>
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
          );
        })}
      </div>
    </div>
  );
}


