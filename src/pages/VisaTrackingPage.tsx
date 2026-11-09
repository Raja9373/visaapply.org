import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Mail,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileSearch
} from 'lucide-react';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface VisaTrackingPageProps {
  onNavigate?: (path: string) => void;
}

interface OfficialPortal {
  name: string;
  agency: string;
  url: string;
  instructions: string;
  typicalTime: string;
}

const TRACKING_PORTALS: Record<string, OfficialPortal[]> = {
  USA: [
    {
      name: 'CEAC Official Visa Status Check (U.S. Department of State)',
      agency: 'CEAC / U.S. State Dept',
      url: 'https://ceac.state.gov/CEACStatTracker/Status.aspx',
      instructions: 'Select Nonimmigrant Visa (NIV) or Immigrant Visa (IV), choose your Embassy location, and enter your DS-160 Application ID / Case Number.',
      typicalTime: '3–15 Working Days after Interview'
    },
    {
      name: 'CGI Federal / USVisaScheduling Passport Delivery Tracker',
      agency: 'CGI Federal / VFS Passport Desk',
      url: 'https://www.usvisascheduling.com/',
      instructions: 'Log in to your official USVisaScheduling profile to track passport dispatch and BlueDart / VFS pickup status once CEAC shows "Issued".',
      typicalTime: '2–5 Days after Visa Issuance'
    },
    {
      name: 'USCIS Case Status Online (I-129 / I-130 / I-797 Petitions)',
      agency: 'USCIS Official Portal',
      url: 'https://egov.uscis.gov/casestatus/landing.do',
      instructions: 'Enter your 13-character USCIS Receipt Number (e.g., EAC, WAC, LIN, SRC, IOE) without dashes.',
      typicalTime: 'Real-time Petition Updates'
    }
  ],
  Schengen: [
    {
      name: 'VFS Global Official Schengen Visa Tracking Portal',
      agency: 'VFS Global (France, Germany, Italy, Switzerland, Netherlands, etc.)',
      url: 'https://www.vfsglobal.com/en/individuals/track-application.html',
      instructions: 'Select your country of application and destination Schengen country, then enter your VFS Reference Number (found on your invoice receipt) and Last Name.',
      typicalTime: '10–15 Calendar Days'
    },
    {
      name: 'BLS International Official Tracking (Spain Schengen Visa)',
      agency: 'BLS International',
      url: 'https://india.blsspainvisa.com/track_application.php',
      instructions: 'Enter your BLS Reference Number and Date of Birth to check real-time passport movement between the BLS Center and the Embassy of Spain.',
      typicalTime: '10–15 Working Days'
    },
    {
      name: 'TLScontact Schengen Application Tracker',
      agency: 'TLScontact',
      url: 'https://www.tlscontact.com/',
      instructions: 'Sign in to your TLScontact account for the specific Schengen embassy where your biometrics were enrolled.',
      typicalTime: '10–15 Calendar Days'
    }
  ],
  UK: [
    {
      name: 'VFS Global UKVI Visa Application Tracker',
      agency: 'VFS Global / UK Visas & Immigration (UKVI)',
      url: 'https://www.vfsglobal.com/en/individuals/track-application.html',
      instructions: 'Enter your GWF Reference Number (e.g., GWF012345678) and your email or last name to check biometric and passport dispatch status.',
      typicalTime: '15 Working Days (3 Weeks) or 5 Days Priority'
    },
    {
      name: 'TLScontact Official UK Visa Tracking Portal',
      agency: 'TLScontact / UKVI',
      url: 'https://uk.tlscontact.com/',
      instructions: 'Log in to your TLScontact dashboard via GOV.UK to view live transfer status to UKVI Decision Making Centre.',
      typicalTime: '15 Working Days'
    },
    {
      name: 'GOV.UK Official eVisa & Immigration Status Checker',
      agency: 'GOV.UK Home Office',
      url: 'https://www.gov.uk/view-prove-immigration-status',
      instructions: 'Sign in with your UKVI account details and passport number to view your digital eVisa status.',
      typicalTime: 'Instant Digital Verification'
    }
  ],
  Canada: [
    {
      name: 'IRCC Official Application Status Tracker',
      agency: 'Immigration, Refugees and Citizenship Canada (IRCC)',
      url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/application/check-status.html',
      instructions: 'Sign in to your GCKey or IRCC Portal account, or use the Official Application Status Tracker with your UCI and Application Number.',
      typicalTime: '15–45 Days depending on stream'
    },
    {
      name: 'VFS Global Canada Passport Submission & Envelope Tracker',
      agency: 'VFS Global Canada',
      url: 'https://visa.vfsglobal.com/ind/en/can/track-application',
      instructions: 'Enter the Tracking ID printed on your VFS receipt after Biometrics or Original Passport Request (PPR).',
      typicalTime: '5–10 Working Days for Passport Stamping'
    }
  ],
  Australia: [
    {
      name: 'Australian Home Affairs ImmiAccount Official Status Portal',
      agency: 'Department of Home Affairs (Australia)',
      url: 'https://online.immi.gov.au/lusc/login',
      instructions: 'Log in to your ImmiAccount to view real-time status (Received, Initial Assessment, Further Assessment, or Finalised) and download your Visa Grant Notice.',
      typicalTime: '10–28 Days (100% Digital e-Visa)'
    },
    {
      name: 'VEVO (Visa Entitlement Verification Online)',
      agency: 'Australian Border Force / Home Affairs',
      url: 'https://online.immi.gov.au/evo/firstParty?actionType=query',
      instructions: 'Enter your Passport Number and Transaction Reference Number (TRN) or Visa Grant Number to verify active visa conditions.',
      typicalTime: 'Instant Online Check'
    }
  ],
  UAE: [
    {
      name: 'ICP Smart Services Official UAE Visa Status Tracker',
      agency: 'Federal Authority for Identity, Citizenship, Customs & Port Security (ICP)',
      url: 'https://smartservices.icp.gov.ae/echannels/web/client/default.html#/fileValidity',
      instructions: 'Select Search by Passport Information, enter your Passport Number, Passport Expiry Date, and Nationality.',
      typicalTime: '24–72 Hours'
    },
    {
      name: 'GDRFA Dubai Official Visa Status Portal',
      agency: 'General Directorate of Residency and Foreigners Affairs – Dubai',
      url: 'https://smart.gdrfad.gov.ae/Public_Th/StatusInquiry_New.aspx',
      instructions: 'Enter your Application Number, Transaction Number, and First Name to check Dubai tourist or residence visa approval.',
      typicalTime: '24–72 Hours'
    }
  ],
  Global: [
    {
      name: 'VFS Global Worldwide Application Status Tracker (140+ Countries)',
      agency: 'VFS Global Official Network',
      url: 'https://www.vfsglobal.com/en/individuals/track-application.html',
      instructions: 'Choose your country of residence and destination embassy to access the dedicated VFS tracking portal for your route.',
      typicalTime: '7–15 Working Days'
    }
  ]
};

