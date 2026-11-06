import React, { useState, useEffect, useMemo } from 'react';
import { FULL_VISA_DB, verifyNoVisaMissed, CountryVisas, getLiveVisaCount, BASE_COUNTRY_VISAS, VisaItem, getVisasFixed, getVisasByCategoryFixed, initializeFullVisaDatabase, NAME_MAP_249, FLAG_MAP_249 } from './data/fullVisaDatabase';
import { CONTINENT_MAP_249, getContinentForCountry, isCountryInContinent } from './data/continentMap';
import { COUNTRY_META_249, getCountryMeta, getCapitalSlug } from './data/countryMetaData';
import { getLiveLocalTime, getLiveWeather, getCurrencyRate, generateChecklistPDF, parseHotelPriceUSD, parseProcessingDays, parseSuccessRateNum } from './utils/countryLiveUtils';
import { REGIONAL_MIGRATION_INFO } from './data/regionalMigration';
import { getEmbassyInfo } from './data/embassyAddresses';
import { TRANSLATIONS, LANGUAGE_MAP, getTranslation } from './data/translations';
import { getLanguageForCountry, LANGUAGE_NAMES } from './data/languageMap';
import { VerificationView } from './components/VerificationView';
import { AuditPage } from './pages/AuditPage';
import { SitemapPage } from './pages/SitemapPage';
import { AdSenseBanner } from './components/AdSenseBanner';
import { BlogArticleView } from './components/BlogArticleView';
import { EligibilityChecker } from './components/EligibilityChecker';
import { VisaComparison } from './components/VisaComparison';
import { EmbassyFinder } from './components/EmbassyFinder';
import { BlogsPage, FeaturedBlogsCarousel } from './components/AutoBlogger';
import { findGeneratedBlogBySlug, getPreservedPublishedDate } from './data/blogGenerator';
import { VisaChatbot } from './components/VisaChatbot';
import { InterviewPrepFull, get20InterviewQuestions } from './components/InterviewPrepFull';
import {
  DEFAULT_PUBLISHED_GUIDES,
  mergeArticleCollections,
  hydrateArticleWithCacheAndFallback,
  findDefaultGuideMatch,
  normalizeBlogSlug,
  hasRicherRemoteArticles
} from './data/defaultArticles';
import { fetchWithRetry } from './utils/fetchWithRetry';
import { CA_REGIONAL_WARNING_TEXT, CA_IRCC_REFERENCE_LINKS } from './data/canadaVisas';
import {
  UK_REGIONAL_WARNING_TEXT,
  UK_EUSS_WARNING_TEXT,
  UK_BNO_WARNING_TEXT,
  UK_UKRAINE_WARNING_TEXT,
  UK_NATIONALITY_WARNING_TEXT,
  UK_ENTRY_WARNING_TEXT,
  UK_LEGACY_WARNING_TEXT,
  REGIONAL_SPONSOR_DIRECTORY,
  REGIONAL_SALARY_RULES,
  IMMIGRATION_SALARY_LIST_SUMMARY,
  REGIONAL_DIRECTORY_SECTIONS
} from './data/ukRegionalJobs';

import { JP_TO_IN_VISA } from './data/jpToInDetailed';
import { marked } from 'marked';
import { 
  Globe, Plane, Briefcase, GraduationCap, Users, Building2, Award, 
  CheckCircle2, Trash2, RefreshCw, FileText, Shield, Search, 
  ArrowRight, ExternalLink, Clock, DollarSign, Menu, X, ChevronRight, Check,
  Mail, Copy, Send, MapPin, Phone, ChevronDown, ArrowUp, Navigation
} from 'lucide-react';

import { ALL_249_ISO_FORCED } from './data/all249Countries';

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

const FALLBACK_COUNTRIES = ALL_249_ISO_FORCED;

// COUNTRY NAME MAP - FIX KH -> CAMBODIA etc
export const COUNTRY_NAMES: Record<string, string> = {
  "us":"United States", "ca":"Canada", "gb":"United Kingdom", "uk":"United Kingdom", "au":"Australia", "ae":"United Arab Emirates", "de":"Germany", "sg":"Singapore", "th":"Thailand", "eu":"Schengen Area", "sc":"Schengen Area", "sch":"Schengen Area", "schengen":"Schengen Area", "jp":"Japan", "in":"India", "fr":"France", "it":"Italy", "es":"Spain", "nl":"Netherlands", "ch":"Switzerland", "nz":"New Zealand", "br":"Brazil", "mx":"Mexico", "kr":"South Korea", "cn":"China", "vn":"Vietnam", "my":"Malaysia", "id":"Indonesia", "ph":"Philippines", "za":"South Africa", "tr":"Turkey", "sa":"Saudi Arabia", "qa":"Qatar", "ie":"Ireland", "se":"Sweden", "no":"Norway", "pt":"Portugal", "dk":"Denmark", "fi":"Finland", "be":"Belgium", "at":"Austria", "pl":"Poland",
  "hk":"Hong Kong", "tw":"Taiwan", "kh":"Cambodia", "la":"Laos", "mm":"Myanmar", "bn":"Brunei", "pk":"Pakistan", "bd":"Bangladesh", "lk":"Sri Lanka", "np":"Nepal", "mn":"Mongolia", "kz":"Kazakhstan",
  "om":"Oman", "kw":"Kuwait", "bh":"Bahrain", "jo":"Jordan", "lb":"Lebanon", "eg":"Egypt", "ma":"Morocco", "ke":"Kenya", "ng":"Nigeria", "gh":"Ghana", "et":"Ethiopia", "tz":"Tanzania", "ug":"Uganda", "rw":"Rwanda", "mu":"Mauritius",
  "ar":"Argentina", "cl":"Chile", "co":"Colombia", "pe":"Peru", "uy":"Uruguay", "pa":"Panama", "cr":"Costa Rica", "do":"Dominican Republic", "jm":"Jamaica", "is":"Iceland", "lu":"Luxembourg", "cz":"Czech Republic", "hu":"Hungary", "gr":"Greece", "hr":"Croatia", "ro":"Romania", "ua":"Ukraine", "cy":"Cyprus", "mt":"Malta", "uz":"Uzbekistan", "az":"Azerbaijan",
  "bt":"Bhutan", "mv":"Maldives", "fj":"Fiji", "bw":"Botswana", "zm":"Zambia", "zw":"Zimbabwe", "na":"Namibia", "mz":"Mozambique", "ad":"Andorra", "mc":"Monaco", "li":"Liechtenstein", "sm":"San Marino", "tn":"Tunisia"
};

export const COUNTRY_NAME_MAP: Record<string, string> = { ...COUNTRY_NAMES, ...NAME_MAP_249 };

export const FLAG_MAP: Record<string, string> = {
  "us":"🇺🇸","ca":"🇨🇦","gb":"🇬🇧","uk":"🇬🇧","au":"🇦🇺","ae":"🇦🇪","de":"🇩🇪","sg":"🇸🇬","th":"🇹🇭","eu":"🇪🇺","sc":"🇪🇺","sch":"🇪🇺","schengen":"🇪🇺","jp":"🇯🇵","in":"🇮🇳","fr":"🇫🇷","it":"🇮🇹","es":"🇪🇸","nl":"🇳🇱","ch":"🇨🇭","nz":"🇳🇿","br":"🇧🇷","mx":"🇲🇽","kr":"🇰🇷","cn":"🇨🇳","vn":"🇻🇳","my":"🇲🇾","id":"🇮🇩","ph":"🇵🇭","za":"🇿🇦","tr":"🇹🇷","sa":"🇸🇦","qa":"🇶🇦","ie":"🇮🇪","se":"🇸🇪","no":"🇳🇴","pt":"🇵🇹","dk":"🇩🇰","fi":"🇫🇮","be":"🇧🇪","at":"🇦🇹","pl":"🇵🇱","hk":"🇭🇰","tw":"🇹🇼","kh":"🇰🇭","la":"🇱🇦","mm":"🇲🇲","bn":"🇧🇳","pk":"🇵🇰","bd":"🇧🇩","lk":"🇱🇰","np":"🇳🇵","mn":"🇲🇳","kz":"🇰🇿","om":"🇴🇲","kw":"🇰🇼","bh":"🇧🇭","jo":"🇯🇴","lb":"🇱🇧","eg":"🇪🇬","ma":"🇲🇦","ke":"🇰🇪","ng":"🇳🇬","gh":"🇬🇭","et":"🇪🇹","tz":"🇹🇿","ug":"🇺🇬","rw":"🇷🇼","mu":"🇲🇺","ar":"🇦🇷","cl":"🇨🇱","co":"🇨🇴","pe":"🇵🇪","uy":"🇺🇾","pa":"🇵🇦","cr":"🇨🇷","do":"🇩🇴","jm":"🇯🇲","is":"🇮🇸","lu":"🇱🇺","cz":"🇨🇿","hu":"🇭🇺","gr":"🇬🇷","hr":"🇭🇷","ro":"🇷🇴","ua":"🇺🇦","cy":"🇨🇾","mt":"🇲🇹","uz":"🇺🇿","az":"🇦🇿",
  "bt":"🇧🇹","mv":"🇲🇻","fj":"🇫🇯","bw":"🇧🇼","zm":"🇿🇲","zw":"🇿🇼","na":"🇳🇦","mz":"MZ","ad":"🇦🇩","mc":"🇲🇨","li":"🇱🇮","sm":"🇸🇲","tn":"🇹🇳"
};

export const COUNTRY_FLAGS: Record<string, string> = { ...FLAG_MAP, ...FLAG_MAP_249 };

// FIX RENDER FUNCTION - IN TO US / IN TO KH BUG
export function getCountryDisplayName(code: string): string {
  if (!code) return "";
  const c = code.trim().toLowerCase();
  return NAME_MAP_249[c] || COUNTRY_NAME_MAP[c] || COUNTRY_NAMES[c] || (c === 'uk' ? 'United Kingdom' : c === 'sc' || c === 'sch' || c === 'schengen' || c === 'eu' ? 'Schengen Area' : code.toUpperCase());
}

export function getCountryFlag(code: string): string {
  if (!code) return "🌍";
  const c = code.trim().toLowerCase();
  return FLAG_MAP_249[c] || FLAG_MAP[c] || COUNTRY_FLAGS[c] || (c === 'uk' ? '🇬🇧' : c === 'sc' || c === 'sch' || c === 'schengen' || c === 'eu' ? '🇪🇺' : "🌍");
}

export function getCountryFullName(code: string): string {
  return getCountryDisplayName(code);
}

export function getCountryFlagUrl(code: string): string {
  if (!code) return "https://flagcdn.com/w160/un.png";
  const lower = code.trim().toLowerCase();
  const iso = (lower === "sc" || lower === "sch" || lower === "schengen" || lower === "eu")
    ? "eu"
    : (lower === "uk" ? "gb" : lower);
  return `https://flagcdn.com/w160/${iso}.png`;
}

// OVERRIDE Travel from India to KH -> Cambodia
export function renderCountryHeaderFixed(fromCode: string, toCode: string) {
  const fromName = getCountryDisplayName(fromCode);
  const toName = getCountryDisplayName(toCode);
  const fromFlag = getCountryFlag(fromCode);
  const toFlag = getCountryFlag(toCode);
  return {
    title: `Travel from ${fromName} to ${toName}`,
    breadcrumb: `${fromName} to ${toName}`,
    flags: `${fromFlag} → ${toFlag}`,
    fromName, toName, fromFlag, toFlag
  };
}

// PATCH EXISTING RENDER
export function renderCountryPageFixed(countryCode: string) {
  const code = (countryCode || '').toLowerCase();
  const toName = getCountryDisplayName(code);
  const toFlag = getCountryFlag(code);
  const fromName = getCountryDisplayName("in");
  const fromFlag = getCountryFlag("in");
  const liveCount = (typeof (window as any).getLiveVisaCount === "function")
    ? (window as any).getLiveVisaCount(code)
    : (BASE_COUNTRY_VISAS[code] ? (BASE_COUNTRY_VISAS[code] as any).length : 0);
  
  // FIX TITLE - India to KH -> India to Cambodia
  document.title = `VisaApply.org - ${fromName} to ${toName} - ${liveCount} Visas`;
  
  let html = `<div style="padding:24px;"><div style="display:flex; align-items:center; gap:12px; margin-bottom:8px; justify-content:center;"><div style="width:48px; height:32px; background:#1e40af; color:white; display:flex; align-items:center; justify-content:center; border-radius:4px; font-weight:800;">IN</div><div style="font-size:20px; color:#94a3b8;">→</div><div style="width:48px; height:32px; background:#f1f5f9; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:center; border-radius:4px; font-size:24px;">${toFlag}</div></div><h1 style="font-size:28px; font-weight:800; text-align:center;">Travel from ${fromName} to ${toName}</h1><p style="color:#64748b; text-align:center; margin-top:8px;">Step 1 of 2: Select your primary purpose of travel below to see all official visa options.</p>`;
  
  html += `<div style="margin-top:8px; text-align:center; font-size:12px; color:#93c5fd;">${fromFlag} ${fromName} → ${toFlag} ${toName} • ${liveCount} Visa Types</div>`;
  
  html += `<div style="display:flex; gap:8px; justify-content:center; margin:16px 0;"><button onclick="if(typeof renderCountryCardsOption2Left==='function') renderCountryCardsOption2Left(); else window.location.href='/'" style="background:#f1f5f9; padding:8px 16px; border-radius:8px; border:1px solid #e2e8f0; cursor:pointer;">← Back to Countries</button></div>`;
  
  const categories = [
    {key:"tourist", label:"Tourist Visa", labelHi:"टूरिस्ट वीजा", icon:"🏖️", desc:"Vacations, sightseeing, visiting friends & short term stay"},
    {key:"business", label:"Business Visa", labelHi:"बिजनेस वीजा", icon:"💼", desc:"Business meetings, conferences, trade & investment"},
    {key:"work", label:"Work & Employment Visa", labelHi:"वर्क एवं एम्प्लॉयमेंट वीजा", icon:"🔧", desc:"Employment, job permit, executive transfers & skilled work"},
    {key:"student", label:"Student & Study Visa", labelHi:"स्टूडेंट एवं स्टडी वीजा", icon:"🎓", desc:"Higher education, university degree & vocational study"},
    {key:"family", label:"Family Visa", labelHi:"फैमिली वीजा", icon:"👨👩👧👦", desc:"Family reunion, spouse, child & dependent visas"},
    {key:"pr", label:"PR & Golden Visa", labelHi:"पीआर एवं गोल्डन वीजा", icon:"🏠", desc:"Permanent residence, citizenship & investment visas"}
  ];
  
  html += `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:16px; margin-top:24px;">`;
  categories.forEach(cat=>{
    const visas = (typeof (window as any).getVisasByCategoryFixed === "function")
      ? (window as any).getVisasByCategoryFixed(code, cat.key)
      : ((BASE_COUNTRY_VISAS as any)[code]||[]).filter((v: any)=>v.category===cat.key);
    const count = visas.length;
    if(count===0) return;
    html += `<div onclick="if(typeof (window as any).renderVisaList==='function') (window as any).renderVisaList('${code}','${cat.key}'); else window.location.href='/in-to-${code}-${cat.key}'" style="background:white; border:1px solid #e2e8f0; border-radius:16px; padding:20px; cursor:pointer; transition:all 0.2s;"><div style="display:flex; justify-content:space-between; align-items:center;"><div style="font-size:32px;">${cat.icon}</div><div style="background:#dbeafe; color:#2563eb; font-size:11px; padding:4px 8px; border-radius:9999px; font-weight:600;">${count} Visa Types</div></div><h3 style="font-weight:700; font-size:16px; margin-top:12px;">${cat.labelHi} (${cat.label})</h3><p style="font-size:12px; color:#64748b; margin-top:6px;">${cat.desc}</p><div style="margin-top:12px; color:#2563eb; font-size:12px; font-weight:600;">Explore Category →</div></div>`;
  });
  html += `</div></div>`;
  
  const container = document.getElementById('main-content') || document.getElementById('country-detail') || document.querySelector('[data-country-detail]');
  if(container) container.innerHTML = html;
  
  console.log(`✅ FIXED HEADER: Travel from ${fromName} to ${toName} - Flag ${toFlag} - ${liveCount} types - Was showing KH now showing ${toName}`);
}

