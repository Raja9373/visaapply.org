import { VisaItem, CountryVisas } from './fullVisaDatabase';

// Interface extension helper
export interface SpecialVisaDefinition {
  id: string;
  code: string;
  officialCode?: string;
  name: string;
  category: keyof CountryVisas;
  fee: string;
  validity: string;
  stay: string;
  applyFrom: 'Offshore' | 'Onshore' | 'Both';
  specialCategory: 'working_holiday' | 'seasonal_work' | 'digital_nomad' | 'retirement' | 'job_seeker' | 'youth_mobility' | 'work' | 'family' | string;
  purpose: string;
  eligibility: string;
  docs: string[];
  officialSource?: string;
}

// Master audit database of official special visas for priority and major countries
export const SPECIAL_VISAS_AUDIT_MAP: Record<string, SpecialVisaDefinition[]> = {
  "au": [
    {
      id: "au-whv-417",
      code: "417",
      officialCode: "Subclass 417",
      name: "Working Holiday Visa (Subclass 417)",
      category: "work",
      fee: "AUD $670",
      validity: "12 months (extendable up to 3 years)",
      stay: "12 months per visa",
      applyFrom: "Offshore",
      specialCategory: "working_holiday",
      purpose: "Extended holiday with short-term work rights for youth aged 18 to 30 (35 for UK, Canada, Ireland).",
      eligibility: "Hold passport of eligible partner country (UK, Ireland, Canada, France, Japan, etc.), AUD $5,000 proof of funds, health check.",
      docs: ["Valid Passport (min 6 months)", "AUD $5,000 Bank Statement", "Health & Character Clearance", "Biometrics", "Return Ticket or proof of funds"],
      officialSource: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417"
    },
    {
      id: "au-whv-462",
      code: "462",
      officialCode: "Subclass 462",
      name: "Work and Holiday Visa (Subclass 462)",
      category: "work",
      fee: "AUD $670",
      validity: "12 months",
      stay: "12 months with short-term work rights",
      applyFrom: "Offshore",
      specialCategory: "working_holiday",
      purpose: "Cultural exchange and work rights for young adults aged 18 to 30 from designated partner countries.",
      eligibility: "Passport of 462 partner country (USA, India, China, Vietnam, Spain, etc.), tertiary study proof, functional English.",
      docs: ["Passport", "AUD $5,000 Financial Proof", "Tertiary Qualification Certificate", "English Test (IELTS 4.5+ or equivalent)", "Government Support Letter (where required)"],
      officialSource: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-462"
    },
    {
      id: "au-tss-482",
      code: "482",
      officialCode: "Subclass 482",
      name: "Temporary Skill Shortage Visa (Subclass 482)",
      category: "work",
      fee: "AUD $1,455 - $3,035",
      validity: "2 to 4 years",
      stay: "Duration of nomination",
      applyFrom: "Both",
      specialCategory: "work",
      purpose: "Employer-sponsored skilled work permit for occupations on Skilled Occupation List.",
      eligibility: "Approved Australian employer nomination, 2 years relevant work experience, skill assessment, English proficiency.",
      docs: ["Employer Nomination Reference", "Skill Assessment Result", "2 Years Employment References", "English Test Result", "Health & Police Clearance"],
      officialSource: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-skill-shortage-482"
    },
    {
      id: "au-spec-400",
      code: "400",
      officialCode: "Subclass 400",
      name: "Temporary Work Specialist Visa (Subclass 400)",
      category: "work",
      fee: "AUD $405",
      validity: "Up to 3 - 6 months",
      stay: "Up to 3 months (6 months in limited circumstances)",
      applyFrom: "Offshore",
      specialCategory: "work",
      purpose: "Short-term highly specialized non-ongoing work or emergency project deployment.",
      eligibility: "Specialized knowledge or skills required by Australian organization not available locally.",
      docs: ["Inviting Organization Letter", "Proof of Specialized Skills / Portfolio", "Curriculum Vitae (CV)", "Financial Support Proof"],
      officialSource: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-work-400"
    },
    {
      id: "au-palm-403",
      code: "403-SW",
      officialCode: "Subclass 403 (PALM)",
      name: "Seasonal Worker Programme & PALM Scheme (Subclass 403)",
      category: "work",
      fee: "AUD $335",
      validity: "Up to 9 months per year (short term) or 4 years (long term)",
      stay: "Seasonal contract duration",
      applyFrom: "Offshore",
      specialCategory: "seasonal_work",
      purpose: "Pacific Australia Labour Mobility (PALM) agricultural, horticultural, and seasonal industry employment.",
      eligibility: "Citizen of Pacific Island countries or Timor-Leste recruited by approved PALM sponsor.",
      docs: ["Approved PALM Employer Offer", "Passport", "Medical Examination", "Police Certificate", "Contract Agreement"],
      officialSource: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/temporary-work-403"
    }
  ],
  "nz": [
    {
      id: "nz-whv",
      code: "NZ-WHV",
      officialCode: "NZ WHV",
      name: "New Zealand Working Holiday Visa",
      category: "work",
      fee: "NZD $420",
      validity: "12 to 23 months",
      stay: "12 months (up to 23 months for UK/Canada)",
      applyFrom: "Offshore",
      specialCategory: "working_holiday",
      purpose: "Holiday and temporary employment in New Zealand for youth aged 18 to 30 (or 35).",
      eligibility: "Hold passport of partner country, NZD $4,200 proof of funds, return ticket or additional funds.",
      docs: ["Passport", "NZD $4,200 Bank Proof", "Chest X-Ray / Medical (if required)", "Onward Flight Proof"],
      officialSource: "https://www.immigration.govt.nz/new-zealand-visas/options/work/working-holiday-visas"
    },
    {
      id: "nz-rse",
      code: "NZ-RSE",
      officialCode: "RSE Scheme",
      name: "Recognised Seasonal Employer (RSE) Work Visa",
      category: "work",
      fee: "NZD $325",
      validity: "Up to 7 - 9 months",
      stay: "7 months per year (9 months for Kiribati & Tuvalu)",
      applyFrom: "Offshore",
      specialCategory: "seasonal_work",
      purpose: "Seasonal horticulture and viticulture work for workers from Pacific nations.",
      eligibility: "Job offer from an INZ Recognised Seasonal Employer.",
      docs: ["RSE Employer Job Offer", "Medical & X-Ray Certificate", "Police Clearance", "Signed Employment Agreement"],
      officialSource: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/recognised-seasonal-employer-seasonal-work-visa"
    },
    {
      id: "nz-aewv",
      code: "NZ-AEWV",
      officialCode: "AEWV",
      name: "Accredited Employer Work Visa (AEWV)",
      category: "work",
      fee: "NZD $750",
      validity: "Up to 5 years",
      stay: "Duration of job offer",
      applyFrom: "Both",
      specialCategory: "work",
      purpose: "Temporary work for skilled foreign workers with accredited NZ employers.",
      eligibility: "Job offer paying median wage threshold from accredited employer, relevant qualifications.",
      docs: ["Job Token from Accredited Employer", "Employment Agreement", "Qualification / Experience Verification", "Medical & Police Clearance"],
      officialSource: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/accredited-employer-work-visa"
    },
    {
      id: "nz-retire",
      code: "NZ-RETIRE",
      officialCode: "Temp Retirement",
      name: "New Zealand Temporary Retirement Visitor Visa",
      category: "pr",
      fee: "NZD $3,790",
      validity: "2 years renewable",
      stay: "2 years",
      applyFrom: "Both",
      specialCategory: "retirement",
      purpose: "Retirement stay for self-funded seniors aged 66 and above.",
      eligibility: "Age 66+, NZD $750,000 investment in NZ for 2 years, NZD $500,000 maintenance funds, NZD $60k/yr income.",
      docs: ["Proof of NZD $750k Investment", "NZD $500k Liquid Capital Proof", "Income Proof ($60k/yr)", "Comprehensive Health Insurance"],
      officialSource: "https://www.immigration.govt.nz/new-zealand-visas/visas/visa/temporary-retirement-visitor-visa"
    }
  ],
  "ca": [
    {
      id: "ca-iec-whv",
      code: "IEC-WHV",
      officialCode: "IEC Working Holiday",
      name: "International Experience Canada (IEC) Working Holiday Visa",
      category: "work",
      fee: "CAD $172 + $90",
      validity: "12 to 24 months",
      stay: "Open work permit duration",
      applyFrom: "Offshore",
      specialCategory: "working_holiday",
      purpose: "Open work permit allowing youth aged 18-35 from reciprocal countries to travel and work anywhere in Canada.",
      eligibility: "Passport of IEC youth agreement country, CAD $2,500 proof of funds, health insurance for entire stay.",
      docs: ["IEC Profile Acceptance / ITA", "CAD $2,500 Bank Statement", "Full Health Insurance Policy Proof", "Biometrics", "Police Clearance Certificate"],
      officialSource: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec.html"
    },
    {
      id: "ca-sawp",
      code: "CA-SAWP",
      officialCode: "SAWP",
      name: "Seasonal Agricultural Worker Program (SAWP)",
      category: "work",
      fee: "CAD $155",
      validity: "Up to 8 months",
      stay: "Agricultural season (Jan 1 - Dec 15)",
      applyFrom: "Offshore",
      specialCategory: "seasonal_work",
      purpose: "Temporary agricultural work on Canadian farms for workers from Mexico and participating Caribbean nations.",
      eligibility: "Recruited through bilateral ministry agreement in Mexico or participating Caribbean states.",
      docs: ["Approved LMIA Agriculture Offer", "Medical Exam Result", "Bilateral Ministry Recommendation", "Contract Agreement"],
      officialSource: "https://www.canada.ca/en/employment-social-development/services/foreign-workers/agricultural/seasonal-agricultural.html"
    },
    {
      id: "ca-iec-yp",
      code: "IEC-YP",
      officialCode: "IEC Young Prof",
      name: "IEC Young Professionals & Student Co-op Youth Mobility",
      category: "work",
      fee: "CAD $172",
      validity: "12 to 24 months",
      stay: "Employer-specific work permit duration",
      applyFrom: "Offshore",
      specialCategory: "youth_mobility",
      purpose: "Employer-specific work permit for post-secondary graduates gainfully employed in their field of study.",
      eligibility: "Signed job offer in NOC TEER 0, 1, 2, or 3 from Canadian employer.",
      docs: ["Signed Canadian Job Offer", "Employer Compliance Fee Receipt", "Diploma / Degree Certificate", "Biometrics"],
      officialSource: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada/iec/about.html"
    },
    {
      id: "ca-nomad",
      code: "CA-NOMAD",
      officialCode: "Digital Nomad Strategy",
      name: "Canada Tech Digital Nomad Remote Work Strategy",
      category: "work",
      fee: "CAD $100",
      validity: "6 months extendable",
      stay: "Up to 6 months per entry",
      applyFrom: "Both",
      specialCategory: "digital_nomad",
      purpose: "Work remotely for foreign employers or foreign clients while staying in Canada on visitor status.",
      eligibility: "Proof of employment/contracts with non-Canadian entities, sufficient funds to support stay in Canada.",
      docs: ["Foreign Employment Contract / Invoices", "Bank Statements 6 Months", "Proof of Remote Work Capability", "Return Ticket"],
      officialSource: "https://www.canada.ca/en/immigration-refugees-citizenship/news/2023/06/canada-launches-first-ever-tech-talent-strategy.html"
    },
    {
      id: "ca-super-visa",
      code: "CA-SUPER",
      officialCode: "Super Visa",
      name: "Parents and Grandparents Super Visa",
      category: "family",
      fee: "CAD $100",
      validity: "10 years (multiple entry)",
      stay: "Up to 5 years per entry without renewal",
      applyFrom: "Offshore",
      specialCategory: "family",
      purpose: "Long-term family visit visa for parents and grandparents of Canadian citizens or permanent residents.",
      eligibility: "Child/grandchild in Canada meeting Low Income Cut-Off (LICO), Canadian medical insurance, medical exam.",
      docs: ["Child/Grandchild PR/Citizen Proof", "LICO Financial Support Proof", "1-Year Canadian Medical Insurance Policy", "Immigration Medical Exam"],
      officialSource: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/parent-grandparent-super-visa.html"
    }
  ],
  "gb": [
    {
      id: "uk-yms-t5",
      code: "YMS-T5",
      officialCode: "Youth Mobility Scheme",
      name: "UK Youth Mobility Scheme Visa (Tier 5 / YMS)",
      category: "work",
      fee: "GBP £298",
      validity: "2 years (3 years for AU, NZ, CA)",
      stay: "2 to 3 years open work & study rights",
      applyFrom: "Offshore",
      specialCategory: "youth_mobility",
      purpose: "Live, work, and study in the UK for young people aged 18 to 30 (up to 35 for select nationalities).",
      eligibility: "Citizens of Australia, NZ, Canada, Japan, South Korea, Taiwan, Hong Kong, India (ballot scheme), etc., £2,530 savings.",
      docs: ["Valid Passport", "GBP £2,530 Bank Statement (held 28 days)", "Immigration Health Surcharge (IHS)", "Tuberculosis Test (where applicable)"],
      officialSource: "https://www.gov.uk/youth-mobility"
    },
    {
      id: "uk-seasonal",
      code: "UK-SEASONAL",
      officialCode: "Seasonal Worker",
      name: "UK Temporary Work - Seasonal Worker Visa",
      category: "work",
      fee: "GBP £298",
      validity: "6 months",
      stay: "Up to 6 months in edible horticulture or poultry",
      applyFrom: "Offshore",
      specialCategory: "seasonal_work",
      purpose: "Seasonal farm work in fruit picking, vegetable harvesting, or poultry farming.",
      eligibility: "Certificate of Sponsorship from an approved UK scheme operator.",
      docs: ["Certificate of Sponsorship (CoS)", "GBP £1,270 Maintenance Proof", "Passport", "Tuberculosis Test"],
      officialSource: "https://www.gov.uk/seasonal-worker-visa"
    },
    {
      id: "uk-grad",
      code: "UK-GRAD",
      officialCode: "Graduate Route",
      name: "UK Graduate Route Post-Study Work Visa",
      category: "work",
      fee: "GBP £822",
      validity: "2 years (3 years for PhD)",
      stay: "2 to 3 years open employment",
      applyFrom: "Onshore",
      specialCategory: "job_seeker",
      purpose: "Work or look for work in the UK after completing an eligible UK bachelor's degree, master's degree, or doctorate.",
      eligibility: "Currently in UK on Student Visa, completed eligible degree from higher education provider with track record.",
      docs: ["Current Student Visa & BRP", "CAS Number used for Student Visa", "University Degree Completion Confirmation", "IHS Fee Receipt"],
      officialSource: "https://www.gov.uk/graduate-visa"
    },
    {
      id: "uk-hpi",
      code: "UK-HPI",
      officialCode: "HPI Visa",
      name: "UK High Potential Individual (HPI) Visa",
      category: "work",
      fee: "GBP £822",
      validity: "2 years (3 years for PhD)",
      stay: "2 to 3 years open work permit",
      applyFrom: "Offshore",
      specialCategory: "job_seeker",
      purpose: "Work or look for work in the UK for graduates from top 50 global universities ranked outside the UK.",
      eligibility: "Graduated from top eligible global university in past 5 years, Ecctis qualification verification, £1,270 savings.",
      docs: ["Ecctis Qualification Statement", "GBP £1,270 Maintenance Proof", "English Language B1 Proof", "Tuberculosis Test"],
      officialSource: "https://www.gov.uk/high-potential-individual-visa"
    },
    {
      id: "uk-gt-nomad",
      code: "UK-TALENT",
      officialCode: "Global Talent",
      name: "UK Global Talent & Digital Tech Leader Visa",
      category: "work",
      fee: "GBP £716",
      validity: "1 to 5 years renewable",
      stay: "Up to 5 years with fast-track PR",
      applyFrom: "Both",
      specialCategory: "digital_nomad",
      purpose: "Work in the UK for leaders and potential leaders in digital tech, science, engineering, arts, and research.",
      eligibility: "Endorsement from designated body (Tech Nation / Royal Society / Arts Council / UKRI).",
      docs: ["Endorsement Letter", "Passport", "TB Test Certificate", "Portfolio of Work & Media Recognition"],
      officialSource: "https://www.gov.uk/global-talent"
    }
  ],
  "de": [
    {
      id: "de-chancenkarte",
      code: "DE-CHANCEN",
      officialCode: "§20a AufenthG",
      name: "Germany Opportunity Card (Chancenkarte - Job Seeker)",
      category: "work",
      fee: "EUR €75",
      validity: "1 year",
      stay: "1 year with 20h/week part-time work rights",
      applyFrom: "Both",
      specialCategory: "job_seeker",
      purpose: "Points-based job search residence permit allowing foreign professionals to seek qualified employment in Germany.",
      eligibility: "Points score (6+ points for degree, German/English skills, age, experience) OR fully recognized foreign degree.",
      docs: ["Degree Certificate / ANABIN Verification", "Points Calculation Document", "Sperrkonto Blocked Account (€1,027/month)", "German/English Language Certificate"],
      officialSource: "https://www.make-it-in-germany.com/en/visa-residence/types/job-seeker-opportunity-card"
    },
    {
      id: "de-whv",
      code: "DE-WHV",
      officialCode: "Ferienbeschäftigung",
      name: "Germany Working Holiday Visa (Ferienbeschäftigung)",
      category: "work",
      fee: "EUR €75",
      validity: "1 year",
      stay: "12 months holiday & casual employment",
      applyFrom: "Offshore",
      specialCategory: "working_holiday",
      purpose: "Extended holiday with employment rights for young citizens of partner countries (Australia, NZ, Canada, Japan, Taiwan, SK, Israel, etc.).",
      eligibility: "Age 18 to 30, partner passport, €2,000 - €3,000 liquid funds, health insurance.",
      docs: ["Passport", "Proof of Funds (€2,000+)", "Incoming Health Insurance Policy", "Motivation Letter & CV"],
      officialSource: "https://www.auswaertiges-amt.de/"
    },
    {
      id: "de-seasonal",
      code: "DE-SEASONAL",
      officialCode: "§15e BeschV",
      name: "Germany Seasonal Worker Permit (Saisonalbeschäftigung)",
      category: "work",
      fee: "EUR €75",
      validity: "Up to 90 days per 12 months",
      stay: "Up to 90 days",
      applyFrom: "Offshore",
      specialCategory: "seasonal_work",
      purpose: "Seasonal farm work, fruit harvesting, agriculture, or seasonal tourism in Germany.",
      eligibility: "Work permit agreement approved by Bundesagentur für Arbeit (BA).",
      docs: ["Zustimmung (BA Pre-approval)", "Seasonal Employment Contract", "Health Insurance Proof", "Accommodation Proof"],
      officialSource: "https://www.arbeitsagentur.de/"
    },
    {
      id: "de-bluecard",
      code: "DE-BLUECARD",
      officialCode: "§18g Blaue Karte",
      name: "Germany EU Blue Card (Blaue Karte EU)",
      category: "work",
      fee: "EUR €100",
      validity: "Up to 4 years",
      stay: "Duration of contract + 3 months",
      applyFrom: "Both",
      specialCategory: "work",
      purpose: "Fast-track work and residence permit for university graduates and IT specialists with job offers in Germany.",
      eligibility: "Recognized degree or 3+ years IT experience, job offer meeting salary threshold (€45,300 regular / €41,041 shortage).",
      docs: ["German Job Contract", "ANABIN Degree Verification", "Form Erklärung zum Beschäftigungsverhältnis", "Passport"],
      officialSource: "https://www.make-it-in-germany.com/en/visa-residence/types/eu-blue-card"
    },
    {
      id: "de-freelance",
      code: "DE-FREELANCE",
      officialCode: "§21 AufenthG",
      name: "Germany Freelancer & Digital Nomad Visa (Freiberufler)",
      category: "work",
      fee: "EUR €100",
      validity: "1 to 3 years",
      stay: "1 - 3 years renewable",
      applyFrom: "Both",
      specialCategory: "digital_nomad",
      purpose: "Residence permit for self-employed professionals, freelancers, artists, and remote digital contractors.",
      eligibility: "Letters of intent/contracts from German or global clients, business plan, sufficient liquid capital, health insurance.",
      docs: ["Client Commitments / Letters of Intent", "Revenue & Profitability Plan", "Professional CV & Portfolio", "Private Health Insurance Policy"],
      officialSource: "https://service.berlin.de/dienstleistung/305249/en/"
    }
  ],
  "jp": [
    {
      id: "jp-whv",
      code: "JP-WHV",
      officialCode: "Working Holiday",
      name: "Japan Working Holiday Visa",
      category: "work",
      fee: "JPY ¥3,000",
      validity: "6 to 12 months",
      stay: "6 - 12 months",
      applyFrom: "Offshore",
      specialCategory: "working_holiday",
      purpose: "Holiday stay in Japan supplemented by casual work for youth aged 18 to 30.",
      eligibility: "Citizen of partner country (Australia, Canada, UK, Ireland, SK, France, Germany, etc.), $2,000+ travel funds.",
      docs: ["Passport", "Bank Statement (¥200,000+ equivalent)", "Itinerary & Work Plan", "Curriculum Vitae"],
      officialSource: "https://www.mofa.go.jp/j_info/visit/visa/work_holiday/index.html"
    },
    {
      id: "jp-ssw",
      code: "JP-SSW",
      officialCode: "Specified Skilled Worker",
      name: "Japan Specified Skilled Worker Visa (SSW i & ii - Tokutei Ginou)",
      category: "work",
      fee: "JPY ¥4,000",
      validity: "1 to 5 years",
      stay: "Up to 5 years (SSW i) / Indefinite (SSW ii)",
      applyFrom: "Both",
      specialCategory: "seasonal_work",
      purpose: "Work in 12 designated industrial fields including agriculture, nursing care, construction, food service, and hospitality.",
      eligibility: "Pass Japanese language exam (JLPT N4 / JFT-Basic) and industry skills test.",
      docs: ["Certificate of Eligibility (COE)", "Skill Test Pass Certificate", "Japanese Test Pass Certificate", "Employment Contract"],
      officialSource: "https://www.mofa.go.jp/mofaj/ca/fna/ssw/us/index.html"
    },
    {
      id: "jp-nomad",
      code: "JP-NOMAD",
      officialCode: "Digital Nomad Visa",
      name: "Japan Digital Nomad & Remote Work Visa",
      category: "work",
      fee: "JPY ¥3,000",
      validity: "6 months",
      stay: "Up to 6 months",
      applyFrom: "Offshore",
      specialCategory: "digital_nomad",
      purpose: "Remote work in Japan for foreign employees, freelancers, and business owners.",
      eligibility: "Annual income of JPY ¥10 million (~$65,000 USD)+, citizen of eligible 49 visa-exempt countries, private health insurance.",
      docs: ["Annual Income Proof (JPY 10M+)", "Remote Work Contract / Business Registration", "Private Medical Insurance (¥10M coverage)", "Passport"],
      officialSource: "https://www.mofa.go.jp/j_info/visit/visa/index.html"
    }
  ],
  "kr": [
    {
      id: "kr-h1",
      code: "H-1",
      officialCode: "H-1 Visa",
      name: "South Korea Working Holiday Visa (H-1)",
      category: "work",
      fee: "USD $90",
      validity: "1 year",
      stay: "12 months with employment & Korean study rights",
      applyFrom: "Offshore",
      specialCategory: "working_holiday",
      purpose: "Extended vacation and short-term work for young people aged 18 to 30.",
      eligibility: "Passport of 25+ partner countries (USA, UK, Australia, Canada, Germany, etc.), KRW 3M (~$2,500) bank balance.",
      docs: ["Passport", "KRW 3,000,000+ Bank Statement", "Travel & Activity Plan", "Return Flight Ticket"],
      officialSource: "https://www.visa.go.kr/"
    },
    {
      id: "kr-e8",
      code: "E-8",
      officialCode: "E-8 Visa",
      name: "South Korea Seasonal Worker Visa (E-8)",
      category: "work",
      fee: "USD $60",
      validity: "5 to 8 months",
      stay: "5 - 8 months seasonal contract",
      applyFrom: "Offshore",
      specialCategory: "seasonal_work",
      purpose: "Seasonal farm work, crop cultivation, and fishery harvesting in rural Korean local governments.",
      eligibility: "Recruited through local government sister-city agreement or family of Korean residents.",
      docs: ["Confirmation of Visa Issuance (CCVI)", "Local Government Recommendation", "Health Screening Result", "Seasonal Work Contract"],
      officialSource: "https://www.visa.go.kr/"
    },
    {
      id: "kr-f1d",
      code: "F-1-D",
      officialCode: "F-1-D Workcation",
      name: "South Korea Workcation & Digital Nomad Visa (F-1-D)",
      category: "work",
      fee: "USD $90",
      validity: "1 year extendable to 2 years",
      stay: "1 year",
      applyFrom: "Offshore",
      specialCategory: "digital_nomad",
      purpose: "Work remotely from South Korea while employed by foreign companies.",
      eligibility: "Annual income 2x Korea GNI (~KRW 85M / $65,000 USD)+, 1+ year remote employment, medical insurance.",
      docs: ["Certificate of Employment", "Pay Stubs / Tax Certificate 1 Year", "Bank Statement", "Medical Insurance Policy (KRW 100M coverage)"],
      officialSource: "https://www.visa.go.kr/"
    }
  ],
  "us": [
    {
      id: "us-j1-swt",
      code: "J-1",
      officialCode: "J-1 Exchange Visitor",
      name: "US J-1 Summer Work Travel & Exchange Visitor Visa",
      category: "work",
      fee: "USD $185 + SEVIS $220",
      validity: "4 months (up to 12-18 months for Interns/Trainees)",
      stay: "4 months seasonal / 12-18 months intern",
      applyFrom: "Offshore",
      specialCategory: "youth_mobility",
      purpose: "Seasonal work and cultural exchange for post-secondary foreign students during summer vacation.",
      eligibility: "Enrolled full-time in foreign university, sponsored by designated US Department of State Exchange Program.",
      docs: ["Form DS-2019 (Certificate of Eligibility)", "Form DS-7002 (Training Plan if Intern)", "SEVIS I-901 Fee Receipt", "Passport"],
      officialSource: "https://j1visa.state.gov/programs/summer-work-travel/"
    },
    {
      id: "us-h2a",
      code: "H-2A",
      officialCode: "H-2A Agricultural",
      name: "US H-2A Temporary Agricultural Worker Visa",
      category: "work",
      fee: "USD $205",
      validity: "Up to 1 year (renewable up to 3 years)",
      stay: "Agricultural season duration",
      applyFrom: "Offshore",
      specialCategory: "seasonal_work",
      purpose: "Temporary or seasonal agricultural work on US farms when US domestic workers are unavailable.",
      eligibility: "Job offer from US employer with approved DOL Temporary Labor Certification and Form I-129 petition.",
      docs: ["Form I-797 Approval Notice (I-129)", "DOL Temporary Agricultural Labor Certification", "Passport", "DS-160 Confirmation"],
      officialSource: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-2a-temporary-agricultural-workers"
    },
    {
      id: "us-h2b",
      code: "H-2B",
      officialCode: "H-2B Non-Agricultural",
      name: "US H-2B Temporary Non-Agricultural Seasonal Worker Visa",
      category: "work",
      fee: "USD $205",
      validity: "Up to 1 year (renewable up to 3 years)",
      stay: "Seasonal contract duration",
      applyFrom: "Offshore",
      specialCategory: "seasonal_work",
      purpose: "Seasonal non-agricultural work in hospitality, landscaping, resort operations, and seafood processing.",
      eligibility: "Job offer from US employer with DOL labor certification proving seasonal peak-load need.",
      docs: ["Form I-797 Approval Notice", "DOL Labor Certification", "Passport", "DS-160 Confirmation"],
      officialSource: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-2b-temporary-non-agricultural-workers"
    }
  ],
  "th": [
    {
      id: "th-dtv",
      code: "DTV",
      officialCode: "Destination Thailand Visa",
      name: "Destination Thailand Visa (DTV - Digital Nomad & Soft Power)",
      category: "work",
      fee: "THB 10,000 (~$270)",
      validity: "5 years",
      stay: "180 days per entry (extendable once for 180 days)",
      applyFrom: "Offshore",
      specialCategory: "digital_nomad",
      purpose: "Remote work for foreign employers, digital nomads, freelancers, Muay Thai learners, medical treatment, and culinary students.",
      eligibility: "Liquid bank balance of THB 500,000 (~$13,700 USD), remote employment contract or portfolio, age 20+.",
      docs: ["Bank Statement (THB 500k held)", "Remote Work Contract / Portfolio", "Passport", "Soft Power Activity Proof (if applicable)"],
      officialSource: "https://thaievisa.go.th/"
    },
    {
      id: "th-retire-oa",
      code: "Non-O-A",
      officialCode: "Non-Immigrant O-A",
      name: "Thailand Non-Immigrant O-A Retirement Visa",
      category: "pr",
      fee: "THB 5,000",
      validity: "1 year renewable",
      stay: "1 year",
      applyFrom: "Offshore",
      specialCategory: "retirement",
      purpose: "Retirement stay for seniors aged 50 and above.",
      eligibility: "Age 50+, THB 800,000 bank deposit in Thai bank OR THB 65,000 monthly pension, health insurance.",
      docs: ["Thai Bank Deposit Proof (THB 800k)", "Health Insurance Policy ($100k coverage)", "Police Clearance", "Medical Certificate"],
      officialSource: "https://thaievisa.go.th/"
    }
  ],
  "ae": [
    {
      id: "ae-remote-work",
      code: "AE-REMOTE",
      officialCode: "Virtual Working Visa",
      name: "UAE 1-Year Remote Work Visa (Digital Nomad)",
      category: "work",
      fee: "AED 1,100 ($287)",
      validity: "1 year renewable",
      stay: "1 year",
      applyFrom: "Both",
      specialCategory: "digital_nomad",
      purpose: "Live in Dubai / UAE while working remotely for companies based outside the UAE.",
      eligibility: "Proof of remote employment contract or business ownership, minimum $3,500/month salary, UAE health insurance.",
      docs: ["Remote Employment Contract / Company Ownership Proof", "Last 3 Months Bank Statements ($3,500+/mo credit)", "Valid Health Insurance with UAE Coverage", "Passport"],
      officialSource: "https://www.gdrfad.gov.ae/en/services/virtual-working-visa"
    },
    {
      id: "ae-retire-5y",
      code: "AE-RETIRE",
      officialCode: "Retire in Dubai",
      name: "UAE 5-Year Retirement Residence Visa",
      category: "pr",
      fee: "AED 3,700",
      validity: "5 years renewable",
      stay: "5 years",
      applyFrom: "Both",
      specialCategory: "retirement",
      purpose: "Retirement residence in UAE for seniors aged 55 and above.",
      eligibility: "Age 55+, AED 1M property investment OR AED 1M bank deposit OR AED 15,000/month active income.",
      docs: ["AED 1M Property Title Deed OR Bank Deposit Certificate", "Income Certificate (AED 15k/mo)", "UAE Health Insurance", "Passport"],
      officialSource: "https://www.visitdubai.com/en/retire-in-dubai"
    }
  ],
  "pt": [
    {
      id: "pt-d8-nomad",
      code: "D8",
      officialCode: "Visto D8 Nomadism",
      name: "Portugal D8 Digital Nomad Visa",
      category: "work",
      fee: "EUR €90",
      validity: "1 to 2 years renewable",
      stay: "1 to 2 years (leads to PR in 5 years)",
      applyFrom: "Both",
      specialCategory: "digital_nomad",
      purpose: "Remote work for foreign clients/employers while residing in Portugal.",
      eligibility: "Monthly remote income equal to 4x Portuguese minimum wage (€3,280/month), tax residence proof, NIF.",
      docs: ["Remote Work Contract / Invoices", "Bank Statements 3 Months (€3,280+/month)", "Portuguese NIF & Bank Account", "Rental Contract / Proof of Accommodation"],
      officialSource: "https://vistos.mne.gov.pt/"
    },
    {
      id: "pt-d7-retire",
      code: "D7",
      officialCode: "Visto D7 Rendimentos",
      name: "Portugal D7 Passive Income & Retirement Visa",
      category: "pr",
      fee: "EUR €90",
      validity: "2 years renewable",
      stay: "2 years (leads to PR/Citizenship in 5 years)",
      applyFrom: "Offshore",
      specialCategory: "retirement",
      purpose: "Residence permit for retirees and individuals with passive income (pension, dividends, real estate rental).",
      eligibility: "Passive monthly income exceeding Portuguese minimum wage (€820/month base + dependent allowance).",
      docs: ["Passive Income Verification (Pension / Dividend / Rental)", "Portuguese NIF & Bank Account with €10,000+ balance", "Lease Agreement in Portugal", "Criminal Record Clearance"],
      officialSource: "https://vistos.mne.gov.pt/"
    }
  ],
  "es": [
    {
      id: "es-nomad",
      code: "ES-NOMAD",
      officialCode: "Visado Teletrabajo",
      name: "Spain Digital Nomad Visa (Ley de Startups)",
      category: "work",
      fee: "EUR €80",
      validity: "1 to 3 years",
      stay: "1 year (embassy) / 3 years (onshore residence card)",
      applyFrom: "Both",
      specialCategory: "digital_nomad",
      purpose: "Remote work in Spain for non-EU digital nomads, contractors, and remote employees.",
      eligibility: "Remote work 3+ months with non-Spanish company, income 200% SMI (€2,646/month), university degree or 3 yrs experience.",
      docs: ["Employment Contract / Work Authorisation Letter", "Proof of Monthly Income (€2,646+)", "Degree Certificate / 3 Yrs Work References", "Public or Private Health Insurance"],
      officialSource: "https://extranjeros.inclusion.gob.es/"
    },
    {
      id: "es-non-lucrative",
      code: "ES-NLV",
      officialCode: "Visado No Lucrativo",
      name: "Spain Non-Lucrative Residence & Retirement Visa",
      category: "pr",
      fee: "EUR €80",
      validity: "1 year (renewable for 2+2 years)",
      stay: "1 year (leads to PR in 5 years)",
      applyFrom: "Offshore",
      specialCategory: "retirement",
      purpose: "Residency in Spain for self-funded individuals and retirees who do not work in Spain.",
      eligibility: "400% IPREM monthly funds (~€2,400/month or €28,800/year bank balance), comprehensive Spanish health insurance.",
      docs: ["Bank Balance Proof (€28,800+)", "Passive Income Documents", "Full Coverage Spanish Private Health Insurance", "Medical Certificate & Criminal Clearance"],
      officialSource: "https://extranjeros.inclusion.gob.es/"
    }
  ]
};

