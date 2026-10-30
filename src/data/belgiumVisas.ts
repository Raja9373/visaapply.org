import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getBelgiumMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "Belgium C Short Stay Visa requires proof of min EUR 50/day + hotel booking + round-trip ticket + travel medical insurance (min EUR 30,000).";
  let fundsBankMonths = "Last 3 months personal bank statements stamped by bank branch.";
  let fundsSudden = "❌ Sudden cash deposits right before visa submission at VFS Belgium / Immigration Office are strictly audited. Maintain steady balance over 3 months.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement with EUR 50/day liquid funds. ❌ Galat: Sudden deposit 24 hours prior to appointment.";

  let itrYears = "Income Tax Returns (ITR) or tax notices for past 2 years.";
  let itrMatch = "Declared income must align with bank account credits and employment contract.";
  let itrNoItr = "Not required for short-term visitors fully sponsored by host via Annexe 3bis.";

  let bankMonths = "Last 3 months bank statements.";
  let bankReg = "Regular salary credits or business revenue.";
  let bankFd = "Fixed deposits accepted as secondary financial proof.";
  let bankSource = "Salary, business income, or verified sponsor funds.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('permit-b')) {
    fundsMin = "Belgium Work Permit B / Single Permit requires an employment contract or binding job offer registered with regional authorities + minimum salary meeting Belgian regional thresholds (Flanders/Wallonia/Brussels).";
    fundsBankMonths = "Employer employment contract and 3 months personal bank statements.";
    fundsSudden = "Contract must state gross monthly salary, duration, and position.";
    fundsEx = "✅ Sahi: Signed employment contract + regional authorization + 3M bank statements. ❌ Galat: Salary below regional threshold.";
  } else if (cat === 'student' || lowerCode.includes('stu')) {
    fundsMin = "Belgium Student Residence Permit requires official admission letter from an accredited Belgian university + tuition fee receipt + proof of living funds of at least EUR 803/month in a bank account.";
    fundsBankMonths = "3 months bank statements showing min EUR 803/month liquid funds.";
    fundsSudden = "Sponsor or personal bank statement must prove regular financial availability.";
    fundsEx = "✅ Sahi: University acceptance letter + tuition fee receipt + EUR 803/month bank proof. ❌ Galat: Unverified sponsor funds.";
  } else if (cat === 'family' || lowerCode.includes('fam')) {
    fundsMin = "Belgium Family Reunification requires sponsor residing in Belgium to demonstrate financial capability (min 120% SMN EUR 803/month + for spouse + per child) + accommodation proof.";
    fundsBankMonths = "3-6 months sponsor bank statements, tax returns (IRS-equivalent).";
    fundsSudden = "Annexe 3bis signed and notarized in Belgium.";
    fundsEx = "✅ Sahi: Notarized Annexe 3bis + sponsor income proof (EUR 1,700+/month) + apostilled marriage/birth certificate. ❌ Galat: Sponsor income below minimum threshold.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('professional')) {
    fundsMin = "Belgium C Business / Self Employed Professional Card requires company registration with BCE/KBO + professional card application.";
    fundsBankMonths = "3-6 months corporate and personal bank statements.";
    fundsSudden = "Company registration with BCE/KBO is mandatory.";
    fundsEx = "✅ Sahi: BCE/KBO company registration + professional card proof + business plan. ❌ Galat: Unregistered firm.";
  } else if (cat === 'pr' || lowerCode.includes('pr')) {
    fundsMin = "Belgium Permanent Residence requires 5 years continuous legal residence + employment history + language proof + clean criminal record.";
    fundsBankMonths = "5 years residence history, tax returns, and bank statements.";
    fundsSudden = "Continuous residence history evaluated by Immigration Office.";
    fundsEx = "✅ Sahi: 5 years legal residence + tax clearance. ❌ Galat: Unexcused gap in legal stay or tax arrears.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

interface RawBelgiumItem {
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

const RAW_BE_ITEMS: RawBelgiumItem[] = [
  {id:"be-TOU-001",officialCode:"BE-TOU-001",name:"Schengen C Tourist Visa 90/180 Days Belgium C Tourist 90/180 Days - Most common Tourist Belgium",toCountry:"be",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C tourist Belgium 90/180",validity:"90/180 days C tourist Belgium",docs:"Passport 3M 2 blank + Photo 35x45 white Schengen + Flight return + Hotel all Belgium + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + C tourist Belgium application VFS Belgium",fundsBox:"EUR 50/day = Bank 3M EUR 50/day = C tourist Belgium VFS",warningBox:"✅ Most common tourist Belgium C Tourist 90/180 Days - VFS Belgium Immigration Office"},
  {id:"be-TOU-002",officialCode:"BE-TOU-002",name:"Schengen C Tourist Multiple 1Y 5Y 90/180 Days C Tourist Multiple 1Y 5Y Belgium",toCountry:"be",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C tourist multiple 1Y 5Y Belgium",validity:"1Y 5Y multiple 90/180 days per 180 days C tourist multiple Belgium",docs:"Passport + Photo + Flight + Hotel + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + Travel history Schengen + C tourist multiple application VFS Belgium"},
  {id:"be-TOU-003",officialCode:"BE-TOU-003",name:"Schengen A Transit Airport Transit A Airport Transit Belgium",toCountry:"be",fromCountry:"us",category:"tourist",record_type:"TRANSIT_VISA",fee:"EUR 90 A transit Belgium",validity:"24H A transit airport transit Belgium",docs:"Passport 3M + Onward ticket within 24H + Flight within 24H + Visa third country + A transit application VFS"},
  {id:"be-TOU-004",officialCode:"BE-TOU-004",name:"Schengen C Tourist - Family Friends Visit 90/180 Days Family Friends Visit C Family Friends Belgium",toCountry:"be",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C family friends visit Belgium",validity:"90/180 days family friends visit C family friends Belgium",docs:"Invitation Annexe 3bis + Host ID residence Belgium + Relationship proof + Host accommodation Belgium + Host financial sponsorship + Passport + Photo + Flight + Hotel + Insurance + Bank + Employment + Cover letter + C family friends visit application VFS",warningBox:"MOST IMPORTANT: Annexe 3bis Prise en Charge - Invitation Form Belgium"},
  {id:"be-TOU-005",officialCode:"BE-TOU-005",name:"ETIAS Travel Authorization 3Y ETIAS Travel Authorization 3Y ETIAS Belgium",toCountry:"be",fromCountry:"us",category:"tourist",record_type:"ETA_VISA",fee:"EUR 7 ETIAS 3Y Belgium",validity:"3Y ETIAS travel authorization 3Y ETIAS Belgium",docs:"Passport + Photo + Flight + Hotel + ETIAS application travel-europe.europa.eu"},
  {id:"be-TOU-006",officialCode:"BE-TOU-006",name:"Belgium National D Visitor 1Y National D Visitor 1Y Visitor National D Belgium",toCountry:"be",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 180 National D visitor 1Y Belgium",validity:"1Y national D visitor 1Y visitor national D Belgium",docs:"Invitation national D Belgium + Host ID residence national D + Relationship proof + Accommodation national D + Financial means national D + Insurance national D + National D visitor application VFS"},
  {id:"be-BIZ-001",officialCode:"BE-BIZ-001",name:"Schengen C Business 90/180 Days Belgium C Business 90/180 Days - Most common Business Belgium",toCountry:"be",fromCountry:"us",category:"business",record_type:"BUSINESS_VISA",fee:"EUR 90 C business Belgium 90/180",validity:"90/180 days C business Belgium",docs:"Company invitation Belgium C + Belgian company registration BCE/KBO + Foreign company letter + Business card + Business registration foreign + Business invitation + Business proof + Insurance EUR 30000 + Bank 3M + Employment + C business application VFS Belgium"},
  {id:"be-BIZ-002",officialCode:"BE-BIZ-002",name:"Belgium Self Employed Professional Card 1Y 4Y Self Employed Professional Card 1Y 4Y Self Employed Belgium - Carte Professionnelle",toCountry:"be",fromCountry:"us",category:"business",record_type:"ENTREPRENEUR_VISA",fee:"EUR 180 Self employed professional card 1Y 4Y Belgium + Carte professionnelle",validity:"1Y 4Y self employed professional card 1Y 4Y self employed Belgium",docs:"Business plan Belgium self employed + Company registration BCE self employed + Professional card application + Financial means self employed + Self employed proof + Clients + Self employed professional card application VFS",warningBox:"MOST IMPORTANT: Carte Professionnelle/Beroepskaart - Professional Card Self Employed Belgium"},
  {id:"be-WRK-001",officialCode:"BE-WRK-001",name:"Belgium Work Permit B Single Permit 1Y 4Y Belgium Work Permit B Single Permit 1Y 4Y - Most common Work Permit Belgium",toCountry:"be",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 180 Work permit B single permit 1Y 4Y + Company + Region",validity:"1Y 4Y work permit B single permit 1Y 4Y + Residence",docs:"Job offer Belgium work permit B + Employment contract Belgium work permit B + Employer registration Belgium + Company registration BCE work permit B + Work permit B + Single permit + Region authorization Flanders/Wallonia/Brussels + Salary + Work permit B application VFS",warningBox:"✅ Most common work permit Belgium Single Permit Work Permit B + Region Flanders Wallonia Brussels + BCE"},
  {id:"be-WRK-002",officialCode:"BE-WRK-002",name:"EU Blue Card 1Y 4Y Belgium EU Blue Card 1Y 4Y Blue Card Work Belgium",toCountry:"be",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 180 EU Blue Card 1Y 4Y + Highly qualified + Salary EUR 62233",validity:"1Y 4Y EU blue card 1Y 4Y blue card work Belgium",docs:"Highly qualified job offer Belgium Blue Card + Employment contract Belgium Blue Card + Employer registration + Company registration BCE Blue Card + Degree + Salary EUR 62233+ + Blue Card application VFS"},
  {id:"be-WRK-003",officialCode:"BE-WRK-003",name:"ICT Intra Corporate Transfer 1Y 3Y ICT 1Y 3Y ICT Work Belgium",toCountry:"be",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 180 ICT 1Y 3Y + Company ICT + ICT",validity:"1Y 3Y ICT intra corporate transfer 1Y 3Y ICT work Belgium",docs:"ICT offer Belgium + Employment contract Belgium ICT + Employer registration + Company registration BCE ICT + Company relationship + ICT proof + Salary + Qualifications + ICT application VFS"},
  {id:"be-WRK-004",officialCode:"BE-WRK-004",name:"Belgium Work Permit - Researcher 1Y 4Y Researcher 1Y 4Y Researcher Work Belgium",toCountry:"be",fromCountry:"us",category:"work",record_type:"RESEARCH_VISA",fee:"EUR 180 Researcher 1Y 4Y Belgium",validity:"1Y 4Y researcher 1Y 4Y researcher work Belgium",docs:"Researcher hosting agreement Belgium + Research institution registration + Research project + Qualifications + Researcher application VFS"},
  {id:"be-WRK-005",officialCode:"BE-WRK-005",name:"Belgium Work Permit - Au Pair 1Y Au Pair 1Y Au Pair Work Belgium",toCountry:"be",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 180 Au pair 1Y Belgium",validity:"1Y au pair 1Y au pair work Belgium",docs:"Au pair family invitation Belgium + Au pair agreement + Family registration Belgium au pair + Au pair proof + Age 18-26 + Au pair application VFS"},
  {id:"be-STU-001",officialCode:"BE-STU-001",name:"Belgium Residence Permit Student 1Y Belgium Residence Permit Student 1Y - Most common Student Belgium",toCountry:"be",fromCountry:"us",category:"student",record_type:"STUDENT_VISA",fee:"EUR 200 Student residence permit 1Y Belgium + University",validity:"1Y student residence permit 1Y + Residence",docs:"Offer of place Belgium education provider + Education provider registration Belgium + Admission letter + Tuition fee receipt + Financial means EUR 803/month + Accommodation + Insurance + Student residence permit application VFS",warningBox:"✅ Most common student Belgium Residence Permit Student 1Y + University admission + EUR 803/month"},
  {id:"be-FAM-001",officialCode:"BE-FAM-001",name:"Belgium Residence Permit Family Reunification 1Y Belgium Residence Permit Family Reunification 1Y - Most common Family Belgium",toCountry:"be",fromCountry:"us",category:"family",record_type:"FAMILY_VISA",fee:"EUR 200 Family reunification 1Y Belgium",validity:"1Y family reunification 1Y family reunification Belgium",docs:"Relationship proof + Belgian family member residence + Marriage certificate OR Legal cohabitation proof attested + Belgian family member residence + Financial means Belgian family member 120% + Accommodation Belgian family member + Family reunification application VFS",warningBox:"✅ Most common family Belgium Family Reunification 1Y - VFS - Annexe 3bis"},
  {id:"be-FAM-002",officialCode:"BE-FAM-002",name:"Schengen C Family Visit 90/180 Days Belgium C Family Visit 90/180 Days Family Visit C Belgium",toCountry:"be",fromCountry:"us",category:"family",record_type:"FAMILY_VISA",fee:"EUR 90 C family visit Belgium",validity:"90/180 days C family visit Belgium",docs:"Relationship proof + Belgian family member residence + Marriage certificate OR Birth certificate + Belgian family member residence + Financial means + Accommodation + Insurance + C family visit application VFS"},
  {id:"be-PR-001",officialCode:"BE-PR-001",name:"Belgium Permanent Residence 5Y Belgium Permanent Residence 5Y - PR Belgium",toCountry:"be",fromCountry:"us",category:"pr",record_type:"PR_VISA",fee:"EUR 0 Permanent residence 5Y Belgium PR",validity:"Permanent permanent residence 5Y PR Belgium",docs:"Residence history 5Y Belgium permanent residence + Physical presence 5Y Belgium + Employment history 5Y Belgium + Language + Permanent residence application Immigration Office"},
  {id:"be-SPE-001",officialCode:"BE-SPE-001",name:"Belgium Job Seeker 1Y Job Seeker 1Y Job Seeker Belgium - Graduate",toCountry:"be",fromCountry:"us",category:"work",record_type:"JOB_SEEKER_VISA",fee:"EUR 180 Job seeker 1Y Belgium",validity:"1Y job seeker 1Y job seeker Belgium",docs:"Degree Belgium + Graduation certificate + Financial means + Accommodation + Insurance + Job seeker application Immigration Office"},
  {id:"be-SUP-001",officialCode:"BE-SUP-001",name:"Single Permit Authority Single Permit Authority Work Single Permit Belgium",toCountry:"be",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"Single Permit = Single permit - Work + Single permit + Single permit authority + Single permit Belgium Region Flanders Wallonia Brussels"},
  {id:"be-SUP-002",officialCode:"BE-SUP-002",name:"Carte Professionnelle Authority Carte Professionnelle Authority Business Carte Professionnelle Belgium",toCountry:"be",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"Carte professionnelle = Carte professionnelle/Beroepskaart - Business + Carte professionnelle + Carte professionnelle authority + Professional card self employed Belgium"},
  {id:"be-SUP-003",officialCode:"BE-SUP-003",name:"BCE Authority BCE KBO Authority Business BCE Belgium",toCountry:"be",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"BCE/KBO = Banque-Carrefour des Entreprises - Business + BCE/KBO + BCE/KBO authority + BCE Belgium"},
  {id:"be-LEG-001",officialCode:"BE-LEG-001",name:"Legacy Work Permit A Old System Closed Replaced by New Single Permit Work Permit B Belgium",toCountry:"be",fromCountry:"us",category:"pr",record_type:"LEGACY_VISA",fee:"-",validity:"-",docs:"Legacy closed - Old work permit A old system closed replaced by new single permit work permit B Belgium"}
];

function convertRawToVisaItem(item: RawBelgiumItem): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
  const details = getBelgiumMicroDetails(item.id, item.category, item.name);

  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    categoryCode: item.category,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    purpose: `Official ${item.category} visa and residence permit entry for Belgium (Immigration Office / VFS Global).`,
    eligibility: "Valid passport with min 3 months validity, 2 blank pages, travel medical insurance EUR 30,000, confirmed travel itinerary / employment contract / university admission / Annexe 3bis, and financial proof.",
    popular: item.id === 'be-TOU-001' || item.id === 'be-BIZ-001' || item.id === 'be-WRK-001' || item.id === 'be-STU-001' || item.id === 'be-FAM-001' || item.id === 'be-PR-001',
    highlight: item.id === 'be-TOU-001' || item.id === 'be-WRK-001' || item.id === 'be-STU-001' || item.id === 'be-FAM-001',
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

export const BELGIUM_22_VISAS: CountryVisas = {
  tourist: RAW_BE_ITEMS.filter(i => i.category === 'tourist').map(convertRawToVisaItem),
  business: RAW_BE_ITEMS.filter(i => i.category === 'business').map(convertRawToVisaItem),
  work: RAW_BE_ITEMS.filter(i => i.category === 'work').map(convertRawToVisaItem),
  student: RAW_BE_ITEMS.filter(i => i.category === 'student').map(convertRawToVisaItem),
  family: RAW_BE_ITEMS.filter(i => i.category === 'family').map(convertRawToVisaItem),
  pr: RAW_BE_ITEMS.filter(i => i.category === 'pr').map(convertRawToVisaItem)
};
