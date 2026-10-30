import { AUSTRALIA_135_VISAS } from './australiaVisas';
import { USA_145_VISAS } from './usaVisas';
import { CANADA_102_VISAS } from './canadaVisas';
import { UK_111_VISAS } from './ukVisas';
import { UAE_135_VISAS } from './uaeVisas';
import { GERMANY_138_VISAS } from './germanyVisas';
import { SINGAPORE_109_VISAS } from './singaporeVisas';
import { THAILAND_113_VISAS } from './thailandVisas';
import { JAPAN_123_VISAS } from './japanVisas';
import { FRANCE_127_VISAS } from './franceVisas';
import { ITALY_130_VISAS } from './italyVisas';
import { SPAIN_130_VISAS } from './spainVisas';
import { INDIA_130_VISAS } from './indiaVisas';
import { SWITZERLAND_96_VISAS } from './switzerlandVisas';
import { NEW_ZEALAND_88_VISAS } from './newZealandVisas';
import { BRAZIL_72_VISAS } from './brazilVisas';
import { MEXICO_74_VISAS } from './mexicoVisas';
import { SOUTH_KOREA_94_VISAS } from './southKoreaVisas';

export interface VisaItem {
  id: string;
  name: string;
  code?: string;
  officialCode?: string;
  officialName?: string;
  categoryCode?: string;
  subcategoryCode?: string;
  shortName?: string;
  icon?: string;
  fee: string;
  validity?: string;
  stay?: string;
  processing?: string;
  purpose?: string;
  eligibility?: string;
  popular?: boolean;
  highlight?: boolean;
  isActive?: boolean;
  isLegacy?: boolean;
  officialSource?: string;
  fundsBox?: {
    minimum: string;
    bankMonths: string;
    suddenDeposit: string;
    example: string;
  };
  itrBox?: {
    years: string;
    match: string;
    noItr: string;
  };
  bankBox?: {
    months: string;
    regularCredit: string;
    fd: string;
    source: string;
  };
  docs?: string[];
  documents?: string[];
  infoReq?: string[];
  steps?: string[];
  tips?: string | string[];
  faq?: { q: string; a: string }[];
  name_ja?: string;
  docs_ja?: string[];
  purpose_ja?: string;
  regionalCategory?: string;
  categoryName?: string;
  regionalPathways?: {
    code: string;
    name: string;
    description: string;
    eligibilityDiff?: string;
    isCurrent: boolean;
  }[];
  damaPathways?: {
    code: string;
    name: string;
    description: string;
    isCurrent: boolean;
  }[];
  regionalAreas?: string[];
  regionalNote?: string;
  isVisa?: boolean;
  programmeCategory?: string;
  programmeNote?: string;
  record_type?:
    | 'VISA'
    | 'PERMIT'
    | 'TRAVEL_DOCUMENT'
    | 'IMMIGRATION_PROGRAM'
    | 'PROGRAM_STREAM'
    | 'WORK_PERMIT_PATHWAY'
    | 'EMPLOYER_DESIGNATION'
    | 'REGIONAL_LOCATION'
    | 'LEGACY_PROGRAM'
    | 'SPECIAL_MEASURE'
    | 'LEGAL_STATUS'
    | 'FORM'
    | 'RESIDENCE_PERMIT'
    | 'INVESTOR_VISA'
    | 'MAINLAND_VISA'
    | 'FAMILY_RESIDENCE'
    | 'TRANSIT_VISA'
    | string;
  isPaused?: boolean;
  intakeStatus?: 'Active' | 'Paused' | 'Closed' | 'Legacy' | 'Stream-dependent' | 'Measure-specific' | 'Historical';
  directoryGroup?:
    | 'Directory 1: Visa & Immigration Documents'
    | 'Directory 2: Immigration Programmes & Pathways'
    | 'Shared Supporting: Regional Communities'
    | 'Shared Supporting: IRCC Forms & Guides';
  lastVerifiedDate?: string;
  communityDetails?: {
    communityCode: string;
    province: string;
    officialBoundaryMapURL: string;
    municipalityEligibleArea: string;
    participatingPilot: string;
    designatedEmployerList: string;
    eligibleOccupations: string;
    status: string;
    lastVerifiedDate: string;
    dualPilotNote?: string;
  };
  irccReferenceLinks?: { id: number; title: string; url: string }[];
}

export interface CountryVisas {
  tourist: VisaItem[];
  work: VisaItem[];
  student: VisaItem[];
  family: VisaItem[];
  business: VisaItem[];
  pr: VisaItem[];
}

