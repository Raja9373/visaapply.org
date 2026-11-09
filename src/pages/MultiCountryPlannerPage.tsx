import React, { useState, useMemo } from 'react';
import {
  Globe,
  Plane,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  DollarSign,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Info,
  ExternalLink
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { NAME_MAP_249, FLAG_MAP_249 } from '../data/fullVisaDatabase';
import { calculateVisaCount } from '../data/anyToAnyMatrix';
import { getPassportDestinationCategory, MapVisaCategory } from './VisaMapPage';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface MultiCountryPlannerPageProps {
  onNavigate?: (path: string) => void;
}

// 29 Schengen Area Member States (2026)
const SCHENGEN_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE',
  'GR', 'HU', 'IS', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL',
  'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'CH'
]);

interface CountryTripVisaRow {
  code: string;
  name: string;
  flag: string;
  isSchengen: boolean;
  category: MapVisaCategory;
  visaTypeNeeded: string;
  feeUsd: number;
  feeDisplay: string;
  processingDaysMax: number;
  processingTimeDisplay: string;
  stayAllowed: string;
  documents: string[];
  visaSubclassesCount: number;
}

const COUNTRY_SPECIFIC_RULES: Record<
  string,
  {
    feeUsd: number;
    feeDisplay: string;
    processingDaysMax: number;
    processingTimeDisplay: string;
    stayAllowed: string;
    documents: string[];
  }
> = {
  US: {
    feeUsd: 185,
    feeDisplay: '$185 (~₹15,500)',
    processingDaysMax: 20,
    processingTimeDisplay: '15–20 Working Days',
    stayAllowed: 'Up to 180 Days (10-Yr B1/B2)',
    documents: [
      'Valid Passport (6+ months validity)',
      'DS-160 Confirmation Page & Barcode',
      'US Visa Fee Receipt ($185 MRV)',
      '2x2 inch White Background Photo',
      'Last 6 Months Bank Statements & 3 Years ITR',
      'Employer NOC / Business Proof'
    ]
  },
  GB: {
    feeUsd: 145,
    feeDisplay: '£115 / $145 (~₹12,200)',
    processingDaysMax: 15,
    processingTimeDisplay: '15 Working Days',
    stayAllowed: 'Up to 180 Days (6-Month Standard)',
    documents: [
      'Valid Passport & GOV.UK Online Form',
      'VFS Biometrics Appointment Confirmation',
      '6 Months Stamped Bank Statements & Salary Slips',
      'Confirmed Flight & Hotel Itinerary',
      'Employer Leave Approval Letter (NOC)'
    ]
  },
  CA: {
    feeUsd: 135,
    feeDisplay: 'CAD $185 / $135 (~₹11,400)',
    processingDaysMax: 21,
    processingTimeDisplay: '14–21 Working Days',
    stayAllowed: 'Up to 180 Days per Entry',
    documents: [
      'Passport & IMM 5257 TRV Application Form',
      'Biometrics Confirmation Receipt',
      '6 Months Bank Statements & ITR-V (3 Years)',
      'Detailed Cover Letter & Trip Itinerary',
      'Employment & Property Ties Proof'
    ]
  },
  AU: {
    feeUsd: 130,
    feeDisplay: 'AUD $195 / $130 (~₹10,900)',
    processingDaysMax: 14,
    processingTimeDisplay: '10–14 Working Days',
    stayAllowed: 'Up to 90 Days per Visit (Subclass 600)',
    documents: [
      'ImmiAccount Online Form (Subclass 600)',
      'Passport Bio & Stamp Pages Scan',
      '6 Months Bank Statements & Tax Returns',
      'Employer NOC & Leave Sanction Letter',
      'Day-by-Day Travel & Hotel Plan'
    ]
  },
  AE: {
    feeUsd: 95,
    feeDisplay: '$95 (~₹7,900)',
    processingDaysMax: 4,
    processingTimeDisplay: '2–4 Working Days',
    stayAllowed: '30 Days (Single / Multiple Entry)',
    documents: [
      'Passport Scan (6+ months validity)',
      'Digital Passport Photo (White Background)',
      'Confirmed Return Flight Ticket',
      'Hotel Booking Voucher (Booking.com)'
    ]
  },
  SG: {
    feeUsd: 35,
    feeDisplay: 'SGD $30 / $35 (~₹2,900)',
    processingDaysMax: 5,
    processingTimeDisplay: '3–5 Working Days',
    stayAllowed: 'Up to 30 Days per Entry',
    documents: [
      'Form 14A Signed Application',
      '35x45mm Matte Finish Photo',
      '3 Months Bank Statement',
      'Confirmed Return Flight & Hotel Voucher',
      'SG Arrival Card (3 Days Before Arrival)'
    ]
  },
  JP: {
    feeUsd: 28,
    feeDisplay: '$28 (~₹2,350)',
    processingDaysMax: 6,
    processingTimeDisplay: '5–6 Working Days',
    stayAllowed: 'Up to 15 or 30 Days',
    documents: [
      'Valid Passport & Japan Visa Application Form',
      '2x2 inch Photo (White Background)',
      'Day-by-Day Schedule of Stay (Taizai Yoteihyo)',
      'Last 6 Months Bank Statement & 3 Years ITR',
      'Confirmed Flight & Hotel Reservations'
    ]
  },
  CH: {
    feeUsd: 98,
    feeDisplay: '€90 / $98 (~₹8,200)',
    processingDaysMax: 15,
    processingTimeDisplay: '10–15 Working Days',
    stayAllowed: '90 Days in 180-Day Period (Schengen)',
    documents: [
      'Schengen Visa Form & Passport (2 Blank Pages)',
      '35x45mm Biometric Photos (80% Face Coverage)',
      '€30,000 Travel Medical Insurance',
      'Verifiable Flight PNR & Hotel Bookings',
      '6 Months Stamped Bank Statements & 3 Years ITR'
    ]
  }
};

