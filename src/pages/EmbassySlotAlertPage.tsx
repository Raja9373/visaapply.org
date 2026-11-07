import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Zap,
  Sparkles,
  Send,
  MessageSquare,
  Gift
} from 'lucide-react';
import { FreeLeadMagnetBar } from '../components/FreeLeadMagnetBar';
import { AdSenseBanner } from '../components/AdSenseBanner';

interface EmbassySlotAlertPageProps {
  onNavigate?: (path: string) => void;
}

export const EmbassySlotAlertPage: React.FC<EmbassySlotAlertPageProps> = () => {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    embassy: 'USA Delhi'
  });

  const [subscribed, setSubscribed] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp) {
      alert('Please enter your Name and WhatsApp number.');
      return;
    }

    try {
      const existingLeads = JSON.parse(localStorage.getItem('visaapply_slot_alert_leads') || '[]');
      existingLeads.push({
        ...formData,
        isFirstAlertFree: true,
        subscribedAt: new Date().toISOString()
      });
      localStorage.setItem('visaapply_slot_alert_leads', JSON.stringify(existingLeads));
    } catch {
      // Local storage fallback
    }

    setSubscribed(true);
  };

  const embassies = [
    'USA Delhi',
    'USA Mumbai',
    'USA Chennai',
    'USA Hyderabad',
    'USA Kolkata',
    'Schengen - France',
    'Schengen - Germany',
    'Schengen - Italy',
    'Schengen - Spain',
    'Schengen - Netherlands',
    'Schengen - Switzerland',
    'Schengen - Greece',
    'UK Priority Visa',
    'Canada Biometrics VFS'
  ];

  const faqs = [
    {
      q: "Slot kitne din me milta hai? (How long does it take for slots to open?)",
      a: "Consulates and VFS centers frequently release bulk cancellation batches and newly opened biometric slots at random intervals—often at early morning (6 AM - 8 AM) or late evening (10 PM - 12 AM). In typical weeks, bulk slots for USA (B1/B2, F1) and Schengen open every 3 to 7 days."
    },
    {
      q: "Kya ye slot booking guarantee hai? (Is appointment booking guaranteed?)",
      a: "No. VisaApply does NOT guarantee appointment slots or sell booking appointments. We are an automated monitoring and alert broadcast service. The moment the official consular system releases appointment dates, we ping your WhatsApp instantly so YOU can log into your official US CGI Federal / usvisascheduling / VFS portal and claim the slot directly."
    },
    {
      q: "Kya mujhe apna portal login password share karna padega? (Do I need to share login credentials?)",
      a: "KABHI NAHI (NEVER). VisaApply never asks for your personal portal password or login credentials. Our automated servers monitor public consular wait-time feeds and appointment availability queues independently without requiring your account details."
    },
    {
      q: "Alert aane par mujhe kya karna hoga? (What should I do when an alert arrives?)",
      a: "As soon as you receive our WhatsApp ping, immediately log into your official portal (usvisascheduling.com for USA, or vfsglobal.com for Schengen), navigate to 'Reschedule Appointment', and pick the earliest opened slot."
    },
    {
      q: "Is the first alert really 100% free?",
      a: "YES! First Alert is 100% FREE. No payment, no checkout, and no credit card details required. Fill the 3-field form below and you'll receive your instant alert on WhatsApp the moment your embassy opens slots."
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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-black">
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>First Alert FREE • Zero Advance Payment • No Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Embassy Slot Alert — USA / Schengen
          </h1>
          <p className="text-lg sm:text-2xl text-amber-300 font-extrabold max-w-2xl mx-auto tracking-wide">
            "USA ka slot khulte hi sabse pehle pata chalega"
          </p>
          <p className="text-sm sm:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Instant automated alerts on WhatsApp the split-second US Consulates (Delhi, Mumbai, Chennai, Hyderabad, Kolkata) or Schengen VFS centers release new appointment slots.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Live Slot Tracking Highlight Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-[11px] font-extrabold text-blue-800 uppercase block">Active Tracking</span>
            <span className="text-xl sm:text-2xl font-black text-[#0B3D91]">5 US Consulates</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-[11px] font-extrabold text-emerald-800 uppercase block">Schengen Hubs</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700">7 VFS Nations</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-[11px] font-extrabold text-amber-800 uppercase block">Alert Dispatch</span>
            <span className="text-xl sm:text-2xl font-black text-amber-700">&lt; 30 Seconds</span>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
            <span className="text-[11px] font-extrabold text-purple-800 uppercase block">First Alert</span>
            <span className="text-xl sm:text-2xl font-black text-purple-700">100% FREE</span>
          </div>
        </div>

        {/* 100% Free First Alert Banner */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-blue-500/10 border-2 border-emerald-400 rounded-2xl p-6 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-md">
              🎉
            </div>
            <div>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Special Public Initiative
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                First Alert is 100% FREE for Everyone
              </h3>
              <p className="text-xs text-slate-600">
                No credit card, no registration fee, no payment required. Enter your WhatsApp number below to activate tracking.
              </p>
            </div>
          </div>
          <div className="bg-emerald-600 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-sm shrink-0">
            First Alert FREE
          </div>
        </div>

        {/* Fast 3-Field Lead Capture Form: Name + WhatsApp + Embassy */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B3D91] flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Activate Your Free Slot Alert</h2>
              <p className="text-xs text-slate-500">Fast 3-field setup • Alert pinged directly to your WhatsApp • First Alert FREE</p>
            </div>
          </div>

          {subscribed ? (
            <div className="p-8 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-emerald-900">Subscribed!</h3>
              <p className="text-base sm:text-lg font-extrabold text-emerald-900 max-w-lg mx-auto">
                "Subscribed! Jab slot khulega, hum WhatsApp + Email pe bhej denge."
              </p>
              <p className="text-xs text-emerald-700">
                24/7 automated server tracking activated for <strong>{formData.embassy}</strong>. Keep your WhatsApp notifications active.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setSubscribed(false)}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Activate Another Free Alert
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>

                {/* 2. WhatsApp Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    WhatsApp Number (for Alert) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 12345"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>

                {/* 3. Embassy */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Embassy / Consulate *
                  </label>
                  <select
                    value={formData.embassy}
                    onChange={(e) => setFormData({ ...formData, embassy: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  >
                    {embassies.map((emb) => (
                      <option key={emb} value={emb}>{emb}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#0B3D91] hover:bg-[#082e6d] text-white font-black text-base rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Bell className="w-5 h-5 text-amber-300" />
                  <span>Activate Free Alert (First Alert FREE)</span>
                </button>
                <p className="text-center text-xs text-slate-500 mt-2">
                  ⚡ First Alert FREE. No login password required. No credit card required.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Lead Magnet Bar: Join Free WhatsApp Channel + Email Newsletter + AdSense Banner */}
        <FreeLeadMagnetBar pageContext="Embassy Slot Alert Free Service" adSlot="slot_alert_banner" />

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
    </div>
  );
};
