import {
  SUPPORTED_LANGUAGES_10,
  COUNTRY_TO_LANG_10,
  UI_TRANSLATIONS_10,
  SupportedLangCode,
  I18nStrings,
  LanguageOption,
} from '../i18n/config';

const LANG_STORAGE_KEY = 'visaapply_user_lang';
const ORIGIN_STORAGE_KEY = 'visaapply_user_origin_country';
const IP_CACHE_KEY = 'visaapply_ip_geo_cache';
const DYNAMIC_TRANSLATION_CACHE_KEY = 'visaapply_dyn_trans_cache';

export function isSupportedLang(code: string): code is SupportedLangCode {
  return SUPPORTED_LANGUAGES_10.some((l) => l.code === code.toLowerCase());
}

export function getLangFromUrlPath(pathname: string): {
  lang: SupportedLangCode | null;
  strippedPath: string;
} {
  const clean = pathname || '/';
  const match = clean.match(/^\/(en|hi|ar|fr|de|es|ru|zh|ja|pt)(\/.*|$)/i);
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

export function getSavedLanguage(): SupportedLangCode | null {
  if (typeof window === 'undefined') return null;
  try {
    const urlCheck = getLangFromUrlPath(window.location.pathname);
    if (urlCheck.lang) return urlCheck.lang;

    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && isSupportedLang(saved)) {
      return saved;
    }
  } catch (e) {}
  return null;
}

export function setSavedLanguage(lang: SupportedLangCode) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    const opt = SUPPORTED_LANGUAGES_10.find((l) => l.code === lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = opt?.dir || 'ltr';
  } catch (e) {}
}

export function getSavedOriginCountry(): string {
  if (typeof window === 'undefined') return 'IN';
  try {
    const saved = localStorage.getItem(ORIGIN_STORAGE_KEY);
    if (saved && saved.length === 2) return saved.toUpperCase();
  } catch (e) {}
  return 'IN';
}

export function setSavedOriginCountry(code: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORIGIN_STORAGE_KEY, code.toUpperCase());
  } catch (e) {}
}

export async function detectUserCountryAndLanguage(): Promise<{
  countryCode: string;
  countryName: string;
  lang: SupportedLangCode;
  wasAutoDetected: boolean;
}> {
  const manualLang = getSavedLanguage();

  // Check cached IP geo first
  if (typeof window !== 'undefined') {
    try {
      const cachedRaw = sessionStorage.getItem(IP_CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached && cached.countryCode) {
          const finalLang = manualLang || cached.lang || 'en';
          setSavedLanguage(finalLang);
          return {
            countryCode: cached.countryCode,
            countryName: cached.countryName || cached.countryCode,
            lang: finalLang,
            wasAutoDetected: !manualLang,
          };
        }
      }
    } catch (e) {}
  }

  let detectedCountryCode = 'IN';
  let detectedCountryName = 'India';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && data.country_code) {
        detectedCountryCode = String(data.country_code).toUpperCase();
        detectedCountryName = data.country_name || detectedCountryCode;
      }
    }
  } catch (e) {
    // Fallback to browser language if ipapi is blocked/offline
    if (typeof navigator !== 'undefined' && navigator.language) {
      const bLang = navigator.language.toLowerCase();
      if (bLang.startsWith('ar')) detectedCountryCode = 'AE';
      else if (bLang.startsWith('de')) detectedCountryCode = 'DE';
      else if (bLang.startsWith('fr')) detectedCountryCode = 'FR';
      else if (bLang.startsWith('es')) detectedCountryCode = 'ES';
      else if (bLang.startsWith('ru')) detectedCountryCode = 'RU';
      else if (bLang.startsWith('zh')) detectedCountryCode = 'CN';
      else if (bLang.startsWith('ja')) detectedCountryCode = 'JP';
      else if (bLang.startsWith('pt')) detectedCountryCode = 'BR';
      else if (bLang.startsWith('hi')) detectedCountryCode = 'IN';
    }
  }

  // Determine language from country + browser language
  let mappedLang: SupportedLangCode = COUNTRY_TO_LANG_10[detectedCountryCode] || 'en';
  if (detectedCountryCode === 'IN' && typeof navigator !== 'undefined') {
    const bLang = (navigator.language || '').toLowerCase();
    if (bLang.startsWith('hi')) mappedLang = 'hi';
  }

  const finalLang = manualLang || mappedLang;
  setSavedLanguage(finalLang);

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(
        IP_CACHE_KEY,
        JSON.stringify({
          countryCode: detectedCountryCode,
          countryName: detectedCountryName,
          lang: mappedLang,
        })
      );
    } catch (e) {}
  }

  return {
    countryCode: detectedCountryCode,
    countryName: detectedCountryName,
    lang: finalLang,
    wasAutoDetected: !manualLang,
  };
}

export function getUIString(lang: SupportedLangCode): I18nStrings {
  return UI_TRANSLATIONS_10[lang] || UI_TRANSLATIONS_10.en;
}

export function getLanguageOption(lang: SupportedLangCode): LanguageOption {
  return SUPPORTED_LANGUAGES_10.find((l) => l.code === lang) || SUPPORTED_LANGUAGES_10[0];
}

// Inject SEO hreflang tags for all 10 supported languages on every route change
export function injectTenLanguageHreflangTags(rawPathname: string) {
  if (typeof document === 'undefined') return;
  const { strippedPath } = getLangFromUrlPath(rawPathname);
  const cleanPath = strippedPath === '/' ? '' : strippedPath.replace(/\/+$/, '');
  const baseUrl = 'https://www.visaapply.org';

  // Remove old dynamic hreflang links
  document.querySelectorAll('link[data-dynamic-hreflang="true"]').forEach((el) => el.remove());

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

// Dynamic Translation with localStorage cache (LibreTranslate compatible fallback)
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

    const res = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang,
        format: 'text',
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.translatedText) {
        cache[cacheKey] = data.translatedText;
        localStorage.setItem(DYNAMIC_TRANSLATION_CACHE_KEY, JSON.stringify(cache));
        return data.translatedText;
      }
    }
  } catch (e) {
    // Fallback to original text if free translation endpoint is rate-limited
  }
  return text;
}
