import {
  SUPPORTED_LANGUAGES_10,
  COUNTRY_TO_LANG_10,
  UI_TRANSLATIONS_10,
  SupportedLangCode,
  I18nStrings,
  LanguageOption,
} from '../i18n/config';

const MANUAL_LANG_KEY = 'visaapply_manual_lang_v2';
const MANUAL_LANG_FOR_COUNTRY_KEY = 'visaapply_manual_lang_country_v2';
const LAST_DETECTED_COUNTRY_KEY = 'visaapply_last_ip_country_v2';
const DYNAMIC_TRANSLATION_CACHE_KEY = 'visaapply_dyn_trans_cache';

const LANG_REGEX = /^\/(en|hi|ar|fr|de|es|pl|ru|zh|ja|pt|it|nl|tr|ko)(\/.*|$)/i;

export function isSupportedLang(code: string): code is SupportedLangCode {
  if (!code) return false;
  return SUPPORTED_LANGUAGES_10.some((l) => l.code === code.toLowerCase());
}

export function getLangFromUrlPath(pathname: string): {
  lang: SupportedLangCode | null;
  strippedPath: string;
} {
  const clean = pathname || '/';
  const match = clean.match(LANG_REGEX);
  if (match) {
    const langCode = match[1].toLowerCase() as SupportedLangCode;
    const rest = match[2] || '/';
    return { lang: langCode, strippedPath: rest };
  }
  return { lang: null, strippedPath: clean };
}

export function buildLocalizedUrl(path: string, lang: SupportedLangCode): string {
  const { strippedPath } = getLangFromUrlPath(path);
  const normalized = strippedPath.startsWith('/') ? strippedPath : `/${strippedPath}`;
  if (lang === 'en') {
    return normalized;
  }
  return normalized === '/' ? `/${lang}` : `/${lang}${normalized}`;
}

export function applyDocumentLangAttributes(lang: SupportedLangCode) {
  if (typeof document === 'undefined') return;
  const opt = SUPPORTED_LANGUAGES_10.find((l) => l.code === lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = opt?.dir || 'ltr';
}

export function getSavedLanguage(): SupportedLangCode | null {
  if (typeof window === 'undefined') return null;
  try {
    // 1. Check URL query parameter ?lang=de or ?lang=pl or ?lang=es
    const params = new URLSearchParams(window.location.search);
    const qLang = params.get('lang');
    if (qLang && isSupportedLang(qLang)) {
      return qLang.toLowerCase() as SupportedLangCode;
    }

    // 2. Check URL path prefix (/de, /es, /pl, etc.)
    const urlCheck = getLangFromUrlPath(window.location.pathname);
    if (urlCheck.lang) return urlCheck.lang;

    // 3. Clean up legacy key that accidentally locked 'en' on first load
    localStorage.removeItem('visaapply_user_lang');
    sessionStorage.removeItem('visaapply_ip_geo_cache');
  } catch (e) {}
  return null;
}

// Called ONLY when the user explicitly selects a language from the dropdown/bar
export function setSavedLanguage(lang: SupportedLangCode, isManualUserAction = true) {
  if (typeof window === 'undefined') return;
  try {
    applyDocumentLangAttributes(lang);
    if (isManualUserAction) {
      localStorage.setItem(MANUAL_LANG_KEY, lang);
      const currentIpCountry = localStorage.getItem(LAST_DETECTED_COUNTRY_KEY) || '';
      if (currentIpCountry) {
        localStorage.setItem(MANUAL_LANG_FOR_COUNTRY_KEY, currentIpCountry);
      }
    }
  } catch (e) {}
}

// Multi-provider live IP geolocation (works reliably across VPNs in Poland, Germany, Spain, etc.)
async function fetchLiveCountryFromIP(): Promise<{ countryCode: string; countryName: string } | null> {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const forcedCountry = params.get('country') || params.get('cc');
    if (forcedCountry && /^[a-z]{2}$/i.test(forcedCountry.trim())) {
      const code = forcedCountry.trim().toUpperCase();
      return { countryCode: code, countryName: code };
    }
  }

  // Provider 1: api.country.is (Cloudflare-backed, zero rate limits, works with all VPNs, ~80ms)
  try {
    const c1 = new AbortController();
    const t1 = setTimeout(() => c1.abort(), 2200);
    const r1 = await fetch('https://api.country.is/', { cache: 'no-store', signal: c1.signal });
    clearTimeout(t1);
    if (r1.ok) {
      const d1 = await r1.json();
      if (d1 && d1.country && /^[A-Z]{2}$/i.test(d1.country)) {
        const code = String(d1.country).toUpperCase();
        return { countryCode: code, countryName: code };
      }
    }
  } catch {}

  // Provider 2: ipwho.is (Fast global JSON geo API, no API key needed, VPN-friendly)
  try {
    const c2 = new AbortController();
    const t2 = setTimeout(() => c2.abort(), 2500);
    const r2 = await fetch('https://ipwho.is/', { cache: 'no-store', signal: c2.signal });
    clearTimeout(t2);
    if (r2.ok) {
      const d2 = await r2.json();
      if (d2 && d2.country_code && /^[A-Z]{2}$/i.test(d2.country_code)) {
        return {
          countryCode: String(d2.country_code).toUpperCase(),
          countryName: d2.country || String(d2.country_code).toUpperCase(),
        };
      }
    }
  } catch {}

  // Provider 3: freeipapi.com
  try {
    const c3 = new AbortController();
    const t3 = setTimeout(() => c3.abort(), 2500);
    const r3 = await fetch('https://freeipapi.com/api/json', { cache: 'no-store', signal: c3.signal });
    clearTimeout(t3);
    if (r3.ok) {
      const d3 = await r3.json();
      if (d3 && d3.countryCode && /^[A-Z]{2}$/i.test(d3.countryCode)) {
        return {
          countryCode: String(d3.countryCode).toUpperCase(),
          countryName: d3.countryName || String(d3.countryCode).toUpperCase(),
        };
      }
    }
  } catch {}

  // Provider 4: Server-side /api/geo (reads cf-ipcountry / x-vercel-ip-country headers with 0 CORS or 429 issues)
  try {
    const r4 = await fetch('/api/geo', { cache: 'no-store' });
    if (r4.ok) {
      const d4 = await r4.json();
      if (d4?.country?.code) {
        return {
          countryCode: String(d4.country.code).toUpperCase(),
          countryName: d4.country.name || String(d4.country.code).toUpperCase(),
        };
      }
    }
  } catch {}

  return null;
}

