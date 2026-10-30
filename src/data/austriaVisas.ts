import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getAustriaMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "Austria C Short Stay Visa requires proof of min EUR 100/day + hotel booking + round-trip ticket + travel medical insurance (min EUR 30,000).";
  let fundsBankMonths = "Last 3 months personal bank statements stamped by bank branch.";
  let fundsSudden = "❌ Sudden cash deposits right before visa submission at VFS Austria / BMI are strictly audited. Maintain steady balance over 3 months.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement with EUR 100/day liquid funds. ❌ Galat: Sudden deposit 24 hours prior to appointment.";

  let itrYears = "Income Tax Returns (ITR) or tax notices for past 2 years.";
  let itrMatch = "Declared income must align with bank account credits and employment contract.";
  let itrNoItr = "Not required for short-term visitors fully sponsored by host via EVE form.";

  let bankMonths = "Last 3 months bank statements.";
  let bankReg = "Regular salary credits or business revenue.";
  let bankFd = "Fixed deposits accepted as secondary financial proof.";
  let bankSource = "Salary, business income, or verified sponsor funds.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('rot-weiß-rot')) {
    fundsMin = "Austria Red White Red Card requires a binding job offer from an Austrian employer + points (min 55) + salary (EUR 35,000+) + company registration in Firmenbuch.";
    fundsBankMonths = "Employer employment contract, salary proof, and 3 months personal bank statements.";
    fundsSudden = "Contract must state gross annual salary in EUR, job title, and position.";
    fundsEx = "✅ Sahi: Signed employment contract + points (55+) + Firmenbuch firm registration + 3M bank statements. ❌ Galat: Salary below threshold.";
  } else if (cat === 'student' || lowerCode.includes('stu')) {
    fundsMin = "Austria Student Residence Permit requires official admission letter from an accredited Austrian university + tuition fee receipt + proof of living funds of at least EUR 12,000/year in a bank account.";
    fundsBankMonths = "3 months bank statements showing min EUR 1,000/month liquid balance.";
    fundsSudden = "Sponsor or personal bank statement must prove regular financial availability.";
    fundsEx = "✅ Sahi: University acceptance letter + EUR 12,000/year bank proof. ❌ Galat: Unverified sponsor funds.";
  } else if (cat === 'family' || lowerCode.includes('fam')) {
    fundsMin = "Austria Family Reunification Residence Permit requires sponsor residing in Austria to demonstrate financial capability (min 100% net income threshold) + accommodation proof.";
    fundsBankMonths = "3-6 months sponsor bank statements, tax returns (Steuerbescheid).";
    fundsSudden = "EVE (Elektronische Verpflichtungserklärung) signed and notarized if applicable.";
    fundsEx = "✅ Sahi: EVE/Notarized guarantee + sponsor income proof + apostilled marriage/birth certificate. ❌ Galat: Sponsor income below threshold.";
  } else if (cat === 'business' || lowerCode.includes('biz')) {
    fundsMin = "Austria C Business / Self Employed requires an official invitation letter from a company registered in Firmenbuch + for Self Employed, investment of EUR 100,000.";
    fundsBankMonths = "3-6 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Austrian company must be active in Firmenbuch commercial registry.";
    fundsEx = "✅ Sahi: Official invitation on Austrian firm letterhead + Firmenbuch registration + EUR 100k proof (for self-employed). ❌ Galat: Unregistered host firm.";
  } else if (cat === 'pr' || lowerCode.includes('pr')) {
    fundsMin = "Austria Permanent Residence requires 5 years continuous legal residence + employment history + German language test (min Level A2) + clean criminal record + tax clearance.";
    fundsBankMonths = "5 years residence history, tax assessments, and bank statements.";
    fundsSudden = "Continuous residence history evaluated by BMI.";
    fundsEx = "✅ Sahi: 5 years legal residence + German A2 certificate + tax clearance. ❌ Galat: Unexcused gap in legal stay or tax arrears.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

interface RawAustriaItem {
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

const RAW_AT_ITEMS: RawAustriaItem[] = [
  {id:"at-TOU-001",officialCode:"AT-TOU-001",name:"Schengen C Tourist Visa 90/180 Days Austria C Tourist 90/180 Days - Most common Tourist Austria",toCountry:"at",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C tourist Austria 90/180",validity:"90/180 days C tourist Austria",docs:"Passport 3M 2 blank + Photo 35x45 white Schengen + Flight return + Hotel all Austria + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + C tourist Austria application VFS Austria",fundsBox:"EUR 100/day = Bank 3M EUR 100/day = C tourist Austria VFS",warningBox:"✅ Most common tourist Austria C Tourist 90/180 Days - VFS Austria BMI"},
  {id:"at-TOU-002",officialCode:"AT-TOU-002",name:"Schengen C Tourist Multiple 1Y 5Y 90/180 Days C Tourist Multiple 1Y 5Y Austria",toCountry:"at",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C tourist multiple 1Y 5Y Austria",validity:"1Y 5Y multiple 90/180 days per 180 days C tourist multiple Austria",docs:"Passport + Photo + Flight + Hotel + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + Travel history Schengen + C tourist multiple application VFS Austria"},
  {id:"at-TOU-003",officialCode:"AT-TOU-003",name:"Schengen C Tourist - Family Friends Visit 90/180 Days Family Friends Visit C Family Friends Austria",toCountry:"at",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C family friends visit Austria",validity:"90/180 days family friends visit C family friends Austria",docs:"Invitation EVE Verpflichtungserklärung + Host ID residence Austria + Relationship proof + Host accommodation Austria + Host financial sponsorship + Passport + Photo + Flight + Hotel + Insurance + Bank + Employment + Cover letter + C family friends visit application VFS",warningBox:"MOST IMPORTANT: EVE Elektronische Verpflichtungserklärung - Invitation Form Austria"},
  {id:"at-TOU-004",officialCode:"AT-TOU-004",name:"ETIAS Travel Authorization 3Y ETIAS Travel Authorization 3Y ETIAS Austria",toCountry:"at",fromCountry:"us",category:"tourist",record_type:"ETA_VISA",fee:"EUR 7 ETIAS 3Y Austria",validity:"3Y ETIAS travel authorization 3Y ETIAS Austria",docs:"Passport + Photo + Flight + Hotel + ETIAS application travel-europe.europa.eu"},
  {id:"at-TOU-005",officialCode:"AT-TOU-005",name:"Austria National D Visitor 1Y National D Visitor 1Y Visitor National D Austria",toCountry:"at",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 150 National D visitor 1Y Austria",validity:"1Y national D visitor 1Y visitor national D Austria",docs:"Invitation national D Austria + Host ID residence national D + Relationship proof + Accommodation national D + Financial means national D + Insurance national D + National D visitor application VFS"},
  {id:"at-BIZ-001",officialCode:"AT-BIZ-001",name:"Schengen C Business 90/180 Days Austria C Business 90/180 Days - Most common Business Austria",toCountry:"at",fromCountry:"us",category:"business",record_type:"BUSINESS_VISA",fee:"EUR 90 C business Austria 90/180",validity:"90/180 days C business Austria",docs:"Company invitation Austria C + Austrian company registration Firmenbuch + Foreign company letter + Business card + Business registration foreign + Business invitation + Business proof + Insurance EUR 30000 + Bank 3M + Employment + C business application VFS Austria"},
  {id:"at-BIZ-002",officialCode:"AT-BIZ-002",name:"Austria Self Employed 1Y Self Employed 1Y Self Employed Austria - Niederlassungsbewilligung",toCountry:"at",fromCountry:"us",category:"business",record_type:"ENTREPRENEUR_VISA",fee:"EUR 150 Self employed 1Y Austria + Company + Investment EUR 100k",validity:"1Y self employed 1Y self employed Austria",docs:"Business plan Austria self employed + Company registration Firmenbuch self employed + Investment EUR 100k + Self employed proof + Clients + Financial means + Self employed application VFS"},
  {id:"at-WRK-001",officialCode:"AT-WRK-001",name:"Austria Red White Red Card 2Y Austria Red White Red Card 2Y - Most common Work Permit Austria - Rot-Weiß-Rot-Karte",toCountry:"at",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 150 Red White Red Card 2Y + Points + Salary EUR 35000",validity:"2Y red white red card 2Y + Residence + Points",docs:"Job offer Austria red white red card + Employment contract Austria red white red card + Employer registration Austria + Company registration Firmenbuch red white red card + Work permit red white red card + Points 55+ + Degree + Salary + Red White Red Card application VFS + Job offer red white red card + Employment contract red white red card + Employer + Company registration Firmenbuch red white red card + Work permit red white red card + Points + Degree + Salary + Red White Red Card application",warningBox:"✅ Most common work permit Austria Rot-Weiß-Rot-Karte Red White Red Card 2Y + Points System 55+ + AMS"},
  {id:"at-WRK-002",officialCode:"AT-WRK-002",name:"EU Blue Card 2Y Austria EU Blue Card 2Y Blue Card Work Austria",toCountry:"at",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 150 EU Blue Card 2Y + Highly qualified + Salary EUR 49000",validity:"2Y EU blue card 2Y blue card work Austria",docs:"Highly qualified job offer Austria Blue Card + Employment contract Austria Blue Card + Employer registration + Company registration Firmenbuch Blue Card + Degree + Salary EUR 49000+ + Blue Card application VFS"},
  {id:"at-WRK-003",officialCode:"AT-WRK-003",name:"Austria Red White Red Card - Very Highly Qualified 2Y Very Highly Qualified 2Y Very Highly Qualified Work Austria",toCountry:"at",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 150 Very highly qualified 2Y Austria",validity:"2Y very highly qualified 2Y very highly qualified work Austria",docs:"Very highly qualified job offer Austria + Employment contract Austria very highly qualified + Employer registration + Company registration Firmenbuch very highly qualified + Degree + Points 70+ + Very highly qualified application VFS"},
  {id:"at-WRK-004",officialCode:"AT-WRK-004",name:"Austria Red White Red Card - Skilled Worker Mangelberuf 2Y Skilled Worker Mangelberuf 2Y Skilled Worker Mangelberuf Austria",toCountry:"at",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 150 Skilled worker Mangelberuf 2Y Austria",validity:"2Y skilled worker Mangelberuf 2Y skilled worker Mangelberuf Austria",docs:"Mangelberuf job offer Austria + Employment contract Austria Mangelberuf + Employer registration + Company registration Firmenbuch Mangelberuf + Degree + Work permit Mangelberuf + Points 55+ + Mangelberuf application VFS"},
  {id:"at-WRK-005",officialCode:"AT-WRK-005",name:"Austria Work Permit - Seasonal 9M Seasonal Work 9M Seasonal Work Austria",toCountry:"at",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 150 Seasonal work 9M Austria",validity:"9M seasonal work 9M seasonal work Austria",docs:"Seasonal job offer Austria + Employment contract Austria seasonal + Employer registration + Company registration Firmenbuch seasonal + Seasonal work permit + Seasonal proof + Salary + Seasonal work application VFS"},
  {id:"at-STU-001",officialCode:"AT-STU-001",name:"Austria Residence Permit Student 1Y Austria Residence Permit Student 1Y - Most common Student Austria",toCountry:"at",fromCountry:"us",category:"student",record_type:"STUDENT_VISA",fee:"EUR 150 Student residence permit 1Y Austria + University",validity:"1Y student residence permit 1Y + Residence",docs:"Offer of place Austria education provider + Education provider registration Austria + Admission letter + Tuition fee receipt + Financial means EUR 12000/year + Accommodation + Insurance + Student residence permit application VFS",warningBox:"✅ Most common student Austria Residence Permit Student 1Y + University admission + EUR 12000/year"},
  {id:"at-FAM-001",officialCode:"AT-FAM-001",name:"Austria Residence Permit Family Reunification 1Y Austria Residence Permit Family Reunification 1Y - Most common Family Austria",toCountry:"at",fromCountry:"us",category:"family",record_type:"FAMILY_VISA",fee:"EUR 150 Family reunification 1Y Austria",validity:"1Y family reunification 1Y family reunification Austria",docs:"Relationship proof + Austrian family member residence + Marriage certificate OR Registered partnership proof attested + Austrian family member residence + Financial means Austrian family member + Accommodation Austrian family member + Family reunification application VFS",warningBox:"✅ Most common family Austria Family Reunification 1Y - VFS - Rot-Weiß-Rot-Karte Plus"},
  {id:"at-PR-001",officialCode:"AT-PR-001",name:"Austria Permanent Residence Daueraufenthalt EU 5Y Austria Permanent Residence Daueraufenthalt EU 5Y - PR Austria",toCountry:"at",fromCountry:"us",category:"pr",record_type:"PR_VISA",fee:"EUR 0 Permanent residence Daueraufenthalt EU 5Y Austria PR",validity:"Permanent permanent residence Daueraufenthalt EU 5Y PR Austria",docs:"Residence history 5Y Austria permanent residence + Physical presence 5Y Austria + Employment history 5Y Austria + Language German A2 + Permanent residence Daueraufenthalt EU application VFS"},
  {id:"at-SPE-001",officialCode:"AT-SPE-001",name:"Austria Job Seeker Very Highly Qualified 6M Job Seeker Very Highly Qualified 6M Job Seeker Austria",toCountry:"at",fromCountry:"us",category:"work",record_type:"JOB_SEEKER_VISA",fee:"EUR 150 Job seeker very highly qualified 6M Austria",validity:"6M job seeker very highly qualified 6M job seeker Austria",docs:"Degree + Points 70+ + Financial means EUR 12000 + Accommodation + Insurance + Job seeker very highly qualified application VFS"},
  {id:"at-SUP-001",officialCode:"AT-SUP-001",name:"Rot-Weiß-Rot-Karte Authority Rot-Weiß-Rot-Karte Authority Work Rot-Weiß-Rot-Karte Austria",toCountry:"at",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"Rot-Weiß-Rot-Karte = Red White Red Card - Work + Rot-Weiß-Rot-Karte + Rot-Weiß-Rot-Karte authority + Red White Red Card Austria Points System"},
  {id:"at-SUP-002",officialCode:"AT-SUP-002",name:"EVE Authority EVE Elektronische Verpflichtungserklärung Authority Family EVE Austria",toCountry:"at",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"EVE = Elektronische Verpflichtungserklärung - Family + EVE + EVE authority + Electronic letter of guarantee Austria"},
  {id:"at-SUP-003",officialCode:"AT-SUP-003",name:"AMS Authority AMS Authority Work AMS Austria",toCountry:"at",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"AMS = Arbeitsmarktservice - Work + AMS + AMS authority + Public Employment Service Austria"},
  {id:"at-LEG-001",officialCode:"AT-LEG-001",name:"Legacy Red White Red Card Points 50 Old System Closed Replaced by New Red White Red Card Points 55+ Austria",toCountry:"at",fromCountry:"us",category:"pr",record_type:"LEGACY_VISA",fee:"-",validity:"-",docs:"Legacy closed - Old red white red card points 50 old system closed new red white red card points 55+ Austria"}
];

function convertRawToVisaItem(item: RawAustriaItem): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
  const details = getAustriaMicroDetails(item.id, item.category, item.name);

  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    categoryCode: item.category,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    purpose: `Official ${item.category} visa and residence permit entry for Austria (VFS / BMI).`,
    eligibility: "Valid passport with min 3 months validity, 2 blank pages, travel medical insurance EUR 30,000, confirmed travel itinerary / employment contract / university admission / EVE, and financial proof.",
    popular: item.id === 'at-TOU-001' || item.id === 'at-BIZ-001' || item.id === 'at-WRK-001' || item.id === 'at-STU-001' || item.id === 'at-FAM-001' || item.id === 'at-PR-001',
    highlight: item.id === 'at-TOU-001' || item.id === 'at-WRK-001' || item.id === 'at-STU-001' || item.id === 'at-FAM-001',
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

export const AUSTRIA_92_VISAS: CountryVisas = {
  tourist: RAW_AT_ITEMS.filter(i => i.category === 'tourist').map(convertRawToVisaItem),
  business: RAW_AT_ITEMS.filter(i => i.category === 'business').map(convertRawToVisaItem),
  work: RAW_AT_ITEMS.filter(i => i.category === 'work').map(convertRawToVisaItem),
  student: RAW_AT_ITEMS.filter(i => i.category === 'student').map(convertRawToVisaItem),
  family: RAW_AT_ITEMS.filter(i => i.category === 'family').map(convertRawToVisaItem),
  pr: RAW_AT_ITEMS.filter(i => i.category === 'pr').map(convertRawToVisaItem)
};
