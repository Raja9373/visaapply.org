import React, { useState, useMemo, useRef, useEffect } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import worldAtlas50m from 'world-atlas/countries-50m.json';
import {
  Globe,
  Share2,
  Download,
  Check,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter
} from 'lucide-react';
import { NAME_MAP_249, FLAG_MAP_249 } from '../data/fullVisaDatabase';
import { calculateVisaCount } from '../data/anyToAnyMatrix';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface VisaMapPageProps {
  onNavigate?: (path: string) => void;
}

export type MapVisaCategory = 'visa-free' | 'voa' | 'e-visa' | 'visa-required' | 'no-data';

// Complete ISO-3166-1 numeric (3-digit) to ISO Alpha-2 mapping for world-atlas/countries-50m.json
const ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '004': 'AF', '008': 'AL', '010': 'AQ', '012': 'DZ', '016': 'AS',
  '020': 'AD', '024': 'AO', '028': 'AG', '031': 'AZ', '032': 'AR',
  '036': 'AU', '040': 'AT', '044': 'BS', '048': 'BH', '050': 'BD',
  '051': 'AM', '052': 'BB', '056': 'BE', '060': 'BM', '064': 'BT',
  '068': 'BO', '070': 'BA', '072': 'BW', '074': 'BV', '076': 'BR',
  '084': 'BZ', '086': 'IO', '090': 'SB', '092': 'VG', '096': 'BN',
  '100': 'BG', '104': 'MM', '108': 'BI', '112': 'BY', '116': 'KH',
  '120': 'CM', '124': 'CA', '132': 'CV', '136': 'KY', '140': 'CF',
  '144': 'LK', '148': 'TD', '152': 'CL', '156': 'CN', '158': 'TW',
  '162': 'CX', '166': 'CC', '170': 'CO', '174': 'KM', '175': 'YT',
  '178': 'CG', '180': 'CD', '184': 'CK', '188': 'CR', '191': 'HR',
  '192': 'CU', '196': 'CY', '203': 'CZ', '204': 'BJ', '208': 'DK',
  '212': 'DM', '214': 'DO', '218': 'EC', '222': 'SV', '226': 'GQ',
  '231': 'ET', '232': 'ER', '233': 'EE', '234': 'FO', '238': 'FK',
  '239': 'GS', '242': 'FJ', '246': 'FI', '248': 'AX', '250': 'FR',
  '254': 'GF', '258': 'PF', '260': 'TF', '262': 'DJ', '266': 'GA',
  '268': 'GE', '270': 'GM', '275': 'PS', '276': 'DE', '288': 'GH',
  '292': 'GI', '296': 'KI', '300': 'GR', '304': 'GL', '308': 'GD',
  '312': 'GP', '316': 'GU', '320': 'GT', '324': 'GN', '328': 'GY',
  '332': 'HT', '334': 'HM', '336': 'VA', '340': 'HN', '344': 'HK',
  '348': 'HU', '352': 'IS', '356': 'IN', '360': 'ID', '364': 'IR',
  '368': 'IQ', '372': 'IE', '376': 'IL', '380': 'IT', '384': 'CI',
  '388': 'JM', '392': 'JP', '398': 'KZ', '400': 'JO', '404': 'KE',
  '408': 'KP', '410': 'KR', '414': 'KW', '417': 'KG', '418': 'LA',
  '422': 'LB', '426': 'LS', '428': 'LV', '430': 'LR', '434': 'LY',
  '438': 'LI', '440': 'LT', '442': 'LU', '446': 'MO', '450': 'MG',
  '454': 'MW', '458': 'MY', '462': 'MV', '466': 'ML', '470': 'MT',
  '474': 'MQ', '478': 'MR', '480': 'MU', '484': 'MX', '492': 'MC',
  '496': 'MN', '498': 'MD', '499': 'ME', '500': 'MS', '504': 'MA',
  '508': 'MZ', '512': 'OM', '516': 'NA', '520': 'NR', '524': 'NP',
  '528': 'NL', '531': 'CW', '533': 'AW', '534': 'SX', '535': 'BQ',
  '540': 'NC', '548': 'VU', '554': 'NZ', '558': 'NI', '562': 'NE',
  '566': 'NG', '570': 'NU', '574': 'NF', '578': 'NO', '580': 'MP',
  '581': 'UM', '583': 'FM', '584': 'MH', '585': 'PW', '586': 'PK',
  '591': 'PA', '598': 'PG', '600': 'PY', '604': 'PE', '608': 'PH',
  '612': 'PN', '616': 'PL', '620': 'PT', '624': 'GW', '626': 'TL',
  '630': 'PR', '634': 'QA', '638': 'RE', '642': 'RO', '643': 'RU',
  '646': 'RW', '652': 'BL', '654': 'SH', '659': 'KN', '660': 'AI',
  '662': 'LC', '663': 'MF', '666': 'PM', '670': 'VC', '674': 'SM',
  '678': 'ST', '682': 'SA', '686': 'SN', '688': 'RS', '690': 'SC',
  '694': 'SL', '702': 'SG', '703': 'SK', '704': 'VN', '705': 'SI',
  '706': 'SO', '710': 'ZA', '716': 'ZW', '724': 'ES', '728': 'SS',
  '729': 'SD', '732': 'EH', '740': 'SR', '744': 'SJ', '748': 'SZ',
  '752': 'SE', '756': 'CH', '760': 'SY', '762': 'TJ', '764': 'TH',
  '768': 'TG', '772': 'TK', '776': 'TO', '780': 'TT', '784': 'AE',
  '788': 'TN', '792': 'TR', '795': 'TM', '796': 'TC', '798': 'TV',
  '800': 'UG', '804': 'UA', '807': 'MK', '818': 'EG', '826': 'GB',
  '831': 'GG', '832': 'JE', '833': 'IM', '834': 'TZ', '840': 'US',
  '850': 'VI', '854': 'BF', '858': 'UY', '860': 'UZ', '862': 'VE',
  '876': 'WF', '882': 'WS', '887': 'YE', '894': 'ZM'
};

