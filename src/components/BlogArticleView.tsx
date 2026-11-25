import React, { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import {
  CheckCircle2,
  FileText,
  Shield,
  ArrowRight,
  ExternalLink,
  Clock,
  ArrowUp,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  Lock,
} from 'lucide-react';
import { applySeoMetadataToDom, resolveValidOgImageUrl } from '../utils/seoMetadataManager';
import { sanitizeHtml, sanitizeUrl } from '../utils/htmlSanitizer';
import {
  isStaticCatalogEnabled,
  staticCatalogClient,
} from '../services/staticCatalogClient';
import type {
  EditorialArticleChunkPayload,
  EditorialIndexArticle,
} from '../types/staticCatalog';

export interface Article {
  slug: string;
  title: string;
  from: string;
  to: string;
  type: string;
  date: string;
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  fees: string;
  docs: string;
  excerpt?: string;
  contentHtml?: string;
  rawContent?: string;
  content?: string;
}

interface Country {
  code: string;
  name: string;
  flag: string;
}

const FALLBACK_COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
];

function normalizeSlugLocal(raw: string): string {
  return String(raw || '')
    .trim()
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/+(?:blogs?\/)?/i, '')
    .replace(/\/+$/g, '')
    .split('?')[0]
    .split('#')[0]
    .toLowerCase();
}

export function parseBlogSlug(slug: string) {
  const clean = normalizeSlugLocal(slug);
  const toSplit = clean.split('-to-');

  let fromStr = 'in';
  let restStr = '';

  if (toSplit.length >= 2) {
    fromStr = toSplit[0];
    restStr = toSplit.slice(1).join('-to-');
  } else {
    restStr = clean;
  }

  const countryNameMap: Record<string, string> = {
    india: 'IN', in: 'IN',
    canada: 'CA', ca: 'CA',
    usa: 'US', us: 'US', 'united-states': 'US',
    uk: 'GB', gb: 'GB', 'united-kingdom': 'GB',
    uae: 'AE', dubai: 'AE', ae: 'AE',
    schengen: 'DE', germany: 'DE', de: 'DE',
    france: 'FR', fr: 'FR',
    australia: 'AU', au: 'AU',
    singapore: 'SG', sg: 'SG',
    japan: 'JP', jp: 'JP',
    italy: 'IT', it: 'IT',
    spain: 'ES', es: 'ES',
    netherlands: 'NL', nl: 'NL',
    'new-zealand': 'NZ', nz: 'NZ',
    sweden: 'SE', se: 'SE',
    switzerland: 'CH', ch: 'CH',
    ireland: 'IE', ie: 'IE',
    norway: 'NO', no: 'NO',
    portugal: 'PT', pt: 'PT',
  };

  const fromCode =
    countryNameMap[fromStr] || (fromStr.length === 2 ? fromStr.toUpperCase() : 'IN');
  let toCode = 'US';
  let category = 'tourist';

  for (const [name, code] of Object.entries(countryNameMap)) {
    if (restStr.startsWith(name + '-') || restStr === name || restStr.startsWith(name)) {
      toCode = code;
      break;
    }
  }

  if (restStr.includes('work')) category = 'work';
  else if (restStr.includes('student') || restStr.includes('study')) category = 'student';
  else if (restStr.includes('family') || restStr.includes('spouse')) category = 'family';
  else if (restStr.includes('business')) category = 'business';
  else if (restStr.includes('pr') || restStr.includes('permanent')) category = 'pr';
  else if (restStr.includes('visitor') || restStr.includes('tourist')) category = 'tourist';

  return { fromCode, toCode, category };
}

interface BlogArticleViewProps {
  article?: Article | null;
  pathSlug: string;
  articles?: Article[];
  countries?: Country[];
  navigate: (path: string) => void;
}