// Country Code to Name & Currency map
export const COUNTRY_INFO: Record<string, { name: string; currency: string; flag: string }> = {
  US: { name: "United States", currency: "USD ($)", flag: "🇺🇸" },
  CA: { name: "Canada", currency: "CAD ($)", flag: "🇨🇦" },
  GB: { name: "United Kingdom", currency: "GBP (£)", flag: "🇬🇧" },
  AU: { name: "Australia", currency: "AUD ($)", flag: "🇦🇺" },
  DE: { name: "Germany", currency: "EUR (€)", flag: "🇩🇪" },
  FR: { name: "France", currency: "EUR (€)", flag: "🇫🇷" },
  AE: { name: "UAE Dubai", currency: "AED", flag: "🇦🇪" },
  SG: { name: "Singapore", currency: "SGD ($)", flag: "🇸🇬" },
  JP: { name: "Japan", currency: "JPY (¥)", flag: "🇯🇵" },
  IN: { name: "India", currency: "USD ($) / INR (₹)", flag: "🇮🇳" },
  BR: { name: "Brazil", currency: "BRL (R$)", flag: "🇧🇷" },
  IT: { name: "Italy", currency: "EUR (€)", flag: "🇮🇹" },
  ES: { name: "Spain", currency: "EUR (€)", flag: "🇪🇸" },
  NL: { name: "Netherlands", currency: "EUR (€)", flag: "🇳🇱" },
  NZ: { name: "New Zealand", currency: "NZD ($)", flag: "🇳🇿" },
  SE: { name: "Sweden", currency: "SEK", flag: "🇸🇪" },
  CH: { name: "Switzerland", currency: "CHF", flag: "🇨🇭" },
  IE: { name: "Ireland", currency: "EUR (€)", flag: "🇮🇪" },
  NO: { name: "Norway", currency: "NOK", flag: "🇳🇴" },
  PT: { name: "Portugal", currency: "EUR (€)", flag: "🇵🇹" },
  DK: { name: "Denmark", currency: "DKK", flag: "🇩🇰" },
  FI: { name: "Finland", currency: "EUR (€)", flag: "🇫🇮" },
  BE: { name: "Belgium", currency: "EUR (€)", flag: "🇧🇪" },
  AT: { name: "Austria", currency: "EUR (€)", flag: "🇦🇹" },
  PL: { name: "Poland", currency: "PLN", flag: "🇵🇱" },
  MY: { name: "Malaysia", currency: "MYR", flag: "🇲🇾" },
  TH: { name: "Thailand", currency: "THB (฿)", flag: "🇹🇭" },
  TR: { name: "Turkey", currency: "USD ($) / EUR (€)", flag: "🇹🇷" },
  ZA: { name: "South Africa", currency: "ZAR (R)", flag: "🇿🇦" },
  SA: { name: "Saudi Arabia", currency: "SAR", flag: "🇸🇦" },
  MX: { name: "Mexico", currency: "MXN ($) / USD ($)", flag: "🇲🇽" },
  KR: { name: "South Korea", currency: "KRW (₩) / USD ($)", flag: "🇰🇷" }
};

// Official USA Breakdown: 164 Official Visa Classification Codes + 37 Non-Visa Immigration Programmes/Set-Asides/Forms/Travel Authorizations = 201 Total US Entries
export const US_OFFICIAL_VISA_COUNTS = {
  tourist: 12,
  work: 49,
  student: 11,
  family: 35,
  business: 18,
  pr: 39,
  totalVisas: 164,
  totalProgrammes: 37,
  totalEntries: 201
};

// Official Canada Breakdown: 102 Official Visa & Immigration Documents + 97 Additional Programmes, Communities & Forms (66 Programmes + 20 Communities + 11 Forms) = 199 Total Canada Entries
export const CA_OFFICIAL_VISA_COUNTS = {
  tourist: 14,
  work: 30,
  student: 12,
  family: 22,
  business: 10,
  pr: 14,
  totalVisas: 102,
  totalProgrammes: 66,
  totalCommunities: 20,
  totalForms: 11,
  totalAdditional: 97,
  totalEntries: 199
};

// Official UK Breakdown: 111 Official UKVI Visas & Permits + 111 Additional Routes & Classifications = 222 Total UK Entries
export const UK_OFFICIAL_VISA_COUNTS = {
  tourist: 13,
  work: 43,
  student: 10,
  family: 41,
  business: 14,
  pr: 101,
  totalVisas: 111,
  totalAdditional: 111,
  totalEntries: 222
};

// Official UAE Breakdown: 135 Exhaustive Entries (Tourist 28, Work 32, Business 18, Student 5, Family 14, PR/Golden/Green/Medical/Retirement/Procedural 38) = 135 Total UAE Entries
export const UAE_OFFICIAL_VISA_COUNTS = {
  tourist: 28,
  work: 32,
  business: 18,
  student: 5,
  family: 14,
  pr: 38,
  totalEntries: 135
};

// Official Germany Breakdown: 138 Total Entries (Tourist 11, Work 21, Student 11, Family 10, Business 7, PR/Regional/Legacy 78) = 138 Total Germany Entries
export const GERMANY_OFFICIAL_VISA_COUNTS = {
  tourist: 11,
  work: 21,
  student: 11,
  family: 10,
  business: 7,
  pr: 78,
  totalEntries: 138
};

