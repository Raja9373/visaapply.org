import React, { useState } from 'react';
import {
  Globe,
  Shield,
  CheckCircle2,
  XCircle,
  DollarSign,
  Lock,
  FileText,
  Search,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plane,
  Award,
  Users,
  Compass,
  AlertTriangle
} from 'lucide-react';

interface AtlysVsVisaApplyPageProps {
  onNavigate: (path: string) => void;
}

export const AtlysVsVisaApplyPage: React.FC<AtlysVsVisaApplyPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const comparisonRows = [
    {
      feature: 'Service Fee / Agency Markup',
      atlys: '$20 – $60+ extra markup (₹1,500 – ₹5,000+ INR) added per applicant on top of govt fees',
      visaapply: '$0 Service Fee. 100% Free & Open forever. No hidden charges or checkout markups.',
      winner: 'visaapply',
      category: 'Cost'
    },
    {
      feature: 'Country Coverage',
      atlys: '~80 to 100 select countries (mostly e-Visas and popular tourism hubs)',
      visaapply: 'All 249 Countries & Sovereign Territories worldwide (full UN + dependencies)',
      winner: 'visaapply',
      category: 'Coverage'
    },
    {
      feature: 'Bilateral Route Matrix',
      atlys: 'Limited originating countries (primarily India, US, UAE)',
      visaapply: '61,752 Any-to-Any Routes (249 origins × 248 destinations)',
      winner: 'visaapply',
      category: 'Coverage'
    },
    {
      feature: 'Visa Categories Covered',
      atlys: 'Mostly Tourist & Business e-Visas (single/double entry)',
      visaapply: '14,084+ Visas across 6 categories: Tourist, Business, Work, Student, Family, PR',
      winner: 'visaapply',
      category: 'Database'
    },
    {
      feature: 'Application Submission Model',
      atlys: 'Third-party commercial intermediary submitting on applicant’s behalf',
      visaapply: 'Direct official links to official government portals (USCIS, CEAC, UKVI, IRCC, VFS Global)',
      winner: 'visaapply',
      category: 'Official Access'
    },
    {
      feature: 'Document Handling & Privacy',
      atlys: 'Requires uploading full passport scans, personal photos & bank statements to private servers',
      visaapply: 'Zero PII stored. No passport uploads. You apply directly with the official sovereign government.',
      winner: 'visaapply',
      category: 'Privacy'
    },
    {
      feature: 'In-Person Embassy Interviews & Biometrics',
      atlys: 'Cannot attend interviews or biometrics for US B1/B2, UK Visitor, Canada, or Schengen',
      visaapply: 'Full Consular Mock Interview Simulator (20 official questions, ideal answers & scoring)',
      winner: 'visaapply',
      category: 'Preparation'
    },
    {
      feature: 'Government Policy Auto-Sync',
      atlys: 'Proprietary manual updates by internal catalog teams',
      visaapply: 'Daily 3:00 AM IST automated sync tracking policy & fee shifts across 249 official gov portals',
      winner: 'visaapply',
      category: 'Intelligence'
    },
    {
      feature: 'Free Downloadable Document Checklists',
      atlys: 'Gated inside application flow behind mandatory sign-up',
      visaapply: 'Instant, free downloadable PDF checklists for all 249 bilateral routes without registration',
      winner: 'visaapply',
      category: 'Tools'
    },
    {
      feature: 'Language Accessibility',
      atlys: 'Primarily English with limited locale coverage',
      visaapply: '10 Native Languages (English, Hindi, Arabic, French, German, Spanish, Polish, Russian, Chinese, Japanese)',
      winner: 'visaapply',
      category: 'Accessibility'
    },
    {
      feature: 'Travel Ecosystem & Logistics',
      atlys: 'Standalone visa application app',
      visaapply: 'Complete travel intelligence: Live currency rates, local time/weather, flights & hotels',
      winner: 'visaapply',
      category: 'Ecosystem'
    },
    {
      feature: 'Account & App Download Requirement',
      atlys: 'Requires mobile app download or account creation with phone/OTP',
      visaapply: 'No app download required. Instant browser access across all desktop & mobile devices.',
      winner: 'visaapply',
      category: 'Convenience'
    }
  ];

  const faqs = [
    {
      q: 'How does VisaApply.org compare to Atlys?',
      a: 'Atlys is a commercial visa agency app that charges a service fee ($20–$60+ per applicant) to fill and submit e-visa forms on your behalf. VisaApply.org is an open, 100% free global visa intelligence portal covering all 249 countries and 14,084+ visas. We provide official government application links, step-by-step guidance, free document checklists, and consular interview simulators with $0 service fees.'
    },
    {
      q: 'Why should I apply directly through official government portals instead of an agency app?',
      a: 'Applying directly saves you money (no agency service fee or markup) and protects your personal data. Official sovereign portals (such as USCIS, CEAC, UKVI, IRCC, or official government e-visa portals) are the ultimate authorities that issue visas. Third-party apps cannot guarantee visa issuance or bypass official government review.'
    },
    {
      q: 'Does Atlys cover all visas and countries?',
      a: 'No. Atlys focuses primarily on e-visas for approximately 80 to 100 popular tourist destinations. It does not cover in-person embassy visa interviews, long-term work permits, international student visas, family reunification, or permanent residency for all 249 countries and territories. VisaApply.org indexes 14,084+ visa subclasses worldwide.'
    },
    {
      q: 'Is my personal data safer on VisaApply.org?',
      a: 'Yes. VisaApply.org has a strict Zero-PII policy: we never ask you to upload your passport copy, photographs, bank statements, or Aadhaar/national ID to our servers. You review requirements on VisaApply.org and submit documents solely on official sovereign government websites.'
    },
    {
      q: 'Can Atlys waive consular interviews for US, UK, or Schengen visas?',
      a: 'No. Foreign governments (such as the US Department of State, UK Visas and Immigration, or Schengen consulates) legally mandate biometrics and in-person interviews for certain visa classes. No commercial service can waive or attend these for you. VisaApply.org provides an interactive Consular Mock Interview simulator to prepare you with 20 real interview questions and winning answers.'
    },
    {
      q: 'How does VisaApply.org remain free without charging application fees?',
      a: 'VisaApply.org operates on an open-access model supported by transparent affiliate travel partnerships (such as Booking.com hotel reservations and flight search) and advertising. We never charge users for visa information, checklists, or government portal links.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button onClick={() => onNavigate('/')} className="hover:text-[#0B3D91] transition-colors cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-slate-400">Compare</span>
            <span>/</span>
            <span className="text-slate-900 font-bold">Atlys vs VisaApply.org</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#0B3D91] via-[#09327a] to-[#072559] text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs text-blue-200 font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>2026 Independent Platform Comparison</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight balance">
            Atlys vs VisaApply.org: Complete 2026 Breakdown
          </h1>

          <p className="text-blue-100 text-base sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
            Comparing commercial third-party visa agencies charging service markups against VisaApply.org’s 100% free, direct-to-government global visa intelligence across 249 countries, privacy standards, and 14,084+ official visa categories.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-6 text-left">
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-4 rounded-xl">
              <span className="text-xs text-blue-200 block font-medium">Service Fees</span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                $0 vs $20–$60+
              </span>
              <span className="text-[11px] text-emerald-300 font-bold mt-1 block">VisaApply is 100% Free</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-4 rounded-xl">
              <span className="text-xs text-blue-200 block font-medium">Countries Indexed</span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                249 vs ~80
              </span>
              <span className="text-[11px] text-cyan-300 font-bold mt-1 block">3x Global Coverage</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-4 rounded-xl">
              <span className="text-xs text-blue-200 block font-medium">Official Visas</span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                14,084+ Visas
              </span>
              <span className="text-[11px] text-amber-300 font-bold mt-1 block">Tourist, Work, Study, PR</span>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-4 rounded-xl">
              <span className="text-xs text-blue-200 block font-medium">Personal Data Upload</span>
              <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                Zero PII Stored
              </span>
              <span className="text-[11px] text-emerald-300 font-bold mt-1 block">Direct Govt Privacy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        {/* Quick Verdict Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Atlys Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Commercial Agency App
                </span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                  Charges Agency Markup
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Atlys</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Atlys is a venture-backed commercial mobile application designed as a paid concierge service. It collects user documents and submits standard e-visas on the applicant’s behalf for approximately 80 to 100 destinations.
              </p>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">⚠️</span>
                  <span><strong>Extra Cost:</strong> Charges $20 to $60+ (₹1,500 – ₹5,000+ INR) convenience markup per traveler.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">⚠️</span>
                  <span><strong>Limited Catalog:</strong> Mostly covers basic e-visas; excludes complex work, study, or consular visas.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">⚠️</span>
                  <span><strong>Private Document Storage:</strong> Requires storing your passport scans and photos on third-party servers.</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              Best suited for travelers who prefer a third-party paid service for quick e-visas and do not mind paying extra service fees.
            </div>
          </div>

          {/* VisaApply.org Card */}
          <div className="bg-gradient-to-br from-blue-900 to-[#0B3D91] text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-blue-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-3 py-1 rounded-full">
                  Official Open Portal
                </span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-md">
                  100% Free Forever
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">VisaApply.org</h2>
              <p className="text-sm text-blue-100 leading-relaxed mb-4">
                VisaApply.org is an independent global visa and consular intelligence portal providing step-by-step guides, direct links to 249 official sovereign government portals, free PDF checklists, and consular interview simulators with $0 service fees.
              </p>
              <div className="space-y-2 text-xs text-blue-100">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>$0 Markup:</strong> No service fees or checkout markups. You pay only official sovereign government fees.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Complete Scale:</strong> 249 Countries & Territories, 14,084+ Visas, and 61,752 bilateral Any-to-Any routes.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Privacy First:</strong> Zero document uploads. No passport copies or financial statements stored.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Mock Interview Simulator:</strong> Interactive practice for US, UK, Schengen consular appointments.</span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/15 text-xs text-blue-200">
              Best suited for all travelers, students, workers, and expats who want direct government applications, zero fees, and total privacy.
            </div>
          </div>
        </section>

        {/* Detailed Comparison Table */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Detailed Feature-by-Feature Comparison
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Side-by-side technical evaluation across cost, coverage, privacy, and consular intelligence.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-1/4">Feature / Metric</th>
                  <th className="py-3.5 px-4 w-3/8 text-slate-700">Atlys (Commercial App)</th>
                  <th className="py-3.5 px-4 w-3/8 text-[#0B3D91] bg-blue-50/70">VisaApply.org (Open Portal)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {comparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 align-top">
                      <div>{row.feature}</div>
                      <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 text-xs sm:text-sm leading-relaxed align-top">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span>{row.atlys}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-900 text-xs sm:text-sm leading-relaxed align-top bg-blue-50/40">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium text-[#09327a]">{row.visaapply}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Deep Dive Insights */}
        <section className="space-y-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Key Strategic Differences Explained
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Why thousands of travelers choose direct official applications over commercial agency intermediaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">Zero Service Fee Guarantee</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Agency apps mark up visas with convenience charges between $20 and $60+ (₹1,500 – ₹5,000+ INR) per person. For a family of four traveling to Dubai or Vietnam, agency fees can add ₹12,000 to ₹20,000+ in unnecessary markup. VisaApply.org connects you directly with official sovereign immigration systems at true government price.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0B3D91] flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">Zero-PII Privacy Protection</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Commercial apps require storing high-resolution passport scans, biometric facial captures, bank statements, and employment proof on commercial cloud servers. VisaApply.org never collects or stores personal identification data. Your documents go straight to official embassy databases.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">14,084+ Visas vs e-Visas Only</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Most agency platforms only process straightforward tourist e-visas. When you need a German EU Blue Card, Canadian Express Entry PR, US F-1 Student or H-1B Work Visa, or UK Skilled Worker Permit, agency apps cannot help. VisaApply.org covers all 6 visa categories across 249 nations.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Comparison Scenario Box */}
        <section className="bg-gradient-to-r from-slate-900 to-[#0B3D91] text-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <span>Real-World Cost Comparison</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Cost Example: Family of 4 Applying for Dubai (UAE) 30-Day Tourist Visa
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/10 p-4 rounded-xl border border-white/15">
                <div className="text-xs text-slate-300 font-semibold">Using Commercial Agency Apps</div>
                <div className="text-2xl font-black text-amber-300 mt-1">₹32,000 – ₹38,000 INR</div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Includes ₹6,500 govt fee + ₹2,000–₹3,000 agency service fee per person + processing handling fees × 4 applicants.
                </p>
              </div>

              <div className="bg-white/10 p-4 rounded-xl border border-white/15">
                <div className="text-xs text-emerald-300 font-semibold">Using VisaApply.org Official Guide</div>
                <div className="text-2xl font-black text-emerald-300 mt-1">₹26,000 INR (Save ₹6,000–₹12,000+)</div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Direct official application on GDRFA / ICP portals. You pay strictly official government fees with $0 markup.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#0B3D91]" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Clear answers regarding visa agency apps, official government portals, and application safety.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left font-bold text-slate-900 bg-slate-50/60 hover:bg-slate-100 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                  >
                    <span className="text-sm sm:text-base">{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-[#0B3D91] shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Explore */}
        <section className="bg-gradient-to-r from-blue-900 to-[#0B3D91] text-white p-8 sm:p-10 rounded-2xl shadow-xl text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Explore Official Visas for 249 Countries?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto">
            Check official visa fees, download checklists, and access direct sovereign government portals for 61,752 bilateral routes with $0 service fees.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/')}
              className="px-6 py-3.5 bg-white text-[#0B3D91] font-bold rounded-xl text-sm shadow-md hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Explore 249 Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/routes')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              Browse 61,752 Routes
            </button>
            <button
              onClick={() => onNavigate('/interview-prep/us')}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl text-sm transition-all cursor-pointer"
            >
              Consular Interview Prep
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