const TRANSIT_HUBS = [
  {
    code: 'DXB',
    label: 'Via Dubai (DXB / UAE) — Emirates / flydubai / IndiGo',
    countryCode: 'AE'
  },
  {
    code: 'LHR',
    label: 'Via London Heathrow (LHR / UK) — British Airways / Virgin Atlantic',
    countryCode: 'GB'
  },
  {
    code: 'DOH',
    label: 'Via Doha (DOH / Qatar) — Qatar Airways',
    countryCode: 'QA'
  },
  {
    code: 'IST',
    label: 'Via Istanbul (IST / Turkey) — Turkish Airlines / IndiGo',
    countryCode: 'TR'
  },
  {
    code: 'SIN',
    label: 'Via Singapore Changi (SIN) — Singapore Airlines / Scoot',
    countryCode: 'SG'
  },
  {
    code: 'DIRECT',
    label: 'Direct Non-Stop Flight (No Third-Country Transit)',
    countryCode: ''
  }
];

const POPULAR_TRIP_PRESETS = [
  {
    label: '🇪🇺 Classic Europe (France + Germany + Italy)',
    passport: 'IN',
    destinations: ['FR', 'DE', 'IT'],
    transit: 'DXB'
  },
  {
    label: '🏔️ Central Europe (France + Switzerland + Netherlands + Germany)',
    passport: 'IN',
    destinations: ['FR', 'CH', 'NL', 'DE'],
    transit: 'DXB'
  },
  {
    label: '🇬🇧 UK + Schengen (UK + France + Italy)',
    passport: 'IN',
    destinations: ['GB', 'FR', 'IT'],
    transit: 'DXB'
  },
  {
    label: '🌴 Southeast Asia (Thailand + Malaysia + Singapore)',
    passport: 'IN',
    destinations: ['TH', 'MY', 'SG'],
    transit: 'DIRECT'
  }
];

