import React, { useState } from 'react';
import {
  Landmark,
  CheckCircle2,
  AlertTriangle,
  Download,
  Sparkles,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface BankStatementGuidePageProps {
  onNavigate?: (path: string) => void;
}

type SupportedCountry = 'Schengen' | 'USA' | 'UK' | 'Canada';
type SupportedVisaType = 'Tourist' | 'Student';
type SupportedDays = '7' | '15' | '30';

interface BalanceResult {
  country: SupportedCountry;
  visaType: SupportedVisaType;
  days: number;
  baseReserveInr: number;
  perDayInr: number;
  totalRecommendedInr: number;
  totalRecommendedUsd: number;
  headlineFormula: string;
  embassyRuleNote: string;
  statementMonthsRequired: string;
}

const FIVE_GOLDEN_TIPS = [
  {
    num: '01',
    title: 'Do NOT Deposit a Sudden Lump Sum Before Applying',
    desc: 'Never transfer ₹2 Lakhs–₹5 Lakhs in cash or unexplained transfers right before printing your statement. Consular officers flag sudden spikes as "borrowed funds" under INA 214(b) and Schengen Article 32.'
  },
  {
    num: '02',
    title: 'Keep a Steady, Seasoned Balance for 3 to 6 Months',
    desc: 'Maintain a gradually growing or stable closing balance across the entire 6-month window so the officer sees genuine personal savings rather than temporary window-dressing.'
  },
  {
    num: '03',
    title: 'Show Regular Monthly Salary or Business Credits',
    desc: 'Highlight your monthly salary deposits (NEFT/IMPS from your employer) so they match your last 6 months of salary slips and 3 years of Income Tax Returns (ITR-V).'
  },
  {
    num: '04',
    title: 'Get Original Bank Branch Stamp & Signature on Every Page',
    desc: 'For VFS Global and Embassy submissions (especially Schengen, UK, and Canada), print your 6-month statement and get the official bank seal, banker signature, and IFSC/MICR stamp.'
  },
  {
    num: '05',
    title: 'Include Secondary Liquid Assets (FDs, Mutual Funds & ITR)',
    desc: 'Alongside your primary savings/salary account, attach Fixed Deposit (FD) receipts, Mutual Fund CAS statements, and 3 years of ITR Acknowledgements to prove strong overall net worth.'
  }
];

const SIX_MONTH_SAMPLE_ROWS = [
  {
    month: 'Month 1 (5 Months Ago)',
    opening: '₹3,10,000',
    credit: '+₹95,000 (Salary NEFT)',
    debit: '-₹52,000 (Rent, EMIs & Living)',
    closing: '₹3,53,000',
    status: 'Healthy'
  },
  {
    month: 'Month 2 (4 Months Ago)',
    opening: '₹3,53,000',
    credit: '+₹95,000 (Salary NEFT)',
    debit: '-₹48,000 (Living & Utilities)',
    closing: '₹4,00,000',
    status: 'Healthy'
  },
  {
    month: 'Month 3 (3 Months Ago)',
    opening: '₹4,00,000',
    credit: '+₹98,500 (Salary + Quarterly Bonus)',
    debit: '-₹54,500 (Regular Expenses)',
    closing: '₹4,44,000',
    status: 'Healthy'
  },
  {
    month: 'Month 4 (2 Months Ago)',
    opening: '₹4,44,000',
    credit: '+₹95,000 (Salary NEFT)',
    debit: '-₹49,000 (Regular Expenses)',
    closing: '₹4,90,000',
    status: 'Healthy'
  },
  {
    month: 'Month 5 (Last Month)',
    opening: '₹4,90,000',
    credit: '+₹95,000 (Salary NEFT)',
    debit: '-₹62,000 (Flight & Insurance Payment)',
    closing: '₹5,23,000',
    status: 'Verified Trip Spend'
  },
  {
    month: 'Month 6 (Current Month)',
    opening: '₹5,23,000',
    credit: '+₹95,000 (Salary NEFT)',
    debit: '-₹43,000 (Regular Expenses)',
    closing: '₹5,75,000',
    status: 'Ready for Submission'
  }
];

function calculateBalanceRequirement(
  country: SupportedCountry,
  visaType: SupportedVisaType,
  daysStr: SupportedDays
): BalanceResult {
  const days = parseInt(daysStr, 10) || 15;

  if (visaType === 'Student') {
    const studentMap: Record<
      SupportedCountry,
      { baseInr: number; perDayInr: number; totalInr: number; totalUsd: number; formula: string; note: string }
    > = {
      Schengen: {
        baseInr: 1050000,
        perDayInr: 0,
        totalInr: 1050000,
        totalUsd: 12500,
        formula: 'Rs 10,50,000 (~€11,904 Blocked Account / 1-Year Living Proof) + First-Year Tuition Fee',
        note: 'Schengen Student Visas (such as Germany Sperrkonto or France Campus France) require proof of €992/month (€11,904/year = ~Rs 10.5 Lakhs) in a Blocked Account or liquid sponsor savings.'
      },
      USA: {
        baseInr: 2500000,
        perDayInr: 0,
        totalInr: 2500000,
        totalUsd: 30000,
        formula: 'Rs 25,00,000 to Rs 40,00,000 (100% of 1st-Year I-20 Tuition + Living Expenses)',
        note: 'For US F-1 Student Visas, liquid bank balance + sanctioned education loan must cover at least 100% of the first-year total cost stated on your university Form I-20.'
      },
      UK: {
        baseInr: 1350000,
        perDayInr: 0,
        totalInr: 1350000,
        totalUsd: 16000,
        formula: 'Rs 13,50,000 (£1,334/month London or £1,023/month Outside London for 9 Months) + Unpaid Tuition',
        note: 'UKVI Student Visa rules strictly require the exact maintenance funds plus remaining 1st-year course fees to be held continuously for at least 28 consecutive days before application.'
      },
      Canada: {
        baseInr: 1300000,
        perDayInr: 0,
        totalInr: 1300000,
        totalUsd: 15500,
        formula: 'Rs 13,00,000 (CAD $20,635 GIC / Living Proof) + First-Year Tuition Fee Receipt',
        note: 'IRCC Canada Study Permit requires CAD $20,635 (~Rs 13,00,000) for living expenses (via GIC or 4–6 months bank statements) on top of first-year tuition.'
      }
    };

    const st = studentMap[country];
    return {
      country,
      visaType,
      days,
      baseReserveInr: st.baseInr,
      perDayInr: st.perDayInr,
      totalRecommendedInr: st.totalInr,
      totalRecommendedUsd: st.totalUsd,
      headlineFormula: st.formula,
      embassyRuleNote: st.note,
      statementMonthsRequired: 'Last 6 Months Stamped Bank Statement + 28-Day Continuous Holding Rule'
    };
  }

  // Tourist Visa calculations
  const touristConfig: Record<
    SupportedCountry,
    { baseReserveInr: number; perDayInr: number; note: string }
  > = {
    Schengen: {
      baseReserveInr: 300000,
      perDayInr: 15000,
      note: 'Schengen Consulates require €100–€120/day (~Rs 10,000–Rs 15,000/day) plus a base safety reserve of Rs 3,00,000 to cover return airfare, hotels, and emergency cushion.'
    },
    USA: {
      baseReserveInr: 400000,
      perDayInr: 18000,
      note: 'For US B1/B2 Tourist Visas, maintain a strong closing balance of Rs 4,00,000 base reserve plus Rs 18,000 (~$215) per day of planned stay in the United States.'
    },
    UK: {
      baseReserveInr: 350000,
      perDayInr: 16000,
      note: 'UK Standard Visitor Visa officers evaluate whether your trip cost is a reasonable fraction (ideally under 30%–40%) of your total liquid savings. Keep Rs 3,50,000 base + Rs 16,000/day.'
    },
    Canada: {
      baseReserveInr: 350000,
      perDayInr: 15000,
      note: 'For a Canada Temporary Resident Visa (TRV), IRCC officers look for Rs 3,50,000 base reserve plus Rs 15,000 (~CAD $250) per day of stay, backed by 6 months of bank statements and 3 years ITR.'
    }
  };

  const cfg = touristConfig[country];
  const totalInr = cfg.baseReserveInr + cfg.perDayInr * days;
  const totalUsd = Math.round(totalInr / 84);

  return {
    country,
    visaType,
    days,
    baseReserveInr: cfg.baseReserveInr,
    perDayInr: cfg.perDayInr,
    totalRecommendedInr: totalInr,
    totalRecommendedUsd: totalUsd,
    headlineFormula: `Rs ${cfg.baseReserveInr.toLocaleString('en-IN')} + Rs ${cfg.perDayInr.toLocaleString('en-IN')} per day (For ${country} ${visaType} ${days} Days = Rs ${totalInr.toLocaleString('en-IN')})`,
    embassyRuleNote: cfg.note,
    statementMonthsRequired: 'Last 6 Months Stamped & Signed Bank Statement + 3 Years ITR'
  };
}

export const BankStatementGuidePage: React.FC<BankStatementGuidePageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  const [selectedCountry, setSelectedCountry] = useState<SupportedCountry>('Schengen');
  const [selectedVisaType, setSelectedVisaType] = useState<SupportedVisaType>('Tourist');
  const [selectedDays, setSelectedDays] = useState<SupportedDays>('15');
  const [result, setResult] = useState<BalanceResult>(() =>
    calculateBalanceRequirement('Schengen', 'Tourist', '15')
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCheckBalance = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calculateBalanceRequirement(selectedCountry, selectedVisaType, selectedDays);
    setResult(res);
    setTimeout(() => {
      const el = document.getElementById('bank-balance-result');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const handleDownloadChecklistPdf = () => {
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
    doc.text('VisaApply.org - Official Bank Statement Checklist for Visa', margin, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(219, 234, 254);
    doc.text(
      `Target: ${result.country} (${result.visaType} Visa - ${result.days} Days)   |   Generated: ${todayStr}`,
      margin,
      23
    );

    let y = 42;

    // Required Balance Box
    doc.setFillColor(236, 253, 245);
    doc.rect(margin, y - 5, contentWidth, 28, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(6, 95, 70);
    doc.text('1. RECOMMENDED MINIMUM BANK BALANCE', margin + 4, y + 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Formula: ${result.headlineFormula}`, margin + 4, y + 9);
    doc.text(
      `Total Recommended Closing Balance: Rs ${result.totalRecommendedInr.toLocaleString('en-IN')} (~$${result.totalRecommendedUsd.toLocaleString('en-US')} USD)`,
      margin + 4,
      y + 15.5
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const noteLines = doc.splitTextToSize(result.embassyRuleNote, contentWidth - 8);
    doc.text(noteLines.slice(0, 2), margin + 4, y + 21);

    y += 33;

    // Mandatory Bank Statement Checklist
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 61, 145);
    doc.text('2. MANDATORY BANK STATEMENT & FINANCIAL CHECKLIST', margin, y);
    y += 6;

    const checklistItems = [
      '[ ] Last 6 Months Original Bank Statement (Savings / Salary Account)',
      '[ ] Official Bank Branch Rubber Stamp & Authorized Officer Signature on All Pages',
      '[ ] Closing Balance updated within 3 to 7 days prior to your VFS / Embassy appointment',
      '[ ] Last 6 Months Salary Slips (Stamped by Employer HR or Digitally Verifiable)',
      '[ ] Last 3 Years Income Tax Returns (ITR-V Acknowledgement Pages)',
      '[ ] Zero unexplained large cash or lump-sum deposits in the last 90 days',
      '[ ] Secondary Net-Worth Proof: Fixed Deposit (FD) Summary / Mutual Fund CAS Statement',
      '[ ] If Sponsored: Notarized Affidavit of Support + Sponsor 6-Month Bank Statement & ITR'
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.2);
    doc.setTextColor(30, 41, 59);
    checklistItems.forEach((item) => {
      doc.text(item, margin + 2, y);
      y += 6.2;
    });

    y += 4;

    // 5 Golden Rules
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 61, 145);
    doc.text('3. 5 GOLDEN RULES TO AVOID FINANCIAL VISA REJECTION', margin, y);
    y += 6;

    FIVE_GOLDEN_TIPS.forEach((tip) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.2);
      doc.setTextColor(15, 23, 42);
      doc.text(`${tip.num}. ${tip.title}`, margin + 2, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(71, 85, 105);
      const wrapped = doc.splitTextToSize(tip.desc, contentWidth - 6);
      doc.text(wrapped, margin + 4, y);
      y += wrapped.length * 4 + 2.5;
    });

    // Footer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      '100% Free Official Guide by VisaApply.org/bank-statement-guide — Pure Consular Verification Standard.',
      margin,
      286
    );

    doc.save(`Bank_Statement_Checklist_${result.country}_${result.visaType}_Visa.pdf`);
  };

  const faqs = [
    {
      q: 'How much bank balance is required for a 15-day Schengen Tourist Visa from India?',
      a: 'For a 15-day Schengen Tourist Visa, the recommended minimum closing bank balance is Rs 3,00,000 base reserve + Rs 15,000 per day of stay (Rs 5,25,000 total, or approximately €5,800 / $6,250). This comfortably covers round-trip flights, hotel reservations, daily expenses of €100–€120/day, and an emergency financial buffer.'
    },
    {
      q: 'Can I deposit a lump sum of money into my bank account right before applying for a visa?',
      a: 'No. Depositing a large lump sum of cash or unexplained transfers shortly before printing your bank statement is one of the top reasons for visa refusal. Consular officers check the 6-month transaction history to verify that your closing balance comes from steady monthly salary credits or legitimate business income.'
    },
    {
      q: 'Do e-statements work, or do I need a physical bank stamp and signature?',
      a: 'For VFS Global submissions (Schengen, UK, Canada, and many Asian/European embassies), you must submit a physical printout of your last 6 months bank statement bearing the official bank branch rubber stamp and signature of a bank officer on every page.'
    },
    {
      q: 'Can I show Fixed Deposits (FDs) or Mutual Funds instead of savings account balance?',
      a: 'Your primary requirement is liquid, immediately accessible funds in your Savings or Salary account. Fixed Deposits (FDs), Mutual Funds, and Public Provident Fund (PPF) statements are excellent supporting documents to prove overall financial net worth, but they should supplement—not replace—your liquid savings balance.'
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
      <PageBackBar onNavigate={onNavigate} pageName="Bank Statement Guide for Visa" />

      {/* Blue Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>100% FREE CONSULAR FINANCIAL CALCULATOR &amp; SAMPLE GUIDE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Bank Statement Guide for Visa - How Much Balance Do You Need?
          </h1>
          <p className="text-sm sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Calculate the exact minimum closing bank balance required for USA, Schengen, UK, and Canada Tourist or Student visas. View a verified 6-month bank statement sample and download our free Bank Statement Checklist PDF.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* Interactive Calculator Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                100% Free Balance Calculator
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Select Destination, Visa Type &amp; Trip Duration
              </h2>
            </div>

            <button
              type="button"
              onClick={handleDownloadChecklistPdf}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Bank Statement Checklist PDF</span>
            </button>
          </div>

          <form onSubmit={handleCheckBalance} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Country */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  1. Select Country
                </label>
                <select
                  aria-label="Select Country"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value as SupportedCountry)}
                  className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
                >
                  <option value="Schengen">🇪🇺 Schengen (France / Germany / Italy / Switzerland)</option>
                  <option value="USA">🇺🇸 USA (B1/B2 Tourist &amp; F-1 Student)</option>
                  <option value="UK">🇬🇧 United Kingdom (Standard Visitor &amp; Student)</option>
                  <option value="Canada">🇨🇦 Canada (TRV Visitor &amp; Study Permit)</option>
                </select>
              </div>

              {/* 2. Visa Type */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  2. Select Visa Type
                </label>
                <select
                  aria-label="Select Visa Type"
                  value={selectedVisaType}
                  onChange={(e) => setSelectedVisaType(e.target.value as SupportedVisaType)}
                  className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
                >
                  <option value="Tourist">🏖️ Tourist / Visitor Visa</option>
                  <option value="Student">🎓 Student / Study Visa</option>
                </select>
              </div>

              {/* 3. Trip Days */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  3. Select Trip Days
                </label>
                <select
                  aria-label="Select Trip Days"
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(e.target.value as SupportedDays)}
                  className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
                >
                  <option value="7">7 Days Trip</option>
                  <option value="15">15 Days Trip</option>
                  <option value="30">30 Days Trip</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Landmark className="w-5 h-5" />
              <span>Check Required Balance →</span>
            </button>
          </form>
        </div>

        {/* Result Card */}
        <div id="bank-balance-result" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border-2 border-emerald-500 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  OFFICIAL REQUIREMENT FOR {result.country.toUpperCase()} {result.visaType.toUpperCase()} VISA ({result.days} DAYS)
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Required Balance: {result.headlineFormula}
              </h3>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5 text-left md:text-right shrink-0">
              <div className="text-xs font-extrabold uppercase text-emerald-800">
                Recommended Closing Balance
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums">
                Rs {result.totalRecommendedInr.toLocaleString('en-IN')}
              </div>
              <div className="text-xs font-bold text-slate-600 tabular-nums">
                Approx. ${result.totalRecommendedUsd.toLocaleString('en-US')} USD
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0B3D91]" />
                <span>Consular Financial Rule</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{result.embassyRuleNote}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0B3D91]" />
                <span>Statement Duration &amp; Attestation</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                <strong>{result.statementMonthsRequired}</strong>. Ensure the statement is printed within 7 days of your VFS appointment with official bank stamp and signature.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs font-bold text-slate-500">
              Want to carry this exact checklist to your bank branch before your visa appointment?
            </span>
            <button
              type="button"
              onClick={handleDownloadChecklistPdf}
              className="py-3 px-5 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-xs sm:text-sm rounded-xl shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>FREE Download: Bank Statement Checklist PDF</span>
            </button>
          </div>
        </div>

        {/* 6-Month Statement Sample Table */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#0B3D91] bg-blue-50 px-3 py-1 rounded-full">
                Verified Consular Format
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                6-Month Bank Statement Sample (Ideal Progression for Visa Approval)
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Below is an ideal 6-month savings/salary account progression showing consistent monthly salary credits, normal living expenses, and a naturally growing closing balance with zero suspicious lump-sum cash deposits:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-extrabold">Statement Month</th>
                  <th className="py-3.5 px-4 font-extrabold">Opening Balance</th>
                  <th className="py-3.5 px-4 font-extrabold">Salary / Income Credits</th>
                  <th className="py-3.5 px-4 font-extrabold">Regular Debits</th>
                  <th className="py-3.5 px-4 font-extrabold">Closing Balance</th>
                  <th className="py-3.5 px-4 font-extrabold">Officer Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {SIX_MONTH_SAMPLE_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.month}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 tabular-nums">{row.opening}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 tabular-nums">{row.credit}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 tabular-nums">{row.debit}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900 tabular-nums">{row.closing}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                        ✓ {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5 Tips Box */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
              Mandatory Financial Rules
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              5 Essential Bank Statement Tips for 100% Visa Approval
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FIVE_GOLDEN_TIPS.map((tip) => (
              <div
                key={tip.num}
                className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#0B3D91] text-white text-xs font-black flex items-center justify-center shrink-0">
                    {tip.num}
                  </span>
                  <h3 className="font-black text-sm sm:text-base text-slate-900">{tip.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">
              Frequently Asked Questions (Bank Statement Guide for Visa)
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
        <EmailSubscribeBox pageContext="Bank Statement Guide for Visa" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
