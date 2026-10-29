export const COUNTRY_TO_LANGUAGE_MAP: Record<string, string> = {
  JP: 'ja',
  ES: 'es',
  DE: 'de',
  FR: 'fr',
  BR: 'pt',
  PT: 'pt',
  SA: 'ar',
  IN: 'hi', // or 'en' based on choice, defaults 'hi' / 'en' fallback
  US: 'en',
  GB: 'en',
  AU: 'en',
  CA: 'en',
  IT: 'it',
  NL: 'nl',
  SE: 'sv',
  CH: 'de',
  IE: 'en',
  NO: 'en',
  DK: 'en',
  FI: 'en',
  BE: 'fr',
  AT: 'de',
  PL: 'en',
  MY: 'en',
  TH: 'en',
  TR: 'en',
  ZA: 'en',
  NZ: 'en',
  AE: 'ar'
};

export const LANGUAGE_NAMES: Record<string, { name: string; flag: string; nativeName: string }> = {
  en: { name: 'English', flag: '🇺🇸', nativeName: 'English' },
  ja: { name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
  es: { name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  de: { name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  fr: { name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  pt: { name: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
  ar: { name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
  hi: { name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  it: { name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
  nl: { name: 'Dutch', flag: '🇳🇱', nativeName: 'Nederlands' }
};

export function getLanguageForCountry(countryCode: string): string {
  const code = (countryCode || '').toUpperCase();
  return COUNTRY_TO_LANGUAGE_MAP[code] || 'en';
}
