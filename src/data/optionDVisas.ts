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

export const OPTION_D_COUNTRIES: CountryConfig[] = [
  {
    code: "ar", name: "Argentina", total: 58,
    fee: "USD 150", feeBusiness: "USD 200", feeWork: "USD 300", feeStudent: "USD 150", feeFamily: "USD 150", feePR: "USD 1000",
    validityTourist: "90 Days Tourist Argentina", validityBusiness: "90 Days Business Argentina", validityWork: "1Y Work Argentina",
    validityStudent: "1Y Student Argentina", validityFamily: "1Y Family Argentina",
    funds: "USD 50/day", fundsStudent: "USD 8000/year",
    workPermitName: "Work Visa Argentina Residencia", prName: "Permanent Residence Argentina Radicacion", prYears: 2,
    tourist: 13, business: 6, work: 17, student: 8, family: 7, pr: 7
  },
  {
    code: "cl", name: "Chile", total: 55,
    fee: "USD 100", feeBusiness: "USD 150", feeWork: "USD 300", feeStudent: "USD 100", feeFamily: "USD 100", feePR: "USD 800",
    validityTourist: "90 Days Tourist Chile", validityBusiness: "90 Days Business Chile", validityWork: "2Y Work Chile Sujeta a Contrato",
    validityStudent: "1Y Student Chile", validityFamily: "1Y Family Chile",
    funds: "USD 50/day", fundsStudent: "USD 7000/year",
    workPermitName: "Sujeta a Contrato Chile", prName: "Permanencia Definitiva Chile", prYears: 2,
    tourist: 12, business: 5, work: 16, student: 8, family: 7, pr: 7
  },
  {
    code: "co", name: "Colombia", total: 52,
    fee: "USD 80", feeBusiness: "USD 120", feeWork: "USD 250", feeStudent: "USD 100", feeFamily: "USD 100", feePR: "USD 600",
    validityTourist: "90 Days Tourist Colombia", validityBusiness: "90 Days Business Colombia", validityWork: "3Y Work Colombia Migrant M",
    validityStudent: "1Y Student Colombia", validityFamily: "1Y Family Colombia",
    funds: "USD 40/day", fundsStudent: "USD 6000/year",
    workPermitName: "Visa M Trabajo Colombia", prName: "Residente Colombia R Investment", prYears: 5,
    tourist: 12, business: 5, work: 15, student: 7, family: 6, pr: 7
  },
  {
    code: "pe", name: "Peru", total: 50,
    fee: "USD 30", feeBusiness: "USD 50", feeWork: "USD 200", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 500",
    validityTourist: "90 Days Tourist Peru", validityBusiness: "90 Days Business Peru", validityWork: "1Y Work Peru Trabajador",
    validityStudent: "1Y Student Peru", validityFamily: "1Y Family Peru",
    funds: "USD 40/day", fundsStudent: "USD 5000/year",
    workPermitName: "Trabajador Peru", prName: "Inmigrante Peru", prYears: 3,
    tourist: 11, business: 5, work: 14, student: 7, family: 6, pr: 7
  },
  {
    code: "uy", name: "Uruguay", total: 45,
    fee: "USD 50", feeBusiness: "USD 80", feeWork: "USD 200", feeStudent: "USD 80", feeFamily: "USD 80", feePR: "USD 500",
    validityTourist: "90 Days Tourist Uruguay", validityBusiness: "90 Days Business Uruguay", validityWork: "1Y Work Uruguay",
    validityStudent: "1Y Student Uruguay", validityFamily: "1Y Family Uruguay",
    funds: "USD 50/day", fundsStudent: "USD 6000/year",
    workPermitName: "Work Visa Uruguay Residencia Legal", prName: "Residencia Legal Uruguay", prYears: 5,
    tourist: 10, business: 4, work: 13, student: 6, family: 6, pr: 6
  },
  {
    code: "pa", name: "Panama", total: 48,
    fee: "USD 60", feeBusiness: "USD 100", feeWork: "USD 300", feeStudent: "USD 100", feeFamily: "USD 100", feePR: "USD 5000",
    validityTourist: "90 Days Tourist Panama Friendly Nations", validityBusiness: "90 Days Business Panama", validityWork: "1Y Work Panama Friendly Nations",
    validityStudent: "1Y Student Panama", validityFamily: "1Y Family Panama",
    funds: "USD 50/day", fundsStudent: "USD 8000/year",
    workPermitName: "Friendly Nations Panama", prName: "Qualified Investor Panama", prYears: 2,
    tourist: 10, business: 5, work: 14, student: 6, family: 6, pr: 7
  },
  {
    code: "cr", name: "Costa Rica", total: 46,
    fee: "USD 50", feeBusiness: "USD 80", feeWork: "USD 200", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 1000",
    validityTourist: "90 Days Tourist Costa Rica", validityBusiness: "90 Days Business Costa Rica", validityWork: "1Y Work Costa Rica",
    validityStudent: "1Y Student Costa Rica", validityFamily: "1Y Family Costa Rica",
    funds: "USD 50/day", fundsStudent: "USD 6000/year",
    workPermitName: "Work Permit Costa Rica", prName: "Residencia Inversionista Costa Rica", prYears: 3,
    tourist: 10, business: 4, work: 13, student: 6, family: 6, pr: 7
  },
  {
    code: "do", name: "Dominican Republic", total: 44,
    fee: "USD 70", feeBusiness: "USD 100", feeWork: "USD 200", feeStudent: "USD 80", feeFamily: "USD 80", feePR: "USD 500",
    validityTourist: "60 Days Tourist Dominican Republic", validityBusiness: "60 Days Business Dominican Republic", validityWork: "1Y Work Dominican Republic",
    validityStudent: "1Y Student Dominican Republic", validityFamily: "1Y Family Dominican Republic",
    funds: "USD 50/day", fundsStudent: "USD 6000/year",
    workPermitName: "Work Visa Dominican Republic RT-3", prName: "Residencia Inversion Dominican Republic", prYears: 5,
    tourist: 10, business: 4, work: 12, student: 6, family: 6, pr: 6
  },
  {
    code: "jm", name: "Jamaica", total: 42,
    fee: "USD 20", feeBusiness: "USD 50", feeWork: "USD 200", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 500",
    validityTourist: "90 Days Tourist Jamaica Visa Free", validityBusiness: "90 Days Business Jamaica", validityWork: "1Y Work Jamaica",
    validityStudent: "1Y Student Jamaica", validityFamily: "1Y Family Jamaica",
    funds: "USD 50/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit Jamaica MLSS", prName: "Permanent Residence Jamaica", prYears: 5,
    tourist: 9, business: 4, work: 12, student: 5, family: 6, pr: 6
  },
  {
    code: "is", name: "Iceland", total: 52,
    fee: "EUR 80", feeBusiness: "EUR 100", feeWork: "EUR 200", feeStudent: "EUR 100", feeFamily: "EUR 100", feePR: "EUR 500",
    validityTourist: "90 Days Schengen Tourist Iceland", validityBusiness: "90 Days Schengen Business Iceland", validityWork: "1Y Work Iceland",
    validityStudent: "1Y Student Iceland", validityFamily: "1Y Family Iceland",
    funds: "EUR 50/day", fundsStudent: "EUR 10000/year",
    workPermitName: "Work Permit Iceland Directorate", prName: "Permanent Residence Iceland", prYears: 4,
    tourist: 11, business: 5, work: 15, student: 7, family: 7, pr: 7
  },
  {
    code: "lu", name: "Luxembourg", total: 48,
    fee: "EUR 80", feeBusiness: "EUR 100", feeWork: "EUR 150", feeStudent: "EUR 80", feeFamily: "EUR 80", feePR: "EUR 500",
    validityTourist: "90 Days Schengen Tourist Luxembourg", validityBusiness: "90 Days Schengen Business Luxembourg", validityWork: "1Y Work Luxembourg EU Blue Card",
    validityStudent: "1Y Student Luxembourg", validityFamily: "1Y Family Luxembourg",
    funds: "EUR 80/day", fundsStudent: "EUR 12000/year",
    workPermitName: "EU Blue Card Luxembourg", prName: "Permanent Residence Luxembourg", prYears: 5,
    tourist: 10, business: 4, work: 14, student: 6, family: 7, pr: 7
  },
  {
    code: "cz", name: "Czech Republic", total: 62,
    fee: "EUR 80", feeBusiness: "EUR 100", feeWork: "EUR 150", feeStudent: "EUR 80", feeFamily: "EUR 80", feePR: "EUR 500",
    validityTourist: "90 Days Schengen Tourist Czech", validityBusiness: "90 Days Schengen Business Czech", validityWork: "2Y Employee Card Czech Zamestnanecka Karta",
    validityStudent: "1Y Student Czech", validityFamily: "1Y Family Czech",
    funds: "EUR 50/day", fundsStudent: "EUR 6000/year",
    workPermitName: "Employee Card Czech Zamestnanecka", prName: "Permanent Residence Czech Trvaly Pobyt", prYears: 5,
    tourist: 13, business: 6, work: 18, student: 9, family: 8, pr: 8
  },
  {
    code: "hu", name: "Hungary", total: 60,
    fee: "EUR 80", feeBusiness: "EUR 100", feeWork: "EUR 150", feeStudent: "EUR 80", feeFamily: "EUR 80", feePR: "EUR 500",
    validityTourist: "90 Days Schengen Tourist Hungary", validityBusiness: "90 Days Schengen Business Hungary", validityWork: "2Y Work Hungary Guest Worker",
    validityStudent: "1Y Student Hungary", validityFamily: "1Y Family Hungary",
    funds: "EUR 50/day", fundsStudent: "EUR 6000/year",
    workPermitName: "Guest Worker Hungary", prName: "National Residence Hungary Guest Investor", prYears: 10,
    tourist: 13, business: 6, work: 17, student: 8, family: 8, pr: 8
  },
  {
    code: "gr", name: "Greece", total: 68,
    fee: "EUR 80", feeBusiness: "EUR 100", feeWork: "EUR 150", feeStudent: "EUR 90", feeFamily: "EUR 90", feePR: "EUR 500",
    validityTourist: "90 Days Schengen Tourist Greece", validityBusiness: "90 Days Schengen Business Greece", validityWork: "1Y Work Greece EU Blue Card",
    validityStudent: "1Y Student Greece", validityFamily: "1Y Family Greece",
    funds: "EUR 50/day", fundsStudent: "EUR 7000/year",
    workPermitName: "EU Blue Card Greece", prName: "Golden Visa Greece 250k Real Estate", prYears: 5,
    tourist: 14, business: 7, work: 20, student: 9, family: 9, pr: 9
  },
  {
    code: "hr", name: "Croatia", total: 58,
    fee: "EUR 80", feeBusiness: "EUR 100", feeWork: "EUR 150", feeStudent: "EUR 80", feeFamily: "EUR 80", feePR: "EUR 500",
    validityTourist: "90 Days Schengen Tourist Croatia", validityBusiness: "90 Days Schengen Business Croatia", validityWork: "1Y Work Croatia EU Blue Card",
    validityStudent: "1Y Student Croatia", validityFamily: "1Y Family Croatia",
    funds: "EUR 50/day", fundsStudent: "EUR 6000/year",
    workPermitName: "EU Blue Card Croatia", prName: "Permanent Residence Croatia Stalni Boravak", prYears: 5,
    tourist: 12, business: 6, work: 17, student: 8, family: 7, pr: 8
  },
  {
    code: "ro", name: "Romania", total: 62,
    fee: "EUR 80", feeBusiness: "EUR 100", feeWork: "EUR 150", feeStudent: "EUR 80", feeFamily: "EUR 80", feePR: "EUR 500",
    validityTourist: "90 Days Schengen Tourist Romania", validityBusiness: "90 Days Schengen Business Romania", validityWork: "1Y Work Romania EU Blue Card",
    validityStudent: "1Y Student Romania", validityFamily: "1Y Family Romania",
    funds: "EUR 50/day", fundsStudent: "EUR 6000/year",
    workPermitName: "EU Blue Card Romania", prName: "Permanent Residence Romania", prYears: 5,
    tourist: 13, business: 6, work: 18, student: 9, family: 8, pr: 8
  },
  {
    code: "ua", name: "Ukraine", total: 58,
    fee: "USD 85", feeBusiness: "USD 100", feeWork: "USD 200", feeStudent: "USD 100", feeFamily: "USD 100", feePR: "USD 500",
    validityTourist: "90 Days Tourist Ukraine E-Visa", validityBusiness: "90 Days Business Ukraine", validityWork: "3Y Work Ukraine D",
    validityStudent: "1Y Student Ukraine D", validityFamily: "1Y Family Ukraine D",
    funds: "USD 40/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit Ukraine D", prName: "Permanent Residence Ukraine Immigration", prYears: 5,
    tourist: 12, business: 6, work: 17, student: 8, family: 7, pr: 8
  },
  {
    code: "cy", name: "Cyprus", total: 52,
    fee: "EUR 80", feeBusiness: "EUR 100", feeWork: "EUR 150", feeStudent: "EUR 80", feeFamily: "EUR 80", feePR: "EUR 2000",
    validityTourist: "90 Days Tourist Cyprus", validityBusiness: "90 Days Business Cyprus", validityWork: "1Y Work Cyprus EU Blue Card",
    validityStudent: "1Y Student Cyprus", validityFamily: "1Y Family Cyprus",
    funds: "EUR 50/day", fundsStudent: "EUR 7000/year",
    workPermitName: "EU Blue Card Cyprus", prName: "Permanent Residence Cyprus Fast Track 300k", prYears: 5,
    tourist: 11, business: 5, work: 15, student: 7, family: 7, pr: 7
  },
  {
    code: "mt", name: "Malta", total: 50,
    fee: "EUR 80", feeBusiness: "EUR 100", feeWork: "EUR 200", feeStudent: "EUR 90", feeFamily: "EUR 90", feePR: "EUR 5000",
    validityTourist: "90 Days Schengen Tourist Malta", validityBusiness: "90 Days Schengen Business Malta", validityWork: "1Y Work Malta Single Permit",
    validityStudent: "1Y Student Malta", validityFamily: "1Y Family Malta",
    funds: "EUR 50/day", fundsStudent: "EUR 8000/year",
    workPermitName: "Single Permit Malta Identity", prName: "Permanent Residence Malta MPRP 150k", prYears: 5,
    tourist: 10, business: 5, work: 14, student: 7, family: 7, pr: 7
  },
  {
    code: "uz", name: "Uzbekistan", total: 48,
    fee: "USD 20", feeBusiness: "USD 40", feeWork: "USD 100", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 300",
    validityTourist: "30 Days Tourist Uzbekistan E-Visa", validityBusiness: "30 Days Business Uzbekistan B2", validityWork: "1Y Work Uzbekistan",
    validityStudent: "1Y Student Uzbekistan", validityFamily: "1Y Family Uzbekistan",
    funds: "USD 30/day", fundsStudent: "USD 4000/year",
    workPermitName: "Work Permit Uzbekistan", prName: "Residence Permit Uzbekistan Investor", prYears: 5,
    tourist: 11, business: 5, work: 14, student: 6, family: 6, pr: 6
  },
  {
    code: "az", name: "Azerbaijan", total: 52,
    fee: "USD 25", feeBusiness: "USD 50", feeWork: "USD 100", feeStudent: "USD 50", feeFamily: "USD 50", feePR: "USD 400",
    validityTourist: "30 Days Tourist Azerbaijan ASAN", validityBusiness: "30 Days Business Azerbaijan ASAN", validityWork: "1Y Work Azerbaijan",
    validityStudent: "1Y Student Azerbaijan", validityFamily: "1Y Family Azerbaijan",
    funds: "USD 40/day", fundsStudent: "USD 5000/year",
    workPermitName: "Work Permit Azerbaijan Migration", prName: "Permanent Residence Azerbaijan", prYears: 2,
    tourist: 11, business: 5, work: 15, student: 7, family: 7, pr: 7
  }
];

export interface RawOptionDVisaItem {
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

export function generateCountryVisas(country: CountryConfig): RawOptionDVisaItem[] {
  const { code, name, total, tourist, business, work, student, family, pr, fee, feeBusiness, feeWork, feeStudent, feeFamily, feePR, validityTourist, validityBusiness, validityWork, validityStudent, validityFamily, funds, fundsStudent, workPermitName, prName, prYears } = country;
  const visas: RawOptionDVisaItem[] = [];
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

export function convertRawToVisaItem(item: RawOptionDVisaItem, country: CountryConfig): VisaItem {
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

export const ALL_OPTION_D_DATA: Record<string, CountryVisas> = {};
OPTION_D_COUNTRIES.forEach(c => {
  ALL_OPTION_D_DATA[c.code.toLowerCase()] = buildCountryVisas(c);
  ALL_OPTION_D_DATA[c.code.toUpperCase()] = ALL_OPTION_D_DATA[c.code.toLowerCase()];
});
