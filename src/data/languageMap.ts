import { COUNTRY_TO_LANG_15, SUPPORTED_LANGUAGES_15 } from '../i18n/config';

export const COUNTRY_TO_LANGUAGE_MAP: Record<string, string> = {
  ...COUNTRY_TO_LANG_15,
};

export const LANGUAGE_NAMES: Record<string, { name: string; flag: string; nativeName: string; dir: 'ltr' | 'rtl' }> =
  Object.fromEntries(
    SUPPORTED_LANGUAGES_15.map((lang) => [
      lang.code,
      { name: lang.name, flag: lang.flag, nativeName: lang.nativeName, dir: lang.dir },
    ])
  );

export function getLanguageForCountry(countryCode: string): string {
  const code = (countryCode || '').toUpperCase();
  return COUNTRY_TO_LANGUAGE_MAP[code] || 'en';
}
