import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Award,
  Globe,
  Clock
} from 'lucide-react';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface StudentVisaUniversityPageProps {
  onNavigate?: (path: string) => void;
}

type StudyCountry = 'USA' | 'UK' | 'Canada' | 'Australia' | 'Germany';
type StudyCourse = 'Bachelors' | 'Masters' | 'MBA';
type StudyBudget = '10L' | '20L' | '40L';
type IeltsFilter = 'all' | 'without-ielts' | 'with-ielts';

interface UniversityRecord {
  name: string;
  city: string;
  country: StudyCountry;
  tuitionAnnualDisplay: string;
  budgetTier: StudyBudget[];
  ieltsRequirement: string;
  withoutIeltsAllowed: boolean;
  postStudyWorkVisa: string;
  visaSubclassName: string;
  scholarshipNote: string;
  officialUrl: string;
}

const UNIVERSITY_DATABASE: Record<StudyCountry, UniversityRecord[]> = {
  Germany: [
    {
      name: 'Technical University of Munich (TUM)',
      city: 'Munich, Bavaria',
      country: 'Germany',
      tuitionAnnualDisplay: '€0 – €6,000/yr (~₹1.5L – ₹5.4L/yr + Living)',
      budgetTier: ['10L', '20L', '40L'],
      ieltsRequirement: 'IELTS 6.5 OR English Medium of Instruction (MOI) for select programs',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: '18 Months Post-Study Job Seeker Permit (§20 AufenthG)',
      visaSubclassName: 'German National Student Visa (§16b)',
      scholarshipNote: 'DAAD & Deutschlandstipendium (€300/month)',
      officialUrl: 'https://www.tum.de/en/'
    },
    {
      name: 'RWTH Aachen University',
      city: 'Aachen, North Rhine-Westphalia',
      country: 'Germany',
      tuitionAnnualDisplay: '€0 Tuition (~€650/yr Semester Fee = ₹60,000/yr)',
      budgetTier: ['10L', '20L', '40L'],
      ieltsRequirement: 'IELTS 6.0–6.5 / TOEFL 90',
      withoutIeltsAllowed: false,
      postStudyWorkVisa: '18 Months Post-Study Work Permit + Fast EU Blue Card',
      visaSubclassName: 'German National Student Visa (§16b)',
      scholarshipNote: 'DAAD STEM Scholarships Available',
      officialUrl: 'https://www.rwth-aachen.de/'
    },
    {
      name: 'University of Siegen',
      city: 'Siegen, North Rhine-Westphalia',
      country: 'Germany',
      tuitionAnnualDisplay: '€0 Tuition (~€640/yr Semester Contribution)',
      budgetTier: ['10L', '20L', '40L'],
      ieltsRequirement: 'Without IELTS Accepted (English MOI Certificate from Previous Degree)',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: '18 Months Post-Study Job Seeker Visa',
      visaSubclassName: 'German National Student Visa (§16b)',
      scholarshipNote: 'NRW Study Completion Grants',
      officialUrl: 'https://www.uni-siegen.de/'
    },
    {
      name: 'Freie Universität Berlin (FU Berlin)',
      city: 'Berlin',
      country: 'Germany',
      tuitionAnnualDisplay: '€0 Tuition (~€630/yr Semester Ticket incl. Transit)',
      budgetTier: ['10L', '20L', '40L'],
      ieltsRequirement: 'IELTS 6.5 OR English Degree Proof (Without IELTS on select tracks)',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: '18 Months Post-Study Work Visa',
      visaSubclassName: 'German National Student Visa (§16b)',
      scholarshipNote: 'DAAD & Heinrich Böll Foundation Grants',
      officialUrl: 'https://www.fu-berlin.de/en/'
    },
    {
      name: 'Frankfurt School of Finance & Management',
      city: 'Frankfurt am Main',
      country: 'Germany',
      tuitionAnnualDisplay: '€16,500 – €39,000/yr (~₹14.8L – ₹35L/yr)',
      budgetTier: ['20L', '40L'],
      ieltsRequirement: 'IELTS 7.0 OR Duolingo / MOI Waiver for English Graduates',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: '18 Months Post-Study Work Visa in Europe’s Banking Hub',
      visaSubclassName: 'German National Student Visa (§16b)',
      scholarshipNote: 'Up to 40% Merit Tuition Waivers for Masters & MBA',
      officialUrl: 'https://www.frankfurt-school.de/en/home'
    }
  ],
  UK: [
    {
      name: 'University of Hertfordshire',
      city: 'Hatfield (25 Mins from London)',
      country: 'UK',
      tuitionAnnualDisplay: '£15,500/yr (~₹16.5L/yr — ₹10L–₹12L after Scholarship)',
      budgetTier: ['10L', '20L', '40L'],
      ieltsRequirement: 'Without IELTS Accepted (70%+ in Class 12 English or English MOI)',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'UK 2 Years Post-Study Work (Graduate Route Visa)',
      visaSubclassName: 'UK Student Visa (CAS)',
      scholarshipNote: '£2,000 – £4,000 Vice-Chancellor International Scholarship',
      officialUrl: 'https://www.herts.ac.uk/international'
    },
    {
      name: 'Coventry University',
      city: 'Coventry & London Campus',
      country: 'UK',
      tuitionAnnualDisplay: '£16,800 – £20,050/yr (~₹17.8L – ₹21.5L/yr)',
      budgetTier: ['10L', '20L', '40L'],
      ieltsRequirement: 'Without IELTS Accepted (65%+ in Class 12 English / Internal Test)',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'UK 2 Years Graduate Route Work Visa',
      visaSubclassName: 'UK Student Visa (CAS)',
      scholarshipNote: 'Up to £3,000 International Pathways Merit Award',
      officialUrl: 'https://www.coventry.ac.uk/international-students-hub/'
    },
    {
      name: 'University of Portsmouth',
      city: 'Portsmouth, South Coast',
      country: 'UK',
      tuitionAnnualDisplay: '£16,200 – £19,200/yr (~₹17.2L – ₹20.5L/yr)',
      budgetTier: ['20L', '40L'],
      ieltsRequirement: 'Without IELTS Accepted (MOI / CBSE & ICSE 70%+ English Waiver)',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'UK 2 Years Graduate Route Work Visa',
      visaSubclassName: 'UK Student Visa (CAS)',
      scholarshipNote: '£2,500 Chancellor’s Global Academic Merit Bursary',
      officialUrl: 'https://www.port.ac.uk/study/international-students'
    },
    {
      name: 'University of Birmingham (Russell Group)',
      city: 'Birmingham',
      country: 'UK',
      tuitionAnnualDisplay: '£24,000 – £31,500/yr (~₹25.5L – ₹33.5L/yr)',
      budgetTier: ['20L', '40L'],
      ieltsRequirement: 'IELTS 6.5 OR CBSE/ICSE 80%+ in Class 12 English (Without IELTS)',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'UK 2 Years Graduate Route (3 Years for PhD)',
      visaSubclassName: 'UK Student Visa (CAS)',
      scholarshipNote: '£4,000 India Chancellor’s Masters Scholarship',
      officialUrl: 'https://www.birmingham.ac.uk/international'
    },
    {
      name: 'University of Manchester (Russell Group)',
      city: 'Manchester',
      country: 'UK',
      tuitionAnnualDisplay: '£26,500 – £36,000/yr (~₹28.2L – ₹38.5L/yr)',
      budgetTier: ['40L'],
      ieltsRequirement: 'IELTS 6.5–7.0 Overall',
      withoutIeltsAllowed: false,
      postStudyWorkVisa: 'UK 2 Years Post-Study Work (Graduate Route)',
      visaSubclassName: 'UK Student Visa (CAS)',
      scholarshipNote: '£8,000 Global Futures Scholarship for South Asia',
      officialUrl: 'https://www.manchester.ac.uk/study/international/'
    }
  ],
  Canada: [
    {
      name: 'Memorial University of Newfoundland (MUN)',
      city: 'St. John’s, Newfoundland',
      country: 'Canada',
      tuitionAnnualDisplay: 'CAD $11,460 – $20,000/yr (~₹7.1L – ₹12.4L/yr)',
      budgetTier: ['10L', '20L', '40L'],
      ieltsRequirement: 'IELTS 6.5 OR Duolingo / 4-Year English MOI Waiver',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'Canada Up to 3 Years PGWP (Post-Graduation Work Permit)',
      visaSubclassName: 'Canada Study Permit (PAL + LOA)',
      scholarshipNote: 'Lowest Public University Tuition in Canada + Atlantic PR Pathway',
      officialUrl: 'https://www.mun.ca/become/'
    },
    {
      name: 'University of Regina',
      city: 'Regina, Saskatchewan',
      country: 'Canada',
      tuitionAnnualDisplay: 'CAD $18,500 – $24,500/yr (~₹11.5L – ₹15.2L/yr)',
      budgetTier: ['10L', '20L', '40L'],
      ieltsRequirement: 'IELTS 6.5 OR Duolingo 120 (MOI accepted for select institutions)',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'Canada 3 Years PGWP + Saskatchewan SINP Graduate PR',
      visaSubclassName: 'Canada Study Permit',
      scholarshipNote: 'CAD $3,000 Entrance Scholarship',
      officialUrl: 'https://www.uregina.ca/international/'
    },
    {
      name: 'University of Winnipeg',
      city: 'Winnipeg, Manitoba',
      country: 'Canada',
      tuitionAnnualDisplay: 'CAD $17,500 – $22,000/yr (~₹10.8L – ₹13.6L/yr)',
      budgetTier: ['10L', '20L', '40L'],
      ieltsRequirement: 'Duolingo / English MOI Waiver / IELTS 6.5',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'Canada Up to 3 Years PGWP + Manitoba MPNP Career Pathway',
      visaSubclassName: 'Canada Study Permit',
      scholarshipNote: 'President’s Scholarship for World Leaders ($5,000)',
      officialUrl: 'https://www.uwinnipeg.ca/future-student/international/'
    },
    {
      name: 'University of Waterloo',
      city: 'Waterloo, Ontario',
      country: 'Canada',
      tuitionAnnualDisplay: 'CAD $28,000 – $48,000/yr (~₹17.4L – ₹29.8L/yr)',
      budgetTier: ['20L', '40L'],
      ieltsRequirement: 'IELTS 6.5–7.0 / TOEFL 90',
      withoutIeltsAllowed: false,
      postStudyWorkVisa: 'Canada 3 Years PGWP + Paid Co-op Terms ($4,500/mo)',
      visaSubclassName: 'Canada Study Permit',
      scholarshipNote: '$10,000 International Master’s Award of Excellence',
      officialUrl: 'https://uwaterloo.ca/future-students/'
    },
    {
      name: 'University of British Columbia (UBC)',
      city: 'Vancouver & Kelowna, BC',
      country: 'Canada',
      tuitionAnnualDisplay: 'CAD $34,000 – $54,000/yr (~₹21.1L – ₹33.5L/yr)',
      budgetTier: ['20L', '40L'],
      ieltsRequirement: 'IELTS 6.5 OR 4 Years English-Medium Degree in Recognized Country',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'Canada 3 Years PGWP + Direct BC PNP Masters PR Stream',
      visaSubclassName: 'Canada Study Permit',
      scholarshipNote: 'BC Graduate Scholarship & International Tuition Award',
      officialUrl: 'https://you.ubc.ca/'
    }
  ],
  USA: [
    {
      name: 'California State University, Long Beach (CSULB)',
      city: 'Long Beach, California',
      country: 'USA',
      tuitionAnnualDisplay: '$16,800 – $19,500/yr (~₹14.1L – ₹16.4L/yr)',
      budgetTier: ['10L', '20L', '40L'],
      ieltsRequirement: 'Duolingo 105 / TOEFL 80 / IELTS 6.0',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'USA 3 Years STEM OPT (12 Months OPT + 24 Months STEM Extension)',
      visaSubclassName: 'US F-1 Student Visa (Form I-20)',
      scholarshipNote: 'Graduate Assistantships & Out-of-State Tuition Waivers',
      officialUrl: 'https://www.csulb.edu/international'
    },
    {
      name: 'University of Texas at Arlington (UTA)',
      city: 'Arlington (Dallas-Fort Worth), Texas',
      country: 'USA',
      tuitionAnnualDisplay: '$19,200 – $23,500/yr (~₹16.1L – ₹19.7L/yr)',
      budgetTier: ['20L', '40L'],
      ieltsRequirement: 'TOEFL / Duolingo / IELTS 6.5 (GRE Waived on select MS programs)',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'USA 3 Years STEM OPT Work Authorization',
      visaSubclassName: 'US F-1 Student Visa (Form I-20)',
      scholarshipNote: '$1,000 Competitive Scholarship grants In-State Tuition (~50% off!)',
      officialUrl: 'https://www.uta.edu/admissions/international'
    },
    {
      name: 'Arizona State University (ASU)',
      city: 'Tempe (Phoenix Metro), Arizona',
      country: 'USA',
      tuitionAnnualDisplay: '$26,500 – $36,000/yr (~₹22.2L – ₹30.2L/yr)',
      budgetTier: ['20L', '40L'],
      ieltsRequirement: 'Duolingo 105 / IELTS 6.5 / ASU English Waiver',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'USA 3 Years STEM OPT',
      visaSubclassName: 'US F-1 Student Visa (Form I-20)',
      scholarshipNote: '$3,000 – $15,500 New American University Scholarship',
      officialUrl: 'https://admission.asu.edu/international'
    },
    {
      name: 'Northeastern University',
      city: 'Boston, MA & Seattle, WA',
      country: 'USA',
      tuitionAnnualDisplay: '$28,500 – $42,000/yr (~₹23.9L – ₹35.2L/yr)',
      budgetTier: ['20L', '40L'],
      ieltsRequirement: 'Duolingo / IELTS 6.5 / English Medium Degree Waiver',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'USA 3 Years STEM OPT + 8-Month Paid Co-op ($35–$55/hr)',
      visaSubclassName: 'US F-1 Student Visa (Form I-20)',
      scholarshipNote: '10%–25% Dean’s Scholarship on Tuition',
      officialUrl: 'https://admissions.northeastern.edu/'
    },
    {
      name: 'Georgia Institute of Technology (Georgia Tech)',
      city: 'Atlanta, Georgia',
      country: 'USA',
      tuitionAnnualDisplay: '$31,000 – $41,500/yr (~₹26.0L – ₹34.8L/yr)',
      budgetTier: ['40L'],
      ieltsRequirement: 'IELTS 7.0 / TOEFL 95',
      withoutIeltsAllowed: false,
      postStudyWorkVisa: 'USA 3 Years STEM OPT',
      visaSubclassName: 'US F-1 Student Visa (Form I-20)',
      scholarshipNote: 'GRA / GTA Research Assistantships (Full Tuition Waiver + Stipend)',
      officialUrl: 'https://www.gatech.edu/academics/admissions'
    }
  ],
  Australia: [
    {
      name: 'Charles Darwin University (CDU)',
      city: 'Darwin, Northern Territory (Regional Bonus)',
      country: 'Australia',
      tuitionAnnualDisplay: 'AUD $26,000 – $31,000/yr (~₹14.5L – ₹17.3L/yr)',
      budgetTier: ['10L', '20L', '40L'],
      ieltsRequirement: 'IELTS 6.0 / PTE 50 / CBSE & ICSE English Waiver on select degrees',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'Australia 3 to 4 Years Post-Study Work (Subclass 485 + Regional Extension)',
      visaSubclassName: 'Australia Student Visa (Subclass 500)',
      scholarshipNote: '30% CDU Global Merit Scholarship + 5 Extra Regional PR Points',
      officialUrl: 'https://www.cdu.edu.au/international'
    },
    {
      name: 'Edith Cowan University (ECU)',
      city: 'Perth, Western Australia (Regional Category 2)',
      country: 'Australia',
      tuitionAnnualDisplay: 'AUD $31,500 – $36,500/yr (~₹17.6L – ₹20.4L/yr)',
      budgetTier: ['20L', '40L'],
      ieltsRequirement: 'Without IELTS Accepted for University Admission (70%+ Class 12 English / PTE)',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'Australia 3 Years Post-Study Work (2 Yrs + 1 Yr Perth Regional)',
      visaSubclassName: 'Australia Student Visa (Subclass 500)',
      scholarshipNote: '20% International Masters & Undergraduate Scholarship',
      officialUrl: 'https://www.ecu.edu.au/degrees/international'
    },
    {
      name: 'Deakin University',
      city: 'Melbourne & Geelong (Regional), Victoria',
      country: 'Australia',
      tuitionAnnualDisplay: 'AUD $34,000 – $40,000/yr (~₹19.0L – ₹22.4L/yr)',
      budgetTier: ['20L', '40L'],
      ieltsRequirement: 'IELTS 6.0–6.5 / PTE Academic 50–58',
      withoutIeltsAllowed: false,
      postStudyWorkVisa: 'Australia 2 to 3 Years Post-Study Work (Subclass 485)',
      visaSubclassName: 'Australia Student Visa (Subclass 500)',
      scholarshipNote: '25% Deakin India Merit Scholarship (100% Vice-Chancellor Award available)',
      officialUrl: 'https://www.deakin.edu.au/international-students'
    },
    {
      name: 'RMIT University',
      city: 'Melbourne, Victoria',
      country: 'Australia',
      tuitionAnnualDisplay: 'AUD $35,500 – $43,000/yr (~₹19.8L – ₹24.0L/yr)',
      budgetTier: ['20L', '40L'],
      ieltsRequirement: 'IELTS 6.5 / PTE 58 / English MOI Waiver for select prior qualifications',
      withoutIeltsAllowed: true,
      postStudyWorkVisa: 'Australia 2 to 3 Years Temporary Graduate Visa (Subclass 485)',
      visaSubclassName: 'Australia Student Visa (Subclass 500)',
      scholarshipNote: '20% STEM & Business Future Leaders Scholarship',
      officialUrl: 'https://www.rmit.edu.au/study-with-us/international-students'
    },
    {
      name: 'University of New South Wales (UNSW Sydney — Go8)',
      city: 'Sydney, NSW',
      country: 'Australia',
      tuitionAnnualDisplay: 'AUD $47,000 – $54,000/yr (~₹26.3L – ₹30.2L/yr)',
      budgetTier: ['40L'],
      ieltsRequirement: 'IELTS 6.5–7.0 / PTE 64',
      withoutIeltsAllowed: false,
      postStudyWorkVisa: 'Australia 2 to 3 Years Post-Study Work (Subclass 485)',
      visaSubclassName: 'Australia Student Visa (Subclass 500)',
      scholarshipNote: 'AUD $10,000 – Full Tuition Future of Change India Scholarship',
      officialUrl: 'https://www.unsw.edu.au/study/international-students'
    }
  ]
};