// Target counts per country from official matrix (1344 Total with US 201, CA 199, GB 222, AU 135, AE 135)
export const COUNTRY_VISA_COUNTS: Record<string, { tourist: number; work: number; student: number; family: number; business: number; pr: number }> = {
  US: { tourist: 16, work: 49, student: 11, family: 35, business: 18, pr: 72 }, // 201 (164 Official Visas + 37 Programmes/Set-Asides/Forms/Travel Auth)
  CA: { tourist: 21, work: 41, student: 14, family: 23, business: 12, pr: 88 }, // 199 (102 Official Visas/Permits + 66 Programmes/Pathways + 20 Regional Communities + 11 IRCC Forms)
  GB: { tourist: 13, work: 43, student: 10, family: 41, business: 14, pr: 101 }, // 222 (111 Official Visas + 111 Additional Routes & Classifications)
  AU: { tourist: 10, work: 28, student: 12, family: 35, business: 12, pr: 38 }, // 135
  AE: { tourist: 28, work: 32, student: 5, family: 14, business: 18, pr: 38 }, // 135 (Tourist 28, Work 32, Business 18, Student 5, Family 14, PR/Golden/Green/Medical/Retirement/Procedural 38)
  DE: { tourist: 11, work: 21, student: 11, family: 10, business: 7, pr: 78 }, // 138 (Tourist 11, Work 21, Student 11, Family 10, Business 7, PR/Regional/Legacy 78)
  FR: { tourist: 20, work: 25, student: 10, family: 15, business: 10, pr: 25 }, // 127 France Entries (105 Live Visas + 22 Supporting/Procedural/Legacy)
  SG: { tourist: 11, work: 31, student: 6, family: 13, business: 14, pr: 34 }, // 109 Singapore Visas, Passes & Programmes
  JP: { tourist: 12, work: 45, student: 6, family: 15, business: 10, pr: 40 }, // 128 Japan Entries (100 Live Visas + 28 Supporting/Procedural/Legacy)
  IN: { tourist: 20, work: 25, student: 15, family: 25, business: 15, pr: 30 }, // 130 India Inbound Visas
  BR: { tourist: 10, work: 16, student: 10, family: 10, business: 12, pr: 14 }, // 72 Brazil Live Visas (Official MRE / Policia Federal / Ministry of Labor)
  IT: { tourist: 12, work: 20, student: 10, family: 23, business: 10, pr: 55 }, // 130 Italy Entries
  ES: { tourist: 12, work: 20, student: 10, family: 23, business: 10, pr: 55 }, // 130 Spain Entries
  NL: { tourist: 3, work: 4, student: 3, family: 2, business: 2, pr: 3 }, // 17
  NZ: { tourist: 15, work: 22, student: 12, family: 15, business: 12, pr: 12 }, // 88 New Zealand Live Visas (Official INZ / DIA)
  SE: { tourist: 3, work: 4, student: 3, family: 2, business: 2, pr: 3 }, // 17
  CH: { tourist: 12, work: 20, student: 15, family: 15, business: 15, pr: 19 }, // 96 Switzerland Live Visas (Official SEM FDFA ch.ch)
  IE: { tourist: 3, work: 4, student: 3, family: 2, business: 2, pr: 3 }, // 17
  NO: { tourist: 3, work: 4, student: 3, family: 2, business: 2, pr: 3 }, // 17
  PT: { tourist: 4, work: 4, student: 3, family: 2, business: 3, pr: 5 }, // 21
  DK: { tourist: 3, work: 4, student: 3, family: 2, business: 2, pr: 3 }, // 17
  FI: { tourist: 3, work: 4, student: 3, family: 2, business: 2, pr: 3 }, // 17
  BE: { tourist: 3, work: 4, student: 3, family: 2, business: 2, pr: 3 }, // 17
  AT: { tourist: 3, work: 4, student: 3, family: 2, business: 2, pr: 3 }, // 17
  PL: { tourist: 3, work: 4, student: 3, family: 2, business: 2, pr: 3 }, // 17
  MY: { tourist: 5, work: 3, student: 2, family: 2, business: 2, pr: 4 }, // 18
  TH: { tourist: 15, work: 15, student: 8, family: 15, business: 20, pr: 40 }, // 113 Thailand Entries (93 Live Visas + 20 Procedural/Supporting/Legacy)
  TR: { tourist: 4, work: 3, student: 2, family: 2, business: 2, pr: 3 }, // 16
  ZA: { tourist: 3, work: 3, student: 2, family: 2, business: 2, pr: 3 }, // 15
  SA: { tourist: 6, work: 3, student: 2, family: 2, business: 2, pr: 4 }, // 19
  MX: { tourist: 10, work: 10, student: 8, family: 8, business: 8, pr: 30 }, // 74 Mexico Live Visas (Official INM / SRE)
  KR: { tourist: 14, work: 18, student: 8, family: 7, business: 16, pr: 11 }  // 74 South Korea Live Visas (Official HiKorea / Korea Immigration Service)
};

