import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getSaudiArabiaMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "Saudi Arabia Tourist eVisa / Business Visit / Iqama Employment / Student Visas require proof of sufficient financial capability (min USD 3,000 / SAR 10,000 liquid bank balance for tourist/business visits, verified Qiwa contract salary for Iqama work visas, and SAR 30M investment / SAR 4M real estate for Premium Residency).";
  let fundsBankMonths = "Last 3 months personal bank statements stamped by bank branch with regular balance history.";
  let fundsSudden = "❌ Sudden 1-day cash lump-sum deposits prior to visa submission on visitsaudi.com or Enjaz / VFS are strictly flagged and cause rejection. Average balance must be maintained over 3 months.";
  let fundsEx = "✅ Sahi: Seasoned bank balance of USD 3,000+ for 3 months. ❌ Galat: Borrowed cash deposited 24 hours prior to application.";

  let itrYears = "Income Tax Return / Personal salary statements or corporate tax certificate for the past 2 years for business, work, and investor applicants.";
  let itrMatch = "Reported tax income must reconcile with bank statements and Qiwa employment contracts.";
  let itrNoItr = "Not required for short term tourist eVisa or Umrah visitors.";

  let bankMonths = "Last 3 months bank statements.";
  let bankReg = "Regular salary credits or steady corporate income.";
  let bankFd = "Fixed deposits accepted as supporting proof.";
  let bankSource = "Salary, corporate revenue, or verified parental sponsorship.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('iqama') || lowerCode.includes('wrk') || lowerCode.includes('qiwa')) {
    fundsMin = "Employment Work Visas require a Ministry of Human Resources and Social Development (MHRSD) Work Permit authorization + authenticated Qiwa employment contract meeting Saudi Labor Law standards + Enjaz visa processing. Iqama fee is SAR 650/year + dependent fees.";
    fundsBankMonths = "Employer Commercial Registration (CR), MHRSD Qiwa contract approval, and 3 months salary pay slips.";
    fundsSudden = "Qiwa contracts must clearly state gross salary in SAR, job designation, and GOSI social insurance registration.";
    fundsEx = "✅ Sahi: Authenticated Qiwa contract + MHRSD work permit approval + Commercial Registration (CR). ❌ Galat: Unauthenticated contract or unregistered employer.";
  } else if (cat === 'student' || lowerCode.includes('stu')) {
    fundsMin = "Student Visa requires an official Admission Letter from an accredited Saudi university + tuition fee receipt or Ministry of Education scholarship certificate + bank statement showing SAR 20,000.";
    fundsBankMonths = "6 months bank statements of student or parent financial sponsor showing min SAR 20,000.";
    fundsSudden = "Parental affidavit of support and birth certificate required if using parent's bank statement.";
    fundsEx = "✅ Sahi: Official Saudi University Admission Letter + SAR 20,000 bank certificate. ❌ Galat: Unrecognized institute or unverified funding.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('visit-family')) {
    fundsMin = "Family Visit Visa requires an official MOFA Family Visit Visa Approval + host's valid Iqama copy + apostilled / MOFA authenticated marriage/birth certificates + host monthly salary threshold.";
    fundsBankMonths = "3–6 months pay slips and bank statements of host sponsor in Saudi Arabia.";
    fundsSudden = "Marriage/Birth certificates must be apostilled or MOFA authenticated with certified Arabic translation.";
    fundsEx = "✅ Sahi: MOFA authenticated marriage certificate + host Iqama & Absher approval. ❌ Galat: Uncertified civil documents.";
  } else if (cat === 'business' || lowerCode.includes('misa') || lowerCode.includes('biz')) {
    fundsMin = "Business Visit eVisa / Consulate Visa requires an official MISA (Ministry of Investment Saudi Arabia) Business Invitation Letter + sponsoring Saudi company Commercial Registration (CR) copy + foreign employer dispatch letter.";
    fundsBankMonths = "3 to 6 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Saudi company must have active CR registration on MISA portal.";
    fundsEx = "✅ Sahi: Official MISA invitation letter + Saudi CR copy + company dispatch letter. ❌ Galat: Unregistered host company.";
  } else if (cat === 'pr' || lowerCode.includes('premium') || lowerCode.includes('pr')) {
    fundsMin = "Premium Residency (Iqama المميزة) requires SAR 30M investment for Investor Premium Residency, SAR 4M for Real Estate Owner Premium Residency, or SAR 100,000 annual fee for Limited Premium Residency, approved by the Premium Residency Center.";
    fundsBankMonths = "Audited financial statements, real estate title deed, or MISA investment license.";
    fundsSudden = "Capital investments must be verified through official Ministry of Investment (MISA) and real estate registry channels.";
    fundsEx = "✅ Sahi: Premium Residency Center approval + SAR 30M MISA investment / SAR 4M title deed. ❌ Galat: Unverified informal capital.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

export const SAUDI_ARABIA_88_VISAS: CountryVisas = {
  tourist: [
    {
      id: "sa-TOU-001",
      officialCode: "SA-TOU-001",
      name: "Tourist eVisa 90 Days Multiple Entry 1 Year (visitsaudi.com - Instant Online)",
      categoryCode: "tourist",
      fee: "SAR 535 (Includes Mandatory Health Insurance)",
      validity: "1 year multiple entry",
      stay: "Up to 90 days per visit (max 90 days total per year)",
      purpose: "Short term tourism, leisure, visiting friends/family, and performing Umrah (outside Hajj season) in Saudi Arabia.",
      eligibility: "Citizens of 66 eligible countries (US, UK, EU, CA, AU, NZ, JP, KR, SG, etc.) OR holders of valid US, UK, or Schengen visas OR GCC residents.",
      popular: true,
      highlight: true,
      record_type: "TOURIST_VISA",
      docs: [
        "Valid original passport (min 6 months validity & 2 blank pages) ⭐",
        "Completed online Tourist eVisa application on official visitsaudi.com portal ⭐",
        "Recent digital passport photo (2x2 inch white background)",
        "Confirmed return flight booking & hotel reservation in Saudi Arabia ⭐",
        "Personal bank account statement for past 3 months (min USD 3,000 / SAR 10,000 balance with bank stamp) ⭐",
        "Mandatory Saudi Health Insurance Policy (issued automatically with eVisa)",
        "Employment proof / business registration & pay slips"
      ],
      ...getSaudiArabiaMicroDetails("sa-TOU-001", "tourist", "Tourist eVisa 90D Multiple")
    },
    {
      id: "sa-TOU-002",
      officialCode: "SA-TOU-002",
      name: "Tourist Visa on Arrival (VOA - 90 Days Multiple Entry at Saudi Airports)",
      categoryCode: "tourist",
      fee: "SAR 535 (Includes Mandatory Health Insurance)",
      validity: "1 year multiple entry",
      stay: "Up to 90 days per visit",
      purpose: "On-arrival tourism entry at King Khalid (Riyadh), King Abdulaziz (Jeddah), and Dammam airports.",
      eligibility: "Passport holders of 66 eligible countries OR US, UK, Schengen visa holders OR GCC residents arriving via flight.",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid passport of eligible country (min 6 months validity) ⭐",
        "Valid used US / UK / Schengen visa or GCC Resident ID (if applicable) ⭐",
        "Confirmed return flight ticket & hotel booking in Saudi Arabia",
        "Credit card for SAR 535 payment at airport self-service kiosk"
      ],
      ...getSaudiArabiaMicroDetails("sa-TOU-002", "tourist", "Tourist Visa on Arrival VOA")
    },
    {
      id: "sa-TOU-003",
      officialCode: "SA-TOU-003",
      name: "Tourist Visa Consulate 90 Days Single / Multiple Entry (VFS Tasheel / MOFA)",
      categoryCode: "tourist",
      fee: "SAR 535 + VFS service fee (USD 30)",
      validity: "90 days single / 1 year multiple",
      stay: "Up to 90 days",
      purpose: "Consular tourist visa for passport holders not eligible for instant online eVisa or VOA.",
      eligibility: "All foreign nationals applying through Saudi Embassy / Consulate or VFS Tasheel center.",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid original passport & old passports",
        "Completed MOFA / VFS Tasheel visa application form",
        "2 biometric photographs (2x2 inch white background)",
        "Confirmed round-trip flight booking & hotel reservation",
        "Personal bank statement for past 3 months (min SAR 10,000 balance with bank stamp) ⭐",
        "NOC letter from employer / business registration & pay slips"
      ],
      ...getSaudiArabiaMicroDetails("sa-TOU-003", "tourist", "Tourist Visa Consulate")
    },
    {
      id: "sa-TOU-004",
      officialCode: "SA-TOU-004",
      name: "Tourist - GCC Resident eVisa 90 Days (visitsaudi.com)",
      categoryCode: "tourist",
      fee: "SAR 535 (Includes Insurance)",
      validity: "1 year multiple entry",
      stay: "Up to 90 days per visit",
      purpose: "Fast-track tourist eVisa for residents of GCC countries (UAE, Qatar, Kuwait, Oman, Bahrain).",
      eligibility: "Holders of valid GCC Resident Permit (Iqama) with min 3 months validity remaining and eligible profession.",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid GCC Residence Permit (Iqama copy with min 3 months validity) ⭐",
        "Valid passport (min 6 months validity)",
        "Completed online application on visitsaudi.com",
        "Confirmed return ticket & hotel booking"
      ],
      ...getSaudiArabiaMicroDetails("sa-TOU-004", "tourist", "GCC Resident Tourist eVisa")
    },
    {
      id: "sa-TOU-005",
      officialCode: "SA-TOU-005",
      name: "Tourist - US / UK / Schengen Visa Holder eVisa 90 Days",
      categoryCode: "tourist",
      fee: "SAR 535 (Includes Insurance)",
      validity: "1 year multiple entry",
      stay: "Up to 90 days per visit",
      purpose: "Instant tourist eVisa eligibility for any nationality holding valid US, UK, or Schengen visa.",
      eligibility: "Holders of valid, used US, UK, or Schengen tourist/business visa arriving via national carrier (Saudia, Flynas, Flyadeal).",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid passport (min 6 months validity)",
        "Valid, used US, UK, or Schengen visa stamped in passport ⭐",
        "Confirmed flight ticket on Saudi national carrier",
        "visitsaudi.com online application"
      ],
      ...getSaudiArabiaMicroDetails("sa-TOU-005", "tourist", "US/UK/Schengen Holder eVisa")
    },
    {
      id: "sa-TOU-006",
      officialCode: "SA-TOU-006",
      name: "Transit Stopover Visa 96 Hours (Saudia / Flynas Free Stopover)",
      categoryCode: "tourist",
      fee: "SAR 100 (Processing & Health Insurance)",
      validity: "Valid for 90 days to enter",
      stay: "Up to 96 hours (4 days)",
      purpose: "Free 4-day transit stopover visa for passengers booking flights on Saudia or Flynas.",
      eligibility: "Passengers transiting through Saudi Arabia on Saudia or Flynas with connecting flights.",
      record_type: "TRANSIT_VISA",
      docs: [
        "Valid passport (min 6 months validity)",
        "Confirmed onward flight ticket on Saudia or Flynas within 96 hours ⭐",
        "Free 1-night hotel reservation (issued during flight booking)",
        "Online transit application via flight booking portal"
      ],
      ...getSaudiArabiaMicroDetails("sa-TOU-006", "tourist", "Transit 96H Stopover Visa")
    },
    {
      id: "sa-TOU-007",
      officialCode: "SA-TOU-007",
      name: "Umrah eVisa 90 Days (Nusuk App / Ministry of Hajj & Umrah)",
      categoryCode: "tourist",
      fee: "SAR 535 (Includes Insurance)",
      validity: "90 days",
      stay: "90 days",
      purpose: "Performing Umrah pilgrimage in Makkah and visiting the Prophet's Mosque in Madinah.",
      eligibility: "Muslim pilgrims applying online via Nusuk.sa platform or authorized Umrah agencies.",
      record_type: "UMRAH_VISA",
      docs: [
        "Valid passport (min 6 months validity) ⭐",
        "Nusuk App Umrah permit appointment confirmation ⭐",
        "Confirmed round-trip flight booking & hotel reservation in Makkah/Madinah ⭐",
        "Mandatory Meningococcal Health Vaccination Certificate",
        "Completed online Umrah eVisa application"
      ],
      ...getSaudiArabiaMicroDetails("sa-TOU-007", "tourist", "Umrah eVisa 90D Nusuk")
    },
    {
      id: "sa-TOU-008",
      officialCode: "SA-TOU-008",
      name: "Umrah Visa Consulate 90 Days (VFS Tasheel / Authorized Agency)",
      categoryCode: "tourist",
      fee: "SAR 535 + Agency fee",
      validity: "90 days",
      stay: "90 days",
      purpose: "Consular Umrah pilgrimage visa issued through approved Umrah operators.",
      eligibility: "Pilgrims applying via licensed Umrah travel agents.",
      record_type: "UMRAH_VISA",
      docs: [
        "Valid passport & passport photos",
        "Approved Umrah Package Voucher from licensed agency",
        "Meningitis vaccination certificate",
        "VFS Tasheel appointment receipt"
      ],
      ...getSaudiArabiaMicroDetails("sa-TOU-008", "tourist", "Umrah Consulate Visa")
    },
    {
      id: "sa-TOU-009",
      officialCode: "SA-TOU-009",
      name: "Hajj Pilgrimage Visa (Annual Hajj Season - Ministry of Hajj & Nusuk Hajj)",
      categoryCode: "tourist",
      fee: "SAR 0 (Included in Nusuk Hajj Official Package)",
      validity: "Hajj Season duration",
      stay: "Hajj pilgrimage period",
      purpose: "Official annual Hajj pilgrimage to holy sites in Makkah, Mina, Arafat, and Muzdalifah.",
      eligibility: "Pilgrims selected under national quota registered through Nusuk Hajj platform.",
      record_type: "HAJJ_VISA",
      docs: [
        "Official Nusuk Hajj Booking Confirmation Voucher ⭐",
        "Mandatory Vaccination Certificates (Meningitis, Polio, COVID-19)",
        "Valid passport (min 6 months validity)",
        "Ministry of Hajj clearance certificate"
      ],
      ...getSaudiArabiaMicroDetails("sa-TOU-009", "tourist", "Hajj Pilgrimage Visa")
    },
    {
      id: "sa-TOU-010",
      officialCode: "SA-TOU-010",
      name: "Tourist - Personal Family & Friends Visit Visa 90 Days",
      categoryCode: "tourist",
      fee: "SAR 535",
      validity: "90 days single / 1 year multiple",
      stay: "Up to 90 days per visit",
      purpose: "Visiting Saudi citizen or resident friends/relatives for leisure travel.",
      eligibility: "Visitors invited by Saudi citizens or Iqama residents via MOFA portal.",
      record_type: "TOURIST_VISA",
      docs: [
        "MOFA Personal Visit Invitation Approval Letter ⭐",
        "Host Saudi citizen ID (National ID) or resident Iqama copy ⭐",
        "Proof of relationship or host friendship statement",
        "Valid passport & bank statement"
      ],
      ...getSaudiArabiaMicroDetails("sa-TOU-010", "tourist", "Personal Family Visit Visa")
    },
    {
      id: "sa-TOU-011",
      officialCode: "SA-TOU-011",
      name: "Tourist Visa Extension 90 Days (Absher / Jawazat Portal)",
      categoryCode: "tourist",
      fee: "SAR 100",
      validity: "90 days extension",
      stay: "Up to 90 days extension",
      purpose: "Extending short-term tourist stay due to travel plans or medical reasons in Saudi Arabia.",
      eligibility: "Current tourist visa holders applying via Absher portal before visa expiry.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Statement of reason for tourist extension",
        "Absher online extension application receipt ⭐",
        "Extended Saudi health insurance policy",
        "Valid passport & border entry number"
      ],
      ...getSaudiArabiaMicroDetails("sa-TOU-011", "tourist", "Tourist Extension Absher")
    },
    {
      id: "sa-TOU-012",
      officialCode: "SA-TOU-012",
      name: "Tourist - Cultural & Sports Event Visa 90 Days",
      categoryCode: "tourist",
      fee: "SAR 535",
      validity: "90 days",
      stay: "90 days",
      purpose: "Attending Riyadh Season, Formula 1, concert festivals, or sports events in Saudi Arabia.",
      eligibility: "Ticket holders or invited attendees for Ministry of Culture / GEA registered events.",
      record_type: "CULTURAL_VISA",
      docs: [
        "Official Event Ticket / GEA Event Invitation Letter ⭐",
        "visitsaudi.com event visa confirmation",
        "Valid passport & flight booking"
      ],
      ...getSaudiArabiaMicroDetails("sa-TOU-012", "tourist", "Cultural & Sports Event Visa")
    },
    {
      id: "sa-SPE-008",
      officialCode: "SA-SPE-008",
      name: "Medical Treatment Visit Visa 90 Days",
      categoryCode: "tourist",
      fee: "SAR 500",
      validity: "90 days",
      stay: "90 days",
      purpose: "Medical diagnosis and specialized treatment at registered Saudi hospitals.",
      eligibility: "Foreign patients with confirmed appointment at a Saudi Ministry of Health hospital.",
      record_type: "MEDICAL_VISA",
      docs: [
        "Official hospital appointment letter from Saudi hospital",
        "Medical diagnosis report from home country doctor",
        "Financial proof covering treatment and stay costs (min SAR 10,000+)",
        "Valid passport & MOFA application"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-008", "tourist", "Medical Treatment Visa")
    },
    {
      id: "sa-SPE-009",
      officialCode: "SA-SPE-009",
      name: "Short Term Education Visit Visa 90 Days",
      categoryCode: "tourist",
      fee: "SAR 500",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short-term academic workshops, training courses, or school exchange visits.",
      eligibility: "Students invited by Saudi Ministry of Education accredited institutions.",
      record_type: "EDUCATION_VISA",
      docs: [
        "Education institution invitation letter in Saudi Arabia",
        "Home school dispatch letter & enrollment proof",
        "Valid passport & bank statement"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-009", "tourist", "Education Visit Visa")
    },
    {
      id: "sa-SPE-010",
      officialCode: "SA-SPE-010",
      name: "Cultural Visit Visa 90 Days",
      categoryCode: "tourist",
      fee: "SAR 500",
      validity: "90 days",
      stay: "90 days",
      purpose: "Participation in cultural heritage, museum, or artistic delegation programs.",
      eligibility: "Cultural delegates invited by Ministry of Culture Saudi Arabia.",
      record_type: "CULTURAL_VISA",
      docs: [
        "Ministry of Culture invitation letter",
        "Event participation program details",
        "Valid passport & application form"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-010", "tourist", "Cultural Visit Visa")
    },
    {
      id: "sa-SPE-011",
      officialCode: "SA-SPE-011",
      name: "Sports Visit Visa 90 Days",
      categoryCode: "tourist",
      fee: "SAR 500",
      validity: "90 days",
      stay: "90 days",
      purpose: "Athletic competitions, tournament participation, or sports delegation visits.",
      eligibility: "Athletes, coaches, and sports officials invited by Ministry of Sports.",
      record_type: "SPORTS_VISA",
      docs: [
        "Ministry of Sports / Saudi Sports Federation invitation letter",
        "Team roster & event competition schedule",
        "Valid passport & medical insurance"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-011", "tourist", "Sports Visit Visa")
    },
    {
      id: "sa-SPE-012",
      officialCode: "SA-SPE-012",
      name: "General Entertainment Visit Visa 90 Days (GEA Sponsored)",
      categoryCode: "tourist",
      fee: "SAR 500",
      validity: "90 days",
      stay: "90 days",
      purpose: "Attending or performing at General Entertainment Authority (GEA) festivals.",
      eligibility: "Delegates or performers registered with GEA event partners.",
      record_type: "ENTERTAINMENT_VISA",
      docs: [
        "GEA Entertainment Event Invitation Letter",
        "Event pass & performance schedule",
        "Valid passport & flight ticket"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-012", "tourist", "GEA Entertainment Visit")
    },
    {
      id: "sa-SPE-014",
      officialCode: "SA-SPE-014",
      name: "Transport Crew Visa 90 Days",
      categoryCode: "tourist",
      fee: "SAR 500",
      validity: "90 days",
      stay: "Matches duty schedule",
      purpose: "Airline, maritime, or overland transport crew members operating in Saudi Arabia.",
      eligibility: "Active transport crew with official company dispatch letter.",
      record_type: "CREW_VISA",
      docs: [
        "Transport company official crew dispatch letter",
        "Seaman's book or Airline crew ID card",
        "Valid passport & flight/vessel schedule"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-014", "tourist", "Transport Crew Visa")
    },
    {
      id: "sa-SPE-015",
      officialCode: "SA-SPE-015",
      name: "Absher Emergency Visit Extension Permit",
      categoryCode: "tourist",
      fee: "SAR 100",
      validity: "30 days extension",
      stay: "30 days",
      purpose: "Emergency extension of visit visas via Absher platform.",
      eligibility: "Visitors stranded due to travel disruptions or health issues.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Absher online extension application",
        "Emergency reason statement & medical proof",
        "Valid passport copy"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-015", "tourist", "Absher Emergency Extension")
    }
  ],
  business: [
    {
      id: "sa-BIZ-001",
      officialCode: "SA-BIZ-001",
      name: "Business Visit eVisa 90 Days Single / Multiple Entry (MISA Approved - visitsaudi.com)",
      categoryCode: "business",
      fee: "SAR 500 + Insurance",
      validity: "90 days single / 1 year multiple",
      stay: "Up to 90 days per visit",
      purpose: "Commercial negotiations, contract signings, trade meetings, and corporate visits in Saudi Arabia.",
      eligibility: "Business executives invited by a registered Saudi enterprise holding Commercial Registration (CR) and MISA approval.",
      popular: true,
      highlight: true,
      record_type: "BUSINESS_VISA",
      docs: [
        "Valid original passport (min 6 months validity & 2 blank pages) ⭐",
        "Official MISA (Ministry of Investment) Business Invitation Letter ⭐",
        "Copy of Sponsoring Saudi Company Commercial Registration (CR) Certificate ⭐",
        "Foreign employer dispatch letter stating job title, salary, and purpose of business trip ⭐",
        "Foreign employer business registration copy & business card",
        "Personal or corporate bank statement for past 3 months (min USD 3,000 balance)",
        "Completed online application on visitsaudi.com / MOFA portal"
      ],
      ...getSaudiArabiaMicroDetails("sa-BIZ-001", "business", "Business Visit eVisa MISA")
    },
    {
      id: "sa-BIZ-002",
      officialCode: "SA-BIZ-002",
      name: "Business Visit Visa Consulate 90 Days (VFS Tasheel / MOFA)",
      categoryCode: "business",
      fee: "SAR 500 + VFS service fee (USD 30)",
      validity: "90 days single / 1 year multiple",
      stay: "Up to 90 days",
      purpose: "Consular business visit visa processing through VFS Tasheel centers.",
      eligibility: "Commercial representatives with MOFA business invitation.",
      record_type: "BUSINESS_VISA",
      docs: [
        "MOFA Business Invitation Approval Letter ⭐",
        "Sponsoring Saudi company Commercial Registration (CR) copy",
        "Foreign employer dispatch letter & Chamber of Commerce attestation",
        "Valid passport & VFS Tasheel appointment receipt"
      ],
      ...getSaudiArabiaMicroDetails("sa-BIZ-002", "business", "Business Visit Consulate")
    },
    {
      id: "sa-BIZ-003",
      officialCode: "SA-BIZ-003",
      name: "Commercial Visit Visa 90 Days (Chamber of Commerce Attested)",
      categoryCode: "business",
      fee: "SAR 500",
      validity: "90 days",
      stay: "90 days",
      purpose: "Commercial trade, supplier meetings, and wholesale procurement in Saudi Arabia.",
      eligibility: "Traders invited by Saudi Chamber of Commerce member firms.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Saudi Chamber of Commerce attested commercial invitation letter ⭐",
        "Sponsoring Saudi company Commercial Registration (CR)",
        "Foreign trade company registration & dispatch letter",
        "Valid passport & bank statement"
      ],
      ...getSaudiArabiaMicroDetails("sa-BIZ-003", "business", "Commercial Visit Visa")
    },
    {
      id: "sa-BIZ-004",
      officialCode: "SA-BIZ-004",
      name: "Investor Visit Visa 90 Days (MISA Investor Portal)",
      categoryCode: "business",
      fee: "SAR 500 + MISA fee",
      validity: "90 days multiple",
      stay: "90 days",
      purpose: "Exploring foreign direct investment opportunities, joint ventures, or establishing business entities in Saudi Arabia.",
      eligibility: "Foreign corporate investors approved on MISA investor portal.",
      record_type: "INVESTOR_VISA",
      docs: [
        "MISA Foreign Investor Invitation Clearance ⭐",
        "Foreign company financial audit reports & corporate profile",
        "Investment proposal summary & business plan in Saudi Arabia",
        "Valid passport & bank reference letter"
      ],
      ...getSaudiArabiaMicroDetails("sa-BIZ-004", "business", "MISA Investor Visit Visa")
    },
    {
      id: "sa-BIZ-005",
      officialCode: "SA-BIZ-005",
      name: "Entrepreneur Visit Visa 90 Days (Monshaat / MISA Sponsored)",
      categoryCode: "business",
      fee: "SAR 500",
      validity: "90 days",
      stay: "90 days",
      purpose: "Startup founders exploring Saudi tech hubs, incubators, or Monshaat SME programs.",
      eligibility: "Startup founders with Monshaat SME Authority endorsement.",
      record_type: "ENTREPRENEUR_VISA",
      docs: [
        "Monshaat SME Authority Endorsement / Incubator Invitation ⭐",
        "Startup Business Plan & pitch deck",
        "Proof of seed capital or venture funding",
        "Valid passport & COVAS form"
      ],
      ...getSaudiArabiaMicroDetails("sa-BIZ-005", "business", "Entrepreneur Visit Monshaat")
    },
    {
      id: "sa-BIZ-006",
      officialCode: "SA-BIZ-006",
      name: "Business Visit - Conference & Summit Visa 90 Days",
      categoryCode: "business",
      fee: "SAR 500",
      validity: "90 days",
      stay: "90 days",
      purpose: "Attending Future Investment Initiative (FII), LEAP tech summit, or global trade summits in Saudi Arabia.",
      eligibility: "Registered delegates or speakers at accredited Saudi conferences.",
      record_type: "CONFERENCE_VISA",
      docs: [
        "Official Conference Invitation Letter from summit organizer (e.g., FII / LEAP) ⭐",
        "Delegate registration receipt & summit agenda",
        "Foreign employer dispatch letter",
        "Valid passport & travel itinerary"
      ],
      ...getSaudiArabiaMicroDetails("sa-BIZ-006", "business", "Business Conference Visa")
    },
    {
      id: "sa-BIZ-007",
      officialCode: "SA-BIZ-007",
      name: "Business Visit Visa Extension 90 Days (Absher / Jawazat Portal)",
      categoryCode: "business",
      fee: "SAR 100",
      validity: "90 days extension",
      stay: "90 days extension",
      purpose: "Extending business visit stay for ongoing commercial project execution.",
      eligibility: "Business visit visa holders with written request from sponsoring Saudi company.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Sponsoring Saudi company extension request letter (attested by Chamber of Commerce) ⭐",
        "Sponsoring company CR copy",
        "Absher online extension application receipt",
        "Valid passport copy"
      ],
      ...getSaudiArabiaMicroDetails("sa-BIZ-007", "business", "Business Visit Extension")
    },
    {
      id: "sa-BIZ-008",
      officialCode: "SA-BIZ-008",
      name: "APEC Business Travel Card (Saudi Arabia Entry Pre-Clearance) 5 Years",
      categoryCode: "business",
      fee: "USD 0",
      validity: "5 years",
      stay: "Up to 90 days per entry",
      purpose: "Fast-track entry and pre-cleared business travel for APEC economy executives.",
      eligibility: "ABTC cardholders with Saudi Arabia pre-clearance.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Valid APEC Business Travel Card with SA clearance",
        "Valid passport matching ABTC details",
        "Corporate dispatch proof"
      ],
      ...getSaudiArabiaMicroDetails("sa-BIZ-008", "business", "APEC Saudi Pre-Clearance")
    },
    {
      id: "sa-BIZ-009",
      officialCode: "SA-BIZ-009",
      name: "Business Visit - Trade Fair & Expo Visa 90 Days",
      categoryCode: "business",
      fee: "SAR 500",
      validity: "90 days",
      stay: "90 days",
      purpose: "Exhibiting or buying at industrial trade expos in Riyadh or Jeddah.",
      eligibility: "Registered exhibitors or trade buyers.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Trade Fair Organizer Invitation & Booth Pass Confirmation",
        "Foreign company dispatch letter",
        "Valid passport & bank statement"
      ],
      ...getSaudiArabiaMicroDetails("sa-BIZ-009", "business", "Trade Fair Business Visa")
    },
    {
      id: "sa-BIZ-010",
      officialCode: "SA-BIZ-010",
      name: "Business Visit Escort Visa 90 Days",
      categoryCode: "business",
      fee: "SAR 500",
      validity: "90 days",
      stay: "90 days",
      purpose: "Accompanying technical staff or executive escorts on commercial missions.",
      eligibility: "Assisting staff accompanying primary business delegate.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Primary business delegate invitation copy & escort request",
        "Sponsoring Saudi company CR copy",
        "Valid passport & dispatch letter"
      ],
      ...getSaudiArabiaMicroDetails("sa-BIZ-010", "business", "Business Escort Visa")
    },
    {
      id: "sa-WRK-012",
      officialCode: "SA-WRK-012",
      name: "Work Visa - Entrepreneur & Tech Startup Founder (Monshaat Sponsored)",
      categoryCode: "business",
      fee: "SAR 2,000",
      validity: "90 days single (Iqama issued after entry)",
      stay: "1 year renewable",
      purpose: "Founding and operating tech startups in Saudi Arabia under Vision 2030 initiatives.",
      eligibility: "Startup founders approved by Monshaat SME Authority & MISA.",
      record_type: "ENTREPRENEUR_VISA",
      docs: [
        "Monshaat Startup License Certificate & MISA Approval ⭐",
        "Qiwa Entrepreneur Work Permit Authorization ⭐",
        "Commercial Registration (CR) of Saudi startup entity",
        "Valid passport & health exam"
      ],
      ...getSaudiArabiaMicroDetails("sa-WRK-012", "business", "Startup Founder Work Visa")
    },
    {
      id: "sa-PR-006",
      officialCode: "SA-PR-006",
      name: "MISA Foreign Corporate Investor License 1 Year",
      categoryCode: "business",
      fee: "SAR 2,000",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Foreign corporate entity licensing issued by Ministry of Investment.",
      eligibility: "Foreign corporations establishing 100% foreign-owned entities in Saudi Arabia.",
      record_type: "INVESTOR_VISA",
      docs: [
        "MISA Foreign Investment License Certificate ⭐",
        "Apostilled Foreign Parent Company Registration & Audited Financials",
        "Saudi Commercial Registration (CR)",
        "Valid passport & MISA application"
      ],
      ...getSaudiArabiaMicroDetails("sa-PR-006", "business", "MISA Investor License")
    },
    {
      id: "sa-SPE-001",
      officialCode: "SA-SPE-001",
      name: "Diplomat Visa (Embassy / Consular Mission Postings)",
      categoryCode: "business",
      fee: "SAR 0",
      validity: "Duration of diplomatic posting",
      stay: "Official posting duration",
      purpose: "Diplomatic missions, embassy postings, and official bilateral state visits.",
      eligibility: "Accredited foreign diplomats and embassy staff.",
      record_type: "DIPLOMAT_VISA",
      docs: [
        "Diplomatic Note Verbale from foreign Ministry of Foreign Affairs",
        "Diplomatic Passport copy",
        "MOFA Saudi Arabia diplomatic posting clearance"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-001", "business", "Diplomat Visa")
    },
    {
      id: "sa-SPE-002",
      officialCode: "SA-SPE-002",
      name: "Official State Mission Visa",
      categoryCode: "business",
      fee: "SAR 0",
      validity: "Duration of official assignment",
      stay: "Official assignment duration",
      purpose: "Official government business, consular staff, and state delegations.",
      eligibility: "Foreign government officials on official service passports.",
      record_type: "OFFICIAL_VISA",
      docs: [
        "Official Note Verbale from foreign government ministry",
        "Official / Service Passport",
        "MOFA official mission approval"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-002", "business", "Official State Mission")
    },
    {
      id: "sa-SPE-003",
      officialCode: "SA-SPE-003",
      name: "Escort Visit Visa 90 Days",
      categoryCode: "business",
      fee: "SAR 500",
      validity: "90 days",
      stay: "90 days",
      purpose: "Accompanying official delegates or medical patients.",
      eligibility: "Designated escorts accompanying primary visa holders.",
      record_type: "ESCORT_VISA",
      docs: [
        "Primary visa holder document & escort request letter",
        "Valid passport & application form"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-003", "business", "Escort Visit Visa")
    },
    {
      id: "sa-SPE-004",
      officialCode: "SA-SPE-004",
      name: "Government Organization Visit Visa 90 Days",
      categoryCode: "business",
      fee: "SAR 0",
      validity: "90 days",
      stay: "90 days",
      purpose: "Visits invited by Saudi ministries, public authorities, or royal commissions.",
      eligibility: "Delegates invited by Saudi public sector bodies.",
      record_type: "OFFICIAL_VISA",
      docs: [
        "Official invitation from Saudi Ministry or Public Authority ⭐",
        "Foreign government dispatch letter",
        "Valid passport & MOFA clearance"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-004", "business", "Government Visit Visa")
    },
    {
      id: "sa-SPE-005",
      officialCode: "SA-SPE-005",
      name: "Hajj Mission Official Visa",
      categoryCode: "business",
      fee: "SAR 0",
      validity: "Hajj season duration",
      stay: "Hajj season",
      purpose: "Official foreign Hajj medical, administrative, and logistical delegation staff.",
      eligibility: "Accredited foreign Hajj mission staff approved by Ministry of Hajj.",
      record_type: "HAJJ_VISA",
      docs: [
        "Ministry of Hajj Official Mission Accreditation ⭐",
        "Foreign Hajj Affairs Office dispatch letter",
        "Valid passport & health credentials"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-005", "business", "Hajj Mission Visa")
    },
    {
      id: "sa-SPE-006",
      officialCode: "SA-SPE-006",
      name: "Umrah Tour Organizer Visa",
      categoryCode: "business",
      fee: "SAR 0",
      validity: "90 days",
      stay: "90 days",
      purpose: "Umrah tour operators managing pilgrim group logistics.",
      eligibility: "Licensed Umrah agency representatives.",
      record_type: "UMRAH_VISA",
      docs: [
        "Ministry of Hajj & Umrah Tour Operator Registration",
        "Licensed Umrah Agency dispatch letter",
        "Valid passport & Enjaz application"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-006", "business", "Umrah Tour Organizer")
    },
    {
      id: "sa-SPE-007",
      officialCode: "SA-SPE-007",
      name: "Military & Defense Cooperation Visa",
      categoryCode: "business",
      fee: "SAR 0",
      validity: "Duration of defense assignment",
      stay: "Assignment duration",
      purpose: "Military cooperation, defense training, and joint security exercises.",
      eligibility: "Defense personnel invited by Ministry of Defense Saudi Arabia.",
      record_type: "MILITARY_VISA",
      docs: [
        "Ministry of Defense Saudi Arabia Official Invitation ⭐",
        "Foreign Ministry of Defense clearance",
        "Military passport or official service passport"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-007", "business", "Military Cooperation Visa")
    },
    {
      id: "sa-SPE-013",
      officialCode: "SA-SPE-013",
      name: "Foreign Media Journalist Visa 90 Days (Ministry of Media Approved)",
      categoryCode: "business",
      fee: "SAR 500",
      validity: "90 days",
      stay: "90 days",
      purpose: "Journalists, film crews, and media correspondents covering news in Saudi Arabia.",
      eligibility: "Foreign press accredited by Ministry of Media.",
      record_type: "JOURNALIST_VISA",
      docs: [
        "Ministry of Media Press Accreditation Certificate ⭐",
        "Foreign media house assignment letter & press card",
        "Valid passport & equipment list"
      ],
      ...getSaudiArabiaMicroDetails("sa-SPE-013", "business", "Foreign Journalist Visa")
    }
  ],
  work: [
    {
      id: "sa-WRK-001",
      officialCode: "SA-WRK-001",
      name: "Employment Work Visa 90 Days Single Entry (MHRSD Work Permit + Qiwa Contract + Iqama 1Y)",
      categoryCode: "work",
      fee: "SAR 2,000 + VFS service fee (USD 30)",
      validity: "90 days single entry (Iqama Resident Card issued within 90 days of entry)",
      stay: "1 year renewable (Work Iqama Residence)",
      purpose: "Long-term skilled employment across Saudi corporate, industrial, engineering, medical, and service sectors.",
      eligibility: "Foreign workers holding an official MHRSD (Ministry of Human Resources) Work Permit Approval + Qiwa Authenticated Contract + Medical Fit Certificate.",
      popular: true,
      highlight: true,
      record_type: "WORK_VISA",
      docs: [
        "MOFA Work Visa Block Authorization (Saddad / Enjaz Work Visa Approval) ⭐",
        "Authenticated Qiwa Digital Employment Contract (signed on qiwa.sa platform) ⭐",
        "MHRSD Work Permit Approval Certificate ⭐",
        "Apostilled / MOFA Authenticated Degree Certificate & Work Experience Proof ⭐",
        "GAMCA Medical Fitness Certificate (issued by accredited GAMCA medical center) ⭐",
        "Police Clearance Certificate (Apostilled / Police Check under 6 months)",
        "Sponsoring Saudi Employer Commercial Registration (CR) copy",
        "Valid original passport, Enjaz application form, and passport photos"
      ],
      ...getSaudiArabiaMicroDetails("sa-WRK-001", "work", "Employment Work Visa Iqama")
    },
    {
      id: "sa-WRK-002",
      officialCode: "SA-WRK-002",
      name: "Work Visit Visa 90 Days (Short Term Technical Dispatch / Consulting)",
      categoryCode: "work",
      fee: "SAR 500",
      validity: "90 days single / multiple",
      stay: "Up to 90 days",
      purpose: "Short-term technical work, machinery installation, IT consulting, or short project dispatch under 90 days.",
      eligibility: "Foreign specialists dispatched for short technical work approved on Qiwa / MHRSD.",
      record_type: "WORK_VISA",
      docs: [
        "MHRSD Work Visit Authorization Letter ⭐",
        "Qiwa Short Term Work Contract",
        "Sponsoring Saudi company CR copy & Chamber of Commerce attestation",
        "Foreign employer dispatch letter & engineer degree copy",
        "Valid passport & Enjaz application"
      ],
      ...getSaudiArabiaMicroDetails("sa-WRK-002", "work", "Work Visit Visa 90D")
    },
    {
      id: "sa-WRK-003",
      officialCode: "SA-WRK-003",
      name: "Temporary Work Visa 90 Days (Qiwa Temporary Work Permit)",
      categoryCode: "work",
      fee: "SAR 1,000",
      validity: "90 days (renewable once)",
      stay: "Up to 90 days",
      purpose: "Temporary employment for seasonal projects, auditing, or emergency technical maintenance.",
      eligibility: "Temporary workers holding Qiwa Temporary Work Permit.",
      record_type: "WORK_VISA",
      docs: [
        "Qiwa Temporary Work Permit Certificate ⭐",
        "Sponsoring company CR copy",
        "Temporary employment agreement",
        "Valid passport & GAMCA medical exam"
      ],
      ...getSaudiArabiaMicroDetails("sa-WRK-003", "work", "Temporary Work Visa Qiwa")
    },
    {
      id: "sa-WRK-004",
      officialCode: "SA-WRK-004",
      name: "Seasonal Work Visa 90 Days (Hajj & Harvest Season)",
      categoryCode: "work",
      fee: "SAR 1,000",
      validity: "90 days seasonal",
      stay: "90 days",
      purpose: "Seasonal employment during Hajj season, transportation, slaughterhouse operations, or agriculture.",
      eligibility: "Seasonal workers contracted during designated seasonal quotas.",
      record_type: "WORK_VISA",
      docs: [
        "MHRSD Seasonal Work Permit Approval ⭐",
        "Seasonal employment contract & Saudi sponsor CR",
        "Valid passport & GAMCA medical clearance"
      ],
      ...getSaudiArabiaMicroDetails("sa-WRK-004", "work", "Seasonal Work Visa Hajj")
    },
    {
      id: "sa-WRK-005",
      officialCode: "SA-WRK-005",
      name: "Domestic Worker Visa 90 Days (Musaned Platform - Drivers, Housemaids, Caregivers)",
      categoryCode: "work",
      fee: "SAR 2,000",
      validity: "90 days single (Iqama issued after entry)",
      stay: "1 to 2 years renewable",
      purpose: "Employment as housemaid, private driver, cook, or home caregiver.",
      eligibility: "Domestic workers hired by Saudi sponsors via official Musaned.sa platform.",
      record_type: "WORK_VISA",
      docs: [
        "Musaned Authenticated Domestic Worker Contract ⭐",
        "MOFA Domestic Work Visa Block Authorization",
        "GAMCA Medical Fitness Certificate",
        "Home country domestic worker clearance",
        "Valid passport & Enjaz application"
      ],
      ...getSaudiArabiaMicroDetails("sa-WRK-005", "work", "Domestic Worker Musaned")
    },
    {
      id: "sa-WRK-006",
      officialCode: "SA-WRK-006",
      name: "Work Iqama Residence Permit 1 Year (Absher / Jawazat Work Resident Card)",
      categoryCode: "work",
      fee: "SAR 650/year + Human Resources Fee",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Mandatory resident identity card (Muqeem / Iqama) issued by Jawazat within 90 days of entry on work visa.",
      eligibility: "Foreign workers who have entered Saudi Arabia on Employment Work Visa and passed local medical check.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "Employment Work Visa entry stamp in passport ⭐",
        "Local Saudi Medical Exam Result (Efada health portal) ⭐",
        "Qiwa Digital Contract Verification & MHRSD Work Permit Fee Payment ⭐",
        "Absher / Jawazat Iqama Issuance Application"
      ],
      ...getSaudiArabiaMicroDetails("sa-WRK-006", "work", "Work Iqama Residence Permit")
    },
    {
      id: "sa-WRK-007",
      officialCode: "SA-WRK-007",
      name: "Work Iqama Extension 1 Year (Absher Business / Muqeem Portal)",
      categoryCode: "work",
      fee: "SAR 650/year + MHRSD Fee",
      validity: "1 year extension",
      stay: "1 year",
      purpose: "Annual renewal of Work Iqama by sponsoring employer.",
      eligibility: "Current Iqama holders with active Qiwa contract and MHRSD fee payment.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Renewed Qiwa Digital Contract ⭐",
        "MHRSD Work Permit Renewal Fee Payment Receipt ⭐",
        "Medical Insurance Policy Renewal",
        "Muqeem / Absher online renewal submission"
      ],
      ...getSaudiArabiaMicroDetails("sa-WRK-007", "work", "Work Iqama Extension Absher")
    },
    {
      id: "sa-WRK-008",
      officialCode: "SA-WRK-008",
      name: "Qiwa Digital Employment Contract Verification (Qiwa Platform)",
      categoryCode: "work",
      fee: "SAR 0",
      validity: "Contract duration",
      stay: "Prerequisite document",
      purpose: "Official authenticated employment contract registered on Qiwa platform required for visa issuance.",
      eligibility: "All foreign employees working under Saudi Labor Law.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Qiwa Digital Contract Authentication Copy (signed digitally on qiwa.sa)",
        "Sponsoring employer Commercial Registration (CR)"
      ],
      ...getSaudiArabiaMicroDetails("sa-WRK-008", "work", "Qiwa Contract Verification")
    },
    {
      id: "sa-WRK-009",
      officialCode: "SA-WRK-009",
      name: "MHRSD Work Permit Authorization (Ministry Authorization)",
      categoryCode: "work",
      fee: "SAR 0",
      validity: "Prerequisite document",
      stay: "Prerequisite document",
      purpose: "Ministry of Human Resources labor quota authorization for hiring foreign staff.",
      eligibility: "Sponsoring firms complying with Nitaqat Saudization ratios.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "MHRSD Work Permit Quota Allocation Approval",
        "Nitaqat Green Category Saudization Compliance Certificate"
      ],
      ...getSaudiArabiaMicroDetails("sa-WRK-009", "work", "MHRSD Work Permit Approval")
    },
    {
      id: "sa-WRK-010",
      officialCode: "SA-WRK-010",
      name: "Work Visit Visa Extension 90 Days (Absher / Jawazat)",
      categoryCode: "work",
      fee: "SAR 100",
      validity: "90 days extension",
      stay: "90 days",
      purpose: "Extending short-term work visit stay.",
      eligibility: "Work visit visa holders with employer extension letter.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Employer extension statement & CR copy",
        "Absher online application receipt",
        "Valid passport copy"
      ],
      ...getSaudiArabiaMicroDetails("sa-WRK-010", "work", "Work Visit Extension")
    },
    {
      id: "sa-WRK-011",
      officialCode: "SA-WRK-011",
      name: "Employment Work Visa - Foreign Company Representative 90 Days",
      categoryCode: "work",
      fee: "SAR 2,000",
      validity: "90 days single (Iqama issued after entry)",
      stay: "1 year renewable",
      purpose: "Chief Representative posted at a foreign enterprise regional branch in Saudi Arabia.",
      eligibility: "Appointed executives of MISA-licensed foreign regional headquarters.",
      record_type: "WORK_VISA",
      docs: [
        "MISA Regional Headquarter License Certificate ⭐",
        "Representative Office Commercial Registration (CR)",
        "Qiwa contract & GAMCA medical exam",
        "Valid passport & Enjaz application"
      ],
      ...getSaudiArabiaMicroDetails("sa-WRK-011", "work", "Regional HQ Representative Work")
    },
    {
      id: "sa-STU-007",
      officialCode: "SA-STU-007",
      name: "Student Visa to Work Iqama Status Change (MHRSD / Qiwa)",
      categoryCode: "work",
      fee: "SAR 2,000",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Transitioning status from student visa to employment work Iqama upon university graduation.",
      eligibility: "Graduating foreign students receiving job offer from a registered Saudi employer.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Saudi University Graduation Degree Certificate ⭐",
        "Qiwa Digital Employment Contract ⭐",
        "MHRSD Status Change Work Permit Approval",
        "Absher status change application"
      ],
      ...getSaudiArabiaMicroDetails("sa-STU-007", "work", "Student to Work Status Change")
    }
  ],
  student: [
    {
      id: "sa-STU-001",
      officialCode: "SA-STU-001",
      name: "Higher Education Student Visa 1 Year (Degree Studies - BA / MA / PhD)",
      categoryCode: "student",
      fee: "SAR 0 (Tuition & Visa Sponsored by Saudi Government / University)",
      validity: "1 year renewable",
      stay: "Matches course duration (1 to 4 years)",
      purpose: "Full-time Bachelor's, Master's, or PhD studies at accredited Saudi public or private universities.",
      eligibility: "Accepted students holding official University Admission Letter issued by Ministry of Education / Saudi University.",
      popular: true,
      highlight: true,
      record_type: "STUDENT_VISA",
      docs: [
        "Official Saudi University Admission Letter (MoE Approved) ⭐",
        "Saudi University Business / Registration Certificate copy ⭐",
        "Scholarship Grant Certificate / Tuition Fee Payment Receipt ⭐",
        "Highest Academic Degree Certificate & Transcripts (Apostilled or MOFA Authenticated)",
        "Personal / Parent Bank Statement showing min SAR 20,000 liquid balance",
        "GAMCA Medical Fitness Certificate (stamped by medical center)",
        "Police Clearance Certificate (Police check under 6 months)",
        "Valid passport, Enjaz form, and passport photos"
      ],
      ...getSaudiArabiaMicroDetails("sa-STU-001", "student", "Student Visa Higher Education")
    },
    {
      id: "sa-STU-002",
      officialCode: "SA-STU-002",
      name: "Arabic Language Student Visa 1 Year (University Language Institutes)",
      categoryCode: "student",
      fee: "SAR 0",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Enrolling in Arabic language immersion programs at Saudi university institutes.",
      eligibility: "Accepted students at university Arabic Language Centers.",
      record_type: "STUDENT_VISA",
      docs: [
        "University Arabic Language Institute Admission Letter ⭐",
        "Academic credentials & transcripts",
        "Bank statement showing min SAR 20,000 balance",
        "Valid passport & GAMCA medical exam"
      ],
      ...getSaudiArabiaMicroDetails("sa-STU-002", "student", "Arabic Language Student Visa")
    },
    {
      id: "sa-STU-003",
      officialCode: "SA-STU-003",
      name: "Government Scholarship Student Visa 1 Year (Study in Saudi Arabia Portal)",
      categoryCode: "student",
      fee: "SAR 0 (Full Scholarship)",
      validity: "Matches scholarship duration",
      stay: "Scholarship period",
      purpose: "Full government scholarship study for international students under Study in Saudi Arabia initiative.",
      eligibility: "Selected international scholarship recipients.",
      record_type: "STUDENT_VISA",
      docs: [
        "Ministry of Education Scholarship Award Certificate ⭐",
        "Study in Saudi Arabia Portal Admission Confirmation",
        "Apostilled degree & medical clearance",
        "Valid passport & Enjaz form"
      ],
      ...getSaudiArabiaMicroDetails("sa-STU-003", "student", "Government Scholarship Student")
    },
    {
      id: "sa-STU-004",
      officialCode: "SA-STU-004",
      name: "Doctoral PhD Student Visa 4 Years (Research Universities - KAUST / KFUPM / KSU)",
      categoryCode: "student",
      fee: "SAR 0 + Research Fellowship",
      validity: "4 years renewable",
      stay: "4 years",
      purpose: "Doctoral PhD research and degree studies at top Saudi research universities.",
      eligibility: "Master's degree holders admitted to PhD programs with lab research fellowships.",
      record_type: "STUDENT_VISA",
      docs: [
        "PhD Admission Letter & Lab Research Fellowship Award ⭐",
        "Master's Degree Certificate & Transcripts (Apostilled)",
        "Research Proposal Summary",
        "Valid passport & medical fitness certificate"
      ],
      ...getSaudiArabiaMicroDetails("sa-STU-004", "student", "Doctoral PhD Student Visa")
    },
    {
      id: "sa-STU-005",
      officialCode: "SA-STU-005",
      name: "Student Visa Extension 1 Year (Absher / Jawazat)",
      categoryCode: "student",
      fee: "SAR 0",
      validity: "1 year extension",
      stay: "1 year",
      purpose: "Annual extension of Student Iqama for ongoing university enrollment.",
      eligibility: "Enrolled students maintaining university academic progress.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "University Enrollment Certificate & Transcript",
        "Absher online extension application",
        "Valid student Iqama copy"
      ],
      ...getSaudiArabiaMicroDetails("sa-STU-005", "student", "Student Extension Absher")
    },
    {
      id: "sa-STU-006",
      officialCode: "SA-STU-006",
      name: "Student Internship Visa 6 Months (Academic Practical Training)",
      categoryCode: "student",
      fee: "SAR 0",
      validity: "6 months",
      stay: "6 months",
      purpose: "Practical curriculum internship for enrolled university students.",
      eligibility: "Students with university internship approval and Saudi host company agreement.",
      record_type: "INTERN_VISA",
      docs: [
        "University Internship Endorsement Letter",
        "Saudi Host Company Internship Agreement",
        "Valid passport & student ID"
      ],
      ...getSaudiArabiaMicroDetails("sa-STU-006", "student", "Student Internship Visa")
    },
    {
      id: "sa-STU-008",
      officialCode: "SA-STU-008",
      name: "Visiting Student Researcher Visa 1 Year (KAUST / KACST Research Fellowship)",
      categoryCode: "student",
      fee: "SAR 0",
      validity: "1 year",
      stay: "1 year",
      purpose: "Visiting research scholars conducting STEM lab research at Saudi research institutes.",
      eligibility: "Research fellows invited by KAUST, KACST, or King Saud University labs.",
      record_type: "RESEARCH_VISA",
      docs: [
        "Research Center Fellowship Invitation Letter ⭐",
        "Home university enrollment / research dispatch letter",
        "Valid passport & research agreement"
      ],
      ...getSaudiArabiaMicroDetails("sa-STU-008", "student", "Student Researcher Visa")
    }
  ],
  family: [
    {
      id: "sa-FAM-001",
      officialCode: "SA-FAM-001",
      name: "Family Visit Visa 90 Days Single / Multiple Entry (MOFA Portal - visitsaudi)",
      categoryCode: "family",
      fee: "SAR 300 + Insurance",
      validity: "90 days single / 1 year multiple",
      stay: "Up to 90 days per visit",
      purpose: "Family visits for spouse, children, parents, or in-laws visiting legal Iqama residents or Saudi citizens.",
      eligibility: "Invited relatives of Saudi citizens or foreign Iqama holders with active MOFA Family Visit Approval.",
      popular: true,
      highlight: true,
      record_type: "FAMILY_VISA",
      docs: [
        "MOFA Family Visit Visa Approval Document ⭐",
        "Host Resident Iqama copy & Saudi National ID copy ⭐",
        "Apostilled / MOFA Authenticated Marriage Certificate (for spouse) ⭐",
        "Apostilled / MOFA Authenticated Birth Certificate (for children/parents) ⭐",
        "Host salary certificate & housing proof in Saudi Arabia",
        "Valid passport, Enjaz form, and passport photos"
      ],
      ...getSaudiArabiaMicroDetails("sa-FAM-001", "family", "Family Visit Visa MOFA")
    },
    {
      id: "sa-FAM-002",
      officialCode: "SA-FAM-002",
      name: "Family Visit Visa - Spouse 90 Days",
      categoryCode: "family",
      fee: "SAR 300",
      validity: "90 days single / multiple",
      stay: "Up to 90 days per visit",
      purpose: "Short-term family visit for foreign spouse of Iqama holder or Saudi citizen.",
      eligibility: "Legally married spouse with MOFA visit approval.",
      record_type: "FAMILY_VISA",
      docs: [
        "MOFA Family Visit Approval for Spouse ⭐",
        "Apostilled Marriage Certificate",
        "Host Iqama copy & salary proof",
        "Valid passport & application form"
      ],
      ...getSaudiArabiaMicroDetails("sa-FAM-002", "family", "Family Visit Spouse")
    },
    {
      id: "sa-FAM-003",
      officialCode: "SA-FAM-003",
      name: "Family Visit Visa - Child 90 Days",
      categoryCode: "family",
      fee: "SAR 300",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short-term visit for dependent children visiting parent residing in Saudi Arabia.",
      eligibility: "Minor or adult children with MOFA visit approval.",
      record_type: "FAMILY_VISA",
      docs: [
        "MOFA Family Visit Approval for Child ⭐",
        "Apostilled Birth Certificate",
        "Host parent Iqama copy",
        "Valid child passport"
      ],
      ...getSaudiArabiaMicroDetails("sa-FAM-003", "family", "Family Visit Child")
    },
    {
      id: "sa-FAM-004",
      officialCode: "SA-FAM-004",
      name: "Family Visit Visa - Elderly Parent 90 Days",
      categoryCode: "family",
      fee: "SAR 300",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short-term visit for parents visiting adult child working in Saudi Arabia.",
      eligibility: "Parents of Iqama holders or Saudi citizens.",
      record_type: "FAMILY_VISA",
      docs: [
        "MOFA Family Visit Approval for Parent ⭐",
        "Apostilled Kinship / Birth Certificate",
        "Host child Iqama & salary proof",
        "Valid parent passport & health insurance"
      ],
      ...getSaudiArabiaMicroDetails("sa-FAM-004", "family", "Family Visit Parent")
    },
    {
      id: "sa-FAM-005",
      officialCode: "SA-FAM-005",
      name: "Family Residence Iqama 1 Year (Permanent Dependent Residence Iqama)",
      categoryCode: "family",
      fee: "SAR 2,000 + Dependent Levy Fee (SAR 400/mo per dependent)",
      validity: "1 year renewable",
      stay: "Matches primary sponsor's Iqama validity",
      purpose: "Long-term dependent residence for spouse and minor children cohabiting with foreign worker in Saudi Arabia.",
      eligibility: "Spouse and minor children of foreign worker holding eligible profession and meeting salary threshold.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "Primary Sponsor's Work Iqama & Employment Salary Certificate ⭐",
        "MOFA Family Residence Visa Approval ⭐",
        "Apostilled / MOFA Authenticated Marriage Certificate (for spouse) ⭐",
        "Apostilled / MOFA Authenticated Birth Certificate (for children) ⭐",
        "Medical Fitness Exam (Efada health portal) for dependents aged 12+",
        "Absher / Jawazat Dependent Iqama Application"
      ],
      ...getSaudiArabiaMicroDetails("sa-FAM-005", "family", "Family Residence Iqama")
    },
    {
      id: "sa-FAM-006",
      officialCode: "SA-FAM-006",
      name: "Family Visit Visa Extension 90 Days (Absher Portal)",
      categoryCode: "family",
      fee: "SAR 100",
      validity: "Up to 90 days extension (max 180 days total stay)",
      stay: "Up to 90 days",
      purpose: "Extending short-term family visit visa before expiry.",
      eligibility: "Family visit visa holders applying via Absher portal before expiry.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Absher online extension application receipt ⭐",
        "Extended Saudi health insurance policy for visitor ⭐",
        "Sponsor Iqama & visitor passport copy"
      ],
      ...getSaudiArabiaMicroDetails("sa-FAM-006", "family", "Family Visit Extension Absher")
    },
    {
      id: "sa-FAM-007",
      officialCode: "SA-FAM-007",
      name: "Family Residence Iqama Renewal 1 Year (Absher Platform)",
      categoryCode: "family",
      fee: "SAR 2,000 + Dependent Levy Fee",
      validity: "1 year extension",
      stay: "1 year",
      purpose: "Annual renewal of dependent residence Iqama for family members.",
      eligibility: "Dependent Iqama holders with paid dependent fees.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Dependent Levy Payment Fee Receipt (Saddad payment) ⭐",
        "Primary sponsor renewed Iqama copy",
        "Medical insurance policy renewal for dependents",
        "Absher online renewal submission"
      ],
      ...getSaudiArabiaMicroDetails("sa-FAM-007", "family", "Family Iqama Renewal Absher")
    },
    {
      id: "sa-FAM-008",
      officialCode: "SA-FAM-008",
      name: "Family Visit Visa - Adoption 90 Days",
      categoryCode: "family",
      fee: "SAR 300",
      validity: "90 days",
      stay: "90 days",
      purpose: "Visit visa for adopted minor children with official court adoption decree.",
      eligibility: "Adopted children of Saudi citizens or Iqama holders.",
      record_type: "FAMILY_VISA",
      docs: [
        "Saudi Family Court Adoption Decree / Official Adoption Certificate ⭐",
        "MOFA Family Visit Approval",
        "Sponsor Iqama copy & housing lease",
        "Valid child passport"
      ],
      ...getSaudiArabiaMicroDetails("sa-FAM-008", "family", "Family Visit Adoption")
    }
  ],
  pr: [
    {
      id: "sa-PR-001",
      officialCode: "SA-PR-001",
      name: "Premium Residency - Investor Stream (Unlimited Permanent Iqama المميزة - SAR 30M Investment)",
      categoryCode: "pr",
      fee: "SAR 4,000 (Processing Fee) + SAR 30,000,000 Direct Business Investment",
      validity: "Permanent Unlimited Residency (PR Saudi Arabia)",
      stay: "Indefinite Permanent Residence",
      purpose: "Permanent residency, business ownership, real estate purchase, and worker sponsorship without Saudi sponsor.",
      eligibility: "Direct capital investment of min SAR 30,000,000 into Saudi economy + MISA Investment License + creating 10+ jobs in 2 years.",
      popular: true,
      highlight: true,
      record_type: "PR_VISA",
      docs: [
        "Premium Residency Center Official Approval Certificate ⭐",
        "MISA Foreign Investment License Certificate showing SAR 30M+ capital ⭐",
        "Audited Financial Statements & Proof of Creating 10+ Saudi Jobs",
        "Clean Criminal Background Certificate (Apostilled under 6 months) ⭐",
        "Medical Fitness Certificate (Efada health portal)",
        "Financial Solvency Audit Report & Bank Statement",
        "Valid passport & Premium Residency Application"
      ],
      ...getSaudiArabiaMicroDetails("sa-PR-001", "pr", "Premium Residency Investor SAR 30M")
    },
    {
      id: "sa-PR-002",
      officialCode: "SA-PR-002",
      name: "Premium Residency - Entrepreneur Stream (Unlimited PR - Monshaat Incubator)",
      categoryCode: "pr",
      fee: "SAR 4,000",
      validity: "Unlimited Permanent Residency",
      stay: "Indefinite",
      purpose: "Permanent residency for innovative startup founders securing venture capital in Saudi Arabia.",
      eligibility: "Securing min SAR 15,000,000 venture investment OR Monshaat incubator approval + owning 10%+ equity.",
      record_type: "PR_VISA",
      docs: [
        "Monshaat SME Endorsement & Venture Capital Investment Proof (min SAR 15M) ⭐",
        "MISA Entrepreneur License Certificate",
        "Startup Business Plan & Audit Financials",
        "Clean Criminal Background Check & Medical Certificate",
        "Premium Residency Center Application"
      ],
      ...getSaudiArabiaMicroDetails("sa-PR-002", "pr", "Premium Residency Entrepreneur")
    },
    {
      id: "sa-PR-003",
      officialCode: "SA-PR-003",
      name: "Premium Residency - Real Estate Owner Stream (Unlimited PR - SAR 4M Property)",
      categoryCode: "pr",
      fee: "SAR 4,000",
      validity: "Unlimited Permanent Residency",
      stay: "Indefinite",
      purpose: "Permanent residency for foreign property owners purchasing residential real estate in Saudi Arabia.",
      eligibility: "Owning unmortgaged residential real estate in Saudi Arabia valued at min SAR 4,000,000 verified by Real Estate Registry.",
      record_type: "PR_VISA",
      docs: [
        "Saudi Real Estate Title Deed (Saak) valued at min SAR 4,000,000 ⭐",
        "Official Property Valuation Report from accredited evaluator (TAQEEM) ⭐",
        "Proof that property is unmortgaged residential real estate",
        "Clean Criminal Background Check & Medical Exam",
        "Premium Residency Center Application"
      ],
      ...getSaudiArabiaMicroDetails("sa-PR-003", "pr", "Premium Residency Real Estate SAR 4M")
    },
    {
      id: "sa-PR-004",
      officialCode: "SA-PR-004",
      name: "Premium Residency - Special Talent Stream (Healthcare / Executive / Scientific Experts)",
      categoryCode: "pr",
      fee: "SAR 4,000",
      validity: "Unlimited Permanent Residency",
      stay: "Indefinite",
      purpose: "Permanent residency for high-earning foreign executives (SAR 80,000/mo+), healthcare specialists, and researchers.",
      eligibility: "Healthcare professionals, researchers, or executives earning min SAR 80,000/month with Ministry endorsement.",
      record_type: "PR_VISA",
      docs: [
        "Ministry Endorsement Certificate (Health / Education / Investment) ⭐",
        "Salary Certificate & Tax proof showing min SAR 80,000/month salary ⭐",
        "Apostilled Academic PhD / Specialized Medical License",
        "Clean Criminal Check & Medical Exam",
        "Premium Residency Center Application"
      ],
      ...getSaudiArabiaMicroDetails("sa-PR-004", "pr", "Premium Residency Special Talent")
    },
    {
      id: "sa-PR-005",
      officialCode: "SA-PR-005",
      name: "Premium Residency - Limited Duration 1 Year (Renewable - SAR 100,000 Annual Fee)",
      categoryCode: "pr",
      fee: "SAR 100,000/year",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "1-year renewable Premium Residency providing business ownership and sponsor-free residence.",
      eligibility: "High net worth individuals or executives paying SAR 100,000 annual fee.",
      record_type: "PR_VISA",
      docs: [
        "Bank Solvency Certificate showing min USD 100,000 balance ⭐",
        "Clean Criminal Background Certificate (Apostilled)",
        "Medical Examination Result",
        "SAR 100,000 annual fee payment receipt",
        "Premium Residency Center Application"
      ],
      ...getSaudiArabiaMicroDetails("sa-PR-005", "pr", "Limited Premium Residency 1Y")
    },
    {
      id: "sa-PR-007",
      officialCode: "SA-PR-007",
      name: "Premium Residency Card Extension & Renewal (Premium Residency Center)",
      categoryCode: "pr",
      fee: "SAR 4,000 / SAR 100,000",
      validity: "Renewal extension",
      stay: "Matches residency category",
      purpose: "Renewal of Premium Residency card or status extension.",
      eligibility: "Active Premium Residency holders maintaining investment or real estate status.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Premium Residency Card copy & renewal request",
        "Proof of ongoing property ownership or MISA investment compliance",
        "Premium Residency Center online submission"
      ],
      ...getSaudiArabiaMicroDetails("sa-PR-007", "pr", "Premium Residency Renewal")
    },
    {
      id: "sa-PR-008",
      officialCode: "SA-PR-008",
      name: "Saudi Arabian Citizenship & Naturalization (Ministry of Interior - 5 Years Premium Residence)",
      categoryCode: "pr",
      fee: "SAR 4,000 + Ministry of Interior Fee",
      validity: "Lifetime Saudi Arabian Citizenship",
      stay: "Permanent Citizen",
      purpose: "Full acquisition of Saudi citizenship under Saudi Nationality Code.",
      eligibility: "5 years continuous Premium Residence in Saudi Arabia + Fluent Arabic proficiency + Clean criminal record + Royal Order / MOI Approval.",
      record_type: "PR_VISA",
      docs: [
        "Ministry of Interior Naturalization Approval & Royal Decree ⭐",
        "5 Years Physical Premium Residence Records in Saudi Arabia ⭐",
        "Fluent Arabic Language Oral & Written Test Pass Certificate ⭐",
        "Clean Criminal Background Check & Renunciation of former citizenship (if required)",
        "MOI Naturalization Application"
      ],
      ...getSaudiArabiaMicroDetails("sa-PR-008", "pr", "Saudi Arabian Naturalization")
    }
  ]
};
