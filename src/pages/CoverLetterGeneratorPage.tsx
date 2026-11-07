import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Download, 
  Check, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  BookOpen, 
  Briefcase,
  User,
  Globe2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { FreeLeadMagnetBar } from '../components/FreeLeadMagnetBar';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface CoverLetterGeneratorPageProps {
  onNavigate?: (path: string) => void;
}

const POPULAR_DESTINATIONS = [
  'France (Schengen)', 'Germany (Schengen)', 'Italy (Schengen)', 'Spain (Schengen)',
  'Switzerland (Schengen)', 'Netherlands (Schengen)', 'United States (USA)',
  'United Kingdom (UK)', 'Canada', 'Australia', 'New Zealand', 'Japan',
  'United Arab Emirates (UAE)', 'Singapore', 'Thailand', 'Malaysia', 'Vietnam',
  'South Korea', 'Turkey', 'Russia', 'South Africa', 'Saudi Arabia', 'Qatar',
  'Oman', 'Bahrain', 'Kuwait', 'Egypt', 'Brazil', 'Argentina', 'Mexico',
  'Indonesia (Bali)', 'Sri Lanka', 'Nepal', 'Georgia', 'Azerbaijan', 'Kazakhstan',
  'Uzbekistan', 'Philippines', 'Cambodia', 'Morocco', 'Kenya'
];

