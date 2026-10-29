import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { 
  Globe, Plane, Briefcase, GraduationCap, Users, Building2, Award, 
  CheckCircle2, Trash2, RefreshCw, FileText, Shield, Search, 
  ArrowRight, ExternalLink, Clock, DollarSign, Menu, X, ChevronRight, Check,
  Mail, Copy, Send
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
  const isContact = path === '/contact';
  const isPrivacy = path === '/privacy';
  const isTerms = path === '/terms';
  const articleMatch = path.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})-([a-z]+)$/);
  const quizMatch = path.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})$/);

  let title = 'VisaApply.org – Global Visa Requirements & Guides';
  let description = 'Official global visa information, 2-step visa type quiz, fees, documents, and application guides for all 1,170 possible visa routes worldwide.';

  if (isAdmin) {
    title = 'Admin Editorial Portal – VisaApply.org';
    description = 'Manage AI-generated visa guide drafts and publish official immigration content.';
  } else if (isContact) {
    title = 'Contact Us – VisaApply.org';
    description = 'Get in touch with VisaApply.org. Email contact@visaapply.org for visa inquiries, partnerships, or support.';
  } else if (isPrivacy) {
    title = 'Privacy Policy – VisaApply.org';
    description = 'Privacy Policy for VisaApply.org. Learn how we handle data. Contact: contact@visaapply.org.';
  } else if (isTerms) {
    title = 'Terms of Service – VisaApply.org';
    description = 'Terms of Service for VisaApply.org. Contact: contact@visaapply.org.';
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

  const baseUrl = window.location.origin;
  let breadcrumbItems: any[] = [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}/` }
  ];

  if (isAdmin) {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Admin Portal", "item": `${baseUrl}/admin` });
  } else if (isContact) {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Contact Us", "item": `${baseUrl}/contact` });
  } else if (isPrivacy) {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": `${baseUrl}/privacy` });
  } else if (isTerms) {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Terms of Service", "item": `${baseUrl}/terms` });
  } else if (isSitemap) {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "All Visa Guides", "item": `${baseUrl}/sitemap` });
  } else if (quizMatch) {
    const from = quizMatch[1].toUpperCase();
    const to = quizMatch[2].toUpperCase();
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": `${from} to ${to} Visa Quiz`, "item": window.location.href });
  } else if (articleMatch) {
    const from = articleMatch[1].toUpperCase();
    const to = articleMatch[2].toUpperCase();
    const type = articleMatch[3].toUpperCase();
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": `${from} to ${to} Guides`, "item": `${baseUrl}/${from.toLowerCase()}-to-${to.toLowerCase()}` });
    breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": `${type} Visa Guide`, "item": window.location.href });
  }

  const schemas = [
    {
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
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems
    }
  ];
  ldScript.textContent = JSON.stringify(schemas);
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

  const safeFetchJson = async (url: string, options?: RequestInit, fallback: any = null) => {
    try {
      const res = await fetch(url, options);
      const text = await res.text();
      const trimmed = text.trim();
      if (!text || trimmed.startsWith('<') || trimmed.startsWith('export')) {
        console.warn(`API ${url} returned non-JSON response`);
        return fallback;
      }
      return JSON.parse(text);
    } catch (err) {
      console.error(`Fetch error for ${url}:`, err);
      return fallback;
    }
  };

  useEffect(() => {
    // Load pending drafts & published guides from localStorage, plus app data
    const loadAppData = async () => {
      try {
        const localDrafts = localStorage.getItem('pendingDrafts');
        if (localDrafts) {
          const parsed = JSON.parse(localDrafts);
          if (Array.isArray(parsed) && parsed.length > 0) setDrafts(parsed);
        }
        const localPub = localStorage.getItem('publishedGuides');
        if (localPub) {
          const parsedPub = JSON.parse(localPub);
          if (Array.isArray(parsedPub) && parsedPub.length > 0) setArticles(parsedPub);
        }
      } catch (e) {}

      const countriesData = await safeFetchJson('/api/countries', undefined, null);
      if (Array.isArray(countriesData) && countriesData.length > 0) {
        setCountries(countriesData);
      }

      const visaData = await safeFetchJson('/api/visa-types', undefined, null);
      if (Array.isArray(visaData)) {
        setVisaTypes(visaData);
      }

      const geoData = await safeFetchJson('/api/geo', undefined, null);
      if (geoData?.country) {
        setDetectedCountry(geoData.country);
        setSelectedOrigin(geoData.country);
      }
    };

    loadAppData();
  }, []);

  const handleTriggerCron = async () => {
    setCronLoading(true);
    setCronResult(null);
    try {
      const data = await safeFetchJson('/api/cron', { method: 'POST' }, { success: false, drafts: [] });
      if (data?.success && Array.isArray(data.drafts) && data.drafts.length > 0) {
        setDrafts(data.drafts);
        localStorage.setItem('pendingDrafts', JSON.stringify(data.drafts));
        setCronResult(`Generated ${data.drafts.length} AI drafts successfully using Gemini!`);
      } else {
        setCronResult(data.message || 'Cron triggered, but no drafts returned.');
      }
    } catch (err: any) {
      setCronResult(`Error: ${err.message}`);
    } finally {
      setCronLoading(false);
    }
  };

  const handleApproveDraft = async (draftId: string) => {
    try {
      const currentDrafts = [...drafts];
      const draftIndex = currentDrafts.findIndex((d: any) => d.id === draftId || d.slug === draftId);
      if (draftIndex !== -1) {
        const approved: any = currentDrafts[draftIndex];
        
        // Check if already published
        const exists = articles.some((g: any) => g.title === approved.title || g.slug === approved.route || g.slug === approved.slug);
        if (exists) {
          alert('Already published');
          currentDrafts.splice(draftIndex, 1);
          setDrafts(currentDrafts);
          localStorage.setItem('pendingDrafts', JSON.stringify(currentDrafts));
          return;
        }

        currentDrafts.splice(draftIndex, 1);
        setDrafts(currentDrafts);
        localStorage.setItem('pendingDrafts', JSON.stringify(currentDrafts));

        const newArticle: Article = {
          slug: approved.route || approved.slug || `guide-${Date.now()}`,
          title: approved.title,
          from: 'IN',
          to: 'US',
          type: approved.visaType?.toLowerCase() || 'tourist',
          date: new Date().toISOString().split('T')[0],
          fees: approved.fees || 'Standard Govt Fees',
          docs: approved.docs || 'Passport, Financial Proofs',
          excerpt: (approved.content || '').substring(0, 160).replace(/[#*`]/g, '') + '...',
          contentHtml: String(marked.parse(approved.content || '')),
          rawContent: approved.content
        };

        const updatedArticles = [newArticle, ...articles];
        setArticles(updatedArticles);
        localStorage.setItem('publishedGuides', JSON.stringify(updatedArticles));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    try {
      const currentDrafts = drafts.filter((d: any) => d.id !== draftId && d.slug !== draftId);
      setDrafts(currentDrafts);
      localStorage.setItem('pendingDrafts', JSON.stringify(currentDrafts));
    } catch (err) {
      console.error(err);
    }
  };

  // Router parsing
  const isHome = currentPath === '/';
  const isAdmin = currentPath === '/admin';
  const isContact = currentPath === '/contact';
  const isPrivacy = currentPath === '/privacy';
  const isTerms = currentPath === '/terms';
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

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-blue-100">
            <button onClick={() => navigate('/')} className={`transition-colors cursor-pointer ${currentPath === '/' ? 'text-white font-bold' : 'hover:text-white'}`}>Home</button>
            <button onClick={() => navigate('/sitemap')} className={`transition-colors cursor-pointer ${currentPath === '/sitemap' ? 'text-white font-bold' : 'hover:text-white'}`}>All Visa Guides</button>
            <button onClick={() => navigate('/contact')} className={`transition-colors cursor-pointer ${currentPath === '/contact' ? 'text-white font-bold' : 'hover:text-white'}`}>Contact</button>
            <button onClick={() => navigate('/admin')} className={`transition-colors cursor-pointer ${currentPath === '/admin' ? 'text-amber-300 font-bold' : 'text-amber-300 hover:text-amber-200'} flex items-center gap-1.5`}>
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
            <button onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-blue-100 hover:text-white font-medium">Contact Us</button>
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
            setArticles={setArticles}
            setDrafts={setDrafts}
            cronLoading={cronLoading}
            cronResult={cronResult}
            onTriggerCron={handleTriggerCron}
            onApprove={handleApproveDraft}
            onDelete={handleDeleteDraft}
            navigate={navigate}
          />
        ) : isContact ? (
          <ContactView navigate={navigate} />
        ) : isPrivacy ? (
          <PrivacyView navigate={navigate} />
        ) : isTerms ? (
          <TermsView navigate={navigate} />
        ) : isSitemap ? (
          <SitemapView 
            countries={countries} 
            visaTypes={visaTypes} 
            navigate={navigate} 
          />
        ) : isArticleMatch ? (
          <ArticleView match={isArticleMatch} articles={articles} navigate={navigate} />
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
            <div className="pt-2 text-xs text-slate-300 font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>Contact Us: </span>
              <a href="mailto:contact@visaapply.org" className="text-blue-400 font-bold hover:underline">contact@visaapply.org</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer">Home & Destinations</button></li>
              <li><button onClick={() => navigate('/sitemap')} className="hover:text-white transition-colors cursor-pointer">All Visa Guides</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-white transition-colors cursor-pointer">Contact Us</button></li>
              <li><a href="/api/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-1 text-slate-400">Sitemap (For Google) <ExternalLink className="w-3.5 h-3.5 opacity-70" /></a></li>
              <li><button onClick={() => navigate('/admin')} className="hover:text-white transition-colors cursor-pointer">Admin Dashboard</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide">Legal & Compliance</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button></li>
              <li><span className="text-slate-500">Cookie Preferences</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} VisaApply.org. All rights reserved. Independent portal. Contact: <a href="mailto:contact@visaapply.org" className="text-blue-400 hover:underline">contact@visaapply.org</a></p>
          <p className="text-blue-400 font-medium">Official Email: <a href="mailto:contact@visaapply.org" className="hover:underline font-bold">contact@visaapply.org</a></p>
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
  const [showMostPopularOnly, setShowMostPopularOnly] = useState(true);

  const popularCodes = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'AE', 'SG', 'JP', 'IT', 'ES', 'NL'];

  const baseCountries = showMostPopularOnly 
    ? countries.filter((c: Country) => popularCodes.includes(c.code.toUpperCase()))
    : countries;

  const filteredCountries = baseCountries.filter((c: Country) => 
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

      {/* Country Flag Grid Section with Filter Toggle */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {showMostPopularOnly ? 'Most Popular Destinations' : 'All Global Destinations'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Click any country flag to start your visa assessment & application guide</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setShowMostPopularOnly(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                showMostPopularOnly ? 'bg-white text-[#0B3D91] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Most Popular
            </button>
            <button
              onClick={() => setShowMostPopularOnly(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !showMostPopularOnly ? 'bg-white text-[#0B3D91] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All 30 Countries
            </button>
          </div>
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

const VISA_TYPES = [
  { id: 'tourist', name: 'Tourist Visa', label: 'Tourist Visa', icon: '🏖️', desc: 'Vacation, sightseeing, short visits' },
  { id: 'work', name: 'Work Visa', label: 'Work Visa', icon: '💼', desc: 'Employment, job, work permit' },
  { id: 'student', name: 'Student Visa', label: 'Student Visa', icon: '🎓', desc: 'Study, university, education' },
  { id: 'family', name: 'Family Visa', label: 'Family Visa', icon: '👨‍👩‍👧', desc: 'Spouse, family reunion, dependent' },
  { id: 'business', name: 'Business Visa', label: 'Business Visa', icon: '🤝', desc: 'Meetings, conferences, business' },
  { id: 'pr', name: 'PR / Golden Visa', label: 'PR / Golden Visa', icon: '🏠', desc: 'Permanent residency, immigration' }
];

// ----------------------------------------------------
// Visa Quiz View Component (2-Step Wizard)
// ----------------------------------------------------
function VisaQuizView({ match, visaTypes, countries, navigate, quizStep, setQuizStep, selectedVisaType, setSelectedVisaType, followUpAnswer, setFollowUpAnswer }: any) {
  const fromCode = match[1].toUpperCase();
  const toCode = match[2].toUpperCase();
  const storageKey = `visa_quiz_${fromCode}_${toCode}`;

  const [resumed, setResumed] = useState(false);

  const activeVisaTypes = (visaTypes && visaTypes.length > 0) ? visaTypes : VISA_TYPES;

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

  const handleVisaSelect = (typeId: string) => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
    navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${typeId}`);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {activeVisaTypes.map((type: any) => {
                const icon = type.icon || (
                  type.id === 'tourist' ? '🏖️' :
                  type.id === 'work' ? '💼' :
                  type.id === 'student' ? '🎓' :
                  type.id === 'family' ? '👨‍👩‍👧' :
                  type.id === 'business' ? '🤝' : '🏠'
                );
                return (
                  <button 
                    key={type.id}
                    onClick={() => handleVisaSelect(type.id)}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left cursor-pointer bg-white shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-3xl mb-2">{icon}</div>
                      <div className="font-bold text-lg text-slate-900">{type.name || type.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{type.desc}</div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#0B3D91]">
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

function ArticleSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-4 w-48 bg-slate-200 rounded mb-6"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 bg-slate-200 rounded-md"></div>
            <div className="h-4 w-32 bg-slate-200 rounded-md"></div>
          </div>
          <div className="h-10 w-3/4 bg-slate-200 rounded-xl"></div>
          <div className="space-y-3 pt-4">
            <div className="h-4 w-full bg-slate-200 rounded"></div>
            <div className="h-4 w-full bg-slate-200 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
            <div className="h-32 w-full bg-slate-100 rounded-xl mt-6"></div>
            <div className="h-4 w-full bg-slate-200 rounded"></div>
            <div className="h-4 w-4/5 bg-slate-200 rounded"></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="h-6 w-32 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-12 w-full bg-slate-100 rounded-xl"></div>
              <div className="h-20 w-full bg-slate-100 rounded-xl"></div>
              <div className="h-12 w-full bg-slate-100 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFallbackGuide(from: string, to: string, type: string) {
  const fromCountry = FALLBACK_COUNTRIES.find((c: Country) => c.code.toLowerCase() === from.toLowerCase()) || { name: from.toUpperCase() };
  const toCountry = FALLBACK_COUNTRIES.find((c: Country) => c.code.toLowerCase() === to.toLowerCase()) || { name: to.toUpperCase() };
  
  const title = `${fromCountry.name} to ${toCountry.name} ${type.toUpperCase()} Visa 2026 - Complete Guide`;
  const fees = type === 'student' ? '$150-$500' : type === 'work' ? '$200-$1000' : '$50-$200';
  const documents = [
    'Valid Passport (6 months validity)',
    'Visa Application Form',
    'Photographs (passport size)',
    'Bank Statements (6 months)',
    'Travel Insurance',
    type === 'student' ? 'Admission Letter from University' : '',
    type === 'work' ? 'Job Offer Letter & Work Contract' : '',
    type === 'family' ? 'Family Relationship Proof' : '',
  ].filter(Boolean);

  const steps = [
    'Check eligibility and gather documents',
    'Fill online application form',
    'Pay visa fees',
    'Book appointment at VFS/Embassy',
    'Attend interview/biometrics',
    'Track application status',
    'Collect passport with visa'
  ];

  const contentHtml = `
    <h2>Overview for ${fromCountry.name} to ${toCountry.name} ${type.toUpperCase()} Visa</h2>
    <p>Planning your journey from <strong>${fromCountry.name}</strong> to <strong>${toCountry.name}</strong> for a <strong>${type}</strong> stay? This comprehensive 2026 guide outlines official documentation, fees, processing timelines, and step-by-step application instructions.</p>
    
    <h2>Required Documents Checklist</h2>
    <ul>
      ${documents.map(d => `<li>${d}</li>`).join('')}
    </ul>

    <h2>Step-by-Step Application Process</h2>
    <ol>
      ${steps.map(s => `<li>${s}</li>`).join('')}
    </ol>

    <h2>Important Tips & Expert Advice</h2>
    <p>Apply at least 1 month before your intended travel date. Ensure all document copies are clear and certified where necessary. For official submissions, always refer to the official embassy or consulate portal.</p>
  `;

  return {
    slug: `${from.toLowerCase()}-to-${to.toLowerCase()}-${type.toLowerCase()}`,
    title,
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    type: type.toLowerCase(),
    date: new Date().toISOString().split('T')[0],
    fees,
    docs: documents.join(', '),
    excerpt: `Complete 2026 visa requirements, official fees, and document checklist for traveling from ${fromCountry.name} to ${toCountry.name}.`,
    contentHtml,
    rawContent: contentHtml
  };
}

// ----------------------------------------------------
// Article View Component
// ----------------------------------------------------
function ArticleView({ match, articles = [], navigate }: any) {
  const fromCode = match[1];
  const toCode = match[2];
  const typeCode = match[3];
  const slug = `${fromCode}-to-${toCode}-${typeCode}`;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/faq?from=${fromCode}&to=${toCode}&type=${typeCode}`)
      .then(res => res.json())
      .then(data => {
        if (data?.faqs && Array.isArray(data.faqs)) {
          setFaqs(data.faqs);
        }
        setFaqLoading(false);
      })
      .catch(() => {
        setFaqLoading(false);
      });
  }, [fromCode, toCode, typeCode]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (totalScroll > 0) {
        const currentScroll = window.scrollY;
        const progress = (currentScroll / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // 1. Check articles prop
    const found = articles.find((g: any) => g.slug === slug || g.route === `/${slug}`);
    if (found) {
      setArticle({
        ...found,
        from: fromCode.toUpperCase(),
        to: toCode.toUpperCase(),
        type: typeCode.toLowerCase(),
        fees: found.fees || (typeCode === 'student' ? '$150-$500' : '$50-$200'),
        docs: found.docs || 'Valid Passport, Application Form, Bank Statements',
        contentHtml: found.contentHtml || marked.parse(found.content || found.excerpt || '')
      });
      generateMetadata(window.location.pathname, [], found);
      setLoading(false);
      return;
    }

    // 2. Check localStorage publishedGuides
    try {
      const localPub = localStorage.getItem('publishedGuides');
      if (localPub) {
        const parsed = JSON.parse(localPub);
        const foundLocal = parsed.find((g: any) => g.slug === slug || g.route === `/${slug}`);
        if (foundLocal) {
          setArticle({
            ...foundLocal,
            from: fromCode.toUpperCase(),
            to: toCode.toUpperCase(),
            type: typeCode.toLowerCase(),
            fees: foundLocal.fees || (typeCode === 'student' ? '$150-$500' : '$50-$200'),
            docs: foundLocal.docs || 'Valid Passport, Application Form, Bank Statements',
            contentHtml: foundLocal.contentHtml || marked.parse(foundLocal.content || foundLocal.excerpt || '')
          });
          generateMetadata(window.location.pathname, [], foundLocal);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    // 3. Fetch API or Fallback
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
        const fallback = getFallbackGuide(fromCode, toCode, typeCode);
        setArticle(fallback as any);
        generateMetadata(window.location.pathname, [], fallback);
        setLoading(false);
      });
  }, [slug, fromCode, toCode, typeCode, articles]);

  if (loading) {
    return <ArticleSkeleton />;
  }

  const path = window.location.pathname; // example /in-to-ae-student
  const cleanPath = path.replace('/', '');
  const parts = cleanPath.split('-to-');
  const routeFrom = parts[0] || fromCode;
  const remaining = parts[1] || `${toCode}-${typeCode}`;
  const routeTo = remaining.split('-')[0] || toCode;
  const visaTypeRaw = remaining.split('-').slice(1).join(' ') || typeCode;
  const visaType = visaTypeRaw.charAt(0).toUpperCase() + visaTypeRaw.slice(1);

  const guideData = {
    title: article?.title || `${routeFrom.toUpperCase()} to ${routeTo.toUpperCase()} ${visaType} Visa 2026 - Complete Guide`,
    fee: article?.fees || '$50-$500',
    time: '5-15 working days',
    documents: [
      'Valid Passport (6 months validity)',
      'Visa Application Form',
      'Passport Photos',
      'Bank Statements 6 months',
      'Travel Insurance & Flight Booking',
      'Hotel Booking',
      visaType.toLowerCase().includes('student') || typeCode.toLowerCase().includes('student') ? 'Admission Letter + IELTS' : null,
      visaType.toLowerCase().includes('work') || typeCode.toLowerCase().includes('work') ? 'Job Offer + Work Contract' : null,
    ].filter(Boolean),
    steps: [
      'Gather documents',
      'Fill online form',
      'Pay fees',
      'Book VFS appointment',
      'Biometrics & Submission',
      'Track status',
      'Get visa'
    ]
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="text-center mb-6">
          <div className="text-sm text-blue-600 font-bold">{fromCode.toUpperCase()} → {toCode.toUpperCase()}</div>
          <h1 className="text-3xl font-bold mt-2">{guideData.title}</h1>
          <div className="flex justify-center gap-4 mt-4">
            <span className="bg-blue-100 px-4 py-2 rounded-full">Fee: {guideData.fee}</span>
            <span className="bg-green-100 px-4 py-2 rounded-full">Time: {guideData.time}</span>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-3">📄 Required Documents</h2>
          {guideData.documents.map((doc, i) => (
            <div key={i} className="flex gap-2 py-2 border-b"><span>✅</span> {doc}</div>
          ))}
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-3">📝 Step-by-Step Process</h2>
          {guideData.steps.map((step, i) => (
            <div key={i} className="flex gap-3 py-2"><span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">{i+1}</span> {step}</div>
          ))}
        </div>

        {/* Dynamic Gemini AI FAQs */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-900 flex items-center gap-2">
            <span>❓ Frequently Asked Questions ({fromCode.toUpperCase()} → {toCode.toUpperCase()})</span>
          </h2>
          {faqLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-10 bg-slate-100 rounded-xl"></div>
              <div className="h-10 bg-slate-100 rounded-xl"></div>
            </div>
          ) : faqs && faqs.length > 0 ? (
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button 
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full text-left p-4 font-semibold text-slate-900 flex justify-between items-center hover:bg-slate-100 transition-colors cursor-pointer text-sm"
                  >
                    <span>{faq.q || faq.question}</span>
                    <span className="text-slate-500 font-bold ml-2">{openFaqIndex === index ? '−' : '+'}</span>
                  </button>
                  {openFaqIndex === index && (
                    <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                      {faq.a || faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">No custom FAQs generated for this route yet. Refer to official embassy guidelines.</div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-blue-50/60 p-4 rounded-xl text-sm">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Mail className="w-4 h-4 text-[#0B3D91]" />
            <span>Need help with this visa guide? Email us:</span>
          </div>
          <a 
            href="mailto:contact@visaapply.org" 
            className="px-4 py-2 bg-[#0B3D91] text-white font-semibold rounded-lg text-xs hover:bg-[#09327a] transition-colors shadow-sm font-bold"
          >
            contact@visaapply.org
          </a>
        </div>
        
        <div className="mt-6 bg-yellow-50 p-4 rounded text-sm">Disclaimer: Check official embassy site for latest fees.</div>
        <div className="mt-6 text-center"><button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded cursor-pointer font-semibold hover:bg-blue-700 transition-colors">Return to Home</button></div>
      </div>

      <VisaUpdatesSignup />
    </div>
  );
}

// ----------------------------------------------------
// Visa Updates Email Signup Form
// ----------------------------------------------------
function VisaUpdatesSignup() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      const existing = localStorage.getItem('visa_update_subscribers');
      const subscribers = existing ? JSON.parse(existing) : [];
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('visa_update_subscribers', JSON.stringify(subscribers));
      }
    } catch (e) {
      console.error(e);
    }

    setSubscribed(true);
  };

  return (
    <div className="mt-10 bg-gradient-to-r from-[#0B3D91] to-[#072a68] rounded-2xl p-8 text-white shadow-lg">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-blue-200">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight">Get Visa Policy & Fee Updates</h3>
        <p className="text-blue-100 text-sm">
          Stay informed about sudden changes in visa fees, document checklists, and processing times for your favorite travel destinations.
        </p>

        {subscribed ? (
          <div className="p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-200 text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Subscribed successfully! You will receive visa requirement updates.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="flex-1 px-4 py-3 bg-white text-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder-slate-400"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-amber-400 text-slate-950 font-bold rounded-xl text-sm hover:bg-amber-300 transition-colors shadow-md shrink-0 cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        )}
        <p className="text-xs text-blue-200/70">No spam. Unsubscribe anytime. Official contact: <a href="mailto:contact@visaapply.org" className="underline hover:text-white">contact@visaapply.org</a></p>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Contact Page View Component
// ----------------------------------------------------
function ContactView({ navigate }: any) {
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
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-lg">Thank you for reaching out!</h3>
              <p className="text-xs text-slate-600">Your email client has been opened to send your message to contact@visaapply.org. We reply within 24 hours.</p>
              <button 
                onClick={() => setFormSubmitted(false)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-xl text-xs hover:bg-emerald-700 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea 
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your visa question or inquiry here..."
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#0B3D91] text-white font-semibold rounded-xl text-sm hover:bg-[#09327a] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
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
// Privacy Policy View Component
// ----------------------------------------------------
function PrivacyView({ navigate }: any) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
        <button onClick={() => navigate('/')} className="hover:underline">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span>Privacy Policy</span>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-500 font-medium">Last updated: 2026</p>

        <p className="text-sm text-slate-700 leading-relaxed">
          At <strong>VisaApply.org</strong>, we prioritize the privacy and confidentiality of our visitors. This Privacy Policy outlines the minimal information collected and how it is used across our global visa guidance services.
        </p>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
          <p>We collect minimal personal data necessary to deliver global visa requirements, documentation guidance, and updates:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Email Subscriptions:</strong> When you subscribe to 'Get Visa Updates', we save your email address in local browser storage to notify you of policy changes.</li>
            <li><strong>Log Files & Analytics:</strong> Standard non-personally identifiable log information such as browser type, IP address, and pages visited for performance optimization.</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900">2. Cookies and Advertising</h2>
          <p>VisaApply.org uses cookies to store visitor preferences and optimize user experience. Google AdSense and third-party vendors use cookies to serve relevant advertisements based on past visits.</p>

          <h2 className="text-lg font-bold text-slate-900">3. Third-Party Links & Disclaimers</h2>
          <p>VisaApply.org is an independent information portal. We provide external links to official embassy and immigration portals for user convenience. We are not responsible for the privacy practices or content of third-party websites.</p>
        </div>

        <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-slate-800 font-medium flex items-center justify-between gap-4">
          <span>For any privacy queries, data requests, or concerns, contact us:</span>
          <a href="mailto:contact@visaapply.org" className="text-[#0B3D91] font-bold hover:underline shrink-0">contact@visaapply.org</a>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Terms of Service View Component
// ----------------------------------------------------
function TermsView({ navigate }: any) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
        <button onClick={() => navigate('/')} className="hover:underline">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span>Terms of Service</span>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-500 font-medium">Last updated: 2026</p>

        <p className="text-sm text-slate-700 leading-relaxed">
          Welcome to <strong>VisaApply.org</strong>. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">1. Information & Non-Governmental Status</h2>
          <p>VisaApply.org is an independent travel intelligence and informational portal. <strong>We are NOT affiliated with VFS Global, IRCC, USCIS, or any government embassy or diplomatic mission.</strong> Official visa applications, biometrics, and fee payments must be processed directly through official government channels.</p>

          <h2 className="text-lg font-bold text-slate-900">2. Content Accuracy & Disclaimers</h2>
          <p>While we make every effort to maintain updated requirements, visa fees, document checklists, and processing timelines, immigration policies change frequently without prior notice. Users are advised to double-check information on official embassy channels before making non-refundable travel bookings.</p>

          <h2 className="text-lg font-bold text-slate-900">3. Intellectual Property</h2>
          <p>All guides, tools, and content published on VisaApply.org are protected by copyright laws. Reproduction without written consent is prohibited.</p>
        </div>

        <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-slate-800 font-medium flex items-center justify-between gap-4">
          <span>For any legal or editorial queries, contact us:</span>
          <a href="mailto:contact@visaapply.org" className="text-[#0B3D91] font-bold hover:underline shrink-0">contact@visaapply.org</a>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Admin Portal Component (Password Protected)
// ----------------------------------------------------
function AdminPortal({ drafts, articles, setArticles, setDrafts, cronLoading, cronResult, onTriggerCron, onApprove, onDelete, navigate }: any) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleTriggerWithCooldown = async () => {
    if (cooldown > 0 || cronLoading) return;
    setCooldown(30);
    const interval = setInterval(() => {
      setCooldown(c => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    await onTriggerCron();
  };

  const handleClearDuplicates = () => {
    const unique = articles.filter((g: any, index: number, self: any[]) => index === self.findIndex(t => t.title === g.title));
    setArticles(unique);
    localStorage.setItem('publishedGuides', JSON.stringify(unique));
  };

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
      const text = await res.text();
      if (!text || text.trim().startsWith('<')) {
        setAuthError('Server error: API endpoint returned HTML');
        setLoadingAuth(false);
        return;
      }
      const data = JSON.parse(text);
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setAuthError(data.message || 'Wrong password');
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
            disabled={cronLoading || cooldown > 0}
            onClick={handleTriggerWithCooldown}
            className="px-5 py-3 bg-[#0B3D91] text-white font-semibold rounded-xl text-sm hover:bg-[#09327a] transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${cronLoading ? 'animate-spin' : ''}`} />
            <span>{cronLoading ? 'Generating AI Guides...' : cooldown > 0 ? `Generating... Please wait (${cooldown}s)` : 'Trigger Gemini AI Auto-Blogger Now'}</span>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900">Published Guides ({articles.length})</h2>
          <button 
            onClick={handleClearDuplicates}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            Clear All Duplicates
          </button>
        </div>
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

      <div className="mt-8 text-center text-xs text-slate-500 font-medium">
        VisaApply.org Editorial Management Portal · Support: <a href="mailto:contact@visaapply.org" className="text-[#0B3D91] font-bold hover:underline">contact@visaapply.org</a>
      </div>
    </div>
  );
}
