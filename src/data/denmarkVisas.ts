import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getDenmarkMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "Denmark C Short Stay Visa requires proof of min DKK 350/day (approx EUR 45/day) + hotel booking + round-trip ticket + travel medical insurance (min EUR 30,000).";
  let fundsBankMonths = "Last 3 months personal bank statements stamped by bank branch.";
  let fundsSudden = "❌ Sudden cash deposits right before visa submission at VFS Denmark / SIRI are strictly audited. Maintain steady balance over 3 months.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement with DKK 350/day liquid funds. ❌ Galat: Sudden deposit 24 hours prior to appointment.";

  let itrYears = "Income Tax Returns (ITR) or tax notices for past 2 years.";
  let itrMatch = "Declared income must align with bank account credits and employment contract.";
  let itrNoItr = "Not required for short-term visitors fully sponsored by host via VU1/VU2 form.";

  let bankMonths = "Last 3 months bank statements.";
  let bankReg = "Regular salary credits or business revenue.";
  let bankFd = "Fixed deposits accepted as secondary financial proof.";
  let bankSource = "Salary, business income, or verified sponsor funds.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('pay-limit') || lowerCode.includes('positive-list')) {
    fundsMin = "Denmark Work Permit (Pay Limit Scheme / Positive List) requires a binding job offer from a Danish employer + gross annual salary meeting SIRI threshold (min DKK 514,000/year) + company registration in CVR (Det Centrale Virksomhedsregister).";
    fundsBankMonths = "Employer employment contract, salary proof, and 3 months personal bank statements.";
    fundsSudden = "Contract must state gross annual salary in DKK, job title, and position.";
    fundsEx = "✅ Sahi: Signed employment contract + CVR firm registration + 3M bank statements. ❌ Galat: Salary below DKK 514,000 threshold.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('phd')) {
    fundsMin = "Denmark Student Residence Permit requires official admission letter from an accredited Danish university + tuition fee receipt + proof of living funds of at least DKK 80,000 per year (approx DKK 6,666/month) in a bank account.";
    fundsBankMonths = "3 months bank statements showing min DKK 80,000 liquid balance.";
    fundsSudden = "Sponsor or personal bank statement must prove regular financial availability.";
    fundsEx = "✅ Sahi: University acceptance letter + DKK 80,000 bank proof. ❌ Galat: Unverified sponsor funds.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('reunification')) {
    fundsMin = "Denmark Family Reunification Residence Permit requires sponsor residing in Denmark to meet financial guarantee requirements (bank guarantee), accommodation proof, and meeting cohabitation/marriage criteria.";
    fundsBankMonths = "6 months sponsor bank statements, tax returns (Skatteoplysninger), and NIF-equivalent proof.";
    fundsSudden = "Bank guarantee (bankgaranti) is mandatory.";
    fundsEx = "✅ Sahi: Bank guarantee + sponsor income proof + apostilled marriage/cohabitation proof. ❌ Galat: Missing bank guarantee.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('start-up')) {
    fundsMin = "Denmark C Business / Start-up Denmark requires an official invitation letter from a company registered in CVR + for Start-up Denmark, expert panel approval (Innovation).";
    fundsBankMonths = "3-6 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Danish company must be active in CVR.";
    fundsEx = "✅ Sahi: Official invitation on Danish firm letterhead + CVR registration + Innovation approval. ❌ Galat: Unregistered host firm.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('residência-permanente') || lowerCode.includes('spe')) {
    fundsMin = "Denmark Permanent Residence requires 8 years continuous legal residence + employment history + Danish language test (min Level 2) + clean criminal record + tax clearance.";
    fundsBankMonths = "8 years residence history, tax assessments, and bank statements.";
    fundsSudden = "Continuous residence history evaluated by SIRI.";
    fundsEx = "✅ Sahi: 8 years legal residence + Danish 2 certificate + tax clearance. ❌ Galat: Unexcused gap in legal stay or tax arrears.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

