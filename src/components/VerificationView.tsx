import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  Shield,
  Globe,
  ChevronRight,
  Clock,
  AlertTriangle,
  Ban,
  ExternalLink,
  RefreshCw,
  Search,
  FileCheck,
} from 'lucide-react';
import {
  CANONICAL_COVERAGE_SLOTS_COUNT,
  isStaticCatalogEnabled,
  staticCatalogClient,
} from '../services/staticCatalogClient';
import type {
  ChangelogIndexPayload,
  CountriesIndexPayload,
  OfficialSourcesIndexPayload,
  ProgramsIndexPayload,
  VerificationSummaryIndexPayload,
} from '../types/staticCatalog';

interface Props {
  navigate: (path: string) => void;
}

type StatusFilter = 'ALL' | 'ACTIVE' | 'QUARANTINED' | 'UNINHABITED_TERRITORY';

export function VerificationView({ navigate }: Props) {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [summary, setSummary] = useState<VerificationSummaryIndexPayload | null>(null);
  const [countriesData, setCountriesData] = useState<CountriesIndexPayload | null>(null);
  const [sourcesData, setSourcesData] = useState<OfficialSourcesIndexPayload | null>(null);
  const [programsData, setProgramsData] = useState<ProgramsIndexPayload | null>(null);
  const [changelogData, setChangelogData] = useState<ChangelogIndexPayload | null>(null);
  const [legacyTotalVisas, setLegacyTotalVisas] = useState<number | null>(null);

  const loadVerificationData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setErrorMsg(null);

    // Controlled rollback branch ONLY when feature flag is explicitly disabled
    if (!isStaticCatalogEnabled('verificationView')) {
      try {
        const dbMod = await import('../data/fullVisaDatabase');
        const report = dbMod.verifyNoVisaMissed();
        setLegacyTotalVisas(report.totalVisas || 0);
        setLoading(false);
        return;
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Unable to load legacy verification view.');
        setLoading(false);
        return;
      }
    }

    setLegacyTotalVisas(null);

    const [sumRes, cRes, sRes, pRes, chRes] = await Promise.all([
      staticCatalogClient.getVerificationSummary({ forceRefresh }),
      staticCatalogClient.getCountriesIndex({ forceRefresh }),
      staticCatalogClient.getOfficialSourcesIndex({ forceRefresh }),
      staticCatalogClient.getProgramsIndex({ forceRefresh }),
      staticCatalogClient.getChangelogIndex({ forceRefresh }),
    ]);

    if (cRes.status !== 'ok' || !cRes.data || pRes.status !== 'ok' || !pRes.data) {
      setErrorMsg(
        cRes.error || pRes.error || 'Unable to load static catalog verification records.'
      );
      setLoading(false);
      return;
    }

    setSummary(sumRes.status === 'ok' ? sumRes.data : null);
    setCountriesData(cRes.data);
    setSourcesData(sRes.status === 'ok' ? sRes.data : null);
    setProgramsData(pRes.data);
    setChangelogData(chRes.status === 'ok' ? chRes.data : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadVerificationData(false);
  }, [loadVerificationData]);

  const metrics = useMemo(() => {
    const countries = countriesData?.countries || [];
    const verifiedActiveCountries =
      summary?.canonicalMetrics.verifiedActiveCountries ??
      countries.filter((c) => c.status === 'ACTIVE').length;
    const awaitingCount =
      summary?.canonicalMetrics.awaitingOfficialVerificationCountries ??
      countries.filter((c) => c.status === 'QUARANTINED').length;
    const uninhabitedCount =
      summary?.canonicalMetrics.uninhabitedTerritories ??
      countries.filter((c) => c.status === 'UNINHABITED_TERRITORY').length;
    const officialSourcesTotal =
      summary?.canonicalMetrics.verifiedOfficialHttpsSources ??
      Object.values(sourcesData?.sourcesByCountry || {}).reduce((acc, list) => acc + list.length, 0);

    return {
      isoCountriesRegistry: summary?.canonicalMetrics.isoCountriesRegistry ?? countries.length,
      potentialBilateralRoutes: summary?.canonicalMetrics.potentialBilateralRoutes ?? 249 * 248,
      trackedCoverageSlots:
        summary?.canonicalMetrics.trackedCoverageSlots ?? CANONICAL_COVERAGE_SLOTS_COUNT,
      verifiedActiveCountries,
      awaitingOfficialVerificationCountries: awaitingCount,
      uninhabitedTerritories: uninhabitedCount,
      verifiedAvailablePrograms:
        summary?.canonicalMetrics.verifiedAvailablePrograms ?? programsData?.totalPrograms ?? 0,
      expiredExcludedPrograms: summary?.canonicalMetrics.expiredExcludedPrograms ?? 0,
      verifiedOfficialHttpsSources: officialSourcesTotal,
      verifiedChangelogEntries:
        summary?.canonicalMetrics.verifiedChangelogEntries ?? changelogData?.totalEntries ?? 0,
    };
  }, [summary, countriesData, sourcesData, programsData, changelogData]);

  const filteredCountries = useMemo(() => {
    const list = countriesData?.countries || [];
    const q = searchQuery.trim().toLowerCase();
    return list
      .filter((c) => {
        if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.iso.toLowerCase().includes(q) ||
          c.continent.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const order: Record<string, number> = {
          ACTIVE: 0,
          QUARANTINED: 1,
          UNINHABITED_TERRITORY: 2,
        };
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        return a.name.localeCompare(b.name);
      });
  }, [countriesData, statusFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="hover:underline text-[#0B3D91] font-semibold cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">Official Verification &amp; Evidence Registry</span>
      </nav>

      {/* Hero Overview */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-200">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full text-xs font-extrabold">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>Evidence-Based Static Catalog Verification Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Consular Verification Status &amp; Official Evidence Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Every country, immigration program, and official HTTPS government source is classified
              strictly by its verification evidence. Unverified countries remain quarantined until
              audited against primary sovereign HTTPS sources, and revoked or expired programs are
              explicitly excluded from active recommendations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/tools/source-verifier')}
            className="px-4 py-2.5 bg-[#0B3D91] hover:bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors"
          >
            Inspect Official Source Verifier →
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div aria-busy="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl border border-slate-200" />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && errorMsg && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-300 rounded-xl p-5 text-rose-950 flex items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold">Unable to Load Verification Ledger</div>
                <p className="text-rose-800 mt-0.5">{errorMsg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadVerificationData(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Legacy Rollback View */}
        {!loading && !errorMsg && legacyTotalVisas !== null && (
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
            <div className="font-extrabold">Legacy Rollback Mode Active</div>
            <p>
              Static catalog verification is currently disabled by feature flag. Legacy registry reports{' '}
              <strong>{legacyTotalVisas}</strong> unverified local entries.
            </p>
          </div>
        )}

        {/* Four Strictly Separate Canonical Metrics */}
        {!loading && !errorMsg && legacyTotalVisas === null && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">
                  1. ISO Country Registry
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {metrics.isoCountriesRegistry} Countries &amp; Territories
                </span>
                <span className="text-[11px] text-slate-600 mt-1 block">
                  Full ISO 3166-1 alpha-2 directory scope
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">
                  2. Potential Bilateral Routes
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {metrics.potentialBilateralRoutes.toLocaleString()} Pairs
                </span>
                <span className="text-[11px] text-slate-600 mt-1 block">
                  249 × 248 origin-destination pairs (compact rule engine)
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">
                  3. Tracked Hub Slots
                </span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {metrics.trackedCoverageSlots.toLocaleString()} Slots
                </span>
                <span className="text-[11px] text-slate-600 mt-1 block">
                  249 jurisdictions × 7 hub categories (not verified count)
                </span>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl">
                <span className="text-[11px] font-bold uppercase text-emerald-800 block">
                  4. Verified Available Programs
                </span>
                <span className="text-2xl font-black text-emerald-950 mt-1 block">
                  {metrics.verifiedAvailablePrograms} Verified Programs
                </span>
                <span className="text-[11px] text-emerald-800 mt-1 block">
                  Across {metrics.verifiedActiveCountries} active hubs &amp; {metrics.verifiedOfficialHttpsSources} HTTPS sources
                </span>
              </div>
            </div>

            {/* Distinct Verification Status Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-extrabold text-emerald-950">
                    Verified ({metrics.verifiedActiveCountries} Hubs / {metrics.verifiedAvailablePrograms} Programs)
                  </div>
                  <div className="text-emerald-800">Backed by live official HTTPS portals</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <div className="font-extrabold text-amber-950">
                    Awaiting Verification / Quarantined ({metrics.awaitingOfficialVerificationCountries})
                  </div>
                  <div className="text-amber-800">Excluded from indexable sitemaps until audited</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0" />
                <div>
                  <div className="font-extrabold text-rose-950">
                    Expired / Revoked ({metrics.expiredExcludedPrograms} Program)
                  </div>
                  <div className="text-rose-800">Discontinued statutory schemes excluded publicly</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-300 flex items-center gap-3">
                <Ban className="w-5 h-5 text-slate-700 shrink-0" />
                <div>
                  <div className="font-extrabold text-slate-900">
                    Uninhabited Territories ({metrics.uninhabitedTerritories})
                  </div>
                  <div className="text-slate-600">Standard immigration pathways not applicable</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Expired / Revoked Statutory Programs Notice */}
      {!loading && !errorMsg && summary && summary.expiredProgramNotices.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-rose-200 p-6 space-y-3">
          <h2 className="text-lg font-extrabold text-rose-950 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-700" />
            <span>Expired / Revoked Programs Explicitly Excluded ({summary.expiredProgramNotices.length})</span>
          </h2>
          <div className="space-y-2.5">
            {summary.expiredProgramNotices.map((notice, idx) => (
              <div
                key={`${notice.countryIso}-${idx}`}
                className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-1"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold bg-rose-200 text-rose-950 px-2 py-0.5 rounded">
                    {notice.countryIso}
                  </span>
                  <span className="font-extrabold text-rose-900 uppercase">{notice.status}</span>
                  <span className="text-rose-700">Quarantined: {notice.quarantinedDate}</span>
                </div>
                <p className="text-rose-950 leading-relaxed">{notice.reasonSummary}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Verified Policy Changelog with Evidence Links */}
      {!loading && !errorMsg && changelogData && changelogData.entries.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#0B3D91]" />
              <span>Verified Evidence Changelog ({changelogData.totalEntries})</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              15 UI Languages Supported • Legal clauses verified in English
            </span>
          </div>
          <div className="space-y-3">
            {changelogData.entries.map((entry) => (
              <div
                key={entry.changeId}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-blue-100 text-[#0B3D91] px-2 py-0.5 rounded">
                      {entry.affectedCountryIso}
                    </span>
                    <span className="font-extrabold text-slate-900">{entry.title}</span>
                  </div>
                  <span className="text-slate-500 font-semibold">{entry.changeDate}</span>
                </div>
                <p className="text-slate-700">
                  <strong>Update:</strong> {entry.newValue}
                </p>
                <a
                  href={entry.sourceReference.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#0B3D91] font-bold hover:underline break-all"
                >
                  <span>Supporting Official Source</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filterable Country-by-Country Verification Ledger */}
      {!loading && !errorMsg && countriesData && (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#0B3D91]" />
                <span>249-Jurisdiction Verification Status Table</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredCountries.length} of {countriesData.totalCountries} ISO jurisdictions
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: 'ALL', label: `All (${countriesData.totalCountries})` },
                  { id: 'ACTIVE', label: `Verified (${metrics.verifiedActiveCountries})` },
                  { id: 'QUARANTINED', label: `Awaiting (${metrics.awaitingOfficialVerificationCountries})` },
                  { id: 'UNINHABITED_TERRITORY', label: `Uninhabited (${metrics.uninhabitedTerritories})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-[#0B3D91] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by country name, ISO code (e.g. US, CA, DE, PT), or continent..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 outline-none"
            />
          </div>

          {filteredCountries.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-600 bg-slate-50 rounded-xl border border-slate-200">
              No jurisdictions match your current filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Jurisdiction</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Verified Programs</th>
                    <th className="p-3 text-center">Verified HTTPS Sources</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCountries.slice(0, 60).map((row) => {
                    const countrySources = sourcesData?.sourcesByCountry[row.iso] || [];
                    return (
                      <tr key={row.iso} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">
                          <span className="mr-1.5">{row.flag}</span>
                          <span>{row.name}</span>{' '}
                          <span className="font-mono text-[10px] text-slate-500">({row.iso})</span>
                        </td>
                        <td className="p-3">
                          {row.status === 'ACTIVE' ? (
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              VERIFIED ACTIVE
                            </span>
                          ) : row.status === 'UNINHABITED_TERRITORY' ? (
                            <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              UNINHABITED
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              AWAITING VERIFICATION
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-800">
                          {row.status === 'ACTIVE'
                            ? row.verifiedProgramCount
                            : row.status === 'UNINHABITED_TERRITORY'
                              ? 'N/A'
                              : 'Pending'}
                        </td>
                        <td className="p-3 text-center">
                          {countrySources.length > 0 ? (
                            <a
                              href={countrySources[0].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#0B3D91] font-bold hover:underline"
                            >
                              <span>{countrySources.length} Official HTTPS</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">None Yet</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => navigate(`/immigration/${row.slug}`)}
                            className="text-[#0B3D91] font-bold hover:underline cursor-pointer"
                          >
                            Inspect Hub →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredCountries.length > 60 && (
                <p className="text-[11px] text-slate-500 mt-3 text-center">
                  Showing first 60 matching jurisdictions of {filteredCountries.length}. Use search or status filters above to narrow results.
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
