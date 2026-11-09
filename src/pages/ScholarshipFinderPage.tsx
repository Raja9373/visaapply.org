import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  GraduationCap,
  Calendar,
  ExternalLink,
  Search,
  CheckCircle2,
  FileText,
  Globe,
  HelpCircle,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface ScholarshipFinderPageProps {
  onNavigate: (path: string) => void;
}

type ScholarshipCountry = 'All' | 'USA' | 'UK' | 'Canada' | 'Australia' | 'Germany';
type ScholarshipCourse = 'All' | 'Bachelors' | 'Masters' | 'PhD';
type ScholarshipType = 'All' | 'Fully Funded' | 'Partial' | 'Merit';

interface ScholarshipEntry {
  id: string;
  name: string;
  country: Exclude<ScholarshipCountry, 'All'>;
  flag: string;
  institution: string;
  courses: Exclude<ScholarshipCourse, 'All'>[];
  fundingType: Exclude<ScholarshipType, 'All'>;
  amount: string;
  deadline: string;
  deadlineMonthGroup: 'Nov – Dec (Urgent)' | 'Jan – Feb (Near)' | 'Apr – Jun (Spring)';
  isDeadlineNear: boolean;
  daysLeftLabel: string;
  eligibility: string;
  officialUrl: string;
}