export function BlogArticleView({
  article,
  pathSlug,
  articles = [],
  countries = FALLBACK_COUNTRIES,
  navigate,
}: BlogArticleViewProps) {
  const slug = normalizeSlugLocal(pathSlug || article?.slug || '');
  const useStatic = isStaticCatalogEnabled('blogArticle');

  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<'ok' | 'unavailable' | 'error'>('ok');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [staticChunk, setStaticChunk] = useState<EditorialArticleChunkPayload | null>(null);
  const [relatedPublished, setRelatedPublished] = useState<EditorialIndexArticle[]>([]);
  const [legacyArticle, setLegacyArticle] = useState<Article | null>(null);

  const loadArticle = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setErrorMsg(null);

      // Controlled rollback branch (when `blogArticle` static catalog flag is explicitly disabled)
      if (!isStaticCatalogEnabled('blogArticle')) {
        try {
          const defMod = await import('../data/defaultArticles');
          const parsed = parseBlogSlug(slug);
          const match =
            article ||
            articles.find((a) => normalizeSlugLocal(a.slug) === slug) ||
            defMod.findDefaultGuideMatch(slug, parsed.fromCode, parsed.toCode, parsed.category);
          if (match) {
            setLegacyArticle(match);
            setStaticChunk(null);
            setStatus('ok');
          } else {
            setLegacyArticle(null);
            setStaticChunk(null);
            setStatus('unavailable');
          }
        } catch (err: unknown) {
          setStatus('error');
          setErrorMsg(err instanceof Error ? err.message : 'Unable to load legacy editorial guide.');
        } finally {
          setLoading(false);
        }
        return;
      }

      setLegacyArticle(null);

      if (!slug) {
        setStaticChunk(null);
        setStatus('unavailable');
        setLoading(false);
        return;
      }

      const [chunkRes, indexRes] = await Promise.all([
        staticCatalogClient.getEditorialChunk(slug, { forceRefresh }),
        staticCatalogClient.getEditorialIndex({ forceRefresh }),
      ]);

      if (indexRes.status === 'ok' && indexRes.data) {
        setRelatedPublished(
          indexRes.data.articles.filter((a) => normalizeSlugLocal(a.slug) !== slug)
        );
      } else {
        setRelatedPublished([]);
      }

      if (chunkRes.status === 'ok' && chunkRes.data) {
        setStaticChunk(chunkRes.data);
        setStatus('ok');
        setLoading(false);
        return;
      }

      if (chunkRes.status === 'unavailable' || chunkRes.status === 'empty' || chunkRes.status === 'quarantined') {
        setStaticChunk(null);
        setStatus('unavailable');
        setLoading(false);
        return;
      }

      setStaticChunk(null);
      setStatus('error');
      setErrorMsg(chunkRes.error || 'Temporary error loading verified editorial article.');
      setLoading(false);
    },
    [slug, article, articles]
  );

  useEffect(() => {
    void loadArticle(false);
  }, [loadArticle]);

  const parsedSlug = parseBlogSlug(slug);
  const fromCode = (
    staticChunk?.originCountryIso ||
    legacyArticle?.from ||
    parsedSlug.fromCode ||
    'IN'
  ).toUpperCase();
  const toCode = (
    staticChunk?.destinationCountryIso ||
    legacyArticle?.to ||
    parsedSlug.toCode ||
    'US'
  ).toUpperCase();
  const categoryCode = (
    staticChunk?.category ||
    legacyArticle?.type ||
    parsedSlug.category ||
    'tourist'
  ).toLowerCase();

  const fromCountry =
    countries.find((c) => c.code.toUpperCase() === fromCode) ||
    FALLBACK_COUNTRIES.find((c) => c.code === fromCode) || {
      name: fromCode,
      flag: '🌍',
      code: fromCode,
    };
  const toCountry =
    countries.find((c) => c.code.toUpperCase() === toCode) ||
    FALLBACK_COUNTRIES.find((c) => c.code === toCode) || {
      name: toCode,
      flag: '🏛️',
      code: toCode,
    };

  // Update document metadata accurately (noindex when unavailable/draft)
  useEffect(() => {
    if (typeof window === 'undefined' || loading) return;
    if (status === 'ok' && (staticChunk || legacyArticle)) {
      const titleText = staticChunk?.title || legacyArticle?.title || 'Verified Visa Guide';
      const descText =
        staticChunk?.description ||
        legacyArticle?.excerpt ||
        `Verified editorial visa guide for ${fromCountry.name} to ${toCountry.name}.`;
      const fullTitle = titleText.includes('VisaApply.org')
        ? titleText
        : `${titleText} | VisaApply.org`;
      const canonicalSlugPath = staticChunk ? `/${staticChunk.slug}` : `/${slug}`;
      applySeoMetadataToDom(
        {
          title: fullTitle,
          description: descText,
          ogType: 'article',
          ogImage: resolveValidOgImageUrl(toCode.toLowerCase()),
          ogImageAlt: fullTitle,
          noindex: false,
        },
        canonicalSlugPath
      );
    } else if (status === 'unavailable') {
      applySeoMetadataToDom(
        {
          title: 'Editorial Guide Not Published | VisaApply.org',
          description:
            'The requested editorial guide is not published or is awaiting official editorial verification on VisaApply.org.',
          ogType: 'article',
          noindex: true,
        },
        window.location.pathname
      );
    }
  }, [loading, status, staticChunk, legacyArticle, slug, fromCountry.name, toCountry.name, toCode]);

  const sanitizedHtml = (() => {
    if (staticChunk?.markdownContent) {
      const rawHtml = String(marked.parse(staticChunk.markdownContent, { async: false }));
      return sanitizeHtml(rawHtml);
    }
    if (legacyArticle) {
      const rawHtml = legacyArticle.contentHtml
        ? legacyArticle.contentHtml
        : String(marked.parse(legacyArticle.content || legacyArticle.rawContent || '', { async: false }));
      return sanitizeHtml(rawHtml);
    }
    return '';
  })();

  const safeOfficialReferences = (staticChunk?.officialReferences || [])
    .map((u) => sanitizeUrl(u, { allowRelative: false }))
    .filter((u): u is string => Boolean(u));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 py-2.5 px-3 sm:px-4 -mx-4 sm:mx-0 rounded-b-2xl sm:rounded-2xl border-b border-slate-200/90 shadow-sm mb-6 no-print">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/blogs')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-xs cursor-pointer transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#0B3D91]" />
              <span>All Published Guides</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/immigration/${toCode.toLowerCase()}`)}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 text-xs font-medium text-slate-700 cursor-pointer"
            >
              <span>{toCountry.name} Immigration Hub</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => typeof window !== 'undefined' && window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium cursor-pointer shrink-0 transition-colors"
            title="Scroll to Top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Top</span>
          </button>
        </div>
      </div>

      {/* Accessible Breadcrumbs (strictly <button>, never <span onClick>) */}
      <nav
        aria-label="Breadcrumb"
        className="text-xs sm:text-sm text-slate-500 mb-6 font-medium flex items-center gap-1.5 flex-wrap no-print"
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="cursor-pointer hover:text-blue-600 focus-visible:underline"
        >
          Home
        </button>
        <span aria-hidden="true">&gt;</span>
        <button
          type="button"
          onClick={() => navigate('/blogs')}
          className="cursor-pointer hover:text-blue-600 focus-visible:underline"
        >
          Published Editorial Guides
        </button>
        <span aria-hidden="true">&gt;</span>
        <span className="text-slate-900 font-bold truncate max-w-xs" aria-current="page">
          {staticChunk?.title || legacyArticle?.title || slug || 'Guide'}
        </span>
      </nav>

      {/* Loading State */}
      {loading && (
        <div
          aria-busy="true"
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5 animate-pulse"
        >
          <div className="h-5 w-48 bg-slate-200 rounded-md" />
          <div className="h-9 w-3/4 bg-slate-200 rounded-lg" />
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-5/6 bg-slate-100 rounded" />
          <div className="h-44 w-full bg-slate-100 rounded-xl" />
        </div>
      )}

      {/* Error State with Retry */}
      {!loading && status === 'error' && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-300 rounded-2xl p-6 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <h1 className="font-extrabold text-base">Unable to Load Editorial Guide</h1>
              <p className="text-xs text-rose-800 mt-1">
                {errorMsg || 'A network error interrupted loading the static editorial artifact.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadArticle(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Unavailable / Draft / Quarantined Fail-Closed State */}
      {!loading && status === 'unavailable' && (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-amber-300 p-6 sm:p-10 space-y-5">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-extrabold">
            <Lock className="w-3.5 h-3.5" />
            <span>NOT PUBLISHED • DRAFT OR UNVERIFIED CONTENT EXCLUDED</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            No Verified Published Guide Exists for &ldquo;{slug || 'requested-slug'}&rdquo;
          </h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            VisaApply.org only renders editorial guides that have passed official-source verification
            and carry <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-xs">editorialStatus: published</code>{' '}
            in the static catalog. Draft articles, quarantined records, and unverified routes are never
            fabricated or displayed on public pages.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/blogs')}
              className="px-4 py-2.5 bg-[#0B3D91] hover:bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Browse Verified Published Guides
            </button>
            <button
              type="button"
              onClick={() => navigate('/immigration')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
            >
              Open Global Immigration Hub
            </button>
          </div>

          {relatedPublished.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <h2 className="text-sm font-extrabold text-slate-900">
                Currently Verified &amp; Published Editorial Guides ({relatedPublished.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedPublished.map((rel) => (
                  <button
                    key={rel.slug}
                    type="button"
                    onClick={() => navigate(`/blogs/${rel.slug}`)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#0B3D91] bg-slate-50/70 text-left transition-colors cursor-pointer space-y-1"
                  >
                    <div className="text-xs font-bold text-emerald-700">
                      Published {rel.publicationDate}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">{rel.title}</div>
                    <p className="text-xs text-slate-600 line-clamp-2">{rel.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Published & Verified Static Catalog Article */}
      {!loading && status === 'ok' && (staticChunk || legacyArticle) && (
        <article className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-10 space-y-8">
          <header className="space-y-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#0B3D91] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                <span>
                  {fromCountry.flag} {fromCountry.name} ({fromCode})
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
                <span>
                  {toCountry.flag} {toCountry.name} ({toCode})
                </span>
              </span>

              <span className="uppercase bg-[#0B3D91] text-white text-[11px] font-extrabold px-3 py-1 rounded-full tracking-wide">
                {categoryCode} Visa
              </span>

              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{useStatic ? 'Verified Published Guide' : 'Legacy Rollback Guide'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {staticChunk?.title || legacyArticle?.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {staticChunk?.description || legacyArticle?.excerpt}
            </p>

            {/* Accurate Publication & Verification Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Editorial Status</span>
                <span className="font-bold text-emerald-800 mt-0.5 block">Published</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Published Date</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {staticChunk?.publicationDate || legacyArticle?.publishedDate || legacyArticle?.date || 'Not Specified'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Last Updated</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {staticChunk?.updatedDate || legacyArticle?.updatedAt || staticChunk?.publicationDate || 'Not Specified'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Verified References</span>
                <span className="font-bold text-[#0B3D91] mt-0.5 block">
                  {safeOfficialReferences.length > 0
                    ? `${safeOfficialReferences.length} Official HTTPS`
                    : 'See Source Notice'}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                <strong>Independent Information Notice:</strong> VisaApply.org is not affiliated with
                any government agency, embassy, or VFS Global. Confirm exact fees, processing times,
                and eligibility rules directly on the official government portals referenced below.
              </p>
            </div>
          </header>

          {/* Verified Markdown Content Body */}
          {sanitizedHtml && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0B3D91]" />
                  <span>Verified Editorial Content</span>
                </h2>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  Language: {(staticChunk?.language || 'en').toUpperCase()}
                </span>
              </div>

              <div
                className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed space-y-4 bg-slate-50/60 p-6 rounded-2xl border border-slate-200"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            </section>
          )}

          {/* Verified Official Government References */}
          {safeOfficialReferences.length > 0 && (
            <section className="space-y-3 pt-4 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>Official Government References ({safeOfficialReferences.length})</span>
              </h2>
              <ul className="space-y-2">
                {safeOfficialReferences.map((refUrl) => (
                  <li key={refUrl}>
                    <a
                      href={refUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 p-3 w-full rounded-xl border border-slate-200 hover:border-[#0B3D91] bg-slate-50 text-xs sm:text-sm font-semibold text-[#0B3D91] break-all transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 shrink-0" />
                      <span>{refUrl}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Related Verified Published Guides */}
          {relatedPublished.length > 0 && (
            <section className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900">
                  Other Verified Published Guides
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/blogs')}
                  className="text-xs font-bold text-[#0B3D91] hover:underline cursor-pointer"
                >
                  View Directory →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedPublished.slice(0, 4).map((rel) => (
                  <button
                    key={rel.slug}
                    type="button"
                    onClick={() => navigate(`/blogs/${rel.slug}`)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#0B3D91] bg-slate-50/70 text-left transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>Updated {rel.updatedDate || rel.publicationDate}</span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">{rel.title}</div>
                    <p className="text-xs text-slate-600 line-clamp-2">{rel.description}</p>
                  </button>
                ))}
              </div>
            </section>
          )}
        </article>
      )}
    </div>
  );
}
