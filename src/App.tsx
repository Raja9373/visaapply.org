import React, { useState, useEffect } from 'react';
import { 
  Globe, Plane, Briefcase, GraduationCap, Users, Building2, Award, 
  CheckCircle2, Trash2, RefreshCw, FileText, Shield, Search, 
  ArrowRight, ExternalLink, Clock, DollarSign, Menu, X, ChevronRight, Check
} from 'lucide-react';

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface VisaType {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

interface Article {
  slug: string;
  title: string;
  from: string;
  to: string;
  type: string;
  date: string;
  fees: string;
  docs: string;
  excerpt?: string;
  contentHtml?: string;
  rawContent?: string;
  content?: string;
}

const FALLBACK_COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" }, { code: "CA", name: "Canada", flag: "🇨🇦" }, { code: "GB", name: "United Kingdom", flag: "🇬🇧" }, { code: "AU", name: "Australia", flag: "🇦🇺" }, { code: "DE", name: "Germany", flag: "🇩🇪" }, { code: "FR", name: "France", flag: "🇫🇷" }, { code: "AE", name: "UAE Dubai", flag: "🇦🇪" }, { code: "SG", name: "Singapore", flag: "🇸🇬" }, { code: "JP", name: "Japan", flag: "🇯🇵" }, { code: "IN", name: "India", flag: "🇮🇳" }, { code: "BR", name: "Brazil", flag: "🇧🇷" }, { code: "IT", name: "Italy", flag: "🇮🇹" }, { code: "ES", name: "Spain", flag: "🇪🇸" }, { code: "NL", name: "Netherlands", flag: "🇳🇱" }, { code: "NZ", name: "New Zealand", flag: "🇳🇿" }, { code: "SE", name: "Sweden", flag: "🇸🇪" }, { code: "CH", name: "Switzerland", flag: "🇨🇭" }, { code: "IE", name: "Ireland", flag: "🇮🇪" }, { code: "NO", name: "Norway", flag: "🇳🇴" }, { code: "PT", name: "Portugal", flag: "🇵🇹" }, { code: "DK", name: "Denmark", flag: "🇩🇰" }, { code: "FI", name: "Finland", flag: "🇫🇮" }, { code: "BE", name: "Belgium", flag: "🇧🇪" }, { code: "AT", name: "Austria", flag: "🇦🇹" }, { code: "PL", name: "Poland", flag: "🇵🇱" }, { code: "MY", name: "Malaysia", flag: "🇲🇾" }, { code: "TH", name: "Thailand", flag: "🇹🇭" }, { code: "TR", name: "Turkey", flag: "🇹🇷" }, { code: "ZA", name: "South Africa", flag: "🇿🇦" }, { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" }
];