export async function detectUserCountryAndLanguage(): Promise<{
  countryCode: string;
  countryName: string;
  lang: SupportedLangCode;
  wasAutoDetected: boolean;
}> {
  // Always clean up old buggy keys so VPN changes are never blocked
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('visaapply_user_lang');
      sessionStorage.removeItem('visaapply_ip_geo_cache');
    } catch {}
  }

  let detectedCountryCode = 'IN';
  let detectedCountryName = 'India';

  const liveGeo = await fetchLiveCountryFromIP();
  if (liveGeo && liveGeo.countryCode) {
    detectedCountryCode = liveGeo.countryCode.toUpperCase();
    detectedCountryName = liveGeo.countryName || detectedCountryCode;
  } else if (typeof navigator !== 'undefined' && navigator.language) {
    const bLang = navigator.language.toLowerCase();
    if (bLang.startsWith('pl')) detectedCountryCode = 'PL';
    else if (bLang.startsWith('de')) detectedCountryCode = 'DE';
    else if (bLang.startsWith('es')) detectedCountryCode = 'ES';
    else if (bLang.startsWith('fr')) detectedCountryCode = 'FR';
    else if (bLang.startsWith('ar')) detectedCountryCode = 'AE';
    else if (bLang.startsWith('ru')) detectedCountryCode = 'RU';
    else if (bLang.startsWith('zh')) detectedCountryCode = 'CN';
    else if (bLang.startsWith('ja')) detectedCountryCode = 'JP';
    else if (bLang.startsWith('pt')) detectedCountryCode = 'BR';
    else if (bLang.startsWith('it')) detectedCountryCode = 'IT';
    else if (bLang.startsWith('nl')) detectedCountryCode = 'NL';
    else if (bLang.startsWith('tr')) detectedCountryCode = 'TR';
    else if (bLang.startsWith('ko')) detectedCountryCode = 'KR';
    else if (bLang.startsWith('hi')) detectedCountryCode = 'IN';
  }

  // Map country code -> native language (PL -> pl, DE -> de, ES -> es, FR -> fr, AE -> ar, etc.)
  let mappedLang: SupportedLangCode = COUNTRY_TO_LANG_10[detectedCountryCode] || 'en';
  if (detectedCountryCode === 'IN' && typeof navigator !== 'undefined') {
    const bLang = (navigator.language || '').toLowerCase();
    if (bLang.startsWith('hi')) mappedLang = 'hi';
  }

  // Check if URL explicitly forces a language (/de, /es, /pl or ?lang=de)
  const urlForcedLang = getSavedLanguage();

  // Check if the user manually picked a language during THIS same IP country session
  let finalLang: SupportedLangCode = urlForcedLang || mappedLang;
  let wasAutoDetected = true;

  if (typeof window !== 'undefined' && !urlForcedLang) {
    try {
      const prevCountry = localStorage.getItem(LAST_DETECTED_COUNTRY_KEY);
      const manualLang = localStorage.getItem(MANUAL_LANG_KEY);
      const manualForCountry = localStorage.getItem(MANUAL_LANG_FOR_COUNTRY_KEY);

      if (prevCountry && prevCountry !== detectedCountryCode) {
        // VPN / Country changed! Clear any previous manual override and use the new country's native language
        localStorage.removeItem(MANUAL_LANG_KEY);
        localStorage.removeItem(MANUAL_LANG_FOR_COUNTRY_KEY);
        finalLang = mappedLang;
        wasAutoDetected = true;
      } else if (
        manualLang &&
        isSupportedLang(manualLang) &&
        manualForCountry === detectedCountryCode
      ) {
        finalLang = manualLang;
        wasAutoDetected = false;
      }

      localStorage.setItem(LAST_DETECTED_COUNTRY_KEY, detectedCountryCode);
    } catch {}
  }

  applyDocumentLangAttributes(finalLang);

  return {
    countryCode: detectedCountryCode,
    countryName: detectedCountryName,
    lang: finalLang,
    wasAutoDetected,
  };
}

