import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles } from 'lucide-react';

interface EmailSubscribeBoxProps {
  pageContext?: string;
  className?: string;
}

export const EmailSubscribeBox: React.FC<EmailSubscribeBoxProps> = ({ pageContext = 'Free Visa Tool', className = '' }) => {
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

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#09327a] to-[#047857] rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-emerald-500/30">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Email Only • No Spam • 100% Free</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Never Miss Visa Slots, Free Templates &amp; Policy Updates
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Get instant cancellation slot alerts for US (Delhi/Mumbai) &amp; Schengen, free downloadable cover letter templates, and dummy ticket guidelines directly on Email.
            </p>
          </div>

          <div className="w-full lg:w-auto shrink-0">
            {subscribed ? (
              <div className="bg-emerald-500/20 border border-emerald-400/40 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-200 font-bold justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Subscribed Successfully! Check your inbox for free visa kit.</span>
              </div>
            ) : (
              <form onSubmit={handleEmailSubscribe} className="flex flex-col sm:flex-row gap-2">
                <div className="relative min-w-[260px]">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your Email for FREE Slot Alert"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
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