// OVERRIDE GLOBAL
if (typeof window !== 'undefined') {
  (window as any).COUNTRY_NAMES = COUNTRY_NAMES;
  (window as any).COUNTRY_FLAGS = COUNTRY_FLAGS;
  (window as any).COUNTRY_NAME_MAP = COUNTRY_NAME_MAP;
  (window as any).FLAG_MAP = FLAG_MAP;
  (window as any).getCountryDisplayName = getCountryDisplayName;
  (window as any).getCountryFlag = getCountryFlag;
  (window as any).getCountryFullName = getCountryFullName;
  (window as any).renderCountryHeaderFixed = renderCountryHeaderFixed;
  (window as any).renderCountryPageFixed = renderCountryPageFixed;
  (window as any).renderCountryPage = renderCountryPageFixed;

  // FORCE RE-RENDER CURRENT PAGE IF KH
  try {
    const currentUrl = window.location.href;
    if (currentUrl.includes("KH") || currentUrl.includes("kh") || document.body.innerHTML.includes("India to KH")) {
      renderCountryPageFixed("kh");
    }
  } catch(e) {}
}

console.log("✅ COUNTRY NAME + FLAG BUG FIX DONE - KH -> Cambodia, 86 countries now show full names + flags - IN -> US, IN -> Cambodia, etc - No more KH, BH, OM code display");

function generateMetadata(path: string, countries: Country[], article?: Article | null) {
  const isAdmin = path === '/admin';
  const isSitemap = path === '/sitemap';
  const isContact = path === '/contact';
  const isPrivacy = path === '/privacy';
  const isTerms = path === '/terms';
  const isBlogs = path === '/blogs' || path === '/blogs/';
  const interviewMatch = path.match(/^\/interview-prep\/([a-z]{2,3})$/i);
  const articleMatch = path.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})-([a-z]+)$/);
  const quizMatch = path.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})$/) || path.match(/^\/()([a-z]{2,3})-visa$/i);

  const totalCountryCount = Math.max(countries?.length || 0, Object.keys(BASE_COUNTRY_VISAS || {}).length);
  let title = 'VisaApply.org – Global Visa Requirements & Guides';
  let description = `Official global visa information, 2-step visa type quiz, fees, documents, and application guides for 14,084+ live visas across ${totalCountryCount} global destination countries worldwide.`;

  if (isAdmin) {
    title = 'Admin Editorial Portal – VisaApply.org';
    description = 'Manage AI-generated visa guide drafts and publish official immigration content.';
  } else if (isBlogs) {
    title = '2026 Global Visa Blogs & Travel Guides (2,490+ Articles) – VisaApply.org';
    description = 'Explore 2,490+ SEO visa blogs across 249 countries for Indian travelers: fees, e-Visa vs VOA comparisons, work permits, student scholarships, and consular interview guides.';
  } else if (interviewMatch) {
    const code = interviewMatch[1].toLowerCase();
    const cName = getCountryDisplayName(code);
    title = `${cName} Visa Interview Questions & Winning Answers for Indians (2026) – VisaApply.org`;
    description = `Master the top 20 ${cName} consular interview questions and ideal answers for Indian passport holders, plus our interactive Mock Interview simulator, dress code, and document folder order.`;
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
    description = `Explore complete visa requirements, official fees, and document checklists across all ${totalCountryCount} global destination countries and visa categories.`;
  } else if (article && article.title) {
    title = `${article.title} | VisaApply.org`;
    description = article.excerpt || `Complete 2026 visa guide for ${article.title}. Find fees, documents, processing time, and FAQs.`;
  } else if (articleMatch) {
    const from = articleMatch[1].toUpperCase();
    const to = articleMatch[2].toUpperCase();
    const type = articleMatch[3];
    const fromName = getCountryDisplayName(from);
    const toName = getCountryDisplayName(to);
    if (article && article.title) {
      title = `${article.title} | VisaApply.org`;
      description = `Official guide for ${fromName} citizens applying for a ${type} visa to ${toName}. Fees: ${article.fees}. Check required documents and step-by-step process.`;
    } else {
      title = `${fromName} to ${toName} ${type.toUpperCase()} Visa Requirements & Guide – VisaApply.org`;
      description = `Complete visa guide for ${fromName} citizens applying for a ${type} visa to ${toName}. Find fees, documents, processing time, and FAQs.`;
    }
  } else if (quizMatch) {
    const from = (quizMatch[1] || 'IN').toUpperCase();
    const to = quizMatch[2].toUpperCase();
    const fromName = getCountryDisplayName(from);
    const toName = getCountryDisplayName(to);

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

  // Inject Schema.org JSON-LD for AEO & SEO Knowledge Graph (WebApplication, BreadcrumbList, FAQPage, HowTo)
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

  let targetCodeForSchema = 'us';

  if (isAdmin) {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Admin Portal", "item": `${baseUrl}/admin` });
  } else if (isBlogs) {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Visa Blogs", "item": `${baseUrl}/blogs` });
  } else if (interviewMatch) {
    targetCodeForSchema = interviewMatch[1].toLowerCase();
    const cName = getCountryDisplayName(targetCodeForSchema);
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": `${cName} Visa`, "item": `${baseUrl}/in-to-${targetCodeForSchema}` });
    breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": `${cName} Interview Prep`, "item": window.location.href });
  } else if (isContact) {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Contact Us", "item": `${baseUrl}/contact` });
  } else if (isPrivacy) {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": `${baseUrl}/privacy` });
  } else if (isTerms) {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Terms of Service", "item": `${baseUrl}/terms` });
  } else if (isSitemap) {
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "All Visa Guides", "item": `${baseUrl}/sitemap` });
  } else if (quizMatch) {
    const from = (quizMatch[1] || 'IN').toUpperCase();
    const to = quizMatch[2].toUpperCase();
    targetCodeForSchema = to.toLowerCase();
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": `${from} to ${to} Visa Quiz`, "item": window.location.href });
  } else if (articleMatch) {
    const from = articleMatch[1].toUpperCase();
    const to = articleMatch[2].toUpperCase();
    targetCodeForSchema = to.toLowerCase();
    const type = articleMatch[3].toUpperCase();
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": `${from} to ${to} Guides`, "item": `${baseUrl}/${from.toLowerCase()}-to-${to.toLowerCase()}` });
    breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": `${type} Visa Guide`, "item": window.location.href });
  } else if (article) {
    targetCodeForSchema = (article.to || 'us').toLowerCase();
    breadcrumbItems.push({ "@type": "ListItem", "position": 2, "name": "Visa Blogs", "item": `${baseUrl}/blogs` });
    breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": article.title, "item": window.location.href });
  }

  const schemaCountryName = getCountryDisplayName(targetCodeForSchema);
  const schemaMeta = getCountryMeta(targetCodeForSchema);
  const schemaCount = getLiveVisaCount(targetCodeForSchema);

  const faqEntities = interviewMatch
    ? get20InterviewQuestions(targetCodeForSchema, schemaCountryName).slice(0, 6).map((q) => ({
        "@type": "Question",
        "name": q.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": q.idealAnswer
        }
      }))
    : [
        {
          "@type": "Question",
          "name": `How many visa categories are available for ${schemaCountryName} in 2026?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${schemaCountryName} offers ${schemaCount} official visa types across Tourist, Business, Work, Student, Family, and Permanent Residency categories.`
          }
        },
        {
          "@type": "Question",
          "name": `What is the ${schemaCountryName} visa processing time and approval rate for Indians?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Standard processing time for ${schemaCountryName} is ${schemaMeta.processing} with a ${schemaMeta.successRate} approval rate for Indian passport holders.`
          }
        },
        {
          "@type": "Question",
          "name": `What is the best time to visit ${schemaCountryName} and average hotel cost in ${schemaMeta.capital}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `The best season to visit ${schemaCountryName} is ${schemaMeta.bestTime}. Refundable hotels in ${schemaMeta.capital} start from ${schemaMeta.hotelPrice} on Booking.com.`
          }
        }
      ];

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to Apply for a ${schemaCountryName} Visa from India in 2026`,
    "description": `Step-by-step official procedure to apply for a ${schemaCountryName} visa from India (${schemaMeta.processing} processing time).`,
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Select Visa Subclass & Verify Eligibility",
        "text": `Choose the right subclass among ${schemaCount} official ${schemaCountryName} visa categories using our 30-second Eligibility Checker.`
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Gather Mandatory Financial & Travel Documents",
        "text": `Prepare a valid passport (6+ months), 6 months bank statements, 3 years ITR, employer NOC, and verifiable hotel booking in ${schemaMeta.capital}.`
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Submit Online Application & Book VFS/Embassy Slot",
        "text": `Complete the online application form, pay the consular fee, and attend biometrics/interview in New Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, or Kolkata.`
      }
    ]
  };

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
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqEntities
    },
    howToSchema
  ];
  ldScript.textContent = JSON.stringify(schemas);
}

