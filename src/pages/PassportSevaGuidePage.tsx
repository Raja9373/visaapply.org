import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Download,
  CheckCircle2,
  Clock,
  DollarSign,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface PassportSevaGuidePageProps {
  onNavigate?: (path: string) => void;
}

type PassportServiceType = 'New' | 'Renewal' | 'Tatkal' | 'Lost';

interface PassportServiceInfo {
  service: PassportServiceType;
  headline: string;
  fee36Pages: string;
  fee60Pages: string;
  timeTaken: string;
  policeVerificationMode: string;
  documentsNeeded: string[];
  officialNotes: string;
}

const FIVE_PASSPORT_STEPS = [
  {
    step: 'Step 1',
    title: '1. Apply on Passport Seva',
    desc: 'Register on the official MEA portal (passportindia.gov.in) or mPassport Seva App, select Fresh or Re-issue of Passport, and fill out the online form carefully.'
  },
  {
    step: 'Step 2',
    title: '2. Pay Fee (Rs 1,500 Normal / Rs 3,500 Tatkal)',
    desc: 'Pay Rs 1,500 online for a 36-page Normal Passport (or Rs 3,500 total for Tatkal 36-page) via UPI, NetBanking, or Debit/Credit Card to book your PSK slot.'
  },
  {
    step: 'Step 3',
    title: '3. Visit PSK (Passport Seva Kendra)',
    desc: 'Carry your original Aadhaar, PAN, 10th Marksheet (for Non-ECR), and self-attested photocopies to your chosen PSK / POPSK for biometrics and photo capture.'
  },
  {
    step: 'Step 4',
    title: '4. Police Verification',
    desc: 'Your local police station verifies your residential address via the mPassport Police App (Post-Police Verification is used for Tatkal and clean renewals).'
  },
  {
    step: 'Step 5',
    title: '5. Passport in 7–30 Days',
    desc: 'Your printed e-Passport / booklet is dispatched via India Post Speed Post (1–3 Working Days for Tatkal, or 7–30 Days for Normal applications).'
  }
];

const SERVICE_DETAILS: Record<PassportServiceType, PassportServiceInfo> = {
  New: {
    service: 'New',
    headline: 'Fresh / New Indian Passport (Normal Scheme — 10-Year Validity)',
    fee36Pages: 'Rs 1,500 (36 Pages — Adult) / Rs 1,000 (Minor)',
    fee60Pages: 'Rs 2,000 (60 Pages Jumbo Booklet)',
    timeTaken: '15 to 30 Days (7–14 Days in Metro Cities with mPassport Police)',
    policeVerificationMode: 'Pre-Police Verification Mandatory',
    documentsNeeded: [
      'Aadhaar Card / e-Aadhaar (Proof of Present Address & Photo ID)',
      'PAN Card or Voter ID or Driving License (Proof of Date of Birth)',
      'Class 10th / Matriculation Pass Certificate or Degree (Mandatory for Non-ECR / ECNR Category)',
      'Bank Account Passbook (Public Sector / Scheduled Private Bank with Photo) or Electricity/Water Bill',
      'Birth Certificate issued by Municipal Authority (Mandatory for Minors under 18)'
    ],
    officialNotes:
      'DigiLocker verified Aadhaar and Class 10th Marksheet are accepted directly on the Passport Seva portal. Always carry physical originals to the PSK counter.'
  },
  Renewal: {
    service: 'Renewal',
    headline: 'Passport Renewal / Re-issue (Expiring Within 1 Year or Exhausted Pages)',
    fee36Pages: 'Rs 1,500 (36 Pages Normal Renewal)',
    fee60Pages: 'Rs 2,000 (60 Pages Jumbo Renewal)',
    timeTaken: '7 to 15 Working Days',
    policeVerificationMode: 'No / Post-Police Verification (if same address) • Pre-Verification if address changed',
    documentsNeeded: [
      'Original Old Passport + Self-attested photocopy of first 2 and last 2 pages (including ECR/Non-ECR page)',
      'Updated Aadhaar Card (if applying for Change of Address)',
      'Marriage Certificate or Annexure J (only if adding Spouse Name, though Marriage Certificate is no longer mandatory under simplified MEA rules)',
      'Class 10th Certificate / Degree (if upgrading from ECR to Non-ECR status)'
    ],
    officialNotes:
      'You can apply for Passport Renewal up to 1 year before your current passport expires, or anytime after expiry.'
  },
  Tatkal: {
    service: 'Tatkal',
    headline: 'Tatkal Fast-Track Passport (Urgent Travel Dispatch in 1–3 Working Days)',
    fee36Pages: 'Rs 3,500 Total (Rs 1,500 Base + Rs 2,000 Tatkal Fee)',
    fee60Pages: 'Rs 4,000 Total (Rs 2,000 Base + Rs 2,000 Tatkal Fee)',
    timeTaken: '1 to 3 Working Days (Dispatched Before Police Verification)',
    policeVerificationMode: 'Post-Police Verification (Passport printed & dispatched first)',
    documentsNeeded: [
      'Any 3 Official IDs from MEA List: (1) Aadhaar Card, (2) PAN Card, and (3) Voter ID / Driving License / Bank Passbook',
      'Class 10th Certificate / University Degree (for Non-ECR eligibility)',
      'Original Old Passport (if applying for Tatkal Renewal)',
      'Online Payment of Rs 1,500 at booking + Rs 2,000 Tatkal fee (paid online or in cash at PSK counter)'
    ],
    officialNotes:
      'Tatkal scheme is available for most Fresh and Renewal applicants without complex changes (such as major name changes, lost/damaged passports, or adverse police records).'
  },
  Lost: {
    service: 'Lost',
    headline: 'Re-issue for Lost or Damaged Passport',
    fee36Pages: 'Rs 3,000 (36 Pages Booklet)',
    fee60Pages: 'Rs 3,500 (60 Pages Jumbo Booklet)',
    timeTaken: '15 to 30 Working Days',
    policeVerificationMode: 'Fresh Police Verification Required',
    documentsNeeded: [
      'Original Police FIR / Lost Report mentioning the Lost Passport Number',
      'Signed Annexure "F" (Specimen Affidavit for a Passport in lieu of Lost/Damaged Passport)',
      'Photocopy of Old Lost Passport (Bio pages) or Passport Number details if available',
      'Aadhaar Card (Address Proof) + PAN Card / Voter ID (DOB Proof) + 10th Marksheet (Non-ECR Proof)'
    ],
    officialNotes:
      'If your passport is damaged (water damage, torn pages, or peeling laminate) but the passport number and photo are still legible, you only need Annexure F without a Police FIR.'
  }
};

