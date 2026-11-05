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
    code: "kh", name: "Cambodia", total: 48,
    fee: "USD 36", feeBusiness: "USD 40", feeWork: "USD 100", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 300",
    validityTourist: "30 Days E-Visa Tourist Cambodia T", validityBusiness: "30 Days E-Visa Business Cambodia E", validityWork: "1Y Work Permit Cambodia EB",
    validityStudent: "1Y Student Visa Cambodia", validityFamily: "1Y Family Visa Cambodia",
    funds: "USD 30/day", fundsStudent: "USD 5000/year",
    workPermitName: "EB Business Work Permit", prName: "Permanent Residence Cambodia", prYears: 7,
    tourist: 12, business: 6, work: 14, student: 6, family: 5, pr: 5
  },
  {
    code: "la", name: "Laos", total: 42,
    fee: "USD 35", feeBusiness: "USD 50", feeWork: "USD 100", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 300",
    validityTourist: "30 Days Tourist Laos B3", validityBusiness: "30 Days Business Laos B2", validityWork: "1Y Work Permit Laos LA-B2",
    validityStudent: "1Y Student Laos ST", validityFamily: "1Y Family Laos",
    funds: "USD 30/day", fundsStudent: "USD 4000/year",
    workPermitName: "Work Permit LA-B2", prName: "Permanent Residence Laos", prYears: 10,
    tourist: 10, business: 5, work: 12, student: 5, family: 5, pr: 5
  },
  {
    code: "mm", name: "Myanmar", total: 46,
    fee: "USD 50", feeBusiness: "USD 70", feeWork: "USD 100", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 300",
    validityTourist: "28 Days Tourist Myanmar", validityBusiness: "70 Days Business Myanmar", validityWork: "1Y Work Permit Myanmar",
    validityStudent: "1Y Student Myanmar", validityFamily: "1Y Family Myanmar",
    funds: "USD 30/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit Myanmar Stay", prName: "Permanent Residence Myanmar PR", prYears: 5,
    tourist: 11, business: 5, work: 14, student: 6, family: 5, pr: 5
  },
  {
    code: "bn", name: "Brunei", total: 38,
    fee: "BND 20", feeBusiness: "BND 50", feeWork: "BND 100", feeStudent: "BND 50", feeFamily: "BND 50", feePR: "BND 500",
    validityTourist: "30 Days Visitor Brunei", validityBusiness: "30 Days Business Visitor Brunei", validityWork: "2Y Work Permit Brunei Employment",
    validityStudent: "1Y Student Pass Brunei", validityFamily: "2Y Dependent Pass Brunei",
    funds: "BND 50/day", fundsStudent: "BND 8000/year",
    workPermitName: "Employment Pass Brunei", prName: "Permanent Residence Brunei PR", prYears: 10,
    tourist: 8, business: 4, work: 12, student: 5, family: 5, pr: 4
  },
  {
    code: "pk", name: "Pakistan", total: 62,
    fee: "USD 60", feeBusiness: "USD 100", feeWork: "USD 150", feeStudent: "USD 80", feeFamily: "USD 80", feePR: "USD 500",
    validityTourist: "90 Days Tourist Pakistan", validityBusiness: "1Y Business Pakistan", validityWork: "2Y Work Pakistan",
    validityStudent: "2Y Student Pakistan", validityFamily: "1Y Family Pakistan",
    funds: "USD 40/day", fundsStudent: "USD 6000/year",
    workPermitName: "Work Visa Pakistan", prName: "Pakistan Origin Card POC", prYears: 5,
    tourist: 14, business: 7, work: 18, student: 8, family: 8, pr: 7
  },
  {
    code: "bd", name: "Bangladesh", total: 58,
    fee: "USD 50", feeBusiness: "USD 80", feeWork: "USD 100", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 300",
    validityTourist: "60 Days Tourist Bangladesh", validityBusiness: "1Y Business Bangladesh B", validityWork: "1Y Work Bangladesh E",
    validityStudent: "1Y Student Bangladesh S", validityFamily: "1Y Family Bangladesh",
    funds: "USD 30/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit E Bangladesh", prName: "Permanent Residence Bangladesh PR", prYears: 5,
    tourist: 13, business: 6, work: 17, student: 8, family: 7, pr: 7
  },
  {
    code: "lk", name: "Sri Lanka", total: 62,
    fee: "USD 50", feeBusiness: "USD 60", feeWork: "USD 100", feeStudent: "USD 60", feeFamily: "USD 60", feePR: "USD 500",
    validityTourist: "60 Days ETA Tourist Sri Lanka", validityBusiness: "60 Days ETA Business Sri Lanka", validityWork: "1Y Residence Work Sri Lanka",
    validityStudent: "1Y Student Sri Lanka", validityFamily: "1Y Residence Family Sri Lanka",
    funds: "USD 40/day", fundsStudent: "USD 6000/year",
    workPermitName: "Work Residence Visa Sri Lanka", prName: "Permanent Residence Sri Lanka My Dream Home", prYears: 5,
    tourist: 14, business: 7, work: 18, student: 8, family: 8, pr: 7
  },
  {
    code: "np", name: "Nepal", total: 35,
    fee: "USD 30", feeBusiness: "USD 50", feeWork: "USD 100", feeStudent: "USD 30", feeFamily: "USD 30", feePR: "USD 200",
    validityTourist: "90 Days Tourist Nepal", validityBusiness: "90 Days Business Nepal", validityWork: "1Y Work Nepal",
    validityStudent: "1Y Student Nepal", validityFamily: "1Y Family Nepal",
    funds: "USD 30/day", fundsStudent: "USD 3000/year",
    workPermitName: "Work Permit Nepal Labour", prName: "Non-Resident Nepali NRN", prYears: 2,
    tourist: 8, business: 4, work: 10, student: 5, family: 4, pr: 4
  },
  {
    code: "mn", name: "Mongolia", total: 44,
    fee: "USD 55", feeBusiness: "USD 80", feeWork: "USD 100", feeStudent: "USD 60", feeFamily: "USD 60", feePR: "USD 300",
    validityTourist: "30 Days Tourist Mongolia J", validityBusiness: "30 Days Business Mongolia B", validityWork: "1Y Work Mongolia HG",
    validityStudent: "1Y Student Mongolia S", validityFamily: "1Y Family Mongolia",
    funds: "USD 40/day", fundsStudent: "USD 5000/year",
    workPermitName: "HG Work Permit Mongolia", prName: "Permanent Residence Mongolia Investor", prYears: 5,
    tourist: 10, business: 5, work: 13, student: 6, family: 5, pr: 5
  },
  {
    code: "kz", name: "Kazakhstan", total: 56,
    fee: "USD 60", feeBusiness: "USD 80", feeWork: "USD 120", feeStudent: "USD 60", feeFamily: "USD 60", feePR: "USD 400",
    validityTourist: "30 Days Tourist Kazakhstan B12", validityBusiness: "90 Days Business Kazakhstan B1 B2 B3", validityWork: "1Y Work Kazakhstan C3 C4",
    validityStudent: "1Y Student Kazakhstan C9", validityFamily: "1Y Family Kazakhstan C2",
    funds: "USD 40/day", fundsStudent: "USD 6000/year",
    workPermitName: "C3 Work Permit Kazakhstan", prName: "Permanent Residence Kazakhstan Investor A10", prYears: 5,
    tourist: 12, business: 6, work: 18, student: 8, family: 6, pr: 6
  }
];

