import React, { useState } from 'react';
import { FULL_VISA_DB, COUNTRY_INFO, VisaItem, CountryVisas } from '../data/fullVisaDatabase';

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
  
  let totalVisasCount = 0;
  countryCodes.forEach(fromCode => {
    countryCodes.forEach(toCode => {
      const countryData: CountryVisas = FULL_VISA_DB[fromCode]?.[toCode];
      if (countryData) {
        categoriesList.forEach(cat => {
          totalVisasCount += countryData[cat]?.length || 0;
        });
      }
    });
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
          VisaApply.org - Global Visa Sitemap ({totalVisasCount}+ Pages)
        </h1>
        <p className="text-gray-600 text-sm">
          Complete index of all {totalVisasCount}+ visa requirement guides, fee breakdowns, and application workflows.
        </p>
      </div>

      <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search destination country..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
        />
      </div>

      <div className="space-y-8">
        {filteredCodes.map(toCode => {
          const cName = COUNTRY_INFO[toCode]?.name;
          
          return (
            <div key={toCode} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-3">Visa Guides for {cName}</h2>
              
              {countryCodes.map(fromCode => {
                const countryData: CountryVisas = FULL_VISA_DB[fromCode]?.[toCode];
                if (!countryData) return null;

                return (
                  <div key={`${fromCode}-to-${toCode}`} className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-700">From {COUNTRY_INFO[fromCode]?.name}:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoriesList.map(cat => {
                        const visas = countryData[cat] || [];
                        if (visas.length === 0) return null;
                        return (
                          <div key={cat} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">{cat}</h4>
                            <ul className="space-y-1">
                              {visas.map(v => {
                                const type = v.categoryCode || cat;
                                const subtype = v.subcategoryCode || v.id.split('-').pop() || 'guide';
                                const url = `/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${type}-${subtype}`;
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

