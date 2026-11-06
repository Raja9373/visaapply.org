export type SupportedLangCode =
  | 'en'
  | 'hi'
  | 'ar'
  | 'fr'
  | 'de'
  | 'es'
  | 'ru'
  | 'zh'
  | 'ja'
  | 'pt';

export interface LanguageOption {
  code: SupportedLangCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES_10: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', dir: 'rtl' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', dir: 'ltr' },
];

export const COUNTRY_TO_LANG_10: Record<string, SupportedLangCode> = {
  // Arabic speaking countries
  AE: 'ar', SA: 'ar', QA: 'ar', KW: 'ar', OM: 'ar', BH: 'ar', EG: 'ar', JO: 'ar', LB: 'ar', MA: 'ar', TN: 'ar', DZ: 'ar', IQ: 'ar',
  // German speaking countries
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  // French speaking countries
  FR: 'fr', BE: 'fr', MC: 'fr', LU: 'fr', SN: 'fr', CI: 'fr', CM: 'fr',
  // Spanish speaking countries
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', UY: 'es', PA: 'es', CR: 'es', DO: 'es', EC: 'es', VE: 'es',
  // Russian / CIS
  RU: 'ru', KZ: 'ru', BY: 'ru', KG: 'ru', UZ: 'ru',
  // Chinese
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh',
  // Japanese
  JP: 'ja',
  // Portuguese
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt',
  // India / Hindi / English
  IN: 'en', // Defaults to en unless browser is hi or user picks hi
  NP: 'hi',
  // English default
  US: 'en', GB: 'en', UK: 'en', CA: 'en', AU: 'en', NZ: 'en', SG: 'en', IE: 'en', ZA: 'en', PH: 'en', NG: 'en', KE: 'en',
};

export interface I18nStrings {
  visaTypes: string;
  visas: string;
  liveTime: string;
  processing: string;
  hotelFrom: string;
  searchFlights: string;
  eligibility: string;
  fromPassport: string;
  toDestination: string;
  swapRoute: string;
  allDestinations: string;
  heroTitle: string;
  heroSubtitle: string;
  viewRequirements: string;
  compare: string;
  added: string;
  anyToAnyRoutes: string;
  immigrationUpdates: string;
  checkEligibilityBtn: string;
  downloadChecklistPdf: string;
  fromToLabel: string;
}

