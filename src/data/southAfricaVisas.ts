import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getSouthAfricaMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "Visitor Visa Sec 11 / Business / Study visas require proof of sufficient financial means (min ZAR 3,000 per month of intended stay in South Africa). Department of Home Affairs (DHA) requires 3 months original stamped personal bank statements.";
  let fundsBankMonths = "Last 3 months personal bank statements stamped by bank branch showing steady income/credits.";
  let fundsSudden = "❌ Sudden 1-day cash deposits right before visa submission at VFS Global / DHA are strictly flagged and cause rejection by DHA (Department of Home Affairs). Average balance must be maintained over 3 months.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement with ZAR 3,000+/month liquid balance. ❌ Galat: Unexplained cash deposit 24 hours prior to application.";

  let itrYears = "Income tax returns (ITR / SARS Tax Clearance) or salary slips for past 2–3 years for work, business, and family reunification applicants.";
  let itrMatch = "Reported tax income must reconcile with personal bank credits and CIPC/employment contracts.";
  let itrNoItr = "Not required for short-term tourist visitors or students sponsored by parents.";

  let bankMonths = "Last 3 months bank statements.";
  let bankReg = "Regular salary credits or steady corporate revenue.";
  let bankFd = "Fixed deposits accepted as supporting proof.";
  let bankSource = "Salary, corporate revenue, or verified parental sponsorship.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('general-work') || lowerCode.includes('critical-skills') || lowerCode.includes('ict')) {
    fundsMin = "General Work Visa Sec 19 requires Department of Labour (DOL) certificate confirming no SA citizen available + SAQA (South African Qualifications Authority) evaluation certificate. Critical Skills Visa Sec 19(4) requires professional body registration + SAQA. Application fee ZAR 1,520 + VFS ZAR 1,550.";
    fundsBankMonths = "Job contract, DOL approval certificate, SAQA evaluation certificate, and 3 months bank statements.";
    fundsSudden = "Employment contracts must specify salary in ZAR and CIPC company registration number.";
    fundsEx = "✅ Sahi: DOL Certificate + SAQA Evaluation + CIPC registered employer contract. ❌ Galat: Unapproved employer or missing DOL/SAQA clearance.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('study') || lowerCode.includes('sec-13')) {
    fundsMin = "Study Visa Sec 13 requires official acceptance letter from a registered South African educational institution (DHET) + proof of living funds (ZAR 3,000/month) + South African medical aid coverage. Application fee ZAR 1,520 + VFS ZAR 1,550.";
    fundsBankMonths = "3 months bank statements of student or parent sponsor showing min ZAR 3,000/month.";
    fundsSudden = "Parental undertaking and birth certificate required if using parent's bank statement.";
    fundsEx = "✅ Sahi: Official university admission + SA medical aid + ZAR 3,000/mo bank proof. ❌ Galat: Unregistered institution or missing SA medical insurance.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('relative') || lowerCode.includes('partner')) {
    fundsMin = "Relative Visa Sec 18 / Life Partner Sec 11(6) requires SA sponsor (citizen or PR holder) to prove minimum ZAR 8,500/month financial assurance per person + notarized cohabitation affidavit (for life partners, min 2 years) or birth/marriage certificates. Fee ZAR 1,520 + VFS ZAR 1,550.";
    fundsBankMonths = "SA sponsor's SARS tax clearance, 3 months bank statements, and salary slips.";
    fundsSudden = "Marriage/Birth certificates must be apostilled or legalised with certified English translation.";
    fundsEx = "✅ Sahi: Apostilled marriage/birth certificate + sponsor ZAR 8,500/mo income proof + SA ID copy. ❌ Galat: Sponsor income below ZAR 8,500 or unverified cohabitation.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('cipc') || lowerCode.includes('sec-15')) {
    fundsMin = "Business Visa Sec 15 requires min ZAR 5,000,000 capital investment in a South African business (certified by Chartered Accountant registered with SAICA) + CIPC registration + recommendation from dtic (Department of Trade, Industry and Competition). Fee ZAR 1,520 + VFS ZAR 1,550.";
    fundsBankMonths = "3-6 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring SA company must be active in official CIPC registry with SARS tax clearance.";
    fundsEx = "✅ Sahi: Official CIPC certificate + SAICA CA ZAR 5M capital confirmation + dtic recommendation. ❌ Galat: Unregistered entity or uncertified capital.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('sec-26') || lowerCode.includes('sec-27')) {
    fundsMin = "Permanent Residence Sec 26(a) requires 5 years continuous General Work Visa status in SA. Sec 27(b) Critical Skills PR requires 5 years critical skills work. Sec 27(c) Retired PR requires ZAR 37,000/month continuous pension income. Fee ZAR 1,520 + VFS ZAR 1,550.";
    fundsBankMonths = "5 years continuous SA employment, SARS tax returns, police clearance, and bank statements.";
    fundsSudden = "Continuous residence with valid work visa status over 5 years required.";
    fundsEx = "✅ Sahi: 5 years continuous SA work permit + SARS tax history + clean SAPS police clearance. ❌ Galat: Status gaps or unverified tax compliance.";
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

