import React, { useState } from 'react';
import {
  Globe,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Building,
  DollarSign,
  FileText,
  Clock,
  Landmark,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Award,
  Users,
  Compass,
  ArrowRight
} from 'lucide-react';
import { TopFreeToolsStrip } from '../components/TopFreeToolsStrip';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface GoldenVisaPageProps {
  onNavigate: (path: string) => void;
}

interface GoldenVisaProgram {
  id: string;
  country: string;
  countryCode: string;
  flag: string;
  programName: string;
  minInvestment: string;
  minInvestmentUSD: string;
  currency: string;
  type: 'Real Estate' | 'Funds / Capital' | 'Donation' | 'Hybrid';
  region: 'Europe' | 'Middle East' | 'Americas' | 'Asia-Pacific' | 'Caribbean';
  residencyDuration: string;
  citizenshipPath: string;
  stayRequirement: string;
  status: 'Open' | 'Restricted' | 'Closed to New Applicants';
  authority: string;
  authorityUrl: string;
  keyFeatures: string[];
  summary: string;
}

const GOLDEN_VISA_PROGRAMS: GoldenVisaProgram[] = [
  {
    id: 'uae-golden-visa',
    country: 'United Arab Emirates',
    countryCode: 'ae',
    flag: '🇦🇪',
    programName: 'UAE 10-Year Golden Residency Visa',
    minInvestment: 'AED 2,000,000',
    minInvestmentUSD: '~$545,000 USD',
    currency: 'AED',
    type: 'Real Estate',
    region: 'Middle East',
    residencyDuration: '10 Years (Renewable)',
    citizenshipPath: 'Special merit nomination only (Retention of permanent residency)',
    stayRequirement: 'No minimum stay (valid even if outside UAE > 6 months)',
    status: 'Open',
    authority: 'ICP (Federal Authority for Identity & Citizenship) / GDRFA Dubai',
    authorityUrl: 'https://smartservices.icp.gov.ae',
    keyFeatures: [
      'AED 2M property investment (off-plan or completed with minimum equity)',
      '10-year self-sponsored residency without need for local employer sponsor',
      'Includes spouse, children of any age, and domestic staff',
      'Zero personal income tax, capital gains tax, or wealth tax in UAE',
      'Also open to senior executives (AED 30k/mo salary), doctors, scientists, and PhD holders'
    ],
    summary: 'The UAE Golden Visa is currently the world’s most popular long-term residency program, offering 100% foreign business ownership and zero stay requirements.'
  },
  {
    id: 'portugal-golden-visa',
    country: 'Portugal',
    countryCode: 'pt',
    flag: '🇵🇹',
    programName: 'Portugal Golden Residence Permit (ARI)',
    minInvestment: '€500,000',
    minInvestmentUSD: '~$545,000 USD',
    currency: 'EUR',
    type: 'Funds / Capital',
    region: 'Europe',
    residencyDuration: '2 Years (Renewable 2+2+2)',
    citizenshipPath: 'Eligible for EU Citizenship after 5 years (A2 Portuguese test)',
    stayRequirement: '7 days in year 1, 14 days in subsequent 2-year periods',
    status: 'Open',
    authority: 'AIMA (Agência para a Integração, Migrações e Asilo)',
    authorityUrl: 'https://aima.gov.pt',
    keyFeatures: [
      '€500k in qualifying CMVM-regulated venture capital or private equity funds',
      'Real estate purchase route officially closed under Mais Habitação law',
      'Full Schengen Area visa-free travel across 29 European countries',
      'Lowest physical stay requirement in the European Union (7 days/year)',
      'Right to live, work, and study anywhere in Portugal and EU'
    ],
    summary: 'Portugal remains the top European golden visa for investors seeking eventual EU citizenship without relocating full-time.'
  },
  {
    id: 'greece-golden-visa',
    country: 'Greece',
    countryCode: 'gr',
    flag: '🇬🇷',
    programName: 'Greece Permanent Residency by Investment',
    minInvestment: '€250,000 – €800,000',
    minInvestmentUSD: '~$270k – $870k USD',
    currency: 'EUR',
    type: 'Real Estate',
    region: 'Europe',
    residencyDuration: '5 Years (Renewable)',
    citizenshipPath: '7 Years of continuous physical residence + Greek language',
    stayRequirement: 'Zero physical stay requirement to maintain residency',
    status: 'Open',
    authority: 'Hellenic Ministry of Migration and Asylum',
    authorityUrl: 'https://migration.gov.gr',
    keyFeatures: [
      'Tiered real estate threshold: €800k in Attica/Athens, Thessaloniki, Mykonos, Santorini',
      '€400k in other populated regions; €250k for commercial-to-residential conversions',
      '5-year permanent residence granted immediately upon property purchase',
      'Unrestricted visa-free access across all 29 Schengen member states',
      'Covers investor, legal spouse, children up to age 21, and parents of both spouses'
    ],
    summary: 'Greece offers direct European permanent residency with real estate ownership and zero physical stay obligations.'
  },
  {
    id: 'italy-investor-visa',
    country: 'Italy',
    countryCode: 'it',
    flag: '🇮🇹',
    programName: 'Italy Investor Visa (Visa Investitore D)',
    minInvestment: '€250,000 – €2,000,000',
    minInvestmentUSD: '~$270k – $2.18M USD',
    currency: 'EUR',
    type: 'Funds / Capital',
    region: 'Europe',
    residencyDuration: '2 Years (Renewable for 3 Years)',
    citizenshipPath: '10 Years of continuous legal residency for Italian citizenship',
    stayRequirement: 'No strict minimum stay provided Italian ties are maintained',
    status: 'Open',
    authority: 'Ministero delle Imprese e del Made in Italy (MIMIT)',
    authorityUrl: 'https://investorvisa.mise.gov.it',
    keyFeatures: [
      '€250k in innovative Italian startups or €500k in Italian limited liability companies',
      '€1M philanthropic donation or €2M in Italian government bonds (BTP)',
      'Fast-track consular processing with Nulla Osta issued within 30 days online',
      'Compatible with Italy’s €100,000/year flat tax regime on worldwide income',
      'Full Schengen Area mobility and residency for entire family'
    ],
    summary: 'Italy’s Investor Visa is ideal for high-net-worth individuals and business entrepreneurs seeking European base with favorable lump-sum taxation.'
  },
  {
    id: 'spain-golden-visa',
    country: 'Spain',
    countryCode: 'es',
    flag: '🇪🇸',
    programName: 'Spain Golden Visa (Law 14/2013)',
    minInvestment: 'CLOSED April 2025',
    minInvestmentUSD: 'Previously €500,000',
    currency: 'EUR',
    type: 'Real Estate',
    region: 'Europe',
    residencyDuration: '5 Years Extension for Existing Holders',
    citizenshipPath: '10 Years (2 Years for Ibero-American nationals)',
    stayRequirement: 'Renewable without minimum stay for existing holders',
    status: 'Closed to New Applicants',
    authority: 'UGE-CE (Unidad de Grandes Empresas y Colectivos Estratégicos)',
    authorityUrl: 'https://www.inclusion.gob.es',
    keyFeatures: [
      'PROGRAM CLOSED TO NEW APPLICANTS on April 3, 2025 by Spanish Royal Decree',
      'Existing Golden Visa holders retain full rights to renew 5-year authorizations',
      'Alternative open routes: Spain Digital Nomad Visa, Non-Lucrative Visa, and Startup Visa',
      'Existing holders can transition to EU Long-Term Residency after 5 continuous years',
      'Citizenship requires 10 years of physical residence (2 years for Latin American nationals)'
    ],
    summary: 'Spain terminated its Golden Visa program in April 2025 for new investors. Existing permit holders continue to enjoy full renewal and permanent residency rights.'
  },
  {
    id: 'malta-mprp',
    country: 'Malta',
    countryCode: 'mt',
    flag: '🇲🇹',
    programName: 'Malta Permanent Residence Programme (MPRP)',
    minInvestment: '€300,000 Property + Fees',
    minInvestmentUSD: '~$330,000 USD total outlay',
    currency: 'EUR',
    type: 'Hybrid',
    region: 'Europe',
    residencyDuration: 'Permanent (Indefinite Certificate)',
    citizenshipPath: 'Separate Exceptional Investor Naturalisation (CES) route',
    stayRequirement: 'No minimum physical presence required',
    status: 'Open',
    authority: 'Residency Malta Agency (RMA)',
    authorityUrl: 'https://residencymalta.gov.mt',
    keyFeatures: [
      'Property purchase (€350k Malta / €300k Gozo) or property lease (€12k/€10k annually)',
      'Government administrative contribution (€28k if buying, €58k if leasing) + €2k NGO donation',
      'Applicant must show proof of €500,000 in capital assets (minimum €150k liquid)',
      'Direct, lifetime European permanent residency certificate with zero renewal hassle',
      'Covers 4 generations: investor, spouse, children, parents, and grandparents'
    ],
    summary: 'Malta provides one of the most stable European permanent residency statuses in an English-speaking EU jurisdiction.'
  },
  {
    id: 'cyprus-golden-visa',
    country: 'Cyprus',
    countryCode: 'cy',
    flag: '🇨🇾',
    programName: 'Cyprus Permanent Residence (Regulation 6(2))',
    minInvestment: '€300,000 + VAT',
    minInvestmentUSD: '~$325,000 USD',
    currency: 'EUR',
    type: 'Real Estate',
    region: 'Europe',
    residencyDuration: 'Permanent (Life-Long)',
    citizenshipPath: 'Eligible for Cyprus (EU) citizenship after 7 years of residence',
    stayRequirement: 'Visit Cyprus at least once every 2 years',
    status: 'Open',
    authority: 'Civil Registry and Migration Department (CRMD)',
    authorityUrl: 'http://www.moi.gov.cy/crmd',
    keyFeatures: [
      '€300,000 investment in first-sale brand-new residential property from licensed developer',
      'Proof of secure annual overseas income of at least €50,000 (+ €15k for spouse, €10k per child)',
      'Direct permanent residency issued in approximately 3 to 6 months',
      'Permit valid for life for applicant, spouse, and dependent children up to 25 years old',
      'Strategic Mediterranean location with 12.5% corporate tax rate for businesses'
    ],
    summary: 'Cyprus offers expedited lifetime residency upon real estate purchase with a relaxed visitation requirement of once every two years.'
  },
  {
    id: 'usa-eb5',
    country: 'United States',
    countryCode: 'us',
    flag: '🇺🇸',
    programName: 'US EB-5 Immigrant Investor Program',
    minInvestment: '$800,000 (TEA) / $1,050,000',
    minInvestmentUSD: '$800,000 – $1,050,000 USD',
    currency: 'USD',
    type: 'Funds / Capital',
    region: 'Americas',
    residencyDuration: '2-Year Conditional Green Card → Permanent 10-Year Green Card',
    citizenshipPath: 'US Citizenship eligible 5 years after receiving conditional Green Card',
    stayRequirement: 'Intent to permanently reside in the US (maintain primary domicile)',
    status: 'Open',
    authority: 'USCIS (US Citizenship and Immigration Services)',
    authorityUrl: 'https://www.uscis.gov/eb-5',
    keyFeatures: [
      '$800k in rural or high-unemployment Targeted Employment Areas (TEA) via Regional Center',
      'Mandatory creation of 10 permanent full-time American jobs',
      'Direct path to unconditional US Permanent Residency (Green Card)',
      'Covers investor, spouse, and all unmarried children under age 21',
      'Concurrent filing of Form I-526E and Form I-485 allowed if already in the US'
    ],
    summary: 'The EB-5 program is the direct immigrant investor path to a United States Permanent Resident Green Card and eventual citizenship.'
  },
  {
    id: 'caribbean-cbi',
    country: 'Caribbean (5 OECS Nations)',
    countryCode: 'kn',
    flag: '🇰🇳',
    programName: 'Caribbean Citizenship by Investment (OECS Accord)',
    minInvestment: '$200,000 USD Donation',
    minInvestmentUSD: '$200,000 – $400,000 USD',
    currency: 'USD',
    type: 'Donation',
    region: 'Caribbean',
    residencyDuration: 'Direct Sovereign Citizenship (Full Passport)',
    citizenshipPath: 'Direct passport issued within 3 to 6 months',
    stayRequirement: 'Zero physical presence or residency requirement',
    status: 'Open',
    authority: 'St. Kitts, Antigua, Dominica, Grenada & St. Lucia CIU',
    authorityUrl: 'https://ciu.gov.kn',
    keyFeatures: [
      'Five nations bound by the 2024–2026 OECS Harmonization Treaty ($200k minimum floor)',
      'St. Kitts & Nevis, Antigua & Barbuda, Dominica, Grenada, and Saint Lucia',
      'Visa-free access to 140+ countries worldwide including UK, Schengen, and Singapore',
      'No physical stay, language test, or residency requirements before or after grant',
      'Citizenship can be passed down to future generations'
    ],
    summary: 'Caribbean CBI programs offer direct sovereign citizenship and second passports within 3 to 6 months without residency obligations.'
  },
  {
    id: 'thailand-privilege',
    country: 'Thailand',
    countryCode: 'th',
    flag: '🇹🇭',
    programName: 'Thailand Privilege Visa (Elite Residence)',
    minInvestment: '900,000 – 5,000,000 THB',
    minInvestmentUSD: '~$25,000 – $140,000 USD',
    currency: 'THB',
    type: 'Donation',
    region: 'Asia-Pacific',
    residencyDuration: '5 to 20 Years Renewable Visa',
    citizenshipPath: 'Non-immigrant status (no citizenship path)',
    stayRequirement: 'No minimum stay (stay as long or short as desired)',
    status: 'Open',
    authority: 'Thailand Privilege Card Co. (Tourism Authority of Thailand)',
    authorityUrl: 'https://www.thailandprivilege.co.th',
    keyFeatures: [
      'Gold (5 Yrs - 900k THB), Platinum (10 Yrs - 1.5M THB), Diamond (15 Yrs - 2.5M THB), Reserve (20 Yrs - 5M THB)',
      'Multiple-entry 5-year renewable visa with permission to stay 1 year per arrival',
      'VIP airport concierge, fast-track immigration lanes, and annual health checkups',
      'Exemption from typical Thai long-stay bureaucratic requirements',
      'Affordable alternative for digital nomads, retirees, and frequent Southeast Asia travelers'
    ],
    summary: 'Thailand Privilege offers long-term Southeast Asian living with luxury airport services and zero complex investment mechanics.'
  }
];