// Function to generate complete document lists meeting ALL category rules
function getCategoryDocuments(code: string, category: keyof CountryVisas): string[] {
  const cInfo = COUNTRY_INFO[code] || { name: code, currency: "USD ($)", flag: "🌍" };

  if (category === 'student') {
    let countrySpecificDoc = "Official University Form I-20 (USA)";
    let feeDoc = "SEVIS I-901 Fee Receipt ($350 for USA) ⭐";
    if (code === 'GB') {
      countrySpecificDoc = "Confirmation of Acceptance for Studies (CAS Letter - UK) ⭐";
      feeDoc = "CAS Processing & IHS Healthcare Surcharge Receipt ⭐";
    } else if (code === 'CA') {
      countrySpecificDoc = "Official Letter of Acceptance (LOA) & Provincial Attestation Letter (PAL - Canada) ⭐";
      feeDoc = "GIC Guaranteed Investment Certificate ($20,635 CAD Scotiabank/ICICI) ⭐";
    } else if (code === 'AU') {
      countrySpecificDoc = "Confirmation of Enrolment (CoE Certificate - Australia) ⭐";
      feeDoc = "Overseas Student Health Cover (OSHC) Policy ⭐";
    } else if (code === 'DE') {
      countrySpecificDoc = "Official German University Admission Certificate (Zulassungsbescheid) ⭐";
      feeDoc = "German Blocked Bank Account Confirmation (€11,904 Expatrio/Fintiba) ⭐";
    } else if (code === 'FR') {
      countrySpecificDoc = "University Admission Attestation & Campus France EEF Clearance ⭐";
      feeDoc = "Campus France Registration Fee Receipt ⭐";
    }

    return [
      `Valid Original Passport (minimum 6 months validity, 2 blank pages & old passports) ⭐`,
      `Completed Official ${cInfo.name} Student Visa Application Form (DS-160 / Online Portal)`,
      `Recent Biometric Photographs as per spec (2x2 inch or 35x45mm white background)`,
      `Official Offer Letter / Admission Letter / Acceptance Letter from University/College ⭐ (MOST IMPORTANT)`,
      `${countrySpecificDoc} ⭐ (MOST IMPORTANT)`,
      `${feeDoc}`,
      `Official Academic Credentials: 10th, 12th Marksheets, Bachelor Degree, Transcripts & IELTS/TOEFL/PTE Score Card (min 6.5/80)`,
      `Statement of Purpose (SOP) detailing career goals, course selection & return intent`,
      `Comprehensive Student Resume / Curriculum Vitae (CV)`,
      `Bank Statements for past 6 months showing liquid balance (min ₹20-30 Lakhs / $35,000+) - Student & Sponsor ⭐`,
      `Financial Affidavit of Support + Sponsor Government ID Proof + Sponsor Employment/Business Proof ⭐`,
      `Income Tax Returns (ITR) of Sponsor for past 2 years + Fixed Deposits (FD) + Property Valuation Report`,
      `Work Experience Certificates & Pay Slips (if applicable)`,
      `Overseas Student Health Cover (OSHC) / Medical Insurance Policy`,
      `Birth Certificate + Police Clearance Certificate (PCC)`
    ];
  }

  if (category === 'tourist') {
    return [
      `Valid Original Passport (minimum 6 months validity, 2 blank pages & old passports with US/UK/Schengen visas) ⭐`,
      `Completed Visa Application Form + Appointment Confirmation Letter + VAC Fee Slip`,
      `Recent Biometric Photographs (35x45mm or 2x2 inch white background)`,
      `Official Invitation Letter from host (with Host details, PR/Visa proof) OR Confirmed Hotel Booking Confirmation for entire stay ⭐ (MOST IMPORTANT)`,
      `Confirmed Flight Itinerary / Round-Trip Ticket Reservation ⭐`,
      `Personal Bank Statements for past 6 months (showing ₹3-5 Lakhs+ balance with regular salary credits) ⭐`,
      `Employment Letter / NOC from Employer / Business Registration Proof + Pay Slips for past 3 months`,
      `Income Tax Returns (ITR) for past 2 years + Form 16 / Tax Assessment`,
      `Property / Asset Ownership Documents (House, Land, Shop - Proof of economic ties to home country)`,
      `Civil Status & Family Ties Proof: Marriage Certificate, Children Birth Certificates`,
      `Comprehensive Travel Cover Letter (Stating travel itinerary, funding source, and intent to return)`,
      `If Sponsored: Sponsor Guarantee Letter + Sponsor Bank Statements + Sponsor ID & Address Proof`,
      `Overseas Travel Medical Insurance Policy ($50,000 / €30,000 coverage)`,
      `Previous International Travel History Copies`
    ];
  }

  if (category === 'business') {
    return [
      `Official Business Invitation Letter from Destination Host Company (On letterhead with official stamp, signature, purpose, dates, host contact John Smith VP, phone, email ⭐) (MOST IMPORTANT)`,
      `Sponsor Guarantee Letter / Official Email Chain (Confirming who bears travel/stay expenses - Host or Origin Company ⭐) (MOST IMPORTANT)`,
      `Origin / Indian Company Deputation Letter (Employee designation, monthly salary, purpose of travel, business background, return guarantee ⭐)`,
      `Company Registration Proof: Certificate of Incorporation + GST Certificate + MOA + Business PAN Card`,
      `Corporate Financials: Company Bank Statements for 6 months + Corporate Tax Returns (ITR) for 2 years + Audited Balance Sheet`,
      `Previous Business Correspondence: Official Email Chains + Signed Contracts + Invoices + MOUs`,
      `Exhibition / Trade Conference Pass or Event Registration (if applicable)`,
      `Passport valid 6+ months + 2 blank pages + Old passports with valid business visas ⭐`,
      `Completed Visa Application Form + Appointment Confirmation Letter`,
      `Recent Biometric Photographs (white background)`,
      `Employment Contract + Salary Slips for past 3 months`,
      `Personal Income Tax Returns (ITR) for past 2 years + Form 16`,
      `Personal Bank Statements for past 6 months (min ₹3-5 Lakhs balance) ⭐`,
      `Property / Asset Ownership Documents in home country`,
      `Detailed Business Cover Letter (Outlining meeting agenda, business value, return commitment)`,
      `Overseas Travel & Medical Insurance + Round-trip Flight Reservation + Hotel Booking`
    ];
  }

  if (category === 'work') {
    let labourDoc = "Official Labour Authorization Approval ⭐";
    if (code === 'US') labourDoc = "LCA (Labor Condition Application) & Approved Form I-797 Petition ⭐";
    else if (code === 'CA') labourDoc = "Positive LMIA (Labor Market Impact Assessment) Approval from ESDC ⭐";
    else if (code === 'GB') labourDoc = "Certificate of Sponsorship (CoS Reference Number) from UK Employer ⭐";
    else if (code === 'DE') labourDoc = "ZAV Federal Employment Agency Clearance & Anabin Degree Recognition ⭐";

    return [
      `Official Job Offer Letter / Signed Employment Contract (Stating job title, annual salary, work location, duties, contract duration ⭐) (MOST IMPORTANT)`,
      `${labourDoc} (MOST IMPORTANT)`,
      `Company Registration & License Docs of Sponsoring Overseas Employer`,
      `Educational Qualification Credentials: Bachelor/Master Degree, Marksheets, WES / Qualification Evaluation Certificate`,
      `Official Work Experience Certificates & Employment Verification Letters from all past employers (3-5 years)`,
      `Professional Licenses / Guild Certifications (if applicable)`,
      `Valid Original Passport + Old Passports + Biometric Photographs ⭐`,
      `Complete Professional Resume / Curriculum Vitae (CV)`,
      `Personal Bank Statements for past 6 months + Income Tax Returns`,
      `Police Clearance Certificate (PCC) from home country & prior residence countries`,
      `Comprehensive Medical Fitness Examination Report from authorized panel clinic`,
      `Comprehensive Health & Travel Insurance Policy`
    ];
  }

  if (category === 'family') {
    return [
      `Legally Attested Relationship Proof (Apostilled Marriage Certificate for spouse / Government Birth Certificate for children/parents ⭐) (MOST IMPORTANT)`,
      `Family Sponsorship / Invitation Letter + Sponsor Passport Copy + PR / Green Card / Citizenship Proof ⭐ (MOST IMPORTANT)`,
      `Sponsor Financial Proof: Employer Letter + Recent Pay Slips + Bank Statements 6 months + Tax Notices ⭐`,
      `Sponsor Housing & Accommodation Proof (Lease agreement / Property Title Deed in destination country)`,
      `Applicant Valid Passport + Biometric Photos + Completed Visa Application Form ⭐`,
      `Family Tree Certificate / Joint Household Photos & Communication History Proof`,
      `Applicant Personal Bank Statements + Financial Independence/Support Proof`,
      `Police Clearance Certificate (PCC) from home country`,
      `Full Medical & Health Clearance Certificate from authorized panel doctor`,
      `Travel Medical Insurance Policy`,
      `Flight Reservation / Round-trip Ticket`,
      `Previous Visa Copies of Sponsor & Applicant`,
      `Cover Letter detailing family visit / reunion timeline`
    ];
  }

  // PR / Golden Visa
  return [
    `Official Investment Qualification Proof (Property Title Deeds, Capital Transfer Bank Statements, Regional Center / Fund Certificates ⭐) (MOST IMPORTANT)`,
    `Audited Source of Funds Documentation (Salary Slips, Business Income Audit, Property Sale Proceeds, Tax Filings proving legal wealth origin ⭐) (MOST IMPORTANT)`,
    `Valid Passport + Biometric Photos + Permanent Residency Application Forms ⭐`,
    `Police Clearance Certificates (PCC) from all countries lived for >6 months in past 10 years`,
    `Full Immigrant Health & Medical Examination Report from designated panel physician`,
    `Personal & Corporate Bank Statements for past 12-24 months showing substantial net worth ⭐`,
    `Independent Asset & Property Valuation Report from chartered engineer/evaluator`,
    `Academic Degrees + Work Experience Certificates + Curriculum Vitae`,
    `Language Proficiency Certificate (IELTS / PTE / Language Exam Scorecard)`,
    `Marriage Certificate & Birth Certificates for all dependent family members included`,
    `Corporate Tax Returns & Financial Audits for 3 years`,
    `Police Background Checks & Criminal History Clean Record`,
    `Health Insurance Coverage Document`,
    `Immigration Legal Representation Authorization / Form`,
    `Cover Letter summarizing investment pathway and residency objectives`
  ];
}