const SCHOLARSHIPS_DB: ScholarshipEntry[] = [
  {
    id: 'chevening-uk',
    name: 'Chevening UK Government Scholarships',
    country: 'UK',
    flag: '🇬🇧',
    institution: 'UK Foreign, Commonwealth & Development Office (150+ UK Universities)',
    courses: ['Masters'],
    fundingType: 'Fully Funded',
    amount: 'Full Tuition + £1,378/mo Living Stipend + Return Flights + UK Visa Fee',
    deadline: 'November 2026 (Annual Autumn Window)',
    deadlineMonthGroup: 'Nov – Dec (Urgent)',
    isDeadlineNear: true,
    daysLeftLabel: 'Closing Soon — Priority Window',
    eligibility: 'Bachelor’s degree, 2+ years (2,800 hours) work/internship experience, strong leadership potential, return to home country for 2 years after graduation.',
    officialUrl: 'https://www.chevening.org/scholarships/'
  },
  {
    id: 'fulbright-usa',
    name: 'Fulbright-Nehru Master’s & Doctoral Fellowships',
    country: 'USA',
    flag: '🇺🇸',
    institution: 'USIEF & U.S. Department of State (Top Accredited US Universities)',
    courses: ['Masters', 'PhD'],
    fundingType: 'Fully Funded',
    amount: 'Full Tuition + Monthly Living Stipend + Round-Trip Economy Airfare + J-1 Health Insurance',
    deadline: 'May 15 (Annual Cycle)',
    deadlineMonthGroup: 'Apr – Jun (Spring)',
    isDeadlineNear: false,
    daysLeftLabel: 'Spring Cycle Open',
    eligibility: '4-year Bachelor’s degree (or Master’s after 3-year Bachelor’s) with minimum 55% marks, 3 years professional work experience for Master’s track.',
    officialUrl: 'https://www.usief.org.in/Fellowships/Fulbright-Nehru-Master-Fellowships.aspx'
  },
  {
    id: 'daad-epos-germany',
    name: 'DAAD EPOS Postgraduate Scholarships',
    country: 'Germany',
    flag: '🇩🇪',
    institution: 'German Academic Exchange Service (Public Universities Across Germany)',
    courses: ['Masters', 'PhD'],
    fundingType: 'Fully Funded',
    amount: '€0 Tuition + €934/mo (Masters) or €1,300/mo (PhD) Stipend + Health Insurance + Travel Allowance',
    deadline: 'October 31 – November 30, 2026 (Course-Specific)',
    deadlineMonthGroup: 'Nov – Dec (Urgent)',
    isDeadlineNear: true,
    daysLeftLabel: 'Deadline Near — Apply Now',
    eligibility: '4-year Bachelor’s degree with above-average grades, minimum 2 years relevant professional work experience after graduation.',
    officialUrl: 'https://www.daad.de/en/study-and-research-in-germany/scholarships/'
  },
  {
    id: 'commonwealth-uk',
    name: 'Commonwealth Master’s & PhD Scholarships',
    country: 'UK',
    flag: '🇬🇧',
    institution: 'Commonwealth Scholarship Commission (CSC UK)',
    courses: ['Masters', 'PhD'],
    fundingType: 'Fully Funded',
    amount: 'Full Tuition + £1,347/mo (£1,652/mo in London) Stipend + Return Airfare + Thesis Grant',
    deadline: 'December 12, 2026',
    deadlineMonthGroup: 'Nov – Dec (Urgent)',
    isDeadlineNear: true,
    daysLeftLabel: 'Deadline Near — Dec 12',
    eligibility: 'Citizen of a Commonwealth nation (including India), First-Class or Upper Second-Class Honours degree, demonstrated financial need.',
    officialUrl: 'https://cscuk.fcdo.gov.uk/scholarships/'
  },
  {
    id: 'vanier-canada',
    name: 'Vanier Canada Graduate Scholarships (Vanier CGS)',
    country: 'Canada',
    flag: '🇨🇦',
    institution: 'Government of Canada (U of T, UBC, McGill, Waterloo & Canadian Research Universities)',
    courses: ['PhD'],
    fundingType: 'Fully Funded',
    amount: 'CAD $50,000 per year for 3 years (Covers Full Tuition + Research & Living Stipend)',
    deadline: 'November 2026 (University Nomination Window)',
    deadlineMonthGroup: 'Nov – Dec (Urgent)',
    isDeadlineNear: true,
    daysLeftLabel: 'Closing Soon — Nomination Window',
    eligibility: 'First-class academic average in previous studies, nominated by a Canadian university with a PhD quota, strong research & leadership record.',
    officialUrl: 'https://vanier.gc.ca/en/home-accueil.html'
  },
  {
    id: 'pearson-toronto-canada',
    name: 'Lester B. Pearson International Scholarship',
    country: 'Canada',
    flag: '🇨🇦',
    institution: 'University of Toronto (St. George, Mississauga, Scarborough)',
    courses: ['Bachelors'],
    fundingType: 'Fully Funded',
    amount: 'Full 4-Year Tuition + Books + Incidental Fees + Full Residence Support',
    deadline: 'November 2026 (School Nomination) / January 15, 2027 (Student Application)',
    deadlineMonthGroup: 'Jan – Feb (Near)',
    isDeadlineNear: true,
    daysLeftLabel: 'Deadline Near — Jan 15',
    eligibility: 'International secondary school senior (Class 12) demonstrating exceptional academic achievement, creativity, and school leadership.',
    officialUrl: 'https://future.utoronto.ca/pearson/about/'
  },
  {
    id: 'knight-hennessy-usa',
    name: 'Knight-Hennessy Scholars at Stanford University',
    country: 'USA',
    flag: '🇺🇸',
    institution: 'Stanford University (All 7 Graduate Schools — MS, MBA, JD, MD, PhD)',
    courses: ['Masters', 'PhD'],
    fundingType: 'Fully Funded',
    amount: 'Full Tuition + Living & Academic Stipend (~$42,000/yr) + Annual Economy Travel Ticket',
    deadline: 'October 2026 / Early Autumn Cycle',
    deadlineMonthGroup: 'Nov – Dec (Urgent)',
    isDeadlineNear: false,
    daysLeftLabel: 'Annual Autumn Cycle',
    eligibility: 'Open to all nationalities applying to any full-time graduate program at Stanford; bachelor’s degree earned within the last 7 years.',
    officialUrl: 'https://knight-hennessy.stanford.edu/'
  },
  {
    id: 'gates-cambridge-uk',
    name: 'Gates Cambridge Scholarship',
    country: 'UK',
    flag: '🇬🇧',
    institution: 'University of Cambridge (Bill & Melinda Gates Foundation)',
    courses: ['Masters', 'PhD'],
    fundingType: 'Fully Funded',
    amount: '100% University Composition Fee + £21,000/yr Living Allowance + Visa & IHS + Economy Flights',
    deadline: 'December 3, 2026',
    deadlineMonthGroup: 'Nov – Dec (Urgent)',
    isDeadlineNear: true,
    daysLeftLabel: 'Deadline Near — Dec 3',
    eligibility: 'Outstanding intellectual ability, leadership potential, and commitment to improving the lives of others; applying to a full-time postgraduate degree at Cambridge.',
    officialUrl: 'https://www.gatescambridge.org/'
  },
  {
    id: 'australia-rtp',
    name: 'Australian Government Research Training Program (RTP)',
    country: 'Australia',
    flag: '🇦🇺',
    institution: 'Australian Department of Education (Melbourne, Sydney, ANU, UNSW, Monash, UQ)',
    courses: ['Masters', 'PhD'],
    fundingType: 'Fully Funded',
    amount: '100% Tuition Fee Offset + AUD $32,192/yr Tax-Free Stipend + Relocation & OSHC Health Cover',
    deadline: 'October 31 – November 30, 2026 (Round 1) / April 30, 2026 (Round 2)',
    deadlineMonthGroup: 'Nov – Dec (Urgent)',
    isDeadlineNear: true,
    daysLeftLabel: 'Deadline Near — Nov 30',
    eligibility: 'High First-Class Honours or Research Master’s degree, accepted by a faculty research supervisor at a participating Australian university.',
    officialUrl: 'https://www.education.gov.au/research-block-grants/research-training-program'
  },
  {
    id: 'cornell-tata-usa',
    name: 'Cornell University Tata Scholarship for Students from India',
    country: 'USA',
    flag: '🇺🇸',
    institution: 'Cornell University (Tata Education and Development Trust)',
    courses: ['Bachelors'],
    fundingType: 'Fully Funded',
    amount: '100% Undergraduate Tuition & Need-Based Financial Aid for All 8 Semesters',
    deadline: 'January 2, 2027',
    deadlineMonthGroup: 'Jan – Feb (Near)',
    isDeadlineNear: true,
    daysLeftLabel: 'Deadline Near — Jan 2',
    eligibility: 'Indian citizen who attended secondary school in India, admitted to Cornell as an undergraduate, and eligible for need-based financial aid (CSS Profile).',
    officialUrl: 'https://admissions.cornell.edu/financial-aid/international-students'
  },
  {
    id: 'great-scholarships-uk',
    name: 'GREAT Scholarships UK (British Council & UK Government)',
    country: 'UK',
    flag: '🇬🇧',
    institution: 'British Council & 70+ UK Universities (Manchester, Bristol, Warwick, Glasgow)',
    courses: ['Masters'],
    fundingType: 'Partial',
    amount: '£10,000 – £15,000 (~50% Tuition Fee Reduction for 1-Year Master’s)',
    deadline: 'April 30 – May 31, 2026',
    deadlineMonthGroup: 'Apr – Jun (Spring)',
    isDeadlineNear: false,
    daysLeftLabel: 'Spring Deadline — Apr/May',
    eligibility: 'Passport holder of an eligible country (including India), conditional or unconditional offer for a 1-year taught Master’s at a partner UK university.',
    officialUrl: 'https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships'
  },
  {
    id: 'aauw-usa',
    name: 'AAUW International Fellowships (United States)',
    country: 'USA',
    flag: '🇺🇸',
    institution: 'American Association of University Women (All Accredited US Universities)',
    courses: ['Masters', 'PhD'],
    fundingType: 'Partial',
    amount: '$20,000 (Master’s) to $25,000–$50,000 (Doctoral / Postdoctoral) Tuition & Living Grant',
    deadline: 'November 15, 2026',
    deadlineMonthGroup: 'Nov – Dec (Urgent)',
    isDeadlineNear: true,
    daysLeftLabel: 'Deadline Near — Nov 15',
    eligibility: 'Women who are non-US citizens holding an academic degree equivalent to a US Bachelor’s with minimum 3.5 GPA, admitted to a full-time US graduate program.',
    officialUrl: 'https://www.aauw.org/resources/programs/fellowships-grants/current-opportunities/international/'
  },
  {
    id: 'ubc-merit-canada',
    name: 'UBC International Major Entrance & Merit Award (IMES)',
    country: 'Canada',
    flag: '🇨🇦',
    institution: 'University of British Columbia (Vancouver & Okanagan Campuses)',
    courses: ['Bachelors', 'Masters'],
    fundingType: 'Merit',
    amount: 'CAD $20,000 – $40,000 per year (50% Tuition Reduction, Renewable up to 4 Years)',
    deadline: 'January 15, 2027',
    deadlineMonthGroup: 'Jan – Feb (Near)',
    isDeadlineNear: true,
    daysLeftLabel: 'Deadline Near — Jan 15',
    eligibility: 'Exceptional academic achievement (90%+ in Class 12 or First-Class GPA) and strong extracurricular/community involvement; automatic consideration upon admission.',
    officialUrl: 'https://you.ubc.ca/financial-planning/scholarships-awards-international-students/'
  },
  {
    id: 'melbourne-merit-australia',
    name: 'Melbourne & Sydney International Merit Scholarship',
    country: 'Australia',
    flag: '🇦🇺',
    institution: 'University of Melbourne & University of Sydney (Group of Eight)',
    courses: ['Bachelors', 'Masters'],
    fundingType: 'Merit',
    amount: '50% to 100% Tuition Fee Remission (Up to AUD $40,000 – $56,000 Fee Waiver)',
    deadline: 'November 30, 2026 (Semester 1 Intake) / May 31, 2026 (Semester 2 Intake)',
    deadlineMonthGroup: 'Nov – Dec (Urgent)',
    isDeadlineNear: true,
    daysLeftLabel: 'Deadline Near — Nov 30',
    eligibility: 'International student with an unconditional course offer and top 5–10% academic GPA (85%+ Indian equivalent). Automatically assessed with admission.',
    officialUrl: 'https://scholarships.unimelb.edu.au/'
  },
  {
    id: 'deutschlandstipendium-germany',
    name: 'Deutschlandstipendium National Merit Scholarship',
    country: 'Germany',
    flag: '🇩🇪',
    institution: 'Federal Ministry of Education & Research (TU Munich, RWTH Aachen, Heidelberg, TU Berlin)',
    courses: ['Bachelors', 'Masters'],
    fundingType: 'Merit',
    amount: '€300/month (€3,600/year) Merit Grant + €0 Public University Tuition',
    deadline: 'June 30, 2026 (Winter Semester) / January 31, 2027 (Summer Semester)',
    deadlineMonthGroup: 'Jan – Feb (Near)',
    isDeadlineNear: true,
    daysLeftLabel: 'Winter/Summer Window Open',
    eligibility: 'Enrolled or admitted international student at a participating German university with outstanding academic grades and social/civic engagement.',
    officialUrl: 'https://www.deutschlandstipendium.de/deutschlandstipendium/de/services/english/the-deutschlandstipendium-best-of-both-worlds.html'
  }
];