export const UI_TRANSLATIONS_10: Record<SupportedLangCode, I18nStrings> = {
  en: {
    visaTypes: 'Visa Types',
    visas: 'Visas',
    liveTime: 'LIVE TIME',
    processing: 'PROCESSING',
    hotelFrom: 'HOTEL FROM',
    searchFlights: 'Search Flights',
    eligibility: 'Check Your Visa Eligibility - 30 Sec',
    fromPassport: 'From (Passport / Residence)',
    toDestination: 'To (Destination Country)',
    swapRoute: '⇄ Swap',
    allDestinations: 'All Global Destinations (Any-to-Any 61,752 Routes)',
    heroTitle: 'Where do you want to travel?',
    heroSubtitle: 'Select your origin passport/country and destination across all 249 countries (61,752 Any-to-Any bilateral visa routes).',
    viewRequirements: 'View →',
    compare: '➕ Compare',
    added: '✓ Added',
    anyToAnyRoutes: '🌍 61,752 Any-to-Any Routes',
    immigrationUpdates: '🔄 Live Gov Sync',
    checkEligibilityBtn: 'Check Eligibility Now',
    downloadChecklistPdf: '📄 Download Checklist PDF',
    fromToLabel: 'From {from} to {to}',
  },
  hi: {
    visaTypes: 'वीज़ा प्रकार',
    visas: 'वीज़ा',
    liveTime: 'लाइव समय',
    processing: 'प्रोसेसिंग समय',
    hotelFrom: 'होटल किराया',
    searchFlights: 'फ्लाइट खोजें',
    eligibility: 'अपनी वीज़ा पात्रता जांचें - 30 सेकंड',
    fromPassport: 'कहाँ से (पासपोर्ट / देश)',
    toDestination: 'कहाँ जाना है (गंतव्य देश)',
    swapRoute: '⇄ बदलें',
    allDestinations: 'सभी 249 वैश्विक गंतव्य (61,752 किसी भी देश से किसी भी देश के रूट)',
    heroTitle: 'आप कहाँ यात्रा करना चाहते हैं?',
    heroSubtitle: 'सभी 249 देशों और 61,752 वीज़ा रूट्स के लिए आधिकारिक शुल्क, दस्तावेज़ चेकलिस्ट और वीज़ा गाइड देखें।',
    viewRequirements: 'देखें →',
    compare: '➕ तुलना करें',
    added: '✓ जोड़ा गया',
    anyToAnyRoutes: '🌍 61,752 सभी रूट्स',
    immigrationUpdates: '🔄 लाइव इमिग्रेशन अपडेट',
    checkEligibilityBtn: 'पात्रता जांचें',
    downloadChecklistPdf: '📄 पीडीएफ चेकलिस्ट डाउनलोड करें',
    fromToLabel: '{from} से {to}',
  },
  ar: {
    visaTypes: 'أنواع التأشيرات',
    visas: 'تأشيرات',
    liveTime: 'الوقت المحلي',
    processing: 'مدة المعالجة',
    hotelFrom: 'فنادق تبدأ من',
    searchFlights: 'بحث عن رحلات طيران',
    eligibility: 'تحقق من أهليتك للتأشيرة في 30 ثانية',
    fromPassport: 'من (جواز السفر / الإقامة)',
    toDestination: 'إلى (وجهة السفر)',
    swapRoute: '⇄ تبديل',
    allDestinations: 'جميع الوجهات العالمية (61,752 مسار تأشيرة)',
    heroTitle: 'إلى أين تريد السفر؟',
    heroSubtitle: 'اختر بلد الإقامة والوجهة لاستكشاف متطلبات التأشيرة الرسمية والرسوم وقوائم المستندات عبر 249 دولة.',
    viewRequirements: 'عرض ←',
    compare: '➕ مقارنة',
    added: '✓ تمت الإضافة',
    anyToAnyRoutes: '🌍 61,752 مسار عالمي',
    immigrationUpdates: '🔄 تحديثات الهجرة المباشرة',
    checkEligibilityBtn: 'تحقق من الأهلية الآن',
    downloadChecklistPdf: '📄 تحميل قائمة المستندات PDF',
    fromToLabel: 'من {from} إلى {to}',
  },
  fr: {
    visaTypes: 'Types de Visas',
    visas: 'Visas',
    liveTime: 'HEURE LOCALE',
    processing: 'DÉLAI',
    hotelFrom: 'HÔTEL DÈS',
    searchFlights: 'Rechercher des Vols',
    eligibility: 'Vérifiez votre éligibilité au visa - 30 sec',
    fromPassport: 'De (Passeport / Résidence)',
    toDestination: 'Vers (Destination)',
    swapRoute: '⇄ Inverser',
    allDestinations: 'Toutes les Destinations Mondiales (61 752 Itinéraires)',
    heroTitle: 'Où souhaitez-vous voyager ?',
    heroSubtitle: 'Sélectionnez votre pays de départ et votre destination parmi 249 pays (61 752 itinéraires bilatéraux).',
    viewRequirements: 'Voir →',
    compare: '➕ Comparer',
    added: '✓ Ajouté',
    anyToAnyRoutes: '🌍 61 752 Itinéraires',
    immigrationUpdates: '🔄 Mises à jour Immigration',
    checkEligibilityBtn: 'Vérifier mon éligibilité',
    downloadChecklistPdf: '📄 Télécharger la Checklist PDF',
    fromToLabel: 'De {from} vers {to}',
  },
  de: {
    visaTypes: 'Visumarten',
    visas: 'Visa',
    liveTime: 'ORTSZEIT',
    processing: 'BEARBEITUNG',
    hotelFrom: 'HOTEL AB',
    searchFlights: 'Flüge suchen',
    eligibility: 'Prüfen Sie Ihre Visumberechtigung - 30 Sek.',
    fromPassport: 'Von (Reisepass / Wohnsitz)',
    toDestination: 'Nach (Reiseziel)',
    swapRoute: '⇄ Tauschen',
    allDestinations: 'Alle weltweiten Reiseziele (61.752 Routen)',
    heroTitle: 'Wohin möchten Sie reisen?',
    heroSubtitle: 'Wählen Sie Ihr Herkunftsland und Reiseziel aus 249 Ländern für offizielle Gebühren und Dokumentenchecklisten.',
    viewRequirements: 'Ansehen →',
    compare: '➕ Vergleichen',
    added: '✓ Hinzugefügt',
    anyToAnyRoutes: '🌍 61.752 Visum-Routen',
    immigrationUpdates: '🔄 Live-Einwanderungs-Sync',
    checkEligibilityBtn: 'Berechtigung prüfen',
    downloadChecklistPdf: '📄 Checkliste als PDF herunterladen',
    fromToLabel: 'Von {from} nach {to}',
  },
  es: {
    visaTypes: 'Tipos de Visa',
    visas: 'Visas',
    liveTime: 'HORA LOCAL',
    processing: 'TRÁMITE',
    hotelFrom: 'HOTEL DESDE',
    searchFlights: 'Buscar Vuelos',
    eligibility: 'Verifique su elegibilidad de visa en 30 seg',
    fromPassport: 'Desde (Pasaporte / Residencia)',
    toDestination: 'Hacia (País de Destino)',
    swapRoute: '⇄ Cambiar',
    allDestinations: 'Todos los Destinos Globales (61,752 Rutas)',
    heroTitle: '¿A dónde quieres viajar?',
    heroSubtitle: 'Seleccione su país de origen y destino entre 249 países para ver tarifas oficiales y requisitos de visa.',
    viewRequirements: 'Ver →',
    compare: '➕ Comparar',
    added: '✓ Añadido',
    anyToAnyRoutes: '🌍 61,752 Rutas Globales',
    immigrationUpdates: '🔄 Actualizaciones en Vivo',
    checkEligibilityBtn: 'Verificar Elegibilidad',
    downloadChecklistPdf: '📄 Descargar Lista PDF',
    fromToLabel: 'De {from} a {to}',
  },
  ru: {
    visaTypes: 'Типы виз',
    visas: 'Визы',
    liveTime: 'МЕСТНОЕ ВРЕМЯ',
    processing: 'ОФОРМЛЕНИЕ',
    hotelFrom: 'ОТЕЛИ ОТ',
    searchFlights: 'Найти авиабилеты',
    eligibility: 'Проверьте право на визу за 30 секунд',
    fromPassport: 'Откуда (Гражданство / Резидентство)',
    toDestination: 'Куда (Страна назначения)',
    swapRoute: '⇄ Поменять',
    allDestinations: 'Все мировые направления (61 752 маршрута)',
    heroTitle: 'Куда вы хотите поехать?',
    heroSubtitle: 'Выберите страну отправления и назначения из 249 стран мира для проверки визовых требований и сборов.',
    viewRequirements: 'Открыть →',
    compare: '➕ Сравнить',
    added: '✓ Добавлено',
    anyToAnyRoutes: '🌍 61 752 маршрута',
    immigrationUpdates: '🔄 Авто-обновления виз',
    checkEligibilityBtn: 'Проверить шансы',
    downloadChecklistPdf: '📄 Скачать чек-лист PDF',
    fromToLabel: 'Из {from} в {to}',
  },
  zh: {
    visaTypes: '签证类型',
    visas: '种签证',
    liveTime: '当地时间',
    processing: '办理周期',
    hotelFrom: '酒店起价',
    searchFlights: '搜索特价机票',
    eligibility: '30秒快速检测您的签证资格',
    fromPassport: '出发地 (护照 / 居住国)',
    toDestination: '目的地 (目标国家)',
    swapRoute: '⇄ 互换',
    allDestinations: '全球 249 个目的地 (61,752 条双边签证路线)',
    heroTitle: '您想去哪里旅行？',
    heroSubtitle: '支持全球任意国家到任意国家 (61,752 条路线) 的官方签证费用、材料清单及使馆指南。',
    viewRequirements: '查看 →',
    compare: '➕ 对比',
    added: '✓ 已添加',
    anyToAnyRoutes: '🌍 61,752 条全球路线',
    immigrationUpdates: '🔄 移民局实时同步',
    checkEligibilityBtn: '立即评估资格',
    downloadChecklistPdf: '📄 下载 PDF 材料清单',
    fromToLabel: '从 {from} 到 {to}',
  },
  ja: {
    visaTypes: 'ビザの種類',
    visas: 'ビザ',
    liveTime: '現地時間',
    processing: '審査期間',
    hotelFrom: 'ホテル最安値',
    searchFlights: '航空券を検索',
    eligibility: '30秒でビザ申請資格をチェック',
    fromPassport: '出発国 (パスポート / 居住国)',
    toDestination: '渡航先 (目的地)',
    swapRoute: '⇄ 入れ替え',
    allDestinations: '全世界249の国と地域 (61,752ルート対応)',
    heroTitle: 'どこへ渡航しますか？',
    heroSubtitle: '249カ国間のあらゆる渡航ルート（61,752通り）の公式ビザ要件・申請料金・必要書類を確認できます。',
    viewRequirements: '詳細 →',
    compare: '➕ 比較',
    added: '✓ 追加済',
    anyToAnyRoutes: '🌍 61,752 全世界ルート',
    immigrationUpdates: '🔄 各国移民局リアルタイム更新',
    checkEligibilityBtn: '資格をチェック',
    downloadChecklistPdf: '📄 必要書類チェックリストPDF',
    fromToLabel: '{from} から {to}',
  },
  pt: {
    visaTypes: 'Tipos de Visto',
    visas: 'Vistos',
    liveTime: 'HORA LOCAL',
    processing: 'PRAZO',
    hotelFrom: 'HOTEL DESDE',
    searchFlights: 'Pesquisar Voos',
    eligibility: 'Verifique sua elegibilidade para o visto em 30s',
    fromPassport: 'De (Passaporte / Residência)',
    toDestination: 'Para (País de Destino)',
    swapRoute: '⇄ Inverter',
    allDestinations: 'Todos os Destinos Globais (61.752 Rotas)',
    heroTitle: 'Para onde você quer viajar?',
    heroSubtitle: 'Selecione seu país de origem e destino entre 249 países (61.752 rotas bilaterais de visto).',
    viewRequirements: 'Ver →',
    compare: '➕ Comparar',
    added: '✓ Adicionado',
    anyToAnyRoutes: '🌍 61.752 Rotas Globais',
    immigrationUpdates: '🔄 Atualizações de Imigração',
    checkEligibilityBtn: 'Verificar Elegibilidade',
    downloadChecklistPdf: '📄 Baixar Checklist PDF',
    fromToLabel: 'De {from} para {to}',
  },
};
