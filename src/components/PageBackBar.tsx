import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

interface PageBackBarProps {
  onNavigate: (path: string) => void;
  pageName: string;
  category?: string;
}

export const PageBackBar: React.FC<PageBackBarProps> = ({
  onNavigate,
  pageName,
  category = 'Services'
}) => {
  const [showFloatingPill, setShowFloatingPill] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowFloatingPill(true);
      } else {
        setShowFloatingPill(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Floating Sticky Mobile Pill */}
      {showFloatingPill && (
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="fixed top-20 left-3 z-40 lg:hidden bg-slate-900/90 text-white px-3 py-1.5 rounded-full shadow-xl border border-slate-700 flex items-center gap-1.5 text-xs font-extrabold backdrop-blur-md cursor-pointer animate-fade-in"
          title="Back to Home"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
          <span>Home</span>
        </button>
      )}

      {/* Top Back Bar & Breadcrumb */}
      <div className="w-full bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          {/* Left: Back Button */}
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 bg-[#0B3D91] hover:bg-[#082e6d] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          {/* Right: Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hover:text-[#0B3D91] flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-600 font-semibold">{category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[#0B3D91] font-bold truncate">{pageName}</span>
          </div>
        </div>
      </div>
    </>
  );
};

interface PageBottomBackProps {
  onNavigate: (path: string) => void;
}

export const PageBottomBack: React.FC<PageBottomBackProps> = ({ onNavigate }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center border-t border-slate-200 mt-12">
      <button
        type="button"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          onNavigate('/');
        }}
        className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0B3D91] to-blue-900 hover:from-[#082e6d] hover:to-blue-950 text-white px-8 py-4 rounded-2xl text-base font-black shadow-lg hover:shadow-xl transition-all cursor-pointer group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>← Back to Homepage - Explore 249 Countries</span>
      </button>
    </div>
  );
};
