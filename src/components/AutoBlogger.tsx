import React, { useState, useMemo } from 'react';
import {
  GeneratedBlog,
  generateDailyBlogs,
  generateNext10DailyBatch,
  buildBlogForCountryAndTemplate,
  BLOG_TEMPLATES
} from '../data/blogGenerator';
import { NAME_MAP_249, FLAG_MAP_249 } from '../data/fullVisaDatabase';
import { CONTINENT_MAP_249 } from '../data/continentMap';
import { getCountryMeta, getCapitalSlug } from '../data/countryMetaData';
import { generateChecklistPDF } from '../utils/countryLiveUtils';

interface BlogsPageProps {
  navigate: (path: string) => void;
  extraBlogs?: GeneratedBlog[];
  onBlogsAdded?: (newBlogs: GeneratedBlog[]) => void;
}

export const BlogsPage: React.FC<BlogsPageProps> = ({ navigate, extraBlogs = [], onBlogsAdded }) => {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [continentFilter, setContinentFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'readTime'>('latest');
  const [rotationDay, setRotationDay] = useState<number>(0);
  const [customBatches, setCustomBatches] = useState<GeneratedBlog[]>([]);

  const baseBlogs = useMemo(() => {
    const initial = generateDailyBlogs();
    const map = new Map<string, GeneratedBlog>();
    [...customBatches, ...extraBlogs, ...initial].forEach((b) => {
      if (b && b.slug && !map.has(b.slug)) {
        map.set(b.slug, b);
      }
    });
    // If user filters by a specific country not yet in the base list, dynamically generate all 10 templates for that country!
    if (countryFilter !== 'all') {
      for (let t = 0; t < BLOG_TEMPLATES.length; t++) {
        const b = buildBlogForCountryAndTemplate(countryFilter, t);
        if (!map.has(b.slug)) {
          map.set(b.slug, b);
        }
      }
    }
    return Array.from(map.values());
  }, [customBatches, extraBlogs, countryFilter]);

  const handleGenerateNext10 = () => {
    const nextDay = (rotationDay + 1) % 25;
    setRotationDay(nextDay);
    const batch = generateNext10DailyBatch(nextDay);
    setCustomBatches((prev) => [...batch, ...prev]);
    if (onBlogsAdded) onBlogsAdded(batch);
  };

  const filteredBlogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = baseBlogs.filter((b) => {
      if (countryFilter !== 'all' && b.countryCode.toLowerCase() !== countryFilter.toLowerCase()) {
        return false;
      }
      if (categoryFilter !== 'all' && b.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      if (continentFilter !== 'all' && b.continent !== continentFilter) {
        return false;
      }
      if (q) {
        const cName = (NAME_MAP_249[b.countryCode] || '').toLowerCase();
        return (
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          cName.includes(q) ||
          b.countryCode.toLowerCase() === q ||
          b.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'readTime') return parseInt(a.readTime) - parseInt(b.readTime);
      return b.publishedDate.localeCompare(a.publishedDate);
    });
  }, [baseBlogs, search, countryFilter, categoryFilter, continentFilter, sortBy]);

  const allCountryCodes = Object.keys(NAME_MAP_249).sort((a, b) =>
    (NAME_MAP_249[a] || a).localeCompare(NAME_MAP_249[b] || b)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0B3D91] rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold text-blue-200 mb-3">
              <span>🤖 Daily 6:00 AM IST Auto-Blogger Engine • 249 Countries × 10 Templates</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Global Visa Intelligence Blog & 2026 Guides
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl">
              1,500+ word consular guides covering visa fees, VFS processing times, rejection reasons, university admissions, work sponsorship, and interview Q&A across all 249 destinations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleGenerateNext10}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm cursor-pointer transition-colors shadow-md"
            >
              ⚡ Generate Next 10 Daily Blogs (Day {(rotationDay % 25) + 1}/25)
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

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
            <span className="mr-2.5">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 2,490+ visa blog topics (e.g. USA rejection reasons, Schengen processing, Canada work visa)..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none font-medium"
            />
          </div>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
          >
            <option value="all">🌍 All 249 Countries</option>
            {allCountryCodes.map((c) => (
              <option key={c} value={c}>
                {FLAG_MAP_249[c]} {NAME_MAP_249[c]} (10 Guides)
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="tourist">🏖️ Tourist & e-Visa</option>
              <option value="work">💼 Work Permit & Jobs</option>
              <option value="student">🎓 Student & Universities</option>
              <option value="interview">🎤 Interview Q&A</option>
              <option value="embassy">🏛️ Embassy & VFS</option>
              <option value="comparison">⚖️ Country Comparison</option>
            </select>

            <select
              value={continentFilter}
              onChange={(e) => setContinentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">All Continents</option>
              {Object.entries(CONTINENT_MAP_249).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.icon} {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 text-xs font-bold text-blue-700 cursor-pointer"
            >
              <option value="latest">📅 Latest Published</option>
              <option value="views">🔥 Most Viewed</option>
              <option value="readTime">⏱️ Read Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => {
          const code = blog.countryCode.toLowerCase();
          const cName = NAME_MAP_249[code] || code.toUpperCase();
          const flag = FLAG_MAP_249[code] || '🌍';
          const meta = getCountryMeta(code);
          const capSlug = getCapitalSlug(meta.capital);

          return (
            <div
              key={blog.slug}
              onClick={() => navigate(`/${blog.slug}`)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs mb-3">
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0B3D91] font-bold px-2.5 py-1 rounded-lg">
                    <span>{flag}</span>
                    <span className="capitalize">{blog.category}</span>
                  </span>
                  <span className="text-slate-500 font-medium">
                    📅 {blog.publishedDate} • {blog.readTime}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#0B3D91] transition-colors line-clamp-2 leading-snug">
                  {blog.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {blog.excerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {blog.tags.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                    👁️ {blog.views.toLocaleString()} views
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://www.booking.com/city/${code}/${capSlug}.html?aid=8119919&label=blog-${code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#003580] hover:bg-[#002860] text-white px-2.5 py-1 rounded-lg text-[11px] font-bold no-underline transition-colors"
                  >
                    🏨 {meta.hotelPrice}
                  </a>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      generateChecklistPDF({
                        visaName: blog.title,
                        countryName: cName,
                        countryCode: code,
                        processing: meta.processing
                      });
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer"
                  >
                    📄 PDF
                  </button>
                </div>

                <span className="text-xs font-extrabold text-[#0B3D91] group-hover:underline">
                  Read Guide →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const FeaturedBlogsCarousel: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const featured = useMemo(() => generateDailyBlogs().slice(0, 6), []);

  return (
    <div className="mb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>📰 Daily Auto-Blogger Featured Visa Guides (Updated 6:00 AM IST)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            10 new SEO guides generated daily across 249 countries with verified published dates & hotel rates
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/blogs')}
          className="px-4 py-2 bg-[#0B3D91] hover:bg-[#09327a] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
        >
          View All 2,490+ Visa Blogs →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featured.slice(0, 3).map((blog) => {
          const code = blog.countryCode.toLowerCase();
          const flag = FLAG_MAP_249[code] || '🌍';
          return (
            <div
              key={blog.slug}
              onClick={() => navigate(`/${blog.slug}`)}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-2">
                  <span className="bg-blue-50 text-[#0B3D91] px-2 py-0.5 rounded font-bold">
                    {flag} {NAME_MAP_249[code]}
                  </span>
                  <span>📅 {blog.publishedDate} • {blog.readTime}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#0B3D91] line-clamp-2">
                  {blog.title}
                </h4>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#0B3D91]">
                <span className="text-slate-500 font-medium">👁️ {blog.views.toLocaleString()} views</span>
                <span>Read 1,500w Guide →</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