function buildCountryTripVisaRow(fromPassport: string, toCodeRaw: string): CountryTripVisaRow {
  const from = (fromPassport || 'IN').toUpperCase();
  const to = (toCodeRaw || 'FR').toUpperCase();
  const name = NAME_MAP_249[to] || to;
  const flag = FLAG_MAP_249[to] || '🌍';
  const isSchengen = SCHENGEN_COUNTRIES.has(to);
  const category = getPassportDestinationCategory(from, to);
  const visaSubclassesCount = calculateVisaCount(from, to);

  if (category === 'visa-free') {
    return {
      code: to,
      name,
      flag,
      isSchengen,
      category,
      visaTypeNeeded: 'Visa-Free',
      feeUsd: 0,
      feeDisplay: '$0 (Free Entry)',
      processingDaysMax: 0,
      processingTimeDisplay: 'Instant (0 Days)',
      stayAllowed: to === 'TH' || to === 'MY' ? '30–60 Days' : 'Up to 30–90 Days',
      documents: [
        'Original Passport (Minimum 6 months validity)',
        'Confirmed Return or Onward Flight Ticket',
        'Hotel Booking Confirmation / Proof of Stay',
        'Proof of Sufficient Funds ($50–$100/day)'
      ],
      visaSubclassesCount
    };
  }

  if (category === 'voa') {
    return {
      code: to,
      name,
      flag,
      isSchengen,
      category,
      visaTypeNeeded: 'Visa on Arrival',
      feeUsd: 35,
      feeDisplay: '$35 (~₹2,900)',
      processingDaysMax: 1,
      processingTimeDisplay: 'At Airport (15–30 Mins)',
      stayAllowed: '30 Days',
      documents: [
        'Valid Passport (6+ months validity & 2 blank pages)',
        '2 Passport-Size Photographs (White Background)',
        'Confirmed Return Flight Ticket',
        'Verified Hotel Reservation Voucher',
        'USD Cash / International Card for VOA Fee'
      ],
      visaSubclassesCount
    };
  }

  if (category === 'e-visa') {
    const custom = COUNTRY_SPECIFIC_RULES[to];
    if (custom) {
      return {
        code: to,
        name,
        flag,
        isSchengen,
        category,
        visaTypeNeeded: 'e-Visa',
        feeUsd: custom.feeUsd,
        feeDisplay: custom.feeDisplay,
        processingDaysMax: custom.processingDaysMax,
        processingTimeDisplay: custom.processingTimeDisplay,
        stayAllowed: custom.stayAllowed,
        documents: custom.documents,
        visaSubclassesCount
      };
    }

    return {
      code: to,
      name,
      flag,
      isSchengen,
      category,
      visaTypeNeeded: 'e-Visa',
      feeUsd: 55,
      feeDisplay: '$55 (~₹4,600)',
      processingDaysMax: 4,
      processingTimeDisplay: '3–4 Working Days',
      stayAllowed: '30 Days (Online e-Visa)',
      documents: [
        'Passport Bio-Page High-Res Scan (PDF/JPG)',
        'Digital Biometric Photo (White Background)',
        'Confirmed Return Flight Itinerary',
        'Hotel Booking Confirmation',
        'Last 3 Months Bank Statement'
      ],
      visaSubclassesCount
    };
  }

  // Visa Required (Embassy / VFS)
  if (isSchengen) {
    return {
      code: to,
      name,
      flag,
      isSchengen: true,
      category: 'visa-required',
      visaTypeNeeded: 'Visa Required (Schengen Type C)',
      feeUsd: 98,
      feeDisplay: '€90 / $98 (~₹8,200)',
      processingDaysMax: 15,
      processingTimeDisplay: '10–15 Working Days',
      stayAllowed: '90 Days in 180-Day Period',
      documents: [
        'Schengen Visa Form & Passport (6+ months validity)',
        '2 Biometric Photos (35x45mm, 80% Face)',
        '€30,000 Schengen Travel Medical Insurance',
        'Cross-Border Flight & Train Itinerary + Hotel Bookings',
        'Last 6 Months Stamped Bank Statements & 3 Years ITR',
        'Employer NOC / Leave Approval & Cover Letter'
      ],
      visaSubclassesCount
    };
  }

  const custom = COUNTRY_SPECIFIC_RULES[to];
  if (custom) {
    return {
      code: to,
      name,
      flag,
      isSchengen,
      category: 'visa-required',
      visaTypeNeeded: 'Visa Required',
      feeUsd: custom.feeUsd,
      feeDisplay: custom.feeDisplay,
      processingDaysMax: custom.processingDaysMax,
      processingTimeDisplay: custom.processingTimeDisplay,
      stayAllowed: custom.stayAllowed,
      documents: custom.documents,
      visaSubclassesCount
    };
  }

  return {
    code: to,
    name,
    flag,
    isSchengen,
    category: 'visa-required',
    visaTypeNeeded: 'Visa Required',
    feeUsd: 110,
    feeDisplay: '$110 (~₹9,200)',
    processingDaysMax: 12,
    processingTimeDisplay: '10–12 Working Days',
    stayAllowed: 'Up to 30–90 Days',
    documents: [
      'Completed Embassy Visa Application Form & Passport',
      '2 Recent Biometric Passport Photos',
      'Confirmed Round-Trip Flight Reservation',
      'Hotel Accommodation Vouchers',
      'Last 6 Months Bank Statements & 3 Years ITR',
      'Formal Cover Letter & Employment Proof'
    ],
    visaSubclassesCount
  };
}

