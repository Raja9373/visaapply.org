import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getBelgiumMicroDetails(code: string, cat: string, name: string, rawFunds?: string, rawItr?: string, rawBank?: string) {
  let fundsMin = rawFunds || "Belgium C Short Stay Visa requires proof of min EUR 95/day for hotel accommodation or EUR 45/day if staying with host (via Annexe 3bis) + round-trip ticket + travel medical insurance (min EUR 30,000 across all 29 Schengen states).";
  let fundsBankMonths = rawBank || "Last 3 months personal bank statements stamped by bank branch (min EUR 3,000 liquid funds). No sudden deposit 1 day before ❌.";
  let fundsSudden = "❌ Sudden large cash deposits right before visa submission at VFS Belgium / Immigration Office (Dienst Vreemdelingenzaken / Office des Étrangers) are strictly audited and rejected. Maintain seasoned funds.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement with EUR 95/day liquid funds. ❌ Galat: Sudden deposit 24-48 hours prior to appointment.";

  let itrYears = rawItr || "ITR 2Y required for C tourist Belgium Schengen = VFS Belgium Delhi / Mumbai.";
  let itrMatch = "Declared income must align with bank account salary credits and employer leave letter/NOC.";
  let itrNoItr = "Not required for short-term visitors fully sponsored by host via verified Belgian host Annexe 3bis commitment.";

  let bankMonths = rawBank || "Last 3 months bank statements showing min EUR 3,000 liquid balance.";
  let bankReg = "Regular salary credits or business revenue.";
  let bankFd = "Fixed deposits accepted only as secondary supplementary proof.";
  let bankSource = "Salary, business income, or verified host sponsor funds in Belgium.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('single') || lowerCode.includes('blue-card')) {
    fundsMin = rawFunds || "Belgium Single Permit (Combined Work & Residence Permit) requires a binding employment contract registered with regional authorities (Flanders Department of Work, Brussels Economy and Employment, or SPW Wallonia) meeting regional collective agreements (min gross annual salary EUR 47,000+ for highly skilled in Flanders / EUR 45,000+ in Brussels, EUR 62,233+ for EU Blue Card in 2024).";
    fundsBankMonths = "Signed employment contract, regional work authorization approval, and 3 months personal bank statements.";
    fundsSudden = "Contract must state gross annual/monthly salary in EUR, job duties, and weekly hours (38 hrs/week full-time).";
    fundsEx = "✅ Sahi: Signed employment contract + regional work authorization + Single Permit Annex 46. ❌ Galat: Salary below regional threshold without work authorization.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('phd')) {
    fundsMin = rawFunds || "Belgium Student Residence Permit requires official admission or enrollment certificate from an accredited Belgian higher education institution (KU Leuven, UGent, UCLouvain, ULB, etc.) + paid tuition fee receipt + proof of living funds of at least EUR 803/month (approx EUR 9,636/year) in a bank account in student's own name or through an official university blocked account or notarized Annexe 32 sponsorship.";
    fundsBankMonths = "3 months personal bank statements showing min EUR 9,636 liquid balance in student's name OR approved university blocked account confirmation.";
    fundsSudden = "Bank account must be in the student's own name or substantiated by an approved Annexe 32 (Prise en charge pour études) legal pledge from an eligible guarantor.";
    fundsEx = "✅ Sahi: University admission certificate + blocked account EUR 9,636 receipt + health insurance. ❌ Galat: Unverified sponsor without official Annexe 32 approval.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('reunification')) {
    fundsMin = rawFunds || "Belgium Family Reunification Residence Permit (Article 10 / 10bis) requires sponsor residing in Belgium to demonstrate stable, regular and sufficient net monthly income (at least 120% of the Social Integration Income - min EUR 2,000+/month net) + adequate accommodation certified by lease/deed + Belgian mutual insurance coverage.";
    fundsBankMonths = "6-12 months sponsor payslips, Belgian personal income tax assessment (Avertissement-extrait de rôle / Aanslagbiljet), and bank statements.";
    fundsSudden = "Immigration Office (Office des Étrangers) calculates net regular income; CPAS / OCMW social welfare assistance disqualifies sponsorship.";
    fundsEx = "✅ Sahi: Net salary EUR 2,000+/month + registered lease + apostilled marriage/birth certificate. ❌ Galat: Net income below threshold or un-apostilled relationship documents.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('professional') || lowerCode.includes('carte')) {
    fundsMin = rawFunds || "Belgium Business Visitor / Carte Professionnelle (Professional Card) requires company registration with BCE/KBO (Banque-Carrefour des Entreprises) and, for self-employed persons, an approved Professional Card from SPF Economie / regional enterprise department demonstrating economic utility and investment capital.";
    fundsBankMonths = "3-6 months corporate and personal bank statements + BCE enterprise excerpt.";
    fundsSudden = "Host company must have active status in the Belgian Crossroads Bank for Enterprises (BCE/KBO).";
    fundsEx = "✅ Sahi: Official business invitation with BCE number + foreign company deputation OR approved Carte Professionnelle. ❌ Galat: Unregistered Belgian enterprise.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('card-l') || lowerCode.includes('card-k')) {
    fundsMin = rawFunds || "Belgium Permanent Residence (Card L - EU Long-Term Resident or Card K - Establishment Permit) requires 5 years continuous legal and uninterrupted residence in Belgium + stable financial means + sickness insurance + clean police background + integration proof (A2 language proficiency in Dutch, French, or German).";
    fundsBankMonths = "5 years tax assessment notices (Avertissement-extrait de rôle), continuous employment records, and clean criminal record.";
    fundsSudden = "Continuous residence evaluated by the municipal administration (Commune / Gemeente) and Federal Immigration Office.";
    fundsEx = "✅ Sahi: 5 years continuous residence + 5 years tax notices + A2 language certificate. ❌ Galat: Absences exceeding statutory limits (more than 6 consecutive months).";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

export interface RawBelgiumItem {
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

export const BE_92: RawBelgiumItem[] = [
  // ==========================================
  // TOURIST (18) - Schengen C Tourist & Short-Stay Visas Belgium
  // ==========================================
  {
    id: "be-TOU-001",
    officialCode: "BE-TOU-001",
    name: "Schengen C Tourist 90/180 Days Belgium C Tourist 90/180 - Most common Tourist Belgium Schengen",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C tourist Belgium 90/180 Schengen",
    validity: "90/180 C tourist Belgium Schengen - 29 countries valid",
    docs: "Passport 3M 2 blank + Photo 35x45 white Schengen + Flight return + Hotel all Belgium + Insurance EUR 30000 + Bank 3M + Employment NOC + Cover letter + C tourist Belgium application VFS Belgium",
    fundsBox: "EUR 95/day hotel + EUR 45/day host = Bank 3M EUR 95/day = C tourist Belgium Schengen",
    itrBox: "ITR 2Y required C tourist Belgium Schengen = VFS Belgium",
    bankBox: "Bank 3M last 3 months min EUR 3000 C tourist Belgium Schengen - No sudden deposit 1 day before ❌",
    warningBox: "✅ Most common tourist Belgium C Tourist 90/180 Schengen - VFS Belgium Delhi Mumbai - 29 countries valid - Annex 2 Belgium"
  },
  {
    id: "be-TOU-002",
    officialCode: "BE-TOU-002",
    name: "Schengen C Visiting Family Friends 90/180 Visitor Belgium Family Annexe 3bis",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C visiting family friends Belgium Annexe 3bis",
    validity: "90/180 C visiting family friends Belgium Schengen Annexe 3bis",
    docs: "Belgian host Annexe 3bis undertaking + Host Belgian ID + Relationship proof + Host financial payslips 3M + Accommodation proof Belgium + C visiting Belgium VFS - Annexe 3bis required",
    fundsBox: "Host income min EUR 2000/month for Annexe 3bis commitment or applicant EUR 45/day",
    warningBox: "MOST IMPORTANT: Annexe 3bis Prise en Charge - Form must be legalized at host's Belgian Commune"
  },
  {
    id: "be-TOU-003",
    officialCode: "BE-TOU-003",
    name: "Schengen C Cultural Sports & Artistic Event 90/180 Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C cultural sports Belgium Schengen",
    validity: "90/180 C cultural sports Belgium",
    docs: "Event organizer invitation Belgium + Cultural event proof + Sports federation accreditation + Flight return + Hotel + Insurance EUR 30000 + Bank 3M"
  },
  {
    id: "be-TOU-004",
    officialCode: "BE-TOU-004",
    name: "Airport Transit Visa Type A Belgium Airport Transit Hamad / Brussels Zaventem",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 Airport Transit Type A Belgium",
    validity: "24 Hours Airport Transit Type A Brussels Airport (BRU)",
    docs: "Passport + Confirmed onward flight ticket within 24H + Valid visa for final destination country + Transit Type A application VFS"
  },
  {
    id: "be-TOU-005",
    officialCode: "BE-TOU-005",
    name: "Schengen C Multi-Entry 1 Year Visa (90/180 Days Validity) Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C multi-entry 1Y Belgium Schengen",
    validity: "1 Year Multiple Entry (90 days per 180-day period)",
    docs: "Proof of 3 previous lawfully used Schengen visas within last 2 years + Financial sufficiency + Passport valid 15M + Multi-entry travel justification"
  },
  {
    id: "be-TOU-006",
    officialCode: "BE-TOU-006",
    name: "Schengen C Multi-Entry 2 Years Visa (Frequent Traveler Cascade Scheme) Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C multi-entry 2Y Belgium Schengen",
    validity: "2 Years Multiple Entry (90 days per 180-day period)",
    docs: "Proof of lawfully used 1-year multiple entry Schengen visa within previous 2 years + Clean compliance record + Comprehensive travel insurance"
  },
  {
    id: "be-TOU-007",
    officialCode: "BE-TOU-007",
    name: "Schengen C Multi-Entry 5 Years Visa (Maximum Validity Cascade Scheme) Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C multi-entry 5Y Belgium Schengen",
    validity: "5 Years Multiple Entry (90 days per 180-day period)",
    docs: "Proof of lawfully used 2-year multiple entry Schengen visa within previous 3 years + High financial standing + Stable employment / business in India"
  },
  {
    id: "be-TOU-008",
    officialCode: "BE-TOU-008",
    name: "ETIAS Travel Authorization 3 Years (Visa Waiver Scheme) Belgium",
    toCountry: "be",
    fromCountry: "us",
    category: "tourist",
    record_type: "ETA_VISA",
    fee: "EUR 7 ETIAS 3Y Authorization Belgium",
    validity: "3 Years or Passport Expiry (90/180 days per entry)",
    docs: "Biometric machine-readable passport + Online application via official ETIAS EU portal + Payment card (visa-exempt nationals)"
  },
  {
    id: "be-TOU-009",
    officialCode: "BE-TOU-009",
    name: "Belgium National D Long-Stay Visitor Visa 1 Year (Article 9 / 13 Stay Without Work)",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 180 National D Long-Stay Visitor Belgium",
    validity: "1 Year Long-Stay National D Visa (Renewable at Belgian Commune)",
    docs: "Proof of independent pension / passive income (min EUR 2,200/month) + Clean criminal record + Comprehensive medical insurance + Medical certificate approved doctor"
  },
  {
    id: "be-TOU-010",
    officialCode: "BE-TOU-010",
    name: "Schengen C Medical Treatment Short-Stay Visa 90/180 Belgium (Belgian Hospitals)",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C medical treatment Belgium Schengen",
    validity: "90/180 Days Medical Treatment Stay Belgium",
    docs: "Certificate from registered Belgian university hospital (UZ Leuven, UZ Gent, Erasme) + Estimated cost pre-payment confirmation + Medical history + Travel insurance"
  },
  {
    id: "be-TOU-011",
    officialCode: "BE-TOU-011",
    name: "Belgium Ardennes & Flanders Heritage Tourism Short-Stay C Visa",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C heritage tourism Belgium",
    validity: "Up to 90 Days Single/Double Entry Belgium",
    docs: "Confirmed hotel bookings across Bruges, Ghent, Antwerp & Ardennes region + Detailed cultural itinerary + Return air ticket + Bank 3M (EUR 95/day)"
  },
  {
    id: "be-TOU-012",
    officialCode: "BE-TOU-012",
    name: "Seafarer Transit Schengen C Visa (Port of Antwerp-Bruges Maritime Crew Transit)",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 Seafarer transit C Belgium",
    validity: "Up to 5 Days Transit to Vessel at Antwerp or Zeebrugge",
    docs: "Seafarer's Discharge Book (CDC) + Vessel flight itinerary + Belgian shipping agent guarantee letter + Port of Antwerp boarding declaration"
  },
  {
    id: "be-TOU-013",
    officialCode: "BE-TOU-013",
    name: "Official Government Delegation & Diplomatic Mission Schengen C Visa Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 0 / Exempt Official delegation Belgium",
    validity: "Duration of Official Mission Belgium / EU Institutions",
    docs: "Verbal note from Ministry of External Affairs + Official invitation from Belgian Federal Government or European Commission + Diplomatic/Official passport"
  },
  {
    id: "be-TOU-014",
    officialCode: "BE-TOU-014",
    name: "Schengen Cascade Multi-Year 3-Year Verified Tourist Visa Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C cascade 3Y Belgium Schengen",
    validity: "3 Years Multi-Entry (90 days per 180 days)",
    docs: "Passport valid 3.5Y + Consecutive Schengen visa compliance + Continuous Indian employment / business + Stamped bank statements 3M"
  },
  {
    id: "be-TOU-015",
    officialCode: "BE-TOU-015",
    name: "North Sea Coastal Cruise & River Transit C Visa Belgium (Zeebrugge / Ghent)",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C cruise transit Belgium Schengen",
    validity: "Duration of Cruise Itinerary (Single/Double/Multiple Entry)",
    docs: "Confirmed cruise itinerary starting or calling at Port of Zeebrugge or Antwerp + Cabin voucher + Flights + Insurance covering sea evacuation"
  },
  {
    id: "be-TOU-016",
    officialCode: "BE-TOU-016",
    name: "Group Travel & Tour Operator Approved Schengen C Visa Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C group tour Belgium",
    validity: "Duration of Package Tour Itinerary (Max 30 Days)",
    docs: "Approved tour operator group name list + VFS group appointment confirmation + Paid group hotel vouchers + Flight block reservation + Bank 3M"
  },
  {
    id: "be-TOU-017",
    officialCode: "BE-TOU-017",
    name: "Belgium Digital Nomad & Remote Worker National D Visa (1Y Foreign Sourced Income)",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "DIGITAL_NOMAD_VISA",
    fee: "EUR 180 National D Remote Worker Belgium",
    validity: "1 Year Long Stay Remote Work (Renewable)",
    docs: "Remote employment contract outside Belgium + Monthly income EUR 3,000+ + Health insurance + Police clearance + Lease contract in Belgium"
  },
  {
    id: "be-TOU-018",
    officialCode: "BE-TOU-018",
    name: "Schengen C Urgent Humanitarian & Compassionate Grounds Visa Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "EUR 90 C humanitarian Belgium",
    validity: "Up to 90 Days Short Stay Urgent Humanitarian",
    docs: "Urgent medical / bereavement notice from Belgian authority + Proof of family connection + Rapid processing authorization from Office des Étrangers"
  },

  // ==========================================
  // BUSINESS (8) - Business Visitor, Trade Fairs, Carte Professionnelle & Tech
  // ==========================================
  {
    id: "be-BUS-001",
    officialCode: "BE-BUS-001",
    name: "Belgium Business Visitor C 90/180 Business Visitor C 90/180 Business Belgium Business Visitor - Most common Business Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Business Visitor C Belgium",
    validity: "90/180 Business Visitor C Belgium",
    docs: "Belgian business invitation letter + BCE/KBO registration number of host + Foreign company dispatch letter + Business meeting agenda + Bank 3M + VFS appointment",
    warningBox: "✅ Most common business Belgium Business Visitor C 90/180 Schengen - VFS Belgium - BCE/KBO registration"
  },
  {
    id: "be-BUS-002",
    officialCode: "BE-BUS-002",
    name: "Belgium Professional Card Carte Professionnelle 1Y Professional Card 1Y Business Belgium Professional Card Self Employed",
    toCountry: "be",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 140 Professional Card 1Y Business Belgium Professional Card Self Employed",
    validity: "1 Year Professional Card 1Y Business Belgium Professional Card Self Employed Carte Professionnelle",
    docs: "Business plan Belgium Professional Card + Investment EUR 10000 + Professional Card application SPF Economie Belgium + Professional Card Carte Professionnelle 1Y application + Business Belgium Professional Card VFS - Self employed Belgium",
    warningBox: "MOST IMPORTANT: Carte Professionnelle (Beroepskaart) - Application submitted to regional authorities via SPF Economie"
  },
  {
    id: "be-BUS-003",
    officialCode: "BE-BUS-003",
    name: "Belgium Trade Fair C 90/180 Trade Fair C 90/180 Business Belgium Trade Fair",
    toCountry: "be",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 Trade Fair C Belgium",
    validity: "90/180 Trade Fair C Belgium",
    docs: "Trade fair invitation Belgium (Brussels Expo / Flanders Expo) + Exhibitor booth confirmation or visitor entrance pass + Dispatch letter + Bank 3M"
  },
  {
    id: "be-BUS-004",
    officialCode: "BE-BUS-004",
    name: "Belgium Executive Board Member & Corporate Director C Multi-Entry Visa",
    toCountry: "be",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 C executive director Belgium",
    validity: "1 to 5 Years Multi-Entry (90 days per 180 days)",
    docs: "Official extract from Belgian Moniteur Belge / Belgisch Staatsblad showing board directorship + BCE registration + Board resolution + Tax compliance"
  },
  {
    id: "be-BUS-005",
    officialCode: "BE-BUS-005",
    name: "Belgium Commercial Consulting, Auditing & Contract Negotiation C Visa",
    toCountry: "be",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 C consulting Belgium",
    validity: "90/180 Days Business Stay Belgium",
    docs: "Consulting framework agreement + Service mandate with Belgian corporate client + Dispatch letter stating non-Belgian payroll + Bank statements 3M"
  },
  {
    id: "be-BUS-006",
    officialCode: "BE-BUS-006",
    name: "Belgium Industrial Machinery Installation, After-Sales & Commissioning C Visa",
    toCountry: "be",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 C machinery commissioning Belgium",
    validity: "Up to 90 Days Technical Work (Exempt from Single Permit under 90 days)",
    docs: "Sales & supply contract for industrial equipment + Belgian buyer invitation + Proof of technical qualification + Limosa declaration receipt (mandatory in Belgium)"
  },
  {
    id: "be-BUS-007",
    officialCode: "BE-BUS-007",
    name: "Belgium Startup Entrepreneur & Tech Innovator Residence Permit (Regional Incubator)",
    toCountry: "be",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 350 Startup Residence Permit Belgium",
    validity: "1 Year Renewable Residence Permit",
    docs: "Endorsement letter from recognized Belgian tech incubator (imec.istart, Start it @KBC, Hub.brussels, WSL) + Business plan + EUR 18,600 startup capital proof"
  },
  {
    id: "be-BUS-008",
    officialCode: "BE-BUS-008",
    name: "Belgium Antwerp World Diamond Centre (AWDC) Gemological & Diamond Trade Business Visa",
    toCountry: "be",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "EUR 90 AWDC diamond trade Belgium",
    validity: "90/180 Days Diamond Trade Multiple Entry",
    docs: "AWDC accreditation or registered diamond bourse membership (Beurs voor Diamanthandel / Diamantclub van Antwerpen) + Bourse invitation + KPCS compliance declaration"
  },

  // ==========================================
  // WORK (26) - Belgium Single Permit, Highly Skilled, EU Blue Card, Regions
  // ==========================================
  {
    id: "be-WRK-001",
    officialCode: "BE-WRK-001",
    name: "Belgium Single Permit 1Y Single Permit 1Y Work Belgium - Most common Work Belgium Single Permit Brussels Flanders Wallonia",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Single Permit 1Y Work Belgium Single Permit Work Brussels Flanders Wallonia",
    validity: "1 Year Single Permit 1Y Work Belgium Single Permit Brussels Flanders Wallonia",
    docs: "Job contract Belgium Single Permit + Employment contract Belgium Single Permit + Employer regional authority approval Brussels Flanders Wallonia + Diploma + Single Permit Annex 46 application + Job offer Belgium Single Permit + Employer Single Permit Belgium",
    fundsBox: "Salary min EUR 28000/year Single Permit 1Y Belgium Work Permit Single Permit - Regional minimum wage - Brussels Flanders Wallonia",
    warningBox: "✅ Most common work Belgium Single Permit 1Y - Employer applies region Brussels/Flanders/Wallonia for work authorization + Single Permit residence - Annex 46 Belgium"
  },
  {
    id: "be-WRK-002",
    officialCode: "BE-WRK-002",
    name: "Belgium Highly Skilled Single Permit 1Y Highly Skilled Single Permit 1Y Work Belgium Highly Skilled Flanders Brussels Wallonia",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Highly Skilled Single Permit 1Y Work Belgium Highly Skilled",
    validity: "1 Year Highly Skilled Single Permit 1Y Work Belgium Highly Skilled Flanders Brussels Wallonia",
    docs: "Highly skilled job offer Belgium + Degree + Salary EUR 47000 Flanders / EUR 45000 Brussels / EUR 42000 Wallonia + Highly Skilled Single Permit + Highly Skilled Single Permit Annex 46 Belgium + Degree + Salary threshold regional"
  },
  {
    id: "be-WRK-003",
    officialCode: "BE-WRK-003",
    name: "Belgium EU Blue Card 2Y EU Blue Card 2Y Work Belgium EU Blue Card Highly Qualified",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 EU Blue Card 2Y Work Belgium EU Blue Card",
    validity: "2 Years EU Blue Card 2Y Work Belgium EU Blue Card",
    docs: "Higher education degree (min 3 years) + Binding job contract 1Y+ + Salary EUR 62,233/year (2024 threshold) + Regional approval + EU Blue Card Annex 46 Single Permit"
  },
  {
    id: "be-WRK-004",
    officialCode: "BE-WRK-004",
    name: "Belgium Intra Company Transfer ICT 3Y Intra Company Transfer ICT 3Y Work Belgium ICT Manager Specialist Trainee",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 ICT 3Y Work Belgium Intra Company Transfer",
    validity: "3 Years Intra Company Transfer ICT 3Y Work Belgium ICT Manager Specialist Trainee",
    docs: "ICT permit Belgium + Intra company transfer assignment letter + Home employment contract (min 3-6 months seniority) + Belgian entity BCE proof + ICT Annex 46"
  },
  {
    id: "be-WRK-005",
    officialCode: "BE-WRK-005",
    name: "Belgium Au Pair 1Y Au Pair 1Y Work Belgium Au Pair Family",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 180 Au Pair 1Y Work Belgium Au Pair",
    validity: "1 Year Au Pair 1Y Work Belgium Au Pair Family",
    docs: "Au Pair placement agreement + Host family approval from regional authority + Age 18-26 + Enrolment in Belgian official language course (Dutch/French) + Medical certificate"
  },
  {
    id: "be-WRK-006",
    officialCode: "BE-WRK-006",
    name: "Belgium Seasonal Work Permit 6M Seasonal Work Permit 6M Work Belgium Seasonal Agriculture",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Seasonal Work Permit 6M Work Belgium Seasonal",
    validity: "6 Months Seasonal Work Permit 6M Work Belgium Seasonal Agriculture",
    docs: "Seasonal job offer Belgium + Seasonal agricultural contract + Adequate accommodation proof provided by employer + Seasonal Work Annex 46 Belgium"
  },
  {
    id: "be-WRK-007",
    officialCode: "BE-WRK-007",
    name: "Belgium Researcher 1Y Researcher 1Y Work Belgium Researcher Hosting Agreement",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Researcher 1Y Work Belgium Researcher",
    validity: "1 Year Researcher 1Y Work Belgium Researcher Hosting Agreement",
    docs: "Hosting agreement with Belgian accredited research organization + Master's degree or PhD credentials + Financial guarantee from institution + Researcher Annex 46 Single Permit"
  },
  {
    id: "be-WRK-008",
    officialCode: "BE-WRK-008",
    name: "Belgium Professional Card Self Employed 1Y Professional Card Self Employed 1Y Work Belgium Self Employed Carte Professionnelle",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 140 Professional Card Self Employed 1Y Work Belgium Self Employed",
    validity: "1 Year Professional Card Self Employed 1Y Work Belgium Self Employed Carte Professionnelle",
    docs: "Business plan Belgium Professional Card Self Employed + Professional Card application SPF Economie + BCE enterprise registration + National D visa application VFS"
  },
  {
    id: "be-WRK-009",
    officialCode: "BE-WRK-009",
    name: "Belgium Flanders Flemish Bottleneck Profession Single Permit (Knelpuntberoep VDAB List)",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Flanders bottleneck permit",
    validity: "1 Year Renewable Single Permit Flanders",
    docs: "Job offer on official Flemish bottleneck list (VDAB Knelpuntberoepenlijst) + Employer application via Working in Flanders portal + Proof of vocational qualifications"
  },
  {
    id: "be-WRK-010",
    officialCode: "BE-WRK-010",
    name: "Belgium Wallonia Regional Shortage Occupation Single Permit (Métiers en Pénurie Forem List)",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Wallonia shortage permit",
    validity: "1 Year Renewable Single Permit Wallonia",
    docs: "Employment contract for shortage occupation published by Le Forem + SPW Wallonie employment approval + Technical diploma + Annex 46 Single Permit"
  },
  {
    id: "be-WRK-011",
    officialCode: "BE-WRK-011",
    name: "Belgium Brussels Capital Region Single Permit (Actiris Critical Occupation List)",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Brussels Capital Single Permit",
    validity: "1 Year Renewable Single Permit Brussels",
    docs: "Contract with Brussels enterprise + Brussels Economy & Employment regional work authorization + Actiris shortage certification + Annex 46"
  },
  {
    id: "be-WRK-012",
    officialCode: "BE-WRK-012",
    name: "Belgium Healthcare & Medical Specialist Single Permit (FPS Health / INAMI / RIZIV License)",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Healthcare Single Permit Belgium",
    validity: "1 to 2 Years Renewable Single Permit",
    docs: "Belgian visa to practice medicine from FPS Public Health (Visa de pratique) + INAMI / RIZIV registration + Hospital employment contract + Degree equivalence"
  },
  {
    id: "be-WRK-013",
    officialCode: "BE-WRK-013",
    name: "Belgium IT, Cloud Architecture & Software Engineering Specialist Single Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 IT Specialist Single Permit Belgium",
    validity: "1 to 3 Years Renewable Single Permit",
    docs: "Tech employment contract with Belgian employer + Computer science degree or 3+ years verified experience + Salary meeting regional highly skilled threshold"
  },
  {
    id: "be-WRK-014",
    officialCode: "BE-WRK-014",
    name: "Belgium Senior Executive & Management Single Permit (Personnel de Direction / Leidinggevend)",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Executive Single Permit Belgium",
    validity: "1 to 3 Years Executive Stay Belgium",
    docs: "Senior management employment contract + Gross annual salary EUR 75,000+ + Company board resolution + Corporate registration in BCE"
  },
  {
    id: "be-WRK-015",
    officialCode: "BE-WRK-015",
    name: "Belgium Working Holiday Scheme 1Y (Bilateral Youth Exchange 18-30 Years)",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 180 Working Holiday Visa Belgium",
    validity: "1 Year Non-Renewable Working Holiday",
    docs: "Valid passport + Age 18-30 years + Return flight ticket + Living funds EUR 2,500 + Medical certificate + Comprehensive insurance for 1 year"
  },
  {
    id: "be-WRK-016",
    officialCode: "BE-WRK-016",
    name: "Belgium Professional Trainee & Internship Single Permit (Convention de Stage Post-Graduate)",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Trainee Single Permit Belgium",
    validity: "Up to 1 Year Practical Training",
    docs: "Tripartite internship agreement (Convention de stage) between student, university/institution, and Belgian company + Living allowance + Health insurance"
  },
  {
    id: "be-WRK-017",
    officialCode: "BE-WRK-017",
    name: "Belgium Professional Athlete & Sports Coach Single Permit (Belgian Sports Federation)",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Athlete Single Permit Belgium",
    validity: "1 Year / Contract Season Duration",
    docs: "Contract with registered Belgian professional sports club + Endorsement from Belgian Sports Federation (URBSFA / KBVB, etc.) + Medical fitness certificate"
  },
  {
    id: "be-WRK-018",
    officialCode: "BE-WRK-018",
    name: "Belgium University Professor, Lecturer & Academic Faculty Single Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Academic Faculty Single Permit",
    validity: "1 to 3 Years Academic Appointment",
    docs: "Academic appointment letter from recognized Belgian university (KU Leuven, UGent, etc.) + PhD diploma + Exemption from labour market testing + Annex 46"
  },
  {
    id: "be-WRK-019",
    officialCode: "BE-WRK-019",
    name: "Belgium Performing Artist & Cultural Professional Single Permit (Approved Artistic Entity)",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Artist Single Permit Belgium",
    validity: "Duration of Artistic Contract / Up to 1 Year",
    docs: "Engagement contract with recognized Belgian arts centre, opera, orchestra, or theatre + Artistic credentials + Remuneration meeting sector minimum"
  },
  {
    id: "be-WRK-020",
    officialCode: "BE-WRK-020",
    name: "Belgium Construction, Civil Engineering & Heavy Industry Skilled Worker Single Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Construction Single Permit Belgium",
    validity: "1 Year Renewable Single Permit",
    docs: "Employment contract with registered Belgian construction firm (Constructiv) + Regional work permit approval + Safety training certificate + Clean criminal check"
  },
  {
    id: "be-WRK-021",
    officialCode: "BE-WRK-021",
    name: "Belgium Port of Antwerp-Bruges Maritime Logistics & Terminal Operations Specialist Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Port Logistics Single Permit",
    validity: "1 to 2 Years Renewable Single Permit",
    docs: "Specialist logistics contract with terminal operator at Port of Antwerp-Bruges + Maritime logistics qualifications + Regional work clearance"
  },
  {
    id: "be-WRK-022",
    officialCode: "BE-WRK-022",
    name: "Belgium BioTech, Life Sciences & Pharmaceutical Specialist Single Permit (BioWin / Flanders.bio)",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 BioTech Specialist Single Permit",
    validity: "1 to 3 Years Renewable Single Permit",
    docs: "Job offer from Belgian pharma / biotech company (GSK, Janssen Pharmaceutica, UCB) + Master's / PhD in life sciences + Highly skilled salary threshold"
  },
  {
    id: "be-WRK-023",
    officialCode: "BE-WRK-023",
    name: "Belgium European Solidarity Corps & Non-Profit Volunteer Service Permit 1Y",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 180 Volunteer Residence Permit Belgium",
    validity: "Up to 1 Year Non-Profit Volunteering",
    docs: "Volunteering agreement with accredited Belgian non-profit organisation + Board, lodging and pocket money guarantee + Comprehensive sickness insurance"
  },
  {
    id: "be-WRK-024",
    officialCode: "BE-WRK-024",
    name: "Belgium Recognized Religious Minister & Pastoral Clergy Work Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Religious Minister Permit Belgium",
    validity: "1 to 2 Years Pastoral Assignment",
    docs: "Official certificate of recognized worship from representative body (Catholic, Protestant, Orthodox, Islamic, Jewish, Anglican) + Living subsistence guarantee"
  },
  {
    id: "be-WRK-025",
    officialCode: "BE-WRK-025",
    name: "Belgium Accredited Foreign Journalist & International Press Correspondent National D Visa",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 180 Foreign Journalist D Visa Belgium",
    validity: "1 Year Press Accreditation Assignment Belgium / EU",
    docs: "Press accreditation card from Belgian FPS Foreign Affairs or International Press Centre (IPC) Brussels + Foreign news agency contract + Financial proof"
  },
  {
    id: "be-WRK-026",
    officialCode: "BE-WRK-026",
    name: "Belgium Belgian University Graduate Job Search Orientation Year (Search Year / Année d'Orientation 1Y)",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "EUR 350 Search Year Orientation Belgium",
    validity: "12 Months Post-Graduation Search Year (Zoekjaar)",
    docs: "Graduation diploma from Belgian higher education institution (Bachelor, Master, or PhD) + Health insurance + Proof of living funds EUR 803/month"
  },

  // ==========================================
  // STUDENT (14) - Higher Education, Doctoral, Search Year & Exchanges
  // ==========================================
  {
    id: "be-STU-001",
    officialCode: "BE-STU-001",
    name: "Belgium Student Residence Permit 1Y Student Residence Permit 1Y Student Belgium - Most common Student Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Student Residence Permit 1Y Student Belgium",
    validity: "1 Year Student Residence Permit 1Y Student Belgium",
    docs: "Admission letter Belgium higher education + University admission Belgium + Tuition fee receipt Belgium + Funds proof Belgium student EUR 800/month + Accommodation Belgium student + Student residence permit Annex 32 application + Funds proof Belgium student + Admission letter + Student Belgium VFS",
    fundsBox: "Funds EUR 800/month = EUR 9600/year Student Residence Permit 1Y Student Belgium = Blocked account EUR 9600 or Annex 32 sponsor",
    warningBox: "✅ Most common student Belgium Student Residence Permit 1Y - Annex 32 Belgium - Work 20H/week allowed - University sponsor - VFS Belgium"
  },
  {
    id: "be-STU-002",
    officialCode: "BE-STU-002",
    name: "Belgium Student Residence Permit Researcher 1Y Researcher Student Residence Permit 1Y Student Belgium Researcher PhD",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Researcher Student Residence Permit 1Y Student Belgium Researcher PhD",
    validity: "1 Year Researcher Student Residence Permit 1Y Student Belgium Researcher PhD",
    docs: "PhD admission Belgium + Researcher hosting agreement Belgium + PhD stipend + Researcher Student Residence Permit Annex 32 Belgium"
  },
  {
    id: "be-STU-003",
    officialCode: "BE-STU-003",
    name: "Belgium Student Job Seeking Year 1Y Job Seeking Year 1Y Student Belgium Graduate Orientation Year",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Job Seeking Year 1Y Student Belgium Graduate Orientation",
    validity: "1 Year Job Seeking Year 1Y Student Belgium Graduate Orientation Year",
    docs: "Belgian degree completion + Job Seeking Year application + Orientation Year Annex 32 Belgium - Job seeking after study Belgium"
  },
  {
    id: "be-STU-004",
    officialCode: "BE-STU-004",
    name: "Belgium Master's Degree Student Residence Permit 1Y-2Y",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Master's Student Permit Belgium",
    validity: "1 to 2 Years Master's Program Duration",
    docs: "Official unconditional admission to Master's program at recognized Belgian university + Bachelor's degree equivalence + Tuition fee payment proof + Blocked account"
  },
  {
    id: "be-STU-005",
    officialCode: "BE-STU-005",
    name: "Belgium Bachelor's Degree Student Residence Permit 1Y (KU Leuven, UGent, ULB, UCLouvain)",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Bachelor's Student Permit Belgium",
    validity: "1 Year Renewable Bachelor's Stay",
    docs: "Secondary school graduation certificate with official recognition by Flemish or Wallonia-Brussels Community + University admission + Living funds EUR 803/month"
  },
  {
    id: "be-STU-006",
    officialCode: "BE-STU-006",
    name: "Belgium Erasmus+ & European Exchange Student Residence Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Erasmus+ Exchange Permit Belgium",
    validity: "Semester / Academic Year (5 to 10 Months)",
    docs: "Erasmus+ learning agreement signed by home and Belgian host university + Erasmus grant certificate + Accommodation agreement + Health insurance"
  },
  {
    id: "be-STU-007",
    officialCode: "BE-STU-007",
    name: "Belgium Doctoral Salaried Assistant / Aspirant FWO / FNRS Fellowship Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Doctoral Fellow Permit Belgium",
    validity: "1 to 4 Years Doctoral Fellowship Duration",
    docs: "FWO (Research Foundation Flanders) or FNRS (Fonds de la Recherche Scientifique) doctoral grant contract + University matriculation + Tax-exempt research stipend"
  },
  {
    id: "be-STU-008",
    officialCode: "BE-STU-008",
    name: "Belgium Advanced Master & Specialized Degree Student Permit (Manama / Master Complémentaire)",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Advanced Master Student Permit",
    validity: "1 Year Advanced Master's Stay",
    docs: "Admission to Advanced Master (Master-na-Master / Master de spécialisation) + Initial Master's degree + Tuition payment receipt + Living funds proof"
  },
  {
    id: "be-STU-009",
    officialCode: "BE-STU-009",
    name: "Belgium University Preparatory Language Year Permit (Dutch / French Immersion 1Y)",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Preparatory Language Permit Belgium",
    validity: "1 Year Preparatory Language Study",
    docs: "Conditional university admission requiring language level B2/C1 + Registration at university language institute (ILV UCLouvain, CLT Leuven, UCT Gent) + Blocked account"
  },
  {
    id: "be-STU-010",
    officialCode: "BE-STU-010",
    name: "Belgium Higher Vocational & Technical Institute Residence Permit (Hogeschool / Haute École)",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Vocational Higher Ed Permit Belgium",
    validity: "1 Year Renewable Vocational Stay",
    docs: "Enrollment at recognized Belgian University of Applied Sciences (Hogeschool or Haute École) + Diploma equivalence + Living expense guarantee"
  },
  {
    id: "be-STU-011",
    officialCode: "BE-STU-011",
    name: "Belgium Short-Stay Academic & Summer / Winter School Schengen C Visa",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 90 Academic Summer School C Visa",
    validity: "Up to 90 Days Course Duration",
    docs: "Summer/Winter school acceptance letter from Belgian academic institution + Course fees receipt + Hotel/campus accommodation proof + Bank 3M"
  },
  {
    id: "be-STU-012",
    officialCode: "BE-STU-012",
    name: "Belgium Master's Dissertation Extension & Mandatory Curriculum Internship Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Thesis Extension Permit Belgium",
    validity: "6 to 12 Months Thesis Completion Stay",
    docs: "Official university letter confirming thesis delay / mandatory internship requirement + Academic supervisor endorsement + Continued financial sufficiency"
  },
  {
    id: "be-STU-013",
    officialCode: "BE-STU-013",
    name: "Belgium Post-Doctoral Research Fellow & International Scholar Mobility Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Post-Doc Research Permit Belgium",
    validity: "1 to 2 Years Post-Doctoral Research",
    docs: "Hosting agreement with Belgian university research faculty + Post-doctoral fellowship grant letter + PhD diploma + Comprehensive sickness insurance"
  },
  {
    id: "be-STU-014",
    officialCode: "BE-STU-014",
    name: "Belgium Double & Joint Master's Degree Mobility Programme Residence Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "EUR 350 Joint Master's Mobility Permit",
    validity: "Academic Year Mobility Period (1Y)",
    docs: "Joint degree consortium agreement + Admission from participating Belgian university + Intra-EU student mobility notification + Health insurance"
  },

  // ==========================================
  // FAMILY (14) - Reunification, EU Citizen Family, Cohabitation & Children
  // ==========================================
  {
    id: "be-FAM-001",
    officialCode: "BE-FAM-001",
    name: "Belgium Family Reunification Spouse 1Y Family Reunification Spouse 1Y Family Belgium - Most common Family Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 200 Family Reunification Spouse 1Y Family Belgium Spouse",
    validity: "1 Year Family Reunification Spouse 1Y Family Belgium Spouse",
    docs: "Spouse Belgian residence + Marriage certificate attested + Relationship proof + Financial means EUR 2000/month sponsor + Accommodation Belgium + Health insurance + Family Reunification Spouse Annex 15 application Belgium VFS + Financial + Accommodation Belgium",
    fundsBox: "Sponsor income EUR 2000/month net Family Reunification Spouse 1Y Family Belgium - EUR 2000/month sponsor net + Accommodation adequate",
    warningBox: "✅ Most common family Belgium Family Reunification Spouse 1Y - Income EUR 2000/month + Accommodation + Annex 15 Belgium - VFS Belgium"
  },
  {
    id: "be-FAM-002",
    officialCode: "BE-FAM-002",
    name: "Belgium Family Reunification Child 1Y Family Reunification Child 1Y Family Belgium Child",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 200 Family Reunification Child 1Y Family Belgium Child",
    validity: "1 Year Family Reunification Child 1Y Family Belgium Child",
    docs: "Parent Belgian residence + Birth certificate attested + Parent custody + Family Reunification Child Annex 15 Belgium VFS",
    fundsBox: "Sponsor parent must demonstrate legal custody and adequate family accommodation in Belgium"
  },
  {
    id: "be-FAM-003",
    officialCode: "BE-FAM-003",
    name: "Belgium Family Member EU Citizen Card F 5Y Family Member EU Citizen Card F 5Y Family Belgium EU Citizen Family",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free Family Member EU Citizen Card F 5Y Family Belgium EU Citizen",
    validity: "5 Years Family Member EU Citizen Card F 5Y Family Belgium EU Citizen Family",
    docs: "EU citizen family member in Belgium + Relationship proof + EU citizen residence Belgium + Family Member EU Citizen Card F Annex 15 Belgium VFS - Free EU family",
    warningBox: "Directive 2004/38/EC - Card F granted to third-country family members of EU citizens exercising treaty rights in Belgium"
  },
  {
    id: "be-FAM-004",
    officialCode: "BE-FAM-004",
    name: "Belgium Legal Cohabitant Partner Residence Permit 1Y (Cohabitation Légale / Samenwoning)",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 200 Cohabitation Partner Permit Belgium",
    validity: "1 Year Renewable Residence Permit (Card A / Card F)",
    docs: "Declaration of legal cohabitation registered at Belgian Commune + Proof of stable and durable relationship (2 years cohabitation or common child) + Sponsor income EUR 2,000+/month"
  },
  {
    id: "be-FAM-005",
    officialCode: "BE-FAM-005",
    name: "Belgium Family Member of Belgian Citizen Card F 5Y (Article 40ter Belgian Nationality Act)",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free / Nominal Family Member of Belgian Citizen Card F",
    validity: "5 Years Residence Permit Card F",
    docs: "Belgian citizen national ID or passport + Apostilled marriage certificate or birth certificate + Belgian citizen income EUR 2,000+/month + Mutuelle insurance"
  },
  {
    id: "be-FAM-006",
    officialCode: "BE-FAM-006",
    name: "Belgium Highly Skilled Single Permit & EU Blue Card Dependent Family Residence Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 200 Highly Skilled Family Permit Belgium",
    validity: "Co-terminus with Principal Applicant's Single Permit",
    docs: "Principal applicant's Single Permit Annex 46 / EU Blue Card + Marriage/birth certificates + Simultaneous family application in Enter Belgium portal + Health coverage"
  },
  {
    id: "be-FAM-007",
    officialCode: "BE-FAM-007",
    name: "Belgium University Student & PhD Researcher Dependent Family Residence Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 200 Student Dependent Family Permit",
    validity: "Co-terminus with Student / PhD Permit (1Y Renewable)",
    docs: "Student sponsor's residence permit + Proof of sufficient living means (student subsistence EUR 803 + family supplement min EUR 400/dependent) + Adequate apartment lease"
  },
  {
    id: "be-FAM-008",
    officialCode: "BE-FAM-008",
    name: "Belgium Dependent Ascendant Parent Family Reunification (Elderly Dependent Parents)",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 200 Dependent Parent Permit Belgium",
    validity: "1 Year Renewable Residence Permit",
    docs: "Proof of financial and medical dependency on Belgian sponsor + No other caregiver in country of origin + Sponsor comprehensive medical insurance + Proof of accommodation"
  },
  {
    id: "be-FAM-009",
    officialCode: "BE-FAM-009",
    name: "Belgium Newborn Child Registration & Residence Permit (Commune / Administration Communale)",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free / Nominal Commune Registration Newborn",
    validity: "Co-terminus with Parents' Belgian Residence Permit",
    docs: "Belgian birth act issued by municipal civil registrar (Acte de naissance / Geboorteakte) + Parents' residence permits + National Register inscription"
  },
  {
    id: "be-FAM-010",
    officialCode: "BE-FAM-010",
    name: "Belgium Independent Residence Permit Post-Divorce / Domestic Violence Protection",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 200 Independent Humanitarian Permit Belgium",
    validity: "1 Year Independent Renewable Residence Permit",
    docs: "Proof of dissolution of marriage or police reports / medical evidence of domestic violence under Article 11 Immigration Act + Proof of employment or independent subsistence"
  },
  {
    id: "be-FAM-011",
    officialCode: "BE-FAM-011",
    name: "Belgium Legally Adopted Child Family Reunification Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 200 Adopted Child Permit Belgium",
    validity: "1 to 5 Years Residence Permit (Card A / Card F)",
    docs: "Official international adoption decree recognized by the Belgian Central Authority (Autorité Centrale Communautaire) + Adoptive parents' Belgian status + Sickness insurance"
  },
  {
    id: "be-FAM-012",
    officialCode: "BE-FAM-012",
    name: "Belgium Carte Professionnelle Self-Employed Entrepreneur Family Dependent Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "EUR 200 Entrepreneur Family Permit Belgium",
    validity: "Co-terminus with Entrepreneur's Carte Professionnelle",
    docs: "Principal applicant's Carte Professionnelle + Corporate tax returns + Personal dividend / salary statement proving min EUR 2,000+/month net + Marriage / birth certificates"
  },
  {
    id: "be-FAM-013",
    officialCode: "BE-FAM-013",
    name: "Belgium Unaccompanied Minor Protection & Legal Guardian Residence Permit",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free Minor Humanitarian Protection Belgium",
    validity: "Duration of Minority (Until 18 Years)",
    docs: "Guardianship decree designated by the Belgian Guardianship Service (Service des Tutelles / Dienst Voogdij) + Social inquiry report + Identity documentation"
  },
  {
    id: "be-FAM-014",
    officialCode: "BE-FAM-014",
    name: "Belgium Family Member Automatic Labour Market Access (Work Authorization on Card F / Card A)",
    toCountry: "be",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "Free Work Authorization for Family Members",
    validity: "Co-terminus with Family Residence Card",
    docs: "Valid Card F (Family Member of EU/Belgian citizen) or Card A (Single Permit spouse) + Unrestricted labour market access without separate employer work permit"
  },

  // ==========================================
  // PR (12) - Permanent Residence Cards L & K, Naturalization & Long-Term
  // ==========================================
  {
    id: "be-PR-001",
    officialCode: "BE-PR-001",
    name: "Belgium Permanent Residence Card L 5Y Permanent Residence Card L 5Y PR Belgium - 5 Years Residence",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Permanent Residence Card L 5Y PR Belgium Card L",
    validity: "5 Years Permanent Residence Card L 5Y PR Belgium Card L - EU Long Term",
    docs: "Residence 5Y Belgium + Permanent residence + No gaps + Permanent Residence Card L application commune Belgium + 5 years continuous + Self-support + Permanent Residence Card L Belgium Card L EU Long Term",
    fundsBox: "Residence 5Y continuous Belgium Permanent Residence Card L 5Y PR Belgium + Self-support + No crime",
    warningBox: "✅ Most common PR Belgium Permanent Residence Card L 5Y - 5Y continuous + EU Long Term Residence + Card L Belgium commune"
  },
  {
    id: "be-PR-002",
    officialCode: "BE-PR-002",
    name: "Belgium Permanent Residence Card K 10Y Permanent Residence Card K 10Y PR Belgium Card K",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Permanent Residence Card K 10Y PR Belgium Card K",
    validity: "10 Years Permanent Residence Card K 10Y PR Belgium Card K - Belgian Permanent",
    docs: "Permanent residence 5Y Belgium + Permanent Residence Card K application commune Belgium + Card K Belgium + Belgian Permanent Card K",
    warningBox: "Establishment Permit (Vestigingsvergunning / Établissement) - Card K valid for 10 years and renewed automatically"
  },
  {
    id: "be-PR-003",
    officialCode: "BE-PR-003",
    name: "Belgium Citizenship Naturalization 5Y Citizenship Naturalization 5Y PR Belgium Citizenship - 5 Years",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Citizenship Naturalization 5Y PR Belgium Citizenship",
    validity: "Permanent Citizenship Naturalization 5Y PR Belgium Citizenship",
    docs: "Residence 5Y Belgium + Language French/Dutch/German A2 + Integration + Economic participation + No crime + Citizenship application commune Belgium + 5Y residence + Language A2 + Citizenship Belgium",
    fundsBox: "Economic participation: 468 days of employment or 6 quarters of self-employed social contributions during past 5 years"
  },
  {
    id: "be-PR-004",
    officialCode: "BE-PR-004",
    name: "Belgium EU Blue Card 4Y EU Blue Card 4Y PR Belgium Blue Card EU",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 350 EU Blue Card 4Y PR Belgium Blue Card EU",
    validity: "4 Years EU Blue Card 4Y PR Belgium Blue Card EU",
    docs: "Higher education + Job offer EUR 62000 Belgium Blue Card + Blue Card Annex 46 Belgium + Blue Card EU Belgium"
  },
  {
    id: "be-PR-005",
    officialCode: "BE-PR-005",
    name: "Belgium Single Permit Extension Single Permit Extension PR Belgium Extension",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 350 Single Permit Extension PR Belgium Extension",
    validity: "Single Permit Extension PR Belgium Extension",
    docs: "Single permit renewal + Extension Annex 46 Belgium + Extension PR Belgium"
  },
  {
    id: "be-PR-006",
    officialCode: "BE-PR-006",
    name: "Belgium Card EU+ / F+ Permanent Residence for EU Family Members (10Y Validity)",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "Free Permanent Residence Card F+ / EU+",
    validity: "10 Years Permanent Residence Card F+",
    docs: "5 years continuous lawful stay in Belgium on Card F + Continued family relationship with EU citizen + Registration at municipal administration"
  },
  {
    id: "be-PR-007",
    officialCode: "BE-PR-007",
    name: "Belgium Belgian University Degree Fast-Track Long-Term Residence (Card L Accumulation)",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Card L Degree Fast-Track",
    validity: "5 Years Permanent Residence Card L",
    docs: "Belgian university diploma (half student years counted towards 5-year requirement under Directive 2003/109/EC) + 2 years work on Single Permit + Clean criminal record"
  },
  {
    id: "be-PR-008",
    officialCode: "BE-PR-008",
    name: "Belgium Spousal Fast-Track Belgian Nationality (5 Years Joint Residence & Social Integration)",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 150 Registration Fee Nationality Declaration",
    validity: "Permanent Belgian Passport & Citizenship",
    docs: "Marriage with Belgian citizen for 3+ years + 5 years lawful residence in Belgium + A2 language certificate (Dutch, French, or German) + Social integration certificate"
  },
  {
    id: "be-PR-009",
    officialCode: "BE-PR-009",
    name: "Belgium Reacquisition & Recovery of Belgian Nationality (Former Belgian Citizens)",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 150 Recovery of Nationality",
    validity: "Permanent Reinstated Belgian Citizenship",
    docs: "Proof of former Belgian nationality + 12 months continuous uninterrupted principal residence in Belgium on unlimited stay permit + Clean criminal record"
  },
  {
    id: "be-PR-010",
    officialCode: "BE-PR-010",
    name: "Belgium Second-Generation Belgian-Born Adult Nationality Declaration (Article 12bis)",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 150 Declaration Fee",
    validity: "Permanent Belgian Citizenship by Birth & Residence",
    docs: "Born in Belgium + Continuous legal residence in Belgium since birth until age 18 + Uninterrupted municipal registration + Clean background check"
  },
  {
    id: "be-PR-011",
    officialCode: "BE-PR-011",
    name: "Belgium Unlimited Work Authorization (Permis de Travail Illimité / Onbeperkte Toelating)",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Unlimited Labour Access",
    validity: "Indefinite Work Rights across Belgium",
    docs: "Completion of 4 years work on Single Permit + Valid residence permit + Automatic employer exemption granted by regional work departments"
  },
  {
    id: "be-PR-012",
    officialCode: "BE-PR-012",
    name: "Belgium Absence Dispensation & Right of Return (Droit de Retour / Recht op Terugkeer Non-Lapse)",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "EUR 0 Right of Return Certificate",
    validity: "Preserves Permanent Residence up to 1-2 Years Abroad",
    docs: "Prior notification of departure to Belgian Commune (Annexe 18) before leaving + Valid Card K or Card L + Justification for foreign posting, study, or medical treatment"
  }
];

// Supporting classifications & legacy systems
export const SUPPORTING_AND_LEGACY_BE: RawBelgiumItem[] = [
  {
    id: "be-SUP-001",
    officialCode: "BE-SUP-001",
    name: "Belgium Single Permit Regional Authorities (Flanders, Brussels Economy & SPW Wallonia)",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Flemish Department of Work, Brussels Economy & Employment, and SPW Wallonie - Evaluate labour market criteria and issue regional work authorization"
  },
  {
    id: "be-SUP-002",
    officialCode: "BE-SUP-002",
    name: "Belgium Carte Professionnelle / Beroepskaart Authority (SPF Economie)",
    toCountry: "be",
    fromCountry: "in",
    category: "business",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "SPF Economie & regional departments for self-employed enterprise - Review economic utility, business plans, and issue professional cards"
  },
  {
    id: "be-SUP-003",
    officialCode: "BE-SUP-003",
    name: "Belgium Crossroads Bank for Enterprises (BCE / KBO - Banque-Carrefour des Entreprises)",
    toCountry: "be",
    fromCountry: "in",
    category: "business",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "BCE / KBO = Official Belgian federal enterprise register allocating unique enterprise numbers (numéro d'entreprise) required for all business visas"
  },
  {
    id: "be-SUP-004",
    officialCode: "BE-SUP-004",
    name: "Belgium Annexe 3bis / Prise en Charge Sponsorship Undertaking Protocol",
    toCountry: "be",
    fromCountry: "in",
    category: "tourist",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Official financial undertaking form legalized by host's local Belgian Commune guaranteeing medical, living, and repatriation expenses"
  },
  {
    id: "be-SUP-005",
    officialCode: "BE-SUP-005",
    name: "Belgium Municipal Administration (Commune / Gemeente) & National Register Inscription",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Local municipal administration responsible for police residency check, issuing electronic residence cards (Card A, K, L, F), and civil registration"
  },
  {
    id: "be-SUP-006",
    officialCode: "BE-SUP-006",
    name: "Belgium Federal Immigration Office (Office des Étrangers / Dienst Vreemdelingenzaken - FPS Interior)",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "SUPPORTING_CLASSIFICATION",
    fee: "-",
    validity: "-",
    docs: "Federal authority with exclusive jurisdiction over entry, stay, residence authorization, and expulsion of foreign nationals in Belgium"
  },
  {
    id: "be-LEG-001",
    officialCode: "BE-LEG-001",
    name: "Legacy Work Permit A Old System (Replaced by Modern Single Permit Indefinite Scheme) Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "work",
    record_type: "LEGACY_VISA",
    fee: "-",
    validity: "-",
    docs: "Historical reference only - Replaced by modern Single Permit (Annex 46) and unlimited work authorization"
  },
  {
    id: "be-LEG-002",
    officialCode: "BE-LEG-002",
    name: "Legacy Card B Old Temporary Residence System (Replaced by Modern Electronic Single Permit Card A) Belgium",
    toCountry: "be",
    fromCountry: "in",
    category: "pr",
    record_type: "LEGACY_VISA",
    fee: "-",
    validity: "-",
    docs: "Historical reference only - Old paper booklet / Card B system replaced by biometric electronic Single Permit Card A"
  }
];

function convertRawToVisaItem(item: RawBelgiumItem): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
  const details = getBelgiumMicroDetails(item.id, item.category, item.name, item.fundsBox, item.itrBox, item.bankBox);

  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    category: item.category,
    categoryCode: item.category,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    processing: "10 - 15 Calendar Days (VFS Belgium / Schengen C) or 15 - 60 Days (Single Permit / Office des Étrangers)",
    icon: item.category === 'tourist' ? '🏖️' : item.category === 'work' ? '💼' : item.category === 'student' ? '🎓' : item.category === 'family' ? '👨‍👩‍👧' : item.category === 'business' ? '🤝' : '🏛️',
    purpose: `${item.name} — Official Belgium (${item.officialCode}) visa and residence permit pathway processed via VFS Global Belgium, Federal Public Service Foreign Affairs, and Office des Étrangers / Dienst Vreemdelingenzaken.`,
    eligibility: "Valid passport with min 3 months validity beyond planned departure, 2 blank pages, travel medical insurance EUR 30,000, confirmed travel itinerary / Belgian employment contract meeting regional thresholds / university admission, and seasoned financial proof.",
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
      "Full Name, Belgian National Number (Numéro National / Rijksregisternummer - if previously registered), Date & Place of Birth, Nationality",
      "Passport Number, Issue Date, Expiry Date (valid at least 3 months after departure from Belgium / Schengen Area)",
      "Belgian Host / Employer Crossroads Bank for Enterprises number (BCE / KBO), regional department file number, and registered address",
      "Administrative contribution fee proof (Redevance administrative / Administratieve bijdrage) paid to the Immigration Office"
    ],
    steps: [
      "For Short-Stay Schengen (Type C), submit application form electronically via Visa On Web (visaonweb.diplomatie.be) and schedule biometrics at VFS Global.",
      "For Single Permit (Work), employer initiates application via the regional portal (Working in Flanders, Brussels Economy & Employment, or SPW Wallonie).",
      "Pay the mandatory federal administrative fee (Redevance) to the Belgian Immigration Office account before file review.",
      "Attend appointment at VFS Global or Belgian Embassy to submit biometrics, then upon arrival register at the local Commune / Gemeente within 8 days."
    ],
    tips: [
      "Ensure personal bank statements demonstrate min EUR 95/day for tourists in hotels or EUR 45/day if staying with host with legalized Annexe 3bis.",
      "For students, university blocked accounts (compte bloqué / geblokkeerde rekening) provide 100% accepted proof of EUR 803/month living subsistence.",
      "For Single Permit applicants, register with your municipal administration (Commune) immediately upon arrival to receive your Annex 49 and biometric electronic Card A."
    ],
    faq: [
      {
        q: `What is the official visa fee and validity for ${item.name}?`,
        a: `Official Fee: ${item.fee}. Validity: ${item.validity}. Applications are processed via VFS Global, Belgian Consulates, or the regional Single Permit portals.`
      },
      {
        q: `What documents are required for ${item.officialCode}?`,
        a: `Required documents: ${item.docs}.`
      }
    ]
  };
}

const ALL_BE_CONVERTED = BE_92.map(convertRawToVisaItem);
const ALL_BE_SUPPORTING = SUPPORTING_AND_LEGACY_BE.map(convertRawToVisaItem);

export const BELGIUM_92_VISAS: CountryVisas = {
  tourist: ALL_BE_CONVERTED.filter(i => i.category === 'tourist'),
  business: ALL_BE_CONVERTED.filter(i => i.category === 'business'),
  work: ALL_BE_CONVERTED.filter(i => i.category === 'work'),
  student: ALL_BE_CONVERTED.filter(i => i.category === 'student'),
  family: ALL_BE_CONVERTED.filter(i => i.category === 'family'),
  pr: ALL_BE_CONVERTED.filter(i => i.category === 'pr'),
  supporting: ALL_BE_SUPPORTING
};

export const BELGIUM_22_VISAS = BELGIUM_92_VISAS;
