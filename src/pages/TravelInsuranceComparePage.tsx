import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  HeartPulse,
  Award
} from 'lucide-react';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface TravelInsuranceComparePageProps {
  onNavigate?: (path: string) => void;
}

export const TravelInsuranceComparePage: React.FC<TravelInsuranceComparePageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('Schengen (All 29 Countries)');
  const [tripDays, setTripDays] = useState<string>('15');
  const [travelerAge, setTravelerAge] = useState<string>('18-35');
  const [coverageAmount, setCoverageAmount] = useState<string>('€30,000 / $50,000 (Schengen Mandatory)');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = useMemo(() => {
    const daysNum = parseInt(tripDays, 10) || 15;
    const dayMultiplier = daysNum <= 7 ? 0.85 : daysNum <= 15 ? 1 : daysNum <= 30 ? 1.45 : 2.1;
    const ageMultiplier =
      travelerAge === '18-35' ? 1 : travelerAge === '36-50' ? 1.2 : travelerAge === '51-65' ? 1.55 : 2.1;
    const covMultiplier = coverageAmount.includes('$250,000')
      ? 1.4
      : coverageAmount.includes('$100,000')
      ? 1.15
      : 1;

    const factor = dayMultiplier * ageMultiplier * covMultiplier;

    const tataPrice = Math.round(499 * factor);
    const hdfcPrice = Math.round(699 * factor);
    const nivaPrice = Math.round(899 * factor);

    return [
      {
        provider: 'Tata AIG',
        planName: 'Travel Guard Plus (Embassy Approved)',
        tag: 'Most Popular • Lowest Price',
        priceInr: tataPrice,
        priceUsd: Math.max(6, Math.round(tataPrice / 84)),
        coverage: coverageAmount,
        claimRatio: '98.4%',
        deductible: '$0 (Zero Deductible Option)',
        features: [
          '100% Accepted by VFS Global & All 29 Schengen Embassies',
          'Cashless Hospitalization Worldwide + COVID-19 Covered',
          'Baggage Delay, Loss of Passport & Trip Cancellation Cover'
        ],
        partnerUrl: 'https://www.tataaig.com/travel-insurance'
      },
      {
        provider: 'HDFC Ergo',
        planName: 'International Travel Insurance Gold',
        tag: 'Instant Policy PDF in 2 Mins',
        priceInr: hdfcPrice,
        priceUsd: Math.max(8, Math.round(hdfcPrice / 84)),
        coverage: coverageAmount,
        claimRatio: '97.9%',
        deductible: '$0 (Zero Co-Pay)',
        features: [
          'Meets Mandatory Schengen Regulation (EC) No 810/2009',
          '100,000+ Global Cashless Hospital Network (Allianz Partner)',
          'Emergency Medical Evacuation & Repatriation Included'
        ],
        partnerUrl: 'https://www.hdfcergo.com/travel-insurance'
      },
      {
        provider: 'Niva Bupa',
        planName: 'TravelAssure Comprehensive Plan',
        tag: 'Best Pre-Existing Emergency Cover',
        priceInr: nivaPrice,
        priceUsd: Math.max(11, Math.round(nivaPrice / 84)),
        coverage: coverageAmount,
        claimRatio: '98.1%',
        deductible: '$0 Deductible',
        features: [
          'Covers Life-Threatening Pre-Existing Conditions Abroad',
          'Direct Instant Claim Settlement & 24x7 Global Helpline',
          'Full Refund of Insurance Policy if Visa is Rejected'
        ],
        partnerUrl: 'https://www.nivabupa.com/travel-insurance'
      }
    ];
  }, [tripDays, travelerAge, coverageAmount]);

  const faqs = [
    {
      q: 'Is travel medical insurance mandatory for a Schengen Visa application?',
      a: 'Yes! Under Article 15 of the EU Schengen Visa Code (Regulation EC No 810/2009), travel medical insurance with a minimum coverage of €30,000 (approximately $35,000–$50,000 USD) is 100% mandatory. Your policy must be valid across all 29 Schengen member states and cover emergency medical care, hospital treatment, and medical repatriation.'
    },
    {
      q: 'Are Tata AIG, HDFC Ergo, and Niva Bupa accepted by VFS Global and Schengen Embassies?',
      a: 'Yes. Tata AIG, HDFC Ergo, and Niva Bupa are IRDAI-approved Indian insurers on the official VFS Global and European Consulate approved list of travel insurance providers for Indian passport holders.'
    },
    {
      q: 'What is the 15-day grace period rule for Schengen travel insurance?',
      a: 'When issuing a Schengen Visa, embassies automatically add a 15-day buffer at the end of your visa validity period so you have flexibility if flights are delayed. Make sure your insurance policy covers the exact number of days you will stay in the Schengen area.'
    },
    {
      q: 'Can I cancel or get a refund on my travel insurance if my visa is rejected?',
      a: 'Yes, most plans from Tata AIG, HDFC Ergo, and Niva Bupa allow policy cancellation and refund (minus a nominal administrative charge of Rs 100–Rs 250) prior to the policy start date if your visa application is refused.'
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
      <PageBackBar onNavigate={onNavigate} pageName="Travel Insurance Compare" />

      {/* Blue Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>100% FREE COMPARE • VFS &amp; EMBASSY APPROVED PLANS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Travel Insurance Compare - Best Insurance for Your Visa
          </h1>
          <p className="text-sm sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Compare VFS-approved visa travel insurance plans from Tata AIG, HDFC Ergo, and Niva Bupa. Meet the mandatory €30,000 Schengen requirement starting from Rs 499.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* Filter Tool Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                100% FREE Compare
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Customize Your Trip Details to Compare Plans
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Country */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                1. Destination Country
              </label>
              <select
                aria-label="Destination Country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="Schengen (All 29 Countries)">🇪🇺 Schengen (All 29 Countries)</option>
                <option value="USA & Canada">🇺🇸 USA &amp; Canada</option>
                <option value="United Kingdom (UK)">🇬🇧 United Kingdom (UK)</option>
                <option value="UAE (Dubai) & Middle East">🇦🇪 UAE (Dubai) &amp; Middle East</option>
                <option value="Thailand, Singapore & Asia">🇹🇭 Thailand, Singapore &amp; Asia</option>
                <option value="Worldwide (Multi-Country)">🌍 Worldwide (Multi-Country)</option>
              </select>
            </div>

            {/* Trip Days */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                2. Trip Days
              </label>
              <select
                aria-label="Trip Days"
                value={tripDays}
                onChange={(e) => setTripDays(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="7">7 Days</option>
                <option value="15">15 Days (Standard)</option>
                <option value="30">30 Days</option>
                <option value="60">60 Days</option>
              </select>
            </div>

            {/* Traveler Age */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                3. Traveler Age
              </label>
              <select
                aria-label="Traveler Age"
                value={travelerAge}
                onChange={(e) => setTravelerAge(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="18-35">18 – 35 Years</option>
                <option value="36-50">36 – 50 Years</option>
                <option value="51-65">51 – 65 Years</option>
                <option value="66+">66+ Years (Senior Citizen)</option>
              </select>
            </div>

            {/* Coverage */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                4. Coverage Amount
              </label>
              <select
                aria-label="Coverage Amount"
                value={coverageAmount}
                onChange={(e) => setCoverageAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="€30,000 / $50,000 (Schengen Mandatory)">€30,000 / $50,000 (Schengen Mandatory)</option>
                <option value="$100,000 (Recommended for UK / Europe)">$100,000 (Recommended UK / Europe)</option>
                <option value="$250,000 (Recommended for USA / Canada)">$250,000 (Recommended USA / Canada)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Top 3 Visa Travel Insurance Companies ({selectedCountry} • {tripDays} Days)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                All 3 providers issue instant PDF policy certificates accepted by VFS Global, TLScontact, and Embassies worldwide.
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full self-start sm:self-center">
              100% FREE Compare
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-extrabold">Insurance Company</th>
                  <th className="py-3.5 px-4 font-extrabold">Price ({tripDays} Days)</th>
                  <th className="py-3.5 px-4 font-extrabold">Medical Coverage</th>
                  <th className="py-3.5 px-4 font-extrabold">Claim Settlement Ratio</th>
                  <th className="py-3.5 px-4 font-extrabold">Key Visa Benefits</th>
                  <th className="py-3.5 px-4 font-extrabold text-right">Official Partner Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {plans.map((p, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-5 px-4">
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-black uppercase bg-blue-100 text-[#0B3D91] px-2 py-0.5 rounded-full">
                          {p.tag}
                        </span>
                        <div className="text-base font-black text-slate-900">{p.provider}</div>
                        <div className="text-xs text-slate-500 font-semibold">{p.planName}</div>
                      </div>
                    </td>
                    <td className="py-5 px-4 tabular-nums">
                      <div className="text-xl font-black text-emerald-700">
                        Rs {p.priceInr.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500">
                        (~${p.priceUsd} USD incl. GST)
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="font-black text-slate-900">{p.coverage}</div>
                      <div className="text-[11px] text-emerald-700 font-bold">{p.deductible}</div>
                    </td>
                    <td className="py-5 px-4">
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 font-black text-xs px-2.5 py-1 rounded-full tabular-nums">
                        <Award className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{p.claimRatio}</span>
                      </span>
                    </td>
                    <td className="py-5 px-4 max-w-xs">
                      <ul className="space-y-1 text-xs text-slate-700">
                        {p.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <a
                        href={p.partnerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-xs rounded-xl shadow-xs transition-all whitespace-nowrap"
                      >
                        <span>View on Partner Site →</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Why Insurance is Mandatory for Schengen Box */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border-2 border-blue-200 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0B3D91] flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#0B3D91]">
                Official EU Visa Code Article 15
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Why Insurance is Mandatory for Schengen?
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Under <strong>Regulation (EC) No 810/2009 (Article 15 of the Schengen Visa Code)</strong>, every applicant applying for a Short-Stay Schengen Visa (Type C) must enclose a valid Travel Medical Insurance certificate with their VFS Global application file. Without compliant insurance, your visa application is automatically inadmissible.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {[
              {
                title: 'Minimum €30,000 Cover',
                desc: 'Must cover at least €30,000 (approx. $35,000–$50,000 USD) in emergency medical & hospital bills.'
              },
              {
                title: 'Valid in All 29 States',
                desc: 'Policy certificate must state validity across "Schengen Area" or "Worldwide", not just a single country.'
              },
              {
                title: 'Medical Repatriation',
                desc: 'Must explicitly include emergency medical evacuation and repatriation of mortal remains.'
              },
              {
                title: '$0 Deductible Preferred',
                desc: 'Consulates strongly prefer Zero-Deductible ($0 co-pay) policies so travelers face zero out-of-pocket burden.'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
                <div className="font-black text-xs sm:text-sm text-[#0B3D91]">{item.title}</div>
                <p className="text-xs text-slate-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">
              Frequently Asked Questions (Travel Insurance Compare)
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
        <EmailSubscribeBox pageContext="Travel Insurance Compare for Visa" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
