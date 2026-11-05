import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getAustriaMicroDetails(code: string, cat: string, name: string, rawFunds?: string, rawItr?: string, rawBank?: string) {
  let fundsMin = rawFunds || "Austria C Short Stay Visa requires proof of min EUR 100/day (approx EUR 3,000 for 30 days) + confirmed hotel reservation + round-trip flight booking + travel medical insurance (min EUR 30,000 across all 29 Schengen states).";
  let fundsBankMonths = rawBank || "Last 3 to 6 months personal bank statements stamped and certified by bank branch (min EUR 3,000 liquid balance). No sudden deposit 1 day before ❌.";
  let fundsSudden = "❌ Sudden large cash deposits right before visa submission at VFS Austria / Austrian Embassy / BMI are strictly audited and rejected. Maintain seasoned funds over 3 to 6 months.";
  let fundsEx = "✅ Sahi: Seasoned 6-month bank statement with EUR 100/day liquid funds. ❌ Galat: Sudden deposit 24-48 hours prior to appointment.";

  let itrYears = rawItr || "ITR 2Y + Bank 6M 3M required for C tourist Austria Schengen = VFS Austria Delhi / Mumbai.";
  let itrMatch = "Declared income on Indian tax returns must match bank account credits, salary payslips, and employer leave letter/NOC.";
  let itrNoItr = "Not required for short-term visitors fully sponsored by host via verified Austrian EVE (Elektronische Verpflichtungserklärung).";

  let bankMonths = rawBank || "Last 3 to 6 months bank statements showing min EUR 3,000 liquid balance.";
  let bankReg = "Regular salary credits or business revenue.";
  let bankFd = "Fixed deposits accepted only as secondary supplementary proof.";
  let bankSource = "Salary, business income, or verified host sponsor funds in Austria.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('rot-weiß-rot') || lowerCode.includes('rwr') || lowerCode.includes('blue-card')) {
    fundsMin = rawFunds || "Austria Red-White-Red Card (Rot-Weiß-Rot-Karte) requires a binding job contract from an Austrian employer registered in Firmenbuch + salary meeting Austrian collective agreements (Kollektivvertrag - min gross EUR 3,030/month for Other Key Workers in 2024, EUR 45,000+/year for EU Blue Card) + points score (min 55-70 points based on qualifications, age, experience, and German/English language skills).";
    fundsBankMonths = "Signed employment contract, employer declaration (Arbeitgebererklärung), educational diplomas, and 3 months bank statements.";
    fundsSudden = "Contract must specify gross monthly salary in EUR, job duties, and weekly hours (38.5 hrs/week full-time standard in Austria).";
    fundsEx = "✅ Sahi: Binding employment contract + AMS labour market approval + RWR Card points evaluation (55+ points). ❌ Galat: Salary below Kollektivvertrag statutory minimum.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('phd')) {
    fundsMin = rawFunds || "Austria Student Residence Permit (Aufenthaltsbewilligung Student) requires official admission notice (Zulassungsbescheid) from an accredited Austrian university (Uni Wien, TU Wien, WU, etc.) + proof of living funds of at least EUR 11,000 to EUR 14,000/year in a dedicated bank account in student's own name or blocked account (Sperrkonto) + accommodation confirmation + comprehensive health insurance.";
    fundsBankMonths = "Personal bank account in student's name showing min EUR 11,000-14,000 liquid funds, stamped by bank, with seasoned origin.";
    fundsSudden = "Funds must be in an account accessible in student's own name; third-party guarantees from distant relatives are strictly scrutinized by MA 35 / Bezirkshauptmannschaft.";
    fundsEx = "✅ Sahi: University Zulassungsbescheid + bank statement showing EUR 11,000+ in student's name + student dorm contract. ❌ Galat: Unverified sponsor without official Austrian liability declaration.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('reunion')) {
    fundsMin = rawFunds || "Austria Family Reunification Residence Permit (Familienzusammenführung / Rot-Weiß-Rot-Karte Plus) requires sponsor residing in Austria to demonstrate regular net monthly income above the standard rates of the General Social Insurance Act (ASVG Richtsatz - min EUR 1,751/month for married couples, plus EUR 171 per child) + adequate living accommodation (Mietvertrag) + German A1 language certificate (ÖSD / Goethe).";
    fundsBankMonths = "Last 3 to 6 months sponsor payslips (Lohnzettel), Austrian tax assessment (Einkommensteuerbescheid), and bank statements.";
    fundsSudden = "Social welfare benefits (Mindestsicherung / Sozialhilfe) disqualify sponsorship; net earnings must be derived from legitimate employment or business.";
    fundsEx = "✅ Sahi: Net salary exceeding ASVG Richtsatz + registered rental lease + German A1 certificate + apostilled marriage certificate. ❌ Galat: Sponsor net income below threshold.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('startup') || lowerCode.includes('investor')) {
    fundsMin = rawFunds || "Austria Business Visitor / Self-Employed Key Worker requires an official invitation from an Austrian enterprise registered in Firmenbuch, or for Self-Employed Key Worker / Start-up Founder, an innovative business plan + sustained macroeconomic benefit or EUR 100,000+ direct capital investment evaluated positively by AMS / AWS.";
    fundsBankMonths = "3-6 months corporate and personal bank statements + Firmenbuch excerpt.";
    fundsSudden = "Austrian host company must have active status in the Austrian Commercial Register (Firmenbuch) and Austrian Economic Chamber (WKO).";
    fundsEx = "✅ Sahi: Business invitation with Firmenbuch number + foreign company deputation OR AWS approved start-up business plan. ❌ Galat: Unregistered host entity.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('daueraufenthalt') || lowerCode.includes('citizenship')) {
    fundsMin = rawFunds || "Austria Permanent Residence (Daueraufenthalt EU) requires 5 years continuous legal and uninterrupted residence in Austria + completion of Module 2 of the Integration Agreement (German language proficiency level B1) + financial self-sufficiency (min income meeting ASVG rates) + clean police record (Strafregisterbescheinigung).";
    fundsBankMonths = "5 years Austrian tax assessments, continuous social insurance records (ÖGK Versicherungsdatenauszug), and clean criminal background check.";
    fundsSudden = "Continuous residence evaluated by municipal district authority (Bezirkshauptmannschaft or MA 35 in Vienna); absences cannot exceed 6 consecutive months.";
    fundsEx = "✅ Sahi: 5 years uninterrupted stay on RWR Card Plus + German B1 certificate + 5 years tax records. ❌ Galat: Prolonged gaps in residence or unpaid tax debts.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

export interface RawAustriaItem {
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

export const AT_92: RawAustriaItem[] = [
  // ==========================================
  // TOURIST (18) - Schengen C Tourist & Short-Stay Visas Austria
  // ==========================================
  {
    id: "at-TOU-001",
    officialCode: "AT-TOU-001",
    name: "Schengen C Tourist 90/180 Days Austria C Tourist 90/180 - Most common Tourist Austria",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C tourist Austria 90/180 Schengen",
    validity: "90/180 C tourist Austria Schengen",
    docs: "Passport 3M 2 blank + Photo 35x45 white Schengen + Flight return + Hotel all Austria + Insurance EUR 30000 + Bank 3M + Employment + Cover letter + C tourist Austria application VFS Austria",
    fundsBox: "EUR 100/day = Bank 3M EUR 100/day = C tourist Austria Schengen",
    itrBox: "ITR 2Y + Bank 6M 3M C tourist Austria Schengen",
    bankBox: "Bank 3M last 6M min EUR 3000 C tourist Austria - sudden large deposit reject ❌",
    warningBox: "✅ Most common tourist Austria C Tourist 90/180 Schengen - VFS Austria - 29 countries valid - EUR 100/day"
  },
  {
    id: "at-TOU-002",
    officialCode: "AT-TOU-002",
    name: "Schengen C Visiting Family Friends 90/180 C Visiting Family Friends 90/180 Visitor Austria Family",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C visiting family friends Austria",
    validity: "90/180 C visiting family friends Austria Schengen",
    docs: "Austrian host invitation + Host Austrian ID / Meldezettel + Relationship proof + EVE (Elektronische Verpflichtungserklärung) electronic sponsorship pledge at Austrian police station + Accommodation proof Austria + C visiting Austria VFS",
    fundsBox: "Austrian host income payslips or applicant EUR 100/day liquid funds + EVE ID number",
    warningBox: "MOST IMPORTANT: EVE Elektronische Verpflichtungserklärung - Electronic liability declaration registered with Austrian Police"
  },
  {
    id: "at-TOU-003",
    officialCode: "AT-TOU-003",
    name: "Schengen C Cultural Sports & Art Events 90/180 Austria",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C cultural sports Austria Schengen",
    validity: "90/180 C cultural sports Austria Schengen",
    docs: "Austrian organizer invitation cultural sports + Event proof (Salzburg Festival, Vienna State Opera, FIS Alpine Skiing) + Sports federation accreditation + Return ticket + Bank 3M"
  },
  {
    id: "at-TOU-004",
    officialCode: "AT-TOU-004",
    name: "Schengen A Airport Transit Airport Transit A Transit Austria Schengen",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 A transit Austria Schengen",
    validity: "24H A transit Austria Schengen (Vienna Schwechat VIE)",
    docs: "Passport 3M + Confirmed onward flight ticket within 24H + Valid visa for third destination country + Airport transit application VFS"
  },
  {
    id: "at-TOU-005",
    officialCode: "AT-TOU-005",
    name: "Schengen C Multiple 1Y Multiple Entry 1Y 90/180 C Multiple 1Y Tourist Austria Schengen 1Y",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C multiple 1Y Austria Schengen",
    validity: "1 Year Multiple 90/180 C multiple 1Y Austria Schengen 1Y",
    docs: "Proof of 3 previous lawfully used Schengen visas within last 2 years + Bank 6M + Passport valid 15M + Multi-entry travel justification"
  },
  {
    id: "at-TOU-006",
    officialCode: "AT-TOU-006",
    name: "Schengen C Multiple 2Y Multiple Entry 2Y 90/180 C Multiple 2Y Tourist Austria Schengen 2Y",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C multiple 2Y Austria Schengen",
    validity: "2 Years Multiple 90/180 C multiple 2Y Austria Schengen 2Y",
    docs: "Previous C multiple 1Y lawfully used within previous 2 years + Bank 6M + Clean compliance record + Travel medical insurance"
  },
  {
    id: "at-TOU-007",
    officialCode: "AT-TOU-007",
    name: "Schengen C Multiple 5Y Multiple Entry 5Y 90/180 C Multiple 5Y Tourist Austria Schengen 5Y",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C multiple 5Y Austria Schengen",
    validity: "5 Years Multiple 90/180 C multiple 5Y Austria Schengen 5Y",
    docs: "Previous C multiple 2Y lawfully used within previous 3 years + Bank 12M + Stable employment or business in India + C multiple 5Y Austria VFS"
  },
  {
    id: "at-TOU-008",
    officialCode: "AT-TOU-008",
    name: "ETIAS Travel Authorization 3Y ETIAS Travel Authorization 3Y ETIAS Austria",
    toCountry: "at",
    fromCountry: "us",
    category: "tourist",
    record_type: "ETA_VISA",
    fee: "EUR 7 ETIAS 3Y Austria",
    validity: "3 Years ETIAS travel authorization Austria (90/180 days per stay)",
    docs: "Biometric machine-readable passport + Online application via official ETIAS EU portal + Payment card (visa-exempt travelers)"
  },
  {
    id: "at-TOU-009",
    officialCode: "AT-TOU-009",
    name: "Austria National D Visitor Visa (Visum D 91 to 180 Days Stay in Austria)",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 150 National D Visitor Visa Austria",
    validity: "91 to 180 Days Long-Stay Visitor Visa D Austria",
    docs: "Proof of independent pension or passive financial means (min EUR 2,500/month) + Clean criminal record + Comprehensive sickness insurance + Proof of accommodation in Austria"
  },
  {
    id: "at-TOU-010",
    officialCode: "AT-TOU-010",
    name: "Schengen C Medical Treatment 90/180 C Medical 90/180 Medical Austria Schengen",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C medical Austria Schengen",
    validity: "90/180 C medical Austria Schengen",
    docs: "Austrian hospital invitation letter (AKH Wien, Privatklinik Döbling, Graz University Clinic) + Prepayment receipt of estimated medical costs + Medical certificate + Travel insurance"
  },
  {
    id: "at-TOU-011",
    officialCode: "AT-TOU-011",
    name: "Austria Alpine Winter Sports & Tirol Tourism Short-Stay C Visa",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C alpine tourism Austria",
    validity: "Up to 90 Days Alpine Tourism Stay (Innsbruck, Kitzbühel, St. Anton)",
    docs: "Confirmed ski resort chalet or hotel booking across Tirol, Salzburg, or Vorarlberg + Ski pass reservation + Return flight ticket + Bank 3M (EUR 100/day)"
  },
  {
    id: "at-TOU-012",
    officialCode: "AT-TOU-012",
    name: "Danube River Cruise & Navigation Crew Transit C Visa Austria (Vienna / Linz Ports)",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C river cruise transit Austria",
    validity: "Duration of Cruise Itinerary (Single / Double / Multiple Entry)",
    docs: "Danube river cruise voucher or navigation crew discharge book + Port of Vienna boarding guarantee + Travel medical insurance including river rescue"
  },
  {
    id: "at-TOU-013",
    officialCode: "AT-TOU-013",
    name: "Official Government Delegation & UN Vienna Mission C Visa (VIC / IAEA / UNODC)",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 0 / Exempt Official UN delegation Austria",
    validity: "Duration of UN Conference or Official Diplomatic Mission",
    docs: "Note Verbale from Ministry of External Affairs + Official invitation from United Nations Office at Vienna (UNOV), IAEA, UNODC, or Austrian Federal Government"
  },
  {
    id: "at-TOU-014",
    officialCode: "AT-TOU-014",
    name: "Schengen Cascade Multi-Year 3-Year Verified Tourist Visa Austria",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C cascade 3Y Austria Schengen",
    validity: "3 Years Multiple Entry (90 days per 180-day period)",
    docs: "Passport valid 3.5Y + Consecutive compliant Schengen travel history + Stamped bank statements 6M + Indian employment proof"
  },
  {
    id: "at-TOU-015",
    officialCode: "AT-TOU-015",
    name: "Austria Heritage & Musical Tourism Short-Stay C Visa (Vienna, Salzburg, Hallstatt)",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C heritage tourism Austria",
    validity: "Up to 90 Days Single/Multiple Entry",
    docs: "Confirmed hotel bookings in Vienna, Salzburg, Hallstatt & Wachau + Classical music concert tickets + Comprehensive flight & travel insurance"
  },
  {
    id: "at-TOU-016",
    officialCode: "AT-TOU-016",
    name: "Group Travel & Tour Operator Approved Schengen C Visa Austria",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C group tour Austria",
    validity: "Duration of Packaged Alpine Tour Itinerary (Max 30 Days)",
    docs: "Accredited tour operator group member list + Group hotel vouchers + Return group flight booking + Stamped bank statements 3M"
  },
  {
    id: "at-TOU-017",
    officialCode: "AT-TOU-017",
    name: "Austria Digital Nomad & Remote Worker National D Visa (Self-Sufficient Foreign Income)",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "DIGITAL_NOMAD_VISA",
    fee: "EUR 150 National D Remote Worker Austria",
    validity: "6 Months to 1 Year National D Stay",
    docs: "Remote contract with enterprise outside Austria + Proven regular monthly remote income EUR 3,200+ + Austrian apartment lease + Comprehensive private health insurance"
  },
  {
    id: "at-TOU-018",
    officialCode: "AT-TOU-018",
    name: "Schengen C Urgent Humanitarian & Compassionate Grounds Visa Austria",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C humanitarian Austria",
    validity: "Up to 90 Days Urgent Humanitarian Stay",
    docs: "Urgent medical / bereavement notice from Austrian hospital or authority + Proof of immediate family tie + Priority clearance from Federal Ministry of the Interior (BMI)"
  },

  // ==========================================
  // BUSINESS (8) - Business National D, Schengen C, Trade Fair & Firmenbuch
  // ==========================================
  {
    id: "at-BUS-001",
    officialCode: "AT-BUS-001",
    name: "Austria Business National D 6M Business National D 6M Business Austria - Most common Business Austria",
    toCountry: "at",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 150 Business National D 6M Business Austria",
    validity: "6 Months Business National D 6M Business Austria",
    docs: "Austrian company invitation + Firmenbuch + Foreign company letter + Business National D Austria VFS - Firmenbuch required",
    warningBox: "✅ Most common business Austria Business National D 6M - Austrian company invitation + Firmenbuch + Chamber certificate - 14 days approval"
  },
  {
    id: "at-BUS-002",
    officialCode: "AT-BUS-002",
    name: "Austria Business Schengen C 90/180 Business Schengen C 90/180 Business Austria",
    toCountry: "at",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Business Schengen C 90/180 Business Austria",
    validity: "90/180 Business Schengen C 90/180 Business Austria",
    docs: "Austrian business invitation + Firmenbuch commercial register excerpt + Foreign employer deputation letter + Business meeting schedule + Bank 3M"
  },
  {
    id: "at-BUS-003",
    officialCode: "AT-BUS-003",
    name: "Austria Trade Fair Business C Trade Fair Business C Business Austria Trade Fair",
    toCountry: "at",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Trade fair business C Business Austria",
    validity: "90/180 Trade fair business C Business Austria",
    docs: "Trade fair invitation Austria (Messe Wien, Messe Salzburg, Design District) + Exhibitor badge proof or confirmed trade visitor ticket + Foreign company letter"
  },
  {
    id: "at-BUS-004",
    officialCode: "AT-BUS-004",
    name: "Austria Investment Business National D 1Y Investment Business National D 1Y Business Austria Investment",
    toCountry: "at",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 150 Investment business National D 1Y Business Austria",
    validity: "1 Year Investment business National D 1Y Business Austria Investment",
    docs: "Investment plan Austria + Company registration Austria Firmenbuch + Investment proof EUR 100k + Investment business National D Austria VFS",
    warningBox: "Niederlassungsbewilligung - Selbständiger / Investment capital EUR 100,000+ with macroeconomic job creation in Austria"
  },
  {
    id: "at-BUS-005",
    officialCode: "AT-BUS-005",
    name: "Austria Executive Board Member & Corporate Managing Director C Multi-Entry (Firmenbuch)",
    toCountry: "at",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 C executive director Austria",
    validity: "1 to 5 Years Multi-Entry (90 days per 180 days)",
    docs: "Firmenbuch commercial register extract confirming managing director (Geschäftsführer) or supervisory board role (Aufsichtsrat) + Tax identification + Resolution"
  },
  {
    id: "at-BUS-006",
    officialCode: "AT-BUS-006",
    name: "Austria Commercial Consulting, Auditing & Technical Advisory C Visa",
    toCountry: "at",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 C consulting Austria",
    validity: "90/180 Days Business Stay Austria",
    docs: "Consulting contract with Austrian corporate client + Service mandate letter confirming non-Austrian payroll + WKO chamber registration proof"
  },
  {
    id: "at-BUS-007",
    officialCode: "AT-BUS-007",
    name: "Austria Industrial Machinery Installation & Assembly Work Visa (Montagevisum C)",
    toCountry: "at",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Montagevisum C Austria",
    validity: "Up to 90 Days Specialized Assembly / Maintenance",
    docs: "Contract of sale & supply for industrial machinery + Montage confirmation + AMS confirmation of exempt temporary assembly work (Entsendung/Montage)"
  },
  {
    id: "at-BUS-008",
    officialCode: "AT-BUS-008",
    name: "Austria Startup Entrepreneur & High-Tech Founder Residence Permit (AWS Endorsement)",
    toCountry: "at",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 160 Startup Residence Permit Austria",
    validity: "2 Years Red-White-Red Card for Start-up Founders",
    docs: "AWS (Austria Wirtschaftsservice) written statement evaluating innovative business model + Min EUR 30,000 equity capital + Min 50 points on points system"
  },

  // ==========================================
  // WORK (26) - Red-White-Red Card, EU Blue Card, Shortage & Key Workers
  // ==========================================
  {
    id: "at-WRK-001",
    officialCode: "AT-WRK-001",
    name: "Austria Red White Red Card Very Highly Qualified 2Y Red White Red Card Very Highly Qualified 2Y Work Austria - Most common Work Austria Highly Qualified",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 120 Red White Red Card Very Highly Qualified 2Y Work Austria",
    validity: "2 Years Red White Red Card Very Highly Qualified 2Y Work Austria Highly Qualified",
    docs: "Red White Red Card points 70+ + Degree + Experience 5Y + Language English German + Age points + Job offer Austria RWR + RWR Card Very Highly Qualified 2Y application Austria VFS - Points based",
    fundsBox: "Points 70+ Red White Red Card Very Highly Qualified Austria - Education 40 max + Experience 20 + Language 10 + Age 20 + Studies Austria 10",
    warningBox: "✅ Most common work Austria Red White Red Card Very Highly Qualified 2Y - Points Based 70+ points - Age education experience language - Job search 6M then work"
  },
  {
    id: "at-WRK-002",
    officialCode: "AT-WRK-002",
    name: "Austria Red White Red Card Skilled Worker Shortage 2Y Red White Red Card Skilled Worker Shortage Occupation 2Y Work Austria Shortage",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 120 Red White Red Card Skilled Worker Shortage 2Y Work Austria",
    validity: "2 Years Red White Red Card Skilled Worker Shortage 2Y Work Austria Shortage",
    docs: "Job offer Austria shortage occupation + Shortage occupation list Austria + Employment contract shortage + Qualifications + RWR Card Skilled Worker Shortage 2Y Austria VFS - Shortage list",
    warningBox: "Fachkräfte in Mangelberufen - Minimum 55 points required on criteria table + job on official Austrian nationwide/regional shortage list"
  },
  {
    id: "at-WRK-003",
    officialCode: "AT-WRK-003",
    name: "Austria Red White Red Card Other Key Worker 2Y Red White Red Card Other Key Worker 2Y Work Austria Key Worker",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 120 Red White Red Card Other Key Worker 2Y Work Austria",
    validity: "2 Years Red White Red Card Other Key Worker 2Y Work Austria Key Worker",
    docs: "Job offer Austria key worker + Salary EUR 3,030+ gross/month + Degree + Experience + AMS labour market testing (Ersatzkraftverfahren) + RWR Card Other Key Worker 2Y"
  },
  {
    id: "at-WRK-004",
    officialCode: "AT-WRK-004",
    name: "Austria Red White Red Card Graduate 2Y Red White Red Card Graduate 2Y Work Austria Graduate",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 120 Red White Red Card Graduate 2Y Work Austria Graduate",
    validity: "2 Years Red White Red Card Graduate 2Y Work Austria Graduate",
    docs: "Austria university degree (Bachelor, Master, or PhD) + Job offer Austria matching degree level + Min statutory salary without AMS labour market testing + RWR Card Graduate 2Y"
  },
  {
    id: "at-WRK-005",
    officialCode: "AT-WRK-005",
    name: "Austria Red White Red Card Self Employed Key Worker 2Y Red White Red Card Self Employed Key Worker 2Y Work Austria Self Employed",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 120 Red White Red Card Self Employed Key Worker 2Y Work Austria",
    validity: "2 Years Red White Red Card Self Employed Key Worker 2Y Work Austria Self Employed",
    docs: "Business plan Austria self employed + Investment EUR 100k + Transfer of investment capital or creation of new jobs + AMS positive assessment report + RWR Card Self Employed"
  },
  {
    id: "at-WRK-006",
    officialCode: "AT-WRK-006",
    name: "Austria EU Blue Card 2Y EU Blue Card 2Y Work Austria EU Blue Card",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 120 EU Blue Card 2Y Work Austria EU Blue Card",
    validity: "2 Years EU Blue Card 2Y Work Austria EU Blue Card",
    docs: "Degree + Job offer Austria EUR 1.5x average + EU Blue Card salary EUR 45000+ + Employment contract highly skilled + EU Blue Card Austria VFS - Highly skilled",
    fundsBox: "Salary EUR 45000+ = EUR 1.5x average EU Blue Card 2Y Austria - Highly skilled minimum"
  },
  {
    id: "at-WRK-007",
    officialCode: "AT-WRK-007",
    name: "Austria Job Seeker Visa 6M Job Seeker Visa 6M Work Austria Job Seeker Very Highly Qualified",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 150 Job Seeker Visa 6M Work Austria Job Seeker",
    validity: "6 Months Job Seeker Visa 6M Work Austria Job Seeker Very Highly Qualified",
    docs: "Points 70+ Very Highly Qualified + Degree + Experience + Language + Job seeker 6M Austria VFS - Job search Austria 6M"
  },
  {
    id: "at-WRK-008",
    officialCode: "AT-WRK-008",
    name: "Austria Seasonal Work Permit 6M Seasonal Work Permit 6M Work Austria Seasonal Tourism Agriculture",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 120 Seasonal Work Permit 6M Work Austria Seasonal",
    validity: "6 Months Seasonal Work Permit 6M Work Austria Seasonal Tourism Agriculture",
    docs: "Seasonal work permit AMS + Job offer seasonal Austria + Seasonal Work Permit 6M Austria VFS - Tourism agriculture seasonal"
  },
  {
    id: "at-WRK-009",
    officialCode: "AT-WRK-009",
    name: "Austria Intra Company Transfer ICT 3Y Intra Company Transfer ICT 3Y Work Austria ICT",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 120 ICT 3Y Work Austria Intra Company Transfer",
    validity: "3 Years Intra Company Transfer ICT 3Y Work Austria ICT",
    docs: "ICT permit Austria + Intra company transfer letter + Employment contract ICT + Seniority proof (min 6-9 months) + ICT Austria VFS"
  },
  {
    id: "at-WRK-010",
    officialCode: "AT-WRK-010",
    name: "Austria Artist Self Employed Visa 1Y Artist Self Employed Visa 1Y Work Austria Artist",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 120 Artist Self Employed Visa 1Y Work Austria Artist",
    validity: "1 Year Artist Self Employed Visa 1Y Work Austria Artist",
    docs: "Artist portfolio + Austrian art sponsor + Engagement contract + Proof of artistic self-support + Artist self employed Austria VFS"
  },
  {
    id: "at-WRK-011",
    officialCode: "AT-WRK-011",
    name: "Austria Red-White-Red Card Start-up Founder 2Y (AWS Endorsed High-Tech Scheme)",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 Start-up Founder RWR Card",
    validity: "2 Years Start-up Founder Residence Permit Austria",
    docs: "Innovative business plan + AWS (Austria Wirtschaftsservice) endorsement + Min EUR 30,000 personal equity + Min 50 points on startup criteria table"
  },
  {
    id: "at-WRK-012",
    officialCode: "AT-WRK-012",
    name: "Austria Scientific Researcher Residence Permit 2Y (Aufenthaltsbewilligung Forscher)",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 Researcher Permit Austria",
    validity: "2 Years Scientific Researcher Stay",
    docs: "Hosting agreement (Aufnahmevereinbarung) with certified Austrian research body or university + PhD / Master's degree + Financial subsistence confirmation"
  },
  {
    id: "at-WRK-013",
    officialCode: "AT-WRK-013",
    name: "Austria Healthcare & Medical Specialist Work Permit (Austrian Medical Chamber License)",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 Healthcare Specialist Permit",
    validity: "2 Years Renewable Work Permit",
    docs: "Nostrification of medical degree + Österreichische Ärztekammer licensing certificate + Hospital employment contract + German B2/C1 medical language proof"
  },
  {
    id: "at-WRK-014",
    officialCode: "AT-WRK-014",
    name: "Austria IT & Software Engineering Specialist Red-White-Red Card (Shortage List Scheme)",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 IT Specialist RWR Card",
    validity: "2 Years IT Specialist Work Permit",
    docs: "Binding job offer in software architecture / cloud engineering / cybersecurity + Computer science degree or 3+ years verified experience + Shortage occupation points 55+"
  },
  {
    id: "at-WRK-015",
    officialCode: "AT-WRK-015",
    name: "Austria Au Pair Residence Permit 1Y (AMS Approved Host Family Agreement)",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 Au Pair Permit Austria",
    validity: "1 Year Non-Renewable Au Pair Stay",
    docs: "Au pair agreement with Austrian host family + AMS (Arbeitsmarktservice) confirmation letter (Anzeigebestätigung) + Age 18-28 + Enrolment in German course"
  },
  {
    id: "at-WRK-016",
    officialCode: "AT-WRK-016",
    name: "Austria Working Holiday Scheme 1Y (Bilateral Youth Exchange 18-30 Years)",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 150 Working Holiday Visa Austria",
    validity: "1 Year Working Holiday Stay (Non-renewable)",
    docs: "Valid passport + Age 18-30 years + Return flight ticket or funds to purchase + Living funds min EUR 2,500 + Full medical & travel insurance"
  },
  {
    id: "at-WRK-017",
    officialCode: "AT-WRK-017",
    name: "Austria Professional Trainee & Practical Intern Permit (AMS Praktikantenbewilligung)",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 Trainee Permit Austria",
    validity: "Up to 1 Year Practical Training",
    docs: "Internship contract matching university studies + AMS Praktikanten approval + Living allowance meeting Kollektivvertrag standards + Health insurance"
  },
  {
    id: "at-WRK-018",
    officialCode: "AT-WRK-018",
    name: "Austria Professional Athlete & Sports Coach Residence Permit (Austrian Sports Federation)",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 Athlete Permit Austria",
    validity: "1 Year / Contract Season Duration",
    docs: "Contract with registered Austrian Bundesliga / sports club + Endorsement from Austrian Sports Federation (ÖFB / ÖSV) + Sports medical clearance"
  },
  {
    id: "at-WRK-019",
    officialCode: "AT-WRK-019",
    name: "Austria University Professor, Lecturer & Academic Scholar Permit",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 Academic Faculty Permit",
    validity: "1 to 3 Years Academic Appointment",
    docs: "Appointment contract from accredited Austrian university (Uni Wien, Uni Graz, etc.) + PhD credentials + Statutory exemption from AuslBG labor market quota"
  },
  {
    id: "at-WRK-020",
    officialCode: "AT-WRK-020",
    name: "Austria Construction, Civil Engineering & Alpine Infrastructure Skilled Worker Permit",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 Construction Skilled Permit",
    validity: "2 Years Red-White-Red Card Construction",
    docs: "Employment contract with registered Austrian construction company + Technical trade qualifications on Mangelberufe list + AMS approval"
  },
  {
    id: "at-WRK-021",
    officialCode: "AT-WRK-021",
    name: "Austria Automotive, Rail & CleanTech Engineering Specialist Work Permit",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 CleanTech & Automotive Permit",
    validity: "2 Years Red-White-Red Card",
    docs: "Engineering job contract with Austrian tech / automotive manufacturer (AVL, Magna Steyr, Voestalpine) + Engineering degree + Points 55+"
  },
  {
    id: "at-WRK-022",
    officialCode: "AT-WRK-022",
    name: "Austria Forestry, Timber & Alpine Silviculture Specialist Work Permit",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 Forestry Specialist Permit",
    validity: "1 to 2 Years Renewable Work Permit",
    docs: "Contract with Austrian federal forestry enterprise (Bundesforste) or private alpine timber estate + Specialized qualifications + AMS regional quota clearance"
  },
  {
    id: "at-WRK-023",
    officialCode: "AT-WRK-023",
    name: "Austria European Solidarity Corps & Non-Profit Volunteer Residence Permit (Freiwillige)",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 Volunteer Residence Permit",
    validity: "Up to 1 Year Non-Profit Volunteering",
    docs: "Volunteering agreement with certified Austrian non-profit or charitable institution + Living subsistence, board, lodging and pocket money guarantee"
  },
  {
    id: "at-WRK-024",
    officialCode: "AT-WRK-024",
    name: "Austria Recognized Religious Order & Pastoral Clergy Permit (Seelsorger)",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 Religious Clergy Permit",
    validity: "1 to 2 Years Pastoral Assignment",
    docs: "Official certificate of recognized religious community in Austria + Ordination credentials + Housing and subsistence commitment from Austrian religious body"
  },
  {
    id: "at-WRK-025",
    officialCode: "AT-WRK-025",
    name: "Austria Accredited Foreign Journalist & Press Correspondent National D Visa",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 150 Foreign Journalist D Visa",
    validity: "1 Year Press Accreditation Assignment",
    docs: "Press accreditation card from Federal Chancellery (Bundeskanzleramt) or MFA + Foreign media employment contract + International press credentials"
  },
  {
    id: "at-WRK-026",
    officialCode: "AT-WRK-026",
    name: "Austria Red-White-Red Card Plus Transition Work Permit (Rot-Weiß-Rot-Karte Plus)",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 160 RWR Card Plus Transition",
    validity: "3 Years Unrestricted Austrian Labour Market Access",
    docs: "Completion of 21 months of compliant employment on RWR Card or EU Blue Card + Proof of employment + Unrestricted access to any employer in Austria"
  },

  // ==========================================
  // STUDENT (14) - University, Doctoral, Language, Conservatory & Fachhochschule
  // ==========================================
  {
    id: "at-STU-001",
    officialCode: "AT-STU-001",
    name: "Austria Student National D 1Y Student National D 1Y Student Austria - Most common Student Austria",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 150 Student National D 1Y Student Austria",
    validity: "1 Year Student National D 1Y Student Austria",
    docs: "Admission letter Austria university + University acceptance Austria + Tuition fee proof Austria + Bank EUR 11000 blocked + Accommodation Austria + Student National D Austria VFS - Most common",
    fundsBox: "Bank EUR 11000 blocked = EUR 11000 Student National D 1Y Austria + Tuition + Accommodation = Student Austria",
    warningBox: "✅ Most common student Austria Student National D 1Y - University admission + Tuition paid + Bank EUR 11000 blocked account"
  },
  {
    id: "at-STU-002",
    officialCode: "AT-STU-002",
    name: "Austria Student Schengen C 90/180 Student Schengen C 90/180 Student Austria Short",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 90 Student Schengen C 90/180 Student Austria Short",
    validity: "90/180 Student Schengen C 90/180 Student Austria Short",
    docs: "Short course admission Austria + Student Schengen C Austria VFS - Short course <90D"
  },
  {
    id: "at-STU-003",
    officialCode: "AT-STU-003",
    name: "Austria Language Course Student National D 6M Language Course Student National D 6M Student Austria Language",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 150 Language Course Student National D 6M Student Austria Language",
    validity: "6 Months Language Course Student National D 6M Student Austria Language",
    docs: "Language school admission Austria + Language course proof + Language course Student National D Austria VFS - German course"
  },
  {
    id: "at-STU-004",
    officialCode: "AT-STU-004",
    name: "Austria PhD Researcher National D 1Y PhD Researcher National D 1Y Student Austria PhD Researcher",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 150 PhD Researcher National D 1Y Student Austria PhD Researcher",
    validity: "1 Year PhD Researcher National D 1Y Student Austria PhD Researcher",
    docs: "PhD admission Austria + Research proposal + Hosting agreement Austria + PhD Researcher National D Austria VFS"
  },
  {
    id: "at-STU-005",
    officialCode: "AT-STU-005",
    name: "Austria Master's Degree Student Residence Permit 1Y-2Y (Uni Wien, TU Wien, WU)",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 160 Master's Student Residence Permit",
    validity: "1 to 2 Years Master's Program Stay",
    docs: "Official unconditional admission notice (Zulassungsbescheid) to Master's program at public Austrian university + Bachelor's diploma + Living funds EUR 11,000+ + Dorm contract"
  },
  {
    id: "at-STU-006",
    officialCode: "AT-STU-006",
    name: "Austria Bachelor's Degree Student Residence Permit 1Y (Public & Private Universities)",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 160 Bachelor's Student Permit",
    validity: "1 Year Renewable Bachelor's Stay",
    docs: "Secondary school certificate nostrification / university special qualification proof (Besondere Universitätsreife) + University admission + Funds proof"
  },
  {
    id: "at-STU-007",
    officialCode: "AT-STU-007",
    name: "Austria Erasmus+ & European Exchange Student Residence Permit",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 160 Erasmus+ Exchange Permit",
    validity: "Semester / Academic Year (5 to 10 Months)",
    docs: "Erasmus+ learning agreement signed by Austrian university and home institution + OeAD grant award letter + Health insurance + Dorm lease"
  },
  {
    id: "at-STU-008",
    officialCode: "AT-STU-008",
    name: "Austria University of Applied Sciences Residence Permit (Fachhochschule FH Joanneum / Technikum)",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 160 Fachhochschule Student Permit",
    validity: "1 Year Renewable UAS Stay",
    docs: "Enrollment at recognized Austrian Fachhochschule + Practical training component details + Living expense guarantee + Health insurance"
  },
  {
    id: "at-STU-009",
    officialCode: "AT-STU-009",
    name: "Austria University Preparatory Course Language & Orientation Permit (Vorstudienlehrgang VWU)",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 160 Preparatory Course Permit",
    validity: "1 Year Preparatory Course Stay",
    docs: "Conditional university admission requiring German level B2 or supplementary exams + Enrollment at Vorstudienlehrgang der Wiener Universitäten (VWU) + Bank funds"
  },
  {
    id: "at-STU-010",
    officialCode: "AT-STU-010",
    name: "Austria Music, Arts & Performing Conservatory Student Permit (MDW Vienna / Mozarteum Salzburg)",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 160 Conservatory Arts Permit",
    validity: "1 Year Renewable Arts Conservatory Stay",
    docs: "Successful audition and admission certificate from Austrian music university (MDW, Mozarteum, MUK) + Artistic portfolio + Proof of EUR 11,000+ living funds"
  },
  {
    id: "at-STU-011",
    officialCode: "AT-STU-011",
    name: "Austria Short-Stay Academic & Summer School Schengen C Visa (<90 Days Courses)",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 90 Academic Summer School C Visa",
    validity: "Up to 90 Days Course Duration",
    docs: "Summer/Winter school acceptance letter from Austrian academic institution + Tuition payment receipt + Hotel/dormitory reservation + Bank 3M"
  },
  {
    id: "at-STU-012",
    officialCode: "AT-STU-012",
    name: "Austria Master's Thesis Extension & Final Practical Semester Permit",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 160 Thesis Extension Permit",
    validity: "6 to 12 Months Thesis Completion Stay",
    docs: "Official university letter confirming thesis extension from faculty dean or professor + Continued matriculation + Living funds proof"
  },
  {
    id: "at-STU-013",
    officialCode: "AT-STU-013",
    name: "Austria Post-Doctoral Scholar & Ernst Mach Grantee Residence Permit (OeAD Ernst Mach Fellowship)",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 160 Ernst Mach Fellow Permit",
    validity: "1 to 2 Years Fellowship Research",
    docs: "Official Ernst Mach grant award confirmation from Austrian Agency for Education and Internationalisation (OeAD) + Host faculty research agreement + PhD credentials"
  },
  {
    id: "at-STU-014",
    officialCode: "AT-STU-014",
    name: "Austria Joint & Double Degree Inter-University Exchange Permit",
    toCountry: "at",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 160 Joint Degree Exchange Permit",
    validity: "Academic Year Exchange Duration (1Y)",
    docs: "Consortium agreement between partner universities + Austrian university admission + Living expense guarantee + Sickness insurance"
  },

  // ==========================================
  // FAMILY (14) - Family Reunion, EU Citizen Family, Marriage, Children & RWR+
  // ==========================================
  {
    id: "at-FAM-001",
    officialCode: "AT-FAM-001",
    name: "Austria Family Reunion National D 1Y Family Reunion National D 1Y Family Austria - Most common Family Austria",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 150 Family Reunion National D 1Y Family Austria",
    validity: "1 Year Family Reunion National D 1Y Family Austria",
    docs: "Relationship proof + Austrian family member residence + Marriage certificate attested + Birth certificate attested + Accommodation Austria + Income proof Austrian sponsor + Family Reunion National D Austria VFS",
    warningBox: "✅ Most common family Austria Family Reunion National D 1Y - Spouse child parent - Income proof Austrian sponsor"
  },
  {
    id: "at-FAM-002",
    officialCode: "AT-FAM-002",
    name: "Austria Family Reunion EU Citizen 1Y Family Reunion EU Citizen 1Y Family Austria EU Citizen",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free Family Reunion EU Citizen 1Y Family Austria EU Citizen",
    validity: "1 Year Family Reunion EU Citizen 1Y Family Austria EU Citizen",
    docs: "EU citizen family member in Austria + Relationship proof + EU citizen residence Austria (§ 54 NAG Aufenthaltskarte) + Free EU family application VFS",
    warningBox: "Directive 2004/38/EC - Aufenthaltskarte issued to third-country family members of EU/EEA citizens exercising free movement rights in Austria"
  },
  {
    id: "at-FAM-003",
    officialCode: "AT-FAM-003",
    name: "Austria Marriage National D 1Y Marriage National D 1Y Family Austria Marriage",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 150 Marriage National D 1Y Family Austria Marriage",
    validity: "1 Year Marriage National D 1Y Family Austria Marriage",
    docs: "Marriage intent Austria + Austrian partner ID + Civil registry confirmation (Standesamt Aufgebot) + Marriage National D Austria VFS"
  },
  {
    id: "at-FAM-004",
    officialCode: "AT-FAM-004",
    name: "Austria Child Family National D 1Y Child Family National D 1Y Family Austria Child",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 150 Child Family National D 1Y Family Austria Child",
    validity: "1 Year Child Family National D 1Y Family Austria Child",
    docs: "Child birth certificate attested + Parent residence Austria + Custody decree + Adequate housing + Child Family National D Austria VFS"
  },
  {
    id: "at-FAM-005",
    officialCode: "AT-FAM-005",
    name: "Austria Red-White-Red Card Family Dependent Permit (Rot-Weiß-Rot-Karte Plus for Family)",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 160 RWR Family Dependent Permit",
    validity: "Co-terminus with Principal Applicant's RWR Card (1 to 2 Years)",
    docs: "Principal applicant's Red-White-Red Card approval + Apostilled marriage / birth certificates + German A1 language certificate + Automatic unrestricted work rights"
  },
  {
    id: "at-FAM-006",
    officialCode: "AT-FAM-006",
    name: "Austria Family Member of Austrian Citizen Residence Permit 1Y (Familienangehöriger § 47 NAG)",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 160 Austrian Citizen Family Permit",
    validity: "1 to 2 Years Renewable Residence Permit",
    docs: "Austrian citizen passport or Staatsbürgerschaftsnachweis + Marriage certificate / birth certificate + Sponsor income meeting ASVG rates + German A1 certificate"
  },
  {
    id: "at-FAM-007",
    officialCode: "AT-FAM-007",
    name: "Austria EU Blue Card Dependent Family Residence Permit (Immediate Family Accompaniment)",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 160 Blue Card Family Permit",
    validity: "Co-terminus with EU Blue Card Duration (2 Years)",
    docs: "Principal applicant's EU Blue Card + Family ties proof + Exemption from quota regulations + Immediate unrestricted access to Austrian labor market"
  },
  {
    id: "at-FAM-008",
    officialCode: "AT-FAM-008",
    name: "Austria Registered Civil Partnership Residence Permit (Eingetragene Partnerschaft)",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 160 Civil Partnership Permit Austria",
    validity: "1 to 2 Years Renewable Stay",
    docs: "Registered civil partnership certificate officially recorded at Austrian Standesamt + Sponsor income proof + Living accommodation lease + German A1 proof"
  },
  {
    id: "at-FAM-009",
    officialCode: "AT-FAM-009",
    name: "Austria University Student & PhD Researcher Dependent Family Permit",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 160 Student Dependent Family Permit",
    validity: "Co-terminus with Student's Residence Permit",
    docs: "Student sponsor's residence permit + Proof of supplementary family living funds (approx EUR 400-500/dependent monthly) + Adequate apartment rental contract"
  },
  {
    id: "at-FAM-010",
    officialCode: "AT-FAM-010",
    name: "Austria Dependent Elderly Parent Family Reunification (Direct Ascendant Relatives)",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 160 Dependent Parent Permit Austria",
    validity: "1 Year Renewable Residence Permit",
    docs: "Proof of financial and medical dependency on Austrian sponsor + Proof that no other caregiver exists in country of origin + Private comprehensive health insurance"
  },
  {
    id: "at-FAM-011",
    officialCode: "AT-FAM-011",
    name: "Austria Newborn Child Registration & Residence Permit (Municipal Magistrat / MA 35)",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free / Nominal Registration Fee",
    validity: "Co-terminus with Parents' Austrian Residence Status",
    docs: "Austrian birth certificate (Geburtsurkunde) from Standesamt + Parents' Meldezettel (registration of residence) + Parents' residence permits"
  },
  {
    id: "at-FAM-012",
    officialCode: "AT-FAM-012",
    name: "Austria Independent Humanitarian Residence Permit Post-Divorce / Domestic Violence (§ 27 NAG)",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 160 Independent Humanitarian Permit",
    validity: "1 Year Independent Renewable Residence Permit",
    docs: "Proof of dissolution of marriage or police reports / court decrees evidencing domestic violence under § 27 NAG + Proof of own living subsistence"
  },
  {
    id: "at-FAM-013",
    officialCode: "AT-FAM-013",
    name: "Austria Legally Adopted Child Family Residence Permit (Austrian District Court Recognition)",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 160 Adopted Child Permit Austria",
    validity: "1 to 5 Years Residence Permit",
    docs: "Official international adoption decree recognized by Austrian Bezirksgericht (District Court) + Adoptive parents' Austrian status + Health insurance coverage"
  },
  {
    id: "at-FAM-014",
    officialCode: "AT-FAM-014",
    name: "Austria Family Member Automatic Labour Market Access (Unrestricted Work Rights on RWR+)",
    toCountry: "at",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free Work Authorization for Family Members",
    validity: "Co-terminus with Rot-Weiß-Rot-Karte Plus",
    docs: "Valid Rot-Weiß-Rot-Karte Plus residence card + Automatic right to take up dependent employment or self-employment anywhere in Austria without separate AMS authorization"
  },

  // ==========================================
  // PR (12) - Permanent Residence Daueraufenthalt EU, Naturalization & RWR+
  // ==========================================
  {
    id: "at-PR-001",
    officialCode: "AT-PR-001",
    name: "Austria Settlement Permit Daueraufenthalt EU 5Y Settlement Permit Daueraufenthalt EU 5Y PR Austria - Most common PR Austria",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Settlement Permit Daueraufenthalt EU 5Y PR Austria",
    validity: "Permanent Settlement Permit Daueraufenthalt EU 5Y PR Austria",
    docs: "Residence 5Y Austria + Settlement permit Daueraufenthalt EU + Physical presence 5Y Austria + Employment history 5Y Austria + Language German B1 + Integration agreement + Settlement permit Daueraufenthalt EU application Austria - 5Y residence",
    warningBox: "✅ Most common PR Austria Settlement Permit Daueraufenthalt EU 5Y - 5Y residence + German B1 + Integration agreement + Permanent EU"
  },
  {
    id: "at-PR-002",
    officialCode: "AT-PR-002",
    name: "Austria Citizenship by Naturalization Citizenship by Naturalization PR Austria Citizenship 6Y",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Citizenship by Naturalization PR Austria Citizenship 6Y",
    validity: "Permanent Citizenship by Naturalization PR Austria Citizenship 6Y",
    docs: "Residence 6Y Austria + Citizenship by naturalization + Language German B1 + Integration + Citizenship by naturalization application Austria - 6Y residence + B1 German",
    fundsBox: "36 months of regular income within last 6 years + German level B1 + Austrian history and constitution test passed"
  },
  {
    id: "at-PR-003",
    officialCode: "AT-PR-003",
    name: "Austria Red-White-Red Card Plus 3Y Unlimited Extension (Rot-Weiß-Rot-Karte Plus Renewal)",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 160 RWR Card Plus 3Y Extension",
    validity: "3 Years Renewable Residence Permit",
    docs: "Proof of 2 years continuous legal employment in Austria + Fulfilment of Module 1 of Integration Agreement (German A2) + Continuous health insurance"
  },
  {
    id: "at-PR-004",
    officialCode: "AT-PR-004",
    name: "Austria Business Investor Residence Red White Red Card Self Employed 2Y Business Investor Residence Red White Red Card Self Employed 2Y PR Austria Investor",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 120 Business Investor Residence Red White Red Card Self Employed 2Y PR Austria Investor",
    validity: "2 Years Business Investor Residence Red White Red Card Self Employed 2Y PR Austria Investor",
    docs: "Business plan Austria + Investment EUR 100k + Red White Red Card Self Employed Key Worker + Business investor residence Red White Red Card Self Employed 2Y Austria VFS + Business Investor Austria"
  },
  {
    id: "at-PR-005",
    officialCode: "AT-PR-005",
    name: "Austria EU Blue Card Fast-Track Permanent Residence (Daueraufenthalt EU with EU Mobility)",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Blue Card Fast-Track Daueraufenthalt EU",
    validity: "5 Years Permanent Residence Card (Renewable)",
    docs: "5 years legal residence across EU member states on EU Blue Card (with at least last 2 years in Austria) + German B1 language certificate + Clean criminal record"
  },
  {
    id: "at-PR-006",
    officialCode: "AT-PR-006",
    name: "Austria Permanent Settlement Permit Non-Employed 5Y (Niederlassungsbewilligung Ausgenommen Erwerbstätigkeit)",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 160 Settlement Permit Private Means",
    validity: "5 Years Renewable Settlement Permit",
    docs: "Substantial private financial wealth or foreign pension (double standard ASVG rates) + Health insurance + No employment in Austria + Module 1 integration proof"
  },
  {
    id: "at-PR-007",
    officialCode: "AT-PR-007",
    name: "Austria Permanent Residence Card EU+ for EU Family Members (Daueraufenthaltskarte 10Y)",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "Free Permanent Residence Card EU+ (§ 54a NAG)",
    validity: "10 Years Permanent Residence Card EU+",
    docs: "5 years continuous lawful residence in Austria as family member of EU/EEA citizen + Continued family tie + Registration certificate (Anmeldebescheinigung)"
  },
  {
    id: "at-PR-008",
    officialCode: "AT-PR-008",
    name: "Austria Austrian University Degree Fast-Track Long-Term Residence (Daueraufenthalt EU)",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Graduate Long-Term Residence",
    validity: "5 Years Permanent Residence Daueraufenthalt EU",
    docs: "Austrian university graduation diploma (half of student years count towards 5-year duration under EU Directive 2003/109/EC) + 2 years work on RWR Card + German B1"
  },
  {
    id: "at-PR-009",
    officialCode: "AT-PR-009",
    name: "Austria Spousal Fast-Track Naturalization (6 Years Residence & 5 Years Married)",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Spousal Citizenship Naturalization",
    validity: "Permanent Austrian Citizenship & Passport",
    docs: "6 years continuous legal residence in Austria + 5 years uninterrupted marriage with Austrian citizen in same household + German B1 certificate + Integration test"
  },
  {
    id: "at-PR-010",
    officialCode: "AT-PR-010",
    name: "Austria Citizenship by Declaration for Descendants of Persecuted Persons (§ 58c StbG)",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "Free Austrian Citizenship by Declaration",
    validity: "Permanent Austrian Citizenship (Dual Citizenship Allowed)",
    docs: "Proof of direct descent from an Austrian citizen or resident persecuted under National Socialism prior to 1955 + Application via Austrian Embassy / MA 35"
  },
  {
    id: "at-PR-011",
    officialCode: "AT-PR-011",
    name: "Austria Permanent Work Exemption Certificate (Freizügigkeitsbestätigung)",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Permanent Labour Market Exemption",
    validity: "Indefinite Work Rights across all Austrian Provinces",
    docs: "Completion of 5 years lawful stay on valid settlement permit + Permanent right to engage in any employment or self-employment without AMS permit"
  },
  {
    id: "at-PR-012",
    officialCode: "AT-PR-012",
    name: "Austria Absence Dispensation & Right of Return Permit (Bescheinigung des Daueraufenthaltsrechts)",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Absence Dispensation Certificate",
    validity: "Preserves Permanent Residence up to 1-2 Years Abroad",
    docs: "Prior notification of departure to Austrian immigration authority (MA 35 or Bezirkshauptmannschaft) before leaving + Valid Daueraufenthalt EU + Educational/employment justification"
  }
];

// Supporting classifications & legacy systems
export const SUPPORTING_AND_LEGACY_AT: RawAustriaItem[] = [
  {
    id: "at-SUP-001",
    officialCode: "AT-SUP-001",
    name: "Austria AMS (Arbeitsmarktservice - Public Employment Service) Labour Authority",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "AMS = Public Employment Service Austria - Conducts points assessment for Red-White-Red Card and labour market testing (Ersatzkraftverfahren)"
  },
  {
    id: "at-SUP-002",
    officialCode: "AT-SUP-002",
    name: "Austria EVE (Elektronische Verpflichtungserklärung) Electronic Liability Declaration Protocol",
    toCountry: "at",
    fromCountry: "in",
    category: "tourist",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Electronic letter of guarantee registered by Austrian host at their local police station (Polizeiinspektion) undertaking financial responsibility"
  },
  {
    id: "at-SUP-003",
    officialCode: "AT-SUP-003",
    name: "Austria Commercial Register (Firmenbuch) Commercial Court Authority",
    toCountry: "at",
    fromCountry: "in",
    category: "business",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Firmenbuch = Official Austrian commercial register administered by regional courts allocating Firmenbuchnummer (FN) for corporate sponsorship"
  },
  {
    id: "at-SUP-004",
    officialCode: "AT-SUP-004",
    name: "Austria Municipal Immigration Authority (Bezirkshauptmannschaft / Magistrat / MA 35 Vienna)",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Local district administration responsible for issuing residence permits (Aufenthaltstitel), Meldezettel registration, and naturalization"
  },
  {
    id: "at-SUP-005",
    officialCode: "AT-SUP-005",
    name: "Austria Federal Ministry of the Interior (BMI - Bundesministerium für Inneres)",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Federal ministry overseeing residency laws (NAG), border control, asylum, citizenship regulations, and visa policy guidelines"
  },
  {
    id: "at-SUP-006",
    officialCode: "AT-SUP-006",
    name: "Austria Economic Chamber (WKO - Wirtschaftskammer Österreich) Trade Authority",
    toCountry: "at",
    fromCountry: "in",
    category: "business",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Federal organization representing Austrian businesses, verifying trade qualifications (Gewerbeberechtigung) and supporting foreign entrepreneurs"
  },
  {
    id: "at-LEG-001",
    officialCode: "AT-LEG-001",
    name: "Legacy Red-White-Red Card 50-Points Old System (Replaced by Reformed 55+ Scheme) Austria",
    toCountry: "at",
    fromCountry: "in",
    category: "work",
    record_type: "LEGACY_VISA",
    fee: "-",
    validity: "-",
    docs: "Historical reference only - Replaced by modern reformed Red-White-Red Card criteria and expanded Mangelberufe lists"
  },
  {
    id: "at-LEG-002",
    officialCode: "AT-LEG-002",
    name: "Legacy Key Worker Annual Quota System (Replaced by Demand-Driven Points Criteria) Austria",
    toCountry: "at",
    fromCountry: "in",
    category: "pr",
    record_type: "LEGACY_VISA",
    fee: "-",
    validity: "-",
    docs: "Historical reference only - Old rigid annual numerical quotas replaced by modern transparent points-based admission"
  }
];

function convertRawToVisaItem(item: RawAustriaItem): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
  const details = getAustriaMicroDetails(item.id, item.category, item.name, item.fundsBox, item.itrBox, item.bankBox);

  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    category: item.category,
    categoryCode: item.category,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    processing: "10 - 15 Calendar Days (VFS Austria / Schengen C) or 4 - 8 Weeks (AMS & BMI / Red-White-Red Card)",
    icon: item.category === 'tourist' ? '🏖️' : item.category === 'work' ? '💼' : item.category === 'student' ? '🎓' : item.category === 'family' ? '👨‍👩‍👧' : item.category === 'business' ? '🤝' : '🏛️',
    purpose: `${item.name} — Official Austria (${item.officialCode}) visa and residence permit pathway processed via VFS Global Austria, Austrian Embassies/Consulates, and the Federal Ministry of the Interior (BMI) / AMS.`,
    eligibility: "Valid passport with min 3 months validity beyond planned departure, 2 blank pages, travel medical insurance EUR 30,000, confirmed travel itinerary / Austrian employment contract meeting Kollektivvertrag standards / university admission, and seasoned financial proof.",
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
      "Full Name, Austrian Social Insurance Number (Sozialversicherungsnummer - if previously resident), Date & Place of Birth, Nationality",
      "Passport Number, Issue Date, Expiry Date (valid at least 3 months after departure from Austria / Schengen Area)",
      "Austrian Employer / Host Firmenbuch commercial register number (FN), WKO trade division, and registered business address",
      "EVE (Elektronische Verpflichtungserklärung) 8-digit reference ID number (for hosted family/friends visitors)"
    ],
    steps: [
      "For Short-Stay Schengen (Type C), submit visa application form electronically and book biometric appointment via VFS Global.",
      "For Red-White-Red Card (Work), applicant applies via Austrian Embassy/VFS or employer files directly with local immigration authority (Bezirkshauptmannschaft / MA 35) in Austria.",
      "AMS (Arbeitsmarktservice) evaluates qualification points, labor market conditions (Ersatzkraftverfahren), and minimum salary compliance.",
      "Once approved, collect National Visa D at Austrian Embassy to travel, then collect biometric Red-White-Red Card and register at local Meldeamt within 3 days."
    ],
    tips: [
      "Ensure personal bank statements maintain at least EUR 100/day for short-stay tourists with no sudden last-minute deposits.",
      "For Red-White-Red Card applicants, calculate your exact points (min 55-70) beforehand across age, qualifications, experience, and language skills.",
      "For family reunification, ensure the sponsor provides proof of regular net monthly earnings above ASVG statutory minimums (approx EUR 1,751+/month for couples)."
    ],
    faq: [
      {
        q: `What is the official visa fee and validity for ${item.name}?`,
        a: `Official Fee: ${item.fee}. Validity: ${item.validity}. Applications are processed via VFS Global Austria, Austrian Embassies, or the municipal immigration authorities (MA 35 / Bezirkshauptmannschaft).`
      },
      {
        q: `What documents are required for ${item.officialCode}?`,
        a: `Required documents: ${item.docs}.`
      }
    ]
  };
}

const ALL_AT_CONVERTED = AT_92.map(convertRawToVisaItem);
const ALL_AT_SUPPORTING = SUPPORTING_AND_LEGACY_AT.map(convertRawToVisaItem);

export const AUSTRIA_92_VISAS: CountryVisas = {
  tourist: ALL_AT_CONVERTED.filter(i => i.category === 'tourist'),
  business: ALL_AT_CONVERTED.filter(i => i.category === 'business'),
  work: ALL_AT_CONVERTED.filter(i => i.category === 'work'),
  student: ALL_AT_CONVERTED.filter(i => i.category === 'student'),
  family: ALL_AT_CONVERTED.filter(i => i.category === 'family'),
  pr: ALL_AT_CONVERTED.filter(i => i.category === 'pr'),
  supporting: ALL_AT_SUPPORTING
};
