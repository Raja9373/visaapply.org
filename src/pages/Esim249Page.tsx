import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  Wifi,
  QrCode,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Globe
} from 'lucide-react';
import { NAME_MAP_249, FLAG_MAP_249 } from '../data/fullVisaDatabase';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface Esim249PageProps {
  onNavigate?: (path: string) => void;
}

export const Esim249Page: React.FC<Esim249PageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  const countries249 = useMemo(() => {
    return Object.entries(NAME_MAP_249)
      .filter(([code]) => code.toUpperCase() !== 'EU')
      .map(([code, name]) => ({
        code: code.toUpperCase(),
        name,
        flag: FLAG_MAP_249[code.toUpperCase()] || '🌍'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US');
  const [selectedDays, setSelectedDays] = useState<string>('15');
  const [selectedData, setSelectedData] = useState<string>('10GB');
  const [hasSearched, setHasSearched] = useState<boolean>(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const selectedCountry = useMemo(() => {
    return (
      countries249.find((c) => c.code === selectedCountryCode) || {
        code: 'US',
        name: 'United States',
        flag: '🇺🇸'
      }
    );
  }, [countries249, selectedCountryCode]);

  const esimPlans = useMemo(() => {
    const baseDataPricesUsd: Record<string, { airalo: number; holafly: number; nomad: number }> = {
      '1GB': { airalo: 4.5, holafly: 19.0, nomad: 5.0 },
      '5GB': { airalo: 11.5, holafly: 29.0, nomad: 12.0 },
      '10GB': { airalo: 18.0, holafly: 39.0, nomad: 17.0 },
      Unlimited: { airalo: 32.0, holafly: 47.0, nomad: 35.0 }
    };

    const daysMultiplier = selectedDays === '7' ? 0.85 : selectedDays === '15' ? 1 : 1.35;
    const base = baseDataPricesUsd[selectedData] || baseDataPricesUsd['10GB'];

    const airaloUsd = Number((base.airalo * daysMultiplier).toFixed(2));
    const holaflyUsd = Number((base.holafly * daysMultiplier).toFixed(2));
    const nomadUsd = Number((base.nomad * daysMultiplier).toFixed(2));

    return [
      {
        provider: 'Airalo',
        badge: 'Best Value • 200+ Countries',
        planTitle: `${selectedCountry.name} Local 5G/LTE eSIM`,
        priceUsd: airaloUsd,
        priceInr: Math.round(airaloUsd * 84),
        dataLabel: selectedData === 'Unlimited' ? '20GB High-Speed + Unlimited 1Mbps' : selectedData,
        validity: `${selectedDays} Days`,
        features: [
          `Instant QR activation on top local 5G network in ${selectedCountry.name}`,
          'Mobile Hotspot & Tethering 100% Supported',
          'Keep your existing mobile number & primary SIM active'
        ],
        buyUrl: 'https://www.airalo.com'
      },
      {
        provider: 'Holafly',
        badge: 'Best True Unlimited Data',
        planTitle: `${selectedCountry.name} Unlimited Travel eSIM`,
        priceUsd: holaflyUsd,
        priceInr: Math.round(holaflyUsd * 84),
        dataLabel: 'Unlimited High-Speed Data',
        validity: `${selectedDays} Days`,
        features: [
          `Truly Unlimited 5G/4G LTE data across ${selectedCountry.name}`,
          'Up to 500MB–1GB/day Hotspot sharing included',
          '24/7 Live Chat Support & Instant Email QR Delivery'
        ],
        buyUrl: 'https://esim.holafly.com'
      },
      {
        provider: 'Nomad',
        badge: 'Lowest Per-GB Rate',
        planTitle: `${selectedCountry.name} High-Speed Data Pack`,
        priceUsd: nomadUsd,
        priceInr: Math.round(nomadUsd * 84),
        dataLabel: selectedData,
        validity: `${selectedDays} Days`,
        features: [
          `Multi-network auto-switching across ${selectedCountry.name} carriers`,
          'Full Hotspot & Tethering with zero speed throttling',
          'Easy in-app data top-up without reinstalling eSIM'
        ],
        buyUrl: 'https://www.getnomad.app'
      }
    ];
  }, [selectedCountry.name, selectedDays, selectedData]);

  const handleFindBestEsim = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setTimeout(() => {
      const el = document.getElementById('esim-results-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const faqs = [
    {
      q: 'How do I know if my phone supports an international travel eSIM?',
      a: 'Dial *#06# on your phone keypad. If you see an EID (Embedded Identity Document) barcode/number on your screen, your smartphone is 100% eSIM-compatible. All iPhones from iPhone XR/XS onwards, Samsung Galaxy S20/S21/S22/S23/S24 series, and Google Pixel 4/5/6/7/8/9 support travel eSIMs.'
    },
    {
      q: 'When should I buy and install my travel eSIM?',
      a: 'You should buy and scan your eSIM QR code 1 day before your flight while connected to your home Wi-Fi. Your data validity period only starts when the eSIM connects to the destination network in the foreign country upon landing.'
    },
    {
      q: 'Can I keep my Indian SIM active for bank OTPs while using an eSIM for data?',
      a: 'Yes! Set your travel eSIM (Airalo, Holafly, or Nomad) as your "Cellular Data" line and keep your home SIM active for incoming SMS OTPs (with Data Roaming turned OFF on your home SIM so you pay zero international roaming charges).'
    },
    {
      q: 'Which is better: Airalo, Holafly, or Nomad?',
      a: 'Choose Airalo or Nomad if you want affordable 1GB, 5GB, or 10GB fixed data packs with full mobile hotspot support. Choose Holafly if you want stress-free Unlimited Data for heavy Google Maps, Instagram, YouTube, and remote work.'
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
      <PageBackBar onNavigate={onNavigate} pageName="eSIM for 249 Countries" />

      {/* Blue Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FREE COMPARE • INSTANT QR DELIVERY ACROSS 249 COUNTRIES</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            eSIM for 249 Countries - Buy eSIM for Your Trip
          </h1>
          <p className="text-sm sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Skip expensive airport SIM queues and ₹3,999 roaming packs. Compare Airalo, Holafly, and Nomad 5G travel eSIMs across all 249 destinations in USD &amp; INR.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* Search Tool Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                FREE Compare
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Select Destination Country, Trip Days &amp; Data Pack
              </h2>
            </div>
          </div>

          <form onSubmit={handleFindBestEsim} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Destination Country (249 Dropdown) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  1. Destination Country (249 Countries)
                </label>
                <select
                  aria-label="Destination Country"
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
                >
                  {countries249.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Trip Days */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  2. Trip Days (Validity)
                </label>
                <select
                  aria-label="Trip Days"
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(e.target.value)}
                  className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
                >
                  <option value="7">7 Days</option>
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                </select>
              </div>

              {/* 3. Data Amount */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  3. High-Speed Data Needed
                </label>
                <select
                  aria-label="Data Needed"
                  value={selectedData}
                  onChange={(e) => setSelectedData(e.target.value)}
                  className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
                >
                  <option value="1GB">1GB (Light Maps &amp; Messaging)</option>
                  <option value="5GB">5GB (Standard Week Trip)</option>
                  <option value="10GB">10GB (Most Popular for 15 Days)</option>
                  <option value="Unlimited">Unlimited Data (Heavy Social &amp; Work)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wifi className="w-5 h-5" />
              <span>Find Best eSIM →</span>
            </button>
          </form>
        </div>

        {/* 3 Plans Comparison Cards */}
        {hasSearched && (
          <div id="esim-results-section" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Best 3 eSIM Plans for {selectedCountry.flag} {selectedCountry.name} ({selectedDays} Days • {selectedData})
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full self-start sm:self-center">
                FREE Compare
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {esimPlans.map((plan, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase bg-blue-100 text-[#0B3D91] px-2.5 py-1 rounded-full">
                        {plan.badge}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        FREE Compare
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-slate-900">{plan.provider}</h3>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">{plan.planTitle}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-extrabold uppercase text-slate-500">
                          Price (USD + INR)
                        </div>
                        <div className="text-2xl font-black text-[#0B3D91] tabular-nums">
                          ${plan.priceUsd}{' '}
                          <span className="text-sm font-extrabold text-emerald-700">
                            (~₹{plan.priceInr.toLocaleString('en-IN')})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900">{plan.dataLabel}</div>
                        <div className="text-[11px] font-bold text-slate-500">
                          Validity: {plan.validity}
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-2 text-xs text-slate-700 pt-1">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={plan.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-5 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <span>Buy eSIM →</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to Activate eSIM? - 3 Steps with Visual Illustrations */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#0B3D91] bg-blue-50 px-3 py-1 rounded-full">
              60-Second Setup Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              How to Activate eSIM? (3 Simple Steps)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              No physical SIM ejector pin needed. Activate your digital travel eSIM in under 1 minute:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Scan QR */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-4">
              <div className="w-full h-40 rounded-xl bg-gradient-to-br from-[#0B2A5B] to-[#0B3D91] flex items-center justify-center p-4 shadow-inner">
                <svg viewBox="0 0 160 110" className="w-36 h-28" aria-label="Step 1 Scan eSIM QR Code">
                  <rect x="42" y="8" width="76" height="94" rx="10" fill="#ffffff" />
                  <rect x="47" y="15" width="66" height="74" rx="4" fill="#eff6ff" />
                  <rect x="62" y="30" width="36" height="36" rx="4" fill="#0B3D91" />
                  <rect x="67" y="35" width="10" height="10" fill="#ffffff" />
                  <rect x="83" y="35" width="10" height="10" fill="#ffffff" />
                  <rect x="67" y="51" width="10" height="10" fill="#ffffff" />
                  <rect x="83" y="51" width="10" height="10" fill="#34d399" />
                  <line x1="54" y1="48" x2="106" y2="48" stroke="#10b981" strokeWidth="2.5" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <span className="inline-block text-xs font-black uppercase bg-blue-100 text-[#0B3D91] px-3 py-0.5 rounded-full">
                  Step 1
                </span>
                <h3 className="text-lg font-black text-slate-900">1. Scan QR Code</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Open <strong>Settings → Cellular / Mobile Service → Add eSIM</strong> on your iPhone or Android and scan the QR code sent to your email before departure.
                </p>
              </div>
            </div>

            {/* Step 2: Turn on Data Roaming */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-4">
              <div className="w-full h-40 rounded-xl bg-gradient-to-br from-[#0B2A5B] to-[#0B3D91] flex items-center justify-center p-4 shadow-inner">
                <svg viewBox="0 0 160 110" className="w-36 h-28" aria-label="Step 2 Turn on Data Roaming">
                  <rect x="25" y="22" width="110" height="66" rx="12" fill="#ffffff" />
                  <text x="38" y="48" fill="#0f172a" fontSize="10" fontWeight="bold">
                    Travel eSIM Line
                  </text>
                  <text x="38" y="68" fill="#475569" fontSize="9" fontWeight="bold">
                    Data Roaming: ON
                  </text>
                  <rect x="98" y="54" width="30" height="16" rx="8" fill="#10b981" />
                  <circle cx="120" cy="62" r="6" fill="#ffffff" />
                </svg>
              </div>
              <div className="space-y-1.5">
                <span className="inline-block text-xs font-black uppercase bg-blue-100 text-[#0B3D91] px-3 py-0.5 rounded-full">
                  Step 2
                </span>
                <h3 className="text-lg font-black text-slate-900">2. Turn on Data Roaming</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When your flight lands in <strong>{selectedCountry.name}</strong>, switch your Mobile Data line to the Travel eSIM and toggle <strong>Data Roaming ON</strong> for that eSIM.
                </p>
              </div>
            </div>

            {/* Step 3: Done */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-4">
              <div className="w-full h-40 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-600 flex items-center justify-center p-4 shadow-inner">
                <svg viewBox="0 0 160 110" className="w-36 h-28" aria-label="Step 3 Connected 5G Done">
                  <circle cx="80" cy="55" r="34" fill="#ffffff" />
                  <path
                    d="M66 55 L76 65 L96 45"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <text x="80" y="102" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                    5G LTE ACTIVE
                  </text>
                </svg>
              </div>
              <div className="space-y-1.5">
                <span className="inline-block text-xs font-black uppercase bg-emerald-100 text-emerald-900 px-3 py-0.5 rounded-full">
                  Step 3
                </span>
                <h3 className="text-lg font-black text-slate-900">3. Done! Instant 5G</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You are immediately connected to local 5G/LTE data at the airport gate—book Uber/Grab, open Google Maps, and message family right away.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">
              Frequently Asked Questions (eSIM for 249 Countries)
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
        <EmailSubscribeBox pageContext="eSIM for 249 Countries" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
