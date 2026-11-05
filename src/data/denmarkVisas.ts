import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getDenmarkMicroDetails(code: string, cat: string, name: string, rawFunds?: string, rawItr?: string, rawBank?: string) {
  let fundsMin = rawFunds || "Denmark C Short Stay Visa requires proof of min DKK 500/day (approx EUR 67/day) + hotel booking + round-trip ticket + travel medical insurance (min EUR 30,000 across all 29 Schengen states).";
  let fundsBankMonths = rawBank || "Last 3 months personal bank statements stamped by bank branch (min DKK 15,000 liquid balance). No sudden deposit 1 day before ❌.";
  let fundsSudden = "❌ Sudden large cash deposits right before visa submission at VFS Denmark / SIRI are strictly audited and rejected. Maintain steady seasoned balance.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement with DKK 500/day liquid funds. ❌ Galat: Sudden deposit 24-48 hours prior to appointment.";

  let itrYears = rawItr || "Income Tax Returns (ITR) for past 2 years required for C tourist Denmark Schengen = VFS Denmark.";
  let itrMatch = "Declared income must align with bank account salary credits and employer leave certificate/NOC.";
  let itrNoItr = "Not required for short-term visitors fully sponsored by host via official Danish VU1/VU2 invitation form.";

  let bankMonths = rawBank || "Last 3 months bank statements showing min DKK 15,000 liquid funds.";
  let bankReg = "Regular salary credits or verified business revenue.";
  let bankFd = "Fixed deposits accepted only as secondary supplementary financial proof.";
  let bankSource = "Salary, business income, or verified sponsor funds via VU1 form.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('pay-limit') || lowerCode.includes('positive-list')) {
    fundsMin = rawFunds || "Denmark Work Permit (Pay Limit Scheme / Positive List / Fast Track) requires a binding job offer from a Danish employer + gross annual salary meeting SIRI threshold (min DKK 514,000/year = DKK 42,833/month in 2024) + company registration in CVR (Det Centrale Virksomhedsregister).";
    fundsBankMonths = "Employment contract, employer authorization in SIRI AR1 portal, and 3 months personal bank statements.";
    fundsSudden = "Contract must state gross annual salary in DKK (min DKK 514,000 for Pay Limit), job title, and standard Danish working hours (37 hrs/week).";
    fundsEx = "✅ Sahi: Signed employment contract + CVR firm registration + SIRI AR1 submission. ❌ Galat: Salary below DKK 514,000 threshold without Positive List qualification.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('phd')) {
    fundsMin = rawFunds || "Denmark Student Residence Permit (ST1) requires official admission letter from an accredited Danish higher education institution + paid tuition fee receipt + proof of living funds of at least DKK 7,000/month (DKK 84,000/year) in a bank account in applicant's own name.";
    fundsBankMonths = "3 months bank statements showing min DKK 84,000 liquid balance in student's personal account.";
    fundsSudden = "Personal bank account statement in student's name must prove regular financial availability.";
    fundsEx = "✅ Sahi: University acceptance letter + paid tuition fee receipt + DKK 84,000/year bank proof. ❌ Galat: Unverified third-party sponsor funds without joint account.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('reunification')) {
    fundsMin = rawFunds || "Denmark Family Reunification Residence Permit (FA1) requires sponsor residing in Denmark to meet financial self-support requirements (no public assistance for 3 years), bank collateral guarantee of DKK 113,000 (collateral guarantee), accommodation proof (min 20 sqm per person), and meeting 24-year rule & integration criteria.";
    fundsBankMonths = "6 months sponsor bank statements, municipality tax assessments, and bank collateral guarantee of DKK 113,000.";
    fundsSudden = "Bank guarantee (bankgaranti DKK 113,000) and accommodation (min 20 sqm/person or max 2 persons/room) are strictly mandatory.";
    fundsEx = "✅ Sahi: DKK 113k bank guarantee + self-support 3Y + 20 sqm accommodation + Danish Prøve i Dansk test. ❌ Galat: Public welfare benefits received in past 3 years or missing bank guarantee.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('start-up')) {
    fundsMin = rawFunds || "Denmark C Business / Start-up Denmark requires an official business invitation letter from a Danish company registered in CVR + for Start-up Denmark, independent expert panel approval by the Danish Business Authority.";
    fundsBankMonths = "3-6 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Danish host company must be actively registered in CVR with valid P-number.";
    fundsEx = "✅ Sahi: Official invitation on Danish firm letterhead with CVR + foreign company deputation letter. ❌ Galat: Unregistered host firm.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('residência-permanente') || lowerCode.includes('spe')) {
    fundsMin = rawFunds || "Denmark Permanent Residence Permit (TU1) requires 8 years continuous legal residence (or 4 years under Supplementary Pay Limit fast-track) + 3.5 years full-time employment + Danish language test (min Prøve i Dansk 2) + no crime + 4 years financial self-support + no public debt.";
    fundsBankMonths = "8 years tax returns (Årsopgørelse from Skat), pension contributions, and clean debt statement from Gældsstyrelsen.";
    fundsSudden = "Continuous residence and 3 years 6 months full-time employment in past 4 years evaluated by SIRI.";
    fundsEx = "✅ Sahi: 8 years residence + 3.5 years employment + Prøve i Dansk 2 + self-support 4Y + no public debt. ❌ Galat: Overdue public debt or unexcused gap in legal stay.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

export interface RawDenmarkItem {
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
  itrBox?: string;
  bankBox?: string;
  warningBox?: string;
}

export const DK_92: RawDenmarkItem[] = [
  // ==========================================
  // TOURIST (18) - Schengen C Tourist, Family/Friends, Transit, Island & Cultural Visas Denmark
  // ==========================================
  {
    id: "dk-TOU-001",
    officialCode: "DK-TOU-001",
    name: "Schengen C Tourist 90/180 Days Denmark C Tourist 90/180 - Most common Tourist Denmark Schengen",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C tourist Denmark 90/180 Schengen",
    validity: "90/180 C tourist Denmark Schengen - 29 countries valid",
    docs: "Passport 3M 2 blank + Photo 35x45 white Schengen + Flight return + Hotel all Denmark + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + C tourist Denmark application VFS Denmark",
    fundsBox: "DKK 500/day = Bank 3M DKK 500/day = C tourist Denmark Schengen = EUR 67/day",
    itrBox: "ITR 2Y required C tourist Denmark Schengen = VFS Denmark",
    bankBox: "Bank 3M last 3 months min DKK 15000 C tourist Denmark Schengen - No sudden deposit 1 day before ❌",
    warningBox: "✅ Most common tourist Denmark C Tourist 90/180 Schengen - VFS Denmark Delhi Mumbai - 29 countries valid - SIRI Denmark"
  },
  {
    id: "dk-TOU-002",
    officialCode: "DK-TOU-002",
    name: "Schengen C Business 90/180 C Business 90/180 Business Denmark Schengen Business",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 C business Denmark Schengen",
    validity: "90/180 C business Denmark Schengen",
    docs: "Danish company invitation letter + Danish CVR registration + Foreign company letter + Business card + Business registration foreign + Chamber of commerce + Business invitation + Business proof + Insurance + Bank + C business Denmark VFS Denmark"
  },
  {
    id: "dk-TOU-003",
    officialCode: "DK-TOU-003",
    name: "Schengen C Visitor Family Friend 90/180 C Visitor Family Friend 90/180 Visitor Denmark Family",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C visitor family Denmark",
    validity: "90/180 C visitor family Denmark Schengen",
    docs: "Danish host invitation VU1 form + Host CPR number + Relationship proof + Host financial + Accommodation proof Denmark + C visitor Denmark VFS",
    warningBox: "MOST IMPORTANT: Official VU1/VU2 Online Host Invitation Form registered via MitID on SIRI/nyidanmark portal"
  },
  {
    id: "dk-TOU-004",
    officialCode: "DK-TOU-004",
    name: "Schengen C Cultural Sports 90/180 C Cultural Sports 90/180 Cultural Denmark Sports",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C cultural Denmark Schengen",
    validity: "90/180 C cultural Denmark",
    docs: "Event organizer invitation Denmark + Cultural event proof + Sports federation invitation + C cultural Denmark VFS"
  },
  {
    id: "dk-TOU-005",
    officialCode: "DK-TOU-005",
    name: "Airport Transit Visa Type A Denmark Airport Transit Type A Denmark Transit",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 Airport Transit Type A Denmark",
    validity: "24H Airport Transit Type A Denmark",
    docs: "Passport + Onward ticket + Destination visa + Airport Transit Type A Denmark VFS"
  },
  {
    id: "dk-TOU-006",
    officialCode: "DK-TOU-006",
    name: "Schengen C Seaman 90/180 Seaman Visa 90/180 Seaman Denmark Seafarer",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 Seaman Denmark Schengen",
    validity: "90/180 Seaman Denmark Schengen",
    docs: "Seaman book + Shipping company letter Denmark + Crew list + Seaman visa Denmark VFS"
  },
  {
    id: "dk-TOU-007",
    officialCode: "DK-TOU-007",
    name: "Schengen C Multiple-Entry 1Y Tourist Visa (90/180 Days) Denmark Schengen 1Y",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Multiple 1Y Denmark Schengen",
    validity: "1 Year Multiple Entry (90/180 Days) Denmark",
    docs: "Previous lawful Schengen visas + Bank statement 6M + Flight & hotel history + Travel medical insurance EUR 30000 + VFS Denmark"
  },
  {
    id: "dk-TOU-008",
    officialCode: "DK-TOU-008",
    name: "Schengen C Multiple-Entry 2Y Tourist Visa (90/180 Days) Denmark Schengen 2Y",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Multiple 2Y Denmark Schengen",
    validity: "2 Years Multiple Entry (90/180 Days) Denmark",
    docs: "Lawfully utilized 1-year multiple entry visa + Bank statement 6M + Regular travel justification + Insurance + VFS Denmark"
  },
  {
    id: "dk-TOU-009",
    officialCode: "DK-TOU-009",
    name: "Schengen C Multiple-Entry 5Y Tourist Visa (90/180 Days) Denmark Schengen 5Y",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Multiple 5Y Denmark Schengen",
    validity: "5 Years Multiple Entry (90/180 Days) Denmark",
    docs: "Lawfully utilized 2-year multiple entry Schengen visa + 12M bank statements + High-frequency travel justification + VFS Denmark"
  },
  {
    id: "dk-TOU-010",
    officialCode: "DK-TOU-010",
    name: "ETIAS European Travel Authorization 3Y (Visa-Exempt Nationalities) Denmark",
    toCountry: "dk",
    fromCountry: "us",
    category: "tourist",
    record_type: "ETA_VISA",
    fee: "EUR 7 ETIAS 3Y Travel Authorization Denmark",
    validity: "3 Years or Passport Expiry (90/180 Days) Denmark",
    docs: "Biometric passport + Online ETIAS registration + Confirmed travel details + Return flight"
  },
  {
    id: "dk-TOU-011",
    officialCode: "DK-TOU-011",
    name: "Faroe Islands Tourist & Visitor Visa (90/180 Days Non-Schengen Territorial Entry) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 Faroe Islands Territorial Entry Visa",
    validity: "90/180 Days Valid for Faroe Islands Territorial Stay",
    docs: "Passport 3M + Flight to Vágar Airport (FAE) + Accommodation on Faroe Islands + Bank statement 3M + Travel insurance + VFS Denmark"
  },
  {
    id: "dk-TOU-012",
    officialCode: "DK-TOU-012",
    name: "Greenland Tourist & Arctic Explorer Visitor Visa (90/180 Days Non-Schengen Territory) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 Greenland Arctic Visitor Visa",
    validity: "90/180 Days Valid for Greenland Territorial Stay",
    docs: "Passport 3M + Flight itinerary to Nuuk/Kangerlussuaq + Greenland hotel/tour booking + Arctic medical & evacuation insurance + Bank 3M"
  },
  {
    id: "dk-TOU-013",
    officialCode: "DK-TOU-013",
    name: "Schengen C Medical Treatment & Specialized Hospital Care Visa 90/180 Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Medical Treatment Denmark",
    validity: "90/180 Days Medical Care Denmark",
    docs: "Appointment confirmation from certified Danish hospital (Rigshospitalet / Aarhus University Hospital) + Prepayment/financial guarantee + Medical referral + Insurance"
  },
  {
    id: "dk-TOU-014",
    officialCode: "DK-TOU-014",
    name: "Denmark National D Long-Stay Humanitarian & Force Majeure Visitor Visa 1Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "DKK 1670 National D Humanitarian Visitor Visa Denmark",
    validity: "Up to 1 Year National D Stay in Denmark",
    docs: "Compelling humanitarian or family circumstances documentation + Proof of accommodation + Financial self-support + Medical insurance + SIRI Denmark"
  },
  {
    id: "dk-TOU-015",
    officialCode: "DK-TOU-015",
    name: "Schengen C Cruise Passenger & Baltic Maritime Tour Visa 90/180 Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Baltic Cruise Tourist Visa Denmark",
    validity: "90/180 Days Single/Multiple Entry for Baltic Cruise Tour",
    docs: "Confirmed cruise booking sailing via Port of Copenhagen / Skagen / Rønne + Return flight + Shore excursion itinerary + Travel medical insurance EUR 30000"
  },
  {
    id: "dk-TOU-016",
    officialCode: "DK-TOU-016",
    name: "Schengen C Official Government Delegation & Intergovernmental Mission Visa Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "Free / EUR 90 Official Delegation C Visa Denmark",
    validity: "Duration of Official Mission (Up to 90/180 Days) Denmark",
    docs: "Note Verbale from sending Ministry of Foreign Affairs + Official Danish Ministry invitation + Diplomatic/Official or Ordinary Passport + Mission agenda"
  },
  {
    id: "dk-TOU-017",
    officialCode: "DK-TOU-017",
    name: "Schengen C Cascade Rule 3-Year Multi-Entry Tourist Visa Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C 3-Year Cascade Tourist Visa Denmark",
    validity: "3 Years Multiple Entry (90/180 Days per period) Denmark",
    docs: "2 lawfully obtained and used Schengen visas in previous 2 years + Bank statement 6M + Continuous employment + Insurance EUR 30000"
  },
  {
    id: "dk-TOU-018",
    officialCode: "DK-TOU-018",
    name: "Schengen C Accredited Tour Group & Package Sightseeing Visitor Visa Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 Organized Group Tour C Visa Denmark",
    validity: "30 to 90 Days Package Sightseeing Denmark",
    docs: "Licensed Danish tour operator voucher + Confirmed day-by-day Copenhagen & Zealand itinerary + Return flight reservation + Travel insurance EUR 30000 + Bank 3M"
  },

  // ==========================================
  // BUSINESS (8) - Business Visitor, Trade Fair, Conference & Start-up Denmark
  // ==========================================
  {
    id: "dk-BUS-001",
    officialCode: "DK-BUS-001",
    name: "Denmark Business Visitor C 90/180 Business Visitor C 90/180 Business Denmark Business Visitor",
    toCountry: "dk",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Business Visitor C Denmark",
    validity: "90/180 Business Visitor C Denmark",
    docs: "Danish business invitation + CVR Denmark + Foreign company letter + Business meeting proof + Business Visitor C Denmark VFS"
  },
  {
    id: "dk-BUS-002",
    officialCode: "DK-BUS-002",
    name: "Denmark Trade Fair C 90/180 Trade Fair C 90/180 Business Denmark Trade Fair",
    toCountry: "dk",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Trade Fair C Denmark",
    validity: "90/180 Trade Fair C Denmark",
    docs: "Trade fair invitation Denmark + Exhibitor proof + Trade Fair C Denmark VFS"
  },
  {
    id: "dk-BUS-003",
    officialCode: "DK-BUS-003",
    name: "Denmark Conference C 90/180 Conference C 90/180 Business Denmark Conference",
    toCountry: "dk",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Conference C Denmark",
    validity: "90/180 Conference C Denmark",
    docs: "Conference invitation Denmark + Registration + Conference C Denmark VFS"
  },
  {
    id: "dk-BUS-004",
    officialCode: "DK-BUS-004",
    name: "Denmark Start-up Denmark Scheme (Expert Panel Innovation Approved) 2Y Business Residence Permit",
    toCountry: "dk",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "DKK 4325 Start-up Denmark Residence Permit (2Y)",
    validity: "2 Years Renewable Start-up Entrepreneur Permit Denmark",
    docs: "Approval letter from Danish Business Authority expert panel + Comprehensive scalable business plan + Proof of self-support for 1 year (min DKK 143,328) + SIRI application",
    warningBox: "MOST IMPORTANT: Start-up Denmark requires business model approval from the independent Expert Panel appointed by the Danish Business Authority before SIRI submission"
  },
  {
    id: "dk-BUS-005",
    officialCode: "DK-BUS-005",
    name: "Denmark Self-Employed Independent Business Operator Residence Permit 1Y-2Y Business Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "DKK 4325 Self-Employed Residence Permit Denmark",
    validity: "1 to 2 Years Renewable Self-Employed Permit Denmark",
    docs: "CVR registration in Denmark + Substantial Danish economic interest documentation + Audited capital and liquidity proof + SIRI application"
  },
  {
    id: "dk-BUS-006",
    officialCode: "DK-BUS-006",
    name: "Denmark Board Member & Executive Management Business Schengen C Multi-Entry 1Y-5Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Executive Board Member Multi-Entry Business Visa",
    validity: "1 to 5 Years Multiple Entry (90/180 Days) Denmark",
    docs: "Danish company CVR register extract showing board membership + Official board meeting schedule + Corporate guarantee + Travel insurance EUR 30000"
  },
  {
    id: "dk-BUS-007",
    officialCode: "DK-BUS-007",
    name: "Denmark Commercial Contract Negotiation, Legal Audit & Technical Consulting C Visa Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Commercial Contract Consulting C Visa Denmark",
    validity: "90/180 Days Commercial Consulting Stay Denmark",
    docs: "Commercial contract drafts + Deputation letter from multinational employer + Invitation from Danish counterparty with CVR number + Financial proof"
  },
  {
    id: "dk-BUS-008",
    officialCode: "DK-BUS-008",
    name: "Denmark After-Sales Machinery Installation, Commissioning & Maintenance C Visa Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Technical Installation & Commissioning C Visa Denmark",
    validity: "Up to 90 Days Industrial Installation & Warranty Service Denmark",
    docs: "Equipment purchase contract containing installation clause + Danish client invitation with CVR + Specialist engineer credentials + Travel insurance"
  },

  // ==========================================
  // WORK (26) - Pay Limit, Positive List, Fast Track, Researchers, Agriculture & Trainees Denmark
  // ==========================================
  {
    id: "dk-WRK-001",
    officialCode: "DK-WRK-001",
    name: "Denmark Work Permit Pay Limit Scheme 1Y Work Permit Pay Limit 1Y Work Denmark - Most common Work Denmark DKK 514k",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Work Permit Pay Limit 1Y Work Denmark Pay Limit",
    validity: "1 Year Work Permit Pay Limit 1Y Work Denmark Pay Limit Scheme",
    docs: "Job contract Denmark Pay Limit Scheme DKK 514000/year + Employment contract Denmark Pay Limit + Employer authorization SIRI Denmark + Diploma + Pay Limit Scheme AR1 application SIRI + Job offer Denmark Pay Limit",
    fundsBox: "Salary min DKK 514000/year 2024 Pay Limit Scheme Denmark Work Permit Pay Limit - DKK 42833/month",
    warningBox: "✅ Most common work Denmark Pay Limit Scheme DKK 514k - No labour market test - SIRI Denmark AR1 - Highest salary scheme"
  },
  {
    id: "dk-WRK-002",
    officialCode: "DK-WRK-002",
    name: "Denmark Work Permit Positive List Skilled 1Y Work Permit Positive List Skilled 1Y Work Denmark Skilled",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Work Permit Positive List Skilled 1Y Work Denmark Positive List",
    validity: "1 Year Work Permit Positive List Skilled 1Y Work Denmark Skilled",
    docs: "Job offer Denmark Positive List Skilled + Positive List profession Denmark skilled + Diploma skilled + Employment contract Denmark Positive List Skilled + Positive List Skilled AR1 SIRI Denmark + Diploma + Job offer Denmark Positive List Skilled"
  },
  {
    id: "dk-WRK-003",
    officialCode: "DK-WRK-003",
    name: "Denmark Work Permit Positive List Higher Education 1Y Work Permit Positive List Higher Education 1Y Work Denmark Higher Education",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Work Permit Positive List Higher Education 1Y Work Denmark Higher Education",
    validity: "1 Year Work Permit Positive List Higher Education 1Y Work Denmark Higher Education",
    docs: "Job offer Denmark Positive List Higher Education + Higher education diploma + Positive List Higher Education profession Denmark + Employment contract Denmark Higher Education + Positive List Higher Education AR1 SIRI Denmark"
  },
  {
    id: "dk-WRK-004",
    officialCode: "DK-WRK-004",
    name: "Denmark Fast Track Scheme 1Y Fast Track Scheme 1Y Work Denmark Fast Track Certified Company",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Fast Track Scheme 1Y Work Denmark Fast Track",
    validity: "1 Year Fast Track Scheme 1Y Work Denmark Fast Track Scheme Certified",
    docs: "Certified company Denmark Fast Track + Job offer Fast Track + Fast Track AR1 SIRI Denmark + Employment contract Denmark Fast Track Certified + Job offer Denmark Fast Track Scheme"
  },
  {
    id: "dk-WRK-005",
    officialCode: "DK-WRK-005",
    name: "Denmark Work Permit Researcher 1Y Researcher 1Y Work Denmark Researcher",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Researcher 1Y Work Denmark Researcher",
    validity: "1 Year Researcher 1Y Work Denmark Researcher",
    docs: "Researcher job offer Denmark + Research agreement Denmark + PhD + Researcher AR1 SIRI Denmark"
  },
  {
    id: "dk-WRK-006",
    officialCode: "DK-WRK-006",
    name: "Denmark Work Permit Herdsman Farm Manager 1Y Herdsman Farm Manager 1Y Work Denmark Agriculture",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Herdsman Farm Manager 1Y Work Denmark Agriculture",
    validity: "1 Year Herdsman Farm Manager 1Y Work Denmark Agriculture",
    docs: "Farm job offer Denmark Herdsman Farm Manager + Agriculture contract + Herdsman Farm Manager AR1 SIRI Denmark"
  },
  {
    id: "dk-WRK-007",
    officialCode: "DK-WRK-007",
    name: "Denmark Work Permit Trainee 1Y Trainee 1Y Work Denmark Trainee",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Trainee 1Y Work Denmark Trainee",
    validity: "1 Year Trainee 1Y Work Denmark Trainee",
    docs: "Trainee agreement Denmark + Trainee plan + Education proof + Trainee AR1 SIRI Denmark"
  },
  {
    id: "dk-WRK-008",
    officialCode: "DK-WRK-008",
    name: "Denmark Work Permit Labour Market Attachment 6M Labour Market Attachment 6M Work Denmark Job Seeking",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 1900 Labour Market Attachment 6M Work Denmark",
    validity: "6 Months Labour Market Attachment 6M Work Denmark Job Seeking Lost Job",
    docs: "Previous work permit Denmark + Job loss proof + Labour Market Attachment AR6 SIRI Denmark"
  },
  {
    id: "dk-WRK-009",
    officialCode: "DK-WRK-009",
    name: "Denmark Au Pair 2Y Au Pair 2Y Work Denmark Au Pair Family",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Au Pair 2Y Work Denmark Au Pair",
    validity: "2 Years Au Pair 2Y Work Denmark Au Pair Family",
    docs: "Au Pair contract Denmark + Host family approval Denmark + Au Pair AR1 SIRI Denmark + Age 18-30 + Au Pair contract Denmark"
  },
  {
    id: "dk-WRK-010",
    officialCode: "DK-WRK-010",
    name: "Denmark Internship 1Y Internship 1Y Work Denmark Internship Student",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Internship 1Y Work Denmark Internship",
    validity: "1 Year Internship 1Y Work Denmark Internship",
    docs: "Internship agreement Denmark + Student proof home country + Internship plan Denmark + Internship AR1 SIRI Denmark"
  },
  {
    id: "dk-WRK-011",
    officialCode: "DK-WRK-011",
    name: "Denmark Sideline Employment Permit Sideline Employment Permit Work Denmark Sideline Part-time",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 1900 Sideline Employment Permit Work Denmark Sideline",
    validity: "Sideline Employment Permit Work Denmark Part-time Sideline",
    docs: "Main work permit Denmark + Sideline job offer Denmark + Sideline Employment AR SIRI Denmark"
  },
  {
    id: "dk-WRK-012",
    officialCode: "DK-WRK-012",
    name: "Denmark Supplementary Pay Limit Scheme 1Y-4Y (Lower Threshold DKK 393k) Work Permit Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Supplementary Pay Limit Scheme Work Permit Denmark",
    validity: "Up to 4 Years Renewable Work Permit Denmark",
    docs: "Employment contract with Danish employer meeting Supplementary Pay Limit (min DKK 393,000/year) + Danish NemKonto + SIRI AR1 online submission"
  },
  {
    id: "dk-WRK-013",
    officialCode: "DK-WRK-013",
    name: "Denmark Fast Track Pay Limit Track (Certified Company Immediate Start) 4Y Work Permit Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Fast Track Pay Limit Stream Work Permit",
    validity: "Up to 4 Years Certified Employer Work Permit Denmark",
    docs: "SIRI-certified employer status + Pay limit salary contract (DKK 514k+) + Quick care start option upon biometrics submission"
  },
  {
    id: "dk-WRK-014",
    officialCode: "DK-WRK-014",
    name: "Denmark Fast Track Supplementary Pay Limit Track 4Y Work Permit Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Fast Track Supplementary Pay Limit Permit",
    validity: "Up to 4 Years Work Permit Denmark",
    docs: "Certified Danish employer + Salary meeting Supplementary threshold (DKK 393k+) + Employment contract + SIRI application"
  },
  {
    id: "dk-WRK-015",
    officialCode: "DK-WRK-015",
    name: "Denmark Fast Track Short-Term Track (Up to 90 Days Working Rights for Certified Firm) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Fast Track Short-Term Work Authorization",
    validity: "Up to 90 Days per 365-day Period Denmark",
    docs: "SIRI certified employer declaration + Specialist assignment letter + Full salary paid during Danish stay"
  },
  {
    id: "dk-WRK-016",
    officialCode: "DK-WRK-016",
    name: "Denmark Fast Track Educational Track (High-Level Training & Academy Specialist) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Fast Track Educational Track Work Permit",
    validity: "Duration of Educational Program / Employment (Up to 4 Years) Denmark",
    docs: "Employment contract with certified company + Educational development plan + Certified employer endorsement"
  },
  {
    id: "dk-WRK-017",
    officialCode: "DK-WRK-017",
    name: "Denmark Intra-Company Transfer (ICT) Specialist & Manager 3Y Work Residence Permit Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Intra-Company Transfer (ICT) Permit Denmark",
    validity: "Up to 3 Years (Managers/Specialists) ICT Permit Denmark",
    docs: "International corporate group assignment letter + Min 3-6 months prior seniority in multinational + Danish entity CVR + Danish salary & terms"
  },
  {
    id: "dk-WRK-018",
    officialCode: "DK-WRK-018",
    name: "Denmark Intra-Company Transfer (ICT) Trainee Employee 1Y Work Residence Permit Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 ICT Trainee Residence Permit Denmark",
    validity: "Up to 1 Year ICT Trainee Transfer Denmark",
    docs: "University degree + Trainee agreement with Danish affiliated company + Corporate group affiliation proof + Salary matching Danish collective terms"
  },
  {
    id: "dk-WRK-019",
    officialCode: "DK-WRK-019",
    name: "Denmark Medical Doctor & Dentist Authorization Adaptation Work Permit 3Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Authorization Work Permit for Healthcare Professionals",
    validity: "Up to 3 Years Medical Language & Adaptation Training Denmark",
    docs: "Danish Patient Safety Authority (Styrelsen for Patientsikkerhed) primary medical degree validation + Danish language test plan + SIRI application"
  },
  {
    id: "dk-WRK-020",
    officialCode: "DK-WRK-020",
    name: "Denmark Registered Nurse Authorization & Hospital Employment Permit 3Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Healthcare Nurse Adaptation Work Permit Denmark",
    validity: "Up to 3 Years Nurse Adaptation & Evaluation Stay Denmark",
    docs: "Nursing diploma verified by Styrelsen for Patientsikkerhed + Evaluation employment contract (evalueringsansættelse) at Danish regional hospital"
  },
  {
    id: "dk-WRK-021",
    officialCode: "DK-WRK-021",
    name: "Denmark Special Individual Cultural & Artistic Qualification Work Permit 1Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Artist, Musician & Performer Work Permit Denmark",
    validity: "1 Year Performance/Engagement Duration Denmark",
    docs: "Contract with Danish cultural venue / theatre / orchestra + International artistic portfolio + Union advisory endorsement (e.g. Dansk Musiker Forbund)"
  },
  {
    id: "dk-WRK-022",
    officialCode: "DK-WRK-022",
    name: "Denmark Professional Athlete, Elite Coach & Sports Federation Staff Work Permit 1Y-4Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Professional Sports Work Permit Denmark",
    validity: "1 to 4 Years Sports Contract Duration Denmark",
    docs: "Contract with Danish Superliga / Sports Federation club + Danish Sports Confederation (DIF) recommendation + Salary and housing guarantee"
  },
  {
    id: "dk-WRK-023",
    officialCode: "DK-WRK-023",
    name: "Denmark Green Card Scheme Legacy Transition Work Permit (Former Holders) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Transition Work Residence Permit Denmark",
    validity: "Up to 2 Years Transition Residence Permit Denmark",
    docs: "Proof of lawful transition employment + Tax receipts + Danish bank account + SIRI application"
  },
  {
    id: "dk-WRK-024",
    officialCode: "DK-WRK-024",
    name: "Denmark Working Holiday Scheme 1Y (Reciprocal Agreement Youth 18-30 Years) Denmark",
    toCountry: "dk",
    fromCountry: "au",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 2000 Working Holiday Youth Visa Denmark",
    validity: "1 Year Working Holiday Stay (AU, CA, NZ, JP, KR, CL, AR) Denmark",
    docs: "Age 18-30 passport from bilateral partner state + Return ticket + Bank statement min DKK 15,000 + Comprehensive health insurance for 12M"
  },
  {
    id: "dk-WRK-025",
    officialCode: "DK-WRK-025",
    name: "Denmark Volunteer Service Scheme (Non-Profit & Humanitarian Foundations) 1Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 2000 Volunteer Residence Permit Denmark",
    validity: "Up to 1 Year Non-Profit Volunteering Denmark",
    docs: "Volunteer contract with approved Danish charitable foundation + Board and lodging guarantee + Pocket money + Medical insurance"
  },
  {
    id: "dk-WRK-026",
    officialCode: "DK-WRK-026",
    name: "Denmark Greenland & Faroe Islands Territorial Work Permit (Local Self-Rule Government) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "DKK 4325 Territorial Work Permit (Greenland / Faroe Islands)",
    validity: "1 to 2 Years Territorial Work Stay Denmark",
    docs: "Employment contract with company in Greenland / Faroe Islands + Naalakkersuisut (Greenland) or Løgmaður (Faroe) local labour clearance + SIRI"
  },

  // ==========================================
  // STUDENT (14) - Higher Education, Basic Education, Folk High School, PhD & Establishment Card Denmark
  // ==========================================
  {
    id: "dk-STU-001",
    officialCode: "DK-STU-001",
    name: "Denmark Student Residence Permit 1Y Higher Education Student Residence Permit 1Y Student Denmark - Most common Student Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "DKK 2000 Student Residence Permit 1Y Higher Education Student Denmark",
    validity: "1 Year Student Residence Permit 1Y Higher Education Student Denmark",
    docs: "Admission letter Denmark higher education + University admission Denmark + Tuition fee receipt Denmark higher education + Funds proof Denmark student + Accommodation Denmark student + Student residence permit ST1 application SIRI Denmark + Funds proof Denmark student + Admission letter",
    fundsBox: "Funds DKK 7000/month Student Residence Permit 1Y Higher Education Student Denmark = Bank statement 3M DKK 84000/year",
    warningBox: "✅ Most common student Denmark Student Residence Permit 1Y Higher Education - SIRI ST1 - Work 20H/week allowed - University sponsor"
  },
  {
    id: "dk-STU-002",
    officialCode: "DK-STU-002",
    name: "Denmark Student Residence Permit Basic Higher Education 1Y Student Residence Permit Basic Higher Education 1Y Student Denmark Basic",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "DKK 2000 Student Residence Permit Basic Higher Education 1Y Student Denmark Basic",
    validity: "1 Year Student Residence Permit Basic Higher Education 1Y Student Denmark Basic",
    docs: "Basic higher education admission Denmark + Tuition fee + Funds + Student Basic Higher Education ST1 SIRI Denmark"
  },
  {
    id: "dk-STU-003",
    officialCode: "DK-STU-003",
    name: "Denmark Student Residence Permit Folk High School 1Y Folk High School 1Y Student Denmark Folk",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "DKK 2000 Folk High School 1Y Student Denmark Folk",
    validity: "1 Year Folk High School 1Y Student Denmark Folk High School",
    docs: "Folk high school admission Denmark + Course fee + Folk High School ST1 SIRI Denmark"
  },
  {
    id: "dk-STU-004",
    officialCode: "DK-STU-004",
    name: "Denmark PhD Residence Permit 3Y PhD Residence Permit 3Y Student Denmark PhD",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "DKK 4325 PhD Residence Permit 3Y Student Denmark PhD",
    validity: "3 Years PhD Residence Permit 3Y Student Denmark PhD",
    docs: "PhD admission Denmark + PhD employment contract Denmark + PhD salary + PhD residence permit AR1 SIRI Denmark"
  },
  {
    id: "dk-STU-005",
    officialCode: "DK-STU-005",
    name: "Denmark Student Establishment Card 2Y Establishment Card 2Y Student Denmark Graduate Job Seeking",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "DKK 1900 Establishment Card 2Y Student Denmark Graduate",
    validity: "2 Years Establishment Card 2Y Student Denmark Graduate Job Seeking",
    docs: "Danish degree completion + Establishment Card application + Establishment Card ET1 SIRI Denmark - Job seeking after study Denmark"
  },
  {
    id: "dk-STU-006",
    officialCode: "DK-STU-006",
    name: "Denmark Master Degree Postgraduate Student Residence Permit (ST1) 2Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "DKK 2000 Master Degree Student Residence Permit Denmark",
    validity: "2 Years Degree Program Duration Denmark",
    docs: "Official acceptance into Danish university Master program (Københavns Universitet, DTU, CBS, Aarhus) + Paid tuition fee receipt + Bank proof DKK 84,000/year"
  },
  {
    id: "dk-STU-007",
    officialCode: "DK-STU-007",
    name: "Denmark Professional Bachelor & Vocational College Student Residence Permit 3Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "DKK 2000 Professional Bachelor Student Permit Denmark",
    validity: "3 to 4 Years Program Duration Denmark",
    docs: "Admission to Danish University College (Professionshøjskole - VIA, KP, UCL) + Tuition receipt + Self-support funds proof DKK 7,000/month"
  },
  {
    id: "dk-STU-008",
    officialCode: "DK-STU-008",
    name: "Denmark Erasmus+ & International University Exchange Student Permit 6M-1Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "DKK 2000 Exchange Student Residence Permit Denmark",
    validity: "1 Semester to 1 Year Exchange Stay Denmark",
    docs: "Erasmus+ Learning Agreement + Danish host university acceptance letter + Home university enrollment + Grant confirmation / living funds"
  },
  {
    id: "dk-STU-009",
    officialCode: "DK-STU-009",
    name: "Denmark Government & Danish Innovation Scholarship Student Visa 1Y-2Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "Free / DKK 2000 Government Scholarship Student Residence Permit",
    validity: "1 to 2 Years Scholarship Program Duration Denmark",
    docs: "Official Danish Government Scholarship (Danish State Scholarship) award letter + Full tuition waiver confirmation + Monthly living stipend agreement"
  },
  {
    id: "dk-STU-010",
    officialCode: "DK-STU-010",
    name: "Denmark Youth Secondary & Continuation School (Efterskole) Residence Permit 1Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "DKK 2000 Efterskole Boarding School Permit Denmark",
    validity: "1 Year Secondary Boarding School Stay Denmark",
    docs: "Admission letter from certified Danish Efterskole + Boarding fee payment receipt + Parental consent + Guardian designation in Denmark"
  },
  {
    id: "dk-STU-011",
    officialCode: "DK-STU-011",
    name: "Denmark Short-Term Study & Language Course Schengen C Visa (Under 90 Days) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 90 Short-Term Study Schengen C Visa Denmark",
    validity: "Up to 90 Days Short Course Stay Denmark",
    docs: "Short summer school or Danish language course enrollment + Accommodation reservation + Bank statement 3M + Travel medical insurance EUR 30000"
  },
  {
    id: "dk-STU-012",
    officialCode: "DK-STU-012",
    name: "Denmark Student Residence Extension Scheme (Thesis Completion & Delays) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "DKK 2000 Student Residence Extension Permit Denmark",
    validity: "6 Months to 1 Year Program Extension Denmark",
    docs: "University statement confirming study progress and expected graduation date + Living funds proof for extension period + SIRI ST1 application"
  },
  {
    id: "dk-STU-013",
    officialCode: "DK-STU-013",
    name: "Denmark Post-Doctoral Researcher Fellow & Academic Visiting Scholar Permit 2Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "DKK 4325 Post-Doctoral Researcher Residence Permit Denmark",
    validity: "Up to 2 Years Post-Doctoral Fellow Stay Denmark",
    docs: "Hosting agreement with Danish university / research center + PhD degree + Salary / research grant funding + Health insurance"
  },
  {
    id: "dk-STU-014",
    officialCode: "DK-STU-014",
    name: "Denmark Mandatory Curriculum Internship & Traineeship Study Attachment Permit Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "DKK 2000 Mandatory Study Internship Permit Denmark",
    validity: "Matches Approved Internship Duration (Up to 1 Year) Denmark",
    docs: "Internship agreement endorsed by Danish educational institution + Host company placement agreement + Student ST1 permit in good standing"
  },

  // ==========================================
  // FAMILY (14) - Spouse, Children, Parents & Dependent Permits Denmark
  // ==========================================
  {
    id: "dk-FAM-001",
    officialCode: "DK-FAM-001",
    name: "Denmark Family Reunification Spouse 2Y Family Reunification Spouse 2Y Family Denmark - Most common Family Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "DKK 9400 Family Reunification Spouse 2Y Family Denmark Spouse",
    validity: "2 Years Family Reunification Spouse 2Y Family Denmark Spouse",
    docs: "Spouse Danish residence + Marriage certificate attested + Relationship proof + Accommodation 20 sqm per person Denmark + Financial support DKK 0 self-support + Danish test + Family Reunification Spouse FA1 SIRI Denmark + Bank + Financial self-support + Accommodation Denmark",
    fundsBox: "Financial self-support - No public assistance Family Reunification Spouse 2Y Family Denmark - Accommodation 20 sqm/person + Collateral DKK 113000 bank guarantee",
    warningBox: "✅ Most common family Denmark Family Reunification Spouse 2Y - Collateral DKK 113k + Accommodation 20 sqm + Both 24 years + Integration requirements"
  },
  {
    id: "dk-FAM-002",
    officialCode: "DK-FAM-002",
    name: "Denmark Family Reunification Child 2Y Family Reunification Child 2Y Family Denmark Child",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "DKK 9400 Family Reunification Child 2Y Family Denmark Child",
    validity: "2 Years Family Reunification Child 2Y Family Denmark Child",
    docs: "Parent Danish residence + Birth certificate attested + Parent custody + Child age under 15 + Family Reunification Child FA1 SIRI Denmark"
  },
  {
    id: "dk-FAM-003",
    officialCode: "DK-FAM-003",
    name: "Denmark Accompanying Family Member 1Y Accompanying Family Member 1Y Family Denmark Work Accompany",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "DKK 4325 Accompanying Family Member 1Y Family Denmark Accompany",
    validity: "1 Year Accompanying Family Member 1Y Family Denmark Accompany Work",
    docs: "Main person work permit Denmark + Marriage certificate attested + Birth certificate attested + Accompanying Family Member MF1 SIRI Denmark"
  },
  {
    id: "dk-FAM-004",
    officialCode: "DK-FAM-004",
    name: "Denmark Parent Accompanying Child 1Y Parent Accompanying Child 1Y Family Denmark Parent Child",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "DKK 4325 Parent Accompanying Child 1Y Family Denmark Parent Child",
    validity: "1 Year Parent Accompanying Child 1Y Family Denmark Parent Child",
    docs: "Child Danish residence + Parent relationship + Parent Accompanying Child FA3 SIRI Denmark"
  },
  {
    id: "dk-FAM-005",
    officialCode: "DK-FAM-005",
    name: "Denmark Accompanying Spouse to Student & PhD Researcher Residence Permit 1Y-3Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "DKK 2000 Student Dependent Spouse Permit Denmark",
    validity: "Matches Primary Student / PhD Permit Duration Denmark",
    docs: "Primary applicant's ST1 student permit + Apostilled marriage certificate + Proof of living funds (DKK 84,000/year for spouse) + Accommodation lease"
  },
  {
    id: "dk-FAM-006",
    officialCode: "DK-FAM-006",
    name: "Denmark Family Reunification under EU Free Movement Rules (EU/EEA Citizen Spouse) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free EU Residence Card (EU Family Reunification) Denmark",
    validity: "5 Years EU Family Member Residence Card Denmark",
    docs: "EU/EEA citizen exercising treaty rights in Denmark + Marriage certificate + Proof of genuine cohabitation + EU Residence Document (EU-opholdsdokument)"
  },
  {
    id: "dk-FAM-007",
    officialCode: "DK-FAM-007",
    name: "Denmark Cohabiting Partner (Genuine & Long-Term Relationship) Residence Permit 2Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "DKK 9400 Cohabiting Partner Family Reunification Permit Denmark",
    validity: "2 Years Renewable Cohabitation Permit Denmark",
    docs: "Proof of min 1.5 to 2 years shared household & cohabitation address + Bank guarantee DKK 113,000 + Self-support declaration + SIRI FA1"
  },
  {
    id: "dk-FAM-008",
    officialCode: "DK-FAM-008",
    name: "Denmark Accompanying Minor Children of Work Permit & Fast Track Holders 1Y-4Y Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "DKK 4325 Worker Accompanying Child Permit Denmark",
    validity: "Matches Parent's Work Permit Duration Denmark",
    docs: "Primary parent's valid Danish work permit + Apostilled birth certificate + Parental custody proof + SIRI MF1 application"
  },
  {
    id: "dk-FAM-009",
    officialCode: "DK-FAM-009",
    name: "Denmark Elderly Parent (Over 60 Years) of Danish / Nordic Citizen Residence Permit Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "DKK 9400 Elderly Parent Family Reunification Permit Denmark",
    validity: "1 to 2 Years Renewable Parent Permit Denmark",
    docs: "Proof of biological parentage + Substantial humanitarian or health dependency proof + Sponsor income & suitable accommodation in Denmark"
  },
  {
    id: "dk-FAM-010",
    officialCode: "DK-FAM-010",
    name: "Denmark Newborn Child Born in Denmark to Foreign Residence Permit Holders Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free / DKK 2000 Newborn Child Residence Registration Denmark",
    validity: "Matches Parents' Residence Permit Validity Denmark",
    docs: "Danish CPR birth certificate + Child passport from home embassy in Copenhagen + Parents' opholdstilladelse cards + SIRI registration"
  },
  {
    id: "dk-FAM-011",
    officialCode: "DK-FAM-011",
    name: "Denmark Independent Residence Permit for Former Spouse After Divorce or Domestic Abuse Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "DKK 4325 Independent Humanitarian Family Permit Denmark",
    validity: "1 to 2 Years Independent Residence Card Denmark",
    docs: "Police / crisis center reports of domestic violence OR evidence of substantial integration (employment/Danish language) + SIRI assessment"
  },
  {
    id: "dk-FAM-012",
    officialCode: "DK-FAM-012",
    name: "Denmark Adopted Child International Adoption Residence Permit Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "DKK 9400 International Adoption Residence Permit Denmark",
    validity: "Permanent / Matches Adoptive Parents' Status Denmark",
    docs: "Official approval from Danish National Board of Adoption (Adoptionsnævnet) + Hague Adoption Convention documents + Home country court decree"
  },
  {
    id: "dk-FAM-013",
    officialCode: "DK-FAM-013",
    name: "Denmark Accompanying Family Member to Start-up Denmark & Self-Employed Founders Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "DKK 4325 Entrepreneur Dependent Residence Permit Denmark",
    validity: "Matches Start-up Founder's Permit (Up to 2 Years) Denmark",
    docs: "Primary founder's Start-up Denmark permit + Marriage & birth certificates + Living funds proof for family + SIRI MF1 application"
  },
  {
    id: "dk-FAM-014",
    officialCode: "DK-FAM-014",
    name: "Denmark Accompanying Dependent Work Rights Card (Full Unrestricted Labor Market Access) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Included in MF1 Family Permit Fee",
    validity: "Valid for Entire Duration of Primary Spouse's Work Permit Denmark",
    docs: "Accompanying family residence card granted under SIRI work scheme (Pay Limit, Positive List, Fast Track) granting automatic full work authorization"
  },

  // ==========================================
  // PR & CITIZENSHIP (12) - Permanent Residence, Supplementary Pay Limit, Naturalization & EU Blue Card PR
  // ==========================================
  {
    id: "dk-PR-001",
    officialCode: "DK-PR-001",
    name: "Denmark Permanent Residence Permit PR 8Y Permanent Residence Permit PR 8Y PR Denmark - 8 Years Residence",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "DKK 6150 Permanent Residence Permit PR 8Y PR Denmark",
    validity: "Permanent Residence Permit PR 8Y PR Denmark - Permanent",
    docs: "Residence 8Y Denmark PR + Employment 3Y 6M Denmark PR + Danish 2 test + No crime + Self-support 4Y + No public debt + Permanent Residence TU1 SIRI Denmark + 8 years residence + Employment 3Y 6M + Danish 2",
    fundsBox: "Employment 3Y 6M in 4Y Permanent Residence Permit PR 8Y PR Denmark + Income DKK 0 self-support 4Y + No public debt + Accommodation",
    warningBox: "✅ Most common PR Denmark Permanent Residence PR 8Y - 8 years residence + 3Y 6M employment + Danish 2 + Self-support 4Y + No crime 4Y"
  },
  {
    id: "dk-PR-002",
    officialCode: "DK-PR-002",
    name: "Denmark Permanent Residence Supplementary Pay Limit 4Y Permanent Residence Supplementary Pay Limit 4Y PR Denmark 4Y Fast Track PR",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "DKK 6150 Permanent Residence Supplementary Pay Limit 4Y PR Denmark Fast Track",
    validity: "Permanent Residence Supplementary Pay Limit 4Y PR Denmark Fast Track 4Y PR",
    docs: "Residence 4Y Denmark Supplementary Pay Limit + Salary DKK 514k 4Y + Employment 4Y + Danish 2 + Supplementary Pay Limit PR TU1 SIRI Denmark Fast Track 4Y"
  },
  {
    id: "dk-PR-003",
    officialCode: "DK-PR-003",
    name: "Denmark Citizenship Naturalization 9Y Citizenship Naturalization 9Y PR Denmark Citizenship - 9 Years",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "DKK 4000 Citizenship Naturalization 9Y PR Denmark Citizenship",
    validity: "Permanent Citizenship Naturalization 9Y PR Denmark Citizenship",
    docs: "Residence 9Y Denmark citizenship + Permanent residence Denmark + Danish 3 test + Citizenship test Denmark + No crime + Self-support 4Y 6M + No debt + Citizenship application Ministry Immigration Denmark + 9Y residence + Danish 3 + Citizenship test"
  },
  {
    id: "dk-PR-004",
    officialCode: "DK-PR-004",
    name: "Denmark EU Blue Card 4Y EU Blue Card 4Y PR Denmark Blue Card EU",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "DKK 4325 EU Blue Card 4Y PR Denmark Blue Card EU",
    validity: "4 Years EU Blue Card 4Y PR Denmark Blue Card EU",
    docs: "Higher education + Job offer DKK 514k Denmark Blue Card + Blue Card AR1 SIRI Denmark + Blue Card EU Denmark"
  },
  {
    id: "dk-PR-005",
    officialCode: "DK-PR-005",
    name: "Denmark Green Card Scheme Transition & Extension Permit (Holders Transition to PR/Work) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "DKK 4325 Green Card Transition & Extension Scheme Denmark",
    validity: "Permanent / Extension Leading to Permanent Residence Denmark",
    docs: "Green Card transition employment verification + Tax returns + Continuous residence + Danish 2 test + Permanent residence eligibility application SIRI"
  },
  {
    id: "dk-PR-006",
    officialCode: "DK-PR-006",
    name: "Denmark Extension Permanent Residence Permit Extension Permanent Residence Permit Extension PR Denmark Extension",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "DKK 6150 Extension Permanent Residence Permit Extension PR Denmark Extension",
    validity: "Permanent Extension Permanent Residence Permit Extension PR Denmark Extension",
    docs: "Permanent residence card renewal + Extension TU1 SIRI Denmark"
  },
  {
    id: "dk-PR-007",
    officialCode: "DK-PR-007",
    name: "Denmark Fast-Track Permanent Residence 4-Year Scheme (Meeting All 4 Supplementary Criteria) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "DKK 6150 Fast-Track 4-Year Permanent Residence Permit Denmark",
    validity: "Permanent (Tidsubegrænset Opholdstilladelse) Denmark",
    docs: "4 years continuous legal residence + Danish Prøve i Dansk 3 passed + Min 4 years full-time employment + Taxable income meeting threshold (DKK 319,737+) + Active citizenship / volunteer test"
  },
  {
    id: "dk-PR-008",
    officialCode: "DK-PR-008",
    name: "Denmark EU Long-Term Resident Status (Directives 2003/109/EC) 5Y Permanent Card Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "DKK 6150 EU Long-Term Resident Permit Denmark",
    validity: "Permanent EU Long-Term Resident Status (5-Year Renewable Card) Denmark",
    docs: "5 years continuous legal stay in Denmark + Stable regular financial income + Sickness insurance + No public welfare assistance + SIRI TU1"
  },
  {
    id: "dk-PR-009",
    officialCode: "DK-PR-009",
    name: "Denmark Citizenship by Declaration for Nordic Citizens (7 Years Nordic Residence) Denmark",
    toCountry: "dk",
    fromCountry: "se",
    category: "pr",
    record_type: "PR_VISA",
    fee: "DKK 1200 Nordic Citizen Declaration of Danish Citizenship",
    validity: "Permanent Danish Citizenship (Dansk Statsborgerskab)",
    docs: "Nordic passport (Swedish, Norwegian, Finnish, Icelandic) + 7 years continuous residence in Denmark + Clean criminal record + Statsforvaltningen declaration"
  },
  {
    id: "dk-PR-010",
    officialCode: "DK-PR-010",
    name: "Denmark Permanent Residence for Children Turning 18 Raised in Denmark PR Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "DKK 6150 Young Adults Permanent Residence Denmark",
    validity: "Permanent (Tidsubegrænset Opholdstilladelse) Denmark",
    docs: "Child raised in Denmark on family permit + Completed Danish public school (Folkeskole) or upper secondary + Turning 18 years of age + SIRI application"
  },
  {
    id: "dk-PR-011",
    officialCode: "DK-PR-011",
    name: "Denmark Permanent Residence for Foreigners with Danish Ancestry / Historical Ties Denmark",
    toCountry: "dk",
    fromCountry: "us",
    category: "pr",
    record_type: "PR_VISA",
    fee: "DKK 6150 Danish Descent Permanent Residence Permit",
    validity: "Permanent Residence (10-Year Card) Denmark",
    docs: "Genealogical proof of parents/grandparents holding Danish citizenship + Knowledge of Danish society and culture + Self-support proof"
  },
  {
    id: "dk-PR-012",
    officialCode: "DK-PR-012",
    name: "Denmark Re-Entry Permit / Preservation of Permanent Residence (Lapse Dispensation) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "DKK 1670 Dispensation from Lapse of Permanent Residence",
    validity: "Maintains Permanent Residence During Extended Absence Overseas",
    docs: "Proof of established permanent residence in Denmark + Justification for temporary stay abroad (study, overseas employment posting, family care) + SIRI BF1"
  }
];

const SUPPORTING_AND_LEGACY_DK: RawDenmarkItem[] = [
  {
    id: "dk-SUP-001",
    officialCode: "DK-SUP-001",
    name: "SIRI Authority (Danish Agency for International Recruitment and Integration - nyidanmark.dk) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "SIRI = Danish Agency for International Recruitment and Integration - Administers Work, Study, Trainee, Au Pair, and Permanent Residence schemes via nyidanmark.dk"
  },
  {
    id: "dk-SUP-002",
    officialCode: "DK-SUP-002",
    name: "CVR (Det Centrale Virksomhedsregister) Commercial Registration Authority Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "CVR = Central Business Register in Denmark - Sponsoring employer CVR number and registered P-number required on all SIRI AR1 work visa petitions"
  },
  {
    id: "dk-SUP-003",
    officialCode: "DK-SUP-003",
    name: "MitID & CPR (Det Centrale Personregister) National Identification System Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "CPR number (Civil Registration Number) & MitID digital authentication required for opening Danish bank NemKonto, registering address (folkeregister), and health insurance yellow card (Sundhedskort)"
  },
  {
    id: "dk-LEG-001",
    officialCode: "DK-LEG-001",
    name: "Legacy Old Pay Limit Threshold DKK 448k (Replaced by New Pay Limit & Supplementary Schemes) Denmark",
    toCountry: "dk",
    fromCountry: "in",
    category: "pr",
    record_type: "LEGACY_VISA",
    fee: "-",
    validity: "-",
    docs: "Historical reference only - Pay limit threshold updated to DKK 514,000/year and Supplementary Pay Limit to DKK 393,000/year"
  }
];

function convertRawToVisaItem(item: RawDenmarkItem): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
  const details = getDenmarkMicroDetails(item.id, item.category, item.name, item.fundsBox, item.itrBox, item.bankBox);

  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    category: item.category,
    categoryCode: item.category,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    processing: "10 - 15 Calendar Days (VFS Denmark / Schengen C) or 30 - 60 Days (SIRI Denmark / Work & Study)",
    icon: item.category === 'tourist' ? '🏖️' : item.category === 'work' ? '💼' : item.category === 'student' ? '🎓' : item.category === 'family' ? '👨‍👩‍👧' : item.category === 'business' ? '🤝' : '🏛️',
    purpose: `${item.name} — Official Denmark (${item.officialCode}) visa and residence permit pathway processed via VFS Global Denmark, Danish Ministry of Foreign Affairs, and SIRI (Danish Agency for International Recruitment and Integration).`,
    eligibility: "Valid passport with min 3 months validity beyond departure, 2 blank pages, travel medical insurance EUR 30,000, confirmed travel itinerary / Danish employment contract meeting SIRI salary rules / university admission, and seasoned financial proof.",
    popular: item.id.endsWith('-001'),
    highlight: item.id.endsWith('-001'),
    isActive: item.record_type !== 'LEGACY_VISA',
    isLegacy: item.record_type === 'LEGACY_VISA',
    record_type: item.record_type,
    toCountry: item.toCountry,
    fromCountry: item.fromCountry,
    warningBox: item.warningBox,
    rawFundsBox: item.fundsBox,
    rawBankBox: item.bankBox,
    docs: docList,
    documents: docList,
    fundsBox: details.fundsBox,
    itrBox: details.itrBox,
    bankBox: details.bankBox,
    microDetails: details,
    infoReq: [
      "Full Name, CPR Number (if previously resident in Denmark), Date & Place of Birth, Nationality",
      "Passport Number, Issue Date, Expiry Date (valid at least 3 months after departure from Denmark)",
      "Danish Host / Employer CVR Number, P-Number, and Registered Address in Denmark",
      "SIRI Case Order ID (Sagsbestillings-ID) and payment confirmation receipt for residence permit applications"
    ],
    steps: [
      "Create and pay for Case Order ID (Sagsbestillings-ID) on the official SIRI portal (nyidanmark.dk) or register on ApplyVisa portal for Schengen C.",
      "Complete the official online application form (AR1 for Work, ST1 for Student, FA1 for Family, or VU1 for Host Invitation).",
      "Prepare mandatory certified documents including 3-6 months bank statements, CVR employment contract, or paid university tuition receipt.",
      "Attend biometrics recording at VFS Global Denmark or Danish diplomatic mission and receive your stamped visa or Opholdstilladelse residence card."
    ],
    tips: [
      "Ensure personal bank statements maintain at least DKK 500/day for tourists or DKK 7,000/month (DKK 84,000/year) for students with no sudden last-minute deposits.",
      "For Pay Limit Scheme work permits, ensure that your gross salary is paid into a Danish bank account (NemKonto) and meets the exact SIRI DKK threshold.",
      "For Family Reunification (FA1), verify that the sponsor provides the full bank collateral guarantee (DKK 113,000) and meets the 20 sqm per person housing rule."
    ],
    faq: [
      {
        q: `What is the official visa fee and validity for ${item.name}?`,
        a: `Official Fee: ${item.fee}. Validity: ${item.validity}. Processed via VFS Denmark, SIRI, or Ministry of Foreign Affairs.`
      },
      {
        q: `What documents are required for ${item.officialCode}?`,
        a: `Required documents: ${item.docs}.`
      }
    ]
  };
}

const ALL_DK_CONVERTED = DK_92.map(convertRawToVisaItem);
const ALL_DK_SUPPORTING = SUPPORTING_AND_LEGACY_DK.map(convertRawToVisaItem);

export const DENMARK_92_VISAS: CountryVisas = {
  tourist: ALL_DK_CONVERTED.filter(i => i.category === 'tourist'),
  business: ALL_DK_CONVERTED.filter(i => i.category === 'business'),
  work: ALL_DK_CONVERTED.filter(i => i.category === 'work'),
  student: ALL_DK_CONVERTED.filter(i => i.category === 'student'),
  family: ALL_DK_CONVERTED.filter(i => i.category === 'family'),
  pr: ALL_DK_CONVERTED.filter(i => i.category === 'pr'),
  supporting: ALL_DK_SUPPORTING
};
