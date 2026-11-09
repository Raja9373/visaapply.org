import React, { useState, useMemo } from 'react';
import {
  Globe,
  CheckCircle2,
  Clock,
  DollarSign,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Award
} from 'lucide-react';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface OciPioGuidePageProps {
  onNavigate?: (path: string) => void;
}

type CitizenshipCountry = 'USA' | 'UK' | 'Canada' | 'Australia';

interface OciCitizenshipProfile {
  country: CitizenshipCountry;
  flag: string;
  eligibleStatus: string;
  feeDisplay: string;
  processingTime: string;
  submissionCenter: string;
  documentsRequired: string[];
  officialPortalUrl: string;
}

const CITIZENSHIP_PROFILES: Record<CitizenshipCountry, OciCitizenshipProfile> = {
  USA: {
    country: 'USA',
    flag: '🇺🇸',
    eligibleStatus: 'Yes — 100% Eligible (US Citizens of Indian Origin & Foreign Spouses)',
    feeDisplay: '$275 USD (+ $3 ICWF + VFS Service Fee ~$15.90)',
    processingTime: '30 to 45 Days (Via VFS Global USA — NY, SF, Chicago, Houston, Atlanta, DC)',
    submissionCenter: 'VFS Global USA (Official Embassy of India Partner)',
    documentsRequired: [
      'Current Valid US Passport (Minimum 6 months validity)',
      'Indian Citizenship Renunciation / Surrender Certificate + Cancelled Indian Passport',
      'US Naturalization Certificate',
      'Proof of Indian Origin (Copy of old Indian Passport, or Parents’/Grandparents’ Indian Passport & Birth Certificate)',
      '2x2 inch (51x51mm) Color Photograph with White Background (Uploaded on ociservices.gov.in)',
      'Proof of US Residential Address (State Driver’s License or Utility Bill)'
    ],
    officialPortalUrl: 'https://ociservices.gov.in/'
  },
  UK: {
    country: 'UK',
    flag: '🇬🇧',
    eligibleStatus: 'Yes — 100% Eligible (British Citizens of Indian Origin & Spouses)',
    feeDisplay: '$275 USD Equivalent (~£222 GBP + VFS Global UK Service Charge)',
    processingTime: '30 to 50 Days (Via VFS Global London, Birmingham, Edinburgh)',
    submissionCenter: 'High Commission of India London / VFS Global UK',
    documentsRequired: [
      'Current Valid British Passport (Minimum 6 months validity)',
      'Certificate of Surrender of Indian Passport (Issued by HCI London / Consulate)',
      'UK Certificate of Naturalisation / Registration as a British Citizen',
      'Full UK Birth Certificate (if born in the UK to Indian-origin parents) + Parents’ Indian Passports',
      '2x2 inch Square Photograph (Light/White Background)',
      'UK Address Proof (Council Tax Bill, Bank Statement, or UK Driving Licence)'
    ],
    officialPortalUrl: 'https://ociservices.gov.in/'
  },
  Canada: {
    country: 'Canada',
    flag: '🇨🇦',
    eligibleStatus: 'Yes — 100% Eligible (Canadian Citizens of Indian Origin & Spouses)',
    feeDisplay: '$275 USD Equivalent (~CAD $378 + BLS International Processing Fee)',
    processingTime: '35 to 60 Days (Via BLS International — Ottawa, Toronto, Vancouver)',
    submissionCenter: 'BLS International Canada (OfficialHCI Ottawa Partner)',
    documentsRequired: [
      'Current Valid Canadian Passport (Minimum 6 months validity)',
      'Surrender Certificate of Indian Citizenship + Cancelled Indian Passport',
      'Canadian Citizenship Certificate',
      'Proof of Relationship / Long-Form Birth Certificate (if applying through parents/grandparents)',
      '51mm x 51mm (2x2 inch) Photo matching MHA India OCI specifications',
      'Canadian Provincial Driver’s License or Utility Bill as Address Proof'
    ],
    officialPortalUrl: 'https://ociservices.gov.in/'
  },
  Australia: {
    country: 'Australia',
    flag: '🇦🇺',
    eligibleStatus: 'Yes — 100% Eligible (Australian Citizens of Indian Origin & Spouses)',
    feeDisplay: '$275 USD Equivalent (~AUD $425 + VFS Global Australia Fee)',
    processingTime: '30 to 50 Days (Via VFS Global Sydney, Melbourne, Perth, Brisbane, Canberra)',
    submissionCenter: 'VFS Global Australia (High Commission of India Canberra)',
    documentsRequired: [
      'Current Valid Australian Passport (Minimum 6 months validity)',
      'Official Indian Passport Surrender Certificate + Cancelled Indian Passport',
      'Australian Citizenship Certificate',
      'Birth Certificate & Proof of Indian Origin of Self / Parents / Grandparents',
      '2x2 inch White Background Biometric Photograph',
      'Australian Driver’s Licence or Rates Notice for Address Verification'
    ],
    officialPortalUrl: 'https://ociservices.gov.in/'
  }
};