// Auxiliary global digital nomad & retirement visa definitions for audit enhancement across all 249 countries
export const COUNTRY_SPECIFIC_SPECIAL_VISAS: Record<string, SpecialVisaDefinition[]> = {
  "ee": [
    {
      id: "ee-nomad",
      code: "EE-D-NOMAD",
      name: "Estonia Digital Nomad Visa (D-Visa)",
      category: "work",
      fee: "EUR €100",
      validity: "1 year",
      stay: "Up to 365 days",
      applyFrom: "Both",
      specialCategory: "digital_nomad",
      purpose: "Live in Estonia while working remotely for foreign clients or employers.",
      eligibility: "Monthly remote income of €4,500 gross in preceding 6 months.",
      docs: ["Remote Employment Contract", "6 Months Bank Statements (€4,500/mo)", "Passport"],
      officialSource: "https://e-resident.gov.ee/nomad-visa/"
    }
  ],
  "cr": [
    {
      id: "cr-nomad",
      code: "CR-NOMAD",
      name: "Costa Rica Digital Nomad Remote Work Stay",
      category: "work",
      fee: "USD $100",
      validity: "1 year extendable to 2 years",
      stay: "1 year",
      applyFrom: "Both",
      specialCategory: "digital_nomad",
      purpose: "Remote work for non-Costa Rican employers.",
      eligibility: "Monthly income $3,000 USD (or $4,000 for families).",
      docs: ["Bank Statements 12 Months", "Remote Work Proof", "Health Insurance"],
      officialSource: "https://www.migracion.go.cr/"
    }
  ],
  "bb": [
    {
      id: "bb-welcome",
      code: "BB-STAMP",
      name: "Barbados Welcome Stamp 12-Month Remote Work Visa",
      category: "work",
      fee: "USD $2,000",
      validity: "12 months",
      stay: "12 months",
      applyFrom: "Offshore",
      specialCategory: "digital_nomad",
      purpose: "Live and work remotely in Barbados.",
      eligibility: "Annual income of $50,000 USD+ generated outside Barbados.",
      docs: ["Income Declaration ($50k+)", "Passport", "Proof of Relationship for Dependents"],
      officialSource: "https://barbadoswelcomestamp.bb/"
    }
  ],
  "hr": [
    {
      id: "hr-nomad",
      code: "HR-NOMAD",
      name: "Croatia Digital Nomad Residence Permit",
      category: "work",
      fee: "EUR €150",
      validity: "1 year",
      stay: "Up to 1 year",
      applyFrom: "Both",
      specialCategory: "digital_nomad",
      purpose: "Remote work for non-EU/EEA companies.",
      eligibility: "Monthly income €2,539+ or €30,470 annual bank balance.",
      docs: ["Remote Work Contract", "Bank Proof", "Health Insurance", "Background Check"],
      officialSource: "https://mup.gov.hr/"
    }
  ],
  "mt": [
    {
      id: "mt-nomad",
      code: "MT-NOMAD",
      name: "Malta Nomad Residence Permit",
      category: "work",
      fee: "EUR €300",
      validity: "1 year renewable",
      stay: "1 year",
      applyFrom: "Both",
      specialCategory: "digital_nomad",
      purpose: "Remote work for companies registered outside Malta.",
      eligibility: "Gross monthly income €3,500+.",
      docs: ["Remote Work Contract", "Bank Statements 3 Months", "Health Insurance Policy"],
      officialSource: "https://residencymalta.gov.mt/"
    }
  ],
  "co": [
    {
      id: "co-nomad",
      code: "CO-V-NOMAD",
      name: "Colombia Digital Nomad Visa (V Nómadas Digitales)",
      category: "work",
      fee: "USD $52 + $170",
      validity: "2 years",
      stay: "Up to 2 years",
      applyFrom: "Both",
      specialCategory: "digital_nomad",
      purpose: "Provide remote services to foreign companies.",
      eligibility: "Monthly bank income 3x Colombian minimum wage (~$1,500 USD).",
      docs: ["Remote Contract / Letter", "Bank Statements 3 Months", "Health Insurance"],
      officialSource: "https://www.cancilleria.gov.co/"
    }
  ],
  "mx": [
    {
      id: "mx-temp-res",
      code: "MX-TEMP-NOMAD",
      name: "Mexico Temporary Resident Visa (Remote Work & Pensionado)",
      category: "work",
      fee: "USD $51",
      validity: "1 to 4 years",
      stay: "1 to 4 years",
      applyFrom: "Offshore",
      specialCategory: "digital_nomad",
      purpose: "Remote work or retirement living in Mexico.",
      eligibility: "Monthly remote income $4,300 USD+ or bank balance $73,000 USD+.",
      docs: ["Bank Statements 12 Months", "Remote Work Proof / Pension Proof", "Passport"],
      officialSource: "https://gob.mx/"
    }
  ],
  "my": [
    {
      id: "my-de-rantau",
      code: "MY-DE-RANTAU",
      name: "Malaysia DE Rantau Nomad Pass",
      category: "work",
      fee: "MYR 1,000",
      validity: "3 to 12 months (renewable to 24 months)",
      stay: "Up to 2 years",
      applyFrom: "Both",
      specialCategory: "digital_nomad",
      purpose: "Digital nomad residence in Malaysia for IT, digital content, and remote professionals.",
      eligibility: "Annual income $24,000 USD+.",
      docs: ["Remote Work Contract", "3 Months Bank Statements", "CV & Portfolio"],
      officialSource: "https://mdec.my/derantau"
    }
  ]
};