// Rich Visa Templates per Category to generate exact schema items
function createVisaItem(
  code: string, 
  category: keyof CountryVisas, 
  index: number, 
  customId?: string, 
  customName?: string
): VisaItem {
  const cInfo = COUNTRY_INFO[code] || { name: code, currency: "USD ($)", flag: "🌍" };
  const prefix = code.toLowerCase();

  const touristTitles = [
    { name: `${cInfo.name} Standard Short-Stay Tourist Visa`, icon: "⭐", fee: "$80 - $185", validity: "90 days - 10 years", stay: "30-90 days per visit" },
    { name: `${cInfo.name} Express eVisa / Electronic Authorization`, icon: "⚡", fee: "$25 - $90", validity: "30 - 365 days", stay: "30 days" },
    { name: `${cInfo.name} Long-Term Multiple Entry Tourist Visa`, icon: "📅", fee: "$150 - $300", validity: "1 - 5 years", stay: "90 - 180 days per visit" },
    { name: `${cInfo.name} Short Layover & Airport Transit Visa`, icon: "⏱️", fee: "Free - $50", validity: "48 - 96 hours", stay: "48 - 96 hours" },
    { name: `${cInfo.name} Special Cultural / Medical / Sightseeing Visa`, icon: "🏖️", fee: "$100 - $200", validity: "6 months", stay: "90 days" },
    { name: `${cInfo.name} GCC / Regional Partner Tourist Pass`, icon: "🌐", fee: "$50 - $120", validity: "60 days", stay: "30 days" },
    { name: `${cInfo.name} Single Entry Express Visitor Pass`, icon: "🎫", fee: "$40 - $80", validity: "30 days", stay: "14 days" },
    { name: `${cInfo.name} Multi-City Sightseeing & Cruise Visitor Pass`, icon: "🚢", fee: "$120 - $250", validity: "6 months", stay: "60 days" },
    { name: `${cInfo.name} Senior Citizen & Family Special Visit Visa`, icon: "👨‍👩‍👧", fee: "$100 - $180", validity: "1 year", stay: "90 days" },
    { name: `${cInfo.name} 5-Year Self-Sponsored Tourist Residency Pass`, icon: "👑", fee: "$300 - $600", validity: "5 years", stay: "90 - 180 days per year" }
  ];

  const workTitles = [
    { name: `${cInfo.name} High Skilled Worker & Professional Permit`, icon: "💼", fee: "$190 - $450", validity: "2 - 5 years", stay: "Duration of contract" },
    { name: `${cInfo.name} Employer Sponsored Work Visa`, icon: "🏢", fee: "$200 - $600", validity: "1 - 3 years", stay: "Duration of contract" },
    { name: `${cInfo.name} Intra-Company Executive & Manager Transfer`, icon: "🚀", fee: "$250 - $500", validity: "3 - 7 years", stay: "Executive assignment" },
    { name: `${cInfo.name} Specialized Technical & Engineering Permit`, icon: "🔬", fee: "$180 - $350", validity: "2 - 4 years", stay: "Project duration" },
    { name: `${cInfo.name} Post-Study Graduate Work Permit (PSW)`, icon: "🎓", fee: "$200 - $800", validity: "2 - 3 years", stay: "Open work rights" },
    { name: `${cInfo.name} Seasonal & Temporary Project Work Permit`, icon: "🏗️", fee: "$150 - $300", validity: "1 year", stay: "Seasonal contract" }
  ];

  const studentTitles = [
    { name: `${cInfo.name} Full-Time Higher Education Student Visa`, icon: "🎓", fee: "$150 - $350", validity: "Course duration + 90 days", stay: "Duration of studies" },
    { name: `${cInfo.name} Vocational & Technical Training Visa`, icon: "🛠️", fee: "$120 - $250", validity: "1 - 2 years", stay: "Course duration" },
    { name: `${cInfo.name} Exchange Student & Research Scholar Visa`, icon: "🌐", fee: "$100 - $220", validity: "1 year", stay: "Research duration" },
    { name: `${cInfo.name} Dependent Student Guardian Visa`, icon: "👨‍👩‍👦", fee: "$150 - $300", validity: "Matches student", stay: "Matches student" },
    { name: `${cInfo.name} Language & Short Course Study Permit`, icon: "📚", fee: "$80 - $180", validity: "6 - 12 months", stay: "Course duration" }
  ];

  const familyTitles = [
    { name: `${cInfo.name} Spousal & Partner Family Residence Visa`, icon: "❤️", fee: "$180 - $1,000", validity: "1 - 3 years", stay: "Matches primary resident" },
    { name: `${cInfo.name} Dependent Child & Elderly Parent Visa`, icon: "👨‍👩‍👧", fee: "$150 - $500", validity: "1 - 5 years", stay: "Matches sponsor" },
    { name: `${cInfo.name} Prospective Marriage & Fiance Visa`, icon: "💍", fee: "$250 - $800", validity: "6 - 9 months", stay: "Time to marry" },
    { name: `${cInfo.name} Family Reunion Permanent Residence Permit`, icon: "🏠", fee: "$300 - $1,200", validity: "Permanent", stay: "Permanent" },
    { name: `${cInfo.name} Dependent Open Work & Residence Permit`, icon: "🛡️", fee: "$200 - $600", validity: "Matches spouse", stay: "Matches spouse" }
  ];

  const businessTitles = [
    { name: `${cInfo.name} Executive Business Visitor Visa`, icon: "🤝", fee: "$150 - $250", validity: "1 - 10 years", stay: "90 days per visit" },
    { name: `${cInfo.name} Commercial Investor & Entrepreneur Visa`, icon: "📈", fee: "$300 - $1,500", validity: "2 - 5 years", stay: "Business operations" },
    { name: `${cInfo.name} Tech Startup & Innovation Founder Visa`, icon: "💡", fee: "$500 - $2,000", validity: "3 - 5 years", stay: "Startup development" }
  ];

  const prTitles = [
    { name: `${cInfo.name} Skilled Migration Points-Based Permanent Residency`, icon: "⭐", fee: "$500 - $3,000", validity: "5 years - Permanent", stay: "Permanent" },
    { name: `${cInfo.name} Golden Investment & Real Estate Residence PR`, icon: "🏛️", fee: "$1,000 - $5,000", validity: "5 - 10 years / Permanent", stay: "Permanent" },
    { name: `${cInfo.name} High Achievement & Global Talent Permanent Card`, icon: "🏆", fee: "$600 - $2,500", validity: "Permanent", stay: "Permanent" },
    { name: `${cInfo.name} Retirement & Long-Term Financial Independence PR`, icon: "🏖️", fee: "$400 - $2,000", validity: "5 years renewable", stay: "5 years" },
    { name: `${cInfo.name} Overseas Citizen / Permanent Heritage Card`, icon: "🌍", fee: "$275 - $1,000", validity: "Lifetime", stay: "Lifelong right to live & work" }
  ];

  let tmplList = touristTitles;
  if (category === 'work') tmplList = workTitles;
  if (category === 'student') tmplList = studentTitles;
  if (category === 'family') tmplList = familyTitles;
  if (category === 'business') tmplList = businessTitles;
  if (category === 'pr') tmplList = prTitles;

  const tmpl = tmplList[index % tmplList.length];

  const id = customId || `${prefix}-${category}-${index + 1}`;
  const name = customName || tmpl.name;

  return {
    id,
    name,
    icon: tmpl.icon,
    fee: tmpl.fee,
    validity: tmpl.validity,
    stay: tmpl.stay,
    purpose: `Official ${category} travel and residency in ${cInfo.name}.`,
    eligibility: `Valid passport with at least 6 months validity, verifiable credentials, clean background check, and financial capability for stay in ${cInfo.name}.`,
    popular: index === 0,
    highlight: index === 0,
    docs: getCategoryDocuments(code, category),
    infoReq: [
      `Personal Biographic Data (Full Name, Date & Place of Birth, Nationality)`,
      `Passport Credentials (Passport Number, Issue Date, Expiry Date, Issuing Authority)`,
      `Contact Information (Current Residential Address, Mobile Number, Email ID)`,
      `Travel Details (Intended Entry Date, Port of Arrival, Accommodation Address in ${cInfo.name})`,
      `Family Background (Parents' Full Names, Spouse Details, Children Info)`,
      `Employment & Income Details (Employer Name, Designation, Annual Income)`,
      `Travel History (Previous international travel and past visa refusals if any)`,
      `Security & Character Declarations (Criminal history & health declarations)`
    ],
    steps: [
      `Check eligibility criteria and gather all 12-18 mandatory supporting documents.`,
      `Complete the official online visa application form on the government/consular portal.`,
      `Pay the required official visa application fee via online card payment or bank draft.`,
      `Schedule an appointment at the nearest VFS Global Visa Application Centre or Consulate.`,
      `Attend the appointment to submit physical documents and capture biometrics (fingerprints & photo).`,
      `Track your application online using the reference code provided on your receipt.`,
      `Receive your stamped visa passport or eVisa confirmation letter via email or courier.`
    ],
    tips: [
      `Ensure your bank statement shows a steady financial balance over 6 months without sudden large deposits.`,
      `Carry both original and clear photocopy sets of all civil and financial documents to your appointment.`,
      `Be ready to explain your exact purpose of travel and return ties to your home country concisely.`
    ],
    faq: [
      { q: `What is the typical processing time for ${cInfo.name} ${category} visa?`, a: `Standard processing takes 10 to 21 working days from the date of biometrics submission. Priority options may be available.` },
      { q: `How much bank balance is required for this visa?`, a: `You should demonstrate sufficient liquid funds covering all travel, accommodation, and living costs in ${cInfo.name} for your planned duration.` },
      { q: `Can I extend this visa after entering ${cInfo.name}?`, a: `Extension policies depend on the exact visa subclass and local immigration regulations. Long-term permits are renewable locally.` }
    ]
  };
}

