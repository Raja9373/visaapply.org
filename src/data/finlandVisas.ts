import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getFinlandMicroDetails(code: string, cat: string, name: string, rawFunds?: string, rawItr?: string, rawBank?: string) {
  let fundsMin = rawFunds || "Finland C Short Stay Visa requires proof of min EUR 30/day (approx EUR 900 for 30 days) + hotel booking + round-trip ticket + travel medical insurance (min EUR 30,000 across all 29 Schengen states).";
  let fundsBankMonths = rawBank || "Last 3 months personal bank statements stamped by bank branch (min EUR 2,000 liquid funds). No sudden deposit 1 day before ❌.";
  let fundsSudden = "❌ Sudden large cash deposits right before visa submission at VFS Finland / Migri are strictly audited and rejected. Maintain seasoned funds.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement with EUR 30/day liquid funds. ❌ Galat: Sudden deposit 24-48 hours prior to appointment.";

  let itrYears = rawItr || "ITR 2Y required for C tourist Finland Schengen = VFS Finland Delhi / Mumbai.";
  let itrMatch = "Declared income must align with bank account salary credits and employer leave letter/NOC.";
  let itrNoItr = "Not required for short-term visitors fully sponsored by host via verified Finnish host invitation letter.";

  let bankMonths = rawBank || "Last 3 months bank statements showing min EUR 2,000 liquid balance.";
  let bankReg = "Regular salary credits or business income.";
  let bankFd = "Fixed deposits accepted only as secondary supplementary proof.";
  let bankSource = "Salary, business income, or verified host sponsor funds in Finland.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('ttol') || lowerCode.includes('specialist')) {
    fundsMin = rawFunds || "Finland Work Permit (Employed Person TTOL / Specialist / EU Blue Card) requires a binding job contract from a Finnish employer registered in YTJ (Business ID Y-tunnus) + gross monthly salary meeting ELY/TE Office collective agreement threshold (min EUR 1,399/month for TTOL, EUR 3,000/month for Specialist, EUR 3,638/month for EU Blue Card in 2024).";
    fundsBankMonths = "Employment contract, employer terms of employment submitted via Enter Finland for Employers, and educational credentials.";
    fundsSudden = "Contract must state gross monthly salary in EUR, job duties, and weekly hours (min 37.5 hrs/week for full-time).";
    fundsEx = "✅ Sahi: Signed employment contract + ELY Centre labour market clearance + Enter Finland OL1 submission. ❌ Galat: Salary below collective agreement without TE Office approval.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('phd')) {
    fundsMin = rawFunds || "Finland Student Residence Permit (OLE_OPI) requires official acceptance letter from an accredited Finnish higher education institution + paid tuition fee receipt + proof of living funds of at least EUR 800/month (EUR 9,600/year) in a bank account in student's own name.";
    fundsBankMonths = "3 months personal bank statements showing min EUR 9,600 liquid balance in student's name + health insurance policy.";
    fundsSudden = "Bank account must be in the student's own name; third-party guarantees from distant relatives are not accepted by Migri.";
    fundsEx = "✅ Sahi: University acceptance letter + paid tuition receipt + EUR 9,600 bank statement in student's name. ❌ Galat: Unverified sponsor bank account.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('reunification')) {
    fundsMin = rawFunds || "Finland Family Reunification Residence Permit (OLE_PH) requires sponsor residing in Finland to demonstrate secure subsistence without recourse to social assistance (min net income EUR 1,700/month for spouse, plus EUR 500-700/month per child) + suitable accommodation proof.";
    fundsBankMonths = "6 months sponsor payslips, Vero tax assessment (Verotuspäätös), and bank statements showing net income EUR 1,700+/month.";
    fundsSudden = "Migri calculates net income after taxes and pension deductions; welfare assistance (toimeentulotuki) disqualifies sponsorship.";
    fundsEx = "✅ Sahi: Net salary EUR 1,700+/month + apostilled marriage/birth certificate + rental lease. ❌ Galat: Net income below threshold or un-apostilled marriage certificate.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('startup')) {
    fundsMin = rawFunds || "Finland Business Visitor / Startup Entrepreneur Residence Permit requires official business invitation with Finnish Y-tunnus, or for Startup, a positive Eligibility Statement from Business Finland demonstrating scalable international growth.";
    fundsBankMonths = "3-6 months corporate and personal bank statements + Business Finland statement.";
    fundsSudden = "Host company must have active registration in the Finnish Trade Register (Kaupparekisteri / YTJ).";
    fundsEx = "✅ Sahi: Official business invitation with Y-tunnus + foreign company deputation letter OR Business Finland startup statement. ❌ Galat: Unregistered host company.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('pysyvä')) {
    fundsMin = rawFunds || "Finland Permanent Residence Permit (P permit - Pysyvä oleskelulupa) requires 4 years continuous legal residence in Finland on continuous 'A' status without gaps exceeding statutory limits + continuous financial self-support + clean criminal record + satisfactory Finnish or Swedish language proficiency (YKI 3).";
    fundsBankMonths = "4 years Vero tax returns, employment contracts, pension records, and clean criminal background check.";
    fundsSudden = "Continuous residence on 'A' permit for 4 unbroken years evaluated by Migri.";
    fundsEx = "✅ Sahi: 4 years continuous A permit + 4 years tax returns + Finnish YKI 3 language certificate. ❌ Galat: Interrupted residence or prolonged absence abroad.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

export interface RawFinlandItem {
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

export const FI_92: RawFinlandItem[] = [
  // ==========================================
  // TOURIST (18) - Schengen C Tourist, Visiting Friends, Transit & Nordic Visas Finland
  // ==========================================
  {
    id: "fi-TOU-001",
    officialCode: "FI-TOU-001",
    name: "Schengen C Tourist 90/180 Days Finland C Tourist 90/180 - Most common Tourist Finland Schengen",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C tourist Finland 90/180 Schengen",
    validity: "90/180 C tourist Finland Schengen - 29 countries valid",
    docs: "Passport 3M 2 blank + Photo 36x47 white Schengen + Flight return + Hotel all Finland + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + C tourist Finland application VFS Finland",
    fundsBox: "EUR 30/day = Bank 3M EUR 30/day = C tourist Finland Schengen = EUR 30/day minimum Migri Finland",
    itrBox: "ITR 2Y required C tourist Finland Schengen = VFS Finland",
    bankBox: "Bank 3M last 3 months min EUR 2000 C tourist Finland Schengen - No sudden deposit 1 day before ❌",
    warningBox: "✅ Most common tourist Finland C Tourist 90/180 Schengen - VFS Finland Delhi - 29 countries valid - Migri Finland"
  },
  {
    id: "fi-TOU-002",
    officialCode: "FI-TOU-002",
    name: "Schengen C Business 90/180 C Business 90/180 Business Finland Schengen Business",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 C business Finland Schengen",
    validity: "90/180 C business Finland Schengen",
    docs: "Finnish company invitation letter + Finnish business ID Y-tunnus + Foreign company letter + Business card + Business registration foreign + Chamber of commerce + Business invitation + Business proof + Insurance + Bank + C business Finland VFS Finland"
  },
  {
    id: "fi-TOU-003",
    officialCode: "FI-TOU-003",
    name: "Schengen C Visiting Family Friends 90/180 C Visiting Family Friends 90/180 Visitor Finland Family",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C visiting family friends Finland",
    validity: "90/180 C visiting family friends Finland Schengen",
    docs: "Finnish host invitation letter + Host Finnish ID + Relationship proof + Host financial + Accommodation proof Finland + C visiting Finland VFS"
  },
  {
    id: "fi-TOU-004",
    officialCode: "FI-TOU-004",
    name: "Schengen C Cultural Sports 90/180 C Cultural Sports 90/180 Cultural Finland Sports",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C cultural Finland Schengen",
    validity: "90/180 C cultural Finland",
    docs: "Event organizer invitation Finland + Cultural event proof + Sports federation invitation + C cultural Finland VFS"
  },
  {
    id: "fi-TOU-005",
    officialCode: "FI-TOU-005",
    name: "Airport Transit Visa Type A Finland Airport Transit Type A Finland Transit",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 Airport Transit Type A Finland",
    validity: "24H Airport Transit Type A Finland",
    docs: "Passport + Onward ticket + Destination visa + Airport Transit Type A Finland VFS"
  },
  {
    id: "fi-TOU-006",
    officialCode: "FI-TOU-006",
    name: "Schengen C Multiple-Entry 1Y Tourist Visa (90/180 Days) Finland Schengen 1Y",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Multiple 1Y Finland Schengen",
    validity: "1 Year Multiple Entry (90/180 Days) Finland",
    docs: "Previous lawful Schengen visas in past 2 years + Bank statement 6M + Regular travel justification + Travel insurance EUR 30000 + VFS Finland"
  },
  {
    id: "fi-TOU-007",
    officialCode: "FI-TOU-007",
    name: "Schengen C Multiple-Entry 2Y Tourist Visa (90/180 Days) Finland Schengen 2Y",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Multiple 2Y Finland Schengen",
    validity: "2 Years Multiple Entry (90/180 Days) Finland",
    docs: "Previous 1-year multiple entry Schengen visa lawfully utilized + 6M bank statement + Employment certificate + Insurance + VFS Finland"
  },
  {
    id: "fi-TOU-008",
    officialCode: "FI-TOU-008",
    name: "Schengen C Multiple-Entry 5Y Tourist Visa (90/180 Days) Finland Schengen 5Y",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Multiple 5Y Finland Schengen",
    validity: "5 Years Multiple Entry (90/180 Days) Finland",
    docs: "Previous 2-year multiple entry Schengen visa lawfully used + 12M bank statements + High-frequency travel justification + VFS Finland"
  },
  {
    id: "fi-TOU-009",
    officialCode: "FI-TOU-009",
    name: "ETIAS European Travel Authorization 3Y (Visa-Exempt Nationalities) Finland",
    toCountry: "fi",
    fromCountry: "us",
    category: "tourist",
    record_type: "ETA_VISA",
    fee: "EUR 7 ETIAS 3Y Travel Authorization Finland",
    validity: "3 Years or Passport Expiry (90/180 Days) Finland",
    docs: "Biometric passport from visa-exempt nation + Online ETIAS registration + Confirmed travel details + Return flight"
  },
  {
    id: "fi-TOU-010",
    officialCode: "FI-TOU-010",
    name: "Finland National D Long-Stay Humanitarian & Family Visitor Visa 1Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 120 National D Visitor Visa Finland",
    validity: "Up to 1 Year National D Stay in Finland",
    docs: "Invitation from permanent resident/citizen in Finland + Humanitarian circumstances statement + Accommodation proof + Bank statement 3M + Migri"
  },
  {
    id: "fi-TOU-011",
    officialCode: "FI-TOU-011",
    name: "Schengen C Medical Treatment & Specialized Hospital Care Visa 90/180 Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Medical Treatment Finland",
    validity: "90/180 Days Medical Care in Finland",
    docs: "Medical appointment letter from Finnish hospital (HUS / TAYS / OYS) + Prepayment/financial guarantee + Medical history referral + Insurance EUR 30000"
  },
  {
    id: "fi-TOU-012",
    officialCode: "FI-TOU-012",
    name: "Schengen C Lapland Winter Tourism, Aurora & Arctic Adventure Visa 90/180 Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Lapland & Arctic Tourism Visa Finland",
    validity: "90/180 Days Winter & Arctic Adventure Stay Finland",
    docs: "Confirmed hotel/resort booking in Rovaniemi / Levi / Saariselkä + Arctic excursion tour bookings + Flight tickets + Travel insurance EUR 30000 + Bank 3M"
  },
  {
    id: "fi-TOU-013",
    officialCode: "FI-TOU-013",
    name: "Schengen C Seafarer & Baltic Port Transit Visa (Helsinki / Turku / Kotka) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Seafarer Transit Visa Finland",
    validity: "Up to 90 Days Seafarer Transit to Join Vessel in Finland",
    docs: "Seaman Book (CDC) + Shipping company guarantee letter in Finland + Crew list + Vessel IMO details + Employment contract"
  },
  {
    id: "fi-TOU-014",
    officialCode: "FI-TOU-014",
    name: "Schengen C Official Government Delegation & Intergovernmental Mission Visa Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "Free / EUR 90 Official Delegation C Visa Finland",
    validity: "Duration of Official Mission (Up to 90/180 Days) Finland",
    docs: "Note Verbale from sending Ministry of Foreign Affairs + Official Finnish Ministry invitation + Diplomatic/Official or Ordinary Passport + Mission agenda"
  },
  {
    id: "fi-TOU-015",
    officialCode: "FI-TOU-015",
    name: "Schengen C Cascade Rule 3-Year Multi-Entry Tourist Visa Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C 3-Year Cascade Tourist Visa Finland",
    validity: "3 Years Multiple Entry (90/180 Days per period) Finland",
    docs: "2 lawfully obtained and used Schengen visas in previous 2 years + Bank statement 6M + Continuous employment + Insurance EUR 30000"
  },
  {
    id: "fi-TOU-016",
    officialCode: "FI-TOU-016",
    name: "Schengen C Baltic Cruise & Archipelago Sightseeing Passenger Visa Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Baltic Cruise Tourist Visa Finland",
    validity: "90/180 Days Single/Multiple Entry for Baltic Cruise Tour",
    docs: "Confirmed cruise booking sailing via Port of Helsinki / Turku Archipelago + Return flight + Shore excursion itinerary + Travel medical insurance EUR 30000"
  },
  {
    id: "fi-TOU-017",
    officialCode: "FI-TOU-017",
    name: "Schengen C Accredited Tour Group & Package Sightseeing Visitor Visa Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 Organized Group Tour C Visa Finland",
    validity: "30 to 90 Days Package Sightseeing Finland",
    docs: "Licensed Finnish tour operator voucher + Confirmed day-by-day Helsinki, Tampere & Lake Saimaa itinerary + Return flight reservation + Travel insurance EUR 30000 + Bank 3M"
  },
  {
    id: "fi-TOU-018",
    officialCode: "FI-TOU-018",
    name: "Finland Remote Work & Digital Nomad National D Visa 1Y-4Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "tourist",
    record_type: "DIGITAL_NOMAD_VISA",
    fee: "EUR 380 Remote Work Digital Nomad D Visa Finland",
    validity: "1 to 4 Years Remote Work Stay Finland",
    docs: "Remote employment contract outside Finland or foreign freelance clientele + Proof of monthly income min EUR 3,000/month + Personal bank statement 6M + Medical insurance",
    warningBox: "Digital Nomad National D Visa: Allows remote work for foreign clients while residing in Finland. Min net income EUR 3,000/month required."
  },

  // ==========================================
  // BUSINESS (8) - Business Visitor, Trade Fair, Startup Entrepreneur & Commercial Visas Finland
  // ==========================================
  {
    id: "fi-BUS-001",
    officialCode: "FI-BUS-001",
    name: "Finland Business Visitor C 90/180 Business Visitor C 90/180 Business Finland Business Visitor - Most common Business Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Business Visitor C Finland",
    validity: "90/180 Business Visitor C Finland",
    docs: "Finnish business invitation + Y-tunnus + Foreign company letter + Business meeting proof + Business Visitor C Finland VFS",
    warningBox: "✅ Most common business Finland Business Visitor C 90/180 Schengen - VFS Finland"
  },
  {
    id: "fi-BUS-002",
    officialCode: "FI-BUS-002",
    name: "Finland Trade Fair C 90/180 Trade Fair C 90/180 Business Finland Trade Fair",
    toCountry: "fi",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Trade Fair C Finland",
    validity: "90/180 Trade Fair C Finland",
    docs: "Trade fair invitation Finland + Exhibitor proof + Trade Fair C Finland VFS"
  },
  {
    id: "fi-BUS-003",
    officialCode: "FI-BUS-003",
    name: "Finland Startup Entrepreneur Residence Permit Startup Entrepreneur Residence Permit Business Finland Startup",
    toCountry: "fi",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 500 Startup Entrepreneur Residence Permit Business Finland Startup",
    validity: "2 Years Startup Entrepreneur Residence Permit Business Finland Startup",
    docs: "Business Finland eligibility statement + Startup business plan Finland + Business plan approval Business Finland + Funds EUR 1000/month + Startup Entrepreneur residence permit Enter Finland Migri + Startup Finland"
  },
  {
    id: "fi-BUS-004",
    officialCode: "FI-BUS-004",
    name: "Finland Self-Employed Entrepreneur Residence Permit (Ammatinharjoittaja / Toiminimi) 1Y-2Y Business Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 500 Self-Employed Entrepreneur Residence Permit Finland",
    validity: "1 to 2 Years Renewable Self-Employed Permit Finland",
    docs: "Trade Register registration (YTJ / Kaupparekisteri) + Business plan + ELY Centre assessment of business profitability + Proof of living funds + Enter Finland"
  },
  {
    id: "fi-BUS-005",
    officialCode: "FI-BUS-005",
    name: "Finland Executive Board Member & Corporate Management Schengen C Multi-Entry Visa 1Y-5Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Corporate Executive Management Multi-Entry C Visa",
    validity: "1 to 5 Years Multiple Entry (90/180 Days) Finland",
    docs: "Extract from Finnish Trade Register (Kaupparekisteri) showing board membership + Corporate invitation + Guarantee of expenses by host company + Insurance EUR 30000"
  },
  {
    id: "fi-BUS-006",
    officialCode: "FI-BUS-006",
    name: "Finland Commercial Negotiations, Legal Audit & Tech Consulting C Visa 90/180 Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Commercial Contract Consulting C Visa Finland",
    validity: "90/180 Days Commercial Consulting Stay Finland",
    docs: "Draft commercial contracts + Deputation letter from multinational employer + Invitation from Finnish partner with Business ID (Y-tunnus) + Bank statement"
  },
  {
    id: "fi-BUS-007",
    officialCode: "FI-BUS-007",
    name: "Finland After-Sales Machinery Installation, Commissioning & Maintenance C Visa Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Industrial Installation & Warranty Service C Visa",
    validity: "Up to 90 Days Industrial Installation & Warranty Work Finland",
    docs: "Machinery supply contract between Finnish buyer and foreign manufacturer + Installation clause + Host company invitation with Y-tunnus + Specialist engineer credentials"
  },
  {
    id: "fi-BUS-008",
    officialCode: "FI-BUS-008",
    name: "Finland Slush & High-Tech Ecosystem Conference & Investor Networking C Visa Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Slush & Tech Ecosystem Investor Visa Finland",
    validity: "90/180 Days Tech Conference & Investment Meetings Finland",
    docs: "Official ticket / invitation to Slush or verified Finnish tech summit + Pitch deck / investor accreditation + Return flight + Hotel booking + Bank 3M"
  },

  // ==========================================
  // WORK (28) - TTOL, Specialist, Growth Entrepreneur, EU Blue Card, Researchers & Seasonal Work Finland
  // ==========================================
  {
    id: "fi-WRK-001",
    officialCode: "FI-WRK-001",
    name: "Finland Work Permit Employed Person TTOL 1Y Work Permit Employed Person TTOL 1Y Work Finland - Most common Work Finland TTOL",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Work Permit Employed Person TTOL 1Y Work Finland TTOL Employed",
    validity: "1 Year Work Permit Employed Person TTOL 1Y Work Finland TTOL Employed Person",
    docs: "Job contract Finland TTOL + Employment contract Finland TTOL Employed Person + Employer ELY center approval TE Office + Diploma + TTOL OL1 Enter Finland Migri + Job offer Finland TTOL Employed",
    fundsBox: "Salary min EUR 1399/month TTOL Employed Person Finland Work Permit TTOL - EUR 1399/month 2024 + Collective agreement",
    warningBox: "✅ Most common work Finland Employed Person TTOL 1Y - ELY center TE Office labour market test - Enter Finland OL1 - TTOL = Työntekijän oleskelulupa"
  },
  {
    id: "fi-WRK-002",
    officialCode: "FI-WRK-002",
    name: "Finland Work Permit Specialist 2Y Specialist 2Y Work Finland Specialist Highly Skilled",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Specialist 2Y Work Finland Specialist",
    validity: "2 Years Specialist 2Y Work Finland Specialist Highly Skilled",
    docs: "Specialist job offer Finland + Degree + Salary EUR 3000/month Specialist + Specialist OL1 Enter Finland Migri + Employment contract Finland Specialist + Job offer Finland Specialist + Degree + Specialist expertise"
  },
  {
    id: "fi-WRK-003",
    officialCode: "FI-WRK-003",
    name: "Finland Work Permit Growth Entrepreneur 2Y Growth Entrepreneur 2Y Work Finland Growth Entrepreneur",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 500 Growth Entrepreneur 2Y Work Finland Growth",
    validity: "2 Years Growth Entrepreneur 2Y Work Finland Growth Entrepreneur",
    docs: "Business Finland eligibility Growth Entrepreneur + Business plan growth + Funds EUR 1000/month + Growth Entrepreneur EL1 Enter Finland Migri + Startup growth Finland Business Finland"
  },
  {
    id: "fi-WRK-004",
    officialCode: "FI-WRK-004",
    name: "Finland EU Blue Card 2Y EU Blue Card 2Y Work Finland EU Blue Card",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 EU Blue Card 2Y Work Finland EU Blue Card",
    validity: "2 Years EU Blue Card 2Y Work Finland EU Blue Card",
    docs: "Higher education degree + Job offer Finland EU Blue Card EUR 3638/month 2024 + EU Blue Card OL1 Enter Finland Migri + Employment contract Finland EU Blue Card + Degree + Salary EUR 3638"
  },
  {
    id: "fi-WRK-005",
    officialCode: "FI-WRK-005",
    name: "Finland Work Permit Researcher 2Y Researcher 2Y Work Finland Researcher",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Researcher 2Y Work Finland Researcher",
    validity: "2 Years Researcher 2Y Work Finland Researcher",
    docs: "Researcher job offer Finland + Research agreement Finland + PhD + Researcher OL1 Enter Finland Migri"
  },
  {
    id: "fi-WRK-006",
    officialCode: "FI-WRK-006",
    name: "Finland Work Permit Seasonal Work 9M Seasonal Work 9M Work Finland Seasonal Agriculture Tourism",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Seasonal Work 9M Work Finland Seasonal",
    validity: "9 Months Seasonal Work 9M Work Finland Seasonal Agriculture Tourism",
    docs: "Seasonal job offer Finland + Seasonal work contract Finland + Seasonal Work OL1 Enter Finland Migri"
  },
  {
    id: "fi-WRK-007",
    officialCode: "FI-WRK-007",
    name: "Finland Au Pair 1Y Au Pair 1Y Work Finland Au Pair Family",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Au Pair 1Y Work Finland Au Pair",
    validity: "1 Year Au Pair 1Y Work Finland Au Pair Family",
    docs: "Au Pair contract Finland + Host family approval Finland + Au Pair OL1 Enter Finland Migri + Age 18-30"
  },
  {
    id: "fi-WRK-008",
    officialCode: "FI-WRK-008",
    name: "Finland Intra Company Transfer ICT 3Y Intra Company Transfer ICT 3Y Work Finland ICT",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 ICT 3Y Work Finland Intra Company Transfer",
    validity: "3 Years Intra Company Transfer ICT 3Y Work Finland ICT",
    docs: "ICT permit Finland + Intra company transfer letter + Employment contract ICT + ICT OL1 Enter Finland Migri"
  },
  {
    id: "fi-WRK-009",
    officialCode: "FI-WRK-009",
    name: "Finland Fast-Track D Visa Scheme (Specialists, Startup Founders & Families - 14-Day Service) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 + EUR 120 D Visa Fast-Track Processing Fee",
    validity: "2 Years Specialist Work Permit with Immediate D Visa Entry Finland",
    docs: "Specialist employment contract (min EUR 3,000/month) + Fast-track online application in Enter Finland + Biometrics at embassy + D Visa sticker for immediate departure"
  },
  {
    id: "fi-WRK-010",
    officialCode: "FI-WRK-010",
    name: "Finland Healthcare Professional Work Permit (Doctor & Nurse Valvira Licensing Pathway) 2Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Healthcare Professional Residence Permit Finland",
    validity: "Up to 2 Years Supervised Adaptation & Clinical Work Finland",
    docs: "National Supervisory Authority for Welfare and Health (Valvira) preliminary qualification recognition + Hospital employment contract + Finnish language adaptation plan"
  },
  {
    id: "fi-WRK-011",
    officialCode: "FI-WRK-011",
    name: "Finland IT & Software Engineering Specialist Work Permit (No Labour Market Test) 2Y-4Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 IT Specialist Residence Permit Finland",
    validity: "2 to 4 Years Highly Skilled IT Permit Finland",
    docs: "Binding job offer in software architecture, cloud, or AI + Salary min EUR 3,000/month + Bachelor/Master in STEM or documented industry portfolio + Enter Finland"
  },
  {
    id: "fi-WRK-012",
    officialCode: "FI-WRK-012",
    name: "Finland Working Holiday Scheme 1Y (Youth 18-30 Years Bilateral Partners: AU, NZ, JP, KR) Finland",
    toCountry: "fi",
    fromCountry: "au",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 380 Working Holiday Residence Permit Finland",
    validity: "1 Year Working Holiday Stay Finland",
    docs: "Passport from reciprocal partner state + Age 18-30 + Return ticket + Bank statement min EUR 2,000 + Comprehensive medical insurance for 12 months"
  },
  {
    id: "fi-WRK-013",
    officialCode: "FI-WRK-013",
    name: "Finland Internship & Practical Training Work Permit for Foreign Students 1Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 380 Practical Training Residence Permit Finland",
    validity: "Up to 1 Year Educational Internship Stay Finland",
    docs: "Internship agreement with Finnish host enterprise + Home university verification that internship is part of studies or recent graduation + Subsistence guarantee"
  },
  {
    id: "fi-WRK-014",
    officialCode: "FI-WRK-014",
    name: "Finland Professional Athlete & Sports Coach Residence Permit 1Y-2Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Professional Sports Work Permit Finland",
    validity: "1 to 2 Years Sports Season Contract Duration Finland",
    docs: "Contract with registered Finnish sports club (Liiga / Veikkausliiga) + Sports federation endorsement + Living subsistence & sports insurance coverage"
  },
  {
    id: "fi-WRK-015",
    officialCode: "FI-WRK-015",
    name: "Finland University Teacher, Lecturer & Academic Faculty Residence Permit 2Y-4Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Academic Faculty Residence Permit Finland",
    validity: "2 to 4 Years Academic Contract Duration Finland",
    docs: "Employment contract with Finnish higher education institution + Master/PhD diploma + Exemption from TE Office labour market testing under Alien Act"
  },
  {
    id: "fi-WRK-016",
    officialCode: "FI-WRK-016",
    name: "Finland Artist, Performer & Cultural Field Professional Residence Permit 1Y-2Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Cultural Professional Residence Permit Finland",
    validity: "1 to 2 Years Engagement Duration Finland",
    docs: "Engagement contract with Finnish cultural institution, orchestra, or theatre + Artistic curriculum vitae & portfolio + Subsistence guarantee"
  },
  {
    id: "fi-WRK-017",
    officialCode: "FI-WRK-017",
    name: "Finland Construction, Welding & Heavy Industry Skilled Worker TTOL Permit 1Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Industrial Worker TTOL Permit Finland",
    validity: "1 Year Employment Contract Duration Finland",
    docs: "Job contract with Finnish construction/manufacturing enterprise + ELY Centre labour assessment + Trade certificates (welder/electrician/carpenter) + Enter Finland"
  },
  {
    id: "fi-WRK-018",
    officialCode: "FI-WRK-018",
    name: "Finland Shipbuilding & Maritime Technology Marine Engineer Work Permit 2Y (Turku / Rauma) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Marine Engineering Work Permit Finland",
    validity: "2 Years Shipyard Project Duration Finland",
    docs: "Employment offer from Finnish shipyard or marine equipment manufacturer (Meyer Turku / Rauma Marine) + Marine engineering degree + Work contract"
  },
  {
    id: "fi-WRK-019",
    officialCode: "FI-WRK-019",
    name: "Finland CleanTech, Bioeconomy & Renewable Energy Engineering Work Permit 2Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 CleanTech Engineering Work Permit Finland",
    validity: "2 Years Renewable CleanTech Employment Finland",
    docs: "Employment contract with Finnish clean energy, battery, or forestry bioeconomy enterprise + Technical engineering diploma + TE Office clearance"
  },
  {
    id: "fi-WRK-020",
    officialCode: "FI-WRK-020",
    name: "Finland Forest Industry & Silviculture Forestry Worker Seasonal/TTOL Permit Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Forestry Worker Residence Permit Finland",
    validity: "9 Months to 1 Year Silviculture Employment Finland",
    docs: "Forest harvesting or planting contract with Finnish forestry firm + TE Office labour market decision + Accommodation confirmation + Enter Finland"
  },
  {
    id: "fi-WRK-021",
    officialCode: "FI-WRK-021",
    name: "Finland Hospitality, Restaurant Chef & Culinary Specialist TTOL Work Permit 1Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Hospitality Culinary TTOL Permit Finland",
    validity: "1 Year Restaurant Employment Duration Finland",
    docs: "Culinary employment contract meeting MaRa collective agreement wages + Culinary trade diploma + Food hygiene passport commitment + ELY Centre clearance"
  },
  {
    id: "fi-WRK-022",
    officialCode: "FI-WRK-022",
    name: "Finland International Truck & Heavy Vehicle Transport Driver Work Permit 1Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Transport Driver TTOL Permit Finland",
    validity: "1 Year Transport Contract Duration Finland",
    docs: "Employment contract with Finnish freight company + Category C/CE driving license + Professional driver competence certificate (Direktiivikoulutus) + TE Office decision"
  },
  {
    id: "fi-WRK-023",
    officialCode: "FI-WRK-023",
    name: "Finland Volunteer Service (European Solidarity Corps & Non-Profit Foundation) 1Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 380 Volunteer Residence Permit Finland",
    validity: "Up to 1 Year Non-Profit Volunteering Finland",
    docs: "Volunteering agreement with Finnish non-profit foundation + Board and lodging guarantee + Pocket money + Sickness insurance"
  },
  {
    id: "fi-WRK-024",
    officialCode: "FI-WRK-024",
    name: "Finland Religious Worker, Clergy & Pastoral Minister Work Permit 1Y-2Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Religious Community Work Permit Finland",
    validity: "1 to 2 Years Pastoral Assignment Finland",
    docs: "Appointment letter from registered Finnish religious community + Ordination credentials + Living subsistence confirmation"
  },
  {
    id: "fi-WRK-025",
    officialCode: "FI-WRK-025",
    name: "Finland Accredited Foreign Journalist & International Press Correspondent D Visa Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 120 / EUR 540 Foreign Media Correspondent D Visa Finland",
    validity: "1 Year Media Accreditation Assignment Finland",
    docs: "Press accreditation from Finnish Ministry for Foreign Affairs (UM) + Foreign media organization deputation letter + International press card"
  },
  {
    id: "fi-WRK-026",
    officialCode: "FI-WRK-026",
    name: "Finland Finnish University Degree Graduate Work Residence Permit (Exempt from Labour Test) 2Y-4Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 540 Finnish Degree Graduate Work Permit",
    validity: "2 to 4 Years Unrestricted Labour Market Access Finland",
    docs: "Graduation diploma from Finnish university (Bachelor, Master, or PhD) + Signed employment contract in any field + Exemption from TE Office labour market testing"
  },

  // ==========================================
  // STUDENT (14) - Higher Education, Vocational, PhD, Job-Seeking & Researcher Permits Finland
  // ==========================================
  {
    id: "fi-STU-001",
    officialCode: "FI-STU-001",
    name: "Finland Student Residence Permit 1Y Higher Education Student Residence Permit 1Y Student Finland - Most common Student Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Student Residence Permit 1Y Higher Education Student Finland",
    validity: "1 Year Student Residence Permit 1Y Higher Education Student Finland",
    docs: "Admission letter Finland higher education + University admission Finland + Tuition fee receipt Finland higher education + Funds proof Finland student EUR 800/month + Accommodation Finland student + Student residence permit OLE_OPI Enter Finland Migri + Funds proof Finland student + Admission letter",
    fundsBox: "Funds EUR 800/month = EUR 9600/year Student Residence Permit 1Y Higher Education Student Finland = Bank statement 3M EUR 9600",
    warningBox: "✅ Most common student Finland Student Residence Permit 1Y Higher Education - Enter Finland OLE_OPI - Work 30H/week allowed - University sponsor"
  },
  {
    id: "fi-STU-002",
    officialCode: "FI-STU-002",
    name: "Finland Student Residence Permit Vocational 1Y Vocational Education 1Y Student Finland Vocational",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Vocational Education 1Y Student Finland Vocational",
    validity: "1 Year Vocational Education 1Y Student Finland Vocational",
    docs: "Vocational school admission Finland + Course fee + Vocational Education OLE_OPI Enter Finland Migri"
  },
  {
    id: "fi-STU-003",
    officialCode: "FI-STU-003",
    name: "Finland Student Residence Permit Researcher 2Y Researcher Student Residence Permit 2Y Student Finland Researcher PhD",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 540 Researcher Student Residence Permit 2Y Student Finland Researcher PhD",
    validity: "2 Years Researcher Student Residence Permit 2Y Student Finland Researcher PhD",
    docs: "PhD admission Finland + Researcher agreement Finland + Researcher OLE_TUT Enter Finland Migri"
  },
  {
    id: "fi-STU-004",
    officialCode: "FI-STU-004",
    name: "Finland Student Job Seeking After Graduation 2Y Job Seeking After Graduation 2Y Student Finland Graduate",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 380 Job Seeking After Graduation 2Y Student Finland Graduate",
    validity: "2 Years Job Seeking After Graduation 2Y Student Finland Graduate Job Seeking",
    docs: "Finnish degree completion + Job Seeking After Graduation OLE_JATKO Enter Finland Migri - Job seeking after study Finland"
  },
  {
    id: "fi-STU-005",
    officialCode: "FI-STU-005",
    name: "Finland Master Degree Postgraduate Student Residence Permit (OLE_OPI) 2Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Master Degree Student Residence Permit Finland",
    validity: "2 Years Degree Program Duration Finland",
    docs: "Acceptance into Finnish university Master program (University of Helsinki, Aalto, Tampere, Oulu) + Paid tuition fee receipt + Bank statement EUR 9,600/year"
  },
  {
    id: "fi-STU-006",
    officialCode: "FI-STU-006",
    name: "Finland University of Applied Sciences (AMK) Bachelor Student Permit 3.5Y-4Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 AMK Bachelor Student Residence Permit Finland",
    validity: "Full Bachelor Degree Duration (Up to 4 Years) Finland",
    docs: "Admission to Finnish University of Applied Sciences (Ammattikorkeakoulu - Metropolia, Haaga-Helia, Laurea) + Paid tuition receipt + Health insurance + Funds EUR 9,600/year"
  },
  {
    id: "fi-STU-007",
    officialCode: "FI-STU-007",
    name: "Finland Erasmus+ & University Exchange Student Residence Permit 6M-1Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Exchange Student Residence Permit Finland",
    validity: "1 Semester to 1 Year Exchange Stay Finland",
    docs: "Erasmus+ Learning Agreement + Host Finnish university acceptance letter + Home university enrollment + Grant confirmation / living funds"
  },
  {
    id: "fi-STU-008",
    officialCode: "FI-STU-008",
    name: "Finland Finland Scholarship & Higher Education Tuition Waiver Visa 2Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "Free / EUR 350 Finland Scholarship Student Residence Permit",
    validity: "2 Years Scholarship Program Duration Finland",
    docs: "Official Finland Scholarship award letter from university consortium + 100% tuition waiver + EUR 5,000 relocation grant confirmation"
  },
  {
    id: "fi-STU-009",
    officialCode: "FI-STU-009",
    name: "Finland Doctoral Researcher Employed by University (Contract of Employment) 4Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 540 Salaried Doctoral Candidate Residence Permit Finland",
    validity: "Up to 4 Years Doctoral Employment Duration Finland",
    docs: "Employment contract as Doctoral Researcher (Väitöskirjatutkija) with Finnish university + Monthly salary min EUR 2,400+ + PhD study admission letter"
  },
  {
    id: "fi-STU-010",
    officialCode: "FI-STU-010",
    name: "Finland Upper Secondary School & IB Diploma High School Student Permit 1Y-3Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Upper Secondary School (Lukio) Student Permit Finland",
    validity: "1 to 3 Years Secondary School Stay Finland",
    docs: "Admission letter from Finnish Lukio (General Upper Secondary / IB World School) + Parental consent + Living funds & guardian designation in Finland"
  },
  {
    id: "fi-STU-011",
    officialCode: "FI-STU-011",
    name: "Finland Short-Term Summer School & Language Course Schengen C Visa (<90 Days) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 90 Short Course Study Schengen C Visa Finland",
    validity: "Up to 90 Days Short Course Study Finland",
    docs: "Enrollment in Finnish university summer school or Finnish/Swedish language course + Hotel/dorm booking + Bank statement 3M + Travel insurance EUR 30000"
  },
  {
    id: "fi-STU-012",
    officialCode: "FI-STU-012",
    name: "Finland Student Residence Extension Scheme (Master Thesis Completion & Delays) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Student Residence Extension Permit Finland",
    validity: "6 Months to 1 Year Thesis Completion Extension Finland",
    docs: "Academic transcript proving at least 45 ECTS credits completed per academic year + University progress statement + Funds proof EUR 800/month"
  },
  {
    id: "fi-STU-013",
    officialCode: "FI-STU-013",
    name: "Finland Post-Doctoral Researcher Fellow & Academic Grantee Residence Permit 2Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 540 Grant-Funded Post-Doc Researcher Permit Finland",
    validity: "Up to 2 Years Research Grant Duration Finland",
    docs: "Hosting agreement with Finnish university + Research foundation grant award letter (Suomen Akatemia / Koneen Säätiö) + PhD diploma"
  },
  {
    id: "fi-STU-014",
    officialCode: "FI-STU-014",
    name: "Finland Dual Degree & Joint European Master Degree Program Student Permit Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Erasmus Mundus / Joint Master Student Permit Finland",
    validity: "Full Period of Finnish University Segment (1 - 2 Years) Finland",
    docs: "Joint consortium admission certificate (Erasmus Mundus / Nordic Five Tech) + Study plan detailing Finnish mobility segment + Scholarship grant"
  },

  // ==========================================
  // FAMILY (14) - Spouse, Child, Finnish Citizen Family, Cohabitation & Dependent Permits Finland
  // ==========================================
  {
    id: "fi-FAM-001",
    officialCode: "FI-FAM-001",
    name: "Finland Family Reunification Spouse 1Y Family Reunification Spouse 1Y Family Finland - Most common Family Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 470 Family Reunification Spouse 1Y Family Finland Spouse",
    validity: "1 Year Family Reunification Spouse 1Y Family Finland Spouse",
    docs: "Spouse Finnish residence + Marriage certificate attested + Relationship proof + Financial support EUR 1700/month sponsor + Accommodation + Family Reunification Spouse OLE_PH Enter Finland Migri + Financial + Accommodation Finland",
    fundsBox: "Sponsor income EUR 1700/month net Family Reunification Spouse 1Y Family Finland - EUR 1700/month sponsor net income",
    warningBox: "✅ Most common family Finland Family Reunification Spouse 1Y - Income EUR 1700/month sponsor net + Accommodation - Enter Finland OLE_PH"
  },
  {
    id: "fi-FAM-002",
    officialCode: "FI-FAM-002",
    name: "Finland Family Reunification Child 1Y Family Reunification Child 1Y Family Finland Child",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 270 Family Reunification Child 1Y Family Finland Child",
    validity: "1 Year Family Reunification Child 1Y Family Finland Child",
    docs: "Parent Finnish residence + Birth certificate attested + Parent custody + Family Reunification Child OLE_PH Enter Finland Migri"
  },
  {
    id: "fi-FAM-003",
    officialCode: "FI-FAM-003",
    name: "Finland Family Member of Finnish Citizen 1Y Family Member Finnish Citizen 1Y Family Finland Finnish Citizen",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 470 Family Member Finnish Citizen 1Y Family Finland Finnish Citizen",
    validity: "1 Year Family Member Finnish Citizen 1Y Family Finland Finnish Citizen",
    docs: "Finnish citizen family member + Relationship proof + Finnish citizen ID + Family Member Finnish Citizen OLE_PH Enter Finland Migri"
  },
  {
    id: "fi-FAM-004",
    officialCode: "FI-FAM-004",
    name: "Finland Cohabiting Partner (Avoliitto - 2 Years Shared Household) Residence Permit 1Y-4Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 470 Cohabiting Partner (Avoliitto) Residence Permit Finland",
    validity: "1 to 4 Years Cohabiting Partner Stay Finland",
    docs: "Proof of 2 years continuous cohabitation (joint lease, shared address in population registry) or shared child + Sponsor income EUR 1,700/month + Enter Finland"
  },
  {
    id: "fi-FAM-005",
    officialCode: "FI-FAM-005",
    name: "Finland Accompanying Spouse & Family of Specialist & Fast-Track Worker (Same Day Decision) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 470 Specialist Family Fast-Track Residence Permit Finland",
    validity: "Matches Specialist Work Permit Duration (Up to 2-4 Years) Finland",
    docs: "Primary specialist work permit or concurrent fast-track application + Marriage/birth certificates + Fast-track family D Visa option + Full unrestricted work rights"
  },
  {
    id: "fi-FAM-006",
    officialCode: "FI-FAM-006",
    name: "Finland Accompanying Family Member to Student & PhD Researcher (OLE_PH) 1Y-4Y Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 470 Student Family Member Residence Permit Finland",
    validity: "Matches Student / PhD Researcher Permit Duration Finland",
    docs: "Primary student's OLE_OPI permit + Apostilled marriage & birth certificates + Living funds (EUR 700/month for spouse, EUR 500/month per child) + Health insurance"
  },
  {
    id: "fi-FAM-007",
    officialCode: "FI-FAM-007",
    name: "Finland Family Member under EU Free Movement Directives (EU/EEA Citizen Family Member) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 54 EU Family Member Residence Card Finland",
    validity: "5 Years EU Family Member Card (Unrestricted Work Rights) Finland",
    docs: "EU/EEA citizen exercising treaty rights in Finland (employed/self-employed) + Apostilled marriage certificate + Proof of genuine family relationship + Migri registration"
  },
  {
    id: "fi-FAM-008",
    officialCode: "FI-FAM-008",
    name: "Finland Elderly Dependent Parents of Finnish Citizen or Permanent Resident Permit Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 470 Elderly Dependent Parent Residence Permit Finland",
    validity: "1 Year Renewable Humanitarian Parent Stay Finland",
    docs: "Proof of biological parentage + Evidence of complete dependency on sponsor due to age, severe illness, and lack of other family support in home country"
  },
  {
    id: "fi-FAM-009",
    officialCode: "FI-FAM-009",
    name: "Finland Newborn Child Born in Finland to Foreign Residents Registration Permit Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free / EUR 270 Newborn Child Residence Registration Finland",
    validity: "Matches Parents' Residence Permit Validity Finland",
    docs: "Finnish population register (DVV) birth record + Child passport issued by embassy in Helsinki + Parents' oleskelulupa cards + Enter Finland application"
  },
  {
    id: "fi-FAM-010",
    officialCode: "FI-FAM-010",
    name: "Finland Independent Residence Permit for Former Spouse After Divorce or Domestic Abuse Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 540 Independent Humanitarian Residence Permit Finland",
    validity: "1 to 2 Years Independent Residence Card Finland",
    docs: "Divorce decree OR police/shelter documentation of domestic violence + Personal employment or self-support in Finland + Ties to Finnish society"
  },
  {
    id: "fi-FAM-011",
    officialCode: "FI-FAM-011",
    name: "Finland Adopted Child International Adoption Residence Permit Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 270 Adopted Child Residence Permit Finland",
    validity: "Permanent / Matches Adoptive Parents' Status Finland",
    docs: "Adoption approval from Finnish Adoption Board (Valvira) + Hague Adoption Convention certification + Foreign adoption court decree"
  },
  {
    id: "fi-FAM-012",
    officialCode: "FI-FAM-012",
    name: "Finland Accompanying Family Member to Startup Entrepreneur & Growth Founders Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 470 Startup Founder Family Residence Permit Finland",
    validity: "Matches Startup Founder's Permit (Up to 2 Years) Finland",
    docs: "Primary founder's approved Startup permit + Marriage & birth certificates + Subsistence calculation (EUR 1,700 for spouse + EUR 500 per child) + Accommodation"
  },
  {
    id: "fi-FAM-013",
    officialCode: "FI-FAM-013",
    name: "Finland Guardian & Custodial Relative of Unaccompanied Minor Granted Protection Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free / EUR 470 Custodial Parent / Guardian Residence Permit Finland",
    validity: "1 to 4 Years Minor Relative Residence Permit Finland",
    docs: "Minor child granted international protection in Finland + DNA / biological parentage confirmation + Custody documentation + Migri family assessment"
  },
  {
    id: "fi-FAM-014",
    officialCode: "FI-FAM-014",
    name: "Finland Family Member Automatic Full Work Rights Card (Unrestricted Employment Access) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Included in Primary Family Permit Fee",
    validity: "Valid for Entire Duration of Family Residence Permit Finland",
    docs: "Family residence card granted under section 78 of Finnish Aliens Act providing statutory unrestricted right to work in any sector without labour testing"
  },

  // ==========================================
  // PR & CITIZENSHIP (12) - Permanent Residence (P), Continuous A Permit, Naturalization & EU Long-Term Resident Finland
  // ==========================================
  {
    id: "fi-PR-001",
    officialCode: "FI-PR-001",
    name: "Finland Permanent Residence Permit P 4Y Permanent Residence Permit P 4Y PR Finland - 4 Years Residence",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 220 Permanent Residence Permit P 4Y PR Finland",
    validity: "Permanent Residence Permit P 4Y PR Finland - Permanent P permit",
    docs: "Residence 4Y Finland continuous A permit + No gaps + Language Finnish/Swedish basic + Permanent Residence P OLE_P Enter Finland Migri + 4 years continuous A permit + No crime + Self-support + Permanent Residence P Finland",
    fundsBox: "Residence 4Y continuous A permit Finland Permanent Residence P 4Y PR Finland + Self-support + No crime + Language basic",
    warningBox: "✅ Most common PR Finland Permanent Residence P 4Y - 4Y continuous A permit + No gaps >2 years + Permanent P card"
  },
  {
    id: "fi-PR-002",
    officialCode: "FI-PR-002",
    name: "Finland Continuous Residence Permit A 4Y Continuous Residence Permit A 4Y PR Finland Continuous A",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Continuous Residence Permit A 4Y PR Finland Continuous A",
    validity: "4 Years Continuous Residence Permit A 4Y PR Finland Continuous A",
    docs: "Residence permit A extension Finland + Continuous A OLE_A Enter Finland Migri + Continuous residence Finland"
  },
  {
    id: "fi-PR-003",
    officialCode: "FI-PR-003",
    name: "Finland Citizenship Naturalization 5Y Citizenship Naturalization 5Y PR Finland Citizenship - 5 Years",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 490 Citizenship Naturalization 5Y PR Finland Citizenship",
    validity: "Permanent Citizenship Naturalization 5Y PR Finland Citizenship",
    docs: "Residence 5Y Finland continuous + Language Finnish/Swedish YKI 3 + No crime + Self-support + Citizenship application Enter Finland Migri + 5Y residence + YKI 3 + Citizenship Finland"
  },
  {
    id: "fi-PR-004",
    officialCode: "FI-PR-004",
    name: "Finland EU Long Term Residence Permit 5Y EU Long Term Residence Permit 5Y PR Finland EU Long Term",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 220 EU Long Term Residence Permit 5Y PR Finland EU Long Term",
    validity: "5 Years EU Long Term Residence Permit 5Y PR Finland EU Long Term",
    docs: "Residence 5Y EU + Long Term EU Residence + EU Long Term OLE_P_EU Enter Finland Migri + EU Long Term Finland 5Y"
  },
  {
    id: "fi-PR-005",
    officialCode: "FI-PR-005",
    name: "Finland Extension Permanent Residence P Extension P PR Finland Extension Permanent",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 220 Extension Permanent Residence P Extension P PR Finland Extension",
    validity: "Permanent Extension P PR Finland Extension",
    docs: "Permanent residence P card renewal + Extension P OLE_P Enter Finland Migri"
  },
  {
    id: "fi-PR-006",
    officialCode: "FI-PR-006",
    name: "Finland Fast-Track Permanent Residence via Finnish Degree + 2 Years Employment Permit Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 220 Fast-Track Permanent Residence P Finland",
    validity: "Permanent (Pysyvä oleskelulupa) Finland",
    docs: "Master or PhD degree from Finnish university + Min 2 years full-time continuous work in Finland on A-status + Finnish YKI 3 language certificate + Enter Finland"
  },
  {
    id: "fi-PR-007",
    officialCode: "FI-PR-007",
    name: "Finland Citizenship by Declaration for Nordic Citizens (5 Years Nordic Stay) Finland",
    toCountry: "fi",
    fromCountry: "se",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 160 Nordic Citizen Declaration of Finnish Citizenship",
    validity: "Permanent Finnish & EU Citizenship (Suomen kansalaisuus)",
    docs: "Danish, Swedish, Norwegian, or Icelandic passport + 5 years continuous residence in Finland + Clean criminal background + DVV population declaration"
  },
  {
    id: "fi-PR-008",
    officialCode: "FI-PR-008",
    name: "Finland Permanent Residence for Inkeri / Ingrian Finnish Returnees (Paluumuuttaja) Finland",
    toCountry: "fi",
    fromCountry: "ru",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 220 Returnee Permanent Residence Permit Finland",
    validity: "Permanent (Pysyvä oleskelulupa) Finland",
    docs: "Proof of Ingrian Finnish ancestry (official birth/baptismal archival records proving Finnish descent) + Finnish language level A2 + Migri returnee review"
  },
  {
    id: "fi-PR-009",
    officialCode: "FI-PR-009",
    name: "Finland Fast-Track Naturalization for Spouse of Finnish Citizen (4 Years Residence + 3 Years Marriage) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 490 Spousal Fast-Track Finnish Citizenship",
    validity: "Permanent Finnish Citizenship & Passport",
    docs: "4 years continuous residence in Finland on A-status + 3 years verified marriage to Finnish citizen + Finnish/Swedish YKI 3 proficiency + Self-support"
  },
  {
    id: "fi-PR-010",
    officialCode: "FI-PR-010",
    name: "Finland Citizenship for Former Finnish Citizens & Persons with Finnish Roots (Declaration) Finland",
    toCountry: "fi",
    fromCountry: "us",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 160 Citizenship by Declaration for Former Citizens Finland",
    validity: "Permanent Reinstatement of Finnish Citizenship",
    docs: "Proof that applicant was previously a Finnish citizen by birth or parent was Finnish citizen at applicant's birth + Identity verification with DVV"
  },
  {
    id: "fi-PR-011",
    officialCode: "FI-PR-011",
    name: "Finland Permanent Residence for Young Adults Raised in Finland (Ages 18-21) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 220 Young Adult Permanent Residence Permit Finland",
    validity: "Permanent (Pysyvä oleskelulupa) Finland",
    docs: "Resident in Finland for principal part of childhood + Completed Finnish comprehensive school (Peruskoulu) or vocational qualification + Clean conduct"
  },
  {
    id: "fi-PR-012",
    officialCode: "FI-PR-012",
    name: "Finland Non-Lapse Dispensation & Re-Entry Right for Permanent Residents Abroad Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 160 Dispensation from Lapse of Permanent Residence Finland",
    validity: "Preserves Permanent Status During Extended Overseas Stay (Up to 2 Years)",
    docs: "Valid Finnish P residence card + Documentation justifying temporary stay abroad (overseas university study, employer posting, military service) + Migri filing"
  }
];

const SUPPORTING_AND_LEGACY_FI: RawFinlandItem[] = [
  {
    id: "fi-SUP-001",
    officialCode: "FI-SUP-001",
    name: "Migri Authority (Finnish Immigration Service - Maahanmuuttovirasto / Enter Finland) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Migri = Finnish Immigration Service (Maahanmuuttovirasto) - Administers Residence Permits, Citizenship & Fast-Track D Visa applications via enterfinland.fi"
  },
  {
    id: "fi-SUP-002",
    officialCode: "FI-SUP-002",
    name: "Business Finland Authority (Innovation, Startup & Growth Entrepreneur Assessment) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Business Finland = Official Finnish Innovation Agency - Evaluates and issues Eligibility Statements for Startup & Growth Entrepreneur permits"
  },
  {
    id: "fi-SUP-003",
    officialCode: "FI-SUP-003",
    name: "ELY Centre & TE Office Labour Market Authority (Elinkeino-, liikenne- ja ympäristökeskus) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "ELY Centre & Employment and Economic Development Offices (TE-toimisto) - Conduct labour market testing and issue preliminary decisions for TTOL work permits"
  },
  {
    id: "fi-SUP-004",
    officialCode: "FI-SUP-004",
    name: "DVV (Digi- ja väestötietovirasto - Digital and Population Data Services Agency) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "DVV = Digital and Population Data Services Agency - Issues Finnish Personal Identity Code (Henkilötunnus) and registers municipality of residence (Kotikunta)"
  },
  {
    id: "fi-SUP-005",
    officialCode: "FI-SUP-005",
    name: "Finland Intra-Corporate Mobile ICT Trainee Employee Permit (1Y Transfer Notification) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "EUR 540 Mobile ICT Trainee Permit Finland",
    validity: "Up to 1 Year ICT Trainee Transfer Finland",
    docs: "University degree + Trainee agreement with Finnish affiliate + Corporate group seniority + Salary meeting Finnish collective terms"
  },
  {
    id: "fi-SUP-006",
    officialCode: "FI-SUP-006",
    name: "Finland Posted Worker & Cross-Border Service Provider Notification Scheme Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "work",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "EUR 540 Posted Worker Service Permit Finland",
    validity: "Duration of Cross-Border Service Contract (Up to 1 Year) Finland",
    docs: "Cross-border service contract with Finnish enterprise + A1 social security certificate + Home country residence & employment status + Occupational safety registration"
  },
  {
    id: "fi-LEG-001",
    officialCode: "FI-LEG-001",
    name: "Legacy D Visa Entrepreneur Old System (Replaced by New Startup Entrepreneur Business Finland) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "LEGACY_VISA",
    fee: "-",
    validity: "-",
    docs: "Historical reference only - Replaced by modern Business Finland Startup Entrepreneur statement and fast-track scheme"
  },
  {
    id: "fi-LEG-002",
    officialCode: "FI-LEG-002",
    name: "Legacy Short-Term Seasonal 3M Old System (Replaced by 9M Seasonal Work Act) Finland",
    toCountry: "fi",
    fromCountry: "in",
    category: "pr",
    record_type: "LEGACY_VISA",
    fee: "-",
    validity: "-",
    docs: "Historical reference only - Replaced by current 9-month Seasonal Work Permit under Finnish Seasonal Workers Act"
  }
];

function convertRawToVisaItem(item: RawFinlandItem): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
  const details = getFinlandMicroDetails(item.id, item.category, item.name, item.fundsBox, item.itrBox, item.bankBox);

  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    category: item.category,
    categoryCode: item.category,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    processing: "10 - 15 Calendar Days (VFS Finland / Schengen C) or 14 - 45 Days (Migri Enter Finland / Fast-Track)",
    icon: item.category === 'tourist' ? '🏖️' : item.category === 'work' ? '💼' : item.category === 'student' ? '🎓' : item.category === 'family' ? '👨‍👩‍👧' : item.category === 'business' ? '🤝' : '🏛️',
    purpose: `${item.name} — Official Finland (${item.officialCode}) visa and residence permit pathway processed via VFS Global Finland, Ministry for Foreign Affairs, and Migri (Finnish Immigration Service - Maahanmuuttovirasto).`,
    eligibility: "Valid passport with min 3 months validity beyond planned departure, 2 blank pages, travel medical insurance EUR 30,000, confirmed travel itinerary / Finnish employment contract meeting collective agreements / university admission, and seasoned financial proof.",
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
      "Full Name, Finnish Personal Identity Code (Henkilötunnus - if previously resident), Date & Place of Birth, Nationality",
      "Passport Number, Issue Date, Expiry Date (valid at least 3 months after departure from Finland)",
      "Finnish Host / Employer Business ID (Y-tunnus), ELY Centre sector, and registered address in Finland",
      "Enter Finland account details and diary number (Diaarinumero) for residence permit tracking"
    ],
    steps: [
      "Create an electronic application in the official Enter Finland portal (enterfinland.fi) or register on the visa appointment portal.",
      "Complete the application form (OL1 for Work, OLE_OPI for Student, OLE_PH for Family, or Schengen C for Tourism).",
      "Attach required certified documents including 3-month bank statements, employment contract, or paid university tuition receipt.",
      "Visit VFS Global Finland or Finnish Embassy to prove identity and submit biometrics, then track your decision on Enter Finland."
    ],
    tips: [
      "Ensure personal bank statements maintain at least EUR 30/day for tourists or EUR 800/month (EUR 9,600/year) for students with no sudden last-minute cash deposits.",
      "For Specialists and EU Blue Card applicants, use the Fast-Track 14-day service in Enter Finland for yourself and your family simultaneously.",
      "For Family Reunification (OLE_PH), verify that the sponsor provides the full net monthly subsistence requirement (min EUR 1,700/month for spouse)."
    ],
    faq: [
      {
        q: `What is the official visa fee and validity for ${item.name}?`,
        a: `Official Fee: ${item.fee}. Validity: ${item.validity}. Applications are processed electronically via Enter Finland / Migri or VFS Global.`
      },
      {
        q: `What documents are required for ${item.officialCode}?`,
        a: `Required documents: ${item.docs}.`
      }
    ]
  };
}

const ALL_FI_CONVERTED = FI_92.map(convertRawToVisaItem);
const ALL_FI_SUPPORTING = SUPPORTING_AND_LEGACY_FI.map(convertRawToVisaItem);

export const FINLAND_92_VISAS: CountryVisas = {
  tourist: ALL_FI_CONVERTED.filter(i => i.category === 'tourist'),
  business: ALL_FI_CONVERTED.filter(i => i.category === 'business'),
  work: ALL_FI_CONVERTED.filter(i => i.category === 'work'),
  student: ALL_FI_CONVERTED.filter(i => i.category === 'student'),
  family: ALL_FI_CONVERTED.filter(i => i.category === 'family'),
  pr: ALL_FI_CONVERTED.filter(i => i.category === 'pr'),
  supporting: ALL_FI_SUPPORTING
};
export const FINLAND_28_VISAS = FINLAND_92_VISAS;
