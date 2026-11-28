import React, { useEffect } from 'react';
import { AlertTriangle, Compass, Globe, ArrowLeft, Scale, BookOpen, Map } from 'lucide-react';
import { applySeoMetadataToDom } from '../utils/seoMetadataManager';

interface NotFoundPageProps {
  requestedPath: string;
  navigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ requestedPath, navigate }) => {
  useEffect(() => {
    applySeoMetadataToDom(
      {
        title: '404 – Page Not Found | VisaApply.org',
        description:
          'The requested page could not be found on VisaApply.org. Browse verified official visa guides, immigration hubs, and free planning tools.',
        noindex: true,
      },
      requestedPath || '/404'
    );
    if (typeof document !== 'undefined') {
      const can = document.querySelector('link[rel="canonical"]');
      if (can) can.remove();
    }
  }, [requestedPath]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <section
        role="region"
        aria-labelledby="not-found-page-heading"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-4">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          <span>HTTP 404 • Page Not Found</span>
        </div>

        <h1
          id="not-found-page-heading"
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
        >
          404 – Page Not Found
        </h1>

        <p className="mt-3 text-slate-600 text-base leading-relaxed">
          The page <code className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 text-sm">{requestedPath || '/'}</code>{' '}
          could not be found on VisaApply.org. It may have moved, never existed, or correspond to an unverified route.
        </p>

        <p className="mt-2 text-xs text-slate-500">
          VisaApply.org is an independent informational portal and is not affiliated with any government, embassy, or VFS Global.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B3D91] hover:bg-[#082e6d] text-white text-sm font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Home</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/immigration')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4" aria-hidden="true" />
            <span>Global Immigration Hub</span>
          </button>
        </div>

        <nav aria-label="Verified VisaApply.org destinations" className="mt-8 pt-6 border-t border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Popular Verified Sections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/immigration"
              onClick={(e) => {
                e.preventDefault();
                navigate('/immigration');
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
            >
              <Globe className="w-5 h-5 text-[#0B3D91] shrink-0" aria-hidden="true" />
              <div>
                <div className="font-bold text-sm text-slate-900">Global Immigration Hub</div>
                <div className="text-xs text-slate-500">Official verified countries &amp; pathways</div>
              </div>
            </a>
            <a
              href="/routes"
              onClick={(e) => {
                e.preventDefault();
                navigate('/routes');
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
            >
              <Compass className="w-5 h-5 text-[#0B3D91] shrink-0" aria-hidden="true" />
              <div>
                <div className="font-bold text-sm text-slate-900">Bilateral Visa Routes</div>
                <div className="text-xs text-slate-500">Check passport-to-destination requirements</div>
              </div>
            </a>
            <a
              href="/tools/visa-comparison"
              onClick={(e) => {
                e.preventDefault();
                navigate('/tools/visa-comparison');
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
            >
              <Scale className="w-5 h-5 text-[#0B3D91] shrink-0" aria-hidden="true" />
              <div>
                <div className="font-bold text-sm text-slate-900">Visa Comparison Tool</div>
                <div className="text-xs text-slate-500">Compare official pathways side by side</div>
              </div>
            </a>
            <a
              href="/blogs"
              onClick={(e) => {
                e.preventDefault();
                navigate('/blogs');
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-[#0B3D91] shrink-0" aria-hidden="true" />
              <div>
                <div className="font-bold text-sm text-slate-900">Visa Guides &amp; Blogs</div>
                <div className="text-xs text-slate-500">Official checklists &amp; consular guidance</div>
              </div>
            </a>
            <a
              href="/sitemap"
              onClick={(e) => {
                e.preventDefault();
                navigate('/sitemap');
              }}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-colors sm:col-span-2"
            >
              <Map className="w-5 h-5 text-[#0B3D91] shrink-0" aria-hidden="true" />
              <div>
                <div className="font-bold text-sm text-slate-900">HTML Sitemap Directory</div>
                <div className="text-xs text-slate-500">Browse all verified pages and country hubs</div>
              </div>
            </a>
          </div>
        </nav>
      </section>
    </div>
  );
};