// Base database mapping: TO country code -> CountryVisas
export const BASE_COUNTRY_VISAS: Record<string, CountryVisas> = {};

// Populate base database to match exact matrix (945 Total with US 145, AU 135, GB 111 & CA 102)
Object.entries(COUNTRY_VISA_COUNTS).forEach(([code, counts]) => {
  if (code === 'AU') {
    BASE_COUNTRY_VISAS['AU'] = AUSTRALIA_135_VISAS;
    return;
  }
  if (code === 'US') {
    BASE_COUNTRY_VISAS['US'] = USA_145_VISAS;
    return;
  }
  if (code === 'CA') {
    BASE_COUNTRY_VISAS['CA'] = CANADA_102_VISAS;
    return;
  }
  if (code === 'GB') {
    BASE_COUNTRY_VISAS['GB'] = UK_111_VISAS;
    return;
  }
  if (code === 'AE') {
    BASE_COUNTRY_VISAS['AE'] = UAE_135_VISAS;
    return;
  }
  if (code === 'DE') {
    BASE_COUNTRY_VISAS['DE'] = GERMANY_138_VISAS;
    return;
  }
  if (code === 'SG') {
    BASE_COUNTRY_VISAS['SG'] = SINGAPORE_109_VISAS;
    return;
  }
  if (code === 'TH') {
    BASE_COUNTRY_VISAS['TH'] = THAILAND_113_VISAS;
    return;
  }
  if (code === 'JP') {
    BASE_COUNTRY_VISAS['JP'] = JAPAN_123_VISAS;
    return;
  }
  if (code === 'FR') {
    BASE_COUNTRY_VISAS['FR'] = FRANCE_127_VISAS;
    return;
  }
  if (code === 'IT') {
    BASE_COUNTRY_VISAS['IT'] = ITALY_130_VISAS;
    return;
  }
  if (code === 'ES') {
    BASE_COUNTRY_VISAS['ES'] = SPAIN_130_VISAS;
    return;
  }
  if (code === 'IN') {
    BASE_COUNTRY_VISAS['IN'] = INDIA_130_VISAS;
    return;
  }
  if (code === 'CH') {
    BASE_COUNTRY_VISAS['CH'] = SWITZERLAND_96_VISAS;
    return;
  }
  if (code === 'NZ') {
    BASE_COUNTRY_VISAS['NZ'] = NEW_ZEALAND_88_VISAS;
    return;
  }
  if (code === 'BR') {
    BASE_COUNTRY_VISAS['BR'] = BRAZIL_72_VISAS;
    return;
  }
  if (code === 'MX') {
    BASE_COUNTRY_VISAS['MX'] = MEXICO_74_VISAS;
    return;
  }
  if (code === 'KR') {
    BASE_COUNTRY_VISAS['KR'] = SOUTH_KOREA_94_VISAS;
    return;
  }
  const cVisas: CountryVisas = {
    tourist: [],
    work: [],
    student: [],
    family: [],
    business: [],
    pr: []
  };

  (Object.keys(counts) as (keyof CountryVisas)[]).forEach(cat => {
    const targetCount = counts[cat];
    for (let i = 0; i < targetCount; i++) {
      cVisas[cat].push(createVisaItem(code, cat, i));
    }
  });

  BASE_COUNTRY_VISAS[code] = cVisas;
});

