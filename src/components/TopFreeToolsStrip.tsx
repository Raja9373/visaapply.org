import React from 'react';
import { Plane, FileText, Bell, Camera, Sparkles } from 'lucide-react';

interface TopFreeToolsStripProps {
  onNavigate: (path: string) => void;
  className?: string;
  theme?: 'dark' | 'light';
}

export const TopFreeToolsStrip: React.FC<TopFreeToolsStripProps> = ({ 
  onNavigate, 
  className = '',
  theme = 'dark'
}) => {
  const tools = [
    {
      title: 'Visa Cost Calculator',
      shortTitle: 'Cost Calculator',
      icon: '💵',
      path: '/tools/cost-calculator',
      badge: 'NEW',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      subText: 'Calculate Govt & Total Fees'
    },
    {
      title: 'Proof of Funds Calculator',
      shortTitle: 'Funds Calculator',
      icon: '🏦',
      path: '/tools/funds-calculator',
      badge: 'NEW',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
      subText: 'Statutory Balance Check'
    },
    {
      title: 'Visa Timeline Planner',
      shortTitle: 'Timeline Planner',
      icon: '📅',
      path: '/tools/timeline-planner',
      badge: 'NEW',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
      subText: 'Milestone Roadmap'
    },
    {
      title: 'Smart Document Checklist',
      shortTitle: 'Document Checklist',
      icon: '📋',
      path: '/tools/document-checklist',
      badge: 'NEW',
      badgeColor: 'bg-amber-500/25 text-amber-300 border-amber-400/40',
      subText: 'Interactive Evidence Vault'
    }
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`w-full max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-3 ${className}`}>
      {/* Header Label */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 text-sm">✨</span>
          <h3 className={`text-xs sm:text-sm font-extrabold tracking-wide uppercase ${isDark ? 'text-amber-300' : 'text-slate-800'}`}>
            FREE Tools - Everything You Need For Your Visa
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            ✨ Real Visa Names - No Duplicates
          </span>
          <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${
            isDark ? 'bg-white/10 text-blue-200 border border-white/15' : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            100% Free • No Login
          </span>
        </div>
      </div>

      {/* 4 Compact Cards: 2x2 grid on mobile, 1 row (4 cols) on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {tools.map((t) => (
          <button
            key={t.path}
            type="button"
            onClick={() => onNavigate(t.path)}
            className={`group text-left p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 ${
              isDark
                ? 'bg-white/10 hover:bg-white/15 border-white/20 hover:border-amber-400/50 shadow-sm backdrop-blur-sm'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-[#0B3D91]/40 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-1 mb-1.5">
              <span className="text-base sm:text-lg shrink-0 group-hover:scale-110 transition-transform">
                {t.icon}
              </span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${t.badgeColor}`}>
                {t.badge}
              </span>
            </div>
            <div>
              <div className={`text-xs sm:text-sm font-extrabold truncate ${isDark ? 'text-white group-hover:text-amber-200' : 'text-slate-900 group-hover:text-[#0B3D91]'}`}>
                <span className="hidden sm:inline">{t.title}</span>
                <span className="sm:hidden">{t.shortTitle}</span>
              </div>
              <span className={`text-[10px] flex items-center gap-1 font-semibold mt-0.5 ${isDark ? 'text-blue-200 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-800'}`}>
                <span>{t.subText}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
