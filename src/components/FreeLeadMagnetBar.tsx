import React, { useState } from 'react';
import { MessageSquare, Mail, CheckCircle2, Sparkles, Bell, ArrowRight } from 'lucide-react';
import { AdSenseBanner } from './AdSenseBanner';

interface FreeLeadMagnetBarProps {
  pageContext?: string;
  adSlot?: string;
}

export const FreeLeadMagnetBar: React.FC<FreeLeadMagnetBarProps> = ({ pageContext = 'Visa Services', adSlot }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleEmailSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const subs = JSON.parse(localStorage.getItem('visaapply_email_subscribers') || '[]');
      subs.push({
        email,
        context: pageContext,
        date: new Date().toISOString()
      });
      localStorage.setItem('visaapply_email_subscribers', JSON.stringify(subs));
    } catch {
      // ignore storage error
    }

    setSubscribed(true);
  };

  const handleWhatsAppJoin = () => {
    // Open official VisaApply WhatsApp Channel
    window.open('https://whatsapp.com/channel/0029Vb7B3P659PwT5tqjRk2a', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full my-8 space-y-6">
      {/* Google AdSense Placement Box */}
      <AdSenseBanner slot={adSlot || "1234567890"} />

      {/* Free Community & Lead Magnet Card */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#09327a] to-[#047857] rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-emerald-500/30">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Community Value Proposition */}
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>100% Free Community • 48,000+ Active Travelers</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Never Miss Visa Slots, Free Templates &amp; Policy Updates
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Get instant cancellation slot alerts for US (Delhi/Mumbai) &amp; Schengen, free downloadable cover letter templates, and dummy ticket guidelines directly on WhatsApp and Email.
            </p>
          </div>

          {/* Right: Actions (WhatsApp Button + Email Form) */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {/* WhatsApp Channel CTA Button */}
            <button
              type="button"
              onClick={handleWhatsAppJoin}
              className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95"
            >
              <MessageSquare className="w-5 h-5 text-slate-950 fill-current" />
              <span>Join FREE WhatsApp Channel</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            {/* Email Lead Input */}
            {subscribed ? (
              <div className="bg-emerald-500/20 border border-emerald-400/40 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-200 font-bold justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Subscribed! Check inbox for free visa kit.</span>
              </div>
            ) : (
              <form onSubmit={handleEmailSubscribe} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email for free visa updates..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  Subscribe Free
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