export const PassportSevaGuidePage: React.FC<PassportSevaGuidePageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  const [selectedService, setSelectedService] = useState<PassportServiceType>('New');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const info = useMemo(() => SERVICE_DETAILS[selectedService], [selectedService]);

  const handleDownloadPassportPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const margin = 15;
    const contentWidth = 180;

    // Header
    doc.setFillColor(11, 61, 145);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15.5);
    doc.setTextColor(255, 255, 255);
    doc.text('VisaApply.org - Official Passport Seva Checklist & Guide', margin, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(219, 234, 254);
    doc.text(
      `Selected Service: ${info.service} Passport (${info.headline})   |   Date: ${todayStr}`,
      margin,
      23
    );

    let y = 42;

    // Fee & Timeline Box
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y - 5, contentWidth, 26, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`1. OFFICIAL FEE & PROCESSING TIME (${info.service.toUpperCase()} PASSPORT)`, margin + 4, y + 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.2);
    doc.text(`• 36-Page Booklet Fee: ${info.fee36Pages}`, margin + 4, y + 8.5);
    doc.text(`• 60-Page Jumbo Booklet Fee: ${info.fee60Pages}`, margin + 4, y + 14);
    doc.text(`• Time Taken: ${info.timeTaken}   |   Police Check: ${info.policeVerificationMode}`, margin + 4, y + 19.5);

    y += 30;

    // Documents Checklist
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 61, 145);
    doc.text('2. MANDATORY DOCUMENTS TO CARRY TO PSK (ORIGINALS + SELF-ATTESTED COPIES)', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.2);
    doc.setTextColor(30, 41, 59);
    info.documentsNeeded.forEach((item) => {
      const lines = doc.splitTextToSize(`[ ] ${item}`, contentWidth - 4);
      doc.text(lines, margin + 2, y);
      y += lines.length * 5.2 + 1.5;
    });

    y += 5;

    // 5 Steps
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 61, 145);
    doc.text('3. 5-STEP PASSPORT SEVA APPLICATION PROCESS', margin, y);
    y += 6;

    FIVE_PASSPORT_STEPS.forEach((st) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${st.title}`, margin + 2, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const wrapped = doc.splitTextToSize(st.desc, contentWidth - 6);
      doc.text(wrapped, margin + 4, y);
      y += wrapped.length * 4.2 + 2.5;
    });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Generated 100% Free by VisaApply.org/passport-seva-guide — Apply only on official portal passportindia.gov.in.',
      margin,
      286
    );

    doc.save(`Passport_Seva_Checklist_${info.service}_Passport.pdf`);
  };

  const faqs = [
    {
      q: 'What is the difference between a Normal Passport and a Tatkal Passport in India?',
      a: 'A Normal 36-page passport costs Rs 1,500 and is dispatched in 7 to 30 days after police verification. A Tatkal 36-page passport costs Rs 3,500 (Rs 1,500 base + Rs 2,000 Tatkal fee) and is printed and dispatched within 1 to 3 working days on a Post-Police Verification basis.'
    },
    {
      q: 'How early before expiry should I renew my Indian Passport for international visa applications?',
      a: 'Almost all countries (including the USA, Schengen, UK, UAE, Singapore, and Thailand) strictly require at least 6 months of remaining passport validity beyond your travel dates. You can apply for Passport Renewal on Passport Seva up to 12 months before expiry.'
    },
    {
      q: 'What does Non-ECR (ECNR) mean on an Indian Passport?',
      a: 'Non-ECR (formerly ECNR — Emigration Check Not Required) means you have passed Class 10th (Matriculation) or higher education, allowing you to travel freely for work to all countries without requiring Emigration Clearance. Always carry your original Class 10th certificate or university degree to PSK so your passport is printed under Non-ECR status.'
    },
    {
      q: 'Do I need to carry passport-size photos to the Passport Seva Kendra (PSK)?',
      a: 'For adult applicants visiting a PSK or POPSK, your photograph and biometrics are captured live at Counter A using high-resolution digital cameras, so physical photos are not required (except for infant/newborn applicants under 4 years of age, who should carry 2 white-background 4.5cm x 3.5cm photos).'
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* FAQ JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Top Back to Home */}
      <PageBackBar onNavigate={onNavigate} pageName="Passport Seva Guide" />

      {/* Blue Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FREE GUIDE • OFFICIAL MEA PASSPORT SEVA FEES, DOCUMENTS &amp; TATKAL PROCESS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Passport Seva Guide - New Passport, Renewal, Tatkal
          </h1>
          <p className="text-sm sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Complete step-by-step guide in simple English for Fresh Passports, Renewals, 1–3 Day Tatkal Passports, and Lost Passports. Check official fees, required documents, and download your free PDF checklist.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* 5 Steps in Simple English Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                FREE Guide
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                5 Simple Steps to Get Your Passport (7–30 Days Normal / 1–3 Days Tatkal)
              </h2>
            </div>

            <a
              href="https://www.passportindia.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-xs rounded-xl inline-flex items-center gap-1.5 self-start sm:self-center"
            >
              <span>Official Passport Seva Portal →</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {FIVE_PASSPORT_STEPS.map((st, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <span className="inline-block text-[11px] font-black uppercase bg-[#0B3D91] text-white px-2.5 py-0.5 rounded-full">
                    {st.step}
                  </span>
                  <h3 className="font-black text-sm text-slate-900">{st.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Service Selector Tool */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#0B3D91] bg-blue-50 px-3 py-1 rounded-full">
                Interactive Fee &amp; Document Checker
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Select Your Passport Service Type
              </h2>
            </div>

            <button
              type="button"
              onClick={handleDownloadPassportPdf}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Document Checklist PDF</span>
            </button>
          </div>

          {/* 4 Service Buttons + Dropdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['New', 'Renewal', 'Tatkal', 'Lost'] as PassportServiceType[]).map((srv) => {
              const active = selectedService === srv;
              return (
                <button
                  key={srv}
                  type="button"
                  onClick={() => setSelectedService(srv)}
                  className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-50 border-[#0B3D91] ring-2 ring-[#0B3D91]/20'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-black uppercase text-[#0B3D91]">Service Type</div>
                  <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    {srv === 'New'
                      ? '📘 New Passport'
                      : srv === 'Renewal'
                      ? '🔄 Renewal'
                      : srv === 'Tatkal'
                      ? '⚡ Tatkal (1–3 Days)'
                      : '🛡️ Lost / Damaged'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Service Detail Card */}
          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-[#0B3D91] space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                  FREE Guide • Official 2026 MEA Schedule
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {info.headline}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleDownloadPassportPdf}
                className="py-3 px-5 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Document Checklist PDF</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-extrabold uppercase text-slate-500">
                  Official Fee (36 Pages / 60 Pages)
                </div>
                <div className="text-base font-black text-emerald-700 mt-1 tabular-nums">
                  {info.fee36Pages}
                </div>
                <div className="text-xs font-bold text-slate-500 mt-0.5 tabular-nums">
                  Jumbo: {info.fee60Pages}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-extrabold uppercase text-slate-500">
                  Time Taken (Dispatch)
                </div>
                <div className="text-base font-black text-[#0B3D91] mt-1 tabular-nums">
                  {info.timeTaken}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-extrabold uppercase text-slate-500">
                  Police Verification Mode
                </div>
                <div className="text-sm font-black text-slate-900 mt-1">
                  {info.policeVerificationMode}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-extrabold uppercase text-slate-700">
                Mandatory Documents Needed for {info.service} Passport:
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {info.documentsNeeded.map((docItem, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{docItem}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                <strong>Important Note:</strong> {info.officialNotes}
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">
              Frequently Asked Questions (Passport Seva Guide)
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm sm:text-base text-slate-900 bg-slate-50/60 hover:bg-slate-100/80 flex justify-between items-center gap-3 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Email Only Subscribe Box */}
        <EmailSubscribeBox pageContext="Passport Seva Guide" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