const RAW_ZA_VISAS: VisaItem[] = [
  // TOURIST 10 LIVE
  {
    id: "za-TOU-001",
    officialCode: "ZA-TOU-001",
    name: "Visitor Visa Tourist Sec 11(1)(a) 90 Days Single Multiple - Most common Tourist South Africa",
    fee: "ZAR 425 Visitor tourist + VFS 1550",
    validity: "90 days single or multiple entry",
    stay: "Max 90 days",
    processing: "10 to 15 Business Days",
    purpose: "Tourism, holiday, sightseeing, and visiting friends in South Africa",
    eligibility: "Foreign nationals visiting South Africa for tourism with proof of ZAR 3,000/month funds and return travel",
    officialSource: "http://www.dha.gov.za/index.php/types-of-visas",
    popular: true,
    highlight: true,
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport (min 30 days validity beyond departure, 2 blank pages) ⭐",
      "DHA-84 / BI-84 Visa Application Form + VFS Appointment Slip",
      "2 Recent Passport Photographs (35x45mm white background)",
      "Confirmed Flight Itinerary / Return Flight Reservation ⭐",
      "Proof of Accommodation: Hotel Booking or Host Invitation Letter + Host SA ID / PR Copy ⭐",
      "Bank Statements for past 3 months showing min ZAR 3,000/month (stamped by bank) ⭐",
      "Employment Letter / Employer NOC + 3 months salary slips",
      "Yellow Fever Vaccination Certificate (if traveling from or transiting endemic zone) ⭐",
      "Radiological & Medical Reports (BI-811 / BI-806) if required by consulate",
      "Cover Letter detailing travel itinerary and return commitment"
    ]
  },
  {
    id: "za-TOU-002",officialCode: "ZA-TOU-002",name: "Visitor Visa Tourist 3Y Multiple 90 Days per visit Visitor Tourist 3Y Multiple",fee: "ZAR 425 Visitor tourist 3Y multiple",validity: "3 Years Multiple Entry (90 days per visit)",stay: "Max 90 days per visit",processing: "10 to 15 Days",purpose: "Frequent holiday and tourism visits to South Africa over 3 years",eligibility: "Frequent visitors with proven compliance on previous SA tourist visas",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "tourist",record_type: "TOURIST_VISA",docs: ["Valid Passport + Copies of previous SA Visas & Entry Stamps ⭐","DHA-84 Application Form + 3 Months Bank Statements ⭐","Employer NOC & Travel Cover Letter","Yellow Fever Certificate if applicable"]
  },
  {
    id: "za-TOU-003",officialCode: "ZA-TOU-003",name: "Transit Visa 24H Transit Visa 24H Transit ZA",fee: "ZAR 425 Transit ZA",validity: "24 Hours Transit",stay: "Max 24 hours",processing: "5 to 10 Days",purpose: "Transiting through South African international airport transit area to neighboring countries",eligibility: "Passengers transiting through OR Tambo, Cape Town, or King Shaka airports",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "tourist",record_type: "TRANSIT_VISA",docs: ["Valid Passport + Onward Flight Ticket within 24 hours ⭐","Valid Visa for final destination country ⭐","DHA-84 Transit Application"]
  },
  {
    id: "za-TOU-004",officialCode: "ZA-TOU-004",name: "Visitor Visa Extension Extension 90 Days Extension Visitor Extension ZA",fee: "ZAR 425 Visitor extension ZA",validity: "Extension up to 90 days",stay: "Extension of stay",processing: "10 to 20 Days",purpose: "Extending tourist stay inside South Africa (submitted at VFS 60 days prior to expiry)",eligibility: "Current visitor visa holders inside SA seeking extended holiday stay",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "tourist",record_type: "STATUS_DOCUMENT",docs: ["VFS In-Country Extension Application Form ⭐","Proof of continuous financial means (ZAR 3,000/mo) + Updated Return Flight Booking ⭐"]
  },
  {
    id: "za-TOU-005",officialCode: "ZA-TOU-005",name: "Visitor Visa - Medical Treatment 90 Days 6M Medical Treatment Visitor Medical ZA",fee: "ZAR 425 Visitor medical treatment ZA",validity: "Up to 6 Months",stay: "Max 6 months",processing: "10 to 15 Days",purpose: "Receiving medical treatment in a registered South African hospital or clinic",eligibility: "Patients with official medical referral and hospital acceptance in SA",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "tourist",record_type: "MEDICAL_VISA",docs: ["Official Letter from SA Medical Institution detailing treatment & duration ⭐","Doctor Referral Letter from home country ⭐","Proof of full medical funding or health insurance"]
  },
  {
    id: "za-TOU-006",officialCode: "ZA-TOU-006",name: "Visitor Visa - Academic Sabbatical 1Y Academic Sabbatical Visitor Academic ZA",fee: "ZAR 425 Visitor academic sabbatical ZA",validity: "Up to 1 Year",stay: "Max 1 year",processing: "15 Days",purpose: "Academic sabbatical research or lecturing at a South African university",eligibility: "Foreign professors and academic staff on formal sabbatical leave",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "tourist",record_type: "SPECIAL_VISA",docs: ["Sabbatical Invitation Letter from SA University ⭐","Home University Sabbatical Approval Letter ⭐","Financial Proof (ZAR 3,000/mo)"]
  },
  {
    id: "za-TOU-007",officialCode: "ZA-TOU-007",name: "Visitor Visa - Voluntary Activities 1Y 3Y Voluntary Activities Visitor Voluntary ZA",fee: "ZAR 425 Visitor voluntary activities ZA",validity: "1 to 3 Years",stay: "1 to 3 Years",processing: "15 Days",purpose: "Volunteering with a registered South African NPO / NGO",eligibility: "Volunteers placed at registered SA non-profit organizations",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "tourist",record_type: "VOLUNTEER_VISA",docs: ["Invitation Letter from Registered SA NPO / NGO (NPO Registration Number) ⭐","Police Clearance Certificate (SAPS / Home Country) ⭐","Proof of living funds"]
  },
  {
    id: "za-TOU-008",officialCode: "ZA-TOU-008",name: "Visitor Visa - Research 1Y Research Visitor Research ZA",fee: "ZAR 425 Visitor research ZA",validity: "Up to 1 Year",stay: "Max 1 year",processing: "15 Days",purpose: "Conducting independent academic research in South Africa",eligibility: "Foreign researchers collaborated with SA research bodies",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "tourist",record_type: "RESEARCH_VISA",docs: ["Research Institution Collaboration Letter in SA ⭐","Research Proposal & Funding Proof"]
  },
  {
    id: "za-TOU-009",officialCode: "ZA-TOU-009",name: "Visitor Visa - Sports Events 90 Days Sports Events Visitor Sports ZA",fee: "ZAR 425 Visitor sports events ZA",validity: "Up to 90 Days",stay: "Max 90 days",processing: "10 Days",purpose: "Participating in sporting tournaments or events in SA",eligibility: "Athletes and sports delegates invited by SA sports federations",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "tourist",record_type: "SPECIAL_VISA",docs: ["Official Invitation from SA Sports Federation / Organizer ⭐","Delegate List & Event Schedule"]
  },
  {
    id: "za-TOU-010",officialCode: "ZA-TOU-010",name: "Visitor Visa - Film Industry 1Y Film Industry Visitor Film ZA",fee: "ZAR 425 Visitor film industry ZA",validity: "Up to 1 Year",stay: "Max 1 year",processing: "15 Days",purpose: "Film crews and production staff shooting commercials or movies in SA",eligibility: "Film crew members registered with National Film and Video Foundation (NFVF)",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "tourist",record_type: "PERFORMER_VISA",docs: ["NFVF (National Film & Video Foundation) Endorsement Letter ⭐","Production Company Invitation & Shooting Location Authorization"]
  },

  // BUSINESS 8 LIVE
  {
    id: "za-BIZ-001",
    officialCode: "ZA-BIZ-001",
    name: "Visitor Visa Business Sec 11(1)(a) 90 Days Short Stay Visitor Business - Most common Business South Africa",
    fee: "ZAR 425 Visitor business + VFS 1550",
    validity: "90 days short stay",
    stay: "Max 90 days",
    processing: "10 to 15 Business Days",
    purpose: "Attending business meetings, negotiations, corporate site visits, and commercial trade in SA",
    eligibility: "Business delegates invited by a South African company registered with CIPC",
    officialSource: "http://www.dha.gov.za/index.php/types-of-visas",
    popular: true,
    highlight: true,
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Valid Passport + DHA-84 Application Form + VFS Appointment Slip",
      "Official Invitation Letter from SA Host Company (specifying purpose, dates, host contact, CIPC registration) ⭐",
      "CIPC (Companies and Intellectual Property Commission) Registration Certificate of SA Host ⭐",
      "Employer Dispatch Letter from sending foreign company detailing business background and financial guarantee ⭐",
      "Bank Statements past 3 months showing min ZAR 3,000/month",
      "Yellow Fever Certificate (if arriving from endemic country)",
      "Confirmed Hotel & Flight Itinerary"
    ]
  },
  {
    id: "za-BIZ-002",officialCode: "ZA-BIZ-002",name: "Visitor Visa Business 3Y Multiple 90 Days per visit Visitor Business 3Y Multiple",fee: "ZAR 425 Visitor business 3Y multiple",validity: "3 Years Multiple Entry (90 days per visit)",stay: "Max 90 days per visit",processing: "10 to 15 Days",purpose: "Frequent corporate trips to South African partner companies over 3 years",eligibility: "Executives with regular commercial ties with CIPC registered SA firms",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Passport + Previous SA Business Visa Copies ⭐","CIPC Certificate of SA Host + Employer Dispatch Letter"]
  },
  {
    id: "za-BIZ-003",officialCode: "ZA-BIZ-003",name: "Business Visa Sec 15 Investor Business Visa Sec 15 Investor - Business Visa Sec 15",fee: "ZAR 1520 Business visa Sec 15 + Investment ZAR 5M",validity: "3 Years renewable",stay: "3 Years",processing: "8 to 12 Weeks",purpose: "Establishing or investing in an active business enterprise in South Africa",eligibility: "Investors contributing min ZAR 5,000,000 capital in SA business certified by Chartered Accountant and dtic recommendation",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",popular: true,categoryCode: "business",record_type: "INVESTOR_VISA",docs: ["ZAR 5,000,000 Capital Investment Proof (certified by SAICA registered CA) ⭐","dtic (Department of Trade, Industry and Competition) Recommendation Letter ⭐","CIPC Registration Certificate + SARS Tax Clearance Certificate ⭐","Comprehensive Business Plan & Job Creation Commitment for 60%+ SA citizens"]
  },
  {
    id: "za-BIZ-004",officialCode: "ZA-BIZ-004",name: "Business Visa Sec 15 - Entrepreneur Entrepreneur Business Visa Sec 15 Entrepreneur ZA",fee: "ZAR 1520 Business visa Sec 15 Entrepreneur + Investment ZAR 5M",validity: "3 Years renewable",stay: "3 Years",processing: "8 to 12 Weeks",purpose: "Launching an entrepreneurial business venture in SA",eligibility: "Entrepreneurs meeting dtic innovation criteria and ZAR 5M capital requirements",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "business",record_type: "ENTREPRENEUR_VISA",docs: ["Business Plan evaluated by dtic ⭐","SAICA Chartered Accountant Capital Verification (ZAR 5M) ⭐","CIPC Entity Formation Documents"]
  },
  {
    id: "za-BIZ-005",officialCode: "ZA-BIZ-005",name: "Visitor Visa Business Extension Extension Visitor Business 90 Days Extension Visitor Business ZA",fee: "ZAR 425 Visitor business extension ZA",validity: "Extension up to 90 days",stay: "Extension of stay",processing: "10 Days",purpose: "Extending short stay business visa due to ongoing commercial negotiations",eligibility: "Current short stay business visa holders in SA with official request from SA CIPC host",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "business",record_type: "STATUS_DOCUMENT",docs: ["Official Extension Request Letter from SA Host CIPC Company ⭐","VFS In-Country Extension Form"]
  },
  {
    id: "za-BIZ-006",officialCode: "ZA-BIZ-006",name: "Business Visa Sec 15 Extension Extension Business Visa Sec 15 1Y Extension Business Visa Sec 15 ZA",fee: "ZAR 1520 Business visa Sec 15 extension ZA",validity: "2 to 3 Years Extension",stay: "2 to 3 Years",processing: "6 to 8 Weeks",purpose: "Extending Business Visa Sec 15 for active investors",eligibility: "Business Visa Sec 15 holders demonstrating ongoing business operation and employment compliance",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "business",record_type: "STATUS_DOCUMENT",docs: ["Audited Financial Statements by SAICA CA ⭐","SARS Tax Clearance + Employee UIF/PAYE Registration Proof"]
  },
  {
    id: "za-BIZ-007",officialCode: "ZA-BIZ-007",name: "Visitor Visa Business - Conference 90 Days Conference Visitor Business Conference ZA",fee: "ZAR 425 Visitor business conference ZA",validity: "Up to 90 Days",stay: "Max 90 days",processing: "10 Days",purpose: "Attending commercial conventions, trade summits, or summits in SA",eligibility: "Delegates registered for trade events in SA",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "business",record_type: "CONFERENCE_VISA",docs: ["Conference Registration & Payment Receipt in SA ⭐","Employer Deputation Letter & Bank Statement"]
  },
  {
    id: "za-BIZ-008",officialCode: "ZA-BIZ-008",name: "Visitor Visa Business - Trade Fair Trade Fair 90 Days Trade Fair Visitor Business Trade Fair ZA",fee: "ZAR 425 Visitor business trade fair ZA",validity: "Up to 90 Days",stay: "Max 90 days",processing: "10 Days",purpose: "Exhibiting or visiting commercial trade fairs in SA",eligibility: "Exhibitors and trade visitors with confirmed stand/pass",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Exhibitor Pass / Stand Booking Invoice at SA Trade Expo ⭐","Company Registration & Dispatch Letter"]
  },

  // WORK 16 LIVE
  {
    id: "za-WRK-001",
    officialCode: "ZA-WRK-001",
    name: "General Work Visa Sec 19 5Y General Work Visa Sec 19 5Y - Most common Work Permit South Africa - General Work Sec 19 + DHA",
    fee: "ZAR 1520 General work Sec 19 + VFS 1550 + DOL",
    validity: "Up to 5 Years",
    stay: "Up to 5 Years renewable",
    processing: "8 to 12 Weeks (DHA + DOL Clearance)",
    purpose: "General long-term employment with a South African employer where no SA citizen is available",
    eligibility: "Foreign workers with a job offer from an SA CIPC employer supported by a Department of Labour (DOL) Certificate + SAQA Qualifications Evaluation Certificate",
    officialSource: "http://www.dha.gov.za/index.php/types-of-visas",
    popular: true,
    highlight: true,
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Job Offer & Employment Contract with SA CIPC Registered Employer ⭐",
      "Department of Labour (DOL) Certificate confirming no qualified SA citizen available ⭐",
      "SAQA (South African Qualifications Authority) Evaluation Certificate for foreign degrees ⭐",
      "Employer CIPC Registration Certificate + Proof of Job Advertisements in national media ⭐",
      "Valid Passport + Police Clearance Certificates from all countries lived in 12+ months ⭐",
      "Medical & Radiological Reports (BI-811 & BI-806) ⭐",
      "Completed DHA Application Form + VFS Appointment"
    ]
  },
  {
    id: "za-WRK-002",
    officialCode: "ZA-WRK-002",
    name: "Critical Skills Work Visa Sec 19(4) 5Y Critical Skills Work Visa Sec 19(4) Critical Skills ZA",
    fee: "ZAR 1520 Critical skills Sec 19(4) + VFS 1550",
    validity: "Up to 5 Years",
    stay: "Up to 5 Years renewable",
    processing: "4 to 8 Weeks",
    purpose: "Employment in occupations listed on the official South African Critical Skills List",
    eligibility: "Qualified professionals possessing qualifications/skills matching the official DHA Critical Skills List + SAQA Evaluation + Registration with relevant SA Professional Body",
    officialSource: "http://www.dha.gov.za/index.php/types-of-visas",
    popular: true,
    highlight: true,
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Proof of Qualification matching official DHA Critical Skills List ⭐",
      "SAQA Evaluation Certificate for foreign qualifications ⭐",
      "Proof of Registration with relevant South African Professional Body (e.g. ECSA, SACNASP, IITPSA) ⭐",
      "Job Offer Contract from SA Employer (or proof of job search within 12 months)",
      "Police Clearance Certificates + Medical & Radiological Reports (BI-811 / BI-806)",
      "Valid Passport + DHA-84 Application Form"
    ]
  },
  {
    id: "za-WRK-003",officialCode: "ZA-WRK-003",name: "Intra Company Transfer Work Visa Sec 20 4Y Intra Company Transfer Work Visa Sec 20 4Y ICT ZA",fee: "ZAR 1520 ICT Sec 20 + VFS 1550 ICT ZA",validity: "Up to 4 Years non-renewable",stay: "Max 4 Years",processing: "4 to 6 Weeks",purpose: "Transfer of key personnel or specialists from foreign parent company to SA branch",eligibility: "Employees working at least 6 months at foreign parent company prior to transfer",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "work",record_type: "WORK_VISA",docs: ["Transfer Letter from Foreign Parent Company + Assignment Contract with SA Branch (CIPC) ⭐","Proof of employment at foreign parent company for 6+ months ⭐","Skills transfer plan to SA citizen employee"]
  },
  {
    id: "za-WRK-004",officialCode: "ZA-WRK-004",name: "General Work Visa Extension Extension General Work Visa Sec 19 5Y Extension General Work ZA",fee: "ZAR 1520 General work Sec 19 extension ZA",validity: "Up to 5 Years Extension",stay: "Up to 5 Years",processing: "8 Weeks",purpose: "Extending General Work Visa Sec 19 in South Africa",eligibility: "Current General Work Visa holders with extended employer contract and DOL clearance",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["Updated DOL Certificate + Extended Employment Contract ⭐","SARS Tax Clearance + VFS Extension Application"]
  },
  {
    id: "za-WRK-005",officialCode: "ZA-WRK-005",name: "Critical Skills Work Visa Extension Extension Critical Skills Work Visa Sec 19(4) 5Y Extension Critical Skills ZA",fee: "ZA-WRK-005",validity: "Up to 5 Years Extension",stay: "Up to 5 Years",processing: "4 to 6 Weeks",purpose: "Extending Critical Skills Work Visa Sec 19(4)",eligibility: "Critical Skills Visa holders with active employment in designated critical field",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["Active Professional Body Registration Certificate ⭐","Employment Contract & Salary Slips past 3 months"]
  },
  {
    id: "za-WRK-006",officialCode: "ZA-WRK-006",name: "Intra Company Transfer Extension Extension Intra Company Transfer Work Visa Sec 20 4Y Extension ICT ZA",fee: "ZAR 1520 ICT Sec 20 extension ZA",validity: "Extension up to 4 Years limit",stay: "Max 4 Years total",processing: "4 Weeks",purpose: "Extending ICT Visa within 4 year maximum allowance",eligibility: "ICT visa holders within 4 year total stay cap",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["Updated Assignment Letter & SA Branch CIPC Proof ⭐"]
  },
  {
    id: "za-WRK-007",officialCode: "ZA-WRK-007",name: "DOL Certificate Department Labour Certificate Work Permit ZA DOL Certificate ZA",fee: "ZAR 0 DOL certificate ZA",validity: "Certificate validity",stay: "Per DOL approval",processing: "4 to 8 Weeks",purpose: "Department of Employment and Labour certificate required for General Work Visa",eligibility: "Employers proving unsuccessful recruitment of SA citizens",officialSource: "https://www.labour.gov.za",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["DOL Application + Proof of National Media Job Advertisements ⭐","Salary Benchmarking & Labour Market Search Proof"]
  },
  {
    id: "za-WRK-008",officialCode: "ZA-WRK-008",name: "SAQA Evaluation South African Qualifications Authority Evaluation Qualifications ZA SAQA Evaluation ZA",fee: "ZAR 1500 SAQA evaluation ZA",validity: "Permanent Certificate",stay: "Permanent",processing: "2 to 4 Weeks",purpose: "Evaluation and conversion of foreign university degrees to NQF level",eligibility: "Foreign degree holders applying for SA work/study visas",officialSource: "https://www.saqa.org.za",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["Apostilled Original Degree Certificates & Transcripts ⭐","SAQA Evaluation Application Form"]
  },
  {
    id: "za-WRK-009",officialCode: "ZA-WRK-009",name: "General Work Visa - Seasonal 1Y Seasonal General Work Visa Seasonal General Work ZA",fee: "ZAR 1520 General work seasonal + VFS 1550 Seasonal",validity: "Up to 1 Year",stay: "Max 1 year",processing: "4 Weeks",purpose: "Seasonal employment in South African agriculture or tourism",eligibility: "Seasonal workers with DOL seasonal clearance",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "work",record_type: "WORK_VISA",docs: ["Seasonal Employment Contract + DOL Clearance ⭐"]
  },
  {
    id: "za-WRK-010",officialCode: "ZA-WRK-010",name: "General Work Visa - Contract 1Y 2Y Contract General Work Visa Contract General Work ZA",fee: "ZAR 1520 General work contract + VFS 1550 Contract",validity: "1 to 2 Years",stay: "1 to 2 Years",processing: "6 Weeks",purpose: "Fixed-term project contract employment in SA",eligibility: "Contract workers hired for specific corporate projects",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "work",record_type: "WORK_VISA",docs: ["Fixed-Term Contract + DOL Certificate + SAQA Evaluation ⭐"]
  },
  {
    id: "za-WRK-011",officialCode: "ZA-WRK-011",name: "Critical Skills Work Visa - Researcher 5Y Researcher Critical Skills Work Visa Researcher Critical Skills ZA",fee: "ZAR 1520 Critical skills researcher + VFS 1550 Researcher",validity: "Up to 5 Years",stay: "Up to 5 Years",processing: "4 Weeks",purpose: "Scientific and academic researchers in designated critical fields",eligibility: "Researchers on Critical Skills List registered with NRF / SAQA",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "work",record_type: "RESEARCH_VISA",docs: ["SAQA Evaluation + Critical Skills Professional Registration ⭐","Research Institute Contract"]
  },
  {
    id: "za-WRK-012",officialCode: "ZA-WRK-012",name: "Intra Company Transfer - Executive 4Y Executive ICT Executive ICT ZA",fee: "ZAR 1520 ICT executive + VFS 1550 Executive ICT",validity: "Up to 4 Years",stay: "Max 4 Years",processing: "4 Weeks",purpose: "Executive level transfer to South African corporate subsidiary",eligibility: "Senior executives assigned to SA parent/subsidiary",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "work",record_type: "WORK_VISA",docs: ["Executive Transfer Assignment Letter + CIPC Entity Proof ⭐"]
  },
  {
    id: "za-WRK-013",officialCode: "ZA-WRK-013",name: "General Work Visa - Internship 1Y Internship General Work Visa Internship General Work ZA",fee: "ZAR 1520 General work internship + VFS 1550 Internship General",validity: "Up to 1 Year",stay: "Max 1 year",processing: "4 Weeks",purpose: "Paid graduate internship placed at an SA enterprise",eligibility: "Graduates fulfilling mandatory internship requirements",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "work",record_type: "INTERN_VISA",docs: ["Internship Agreement with SA Employer (CIPC) + DOL Exemption Proof ⭐"]
  },
  {
    id: "za-WRK-014",officialCode: "ZA-WRK-014",name: "General Work Visa - Artist 1Y Artist General Work Visa Artist General Work ZA",fee: "ZAR 1520 General work artist + VFS 1550 Artist General",validity: "Up to 1 Year",stay: "Max 1 year",processing: "4 Weeks",purpose: "Professional artists and performers working in SA cultural sector",eligibility: "Performers invited by SA cultural bodies",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "work",record_type: "PERFORMER_VISA",docs: ["Performance Contract + Cultural Body Endorsement ⭐"]
  },
  {
    id: "za-WRK-015",officialCode: "ZA-WRK-015",name: "General Work Visa - Sports 1Y Sports General Work Visa Sports General Work ZA",fee: "ZAR 1520 General work sports + VFS 1550 Sports General",validity: "Up to 1 Year",stay: "Max 1 year",processing: "4 Weeks",purpose: "Professional athletes and sports coaches employed by SA clubs",eligibility: "Athletes signed by SA sports clubs",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "work",record_type: "WORK_VISA",docs: ["Sports Contract + National Sports Federation Approval ⭐"]
  },
  {
    id: "za-WRK-016",officialCode: "ZA-WRK-016",name: "Retired Persons Visa Sec 20A 4Y Retired Persons Visa Sec 20A 4Y Retired Persons ZA",fee: "ZAR 1520 Retired persons Sec 20A + VFS 1550 Retired",validity: "Up to 4 Years renewable",stay: "Up to 4 Years",processing: "6 Weeks",purpose: "Retirement in South Africa for individuals with continuous pension/income",eligibility: "Retirees proving min ZAR 37,000/month guaranteed pension or irrevocable capital annuity",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "work",record_type: "RETIREMENT_VISA",docs: ["Proof of Guaranteed Pension / Annuity Income of min ZAR 37,000/month ⭐","Bank statements & Capital assets audit"]
  },

  // STUDENT 8 LIVE
  {
    id: "za-STU-001",
    officialCode: "ZA-STU-001",
    name: "Study Visa Sec 13 1Y Study Visa Sec 13 1Y - Most common Student South Africa",
    fee: "ZAR 1520 Study Sec 13 + VFS 1550 Study",
    validity: "1 Year renewable for duration of course",
    stay: "1 Year renewable",
    processing: "4 to 6 Weeks",
    purpose: "Studying full-time at a primary, secondary, or tertiary educational institution in South Africa",
    eligibility: "Students accepted at a registered South African educational institution (university/college) with proof of ZAR 3,000/month funds + SA Medical Aid",
    officialSource: "http://www.dha.gov.za/index.php/types-of-visas",
    popular: true,
    highlight: true,
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Official Acceptance / Provisional Enrollment Letter from Registered SA Educational Institution ⭐",
      "Proof of Financial Means: Liquid bank statement or scholarship of min ZAR 3,000/month ⭐",
      "Proof of South African Medical Aid Coverage (registered with SA Medical Schemes Council) ⭐",
      "Written Undertaking from Institution to notify DHA upon student departure/deregistration",
      "Valid Passport + Medical & Radiological Reports (BI-811 / BI-806)",
      "Police Clearance Certificates for applicants 18 and older"
    ]
  },
  {
    id: "za-STU-002",officialCode: "ZA-STU-002",name: "Study Visa Sec 13 Extension Extension Study Visa Sec 13 1Y Extension Study ZA",fee: "ZAR 1520 Study Sec 13 extension ZA",validity: "1 Year Extension",stay: "1 Year",processing: "4 Weeks",purpose: "Extending study visa for continuing academic study",eligibility: "Students enrolled for continuing academic year at SA university",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "student",record_type: "STATUS_DOCUMENT",docs: ["University Academic Progress Report + Enrollment Certificate ⭐","Updated SA Medical Aid Proof & Bank Statements"]
  },
  {
    id: "za-STU-003",officialCode: "ZA-STU-003",name: "Study Visa Sec 13 - Doctoral PhD 3Y Doctoral PhD Study Visa Doctoral PhD ZA",fee: "ZA-STU-003",validity: "Up to 3 Years",stay: "3 Years",processing: "4 Weeks",purpose: "Doctoral PhD research at a South African university",eligibility: "PhD candidates admitted to SA university doctoral school",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["PhD Admission Letter & Research Proposal Approval ⭐","SA Medical Aid + Financial Support Proof"]
  },
  {
    id: "za-STU-004",officialCode: "ZA-STU-004",name: "Study Visa Sec 13 - Language 1Y Language Study Visa Language Study ZA",fee: "ZAR 1520 Study language + VFS 1550 Language Study ZA",validity: "Up to 1 Year",stay: "Max 1 year",processing: "4 Weeks",purpose: "Enrolling in intensive English or African language courses in SA",eligibility: "Students taking accredited language courses in SA",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["Language School Acceptance Letter + SA Medical Aid ⭐"]
  },
  {
    id: "za-STU-005",officialCode: "ZA-STU-005",name: "Study Visa Sec 13 - Exchange 1Y Exchange Study Visa Exchange Study ZA",fee: "ZAR 1520 Study exchange + VFS 1550 Exchange Study ZA",validity: "Up to 1 Year",stay: "Max 1 year",processing: "4 Weeks",purpose: "Participating in formal university exchange program",eligibility: "Exchange students under bilateral university agreements",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["University Exchange Agreement & Acceptance Letter ⭐"]
  },
  {
    id: "za-STU-006",officialCode: "ZA-STU-006",name: "Study Visa Sec 13 - Internship 1Y Internship Study Visa Internship Study ZA",fee: "ZAR 1520 Study internship + VFS 1550 Internship Study ZA",validity: "Up to 1 Year",stay: "Max 1 year",processing: "4 Weeks",purpose: "Mandatory student curriculum internship in SA",eligibility: "Students taking mandatory internship linked to degree",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "student",record_type: "INTERN_VISA",docs: ["Tripartite Internship Agreement + SA Medical Aid ⭐"]
  },
  {
    id: "za-STU-007",officialCode: "ZA-STU-007",name: "Study Visa Sec 13 - Research 1Y Research Study Visa Research Study ZA",fee: "ZAR 1520 Study research + VFS 1550 Research Study ZA",validity: "Up to 1 Year",stay: "Max 1 year",processing: "4 Weeks",purpose: "Postgraduate student academic research at SA centers",eligibility: "Postgraduate researchers attached to SA research center",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "student",record_type: "RESEARCH_VISA",docs: ["Research Center Acceptance & SA Medical Aid ⭐"]
  },
  {
    id: "za-STU-008",officialCode: "ZA-STU-008",name: "Study Visa Sec 13 - Scholarship 1Y Scholarship Study Visa Scholarship Study ZA",fee: "ZAR 1520 Study scholarship + VFS 1550 Scholarship Study ZA",validity: "1 Year renewable",stay: "Duration of award",processing: "4 Weeks",purpose: "Scholarship awardees studying in SA (e.g. NRF, Mandela Rhodes)",eligibility: "Students holding official academic scholarship",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["Official Scholarship Award Certificate + SA University Acceptance ⭐"]
  },

  // FAMILY 8 LIVE
  {
    id: "za-FAM-001",
    officialCode: "ZA-FAM-001",
    name: "Relative Visa Sec 18 2Y Relative Visa Sec 18 2Y Family Reunification - Most common Family South Africa",
    fee: "ZAR 1520 Relative Sec 18 + VFS 1550 Relative",
    validity: "Up to 2 Years renewable",
    stay: "2 Years renewable",
    processing: "8 to 12 Weeks",
    purpose: "Family reunification with immediate family member (parent, child, sibling) who is a South African citizen or PR holder",
    eligibility: "First or second-degree relative of SA citizen or PR holder who provides ZAR 8,500/month financial assurance per person",
    officialSource: "http://www.dha.gov.za/index.php/types-of-visas",
    popular: true,
    highlight: true,
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Apostilled / Legalised Birth Certificate or Marriage Certificate proving relationship ⭐",
      "Sponsor's South African ID Document or Permanent Residence Permit Copy ⭐",
      "Financial Assurance Proof: Sponsor's bank statement showing min ZAR 8,500/month per person ⭐",
      "Police Clearance Certificates from home country & SA (SAPS)",
      "Medical & Radiological Reports (BI-811 / BI-806)",
      "Valid Passport + DHA Application Form"
    ]
  },
  {
    id: "za-FAM-002",
    officialCode: "ZA-FAM-002",
    name: "Life Partner Visa Sec 11(6) 2Y Life Partner Visa Sec 11(6) 2Y Life Partner ZA",
    fee: "ZAR 1520 Life partner Sec 11(6) + VFS 1550 Life Partner",
    validity: "Up to 2 Years renewable",
    stay: "2 Years (work endorsement allowed)",
    processing: "8 to 12 Weeks",
    purpose: "Residing in South Africa as spouse or life partner of an SA citizen or PR holder",
    eligibility: "Unmarried life partner (same sex or heterosexual) proving min 2 years continuous cohabitation with SA citizen/PR host",
    officialSource: "http://www.dha.gov.za/index.php/types-of-visas",
    popular: true,
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Notarized Life Partnership Affidavit confirming cohabitation of min 2 years ⭐",
      "Proof of Shared Financial Responsibilities (joint lease, joint bank account, utility bills) ⭐",
      "SA Partner's ID Document or Permanent Residence Permit Copy ⭐",
      "Financial Assurance Proof: ZAR 8,500/month income proof",
      "Work Endorsement Application (if partner intends to work in SA)",
      "Police Clearance & Medical/Radiological Reports"
    ]
  },
  {
    id: "za-FAM-003",officialCode: "ZA-FAM-003",name: "Relative Visa Extension Extension Relative Visa Sec 18 2Y Extension Relative ZA",fee: "ZAR 1520 Relative Sec 18 extension ZA",validity: "Up to 2 Years Extension",stay: "2 Years",processing: "6 to 8 Weeks",purpose: "Extending Relative Visa Sec 18 in SA",eligibility: "Relative visa holders with active SA citizen/PR sponsor",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "family",record_type: "STATUS_DOCUMENT",docs: ["Updated Sponsor Financial Proof (ZAR 8,500/mo) + SA ID Copy ⭐"]
  },
  {
    id: "za-FAM-004",officialCode: "ZA-FAM-004",name: "Life Partner Visa Extension Extension Life Partner Visa Sec 11(6) 2Y Extension Life Partner ZA",fee: "ZAR 1520 Life partner Sec 11(6) extension ZA",validity: "Up to 2 Years Extension",stay: "2 Years",processing: "6 to 8 Weeks",purpose: "Extending Life Partner Visa Sec 11(6)",eligibility: "Life partners maintaining cohabitation with SA host",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "family",record_type: "STATUS_DOCUMENT",docs: ["Updated Joint Cohabitation Affidavit & Joint Lease ⭐"]
  },
  {
    id: "za-FAM-005",officialCode: "ZA-FAM-005",name: "Visitor Visa - Family Reunification 90 Days Family Reunification Visitor Family Reunification ZA",fee: "ZAR 425 Visitor family reunification ZA",validity: "Up to 90 Days",stay: "Max 90 days",processing: "10 Days",purpose: "Short-term visit to SA relatives",eligibility: "Family members visiting SA residents short term",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["Host Invitation Letter + Host SA ID Copy + Bank Statements ⭐"]
  },
  {
    id: "za-FAM-006",officialCode: "ZA-FAM-006",name: "Visitor Visa - Spouse Life Partner Accompanying Spouse Life Partner 90 Days Accompanying Spouse Life Partner ZA",fee: "ZAR 425 Visitor accompanying spouse life partner ZA",validity: "Tied to primary work/study visa holder",stay: "Duration of primary visa",processing: "15 Days",purpose: "Accompanying spouse or child of a foreign work/study visa holder in SA",eligibility: "Dependents accompanying primary visa holder",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["Marriage / Birth Certificate + Primary Visa Copy ⭐"]
  },
  {
    id: "za-FAM-007",officialCode: "ZA-FAM-007",name: "Relative Visa - Child 2Y Child Relative Visa Child Relative ZA",fee: "ZAR 1520 Relative child + VFS 1550 Child Relative ZA",validity: "Up to 2 Years",stay: "2 Years",processing: "8 Weeks",purpose: "Dependent minor child joining SA citizen or PR parent",eligibility: "Minor children of SA citizen/PR parents",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["Birth Certificate + Parental Custody Documents ⭐"]
  },
  {
    id: "za-FAM-008",officialCode: "ZA-FAM-008",name: "Relative Visa - Adoption 2Y Adoption Relative Visa Adoption Relative ZA",fee: "ZAR 1520 Relative adoption + VFS 1550 Adoption Relative ZA",validity: "Up to 2 Years",stay: "2 Years",processing: "8 Weeks",purpose: "Adopted child joining adoptive parent in SA",eligibility: "Adopted children with High Court adoption order",officialSource: "http://www.dha.gov.za/index.php/types-of-visas",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["High Court Adoption Order + Adoptive Parent SA ID ⭐"]
  },

  // PR 6 LIVE + SPECIAL 15 LIVE = 21
  {
    id: "za-PR-001",
    officialCode: "ZA-PR-001",
    name: "Permanent Residence Sec 26(a) 5Y Work Permanent Residence Sec 26(a) 5Y Work - PR South Africa - PR Sec 26(a)",
    fee: "ZAR 1520 Permanent residence Sec 26(a) 5Y work + VFS 1550 PR Sec 26(a)",
    validity: "Permanent Residence Permit (Sec 26(a))",
    stay: "Lifetime Permanent Residence",
    processing: "8 to 18 Months (DHA PR Board)",
    purpose: "Permanent residence granted on grounds of 5 years continuous legal work permit status in SA",
    eligibility: "Foreign workers who held continuous SA work visas (General Work) for 5 years and received permanent job offer",
    officialSource: "http://www.dha.gov.za/index.php/permanent-residency",
    popular: true,
    highlight: true,
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "Proof of 5 Years Continuous Work Visa Status in South Africa ⭐",
      "Permanent Employment Contract with SA CIPC Employer ⭐",
      "SARS Tax Clearance Certificate & Past 5 Years Tax Returns ⭐",
      "SAPS Police Clearance Certificate + Home Country Police Clearance",
      "Medical & Radiological Reports (BI-811 / BI-806)",
      "Valid Passport + DHA PR Application Form"
    ]
  },
  {
    id: "za-PR-002",officialCode: "ZA-PR-002",name: "Permanent Residence Sec 26(b) Spouse 5Y Permanent Residence Sec 26(b) Spouse 5Y PR Sec 26(b)",fee: "ZAR 1520 Permanent residence Sec 26(b) spouse 5Y + VFS 1550 PR Sec 26(b)",validity: "Permanent Residence Permit (Sec 26(b))",stay: "Lifetime Permanent Residence",processing: "8 to 18 Months",purpose: "Permanent residence for spouse of an SA citizen or PR holder after 5 years marriage",eligibility: "Spouse who has been married to SA citizen/PR holder for min 5 years",officialSource: "http://www.dha.gov.za/index.php/permanent-residency",popular: true,categoryCode: "pr",record_type: "PR_VISA",docs: ["Marriage Certificate proving 5 Years Marriage to SA Citizen/PR ⭐","SA Spouse's ID Copy + Joint Affidavit confirming active marriage ⭐"]
  },
  {
    id: "za-PR-003",officialCode: "ZA-PR-003",name: "Permanent Residence Sec 27(a) Business 5Y Permanent Residence Sec 27(a) Business 5Y PR Sec 27(a)",fee: "ZAR 1520 Permanent residence Sec 27(a) business 5Y + Investment ZAR 5M + VFS 1550 PR Sec 27(a)",validity: "Permanent Residence Permit (Sec 27(a))",stay: "Lifetime Permanent Residence",processing: "8 to 12 Months",purpose: "Permanent residence for business investors establishing enterprise in SA",eligibility: "Investors contributing ZAR 5M capital and employing 60%+ SA citizens",officialSource: "http://www.dha.gov.za/index.php/permanent-residency",categoryCode: "pr",record_type: "PR_VISA",docs: ["CA Capital Investment Certificate (ZAR 5M) + dtic Recommendation ⭐","SARS Tax Clearance & CIPC Company Returns ⭐"]
  },
  {
    id: "za-PR-004",officialCode: "ZA-PR-004",name: "Permanent Residence Sec 27(b) Critical Skills 5Y Permanent Residence Sec 27(b) Critical Skills 5Y PR Sec 27(b)",fee: "ZAR 1520 Permanent residence Sec 27(b) critical skills 5Y + VFS 1550 PR Sec 27(b)",validity: "Permanent Residence Permit (Sec 27(b))",stay: "Lifetime Permanent Residence",processing: "6 to 12 Months",purpose: "Permanent residence for critical skills work visa holders with 5 years experience",eligibility: "Critical skills workers proving 5 years relevant employment in designated field",officialSource: "http://www.dha.gov.za/index.php/permanent-residency",popular: true,categoryCode: "pr",record_type: "PR_VISA",docs: ["Proof of 5 Years Critical Skills Work Experience in SA ⭐","Professional Body Registration & SAQA Evaluation ⭐"]
  },
  {
    id: "za-PR-005",officialCode: "ZA-PR-005",name: "Permanent Residence Sec 27(c) Retired Persons Permanent Residence Sec 27(c) Retired Persons PR Sec 27(c)",fee: "ZAR 1520 Permanent residence Sec 27(c) retired persons + VFS 1550 PR Sec 27(c) + Financial ZAR 37000/month",validity: "Permanent Residence Permit (Sec 27(c))",stay: "Lifetime Permanent Residence",processing: "6 to 12 Months",purpose: "Permanent residence for retirees with guaranteed income",eligibility: "Retirees proving min ZAR 37,000/month continuous pension/annuity",officialSource: "http://www.dha.gov.za/index.php/permanent-residency",categoryCode: "pr",record_type: "PR_VISA",docs: ["Irrevocable Guaranteed Pension / Annuity Certificate (ZAR 37,000/mo) ⭐"]
  },
  {
    id: "za-PR-006",officialCode: "ZA-PR-006",name: "Permanent Residence Sec 27(d) Refugee Permanent Residence Sec 27(d) Refugee PR Sec 27(d)",fee: "ZAR 1520 Permanent residence Sec 27(d) refugee + VFS 1550 PR Sec 27(d)",validity: "Permanent Residence Permit (Sec 27(d))",stay: "Lifetime Permanent Residence",processing: "6 to 12 Months",purpose: "Permanent residence for recognized refugees residing 5 years in SA",eligibility: "Recognized refugees with Standing Committee certification",officialSource: "http://www.dha.gov.za/index.php/permanent-residency",categoryCode: "pr",record_type: "PR_VISA",docs: ["Refugee Standing Committee Certification (5 Years Residence) ⭐"]
  },
  {
    id: "za-SPE-001",officialCode: "ZA-SPE-001",name: "Diplomat Visa Sec 14 Diplomat Visa Sec 14 Diplomat ZA",fee: "ZAR 0 Diplomat Sec 14 ZA",validity: "Posting Duration",stay: "Posting duration",processing: "1 to 2 Weeks",purpose: "Diplomatic accreditation for foreign embassy officials in Pretoria/Cape Town",eligibility: "Accredited diplomats holding diplomatic passports",officialSource: "http://www.dirco.gov.za",categoryCode: "pr",record_type: "DIPLOMAT_VISA",docs: ["DIRCO Note Verbale & Diplomatic Passport ⭐"]
  },
  {
    id: "za-SPE-002",officialCode: "ZA-SPE-002",name: "Official Visa Official Visa Official ZA",fee: "ZAR 0 Official ZA",validity: "Assignment Duration",stay: "Assignment duration",processing: "1 to 2 Weeks",purpose: "Government officials visiting SA on official state business",eligibility: "Foreign officials with official passports",officialSource: "http://www.dirco.gov.za",categoryCode: "pr",record_type: "OFFICIAL_VISA",docs: ["DIRCO Official Note Verbale & Duty Assignment ⭐"]
  },
  {
    id: "za-SPE-003",officialCode: "ZA-SPE-003",name: "Crew Visa Crew Visa Crew ZA",fee: "ZAR 0 Crew ZA",validity: "Duration of Layover",stay: "Max layover duration",processing: "3 Days",purpose: "Airline or maritime crew layover in SA",eligibility: "Active commercial air or sea crew",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "CREW_VISA",docs: ["Crew Member License / Seaman's Book + Airline Guarantee Letter ⭐"]
  },
  {
    id: "za-SPE-004",officialCode: "ZA-SPE-004",name: "Medical Treatment Visa Sec 17 6M Medical Treatment Visa Sec 17 6M Medical Treatment ZA",fee: "ZAR 1520 Medical treatment Sec 17 + VFS 1550 Medical treatment ZA",validity: "Up to 6 Months",stay: "Max 6 months",processing: "10 Days",purpose: "Medical treatment visa under Section 17",eligibility: "Patients receiving specialized hospital care in SA",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "MEDICAL_VISA",docs: ["Hospital Admission Confirmation & Doctor Referral ⭐"]
  },
  {
    id: "za-SPE-005",officialCode: "ZA-SPE-005",name: "Exchange Visa Sec 22 1Y Exchange Visa Sec 22 1Y Exchange ZA",fee: "ZAR 1520 Exchange Sec 22 + VFS 1550 Exchange ZA",validity: "Up to 1 Year",stay: "1 Year non-renewable",processing: "4 Weeks",purpose: "Youth cultural or educational exchange under Section 22",eligibility: "Youth under 25 participating in cultural exchange",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "STUDENT_VISA",docs: ["Organizing Exchange Entity Approval Certificate ⭐"]
  },
  {
    id: "za-SPE-006",officialCode: "ZA-SPE-006",name: "Treaty Visa Sec 11(1)(b)(iv) 2Y Treaty Visa Sec 11(1)(b)(iv) 2Y Treaty ZA",fee: "ZAR 1520 Treaty Sec 11(1)(b)(iv) + VFS 1550 Treaty ZA",validity: "Up to 2 Years",stay: "2 Years",processing: "4 Weeks",purpose: "Entry under bilateral international treaties",eligibility: "Personnel deployed under international agreements with SA government",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "BUSINESS_VISA",docs: ["Bilateral Treaty Program Confirmation Letter ⭐"]
  },
  {
    id: "za-SPE-007",officialCode: "ZA-SPE-007",name: "Retired Persons Visa Sec 20A 4Y Retired Persons Visa Sec 20A 4Y Retired Persons ZA",fee: "ZAR 1520 Retired persons Sec 20A + VFS 1550 Retired + Financial ZAR 37000/month",validity: "Up to 4 Years",stay: "4 Years",processing: "6 Weeks",purpose: "Temporary residence for retirees",eligibility: "Retirees with ZAR 37,000/mo guaranteed income",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "RETIREMENT_VISA",docs: ["Pension Annuity Guarantee Certificate ⭐"]
  },
  {
    id: "za-SPE-008",officialCode: "ZA-SPE-008",name: "Asylum Seeker Permit Sec 22 Asylum Seeker Permit Sec 22 Asylum Seeker ZA",fee: "ZAR 0 Asylum seeker Sec 22 ZA",validity: "Temporary Permit",stay: "6 Months renewable",processing: "Immediate",purpose: "Asylum seeker temporary permit under Section 22",eligibility: "Asylum seekers applying at Refugee Reception Office",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "ASYLUM_VISA",docs: ["Refugee Reception Office Registration Document ⭐"]
  },
  {
    id: "za-SPE-009",officialCode: "ZA-SPE-009",name: "Refugee Permit Sec 24 Refugee Permit Sec 24 Refugee ZA",fee: "ZAR 0 Refugee Sec 24 ZA",validity: "2 Years renewable",stay: "2 Years",processing: "3 Months",purpose: "Recognized refugee permit under Section 24",eligibility: "Refugees granted status by Standing Committee",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "REFUGEE_VISA",docs: ["Section 24 Refugee Status Recognition Decision ⭐"]
  },
  {
    id: "za-SPE-010",officialCode: "ZA-SPE-010",name: "Permanent Residence Sec 26(c) Child 2Y Permanent Residence Sec 26(c) Child 2Y PR Sec 26(c)",fee: "ZAR 1520 Permanent residence Sec 26(c) child 2Y + VFS 1550 PR Sec 26(c)",validity: "Lifetime PR",stay: "Permanent",processing: "8 Months",purpose: "PR for minor child of SA citizen or PR holder",eligibility: "Minor children under 21 of SA citizen/PR",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "PR_VISA",docs: ["Birth Certificate + Parent SA ID/PR Copy ⭐"]
  },
  {
    id: "za-SPE-011",officialCode: "ZA-SPE-011",name: "Permanent Residence Sec 26(d) Child Citizen 2Y Permanent Residence Sec 26(d) Child Citizen 2Y PR Sec 26(d)",fee: "ZAR 1520 Permanent residence Sec 26(d) child citizen 2Y + VFS 1550 PR Sec 26(d)",validity: "Lifetime PR",stay: "Permanent",processing: "8 Months",purpose: "PR for major child of SA citizen",eligibility: "Adult children of SA citizens",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "PR_VISA",docs: ["Proof of Parent SA Citizenship + Birth Certificate ⭐"]
  },
  {
    id: "za-SPE-012",officialCode: "ZA-SPE-012",name: "Permanent Residence Sec 27(e) Large Investment ZAR 5M Permanent Residence Sec 27(e) Large Investment ZAR 5M PR Sec 27(e)",fee: "ZAR 1520 Permanent residence Sec 27(e) large investment ZAR 5M + VFS 1550 PR Sec 27(e) + Investment ZAR 5M",validity: "Lifetime PR",stay: "Permanent",processing: "8 Months",purpose: "PR for large scale enterprise investors",eligibility: "Investors contributing ZAR 5M capital",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "PR_VISA",docs: ["dtic Certificate + CA Investment Audit ⭐"]
  },
  {
    id: "za-SPE-013",officialCode: "ZA-SPE-013",name: "Permanent Residence Sec 27(f) Relative 2Y Permanent Residence Sec 27(f) Relative 2Y PR Sec 27(f)",fee: "ZAR 1520 Permanent residence Sec 27(f) relative 2Y + VFS 1550 PR Sec 27(f)",validity: "Lifetime PR",stay: "Permanent",processing: "8 Months",purpose: "PR for first degree relative of SA citizen/PR",eligibility: "Parents or children of SA citizen/PR",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "PR_VISA",docs: ["First Degree Relationship Proof + Financial Assurance ⭐"]
  },
  {
    id: "za-SPE-014",officialCode: "ZA-SPE-014",name: "Permanent Residence Sec 27(g) Relative Citizen 2Y Permanent Residence Sec 27(g) Relative Citizen 2Y PR Sec 27(g)",fee: "ZAR 1520 Permanent residence Sec 27(g) relative citizen 2Y + VFS 1550 PR Sec 27(g)",validity: "Lifetime PR",stay: "Permanent",processing: "8 Months",purpose: "PR for relatives of SA citizens",eligibility: "Immediate relatives of citizens",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "PR_VISA",docs: ["Relationship Certificate + Citizen Host ID ⭐"]
  },
  {
    id: "za-SPE-015",officialCode: "ZA-SPE-015",name: "Critical Skills List Critical Skills List Critical Skills List ZA Critical Skills ZA",fee: "ZAR 0 Critical skills list ZA",validity: "Regulatory Classification",stay: "N/A",processing: "N/A",purpose: "Official Department of Home Affairs Critical Skills Gazette list",eligibility: "Public reference list for critical occupations in South Africa",officialSource: "http://www.dha.gov.za",categoryCode: "pr",record_type: "STATUS_DOCUMENT",docs: ["Official Government Gazette Critical Skills Publication ⭐"]
  },

  // SUPPORTING 15 + LEGACY 10 = 25 SUPPORTING/LEGACY - NOT COUNTED IN 71 LIVE
  {id:"za-SUP-001",officialCode:"ZA-SUP-001",name:"DHA Authority Department Home Affairs Authority Visa Residence",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["DHA = Department of Home Affairs - Official authority for South African visas, work permits, and permanent residence. Website: dha.gov.za"]},
  {id:"za-SUP-002",officialCode:"ZA-SUP-002",name:"VFS Global Authority Visa Application Center VFS",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["VFS Global - Official outsourced biometric submission partner for South African Department of Home Affairs worldwide."]},
  {id:"za-SUP-003",officialCode:"ZA-SUP-003",name:"CIPC Authority Companies Intellectual Property Commission Authority Company Registration CIPC",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["CIPC = Companies and Intellectual Property Commission - Commercial corporate registry in South Africa. Website: cipc.co.za"]},
  {id:"za-SUP-004",officialCode:"ZA-SUP-004",name:"DOL Authority Department Labour Authority Work Permit DOL",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["DOL = Department of Employment and Labour issuing workforce search clearance certificates for General Work Visas."]},
  {id:"za-SUP-005",officialCode:"ZA-SUP-005",name:"SAQA Authority South African Qualifications Authority Authority Qualifications Evaluation SAQA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["SAQA = South African Qualifications Authority evaluating foreign academic degrees against National Qualifications Framework (NQF). Website: saqa.org.za"]},
  {id:"za-SUP-006",officialCode:"ZA-SUP-006",name:"DIRCO Authority Department International Relations Cooperation Authority Diplomat",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["DIRCO = Department of International Relations and Cooperation managing foreign diplomatic accreditations."]},
  {id:"za-SUP-007",officialCode:"ZA-SUP-007",name:"Critical Skills Authority Critical Skills List Authority Work Permit Critical Skills",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["DHA Gazette Critical Skills List governing designated shortage professions."]},
  {id:"za-SUP-008",officialCode:"ZA-SUP-008",name:"Relative Authority Relative Visa Authority Family Relative",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Relative Visa framework under Immigration Act Section 18."]},
  {id:"za-SUP-009",officialCode:"ZA-SUP-009",name:"Life Partner Authority Life Partner Visa Authority Family Life Partner",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Life Partner Visa framework under Immigration Act Section 11(6)."]},
  {id:"za-SUP-010",officialCode:"ZA-SUP-010",name:"Business Visa Authority Business Visa Sec 15 Authority Business Visa Business Sec 15",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Business Visa framework under Immigration Act Section 15."]},
  {id:"za-SUP-011",officialCode:"ZA-SUP-011",name:"Permanent Residence Authority Permanent Residence Sec 26 27 Authority PR",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Permanent Residence provisions under Immigration Act Sections 26 and 27."]},
  {id:"za-SUP-012",officialCode:"ZA-SUP-012",name:"Study Visa Authority Study Visa Sec 13 Authority Student Study",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Study Visa framework under Immigration Act Section 13."]},
  {id:"za-SUP-013",officialCode:"ZA-SUP-013",name:"General Work Authority General Work Visa Sec 19 Authority Work General Work",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["General Work Visa framework under Immigration Act Section 19."]},
  {id:"za-SUP-014",officialCode:"ZA-SUP-014",name:"DHA-84 Authority DHA-84 Form Authority Visa Application DHA-84",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Official DHA-84 / BI-84 temporary residence visa application form."]},
  {id:"za-SUP-015",officialCode:"ZA-SUP-015",name:"Retired Persons Authority Retired Persons Visa Sec 20A Authority Retired",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Retired Persons Visa provisions under Immigration Act Section 20A."]},
  {id:"za-LEG-001",officialCode:"ZA-LEG-001",name:"Legacy Visitor Visa Old System Closed Replaced by New Visitor Visa Sec 11 DHA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Legacy visitor permit system replaced by current Section 11 DHA structure."]},
  {id:"za-LEG-002",officialCode:"ZA-LEG-002",name:"Legacy Business Visa Old System Closed Replaced by New Business Visa Sec 15 CIPC",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former business permit system superseded by Section 15 dtic / SAICA rules."]},
  {id:"za-LEG-003",officialCode:"ZA-LEG-003",name:"Legacy General Work Visa Old System Closed Replaced by New General Work Visa Sec 19 DOL SAQA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Legacy work permit rules replaced by Section 19 DOL requirement."]},
  {id:"za-LEG-004",officialCode:"ZA-LEG-004",name:"Legacy Critical Skills Work Visa Old System Closed Replaced by New Critical Skills Work Visa Sec 19(4)",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Historical Exceptional Skills permit replaced by Critical Skills List Section 19(4)."]},
  {id:"za-LEG-005",officialCode:"ZA-LEG-005",name:"Legacy Study Visa Old System Closed Replaced by New Study Visa Sec 13 DHA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Old study permit regulations updated to Section 13."]},
  {id:"za-LEG-006",officialCode:"ZA-LEG-006",name:"Legacy Relative Visa Old System Closed Replaced by New Relative Visa Sec 18 DHA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Old relative permit regulations updated to Section 18 with ZAR 8,500 assurance."]},
  {id:"za-LEG-007",officialCode:"ZA-LEG-007",name:"Legacy Life Partner Visa Old System Closed Replaced by New Life Partner Visa Sec 11(6) DHA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Old cohabitation permit rules updated to Section 11(6)."]},
  {id:"za-LEG-008",officialCode:"ZA-LEG-008",name:"Legacy Permanent Residence Old System Closed Replaced by New Permanent Residence Sec 26 27 DHA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former PR rules superseded by Sections 26 and 27."]},
  {id:"za-LEG-009",officialCode:"ZA-LEG-009",name:"Legacy Retired Persons Visa Old System Closed Replaced by New Retired Persons Visa Sec 20A DHA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Previous retirement financial threshold updated to Section 20A ZAR 37,000/mo."]},
  {id:"za-LEG-010",officialCode:"ZA-LEG-010",name:"Legacy Treaty Visa Old System Closed Replaced by New Treaty Visa Sec 11(1)(b)(iv) DHA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former treaty visa rules updated under Section 11(1)(b)(iv)."]}
];

function processVisaList(items: VisaItem[]): VisaItem[] {
  return items.map(item => {
    const micro = getSouthAfricaMicroDetails(item.id, item.categoryCode || 'tourist', item.name);
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

const PROCESSED_ZA = processVisaList(RAW_ZA_VISAS);

export const SOUTH_AFRICA_71_VISAS: CountryVisas = {
  tourist: PROCESSED_ZA.filter(v => v.categoryCode === 'tourist'),
  business: PROCESSED_ZA.filter(v => v.categoryCode === 'business'),
  work: PROCESSED_ZA.filter(v => v.categoryCode === 'work'),
  student: PROCESSED_ZA.filter(v => v.categoryCode === 'student'),
  family: PROCESSED_ZA.filter(v => v.categoryCode === 'family'),
  pr: PROCESSED_ZA.filter(v => v.categoryCode === 'pr')
};
