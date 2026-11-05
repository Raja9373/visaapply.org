import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getPolandMicroDetails(code: string, cat: string, name: string, rawFunds?: string, rawItr?: string, rawBank?: string) {
  let fundsMin = rawFunds || "Poland C Short Stay Visa requires proof of min PLN 300/day (approx. EUR 75/day) + hotel booking + round-trip ticket + travel medical insurance (min EUR 30,000 across all 29 Schengen states).";
  let fundsBankMonths = rawBank || "Last 3-6 months personal bank statements stamped by bank branch (min PLN 10,000 liquid balance recommended).";
  let fundsSudden = "❌ Sudden large cash deposits right before visa submission at VFS Poland / Urząd Wojewódzki are strictly audited and rejected.";
  let fundsEx = "✅ Sahi: Seasoned 3-6 month bank statement with PLN 300/day liquid funds. ❌ Galat: Sudden unexplained deposit 24 hours prior to appointment.";

  let itrYears = rawItr || "Income Tax Returns (ITR) for past 2 years + 3-6 months bank statements.";
  let itrMatch = "Declared income must align with bank account salary credits and employment NOC.";
  let itrNoItr = "If sponsored via official Voivodeship Zaproszenie (Invitation), host financial proof is accepted alongside applicant's personal bank statement.";

  let bankMonths = rawBank || "Last 3-6 months bank statements (min PLN 10,000 for C Tourist).";
  let bankReg = "Regular salary credits or business revenue.";
  let bankFd = "Fixed deposits accepted as supplementary financial proof.";
  let bankSource = "Salary, business income, or verified Zaproszenie sponsor funds.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk')) {
    fundsMin = rawFunds || "Poland National D Work Visa (Type A/B/C/D/E/S, Oświadczenie, or EU Blue Card) requires an official Voivodeship/Starosta Work Permit + binding job offer & employment contract from a Polish employer registered in KRS/CEIDG/REGON (or min PLN 9,000+/month for EU Blue Card).";
    fundsBankMonths = "Employment contract, Voivodeship Work Permit (Zezwolenie na pracę), Employer KRS/REGON/NIP, and 3 months bank statements.";
    fundsSudden = "Contract must state gross monthly salary in PLN (above national minimum wage or 1.5x average salary for EU Blue Card).";
    fundsEx = "✅ Sahi: Original Voivodeship Work Permit Type A + signed employment contract + KRS/REGON extract. ❌ Galat: Missing Voivodeship permit or unregistered employer.";
  } else if (cat === 'student' || lowerCode.includes('stu')) {
    fundsMin = rawFunds || "Poland National D Student Visa requires official university admission letter + tuition fee payment proof + accommodation proof + bank statement showing at least PLN 15,000 (approx. EUR 3,500) liquid balance for living costs and return travel.";
    fundsBankMonths = "Last 3-6 months personal or sponsor bank statements showing min PLN 15,000 (EUR 3,500) + paid tuition receipt.";
    fundsSudden = "Sponsor or personal bank statement must prove liquid availability approved by Polish Consulate / VFS.";
    fundsEx = "✅ Sahi: Official Polish university acceptance + tuition receipt + PLN 15,000 bank balance + accommodation proof. ❌ Galat: Unverified sponsor funds or unpaid tuition.";
  } else if (cat === 'family' || lowerCode.includes('fam')) {
    fundsMin = rawFunds || "Poland Family Reunion National D Visa / Temporary Residence requires sponsor's Polish Residence Card (Karta Pobytu) or EU/Polish citizen ID + apostilled/attested marriage or birth certificate + accommodation & regular income proof in Poland.";
    fundsBankMonths = "3-6 months sponsor bank statements, ZUS insurance proof, and PIT tax returns in Poland.";
    fundsSudden = "Civil status documents (marriage/birth certificates) must be apostilled and translated into Polish by a sworn translator (tłumacz przysięgły).";
    fundsEx = "✅ Sahi: Sponsor Karta Pobytu + apostilled marriage/birth certificate + Polish lease agreement + ZUS/PIT income proof. ❌ Galat: Unapostilled civil documents.";
  } else if (cat === 'business' || lowerCode.includes('bus') || lowerCode.includes('biz')) {
    fundsMin = rawFunds || "Poland Business Visa (National D 1Y or Schengen C) requires an official invitation registered with the Voivodeship Office (Urząd Wojewódzki) or on Polish company letterhead with KRS, REGON, and NIP numbers.";
    fundsBankMonths = "Last 3-6 months corporate and personal bank statements + 2 years ITR.";
    fundsSudden = "Sponsoring Polish entity must hold active KRS / CEIDG, REGON, and NIP registration.";
    fundsEx = "✅ Sahi: Voivodeship-approved business invitation + Polish company KRS/REGON/NIP + Indian company deputation letter. ❌ Galat: Informal invitation without KRS/REGON.";
  } else if (cat === 'pr' || lowerCode.includes('pr')) {
    fundsMin = rawFunds || "Poland Permanent Residence (Karta Stałego Pobytu 10Y) or Long-Term EU Resident Permit (5Y) requires 5 years continuous legal residence in Poland (or Polish ancestry for Karta Polaka) + stable income/ZUS history + official Polish language certificate at B1 level.";
    fundsBankMonths = "5 years PIT tax filings, ZUS social security records, and Polish bank statements.";
    fundsSudden = "Continuous legal stay, tax compliance, and B1 Polish language certification verified by Urząd Wojewódzki.";
    fundsEx = "✅ Sahi: 5 years continuous residence + state B1 Polish certificate + 5 years PIT/ZUS clearance + title deed/lease. ❌ Galat: Unexcused residence gaps or missing B1 certificate.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

export interface RawPolandItem {
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

export const PL_92: RawPolandItem[] = [
  // TOURIST 18 - Schengen C Tourist & National Visitor Visas Poland
  {
    id: "pl-TOU-001",
    officialCode: "PL-TOU-001",
    name: "Schengen C Tourist 90/180 Days Poland C Tourist 90/180 - Most common Tourist Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C tourist Poland 90/180 Schengen",
    validity: "90/180 C tourist Poland Schengen",
    docs: "Passport 3M 2 blank + Photo 35x45 white Schengen + Flight return + Hotel all Poland + Insurance EUR 30000 + Bank 3M + Employment NOC + Cover letter + C tourist Poland application VFS Poland",
    fundsBox: "PLN 300/day + EUR 75/day = Bank 3M PLN 300/day = C tourist Poland Schengen - 300 PLN per day = C tourist Poland",
    itrBox: "ITR 2Y + Bank 6M 3M C tourist Poland Schengen",
    bankBox: "Bank 3M last 6M min PLN 10000 C tourist Poland - sudden large deposit reject ❌",
    warningBox: "✅ Most common tourist Poland C Tourist 90/180 Schengen - VFS Poland - 29 countries valid - PLN 300/day funds"
  },
  {
    id: "pl-TOU-002",
    officialCode: "PL-TOU-002",
    name: "Schengen C Business 90/180 C Business 90/180 Business Poland Schengen",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 C business Poland Schengen",
    validity: "90/180 C business Poland Schengen",
    docs: "Polish company invitation letter + Polish company KRS + Polish company REGON + Foreign company letter + Business card + Chamber + C business Poland VFS"
  },
  {
    id: "pl-TOU-003",
    officialCode: "PL-TOU-003",
    name: "Schengen C Medical Treatment 90/180 C Medical 90/180 Medical Poland Schengen",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C medical Poland Schengen",
    validity: "90/180 C medical Poland Schengen",
    docs: "Polish hospital invitation + Medical treatment letter Poland + Medical C Poland VFS"
  },
  {
    id: "pl-TOU-004",
    officialCode: "PL-TOU-004",
    name: "Schengen C Cultural Sports 90/180 C Cultural Sports 90/180 Cultural Sports Poland Schengen",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C cultural sports Poland Schengen",
    validity: "90/180 C cultural sports Poland Schengen",
    docs: "Polish organizer invitation cultural sports + Event proof + Cultural sports C Poland VFS"
  },
  {
    id: "pl-TOU-005",
    officialCode: "PL-TOU-005",
    name: "Schengen C Conference 90/180 C Conference 90/180 Conference Poland Schengen",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C conference Poland Schengen",
    validity: "90/180 C conference Poland Schengen",
    docs: "Conference invitation Poland + Conference registration + Conference C Poland VFS"
  },
  {
    id: "pl-TOU-006",
    officialCode: "PL-TOU-006",
    name: "Schengen A Airport Transit Airport Transit A Transit Poland Schengen",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 A transit Poland Schengen",
    validity: "24H A transit Poland Schengen",
    docs: "Onward ticket + Destination visa + A transit Poland VFS"
  },
  {
    id: "pl-TOU-007",
    officialCode: "PL-TOU-007",
    name: "Schengen C Multiple 1Y Multiple Entry 1Y 90/180 C Multiple 1Y Tourist Poland Schengen 1Y",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C multiple 1Y Poland Schengen",
    validity: "1 Year Multiple 90/180 C multiple 1Y Poland Schengen 1Y",
    docs: "Previous 3 Schengen C visas + Bank 6M + C multiple 1Y Poland VFS - History required"
  },
  {
    id: "pl-TOU-008",
    officialCode: "PL-TOU-008",
    name: "Schengen C Multiple 2Y Multiple Entry 2Y 90/180 C Multiple 2Y Tourist Poland Schengen 2Y",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C multiple 2Y Poland Schengen",
    validity: "2 Years Multiple 90/180 C multiple 2Y Poland Schengen 2Y",
    docs: "Previous C multiple 1Y + Bank 6M + C multiple 2Y Poland VFS"
  },
  {
    id: "pl-TOU-009",
    officialCode: "PL-TOU-009",
    name: "Schengen C Multiple 5Y Multiple Entry 5Y 90/180 C Multiple 5Y Tourist Poland Schengen 5Y",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C multiple 5Y Poland Schengen",
    validity: "5 Years Multiple 90/180 C multiple 5Y Poland Schengen 5Y",
    docs: "Previous C multiple 2Y + Bank 12M + C multiple 5Y Poland VFS - Best history"
  },
  {
    id: "pl-TOU-010",
    officialCode: "PL-TOU-010",
    name: "Schengen C Family & Friends Visit (Zaproszenie Voivodeship Invitation) 90/180 Days Tourist Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Family & Friends Visit Zaproszenie Poland",
    validity: "90/180 Days Schengen C Visit Poland",
    docs: "Original Zaproszenie registered at Urząd Wojewódzki + Host Polish ID or Karta Pobytu + Relationship proof + Flight return + Insurance EUR 30000 + Bank 3M + VFS Poland",
    warningBox: "MOST IMPORTANT: Official Zaproszenie Invitation Form registered at Voivodeship Office (Urząd Wojewódzki) covers accommodation & financial guarantee"
  },
  {
    id: "pl-TOU-011",
    officialCode: "PL-TOU-011",
    name: "ETIAS European Travel Authorization 3Y (Visa-Exempt Nationalities) Tourist Poland",
    toCountry: "pl",
    fromCountry: "us",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 7 ETIAS 3Y Travel Authorization Poland",
    validity: "3 Years or Passport Expiry (90/180 Days) Poland",
    docs: "Biometric visa-exempt passport + Online ETIAS form + Return flight + Hotel booking + Travel insurance"
  },
  {
    id: "pl-TOU-012",
    officialCode: "PL-TOU-012",
    name: "Poland National D Long-Stay Visitor Visa (Purpose 02 - Visiting Family/Friends) 1Y Tourist Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 135 National D Visitor Purpose 02 (1Y) Poland",
    validity: "Up to 1 Year National D Visitor Visa Poland",
    docs: "Voivodeship registered Zaproszenie + Host residence/citizenship proof + Medical insurance EUR 30000 valid 1Y + Bank statement 3M + VFS Poland e-Konsulat"
  },
  {
    id: "pl-TOU-013",
    officialCode: "PL-TOU-013",
    name: "Schengen CMultiple-Entry 3Y Cascade Rule Tourist Visa (90/180 Days) Tourist Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 Schengen C 3-Year Cascade Multiple Entry Poland",
    validity: "3 Years Multiple Entry (90/180 Days) Poland",
    docs: "2 lawfully used Schengen visas in past 3 years + Passport valid 3Y+ + Bank 6M + ITR 2Y + Travel insurance + VFS Poland"
  },
  {
    id: "pl-TOU-014",
    officialCode: "PL-TOU-014",
    name: "Schengen C Religious Pilgrimage & World Youth / Church Event Visitor Visa 90/180 Tourist Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Religious & Pilgrimage Visitor Visa Poland",
    validity: "90/180 Days Single/Multiple Entry Poland",
    docs: "Invitation from Polish parish/diocese (Częstochowa / Kraków Sanctuary) + Home church recommendation + Hotel/pilgrim house booking + Insurance EUR 30000 + Bank 3M"
  },
  {
    id: "pl-TOU-015",
    officialCode: "PL-TOU-015",
    name: "Schengen C Spa, Sanatorium & Thermal Rehabilitation Visitor Visa 90/180 Tourist Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Sanatorium & Medical Spa Visa Poland",
    validity: "90/180 Days Schengen C Poland",
    docs: "Confirmed reservation & prepayment from Polish sanatorium/medical spa (Uzdrowisko) + Doctor referral + Travel medical insurance EUR 30000 + Bank 3M"
  },
  {
    id: "pl-TOU-016",
    officialCode: "PL-TOU-016",
    name: "Schengen C Seafarer & Baltic Port Crew Transit Visa (Gdańsk / Gdynia / Szczecin) Tourist Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Seafarer Transit Visa Poland",
    validity: "Up to 90 Days Transit to Join Vessel in Poland",
    docs: "Seaman Book (CDC) + Polish shipping agency guarantee letter + Crew list & vessel IMO details + Employment contract + Passport 3M"
  },
  {
    id: "pl-TOU-017",
    officialCode: "PL-TOU-017",
    name: "Schengen C Official Delegation & Intergovernmental Visit Visa 90/180 Tourist Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "Free / EUR 90 C Official Delegation Visa Poland",
    validity: "90/180 Days Official Visit Poland",
    docs: "Note Verbale / Official Ministry invitation from Republic of Poland + Sending government deputation letter + Passport + Insurance EUR 30000"
  },
  {
    id: "pl-TOU-018",
    officialCode: "PL-TOU-018",
    name: "Schengen C Accredited Tour Group (ADS / Group Tourism) Short-Stay Visa 30D Tourist Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C Organized Tour Group Visa Poland",
    validity: "30 - 90 Days Single/Double Entry Poland",
    docs: "Polish Tour Operator Voucher (Potwierdzenie rezerwacji) + Day-by-day Poland itinerary (Warsaw, Kraków, Zakopane, Gdańsk) + Return flight + Insurance EUR 30000 + Bank 3M"
  },

  // BUSINESS 10 - Poland National D & Schengen C Business, Trade & Investor Visas
  {
    id: "pl-BUS-001",
    officialCode: "PL-BUS-001",
    name: "Poland Business Invitation National D 1Y Business Invitation National D 1Y Business Poland - Most common Business Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 135 Business Invitation National D 1Y Business Poland",
    validity: "1 Year Business Invitation National D 1Y Business Poland",
    docs: "Polish company invitation original + Polish company KRS + REGON + NIP + Voivodeship invitation approval + Foreign company letter + Chamber certificate + Business invitation National D Poland VFS - Voivodeship approval needed",
    warningBox: "✅ Most common business Poland Business Invitation National D 1Y - Voivodeship invitation registration - KRS + REGON + NIP required - 14 days approval"
  },
  {
    id: "pl-BUS-002",
    officialCode: "PL-BUS-002",
    name: "Poland Business Schengen C 90/180 Business Schengen C 90/180 Business Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Business Schengen C 90/180 Business Poland",
    validity: "90/180 Business Schengen C 90/180 Business Poland",
    docs: "Polish business invitation + KRS + Foreign company + Business Schengen C Poland VFS"
  },
  {
    id: "pl-BUS-003",
    officialCode: "PL-BUS-003",
    name: "Poland Trade Fair Business C Trade Fair Business C Business Poland Trade Fair",
    toCountry: "pl",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Trade fair business C Business Poland",
    validity: "90/180 Trade fair business C Business Poland",
    docs: "Trade fair invitation Poland + Exhibitor proof + Trade fair business C Poland VFS"
  },
  {
    id: "pl-BUS-004",
    officialCode: "PL-BUS-004",
    name: "Poland Investment Business National D 1Y Investment Business National D 1Y Business Poland Investment",
    toCountry: "pl",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 135 Investment business National D 1Y Business Poland",
    validity: "1 Year Investment business National D 1Y Business Poland Investment",
    docs: "Investment plan Poland + Company registration Poland + Investment proof PLN 100k + Investment business National D Poland VFS"
  },
  {
    id: "pl-BUS-005",
    officialCode: "PL-BUS-005",
    name: "Poland Sp. z o.o. Company Founder & Shareholder National D Visa 1Y Business Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 135 Sp. z o.o. Shareholder Business D Visa 1Y Poland",
    validity: "1 Year National D Business Founder Visa Poland",
    docs: "Notarized Articles of Association (Umowa spółki Sp. z o.o.) + KRS court register extract + NIP & REGON + Corporate bank account in Poland + Business plan + VFS Poland"
  },
  {
    id: "pl-BUS-006",
    officialCode: "PL-BUS-006",
    name: "Poland Temporary Residence Permit for Business Activity (Zezwolenie na pobyt czasowy w celu prowadzenia działalności gospodarczej) 1Y-3Y Business Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "PLN 340 Stamp Duty + PLN 100 Card Fee Business Residence Permit Poland",
    validity: "1 to 3 Years Business Temporary Residence Permit Poland",
    docs: "KRS/CEIDG registration + Proof company generated min 12x average monthly salary income OR employs at least 2 Polish/EU workers full-time for 1 year + ZUS & Tax Office (Urząd Skarbowy) no-arrears certificates"
  },
  {
    id: "pl-BUS-007",
    officialCode: "PL-BUS-007",
    name: "Poland Management Board Member (Członek Zarządu) Business Schengen C Multi-Entry 1Y-5Y Business Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Board Member Business C Visa (Under 90/180 Days) Poland",
    validity: "1 to 5 Years Multiple Entry (90/180 Days without Type B Permit) Poland",
    docs: "Current KRS extract naming applicant on Management Board (Zarząd) + Board resolution + CIT tax returns of Polish company + Travel insurance EUR 30000 + Bank 6M"
  },
  {
    id: "pl-BUS-008",
    officialCode: "PL-BUS-008",
    name: "Poland PAIH (Polish Investment & Trade Agency) Strategic Foreign Investor Visa 1Y Business Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 135 PAIH Strategic Investor National D Visa Poland",
    validity: "1 Year National D Strategic Investor Visa Poland",
    docs: "PAIH (Polska Agencja Inwestycji i Handlu) support letter + Special Economic Zone (PSI/SSE) investment plan + Corporate financial statements + KRS registration"
  },
  {
    id: "pl-BUS-009",
    officialCode: "PL-BUS-009",
    name: "Poland Sole Proprietorship / JDG (Jednoosobowa Działalność Gospodarcza in CEIDG) Business Visa 1Y Business Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 135 JDG CEIDG Entrepreneur National D Visa Poland",
    validity: "1 Year Self-Employed Entrepreneur Visa Poland",
    docs: "CEIDG registration extract (for eligible visa/residence holders, Karta Polaka, or PBH) + NIP & REGON + B2B service contracts in Poland + Accounting & ZUS registration"
  },
  {
    id: "pl-BUS-010",
    officialCode: "PL-BUS-010",
    name: "Poland After-Sales Technical Service, Machinery Installation & Commercial Audit C Visa 90/180 Business Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Technical Service & Commercial Audit C Visa Poland",
    validity: "90/180 Days Short-Term Commercial Service Poland",
    docs: "Purchase/Supply contract between Polish buyer and foreign manufacturer + Warranty/Installation clause + Polish host company KRS + Engineer deputation letter + Insurance EUR 30000"
  },

  // WORK 28 - Poland Work Permits (Type A, B, C, D, E, S), Oświadczenie, EU Blue Card & Special Work Visas
  {
    id: "pl-WRK-001",
    officialCode: "PL-WRK-001",
    name: "Poland Work Permit Type A National D 1Y Work Permit Type A National D 1Y Work Poland - Most common Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Work Permit Type A National D 1Y Work Poland Type A",
    validity: "1 Year Work Permit Type A National D 1Y Work Poland Type A",
    docs: "Work permit Type A Voivodeship + Job offer Poland Type A + Employment contract Poland Type A + Employer KRS + Employer REGON + Qualifications + Work Permit Type A National D Poland VFS - Voivodeship work permit",
    warningBox: "✅ Most common work Poland Work Permit Type A National D 1Y - Employer applies Voivodeship for Type A permit - Takes 2-4 weeks - Type A = work for Polish employer"
  },
  {
    id: "pl-WRK-002",
    officialCode: "PL-WRK-002",
    name: "Poland Work Permit Type B National D 1Y Work Permit Type B National D 1Y Work Poland Board Member",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Work Permit Type B National D 1Y Work Poland Type B",
    validity: "1 Year Work Permit Type B National D 1Y Work Poland Board Member Type B",
    docs: "Work permit Type B Voivodeship + Board member proof + Company KRS + Work Permit Type B National D Poland VFS - Type B = board member Polish company"
  },
  {
    id: "pl-WRK-003",
    officialCode: "PL-WRK-003",
    name: "Poland Work Permit Type C National D 1Y Work Permit Type C National D 1Y Work Poland Delegated",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Work Permit Type C National D 1Y Work Poland Type C",
    validity: "1 Year Work Permit Type C National D 1Y Work Poland Delegated Type C",
    docs: "Work permit Type C + Delegation letter + Foreign employer + Work Permit Type C National D Poland VFS - Type C = delegated to Poland by foreign employer"
  },
  {
    id: "pl-WRK-004",
    officialCode: "PL-WRK-004",
    name: "Poland Work Permit Type D National D 1Y Work Permit Type D National D 1Y Work Poland Export",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Work Permit Type D National D 1Y Work Poland Type D",
    validity: "1 Year Work Permit Type D National D 1Y Work Poland Export Type D",
    docs: "Work permit Type D + Export service + Work Permit Type D National D Poland VFS - Type D = temporary export service"
  },
  {
    id: "pl-WRK-005",
    officialCode: "PL-WRK-005",
    name: "Poland Work Permit Type E National D 1Y Work Permit Type E National D 1Y Work Poland Short",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Work Permit Type E National D 1Y Work Poland Type E",
    validity: "1 Year Work Permit Type E National D 1Y Work Poland Short Type E",
    docs: "Work permit Type E + Short term + Work Permit Type E National D Poland VFS - Type E = short term <6M"
  },
  {
    id: "pl-WRK-006",
    officialCode: "PL-WRK-006",
    name: "Poland Seasonal Work Permit Type S 9M Seasonal Work Permit Type S 9M Work Poland Seasonal Agriculture",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Seasonal Work Permit Type S 9M Work Poland Seasonal",
    validity: "9 Months Seasonal Work Permit Type S 9M Work Poland Seasonal Agriculture",
    docs: "Seasonal work permit Type S Starosta + Job offer seasonal Poland + Seasonal Work Permit Type S National D Poland VFS - Type S = agriculture tourism seasonal"
  },
  {
    id: "pl-WRK-007",
    officialCode: "PL-WRK-007",
    name: "Poland EU Blue Card 3Y EU Blue Card 3Y Work Poland EU Blue Card",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 EU Blue Card 3Y Work Poland EU Blue Card",
    validity: "3 Years EU Blue Card 3Y Work Poland EU Blue Card",
    docs: "Degree + Job offer Poland EUR 1.5x average salary + EU Blue Card salary PLN 9000+ + Employment contract highly skilled + EU Blue Card Poland VFS - Highly skilled",
    fundsBox: "Salary PLN 9000+ = EUR 2000+ EU Blue Card 3Y Poland - 1.5x average salary Poland"
  },
  {
    id: "pl-WRK-008",
    officialCode: "PL-WRK-008",
    name: "Poland Intra Company Transfer ICT 3Y Intra Company Transfer ICT 3Y Work Poland ICT",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 ICT 3Y Work Poland Intra Company Transfer",
    validity: "3 Years Intra Company Transfer ICT 3Y Work Poland ICT",
    docs: "ICT permit Voivodeship + Intra company transfer letter + Employment contract ICT + ICT Poland VFS"
  },
  {
    id: "pl-WRK-009",
    officialCode: "PL-WRK-009",
    name: "Poland Startup Visa Poland Business Harbour PBH Startup Visa National D 1Y Startup Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Startup Visa Poland Business Harbour National D 1Y Startup Poland",
    validity: "1 Year Startup Visa Poland Business Harbour PBH National D 1Y Startup Poland",
    docs: "Poland Business Harbour approval + Startup idea IT + PARP approval + Startup visa PBH Poland VFS - IT specialists",
    warningBox: "Poland Business Harbour PBH - For IT specialists from Belarus Russia Ukraine India - Fast track"
  },
  {
    id: "pl-WRK-010",
    officialCode: "PL-WRK-010",
    name: "Poland Job Seeker Visa 6M Job Seeker Visa 6M Work Poland Job Seeker",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Job Seeker Visa 6M Work Poland",
    validity: "6 Months Job Seeker Visa 6M Work Poland Job Seeker",
    docs: "Degree + Funds PLN 8000 + Job seeker plan + Job Seeker Visa 6M Poland VFS"
  },
  {
    id: "pl-WRK-011",
    officialCode: "PL-WRK-011",
    name: "Poland Single Permit for Temporary Residence & Work (Jednolite zezwolenie na pobyt czasowy i pracę) 1Y-3Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "PLN 440 Stamp Duty + PLN 100 Karta Pobytu Single Work & Residence Permit Poland",
    validity: "1 to 3 Years Combined Residence & Work Card (Karta Pobytu) Poland",
    docs: "Załącznik nr 1 (Annex 1) signed by Polish employer + Starosta labour market test (Informacja starosty) or exemption + Employment contract + ZUS insurance + Housing lease + Urząd Wojewódzki"
  },
  {
    id: "pl-WRK-012",
    officialCode: "PL-WRK-012",
    name: "Poland Employer Declaration Work Visa (Oświadczenie o powierzeniu wykonywania pracy - Purpose 05a) 24M Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 National D Purpose 05a Oświadczenie Work Visa Poland",
    validity: "Up to 24 Months (for eligible nationalities: UA, BY, MD, GE, AM) Poland",
    docs: "Powiatowy Urząd Pracy (PUP) registered Oświadczenie + Employment/Mandate contract + Employer KRS/CEIDG + Health insurance + VFS Poland"
  },
  {
    id: "pl-WRK-013",
    officialCode: "PL-WRK-013",
    name: "Poland National D Work Visa Purpose 06 (Voivodeship Work Permit Zezwolenie na pracę) 1Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 National D Purpose 06 Work Visa Poland",
    validity: "1 Year National D Visa (365 Days) Poland",
    docs: "Original Voivodeship Work Permit (Zezwolenie typu A) + Signed Umowa o pracę / Umowa zlecenie + Accommodation agreement in Poland + Work experience certificates + VFS e-Konsulat appointment"
  },
  {
    id: "pl-WRK-014",
    officialCode: "PL-WRK-014",
    name: "Poland International Road Transport & HGV Truck Driver Work Visa (Świadectwo kierowcy GITD) 1Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 International Truck Driver National D Work Visa Poland",
    validity: "1 Year HGV / TIR International Driver Work Visa Poland",
    docs: "Type A Work Permit for International Driver + GITD Driver Attestation (Świadectwo kierowcy) + Category C+E driving license + Code 95 qualification + Psychological & medical certificate"
  },
  {
    id: "pl-WRK-015",
    officialCode: "PL-WRK-015",
    name: "Poland IT, Software Engineering & Shortage Occupation Work Permit (Starosta Test Exempt) 1Y-3Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 IT & Shortage Occupation Fast-Track Work Visa Poland",
    validity: "1 to 3 Years IT Specialist Work Permit Poland",
    docs: "Job offer in statutory shortage occupation (Programmers, Systems Analysts, DevOps, Nurses, Engineers) exempt from Informacja Starosty + Voivodeship Type A Permit + IT degree/portfolio"
  },
  {
    id: "pl-WRK-016",
    officialCode: "PL-WRK-016",
    name: "Poland Healthcare, Doctor & Nurse Conditional PWZ Medical Work Visa 1Y-3Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Healthcare Doctor/Nurse PWZ Work Visa Poland",
    validity: "1 to 5 Years Medical Practitioner Work Authorization Poland",
    docs: "Ministry of Health (Ministerstwo Zdrowia) decision + Regional Medical/Nursing Chamber (OIL/OIPiP) conditional PWZ license + Polish hospital employment offer + Apostilled medical diploma"
  },
  {
    id: "pl-WRK-017",
    officialCode: "PL-WRK-017",
    name: "Poland Academic Lecturer & University Faculty Work Visa (Work Permit Exempt) 1Y-3Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 University Faculty & Academic Work Visa Poland",
    validity: "1 to 3 Years Academic Appointment Poland",
    docs: "Employment contract with Polish public/private university or PAN (Polish Academy of Sciences) + Master/PhD diploma + Statutory work permit exemption under Polish Act on Promotion of Employment"
  },
  {
    id: "pl-WRK-018",
    officialCode: "PL-WRK-018",
    name: "Poland Scientific Researcher Hosting Agreement Visa & Residence Permit (Purpose 13) 1Y-3Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Scientific Researcher Purpose 13 National D Visa Poland",
    validity: "1 to 3 Years Research Project Duration Poland",
    docs: "Hosting Agreement (Umowa o przyjęciu cudzoziemca w celu prowadzenia badań naukowych) with MSWiA-approved Polish research institute + Financial commitment + PhD/Master degree"
  },
  {
    id: "pl-WRK-019",
    officialCode: "PL-WRK-019",
    name: "Poland Graduate of Full-Time Polish University Work Residence Permit (Work Permit Exempt) 1Y-3Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "PLN 440 Polish University Graduate Work Residence Permit",
    validity: "1 to 3 Years (Full Labour Market Access Without Work Permit) Poland",
    docs: "Diploma of graduation from full-time studies (Studia stacjonarne) at an accredited Polish university + Employment contract + Załącznik nr 1 + ZUS registration + Urząd Wojewódzki"
  },
  {
    id: "pl-WRK-020",
    officialCode: "PL-WRK-020",
    name: "Poland EU Long-Term ICT Mobility Permit (Mobile ICT Manager/Specialist/Trainee) 1Y-3Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "PLN 440 Mobile ICT Residence & Work Permit Poland",
    validity: "Up to 3 Years (Managers/Specialists) or 1 Year (Trainees) Poland",
    docs: "Valid ICT card issued by another EU Member State + Polish host entity KRS + Assignment letter stating salary & duration in Poland + Urząd Wojewódzki notification/application"
  },
  {
    id: "pl-WRK-021",
    officialCode: "PL-WRK-021",
    name: "Poland Posted Worker / Vander Elst Cross-Border EU Service Provider Visa 1Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Vander Elst EU Posted Worker National D Visa Poland",
    validity: "Duration of Service Contract (Up to 1 Year) Poland",
    docs: "Valid residence & work permit in another EU/EEA country + A1 social security certificate + Service contract between EU employer and Polish client + Państwowa Inspekcja Pracy (PIP) notification"
  },
  {
    id: "pl-WRK-022",
    officialCode: "PL-WRK-022",
    name: "Poland Working Holiday Youth Mobility National D Visa (18-30 Years Eligible Countries) 1Y Work Poland",
    toCountry: "pl",
    fromCountry: "au",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Working Holiday Youth Mobility D Visa Poland",
    validity: "1 Year Working Holiday Visa (AU, NZ, CA, JP, KR, TW, CL, AR) Poland",
    docs: "Age 18-30 valid passport from bilateral agreement country + Return ticket + Bank statement min PLN 10,000 + Full medical insurance for 12 months + Clean criminal record"
  },
  {
    id: "pl-WRK-023",
    officialCode: "PL-WRK-023",
    name: "Poland Foreign Language Teacher (Native Speaker / Certified Instructor) Work Visa 1Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Language Instructor National D Work Visa Poland",
    validity: "1 Year Language School / Academy Work Visa Poland",
    docs: "Type A Work Permit (or exemption if teaching at public school/university) + TEFL/CELTA/University degree + Employment contract with Polish school + Accommodation proof"
  },
  {
    id: "pl-WRK-024",
    officialCode: "PL-WRK-024",
    name: "Poland Manufacturing, Warehouse & Automotive Industrial Worker Type A Visa 1Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Industrial & Manufacturing Type A Work Visa Poland",
    validity: "1 Year National D Work Visa (Katowice / Wrocław / Poznań / Łódź) Poland",
    docs: "Voivodeship Work Permit Type A + Employment contract with Polish factory or licensed employment agency (KRAZ) + Worker hostel/housing guarantee + Vocational certificate + VFS Poland"
  },
  {
    id: "pl-WRK-025",
    officialCode: "PL-WRK-025",
    name: "Poland Construction, Welding (TIG/MIG/MAG) & Civil Engineering Skilled Worker Visa 1Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Construction & Welder Type A Work Visa Poland",
    validity: "1 Year Skilled Trades Work Visa Poland",
    docs: "Voivodeship Type A Work Permit + TÜV/IS/ISO welding or trade qualification certificate + Employment contract + Employer KRS & ZUS clearance + Accommodation proof"
  },
  {
    id: "pl-WRK-026",
    officialCode: "PL-WRK-026",
    name: "Poland Shipbuilding, Maritime & Port Engineering Work Visa (Gdańsk / Gdynia / Szczecin) 1Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Shipyard & Maritime Engineering Work Visa Poland",
    validity: "1 Year Pomeranian / West Pomeranian Voivodeship Work Visa Poland",
    docs: "Pomeranian Voivodeship Type A Work Permit + Shipyard employment contract + Marine fitter/welder/engineer trade certificates + Employer housing confirmation + Insurance"
  },
  {
    id: "pl-WRK-027",
    officialCode: "PL-WRK-027",
    name: "Poland Professional Athlete, Coach & Sports Federation National D Visa 1Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Professional Athlete & Coach National D Visa Poland",
    validity: "1 Year Sports Club Contract Duration Poland",
    docs: "Contract with Polish sports club (Ekstraklasa / Polish Sports Association) + Type A Work Permit or Federation endorsement + Sports medical insurance + Accommodation"
  },
  {
    id: "pl-WRK-028",
    officialCode: "PL-WRK-028",
    name: "Poland Accredited Foreign Journalist, Media Correspondent & Film Crew Work Visa 1Y Work Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 135 Foreign Media & Press Correspondent D Visa Poland",
    validity: "1 Year Media Accreditation Visa Poland",
    docs: "Polish Ministry of Foreign Affairs (MSZ) press accreditation + Foreign news agency assignment letter + Press card + Work permit exemption for accredited correspondents"
  },

  // STUDENT 12 - Poland National D & Schengen C Student, Language, Erasmus & Research Visas
  {
    id: "pl-STU-001",
    officialCode: "PL-STU-001",
    name: "Poland Student National D 1Y Student National D 1Y Student Poland - Most common Student Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 135 Student National D 1Y Student Poland",
    validity: "1 Year Student National D 1Y Student Poland",
    docs: "Admission letter Poland university + University acceptance Poland + Tuition fee proof Poland + Bank PLN 15000 + Accommodation Poland + Student National D Poland VFS - Most common",
    fundsBox: "Bank PLN 15000 = EUR 3500 Student National D 1Y Poland + Tuition + Accommodation = Student Poland",
    warningBox: "✅ Most common student Poland Student National D 1Y - University admission + Tuition paid + Bank PLN 15000"
  },
  {
    id: "pl-STU-002",
    officialCode: "PL-STU-002",
    name: "Poland Student Schengen C 90/180 Student Schengen C 90/180 Student Poland Short",
    toCountry: "pl",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 90 Student Schengen C 90/180 Student Poland Short",
    validity: "90/180 Student Schengen C 90/180 Student Poland Short",
    docs: "Short course admission Poland + Student Schengen C Poland VFS - Short course <90D"
  },
  {
    id: "pl-STU-003",
    officialCode: "PL-STU-003",
    name: "Poland Language Course Student National D 1Y Language Course Student National D 1Y Student Poland Language",
    toCountry: "pl",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 135 Language Course Student National D 1Y Student Poland Language",
    validity: "1 Year Language Course Student National D 1Y Student Poland Language",
    docs: "Language school admission Poland + Language course proof + Language course Student National D Poland VFS"
  },
  {
    id: "pl-STU-004",
    officialCode: "PL-STU-004",
    name: "Poland PhD Researcher National D 1Y PhD Researcher National D 1Y Student Poland PhD",
    toCountry: "pl",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 135 PhD Researcher National D 1Y Student Poland PhD",
    validity: "1 Year PhD Researcher National D 1Y Student Poland PhD",
    docs: "PhD admission Poland + Research proposal + PhD Researcher National D Poland VFS"
  },
  {
    id: "pl-STU-005",
    officialCode: "PL-STU-005",
    name: "Poland Temporary Residence Permit for Full-Time University Studies (Karta Pobytu Studenta) 15M-3Y Student Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "PLN 340 Stamp Duty + PLN 50 Student Karta Pobytu (50% Discount) Poland",
    validity: "15 Months (First Year) then up to 3 Years Student Residence Card Poland",
    docs: "Zaświadczenie o przyjęciu na studia (Official University Certificate) + Tuition fee receipt + Dormitory/lease contract + Bank statement (min PLN 776/month x 15 months + return ticket + rent) + NFZ/private insurance"
  },
  {
    id: "pl-STU-006",
    officialCode: "PL-STU-006",
    name: "Poland Erasmus+ & European Mobility Exchange Student National D Visa (Purpose 10) 1Y Student Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 135 Erasmus+ Exchange Student National D Visa Poland",
    validity: "1 Semester to 1 Year Erasmus+ Mobility Poland",
    docs: "Erasmus+ Learning Agreement + Host Polish university acceptance letter + Erasmus+ scholarship grant confirmation + Dormitory allocation + Travel medical insurance EUR 30000"
  },
  {
    id: "pl-STU-007",
    officialCode: "PL-STU-007",
    name: "Poland NAWA (Narodowa Agencja Wymiany Akademickiej) Government Scholarship Student Visa 1Y Student Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "Free / EUR 135 NAWA Polish Government Scholarship Visa Poland",
    validity: "1 Year Renewable (Banach / Anders / Lukasiewicz NAWA Scholarship) Poland",
    docs: "Official NAWA Director Scholarship Decision (Stypendium Banach / Lukasiewicz / Ulam) + University admission + Apostilled high school/bachelor diploma + Medical insurance"
  },
  {
    id: "pl-STU-008",
    officialCode: "PL-STU-008",
    name: "Poland Zerówka (1-Year Polish/English University Foundation Preparatory Course) Visa 1Y Student Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 135 University Preparatory Course (Zerówka) D Visa Poland",
    validity: "1 Year Foundation & Language Preparatory Program Poland",
    docs: "Admission to ministerial-accredited Zerówka preparatory center (University of Warsaw / Jagiellonian / Łódź / WrocławTech) + Paid tuition receipt + Bank PLN 15,000 + Dormitory proof"
  },
  {
    id: "pl-STU-009",
    officialCode: "PL-STU-009",
    name: "Poland EU Directives Student Internship / Traineeship National D Visa (Purpose 13a - Staż) 1Y Student Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 135 Student Internship (Purpose 13a Staż) D Visa Poland",
    validity: "Up to 12 Months Approved Internship in Poland",
    docs: "Written Internship Agreement (Umowa o staż) with MSWiA-approved host organization + Recent degree (within 2 years) or current university enrollment + Living funds + Accommodation"
  },
  {
    id: "pl-STU-010",
    officialCode: "PL-STU-010",
    name: "Poland European Solidarity Corps & Volunteer Service National D Visa (Purpose 13b) 1Y Student Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 135 European Voluntary Service (Purpose 13b) D Visa Poland",
    validity: "Up to 1 Year Accredited Volunteering in Poland",
    docs: "Volunteering Agreement with MSWiA-approved Polish NGO/Foundation + Pocket money & accommodation guarantee + Health insurance + Clean criminal record"
  },
  {
    id: "pl-STU-011",
    officialCode: "PL-STU-011",
    name: "Poland Medical University 6-Year MD / Dentistry English Division Student Visa 1Y Student Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 135 Medical University English Division Student D Visa Poland",
    validity: "1 Year Renewable for 6-Year MD/DDS Program Poland",
    docs: "Official admission from Polish Medical University (Warsaw, Gdańsk, Poznań, Łódź, Lublin, Białystok) + First semester tuition wire receipt + Apostilled 12th/NEET/MCAT transcript + Bank PLN 20,000+"
  },
  {
    id: "pl-STU-012",
    officialCode: "PL-STU-012",
    name: "Poland Post-Study Graduate Job-Seeking Temporary Residence Permit (9 Months After Graduation) Student Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "PLN 340 + PLN 100 Graduate Job-Seeker Residence Card (9M) Poland",
    validity: "9 Months Non-Renewable Post-Study Job Search Card Poland",
    docs: "Polish university graduation diploma + Proof of sufficient living funds for 9 months + NFZ or private health insurance + Apartment lease in Poland + Urząd Wojewódzki application before student card expires"
  },

  // FAMILY 12 - Poland Family Reunification, EU Citizen Family, Spouse & Dependent Permits
  {
    id: "pl-FAM-001",
    officialCode: "PL-FAM-001",
    name: "Poland Family Reunion National D 1Y Family Reunion National D 1Y Family Poland - Most common Family Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 135 Family Reunion National D 1Y Family Poland",
    validity: "1 Year Family Reunion National D 1Y Family Poland",
    docs: "Relationship proof + Polish family member residence card + Marriage certificate attested + Birth certificate attested + Accommodation Poland + Family Reunion National D Poland VFS",
    warningBox: "✅ Most common family Poland Family Reunion National D 1Y - Spouse child parent"
  },
  {
    id: "pl-FAM-002",
    officialCode: "PL-FAM-002",
    name: "Poland Family Reunion EU Citizen 1Y Family Reunion EU Citizen 1Y Family Poland EU Citizen",
    toCountry: "pl",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free Family Reunion EU Citizen 1Y Family Poland EU Citizen",
    validity: "1 Year Family Reunion EU Citizen 1Y Family Poland EU Citizen",
    docs: "EU citizen family member in Poland + Relationship proof + EU citizen residence Poland + Family Reunion EU Citizen Poland VFS - Free EU"
  },
  {
    id: "pl-FAM-003",
    officialCode: "PL-FAM-003",
    name: "Poland Marriage National D 1Y Marriage National D 1Y Family Poland Marriage",
    toCountry: "pl",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 135 Marriage National D 1Y Family Poland Marriage",
    validity: "1 Year Marriage National D 1Y Family Poland Marriage",
    docs: "Marriage intent Poland + Polish partner ID + Civil registry Poland + Marriage National D Poland VFS"
  },
  {
    id: "pl-FAM-004",
    officialCode: "PL-FAM-004",
    name: "Poland Child Family National D 1Y Child Family National D 1Y Family Poland Child",
    toCountry: "pl",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 135 Child Family National D 1Y Family Poland Child",
    validity: "1 Year Child Family National D 1Y Family Poland Child",
    docs: "Child birth certificate attested + Parent residence Poland + Child Family National D Poland VFS"
  },
  {
    id: "pl-FAM-005",
    officialCode: "PL-FAM-005",
    name: "Poland Spouse of Polish Citizen Temporary Residence Permit (Karta Pobytu dla Małżonka Obywatela RP) 3Y Family Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "PLN 340 Stamp Duty + PLN 100 Card Spouse of Polish Citizen RP",
    validity: "Up to 3 Years (With Full Unrestricted Access to Polish Labour Market) Poland",
    docs: "Polish Civil Registry (Urząd Stanu Cywilnego - USC) marriage certificate issued within 3 months + Polish spouse Dowód Osobisty (ID) + Proof of joint household + Urząd Wojewódzki interview"
  },
  {
    id: "pl-FAM-006",
    officialCode: "PL-FAM-006",
    name: "Poland EU Blue Card Holder Family Reunification Residence Permit (Immediate Work Rights) 3Y Family Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "PLN 340 + PLN 100 Blue Card Dependent Residence Card Poland",
    validity: "Matches EU Blue Card Validity (Up to 3 Years) Poland",
    docs: "Primary holder's Polish EU Blue Card or pending application + Apostilled marriage/birth certificate + ZUS health insurance coverage for family + Lease agreement in Poland"
  },
  {
    id: "pl-FAM-007",
    officialCode: "PL-FAM-007",
    name: "Poland Temporary Residence for Other Circumstances (Inne Okoliczności - Partner / Cohabitation / Family Ties) 1Y-3Y Family Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "PLN 340 + PLN 100 Other Circumstances Family Residence Card Poland",
    validity: "1 to 3 Years Temporary Residence Card Poland",
    docs: "Proof of stable family/partner life in Poland (joint lease, joint bills, notarized financial support agreement Umowa renty) + Health insurance + Regular income min PLN 776/person"
  },
  {
    id: "pl-FAM-008",
    officialCode: "PL-FAM-008",
    name: "Poland Newborn Child Born in Poland Temporary Residence Permit 1Y-3Y Family Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "PLN 340 + PLN 50 Newborn Child Karta Pobytu Poland",
    validity: "Matches Parent's Karta Pobytu (1 - 3 Years) Poland",
    docs: "Polish Birth Certificate (Odpis zupełny aktu urodzenia z USC) + Newborn passport from home embassy in Warsaw + Parents' Karta Pobytu & ZUS insurance + Housing lease"
  },
  {
    id: "pl-FAM-009",
    officialCode: "PL-FAM-009",
    name: "Poland Elderly Dependent Parents of Polish/EU Citizen Residence Permit 1Y-5Y Family Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free (EU Family) or PLN 340 Dependent Parent Residence Permit Poland",
    validity: "1 to 5 Years Dependent Parent Residence Card Poland",
    docs: "Birth certificate of sponsor proving parentage + Proof of financial dependency or health care need + Sponsor income & accommodation in Poland + Medical insurance"
  },
  {
    id: "pl-FAM-010",
    officialCode: "PL-FAM-010",
    name: "Poland Karta Polaka (Polish Card) Holder's Spouse & Minor Children Family Visa 1Y Family Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 135 / Free Spouse of Karta Polaka Holder Visa Poland",
    validity: "1 Year National D Family Visa leading to Karta Pobytu Poland",
    docs: "Primary applicant's valid Karta Polaka + Apostilled marriage/birth certificate + Joint settlement declaration in Poland + Accommodation & financial means"
  },
  {
    id: "pl-FAM-011",
    officialCode: "PL-FAM-011",
    name: "Poland Scientific Researcher & ICT Manager Accompanying Family Member Visa 1Y-3Y Family Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 135 Researcher / ICT Dependent National D Visa Poland",
    validity: "1 to 3 Years Accompanying Family Visa Poland",
    docs: "Primary researcher Hosting Agreement or ICT Permit + Apostilled marriage/birth certificates + Health insurance EUR 30000 + Accommodation in Poland"
  },
  {
    id: "pl-FAM-012",
    officialCode: "PL-FAM-012",
    name: "Poland Autonomous Family Residence Permit After 5 Years or Widowhood/Divorce (Important Interest) 3Y Family Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "PLN 340 + PLN 100 Independent Residence Card Poland",
    validity: "3 Years Independent Temporary Residence Card Poland",
    docs: "Previous family reunification Karta Pobytu + Divorce decree / death certificate or proof of 5Y family stay + Personal employment/income in Poland + ZUS insurance"
  },

  // PR 12 - Poland Permanent Residence (Karta Stałego Pobytu), EU Long-Term Resident, Karta Polaka & Citizenship
  {
    id: "pl-PR-001",
    officialCode: "PL-PR-001",
    name: "Poland Permanent Residence Permit Karta Stałego Pobytu 10Y Permanent Residence Permit 10Y PR Poland - Most common PR Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "PLN 640 Permanent Residence Permit 10Y PR Poland Karta Stałego Pobytu",
    validity: "10 Years Permanent Residence Permit 10Y PR Poland Karta Stałego Pobytu",
    docs: "Residence 5Y Poland + Permanent residence + Physical presence 5Y Poland + Employment history 5Y Poland + Language Polish B1 + Accommodation Poland + Permanent Residence Permit application Voivodeship - 5Y residence",
    warningBox: "✅ Most common PR Poland Permanent Residence Permit 10Y Karta Stałego Pobytu - 5Y residence + Polish B1 + 10Y card"
  },
  {
    id: "pl-PR-002",
    officialCode: "PL-PR-002",
    name: "Poland Long Term EU Resident Permit 5Y Long Term EU Resident Permit 5Y PR Poland EU Long Term",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "PLN 640 Long Term EU Resident Permit 5Y PR Poland EU Long Term",
    validity: "5 Years Long Term EU Resident Permit 5Y PR Poland EU Long Term",
    docs: "Residence 5Y EU + Long Term EU Resident + Language Polish B1 + Long Term EU Resident Permit Voivodeship Poland - EU Long Term 5Y"
  },
  {
    id: "pl-PR-003",
    officialCode: "PL-PR-003",
    name: "Poland Citizenship by Grant Citizenship by Grant PR Poland Citizenship",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "Free Citizenship by Grant PR Poland Citizenship",
    validity: "Permanent Citizenship by Grant PR Poland Citizenship",
    docs: "Residence 3Y Poland + Language Polish B1 + Citizenship by grant President Poland - Presidential grant + Citizenship Poland"
  },
  {
    id: "pl-PR-004",
    officialCode: "PL-PR-004",
    name: "Poland Citizenship by Recognition Citizenship by Recognition PR Poland Citizenship Recognition",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "PLN 219 Citizenship by Recognition PR Poland Citizenship Recognition",
    validity: "Permanent Citizenship by Recognition PR Poland Citizenship Recognition",
    docs: "Residence 2Y Poland + Marriage Polish citizen 3Y + Language Polish B1 + Citizenship by recognition Voivodeship Poland + Citizenship Recognition Poland"
  },
  {
    id: "pl-PR-005",
    officialCode: "PL-PR-005",
    name: "Poland Polish Card Karta Polaka 10Y Polish Card Karta Polaka 10Y PR Poland Polish Card",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "Free Polish Card Karta Polaka 10Y PR Poland Polish Card",
    validity: "10 Years Polish Card Karta Polaka 10Y PR Poland Polish Card",
    docs: "Polish ancestry + Language Polish basic + Polish Card application Consulate + Karta Polaka + Polish Card 10Y"
  },
  {
    id: "pl-PR-006",
    officialCode: "PL-PR-006",
    name: "Poland Business Investor Residence National D 1Y Business Investor Residence National D 1Y PR Poland Investor",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 135 Business Investor Residence National D 1Y PR Poland Investor",
    validity: "1 Year Business Investor Residence National D 1Y PR Poland Investor",
    docs: "Company registration Poland + Investment PLN 100k + Business investor residence National D Poland VFS + Business Investor Poland"
  },
  {
    id: "pl-PR-007",
    officialCode: "PL-PR-007",
    name: "Poland Fast-Track Permanent Residence via Karta Polaka (Immediate PR Upon Arrival + PLN Settling Grant) PR Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "Free (Exempt from PLN 640 Stamp Duty) Karta Polaka Permanent Residence Poland",
    validity: "Permanent (10-Year Renewable Card + Eligibility for Citizenship After 1 Year) Poland",
    docs: "Valid Karta Polaka + Proof of intent to settle permanently in Poland (employment contract, business, or lease) + Application at Urząd Wojewódzki (eligible for 9-month financial settlement allowance)"
  },
  {
    id: "pl-PR-008",
    officialCode: "PL-PR-008",
    name: "Poland Permanent Residence by Polish Origin / Ancestry (Pochodzenie Polskie - Without Prior Karta Polaka) PR Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "PLN 640 Stamp Duty + PLN 100 Card Polish Origin Permanent Residence",
    validity: "Permanent (10-Year Karta Stałego Pobytu) Poland",
    docs: "Archival birth/marriage/military/census records proving at least 1 parent, grandparent, or 2 great-grandparents of Polish nationality + Voivodeship interview on Polish culture, history & traditions"
  },
  {
    id: "pl-PR-009",
    officialCode: "PL-PR-009",
    name: "Poland Permanent Residence for Spouse of Polish Citizen (3 Years Marriage + 2 Years Continuous Residence) PR Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "PLN 640 Stamp Duty + PLN 100 Card Spouse Permanent Residence Poland",
    validity: "Permanent (10-Year Renewable Karta Stałego Pobytu) Poland",
    docs: "Polish USC marriage certificate showing 3+ years of marriage to Polish citizen + 2+ years continuous residence in Poland on marriage-based Karta Pobytu + Polish spouse ID"
  },
  {
    id: "pl-PR-010",
    officialCode: "PL-PR-010",
    name: "Poland EU Blue Card 5-Year Pathway to Long-Term EU Resident Permit (Counting Mobility Across EU) PR Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "PLN 640 Stamp Duty + PLN 100 Card EU Blue Card to Long-Term Resident Poland",
    validity: "Permanent Status (5-Year Renewable EU Long-Term Resident Card) Poland",
    docs: "5 years legal residence in the EU on an EU Blue Card (including at least the last 2 years continuously in Poland) + Stable high-skilled income + PIT tax returns + Official B1 Polish certificate"
  },
  {
    id: "pl-PR-011",
    officialCode: "PL-PR-011",
    name: "Poland Permanent Residence for Child of Polish Citizen or Permanent Resident Born in Poland PR Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "PLN 640 + PLN 50 Child Permanent Residence Card (Karta Stałego Pobytu) Poland",
    validity: "Permanent (10-Year Card) Poland",
    docs: "Polish USC Birth Certificate + Parent's Karta Stałego Pobytu or Long-Term EU Resident Card valid at the time of child's birth + Child passport + Urząd Wojewódzki application"
  },
  {
    id: "pl-PR-012",
    officialCode: "PL-PR-012",
    name: "Poland Confirmation of Polish Citizenship by Descent (Potwierdzenie Posiadania Obywatelstwa Polskiego - Jus Sanguinis) PR Poland",
    toCountry: "pl",
    fromCountry: "us",
    category: "pr",
    record_type: "PR_VISA",
    fee: "PLN 58 Voivodeship Stamp Duty Citizenship by Descent Confirmation Poland",
    validity: "Lifetime Polish & EU Citizenship + Polish Passport Eligibility",
    docs: "Unbroken chain of vital records (birth & marriage certificates) from Polish ancestor who held Polish citizenship after 1920 + Proof ancestor did not lose citizenship before next generation's birth"
  }
];

const SUPPORTING_AND_LEGACY_PL: RawPolandItem[] = [
  {
    id: "pl-SUP-001",
    officialCode: "PL-SUP-001",
    name: "Urząd Wojewódzki Authority (Voivodeship Office - Wydział Spraw Cudzoziemców) Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Urząd Wojewódzki = Voivodeship Office - Issues Work Permits, Karta Pobytu, Zaproszenie & Citizenship Recognition in Poland"
  },
  {
    id: "pl-SUP-002",
    officialCode: "PL-SUP-002",
    name: "Powiatowy Urząd Pracy (PUP) & Oświadczenie Declaration Authority Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Powiatowy Urząd Pracy (PUP) = District Labour Office - Registers Oświadczenie, Type S Seasonal Permits & Informacja Starosty"
  },
  {
    id: "pl-SUP-003",
    officialCode: "PL-SUP-003",
    name: "KRS / CEIDG / REGON / NIP Commercial Registry Authority Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "KRS (National Court Register) & CEIDG = Official Polish Company Registers required for Business & Work sponsorships"
  },
  {
    id: "pl-LEG-001",
    officialCode: "PL-LEG-001",
    name: "Legacy Old Paper Work Permit System (Replaced by e-Praca.gov.pl & Unified Type A/B/C/D/E/S System) Poland",
    toCountry: "pl",
    fromCountry: "in",
    category: "pr",
    record_type: "LEGACY_VISA",
    fee: "-",
    validity: "-",
    docs: "Historical reference only - Replaced by electronic praca.gov.pl Voivodeship Work Permit & Single Permit system"
  }
];

function convertRawToVisaItem(item: RawPolandItem): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
  const details = getPolandMicroDetails(item.id, item.category, item.name, item.fundsBox, item.itrBox, item.bankBox);

  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    category: item.category,
    categoryCode: item.category,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    processing: "10 - 15 Calendar Days (VFS Poland / e-Konsulat) or 30 - 90 Days (Urząd Wojewódzki)",
    icon: item.category === 'tourist' ? '🏖️' : item.category === 'work' ? '💼' : item.category === 'student' ? '🎓' : item.category === 'family' ? '👨‍👩‍👧' : item.category === 'business' ? '🤝' : '🏛️',
    purpose: `${item.name} — Official Poland (${item.officialCode}) visa and residence permit pathway processed via VFS Global Poland, e-Konsulat, and Urząd Wojewódzki (Voivodeship Office).`,
    eligibility: "Valid passport with min 3 months validity beyond planned departure, 2 blank pages, travel medical insurance EUR 30,000, confirmed travel itinerary / Voivodeship Work Permit / University admission / Zaproszenie, and seasoned 3-6 month financial proof.",
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
      "Full Name, PESEL (if already issued in Poland), Date & Place of Birth, Nationality",
      "Passport Number, Issue Date, Expiry Date & Issuing Authority (min 2 blank pages)",
      "Polish Host / Employer KRS, REGON, NIP & Registered Address in Poland",
      "Schengen Travel History, Biometrics (VIS) Status & Travel Insurance Policy Details (min EUR 30,000)"
    ],
    steps: [
      "Obtain the mandatory Polish supporting document (Voivodeship Work Permit Type A, Registered Zaproszenie, KRS Business Invitation, or University Acceptance + Tuition Receipt).",
      "Register and complete the visa application form on the official Polish e-Konsulat portal or VFS Global Poland system.",
      "Book your appointment at VFS Global Poland or the Polish Consulate and prepare 3-6 months stamped bank statements (min PLN 300/day for Tourist or PLN 15,000 for Student).",
      "Attend biometrics & document submission with EUR 30,000 approved travel medical insurance and collect your stamped Schengen C or National D visa."
    ],
    tips: [
      "Ensure your bank statement maintains a steady balance (min PLN 300/day for Tourist or PLN 15,000 for Student) over 3-6 months; sudden large deposits are rejected.",
      "For Poland Work Visa (National D), verify that your employer's KRS, REGON, and NIP match the Voivodeship Work Permit (Zezwolenie na pracę Typ A) and employment contract.",
      "For Business National D (1Y), an official Voivodeship-registered invitation or original company invitation with KRS/REGON/NIP is mandatory."
    ],
    faq: [
      {
        q: `What is the official visa fee and validity for ${item.name}?`,
        a: `Official Fee: ${item.fee}. Validity: ${item.validity}. Processed via VFS Poland / Polish Consulate or Urząd Wojewódzki.`
      },
      {
        q: `What documents are required for ${item.officialCode}?`,
        a: `Required documents: ${item.docs}.`
      }
    ]
  };
}

export const POLAND_92_VISAS: CountryVisas = {
  tourist: PL_92.filter(i => i.category === 'tourist').map(convertRawToVisaItem),
  business: PL_92.filter(i => i.category === 'business').map(convertRawToVisaItem),
  work: PL_92.filter(i => i.category === 'work').map(convertRawToVisaItem),
  student: PL_92.filter(i => i.category === 'student').map(convertRawToVisaItem),
  family: PL_92.filter(i => i.category === 'family').map(convertRawToVisaItem),
  pr: PL_92.filter(i => i.category === 'pr').map(convertRawToVisaItem),
  supporting: SUPPORTING_AND_LEGACY_PL.map(convertRawToVisaItem)
};