// ----------------------------------------------------
// Country Live Hero Component (Full 15 Features + Booking.com Hotel AID 8119919 + Cost Calculator)
// ----------------------------------------------------
function CountryLiveHero({ fromCode, toCode, toName, toFlag, count, navigate }: { fromCode: string; toCode: string; toName: string; toFlag: string; count: number; navigate?: (path: string) => void }) {
  const codeLower = (toCode || 'us').toLowerCase();
  const fromLower = (fromCode || 'in').toLowerCase();
  const meta = getCountryMeta(codeLower);
  const capitalSlug = getCapitalSlug(meta.capital);
  const [liveTime, setLiveTime] = useState(() => getLiveLocalTime(meta.timeZone));
  const [weatherStr, setWeatherStr] = useState<string>('Loading...');
  const [currencyStr, setCurrencyStr] = useState<string>('Loading...');
  const [tripNights, setTripNights] = useState<number>(7);
  const [showCalcDetails, setShowCalcDetails] = useState<boolean>(false);

  useEffect(() => {
    setLiveTime(getLiveLocalTime(meta.timeZone));
    setWeatherStr('Loading...');
    setCurrencyStr('Loading...');

    let active = true;
    getLiveWeather(meta.lat, meta.lon).then((w) => {
      if (active) {
        setWeatherStr(`${w.emoji} ${w.temp} ${w.desc}`);
      }
    });
    getCurrencyRate(meta.currency).then((r) => {
      if (active) {
        setCurrencyStr(r);
      }
    });

    const timer = setInterval(() => {
      if (active) setLiveTime(getLiveLocalTime(meta.timeZone));
    }, 60000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [codeLower, meta.timeZone, meta.lat, meta.lon, meta.currency]);

  const nightlyNum = parseHotelPriceUSD(meta.hotelPrice);
  const hotelTotalEst = nightlyNum * tripNights;
  const minTotalUSD = Math.round(hotelTotalEst + 350);
  const maxTotalUSD = Math.round(hotelTotalEst + 1150);

  return (
    <>
    <div className="bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#fef3c7] rounded-[20px] p-5 sm:p-6 border border-[#bfdbfe] mb-6 shadow-xs">
      {/* Row 1: Flag + Name + 8 Feature Boxes */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="text-[56px] sm:text-[64px] leading-none shrink-0">{toFlag}</div>
        <div className="flex-1 w-full min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-[32px] font-black text-slate-900 tracking-[-0.5px] leading-tight">
              {toName} - {count} Visa Types
            </h1>
            <button
              onClick={() =>
                generateChecklistPDF({
                  visaName: `${toName} All Visa Categories`,
                  countryName: toName,
                  countryCode: toCode,
                  processing: meta.processing
                })
              }
              className="bg-[#0f172a] hover:bg-slate-800 text-white px-4 py-2.5 rounded-[10px] font-bold text-[13px] cursor-pointer transition-colors shrink-0 shadow-xs"
            >
              📄 Download Checklist PDF
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#e2e8f0]">
              <span className="text-[11px] text-[#64748b] font-bold block">📍 CAPITAL</span>
              <span className="font-bold text-sm text-slate-900 mt-0.5 block truncate">{meta.capital}</span>
            </div>
            <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#e2e8f0]">
              <span className="text-[11px] text-[#64748b] font-bold block">🗣 LANGUAGE</span>
              <span className="font-bold text-sm text-slate-900 mt-0.5 block truncate">{meta.language}</span>
            </div>
            <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#e2e8f0]">
              <span className="text-[11px] text-[#64748b] font-bold block">💱 CURRENCY</span>
              <span className="font-bold text-sm text-slate-900 mt-0.5 block">
                {meta.currency} ({meta.currencySymbol})
              </span>
              <span id={`live-currency-${codeLower}`} className="text-[11px] text-[#059669] font-semibold block truncate">
                {currencyStr}
              </span>
            </div>
            <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#dcfce7]">
              <span className="text-[11px] text-[#15803d] font-bold block">🕐 LIVE TIME</span>
              <span className="font-bold text-sm text-slate-900 mt-0.5 block">{liveTime.time}</span>
              <span className="text-[11px] text-[#16a34a] font-semibold block">{liveTime.diffFromIST}</span>
            </div>
            <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#fef3c7]">
              <span className="text-[11px] text-[#92400e] font-bold block">🌤 WEATHER</span>
              <span id={`weather-${codeLower}`} className="font-bold text-sm text-slate-900 mt-0.5 block truncate">
                {weatherStr}
              </span>
            </div>
            <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#e0e7ff]">
              <span className="text-[11px] text-[#4338ca] font-bold block">📅 BEST TIME</span>
              <span className="font-bold text-sm text-slate-900 mt-0.5 block truncate">{meta.bestTime}</span>
            </div>
            <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#fde68a]">
              <span className="text-[11px] text-[#92400e] font-bold block">⏱ PROCESSING</span>
              <span className="font-bold text-sm text-slate-900 mt-0.5 block truncate">{meta.processing}</span>
            </div>
            <div className="bg-white px-3.5 py-2.5 rounded-xl border border-[#bbf7d0]">
              <span className="text-[11px] text-[#15803d] font-bold block">💰 SUCCESS RATE</span>
              <span className="font-extrabold text-sm text-[#16a34a] mt-0.5 block">{meta.successRate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Booking.com Hotel + Indian Community & More + Cost Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* Card 1: Booking.com Hotel Price */}
        <div className="bg-white rounded-2xl p-4 border-2 border-[#003580] flex flex-col justify-between">
          <div>
            <div className="text-xs font-extrabold text-[#003580]">🏨 HOTEL PRICE - BOOKING.COM</div>
            <div className="text-lg font-black text-slate-900 mt-1.5">
              From {meta.hotelPrice} in {meta.capital}
            </div>
            <a
              href={`https://www.booking.com/city/${codeLower}/${capitalSlug}.html?aid=8119919&label=${fromLower}-to-${codeLower}-hotel`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-3 bg-[#003580] hover:bg-[#002860] text-white text-center py-2.5 px-3 rounded-[10px] font-bold text-xs no-underline transition-colors"
            >
              Check on Booking.com →
            </a>
          </div>
          <div className="text-[10px] text-[#64748b] mt-2 text-center font-medium">
            AID 8119919 • Free cancellation
          </div>
        </div>

        {/* Card 2: Indian Community & More */}
        <div className="bg-white rounded-2xl p-4 border border-[#e2e8f0] flex flex-col justify-between">
          <div>
            <div className="text-xs font-extrabold text-[#475569]">📊 INDIAN COMMUNITY & MORE</div>
            <div className="text-[13px] text-slate-800 mt-2 leading-[1.8]">
              👥 <b>{meta.indians}</b> Indians in {toName}
              <br />
              🎉 {meta.festivals}
              <br />
              💼 Top Jobs: {meta.topJobs}
              <br />
              🎓 {meta.topUnis}
              <br />
              🚨 Advisory:{' '}
              <span
                className={`px-2 py-0.5 rounded-lg font-bold text-xs ${
                  meta.advisory === 'Safe' ? 'bg-[#dcfce7] text-emerald-900' : 'bg-[#fef3c7] text-amber-900'
                }`}
              >
                {meta.advisory}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Cost Calculator */}
        <div className="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] rounded-2xl p-4 border border-[#bbf7d0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-[#15803d]">🧮 COST CALCULATOR</div>
              {showCalcDetails && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#15803d]">
                  <button
                    type="button"
                    onClick={() => setTripNights(Math.max(1, tripNights - 1))}
                    className="w-5 h-5 rounded bg-white border border-emerald-300 flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span>{tripNights}N</span>
                  <button
                    type="button"
                    onClick={() => setTripNights(Math.min(30, tripNights + 1))}
                    className="w-5 h-5 rounded bg-white border border-emerald-300 flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
            <div className="mt-2 space-y-1 text-xs text-slate-800">
              <div className="flex justify-between">
                <span>Visa Fee:</span>
                <b>$50-$500</b>
              </div>
              <div className="flex justify-between">
                <span>Flight (DEL→):</span>
                <b>{meta.flightPrice}</b>
              </div>
              <div className="flex justify-between">
                <span>Hotel ({tripNights} nights):</span>
                <b>{meta.hotelPrice} x {tripNights}</b>
              </div>
              <div className="border-t border-dashed border-[#86efac] mt-2 pt-2 flex justify-between font-extrabold text-slate-900 text-[13px]">
                <span>Total Est.:</span>
                <span>{showCalcDetails ? `$${minTotalUSD}-$${maxTotalUSD}` : '$800-$2000'}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCalcDetails((prev) => !prev)}
            className="w-full mt-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white py-2 px-3 rounded-lg font-bold text-xs cursor-pointer transition-colors"
          >
            {showCalcDetails ? `Adjust Nights (${tripNights} Nights) • ~$${minTotalUSD}` : 'Calculate My Trip →'}
          </button>
        </div>
      </div>
    </div>

    {/* Phase 3 Tool 1: 30-Sec Visa Eligibility Checker */}
    <EligibilityChecker
      countryCode={toCode}
      countryName={toName}
      defaultFromCode={fromCode}
      onNavigate={navigate}
    />

    {/* Phase 3 Tool 3: Embassy Finder + Consular Interview Prep */}
    <EmbassyFinder countryCode={toCode} countryName={toName} onNavigate={navigate} />
    </>
  );
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

  const headerInfo = renderCountryHeaderFixed(fromCode, toCode);
  const fromCountry = { name: headerInfo.fromName, flag: headerInfo.fromFlag, code: fromCode };
  const toCountry = { name: headerInfo.toName, flag: headerInfo.toFlag, code: toCode };
  const liveCount = getVisasFixed(toCode).length;

  useEffect(() => {
    document.title = `VisaApply.org - ${headerInfo.fromName} to ${headerInfo.toName} - ${liveCount} Visas`;
    console.log(`✅ FIXED HEADER: Travel from ${headerInfo.fromName} to ${headerInfo.toName} - Flag ${headerInfo.toFlag} - ${liveCount} types - Was showing KH now showing ${headerInfo.toName}`);
  }, [fromCode, toCode, headerInfo.fromName, headerInfo.toName, headerInfo.toFlag, liveCount]);

  const isJpToIn = fromCode === 'JP' && toCode === 'IN';
  const getCatVisasCount = (catId: string) => {
    if (isJpToIn) return (JP_TO_IN_VISA["IN"] as any)?.[catId]?.length || 2;
    const list = getVisasByCategoryFixed(toCode, catId);
    return list.length;
  };

  const CATEGORIES = [
    { id: 'tourist', name: t.touristVisa, icon: '🏖️', desc: isJa ? '観光、親族訪問、短期滞在、ヨガ・瞑想' : 'Vacations, sightseeing, visiting friends & short term stay', count: getCatVisasCount('tourist') },
    { id: 'work', name: t.workVisa, icon: '💼', desc: isJa ? '就労、駐在員、技術指導、専門業務' : 'Employment, job permit, executive transfers & skilled work', count: getCatVisasCount('work') },
    { id: 'student', name: t.studentVisa, icon: '🎓', desc: isJa ? '大学・大学院留学、研究機関、語学研修' : 'Higher education, university degree & vocational study', count: getCatVisasCount('student') },
    { id: 'family', name: t.familyVisa, icon: '👨‍👩‍👧', desc: isJa ? '配偶者・家族帯同、同伴ビザ' : 'Spouse, children, parents & dependent residence permits', count: getCatVisasCount('family') },
    { id: 'business', name: t.businessVisa, icon: '🤝', desc: isJa ? '商談、会議出張、市場調査、契約締結' : 'Corporate meetings, conferences & commercial investor options', count: getCatVisasCount('business') },
    { id: 'pr', name: t.prVisa, icon: '🏠', desc: isJa ? 'インド海外市民権（OCI）、終身ビザ免除' : 'Permanent residency, long term immigration & golden investments', count: getCatVisasCount('pr') }
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
        <span className="text-slate-900 font-bold">{headerInfo.breadcrumb}</span>
      </nav>

      {/* Phase 1.5 & 2 & 3: Full Country Hero + Eligibility + Embassy */}
      <CountryLiveHero
        fromCode={fromCode}
        toCode={toCode}
        toName={headerInfo.toName}
        toFlag={headerInfo.toFlag}
        count={liveCount}
        navigate={navigate}
      />

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-4xl">{headerInfo.fromFlag}</span>
            <ArrowRight className="w-6 h-6 text-slate-400" />
            <span className="text-4xl">{headerInfo.toFlag}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isJa ? `${headerInfo.fromName}から${headerInfo.toName}への渡航ビザ` : headerInfo.title}
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            {isJa ? 'ステップ 1/2: 渡航目的を選択して公式ビザ一覧を確認' : 'Step 1 of 2: Select your primary purpose of travel below to see all official visa options.'}
          </p>
          <div className="mt-2 text-center text-xs text-blue-600 font-semibold">
            {headerInfo.fromFlag} {headerInfo.fromName} → {headerInfo.toFlag} {headerInfo.toName} • {liveCount} Visa Types
          </div>
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

  const fromName = getCountryDisplayName(fromCode);
  const toName = getCountryDisplayName(toCode);
  const fromFlag = getCountryFlag(fromCode);
  const toFlag = getCountryFlag(toCode);
  const fromCountry = { name: fromName, flag: fromFlag, code: fromCode };
  const toCountry = { name: toName, flag: toFlag, code: toCode };

  const isJpToIn = fromCode === 'JP' && toCode === 'IN';
  const categoryVisas = isJpToIn 
    ? ((JP_TO_IN_VISA["IN"] as any)?.[category] || []) 
    : getVisasByCategoryFixed(toCode, category);

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'legacy'>('all');
  const [regionalFilter, setRegionalFilter] = useState<'all' | 'regional' | 'dama' | '491-sn-fs' | '494-es-la' | '191-pathways' | '417-462-ext'>('all');
  const [usTypeFilter, setUsTypeFilter] = useState<'all' | 'official-visas' | 'programmes' | 'eb5-tea' | 'humanitarian' | 'travel-auth'>('all');
  const [caTypeFilter, setCaTypeFilter] = useState<'all' | 'official-visas' | 'programmes' | 'communities' | 'forms'>('all');
  const [showRegionalOverview, setShowRegionalOverview] = useState<boolean>(false);

  useEffect(() => {
    setRegionalFilter('all');
    setUsTypeFilter('all');
    setCaTypeFilter('all');
  }, [toCode, category]);

  const sortedVisas = [...categoryVisas].sort((a: any, b: any) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    if (a.highlight && !b.highlight) return -1;
    if (!a.highlight && b.highlight) return 1;
    return 0;
  });

  const displayedVisas = sortedVisas.filter((v: any) => {
    if (statusFilter === 'active' && v.isActive === false) return false;
    if (statusFilter === 'legacy' && v.isLegacy !== true) return false;

    if (toCode === 'US' && usTypeFilter !== 'all') {
      if (usTypeFilter === 'official-visas') {
        return v.isVisa !== false;
      }
      if (usTypeFilter === 'programmes') {
        return v.isVisa === false;
      }
      if (usTypeFilter === 'eb5-tea') {
        return v.programmeCategory === 'EB-5 Set-Aside' || v.programmeCategory === 'EB-5 USCIS Form' || v.programmeCategory === 'Regional Equivalent Programme';
      }
      if (usTypeFilter === 'humanitarian') {
        return v.programmeCategory === 'Humanitarian & Relief Programme';
      }
      if (usTypeFilter === 'travel-auth') {
        return v.programmeCategory === 'Travel Authorization';
      }
    }

    if (toCode === 'CA' && caTypeFilter !== 'all') {
      if (caTypeFilter === 'official-visas') return v.isVisa !== false;
      if (caTypeFilter === 'programmes') return v.directoryGroup === 'Directory 2: Immigration Programmes & Pathways';
      if (caTypeFilter === 'communities') return v.record_type === 'REGIONAL_LOCATION';
      if (caTypeFilter === 'forms') return v.record_type === 'FORM';
    }

    if (toCode === 'AU' && regionalFilter !== 'all') {
      const code = String(v.officialCode || v.code || '');
      if (regionalFilter === 'regional') {
        return Boolean(v.regionalCategory || v.regionalPathways || v.damaPathways);
      }
      if (regionalFilter === 'dama') {
        return Boolean(v.damaPathways && v.damaPathways.length > 0);
      }
      if (regionalFilter === '491-sn-fs') {
        return code === '491';
      }
      if (regionalFilter === '494-es-la') {
        return code === '494';
      }
      if (regionalFilter === '191-pathways') {
        return code === '191' || code === '887' || code === '489' || code === '187';
      }
      if (regionalFilter === '417-462-ext') {
        return ['417', '462', '485'].includes(code);
      }
    }
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

      {/* Phase 1.5: 8 Live Features + Booking.com Hotel Hero */}
      <CountryLiveHero
        fromCode={fromCode}
        toCode={toCode}
        toName={toCountry.name}
        toFlag={toCountry.flag}
        count={getLiveVisaCount(toCode)}
      />

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
        {(toCode === 'AU' || toCode === 'US' || toCode === 'CA' || toCode === 'GB' || toCode === 'AE') && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200">
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

        {/* UAE Dual-Authority & Exhaustive 135 Architecture Banner */}
        {toCode === 'AE' && (
          <div className="mt-4 p-5 bg-gradient-to-r from-cyan-50 via-blue-50/70 to-indigo-50 border border-cyan-200 rounded-2xl space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-extrabold text-cyan-950 flex items-center gap-2">
                <span>🇦🇪</span>
                <span>UAE 135 Exhaustive Architecture: GDRFA Dubai vs ICP Federal + Mainland vs Free Zone</span>
              </span>
              <span className="bg-cyan-800 text-white font-bold px-2.5 py-0.5 rounded text-[11px]">
                135 Unique UAE Entries (Tourist 28, Work 32, Business 18, Student 5, Family 14, PR/Golden/Green/Medical/Retirement/Procedural 38)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
              <div className="bg-white p-3 rounded-xl border border-cyan-200">
                <strong className="block text-cyan-900 font-bold mb-1">🏛️ Dual-Authority System:</strong>
                GDRFA Dubai (Dubai) vs ICP Smart Services (Federal Authority for Abu Dhabi, Sharjah, Ajman, UAQ, RAK, Fujairah).
              </div>
              <div className="bg-white p-3 rounded-xl border border-cyan-200">
                <strong className="block text-blue-900 font-bold mb-1">💼 Mainland vs Free Zone:</strong>
                3,000+ Free Zones (DMCC, JAFZA, DAFZA, DIFC, ADGM, RAKEZ, etc.) share uniform visa structures (Free Zone Employment / Investor). Do not duplicate per zone.
              </div>
              <div className="bg-white p-3 rounded-xl border border-cyan-200">
                <strong className="block text-indigo-900 font-bold mb-1">⭐ Golden & Green Visas:</strong>
                10-Year Golden (Property AED 2M+, Public 2M, Entrepreneur 500k, Executive 30k, Talent, Scientist, Doctor, Humanitarian, Students) & 5-Year Green (Skilled 15k, Freelance 250k).
              </div>
            </div>
          </div>
        )}

        {/* Australia Regional Migration Filter Chips & 7-Category Guide */}
        {toCode === 'AU' && (
          <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 via-emerald-50/70 to-blue-50 border border-teal-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌄</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-teal-950">
                    {REGIONAL_MIGRATION_INFO.title} — Sub-Pathway Filter (AUS-REG-01 to AUS-REG-07)
                  </h3>
                  <p className="text-[11px] text-teal-800">
                    Main regional visas: <strong>491, 494, 191</strong> · Related pathways: <strong>DAMA (482/494/186), 485 Regional, 417/462 Extensions</strong> · Legacy: <strong>489, 887, 187</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRegionalOverview(!showRegionalOverview)}
                className="px-3 py-1.5 bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              >
                {showRegionalOverview ? 'Hide 7 Regional Categories ▲' : 'View 7 Regional Categories & Postcodes ▼'}
              </button>
            </div>

            {/* Regional Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                onClick={() => setRegionalFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  regionalFilter === 'all' ? 'bg-teal-900 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setRegionalFilter('regional')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  regionalFilter === 'regional' ? 'bg-teal-800 text-white shadow-xs' : 'bg-white text-teal-900 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                🌄 Regional Migration ({categoryVisas.filter((v: any) => Boolean(v.regionalCategory || v.regionalPathways || v.damaPathways)).length})
              </button>
              <button
                onClick={() => setRegionalFilter('dama')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  regionalFilter === 'dama' ? 'bg-teal-800 text-white shadow-xs' : 'bg-white text-teal-900 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                🤝 DAMA (482 / 494 / 186)
              </button>
              <button
                onClick={() => setRegionalFilter('491-sn-fs')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  regionalFilter === '491-sn-fs' ? 'bg-teal-800 text-white shadow-xs' : 'bg-white text-teal-900 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                🏛️ 491 State vs Family
              </button>
              <button
                onClick={() => setRegionalFilter('494-es-la')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  regionalFilter === '494-es-la' ? 'bg-teal-800 text-white shadow-xs' : 'bg-white text-teal-900 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                🚜 494 Employer vs Labour Agreement
              </button>
              <button
                onClick={() => setRegionalFilter('191-pathways')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  regionalFilter === '191-pathways' ? 'bg-teal-800 text-white shadow-xs' : 'bg-white text-teal-900 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                🏠 191 Pathways & Legacy (489/887/187)
              </button>
              <button
                onClick={() => setRegionalFilter('417-462-ext')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  regionalFilter === '417-462-ext' ? 'bg-teal-800 text-white shadow-xs' : 'bg-white text-teal-900 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                🎒 417/462 & 485 Extensions
              </button>
            </div>

            {/* Expandable 7-Category Regional Overview */}
            {showRegionalOverview && (
              <div className="pt-3 border-t border-teal-200/80 space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {REGIONAL_MIGRATION_INFO.mainCategories.map((catItem) => (
                    <div key={catItem.code} className="bg-white p-3 rounded-xl border border-teal-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-black text-[11px] bg-teal-900 text-white px-2 py-0.5 rounded">
                          {catItem.code}
                        </span>
                        <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          Subclass {catItem.subclass}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900">{catItem.name}</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{catItem.summary}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-white p-3 rounded-xl border border-teal-200">
                  <div>
                    <span className="font-bold text-teal-950 block">📍 Category 2 – Cities & Major Regional Centres:</span>
                    <p className="text-[11px] text-slate-700 mt-0.5">{REGIONAL_MIGRATION_INFO.regionalAreas.category2}</p>
                  </div>
                  <div>
                    <span className="font-bold text-teal-950 block">🗺️ Category 3 – Regional Centres & Other Regional Areas:</span>
                    <p className="text-[11px] text-slate-700 mt-0.5">{REGIONAL_MIGRATION_INFO.regionalAreas.category3}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* USA Regional Clarification & Official Visa vs Programme Filter Bar */}
        {toCode === 'US' && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-slate-50 border border-blue-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇺🇸</span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0B3D91]">
                    USA Visa Classifications (164 Official Visas) vs Immigration Programmes, Set-Asides & Travel Authorizations (37 Entries)
                  </h3>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  <strong>Clarification:</strong> USA mein Australia jaisa Regional Migration, Designated Regional Areas/Postcodes ya DAMA visa system nahi hai. Ye Australian programmes hain. USA mein iske closest concepts <strong>EB-5 Targeted Employment Area (TEA: Rural / High-Unemployment / Infrastructure)</strong>, <strong>H-2A/H-2B labour certification areas</strong>, aur <strong>EB-5 Regional Center Programme</strong> hain — ye alag visa subclasses nahi hain, balki investment set-aside, geographical designation, ya programme hain.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                onClick={() => setUsTypeFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  usTypeFilter === 'all' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                All Entries ({categoryVisas.length})
              </button>
              <button
                onClick={() => setUsTypeFilter('official-visas')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  usTypeFilter === 'official-visas' ? 'bg-[#0B3D91] text-white shadow-xs' : 'bg-white text-[#0B3D91] hover:bg-blue-100 border border-blue-200'
                }`}
              >
                🛂 Official Visa Classifications ({categoryVisas.filter((v: any) => v.isVisa !== false).length})
              </button>
              {categoryVisas.some((v: any) => v.isVisa === false) && (
                <button
                  onClick={() => setUsTypeFilter('programmes')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    usTypeFilter === 'programmes' ? 'bg-purple-800 text-white shadow-xs' : 'bg-white text-purple-900 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  📋 Non-Visa Programmes / Set-Asides / Forms ({categoryVisas.filter((v: any) => v.isVisa === false).length})
                </button>
              )}
              {categoryVisas.some((v: any) => v.programmeCategory === 'EB-5 Set-Aside' || v.programmeCategory === 'EB-5 USCIS Form' || v.programmeCategory === 'Regional Equivalent Programme') && (
                <button
                  onClick={() => setUsTypeFilter('eb5-tea')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    usTypeFilter === 'eb5-tea' ? 'bg-indigo-800 text-white shadow-xs' : 'bg-white text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
                  }`}
                >
                  🏛️ EB-5 TEA Set-Asides, Forms & Regional Equiv ({categoryVisas.filter((v: any) => v.programmeCategory === 'EB-5 Set-Aside' || v.programmeCategory === 'EB-5 USCIS Form' || v.programmeCategory === 'Regional Equivalent Programme').length})
                </button>
              )}
              {categoryVisas.some((v: any) => v.programmeCategory === 'Humanitarian & Relief Programme') && (
                <button
                  onClick={() => setUsTypeFilter('humanitarian')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    usTypeFilter === 'humanitarian' ? 'bg-teal-800 text-white shadow-xs' : 'bg-white text-teal-900 hover:bg-teal-100 border border-teal-200'
                  }`}
                >
                  🕊️ Humanitarian / Asylum / Refugee / Parole ({categoryVisas.filter((v: any) => v.programmeCategory === 'Humanitarian & Relief Programme').length})
                </button>
              )}
              {categoryVisas.some((v: any) => v.programmeCategory === 'Travel Authorization') && (
                <button
                  onClick={() => setUsTypeFilter('travel-auth')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    usTypeFilter === 'travel-auth' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-white text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  ✈️ ESTA / VWP Travel Authorizations ({categoryVisas.filter((v: any) => v.programmeCategory === 'Travel Authorization').length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Canada 2-Directory & Regional Communities Filter Bar */}
        {toCode === 'CA' && (
          <div className="mt-4 p-4 bg-red-50/80 border border-red-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇨🇦</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-red-950">
                    Canada 199 Complete Architecture — 2 Directories, Regional Communities & IRCC Forms
                  </h3>
                  <p className="text-[11px] text-red-900 leading-relaxed">
                    {CA_REGIONAL_WARNING_TEXT}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                onClick={() => setCaTypeFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  caTypeFilter === 'all' ? 'bg-red-900 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                All Entries ({categoryVisas.length})
              </button>
              <button
                onClick={() => setCaTypeFilter('official-visas')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  caTypeFilter === 'official-visas' ? 'bg-red-800 text-white shadow-xs' : 'bg-white text-red-900 hover:bg-red-100 border border-red-200'
                }`}
              >
                🛂 Directory 1: Official Visas ({categoryVisas.filter((v: any) => v.isVisa !== false).length})
              </button>
              <button
                onClick={() => setCaTypeFilter('programmes')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  caTypeFilter === 'programmes' ? 'bg-purple-800 text-white shadow-xs' : 'bg-white text-purple-900 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                📋 Directory 2: Programmes ({categoryVisas.filter((v: any) => v.directoryGroup === 'Directory 2: Immigration Programmes & Pathways').length})
              </button>
              <button
                onClick={() => setCaTypeFilter('communities')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  caTypeFilter === 'communities' ? 'bg-teal-800 text-white shadow-xs' : 'bg-white text-teal-900 hover:bg-teal-100 border border-teal-200'
                }`}
              >
                🌄 Regional Communities ({categoryVisas.filter((v: any) => v.record_type === 'REGIONAL_LOCATION').length})
              </button>
              <button
                onClick={() => setCaTypeFilter('forms')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  caTypeFilter === 'forms' ? 'bg-blue-800 text-white shadow-xs' : 'bg-white text-blue-900 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                📄 IRCC Forms ({categoryVisas.filter((v: any) => v.record_type === 'FORM').length})
              </button>
            </div>
          </div>
        )}

        {/* UK 222 Complete 2-Directory & Regional Sponsor Intelligence Banner */}
        {toCode === 'GB' && (
          <div className="mt-4 p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇬🇧</span>
              <h3 className="text-xs sm:text-sm font-extrabold text-indigo-950">
                UK 222 Complete Architecture — 111 Official UKVI Visas + 111 Additional Routes & Statutory Classifications
              </h3>
            </div>
            <p className="text-[11px] text-indigo-900 leading-relaxed">
              {UK_REGIONAL_WARNING_TEXT}
            </p>
          </div>
        )}
      </div>

      {/* Grid of Visa Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {displayedVisas.map((v: any) => {
          const prefixRegex = new RegExp(`^[a-z]{2,3}-to-${toCode.toLowerCase()}-${category}-`, 'i');
          const shortId = String(v.id || '').replace(prefixRegex, '');
          const targetRoute = /^in-to-/i.test(String(v.id || ''))
            ? `/${String(v.id).replace(/^in-to-/i, `${fromCode.toLowerCase()}-to-`)}`
            : `/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${category}-${shortId}`;
          return (
          <div
            key={v.id}
            onClick={() => navigate(targetRoute)}
            className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer bg-white flex flex-col justify-between group shadow-sm hover:shadow-md ${
              v.highlight ? 'border-[#0B3D91] ring-1 ring-[#0B3D91]' : 'border-slate-200 hover:border-[#0B3D91]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-3xl">{v.icon || '📄'}</span>
                  {v.officialCode && (
                    <span className="bg-blue-100 text-[#0B3D91] font-mono text-xs font-black px-2 py-0.5 rounded shadow-xs">
                      {toCode === 'AU' ? `Subclass ${v.officialCode}` : v.officialCode}
                    </span>
                  )}
                  {v.regionalCategory && (
                    <span className="bg-teal-100 text-teal-900 font-mono text-[10px] font-black px-2 py-0.5 rounded border border-teal-300">
                      {v.regionalCategory}
                    </span>
                  )}
                  {toCode === 'US' && (
                    v.isVisa === false ? (
                      <span className="bg-purple-100 text-purple-900 text-[10px] font-extrabold px-2 py-0.5 rounded border border-purple-300">
                        {v.programmeCategory || 'US Programme / Non-Visa'}
                      </span>
                    ) : (
                      <span className="bg-blue-50 text-[#0B3D91] text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                        Official Visa
                      </span>
                    )
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

              {/* Sub-pathway pills on Level 2 card for Australia Regional Migration */}
              {(v.regionalPathways || v.damaPathways) && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {v.regionalPathways?.map((rp: any) => (
                    <span
                      key={rp.code}
                      className="text-[10px] font-bold bg-teal-50 text-teal-900 border border-teal-200 px-2 py-0.5 rounded-md"
                      title={rp.name}
                    >
                      {rp.code}
                    </span>
                  ))}
                  {v.damaPathways && v.damaPathways.length > 0 && (
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-md">
                      DAMA (482/494/186)
                    </span>
                  )}
                </div>
              )}

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

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-bold text-[#0B3D91]">
              <span className="flex items-center gap-1">
                {isJa ? '必要書類と詳細を見る' : 'View Requirements & Docs'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const rawDocs = Array.isArray(v.docs)
                    ? v.docs
                    : typeof v.docs === 'string'
                    ? v.docs.split(/\+|\n|,/).map((s: string) => s.trim()).filter(Boolean)
                    : [];
                  generateChecklistPDF({
                    visaName: v.name,
                    countryName: toCountry.name,
                    countryCode: toCode,
                    fromCountryName: fromCountry.name,
                    fee: v.fee,
                    validity: v.validity,
                    processing: v.processing,
                    docs: rawDocs
                  });
                }}
                className="bg-[#0f172a] hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer shrink-0 transition-colors"
                title="Download Checklist PDF"
              >
                📄 PDF
              </button>
            </div>
          </div>
          );
        })}
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

const countryIndexCache = new Map<string, any[]>();

const getAllCountriesFromDB = () => {
  try {
    const base = (typeof window !== 'undefined' ? (window as any).BASE_COUNTRY_VISAS : null) || (typeof BASE_COUNTRY_VISAS !== 'undefined' ? BASE_COUNTRY_VISAS : {});
    const codes = Object.keys(base);
    if (codes.length === 0) return [];
    
    const cacheKey = 'all_countries_' + codes.length;
    if (countryIndexCache.has(cacheKey)) {
      return countryIndexCache.get(cacheKey)!;
    }

    const flagMap = FLAG_MAP_249;
    const nameMap = NAME_MAP_249;
    
    const all = codes.map(code => {
      const c = code.toLowerCase();
      const visas = base[c];
      let live = 0;
      if (Array.isArray(visas)) {
        live = visas.filter((v: any) => v.record_type !== "SUPPORTING_CLASSIFICATION" && v.record_type !== "LEGACY_VISA").length;
      } else if (visas && typeof visas === 'object') {
        live = Object.values(visas).flat().filter((v: any) => v && v.record_type !== "SUPPORTING_CLASSIFICATION" && v.record_type !== "LEGACY_VISA").length;
      }
      return { code: c.toUpperCase(), name: nameMap[c] || COUNTRY_NAME_MAP[c] || COUNTRY_NAMES[c] || c.toUpperCase(), flag: flagMap[c] || FLAG_MAP[c] || COUNTRY_FLAGS[c] || "🏳️", count: live };
    }).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

    countryIndexCache.set(cacheKey, all);
    return all;
  } catch (e) { 
    console.error(e); 
    return []; 
  }
};

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [countries, setCountries] = useState<Country[]>(FALLBACK_COUNTRIES);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(()=>{
    const interval = setInterval(()=>{
      const count = Object.keys((window as any).BASE_COUNTRY_VISAS || BASE_COUNTRY_VISAS || {}).length;
      if(count > 99){
        console.log("DB loaded with", count, "countries, forcing re-render");
        setForceUpdate(x => x + 1);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [detectedCountry, setDetectedCountry] = useState<Country | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<Country | null>(null);
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const localPub = localStorage.getItem('publishedGuides');
      if (localPub) {
        const parsed = JSON.parse(localPub);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeArticleCollections(DEFAULT_PUBLISHED_GUIDES, parsed);
        }
      }
    } catch {
      // ignore localStorage read errors
    }
    return mergeArticleCollections(DEFAULT_PUBLISHED_GUIDES);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve()
      .then(() => initializeFullVisaDatabase())
      .then(() => {
        const checkCount = Object.keys(BASE_COUNTRY_VISAS || {}).length;
        if (checkCount > 100) {
          if (isMounted) setIsHydrated(true);
        } else {
          setTimeout(() => {
            if (isMounted) setIsHydrated(true);
          }, 100);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

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
    return fetchWithRetry(url, options || {}, {
      retries: 4,
      initialDelay: 1000,
      maxDelay: 15000,
      backoffMultiplier: 2,
      backoffIncrement500: 1500,
      backoffIncrement503: 3000,
      timeoutMs: 30000,
      fallback
    });
  };

  useEffect(() => {
    const abortController = new AbortController();

    // 1. Cache-First Immediate Hydration: read localStorage + DEFAULT_PUBLISHED_GUIDES and update state synchronously
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
    } catch {
      // ignore localStorage read errors
    }

    const cachedHydrated = mergeArticleCollections(DEFAULT_PUBLISHED_GUIDES, parsedPub);
    setArticles(cachedHydrated);
    try {
      localStorage.setItem('publishedGuides', JSON.stringify(cachedHydrated));
    } catch {
      // ignore quota errors
    }

    // 2. Background Network Sync for Blogs: non-blocking request that updates state ONLY if remote payload has richer content
    void fetchWithRetry<Article[] | { published?: Article[] } | null>(
      '/api/articles',
      { signal: abortController.signal },
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
    )
      .then(remoteArticles => {
        if (abortController.signal.aborted || !remoteArticles) return;

        const serverList: Article[] = Array.isArray(remoteArticles)
          ? remoteArticles
          : Array.isArray((remoteArticles as any)?.published)
            ? (remoteArticles as any).published
            : [];

        if (serverList.length > 0 && hasRicherRemoteArticles(cachedHydrated, serverList)) {
          const finalArticles = mergeArticleCollections(DEFAULT_PUBLISHED_GUIDES, parsedPub, serverList);
          setArticles(finalArticles);
          try {
            localStorage.setItem('publishedGuides', JSON.stringify(finalArticles));
          } catch {
            // ignore quota errors
          }
        }
      })
      .catch(() => {});

    // 3. Fetch countries & visa types in parallel
    const loadMetadata = async () => {
      const [countriesData, visaData] = await Promise.all([
        fetchWithRetry<Country[]>(
          '/api/countries',
          { signal: abortController.signal },
          {
            retries: 4,
            initialDelay: 1000,
            maxDelay: 15000,
            backoffMultiplier: 2,
            backoffIncrement500: 1500,
            backoffIncrement503: 3000,
            timeoutMs: 30000,
            fallback: FALLBACK_COUNTRIES
          }
        ),
        fetchWithRetry<VisaType[]>(
          '/api/visa-types',
          { signal: abortController.signal },
          {
            retries: 4,
            initialDelay: 1000,
            maxDelay: 15000,
            backoffMultiplier: 2,
            backoffIncrement500: 1500,
            backoffIncrement503: 3000,
            timeoutMs: 30000,
            fallback: []
          }
        )
      ]);

      if (!abortController.signal.aborted) {
        if (Array.isArray(countriesData) && countriesData.length > 0) {
          const merged = deduplicateCountries([...FALLBACK_COUNTRIES, ...countriesData]);
          setCountries(merged);
        }
        if (Array.isArray(visaData)) {
          setVisaTypes(visaData);
        }
      }
    };

    void loadMetadata();

    return () => {
      abortController.abort();
    };
  }, []);

  const handleTriggerCron = async () => {
    setCronLoading(true);
    setCronResult(null);
    try {
      const data = await fetchWithRetry<any>('/api/cron', { method: 'POST' }, {
        retries: 4,
        initialDelay: 1000,
        maxDelay: 12000,
        backoffMultiplier: 2,
        timeoutMs: 30000,
        fallback: { success: false, drafts: [], message: 'Cron request failed after 4 retries' }
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
  const isBlogs = currentPath === '/blogs' || currentPath === '/blogs/';
  const interviewMatch = currentPath.match(/^\/interview-prep\/([a-z]{2,3})$/i);
  const isContact = currentPath === '/contact';
  const isPrivacy = currentPath === '/privacy';
  const isTerms = currentPath === '/terms';
  const isSitemap = currentPath === '/sitemap';
  const isAudit = currentPath === '/audit';
  const isVerification = currentPath === '/verification';

  // 1. Level 1: /in-to-us or /us-visa
  const shortCountryMatch = currentPath.match(/^\/([a-z]{2,3})-visa$/i);
  const isLevel1Match =
    currentPath.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})$/i) ||
    (shortCountryMatch ? [shortCountryMatch[0], 'in', shortCountryMatch[1]] : null);

  // 2. Level 2: /in-to-us-tourist, /in-to-us-work, etc.
  const isLevel2Match = currentPath.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})-(tourist|work|student|family|business|pr)$/i);

  // 3. Level 3: /in-to-us-tourist-b1b2 or /in-to-us-student
  const isLevel3Match = currentPath.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})-(tourist|work|student|family|business|pr)-([a-z0-9-]+)$/i) || 
                        (!isLevel2Match && currentPath.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})-([a-z0-9-]+)$/i));

  const cleanPathSlug = normalizeBlogSlug(currentPath);

  // 4. Published Blog Articles & Auto-Generated 249-Country Blogs
  const matchedBlogArticle = (() => {
    if (!cleanPathSlug) return undefined;
    const generated = findGeneratedBlogBySlug(cleanPathSlug);
    if (generated) return generated as unknown as Article;

    const fromState = articles.find((a: Article) => {
      const s = normalizeBlogSlug(a.slug);
      const r = normalizeBlogSlug((a as any).route);
      return s === cleanPathSlug || r === cleanPathSlug;
    });
    const fromDefault = findDefaultGuideMatch(cleanPathSlug);
    if (fromState || fromDefault) {
      return hydrateArticleWithCacheAndFallback(fromState || { slug: cleanPathSlug }, fromDefault) || fromState || fromDefault;
    }
    return undefined;
  })();

  const isBlogMatch = !isHome && !isAdmin && !isBlogs && !interviewMatch && !isAudit && !isContact && !isPrivacy && !isTerms && !isSitemap && !isVerification && 
    !isLevel1Match && !isLevel2Match && !isLevel3Match && (
      Boolean(matchedBlogArticle) || (
        cleanPathSlug.includes('guide') || cleanPathSlug.includes('blog') || cleanPathSlug.includes('visa')
      )
    );

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold tracking-tight">Loading Global Visa Portal...</h2>
        <p className="text-sm text-slate-400 mt-2">Hydrating 249 ISO Countries & 14,084+ Live Visas</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900 font-sans">
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
            <button onClick={() => navigate('/blogs')} className={`transition-colors cursor-pointer ${isBlogs ? 'text-white font-bold' : 'hover:text-white'}`}>📝 Blogs (2,490+)</button>
            <button onClick={() => navigate('/interview-prep/us')} className={`transition-colors cursor-pointer ${interviewMatch ? 'text-white font-bold' : 'hover:text-white'}`}>🎤 Interview Prep</button>
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
            <button onClick={() => { navigate('/blogs'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-blue-100 hover:text-white font-medium">📝 Visa Blogs (2,490+)</button>
            <button onClick={() => { navigate('/interview-prep/us'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-blue-100 hover:text-white font-medium">🎤 Consular Interview Prep</button>
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
        ) : isBlogs ? (
          <BlogsPage navigate={navigate} />
        ) : interviewMatch ? (
          <InterviewPrepFull countryCode={interviewMatch[1]} onNavigate={navigate} />
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
        ) : isLevel1Match ? (
          <VisaCategorySelectionView 
            match={isLevel1Match} 
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
        ) : isBlogMatch ? (
          <BlogArticleView 
            article={matchedBlogArticle} 
            pathSlug={cleanPathSlug}
            articles={articles}
            countries={countries} 
            navigate={navigate} 
          />
        ) : (
          <HomeView 
            countries={deduplicateCountries(countries)} 
            detectedCountry={detectedCountry}
            selectedOrigin={selectedOrigin}
            setSelectedOrigin={setSelectedOrigin}
            articles={articles}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            navigate={navigate}
            forceUpdate={forceUpdate}
          />
        )}
      </main>

      {/* Phase 4 Tool 2: Floating 249-Country Visa Assistant Chatbot */}
      <VisaChatbot onNavigate={navigate} />

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
              <li><button onClick={() => navigate('/blogs')} className="hover:text-white transition-colors cursor-pointer">Visa Blogs (2,490+ Guides)</button></li>
              <li><button onClick={() => navigate('/interview-prep/us')} className="hover:text-white transition-colors cursor-pointer">Consular Interview Prep</button></li>
              <li><button onClick={() => navigate('/contact')} className="hover:text-white transition-colors cursor-pointer">Contact Us</button></li>
              <li><button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</button></li>
              <li><button onClick={() => navigate('/sitemap')} className="hover:text-blue-300 font-semibold text-blue-400 transition-colors cursor-pointer">Sitemap (14000+ Pages)</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm tracking-wide">Official Contact & Info</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:contact@visaapply.org" className="text-blue-400 font-semibold hover:underline">contact@visaapply.org</a></li>
              <li className="text-xs text-slate-500">14,084+ Visa & Programme Guides across 249 Destination Countries</li>
              <li><button onClick={() => navigate('/admin')} className="hover:text-white text-xs text-slate-400 transition-colors cursor-pointer">Admin Portal Access</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} VisaApply.org. All rights reserved. 14,084+ Visa & Programme Guides across 249 Destination Countries. Contact: <a href="mailto:contact@visaapply.org" className="text-blue-400 hover:underline">contact@visaapply.org</a></p>
          <p className="text-blue-400 font-medium">Official Email: <a href="mailto:contact@visaapply.org" className="hover:underline font-bold">contact@visaapply.org</a></p>
        </div>
      </footer>
    </div>
  );
}

// ----------------------------------------------------
// Helper Function: Deduplicate Countries by Code (Map/Set)
// Ensures top 12 popular destinations appear first in screenshot order
// ----------------------------------------------------
const PRIORITY_COUNTRY_ORDER = [
  "US", "CA", "GB", "AU", "AE", "DE", "SG", "TH", "SC", "JP", "IN", "FR"
];

export function deduplicateCountries(countryList: Country[]): Country[] {
  const countryMap = new Map<string, Country>();
  const dbCodes = Object.keys(BASE_COUNTRY_VISAS || {});
  const baseFromDb: Country[] = dbCodes.map(code => {
    const norm = code.trim().toUpperCase();
    const finalNorm = (norm === "EU" || norm === "SCH" || norm === "SCHENGEN") ? "SC" : (norm === "UK" ? "GB" : norm);
    return {
      code: finalNorm,
      name: getCountryFullName(finalNorm),
      flag: getCountryFlag(finalNorm)
    };
  });

  const combined = [...FALLBACK_COUNTRIES, ...baseFromDb, ...(countryList || [])];
  for (const country of combined) {
    if (!country || !country.code) continue;
    const rawCode = country.code.trim().toUpperCase();
    const normalizedCode = (rawCode === "EU" || rawCode === "SCH" || rawCode === "SCHENGEN") ? "SC" : (rawCode === "UK" ? "GB" : rawCode);
    if (!countryMap.has(normalizedCode)) {
      countryMap.set(normalizedCode, {
        ...country,
        code: normalizedCode,
        name: getCountryFullName(normalizedCode),
        flag: getCountryFlag(normalizedCode)
      });
    }
  }
  const allUnique = Array.from(countryMap.values());
  return allUnique.sort((a, b) => {
    const idxA = PRIORITY_COUNTRY_ORDER.indexOf(a.code);
    const idxB = PRIORITY_COUNTRY_ORDER.indexOf(b.code);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}



// ----------------------------------------------------
// Home View Component
// ----------------------------------------------------
function HomeView({ countries, detectedCountry, selectedOrigin, setSelectedOrigin, articles, searchQuery, setSearchQuery, navigate, forceUpdate }: any) {
  const [targetSearch, setTargetSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeContinent, setActiveContinent] = useState<string>('all');
  const [visaTypeFilter, setVisaTypeFilter] = useState<string>('All Visa Types');
  const [processingFilter, setProcessingFilter] = useState<string>('Any Processing Time');
  const [hotelFilter, setHotelFilter] = useState<string>('Any Hotel Price');
  const [sortBy, setSortBy] = useState<string>('Sort by Visa Count (High to Low)');
  const [compareCodes, setCompareCodes] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState<boolean>(false);

  const toggleCompareCountry = (code: string) => {
    const norm = code.toLowerCase();
    setCompareCodes((prev) => {
      if (prev.includes(norm)) {
        const next = prev.filter((c) => c !== norm);
        if (next.length === 0) setShowComparison(false);
        return next;
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), norm];
      }
      return [...prev, norm];
    });
  };

  const dynamicCountries = useMemo(() => {
    const dbList = getAllCountriesFromDB();
    if (dbList.length > 0) return dbList;
    return countries;
  }, [forceUpdate, countries]);

  const uniqueCountries = deduplicateCountries(dynamicCountries);

  // Advanced match helper across 9 metadata fields + reason badge
  const getCountrySearchMatch = (c: Country, rawQuery: string): { matched: boolean; reason: string } => {
    const q = (rawQuery || '').trim().toLowerCase();
    if (!q) return { matched: true, reason: '' };

    const fullName = getCountryFullName(c.code);
    const meta = getCountryMeta(c.code);
    const contKey = getContinentForCountry(c.code);
    const contLabel = CONTINENT_MAP_249[contKey]?.label || contKey;
    const isSchengen = CONTINENT_MAP_249.europe?.subregions?.schengen?.includes(c.code.toLowerCase());

    if (fullName.toLowerCase().includes(q) || c.code.toLowerCase() === q) {
      return { matched: true, reason: `${meta.capital} • ${getLiveVisaCount(c.code)} Visas` };
    }
    if (meta.capital.toLowerCase().includes(q)) {
      return { matched: true, reason: `Capital: ${meta.capital}` };
    }
    if (q.includes('schengen') && (isSchengen || meta.processing.toLowerCase().includes('schengen'))) {
      return { matched: true, reason: `Schengen Zone • ${meta.processing}` };
    }
    if (meta.processing.toLowerCase().includes(q)) {
      return { matched: true, reason: `Processing: ${meta.processing}` };
    }
    if (meta.language.toLowerCase().includes(q)) {
      return { matched: true, reason: `Language: ${meta.language}` };
    }
    if (meta.currency.toLowerCase().includes(q) || meta.currencySymbol.toLowerCase().includes(q)) {
      return { matched: true, reason: `Currency: ${meta.currency} (${meta.currencySymbol})` };
    }
    if (contLabel.toLowerCase().includes(q) || contKey.toLowerCase().includes(q)) {
      return { matched: true, reason: `Continent: ${contLabel}` };
    }
    if (meta.bestTime.toLowerCase().includes(q)) {
      return { matched: true, reason: `Best Time: ${meta.bestTime}` };
    }
    if (meta.topJobs.toLowerCase().includes(q)) {
      return { matched: true, reason: `Top Jobs: ${meta.topJobs}` };
    }
    if (meta.topUnis.toLowerCase().includes(q)) {
      return { matched: true, reason: `Universities: ${meta.topUnis}` };
    }
    return { matched: false, reason: '' };
  };

  const searchSuggestions = useMemo(() => {
    const q = targetSearch.trim();
    if (!q) return [];
    const matches: { country: Country; reason: string }[] = [];
    for (const c of uniqueCountries) {
      const m = getCountrySearchMatch(c, q);
      if (m.matched) {
        matches.push({ country: c, reason: m.reason });
        if (matches.length >= 12) break;
      }
    }
    return matches;
  }, [uniqueCountries, targetSearch]);

  const filteredCountries = useMemo(() => {
    const list = uniqueCountries.filter((c: Country) => {
      const searchMatch = getCountrySearchMatch(c, targetSearch).matched;
      if (!searchMatch) return false;

      const matchesContinent = isCountryInContinent(c.code, activeContinent);
      if (!matchesContinent) return false;

      const meta = getCountryMeta(c.code);
      const procLower = meta.processing.toLowerCase();
      const isSchengen = CONTINENT_MAP_249.europe?.subregions?.schengen?.includes(c.code.toLowerCase());

      // Visa Type Smart Filter
      if (visaTypeFilter === 'e-Visa Only' && !procLower.includes('e-visa') && !procLower.includes('e-voa')) {
        return false;
      }
      if (visaTypeFilter === 'Visa Free' && !procLower.includes('free') && !procLower.includes('instant')) {
        return false;
      }
      if (visaTypeFilter === 'VOA' && !procLower.includes('voa') && !procLower.includes('arrival')) {
        return false;
      }
      if (visaTypeFilter === 'Schengen' && !isSchengen && !procLower.includes('schengen')) {
        return false;
      }

      // Processing Time Smart Filter
      const procDays = parseProcessingDays(meta.processing);
      if (processingFilter === '1-3 Days' && procDays > 3) return false;
      if (processingFilter === '3-5 Days' && (procDays < 3 || procDays > 5)) return false;
      if (processingFilter === '15 Days' && (procDays < 10 || procDays > 16)) return false;
      if (processingFilter === '20-30 Days' && procDays < 18) return false;

      // Hotel Price Smart Filter
      const hotelNum = parseHotelPriceUSD(meta.hotelPrice);
      if (hotelFilter === 'Under $50/night' && hotelNum > 50) return false;
      if (hotelFilter === '$50-$100' && (hotelNum < 50 || hotelNum > 100)) return false;
      if (hotelFilter === '$100-$150' && (hotelNum < 100 || hotelNum > 150)) return false;
      if (hotelFilter === '$150+' && hotelNum < 140) return false;

      return true;
    });

    const sorted = [...list];
    if (sortBy === 'Sort by Visa Count (High to Low)') {
      sorted.sort((a, b) => getLiveVisaCount(b.code) - getLiveVisaCount(a.code));
    } else if (sortBy === 'Sort by Hotel Price (Low to High)') {
      sorted.sort((a, b) => parseHotelPriceUSD(getCountryMeta(a.code).hotelPrice) - parseHotelPriceUSD(getCountryMeta(b.code).hotelPrice));
    } else if (sortBy === 'Sort by Processing Time (Fast to Slow)') {
      sorted.sort((a, b) => parseProcessingDays(getCountryMeta(a.code).processing) - parseProcessingDays(getCountryMeta(b.code).processing));
    } else if (sortBy === 'Sort by Success Rate (High to Low)') {
      sorted.sort((a, b) => parseSuccessRateNum(getCountryMeta(b.code).successRate) - parseSuccessRateNum(getCountryMeta(a.code).successRate));
    } else if (sortBy === 'Sort by Name A-Z') {
      sorted.sort((a, b) => getCountryFullName(a.code).localeCompare(getCountryFullName(b.code)));
    }
    return sorted;
  }, [uniqueCountries, targetSearch, activeContinent, visaTypeFilter, processingFilter, hotelFilter, sortBy]);

  const continentTabs = useMemo(() => [
    { key: 'all', label: 'All', icon: '🌍', count: uniqueCountries.length },
    { key: 'europe', label: 'Europe', icon: '🇪🇺', count: uniqueCountries.filter((c: Country) => isCountryInContinent(c.code, 'europe')).length },
    { key: 'asia', label: 'Asia', icon: '🌏', count: uniqueCountries.filter((c: Country) => isCountryInContinent(c.code, 'asia')).length },
    { key: 'middle_east', label: 'Middle East', icon: '🕌', count: uniqueCountries.filter((c: Country) => isCountryInContinent(c.code, 'middle_east')).length },
    { key: 'africa', label: 'Africa', icon: '🌍', count: uniqueCountries.filter((c: Country) => isCountryInContinent(c.code, 'africa')).length },
    { key: 'north_america', label: 'North America', icon: '🌎', count: uniqueCountries.filter((c: Country) => isCountryInContinent(c.code, 'north_america')).length },
    { key: 'south_america', label: 'South America', icon: '🌎', count: uniqueCountries.filter((c: Country) => isCountryInContinent(c.code, 'south_america')).length },
    { key: 'oceania', label: 'Oceania', icon: '🌊', count: uniqueCountries.filter((c: Country) => isCountryInContinent(c.code, 'oceania')).length }
  ], [uniqueCountries]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).getContinent = getContinentForCountry;
      (window as any).CONTINENT_MAP = CONTINENT_MAP_249;
      (window as any).filterCountries = (val: string) => setTargetSearch(val);
    }
  }, [uniqueCountries]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#0B3D91] to-[#072a68] text-white py-14 px-4 sm:px-6 lg:px-8">
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
                  const found = uniqueCountries.find((c: Country) => c.code === e.target.value);
                  if (found) setSelectedOrigin(found);
                }}
                className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
              >
                {uniqueCountries.map((c: Country) => (
                  <option key={c.code} value={c.code}>{getCountryFlag(c.code)} {getCountryFullName(c.code)}</option>
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

      {/* All Global Destinations Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Phase 3 Tool 1: 30-Sec Visa Eligibility Checker on Homepage */}
        <EligibilityChecker
          showDestinationPicker={true}
          defaultFromCode={selectedOrigin?.code || 'IN'}
          onNavigate={navigate}
        />

        {/* Phase 3 Tool 2: Side-by-Side Visa Comparison View */}
        {showComparison && compareCodes.length > 0 && (
          <div id="visa-comparison-section" className="scroll-mt-24">
            <VisaComparison
              selectedCodes={compareCodes}
              onRemoveCountry={(code) => toggleCompareCountry(code)}
              onAddCountry={(code) => toggleCompareCountry(code)}
              onClose={() => setShowComparison(false)}
              onNavigate={navigate}
              fromCode={selectedOrigin?.code || 'IN'}
            />
          </div>
        )}

        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            All Global Destinations
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-2 font-normal">
            Explore visa options for {uniqueCountries.length} destinations • {uniqueCountries.length} flags • 14,084+ LIVE visas • World's largest visa portal
          </p>
        </div>

        {/* Phase 2 Step 1: Advanced Search Bar + Live Suggestions Dropdown */}
        <div className="max-w-[800px] mx-auto mb-6 relative">
          <div className="flex items-center bg-white border-2 border-[#e2e8f0] focus-within:border-[#3b82f6] rounded-2xl px-5 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-colors">
            <span className="text-xl mr-3">🔍</span>
            <input
              id="country-search"
              type="text"
              value={targetSearch}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
              onChange={(e) => {
                setTargetSearch(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search 249 countries, capitals, visas - e.g. USA, London, Schengen, e-Visa, 15 Days..."
              className="flex-1 border-none outline-none text-[15px] font-medium text-slate-900 bg-transparent"
            />
            {targetSearch && (
              <button
                type="button"
                onClick={() => setTargetSearch('')}
                className="mr-2 text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            )}
            <span className="bg-[#f1f5f9] px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#64748b] shrink-0">
              249 COUNTRIES
            </span>
          </div>

          {/* Search Suggestions Dropdown */}
          <div
            id="search-suggestions"
            className={`absolute top-full left-0 right-0 bg-white rounded-xl border border-[#e2e8f0] shadow-[0_12px_24px_rgba(0,0,0,0.1)] mt-2 max-h-[300px] overflow-y-auto z-20 ${
              showSuggestions && targetSearch.trim().length > 0 && searchSuggestions.length > 0 ? 'block' : 'hidden'
            }`}
          >
            {searchSuggestions.map(({ country, reason }) => {
              const originCode = (selectedOrigin?.code || 'IN').toLowerCase();
              const destCode = country.code.toLowerCase();
              return (
                <button
                  key={country.code}
                  type="button"
                  onMouseDown={() => navigate(`/${originCode}-to-${destCode}`)}
                  className="w-full px-4 py-2.5 text-left hover:bg-blue-50/70 flex items-center justify-between border-b border-slate-100 last:border-0 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{getCountryFlag(country.code)}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {getCountryFullName(country.code)}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{reason}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#2563eb] bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">
                    {getLiveVisaCount(country.code)} Visas →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phase 2 Step 2: Smart Filters & Sort Bar */}
        <div className="flex gap-2 flex-wrap mb-5 justify-center">
          <select
            id="filter-visa-type"
            value={visaTypeFilter}
            onChange={(e) => setVisaTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-[10px] border border-[#e2e8f0] bg-white text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option>All Visa Types</option>
            <option>e-Visa Only</option>
            <option>Visa Free</option>
            <option>VOA</option>
            <option>Schengen</option>
          </select>

          <select
            id="filter-processing"
            value={processingFilter}
            onChange={(e) => setProcessingFilter(e.target.value)}
            className="px-3 py-2 rounded-[10px] border border-[#e2e8f0] bg-white text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option>Any Processing Time</option>
            <option>1-3 Days</option>
            <option>3-5 Days</option>
            <option>15 Days</option>
            <option>20-30 Days</option>
          </select>

          <select
            id="filter-hotel"
            value={hotelFilter}
            onChange={(e) => setHotelFilter(e.target.value)}
            className="px-3 py-2 rounded-[10px] border border-[#e2e8f0] bg-white text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
          >
            <option>Any Hotel Price</option>
            <option>Under $50/night</option>
            <option>$50-$100</option>
            <option>$100-$150</option>
            <option>$150+</option>
          </select>

          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-[10px] border border-[#3b82f6] text-xs font-bold bg-[#eff6ff] text-[#2563eb] cursor-pointer focus:outline-none"
          >
            <option>Sort by Visa Count (High to Low)</option>
            <option>Sort by Hotel Price (Low to High)</option>
            <option>Sort by Processing Time (Fast to Slow)</option>
            <option>Sort by Success Rate (High to Low)</option>
            <option>Sort by Name A-Z</option>
          </select>
        </div>

        {/* Continent Divide Filter Bar - Premium Design */}
        <div className="flex flex-wrap gap-2.5 justify-center p-5 bg-white rounded-2xl border border-[#e2e8f0] mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          {continentTabs.map((cont) => {
            const isActive = activeContinent === cont.key;
            return (
              <button
                key={cont.key}
                onClick={() => setActiveContinent(cont.key)}
                className={`px-[18px] py-2.5 rounded-[24px] border-2 text-[13px] font-bold cursor-pointer flex items-center gap-2 transition-all duration-200 ${
                  isActive
                    ? 'border-[#3b82f6] bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                    : 'border-[#f1f5f9] bg-white text-[#475569] hover:border-blue-200 hover:text-slate-900'
                }`}
              >
                <span className="text-base leading-none">{cont.icon}</span>
                <span>{cont.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-[10px] text-[11px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#475569]'
                  }`}
                >
                  {cont.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCountries.map((country: Country) => {
            const originCode = (selectedOrigin?.code || 'IN').toLowerCase();
            const destCode = country.code.toLowerCase();
            const isSelf = originCode === destCode;
            const liveCount = getLiveVisaCount(country.code);
            const flagEmoji = getCountryFlag(country.code);
            const flagUrl = getCountryFlagUrl(country.code);
            const fullName = getCountryFullName(country.code);
            const contKey = getContinentForCountry(country.code);
            const contLabel = CONTINENT_MAP_249[contKey]?.label || contKey;
            const meta = getCountryMeta(country.code);
            const liveLocal = getLiveLocalTime(meta.timeZone);

            return (
              <button
                key={country.code}
                disabled={isSelf}
                onClick={() => navigate(`/${originCode}-to-${destCode}`)}
                className={`group bg-white border rounded-[20px] p-4 text-left w-full flex flex-col gap-3 transition-all duration-300 ${
                  isSelf
                    ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50 shadow-none'
                    : 'border-[#e8edf3] cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:border-[#d0d7e3]'
                }`}
              >
                {/* Top Row - Flag + Name + Arrow */}
                <div className="flex items-center justify-between gap-2 w-full">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-[52px] h-[52px] min-w-[52px] rounded-[14px] bg-gradient-to-br from-[#f0f7ff] to-[#e0eaff] flex items-center justify-center text-[28px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] shrink-0">
                      <img
                        src={flagUrl}
                        alt={`${fullName} flag`}
                        loading="lazy"
                        className="w-9 h-6 object-cover rounded-sm shadow-2xs"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallbackEl = target.nextElementSibling as HTMLElement | null;
                          if (fallbackEl) fallbackEl.style.display = 'inline';
                        }}
                      />
                      <span className="text-[26px] hidden leading-none" aria-hidden="true">
                        {flagEmoji}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-[15px] text-[#0f172a] tracking-[-0.2px] truncate group-hover:text-[#0B3D91] transition-colors">
                        {fullName}
                      </div>
                      <div className="text-xs text-[#64748b] mt-1 flex items-center gap-1.5 flex-wrap">
                        {isSelf ? (
                          <span className="bg-slate-100 px-2 py-0.5 rounded-[10px] font-semibold text-slate-600">
                            Your Origin Country
                          </span>
                        ) : (
                          <>
                            <span className="bg-[#f1f5f9] px-2 py-0.5 rounded-[10px] font-semibold text-[#475569]">
                              {liveCount} Visas
                            </span>
                            <span className="text-[#94a3b8]">•</span>
                            <span className="truncate">{contLabel}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#f8fafc] group-hover:bg-blue-50 flex items-center justify-center text-[#94a3b8] group-hover:text-[#0B3D91] text-base font-bold shrink-0 transition-colors">
                    ›
                  </div>
                </div>

                {/* Middle Row - 2 Pill Badges (LIVE TIME + PROCESSING) */}
                <div className="flex gap-2 w-full">
                  <div className="flex-1 min-w-0 bg-[#f0fdf4] border border-[#dcfce7] rounded-xl px-2.5 py-2 flex items-center gap-1.5">
                    <span className="text-sm shrink-0">🕐</span>
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#15803d] font-bold leading-none tracking-tight">
                        LIVE TIME
                      </div>
                      <div className="text-xs text-[#166534] font-semibold mt-1 truncate">
                        {liveLocal.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 bg-[#fef3c7] border border-[#fde68a] rounded-xl px-2.5 py-2 flex items-center gap-1.5">
                    <span className="text-sm shrink-0">⏱</span>
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#92400e] font-bold leading-none tracking-tight">
                        PROCESSING
                      </div>
                      <div className="text-xs text-[#78350f] font-semibold mt-1 truncate">
                        {meta.processing}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row - Hotel Price with Booking.com Blue + Compare Button */}
                <div className="w-full bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] border border-[#bfdbfe] rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 shrink-0 bg-[#003580] rounded-lg flex items-center justify-center text-white text-sm font-extrabold">
                      B
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-[#1e40af] font-bold leading-none">
                        HOTEL FROM
                      </div>
                      <div className="text-[13px] text-[#1e3a8a] font-extrabold mt-0.5 truncate">
                        {meta.hotelPrice} • Booking.com
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isSelf && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompareCountry(destCode);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            toggleCompareCountry(destCode);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                          compareCodes.includes(destCode)
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-blue-200 hover:bg-blue-50'
                        }`}
                      >
                        {compareCodes.includes(destCode) ? '✓ Added' : '➕ Compare'}
                      </span>
                    )}
                    <div className="bg-[#003580] group-hover:bg-[#002860] text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shrink-0 transition-colors">
                      View →
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sticky Bottom Compare Bar when 2+ Countries Selected (or 1+ selected) */}
        {compareCodes.length >= 1 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-4 sm:px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 sm:gap-4 max-w-[95vw]">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <span>⚖️ Selected ({compareCodes.length}/3):</span>
              <div className="flex items-center gap-1.5">
                {compareCodes.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 bg-slate-800 border border-slate-600 px-2.5 py-1 rounded-lg text-xs"
                  >
                    <span>{getCountryFlag(c)}</span>
                    <span className="hidden sm:inline">{getCountryFullName(c)}</span>
                    <button
                      type="button"
                      onClick={() => toggleCompareCountry(c)}
                      className="text-slate-400 hover:text-white ml-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowComparison(true);
                setTimeout(() => {
                  document.getElementById('visa-comparison-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 80);
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer shrink-0 shadow-md transition-colors"
            >
              Compare {compareCodes.length} {compareCodes.length === 1 ? 'Country' : 'Countries'} →
            </button>
          </div>
        )}

        <div className="text-center text-xs sm:text-sm text-slate-500 mt-8 font-medium">
          Showing {filteredCountries.length} of {uniqueCountries.length} destinations • {activeContinent === 'all' ? 'All Continents' : (CONTINENT_MAP_249[activeContinent]?.label || activeContinent)} • Updated Oct 2026 • 249 ISO FULL
        </div>
      </section>

      {/* Phase 4 Tool 1: Featured 249-Country SEO Blogs Carousel */}
      <FeaturedBlogsCarousel navigate={navigate} />

      {/* Recent Published Visa Guides Section */}
      <section className="bg-slate-100 py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recently Published Visa Guides</h2>
              <p className="text-sm text-slate-500 mt-1">Verified official requirements, fees, and document checklists</p>
            </div>
            <button
              onClick={() => navigate('/blogs')}
              className="text-sm font-bold text-[#0B3D91] hover:underline cursor-pointer"
            >
              View All 2,490+ Blogs →
            </button>
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
              {articles.map((art: Article, idx: number) => {
                const targetSlug = normalizeBlogSlug(art.slug || (art as any).route || art.title);
                const preservedDate = (art as any).publishedDate || getPreservedPublishedDate(targetSlug, idx);
                return (
                <div 
                  key={targetSlug || idx}
                  onClick={() => navigate(`/${targetSlug}`)}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="uppercase bg-blue-50 text-[#0B3D91] px-2.5 py-1 rounded-md font-semibold">{art.type} visa</span>
                      <span>{preservedDate}</span>
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
                );
              })}
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

  const fromName = getCountryDisplayName(fromCode);
  const toName = getCountryDisplayName(toCode);
  const fromFlag = getCountryFlag(fromCode);
  const toFlag = getCountryFlag(toCode);
  const fromCountry = { name: fromName, flag: fromFlag, code: fromCode };
  const toCountry = { name: toName, flag: toFlag, code: toCode };

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
  const fromName = getCountryDisplayName(from);
  const toName = getCountryDisplayName(to);
  const fromCountry = { name: fromName, code: from.toUpperCase() };
  const toCountry = { name: toName, code: to.toUpperCase() };
  
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
  const [activePathwayTab, setActivePathwayTab] = useState<number>(0);

  useEffect(() => {
    setActivePathwayTab(0);
  }, [fromCode, toCode, categoryCode, subtypeCode]);

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

  // ===== CRITICAL FIX: Use robust retrieval to prevent blog fallback =====
  const getVisasFixed = (from: string, to: string, category: string): VisaItem[] => {
    const fromU = (from || '').toUpperCase();
    const fromL = (from || '').toLowerCase();
    const toU = (to || '').toUpperCase();
    const toL = (to || '').toLowerCase();
    const cat = (category || '').toLowerCase() as keyof CountryVisas;

    // 1. Try dual-access: from->to->category
    for (const f of [fromU, fromL]) {
      for (const t of [toU, toL]) {
        if (FULL_VISA_DB[f]?.[t]?.[cat]?.length > 0) {
          return FULL_VISA_DB[f][t][cat].filter((v: any) => v.record_type !== "SUPPORTING_CLASSIFICATION" && v.record_type !== "LEGACY_VISA");
        }
      }
    }

    // 2. Try base: to->category
    for (const t of [toU, toL]) {
      if (FULL_VISA_DB[t]?.[cat]?.length > 0) {
        return FULL_VISA_DB[t][cat].filter((v: any) => v.record_type !== "SUPPORTING_CLASSIFICATION" && v.record_type !== "LEGACY_VISA");
      }
    }

    // 3. Try BASE_COUNTRY_VISAS filtered by category
    for (const t of [toU, toL]) {
      const baseVisas = BASE_COUNTRY_VISAS[t];
      if (baseVisas && baseVisas[cat] && baseVisas[cat].length > 0) {
        return baseVisas[cat].filter(v => v.record_type !== "SUPPORTING_CLASSIFICATION" && v.record_type !== "LEGACY_VISA");
      }
    }

    // 4. Fallback to all live if category is empty
    for (const t of [toU, toL]) {
      const b: any = BASE_COUNTRY_VISAS[t];
      if (b) {
        const tourist = Array.isArray(b.tourist) ? b.tourist : (Array.isArray(b) ? b : []);
        const work = Array.isArray(b.work) ? b.work : [];
        const student = Array.isArray(b.student) ? b.student : [];
        const family = Array.isArray(b.family) ? b.family : [];
        const business = Array.isArray(b.business) ? b.business : [];
        const pr = Array.isArray(b.pr) ? b.pr : [];
        const allLive = [
          ...tourist,
          ...work,
          ...student,
          ...family,
          ...business,
          ...pr
        ].filter(v => v && v.record_type !== "SUPPORTING_CLASSIFICATION" && v.record_type !== "LEGACY_VISA");
        if (allLive.length > 0) return allLive;
      }
    }
    
    return [];
  };


  const categoryVisas = getVisasFixed(fromCode, toCode, categoryCode);
  const isJpToIn = fromCode === 'JP' && toCode === 'IN';
  const countryData = isJpToIn
    ? JP_TO_IN_VISA["IN"]
    : (FULL_VISA_DB[fromCode]?.[toCode] || FULL_VISA_DB[toCode] || BASE_COUNTRY_VISAS[toCode] || FULL_VISA_DB["US"]);
  
  // Find matching subtype visa in database (supports both short IDs like ukv-std and full IDs like in-to-gb-tourist-ukv-std, plus custom prefix routes like in-to-gb-reg-ukw-isl)
  const expectedFullId = `in-to-${toCode.toLowerCase()}-${categoryCode}-${subtypeCode}`;
  const directRouteId = `in-to-${toCode.toLowerCase()}-${subtypeCode}`;
  const cData: any = countryData;
  const allCountryVisasFlat: any[] = cData
    ? [
        ...(Array.isArray(cData.tourist) ? cData.tourist : (Array.isArray(cData) ? cData : [])),
        ...(Array.isArray(cData.work) ? cData.work : []),
        ...(Array.isArray(cData.student) ? cData.student : []),
        ...(Array.isArray(cData.family) ? cData.family : []),
        ...(Array.isArray(cData.business) ? cData.business : []),
        ...(Array.isArray(cData.pr) ? cData.pr : [])
      ]
    : [];

  const dbVisaItem =
    allCountryVisasFlat.find((v: any) => {
      const vid = String(v.id || '').toLowerCase();
      return vid === directRouteId || vid === expectedFullId || vid === subtypeCode;
    }) ||
    categoryVisas.find((v: any) => {
      const vid = String(v.id || '').toLowerCase();
      const vcode = String(v.officialCode || '').toLowerCase();
      return (
        vid === subtypeCode ||
        vid === expectedFullId ||
        vid === directRouteId ||
        vid.endsWith(`-${categoryCode}-${subtypeCode}`) ||
        vcode === subtypeCode
      );
    }) ||
    allCountryVisasFlat.find((v: any) => {
      const vid = String(v.id || '').toLowerCase();
      const vcode = String(v.officialCode || '').toLowerCase();
      return vcode === subtypeCode || vid.endsWith(`-${subtypeCode}`);
    }) ||
    categoryVisas.find((v: any) => String(v.id || '').toLowerCase().includes(subtypeCode)) ||
    categoryVisas[0];

  const resolvedCategoryCode = ['tourist', 'work', 'student', 'family', 'business', 'pr'].includes(categoryCode)
    ? categoryCode
    : (dbVisaItem?.categoryCode || dbVisaItem?.category || 'work');

  useEffect(() => {
    const sectionIds = [
      'section-overview',
      'section-subclass',
      'section-regional',
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
    const controller = new AbortController();
    let isMounted = true;
    if (dbVisaItem?.faq && Array.isArray(dbVisaItem.faq) && dbVisaItem.faq.length > 0) {
      setFaqs(dbVisaItem.faq);
      setFaqLoading(false);
    } else {
      setFaqLoading(true);
    }

    const queryUrl = `/api/faq?from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}&type=${encodeURIComponent(subtypeCode)}`;

    fetchWithRetry<{ success?: boolean; faqs?: any[] }>(
      queryUrl,
      { signal: controller.signal },
      {
        retries: 4,
        initialDelay: 1000,
        maxDelay: 12000,
        backoffMultiplier: 2,
        timeoutMs: 30000, // Increased from 6s to 30s to accommodate complex FAQ generations
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
      controller.abort();
    };
  }, [fromCode, toCode, subtypeCode, dbVisaItem]);

  useEffect(() => {
    setLoading(false);
    generateMetadata(window.location.pathname, [], null);
  }, [fromCode, toCode, categoryCode, subtypeCode]);

  if (loading) {
    return <ArticleSkeleton />;
  }

  const fromName = getCountryDisplayName(fromCode);
  const toName = getCountryDisplayName(toCode);
  const fromFlag = getCountryFlag(fromCode);
  const toFlag = getCountryFlag(toCode);
  const fromCountry = { name: fromName, flag: fromFlag, code: fromCode };
  const toCountry = { name: toName, flag: toFlag, code: toCode };

  const visaName = (isJa && dbVisaItem?.name_ja) ? dbVisaItem.name_ja : (dbVisaItem?.name || subtypeCode.toUpperCase());

  const guideTitle = isJa 
    ? `${fromCountry.name}から${toCountry.name}への${visaName} (2026年最新ガイド)`
    : `${fromCountry.name} to ${toCountry.name} ${visaName} (2026 Guide)`;

  const rawDocs = (isJa && dbVisaItem?.docs_ja) ? dbVisaItem.docs_ja : dbVisaItem?.docs;
  const docsList = Array.isArray(rawDocs) 
    ? rawDocs 
    : (typeof rawDocs === 'string' 
        ? rawDocs.split(/\+|\n|,/).map(s => s.trim()).filter(Boolean) 
        : [
            'Valid Passport (minimum 6 months validity)',
            'Completed Official Visa Application Form',
            'Passport-size photographs as per spec',
            'Bank Statements for past 6 months showing regular income',
            'Income Tax Return (ITR) / Tax assessment for past 2-3 years',
            'Proof of Accommodation / Hotel Booking',
            'Confirmed Travel Itinerary / Flight Ticket'
          ]);

  const rawInfoReq = (isJa && dbVisaItem?.infoReq_ja) ? dbVisaItem.infoReq_ja : dbVisaItem?.infoReq;
  const infoReqList = Array.isArray(rawInfoReq) 
    ? rawInfoReq 
    : (typeof rawInfoReq === 'string' 
        ? rawInfoReq.split(/\+|\n|,/).map(s => s.trim()).filter(Boolean) 
        : [
            'Full Name, DOB, Passport No, Issue & Expiry Date, Place of Issue',
            'Father, Mother & Spouse Full Names & Dates of Birth',
            'Host Address in Destination Country, Contact Name & Phone',
            'Employer / Company Name, Business Address, Job Title & Monthly Income',
            'Prior travel history to destination country, visa refusal dates & reasons',
            'Security, Health & Criminal Background Declarations'
          ]);

  const rawSteps = (isJa && dbVisaItem?.steps_ja) ? dbVisaItem.steps_ja : dbVisaItem?.steps;
  const stepsList = Array.isArray(rawSteps) 
    ? rawSteps 
    : (typeof rawSteps === 'string' 
        ? rawSteps.split(/\+|\n|,/).map(s => s.trim()).filter(Boolean) 
        : [
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
                onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${resolvedCategoryCode}`)} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-xs cursor-pointer transition-colors"
                title={`Back to ${resolvedCategoryCode} Visas`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline">Back to</span> <span className="capitalize">{resolvedCategoryCode}</span>
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
              <span className="capitalize text-[#0B3D91] shrink-0 font-bold">{resolvedCategoryCode}</span>
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
                  {toCode === 'AU' && (dbVisaItem?.regionalCategory || dbVisaItem?.regionalPathways || dbVisaItem?.damaPathways) && (
                    <option value="section-regional">🌄 2B. Regional Migration Pathways & Areas</option>
                  )}
                  {toCode === 'US' && <option value="section-subclass">🇺🇸 2. Official U.S. Visa Registry</option>}
                  {toCode === 'CA' && <option value="section-subclass">🇨🇦 2. Official IRCC Program Registry</option>}
                  {toCode === 'GB' && <option value="section-subclass">🇬🇧 2. Official GOV.UK UKVI Route Registry</option>}
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
        <span onClick={() => navigate(`/${fromCode.toLowerCase()}-to-${toCode.toLowerCase()}-${resolvedCategoryCode}`)} className="cursor-pointer hover:text-blue-600 capitalize">{resolvedCategoryCode}</span>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">{dbVisaItem?.name || subtypeCode.toUpperCase()}</span>
      </nav>

      {/* Phase 1.5: 8 Live Features + Booking.com Hotel Hero */}
      <CountryLiveHero
        fromCode={fromCode}
        toCode={toCode}
        toName={toCountry.name}
        toFlag={toCountry.flag}
        count={getLiveVisaCount(toCode)}
      />

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
              <span className="font-bold text-purple-800 text-sm mt-0.5 block">{dbVisaItem?.processing || '3-5 Weeks'}</span>
            </div>
          </div>

          {/* Phase 2 Step 4: Download Checklist PDF Button */}
          <div className="pt-3 flex justify-center">
            <button
              type="button"
              onClick={() =>
                generateChecklistPDF({
                  visaName,
                  countryName: toCountry.name,
                  countryCode: toCode,
                  fromCountryName: fromCountry.name,
                  fee: dbVisaItem?.fee || '$185',
                  validity: dbVisaItem?.validity || 'Up to 10 yrs',
                  processing: dbVisaItem?.processing || '3-5 Weeks',
                  docs: docsList,
                  steps: stepsList
                })
              }
              className="bg-[#0f172a] hover:bg-slate-800 text-white px-4 py-2.5 rounded-[10px] font-bold text-[13px] cursor-pointer transition-colors shadow-xs"
            >
              📄 Download Checklist PDF
            </button>
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

        {/* USA OFFICIAL VISA CLASSIFICATION & STATE DEPARTMENT / USCIS REGISTER STATUS */}
        {toCode === 'US' && (
          <div id="section-subclass" className={`p-4 rounded-xl border text-xs space-y-2.5 scroll-mt-28 ${
            dbVisaItem?.isVisa === false
              ? 'bg-purple-50 border-purple-300 text-purple-950'
              : dbVisaItem?.isLegacy
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-blue-50 border-blue-200 text-blue-950'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-current/20">
              <div className="flex items-center gap-2 font-bold text-sm flex-wrap">
                <span>🇺🇸</span>
                <span>
                  {dbVisaItem?.isVisa === false
                    ? `U.S. Immigration Programme / Pathway: ${dbVisaItem?.officialName || dbVisaItem?.name}`
                    : `U.S. Official Visa Classification: ${dbVisaItem?.officialName || dbVisaItem?.name}`}
                </span>
                {dbVisaItem?.officialCode && (
                  <span className="bg-[#0B3D91] text-white font-mono text-xs px-2 py-0.5 rounded font-black">
                    {dbVisaItem?.isVisa === false ? `Code ${dbVisaItem.officialCode}` : `Class ${dbVisaItem.officialCode}`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {dbVisaItem?.isVisa === false ? (
                  <span className="bg-purple-200 text-purple-950 font-bold px-2 py-0.5 rounded text-[11px]">
                    📋 {dbVisaItem?.programmeCategory || 'Non-Visa Programme / Set-Aside / Form'}
                  </span>
                ) : dbVisaItem?.isLegacy ? (
                  <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                    ⚠️ Legacy / Historical Visa Class
                  </span>
                ) : (
                  <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[11px]">
                    🟢 Official Active INA Visa Classification
                  </span>
                )}
                <a
                  href={dbVisaItem?.officialSource || "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/all-visa-categories.html"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline flex items-center gap-1 text-[11px] hover:opacity-80"
                >
                  <span>{dbVisaItem?.isVisa === false ? 'Official USCIS / DHS Portal' : 'State Department Directory'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {dbVisaItem?.isVisa === false && (
              <div className="p-2.5 bg-white/80 rounded-lg border border-purple-200 text-[11px] leading-relaxed">
                <strong>Important Distinction (Not a Standalone Visa Subclass):</strong> {dbVisaItem?.programmeNote || 'This entry is an official United States immigration programme, EB-5 reserved visa set-aside, USCIS petition form, humanitarian relief status, or visa-exempt travel authorization — it is NOT a standalone consular visa subclass.'}
              </div>
            )}

            {dbVisaItem?.isLegacy ? (
              <p className="leading-relaxed text-[11px]">
                <strong>Important Notice:</strong> {dbVisaItem?.programmeNote || `Classification ${dbVisaItem?.officialCode || subtypeCode} is a historical, legacy, or sunset category under the Immigration and Nationality Act (INA), not active for new general filings.`}
              </p>
            ) : (
              <p className="leading-relaxed text-[11px]">
                Verified against the Immigration and Nationality Act (INA), U.S. Citizenship and Immigration Services (USCIS) policy manual, and U.S. Department of State Foreign Affairs Manual (9 FAM).
              </p>
            )}

            <div className="pt-2 border-t border-current/15 text-[11px] text-slate-700 leading-relaxed">
              <strong>Clarification on Regional Migration:</strong> USA mein Australia jaisa Regional Migration, Designated Regional Areas/Postcodes ya DAMA visa system nahi hai. Ye Australian programmes hain. USA mein iske closest concepts <strong>EB-5 Targeted Employment Area (TEA: Rural / High-Unemployment / Infrastructure)</strong>, <strong>H-2A/H-2B labour certification areas</strong>, aur <strong>EB-5 Regional Center Programme</strong> hain — ye alag visa subclasses nahi hain.
            </div>
          </div>
        )}

        {/* CANADA OFFICIAL IRCC STREAM & IMMIGRATION PROGRAM REGISTER STATUS */}
        {toCode === 'CA' && (
          <div id="section-subclass" className={`p-4 rounded-xl border text-xs space-y-3 scroll-mt-28 ${
            dbVisaItem?.isLegacy ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-red-50/70 border-red-200 text-red-950'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-current/20">
              <div className="flex items-center gap-2 font-bold text-sm flex-wrap">
                <span>🇨🇦</span>
                <span>{dbVisaItem?.officialName || dbVisaItem?.name}</span>
                {dbVisaItem?.officialCode && (
                  <span className="bg-red-800 text-white font-mono text-xs px-2 py-0.5 rounded font-black">
                    {dbVisaItem.officialCode}
                  </span>
                )}
                {dbVisaItem?.record_type && (
                  <span className="bg-white/90 text-red-900 border border-red-300 text-[10px] font-bold px-2 py-0.5 rounded">
                    {dbVisaItem.record_type}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {dbVisaItem?.intakeStatus && (
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    dbVisaItem.intakeStatus === 'Active' ? 'bg-emerald-200 text-emerald-900' :
                    dbVisaItem.intakeStatus === 'Paused' ? 'bg-amber-200 text-amber-900' :
                    'bg-red-200 text-red-900'
                  }`}>
                    {dbVisaItem.intakeStatus}
                  </span>
                )}
                <span className="text-[10px] font-mono bg-white/60 px-2 py-0.5 rounded border">
                  Last Verified: {dbVisaItem?.lastVerifiedDate || 'Oct 30, 2026'}
                </span>
                <a
                  href={dbVisaItem?.officialSource || "https://www.canada.ca/en/immigration-refugees-citizenship/services/come-canada.html"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline flex items-center gap-1 text-[11px] hover:opacity-80"
                >
                  <span>IRCC Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {dbVisaItem?.programmeNote && (
              <div className="p-2.5 bg-white/90 rounded-lg border border-red-200 text-[11px] text-red-950 leading-relaxed">
                <strong>Programme Note:</strong> {dbVisaItem.programmeNote}
              </div>
            )}

            {dbVisaItem?.communityDetails && (
              <div className="p-3 bg-white rounded-xl border border-teal-300 space-y-2 text-xs">
                <div className="font-extrabold text-teal-950 flex items-center gap-1.5">
                  <span>🌄</span>
                  <span>IRCC Designated Regional Community Boundary & Employer Details ({dbVisaItem.communityDetails.communityCode})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-800">
                  <div><strong>Province:</strong> {dbVisaItem.communityDetails.province}</div>
                  <div><strong>Participating Pilot:</strong> {dbVisaItem.communityDetails.participatingPilot}</div>
                  <div className="sm:col-span-2"><strong>Municipality / Eligible Area:</strong> {dbVisaItem.communityDetails.municipalityEligibleArea}</div>
                  <div className="sm:col-span-2"><strong>Designated Employer List:</strong> {dbVisaItem.communityDetails.designatedEmployerList}</div>
                  <div className="sm:col-span-2"><strong>Eligible Occupations:</strong> {dbVisaItem.communityDetails.eligibleOccupations}</div>
                </div>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <a href={dbVisaItem.communityDetails.officialBoundaryMapURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline flex items-center gap-1">
                    <span>Official Boundary Map & Pilot Guidelines ↗</span>
                  </a>
                  <span className="bg-teal-100 text-teal-900 font-semibold px-2 py-0.5 rounded">Status: {dbVisaItem.communityDetails.status}</span>
                </div>
              </div>
            )}

            {/* Canada Regional Clarification Warning Box */}
            <div className="p-3 bg-white/95 rounded-xl border border-red-200 text-[11px] text-slate-800 leading-relaxed space-y-1">
              <strong className="text-red-900 block">Canada Regional Clarification:</strong>
              {CA_REGIONAL_WARNING_TEXT}
            </div>

            {/* Official IRCC Reference Links */}
            {CA_IRCC_REFERENCE_LINKS && CA_IRCC_REFERENCE_LINKS.length > 0 && (
              <div className="pt-2 border-t border-red-200">
                <strong className="text-[11px] text-red-950 block mb-1">Official IRCC & Government Reference Portals (Top 10):</strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  {CA_IRCC_REFERENCE_LINKS.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline flex items-center gap-1 truncate bg-white/80 p-1.5 rounded border border-red-200">
                      <span>• {link.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* UK OFFICIAL GOV.UK UKVI IMMIGRATION ROUTE, 7 STATUTORY WARNINGS & REGIONAL SPONSOR DIRECTORY */}
        {toCode === 'GB' && (
          <div id="section-subclass" className={`p-5 rounded-2xl border text-xs space-y-4 scroll-mt-28 ${
            dbVisaItem?.isLegacy || dbVisaItem?.status === 'Closed' ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-current/20">
              <div className="flex items-center gap-2 font-bold text-sm flex-wrap">
                <span>🇬🇧</span>
                <span>Official GOV.UK UKVI Route: {dbVisaItem?.officialName || dbVisaItem?.name}</span>
                {dbVisaItem?.officialCode && (
                  <span className="bg-[#0B3D91] text-white font-mono text-xs px-2 py-0.5 rounded font-black">
                    Code {dbVisaItem.officialCode}
                  </span>
                )}
                {dbVisaItem?.record_type && (
                  <span className="bg-white text-indigo-900 border border-indigo-300 font-mono text-[10px] px-2 py-0.5 rounded font-extrabold">
                    {dbVisaItem.record_type}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {dbVisaItem?.status && (
                  <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    dbVisaItem.status === 'Active' ? 'bg-emerald-200 text-emerald-900' :
                    dbVisaItem.status === 'Restricted' ? 'bg-purple-200 text-purple-900' :
                    'bg-amber-200 text-amber-900'
                  }`}>
                    {dbVisaItem.status} ({dbVisaItem.application_status || 'OPEN'})
                  </span>
                )}
                {!dbVisaItem?.status && (
                  dbVisaItem?.isLegacy ? (
                    <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                      ⚠️ Legacy / Closed UKVI Route
                    </span>
                  ) : (
                    <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[11px]">
                      🟢 Official Active GOV.UK Route
                    </span>
                  )
                )}
                <span className="text-[10px] font-mono bg-white/80 px-2 py-0.5 rounded border border-indigo-200">
                  Verified: {dbVisaItem?.last_verified_at || 'Oct 31, 2026'}
                </span>
                <a
                  href={dbVisaItem?.officialSource || "https://www.gov.uk/browse/visas-immigration"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline flex items-center gap-1 text-[11px] hover:opacity-80"
                >
                  <span>GOV.UK Immigration Rules</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {dbVisaItem?.replaced_by && (
              <div className="p-3 bg-amber-100/90 border border-amber-400 rounded-xl text-xs text-amber-950 font-semibold">
                🔄 <strong>Replaced By Modern Route:</strong> {dbVisaItem.replaced_by}
              </div>
            )}

            {dbVisaItem?.warningBox && (
              <div className="p-3 bg-white/95 border-l-4 border-indigo-700 rounded-r-xl text-[11px] text-slate-900 leading-relaxed font-medium shadow-2xs">
                ⚠️ <strong>UKVI Statutory Route Notice:</strong> {dbVisaItem.warningBox}
              </div>
            )}

            {/* 7 Statutory UK Compliance Warning Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-200 text-[11px] leading-relaxed">
                <strong className="text-indigo-950 block mb-0.5">1. Regional Work & Salary Rules Warning:</strong>
                {UK_REGIONAL_WARNING_TEXT}
              </div>
              <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-200 text-[11px] leading-relaxed">
                <strong className="text-indigo-950 block mb-0.5">2. EU Settlement Scheme (EUSS) Warning:</strong>
                {UK_EUSS_WARNING_TEXT}
              </div>
              <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-200 text-[11px] leading-relaxed">
                <strong className="text-indigo-950 block mb-0.5">3. Hong Kong BN(O) Route Structure Warning:</strong>
                {UK_BNO_WARNING_TEXT}
              </div>
              <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-200 text-[11px] leading-relaxed">
                <strong className="text-indigo-950 block mb-0.5">4. Ukraine Schemes & UPE Warning:</strong>
                {UK_UKRAINE_WARNING_TEXT}
              </div>
              <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-200 text-[11px] leading-relaxed">
                <strong className="text-indigo-950 block mb-0.5">5. British Nationality & Registration Warning:</strong>
                {UK_NATIONALITY_WARNING_TEXT}
              </div>
              <div className="p-2.5 bg-white/90 rounded-xl border border-indigo-200 text-[11px] leading-relaxed">
                <strong className="text-indigo-950 block mb-0.5">6. Permission to Enter & ETA Warning:</strong>
                {UK_ENTRY_WARNING_TEXT}
              </div>
              <div className="p-2.5 bg-amber-50/90 rounded-xl border border-amber-300 text-[11px] leading-relaxed md:col-span-2">
                <strong className="text-amber-950 block mb-0.5">7. Legacy & Closed UK Routes Warning:</strong>
                {UK_LEGACY_WARNING_TEXT}
              </div>
            </div>

            {/* UK Regional Jobs & Sponsorship Directory (Supporting Intelligence — Not a Standalone Visa Category) */}
            <div className="pt-3 border-t border-indigo-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-indigo-950 text-xs sm:text-sm">
                    🏢 UK Regional Jobs, Salary Rules & Licensed Sponsor Intelligence (10 Supporting Sections)
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Supporting employer, salary (37.5-hour week basis), and nation-specific data (Scotland, Wales, Northern Ireland, England) — NOT a separate regional visa subclass.
                  </p>
                </div>
                <a
                  href="https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-indigo-900 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-800 inline-flex items-center gap-1"
                >
                  <span>UKVI Sponsor Register</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {REGIONAL_DIRECTORY_SECTIONS.map((sec, idx) => (
                  <a
                    key={idx}
                    href={sec.govUkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-white rounded-xl border border-indigo-200 hover:border-indigo-500 transition-colors block space-y-1"
                  >
                    <div className="font-bold text-indigo-950 text-[11px] flex items-center justify-between gap-1">
                      <span>{idx + 1}. {sec.title}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0 text-indigo-600" />
                    </div>
                    <p className="text-[10px] text-slate-600 line-clamp-2">{sec.dataInfo}</p>
                    <span className="inline-block text-[9px] font-bold bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded">
                      {sec.nature}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AUSTRALIA REGIONAL MIGRATION PATHWAYS, DAMA & DESIGNATED REGIONAL AREAS SECTION */}
        {toCode === 'AU' && (dbVisaItem?.regionalCategory || dbVisaItem?.regionalPathways || dbVisaItem?.damaPathways) && (
          <div id="section-regional" className="bg-gradient-to-br from-teal-50/90 via-emerald-50/50 to-white border-2 border-teal-500/80 rounded-2xl p-5 sm:p-6 space-y-5 scroll-mt-28 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-teal-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl">🌄</span>
                  <h2 className="text-base sm:text-lg font-extrabold text-teal-950">
                    Regional Migration Pathways — {dbVisaItem?.categoryName || 'Australian Regional Migration'}
                  </h2>
                  {dbVisaItem?.regionalCategory && (
                    <span className="bg-teal-900 text-white font-mono text-xs font-black px-2.5 py-0.5 rounded">
                      {dbVisaItem.regionalCategory}
                    </span>
                  )}
                </div>
                <p className="text-xs text-teal-800">
                  Official Department of Home Affairs regional sub-pathways, eligibility differences, DAMA agreements, and designated postcode zones.
                </p>
              </div>
              <a
                href={dbVisaItem?.officialSource || REGIONAL_MIGRATION_INFO.officialSource}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-900 bg-white hover:bg-teal-100 border border-teal-300 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto"
              >
                <span>Official Visa Listing</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Regional Pathways Tabs & Cards (e.g. AUS-491-SN vs AUS-491-FS, AUS-494-ES vs AUS-494-LA, AUS-191-RP vs AUS-191-HK, AUS-485-2PSW, AUS-417/462, or Legacy 489/887/187) */}
            {dbVisaItem?.regionalPathways && dbVisaItem.regionalPathways.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-900">
                    Official Sub-Pathways ({dbVisaItem.regionalPathways.length} Streams)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dbVisaItem.regionalPathways.map((p: any, idx: number) => (
                      <button
                        key={p.code}
                        onClick={() => setActivePathwayTab(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          activePathwayTab === idx
                            ? 'bg-teal-900 text-white shadow-xs'
                            : 'bg-white text-teal-900 border border-teal-300 hover:bg-teal-100'
                        }`}
                      >
                        {p.code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* All Sub-Pathways Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dbVisaItem.regionalPathways.map((pathway: any, idx: number) => {
                    const isFocused = activePathwayTab === idx;
                    return (
                      <div
                        key={pathway.code}
                        onClick={() => setActivePathwayTab(idx)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isFocused
                            ? 'bg-white border-2 border-teal-700 shadow-sm'
                            : 'bg-white/80 border-teal-200 hover:border-teal-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-black bg-teal-100 text-teal-950 px-2.5 py-0.5 rounded border border-teal-300">
                            {pathway.code}
                          </span>
                          {pathway.isCurrent ? (
                            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                              🟢 Current Active Pathway
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                              📜 Closed / Legacy Route
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-slate-900">{pathway.name}</h3>
                        <p className="text-xs text-slate-700 leading-relaxed">{pathway.description}</p>
                        {pathway.eligibilityDiff && (
                          <div className="p-2.5 bg-teal-50/90 border border-teal-200 rounded-lg text-[11px] text-teal-950 leading-relaxed">
                            <strong className="block text-teal-900 mb-0.5">Key Eligibility & Stream Difference:</strong>
                            {pathway.eligibilityDiff}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DAMA (Designated Area Migration Agreement) Pathways Block */}
            {dbVisaItem?.damaPathways && dbVisaItem.damaPathways.length > 0 && (
              <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🤝</span>
                    <h3 className="font-extrabold text-xs sm:text-sm text-indigo-950">
                      Designated Area Migration Agreement (DAMA) Pathways (AUS-REG-05)
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded border border-indigo-300">
                    DAMA = Regional Agreement (Not a Separate Visa Subclass)
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {dbVisaItem.damaPathways.map((dama: any) => (
                    <div key={dama.code} className="bg-white p-3 rounded-xl border border-indigo-200 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[11px] font-black bg-indigo-900 text-white px-2 py-0.5 rounded">
                          {dama.code}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Current
                        </span>
                      </div>
                      <div className="font-bold text-xs text-slate-900">{dama.name}</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{dama.description}</p>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-indigo-950 bg-white/90 p-2.5 rounded-lg border border-indigo-200">
                  <strong>Active Australian DAMA Regions:</strong> {REGIONAL_MIGRATION_INFO.damaRegionsList.join(' · ')}
                </div>
              </div>
            )}

            {/* Designated Regional Areas (Category 2 vs Category 3) */}
            {dbVisaItem?.regionalAreas && dbVisaItem.regionalAreas.length > 0 && (
              <div className="bg-white border border-teal-200 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-xs sm:text-sm text-teal-950 flex items-center gap-1.5">
                    <span>📍</span>
                    <span>Designated Regional Australia Areas (Category 2 & Category 3)</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    Excludes Sydney, Melbourne & Brisbane
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {dbVisaItem.regionalAreas.map((areaText: string, i: number) => (
                    <div key={i} className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg text-slate-800 leading-relaxed">
                      <span className="font-bold text-teal-950 block mb-0.5">
                        {i === 0 ? '🏙️ Category 2 – Cities & Major Regional Centres:' : '🗺️ Category 3 – Regional Centres & Other Regional Areas:'}
                      </span>
                      {areaText}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regional Note */}
            {dbVisaItem?.regionalNote && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 leading-relaxed">
                <strong>📌 Official Regional Migration Note:</strong> {dbVisaItem.regionalNote}
              </div>
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
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex flex-wrap items-center gap-2 min-w-0">
              <span className="break-words">❓ {t.faqs} ({fromCode} → {toCode})</span>
              {faqs.length > 0 && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full shrink-0">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'}
                </span>
              )}
            </h2>

            {/* FAQ Search Input */}
            {faqs && faqs.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder={isJa ? "FAQを検索..." : "Search FAQs..."}
                  className="w-full min-h-[44px] pl-10 pr-10 py-2.5 sm:py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3D91] focus:bg-white text-slate-800 touch-manipulation"
                />
                {faqSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setFaqSearchQuery('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 active:bg-slate-200/60 rounded-full cursor-pointer touch-manipulation"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {faqLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-14 bg-slate-100 rounded-xl"></div>
              <div className="h-14 bg-slate-100 rounded-xl"></div>
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
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full min-h-[52px] text-left px-4 py-3.5 sm:px-5 sm:py-4 font-semibold text-slate-900 flex items-start sm:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-100 active:bg-slate-200/70 transition-colors cursor-pointer touch-manipulation text-xs sm:text-sm"
                    >
                      <span className="flex-1 min-w-0 whitespace-normal break-words leading-snug sm:leading-relaxed pr-1">
                        {questionText}
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold shrink-0 flex items-center justify-center text-base shadow-2xs mt-0.5 sm:mt-0">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed whitespace-normal break-words">
                        {answerText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : faqs && faqs.length > 0 && faqSearchQuery ? (
            <div className="text-center py-6 px-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <p className="text-xs sm:text-sm text-slate-600 font-medium break-words">
                No questions found matching "<span className="font-bold text-slate-900">{faqSearchQuery}</span>"
              </p>
              <button
                type="button"
                onClick={() => setFaqSearchQuery('')}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs sm:text-sm font-semibold text-[#0B3D91] inline-flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation transition-colors"
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
          Access real-time audit reporting and public sitemap indices for 1001+ visa and immigration programme records (USA: 164 Official Visas + 37 Programmes = 201).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => navigate('/audit')}
            className="p-5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-extrabold text-base text-emerald-300">Live Audit (1001+ Records) – Admin Only</h3>
              <p className="text-xs text-slate-200 mt-1">Real-time database count, USA 164 Visas + 37 Programmes split, document completeness checks, country-wise matrix.</p>
            </div>
            <span className="text-xs font-bold text-emerald-300 mt-4 inline-flex items-center gap-1">Open Live Audit Report →</span>
          </div>

          <div 
            onClick={() => navigate('/sitemap')}
            className="p-5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl mb-2">🗺️</div>
              <h3 className="font-extrabold text-base text-blue-200">Sitemap (1001+ Pages) – Public + Admin</h3>
              <p className="text-xs text-slate-200 mt-1">Indexed links for all 1001+ visa & programme guides across 30 destination countries for search crawler optimization.</p>
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
