import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Copy,
  Download,
  Check,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldAlert,
  Wrench,
  Upload,
  Scale
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface VisaRejectionAppealPageProps {
  onNavigate?: (path: string) => void;
}

interface RejectionAnalysis {
  whySimpleEnglish: string;
  whatToFix: string[];
  whenToReapply: string;
  reapplyBadge: string;
  sampleAppealLetter: string;
}

const TOP_REJECTION_REASONS = [
  {
    title: 'Low Bank Balance',
    badge: 'Financial Solvency',
    desc: 'Insufficient closing balance to cover flights, hotels, and daily expenses, or sudden large lump-sum cash deposits made right before printing the bank statement.'
  },
  {
    title: 'Weak Ties to Home Country',
    badge: 'INA 214(b) / Art. 32',
    desc: 'Unable to convince the visa officer that you have strong employment, business, family, or property commitments requiring your timely return home.'
  },
  {
    title: 'Incomplete Documents',
    badge: 'Missing Evidence',
    desc: 'Missing Income Tax Returns (ITR), unsigned application forms, unverified employer No Objection Certificate (NOC), or missing travel insurance.'
  },
  {
    title: 'Fake Dummy Ticket',
    badge: 'Unverifiable PNR',
    desc: 'Submitting an edited PDF or cancelled flight/hotel reservation that fails live airline PNR verification or hotel confirmation checks.'
  },
  {
    title: 'No Travel History',
    badge: 'First-Time Traveler',
    desc: 'Applying for a long multi-country trip on a blank passport without a clear day-by-day itinerary or strong financial backing.'
  }
];