export const VisaTrackingPage: React.FC<VisaTrackingPageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  const [country, setCountry] = useState('USA');
  const [appType, setAppType] = useState('Tourist / Visitor Visa');
  const [refNumber, setRefNumber] = useState('');
  const [searched, setSearched] = useState(false);

  // Email Reminder state (Same Email Only system as Slot Alert)
  const [reminderEmail, setReminderEmail] = useState('');
  const [reminderSaved, setReminderSaved] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setTimeout(() => {
      const el = document.getElementById('official-tracking-results');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderEmail || !reminderEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    setReminderLoading(true);
    try {
      await fetch('/api/slot-alert/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: reminderEmail.trim(),
          fromCountry: 'IN',
          toCountry: country,
          embassyCity: `Visa Tracking Reminder (${appType})`
        })
      });
    } catch {
      // Fallback to localStorage
    }
    try {
      const existing = JSON.parse(localStorage.getItem('visaapply_email_subscribers') || '[]');
      existing.push({
        email: reminderEmail.trim(),
        context: `Visa Tracking Status Reminder - ${country} (${appType})`,
        date: new Date().toISOString()
      });
      localStorage.setItem('visaapply_email_subscribers', JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }
    setReminderLoading(false);
    setReminderSaved(true);
  };

  const activePortals = TRACKING_PORTALS[country] || TRACKING_PORTALS.Global;

  const statusMeanings = [
    {
      status: 'Received',
      badge: 'Stage 1 • Biometrics & Intake',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: Clock,
      meaning:
        'Your application form, biometrics, and passport have been logged at the Visa Application Center (VFS / TLS / BLS) and are being dispatched to the Embassy or Consulate for review.'
    },
    {
      status: 'Under Process',
      badge: 'Stage 2 • Consular Review',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: FileSearch,
      meaning:
        'A consular visa officer is actively reviewing your documents, verifying bank statements, checking flight/hotel reservations, and conducting background security checks.'
    },
    {
      status: 'Approved',
      badge: 'Stage 3 • Visa Issued / Dispatched',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      meaning:
        'Your visa has been granted ("Issued")! The visa vignette sticker has been affixed to your passport (or digital e-Visa issued) and dispatched for courier delivery or collection.'
    },
    {
      status: 'Rejected',
      badge: 'Stage 4 • Refused / Appeal Option',
      color: 'bg-red-50 border-red-200 text-red-900',
      icon: AlertCircle,
      meaning:
        'The visa officer was not satisfied with one or more requirements and enclosed an official refusal letter explaining the ground. You can review the refusal letter and prepare an appeal or re-application.'
    }
  ];

  const faqs = [
    {
      q: 'Can I track my visa status using only my Passport Number?',
      a: 'For several countries (such as UAE ICP Smart Services and Australian VEVO), you can check your status directly with your Passport Number. For VFS Global, US CEAC, UKVI, and IRCC Canada, you will need both your Passport Number / Last Name and your Application Reference Number (such as your DS-160 ID, GWF number, or VFS receipt number).'
    },
    {
      q: 'Why does VFS Global show "Processed application is in transit" without telling me if it is approved?',
      a: 'For privacy and security reasons, VFS Global, BLS, and TLScontact staff do not know the final decision of the Embassy. The sealed envelope containing your passport is sent back from the Consulate, and you will see the visa sticker (or refusal letter) only when you open the sealed passport packet.'
    },
    {
      q: 'Does VisaApply.org store my passport or application number?',
      a: 'No. We never store your passport number or personal tracking reference on our servers. Our tool directs you immediately to the official government and diplomatic tracking portals (CEAC, VFS Global, TLScontact, IRCC, ImmiAccount).'
    },
    {
      q: 'Is the Email Status Reminder service 100% free?',
      a: 'Yes! Our Email Status Reminder is 100% free with zero charges and no spam.'
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

      {/* Top Back to Home Bar */}
      <PageBackBar onNavigate={onNavigate} pageName="Track Your Visa Application Status" />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FREE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Track Your Visa Application Status
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Direct, verified links to official embassy and consular tracking portals—including VFS Global, CGI Federal / CEAC (USA), TLScontact (UK), IRCC (Canada), and ImmiAccount.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-10">
        {/* Interactive Visa Tracking Lookup Box */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B2A5B] flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Select Country &amp; Application Details</h2>
                <p className="text-xs text-slate-500">Find the exact official government or VFS tracking portal for your visa application</p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
              FREE OFFICIAL LINKS
            </span>
          </div>

          <form onSubmit={handleTrackSearch} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Destination Country *
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                >
                  <option value="USA">🇺🇸 United States (USA - CEAC / CGI)</option>
                  <option value="Schengen">🇪🇺 Schengen (VFS / BLS / TLScontact)</option>
                  <option value="UK">🇬🇧 United Kingdom (UKVI / VFS / TLS)</option>
                  <option value="Canada">🇨🇦 Canada (IRCC / VFS Global)</option>
                  <option value="Australia">🇦🇺 Australia (ImmiAccount / VEVO)</option>
                  <option value="UAE">🇦🇪 United Arab Emirates (ICP / GDRFA)</option>
                  <option value="Global">🌍 Other Country (140+ VFS Global Hubs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Application Type *
                </label>
                <select
                  value={appType}
                  onChange={(e) => setAppType(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                >
                  <option value="Tourist / Visitor Visa">Tourist / Visitor Visa</option>
                  <option value="Student / Study Visa">Student / Study Visa</option>
                  <option value="Work / Employment Visa">Work / Employment Visa</option>
                  <option value="Business / Conference Visa">Business / Conference Visa</option>
                  <option value="Family / Dependent Visa">Family / Dependent Visa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Application / Passport Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. AA00B12345 / GWF0123456"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#0B2A5B] hover:bg-[#0B3D91] text-white font-black text-base rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5 text-amber-300" />
              <span>Find Official Tracking Portal →</span>
            </button>
          </form>

          {/* Official Portals Result Section (Always visible or highlighted on click) */}
          <div id="official-tracking-results" className="mt-8 pt-6 border-t border-slate-200 space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-black text-slate-900">
                Official {country} Visa Tracking Portals ({appType})
              </h3>
              {searched && refNumber && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg text-xs font-bold text-[#0B2A5B]">
                  <span>Reference Ready to Paste:</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-blue-300 font-mono">{refNumber}</code>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {activePortals.map((portal, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-slate-50 hover:bg-blue-50/40 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black uppercase bg-[#0B2A5B] text-white px-2.5 py-0.5 rounded-full">
                        {portal.agency}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        ⏱ Typical Processing: {portal.typicalTime}
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900">{portal.name}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{portal.instructions}</p>
                  </div>

                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
                  >
                    <span>Track on Official Site →</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Email Reminder Box (Same Email Only system as Slot Alert) */}
        <div className="bg-gradient-to-r from-[#0B2A5B] to-[#0B3D91] rounded-2xl p-6 sm:p-8 text-white shadow-md border border-blue-800">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold">
                <Mail className="w-3.5 h-3.5" />
                <span>FREE EMAIL REMINDER • NO SPAM</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Enter Email, We Will Remind You to Check Status
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Get a free automated email reminder with direct official portal links for your {country} ({appType}) application so you never miss passport dispatch or interview updates.
              </p>
            </div>

            <div className="w-full lg:w-auto shrink-0">
              {reminderSaved ? (
                <div className="bg-emerald-500/20 border border-emerald-400/40 p-4 rounded-xl flex items-center gap-2 text-xs sm:text-sm text-emerald-200 font-bold justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                  <span>Status Reminder Activated on Email! We will remind you to check your official status.</span>
                </div>
              ) : (
                <form onSubmit={handleReminderSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your Email for Status Reminder"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    className="min-w-[260px] px-4 py-3 bg-white/10 border border-white/25 rounded-xl text-xs sm:text-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={reminderLoading}
                    className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    {reminderLoading ? 'Saving...' : 'Set Email Reminder →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* What Does Each Status Mean? */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-[#0B2A5B]" />
            <div>
              <h2 className="text-xl font-black text-slate-900">What Does Each Visa Application Status Mean?</h2>
              <p className="text-xs text-slate-500">Plain-English explanation of official embassy and VFS tracking statuses</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statusMeanings.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div key={idx} className={`p-5 rounded-2xl border ${item.color} flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/80">
                        {item.badge}
                      </span>
                      <IconComponent className="w-5 h-5 shrink-0" />
                    </div>
                    <h3 className="text-lg font-black mb-1.5">{item.status}</h3>
                    <p className="text-xs leading-relaxed opacity-90">{item.meaning}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How to Check Status Step-by-Step Guide */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">How to Check Your Visa Application Status (Step-by-Step Guide)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="w-7 h-7 rounded-full bg-[#0B2A5B] text-white text-xs font-black flex items-center justify-center mb-2">
                1
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 mb-1">Locate Your Receipt Number</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Find your application reference on your biometrics receipt (e.g., VFS Reference Number, DS-160 Barcode, UK GWF Number, or Canada UCI).
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="w-7 h-7 rounded-full bg-[#0B2A5B] text-white text-xs font-black flex items-center justify-center mb-2">
                2
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 mb-1">Open Official Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Click the "Track on Official Site →" button above for your destination country to launch the official diplomatic tracking page.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="w-7 h-7 rounded-full bg-[#0B2A5B] text-white text-xs font-black flex items-center justify-center mb-2">
                3
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 mb-1">Enter Reference &amp; Last Name</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your reference number, passport number, or date of birth exactly as printed on your passport and solve the security captcha.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="w-7 h-7 rounded-full bg-[#0B2A5B] text-white text-xs font-black flex items-center justify-center mb-2">
                4
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 mb-1">Collect Your Passport</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once the status changes to "Dispatched" or "Ready for Collection", carry your original receipt and government ID to collect your passport.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">Frequently Asked Questions (Visa Status Tracking)</h2>
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

        {/* Shared Bottom Email Subscribe Box */}
        <EmailSubscribeBox pageContext="Visa Application Status Tracker" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