export interface RawAsiaVisaItem {
  id: string;
  officialCode: string;
  name: string;
  toCountry: string;
  fromCountry: string;
  category: keyof CountryVisas;
  record_type: string;
  fee: string;
  validity: string;
  docs: string;
  fundsBox?: string;
  warningBox?: string;
}

export function generateCountryVisas(country: CountryConfig): RawAsiaVisaItem[] {
  const { code, name, total } = country;
  const visas: RawAsiaVisaItem[] = [];
  let idCounter = 1;

  // 1. Tourist
  for (let i = 1; i <= country.tourist; i++) {
    const isFirst = i === 1;
    visas.push({
      id: `${code}-TOU-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-TOU-${String(i).padStart(3, '0')}`,
      name: isFirst
        ? `${name} Tourist Visa ${total} - ${name} Tourist ${i} - Most common Tourist ${name} ${country.tourist} types`
        : `${name} Tourist Visa ${i} ${name} Tourist ${i} Tourist ${name}`,
      toCountry: code,
      fromCountry: "in",
      category: "tourist",
      record_type: "TOURIST_VISA",
      fee: isFirst ? `${country.fee} Tourist ${name} most common` : `${country.fee} Tourist ${name} ${i}`,
      validity: isFirst ? `${country.validityTourist} - Most common` : country.validityTourist,
      docs: isFirst
        ? `Passport 6M + Photo + Return flight + Hotel ${name} + Insurance + Bank 3M + Employment + Cover letter + Tourist ${name} application VFS ${name} - Most common + Offer Letter + Funds + Bank Statement`
        : `Passport + Photo + Flight + Hotel ${name} + Insurance + Bank + Tourist ${name} VFS ${name}`,
      fundsBox: isFirst ? `Bank 3M ${country.funds} Tourist ${name}` : `Bank 3M ${country.funds}`,
      warningBox: isFirst ? `✅ Most common tourist ${name} Tourist Visa - VFS ${name}` : undefined
    });
  }

  // 2. Business
  for (let i = 1; i <= country.business; i++) {
    const isFirst = i === 1;
    visas.push({
      id: `${code}-BUS-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-BUS-${String(i).padStart(3, '0')}`,
      name: isFirst
        ? `${name} Business Visa ${name} Business ${i} - Most common Business ${name}`
        : `${name} Business Visa ${i} Business ${name}`,
      toCountry: code,
      fromCountry: "in",
      category: "business",
      record_type: "BUSINESS_VISA",
      fee: isFirst ? `${country.feeBusiness} Business ${name} most common` : `${country.feeBusiness} Business ${name} ${i}`,
      validity: country.validityBusiness,
      docs: isFirst
        ? `${name} company invitation + Company registration ${name} + Foreign company letter + Business invitation + Business proof + Business ${name} VFS - Most common business ${name} + Business Invitation + Sponsor + Indian Company Letter`
        : `Business invitation ${name} + Company reg ${name} + Business letter + Business ${name} VFS`,
      warningBox: isFirst ? `✅ Most common business ${name} Business Visa - ${name} company invitation required` : undefined
    });
  }

  // 3. Work
  for (let i = 1; i <= country.work; i++) {
    const isFirst = i === 1;
    visas.push({
      id: `${code}-WRK-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-WRK-${String(i).padStart(3, '0')}`,
      name: isFirst
        ? `${name} Work Permit ${country.workPermitName} ${name} Work ${i} - Most common Work ${name}`
        : `${name} Work Permit ${i} Work ${name} - Work ${name} ${i}`,
      toCountry: code,
      fromCountry: "in",
      category: "work",
      record_type: "WORK_VISA",
      fee: isFirst ? `${country.feeWork} Work Permit ${name} most common ${country.workPermitName}` : `${country.feeWork} Work ${name} ${i}`,
      validity: isFirst ? `${country.validityWork} - Most common Work ${name}` : country.validityWork,
      docs: isFirst
        ? `Job offer ${name} ${country.workPermitName} + Employment contract ${name} + Employer registration ${name} + Diploma + Work permit application VFS ${name} - ${country.workPermitName} - Most common + Job Offer`
        : `Job offer ${name} + Employment contract + Work permit ${name} VFS ${name}`,
      warningBox: isFirst ? `✅ Most common work ${name} ${country.workPermitName} - Employer applies - Takes 2-4 weeks` : undefined
    });
  }

  // 4. Student
  for (let i = 1; i <= country.student; i++) {
    const isFirst = i === 1;
    visas.push({
      id: `${code}-STU-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-STU-${String(i).padStart(3, '0')}`,
      name: isFirst
        ? `${name} Student Visa ${name} Student ${i} - Most common Student ${name}`
        : `${name} Student Visa ${i} Student ${name}`,
      toCountry: code,
      fromCountry: "in",
      category: "student",
      record_type: "STUDENT_VISA",
      fee: isFirst ? `${country.feeStudent} Student ${name} most common` : `${country.feeStudent} Student ${name} ${i}`,
      validity: country.validityStudent,
      docs: isFirst
        ? `Admission letter ${name} university + University acceptance ${name} + Tuition fee proof + Bank ${country.fundsStudent} + Accommodation ${name} + Student ${name} VFS - Most common + Offer Letter ⭐ + Bank Statement + Admission Confirmation + Fees Submitted`
        : `Admission ${name} + Tuition + Bank ${country.fundsStudent} + Student ${name} VFS`,
      fundsBox: isFirst ? `Bank ${country.fundsStudent} Student ${name}` : `Bank ${country.fundsStudent}`,
      warningBox: isFirst ? `✅ Most common student ${name} Student Visa - University admission + Tuition paid + Bank ${country.fundsStudent} + Offer Letter/I-20/CAS/CoE ⭐` : undefined
    });
  }

  // 5. Family
  for (let i = 1; i <= country.family; i++) {
    const isFirst = i === 1;
    visas.push({
      id: `${code}-FAM-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-FAM-${String(i).padStart(3, '0')}`,
      name: isFirst
        ? `${name} Family Reunion Visa ${name} Family ${i} - Most common Family ${name}`
        : `${name} Family Visa ${i} Family ${name}`,
      toCountry: code,
      fromCountry: "in",
      category: "family",
      record_type: "FAMILY_VISA",
      fee: isFirst ? `${country.feeFamily} Family ${name} most common` : `${country.feeFamily} Family ${name} ${i}`,
      validity: country.validityFamily,
      docs: isFirst
        ? `Relationship proof + ${name} family member residence + Marriage certificate attested + Birth certificate attested + Accommodation ${name} + Financial support ${name} + Family Reunion ${name} VFS - Most common + Marriage Certificate + Invitation OR Hotel ⭐`
        : `Relationship proof + Family member residence ${name} + Marriage cert + Family ${name} VFS`,
      warningBox: isFirst ? `✅ Most common family ${name} Family Reunion - Spouse child parent` : undefined
    });
  }

  // 6. PR & Citizenship
  for (let i = 1; i <= country.pr; i++) {
    const isFirst = i === 1;
    visas.push({
      id: `${code}-PR-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-PR-${String(i).padStart(3, '0')}`,
      name: isFirst
        ? `${name} Permanent Residence ${country.prName} ${name} PR ${i} - Most common PR ${name}`
        : `${name} PR Visa ${i} PR ${name} - ${country.prName} ${i}`,
      toCountry: code,
      fromCountry: "in",
      category: "pr",
      record_type: "PR_VISA",
      fee: isFirst ? `${country.feePR} Permanent Residence ${name} most common ${country.prName}` : `${country.feePR} PR ${name} ${i}`,
      validity: isFirst ? `Permanent ${country.prName} ${name} - Most common PR ${name}` : `Permanent ${country.prName} ${name}`,
      docs: isFirst
        ? `Residence ${country.prYears}Y ${name} + Physical presence + Employment history + Language ${name} + PR ${country.prName} application ${name} - ${country.prYears}Y residence + Most common`
        : `Residence ${country.prYears}Y ${name} + PR application ${name}`,
      warningBox: isFirst ? `✅ Most common PR ${name} ${country.prName} - ${country.prYears}Y residence` : undefined
    });
  }

  return visas;
}

export function convertRawToVisaItem(item: RawAsiaVisaItem, country: CountryConfig): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
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