const FAQ_ITEMS = [
  {
    q: 'Can I get a 100% fully funded scholarship for Masters or PhD abroad?',
    a: 'Yes. Government and endowment scholarships such as Chevening (UK), Fulbright-Nehru (USA), DAAD EPOS (Germany), Commonwealth Scholarships (UK), Gates Cambridge, Knight-Hennessy (Stanford), and Australian RTP cover 100% of tuition fees plus a monthly living stipend, health insurance, and return economy airfare.'
  },
  {
    q: 'When should I start applying for international scholarships?',
    a: 'Most fully funded government scholarships open 9 to 12 months before the academic intake begins. For September/October intakes, deadlines for Chevening, DAAD, Gates Cambridge, Vanier Canada, and Commonwealth fall between October and January.'
  },
  {
    q: 'Does a scholarship guarantee Student Visa approval?',
    a: 'While embassy visa officers still verify background and security clearances, holding an official government or university scholarship certificate serves as the strongest possible proof of financial sufficiency and academic merit, resulting in a 98%+ visa approval rate.'
  },
  {
    q: 'Do I need a separate Statement of Purpose (SOP) for scholarship applications?',
    a: 'Yes. Scholarships require a dedicated personal statement or leadership/research essay explaining your academic track record, career impact, and why you deserve funding. You can use our 100% Free SOP Generator (/sop-generator) to draft your statement.'
  }
];