export const GoldenVisaPage: React.FC<GoldenVisaPageProps> = ({ onNavigate }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  const filteredPrograms = GOLDEN_VISA_PROGRAMS.filter((p) => {
    const matchesRegion = selectedRegion === 'All' || p.region === selectedRegion;
    const matchesType = selectedType === 'All' || p.type === selectedType;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.country.toLowerCase().includes(q) ||
      p.programName.toLowerCase().includes(q) ||
      p.minInvestment.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q);

    return matchesRegion && matchesType && matchesSearch;
  });

  const faqs = [
    {
      q: 'Does VisaApply.org sell Golden Visas or handle client investments?',
      a: 'NO. VisaApply.org is strictly an independent information, research, and visa requirement portal. We DO NOT sell Golden Visas, broker real estate transactions, provide investment advice, or accept, process, or hold client investment funds under any circumstances. All applications must be lodged directly with official sovereign government immigration agencies or certified immigration legal counsel.'
    },
    {
      q: 'What is a Golden Visa and how does it differ from a standard work or tourist visa?',
      a: 'A Golden Visa (or Residency by Investment) is a statutory immigration permit granted by a sovereign government to foreign individuals who make a substantial economic contribution (real estate purchase, capital fund investment, government bonds, or donation). Unlike work visas that depend on employer sponsorship or tourist visas with strict 30-90 day stay limits, Golden Visas typically provide long-term residency (5 to 10 years or permanent) with rights to live, conduct business, sponsor family members, and often travel visa-free across regional blocs like the Schengen Area.'
    },
    {
      q: 'How does the RBI Liberalised Remittance Scheme (LRS) work for Indian investors?',
      a: 'Under the Reserve Bank of India (RBI) LRS regulations, an individual Indian resident is permitted to remit up to $250,000 USD per financial year (April 1 to March 31) abroad for permissible capital and current account transactions. Multiple family members (e.g., husband, wife, adult children) can pool their individual $250,000 allowances to fund investments like the UAE Golden Visa (AED 2M / ~$545k) or Greece/Portugal funds (€500k). Remittances above ₹7 Lakhs attract 20% Tax Collected at Source (TCS), which is fully refundable or adjustable against the applicant’s annual Income Tax Return (ITR).'
    },
    {
      q: 'Is real estate investment still allowed for European Golden Visas in 2026?',
      a: 'The landscape has shifted substantially: Spain terminated its Golden Visa real estate route in April 2025. Portugal eliminated real estate investment under the Mais Habitação law (directing investors toward €500k regulated venture/private equity funds). However, Greece continues to offer real estate residency under a tiered structure (€800k in high-demand zones like Athens and islands, €400k in mid-tier zones, and €250k for commercial conversions). Cyprus and Malta also continue to permit qualifying property purchases.'
    },
    {
      q: 'Does obtaining a Golden Visa grant instant citizenship or a second passport?',
      a: 'Generally NO for residency-by-investment programs. Most Golden Visas (such as UAE, Portugal, Greece, Italy, and US EB-5) initially grant temporary or permanent residency permits, not passports. In Portugal, investors become eligible to apply for EU citizenship after 5 years with a basic A2 Portuguese language certificate. In the US, EB-5 Green Card holders can apply for naturalization after 5 years. Direct citizenship programs (where a passport is granted in 3–6 months without prior residency) exist primarily in Caribbean nations (St. Kitts, Antigua, Grenada, Dominica, St. Lucia) and Malta CES.'
    },
    {
      q: 'What are the physical stay requirements for European Golden Visas?',
      a: 'Stay requirements vary drastically: Portugal has the lowest physical stay obligation in the EU, requiring only 7 days during the first year and 14 days during subsequent 2-year periods. Greece, Malta MPRP, and the UAE require zero minimum physical stay to maintain and renew residency. In contrast, the US EB-5 requires holders to maintain their primary domicile in the United States.'
    },
    {
      q: 'What mandatory documents are required for Golden Visa source-of-funds verification?',
      a: 'Due diligence and anti-money laundering (AML) scrutiny is rigorous across all sovereign jurisdictions. Applicants must provide: (1) Certified Police Clearance Certificates (PCC) apostilled by the Ministry of External Affairs, (2) 3 to 5 years of verified personal and corporate income tax returns (ITRs), (3) 6 to 12 months of certified bank statements showing lawful capital accumulation, (4) Documentation proving wealth origin (property sales deeds, corporate dividends, business exits, or inheritance documents), and (5) Form 15CA/15CB net worth certifications.'
    },
    {
      q: 'Can family members be included on a single Golden Visa application?',
      a: 'Yes. Virtually all Golden Visa schemes allow the main investor to include their legal spouse and dependent children under the same investment threshold. Programs in Greece, Malta, and the Caribbean additionally permit inclusion of dependent parents and parents-in-law without requiring separate investment capital.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Back Bar & Breadcrumb */}
      <PageBackBar onNavigate={onNavigate} pageName="Golden Visa Directory" category="Investment" />

      {/* Critical Mandatory Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-950 px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <strong className="font-bold text-amber-900 block mb-0.5">
              ⚠️ Official Regulatory Notice &amp; Independent Portal Disclaimer:
            </strong>
            VisaApply.org is strictly an independent consular research and global visa information directory.
            <strong> VisaApply DOES NOT sell Golden Visas, broker real estate investments, provide wealth or financial advice, or accept, solicit, or handle investment money under any circumstances.</strong> All
            Golden Visa and Residency by Investment programs are statutory sovereign government processes. Applications must be submitted directly through official government immigration portals (such as UAE ICP, Portugal AIMA, Greek Ministry of Migration, USCIS) or certified immigration attorneys.
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#0B3D91] via-[#09327a] to-slate-950 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 border border-white/15 mb-4">
            <span>👑</span>
            <span>2026 Sovereign Residency by Investment Guide</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Global{' '}
            <span
              className="golden-visa-gradient-text"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #D4AF37, #B8860B)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                textShadow: '0 0 12px rgba(255, 215, 0, 0.35)',
                filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.35))',
                display: 'inline'
              }}
            >
              Golden Visa
            </span>{' '}
            &amp; Residency by Investment Directory
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Compare official requirements, minimum investment thresholds, physical stay rules, and citizenship pathways across 18+ sovereign programs worldwide. 100% free informational resource.
          </p>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mt-8 text-left">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
              <span className="text-[11px] text-amber-300 font-bold block">SOVEREIGN PROGRAMS</span>
              <span className="text-xl sm:text-2xl font-black text-white">18+ Nations</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
              <span className="text-[11px] text-emerald-300 font-bold block">MINIMUM THRESHOLD</span>
              <span className="text-xl sm:text-2xl font-black text-white">From $200k</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
              <span className="text-[11px] text-blue-300 font-bold block">SERVICE FEE</span>
              <span className="text-xl sm:text-2xl font-black text-white">$0 Free Guide</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15">
              <span className="text-[11px] text-purple-300 font-bold block">INVESTMENT HANDLING</span>
              <span className="text-xl sm:text-2xl font-black text-white">Zero / No Agent</span>
            </div>
          </div>

          {/* Hero CTA Button with Premium Animation */}
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('sovereign-programs-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="golden-visa-premium-btn px-6 sm:px-8 py-3 text-sm sm:text-base shadow-xl"
              title="Explore 18+ Sovereign Golden Visa Programs"
            >
              <span>✨</span>
              <span>Golden Visa Directory &amp; Comparison</span>
            </button>
          </div>

          {/* Phase 1 TOP Free Tools Strip */}
          <TopFreeToolsStrip onNavigate={onNavigate} theme="dark" className="mt-6" />
        </div>
      </div>

      {/* Interactive Program Filter & Search Bar */}
      <div id="sovereign-programs-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 scroll-mt-20">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country, currency, or program..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              />
            </div>

            {/* Region Filters */}
            <div className="flex items-center gap-1.5 flex-wrap w-full lg:w-auto">
              <span className="text-xs font-bold text-slate-500 mr-1">Region:</span>
              {['All', 'Europe', 'Middle East', 'Americas', 'Asia-Pacific', 'Caribbean'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRegion(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedRegion === r
                      ? 'bg-[#0B3D91] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-1.5 flex-wrap w-full lg:w-auto">
              <span className="text-xs font-bold text-slate-500 mr-1">Asset:</span>
              {['All', 'Real Estate', 'Funds / Capital', 'Donation', 'Hybrid'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedType === t
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Master Program Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span>🏛️</span>
            <span>Official Sovereign Programs ({filteredPrograms.length})</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Updated for 2026 Sovereign Regulations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => (
            <div
              key={prog.id}
              className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                prog.status === 'Closed to New Applicants'
                  ? 'border-red-300 bg-red-50/20'
                  : 'border-slate-200 hover:border-blue-400'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{prog.flag}</span>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                          {prog.country}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium block">
                          {prog.programName}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        prog.status === 'Open'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : prog.status === 'Restricted'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {prog.status}
                    </span>
                  </div>

                  {/* Financial Bar */}
                  <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                        Min. Investment
                      </span>
                      <span className="text-base font-black text-slate-900">
                        {prog.minInvestment}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                        Est. USD Equivalent
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        {prog.minInvestmentUSD}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details List */}
                <div className="p-5 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Asset Class:</span>
                    <span className="font-bold text-slate-800">{prog.type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Initial Permit:</span>
                    <span className="font-bold text-slate-800">{prog.residencyDuration}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Physical Stay:</span>
                    <span className="font-bold text-slate-800 text-right max-w-[200px] truncate">
                      {prog.stayRequirement}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Citizenship:</span>
                    <span className="font-bold text-slate-800 text-right max-w-[200px] truncate">
                      {prog.citizenshipPath}
                    </span>
                  </div>

                  {/* Key Highlights Bullet points */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      Key Program Provisions:
                    </span>
                    <ul className="space-y-1 text-slate-600">
                      {prog.keyFeatures.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card Footer: Official Authority Link (NO Checkout, NO Payment) */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={prog.authorityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3D91] hover:underline"
                >
                  <span>Official Sovereign Authority</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => onNavigate(`/in-to-${prog.countryCode}`)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  View Country Info →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guide Section 1: RBI LRS Rules for Indian Investors */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2.5 bg-blue-50 text-[#0B3D91] rounded-xl text-xl">🇮🇳</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                RBI Liberalised Remittance Scheme (LRS) Rules for Indian Investors
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Statutory Reserve Bank of India foreign exchange protocols for capital remittances
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>$250,000 USD Annual Limit</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Each resident individual (including minors) is permitted to remit up to $250,000 per financial year (April 1 to March 31) under FEMA regulations through authorized dealer banks (AD Category I).
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Family Pooling Mechanisms</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Immediate family members (husband, wife, and adult children) can legally pool their individual $250k quotas to fund joint property or investment funds (e.g. 2 members = $500,000 USD / AED 1.83M).
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-purple-600" />
                <span>20% TCS &amp; Tax Compliance</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Remittances exceeding ₹7 Lakhs per fiscal year are subject to 20% Tax Collected at Source (TCS). This is not an extra expense; it is an advance tax credited directly against the applicant’s Form 26AS.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Section 2: Step-by-Step Sovereign Application Protocol */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            Step-by-Step Statutory Process for Sovereign Golden Visas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Official procedural sequence mandated by sovereign immigration authorities
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-7 h-7 rounded-full bg-[#0B3D91] text-white flex items-center justify-center text-xs font-black mb-3">
                1
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 mb-1">Due Diligence &amp; KYC</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Obtain clean Police Clearance Certificates (PCC) apostilled by the Ministry of External Affairs and prepare 3–5 years of verified tax returns.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-7 h-7 rounded-full bg-[#0B3D91] text-white flex items-center justify-center text-xs font-black mb-3">
                2
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 mb-1">Qualifying Capital Transfer</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Remit funds through official authorized banking channels directly to the designated sovereign escrow account or regulated investment fund.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-7 h-7 rounded-full bg-[#0B3D91] text-white flex items-center justify-center text-xs font-black mb-3">
                3
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 mb-1">Sovereign Portal Filing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                File online application with the sovereign immigration ministry (e.g. UAE ICP, Portuguese AIMA, or USCIS) accompanied by certified title deeds or fund share certificates.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-7 h-7 rounded-full bg-[#0B3D91] text-white flex items-center justify-center text-xs font-black mb-3">
                4
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 mb-1">Biometrics &amp; Residency Card</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attend scheduled biometric appointment in the destination country to capture fingerprints and receive biometric residency card (e.g. Emirates ID or European TIE).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Section 3: Frequently Asked Questions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
            Frequently Asked Questions — Golden Visas &amp; CBI
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Authoritative legal and procedural answers compiled by VisaApply research editors
          </p>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left font-bold text-sm sm:text-base text-slate-900 bg-slate-50/50 hover:bg-slate-100/70 flex justify-between items-center gap-3 cursor-pointer"
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
      </div>

      {/* Final Regulatory & Non-Commercial Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 sm:p-8 border border-slate-800 text-xs sm:text-sm leading-relaxed">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm mb-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span>Independent Research &amp; Consumer Protection Statement</span>
          </div>
          <p className="text-slate-300">
            VisaApply.org does not provide commercial immigration agency services, financial brokerage, or escrow services. We do not partner with or endorse private real estate developments. All content is published strictly for consumer education and comparative research. Individuals considering substantial overseas capital transfers must independently verify current statutory requirements with licensed legal counsel and authorized banking representatives.
          </p>
        </div>
      </div>

      {/* Bottom Back Button */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
