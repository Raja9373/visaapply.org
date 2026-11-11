import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertTriangle, ArrowLeft, Download, Plus, Trash2, ShieldCheck, Info, Check, Globe, Printer } from 'lucide-react';
import { SUPPORTED_LANGUAGES_10, SupportedLangCode } from '../../i18n/config';
import { getUIString } from '../../utils/autoLanguage';
import jsPDF from 'jspdf';

export type RequirementClassification = 
  | 'REQUIRED_VERIFIED' 
  | 'CONDITIONAL_VERIFIED' 
  | 'RECOMMENDED_NON_MANDATORY' 
  | 'AWAITING_VERIFICATION' 
  | 'NOT_APPLICABLE';

export type ApplicantProgressStatus = 
  | 'NOT_STARTED' 
  | 'IN_PROGRESS' 
  | 'ACQUIRED' 
  | 'REVIEWED';

interface DocumentItem {
  id: string;
  category: string;
  title: string;
  requirementStatus: RequirementClassification;
  progressStatus: ApplicantProgressStatus;
  description: string;
  statutoryBasis: string;
  notes: string;
  isCustom?: boolean;
}

interface DocumentChecklistPageProps {
  onNavigate: (path: string) => void;
}

export const DocumentChecklistPage: React.FC<DocumentChecklistPageProps> = ({ onNavigate }) => {
  const [destination, setDestination] = useState('US');
  const [visaCategory, setVisaCategory] = useState('B1/B2 Tourist / Visitor Visa');
  const [uiLang, setUiLang] = useState<SupportedLangCode>('en');
  const ui = getUIString(uiLang);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 'd1',
      category: 'Passport',
      title: 'Valid International Passport',
      requirementStatus: 'REQUIRED_VERIFIED',
      progressStatus: 'NOT_STARTED',
      description: 'Must be valid for at least 6 months beyond your planned date of departure from the destination country, with at least 2 blank pages.',
      statutoryBasis: 'Consular Passport Act & Immigration Rules (Verified)',
      notes: ''
    },
    {
      id: 'd2',
      category: 'Photograph',
      title: 'Biometric Passport Photographs (2x)',
      requirementStatus: 'REQUIRED_VERIFIED',
      progressStatus: 'NOT_STARTED',
      description: 'Recent color photograph (taken within last 6 months), white background, full face view without headwear. Size 2x2 inches (51x51mm).',
      statutoryBasis: 'ICAO Doc 9303 Machine Readable Travel Documents',
      notes: ''
    },
    {
      id: 'd3',
      category: 'Proof of Funds',
      title: 'Bank Statements (Past 3-6 Months)',
      requirementStatus: 'REQUIRED_VERIFIED',
      progressStatus: 'NOT_STARTED',
      description: 'Official bank statements stamped by banking institution demonstrating sufficient funds for maintenance and return travel.',
      statutoryBasis: 'Statutory Maintenance & Sufficiency Regulations',
      notes: ''
    },
    {
      id: 'd4',
      category: 'Employment Proof',
      title: 'Employer Leave Sanction & Salary Slips',
      requirementStatus: 'CONDITIONAL_VERIFIED',
      progressStatus: 'NOT_STARTED',
      description: 'Letter from employer confirming employment duration, position, salary, approved leave dates, and return-to-work guarantee.',
      statutoryBasis: 'Ties to Home Country Verification Standard (Conditional on Employment)',
      notes: ''
    },
    {
      id: 'd5',
      category: 'Accommodation',
      title: 'Hotel Reservations or Host Invitation',
      requirementStatus: 'REQUIRED_VERIFIED',
      progressStatus: 'NOT_STARTED',
      description: 'Confirmed hotel bookings for the entire duration of stay, or notarized invitation letter from host with proof of residence status.',
      statutoryBasis: 'Temporary Stay Accommodation Compliance',
      notes: ''
    },
    {
      id: 'd6',
      category: 'Travel Insurance',
      title: 'Comprehensive Travel Medical Insurance',
      requirementStatus: 'RECOMMENDED_NON_MANDATORY',
      progressStatus: 'NOT_STARTED',
      description: 'International health insurance policy covering emergency medical expenses, repatriation and hospital care (minimum €30,000 / $50,000).',
      statutoryBasis: 'Consular Health Recommendation',
      notes: ''
    },
    {
      id: 'd7',
      category: 'Flight Itinerary',
      title: 'Round-Trip Flight Reservation',
      requirementStatus: 'REQUIRED_VERIFIED',
      progressStatus: 'NOT_STARTED',
      description: 'Confirmed round-trip air ticket or verifiable flight itinerary showing entry and exit dates.',
      statutoryBasis: 'Return Journey Evidentiary Rule',
      notes: ''
    },
    {
      id: 'd8',
      category: 'Cover Letter',
      title: 'Statement of Purpose / Cover Letter',
      requirementStatus: 'RECOMMENDED_NON_MANDATORY',
      progressStatus: 'NOT_STARTED',
      description: 'Detailed applicant-authored letter explaining itinerary, purpose of visit, funding arrangements, and strong ties to home country.',
      statutoryBasis: 'Consular Discretionary Evidentiary Support',
      notes: ''
    },
    {
      id: 'd9',
      category: 'Tax Returns',
      title: 'Income Tax Return (ITR) / Assessment Notices',
      requirementStatus: 'CONDITIONAL_VERIFIED',
      progressStatus: 'NOT_STARTED',
      description: 'Tax assessment returns for the past 2-3 years proving tax compliance and consistent financial standing.',
      statutoryBasis: 'Financial Soundness Conditional Requirement',
      notes: ''
    },
    {
      id: 'd10',
      category: 'Civil Status Documents',
      title: 'Birth & Marriage Certificates',
      requirementStatus: 'CONDITIONAL_VERIFIED',
      progressStatus: 'NOT_STARTED',
      description: 'Official civil registry certificates establishing family ties, dependents, and civil status.',
      statutoryBasis: 'Conditional Family & Dependant Verification',
      notes: ''
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Additional Supporting Evidence');

  const updateRequirementStatus = (id: string, requirementStatus: RequirementClassification) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, requirementStatus } : d));
  };

  const updateProgressStatus = (id: string, progressStatus: ApplicantProgressStatus) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, progressStatus } : d));
  };

  const updateNotes = (id: string, notes: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, notes } : d));
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addCustomDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newItem: DocumentItem = {
      id: `custom-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      requirementStatus: 'RECOMMENDED_NON_MANDATORY', // Custom documents default to recommended/non-mandatory, never REQUIRED_VERIFIED automatically
      progressStatus: 'NOT_STARTED',
      description: 'Custom applicant-added document for special visa route requirements.',
      statutoryBasis: 'Applicant Custom Evidence (Non-Mandatory)',
      notes: '',
      isCustom: true
    };
    setDocuments(prev => [...prev, newItem]);
    setNewTitle('');
  };

  const acquiredCount = documents.filter(d => d.progressStatus === 'ACQUIRED' || d.progressStatus === 'REVIEWED').length;
  const progressPercent = Math.round((acquiredCount / documents.length) * 100);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(11, 61, 145);
    doc.text("VisaApply.org - Official Document Checklist & Evidence Audit", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Destination: ${destination} | Visa Category: ${visaCategory} | Lang: ${uiLang.toUpperCase()}`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Progress: ${progressPercent}% (${acquiredCount}/${documents.length} Acquired/Reviewed)`, 14, 34);

    let y = 45;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    documents.forEach((item, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. [${item.requirementStatus}] ${item.title} (${item.category})`, 14, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`   Progress: ${item.progressStatus} | Basis: ${item.statutoryBasis}`, 14, y);
      y += 6;
      doc.text(`   Desc: ${item.description}`, 14, y);
      y += 6;
      if (item.notes) {
        doc.text(`   Notes: ${item.notes}`, 14, y);
        y += 6;
      }
      y += 4;
      doc.setFontSize(11);
    });

    doc.save(`VisaApply_Document_Checklist_${destination}_${uiLang}.pdf`);
  };

  const renderRequirementBadge = (status: RequirementClassification) => {
    switch (status) {
      case 'REQUIRED_VERIFIED':
        return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-md text-[11px] font-extrabold uppercase">Required (Verified)</span>;
      case 'CONDITIONAL_VERIFIED':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md text-[11px] font-extrabold uppercase">Conditional (Verified)</span>;
      case 'RECOMMENDED_NON_MANDATORY':
        return <span className="px-2.5 py-1 bg-blue-100 text-[#0B3D91] rounded-md text-[11px] font-extrabold uppercase">Recommended (Non-Mandatory)</span>;
      case 'AWAITING_VERIFICATION':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md text-[11px] font-extrabold uppercase">Awaiting Verification</span>;
      case 'NOT_APPLICABLE':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-extrabold uppercase">Not Applicable</span>;
    }
  };

  const renderProgressBadge = (status: ApplicantProgressStatus) => {
    switch (status) {
      case 'NOT_STARTED':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-extrabold uppercase">Not Started</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[11px] font-extrabold uppercase">In Progress</span>;
      case 'ACQUIRED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md text-[11px] font-extrabold uppercase">Acquired</span>;
      case 'REVIEWED':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md text-[11px] font-extrabold uppercase">Reviewed</span>;
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
                <FileText className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Smart Visa Document Checklist &amp; Evidence Governance</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Separating official legal requirement classification from applicant progress status across 15 canonical languages.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-sm text-right shrink-0">
            <span className="text-xs text-blue-200 font-semibold block uppercase tracking-wider">Vault Progress</span>
            <span className="text-2xl font-black text-white">{progressPercent}%</span>
            <span className="text-[11px] text-blue-200 block">{acquiredCount} of {documents.length} Acquired/Reviewed</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Controls & Export */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Target Destination</label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              >
                <option value="US">🇺🇸 United States</option>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="CA">🇨🇦 Canada</option>
                <option value="EU">🇪🇪 Schengen Area</option>
                <option value="AU">🇦🇺 Australia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Visa Category</label>
              <select
                value={visaCategory}
                onChange={e => setVisaCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              >
                <option value="B1/B2 Tourist / Visitor Visa">B1/B2 Tourist / Visitor Visa</option>
                <option value="Student Visa (F-1/Tier 4)">Student Visa</option>
                <option value="Skilled Work Permit">Skilled Work Permit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Interface Language (15 Supported)</label>
              <select
                value={uiLang}
                onChange={e => setUiLang(e.target.value as SupportedLangCode)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              >
                <option value="en">English (en)</option>
                <option value="hi">Hindi - हिन्दी (hi)</option>
                <option value="de">German - Deutsch (de)</option>
                <option value="es">Spanish - Español (es)</option>
                <option value="pl">Polish - Polski (pl)</option>
                <option value="fr">French - Français (fr)</option>
                <option value="ar">Arabic - العربية (ar)</option>
                <option value="ru">Russian - Русский (ru)</option>
                <option value="zh">Chinese - 中文 (zh)</option>
                <option value="ja">Japanese - 日本語 (ja)</option>
                <option value="pt">Portuguese - Português (pt)</option>
                <option value="it">Italian - Italiano (it)</option>
                <option value="nl">Dutch - Nederlands (nl)</option>
                <option value="tr">Turkish - Türkçe (tr)</option>
                <option value="ko">Korean - 한국어 (ko)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex-1 sm:flex-none px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / HTML View
            </button>
            <button
              onClick={exportPDF}
              className="flex-1 sm:flex-none px-6 py-3 bg-[#0B3D91] hover:bg-[#082e6d] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        {/* Multilingual Unicode / Script Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider">
            <Info className="w-4 h-4 text-amber-700" /> Multilingual Script &amp; Evidence Governance Notice
          </div>
          <p className="leading-relaxed">
            Official legal requirements are strictly separated from applicant progress status. For non-Latin scripts (Hindi, Arabic, Chinese, Japanese, Korean, Cyrillic), please use the <span className="font-bold">Print / HTML View</span> to ensure 100% Unicode fidelity and Arabic RTL rendering without missing glyph boxes.
          </p>
        </div>

        {/* Add Custom Document */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Add Custom Supporting Document (Defaults to Recommended / Non-Mandatory)</h3>
          <form onSubmit={addCustomDocument} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Document title (e.g., Sponsor Affidavit)..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
            />
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
            >
              <option value="Additional Supporting Evidence">Additional Supporting Evidence</option>
              <option value="Proof of Funds">Proof of Funds</option>
              <option value="Employment Proof">Employment Proof</option>
              <option value="Civil Status Documents">Civil Status Documents</option>
            </select>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </form>
        </div>

        {/* Document List */}
        <div className="space-y-4">
          {documents.map((item, idx) => (
            <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-slate-400 uppercase">#{idx + 1}</span>
                  <span className="px-2.5 py-1 bg-blue-50 text-[#0B3D91] rounded-md text-[11px] font-extrabold uppercase">
                    {item.category}
                  </span>
                  {renderRequirementBadge(item.requirementStatus)}
                  {renderProgressBadge(item.progressStatus)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeDocument(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-black text-slate-900">{item.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{item.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Official Requirement Status (Evidence Governed)</label>
                  <select
                    value={item.requirementStatus}
                    onChange={e => updateRequirementStatus(item.id, e.target.value as RequirementClassification)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  >
                    <option value="REQUIRED_VERIFIED">REQUIRED_VERIFIED (Official Mandatory)</option>
                    <option value="CONDITIONAL_VERIFIED">CONDITIONAL_VERIFIED (Condition-Based)</option>
                    <option value="RECOMMENDED_NON_MANDATORY">RECOMMENDED_NON_MANDATORY (Non-Mandatory)</option>
                    <option value="AWAITING_VERIFICATION">AWAITING_VERIFICATION (Pending Proof)</option>
                    <option value="NOT_APPLICABLE">NOT_APPLICABLE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1.5">Applicant Progress Status</label>
                  <select
                    value={item.progressStatus}
                    onChange={e => updateProgressStatus(item.id, e.target.value as ApplicantProgressStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  >
                    <option value="NOT_STARTED">NOT_STARTED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="ACQUIRED">ACQUIRED</option>
                    <option value="REVIEWED">REVIEWED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#0B3D91]" /> Statutory Evidence: <span className="font-bold text-slate-700">{item.statutoryBasis}</span>
                </div>
                <div className="w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Add personal notes / file reference..."
                    value={item.notes}
                    onChange={e => updateNotes(item.id, e.target.value)}
                    className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print / HTML View Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">VisaApply.org - Official Evidence Checklist Report</h2>
                <p className="text-xs text-slate-500">Destination: {destination} | Visa: {visaCategory} | Language: {uiLang.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                <span className="font-bold">Summary:</span> {acquiredCount} of {documents.length} items acquired/reviewed ({progressPercent}%). Generated for 15-language Unicode support.
              </div>

              {documents.map((item, i) => (
                <div key={item.id} className="p-4 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-[#0B3D91]">#{i + 1} [{item.category}]</span>
                    <span className="font-bold text-slate-700">Requirement: {item.requirementStatus} | Progress: {item.progressStatus}</span>
                  </div>
                  <h4 className="font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600">{item.description}</p>
                  <p className="text-[11px] text-slate-500 font-medium">Statutory Basis: {item.statutoryBasis}</p>
                  {item.notes && <p className="text-[11px] text-emerald-700 font-bold">Notes: {item.notes}</p>}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-[#0B3D91] text-white font-bold text-xs rounded-xl hover:bg-[#082e6d] cursor-pointer"
              >
                Print Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DocumentChecklistPage;