interface RawDenmarkItem {
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

const RAW_DK_ITEMS: RawDenmarkItem[] = [
  {id:"dk-TOU-001",officialCode:"DK-TOU-001",name:"Schengen C Tourist Visa 90/180 Days Denmark C Tourist 90/180 Days - Most common Tourist Denmark",toCountry:"dk",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 / DKK 670 C tourist Denmark 90/180",validity:"90/180 days C tourist Denmark",docs:"Passport 3M 2 blank + Photo 35x45 white Schengen + Flight return + Hotel all Denmark + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + C tourist Denmark application VFS Denmark + Passport + Photo + Flight + Hotel + Insurance + Bank + Employment + Cover letter",fundsBox:"DKK 350/day = Bank 3M DKK 350/day = C tourist Denmark VFS",bankBox:"Bank 3M DKK 350/day original + Employment + Insurance EUR 30000",warningBox:"✅ Most common tourist Denmark C Tourist 90/180 Days - VFS Denmark SIRI"},
  {id:"dk-TOU-002",officialCode:"DK-TOU-002",name:"Schengen C Tourist Multiple 1Y 5Y 90/180 Days C Tourist Multiple 1Y 5Y Denmark",toCountry:"dk",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C tourist multiple 1Y 5Y Denmark",validity:"1Y 5Y multiple 90/180 days per 180 days C tourist multiple Denmark",docs:"Passport + Photo + Flight + Hotel + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + Travel history Schengen + C tourist multiple application VFS Denmark"},
  {id:"dk-TOU-003",officialCode:"DK-TOU-003",name:"Schengen A Transit Airport Transit A Airport Transit Denmark",toCountry:"dk",fromCountry:"us",category:"tourist",record_type:"TRANSIT_VISA",fee:"EUR 90 A transit Denmark",validity:"24H A transit airport transit Denmark",docs:"Passport 3M + Onward ticket within 24H + Flight within 24H + Visa third country + A transit application VFS"},
  {id:"dk-TOU-004",officialCode:"DK-TOU-004",name:"Schengen C Extension Extension C Denmark 90 Days Extension C Denmark",toCountry:"dk",fromCountry:"us",category:"tourist",record_type:"STATUS_DOCUMENT",fee:"DKK 0 C extension Denmark humanitarian",validity:"Extension 90 days C extension Denmark",docs:"Extension reason force majeure + Flight + Hotel + Insurance + Bank + Extension application SIRI"},
  {id:"dk-TOU-005",officialCode:"DK-TOU-005",name:"Schengen C Tourist - Family Friends Visit 90/180 Days Family Friends Visit C Family Friends Denmark",toCountry:"dk",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 C family friends visit Denmark",validity:"90/180 days family friends visit C family friends Denmark",docs:"Invitation VU1 VU2 form + Host ID residence Denmark + Relationship proof + Host accommodation Denmark + Host financial sponsorship + Passport + Photo + Flight + Hotel + Insurance + Bank + Employment + Cover letter + C family friends visit application VFS",warningBox:"MOST IMPORTANT: VU1/VU2 Invitation Form Denmark"},
  {id:"dk-TOU-006",officialCode:"DK-TOU-006",name:"ETIAS Travel Authorization 3Y ETIAS Travel Authorization 3Y ETIAS Denmark",toCountry:"dk",fromCountry:"us",category:"tourist",record_type:"ETA_VISA",fee:"EUR 7 ETIAS 3Y Denmark",validity:"3Y ETIAS travel authorization 3Y ETIAS Denmark",docs:"Passport + Photo + Flight + Hotel + ETIAS application travel-europe.europa.eu"},
  {id:"dk-TOU-007",officialCode:"DK-TOU-007",name:"Schengen C Tourist - Medical Treatment 90/180 Days Medical Treatment C Medical Denmark",toCountry:"dk",fromCountry:"us",category:"tourist",record_type:"MEDICAL_VISA",fee:"EUR 90 C medical treatment Denmark",validity:"90/180 days medical treatment C medical Denmark",docs:"Hospital appointment letter Denmark hospital C + Medical certificate + Treatment plan + Medical institution guarantee + Hospital registration + Advance payment + Insurance EUR 30000 + Bank 3M + Medical treatment C application VFS"},
  {id:"dk-TOU-008",officialCode:"DK-TOU-008",name:"Denmark National D Visitor 1Y National D Visitor 1Y Visitor National D Denmark",toCountry:"dk",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"DKK 1670 National D visitor 1Y Denmark",validity:"1Y national D visitor 1Y visitor national D Denmark",docs:"Invitation national D Denmark + Host ID residence national D + Relationship proof + Accommodation national D + Financial means national D + Insurance national D + National D visitor application SIRI"},
  {id:"dk-TOU-009",officialCode:"DK-TOU-009",name:"Faroe Islands Visa 90/180 Days Faroe Islands Visa 90/180 Days Faroe Islands Denmark",toCountry:"dk",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 Faroe Islands 90/180",validity:"90/180 days Faroe Islands visa 90/180 days Faroe Islands Denmark",docs:"Passport + Photo + Flight Faroe + Hotel Faroe + Insurance + Bank + Faroe Islands visa application VFS"},
  {id:"dk-TOU-010",officialCode:"DK-TOU-010",name:"Greenland Visa 90/180 Days Greenland Visa 90/180 Days Greenland Denmark",toCountry:"dk",fromCountry:"us",category:"tourist",record_type:"TOURIST_VISA",fee:"EUR 90 Greenland 90/180",validity:"90/180 days Greenland visa 90/180 days Greenland Denmark",docs:"Passport + Photo + Flight Greenland + Hotel Greenland + Insurance + Bank + Greenland visa application VFS"},
  {id:"dk-TOU-011",officialCode:"DK-TOU-011",name:"Schengen C Tourist - Cultural 90/180 Days Cultural C Cultural Denmark",toCountry:"dk",fromCountry:"us",category:"tourist",record_type:"CULTURAL_VISA",fee:"EUR 90 C cultural Denmark",validity:"90/180 days cultural C cultural Denmark",docs:"Cultural invitation Denmark + Cultural organization registration + Cultural details + Insurance + Bank + Cultural C application VFS"},
  {id:"dk-TOU-012",officialCode:"DK-TOU-012",name:"Denmark National D - Digital Nomad? No - Use Work Scheme Denmark",toCountry:"dk",fromCountry:"us",category:"tourist",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"Denmark has no digital nomad tourist - use work schemes"},
  {id:"dk-BIZ-001",officialCode:"DK-BIZ-001",name:"Schengen C Business 90/180 Days Denmark C Business 90/180 Days - Most common Business Denmark",toCountry:"dk",fromCountry:"us",category:"business",record_type:"BUSINESS_VISA",fee:"EUR 90 C business Denmark 90/180",validity:"90/180 days C business Denmark",docs:"Company invitation Denmark C + Danish company registration CVR + Foreign company letter + Business card + Business registration foreign + Business invitation + Business proof + Insurance EUR 30000 + Bank 3M + Employment + C business application VFS Denmark"},
  {id:"dk-BIZ-002",officialCode:"DK-BIZ-002",name:"Schengen C Business Multiple 1Y 5Y 90/180 Days C Business Multiple 1Y 5Y Denmark",toCountry:"dk",fromCountry:"us",category:"business",record_type:"BUSINESS_VISA",fee:"EUR 90 C business multiple 1Y 5Y Denmark",validity:"1Y 5Y multiple 90/180 days per 180 days C business multiple Denmark",docs:"Company invitation Denmark + Danish company registration + Foreign company letter + Business card + Business registration foreign + Business invitation + Business proof + Insurance + Bank + Employment + Travel history Schengen + C business multiple application VFS"},
  {id:"dk-BIZ-003",officialCode:"DK-BIZ-003",name:"Denmark National D Business 1Y National D Business 1Y Business National D Denmark",toCountry:"dk",fromCountry:"us",category:"business",record_type:"BUSINESS_VISA",fee:"DKK 4670 National D business 1Y Denmark",validity:"1Y national D business 1Y business national D Denmark",docs:"Company invitation Denmark national D + Danish company registration national D + Foreign company letter national D + Business card national D + Business invitation national D + Business proof national D + Insurance national D + Bank national D + National D business application SIRI"},
  {id:"dk-BIZ-004",officialCode:"DK-BIZ-004",name:"Denmark Start-up Denmark 2Y Start-up Denmark 2Y Start-up Denmark",toCountry:"dk",fromCountry:"us",category:"business",record_type:"ENTREPRENEUR_VISA",fee:"DKK 4670 Start-up Denmark 2Y + Innovation",validity:"2Y start-up Denmark 2Y start-up Denmark",docs:"Business plan Denmark start-up + SIRI expert panel + Innovation approval + Company registration CVR start-up + Financial means + Start-up Denmark application SIRI",warningBox:"MOST IMPORTANT: Start-up Denmark - Expert Panel Approval - Innovation"},
  {id:"dk-BIZ-005",officialCode:"DK-BIZ-005",name:"Denmark Self Employed 2Y Self Employed 2Y Self Employed Denmark",toCountry:"dk",fromCountry:"us",category:"business",record_type:"ENTREPRENEUR_VISA",fee:"DKK 4670 Self employed 2Y Denmark + Company",validity:"2Y self employed 2Y self employed Denmark",docs:"Business plan Denmark self employed + Company registration CVR self employed + Financial means self employed + Self employed proof + Clients + Self employed application SIRI"},
  {id:"dk-WRK-001",officialCode:"DK-WRK-001",name:"Denmark Work Permit Pay Limit Scheme 4Y Denmark Work Permit Pay Limit Scheme 4Y - Most common Work Permit Denmark",toCountry:"dk",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"DKK 4670 Pay Limit Scheme 4Y + Salary DKK 514000",validity:"4Y pay limit scheme 4Y + Residence",docs:"Job offer Denmark pay limit + Employment contract Denmark pay limit + Employer registration Denmark + Company registration CVR pay limit + Work permit pay limit + Salary DKK 514000+ + Pay Limit Scheme application SIRI + Job offer pay limit + Employment contract pay limit + Employer + Company registration pay limit + Work permit pay limit + Salary + Pay Limit Scheme application",warningBox:"✅ Most common work permit Denmark Pay Limit Scheme DKK 514000/year + SIRI"},
  {id:"dk-WRK-002",officialCode:"DK-WRK-002",name:"Denmark Work Permit Positive List Skilled 4Y Denmark Work Permit Positive List Skilled 4Y Positive List Denmark",toCountry:"dk",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"DKK 4670 Positive List Skilled 4Y Denmark",validity:"4Y positive list skilled 4Y positive list skilled Denmark",docs:"Positive List job offer Denmark + Employment contract Denmark positive list + Employer registration + Company registration CVR positive list + Degree + Work permit positive list + Salary + Positive List application SIRI"},
  {id:"dk-WRK-003",officialCode:"DK-WRK-003",name:"Denmark Work Permit Fast Track 4Y Denmark Work Permit Fast Track 4Y Fast Track Denmark",toCountry:"dk",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"DKK 4670 Fast Track 4Y Denmark + Certified company",validity:"4Y fast track 4Y fast track Denmark",docs:"Fast Track job offer Denmark + Employment contract Denmark fast track + Employer certification + Company registration CVR fast track + Work permit fast track + Salary + Fast Track application SIRI"},
  {id:"dk-WRK-004",officialCode:"DK-WRK-004",name:"EU Blue Card 1Y 4Y Denmark EU Blue Card 1Y 4Y Blue Card Work Denmark",toCountry:"dk",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"DKK 4670 EU Blue Card 1Y 4Y + Highly qualified + Salary DKK 514000",validity:"1Y 4Y EU blue card 1Y 4Y blue card work Denmark",docs:"Highly qualified job offer Denmark Blue Card + Employment contract Denmark Blue Card + Employer registration + Company registration CVR Blue Card + Degree + Salary DKK 514000+ + Blue Card application SIRI"},
  {id:"dk-WRK-005",officialCode:"DK-WRK-005",name:"Denmark Work Permit - Researcher 4Y Researcher 4Y Researcher Work Denmark",toCountry:"dk",fromCountry:"us",category:"work",record_type:"RESEARCH_VISA",fee:"DKK 4670 Researcher 4Y Denmark",validity:"4Y researcher 4Y researcher work Denmark",docs:"Researcher hosting agreement Denmark + Research institution registration + Research project + Qualifications + Researcher application SIRI"},
  {id:"dk-WRK-006",officialCode:"DK-WRK-006",name:"Denmark Work Permit - Trainee 1Y Trainee 1Y Trainee Work Denmark",toCountry:"dk",fromCountry:"us",category:"work",record_type:"INTERN_VISA",fee:"DKK 4670 Trainee 1Y Denmark",validity:"1Y trainee 1Y trainee work Denmark",docs:"Trainee offer Denmark + Trainee agreement + University enrollment + Trainee proof + Financial means + Trainee application SIRI"},
  {id:"dk-WRK-007",officialCode:"DK-WRK-007",name:"Denmark Work Permit - Herdsman Farm Manager 1Y Herdsman Farm Manager 1Y Herdsman Farm Manager Work Denmark",toCountry:"dk",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"DKK 4670 Herdsman farm manager 1Y Denmark",validity:"1Y herdsman farm manager 1Y herdsman farm manager work Denmark",docs:"Farm job offer Denmark + Employment contract Denmark herdsman + Employer registration + Company registration CVR herdsman + Work permit herdsman + Salary + Herdsman application SIRI"},
  {id:"dk-WRK-008",officialCode:"DK-WRK-008",name:"Denmark Work Permit - Athlete Coach 4Y Athlete Coach 4Y Athlete Coach Work Denmark",toCountry:"dk",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"DKK 4670 Athlete coach 4Y Denmark",validity:"4Y athlete coach 4Y athlete coach work Denmark",docs:"Sports contract Denmark athlete coach + Sports club invitation + Sports organization registration + Sports proof + Financial means + Athlete coach application SIRI"},
  {id:"dk-WRK-009",officialCode:"DK-WRK-009",name:"Denmark Work Permit - Au Pair 2Y Au Pair 2Y Au Pair Work Denmark",toCountry:"dk",fromCountry:"us",category:"work",record_type:"WORK_VISA",fee:"DKK 1670 Au pair 2Y Denmark",validity:"2Y au pair 2Y au pair work Denmark",docs:"Au pair family invitation Denmark + Au pair agreement + Family registration Denmark au pair + Au pair proof + Age 18-30 + Au pair application SIRI"},
  {id:"dk-WRK-010",officialCode:"DK-WRK-010",name:"Denmark Work Permit - Internship 1Y Internship 1Y Internship Work Denmark",toCountry:"dk",fromCountry:"us",category:"work",record_type:"INTERN_VISA",fee:"DKK 4670 Internship 1Y Denmark",validity:"1Y internship 1Y internship work Denmark",docs:"Internship offer Denmark + Internship agreement + University enrollment + Financial means + Internship application SIRI"},
  {id:"dk-STU-001",officialCode:"DK-STU-001",name:"Denmark Residence Permit Student 1Y Denmark Residence Permit Student 1Y - Most common Student Denmark",toCountry:"dk",fromCountry:"us",category:"student",record_type:"STUDENT_VISA",fee:"DKK 1670 Student residence permit 1Y Denmark + University",validity:"1Y student residence permit 1Y + Residence",docs:"Offer of place Denmark education provider + Education provider registration Denmark + Admission letter + Tuition fee receipt + Financial means DKK 80000/year + Accommodation + Insurance + Student residence permit application SIRI",warningBox:"✅ Most common student Denmark Residence Permit Student 1Y + University admission"},
  {id:"dk-STU-002",officialCode:"DK-STU-002",name:"Denmark Student Extension Extension Student 1Y Extension Student Denmark",toCountry:"dk",fromCountry:"us",category:"student",record_type:"STATUS_DOCUMENT",fee:"DKK 1670 Student extension 1Y Denmark",validity:"Extension 1Y student extension Denmark",docs:"Extension reason letter + Offer of place Denmark extension + Education provider registration Denmark extension + Admission letter extension + Tuition fee receipt extension + Financial means DKK 80000/year extension + Accommodation extension + Insurance extension + Extension application SIRI"},
  {id:"dk-STU-003",officialCode:"DK-STU-003",name:"Schengen C Student 90/180 Days Denmark C Student 90/180 Days Student C Denmark",toCountry:"dk",fromCountry:"us",category:"student",record_type:"STUDENT_VISA",fee:"EUR 90 C student Denmark",validity:"90/180 days C student Denmark",docs:"Short course offer Denmark + Education provider registration Denmark C + Admission letter C + Tuition fee receipt C + Financial means + Accommodation + Insurance + C student application VFS"},
  {id:"dk-STU-004",officialCode:"DK-STU-004",name:"Denmark PhD Student 3Y PhD Student 3Y PhD Student Denmark",toCountry:"dk",fromCountry:"us",category:"student",record_type:"STUDENT_VISA",fee:"DKK 4670 PhD student 3Y Denmark",validity:"3Y PhD student 3Y PhD student Denmark",docs:"PhD offer Denmark university + University registration Denmark PhD + PhD research proposal + Admission letter PhD + Financial means PhD + Accommodation PhD + Insurance PhD + PhD student application SIRI"},
  {id:"dk-FAM-001",officialCode:"DK-FAM-001",name:"Denmark Residence Permit Family Reunification 2Y Denmark Residence Permit Family Reunification 2Y - Most common Family Denmark",toCountry:"dk",fromCountry:"us",category:"family",record_type:"FAMILY_VISA",fee:"DKK 9345 Family reunification 2Y Denmark",validity:"2Y family reunification 2Y family reunification Denmark",docs:"Relationship proof + Danish family member residence + Marriage certificate OR Cohabitation proof attested + Danish family member residence + Financial means Danish family member + Accommodation Danish family member + Family reunification application SIRI",warningBox:"✅ Most common family Denmark Family Reunification 2Y - SIRI - DKK 9345"},
  {id:"dk-FAM-002",officialCode:"DK-FAM-002",name:"Schengen C Family Visit 90/180 Days Denmark C Family Visit 90/180 Days Family Visit C Denmark",toCountry:"dk",fromCountry:"us",category:"family",record_type:"FAMILY_VISA",fee:"EUR 90 C family visit Denmark",validity:"90/180 days C family visit Denmark",docs:"Relationship proof + Danish family member residence + Marriage certificate OR Birth certificate + Danish family member residence + Financial means + Accommodation + Insurance + C family visit application VFS"},
  {id:"dk-FAM-003",officialCode:"DK-FAM-003",name:"Denmark Residence Permit - Child 2Y Child 2Y Child Denmark",toCountry:"dk",fromCountry:"us",category:"family",record_type:"FAMILY_VISA",fee:"DKK 1670 Child 2Y Denmark",validity:"2Y child 2Y child Denmark",docs:"Relationship proof child Denmark + Danish parent residence + Birth certificate attested + Danish parent residence + Financial means + Accommodation + Child application SIRI"},
  {id:"dk-PR-001",officialCode:"DK-PR-001",name:"Denmark Permanent Residence Permanent Residence 5Y Denmark Permanent Residence 5Y - PR Denmark",toCountry:"dk",fromCountry:"us",category:"pr",record_type:"PR_VISA",fee:"DKK 7005 Permanent residence 5Y Denmark PR",validity:"Permanent permanent residence 5Y PR Denmark",docs:"Residence history 8Y Denmark permanent residence + Physical presence 8Y Denmark + Employment history 3.5Y Denmark + Language Danish 2 + Permanent residence application SIRI"},
  {id:"dk-SPE-001",officialCode:"DK-SPE-001",name:"Denmark Job Seeker Establishment Card 2Y Job Seeker Establishment Card 2Y Job Seeker Denmark",toCountry:"dk",fromCountry:"us",category:"pr",record_type:"JOB_SEEKER_VISA",fee:"DKK 4670 Job seeker establishment card 2Y Denmark",validity:"2Y job seeker establishment card 2Y job seeker Denmark",docs:"Degree Denmark + Graduation certificate + Financial means + Accommodation + Insurance + Job seeker establishment card application SIRI"},
  {id:"dk-SPE-002",officialCode:"DK-SPE-002",name:"Denmark Working Holiday 1Y Working Holiday 1Y Working Holiday Denmark",toCountry:"dk",fromCountry:"us",category:"pr",record_type:"WORKING_HOLIDAY_VISA",fee:"DKK 1670 Working holiday 1Y Denmark",validity:"1Y working holiday 1Y working holiday Denmark",docs:"Working holiday invitation Denmark + Age 18-30 + Financial means DKK 15000 + Working holiday application SIRI"},
  {id:"dk-SUP-001",officialCode:"DK-SUP-001",name:"SIRI Authority SIRI Authority Visa SIRI Denmark",toCountry:"dk",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"SIRI = Danish Agency International Recruitment Integration - Visa + Residence + SIRI authority + nyidanmark.dk SIRI"},
  {id:"dk-SUP-002",officialCode:"DK-SUP-002",name:"Pay Limit Scheme Authority Pay Limit Scheme Authority Work Pay Limit Denmark",toCountry:"dk",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"Pay Limit Scheme = Pay Limit Scheme - Work + Pay Limit Scheme + Pay Limit Scheme authority + Pay Limit Scheme Denmark DKK 514000"},
  {id:"dk-SUP-003",officialCode:"DK-SUP-003",name:"Positive List Authority Positive List Authority Work Positive List Denmark",toCountry:"dk",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"Positive List = Positive List - Work + Positive List + Positive List authority + Positive List Denmark"},
  {id:"dk-SUP-004",officialCode:"DK-SUP-004",name:"Start-up Denmark Authority Start-up Denmark Authority Business Start-up Denmark",toCountry:"dk",fromCountry:"us",category:"pr",record_type:"SUPPORTING_CLASSIFICATION",fee:"-",validity:"-",docs:"Start-up Denmark = Start-up Denmark - Business + Start-up Denmark + Start-up Denmark authority + Expert Panel Innovation"},
  {id:"dk-LEG-001",officialCode:"DK-LEG-001",name:"Legacy Pay Limit DKK 448k Old System Closed Replaced by New Pay Limit DKK 514k Denmark",toCountry:"dk",fromCountry:"us",category:"pr",record_type:"LEGACY_VISA",fee:"-",validity:"-",docs:"Legacy closed - Old pay limit DKK 448k old system closed new pay limit DKK 514k Denmark"},
  {id:"dk-LEG-002",officialCode:"DK-LEG-002",name:"Legacy Green Card Points Old System Closed Replaced by New Positive List Denmark",toCountry:"dk",fromCountry:"us",category:"pr",record_type:"LEGACY_VISA",fee:"-",validity:"-",docs:"Legacy closed - Old green card points old system closed replaced by new positive list Denmark"}
];

function convertRawToVisaItem(item: RawDenmarkItem): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
  const details = getDenmarkMicroDetails(item.id, item.category, item.name);

  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    categoryCode: item.category,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    purpose: `Official ${item.category} visa and residence permit entry for Denmark (SIRI).`,
    eligibility: "Valid passport with min 3 months validity, 2 blank pages, travel medical insurance EUR 30,000, confirmed travel itinerary / employment contract / university admission, and financial proof.",
    popular: item.id === 'dk-TOU-001' || item.id === 'dk-BIZ-001' || item.id === 'dk-WRK-001' || item.id === 'dk-STU-001' || item.id === 'dk-FAM-001' || item.id === 'dk-PR-001',
    highlight: item.id === 'dk-TOU-001' || item.id === 'dk-WRK-001' || item.id === 'dk-STU-001' || item.id === 'dk-FAM-001',
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

export const DENMARK_92_VISAS: CountryVisas = {
  tourist: RAW_DK_ITEMS.filter(i => i.category === 'tourist').map(convertRawToVisaItem),
  business: RAW_DK_ITEMS.filter(i => i.category === 'business').map(convertRawToVisaItem),
  work: RAW_DK_ITEMS.filter(i => i.category === 'work').map(convertRawToVisaItem),
  student: RAW_DK_ITEMS.filter(i => i.category === 'student').map(convertRawToVisaItem),
  family: RAW_DK_ITEMS.filter(i => i.category === 'family').map(convertRawToVisaItem),
  pr: RAW_DK_ITEMS.filter(i => i.category === 'pr').map(convertRawToVisaItem)
};
