import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ExternalLink,
  Clock,
  Building2,
  Ban,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Info,
} from 'lucide-react';
import type {
  ImmigrationCategoryKey,
  ImmigrationProgram,
  PathwayVerificationStatus,
} from '../data/globalImmigrationHubData';
import type { SupportedLangCode } from '../i18n/config';
import { CountryPAAFaqSection } from '../components/CountryPAAFaqSection';
import {
  buildCountryImmigrationUrl,
  parseImmigrationCategoryQuery,
} from '../config/immigrationCategories';
import { VisaDetailRenderer } from '../components/VisaDetailRenderer';
import {
  adaptStaticVisaDetailForRenderer,
  isStaticCatalogEnabled,
  staticCatalogClient,
} from '../services/staticCatalogClient';
import type {
  CountryChunkPayload,
  CountryIndexEntry,
  StaticProgramRecord,
  VisaDetailChunkPayload,
} from '../types/staticCatalog';

function parseCategoryFromSearchOrWindow(locationSearch?: string): ImmigrationCategoryKey {
  const parsed = parseImmigrationCategoryQuery(
    locationSearch !== undefined ? locationSearch : undefined
  );
  return parsed.category === 'all' ? 'pr' : parsed.category;
}

interface CountryImmigrationDetailPageProps {
  countryCode: string;
  navigate: (path: string) => void;
  uiLang?: SupportedLangCode;
  locationSearch?: string;
  initialProgramId?: string;
}