export const VisaRejectionAppealPage: React.FC<VisaRejectionAppealPageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  // Tool 1: Check My Rejection state
  const [selectedCountry, setSelectedCountry] = useState('Schengen');
  const [selectedReason, setSelectedReason] = useState('Weak ties to home country');
  const [rejectionLetterText, setRejectionLetterText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<RejectionAnalysis | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);

  // Tool 2: FREE Appeal Letter Generator state
  const [appealForm, setAppealForm] = useState({
    fullName: '',
    passportNumber: '',
    country: 'Schengen (Germany / France / Italy / Spain)',
    embassyCity: 'New Delhi',
    refusalDate: '',
    applicationRef: '',
    rejectionReason: 'Weak ties to home country',
    occupation: '',
    companyName: '',
    monthlyIncome: '₹95,000 / month',
    newEvidence: 'Updated 6-month seasoned bank statement, employer NOC with confirmed return duty date, and property ownership deed'
  });
  const [generatedAppeal, setGeneratedAppeal] = useState('');
  const [copiedAppeal, setCopiedAppeal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setRejectionLetterText(content.slice(0, 3000));
      }
    };
    reader.readAsText(file);
  };

  const buildSampleLetter = (country: string, reason: string, customNotes: string): string => {
    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return `Date: ${todayStr}

To,
The Consular Appeal & Reconsideration Section,
The Embassy / Consulate General of ${country},
Visa & Consular Services.

Subject: Formal Appeal & Request for Reconsideration of Visa Refusal – Reason: ${reason}

Respected Consular Officer,

I am writing to respectfully submit this formal appeal and request a reconsideration of the recent refusal of my visa application for ${country}.

1. UNDERSTANDING OF THE REFUSAL GROUND:
My application was refused primarily under the ground of "${reason}"${customNotes ? ` (Refusal Notice Excerpt: "${customNotes.slice(0, 140).replace(/\s+/g, ' ').trim()}...")` : ''}. I fully respect the diligence of the Visa Section and wish to provide clear, verifiable documentary evidence addressing this specific concern.

2. CLARIFICATION & NEW SUPPORTING EVIDENCE:
- Financial Solvency & Legitimate Funds: I have enclosed my updated 6-month attested bank statements along with 3 years of Income Tax Returns (ITR) and salary slips, demonstrating stable, regular income and liquid savings sufficient for all trip expenses.
- Strong Home Country Ties: I hold permanent full-time employment in my home country. I have enclosed an official Employer No Objection Certificate (NOC) and sanctioned leave letter confirming the exact date I must report back to work, alongside family and property records.
- Verified Travel & Accommodation: I have attached verifiable flight itinerary reservations (active Airline PNR), confirmed hotel vouchers, and comprehensive travel medical insurance covering the entire duration of stay.

3. UNDERTAKING OF COMPLIANCE:
I solemnly declare that my visit is strictly temporary and for legitimate purposes. I have no intention of overstaying or violating the immigration rules of ${country}.

I kindly request the Consular Officer to review the newly attached proofs and reconsider my visa application favorably.

Yours faithfully,

[YOUR FULL NAME]
Passport Number: [YOUR PASSPORT NUMBER]
Application Reference: [YOUR REFUSAL REFERENCE NUMBER]`;
  };

  const handleCheckRejection = (e: React.FormEvent) => {
    e.preventDefault();

    const reasonMap: Record<string, { why: string; fix: string[]; when: string; badge: string }> = {
      'Low bank balance': {
        why: `The visa officer concluded that your bank statement did not show enough stable, disposable money to comfortably pay for your flights, hotels, and daily expenses in ${selectedCountry}. Often, this also happens if you deposited a large lump sum of cash right before applying without proving where that money came from.`,
        fix: [
          'Maintain a steady, natural closing balance of at least ₹2.5 Lakhs to ₹5 Lakhs ($3,000–$6,000+) for 3 to 6 months.',
          'Avoid any unexplained sudden cash deposits; every credit should match your salary slips or business invoices.',
          'Attach the last 3 years of Income Tax Returns (ITR-V) and mutual fund or fixed deposit summaries as secondary net-worth proof.',
          'Reduce your trip duration to 7–10 days so the required budget matches your current savings.'
        ],
        when: 'Wait 3 to 6 months before re-applying so your bank statement reflects at least 90–180 days of naturally seasoned salary credits and stable balances.',
        badge: 'Re-apply After 3 to 6 Months'
      },
      'Weak ties to home country': {
        why: `Under ${selectedCountry === 'USA' ? 'US Immigration Act Section 214(b)' : selectedCountry === 'Schengen' ? 'Schengen Visa Code Article 32(1)(b)' : selectedCountry === 'UK' ? 'UK Immigration Rules Appendix V (V 4.2)' : 'Canadian IRPR Section 179(b)'}, the officer was not convinced that you have strong enough reasons (job, business, family, or property) to return home after your trip.`,
        fix: [
          'Obtain an official Employer No Objection Certificate (NOC) on company letterhead stating your job role, salary, approved leave dates, and mandatory return date.',
          'Include 6 months of salary slips, employment contract, and 3 years of Income Tax Returns.',
          'Add family ties evidence (marriage certificate, birth certificates of children, or dependent parents living with you).',
          'Include property ownership deeds, rental agreements, or active business registration certificates (GST / Incorporation).'
        ],
        when: 'If mandatory documents were simply left out, you can appeal within 30 days (for Schengen) or re-apply after 3 months. If your job or income situation is brand new, wait 6 months before re-applying.',
        badge: 'Re-apply After 3 to 6 Months'
      },
      'Incomplete documents': {
        why: `Your visa file was missing one or more mandatory supporting documents required by the ${selectedCountry} Embassy, or there was a mismatch between the dates/numbers in your application form and your supporting papers.`,
        fix: [
          'Cross-check every single item against the official Embassy VFS checklist before submission.',
          'Ensure bank statements are officially stamped and signed by the bank branch.',
          'Ensure travel medical insurance covers the entire stay (minimum €30,000 for Schengen) with zero date gaps.',
          'Verify that your Cover Letter explains every document enclosed in your file.'
        ],
        when: 'Because this refusal was caused by missing paperwork rather than ineligibility, you can file an appeal or re-apply after 1 to 3 months once all attested documents are ready.',
        badge: 'Re-apply After 3 Months (or Appeal Now)'
      },
      'Fake dummy ticket': {
        why: `Consular officers verify flight PNR codes and hotel booking references directly in airline GDS systems. Your reservation either expired before the officer checked it, or the PNR code was unverifiable on the airline website.`,
        fix: [
          'Never submit edited PDF tickets or unverifiable flight screenshots.',
          'Use a live, verifiable GDS flight reservation with an active 6-character airline PNR or book a fully refundable airline ticket.',
          'Use confirmed, verifiable Booking.com hotel reservations with Free Cancellation matching your exact flight dates.',
          'Ensure your hotel cities match your day-by-day travel itinerary 100%.'
        ],
        when: 'Re-apply after 3 months with 100% verifiable flight PNR and confirmed refundable hotel vouchers, along with a clear cover letter.',
        badge: 'Re-apply After 3 Months'
      },
      'No travel history': {
        why: `You applied for a complex or lengthy trip to ${selectedCountry} on a fresh passport with no prior international stamps, making the officer cautious about compliance with visa validity rules.`,
        fix: [
          'Keep your requested itinerary short, realistic, and focused (e.g., 6 to 8 days in 1 or 2 major cities).',
          'Consider building travel history first by visiting 1 or 2 easy e-Visa / Visa-Free countries (such as UAE, Singapore, Thailand, Japan, or Vietnam).',
          'Provide a crystal-clear day-by-day tourist itinerary and strong financial bank statements.',
          'Attach a detailed Cover Letter explaining why you chose this specific destination for your holiday.'
        ],
        when: 'Wait 3 to 6 months (ideally after completing 1–2 short international trips or strengthening your financial file) before re-applying.',
        badge: 'Re-apply After 3 to 6 Months'
      }
    };

    const picked = reasonMap[selectedReason] || reasonMap['Weak ties to home country'];
    const sample = buildSampleLetter(selectedCountry, selectedReason, rejectionLetterText);

    setAnalysisResult({
      whySimpleEnglish: picked.why,
      whatToFix: picked.fix,
      whenToReapply: picked.when,
      reapplyBadge: picked.badge,
      sampleAppealLetter: sample
    });

    setTimeout(() => {
      const el = document.getElementById('rejection-analysis-result');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDownloadPdfText = (textContent: string, filename: string) => {
    if (!textContent) return;
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFont('times', 'normal');
      doc.setFontSize(10.5);

      const margin = 20;
      const pageWidth = 210 - margin * 2;
      const splitText = doc.splitTextToSize(textContent, pageWidth);

      let cursorY = 25;
      const pageHeight = 297 - margin;

      for (let i = 0; i < splitText.length; i++) {
        if (cursorY > pageHeight) {
          doc.addPage();
          cursorY = 25;
        }
        doc.text(splitText[i], margin, cursorY);
        cursorY += 5.2;
      }

      doc.save(filename);
    } catch {
      alert('Unable to generate PDF directly. Please use the Copy Text button.');
    }
  };

  const handleGenerateCustomAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealForm.fullName) {
      alert('Please enter your Full Name.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const destClean = appealForm.country.replace(/\(.*\)/, '').trim();

    const letter = `Date: ${todayStr}

To,
The Visa Appeal & Consular Reconsideration Officer,
The Embassy / Consulate General of ${destClean},
Consular & Visa Section,
${appealForm.embassyCity || 'New Delhi'}.

Subject: Formal Visa Refusal Appeal / Reconsideration Request – Passport No: ${appealForm.passportNumber || '[PASSPORT NO]'} (Ref: ${appealForm.applicationRef || 'N/A'})

Respected Consular Officer,

I, ${appealForm.fullName.trim()}, holding Passport No. ${appealForm.passportNumber.trim() || '[PASSPORT NO]'}, am writing to formally appeal and request a reconsideration of the refusal decision dated ${appealForm.refusalDate || '[REFUSAL DATE]'} regarding my visa application (Application Reference: ${appealForm.applicationRef || '[APPLICATION REF]'}).

1. ACKNOWLEDGEMENT OF REFUSAL REASON:
According to the refusal notice, my visa application was declined on the ground of: "${appealForm.rejectionReason}". I deeply respect the thorough verification process of the Embassy of ${destClean} and submit this appeal with concrete documentary evidence to clarify every concern raised.

2. PROFESSIONAL & FINANCIAL STABILITY:
I am gainfully employed as "${appealForm.occupation || 'a Senior Professional'}"${appealForm.companyName ? ` at ${appealForm.companyName}` : ''}, earning a regular monthly income of ${appealForm.monthlyIncome || '₹95,000 / month'}. My salary is credited directly to my bank account every month. I have attached my attested 6-month bank statements, official salary slips, and last 3 years of Income Tax Returns (ITR-V) to prove complete financial self-sufficiency for my trip.

3. NEW EVIDENCE & RECTIFICATION OF CONCERNS:
To directly address the refusal ground ("${appealForm.rejectionReason}"), I am enclosing the following verified documents:
${appealForm.newEvidence || 'Updated 6-month bank statements, official Employer No Objection Certificate (NOC) with sanctioned leave dates, confirmed flight PNR, and property ownership documents.'}

4. STRONG TIES TO HOME COUNTRY & GUARANTEE OF RETURN:
I have binding professional, familial, and financial commitments in my home country:
- My employer has granted me strictly limited paid leave and requires my physical resumption of office duties immediately after my scheduled trip.
- My immediate family members reside permanently at my home address, and I maintain active financial investments and property holdings here.
- I solemnly undertake that I will strictly abide by all immigration laws of ${destClean} and depart before the expiry of my authorized stay.

5. LIST OF ENCLOSED APPEAL DOCUMENTS:
1. Signed Visa Refusal Appeal & Reconsideration Letter
2. Copy of Previous Visa Refusal Notice (${appealForm.refusalDate || 'Refusal Letter'})
3. Original Passport (${appealForm.passportNumber || 'Valid Passport'})
4. Official Employer No Objection Certificate (NOC) & Approved Leave Letter
5. Attested 6-Month Bank Statements & 3 Years Income Tax Returns (ITR)
6. Verifiable Roundtrip Flight Reservation (Active Airline PNR) & Confirmed Hotel Vouchers
7. Comprehensive Travel Medical Insurance Policy
8. Property Ownership / Family Ties Supporting Documents

Thank you for your time, fairness, and kind reconsideration of my visa application.

Yours faithfully,

(Signature)

${appealForm.fullName.trim()}
Passport No: ${appealForm.passportNumber.trim() || '[PASSPORT NO]'}
Application Reference: ${appealForm.applicationRef || '[REF NUMBER]'}`;

    setGeneratedAppeal(letter);
    setTimeout(() => {
      const el = document.getElementById('custom-appeal-output');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const faqs = [
    {
      q: 'Can I re-apply immediately?',
      a: 'Legally, most embassies (including USA, Schengen, UK, and Canada) allow you to re-apply at any time. However, re-applying immediately with the exact same documents almost always results in a second rejection. Unless a key document was accidentally left out, it is strongly recommended to wait 3 to 6 months, fix the specific refusal reason, and show stronger financial or employment evidence before re-applying. For Schengen visas, if the refusal was a mistake, you can file a formal written Appeal within 30 days.'
    },
    {
      q: 'Will rejection affect next visa?',
      a: 'A visa rejection is recorded in the embassy database, and you must always declare previous refusals honestly when asked on future visa forms. However, a past rejection does NOT permanently ban you. Millions of applicants receive visa approval on their second attempt by addressing the exact reason for refusal and attaching a clear explanation in their Cover / Appeal Letter.'
    },
    {
      q: 'How to improve?',
      a: 'To turn a visa refusal into an approval: (1) Maintain a steady, seasoned bank balance for 3–6 months without sudden cash deposits, (2) Attach a strong Employer NOC stating your designation, salary, and exact return-to-work date, (3) Submit 3 years of Income Tax Returns (ITR) and property/family proofs to prove strong home country ties, (4) Submit verifiable flight reservations and confirmed hotel bookings, and (5) Include a detailed Appeal or Reconsideration Cover Letter explaining what has changed since the last application.'
    },
    {
      q: 'Is this Visa Rejection Appeal Check and Letter Generator 100% free?',
      a: 'Yes! Both the Rejection Checker and the Appeal Letter PDF Generator on VisaApply.org are 100% free with no login and no payment required.'
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

      {/* Top Back to Home Bar */}
      <PageBackBar onNavigate={onNavigate} pageName="Visa Rejection Appeal Guide" />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>100% FREE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Visa Rejection Appeal Guide - Why Was Your Visa Rejected?
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Understand the exact consular reason behind your USA, Schengen, UK, or Canada visa refusal. Get a clear step-by-step fix checklist, ideal re-application timeline, and generate a 100% Free Official Appeal Letter PDF.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-10">
        {/* Top 5 Reasons for Visa Rejection */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Top 5 Reasons for Visa Rejection</h2>
                <p className="text-xs text-slate-500">Over 88% of tourist, student, and business visa refusals happen due to these five reasons</p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
              100% FREE GUIDE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {TOP_REJECTION_REASONS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedReason(item.title)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedReason === item.title
                    ? 'bg-blue-50/70 border-[#0B2A5B] ring-2 ring-[#0B2A5B]/20'
                    : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#0B2A5B] text-white text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Tool 1: Check My Rejection */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B2A5B] flex items-center justify-center font-bold">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Interactive Visa Rejection Checker</h2>
                <p className="text-xs text-slate-500">Select your country and rejection reason to get an instant diagnosis &amp; sample appeal letter</p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
              100% FREE
            </span>
          </div>

          <form onSubmit={handleCheckRejection} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Country / Region *
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                >
                  <option value="USA">🇺🇸 USA (Section 214(b) / 221(g))</option>
                  <option value="Schengen">🇪🇺 Schengen (France, Germany, Italy, Spain, Switzerland)</option>
                  <option value="UK">🇬🇧 United Kingdom (UK Standard Visitor / Student)</option>
                  <option value="Canada">🇨🇦 Canada (IRCC Temporary Resident / Study Permit)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Rejection Reason (From Refusal Letter) *
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                >
                  <option value="Low bank balance">Low bank balance / Insufficient financial means</option>
                  <option value="Weak ties to home country">Weak ties to home country (Doubt of return / 214b)</option>
                  <option value="Incomplete documents">Incomplete documents / Missing evidence</option>
                  <option value="Fake dummy ticket">Fake dummy ticket / Unverifiable PNR or hotel</option>
                  <option value="No travel history">No travel history / Blank passport</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Upload or Paste Rejection Letter Text (Optional)
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B2A5B] hover:underline cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .txt file</span>
                  <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <textarea
                rows={3}
                placeholder="Optional: Paste the exact wording from your embassy refusal letter here (e.g. 'Justification for the purpose and conditions of the intended stay was not provided...')"
                value={rejectionLetterText}
                onChange={(e) => setRejectionLetterText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#0B2A5B] hover:bg-[#0B3D91] text-white font-black text-base rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Check My Rejection →</span>
            </button>
          </form>

          {/* Diagnostic Result Box */}
          {analysisResult && (
            <div id="rejection-analysis-result" className="mt-8 pt-8 border-t-2 border-slate-200 space-y-6 scroll-mt-24">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1) Why it was rejected */}
                <div className="p-5 bg-red-50/70 border border-red-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-red-800 font-black text-sm mb-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>1. Why It Was Rejected (Simple English)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {analysisResult.whySimpleEnglish}
                  </p>
                </div>

                {/* 2) What to fix */}
                <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-sm mb-2">
                    <Wrench className="w-4 h-4 shrink-0" />
                    <span>2. What to Fix Before Re-Applying</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {analysisResult.whatToFix.map((step, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3) When to re-apply */}
                <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-900 font-black text-sm mb-2">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>3. When to Re-Apply</span>
                    </div>
                    <div className="inline-block bg-amber-200/80 text-amber-950 text-xs font-black px-2.5 py-1 rounded-lg mb-2">
                      {analysisResult.reapplyBadge}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {analysisResult.whenToReapply}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4) Sample Appeal Letter */}
              <div className="bg-slate-50 border-2 border-[#0B2A5B] rounded-2xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#0B2A5B] bg-blue-100 px-2.5 py-0.5 rounded-full">
                      4. Auto-Generated Sample Appeal Letter
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      Sample {selectedCountry} Appeal / Reconsideration Letter ({selectedReason})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(analysisResult.sampleAppealLetter);
                        setCopiedSample(true);
                        setTimeout(() => setCopiedSample(false), 2500);
                      }}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedSample ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedSample ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadPdfText(
                          analysisResult.sampleAppealLetter,
                          `Sample_${selectedCountry}_Visa_Appeal_Letter.pdf`
                        )
                      }
                      className="px-4 py-2 bg-[#0B2A5B] hover:bg-[#0B3D91] text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
                <pre className="mt-4 p-4 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {analysisResult.sampleAppealLetter}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Tool 2: FREE Appeal Letter Generator */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B2A5B] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">FREE Appeal Letter Generator</h2>
                <p className="text-xs text-slate-500">Customize and download a personalized, embassy-ready Visa Appeal / Reconsideration Letter in PDF format</p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
              100% FREE • NO LOGIN
            </span>
          </div>

          <form onSubmit={handleGenerateCustomAppeal} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name (As on Passport) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Sharma"
                  value={appealForm.fullName}
                  onChange={(e) => setAppealForm({ ...appealForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Passport Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. P9823412"
                  value={appealForm.passportNumber}
                  onChange={(e) => setAppealForm({ ...appealForm, passportNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Refusal / Application Ref No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEU/DEL/2026/09412"
                  value={appealForm.applicationRef}
                  onChange={(e) => setAppealForm({ ...appealForm, applicationRef: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Destination Country *
                </label>
                <select
                  value={appealForm.country}
                  onChange={(e) => setAppealForm({ ...appealForm, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  <option value="Schengen (Germany / France / Italy / Spain)">Schengen (Germany / France / Italy / Spain)</option>
                  <option value="United States (USA)">United States (USA)</option>
                  <option value="United Kingdom (UK)">United Kingdom (UK)</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Consulate / Embassy City *
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Delhi / Mumbai / London"
                  value={appealForm.embassyCity}
                  onChange={(e) => setAppealForm({ ...appealForm, embassyCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Date of Visa Refusal
                </label>
                <input
                  type="date"
                  value={appealForm.refusalDate}
                  onChange={(e) => setAppealForm({ ...appealForm, refusalDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Primary Rejection Reason *
                </label>
                <select
                  value={appealForm.rejectionReason}
                  onChange={(e) => setAppealForm({ ...appealForm, rejectionReason: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                >
                  <option value="Weak ties to home country">Weak ties to home country</option>
                  <option value="Low bank balance">Low bank balance</option>
                  <option value="Incomplete documents">Incomplete documents</option>
                  <option value="Fake dummy ticket">Unverifiable flight / hotel reservation</option>
                  <option value="No travel history">No prior travel history</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Job Title &amp; Company
                </label>
                <input
                  type="text"
                  placeholder="e.g. Product Manager at Infosys"
                  value={appealForm.occupation}
                  onChange={(e) => setAppealForm({ ...appealForm, occupation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Monthly Income / Savings
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹1,10,000 / month"
                  value={appealForm.monthlyIncome}
                  onChange={(e) => setAppealForm({ ...appealForm, monthlyIncome: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                New Supporting Evidence Being Attached *
              </label>
              <textarea
                rows={2}
                value={appealForm.newEvidence}
                onChange={(e) => setAppealForm({ ...appealForm, newEvidence: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Generate Custom Appeal Letter (Free PDF)</span>
            </button>
          </form>

          {generatedAppeal && (
            <div id="custom-appeal-output" className="mt-8 p-6 bg-slate-50 border-2 border-emerald-600 rounded-2xl scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                    ✓ Custom Appeal Letter Ready
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    Official Visa Appeal &amp; Reconsideration Letter
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedAppeal);
                      setCopiedAppeal(true);
                      setTimeout(() => setCopiedAppeal(false), 2500);
                    }}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedAppeal ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAppeal ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadPdfText(
                        generatedAppeal,
                        `Visa_Appeal_Letter_${appealForm.fullName.replace(/\s+/g, '_') || 'Applicant'}.pdf`
                      )
                    }
                    className="px-4 py-2 bg-[#0B2A5B] hover:bg-[#0B3D91] text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
              <pre className="mt-4 p-4 bg-white border border-slate-200 rounded-xl font-mono text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto">
                {generatedAppeal}
              </pre>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">Frequently Asked Questions (Visa Rejection &amp; Appeal)</h2>
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

        {/* Email Only Subscribe Box */}
        <EmailSubscribeBox pageContext="Visa Rejection Appeal Guide" />
      </div>

      {/* Bottom Back to Home Button */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
