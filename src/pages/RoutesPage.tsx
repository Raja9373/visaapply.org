import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { NAME_MAP_249, FLAG_MAP_249 } from '../data/countryLightRegistry';
import {
  getAnyToAnyRouteInfo,
  TOP_20_FROM_COUNTRIES,
} from '../data/anyToAnyLight';
import { AIRPORT_IATA_MAP } from '../data/travelpayoutsConfig';
import {
  isStaticCatalogEnabled,
  staticCatalogClient,
} from '../services/staticCatalogClient';
import type { ResolvedCompactRoute } from '../types/staticCatalog';

interface RoutesPageProps {
  onNavigate: (path: string) => void;
}

export const RoutesPage: React.FC<RoutesPageProps> = ({ onNavigate }) => {
  const [fromCode, setFromCode] = useState<string>('ae');
  const [toFilter, setToFilter] = useState<string>('');
  const [badgeFilter, setBadgeFilter] = useState<'ALL' | 'VERIFIED_OVERRIDE' | 'VISA_FREE' | 'EVISA' | 'VOA'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [compactRoutes, setCompactRoutes] = useState<ResolvedCompactRoute[]>([]);

  const allIsoCodes = useMemo(() => Object.keys(NAME_MAP_249).filter((k) => k !== 'eu'), []);

  const loadRoutesForOrigin = useCallback(
    async (origin: string, forceRefresh = false) => {
      setLoading(true);
      setErrorMsg(null);

      // Controlled rollback boundary
      if (!isStaticCatalogEnabled('routes')) {
        const legacy: ResolvedCompactRoute[] = allIsoCodes
          .filter((to) => to.toLowerCase() !== origin.toLowerCase())
          .map((to) => {
            const info = getAnyToAnyRouteInfo(origin, to);
            const fromIso = info.fromCountry.toUpperCase();
            const toIso = info.toCountry.toUpperCase();
            return {
              routeId: `${fromIso.toLowerCase()}-to-${toIso.toLowerCase()}`,
              fromIso,
              toIso,
              fromName: info.fromName,
              toName: info.toName,
              fromFlag: info.fromFlag,
              toFlag: info.toFlag,
              visaFree: info.visaFree,
              eVisaEligible: info.eVisaEligible,
              voaEligible: info.voaEligible,
              maxStayDays: null,
              ruleSpecificity:
                info.eligibilityStatus === 'AWAITING_VERIFICATION' || info.eligibilityStatus === 'UNKNOWN'
                  ? 'AWAITING_VERIFICATION'
                  : 'GENERIC_BLOC_OR_ORIGIN_CLASSIFICATION',
              classificationLabel:
                info.eligibilityStatus === 'AWAITING_VERIFICATION' || info.eligibilityStatus === 'UNKNOWN'
                  ? 'Bilateral Verification Pending'
                  : info.visaFree
                    ? 'Generic Treaty / Origin Scope: Visa-Free'
                    : info.eVisaEligible
                      ? 'Generic Origin Scope: e-Visa'
                      : 'Consular Visa Required',
              disclaimer:
                'Legacy compact-matrix lookup (not official legal advice). Confirm final requirements on the official embassy portal.',
              lastVerifiedDate: null,
              verifiedProgramCount: info.totalVisas,
              overrideProgramIds: [],
              scopeNote: null,
              routeHref: `/${fromIso.toLowerCase()}-to-${toIso.toLowerCase()}`,
            };
          });
        setCompactRoutes(legacy);
        setLoading(false);
        return;
      }

      const res = await staticCatalogClient.getCompactRoutesForOrigin(origin, { forceRefresh });
      if (res.status === 'ok' && res.data) {
        setCompactRoutes(res.data);
        setLoading(false);
      } else {
        setErrorMsg(res.error || 'Unable to load compact route matrix. Please retry.');
        setLoading(false);
      }
    },
    [allIsoCodes]
  );

  useEffect(() => {
    void loadRoutesForOrigin(fromCode, false);
  }, [fromCode, loadRoutesForOrigin]);

  const routesForOrigin = useMemo(() => {
    const q = toFilter.trim().toLowerCase();
    return compactRoutes
      .filter((r) => {
        if (badgeFilter === 'VERIFIED_OVERRIDE' && r.ruleSpecificity !== 'VERIFIED_COUNTRY_OVERRIDE') {
          return false;
        }
        if (badgeFilter === 'VISA_FREE' && !r.visaFree) return false;
        if (badgeFilter === 'EVISA' && !r.eVisaEligible) return false;
        if (badgeFilter === 'VOA' && !r.voaEligible) return false;
        if (!q) return true;
        return (
          r.toName.toLowerCase().includes(q) ||
          r.fromName.toLowerCase().includes(q) ||
          r.toIso.toLowerCase().includes(q) ||
          `${r.fromName} to ${r.toName}`.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const rank = (s: ResolvedCompactRoute['ruleSpecificity']) =>
          s === 'VERIFIED_COUNTRY_OVERRIDE'
            ? 0
            : s === 'GENERIC_BLOC_OR_ORIGIN_CLASSIFICATION'
              ? 1
              : s === 'AWAITING_VERIFICATION'
                ? 2
                : 3;
        const diff = rank(a.ruleSpecificity) - rank(b.ruleSpecificity);
        if (diff !== 0) return diff;
        return a.toName.localeCompare(b.toName);
      });
  }, [compactRoutes, toFilter, badgeFilter]);

  const verifiedOverrideCountForOrigin = useMemo(
    () => compactRoutes.filter((r) => r.ruleSpecificity === 'VERIFIED_COUNTRY_OVERRIDE').length,
    [compactRoutes]
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B3D91] to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-emerald-300">
            <span>🌍 COMPACT STATIC ROUTE MATRIX • 249 × 248 = 61,752 POTENTIAL BILATERAL PAIRS</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Global Any-to-Any Visa Route Explorer
            </h1>
            <div>
              <span className="inline-block bg-blue-500/25 border border-blue-400/40 text-blue-200 px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold whitespace-nowrap">
                Compact Matrix + Lazy Sparse Overrides (Zero Monolithic 61,752 Dump)
              </span>
            </div>
          </div>
          <p className="text-blue-100 text-sm sm:text-base max-w-3xl mx-auto">
            Resolves bilateral corridors client-side from a 1.3 KB compact rule matrix plus lazy verified corridor overrides. Verified corridor overrides are explicitly distinguished from generic treaty classifications and pending pairs.
          </p>

          {/* Quick Popular Corridors */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              { from: 'ae', to: 'us', label: '🇦🇪 UAE → 🇺🇸 USA (Verified Override)' },
              { from: 'us', to: 'in', label: '🇺🇸 USA → 🇮🇳 India (Verified Override)' },
              { from: 'us', to: 'ae', label: '🇺🇸 USA → 🇦🇪 UAE (Verified Override)' },
              { from: 'gb', to: 'au', label: '🇬🇧 UK → 🇦🇺 Australia (Check Corridor)' },
              { from: 'in', to: 'us', label: '🇮🇳 India → 🇺🇸 USA (Check Corridor)' },
              { from: 'ae', to: 'gb', label: '🇦🇪 UAE → 🇬🇧 UK (Check Corridor)' },
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
          {/* Honest Legal / Classification Disclaimer */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#0B3D91] shrink-0 mt-0.5" />
            <div>
              <strong>Rule Specificity Notice (Not Official Legal Advice):</strong> Corridors marked{' '}
              <span className="font-bold text-emerald-800">Verified Corridor Override</span> (currently 3 curated pairs globally; {verifiedOverrideCountForOrigin} for {NAME_MAP_249[fromCode] || fromCode.toUpperCase()}) carry verified sovereign source metadata. Entries marked{' '}
              <span className="font-bold text-blue-900">Generic Treaty / Matrix Classification</span> are general indicators only, and{' '}
              <span className="font-bold text-slate-800">Bilateral Verification Pending</span> pairs do not invent country-specific visa rules.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="routes-origin-select" className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">
                1. Select Origin Passport / Residence (249 Countries)
              </label>
              <select
                id="routes-origin-select"
                aria-label="Select Origin Passport or Residence Country"
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
              <label htmlFor="routes-dest-search" className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">
                2. Search Destination Country (248 Routes for {NAME_MAP_249[fromCode]})
              </label>
              <input
                id="routes-dest-search"
                type="text"
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                placeholder={`Search from ${NAME_MAP_249[fromCode]} to USA, UK, Canada, Schengen...`}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-medium text-slate-900 text-sm focus:outline-none focus:border-[#0B3D91]"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {(['ALL', 'VERIFIED_OVERRIDE', 'VISA_FREE', 'EVISA', 'VOA'] as const).map((bf) => (
                <button
                  key={bf}
                  type="button"
                  onClick={() => setBadgeFilter(bf)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-extrabold border cursor-pointer transition-colors ${
                    badgeFilter === bf
                      ? 'bg-[#0B3D91] text-white border-[#0B3D91]'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {bf === 'ALL'
                    ? 'All (248)'
                    : bf === 'VERIFIED_OVERRIDE'
                      ? `Verified (${verifiedOverrideCountForOrigin})`
                      : bf === 'VISA_FREE'
                        ? 'Visa-Free'
                        : bf === 'EVISA'
                          ? 'e-Visa'
                          : 'VOA'}
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

        {/* Error State with Retry */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-6 bg-rose-50 border border-rose-300 rounded-2xl p-5 text-rose-950 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => void loadRoutesForOrigin(fromCode, true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !errorMsg && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 p-5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Routes Grid */}
        {!loading && !errorMsg && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routesForOrigin.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
                <p className="text-sm font-bold text-slate-800">
                  No routes match the current filter for {NAME_MAP_249[fromCode]}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setToFilter('');
                    setBadgeFilter('ALL');
                  }}
                  className="text-xs font-bold text-[#0B3D91] hover:underline cursor-pointer"
                >
                  Show All 248 Destinations
                </button>
              </div>
            ) : (
              routesForOrigin.map((route) => {
                const fromLower = route.fromIso.toLowerCase();
                const toLower = route.toIso.toLowerCase();
                const fromIata = AIRPORT_IATA_MAP[fromLower] || route.fromIso;
                const toIata = AIRPORT_IATA_MAP[toLower] || route.toIso;

                return (
                  <article
                    key={route.routeId}
                    onClick={() => onNavigate(route.routeHref)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                          <span>{route.fromFlag}</span>
                          <span className="text-xs text-slate-400">→</span>
                          <span>{route.toFlag}</span>
                          <a
                            href={route.routeHref}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onNavigate(route.routeHref);
                            }}
                            className="text-sm group-hover:text-[#0B3D91] transition-colors hover:underline"
                          >
                            {route.fromName} to {route.toName} Visa
                          </a>
                        </div>
                        <span className="bg-blue-50 text-[#0B3D91] text-[11px] font-black px-2.5 py-1 rounded-full shrink-0">
                          {route.verifiedProgramCount > 0
                            ? `${route.verifiedProgramCount} Verified`
                            : 'Hub Pending'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {route.ruleSpecificity === 'VERIFIED_COUNTRY_OVERRIDE' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-extrabold px-2 py-0.5 rounded-md">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{route.classificationLabel}</span>
                          </span>
                        ) : route.ruleSpecificity === 'GENERIC_BLOC_OR_ORIGIN_CLASSIFICATION' ? (
                          <span className="bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-bold px-2 py-0.5 rounded-md">
                            {route.classificationLabel}
                          </span>
                        ) : route.ruleSpecificity === 'UNINHABITED_TERRITORY' ? (
                          <span className="bg-slate-200 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                            Uninhabited Territory (N/A)
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-md">
                            Bilateral Verification Pending
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                        {route.scopeNote || route.disclaimer}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">
                        {route.lastVerifiedDate
                          ? `Verified ${route.lastVerifiedDate}`
                          : `${fromIata} → ${toIata}`}
                      </span>
                      <span className="font-extrabold text-[#0B3D91] group-hover:translate-x-0.5 transition-transform">
                        Open Corridor →
                      </span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