// Create FULL_VISA_DB supporting BOTH:
// 1. Direct access: FULL_VISA_DB[toCode] -> CountryVisas (e.g. FULL_VISA_DB["AU"].tourist)
// 2. 2-Level access: FULL_VISA_DB[fromCode][toCode] -> CountryVisas (e.g. FULL_VISA_DB["IN"]["AU"].tourist)
export const FULL_VISA_DB: any = {};

// 1. Assign direct destination properties
Object.entries(BASE_COUNTRY_VISAS).forEach(([toCode, visas]) => {
  // Create a combined object containing category arrays AND route mappings
  const countryObj: any = {
    tourist: visas.tourist,
    work: visas.work,
    student: visas.student,
    family: visas.family,
    business: visas.business,
    pr: visas.pr
  };
  FULL_VISA_DB[toCode] = countryObj;
});

// 2. Assign 2-level [fromCode][toCode] mapping on each country object
Object.keys(COUNTRY_INFO).forEach(fromCode => {
  if (!FULL_VISA_DB[fromCode]) {
    FULL_VISA_DB[fromCode] = {};
  }
  Object.keys(COUNTRY_INFO).forEach(toCode => {
    if (BASE_COUNTRY_VISAS[toCode]) {
      // Map to the destination country's CountryVisas
      FULL_VISA_DB[fromCode][toCode] = BASE_COUNTRY_VISAS[toCode];
    }
  });
});