export const ScholarshipFinderPage: React.FC<ScholarshipFinderPageProps> = ({ onNavigate }) => {
  const [selectedCountry, setSelectedCountry] = useState<ScholarshipCountry>('All');
  const [selectedCourse, setSelectedCourse] = useState<ScholarshipCourse>('All');
  const [selectedType, setSelectedType] = useState<ScholarshipType>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyUrgentDeadlines, setOnlyUrgentDeadlines] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredScholarships = useMemo(() => {
    return SCHOLARSHIPS_DB.filter((item) => {
      if (selectedCountry !== 'All' && item.country !== selectedCountry) return false;
      if (selectedCourse !== 'All' && !item.courses.includes(selectedCourse)) return false;
      if (selectedType !== 'All' && item.fundingType !== selectedType) return false;
      if (onlyUrgentDeadlines && !item.isDeadlineNear) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchInst = item.institution.toLowerCase().includes(q);
        const matchCountry = item.country.toLowerCase().includes(q);
        if (!matchName && !matchInst && !matchCountry) return false;
      }
      return true;
    });
  }, [selectedCountry, selectedCourse, selectedType, searchQuery, onlyUrgentDeadlines]);

  const urgentDeadlinesList = useMemo(() => {
    return SCHOLARSHIPS_DB.filter((s) => s.isDeadlineNear);
  }, []);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PageBackBar pageName="Scholarship Finder" onNavigate={onNavigate} />

      {/* Blue Hero Header */}
      <section className="bg-[#0B3D91] text-white py-10 sm:py-14 px-4 border-b border-blue-800">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4">
            <Award className="w-4 h-4" />
            <span>100% FREE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-3">
            Scholarship Finder — Study Abroad with 50% to 100% Funding
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-3xl leading-relaxed">
            Compare 15 verified government and university scholarships across{' '}
            <strong className="text-white">USA, UK, Canada, Australia, and Germany</strong> for{' '}
            <strong className="text-white">Bachelors, Masters, and PhD</strong> programs. Check funding
            amounts, upcoming deadlines, eligibility rules, and apply directly on official portals.
          </p>

          {/* Direct Cross-Links to /sop-generator and /student-visa-university */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => onNavigate('/sop-generator')}
              className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Free SOP Generator for Scholarship &amp; Visa →</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/student-visa-university')}
              className="py-2.5 px-4 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-black text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>Student Visa + University Finder →</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        {/* Deadline Calendar — Which Scholarship Deadline is Near? */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-amber-300 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Live Deadline Calendar — 2026/2027 Intake</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Which Scholarship Deadline is Near? ({urgentDeadlinesList.length} Closing Soon)
              </h2>
              <p className="text-xs text-slate-600">
                Do not miss your application window. Below are the major scholarships with deadlines closing in the upcoming cycle.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOnlyUrgentDeadlines(!onlyUrgentDeadlines)}
              className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                onlyUrgentDeadlines
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{onlyUrgentDeadlines ? 'Showing Urgent Deadlines Only ✓' : 'Filter by Urgent Deadlines Only'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['Nov – Dec (Urgent)', 'Jan – Feb (Near)', 'Apr – Jun (Spring)'] as const).map((group) => {
              const items = SCHOLARSHIPS_DB.filter((s) => s.deadlineMonthGroup === group);
              const isUrgentGroup = group === 'Nov – Dec (Urgent)';
              const isNearGroup = group === 'Jan – Feb (Near)';
              return (
                <div
                  key={group}
                  className={`rounded-xl p-4 border space-y-3 ${
                    isUrgentGroup
                      ? 'bg-rose-50/60 border-rose-200'
                      : isNearGroup
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-emerald-50/60 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isUrgentGroup
                          ? 'bg-rose-600 text-white'
                          : isNearGroup
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {group}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-600">
                      {items.length} Scholarships
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.map((sch) => (
                      <div
                        key={sch.id}
                        className="bg-white p-3 rounded-lg border border-slate-200 flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-black text-slate-900 truncate">
                            {sch.flag} {sch.name}
                          </div>
                          <div className="text-[11px] font-bold text-rose-700 mt-0.5">
                            ⏰ {sch.deadline}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold">
                            {sch.fundingType} • {sch.courses.join(' / ')}
                          </div>
                        </div>
                        <a
                          href={sch.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-[10px] rounded-lg shrink-0 flex items-center gap-1"
                        >
                          <span>Apply →</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Scholarship Filter Bar */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0B3D91] bg-blue-50 px-3 py-1 rounded-full">
                100% Free Scholarship Search Tool
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
                Filter Scholarships by Country, Course &amp; Funding Type
              </h2>
            </div>
            <div className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
              Showing {filteredScholarships.length} of {SCHOLARSHIPS_DB.length} Verified Scholarships
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Country Filter */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                1. Destination Country
              </label>
              <select
                aria-label="Select Destination Country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value as ScholarshipCountry)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="All">🌍 All 5 Countries (USA, UK, CA, AU, DE)</option>
                <option value="USA">🇺🇸 USA (Fulbright, Stanford, Cornell, AAUW)</option>
                <option value="UK">🇬🇧 UK (Chevening, Commonwealth, Cambridge, GREAT)</option>
                <option value="Canada">🇨🇦 Canada (Vanier CGS, U of T Pearson, UBC)</option>
                <option value="Australia">🇦🇺 Australia (RTP Government, Melbourne, Sydney)</option>
                <option value="Germany">🇩🇪 Germany (DAAD EPOS, Deutschlandstipendium)</option>
              </select>
            </div>

            {/* 2. Course Filter */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                2. Course / Degree Level
              </label>
              <select
                aria-label="Select Course Level"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value as ScholarshipCourse)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="All">🎓 All Courses (Bachelors / Masters / PhD)</option>
                <option value="Bachelors">📘 Bachelors (Undergraduate)</option>
                <option value="Masters">🎓 Masters (MS / MA / M.Sc / MBA)</option>
                <option value="PhD">🔬 PhD / Doctoral Research</option>
              </select>
            </div>

            {/* 3. Funding Type Filter */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                3. Scholarship Type
              </label>
              <select
                aria-label="Select Scholarship Type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ScholarshipType)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="All">✨ All Funding Types</option>
                <option value="Fully Funded">🏆 Fully Funded (100% Tuition + Stipend)</option>
                <option value="Partial">💰 Partial Funding (50% Tuition / Grant)</option>
                <option value="Merit">🎖️ Merit Scholarship (Academic Excellence)</option>
              </select>
            </div>

            {/* 4. Search Scholarship */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                4. Search Scholarship Name
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Fulbright, Chevening, DAAD..."
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                />
              </div>
            </div>
          </div>

          {/* Quick Country & Type Pill Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {(['All', 'USA', 'UK', 'Canada', 'Australia', 'Germany'] as ScholarshipCountry[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCountry(c)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedCountry === c
                      ? 'bg-[#0B3D91] text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {c === 'All' ? 'All Countries' : c}
                </button>
              ))}
            </div>

            {(selectedCountry !== 'All' || selectedCourse !== 'All' || selectedType !== 'All' || searchQuery || onlyUrgentDeadlines) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCountry('All');
                  setSelectedCourse('All');
                  setSelectedType('All');
                  setSearchQuery('');
                  setOnlyUrgentDeadlines(false);
                }}
                className="text-xs font-black text-rose-700 hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Scholarship Cards List */}
        {filteredScholarships.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
            <p className="text-base font-black text-slate-900">
              No scholarships matched your exact filter combination.
            </p>
            <p className="text-xs text-slate-600">
              Try switching Scholarship Type or Course Level to "All" to see all available programs.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCountry('All');
                setSelectedCourse('All');
                setSelectedType('All');
                setSearchQuery('');
                setOnlyUrgentDeadlines(false);
              }}
              className="py-2.5 px-5 bg-[#0B3D91] text-white text-xs font-black rounded-xl cursor-pointer"
            >
              Show All 15 Scholarships
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredScholarships.map((sch, idx) => (
              <div
                key={sch.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-[#0B3D91] transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black bg-[#0B3D91] text-white px-2.5 py-0.5 rounded-full">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-black bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full">
                        {sch.flag} {sch.country}
                      </span>
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                          sch.fundingType === 'Fully Funded'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : sch.fundingType === 'Partial'
                            ? 'bg-blue-50 text-[#0B3D91] border-blue-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {sch.fundingType === 'Fully Funded'
                          ? '🏆 Fully Funded (100%)'
                          : sch.fundingType === 'Partial'
                          ? '💰 Partial Scholarship'
                          : '🎖️ Merit Scholarship'}
                      </span>
                      {sch.courses.map((course) => (
                        <span
                          key={course}
                          className="text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full"
                        >
                          {course}
                        </span>
                      ))}
                      {sch.isDeadlineNear && (
                        <span className="text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          ⏰ {sch.daysLeftLabel}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 pt-1">
                      {sch.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      🏛️ {sch.institution}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onNavigate('/sop-generator')}
                      className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#0B3D91]" />
                      <span>Generate SOP</span>
                    </button>
                    <a
                      href={sch.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <span>Apply →</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                    <div className="text-[11px] font-extrabold uppercase text-emerald-800">
                      Scholarship Amount &amp; Coverage
                    </div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                      {sch.amount}
                    </div>
                  </div>

                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                    <div className="text-[11px] font-extrabold uppercase text-amber-900">
                      Application Deadline
                    </div>
                    <div className="text-xs sm:text-sm font-black text-slate-900 mt-1">
                      {sch.deadline}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="text-[11px] font-extrabold uppercase text-slate-500">
                      Eligibility Criteria
                    </div>
                    <div className="text-xs text-slate-700 font-semibold mt-1 leading-relaxed">
                      {sch.eligibility}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Student Toolkit Cross-Link Banner (/sop-generator + /student-visa-university) */}
        <div className="bg-gradient-to-r from-[#0B3D91] to-[#1E3A8A] rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Free Student Visa &amp; Admission Suite</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Preparing Your Scholarship or University Application?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Use our free 800-word Statement of Purpose (SOP) Generator to write your scholarship essay, or compare universities accepting applications with and without IELTS.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/sop-generator')}
              className="py-3 px-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Open Free SOP Generator →</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/student-visa-university')}
              className="py-3 px-5 bg-white text-[#0B3D91] hover:bg-blue-50 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Student Visa + University Finder →</span>
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <HelpCircle className="w-6 h-6 text-[#0B3D91]" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Frequently Asked Questions — Study Abroad Scholarships
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <h3 className="text-sm font-black text-slate-900">{item.q}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Email Only Subscribe Box */}
        <EmailSubscribeBox pageContext="Scholarship Finder" />

        <PageBottomBack onNavigate={onNavigate} />
      </div>
    </div>
  );
};
