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

export const OPTION_B_COUNTRIES: CountryConfig[] = [
  // MIDDLE EAST 5
  {
    code: "om", name: "Oman", total: 64,
    fee: "OMR 20", feeBusiness: "OMR 30", feeWork: "OMR 100", feeStudent: "OMR 30", feeFamily: "OMR 30", feePR: "OMR 500",
    validityTourist: "30 Days Tourist Oman E-Visa", validityBusiness: "30 Days Business Oman E-Visa", validityWork: "2Y Work Oman Employment",
    validityStudent: "1Y Student Oman", validityFamily: "2Y Family Joining Oman",
    funds: "OMR 20/day", fundsStudent: "OMR 3000/year",
    workPermitName: "Employment Visa Oman", prName: "Investor Residence Oman Golden Visa", prYears: 10,
    tourist: 15, business: 7, work: 20, student: 8, family: 7, pr: 7
  },
  {
    code: "kw", name: "Kuwait", total: 62,
    fee: "KWD 10", feeBusiness: "KWD 20", feeWork: "KWD 50", feeStudent: "KWD 20", feeFamily: "KWD 20", feePR: "KWD 300",
    validityTourist: "90 Days Tourist Kuwait E-Visa", validityBusiness: "90 Days Business Kuwait", validityWork: "1Y Work Kuwait Iqama",
    validityStudent: "1Y Student Kuwait", validityFamily: "1Y Family Kuwait",
    funds: "KWD 10/day", fundsStudent: "KWD 2000/year",
    workPermitName: "Work Iqama Kuwait Amal", prName: "Premium Residence Kuwait", prYears: 15,
    tourist: 14, business: 6, work: 20, student: 8, family: 7, pr: 7
  },
  {
    code: "bh", name: "Bahrain", total: 60,
    fee: "BHD 15", feeBusiness: "BHD 25", feeWork: "BHD 60", feeStudent: "BHD 25", feeFamily: "BHD 25", feePR: "BHD 300",
    validityTourist: "30 Days Tourist Bahrain E-Visa", validityBusiness: "30 Days Business Bahrain E-Visa", validityWork: "2Y Work Bahrain Work Permit",
    validityStudent: "1Y Student Bahrain", validityFamily: "1Y Family Bahrain",
    funds: "BHD 15/day", fundsStudent: "BHD 2000/year",
    workPermitName: "Work Permit Bahrain LMRA", prName: "Golden Residency Bahrain", prYears: 10,
    tourist: 14, business: 6, work: 18, student: 8, family: 7, pr: 7
  },
  {
    code: "jo", name: "Jordan", total: 58,
    fee: "JOD 40", feeBusiness: "JOD 60", feeWork: "JOD 100", feeStudent: "JOD 50", feeFamily: "JOD 50", feePR: "JOD 300",
    validityTourist: "90 Days Tourist Jordan", validityBusiness: "90 Days Business Jordan", validityWork: "1Y Work Jordan",
    validityStudent: "1Y Student Jordan", validityFamily: "1Y Family Jordan",
    funds: "JOD 30/day", fundsStudent: "JOD 3000/year",
    workPermitName: "Work Permit Jordan", prName: "Investor Residence Jordan", prYears: 5,
    tourist: 13, business: 6, work: 17, student: 8, family: 7, pr: 7
  },
  {
    code: "lb", name: "Lebanon", total: 52,
    fee: "LBP 100000", feeBusiness: "LBP 200000", feeWork: "LBP 500000", feeStudent: "LBP 200000", feeFamily: "LBP 200000", feePR: "LBP 2000000",
    validityTourist: "30 Days Tourist Lebanon", validityBusiness: "90 Days Business Lebanon", validityWork: "1Y Work Lebanon",
    validityStudent: "1Y Student Lebanon", validityFamily: "1Y Family Lebanon",
    funds: "USD 50/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit Lebanon", prName: "Permanent Residence Lebanon", prYears: 5,
    tourist: 12, business: 5, work: 15, student: 7, family: 6, pr: 7
  },
  // AFRICA 10
  {
    code: "eg", name: "Egypt", total: 72,
    fee: "USD 25", feeBusiness: "USD 60", feeWork: "USD 150", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 500",
    validityTourist: "90 Days Tourist Egypt E-Visa", validityBusiness: "90 Days Business Egypt", validityWork: "1Y Work Egypt",
    validityStudent: "1Y Student Egypt", validityFamily: "1Y Family Egypt",
    funds: "USD 40/day", fundsStudent: "USD 6000/year",
    workPermitName: "Work Permit Egypt", prName: "Egypt Residence by Investment", prYears: 5,
    tourist: 16, business: 7, work: 22, student: 10, family: 9, pr: 8
  },
  {
    code: "ma", name: "Morocco", total: 62,
    fee: "MAD 300", feeBusiness: "MAD 500", feeWork: "MAD 1000", feeStudent: "MAD 400", feeFamily: "MAD 400", feePR: "MAD 3000",
    validityTourist: "90 Days Tourist Morocco", validityBusiness: "90 Days Business Morocco", validityWork: "1Y Work Morocco",
    validityStudent: "1Y Student Morocco", validityFamily: "1Y Family Morocco",
    funds: "MAD 300/day", fundsStudent: "MAD 30000/year",
    workPermitName: "Work Permit Morocco ANAPEC", prName: "Residence Card Morocco 10Y", prYears: 4,
    tourist: 14, business: 6, work: 18, student: 9, family: 8, pr: 7
  },
  {
    code: "ke", name: "Kenya", total: 68,
    fee: "USD 51", feeBusiness: "USD 100", feeWork: "USD 500", feeStudent: "USD 100", feeFamily: "USD 100", feePR: "USD 1000",
    validityTourist: "90 Days Tourist Kenya E-Visa", validityBusiness: "90 Days Business Kenya", validityWork: "2Y Work Kenya Class D",
    validityStudent: "1Y Student Kenya Pupil Pass", validityFamily: "1Y Dependent Kenya Class K",
    funds: "USD 40/day", fundsStudent: "USD 6000/year",
    workPermitName: "Work Permit Class D Kenya", prName: "Permanent Residence Kenya", prYears: 7,
    tourist: 15, business: 6, work: 20, student: 10, family: 9, pr: 8
  },
  {
    code: "ng", name: "Nigeria", total: 65,
    fee: "USD 160", feeBusiness: "USD 200", feeWork: "USD 400", feeStudent: "USD 150", feeFamily: "USD 150", feePR: "USD 1000",
    validityTourist: "90 Days Tourist Nigeria", validityBusiness: "90 Days Business Nigeria", validityWork: "2Y Work Nigeria CERPAC",
    validityStudent: "1Y Student Nigeria", validityFamily: "1Y Family Nigeria",
    funds: "USD 50/day", fundsStudent: "USD 8000/year",
    workPermitName: "CERPAC Work Nigeria", prName: "Permanent Residence Nigeria CERPAC Green", prYears: 5,
    tourist: 14, business: 6, work: 19, student: 9, family: 9, pr: 8
  },
  {
    code: "gh", name: "Ghana", total: 58,
    fee: "USD 100", feeBusiness: "USD 150", feeWork: "USD 300", feeStudent: "USD 100", feeFamily: "USD 100", feePR: "USD 500",
    validityTourist: "60 Days Tourist Ghana", validityBusiness: "60 Days Business Ghana", validityWork: "1Y Work Ghana",
    validityStudent: "1Y Student Ghana", validityFamily: "1Y Residence Ghana",
    funds: "USD 40/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit Ghana GIPC", prName: "Permanent Residence Ghana Indefinite", prYears: 5,
    tourist: 13, business: 6, work: 17, student: 8, family: 7, pr: 7
  },
  {
    code: "et", name: "Ethiopia", total: 62,
    fee: "USD 82", feeBusiness: "USD 100", feeWork: "USD 200", feeStudent: "USD 80", feeFamily: "USD 80", feePR: "USD 400",
    validityTourist: "90 Days Tourist Ethiopia E-Visa", validityBusiness: "90 Days Business Ethiopia", validityWork: "1Y Work Ethiopia",
    validityStudent: "1Y Student Ethiopia", validityFamily: "1Y Family Ethiopia",
    funds: "USD 30/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit Ethiopia", prName: "Investment Permit Ethiopia", prYears: 5,
    tourist: 14, business: 6, work: 18, student: 9, family: 8, pr: 7
  },
  {
    code: "tz", name: "Tanzania", total: 60,
    fee: "USD 50", feeBusiness: "USD 100", feeWork: "USD 500", feeStudent: "USD 100", feeFamily: "USD 100", feePR: "USD 1000",
    validityTourist: "90 Days Tourist Tanzania", validityBusiness: "90 Days Business Tanzania", validityWork: "2Y Work Tanzania Class B",
    validityStudent: "1Y Student Tanzania Class C", validityFamily: "1Y Dependent Tanzania Class L",
    funds: "USD 40/day", fundsStudent: "USD 6000/year",
    workPermitName: "Work Permit Class B Tanzania", prName: "Residence Permit Class A Investor Tanzania", prYears: 5,
    tourist: 13, business: 6, work: 18, student: 8, family: 8, pr: 7
  },
  {
    code: "ug", name: "Uganda", total: 56,
    fee: "USD 50", feeBusiness: "USD 100", feeWork: "USD 250", feeStudent: "USD 100", feeFamily: "USD 100", feePR: "USD 500",
    validityTourist: "90 Days Tourist Uganda", validityBusiness: "90 Days Business Uganda", validityWork: "2Y Work Uganda Class G",
    validityStudent: "1Y Student Uganda Class F", validityFamily: "1Y Dependent Uganda",
    funds: "USD 30/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit Class G Uganda", prName: "Permanent Residence Uganda", prYears: 10,
    tourist: 12, business: 5, work: 17, student: 8, family: 7, pr: 7
  },
  {
    code: "rw", name: "Rwanda", total: 52,
    fee: "USD 50", feeBusiness: "USD 60", feeWork: "USD 200", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 500",
    validityTourist: "30 Days Tourist Rwanda", validityBusiness: "30 Days Business Rwanda", validityWork: "2Y Work Rwanda Class E",
    validityStudent: "1Y Student Rwanda Class F", validityFamily: "1Y Dependent Rwanda",
    funds: "USD 30/day", fundsStudent: "USD 4000/year",
    workPermitName: "Work Permit Class E Rwanda", prName: "Investor Permanent Residence Rwanda", prYears: 5,
    tourist: 11, business: 5, work: 16, student: 7, family: 6, pr: 7
  },
  {
    code: "mu", name: "Mauritius", total: 48,
    fee: "USD 0", feeBusiness: "USD 100", feeWork: "USD 200", feeStudent: "USD 100", feeFamily: "USD 100", feePR: "USD 1000",
    validityTourist: "90 Days Tourist Mauritius Visa Free", validityBusiness: "90 Days Business Mauritius", validityWork: "1Y Work Mauritius Occupation Permit",
    validityStudent: "1Y Student Mauritius", validityFamily: "1Y Dependent Mauritius",
    funds: "USD 50/day", fundsStudent: "USD 8000/year",
    workPermitName: "Occupation Permit OP Mauritius", prName: "Premium Visa Mauritius 20Y", prYears: 20,
    tourist: 10, business: 5, work: 15, student: 6, family: 6, pr: 6
  }
];

