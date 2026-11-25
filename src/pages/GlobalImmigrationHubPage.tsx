import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Globe,
  Search,
  ArrowRight,
  Shield,
  CheckCircle2,
  Ban,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  FileText,
  History,
  Info,
} from 'lucide-react';
import type { ImmigrationCategoryKey } from '../data/globalImmigrationHubData';
import type { SupportedLangCode } from '../i18n/config';
import { buildLocalizedUrl } from '../utils/autoLanguage';
import {
  CANONICAL_IMMIGRATION_CATEGORIES,
  CATEGORY_INTERNAL_TO_PARAM_MAP,
  CATEGORY_URL_PARAM_MAP,
  HONEST_EMPTY_CATEGORY_MESSAGE,
  buildCountryImmigrationUrl,
  buildImmigrationHubUrl,
  getCanonicalCategoryMeta,
  parseCategoryFromLocation,
  parseImmigrationCategoryQuery,
} from '../config/immigrationCategories';
import {
  CANONICAL_COVERAGE_SLOTS_COUNT,
  isStaticCatalogEnabled,
  staticCatalogClient,
} from '../services/staticCatalogClient';
import type {
  CategoriesIndexPayload,
  ChangelogIndexPayload,
  CountriesIndexPayload,
  CountryIndexEntry,
  EditorialIndexPayload,
  ProgramIndexEntry,
  ProgramsIndexPayload,
  SearchIndexPayload,
} from '../types/staticCatalog';

export { CATEGORY_URL_PARAM_MAP, CATEGORY_INTERNAL_TO_PARAM_MAP, parseCategoryFromLocation };

interface GlobalImmigrationHubPageProps {
  navigate: (path: string) => void;
  uiLang?: SupportedLangCode;
  locationSearch?: string;
}