const OCI_VS_PIO_VS_VISA_ROWS = [
  {
    feature: 'Visa Validity Duration',
    oci: 'Lifetime Visa-Free Entry to India',
    pio: 'Merged into OCI (PIO Cards valid until Dec 31, 2025 / Convert Free)',
    visa: '30 Days / 1 Year / 5 Years (Tourist e-Visa)'
  },
  {
    feature: 'Maximum Stay per Visit',
    oci: 'Unlimited Stay (Live in India Indefinitely)',
    pio: 'Up to 180 Days without FRRO',
    visa: 'Max 90 or 180 Days per Visit (Max 180 Days/Year)'
  },
  {
    feature: 'FRRO Police Registration',
    oci: '100% Exempt (Zero FRRO Registration Ever Needed)',
    pio: 'Required if continuous stay exceeds 180 days',
    visa: 'Strictly Limited to Tourist Stay Cap'
  },
  {
    feature: 'Right to Work & Study in India',
    oci: 'Yes — Work in Private Sector, Open Bank Accounts & Study on NRI Quota',
    pio: 'Converted to OCI for Full Parity',
    visa: 'No — Strictly Tourism/Recreation Only'
  },
  {
    feature: 'Official Government Fee',
    oci: '$275 USD (One-Time Lifetime Fee)',
    pio: 'Discontinued (Free Conversion to OCI)',
    visa: '$25 to $80 USD per Renewal'
  },
  {
    feature: 'Processing Time',
    oci: '30 to 60 Days',
    pio: 'N/A (Replaced by OCI)',
    visa: '3 to 4 Working Days (Online e-Visa)'
  }
];

