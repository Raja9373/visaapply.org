import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getNetherlandsMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "Schengen C Short Stay Tourist / Business requires EUR 55 to EUR 100 per day of stay in the Netherlands (min EUR 3,000 for 30 days). IND requires proof of steady liquid balance in personal bank account.";
  let fundsBankMonths = "Last 3 to 6 months personal bank statements stamped by bank branch with regular income credits.";
  let fundsSudden = "❌ Sudden 1-day cash deposits right before visa submission at VFS Global / IND are strictly flagged and cause rejection by IND (Immigration and Naturalisation Service). Average balance must be maintained over 3–6 months.";
  let fundsEx = "✅ Sahi: Seasoned 3-6 month bank statement with EUR 3,000+ liquid balance. ❌ Galat: Unexplained cash deposit 24 hours prior to application.";

  let itrYears = "Income tax returns or salary slips for past 2–3 years for work, business, and family reunification applicants.";
  let itrMatch = "Reported tax income must reconcile with personal bank credits and KvK/employment contracts.";
  let itrNoItr = "Not required for short-term C Tourist visitors or students sponsored by parents.";

  let bankMonths = "Last 3-6 months bank statements.";
  let bankReg = "Regular salary credits or steady corporate revenue.";
  let bankFd = "Fixed deposits accepted as supporting proof.";
  let bankSource = "Salary, corporate revenue, or verified parental sponsorship.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('highly-skilled') || lowerCode.includes('mvv')) {
    fundsMin = "Highly Skilled Migrant (Kennismigrant) requires employer registration with IND + gross monthly salary threshold (EUR 3,672+ for under 30 / EUR 5,008+ for 30+ / EUR 2,900+ for Zoekjaar graduates). MVV fee is EUR 171 + Residence Permit EUR 1,446.";
    fundsBankMonths = "Job contract with recognized IND sponsor, salary specification, and 3 months bank statements.";
    fundsSudden = "Employment contracts must specify gross monthly salary in EUR and KvK (Kamer van Koophandel) number.";
    fundsEx = "✅ Sahi: Official IND Recognized Sponsor job offer + EUR 3,672+ salary + KvK registered employer. ❌ Galat: Unrecognized sponsor or salary below IND threshold.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('study')) {
    fundsMin = "MVV Study requires official admission from a DUO/IND registered Dutch university (WO/HBO) + proof of living funds (EUR 11,000/year or EUR 950/month) + tuition fee payment. Residence permit fee is EUR 228.";
    fundsBankMonths = "3-6 months bank statements of student or parent sponsor showing min EUR 11,000.";
    fundsSudden = "Parental guarantee letter and birth certificate required if sponsored by parents.";
    fundsEx = "✅ Sahi: University admission letter + EUR 11,000 bank balance or university blocked account proof. ❌ Galat: Unverified institute or insufficient living funds.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('partner')) {
    fundsMin = "MVV Family Reunification (Gezinshereniging) requires Dutch host/sponsor to earn minimum 100% of Dutch statutory minimum wage (approx EUR 2,070+ gross/month) + passing Civic Integration Exam Abroad (Inburgeringsexamen buitenland). MVV fee EUR 171 + Permit EUR 1,446.";
    fundsBankMonths = "Dutch sponsor's employment contract (min 1 year remaining), past 3 salary slips, and bank statements.";
    fundsSudden = "Marriage/Birth certificates must be legalised/apostilled with certified Dutch/English translation.";
    fundsEx = "✅ Sahi: Legalised marriage certificate + sponsor IND income proof (EUR 2,070+/mo) + passed Inburgeringsexamen. ❌ Galat: Sponsor income below minimum wage or unlegalised marriage document.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('kvk')) {
    fundsMin = "Schengen C Business requires KvK (Kamer van Koophandel) company registration of Dutch host + foreign employer dispatch letter. Entrepreneur Start-up requires RVO scoring + approved Facilitator + EUR 50,000 capital.";
    fundsBankMonths = "3-6 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Dutch company must be active in official KvK (Kamer van Koophandel) registry.";
    fundsEx = "✅ Sahi: Official Dutch host KvK extract + invitation letter + foreign company dispatch letter. ❌ Galat: Unregistered KvK firm.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('investor') || lowerCode.includes('naturalization')) {
    fundsMin = "Permanent Residence (Onbepaalde tijd) requires 5 years continuous legal residence in NL + passed Inburgering Diploma (B1/A2 level). Investor Visa requires EUR 1,250,000 capital in Dutch enterprise/fund.";
    fundsBankMonths = "5 years BRP (Basisregistratie Personen) residence proof, Tax returns (Inkomstenbelasting), and bank statements.";
    fundsSudden = "Continuous residence with no single absence over 6 consecutive months or 10 months total in 5 years.";
    fundsEx = "✅ Sahi: 5 years BRP history + Inburgering diploma + steady income. ❌ Galat: Gaps in legal residence or failed civic integration.";
  }

  return {
    fundsBox: {
      minimum: fundsMin,
      bankMonths: fundsBankMonths,
      suddenDeposit: fundsSudden,
      example: fundsEx
    },
    itrBox: {
      years: itrYears,
      match: itrMatch,
      noItr: itrNoItr
    },
    bankBox: {
      months: bankMonths,
      regularCredit: bankReg,
      fd: bankFd,
      source: bankSource
    }
  };
}