export const MultiCountryPlannerPage: React.FC<MultiCountryPlannerPageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
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

  const [selectedPassport, setSelectedPassport] = useState<string>('IN');
  const [destinations, setDestinations] = useState<string[]>(['FR', 'DE', 'IT']);
  const [selectedTransitHub, setSelectedTransitHub] = useState<string>('DXB');
  const [hasChecked, setHasChecked] = useState<boolean>(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const originCountry = useMemo(() => {
    return (
      countries249.find((c) => c.code === selectedPassport) || {
        code: 'IN',
        name: 'India',
        flag: '🇮🇳'
      }
    );
  }, [countries249, selectedPassport]);

  const handleAddCountry = () => {
    if (destinations.length >= 5) return;
    const candidatePool = ['CH', 'NL', 'ES', 'AT', 'BE', 'GB', 'AE', 'SG', 'TH', 'US'];
    const nextCode =
      candidatePool.find((c) => !destinations.includes(c) && c !== selectedPassport) ||
      countries249.find((c) => !destinations.includes(c.code) && c.code !== selectedPassport)?.code ||
      'CH';
    setDestinations([...destinations, nextCode]);
  };

  const handleRemoveCountry = (index: number) => {
    if (destinations.length <= 2) return;
    setDestinations(destinations.filter((_, idx) => idx !== index));
  };

  const handleChangeDestination = (index: number, newCode: string) => {
    const next = [...destinations];
    next[index] = newCode.toUpperCase();
    setDestinations(next);
  };

  const handleCheckAllVisas = (e: React.FormEvent) => {
    e.preventDefault();
    setHasChecked(true);
    setTimeout(() => {
      const el = document.getElementById('trip-planner-results');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const tripRows = useMemo(() => {
    return destinations.map((code) => buildCountryTripVisaRow(selectedPassport, code));
  }, [selectedPassport, destinations]);

  const schengenRows = useMemo(() => {
    return tripRows.filter((r) => r.isSchengen && r.category === 'visa-required');
  }, [tripRows]);

  const allSchengenSelected = useMemo(() => {
    return tripRows.filter((r) => r.isSchengen);
  }, [tripRows]);

  const totals = useMemo(() => {
    const rawSumUsd = tripRows.reduce((acc, r) => acc + r.feeUsd, 0);

    // If 2+ Schengen countries require a Schengen Visa, only 1 Schengen Visa (€90 / $98) is paid
    let optimizedSumUsd = 0;
    let countedSchengenVisa = false;
    for (const row of tripRows) {
      if (row.isSchengen && row.category === 'visa-required') {
        if (!countedSchengenVisa) {
          optimizedSumUsd += row.feeUsd;
          countedSchengenVisa = true;
        }
      } else {
        optimizedSumUsd += row.feeUsd;
      }
    }

    const longestProcessingDays = tripRows.reduce(
      (max, r) => (r.processingDaysMax > max ? r.processingDaysMax : max),
      0
    );

    const longestCountry = tripRows.find((r) => r.processingDaysMax === longestProcessingDays);

    return {
      rawSumUsd,
       rawSumInr: Math.round(rawSumUsd * 84),
      optimizedSumUsd,
      optimizedSumInr: Math.round(optimizedSumUsd * 84),
      longestProcessingDays,
      longestCountryName: longestCountry ? longestCountry.name : 'N/A'
    };
  }, [tripRows]);

  const transitWarning = useMemo(() => {
    const destNames = tripRows.map((r) => r.name).join(' → ');
    if (selectedTransitHub === 'DXB') {
      return {
        title: `Transit Visa Alert (${originCountry.name} → ${destNames} via Dubai): You need Dubai Transit Visa also`,
        headlineBadge: 'You need Dubai Transit Visa also',
        detail:
          'When flying from India to France or Europe via Dubai (DXB) on separate PNR tickets, low-cost carriers, or with a layover exceeding 8–24 hours where you exit the airport transit zone or re-check luggage, you need a UAE (Dubai) 48-Hour Transit Visa (Free / ~$10 processing) or 96-Hour Dubai Transit Visa (~$55 / ₹4,500) before boarding.',
        tip: 'If booked on a single through-ticket (same Airline PNR, e.g., Emirates) with baggage checked through to final destination and staying airside under 24 hours, airside transit is visa-free.'
      };
    }
    if (selectedTransitHub === 'LHR') {
      return {
        title: `Transit Visa Alert (${originCountry.name} → ${destNames} via London): UK Transit Visa Check`,
        headlineBadge: 'UK Airside / Visitor in Transit Visa Required (Unless Exempt)',
        detail:
          'Indian and Visa-National passport holders transiting via London Heathrow (LHR) or Gatwick (LGW) require a UK Direct Airside Transit Visa (DATV - £35) or Visitor in Transit Visa (£64), UNLESS holding a valid USA, Canada, Australia, New Zealand, or common-format Schengen Category D visa. Also note: if transiting via Dubai on another leg, You need Dubai Transit Visa also.',
        tip: 'Always verify whether your connection changes airports (e.g., Heathrow to Gatwick requires passing UK border control).'
      };
    }
    if (selectedTransitHub === 'DOH') {
      return {
        title: `Transit Visa Alert (${originCountry.name} → ${destNames} via Doha): Qatar Transit Rules`,
        headlineBadge: 'Airside Transit Under 24 Hours vs Separate Ticket Layover',
        detail:
          'Same-ticket airside connections at Hamad International Airport (DOH) under 24 hours do not require a transit visa. If exiting the airport or flying on separate PNRs, apply for a Qatar Transit Visa. Note: For routes via Dubai (DXB), You need Dubai Transit Visa also.',
        tip: 'Ensure both flight legs are on a single PNR so luggage is tagged to your final European destination.'
      };
    }
    if (selectedTransitHub === 'IST') {
      return {
        title: `Transit Visa Alert (${originCountry.name} → ${destNames} via Istanbul): Turkey e-Transit Rules`,
        headlineBadge: 'Terminal Change or Self-Transfer Requires Turkey e-Visa',
        detail:
          'Staying airside at Istanbul Airport (IST) on a single Turkish Airlines ticket requires no transit visa. However, self-transfer passengers collecting baggage must hold a Turkey e-Visa ($50 / ₹4,200). Note: If routing via Dubai instead, You need Dubai Transit Visa also.',
        tip: 'Indian passport holders holding a valid Schengen, US, UK, or Ireland visa can get an instant online Turkey e-Visa.'
      };
    }
    if (selectedTransitHub === 'SIN') {
      return {
        title: `Transit Visa Alert (${originCountry.name} → ${destNames} via Singapore): VFTF & Self-Transfer Rules`,
        headlineBadge: 'Low-Cost Self-Transfer Requires Singapore Entry / VFTF',
        detail:
          'If connecting on budget airlines (Scoot / IndiGo) on separate tickets at Singapore Changi, you must clear immigration to re-check bags, requiring a Singapore e-Visa ($35) or qualifying for the 96-Hour Visa Free Transit Facility (VFTF) with a valid US/UK/Schengen/AU visa. Note: If flying via Dubai, You need Dubai Transit Visa also.',
        tip: 'Full-service single-PNR connections at Changi allow seamless airside terminal transfers via Skytrain.'
      };
    }
    return {
      title: `Transit Visa Reminder for ${originCountry.name} → ${destNames}`,
      headlineBadge: 'If flying via Dubai (DXB) on separate tickets: You need Dubai Transit Visa also',
      detail:
        'Even if you plan a direct flight, flight schedule changes or multi-airline bookings via hubs like Dubai (DXB), London (LHR), or Singapore (SIN) can trigger transit visa rules. For example, on India → France (via Dubai) with self-transfer or terminal exit, You need Dubai Transit Visa also (48-hr or 96-hr UAE Transit Visa).',
      tip: 'Always check if your booking is a single Airline PNR with luggage tagged to the final destination.'
    };
  }, [selectedTransitHub, originCountry.name, tripRows]);

  const handleDownloadFullTripPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let y = 18;
    const margin = 15;
    const contentWidth = 180;

    // Header bar
    doc.setFillColor(11, 61, 145);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('VisaApply.org - Official Multi-Country Trip Visa Plan', margin, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(219, 234, 254);
    doc.text(
      `Passport: ${originCountry.name} (${originCountry.code})   |   Countries: ${tripRows.map((r) => r.name).join(' + ')}   |   Generated: ${todayStr}`,
      margin,
      23
    );

    y = 42;

    // Summary Box
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y - 5, contentWidth, 26, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. TRIP COST & PROCESSING TIME SUMMARY', margin + 4, y + 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(
      `• Total Visa Fees (Sum of All Countries): $${totals.rawSumUsd} USD (~INR ${totals.rawSumInr.toLocaleString('en-IN')})`,
      margin + 4,
      y + 9
    );
    if (schengenRows.length >= 2) {
      doc.text(
        `• Schengen-Optimized Cost (1 Schengen Visa covers ${schengenRows.length} countries): $${totals.optimizedSumUsd} USD (~INR ${totals.optimizedSumInr.toLocaleString('en-IN')})`,
        margin + 4,
        y + 14.5
      );
    }
    doc.text(
      `• Total Processing Time (Longest Visa): ${totals.longestProcessingDays} Working Days (${totals.longestCountryName})`,
      margin + 4,
      y + 20
    );

    y += 30;

    // Schengen Tip & Transit Warning
    if (allSchengenSelected.length >= 2) {
      doc.setFillColor(236, 253, 245);
      doc.rect(margin, y - 4, contentWidth, 16, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(6, 95, 70);
      doc.text(
        'SCHENGEN TIP: One Schengen Visa is enough for all Schengen countries',
        margin + 4,
        y + 2
      );
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(
        `Selected Schengen countries (${allSchengenSelected.map((r) => r.name).join(', ')}): Apply at the embassy of your longest stay (or first port of entry).`,
        margin + 4,
        y + 8
      );
      y += 18;
    }

    // Transit Warning in PDF
    doc.setFillColor(254, 243, 199);
    doc.rect(margin, y - 4, contentWidth, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(146, 64, 14);
    doc.text(`TRANSIT VISA WARNING: ${transitWarning.headlineBadge}`, margin + 4, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    const transitLines = doc.splitTextToSize(transitWarning.detail, contentWidth - 8);
    doc.text(transitLines.slice(0, 2), margin + 4, y + 7.5);
    y += 22;

    // Country-by-Country Breakdown
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(11, 61, 145);
    doc.text('2. COUNTRY-BY-COUNTRY VISA REQUIREMENTS & DOCUMENTS', margin, y);
    y += 6;

    tripRows.forEach((row, index) => {
      if (y > 245) {
        doc.addPage();
        y = 20;
      }

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 38, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `Stop ${index + 1}: ${row.name} (${row.code})${row.isSchengen ? ' [Schengen Zone]' : ''}`,
        margin + 4,
        y + 6.5
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(11, 61, 145);
      doc.text(
        `Visa Needed: ${row.visaTypeNeeded}   |   Fee: ${row.feeDisplay}   |   Processing: ${row.processingTimeDisplay}   |   Stay: ${row.stayAllowed}`,
        margin + 4,
        y + 13
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text('Mandatory Documents Checklist:', margin + 4, y + 19);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const docsText = row.documents.map((d) => `[ ] ${d}`).join('   •   ');
      const wrappedDocs = doc.splitTextToSize(docsText, contentWidth - 8);
      doc.text(wrappedDocs.slice(0, 3), margin + 4, y + 24);

      y += 42;
    });

    // Footer
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Generated 100% Free by VisaApply.org/multi-country-planner — Verify final submission checklists on official embassy portals.',
      margin,
      286
    );

    const cleanFileName = `Multi_Country_Visa_Plan_${originCountry.code}_to_${tripRows.map((r) => r.code).join('_')}.pdf`;
    doc.save(cleanFileName);
  };

  const faqs = [
    {
      q: 'Do I need separate visas for France, Germany, and Italy on one Europe trip?',
      a: 'No! One Schengen Visa is enough for all Schengen countries. Since France, Germany, Italy, Switzerland, Spain, and 24 other European countries belong to the Schengen Area, a single short-stay Schengen Visa (Type C, €90 / $98) allows you to travel freely across all 29 Schengen countries for up to 90 days.'
    },
    {
      q: 'Which Schengen country embassy should I apply to when visiting multiple countries?',
      a: 'Under Article 5 of the Schengen Visa Code, you must apply at the Embassy or VFS Global center of the Schengen country where you will spend the highest number of nights (your main destination). If you plan to spend an equal number of nights in each country (for example, 4 nights in France, 4 in Germany, and 4 in Italy), you must apply at the embassy of the country you will enter first.'
    },
    {
      q: 'Do I need a Dubai Transit Visa if flying India → France (via Dubai)?',
      a: 'If your flight from India to France (via Dubai) involves separate tickets (self-transfer), different non-partner airlines, or exiting the Dubai airport transit area for a layover, you need Dubai Transit Visa also (either a 48-hour or 96-hour UAE Transit Visa). If both flights are on a single airline PNR (such as Emirates) and you remain airside under 24 hours with luggage checked through to France, no transit visa is required.'
    },
    {
      q: 'How is the Total Processing Time calculated for a multi-country trip?',
      a: 'Because you can prepare documentation or submit e-Visa applications in parallel after receiving your primary sticker visa, your critical-path timeline is governed by the longest processing time among your chosen destinations (plus any sequential passport submission time if two sticker visas are needed, such as UK + Schengen).'
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* FAQ JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Top Back to Home Bar */}
      <PageBackBar onNavigate={onNavigate} pageName="Multi-Country Trip Visa Planner" />

      {/* Blue Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>100% FREE MULTI-COUNTRY VISA PLANNER • CHECK IN 1 MINUTE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Multi-Country Trip Visa Planner
          </h1>
          <p className="text-sm sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Planning a Europe or multi-stop international itinerary? Select your passport and add 2 to 5 destination countries to check all visa requirements, transit visa warnings, Schengen rules, total visa fees, and longest processing time in under 1 minute.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* Interactive Planner Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                100% Free Multi-Stop Calculator
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Select Your Passport &amp; Add 2–5 Destination Countries
              </h2>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TRIP_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPassport(preset.passport);
                    setDestinations(preset.destinations);
                    setSelectedTransitHub(preset.transit);
                    setHasChecked(true);
                  }}
                  className="text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-[#0B3D91] border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCheckAllVisas} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Step 1: Select Passport */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  1. Select Your Passport (Default: India)
                </label>
                <select
                  aria-label="Select Your Passport"
                  value={selectedPassport}
                  onChange={(e) => setSelectedPassport(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
                >
                  {countries249.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Flight Layover / Transit Hub Selector */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                  2. Flight Transit / Layover Hub (For Transit Visa Check)
                </label>
                <select
                  aria-label="Select Flight Transit Hub"
                  value={selectedTransitHub}
                  onChange={(e) => setSelectedTransitHub(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
                >
                  {TRANSIT_HUBS.map((hub) => (
                    <option key={hub.code} value={hub.code}>
                      ✈️ {hub.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: 2 to 5 Destination Countries */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  3. Destination Countries in Your Trip ({destinations.length} of 5 Selected — Min 2, Max 5)
                </label>
                {destinations.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddCountry}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#0B3D91] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Country ({destinations.length}/5)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {destinations.map((destCode, idx) => {
                  const isSchengen = SCHENGEN_COUNTRIES.has(destCode);
                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#0B3D91]">
                          Destination #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isSchengen && (
                            <span className="text-[10px] font-extrabold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                              🇪🇺 Schengen
                            </span>
                          )}
                          {destinations.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCountry(idx)}
                              title="Remove country"
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <select
                        aria-label={`Select Destination Country ${idx + 1}`}
                        value={destCode}
                        onChange={(e) => handleChangeDestination(idx, e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
                      >
                        {countries249.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit & PDF Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-4 px-6 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check All Visas →</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadFullTripPdf}
                className="py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Trip Plan PDF</span>
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {hasChecked && (
          <div id="trip-planner-results" className="space-y-6">
            {/* 1. Schengen Tip Banner (Shown when 2+ Schengen countries are selected) */}
            {allSchengenSelected.length >= 2 && (
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>🇪🇺 SCHENGEN TIP ({allSchengenSelected.length} Schengen Countries Selected)</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-emerald-950">
                      One Schengen Visa is enough for all Schengen countries
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                      You selected <strong>{allSchengenSelected.map((r) => `${r.flag} ${r.name}`).join(' + ')}</strong>. You do <strong>NOT</strong> need to apply or pay separately for each country. A single Uniform Schengen Visa (Type C — €90 / $98) covers your entire trip across all {allSchengenSelected.length} countries. Apply at the Embassy / VFS center of the country where you will stay the most nights (or your first port of entry such as <strong>{allSchengenSelected[0].name}</strong> if nights are equal).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Transit Visa Warning Box */}
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-amber-800" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full">
                      Transit Visa Warning
                    </span>
                    <span className="text-xs font-black text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                      {transitWarning.headlineBadge}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {transitWarning.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {transitWarning.detail}
                  </p>
                  <p className="text-xs font-bold text-amber-900 pt-1">
                    💡 Pro Tip: {transitWarning.tip}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Total Cost + Total Processing Time Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-extrabold uppercase text-slate-500">
                  <span>Total Cost (Sum of Visa Fees)</span>
                  <DollarSign className="w-4 h-4 text-[#0B3D91]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tabular-nums">
                  ${totals.rawSumUsd} USD{' '}
                  <span className="text-base font-extrabold text-slate-500">
                    (~₹{totals.rawSumInr.toLocaleString('en-IN')})
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1.5">
                  Sum across all {tripRows.length} selected countries ({tripRows.map((r) => r.code).join(' + ')})
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-emerald-300 shadow-xs">
                <div className="flex items-center justify-between text-xs font-extrabold uppercase text-emerald-800">
                  <span>Smart Schengen-Adjusted Cost</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 tabular-nums">
                  ${totals.optimizedSumUsd} USD{' '}
                  <span className="text-base font-extrabold text-emerald-800">
                    (~₹{totals.optimizedSumInr.toLocaleString('en-IN')})
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1.5">
                  {schengenRows.length >= 2
                    ? `Saves $${totals.rawSumUsd - totals.optimizedSumUsd} USD because 1 Schengen Visa covers ${schengenRows.length} countries`
                    : 'Actual payable consular visa fees for this trip'}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-xs font-extrabold uppercase text-slate-500">
                  <span>Total Processing Time (Longest One)</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0B3D91] mt-2 tabular-nums">
                  {totals.longestProcessingDays === 0
                    ? 'Instant (0 Days)'
                    : `${totals.longestProcessingDays} Working Days`}
                </div>
                <div className="text-xs text-slate-600 mt-1.5">
                  Longest wait: <strong>{totals.longestCountryName}</strong> — Apply at least {Math.max(totals.longestProcessingDays + 15, 21)} days before departure
                </div>
              </div>
            </div>

            {/* 4. Multi-Country Visa Comparison Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Visa Requirements Table: {originCountry.flag} {originCountry.name} →{' '}
                    {tripRows.map((r) => `${r.flag} ${r.name}`).join(' + ')}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Showing official 2026 Visa Type Needed, Consular Fee, Processing Time, and Maximum Stay Allowed for each stop.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadFullTripPdf}
                  className="py-2.5 px-4 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full Trip Plan PDF</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-4 font-extrabold">Stop &amp; Country</th>
                      <th className="py-3.5 px-4 font-extrabold">Visa Type Needed</th>
                      <th className="py-3.5 px-4 font-extrabold">Fee</th>
                      <th className="py-3.5 px-4 font-extrabold">Processing Time</th>
                      <th className="py-3.5 px-4 font-extrabold">Stay Allowed</th>
                      <th className="py-3.5 px-4 font-extrabold text-right">Official Guide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                    {tripRows.map((row, idx) => {
                      const badgeStyles =
                        row.category === 'visa-free'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : row.category === 'voa'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : row.category === 'e-visa'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-red-100 text-red-800 border-red-300';

                      const routeUrl = `/${selectedPassport.toLowerCase()}-to-${row.code.toLowerCase()}`;

                      return (
                        <tr key={`${row.code}-${idx}`} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-4 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-black flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-lg">{row.flag}</span>
                              <div>
                                <div className="font-black text-slate-900">{row.name}</div>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  {row.isSchengen ? '🇪🇺 Schengen Zone' : `${row.visaSubclassesCount} Visa Subclasses`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-block font-black text-xs px-2.5 py-1 rounded-full border ${badgeStyles}`}
                            >
                              {row.visaTypeNeeded}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-black text-slate-900 tabular-nums">
                            {row.feeDisplay}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-700 tabular-nums">
                            {row.processingTimeDisplay}
                          </td>
                          <td className="py-4 px-4 font-semibold text-slate-700">
                            {row.stayAllowed}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <a
                              href={routeUrl}
                              onClick={(e) => {
                                e.preventDefault();
                                onNavigate(routeUrl);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-black text-[#0B3D91] hover:underline"
                            >
                              <span>{row.code} Guide</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Consolidated Mandatory Documents Checklist Cards per Country */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    Document Checklist for Your {tripRows.length}-Country Trip
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Included automatically inside your downloadable Full Trip Plan PDF.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('/cover-letter-generator')}
                    className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    📄 Free Cover Letter PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/dummy-ticket')}
                    className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    ✈️ Flight &amp; Hotel Itinerary
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tripRows.map((row, idx) => (
                  <div
                    key={`${row.code}-docs-${idx}`}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <span>{row.flag}</span>
                        <span>
                          Stop {idx + 1}: {row.name} ({row.visaTypeNeeded})
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#0B3D91]">{row.feeDisplay}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {row.documents.map((docItem, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{docItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">
              Frequently Asked Questions (Multi-Country Trip Visa Planner)
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
        <EmailSubscribeBox pageContext="Multi-Country Trip Visa Planner" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
