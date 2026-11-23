import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Layers,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type { SupportedLangCode } from '../../i18n/config';
import {
  isStaticCatalogEnabled,
  staticCatalogClient,
} from '../../services/staticCatalogClient';
import type {
  CountryChunkPayload,
  CountriesIndexPayload,
  ProgramIndexEntry,
  ProgramsIndexPayload,
  StaticProgramRecord,
} from '../../types/staticCatalog';

interface VisaComparisonPageProps {
  onNavigate: (path: string) => void;
  uiLang?: SupportedLangCode;
}

export const VisaComparisonPage: React.FC<VisaComparisonPageProps> = ({ onNavigate }) => {
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([
    'us-h1b-specialty',
    'ca-express-entry',
    'de-eu-blue-card',
  ]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [programsIndex, setProgramsIndex] = useState<ProgramsIndexPayload | null>(null);
  const [countriesIndex, setCountriesIndex] = useState<CountriesIndexPayload | null>(null);
  const [countryChunks, setCountryChunks] = useState<Record<string, CountryChunkPayload>>({});

  const loadComparisonCatalog = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setErrorMsg(null);

    if (!isStaticCatalogEnabled('visaComparison')) {
      try {
        const hubMod = await import('../../data/globalImmigrationHubData');
        const verified = hubMod.VERIFIED_IMMIGRATION_PROGRAMS.filter(
          (p) => p.verificationStatus === 'AVAILABLE_VERIFIED'
        );
        setProgramsIndex({
          schemaVersion: 'legacy-rollback',
          totalPrograms: verified.length,
          legalContentLanguage: 'en',
          programs: verified.map((p) => ({
            id: p.id,
            countryIso: p.countryCode.toUpperCase(),
            name: p.officialName,
            localName: p.localLanguageName || null,
            category: p.category,
            type: p.classificationType,
            status: p.verificationStatus,
            lastVerifiedDate: p.lastCheckedDate,
            officialUrl: p.officialInformationUrl,
            detailChunkPath: null,
          })),
        });
        setLoading(false);
        return;
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to load legacy comparison data.');
        setLoading(false);
        return;
      }
    }

    const [pRes, cRes] = await Promise.all([
      staticCatalogClient.getProgramsIndex({ forceRefresh }),
      staticCatalogClient.getCountriesIndex({ forceRefresh }),
    ]);

    if (pRes.status === 'ok' && pRes.data) {
      setProgramsIndex(pRes.data);
      if (cRes.status === 'ok' && cRes.data) setCountriesIndex(cRes.data);
      setLoading(false);
    } else {
      setErrorMsg(pRes.error || 'Unable to load verified programs for comparison.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadComparisonCatalog(false);
  }, [loadComparisonCatalog]);

  // Lazy-load ONLY the country chunks for the currently selected programs (up to 4)
  useEffect(() => {
    if (!programsIndex || !isStaticCatalogEnabled('visaComparison')) return;
    const neededIsos = Array.from(
      new Set(
        selectedProgramIds
          .map((id) => programsIndex.programs.find((p) => p.id === id)?.countryIso.toUpperCase())
          .filter((iso): iso is string => Boolean(iso))
      )
    );
    let active = true;
    Promise.all(
      neededIsos.map(async (iso) => {
        if (countryChunks[iso]) return [iso, countryChunks[iso]] as const;
        const res = await staticCatalogClient.getCountryChunk(iso);
        return res.status === 'ok' && res.data ? ([iso, res.data] as const) : null;
      })
    ).then((results) => {
      if (!active) return;
      const next: Record<string, CountryChunkPayload> = {};
      results.forEach((entry) => {
        if (entry) next[entry[0]] = entry[1];
      });
      if (Object.keys(next).length > 0) {
        setCountryChunks((prev) => ({ ...prev, ...next }));
      }
    });
    return () => {
      active = false;
    };
  }, [selectedProgramIds, programsIndex]);

  const availablePrograms = useMemo(() => {
    const list = programsIndex?.programs || [];
    if (categoryFilter === 'ALL') return list;
    return list.filter((p) => p.category === categoryFilter);
  }, [programsIndex, categoryFilter]);

  const selectedEntries = useMemo(() => {
    const countryMap = new Map(
      (countriesIndex?.countries || []).map((c) => [c.iso.toUpperCase(), c])
    );
    return selectedProgramIds
      .map((id) => programsIndex?.programs.find((p) => p.id === id))
      .filter((p): p is ProgramIndexEntry => Boolean(p))
      .map((indexProg) => {
        const iso = indexProg.countryIso.toUpperCase();
        const chunk = countryChunks[iso];
        const richProg: StaticProgramRecord | undefined = chunk?.programs.find(
          (cp) => cp.programId === indexProg.id
        );
        const country = countryMap.get(iso);
        return {
          indexProg,
          richProg,
          countryName: country?.name || iso,
          countryFlag: country?.flag || '🌍',
          officialSourcesCount: chunk?.officialSources.length ?? country?.officialSourceCount ?? 0,
        };
      });
  }, [selectedProgramIds, programsIndex, countriesIndex, countryChunks]);

  const toggleProgram = (id: string) => {
    setSelectedProgramIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((item) => item !== id) : prev;
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-[#0B3D91] text-white py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-xs sm:text-sm font-medium mb-3 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to VisaApply.org Home
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <Layers className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Verified Immigration Program Comparison
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Compare up to 4 verified immigration programs side-by-side directly from the zero-database static catalog.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-sm text-right shrink-0">
            <span className="text-xs text-blue-200 font-semibold block uppercase tracking-wider">
              Verified Catalog Pool
            </span>
            <span className="text-2xl font-black text-white">
              {programsIndex?.totalPrograms ?? 28} Programs
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#0B3D91] shrink-0 mt-0.5" />
          <div>
            <strong>Zero-Fabrication Comparison Policy:</strong> Only verified published programs are selectable. Where structured fee or processing-time detail chunks are not yet published, this table states &ldquo;Confirm on Official Portal&rdquo; rather than inventing estimates.
          </div>
        </div>

        {/* Error State */}
        {errorMsg && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-300 rounded-2xl p-5 text-rose-950 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2.5 text-xs font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => void loadComparisonCatalog(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !errorMsg && (
          <div className="space-y-4 animate-pulse" aria-busy="true">
            <div className="h-28 bg-white rounded-2xl border border-slate-200" />
            <div className="h-72 bg-white rounded-2xl border border-slate-200" />
          </div>
        )}

        {/* Program Selector */}
        {!loading && !errorMsg && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Select Up to 4 Verified Programs ({selectedProgramIds.length}/4 Selected):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['ALL', 'pr', 'work', 'citizenship', 'family', 'business', 'digital_nomad', 'tourist'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase cursor-pointer border ${
                          categoryFilter === cat
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {cat.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {availablePrograms.map((p) => {
                  const active = selectedProgramIds.includes(p.id);
                  const country = countriesIndex?.countries.find((c) => c.iso === p.countryIso);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProgram(p.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-left ${
                        active
                          ? 'bg-[#0B3D91] text-white border-[#0B3D91] shadow-sm'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {country?.flag || '🌍'} {p.countryIso}: {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-4 w-52">Comparison Dimension</th>
                      {selectedEntries.map(({ indexProg, countryFlag, countryName }) => (
                        <th key={indexProg.id} className="p-4 min-w-[230px]">
                          <div className="flex items-start gap-2">
                            <span className="text-xl">{countryFlag}</span>
                            <div>
                              <span className="block font-black">{indexProg.name}</span>
                              <span className="text-[11px] text-blue-300 font-normal">
                                {countryName} ({indexProg.countryIso})
                              </span>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-4 font-extrabold text-slate-950 bg-slate-50/70">Verification Status</td>
                      {selectedEntries.map(({ indexProg }) => (
                        <td key={indexProg.id} className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{indexProg.status}</span>
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-extrabold text-slate-950 bg-slate-50/70">Immigration Category</td>
                      {selectedEntries.map(({ indexProg }) => (
                        <td key={indexProg.id} className="p-4 uppercase font-bold text-[#0B3D91]">
                          {indexProg.category.replace('_', ' ')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-extrabold text-slate-950 bg-slate-50/70">Program Classification</td>
                      {selectedEntries.map(({ indexProg }) => (
                        <td key={indexProg.id} className="p-4 text-slate-700 font-medium">
                          {indexProg.type}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-extrabold text-slate-950 bg-slate-50/70">Eligibility Summary</td>
                      {selectedEntries.map(({ indexProg, richProg }) => (
                        <td key={indexProg.id} className="p-4 text-slate-700 text-xs leading-relaxed">
                          {richProg?.eligibilitySummary || 'Loading verified eligibility summary...'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-extrabold text-slate-950 bg-slate-50/70">Statutory Legal Basis</td>
                      {selectedEntries.map(({ indexProg, richProg }) => (
                        <td key={indexProg.id} className="p-4 text-slate-600 font-mono text-[11px]">
                          {richProg?.legalBasis || 'Confirm on official portal'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-extrabold text-slate-950 bg-slate-50/70">Application Location</td>
                      {selectedEntries.map(({ indexProg, richProg }) => (
                        <td key={indexProg.id} className="p-4 text-slate-800 font-semibold">
                          {richProg?.applyFrom || 'Confirm on official portal'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-extrabold text-slate-950 bg-slate-50/70">Structured 30-Section Detail</td>
                      {selectedEntries.map(({ indexProg }) => (
                        <td key={indexProg.id} className="p-4">
                          {indexProg.detailChunkPath ? (
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-bold">
                              Published (Static Chunk)
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                              Not Yet Available — Check Portal
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-extrabold text-slate-950 bg-slate-50/70">Last Verified Date</td>
                      {selectedEntries.map(({ indexProg }) => (
                        <td key={indexProg.id} className="p-4 text-slate-700 font-semibold">
                          {indexProg.lastVerifiedDate}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-extrabold text-slate-950 bg-slate-50/70">Official Sovereign Portal</td>
                      {selectedEntries.map(({ indexProg }) => (
                        <td key={indexProg.id} className="p-4 space-y-2">
                          <a
                            href={indexProg.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3D91] hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            <span>Open Official Source</span>
                          </a>
                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                onNavigate(`/immigration/${indexProg.countryIso.toLowerCase()}`)
                              }
                              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                            >
                              View Country Hub →
                            </button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default VisaComparisonPage;