export function CountryImmigrationDetailPage({
  countryCode,
  navigate,
  uiLang = 'en',
  locationSearch,
  initialProgramId,
}: CountryImmigrationDetailPageProps) {
  const rawNorm = (countryCode || 'US').trim().toUpperCase();
  const normCode = rawNorm === 'UK' ? 'GB' : rawNorm;
  const normalizedTargetProgramId = (initialProgramId || '').trim().toLowerCase();

  const [activeCategory, setActiveCategory] = useState<ImmigrationCategoryKey>(() =>
    parseCategoryFromSearchOrWindow(locationSearch)
  );
  const [applicantNationality, setApplicantNationality] = useState<string>('ALL');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chunkState, setChunkState] = useState<'ok' | 'quarantined' | 'uninhabited' | 'unavailable'>('ok');
  const [directoryEntry, setDirectoryEntry] = useState<CountryIndexEntry | null>(null);
  const [countryChunk, setCountryChunk] = useState<CountryChunkPayload | null>(null);
  const [legacyProfile, setLegacyProfile] = useState<{
    countryName: string;
    flag: string;
    officialSource: { authorityName: string; verificationTier: string; primaryGovUrl?: string };
    lastCheckedDate: string;
    programs: ImmigrationProgram[];
  } | null>(null);

  const loadCountryData = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setErrorMsg(null);

      // Controlled rollback boundary
      if (!isStaticCatalogEnabled('countryDetail')) {
        try {
          const hubMod = await import('../data/globalImmigrationHubData');
          const prof = hubMod.getImmigrationProfileForCountry(normCode);
          setLegacyProfile(prof);
          setCountryChunk(null);
          setChunkState('ok');
          setLoading(false);
          return;
        } catch (err: unknown) {
          setErrorMsg(err instanceof Error ? err.message : 'Failed to load legacy country profile.');
          setLoading(false);
          return;
        }
      }

      setLegacyProfile(null);
      const res = await staticCatalogClient.getCountryChunk(normCode, { forceRefresh });
      setDirectoryEntry(res.directoryEntry || null);

      if (res.status === 'ok' && res.data) {
        setCountryChunk(res.data);
        if (normalizedTargetProgramId) {
          const targetProg = res.data.programs.find(
            (p) => p.programId.toLowerCase() === normalizedTargetProgramId
          );
          if (targetProg) {
            const catMap: Record<string, ImmigrationCategoryKey> = {
              pr: 'pr',
              citizenship: 'citizenship',
              work: 'work',
              family: 'family',
              business: 'business',
              investor: 'business',
              digital_nomad: 'digital_nomad',
              retirement: 'digital_nomad',
              tourist: 'tourist',
            };
            setActiveCategory(catMap[targetProg.immigrationCategory] || 'pr');
            setChunkState('ok');
          } else {
            // Fail-closed: expired, quarantined, or unknown program ID must never render as active
            setChunkState('unavailable');
          }
        } else {
          setChunkState('ok');
        }
        setLoading(false);
        return;
      }

      if (res.status === 'quarantined') {
        setCountryChunk(null);
        setChunkState('quarantined');
        setLoading(false);
        return;
      }

      if (res.status === 'unavailable' && res.code === 'UNINHABITED_TERRITORY') {
        setCountryChunk(null);
        setChunkState('uninhabited');
        setLoading(false);
        return;
      }

      if (res.status === 'unavailable') {
        setCountryChunk(null);
        setChunkState('unavailable');
        setLoading(false);
        return;
      }

      setCountryChunk(null);
      setErrorMsg(res.error || 'Unable to load country immigration data. Please retry.');
      setLoading(false);
    },
    [normCode, normalizedTargetProgramId]
  );

  useEffect(() => {
    if (!normalizedTargetProgramId) {
      setActiveCategory(parseCategoryFromSearchOrWindow(locationSearch));
    }
  }, [normCode, locationSearch, normalizedTargetProgramId]);

  useEffect(() => {
    void loadCountryData(false);
  }, [normCode, loadCountryData]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      setActiveCategory(parseCategoryFromSearchOrWindow(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const categories: Array<{ id: ImmigrationCategoryKey; label: string; icon: string; desc: string }> = [
    { id: 'pr', label: 'Permanent Residency', icon: '🏠', desc: 'Sovereign PR permits, points systems, and settlement pathways.' },
    { id: 'citizenship', label: 'Citizenship & Naturalization', icon: '🛂', desc: 'Naturalization rules, dual citizenship, and passport acquisition.' },
    { id: 'work', label: 'Work Immigration', icon: '💼', desc: 'Skilled worker visas, employer sponsorships, and job seeker permits.' },
    { id: 'family', label: 'Family & Spouse', icon: '👨‍👩‍👧‍👦', desc: 'Spouse visas, dependent children, and parent sponsorships.' },
    { id: 'business', label: 'Business & Investor', icon: '📈', desc: 'Investor visas, entrepreneur startups, and Golden Visas.' },
    { id: 'digital_nomad', label: 'Digital Nomad & Retirement', icon: '🌴', desc: 'Remote work permits, freelancer visas, and retirement residency.' },
    { id: 'tourist', label: 'Tourist & Visitor', icon: '✈️', desc: 'Tourism, sightseeing, and visitor visas.' },
  ];

  const countryName =
    countryChunk?.country.countryName ||
    directoryEntry?.name ||
    legacyProfile?.countryName ||
    normCode;
  const countryFlag =
    countryChunk?.country.flag ||
    directoryEntry?.flag ||
    legacyProfile?.flag ||
    '🌍';
  const lastReviewed =
    countryChunk?.country.lastReviewedAt ||
    legacyProfile?.lastCheckedDate ||
    'Pending verification';
  const primaryAuthority =
    countryChunk?.officialSources[0]?.officialOrganizationName ||
    legacyProfile?.officialSource?.authorityName ||
    (chunkState === 'uninhabited'
      ? 'Not Applicable (Uninhabited Territory)'
      : 'Primary Sovereign Authority Verification Pending');
  const primaryPortalUrl =
    countryChunk?.officialSources[0]?.officialHttpsUrl ||
    legacyProfile?.officialSource?.primaryGovUrl ||
    null;

  const activeCategoryMeta = categories.find((c) => c.id === activeCategory) || categories[0];

  const staticProgramsInCategory: StaticProgramRecord[] = (countryChunk?.programs || []).filter(
    (p) => {
      if (normalizedTargetProgramId && p.programId.toLowerCase() === normalizedTargetProgramId) {
        return true;
      }
      if (activeCategory === 'business') {
        return p.immigrationCategory === 'business' || p.immigrationCategory === 'investor';
      }
      if (activeCategory === 'digital_nomad') {
        return p.immigrationCategory === 'digital_nomad' || p.immigrationCategory === 'retirement';
      }
      return p.immigrationCategory === activeCategory;
    }
  );
  const legacyProgramsInCategory: ImmigrationProgram[] = (legacyProfile?.programs || []).filter(
    (p) => p.category === activeCategory
  );

  const focusedProgram = normalizedTargetProgramId
    ? (countryChunk?.programs || []).find(
        (p) => p.programId.toLowerCase() === normalizedTargetProgramId
      ) || null
    : null;

  const hasVerifiedInCategory = legacyProfile
    ? legacyProgramsInCategory.some((p) => p.verificationStatus === 'AVAILABLE_VERIFIED')
    : chunkState === 'ok' && staticProgramsInCategory.length > 0;

  // SEO robots guard: quarantined, uninhabited, or unverified categories MUST emit noindex, follow
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let existingMeta = document.querySelector('meta[name="robots"]');
    if (!hasVerifiedInCategory || chunkState !== 'ok') {
      if (!existingMeta) {
        existingMeta = document.createElement('meta');
        existingMeta.setAttribute('name', 'robots');
        document.head.appendChild(existingMeta);
      }
      existingMeta.setAttribute('content', 'noindex, follow');
    } else if (existingMeta) {
      existingMeta.setAttribute('content', 'index, follow');
    }

    return () => {
      if (existingMeta) {
        existingMeta.setAttribute('content', 'index, follow');
      }
    };
  }, [hasVerifiedInCategory, chunkState, normCode, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 py-3 border-b border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate('/immigration')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Global Immigration Hub
          </button>
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            Official Sovereign Directory • {countryName} ({normCode})
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#0B3D91] to-[#072a68] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="text-6xl mb-2">{countryFlag}</div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {countryName} Immigration &amp; Residency Hub
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Evidence-based guide to verified immigration pathways in {countryName}, cross-referenced against official sovereign HTTPS portals.
          </p>
          <p className="text-amber-200/95 text-xs max-w-2xl mx-auto font-semibold">
            Informational Guide Only: VisaApply.org is not affiliated with the government of {countryName} or any embassy. Legal and statutory clauses are maintained in verified English{uiLang !== 'en' ? ` (UI language: ${uiLang.toUpperCase()})` : ''}; always confirm final eligibility on the official government portal below.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl max-w-xl mx-auto text-xs text-left space-y-1.5">
            <div className="font-bold text-blue-200 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-300" />
              <span>Official Registered Source Authority:</span>
            </div>
            <div className="text-white font-semibold">{primaryAuthority}</div>
            <div className="text-blue-300 text-[11px] flex items-center gap-2 flex-wrap pt-1">
              <span>
                Status:{' '}
                {chunkState === 'ok'
                  ? 'VERIFIED ACTIVE HUB'
                  : chunkState === 'uninhabited'
                    ? 'UNINHABITED TERRITORY'
                    : 'VERIFICATION PENDING (QUARANTINED)'}
              </span>
              <span>•</span>
              <span>Last Reviewed: {lastReviewed}</span>
            </div>
            {primaryPortalUrl && (
              <a
                href={primaryPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-bold pt-1 underline break-all"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span>{primaryPortalUrl}</span>
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6 animate-pulse" aria-busy="true">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-4" />
              ))}
            </div>
            <div className="h-48 bg-white rounded-2xl border border-slate-200 p-6" />
          </div>
        )}

        {/* Network / Load Error with Retry */}
        {!loading && errorMsg && (
          <div
            role="alert"
            className="bg-rose-50 border border-rose-300 rounded-2xl p-6 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <h2 className="font-extrabold text-sm">Unable to Load Country Catalog Chunk</h2>
                <p className="text-xs text-rose-800 mt-1">{errorMsg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void loadCountryData(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Honest Quarantined State (228 Countries Awaiting Official Verification) */}
        {!loading && !errorMsg && chunkState === 'quarantined' && (
          <div className="bg-white border-2 border-amber-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-extrabold">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>VERIFICATION PENDING • NOT YET PUBLISHED</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {countryName} ({normCode}) Is Awaiting Primary Official Source Verification
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
              VisaApply.org enforces a strict zero-fabrication policy: immigration programs, fees, processing times, and eligibility rules for <strong>{countryName}</strong> are currently quarantined until verified directly against an official sovereign HTTPS government portal.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">What This Means for Applicants:</div>
              <p>
                • Verification-pending does <strong>not</strong> mean {countryName} has no visas — it means our static catalog has not yet completed primary sovereign HTTPS verification for this jurisdiction.
              </p>
              <p>
                • This page is automatically tagged <code className="bg-slate-200 px-1 rounded">noindex, follow</code> and excluded from valid-only static sitemaps until verified.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/immigration')}
                className="px-4 py-2.5 bg-[#0B3D91] hover:bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Browse 14 Verified Country Hubs
              </button>
              <button
                type="button"
                onClick={() => navigate('/tools/source-verifier')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                View 61 Verified Official Sources
              </button>
            </div>
          </div>
        )}

        {/* Honest Uninhabited Territory State (7 Territories) */}
        {!loading && !errorMsg && chunkState === 'uninhabited' && (
          <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 bg-slate-200 text-slate-800 border border-slate-400 px-3 py-1 rounded-full text-xs font-extrabold">
              <Ban className="w-4 h-4 text-slate-700" />
              <span>CONFIRMED NOT AVAILABLE • UNINHABITED TERRITORY</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {countryName} ({normCode}) — Standard Immigration Programs Do Not Apply
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
              {countryName} is classified as an uninhabited territory. Standard permanent residency, citizenship, work permit, family sponsorship, business investor, and digital nomad visa programs are confirmed not applicable.
            </p>
          </div>
        )}

        {/* Unavailable / Unknown Country Code or Unverified/Expired Program ID (Fail-Closed) */}
        {!loading && !errorMsg && chunkState === 'unavailable' && (
          <div className="bg-white border-2 border-amber-300 rounded-2xl p-8 text-center space-y-3 mb-10">
            <h2 className="text-xl font-black text-slate-900">
              {normalizedTargetProgramId
                ? `404 — Verified Program Not Found (${normCode}/${normalizedTargetProgramId})`
                : `Country Hub Not Available (${normCode})`}
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              {normalizedTargetProgramId
                ? `No currently active, verified static catalog program matches "${normalizedTargetProgramId}" for ${countryName}. Expired, revoked, or unverified programs are excluded from public pages.`
                : `No active static catalog record exists for country identifier ${normCode}.`}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {normalizedTargetProgramId && (
                <button
                  type="button"
                  onClick={() => navigate(`/immigration/${normCode.toLowerCase()}`)}
                  className="px-4 py-2 bg-[#0B3D91] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  View {countryName} Immigration Hub
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/immigration')}
                className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Return to All 249 Country Hubs
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE VERIFIED HUB (Static Catalog or Legacy Rollback) */}
        {!loading && !errorMsg && chunkState === 'ok' && (countryChunk || legacyProfile) && (
          <>
            {/* 7 Tracked Category Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                const countInCat = legacyProfile
                  ? legacyProfile.programs.filter(
                      (p) => p.category === cat.id && p.verificationStatus === 'AVAILABLE_VERIFIED'
                    ).length
                  : (countryChunk?.programs || []).filter((p) => p.immigrationCategory === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      navigate(buildCountryImmigrationUrl(normCode.toLowerCase(), cat.id));
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-[#0B3D91] text-white border-[#0B3D91] shadow-lg'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div>
                      <div className="text-2xl mb-1.5">{cat.icon}</div>
                      <h3 className="font-bold text-xs sm:text-sm tracking-tight">{cat.label}</h3>
                    </div>
                    <div className="mt-3">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                          isActive
                            ? 'bg-emerald-950 text-emerald-100 border border-emerald-400/50'
                            : countInCat > 0
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {countInCat > 0 ? `${countInCat} Verified` : 'No Verified Entry'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Category Header */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{activeCategoryMeta.icon}</span>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    {activeCategoryMeta.label} in {countryName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">{activeCategoryMeta.desc}</p>
                </div>
              </div>
            </div>

            {/* Static Catalog Programs */}
            {countryChunk && (
              <div className="space-y-6">
                {staticProgramsInCategory.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-3">
                    <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                      <Info className="w-3.5 h-3.5" />
                      <span>DATA NOT YET PUBLISHED FOR THIS CATEGORY</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900">
                      No Verified {activeCategoryMeta.label} Program Published Yet for {countryName}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      This does <strong>not</strong> mean {countryName} does not offer a {activeCategoryMeta.label.toLowerCase()} pathway — it means VisaApply.org has not yet published a verified static record in this category. Consult {countryName}&apos;s verified official government portals below.
                    </p>
                  </div>
                ) : (
                  (focusedProgram
                    ? [
                        focusedProgram,
                        ...staticProgramsInCategory.filter(
                          (p) => p.programId !== focusedProgram.programId
                        ),
                      ]
                    : staticProgramsInCategory
                  ).map((prog) => (
                    <StaticProgramCard
                      key={prog.programId}
                      prog={prog}
                      applicantNationality={applicantNationality}
                      onNationalityChange={setApplicantNationality}
                    />
                  ))
                )}

                {/* Official Verified HTTPS Sources Registry for this Country */}
                {countryChunk.officialSources.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 mt-8">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-600" />
                        <span>
                          Verified Official Government Sources for {countryName} ({countryChunk.officialSources.length})
                        </span>
                      </h3>
                      <span className="text-xs text-slate-500 font-semibold">
                        HTTPS Sovereign Registry • Checked {countryChunk.country.lastReviewedAt}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {countryChunk.officialSources.map((src) => (
                        <a
                          key={src.sourceId}
                          href={src.officialHttpsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0B3D91] bg-slate-50/70 flex flex-col justify-between gap-1.5 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-slate-900">{src.issuingAuthority}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#0B3D91] shrink-0" />
                          </div>
                          <span className="text-[11px] text-[#0B3D91] break-all font-medium">
                            {src.officialHttpsUrl}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {src.sourceCategory.replace(/_/g, ' ')} • Verified {src.lastCheckedDate}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Legacy Rollback Programs (only rendered when rollback flag disables static catalog) */}
            {legacyProfile && (
              <div className="space-y-6">
                {legacyProgramsInCategory.map((prog) => (
                  <LegacyProgramCard key={prog.id} prog={prog} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="mt-12 pt-8 border-t border-slate-200">
          <CountryPAAFaqSection
            countryName={countryName}
            countryCode={normCode}
            fromCountryName="India"
            fromCode="IN"
            onNavigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}

function StaticProgramCard({
  prog,
  applicantNationality,
  onNationalityChange,
}: {
  prog: StaticProgramRecord;
  applicantNationality?: string;
  onNationalityChange?: (nat: string) => void;
}) {
  const [detailChunk, setDetailChunk] = useState<VisaDetailChunkPayload | null>(null);
  const [detailState, setDetailState] = useState<'loading' | 'available' | 'unavailable' | 'error'>('loading');
  const [detailMessage, setDetailMessage] = useState<string | null>(null);
  const [currentNat, setCurrentNat] = useState<string>(applicantNationality || 'ALL');

  useEffect(() => {
    if (applicantNationality) setCurrentNat(applicantNationality);
  }, [applicantNationality]);

  const loadDetail = useCallback(
    async (forceRefresh = false) => {
      if (!isStaticCatalogEnabled('visaDetail')) {
        setDetailState('unavailable');
        return;
      }
      setDetailState('loading');
      setDetailMessage(null);
      const res = await staticCatalogClient.getVisaDetailChunk(prog.programId, { forceRefresh });
      if (res.status === 'ok' && res.data) {
        setDetailChunk(res.data);
        setDetailState('available');
      } else if (res.status === 'unavailable' || res.status === 'empty') {
        setDetailChunk(null);
        setDetailState('unavailable');
        setDetailMessage(
          res.error || 'Detailed 30-section breakdown is not yet published for this program.'
        );
      } else {
        setDetailChunk(null);
        setDetailState('error');
        setDetailMessage(res.error || 'Temporary network error loading structured visa details.');
      }
    },
    [prog.programId]
  );

  useEffect(() => {
    void loadDetail(false);
  }, [loadDetail]);

  const primaryRef = prog.officialSourceRefs[0];
  const applicationRef = prog.officialSourceRefs[1] || primaryRef;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3" />
              <span>AVAILABLE - VERIFIED</span>
            </span>
            {prog.applyFrom && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200">
                Apply: {prog.applyFrom}
              </span>
            )}
            <span className="text-xs text-slate-500">• Verified: {prog.lastVerifiedDate}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">{prog.programName}</h3>
          {prog.localLanguageName && (
            <div className="text-xs font-semibold text-slate-500 italic mt-0.5">
              Local Statutory Name: {prog.localLanguageName}
            </div>
          )}
        </div>
        {primaryRef && (
          <a
            href={primaryRef.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#0B3D91] border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>Official Govt Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Program Summary & Legal Basis */}
      <div className="space-y-3">
        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Verified Eligibility Summary</h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            {prog.eligibilitySummary}
          </p>
        </div>

        {prog.legalBasis && (
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Statutory / Legal Basis &amp; Program Classification:</span>
            </div>
            <p className="font-mono text-[11px] text-slate-600">{prog.legalBasis}</p>
            <div className="text-[11px] text-slate-500">
              Type: <strong>{prog.programType}</strong> • Program ID: <code>{prog.programId}</code>
            </div>
          </div>
        )}
      </div>

      {/* Lazy-Loaded Structured Visa Detail Section */}
      {detailState === 'loading' && (
        <div className="animate-pulse h-24 bg-slate-100 rounded-xl border border-slate-200" />
      )}

      {detailState === 'available' && detailChunk && (
        <div className="pt-2 border-t border-slate-200">
          <VisaDetailRenderer
            details={adaptStaticVisaDetailForRenderer(detailChunk)}
            selectedNationality={currentNat}
            onNationalityChange={(nat) => {
              setCurrentNat(nat);
              onNationalityChange?.(nat);
            }}
          />
        </div>
      )}

      {detailState === 'unavailable' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-bold text-slate-900">
              Structured 30-Section Visa Detail Not Yet Published
            </div>
            <p className="text-slate-600">
              {detailMessage ||
                'Core program eligibility and official links above are verified; detailed fee schedules, processing times, and document checklists should be confirmed directly on the official application portal.'}
            </p>
          </div>
          {applicationRef && (
            <a
              href={applicationRef.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0B3D91] hover:bg-blue-900 text-white rounded-lg font-bold shrink-0"
            >
              <span>Official Application Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {detailState === 'error' && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 flex items-center justify-between gap-3">
          <span>{detailMessage}</span>
          <button
            type="button"
            onClick={() => void loadDetail(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-700 text-white rounded-lg font-bold cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

function renderLegacyStatusBadge(status: PathwayVerificationStatus) {
  switch (status) {
    case 'AVAILABLE_VERIFIED':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">AVAILABLE - VERIFIED</span>;
    case 'NOT_AVAILABLE_CONFIRMED':
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-200 text-slate-800 border border-slate-400">CONFIRMED NOT AVAILABLE</span>;
    default:
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">{status.replace(/_/g, ' ')}</span>;
  }
}

function LegacyProgramCard({ prog }: { prog: ImmigrationProgram }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {renderLegacyStatusBadge(prog.verificationStatus)}
            <span className="text-xs text-slate-400">Last Checked: {prog.lastCheckedDate}</span>
          </div>
          <h3 className="text-xl font-black text-slate-900">{prog.officialName}</h3>
        </div>
        <a
          href={prog.officialInformationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-50 text-[#0B3D91] border border-blue-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
        >
          <span>Official Govt Source</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <p className="text-sm text-slate-700">{prog.eligibility}</p>
    </div>
  );
}
