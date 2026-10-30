import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { 
  Globe, Plane, Briefcase, GraduationCap, Users, Building2, Award, 
  CheckCircle2, FileText, Shield, Search, ArrowRight, ExternalLink, 
  Clock, DollarSign, ChevronRight, Check, Mail, MapPin, Phone, 
  ChevronDown, ArrowUp, Navigation, X
} from 'lucide-react';
import { FULL_VISA_DB, CountryVisas } from '../data/fullVisaDatabase';
import { getEmbassyInfo } from '../data/embassyAddresses';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import {
  DEFAULT_PUBLISHED_GUIDES,
  findDefaultGuideMatch,
  hydrateArticleWithCacheAndFallback,
  isRichContent,
  normalizeBlogSlug,
  buildFallbackMarkdownForArticle,
  getArticleRichnessScore
} from '../data/defaultArticles';

export interface Article {
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

interface Country {
  code: string;
  name: string;
  flag: string;
}

const FALLBACK_COUNTRIES: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "AE", name: "UAE Dubai", flag: "🇦🇪" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" }
];

export function parseBlogSlug(slug: string) {
  const clean = (slug || '').toLowerCase().replace(/^\//, '').trim();
  const toSplit = clean.split('-to-');
  
  let fromStr = 'in';
  let restStr = '';
  
  if (toSplit.length >= 2) {
    fromStr = toSplit[0];
    restStr = toSplit.slice(1).join('-to-');
  } else {
    restStr = clean;
  }
  
  const countryNameMap: Record<string, string> = {
    'india': 'IN', 'in': 'IN',
    'canada': 'CA', 'ca': 'CA',
    'usa': 'US', 'us': 'US', 'united-states': 'US',
    'uk': 'GB', 'gb': 'GB', 'united-kingdom': 'GB',
    'uae': 'AE', 'dubai': 'AE', 'ae': 'AE',
    'schengen': 'DE', 'germany': 'DE', 'de': 'DE',
    'france': 'FR', 'fr': 'FR',
    'australia': 'AU', 'au': 'AU',
    'singapore': 'SG', 'sg': 'SG',
    'japan': 'JP', 'jp': 'JP',
    'italy': 'IT', 'it': 'IT',
    'spain': 'ES', 'es': 'ES',
    'netherlands': 'NL', 'nl': 'NL',
    'new-zealand': 'NZ', 'nz': 'NZ',
    'sweden': 'SE', 'se': 'SE',
    'switzerland': 'CH', 'ch': 'CH',
    'ireland': 'IE', 'ie': 'IE',
    'norway': 'NO', 'no': 'NO',
    'portugal': 'PT', 'pt': 'PT',
    'denmark': 'DK', 'dk': 'DK',
    'finland': 'FI', 'fi': 'FI',
    'belgium': 'BE', 'be': 'BE',
    'austria': 'AT', 'at': 'AT',
    'poland': 'PL', 'pl': 'PL',
    'malaysia': 'MY', 'my': 'MY',
    'thailand': 'TH', 'th': 'TH',
    'turkey': 'TR', 'tr': 'TR',
    'south-africa': 'ZA', 'za': 'ZA',
    'saudi-arabia': 'SA', 'saudi': 'SA', 'sa': 'SA'
  };

  const fromCode = countryNameMap[fromStr] || (fromStr.length === 2 ? fromStr.toUpperCase() : 'IN');
  let toCode = 'US';
  let category = 'tourist';

  for (const [name, code] of Object.entries(countryNameMap)) {
    if (restStr.startsWith(name + '-') || restStr === name || restStr.startsWith(name)) {
      toCode = code;
      break;
    }
  }

  if (restStr.includes('work')) category = 'work';
  else if (restStr.includes('student') || restStr.includes('study')) category = 'student';
  else if (restStr.includes('family') || restStr.includes('spouse')) category = 'family';
  else if (restStr.includes('business')) category = 'business';
  else if (restStr.includes('pr') || restStr.includes('permanent')) category = 'pr';
  else if (restStr.includes('visitor') || restStr.includes('tourist')) category = 'tourist';

  return { fromCode, toCode, category };
}

interface BlogArticleViewProps {
  article?: Article | null;
  pathSlug: string;
  articles?: Article[];
  countries?: Country[];
  navigate: (path: string) => void;
}

function resolveArticleCacheFirst(
  rawSlug: string,
  passedArticle?: Article | null,
  articlesList: Article[] = []
): Article | null {
  const cleanSlug = normalizeBlogSlug(rawSlug || passedArticle?.slug || (passedArticle as any)?.route);
  const parsed = parseBlogSlug(cleanSlug);

  // 1. Check in-memory articles prop
  const fromPropList = articlesList.find(a => {
    const s = normalizeBlogSlug(a?.slug || (a as any)?.route);
    return s && s === cleanSlug;
  });

  // 2. Check localStorage cache ('publishedGuides')
  let fromLocalStorage: Article | undefined;
  try {
    const cachedRaw = localStorage.getItem('publishedGuides');
    if (cachedRaw) {
      const parsedCache = JSON.parse(cachedRaw);
      if (Array.isArray(parsedCache)) {
        fromLocalStorage = parsedCache.find((a: any) => {
          const s = normalizeBlogSlug(a?.slug || a?.route || a?.id);
          return s && s === cleanSlug;
        });
      }
    }
  } catch {
    // ignore storage errors
  }

  // 3. Check DEFAULT_PUBLISHED_GUIDES fallback
  const fromDefaults = findDefaultGuideMatch(
    cleanSlug || passedArticle?.title || fromPropList?.title || fromLocalStorage?.title,
    passedArticle?.from || fromPropList?.from || fromLocalStorage?.from || parsed.fromCode,
    passedArticle?.to || fromPropList?.to || fromLocalStorage?.to || parsed.toCode,
    passedArticle?.type || fromPropList?.type || fromLocalStorage?.type || parsed.category
  );

  const combinedExisting = {
    ...fromDefaults,
    ...fromLocalStorage,
    ...fromPropList
  };

  return hydrateArticleWithCacheAndFallback(
    passedArticle || fromPropList || fromLocalStorage || fromDefaults || {
      slug: cleanSlug,
      from: parsed.fromCode,
      to: parsed.toCode,
      type: parsed.category
    },
    combinedExisting
  );
}

export function BlogArticleView({ article, pathSlug, articles = [], countries = FALLBACK_COUNTRIES, navigate }: BlogArticleViewProps) {
  const slug = normalizeBlogSlug(pathSlug || article?.slug || '');
  const parsed = parseBlogSlug(slug);

  const [hydratedArticle, setHydratedArticle] = useState<Article | null>(() =>
    resolveArticleCacheFirst(slug, article, articles)
  );

  const activeArticle = hydratedArticle || article || findDefaultGuideMatch(slug, parsed.fromCode, parsed.toCode, parsed.category);

  const fromCode = (activeArticle?.from || parsed.fromCode || 'IN').toUpperCase();
  const toCode = (activeArticle?.to || parsed.toCode || 'CA').toUpperCase();
  const categoryCode = (activeArticle?.type || parsed.category || 'work').toLowerCase();
  
  const fromCountry = countries.find(c => c.code === fromCode) || FALLBACK_COUNTRIES.find(c => c.code === fromCode) || { name: fromCode, flag: '🌍', code: fromCode };
  const toCountry = countries.find(c => c.code === toCode) || FALLBACK_COUNTRIES.find(c => c.code === toCode) || { name: toCode, flag: '🏛️', code: toCode };

  // Access database for rich verification details
  const countryData = FULL_VISA_DB[fromCode]?.[toCode] || FULL_VISA_DB[toCode] || FULL_VISA_DB['US'];
  const categoryVisas = countryData?.[categoryCode as keyof CountryVisas] || countryData?.['tourist'] || [];
  const dbVisaItem = categoryVisas[0];

  const title = activeArticle?.title || `${fromCountry.name} to ${toCountry.name} ${categoryCode.toUpperCase()} Visa (2026 Complete Guide)`;
  const dateStr = activeArticle?.date || new Date().toISOString().split('T')[0];
  const feesStr = (activeArticle?.fees && activeArticle.fees !== 'Standard Govt Fees')
    ? activeArticle.fees
    : (dbVisaItem?.fee || (categoryCode === 'work' ? '$155-250 Govt Fee' : categoryCode === 'student' ? '$185-350 Govt Fee' : '$90-185 Govt Fee'));
  const validityStr = dbVisaItem?.validity || (categoryCode === 'work' ? '1 to 2 Years' : categoryCode === 'student' ? 'Course Duration + 60 Days' : 'Up to 10 Years');
  const stayStr = dbVisaItem?.stay || (categoryCode === 'work' ? 'Authorized Employment' : categoryCode === 'student' ? 'Full-Time Academic Term' : '90-180 Days/Visit');

  const [activeSection, setActiveSection] = useState<string>('');
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Cache-first hydration effect with background server check and DEFAULT_PUBLISHED_GUIDES fallback
  useEffect(() => {
    const localResolved = resolveArticleCacheFirst(slug, article, articles);
    setHydratedArticle(localResolved);

    if (!slug) return;

    const hasIncomingRichBody = isRichContent(
      article?.content || article?.rawContent || article?.contentHtml
    );
    if (hasIncomingRichBody && localResolved) {
      return;
    }

    const articleController = new AbortController();
    fetchWithRetry<Article | null>(
      `/api/articles/${encodeURIComponent(slug)}`,
      { signal: articleController.signal },
      {
        retries: 4,
        initialDelay: 1000,
        maxDelay: 15000,
        backoffMultiplier: 2,
        backoffIncrement500: 1500,
        backoffIncrement503: 3000,
        timeoutMs: 30000,
        fallback: null
      }
    ).then(remoteData => {
      if (remoteData && !(remoteData as any).error) {
        if (!localResolved || getArticleRichnessScore(remoteData) > getArticleRichnessScore(localResolved)) {
          const merged = hydrateArticleWithCacheAndFallback(remoteData, localResolved);
          if (merged) {
            setHydratedArticle(merged);
            try {
              const cachedRaw = localStorage.getItem('publishedGuides');
              const cachedList: Article[] = cachedRaw ? JSON.parse(cachedRaw) : [...DEFAULT_PUBLISHED_GUIDES];
              if (Array.isArray(cachedList)) {
                const idx = cachedList.findIndex(a => normalizeBlogSlug(a?.slug) === normalizeBlogSlug(merged.slug));
                if (idx >= 0) {
                  cachedList[idx] = merged;
                } else {
                  cachedList.unshift(merged);
                }
                localStorage.setItem('publishedGuides', JSON.stringify(cachedList));
              }
            } catch {
              // ignore storage quota errors
            }
          }
        }
      }
    }).catch(() => {});

    return () => {
      articleController.abort();
    };
  }, [slug, article, articles]);

  const handleJumpToSection = (sectionId: string) => {
    if (!sectionId) return;
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleDocCheck = (idx: number) => {
    setCheckedDocs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Set dynamic page metadata
    document.title = `${title} | VisaApply.org`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', activeArticle?.excerpt || `Official 2026 application guide, fee breakdown, document checklist, and step-by-step instructions for ${fromCountry.name} citizens applying for a ${categoryCode} visa to ${toCountry.name}.`);
    }

    // Set initial FAQs from dbVisaItem immediately, then synchronize via /api/faq with 30s timeout & exponential backoff
    const initialFaqs = (dbVisaItem?.faq && Array.isArray(dbVisaItem.faq) && dbVisaItem.faq.length > 0)
      ? dbVisaItem.faq
      : [
          {
            q: `What is the official government fee for a ${categoryCode} visa from ${fromCountry.name} to ${toCountry.name}?`,
            a: `The standard visa processing fee is approximately ${feesStr}. Additional charges may include biometric collection fees, visa application centre (VFS) service fees, and optional express courier delivery.`
          },
          {
            q: `How much bank balance is required to be shown for ${toCountry.name}?`,
            a: `Applicants should maintain liquid funds of minimum ₹3-5 Lakhs (tourist) or ₹20-35 Lakhs (student/work) in seasoned savings accounts for at least 3 to 6 months. Sudden unverified deposits made days before application risk refusal.`
          },
          {
            q: `Are Income Tax Returns (ITR) mandatory for ${fromCountry.name} applicants?`,
            a: `Yes, submitting ITR-V acknowledgment copies for the last 2 to 3 financial years along with Computation of Income is highly recommended. The income reported must reconcile with bank statement salary credits.`
          },
          {
            q: `Can I work on a visitor/tourist visa in ${toCountry.name}?`,
            a: `No. Working in ${toCountry.name} on a visitor visa is strictly prohibited under immigration law and leads to immediate deportation, detention, and a multi-year entry ban.`
          }
        ];
    setFaqs(initialFaqs);

    const faqController = new AbortController();
    fetchWithRetry<{ success?: boolean; faqs?: any[] }>(
      `/api/faq?from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}&type=${encodeURIComponent(categoryCode)}`,
      { signal: faqController.signal },
      {
        retries: 4,
        initialDelay: 1000,
        maxDelay: 12000,
        backoffMultiplier: 2,
        timeoutMs: 30000,
        fallback: { success: true, faqs: initialFaqs }
      }
    ).then(data => {
      if (data?.faqs && Array.isArray(data.faqs) && data.faqs.length > 0) {
        setFaqs(data.faqs);
      }
    }).catch(() => {});

    const sectionIds = [
      'section-overview',
      'section-financial',
      'section-content',
      'section-info-req',
      'section-docs',
      'section-steps',
      'section-advisory',
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

    return () => {
      observer.disconnect();
      faqController.abort();
    };
  }, [title, fromCode, toCode, categoryCode, dbVisaItem]);

  const docsList: string[] = (dbVisaItem?.docs && Array.isArray(dbVisaItem.docs) && dbVisaItem.docs.length > 0)
    ? dbVisaItem.docs
    : [
        'Valid Passport (minimum 6 months validity beyond intended departure date with 2 blank pages)',
        'Completed & Signed Official Visa Application Form (online/consular format)',
        'Passport-size photographs matching official consular biometric standards (2x2 inch white background)',
        categoryCode === 'work' 
          ? 'Approved LMIA / Work Authorization / Official Employer Job Offer Letter'
          : categoryCode === 'student'
            ? 'Official Admission / Offer Letter / I-20 / CAS / CoE from accredited educational institution'
            : 'Proof of Accommodation / Hotel Booking / Letter of Invitation from host in destination',
        'Bank Statements for past 6 months showing regular salary credits with official bank seal and signature',
        'Income Tax Return (ITR-V) / Tax assessment notices for past 2-3 financial years',
        'Employment Verification Letter / NOC from current employer / Business Registration Proof',
        'Confirmed Travel Itinerary / Flight Reservation showing round-trip travel dates',
        'Police Clearance Certificate (PCC) / Criminal Background Verification (if requested)',
        'Medical Examination & Health Insurance Certificate covering authorized stay duration'
      ];

  const infoReqList = [
    'Full Name, Date of Birth, Passport Number, Issue & Expiry Dates, Issuing Authority',
    'Parents & Spouse Full Legal Names, Dates of Birth, and Citizenship Status',
    'Destination Host Address, Contact Person Name, Telephone & Official Email',
    'Current Employer / University Details, Job Title, Monthly Gross Income, Office Address',
    'Past 10 Years International Travel History, Visa Refusal Records & Prior Dates',
    'Character, Security, Criminal History & Biometrics Declarations'
  ];

  const stepsList = [
    'Confirm eligibility stream and compile mandatory documents and sponsor proofs',
    'Fill the official government online visa application portal questionnaire with accurate data',
    'Pay required government visa processing fee and biometric enrollment fees',
    'Schedule appointment for biometric data submission at designated VFS Global / Embassy center',
    'Attend appointment with original passport, appointment confirmation, and document folder',
    'Undergo digital fingerprint scanning and high-resolution biometric photograph capture',
    'Track application progress via official consular reference number tracking portal',
    'Receive passport with approved visa vignette sticker or digital electronic visa approval (eVisa)'
  ];

  const filteredFaqs = faqs.filter(faq => {
    if (!faqSearchQuery.trim()) return true;
    const q = (faq.q || faq.question || '').toLowerCase();
    const a = (faq.a || faq.answer || '').toLowerCase();
    const query = faqSearchQuery.toLowerCase().trim();
    return q.includes(query) || a.includes(query);
  });

  // Render markdown content with cache-first activeArticle and synthesized fallback guarantee
  const parsedMarkdownContent = (() => {
    if (activeArticle?.contentHtml && isRichContent(activeArticle.contentHtml)) {
      return activeArticle.contentHtml;
    }
    const rawMd = activeArticle?.content || activeArticle?.rawContent;
    if (rawMd && isRichContent(rawMd)) {
      return String(marked.parse(rawMd));
    }
    const defaultGuide = findDefaultGuideMatch(slug, fromCode, toCode, categoryCode);
    if (defaultGuide?.contentHtml) {
      return defaultGuide.contentHtml;
    }
    if (defaultGuide?.content) {
      return String(marked.parse(defaultGuide.content));
    }
    return String(
      marked.parse(
        buildFallbackMarkdownForArticle({
          slug,
          title,
          from: fromCode,
          to: toCode,
          type: categoryCode,
          fees: feesStr,
          docs: docsList.join(', ')
        })
      )
    );
  })();

  const embassyData = getEmbassyInfo(toCode, fromCode);

  // Other related guides to show at the bottom
  const relatedSource = articles.length > 0 ? articles : DEFAULT_PUBLISHED_GUIDES;
  const relatedArticles = relatedSource
    .filter(a => normalizeBlogSlug(a.slug) !== slug && (a.from === fromCode || a.to === toCode || a.type === categoryCode))
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Sticky Mobile & Desktop Navigation Bar with Breadcrumbs & Jump-to-Section Dropdown */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 py-2.5 px-3 sm:px-4 -mx-4 sm:mx-0 rounded-b-2xl sm:rounded-2xl border-b border-slate-200/90 shadow-sm mb-6 no-print">
        <div className="flex flex-col gap-2">
          {/* Top Row: Back Buttons & Compact Breadcrumb Indicator */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => navigate('/')} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-xs cursor-pointer transition-colors"
                title="Back to Home & All Guides"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                <span>Back to All Guides</span>
              </button>
              <button 
                onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}`)} 
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 text-xs font-medium text-slate-600 cursor-pointer"
                title={`Explore all ${fromCountry.name} to ${toCountry.name} visas`}
              >
                {fromCode} → {toCode} Visas
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
              <span className="truncate font-bold text-slate-900" title={title}>
                {activeArticle?.title || title}
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
                  <option value="section-financial">💼 2. Funds, ITR & Bank Rules</option>
                  {parsedMarkdownContent && <option value="section-content">📖 3. In-Depth Editorial Guide</option>}
                  <option value="section-info-req">📋 4. Mandatory Application Data</option>
                  <option value="section-docs">📄 5. Document Checklist ({docsList.length} docs)</option>
                  <option value="section-steps">📝 6. Step-by-Step Process</option>
                  <option value="section-advisory">💡 7. Consular Advisory & Tips</option>
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

      {/* Static Breadcrumbs Path */}
      <nav className="text-xs sm:text-sm text-slate-500 mb-6 font-medium flex items-center gap-1.5 flex-wrap no-print">
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-blue-600">Home</span>
        <span>&gt;</span>
        <span onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}`)} className="cursor-pointer hover:text-blue-600">{fromCountry.name} to {toCountry.name}</span>
        <span>&gt;</span>
        <span onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${categoryCode}`)} className="cursor-pointer hover:text-blue-600 capitalize">{categoryCode} Visa</span>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{title}</span>
      </nav>

      {/* Main Guide Card */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-10 space-y-8">
        {/* Header Title & Badges */}
        <div id="section-overview" className="text-center space-y-3 pb-6 border-b border-slate-200 scroll-mt-28">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#0B3D91] bg-blue-50 px-3 py-1 rounded-full w-max mx-auto">
            <span>{fromCountry.flag} {fromCountry.name} ({fromCode})</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span>{toCountry.flag} {toCountry.name} ({toCode})</span>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="uppercase bg-[#0B3D91] text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full tracking-wide">
              {categoryCode} Visa
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 2026 Official Guide
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Published: {dateStr}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto">
            {title}
          </h1>

          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {activeArticle?.excerpt || `Comprehensive 2026 consular guide detailing official eligibility criteria, fee structures, financial proof benchmarks, and step-by-step document submission for ${fromCountry.name} passport holders.`}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-2xl mx-auto text-xs">
            <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-center">
              <span className="text-slate-500 block font-medium">Govt Visa Fee</span>
              <span className="font-bold text-[#0B3D91] text-sm mt-0.5 block">{feesStr}</span>
            </div>
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-center">
              <span className="text-slate-500 block font-medium">Visa Validity</span>
              <span className="font-bold text-emerald-800 text-sm mt-0.5 block">{validityStr}</span>
            </div>
            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100 text-center">
              <span className="text-slate-500 block font-medium">Authorized Stay</span>
              <span className="font-bold text-amber-800 text-sm mt-0.5 block">{stayStr}</span>
            </div>
            <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-100 text-center">
              <span className="text-slate-500 block font-medium">Processing Time</span>
              <span className="font-bold text-purple-800 text-sm mt-0.5 block">15-30 Days</span>
            </div>
          </div>
        </div>

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
                    <p className="mt-0.5 leading-relaxed">
                      {categoryCode === 'student' 
                        ? '₹25-35 Lakhs liquid balance (covering 1 year tuition fees + living costs AUD/CAD/USD equivalent).' 
                        : categoryCode === 'work' 
                          ? '₹5-8 Lakhs liquid balance + Employer sponsorship / LMIA approval.' 
                          : '₹3-5 Lakhs liquid balance in savings account (minimum $3,000-5,000 equivalent).'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Bank Duration & Seasoning:</span>
                    <p className="mt-0.5 leading-relaxed">Last 6 months bank statement showing regular transaction history and minimum 3 months seasoned funds.</p>
                  </div>
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-900 text-[11px] leading-relaxed">
                    <span className="font-bold block text-red-950">Sudden Deposit Warning:</span>
                    ❌ 1 din pehle bada deposit (loan/borrowed money) direct reject karwata hai. Har large deposit (&gt;50k) ka legal source proof hona anivarya hai.
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-lg text-[11px] text-emerald-950 font-medium">
                ✅ Sahi: Regular monthly salary credits. ❌ Galat: One-day loan deposit without source proof.
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
                    <p className="mt-0.5 leading-relaxed">Past 2 to 3 financial years ITR-V + Computation of Income + Form 16 / Form 26AS.</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">ITR & Bank Reconciliation:</span>
                    <p className="mt-0.5 leading-relaxed">ITR me reported income aur bank me aane wale salary credits 100% reconcile hone chahiye. Mismatch hone par direct refusal.</p>
                  </div>
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                    <span className="font-bold block text-amber-950">No ITR Case:</span>
                    Agar ITR nahi hai to Form 26AS + 6 months salary slips + Employer NOC lagao, lekin visa refusal risk 60% badh jata hai.
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-blue-100/70 border border-blue-300 rounded-lg text-[11px] text-blue-950 font-medium">
                Rule: PAN, Name, and Tax assessment must match passport and visa application details exactly.
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
                    <span className="font-bold text-slate-900 block">Months & Original Seal:</span>
                    <p className="mt-0.5 leading-relaxed">Last 6 months statement with original bank branch seal and officer signature on every page.</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Predictable Credits:</span>
                    <p className="mt-0.5 leading-relaxed">Salary or legitimate business revenue credited predictably between 1st to 10th of each month.</p>
                  </div>
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-800 leading-relaxed">
                    <span className="font-bold block text-slate-900">Source of Large Funds:</span>
                    Agri: J-Form + Land deeds. Property: Registered Sale deed + Bank credit. Gift: Registered Gift Deed + Donor ITR.
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-indigo-100/70 border border-indigo-300 rounded-lg text-[11px] text-indigo-950 font-medium">
                Credit card cash withdrawal or borrowing money strictly prohibited.
              </div>
            </div>
          </div>
        </div>

        {/* IN-DEPTH EDITORIAL ARTICLE CONTENT (Markdown Rendered) */}
        {parsedMarkdownContent && (
          <div id="section-content" className="space-y-4 pt-4 border-t border-slate-200 scroll-mt-28">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0B3D91]" />
                <span>📖 In-Depth Visa Guide & Requirements</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                Editorial Review
              </span>
            </div>

            <div 
              className="prose prose-slate max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed space-y-4 bg-slate-50/60 p-6 rounded-2xl border border-slate-200"
              dangerouslySetInnerHTML={{ __html: String(parsedMarkdownContent) }}
            />
          </div>
        )}

        {/* MANDATORY SECTION: Information Required in Application Form */}
        <div id="section-info-req" className="space-y-4 pt-2 scroll-mt-28">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0B3D91]" />
              <span>Mandatory Information Required in Application Form</span>
            </h2>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Mandatory Data
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Keep the following key biographic, financial, and travel details ready before filling the official online visa form:
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
              <span>📄 Required Documents Checklist</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {Object.keys(checkedDocs).filter(k => checkedDocs[Number(k)]).length} of {docsList.length} verified
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
            <span>📝 Step-by-Step Application Process</span>
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

        {/* Consular Advisory & Tips */}
        <div id="section-advisory" className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-xs sm:text-sm text-amber-900 space-y-2 scroll-mt-28">
          <h3 className="font-bold flex items-center gap-2 text-amber-950">
            💡 Consular Advisory & Visa Interview Tips
          </h3>
          <p className="leading-relaxed">
            Always submit genuine, certified financial documents. Under section PIC 4020 (or equivalent immigration fraud acts), providing falsified employment references, fabricated salary slips, or concealed prior refusals leads to immediate rejection and a strict 3 to 10 year global visa ban. Be transparent about your travel intent and strong ties to your home country.
          </p>
        </div>

        {/* Dynamic & Static FAQs */}
        <div id="section-faqs" className="space-y-4 pt-4 border-t border-slate-200 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>❓ Frequently Asked Questions ({fromCode} → {toCode})</span>
              {faqs.length > 0 && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'}
                </span>
              )}
            </h2>

            {/* FAQ Search */}
            {faqs.length > 0 && (
              <div className="relative min-w-[220px] sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder="Search FAQs..."
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
        </div>

        {/* Official Embassy, Consulate & VFS Contact Details */}
        <div id="section-embassy" className="space-y-4 pt-4 border-t border-slate-200 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0B3D91]" />
              <span>Official Embassy & VFS Centers ({embassyData.country})</span>
            </h2>
            {embassyData.vfs && (
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {embassyData.vfs}
              </span>
            )}
          </div>

          {embassyData.officialWebsite && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#0B3D91]" />
                Official Government Portal:
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
                      <a href={`tel:${item.phone}`} className="text-slate-800 font-semibold hover:text-[#0B3D91]">
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-100 p-4 rounded-2xl no-print">
          <button 
            onClick={() => window.print()} 
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            🖨️ Download / Print Complete Guide
          </button>

          <a 
            href={`mailto:contact@visaapply.org?subject=Query regarding ${title}`} 
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0B3D91] text-white font-bold rounded-xl text-xs hover:bg-[#09327a] transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Editorial Support</span>
          </a>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-xs text-slate-700">
          Disclaimer: VisaApply.org is an independent informational visa intelligence platform. We are not an official government embassy, consulate, or VFS Global partner. Visa approvals, processing decisions, and fees are solely determined by official sovereign government immigration authorities.
        </div>
      </div>

      {/* Related Published Visa Guides Section */}
      {relatedArticles.length > 0 && (
        <div className="mt-10 space-y-4 no-print">
          <h3 className="text-lg font-bold text-slate-900">Explore Related Published Guides</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.map(rel => (
              <div 
                key={rel.slug} 
                onClick={() => navigate(`/${rel.slug}`)} 
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#0B3D91] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="uppercase text-[10px] font-bold text-[#0B3D91] bg-blue-50 px-2 py-0.5 rounded">
                    {rel.type} visa
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs mt-2 line-clamp-2">{rel.title}</h4>
                </div>
                <span className="text-[11px] font-semibold text-[#0B3D91] mt-3 flex items-center gap-1">
                  Read Guide <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