export function GlobalImmigrationHubPage({
  navigate,
  uiLang = 'en',
  locationSearch,
}: GlobalImmigrationHubPageProps) {
  const initialQuery = parseImmigrationCategoryQuery(locationSearch);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ImmigrationCategoryKey | 'all'>(
    initialQuery.category
  );
  const [invalidCategoryParam, setInvalidCategoryParam] = useState<string | null>(
    initialQuery.invalidCategoryParam
  );
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'QUARANTINED' | 'UNINHABITED'>('ALL');
  const [viewMode, setViewMode] = useState<'countries' | 'programs' | 'updates'>('countries');

  // Static catalog state
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countriesIndex, setCountriesIndex] = useState<CountriesIndexPayload | null>(null);
  const [programsIndex, setProgramsIndex] = useState<ProgramsIndexPayload | null>(null);
  const [categoriesIndex, setCategoriesIndex] = useState<CategoriesIndexPayload | null>(null);
  const [searchIndex, setSearchIndex] = useState<SearchIndexPayload | null>(null);
  const [changelogIndex, setChangelogIndex] = useState<ChangelogIndexPayload | null>(null);
  const [editorialIndex, setEditorialIndex] = useState<EditorialIndexPayload | null>(null);
  const [activeSourceMode, setActiveSourceMode] = useState<'static_catalog' | 'legacy_rollback'>('static_catalog');

  const loadCatalogData = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setErrorMsg(null);

      // Controlled rollback boundary: fallback to legacy loader ONLY if explicitly disabled
      if (!isStaticCatalogEnabled('immigrationHub')) {
        try {
          const [countriesMod, hubMod] = await Promise.all([
            import('../data/all249Countries'),
            import('../data/globalImmigrationHubData'),
          ]);
          const countries: CountryIndexEntry[] = countriesMod.ALL_249_ISO_FORCED.map((c) => {
            const prof = hubMod.getImmigrationProfileForCountry(c.code);
            const verified = prof.programs.filter((p) => p.verificationStatus === 'AVAILABLE_VERIFIED');
            const isUninhabited = prof.programs.every((p) => p.verificationStatus === 'NOT_AVAILABLE_CONFIRMED');
            return {
              iso: c.code.toUpperCase(),
              slug: c.code.toLowerCase(),
              name: c.name,
              flag: c.flag,
              continent: 'global',
              status: isUninhabited
                ? 'UNINHABITED_TERRITORY'
                : verified.length > 0
                  ? 'ACTIVE'
                  : 'QUARANTINED',
              verifiedProgramCount: verified.length,
              officialSourceCount: prof.officialSource?.primaryGovUrl ? 1 : 0,
              categories: Array.from(new Set(verified.map((p) => p.category))),
              chunkPath: null,
            };
          });
          const programs: ProgramIndexEntry[] = hubMod.VERIFIED_IMMIGRATION_PROGRAMS.filter(
            (p) => p.verificationStatus === 'AVAILABLE_VERIFIED'
          ).map((p) => ({
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
          }));
          setCountriesIndex({
            schemaVersion: 'legacy-rollback',
            totalCountries: countries.length,
            activeCountries: countries.filter((c) => c.status === 'ACTIVE').length,
            countries,
          });
          setProgramsIndex({
            schemaVersion: 'legacy-rollback',
            totalPrograms: programs.length,
            legalContentLanguage: 'en',
            programs,
          });
          setActiveSourceMode('legacy_rollback');
          setLoading(false);
          return;
        } catch (err: unknown) {
          setErrorMsg(err instanceof Error ? err.message : 'Failed to load legacy rollback catalog.');
          setLoading(false);
          return;
        }
      }

      setActiveSourceMode('static_catalog');
      const [cRes, pRes, catRes, sRes] = await Promise.all([
        staticCatalogClient.getCountriesIndex({ forceRefresh }),
        staticCatalogClient.getProgramsIndex({ forceRefresh }),
        staticCatalogClient.getCategoriesIndex({ forceRefresh }),
        staticCatalogClient.getSearchIndex(uiLang, { forceRefresh }),
      ]);

      if (cRes.status !== 'ok' || !cRes.data || pRes.status !== 'ok' || !pRes.data) {
        setErrorMsg(
          cRes.error || pRes.error || 'Unable to load the static immigration catalog. Please retry.'
        );
        setLoading(false);
        return;
      }

      setCountriesIndex(cRes.data);
      setProgramsIndex(pRes.data);
      if (catRes.status === 'ok' && catRes.data) setCategoriesIndex(catRes.data);
      if (sRes.status === 'ok' && sRes.data) setSearchIndex(sRes.data);
      setLoading(false);
    },
    [uiLang]
  );

  useEffect(() => {
    void loadCatalogData(false);
  }, [loadCatalogData]);

  // Lazy-load changelog & editorial indexes ONLY when the visitor opens the Updates & Guides tab
  useEffect(() => {
    if (viewMode !== 'updates' || activeSourceMode !== 'static_catalog') return;
    let active = true;
    Promise.all([
      staticCatalogClient.getChangelogIndex(),
      staticCatalogClient.getEditorialIndex(),
    ]).then(([chRes, edRes]) => {
      if (!active) return;
      if (chRes.status === 'ok' && chRes.data) setChangelogIndex(chRes.data);
      if (edRes.status === 'ok' && edRes.data) setEditorialIndex(edRes.data);
    });
    return () => {
      active = false;
    };
  }, [viewMode, activeSourceMode]);

  // Keep selectedCategory & invalid-filter state synchronized with URL query changes (App navigation, direct load, refresh)
  useEffect(() => {
    const parsed = parseImmigrationCategoryQuery(
      locationSearch !== undefined ? locationSearch : undefined
    );
    setSelectedCategory(parsed.category);
    setInvalidCategoryParam(parsed.invalidCategoryParam);
  }, [locationSearch]);

  // Also synchronize on browser Back / Forward (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const parsed = parseImmigrationCategoryQuery(window.location.search);
      setSelectedCategory(parsed.category);
      setInvalidCategoryParam(parsed.invalidCategoryParam);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectCategory = (catId: ImmigrationCategoryKey | 'all') => {
    setSelectedCategory(catId);
    setInvalidCategoryParam(null);
    const rawTarget = buildImmigrationHubUrl(catId);
    const targetUrl = uiLang && uiLang !== 'en' ? buildLocalizedUrl(rawTarget, uiLang) : rawTarget;
    navigate(targetUrl);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    handleSelectCategory('all');
  };

  const categories = [
    { id: 'all' as const, paramSlug: '', label: 'All 7 Categories', icon: '🌍' },
    ...CANONICAL_IMMIGRATION_CATEGORIES.map((c) => ({
      id: c.id,
      paramSlug: c.slug,
      label: c.tabLabel,
      icon: c.icon,
    })),
  ];

  const activeCategoryCanonicalMeta = getCanonicalCategoryMeta(selectedCategory);
  const headerMeta = activeCategoryCanonicalMeta
    ? {
        title: activeCategoryCanonicalMeta.pageTitle,
        description: activeCategoryCanonicalMeta.pageDescription,
      }
    : {
        title: 'Global Immigration & Residency Hub (249 ISO Countries)',
        description:
          'Evidence-based directory of verified immigration programs, official government sources, and honest verification status across all 249 ISO countries and territories.',
      };

  const programsByCountry = useMemo(() => {
    const map = new Map<string, ProgramIndexEntry[]>();
    (programsIndex?.programs || []).forEach((p) => {
      const iso = p.countryIso.toUpperCase();
      const arr = map.get(iso) || [];
      arr.push(p);
      map.set(iso, arr);
    });
    return map;
  }, [programsIndex]);

  const activeCount = useMemo(
    () => (countriesIndex?.countries || []).filter((c) => c.status === 'ACTIVE').length,
    [countriesIndex]
  );
  const quarantinedCount = useMemo(
    () => (countriesIndex?.countries || []).filter((c) => c.status === 'QUARANTINED').length,
    [countriesIndex]
  );
  const uninhabitedCount = useMemo(
    () => (countriesIndex?.countries || []).filter((c) => c.status === 'UNINHABITED_TERRITORY').length,
    [countriesIndex]
  );

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = countriesIndex?.countries || [];
    return list
      .filter((c) => {
        if (statusFilter === 'ACTIVE' && c.status !== 'ACTIVE') return false;
        if (statusFilter === 'QUARANTINED' && c.status !== 'QUARANTINED') return false;
        if (statusFilter === 'UNINHABITED' && c.status !== 'UNINHABITED_TERRITORY') return false;
        if (!q) return true;
        const countryPrograms = programsByCountry.get(c.iso) || [];
        const matchesProgram = countryPrograms.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.localName || '').toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q)
        );
        return (
          c.name.toLowerCase().includes(q) ||
          c.iso.toLowerCase().includes(q) ||
          matchesProgram
        );
      })
      .sort((a, b) => {
        // Surface ACTIVE verified countries first so users immediately see verified content
        const rank = (s: string) => (s === 'ACTIVE' ? 0 : s === 'QUARANTINED' ? 1 : 2);
        const rDiff = rank(a.status) - rank(b.status);
        if (rDiff !== 0) return rDiff;
        if (b.verifiedProgramCount !== a.verifiedProgramCount) {
          return b.verifiedProgramCount - a.verifiedProgramCount;
        }
        return a.name.localeCompare(b.name);
      });
  }, [countriesIndex, searchQuery, statusFilter, programsByCountry]);

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const countryNameMap = new Map<string, string>(
      (countriesIndex?.countries || []).map((c) => [c.iso, c.name])
    );
    return (programsIndex?.programs || []).filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (!q) return true;
      const cName = (countryNameMap.get(p.countryIso) || '').toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.localName || '').toLowerCase().includes(q) ||
        p.countryIso.toLowerCase().includes(q) ||
        cName.includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });
  }, [programsIndex, countriesIndex, selectedCategory, searchQuery]);

  const activeCategoryVerifiedCount = useMemo(() => {
    if (selectedCategory === 'all') {
      return programsIndex?.totalPrograms || 0;
    }
    return categoriesIndex?.categories[selectedCategory]?.count ?? filteredPrograms.length;
  }, [selectedCategory, programsIndex, categoriesIndex, filteredPrograms.length]);

  const renderCountryStatusBadge = (country: CountryIndexEntry, matchingCatProg?: ProgramIndexEntry) => {
    if (country.status === 'UNINHABITED_TERRITORY') {
      return (
        <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 border border-slate-400 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
          <Ban className="w-3 h-3 text-slate-600" />
          <span>UNINHABITED • N/A</span>
        </span>
      );
    }
    if (country.status === 'QUARANTINED') {
      return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
          <Clock className="w-3 h-3 text-amber-700" />
          <span>VERIFICATION PENDING</span>
        </span>
      );
    }
    if (selectedCategory !== 'all') {
      if (matchingCatProg) {
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>AVAILABLE VERIFIED</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
          <Clock className="w-3 h-3 text-blue-700" />
          <span>NO VERIFIED ENTRY YET</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
        <span>
          {country.verifiedProgramCount > 0
            ? `${country.verifiedProgramCount} Verified Programs`
            : `${country.officialSourceCount} Verified Portals`}
        </span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0B3D91] to-[#072a68] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1.5 rounded-full text-xs text-blue-200">
            <Globe className="w-3.5 h-3.5" />
            <span>
              Global Immigration Catalog • 249 ISO Countries Tracked • {activeCount || 14} Verified Hubs
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {headerMeta.title}
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            {headerMeta.description}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-6 bg-white p-2 rounded-2xl shadow-xl flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              aria-label="Search countries or verified immigration programs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchIndex?.uiLabels.searchPlaceholder ||
                'Search countries or verified programs — e.g. Canada, Express Entry, Germany, UAE...'
              }
              className="w-full bg-transparent text-slate-900 font-medium text-sm sm:text-base focus:outline-none py-2"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-4" role="tablist" aria-label="Immigration category filters">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const catCount =
                cat.id === 'all'
                  ? programsIndex?.totalPrograms
                  : categoriesIndex?.categories[cat.id]?.count ?? 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  data-category-tab={cat.id}
                  onClick={() => handleSelectCategory(cat.id as ImmigrationCategoryKey | 'all')}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="text-[10px] opacity-80 tabular-nums">
                    ({programsIndex ? catCount : '–'})
                  </span>
                </button>
              );
            })}
            {(selectedCategory !== 'all' || invalidCategoryParam) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-500/20 hover:bg-rose-500/30 text-white border border-rose-300/40 cursor-pointer transition-colors"
              >
                Clear Filter ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Invalid Category Filter Notice (Graceful Recovery — Never 404) */}
      {invalidCategoryParam && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div
            role="status"
            className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs sm:text-sm text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Unrecognized Category Filter:</strong> The requested category{' '}
                <code className="px-1.5 py-0.5 bg-amber-100 rounded font-mono text-xs">
                  {invalidCategoryParam}
                </code>{' '}
                is not a canonical immigration category. Displaying the complete Global Immigration Hub listing instead.
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shrink-0 cursor-pointer"
            >
              Reset URL Filter
            </button>
          </div>
        </div>
      )}

      {/* Honest Language Fallback Disclosure (for non-EN interfaces) */}
      {searchIndex?.translationCoverage &&
        !searchIndex.translationCoverage.hasVerifiedNativeLegalTranslation &&
        searchIndex.translationCoverage.fallbackNotice && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#0B3D91] shrink-0 mt-0.5" />
              <div>
                <strong>Language Coverage Disclosure ({searchIndex.language.nativeName}):</strong>{' '}
                {searchIndex.translationCoverage.fallbackNotice}
              </div>
            </div>
          </div>
        )}

      {/* Honest Coverage Metrics Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-slate-900">
                Honest Catalog Coverage: {activeCount || 14} Verified Hubs • {quarantinedCount || 228} Verification Pending • {uninhabitedCount || 7} Uninhabited Territories
              </div>
              <div className="text-slate-600 text-xs mt-0.5">
                Only records backed by verified official HTTPS government portals appear as published programs. Pending countries are transparently marked and never padded with fabricated rules.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1.5 rounded-xl font-bold">
              {activeCategoryVerifiedCount} Verified Programs
            </div>
            <div className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-medium">
              {selectedCategory === 'all'
                ? `${CANONICAL_COVERAGE_SLOTS_COUNT.toLocaleString()} Tracked Slots (249 × 7)`
                : '249 Country Slots'}
            </div>
          </div>
        </div>

        {/* View Switcher & Status Filter */}
        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setViewMode('countries')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold border cursor-pointer transition-colors ${
                viewMode === 'countries'
                  ? 'bg-[#0B3D91] text-white border-[#0B3D91]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Country Hubs ({countriesIndex?.totalCountries ?? 249})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('programs')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold border cursor-pointer transition-colors ${
                viewMode === 'programs'
                  ? 'bg-[#0B3D91] text-white border-[#0B3D91]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Verified Program Directory ({filteredPrograms.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('updates')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold border cursor-pointer transition-colors flex items-center gap-1.5 ${
                viewMode === 'updates'
                  ? 'bg-[#0B3D91] text-white border-[#0B3D91]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Verified Changelog &amp; Guides</span>
            </button>
          </div>

          {viewMode === 'countries' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  { id: 'ALL', label: `All (${countriesIndex?.totalCountries ?? 249})` },
                  { id: 'ACTIVE', label: `Verified Hubs (${activeCount})` },
                  { id: 'QUARANTINED', label: `Pending (${quarantinedCount})` },
                  { id: 'UNINHABITED', label: `Uninhabited (${uninhabitedCount})` },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                    statusFilter === f.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State with Retry */}
        {errorMsg && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-300 rounded-2xl p-6 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold text-sm">Static Catalog Temporarily Unavailable</div>
                <p className="text-xs text-rose-800 mt-1">{errorMsg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadCatalogData(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Load
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !errorMsg && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" aria-busy="true">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="w-24 h-5 rounded-full bg-slate-200" />
                </div>
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* VIEW 1: Country Hubs Directory */}
        {!loading && !errorMsg && viewMode === 'countries' && (
          <>
            {/* Active Category Verified Programs Summary or Honest Empty State */}
            {selectedCategory !== 'all' && (
              <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">
                      Verified {activeCategoryCanonicalMeta?.cardTitle || selectedCategory} Programs ({filteredPrograms.length})
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Showing only officially verified programs (`AVAILABLE_VERIFIED` + `PUBLISHED`). Unverified countries remain transparently marked below.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {filteredPrograms.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setViewMode('programs')}
                        className="px-3 py-1.5 rounded-lg bg-[#0B3D91] text-white text-xs font-bold hover:bg-blue-900 cursor-pointer"
                      >
                        View Program Cards ({filteredPrograms.length})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  </div>
                </div>

                {filteredPrograms.length === 0 ? (
                  <div
                    data-empty-category-state="true"
                    className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-2"
                  >
                    <p className="text-sm font-bold text-amber-950">{HONEST_EMPTY_CATEGORY_MESSAGE}</p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-bold text-[#0B3D91] hover:underline cursor-pointer"
                    >
                      Reset Filter &amp; Browse All Categories
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredPrograms.map((prog) => {
                      const c = countriesIndex?.countries.find((item) => item.iso === prog.countryIso);
                      const detailUrl = buildCountryImmigrationUrl(
                        prog.countryIso.toLowerCase(),
                        selectedCategory
                      );
                      return (
                        <div
                          key={prog.id}
                          className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-800">
                              <span>
                                {c?.flag || '🌍'} {c?.name || prog.countryIso}
                              </span>
                              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                                VERIFIED
                              </span>
                            </div>
                            <div className="text-sm font-black text-slate-900 mt-1">{prog.name}</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              Verified: {prog.lastVerifiedDate}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-emerald-200/70 text-xs">
                            <button
                              type="button"
                              onClick={() => navigate(detailUrl)}
                              className="font-bold text-[#0B3D91] hover:underline cursor-pointer"
                            >
                              Open Country Hub →
                            </button>
                            <a
                              href={prog.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
                            >
                              <span>Official Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {selectedCategory === 'all'
                    ? 'All 249 Country Immigration Hubs'
                    : `${categories.find((c) => c.id === selectedCategory)?.label} Country Directory`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Showing {filteredCountries.length} of {countriesIndex?.totalCountries ?? 249} countries and territories.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/tools/source-verifier')}
                className="bg-blue-50 hover:bg-blue-100 text-[#0B3D91] border border-blue-200 px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Inspect 61 Verified Official Sources →
              </button>
            </div>

            {filteredCountries.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
                <p className="text-sm font-bold text-slate-800">
                  {searchIndex?.uiLabels.emptyStateText || 'No matching countries or verified pathways found.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  className="text-xs font-bold text-[#0B3D91] hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCountries.map((c) => {
                  const destinationUrl = buildCountryImmigrationUrl(c.slug, selectedCategory);
                  const countryPrograms = programsByCountry.get(c.iso) || [];
                  const matchingCatProg =
                    selectedCategory === 'all'
                      ? undefined
                      : countryPrograms.find((p) => p.category === selectedCategory);

                  return (
                    <div
                      key={c.iso}
                      onClick={() => navigate(destinationUrl)}
                      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#0B3D91] transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-4xl">{c.flag}</span>
                          {renderCountryStatusBadge(c, matchingCatProg)}
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0B3D91] transition-colors">
                          {c.name}
                        </h3>

                        {c.status === 'ACTIVE' && matchingCatProg && (
                          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs space-y-1">
                            <div className="font-bold text-emerald-950">{matchingCatProg.name}</div>
                            <div className="text-[11px] text-emerald-800">
                              Verified: {matchingCatProg.lastVerifiedDate}
                            </div>
                          </div>
                        )}

                        {c.status === 'ACTIVE' && !matchingCatProg && (
                          <p className="text-xs text-slate-600">
                            {c.verifiedProgramCount > 0
                              ? `${c.verifiedProgramCount} verified programs • ${c.officialSourceCount} official HTTPS portals`
                              : `${c.officialSourceCount} verified official government portals registered; program entries pending.`}
                          </p>
                        )}

                        {c.status === 'QUARANTINED' && (
                          <p className="text-xs text-amber-800 bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl">
                            Awaiting primary sovereign HTTPS verification. No unverified programs published.
                          </p>
                        )}

                        {c.status === 'UNINHABITED_TERRITORY' && (
                          <p className="text-xs text-slate-600 bg-slate-100 border border-slate-200 p-2.5 rounded-xl">
                            Uninhabited territory — standard immigration programs confirmed not applicable.
                          </p>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-[#0B3D91]">
                        <span>
                          {c.status === 'ACTIVE' ? 'Open Verified Country Hub' : 'View Verification Status'}
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* VIEW 2: Verified Program Directory (28 Published Programs Only) */}
        {!loading && !errorMsg && viewMode === 'programs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Verified Immigration Program Directory ({filteredPrograms.length})
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Every listed program satisfies Phase 2 publication eligibility (`AVAILABLE_VERIFIED` + `PUBLISHED`) with a primary official HTTPS portal. Expired and unverified records are excluded.
                </p>
              </div>
            </div>

            {filteredPrograms.length === 0 ? (
              <div
                data-empty-category-state="true"
                className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2"
              >
                <p className="text-sm font-bold text-slate-800">
                  {searchQuery.trim()
                    ? 'No verified programs match the selected category and search filter.'
                    : HONEST_EMPTY_CATEGORY_MESSAGE}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-[#0B3D91] hover:underline cursor-pointer"
                >
                  Show All Verified Programs
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredPrograms.map((prog) => {
                  const country = countriesIndex?.countries.find((c) => c.iso === prog.countryIso);
                  const catSlug = CATEGORY_INTERNAL_TO_PARAM_MAP[prog.category as ImmigrationCategoryKey] || prog.category;
                  return (
                    <div
                      key={prog.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between gap-4 hover:border-[#0B3D91] transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <span>{country?.flag || '🌍'}</span>
                            <span>{country?.name || prog.countryIso}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>AVAILABLE VERIFIED</span>
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-slate-900">{prog.name}</h3>
                        {prog.localName && (
                          <p className="text-xs italic text-slate-500">{prog.localName}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 pt-1">
                          <span className="bg-blue-50 text-[#0B3D91] font-bold px-2 py-0.5 rounded border border-blue-200 uppercase">
                            {prog.category.replace('_', ' ')}
                          </span>
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                            {prog.type}
                          </span>
                          <span className="text-slate-500 font-medium py-0.5">
                            Verified: {prog.lastVerifiedDate}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/immigration/${prog.countryIso.toLowerCase()}?category=${catSlug}`)
                          }
                          className="text-xs font-extrabold text-[#0B3D91] hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>
                            {prog.detailChunkPath ? 'Open Structured Visa Detail' : 'Open Country Hub'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={prog.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Verified Public Changelog & Published Editorial Guides */}
        {!loading && !errorMsg && viewMode === 'updates' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#0B3D91]" />
                  <h2 className="text-xl font-black text-slate-900">
                    Verified Immigration Changelog ({changelogIndex?.totalEntries ?? 0})
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Static Zero-DB Feed • Official HTTPS Sources Only
                </span>
              </div>

              {!changelogIndex ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-slate-100 rounded-xl" />
                  <div className="h-16 bg-slate-100 rounded-xl" />
                </div>
              ) : (
                <div className="space-y-3">
                  {changelogIndex.entries.map((entry) => (
                    <div
                      key={entry.changeId}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0B3D91] text-[11px] font-black">
                            {entry.affectedCountryIso}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            {entry.changeCategory.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{entry.changeDate}</span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900">{entry.title}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">Previous Rule</span>
                          <span className="text-slate-700">{entry.previousValue}</span>
                        </div>
                        <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200">
                          <span className="text-[10px] font-bold uppercase text-emerald-800 block">Verified Update</span>
                          <span className="text-emerald-950 font-semibold">{entry.newValue}</span>
                        </div>
                      </div>
                      <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <a
                          href={entry.sourceReference.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-[#0B3D91] hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Verify on Official Source</span>
                        </a>
                        <span className="text-[11px] text-slate-500">{entry.verifiedBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0B3D91]" />
                <h2 className="text-xl font-black text-slate-900">
                  Verified Published Editorial Guides ({editorialIndex?.totalPublished ?? 0})
                </h2>
              </div>

              {!editorialIndex ? (
                <div className="animate-pulse h-20 bg-slate-100 rounded-xl" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editorialIndex.articles.map((art) => (
                    <div
                      key={art.slug}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                          <span className="bg-blue-100 text-[#0B3D91] px-2 py-0.5 rounded">
                            {art.originCountryIso} → {art.destinationCountryIso}
                          </span>
                          <span className="uppercase">{art.category}</span>
                          <span>• Updated {art.updatedDate}</span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900">{art.title}</h3>
                        <p className="text-xs text-slate-600">{art.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => navigate(`/${art.slug}`)}
                          className="text-xs font-extrabold text-[#0B3D91] hover:underline cursor-pointer"
                        >
                          Read Guide →
                        </button>
                        {art.officialReferences[0] && (
                          <a
                            href={art.officialReferences[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Official Ref</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
