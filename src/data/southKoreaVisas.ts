import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getSouthKoreaMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "South Korea C-3 / D-2 / E-7 / F-2 Visas require proof of sufficient funds (min USD 3,000 / KRW 4,000,000 for tourist C-3, USD 20,000/year for D-2 Student, KRW 30,000,000/year income for F-2-7 / F-5 Permanent Residence, and KRW 100M - 500M for D-8 Investor).";
  let fundsBankMonths = "Last 3 to 6 months personal bank statements stamped by bank branch with regular balance history.";
  let fundsSudden = "❌ Sudden 1-day cash deposits before visa application or HiKorea extension are flagged and cause rejection. Average balance must be maintained over 3–6 months.";
  let fundsEx = "✅ Sahi: Seasoned bank balance of USD 3,000+ over 3 months. ❌ Galat: Borrowed cash deposited 24 hours prior to submission.";

  let itrYears = "Income Tax Returns (Grand Income Certificate / National Tax Service KR) for the past 1–3 years for work, business, investor, and PR applicants.";
  let itrMatch = "Reported tax income must match bank credits and employer pay slips.";
  let itrNoItr = "Not required for C-3 Short Term Tourists or D-2 Students sponsored by parents.";

  let bankMonths = "Last 3 to 6 months bank statements.";
  let bankReg = "Regular salary credits or steady income deposits.";
  let bankFd = "Fixed deposits and liquid wealth certificates accepted as supporting proof.";
  let bankSource = "Salary, corporate revenue, or verified parental sponsorship.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('e-7') || lowerCode.includes('wrk') || lowerCode.includes('e-2') || lowerCode.includes('e-9')) {
    fundsMin = "E-7 Professional Employment and E-2 Language Instructor require a Ministry of Justice work permit authorization + employment contract meeting Korean minimum wage standards. E-9 Non-Professional Employment requires EPS TOPIK + HRD Korea approval.";
    fundsBankMonths = "Employer company registration, employment contract, and 3-6 months pay slips.";
    fundsSudden = "Contracts must clearly specify gross salary in KRW, working hours, and social insurance coverage (4 Major Insurances).";
    fundsEx = "✅ Sahi: Sponsoring employer registration + Ministry of Justice work permit approval + E-7 contract. ❌ Galat: Unregistered employer or missing work permit authorization.";
  } else if (cat === 'student' || lowerCode.includes('d-2') || lowerCode.includes('d-4') || lowerCode.includes('stu')) {
    fundsMin = "D-2 Student Visa requires an official Standard Admission Letter from a recognized Korean university + tuition fee receipt + bank proof of USD 20,000 (or USD 10,000 for D-4 Language training outside Seoul region).";
    fundsBankMonths = "6 months personal or parent bank statements showing USD 20,000 liquid balance.";
    fundsSudden = "Parental affidavit of support and birth certificate required if using parent's bank statement.";
    fundsEx = "✅ Sahi: Official Standard Admission Letter + USD 20,000 bank certificate + tuition receipt. ❌ Galat: Unrecognized institute or sudden unverified deposit.";
  } else if (cat === 'family' || lowerCode.includes('f-2') || lowerCode.includes('f-6') || lowerCode.includes('fam')) {
    fundsMin = "F-6 Marriage Migrant requires a valid marriage certificate + Korean spouse income proof (min KRW 20.7M/year for 2-person household) + Korean language certificate (TOPIK Level 1+). F-2-3 Family Reunification requires host resident ARC card.";
    fundsBankMonths = "3–6 months pay slips, tax certificate, and bank statements of host sponsor in South Korea.";
    fundsSudden = "Marriage certificates must be apostilled or consular authenticated with certified Korean translation.";
    fundsEx = "✅ Sahi: Consular authenticated marriage certificate + Korean spouse tax certificate + TOPIK L1. ❌ Galat: Uncertified civil documents or income below threshold.";
  } else if (cat === 'business' || lowerCode.includes('c-3-4') || lowerCode.includes('d-8') || lowerCode.includes('biz')) {
    fundsMin = "C-3-4 Business Visitor requires an official invitation letter from a registered South Korean company (Business Registration Number / Saupja Deungnokjeung) + dispatch letter from foreign employer. D-8 Investor requires min KRW 100M investment.";
    fundsBankMonths = "3 to 6 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Korean company must be active with valid tax filing status on HiKorea.";
    fundsEx = "✅ Sahi: Korean host business registration + official invitation letter + dispatch proof. ❌ Galat: Unregistered host company.";
  } else if (cat === 'pr' || lowerCode.includes('f-5') || lowerCode.includes('f-2-7') || lowerCode.includes('pr')) {
    fundsMin = "F-5 Permanent Residence requires 5 years continuous legal stay in Korea (or 3 years for F-2-7) + annual GNI 2x income proof (approx KRW 80M+) + TOPIK Level 4+ / KIIP Completion. F-2-7 Points Visa requires 80+ points out of 170.";
    fundsBankMonths = "1–3 years Income Tax Certificates (NTS Korea) + HiKorea residence history.";
    fundsSudden = "Tax income must be verified directly through National Tax Service (Hometax) portal.";
    fundsEx = "✅ Sahi: 80+ points score / 5Y residence + NTS tax certificate + KIIP Level 5 certificate. ❌ Galat: Missing tax proof or insufficient residency days.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

export const SOUTH_KOREA_94_VISAS: CountryVisas = {
  tourist: [
    {
      id: "kr-TOU-001",
      officialCode: "KR-TOU-001",
      name: "C-3-9 Tourist Visa 90 Days (Single / Multiple Entry - Consulate & VFS)",
      categoryCode: "tourist",
      fee: "USD 40 + VFS service fee (USD 15)",
      validity: "90 days (Single) / 5 Years (Multiple)",
      stay: "Up to 90 days per visit",
      purpose: "Short term tourism, sightseeing, family visits, and leisure travel in South Korea.",
      eligibility: "Valid passport with 6 months validity, 2 blank pages, confirmed travel itinerary, hotel/host invitation, and liquid bank balance of min USD 3,000.",
      popular: true,
      highlight: true,
      record_type: "TOURIST_VISA",
      docs: [
        "Valid original passport (min 6 months validity, 2 blank pages & previous passports) ⭐",
        "Completed official South Korea Visa Application Form + VFS appointment slip",
        "2 recent biometric photographs (3.5x4.5cm white background)",
        "Confirmed round-trip flight booking & hotel reservation OR Host Invitation Letter with Host ARC ID copy ⭐",
        "Personal bank account statement for past 3 months (min USD 3,000 / KRW 4M balance with bank stamp) ⭐",
        "Employment certificate / NOC from employer / Business registration & pay slips for past 3 months",
        "Personal Income Tax Return (ITR) / Form 16 / Tax Assessment for past 2 years",
        "Detailed day-by-day travel itinerary in South Korea"
      ],
      ...getSouthKoreaMicroDetails("kr-TOU-001", "tourist", "C-3-9 Tourist Visa")
    },
    {
      id: "kr-TOU-002",
      officialCode: "KR-TOU-002",
      name: "C-3-1 Short Term General Visa 90 Days",
      categoryCode: "tourist",
      fee: "USD 40",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short term general visits, sports events, cultural programs, and non-commercial activities.",
      eligibility: "Valid passport, host invitation letter, proof of financial support, and travel itinerary.",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid original passport (6 months validity)",
        "Completed visa application form & photograph",
        "Host invitation letter & Korean host ID / ARC copy",
        "Personal bank statement for past 3 months",
        "Flight ticket itinerary & accommodation proof"
      ],
      ...getSouthKoreaMicroDetails("kr-TOU-002", "tourist", "C-3-1 Short Term General")
    },
    {
      id: "kr-TOU-003",
      officialCode: "KR-TOU-003",
      name: "C-3-2 Group Tourist Visa 90 Days",
      categoryCode: "tourist",
      fee: "USD 40 per person",
      validity: "90 days",
      stay: "90 days",
      purpose: "Organized group tourism through Ministry of Culture approved travel agencies.",
      eligibility: "Travelers in a group of 5 or more organized by licensed travel operator.",
      record_type: "TOURIST_VISA",
      docs: [
        "Group list & group invitation from authorized Korean travel agency",
        "Group travel operator registration certificate in Korea",
        "Valid passports for all group members",
        "Group flight itinerary & hotel confirmation"
      ],
      ...getSouthKoreaMicroDetails("kr-TOU-003", "tourist", "C-3-2 Group Tourist")
    },
    {
      id: "kr-TOU-004",
      officialCode: "KR-TOU-004",
      name: "B-2 Tourist Transit Visa Exemption 30 Days",
      categoryCode: "tourist",
      fee: "USD 0",
      validity: "30 days",
      stay: "30 days",
      purpose: "Visa-free transit stay for eligible passport holders transiting through Incheon International Airport.",
      eligibility: "Holders of valid visas/residence permits for US, Canada, Australia, NZ, or Schengen area transiting through Korea.",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid passport with min 6 months validity",
        "Confirmed onward ticket to third country within 30 days",
        "Valid visa / entry permit for final destination",
        "Proof of accommodation during transit stay"
      ],
      ...getSouthKoreaMicroDetails("kr-TOU-004", "tourist", "B-2 Tourist Transit")
    },
    {
      id: "kr-TOU-005",
      officialCode: "KR-TOU-005",
      name: "B-1 Visa Exemption Agreement 90 Days",
      categoryCode: "tourist",
      fee: "USD 0",
      validity: "90 days",
      stay: "Up to 90 days",
      purpose: "Visa-free entry under bilateral visa waiver agreements for eligible nationalities.",
      eligibility: "Citizens of visa waiver agreement countries (e.g., EU, US, Japan, Singapore).",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid passport of visa waiver eligible country",
        "Approved K-ETA application (if applicable)",
        "Return flight ticket & accommodation details"
      ],
      ...getSouthKoreaMicroDetails("kr-TOU-005", "tourist", "B-1 Visa Exemption")
    },
    {
      id: "kr-TOU-006",
      officialCode: "KR-TOU-006",
      name: "K-ETA Electronic Travel Authorization 90 Days",
      categoryCode: "tourist",
      fee: "KRW 10,000",
      validity: "Valid for 3 years",
      stay: "Up to 90 days per visit",
      purpose: "Mandatory pre-entry electronic authorization for visa-exempt foreign visitors entering Korea.",
      eligibility: "Citizens of 112 K-ETA eligible countries visiting for tourism, business, or meetings.",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid passport bio page upload",
        "Recent digital photo (under 100KB)",
        "Completed online K-ETA application on official k-eta.go.kr portal",
        "Credit card for KRW 10,000 application fee payment"
      ],
      ...getSouthKoreaMicroDetails("kr-TOU-006", "tourist", "K-ETA Authorization")
    },
    {
      id: "kr-TOU-008",
      officialCode: "KR-TOU-008",
      name: "C-3-3 Medical Treatment Visa 90 Days",
      categoryCode: "tourist",
      fee: "USD 40",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short-term medical treatment, diagnosis, or health checkups at certified Korean medical institutions.",
      eligibility: "Foreign patients with confirmed appointment at a Ministry of Health registered Korean hospital.",
      record_type: "MEDICAL_VISA",
      docs: [
        "Official hospital appointment letter from registered Korean medical institution",
        "Medical certificate & diagnosis report from home country doctor",
        "Financial proof covering treatment and stay costs (min USD 3,000+)",
        "Valid passport, application form, and flight itinerary"
      ],
      ...getSouthKoreaMicroDetails("kr-TOU-008", "tourist", "C-3-3 Medical Treatment")
    },
    {
      id: "kr-TOU-009",
      officialCode: "KR-TOU-009",
      name: "C-3 Cultural & Sports Event Visa 90 Days",
      categoryCode: "tourist",
      fee: "USD 40",
      validity: "90 days",
      stay: "90 days",
      purpose: "Participation in non-remunerated cultural events, sports competitions, or artistic performances.",
      eligibility: "Invited athletes, artists, and cultural event participants.",
      record_type: "CULTURAL_VISA",
      docs: [
        "Official invitation letter from Korean event organizer",
        "Event organizer registration certificate in Korea",
        "Event schedule & proof of non-remunerated participation",
        "Valid passport & financial bank statement"
      ],
      ...getSouthKoreaMicroDetails("kr-TOU-009", "tourist", "C-3 Cultural & Sports")
    },
    {
      id: "kr-TOU-011",
      officialCode: "KR-TOU-011",
      name: "C-3 Transit Visa 30 Days",
      categoryCode: "tourist",
      fee: "USD 40",
      validity: "30 days",
      stay: "30 days",
      purpose: "Short term transit through South Korea to a third destination.",
      eligibility: "Passengers holding confirmed onward ticket and destination visa.",
      record_type: "TRANSIT_VISA",
      docs: [
        "Valid passport & confirmed onward flight ticket",
        "Entry visa for final destination country",
        "Bank statement showing travel funds"
      ],
      ...getSouthKoreaMicroDetails("kr-TOU-011", "tourist", "C-3 Transit Visa")
    },
    {
      id: "kr-TOU-012",
      officialCode: "KR-TOU-012",
      name: "C-3 Extension of Stay 90 Days (HiKorea Immigration Portal)",
      categoryCode: "tourist",
      fee: "KRW 60,000",
      validity: "90 days extension",
      stay: "Up to additional 90 days",
      purpose: "Extension of short term stay due to unforeseen medical, travel, or flight disruptions.",
      eligibility: "Current C-3 visa holders with valid humanitarian or unavoidable reasons before expiry.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Statement of reason for stay extension",
        "Supporting medical or flight cancellation proof",
        "Valid passport & Alien Registration / Entry stamp copy",
        "Application submitted online via HiKorea portal (hikorea.go.kr)"
      ],
      ...getSouthKoreaMicroDetails("kr-TOU-012", "tourist", "C-3 Stay Extension")
    },
    {
      id: "kr-SPE-003",
      officialCode: "KR-SPE-003",
      name: "G-1 Medical & Humanitarian Stay Permit 1 Year",
      categoryCode: "tourist",
      fee: "USD 60",
      validity: "1 year",
      stay: "1 year renewable",
      purpose: "Long-term medical treatment, litigation, or humanitarian grounds.",
      eligibility: "Patients requiring extended medical care exceeding 90 days certified by Korean hospital.",
      record_type: "MEDICAL_VISA",
      docs: [
        "Long-term medical treatment certificate from Korean hospital",
        "Proof of sufficient financial means or hospital deposit",
        "Valid passport & application form"
      ],
      ...getSouthKoreaMicroDetails("kr-SPE-003", "tourist", "G-1 Medical Humanitarian")
    },
    {
      id: "kr-SPE-004",
      officialCode: "KR-SPE-004",
      name: "G-1 Refugee Status Seeker Permit 1 Year",
      categoryCode: "tourist",
      fee: "USD 0",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Temporary residence permit for individuals undergoing refugee status determination by Ministry of Justice.",
      eligibility: "Applicants who have officially lodged a refugee claim in South Korea.",
      record_type: "REFUGEE_VISA",
      docs: [
        "Refugee status application acknowledgment receipt",
        "Ministry of Justice authorization certificate",
        "Valid passport or travel identity document"
      ],
      ...getSouthKoreaMicroDetails("kr-SPE-004", "tourist", "G-1 Refugee Permit")
    },
    {
      id: "kr-SPE-005",
      officialCode: "KR-SPE-005",
      name: "D-6 Religious Worker Visa 2 Years",
      categoryCode: "tourist",
      fee: "USD 60",
      validity: "2 years",
      stay: "2 years renewable",
      purpose: "Religious missionary, ministerial work, or social welfare activities dispatched by foreign religious groups.",
      eligibility: "Ordained ministers or religious representatives invited by registered Korean religious bodies.",
      record_type: "RELIGIOUS_VISA",
      docs: [
        "Official invitation from registered Korean religious organization",
        "Registration certificate of Korean religious body",
        "Dispatch letter & ordination certificate from foreign religious headquarter",
        "Valid passport & financial support guarantee"
      ],
      ...getSouthKoreaMicroDetails("kr-SPE-005", "tourist", "D-6 Religious Worker")
    },
    {
      id: "kr-SPE-010",
      officialCode: "KR-SPE-010",
      name: "K-ETA Re-Authorization & Extension 90 Days",
      categoryCode: "tourist",
      fee: "KRW 10,000",
      validity: "3 years",
      stay: "90 days per visit",
      purpose: "Updating passport or personal information on active K-ETA authorization.",
      eligibility: "Existing K-ETA holders who have renewed passport or changed biographical details.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "New valid passport bio page copy",
        "Updated flight and address details",
        "K-ETA online update via k-eta.go.kr"
      ],
      ...getSouthKoreaMicroDetails("kr-SPE-010", "tourist", "K-ETA Re-Authorization")
    }
  ],
  business: [
    {
      id: "kr-BIZ-001",
      officialCode: "KR-BIZ-001",
      name: "C-3-4 Business Short Term Visa 90 Days (Consulate & VFS)",
      categoryCode: "business",
      fee: "USD 40 + VFS service fee (USD 15)",
      validity: "90 days (Single / Multiple)",
      stay: "Up to 90 days per visit",
      purpose: "Market research, commercial negotiations, contracting, and business meetings in South Korea.",
      eligibility: "Business representatives invited by a registered Korean company with valid Business Registration Number.",
      popular: true,
      highlight: true,
      record_type: "BUSINESS_VISA",
      docs: [
        "Valid original passport (min 6 months validity & 2 blank pages) ⭐",
        "Official invitation letter from sponsoring Korean company (signed with corporate seal) ⭐",
        "Copy of Korean host company Business Registration Certificate (Saupja Deungnokjeung) ⭐",
        "Dispatch letter / Employment certificate from foreign employer stating position & purpose of visit ⭐",
        "Foreign employer company registration copy & business card",
        "Personal / Corporate bank statement for past 3 months",
        "Completed visa application form & photograph"
      ],
      ...getSouthKoreaMicroDetails("kr-BIZ-001", "business", "C-3-4 Business Short Term")
    },
    {
      id: "kr-BIZ-002",
      officialCode: "KR-BIZ-002",
      name: "C-2 Business Long Term Visa 1 Year",
      categoryCode: "business",
      fee: "USD 60",
      validity: "1 year multiple",
      stay: "90 days per entry",
      purpose: "Frequent long-term business visits for executive managers and commercial representatives.",
      eligibility: "Executives of multinational firms with frequent commercial travel to Korea.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Host Korean company invitation & corporate registry",
        "Dispatch letter from parent firm & corporate tax filings",
        "Past travel history to South Korea",
        "Valid passport & application form"
      ],
      ...getSouthKoreaMicroDetails("kr-BIZ-002", "business", "C-2 Business Long Term")
    },
    {
      id: "kr-BIZ-003",
      officialCode: "KR-BIZ-003",
      name: "D-7 Intra-Company Transfer Visa 2 Years",
      categoryCode: "business",
      fee: "USD 60 + Work permit authorization",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Transfer of executive or technical staff from foreign parent company to Korean branch / subsidiary.",
      eligibility: "Staff with at least 1 year service at foreign parent company transferred to Korean entity.",
      record_type: "WORK_VISA",
      docs: [
        "Ministry of Justice Work Permit Confirmation (Sacheong Balgeup Injeongseo) ⭐",
        "Korean branch / subsidiary registration & corporate tax filings",
        "Foreign parent company dispatch order & employment contract",
        "Proof of 1+ year employment at foreign parent firm",
        "Valid passport & Alien Registration Application"
      ],
      ...getSouthKoreaMicroDetails("kr-BIZ-003", "business", "D-7 Intra-Company Transfer")
    },
    {
      id: "kr-BIZ-004",
      officialCode: "KR-BIZ-004",
      name: "D-8 Corporate Foreign Investor Visa 2 Years (KRW 100M+)",
      categoryCode: "business",
      fee: "USD 60 + FDI Registration",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Foreign Direct Investment (FDI) in Korean corporations under Foreign Investment Promotion Act.",
      eligibility: "Foreign investors injecting min KRW 100,000,000 into a Korean corporate enterprise with 10%+ voting rights.",
      record_type: "INVESTOR_VISA",
      docs: [
        "Foreign Direct Investment (FDI) Registration Certificate (KOTRA / Bank) ⭐",
        "Korean Foreign Investment Company Registration Certificate",
        "Bank capital transfer confirmation (Foreign Exchange Receipt)",
        "Comprehensive Business Plan & Office Lease Agreement in Korea",
        "Investor passport & background history"
      ],
      ...getSouthKoreaMicroDetails("kr-BIZ-004", "business", "D-8 Corporate Investor")
    },
    {
      id: "kr-BIZ-005",
      officialCode: "KR-BIZ-005",
      name: "D-9 Trade Management Visa 2 Years",
      categoryCode: "business",
      fee: "USD 60",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Establishing and managing international trade businesses or plant construction management in Korea.",
      eligibility: "Trade managers with registered trading company and proven trade performance.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Trade Business Registration (Trading Business Code Certificate)",
        "Proof of trade capital and customs export/import clearance records",
        "Company registration & office lease contract",
        "Valid passport & application form"
      ],
      ...getSouthKoreaMicroDetails("kr-BIZ-005", "business", "D-9 Trade Management")
    },
    {
      id: "kr-BIZ-007",
      officialCode: "KR-BIZ-007",
      name: "APEC Business Travel Card (ABTC) 5 Years",
      categoryCode: "business",
      fee: "USD 0",
      validity: "5 years",
      stay: "Up to 90 days per entry",
      purpose: "Fast-track business entry and dedicated fast-lane clearance for APEC economy executives.",
      eligibility: "Approved business executives holding APEC Business Travel Card with KR clearance.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Valid APEC Business Travel Card with KR printed on back",
        "Valid passport matching ABTC details",
        "Business dispatch proof"
      ],
      ...getSouthKoreaMicroDetails("kr-BIZ-007", "business", "APEC Business Travel Card")
    },
    {
      id: "kr-BIZ-008",
      officialCode: "KR-BIZ-008",
      name: "C-3-4 Business Extension 90 Days (HiKorea Portal)",
      categoryCode: "business",
      fee: "KRW 60,000",
      validity: "90 days extension",
      stay: "Up to 90 days extension",
      purpose: "Extension of short-term business stay for ongoing commercial negotiations or project installation.",
      eligibility: "C-3-4 holders with written request from Korean sponsoring company.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Sponsoring Korean company extension request letter",
        "Korean company business registration certificate",
        "Ongoing business contract or technical installation proof",
        "HiKorea online application submission"
      ],
      ...getSouthKoreaMicroDetails("kr-BIZ-008", "business", "C-3-4 Business Extension")
    },
    {
      id: "kr-BIZ-009",
      officialCode: "KR-BIZ-009",
      name: "D-8 Investor Visa Extension 2 Years",
      categoryCode: "business",
      fee: "USD 60",
      validity: "2 years extension",
      stay: "2 years",
      purpose: "Renewal of D-8 corporate investor status based on ongoing corporate revenue & tax compliance.",
      eligibility: "D-8 holders with active Korean corporate operations and tax filings.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Corporate Income Tax Settlement Certificate (NTS Korea)",
        "Company VAT Filing Certificate & employee 4-insurance records",
        "Active office lease contract & corporate bank statement",
        "HiKorea extension application"
      ],
      ...getSouthKoreaMicroDetails("kr-BIZ-009", "business", "D-8 Investor Extension")
    },
    {
      id: "kr-BIZ-010",
      officialCode: "KR-BIZ-010",
      name: "D-9 Trade Management Extension 2 Years",
      categoryCode: "business",
      fee: "USD 60",
      validity: "2 years extension",
      stay: "2 years",
      purpose: "Extension of D-9 trade manager status based on annual trade turnover.",
      eligibility: "D-9 holders demonstrating continuous international trade activity.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Customs Export/Import Declaration Certificates",
        "NTS Corporate Tax Certificate & office lease",
        "HiKorea extension application"
      ],
      ...getSouthKoreaMicroDetails("kr-BIZ-010", "business", "D-9 Trade Extension")
    },
    {
      id: "kr-TOU-007",
      officialCode: "KR-TOU-007",
      name: "C-3-4 Business Meetings & Negotiations Visa 90 Days",
      categoryCode: "business",
      fee: "USD 40",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short term business meetings, trade shows, and contract signings.",
      eligibility: "Foreign business delegates with Korean corporate invitation.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Korean company invitation letter & business registration",
        "Foreign company dispatch letter & pay slips",
        "Valid passport & bank statement"
      ],
      ...getSouthKoreaMicroDetails("kr-TOU-007", "business", "C-3-4 Business Meetings")
    },
    {
      id: "kr-TOU-010",
      officialCode: "KR-TOU-010",
      name: "C-3 Conference & Seminar Visa 90 Days",
      categoryCode: "business",
      fee: "USD 40",
      validity: "90 days",
      stay: "90 days",
      purpose: "Attending international conferences, academic symposiums, or industry summits.",
      eligibility: "Registered delegates or speakers at Korean government / academic conferences.",
      record_type: "CONFERENCE_VISA",
      docs: [
        "Conference invitation & registration confirmation",
        "Conference program schedule & speaker details",
        "Valid passport & bank statement"
      ],
      ...getSouthKoreaMicroDetails("kr-TOU-010", "business", "C-3 Conference Visa")
    },
    {
      id: "kr-SPE-001",
      officialCode: "KR-SPE-001",
      name: "A-1 Diplomat Visa",
      categoryCode: "business",
      fee: "USD 0",
      validity: "Duration of diplomatic mission",
      stay: "Official posting period",
      purpose: "Diplomatic missions, embassy postings, and official bilateral state visits.",
      eligibility: "Accredited foreign diplomats and embassy officials.",
      record_type: "DIPLOMAT_VISA",
      docs: [
        "Diplomatic Note Verbale from foreign Ministry of Foreign Affairs",
        "Diplomatic Passport copy",
        "Official posting order in Korea"
      ],
      ...getSouthKoreaMicroDetails("kr-SPE-001", "business", "A-1 Diplomat Visa")
    },
    {
      id: "kr-SPE-002",
      officialCode: "KR-SPE-002",
      name: "A-2 Official State Mission Visa",
      categoryCode: "business",
      fee: "USD 0",
      validity: "Duration of official assignment",
      stay: "Official assignment period",
      purpose: "Official government business, consular staff, and international organization missions.",
      eligibility: "Foreign government officials on state duties.",
      record_type: "OFFICIAL_VISA",
      docs: [
        "Official Note Verbale from government ministry",
        "Official / Service passport",
        "Official mission assignment letter"
      ],
      ...getSouthKoreaMicroDetails("kr-SPE-002", "business", "A-2 Official Mission")
    },
    {
      id: "kr-SPE-006",
      officialCode: "KR-SPE-006",
      name: "D-5 Foreign Journalist Resident Visa 2 Years",
      categoryCode: "business",
      fee: "USD 60",
      validity: "2 years",
      stay: "2 years renewable",
      purpose: "Resident foreign news correspondents, bureau chiefs, and media journalists in Korea.",
      eligibility: "Accredited foreign media journalists dispatched to Korea.",
      record_type: "JOURNALIST_VISA",
      docs: [
        "Dispatch order from headquarter foreign news agency",
        "International press credential / Ministry of Culture press card",
        "Bureau establishment authorization in Korea",
        "Valid passport & employment contract"
      ],
      ...getSouthKoreaMicroDetails("kr-SPE-006", "business", "D-5 Foreign Journalist")
    },
    {
      id: "kr-SPE-007",
      officialCode: "KR-SPE-007",
      name: "C-1 Temporary News Coverage Visa 90 Days",
      categoryCode: "business",
      fee: "USD 40",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short term media reporting, documentary filming, or event news coverage.",
      eligibility: "Visiting journalists and film crews on short assignments.",
      record_type: "JOURNALIST_VISA",
      docs: [
        "Press credential & foreign media assignment letter",
        "Filming schedule & press coverage plan in Korea",
        "Valid passport & application form"
      ],
      ...getSouthKoreaMicroDetails("kr-SPE-007", "business", "C-1 Temporary News")
    },
    {
      id: "kr-SPE-009",
      officialCode: "KR-SPE-009",
      name: "C-3-8 Business Visitor (APEC Economy National) 90 Days",
      categoryCode: "business",
      fee: "USD 0",
      validity: "90 days",
      stay: "90 days",
      purpose: "Streamlined short-term business entry for APEC country nationals.",
      eligibility: "Nationals of APEC member economies visiting for commercial meetings.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Valid passport of APEC economy",
        "Korean company business invitation letter",
        "Dispatch letter & corporate ID"
      ],
      ...getSouthKoreaMicroDetails("kr-SPE-009", "business", "C-3-8 APEC Business")
    }
  ],
  work: [
    {
      id: "kr-WRK-001",
      officialCode: "KR-WRK-001",
      name: "E-7 Professional Employment Visa 2 Years (E-7-1 / E-7-2 / E-7-3 - Skilled Work)",
      categoryCode: "work",
      fee: "USD 60 + Work permit authorization",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Skilled employment in 87 designated professional occupations (IT, engineering, finance, marketing, translation, management).",
      eligibility: "Bachelor degree + 1 year relevant work experience OR Master degree in relevant field + Sponsoring Korean company meeting local hiring ratio (20%+ local staff).",
      popular: true,
      highlight: true,
      record_type: "WORK_VISA",
      docs: [
        "Ministry of Justice Work Permit Confirmation Certificate (Sacheong Balgeup Injeongseo) ⭐",
        "Official Korean Employment Contract meeting minimum wage criteria (GNI 80%+ for E-7-1) ⭐",
        "University Degree Certificate & Transcripts (apostilled or consular authenticated) ⭐",
        "Work Experience Certificates (verifying required 1+ year experience)",
        "Korean Sponsoring Company Business Registration (Saupja Deungnokjeung) & Corporate Registry",
        "Company Local Employee 4 Major Insurance List (proving local hiring ratio)",
        "Statement of Need for Foreign Recruitment (Sayooseo signed by CEO)",
        "Valid passport, ARC application form, and passport photos"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-001", "work", "E-7 Professional Employment")
    },
    {
      id: "kr-WRK-002",
      officialCode: "KR-WRK-002",
      name: "E-2 Foreign Language Instructor Visa 2 Years (English / Foreign Languages)",
      categoryCode: "work",
      fee: "USD 60",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Teaching native foreign languages at Korean schools, hagwons (private academies), and universities.",
      eligibility: "Native speaker passport (US, UK, CA, AU, NZ, IE, ZA) + Bachelor's degree + Clean FBI / Nationwide Criminal Record Check (Apostilled).",
      record_type: "WORK_VISA",
      docs: [
        "Ministry of Justice Visa Issuance Confirmation Certificate (E-2) ⭐",
        "Apostilled Nationwide Criminal Record Check (FBI / Police Check under 6 months) ⭐",
        "Apostilled Bachelor Degree Certificate ⭐",
        "Self-Medical Health Checklist & sealed medical exam upon arrival in Korea",
        "Korean School / Hagwon Employment Contract & Registration License",
        "Valid passport & passport photos"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-002", "work", "E-2 Language Instructor")
    },
    {
      id: "kr-WRK-003",
      officialCode: "KR-WRK-003",
      name: "E-9 Non-Professional Employment EPS Visa 4 Years 10 Months",
      categoryCode: "work",
      fee: "USD 60 + EPS Program Fees",
      validity: "4 years 10 months",
      stay: "Up to 4 years 10 months",
      purpose: "Non-professional employment in manufacturing, agriculture, construction, fishing, and service industries.",
      eligibility: "Government-to-government EPS (Employment Permit System) candidates passing EPS-TOPIK exam.",
      record_type: "WORK_VISA",
      docs: [
        "EPS Standard Employment Contract from HRD Korea ⭐",
        "EPS-TOPIK Korean Language Test Certificate ⭐",
        "HRD Korea Overseas Employment Authorization",
        "Health examination medical certificate",
        "Valid passport & visa application form"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-003", "work", "E-9 EPS Non-Professional")
    },
    {
      id: "kr-WRK-004",
      officialCode: "KR-WRK-004",
      name: "E-1 Professor Visa 2 Years",
      categoryCode: "work",
      fee: "USD 60",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Higher education teaching and academic research at Korean colleges and universities.",
      eligibility: "Master's or Doctoral degree holders invited by accredited Korean universities.",
      record_type: "WORK_VISA",
      docs: [
        "University Faculty Appointment Contract / Employment Letter ⭐",
        "Apostilled Master's / PhD Degree Certificate",
        "University Business Registration & Ministry of Education accreditation",
        "Valid passport & academic publication records"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-004", "work", "E-1 Professor Visa")
    },
    {
      id: "kr-WRK-005",
      officialCode: "KR-WRK-005",
      name: "E-3 Researcher Visa 2 Years",
      categoryCode: "work",
      fee: "USD 60",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Natural science, engineering, or advanced technology research at Korean research institutes.",
      eligibility: "Master's / PhD degree in STEM fields invited by public or corporate research centers.",
      record_type: "RESEARCH_VISA",
      docs: [
        "Research Institute Employment / Research Contract ⭐",
        "Apostilled STEM Degree Certificate & academic transcripts",
        "Research project details & institute registration certificate",
        "Valid passport & publication list"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-005", "work", "E-3 Researcher Visa")
    },
    {
      id: "kr-WRK-006",
      officialCode: "KR-WRK-006",
      name: "E-4 Technical Instructor Visa 2 Years",
      categoryCode: "work",
      fee: "USD 60",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Providing technical expertise, industrial machinery training, or specialized engineering instruction.",
      eligibility: "Technical specialists invited by Korean industrial enterprises.",
      record_type: "WORK_VISA",
      docs: [
        "Technical Instruction Contract with Korean firm",
        "Specialized technical qualification certificates & experience records",
        "Korean company business registration & machinery import records",
        "Valid passport & application form"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-006", "work", "E-4 Technical Instructor")
    },
    {
      id: "kr-WRK-007",
      officialCode: "KR-WRK-007",
      name: "E-5 Professional Employment Specialist Visa 2 Years",
      categoryCode: "work",
      fee: "USD 60",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Licensed foreign professionals (lawyers, CPAs, pilots, medical specialists) practicing under Korean law.",
      eligibility: "Holders of recognized international professional licenses authorized by Korean government ministries.",
      record_type: "WORK_VISA",
      docs: [
        "Professional license certificate (Apostilled & recognized in Korea)",
        "Employment contract with Korean professional firm / airline / medical center",
        "Korean ministry authorization letter",
        "Valid passport & application form"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-007", "work", "E-5 Professional Specialist")
    },
    {
      id: "kr-WRK-008",
      officialCode: "KR-WRK-008",
      name: "E-6 Arts & Entertainment Visa 2 Years",
      categoryCode: "work",
      fee: "USD 60",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Remunerated performances in music, modeling, sports, broadcasting, or entertainment.",
      eligibility: "Artists, models, athletes, and performers with Korean agency contracts.",
      record_type: "WORK_VISA",
      docs: [
        "Ministry of Culture, Sports and Tourism Performance Recommendation Letter ⭐",
        "Entertainment Agency Contract & Registration Certificate",
        "Performance venue contract & activity itinerary",
        "Valid passport & artist profile portfolio"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-008", "work", "E-6 Arts & Entertainment")
    },
    {
      id: "kr-WRK-009",
      officialCode: "KR-WRK-009",
      name: "E-10 Maritime Crew Work Visa 2 Years",
      categoryCode: "work",
      fee: "USD 60",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Seaman and crew employment on Korean coastal or ocean-going vessels.",
      eligibility: "Qualified maritime crew with Korean shipping company contracts.",
      record_type: "WORK_VISA",
      docs: [
        "Seaman Employment Contract with Korean maritime company",
        "Seaman's Book (CDC) & STCW maritime qualification certificates",
        "Vessel registration certificate in Korea",
        "Valid passport & medical fitness certificate"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-009", "work", "E-10 Maritime Crew")
    },
    {
      id: "kr-WRK-010",
      officialCode: "KR-WRK-010",
      name: "H-2 Working Visit Visa 3 Years (Overseas Ethnic Koreans)",
      categoryCode: "work",
      fee: "USD 60",
      validity: "3 years renewable",
      stay: "3 years",
      purpose: "Employment in service, manufacturing, and agricultural sectors for ethnic Koreans (China / CIS).",
      eligibility: "Ethnic Koreans holding foreign citizenship aged 18+.",
      record_type: "WORK_VISA",
      docs: [
        "Proof of ethnic Korean heritage (family registry / lineage records)",
        "H-2 Job Search Education Completion Certificate in Korea",
        "Clean Criminal Record Check",
        "Valid passport & application form"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-010", "work", "H-2 Working Visit")
    },
    {
      id: "kr-WRK-011",
      officialCode: "KR-WRK-011",
      name: "E-7 Extension of Professional Work Permit 2 Years (HiKorea Portal)",
      categoryCode: "work",
      fee: "USD 60 + HiKorea Fee",
      validity: "2 years extension",
      stay: "2 years",
      purpose: "Renewal of E-7 work status based on continuous employment & tax compliance.",
      eligibility: "Current E-7 holders maintaining valid employment contract and salary threshold.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Renewed Employment Contract signed by CEO",
        "NTS Income Tax Certificate (Earned Income Tax Withholding Receipt)",
        "Employer 4 Major Insurance Employee List",
        "HiKorea online extension submission"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-011", "work", "E-7 Work Extension")
    },
    {
      id: "kr-WRK-012",
      officialCode: "KR-WRK-012",
      name: "E-9 Extension of EPS Work Contract (HiKorea Portal)",
      categoryCode: "work",
      fee: "USD 60",
      validity: "Up to 1 year 10 months extension",
      stay: "Matches contract",
      purpose: "Extension of EPS contract up to total 4 years 10 months.",
      eligibility: "E-9 workers with employer contract renewal approved by HRD Korea.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "HRD Korea Contract Extension Approval",
        "Renewed EPS Employment Contract",
        "HiKorea online extension application"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-012", "work", "E-9 Work Extension")
    },
    {
      id: "kr-WRK-013",
      officialCode: "KR-WRK-013",
      name: "E-2 Language Instructor Visa Extension 2 Years",
      categoryCode: "work",
      fee: "USD 60",
      validity: "2 years extension",
      stay: "2 years",
      purpose: "Extension of E-2 teaching permit with same or new school/hagwon.",
      eligibility: "E-2 holders with renewed teaching contract.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Renewed School / Hagwon Contract",
        "School registration license & timetable",
        "NTS Earned Income Tax Certificate",
        "HiKorea extension application"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-013", "work", "E-2 Instructor Extension")
    },
    {
      id: "kr-WRK-014",
      officialCode: "KR-WRK-014",
      name: "D-10 Job Seeker Visa 6 Months (Renewable up to 2 Years)",
      categoryCode: "work",
      fee: "USD 60",
      validity: "6 months (renewable)",
      stay: "6 months",
      purpose: "Searching for professional employment or internship in Korea after graduating or leaving job.",
      eligibility: "Graduates of Korean universities OR former E-1 to E-7 skilled visa holders meeting points system.",
      record_type: "WORK_VISA",
      docs: [
        "D-10 Points Evaluation Worksheet (min 20 points required out of 190, 50+ total) ⭐",
        "Detailed Job Seeking Action Plan for next 6 months ⭐",
        "Degree Certificate / Former Employment Certificate",
        "Bank statement showing min KRW 4.5M (for 6 months living costs)",
        "Valid passport & ARC copy"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-014", "work", "D-10 Job Seeker Visa")
    },
    {
      id: "kr-BIZ-006",
      officialCode: "KR-BIZ-006",
      name: "C-4 Short Term Employment Visa 90 Days",
      categoryCode: "work",
      fee: "USD 40",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short-term temporary work, modeling, software installation, or technical dispatch under 90 days.",
      eligibility: "Foreign workers dispatched for short-term paid work contracts.",
      record_type: "WORK_VISA",
      docs: [
        "C-4 Work Permit Approval / Dispatch Contract",
        "Sponsoring Korean company business registration",
        "Employment contract & payment details",
        "Valid passport & application form"
      ],
      ...getSouthKoreaMicroDetails("kr-BIZ-006", "work", "C-4 Short Term Work")
    },
    {
      id: "kr-STU-008",
      officialCode: "KR-STU-008",
      name: "D-2 Student to D-10 Job Seeker Status Change (HiKorea)",
      categoryCode: "work",
      fee: "USD 60 + Status Change Fee",
      validity: "6 months",
      stay: "6 months",
      purpose: "Changing status from D-2 student to D-10 job seeker upon university graduation.",
      eligibility: "Graduating D-2 university students with Bachelor's degree or higher.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Graduation Certificate / Official Degree Certificate",
        "D-10 Job Seeking Activity Plan",
        "Proof of financial maintenance (min KRW 4.5M bank statement)",
        "HiKorea status change application"
      ],
      ...getSouthKoreaMicroDetails("kr-STU-008", "work", "D-2 to D-10 Status Change")
    },
    {
      id: "kr-STU-009",
      officialCode: "KR-STU-009",
      name: "D-2 Student to E-7 Professional Employment Status Change",
      categoryCode: "work",
      fee: "USD 60 + Work Permit Fee",
      validity: "2 years",
      stay: "2 years",
      purpose: "Direct transition from D-2 student visa to E-7 skilled work permit upon securing job offer.",
      eligibility: "Korean university graduates with job offer in E-7 eligible occupation (experience requirement waived for KR degree).",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Korean University Graduation Certificate & Transcripts ⭐",
        "E-7 Job Contract meeting minimum wage threshold ⭐",
        "Employer Business Registration & Local Employee Insurance List",
        "Ministry of Justice E-7 Work Permit Authorization",
        "HiKorea status change application"
      ],
      ...getSouthKoreaMicroDetails("kr-STU-009", "work", "D-2 to E-7 Status Change")
    },
    {
      id: "kr-SPE-008",
      officialCode: "KR-SPE-008",
      name: "H-1 Working Holiday Visa 1 Year",
      categoryCode: "work",
      fee: "USD 60",
      validity: "1 year non-renewable",
      stay: "1 year",
      purpose: "Cultural holiday travel combined with incidental short-term employment for youth.",
      eligibility: "Citizens of 25 working holiday partner countries aged 18–30 (or 35 for select countries).",
      record_type: "WORK_VISA",
      docs: [
        "Valid passport of Working Holiday partner country",
        "Round-trip flight ticket or flight funds proof",
        "Bank statement showing min USD 3,000 liquid balance",
        "Working Holiday Activity Travel Plan",
        "International medical insurance policy"
      ],
      ...getSouthKoreaMicroDetails("kr-SPE-008", "work", "H-1 Working Holiday")
    }
  ],
  student: [
    {
      id: "kr-STU-001",
      officialCode: "KR-STU-001",
      name: "D-2 Student Long Term Higher Education Visa 2 Years (Degree Programs - BA / MA / PhD)",
      categoryCode: "student",
      fee: "USD 60 + VFS service fee (USD 15)",
      validity: "2 years renewable",
      stay: "Matches course duration",
      purpose: "Full-time Associate, Bachelor's, Master's, or Doctoral degree studies at accredited Korean universities.",
      eligibility: "Accepted students holding official Standard Admission Letter (Pyojoyun Iphak Heogaseo) from accredited Korean university + bank balance USD 20,000.",
      popular: true,
      highlight: true,
      record_type: "STUDENT_VISA",
      docs: [
        "Official Standard Admission Letter (Pyojoyun Iphak Heogaseo) issued by Korean University ⭐",
        "University Business Registration Certificate (Saupja Deungnokjeung) ⭐",
        "Tuition Fee Payment Receipt / Scholarship Award Letter ⭐",
        "Personal / Parent Bank Statement for past 6 months showing liquid balance of min USD 20,000 (USD 10,000 outside Seoul) ⭐",
        "Parental Affidavit of Support & Birth Certificate (if using parent bank account)",
        "Highest Academic Degree Certificate & Marksheet (Apostilled or Consular Authenticated)",
        "Tuberculosis (TB) Test Certificate from designated hospital",
        "Valid passport, visa application form, and passport photos"
      ],
      ...getSouthKoreaMicroDetails("kr-STU-001", "student", "D-2 Student Long Term")
    },
    {
      id: "kr-STU-002",
      officialCode: "KR-STU-002",
      name: "D-4 Language Student Visa 6 Months (Korean Language Training)",
      categoryCode: "student",
      fee: "USD 60",
      validity: "6 months renewable",
      stay: "6 months",
      purpose: "Enrolling in Korean language training programs at university-affiliated language institutes.",
      eligibility: "Accepted students at university Korean Language Education Centers with min USD 10,000 bank proof.",
      record_type: "STUDENT_VISA",
      docs: [
        "University Language Institute Acceptance Letter ⭐",
        "Tuition & Housing Fee Payment Receipt (min 2 terms)",
        "Bank statement showing liquid balance of min USD 10,000 ⭐",
        "High School / University Graduation Certificate",
        "Valid passport & TB test certificate"
      ],
      ...getSouthKoreaMicroDetails("kr-STU-002", "student", "D-4 Language Training")
    },
    {
      id: "kr-STU-003",
      officialCode: "KR-STU-003",
      name: "D-2-8 Short Term Exchange Student Visa 90 Days",
      categoryCode: "student",
      fee: "USD 40",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short-term summer/winter school or exchange programs under 90 days.",
      eligibility: "Enrolled university students participating in short university exchange in Korea.",
      record_type: "STUDENT_VISA",
      docs: [
        "Short Term Exchange Admission Letter",
        "Home university enrollment certificate",
        "Bank statement showing min USD 5,000",
        "Valid passport & flight ticket"
      ],
      ...getSouthKoreaMicroDetails("kr-STU-003", "student", "D-2-8 Short Term Exchange")
    },
    {
      id: "kr-STU-004",
      officialCode: "KR-STU-004",
      name: "D-2-4 Doctoral PhD Student Visa 4 Years",
      categoryCode: "student",
      fee: "USD 60 + Scholarship Certificate",
      validity: "4 years renewable",
      stay: "4 years",
      purpose: "Doctoral PhD research and degree studies at Korean research universities.",
      eligibility: "Master's degree holders admitted to PhD program with research advisor invitation.",
      record_type: "STUDENT_VISA",
      docs: [
        "PhD Standard Admission Letter & Research Advisor Invitation",
        "Master's Degree Certificate & Transcripts (Apostilled)",
        "Scholarship Certificate / University Research Funding proof",
        "Valid passport & TB test result"
      ],
      ...getSouthKoreaMicroDetails("kr-STU-004", "student", "D-2-4 Doctoral PhD")
    },
    {
      id: "kr-STU-005",
      officialCode: "KR-STU-005",
      name: "D-2-7 Student Internship & Practical Training Visa 6 Months",
      categoryCode: "student",
      fee: "USD 60",
      validity: "6 months",
      stay: "6 months",
      purpose: "Academic practical training or credit-bearing corporate internships for enrolled students.",
      eligibility: "University students undertaking required curriculum internship at Korean firm.",
      record_type: "INTERN_VISA",
      docs: [
        "University Internship Agreement & Credit Approval Letter",
        "Korean Host Company Internship Contract",
        "Company Business Registration Certificate",
        "Valid passport & enrollment proof"
      ],
      ...getSouthKoreaMicroDetails("kr-STU-005", "student", "D-2-7 Student Internship")
    },
    {
      id: "kr-STU-006",
      officialCode: "KR-STU-006",
      name: "D-2 Student Visa Extension 2 Years (HiKorea Portal)",
      categoryCode: "student",
      fee: "KRW 60,000",
      validity: "2 years extension",
      stay: "Matches remaining study period",
      purpose: "Extension of student stay for ongoing university degree studies.",
      eligibility: "D-2 holders maintaining academic GPA (min 2.0) and course registration.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Certificate of Enrollment (Jaehak Jeungmyeongseo)",
        "Official Academic Transcript (Sungjeok Jeungmyeongseo)",
        "Tuition Payment Receipt for upcoming term",
        "Bank statement showing remaining living funds",
        "HiKorea online extension submission"
      ],
      ...getSouthKoreaMicroDetails("kr-STU-006", "student", "D-2 Student Extension")
    },
    {
      id: "kr-STU-007",
      officialCode: "KR-STU-007",
      name: "D-4 Language Student Extension 6 Months (HiKorea Portal)",
      categoryCode: "student",
      fee: "KRW 60,000",
      validity: "6 months extension",
      stay: "6 months",
      purpose: "Extension of language training for next term (up to max 2 years total).",
      eligibility: "D-4 language students with 80%+ attendance rate and tuition paid.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Language Center Attendance Certificate (min 80% attendance required) ⭐",
        "Upcoming Term Tuition Payment Receipt",
        "Bank statement showing min USD 5,000",
        "HiKorea online extension application"
      ],
      ...getSouthKoreaMicroDetails("kr-STU-007", "student", "D-4 Language Extension")
    },
    {
      id: "kr-STU-010",
      officialCode: "KR-STU-010",
      name: "D-2-5 Student Researcher Visa 2 Years",
      categoryCode: "student",
      fee: "USD 60",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Postdoctoral or university research scholars conducting research at Korean academic labs.",
      eligibility: "Researcher scholars invited by Korean university research labs.",
      record_type: "RESEARCH_VISA",
      docs: [
        "University Lab Research Invitation & Agreement",
        "Degree Certificate & research publication list",
        "Research stipend / grant certificate",
        "Valid passport & application form"
      ],
      ...getSouthKoreaMicroDetails("kr-STU-010", "student", "D-2-5 Student Researcher")
    }
  ],
  family: [
    {
      id: "kr-FAM-001",
      officialCode: "KR-FAM-001",
      name: "F-2-3 Family Reunification Visa 3 Years (Spouse / Child of Long-Term Foreign Resident)",
      categoryCode: "family",
      fee: "USD 60 + Consular Authentication",
      validity: "3 years renewable",
      stay: "Matches sponsor ARC validity",
      purpose: "Family reunification for spouse and minor children of long-term ARC holders (E-7, D-8, F-2, F-5).",
      eligibility: "Spouse or minor unmarried children of principal ARC holder legally residing in Korea.",
      popular: true,
      highlight: true,
      record_type: "FAMILY_VISA",
      docs: [
        "Principal Sponsor Alien Registration Card (ARC) copy & Passport ⭐",
        "Apostilled / Consular Authenticated Marriage Certificate (for spouse) ⭐",
        "Apostilled / Consular Authenticated Birth Certificate (for minor child) ⭐",
        "Principal Sponsor Korean Employment Certificate & Pay Slips for past 3 months",
        "Principal Sponsor NTS Income Tax Certificate (Earned Income Tax Receipt)",
        "Housing Lease Agreement in South Korea in sponsor's name",
        "Valid applicant passport & application form"
      ],
      ...getSouthKoreaMicroDetails("kr-FAM-001", "family", "F-2-3 Family Reunification")
    },
    {
      id: "kr-FAM-002",
      officialCode: "KR-FAM-002",
      name: "F-3 Dependent Family Visa 3 Years (Spouse / Child of Skilled Worker / Student)",
      categoryCode: "family",
      fee: "USD 60",
      validity: "3 years renewable",
      stay: "Matches principal visa validity",
      purpose: "Accompanying spouse and minor children of D-2, D-4, D-7, D-8, E-1 to E-7 visa holders.",
      eligibility: "Legally married spouse or minor dependent children of primary visa holder.",
      record_type: "FAMILY_VISA",
      docs: [
        "Primary Visa Holder Passport & Visa / ARC Copy ⭐",
        "Consular authenticated Marriage / Birth Certificate",
        "Primary visa holder employment / student enrollment proof",
        "Bank statement showing family support capability",
        "Valid passport & visa application form"
      ],
      ...getSouthKoreaMicroDetails("kr-FAM-002", "family", "F-3 Dependent Family")
    },
    {
      id: "kr-FAM-003",
      officialCode: "KR-FAM-003",
      name: "F-6 Marriage Migrant Visa 3 Years (Spouse of Korean Citizen)",
      categoryCode: "family",
      fee: "USD 60 + Consular Authentication",
      validity: "3 years renewable",
      stay: "3 years",
      purpose: "Residence for foreign spouses legally married to South Korean citizens.",
      eligibility: "Foreign spouse married to Korean citizen meeting Korean language requirement (TOPIK L1+) & income threshold (KRW 20.7M+).",
      record_type: "FAMILY_VISA",
      docs: [
        "Korean Spouse Family Relation Certificate (Gajok Gwangye Jeungmyeongseo) & Marriage Relation Certificate ⭐",
        "Consular Authenticated Foreign Marriage Certificate",
        "Korean Spouse Income Certificate (NTS Tax Certificate min KRW 20.7M/year) ⭐",
        "Korean Language Proficiency Certificate (TOPIK Level 1+ OR King Sejong Institute Certificate) ⭐",
        "Joint Marriage Timeline Statement & Photos proving genuine relationship",
        "Korean Spouse Credit Information Certificate & Housing Lease Contract",
        "Valid applicant passport & medical test"
      ],
      ...getSouthKoreaMicroDetails("kr-FAM-003", "family", "F-6 Marriage Migrant")
    },
    {
      id: "kr-FAM-004",
      officialCode: "KR-FAM-004",
      name: "F-1 Visiting Family Visa 1 Year",
      categoryCode: "family",
      fee: "USD 60",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Visiting relatives, cohabiting with foreign resident family members, or childcare support.",
      eligibility: "Parents or family members invited by ARC holders or Korean citizens for family support.",
      record_type: "FAMILY_VISA",
      docs: [
        "Inviting Host ARC / Passport copy",
        "Family relationship proof (Birth/Marriage certificates)",
        "Reason for stay letter (childcare/medical/family support)",
        "Host income proof & housing lease"
      ],
      ...getSouthKoreaMicroDetails("kr-FAM-004", "family", "F-1 Visiting Family")
    },
    {
      id: "kr-FAM-005",
      officialCode: "KR-FAM-005",
      name: "F-2 Long Term Resident Visa 3 Years",
      categoryCode: "family",
      fee: "USD 60",
      validity: "3 years renewable",
      stay: "3 years",
      purpose: "Long term residence for eligible family members, high earners, and status changers.",
      eligibility: "Family members of F-5 PR holders or qualified F-2 residents.",
      record_type: "FAMILY_VISA",
      docs: [
        "F-5 / F-2 Principal Resident ARC copy",
        "Relationship certificate & host financial proof",
        "Housing lease contract & tax filings"
      ],
      ...getSouthKoreaMicroDetails("kr-FAM-005", "family", "F-2 Long Term Resident")
    },
    {
      id: "kr-FAM-006",
      officialCode: "KR-FAM-006",
      name: "F-4 Overseas Ethnic Korean Visa 5 Years",
      categoryCode: "family",
      fee: "USD 60",
      validity: "5 years multiple",
      stay: "2 years per entry",
      purpose: "Long-term residence and quasi-citizenship rights for foreign nationals of Korean heritage.",
      eligibility: "Former Korean nationals or descendants holding foreign citizenship.",
      record_type: "FAMILY_VISA",
      docs: [
        "Proof of former Korean nationality (Deleted Family Registry / Jeokseok)",
        "Apostilled Criminal Record Check from home country",
        "Korean language test result or exemption proof",
        "Valid foreign passport & ARC application form"
      ],
      ...getSouthKoreaMicroDetails("kr-FAM-006", "family", "F-4 Overseas Korean")
    },
    {
      id: "kr-FAM-010",
      officialCode: "KR-FAM-010",
      name: "F-1 Visiting Family Extension 1 Year (HiKorea Portal)",
      categoryCode: "family",
      fee: "KRW 60,000",
      validity: "1 year extension",
      stay: "1 year",
      purpose: "Extension of visiting family status for ongoing childcare or cohabitation.",
      eligibility: "Current F-1 holders with host family endorsement.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Host Family Extension Request Statement",
        "Host ARC & Income Certificate",
        "HiKorea online extension application"
      ],
      ...getSouthKoreaMicroDetails("kr-FAM-010", "family", "F-1 Family Extension")
    }
  ],
  pr: [
    {
      id: "kr-PR-001",
      officialCode: "KR-PR-001",
      name: "F-5 Permanent Resident Visa (General PR - 5 Years Continuous Stay in Korea)",
      categoryCode: "pr",
      fee: "USD 100 + HiKorea Application Fee",
      validity: "Permanent (ARC card renewed every 10 years)",
      stay: "Indefinite Permanent Residence",
      purpose: "Unrestricted permanent residence and work rights in South Korea.",
      eligibility: "5 years continuous legal stay in Korea on eligible visa (E-7, F-2, etc.) + Income threshold (GNI 2x = approx KRW 84M+) + TOPIK Level 4+ OR KIIP Level 5 Completion + Clean criminal background.",
      popular: true,
      highlight: true,
      record_type: "PR_VISA",
      docs: [
        "Proof of 5 Years Continuous Legal Residence in Korea (HiKorea Entry/Exit Records) ⭐",
        "National Tax Service (NTS Korea) Income Tax Certificate showing GNI 2x income ⭐",
        "Social Integration Program (KIIP) Level 5 Completion Certificate OR TOPIK Level 4+ ⭐",
        "Apostilled Nationwide Criminal Background Certificate from home country",
        "Korean Housing Real Estate Title / Lease Agreement (min KRW 30M deposit)",
        "Proof of 4 Major Social Insurances compliance",
        "Valid passport & ARC submission"
      ],
      ...getSouthKoreaMicroDetails("kr-PR-001", "pr", "F-5 Permanent Residence")
    },
    {
      id: "kr-FAM-007",
      officialCode: "KR-FAM-007",
      name: "F-2-7 Points-Based Long Term Resident Visa 3 Years (80+ Points / 170 Total)",
      categoryCode: "pr",
      fee: "USD 60",
      validity: "3 years renewable",
      stay: "3 years",
      purpose: "Long-term residence with flexible job change rights based on points evaluation.",
      eligibility: "Scoring 80+ points out of 170 based on age, education, Korean language (KIIP/TOPIK), income, and social volunteer points.",
      record_type: "PR_VISA",
      docs: [
        "F-2-7 Points Evaluation Sheet (Scoring 80+ Verified Points) ⭐",
        "Degree Certificates & KIIP Level 5 / TOPIK Score Card ⭐",
        "NTS Earned Income Tax Certificate (showing annual salary) ⭐",
        "Employment contract with Korean firm & company registry",
        "Apostilled home country Criminal Record Check",
        "Valid passport & ARC application form"
      ],
      ...getSouthKoreaMicroDetails("kr-FAM-007", "pr", "F-2-7 Points Visa")
    },
    {
      id: "kr-FAM-008",
      officialCode: "KR-FAM-008",
      name: "F-5-1 General Permanent Resident Permit (HiKorea)",
      categoryCode: "pr",
      fee: "USD 100",
      validity: "Permanent",
      stay: "Indefinite",
      purpose: "Permanent residency status granted after satisfying general residence & financial criteria.",
      eligibility: "Long term foreign residents meeting GNI income and Korean language criteria.",
      record_type: "PR_VISA",
      docs: [
        "5 Years Korea Residence Proof",
        "NTS Tax Income Certificate & KIIP Level 5 certificate",
        "Clean Criminal Background Check",
        "HiKorea PR application"
      ],
      ...getSouthKoreaMicroDetails("kr-FAM-008", "pr", "F-5-1 General PR")
    },
    {
      id: "kr-FAM-009",
      officialCode: "KR-FAM-009",
      name: "F-6 Marriage Migrant to F-5-2 Permanent Residence (2 Years Married in KR)",
      categoryCode: "pr",
      fee: "USD 100",
      validity: "Permanent",
      stay: "Indefinite",
      purpose: "Transition from F-6 Marriage visa to F-5 Permanent Residence after 2 years.",
      eligibility: "F-6 spouse maintaining marriage for 2+ years residing in Korea + GNI 1x income OR KIIP Level 5.",
      record_type: "PR_VISA",
      docs: [
        "F-6 Visa 2 Years Residence Proof in Korea ⭐",
        "Korean Spouse Marriage Relation Certificate & Family Registry",
        "Household income proof (min GNI 1x = KRW 42M+)",
        "KIIP Level 5 Certificate or TOPIK Level 4+",
        "HiKorea PR application"
      ],
      ...getSouthKoreaMicroDetails("kr-FAM-009", "pr", "F-6 to F-5 Marriage PR")
    },
    {
      id: "kr-PR-002",
      officialCode: "KR-PR-002",
      name: "F-2-7 Points Holder to F-5-16 Permanent Residence (3 Years F-2-7 Stay)",
      categoryCode: "pr",
      fee: "USD 100",
      validity: "Permanent",
      stay: "Indefinite",
      purpose: "Fast-track PR for F-2-7 points visa holders after 3 years continuous stay.",
      eligibility: "F-2-7 visa holders with 3 years stay + GNI 2x income proof + KIIP Level 5.",
      record_type: "PR_VISA",
      docs: [
        "3 Years F-2-7 Residence History in Korea ⭐",
        "NTS Tax Certificate showing GNI 2x annual income ⭐",
        "KIIP Level 5 Completion Certificate ⭐",
        "Apostilled Criminal Record Check",
        "HiKorea PR application"
      ],
      ...getSouthKoreaMicroDetails("kr-PR-002", "pr", "F-2-7 to F-5 PR")
    },
    {
      id: "kr-PR-003",
      officialCode: "KR-PR-003",
      name: "D-8 Investor to F-5-5 Permanent Residence (KRW 300M+ Investment)",
      categoryCode: "pr",
      fee: "USD 100",
      validity: "Permanent",
      stay: "Indefinite",
      purpose: "Permanent residence pathway for active foreign corporate investors.",
      eligibility: "D-8 investors maintaining corporate operations for 3+ years + KRW 300M+ capital + local employment.",
      record_type: "PR_VISA",
      docs: [
        "D-8 Foreign Direct Investment Certificate & BACEN capital records",
        "3 Years Corporate Tax Audited Financial Statements",
        "Local employee 4-insurance proof (hiring 2+ Korean staff)",
        "HiKorea PR application"
      ],
      ...getSouthKoreaMicroDetails("kr-PR-003", "pr", "D-8 to F-5 Investor PR")
    },
    {
      id: "kr-PR-004",
      officialCode: "KR-PR-004",
      name: "F-5-5 High Investment Permanent Residence (KRW 500M+ Direct Investment)",
      categoryCode: "pr",
      fee: "USD 100",
      validity: "Permanent",
      stay: "Indefinite",
      purpose: "Direct permanent residence for foreign investors injecting KRW 500,000,000+ into Korean economy.",
      eligibility: "Direct foreign investment of min KRW 500M employing 5+ local Korean citizens.",
      record_type: "INVESTOR_VISA",
      docs: [
        "Foreign Direct Investment Capital Transfer Confirmation (KRW 500M+)",
        "Korean corporate registry & business license",
        "Proof of employing 5+ Korean citizens for 6+ months",
        "HiKorea PR application"
      ],
      ...getSouthKoreaMicroDetails("kr-PR-004", "pr", "KRW 500M Investor PR")
    },
    {
      id: "kr-PR-005",
      officialCode: "KR-PR-005",
      name: "South Korean Citizenship & Naturalization (5 Years Residence & TOPIK)",
      categoryCode: "pr",
      fee: "KRW 300,000 + Ministry of Justice Fee",
      validity: "Lifetime South Korean Citizenship",
      stay: "Permanent Citizen",
      purpose: "Full acquisition of South Korean nationality under Nationality Act.",
      eligibility: "5 years continuous residence + Financial solvency (KRW 60M+ bank balance) + Written Naturalization Exam & Oral Interview + TOPIK L4+.",
      record_type: "PR_VISA",
      docs: [
        "5 Years Continuous Physical Residence Proof in South Korea ⭐",
        "Ministry of Justice Naturalization Written Test & Interview Pass Certificate ⭐",
        "Proof of Financial Solvency (Real estate / KRW 60M+ bank deposit / NTS Tax Certificate)",
        "Apostilled Criminal Record Check & Renunciation of Original Citizenship (within 1 year)",
        "Application submitted at Ministry of Justice Immigration Office"
      ],
      ...getSouthKoreaMicroDetails("kr-PR-005", "pr", "South Korea Naturalization")
    },
    {
      id: "kr-PR-006",
      officialCode: "KR-PR-006",
      name: "F-5-10 Advanced STEM PhD Graduate Permanent Residence",
      categoryCode: "pr",
      fee: "USD 100",
      validity: "Permanent",
      stay: "Indefinite",
      purpose: "Fast-track permanent residence for foreign PhD graduates from Korean STEM universities.",
      eligibility: "PhD degree in STEM field from Korean university + employment in relevant industry + GNI 1x income.",
      record_type: "PR_VISA",
      docs: [
        "Korean University STEM PhD Degree Certificate & Transcripts ⭐",
        "Employment Contract in relevant STEM industry & NTS Tax Certificate",
        "Apostilled Criminal Background Check",
        "HiKorea PR application"
      ],
      ...getSouthKoreaMicroDetails("kr-PR-006", "pr", "STEM PhD Fast-Track PR")
    },
    {
      id: "kr-PR-007",
      officialCode: "KR-PR-007",
      name: "F-5-11 High Talent & Outstanding Ability Permanent Residence",
      categoryCode: "pr",
      fee: "USD 100",
      validity: "Permanent",
      stay: "Indefinite",
      purpose: "Special permanent residence for globally recognized experts in science, tech, culture, or sports.",
      eligibility: "Recommendation by Ministry of Justice Talent Evaluation Committee.",
      record_type: "PR_VISA",
      docs: [
        "Ministry of Justice High Talent Endorsement Certificate",
        "International awards, patents, or research citation records",
        "Valid passport & background check"
      ],
      ...getSouthKoreaMicroDetails("kr-PR-007", "pr", "High Talent Special PR")
    },
    {
      id: "kr-WRK-015",
      officialCode: "KR-WRK-015",
      name: "E-7 Skilled Work to F-2-7 Points Visa Status Change",
      categoryCode: "pr",
      fee: "USD 60",
      validity: "3 years renewable",
      stay: "3 years",
      purpose: "Transitioning from E-7 work permit to F-2-7 points visa after 3 years stay.",
      eligibility: "E-7 holders achieving 80+ points on points scale + 3 years stay.",
      record_type: "PR_VISA",
      docs: [
        "3 Years E-7 Residence History in Korea",
        "F-2-7 Points Worksheet (80+ points verified)",
        "NTS Earned Income Tax Certificate",
        "HiKorea status change application"
      ],
      ...getSouthKoreaMicroDetails("kr-WRK-015", "pr", "E-7 to F-2-7 Status Change")
    }
  ]
};
