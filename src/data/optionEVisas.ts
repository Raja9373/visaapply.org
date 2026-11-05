import { VisaItem, CountryVisas } from './fullVisaDatabase';

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

export function generateCountryVisas(code: string, name: string, total: number, b: OptionECountrySpec): VisaItem[] {
  const visas: VisaItem[] = [];
  let idCounter = 1;

  for (let i = 1; i <= b.tourist; i++) {
    const f = i === 1;
    visas.push({
      id: `${code}-TOU-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-TOU-${String(i).padStart(3, '0')}`,
      name: f ? `${name} Tourist Visa ${total} - ${name} Tourist ${i} - Most common Tourist ${name} ${b.tourist} types` : `${name} Tourist Visa ${i} ${name} Tourist ${i} Tourist ${name}`,
      toCountry: code,
      fromCountry: "in",
      category: "tourist",
      record_type: "TOURIST_VISA",
      fee: f ? `${b.fee} Tourist ${name} most common` : `${b.fee} Tourist ${name} ${i}`,
      validity: f ? `${b.validityTourist} - Most common` : b.validityTourist,
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
        `Tourist Application VFS ${name}`
      ],
      fundsBox: f ? {
        minimum: b.funds,
        bankMonths: "3 Months",
        suddenDeposit: "Explained",
        example: `Bank Statement showing ${b.funds}`
      } : undefined,
      warningBox: f ? `✅ Most common tourist ${name} Tourist Visa - VFS ${name}` : undefined
    });
  }

  for (let i = 1; i <= b.business; i++) {
    const f = i === 1;
    visas.push({
      id: `${code}-BUS-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-BUS-${String(i).padStart(3, '0')}`,
      name: f ? `${name} Business Visa ${name} Business ${i} - Most common Business ${name}` : `${name} Business Visa ${i} Business ${name}`,
      toCountry: code,
      fromCountry: "in",
      category: "business",
      record_type: "BUSINESS_VISA",
      fee: f ? `${b.feeBusiness} Business ${name} most common` : `${b.feeBusiness} Business ${name} ${i}`,
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
      warningBox: f ? `✅ Most common business ${name} Business Visa - ${name} company invitation required` : undefined
    });
  }

  for (let i = 1; i <= b.work; i++) {
    const f = i === 1;
    visas.push({
      id: `${code}-WRK-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-WRK-${String(i).padStart(3, '0')}`,
      name: f ? `${name} Work Permit ${b.workPermitName} ${name} Work ${i} - Most common Work ${name}` : `${name} Work Permit ${i} Work ${name} - Work ${name} ${i}`,
      toCountry: code,
      fromCountry: "in",
      category: "work",
      record_type: "WORK_VISA",
      fee: f ? `${b.feeWork} Work Permit ${name} most common ${b.workPermitName}` : `${b.feeWork} Work ${name} ${i}`,
      validity: f ? `${b.validityWork} - Most common Work ${name}` : b.validityWork,
      processing: "2-4 Weeks",
      stay: b.validityWork,
      docs: f ? [
        `Official Job Offer from ${name} Employer`,
        `Approved Work Permit / ${b.workPermitName}`,
        "Signed Employment Contract",
        "Educational Diplomas & Professional Certificates",
        "Police Clearance Certificate",
        "Medical Examination Report"
      ] : [
        `Job offer ${name}`,
        "Employment contract",
        `Work permit ${name} VFS`
      ],
      warningBox: f ? `✅ Most common work ${name} ${b.workPermitName} - Employer applies - Takes 2-4 weeks` : undefined
    });
  }

  for (let i = 1; i <= b.student; i++) {
    const f = i === 1;
    visas.push({
      id: `${code}-STU-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-STU-${String(i).padStart(3, '0')}`,
      name: f ? `${name} Student Visa ${name} Student ${i} - Most common Student ${name}` : `${name} Student Visa ${i} Student ${name}`,
      toCountry: code,
      fromCountry: "in",
      category: "student",
      record_type: "STUDENT_VISA",
      fee: f ? `${b.feeStudent} Student ${name} most common` : `${b.feeStudent} Student ${name} ${i}`,
      validity: b.validityStudent,
      processing: "2-3 Weeks",
      stay: b.validityStudent,
      docs: f ? [
        `Official University / Institution Admission Letter in ${name}`,
        "Tuition Fee Payment Receipt / Proof of Funds",
        `Bank Statement showing ${b.fundsStudent}`,
        "Proof of Accommodation",
        "Academic Transcripts & Certificates"
      ] : [
        `Admission ${name}`,
        "Tuition",
        `Bank ${b.fundsStudent}`,
        `Student ${name} VFS`
      ],
      fundsBox: f ? {
        minimum: b.fundsStudent,
        bankMonths: "3 Months",
        suddenDeposit: "Explained",
        example: `Bank Statement showing ${b.fundsStudent}`
      } : undefined,
      warningBox: f ? `✅ Most common student ${name} Student Visa - University admission + Tuition paid + Bank ${b.fundsStudent} + Offer Letter` : undefined
    });
  }

  for (let i = 1; i <= b.family; i++) {
    const f = i === 1;
    visas.push({
      id: `${code}-FAM-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-FAM-${String(i).padStart(3, '0')}`,
      name: f ? `${name} Family Reunion Visa ${name} Family ${i} - Most common Family ${name}` : `${name} Family Visa ${i} Family ${name}`,
      toCountry: code,
      fromCountry: "in",
      category: "family",
      record_type: "FAMILY_VISA",
      fee: f ? `${b.feeFamily} Family ${name} most common` : `${b.feeFamily} Family ${name} ${i}`,
      validity: b.validityFamily,
      processing: "3-4 Weeks",
      stay: b.validityFamily,
      docs: f ? [
        "Attested Marriage Certificate / Birth Certificate",
        `Proof of Residence & Status of Sponsor in ${name}`,
        "Accommodation Proof in Destination Country",
        "Financial Support Guarantee"
      ] : [
        "Relationship proof",
        `Family member residence ${name}`,
        "Marriage cert",
        `Family ${name} VFS`
      ],
      warningBox: f ? `✅ Most common family ${name} Family Reunion - Spouse child parent` : undefined
    });
  }

  for (let i = 1; i <= b.pr; i++) {
    const f = i === 1;
    visas.push({
      id: `${code}-PR-${String(idCounter++).padStart(3, '0')}`,
      officialCode: `${code.toUpperCase()}-PR-${String(i).padStart(3, '0')}`,
      name: f ? `${name} Permanent Residence ${b.prName} ${name} PR ${i} - Most common PR ${name}` : `${name} PR Visa ${i} PR ${name} - ${b.prName} ${i}`,
      toCountry: code,
      fromCountry: "in",
      category: "pr",
      record_type: "PR_VISA",
      fee: f ? `${b.feePR} Permanent Residence ${name} most common ${b.prName}` : `${b.feePR} PR ${name} ${i}`,
      validity: f ? `Permanent ${b.prName} ${name} - Most common PR ${name}` : `Permanent ${b.prName} ${name}`,
      processing: "3-6 Months",
      stay: "Permanent Residence",
      docs: f ? [
        `Residence History of ${b.prYears} Years in ${name}`,
        "Proof of Investment / Employment / Financial Self-Sufficiency",
        "Police Clearance Certificate & Medical Records",
        `PR Application Form ${name} - ${b.prName}`
      ] : [
        `Residence ${b.prYears}Y ${name}`,
        `PR application ${name}`
      ],
      warningBox: f ? `✅ Most common PR ${name} ${b.prName} - ${b.prYears}Y residence` : undefined
    });
  }

  return visas;
}

export const ALL_OPTION_E_DATA: Record<string, CountryVisas> = {};

export function buildCountryVisasOptionE() {
  OPTION_E_COUNTRIES.forEach(country => {
    const visas = generateCountryVisas(country.code, country.name, country.total, country);
    const catMap: CountryVisas = { tourist: [], business: [], work: [], student: [], family: [], pr: [] };
    visas.forEach(v => {
      if (catMap[v.category]) {
        catMap[v.category].push(v);
      }
    });
    ALL_OPTION_E_DATA[country.code.toLowerCase()] = catMap;
  });
}

buildCountryVisasOptionE();
