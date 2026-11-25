import React from 'react';
import { Globe, ArrowRight, Sparkles } from 'lucide-react';
import {
  IMMIGRATION_HUB_PROMO_CATEGORIES,
  buildImmigrationHubUrl,
} from '../config/immigrationCategories';

interface GlobalImmigrationPromoSectionProps {
  onNavigate: (path: string) => void;
  className?: string;
}

export const GlobalImmigrationPromoSection: React.FC<GlobalImmigrationPromoSectionProps> = ({
  onNavigate,
  className = '',
}) => {
  return (
    <section
      aria-labelledby="global-immigration-hub-heading"
      className={`w-full bg-gradient-to-b from-slate-900 via-[#0B2A5B] to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-blue-500/30 overflow-hidden relative ${className}`}
    >
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 space-y-8">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide uppercase">
            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>249 Countries | 6 Immigration Categories</span>
          </div>

          <h2 id="global-immigration-hub-heading" className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight balance">
            Global Immigration &amp; Residency Hub
          </h2>

          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
            Explore Permanent Residency, Citizenship, Work Permits, Family Immigration, Business Immigration and Digital Nomad pathways across 249 countries.
          </p>
        </div>

        {/* 6 Clickable Category Cards Using Canonical Category URLs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {IMMIGRATION_HUB_PROMO_CATEGORIES.map((cat) => {
            const targetUrl = buildImmigrationHubUrl(cat.id);
            return (
              <a
                key={cat.id}
                href={targetUrl}
                data-category-id={cat.id}
                data-category-slug={cat.slug}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                    return;
                  }
                  e.preventDefault();
                  onNavigate(targetUrl);
                }}
                className="w-full text-left bg-white/10 hover:bg-white/15 border border-white/15 hover:border-emerald-400/50 rounded-2xl p-5 transition-all duration-200 cursor-pointer group flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 bg-white/10 rounded-xl" aria-hidden="true">
                      {cat.icon}
                    </span>
                    <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {cat.cardTitle}
                  </h3>

                  <p className="text-xs text-slate-200 leading-relaxed">{cat.cardDescription}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 w-full flex items-center justify-between text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                  <span>{cat.cardCta}</span>
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </div>
              </a>
            );
          })}
        </div>

        {/* Main Prominent CTA Link */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <a
            href="/immigration"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
                return;
              }
              e.preventDefault();
              onNavigate('/immigration');
            }}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <Sparkles className="w-5 h-5 text-amber-950 shrink-0" aria-hidden="true" />
            <span>Explore All 249 Country Immigration Hubs</span>
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};
