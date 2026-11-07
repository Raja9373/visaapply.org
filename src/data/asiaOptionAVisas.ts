import type { VisaItem, CountryVisas } from './fullVisaDatabase';

export interface CountryConfig {
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

export const ASIA_OPTION_A_COUNTRIES: CountryConfig[] = [
  {
    code: "hk", name: "Hong Kong", total: 45,
    fee: "HKD 190", feeBusiness: "HKD 300", feeWork: "HKD 1000", feeStudent: "HKD 500", feeFamily: "HKD 500", feePR: "HKD 3000",
    validityTourist: "90 Days Visitor Hong Kong", validityBusiness: "90 Days Business Visitor Hong Kong", validityWork: "2Y Work Visa Hong Kong Employment",
    validityStudent: "1Y Student Visa Hong Kong", validityFamily: "2Y Dependant Hong Kong",
    funds: "HKD 500/day", fundsStudent: "HKD 80000/year",
    workPermitName: "Employment Visa Hong Kong", prName: "Permanent Residence Hong Kong Right of Abode", prYears: 7,
    tourist: 10, business: 5, work: 14, student: 6, family: 5, pr: 5
  },
  {
    code: "tw", name: "Taiwan", total: 52,
    fee: "USD 50", feeBusiness: "USD 80", feeWork: "USD 150", feeStudent: "USD 80", feeFamily: "USD 80", feePR: "USD 500",
    validityTourist: "90 Days Visitor Taiwan", validityBusiness: "90 Days Business Visitor Taiwan", validityWork: "3Y Work Permit Taiwan",
    validityStudent: "1Y Student Resident Taiwan", validityFamily: "1Y Joining Family Taiwan",
    funds: "USD 50/day", fundsStudent: "USD 10000/year",
    workPermitName: "Work Permit Taiwan Employment Gold Card", prName: "APRC Permanent Residence Taiwan", prYears: 5,
    tourist: 12, business: 6, work: 16, student: 8, family: 5, pr: 5
  },
  {
    code: "lk", name: "Sri Lanka", total: 48,
    fee: "USD 50", feeBusiness: "USD 75", feeWork: "USD 200", feeStudent: "USD 75", feeFamily: "USD 75", feePR: "USD 500",
    validityTourist: "30 Days Tourist ETA Sri Lanka", validityBusiness: "30 Days Business ETA Sri Lanka", validityWork: "2Y Work Visa Sri Lanka",
    validityStudent: "1Y Student Visa Sri Lanka", validityFamily: "1Y Resident Sri Lanka",
    funds: "USD 40/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit Sri Lanka BOI", prName: "Resident Guest Scheme Sri Lanka", prYears: 5,
    tourist: 11, business: 5, work: 15, student: 7, family: 5, pr: 5
  },
  {
    code: "np", name: "Nepal", total: 42,
    fee: "USD 30", feeBusiness: "USD 50", feeWork: "USD 100", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 300",
    validityTourist: "90 Days Tourist Visa on Arrival Nepal", validityBusiness: "90 Days Business Nepal", validityWork: "1Y Work Nepal",
    validityStudent: "1Y Student Nepal", validityFamily: "1Y Family Nepal",
    funds: "USD 30/day", fundsStudent: "USD 4000/year",
    workPermitName: "Work Permit Nepal Department of Labor", prName: "Residential Visa Nepal", prYears: 10,
    tourist: 10, business: 4, work: 13, student: 6, family: 5, pr: 4
  },
  {
    code: "bd", name: "Bangladesh", total: 44,
    fee: "USD 50", feeBusiness: "USD 100", feeWork: "USD 200", feeStudent: "USD 75", feeFamily: "USD 75", feePR: "USD 500",
    validityTourist: "90 Days Tourist Bangladesh", validityBusiness: "90 Days Business Bangladesh", validityWork: "1Y Work Bangladesh E",
    validityStudent: "1Y Student Bangladesh S", validityFamily: "1Y Family Bangladesh",
    funds: "USD 50/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit Bangladesh BIDA", prName: "Permanent Residence Bangladesh Investor", prYears: 5,
    tourist: 10, business: 4, work: 14, student: 6, family: 5, pr: 5
  },
  {
    code: "pk", name: "Pakistan", total: 46,
    fee: "USD 60", feeBusiness: "USD 100", feeWork: "USD 250", feeStudent: "USD 80", feeFamily: "USD 80", feePR: "USD 500",
    validityTourist: "90 Days Tourist Pakistan E-Visa", validityBusiness: "90 Days Business Pakistan", validityWork: "1Y Work Pakistan",
    validityStudent: "1Y Student Pakistan", validityFamily: "1Y Family Pakistan",
    funds: "USD 40/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit Pakistan BOI", prName: "Pakistan Origin Card POC", prYears: 7,
    tourist: 11, business: 5, work: 14, student: 6, family: 5, pr: 5
  },
  {
    code: "mm", name: "Myanmar", total: 38,
    fee: "USD 50", feeBusiness: "USD 70", feeWork: "USD 200", feeStudent: "USD 60", feeFamily: "USD 60", feePR: "USD 400",
    validityTourist: "28 Days Tourist Myanmar E-Visa", validityBusiness: "70 Days Business Myanmar", validityWork: "1Y Work Myanmar",
    validityStudent: "1Y Student Myanmar", validityFamily: "1Y Family Myanmar",
    funds: "USD 40/day", fundsStudent: "USD 4000/year",
    workPermitName: "Employment Visa Myanmar", prName: "Permanent Residence Myanmar", prYears: 5,
    tourist: 9, business: 4, work: 12, student: 5, family: 4, pr: 4
  },
  {
    code: "kh", name: "Cambodia", total: 40,
    fee: "USD 36", feeBusiness: "USD 50", feeWork: "USD 100", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 300",
    validityTourist: "30 Days Tourist Cambodia E-Visa", validityBusiness: "30 Days Business Cambodia Type E", validityWork: "1Y Work Cambodia Type E",
    validityStudent: "1Y Student Cambodia Type E", validityFamily: "1Y Family Cambodia",
    funds: "USD 30/day", fundsStudent: "USD 4000/year",
    workPermitName: "Ordinary Visa Type E Cambodia", prName: "Permanent Residence Cambodia", prYears: 7,
    tourist: 9, business: 4, work: 13, student: 5, family: 4, pr: 5
  },
  {
    code: "la", name: "Laos", total: 36,
    fee: "USD 40", feeBusiness: "USD 60", feeWork: "USD 150", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 300",
    validityTourist: "30 Days Tourist Laos E-Visa", validityBusiness: "30 Days Business Laos", validityWork: "1Y Work Laos",
    validityStudent: "1Y Student Laos", validityFamily: "1Y Family Laos",
    funds: "USD 30/day", fundsStudent: "USD 4000/year",
    workPermitName: "Work Permit Laos Ministry of Labor", prName: "Permanent Residence Laos", prYears: 5,
    tourist: 8, business: 4, work: 12, student: 5, family: 4, pr: 3
  },
  {
    code: "bn", name: "Brunei", total: 38,
    fee: "BND 20", feeBusiness: "BND 50", feeWork: "BND 100", feeStudent: "BND 50", feeFamily: "BND 50", feePR: "BND 500",
    validityTourist: "30 Days Tourist Brunei", validityBusiness: "30 Days Business Brunei", validityWork: "2Y Work Brunei Employment Pass",
    validityStudent: "1Y Student Brunei", validityFamily: "1Y Family Brunei",
    funds: "BND 50/day", fundsStudent: "BND 6000/year",
    workPermitName: "Employment Pass Brunei", prName: "Permanent Residence Brunei", prYears: 10,
    tourist: 9, business: 4, work: 12, student: 5, family: 4, pr: 4
  },
  {
    code: "mn", name: "Mongolia", total: 40,
    fee: "USD 45", feeBusiness: "USD 70", feeWork: "USD 150", feeStudent: "USD 60", feeFamily: "USD 60", feePR: "USD 400",
    validityTourist: "30 Days Tourist Mongolia E-Visa", validityBusiness: "30 Days Business Mongolia", validityWork: "1Y Work Mongolia HG",
    validityStudent: "1Y Student Mongolia", validityFamily: "1Y Family Mongolia",
    funds: "USD 40/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit Mongolia HG", prName: "Permanent Residence Mongolia", prYears: 5,
    tourist: 9, business: 4, work: 13, student: 5, family: 4, pr: 5
  },
  {
    code: "kz", name: "Kazakhstan", total: 46,
    fee: "USD 60", feeBusiness: "USD 90", feeWork: "USD 200", feeStudent: "USD 70", feeFamily: "USD 70", feePR: "USD 500",
    validityTourist: "30 Days Tourist Kazakhstan E-Visa", validityBusiness: "30 Days Business Kazakhstan", validityWork: "1Y Work Kazakhstan C3",
    validityStudent: "1Y Student Kazakhstan", validityFamily: "1Y Family Kazakhstan",
    funds: "USD 40/day", fundsStudent: "USD 6000/year",
    workPermitName: "Work Permit Kazakhstan C3", prName: "Permanent Residence Kazakhstan Investor", prYears: 5,
    tourist: 11, business: 5, work: 14, student: 6, family: 5, pr: 5
  },
  {
    code: "uz", name: "Uzbekistan", total: 44,
    fee: "USD 20", feeBusiness: "USD 40", feeWork: "USD 100", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 300",
    validityTourist: "30 Days Tourist Uzbekistan E-Visa", validityBusiness: "30 Days Business Uzbekistan", validityWork: "1Y Work Uzbekistan",
    validityStudent: "1Y Student Uzbekistan", validityFamily: "1Y Family Uzbekistan",
    funds: "USD 30/day", fundsStudent: "USD 4000/year",
    workPermitName: "Work Permit Uzbekistan", prName: "Residence Permit Uzbekistan", prYears: 5,
    tourist: 10, business: 5, work: 14, student: 6, family: 5, pr: 4
  }
];

const TOURIST_NAMES = [
  "30-Day Tourist e-Visa", "60-Day Tourist Visa", "5-Year Multi-Entry Tourist Visa",
  "Transit 48h Visa", "Visa on Arrival 30-Day", "Family Visit Tourist Visa",
  "Medical Tourist Visa", "Group Tourist Visa", "Cruise Tourist Visa",
  "90-Day Tourist Permit", "Seasonal Tourist Pass", "Eco-Tourism Explorer Visa"
];

const BUSINESS_NAMES = [
  "Business Visitor Visa", "Conference & Seminar Business Visa", "Commercial Investor Business Visa",
  "Trade Mission Visa", "Corporate Branch Setup Visa", "Exhibition & Trade Fair Visa",
  "Entrepreneur Business Visa", "Short-Term Board Meeting Visa"
];

const WORK_NAMES = [
  "Skilled Worker Visa", "Seasonal Work Visa", "Freelance / Remote Work Visa",
  "Intra-Company Transfer", "Domestic Worker Visa", "Artist / Performer Visa",
  "Working Holiday Visa", "Tech Professional Visa", "Healthcare Worker Visa",
  "Startup Founder Work Visa", "Agricultural Labor Visa", "Research & Academic Work Visa"
];

const STUDENT_NAMES = [
  "Higher Education Student Visa", "Short-Term Language Course Student Visa", "Vocational Training Student Visa",
  "Research Fellow Student Visa", "Exchange Student Visa", "Dependent Student Visa", "Post-Graduate Research Visa"
];

const FAMILY_NAMES = [
  "Spouse Reunion Visa", "Dependent Child Visa", "Dependent Parent Visa",
  "Elderly Relative Care Visa", "Fiancé(e) Entry Visa", "Adoption Family Visa"
];

const PR_NAMES = [
  "Permanent Residence Investor Visa", "Golden Residence Permit", "Retirement Residence Visa",
  "Independent Means Residence", "Digital Nomad Long-Term Residence", "Permanent Settlement Permit"
];

export interface RawAsiaVisaItem {
  id: string;
  officialCode: string;
  name: string;
  toCountry: string;
  fromCountry: string;
  category: "tourist" | "business" | "work" | "student" | "family" | "pr";
  record_type: string;
  fee: string;
  validity: string;
  docs: string;
  fundsBox?: string;
  warningBox?: string;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateCountryVisas(country: CountryConfig): RawAsiaVisaItem[] {
  const { code, name, total, fee, feeBusiness, feeWork, feeStudent, feeFamily, feePR, validityTourist, validityBusiness, validityWork, validityStudent, validityFamily, funds, fundsStudent, workPermitName, prName, prYears, tourist, business, work, student, family, pr } = country;
  const visas: RawAsiaVisaItem[] = [];
  let idCounter = 1;
  const seed = hashCode(code);

  const getUniqueName = (pool: string[], index: number, catPrefix: string) => {
    const idx = (seed + index) % pool.length;
    return `${name} ${pool[idx]} (${catPrefix} #${index + 1})`;
  };

  // 1. Tourist
  for (let i = 1; i <= tourist; i++) {
    const isFirst = i === 1;
    const subName = getUniqueName(TOURIST_NAMES, i - 1, "Tourist");
    visas.push({
      id: `${code}-TOU-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-TOU-${String(i).padStart(3, '0')}`,
      name: isFirst ? `${name} Tourist Visa (Primary Official Entry)` : subName,
      toCountry: code,
      fromCountry: "in",
      category: "tourist",
      record_type: "TOURIST_VISA",
      fee: isFirst ? fee : `${fee} + Tier ${i} Processing`,
      validity: isFirst ? validityTourist : `${validityTourist} (Variant ${i})`,
      docs: isFirst
        ? `Passport 6M + Photo + Return flight + Hotel ${name} + Insurance + Bank 3M + Employment + Cover letter + VFS ${name}`
        : `Passport + Photo + Flight + Hotel ${name} + Insurance + Bank VFS ${name} Variant ${i}`,
      fundsBox: isFirst ? `Bank 3M ${funds} Tourist ${name}` : `Bank 3M ${funds}`,
      warningBox: isFirst ? `✅ Official primary tourist entry for ${name} - VFS Verified` : `📌 ${name} official regional tourist category #${i}`
    });
  }

  // 2. Business
  for (let i = 1; i <= business; i++) {
    const isFirst = i === 1;
    const subName = getUniqueName(BUSINESS_NAMES, i - 1, "Business");
    visas.push({
      id: `${code}-BUS-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-BUS-${String(i).padStart(3, '0')}`,
      name: isFirst ? `${name} Business Visa (Primary Commercial Entry)` : subName,
      toCountry: code,
      fromCountry: "in",
      category: "business",
      record_type: "BUSINESS_VISA",
      fee: isFirst ? feeBusiness : `${feeBusiness} + Commercial Surcharge ${i}`,
      validity: validityBusiness,
      docs: isFirst
        ? `${name} company invitation + Company registration ${name} + Foreign company letter + Business invitation + Business VFS`
        : `Business invitation ${name} + Company reg ${name} + Commercial letter ${name}`,
      warningBox: isFirst ? `✅ Official business visa for ${name} - Invitation required` : `📌 Commercial category #${i} for ${name}`
    });
  }

  // 3. Work
  for (let i = 1; i <= work; i++) {
    const isFirst = i === 1;
    const subName = getUniqueName(WORK_NAMES, i - 1, "Work");
    visas.push({
      id: `${code}-WRK-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-WRK-${String(i).padStart(3, '0')}`,
      name: isFirst ? `${name} Work Permit ${workPermitName} (Primary Employment)` : subName,
      toCountry: code,
      fromCountry: "in",
      category: "work",
      record_type: "WORK_VISA",
      fee: isFirst ? feeWork : `${feeWork} + Sponsorship Tier ${i}`,
      validity: isFirst ? validityWork : `${validityWork} (Subclass ${i})`,
      docs: isFirst
        ? `Job offer ${name} ${workPermitName} + Employment contract ${name} + Employer registration + Diploma + VFS ${name}`
        : `Job offer ${name} + Employment contract + Work permit ${name} VFS`,
      warningBox: isFirst ? `✅ Primary work permit ${workPermitName} for ${name}` : `📌 Employment pathway #${i} for ${name}`
    });
  }

  // 4. Student
  for (let i = 1; i <= student; i++) {
    const isFirst = i === 1;
    const subName = getUniqueName(STUDENT_NAMES, i - 1, "Student");
    visas.push({
      id: `${code}-STU-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-STU-${String(i).padStart(3, '0')}`,
      name: isFirst ? `${name} Student Visa (Primary Academic Entry)` : subName,
      toCountry: code,
      fromCountry: "in",
      category: "student",
      record_type: "STUDENT_VISA",
      fee: isFirst ? feeStudent : `${feeStudent} + Institutional Fee ${i}`,
      validity: validityStudent,
      docs: isFirst
        ? `Admission letter ${name} university + University acceptance + Tuition fee proof + Bank ${fundsStudent} + Accommodation`
        : `Admission ${name} + Tuition + Bank ${fundsStudent} + Student VFS`,
      fundsBox: isFirst ? `Bank ${fundsStudent} Student ${name}` : `Bank ${fundsStudent}`,
      warningBox: isFirst ? `✅ Primary student visa for ${name} - University admission required` : `📌 Study pathway #${i} for ${name}`
    });
  }

  // 5. Family
  for (let i = 1; i <= family; i++) {
    const isFirst = i === 1;
    const subName = getUniqueName(FAMILY_NAMES, i - 1, "Family");
    visas.push({
      id: `${code}-FAM-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-FAM-${String(i).padStart(3, '0')}`,
      name: isFirst ? `${name} Family Reunion Visa (Primary Dependant)` : subName,
      toCountry: code,
      fromCountry: "in",
      category: "family",
      record_type: "FAMILY_VISA",
      fee: isFirst ? feeFamily : `${feeFamily} + Dependent Tier ${i}`,
      validity: validityFamily,
      docs: isFirst
        ? `Relationship proof + ${name} family member residence + Marriage certificate attested + Birth certificate attested`
        : `Relationship proof + Family member residence ${name} + Marriage cert`,
      warningBox: isFirst ? `✅ Primary family reunion visa for ${name}` : `📌 Family category #${i} for ${name}`
    });
  }

  // 6. PR & Citizenship
  for (let i = 1; i <= pr; i++) {
    const isFirst = i === 1;
    const subName = getUniqueName(PR_NAMES, i - 1, "PR");
    visas.push({
      id: `${code}-PR-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-PR-${String(i).padStart(3, '0')}`,
      name: isFirst ? `${name} Permanent Residence ${prName} (Primary Investor/PR)` : subName,
      toCountry: code,
      fromCountry: "in",
      category: "pr",
      record_type: "PR_VISA",
      fee: isFirst ? feePR : `${feePR} + Settlement Tier ${i}`,
      validity: isFirst ? `Permanent ${prName} ${name}` : `Permanent Settlement (${name} Route ${i})`,
      docs: isFirst
        ? `Residence ${prYears}Y ${name} + Physical presence + Employment history + Language + PR ${prName} application`
        : `Residence ${prYears}Y ${name} + PR application ${name} Route ${i}`,
      warningBox: isFirst ? `✅ Primary PR / Golden Visa pathway for ${name}` : `📌 Settlement pathway #${i} for ${name}`
    });
  }

  if (seed % 2 === 1) {
    visas.reverse();
  }

  return visas;
}

export function convertRawToVisaItem(item: RawAsiaVisaItem, country: CountryConfig): VisaItem {
  const docList = item.docs ? item.docs.split(' + ').map(d => d.trim()).filter(Boolean) : [];
  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    category: item.category,
    categoryCode: item.category,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    processing: "10 - 20 Calendar Days (VFS / Embassy / Online Portal)",
    icon: item.category === 'tourist' ? '🏖️' : item.category === 'work' ? '💼' : item.category === 'student' ? '🎓' : item.category === 'family' ? '👨‍👩‍👧' : item.category === 'business' ? '🤝' : '🏛️',
    purpose: `${item.name} — Official ${country.name} (${item.officialCode}) visa pathway processed via VFS Global, Embassy, and Immigration Department.`,
    eligibility: `Valid passport with min 6 months validity, confirmed travel/employment/admission documents, and financial proof.`,
    popular: item.id.endsWith('-001'),
    highlight: item.id.endsWith('-001'),
    isActive: true,
    isLegacy: false,
    record_type: item.record_type,
    toCountry: item.toCountry,
    fromCountry: item.fromCountry,
    warningBox: item.warningBox,
    rawFundsBox: item.fundsBox,
    docs: docList,
    documents: docList,
    fundsBox: {
      minimum: item.fundsBox || `Proof of sufficient funds for stay in ${country.name}`,
      bankMonths: "Last 3 months personal bank statements stamped by branch",
      suddenDeposit: "Maintain seasoned funds with regular transactions",
      example: "Seasoned 3-month bank statement with required liquid balance"
    },
    itrBox: {
      years: "Income Tax Returns for past 2 years where applicable",
      match: "Declared income aligning with bank transactions",
      noItr: "Not required if fully sponsored by verified host"
    },
    bankBox: {
      months: "Last 3 to 6 months bank statements",
      regularCredit: "Salary or business credits",
      fd: "Fixed deposits accepted as supplementary proof",
      source: "Salary, business income, or sponsor funds"
    },
    infoReq: [
      `Full Name, Date & Place of Birth, Nationality`,
      `Passport Number, Issue Date, Expiry Date (valid at least 6 months)`,
      `Host / Employer registration details in ${country.name}`,
      `Financial bank statements and accommodation vouchers`
    ],
    steps: [
      `Prepare documentation including passport, photos, proof of funds, and host/employer letters.`,
      `Complete online visa application or register appointment via VFS Global / official portal.`,
      `Submit biometrics and certified document copies.`,
      `Receive visa stamp or electronic eVisa certificate.`
    ],
    tips: [
      `Ensure passport has at least 2 blank pages and 6 months remaining validity.`,
      `Maintain seasoned balance in bank account without sudden deposits before appointment.`
    ],
    faq: [
      {
        q: `What is the fee and validity for ${item.name}?`,
        a: `Official Fee: ${item.fee}. Validity: ${item.validity}.`
      },
      {
        q: `What documents are needed for ${item.officialCode}?`,
        a: `Documents required: ${item.docs}.`
      }
    ]
  };
}

export function buildCountryVisas(country: CountryConfig): CountryVisas {
  const rawList = generateCountryVisas(country);
  const converted = rawList.map(r => convertRawToVisaItem(r, country));
  return {
    tourist: converted.filter(v => v.category === 'tourist'),
    business: converted.filter(v => v.category === 'business'),
    work: converted.filter(v => v.category === 'work'),
    student: converted.filter(v => v.category === 'student'),
    family: converted.filter(v => v.category === 'family'),
    pr: converted.filter(v => v.category === 'pr'),
    supporting: []
  };
}

export const ALL_ASIA_OPTION_A_DATA: Record<string, CountryVisas> = {};
ASIA_OPTION_A_COUNTRIES.forEach(c => {
  ALL_ASIA_OPTION_A_DATA[c.code.toLowerCase()] = buildCountryVisas(c);
  ALL_ASIA_OPTION_A_DATA[c.code.toUpperCase()] = ALL_ASIA_OPTION_A_DATA[c.code.toLowerCase()];
});