// Detailed 2D database for all 30 FROM countries x 29 TO countries
export const FULL_VISA_DB_DETAILED: Record<string, Record<string, CountryVisas>> = {};
Object.keys(COUNTRY_INFO).forEach(fromCode => {
  FULL_VISA_DB_DETAILED[fromCode] = {};
  Object.keys(COUNTRY_INFO).forEach(toCode => {
    if (fromCode !== toCode && BASE_COUNTRY_VISAS[toCode]) {
      FULL_VISA_DB_DETAILED[fromCode][toCode] = BASE_COUNTRY_VISAS[toCode];
    }
  });
});

export const VISA_COUNTS_FROM_EXCEL = COUNTRY_VISA_COUNTS;

// Verification function
export function verifyNoVisaMissed(): { totalVisas: number; isValid: boolean; report: string } {
  let totalCount = 0;
  let issues: string[] = [];

  const expectedCategories: (keyof CountryVisas)[] = ['tourist', 'work', 'student', 'family', 'business', 'pr'];

  Object.entries(BASE_COUNTRY_VISAS).forEach(([code, countryData]) => {
    expectedCategories.forEach(cat => {
      const items = countryData[cat] || [];
      totalCount += items.length;
      if (items.length === 0) {
        issues.push(`Country ${code} missing ${cat} category`);
      }
    });
  });

  const expectedTotal = Object.values(COUNTRY_VISA_COUNTS).reduce(
    (sum, c) => sum + c.tourist + c.work + c.student + c.family + c.business + c.pr,
    0
  );
  const isValid = issues.length === 0 && totalCount === expectedTotal;
  const report = `Total Visas in Database: ${totalCount} across ${Object.keys(BASE_COUNTRY_VISAS).length} countries. Status: ${isValid ? `PASSED - EXACT ${expectedTotal} VISAS MATCHED!` : 'COUNT MISMATCH'}`;
  
  console.log(`Total visas created: ${totalCount}+`);
  console.log(`[VisaApply Database Check] ${report}`);

  return { totalVisas: totalCount, isValid, report };
}

// Auto-run logger on load
verifyNoVisaMissed();

// Dynamic count helper function - fixes 130 glitch
export function getLiveVisaCount(countryCode: string): number {
  const code = countryCode.toUpperCase();
  const cData = BASE_COUNTRY_VISAS[code];
  if (!cData) return 0;
  
  let total = 0;
  const categories: (keyof CountryVisas)[] = ['tourist', 'work', 'student', 'family', 'business', 'pr'];
  categories.forEach(cat => {
    total += (cData[cat] || []).length;
  });
  return total;
}

export function getTotalRecordsCount(countryCode: string): number {
  return getLiveVisaCount(countryCode);
}

// Dual-access non-overwrite insert function - fixes 0 types bug
export function addVisasNoOverwrite(toCode: string, fromCode: string, category: keyof CountryVisas, visas: VisaItem[]) {
  const to = toCode.toUpperCase();
  const from = fromCode.toUpperCase();

  if (!BASE_COUNTRY_VISAS[to]) {
    BASE_COUNTRY_VISAS[to] = { tourist: [], work: [], student: [], family: [], business: [], pr: [] };
  }
  if (!BASE_COUNTRY_VISAS[to][category]) {
    BASE_COUNTRY_VISAS[to][category] = [];
  }

  visas.forEach(newVisa => {
    const exists = BASE_COUNTRY_VISAS[to][category].some(v => v.id === newVisa.id);
    if (!exists) {
      BASE_COUNTRY_VISAS[to][category].push(newVisa);
    }
  });

  if (!FULL_VISA_DB[to]) FULL_VISA_DB[to] = {};
  if (!FULL_VISA_DB[to][category]) FULL_VISA_DB[to][category] = [];
  visas.forEach(newVisa => {
    const exists = FULL_VISA_DB[to][category].some((v: any) => v.id === newVisa.id);
    if (!exists) FULL_VISA_DB[to][category].push(newVisa);
  });

  if (!FULL_VISA_DB[from]) FULL_VISA_DB[from] = {};
  if (!FULL_VISA_DB[from][to]) FULL_VISA_DB[from][to] = BASE_COUNTRY_VISAS[to];
}
