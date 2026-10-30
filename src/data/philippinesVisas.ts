import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getPhilippinesMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "Section 9(a) Tourist Visa requires proof of financial capacity (min PHP 50,000 / USD 1,000 liquid balance or 3 months bank statements). Bureau of Immigration (BI / immigration.gov.ph) / Philippine Embassy requires 3 months bank statements.";
  let fundsBankMonths = "Last 3 months personal bank statements stamped by bank showing liquid PHP 50,000+ / USD 1,000+ balance.";
  let fundsSudden = "❌ Sudden cash deposits right before submitting application to Philippine Embassy / BI are flagged. Maintaining a steady balance over 3 months ensures quick approval.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement showing PHP 50,000+ liquid balance. ❌ Galat: Unexplained cash deposit 24 hours prior to 9(a) submission.";

  let itrYears = "Income Tax Returns (BIR Form 1701/2316) or salary slips for past 2–3 years for Section 9(g) Work Visa, SIRV Investor, or 13(a) Permanent Residency applicants.";
  let itrMatch = "Reported income must reconcile with personal bank credits and DOLE (Department of Labor and Employment) Alien Employment Permit (AEP) contract.";
  let itrNoItr = "Not required for short-term 59-day Section 9(a) tourist or Special Study Permit (SSP) holders.";

  let bankMonths = "Last 3 months bank statements.";
  let bankReg = "Regular salary credits or steady corporate revenue.";
  let bankFd = "Time deposits required for Special Resident Retiree Visa SRRV (USD 10,000–50,000 in DBP/PRA bank) and SIRV Special Investor Visa (USD 75,000 in BOI accredited bank).";
  let bankSource = "Salary, corporate dividends, verified offshore pension, or parental sponsorship.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('9g') || lowerCode.includes('aep') || lowerCode.includes('swp') || lowerCode.includes('pwp') || lowerCode.includes('peza')) {
    fundsMin = "Section 9(g) Work Visa requires Department of Labor and Employment (DOLE) Alien Employment Permit (AEP) + notarized employment contract + Bureau of Immigration (BI) approval. Special Work Permit (SWP) / PWP valid for 3–6 months for short-term assignments.";
    fundsBankMonths = "DOLE AEP card/approval, Philippine employer contract, and 3 months bank statements.";
    fundsSudden = "Section 9(g) Work Visa must be sponsored by a legally registered Philippine corporation (SEC Registration, Mayor's Permit, BIR Tax clearance).";
    fundsEx = "✅ Sahi: DOLE AEP approval + SEC registered employer contract + 1-3 Year 9(g) Work Visa. ❌ Galat: Submitting 9(g) without DOLE AEP permit.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('9f') || lowerCode.includes('ssp')) {
    fundsMin = "Section 9(f) Student Visa / Special Study Permit (SSP) requires official acceptance from a CHED-accredited Philippine university + National Bureau of Investigation (NBI) clearance + living funds proof (PHP 50,000+).";
    fundsBankMonths = "3 months bank statements of student or parent sponsor showing min PHP 50,000 / USD 1,000.";
    fundsSudden = "Parental guarantee letter and birth certificate required if funded by parents.";
    fundsEx = "✅ Sahi: CHED university acceptance letter + NBI clearance + USD 1,000 bank proof. ❌ Galat: Unregistered school or missing NBI clearance.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('13a') || lowerCode.includes('13c') || lowerCode.includes('balikbayan')) {
    fundsMin = "Section 13(a) Non-Quota Immigrant Spouse Visa requires legal marriage to a Philippine citizen (PSA Marriage Certificate) + NBI clearance + joint bank account proof. Balikbayan privilege offers 1-year visa-free stay for former Filipinos & foreign spouses.";
    fundsBankMonths = "Philippine citizen spouse ID (Valid Govt ID) + past 3 salary slips and bank statements.";
    fundsSudden = "Foreign marriage certificates must be registered with Philippine Statistics Authority (PSA) or Report of Marriage at Philippine Embassy.";
    fundsEx = "✅ Sahi: PSA Marriage Certificate + Filipino spouse ID + NBI clearance + 1-Year Probationary / Permanent 13(a) Visa. ❌ Galat: Unregistered foreign marriage certificate.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('9d') || lowerCode.includes('sirv') || lowerCode.includes('treaty trader')) {
    fundsMin = "Section 9(d) Business Visa / Treaty Trader requires invitation letter from registered Philippine company (SEC Registration & GIS) + foreign employer letter. SIRV requires USD 75,000 investment in BOI-approved enterprise.";
    fundsBankMonths = "3 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Philippine company must be actively registered with SEC & BIR.";
    fundsEx = "✅ Sahi: Official SEC Certificate of Registration + BOI/PEZA endorsement letter. ❌ Galat: Unregistered sponsor company.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('srrv') || lowerCode.includes('quota') || lowerCode.includes('13 quota')) {
    fundsMin = "Section 13 Quota Immigrant Visa (50 per nationality/year) / SRRV Retiree Visa (USD 10k–50k time deposit with PRA) / SIRV Investor Visa (USD 75k in BOI shares/stocks). Requires NBI clearance & medical report.";
    fundsBankMonths = "Proof of USD 10k–50k time deposit in PRA accredited bank (DBP/PNB) or USD 75k BOI investment certificate.";
    fundsSudden = "Time deposit for SRRV must be maintained in Philippine Retirement Authority (PRA) accredited bank.";
    fundsEx = "✅ Sahi: USD 20,000 Time Deposit in DBP bank + PRA SRRV card + NBI clearance. ❌ Galat: Withdrawing time deposit without PRA clearance.";
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

