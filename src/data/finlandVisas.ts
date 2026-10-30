import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getFinlandMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "Finland C Short Stay Visa requires proof of min EUR 30/day + hotel booking + round-trip ticket + travel medical insurance (min EUR 30,000).";
  let fundsBankMonths = "Last 3 months personal bank statements stamped by bank branch.";
  let fundsSudden = "❌ Sudden cash deposits right before visa submission at VFS Finland / Migri are strictly audited. Maintain steady balance over 3 months.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement with EUR 30/day liquid funds. ❌ Galat: Sudden deposit 24 hours prior to appointment.";

  let itrYears = "Income Tax Returns (ITR) or tax notices for past 2 years.";
  let itrMatch = "Declared income must align with bank account credits and employment contract.";
  let itrNoItr = "Not required for short-term visitors fully sponsored by host via invitation letter.";

  let bankMonths = "Last 3 months bank statements.";
  let bankReg = "Regular salary credits or business revenue.";
  let bankFd = "Fixed deposits accepted as secondary financial proof.";
  let bankSource = "Salary, business income, or verified sponsor funds.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('ttol') || lowerCode.includes('blue-card')) {
    fundsMin = "Finland Work Permit (TTOL Employed Person / Specialist) requires a binding job offer from a Finnish employer + gross monthly salary meeting ELY/Migri threshold (approx EUR 1,400+ for TTOL, EUR 3,000+ for Specialist).";
    fundsBankMonths = "Employer employment contract, salary proof, and 3 months personal bank statements.";
    fundsSudden = "Contract must state gross monthly salary, duration, and position.";
    fundsEx = "✅ Sahi: Signed employment contract + ELY/Migri registration + 3M bank statements. ❌ Galat: Salary below threshold.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('phd')) {
    fundsMin = "Finland Student Residence Permit requires official admission letter from an accredited Finnish university + tuition fee receipt + proof of living funds of at least EUR 800/month in a bank account.";
    fundsBankMonths = "3 months bank statements showing min EUR 800/month liquid balance.";
    fundsSudden = "Sponsor or personal bank statement must prove regular financial availability.";
    fundsEx = "✅ Sahi: University acceptance letter + EUR 800/month bank proof. ❌ Galat: Unverified sponsor funds.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('reagrupamento')) {
    fundsMin = "Finland Family Reunification Residence Permit requires sponsor residing in Finland to demonstrate financial capability (min EUR 1,700/month income) + accommodation proof.";
    fundsBankMonths = "3-6 months sponsor bank statements, tax returns (Skatteoplysninger/Verotodistus).";
    fundsSudden = "Documentation must prove regular financial support.";
    fundsEx = "✅ Sahi: Sponsor income proof (EUR 1,700+/month) + marriage/cohabitation proof. ❌ Galat: Sponsor income below threshold.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('start-up')) {
    fundsMin = "Finland C Business / Start-up Entrepreneur requires an official invitation letter from a company registered in VTJ + for Start-up Entrepreneur, Business Finland statement (Innovation).";
    fundsBankMonths = "3-6 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Finnish company must be active in VTJ commercial registry.";
    fundsEx = "✅ Sahi: Official invitation on Finnish firm letterhead + VTJ registration + Business Finland statement. ❌ Galat: Unregistered host firm.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('pysyvä') || lowerCode.includes('spe')) {
    fundsMin = "Finland Permanent Residence (Pysyvä oleskelulupa) requires 4 years continuous legal residence + employment history + Finnish language test (min Level 2/CIPLE A2 equivalent).";
    fundsBankMonths = "4 years residence history, tax returns, and bank statements.";
    fundsSudden = "Continuous residence history evaluated by Migri.";
    fundsEx = "✅ Sahi: 4 years legal residence + Finnish level 2 certificate. ❌ Galat: Unexcused gap in legal stay or tax arrears.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