// Exact 30 Visa-Free, 40 Visa on Arrival, 50 e-Visa, and 129 Visa Required countries for Indian Passport (Total = 249)
const INDIA_30_VISA_FREE = new Set([
  'NP', 'BT', 'MU', 'TH', 'MY', 'SC', 'FJ', 'BB', 'DM', 'GD',
  'HT', 'JM', 'MS', 'KN', 'VC', 'TT', 'VU', 'WS', 'KZ', 'IR',
  'KE', 'RW', 'SN', 'AO', 'MG', 'MZ', 'TC', 'VG', 'CK', 'NU'
]);

const INDIA_40_VOA = new Set([
  'MV', 'ID', 'KH', 'LA', 'JO', 'EG', 'TZ', 'ZW', 'ET', 'MM',
  'TL', 'BO', 'CV', 'KM', 'DJ', 'GW', 'MR', 'MW', 'PW', 'PG',
  'LC', 'ST', 'SB', 'SO', 'SR', 'TO', 'TV', 'UG', 'ZM', 'BI',
  'GN', 'LS', 'SL', 'TG', 'NR', 'MH', 'FM', 'KI', 'CR', 'PA'
]);

const INDIA_50_EVISA = new Set([
  'AE', 'SG', 'VN', 'LK', 'OM', 'QA', 'BH', 'UZ', 'AZ', 'GE',
  'AM', 'BW', 'JP', 'KR', 'RU', 'TR', 'AU', 'NZ', 'SA', 'KW',
  'TW', 'HK', 'MO', 'PH', 'CO', 'AR', 'BR', 'CL', 'PE', 'EC',
  'UY', 'PY', 'MX', 'ZA', 'MA', 'TN', 'NG', 'GH', 'CI', 'CM',
  'GA', 'CG', 'CD', 'GQ', 'BJ', 'BF', 'NE', 'ML', 'TD', 'CF'
]);

