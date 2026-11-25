import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  Shield,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Ban,
} from 'lucide-react';
import {
  isStaticCatalogEnabled,
  staticCatalogClient,
} from '../services/staticCatalogClient';
import type {
  CountryChunkPayload,
  CountryIndexEntry,
  ProgramIndexEntry,
} from '../types/staticCatalog';

interface VisaComparisonProps {
  selectedCodes: string[];
  onRemoveCountry: (code: string) => void;
  onAddCountry?: (code: string) => void;
  onClose?: () => void;
  onNavigate?: (path: string) => void;
  fromCode?: string;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  pr: 'Permanent Residency',
  citizenship: 'Citizenship',
  work: 'Work',
  student: 'Student',
  family: 'Family',
  business: 'Business',
  investor: 'Investor',
  digital_nomad: 'Digital Nomad',
  retirement: 'Retirement',
  tourist: 'Tourist',
  transit: 'Transit',
};

export const VisaComparison: React.FC<VisaComparisonProps> = ({
  selectedCodes,
  onRemoveCountry,
  onAddCountry,
  onClose,
  onNavigate,
}) => {
  const codes = useMemo(
    () =>
      selectedCodes
        .slice(0, 3)
        .map((c) => {
          const upper = String(c || '').trim().toUpperCase();
          return upper === 'UK' ? 'GB' : upper;
        })
        .filter((c) => /^[A-Z]{2}$/.test(c)),
    [selectedCodes]
  );

  const [pickerCode, setPickerCode] = useState<string>('CA');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countriesIndex, setCountriesIndex] = useState<CountryIndexEntry[]>([]);
  const [programsIndex, setProgramsIndex] = useState<ProgramIndexEntry[]>([]);
  const [countryChunks, setCountryChunks] = useState<Record<string, CountryChunkPayload | null>>({});
  const [legacyFallbackMeta, setLegacyFallbackMeta] = useState<Record<
    string,
    { name: string; flag: string; capital: string; currency: string; currencySymbol: string }
  > | null>(null);

  const codesKey = codes.join(',');

  const loadComparisonData = useCallback(
    async (forceRefresh = false) => {
      if (codes.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      // Controlled rollback branch ONLY when `visaComparisonWidget` flag is disabled
      if (!isStaticCatalogEnabled('visaComparisonWidget')) {
        try {
          const [metaMod, regMod] = await Promise.all([
            import('../data/countryMetaData'),
            import('../data/countryLightRegistry'),
          ]);
          const fallbackMap: Record<
            string,
            { name: string; flag: string; capital: string; currency: string; currencySymbol: string }
          > = {};
          codes.forEach((iso) => {
            const lower = iso.toLowerCase();
            const m = metaMod.getCountryMeta(lower);
            fallbackMap[iso] = {
              name: regMod.NAME_MAP_249[lower] || iso,
              flag: regMod.FLAG_MAP_249[lower] || '🌍',
              capital: m.capital,
              currency: m.currency,
              currencySymbol: m.currencySymbol,
            };
          });
          setLegacyFallbackMeta(fallbackMap);
          setLoading(false);
          return;
        } catch (err: unknown) {
          setErrorMsg(err instanceof Error ? err.message : 'Unable to load legacy comparison data.');
          setLoading(false);
          return;
        }
      }

      setLegacyFallbackMeta(null);

      const [cRes, pRes] = await Promise.all([
        staticCatalogClient.getCountriesIndex({ forceRefresh }),
        staticCatalogClient.getProgramsIndex({ forceRefresh }),
      ]);

      if (cRes.status !== 'ok' || !cRes.data || pRes.status !== 'ok' || !pRes.data) {
        setErrorMsg(
          cRes.error || pRes.error || 'Unable to load verified static catalog for country comparison.'
        );
        setLoading(false);
        return;
      }

      setCountriesIndex(cRes.data.countries);
      setProgramsIndex(pRes.data.programs);

      // Lazy-load detailed chunks ONLY for selected ACTIVE countries
      const activeSelected = codes.filter((iso) => {
        const entry = cRes.data?.countries.find((c) => c.iso === iso);
        return entry?.status === 'ACTIVE';
      });

      const chunkEntries = await Promise.all(
        activeSelected.map(async (iso) => {
          const chunkRes = await staticCatalogClient.getCountryChunk(iso, { forceRefresh });
          return [iso, chunkRes.status === 'ok' ? chunkRes.data : null] as const;
        })
      );

      const nextChunks: Record<string, CountryChunkPayload | null> = {};
      chunkEntries.forEach(([iso, chunk]) => {
        nextChunks[iso] = chunk;
      });
      setCountryChunks(nextChunks);

      // Keep picker pointed at an available verified country not already selected
      const verifiedRemaining = cRes.data.countries.filter(
        (c) => c.status === 'ACTIVE' && !codes.includes(c.iso)
      );
      if (verifiedRemaining.length > 0 && codes.includes(pickerCode)) {
        setPickerCode(verifiedRemaining[0].iso);
      }

      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [codesKey]
  );

  useEffect(() => {
    void loadComparisonData(false);
  }, [loadComparisonData]);

  if (codes.length === 0) return null;

  // Sort picker: verified ACTIVE countries first, then awaiting verification
  const pickerCountries = [...countriesIndex]
    .filter((c) => !codes.includes(c.iso) && c.status !== 'UNINHABITED_TERRITORY')
    .sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-5 sm:p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mb-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Verified Static Catalog Comparison • Zero Fabricated Metrics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Side-by-Side Country Program Comparison ({codes.length}/3 Selected)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Compares verified available immigration programs and official HTTPS authorities. Unpublished fees, processing times, and approval rates are marked unknown—never guessed or displayed as zero.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {codes.length < 3 && onAddCountry && pickerCountries.length > 0 && (
            <div className="flex items-center gap-1.5">
              <select
                value={pickerCode}
                onChange={(e) => setPickerCode(e.target.value)}
                aria-label="Select country to compare"
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50"
              >
                {pickerCountries.map((c) => (
                  <option key={c.iso} value={c.iso}>
                    {c.flag} {c.name} ({c.status === 'ACTIVE' ? `${c.verifiedProgramCount} Verified` : 'Awaiting Verification'})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onAddCountry(pickerCode.toLowerCase())}
                className="px-3 py-1.5 bg-[#0B3D91] hover:bg-blue-900 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                + Add Country
              </button>
            </div>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
            >
              ✕ Close Comparison
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div aria-busy="true" className="h-56 bg-slate-50 rounded-2xl border border-slate-200 animate-pulse" />
      )}

      {/* Error State with Retry */}
      {!loading && errorMsg && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-rose-950 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => void loadComparisonData(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Legacy Rollback View (ONLY when feature flag disables static catalog) */}
      {!loading && !errorMsg && legacyFallbackMeta && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-2xl overflow-hidden border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-left font-bold text-slate-600">COUNTRY</th>
                {codes.map((iso) => (
                  <th key={iso} className="p-3 text-center font-extrabold text-slate-900">
                    {legacyFallbackMeta[iso]?.flag} {legacyFallbackMeta[iso]?.name || iso}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-3 font-bold text-slate-700">Capital</td>
                {codes.map((iso) => (
                  <td key={iso} className="p-3 text-center">
                    {legacyFallbackMeta[iso]?.capital || 'Unknown'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-700">Currency</td>
                {codes.map((iso) => (
                  <td key={iso} className="p-3 text-center">
                    {legacyFallbackMeta[iso]?.currency || 'Unknown'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Verified Static Catalog Comparison Table */}
      {!loading && !errorMsg && !legacyFallbackMeta && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-2xl overflow-hidden border border-[#e2e8f0]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th className="p-3.5 text-left text-xs font-bold text-[#64748b] uppercase tracking-wider w-48">
                  VERIFIED FIELD
                </th>
                {codes.map((iso) => {
                  const entry = countriesIndex.find((c) => c.iso === iso);
                  const isActive = entry?.status === 'ACTIVE';
                  return (
                    <th key={iso} className="p-3.5 text-center min-w-[210px]">
                      <div className="flex flex-col items-center">
                        <div className="text-[32px] leading-none">{entry?.flag || '🌍'}</div>
                        <div className="font-extrabold text-sm sm:text-base text-slate-900 mt-1.5">
                          {entry?.name || iso} ({iso})
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1 ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : entry?.status === 'UNINHABITED_TERRITORY'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {isActive
                            ? 'VERIFIED ACTIVE HUB'
                            : entry?.status === 'UNINHABITED_TERRITORY'
                              ? 'UNINHABITED TERRITORY'
                              : 'AWAITING VERIFICATION'}
                        </span>
                        <div className="flex items-center gap-2.5 mt-2">
                          {onNavigate && (
                            <button
                              type="button"
                              onClick={() => onNavigate(`/immigration/${iso.toLowerCase()}`)}
                              className="text-[11px] font-bold text-[#0B3D91] hover:underline cursor-pointer"
                            >
                              Open Hub →
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onRemoveCountry(iso.toLowerCase())}
                            className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {/* Row 1: Verified Published Programs */}
              <tr>
                <td className="p-3 font-bold text-xs text-slate-700">VERIFIED PROGRAMS</td>
                {codes.map((iso) => {
                  const entry = countriesIndex.find((c) => c.iso === iso);
                  const progs = programsIndex.filter((p) => p.countryIso === iso);
                  return (
                    <td key={iso} className="p-3 text-center">
                      {entry?.status === 'ACTIVE' ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {progs.length} Verified Program{progs.length === 1 ? '' : 's'}
                            </span>
                          </span>
                          <div className="text-[11px] text-slate-600">
                            {progs.slice(0, 2).map((p) => p.name).join(' • ')}
                            {progs.length > 2 ? ` (+${progs.length - 2} more)` : ''}
                          </div>
                        </div>
                      ) : entry?.status === 'UNINHABITED_TERRITORY' ? (
                        <span className="inline-flex items-center gap-1 text-slate-600 font-semibold">
                          <Ban className="w-3.5 h-3.5" />
                          Not Applicable
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-800 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          Unknown (Awaiting Verification)
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Verified Categories */}
              <tr className="bg-[#f8fafc]">
                <td className="p-3 font-bold text-xs text-slate-700">VERIFIED CATEGORIES</td>
                {codes.map((iso) => {
                  const entry = countriesIndex.find((c) => c.iso === iso);
                  const cats = entry?.categories || [];
                  return (
                    <td key={iso} className="p-3 text-center">
                      {entry?.status === 'ACTIVE' && cats.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-1">
                          {cats.map((c) => (
                            <span
                              key={c}
                              className="text-[10px] font-bold bg-blue-50 text-[#0B3D91] border border-blue-200 px-2 py-0.5 rounded"
                            >
                              {CATEGORY_DISPLAY_NAMES[c] || c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Not Yet Published</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Official Issuing Authority */}
              <tr>
                <td className="p-3 font-bold text-xs text-slate-700">ISSUING AUTHORITY</td>
                {codes.map((iso) => {
                  const chunk = countryChunks[iso];
                  const primarySrc = chunk?.officialSources?.[0];
                  return (
                    <td key={iso} className="p-3 text-center">
                      {primarySrc ? (
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 text-xs">
                            {primarySrc.officialOrganizationName}
                          </div>
                          <a
                            href={primarySrc.officialHttpsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0B3D91] hover:underline"
                          >
                            <span>Official HTTPS Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          Unknown — Awaiting Official Source
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 4: Official Fees */}
              <tr className="bg-[#f8fafc]">
                <td className="p-3 font-bold text-xs text-slate-700">GOVERNMENT FEES</td>
                {codes.map((iso) => {
                  const entry = countriesIndex.find((c) => c.iso === iso);
                  const primaryUrl = countryChunks[iso]?.officialSources?.[0]?.officialHttpsUrl;
                  return (
                    <td key={iso} className="p-3 text-center text-xs text-slate-600">
                      {entry?.status === 'ACTIVE' && primaryUrl ? (
                        <span>
                          Varies by subclass —{' '}
                          <a
                            href={primaryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#0B3D91] hover:underline"
                          >
                            Verify on Official Portal
                          </a>
                        </span>
                      ) : (
                        <span className="italic text-slate-500">Unknown (Not Yet Verified)</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 5: Processing Times */}
              <tr>
                <td className="p-3 font-bold text-xs text-slate-700">PROCESSING TIME</td>
                {codes.map((iso) => (
                  <td key={iso} className="p-3 text-center text-xs text-slate-600 italic">
                    Unknown — Confirm Live Consular Schedule on Official Portal
                  </td>
                ))}
              </tr>

              {/* Row 6: Approval Rate */}
              <tr className="bg-[#f8fafc]">
                <td className="p-3 font-bold text-xs text-slate-700">APPROVAL RATE</td>
                {codes.map((iso) => (
                  <td key={iso} className="p-3 text-center text-xs text-slate-600 italic">
                    Unknown — Not Uniformly Published by Sovereign Authorities
                  </td>
                ))}
              </tr>

              {/* Row 7: Last Verified Review */}
              <tr>
                <td className="p-3 font-bold text-xs text-slate-700">LAST REVIEWED</td>
                {codes.map((iso) => {
                  const chunk = countryChunks[iso];
                  return (
                    <td key={iso} className="p-3 text-center text-xs font-semibold text-slate-800">
                      {chunk?.country.lastReviewedAt || 'Pending Verification'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