interface RawFinlandItem {
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

const RAW_FI_ITEMS: RawFinlandItem[] = [
  {id:"fi-TOU-001",officialCode:"FI-TOU-001",name:"Schengen C Tourist Visa 90/180 Days Finland C Tourist 90/180 Days - Most common Tourist Finland",toCountry:"fi",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C tourist Finland 90/180",validity:"90/180 days C tourist Finland",docs:"Passport 3M 2 blank + Photo 47x36 white Schengen + Flight return + Hotel all Finland + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + C tourist Finland application VFS Finland + Passport + Photo + Flight + Hotel + Insurance + Bank + Employment + Cover letter",fundsBox:"EUR 30/day = Bank 3M EUR 30/day = C tourist Finland VFS",warningBox:"✅ Most common tourist Finland C Tourist 90/180 Days - VFS Finland Migri"},
  {id:"fi-TOU-002",officialCode:"FI-TOU-002",name:"Schengen C Tourist Multiple 1Y 5Y 90/180 Days C Tourist Multiple 1Y 5Y Finland",toCountry:"fi",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C tourist multiple 1Y 5Y Finland",validity:"1Y 5Y multiple 90/180 days per 180 days C tourist multiple Finland",docs:"Passport + Photo + Flight + Hotel + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + Travel history Schengen + C tourist multiple application VFS Finland"},
  {id:"fi-TOU-003",officialCode:"FI-TOU-003",name:"Schengen A Transit Airport Transit A Airport Transit Finland",toCountry:"fi",fromCountry:"us",category:"tourist",record_type:"TRANSIT_VISA",fee:"EUR 90 A transit Finland",validity:"24H A transit airport transit Finland",docs:"Passport 3M + Onward ticket within 24H + Flight within 24H + Visa third country + A transit application VFS"},
  {id:"fi-TOU-004",officialCode:"FI-TOU-004",name:"Schengen C Tourist - Family Friends Visit 90/180 Days Family Friends Visit C Family Friends Finland",toCountry:"fi",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C family friends visit Finland",validity:"90/180 days family friends visit C family friends Finland",docs:"Invitation + Host ID residence Finland + Relationship proof + Host accommodation Finland + Host financial sponsorship + Passport + Photo + Flight + Hotel + Insurance + Bank + Employment + Cover letter + C family friends visit application VFS"},
  {id:"fi-TOU-005",officialCode:"FI-TOU-005",name:"ETIAS Travel Authorization 3Y ETIAS Travel Authorization 3Y ETIAS Finland",toCountry:"fi",fromCountry:"us",category:"tourist",record_type:"ETA_VISA",fee:"EUR 7 ETIAS 3Y Finland",validity:"3Y ETIAS travel authorization 3Y ETIAS Finland",docs:"Passport + Photo + Flight + Hotel + ETIAS application travel-europe.europa.eu"},
  {id:"fi-TOU-006",officialCode:"FI-TOU-006",name:"Finland National D Visitor 1Y National D Visitor 1Y Visitor National D Finland",toCountry:"fi",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 120 National D visitor 1Y Finland",validity:"1Y national D visitor 1Y visitor national D Finland",docs:"Invitation national D Finland + Host ID residence national D + Relationship proof + Accommodation national D + Financial means national D + Insurance national D + National D visitor application Migri"},
  {id:"fi-TOU-007",officialCode:"FI-TOU-007",name:"Finland Remote Work Digital Nomad 1Y 4Y Remote Work Digital Nomad 1Y 4Y Digital Nomad Finland - D Visa Remote Work",toCountry:"fi",fromCountry:"us",category:"tourist",record_type:"DIGITAL_NOMAD_VISA",fee:"EUR 380 Remote work digital nomad 1Y 4Y Finland + Income EUR 3000",validity:"1Y 4Y remote work digital nomad 1Y 4Y digital nomad Finland",docs:"Digital nomad contract Finland remote work + Remote work proof + Employment + Income EUR 3000/month + Bank + Accommodation + Remote work digital nomad application VFS Migri",warningBox:"MOST IMPORTANT: Remote Work D Visa - Digital Nomad Finland EUR 3000/month"},
  {id:"fi-TOU-008",officialCode:"FI-TOU-008",name:"Finland D - Tourist Medical 90/180 Days Medical Treatment C Medical Finland",toCountry:"fi",fromCountry:"us",category:"tourist",record_type:"MEDICAL_VISA",fee:"EUR 90 C medical treatment Finland",validity:"90/180 days medical treatment C medical Finland",docs:"Hospital appointment letter Finland hospital C + Medical certificate + Treatment plan + Medical institution guarantee + Hospital registration + Advance payment + Insurance EUR 30000 + Bank 3M + Medical treatment C application VFS"},
  {id:"fi-BIZ-001",officialCode:"FI-BIZ-001",name:"Schengen C Business 90/180 Days Finland C Business 90/180 Days - Most common Business Finland",toCountry:"fi",fromCountry:"us",category:"business",record_type:"BUSINESS_VISA",fee:"EUR 90 C business Finland 90/180",validity:"90/180 days C business Finland",docs:"Company invitation Finland C + Finnish company registration VTJ + Foreign company letter + Business card + Business registration foreign + Business invitation + Business proof + Insurance EUR 30000 + Bank 3M + Employment + C business application VFS Finland"},
  {id:"fi-BIZ-002",officialCode:"FI-BIZ-002",name:"Finland Start-up Entrepreneur 2Y Start-up Entrepreneur 2Y Start-up Finland - Business Finland",toCountry:"fi",fromCountry:"us",category:"business",record_type:"ENTREPRENEUR_VISA",fee:"EUR 380 Start-up entrepreneur 2Y Finland + Business Finland",validity:"2Y start-up entrepreneur 2Y start-up entrepreneur Finland",docs:"Business plan Finland start-up + Business Finland statement + Innovation approval + Company registration VTJ start-up + Financial means + Start-up entrepreneur application VFS Migri",warningBox:"MOST IMPORTANT: Start-up Entrepreneur - Business Finland Statement + Innovation"},
  {id:"fi-BIZ-003",officialCode:"FI-BIZ-003",name:"Finland Self Employed 1Y Self Employed 1Y Self Employed Finland",toCountry:"fi",fromCountry:"us",category:"business",record_type:"ENTREPRENEUR_VISA",fee:"EUR 380 Self employed 1Y Finland + Company",validity:"1Y self employed 1Y self employed Finland",docs:"Business plan Finland self employed + Company registration VTJ self employed + Financial means self employed + Self employed proof + Clients + Self employed application Migri"},
  {id:"fi-WRK-001",officialCode:"FI-WRK-001",name:"Finland Work Permit Employed Person TTOL 1Y 4Y Finland Work Permit Employed Person TTOL 1Y 4Y - Most common Work Permit Finland",toCountry:"fi",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 380 Work permit TTOL 1Y 4Y + Company",validity:"1Y 4Y work permit TTOL 1Y 4Y + Residence",docs:"Job offer Finland TTOL + Employment contract Finland TTOL + Employer registration Finland + Company registration VTJ TTOL + Work permit TTOL + Salary + TTOL application Migri + Job offer TTOL + Employment contract TTOL + Employer + Company registration TTOL + Work permit TTOL + Salary + TTOL application",warningBox:"✅ Most common work permit Finland TTOL Employed Person + Migri + ELY"},
  {id:"fi-WRK-002",officialCode:"FI-WRK-002",name:"Finland Work Permit - Specialist 1Y 4Y Specialist 1Y 4Y Specialist Work Finland",toCountry:"fi",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 380 Specialist 1Y 4Y Finland",validity:"1Y 4Y specialist 1Y 4Y specialist work Finland",docs:"Specialist job offer Finland + Employment contract Finland specialist + Employer registration + Company registration VTJ specialist + Degree + Work permit specialist + Salary EUR 3000+ + Specialist application Migri"},
  {id:"fi-WRK-003",officialCode:"FI-WRK-003",name:"EU Blue Card 1Y 4Y Finland EU Blue Card 1Y 4Y Blue Card Work Finland",toCountry:"fi",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 380 EU Blue Card 1Y 4Y + Highly qualified + Salary EUR 3565",validity:"1Y 4Y EU blue card 1Y 4Y blue card work Finland",docs:"Highly qualified job offer Finland Blue Card + Employment contract Finland Blue Card + Employer registration + Company registration VTJ Blue Card + Degree + Salary EUR 3565+ + Blue Card application Migri"},
  {id:"fi-WRK-004",officialCode:"FI-WRK-004",name:"ICT Intra Corporate Transfer 1Y 3Y ICT 1Y 3Y ICT Work Finland",toCountry:"fi",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 380 ICT 1Y 3Y + Company ICT + ICT",validity:"1Y 3Y ICT intra corporate transfer 1Y 3Y ICT work Finland",docs:"ICT offer Finland + Employment contract Finland ICT + Employer registration + Company registration VTJ ICT + Company relationship + ICT proof + Salary + Qualifications + ICT application Migri"},
  {id:"fi-WRK-005",officialCode:"FI-WRK-005",name:"Finland Work Permit - Researcher 1Y 4Y Researcher 1Y 4Y Researcher Work Finland",toCountry:"fi",fromCountry:"us",category:"work",record_type:"RESEARCH_VISA",fee:"EUR 380 Researcher 1Y 4Y Finland",validity:"1Y 4Y researcher 1Y 4Y researcher work Finland",docs:"Researcher hosting agreement Finland + Research institution registration + Research project + Qualifications + Researcher application Migri"},
  {id:"fi-WRK-006",officialCode:"FI-WRK-006",name:"Finland Work Permit - Seasonal Work 9M Seasonal Work 9M Seasonal Work Finland",toCountry:"fi",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"EUR 380 Seasonal work 9M Finland",validity:"9M seasonal work 9M seasonal work Finland",docs:"Seasonal job offer Finland + Employment contract Finland seasonal + Employer registration + Company registration VTJ seasonal + Seasonal work permit + Seasonal proof + Salary + Seasonal work application Migri"},
  {id:"fi-WRK-007",officialCode:"FI-WRK-007",name:"Finland Work Permit - Growth Entrepreneur 2Y Growth Entrepreneur 2Y Growth Entrepreneur Finland",toCountry:"fi",fromCountry:"us",category:"work",record_type:"ENTREPRENEUR_VISA",fee:"EUR 380 Growth entrepreneur 2Y Finland",validity:"2Y growth entrepreneur 2Y growth entrepreneur Finland",docs:"Growth entrepreneur business plan Finland + Company registration VTJ growth + Investment + Growth entrepreneur proof + Business plan + Investment proof + Financial means + Growth entrepreneur application Migri"},
  {id:"fi-STU-001",officialCode:"FI-STU-001",name:"Finland Residence Permit Student 1Y Finland Residence Permit Student 1Y - Most common Student Finland",toCountry:"fi",fromCountry:"us",category:"student",record_type:"STUDENT_VISA",fee:"EUR 380 Student residence permit 1Y Finland + University",validity:"1Y student residence permit 1Y + Residence",docs:"Offer of place Finland education provider + Education provider registration Finland + Admission letter + Tuition fee receipt + Financial means EUR 800/month + Accommodation + Insurance + Student residence permit application Migri",warningBox:"✅ Most common student Finland Residence Permit Student 1Y + University admission + EUR 800/month"},
  {id:"fi-STU-002",officialCode:"FI-STU-002",name:"Schengen C Student 90/180 Days Finland C Student 90/180 Days Student C Finland",toCountry:"fi",fromCountry:"us",category:"student",record_type:"STUDENT_VISA",fee:"EUR 90 C student Finland",validity:"90/180 days C student Finland",docs:"Short course offer Finland + Education provider registration Finland C + Admission letter C + Tuition fee receipt C + Financial means + Accommodation + Insurance + C student application VFS"},
  {id:"fi-STU-003",officialCode:"FI-STU-003",name:"Finland PhD Student 4Y PhD Student 4Y PhD Student Finland",toCountry:"fi",fromCountry:"us",category:"student",record_type:"STUDENT_VISA",fee:"EUR 380 PhD student 4Y Finland",validity:"4Y PhD student 4Y PhD student Finland",docs:"PhD offer Finland university + University registration Finland PhD + PhD research proposal + Admission letter PhD + Financial means PhD + Accommodation PhD + Insurance PhD + PhD student application Migri"},
  {id:"fi-FAM-001",officialCode:"FI-FAM-001",name:"Finland Residence Permit Family Reunification 1Y 4Y Finland Residence Permit Family Reunification 1Y 4Y - Most common Family Finland",toCountry:"fi",fromCountry:"us",category:"family",record_type:"FAMILY_VISA",fee:"EUR 470 Family reunification 1Y 4Y Finland",validity:"1Y 4Y family reunification 1Y 4Y family reunification Finland",docs:"Relationship proof + Finnish family member residence + Marriage certificate OR Cohabitation proof attested + Finnish family member residence + Financial means Finnish family member EUR 1700/month + Accommodation Finnish family member + Family reunification application Migri",warningBox:"✅ Most common family Finland Family Reunification 1Y 4Y - Migri - EUR 1700/month"},
  {id:"fi-FAM-002",officialCode:"FI-FAM-002",name:"Schengen C Family Visit 90/180 Days Finland C Family Visit 90/180 Days Family Visit C Finland",toCountry:"fi",fromCountry:"us",category:"family",record_type:"FAMILY_VISA",fee:"EUR 90 C family visit Finland",validity:"90/180 days C family visit Finland",docs:"Relationship proof + Finnish family member residence + Marriage certificate OR Birth certificate + Finnish family member residence + Financial means + Accommodation + Insurance + C family visit application VFS"},
  {id:"fi-FAM-003",officialCode:"FI-FAM-003",name:"Finland Residence Permit - Child 1Y Child 1Y Child Finland",toCountry:"fi",fromCountry:"us",category:"family",record_type:"FAMILY_VISA",fee:"EUR 0 Child 1Y Finland",validity:"1Y child 1Y child Finland",docs:"Relationship proof child Finland + Finnish parent residence + Birth certificate attested + Finnish parent residence + Financial means + Accommodation + Child application Migri"},
  {id:"fi-PR-001",officialCode:"FI-PR-001",name:"Finland Permanent Residence P 4Y Finland Permanent Residence P 4Y - PR Finland - Pysyvä oleskelulupa",toCountry:"fi",fromCountry:"us",category:"pr",record_type:"PR_VISA",fee:"EUR 0 Permanent residence P 4Y Finland PR",validity:"Permanent permanent residence P 4Y PR Finland pysyvä oleskelulupa P",docs:"Residence history 4Y Finland permanent residence P + Physical presence 4Y Finland + Employment history 4Y Finland + Language Finnish + Permanent residence P application Migri"},
  {id:"fi-PR-002",officialCode:"FI-PR-002",name:"EU Long Term Residence 5Y EU Long Term Residence 5Y - PR Finland",toCountry:"fi",fromCountry:"us",category:"pr",record_type:"PR_VISA",fee:"EUR 0 EU long term residence 5Y Finland",validity:"5Y EU long term residence 5Y PR Finland",docs:"Residence history 5Y Finland + Physical presence 5Y Finland + Employment history 5Y Finland + Language Finnish + Integration + EU long term residence 5Y application Migri"},
  {id:"fi-SPE-001",officialCode:"FI-SPE-001",name:"Finland Job Seeker 2Y Job Seeker 2Y Job Seeker Finland - Research Completed",toCountry:"fi",fromCountry:"us",category:"pr",record_type:"JOB_SEEKER_VISA",fee:"EUR 380 Job seeker 2Y Finland",validity:"2Y job seeker 2Y job seeker Finland",docs:"Degree Finland + Graduation certificate + Financial means EUR 800/month + Accommodation + Insurance + Job seeker application Migri"},
  {id:"fi-SPE-002",officialCode:"FI-SPE-002",name:"Finland Working Holiday 1Y Working Holiday 1Y Working Holiday Finland",toCountry:"fi",fromCountry:"us",category:"pr",record_type:"WORKING_HOLIDAY_VISA",fee:"EUR 380 Working holiday 1Y Finland",validity:"1Y working holiday 1Y working holiday Finland",docs:"Working holiday invitation Finland + Age 18-30 + Financial means EUR 2000 + Working holiday application Migri"},
  {id:"fi-SUP-001",officialCode:"FI-SUP-001",name:"Migri Authority Migri Authority Visa Migri Finland - Maahanmuuttovirasto",toCountry:"fi",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"Migri = Finnish Immigration Service Maahanmuuttovirasto - Visa + Residence + Migri authority + migri.fi Migri"},
  {id:"fi-SUP-002",officialCode:"FI-SUP-002",name:"Business Finland Authority Business Finland Authority Business Business Finland",toCountry:"fi",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"Business Finland = Business Finland - Business + Business Finland + Business Finland authority + Start-up Entrepreneur statement"},
  {id:"fi-SUP-003",officialCode:"FI-SUP-003",name:"TTOL Authority TTOL Authority Work TTOL Finland",toCountry:"fi",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"TTOL = Työntekijän oleskelulupa - Employed Person - Work + TTOL + TTOL authority + Työntekijän oleskelulupa Finland"},
  {id:"fi-LEG-001",officialCode:"FI-LEG-001",name:"Legacy D Visa Entrepreneur Old System Closed Replaced by New Start-up Entrepreneur Business Finland",toCountry:"fi",fromCountry:"us",category:"pr",record_type:"LEGACY_VISA",fee:"-",validity:"-",docs:"Legacy closed - Old D visa entrepreneur old system closed new start-up entrepreneur Business Finland"},
  {id:"fi-LEG-002",officialCode:"FI-LEG-002",name:"Legacy Seasonal 3M Old System Closed Replaced by New Seasonal 9M Finland",toCountry:"fi",fromCountry:"us",category:"pr",record_type:"LEGACY_VISA",fee:"-",validity:"-",docs:"Legacy closed - Old seasonal 3M old system closed new seasonal 9M Finland"}
];

function convertRawToVisaItem(item: RawFinlandItem): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
  const details = getFinlandMicroDetails(item.id, item.category, item.name);

  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    categoryCode: item.category,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    purpose: `Official ${item.category} visa and residence permit entry for Finland (Migri).`,
    eligibility: "Valid passport with min 3 months validity, 2 blank pages, travel medical insurance EUR 30,000, confirmed travel itinerary / employment contract / university admission, and financial proof.",
    popular: item.id === 'fi-TOU-001' || item.id === 'fi-BIZ-001' || item.id === 'fi-WRK-001' || item.id === 'fi-STU-001' || item.id === 'fi-FAM-001' || item.id === 'fi-PR-001',
    highlight: item.id === 'fi-TOU-001' || item.id === 'fi-WRK-001' || item.id === 'fi-STU-001' || item.id === 'fi-FAM-001',
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

export const FINLAND_28_VISAS: CountryVisas = {
  tourist: RAW_FI_ITEMS.filter(i => i.category === 'tourist').map(convertRawToVisaItem),
  business: RAW_FI_ITEMS.filter(i => i.category === 'business').map(convertRawToVisaItem),
  work: RAW_FI_ITEMS.filter(i => i.category === 'work').map(convertRawToVisaItem),
  student: RAW_FI_ITEMS.filter(i => i.category === 'student').map(convertRawToVisaItem),
  family: RAW_FI_ITEMS.filter(i => i.category === 'family').map(convertRawToVisaItem),
  pr: RAW_FI_ITEMS.filter(i => i.category === 'pr').map(convertRawToVisaItem)
};