export const CoverLetterGeneratorPage: React.FC<CoverLetterGeneratorPageProps> = ({ onNavigate = (p) => { window.history.pushState({}, '', p); window.scrollTo(0,0); } }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    passportNumber: '',
    destinationCountry: 'France (Schengen)',
    embassyCity: 'New Delhi',
    visaType: 'Tourist',
    startDate: '',
    endDate: '',
    jobOccupation: '',
    companyName: '',
    monthlyIncome: '₹85,000 / month',
    payer: 'Self',
    sponsorName: '',
    sponsorRelation: '',
    homeAddress: '',
    tiesToHome: 'Permanent corporate employment, family responsibilities, and owned immovable property in India'
  });

  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.destinationCountry) {
      alert('Please enter your full name and destination country.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const isSchengen = formData.destinationCountry.toLowerCase().includes('schengen');
    const destClean = formData.destinationCountry.replace(/\(.*\)/, '').trim();

    let letter = `Date: ${todayStr}

To,
The Visa Consular Officer,
The Embassy / Consulate General of ${destClean},
Consular & Visa Section,
${formData.embassyCity || 'New Delhi'}, India.

Subject: Application for ${destClean} ${formData.visaType} Visa – Passport No: ${formData.passportNumber || '[PASSPORT NO]'}

Respected Visa Officer,

I, ${formData.fullName.trim() || '[YOUR FULL NAME]'}, holding Indian Passport No. ${formData.passportNumber.trim() || '[PASSPORT NUMBER]'}, am formally submitting my application for a ${formData.visaType} Visa to visit ${destClean} from ${formData.startDate || '[START DATE]'} to ${formData.endDate || '[END DATE]'}.

1. PURPOSE OF VISIT:
The primary objective of my travel is ${formData.visaType.toLowerCase() === 'tourist' ? 'leisure tourism, exploring cultural landmarks, architectural monuments, and experiencing local heritage' : formData.visaType.toLowerCase() === 'business' ? 'attending scheduled corporate discussions, prospective business conferences, and commercial vendor meetings' : 'academic study, attending verified university curriculum, and educational coursework'}. During my stay, I intend to abide strictly by all civil and immigration laws of ${destClean}${isSchengen ? ' and the Schengen Member States' : ''}.

2. PROFESSIONAL & FINANCIAL BACKGROUND:
I am presently gainfully employed as a "${formData.jobOccupation || 'Software Professional'}"${formData.companyName ? ` at ${formData.companyName}` : ''}. My current monthly remuneration is approximately ${formData.monthlyIncome || '₹85,000 per month'}, deposited regularly into my primary bank account. I have attached my official salary slips for the past 6 months along with Income Tax Returns (ITR-V) and bank statements reflecting adequate liquid disposable funds to cover all travel expenditures.

3. SPONSORSHIP & FINANCIAL SOLVENCY:
${formData.payer === 'Self' 
  ? `All expenses associated with this visit—including roundtrip flight reservations, hotel accommodation, internal conveyance, daily sustenance, and comprehensive travel medical insurance—will be fully borne by myself from personal savings.` 
  : `The expenses for this journey will be sponsored by ${formData.sponsorName || 'my sponsor'} (${formData.sponsorRelation || 'sponsor relationship'}), who has executed an official Affidavit of Support accompanied by certified bank solvency certificates.`}

4. STRONG TIES TO INDIA & RETURN GUARANTEE:
I possess deep social, economic, familial, and professional roots in India that mandate my timely repatriation immediately upon concluding my itinerary:
- Career Obligations: I hold an approved No Objection Certificate (NOC) and paid leave sanction letter from my employer, confirming my resumption of duty in India on the appointed date.
- Family & Community: My immediate family members and close dependents reside permanently in India, where I maintain my permanent household.
- Financial & Asset Ties: I hold established banking portfolios, investment securities, and ${formData.tiesToHome || 'immovable assets'} in India.

I hereby solemnly declare that I will NOT overstay my visa, will NOT seek unauthorized employment, and will depart ${destClean} well prior to the expiry of my authorized period of stay.

LIST OF ENCLOSED DOCUMENTS:
1. Completed and signed Visa Application Form
2. Original Passport with valid blank visa pages
3. Two recent passport photographs (strictly compliant with consular biometrics specifications)
4. Confirmed Roundtrip Flight Itinerary and Reservation (Verifiable PNR)
5. Confirmed Hotel Booking Vouchers for all intended destinations
6. Comprehensive Overseas Travel Medical Insurance (Coverage: €30,000 / $50,000 USD minimum)
7. Bank Statements for the past 6 months, attested and sealed by the issuing bank
8. Income Tax Returns (ITR-V Acknowledgements) for the last 3 financial assessment years
9. Leave Sanction Letter and No Objection Certificate (NOC) from employer
10. Detailed Day-by-Day Travel Itinerary and sight-seeing roadmap

Thank you for your valuable time and consideration of my visa application. I remain available should any additional documentation or personal interview be required.

Yours faithfully,

(Signature)

${formData.fullName.trim() || '[YOUR FULL NAME]'}
Passport No: ${formData.passportNumber.trim() || '[PASSPORT NO]'}
Contact: ${formData.homeAddress ? `${formData.homeAddress} • ` : ''}India
`;

    setGeneratedLetter(letter);

    // Scroll to the generated output box
    setTimeout(() => {
      const el = document.getElementById('letter-output-box');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = () => {
    if (!generatedLetter) return;
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
      const splitText = doc.splitTextToSize(generatedLetter, pageWidth);

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

      const cleanFileName = `Visa_Cover_Letter_${formData.fullName.replace(/\s+/g, '_') || 'Applicant'}.pdf`;
      doc.save(cleanFileName);
    } catch (err) {
      alert('Unable to generate PDF directly. You can copy the text below into Microsoft Word or Google Docs.');
    }
  };

  const faqs = [
    {
      q: "What is a visa cover letter and why is it important?",
      a: "A visa cover letter is your formal written introduction directly to the consular officer evaluating your passport. It ties your entire application dossier together by detailing your visit purpose, funding evidence, day-by-day travel plan, and most importantly, your compelling ties to your home country guaranteeing your return."
    },
    {
      q: "Should I mention my exact monthly income and employer in the letter?",
      a: "Yes, absolutely. Consular officers verify the numbers in your letter against your submitted bank statements, salary slips, and Income Tax Returns (ITR). Providing consistent, exact numbers builds immediate credibility."
    },
    {
      q: "How does this generator demonstrate strong ties to India?",
      a: "The generated template specifically includes statutory sections regarding your employment leave sanction (NOC), family obligations, property/investment holdings, and a formal undertaking guaranteeing timely repatriation prior to visa expiry."
    },
    {
      q: "Is this cover letter generator completely free?",
      a: "Yes, 100% free with no hidden charges, no account creation, and no watermark on the PDF download."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Top Back Bar & Breadcrumb */}
      <PageBackBar onNavigate={onNavigate} pageName="Cover Letter Generator" />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>100% Free Consular Tool • Instant PDF Download</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Free Cover Letter Generator for Visa
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Generate an embassy-grade, professionally articulated visa application cover letter for Schengen, USA, UK, Canada, Australia, and 249 nations. Complete with ties to home country and return guarantee.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Form Container */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B3D91] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Applicant &amp; Travel Information</h2>
              <p className="text-xs text-slate-500">Fill in the details below to synthesize your official consular cover letter</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Row 1: Name & Passport */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name (As on Passport) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Passport Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M8765432"
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>
            </div>

            {/* Row 2: Destination & Embassy City & Visa Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Destination Country *
                </label>
                <select
                  value={formData.destinationCountry}
                  onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                >
                  {POPULAR_DESTINATIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Embassy / Consular City *
                </label>
                <select
                  value={formData.embassyCity}
                  onChange={(e) => setFormData({ ...formData, embassyCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                >
                  <option value="New Delhi">New Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bengaluru">Bengaluru</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Visa Category *
                </label>
                <select
                  value={formData.visaType}
                  onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                >
                  <option value="Tourist">Tourist / Visitor Visa</option>
                  <option value="Business">Business / Conference Visa</option>
                  <option value="Student">Student / Academic Visa</option>
                </select>
              </div>
            </div>

            {/* Row 3: Travel Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Intended Departure Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Intended Return Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>
            </div>

            {/* Row 4: Job & Income */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Job Title / Occupation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Software Architect"
                  value={formData.jobOccupation}
                  onChange={(e) => setFormData({ ...formData, jobOccupation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Employer / Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tata Consultancy Services"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Monthly Income *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹95,000 / month"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>
            </div>

            {/* Row 5: Who is Paying */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Who is Funding the Trip? *
                </label>
                <select
                  value={formData.payer}
                  onChange={(e) => setFormData({ ...formData, payer: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                >
                  <option value="Self">Self-Funded (Personal Savings)</option>
                  <option value="Sponsor">Sponsored by Family / Employer</option>
                </select>
              </div>

              {formData.payer === 'Sponsor' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Sponsor's Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Malhotra"
                      value={formData.sponsorName}
                      onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Relationship to Applicant *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Father / Corporate Employer"
                      value={formData.sponsorRelation}
                      onChange={(e) => setFormData({ ...formData, sponsorRelation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Submit CTA */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-4 bg-[#0B3D91] hover:bg-[#082e6d] text-white font-black text-base rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Generate Official Visa Cover Letter (Free)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Generated Letter Display Box */}
        {generatedLetter && (
          <div id="letter-output-box" className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-[#0B3D91] mb-12 scroll-mt-24">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  ✓ Ready for Submission
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Generated Consular Cover Letter</h3>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#0B3D91] hover:bg-[#082e6d] text-white text-xs font-black rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download as PDF</span>
                </button>
              </div>
            </div>

            <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner max-h-[500px] overflow-y-auto">
              {generatedLetter}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Standard A4 formatting • Embassy accepted language</span>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="text-[#0B3D91] font-bold hover:underline"
              >
                Click here to download formatted PDF →
              </button>
            </div>
          </div>
        )}

        {/* SEO Educational Text: 5 Tips on How to write cover letter for visa */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-[#0B3D91]" />
            <h2 className="text-xl font-black text-slate-900">
              How to Write a Flawless Cover Letter for Visa (5 Essential Tips)
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-base mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0B3D91] text-white text-xs flex items-center justify-center font-bold">1</span>
                Address the Exact Consulate &amp; State Specific Dates
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Always address the designated Embassy or Consulate General in the specific jurisdiction where you are submitting your biometrics (e.g., Embassy of Germany, New Delhi). Ensure your arrival and departure dates perfectly match your flight reservation vouchers.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-base mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0B3D91] text-white text-xs flex items-center justify-center font-bold">2</span>
                Clearly Explain Your Trip Purpose &amp; Day-by-Day Plan
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Ambiguity triggers visa rejections. Outline whether you are traveling for leisure, visiting relatives, or attending client meetings. Provide a high-level summary of which cities and hotels you have booked.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-base mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0B3D91] text-white text-xs flex items-center justify-center font-bold">3</span>
                Demonstrate Clear Financial Solvency
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Clearly declare who is financing your expedition. If self-funded, point to your attached 6-month bank statements and Income Tax Returns (ITR). If sponsored, reference the sponsor's affidavit and financial declarations.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-base mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0B3D91] text-white text-xs flex items-center justify-center font-bold">4</span>
                Prove Irrefutable Ties to Your Home Country (India)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Under visa laws (such as US INA Section 214(b) and Schengen Visa Code Article 32), applicants are presumed to have immigrant intent until proven otherwise. Detail your permanent employment, approved company leave (NOC), family dependants, and immovable property.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-base mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0B3D91] text-white text-xs flex items-center justify-center font-bold">5</span>
                Include a Signed Undertaking &amp; Document Index
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                End with an unambiguous promise to abide by visa validity periods and depart on time. Conclude with an organized checklist of all attached supporting papers so the consular reviewer can cross-check quickly.
              </p>
            </div>
          </div>
        </div>

        {/* Lead Magnet Bar: Join Free WhatsApp Channel + Email Newsletter + AdSense Banner */}
        <FreeLeadMagnetBar pageContext="Cover Letter Generator Free Tool" adSlot="cover_letter_banner" />

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B3D91]" />
            <h2 className="text-xl font-black text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm sm:text-base text-slate-900 bg-slate-50/50 hover:bg-slate-100/70 flex justify-between items-center gap-3 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
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
      </div>

      {/* Bottom Back Button */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
