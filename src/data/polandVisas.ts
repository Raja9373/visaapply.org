import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getPolandMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "Poland C Short Stay Visa requires proof of min PLN 300/day + hotel booking + round-trip ticket + travel medical insurance (min EUR 30,000).";
  let fundsBankMonths = "Last 3 months personal bank statements stamped by bank branch.";
  let fundsSudden = "❌ Sudden cash deposits right before visa submission at VFS Poland / Urząd are strictly audited. Maintain steady balance over 3 months.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement with PLN 300/day liquid funds. ❌ Galat: Sudden deposit 24 hours prior to appointment.";

  let itrYears = "Income Tax Returns (ITR) or tax notices for past 2 years.";
  let itrMatch = "Declared income must align with bank account credits and employment contract.";
  let itrNoItr = "Not required for short-term visitors fully sponsored by host via Zaproszenie.";

  let bankMonths = "Last 3 months bank statements.";
  let bankReg = "Regular salary credits or business revenue.";
  let bankFd = "Fixed deposits accepted as secondary financial proof.";
  let bankSource = "Salary, business income, or verified sponsor funds.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('type-a')) {
    fundsMin = "Poland Work Permit (Type A/C/D/E) requires a binding job offer from a Polish employer + employment contract + employer registration in KRS/CEIDG + Starosta decision (if applicable).";
    fundsBankMonths = "Employer employment contract, salary proof, and 3 months personal bank statements.";
    fundsSudden = "Contract must state gross monthly salary, duration, and position.";
    fundsEx = "✅ Sahi: Signed employment contract + KRS firm registration + 3M bank statements. ❌ Galat: Salary below threshold.";
  } else if (cat === 'student' || lowerCode.includes('stu')) {
    fundsMin = "Poland Student Residence Permit requires official admission letter from an accredited Polish university + tuition fee receipt + proof of living funds of at least PLN 800/month in a bank account.";
    fundsBankMonths = "3 months bank statements showing min PLN 800/month liquid balance.";
    fundsSudden = "Sponsor or personal bank statement must prove regular financial availability.";
    fundsEx = "✅ Sahi: University acceptance letter + PLN 800/month bank proof. ❌ Galat: Unverified sponsor funds.";
  } else if (cat === 'family' || lowerCode.includes('fam')) {
    fundsMin = "Poland Family Reunification Residence Permit requires sponsor residing in Poland to demonstrate financial capability + accommodation proof.";
    fundsBankMonths = "3-6 months sponsor bank statements, tax returns.";
    fundsSudden = "Zaproszenie signed and notarized in Poland.";
    fundsEx = "✅ Sahi: Notarized Zaproszenie + sponsor income proof + apostilled marriage/birth certificate. ❌ Galat: Missing notarized zaproszenie.";
  } else if (cat === 'business' || lowerCode.includes('biz')) {
    fundsMin = "Poland C Business / Entrepreneur requires an official invitation letter from a company registered in KRS/CEIDG.";
    fundsBankMonths = "3-6 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Polish company must be active in KRS/CEIDG commercial registry.";
    fundsEx = "✅ Sahi: Official invitation on Polish firm letterhead + KRS registration + business plan (for entrepreneur). ❌ Galat: Unregistered host firm.";
  } else if (cat === 'pr' || lowerCode.includes('pr')) {
    fundsMin = "Poland Permanent Residence (Karta Stałego Pobytu) requires 5 years continuous legal residence + employment history + Polish language test (min Level B1 equivalent) + clean criminal record.";
    fundsBankMonths = "5 years residence history, tax returns, and bank statements.";
    fundsSudden = "Continuous residence history evaluated by Urząd Wojewódzki.";
    fundsEx = "✅ Sahi: 5 years legal residence + Polish B1 certificate + tax clearance. ❌ Galat: Unexcused gap in legal stay or tax arrears.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

interface RawPolandItem {
  id: string;
  officialCode: string;
  name: string;
  toCountry: string;
  fromCountry: string;
  category: string;
  record_type: string;
  fee: string;
  validity: string;
  docs: string;
  fundsBox?: string;
  bankBox?: string;
  warningBox?: string;
}

const RAW_PL_ITEMS: RawPolandItem[] = [
  {id:"pl-TOU-001",officialCode:"PL-TOU-001",name:"Schengen C Tourist Visa 90/180 Days Poland C Tourist 90/180 Days - Most common Tourist Poland",toCountry:"pl",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C tourist Poland 90/180",validity:"90/180 days C tourist Poland",docs:"Passport 3M 2 blank + Photo 35x45 white Schengen + Flight return + Hotel all Poland + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + C tourist Poland application VFS Poland",fundsBox:"PLN 300/day = Bank 3M PLN 300/day = C tourist Poland VFS",warningBox:"✅ Most common tourist Poland C Tourist 90/180 Days - VFS Poland Urząd"},
  {id:"pl-TOU-002",officialCode:"PL-TOU-002",name:"Schengen C Tourist Multiple 1Y 5Y 90/180 Days C Tourist Multiple 1Y 5Y Poland",toCountry:"pl",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C tourist multiple 1Y 5Y Poland",validity:"1Y 5Y multiple 90/180 days per 180 days C tourist multiple Poland",docs:"Passport + Photo + Flight + Hotel + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + Travel history Schengen + C tourist multiple application VFS Poland"},
  {id:"pl-TOU-003",officialCode:"PL-TOU-003",name:"Schengen C Tourist - Family Friends Visit 90/180 Days Family Friends Visit C Family Friends Poland",toCountry:"pl",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C family friends visit Poland",validity:"90/180 days family friends visit C family friends Poland",docs:"Invitation zaproszenie + Host ID residence Poland + Relationship proof + Host accommodation Poland + Host financial sponsorship + Passport + Photo + Flight + Hotel + Insurance + Bank + Employment + Cover letter + C family friends visit application VFS",warningBox:"MOST IMPORTANT: Zaproszenie Invitation Form Poland - Urząd Wojewódzki"},
  {id:"pl-TOU-004",officialCode:"PL-TOU-004",name:"ETIAS Travel Authorization 3Y ETIAS Travel Authorization 3Y ETIAS Poland",toCountry:"pl",fromCountry:"us",category:"tourist",record_type:"ETA_VISA",fee:"EUR 7 ETIAS 3Y Poland",validity:"3Y ETIAS travel authorization 3Y ETIAS Poland",docs:"Passport + Photo + Flight + Hotel + ETIAS application travel-europe.europa.eu"},
  {id:"pl-TOU-005",officialCode:"PL-TOU-005",name:"Poland National D Visitor 1Y National D Visitor 1Y Visitor National D Poland",toCountry:"pl",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 135 National D visitor 1Y Poland",validity:"1Y national D visitor 1Y visitor national D Poland",docs:"Invitation national D Poland + Host ID residence national D + Relationship proof + Accommodation national D + Financial means national D + Insurance national D + National D visitor application VFS"},
  {id:"pl-BIZ-001",officialCode:"PL-BIZ-001",name:"Schengen C Business 90/180 Days Poland C Business 90/180 Days - Most common Business Poland",toCountry:"pl",fromCountry:"us",category:"business",record_type:"BUSINESS_VISA",fee:"EUR 90 C business Poland 90/180",validity:"90/180 days C business Poland",docs:"Company invitation Poland C + Polish company registration KRS/CEIDG + Foreign company letter + Business card + Business registration foreign + Business invitation + Business proof + Insurance EUR 30000 + Bank 3M + Employment + C business application VFS Poland"},
  {id:"pl-BIZ-002",officialCode:"PL-BIZ-002",name:"Poland Business - Entrepreneur Self Employed D 1Y Entrepreneur Self Employed D 1Y Entrepreneur Poland",toCountry:"pl",fromCountry:"us",category:"business",record_type:"ENTREPRENEUR_VISA",fee:"EUR 135 Entrepreneur self employed D 1Y Poland + Company",validity:"1Y entrepreneur self employed D 1Y entrepreneur self employed Poland",docs:"Business plan Poland entrepreneur + Company registration KRS/CEIDG entrepreneur + Financial means entrepreneur + Entrepreneur proof + Business plan + Investment proof + Financial means + Entrepreneur application VFS"},
  {id:"pl-WRK-001",officialCode:"PL-WRK-001",name:"Poland Work Permit Type A C D E 1Y 3Y Poland Work Permit Type A C D E 1Y 3Y - Most common Work Permit Poland",toCountry:"pl",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 135 Work permit type A/C/D/E 1Y 3Y + Company + Starosta",validity:"1Y 3Y work permit type A/C/D/E 1Y 3Y + Residence",docs:"Job offer Poland work permit A/C/D/E + Employment contract Poland work permit A/C/D/E + Employer registration Poland + Company registration KRS work permit A/C/D/E + Work permit A/C/D/E + Starosta decision + Salary + Work permit application VFS + Job offer work permit A/C/D/E + Employment contract work permit A/C/D/E + Employer + Company registration KRS work permit A/C/D/E + Work permit A/C/D/E + Starosta decision + Salary + Work permit application",warningBox:"✅ Most common work permit Poland Type A/B/C/D/E + Starosta + Urząd Wojewódzki + KRS"},
  {id:"pl-WRK-002",officialCode:"PL-WRK-002",name:"EU Blue Card 1Y 3Y Poland EU Blue Card 1Y 3Y Blue Card Work Poland",toCountry:"pl",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 135 EU Blue Card 1Y 3Y + Highly qualified + Salary PLN 80000",validity:"1Y 3Y EU blue card 1Y 3Y blue card work Poland",docs:"Highly qualified job offer Poland Blue Card + Employment contract Poland Blue Card + Employer registration + Company registration KRS Blue Card + Degree + Salary PLN 80000+ + Blue Card application VFS"},
  {id:"pl-WRK-003",officialCode:"PL-WRK-003",name:"ICT Intra Corporate Transfer 1Y 3Y ICT 1Y 3Y ICT Work Poland",toCountry:"pl",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 135 ICT 1Y 3Y + Company ICT + ICT",validity:"1Y 3Y ICT intra corporate transfer 1Y 3Y ICT work Poland",docs:"ICT offer Poland + Employment contract Poland ICT + Employer registration + Company registration KRS ICT + Company relationship + ICT proof + Salary + Qualifications + ICT application VFS"},
  {id:"pl-WRK-004",officialCode:"PL-WRK-004",name:"Poland Work Permit - Seasonal Work Oświadczenie 9M Seasonal Work Oświadczenie 9M Seasonal Work Poland",toCountry:"pl",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 0 Seasonal work oświadczenie 9M Poland",validity:"9M seasonal work oświadczenie 9M seasonal work Poland",docs:"Seasonal job offer Poland + Employment contract Poland seasonal + Employer registration + Company registration KRS seasonal + Oświadczenie declaration + Seasonal work permit + Seasonal proof + Salary + Seasonal work application VFS"},
  {id:"pl-WRK-005",officialCode:"PL-WRK-005",name:"Poland Work Permit - Researcher 1Y Researcher 1Y Researcher Work Poland",toCountry:"pl",fromCountry:"us",category:"work",record_type:"RESEARCH_VISA",fee:"EUR 135 Researcher 1Y Poland",validity:"1Y researcher 1Y researcher work Poland",docs:"Researcher hosting agreement Poland + Research institution registration + Research project + Qualifications + Researcher application VFS"},
  {id:"pl-STU-001",officialCode:"PL-STU-001",name:"Poland Residence Permit Student D 1Y Poland Residence Permit Student D 1Y - Most common Student Poland",toCountry:"pl",fromCountry:"us",category:"student",record_type:"STUDENT_VISA",fee:"EUR 135 Student residence permit D 1Y Poland + University",validity:"1Y student residence permit D 1Y + Residence",docs:"Offer of place Poland education provider + Education provider registration Poland + Admission letter + Tuition fee receipt + Financial means PLN 800/month + Accommodation + Insurance + Student residence permit D application VFS",warningBox:"✅ Most common student Poland National D Student 1Y + University admission + PLN 800/month"},
  {id:"pl-STU-002",officialCode:"PL-STU-002",name:"Schengen C Student 90/180 Days Poland C Student 90/180 Days Student C Poland",toCountry:"pl",fromCountry:"us",category:"student",record_type:"STUDENT_VISA",fee:"EUR 90 C student Poland",validity:"90/180 days C student Poland",docs:"Short course offer Poland + Education provider registration Poland C + Admission letter C + Tuition fee receipt C + Financial means + Accommodation + Insurance + C student application VFS"},
  {id:"pl-FAM-001",officialCode:"PL-FAM-001",name:"Poland Residence Permit Family Reunification D 1Y Poland Residence Permit Family Reunification D 1Y - Most common Family Poland",toCountry:"pl",fromCountry:"us",category:"family",record_type:"FAMILY_VISA",fee:"EUR 135 Family reunification D 1Y Poland",validity:"1Y family reunification D 1Y family reunification Poland",docs:"Relationship proof + Polish family member residence + Marriage certificate OR Cohabitation proof attested + Polish family member residence + Financial means Polish family member + Accommodation Polish family member + Family reunification D application VFS",warningBox:"✅ Most common family Poland Family Reunification D 1Y - VFS - Urząd Wojewódzki"},
  {id:"pl-PR-001",officialCode:"PL-PR-001",name:"Poland Permanent Residence 5Y Poland Permanent Residence 5Y - PR Poland - Karta Stałego Pobytu",toCountry:"pl",fromCountry:"us",category:"pr",record_type:"PR_VISA",fee:"EUR 0 Permanent residence 5Y Poland PR",validity:"Permanent permanent residence 5Y PR Poland karta stałego pobytu",docs:"Residence history 5Y Poland permanent residence + Physical presence 5Y Poland + Employment history 5Y Poland + Language Polish + Permanent residence application Urząd Wojewódzki"},
  {id:"pl-SPE-001",officialCode:"PL-SPE-001",name:"Poland Job Seeker Graduate 1Y Job Seeker Graduate 1Y Job Seeker Poland",toCountry:"pl",fromCountry:"us",category:"pr",record_type:"JOB_SEEKER_VISA",fee:"EUR 135 Job seeker graduate 1Y Poland",validity:"1Y job seeker graduate 1Y job seeker Poland",docs:"Degree Poland + Graduation certificate + Financial means PLN 800/month + Accommodation + Insurance + Job seeker graduate application Urząd Wojewódzki"},
  {id:"pl-SUP-001",officialCode:"PL-SUP-001",name:"Urząd Wojewódzki Authority Urząd Wojewódzki Authority Visa Urząd Wojewódzki Poland",toCountry:"pl",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"Urząd Wojewódzki = Voivodeship Office - Visa + Residence + Urząd Wojewódzki authority + Urząd Wojewódzki Poland"},
  {id:"pl-SUP-002",officialCode:"PL-SUP-002",name:"Oświadczenie Authority Oświadczenie Declaration Authority Work Oświadczenie Poland",toCountry:"pl",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"Oświadczenie = Declaration work - Work + Oświadczenie + Oświadczenie authority + Oświadczenie Poland seasonal work"},
  {id:"pl-SUP-003",officialCode:"PL-SUP-003",name:"KRS Authority KRS CEIDG Authority Business KRS Poland",toCountry:"pl",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"KRS/CEIDG = Company Register - Business + KRS/CEIDG + KRS/CEIDG authority + KRS Poland"},
  {id:"pl-LEG-001",officialCode:"PL-LEG-001",name:"Legacy Work Permit Type A Old System Closed Replaced by New Work Permit Type A/B/C/D/E Poland",toCountry:"pl",fromCountry:"us",category:"pr",record_type:"LEGACY_VISA",fee:"-",validity:"-",docs:"Legacy closed - Old work permit type A old system closed new work permit type A/B/C/D/E Poland"}
];

function convertRawToVisaItem(item: RawPolandItem): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
  const details = getPolandMicroDetails(item.id, item.category, item.name);

  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    categoryCode: item.category,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    purpose: `Official ${item.category} visa and residence permit entry for Poland (Urząd Wojewódzki).`,
    eligibility: "Valid passport with min 3 months validity, 2 blank pages, travel medical insurance EUR 30,000, confirmed travel itinerary / employment contract / university admission / Zaproszenie, and financial proof.",
    popular: item.id === 'pl-TOU-001' || item.id === 'pl-BIZ-001' || item.id === 'pl-WRK-001' || item.id === 'pl-STU-001' || item.id === 'pl-FAM-001' || item.id === 'pl-PR-001',
    highlight: item.id === 'pl-TOU-001' || item.id === 'pl-WRK-001' || item.id === 'pl-STU-001' || item.id === 'pl-FAM-001',
    record_type: item.record_type,
    toCountry: item.toCountry,
    fromCountry: item.fromCountry,
    warningBox: item.warningBox,
    rawFundsBox: item.fundsBox,
    rawBankBox: item.bankBox,
    docs: docList,
    fundsBox: details.fundsBox,
    itrBox: details.itrBox,
    bankBox: details.bankBox
  };
}

export const POLAND_92_VISAS: CountryVisas = {
  tourist: RAW_PL_ITEMS.filter(i => i.category === 'tourist').map(convertRawToVisaItem),
  business: RAW_PL_ITEMS.filter(i => i.category === 'business').map(convertRawToVisaItem),
  work: RAW_PL_ITEMS.filter(i => i.category === 'work').map(convertRawToVisaItem),
  student: RAW_PL_ITEMS.filter(i => i.category === 'student').map(convertRawToVisaItem),
  family: RAW_PL_ITEMS.filter(i => i.category === 'family').map(convertRawToVisaItem),
  pr: RAW_PL_ITEMS.filter(i => i.category === 'pr').map(convertRawToVisaItem)
};