export const OciPioGuidePage: React.FC<OciPioGuidePageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  const [selectedCitizenship, setSelectedCitizenship] = useState<CitizenshipCountry>('USA');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const profile = useMemo(
    () => CITIZENSHIP_PROFILES[selectedCitizenship],
    [selectedCitizenship]
  );

  const faqs = [
    {
      q: 'What is an OCI Card and who is eligible to apply?',
      a: 'OCI (Overseas Citizen of India) is a lifelong, multi-purpose, multiple-entry visa status granted by the Ministry of Home Affairs (MHA), Government of India, to foreign nationals who were formerly Indian citizens, or whose parents, grandparents, or great-grandparents were citizens of India (or foreign spouses married to an Indian citizen or OCI cardholder for at least 2 years). Please note: citizens of Pakistan and Bangladesh are not eligible for OCI.'
    },
    {
      q: 'What is the official fee and processing time for a fresh OCI Card?',
      a: 'The official Government of India consular fee for a fresh OCI Card application submitted abroad is $275 USD (or its local currency equivalent in GBP, CAD, AUD, or EUR), plus a nominal ICWF ($3) and VFS/BLS service charge. Processing takes 30 to 60 days from the date physical documents are received at the mission.'
    },
    {
      q: 'Do I need to get a new OCI Card every time I renew my foreign passport?',
      a: 'Under simplified MHA rules, an OCI cardholder only needs to apply for a re-issue of the physical OCI booklet once—after turning 20 years of age. For all other passport renewals (including after age 50), you simply upload a copy of your new foreign passport and recent photo for free on the Online OCI Miscellaneous Services portal (ociservices.gov.in).'
    },
    {
      q: 'What happened to PIO (Person of Indian Origin) Cards?',
      a: 'The Government of India merged the PIO Card scheme into the OCI Card scheme. All existing PIO cardholders are advised to convert their PIO card into a lifetime machine-readable OCI card via ociservices.gov.in.'
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
      <PageBackBar onNavigate={onNavigate} pageName="OCI / PIO Card Guide for NRI" />

      {/* Blue Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FREE GUIDE • LIFETIME INDIA VISA FOR NRIs &amp; INDIAN DIASPORA</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            OCI / PIO Card Guide for NRI
          </h1>
          <p className="text-sm sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Complete 2026 guide to the Overseas Citizen of India (OCI) Card: Lifetime visa-free travel to India, zero FRRO registration, $275 official fee, 30–60 day timeline, and country-by-country VFS / BLS document checklists.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* What is OCI? Who Can Apply? Key Benefits Summary */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                FREE Guide
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                What is OCI? Benefits, Fee ($275) &amp; Processing Time (30–60 Days)
              </h2>
            </div>

            <a
              href="https://ociservices.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-xs rounded-xl inline-flex items-center gap-1.5 self-start sm:self-center"
            >
              <span>Official MHA OCI Portal →</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-xs font-extrabold uppercase text-[#0B3D91]">1. Lifetime Visa</div>
              <div className="text-base font-black text-slate-900">Multiple-Entry for Life</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                No need to apply for an Indian visa ever again. Travel to India as many times as you want for life.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="text-xs font-extrabold uppercase text-[#0B3D91]">2. Zero FRRO Rule</div>
              <div className="text-base font-black text-slate-900">Stay Unlimited Years</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Exempt from reporting to FRRO / Police authorities for any length of continuous stay in India.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
              <div className="text-xs font-extrabold uppercase text-emerald-800">3. Official Fee</div>
              <div className="text-xl font-black text-emerald-700 tabular-nums">$275 USD</div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                One-time statutory fee for Fresh OCI Card (plus $3 ICWF and local VFS / BLS handling fee).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
              <div className="text-xs font-extrabold uppercase text-[#0B3D91]">4. Processing Time</div>
              <div className="text-xl font-black text-[#0B3D91] tabular-nums">30–60 Days</div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Standard turnaround from physical application submission at VFS Global or BLS International.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Citizenship Eligibility & Document Tool */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#0B3D91] bg-blue-50 px-3 py-1 rounded-full">
                NRI Eligibility &amp; Checklist Tool
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Select Your Current Foreign Citizenship
              </h2>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full self-start sm:self-center">
              FREE Guide
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['USA', 'UK', 'Canada', 'Australia'] as CitizenshipCountry[]).map((c) => {
              const p = CITIZENSHIP_PROFILES[c];
              const active = selectedCitizenship === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCitizenship(c)}
                  className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-50 border-[#0B3D91] ring-2 ring-[#0B3D91]/20'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-black uppercase text-slate-500">Current Passport</div>
                  <div className="text-base sm:text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                    <span>{p.flag}</span>
                    <span>{p.country}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Citizenship Result Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border-2 border-[#0B3D91] space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <span className="inline-block text-xs font-black uppercase bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                  Eligibility Check Result
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
                  {profile.flag} {profile.country} Passport Holders: {profile.eligibleStatus}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-extrabold uppercase text-slate-500">
                  Official OCI Fee ({profile.country})
                </div>
                <div className="text-sm sm:text-base font-black text-emerald-700 mt-1 tabular-nums">
                  {profile.feeDisplay}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-extrabold uppercase text-slate-500">
                  Processing Time
                </div>
                <div className="text-sm sm:text-base font-black text-[#0B3D91] mt-1 tabular-nums">
                  {profile.processingTime}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-extrabold uppercase text-slate-500">
                  Authorized Submission Partner
                </div>
                <div className="text-sm font-black text-slate-900 mt-1">
                  {profile.submissionCenter}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2.5">
              <div className="text-xs font-extrabold uppercase text-slate-700">
                Mandatory Documents for OCI Application from {profile.country}:
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {profile.documentsRequired.map((docItem, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{docItem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* OCI vs PIO vs Visa Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                OCI vs PIO vs Indian Tourist Visa — Complete Comparison Table
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                See why NRIs and foreign citizens of Indian origin prefer the lifetime OCI Card over regular e-Visas.
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full self-start sm:self-center">
              FREE Guide
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-extrabold">Feature</th>
                  <th className="py-3.5 px-4 font-extrabold text-emerald-300">OCI Card (Overseas Citizen of India)</th>
                  <th className="py-3.5 px-4 font-extrabold">PIO Card (Person of Indian Origin)</th>
                  <th className="py-3.5 px-4 font-extrabold">Regular Indian Tourist e-Visa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {OCI_VS_PIO_VS_VISA_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40">
                    <td className="py-4 px-4 font-black text-slate-900">{row.feature}</td>
                    <td className="py-4 px-4 font-bold text-emerald-800 bg-emerald-50/40">{row.oci}</td>
                    <td className="py-4 px-4 font-medium text-slate-600">{row.pio}</td>
                    <td className="py-4 px-4 font-semibold text-slate-700">{row.visa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">
              Frequently Asked Questions (OCI / PIO Card Guide for NRI)
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
        <EmailSubscribeBox pageContext="OCI / PIO Card Guide for NRI" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
