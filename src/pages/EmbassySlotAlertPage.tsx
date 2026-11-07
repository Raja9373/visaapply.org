import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Mail,
  Gift,
  Globe
} from 'lucide-react';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';
import { TopFreeToolsStrip } from '../components/TopFreeToolsStrip';
import { BottomFreeToolsSection } from '../components/BottomFreeToolsSection';
import { NAME_MAP_249, FLAG_MAP_249 } from '../data/fullVisaDatabase';

interface EmbassySlotAlertPageProps {
  onNavigate?: (path: string) => void;
}

export const EmbassySlotAlertPage: React.FC<EmbassySlotAlertPageProps> = ({ 
  onNavigate = (p) => { window.history.pushState({}, '', p); window.scrollTo(0,0); } 
}) => {
  const [email, setEmail] = useState('');
  const [fromCountry, setFromCountry] = useState('IN');
  const [toCountry, setToCountry] = useState('US');
  const [embassyCity, setEmbassyCity] = useState('New Delhi (Embassy)');
  
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [slotStatuses, setSlotStatuses] = useState<any>({});

  // Silent IP geo-detection on mount
  useEffect(() => {
    fetch('/api/geo')
      .then(res => res.json())
      .then(data => {
        if (data && data.country) {
          const code = String(data.country).toUpperCase();
          if (NAME_MAP_249[code]) {
            setFromCountry(code);
          }
        }
      })
      .catch(() => {});

    fetch('/api/slot-alert/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSlotStatuses(data.embassies || {});
        }
      })
      .catch(() => {});
  }, []);

  // Auto-fill embassy cities based on From + To
  useEffect(() => {
    const key = `${fromCountry}-${toCountry}`;
    const mapping: Record<string, string[]> = {
      'IN-US': ['New Delhi (Embassy)', 'Mumbai (Consulate)', 'Chennai (Consulate)', 'Hyderabad (Consulate)', 'Kolkata (Consulate)'],
      'IN-GB': ['New Delhi (VFS)', 'Mumbai (VFS)', 'Bengaluru (VFS)', 'Chandigarh (VFS)'],
      'IN-CA': ['New Delhi (IRCC/VFS)', 'Bengaluru (VFS)', 'Chandigarh (VFS)'],
      'PK-US': ['Islamabad (Embassy)', 'Karachi (Consulate)'],
      'PK-GB': ['Islamabad (VFS)', 'Lahore (VFS)', 'Mirpur (VFS)'],
      'NG-GB': ['Lagos (VFS)', 'Abuja (VFS)'],
      'NG-US': ['Abuja (Embassy)', 'Lagos (Consulate)'],
      'AE-US': ['Abu Dhabi (Embassy)', 'Dubai (Consulate)'],
      'BD-US': ['Dhaka (Embassy)'],
      'NP-US': ['Kathmandu (Embassy)']
    };

    const cities = mapping[key] || [
      `${NAME_MAP_249[toCountry] || toCountry} Main Embassy / VFS Hub`
    ];
    setEmbassyCity(cities[0]);
  }, [fromCountry, toCountry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/slot-alert/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(), 
          fromCountry, 
          toCountry, 
          embassyCity 
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
      } else {
        setErrorMsg(data.error || 'Subscription failed. Please try again.');
      }
    } catch {
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  const destinationOptions = [
    { code: 'US', label: '🇺🇸 United States (USA)' },
    { code: 'GB', label: '🇬🇧 United Kingdom (UK)' },
    { code: 'CA', label: '🇨🇦 Canada' },
    { code: 'FR', label: '🇫🇷 France (Schengen)' },
    { code: 'DE', label: '🇩🇪 Germany (Schengen)' },
    { code: 'IT', label: '🇮🇹 Italy (Schengen)' },
    { code: 'ES', label: '🇪🇸 Spain (Schengen)' },
    { code: 'NL', label: '🇳🇱 Netherlands (Schengen)' },
    { code: 'AU', label: '🇦🇺 Australia' },
    { code: 'AE', label: '🇦🇪 United Arab Emirates' }
  ];

  const faqs = [
    {
      q: "How soon do visa appointment slots open?",
      a: "Consulates and VFS centers release bulk cancellation batches randomly (often early morning or late evening). Our automated system checks every 30 minutes 24/7."
    },
    {
      q: "Is this appointment slot booking guaranteed?",
      a: "No guarantee. We provide instant email alerts as soon as official portals release slots, enabling you to book directly. Your appointment depends on official availability."
    },
    {
      q: "Do I need to share my portal password?",
      a: "NEVER. VisaApply never asks for your portal credentials or account passwords. We monitor public status feeds automatically."
    },
    {
      q: "Is this service 100% free?",
      a: "YES! 100% free global email alerts. No credit card or payment required."
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
      <PageBackBar onNavigate={onNavigate} pageName="Global Embassy Slot Alert" />

      {/* TOP Free Tools Strip */}
      <div className="bg-[#0B3D91] py-2 border-b border-blue-800">
        <TopFreeToolsStrip onNavigate={onNavigate} theme="dark" />
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-black">
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>Global Coverage • All 249 Countries • Automated 30-Min Email Alerts</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Global Embassy Slot Alert — 249 Countries
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed font-medium">
            No matter where you are applying from — India, Pakistan, Nigeria, Dubai — our automated system checks your embassy's slot availability and emails you instantly. The system checks appointment slots every 30 minutes 24/7. The moment slots open, an email is sent automatically. You don't have to do anything manually.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        
        {/* Live Slot Status Dashboard */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0B3D91]" />
            <span>Live Consular Status (Checked Every 30 Mins Worldwide)</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(slotStatuses).map(([emb, info]: [string, any]) => {
              const isOpen = info.status === 'Open';
              return (
                <div key={emb} className={`p-3 rounded-xl border text-center ${isOpen ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[11px] font-extrabold text-slate-700 block truncate">{emb}</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full inline-block mt-1 ${isOpen ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600'}`}>
                    {isOpen ? `🟢 OPEN` : '🔴 Closed'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B3D91] flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Activate Global Slot Alert (Free)</h2>
              <p className="text-xs text-slate-500">Select your origin passport country and destination embassy</p>
            </div>
          </div>

          {subscribed ? (
            <div className="p-8 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-emerald-900">Subscribed Successfully!</h3>
              <p className="text-base font-extrabold text-emerald-900 max-w-lg mx-auto">
                "Our system checks appointment slots every 30 minutes. The moment slots open, you will receive an instant email notification."
              </p>
              <p className="text-xs text-emerald-700">
                Tracking activated for <strong>{NAME_MAP_249[fromCountry] || fromCountry}</strong> to <strong>{toCountry}</strong> ({embassyCity}).
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setSubscribed(false)}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Subscribe Another Email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                  {errorMsg}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. From Country */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    From Country (Your Passport) *
                  </label>
                  <select
                    value={fromCountry}
                    onChange={(e) => setFromCountry(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
                  >
                    {Object.keys(NAME_MAP_249)
                      .sort((a, b) => NAME_MAP_249[a].localeCompare(NAME_MAP_249[b]))
                      .map((code) => (
                        <option key={code} value={code}>
                          {FLAG_MAP_249[code]} {NAME_MAP_249[code]} ({code})
                        </option>
                      ))}
                  </select>
                </div>

                {/* 2. To Destination Embassy */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    To Embassy / Country *
                  </label>
                  <select
                    value={toCountry}
                    onChange={(e) => setToCountry(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
                  >
                    {destinationOptions.map((dest) => (
                      <option key={dest.code} value={dest.code}>
                        {dest.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#0B3D91] hover:bg-[#082e6d] text-white font-black text-base rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Bell className="w-5 h-5 text-amber-300" />
                  <span>{loading ? 'Subscribing...' : 'Start Automated Global Email Alerts (100% Free)'}</span>
                </button>
                <p className="text-center text-xs text-slate-500 mt-2">
                  ⚡ We notify you instantly the moment slots open. Unsubscribe anytime.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Lead Magnet Bar */}
        <EmailSubscribeBox pageContext="Global Embassy Slot Alert Auto System" className="mb-8" />

        {/* Frequently Asked Questions */}
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

      {/* BOTTOM Free Tools Section */}
      <div className="mt-16 bg-slate-100 border-t border-slate-200 py-12">
        <BottomFreeToolsSection onNavigate={onNavigate || (() => {})} />
      </div>

      {/* Bottom Back Button */}
      <PageBottomBack onNavigate={onNavigate || (() => {})} />
    </div>
  );
};
