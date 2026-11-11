import React, { useState } from 'react';
import { Calendar, Clock, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, FileText, Download, Share2, Info, Plane, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES_10, SupportedLangCode } from '../../i18n/config';
import { getUIString } from '../../utils/autoLanguage';

interface TimelinePlannerPageProps {
  onNavigate: (path: string) => void;
}

interface Milestone {
  id: string;
  category: 'OFFICIAL_PROCESSING_TIME' | 'OFFICIAL_APPLICATION_WINDOW' | 'APPLICANT_ACTION_ESTIMATE' | 'THIRD_PARTY_APPOINTMENT_ESTIMATE' | 'AWAITING_OFFICIAL_VERIFICATION';
  title: string;
  recommendedWindow: string;
  description: string;
  statutoryBasis: string;
  isVerified: boolean;
  completed: boolean;
  notes: string;
}

export const TimelinePlannerPage: React.FC<TimelinePlannerPageProps> = ({ onNavigate }) => {
  const [destination, setDestination] = useState('US');
  const [visaCategory, setVisaCategory] = useState('B1/B2 Tourist / Visitor Visa');
  const [targetTravelDate, setTargetTravelDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split('T')[0];
  });
  const [uiLang, setUiLang] = useState<SupportedLangCode>('en');
  const ui = getUIString(uiLang);

  // Milestone check state
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 'm1',
      category: 'APPLICANT_ACTION_ESTIMATE',
      title: 'Passport Validity & Civil Document Audit',
      recommendedWindow: '90 - 120 Days Before Travel',
      description: 'Audit passport expiry (must be valid at least 6 months beyond intended departure), gather birth/marriage certificates and digital photo.',
      statutoryBasis: 'Consular Document Standards & Immigration Act',
      isVerified: true,
      completed: false,
      notes: ''
    },
    {
      id: 'm2',
      category: 'APPLICANT_ACTION_ESTIMATE',
      title: 'Financial Statement & Proof of Funds Assembly',
      recommendedWindow: '60 - 90 Days Before Travel',
      description: 'Compile last 3-6 months bank statements, ITR / tax assessment notices, salary certificates and employment confirmation letters.',
      statutoryBasis: 'Statutory Maintenance & Sufficiency Rules',
      isVerified: true,
      completed: false,
      notes: ''
    },
    {
      id: 'm3',
      category: 'OFFICIAL_APPLICATION_WINDOW',
      title: 'Online Application Form & Fee Remittance (DS-160 / VAF / IRCC)',
      recommendedWindow: '45 - 60 Days Before Travel',
      description: 'Complete official government visa application portal questionnaire, upload digital photo and remit mandatory consular fees.',
      statutoryBasis: 'Consular Processing Protocol & Fee Schedule',
      isVerified: true,
      completed: false,
      notes: ''
    },
    {
      id: 'm4',
      category: 'THIRD_PARTY_APPOINTMENT_ESTIMATE',
      title: 'VAC Biometrics & Consular Interview Booking',
      recommendedWindow: '30 - 45 Days Before Travel',
      description: 'Schedule fingerprint (biometrics) appointment at Visa Application Center (VAC) and embassy consular interview slot where applicable.',
      statutoryBasis: 'Consular Appointment Regulations',
      isVerified: true,
      completed: false,
      notes: ''
    },
    {
      id: 'm5',
      category: 'OFFICIAL_PROCESSING_TIME',
      title: 'Official Consular Adjudication & Processing',
      recommendedWindow: '15 - 30 Days Before Travel',
      description: 'Consular officer evaluates application and supporting evidence. Passport retention or courier dispatch for visa foil stamping.',
      statutoryBasis: 'Consular Adjudication Guidelines (Standard: 15-21 Business Days)',
      isVerified: true,
      completed: false,
      notes: ''
    },
    {
      id: 'm6',
      category: 'APPLICANT_ACTION_ESTIMATE',
      title: 'Flight Confirmation, Accommodation & Travel Insurance',
      recommendedWindow: '7 - 14 Days Before Travel',
      description: 'Finalize travel arrangements, secure fully refundable or confirmed bookings and comprehensive travel medical insurance.',
      statutoryBasis: 'Carrier & Border Entry Compliance',
      isVerified: true,
      completed: false,
      notes: ''
    }
  ]);

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const updateNotes = (id: string, notes: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, notes } : m));
  };

  const completedCount = milestones.filter(m => m.completed).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  // Category badge helper
  const renderCategoryBadge = (cat: Milestone['category']) => {
    switch (cat) {
      case 'OFFICIAL_PROCESSING_TIME':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md text-[11px] font-extrabold uppercase tracking-wide">Official Processing Time</span>;
      case 'OFFICIAL_APPLICATION_WINDOW':
        return <span className="px-2.5 py-1 bg-blue-100 text-[#0B3D91] rounded-md text-[11px] font-extrabold uppercase tracking-wide">Official Application Window</span>;
      case 'THIRD_PARTY_APPOINTMENT_ESTIMATE':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md text-[11px] font-extrabold uppercase tracking-wide">Third-Party Appointment Estimate</span>;
      case 'APPLICANT_ACTION_ESTIMATE':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md text-[11px] font-extrabold uppercase tracking-wide">Applicant Action Estimate</span>;
      case 'AWAITING_OFFICIAL_VERIFICATION':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-md text-[11px] font-extrabold uppercase tracking-wide">Awaiting Official Verification</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-[#0B3D91] text-white py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-xs sm:text-sm font-medium mb-3 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to VisaApply.org Home
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <Calendar className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Visa Timeline Planner &amp; Milestone Roadmap</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Reverse-engineer your consular application timeline with statutory windows and leap-year precise date math.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-sm text-right shrink-0">
            <span className="text-xs text-blue-200 font-semibold block uppercase tracking-wider">Roadmap Progress</span>
            <span className="text-2xl font-black text-white">{progressPercent}%</span>
            <span className="text-[11px] text-blue-200 block">{completedCount} of {milestones.length} Milestones Completed</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Controls Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Plane className="w-5 h-5 text-[#0B3D91]" /> Configure Your Target Journey
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Target Destination</label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              >
                <option value="US">🇺🇸 United States (B1/B2, F-1, H-1B)</option>
                <option value="GB">🇬🇧 United Kingdom (Standard Visitor)</option>
                <option value="CA">🇨🇦 Canada (Visitor Visa / TRV)</option>
                <option value="EU">🇪🇪 Schengen Area (Short Stay C)</option>
                <option value="AU">🇦🇺 Australia (Visitor Subclass 600)</option>
                <option value="AE">🇦🇪 United Arab Emirates (Tourist)</option>
                <option value="JP">🇯🇵 Japan (Temporary Visitor)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Visa / Permit Category</label>
              <select
                value={visaCategory}
                onChange={e => setVisaCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              >
                <option value="B1/B2 Tourist / Visitor Visa">B1/B2 Tourist / Visitor Visa</option>
                <option value="Student / Academic Visa (F-1/Tier 4)">Student / Academic Visa</option>
                <option value="Skilled Work & Employment Permit">Skilled Work &amp; Employment Permit</option>
                <option value="Family Reunification / Dependent">Family Reunification / Dependent</option>
                <option value="Business & Investor Visa">Business &amp; Investor Visa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Target Travel / Arrival Date</label>
              <input
                type="date"
                value={targetTravelDate}
                onChange={e => setTargetTravelDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              />
            </div>
          </div>
        </div>

        {/* Timeline Roadmap */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-black text-slate-900">Chronological Application Roadmap</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Check off completed tasks to track your readiness before your target arrival date: <span className="font-bold text-[#0B3D91]">{targetTravelDate}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Print / Export Roadmap
              </button>
            </div>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-slate-200">
            {milestones.map((milestone, idx) => (
              <div key={milestone.id} className="relative flex items-start gap-4 sm:gap-6 pl-2">
                <button
                  onClick={() => toggleMilestone(milestone.id)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all cursor-pointer shadow-sm ${milestone.completed ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-white border-2 border-slate-300 text-slate-400 hover:border-[#0B3D91]'}`}
                  title={milestone.completed ? 'Mark Incomplete' : 'Mark Completed'}
                >
                  <Check className={`w-5 h-5 ${milestone.completed ? 'opacity-100' : 'opacity-0'}`} />
                </button>

                <div className={`flex-1 bg-white p-6 rounded-2xl border transition-all shadow-sm ${milestone.completed ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-slate-400 uppercase">Step {idx + 1}</span>
                      {renderCategoryBadge(milestone.category)}
                    </div>
                    <span className="text-xs font-black text-[#0B3D91] bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                      ⏱ {milestone.recommendedWindow}
                    </span>
                  </div>

                  <h3 className={`text-base sm:text-lg font-black ${milestone.completed ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                    {milestone.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {milestone.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <ShieldCheck className="w-4 h-4 text-[#0B3D91]" /> Statutory Basis: <span className="font-bold text-slate-700">{milestone.statutoryBasis}</span>
                    </div>
                    <div className="w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Add personal notes / tracking number..."
                        value={milestone.notes}
                        onChange={e => updateNotes(milestone.id, e.target.value)}
                        className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider">
            <Info className="w-4 h-4 text-[#0B3D91]" /> Official Consular Timeline Advisory
          </div>
          <p className="leading-relaxed">
            Consular processing times and interview appointment availability fluctuate based on seasonal demand, national holidays, and consular staffing capacity. Applicants are advised to submit applications well in advance of non-refundable travel bookings. VisaApply.org provides this roadmap as an educational planning aid and does not guarantee consular appointment slot allocations.
          </p>
        </div>
      </div>
    </div>
  );
};
export default TimelinePlannerPage;
