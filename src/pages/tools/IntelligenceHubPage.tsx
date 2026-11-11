import React, { useState } from 'react';
import { Compass, Globe, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Search, Calculator, Calendar, FileText, Clock, UserCheck, Users, Layers, ExternalLink } from 'lucide-react';
import { SUPPORTED_LANGUAGES_10, SupportedLangCode } from '../../i18n/config';
import { getUIString } from '../../utils/autoLanguage';

interface IntelligenceHubPageProps {
  onNavigate: (path: string) => void;
}

export const IntelligenceHubPage: React.FC<IntelligenceHubPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [uiLang, setUiLang] = useState<SupportedLangCode>('en');
  const ui = getUIString(uiLang);

  const toolsList = [
    {
      title: 'Advanced Eligibility Checker',
      desc: 'Evaluate core eligibility against verified consular criteria (Sections s05, s07, s09, s28).',
      path: '/tools/eligibility-checker',
      icon: '✅',
      category: 'Assessment'
    },
    {
      title: 'Family Visa Planner',
      desc: 'Assess spouse, children and dependent parents with family fee caps and maintenance rules.',
      path: '/tools/family-planner',
      icon: '👨‍👩‍👧‍👦',
      category: 'Planning'
    },
    {
      title: 'Advanced Visa Comparison',
      desc: 'Compare up to 5 consular programs across 10 statutory dimensions.',
      path: '/tools/visa-comparison',
      icon: '⚖️',
      category: 'Intelligence'
    },
    {
      title: 'Visa Cost Calculator',
      desc: 'Calculate official government fees, VAC charges and optional expenses with family caps.',
      path: '/tools/cost-calculator',
      icon: '💵',
      category: 'Financial'
    },
    {
      title: 'Proof of Funds Calculator',
      desc: 'Verify statutory maintenance balances and sponsor sufficiency.',
      path: '/tools/funds-calculator',
      icon: '🏦',
      category: 'Financial'
    },
    {
      title: 'Visa Stay & Expiry Calculator',
      desc: 'Calculate Schengen 90/180 rolling presence and visa validity expiry.',
      path: '/tools/stay-calculator',
      icon: '⏳',
      category: 'Compliance'
    },
    {
      title: 'Visa Readiness Checker',
      desc: 'Evaluate 5 assessment pillars and honest statutory outcomes.',
      path: '/tools/readiness-checker',
      icon: '🛡️',
      category: 'Assessment'
    },
    {
      title: 'Visa Timeline Planner',
      desc: 'Map consular processing windows and applicant milestones.',
      path: '/tools/timeline-planner',
      icon: '📅',
      category: 'Planning'
    },
    {
      title: 'Smart Document Checklist',
      desc: 'Interactive evidence vault with requirement classifications and PDF export.',
      path: '/tools/document-checklist',
      icon: '📋',
      category: 'Evidence'
    },
    {
      title: 'Public Source Verifier',
      desc: 'Inspect official consular URLs, issuing authorities and evidence statuses.',
      path: '/tools/source-verifier',
      icon: '🌐',
      category: 'Governance'
    }
  ];

  const filteredTools = toolsList.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-[#0B3D91] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-xs sm:text-sm font-medium mb-3 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to VisaApply.org Home
            </button>
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <Compass className="w-7 h-7 text-blue-200" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Global Immigration Intelligence Hub</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1.5">
                  Unified discovery portal connecting all 10 verified applicant tools, calculators, and statutory evidence directories.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 px-5 py-4 rounded-2xl backdrop-blur-sm text-right shrink-0">
            <span className="text-xs text-blue-200 font-semibold block uppercase tracking-wider">Intelligence Suite</span>
            <span className="text-2xl font-black text-white">10 Verified Tools</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search intelligence tools, calculators, or categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
            />
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.path}
              onClick={() => onNavigate(tool.path)}
              className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-[#0B3D91] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{tool.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#0B3D91] px-2.5 py-1 rounded-full border border-blue-200">
                    {tool.category}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-[#0B3D91] transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0B3D91]">
                <span>Launch Tool</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default IntelligenceHubPage;
