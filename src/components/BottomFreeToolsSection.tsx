import React from 'react';
import { Plane, FileText, Bell, Camera, ArrowRight, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

interface BottomFreeToolsSectionProps {
  onNavigate: (path: string) => void;
}

export const BottomFreeToolsSection: React.FC<BottomFreeToolsSectionProps> = ({ onNavigate }) => {
  const detailedTools = [
    {
      title: 'Dummy Ticket & Hotel Reservation',
      subtitle: 'Temporary Itinerary for Visa Applications',
      icon: '✈️',
      path: '/dummy-ticket',
      badge: '100% FREE',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Official verifiable flight and hotel reservations with authentic airline GDS PNR and booking ID. Accepted by Schengen, UK, US, Canada, and Asian consulates without purchasing expensive real tickets.',
      features: [
        'Sample PDF & Checklist Download',
        'Valid 7–14 days for consular scrutiny',
        '100 Daily custom reservations FREE',
        'Zero payment or checkout required'
      ],
      ctaText: 'Open Dummy Ticket Tool'
    },
    {
      title: 'Free Cover Letter Generator',
      subtitle: 'Embassy-Grade Visa Application Letter',
      icon: '📄',
      path: '/cover-letter-generator',
      badge: '100% FREE',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      description: 'Automatically generate a formal, legally structured visa cover letter tailored to your specific destination embassy. Clearly declares trip purpose, financial solvency, and deep ties to India.',
      features: [
        'Instant A4 PDF Download (jsPDF)',
        'One-click copy to Word or Google Docs',
        'Customized for Tourist, Business & Student',
        'Built-in ties to home country guarantee'
      ],
      ctaText: 'Generate Cover Letter'
    },
    {
      title: 'Embassy Slot Alert (USA / Schengen)',
      subtitle: 'Instant Email Notifications',
      icon: '🔔',
      path: '/embassy-slot-alert',
      badge: 'FREE',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      description: 'Automated 24/7 server monitoring for appointment slots and cancellations across global Consulates and VFS hubs.',
      features: [
        'Instant email alert within 30 minutes',
        'Global coverage across all 249 countries',
        'Zero login password or portal credentials required',
        '100% Free alert for all applicants'
      ],
      ctaText: 'Activate Free Slot Alert'
    },
    {
      title: 'Visa Photo Resizer (300 DPI)',
      subtitle: 'Free Online Consular Photo Cropper',
      icon: '📷',
      path: '/photo-resizer',
      badge: '100% FREE',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      description: 'Crop, straighten, and resize your photo to exact consular specifications: 35x45mm (Schengen/UK), 2x2 inch (USA DS-160), or 51x51mm passport size. Runs 100% client-side with complete privacy.',
      features: [
        '300 DPI High-Clarity JPG Export',
        'Interactive 70–80% Face Biometric Oval Guide',
        'Zero server upload (100% private in browser)',
        'Pure white background compliant rendering'
      ],
      ctaText: 'Resize Photo Free'
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#0B3D91]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Full Services Suite • 100% Free Tools</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Complete Free Visa Tools &amp; Services
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Everything you need for a successful visa application—itinerary reservations, cover letters, consular slot notifications, and 300 DPI photo tools. Zero fees, no checkout.
        </p>
      </div>

      {/* 4 Big Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {detailedTools.map((tool) => (
          <div
            key={tool.path}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-3 bg-slate-50 rounded-2xl border border-slate-100 shrink-0">
                    {tool.icon}
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">
                      {tool.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {tool.subtitle}
                    </p>
                  </div>
                </div>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${tool.badgeColor}`}>
                  {tool.badge}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                {tool.description}
              </p>

              {/* Feature Checklist */}
              <ul className="space-y-2 mb-8">
                {tool.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              onClick={() => onNavigate(tool.path)}
              className="w-full py-3.5 px-6 bg-[#0B3D91] hover:bg-[#082e6d] text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{tool.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