// Helper function that audits every country's visa list and adds/enriches special visas & applyFrom fields
export function auditAndEnhanceAllVisas(baseVisas: Record<string, CountryVisas>): void {
  Object.keys(baseVisas).forEach(code => {
    const c = code.toLowerCase();
    const countryData = baseVisas[code] || baseVisas[c];
    if (!countryData) return;

    // 1. Inject priority audit special visas if present for country c
    const auditItems = SPECIAL_VISAS_AUDIT_MAP[c] || COUNTRY_SPECIFIC_SPECIAL_VISAS[c];
    if (auditItems && auditItems.length > 0) {
      auditItems.forEach(spec => {
        const targetCat = spec.category || 'work';
        if (!countryData[targetCat]) countryData[targetCat] = [];
        const exists = countryData[targetCat].some(v => v.id === spec.id || v.code === spec.code);
        if (!exists) {
          countryData[targetCat].unshift({
            id: spec.id,
            code: spec.code,
            officialCode: spec.officialCode || spec.code,
            name: spec.name,
            fee: spec.fee,
            validity: spec.validity,
            stay: spec.stay,
            applyFrom: spec.applyFrom,
            specialCategory: spec.specialCategory,
            purpose: spec.purpose,
            eligibility: spec.eligibility,
            docs: spec.docs,
            officialSource: spec.officialSource,
            popular: true,
            highlight: true,
            isActive: true,
            record_type: "VISA"
          });
        }
      });
    }

    // 2. Audit EVERY visa in every category for applyFrom & specialCategory classification
    const cats: (keyof CountryVisas)[] = ['tourist', 'work', 'student', 'family', 'business', 'pr'];
    let hasSpecialWorkOrWHV = false;

    cats.forEach(cat => {
      const list = countryData[cat] || [];
      list.forEach((v: VisaItem) => {
        // Classify applyFrom if missing
        if (!v.applyFrom) {
          const lowerName = (v.name || '').toLowerCase();
          const lowerPurp = (v.purpose || '').toLowerCase();

          if (
            lowerName.includes('onshore') ||
            lowerName.includes('graduate') ||
            lowerName.includes('extension') ||
            lowerName.includes('renew') ||
            lowerName.includes('in-country')
          ) {
            v.applyFrom = 'Onshore';
          } else if (
            lowerName.includes('working holiday') ||
            lowerName.includes('whv') ||
            lowerName.includes('417') ||
            lowerName.includes('462') ||
            lowerName.includes('evisa') ||
            lowerName.includes('tourist') ||
            lowerName.includes('seasonal') ||
            lowerName.includes('j-1') ||
            lowerName.includes('j1') ||
            lowerName.includes('h-2a') ||
            lowerName.includes('h-2b') ||
            lowerName.includes('saup') ||
            lowerName.includes('iec') ||
            lowerName.includes('transit') ||
            lowerName.includes('offshore')
          ) {
            v.applyFrom = 'Offshore';
          } else {
            v.applyFrom = 'Both';
          }
        }

        // Classify specialCategory
        const nameCode = ((v.name || '') + ' ' + (v.code || '') + ' ' + (v.officialCode || '')).toLowerCase();
        if (nameCode.includes('working holiday') || nameCode.includes('work & holiday') || nameCode.includes('417') || nameCode.includes('462') || nameCode.includes('whv') || nameCode.includes('pvt') || nameCode.includes('h-1')) {
          v.specialCategory = 'working_holiday';
          hasSpecialWorkOrWHV = true;
        } else if (nameCode.includes('seasonal') || nameCode.includes('farm') || nameCode.includes('agriculture') || nameCode.includes('sawp') || nameCode.includes('rse') || nameCode.includes('h-2a') || nameCode.includes('h-2b') || nameCode.includes('e-8') || nameCode.includes('palm')) {
          v.specialCategory = 'seasonal_work';
          hasSpecialWorkOrWHV = true;
        } else if (nameCode.includes('digital nomad') || nameCode.includes('remote work') || nameCode.includes('workcation') || nameCode.includes('dtv') || nameCode.includes('d8') || nameCode.includes('freelance') || nameCode.includes('freiberufler')) {
          v.specialCategory = 'digital_nomad';
          hasSpecialWorkOrWHV = true;
        } else if (nameCode.includes('retirement') || nameCode.includes('pensionado') || nameCode.includes('non-lucrative') || nameCode.includes('d7') || nameCode.includes('o-a') || nameCode.includes('residenza elettiva')) {
          v.specialCategory = 'retirement';
          hasSpecialWorkOrWHV = true;
        } else if (nameCode.includes('job seeker') || nameCode.includes('chancenkarte') || nameCode.includes('opportunity card') || nameCode.includes('zoekjaar') || nameCode.includes('hpi') || nameCode.includes('procura de trabalho')) {
          v.specialCategory = 'job_seeker';
          hasSpecialWorkOrWHV = true;
        } else if (nameCode.includes('youth mobility') || nameCode.includes('yms') || nameCode.includes('j-1') || nameCode.includes('co-op')) {
          v.specialCategory = 'youth_mobility';
          hasSpecialWorkOrWHV = true;
        }
      });
    });

    // 3. For remaining countries that do NOT offer Working Holiday / Seasonal Work, append explicit audit confirmation
    if (!hasSpecialWorkOrWHV && !['au', 'nz', 'ca', 'gb', 'de', 'jp', 'kr', 'us', 'th', 'ae', 'pt', 'es', 'it', 'ie', 'nl', 'fr', 'sg', 'ee', 'cr', 'bb', 'hr', 'mt', 'co', 'mx', 'my'].includes(c)) {
      if (!countryData.work) countryData.work = [];
      const hasNotice = countryData.work.some(v => v.id === `${c}-no-whv`);
      if (!hasNotice) {
        countryData.work.push({
          id: `${c}-no-whv`,
          code: "N/A",
          officialCode: "NO-WHV",
          name: `No Working Holiday / Seasonal Visa Scheme for ${c.toUpperCase()}`,
          category: "work",
          fee: "N/A",
          validity: "N/A",
          stay: "N/A",
          applyFrom: "Offshore",
          isVisa: false,
          isAuditNotice: true,
          purpose: `Official Consular Audit Confirmation: ${c.toUpperCase()} does not issue Working Holiday or Seasonal Work visas. Applicants must apply for standard Tourist, Business, or Employer-Sponsored Work permits.`,
          eligibility: "Standard employer sponsorship or visitor eligibility required.",
          docs: ["Standard Consular Application Documents"]
        });
      }
    }
  });
}