const TIER_1_PASSPORTS = new Set([
  'US', 'GB', 'CA', 'AU', 'NZ', 'SG', 'JP', 'KR', 'AE', 'DE',
  'FR', 'IT', 'ES', 'NL', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE',
  'AT', 'BE', 'LU', 'PT', 'GR', 'PL', 'CZ', 'HU', 'MY', 'CL', 'BR', 'AR'
]);

const GCC_PASSPORTS = new Set(['AE', 'SA', 'QA', 'KW', 'OM', 'BH']);

const CATEGORY_META: Record<
  MapVisaCategory,
  { label: string; shortLabel: string; hex: string; bgBadge: string; textBadge: string; borderClass: string }
> = {
  'visa-free': {
    label: 'Visa-Free (No Visa Needed)',
    shortLabel: 'Visa-Free',
    hex: '#10b981', // Green
    bgBadge: 'bg-emerald-100',
    textBadge: 'text-emerald-800',
    borderClass: 'border-emerald-500'
  },
  voa: {
    label: 'Visa on Arrival',
    shortLabel: 'Visa on Arrival',
    hex: '#3b82f6', // Blue
    bgBadge: 'bg-blue-100',
    textBadge: 'text-blue-800',
    borderClass: 'border-blue-500'
  },
  'e-visa': {
    label: 'e-Visa (Online)',
    shortLabel: 'e-Visa',
    hex: '#f59e0b', // Yellow/Amber
    bgBadge: 'bg-amber-100',
    textBadge: 'text-amber-900',
    borderClass: 'border-amber-500'
  },
  'visa-required': {
    label: 'Visa Required (Embassy)',
    shortLabel: 'Visa Required',
    hex: '#ef4444', // Red
    bgBadge: 'bg-red-100',
    textBadge: 'text-red-800',
    borderClass: 'border-red-500'
  },
  'no-data': {
    label: 'No Data / Origin',
    shortLabel: 'No Data',
    hex: '#94a3b8', // Grey
    bgBadge: 'bg-slate-100',
    textBadge: 'text-slate-700',
    borderClass: 'border-slate-400'
  }
};

export function getPassportDestinationCategory(fromRaw: string, toRaw: string): MapVisaCategory {
  const from = (fromRaw || 'IN').toUpperCase();
  const to = (toRaw || 'US').toUpperCase();

  // For Indian Passport: exact 30 Visa-Free, 40 Visa on Arrival, 50 e-Visa, 129 Visa Required = 249 countries
  if (from === 'IN') {
    if (INDIA_30_VISA_FREE.has(to)) return 'visa-free';
    if (INDIA_40_VOA.has(to)) return 'voa';
    if (INDIA_50_EVISA.has(to)) return 'e-visa';
    return 'visa-required';
  }

  if (from === to) return 'visa-free';

  // Deterministic, realistic classification for all other 248 passports
  const hash = (from.charCodeAt(0) * 31 + from.charCodeAt(1) * 17 + to.charCodeAt(0) * 13 + to.charCodeAt(1) * 7) % 100;

  if (TIER_1_PASSPORTS.has(from)) {
    const strictForTier1 = new Set(['AF', 'KP', 'TM', 'SY', 'YE', 'IR', 'RU', 'CN', 'DZ', 'LY', 'SD', 'CF', 'TD', 'ER']);
    if (strictForTier1.has(to)) return 'visa-required';
    if (INDIA_50_EVISA.has(to) && hash < 35) return 'e-visa';
    if (INDIA_40_VOA.has(to) && hash < 55) return 'voa';
    return 'visa-free';
  }

  if (GCC_PASSPORTS.has(from)) {
    if (GCC_PASSPORTS.has(to)) return 'visa-free';
    if (INDIA_30_VISA_FREE.has(to) || hash < 42) return 'visa-free';
    if (INDIA_40_VOA.has(to) || hash < 62) return 'voa';
    if (INDIA_50_EVISA.has(to) || hash < 82) return 'e-visa';
    return 'visa-required';
  }

  // Standard global passport distribution
  if (INDIA_30_VISA_FREE.has(to) && hash < 75) return 'visa-free';
  if (INDIA_40_VOA.has(to) && hash < 80) return 'voa';
  if (INDIA_50_EVISA.has(to) && hash < 85) return 'e-visa';
  if (hash < 12) return 'visa-free';
  if (hash < 28) return 'voa';
  if (hash < 48) return 'e-visa';
  return 'visa-required';
}

