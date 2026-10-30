import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getChinaMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "China L Tourist / M Business / Z Work / X Student Visas require proof of sufficient financial means (min USD 3,000 / CNY 20,000 liquid bank balance for L/M short stays, USD 10,000/year for X1 Student, and employer salary / SAFEA Work Permit Notification for Z Work Permit).";
  let fundsBankMonths = "Last 3 months personal bank statements stamped by bank branch with regular salary or seasoned balance.";
  let fundsSudden = "❌ Sudden 1-day cash lump-sum deposits right before visa submission at Chinese Visa Application Service Center (COVAS/VFS) are flagged and cause rejection. Average balance must be maintained over 3 months.";
  let fundsEx = "✅ Sahi: Seasoned bank balance of USD 3,000+ for 3 months. ❌ Galat: Borrowed cash deposited 24 hours prior to application.";

  let itrYears = "Personal Income Tax Return (ITR) / Individual Income Tax Certificate (NTS / Tax Authority) for past 2 years for business, work, and talent applicants.";
  let itrMatch = "Reported tax income must reconcile with personal bank credits and employer pay slips.";
  let itrNoItr = "Not required for short term L tourist visitors or students sponsored by parents.";

  let bankMonths = "Last 3 months bank statements.";
  let bankReg = "Regular salary credits or steady corporate deposits.";
  let bankFd = "Fixed deposits accepted as supporting proof.";
  let bankSource = "Salary, corporate revenue, or verified parental sponsorship.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('z') || lowerCode.includes('wrk') || lowerCode.includes('r-talent')) {
    fundsMin = "Z Work Permit Visa requires an official Notification Letter for Foreigner's Work Permit (SAFEA / Ministry of Science and Technology) + PU Invitation Letter issued by Foreign Affairs Office (FAO) + employment contract meeting Chinese minimum wage standards.";
    fundsBankMonths = "Employer Business License (Gongshang Zhizhao), Work Permit Notification Letter, and 3 months pay slips.";
    fundsSudden = "Employment contracts must specify gross monthly salary in CNY, job title, and social security compliance.";
    fundsEx = "✅ Sahi: SAFEA Foreigner Work Permit Notification + FAO PU Invitation Letter + Employer Business License. ❌ Galat: Unregistered employer or missing Work Permit Notification.";
  } else if (cat === 'student' || lowerCode.includes('x1') || lowerCode.includes('x2') || lowerCode.includes('stu')) {
    fundsMin = "X1 Student Visa (180+ days) requires an official University Admission Notice + JW201 / JW202 Foreign Student Visa Application Form approved by Chinese Ministry of Education + bank statement showing USD 10,000 (or CSC Scholarship award certificate).";
    fundsBankMonths = "6 months bank statements of student or parent financial sponsor showing min USD 10,000.";
    fundsSudden = "Parental affidavit of support and birth certificate required if using parent's bank account.";
    fundsEx = "✅ Sahi: Official JW202 Form + University Admission Notice + USD 10,000 bank certificate. ❌ Galat: Missing JW202 form or unverified funding.";
  } else if (cat === 'family' || lowerCode.includes('q1') || lowerCode.includes('q2') || lowerCode.includes('s1') || lowerCode.includes('s2') || lowerCode.includes('fam')) {
    fundsMin = "Q1 Family Reunion (Spouse/Child/Parent of Chinese citizen) requires apostilled marriage/birth certificates + host Chinese National ID Card (Shenfenzheng) + invitation letter. S1 Private Visit requires foreign resident's Residence Permit in China.";
    fundsBankMonths = "3–6 months bank statements and income proof of host sponsor in China.";
    fundsSudden = "Civil status certificates (Marriage/Birth) must be legalized / apostilled under Hague Convention with certified Chinese translation.";
    fundsEx = "✅ Sahi: Consular legalized / apostilled marriage certificate + Chinese host ID card & invitation. ❌ Galat: Uncertified civil documents.";
  } else if (cat === 'business' || lowerCode.includes('m') || lowerCode.includes('canton') || lowerCode.includes('biz')) {
    fundsMin = "M Business Visa requires an official Invitation Letter (TE or PU Letter) from a registered Chinese company with Business License (Gongshang Zhizhao) + foreign employer dispatch letter. Canton Fair M Visa requires official Canton Fair E-Invitation.";
    fundsBankMonths = "3 to 6 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Chinese company must be active in official State Administration for Market Regulation (SAMR) registry.";
    fundsEx = "✅ Sahi: Chinese host company invitation with Business License copy + dispatch letter. ❌ Galat: Unregistered host firm.";
  } else if (cat === 'pr' || lowerCode.includes('d-perm') || lowerCode.includes('green-card') || lowerCode.includes('pr')) {
    fundsMin = "D Permanent Residence (China Green Card) requires 4 years continuous employment in senior management in China (with tax compliance) OR USD 500,000 direct foreign investment OR 5 years marriage to Chinese citizen with 9 months/year physical residence.";
    fundsBankMonths = "4 years Individual Income Tax Payment Certificates (State Taxation Administration China) + Public Security Bureau (PSB) residence records.";
    fundsSudden = "Tax payment certificates must be verified directly via STA Hometax system.";
    fundsEx = "✅ Sahi: 4 Years Senior Position Work Permit + STA Tax Payment Certificates + PSB Clean Record. ❌ Galat: Insufficient residency days or missing tax certificates.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

export const CHINA_108_VISAS: CountryVisas = {
  tourist: [
    {
      id: "cn-TOU-001",
      officialCode: "CN-TOU-001",
      name: "L Tourist Visa 30 Days Single Entry (Consulate / COVAS / VFS)",
      categoryCode: "tourist",
      fee: "USD 140 + VFS service fee (USD 30)",
      validity: "30 days single entry (valid for 3 months)",
      stay: "Up to 30 days per entry",
      purpose: "Short term tourism, sightseeing, cultural travel, and visiting friends/family in China.",
      eligibility: "Valid passport with 6 months validity, 2 blank pages, return flight ticket, hotel reservation OR Host Invitation Letter with Host Chinese ID Card.",
      popular: true,
      highlight: true,
      record_type: "TOURIST_VISA",
      docs: [
        "Valid original passport (min 6 months validity, 2 blank pages & old passports) ⭐",
        "Completed Chinese Visa Application Form (Form V.2013 / COVAS) + Appointment Slip",
        "2 recent passport photos (33x48mm white background, dark clothes, no glasses) ⭐",
        "Confirmed round-trip flight booking & hotel reservation OR Host Invitation Letter with Host Chinese ID (Shenfenzheng) copy ⭐",
        "Personal bank account statement for past 3 months (min USD 3,000 / CNY 20,000 balance with bank stamp) ⭐",
        "Employment NOC letter / Business registration & pay slips for past 3 months",
        "Personal Income Tax Return (ITR) / Tax Assessment for past 2 years",
        "Detailed day-by-day travel itinerary in China"
      ],
      ...getChinaMicroDetails("cn-TOU-001", "tourist", "L Tourist 30 Days")
    },
    {
      id: "cn-TOU-002",
      officialCode: "CN-TOU-002",
      name: "L Tourist Visa 60 Days Double Entry",
      categoryCode: "tourist",
      fee: "USD 140",
      validity: "6 months double entry",
      stay: "Up to 60 days per entry",
      purpose: "Double entry tourism and travel across Mainland China and neighbouring regions.",
      eligibility: "Travelers planning two entries to Mainland China within 6 months.",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid passport, photos & COVAS application form",
        "Confirmed double entry flight itineraries & hotel bookings",
        "Bank statement showing min USD 4,000 balance",
        "Employment proof & travel itinerary"
      ],
      ...getChinaMicroDetails("cn-TOU-002", "tourist", "L Tourist 60 Days Double")
    },
    {
      id: "cn-TOU-003",
      officialCode: "CN-TOU-003",
      name: "L Tourist Visa 90 Days Multiple Entry 1 Year",
      categoryCode: "tourist",
      fee: "USD 140",
      validity: "1 year multiple entry",
      stay: "Up to 90 days per entry",
      purpose: "Frequent leisure travel and visiting relatives in China.",
      eligibility: "Frequent travelers with previous China visas in passport.",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid passport containing previous China entry stamps",
        "Host invitation letter & Chinese ID / Resident permit copy",
        "Bank statement showing min USD 5,000 balance",
        "Flight ticket & hotel reservation"
      ],
      ...getChinaMicroDetails("cn-TOU-003", "tourist", "L Tourist 1Y Multiple")
    },
    {
      id: "cn-TOU-004",
      officialCode: "CN-TOU-004",
      name: "L Tourist Visa 10 Years Multiple Entry (US Citizens - 60 Days Per Entry)",
      categoryCode: "tourist",
      fee: "USD 140",
      validity: "10 years multiple entry",
      stay: "Up to 60 days per entry",
      purpose: "Long-term multiple entry tourism for US passport holders under bilateral agreement.",
      eligibility: "US passport holders with at least 1 year passport validity remaining.",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid US Passport (min 12 months validity remaining) ⭐",
        "Completed COVAS China Visa Application Form V.2013",
        "Standard L tourist flight & hotel itinerary or host invitation",
        "Proof of financial capability"
      ],
      ...getChinaMicroDetails("cn-TOU-004", "tourist", "L Tourist 10Y Multiple US")
    },
    {
      id: "cn-TOU-005",
      officialCode: "CN-TOU-005",
      name: "L Tourist Group Visa 30 Days (Approved Tour Operator)",
      categoryCode: "tourist",
      fee: "USD 140 per person",
      validity: "30 days",
      stay: "30 days",
      purpose: "Organized group tourism of 5 or more travelers arriving and departing together.",
      eligibility: "Group travelers organized by a Ministry of Culture and Tourism approved agency.",
      record_type: "TOURIST_VISA",
      docs: [
        "Group Tourism Invitation Letter issued by authorized Chinese travel agency",
        "Official Chinese tour operator license copy",
        "Group member roster & joint flight itinerary",
        "Valid passports for all group members"
      ],
      ...getChinaMicroDetails("cn-TOU-005", "tourist", "L Tourist Group 30D")
    },
    {
      id: "cn-TOU-006",
      officialCode: "CN-TOU-006",
      name: "144-Hour Transit Visa Free Exemption (6 Days - Shanghai / Beijing / Guangzhou / Chengdu / Shenzhen)",
      categoryCode: "tourist",
      fee: "USD 0",
      validity: "144 hours (6 days)",
      stay: "144 hours",
      purpose: "Visa-free transit tourism or business for eligible passport holders transiting to a third country.",
      eligibility: "Citizens of 54 eligible countries (US, UK, EU, AU, CA, SG, JP, KR, etc.) transiting through designated ports with confirmed onward ticket to 3rd country.",
      record_type: "TRANSIT_VISA",
      docs: [
        "Valid passport of 54 eligible countries (min 3 months validity)",
        "Confirmed onward flight / vessel ticket to a 3rd country/region within 144 hours ⭐",
        "Valid visa for the 3rd destination country (if required)",
        "Completed Arrival/Departure Card at immigration checkpoint"
      ],
      ...getChinaMicroDetails("cn-TOU-006", "tourist", "144H Transit Visa Free")
    },
    {
      id: "cn-TOU-007",
      officialCode: "CN-TOU-007",
      name: "24-Hour Direct Transit Visa Free Exemption",
      categoryCode: "tourist",
      fee: "USD 0",
      validity: "24 hours",
      stay: "24 hours",
      purpose: "Direct international transit at any Chinese port for connecting flights under 24 hours.",
      eligibility: "International passengers holding confirmed onward connecting flights within 24 hours.",
      record_type: "TRANSIT_VISA",
      docs: [
        "Valid passport & connecting international flight ticket within 24 hours",
        "Visa for final destination",
        "Direct transit permit request at immigration"
      ],
      ...getChinaMicroDetails("cn-TOU-007", "tourist", "24H Direct Transit")
    },
    {
      id: "cn-TOU-008",
      officialCode: "CN-TOU-008",
      name: "72-Hour Transit Visa Free Exemption (3 Days - Regional Ports)",
      categoryCode: "tourist",
      fee: "USD 0",
      validity: "72 hours (3 days)",
      stay: "72 hours",
      purpose: "Visa-free short transit stay for 54 eligible country citizens at regional airports.",
      eligibility: "Eligible country citizens transiting through designated airports (Guilin, Harbin, etc.).",
      record_type: "TRANSIT_VISA",
      docs: [
        "Valid passport of 54 eligible countries",
        "Confirmed onward ticket to 3rd country within 72 hours",
        "Hotel reservation within municipality"
      ],
      ...getChinaMicroDetails("cn-TOU-008", "tourist", "72H Transit Visa Free")
    },
    {
      id: "cn-TOU-009",
      officialCode: "CN-TOU-009",
      name: "Hainan Province 30-Day Visa-Free Tourist Entry",
      categoryCode: "tourist",
      fee: "USD 0",
      validity: "30 days",
      stay: "30 days within Hainan Island",
      purpose: "Visa-free leisure travel and resort stay on Hainan Island.",
      eligibility: "Citizens of 59 eligible countries arriving directly in Hainan via flight or cruise.",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid passport of 59 Hainan visa-free eligible countries",
        "Direct round-trip flight / cruise ticket to Hainan",
        "Hainan hotel booking confirmation",
        "Travel details registered via Hainan travel agency"
      ],
      ...getChinaMicroDetails("cn-TOU-009", "tourist", "Hainan 30D Visa Free")
    },
    {
      id: "cn-TOU-010",
      officialCode: "CN-TOU-010",
      name: "L Tourist Medical Treatment Visa 90 Days",
      categoryCode: "tourist",
      fee: "USD 140",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short-term medical diagnosis, treatment, or surgery at registered Chinese hospitals.",
      eligibility: "Foreign patients with confirmed appointment at a Chinese Class 3A hospital.",
      record_type: "MEDICAL_VISA",
      docs: [
        "Official hospital admission & appointment letter from Chinese hospital",
        "Medical diagnosis report from home country physician",
        "Financial proof covering medical expenses & stay (min USD 5,000+)",
        "Valid passport & COVAS application form"
      ],
      ...getChinaMicroDetails("cn-TOU-010", "tourist", "L Medical Treatment")
    },
    {
      id: "cn-TOU-011",
      officialCode: "CN-TOU-011",
      name: "L Tourist Visa Extension 30 Days (PSB Exit-Entry Administration)",
      categoryCode: "tourist",
      fee: "CNY 160",
      validity: "30 days extension",
      stay: "30 days extension",
      purpose: "Extending short-term tourist stay due to travel plans or medical reasons in China.",
      eligibility: "Current L visa holders applying at local Public Security Bureau (PSB) 7 days before expiry.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Statement of reason for tourist stay extension",
        "Temporary Accommodation Registration Form (Juzhu Dengji Biao from police station) ⭐",
        "Bank account statement in China showing sufficient funds",
        "Valid passport & current L visa stamp"
      ],
      ...getChinaMicroDetails("cn-TOU-011", "tourist", "L Tourist Extension")
    },
    {
      id: "cn-TOU-012",
      officialCode: "CN-TOU-012",
      name: "G Transit Visa 7 Days (Consular Entry Visa)",
      categoryCode: "tourist",
      fee: "USD 140",
      validity: "7 days",
      stay: "7 days",
      purpose: "Consular transit visa for travelers not eligible for visa-free transit exemptions.",
      eligibility: "Travelers transiting through China needing stamped transit visa.",
      record_type: "TRANSIT_VISA",
      docs: [
        "Valid passport & confirmed onward travel ticket",
        "Visa for third country destination",
        "Completed COVAS application form"
      ],
      ...getChinaMicroDetails("cn-TOU-012", "tourist", "G Transit Visa")
    },
    {
      id: "cn-SPE-003",
      officialCode: "CN-SPE-003",
      name: "C Crew Visa 90 Days (Airline / Maritime / Train Staff)",
      categoryCode: "tourist",
      fee: "USD 140",
      validity: "90 days multiple",
      stay: "Matches crew duty schedule",
      purpose: "International airline, shipping, train, and motor transport crew performing duties in China.",
      eligibility: "Active transport crew members holding official guarantee letter from transport company.",
      record_type: "CREW_VISA",
      docs: [
        "Official Guarantee / Dispatch Letter from international transport company ⭐",
        "Valid Seaman's Book / Crew Identity Certificate",
        "Valid passport & flight/vessel schedule in China"
      ],
      ...getChinaMicroDetails("cn-SPE-003", "tourist", "C Crew Visa")
    },
    {
      id: "cn-SPE-007",
      officialCode: "CN-SPE-007",
      name: "Hong Kong / Macao / Taiwan Compatriot Entry Permit (Mainland Travel Permit)",
      categoryCode: "tourist",
      fee: "USD 0 / Nominal processing",
      validity: "5 years / 10 years",
      stay: "Unrestricted travel in Mainland China",
      purpose: "Entry and travel permit for residents of HK, Macao, and Taiwan visiting Mainland China.",
      eligibility: "Chinese citizens residing in HK, Macao, or Taiwan holding permanent identity cards.",
      record_type: "SPECIAL_VISA",
      docs: [
        "HK / Macao / Taiwan Permanent Identity Card copy",
        "Home Return Permit / Compatriot Pass application form",
        "China Travel Service (CTS) processing receipt"
      ],
      ...getChinaMicroDetails("cn-SPE-007", "tourist", "Compatriot Entry Permit")
    },
    {
      id: "cn-SPE-008",
      officialCode: "CN-SPE-008",
      name: "Tibet Travel Permit (TTP - Tibet Autonomous Region Entry Clearance)",
      categoryCode: "tourist",
      fee: "USD 0 (Issued through authorized Tibet tour agency)",
      validity: "Matches travel itinerary",
      stay: "Duration of organized Tibet tour",
      purpose: "Mandatory secondary regional clearance for foreign passport holders traveling to Tibet Autonomous Region.",
      eligibility: "Foreign tourists holding valid Chinese visa booked on an organized tour with licensed Tibet travel agency.",
      record_type: "SPECIAL_VISA",
      docs: [
        "Valid Chinese Visa (L / M / Z / X) stamped in passport ⭐",
        "Confirmed Tibet Tour Itinerary & guide booking through licensed Tibet agency ⭐",
        "Tibet Tourism Bureau (TTB) Permit application Form"
      ],
      ...getChinaMicroDetails("cn-SPE-008", "tourist", "Tibet Travel Permit")
    },
    {
      id: "cn-SPE-010",
      officialCode: "CN-SPE-010",
      name: "144-Hour Transit Visa Free Extension Permit (PSB)",
      categoryCode: "tourist",
      fee: "CNY 160",
      validity: "Emergency extension",
      stay: "Duration of emergency",
      purpose: "Emergency extension of 144H transit stay due to flight cancellation or medical emergency.",
      eligibility: "Transit passengers stranded due to force majeure verified by PSB.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Airline flight delay/cancellation certificate or hospital proof",
        "Police station registration form (Juzhu Dengji)",
        "PSB Exit-Entry application"
      ],
      ...getChinaMicroDetails("cn-SPE-010", "tourist", "144H Transit Extension")
    },
    {
      id: "cn-SPE-011",
      officialCode: "CN-SPE-011",
      name: "L Group Tourist Visa Extension (PSB)",
      categoryCode: "tourist",
      fee: "CNY 160",
      validity: "30 days extension",
      stay: "30 days",
      purpose: "Group tour extension for tour group members.",
      eligibility: "Tourists on group visa requesting extension through Chinese tour agency.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Chinese travel agency extension guarantee letter",
        "Updated travel itinerary & hotel bookings",
        "PSB extension application"
      ],
      ...getChinaMicroDetails("cn-SPE-011", "tourist", "L Group Extension")
    },
    {
      id: "cn-SPE-012",
      officialCode: "CN-SPE-012",
      name: "Hainan Visa Free Extension Permit (Hainan PSB)",
      categoryCode: "tourist",
      fee: "CNY 160",
      validity: "30 days extension",
      stay: "30 days",
      purpose: "Extension of Hainan visa-free stay due to travel plans or illness.",
      eligibility: "Hainan visa-free visitors applying at Hainan PSB.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Statement of reason & updated hotel booking in Hainan",
        "Hainan police registration slip",
        "PSB extension application"
      ],
      ...getChinaMicroDetails("cn-SPE-012", "tourist", "Hainan Visa Free Extension")
    },
    {
      id: "cn-SPE-015",
      officialCode: "CN-SPE-015",
      name: "G Transit Visa Extension Permit (PSB)",
      categoryCode: "tourist",
      fee: "CNY 160",
      validity: "7 days extension",
      stay: "7 days",
      purpose: "Extension of G transit visa in China.",
      eligibility: "G visa holders experiencing transit flight disruptions.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Onward flight reschedule ticket",
        "Police registration form",
        "PSB extension application"
      ],
      ...getChinaMicroDetails("cn-SPE-015", "tourist", "G Transit Extension")
    }
  ],
  business: [
    {
      id: "cn-BIZ-001",
      officialCode: "CN-BIZ-001",
      name: "M Commercial Business Visa 30 Days Single Entry (COVAS / VFS)",
      categoryCode: "business",
      fee: "USD 140 + VFS service fee (USD 30)",
      validity: "30 days single entry (valid for 3 months)",
      stay: "Up to 30 days per entry",
      purpose: "Commercial trade, business meetings, factory inspections, and contract negotiations in China.",
      eligibility: "Business representatives invited by a registered Chinese commercial firm with valid Business License (Gongshang Zhizhao).",
      popular: true,
      highlight: true,
      record_type: "BUSINESS_VISA",
      docs: [
        "Valid original passport (min 6 months validity & 2 blank pages) ⭐",
        "Official Invitation Letter from sponsoring Chinese company (with official red corporate seal / Chop) ⭐",
        "Copy of Chinese host company Business License (Gongshang Zhizhao / SAMR Certificate) ⭐",
        "Foreign employer dispatch letter stating job title, salary, and purpose of business trip ⭐",
        "Foreign employer business registration copy & business card",
        "Personal or corporate bank statement for past 3 months (min USD 3,000 balance)",
        "Completed COVAS Visa Application Form V.2013"
      ],
      ...getChinaMicroDetails("cn-BIZ-001", "business", "M Commercial Business 30D")
    },
    {
      id: "cn-BIZ-002",
      officialCode: "CN-BIZ-002",
      name: "M Commercial Business Visa 60 Days Double Entry",
      categoryCode: "business",
      fee: "USD 140",
      validity: "6 months double entry",
      stay: "Up to 60 days per entry",
      purpose: "Double entry commercial activities and trade negotiations.",
      eligibility: "Business delegates with recurring trade visits within 6 months.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Chinese host company invitation letter specifying double entry dates",
        "Chinese host company Business License copy",
        "Foreign employer dispatch letter",
        "Valid passport & COVAS application form"
      ],
      ...getChinaMicroDetails("cn-BIZ-002", "business", "M Business 60D Double")
    },
    {
      id: "cn-BIZ-003",
      officialCode: "CN-BIZ-003",
      name: "M Commercial Business Visa 90 Days Multiple Entry 1 Year",
      categoryCode: "business",
      fee: "USD 140",
      validity: "1 year multiple entry",
      stay: "Up to 90 days per entry",
      purpose: "Frequent commercial trade, procurement, and management visits.",
      eligibility: "Corporate executives with previous M business visas.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Valid passport showing previous China business visas",
        "Official Chinese company invitation letter for 1Y multiple entry",
        "Chinese company Business License copy",
        "Foreign employer corporate dispatch letter"
      ],
      ...getChinaMicroDetails("cn-BIZ-003", "business", "M Business 1Y Multiple")
    },
    {
      id: "cn-BIZ-004",
      officialCode: "CN-BIZ-004",
      name: "M Commercial Business Visa 10 Years Multiple Entry (US Citizens - 60 Days Per Entry)",
      categoryCode: "business",
      fee: "USD 140",
      validity: "10 years multiple entry",
      stay: "Up to 60 days per entry",
      purpose: "Long term multiple entry business travel for US passport holders under bilateral agreement.",
      eligibility: "US citizens with valid passport and corporate invitation from China.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Valid US Passport (min 12 months validity remaining) ⭐",
        "Official Chinese company invitation letter with corporate chop",
        "Chinese host company Business License copy",
        "US employer dispatch letter & COVAS form"
      ],
      ...getChinaMicroDetails("cn-BIZ-004", "business", "M Business 10Y Multiple US")
    },
    {
      id: "cn-BIZ-005",
      officialCode: "CN-BIZ-005",
      name: "M Business Conference & Exhibition Visa 90 Days",
      categoryCode: "business",
      fee: "USD 140",
      validity: "90 days",
      stay: "90 days",
      purpose: "Attending international trade summits, exhibitions, or corporate conferences in China.",
      eligibility: "Registered trade show exhibitors or conference delegates.",
      record_type: "CONFERENCE_VISA",
      docs: [
        "Official Conference / Exhibition Invitation Letter from Chinese organizer",
        "Exhibition booth registration / Conference pass receipt",
        "Foreign employer dispatch letter & business card",
        "Valid passport & bank statement"
      ],
      ...getChinaMicroDetails("cn-BIZ-005", "business", "M Conference Visa")
    },
    {
      id: "cn-BIZ-006",
      officialCode: "CN-BIZ-006",
      name: "M Business Visa Extension 30 Days (PSB Exit-Entry Administration)",
      categoryCode: "business",
      fee: "CNY 160",
      validity: "30 days extension",
      stay: "30 days extension",
      purpose: "Extension of M business stay for ongoing trade negotiations or project completion.",
      eligibility: "M visa holders applying at local PSB with host company written request.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Sponsoring Chinese company written extension request letter (with corporate chop) ⭐",
        "Chinese company Business License copy",
        "Police Registration Form (Juzhu Dengji Biao)",
        "Valid passport & PSB extension application"
      ],
      ...getChinaMicroDetails("cn-BIZ-006", "business", "M Business Extension")
    },
    {
      id: "cn-BIZ-007",
      officialCode: "CN-BIZ-007",
      name: "APEC Business Travel Card (ABTC - Mainland China Clearance) 5 Years",
      categoryCode: "business",
      fee: "USD 0",
      validity: "5 years",
      stay: "Up to 60 days per entry",
      purpose: "Fast-track business travel and entry clearance for APEC economy executives entering China.",
      eligibility: "Holders of valid APEC card with CHN pre-clearance printed on back.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Valid APEC Business Travel Card with CHN listed on reverse side",
        "Valid passport matching ABTC details",
        "Corporate dispatch proof"
      ],
      ...getChinaMicroDetails("cn-BIZ-007", "business", "APEC Business Travel Card")
    },
    {
      id: "cn-BIZ-008",
      officialCode: "CN-BIZ-008",
      name: "M Canton Fair Trade Show Visa 90 Days (Guangzhou Import & Export Fair)",
      categoryCode: "business",
      fee: "USD 140",
      validity: "90 days",
      stay: "90 days",
      purpose: "Attending China Import and Export Fair (Canton Fair) in Guangzhou.",
      eligibility: "Buyers and exhibitors holding official Canton Fair E-Invitation Letter.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Official Canton Fair E-Invitation Letter (issued by China Foreign Trade Centre) ⭐",
        "Buyer Badge Registration Confirmation / Canton Fair Pass",
        "Foreign employer dispatch letter",
        "Valid passport & travel itinerary"
      ],
      ...getChinaMicroDetails("cn-BIZ-008", "business", "Canton Fair M Visa")
    },
    {
      id: "cn-BIZ-009",
      officialCode: "CN-BIZ-009",
      name: "M Commercial Business Multiple Entry 6 Months",
      categoryCode: "business",
      fee: "USD 140",
      validity: "6 months multiple entry",
      stay: "Up to 60 days per entry",
      purpose: "Recurring business visits over a 6-month commercial contract period.",
      eligibility: "Business representatives with ongoing commercial contracts in China.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Chinese company invitation letter specifying 6-month contract",
        "Business License copy of Chinese host",
        "Foreign employer dispatch letter",
        "Valid passport & COVAS form"
      ],
      ...getChinaMicroDetails("cn-BIZ-009", "business", "M Business 6M Multiple")
    },
    {
      id: "cn-WRK-015",
      officialCode: "CN-WRK-015",
      name: "Z Work Entrepreneur & Startup Visa 1 Year (Tech Incubator / Free Trade Zone)",
      categoryCode: "business",
      fee: "USD 140",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Foreign entrepreneurs establishing tech startups or business ventures in Chinese FTZs / incubators.",
      eligibility: "Foreign founders accepted by recognized Chinese business incubators or Free Trade Zone parks.",
      record_type: "ENTREPRENEUR_VISA",
      docs: [
        "Chinese Business Incubator / FTZ Park Acceptance Certificate ⭐",
        "Comprehensive Business Plan & Foreign Investment Registration",
        "Foreigner Work Permit Notification (Category A / B Talent)",
        "Valid passport & background check"
      ],
      ...getChinaMicroDetails("cn-WRK-015", "business", "Z Work Entrepreneur Startup")
    },
    {
      id: "cn-SPE-001",
      officialCode: "CN-SPE-001",
      name: "J1 Resident Foreign Journalist Visa 180 Days+ (Foreign Affairs Office Approved)",
      categoryCode: "business",
      fee: "USD 140",
      validity: "180 days+ (Residence Permit issued after entry)",
      stay: "Long-term resident posting",
      purpose: "Resident foreign news correspondents, bureau chiefs, and photojournalists posted in China.",
      eligibility: "Foreign media journalists authorized by Ministry of Foreign Affairs (MFA) Information Department.",
      record_type: "JOURNALIST_VISA",
      docs: [
        "Approval Letter issued by MFA Information Department / Foreign Affairs Office ⭐",
        "Official Dispatch Letter from foreign news agency headquarter",
        "International Press Card / Journalist Credentials",
        "Valid passport & COVAS form"
      ],
      ...getChinaMicroDetails("cn-SPE-001", "business", "J1 Resident Journalist")
    },
    {
      id: "cn-SPE-002",
      officialCode: "CN-SPE-002",
      name: "J2 Temporary Foreign Journalist Visa 180 Days-",
      categoryCode: "business",
      fee: "USD 140",
      validity: "Up to 180 days",
      stay: "Matches reporting assignment",
      purpose: "Short-term news reporting, documentary filming, or covering state visits in China.",
      eligibility: "Visiting journalists approved by MFA Information Department / Chinese Embassy.",
      record_type: "JOURNALIST_VISA",
      docs: [
        "MFA Information Department Temporary Press Reporting Approval Letter ⭐",
        "Foreign media assignment letter & press credentials",
        "Equipment list & filming itinerary in China",
        "Valid passport & COVAS form"
      ],
      ...getChinaMicroDetails("cn-SPE-002", "business", "J2 Temporary Journalist")
    },
    {
      id: "cn-SPE-004",
      officialCode: "CN-SPE-004",
      name: "Diplomat Visa (Embassy / Consular Mission Postings)",
      categoryCode: "business",
      fee: "USD 0",
      validity: "Duration of diplomatic posting",
      stay: "Official posting duration",
      purpose: "Diplomatic missions, embassy postings, and official bilateral state visits.",
      eligibility: "Accredited foreign diplomats and embassy staff.",
      record_type: "DIPLOMAT_VISA",
      docs: [
        "Diplomatic Note Verbale from foreign Ministry of Foreign Affairs",
        "Diplomatic Passport copy",
        "Official posting assignment letter"
      ],
      ...getChinaMicroDetails("cn-SPE-004", "business", "Diplomat Visa")
    },
    {
      id: "cn-SPE-005",
      officialCode: "CN-SPE-005",
      name: "Official Service Visa (Government / State Business)",
      categoryCode: "business",
      fee: "USD 0",
      validity: "Duration of official assignment",
      stay: "Official assignment duration",
      purpose: "Official state business, consular staff duties, and international government delegations.",
      eligibility: "Foreign government officials traveling on official service passports.",
      record_type: "OFFICIAL_VISA",
      docs: [
        "Official Note Verbale from foreign government ministry",
        "Official / Service Passport",
        "Official invitation from Chinese ministry"
      ],
      ...getChinaMicroDetails("cn-SPE-005", "business", "Official Service Visa")
    },
    {
      id: "cn-SPE-006",
      officialCode: "CN-SPE-006",
      name: "Courtesy Visa (Dignitaries & VIP State Guests)",
      categoryCode: "business",
      fee: "USD 0",
      validity: "Duration of visit",
      stay: "Matches VIP schedule",
      purpose: "Courtesy entry for foreign dignitaries, former heads of state, and VIP guests.",
      eligibility: "Approved foreign dignitaries granted courtesy protocol by MFA.",
      record_type: "COURTESY_VISA",
      docs: [
        "Courtesy request letter from foreign government / embassy",
        "Valid passport & itinerary",
        "MFA courtesy clearance"
      ],
      ...getChinaMicroDetails("cn-SPE-006", "business", "Courtesy Visa")
    },
    {
      id: "cn-SPE-009",
      officialCode: "CN-SPE-009",
      name: "APEC Business Travel Card (Mainland China Entry Pre-Clearance) 5 Years",
      categoryCode: "business",
      fee: "USD 0",
      validity: "5 years",
      stay: "Up to 60 days per entry",
      purpose: "Multiple entry trade and investment visits under APEC arrangement.",
      eligibility: "ABTC cardholders with China pre-clearance.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Valid APEC Card with CHN clearance",
        "Valid passport matching ABTC details",
        "Dispatch letter from business firm"
      ],
      ...getChinaMicroDetails("cn-SPE-009", "business", "APEC China Pre-Clearance")
    },
    {
      id: "cn-SPE-013",
      officialCode: "CN-SPE-013",
      name: "J1 Journalist Residence Permit Extension (PSB)",
      categoryCode: "business",
      fee: "CNY 400",
      validity: "1 year extension",
      stay: "1 year",
      purpose: "Extension of resident journalist status in China.",
      eligibility: "J1 journalists with active MFA accreditation.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "MFA Press Accreditation Card renewal",
        "Foreign news agency dispatch letter",
        "PSB extension application"
      ],
      ...getChinaMicroDetails("cn-SPE-013", "business", "J1 Journalist Extension")
    }
  ],
  work: [
    {
      id: "cn-WRK-001",
      officialCode: "CN-WRK-001",
      name: "Z Skilled Work Visa 90 Days Single Entry (Work Permit Notification + PU Letter)",
      categoryCode: "work",
      fee: "USD 140 + SAFEA Work Permit Notification + VFS 30",
      validity: "90 days single entry (Work Residence Permit issued within 30 days of entry)",
      stay: "1 year renewable (Work Residence Permit)",
      purpose: "Skilled employment in China across corporate, technical, educational, and industrial sectors.",
      eligibility: "Foreign workers holding an official Notification Letter for Foreigner's Work Permit issued by SAFEA (State Administration of Foreign Experts Affairs) + employer registered with Business License.",
      popular: true,
      highlight: true,
      record_type: "WORK_VISA",
      docs: [
        "Notification Letter for Foreigner's Work Permit (WaiGuoRen LaiHua GongZuo XuKeTongZhiShu) issued by SAFEA ⭐",
        "PU Invitation Letter issued by Foreign Affairs Office (FAO) (if required by consulate) ⭐",
        "Apostilled / Legalized University Degree Certificate & Transcripts ⭐",
        "Apostilled / Legalized Home Country Criminal Record Check (Police Certificate under 6 months) ⭐",
        "Official Chinese Employment Contract signed with Sponsoring Employer",
        "Sponsoring Employer Business License (Gongshang Zhizhao) copy",
        "Foreigner Physical Examination Medical Certificate (stamped by hospital)",
        "Valid passport, COVAS form, and passport photos"
      ],
      ...getChinaMicroDetails("cn-WRK-001", "work", "Z Skilled Work Visa")
    },
    {
      id: "cn-WRK-002",
      officialCode: "CN-WRK-002",
      name: "R High-Level Talent Visa 5 to 10 Years Multiple Entry (Top Scientists & Innovators)",
      categoryCode: "work",
      fee: "USD 140 (Fee waived under talent programs)",
      validity: "5 to 10 years multiple entry",
      stay: "Up to 180 days per entry",
      purpose: "Fast-track entry for top-tier global scientists, tech pioneers, academics, and high-level executives (Category A Talent).",
      eligibility: "Category A High-Level Foreign Talent holding Confirmation Letter for High-Level Foreign Talent issued by SAFEA.",
      record_type: "TALENT_VISA",
      docs: [
        "Confirmation Letter for High-Level Foreign Talent (GaoCengCi RenCai RenDingShu) issued by SAFEA ⭐",
        "Sponsoring Chinese research institute / university / tech firm invitation",
        "Academic credentials, patents, or international award certificates",
        "Valid passport & fast-track visa application form"
      ],
      ...getChinaMicroDetails("cn-WRK-002", "work", "R High Level Talent Visa")
    },
    {
      id: "cn-WRK-003",
      officialCode: "CN-WRK-003",
      name: "Z Work Foreign Expert Visa 1 Year",
      categoryCode: "work",
      fee: "USD 140",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Employment for technical foreign experts, engineers, and corporate consultants.",
      eligibility: "Foreign Experts holding Category B / A Work Permit Notification.",
      record_type: "WORK_VISA",
      docs: [
        "Foreign Expert Work Permit Notification Letter",
        "Foreign Expert Certificate / Technical License",
        "Apostilled degree & criminal record check",
        "Employer business license & Z visa application"
      ],
      ...getChinaMicroDetails("cn-WRK-003", "work", "Z Foreign Expert Visa")
    },
    {
      id: "cn-WRK-004",
      officialCode: "CN-WRK-004",
      name: "Z Work Foreign Language Teacher Visa 1 Year (School / University)",
      categoryCode: "work",
      fee: "USD 140",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Teaching native foreign languages at accredited Chinese schools, universities, or training centers.",
      eligibility: "Native speaker passport + Bachelor's degree + TEFL/TESOL (120+ hours) OR 2+ years teaching experience + Apostilled criminal record.",
      record_type: "WORK_VISA",
      docs: [
        "SAFEA Work Permit Notification for Language Teacher ⭐",
        "Apostilled Bachelor Degree Certificate ⭐",
        "Apostilled TEFL / TESOL Certificate (120+ hours) or teaching experience letter ⭐",
        "Apostilled Police Clearance Certificate",
        "School Education Registration License & Employment Contract",
        "Valid passport & COVAS form"
      ],
      ...getChinaMicroDetails("cn-WRK-004", "work", "Z Language Teacher Visa")
    },
    {
      id: "cn-WRK-005",
      officialCode: "CN-WRK-005",
      name: "Z Work Internship Visa 6 Months (Commercial Internship)",
      categoryCode: "work",
      fee: "USD 140",
      validity: "6 months",
      stay: "6 months",
      purpose: "Commercial work internship at a registered Chinese firm.",
      eligibility: "Enrolled university students or recent graduates with SAFEA Work Permit Notification (Internship).",
      record_type: "INTERN_VISA",
      docs: [
        "SAFEA Work Permit Notification (Internship Category)",
        "Chinese Host Company Internship Contract",
        "University Enrollment Certificate / Graduation proof",
        "Valid passport & medical exam"
      ],
      ...getChinaMicroDetails("cn-WRK-005", "work", "Z Work Internship Visa")
    },
    {
      id: "cn-WRK-006",
      officialCode: "CN-WRK-006",
      name: "Z Work Residence Permit Extension 1 Year (PSB Exit-Entry Administration)",
      categoryCode: "work",
      fee: "CNY 400",
      validity: "1 year extension",
      stay: "1 year",
      purpose: "Renewal of Work-Type Residence Permit (GongZuo JuZhuXuKe) based on renewed employment contract.",
      eligibility: "Current Work Residence Permit holders with active SAFEA Work Permit Card renewal.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Renewed Foreigner's Work Permit Card (Foreigner Work Permit Card renewal receipt) ⭐",
        "Renewed Employment Contract signed by CEO",
        "Employer Business License copy & NTS Tax Payment Receipts",
        "PSB Work Residence Permit Extension Application"
      ],
      ...getChinaMicroDetails("cn-WRK-006", "work", "Z Work Extension PSB")
    },
    {
      id: "cn-WRK-007",
      officialCode: "CN-WRK-007",
      name: "Notification Letter for Foreigner's Work Permit (SAFEA Authorization)",
      categoryCode: "work",
      fee: "CNY 0",
      validity: "Valid for 3 months for Z visa application",
      stay: "Prerequisite document",
      purpose: "Official government work permit authorization issued online by SAFEA before applying for Z visa.",
      eligibility: "Foreign workers whose qualifications have been verified on SAFEA online system by sponsoring employer.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "SAFEA Online System Approval Certificate",
        "Employer Business License & tax filing proof",
        "Applicant degree, experience, and police clearance verification"
      ],
      ...getChinaMicroDetails("cn-WRK-007", "work", "SAFEA Work Permit Notification")
    },
    {
      id: "cn-WRK-008",
      officialCode: "CN-WRK-008",
      name: "Work-Type Foreigner Residence Permit 1 Year (PSB Exit-Entry Permit)",
      categoryCode: "work",
      fee: "CNY 400 - CNY 800",
      validity: "1 year renewable (Multiple Entry)",
      stay: "1 year",
      purpose: "Mandatory residence sticker stamped in passport by PSB within 30 days of entering China on Z visa.",
      eligibility: "Z visa holders who have entered China and obtained Foreigner Work Permit Card.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "Z Visa entry stamp in passport ⭐",
        "Foreigner's Work Permit Card (issued in China) ⭐",
        "Temporary Accommodation Registration Form (Police Station) ⭐",
        "Physical Examination Verification Certificate (Health Quarantine Bureau China)",
        "PSB Residence Permit Application"
      ],
      ...getChinaMicroDetails("cn-WRK-008", "work", "Work Residence Permit PSB")
    },
    {
      id: "cn-WRK-009",
      officialCode: "CN-WRK-009",
      name: "PU Invitation Letter Clearance (Foreign Affairs Office Clearance)",
      categoryCode: "work",
      fee: "CNY 0",
      validity: "Valid for Z/M visa submission",
      stay: "Prerequisite document",
      purpose: "Official government invitation clearance issued by provincial Foreign Affairs Office (FAO).",
      eligibility: "Companies applying for foreign worker dispatch clearance.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Provincial FAO PU Letter Approval Certificate",
        "Employer corporate tax filings & justification statement"
      ],
      ...getChinaMicroDetails("cn-WRK-009", "work", "PU Invitation Letter FAO")
    },
    {
      id: "cn-WRK-010",
      officialCode: "CN-WRK-010",
      name: "Z Work Representative Office Chief Representative Visa 1 Year",
      categoryCode: "work",
      fee: "USD 140",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Chief Representative or Representative posted at a foreign enterprise Representative Office in China.",
      eligibility: "Appointed Representatives holding Representative Work Card issued by Market Regulation Bureau.",
      record_type: "WORK_VISA",
      docs: [
        "Representative Office Registration Certificate in China ⭐",
        "Representative Work Permit Card / Appointment Certificate",
        "Parent Foreign Company Registration & Dispatch Order",
        "Valid passport & COVAS form"
      ],
      ...getChinaMicroDetails("cn-WRK-010", "work", "Z Chief Representative")
    },
    {
      id: "cn-WRK-011",
      officialCode: "CN-WRK-011",
      name: "Z Work Offshore Petroleum Operations Visa 1 Year",
      categoryCode: "work",
      fee: "USD 140",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Offshore oil and gas exploration, drilling, and maritime engineering staff in Chinese waters.",
      eligibility: "Engineers and crew contracted by CNOOC / registered offshore petroleum firms.",
      record_type: "WORK_VISA",
      docs: [
        "CNOOC / Ministry of Energy Offshore Petroleum Work Approval",
        "Offshore Safety & Medical Fitness Certificates",
        "Employment contract & company registration",
        "Valid passport & application form"
      ],
      ...getChinaMicroDetails("cn-WRK-011", "work", "Z Offshore Petroleum")
    },
    {
      id: "cn-WRK-012",
      officialCode: "CN-WRK-012",
      name: "Z Work Commercial Performing Arts Visa 90 Days",
      categoryCode: "work",
      fee: "USD 140",
      validity: "90 days",
      stay: "90 days",
      purpose: "Commercial musical performances, concerts, theatrical tours, or athletic events in China.",
      eligibility: "Performers with Ministry of Culture Performance Approval.",
      record_type: "WORK_VISA",
      docs: [
        "Ministry of Culture & Tourism Commercial Performance Approval Letter ⭐",
        "Performance Agency Contract & Tour Itinerary",
        "Performance Venue License copy",
        "Valid passport & artist profile"
      ],
      ...getChinaMicroDetails("cn-WRK-012", "work", "Z Commercial Performance")
    },
    {
      id: "cn-WRK-013",
      officialCode: "CN-WRK-013",
      name: "Z Work Cultural Exchange Specialist Visa 1 Year",
      categoryCode: "work",
      fee: "USD 140",
      validity: "1 year",
      stay: "1 year",
      purpose: "Specialists dispatched under bilateral cultural exchange agreements.",
      eligibility: "Cultural specialists invited by government-backed cultural organizations.",
      record_type: "WORK_VISA",
      docs: [
        "Bilateral Cultural Agreement Dispatch Approval",
        "SAFEA Work Permit Notification",
        "Valid passport & COVAS form"
      ],
      ...getChinaMicroDetails("cn-WRK-013", "work", "Z Cultural Specialist")
    },
    {
      id: "cn-WRK-014",
      officialCode: "CN-WRK-014",
      name: "Z Work Volunteer Specialist Visa 1 Year",
      categoryCode: "work",
      fee: "USD 140",
      validity: "1 year",
      stay: "1 year",
      purpose: "Long term foreign volunteers dispatched to registered Chinese non-profit NGOs / aid programs.",
      eligibility: "Volunteers invited by civil affairs approved organizations.",
      record_type: "VOLUNTEER_VISA",
      docs: [
        "Ministry of Civil Affairs Volunteer Dispatch Clearance",
        "NGO Registration Certificate & Volunteer Contract",
        "Valid passport & medical test"
      ],
      ...getChinaMicroDetails("cn-WRK-014", "work", "Z Volunteer Specialist")
    },
    {
      id: "cn-SPE-014",
      officialCode: "CN-SPE-014",
      name: "R High-Level Talent Residence Permit Extension (PSB)",
      categoryCode: "work",
      fee: "CNY 400",
      validity: "5 years extension",
      stay: "5 years",
      purpose: "Renewal of Talent-Type Residence Permit for R visa holders.",
      eligibility: "R talent holders with active SAFEA Confirmation Letter.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "SAFEA Foreign High-Level Talent Confirmation renewal",
        "Employer endorsement letter",
        "PSB extension application"
      ],
      ...getChinaMicroDetails("cn-SPE-014", "work", "R Talent Residence Extension")
    }
  ],
  student: [
    {
      id: "cn-STU-001",
      officialCode: "CN-STU-001",
      name: "X1 Long Term Student Visa 180 Days+ (Degree Studies - JW201 / JW202 + Admission Notice)",
      categoryCode: "student",
      fee: "USD 140 + VFS service fee (USD 30)",
      validity: "180 days+ (Student Residence Permit issued within 30 days of entry)",
      stay: "Matches course duration (1 to 4 years)",
      purpose: "Long-term higher education, Bachelor's, Master's, PhD, or language study exceeding 180 days.",
      eligibility: "Accepted students holding official University Admission Notice + Foreign Student Visa Application Form JW201 (Government Scholarship) OR JW202 (Self-funded).",
      popular: true,
      highlight: true,
      record_type: "STUDENT_VISA",
      docs: [
        "Official Foreign Student Visa Application Form (JW201 OR JW202 Form) issued by Ministry of Education ⭐",
        "Official University Admission Notice (LuQuTongZhiShu) from Chinese university ⭐",
        "Highest Academic Degree Certificate & Transcripts (Apostilled or Consular Authenticated) ⭐",
        "Tuition Fee Payment Receipt / Scholarship Award Letter",
        "Personal or Parent Bank Account Statement for past 6 months (min USD 10,000 balance)",
        "Parental Affidavit of Support & Birth Certificate (if sponsored by parent)",
        "Foreigner Physical Examination Record (Medical Exam for 180+ days study)",
        "Valid passport, COVAS form, and passport photos"
      ],
      ...getChinaMicroDetails("cn-STU-001", "student", "X1 Long Term Student 180D+")
    },
    {
      id: "cn-STU-002",
      officialCode: "CN-STU-002",
      name: "X2 Short Term Student Visa 180 Days- (Short Course / Exchange)",
      categoryCode: "student",
      fee: "USD 140",
      validity: "Up to 180 days single / double entry",
      stay: "Up to 180 days",
      purpose: "Short-term study programs, summer courses, or exchange programs under 180 days.",
      eligibility: "Students admitted for short courses holding University Admission Notice.",
      record_type: "STUDENT_VISA",
      docs: [
        "Official Admission Notice (LuQuTongZhiShu) from Chinese education provider ⭐",
        "Home University Enrollment / Dispatch Letter",
        "Bank statement showing min USD 5,000 liquid balance",
        "Valid passport & COVAS application form"
      ],
      ...getChinaMicroDetails("cn-STU-002", "student", "X2 Short Term Student 180D-")
    },
    {
      id: "cn-STU-003",
      officialCode: "CN-STU-003",
      name: "X1 Student Residence Permit Extension 1 Year (PSB Exit-Entry Administration)",
      categoryCode: "student",
      fee: "CNY 400",
      validity: "1 year extension",
      stay: "1 year",
      purpose: "Annual extension of Study Residence Permit for ongoing degree enrollment.",
      eligibility: "Current X1 Student Residence Permit holders maintaining academic progress.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "University Enrollment Certificate (ZaiXueZhengMing) & JW202 renewal copy ⭐",
        "Official Academic Transcript & Attendance Record",
        "Police Registration Form (Juzhu Dengji Biao)",
        "PSB Student Residence Permit Extension Application"
      ],
      ...getChinaMicroDetails("cn-STU-003", "student", "X1 Student Extension PSB")
    },
    {
      id: "cn-STU-004",
      officialCode: "CN-STU-004",
      name: "X2 Student Visa Extension 180 Days (PSB)",
      categoryCode: "student",
      fee: "CNY 160",
      validity: "Up to 180 days extension",
      stay: "Up to 180 days",
      purpose: "Extension of short-term X2 study visa for additional short course term.",
      eligibility: "X2 holders with university extension letter.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "University Short Course Extension Letter",
        "Police registration form slip",
        "Bank statement showing living funds",
        "PSB extension application"
      ],
      ...getChinaMicroDetails("cn-STU-004", "student", "X2 Student Extension")
    },
    {
      id: "cn-STU-005",
      officialCode: "CN-STU-005",
      name: "Study-Type Foreigner Residence Permit 1 Year (PSB Exit-Entry Permit)",
      categoryCode: "student",
      fee: "CNY 400 - CNY 800",
      validity: "1 year renewable (Multiple Entry)",
      stay: "1 year",
      purpose: "Mandatory student residence permit stamped by PSB within 30 days of entry on X1 visa.",
      eligibility: "X1 student visa holders enrolled in long-term study programs.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "X1 Visa entry stamp in passport ⭐",
        "University Admission Notice & JW201 / JW202 Form ⭐",
        "Physical Examination Health Verification Certificate",
        "Police Station Registration Form (Juzhu Dengji)",
        "PSB Student Residence Permit Application"
      ],
      ...getChinaMicroDetails("cn-STU-005", "student", "Study Residence Permit PSB")
    },
    {
      id: "cn-STU-006",
      officialCode: "CN-STU-006",
      name: "JW202 Form / JW201 Form Clearance (Ministry of Education Visa Form)",
      categoryCode: "student",
      fee: "CNY 0",
      validity: "Prerequisite visa document",
      stay: "Prerequisite document",
      purpose: "Official government foreign student visa application form authorized by Ministry of Education.",
      eligibility: "Foreign students accepted by Ministry of Education accredited universities.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Official JW201 (CSC Scholarship) / JW202 (Self-funded) Form",
        "University admission verification stamp"
      ],
      ...getChinaMicroDetails("cn-STU-006", "student", "JW202 / JW201 Student Form")
    },
    {
      id: "cn-STU-007",
      officialCode: "CN-STU-007",
      name: "University Admission Notice Clearance (LuQuTongZhiShu)",
      categoryCode: "student",
      fee: "CNY 0",
      validity: "Prerequisite visa document",
      stay: "Prerequisite document",
      purpose: "Official university acceptance letter issued to admitted foreign students.",
      eligibility: "Admitted international students.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Official University Admission Notice with university chop",
        "Student registration ID"
      ],
      ...getChinaMicroDetails("cn-STU-007", "student", "Admission Notice Clearance")
    },
    {
      id: "cn-STU-008",
      officialCode: "CN-STU-008",
      name: "X1 Student Internship Permit 6 Months (Off-Campus Study Internship)",
      categoryCode: "student",
      fee: "USD 140",
      validity: "6 months",
      stay: "6 months",
      purpose: "Off-campus academic practical internship endorsement for enrolled foreign students.",
      eligibility: "Enrolled X1 university students with university endorsement and company internship agreement.",
      record_type: "INTERN_VISA",
      docs: [
        "University Endorsement Letter for Off-Campus Internship ⭐",
        "Chinese Host Firm Internship Agreement",
        "PSB Residence Permit Internship Notation Approval",
        "Valid passport & student ARC"
      ],
      ...getChinaMicroDetails("cn-STU-008", "student", "X1 Student Internship Permit")
    },
    {
      id: "cn-STU-009",
      officialCode: "CN-STU-009",
      name: "X1 Doctoral PhD Student Visa 4 Years",
      categoryCode: "student",
      fee: "USD 140 + Scholarship Certificate",
      validity: "4 years renewable",
      stay: "4 years",
      purpose: "Doctoral PhD research and degree studies at Chinese research universities.",
      eligibility: "Master's degree holders admitted to PhD program with university research funding.",
      record_type: "STUDENT_VISA",
      docs: [
        "JW201 / JW202 PhD Form & PhD Admission Notice",
        "Master's Degree Certificate (Apostilled)",
        "PhD Scholarship Award Letter / Lab Research Stipend",
        "Valid passport & health exam"
      ],
      ...getChinaMicroDetails("cn-STU-009", "student", "X1 Doctoral PhD Visa")
    },
    {
      id: "cn-STU-010",
      officialCode: "CN-STU-010",
      name: "X1 Chinese Government CSC Scholarship Student Visa",
      categoryCode: "student",
      fee: "USD 0 (Fee waived under CSC Scholarship)",
      validity: "Duration of scholarship (1 to 4 years)",
      stay: "Matches scholarship duration",
      purpose: "Full Chinese Government Scholarship (CSC) study at designated Chinese universities.",
      eligibility: "Approved CSC Scholarship recipients holding official JW201 Form.",
      record_type: "STUDENT_VISA",
      docs: [
        "Chinese Government Scholarship Award Certificate (CSC) ⭐",
        "JW201 Form issued by China Scholarship Council ⭐",
        "University Admission Notice",
        "Valid passport & medical examination form"
      ],
      ...getChinaMicroDetails("cn-STU-010", "student", "X1 CSC Scholarship Visa")
    }
  ],
  family: [
    {
      id: "cn-FAM-001",
      officialCode: "CN-FAM-001",
      name: "Q1 Family Reunion Long Term Visa 180 Days+ (Family of Chinese Citizens / PR Holders)",
      categoryCode: "family",
      fee: "USD 140 + VFS service fee (USD 30)",
      validity: "180 days+ (Family Residence Permit issued within 30 days of entry)",
      stay: "1 to 3 years renewable (Family Residence Permit)",
      purpose: "Long-term family reunion for spouse, parents, children, or in-laws of Chinese citizens or permanent residents.",
      eligibility: "Family members of Chinese citizens (holding Shenfenzheng) OR foreign permanent residence (D visa) holders residing in China.",
      popular: true,
      highlight: true,
      record_type: "FAMILY_VISA",
      docs: [
        "Inviting Chinese Relative National ID Card (Shenfenzheng) front/back copy OR Foreigner D PR Card ⭐",
        "Official Invitation Letter written by Chinese relative inviting applicant ⭐",
        "Apostilled / Consular Legalized Marriage Certificate (for spouse reunion) ⭐",
        "Apostilled / Consular Legalized Birth Certificate (for parent/child reunion) ⭐",
        "Inviting relative Hukou (Household Register) copy (for Chinese citizens)",
        "Housing lease contract / real estate deed in China",
        "Valid applicant passport, COVAS form, and passport photos"
      ],
      ...getChinaMicroDetails("cn-FAM-001", "family", "Q1 Family Reunion Long Term")
    },
    {
      id: "cn-FAM-002",
      officialCode: "CN-FAM-002",
      name: "Q2 Family Visit Short Term Visa 180 Days- (Short Family Visits)",
      categoryCode: "family",
      fee: "USD 140",
      validity: "Up to 180 days single / double / multiple",
      stay: "Up to 180 days per entry",
      purpose: "Short-term family visits to Chinese relatives or foreign permanent residents in China.",
      eligibility: "Relatives visiting Chinese citizens or permanent residents for short stay under 180 days.",
      record_type: "FAMILY_VISA",
      docs: [
        "Inviting Chinese relative ID card (Shenfenzheng) copy ⭐",
        "Official Invitation Letter signed by Chinese relative",
        "Proof of family relationship (Birth / Marriage certificate copy)",
        "Valid applicant passport & COVAS form"
      ],
      ...getChinaMicroDetails("cn-FAM-002", "family", "Q2 Family Visit Short Term")
    },
    {
      id: "cn-FAM-003",
      officialCode: "CN-FAM-003",
      name: "S1 Private Visit Long Term Visa 180 Days+ (Family of Foreign Work / Student Residents)",
      categoryCode: "family",
      fee: "USD 140",
      validity: "180 days+ (Private Residence Permit issued after entry)",
      stay: "Matches primary foreigner's Work / Study Residence Permit",
      purpose: "Long-term cohabitation for spouse, minor children, or parents of foreign work (Z) or study (X1) visa holders.",
      eligibility: "Dependents of foreign residents legally working or studying in China.",
      record_type: "FAMILY_VISA",
      docs: [
        "Primary Foreign Resident Passport & Work / Study Residence Permit copy ⭐",
        "Primary Foreign Resident Employment Contract / University Enrollment Certificate ⭐",
        "Apostilled / Consular Legalized Marriage / Birth Certificate ⭐",
        "Official Invitation Letter written by primary foreign resident",
        "Housing lease contract in China",
        "Valid applicant passport & COVAS form"
      ],
      ...getChinaMicroDetails("cn-FAM-003", "family", "S1 Private Visit Long Term")
    },
    {
      id: "cn-FAM-004",
      officialCode: "CN-FAM-004",
      name: "S2 Private Visit Short Term Visa 180 Days- (Short Private Visits)",
      categoryCode: "family",
      fee: "USD 140",
      validity: "Up to 180 days",
      stay: "Up to 180 days",
      purpose: "Short-term private visits or family matters visiting foreign work/study residents in China.",
      eligibility: "Relatives visiting foreign work or study residents for under 180 days.",
      record_type: "FAMILY_VISA",
      docs: [
        "Primary foreign resident passport & Residence Permit copy",
        "Invitation letter from foreign resident in China",
        "Proof of family relationship",
        "Valid passport & application form"
      ],
      ...getChinaMicroDetails("cn-FAM-004", "family", "S2 Private Visit Short Term")
    },
    {
      id: "cn-FAM-005",
      officialCode: "CN-FAM-005",
      name: "Q1 Family Residence Permit Extension 1 to 3 Years (PSB)",
      categoryCode: "family",
      fee: "CNY 400",
      validity: "1 to 3 years extension",
      stay: "1 to 3 years",
      purpose: "Renewal of Family Reunion Residence Permit for family members of Chinese citizens.",
      eligibility: "Q1 Residence Permit holders maintaining family cohabitation in China.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Chinese relative ID card & Hukou book copy",
        "Marriage / Birth relation proof",
        "Police station registration form (Juzhu Dengji)",
        "PSB extension application"
      ],
      ...getChinaMicroDetails("cn-FAM-005", "family", "Q1 Family Extension PSB")
    },
    {
      id: "cn-FAM-006",
      officialCode: "CN-FAM-006",
      name: "Q2 Family Visit Visa Extension 180 Days (PSB)",
      categoryCode: "family",
      fee: "CNY 160",
      validity: "Up to 180 days extension",
      stay: "Up to 180 days",
      purpose: "Extension of short-term Q2 family visit stay.",
      eligibility: "Q2 holders applying at local PSB.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Chinese relative written extension request statement",
        "Chinese relative ID card copy",
        "Police registration form",
        "PSB extension application"
      ],
      ...getChinaMicroDetails("cn-FAM-006", "family", "Q2 Family Extension")
    },
    {
      id: "cn-FAM-007",
      officialCode: "CN-FAM-007",
      name: "S1 Private Residence Permit Extension 1 Year (PSB)",
      categoryCode: "family",
      fee: "CNY 400",
      validity: "1 year extension",
      stay: "1 year",
      purpose: "Renewal of Private Visit Residence Permit for dependents of foreign workers.",
      eligibility: "S1 Residence Permit holders whose sponsor's work permit is extended.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Sponsor foreign resident's renewed Work Residence Permit ⭐",
        "Apostilled Marriage / Birth Certificate",
        "Police registration form",
        "PSB extension application"
      ],
      ...getChinaMicroDetails("cn-FAM-007", "family", "S1 Private Extension PSB")
    },
    {
      id: "cn-FAM-008",
      officialCode: "CN-FAM-008",
      name: "S2 Private Visit Extension 180 Days (PSB)",
      categoryCode: "family",
      fee: "CNY 160",
      validity: "180 days extension",
      stay: "180 days",
      purpose: "Extension of short-term S2 private visit visa.",
      eligibility: "S2 holders with host resident endorsement.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Primary foreign resident's extension request letter",
        "Primary foreign resident passport copy",
        "PSB extension application"
      ],
      ...getChinaMicroDetails("cn-FAM-008", "family", "S2 Private Extension")
    },
    {
      id: "cn-FAM-009",
      officialCode: "CN-FAM-009",
      name: "Family Reunion Foreigner Residence Permit 1 to 3 Years (Q1 PSB Permit)",
      categoryCode: "family",
      fee: "CNY 400 - CNY 800",
      validity: "1 to 3 years (Multiple Entry)",
      stay: "1 to 3 years",
      purpose: "Mandatory family residence permit stamped in passport by PSB within 30 days of entry on Q1 visa.",
      eligibility: "Q1 visa holders who entered China to join Chinese family.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "Q1 Visa entry stamp in passport ⭐",
        "Chinese relative ID card (Shenfenzheng) & Hukou copy ⭐",
        "Apostilled Marriage / Birth Certificate ⭐",
        "Police Station Registration Form (Juzhu Dengji)",
        "PSB Family Residence Permit Application"
      ],
      ...getChinaMicroDetails("cn-FAM-009", "family", "Family Residence Permit Q1")
    },
    {
      id: "cn-FAM-010",
      officialCode: "CN-FAM-010",
      name: "Private Visit Foreigner Residence Permit 1 Year (S1 PSB Permit)",
      categoryCode: "family",
      fee: "CNY 400 - CNY 800",
      validity: "1 year (Multiple Entry)",
      stay: "1 year",
      purpose: "Mandatory residence permit stamped by PSB for foreign dependents.",
      eligibility: "S1 visa holders arriving to join foreign work/study resident.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "S1 Visa entry stamp in passport ⭐",
        "Sponsor foreign resident's Work Residence Permit copy ⭐",
        "Apostilled Marriage / Birth Certificate",
        "PSB Residence Permit Application"
      ],
      ...getChinaMicroDetails("cn-FAM-010", "family", "Private Residence Permit S1")
    },
    {
      id: "cn-FAM-011",
      officialCode: "CN-FAM-011",
      name: "Q1 Family Reunion Spouse Visa 180 Days+ (Spouse of Chinese Citizen)",
      categoryCode: "family",
      fee: "USD 140",
      validity: "180 days+ (Residence Permit issued after entry)",
      stay: "1 to 3 years renewable",
      purpose: "Long-term residence for foreign spouse married to a Chinese citizen.",
      eligibility: "Foreign spouse holding legalized marriage certificate.",
      record_type: "FAMILY_VISA",
      docs: [
        "Apostilled / Legalized Marriage Certificate ⭐",
        "Chinese Spouse ID Card (Shenfenzheng) & Hukou copy ⭐",
        "Chinese spouse invitation letter & housing lease",
        "Valid passport & COVAS form"
      ],
      ...getChinaMicroDetails("cn-FAM-011", "family", "Q1 Spouse Reunion")
    },
    {
      id: "cn-FAM-012",
      officialCode: "CN-FAM-012",
      name: "Q1 Family Reunion Child Visa 180 Days+ (Child of Chinese Citizen)",
      categoryCode: "family",
      fee: "USD 140",
      validity: "180 days+",
      stay: "1 to 3 years",
      purpose: "Long-term residence for foreign child of a Chinese parent or foster care in China.",
      eligibility: "Minor foreign child or foster child of Chinese parent.",
      record_type: "FAMILY_VISA",
      docs: [
        "Apostilled Birth Certificate / Foster Care Entrustment Power of Attorney",
        "Chinese parent ID card & Hukou copy",
        "Valid child passport & application form"
      ],
      ...getChinaMicroDetails("cn-FAM-012", "family", "Q1 Child Reunion")
    },
    {
      id: "cn-FAM-013",
      officialCode: "CN-FAM-013",
      name: "Q1 Family Reunion Dependent Parent Visa 180 Days+ (Parent of Chinese Citizen)",
      categoryCode: "family",
      fee: "USD 140",
      validity: "180 days+",
      stay: "1 to 3 years",
      purpose: "Long-term residence for foreign parents over 60 coming to live with adult Chinese children in China.",
      eligibility: "Foreign elderly parents (60+) with adult Chinese children residing in China.",
      record_type: "FAMILY_VISA",
      docs: [
        "Apostilled Parent-Child Kinship / Birth Certificate",
        "Adult Chinese child ID card & income proof in China",
        "Valid parent passport & health exam"
      ],
      ...getChinaMicroDetails("cn-FAM-013", "family", "Q1 Elderly Parent Reunion")
    },
    {
      id: "cn-FAM-014",
      officialCode: "CN-FAM-014",
      name: "S1 Private Visit Dependent Spouse Visa 180 Days+ (Spouse of Foreign Worker)",
      categoryCode: "family",
      fee: "USD 140",
      validity: "180 days+",
      stay: "Matches foreign worker ARC",
      purpose: "Long-term residence for foreign spouse of Z work permit holder.",
      eligibility: "Legally married spouse of foreign Z work visa holder.",
      record_type: "FAMILY_VISA",
      docs: [
        "Apostilled Marriage Certificate ⭐",
        "Sponsor foreign worker's Z Work Permit Notification / Residence Permit ⭐",
        "Sponsor employment letter & housing lease",
        "Valid passport & application form"
      ],
      ...getChinaMicroDetails("cn-FAM-014", "family", "S1 Foreign Worker Spouse")
    },
    {
      id: "cn-FAM-015",
      officialCode: "CN-FAM-015",
      name: "S1 Private Visit Dependent Child Visa 180 Days+ (Child of Foreign Worker)",
      categoryCode: "family",
      fee: "USD 140",
      validity: "180 days+",
      stay: "Matches foreign worker ARC",
      purpose: "Long-term residence for minor child of foreign worker in China.",
      eligibility: "Minor child of Z work permit holder.",
      record_type: "FAMILY_VISA",
      docs: [
        "Apostilled Birth Certificate ⭐",
        "Sponsor foreign worker passport & Residence Permit",
        "School enrollment in China (if applicable)",
        "Valid child passport & application form"
      ],
      ...getChinaMicroDetails("cn-FAM-015", "family", "S1 Foreign Worker Child")
    }
  ],
  pr: [
    {
      id: "cn-PR-001",
      officialCode: "CN-PR-001",
      name: "D Permanent Residence Visa (China Green Card - Indefinite PR)",
      categoryCode: "pr",
      fee: "CNY 1,500 + PSB Application Fee",
      validity: "Permanent Residence (ID Card renewed every 10 years)",
      stay: "Indefinite Permanent Residence",
      purpose: "Unrestricted permanent residence and work rights in Mainland China (China Foreigner Permanent Resident ID Card).",
      eligibility: "Senior management employment (4+ years stay & top tax compliance) OR Direct Foreign Investment (USD 500,000+) OR 5 years marriage to Chinese citizen with 9 months/year residence in China OR High Talent contribution.",
      popular: true,
      highlight: true,
      record_type: "PR_VISA",
      docs: [
        "Official Confirmation Certificate for Foreigner Permanent Residence (D Visa Confirmation) ⭐",
        "4 Years Senior Position Employment Verification & Foreigner Work Permit Card (Category A) ⭐",
        "4 Years Individual Income Tax Payment Certificates issued by State Taxation Administration China ⭐",
        "Apostilled Home Country Criminal Background Check (Police Certificate) ⭐",
        "Physical Examination Verification Certificate (Quarantine Bureau China)",
        "Proof of real estate title or registered housing lease in China",
        "Valid passport & PSB D Visa Application Form"
      ],
      ...getChinaMicroDetails("cn-PR-001", "pr", "D Permanent Residence Green Card")
    },
    {
      id: "cn-PR-002",
      officialCode: "CN-PR-002",
      name: "D Permanent Residence - Senior Employment Stream (4 Years Senior Work + Tax)",
      categoryCode: "pr",
      fee: "CNY 1,500",
      validity: "Permanent Residence",
      stay: "Indefinite",
      purpose: "Permanent residence for high-earning foreign executives and senior researchers after 4 years employment.",
      eligibility: "4 consecutive years senior executive employment in China + annual tax payment meeting threshold.",
      record_type: "PR_VISA",
      docs: [
        "4 Years Employment Contract in Senior Executive / Professor Role ⭐",
        "4 Years State Taxation Administration Income Tax Payment Certificates ⭐",
        "Employer Corporate Business License & Key Industry Certification",
        "Apostilled Criminal Record Check & PSB PR Form"
      ],
      ...getChinaMicroDetails("cn-PR-002", "pr", "D PR Senior Employment Stream")
    },
    {
      id: "cn-PR-003",
      officialCode: "CN-PR-003",
      name: "D Permanent Residence - Foreign Direct Investor Stream (USD 500k+ Capital)",
      categoryCode: "pr",
      fee: "CNY 1,500",
      validity: "Permanent Residence",
      stay: "Indefinite",
      purpose: "Permanent residence for direct foreign investors in Chinese industries.",
      eligibility: "Direct foreign investment of min USD 500,000 (or USD 1M-2M depending on region) maintained for 3 consecutive years with clean tax compliance.",
      record_type: "INVESTOR_VISA",
      docs: [
        "Foreign Direct Investment Capital Audit Report (USD 500,000+ foreign capital) ⭐",
        "3 Consecutive Years Corporate Financial Audit Reports & Corporate Tax Receipts ⭐",
        "Chinese Enterprise Business License & SAMR Foreign Capital Registration",
        "Apostilled Criminal Record Check & PSB Form"
      ],
      ...getChinaMicroDetails("cn-PR-003", "pr", "D PR Foreign Investor Stream")
    },
    {
      id: "cn-PR-004",
      officialCode: "CN-PR-004",
      name: "D Permanent Residence - Family Reunion Stream (5 Years Residence in China)",
      categoryCode: "pr",
      fee: "CNY 1,500",
      validity: "Permanent Residence",
      stay: "Indefinite",
      purpose: "Permanent residence for foreign family members of Chinese citizens after 5 years stay.",
      eligibility: "5 consecutive years legal residence in China living with Chinese family member + stable income & housing.",
      record_type: "PR_VISA",
      docs: [
        "5 Years Physical Residence Records in China (9+ months/year) ⭐",
        "Chinese Relative ID Card (Shenfenzheng) & Hukou Book copy",
        "Apostilled Marriage / Parent-Child Kinship Certificate",
        "Proof of financial solvency (min CNY 200,000 bank deposit or housing title)",
        "Apostilled Criminal Record Check"
      ],
      ...getChinaMicroDetails("cn-PR-004", "pr", "D PR Family Reunion Stream")
    },
    {
      id: "cn-PR-005",
      officialCode: "CN-PR-005",
      name: "D Permanent Residence - Marriage Stream (5 Years Married + 5 Years Residence in China)",
      categoryCode: "pr",
      fee: "CNY 1,500",
      validity: "Permanent Residence",
      stay: "Indefinite",
      purpose: "Permanent residence for foreign spouses of Chinese citizens after 5 years marriage and residence.",
      eligibility: "5 years continuous marriage + 5 years residence in China + stable income & housing.",
      record_type: "PR_VISA",
      docs: [
        "Apostilled Marriage Certificate showing 5+ years marriage duration ⭐",
        "5 Years China Residence Stamp Records (9+ months/year in China) ⭐",
        "Chinese Spouse ID Card (Shenfenzheng) & Hukou copy",
        "Joint housing title / rental contract & financial solvency proof",
        "Apostilled Criminal Background Check & PSB Application"
      ],
      ...getChinaMicroDetails("cn-PR-005", "pr", "D PR Marriage Stream")
    },
    {
      id: "cn-PR-006",
      officialCode: "CN-PR-006",
      name: "Chinese Citizenship & Naturalization (Ministry of Public Security Clearance)",
      categoryCode: "pr",
      fee: "CNY 1,500 + MPS Registration",
      validity: "Lifetime Chinese Citizenship",
      stay: "Permanent Citizen",
      purpose: "Full acquisition of Chinese nationality under Nationality Law of PRC (requires renouncing former citizenship).",
      eligibility: "Foreign nationals with near relatives who are Chinese citizens OR settled in China OR other legitimate reasons approved by Ministry of Public Security.",
      record_type: "PR_VISA",
      docs: [
        "Ministry of Public Security (MPS) Naturalization Approval Certificate ⭐",
        "Proof of Near Chinese Relatives OR Long Term Permanent Residence in China ⭐",
        "Written Commitment & Certificate of Renunciation of Original Citizenship ⭐",
        "Chinese language proficiency verification",
        "Valid passport & MPS Naturalization Application Form"
      ],
      ...getChinaMicroDetails("cn-PR-006", "pr", "Chinese Citizenship Naturalization")
    }
  ]
};