const RAW_PH_VISAS: VisaItem[] = [
  // TOURIST 12 LIVE
  {
    id: "ph-TOU-001",
    officialCode: "PH-TOU-001",
    name: "9a Tourist Visa 59 Days 9a Tourist 59 Days - Most common Tourist Philippines",
    fee: "PHP 3300 9a tourist 59 days",
    validity: "59 days single entry",
    stay: "Max 59 days",
    processing: "3 to 5 Business Days (Philippine Embassy / Consulate)",
    purpose: "Tourism, vacation, sightseeing, visiting friends/relatives in the Philippines",
    eligibility: "Foreign nationals requiring single entry visa to the Philippines",
    officialSource: "https://immigration.gov.ph",
    popular: true,
    highlight: true,
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport (minimum 6 months validity, 1 blank page) ⭐",
      "Digital Passport Photo (2x2 inch white background)",
      "Confirmed Round-Trip Flight Ticket ⭐",
      "Hotel Reservation or Proof of Accommodation",
      "Bank Statement (last 3 months, min PHP 50,000 / USD 1,000) ⭐",
      "Employment Certificate / Cover Letter",
      "Section 9(a) Application Form via Philippine Embassy ⭐"
    ],
    rawFundsBox: "PHP 50k = Bank 3M PHP 50k = 9a tourist ph embassy",
    rawBankBox: "Bank 3M PHP 50k original + Employment + 9a",
    warningBox: "✅ Most common tourist Philippines 9a Tourist 59 Days - ph embassy 9a"
  },
  {
    id: "ph-TOU-002",
    officialCode: "PH-TOU-002",
    name: "9a Tourist Extension Extension 9a Tourist 59 Days Extension 9a Tourist PH",
    fee: "PHP 4000 9a tourist extension 59 days",
    validity: "59 days extension (up to 36 months total)",
    stay: "Extended stay duration",
    processing: "1 to 3 Business Days (Bureau of Immigration - BI Main / Field Offices)",
    purpose: "Extending tourist stay in the Philippines for additional 1–2 months",
    eligibility: "Foreign tourists currently in the Philippines on valid 9(a) visa",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "tourist",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Extension Reason Request ⭐",
      "Current Passport with Valid 9(a) Visa Stamp ⭐",
      "Confirmed Revised Flight Ticket ⭐",
      "Payment Receipt for BI Extension Fee",
      "BI Extension Form (TVS-1) ⭐"
    ]
  },
  {
    id: "ph-TOU-003",
    officialCode: "PH-TOU-003",
    name: "eTA Tourist 30 Days eTA Tourist 30 Days eTA PH",
    fee: "PHP 0 eTA tourist 30 days visa free PH",
    validity: "30 days single entry",
    stay: "Max 30 days",
    processing: "Immediate / Online eTA",
    purpose: "Short leisure or business visits for eligible electronic travel authorization nationalities",
    eligibility: "Citizens of eTA eligible countries (Taiwan, etc.)",
    officialSource: "https://eta.immigration.gov.ph",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport (6M validity) ⭐",
      "Confirmed Return / Onward Flight Ticket within 30 days ⭐",
      "Hotel Accommodation Booking",
      "eTA Application via Official Portal (eta.immigration.gov.ph) ⭐"
    ]
  },
  {
    id: "ph-TOU-004",
    officialCode: "PH-TOU-004",
    name: "Visa Free 30 Days Visa Free 30 Days Visa Free PH",
    fee: "PHP 0 Visa free 30 days PH",
    validity: "30 days visa free entry",
    stay: "Max 30 days (extendable at BI)",
    processing: "Immediate upon arrival at airport/seaport",
    purpose: "Tourism and short business entry under Executive Order No. 408",
    eligibility: "Citizens of 157 visa-free countries (US, UK, EU, Canada, Japan, Australia, ASEAN, etc.)",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "tourist",
    record_type: "VISA_WAIVER",
    docs: [
      "Valid Passport (minimum 6 months validity) ⭐",
      "Confirmed Return Flight Ticket to country of origin / next destination ⭐",
      "eTravel Registration QR Code (etravel.gov.ph) ⭐",
      "Sufficient Funds Proof"
    ]
  },
  {
    id: "ph-TOU-005",
    officialCode: "PH-TOU-005",
    name: "9a Tourist - Medical Treatment 59 Days Medical Treatment 9a Medical PH",
    fee: "PHP 3300 9a medical treatment PH",
    validity: "59 days single/multiple entry",
    stay: "Max 59 days (extendable)",
    processing: "3 to 5 Business Days",
    purpose: "Medical consultation, surgery, or treatment at registered Philippine medical institutions",
    eligibility: "Foreign patients seeking healthcare in the Philippines",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "tourist",
    record_type: "MEDICAL_VISA",
    docs: [
      "Hospital Appointment & Invitation Letter from Philippine Hospital ⭐",
      "Medical Certificate & Treatment Cost Estimate ⭐",
      "Hospital Guarantee & Advance Payment Receipt",
      "Passport 6M + Bank Statement (PHP 50,000+)",
      "Section 9(a) Medical Application via Philippine Embassy ⭐"
    ]
  },
  {
    id: "ph-TOU-006",
    officialCode: "PH-TOU-006",
    name: "9a Tourist - Family Friends Visit 59 Days Family Friends Visit 9a Family Friends PH",
    fee: "PHP 3300 9a family friends visit PH",
    validity: "59 days single entry",
    stay: "Max 59 days",
    processing: "3 to 5 Business Days",
    purpose: "Visiting relatives, family members, or friends residing in the Philippines",
    eligibility: "Visitors with host invitation in the Philippines",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Affidavit of Support & Guarantee from Host in the Philippines ⭐",
      "Host's Philippine Passport / ACR I-Card Copy ⭐",
      "Proof of Family Relationship (Marriage/Birth certificates)",
      "Host Address & Financial Proof",
      "Applicant Passport + Photos + Bank Statement 3M",
      "Section 9(a) Family Visit Application via Embassy ⭐"
    ]
  },
  {
    id: "ph-TOU-007",
    officialCode: "PH-TOU-007",
    name: "Special Resident Retiree Visa SRRV SRRV 1Y Special Resident Retiree Visa SRRV PH",
    fee: "USD 1400 SRRV 1Y + Deposit USD 10k 20k 50k + PRA",
    validity: "Indefinite / Lifetime retirement residency (renewed annually)",
    stay: "Permanent residency with multiple entry privileges",
    processing: "15 to 30 Business Days (Philippine Retirement Authority - PRA)",
    purpose: "Long-term retirement residency in the Philippines for foreign seniors & retirees",
    eligibility: "Foreign nationals aged 50+ (or 35–49) placing required time deposit in PRA bank",
    officialSource: "https://pra.gov.ph",
    categoryCode: "tourist",
    record_type: "RETIREMENT_VISA",
    docs: [
      "PRA Time Deposit Certificate: USD 10,000 (with pension) / USD 20,000 (without pension) in DBP ⭐",
      "National Bureau of Investigation (NBI) Clearance or Police Clearance (Legalized) ⭐",
      "Medical Examination Clearance from PRA accredited clinic ⭐",
      "Valid Passport Copy & 2x2 Photos",
      "SRRV Application via Philippine Retirement Authority ⭐"
    ]
  },
  {
    id: "ph-TOU-008",
    officialCode: "PH-TOU-008",
    name: "SRRV Extension Extension SRRV 1Y Extension SRRV PH",
    fee: "USD 1400 SRRV extension 1Y + Deposit USD 10k 20k 50k extension SRRV",
    validity: "Annual PRA Membership ID Card renewal",
    stay: "Continued SRRV retirement stay",
    processing: "3 to 5 Business Days",
    purpose: "Annual renewal of PRA membership card for SRRV retirees",
    eligibility: "Current SRRV visa holders maintaining required bank deposit",
    officialSource: "https://pra.gov.ph",
    categoryCode: "tourist",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Proof of Maintained Time Deposit in PRA Accredited Bank ⭐",
      "PRA Annual ID Renewal Request & Fee Receipt ⭐",
      "Current Passport Copy with SRRV Sticker",
      "PRA Renewal Form ⭐"
    ]
  },
  {
    id: "ph-TOU-009",
    officialCode: "PH-TOU-009",
    name: "Transit Visa 72H Transit Visa 72H Transit PH",
    fee: "PHP 0 Transit 72H PH",
    validity: "72 Hours (3 Days)",
    stay: "Max 72 Hours",
    processing: "Immediate at Airport Transit Desk (NAIA Manila / Mactan Cebu)",
    purpose: "Short airport transit through the Philippines to a third country",
    eligibility: "Passengers transiting through Philippine international airports with onward flight",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "tourist",
    record_type: "TRANSIT_VISA",
    docs: [
      "Valid Passport (6 months validity) ⭐",
      "Confirmed Onward Flight Ticket to 3rd Country within 72 Hours ⭐",
      "Valid Visa for Destination Country (if required) ⭐",
      "eTravel Registration & Transit Desk Application ⭐"
    ]
  },
  {
    id: "ph-TOU-010",
    officialCode: "PH-TOU-010",
    name: "9a Tourist - Yacht 59 Days Yacht 9a Yacht PH",
    fee: "PHP 3300 9a yacht PH",
    validity: "59 days single entry",
    stay: "Max 59 days",
    processing: "3 to 5 Business Days",
    purpose: "Cruising Philippine waters on private yacht, sailboat, or pleasure vessel",
    eligibility: "Yacht owners, leisure sailors, and maritime tourists",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Vessel / Yacht Registration Certificate ⭐",
      "Philippine Coast Guard & Port Authority Clearance ⭐",
      "Passenger Manifest & Crew List",
      "Passport 6M + Marine Insurance Policy",
      "Section 9(a) Yacht Application via Embassy ⭐"
    ]
  },
  {
    id: "ph-TOU-011",
    officialCode: "PH-TOU-011",
    name: "9a Tourist - Conference 59 Days Conference 9a Conference PH",
    fee: "PHP 3300 9a conference PH",
    validity: "59 days single entry",
    stay: "Max 59 days",
    processing: "3 to 5 Business Days",
    purpose: "Attending international conventions, academic conferences, or seminars",
    eligibility: "Conference delegates and speakers",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "tourist",
    record_type: "CONFERENCE_VISA",
    docs: [
      "Conference Invitation Letter from Philippine Host Organizer ⭐",
      "Event Registration & Program Schedule ⭐",
      "Passport 6M + Bank Statement 3M",
      "Section 9(a) Application via Embassy ⭐"
    ]
  },
  {
    id: "ph-TOU-012",
    officialCode: "PH-TOU-012",
    name: "Digital Nomad Visa DNV 1Y 2Y Digital Nomad Visa DNV 1Y 2Y Digital Nomad PH",
    fee: "PHP 10000 DNV 1Y 2Y + Income PHP 120k/month + DNV",
    validity: "1 Year to 2 Years renewable pass",
    stay: "Up to 24 months remote work stay",
    processing: "14 to 21 Business Days (Bureau of Immigration)",
    purpose: "Remote work and digital nomad lifestyle residing in the Philippines",
    eligibility: "Remote IT professionals, freelancers, and digital workers earning PHP 120,000+/month remotely",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "tourist",
    record_type: "DIGITAL_NOMAD_VISA",
    docs: [
      "Digital Nomad Visa Clearance Approval from Bureau of Immigration ⭐",
      "Proof of Remote Employment Contract / Overseas Freelance Contracts ⭐",
      "Proof of Annual Remote Income PHP 1,440,000+ (approx USD 25,000+) ⭐",
      "Bank Statements (last 3 months) showing liquid remote earnings",
      "Good Conduct Clearance / Police Background Check ⭐",
      "DNV Application via Bureau of Immigration ⭐"
    ]
  },

  // BUSINESS 8 LIVE
  {
    id: "ph-BIZ-001",
    officialCode: "PH-BIZ-001",
    name: "9d Business Visa 59 Days 9d Business 59 Days - Most common Business Philippines",
    fee: "PHP 3300 9d business 59 days",
    validity: "59 days single entry",
    stay: "Max 59 days",
    processing: "3 to 5 Business Days (Philippine Embassy / Consulate)",
    purpose: "Commercial discussions, business negotiations, trade meetings, site visits",
    eligibility: "Foreign business executives traveling for commercial engagements",
    officialSource: "https://immigration.gov.ph",
    popular: true,
    highlight: true,
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Company Invitation Letter from Registered Philippine Entity (SEC Registration) ⭐",
      "Host Company SEC Certificate of Registration & Mayor's Permit ⭐",
      "Employer Dispatch / Cover Letter from Overseas Company ⭐",
      "Business Card & Overseas Company Profile",
      "Valid Passport (6 months validity) ⭐",
      "Bank Statement (last 3 months, min PHP 50,000) ⭐",
      "Section 9(d) Application via Philippine Embassy ⭐"
    ],
    warningBox: "✅ Most common business Philippines 9d Business 59 Days - ph embassy 9d"
  },
  {
    id: "ph-BIZ-002",
    officialCode: "PH-BIZ-002",
    name: "9d Business Extension Extension 9d Business 59 Days Extension 9d Business PH",
    fee: "PHP 4000 9d business extension 59 days",
    validity: "59 days extension",
    stay: "Extended business stay",
    processing: "1 to 3 Business Days (BI Main / Field Offices)",
    purpose: "Extending Section 9(d) business visa stay in the Philippines",
    eligibility: "Current 9(d) business visa holders",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "business",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "9(d) Extension Request Letter from Sponsoring Philippine Firm ⭐",
      "Host Company SEC Registration & Mayor's Permit ⭐",
      "Current Passport with Valid 9(d) Visa Stamp",
      "Extension Application via Bureau of Immigration ⭐"
    ]
  },
  {
    id: "ph-BIZ-003",
    officialCode: "PH-BIZ-003",
    name: "9g Work Visa 1Y 2Y 3Y 9g Work 1Y 2Y 3Y Work 9g PH",
    fee: "PHP 10000 9g work 1Y 2Y 3Y + AEP + Company 9g",
    validity: "1 Year to 3 Years renewable work visa",
    stay: "Continuous stay for employment term",
    processing: "14 to 30 Business Days (DOLE AEP + BI 9g Visa Approval)",
    purpose: "Long-term pre-arranged corporate employment for foreign executives and specialists",
    eligibility: "Expatriates employed by SEC-registered corporations with DOLE AEP clearance",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "business",
    record_type: "WORK_VISA",
    docs: [
      "DOLE Alien Employment Permit (AEP) Approval ⭐",
      "Signed Employment Contract with Sponsoring Corporate Employer ⭐",
      "Corporate Legal Docs: SEC Registration, Articles of Incorporation, Mayor's Permit, GIS ⭐",
      "Tax Certificate (BIR Form 2316 / TIN) ⭐",
      "Passport Copy (valid min 18 months) & 2x2 Photos",
      "Section 9(g) Work Visa Application via BI ⭐"
    ]
  },
  {
    id: "ph-BIZ-004",
    officialCode: "PH-BIZ-004",
    name: "Special Investor Resident Visa SIRV SIRV Special Investor Resident Visa SIRV PH",
    fee: "USD 75k SIRV + Investment USD 75k + BOI",
    validity: "Indefinite / Permanent investment residency (as long as investment is maintained)",
    stay: "Permanent residency with multiple entry rights",
    processing: "30 to 45 Business Days (Board of Investments - BOI + BI)",
    purpose: "Residency-by-investment for foreign investors investing USD 75,000 in Philippine enterprise or stocks",
    eligibility: "Foreign investors remitting USD 75,000 into BOI-approved commercial entity or listed stocks",
    officialSource: "https://boi.gov.ph",
    categoryCode: "business",
    record_type: "INVESTOR_VISA",
    docs: [
      "Proof of USD 75,000 Inward Capital Remittance to BOI Accredited Bank (DBP/LBP) ⭐",
      "BOI Investment Endorsement & Stock Ownership Verification ⭐",
      "National Bureau of Investigation (NBI) Clearance ⭐",
      "Medical Examination Report from DOH accredited clinic",
      "SIRV Application via Board of Investments ⭐"
    ]
  },
  {
    id: "ph-BIZ-005",
    officialCode: "PH-BIZ-005",
    name: "9d Business - Investor 59 Days Investor Business 9d Investor Business PH",
    fee: "PHP 3300 9d investor PH + Investment PHP",
    validity: "59 days single entry",
    stay: "Max 59 days",
    processing: "3 to 5 Business Days",
    purpose: "Prospective foreign investors conducting due diligence or establishing Philippine business entity",
    eligibility: "Investors planning capital placement in SEC-registered firm",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "business",
    record_type: "INVESTOR_VISA",
    docs: [
      "SEC Pre-Incorporation Clearance or Company Registration Draft ⭐",
      "Bank Statement showing capital funds (min USD 10,000)",
      "Business Plan & Investment Scope",
      "Section 9(d) Investor Application via Embassy ⭐"
    ]
  },
  {
    id: "ph-BIZ-006",
    officialCode: "PH-BIZ-006",
    name: "9d Business - Conference 59 Days Conference Business 9d Conference PH",
    fee: "PHP 3300 9d conference PH",
    validity: "59 days single entry",
    stay: "Max 59 days",
    processing: "3 to 5 Business Days",
    purpose: "Attending commercial exhibitions, corporate summits, or industry trade expos",
    eligibility: "Corporate delegates and trade speakers",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "business",
    record_type: "CONFERENCE_VISA",
    docs: [
      "Trade Conference Invitation & Delegate Pass ⭐",
      "Philippine Organizer SEC Registration & Event Details ⭐",
      "Employer Cover Letter & Passport 6M",
      "Section 9(d) Conference Application via Embassy ⭐"
    ]
  },
  {
    id: "ph-BIZ-007",
    officialCode: "PH-BIZ-007",
    name: "9d Business - Trade Fair 59 Days Trade Fair Business 9d Trade Fair PH",
    fee: "PHP 3300 9d trade fair PH",
    validity: "59 days single entry",
    stay: "Max 59 days",
    processing: "3 to 5 Business Days",
    purpose: "Exhibiting or sourcing products at trade fairs and commercial expos",
    eligibility: "Trade fair exhibitors and buyers",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Trade Fair Exhibitor Contract & Event Registration ⭐",
      "DTI / Center for International Trade Expositions Sponsorship ⭐",
      "Company Business Profile & Passport 6M",
      "Section 9(d) Application via Embassy ⭐"
    ]
  },
  {
    id: "ph-BIZ-008",
    officialCode: "PH-BIZ-008",
    name: "APEC Business Travel Card ABTC APEC Business Travel Card ABTC APEC PH",
    fee: "PHP 1000 ABTC PH",
    validity: "5 Years multiple entry",
    stay: "Max 59 days per entry",
    processing: "Pre-clearance via APEC scheme",
    purpose: "Fast-track entry for business executives from APEC member economies",
    eligibility: "APEC Business Travel Card holders with PH pre-clearance",
    officialSource: "https://www.apec.org",
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Valid APEC Card with PH pre-clearance ⭐",
      "Valid Passport (6M validity) ⭐",
      "eTravel Registration QR Code ⭐"
    ]
  },

  // WORK 16 LIVE
  {
    id: "ph-WRK-001",
    officialCode: "PH-WRK-001",
    name: "9g Work Visa 1Y 2Y 3Y 9g Work 1Y 2Y 3Y - Most common Work Permit Philippines - 9g Work + AEP",
    fee: "PHP 10000 9g work 1Y 2Y 3Y + AEP + Company 9g",
    validity: "1 Year to 3 Years renewable pass",
    stay: "Continuous stay for employment duration",
    processing: "14 to 30 Business Days (DOLE AEP + BI 9g Visa Approval)",
    purpose: "Standard pre-arranged commercial employment for foreign professionals in the Philippines",
    eligibility: "Expatriates employed by SEC-registered corporate employer with DOLE AEP approval",
    officialSource: "https://immigration.gov.ph",
    popular: true,
    highlight: true,
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "DOLE Alien Employment Permit (AEP) Approval ⭐",
      "Notarized Employment Contract with Sponsoring Philippine Employer ⭐",
      "SEC Certificate of Registration, Articles of Incorporation, Mayor's Permit ⭐",
      "Tax Verification (BIR TIN & Tax Returns) ⭐",
      "University Degree / Professional Certifications (Legalized)",
      "Passport Copy (valid min 18 months) & 2x2 Photos",
      "Section 9(g) Work Visa Application via Bureau of Immigration ⭐"
    ],
    rawFundsBox: "9g = Work visa PH + AEP + Alien Employment Permit = Work permit PH",
    rawBankBox: "Bank 3M original + DOLE AEP permit + Employer contract",
    warningBox: "✅ Most common work permit Philippines 9g Work 1Y 2Y 3Y + AEP + Alien Employment Permit + BI + DOLE"
  },
  {
    id: "ph-WRK-002",
    officialCode: "PH-WRK-002",
    name: "9g Work Extension Extension 9g Work 1Y Extension 9g Work PH",
    fee: "PHP 10000 9g work extension 1Y",
    validity: "1 Year to 3 Years extension",
    stay: "Continued employment stay",
    processing: "7 to 14 Business Days",
    purpose: "Renewing Section 9(g) work visa for foreign expatriate employee",
    eligibility: "Current 9(g) visa holders with renewed DOLE AEP permit",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Renewed DOLE Alien Employment Permit (AEP) Card ⭐",
      "Updated Employment Contract & Tax Returns (BIR Form 2316) ⭐",
      "Current Passport with Valid 9(g) Visa Stamp",
      "9(g) Renewal Application via Bureau of Immigration ⭐"
    ]
  },
  {
    id: "ph-WRK-003",
    officialCode: "PH-WRK-003",
    name: "Special Work Permit SWP 3M 6M Special Work Permit SWP 3M 6M Work SWP PH",
    fee: "PHP 6420 SWP 3M 6M + Company SWP",
    validity: "3 Months (renewable once for another 3 months, total 6 months max)",
    stay: "Short-term work assignment",
    processing: "5 to 7 Business Days (Bureau of Immigration)",
    purpose: "Short-term technical, consulting, artistic, or athletic work assignments without AEP requirement",
    eligibility: "Foreign nationals rendering temporary short-term services (under 6 months)",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Notarized Service Contract / Assignment Letter from Sponsoring Company ⭐",
      "Host Company SEC Registration, Mayor's Permit & Tax Clearance ⭐",
      "Passport Copy & 2x2 Photo",
      "SWP Application via Bureau of Immigration ⭐"
    ]
  },
  {
    id: "ph-WRK-004",
    officialCode: "PH-WRK-004",
    name: "Provisional Work Permit PWP 3M Provisional Work Permit PWP 3M Work PWP PH",
    fee: "PHP 6420 PWP 3M + Company PWP",
    validity: "3 Months (valid while 9g work visa application is pending)",
    stay: "Temporary work authorization",
    processing: "3 to 5 Business Days (Bureau of Immigration)",
    purpose: "Temporary work authorization while long-term 9(g) work visa is being processed",
    eligibility: "Expatriates with pending 9(g) work visa application at BI",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Pending 9(g) Work Visa Application Filing Receipt ⭐",
      "DOLE AEP Filing Receipt or Approved AEP ⭐",
      "Notarized Employment Contract & Corporate SEC Registration",
      "PWP Application via Bureau of Immigration ⭐"
    ]
  },
  {
    id: "ph-WRK-005",
    officialCode: "PH-WRK-005",
    name: "Alien Employment Permit AEP AEP Alien Employment Permit AEP Alien Employment PH",
    fee: "PHP 9000 AEP + Company AEP",
    validity: "Co-terminus with employment contract (1 to 3 years)",
    stay: "Official Work Permit Clearance",
    processing: "10 to 15 Business Days (Department of Labor and Employment - DOLE)",
    purpose: "Mandatory work permit issued by DOLE required for all foreign nationals working in the Philippines",
    eligibility: "Foreign nationals seeking employment in the Philippines where no qualified Filipino is available",
    officialSource: "https://dole.gov.ph",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "DOLE AEP Application Form (Notarized) ⭐",
      "Notarized Employment Contract specifying position and salary ⭐",
      "SEC Registration, Articles of Incorporation, Mayor's Permit ⭐",
      "Proof of Labor Market Test / Newspaper Publication of Job Opening ⭐",
      "Passport Copy & Passport Photos",
      "AEP Submission to Regional DOLE Office ⭐"
    ]
  },
  {
    id: "ph-WRK-006",
    officialCode: "PH-WRK-006",
    name: "9g Work - Expert 1Y Expert 9g Work Expert 9g Work PH",
    fee: "PHP 10000 9g work expert 1Y + AEP expert + Company 9g expert",
    validity: "1 Year to 3 Years renewable",
    stay: "Contract term",
    processing: "14 to 30 Business Days",
    purpose: "Technical advisory, engineering consultancy, and specialized industrial expert deployment",
    eligibility: "Experts employed under DOLE AEP expert clearance",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "DOLE AEP Expert Approval ⭐",
      "Specialized Technical Advisory Contract ⭐",
      "SEC Registration & Corporate Legal Deeds",
      "9(g) Expert Application via BI ⭐"
    ]
  },
  {
    id: "ph-WRK-007",
    officialCode: "PH-WRK-007",
    name: "9g Work - Manager 1Y Manager 9g Work Manager 9g Work PH",
    fee: "PHP 10000 9g work manager 1Y + AEP manager + Company 9g manager",
    validity: "1 Year to 3 Years renewable",
    stay: "Contract duration",
    processing: "14 to 30 Business Days",
    purpose: "Senior corporate managerial employment in Philippine companies",
    eligibility: "Managers recruited under approved DOLE AEP quota",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "DOLE AEP Managerial Clearance ⭐",
      "Managerial Employment Contract & Company Organizational Chart ⭐",
      "Corporate Tax Clearances & SEC Docs",
      "9(g) Manager Application via BI ⭐"
    ]
  },
  {
    id: "ph-WRK-008",
    officialCode: "PH-WRK-008",
    name: "9g Work - Researcher 1Y Researcher 9g Work Researcher 9g Work PH",
    fee: "PHP 10000 9g work researcher 1Y + AEP researcher + Company 9g researcher",
    validity: "1 Year renewable",
    stay: "Research duration",
    processing: "14 to 30 Business Days (DOST / CHED + DOLE + BI)",
    purpose: "Scientific research at Philippine research institutes or universities",
    eligibility: "Researchers approved by DOST (Department of Science and Technology)",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "RESEARCH_VISA",
    docs: [
      "DOST Research Endorsement Letter ⭐",
      "DOLE AEP Research Clearance ⭐",
      "Research Project Plan & Host Institute Contract",
      "9(g) Researcher Application via BI ⭐"
    ]
  },
  {
    id: "ph-WRK-009",
    officialCode: "PH-WRK-009",
    name: "9g Work - Engineer 1Y Engineer 9g Work Engineer 9g Work PH",
    fee: "PHP 10000 9g work engineer 1Y + AEP engineer + Company 9g engineer",
    validity: "1 Year to 3 Years renewable",
    stay: "Contract duration",
    processing: "14 to 30 Business Days",
    purpose: "Engineering project management, infrastructure design, technical supervision",
    eligibility: "Engineers registered with PRC (Professional Regulation Commission) or foreign equivalent",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "PRC Engineering Registration / Special Permit ⭐",
      "DOLE AEP Engineer Approval & Contract ⭐",
      "Bachelor/Master Degree in Engineering & Transcripts",
      "9(g) Engineer Application via BI ⭐"
    ]
  },
  {
    id: "ph-WRK-010",
    officialCode: "PH-WRK-010",
    name: "9g Work - Academic 1Y Academic 9g Work Academic 9g Work PH",
    fee: "PHP 10000 9g work academic 1Y + AEP academic + Company 9g academic",
    validity: "1 Year to 3 Years renewable",
    stay: "Academic appointment duration",
    processing: "14 to 30 Business Days (CHED + DOLE + BI)",
    purpose: "Professors, lecturers, and academic faculty at Philippine universities",
    eligibility: "Academic staff recruited by CHED-accredited higher education institutions",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "CHED (Commission on Higher Education) Recommendation ⭐",
      "DOLE AEP Academic Clearance ⭐",
      "Academic Appointment Contract & Transcripts",
      "9(g) Academic Application via BI ⭐"
    ]
  },
  {
    id: "ph-WRK-011",
    officialCode: "PH-WRK-011",
    name: "AEP Authority Alien Employment Permit Authority Work AEP",
    fee: "PHP 0 AEP authority PH",
    validity: "Official Work Permit Document",
    stay: "Regulatory Guidance",
    processing: "Department of Labor and Employment (DOLE)",
    purpose: "Alien Employment Permit (AEP) regulatory authority framework",
    eligibility: "Official Classification",
    officialSource: "https://dole.gov.ph",
    categoryCode: "work",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "DOLE AEP Official Framework Reference (dole.gov.ph) ⭐",
      "Foreign Worker Employment Guidelines (DOLE) ⭐"
    ]
  },
  {
    id: "ph-WRK-012",
    officialCode: "PH-WRK-012",
    name: "SWP Authority Special Work Permit Authority Work SWP",
    fee: "PHP 0 SWP authority PH",
    validity: "Official Work Permit Document",
    stay: "Regulatory Guidance",
    processing: "Bureau of Immigration (BI)",
    purpose: "Special Work Permit (SWP) regulatory framework authority",
    eligibility: "Official Classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "BI Special Work Permit (SWP) Framework Reference ⭐",
      "Short-Term Work Permit Regulations (BI) ⭐"
    ]
  },
  {
    id: "ph-WRK-013",
    officialCode: "PH-WRK-013",
    name: "9g Work - Artist 1Y Artist 9g Work Artist 9g Work PH",
    fee: "PHP 10000 9g work artist 1Y + AEP artist + Company 9g artist",
    validity: "1 Year renewable",
    stay: "Contract term",
    processing: "14 Business Days (NCCA + DOLE + BI)",
    purpose: "Foreign creative artists, performers, and resident designers employed in the Philippines",
    eligibility: "Artists contracted by Philippine entertainment promoters / agencies",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "PERFORMER_VISA",
    docs: [
      "NCCA / Cultural Center Recommendation ⭐",
      "DOLE AEP Artist Clearance & Contract ⭐",
      "9(g) Artist Application via BI ⭐"
    ]
  },
  {
    id: "ph-WRK-014",
    officialCode: "PH-WRK-014",
    name: "9g Work - Sports 1Y Sports 9g Work Sports 9g Work PH",
    fee: "PHP 10000 9g work sports 1Y + AEP sports + Company 9g sports",
    validity: "1 Year to 2 Years renewable",
    stay: "Contract duration",
    processing: "14 Business Days (PSC + DOLE + BI)",
    purpose: "Professional sports coaches, technical directors, and contracted professional athletes",
    eligibility: "Sports professionals contracted by Philippine sports bodies or clubs",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Philippine Sports Commission (PSC) Endorsement ⭐",
      "DOLE AEP Sports Clearance & Contract ⭐",
      "Coaching Licenses & Credentials",
      "9(g) Sports Application via BI ⭐"
    ]
  },
  {
    id: "ph-WRK-015",
    officialCode: "PH-WRK-015",
    name: "Special Work Permit - IT 3M IT Special Work Permit IT Special Work Permit PH",
    fee: "PHP 6420 SWP IT 3M + Company SWP IT",
    validity: "3 Months (renewable up to 6 months)",
    stay: "Short-term IT deployment",
    processing: "5 Business Days (BI)",
    purpose: "Short-term software engineering, system deployment, or IT consulting",
    eligibility: "IT professionals assigned for under 6 months",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "IT Service Assignment Letter & Sponsoring Corporate SEC Registration ⭐",
      "SWP Application via Bureau of Immigration ⭐"
    ]
  },
  {
    id: "ph-WRK-016",
    officialCode: "PH-WRK-016",
    name: "9g Work - Domestic Helper 1Y Domestic Helper 9g Work Domestic Helper 9g Work PH",
    fee: "PHP 10000 9g work domestic helper 1Y + AEP domestic helper + Company 9g domestic helper",
    validity: "1 Year renewable",
    stay: "12 months",
    processing: "14 Business Days (DOLE + BI)",
    purpose: "Domestic household assistance for eligible foreign diplomats or executives",
    eligibility: "Domestic helpers recruited under DOLE household quota",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Diplomatic / Executive 9(g) Employer Verification ⭐",
      "DOLE Household AEP Clearance & Contract ⭐",
      "9(g) Application via Bureau of Immigration ⭐"
    ]
  },

  // STUDENT 6 LIVE
  {
    id: "ph-STU-001",
    officialCode: "PH-STU-001",
    name: "9f Student Visa 1Y 9f Student 1Y - Most common Student Philippines",
    fee: "PHP 10000 9f student 1Y + SSP + NBI",
    validity: "1 Year renewable for study duration",
    stay: "Full-time study period",
    processing: "14 to 21 Business Days (CHED + BI 9f Student Desk)",
    purpose: "Full-time higher education degree programs at CHED-accredited Philippine universities",
    eligibility: "International students accepted by CHED-approved Philippine higher education institutions",
    officialSource: "https://immigration.gov.ph",
    popular: true,
    highlight: true,
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Official Acceptance Letter (Notice of Acceptance - NOA) from CHED Accredited University ⭐",
      "CHED Endorsement & Student Desk Approval ⭐",
      "National Bureau of Investigation (NBI) Clearance Certificate ⭐",
      "Academic Transcripts & Diplomas (Apostilled / Legalized) ⭐",
      "Proof of Financial Capacity / Bank Statement (min PHP 50,000) ⭐",
      "Medical Examination Clearance Report",
      "Passport Copy (valid min 18 months) & 2x2 Photos",
      "Section 9(f) Student Visa Application via BI ⭐"
    ],
    rawFundsBox: "9f + SSP + NBI = Student visa PH + Special Study Permit + National Bureau Investigation = Student PH",
    rawBankBox: "Bank 3M original + Tuition fee receipt + 9f + SSP + NBI",
    warningBox: "✅ Most common student Philippines 9f Student 1Y + SSP + NBI"
  },
  {
    id: "ph-STU-002",
    officialCode: "PH-STU-002",
    name: "9f Student Extension Extension 9f Student 1Y Extension 9f Student PH",
    fee: "PHP 10000 9f student extension 1Y + SSP extension + NBI extension",
    validity: "1 Year extension",
    stay: "Extended study period",
    processing: "5 to 7 Business Days",
    purpose: "Renewing Section 9(f) student visa for ongoing university degree program",
    eligibility: "Enrolled international students maintaining passing grades",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "student",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "University Enrollment Clearance & Transcript of Records (TOR) ⭐",
      "CHED Study Renewal Endorsement ⭐",
      "Current Passport with Valid 9(f) Visa Stamp",
      "9(f) Renewal Application via Bureau of Immigration ⭐"
    ]
  },
  {
    id: "ph-STU-003",
    officialCode: "PH-STU-003",
    name: "Special Study Permit SSP SSP Special Study Permit SSP Student PH",
    fee: "PHP 5000 SSP PH",
    validity: "Up to 1 Year (or course duration)",
    stay: "Short-term study period",
    processing: "3 to 5 Business Days (Bureau of Immigration)",
    purpose: "Short-term non-degree courses, flight training, elementary/high school, or English language courses",
    eligibility: "Foreign students taking short courses or under 18 years enrolled in Philippine schools",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "School Acceptance Letter & CHED / DepEd School Permit ⭐",
      "Tourist Visa 9(a) Entry Stamp Copy ⭐",
      "Proof of Financial Support & Accommodation",
      "Special Study Permit (SSP) Application via BI ⭐"
    ]
  },
  {
    id: "ph-STU-004",
    officialCode: "PH-STU-004",
    name: "9f Student - Doctoral PhD 3Y Doctoral PhD 9f Student Doctoral PhD Student PH",
    fee: "PHP 10000 9f student doctoral PhD 3Y + SSP doctoral PhD + NBI doctoral PhD",
    validity: "Up to 3 Years renewable",
    stay: "Doctoral research duration",
    processing: "14 Business Days",
    purpose: "Doctoral research and PhD degree studies in Philippine research universities",
    eligibility: "PhD candidates admitted to doctoral programs in the Philippines",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Official PhD Notice of Acceptance & Research Proposal ⭐",
      "CHED PhD Track Clearance & NBI Clearance ⭐",
      "Master's Transcripts & Diplomas",
      "Section 9(f) PhD Application via BI ⭐"
    ]
  },
  {
    id: "ph-STU-005",
    officialCode: "PH-STU-005",
    name: "9f Student - Language 1Y Language 9f Student Language Student PH",
    fee: "PHP 10000 9f student language 1Y + SSP language + NBI language",
    validity: "1 Year renewable",
    stay: "Language course term",
    processing: "7 to 10 Business Days",
    purpose: "English or Filipino language immersion courses at accredited language centers",
    eligibility: "Students enrolled in accredited language schools",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Language Center Admission Letter & TESDA / CHED Approval ⭐",
      "NBI Clearance Certificate ⭐",
      "Section 9(f) Language Application via BI ⭐"
    ]
  },
  {
    id: "ph-STU-006",
    officialCode: "PH-STU-006",
    name: "SSP Authority Special Study Permit Authority Student SSP",
    fee: "PHP 0 SSP authority PH",
    validity: "Official Study Permit Document",
    stay: "Regulatory Guidance",
    processing: "Bureau of Immigration (BI)",
    purpose: "Special Study Permit (SSP) regulatory framework authority",
    eligibility: "Official Classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "student",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "BI Special Study Permit (SSP) Official Guidelines ⭐",
      "Short-Term Foreign Student Regulations (BI) ⭐"
    ]
  },

  // FAMILY 6 LIVE
  {
    id: "ph-FAM-001",
    officialCode: "PH-FAM-001",
    name: "13a Spouse Visa 1Y 13a Spouse 1Y Family Reunification - Most common Family Philippines",
    fee: "PHP 10000 13a spouse 1Y",
    validity: "1 Year Probationary (converted to Permanent 13a Residency after 1 year)",
    stay: "Indefinite residency upon conversion to permanent status",
    processing: "14 to 30 Business Days (Bureau of Immigration)",
    purpose: "Spousal immigration and family reunification for foreign nationals married to a Philippine citizen",
    eligibility: "Foreign nationals legally married to a Philippine citizen (WNP)",
    officialSource: "https://immigration.gov.ph",
    popular: true,
    highlight: true,
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "PSA Marriage Certificate (Philippine Statistics Authority) or Report of Marriage ⭐",
      "Philippine Citizen Spouse's PSA Birth Certificate & Valid Govt ID (Passport/Voter's ID) ⭐",
      "Joint Affidavit of Cohabitation & Support ⭐",
      "National Bureau of Investigation (NBI) Clearance Certificate ⭐",
      "Medical Clearance Certificate & Passport Copy (valid min 18 months)",
      "Section 13(a) Non-Quota Immigrant Application via BI ⭐"
    ],
    rawFundsBox: "13a = Non-quota immigrant spouse visa + PSA Marriage Certificate",
    rawBankBox: "Bank 3M original + PSA Marriage Certificate + Filipino spouse ID",
    warningBox: "✅ Most common family Philippines 13a Spouse 1Y family reunification - PH citizen spouse"
  },
  {
    id: "ph-FAM-002",
    officialCode: "PH-FAM-002",
    name: "13a Spouse Extension Extension 13a Spouse 1Y Extension 13a Spouse PH",
    fee: "PHP 10000 13a spouse extension 1Y",
    validity: "Conversion from 1-Year Probationary to Permanent 13(a) Immigrant Status",
    stay: "Permanent residency",
    processing: "14 Business Days",
    purpose: "Converting 1-Year Probationary 13(a) Visa to Permanent 13(a) Immigrant Residency",
    eligibility: "Probationary 13(a) visa holders completing 1 year of legal marriage in the Philippines",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "family",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Joint Affidavit of Continuous Cohabitation ⭐",
      "Updated NBI Clearance Certificate ⭐",
      "Filipino Spouse's Valid ID & Passport Copy",
      "13(a) Permanent Conversion Application via BI ⭐"
    ]
  },
  {
    id: "ph-FAM-003",
    officialCode: "PH-FAM-003",
    name: "13c Child Visa 1Y 13c Child 1Y Child Family PH",
    fee: "PHP 10000 13c child 1Y PH",
    validity: "Co-terminus with parent's 13(a) visa (or permanent)",
    stay: "Child permanent residency",
    processing: "14 Business Days",
    purpose: "Unmarried foreign child born after issuance of parent's Section 13(a) Immigrant Visa",
    eligibility: "Unmarried foreign children under 21 of Section 13(a) immigrant visa holders",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "PSA Birth Certificate of Child ⭐",
      "Parent's Section 13(a) Immigrant Visa & ACR I-Card Copy ⭐",
      "Philippine Citizen Parent's ID & Marriage Certificate",
      "Section 13(c) Application via Bureau of Immigration ⭐"
    ]
  },
  {
    id: "ph-FAM-004",
    officialCode: "PH-FAM-004",
    name: "13c Child Extension Extension 13c Child 1Y Extension 13c Child PH",
    fee: "PHP 10000 13c child extension 1Y",
    validity: "Permanent conversion / ACR I-Card renewal",
    stay: "Extended child residency",
    processing: "7 to 10 Business Days",
    purpose: "Extending or renewing ACR I-Card for 13(c) child immigrant",
    eligibility: "Existing 13(c) child visa holders",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "family",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Parent's Active 13(a) Permanent Visa Copy ⭐",
      "Child's Current ACR I-Card & Passport",
      "Extension Application via BI ⭐"
    ]
  },
  {
    id: "ph-FAM-005",
    officialCode: "PH-FAM-005",
    name: "Balikbayan Visa 1Y Balikbayan Visa 1Y Balikbayan PH",
    fee: "PHP 0 Balikbayan 1Y PH",
    validity: "1 Year visa-free stay",
    stay: "1 Year continuous stay",
    processing: "Immediate upon arrival at port of entry",
    purpose: "Privilege granted to former natural-born Filipinos and foreign spouses/children traveling together",
    eligibility: "Former Filipino citizens and foreign spouse/children traveling with former Filipino",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Proof of Former Philippine Citizenship (Old PH Passport / Birth Certificate) ⭐",
      "PSA Marriage Certificate (if foreign spouse) or Birth Certificate (if foreign child) ⭐",
      "Foreign Passport valid min 6 months ⭐",
      "Confirmed Onward Flight Ticket"
    ]
  },
  {
    id: "ph-FAM-006",
    officialCode: "PH-FAM-006",
    name: "13a Spouse - Permanent PR 13a Spouse PR Permanent Residence 13a Spouse PR PH",
    fee: "PHP 20000 13a spouse permanent PR",
    validity: "Permanent Residency status (renewed ACR I-Card every 5 years)",
    stay: "Indefinite permanent stay",
    processing: "14 to 30 Business Days",
    purpose: "Full permanent immigrant status for foreign spouses of Philippine citizens",
    eligibility: "Foreign spouses completing 1-year probationary period under 13(a)",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "1-Year Probationary 13(a) Visa Clearance Verification ⭐",
      "PSA Marriage Certificate & Joint Affidavit of Marriage ⭐",
      "NBI Clearance & BIR Tax Number",
      "13(a) Permanent Immigrant Application via BI ⭐"
    ]
  },

  // PR 4 LIVE + SPECIAL 16 LIVE = 20
  {
    id: "ph-PR-001",
    officialCode: "PH-PR-001",
    name: "13 Quota Visa 1Y 13 Quota 1Y - PR Philippines - 13 Quota PR",
    fee: "PHP 20000 13 quota 1Y PR",
    validity: "Permanent Residency status (Quota of 50 per nationality per year)",
    stay: "Indefinite permanent residency",
    processing: "30 to 60 Business Days (Bureau of Immigration Quota Desk)",
    purpose: "Permanent residency for foreign nationals whose home country grants reciprocal immigration rights to Filipinos",
    eligibility: "Citizens of countries with reciprocal visa agreements with the Philippines (limit 50 per country/year)",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "Proof of Reciprocity & Country Quota Eligibility ⭐",
      "National Bureau of Investigation (NBI) Clearance ⭐",
      "Proof of Financial Independence / Capital Investment (min USD 50,000) ⭐",
      "Medical Clearance & Passport Copy (valid min 18 months)",
      "Section 13 Quota Immigrant Visa Application via BI ⭐"
    ]
  },
  {
    id: "ph-PR-002",
    officialCode: "PH-PR-002",
    name: "13a Spouse Permanent Residence 13a Spouse Permanent Residence PR PH",
    fee: "PHP 20000 13a spouse permanent residence PR",
    validity: "Permanent Residency status",
    stay: "Indefinite permanent stay",
    processing: "14 to 30 Business Days",
    purpose: "Permanent immigrant residency for spouses of Philippine citizens",
    eligibility: "Foreign spouses of Philippine citizens",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "PSA Marriage Certificate & Citizen Spouse KTP/ID ⭐",
      "NBI Clearance & Joint Support Affidavit ⭐",
      "13(a) Permanent Residency Submission via BI ⭐"
    ]
  },
  {
    id: "ph-PR-003",
    officialCode: "PH-PR-003",
    name: "SIRV PR Special Investor Resident Visa PR SIRV PR PH",
    fee: "USD 75k SIRV PR + Investment USD 75k PR + BOI PR",
    validity: "Permanent Residency status (as long as USD 75k investment is active)",
    stay: "Indefinite permanent residency",
    processing: "30 Business Days (BOI + BI)",
    purpose: "Permanent investor residency under Board of Investments framework",
    eligibility: "Foreign investors remitting and holding USD 75,000 in Philippine enterprise/stocks",
    officialSource: "https://boi.gov.ph",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "BOI Investment Certificate verifying active USD 75,000 investment ⭐",
      "NBI Clearance & Medical Report ⭐",
      "SIRV Permanent Status Application via BOI ⭐"
    ]
  },
  {
    id: "ph-PR-004",
    officialCode: "PH-PR-004",
    name: "SRRV PR Special Resident Retiree Visa PR SRRV PR PH",
    fee: "USD 1400 SRRV PR + Deposit USD 10k 20k 50k PR + PRA PR",
    validity: "Lifetime Permanent Residency status",
    stay: "Indefinite lifetime residency",
    processing: "15 to 30 Business Days (PRA + BI)",
    purpose: "Lifetime retirement residency under Philippine Retirement Authority framework",
    eligibility: "Foreign retirees maintaining qualifying time deposit in PRA bank",
    officialSource: "https://pra.gov.ph",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "PRA Time Deposit Receipt (USD 10k/20k/50k) in DBP Bank ⭐",
      "NBI Clearance & PRA Health Clearance ⭐",
      "SRRV Permanent Residency Application via PRA ⭐"
    ]
  },
  {
    id: "ph-SPE-001",
    officialCode: "PH-SPE-001",
    name: "SRRV Extension Extension SRRV PR Extension SRRV PR PH",
    fee: "USD 1400 SRRV PR extension 1Y + Deposit USD 10k 20k 50k extension SRRV PR",
    validity: "Annual PRA Card Renewal",
    stay: "Continued SRRV lifetime residency",
    processing: "3 Business Days",
    purpose: "Annual membership renewal for SRRV retirees",
    eligibility: "SRRV card holders",
    officialSource: "https://pra.gov.ph",
    categoryCode: "pr",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "PRA Time Deposit Maintenance Verification ⭐",
      "SRRV Card Renewal Application via PRA ⭐"
    ]
  },
  {
    id: "ph-SPE-002",
    officialCode: "PH-SPE-002",
    name: "Diplomat Visa 47a2 Diplomat Visa 47a2 Diplomat Visa Diplomat PH",
    fee: "PHP 0 Diplomat 47a2 PH",
    validity: "Diplomatic posting duration",
    stay: "Diplomatic assignment",
    processing: "3 to 5 Days (DFA Protocol)",
    purpose: "Foreign diplomats posted to foreign embassies in Manila under Section 47(a)(2)",
    eligibility: "Diplomatic passport holders",
    officialSource: "https://dfa.gov.ph",
    categoryCode: "business",
    record_type: "DIPLOMAT_VISA",
    docs: [
      "Diplomatic Note Verbale from Foreign Ministry ⭐",
      "Diplomatic Passport Copy ⭐",
      "DFA Protocol Clearance ⭐"
    ]
  },
  {
    id: "ph-SPE-003",
    officialCode: "PH-SPE-003",
    name: "Official Visa 47a2 Official Visa 47a2 Official Visa Official PH",
    fee: "PHP 0 Official 47a2 PH",
    validity: "Official mission duration",
    stay: "Official posting period",
    processing: "3 to 5 Days (DFA Protocol)",
    purpose: "Foreign government officials on official state missions under Section 47(a)(2)",
    eligibility: "Official passport holders",
    officialSource: "https://dfa.gov.ph",
    categoryCode: "business",
    record_type: "OFFICIAL_VISA",
    docs: [
      "Official Note Verbale ⭐",
      "Official Passport Copy ⭐",
      "DFA Official Clearance ⭐"
    ]
  },
  {
    id: "ph-SPE-004",
    officialCode: "PH-SPE-004",
    name: "Courtesy Visa 47a2 Courtesy Visa 47a2 Courtesy Visa Courtesy PH",
    fee: "PHP 0 Courtesy 47a2 PH",
    validity: "As approved on courtesy basis",
    stay: "Approved courtesy duration",
    processing: "3 to 5 Days (DFA / BI)",
    purpose: "Visiting dignitaries and guests of Philippine Government under 47(a)(2)",
    eligibility: "Individuals granted courtesy entry privileges",
    officialSource: "https://dfa.gov.ph",
    categoryCode: "business",
    record_type: "COURTESY_VISA",
    docs: [
      "Official Government Invitation ⭐",
      "Passport Copy & Courtesy Request Letter ⭐"
    ]
  },
  {
    id: "ph-SPE-005",
    officialCode: "PH-SPE-005",
    name: "Seaman Visa 9c Seaman Visa 9c Seaman Visa Seaman PH",
    fee: "PHP 3300 Seaman 9c PH",
    validity: "Up to 14 Days",
    stay: "Port crew layover",
    processing: "Immediate at Port Control",
    purpose: "Maritime vessel crew and seafarers entering Philippine seaports under Section 9(c)",
    eligibility: "Active commercial maritime crew",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "tourist",
    record_type: "CREW_VISA",
    docs: [
      "Valid Seaman's Book & Vessel Manifest ⭐",
      "Port Clearance & Section 9(c) Seaman Visa Application ⭐"
    ]
  },
  {
    id: "ph-SPE-006",
    officialCode: "PH-SPE-006",
    name: "Journalist Visa 9c Journalist Visa 9c Journalist PH",
    fee: "PHP 3300 Journalist 9c PH",
    validity: "Duration of media assignment",
    stay: "Assignment period",
    processing: "7 Business Days (IPC / DFA Clearance)",
    purpose: "Foreign journalists and news correspondents covering events in the Philippines",
    eligibility: "Accredited foreign press representatives",
    officialSource: "https://dfa.gov.ph",
    categoryCode: "business",
    record_type: "JOURNALIST_VISA",
    docs: [
      "International Press Center (IPC) Accreditation Clearance ⭐",
      "Media Employer Assignment Letter ⭐",
      "Journalist Visa Application via DFA / BI ⭐"
    ]
  },
  {
    id: "ph-SPE-007",
    officialCode: "PH-SPE-007",
    name: "Missionary Visa 9g Missionary Visa 9g Missionary PH",
    fee: "PHP 10000 Missionary 9g PH",
    validity: "1 Year renewable",
    stay: "Missionary service duration",
    processing: "14 Business Days (BI)",
    purpose: "Foreign religious missionaries, priests, and pastors assigned to registered Philippine religious bodies",
    eligibility: "Missionaries sponsored by registered Philippine religious organization",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "business",
    record_type: "SPECIAL_VISA",
    docs: [
      "Religious Organization SEC Registration & Guarantee Letter ⭐",
      "Missionary Assignment Letter & NBI Clearance ⭐",
      "Section 9(g) Missionary Application via BI ⭐"
    ]
  },
  {
    id: "ph-SPE-008",
    officialCode: "PH-SPE-008",
    name: "PEZA Visa PEZA Visa PEZA Visa PEZA PH",
    fee: "PHP 10000 PEZA PH",
    validity: "1 Year to 3 Years renewable",
    stay: "PEZA corporate assignment",
    processing: "10 to 14 Business Days (PEZA + BI)",
    purpose: "Special work visa for foreign executives and technicians employed by PEZA-registered ecozone enterprises",
    eligibility: "Expatriates employed by PEZA (Philippine Economic Zone Authority) registered firms",
    officialSource: "https://peza.gov.ph",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "PEZA Certificate of Registration & Endorsement Letter ⭐",
      "Employment Contract & PEZA Visa Application ⭐"
    ]
  },
  {
    id: "ph-SPE-009",
    officialCode: "PH-SPE-009",
    name: "Special Economic Zone Visa SEZ SEZ Visa SEZ PH",
    fee: "PHP 10000 SEZ PH",
    validity: "1 Year to 3 Years renewable",
    stay: "SEZ employment duration",
    processing: "10 to 14 Business Days (Subic / Clark / CEZA)",
    purpose: "Work visa for expatriates employed in Subic, Clark, or CEZA special economic zones",
    eligibility: "Employees of registered SEZ enterprises",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "SEZ Authority Endorsement (SBMA / CDC / CEZA) ⭐",
      "Employment Contract & SEZ Work Visa Application ⭐"
    ]
  },
  {
    id: "ph-SPE-010",
    officialCode: "PH-SPE-010",
    name: "47a2 Visa 47a2 Visa 47a2 Visa 47a2 PH",
    fee: "PHP 0 47a2 PH",
    validity: "Contract duration",
    stay: "Special government project duration",
    processing: "10 to 14 Business Days (DOJ)",
    purpose: "Special non-immigrant visa issued under Section 47(a)(2) for government contractors / international scholars",
    eligibility: "Foreigners employed in oil exploration, government projects, or international missions",
    officialSource: "https://doj.gov.ph",
    categoryCode: "business",
    record_type: "SPECIAL_VISA",
    docs: [
      "Department of Justice (DOJ) 47(a)(2) Indorsement ⭐",
      "Government Contract / Project Endorsement ⭐"
    ]
  },
  {
    id: "ph-SPE-011",
    officialCode: "PH-SPE-011",
    name: "Treaty Trader Visa 9d Treaty Trader Visa 9d Treaty Trader PH",
    fee: "PHP 3300 Treaty trader 9d PH",
    validity: "1 Year renewable",
    stay: "Treaty trade operations",
    processing: "14 Business Days",
    purpose: "Treaty traders and investors from countries maintaining commerce treaties with the Philippines (US, Germany, Japan)",
    eligibility: "Citizens of treaty trader countries conducting substantial commercial trade",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "business",
    record_type: "TREATY_TRADER_VISA",
    docs: [
      "Proof of Substantial Bilateral Trade / Commerce ⭐",
      "Treaty Trader Enterprise SEC Registration ⭐",
      "Section 9(d) Treaty Trader Application via Embassy ⭐"
    ]
  },
  {
    id: "ph-SPE-012",
    officialCode: "PH-SPE-012",
    name: "Balikbayan Extension Extension Balikbayan 1Y Extension Balikbayan PH",
    fee: "PHP 0 Balikbayan extension 1Y PH",
    validity: "1 Year extension",
    stay: "Extended Balikbayan stay",
    processing: "3 Business Days (BI)",
    purpose: "Extending Balikbayan 1-year stay for former Filipinos & family",
    eligibility: "Balikbayan visa holders",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "family",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Proof of Former Citizenship / Marriage Certificate ⭐",
      "Balikbayan Extension Application via BI ⭐"
    ]
  },
  {
    id: "ph-SPE-013",
    officialCode: "PH-SPE-013",
    name: "Long Stay Visitor Visa Extension LSVVE LSVVE Long Stay Visitor Visa Extension PH",
    fee: "PHP 10000 LSVVE PH",
    validity: "6 Months extension block",
    stay: "Extended long-term tourist stay up to 36 months",
    processing: "3 Business Days (BI)",
    purpose: "6-month bulk extension for long-stay foreign tourists in the Philippines",
    eligibility: "Foreign tourists staying extended periods in the Philippines",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "tourist",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "LSVVE Request Form & Passport with valid entry stamp ⭐",
      "Payment Receipt for LSVVE Fee ⭐"
    ]
  },
  {
    id: "ph-SPE-014",
    officialCode: "PH-SPE-014",
    name: "DNV Extension Extension DNV 1Y Extension DNV PH",
    fee: "PHP 10000 DNV extension 1Y + Income PHP 120k/month extension DNV",
    validity: "1 Year extension",
    stay: "Continued digital nomad stay",
    processing: "7 Business Days",
    purpose: "Extending Digital Nomad Visa for remote workers",
    eligibility: "DNV holders maintaining PHP 120k/month remote income",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "tourist",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Updated Remote Income Proof (PHP 120,000+/month) ⭐",
      "DNV Extension Application via BI ⭐"
    ]
  },
  {
    id: "ph-SPE-015",
    officialCode: "PH-SPE-015",
    name: "SIRV Extension Extension SIRV Extension SIRV PH",
    fee: "USD 75k SIRV extension + Investment USD 75k extension SIRV",
    validity: "Annual BOI Clearance Renewal",
    stay: "Continued SIRV investment residency",
    processing: "7 Business Days",
    purpose: "Annual verification of maintained USD 75,000 investment for SIRV holders",
    eligibility: "SIRV card holders",
    officialSource: "https://boi.gov.ph",
    categoryCode: "business",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "BOI Investment Audit & Stock Ownership Verification ⭐",
      "SIRV Extension Application via BOI ⭐"
    ]
  },
  {
    id: "ph-SPE-016",
    officialCode: "PH-SPE-016",
    name: "13 Quota Extension Extension 13 Quota 1Y Extension 13 Quota PH",
    fee: "PHP 20000 13 quota extension 1Y PR",
    validity: "5-Year ACR I-Card Renewal",
    stay: "Continued Section 13 Quota Permanent Residency",
    processing: "7 Business Days",
    purpose: "Renewing ACR I-Card for Section 13 Quota Immigrants",
    eligibility: "13 Quota PR holders",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "pr",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Proof of Maintained Quota Immigrant Status & Tax Return ⭐",
      "ACR I-Card Renewal Application via BI ⭐"
    ]
  },

  // SUPPORTING 14 + LEGACY 10 = 24 SUPPORTING/LEGACY ENTRIES
  {
    id: "ph-SUP-001",
    officialCode: "PH-SUP-001",
    name: "BI Authority Bureau Immigration Authority Visa BI",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Bureau of Immigration Philippines (BI) - Official immigration authority",
    eligibility: "Official Classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Bureau of Immigration Authority Reference (immigration.gov.ph) ⭐"]
  },
  {
    id: "ph-SUP-002",
    officialCode: "PH-SUP-002",
    name: "DOLE Authority Department Labor Employment Authority Work DOLE",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Department of Labor and Employment (DOLE) - AEP work permit authority",
    eligibility: "Official Classification",
    officialSource: "https://dole.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["DOLE Authority Reference (dole.gov.ph) ⭐"]
  },
  {
    id: "ph-SUP-003",
    officialCode: "PH-SUP-003",
    name: "PRA Authority Philippine Retirement Authority Authority Retirement PRA",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Philippine Retirement Authority (PRA) - SRRV retiree visa agency",
    eligibility: "Official Classification",
    officialSource: "https://pra.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["PRA Authority Reference (pra.gov.ph) ⭐"]
  },
  {
    id: "ph-SUP-004",
    officialCode: "PH-SUP-004",
    name: "BOI Authority Board Investments Authority Investor BOI",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Board of Investments (BOI) - SIRV investor visa agency",
    eligibility: "Official Classification",
    officialSource: "https://boi.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["BOI Authority Reference (boi.gov.ph) ⭐"]
  },
  {
    id: "ph-SUP-005",
    officialCode: "PH-SUP-005",
    name: "9a Authority 9a Tourist Visa Authority Tourist 9a",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Section 9(a) Temporary Visitor Visa classification framework",
    eligibility: "Official Classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Section 9(a) Framework Reference ⭐"]
  },
  {
    id: "ph-SUP-006",
    officialCode: "PH-SUP-006",
    name: "9g Authority 9g Work Visa Authority Work 9g",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Section 9(g) Pre-Arranged Employment Visa classification framework",
    eligibility: "Official Classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Section 9(g) Framework Reference ⭐"]
  },
  {
    id: "ph-SUP-007",
    officialCode: "PH-SUP-007",
    name: "9d Authority 9d Business Visa Authority Business 9d",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Section 9(d) Commercial / Treaty Trader Visa classification framework",
    eligibility: "Official Classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Section 9(d) Framework Reference ⭐"]
  },
  {
    id: "ph-SUP-008",
    officialCode: "PH-SUP-008",
    name: "SRRV Authority Special Resident Retiree Visa Authority Retirement SRRV",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "SRRV Retirement Visa classification framework",
    eligibility: "Official Classification",
    officialSource: "https://pra.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["SRRV Framework Reference ⭐"]
  },
  {
    id: "ph-SUP-009",
    officialCode: "PH-SUP-009",
    name: "SIRV Authority Special Investor Resident Visa Authority Investor SIRV",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "SIRV Investor Visa classification framework",
    eligibility: "Official Classification",
    officialSource: "https://boi.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["SIRV Framework Reference ⭐"]
  },
  {
    id: "ph-SUP-010",
    officialCode: "PH-SUP-010",
    name: "AEP Authority Alien Employment Permit Authority Work AEP",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Alien Employment Permit (AEP) framework",
    eligibility: "Official Classification",
    officialSource: "https://dole.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["AEP Framework Reference ⭐"]
  },
  {
    id: "ph-SUP-011",
    officialCode: "PH-SUP-011",
    name: "SWP Authority Special Work Permit Authority Work SWP",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Special Work Permit (SWP) framework",
    eligibility: "Official Classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["SWP Framework Reference ⭐"]
  },
  {
    id: "ph-SUP-012",
    officialCode: "PH-SUP-012",
    name: "13a Authority 13a Spouse Visa Authority Family 13a",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Section 13(a) Non-Quota Immigrant Spouse Visa framework",
    eligibility: "Official Classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Section 13(a) Framework Reference ⭐"]
  },
  {
    id: "ph-SUP-013",
    officialCode: "PH-SUP-013",
    name: "9f Authority 9f Student Visa Authority Student 9f",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Section 9(f) Student Visa framework",
    eligibility: "Official Classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Section 9(f) Framework Reference ⭐"]
  },
  {
    id: "ph-SUP-014",
    officialCode: "PH-SUP-014",
    name: "DNV Authority Digital Nomad Visa Authority Digital Nomad DNV",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Digital Nomad Visa framework authority",
    eligibility: "Official Classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Digital Nomad Visa Framework Reference ⭐"]
  },
  {
    id: "ph-LEG-001",
    officialCode: "PH-LEG-001",
    name: "Legacy 9a 21 Days Old System Closed Replaced by New 9a 59 Days ph embassy",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 21-day tourist visa (upgraded to 59-day 9a visa)",
    eligibility: "Archived classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "ph-LEG-002",
    officialCode: "PH-LEG-002",
    name: "Legacy 9d 21 Days Old System Closed Replaced by New 9d 59 Days ph embassy",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 21-day business visa (upgraded to 59-day 9d business framework)",
    eligibility: "Archived classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "ph-LEG-003",
    officialCode: "PH-LEG-003",
    name: "Legacy 9g 1Y Old System Closed Replaced by New 9g 1Y 2Y 3Y AEP BI DOLE",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 1-year 9g work visa (upgraded to multi-year 9g AEP system)",
    eligibility: "Archived classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "ph-LEG-004",
    officialCode: "PH-LEG-004",
    name: "Legacy SWP 2M Old System Closed Replaced by New SWP 3M 6M BI",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 2-month SWP (upgraded to 3-6 month SWP framework)",
    eligibility: "Archived classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "ph-LEG-005",
    officialCode: "PH-LEG-005",
    name: "Legacy SRRV Classic Old System Closed Replaced by New SRRV Deposit USD 10k 20k 50k PRA",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy SRRV rules (upgraded to current PRA deposit options)",
    eligibility: "Archived classification",
    officialSource: "https://pra.gov.ph",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "ph-LEG-006",
    officialCode: "PH-LEG-006",
    name: "Legacy 9f 6M Old System Closed Replaced by New 9f 1Y SSP NBI BI",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 6-month student visa (upgraded to 1-year 9f student visa)",
    eligibility: "Archived classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "ph-LEG-007",
    officialCode: "PH-LEG-007",
    name: "Legacy 13a 6M Old System Closed Replaced by New 13a 1Y BI",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 6-month spouse visa (upgraded to 1-year probationary 13a)",
    eligibility: "Archived classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "ph-LEG-008",
    officialCode: "PH-LEG-008",
    name: "Legacy 13 Quota 6M Old System Closed Replaced by New 13 Quota 1Y PR",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy quota visa rules (upgraded to current Section 13 Quota framework)",
    eligibility: "Archived classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "ph-LEG-009",
    officialCode: "PH-LEG-009",
    name: "Legacy SIRV USD 50k Old System Closed Replaced by New SIRV USD 75k BOI",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy USD 50,000 SIRV threshold (upgraded to USD 75,000 BOI framework)",
    eligibility: "Archived classification",
    officialSource: "https://boi.gov.ph",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "ph-LEG-010",
    officialCode: "PH-LEG-010",
    name: "Legacy Balikbayan 6M Old System Closed Replaced by New Balikbayan 1Y BI",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 6-month Balikbayan pass (upgraded to 1-year Balikbayan privilege)",
    eligibility: "Archived classification",
    officialSource: "https://immigration.gov.ph",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  }
];

export const PHILIPPINES_68_VISAS: CountryVisas = {
  tourist: [],
  business: [],
  work: [],
  student: [],
  family: [],
  pr: []
};

// Populate PHILIPPINES_68_VISAS with dynamically generated microDetails
RAW_PH_VISAS.forEach(visa => {
  const cat = visa.categoryCode as keyof CountryVisas;
  if (!PHILIPPINES_68_VISAS[cat]) {
    PHILIPPINES_68_VISAS[cat] = [];
  }
  
  const micro = getPhilippinesMicroDetails(visa.officialCode || visa.id, cat, visa.name);
  const enrichedVisa: VisaItem = {
    ...visa,
    microDetails: micro
  };
  
  PHILIPPINES_68_VISAS[cat].push(enrichedVisa);
});