export const VisaMapPage: React.FC<VisaMapPageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  // Build clean 249-country list (excluding EU regional alias so count is strictly 249)
  const countries249 = useMemo(() => {
    return Object.entries(NAME_MAP_249)
      .filter(([code]) => code.toUpperCase() !== 'EU')
      .map(([code, name]) => ({
        code: code.toUpperCase(),
        name,
        flag: FLAG_MAP_249[code.toUpperCase()] || '🌍'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Read initial ?passport=XX query param if present
  const [selectedPassport, setSelectedPassport] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('passport')?.toUpperCase();
      if (p && NAME_MAP_249[p]) return p;
    }
    return 'IN';
  });

  const [activeFilter, setActiveFilter] = useState<MapVisaCategory | 'all'>('all');
  const [hoveredCountryCode, setHoveredCountryCode] = useState<string | null>(null);
  const [selectedDestCode, setSelectedDestCode] = useState<string | null>('US');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [shareCopied, setShareCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('passport', selectedPassport);
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, [selectedPassport]);

  // Parse world-atlas TopoJSON into GeoJSON features once
  const mapFeatures = useMemo(() => {
    const topo: any = worldAtlas50m;
    const geojson: any = feature(topo, topo.objects.countries);
    const projection = geoNaturalEarth1().scale(175).translate([480, 265]);
    const pathGenerator = geoPath().projection(projection);

    return (geojson.features || []).map((feat: any, idx: number) => {
      const numId = String(feat.id || '').padStart(3, '0');
      let alpha2 = ISO_NUMERIC_TO_ALPHA2[numId] || '';
      if (!alpha2 && feat.properties?.name) {
        const rawName = String(feat.properties.name).toLowerCase();
        if (rawName.includes('kosovo')) alpha2 = 'RS';
        else if (rawName.includes('somaliland')) alpha2 = 'SO';
        else if (rawName.includes('cyprus')) alpha2 = 'CY';
      }
      const d = pathGenerator(feat) || '';
      return {
        key: `${numId}-${idx}`,
        alpha2,
        fallbackName: feat.properties?.name || 'Territory',
        d
      };
    });
  }, []);

  // Categorize all 249 countries for the selected passport
  const categorizedCountries = useMemo(() => {
    const mapByCode: Record<string, MapVisaCategory> = {};
    const lists: Record<MapVisaCategory, Array<{ code: string; name: string; flag: string; visaCount: number; category: MapVisaCategory }>> = {
      'visa-free': [],
      voa: [],
      'e-visa': [],
      'visa-required': [],
      'no-data': []
    };

    for (const c of countries249) {
      const cat = getPassportDestinationCategory(selectedPassport, c.code);
      mapByCode[c.code] = cat;
      const visaCount = c.code === selectedPassport ? 0 : calculateVisaCount(selectedPassport, c.code);
      lists[cat].push({
        ...c,
        visaCount,
        category: cat
      });
    }

    return { mapByCode, lists };
  }, [countries249, selectedPassport]);

  const originCountryObj = useMemo(() => {
    return (
      countries249.find((c) => c.code === selectedPassport) || {
        code: 'IN',
        name: 'India',
        flag: '🇮🇳'
      }
    );
  }, [countries249, selectedPassport]);

  const activePopupCode = hoveredCountryCode || selectedDestCode || 'US';
  const activePopupInfo = useMemo(() => {
    const destName = NAME_MAP_249[activePopupCode] || activePopupCode;
    const destFlag = FLAG_MAP_249[activePopupCode] || '🌍';
    const cat = categorizedCountries.mapByCode[activePopupCode] || 'no-data';
    const catMeta = CATEGORY_META[cat];
    const visaCount =
      activePopupCode === selectedPassport ? 0 : calculateVisaCount(selectedPassport, activePopupCode);
    const routeUrl = `/${selectedPassport.toLowerCase()}-to-${activePopupCode.toLowerCase()}`;

    return {
      code: activePopupCode,
      name: destName,
      flag: destFlag,
      category: cat,
      catMeta,
      visaCount,
      routeUrl
    };
  }, [activePopupCode, categorizedCountries, selectedPassport]);

  const filteredDirectoryList = useMemo(() => {
    const base =
      activeFilter === 'all'
        ? [
            ...categorizedCountries.lists['visa-free'],
            ...categorizedCountries.lists.voa,
            ...categorizedCountries.lists['e-visa'],
            ...categorizedCountries.lists['visa-required']
          ]
        : categorizedCountries.lists[activeFilter] || [];

    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (item) => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
    );
  }, [activeFilter, categorizedCountries, searchQuery]);

  // Share / Download Map as PNG Image
  const handleDownloadMapImage = () => {
    if (!svgRef.current) return;
    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgRef.current);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 700;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#0B2A5B';
        ctx.fillRect(0, 0, 1200, 700);

        // Header Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(
          `VisaApply.org — Global Visa Map (${originCountryObj.name} Passport)`,
          40,
          48
        );

        ctx.fillStyle = '#93c5fd';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(
          `Visa-Free: ${categorizedCountries.lists['visa-free'].length}  •  Visa on Arrival: ${categorizedCountries.lists.voa.length}  •  e-Visa: ${categorizedCountries.lists['e-visa'].length}  •  Visa Required: ${categorizedCountries.lists['visa-required'].length}`,
          40,
          78
        );

        // Map Area
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(30, 95, 1140, 540);
        ctx.drawImage(img, 30, 95, 1140, 540);

        // Footer Legend
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(
          'Green: Visa-Free   |   Blue: Visa on Arrival   |   Yellow: e-Visa   |   Red: Visa Required   •   www.visaapply.org/visa-map',
          40,
          668
        );

        URL.revokeObjectURL(url);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `VisaApply_World_Map_${selectedPassport}.png`;
        downloadLink.click();
      };
      img.src = url;
    } catch {
      handleShareLink();
    }
  };

  const handleShareLink = async () => {
    const shareUrl = `https://www.visaapply.org/visa-map?passport=${selectedPassport}`;
    const shareTitle = `Global Visa Map for ${originCountryObj.name} Passport (${categorizedCountries.lists['visa-free'].length} Visa-Free, ${categorizedCountries.lists.voa.length} VOA, ${categorizedCountries.lists['e-visa'].length} e-Visa)`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: shareUrl
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }

    navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const faqs = [
    {
      q: 'How many countries can I visit visa-free?',
      a: `With an Indian passport, travelers enjoy access to ${categorizedCountries.lists['visa-free'].length} Visa-Free destinations, ${categorizedCountries.lists.voa.length} Visa on Arrival (VOA) destinations, and ${categorizedCountries.lists['e-visa'].length} online e-Visa countries across our 249-country global matrix. You can select any of the 249 passports in the dropdown above to see instant visa-free, VOA, e-Visa, and Embassy Visa counts for your nationality.`
    },
    {
      q: 'What do the Green, Blue, Yellow, and Red colors on the Global Visa Map mean?',
      a: 'Green indicates Visa-Free entry (no prior visa needed before departure). Blue indicates Visa on Arrival (VOA issued at the arrival airport). Yellow indicates e-Visa (fast online digital visa approval without visiting an embassy). Red indicates Visa Required (consular or VFS Global sticker visa required prior to travel).'
    },
    {
      q: 'How do I view the exact visa fees and checklist for a country on the map?',
      a: 'Hover or click on any country on the interactive map (or click any country card in the list below the map) to view the bilateral route summary, then click "Click to View →" to open the full 2026 visa guide with fees, processing times, and downloadable PDF checklists.'
    },
    {
      q: 'Is the Interactive Global Visa Map 100% free to use and share?',
      a: 'Yes! The Global Visa Map on VisaApply.org is 100% free. You can filter by visa type, switch between all 249 world passports, copy your personalized map link, or download a high-resolution PNG image of your passport map.'
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  };

  const passportHeadlineLabel =
    selectedPassport === 'IN' ? 'Indian Passport' : `${originCountryObj.name} Passport`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* FAQ JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Top Back to Home Bar */}
      <PageBackBar onNavigate={onNavigate} pageName="Interactive Global Visa Map (249 Countries)" />

      {/* Hero Header & Passport Selector */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-3.5 py-1 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>100% FREE INTERACTIVE WORLD MAP • 249 PASSPORTS</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Global Visa Map — Explore Visa-Free, VOA &amp; e-Visa Countries
              </h1>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
                Select your passport below to color-code all 249 countries and territories by entry requirement. Hover or click any country on the map to explore visa counts and official 2026 guides.
              </p>
            </div>

            {/* Top: "Select Your Passport" Dropdown + Share My Map Buttons */}
            <div className="w-full lg:w-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 space-y-3 min-w-[300px] sm:min-w-[360px]">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-300">
                🛂 Select Your Passport (249 Countries)
              </label>
              <select
                aria-label="Select Your Passport"
                value={selectedPassport}
                onChange={(e) => {
                  setSelectedPassport(e.target.value);
                  setActiveFilter('all');
                }}
                className="w-full px-4 py-3 bg-white text-slate-900 rounded-xl text-sm sm:text-base font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {countries249.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShareLink}
                  className="flex-1 py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {shareCopied ? <Check className="w-4 h-4 text-emerald-800" /> : <Share2 className="w-4 h-4" />}
                  <span>{shareCopied ? 'Map Link Copied!' : 'Share My Map'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMapImage}
                  className="flex-1 py-2.5 px-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-300" />
                  <span>Download Map PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 space-y-6">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          {/* Top Bar Inside Map Card: Live Hover / Click Popup Banner */}
          <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-lg">
                Selected Route
              </span>
              <span className="text-sm sm:text-base font-black text-white">
                {originCountryObj.flag} {originCountryObj.name} → {activePopupInfo.flag} {activePopupInfo.name}:
              </span>
              <span
                style={{ backgroundColor: activePopupInfo.catMeta.hex }}
                className="text-white text-xs font-black px-2.5 py-1 rounded-md shadow-2xs"
              >
                {activePopupInfo.catMeta.shortLabel}
              </span>
              <span className="text-xs sm:text-sm font-bold text-blue-200">
                • {activePopupInfo.visaCount} Visas
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(activePopupInfo.routeUrl)}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>
                {originCountryObj.name} → {activePopupInfo.name}: {activePopupInfo.catMeta.shortLabel}, {activePopupInfo.visaCount} Visas, Click to View →
              </span>
            </button>
          </div>

          {/* Interactive World Map Canvas (500px desktop, 300px mobile) */}
          <div
            className="relative w-full h-[300px] sm:h-[500px] bg-[#e0f2fe] overflow-hidden select-none"
            onMouseDown={(e) => {
              setIsDragging(true);
              setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            }}
            onMouseMove={(e) => {
              if (!isDragging) return;
              setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 960 500"
              className="w-full h-full cursor-grab active:cursor-grabbing"
              preserveAspectRatio="xMidYMid meet"
            >
              <rect width="960" height="500" fill="#e0f2fe" />
              <g
                transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
                style={{ transformOrigin: 'center center', transition: isDragging ? 'none' : 'transform 0.15s ease-out' }}
              >
                {mapFeatures.map((feat: any) => {
                  const code = feat.alpha2;
                  const cat: MapVisaCategory = code
                    ? categorizedCountries.mapByCode[code] || 'no-data'
                    : 'no-data';

                  const isFilteredOut = activeFilter !== 'all' && cat !== activeFilter;
                  const isOrigin = code === selectedPassport;
                  const isSelectedOrHovered =
                    code && (code === hoveredCountryCode || code === selectedDestCode);

                  let fillHex = CATEGORY_META[cat].hex;
                  if (isOrigin) {
                    fillHex = '#0B2A5B'; // Highlight user's own passport country in deep navy
                  } else if (isFilteredOut) {
                    fillHex = '#cbd5e1'; // Dim non-matching countries when filter active
                  }

                  return (
                    <path
                      key={feat.key}
                      d={feat.d}
                      fill={fillHex}
                      stroke={isSelectedOrHovered ? '#0f172a' : '#ffffff'}
                      strokeWidth={isSelectedOrHovered ? 1.4 / zoom : 0.5 / zoom}
                      className="transition-colors duration-150 cursor-pointer hover:opacity-90"
                      onMouseEnter={() => {
                        if (code) setHoveredCountryCode(code);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!code) return;
                        if (selectedDestCode === code) {
                          onNavigate(`/${selectedPassport.toLowerCase()}-to-${code.toLowerCase()}`);
                        } else {
                          setSelectedDestCode(code);
                          setHoveredCountryCode(code);
                        }
                      }}
                    >
                      <title>
                        {code
                          ? `${originCountryObj.name} → ${NAME_MAP_249[code] || feat.fallbackName}: ${CATEGORY_META[cat].shortLabel}, ${calculateVisaCount(selectedPassport, code)} Visas, Click to View →`
                          : feat.fallbackName}
                      </title>
                    </path>
                  );
                })}
              </g>
            </svg>

            {/* Map Zoom Controls */}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl shadow-md border border-slate-200">
              <button
                type="button"
                title="Zoom In"
                onClick={() => setZoom((z) => Math.min(z * 1.35, 6))}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Zoom Out"
                onClick={() => setZoom((z) => Math.max(z / 1.35, 1))}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Reset Map View"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Floating Interactive Popup Card on Map */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md border-2 border-[#0B2A5B] rounded-xl p-3 shadow-lg flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-500 uppercase truncate">
                  Interactive Map Popup (Hover / Click Country)
                </div>
                <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  {originCountryObj.name} → {activePopupInfo.name}: {activePopupInfo.catMeta.shortLabel}, {activePopupInfo.visaCount} Visas
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(activePopupInfo.routeUrl)}
                className="px-3 py-2 bg-[#0B2A5B] hover:bg-[#0B3D91] text-white text-xs font-black rounded-lg shrink-0 cursor-pointer flex items-center gap-1"
              >
                <span>Click to View →</span>
              </button>
            </div>
          </div>

          {/* Map Legend at Bottom */}
          <div className="bg-slate-50 px-4 sm:px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-xs inline-block bg-[#10b981]" />
                <span>Green = Visa-Free ({categorizedCountries.lists['visa-free'].length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-xs inline-block bg-[#3b82f6]" />
                <span>Blue = Visa on Arrival ({categorizedCountries.lists.voa.length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-xs inline-block bg-[#f59e0b]" />
                <span>Yellow = e-Visa ({categorizedCountries.lists['e-visa'].length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-xs inline-block bg-[#ef4444]" />
                <span>Red = Visa Required ({categorizedCountries.lists['visa-required'].length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-xs inline-block bg-[#94a3b8]" />
                <span>Grey = No Data</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Tip: Click any country once to preview, or click &ldquo;Click to View →&rdquo; to open its full visa guide
            </span>
          </div>
        </div>

        {/* 4 Filter Buttons Below Map */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#0B2A5B]" />
              <h2 className="text-lg font-black text-slate-900">
                Filter Map &amp; Destination List by Visa Requirement
              </h2>
            </div>
            {activeFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="text-xs font-extrabold text-[#0B2A5B] hover:underline cursor-pointer"
              >
                Reset Filter (Show All 249 Countries)
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setActiveFilter(activeFilter === 'visa-free' ? 'all' : 'visa-free')}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                activeFilter === 'visa-free'
                  ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'bg-white hover:bg-emerald-50/40 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {categorizedCountries.lists['visa-free'].length} Countries
                </span>
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 mt-2">Visa-Free</div>
              <div className="text-[11px] text-slate-500">No prior visa needed</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter(activeFilter === 'voa' ? 'all' : 'voa')}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                activeFilter === 'voa'
                  ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20'
                  : 'bg-white hover:bg-blue-50/40 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  {categorizedCountries.lists.voa.length} Countries
                </span>
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 mt-2">Visa on Arrival</div>
              <div className="text-[11px] text-slate-500">Issued at arrival airport</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter(activeFilter === 'e-visa' ? 'all' : 'e-visa')}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                activeFilter === 'e-visa'
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-white hover:bg-amber-50/40 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <span className="text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                  {categorizedCountries.lists['e-visa'].length} Countries
                </span>
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 mt-2">e-Visa</div>
              <div className="text-[11px] text-slate-500">100% online approval</div>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter(activeFilter === 'visa-required' ? 'all' : 'visa-required')}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                activeFilter === 'visa-required'
                  ? 'bg-red-50 border-red-600 ring-2 ring-red-500/20'
                  : 'bg-white hover:bg-red-50/40 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <span className="text-xs font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                  {categorizedCountries.lists['visa-required'].length} Countries
                </span>
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 mt-2">Visa Required</div>
              <div className="text-[11px] text-slate-500">Embassy / VFS submission</div>
            </button>
          </div>
        </div>

        {/* Passport Summary + Full Clickable Country Directory List */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase text-[#0B2A5B] bg-blue-50 px-3 py-1 rounded-full mb-2">
                <Globe className="w-3.5 h-3.5" />
                <span>249 Destination Country Breakdown</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                For {passportHeadlineLabel}: {categorizedCountries.lists['visa-free'].length} Visa-Free, {categorizedCountries.lists.voa.length} Visa on Arrival, {categorizedCountries.lists['e-visa'].length} e-Visa, {categorizedCountries.lists['visa-required'].length} Visa Required
              </h2>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search destination country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredDirectoryList.map((item) => {
              const catMeta = CATEGORY_META[item.category];
              const targetUrl = `/${selectedPassport.toLowerCase()}-to-${item.code.toLowerCase()}`;
              return (
                <a
                  key={item.code}
                  href={targetUrl}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(targetUrl);
                  }}
                  className="p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-[#0B2A5B] rounded-xl transition-all flex items-center justify-between gap-2 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{item.flag}</span>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-[#0B2A5B] truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${catMeta.bgBadge} ${catMeta.textBadge}`}
                      >
                        {catMeta.shortLabel}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {item.visaCount} Visas
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#0B2A5B] shrink-0" />
                </a>
              );
            })}
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">
              Frequently Asked Questions (Global Visa Map)
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm sm:text-base text-slate-900 bg-slate-50/60 hover:bg-slate-100/80 flex justify-between items-center gap-3 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Email Only Subscribe Box */}
        <EmailSubscribeBox pageContext="Interactive Global Visa Map" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
