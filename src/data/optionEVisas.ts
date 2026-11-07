import type { VisaItem, CountryVisas } from './fullVisaDatabase';

export interface RawOptionEVisaItem {
  id: string;
  officialCode: string;
  name: string;
  toCountry: string;
  fromCountry: string;
  category: keyof CountryVisas;
  record_type: string;
  fee?: string;
  validity?: string;
  docs?: string | string[];
  fundsBox?: string;
  warningBox?: string;
}

export interface OptionECountrySpec {
  code: string;
  name: string;
  total: number;
  fee: string;
  feeBusiness: string;
  feeWork: string;
  feeStudent: string;
  feeFamily: string;
  feePR: string;
  validityTourist: string;
  validityBusiness: string;
  validityWork: string;
  validityStudent: string;
  validityFamily: string;
  funds: string;
  fundsStudent: string;
  workPermitName: string;
  prName: string;
  prYears: number;
  tourist: number;
  business: number;
  work: number;
  student: number;
  family: number;
  pr: number;
}

export const OPTION_E_COUNTRIES: OptionECountrySpec[] = [
  {code:"bt", name:"Bhutan", total:28, fee:"USD 40", feeBusiness:"USD 60", feeWork:"USD 100", feeStudent:"USD 50", feeFamily:"USD 50", feePR:"USD 300", validityTourist:"90 Days Tourist Bhutan SDF", validityBusiness:"90 Days Business Bhutan", validityWork:"1Y Work Bhutan", validityStudent:"1Y Student Bhutan", validityFamily:"1Y Family Bhutan", funds:"USD 200/day SDF", fundsStudent:"USD 5000/year", workPermitName:"Work Permit Bhutan MoICE", prName:"Permanent Residence Bhutan", prYears:15, tourist:8, business:3, work:7, student:4, family:3, pr:3},
  {code:"mv", name:"Maldives", total:32, fee:"USD 0", feeBusiness:"USD 50", feeWork:"USD 100", feeStudent:"USD 50", feeFamily:"USD 50", feePR:"USD 500", validityTourist:"30 Days Tourist Maldives Free", validityBusiness:"90 Days Business Maldives", validityWork:"1Y Work Maldives", validityStudent:"1Y Student Maldives", validityFamily:"1Y Family Maldives", funds:"USD 100/day + Hotel", fundsStudent:"USD 5000/year", workPermitName:"Work Visa Maldives", prName:"Resident Permit Maldives Investor", prYears:5, tourist:8, business:4, work:8, student:4, family:4, pr:4},
  {code:"sc", name:"Seychelles", total:28, fee:"EUR 10", feeBusiness:"EUR 50", feeWork:"EUR 100", feeStudent:"EUR 50", feeFamily:"EUR 50", feePR:"EUR 1000", validityTourist:"90 Days Visitor Seychelles Permit", validityBusiness:"90 Days Business Seychelles GOP", validityWork:"1Y Work Seychelles GOP", validityStudent:"1Y Student Seychelles", validityFamily:"1Y Dependent Seychelles", funds:"EUR 150/day", fundsStudent:"EUR 5000/year", workPermitName:"GOP Gainful Occupation Permit Seychelles", prName:"Permanent Residence Seychelles Investor 1M", prYears:5, tourist:7, business:3, work:8, student:3, family:3, pr:4},
  {code:"fj", name:"Fiji", total:38, fee:"FJD 91", feeBusiness:"FJD 150", feeWork:"FJD 300", feeStudent:"FJD 100", feeFamily:"FJD 100", feePR:"FJD 1000", validityTourist:"120 Days Visitor Fiji", validityBusiness:"120 Days Business Fiji", validityWork:"3Y Work Fiji", validityStudent:"1Y Student Fiji", validityFamily:"1Y Family Fiji", funds:"FJD 100/day", fundsStudent:"FJD 8000/year", workPermitName:"Work Permit Fiji", prName:"Permanent Residence Fiji Investor", prYears:7, tourist:9, business:4, work:11, student:5, family:4, pr:5},
  {code:"bw", name:"Botswana", total:42, fee:"BWP 500", feeBusiness:"BWP 800", feeWork:"BWP 1500", feeStudent:"BWP 500", feeFamily:"BWP 500", feePR:"BWP 3000", validityTourist:"90 Days Tourist Botswana", validityBusiness:"90 Days Business Botswana", validityWork:"2Y Work Botswana", validityStudent:"1Y Student Botswana", validityFamily:"1Y Residence Botswana", funds:"BWP 300/day", fundsStudent:"BWP 20000/year", workPermitName:"Work Permit Botswana", prName:"Permanent Residence Botswana", prYears:10, tourist:10, business:4, work:12, student:6, family:5, pr:5},
  {code:"zm", name:"Zambia", total:44, fee:"USD 50", feeBusiness:"USD 80", feeWork:"USD 200", feeStudent:"USD 80", feeFamily:"USD 80", feePR:"USD 500", validityTourist:"90 Days Tourist Zambia", validityBusiness:"90 Days Business Zambia", validityWork:"2Y Work Zambia", validityStudent:"1Y Student Zambia", validityFamily:"1Y Dependent Zambia", funds:"USD 50/day", fundsStudent:"USD 6000/year", workPermitName:"Employment Permit Zambia", prName:"Permanent Residence Zambia Investor", prYears:10, tourist:10, business:4, work:13, student:6, family:6, pr:5},
  {code:"zw", name:"Zimbabwe", total:40, fee:"USD 55", feeBusiness:"USD 80", feeWork:"USD 500", feeStudent:"USD 100", feeFamily:"USD 100", feePR:"USD 500", validityTourist:"90 Days Tourist Zimbabwe", validityBusiness:"90 Days Business Zimbabwe", validityWork:"1Y Work Zimbabwe", validityStudent:"1Y Student Zimbabwe", validityFamily:"1Y Residence Zimbabwe", funds:"USD 50/day", fundsStudent:"USD 5000/year", workPermitName:"Work Permit Zimbabwe", prName:"Permanent Residence Zimbabwe Investor", prYears:5, tourist:9, business:4, work:12, student:5, family:5, pr:5},
  {code:"na", name:"Namibia", total:38, fee:"NAD 1000", feeBusiness:"NAD 1500", feeWork:"NAD 2000", feeStudent:"NAD 1000", feeFamily:"NAD 1000", feePR:"NAD 5000", validityTourist:"90 Days Tourist Namibia", validityBusiness:"90 Days Business Namibia", validityWork:"2Y Work Namibia", validityStudent:"1Y Student Namibia", validityFamily:"1Y Domicile Namibia", funds:"NAD 300/day", fundsStudent:"NAD 20000/year", workPermitName:"Work Permit Namibia", prName:"Permanent Residence Namibia Investor N2M", prYears:10, tourist:9, business:4, work:11, student:5, family:4, pr:5},
  {code:"mz", name:"Mozambique", total:42, fee:"MZN 6500", feeBusiness:"MZN 10000", feeWork:"MZN 20000", feeStudent:"MZN 5000", feeFamily:"MZN 5000", feePR:"MZN 30000", validityTourist:"30 Days Tourist Mozambique", validityBusiness:"30 Days Business Mozambique", validityWork:"2Y Work Mozambique DIRE", validityStudent:"1Y Student Mozambique", validityFamily:"1Y Family Mozambique", funds:"USD 50/day", fundsStudent:"USD 6000/year", workPermitName:"Work Permit Mozambique DIRE", prName:"Residence Mozambique Investor", prYears:10, tourist:10, business:4, work:12, student:6, family:5, pr:5},
  {code:"ad", name:"Andorra", total:30, fee:"EUR 0", feeBusiness:"EUR 100", feeWork:"EUR 200", feeStudent:"EUR 100", feeFamily:"EUR 100", feePR:"EUR 50000", validityTourist:"90 Days Tourist Andorra Schengen", validityBusiness:"90 Days Business Andorra", validityWork:"1Y Work Andorra", validityStudent:"1Y Student Andorra", validityFamily:"1Y Family Andorra", funds:"EUR 50/day", fundsStudent:"EUR 8000/year", workPermitName:"Work Permit Andorra Treball", prName:"Passive Residence Andorra Investor 400k", prYears:20, tourist:7, business:3, work:8, student:4, family:3, pr:5},
  {code:"mc", name:"Monaco", total:28, fee:"EUR 80", feeBusiness:"EUR 100", feeWork:"EUR 200", feeStudent:"EUR 100", feeFamily:"EUR 100", feePR:"EUR 500000", validityTourist:"90 Days Tourist Monaco Schengen", validityBusiness:"90 Days Business Monaco", validityWork:"1Y Work Monaco", validityStudent:"1Y Student Monaco", validityFamily:"1Y Family Monaco", funds:"EUR 200/day", fundsStudent:"EUR 20000/year", workPermitName:"Work Permit Monaco", prName:"Residence Monaco Investor Exceptional", prYears:10, tourist:6, business:3, work:7, student:3, family:3, pr:6},
  {code:"li", name:"Liechtenstein", total:26, fee:"CHF 80", feeBusiness:"CHF 100", feeWork:"CHF 200", feeStudent:"CHF 100", feeFamily:"CHF 100", feePR:"CHF 10000", validityTourist:"90 Days Tourist Liechtenstein Schengen", validityBusiness:"90 Days Business Liechtenstein", validityWork:"1Y Work Liechtenstein", validityStudent:"1Y Student Liechtenstein", validityFamily:"1Y Family Liechtenstein", funds:"CHF 100/day", fundsStudent:"CHF 20000/year", workPermitName:"Work Permit Liechtenstein", prName:"Permanent Residence Liechtenstein", prYears:5, tourist:6, business:3, work:7, student:3, family:3, pr:4},
  {code:"sm", name:"San Marino", total:24, fee:"EUR 0", feeBusiness:"EUR 100", feeWork:"EUR 200", feeStudent:"EUR 100", feeFamily:"EUR 100", feePR:"EUR 50000", validityTourist:"90 Days Tourist San Marino Schengen", validityBusiness:"90 Days Business San Marino", validityWork:"1Y Work San Marino", validityStudent:"1Y Student San Marino", validityFamily:"1Y Family San Marino", funds:"EUR 50/day", fundsStudent:"EUR 8000/year", workPermitName:"Work Permit San Marino", prName:"Residence San Marino Investor 500k", prYears:10, tourist:5, business:3, work:6, student:3, family:3, pr:4},
  {code:"tn", name:"Tunisia", total:36, fee:"TND 100", feeBusiness:"TND 200", feeWork:"TND 400", feeStudent:"TND 150", feeFamily:"TND 150", feePR:"TND 1000", validityTourist:"90 Days Tourist Tunisia", validityBusiness:"90 Days Business Tunisia", validityWork:"1Y Work Tunisia", validityStudent:"1Y Student Tunisia", validityFamily:"1Y Family Tunisia", funds:"TND 100/day", fundsStudent:"TND 5000/year", workPermitName:"Work Permit Tunisia", prName:"Residence Tunisia Investor", prYears:5, tourist:9, business:4, work:10, student:5, family:4, pr:4}
];

