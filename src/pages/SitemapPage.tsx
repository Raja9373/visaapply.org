import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Search,
  AlertTriangle,
  RefreshCw,
  Shield,
  BookOpen,
  Globe,
  Compass,
} from 'lucide-react';
import {
  isStaticCatalogEnabled,
  staticCatalogClient,
} from '../services/staticCatalogClient';
import type {
  CountryIndexEntry,
  EditorialIndexArticle,
  ProgramIndexEntry,
  StaticRouteOverrideRecord,
  VerificationSummaryIndexPayload,
} from '../types/staticCatalog';

const CORE_PLATFORM_PAGES: ReadonlyArray<{ url: string; label: string; desc: string }> = [
  { url: '/', label: 'VisaApply.org Home', desc: 'Global visa & immigration intelligence entry point' },
  { url: '/immigration', label: 'Global Immigration & Residency Hub', desc: '249-jurisdiction registry with 6 verified category filters' },
  { url: '/routes', label: 'Bilateral Visa Routes Checker', desc: 'Compact rule lookup across 61,752 potential passport corridors' },
  { url: '/blogs', label: 'Verified Editorial Guides', desc: 'Published, officially sourced visa guides (drafts excluded)' },
  { url: '/verification', label: 'Verification & Evidence Registry', desc: 'Live verification ledger distinguishing verified, awaiting, and expired records' },
  { url: '/tools/source-verifier', label: 'Official Source Verifier', desc: 'Direct HTTPS government immigration portals registry' },
  { url: '/tools/visa-comparison', label: 'Verified Visa Comparison Tool', desc: 'Compare verified immigration pathways side by side' },
  { url: '/about', label: 'About & Editorial Standards', desc: 'Independent non-government research methodology' },
  { url: '/contact', label: 'Contact', desc: 'Editorial contact and correction reporting' },
  { url: '/privacy', label: 'Privacy Policy', desc: 'Privacy & data protection terms' },
  { url: '/terms', label: 'Terms of Service', desc: 'Terms of use & non-affiliation notice' },
];

const PUBLIC_CONSULAR_TOOLS: ReadonlyArray<{ url: string; label: string; sub: string }> = [
  { url: '/tools/cost-calculator', label: 'Visa Cost Calculator', sub: 'Estimate visa fees & trip expenses' },
  { url: '/tools/funds-calculator', label: 'Proof of Funds Calculator', sub: 'Plan financial documentation' },
  { url: '/tools/timeline-planner', label: 'Application Timeline Planner', sub: 'Work backwards from target travel dates' },
  { url: '/tools/document-checklist', label: 'Document Checklist Tool', sub: 'Interactive application document checklist' },
  { url: '/tools/stay-calculator', label: 'Schengen 90/180 Stay Calculator', sub: 'Calculate compliant short-stay days' },
  { url: '/tools/readiness-checker', label: 'Visa Readiness Checker', sub: 'Self-assessment before filing' },
  { url: '/tools/eligibility-checker', label: 'Eligibility Checker', sub: 'Structured visa eligibility screening' },
  { url: '/tools/family-planner', label: 'Family Immigration Planner', sub: 'Plan dependant and spouse documentation' },
  { url: '/visa-tracking', label: 'Official Visa Tracking Portals', sub: 'Direct links to CEAC, VFS Global, IRCC, UKVI & ImmiAccount' },
  { url: '/photo-resizer', label: 'Biometric Visa Photo Resizer', sub: 'Client-side 35x45mm & 2x2 inch photo cropper' },
  { url: '/cover-letter-generator', label: 'Cover Letter Generator', sub: 'Draft structured consular cover letters' },
  { url: '/sop-generator', label: 'Student SOP Generator', sub: 'Draft structured Statement of Purpose documents' },
];

