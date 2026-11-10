import React from 'react';
import { Globe, ArrowRight, Sparkles } from 'lucide-react';

interface GlobalImmigrationPromoSectionProps {
  onNavigate: (path: string) => void;
  className?: string;
}

export const GlobalImmigrationPromoSection: React.FC<GlobalImmigrationPromoSectionProps> = ({
  onNavigate,
  className = ''
}) => {
  const categories = [
    {
      id: 'pr',
      urlParam: 'permanent-residency',
      name: 'Permanent Residency',
      icon: '🏠',
      desc: 'Sovereign PR permits, points systems, and settlement pathways across 249 countries.',
      badge: 'PR Pathways',
      cta: 'Explore PR Countries'
    },
    {
      id: 'citizenship',
      urlParam: 'citizenship',
      name: 'Citizenship & Naturalization',
      icon: '🛂',
      desc: 'Naturalization timelines, dual citizenship laws, and statutory passport acquisition.',
      badge: 'Citizenship',
      cta: 'Explore Citizenship Options'
    },
    {
      id: 'work',
      urlParam: 'work',
      name: 'Work Immigration',
      icon: '💼',
      desc: 'Skilled worker visas, employer sponsorships, and job seeker opportunity permits.',
      badge: 'Work Permits',
      cta: 'Explore Work Immigration'
    },
    {
      id: 'family',
      urlParam: 'family',
      name: 'Family Immigration',
      icon: '👨‍👩‍👧‍👦',
      desc: 'Spouse visas, dependent children, and parent sponsorships worldwide.',
      badge: 'Family Reunion',
      cta: 'Explore Family Immigration'
    },
    {
      id: 'business',
      urlParam: 'business-investor',
      name: 'Business & Investor Immigration',
      icon: '📈',
      desc: 'Investor visas, startup entrepreneur permits, and sovereign Golden Visas.',
      badge: 'Investment PR',
      cta: 'Explore Investor Routes'
    },
    {
      id: 'digital_nomad',
      urlParam: 'digital-nomad-retirement',
      name: 'Digital Nomad & Retirement Residency',
      icon: '🌴',
      desc: 'Remote work permits, freelancer visas, and self-funded retirement residency.',
      badge: 'Remote & Retire',
      cta: 'Explore Digital Nomad Options'
    }
  ];

  return (
    <section className={`w-full bg-gradient-to-b from-slate-900 via-[#0B2A5B] to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-blue-500/30 overflow-hidden relative ${className}`}>
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide uppercase">
            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>249 Countries | 6 Immigration Categories</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight balance">
            Global Immigration &amp; Residency Hub
          </h2>

          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
            Explore Permanent Residency, Citizenship, Work Permits, Family Immigration, Business Immigration and Digital Nomad pathways across 249 countries.
          </p>
        </div>

        {/* 6 Clickable Category Cards with Unique Destinations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate(`/immigration?category=${cat.urlParam}`)}
              className="bg-white/10 hover:bg-white/15 border border-white/15 hover:border-emerald-400/50 rounded-2xl p-5 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 bg-white/10 rounded-xl">{cat.icon}</span>
                  <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    {cat.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {cat.name}
                </h3>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-300 group-hover:text-emerald-200">
                <span>{cat.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Prominent CTA Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <button
            type="button"
            onClick={() => onNavigate('/immigration')}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-950 shrink-0" />
            <span>Explore All 249 Country Immigration Hubs</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