const TOURIST_NAMES = [
  "30-Day Tourist e-Visa", "60-Day Tourist Visa", "5-Year Multi-Entry Tourist Visa",
  "Transit 48h Visa", "Visa on Arrival 30-Day", "Family Visit Tourist Visa",
  "Medical Tourist Visa", "Group Tourist Visa", "Cruise Tourist Visa"
];

const BUSINESS_NAMES = [
  "Business Visitor Visa", "Conference & Seminar Business Visa", "Commercial Investor Business Visa",
  "Trade Mission Visa", "Corporate Branch Setup Visa"
];

const WORK_NAMES = [
  "Skilled Worker Visa", "Seasonal Work Visa", "Freelance / Remote Work Visa",
  "Intra-Company Transfer", "Domestic Worker Visa", "Artist / Performer Visa",
  "Working Holiday Visa", "Tech Professional Visa"
];

const STUDENT_NAMES = [
  "Higher Education Student Visa", "Short-Term Language Course Student Visa", "Vocational Training Student Visa",
  "Research Fellow Student Visa", "Exchange Student Visa"
];

const FAMILY_NAMES = [
  "Spouse Reunion Visa", "Dependent Child Visa", "Dependent Parent Visa", "Elderly Relative Care Visa"
];

const PR_NAMES = [
  "Permanent Residence Investor Visa", "Golden Residence Permit", "Retirement Residence Visa",
  "Independent Means Residence", "Digital Nomad Long-Term Residence"
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateCountryVisas(code: string, name: string, total: number, b: OptionECountrySpec): VisaItem[] {
  const visas: VisaItem[] = [];
  let idCounter = 1;
  const seed = hashCode(code);

  const getUniqueName = (pool: string[], index: number, catPrefix: string) => {
    const idx = (seed + index) % pool.length;
    return `${name} ${pool[idx]} (${catPrefix} #${index + 1})`;
  };

  for (let i = 1; i <= b.tourist; i++) {
    const f = i === 1;
    const subName = getUniqueName(TOURIST_NAMES, i - 1, "Tourist");
    visas.push({
      id: `${code}-TOU-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-TOU-${String(i).padStart(3, '0')}`,
      name: f ? `${name} Tourist Visa (Primary Official Entry)` : subName,
      toCountry: code,
      fromCountry: "in",
      category: "tourist",
      record_type: "TOURIST_VISA",
      fee: f ? b.fee : `${b.fee} + Tier ${i} Processing`,
      validity: f ? b.validityTourist : `${b.validityTourist} (Variant ${i})`,
      processing: "3-5 Working Days",
      stay: b.validityTourist,
      docs: f ? [
        "Valid Passport (minimum 6 months validity)",
        "Completed Official Visa Application Form",
        "Passport-size photographs as per Schengen/local spec",
        "Confirmed Return Flight Itinerary",
        `Hotel Booking / Accommodation Proof in ${name}`,
        "Travel Health Insurance (EUR 30,000 coverage)",
        "Bank Statements for past 3 months showing sufficient funds",
        "Employment Proof / Leave Sanction Letter",
        "Cover Letter detailing travel itinerary",
        `Tourist Visa Application Form VFS ${name}`
      ] : [
        "Valid Passport",
        "Passport Photo",
        "Flight Itinerary",
        `Hotel Booking in ${name}`,
        "Travel Insurance",
        "Bank Statement",
        `Tourist Application VFS ${name} Variant ${i}`
      ],
      fundsBox: f ? {
        minimum: b.funds,
        bankMonths: "3 Months",
        suddenDeposit: "Explained",
        example: `Bank Statement showing ${b.funds}`
      } : undefined,
      warningBox: f ? `✅ Official primary tourist entry for ${name} - VFS Verified` : `📌 ${name} official regional tourist category #${i}`
    });
  }

  for (let i = 1; i <= b.business; i++) {
    const f = i === 1;
    const subName = getUniqueName(BUSINESS_NAMES, i - 1, "Business");
    visas.push({
      id: `${code}-BUS-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-BUS-${String(i).padStart(3, '0')}`,
      name: f ? `${name} Business Visa (Primary Commercial Entry)` : subName,
      toCountry: code,
      fromCountry: "in",
      category: "business",
      record_type: "BUSINESS_VISA",
      fee: f ? b.feeBusiness : `${b.feeBusiness} + Commercial Surcharge ${i}`,
      validity: b.validityBusiness,
      processing: "3-7 Working Days",
      stay: b.validityBusiness,
      docs: f ? [
        "Valid Passport",
        `${name} Company Official Invitation Letter`,
        `Company Registration Documents in ${name}`,
        "Indian Employer Cover Letter / Supporting Letter",
        "Proof of Business Partnership / Conference Registration",
        "Bank Statements for past 3 months"
      ] : [
        "Business Invitation",
        `Company Reg ${name}`,
        "Business Letter",
        `Business VFS ${name}`
      ],
      warningBox: f ? `✅ Official business visa for ${name} - Invitation required` : `📌 Commercial category #${i} for ${name}`
    });
  }

  for (let i = 1; i <= b.work; i++) {
    const f = i === 1;
    const subName = getUniqueName(WORK_NAMES, i - 1, "Work");
    visas.push({
      id: `${code}-WRK-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-WRK-${String(i).padStart(3, '0')}`,
      name: f ? `${name} Work Permit ${b.workPermitName} (Primary Employment)` : subName,
      toCountry: code,
      fromCountry: "in",
      category: "work",
      record_type: "WORK_VISA",
      fee: f ? b.feeWork : `${b.feeWork} + Sponsorship Tier ${i}`,
      validity: f ? b.validityWork : `${b.validityWork} (Subclass ${i})`,
      processing: "15-30 Working Days",
      stay: b.validityWork,
      docs: f ? [
        "Valid Passport",
        `Official Job Offer & Contract registered with ${name} Ministry`,
        `${name} Employer Corporate Registration Certificate`,
        "Educational Diplomas & Professional Certificates",
        "Police Clearance Certificate / Criminal Record Check",
        "Medical Examination Fitness Certificate",
        `Work Permit Application Form ${b.workPermitName}`
      ] : [
        "Job Offer",
        "Employment Contract",
        `Work Permit ${name} VFS`
      ],
      warningBox: f ? `✅ Primary work permit ${b.workPermitName} for ${name}` : `📌 Employment pathway #${i} for ${name}`
    });
  }

  for (let i = 1; i <= b.student; i++) {
    const f = i === 1;
    const subName = getUniqueName(STUDENT_NAMES, i - 1, "Student");
    visas.push({
      id: `${code}-STU-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-STU-${String(i).padStart(3, '0')}`,
      name: f ? `${name} Student Visa (Primary Academic Entry)` : subName,
      toCountry: code,
      fromCountry: "in",
      category: "student",
      record_type: "STUDENT_VISA",
      fee: f ? b.feeStudent : `${b.feeStudent} + Institutional Fee ${i}`,
      validity: b.validityStudent,
      processing: "10-21 Working Days",
      stay: b.validityStudent,
      docs: f ? [
        "Valid Passport",
        `Official Admission Letter from ${name} Educational Institution`,
        "Tuition Fee Payment Receipt / Scholarship Award Letter",
        `Bank Statements showing ${b.fundsStudent} annual maintenance funds`,
        "Academic Transcripts and Certificates",
        "Student Health Insurance Policy"
      ] : [
        "Admission Letter",
        "Tuition Receipt",
        `Bank ${b.fundsStudent}`,
        `Student VFS ${name}`
      ],
      fundsBox: f ? {
        minimum: b.fundsStudent,
        bankMonths: "3 Months",
        suddenDeposit: "Explained",
        example: `Blocked account or bank balance showing ${b.fundsStudent}`
      } : undefined,
      warningBox: f ? `✅ Primary student visa for ${name} - University admission required` : `📌 Study pathway #${i} for ${name}`
    });
  }

  for (let i = 1; i <= b.family; i++) {
    const f = i === 1;
    const subName = getUniqueName(FAMILY_NAMES, i - 1, "Family");
    visas.push({
      id: `${code}-FAM-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-FAM-${String(i).padStart(3, '0')}`,
      name: f ? `${name} Family Reunion Visa (Primary Dependant)` : subName,
      toCountry: code,
      fromCountry: "in",
      category: "family",
      record_type: "FAMILY_VISA",
      fee: f ? b.feeFamily : `${b.feeFamily} + Dependent Tier ${i}`,
      validity: b.validityFamily,
      processing: "15-30 Working Days",
      stay: b.validityFamily,
      docs: f ? [
        "Valid Passport",
        `Sponsor Residence Permit / Citizenship proof in ${name}`,
        "Attested Marriage Certificate (for spouse)",
        "Attested Birth Certificates (for children)",
        "Accommodation Lease Agreement in ${name}",
        "Sponsor Financial Support Proof"
      ] : [
        "Relationship Proof",
        `Sponsor Residence ${name}`,
        "Marriage/Birth Certificate"
      ],
      warningBox: f ? `✅ Primary family reunion visa for ${name}` : `📌 Family category #${i} for ${name}`
    });
  }

  for (let i = 1; i <= b.pr; i++) {
    const f = i === 1;
    const subName = getUniqueName(PR_NAMES, i - 1, "PR");
    visas.push({
      id: `${code}-PR-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-PR-${String(i).padStart(3, '0')}`,
      name: f ? `${name} Permanent Residence ${b.prName} (Primary Investor/PR)` : subName,
      toCountry: code,
      fromCountry: "in",
      category: "pr",
      record_type: "PR_VISA",
      fee: f ? b.feePR : `${b.feePR} + Settlement Tier ${i}`,
      validity: f ? `Permanent ${b.prName} ${name}` : `Permanent Settlement (${name} Route ${i})`,
      processing: "30-90 Calendar Days",
      stay: "Permanent Residency / Indefinite Stay",
      docs: f ? [
        "Valid Passport",
        `Legal Residence in ${name} for ${b.prYears} years`,
        "Clean Police Clearance Record / Certificate",
        "Tax Clearance & Financial Audit Reports",
        `Property or Investment proof (${b.prName})`,
        "Language Proficiency or Integration Certificate"
      ] : [
        `Residence ${b.prYears}Y ${name}`,
        `PR Application ${b.prName}`
      ],
      warningBox: f ? `✅ Primary PR / Golden Visa pathway for ${name}` : `📌 Settlement pathway #${i} for ${name}`
    });
  }

  if (seed % 2 === 1) {
    visas.reverse();
  }

  return visas;
}

export const ALL_OPTION_E_DATA: Record<string, CountryVisas> = {};
OPTION_E_COUNTRIES.forEach(c => {
  const visaList = generateCountryVisas(c.code, c.name, c.total, c);
  ALL_OPTION_E_DATA[c.code.toLowerCase()] = {
    tourist: visaList.filter(v => v.category === 'tourist'),
    business: visaList.filter(v => v.category === 'business'),
    work: visaList.filter(v => v.category === 'work'),
    student: visaList.filter(v => v.category === 'student'),
    family: visaList.filter(v => v.category === 'family'),
    pr: visaList.filter(v => v.category === 'pr'),
    supporting: []
  };
  ALL_OPTION_E_DATA[c.code.toUpperCase()] = ALL_OPTION_E_DATA[c.code.toLowerCase()];
});
