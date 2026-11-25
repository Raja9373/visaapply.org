import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Shield,
  Lock,
  Search,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import {
  isStaticCatalogEnabled,
  staticCatalogClient,
} from '../services/staticCatalogClient';
import type { EditorialIndexArticle } from '../types/staticCatalog';
import type { GeneratedBlog } from '../data/blogGenerator';

interface BlogsPageProps {
  navigate: (path: string) => void;
  extraBlogs?: GeneratedBlog[];
  onBlogsAdded?: (newBlogs: GeneratedBlog[]) => void;
}

export const BlogsPage: React.FC<BlogsPageProps> = ({ navigate, extraBlogs = [] }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publishedArticles, setPublishedArticles] = useState<EditorialIndexArticle[]>([]);
  const [legacyBlogs, setLegacyBlogs] = useState<GeneratedBlog[] | null>(null);

  const loadEditorialDirectory = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setErrorMsg(null);

      // Controlled rollback branch ONLY when feature flag is explicitly disabled
      if (!isStaticCatalogEnabled('blogsDirectory')) {
        try {
          const genMod = await import('../data/blogGenerator');
          const initial = genMod.generateDailyBlogs();
          const map = new Map<string, GeneratedBlog>();
          [...extraBlogs, ...initial].forEach((b) => {
            if (b && b.slug && !map.has(b.slug)) {
              map.set(b.slug, b);
            }
          });
          setLegacyBlogs(Array.from(map.values()));
          setPublishedArticles([]);
        } catch (err: unknown) {
          setErrorMsg(err instanceof Error ? err.message : 'Unable to load legacy blog directory.');
        } finally {
          setLoading(false);
        }
        return;
      }

      setLegacyBlogs(null);
      const res = await staticCatalogClient.getEditorialIndex({ forceRefresh });
      if (res.status === 'ok' && res.data) {
        setPublishedArticles(res.data.articles);
        setLoading(false);
        return;
      }
      if (res.status === 'empty' || res.status === 'unavailable') {
        setPublishedArticles([]);
        setLoading(false);
        return;
      }
      setPublishedArticles([]);
      setErrorMsg(res.error || 'Unable to load verified editorial guides from static catalog.');
      setLoading(false);
    },
    [extraBlogs]
  );

  useEffect(() => {
    void loadEditorialDirectory(false);
  }, [loadEditorialDirectory]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    publishedArticles.forEach((a) => {
      if (a.category) set.add(a.category.toLowerCase());
    });
    return Array.from(set).sort();
  }, [publishedArticles]);

  const filteredPublished = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publishedArticles.filter((article) => {
      if (categoryFilter !== 'all' && (article.category || '').toLowerCase() !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        article.title.toLowerCase().includes(q) ||
        article.description.toLowerCase().includes(q) ||
        article.slug.toLowerCase().includes(q) ||
        (article.originCountryIso || '').toLowerCase().includes(q) ||
        (article.destinationCountryIso || '').toLowerCase().includes(q)
      );
    });
  }, [publishedArticles, search, categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0B3D91] rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Editorial Directory • Published Articles Only</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Verified Global Visa &amp; Immigration Guides
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Only editorial guides verified against official government HTTPS portals and promoted to{' '}
              <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-[11px]">published</code>{' '}
              status appear here. Drafts and AI-generated drafts remain isolated in private editorial
              review and are never auto-published.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/immigration')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              Global Immigration Hub →
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Editorial Governance Separation Notice */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 text-xs text-slate-700">
          <Lock className="w-4 h-4 text-[#0B3D91] shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-slate-900 block">
              Public Rendering Separated from Editorial Admin Workflows
            </span>
            <span>
              Draft authoring, verification audits, and publication approvals occur exclusively in the
              authenticated editorial console. Unverified drafts are strictly excluded from public static
              catalog artifacts and sitemaps.
            </span>
          </div>
        </div>
        <span className="text-xs font-extrabold text-[#0B3D91] bg-white border border-blue-200 px-3 py-1.5 rounded-xl shrink-0">
          {loading ? 'Loading...' : `${publishedArticles.length} Published Guide${publishedArticles.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-8 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter verified published guides by title, slug, or country code (e.g. CA, UK, tourist)..."
            className="w-full bg-transparent text-sm text-slate-900 outline-none font-medium"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter by guide category"
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
        >
          <option value="all">All Verified Categories</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div aria-busy="true" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-56 bg-white rounded-2xl border border-slate-200 p-5" />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && errorMsg && (
        <div
          role="alert"
          className="bg-rose-50 border border-rose-300 rounded-2xl p-6 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-extrabold text-sm">Unable to Load Editorial Index</h2>
              <p className="text-xs text-rose-800 mt-1">{errorMsg}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadEditorialDirectory(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Static Catalog Published Guides Grid */}
      {!loading && !errorMsg && legacyBlogs === null && (
        <>
          {filteredPublished.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <h2 className="text-lg font-extrabold text-slate-900">
                No Matching Verified Guides Found
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
                {search || categoryFilter !== 'all'
                  ? 'No published editorial guide matches your current filter. Clear your filter to view all verified guides.'
                  : 'No verified editorial guides are currently published in the static catalog.'}
              </p>
              {(search || categoryFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('all');
                  }}
                  className="px-4 py-2 bg-[#0B3D91] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPublished.map((article) => (
                <article
                  key={article.slug}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[#0B3D91]/50 transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Published &amp; Verified</span>
                      </span>
                      <span className="text-slate-500 font-medium">
                        Updated {article.updatedDate || article.publicationDate}
                      </span>
                    </div>

                    <h2 className="font-extrabold text-lg text-slate-900 leading-snug">
                      <button
                        type="button"
                        onClick={() => navigate(`/blogs/${article.slug}`)}
                        className="text-left hover:text-[#0B3D91] transition-colors cursor-pointer"
                      >
                        {article.title}
                      </button>
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {article.description}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                      {article.originCountryIso && article.destinationCountryIso && (
                        <span className="bg-blue-50 text-[#0B3D91] border border-blue-100 px-2.5 py-0.5 rounded-md">
                          Corridor: {article.originCountryIso} → {article.destinationCountryIso}
                        </span>
                      )}
                      {article.category && (
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md capitalize">
                          Category: {article.category}
                        </span>
                      )}
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-600" />
                        <span>{article.officialReferences.length} Official HTTPS Source(s)</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-slate-500 truncate">
                      /{article.slug}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/blogs/${article.slug}`)}
                      className="inline-flex items-center gap-1 px-3.5 py-2 bg-[#0B3D91] hover:bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors"
                    >
                      <span>Read Verified Guide</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* Legacy Rollback Grid (ONLY when feature flag disables static catalog) */}
      {!loading && !errorMsg && legacyBlogs !== null && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {legacyBlogs.slice(0, 12).map((blog) => (
            <div
              key={blog.slug}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-3"
            >
              <div>
                <div className="text-xs text-slate-500 font-semibold mb-2">
                  {blog.publishedDate} • {blog.category}
                </div>
                <h2 className="font-extrabold text-base text-slate-900">{blog.title}</h2>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3">{blog.excerpt}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/${blog.slug}`)}
                className="text-xs font-extrabold text-[#0B3D91] hover:underline text-left cursor-pointer"
              >
                Open Guide →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const FeaturedBlogsCarousel: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [articles, setArticles] = useState<EditorialIndexArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isStaticCatalogEnabled('blogsDirectory')) {
      setLoading(false);
      return;
    }
    staticCatalogClient
      .getEditorialIndex()
      .then((res) => {
        if (!active) return;
        if (res.status === 'ok' && res.data) {
          setArticles(res.data.articles);
          setError(false);
        } else if (res.status === 'error') {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Verified Editorial Visa Guides</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Officially sourced, human-verified guides published in the VisaApply.org static catalog (drafts excluded)
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/blogs')}
          className="px-4 py-2 bg-[#0B3D91] hover:bg-[#09327a] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
        >
          View Published Guides ({articles.length}) →
        </button>
      </div>

      {loading && (
        <div aria-busy="true" className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-32 bg-white rounded-2xl border border-slate-200" />
          <div className="h-32 bg-white rounded-2xl border border-slate-200" />
        </div>
      )}

      {!loading && error && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
          Verified editorial guides are temporarily unavailable. Visit the{' '}
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="font-bold text-[#0B3D91] underline cursor-pointer"
          >
            Editorial Directory
          </button>{' '}
          to retry.
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
          No verified editorial guides are currently published. Check back after official verification.
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.slice(0, 4).map((article) => (
            <button
              key={article.slug}
              type="button"
              onClick={() => navigate(`/blogs/${article.slug}`)}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-2">
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    Published • {article.originCountryIso || 'GLOBAL'} → {article.destinationCountryIso || 'INTL'}
                  </span>
                  <span>Updated {article.updatedDate || article.publicationDate}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#0B3D91] line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{article.description}</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#0B3D91]">
                <span className="text-slate-500 font-medium">
                  {article.officialReferences.length} Official HTTPS Reference(s)
                </span>
                <span>Read Verified Guide →</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