export interface RawOptionBVisaItem {
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

export function generateCountryVisas(country: CountryConfig): RawOptionBVisaItem[] {
  const { code, name, total, tourist, business, work, student, family, pr, fee, feeBusiness, feeWork, feeStudent, feeFamily, feePR, validityTourist, validityBusiness, validityWork, validityStudent, validityFamily, funds, fundsStudent, workPermitName, prName, prYears } = country;
  const visas: RawOptionBVisaItem[] = [];
  let idCounter = 1;

  // Tourist
  for (let i = 1; i <= tourist; i++) {
    const isFirst = i === 1;
    visas.push({
      id: `${code}-TOU-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-TOU-${String(i).padStart(3, '0')}`,
      name: isFirst
        ? `${name} Tourist Visa ${total} - ${name} Tourist ${i} - Most common Tourist ${name} ${tourist} types`
        : `${name} Tourist Visa ${i} ${name} Tourist ${i} Tourist ${name}`,
      toCountry: code,
      fromCountry: "in",
      category: "tourist",
      record_type: "TOURIST_VISA",
      fee: isFirst ? `${fee} Tourist ${name} most common` : `${fee} Tourist ${name} ${i}`,
      validity: isFirst ? `${validityTourist} - Most common` : validityTourist,
      docs: isFirst
        ? `Passport 6M + Photo + Return flight + Hotel ${name} + Insurance + Bank 3M + Employment + Cover letter + Tourist ${name} application VFS ${name} - Most common + Offer Letter + Funds + Bank Statement`
        : `Passport + Photo + Flight + Hotel ${name} + Insurance + Bank + Tourist ${name} VFS ${name}`,
      fundsBox: isFirst ? `Bank 3M ${funds} Tourist ${name}` : `Bank 3M ${funds}`,
      warningBox: isFirst ? `✅ Most common tourist ${name} Tourist Visa - VFS ${name}` : ``
    });
  }

  // Business
  for (let i = 1; i <= business; i++) {
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
      fee: isFirst ? `${feeBusiness} Business ${name} most common` : `${feeBusiness} Business ${name} ${i}`,
      validity: validityBusiness,
      docs: isFirst
        ? `${name} company invitation + Company registration ${name} + Foreign company letter + Business invitation + Business proof + Business ${name} VFS - Most common business ${name} + Business Invitation + Sponsor + Indian Company Letter`
        : `Business invitation ${name} + Company reg ${name} + Business letter + Business ${name} VFS`,
      warningBox: isFirst ? `✅ Most common business ${name} Business Visa - ${name} company invitation required` : ``
    });
  }

  // Work
  for (let i = 1; i <= work; i++) {
    const isFirst = i === 1;
    visas.push({
      id: `${code}-WRK-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-WRK-${String(i).padStart(3, '0')}`,
      name: isFirst
        ? `${name} Work Permit ${workPermitName} ${name} Work ${i} - Most common Work ${name}`
        : `${name} Work Permit ${i} Work ${name} - Work ${name} ${i}`,
      toCountry: code,
      fromCountry: "in",
      category: "work",
      record_type: "WORK_VISA",
      fee: isFirst ? `${feeWork} Work Permit ${name} most common ${workPermitName}` : `${feeWork} Work ${name} ${i}`,
      validity: isFirst ? `${validityWork} - Most common Work ${name}` : validityWork,
      docs: isFirst
        ? `Job offer ${name} ${workPermitName} + Employment contract ${name} + Employer registration ${name} + Diploma + Work permit application VFS ${name} - ${workPermitName} - Most common + Job Offer`
        : `Job offer ${name} + Employment contract + Work permit ${name} VFS ${name}`,
      warningBox: isFirst ? `✅ Most common work ${name} ${workPermitName} - Employer applies - Takes 2-4 weeks` : ``
    });
  }

  // Student
  for (let i = 1; i <= student; i++) {
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
      fee: isFirst ? `${feeStudent} Student ${name} most common` : `${feeStudent} Student ${name} ${i}`,
      validity: validityStudent,
      docs: isFirst
        ? `Admission letter ${name} university + University acceptance ${name} + Tuition fee proof + Bank ${fundsStudent} + Accommodation ${name} + Student ${name} VFS - Most common + Offer Letter ⭐ + Bank Statement + Admission Confirmation + Fees Submitted`
        : `Admission ${name} + Tuition + Bank ${fundsStudent} + Student ${name} VFS`,
      fundsBox: isFirst ? `Bank ${fundsStudent} Student ${name}` : `Bank ${fundsStudent}`,
      warningBox: isFirst ? `✅ Most common student ${name} Student Visa - University admission + Tuition paid + Bank ${fundsStudent} + Offer Letter/I-20/CAS/CoE ⭐` : ``
    });
  }

  // Family
  for (let i = 1; i <= family; i++) {
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
      fee: isFirst ? `${feeFamily} Family ${name} most common` : `${feeFamily} Family ${name} ${i}`,
      validity: validityFamily,
      docs: isFirst
        ? `Relationship proof + ${name} family member residence + Marriage certificate attested + Birth certificate attested + Accommodation ${name} + Financial support ${name} + Family Reunion ${name} VFS - Most common + Marriage Certificate + Invitation OR Hotel ⭐`
        : `Relationship proof + Family member residence ${name} + Marriage cert + Family ${name} VFS`,
      warningBox: isFirst ? `✅ Most common family ${name} Family Reunion - Spouse child parent` : ``
    });
  }

  // PR
  for (let i = 1; i <= pr; i++) {
    const isFirst = i === 1;
    visas.push({
      id: `${code}-PR-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-PR-${String(i).padStart(3, '0')}`,
      name: isFirst
        ? `${name} Permanent Residence ${prName} ${name} PR ${i} - Most common PR ${name}`
        : `${name} PR Visa ${i} PR ${name} - ${prName} ${i}`,
      toCountry: code,
      fromCountry: "in",
      category: "pr",
      record_type: "PR_VISA",
      fee: isFirst ? `${feePR} Permanent Residence ${name} most common ${prName}` : `${feePR} PR ${name} ${i}`,
      validity: isFirst ? `Permanent ${prName} ${name} - Most common PR ${name}` : `Permanent ${prName} ${name}`,
      docs: isFirst
        ? `Residence ${prYears}Y ${name} + Physical presence + Employment history + Language ${name} + PR ${prName} application ${name} - ${prYears}Y residence + Most common`
        : `Residence ${prYears}Y ${name} + PR application ${name}`,
      warningBox: isFirst ? `✅ Most common PR ${name} ${prName} - ${prYears}Y residence` : ``
    });
  }

  return visas;
}

export function convertRawToVisaItem(item: RawOptionBVisaItem, country: CountryConfig): VisaItem {
  const docList = item.docs.split('+').map(d => d.trim()).filter(Boolean);
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

export const ALL_OPTION_B_DATA: Record<string, CountryVisas> = {};
OPTION_B_COUNTRIES.forEach(c => {
  ALL_OPTION_B_DATA[c.code.toLowerCase()] = buildCountryVisas(c);
  ALL_OPTION_B_DATA[c.code.toUpperCase()] = ALL_OPTION_B_DATA[c.code.toLowerCase()];
});
