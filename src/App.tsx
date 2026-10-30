import React, { useState, useEffect } from 'react';
import { FULL_VISA_DB, verifyNoVisaMissed, CountryVisas } from './data/fullVisaDatabase';
import { getEmbassyInfo } from './data/embassyAddresses';
import { TRANSLATIONS, LANGUAGE_MAP, getTranslation } from './data/translations';
import { getLanguageForCountry, LANGUAGE_NAMES } from './data/languageMap';
import { VerificationView } from './components/VerificationView';
import { AuditPage } from './pages/AuditPage';
import { SitemapPage } from './pages/SitemapPage';
import { AdSenseBanner } from './components/AdSenseBanner';
import { BlogArticleView } from './components/BlogArticleView';
import { DEFAULT_PUBLISHED_GUIDES } from './data/defaultArticles';
import { fetchWithRetry } from './utils/fetchWithRetry';

import { JP_TO_IN_VISA } from './data/jpToInDetailed';
import { marked } from 'marked';
import { 
  Globe, Plane, Briefcase, GraduationCap, Users, Building2, Award, 
  CheckCircle2, Trash2, RefreshCw, FileText, Shield, Search, 
  ArrowRight, ExternalLink, Clock, DollarSign, Menu, X, ChevronRight, Check,
  Mail, Copy, Send, MapPin, Phone, ChevronDown, ArrowUp, Navigation
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
  } else if (article && article.title) {
    title = `${article.title} | VisaApply.org`;
    description = article.excerpt || `Complete 2026 visa guide for ${article.title}. Find fees, documents, processing time, and FAQs.`;
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
  } else if (path !== '/' && path.includes('-to-')) {
    const clean = path.replace(/^\//, '').replace(/-/g, ' ');
    const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
    title = `${formatted} (2026 Guide) | VisaApply.org`;
    description = `Official 2026 comprehensive visa requirements, application process, and documentation guide for ${formatted}.`;
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

// ----------------------------------------------------
// Level 1: Visa Category Selection View (/:from-to-:to)
// ----------------------------------------------------
function VisaCategorySelectionView({ match, countries, navigate }: any) {
  const fromCode = match[1].toUpperCase();
  const toCode = match[2].toUpperCase();

  const initialLang = LANGUAGE_MAP[fromCode] || 'en';
  const [currentLang, setCurrentLang] = useState(initialLang);

  useEffect(() => {
    setCurrentLang(LANGUAGE_MAP[fromCode] || 'en');
  }, [fromCode]);

  const t = getTranslation(currentLang);
  const isJa = currentLang === 'ja';

  const fromCountry = countries.find((c: Country) => c.code === fromCode) || { name: fromCode, flag: '🌍', code: fromCode };
  const toCountry = countries.find((c: Country) => c.code === toCode) || { name: toCode, flag: '🏛️', code: toCode };

  const isJpToIn = fromCode === 'JP' && toCode === 'IN';
  const countryVisas = isJpToIn ? JP_TO_IN_VISA["IN"] : (FULL_VISA_DB[toCode] || FULL_VISA_DB["US"]);

  const CATEGORIES = [
    { id: 'tourist', name: t.touristVisa, icon: '🏖️', desc: isJa ? '観光、親族訪問、短期滞在、ヨガ・瞑想' : 'Vacations, sightseeing, visiting friends & short term stay', count: countryVisas?.tourist?.length || 2 },
    { id: 'work', name: t.workVisa, icon: '💼', desc: isJa ? '就労、駐在員、技術指導、専門業務' : 'Employment, job permit, executive transfers & skilled work', count: countryVisas?.work?.length || 2 },
    { id: 'student', name: t.studentVisa, icon: '🎓', desc: isJa ? '大学・大学院留学、研究機関、語学研修' : 'Higher education, university degree & vocational study', count: countryVisas?.student?.length || 2 },
    { id: 'family', name: t.familyVisa, icon: '👨‍👩‍👧', desc: isJa ? '配偶者・家族帯同、同伴ビザ' : 'Spouse, children, parents & dependent residence permits', count: countryVisas?.family?.length || 2 },
    { id: 'business', name: t.businessVisa, icon: '🤝', desc: isJa ? '商談、会議出張、市場調査、契約締結' : 'Corporate meetings, conferences & commercial investor options', count: countryVisas?.business?.length || 2 },
    { id: 'pr', name: t.prVisa, icon: '🏠', desc: isJa ? 'インド海外市民権（OCI）、終身ビザ免除' : 'Permanent residency, long term immigration & golden investments', count: countryVisas?.pr?.length || 2 }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Sticky Back Button Bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 py-2.5 border-b md:border-0 mb-4">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Countries
        </button>
      </div>

      {/* Language Bar */}
      <div className="bg-slate-100 p-3 rounded-2xl mb-6 border border-slate-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Globe className="w-4 h-4 text-[#0B3D91]" />
          <span>Language / 言語:</span>
          {isJpToIn && (
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] font-semibold ml-1">
              🇯🇵 日本人向け特別ガイド
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setCurrentLang('en')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'en' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇺🇸 English</button>
          <button onClick={() => setCurrentLang('ja')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'ja' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇯🇵 日本語</button>
          <button onClick={() => setCurrentLang('de')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'de' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇩🇪 Deutsch</button>
          <button onClick={() => setCurrentLang('fr')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'fr' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇫🇷 Français</button>
          <button onClick={() => setCurrentLang('es')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'es' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇪🇸 Español</button>
          <button onClick={() => setCurrentLang('hi')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'hi' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇮🇳 हिन्दी</button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="text-xs sm:text-sm text-slate-500 mb-6 font-medium flex items-center gap-1.5 flex-wrap">
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-blue-600">Home</span>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">{fromCountry.name} to {toCountry.name}</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-4xl">{fromCountry.flag}</span>
            <ArrowRight className="w-6 h-6 text-slate-400" />
            <span className="text-4xl">{toCountry.flag}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isJa ? `${fromCountry.name}から${toCountry.name}への渡航ビザ` : `Travel from ${fromCountry.name} to ${toCountry.name}`}
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            {isJa ? 'ステップ 1/2: 渡航目的を選択して公式ビザ一覧を確認' : 'Step 1 of 2: Select your primary purpose of travel below to see all official visa options.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${cat.id}`)}
              className="p-6 border-2 border-slate-200 rounded-2xl hover:border-[#0B3D91] hover:bg-blue-50/50 transition-all duration-200 text-left cursor-pointer bg-white shadow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-4xl">{cat.icon}</span>
                  <span className="bg-blue-100 text-[#0B3D91] text-xs font-bold px-2.5 py-1 rounded-full">
                    {cat.count} {isJa ? '種類' : 'Visa Types'}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#0B3D91] transition-colors">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{cat.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0B3D91]">
                <span>{isJa ? 'ビザ一覧を見る' : 'Explore Category'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Level 2: Visa Category List View (/:from-to-:to-:category)
// ----------------------------------------------------
function VisaCategoryListView({ match, countries, navigate }: any) {
  const fromCode = match[1].toUpperCase();
  const toCode = match[2].toUpperCase();
  const category = match[3].toLowerCase() as keyof CountryVisas;

  const initialLang = LANGUAGE_MAP[fromCode] || 'en';
  const [currentLang, setCurrentLang] = useState(initialLang);

  useEffect(() => {
    setCurrentLang(LANGUAGE_MAP[fromCode] || 'en');
  }, [fromCode]);

  const t = getTranslation(currentLang);
  const isJa = currentLang === 'ja';

  const fromCountry = countries.find((c: Country) => c.code === fromCode) || { name: fromCode, flag: '🌍', code: fromCode };
  const toCountry = countries.find((c: Country) => c.code === toCode) || { name: toCode, flag: '🏛️', code: toCode };

  const isJpToIn = fromCode === 'JP' && toCode === 'IN';
  const countryVisas = isJpToIn ? JP_TO_IN_VISA["IN"] : (FULL_VISA_DB[toCode] || FULL_VISA_DB["US"]);
  const categoryVisas = countryVisas[category] || [];

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'legacy'>('all');

  const sortedVisas = [...categoryVisas].sort((a: any, b: any) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    if (a.highlight && !b.highlight) return -1;
    if (!a.highlight && b.highlight) return 1;
    return 0;
  });

  const displayedVisas = sortedVisas.filter((v: any) => {
    if (statusFilter === 'active') return v.isActive !== false;
    if (statusFilter === 'legacy') return v.isLegacy === true;
    return true;
  });

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Sticky Back Button Bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 py-2.5 border-b md:border-0 mb-4">
        <button 
          onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}`)} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to {fromCountry.name} to {toCountry.name} Categories
        </button>
      </div>

      {/* Language Bar */}
      <div className="bg-slate-100 p-3 rounded-2xl mb-6 border border-slate-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Globe className="w-4 h-4 text-[#0B3D91]" />
          <span>Language / 言語:</span>
          {isJpToIn && (
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] font-semibold ml-1">
              🇯🇵 日本人向け特別ガイド
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setCurrentLang('en')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'en' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇺🇸 English</button>
          <button onClick={() => setCurrentLang('ja')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'ja' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇯🇵 日本語</button>
          <button onClick={() => setCurrentLang('de')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'de' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇩🇪 Deutsch</button>
          <button onClick={() => setCurrentLang('fr')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'fr' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇫🇷 Français</button>
          <button onClick={() => setCurrentLang('es')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'es' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇪🇸 Español</button>
          <button onClick={() => setCurrentLang('hi')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'hi' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇮🇳 हिन्दी</button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="text-xs sm:text-sm text-slate-500 mb-6 font-medium flex items-center gap-1.5 flex-wrap">
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-blue-600">Home</span>
        <span>&gt;</span>
        <span onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}`)} className="cursor-pointer hover:text-blue-600">{fromCountry.name} to {toCountry.name}</span>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold capitalize">{categoryTitle} Visas ({categoryVisas.length} types)</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{fromCountry.flag}</span>
          <ArrowRight className="w-5 h-5 text-slate-400" />
          <span className="text-3xl">{toCountry.flag}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {isJa 
            ? `${fromCountry.name}から${toCountry.name}への${t[(`${category}Visa` as keyof typeof t) || 'touristVisa']} (${categoryVisas.length}種類)`
            : `${fromCountry.name} to ${toCountry.name} ${categoryTitle} Visas (${categoryVisas.length} Types)`
          }
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          {isJa 
            ? `${toCountry.name}の全${categoryVisas.length}種類の${t[(`${category}Visa` as keyof typeof t) || 'touristVisa']}一覧です。詳細、必要書類、手続きを確認したいビザを選択してください。`
            : `Official list of all ${categoryVisas.length} ${categoryTitle.toLowerCase()} visa categories for ${toCountry.name}. Select a specific visa type below to view full requirements, document checklists, and application guidelines.`
          }
        </p>

        {/* Filter Toolbar for Active vs Legacy subclasses */}
        {toCode === 'AU' && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Filter by Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Types ({categoryVisas.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'active' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Active Only ({categoryVisas.filter((v: any) => v.isActive !== false).length})
            </button>
            <button
              onClick={() => setStatusFilter('legacy')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'legacy' ? 'bg-amber-700 text-white shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Legacy / Repealed ({categoryVisas.filter((v: any) => v.isLegacy === true).length})
            </button>
          </div>
        )}
      </div>

      {/* Grid of Visa Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {displayedVisas.map((v: any) => (
          <div
            key={v.id}
            onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${category}-${v.id}`)}
            className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer bg-white flex flex-col justify-between group shadow-sm hover:shadow-md ${
              v.highlight ? 'border-[#0B3D91] ring-1 ring-[#0B3D91]' : 'border-slate-200 hover:border-[#0B3D91]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{v.icon || '📄'}</span>
                  {v.officialCode && (
                    <span className="bg-blue-100 text-[#0B3D91] font-mono text-xs font-black px-2 py-0.5 rounded shadow-xs">
                      Subclass {v.officialCode}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {v.isLegacy ? (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      Legacy
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                  {v.popular && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                      ⭐ {isJa ? '人気' : 'Popular'}
                    </span>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#0B3D91] transition-colors line-clamp-1">
                {(isJa && v.name_ja) ? v.name_ja : v.name}
              </h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                {(isJa && v.purpose_ja) ? v.purpose_ja : v.purpose}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">{t.fee}</span>
                  <span className="font-bold text-slate-800">{v.fee}</span>
                </div>
                {v.validity && (
                  <div>
                    <span className="text-slate-400 block font-medium">{t.validity}</span>
                    <span className="font-bold text-slate-800">{v.validity}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0B3D91]">
              <span>{isJa ? '必要書類と詳細を見る' : 'View Requirements & Docs'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Suggest Missing Visa CTA */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">
            {isJa ? 'ご希望のビザタイプが見つかりませんか？' : 'Looking for a specific visa type not listed here?'}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            {isJa ? '編集チームが最新ビザ情報を毎日更新しています。追加リクエストはお気軽にお問い合わせください。' : 'Our editorial team updates official visa rules daily. Let us know and we will add it within 24 hours.'}
          </p>
        </div>
        <a 
          href={`mailto:contact@visaapply.org?subject=Missing Visa Request for ${toCountry.name} ${categoryTitle}`}
          className="px-5 py-2.5 bg-[#0B3D91] text-white font-bold text-xs rounded-xl hover:bg-[#09327a] transition-colors shrink-0 cursor-pointer shadow-sm"
        >
          {isJa ? 'リクエストを送信' : 'Suggest Missing Visa'}
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [countries, setCountries] = useState<Country[]>(FALLBACK_COUNTRIES);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [detectedCountry, setDetectedCountry] = useState<Country | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<Country | null>(null);
  const [articles, setArticles] = useState<Article[]>(DEFAULT_PUBLISHED_GUIDES);
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
    // Load pending drafts & published guides from localStorage, plus app data with exponential backoff retry
    const loadAppData = async () => {
      let parsedPub: Article[] = [];
      try {
        const localDrafts = localStorage.getItem('pendingDrafts');
        if (localDrafts) {
          const parsed = JSON.parse(localDrafts);
          if (Array.isArray(parsed) && parsed.length > 0) setDrafts(parsed);
        }
        const localPub = localStorage.getItem('publishedGuides');
        if (localPub) {
          const parsed = JSON.parse(localPub);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedPub = parsed;
          }
        }
      } catch (e) {
        console.warn('Error reading from localStorage in loadAppData:', e);
      }

      // Fetch server articles with 3-attempt exponential backoff and 15s timeout
      const remoteArticles = await fetchWithRetry<Article[] | { published?: Article[] }>('/api/articles', {}, {
        retries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
        timeoutMs: 15000,
        fallback: []
      });

      const serverList: Article[] = Array.isArray(remoteArticles) 
        ? remoteArticles 
        : (Array.isArray((remoteArticles as any)?.published) ? (remoteArticles as any).published : []);

      // Merge backend articles, localStorage articles, and DEFAULT_PUBLISHED_GUIDES deduplicated by slug
      const mergedBySlug = new Map<string, Article>();
      DEFAULT_PUBLISHED_GUIDES.forEach(a => mergedBySlug.set(a.slug.toLowerCase(), a));
      parsedPub.forEach(a => {
        if (a?.slug) mergedBySlug.set(a.slug.toLowerCase(), a);
      });
      serverList.forEach(a => {
        if (a?.slug) mergedBySlug.set(a.slug.toLowerCase(), a);
      });

      const finalArticles = Array.from(mergedBySlug.values());
      setArticles(finalArticles);
      try {
        localStorage.setItem('publishedGuides', JSON.stringify(finalArticles));
      } catch (e) {
        // quota ignore
      }

      const countriesData = await fetchWithRetry<Country[]>('/api/countries', {}, {
        retries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
        timeoutMs: 15000,
        fallback: FALLBACK_COUNTRIES
      });
      if (Array.isArray(countriesData) && countriesData.length > 0) {
        setCountries(countriesData);
      }

      const visaData = await fetchWithRetry<VisaType[]>('/api/visa-types', {}, {
        retries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
        timeoutMs: 15000,
        fallback: []
      });
      if (Array.isArray(visaData)) {
        setVisaTypes(visaData);
      }
    };

    loadAppData();
  }, []);

  const handleTriggerCron = async () => {
    setCronLoading(true);
    setCronResult(null);
    try {
      const data = await fetchWithRetry<any>('/api/cron', { method: 'POST' }, {
        retries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
        timeoutMs: 30000,
        fallback: { success: false, drafts: [], message: 'Cron request failed after 3 retries' }
      });
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
  const isAudit = currentPath === '/audit';
  const isVerification = currentPath === '/verification';

  // 1. Level 1: /in-to-us
  const isLevel1Match = currentPath.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})$/i);

  // 2. Level 2: /in-to-us-tourist, /in-to-us-work, etc.
  const isLevel2Match = currentPath.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})-(tourist|work|student|family|business|pr)$/i);

  // 3. Level 3: /in-to-us-tourist-b1b2 or /in-to-us-student
  const isLevel3Match = currentPath.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})-(tourist|work|student|family|business|pr)-([a-z0-9-]+)$/i) || 
                        (!isLevel2Match && currentPath.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})-([a-z0-9-]+)$/i));

  const cleanPathSlug = currentPath.replace(/^\//, '').toLowerCase().trim();

  // 4. Published Blog Articles: e.g. /india-to-canada-work-visa-atlxt or any custom article slug
  const matchedBlogArticle = articles.find((a: Article) => {
    const s = (a.slug || '').toLowerCase().trim();
    const r = ((a as any).route || '').toLowerCase().trim();
    return s === cleanPathSlug || r === cleanPathSlug || ('/' + s) === currentPath.toLowerCase();
  });

  const isBlogMatch = !isHome && !isAdmin && !isAudit && !isContact && !isPrivacy && !isTerms && !isSitemap && !isVerification && !isLevel1Match && !isLevel2Match && !isLevel3Match && (
    Boolean(matchedBlogArticle) || cleanPathSlug.includes('-to-') || cleanPathSlug.includes('guide') || cleanPathSlug.includes('visa')
  );

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
            <button onClick={() => navigate('/')} className={`transition-colors cursor-pointer hover:text-white`}>Countries</button>
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
        ) : isAudit ? (
          <AuditPage navigate={navigate} />
        ) : isVerification ? (
          <VerificationView navigate={navigate} />
        ) : isContact ? (
          <ContactView navigate={navigate} />
        ) : isPrivacy ? (
          <PrivacyView navigate={navigate} />
        ) : isTerms ? (
          <TermsView navigate={navigate} />
        ) : isSitemap ? (
          <SitemapPage navigate={navigate} />
        ) : isBlogMatch ? (
          <BlogArticleView 
            article={matchedBlogArticle} 
            pathSlug={cleanPathSlug}
            articles={articles}
            countries={countries} 
            navigate={navigate} 
          />
        ) : isLevel2Match ? (
          <VisaCategoryListView 
            match={isLevel2Match} 
            countries={countries} 
            navigate={navigate} 
          />
        ) : isLevel3Match ? (
          <ArticleView match={isLevel3Match} articles={articles} navigate={navigate} />
        ) : isLevel1Match ? (
          <VisaCategorySelectionView 
            match={isLevel1Match} 
            countries={countries} 
            navigate={navigate} 
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

      {/* Google AdSense Banner */}
      <AdSenseBanner />

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
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer">About Us & Home</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-white transition-colors cursor-pointer">Contact Us</button></li>
              <li><button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</button></li>
              <li><button onClick={() => navigate('/sitemap')} className="hover:text-blue-300 font-semibold text-blue-400 transition-colors cursor-pointer">Sitemap (653+ Pages)</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide">Official Contact & Info</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:contact@visaapply.org" className="text-blue-400 font-semibold hover:underline">contact@visaapply.org</a></li>
              <li className="text-xs text-slate-500">653+ Visa Guides across 30 Destination Countries</li>
              <li><button onClick={() => navigate('/admin')} className="hover:text-white text-xs text-slate-400 transition-colors cursor-pointer">Admin Portal Access</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} VisaApply.org. All rights reserved. 653+ Visa Guides 30 Countries. Contact: <a href="mailto:contact@visaapply.org" className="text-blue-400 hover:underline">contact@visaapply.org</a></p>
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
// HTML Sitemap View Component (/sitemap - 540+ Visas)
// ----------------------------------------------------
function SitemapView({ countries, navigate }: any) {
  const [search, setSearch] = useState('');
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  const filteredCountries = countries.filter((c: Country) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-[#0B3D91] px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Complete Global Database: 540+ Visas</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">All Global Visa Guides</h1>
          <p className="text-sm text-slate-600 mt-1">
            Explore complete visa requirements, fees, document checklists, and application guidelines across 30 destination countries and 6 visa categories.
          </p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2.5 bg-[#0B3D91] text-white font-semibold rounded-xl text-xs hover:bg-[#09327a] transition-colors shrink-0 shadow-sm cursor-pointer"
        >
          Return to Home
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mb-8 relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search country or code (e.g. US, Dubai, Germany)..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91] shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCountries.map((c: any) => {
          const isExpanded = expandedCountry === c.code || search.length > 0;
          const countryVisas = (FULL_VISA_DB['IN'] && FULL_VISA_DB['IN'][c.code.toUpperCase()]) 
                               ? FULL_VISA_DB['IN'][c.code.toUpperCase()] 
                               : (FULL_VISA_DB['US'] && FULL_VISA_DB['US']['US'] ? FULL_VISA_DB['US']['US'] : { tourist: [], work: [], student: [], family: [], business: [], pr: [] });
          
          let totalCountryCount = 0;
          if (countryVisas) {
            Object.values(countryVisas).forEach((arr: any) => {
              if (Array.isArray(arr)) totalCountryCount += arr.length;
            });
          }

          return (
            <div key={c.code} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{c.flag}</span>
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">{c.name}</h2>
                    <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                      {totalCountryCount} Visa Types
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setExpandedCountry(isExpanded && search.length === 0 ? null : c.code)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {isExpanded ? 'Hide' : 'View Visas'}
                </button>
              </div>

              {isExpanded && countryVisas && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs">
                  {(['tourist', 'work', 'student', 'family', 'business', 'pr'] as const).map(cat => {
                    const items = countryVisas[cat] || [];
                    if (items.length === 0) return null;

                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between font-bold text-slate-800 capitalize border-b pb-1">
                          <span>{cat} Visas ({items.length})</span>
                          <button 
                            onClick={() => navigate(`/in-to-${c.code.toLowerCase()}-${cat}`)}
                            className="text-[10px] text-[#0B3D91] hover:underline cursor-pointer"
                          >
                            View Category →
                          </button>
                        </div>
                        <div className="pl-2 space-y-1 py-1">
                          {items.map((item: any) => (
                            <button
                              key={item.id}
                              onClick={() => navigate(`/in-to-${c.code.toLowerCase()}-${cat}-${item.id}`)}
                              className="block w-full text-left py-1 text-slate-600 hover:text-[#0B3D91] hover:font-semibold transition-colors truncate cursor-pointer"
                            >
                              • {item.name} <span className="text-slate-400 font-normal">({item.fee})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
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
// Level 3: Article / Visa Detail View Component
// ----------------------------------------------------
function ArticleView({ match, articles = [], navigate }: any) {
  const fromCode = match[1] ? match[1].toUpperCase() : 'IN';
  const toCode = match[2] ? match[2].toUpperCase() : 'US';
  const categoryCode = (match[3] || 'tourist').toLowerCase();
  const subtypeCode = match[4] ? match[4].toLowerCase() : categoryCode;

  const initialLang = LANGUAGE_MAP[fromCode] || 'en';
  const [currentLang, setCurrentLang] = useState(initialLang);

  useEffect(() => {
    setCurrentLang(LANGUAGE_MAP[fromCode] || 'en');
  }, [fromCode]);

  const t = getTranslation(currentLang);
  const isJa = currentLang === 'ja';

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('');

  const handleJumpToSection = (sectionId: string) => {
    if (!sectionId) return;
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    if (!faqSearchQuery.trim()) return true;
    const q = (faq.q || faq.question || '').toLowerCase();
    const a = (faq.a || faq.answer || '').toLowerCase();
    const query = faqSearchQuery.toLowerCase().trim();
    return q.includes(query) || a.includes(query);
  });

  const isJpToIn = fromCode === 'JP' && toCode === 'IN';
  // Resiliently access FROM -> TO -> Visas or direct TO -> Visas
  const countryData = isJpToIn
    ? JP_TO_IN_VISA["IN"]
    : (FULL_VISA_DB[fromCode]?.[toCode] || FULL_VISA_DB[toCode] || FULL_VISA_DB["US"]);
  const categoryVisas = countryData?.[categoryCode as keyof CountryVisas] || countryData?.['tourist'] || [];
  
  // Find matching subtype visa in database
  const dbVisaItem = categoryVisas.find((v: any) => v.id.toLowerCase() === subtypeCode) ||
                     categoryVisas.find((v: any) => v.id.toLowerCase().includes(subtypeCode)) ||
                     categoryVisas[0];

  useEffect(() => {
    const sectionIds = [
      'section-overview',
      'section-subclass',
      'section-financial',
      'section-info-req',
      'section-docs',
      'section-steps',
      'section-tips',
      'section-faqs',
      'section-embassy'
    ];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0
    });

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toCode, dbVisaItem]);

  useEffect(() => {
    let isMounted = true;
    setFaqLoading(true);

    const queryUrl = `/api/faq?from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}&type=${encodeURIComponent(subtypeCode)}`;

    fetchWithRetry<{ success?: boolean; faqs?: any[] }>(
      queryUrl,
      {},
      {
        retries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
        timeoutMs: 15000, // Timeout increased beyond 6s to 15s
        fallback: { success: true, faqs: dbVisaItem?.faq || [] }
      }
    )
      .then(data => {
        if (!isMounted) return;
        if (data?.faqs && Array.isArray(data.faqs) && data.faqs.length > 0) {
          setFaqs(data.faqs);
        } else if (dbVisaItem?.faq) {
          setFaqs(dbVisaItem.faq);
        }
        setFaqLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        if (dbVisaItem?.faq) setFaqs(dbVisaItem.faq);
        setFaqLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fromCode, toCode, subtypeCode, dbVisaItem]);

  useEffect(() => {
    setLoading(false);
    generateMetadata(window.location.pathname, [], null);
  }, [fromCode, toCode, categoryCode, subtypeCode]);

  if (loading) {
    return <ArticleSkeleton />;
  }

  const fromCountry = FALLBACK_COUNTRIES.find(c => c.code === fromCode) || { name: fromCode, flag: '🌍' };
  const toCountry = FALLBACK_COUNTRIES.find(c => c.code === toCode) || { name: toCode, flag: '🏛️' };

  const visaName = (isJa && dbVisaItem?.name_ja) ? dbVisaItem.name_ja : (dbVisaItem?.name || subtypeCode.toUpperCase());

  const guideTitle = isJa 
    ? `${fromCountry.name}から${toCountry.name}への${visaName} (2026年最新ガイド)`
    : `${fromCountry.name} to ${toCountry.name} ${visaName} (2026 Guide)`;

  const docsList = (isJa && dbVisaItem?.docs_ja) ? dbVisaItem.docs_ja : (dbVisaItem?.docs || [
    'Valid Passport (minimum 6 months validity)',
    'Completed Official Visa Application Form',
    'Passport-size photographs as per spec',
    'Bank Statements for past 6 months showing regular income',
    'Income Tax Return (ITR) / Tax assessment for past 2-3 years',
    'Proof of Accommodation / Hotel Booking',
    'Confirmed Travel Itinerary / Flight Ticket'
  ]);

  const infoReqList = (isJa && dbVisaItem?.infoReq_ja) ? dbVisaItem.infoReq_ja : (dbVisaItem?.infoReq || [
    'Full Name, DOB, Passport No, Issue & Expiry Date, Place of Issue',
    'Father, Mother & Spouse Full Names & Dates of Birth',
    'Host Address in Destination Country, Contact Name & Phone',
    'Employer / Company Name, Business Address, Job Title & Monthly Income',
    'Prior travel history to destination country, visa refusal dates & reasons',
    'Security, Health & Criminal Background Declarations'
  ]);

  const stepsList = (isJa && dbVisaItem?.steps_ja) ? dbVisaItem.steps_ja : (dbVisaItem?.steps || [
    'Check eligibility criteria and gather required documents',
    'Fill official online visa application form',
    'Pay required visa fee',
    'Schedule appointment at VFS Global / Embassy',
    'Attend biometrics & photo session',
    'Attend consulate visa interview (if required)',
    'Track visa application status online',
    'Collect passport with visa stamp'
  ]);

  const toggleDocCheck = (idx: number) => {
    setCheckedDocs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Refactored Sticky Mobile & Desktop Navigation Bar with Breadcrumbs & Jump-to-Section Dropdown */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 py-2.5 px-3 sm:px-4 -mx-4 sm:mx-0 rounded-b-2xl sm:rounded-2xl border-b border-slate-200/90 shadow-sm mb-6 no-print">
        <div className="flex flex-col gap-2">
          {/* Top Row: Back Buttons & Compact Breadcrumb Indicator */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${categoryCode}`)} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-xs cursor-pointer transition-colors"
                title={`Back to ${categoryCode} Visas`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline">Back to</span> <span className="capitalize">{categoryCode}</span>
              </button>
              <button 
                onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}`)} 
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 text-xs font-medium text-slate-600 cursor-pointer"
                title="Back to all categories"
              >
                Categories
              </button>
            </div>

            {/* Breadcrumb Indicator */}
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-slate-600 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200 truncate min-w-0">
              <span className="shrink-0">{fromCountry.flag} {fromCode}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="shrink-0">{toCountry.flag} {toCode}</span>
              <span className="text-slate-300 shrink-0">/</span>
              <span className="capitalize text-[#0B3D91] shrink-0 font-bold">{categoryCode}</span>
              <span className="text-slate-300 shrink-0">/</span>
              <span className="truncate font-bold text-slate-900" title={visaName}>
                {dbVisaItem?.officialCode ? `Subclass ${dbVisaItem.officialCode}` : visaName}
              </span>
            </div>
          </div>

          {/* Bottom Row: Jump-to-Section Dropdown & Quick Actions */}
          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <label htmlFor="jump-section-select" className="text-[11px] font-bold text-slate-700 shrink-0 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-[#0B3D91]" />
                <span className="hidden xs:inline">Jump to:</span>
              </label>
              <div className="relative flex-1 min-w-0">
                <select
                  id="jump-section-select"
                  value={activeSection}
                  onChange={(e) => handleJumpToSection(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg py-1.5 pl-2.5 pr-8 text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer truncate"
                >
                  <option value="">⚡ Jump to Section...</option>
                  <option value="section-overview">📌 1. Overview & Fees</option>
                  {toCode === 'AU' && <option value="section-subclass">🇦🇺 2. Official Subclass Registry</option>}
                  <option value="section-financial">💼 3. Funds, ITR & Bank Rules</option>
                  <option value="section-info-req">📋 4. Mandatory Application Data</option>
                  <option value="section-docs">📄 5. Document Checklist ({docsList.length} docs)</option>
                  <option value="section-steps">📝 6. Step-by-Step Process</option>
                  {dbVisaItem?.tips && <option value="section-tips">💡 7. Advisory & Interview Tips</option>}
                  <option value="section-faqs">❓ 8. FAQs & Rules</option>
                  <option value="section-embassy">🏛️ 9. Embassy & VFS Centers</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quick Scroll To Top Button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 text-xs font-medium cursor-pointer shrink-0 transition-colors"
              title="Scroll to Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Top</span>
            </button>
          </div>
        </div>
      </div>

      {/* Language Switcher Toolbar */}
      <div className="bg-slate-100 p-3 rounded-2xl mb-6 border border-slate-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Globe className="w-4 h-4 text-[#0B3D91]" />
          <span>Language / 言語:</span>
          {isJpToIn && (
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] font-semibold ml-1">
              🇯🇵 日本人向け特別ガイド
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setCurrentLang('en')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'en' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇺🇸 English</button>
          <button onClick={() => setCurrentLang('ja')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'ja' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇯🇵 日本語</button>
          <button onClick={() => setCurrentLang('de')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'de' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇩🇪 Deutsch</button>
          <button onClick={() => setCurrentLang('fr')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'fr' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇫🇷 Français</button>
          <button onClick={() => setCurrentLang('es')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'es' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇪🇸 Español</button>
          <button onClick={() => setCurrentLang('hi')} className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${currentLang === 'hi' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>🇮🇳 हिन्दी</button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="text-xs sm:text-sm text-slate-500 mb-6 font-medium flex items-center gap-1.5 flex-wrap no-print">
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-blue-600">Home</span>
        <span>&gt;</span>
        <span onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}`)} className="cursor-pointer hover:text-blue-600">{fromCountry.name} to {toCountry.name}</span>
        <span>&gt;</span>
        <span onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${categoryCode}`)} className="cursor-pointer hover:text-blue-600 capitalize">{categoryCode}</span>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">{dbVisaItem?.name || subtypeCode.toUpperCase()}</span>
      </nav>

      {/* Main Guide Container */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-10 space-y-8">
        {/* Header Title & Badges */}
        <div id="section-overview" className="text-center space-y-3 pb-6 border-b border-slate-200 scroll-mt-28">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#0B3D91] bg-blue-50 px-3 py-1 rounded-full w-max mx-auto">
            <span>{fromCountry.flag} {fromCode}</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>{toCountry.flag} {toCode}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {guideTitle}
          </h1>

          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            {(isJa && dbVisaItem?.purpose_ja) ? dbVisaItem.purpose_ja : (dbVisaItem?.purpose || `Official 2026 application guide, fee breakdown, document checklist, and step-by-step instructions for ${fromCountry.name} passport holders.`)}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-2xl mx-auto text-xs">
            <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-center">
              <span className="text-slate-500 block font-medium">{t.fee}</span>
              <span className="font-bold text-[#0B3D91] text-sm mt-0.5 block">{dbVisaItem?.fee || '$185'}</span>
            </div>
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-center">
              <span className="text-slate-500 block font-medium">{t.validity}</span>
              <span className="font-bold text-emerald-800 text-sm mt-0.5 block">{dbVisaItem?.validity || 'Up to 10 yrs'}</span>
            </div>
            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100 text-center">
              <span className="text-slate-500 block font-medium">{t.maxStay}</span>
              <span className="font-bold text-amber-800 text-sm mt-0.5 block">{dbVisaItem?.stay || '90 days/visit'}</span>
            </div>
            <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-100 text-center">
              <span className="text-slate-500 block font-medium">{t.processing}</span>
              <span className="font-bold text-purple-800 text-sm mt-0.5 block">3-5 Days</span>
            </div>
          </div>
        </div>

        {/* Eligibility & Overview */}
        {(dbVisaItem?.eligibility || dbVisaItem?.eligibility_ja) && (
          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 text-xs sm:text-sm text-slate-800 space-y-1">
            <h3 className="font-bold text-[#0B3D91] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.eligibility}</span>
            </h3>
            <p className="leading-relaxed">
              {(isJa && dbVisaItem?.eligibility_ja) ? dbVisaItem.eligibility_ja : dbVisaItem?.eligibility}
            </p>
          </div>
        )}

        {/* AUSTRALIA OFFICIAL SUBCLASS & HOME AFFAIRS REGISTER STATUS */}
        {toCode === 'AU' && (
          <div id="section-subclass" className={`p-4 rounded-xl border text-xs space-y-2 scroll-mt-28 ${
            dbVisaItem?.isLegacy ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-current/20">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>🇦🇺</span>
                <span>Australian Immigration Registry: {dbVisaItem?.officialName || dbVisaItem?.name}</span>
                {dbVisaItem?.officialCode && (
                  <span className="bg-[#0B3D91] text-white font-mono text-xs px-2 py-0.5 rounded font-black">
                    Subclass {dbVisaItem.officialCode}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {dbVisaItem?.isLegacy ? (
                  <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                    ⚠️ Legacy / Repealed Subclass
                  </span>
                ) : (
                  <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[11px]">
                    🟢 Official Active Subclass
                  </span>
                )}
                <a
                  href={dbVisaItem?.officialSource || "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline flex items-center gap-1 text-[11px] hover:opacity-80"
                >
                  <span>Home Affairs Register</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {dbVisaItem?.isLegacy ? (
              <p className="leading-relaxed text-[11px]">
                <strong>Important Notice:</strong> Subclass {dbVisaItem?.officialCode || subtypeCode} is repealed or closed to new primary applicants under current Australian migration legislation. Information provided here is maintained for historical record, existing visa condition compliance, and legal audit reference. Check current replacement streams on the official Department of Home Affairs register.
              </p>
            ) : (
              <p className="leading-relaxed text-[11px]">
                Active official Australian visa subclass verified against the Department of Home Affairs legislation (Migration Regulations 1994).
              </p>
            )}
          </div>
        )}

        {/* 3 MICRO BOXES: FUNDS BOX, ITR BOX, BANK BOX (HINDI + ENGLISH MIX) */}
        <div id="section-financial" className="space-y-4 pt-2 scroll-mt-28">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>💼 Financial, ITR & Bank Statements Micro Verification</span>
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Zero-Rejection Checklist
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Box 1: Funds Box */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-white border-2 border-emerald-400/80 rounded-2xl p-4 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm pb-2 border-b border-emerald-200">
                  <span className="text-base">💰</span>
                  <span>Funds Requirement Box</span>
                </div>
                <div className="space-y-2.5 mt-2.5 text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900 block">Minimum Funds (Kitna Dikhana Hai):</span>
                    <p className="mt-0.5 leading-relaxed">{dbVisaItem?.fundsBox?.minimum || "₹3-5 Lakhs liquid balance in savings account (AUD $5,000+ equivalent for tourist; ₹30-35 Lakhs for student)."}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Bank Duration & Access:</span>
                    <p className="mt-0.5 leading-relaxed">{dbVisaItem?.fundsBox?.bankMonths || "Last 6 months bank statement, genuine access, minimum 3 months seasoned funds."}</p>
                  </div>
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-900 text-[11px] leading-relaxed">
                    <span className="font-bold block text-red-950">Sudden Deposit Warning:</span>
                    {dbVisaItem?.fundsBox?.suddenDeposit || "❌ 1 din pehle 10 lakh daal ke mat dikhao - 3 mahine purana hona chahiye. Large deposit >50k ka source proof chahiye (Salary slip/Bonus/Property sale/Gift deed). Credit card se borrowed money reject."}
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-lg text-[11px] text-emerald-950 font-medium">
                {dbVisaItem?.fundsBox?.example || "✅ Sahi: Regular monthly salary credits. ❌ Galat: One-day loan deposit without source."}
              </div>
            </div>

            {/* Box 2: ITR Box */}
            <div className="bg-gradient-to-br from-blue-50/80 to-white border-2 border-blue-400/80 rounded-2xl p-4 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-950 font-bold text-sm pb-2 border-b border-blue-200">
                  <span className="text-base">📄</span>
                  <span>ITR & Tax Compliance Box</span>
                </div>
                <div className="space-y-2.5 mt-2.5 text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900 block">Required ITR (Kitne Saal):</span>
                    <p className="mt-0.5 leading-relaxed">{dbVisaItem?.itrBox?.years || "2-3 years ITR-V + Computation of Income + Form 16 + Balance sheet if business."}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">ITR & Bank Reconciliation Match:</span>
                    <p className="mt-0.5 leading-relaxed">{dbVisaItem?.itrBox?.match || "ITR aur bank credit match hona chahiye. ITR 10 lakh, bank credit 50 lakh = Mismatch = Direct Reject under PIC 4020."}</p>
                  </div>
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                    <span className="font-bold block text-amber-950">No ITR Case:</span>
                    {dbVisaItem?.itrBox?.noItr || "No ITR? Form 26AS + 6 months salary slips + Employer NOC but 60% higher refusal risk."}
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-blue-100/70 border border-blue-300 rounded-lg text-[11px] text-blue-950 font-medium">
                Rule: Tax assessment name, PAN, and employer must reconcile with application details.
              </div>
            </div>

            {/* Box 3: Bank Box */}
            <div className="bg-gradient-to-br from-indigo-50/80 to-white border-2 border-indigo-400/80 rounded-2xl p-4 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm pb-2 border-b border-indigo-200">
                  <span className="text-base">🏦</span>
                  <span>Bank Statement & Source Box</span>
                </div>
                <div className="space-y-2.5 mt-2.5 text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900 block">Months & Seal:</span>
                    <p className="mt-0.5 leading-relaxed">{dbVisaItem?.bankBox?.months || "Last 6 months statement with original bank seal and signature on every page."}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Regular Credits:</span>
                    <p className="mt-0.5 leading-relaxed">{dbVisaItem?.bankBox?.regularCredit || "Salary / business revenue credited predictably between 1st-10th of each month."}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Fixed Deposits (FDs):</span>
                    <p className="mt-0.5 leading-relaxed">{dbVisaItem?.bankBox?.fd || "FDs must be 3+ months seasoned and lien-free (no loan against FD)."}</p>
                  </div>
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-800 leading-relaxed">
                    <span className="font-bold block text-slate-900">Source of Large Funds:</span>
                    {dbVisaItem?.bankBox?.source || "Agri: J-Form + Land deeds. Property: Registered Sale deed + Bank credit. Gift: Registered Gift Deed + Donor ITR."}
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-indigo-100/70 border border-indigo-300 rounded-lg text-[11px] text-indigo-950 font-medium">
                Credit card cash withdrawal or borrowed funds strictly prohibited.
              </div>
            </div>
          </div>
        </div>

        {/* MANDATORY SECTION: Information Required in Application Form */}
        <div id="section-info-req" className="space-y-4 pt-2 scroll-mt-28">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0B3D91]" />
              <span>{t.infoRequired}</span>
            </h2>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Mandatory Data</span>
          </div>

          <p className="text-xs text-slate-600">
            {isJa ? '公式オンラインビザ申請フォームへの入力前に、以下の基本情報を手元にご用意ください:' : 'Keep the following key biographic, financial, and travel details ready before filling the official online visa form:'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {infoReqList.map((item: string, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0B3D91] font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span className="mt-0.5 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Required Documents Checklist with Interactive Checkboxes */}
        <div id="section-docs" className="space-y-4 pt-4 border-t border-slate-200 scroll-mt-28">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>📄 {t.requiredDocs}</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {Object.keys(checkedDocs).filter(k => checkedDocs[Number(k)]).length} {isJa ? '/' : 'of'} {docsList.length} {t.checkedCount}
            </span>
          </div>

          <div className="space-y-2">
            {docsList.map((doc: string, idx: number) => {
              const isChecked = Boolean(checkedDocs[idx]);
              return (
                <div 
                  key={idx} 
                  onClick={() => toggleDocCheck(idx)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer text-xs sm:text-sm font-medium ${
                    isChecked ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                    isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isChecked ? <Check className="w-3.5 h-3.5" /> : null}
                  </div>
                  <span>{doc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Process */}
        <div id="section-steps" className="space-y-4 pt-4 border-t border-slate-200 scroll-mt-28">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📝 {t.steps}</span>
          </h2>

          <div className="space-y-3">
            {stepsList.map((step: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800">
                <span className="w-6 h-6 rounded-full bg-[#0B3D91] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  {idx + 1}
                </span>
                <span className="mt-0.5 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interview Tips / Advisory */}
        {dbVisaItem?.tips && (
          <div id="section-tips" className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-xs sm:text-sm text-amber-900 space-y-1 scroll-mt-28">
            <h3 className="font-bold flex items-center gap-2 text-amber-950">
              💡 {t.tips}
            </h3>
            <p className="leading-relaxed">
              {typeof dbVisaItem.tips === 'string' ? dbVisaItem.tips : (dbVisaItem.tips as string[]).join(' ')}
            </p>
          </div>
        )}

        {/* Dynamic Gemini AI / Database FAQs */}
        <div id="section-faqs" className="space-y-4 pt-4 border-t border-slate-200 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>❓ {t.faqs} ({fromCode} → {toCode})</span>
              {faqs.length > 0 && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'}
                </span>
              )}
            </h2>

            {/* FAQ Search Input */}
            {faqs && faqs.length > 0 && (
              <div className="relative min-w-[220px] sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder={isJa ? "FAQを検索..." : "Search FAQs..."}
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:bg-white text-slate-800"
                />
                {faqSearchQuery && (
                  <button
                    onClick={() => setFaqSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {faqLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-10 bg-slate-100 rounded-xl"></div>
              <div className="h-10 bg-slate-100 rounded-xl"></div>
            </div>
          ) : filteredFaqs && filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => {
                const questionText = faq.q || faq.question;
                const answerText = faq.a || faq.answer;
                const isOpen = openFaqIndex === index;

                return (
                  <div key={index} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 hover:border-slate-300 transition-colors">
                    <button 
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full text-left p-4 font-semibold text-slate-900 flex justify-between items-center hover:bg-slate-100 transition-colors cursor-pointer text-xs sm:text-sm"
                    >
                      <span className="pr-2">{questionText}</span>
                      <span className="text-slate-500 font-bold shrink-0 text-base">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="p-4 pt-2 text-xs sm:text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                        {answerText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : faqs && faqs.length > 0 && faqSearchQuery ? (
            <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-600 font-medium">
                No questions found matching "<span className="font-bold text-slate-900">{faqSearchQuery}</span>"
              </p>
              <button
                onClick={() => setFaqSearchQuery('')}
                className="text-xs font-semibold text-[#0B3D91] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Clear FAQ Search
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">No custom FAQs generated for this route yet. Refer to official embassy guidelines.</div>
          )}
        </div>

        {/* Official Embassy, Consulate & VFS Contact Details */}
        {(() => {
          const embassyData = getEmbassyInfo(toCode, fromCode);
          return (
            <div id="section-embassy" className="space-y-4 pt-4 border-t border-slate-200 scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0B3D91]" />
                  <span>{t.embassy} ({embassyData.country})</span>
                </h2>
                {embassyData.vfs && (
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    {embassyData.vfs}
                  </span>
                )}
              </div>

              {dbVisaItem?.embassy?.tokyo && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-[#0B3D91] block">🏛️ 日本国内の在日インド大使館・領事館情報 (Tokyo & Osaka):</span>
                  <p className="text-slate-800 font-medium">{dbVisaItem.embassy.tokyo}</p>
                  {dbVisaItem.embassy.osaka && <p className="text-slate-800 font-medium">{dbVisaItem.embassy.osaka}</p>}
                </div>
              )}

              {embassyData.officialWebsite && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#0B3D91]" />
                    {t.officialGovLink}:
                  </span>
                  <a 
                    href={embassyData.officialWebsite.startsWith('http') ? embassyData.officialWebsite : `https://${embassyData.officialWebsite}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold text-[#0B3D91] hover:underline flex items-center gap-1 break-all"
                  >
                    <span>{embassyData.officialWebsite}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {embassyData.inIndia.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-shadow shadow-xs space-y-2 text-xs text-slate-700">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#0B3D91] shrink-0" />
                        <span>{item.city}</span>
                      </h3>
                      {item.map && (
                        <a 
                          href={item.map} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[#0B3D91] hover:underline flex items-center gap-1 font-semibold text-[11px] shrink-0"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Map</span>
                        </a>
                      )}
                    </div>

                    <div className="space-y-1.5 text-slate-600">
                      <p className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item.address}</span>
                      </p>

                      {item.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a href={`tel:${item.phone}`} className="text-slate-800 font-semibold hover:text-[#0B3D91] transition-colors">
                            {item.phone}
                          </a>
                        </p>
                      )}

                      {item.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a href={`mailto:${item.email}`} className="text-[#0B3D91] font-semibold hover:underline break-all">
                            {item.email}
                          </a>
                        </p>
                      )}

                      {item.timings && (
                        <p className="flex items-center gap-2 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.timings}</span>
                        </p>
                      )}

                      {item.website && (
                        <p className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a 
                            href={item.website.startsWith('http') ? item.website : `https://${item.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[#0B3D91] font-semibold hover:underline flex items-center gap-1"
                          >
                            <span>{item.website}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Action Toolbar: Print / Email Support */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-100 p-4 rounded-2xl no-print">
          <button 
            onClick={() => window.print()}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            🖨️ {t.downloadChecklist}
          </button>

          <a 
            href={`mailto:contact@visaapply.org?subject=Query regarding ${guideTitle}`}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0B3D91] text-white font-bold rounded-xl text-xs hover:bg-[#09327a] transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
          >
            <Mail className="w-4 h-4" />
            <span>{t.contact}</span>
          </a>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-xs text-slate-700">
          {t.disclaimer}
        </div>

        {/* Bottom Back Navigation Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${categoryCode}`)} 
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0B3D91] text-white rounded-xl hover:bg-[#09327a] text-xs sm:text-sm font-bold cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to {categoryCode.charAt(0).toUpperCase() + categoryCode.slice(1)} Visas
            </button>
            <button 
              onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}`)} 
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-200 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Back to {fromCountry.name} to {toCountry.name} Categories
            </button>
          </div>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="text-xs text-[#0B3D91] font-bold hover:underline cursor-pointer"
          >
            ↑ Back to Top
          </button>
        </div>
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

      {/* Verification Tools Section */}
      <div className="bg-gradient-to-r from-slate-900 to-[#0B3D91] text-white p-6 sm:p-8 rounded-2xl mb-10 shadow-lg">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <span>🛠️ Verification & SEO Infrastructure Tools</span>
        </h2>
        <p className="text-xs text-blue-200 mb-6">
          Access real-time audit reporting and public sitemap indices for 540+ visa records.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => navigate('/audit')}
            className="p-5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-extrabold text-base text-emerald-300">Live Audit (540+ Visas) – Admin Only</h3>
              <p className="text-xs text-slate-200 mt-1">Real-time database count, document completeness checks, country-wise matrix vs Excel targets.</p>
            </div>
            <span className="text-xs font-bold text-emerald-300 mt-4 inline-flex items-center gap-1">Open Live Audit Report →</span>
          </div>

          <div 
            onClick={() => navigate('/sitemap')}
            className="p-5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl mb-2">🗺️</div>
              <h3 className="font-extrabold text-base text-blue-200">Sitemap (540+ Pages) – Public + Admin</h3>
              <p className="text-xs text-slate-200 mt-1">Indexed links for all 540+ visa guides across 30 destination countries for search crawler optimization.</p>
            </div>
            <span className="text-xs font-bold text-blue-200 mt-4 inline-flex items-center gap-1">Open Public Sitemap →</span>
          </div>
        </div>
      </div>

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