function generateMetadata(path: string, countries: Country[], article?: Article | null) {
  const isAdmin = path === '/admin';
  const isSitemap = path === '/sitemap';
  const articleMatch = path.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})-([a-z]+)$/);
  const quizMatch = path.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})$/);

  let title = 'VisaApply.org – Global Visa Requirements & Guides';
  let description = 'Official global visa information, 2-step visa type quiz, fees, documents, and application guides for all 1,170 possible visa routes worldwide.';

  if (isAdmin) {
    title = 'Admin Editorial Portal – VisaApply.org';
    description = 'Manage AI-generated visa guide drafts and publish official immigration content.';
  } else if (isSitemap) {
    title = 'All Visa Guides – Global Itineraries & Requirements | VisaApply.org';
    description = 'Explore complete visa requirements, official fees, and document checklists across all 30 global destination countries and visa categories.';
  } else if (articleMatch) {
    const from = articleMatch[1].toUpperCase();
    const to = articleMatch[2].toUpperCase();
    const type = articleMatch[3];
    if (article && article.title) {
      title = `${article.title} | VisaApply.org`;
      description = `Official guide for ${from} citizens applying for a ${type} visa to ${to}. Fees: ${article.fees}. Check required documents and step-by-step process.`;
    } else {
      title = `${from} to ${to} ${type.toUpperCase()} Visa Requirements & Guide – VisaApply.org`;
      description = `Complete visa guide for ${from} citizens applying for a ${type} visa to ${to}. Find fees, documents, processing time, and FAQs.`;
    }
  } else if (quizMatch) {
    const from = quizMatch[1].toUpperCase();
    const to = quizMatch[2].toUpperCase();
    const fromObj = countries.find(c => c.code.toLowerCase() === from.toLowerCase());
    const toObj = countries.find(c => c.code.toLowerCase() === to.toLowerCase());
    const fromName = fromObj ? fromObj.name : from;
    const toName = toObj ? toObj.name : to;

    title = `${fromName} to ${toName} Visa Quiz & Requirements – VisaApply.org`;
    description = `Take our 2-step visa quiz for traveling from ${fromName} to ${toName}. Explore tourist, work, student, family, and business visa guides.`;
  }

  document.title = title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', description);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);

  // Inject Schema.org JSON-LD for AEO & SEO Knowledge Graph
  let ldScript = document.getElementById('seo-ld-json');
  if (!ldScript) {
    ldScript = document.createElement('script');
    ldScript.id = 'seo-ld-json';
    ldScript.setAttribute('type', 'application/ld+json');
    document.head.appendChild(ldScript);
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "VisaApply.org",
    "applicationCategory": "TravelApplication",
    "operatingSystem": "All",
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
  ldScript.textContent = JSON.stringify(structuredData);
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [countries, setCountries] = useState<Country[]>(FALLBACK_COUNTRIES);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [detectedCountry, setDetectedCountry] = useState<Country | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<Country | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quiz state for /[from]-to-[to]
  const [quizStep, setQuizStep] = useState<1 | 2>(1);
  const [selectedVisaType, setSelectedVisaType] = useState<string>('tourist');
  const [followUpAnswer, setFollowUpAnswer] = useState<string>('yes');

  // Admin state
  const [drafts, setDrafts] = useState<Article[]>([]);
  const [cronLoading, setCronLoading] = useState(false);
  const [cronResult, setCronResult] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    generateMetadata(currentPath, countries);
  }, [currentPath, countries]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch countries, visa types, articles, and geo with robust try-catch blocks
    const loadAppData = async () => {
      try {
        const countriesRes = await fetch('/api/countries');
        if (countriesRes.ok) {
          const data = await countriesRes.json();
          if (Array.isArray(data) && data.length > 0) {
            setCountries(data);
          }
        }
      } catch (err) {
        console.error('Failed to load countries, using fallback:', err);
      }

      try {
        const visaTypesRes = await fetch('/api/visa-types');
        if (visaTypesRes.ok) setVisaTypes(await visaTypesRes.json());
      } catch (err) {
        console.error('Failed to load visa types:', err);
      }

      try {
        const geoRes = await fetch('/api/geo');
        if (geoRes.ok) {
          const data = await geoRes.json();
          if (data.country) {
            setDetectedCountry(data.country);
            setSelectedOrigin(data.country);
          }
        }
      } catch (err) {
        console.error('Failed to load geo:', err);
      }

      try {
        const articlesRes = await fetch('/api/articles');
        if (articlesRes.ok) setArticles(await articlesRes.json());
      } catch (err) {
        console.error('Failed to load articles:', err);
      }

      try {
        const draftsRes = await fetch('/api/admin/drafts');
        if (draftsRes.ok) setDrafts(await draftsRes.json());
      } catch (err) {
        console.error('Failed to load drafts:', err);
      }
    };

    loadAppData();
  }, []);

  const handleTriggerCron = async () => {
    setCronLoading(true);
    setCronResult(null);
    try {
      const res = await fetch('/api/cron', { method: 'POST' });
      const data = await res.json();
      setCronResult(data.message || 'Cron triggered successfully!');
      const draftsRes = await fetch('/api/admin/drafts').then(r => r.json());
      setDrafts(draftsRes);
      const artRes = await fetch('/api/articles').then(r => r.json());
      setArticles(artRes);
    } catch (err: any) {
      setCronResult(`Error: ${err.message}`);
    } finally {
      setCronLoading(false);
    }
  };

  const handleApproveDraft = async (slug: string) => {
    try {
      await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      });
      const draftsRes = await fetch('/api/admin/drafts').then(r => r.json());
      setDrafts(draftsRes);
      const artRes = await fetch('/api/articles').then(r => r.json());
      setArticles(artRes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDraft = async (slug: string) => {
    try {
      await fetch(`/api/admin/drafts/${slug}`, { method: 'DELETE' });
      const draftsRes = await fetch('/api/admin/drafts').then(r => r.json());
      setDrafts(draftsRes);
    } catch (err) {
      console.error(err);
    }
  };

  // Router parsing
  const isHome = currentPath === '/';
  const isAdmin = currentPath === '/admin';
  const isSitemap = currentPath === '/sitemap';
  const isArticleMatch = currentPath.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})-([a-z]+)$/);
  const isQuizMatch = currentPath.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})$/);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Official VFS-Style Top Header */}
      <header className="sticky top-0 z-50 bg-[#0B3D91] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Brand Zone */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Globe className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">VisaApply.org</span>
              <span className="text-xs text-blue-200 tracking-wide font-medium">Global Visa Requirements & Guides</span>
            </div>
          </div>

          {/* Nav Links (XML sitemap link removed as requested) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-blue-100">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors whitespace-nowrap">Home</button>
            <button onClick={() => navigate('/sitemap')} className="hover:text-white transition-colors whitespace-nowrap">All Visa Guides</button>
            <button onClick={() => navigate('/admin')} className="hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-300" /> Admin Portal
            </button>
          </nav>

          {/* Primary Action / Geo Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            {detectedCountry && (
              <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs text-blue-100 border border-white/15">
                <span>{detectedCountry.flag}</span>
                <span>Browsing from {detectedCountry.name}</span>
              </div>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#09327a] px-6 py-4 border-t border-blue-900/50 space-y-3">
            <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-blue-100 hover:text-white font-medium">Home</button>
            <button onClick={() => { navigate('/sitemap'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-blue-100 hover:text-white font-medium">All Visa Guides</button>
            <button onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-amber-300 hover:text-amber-200 font-medium">Admin Portal</button>
          </div>
        )}
      </header>

      {/* Main Content Router */}
      <main className="flex-1">
        {isAdmin ? (
          <AdminPortal 
            drafts={drafts} 
            articles={articles}
            cronLoading={cronLoading}
            cronResult={cronResult}
            onTriggerCron={handleTriggerCron}
            onApprove={handleApproveDraft}
            onDelete={handleDeleteDraft}
            navigate={navigate}
          />
        ) : isSitemap ? (
          <SitemapView 
            countries={countries} 
            visaTypes={visaTypes} 
            navigate={navigate} 
          />
        ) : isArticleMatch ? (
          <ArticleView match={isArticleMatch} navigate={navigate} />
        ) : isQuizMatch ? (
          <VisaQuizView 
            match={isQuizMatch} 
            visaTypes={visaTypes} 
            countries={countries}
            navigate={navigate}
            quizStep={quizStep}
            setQuizStep={setQuizStep}
            selectedVisaType={selectedVisaType}
            setSelectedVisaType={setSelectedVisaType}
            followUpAnswer={followUpAnswer}
            setFollowUpAnswer={setFollowUpAnswer}
          />
        ) : (
          <HomeView 
            countries={countries} 
            detectedCountry={detectedCountry}
            selectedOrigin={selectedOrigin}
            setSelectedOrigin={setSelectedOrigin}
            articles={articles}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            navigate={navigate}
          />
        )}
      </main>

      {/* AdSense Readiness Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div id="ad-slot" className="w-full bg-slate-200/70 border border-slate-300 rounded-xl p-4 text-center text-xs text-slate-500 tracking-wider uppercase">
          Advertisement Slot (Google AdSense Ready)
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-white">
              <Globe className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-lg">VisaApply.org</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              VisaApply.org is an independent global visa information portal providing accurate requirements, documentation checklists, and step-by-step application guidance worldwide.
            </p>
            <p className="text-xs text-slate-500">
              Disclaimer: We are not affiliated with VFS Global, IRCC, USCIS, or any government embassy. Official applications must be submitted through official government portals.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home & Destinations</button></li>
              <li><button onClick={() => navigate('/sitemap')} className="hover:text-white transition-colors">All Visa Guides</button></li>
              <li><a href="/api/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-1 text-slate-400">Sitemap (For Google) <ExternalLink className="w-3.5 h-3.5 opacity-70" /></a></li>
              <li><button onClick={() => navigate('/admin')} className="hover:text-white transition-colors">Admin Dashboard</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide">Legal & Compliance</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-500">Privacy Policy</span></li>
              <li><span className="text-slate-500">Terms of Service</span></li>
              <li><span className="text-slate-500">Cookie Preferences</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} VisaApply.org. All rights reserved.</p>
          <p className="text-blue-400 font-medium">domain: visaapply.org</p>
        </div>
      </footer>
    </div>
  );
}

// ----------------------------------------------------
// Home View Component
// ----------------------------------------------------
function HomeView({ countries, detectedCountry, selectedOrigin, setSelectedOrigin, articles, searchQuery, setSearchQuery, navigate }: any) {
  const [targetSearch, setTargetSearch] = useState('');

  const filteredCountries = countries.filter((c: Country) => 
    c.name.toLowerCase().includes(targetSearch.toLowerCase()) || 
    c.code.toLowerCase().includes(targetSearch.toLowerCase())
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0B3D91] to-[#072a68] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1.5 rounded-full text-xs text-blue-200">
            <Globe className="w-3.5 h-3.5" />
            <span>Global Visa Intelligence & Answer Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white balance">
            {detectedCountry ? `We see you are browsing from ${detectedCountry.name}. Where do you want to go?` : 'Where do you want to travel?'}
          </h1>
          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Select your destination country below to launch our 2-step visa type quiz and access official fee schedules, document checklists, and application guides.
          </p>

          {/* Origin Selector & Search Bar */}
          <div className="max-w-xl mx-auto bg-white p-3 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-3 items-center">
            <div className="w-full sm:w-auto flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl text-slate-700 text-sm font-medium">
              <span>Passport:</span>
              <select 
                value={selectedOrigin?.code || 'IN'}
                onChange={(e) => {
                  const found = countries.find((c: Country) => c.code === e.target.value);
                  if (found) setSelectedOrigin(found);
                }}
                className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
              >
                {countries.map((c: Country) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search destination country..."
                value={targetSearch}
                onChange={(e) => setTargetSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 30 Country Flag Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Popular Destinations</h2>
            <p className="text-sm text-slate-500 mt-1">Click any country flag to start your visa assessment & application guide</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">{filteredCountries.length} countries available</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCountries.map((country: Country) => {
            const originCode = (selectedOrigin?.code || 'IN').toLowerCase();
            const destCode = country.code.toLowerCase();
            const isSelf = originCode === destCode;

            return (
              <button
                key={country.code}
                disabled={isSelf}
                onClick={() => navigate(`/${originCode}-to-${destCode}`)}
                className={`group text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                  isSelf 
                    ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' 
                    : 'bg-white border-slate-200 hover:border-[#0B3D91] hover:shadow-md cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{country.flag}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm group-hover:text-[#0B3D91] transition-colors">{country.name}</h3>
                    <p className="text-xs text-slate-500">{isSelf ? 'Your Country' : `${selectedOrigin?.name || 'Your'} Visa`}</p>
                  </div>
                </div>
                {!isSelf && <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B3D91] group-hover:translate-x-0.5 transition-all" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Published Visa Guides Section */}
      <section className="bg-slate-100 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recently Published Visa Guides</h2>
              <p className="text-sm text-slate-500 mt-1">Verified official requirements, fees, and document checklists</p>
            </div>
          </div>

          {articles.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-700 text-base">No published guides yet</h3>
              <p className="text-sm text-slate-500 mt-1">Trigger the AI auto-blogger cron in the Admin Portal to generate guides.</p>
              <button 
                onClick={() => navigate('/admin')}
                className="mt-4 px-4 py-2 bg-[#0B3D91] text-white text-xs font-semibold rounded-lg hover:bg-[#09327a] transition-colors"
              >
                Go to Admin Portal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((art: Article) => (
                <div 
                  key={art.slug}
                  onClick={() => navigate(`/${art.slug}`)}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="uppercase bg-blue-50 text-[#0B3D91] px-2.5 py-1 rounded-md font-semibold">{art.type} visa</span>
                      <span>{art.date}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#0B3D91] transition-colors line-clamp-2">
                      {art.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {art.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {art.fees}</span>
                    <span className="text-[#0B3D91] flex items-center gap-1 group-hover:underline">Read Guide <ArrowRight className="w-3.5 h-3.5" /></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ----------------------------------------------------
// HTML Sitemap View Component (/sitemap)
// ----------------------------------------------------
function SitemapView({ countries, visaTypes, navigate }: any) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 pb-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">All Visa Guides</h1>
          <p className="text-sm text-slate-600 mt-2">
            Browse complete visa requirements, official fees, and document checklists across all 30 global destinations and 6 visa categories.
          </p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors"
        >
          Back to Home
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {countries.map((c: any) => {
          const isExpanded = expandedCountry === c.code;
          return (
            <div key={c.code} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{c.flag}</span>
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">{c.name}</h2>
                    <span className="text-xs text-slate-500 font-mono">Code: {c.code}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setExpandedCountry(isExpanded ? null : c.code)}
                  className="px-3 py-1.5 bg-blue-50 text-[#0B3D91] rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  {isExpanded ? 'Hide Categories' : 'View Categories'}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Available Visa Categories:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {visaTypes.map((vt: any) => (
                      <button
                        key={vt.id}
                        onClick={() => navigate(`/in-to-${c.code.toLowerCase()}-${vt.id}`)}
                        className="text-left p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-[#0B3D91] transition-colors text-xs font-medium text-slate-700 flex items-center justify-between group"
                      >
                        <span className="truncate">{vt.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Visa Quiz View Component (2-Step Wizard)
// ----------------------------------------------------
function VisaQuizView({ match, visaTypes, countries, navigate, quizStep, setQuizStep, selectedVisaType, setSelectedVisaType, followUpAnswer, setFollowUpAnswer }: any) {
  const fromCode = match[1].toUpperCase();
  const toCode = match[2].toUpperCase();
  const storageKey = `visa_quiz_${fromCode}_${toCode}`;

  const [resumed, setResumed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step) setQuizStep(parsed.step);
        if (parsed.visaType) setSelectedVisaType(parsed.visaType);
        if (parsed.followUp) setFollowUpAnswer(parsed.followUp);
        setResumed(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      const sessionData = {
        step: quizStep,
        visaType: selectedVisaType,
        followUp: followUpAnswer,
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(sessionData));
    } catch (e) {
      console.error(e);
    }
  }, [quizStep, selectedVisaType, followUpAnswer, storageKey]);

  const handleResetQuiz = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
    setQuizStep(1);
    setSelectedVisaType('tourist');
    setFollowUpAnswer('yes');
    setResumed(false);
  };

  const fromCountry = countries.find((c: Country) => c.code === fromCode) || { name: fromCode, flag: '🌍', code: fromCode };
  const toCountry = countries.find((c: Country) => c.code === toCode) || { name: toCode, flag: '🏛️', code: toCode };

  const handleSelectType = (typeId: string) => {
    setSelectedVisaType(typeId);
    setQuizStep(2);
  };

  const handleCompleteQuiz = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
    navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${selectedVisaType}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
        <button onClick={() => navigate('/')} className="hover:underline">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span>{fromCountry.name} to {toCountry.name} Visa Quiz</span>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12">
        {resumed && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
            <span>Resumed your previous quiz session for {fromCountry.name} to {toCountry.name}.</span>
            <button onClick={handleResetQuiz} className="underline font-semibold hover:text-blue-700">Start Over</button>
          </div>
        )}
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-4xl">{fromCountry.flag}</span>
            <ArrowRight className="w-6 h-6 text-slate-400" />
            <span className="text-4xl">{toCountry.flag}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Travel from {fromCountry.name} to {toCountry.name}
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            {quizStep === 1 ? 'Step 1 of 2: Select your primary purpose of travel' : 'Step 2 of 2: Quick eligibility check'}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full mt-6 overflow-hidden">
            <div className={`bg-[#0B3D91] h-full transition-all duration-300 ${quizStep === 1 ? 'w-1/2' : 'w-full'}`}></div>
          </div>
        </div>

        {quizStep === 1 ? (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-6 text-center">Why do you want to go to {toCountry.name}?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {visaTypes.map((vt: VisaType) => {
                const isSelected = selectedVisaType === vt.id;
                return (
                  <button
                    key={vt.id}
                    onClick={() => handleSelectType(vt.id)}
                    className={`text-left p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'border-[#0B3D91] bg-blue-50/50 shadow-md' 
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-[#0B3D91]/10 text-[#0B3D91] flex items-center justify-center mb-3">
                        {vt.id === 'tourist' && <Plane className="w-5 h-5" />}
                        {vt.id === 'work' && <Briefcase className="w-5 h-5" />}
                        {vt.id === 'student' && <GraduationCap className="w-5 h-5" />}
                        {vt.id === 'family' && <Users className="w-5 h-5" />}
                        {vt.id === 'business' && <Building2 className="w-5 h-5" />}
                        {vt.id === 'pr' && <Award className="w-5 h-5" />}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{vt.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{vt.desc}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#0B3D91]">
                      <span>Select Category</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-900 text-base mb-2">
                Follow-up question for {selectedVisaType.toUpperCase()} Visa to {toCountry.name}:
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {selectedVisaType === 'work' && 'Do you have an official confirmed job offer or employment contract from a registered employer in ' + toCountry.name + '?'}
                {selectedVisaType === 'tourist' && 'What is your intended duration of stay in ' + toCountry.name + '?'}
                {selectedVisaType === 'student' && 'Have you received an official acceptance letter or admission offer from a recognized institution?'}
                {selectedVisaType === 'family' && 'Is your family sponsor a citizen or permanent resident of ' + toCountry.name + '?'}
                {selectedVisaType === 'business' && 'Are you traveling for an established corporate conference or client meeting?'}
                {selectedVisaType === 'pr' && 'Do you meet the minimum point threshold or investment criteria?'}
              </p>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-[#0B3D91]">
                  <input 
                    type="radio" 
                    name="followUp" 
                    value="yes" 
                    checked={followUpAnswer === 'yes'}
                    onChange={(e) => setFollowUpAnswer(e.target.value)}
                    className="text-[#0B3D91] focus:ring-[#0B3D91]"
                  />
                  <span className="text-sm font-medium text-slate-800">Yes / Under 30 Days / Confirmed</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-[#0B3D91]">
                  <input 
                    type="radio" 
                    name="followUp" 
                    value="no" 
                    checked={followUpAnswer === 'no'}
                    onChange={(e) => setFollowUpAnswer(e.target.value)}
                    className="text-[#0B3D91] focus:ring-[#0B3D91]"
                  />
                  <span className="text-sm font-medium text-slate-800">No / Over 30 Days / Planning Stage</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setQuizStep(1)}
                className="w-1/3 px-4 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-colors text-sm"
              >
                Back
              </button>
              <button 
                onClick={handleCompleteQuiz}
                className="w-2/3 px-6 py-3 bg-[#0B3D91] text-white font-semibold rounded-xl hover:bg-[#09327a] transition-colors text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <span>View Complete Visa Guide</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Article View Component
// ----------------------------------------------------
function ArticleView({ match, navigate }: any) {
  const fromCode = match[1];
  const toCode = match[2];
  const typeCode = match[3];
  const slug = `${fromCode}-to-${toCode}-${typeCode}`;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setArticle(data);
        generateMetadata(window.location.pathname, [], data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#0B3D91] font-medium">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading official visa guide...</span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Visa Guide Not Available Yet</h1>
        <p className="text-slate-600 mb-6">This specific visa route guide hasn't been generated or approved yet.</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-3 bg-[#0B3D91] text-white font-semibold rounded-xl text-sm"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
        <button onClick={() => navigate('/')} className="hover:underline">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="uppercase">{article.from} to {article.to} ({article.type})</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Article Content */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-4 text-xs font-semibold">
            <span className="bg-blue-50 text-[#0B3D91] px-3 py-1 rounded-md uppercase">{article.type} Visa</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">Published on {article.date}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
            {article.title}
          </h1>

          {/* Social Media Share Component */}
          <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Share This Guide:</span>
            <button 
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')}
              className="px-3.5 py-1.5 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Facebook</span>
            </button>
            <button 
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')}
              className="px-3.5 py-1.5 bg-slate-900/10 text-slate-900 hover:bg-slate-900/20 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>X (Twitter)</span>
            </button>
            <button 
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank', 'width=600,height=400')}
              className="px-3.5 py-1.5 bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>LinkedIn</span>
            </button>
          </div>

          <div 
            className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed text-base [&>h2]:text-xl [&>h2]:font-bold [&>h2]:text-slate-900 [&>h2]:mt-8 [&>h2]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: article.contentHtml || '' }}
          />
        </div>

        {/* Right Sidebar: Quick Facts & AdSense */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-28">
            <h3 className="font-bold text-slate-900 text-lg mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#0B3D91]" />
              <span>Visa Summary</span>
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Official Fees</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> {article.fees}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Required Documents</span>
                <p className="font-medium text-slate-800 mt-0.5 text-xs leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {article.docs}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">Processing Time</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Clock className="w-4 h-4 text-amber-600" /> 15 to 30 Business Days
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button 
                onClick={() => window.print()}
                className="w-full py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                Print / Save Guide PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Admin Portal Component (Password Protected)
// ----------------------------------------------------
function AdminPortal({ drafts, articles, cronLoading, cronResult, onTriggerCron, onApprove, onDelete, navigate }: any) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAuth(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setAuthError('Wrong password');
      }
    } catch (err) {
      setAuthError('Authentication failed');
    } finally {
      setLoadingAuth(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Admin Portal Access</h1>
            <p className="text-xs text-slate-500 mt-1">Enter password to manage VisaApply.org editorial drafts</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input 
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                required
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium text-center">
                {authError}
              </div>
            )}

            <button 
              type="submit"
              disabled={loadingAuth}
              className="w-full py-3 bg-[#0B3D91] text-white font-semibold rounded-xl text-sm hover:bg-[#09327a] transition-colors shadow-md disabled:opacity-50"
            >
              {loadingAuth ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
            <Shield className="w-4 h-4" />
            <span>Admin Editorial Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">VisaApply.org Management</h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            disabled={cronLoading}
            onClick={onTriggerCron}
            className="px-5 py-3 bg-[#0B3D91] text-white font-semibold rounded-xl text-sm hover:bg-[#09327a] transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${cronLoading ? 'animate-spin' : ''}`} />
            <span>{cronLoading ? 'Generating AI Guides...' : 'Trigger Gemini AI Auto-Blogger Now'}</span>
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-300 transition-colors"
          >
            Lock
          </button>
        </div>
      </div>

      {cronResult && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900 font-medium flex items-center justify-between">
          <span>{cronResult}</span>
          <button onClick={() => window.location.reload()} className="text-xs underline font-semibold">Refresh Page</button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Published Guides</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{articles.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Pending Drafts (AI Generated)</span>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">{drafts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Automated Cron Schedule</span>
          <p className="text-lg font-bold text-slate-800 mt-2">Daily at 5:30 AM IST (00:00 UTC)</p>
        </div>
      </div>

      {/* Pending Drafts Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-12">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
          <span>Pending AI Drafts ({drafts.length})</span>
          <span className="text-xs text-slate-400 font-normal">Review before publishing</span>
        </h2>

        {drafts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No pending drafts found.</p>
            <p className="text-xs text-slate-400 mt-1">Click the "Trigger Gemini AI Auto-Blogger" button above to generate new drafts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft: Article) => (
              <div key={draft.slug} className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Draft</span>
                    <span>·</span>
                    <span className="uppercase">{draft.type} visa</span>
                    <span>·</span>
                    <span>{draft.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{draft.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-1">{draft.content?.substring(0, 120)}...</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => onApprove(draft.slug)}
                    className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Publish
                  </button>
                  <button 
                    onClick={() => onDelete(draft.slug)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    title="Delete Draft"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published Guides Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Published Guides ({articles.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Route</th>
                <th className="p-3">Visa Type</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {articles.map((art: Article) => (
                <tr key={art.slug} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{art.title}</td>
                  <td className="p-3 font-mono text-xs text-slate-600">/{art.slug}</td>
                  <td className="p-3 uppercase text-xs font-medium text-[#0B3D91]">{art.type}</td>
                  <td className="p-3 text-slate-500 text-xs">{art.date}</td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => navigate(`/${art.slug}`)}
                      className="text-xs font-semibold text-[#0B3D91] hover:underline"
                    >
                      View Live
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