export const StudentVisaUniversityPage: React.FC<StudentVisaUniversityPageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  const [selectedCountry, setSelectedCountry] = useState<StudyCountry>('UK');
  const [selectedCourse, setSelectedCourse] = useState<StudyCourse>('Masters');
  const [selectedBudget, setSelectedBudget] = useState<StudyBudget>('20L');
  const [ieltsFilter, setIeltsFilter] = useState<IeltsFilter>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const universities = useMemo(() => {
    const baseList = UNIVERSITY_DATABASE[selectedCountry] || UNIVERSITY_DATABASE.UK;
    const filtered = baseList.filter((u) => {
      if (ieltsFilter === 'without-ielts' && !u.withoutIeltsAllowed) return false;
      if (ieltsFilter === 'with-ielts' && u.withoutIeltsAllowed) return false;
      return true;
    });
    return filtered.length > 0 ? filtered : baseList;
  }, [selectedCountry, ieltsFilter]);

  const faqs = [
    {
      q: 'Can I study abroad in the UK, Germany, USA, or Canada without IELTS in 2026?',
      a: 'Yes! Many universities in the UK (such as University of Hertfordshire, Coventry, Portsmouth, and Birmingham), Germany (University of Siegen, TUM, FU Berlin), USA (via Duolingo or English MOI waiver), and Canada waive the IELTS requirement if you completed your previous Bachelor’s degree in English (Medium of Instruction — MOI Certificate) or scored 70%–80%+ in Class 12 English.'
    },
    {
      q: 'Which country offers the longest Post-Study Work Visa after graduation?',
      a: 'USA offers up to 3 years on STEM OPT (1 year OPT + 2 years STEM extension), Canada offers up to 3 years on the Post-Graduation Work Permit (PGWP), Australia offers 2 to 4 years on the Subclass 485 Temporary Graduate Visa (longer in regional cities like Perth and Darwin), the UK offers 2 years on the Graduate Route (3 years for PhD), and Germany offers an 18-month Post-Study Job Seeker Permit that converts into an EU Blue Card.'
    },
    {
      q: 'Which country has the lowest tuition fee for Indian and international students?',
      a: 'Germany is the most affordable destination because public universities (like RWTH Aachen, TUM, FU Berlin, and University of Siegen) charge €0 to very low tuition fees, requiring only a semester administrative contribution of €300–€650 per year plus your personal blocked account (€11,904/year ~Rs 10.5 Lakhs) for living costs.'
    },
    {
      q: 'How do I write a winning Statement of Purpose (SOP) for my university and student visa application?',
      a: 'Use our 100% Free SOP Generator at /sop-generator to automatically generate a structured 800-word Statement of Purpose tailored to your university, course, academic background, and career plans in home country, with instant PDF download.'
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

      {/* Top Back to Home */}
      <PageBackBar onNavigate={onNavigate} pageName="Student Visa + University Finder" />

      {/* Blue Hero Header */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FREE • COMPARE UNIVERSITIES, TUITION, IELTS WAIVERS &amp; POST-STUDY WORK VISAS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Student Visa + University Finder
          </h1>
          <p className="text-sm sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Compare top universities across the USA, UK, Canada, Australia, and Germany by Course (Bachelors, Masters, MBA), Budget (Rs 10L / 20L / 40L), and IELTS / Without IELTS eligibility.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* Filter Tool Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                FREE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Select Study Destination, Course, Budget &amp; IELTS Filter
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate('/sop-generator')}
                className="py-2.5 px-4 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Free SOP Generator →</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/scholarship-finder')}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <span>Scholarship Finder (100% Free) →</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Country */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Country
              </label>
              <select
                aria-label="Select Country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value as StudyCountry)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="USA">🇺🇸 USA (3-Yr STEM OPT)</option>
                <option value="UK">🇬🇧 UK (2-Yr Graduate Route)</option>
                <option value="Canada">🇨🇦 Canada (Up to 3-Yr PGWP)</option>
                <option value="Australia">🇦🇺 Australia (2–4 Yr Subclass 485)</option>
                <option value="Germany">🇩🇪 Germany (€0 Public Tuition + 18-Mo PSW)</option>
              </select>
            </div>

            {/* 2. Course */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                2. Select Course Level
              </label>
              <select
                aria-label="Select Course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value as StudyCourse)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="Bachelors">🎓 Bachelors (B.Sc / B.Eng / BBA)</option>
                <option value="Masters">📘 Masters (MS / M.Sc / M.Eng)</option>
                <option value="MBA">💼 MBA (Master of Business Admin)</option>
              </select>
            </div>

            {/* 3. Annual Budget */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                3. Select Tuition Budget
              </label>
              <select
                aria-label="Select Budget"
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value as StudyBudget)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="10L">Rs 10L (Low-Tuition / Public Track)</option>
                <option value="20L">Rs 20L (Standard International Budget)</option>
                <option value="40L">Rs 40L (Top Global / Ivy / Russell / Go8)</option>
              </select>
            </div>

            {/* 4. IELTS / Without IELTS Filter */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                4. IELTS / Without IELTS Filter
              </label>
              <select
                aria-label="IELTS or Without IELTS Filter"
                value={ieltsFilter}
                onChange={(e) => setIeltsFilter(e.target.value as IeltsFilter)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91] cursor-pointer"
              >
                <option value="all">All Universities (IELTS &amp; Without IELTS)</option>
                <option value="without-ielts">✅ Without IELTS (MOI / Class 12 English / Duolingo)</option>
                <option value="with-ielts">📝 IELTS Required Only</option>
              </select>
            </div>
          </div>

          {/* Segmented IELTS / Without IELTS Quick Toggle Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIeltsFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  ieltsFilter === 'all'
                    ? 'bg-[#0B3D91] text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All 5 Universities
              </button>
              <button
                type="button"
                onClick={() => setIeltsFilter('without-ielts')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  ieltsFilter === 'without-ielts'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                ✓ Without IELTS (MOI / Duolingo Accepted)
              </button>
              <button
                type="button"
                onClick={() => setIeltsFilter('with-ielts')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  ieltsFilter === 'with-ielts'
                    ? 'bg-[#0B3D91] text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Standard IELTS Required
              </button>
            </div>

            <div className="text-xs font-bold text-slate-500">
              Showing {universities.length} verified universities for <strong>{selectedCountry} ({selectedCourse})</strong>
            </div>
          </div>
        </div>

        {/* 5 Universities List / Table */}
        <div className="space-y-4">
          {universities.map((uni, idx) => {
            const matchesBudget = uni.budgetTier.includes(selectedBudget);
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-[#0B3D91] transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black bg-[#0B3D91] text-white px-2.5 py-0.5 rounded-full">
                        #{idx + 1} in {selectedCountry}
                      </span>
                      {uni.withoutIeltsAllowed ? (
                        <span className="text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                          ✓ Without IELTS / MOI Accepted
                        </span>
                      ) : (
                        <span className="text-xs font-bold bg-blue-50 text-[#0B3D91] px-2.5 py-0.5 rounded-full">
                          IELTS Required
                        </span>
                      )}
                      {matchesBudget && (
                        <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                          Fits Rs {selectedBudget} Budget Track
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-slate-900">{uni.name}</h3>
                    <p className="text-xs font-semibold text-slate-500">
                      📍 {uni.city}, {uni.country} • {selectedCourse} Programme • Visa: {uni.visaSubclassName}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('/sop-generator')}
                      className="py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Generate SOP for {uni.name.split(' ')[0]} →
                    </button>
                    <a
                      href={uni.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 bg-[#0B3D91] hover:bg-[#0B2A5B] text-white font-black text-xs rounded-xl transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Official Admissions →</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-extrabold uppercase text-slate-500 text-[11px]">
                      Annual Tuition Fee ({selectedCourse})
                    </div>
                    <div className="font-black text-sm text-slate-900 mt-1 tabular-nums">
                      {uni.tuitionAnnualDisplay}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-extrabold uppercase text-slate-500 text-[11px]">
                      IELTS / English Requirement
                    </div>
                    <div className="font-bold text-slate-800 mt-1">{uni.ieltsRequirement}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div className="font-extrabold uppercase text-emerald-800 text-[11px]">
                      Post-Study Work Visa
                    </div>
                    <div className="font-black text-emerald-950 mt-1">{uni.postStudyWorkVisa}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                    <div className="font-extrabold uppercase text-amber-900 text-[11px]">
                      Scholarship &amp; Funding
                    </div>
                    <div className="font-bold text-amber-950 mt-1">{uni.scholarshipNote}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free Student Visa Tools Banner */}
        <div className="bg-gradient-to-r from-[#0B2A5B] to-[#0B3D91] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-3 py-1 rounded-full">
              100% Free Student Visa Toolkit
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Need an 800-Word SOP or Student Visa Financial Proof Calculation?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl">
              Generate your university-specific Statement of Purpose (SOP) PDF in 30 seconds or check the exact blocked account / GIC / 28-day bank statement balance required.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/sop-generator')}
              className="py-3 px-5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-sm cursor-pointer"
            >
              🎓 Open Free SOP Generator →
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/bank-statement-guide')}
              className="py-3 px-5 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
            >
              🏦 Student Bank Balance Guide →
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">
              Frequently Asked Questions (Student Visa + University Finder)
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
        <EmailSubscribeBox pageContext="Student Visa + University Finder" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