export function getUIString(lang: SupportedLangCode): I18nStrings {
  return UI_TRANSLATIONS_10[lang] || UI_TRANSLATIONS_10.en;
}

export function getLanguageOption(lang: SupportedLangCode): LanguageOption {
  return SUPPORTED_LANGUAGES_10.find((l) => l.code === lang) || SUPPORTED_LANGUAGES_10[0];
}

// Localize any of the 249 country names into the active language (e.g. DE -> Deutschland, PL -> Polska, ES -> España)
const displayNamesCache = new Map<string, Intl.DisplayNames>();

export function getLocalizedCountryName(
  countryCode: string,
  lang: SupportedLangCode,
  fallbackEnglishName: string
): string {
  if (!countryCode || lang === 'en') return fallbackEnglishName;
  const norm = countryCode.trim().toUpperCase();
  if (norm === 'SC' || norm === 'SCH' || norm === 'EU') {
    if (lang === 'de') return 'Schengen-Raum';
    if (lang === 'es') return 'Espacio Schengen';
    if (lang === 'pl') return 'Strefa Schengen';
    if (lang === 'fr') return 'Espace Schengen';
    return fallbackEnglishName;
  }
  const isoCode = norm === 'UK' ? 'GB' : norm;
  if (isoCode.length !== 2) return fallbackEnglishName;

  try {
    let dn = displayNamesCache.get(lang);
    if (!dn && typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
      dn = new Intl.DisplayNames([lang], { type: 'region' });
      displayNamesCache.set(lang, dn);
    }
    if (dn) {
      const localized = dn.of(isoCode);
      if (localized && localized !== isoCode) {
        return localized;
      }
    }
  } catch {}
  return fallbackEnglishName;
}

export function getCanonicalBaseOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const host = window.location.hostname.toLowerCase();
    if (host === 'www.visaapply.org' || host === 'visaapply.org') {
      return window.location.origin;
    }
  }
  return 'https://www.visaapply.org';
}

// Inject SEO hreflang tags for all supported languages on every route change
export function injectTenLanguageHreflangTags(rawPathname: string) {
  if (typeof document === 'undefined') return;
  const { strippedPath } = getLangFromUrlPath(rawPathname);
  const cleanPath = strippedPath === '/' ? '' : strippedPath.replace(/\/+$/, '');
  const baseUrl = getCanonicalBaseOrigin();

  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());

  for (const langOpt of SUPPORTED_LANGUAGES_10) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', langOpt.code);
    link.setAttribute('data-dynamic-hreflang', 'true');
    const href =
      langOpt.code === 'en'
        ? `${baseUrl}${cleanPath || '/'}`
        : `${baseUrl}/${langOpt.code}${cleanPath}`;
    link.setAttribute('href', href);
    document.head.appendChild(link);
  }

  const xDefault = document.createElement('link');
  xDefault.setAttribute('rel', 'alternate');
  xDefault.setAttribute('hreflang', 'x-default');
  xDefault.setAttribute('data-dynamic-hreflang', 'true');
  xDefault.setAttribute('href', `${baseUrl}${cleanPath || '/'}`);
  document.head.appendChild(xDefault);
}

// Dynamic Translation with localStorage cache
export async function translateDynamicText(
  text: string,
  targetLang: SupportedLangCode
): Promise<string> {
  if (!text || targetLang === 'en') return text;
  const cacheKey = `${targetLang}:${text.slice(0, 80)}`;
  try {
    const rawCache = localStorage.getItem(DYNAMIC_TRANSLATION_CACHE_KEY);
    const cache = rawCache ? JSON.parse(rawCache) : {};
    if (cache[cacheKey]) return cache[cacheKey];
  } catch {}
  return text;
}