export function SitemapPage({ navigate }: { navigate?: (path: string) => void }) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeCountries, setActiveCountries] = useState<CountryIndexEntry[]>([]);
  const [verifiedPrograms, setVerifiedPrograms] = useState<ProgramIndexEntry[]>([]);
  const [publishedArticles, setPublishedArticles] = useState<EditorialIndexArticle[]>([]);
  const [verifiedRoutes, setVerifiedRoutes] = useState<StaticRouteOverrideRecord[]>([]);
  const [summary, setSummary] = useState<VerificationSummaryIndexPayload | null>(null);
  const [legacyFallbackCodes, setLegacyFallbackCodes] = useState<string[] | null>(null);

  const loadSitemapData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setErrorMsg(null);

    // Controlled rollback branch ONLY when `sitemapPage` feature flag is disabled
    if (!isStaticCatalogEnabled('sitemapPage')) {
      try {
        const regMod = await import('../data/countryLightRegistry');
        setLegacyFallbackCodes(Object.keys(regMod.NAME_MAP_249).sort());
        setLoading(false);
        return;
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Unable to load legacy sitemap directory.');
        setLoading(false);
        return;
      }
    }

    setLegacyFallbackCodes(null);

    const [cRes, pRes, eRes, rRes, sRes] = await Promise.all([
      staticCatalogClient.getCountriesIndex({ forceRefresh }),
      staticCatalogClient.getProgramsIndex({ forceRefresh }),
      staticCatalogClient.getEditorialIndex({ forceRefresh }),
      staticCatalogClient.getRoutesIndex({ forceRefresh }),
      staticCatalogClient.getVerificationSummary({ forceRefresh }),
    ]);

    if (cRes.status !== 'ok' || !cRes.data || pRes.status !== 'ok' || !pRes.data) {
      setErrorMsg(cRes.error || pRes.error || 'Unable to load validated static sitemap catalog.');
      setLoading(false);
      return;
    }

    // Strictly include ONLY ACTIVE verified country hubs (exclude 228 quarantined & 7 uninhabited)
    const verifiedHubs = cRes.data.countries
      .filter((c) => c.status === 'ACTIVE' && c.officialSourceCount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    setActiveCountries(verifiedHubs);
    setVerifiedPrograms(pRes.data.programs);
    setPublishedArticles(eRes.status === 'ok' && eRes.data ? eRes.data.articles : []);
    setSummary(sRes.status === 'ok' ? sRes.data : null);

    // Load verified bilateral route overrides listed in compact routes index
    if (rRes.status === 'ok' && rRes.data) {
      const destSlugs = Object.keys(rRes.data.verifiedOverrideChunks || {});
      const overrideChunks = await Promise.all(
        destSlugs.map((slug) => staticCatalogClient.getRouteOverrideChunk(slug, { forceRefresh }))
      );
      const flatOverrides: StaticRouteOverrideRecord[] = [];
      overrideChunks.forEach((res) => {
        if (res.status === 'ok' && res.data) {
          res.data.overrides.forEach((o) => {
            if (o.routePublicationEligible) flatOverrides.push(o);
          });
        }
      });
      setVerifiedRoutes(flatOverrides);
    } else {
      setVerifiedRoutes([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSitemapData(false);
  }, [loadSitemapData]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    if (navigate) {
      e.preventDefault();
      navigate(url);
    }
  };

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeCountries;
    return activeCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        verifiedPrograms.some(
          (p) => p.countryIso === c.iso && p.name.toLowerCase().includes(q)
        )
    );
  }, [activeCountries, verifiedPrograms, search]);

  const totalSubstantiveUrls =
    9 + activeCountries.length + verifiedPrograms.length + verifiedRoutes.length + publishedArticles.length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header & Breadcrumb */}
      <div className="space-y-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <button
            type="button"
            onClick={() => navigate?.('/')}
            className="hover:underline text-[#0B3D91] font-semibold cursor-pointer"
          >
            Home
          </button>
          <span aria-hidden="true">&gt;</span>
          <span className="text-slate-900 font-bold">Valid-Only Static Sitemap Directory</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          VisaApply.org — Verified Public Sitemap Directory
        </h1>
        <p className="text-slate-700 text-sm max-w-3xl leading-relaxed">
          Navigable HTML directory backed by validated static catalog artifacts. Excludes quarantined
          countries awaiting verification, uninhabited territories, draft editorial articles, expired
          statutory schemes, and thin placeholder routes.
        </p>
      </div>

      {/* XML Sitemap Artifact Status Banner */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Candidate Valid-Only XML Sitemap Prepared ({totalSubstantiveUrls} Substantive URLs)</span>
              </span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Candidate valid-only index:{' '}
              <code className="bg-white px-2 py-0.5 rounded border border-emerald-200 font-mono font-bold">
                /sitemaps-static/sitemap-static-index.xml
              </code>{' '}
              (legacy <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-mono">/sitemap-index.xml</code> remains preserved until production cutover).
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <a
              href="/sitemaps-static/sitemap-static-index.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <span>Candidate Static Sitemap XML</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="/sitemap-index.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl transition-colors"
            >
              <span>Legacy /sitemap-index.xml</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl transition-colors"
            >
              <span>/robots.txt</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-white rounded-xl p-3 border border-emerald-200">
              <div className="text-slate-500 font-semibold">Included Active Hubs</div>
              <div className="text-lg font-black text-emerald-900">{activeCountries.length} Countries</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-200">
              <div className="text-slate-500 font-semibold">Included Verified Programs</div>
              <div className="text-lg font-black text-emerald-900">{verifiedPrograms.length} Programs</div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-200">
              <div className="text-slate-500 font-semibold">Excluded Quarantined / Uninhabited</div>
              <div className="text-lg font-black text-amber-800">
                {summary.canonicalMetrics.awaitingOfficialVerificationCountries +
                  summary.canonicalMetrics.uninhabitedTerritories}{' '}
                Jurisdictions
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-emerald-200">
              <div className="text-slate-500 font-semibold">Excluded Drafts &amp; Expired</div>
              <div className="text-lg font-black text-rose-800">
                {summary.canonicalMetrics.excludedDraftEditorialArticles} Drafts •{' '}
                {summary.canonicalMetrics.expiredExcludedPrograms} Expired
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div aria-busy="true" className="space-y-4 animate-pulse">
          <div className="h-32 bg-white rounded-2xl border border-slate-200" />
          <div className="h-64 bg-white rounded-2xl border border-slate-200" />
        </div>
      )}

      {/* Error State */}
      {!loading && errorMsg && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-300 rounded-2xl p-6 text-rose-950 flex items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold">Unable to Load Static Sitemap Catalog</div>
              <p className="text-rose-800 mt-1">{errorMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadSitemapData(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Legacy Rollback View */}
      {!loading && !errorMsg && legacyFallbackCodes !== null && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
          <h2 className="text-lg font-extrabold text-slate-900">
            Legacy Rollback Directory ({legacyFallbackCodes.length} ISO Codes)
          </h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {legacyFallbackCodes.slice(0, 50).map((code) => (
              <a
                key={code}
                href={`/immigration/${code}`}
                onClick={(e) => handleLinkClick(e, `/immigration/${code}`)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-[#0B3D91] rounded font-mono font-bold"
              >
                /immigration/{code}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Static Catalog Valid-Only Directory */}
      {!loading && !errorMsg && legacyFallbackCodes === null && (
        <>
          {/* Section 1: Core Platform Pages */}
          <section className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#0B3D91]" />
              <span>Core Platform Pages ({CORE_PLATFORM_PAGES.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {CORE_PLATFORM_PAGES.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  onClick={(e) => handleLinkClick(e, item.url)}
                  className="p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-xl transition-colors block"
                >
                  <div className="font-extrabold text-[#0B3D91]">{item.label}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{item.desc}</div>
                </a>
              ))}
            </div>
          </section>

          {/* Section 2: Verified Published Editorial Guides & Verified Bilateral Routes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-xs space-y-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <span>Verified Published Editorial Guides ({publishedArticles.length})</span>
              </h2>
              {publishedArticles.length === 0 ? (
                <p className="text-xs text-slate-500">No published editorial guides are currently indexed.</p>
              ) : (
                <ul className="space-y-2.5 text-xs">
                  {publishedArticles.map((article) => (
                    <li
                      key={article.slug}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1"
                    >
                      <a
                        href={`/blogs/${article.slug}`}
                        onClick={(e) => handleLinkClick(e, `/blogs/${article.slug}`)}
                        className="font-extrabold text-[#0B3D91] hover:underline block"
                      >
                        {article.title}
                      </a>
                      <div className="text-[11px] text-slate-600 flex items-center justify-between gap-2">
                        <span>Published {article.publicationDate}</span>
                        <span className="font-mono text-slate-500">/{article.slug}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-xs space-y-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0B3D91]" />
                <span>Verified Bilateral Route Overrides ({verifiedRoutes.length})</span>
              </h2>
              {verifiedRoutes.length === 0 ? (
                <p className="text-xs text-slate-500">No verified bilateral route overrides indexed.</p>
              ) : (
                <ul className="space-y-2.5 text-xs">
                  {verifiedRoutes.map((route) => (
                    <li
                      key={route.routeId}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1"
                    >
                      <a
                        href={`/${route.routeId}`}
                        onClick={(e) => handleLinkClick(e, `/${route.routeId}`)}
                        className="font-extrabold text-[#0B3D91] hover:underline block"
                      >
                        {route.originCountryIso} → {route.destinationCountryIso} Verified Corridor (/{route.routeId})
                      </a>
                      <p className="text-[11px] text-slate-600">{route.verifiedOverrides.scopeNote}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Section 3: Verified Active Country Hubs & Verified Programs */}
          <section className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#0B3D91]" />
                  <span>
                    Verified Active Country Hubs ({activeCountries.length}) &amp; Published Programs ({verifiedPrograms.length})
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every listed country hub and program URL is backed by verified sovereign HTTPS sources.
                </p>
              </div>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 sm:w-80">
                <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter verified hubs or programs..."
                  className="w-full bg-transparent text-xs text-slate-900 outline-none"
                />
              </div>
            </div>

            {filteredCountries.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-600">
                No verified country hub or program matches &ldquo;{search}&rdquo;.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCountries.map((country) => {
                  const progs = verifiedPrograms.filter((p) => p.countryIso === country.iso);
                  return (
                    <div
                      key={country.iso}
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                        <a
                          href={`/immigration/${country.slug}`}
                          onClick={(e) => handleLinkClick(e, `/immigration/${country.slug}`)}
                          className="font-extrabold text-sm text-[#0B3D91] hover:underline flex items-center gap-1.5"
                        >
                          <span>{country.flag}</span>
                          <span>
                            {country.name} ({country.iso})
                          </span>
                        </a>
                        <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                          {progs.length} Verified
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-xs">
                        {progs.map((prog) => {
                          const progHref = `/visa/${country.slug}/${prog.id.toLowerCase()}`;
                          return (
                            <li key={prog.id} className="flex items-center justify-between gap-2">
                              <a
                                href={progHref}
                                onClick={(e) => handleLinkClick(e, progHref)}
                                className="text-slate-800 hover:text-[#0B3D91] hover:underline font-medium"
                              >
                                {prog.name}
                              </a>
                              <span className="text-[10px] uppercase font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 shrink-0">
                                {prog.category}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 4: Public Consular Utilities & Calculators */}
          <section className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-xs space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Public Consular Utilities &amp; Planning Tools ({PUBLIC_CONSULAR_TOOLS.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {PUBLIC_CONSULAR_TOOLS.map((tool) => (
                <a
                  key={tool.url}
                  href={tool.url}
                  onClick={(e) => handleLinkClick(e, tool.url)}
                  className="p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-xl transition-colors block"
                >
                  <div className="font-extrabold text-[#0B3D91]">{tool.label}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{tool.sub}</div>
                </a>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