const RAW_NL_VISAS: VisaItem[] = [
  // TOURIST 14 LIVE
  {
    id: "nl-TOU-001",
    officialCode: "NL-TOU-001",
    name: "Schengen C Tourist 90 Days 180 Days Short Stay Schengen C Tourist - Most common Tourist Netherlands",
    fee: "EUR 90 Schengen C + VFS 30",
    validity: "90 days within 180 days",
    stay: "Max 90 days",
    processing: "15 to 30 Calendar Days",
    purpose: "Tourism, sightseeing, leisure travel in Netherlands and Schengen area",
    eligibility: "Foreign nationals applying for short stay tourism in Netherlands with proof of funds and return intent",
    officialSource: "https://ind.nl/en/short-stay-visa-netherlands",
    popular: true,
    highlight: true,
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport (min 3 months validity beyond intended stay, 2 blank pages) ⭐",
      "Completed Schengen Visa Application Form + VFS Appointment Confirmation",
      "2 Recent Biometric Passport Photographs (35x45mm white background)",
      "Proof of Accommodation: Confirmed Hotel Reservation or IND Legalised Form Bewijs van garantstelling en/of particuliere logiesverstrekking ⭐",
      "Flight Itinerary / Round-trip Ticket Reservation ⭐",
      "Bank Statements for past 3–6 months showing min EUR 55–100/day (stamped by bank) ⭐",
      "Employment Proof: Salary Slips (3 months) + Employer Leave Approval / NOC letter",
      "Income Tax Returns (ITR) for past 2 years",
      "Travel Medical Insurance with min EUR 30,000 coverage across Schengen area ⭐",
      "Cover Letter detailing travel itinerary, purpose of visit, and return commitment"
    ]
  },
  {
    id: "nl-TOU-002",
    officialCode: "NL-TOU-002",
    name: "Schengen C Tourist 1Y Multiple 90 Days 180 Days Schengen C Tourist 1Y Multiple",
    fee: "EUR 90 Schengen C 1Y multiple",
    validity: "1 Year Multiple Entry (90 days per 180 days)",
    stay: "Max 90 days per entry",
    processing: "15 to 30 Calendar Days",
    purpose: "Frequent tourist visits to Netherlands and Schengen zone over 1 year",
    eligibility: "Travelers with previous legally used Schengen visas in past 2 years",
    officialSource: "https://ind.nl/en/short-stay-visa-netherlands",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport + Copies of previous Schengen Visas & entry/exit stamps ⭐",
      "Completed Schengen Visa Application Form",
      "2 Biometric Photos (35x45mm)",
      "Proof of frequent travel requirement / cover letter",
      "Bank Statements past 6 months showing strong financial standing ⭐",
      "Employer NOC & Salary Slips for past 3 months",
      "Schengen Travel Insurance valid for first entry (EUR 30,000 coverage)"
    ]
  },
  {
    id: "nl-TOU-003",
    officialCode: "NL-TOU-003",
    name: "Schengen C Tourist 2Y Multiple 90 Days 180 Days Schengen C Tourist 2Y Multiple",
    fee: "EUR 90 Schengen C 2Y multiple",
    validity: "2 Years Multiple Entry",
    stay: "Max 90 days per 180 days",
    processing: "15 to 30 Calendar Days",
    purpose: "Frequent tourist visits over 2 years",
    eligibility: "Applicants who have legally obtained and used a 1-year multiple entry Schengen visa in past 2 years",
    officialSource: "https://ind.nl/en/short-stay-visa-netherlands",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Passport valid 2+ years + Copies of 1Y Multiple Schengen Visa ⭐",
      "Schengen Application Form + Photos",
      "6 months Bank Statements with liquid balance",
      "Proof of ongoing travel necessity / cover letter",
      "Travel Medical Insurance EUR 30,000"
    ]
  },
  {
    id: "nl-TOU-004",
    officialCode: "NL-TOU-004",
    name: "Schengen C Tourist 5Y Multiple 90 Days 180 Days Schengen C Tourist 5Y Multiple",
    fee: "EUR 90 Schengen C 5Y multiple",
    validity: "5 Years Multiple Entry",
    stay: "Max 90 days per 180 days",
    processing: "15 to 30 Calendar Days",
    purpose: "Long-term frequent tourist visits over 5 years",
    eligibility: "Applicants who have legally obtained and used a 2-year multiple entry Schengen visa in past 3 years",
    officialSource: "https://ind.nl/en/short-stay-visa-netherlands",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Passport valid 5+ years + Copies of previous 2Y Multiple Schengen Visa ⭐",
      "Schengen Application Form + Photos",
      "6 months Bank Statements + Asset Proof",
      "Travel Medical Insurance EUR 30,000 for initial entry"
    ]
  },
  {
    id: "nl-TOU-005",
    officialCode: "NL-TOU-005",
    name: "Schengen C Tourist - Family Friends Visit 90 Days Family Friends Visit Schengen C Family Friends NL",
    fee: "EUR 90 Schengen C Family friends visit NL",
    validity: "90 days within 180 days",
    stay: "Max 90 days",
    processing: "15 Calendar Days",
    purpose: "Visiting family members or friends residing in the Netherlands",
    eligibility: "Foreigners with formal invitation from Dutch citizen or legal resident host",
    officialSource: "https://ind.nl/en/short-stay-visa-netherlands",
    popular: true,
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport + Photos + Application Form",
      "Official IND Form Bewijs van garantstelling en/of particuliere logiesverstrekking (legalised by Dutch municipality) ⭐",
      "Host Dutch Passport / BRP / Residence Permit Copy ⭐",
      "Relationship Proof: Birth/Marriage Certificate or photographic proof",
      "Host's Income Proof (if sponsoring): 3 salary slips + employment contract",
      "Visitor Bank Statements for past 3 months",
      "Travel Medical Insurance EUR 30,000"
    ]
  },
  {
    id: "nl-TOU-006",
    officialCode: "NL-TOU-006",
    name: "Transit A Airport Transit 24H Transit A Airport Transit NL",
    fee: "EUR 90 Transit A Airport NL",
    validity: "24 Hours (Airport Transit Zone)",
    stay: "Max 24 hours (No exit from airport international zone)",
    processing: "10 to 15 Days",
    purpose: "Transiting through Schiphol Amsterdam Airport international zone to non-Schengen final destination",
    eligibility: "Nationalities requiring airport transit visa (ATV) transiting through Netherlands airport",
    officialSource: "https://ind.nl/en/short-stay-visa-netherlands/airport-transit-visa",
    categoryCode: "tourist",
    record_type: "TRANSIT_VISA",
    docs: [
      "Valid Passport + Photos + Application Form",
      "Confirmed Flight Tickets to final non-Schengen destination via Schiphol ⭐",
      "Valid Visa or Entry Permit for destination country ⭐"
    ]
  },
  {
    id: "nl-TOU-007",
    officialCode: "NL-TOU-007",
    name: "Transit B Seaman 5 Days Transit B Seaman Transit NL",
    fee: "EUR 90 Transit B Seaman NL",
    validity: "5 Days",
    stay: "Max 5 days",
    processing: "10 to 15 Days",
    purpose: "Seafarers joining or signing off a vessel at a Dutch port",
    eligibility: "Active merchant seafarers with Seaman's Discharge Book and shipping company invitation",
    officialSource: "https://ind.nl/en/short-stay-visa-netherlands",
    categoryCode: "tourist",
    record_type: "TRANSIT_VISA",
    docs: [
      "Valid Passport + Seaman's Discharge Book (Seaman's Book) ⭐",
      "Official Shipping Agent / Manning Agency Guarantee Letter in NL ⭐",
      "Flight Tickets + Vessel Registration Details in Dutch Port"
    ]
  },
  {
    id: "nl-TOU-008",officialCode: "NL-TOU-008",name: "Schengen C Extension Extension 90 Days Extension Schengen C Extension NL",fee: "EUR 0 IND extension Schengen C NL",validity: "Extension up to 90 days",stay: "Extension of original stay",processing: "5 to 10 Days",purpose: "Force majeure, humanitarian reason, or urgent personal reason extending short stay in NL",eligibility: "Current Schengen C visa holders inside Netherlands facing unforeseen compelling circumstances",officialSource: "https://ind.nl/en/extend-short-stay-visa",categoryCode: "tourist",record_type: "STATUS_DOCUMENT",docs: ["Extension Application to IND ⭐","Written Explanation & Medical/Flight cancellation proof ⭐","Proof of sufficient financial means & ongoing travel insurance"]
  },
  {
    id: "nl-TOU-009",officialCode: "NL-TOU-009",name: "Schengen C - Medical Treatment 90 Days Medical Treatment Schengen C Medical NL",fee: "EUR 90 Schengen C Medical treatment NL",validity: "90 days within 180 days",stay: "Max 90 days",processing: "15 Days",purpose: "Receiving short-term specialized medical treatment in Dutch medical institution",eligibility: "Patients requiring non-emergency medical care in Netherlands with hospital confirmation",officialSource: "https://ind.nl/en/short-stay-visa-netherlands",categoryCode: "tourist",record_type: "MEDICAL_VISA",docs: ["Hospital Appointment & Confirmation from Dutch Medical Institution ⭐","Medical Certificate from home country doctor ⭐","Proof of Advance Medical Payment or Financial Guarantee ⭐","Bank Statements 6 months"]
  },
  {
    id: "nl-TOU-010",officialCode: "NL-TOU-010",name: "Caribbean Visa 90 Days Caribbean Visa 90 Days Caribbean NL Caribbean",fee: "EUR 90 Caribbean visa NL",validity: "90 days within 180 days",stay: "Max 90 days",processing: "15 Days",purpose: "Visiting Dutch Caribbean territories (Aruba, Bonaire, Curaçao, Saba, Sint Eustatius, Sint Maarten)",eligibility: "Foreign tourists traveling to Caribbean parts of Kingdom of Netherlands",officialSource: "https://www.netherlandsworldwide.nl/caribbean-visa",categoryCode: "tourist",record_type: "TOURIST_VISA",docs: ["Valid Passport + Caribbean Visa Application Form","Hotel Confirmation in Aruba / Curaçao / Sint Maarten ⭐","Return Flight Itinerary + Bank Proof USD 100/day"]
  },
  {
    id: "nl-TOU-011",officialCode: "NL-TOU-011",name: "Schengen C - Cultural Sports Event 90 Days Cultural Sports Event Schengen C Cultural Sports NL",fee: "EUR 90 Schengen C Cultural sports event NL",validity: "90 days within 180 days",stay: "Max 90 days",processing: "15 Days",purpose: "Participating in cultural, athletic, or artistic events/competitions in NL",eligibility: "Artists, athletes, and cultural performers invited by Dutch event organizers",officialSource: "https://ind.nl/en/short-stay-visa-netherlands",categoryCode: "tourist",record_type: "CULTURAL_VISA",docs: ["Invitation Letter from Dutch Cultural/Sports Federation ⭐","Event Entry / Registration Certificate ⭐","Proof of Sponsorship or Liquid Bank Balance"]
  },
  {
    id: "nl-TOU-012",officialCode: "NL-TOU-012",name: "Schengen C - Conference 90 Days Conference Schengen C Conference NL",fee: "EUR 90 Schengen C Conference NL",validity: "90 days within 180 days",stay: "Max 90 days",processing: "15 Days",purpose: "Attending international scientific, academic, or professional conferences in NL",eligibility: "Conference delegates, speakers, and academic attendees",officialSource: "https://ind.nl/en/short-stay-visa-netherlands",categoryCode: "tourist",record_type: "CONFERENCE_VISA",docs: ["Official Conference Invitation & Registration Pass in NL ⭐","Employer Deputation Letter + Bank Statements 3 months"]
  },
  {
    id: "nl-TOU-013",officialCode: "NL-TOU-013",name: "Facilitated Transit Document FTD FTD Facilitated Transit Document FTD NL",fee: "EUR 0 FTD NL",validity: "Transit duration",stay: "Transit duration",processing: "5 Days",purpose: "Facilitated transit document for transit between Kaliningrad and Russian mainland",eligibility: "Specific transit document holders",officialSource: "https://ind.nl/en",categoryCode: "tourist",record_type: "TRANSIT_VISA",docs: ["Passport + FTD transit form","Rail / Travel documentation"]
  },
  {
    id: "nl-TOU-014",officialCode: "NL-TOU-014",name: "Facilitated Rail Transit Document FRTD FRTD Facilitated Rail Transit Document FRTD NL",fee: "EUR 0 FRTD NL",validity: "Transit duration",stay: "Transit duration",processing: "5 Days",purpose: "Facilitated rail transit document",eligibility: "Rail passengers transiting designated corridors",officialSource: "https://ind.nl/en",categoryCode: "tourist",record_type: "TRANSIT_VISA",docs: ["Passport + FRTD rail document","Rail ticket proof"]
  },

  // BUSINESS 8 LIVE
  {
    id: "nl-BIZ-001",
    officialCode: "NL-BIZ-001",
    name: "Schengen C Business 90 Days 180 Days Short Stay Schengen C Business - Most common Business Netherlands",
    fee: "EUR 90 Schengen C Business + VFS 30",
    validity: "90 days within 180 days",
    stay: "Max 90 days",
    processing: "15 Calendar Days",
    purpose: "Business meetings, corporate negotiations, site visits, and commercial trade in Netherlands",
    eligibility: "Business professionals invited by a Dutch company registered with KvK (Kamer van Koophandel)",
    officialSource: "https://ind.nl/en/short-stay-visa-netherlands/business-visit",
    popular: true,
    highlight: true,
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Valid Passport + Photos + Application Form",
      "Official Invitation Letter from Dutch Host Company (specifying purpose, dates, host KvK registration number) ⭐",
      "Official Extract of Dutch Company from KvK (Kamer van Koophandel) registry ⭐",
      "Dispatch / Employer Letter from sending foreign company detailing traveler's role and financial guarantee ⭐",
      "Business Bank Statements past 6 months + Company Registration of sending firm",
      "Schengen Travel Medical Insurance EUR 30,000",
      "Confirmed Hotel & Flight Reservations"
    ]
  },
  {
    id: "nl-BIZ-002",officialCode: "NL-BIZ-002",name: "Schengen C Business 1Y Multiple 90 Days 180 Days Schengen C Business 1Y Multiple",fee: "EUR 90 Schengen C Business 1Y multiple",validity: "1 Year Multiple Entry",stay: "Max 90 days per 180 days",processing: "15 Days",purpose: "Frequent corporate travel to Netherlands host companies over 1 year",eligibility: "Executives with regular commercial relationship with Dutch KvK registered partners",officialSource: "https://ind.nl/en/short-stay-visa-netherlands/business-visit",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Passport + Previous Schengen Business Visas ⭐","KvK extract of Dutch partner firm ⭐","Employer Dispatch Letter + Corporate Bank Proof"]
  },
  {
    id: "nl-BIZ-003",officialCode: "NL-BIZ-003",name: "Schengen C Business 5Y Multiple 90 Days 180 Days Schengen C Business 5Y Multiple",fee: "EUR 90 Schengen C Business 5Y multiple",validity: "5 Years Multiple Entry",stay: "Max 90 days per 180 days",processing: "15 Days",purpose: "Long-term frequent corporate and executive travel over 5 years",eligibility: "Senior executives and trade partners with proven long-term Dutch commercial ties",officialSource: "https://ind.nl/en/short-stay-visa-netherlands/business-visit",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Passport valid 5+ years + Previous 2Y Schengen Visa ⭐","KvK extract of Dutch host + Corporate contract / MoU","Company Bank Statements past 6 months"]
  },
  {
    id: "nl-BIZ-004",officialCode: "NL-BIZ-004",name: "Schengen C Business - Conference 90 Days Conference Schengen C Business Conference NL",fee: "EUR 90 Schengen C Business Conference NL",validity: "90 days within 180 days",stay: "Max 90 days",processing: "15 Days",purpose: "Attending commercial summits, trade conventions, and industry expos in NL",eligibility: "Business delegates and corporate event participants",officialSource: "https://ind.nl/en/short-stay-visa-netherlands/business-visit",categoryCode: "business",record_type: "CONFERENCE_VISA",docs: ["Trade Summit / Expo Entry Registration & Invoice in NL ⭐","KvK details of host / organizer ⭐","Employer Dispatch Letter & Corporate Financials"]
  },
  {
    id: "nl-BIZ-005",officialCode: "NL-BIZ-005",name: "Schengen C Business - Investor Investor Visa Schengen C Business Investor NL",fee: "EUR 90 Schengen C Business Investor NL + Investor",validity: "90 days short stay investor",stay: "Max 90 days",processing: "15 to 30 Days",purpose: "Short-term exploratory visits for high-net-worth investors evaluating Dutch enterprises",eligibility: "Investors exploring EUR 1.25M+ investment options under IND guidelines",officialSource: "https://ind.nl/en/residence-permits/investors/investor",categoryCode: "business",record_type: "INVESTOR_VISA",docs: ["Proof of substantial investment capital (EUR 1.25M+) ⭐","Investment proposal / MoU with Dutch fund or enterprise","Personal & Corporate Bank Audit Reports"]
  },
  {
    id: "nl-BIZ-006",officialCode: "NL-BIZ-006",name: "Schengen C Business - Entrepreneur Entrepreneur Visa Schengen C Business Entrepreneur NL",fee: "EUR 90 Schengen C Business Entrepreneur NL + Entrepreneur",validity: "90 days short stay entrepreneur",stay: "Max 90 days",processing: "15 to 30 Days",purpose: "Exploratory business setup visit for startup founders and self-employed entrepreneurs",eligibility: "Startup founders engaging with RVO approved facilitators or preparing KvK registration",officialSource: "https://ind.nl/en/residence-permits/work/start-up",categoryCode: "business",record_type: "ENTREPRENEUR_VISA",docs: ["Business Plan & Pitch Deck ⭐","RVO Facilitator agreement or correspondence ⭐","Proof of capital (EUR 50,000+)"]
  },
  {
    id: "nl-BIZ-007",officialCode: "NL-BIZ-007",name: "Schengen C Business Extension Extension Schengen C Business 90 Days Extension Schengen C Business NL",fee: "EUR 0 IND extension Schengen C business NL",validity: "Extension up to 90 days",stay: "Extension of stay",processing: "5 to 10 Days",purpose: "Extending short stay business visa due to urgent business developments",eligibility: "Current Schengen C business visa holders inside Netherlands with official request from KvK firm",officialSource: "https://ind.nl/en/extend-short-stay-visa",categoryCode: "business",record_type: "STATUS_DOCUMENT",docs: ["Official request letter from Dutch KvK company explaining urgent business extension ⭐","IND Extension application form"]
  },
  {
    id: "nl-BIZ-008",officialCode: "NL-BIZ-008",name: "Schengen C Business - Trade Fair Trade Fair 90 Days Trade Fair Schengen C Business Trade Fair NL",fee: "EUR 90 Schengen C Business Trade fair NL",validity: "90 days within 180 days",stay: "Max 90 days",processing: "15 Days",purpose: "Exhibiting or visiting commercial trade fairs (e.g. RAI Amsterdam, Jaarbeurs Utrecht)",eligibility: "Exhibitors and trade visitors with confirmed exhibition pass",officialSource: "https://ind.nl/en/short-stay-visa-netherlands/business-visit",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Exhibitor Pass / Stand Booking Invoice at Dutch Trade Fair ⭐","Foreign Employer Dispatch Letter + Bank Statements"]
  },

  // WORK 20 LIVE
  {
    id: "nl-WRK-001",
    officialCode: "NL-WRK-001",
    name: "MVV Highly Skilled Migrant 90 Days Single MVV Highly Skilled Migrant - Most common Work Permit Netherlands - Highly Skilled Migrant + MVV",
    fee: "EUR 171 MVV Single + Residence EUR 1446 Highly skilled migrant + VFS 30",
    validity: "MVV 90 days entry + 1 to 5 Years Residence Permit (Kennismigrant)",
    stay: "1 to 5 Years renewable",
    processing: "2 to 4 Weeks (Accelerated IND Recognized Sponsor Procedure)",
    purpose: "Long-term skilled employment with an IND Recognized Sponsor in the Netherlands",
    eligibility: "Foreign professionals hired by an IND Recognized Sponsor (Erkend Referent) earning gross monthly salary of EUR 3,672+ (under 30) or EUR 5,008+ (30 and older)",
    officialSource: "https://ind.nl/en/residence-permits/work/highly-skilled-migrant",
    popular: true,
    highlight: true,
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Job Offer & Employment Contract with IND Recognized Sponsor (Erkend Referent) ⭐",
      "Salary Threshold Compliance Proof: Gross monthly EUR 3,672+ (<30) or EUR 5,008+ (30+) ⭐",
      "Employer KvK (Kamer van Koophandel) Registration Extract",
      "IND Fast-Track Approval / MVV Authorisation Decision Letter ⭐",
      "Valid Passport + Educational Degree Qualifications",
      "Completed MVV Application Form + VFS Biometric Appointment"
    ]
  },
  {
    id: "nl-WRK-002",officialCode: "NL-WRK-002",name: "MVV Regular Labour 90 Days Single MVV Regular Labour Regular Labour NL",fee: "EUR 171 MVV Single + Residence EUR 1446 Regular labour + Work permit + VFS 30 Regular labour",validity: "MVV 90 days entry + 1 Year Residence Permit (Arbeid in loondienst)",stay: "1 Year renewable",processing: "6 to 12 Weeks",purpose: "Regular paid employment requiring UWV Work Permit (TWV)",eligibility: "Foreign workers whose Dutch employer completed UWV Labour Market Test proving no EU candidate available",officialSource: "https://ind.nl/en/residence-permits/work/paid-employment",categoryCode: "work",record_type: "WORK_VISA",docs: ["Employment Contract + UWV Labour Market Test Approval (Tewerkstellingsvergunning - TWV) ⭐","Employer KvK registration extract + Salary slips & Educational credentials"]
  },
  {
    id: "nl-WRK-003",officialCode: "NL-WRK-003",name: "MVV Intra Corporate Transferee ICT 90 Days Single MVV ICT Intra Corporate Transferee NL",fee: "EUR 171 MVV Single + Residence EUR 1446 ICT + VFS 30 ICT",validity: "MVV 90 days entry + Up to 3 Years Residence Permit (EU ICT Directive 2014/66/EU)",stay: "Max 3 years (managers/specialists) / 1 year (trainees)",processing: "4 to 6 Weeks",purpose: "Intra-corporate transfer of managers, specialists, or graduate trainees to Dutch entity",eligibility: "Employees working at least 3–6 months in multinational firm prior to transfer",officialSource: "https://ind.nl/en/residence-permits/work/intra-corporate-transferees",categoryCode: "work",record_type: "WORK_VISA",docs: ["Transfer Letter from parent company + Assignment Contract with Dutch KvK entity ⭐","Proof of employment in foreign parent company (3+ months) ⭐","Salary proof meeting corporate market rate"]
  },
  {
    id: "nl-WRK-004",officialCode: "NL-WRK-004",name: "MVV Seasonal Labour 90 Days Single MVV Seasonal Labour Seasonal Labour NL",fee: "EUR 171 MVV Single + Residence EUR 1446 Seasonal labour + VFS 30 Seasonal labour",validity: "MVV 90 days entry + Max 24 Weeks Residence Permit",stay: "Max 24 weeks (6 months)",processing: "4 Weeks",purpose: "Seasonal agricultural and horticultural employment in Netherlands",eligibility: "Seasonal workers with UWV seasonal work permit approval",officialSource: "https://ind.nl/en/residence-permits/work/seasonal-work",categoryCode: "work",record_type: "WORK_VISA",docs: ["Seasonal Employment Contract + UWV Seasonal Work Permit Approval ⭐","Employer KvK extract + Suitable housing confirmation in NL"]
  },
  {
    id: "nl-WRK-005",officialCode: "NL-WRK-005",name: "MVV EU Blue Card 90 Days Single MVV EU Blue Card EU Blue Card NL",fee: "EUR 171 MVV Single + Residence EUR 1446 EU Blue Card + VFS 30 EU Blue Card",validity: "MVV 90 days entry + 1 to 4 Years EU Blue Card Residence Permit",stay: "1 to 4 Years renewable",processing: "4 to 6 Weeks",purpose: "Highly qualified employment under EU Directive",eligibility: "Professionals with higher education degree (3+ years university) and gross salary EUR 5,008+/month",officialSource: "https://ind.nl/en/residence-permits/work/eu-blue-card",categoryCode: "work",record_type: "WORK_VISA",docs: ["1-Year Employment Contract + Higher Education Degree Evaluated by Nuffic ⭐","Salary proof meeting EU Blue Card threshold (EUR 5,008+/mo) ⭐"]
  },
  {
    id: "nl-WRK-006",officialCode: "NL-WRK-006",name: "MVV Researcher Directive 90 Days Single MVV Researcher Directive Researcher Directive NL",fee: "EUR 171 MVV Single + Residence EUR 1446 Researcher directive + VFS 30 Researcher directive",validity: "MVV 90 days entry + Up to 5 Years Residence Permit (Directive (EU) 2016/801)",stay: "Duration of research project (1 to 5 years)",processing: "2 to 4 Weeks",purpose: "Conducting academic research at an IND recognized research institution or university",eligibility: "Researchers with signed Hosting Agreement (Gastovereenkomst) with recognized Dutch research institution",officialSource: "https://ind.nl/en/residence-permits/work/researcher",categoryCode: "work",record_type: "RESEARCH_VISA",docs: ["Signed Hosting Agreement (Gastovereenkomst) with Recognized Research Institution ⭐","Proof of doctoral qualification or master's degree ⭐","Monthly stipend/salary specification"]
  },
  {
    id: "nl-WRK-007",officialCode: "NL-WRK-007",name: "MVV Graduate Orientation Year 90 Days Single MVV Orientation Year Orientation Year NL",fee: "EUR 171 MVV Single + Residence EUR 1446 Orientation year + VFS 30 Orientation year",validity: "MVV 90 days entry + 1 Year Residence Permit (Zoekjaar)",stay: "1 Year non-renewable",processing: "4 Weeks",purpose: "Post-study work permit allowing foreign graduates to seek employment or launch startup in NL",eligibility: "Graduates of Top 200 world ranked universities or Dutch universities within past 3 years",officialSource: "https://ind.nl/en/residence-permits/work/orientation-year-highly-educated-persons",categoryCode: "work",record_type: "WORK_VISA",docs: ["Diploma Certificate from Top 200 World Ranked University or Dutch University (past 3 years) ⭐","Nuffic Credential Evaluation Certificate (for foreign degrees) ⭐","Proof of sufficient liquid balance for living costs"]
  },
  {
    id: "nl-WRK-008",officialCode: "NL-WRK-008",name: "MVV Entrepreneur Start-up 90 Days Single MVV Entrepreneur Start-up Entrepreneur Start-up NL",fee: "EUR 171 MVV Single + Residence EUR 1446 Entrepreneur start-up + VFS 30 Entrepreneur start-up",validity: "MVV 90 days entry + 1 Year Residence Permit",stay: "1 Year (convertible to self-employed permit)",processing: "6 to 8 Weeks",purpose: "Launching an innovative business with an approved Dutch Facilitator",eligibility: "Startup founders with binding agreement with an RVO approved Dutch Facilitator and innovative business plan",officialSource: "https://ind.nl/en/residence-permits/work/start-up",categoryCode: "business",record_type: "ENTREPRENEUR_VISA",docs: ["Signed Agreement with RVO Approved Startup Facilitator in NL ⭐","Innovative Business Plan & Financial Model ⭐","Proof of sufficient capital & living funds"]
  },
  {
    id: "nl-WRK-009",officialCode: "NL-WRK-009",name: "MVV Self Employed 90 Days Single MVV Self Employed Self Employed NL",fee: "EUR 171 MVV Single + Residence EUR 1446 Self employed + VFS 30 Self employed",validity: "MVV 90 days entry + 2 Years Residence Permit (Zelfstandige)",stay: "2 Years renewable",processing: "8 to 12 Weeks",purpose: "Operating a self-employed enterprise or freelance practice in the Netherlands",eligibility: "Entrepreneurs meeting RVO point-based system (personal experience, business plan, added value for NL)",officialSource: "https://ind.nl/en/residence-permits/work/self-employed-person",categoryCode: "business",record_type: "ENTREPRENEUR_VISA",docs: ["Comprehensive Business Plan evaluated by RVO (Enterprise Agency) ⭐","KvK Registration Draft + Financial Statements & Financing Proof ⭐","Points Assessment documentation (Experience, Innovation, Dutch economic impact)"]
  },
  {
    id: "nl-WRK-010",officialCode: "NL-WRK-010",name: "Residence Highly Skilled Migrant 1Y 5Y Residence Highly Skilled Migrant Residence Highly Skilled Migrant NL",fee: "EUR 1446 Residence highly skilled migrant NL",validity: "1 to 5 Years Residence Permit",stay: "1 to 5 Years",processing: "2 to 4 Weeks",purpose: "In-country residence permit for Highly Skilled Migrant (Kennismigrant)",eligibility: "Foreign professionals inside Netherlands converting or renewing highly skilled migrant status",officialSource: "https://ind.nl/en/residence-permits/work/highly-skilled-migrant",categoryCode: "work",record_type: "RESIDENCE_PERMIT",docs: ["IND Recognized Sponsor Employment Contract ⭐","KvK extract + Gross salary specification (EUR 3,672+ / 5,008+) ⭐","BRP (Basisregistratie Personen) registration extract"]
  },
  {
    id: "nl-WRK-011",officialCode: "NL-WRK-011",name: "Residence EU Blue Card 1Y 4Y Residence EU Blue Card Residence EU Blue Card NL",fee: "EUR 1446 Residence EU Blue Card NL",validity: "1 to 4 Years Residence Permit",stay: "1 to 4 Years",processing: "4 Weeks",purpose: "In-country EU Blue Card residence permit",eligibility: "EU Blue Card holders renewing or transferring status in Netherlands",officialSource: "https://ind.nl/en/residence-permits/work/eu-blue-card",categoryCode: "work",record_type: "RESIDENCE_PERMIT",docs: ["Higher Degree Certificate + Contract meeting EU Blue Card salary threshold ⭐","BRP Extract & IND Approval Decision"]
  },
  {
    id: "nl-WRK-012",officialCode: "NL-WRK-012",name: "Residence Extension Extension Residence 1Y 5Y Extension Residence NL",fee: "EUR 1446 Residence extension NL",validity: "1 to 5 Years Extension",stay: "1 to 5 Years",processing: "4 Weeks",purpose: "Extending existing Dutch work residence permit",eligibility: "Current work permit holders in Netherlands with extended job contracts",officialSource: "https://ind.nl/en/extend-residence-permit",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["Extended Employment Contract + Salary Slips past 3 months ⭐","IND Extension Application Form"]
  },
  {
    id: "nl-WRK-013",officialCode: "NL-WRK-013",name: "MVV - Work Permit TWV TWV Work Permit TWV Work Permit NL",fee: "EUR 0 TWV work permit NL",validity: "Duration of TWV permit",stay: "Per TWV decision",processing: "4 Weeks",purpose: "Work authorisation permit (Tewerkstellingsvergunning) issued by UWV",eligibility: "Employers obtaining UWV work permit for specific foreign employee",officialSource: "https://www.uwv.nl",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["UWV Work Permit Approval (TWV) ⭐","Employment Contract & KvK details"]
  },
  {
    id: "nl-WRK-014",officialCode: "NL-WRK-014",name: "MVV - Essential Startup Personnel Essential Startup Personnel MVV Essential Startup NL",fee: "EUR 171 MVV Single + Residence EUR 1446 Essential startup + VFS 30 Essential startup",validity: "MVV 90 days + 1 Year Residence Permit",stay: "1 Year renewable",processing: "4 Weeks",purpose: "Key non-EU technical/management employees joining innovative Dutch startups",eligibility: "Key employees of startups with share option agreement (min 1% equity) and salary EUR 2,500+",officialSource: "https://ind.nl/en/residence-permits/work/essential-startup-personnel",categoryCode: "work",record_type: "WORK_VISA",docs: ["Employment Contract with Startup + Equity/Share Option Agreement (min 1%) ⭐","Startup KvK extract + Business plan & RVO innovation proof"]
  },
  {
    id: "nl-WRK-015",officialCode: "NL-WRK-015",name: "MVV - Performing Artist 90 Days Single MVV Performing Artist Performing Artist NL",fee: "EUR 171 MVV Single + Residence EUR 1446 Performing artist + VFS 30 Performing artist",validity: "MVV 90 days + 1 Year Residence Permit",stay: "1 Year",processing: "4 Weeks",purpose: "Performing artists and cultural personnel performing in Netherlands",eligibility: "Foreign artists with performance contracts with Dutch cultural institutions",officialSource: "https://ind.nl/en/residence-permits/work",categoryCode: "work",record_type: "PERFORMER_VISA",docs: ["Performance Contract with Dutch Cultural Host / Theater ⭐","UWV Work Approval / Endorsement + Professional Portfolio"]
  },
  {
    id: "nl-WRK-016",officialCode: "NL-WRK-016",name: "MVV - Spiritual Minister 90 Days Single MVV Spiritual Minister Spiritual Minister NL",fee: "EUR 171 MVV Single + Residence EUR 1446 Spiritual minister + VFS 30 Spiritual minister",validity: "MVV 90 days + 1 Year Residence Permit",stay: "1 Year renewable",processing: "6 Weeks",purpose: "Religious workers, imams, priests, and spiritual ministers serving Dutch religious communities",eligibility: "Ministers of religion with appointment from registered religious organization in NL",officialSource: "https://ind.nl/en/residence-permits/work",categoryCode: "work",record_type: "WORK_VISA",docs: ["Appointment Letter from Registered Religious Body in NL ⭐","Passed Civic Integration Exam Abroad (Inburgeringsexamen) ⭐","Sponsor Financial Commitment & Housing Proof"]
  },
  {
    id: "nl-WRK-017",officialCode: "NL-WRK-017",name: "MVV - Chef Asian Cuisine 90 Days Single MVV Chef Asian Cuisine Chef Asian NL",fee: "EUR 171 MVV Single + Residence EUR 1446 Chef Asian + VFS 30 Chef Asian",validity: "MVV 90 days + 2 Years Residence Permit",stay: "2 Years",processing: "6 Weeks",purpose: "Specialist Asian cuisine chefs employed in specialized Dutch Asian restaurants",eligibility: "Chefs with min 2 years specialized culinary experience and UWV work permit",officialSource: "https://ind.nl/en/residence-permits/work",categoryCode: "work",record_type: "WORK_VISA",docs: ["Specialized Asian Restaurant Employment Contract + UWV Permit ⭐","Culinary Diplomas & Certified Work Experience Proof (2+ years) ⭐"]
  },
  {
    id: "nl-WRK-018",officialCode: "NL-WRK-018",name: "MVV - Professional Footballer 90 Days Single MVV Professional Footballer Footballer NL",fee: "EUR 171 MVV Single + Residence EUR 1446 Footballer + VFS 30 Footballer",validity: "MVV 90 days + 1 to 3 Years Residence Permit",stay: "Duration of sports contract",processing: "2 to 4 Weeks",purpose: "Professional football players signed by Dutch Eredivisie / Eerste Divisie clubs",eligibility: "Professional athletes with contract with KNVB registered professional football club",officialSource: "https://ind.nl/en/residence-permits/work",categoryCode: "work",record_type: "WORK_VISA",docs: ["Professional Sports Contract with KNVB Registered Club ⭐","KNVB Endorsement Letter + Gross Salary Compliance Proof ⭐"]
  },
  {
    id: "nl-WRK-019",officialCode: "NL-WRK-019",name: "MVV - Trainee 90 Days Single MVV Trainee Trainee NL",fee: "EUR 171 MVV Single + Residence EUR 1446 Trainee + VFS 30 Trainee",validity: "MVV 90 days + 1 Year Residence Permit",stay: "Max 1 Year",processing: "4 Weeks",purpose: "Vocational or corporate training placement in a Dutch enterprise",eligibility: "Trainees undertaking practical training directly linked to field of study or career",officialSource: "https://ind.nl/en/residence-permits/work/work-experience",categoryCode: "work",record_type: "INTERN_VISA",docs: ["Training Agreement with Dutch Enterprise (KvK) ⭐","Training Plan specifying learning objectives ⭐","Proof of university enrollment or relevant qualification"]
  },
  {
    id: "nl-WRK-020",officialCode: "NL-WRK-020",name: "MVV - Working Holiday WHP 1Y Working Holiday WHP 1Y WHP NL",fee: "EUR 171 MVV Single + Residence EUR 1446 WHP + VFS 30 WHP",validity: "1 Year Working Holiday Permit",stay: "1 Year non-renewable",processing: "4 Weeks",purpose: "Youth cultural exchange allowing incidental work during holiday in Netherlands",eligibility: "Citizens of participating WHP partner countries (Australia, Canada, New Zealand, South Korea, Japan, Taiwan, etc.) aged 18–30",officialSource: "https://ind.nl/en/residence-permits/exchange/working-holiday-program-whp",categoryCode: "work",record_type: "WORK_VISA",docs: ["Passport proving WHP agreement country citizenship (Age 18–30) ⭐","Return Ticket & Proof of sufficient financial funds for initial stay ⭐","Comprehensive Medical Insurance with repatriation cover"]
  },

  // STUDENT 14 LIVE
  {
    id: "nl-STU-001",
    officialCode: "NL-STU-001",
    name: "MVV Study 90 Days Single MVV Study 90 Days Single - Most common Student Netherlands",
    fee: "EUR 171 MVV Study Single + Residence EUR 228 Study + VFS 30 Study",
    validity: "MVV 90 days entry + 1 to 4 Years Residence Permit (Studie)",
    stay: "Duration of academic program (1 to 4 years)",
    processing: "2 to 4 Weeks (Fast-track submission by Dutch Educational Institution)",
    purpose: "Higher education studies at recognized Dutch university or hogeschool (HBO/WO)",
    eligibility: "Students accepted for full-time degree program at an IND recognized educational institution with proof of living funds (EUR 11,000/year)",
    officialSource: "https://ind.nl/en/residence-permits/study/study-at-university-or-higher-professional-education",
    popular: true,
    highlight: true,
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Official Letter of Admission from Recognized Dutch University / Hogeschool ⭐",
      "Proof of Financial Means: Liquid bank balance or scholarship of min EUR 11,000/year (EUR 950/month) ⭐",
      "Proof of Tuition Fee Payment or University Guarantee Letter ⭐",
      "Educational Diplomas & Official Transcripts + Nuffic Evaluation (if applicable)",
      "Valid Passport + Photos + Completed MVV Study Application",
      "Health Insurance Coverage in the Netherlands (e.g. AON Student Insurance)"
    ]
  },
  {
    id: "nl-STU-002",officialCode: "NL-STU-002",name: "Residence Study 1Y 4Y Residence Study 1Y 4Y Study NL",fee: "EUR 228 Residence study NL",validity: "1 to 4 Years Residence Permit",stay: "Duration of degree",processing: "2 to 4 Weeks",purpose: "In-country student residence permit issued via IND",eligibility: "Foreign students registered at recognized Dutch higher education institute",officialSource: "https://ind.nl/en/residence-permits/study",categoryCode: "student",record_type: "RESIDENCE_PERMIT",docs: ["University Registration Extract + Living Funds Proof (EUR 11,000/yr) ⭐","Health Insurance Proof & BRP Extract"]
  },
  {
    id: "nl-STU-003",officialCode: "NL-STU-003",name: "MVV Study Extension Extension MVV Study 1Y Extension MVV Study NL",fee: "EUR 228 Residence extension study NL",validity: "1 Year Extension",stay: "1 Year",processing: "2 to 4 Weeks",purpose: "Annual extension of student residence permit during degree study",eligibility: "Students maintaining at least 50% academic progress (MoU study progress monitoring)",officialSource: "https://ind.nl/en/extend-residence-permit",categoryCode: "student",record_type: "STATUS_DOCUMENT",docs: ["Proof of 50%+ Study Progress (ECTS credits threshold) from University ⭐","Bank statement or scholarship proof of EUR 11,000 for upcoming academic year"]
  },
  {
    id: "nl-STU-004",officialCode: "NL-STU-004",name: "Residence Extension Extension Residence Study 1Y Extension Residence Study NL",fee: "EUR 228 Residence extension study NL",validity: "1 Year Extension",stay: "1 Year",processing: "2 to 4 Weeks",purpose: "In-country residence extension for continuing university students",eligibility: "Students registered for continuing academic year at Dutch university",officialSource: "https://ind.nl/en/extend-residence-permit",categoryCode: "student",record_type: "STATUS_DOCUMENT",docs: ["University Enrollment Certificate for continuing year ⭐","Financial Funds Proof EUR 11,000/yr"]
  },
  {
    id: "nl-STU-005",officialCode: "NL-STU-005",name: "MVV Study - Preparatory Year 90 Days Single MVV Study Preparatory Year Preparatory Year NL",fee: "EUR 171 MVV Study Single + Residence EUR 228 Preparatory year + VFS 30 Preparatory year",validity: "MVV 90 days + 1 Year Residence Permit",stay: "Max 1 Year non-renewable",processing: "4 Weeks",purpose: "Attending a 1-year preparatory academic or language course prior to degree studies",eligibility: "Students conditionally admitted to degree program pending language/preparatory year completion",officialSource: "https://ind.nl/en/residence-permits/study",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["Conditional University Admission + Enrollment in Accredited Preparatory Course ⭐","Proof of Living Funds (EUR 11,000) & Tuition Fee Receipt"]
  },
  {
    id: "nl-STU-006",officialCode: "NL-STU-006",name: "MVV Study - Doctoral PhD 90 Days Single MVV Study Doctoral PhD Doctoral PhD NL",fee: "EUR 171 MVV Study Single + Residence EUR 228 Doctoral PhD + VFS 30 Doctoral PhD",validity: "MVV 90 days + Up to 4 Years Residence Permit",stay: "Duration of PhD research (up to 4 years)",processing: "2 to 4 Weeks",purpose: "Pursuing doctoral research / PhD candidate studies at Dutch university",eligibility: "PhD candidates admitted to Dutch university doctoral school or research grant scheme",officialSource: "https://ind.nl/en/residence-permits/study",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["Official PhD Admission & Research Proposal Acceptance from Dutch University ⭐","PhD Grant / Fellowship Approval or Employment Contract as PhD Researcher ⭐"]
  },
  {
    id: "nl-STU-007",officialCode: "NL-STU-007",name: "MVV Study - Exchange 90 Days Single MVV Study Exchange Exchange NL",fee: "EUR 171 MVV Study Single + Residence EUR 228 Exchange + VFS 30 Exchange",validity: "MVV 90 days + Up to 1 Year Residence Permit",stay: "1 Semester to 1 Year",processing: "2 to 4 Weeks",purpose: "Participating in university student exchange programs (e.g. Erasmus+ / bilateral university agreement)",eligibility: "Exchange students enrolled at foreign partner university transfecting credits to NL host",officialSource: "https://ind.nl/en/residence-permits/study",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["Bilateral University Exchange Agreement Confirmation & Acceptance Letter ⭐","Erasmus+ Grant Certificate or Financial Support Proof"]
  },
  {
    id: "nl-STU-008",officialCode: "NL-STU-008",name: "MVV Study - Language 90 Days Single MVV Study Language Language NL",fee: "EUR 171 MVV Study Single + Residence EUR 228 Language + VFS 30 Language",validity: "MVV 90 days + Up to 1 Year Residence Permit",stay: "Max 1 Year",processing: "4 Weeks",purpose: "Enrolling in intensive Dutch language studies at accredited institution",eligibility: "Students taking accredited Dutch language preparation program",officialSource: "https://ind.nl/en/residence-permits/study",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["Enrollment Certificate in Accredited Language Institute in NL ⭐","Proof of Financial Means (EUR 11,000/yr)"]
  },
  {
    id: "nl-STU-009",officialCode: "NL-STU-009",name: "Schengen C Study Short Stay 90 Days Schengen C Study Short Stay Study Short NL",fee: "EUR 90 Schengen C Study short stay NL",validity: "90 days within 180 days",stay: "Max 90 days",processing: "15 Days",purpose: "Short-term summer school, executive courses, or workshops in NL",eligibility: "Students taking short non-degree courses under 90 days",officialSource: "https://ind.nl/en/short-stay-visa-netherlands",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["Summer School / Course Acceptance Letter in NL ⭐","Proof of Course Fee Payment + Bank Statement EUR 55–100/day"]
  },
  {
    id: "nl-STU-010",officialCode: "NL-STU-010",name: "MVV Study - Internship 90 Days Single MVV Study Internship Internship MVV Study NL",fee: "EUR 171 MVV Study Single + Residence EUR 228 Internship MVV study + VFS 30 Internship MVV study",validity: "MVV 90 days + Up to 1 Year Residence Permit",stay: "Max 1 Year",processing: "4 Weeks",purpose: "Student internship placed at Dutch enterprise as mandatory component of foreign degree",eligibility: "Enrolled foreign university students required to complete internship in Netherlands",officialSource: "https://ind.nl/en/residence-permits/work/work-experience",categoryCode: "student",record_type: "INTERN_VISA",docs: ["Tripartite Internship Agreement (Student + Foreign University + Dutch Host Enterprise) ⭐","Proof of Internship Allowance or Financial Guarantee (min EUR 950/mo) ⭐"]
  },
  {
    id: "nl-STU-011",officialCode: "NL-STU-011",name: "Orientation Year Zoekjaar 1Y Orientation Year Zoekjaar 1Y Zoekjaar NL",fee: "EUR 1446 Orientation year Zoekjaar NL",validity: "1 Year Residence Permit (Zoekjaar hoogopgeleiden)",stay: "1 Year non-renewable",processing: "4 Weeks",purpose: "1-year post-study work permit for Dutch university graduates",eligibility: "Graduates who completed Master's / PhD / Bachelor's at Dutch university within past 3 years",officialSource: "https://ind.nl/en/residence-permits/work/orientation-year-highly-educated-persons",popular: true,categoryCode: "student",record_type: "WORK_VISA",docs: ["Dutch University Degree Certificate (Bachelor/Master/PhD completed within 3 years) ⭐","IND Zoekjaar Application Form + Proof of living funds"]
  },
  {
    id: "nl-STU-012",officialCode: "NL-STU-012",name: "MVV Study - Scholarship 90 Days Single MVV Study Scholarship Scholarship MVV Study NL",fee: "EUR 171 MVV Study Single + Residence EUR 228 Scholarship MVV study + VFS 30 Scholarship MVV study",validity: "MVV 90 days + Duration of scholarship study",stay: "1 to 4 Years",processing: "2 to 4 Weeks",purpose: "Scholarship holders studying in Dutch universities (e.g. NL Scholarship, Orange Knowledge Program)",eligibility: "Students awarded official government or university scholarship",officialSource: "https://ind.nl/en/residence-permits/study",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["Official Scholarship Award Letter (covering tuition + living allowance EUR 11,000/yr) ⭐","Dutch University Admission Letter"]
  },
  {
    id: "nl-STU-013",officialCode: "NL-STU-013",name: "MVV Study - Researcher 90 Days Single MVV Study Researcher Researcher MVV Study NL",fee: "EUR 171 MVV Study Single + Residence EUR 228 Researcher MVV study + VFS 30 Researcher MVV study",validity: "MVV 90 days + Up to 5 Years Residence Permit",stay: "Duration of research grant",processing: "2 to 4 Weeks",purpose: "Visiting student researchers attached to Dutch academic centers",eligibility: "Researchers with EURAXESS / IND Hosting Agreement",officialSource: "https://ind.nl/en/residence-permits/work/researcher",categoryCode: "student",record_type: "RESEARCH_VISA",docs: ["Signed EURAXESS Academic Hosting Agreement ⭐","Stipend / Research Fellowship Grant Proof"]
  },
  {
    id: "nl-STU-014",officialCode: "NL-STU-014",name: "MVV Study - Au Pair 90 Days Single MVV Study Au Pair Au Pair MVV Study NL",fee: "EUR 171 MVV Study Single + Residence EUR 228 Au pair MVV study + VFS 30 Au pair MVV study",validity: "MVV 90 days + 1 Year Residence Permit",stay: "Max 1 Year non-renewable",processing: "4 Weeks",purpose: "Au pair cultural stay living with a Dutch host family",eligibility: "Young individuals aged 18–25 placed via an IND Recognized Au Pair Agency",officialSource: "https://ind.nl/en/residence-permits/exchange/au-pair",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["Contract with IND Recognized Au Pair Agency & Dutch Host Family ⭐","Au Pair Exchange Agreement detailing board, lodging, and monthly pocket money ⭐"]
  },

  // FAMILY 10 LIVE
  {
    id: "nl-FAM-001",
    officialCode: "NL-FAM-001",
    name: "MVV Family Partner 90 Days Single MVV Family Partner Family Reunification - Most common Family Netherlands",
    fee: "EUR 171 MVV Family Partner Single + Residence EUR 1446 Family Partner + VFS 30 Family Partner",
    validity: "MVV 90 days entry + 1 to 5 Years Residence Permit (Gezinshereniging)",
    stay: "1 to 5 Years (tied to sponsor's status)",
    processing: "6 to 12 Weeks (IND Decision)",
    purpose: "Family reunification with spouse, registered partner, or long-term partner living in Netherlands",
    eligibility: "Spouse or partner of Dutch citizen or foreign resident in NL (sponsor must earn min 100% statutory minimum wage EUR 2,070+/mo and applicant must pass Civic Integration Exam Abroad - Inburgeringsexamen buitenland)",
    officialSource: "https://ind.nl/en/residence-permits/family/apply-for-a-residence-permit-for-a-spouse-registered-or-unmarried-partner",
    popular: true,
    highlight: true,
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Apostilled/Legalised Marriage Certificate or Registered Partnership Certificate ⭐",
      "Passed Civic Integration Exam Abroad Certificate (Inburgeringsexamen buitenland) ⭐",
      "Sponsor's Income Proof in NL: Employment contract (min 1yr valid) + 3 past salary slips meeting minimum wage (EUR 2,070+/mo) ⭐",
      "Sponsor Dutch Passport or BRP / Residence Permit Copy",
      "Unmarried Partner Questionnaire & Relationship Proof (photos, chats, shared travel proof)",
      "Valid Passport + Completed MVV Family Application Form"
    ]
  },
  {
    id: "nl-FAM-002",officialCode: "NL-FAM-002",name: "MVV Family Child 90 Days Single MVV Family Child Child Family NL",fee: "EUR 171 MVV Family Child Single + Residence EUR 1446 Family Child + VFS 30 Family Child",validity: "MVV 90 days + Up to 5 Years Residence Permit",stay: "Tied to parent's residence permit",processing: "6 to 12 Weeks",purpose: "Reunification of minor child (under 18) with parent residing in the Netherlands",eligibility: "Minor children of Dutch citizens or legal residents holding custody rights",officialSource: "https://ind.nl/en/residence-permits/family/residence-permit-for-minor-child",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["Apostilled / Legalised Birth Certificate of Child ⭐","Custody / Parental Consent Declaration from second parent abroad (if applicable) ⭐","Sponsor Parent Income Proof in NL (EUR 2,070+/mo)"]
  },
  {
    id: "nl-FAM-003",officialCode: "NL-FAM-003",name: "Residence Family Partner 1Y 5Y Residence Family Partner Residence Family Partner NL",fee: "EUR 1446 Residence family partner NL",validity: "1 to 5 Years Residence Permit",stay: "1 to 5 Years",processing: "6 Weeks",purpose: "In-country partner residence permit conversion or extension",eligibility: "Spouses / partners residing in Netherlands with valid sponsor",officialSource: "https://ind.nl/en/residence-permits/family",categoryCode: "family",record_type: "RESIDENCE_PERMIT",docs: ["Legalised Marriage / Relationship Proof + Sponsor Income Proof ⭐","BRP Extract & IND Family Approval Decision"]
  },
  {
    id: "nl-FAM-004",officialCode: "NL-FAM-004",name: "Residence Family Child 1Y 5Y Residence Family Child Residence Family Child NL",fee: "EUR 1446 Residence family child NL",validity: "1 to 5 Years Residence Permit",stay: "Until age 18",processing: "6 Weeks",purpose: "In-country child residence permit",eligibility: "Minor children residing with parent in Netherlands",officialSource: "https://ind.nl/en/residence-permits/family",categoryCode: "family",record_type: "RESIDENCE_PERMIT",docs: ["Birth Certificate + Custody Proof + Parent BRP Extract ⭐"]
  },
  {
    id: "nl-FAM-005",officialCode: "NL-FAM-005",name: "MVV Family Extension Extension MVV Family 1Y Extension MVV Family NL",fee: "EUR 1446 Residence extension family NL",validity: "1 to 5 Years Extension",stay: "1 to 5 Years",processing: "4 to 6 Weeks",purpose: "Extension of family reunification permit",eligibility: "Family permit holders maintaining continuous relationship & sponsor income",officialSource: "https://ind.nl/en/extend-residence-permit",categoryCode: "family",record_type: "STATUS_DOCUMENT",docs: ["Sponsor Income Proof (EUR 2,070+/mo) + Joint BRP Registration Proof ⭐"]
  },
  {
    id: "nl-FAM-006",officialCode: "NL-FAM-006",name: "Residence Extension Extension Residence Family 1Y Extension Residence Family NL",fee: "EUR 1446 Residence extension family NL",validity: "1 to 5 Years Extension",stay: "1 to 5 Years",processing: "4 to 6 Weeks",purpose: "In-country extension of family member residence card",eligibility: "Partners/children extending family stay in NL",officialSource: "https://ind.nl/en/extend-residence-permit",categoryCode: "family",record_type: "STATUS_DOCUMENT",docs: ["Updated Sponsor Income Slips + BRP Extract"]
  },
  {
    id: "nl-FAM-007",officialCode: "NL-FAM-007",name: "MVV Family - Adoption 90 Days Single MVV Family Adoption Adoption MVV Family Adoption NL",fee: "EUR 171 MVV Family Adoption Single + Residence EUR 1446 Family Adoption + VFS 30 Family Adoption",validity: "MVV 90 days + Residence Permit",stay: "Permanent / Continuous",processing: "8 to 12 Weeks",purpose: "Bringing an adopted child or foster child to live with adoptive parents in NL",eligibility: "Adoptive parents with official Dutch court adoption approval and IND permission",officialSource: "https://ind.nl/en/residence-permits/family/foster-child-or-adopted-child",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["Dutch Court Adoption Approval / Principle Decision (Beginseltoestemming) ⭐","Apostilled Foreign Adoption Papers + Adoptive Parent Financial Proof"]
  },
  {
    id: "nl-FAM-008",officialCode: "NL-FAM-008",name: "Schengen C Family Visit 90 Days 180 Days Schengen C Family Visit Family Visit Short NL",fee: "EUR 90 Schengen C Family visit short NL",validity: "90 days within 180 days",stay: "Max 90 days",processing: "15 Days",purpose: "Short stay visit to relatives in the Netherlands",eligibility: "Family members visiting Dutch residents short term",officialSource: "https://ind.nl/en/short-stay-visa-netherlands",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["Municipal Legalised Host Guarantee Form (Bewijs van garantstelling) ⭐","Relationship Certificate + Return Ticket & Insurance EUR 30,000"]
  },
  {
    id: "nl-FAM-009",officialCode: "NL-FAM-009",name: "Schengen C Family Visit Extension Extension Schengen C Family Visit 90 Days Extension Schengen C Family Visit NL",fee: "EUR 0 IND extension Schengen C family visit NL",validity: "Extension up to 90 days",stay: "Extension of stay",processing: "5 Days",purpose: "Extending family visit short stay due to medical emergencies or severe personal reasons",eligibility: "Short stay visitors in NL experiencing unforeseen events",officialSource: "https://ind.nl/en/extend-short-stay-visa",categoryCode: "family",record_type: "STATUS_DOCUMENT",docs: ["Medical Certificate or Emergency Explanation + Host Letter ⭐"]
  },
  {
    id: "nl-FAM-010",officialCode: "NL-FAM-010",name: "MVV Family - EU Citizen Family EU Citizen Family MVV Family EU Citizen Family NL",fee: "EUR 0 EU citizen family NL",validity: "5 Years Residence Card (EU Directive 2004/38/EC - Verification against EU Law)",stay: "5 Years",processing: "4 Weeks",purpose: "Family member of non-Dutch EU/EEA citizen exercising treaty rights in NL",eligibility: "Family members of EU/EEA citizens working/living in the Netherlands",officialSource: "https://ind.nl/en/residence-permits/eu-eea-or-swiss-citizens/family-members-of-eu-eea-or-swiss-citizens",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["EU/EEA Citizen Passport + Proof EU Citizen exercises Treaty Rights in NL (Job contract/BRP) ⭐","Apostilled Marriage / Birth Certificate proving relationship ⭐","Free of charge application under EU Law Directive 2004/38/EC"]
  },

  // PR 6 LIVE + SPECIAL 20 LIVE = 26
  {
    id: "nl-PR-001",
    officialCode: "NL-PR-001",
    name: "Investor Visa EUR 1.25M Investor Visa EUR 1.25M - PR Netherlands - Investor EUR 1.25M",
    fee: "EUR 171 MVV Investor Single + Residence EUR 1446 Investor + Investment EUR 1.25M + VFS 30 Investor",
    validity: "3 Years Residence Permit (Convertible to Permanent Residence)",
    stay: "3 Years renewable",
    processing: "8 to 12 Weeks (IND + RVO Evaluation)",
    purpose: "Capital investment in Dutch enterprise, venture capital fund, or innovation firm",
    eligibility: "High-net-worth investors investing min EUR 1,250,000 in a Dutch company or fund creating employment/innovation",
    officialSource: "https://ind.nl/en/residence-permits/investors/investor",
    popular: true,
    highlight: true,
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "Proof of Capital Investment of min EUR 1,250,000 in Dutch Bank / Fund ⭐",
      "RVO Enterprise Evaluation Report confirming added value for Dutch economy & job creation ⭐",
      "Audited Capital Origin Certificate proving legal source of funds",
      "KvK Extract of Dutch Enterprise receiving investment",
      "Valid Passport + Completed IND Investor Application"
    ]
  },
  {
    id: "nl-PR-002",officialCode: "NL-PR-002",name: "Permanent Residence - 5Y Residence 5Y Residence Permanent Residence 5Y Residence NL",fee: "EUR 192 Permanent residence 5Y residence NL",validity: "Permanent Residence Permit (Onbepaalde tijd regulier)",stay: "Indefinite / Permanent",processing: "8 to 12 Weeks",purpose: "Permanent settlement in Netherlands after 5 years continuous legal stay",eligibility: "Foreign residents living in NL legally for 5 continuous years with passed Inburgering Diploma",officialSource: "https://ind.nl/en/residence-permits/permanent-residence/permanent-residence-permit-regular",popular: true,categoryCode: "pr",record_type: "PR_VISA",docs: ["Proof of 5 Years Continuous Legal BRP Residence in NL ⭐","Civic Integration Diploma (Inburgeringsdiploma) B1/A2 level ⭐","Independent & Sustainable Income Proof (Employment contract / Tax returns) ⭐"]
  },
  {
    id: "nl-PR-003",officialCode: "NL-PR-003",name: "EU Long Term Resident - 5Y EU Residence 5Y EU Residence EU Long Term Resident EU Long Term NL",fee: "EUR 192 EU long term resident 5Y EU residence NL",validity: "EU Long-Term Resident Status (EG - Langdurig ingezetene)",stay: "Indefinite / EU-wide mobility",processing: "8 to 12 Weeks",purpose: "EU-wide permanent residence status allowing intra-EU mobility",eligibility: "5 years continuous legal residence in NL meeting EU Directive conditions",officialSource: "https://ind.nl/en/residence-permits/permanent-residence/eu-long-term-resident-status",categoryCode: "pr",record_type: "PR_VISA",docs: ["5 Years BRP Residence Proof + Inburgeringsdiploma ⭐","Income proof & Health Insurance coverage in NL"]
  },
  {
    id: "nl-PR-004",officialCode: "NL-PR-004",name: "Permanent Residence - Highly Skilled Migrant 5Y Highly Skilled Migrant 5Y Permanent Highly Skilled Migrant NL",fee: "EUR 192 Permanent residence highly skilled migrant 5Y NL",validity: "Permanent Residence Permit for Skilled Workers",stay: "Indefinite",processing: "8 Weeks",purpose: "Permanent residence transition for Highly Skilled Migrant visa holders after 5 years",eligibility: "Kennismigrant visa holders completing 5 years employment in NL",officialSource: "https://ind.nl/en/residence-permits/permanent-residence",categoryCode: "pr",record_type: "PR_VISA",docs: ["5 Years Kennismigrant Work Contracts & Salary Slips ⭐","Inburgeringsdiploma + BRP continuous history"]
  },
  {
    id: "nl-PR-005",officialCode: "NL-PR-005",name: "Naturalization - After 5Y Residence Naturalization 5Y Residence Dutch Citizenship Dutch",fee: "EUR 1023 Naturalization + Dutch citizenship + Civic integration",validity: "Dutch Citizenship / Passport (Nederlandse nationaliteit)",stay: "Lifetime Citizenship",processing: "6 to 12 Months (Municipality & Royal Decree)",purpose: "Acquiring Dutch citizenship through naturalization",eligibility: "Legal residents living 5 continuous years in NL with passed Civic Integration Exam (Inburgering) and clean criminal record",officialSource: "https://ind.nl/en/dutch-citizenship/becoming-a-dutch-citizen-through-naturalisation",popular: true,categoryCode: "pr",record_type: "PR_VISA",docs: ["BRP Extract proving 5 Years Uninterrupted Legal Residence in NL ⭐","Inburgeringsdiploma (Civic Integration Diploma) ⭐","Apostilled Original Birth Certificate + Clean Conduct Certificate (VOG)"]
  },
  {
    id: "nl-PR-006",officialCode: "NL-PR-006",name: "Option - Dutch Citizenship Option Dutch Citizenship Option NL",fee: "EUR 206 Option Dutch citizenship NL",validity: "Dutch Citizenship via Option Procedure (Optieprocedure)",stay: "Lifetime Citizenship",processing: "3 Months",purpose: "Fast-track citizenship acquisition for eligible categories (born in NL, elderly residents, former Dutch citizens)",eligibility: "Specific eligible groups under Dutch Nationality Act (Rijkswet op het Nederlanderschap)",officialSource: "https://ind.nl/en/dutch-citizenship/becoming-a-dutch-citizen-option-procedure",categoryCode: "pr",record_type: "PR_VISA",docs: ["Municipality BRP Extract + Option Eligibility Certificate ⭐","Birth Certificate + Conduct Proof"]
  },
  {
    id: "nl-SPE-001",officialCode: "NL-SPE-001",name: "MVV - Au Pair 90 Days Single MVV Au Pair Au Pair NL",fee: "EUR 171 MVV Au Pair Single + Residence EUR 1446 Au Pair + VFS 30 Au Pair",validity: "1 Year Au Pair Stay",stay: "1 Year",processing: "4 Weeks",purpose: "Au pair cultural exchange stay",eligibility: "Youth aged 18-25 placed via IND recognized agency",officialSource: "https://ind.nl/en/residence-permits/exchange/au-pair",categoryCode: "pr",record_type: "STUDENT_VISA",docs: ["IND Recognized Agency Agreement + Host Family Contract ⭐"]
  },
  {
    id: "nl-SPE-002",officialCode: "NL-SPE-002",name: "MVV - Working Holiday WHP 1Y Working Holiday WHP 1Y WHP NL",fee: "EUR 171 MVV WHP Single + Residence EUR 1446 WHP + VFS 30 WHP",validity: "1 Year Working Holiday",stay: "1 Year",processing: "4 Weeks",purpose: "Working holiday program for youth",eligibility: "Citizens of Australia, Canada, NZ, South Korea, Japan, etc aged 18-30",officialSource: "https://ind.nl/en/residence-permits/exchange/working-holiday-program-whp",categoryCode: "pr",record_type: "WORK_VISA",docs: ["WHP Agreement Country Passport + Bank Funds & Return Ticket ⭐"]
  },
  {
    id: "nl-SPE-003",officialCode: "NL-SPE-003",name: "MVV - Working Holiday WYP 1Y Working Holiday WYP 1Y WYP NL",fee: "EUR 171 MVV WYP Single + Residence EUR 1446 WYP + VFS 30 WYP",validity: "1 Year Working Youth Program",stay: "1 Year",processing: "4 Weeks",purpose: "Working youth program",eligibility: "Young individuals under bilateral exchange agreements",officialSource: "https://ind.nl/en/residence-permits/exchange/working-holiday-program-whp",categoryCode: "pr",record_type: "WORK_VISA",docs: ["WYP Bilateral Agreement Eligibility Proof ⭐"]
  },
  {
    id: "nl-SPE-004",officialCode: "NL-SPE-004",name: "MVV - Cross Border Service Provider Cross Border Service Provider MVV Cross Border NL",fee: "EUR 171 MVV Cross Border Single + Residence EUR 1446 Cross Border + VFS 30 Cross Border",validity: "1 Year Service Provision",stay: "Duration of service contract",processing: "4 Weeks",purpose: "Posting of workers by EU/EEA companies to perform cross-border services in NL",eligibility: "Employees posted by EU firms under Van der Elst principle",officialSource: "https://ind.nl/en/residence-permits/work",categoryCode: "pr",record_type: "BUSINESS_VISA",docs: ["EU Employer Posting Declaration + Dutch Service Contract ⭐","A1 Certificate of Coverage in EU home country"]
  },
  {
    id: "nl-SPE-005",officialCode: "NL-SPE-005",name: "MVV - Scientific Researcher 90 Days Single MVV Scientific Researcher Scientific Researcher NL",fee: "EUR 171 MVV Scientific Researcher Single + Residence EUR 1446 Scientific Researcher + VFS 30 Scientific Researcher",validity: "1 to 5 Years Residence Permit",stay: "Duration of research",processing: "2 to 4 Weeks",purpose: "Scientific research conducted at recognized Dutch institutes",eligibility: "Researchers with IND Hosting Agreement",officialSource: "https://ind.nl/en/residence-permits/work/researcher",categoryCode: "pr",record_type: "RESEARCH_VISA",docs: ["IND Recognized Institution Hosting Agreement ⭐"]
  },
  {
    id: "nl-SPE-006",officialCode: "NL-SPE-006",name: "MVV - Medical Treatment 90 Days Single MVV Medical Treatment Medical Treatment NL",fee: "EUR 171 MVV Medical Treatment Single + Residence EUR 1446 Medical Treatment + VFS 30 Medical Treatment",validity: "1 Year Medical Residence",stay: "1 Year",processing: "4 Weeks",purpose: "Long-term medical treatment in Dutch hospital",eligibility: "Patients undergoing extended medical procedures in NL",officialSource: "https://ind.nl/en/residence-permits/medical-treatment",categoryCode: "pr",record_type: "MEDICAL_VISA",docs: ["Dutch Hospital Treatment Confirmation & Financial Guarantee ⭐"]
  },
  {
    id: "nl-SPE-007",officialCode: "NL-SPE-007",name: "MVV - Humanitarian Non Temporary 90 Days Single MVV Humanitarian Non Temporary Humanitarian Non Temporary NL",fee: "EUR 171 MVV Humanitarian Non Temporary Single + Residence EUR 1446 Humanitarian Non Temporary + VFS 30 Humanitarian Non Temporary",validity: "1 to 5 Years Residence Permit",stay: "1 to 5 Years",processing: "8 Weeks",purpose: "Humanitarian non-temporary residence permit",eligibility: "Individuals granted protection under humanitarian criteria",officialSource: "https://ind.nl/en/residence-permits/humanitarian",categoryCode: "pr",record_type: "HUMANITARIAN_VISA",docs: ["IND Humanitarian Decision Certificate ⭐"]
  },
  {
    id: "nl-SPE-008",officialCode: "NL-SPE-008",name: "MVV - Humanitarian Temporary 90 Days Single MVV Humanitarian Temporary Humanitarian Temporary NL",fee: "EUR 171 MVV Humanitarian Temporary Single + Residence EUR 1446 Humanitarian Temporary + VFS 30 Humanitarian Temporary",validity: "1 Year Temporary Residence",stay: "1 Year",processing: "8 Weeks",purpose: "Temporary humanitarian residence",eligibility: "Temporary protection grounds",officialSource: "https://ind.nl/en/residence-permits/humanitarian",categoryCode: "pr",record_type: "HUMANITARIAN_VISA",docs: ["IND Temporary Humanitarian Approval Decision ⭐"]
  },
  {
    id: "nl-SPE-009",officialCode: "NL-SPE-009",name: "Residence - Human Trafficking 1Y Residence Human Trafficking Residence Human Trafficking NL",fee: "EUR 0 Residence human trafficking NL",validity: "1 Year Residence Permit",stay: "1 Year",processing: "2 Weeks",purpose: "Residence permit for victims of human trafficking assisting law enforcement",eligibility: "Victims of human trafficking reporting to Dutch police/prosecution",officialSource: "https://ind.nl/en/residence-permits/humanitarian",categoryCode: "pr",record_type: "HUMANITARIAN_VISA",docs: ["Police Statement & Prosecution Referral Certificate ⭐"]
  },
  {
    id: "nl-SPE-010",officialCode: "NL-SPE-010",name: "Diplomat Visa Diplomat Visa Diplomat Visa Diplomat NL",fee: "EUR 0 Diplomat NL",validity: "Duration of diplomatic posting",stay: "Posting duration",processing: "1 to 2 Weeks",purpose: "Diplomatic mission officials posted to embassies in NL / Hague international organizations",eligibility: "Accredited diplomats holding diplomatic passports",officialSource: "https://www.government.nl/ministries/ministry-of-foreign-affairs",categoryCode: "pr",record_type: "DIPLOMAT_VISA",docs: ["Official Diplomatic Note Verbale from Foreign Ministry ⭐"]
  },
  {
    id: "nl-SPE-011",officialCode: "NL-SPE-011",name: "Official Visa Official Visa Official Visa Official NL",fee: "EUR 0 Official NL",validity: "Duration of official assignment",stay: "Assignment duration",processing: "1 to 2 Weeks",purpose: "Government officials on official state business in Netherlands",eligibility: "Delegates holding official/service passports",officialSource: "https://www.government.nl",categoryCode: "pr",record_type: "OFFICIAL_VISA",docs: ["Official Note Verbale & Duty Assignment Order ⭐"]
  },
  {
    id: "nl-SPE-012",officialCode: "NL-SPE-012",name: "Service Visa Service Visa Service Visa Service NL",fee: "EUR 0 Service NL",validity: "Duration of service",stay: "Service duration",processing: "1 to 2 Weeks",purpose: "Administrative and technical staff of foreign diplomatic missions",eligibility: "Service passport holders posted to NL",officialSource: "https://www.government.nl",categoryCode: "pr",record_type: "SERVICE_VISA",docs: ["Embassy Service Letter & Note Verbale ⭐"]
  },
  {
    id: "nl-SPE-013",officialCode: "NL-SPE-013",name: "Return Visa 90 Days Return Visa 90 Days Return Visa NL",fee: "EUR 148 Return visa NL",validity: "90 Days Entry Visa (Terugkeervisum)",stay: "Max 90 days",processing: "3 to 5 Days",purpose: "Urgent re-entry visa for Dutch residents waiting for replacement residence card",eligibility: "Dutch residence permit holders whose card is lost/expired needing emergency travel abroad",officialSource: "https://ind.nl/en/return-visa",categoryCode: "pr",record_type: "RETURN_VISA",docs: ["Proof of Pending IND Extension Application / Police Report for lost permit ⭐","Urgent Travel Need Explanation ⭐"]
  },
  {
    id: "nl-SPE-014",officialCode: "NL-SPE-014",name: "Caribbean Residence 1Y Caribbean Residence 1Y Caribbean Residence NL Caribbean",fee: "EUR 1446 Caribbean residence NL Caribbean",validity: "1 Year Caribbean Residence Permit",stay: "1 Year",processing: "6 Weeks",purpose: "Long-term residence permit in Dutch Caribbean (Aruba, Bonaire, Curaçao, etc.)",eligibility: "Residents relocating to Caribbean Netherlands",officialSource: "https://www.netherlandsworldwide.nl/caribbean-visa",categoryCode: "pr",record_type: "RESIDENCE_PERMIT",docs: ["Local Caribbean Territory Residence Approval & Financial Proof ⭐"]
  },
  {
    id: "nl-SPE-015",officialCode: "NL-SPE-015",name: "EU Citizen Registration EU Citizen Registration EU Citizen Registration NL",fee: "EUR 0 EU citizen registration NL",validity: "Continuous Residence Registration (EU/EEA Citizens)",stay: "Continuous",processing: "1 Day (BRP Registration at Dutch Municipality)",purpose: "Municipal registration for EU/EEA/Swiss citizens exercising treaty freedom of movement in NL",eligibility: "EU/EEA/Swiss citizens moving to Netherlands for work or study",officialSource: "https://ind.nl/en/residence-permits/eu-eea-or-swiss-citizens",categoryCode: "pr",record_type: "SPECIAL_VISA",docs: ["EU Passport / ID Card + Rental Contract / Proof of Residence Address ⭐","Employment contract or proof of sufficient financial means for BRP registration ⭐"]
  },
  {
    id: "nl-SPE-016",officialCode: "NL-SPE-016",name: "UK Citizen Withdrawal Agreement Withdrawal Agreement UK Citizen Withdrawal Agreement NL",fee: "EUR 0 UK citizen withdrawal agreement NL",validity: "5 Years / Permanent Residence Card",stay: "Permanent",processing: "4 Weeks",purpose: "Residence document for UK citizens resident in NL prior to Brexit transition end",eligibility: "UK nationals living in Netherlands before 31 December 2020",officialSource: "https://ind.nl/en/uk-citizens-and-their-family-members",categoryCode: "pr",record_type: "SPECIAL_VISA",docs: ["Proof of Residence in NL prior to 31 Dec 2020 (BRP Registration extract) ⭐"]
  },
  {
    id: "nl-SPE-017",officialCode: "NL-SPE-017",name: "Article 50 TEU Residence Article 50 TEU Residence Article 50 TEU Residence NL",fee: "EUR 0 Article 50 TEU residence NL",validity: "5 Years Residence Card under Article 50 TEU",stay: "5 Years",processing: "4 Weeks",purpose: "Brexit Withdrawal Agreement Article 50 TEU residence card",eligibility: "UK citizens and family members protected under Article 50 TEU",officialSource: "https://ind.nl/en/uk-citizens-and-their-family-members",categoryCode: "pr",record_type: "SPECIAL_VISA",docs: ["Article 50 TEU Eligibility Certificate + BRP History ⭐"]
  },
  {
    id: "nl-SPE-018",officialCode: "NL-SPE-018",name: "Long Term Resident EU Long Term Resident EU Long Term Resident EU NL",fee: "EUR 192 Long term resident EU NL",validity: "EU Long Term Residence Status",stay: "Permanent",processing: "8 Weeks",purpose: "EU-wide long-term resident card issued in NL",eligibility: "5 years legal residence in Netherlands meeting EU mobility criteria",officialSource: "https://ind.nl/en/residence-permits/permanent-residence/eu-long-term-resident-status",categoryCode: "pr",record_type: "RESIDENCE_PERMIT",docs: ["5 Years Continuous BRP Residence + Inburgeringsdiploma ⭐"]
  },
  {
    id: "nl-SPE-019",officialCode: "NL-SPE-019",name: "Highly Skilled Migrant Extension Extension Highly Skilled Migrant Extension Highly Skilled Migrant NL",fee: "EUR 1446 Highly skilled migrant extension NL",validity: "1 to 5 Years Extension",stay: "1 to 5 Years",processing: "2 Weeks",purpose: "Extension of Kennismigrant residence permit",eligibility: "Highly Skilled Migrants renewing contract with recognized sponsor",officialSource: "https://ind.nl/en/extend-residence-permit",categoryCode: "pr",record_type: "STATUS_DOCUMENT",docs: ["IND Recognized Sponsor Contract Extension + Salary Slips past 3 months ⭐"]
  },
  {
    id: "nl-SPE-020",officialCode: "NL-SPE-020",name: "EU Blue Card Extension Extension EU Blue Card Extension EU Blue Card NL",fee: "EUR 1446 EU Blue Card extension NL",validity: "1 to 4 Years Extension",stay: "1 to 4 Years",processing: "3 Weeks",purpose: "Extension of EU Blue Card in Netherlands",eligibility: "Blue Card holders renewing employment meeting EUR 5,008+/mo salary threshold",officialSource: "https://ind.nl/en/extend-residence-permit",categoryCode: "pr",record_type: "STATUS_DOCUMENT",docs: ["Extended Contract meeting Blue Card salary threshold + Tax Proof ⭐"]
  },

  // SUPPORTING 15 + LEGACY 10 = 25 SUPPORTING/LEGACY - NOT COUNTED IN 92 LIVE
  {id:"nl-SUP-001",officialCode:"NL-SUP-001",name:"IND Authority Immigration Naturalisation Service Authority Visa Residence",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["IND = Immigration and Naturalisation Service (Immigratie- en Naturalisatiedienst) - Official authority for Dutch visas, MVV, residence permits, and naturalisation. Website: ind.nl"]},
  {id:"nl-SUP-002",officialCode:"NL-SUP-002",name:"MVV Authority Machtiging tot Voorlopig Verblijf Authority Long Stay Visa MVV",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["MVV = Machtiging tot Voorlopig Verblijf - Long-stay entry visa sticker issued prior to entry for stays exceeding 90 days."]},
  {id:"nl-SUP-003",officialCode:"NL-SUP-003",name:"KvK Authority Kamer van Koophandel Authority Company Registration KvK",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["KvK = Kamer van Koophandel - Official Dutch Chamber of Commerce commercial registry for all enterprises and employers."]},
  {id:"nl-SUP-004",officialCode:"NL-SUP-004",name:"UWV Authority Uitvoeringsinstituut Werknemersverzekeringen Authority Work Permit",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["UWV = Employee Insurance Agency responsible for issuing Work Permits (Tewerkstellingsvergunning - TWV) and labour market tests."]},
  {id:"nl-SUP-005",officialCode:"NL-SUP-005",name:"RVO Authority Rijksdienst voor Ondernemend Nederland Authority Entrepreneur",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["RVO = Netherlands Enterprise Agency assessing startup facilitators, self-employed points system, and investor credentials."]},
  {id:"nl-SUP-006",officialCode:"NL-SUP-006",name:"TWV Authority Tewerkstellingsvergunning Authority Work Permit TWV",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["TWV = Tewerkstellingsvergunning - Specific work authorization document issued by UWV to Dutch employers."]},
  {id:"nl-SUP-007",officialCode:"NL-SUP-007",name:"VFS Global Authority Visa Application Center VFS",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["VFS Global - Official outsourced biometric and application collection partner for Kingdom of Netherlands worldwide."]},
  {id:"nl-SUP-008",officialCode:"NL-SUP-008",name:"Highly Skilled Migrant Authority Highly Skilled Migrant Authority Work Permit",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Kennismigrant scheme authority and salary threshold criteria maintained by IND."]},
  {id:"nl-SUP-009",officialCode:"NL-SUP-009",name:"EU Blue Card Authority EU Blue Card Authority Work Permit EU Blue Card",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["EU Blue Card scheme governance in Netherlands under Directive 2021/1883/EU."]},
  {id:"nl-SUP-010",officialCode:"NL-SUP-010",name:"Zoekjaar Authority Orientation Year Authority Graduate Zoekjaar",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Zoekjaar (Orientation Year) regulations for foreign graduates governed by IND."]},
  {id:"nl-SUP-011",officialCode:"NL-SUP-011",name:"WHP Authority Working Holiday Programme Authority Working Holiday WHP",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Working Holiday Programme bilateral agreement guidelines under IND."]},
  {id:"nl-SUP-012",officialCode:"NL-SUP-012",name:"Schengen Authority Schengen Visa Authority Short Stay Schengen",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Schengen Acquis and EU Common Visa Code rules applied at Dutch consulates."]},
  {id:"nl-SUP-013",officialCode:"NL-SUP-013",name:"Caribbean Authority Caribbean Visa Authority Caribbean Visa NL Caribbean",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Kingdom of Netherlands Caribbean territories visa regulation Framework."]},
  {id:"nl-SUP-014",officialCode:"NL-SUP-014",name:"FTD Authority Facilitated Transit Document Authority Transit FTD",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Facilitated transit framework regulations."]},
  {id:"nl-SUP-015",officialCode:"NL-SUP-015",name:"Withdrawal Agreement Authority Withdrawal Agreement Authority UK Citizen Withdrawal Agreement",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["EU-UK Brexit Withdrawal Agreement implementation in Netherlands."]},
  {id:"nl-LEG-001",officialCode:"NL-LEG-001",name:"Legacy Schengen C Visa Old System Closed Replaced by New Schengen C Visa VFS IND",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Legacy short stay Schengen visa system replaced by online VFS & IND portal."]},
  {id:"nl-LEG-002",officialCode:"NL-LEG-002",name:"Legacy MVV Old System Closed Replaced by New MVV Machtiging tot Voorlopig Verblijf",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Legacy MVV paper submission system replaced by digital IND sponsor portal."]},
  {id:"nl-LEG-003",officialCode:"NL-LEG-003",name:"Legacy Highly Skilled Migrant Old System Closed Replaced by New Highly Skilled Migrant Residence",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Historical highly skilled migrant scheme prior to 2024 salary threshold updates."]},
  {id:"nl-LEG-004",officialCode:"NL-LEG-004",name:"Legacy EU Blue Card Old System Closed Replaced by New EU Blue Card Residence",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Legacy EU Blue Card regulations superseded by 2024 Directive implementation."]},
  {id:"nl-LEG-005",officialCode:"NL-LEG-005",name:"Legacy Orientation Year Old System Closed Replaced by New Orientation Year Zoekjaar",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Old post-study work rules merged into unified 1-Year Zoekjaar hoogopgeleiden."]},
  {id:"nl-LEG-006",officialCode:"NL-LEG-006",name:"Legacy TWV Old System Closed Replaced by New TWV Tewerkstellingsvergunning UWV",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Old paper TWV work permit application replaced by UWV Werk.nl portal."]},
  {id:"nl-LEG-007",officialCode:"NL-LEG-007",name:"Legacy Caribbean Visa Old System Closed Replaced by New Caribbean Visa NL Caribbean",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former separate island entry permits unified under Kingdom Caribbean Visa."]},
  {id:"nl-LEG-008",officialCode:"NL-LEG-008",name:"Legacy WHP Old System Closed Replaced by New WHP Working Holiday Programme",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Previous working holiday quotas updated under new bilateral MOUs."]},
  {id:"nl-LEG-009",officialCode:"NL-LEG-009",name:"Legacy Investor Old System Closed Replaced by New Investor Visa EUR 1.25M",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Previous real estate investor pathways phased out in favor of RVO innovation fund investment."]},
  {id:"nl-LEG-010",officialCode:"NL-LEG-010",name:"Legacy Entrepreneur Start-up Old System Closed Replaced by New Entrepreneur Start-up Facilitator",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former self-employed startup path replaced by RVO approved Facilitator program."]}
];

function processVisaList(items: VisaItem[]): VisaItem[] {
  return items.map(item => {
    const micro = getNetherlandsMicroDetails(item.id, item.categoryCode || 'tourist', item.name);
    return {
      ...item,
      officialCode: item.officialCode || item.id,
      officialName: item.name,
      shortName: item.name.split(' - ')[0],
      isActive: item.record_type !== 'LEGACY_VISA' && item.record_type !== 'SUPPORTING_CLASSIFICATION',
      isLegacy: item.record_type === 'LEGACY_VISA',
      fundsBox: item.fundsBox || micro.fundsBox,
      itrBox: item.itrBox || micro.itrBox,
      bankBox: item.bankBox || micro.bankBox
    };
  });
}

const PROCESSED_NL = processVisaList(RAW_NL_VISAS);

export const NETHERLANDS_92_VISAS: CountryVisas = {
  tourist: PROCESSED_NL.filter(v => v.categoryCode === 'tourist'),
  business: PROCESSED_NL.filter(v => v.categoryCode === 'business'),
  work: PROCESSED_NL.filter(v => v.categoryCode === 'work'),
  student: PROCESSED_NL.filter(v => v.categoryCode === 'student'),
  family: PROCESSED_NL.filter(v => v.categoryCode === 'family'),
  pr: PROCESSED_NL.filter(v => v.categoryCode === 'pr')
};
