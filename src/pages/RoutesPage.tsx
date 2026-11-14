import React, { useState, useMemo } from 'react';
import { NAME_MAP_249, FLAG_MAP_249 } from '../data/fullVisaDatabase';
import {
  getAnyToAnyRouteInfo,
  TOP_20_FROM_COUNTRIES,
} from '../data/anyToAnyMatrix';
import { AIRPORT_IATA_MAP } from '../data/travelpayoutsConfig';

interface RoutesPageProps {
  onNavigate: (path: string) => void;
}

export const RoutesPage: React.FC<RoutesPageProps> = ({ onNavigate }) => {
  const [fromCode, setFromCode] = useState<string>('ae');
  const [toFilter, setToFilter] = useState<string>('');
  const [badgeFilter, setBadgeFilter] = useState<'ALL' | 'VISA_FREE' | 'EVISA' | 'VOA'>('ALL');

  const allIsoCodes = useMemo(() => Object.keys(NAME_MAP_249).filter((k) => k !== 'eu'), []);

  const routesForOrigin = useMemo(() => {
    const q = toFilter.trim().toLowerCase();
    return allIsoCodes
      .filter((to) => to.toLowerCase() !== fromCode.toLowerCase())
      .map((to) => getAnyToAnyRouteInfo(fromCode, to))
      .filter((r) => {
        if (badgeFilter === 'VISA_FREE' && !r.visaFree) return false;
        if (badgeFilter === 'EVISA' && !r.eVisaEligible) return false;
        if (badgeFilter === 'VOA' && !r.voaEligible) return false;
        if (!q) return true;
        return (
          r.toName.toLowerCase().includes(q) ||
          r.fromName.toLowerCase().includes(q) ||
          r.toCountry.toLowerCase().includes(q) ||
          `${r.fromName} to ${r.toName}`.toLowerCase().includes(q)
        );
      });
  }, [allIsoCodes, fromCode, toFilter, badgeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B3D91] to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-emerald-300">
            <span>🌍 249 × 248 = 61,752 LIVE ANY-TO-ANY BILATERAL VISA ROUTES • 11,563 OFFICIAL VISAS</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Global Any-to-Any Visa Route Explorer
            </h1>
            <div>
              <span className="inline-block bg-blue-500/25 border border-blue-400/40 text-blue-200 px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold whitespace-nowrap">
                (61,752 Routes)
              </span>
            </div>
          </div>
          <p className="text-blue-100 text-sm sm:text-base max-w-3xl mx-auto">
            Explore all 11,563 official government visa subclasses across 249 countries — check bilateral visa counts, Visa-Free eligibility, local embassy locations, and flights from ANY passport/residence country to ANY destination worldwide.
          </p>

          {/* Quick Popular Corridors */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              { from: 'ae', to: 'us', label: '🇦🇪 UAE → 🇺🇸 USA (45 Visas)' },
              { from: 'us', to: 'in', label: '🇺🇸 USA → 🇮🇳 India (65 Visas)' },
              { from: 'us', to: 'ae', label: '🇺🇸 USA → 🇦🇪 UAE (30 Visas)' },
              { from: 'gb', to: 'au', label: '🇬🇧 UK → 🇦🇺 Australia (55 Visas)' },
              { from: 'in', to: 'us', label: '🇮🇳 India → 🇺🇸 USA (278 Visas)' },
              { from: 'ae', to: 'gb', label: '🇦🇪 UAE → 🇬🇧 UK (38 Visas)' },
            ].map((corridor) => (
              <a
                key={`${corridor.from}-${corridor.to}`}
                href={`/${corridor.from}-to-${corridor.to}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(`/${corridor.from}-to-${corridor.to}`);
                }}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white cursor-pointer transition-colors"
              >
                {corridor.label} →
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">
                1. Select Origin Passport / Residence (249 Countries)
              </label>
              <select
                value={fromCode}
                onChange={(e) => setFromCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-slate-900 text-sm focus:outline-none focus:border-[#0B3D91] cursor-pointer"
              >
                {allIsoCodes.map((c) => (
                  <option key={c} value={c}>
                    {FLAG_MAP_249[c]} {NAME_MAP_249[c]} ({c.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-500 mb-1.5">
                2. Search Destination Country (248 Routes for {NAME_MAP_249[fromCode]})
              </label>
              <input
                type="text"
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                placeholder={`Search from ${NAME_MAP_249[fromCode]} to USA, UK, Canada, Schengen...`}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-medium text-slate-900 text-sm focus:outline-none focus:border-[#0B3D91]"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {(['ALL', 'VISA_FREE', 'EVISA', 'VOA'] as const).map((bf) => (
                <button
                  key={bf}
                  type="button"
                  onClick={() => setBadgeFilter(bf)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold border cursor-pointer transition-colors ${
                    badgeFilter === bf
                      ? 'bg-[#0B3D91] text-white border-[#0B3D91]'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {bf === 'ALL'
                    ? 'All (248)'
                    : bf === 'VISA_FREE'
                    ? '✅ Visa-Free'
                    : bf === 'EVISA'
                    ? '⚡ e-Visa'
                    : '🛬 VOA'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Top 20 Origin Switcher Pills */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500">Top Origin Passports:</span>
            {TOP_20_FROM_COUNTRIES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setFromCode(code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  fromCode === code
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {FLAG_MAP_249[code]} {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Routes Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routesForOrigin.map((route) => {
            const fromLower = route.fromCountry.toLowerCase();
            const toLower = route.toCountry.toLowerCase();
            const fromIata = AIRPORT_IATA_MAP[fromLower] || route.fromCountry;
            const toIata = AIRPORT_IATA_MAP[toLower] || route.toCountry;
            const routeHref = `/${fromLower}-to-${toLower}`;

            return (
              <article
                key={`${fromLower}-${toLower}`}
                onClick={() => onNavigate(routeHref)}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                      <span>{route.fromFlag}</span>
                      <span className="text-xs text-slate-400">→</span>
                      <span>{route.toFlag}</span>
                      <a
                        href={routeHref}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onNavigate(routeHref);
                        }}
                        className="text-sm group-hover:text-[#0B3D91] transition-colors hover:underline"
                      >
                        {route.fromName} to {route.toName} Visa
                      </a>
                    </div>
                    <span className="bg-blue-50 text-[#0B3D91] text-xs font-black px-2.5 py-1 rounded-full shrink-0">
                      {route.totalVisas} Visas
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {route.visaFree ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                        ✅ Visa-Free / ETA
                      </span>
                    ) : route.eVisaEligible ? (
                      <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                        ⚡ e-Visa Eligible
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                        🏛 Embassy Visa
                      </span>
                    )}
                    {route.voaEligible && (
                      <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                        🛬 VOA Available
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      ⏱ <strong>Processing:</strong> {route.processing}
                    </div>
                    <div>
                      🛤 <strong>Best Track:</strong> {route.bestRoute}
                    </div>
                  </div>

                  {/* Direct Category Sub-Links for Crawler Discovery */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {(['tourist', 'work', 'student', 'family', 'business', 'pr'] as const).map((cat) => (
                      <a
                        key={cat}
                        href={`/${fromLower}-to-${toLower}-${cat}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onNavigate(`/${fromLower}-to-${toLower}-${cat}`);
                        }}
                        className="text-[10px] font-semibold text-slate-600 hover:text-[#0B3D91] bg-slate-50 hover:bg-blue-50 border border-slate-200 px-2 py-0.5 rounded"
                      >
                        {cat === 'pr' ? 'PR' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFromCode(toLower);
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg cursor-pointer"
                    title="Swap Origin and Destination"
                  >
                    ⇄ Swap ({route.toCountry}→{route.fromCountry})
                  </button>
                  <a
                    href={`/flights?from=${fromIata}&to=${toIata}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onNavigate(`/flights?from=${fromIata}&to=${toIata}`);
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    ✈ {fromIata}→{toIata} Flights
                  </a>
                  <a
                    href={routeHref}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onNavigate(routeHref);
                    }}
                    className="text-xs font-extrabold text-[#0B3D91] hover:underline"
                  >
                    View {route.totalVisas} Visas →
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Crawlable Global Origin-to-Destination Hub Matrix for Search Engine Indexing */}
        <nav
          aria-label="Global Bilateral Visa Routes Directory"
          className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-6"
        >
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Complete Global Bilateral Visa Corridors &amp; Country Immigration Hubs (2026 Index)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Direct crawlable index of bilateral visa requirements, category pathways, and official immigration hubs across all sovereign jurisdictions.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
              1. Global Destination Visa Guides for Indian Citizens (IN → All Destinations)
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {allIsoCodes
                .filter((code) => code !== 'in')
                .map((code) => (
                  <a
                    key={`in-to-${code}`}
                    href={`/in-to-${code}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/in-to-${code}`);
                    }}
                    className="text-[11px] font-medium text-slate-700 hover:text-[#0B3D91] hover:underline bg-slate-50 border border-slate-200 px-2 py-0.5 rounded"
                  >
                    {FLAG_MAP_249[code]} {NAME_MAP_249[code]} Visa
                  </a>
                ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
              2. Global Country Immigration Hubs &amp; Inbound Corridors
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {allIsoCodes.map((code) => (
                <a
                  key={`imm-${code}`}
                  href={`/immigration/${code}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/immigration/${code}`);
                  }}
                  className="text-[11px] font-medium text-slate-700 hover:text-[#0B3D91] hover:underline bg-slate-50 border border-slate-200 px-2 py-0.5 rounded"
                >
                  {NAME_MAP_249[code]} Immigration ({code.toUpperCase()})
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
              3. High-Volume International Bilateral Corridors (Any-to-Any Passport Matrix)
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                ['am', 'ba'], ['au', 'my'], ['br', 'de'], ['us', 'be'], ['zw', 'gb'],
                ['us', 'gb'], ['us', 'ca'], ['us', 'au'], ['us', 'de'], ['us', 'fr'], ['us', 'jp'], ['us', 'ae'], ['us', 'sg'],
                ['gb', 'us'], ['gb', 'ca'], ['gb', 'au'], ['gb', 'ae'], ['gb', 'sg'], ['gb', 'de'], ['gb', 'fr'], ['gb', 'es'],
                ['ca', 'us'], ['ca', 'gb'], ['ca', 'au'], ['ca', 'de'], ['ca', 'fr'], ['ca', 'jp'], ['ca', 'ae'], ['ca', 'in'],
                ['au', 'us'], ['au', 'gb'], ['au', 'ca'], ['au', 'nz'], ['au', 'sg'], ['au', 'jp'], ['au', 'id'], ['au', 'th'],
                ['ae', 'us'], ['ae', 'gb'], ['ae', 'ca'], ['ae', 'de'], ['ae', 'fr'], ['ae', 'ch'], ['ae', 'sg'], ['ae', 'au'],
                ['sg', 'us'], ['sg', 'gb'], ['sg', 'au'], ['sg', 'jp'], ['sg', 'cn'], ['sg', 'de'], ['sg', 'fr'], ['sg', 'my'],
                ['de', 'us'], ['de', 'ca'], ['de', 'au'], ['de', 'jp'], ['de', 'sg'], ['de', 'ae'], ['de', 'th'], ['de', 'br'],
                ['fr', 'us'], ['fr', 'ca'], ['fr', 'au'], ['fr', 'jp'], ['fr', 'sg'], ['fr', 'ae'], ['fr', 'ma'], ['fr', 'sn'],
                ['za', 'gb'], ['za', 'au'], ['za', 'nz'], ['za', 'us'], ['za', 'ca'], ['za', 'ae'], ['za', 'de'], ['za', 'ie'],
                ['ng', 'gb'], ['ng', 'us'], ['ng', 'ca'], ['ng', 'ae'], ['ng', 'de'], ['ng', 'za'], ['ph', 'us'], ['ph', 'ca'],
                ['ph', 'au'], ['ph', 'jp'], ['ph', 'ae'], ['ph', 'sg'], ['pk', 'gb'], ['pk', 'us'], ['pk', 'ca'], ['pk', 'ae'],
                ['pk', 'sa'], ['bd', 'us'], ['bd', 'gb'], ['bd', 'ca'], ['bd', 'ae'], ['bd', 'my'], ['br', 'us'], ['br', 'pt'],
                ['mx', 'us'], ['mx', 'ca'], ['mx', 'es'], ['kr', 'us'], ['kr', 'jp'], ['kr', 'au'], ['jp', 'us'], ['jp', 'gb'],
              ].map(([o, d]) => (
                <a
                  key={`matrix-${o}-to-${d}`}
                  href={`/${o}-to-${d}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/${o}-to-${d}`);
                  }}
                  className="text-[11px] font-medium text-blue-800 hover:underline bg-blue-50/60 border border-blue-200 px-2 py-0.5 rounded"
                >
                  {NAME_MAP_249[o] || o.toUpperCase()} → {NAME_MAP_249[d] || d.toUpperCase()} ({o.toUpperCase()}-to-{d.toUpperCase()})
                </a>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

