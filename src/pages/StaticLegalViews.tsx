import React, { useState } from 'react';
import {
  ChevronRight,
  Mail,
  Check,
  Copy,
  CheckCircle2,
  Send
} from 'lucide-react';
import { NAME_MAP_249, FLAG_MAP_249, getLiveVisaCount } from '../data/countryLightRegistry';
import { getCountryMeta } from '../data/countryMetaData';

function getDisplayName(code: string): string {
  if (!code) return '';
  const c = code.trim().toLowerCase();
  return NAME_MAP_249[c] || (c === 'uk' ? 'United Kingdom' : c === 'eu' ? 'Schengen Area' : code.toUpperCase());
}

function getFlag(code: string): string {
  if (!code) return '🌍';
  const c = code.trim().toLowerCase();
  return FLAG_MAP_249[c] || (c === 'uk' ? '🇬🇧' : c === 'eu' ? '🇪🇺' : '🌍');
}

// ----------------------------------------------------
// Contact Page View Component
// ----------------------------------------------------
export function ContactView({ navigate }: { navigate: (path: string) => void }) {
  const [copied, setCopied] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('contact@visaapply.org');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:contact@visaapply.org?subject=Inquiry from ${encodeURIComponent(name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    window.location.href = mailtoUrl;
    setFormSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
        <button onClick={() => navigate('/')} className="hover:underline">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span>Contact Us</span>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="w-14 h-14 bg-blue-100 text-[#0B3D91] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact VisaApply.org</h1>
          <p className="text-sm text-slate-600 mt-2">
            We reply within 24 hours. For visa queries, editorial corrections, partnerships, or advertising.
          </p>
        </div>

        {/* Email Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-10 text-center max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Official Email Address</span>
            <a href="mailto:contact@visaapply.org" className="block text-xl sm:text-2xl font-bold text-[#0B3D91] hover:underline mt-0.5">
              contact@visaapply.org
            </a>
          </div>
          <button
            onClick={handleCopyEmail}
            className="px-4 py-2.5 bg-white border border-blue-300 text-[#0B3D91] font-semibold rounded-xl text-xs hover:bg-blue-100 transition-colors flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Email'}</span>
          </button>
        </div>

        {/* Contact Form */}
        <div className="max-w-xl mx-auto">
          {formSubmitted ? (
            <div role="status" className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" aria-hidden="true" />
              <h3 className="font-bold text-slate-900 text-lg">Thank you for reaching out!</h3>
              <p className="text-xs text-slate-600">Your email client has been opened to send your message to contact@visaapply.org. We reply within 24 hours.</p>
              <button
                type="button"
                onClick={() => setFormSubmitted(false)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl text-xs hover:bg-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your visa question or inquiry here..."
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0B3D91] text-white font-semibold rounded-xl text-sm hover:bg-[#09327a] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Send Message to contact@visaapply.org</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// About Us, Editorial Policy & Free Backlink Widget Generator (/about)
// ----------------------------------------------------
export function AboutView({ navigate }: { navigate: (path: string) => void }) {
  const [selectedCode, setSelectedCode] = useState('us');
  const [copiedWidget, setCopiedWidget] = useState(false);

  const cName = getDisplayName(selectedCode);
  const cFlag = getFlag(selectedCode);
  const cMeta = getCountryMeta(selectedCode);
  const cCount = getLiveVisaCount(selectedCode);

  const embedCode = `<!-- VisaApply.org Official Live Visa Badge (Dofollow Backlink) -->
<div style="font-family:system-ui,-apple-system,sans-serif;max-width:380px;border:1px solid #cbd5e1;border-radius:16px;padding:16px;background:#ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
    <span style="font-size:18px;font-weight:800;color:#0f172a;">${cFlag} ${cName} Visa Guide 2026</span>
    <span style="background:#dbeafe;color:#1e40af;font-size:11px;font-weight:700;padding:4px 8px;border-radius:999px;">${cCount} Visas</span>
  </div>
  <div style="font-size:12px;color:#475569;line-height:1.6;margin-bottom:12px;">
    • <strong>Processing Time:</strong> ${cMeta.processing}<br/>
    • <strong>Approval Rate:</strong> ${cMeta.successRate}<br/>
    • <strong>Capital & Currency:</strong> ${cMeta.capital} (${cMeta.currency})
  </div>
  <a href="https://www.visaapply.org/in-to-${selectedCode}" target="_blank" rel="noopener" style="display:block;text-align:center;background:#0B3D91;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;padding:10px 14px;border-radius:10px;">
    Check ${cName} Visa Fees &amp; Free PDF Checklist on VisaApply.org →
  </a>
</div>`;

  const handleCopyWidget = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedWidget(true);
    setTimeout(() => setCopiedWidget(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <button onClick={() => navigate('/')} className="hover:underline cursor-pointer">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span>About Us, Editorial Policy & Backlink Tools</span>
      </div>

      {/* E-E-A-T Editorial & Mission Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12 space-y-6">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0B3D91] border border-blue-200 px-3 py-1 rounded-full text-xs font-extrabold">
          <span>🏛️ E-E-A-T Verified Global Immigration Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About VisaApply.org & Our Editorial Standards
        </h1>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          <strong>VisaApply.org</strong> is a comprehensive, independent global visa intelligence platform engineered to simplify cross-border travel, work permits, study visas, and permanent residency pathways across all <strong>249 ISO-recognized countries and territories</strong> across 6 statutory visa categories.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-2xl font-extrabold text-[#0B3D91]">249 Countries</div>
            <div className="text-xs font-bold text-slate-700 mt-1">100% Complete ISO Coverage</div>
            <p className="text-xs text-slate-500 mt-1">Every sovereign state and dependent territory mapped across 7 continents.</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-2xl font-extrabold text-emerald-700">6 Categories</div>
            <div className="text-xs font-bold text-slate-700 mt-1">Statutory Visa Classifications</div>
            <p className="text-xs text-slate-500 mt-1">Covers Tourist, Business, Work, Student, Family, and Permanent Residency statutory subclasses.</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-2xl font-extrabold text-amber-700">Daily Audit</div>
            <div className="text-xs font-bold text-slate-700 mt-1">Consular & VFS Cross-Checked</div>
            <p className="text-xs text-slate-500 mt-1">Fees, processing times, embassy addresses in India, and document checklists updated for 2026.</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed pt-4 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Our Editorial & Fact-Checking Policy</h2>
          <p>
            Every visa guide, fee table, and document checklist published on VisaApply.org is compiled from primary legislative sources—including the US Foreign Affairs Manual (9 FAM), UK Home Office Immigration Rules, Canada IRCC operational bulletins, European Commission Schengen Visa Code, and official High Commission/Embassy notices in New Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, and Kolkata.
          </p>
          <p>
            <strong>Non-Affiliation Notice:</strong> VisaApply.org is an independent informational publication and is not affiliated with any government agency, embassy, or VFS Global. We never charge government visa fees; applicants are always directed to official consular portals.
          </p>
        </div>
      </div>

      {/* Free Embeddable Visa Widget / Backlink Generator */}
      <div id="backlink-widget" className="bg-gradient-to-br from-slate-900 to-[#0B3D91] text-white rounded-2xl shadow-xl p-8 sm:p-12 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
              🔗 Free SEO Backlink & Partner Widget Tool
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
              Embed Our Live 2026 Visa Requirement Badge on Your Blog or Agency Website
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl">
              Are you a travel blogger, university international office, or study-abroad consultant? Select any country below and copy the HTML snippet to display live 2026 visa requirements on your site.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-2">
          {/* Left: Selector & Code */}
          <div className="space-y-4">
            <div>
              <label htmlFor="about-country-select" className="block text-xs font-bold uppercase tracking-wider text-blue-200 mb-2">
                1. Choose Destination Country (249 Countries)
              </label>
              <select
                id="about-country-select"
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
              >
                {Object.keys(NAME_MAP_249).map((code) => (
                  <option key={code} value={code}>
                    {getFlag(code)} {getDisplayName(code)} ({getLiveVisaCount(code)} Visas)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="about-embed-code" className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  2. Copy HTML Embed Code
                </label>
                <button
                  type="button"
                  onClick={handleCopyWidget}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-xs cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {copiedWidget ? '✓ Copied HTML Code!' : '📋 Copy Embed Code'}
                </button>
              </div>
              <textarea
                id="about-embed-code"
                readOnly
                rows={7}
                value={embedCode}
                className="w-full p-3 rounded-xl bg-slate-950/90 border border-slate-700 text-emerald-300 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              />
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-6 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Live Widget Preview
            </div>
            <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-lg border border-slate-200 max-w-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-extrabold text-slate-900">
                  {cFlag} {cName} Visa Guide 2026
                </span>
                <span className="bg-blue-100 text-[#0B3D91] text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  {cCount} Visas
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1 mb-4">
                <div>• <strong>Processing Time:</strong> {cMeta.processing}</div>
                <div>• <strong>Approval Rate:</strong> {cMeta.successRate}</div>
                <div>• <strong>Capital & Currency:</strong> {cMeta.capital} ({cMeta.currency})</div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/in-to-${selectedCode}`)}
                className="w-full py-2.5 px-4 bg-[#0B3D91] hover:bg-[#09327a] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Check {cName} Visa Fees & Free PDF Checklist →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Privacy Policy View Component (AdSense & GDPR Compliant)
// ----------------------------------------------------
export function PrivacyView({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
        <button onClick={() => navigate('/')} className="hover:underline">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span>Privacy Policy</span>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy & Google AdSense Disclosure</h1>
        <p className="text-xs text-slate-500 font-medium">Last updated: October 2026 • Effective Immediately</p>

        <p className="text-sm text-slate-700 leading-relaxed">
          At <strong>VisaApply.org</strong> (accessible from <code>https://www.visaapply.org</code>), protecting the privacy of our visitors is one of our highest priorities. This Privacy Policy document details the types of information collected and recorded by VisaApply.org and how we use it in compliance with Google AdSense Publisher Policies, GDPR, CCPA, and India's Digital Personal Data Protection (DPDP) Act.
        </p>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
          <p>We collect minimal data required to deliver accurate visa eligibility checks, document checklists, and consular guides:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Voluntary User Inputs:</strong> Nationality, destination preferences, and contact form messages submitted voluntarily by users.</li>
            <li><strong>Log Files & Analytics:</strong> Standard non-personally identifiable information including IP address, browser type, ISP, date/time stamp, referring/exit pages, and click counts to analyze trends and administer the site.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900">2. Google AdSense & DoubleClick DART Cookie Disclosure</h2>
          <p>
            VisaApply.org is an official participant in the <strong>Google AdSense Content Program</strong> (Publisher ID: <code>pub-9048615701580913</code> / Customer ID: <code>9127677806</code>).
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Third-party vendors, including Google, use cookies (such as the Google DoubleClick DART cookie) to serve ads based on a user's prior visits to VisaApply.org or other websites on the internet.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve personalized or non-personalized advertisements to our users based on their visit to our site.</li>
            <li>Users may opt out of personalized advertising at any time by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#0B3D91] font-semibold underline">Google Ads Settings</a> or <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-[#0B3D91] font-semibold underline">www.aboutads.info</a>.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900">3. Affiliate & Travel Partner Disclosure</h2>
          <p>
            To keep our global visa guides and downloadable PDF checklists 100% free for travelers, VisaApply.org participates in verified travel affiliate programs including <strong>Booking.com (AID 8119919)</strong> and <strong>Travelpayouts / Aviasales (Marker 801550)</strong>. When you book refundable visa-compliant hotels or flights through our partner links, we may earn a small commission at zero extra cost to you.
          </p>

          <h2 className="text-lg font-bold text-slate-900">4. Third-Party Links & Non-Governmental Disclaimer</h2>
          <p>
            VisaApply.org is an independent informational portal and is not affiliated with VFS Global, USCIS, IRCC, UKVI, or any government embassy. We provide external links to official government portals for user convenience and are not responsible for the privacy practices of external sites.
          </p>
        </div>

        <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-slate-800 font-medium flex items-center justify-between gap-4">
          <span>For any privacy queries, GDPR/DPDP data requests, or concerns, contact our Data Protection Officer:</span>
          <a href="mailto:contact@visaapply.org" className="text-[#0B3D91] font-bold hover:underline shrink-0">contact@visaapply.org</a>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Terms of Service View Component
// ----------------------------------------------------
export function TermsView({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
        <button onClick={() => navigate('/')} className="hover:underline">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span>Terms of Service</span>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-500 font-medium">Last updated: October 2026</p>

        <p className="text-sm text-slate-700 leading-relaxed">
          Welcome to <strong>VisaApply.org</strong>. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">1. Information & Non-Governmental Status</h2>
          <p>VisaApply.org is an independent travel intelligence and informational portal. <strong>We are NOT affiliated with VFS Global, IRCC, USCIS, or any government embassy or diplomatic mission.</strong> Official visa applications, biometrics, and fee payments must be processed directly through official government channels.</p>

          <h2 className="text-lg font-bold text-slate-900">2. Content Accuracy & Disclaimers</h2>
          <p>While we make every effort to maintain updated requirements, visa fees, document checklists, and processing timelines, immigration policies change frequently without prior notice. Users are advised to double-check information on official embassy channels before making non-refundable travel bookings.</p>

          <h2 className="text-lg font-bold text-slate-900">3. Intellectual Property</h2>
          <p>All guides, tools, and content published on VisaApply.org are protected by copyright laws. Reproduction without written consent is prohibited, except when using our official Embeddable Visa Badge Widget with attribution link intact.</p>
        </div>

        <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-slate-800 font-medium flex items-center justify-between gap-4">
          <span>For any legal or editorial queries, contact us:</span>
          <a href="mailto:contact@visaapply.org" className="text-[#0B3D91] font-bold hover:underline shrink-0">contact@visaapply.org</a>
        </div>
      </div>
    </div>
  );
}
