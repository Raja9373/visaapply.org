import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertTriangle, ArrowLeft, Download, Plus, Trash2, ShieldCheck, Info, Check, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES_10, SupportedLangCode } from '../../i18n/config';
import { getUIString } from '../../utils/autoLanguage';
import jsPDF from 'jspdf';

interface DocumentItem {
  id: string;
  category: string;
  title: string;
  status: 'REQUIRED' | 'OPTIONAL' | 'ACQUIRED' | 'NOT_APPLICABLE' | 'VERIFIED';
  description: string;
  statutoryBasis: string;
  notes: string;
}

interface DocumentChecklistPageProps {
  onNavigate: (path: string) => void;
}

export const DocumentChecklistPage: React.FC<DocumentChecklistPageProps> = ({ onNavigate }) => {
  const [destination, setDestination] = useState('US');
  const [visaCategory, setVisaCategory] = useState('B1/B2 Tourist / Visitor Visa');
  const [uiLang, setUiLang] = useState<SupportedLangCode>('en');
  const ui = getUIString(uiLang);

  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 'd1',
      category: 'Passport',
      title: 'Valid International Passport',
      status: 'REQUIRED',
      description: 'Must be valid for at least 6 months beyond your planned date of departure from the destination country, with at least 2 blank pages.',
      statutoryBasis: 'Consular Passport Act & Immigration Rules',
      notes: ''
    },
    {
      id: 'd2',
      category: 'Photograph',
      title: 'Biometric Passport Photographs (2x)',
      status: 'REQUIRED',
      description: 'Recent color photograph (taken within last 6 months), white background, full face view without headwear (unless religious). Size 2x2 inches (51x51mm).',
      statutoryBasis: 'ICAO Doc 9303 Machine Readable Travel Documents',
      notes: ''
    },
    {
      id: 'd3',
      category: 'Proof of Funds',
      title: 'Bank Statements (Past 3-6 Months)',
      status: 'REQUIRED',
      description: 'Official bank account statements stamped by the banking institution demonstrating sufficient funds for maintenance and return travel.',
      statutoryBasis: 'Statutory Maintenance & Sufficiency Regulations',
      notes: ''
    },
    {
      id: 'd4',
      category: 'Employment Proof',
      title: 'Employer Leave Sanction & Salary Slips',
      status: 'REQUIRED',
      description: 'Letter from employer confirming employment duration, position, salary, approved leave dates, and return-to-work guarantee.',
      statutoryBasis: 'Ties to Home Country Verification Standard',
      notes: ''
    },
    {
      id: 'd5',
      category: 'Accommodation',
      title: 'Hotel Reservations or Host Invitation',
      status: 'REQUIRED',
      description: 'Confirmed hotel bookings for the entire duration of stay, or notarized invitation letter from host with proof of residence status.',
      statutoryBasis: 'Temporary Stay Accommodation Compliance',
      notes: ''
    },
    {
      id: 'd6',
      category: 'Travel Insurance',
      title: 'Comprehensive Travel Medical Insurance',
      status: 'OPTIONAL',
      description: 'International health insurance policy covering emergency medical expenses, repatriation and hospital care (minimum €30,000 / $50,000).',
      statutoryBasis: 'Consular Health Mandate',
      notes: ''
    },
    {
      id: 'd7',
      category: 'Flight Itinerary',
      title: 'Round-Trip Flight Reservation',
      status: 'REQUIRED',
      description: 'Confirmed round-trip air ticket or verifiable flight itinerary showing entry and exit dates.',
      statutoryBasis: 'Return Journey Evidentiary Rule',
      notes: ''
    },
    {
      id: 'd8',
      category: 'Cover Letter',
      title: 'Statement of Purpose / Cover Letter',
      status: 'REQUIRED',
      description: 'Detailed applicant-authored letter explaining itinerary, purpose of visit, funding arrangements, and strong ties to home country.',
      statutoryBasis: 'Consular Discretionary Evaluation',
      notes: ''
    },
    {
      id: 'd9',
      category: 'Tax Returns',
      title: 'Income Tax Return (ITR) / Assessment Notices',
      status: 'REQUIRED',
      description: 'Tax assessment returns for the past 2-3 years proving tax compliance and consistent financial standing.',
      statutoryBasis: 'Financial Soundness Assessment',
      notes: ''
    },
    {
      id: 'd10',
      category: 'Civil Status Documents',
      title: 'Birth & Marriage Certificates',
      status: 'OPTIONAL',
      description: 'Official civil registry certificates establishing family ties, dependents, and civil status.',
      statutoryBasis: 'Civil Status Verification',
      notes: ''
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Additional Supporting Evidence');

  const updateStatus = (id: string, status: DocumentItem['status']) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status } : d));
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
      status: 'REQUIRED',
      description: 'Custom applicant-added document for special visa route requirements.',
      statutoryBasis: 'Applicant Custom Evidence',
      notes: ''
    };
    setDocuments(prev => [...prev, newItem]);
    setNewTitle('');
  };

  const acquiredCount = documents.filter(d => d.status === 'ACQUIRED' || d.status === 'VERIFIED').length;
  const progressPercent = Math.round((acquiredCount / documents.length) * 100);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(11, 61, 145);
    doc.text("VisaApply.org - Official Document Checklist", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Target Destination: ${destination} | Visa Category: ${visaCategory}`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Readiness: ${progressPercent}% (${acquiredCount}/${documents.length} Acquired)`, 14, 34);

    let y = 45;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    documents.forEach((item, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. [${item.status}] ${item.title} (${item.category})`, 14, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`   Description: ${item.description}`, 14, y);
      y += 6;
      if (item.notes) {
        doc.text(`   Notes: ${item.notes}`, 14, y);
        y += 6;
      }
      y += 4;
      doc.setFontSize(12);
    });

    doc.save(`VisaApply_Document_Checklist_${destination}.pdf`);
  };

  const renderStatusBadge = (status: DocumentItem['status']) => {
    switch (status) {
      case 'REQUIRED':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md text-[11px] font-extrabold uppercase">Required</span>;
      case 'OPTIONAL':
        return <span className="px-2.5 py-1 bg-blue-100 text-[#0B3D91] rounded-md text-[11px] font-extrabold uppercase">Optional</span>;
      case 'ACQUIRED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md text-[11px] font-extrabold uppercase">Acquired</span>;
      case 'NOT_APPLICABLE':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-extrabold uppercase">N/A</span>;
      case 'VERIFIED':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-md text-[11px] font-extrabold uppercase">Verified</span>;
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
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Smart Visa Document Checklist &amp; Evidence Vault</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Interactive evidence tracker with standardized statutory classifications and PDF export.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-sm text-right shrink-0">
            <span className="text-xs text-blue-200 font-semibold block uppercase tracking-wider">Vault Readiness</span>
            <span className="text-2xl font-black text-white">{progressPercent}%</span>
            <span className="text-[11px] text-blue-200 block">{acquiredCount} of {documents.length} Items Acquired</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Controls & Export */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-auto">
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
          </div>
          <button
            onClick={exportPDF}
            className="w-full sm:w-auto px-6 py-3 bg-[#0B3D91] hover:bg-[#082e6d] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" /> Export PDF Checklist
          </button>
        </div>

        {/* Add Custom Document */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Add Custom Supporting Document</h3>
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
            <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-slate-400 uppercase">#{idx + 1}</span>
                  <span className="px-2.5 py-1 bg-blue-50 text-[#0B3D91] rounded-md text-[11px] font-extrabold uppercase">
                    {item.category}
                  </span>
                  {renderStatusBadge(item.status)}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={item.status}
                    onChange={e => updateStatus(item.id, e.target.value as DocumentItem['status'])}
                    className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  >
                    <option value="REQUIRED">Required</option>
                    <option value="OPTIONAL">Optional</option>
                    <option value="ACQUIRED">Acquired</option>
                    <option value="NOT_APPLICABLE">N/A</option>
                    <option value="VERIFIED">Verified</option>
                  </select>
                  <button
                    onClick={() => removeDocument(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h4 className="text-base sm:text-lg font-black text-slate-900">{item.title}</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{item.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#0B3D91]" /> Statutory Standard: <span className="font-bold text-slate-700">{item.statutoryBasis}</span>
                </div>
                <div className="w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Add notes / file reference..."
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
    </div>
  );
};
export default DocumentChecklistPage;
