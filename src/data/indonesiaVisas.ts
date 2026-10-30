import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getIndonesiaMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "e-VOA Tourist / Visa C316 requires proof of sufficient funds (USD 2,000 or equivalent bank balance in IDR / foreign currency). Directorate General of Immigration Indonesia (Direktorat Jenderal Imigrasi) / molina.imigrasi.go.id requires 3 months bank statements.";
  let fundsBankMonths = "Last 3 months personal bank statements stamped by bank showing liquid USD 2,000+ / IDR equivalent balance.";
  let fundsSudden = "❌ Sudden cash deposits right before submitting application on molina.imigrasi.go.id are flagged. Maintaining a steady balance over 3 months ensures fast approval.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement showing USD 2,000+ liquid balance. ❌ Galat: Sudden cash deposit 24 hours prior to e-VOA submission.";

  let itrYears = "Tax returns or income proof for past 2–3 years for KITAS (C312 Work / C313 Investor) or KITAP Permanent Residency applicants.";
  let itrMatch = "Reported income must reconcile with personal bank credits and Ministry of Manpower (Kemnaker) RPTKA / IMTA work permit contract.";
  let itrNoItr = "Not required for short-term 30-day e-VOA tourist or university student pass holders.";

  let bankMonths = "Last 3 months bank statements.";
  let bankReg = "Regular salary credits or steady corporate revenue.";
  let bankFd = "Fixed deposits required for Second Home Visa (IDR 2 Billion FD) and Golden Visa (USD 350,000–700,000 capital investment / FD).";
  let bankSource = "Salary, corporate dividends, verified offshore income, or parental sponsorship.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('kitas') || lowerCode.includes('c312') || lowerCode.includes('c313') || lowerCode.includes('imta') || lowerCode.includes('rptka')) {
    fundsMin = "KITAS Work (Index C312 / C313) requires Ministry of Manpower (Kemnaker) RPTKA (Expatriate Placement Plan) + IMTA Work Permit approval + DPKK compensation fund payment ($1,200/year). Golden Visa requires USD 350,000–700,000 investment.";
    fundsBankMonths = "RPTKA & IMTA approval from Kemnaker, Indonesian sponsor company contract, and 3 months bank statements.";
    fundsSudden = "KITAS Work applications must be sponsored by an active Indonesian PT PMA or local PT registered in the Online Single Submission (OSS) portal.";
    fundsEx = "✅ Sahi: Kemnaker RPTKA approval + DPKK receipt + 1-2 Year KITAS C312. ❌ Galat: Submitting KITAS without RPTKA or OSS company registration.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('c316')) {
    fundsMin = "KITAS Student (Index C316) requires official study permit endorsement from Ministry of Education, Culture, Research and Technology (Kemendikbudristek) + university admission + living funds proof (USD 2,000+).";
    fundsBankMonths = "3 months bank statements of student or parent sponsor showing min USD 2,000.";
    fundsSudden = "Parental guarantee letter and birth certificate required if sponsored by parents.";
    fundsEx = "✅ Sahi: Kemendikbudristek recommendation letter + university acceptance + USD 2,000 bank proof. ❌ Galat: Unregistered institution or missing Kemendikbudristek approval.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('c317')) {
    fundsMin = "KITAS Family (Index C317) requires primary KITAS holder or Indonesian citizen spouse sponsorship + legalized marriage/birth certificates by Ministry of Law and Human Rights (Kemenkumham). Fee IDR 2,000,000.";
    fundsBankMonths = "Sponsor's KITAS / KTP (Indonesian ID) + past 3 salary slips and bank statements.";
    fundsSudden = "Foreign marriage and birth certificates must be apostilled/attested by Ministry of Foreign Affairs & Kemenkumham.";
    fundsEx = "✅ Sahi: Apostilled marriage certificate + sponsor KTP/KITAS + 1-2 Year KITAS C317. ❌ Galat: Unattested marriage certificate.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('c2') || lowerCode.includes('c11')) {
    fundsMin = "Visa Business (Index C2 Single 60D / Index C11 Multiple 1Y) requires invitation letter from registered Indonesian company (PT PMA / PT) + NIB (Business Identification Number) & Kemenkumham Akta Pendirian.";
    fundsBankMonths = "3 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Indonesian company must be actively registered in OSS & Kemenkumham database.";
    fundsEx = "✅ Sahi: Official NIB company registration + Kemenkumham approval + molina.imigrasi.go.id submission. ❌ Galat: Unregistered sponsor company.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('kitap') || lowerCode.includes('second home') || lowerCode.includes('golden')) {
    fundsMin = "KITAP Permanent Residence (5 Years renewable) requires 3+ consecutive years on KITAS (Work, Spouse, or Investor) or Second Home Visa / Golden Visa. Second Home requires IDR 2 Billion Fixed Deposit; Golden Visa requires USD 350,000–700,000 investment.";
    fundsBankMonths = "3 years continuous KITAS history, tax clearance (NPWP), and IDR 2 Billion / USD 350k capital proof in Indonesian bank.";
    fundsSudden = "Capital investment must be placed in a state-owned (BUMN) or licensed commercial bank in Indonesia.";
    fundsEx = "✅ Sahi: 3 years continuous KITAS + NPWP tax clearance + 5-Year KITAP PR approval. ❌ Galat: Gaps in continuous KITAS residence.";
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

const RAW_ID_VISAS: VisaItem[] = [
  // TOURIST 14 LIVE
  {
    id: "id-TOU-001",
    officialCode: "ID-TOU-001",
    name: "e-VOA Tourist 30 Days e-VOA Tourist 30 Days - Most common Tourist Indonesia",
    fee: "IDR 500k e-VOA tourist 30 days",
    validity: "30 days single entry",
    stay: "Max 30 days (extendable once for 30 days)",
    processing: "Immediate to 24 Hours (molina.imigrasi.go.id)",
    purpose: "Tourism, vacation, leisure, visiting friends/family in Indonesia",
    eligibility: "Citizens of 90+ eligible countries traveling to Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    popular: true,
    highlight: true,
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport (6 months validity, 1 blank page) ⭐",
      "Digital Passport Photo (4x6cm white background)",
      "Confirmed Return Flight Ticket ⭐",
      "Hotel Reservation Confirmation",
      "Proof of Bank Balance (USD 2,000 or equivalent) ⭐",
      "Employment Certificate or Cover Letter",
      "e-VOA Application via Official Portal (molina.imigrasi.go.id) ⭐"
    ],
    rawFundsBox: "USD 2000 = Bank 3M USD 2000 = e-VOA molina.imigrasi.go.id",
    rawBankBox: "Bank 3M USD 2000 original + Employment + e-VOA",
    warningBox: "✅ Most common tourist Indonesia e-VOA Tourist 30 Days - molina.imigrasi.go.id"
  },
  {
    id: "id-TOU-002",
    officialCode: "ID-TOU-002",
    name: "e-VOA Tourist Extension Extension e-VOA Tourist 30 Days Extension e-VOA Tourist ID",
    fee: "IDR 500k e-VOA tourist extension 30 days",
    validity: "30 days extension",
    stay: "Extended total stay up to 60 days",
    processing: "1 to 3 Business Days (Online via molina.imigrasi.go.id / Local Immigration Office)",
    purpose: "Extending tourist stay in Indonesia for an additional 30 days",
    eligibility: "Current e-VOA 30 days pass holders in Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Extension Reason Request ⭐",
      "Current Passport with Original e-VOA Stamp ⭐",
      "Confirmed Onward or Revised Flight Ticket ⭐",
      "Payment Receipt IDR 500,000",
      "Online Extension Submission via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-TOU-003",
    officialCode: "ID-TOU-003",
    name: "Visa C316 Tourist 60 Days 180 Days Tourist C316 60 Days 180 Days",
    fee: "IDR 2000k Visa C316 tourist 60 days 180 days",
    validity: "60 Days to 180 Days single/multiple entry",
    stay: "Max 60 days per entry (extendable up to 180 days)",
    processing: "3 to 5 Business Days (molina.imigrasi.go.id)",
    purpose: "Long-term tourism, extended holiday, cultural exploration in Indonesia",
    eligibility: "Foreign tourists seeking stay longer than 30 days",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport (6 months validity) ⭐",
      "Digital Passport Photo 4x6cm",
      "Confirmed Return Flight Ticket ⭐",
      "Hotel Reservation or Lease Agreement",
      "Bank Statement (last 3 months, min USD 2,000) ⭐",
      "Employment Letter / Cover Letter",
      "Visa C316 Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-TOU-004",
    officialCode: "ID-TOU-004",
    name: "Visa C316 Tourist Extension Extension Visa C316 Tourist 60 Days Extension Visa C316 Tourist ID",
    fee: "IDR 2000k Visa C316 tourist extension 60 days",
    validity: "60 days extension (up to 180 days total)",
    stay: "Extended stay duration",
    processing: "3 to 5 Business Days",
    purpose: "Extending Visa C316 long-term tourist stay in Indonesia",
    eligibility: "Current Visa C316 pass holders",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Extension Reason Letter & Justification ⭐",
      "Current Passport with C316 Stamp ⭐",
      "Confirmed Revised Return Flight Ticket ⭐",
      "Bank Statement showing living funds",
      "C316 Extension Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-TOU-005",
    officialCode: "ID-TOU-005",
    name: "Visa Free 30 Days Visa Free 30 Days Visa Free ID",
    fee: "IDR 0 Visa free 30 days ID",
    validity: "30 days non-extendable",
    stay: "Max 30 days",
    processing: "Immediate upon arrival at airport/port",
    purpose: "Tourism for citizens of ASEAN member countries",
    eligibility: "Holders of passports from ASEAN member states (Singapore, Malaysia, Thailand, etc.)",
    officialSource: "https://www.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "VISA_WAIVER",
    docs: [
      "Valid ASEAN Passport (minimum 6 months validity) ⭐",
      "Confirmed Return Flight Ticket within 30 days ⭐",
      "Hotel Accommodation Details",
      "Sufficient Living Funds Proof"
    ]
  },
  {
    id: "my-TOU-006",
    officialCode: "ID-TOU-006",
    name: "Second Home Visa 5Y 10Y Second Home Visa 5Y 10Y Second Home ID",
    fee: "IDR 3000k Second home visa 5Y 10Y + Fixed deposit IDR 2B",
    validity: "5 Years to 10 Years renewable visa",
    stay: "Long-term non-working residency",
    processing: "14 to 30 Business Days (Direktorat Jenderal Imigrasi)",
    purpose: "Long-term residency in Indonesia for retirees, investors, and high-net-worth foreign individuals",
    eligibility: "Foreigners placing IDR 2,000,000,000 (approx. USD 130k) in Indonesian state bank or luxury real estate",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "RETIREMENT_VISA",
    docs: [
      "Proof of Capital Commitment: Fixed Deposit Receipt IDR 2,000,000,000 in Indonesian Bank ⭐",
      "Proof of Luxury Property / Real Estate Ownership in Indonesia (alternative) ⭐",
      "Valid Passport (minimum 36 months validity) ⭐",
      "Curriculum Vitae & Personal Background Statement",
      "Health Insurance Coverage in Indonesia",
      "Second Home Visa Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-TOU-007",
    officialCode: "ID-TOU-007",
    name: "Second Home Visa Extension Extension Second Home Visa 5Y Extension Second Home ID",
    fee: "IDR 3000k Second home visa extension 5Y + Fixed deposit IDR 2B extension Second home",
    validity: "5 Years extension",
    stay: "Continued long-term residency",
    processing: "14 Business Days",
    purpose: "Extending Second Home Visa for an additional 5-year block",
    eligibility: "Existing Second Home Visa holders maintaining IDR 2B capital deposit",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Verification of Maintained Fixed Deposit (IDR 2,000,000,000) in Indonesian Bank ⭐",
      "Current Passport Copy & Second Home Visa Sticker ⭐",
      "Health Insurance Renewal Verification",
      "Extension Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-TOU-008",
    officialCode: "ID-TOU-008",
    name: "Transit Visa 7 Days Transit Visa 7 Days Transit ID",
    fee: "IDR 500k Transit ID",
    validity: "7 Days single entry",
    stay: "Max 7 days",
    processing: "Immediate at Airport Transit Desk (Soekarno-Hatta CGK / Ngurah Rai DPS)",
    purpose: "Short transit through Indonesia to a third country",
    eligibility: "Transiting foreign passengers with confirmed onward international travel",
    officialSource: "https://www.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "TRANSIT_VISA",
    docs: [
      "Valid Passport (6 months validity) ⭐",
      "Confirmed Onward Flight Ticket to 3rd Country within 7 days ⭐",
      "Valid Visa for Destination Country (if required) ⭐",
      "Transit Visa Application at Immigration Counter ⭐"
    ]
  },
  {
    id: "id-TOU-009",
    officialCode: "ID-TOU-009",
    name: "Visa C316 Tourist - Medical Treatment 60 Days Medical Treatment Visa C316 Medical ID",
    fee: "IDR 2000k Visa C316 medical treatment ID",
    validity: "60 days single/multiple entry",
    stay: "Max 60 days (extendable)",
    processing: "3 to 5 Business Days",
    purpose: "Medical consultation, surgery, or specialized healthcare treatment at Indonesian hospitals",
    eligibility: "Patients seeking healthcare in Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "MEDICAL_VISA",
    docs: [
      "Hospital Appointment & Invitation Letter from registered Indonesian Hospital ⭐",
      "Medical Certificate & Doctor's Treatment Plan ⭐",
      "Hospital Financial Guarantee & Advance Payment Receipt",
      "Passport 6M + Bank Statement 3M (USD 2,000+)",
      "Visa C316 Medical Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-TOU-010",
    officialCode: "ID-TOU-010",
    name: "Visa C316 Tourist - Family Friends Visit 60 Days Family Friends Visit Visa C316 Family Friends ID",
    fee: "IDR 2000k Visa C316 family friends visit ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days",
    purpose: "Visiting family members, relatives, or friends residing in Indonesia",
    eligibility: "Visitors with sponsor invitation in Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Invitation Letter from Host / Sponsor in Indonesia ⭐",
      "Host's Indonesian KTP ID Card or KITAS/KITAP Copy ⭐",
      "Proof of Relationship / Acquaintance",
      "Host Sponsorship Declaration & Address Proof",
      "Applicant Passport + Photos + Bank Statement 3M",
      "Visa C316 Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-TOU-011",
    officialCode: "ID-TOU-011",
    name: "Visa C316 Tourist - Yacht 60 Days Yacht Visa C316 Yacht ID",
    fee: "IDR 2000k Visa C316 yacht ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days",
    purpose: "Cruising Indonesian territorial waters on private yacht or vessel",
    eligibility: "Yacht owners, charter crew, and maritime tourists",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Vessel / Yacht Registration Certificate ⭐",
      "Indonesian Port Clearance & Customs Approval ⭐",
      "Crew & Passenger Manifest",
      "Passport 6M + Maritime Insurance Policy",
      "Visa C316 Yacht Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-TOU-012",
    officialCode: "ID-TOU-012",
    name: "e-VOA Tourist - Conference 30 Days Conference e-VOA Conference ID",
    fee: "IDR 500k e-VOA conference ID",
    validity: "30 days single entry",
    stay: "Max 30 days",
    processing: "1 to 2 Business Days",
    purpose: "Attending international conventions, academic conferences, or seminars in Indonesia",
    eligibility: "Conference delegates and speakers",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "CONFERENCE_VISA",
    docs: [
      "Conference Invitation Letter from Indonesian Host Body ⭐",
      "Conference Registration Confirmation & Event Program ⭐",
      "Passport 6M + Return Flight Ticket",
      "e-VOA Conference Submission via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-TOU-013",
    officialCode: "ID-TOU-013",
    name: "Visa C316 Tourist - Sports 60 Days Sports Visa C316 Sports ID",
    fee: "IDR 2000k Visa C316 sports ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days",
    purpose: "Participating in sports tournaments, surf competitions, or athletic events",
    eligibility: "Athletes, sports delegates, and team personnel",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "SPECIAL_VISA",
    docs: [
      "Sports Event Invitation from Indonesian Sports Association (KONI / Ministry) ⭐",
      "Event Registration & Athlete Details ⭐",
      "Passport 6M + Health Clearance",
      "Visa C316 Sports Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-TOU-014",
    officialCode: "ID-TOU-014",
    name: "Visa C316 Tourist - Film 60 Days Film Visa C316 Film ID",
    fee: "IDR 2000k Visa C316 film ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "5 to 10 Business Days (Ministry of Foreign Affairs / Information clearance)",
    purpose: "Filming, documentary production, or commercial photography in Indonesia",
    eligibility: "Filmmakers, media crews, and production staff",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "PERFORMER_VISA",
    docs: [
      "Filming Permit Approval from Ministry of Foreign Affairs / Ministry of Tourism ⭐",
      "Local Production Partner Recommendation Letter ⭐",
      "Equipment List & Location Itinerary",
      "Visa C316 Film Application via molina.imigrasi.go.id ⭐"
    ]
  },

  // BUSINESS 10 LIVE
  {
    id: "id-BIZ-001",
    officialCode: "ID-BIZ-001",
    name: "Visa C2 Business 60 Days 180 Days Business C2 60 Days 180 Days - Most common Business Indonesia",
    fee: "IDR 2000k Visa C2 business 60 days 180 days",
    validity: "60 days per visit (extendable up to 180 days)",
    stay: "Max 60 days per visit",
    processing: "3 to 5 Business Days (molina.imigrasi.go.id C2)",
    purpose: "Business meetings, corporate negotiations, purchasing goods, factory audits",
    eligibility: "Business professionals traveling for commercial engagements in Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    popular: true,
    highlight: true,
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Company Invitation Letter from Registered Indonesian Company (PT / PT PMA) ⭐",
      "Host Company NIB (Nomor Induk Berusaha) & Kemenkumham Corporate Deed ⭐",
      "Employer Dispatch / Cover Letter from Foreign Company ⭐",
      "Business Card & Foreign Company Profile",
      "Valid Passport (6 months validity) ⭐",
      "Bank Statement (last 3 months, min USD 2,000) ⭐",
      "Visa C2 Application via Official Portal (molina.imigrasi.go.id) ⭐"
    ],
    warningBox: "✅ Most common business Indonesia Visa C2 Business 60 Days 180 Days - molina.imigrasi.go.id C2"
  },
  {
    id: "id-BIZ-002",
    officialCode: "ID-BIZ-002",
    name: "Visa C2 Business Extension Extension Visa C2 Business 60 Days Extension Visa C2 Business ID",
    fee: "IDR 2000k Visa C2 business extension 60 days",
    validity: "60 days extension",
    stay: "Extended stay duration",
    processing: "3 to 5 Business Days",
    purpose: "Extending C2 business visa stay in Indonesia",
    eligibility: "Current C2 visa holders",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "business",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "C2 Extension Reason Letter from Sponsoring Company ⭐",
      "Indonesian Host Company NIB & Kemenkumham Deed ⭐",
      "Current Passport with C2 Visa Stamp",
      "Extension Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-BIZ-003",
    officialCode: "ID-BIZ-003",
    name: "Visa C11 Business 1Y Business C11 1Y Business C11 ID",
    fee: "IDR 6000k Visa C11 business 1Y ID",
    validity: "1 Year multiple entry",
    stay: "Max 60 days per visit",
    processing: "3 to 5 Business Days",
    purpose: "Frequent business trips, executive oversight, commercial partnerships",
    eligibility: "Executives and business owners making multiple trips to Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Multiple Entry Invitation Letter from Indonesian Host Company ⭐",
      "Host NIB & Kemenkumham Corporate Legal Deed ⭐",
      "Foreign Employer Cover Letter & Business Profile",
      "Passport 6M + Photos + Bank Statement 3M (USD 2,000+)",
      "Visa C11 Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-BIZ-004",
    officialCode: "ID-BIZ-004",
    name: "Visa C11 Business Extension Extension Visa C11 Business 1Y Extension Visa C11 Business ID",
    fee: "IDR 6000k Visa C11 business extension 1Y",
    validity: "1 Year extension",
    stay: "Extended multiple entry validity",
    processing: "3 to 5 Business Days",
    purpose: "Renewing 1-Year C11 multiple entry business visa",
    eligibility: "Current C11 visa holders",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "business",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Sponsor Renewal Letter & NIB Corporate Deed ⭐",
      "Current Passport with C11 Visa Sticker",
      "Extension Submission via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-BIZ-005",
    officialCode: "ID-BIZ-005",
    name: "Visa C2 Business - Investor 60 Days Investor Business C2 Investor Business ID",
    fee: "IDR 2000k Visa C2 investor ID + Investment IDR 10B",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days (BKPM / OSS clearance)",
    purpose: "Prospective foreign investors evaluating projects or incorporating PT PMA in Indonesia",
    eligibility: "Investors planning capital placement of IDR 10,000,000,000+",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "business",
    record_type: "INVESTOR_VISA",
    docs: [
      "BKPM / Investment Coordinating Board Pre-Investment Letter ⭐",
      "Draft PT PMA Articles of Association / Deed of Establishment ⭐",
      "Proof of Capital Funds (Bank Statement min USD 10,000)",
      "Passport 6M + Visa C2 Investor Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-BIZ-006",
    officialCode: "ID-BIZ-006",
    name: "Visa C2 Business - Meeting 60 Days Meeting Business C2 Meeting Business ID",
    fee: "IDR 2000k Visa C2 meeting ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days",
    purpose: "Attending corporate board meetings, commercial discussions, or vendor summits",
    eligibility: "Corporate executives traveling for business meetings",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Meeting Invitation Letter from Indonesian Partner Company ⭐",
      "Meeting Agenda & Host NIB Registration ⭐",
      "Employer Cover Letter + Business Card",
      "Passport 6M + Bank Statement 3M",
      "Visa C2 Meeting Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-BIZ-007",
    officialCode: "ID-BIZ-007",
    name: "Visa C2 Business - Conference 60 Days Conference Business C2 Conference ID",
    fee: "IDR 2000k Visa C2 conference ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days",
    purpose: "Attending commercial exhibitions, trade conventions, or industry expos",
    eligibility: "Commercial delegates and trade speakers",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "business",
    record_type: "CONFERENCE_VISA",
    docs: [
      "Trade Conference Invitation & Delegate Pass ⭐",
      "Indonesian Conference Organizer Registration Document ⭐",
      "Employer Dispatch Letter & Business Card",
      "Passport 6M + Visa C2 Conference Submission ⭐"
    ]
  },
  {
    id: "id-BIZ-008",
    officialCode: "ID-BIZ-008",
    name: "Visa C2 Business - Trade Fair 60 Days Trade Fair Business C2 Trade Fair ID",
    fee: "IDR 2000k Visa C2 trade fair ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days",
    purpose: "Exhibiting or sourcing products at trade fairs and commercial expos",
    eligibility: "Trade fair exhibitors and wholesale buyers",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Trade Fair Exhibitor Registration & Booth Contract ⭐",
      "KADIN / Ministry of Trade Event Sponsorship ⭐",
      "Company Business Profile & Passport 6M",
      "Visa C2 Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-BIZ-009",
    officialCode: "ID-BIZ-009",
    name: "Visa C11 Business - Investor 1Y Investor Business C11 Investor Business C11 ID",
    fee: "IDR 6000k Visa C11 investor 1Y ID + Investment IDR 10B",
    validity: "1 Year multiple entry",
    stay: "Max 60 days per entry",
    processing: "3 to 5 Business Days",
    purpose: "Multiple entry business visa for active PT PMA company directors and shareholders",
    eligibility: "Foreign investors owning shares in registered Indonesian company (PT PMA)",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "business",
    record_type: "INVESTOR_VISA",
    docs: [
      "PT PMA Akta Pendirian & Kemenkumham Approval Deed ⭐",
      "Company NIB & Shareholding Verification (Min IDR 10B investment) ⭐",
      "Director's Passport 6M + Company Tax Number (NPWP)",
      "Visa C11 Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-BIZ-010",
    officialCode: "ID-BIZ-010",
    name: "APEC Business Travel Card ABTC APEC Business Travel Card ABTC APEC ID",
    fee: "IDR 1000k ABTC ID",
    validity: "5 Years multiple entry",
    stay: "Max 60 days per entry",
    processing: "Pre-clearance via APEC scheme",
    purpose: "Fast-track entry for business executives from APEC member economies",
    eligibility: "APEC Business Travel Card holders with ID pre-clearance",
    officialSource: "https://www.apec.org",
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Valid APEC Card with ID pre-clearance ⭐",
      "Valid Passport (6M validity) ⭐",
      "Digital Arrival Declaration"
    ]
  },

  // WORK 20 LIVE
  {
    id: "id-WRK-001",
    officialCode: "ID-WRK-001",
    name: "KITAS Work C312 1Y 2Y KITAS Work C312 1Y 2Y - Most common Work Permit Indonesia - KITAS C312 + Work Permit",
    fee: "IDR 2000k KITAS work C312 1Y 2Y + Work permit + IMTA",
    validity: "1 Year to 2 Years renewable pass",
    stay: "Continuous stay for pass duration",
    processing: "10 to 21 Business Days (Kemnaker RPTKA + molina.imigrasi.go.id C312)",
    purpose: "Full-time employment for foreign professionals, directors, and technical experts in Indonesia",
    eligibility: "Expatriates recruited by registered PT PMA or Indonesian enterprise with RPTKA approval",
    officialSource: "https://molina.imigrasi.go.id",
    popular: true,
    highlight: true,
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "RPTKA (Expatriate Placement Plan) Approval from Ministry of Manpower (Kemnaker) ⭐",
      "DPKK Payment Receipt ($1,200/year Compensation Fund for Kemnaker) ⭐",
      "Signed Employment Contract with Indonesian Sponsor Company ⭐",
      "Host Company Legal Documents: NIB, Kemenkumham Deed, Company NPWP, OSS License ⭐",
      "University Degree & CV (Legalized / Translated) ⭐",
      "Expatriate Passport (valid min 18 months) & Photos",
      "KITAS C312 Application via molina.imigrasi.go.id ⭐"
    ],
    rawFundsBox: "KITAS C312 = Work KITAS + IMTA + RPTKA + DPKK = Work permit ID",
    rawBankBox: "Bank 3M original + RPTKA Kemnaker approval + DPKK receipt",
    warningBox: "✅ Most common work permit Indonesia KITAS Work C312 1Y 2Y + IMTA + RPTKA + DPKK + KITAS"
  },
  {
    id: "id-WRK-002",
    officialCode: "ID-WRK-002",
    name: "KITAS Work Extension Extension KITAS Work C312 1Y Extension KITAS Work ID",
    fee: "IDR 2000k KITAS work extension C312 1Y",
    validity: "1 Year extension",
    stay: "Continued employment stay",
    processing: "7 to 10 Business Days",
    purpose: "Renewing KITAS Work C312 for foreign expatriate employee",
    eligibility: "Current KITAS C312 holders with renewed RPTKA and DPKK clearance",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Renewed RPTKA Approval & DPKK Receipt from Kemnaker ⭐",
      "Expatriate Personal Tax Return (SPT PPh 21 / NPWP) ⭐",
      "Current Passport with KITAS Sticker / E-KITAS ⭐",
      "KITAS C312 Renewal Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-003",
    officialCode: "ID-WRK-003",
    name: "KITAS Investor C313 2Y KITAS Investor C313 2Y Investor KITAS ID",
    fee: "IDR 6000k KITAS investor C313 2Y + Investment IDR 10B",
    validity: "2 Years renewable pass",
    stay: "2 Years continuous stay without separate work permit requirement",
    processing: "10 to 14 Business Days (BKPM + molina.imigrasi.go.id C313)",
    purpose: "Investor residency for directors or major shareholders of PT PMA companies",
    eligibility: "Foreign investors holding minimum IDR 10,000,000,000 share value in Indonesian PT PMA",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "INVESTOR_VISA",
    docs: [
      "BKPM / OSS Investor Registration & Shareholding Verification ⭐",
      "Company Akta Pendirian & Kemenkumham Approval Deed (Min Share Value IDR 10B) ⭐",
      "Company NIB & Tax Registration (NPWP) ⭐",
      "Investor Passport Copy (valid min 30 months) & Photos",
      "KITAS C313 Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-004",
    officialCode: "ID-WRK-004",
    name: "KITAS Investor Extension Extension KITAS Investor C313 2Y Extension KITAS Investor ID",
    fee: "IDR 6000k KITAS investor extension C313 2Y",
    validity: "2 Years extension",
    stay: "Extended investor stay",
    processing: "7 to 10 Business Days",
    purpose: "Renewing KITAS Investor C313 for PT PMA shareholders",
    eligibility: "Existing KITAS C313 holders maintaining required equity investment",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Updated OSS Shareholder Verification & Company LKPM Report ⭐",
      "Company Financial Audit & Tax Return ⭐",
      "Current Passport with KITAS C313 Sticker",
      "Extension Submission via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-005",
    officialCode: "ID-WRK-005",
    name: "KITAS Work - Expert 1Y Expert KITAS Work Expert KITAS Work ID",
    fee: "IDR 2000k KITAS work expert 1Y + Work permit + IMTA expert",
    validity: "1 Year renewable",
    stay: "12 months continuous stay",
    processing: "10 to 14 Business Days",
    purpose: "Employment for technical advisors, consultants, and specialized industrial experts",
    eligibility: "Experts with 5+ years specialized industry experience and degree",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Kemnaker Expert RPTKA Approval & DPKK Payment ⭐",
      "Technical Advisory Contract & Expertise Credentials ⭐",
      "Host Company OSS NIB & Kemenkumham Deed",
      "KITAS C312 Expert Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-006",
    officialCode: "ID-WRK-006",
    name: "KITAS Work - Manager 1Y Manager KITAS Work Manager KITAS Work ID",
    fee: "IDR 2000k KITAS work manager 1Y + Work permit + IMTA manager",
    validity: "1 Year to 2 Years renewable",
    stay: "Contract duration",
    processing: "10 to 14 Business Days",
    purpose: "Senior managerial employment in Indonesian corporate entities",
    eligibility: "Corporate managers recruited under approved RPTKA quota",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Kemnaker Managerial RPTKA Approval & DPKK Receipt ⭐",
      "Managerial Employment Contract & Company Organizational Chart ⭐",
      "Manager Qualifications & CV",
      "KITAS C312 Manager Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-007",
    officialCode: "ID-WRK-007",
    name: "Golden Visa Investor 5Y 10Y Golden Visa Investor 5Y 10Y Investor Golden ID",
    fee: "IDR 15000k Golden visa investor 5Y 10Y + Investment USD 350k 700k",
    validity: "5 Years to 10 Years residency pass",
    stay: "Long-term residency with fast-track immigration privileges",
    processing: "14 to 30 Business Days (Golden Visa Unit / Imigrasi)",
    purpose: "Residency-by-investment for corporate investors incorporating PT PMA or purchasing state bonds",
    eligibility: "Individual investors investing USD 350,000 (5Y) or USD 700,000 (10Y) in Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "INVESTOR_VISA",
    docs: [
      "Official Golden Visa Approval Letter from Directorate General of Immigration ⭐",
      "Proof of Investment Placement: USD 350,000 (5Y) or USD 700,000 (10Y) in PT PMA or Indonesian State Bonds ⭐",
      "Good Conduct Certificate & Medical Clearance",
      "Passport Valid for 36+ Months",
      "Golden Visa Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-008",
    officialCode: "ID-WRK-008",
    name: "Golden Visa Extension Extension Golden Visa Investor 5Y Extension Golden Visa Investor ID",
    fee: "IDR 15000k Golden visa investor extension 5Y + Investment USD 350k 700k extension Golden",
    validity: "5 Years extension",
    stay: "Continued Golden Visa residency",
    processing: "14 Business Days",
    purpose: "Extending Golden Visa residency pass",
    eligibility: "Golden Visa holders maintaining required investment threshold",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Investment Maintenance Certificate from Indonesian Bank / BKPM ⭐",
      "Golden Visa Renewal Submission via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-009",
    officialCode: "ID-WRK-009",
    name: "KITAS Work - Researcher 1Y Researcher KITAS Work Researcher KITAS Work ID",
    fee: "IDR 2000k KITAS work researcher 1Y + Work permit + IMTA researcher",
    validity: "1 Year renewable",
    stay: "Research duration",
    processing: "14 Business Days (BRIN + Kemnaker + Imigrasi)",
    purpose: "Scientific research in Indonesian research institutions or universities",
    eligibility: "Researchers approved by BRIN (National Research and Innovation Agency)",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "RESEARCH_VISA",
    docs: [
      "BRIN (National Research & Innovation Agency) Official Permit ⭐",
      "Kemnaker Research RPTKA Clearance ⭐",
      "Research Project Plan & Host Institute Contract",
      "KITAS C312 Researcher Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-010",
    officialCode: "ID-WRK-010",
    name: "KITAS Work - Engineer 1Y Engineer KITAS Work Engineer KITAS Work ID",
    fee: "IDR 2000k KITAS work engineer 1Y + Work permit + IMTA engineer",
    validity: "1 Year to 2 Years renewable",
    stay: "Contract term",
    processing: "10 to 14 Business Days",
    purpose: "Engineering consultancy, infrastructure deployment, technical supervision",
    eligibility: "Engineers employed under Kemnaker engineering quota",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Kemnaker Engineering RPTKA Approval & DPKK Receipt ⭐",
      "Engineering Employment Contract & PII Registration ⭐",
      "Bachelor/Master Degree in Engineering & Transcripts",
      "KITAS C312 Engineer Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-011",
    officialCode: "ID-WRK-011",
    name: "KITAS Work - Academic 1Y Academic KITAS Work Academic KITAS Work ID",
    fee: "IDR 2000k KITAS work academic 1Y + Work permit + IMTA academic",
    validity: "1 Year to 2 Years renewable",
    stay: "Academic appointment duration",
    processing: "14 Business Days (Kemendikbudristek + Kemnaker)",
    purpose: "Lecturers, professors, and academic faculty at Indonesian universities",
    eligibility: "Academic staff recruited by accredited Indonesian higher education institutions",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Kemendikbudristek Academic Recommendation Letter ⭐",
      "Kemnaker Academic RPTKA Approval & DPKK Receipt ⭐",
      "Academic Employment Contract & Credentials",
      "KITAS C312 Academic Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-012",
    officialCode: "ID-WRK-012",
    name: "IMTA Authority Work Permit IMTA Authority Work Permit ID",
    fee: "IDR 0 IMTA authority ID",
    validity: "Official Work Permit Document",
    stay: "Regulatory Guidance",
    processing: "Ministry of Manpower (Kemnaker)",
    purpose: "Work Permit Approval Document (Izin Mempekerjakan Tenaga Kerja Asing) issued by Kemnaker",
    eligibility: "Official Classification",
    officialSource: "https://tka-online.kemnaker.go.id",
    categoryCode: "work",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Kemnaker IMTA Work Permit Framework Reference ⭐",
      "Official Foreign Worker Employment Guidance (Kemnaker) ⭐"
    ]
  },
  {
    id: "id-WRK-013",
    officialCode: "ID-WRK-013",
    name: "RPTKA Authority Foreign Worker Placement Plan Authority RPTKA",
    fee: "IDR 0 RPTKA authority ID",
    validity: "Official Expatriate Quota Document",
    stay: "Regulatory Guidance",
    processing: "Ministry of Manpower (Kemnaker)",
    purpose: "Rencana Penggunaan Tenaga Kerja Asing (RPTKA) quota authorization for employers",
    eligibility: "Official Classification",
    officialSource: "https://tka-online.kemnaker.go.id",
    categoryCode: "work",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Kemnaker RPTKA Quota Approval Reference ⭐",
      "RPTKA Expatriate Placement Guidelines ⭐"
    ]
  },
  {
    id: "id-WRK-014",
    officialCode: "ID-WRK-014",
    name: "KITAS Work - Artist 1Y Artist KITAS Work Artist KITAS Work ID",
    fee: "IDR 2000k KITAS work artist 1Y + Work permit + IMTA artist",
    validity: "Duration of artistic contract (up to 12 months)",
    stay: "Performance term",
    processing: "10 Business Days (Kemendikbudristek + Kemnaker)",
    purpose: "Foreign performing artists, musicians, and resident creatives employed in Indonesia",
    eligibility: "Artists contracted by registered Indonesian entertainment promoter or studio",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "PERFORMER_VISA",
    docs: [
      "Ministry Recommendation for Foreign Performers ⭐",
      "Kemnaker RPTKA Approval & Event Contract ⭐",
      "Promoter Corporate Legal Deeds",
      "KITAS C312 Artist Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-015",
    officialCode: "ID-WRK-015",
    name: "KITAS Work - Sports 1Y Sports KITAS Work Sports KITAS Work ID",
    fee: "IDR 2000k KITAS work sports 1Y + Work permit + IMTA sports",
    validity: "1 Year renewable",
    stay: "Contract duration",
    processing: "10 Business Days (KONI + Kemnaker)",
    purpose: "Professional sports coaches, technical directors, and contracted professional athletes",
    eligibility: "Sports professionals contracted by Indonesian sports bodies or clubs",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "KONI / Ministry of Youth and Sports Support Letter ⭐",
      "Kemnaker Sports RPTKA Approval & Contract ⭐",
      "Coaching Licenses & Credentials",
      "KITAS C312 Sports Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-016",
    officialCode: "ID-WRK-016",
    name: "KITAS Work - Domestic Helper 1Y Domestic Helper KITAS Work Domestic Helper KITAS Work ID",
    fee: "IDR 2000k KITAS work domestic helper 1Y + Work permit + IMTA domestic helper",
    validity: "1 Year renewable",
    stay: "12 months",
    processing: "14 Business Days (Kemnaker)",
    purpose: "Domestic household assistance for eligible foreign diplomats or executives",
    eligibility: "Domestic helpers recruited under Kemnaker domestic helper quota",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Employer Diplomatic / Executive KITAS Verification ⭐",
      "Kemnaker Domestic Helper RPTKA Clearance ⭐",
      "Helper Employment Contract & Medical Report",
      "KITAS Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-017",
    officialCode: "ID-WRK-017",
    name: "Golden Visa - Global Talent 5Y Global Talent Golden Visa Global Talent Golden ID",
    fee: "IDR 15000k Golden visa global talent 5Y + Global talent",
    validity: "5 Years residency pass",
    stay: "5 Years open residency for world talent",
    processing: "14 to 30 Business Days",
    purpose: "Residency pass for world-class scientists, tech pioneers, and global innovators",
    eligibility: "Individuals endorsed by Indonesian Ministry / Government as global talent",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Indonesian Government Ministry Global Talent Endorsement ⭐",
      "International Awards, Patents, or Tech Credentials ⭐",
      "Good Conduct Clearance & Passport 36M+",
      "Golden Visa Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-018",
    officialCode: "ID-WRK-018",
    name: "Golden Visa - Silver Hair 5Y Silver Hair Golden Visa Silver Hair Golden ID",
    fee: "IDR 15000k Golden visa silver hair 5Y + Age 60 + Funds USD 350k",
    validity: "5 Years renewable pass",
    stay: "5 Years retirement residency",
    processing: "14 to 30 Business Days",
    purpose: "Premium retirement residency for foreign seniors aged 60+ with substantial wealth",
    eligibility: "Foreign seniors aged 60+ depositing USD 350,000 in Indonesian state bank",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "RETIREMENT_VISA",
    docs: [
      "Age Verification (60+ years old) ⭐",
      "Proof of Fixed Deposit USD 350,000 in Indonesian Bank ⭐",
      "Health Insurance & Pension Income Proof",
      "Golden Visa Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-019",
    officialCode: "ID-WRK-019",
    name: "KITAS Work - ICT 1Y ICT KITAS Work ICT KITAS Work ID",
    fee: "IDR 2000k KITAS work ICT 1Y + Work permit + IMTA ICT",
    validity: "1 Year to 2 Years renewable",
    stay: "Contract term",
    processing: "10 to 14 Business Days",
    purpose: "Intra-corporate transfer of key managers and technical specialists within MNCs",
    eligibility: "Employees transferred from foreign parent entity to Indonesian PT PMA subsidiary",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Kemnaker ICT RPTKA Approval & DPKK Receipt ⭐",
      "MNC Intra-Corporate Transfer Assignment Letter ⭐",
      "Proof of Parent-Subsidiary Relationship",
      "KITAS C312 ICT Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-WRK-020",
    officialCode: "ID-WRK-020",
    name: "KITAS Work - Volunteer 1Y Volunteer KITAS Work Volunteer KITAS Work ID",
    fee: "IDR 2000k KITAS work volunteer 1Y + Work permit + IMTA volunteer",
    validity: "1 Year renewable",
    stay: "Voluntary service duration",
    processing: "10 to 14 Business Days",
    purpose: "Voluntary and social service with registered Indonesian NGOs / Foundations (Yayasan)",
    eligibility: "Volunteers sponsored by registered Indonesian Yayasan",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "work",
    record_type: "VOLUNTEER_VISA",
    docs: [
      "Yayasan NGO Legal Deeds & Kemenkumham Registration ⭐",
      "Volunteer Agreement & Scope of Social Work ⭐",
      "Kemnaker Volunteer Clearance",
      "KITAS Application via molina.imigrasi.go.id ⭐"
    ]
  },

  // STUDENT 8 LIVE
  {
    id: "id-STU-001",
    officialCode: "ID-STU-001",
    name: "KITAS Student C316 1Y KITAS Student C316 1Y - Most common Student Indonesia",
    fee: "IDR 2000k KITAS student C316 1Y",
    validity: "1 Year renewable for study duration",
    stay: "Full-time study period",
    processing: "7 to 14 Business Days (Kemendikbudristek + molina.imigrasi.go.id C316)",
    purpose: "Full-time higher education degree programs at Indonesian universities",
    eligibility: "International students accepted by registered Indonesian universities",
    officialSource: "https://molina.imigrasi.go.id",
    popular: true,
    highlight: true,
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Study Permit Recommendation from Ministry of Education (Kemendikbudristek) ⭐",
      "Official Admission Acceptance Letter from Indonesian University ⭐",
      "Academic Transcripts & Diplomas (Legalized) ⭐",
      "Proof of Financial Means / Bank Statement (Min USD 2,000) ⭐",
      "Medical Fitness Certificate & Passport Copy (valid min 18 months)",
      "KITAS Student C316 Application via molina.imigrasi.go.id ⭐"
    ],
    rawFundsBox: "KITAS Student C316 = Student KITAS C316 = Student visa ID",
    rawBankBox: "Bank 3M original + Tuition fee receipt + KITAS Student C316",
    warningBox: "✅ Most common student Indonesia KITAS Student C316 1Y"
  },
  {
    id: "id-STU-002",
    officialCode: "ID-STU-002",
    name: "KITAS Student Extension Extension KITAS Student C316 1Y Extension KITAS Student ID",
    fee: "IDR 2000k KITAS student extension C316 1Y",
    validity: "1 Year extension",
    stay: "Extended study period",
    processing: "5 to 7 Business Days",
    purpose: "Renewing student KITAS for ongoing university degree program",
    eligibility: "Enrolled international students maintaining academic progress",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "student",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Kemendikbudristek Study Permit Extension Endorsement ⭐",
      "University Progress Report & Transcript ⭐",
      "Current Passport with KITAS Sticker",
      "Renewal Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-STU-003",
    officialCode: "ID-STU-003",
    name: "KITAS Student - Doctoral PhD C316 3Y Doctoral PhD KITAS Student Doctoral PhD Student ID",
    fee: "IDR 2000k KITAS student doctoral PhD C316 3Y",
    validity: "Up to 3 Years renewable",
    stay: "Doctoral research duration",
    processing: "10 to 14 Business Days",
    purpose: "Doctoral research and PhD degree studies in Indonesian universities",
    eligibility: "PhD candidates admitted to doctoral programs in Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Kemendikbudristek PhD Track Recommendation ⭐",
      "PhD Acceptance Letter & Research Proposal ⭐",
      "Master's Degree Transcripts & Credentials",
      "KITAS C316 PhD Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-STU-004",
    officialCode: "ID-STU-004",
    name: "KITAS Student - Language C316 1Y Language KITAS Student Language Student ID",
    fee: "IDR 2000k KITAS student language C316 1Y",
    validity: "1 Year renewable",
    stay: "Bahasa Indonesia course duration",
    processing: "7 to 10 Business Days",
    purpose: "Intensive Bahasa Indonesia language courses (BIPA) at accredited language centers",
    eligibility: "Students enrolled in BIPA programs at Indonesian universities",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "BIPA Language Course Acceptance Letter ⭐",
      "Kemendikbudristek BIPA Study Permit Recommendation ⭐",
      "Bank Statement 3M (USD 2,000+)",
      "KITAS C316 Language Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-STU-005",
    officialCode: "ID-STU-005",
    name: "KITAS Student - Internship C316 1Y Internship KITAS Student Internship Student ID",
    fee: "IDR 2000k KITAS student internship C316 1Y",
    validity: "Up to 1 Year",
    stay: "Internship term",
    processing: "10 Business Days",
    purpose: "Academic internship or student placement in Indonesian firms/NGOs",
    eligibility: "Foreign university students completing required curriculum internship",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "student",
    record_type: "INTERN_VISA",
    docs: [
      "Foreign University Student Status & Internship Request Letter ⭐",
      "Indonesian Host Organization Internship Agreement ⭐",
      "Kemendikbudristek Student Placement Clearance",
      "KITAS C316 Internship Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-STU-006",
    officialCode: "ID-STU-006",
    name: "KITAS Student - Research C316 1Y Research KITAS Student Research Student ID",
    fee: "IDR 2000k KITAS student research C316 1Y",
    validity: "1 Year renewable",
    stay: "Research duration",
    processing: "14 Business Days (BRIN + Kemendikbudristek)",
    purpose: "Visiting student researchers affiliated with foreign universities",
    eligibility: "Student researchers approved by BRIN",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "student",
    record_type: "RESEARCH_VISA",
    docs: [
      "BRIN Research Permit Approval ⭐",
      "Indonesian University Research Host Contract ⭐",
      "Research Plan & Financial Support Proof",
      "KITAS C316 Research Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-STU-007",
    officialCode: "ID-STU-007",
    name: "KITAS Student - Scholarship C316 1Y Scholarship KITAS Student Scholarship Student ID",
    fee: "IDR 2000k KITAS student scholarship C316 1Y",
    validity: "1 Year renewable for scholarship duration",
    stay: "Scholarship study period",
    processing: "7 to 10 Business Days",
    purpose: "Recipients of KNS (Kemitraan Negara Berkembang) or Indonesian Government Scholarships",
    eligibility: "International scholarship recipients studying in Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Official Indonesian Government / KNB Scholarship Award Letter ⭐",
      "University Acceptance & Kemendikbudristek Clearance ⭐",
      "Scholarship Guarantee Statement",
      "KITAS C316 Scholarship Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-STU-008",
    officialCode: "ID-STU-008",
    name: "KITAS Student - Training C316 1Y Training KITAS Student Training Student ID",
    fee: "IDR 2000k KITAS student training C316 1Y",
    validity: "Up to 1 Year",
    stay: "Training period",
    processing: "7 to 10 Business Days",
    purpose: "Technical or vocational student training at accredited Indonesian institutes",
    eligibility: "Students participating in technical skill training programs",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Vocational Training Center Admission Letter ⭐",
      "Kemendikbudristek Training Recommendation ⭐",
      "KITAS C316 Training Application via molina.imigrasi.go.id ⭐"
    ]
  },

  // FAMILY 8 LIVE
  {
    id: "id-FAM-001",
    officialCode: "ID-FAM-001",
    name: "KITAS Family C317 1Y 2Y KITAS Family C317 1Y 2Y Family Reunification - Most common Family Indonesia",
    fee: "IDR 2000k KITAS family C317 1Y 2Y",
    validity: "Co-terminus with primary KITAS Work/Investor holder (1–2 years)",
    stay: "Family residency during primary holder's pass validity",
    processing: "7 to 10 Business Days (molina.imigrasi.go.id C317)",
    purpose: "Spouse and unmarried minor children of KITAS Work (C312) or KITAS Investor (C313) holders",
    eligibility: "Direct dependents of foreign expatriate pass holders in Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    popular: true,
    highlight: true,
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Primary Expatriate's Active KITAS C312 / C313 Copy ⭐",
      "Legalized / Apostilled Marriage Certificate (for spouse) ⭐",
      "Legalized / Apostilled Birth Certificate (for children) ⭐",
      "Primary Sponsor's Employment Contract & Salary Proof ⭐",
      "Dependent Passport Copy (valid min 18 months) & Photos",
      "KITAS Family C317 Application via molina.imigrasi.go.id ⭐"
    ],
    rawFundsBox: "KITAS Family C317 = Dependent KITAS + Primary C312/C313 sponsor",
    rawBankBox: "Bank 3M original + Primary KITAS C312 + Marriage/Birth certificate",
    warningBox: "✅ Most common family Indonesia KITAS Family C317 1Y 2Y family reunification - KITAS C317"
  },
  {
    id: "id-FAM-002",
    officialCode: "ID-FAM-002",
    name: "KITAS Family Extension Extension KITAS Family C317 1Y Extension KITAS Family ID",
    fee: "IDR 2000k KITAS family extension C317 1Y",
    validity: "1 Year extension",
    stay: "Extended family stay",
    processing: "5 to 7 Business Days",
    purpose: "Renewing Dependent KITAS alongside primary expatriate's KITAS renewal",
    eligibility: "Existing KITAS C317 holders",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "family",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Primary Expatriate's Renewed KITAS Copy ⭐",
      "Current Dependent Passport with KITAS Sticker",
      "Extension Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-FAM-003",
    officialCode: "ID-FAM-003",
    name: "KITAS Family - Spouse Indonesian Citizen C317 2Y Spouse Indonesian Citizen KITAS Family Spouse ID",
    fee: "IDR 2000k KITAS family spouse Indonesian citizen C317 2Y",
    validity: "Up to 2 Years renewable pass",
    stay: "Continuous residency with option to work under sponsor notification",
    processing: "10 to 14 Business Days (Imigrasi + molina.imigrasi.go.id C317)",
    purpose: "Foreign spouse legally married to an Indonesian citizen (WNI)",
    eligibility: "Foreign nationals legally married to a WNI citizen",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Official Marriage Certificate (Akta Perkawinan / Buku Nikah from KUA/Disdukcapil) ⭐",
      "Indonesian Spouse's KTP ID Card, Kartu Keluarga (KK) & Birth Certificate ⭐",
      "Sponsor Letter from Indonesian Citizen Spouse (Akuan / Guarantee) ⭐",
      "Joint Bank Account / Living Funds Proof",
      "KITAS Spouse Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-FAM-004",
    officialCode: "ID-FAM-004",
    name: "KITAS Family - Spouse Citizen Extension Extension Spouse Citizen KITAS Family Extension Spouse Citizen ID",
    fee: "IDR 2000k KITAS family spouse citizen extension C317 2Y",
    validity: "2 Years extension",
    stay: "Extended spouse residency (eligible for KITAP PR after 2 years marriage)",
    processing: "5 to 7 Business Days",
    purpose: "Extending foreign spouse KITAS in Indonesia",
    eligibility: "Current spouse KITAS holders maintaining valid marriage",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "family",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Indonesian Spouse KTP & KK Verification ⭐",
      "Joint Bank Statement & Household Address Clearance ⭐",
      "Current Passport with KITAS Sticker",
      "Extension Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-FAM-005",
    officialCode: "ID-FAM-005",
    name: "KITAS Family - Child C317 1Y 2Y Child KITAS Family Child KITAS Family ID",
    fee: "IDR 2000k KITAS family child C317 1Y 2Y",
    validity: "Co-terminus with parent's KITAS (1–2 years)",
    stay: "Child residency & schooling rights",
    processing: "7 to 10 Business Days",
    purpose: "Unmarried minor children under 18 of KITAS Work or Investor holders",
    eligibility: "Biological or legally adopted children of foreign expatriates in Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Attested Birth Certificate proving parentage ⭐",
      "Parent's KITAS Approval & Passport Copy ⭐",
      "School Enrollment Letter in Indonesia (if attending school)",
      "Child KITAS Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-FAM-006",
    officialCode: "ID-FAM-006",
    name: "KITAS Family - Adoption C317 1Y 2Y Adoption KITAS Family Adoption KITAS Family ID",
    fee: "IDR 2000k KITAS family adoption C317 1Y 2Y",
    validity: "1 Year to 2 Years renewable",
    stay: "Adopted child residency",
    processing: "14 Business Days (Court Order + Imigrasi)",
    purpose: "Legally adopted foreign children of Indonesian citizens or KITAS holders",
    eligibility: "Children with valid court adoption decree",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Official Court Adoption Order (Penetapan Pengadilan) ⭐",
      "Parent's KTP / KITAS & Household Records ⭐",
      "Child KITAS Adoption Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-FAM-007",
    officialCode: "ID-FAM-007",
    name: "KITAS Family - Parent C317 1Y 2Y Parent KITAS Family Parent KITAS Family ID",
    fee: "IDR 2000k KITAS family parent C317 1Y 2Y",
    validity: "1 Year renewable",
    stay: "Elderly parent residency",
    processing: "10 to 14 Business Days",
    purpose: "Elderly parents (aged 60+) of primary KITAS Work / Investor holders",
    eligibility: "Parents of qualifying expatriates residing in Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Apostilled Birth Certificate proving parentage ⭐",
      "Primary Expatriate's KITAS Approval & Financial Proof ⭐",
      "Health Insurance Policy for Parent ⭐",
      "Parent KITAS Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-FAM-008",
    officialCode: "ID-FAM-008",
    name: "Visa C317 Family Visit 60 Days Visa C317 Family Visit Family Visit Visa C317 ID",
    fee: "IDR 2000k Visa C317 family visit ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days",
    purpose: "Short-term family visits to Indonesian citizen or KITAS resident relatives",
    eligibility: "Family members visiting residents in Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Host Invitation Letter & KTP / KITAS Copy ⭐",
      "Proof of Family Relationship (Marriage/Birth Certificate) ⭐",
      "Applicant Passport 6M + Bank Statement 3M",
      "Visa C317 Application via molina.imigrasi.go.id ⭐"
    ]
  },

  // PR 4 LIVE + SPECIAL 18 LIVE = 22
  {
    id: "id-PR-001",
    officialCode: "ID-PR-001",
    name: "KITAP PR 5Y KITAP PR 5Y - PR Indonesia - KITAP PR 5Y",
    fee: "IDR 7000k KITAP PR 5Y",
    validity: "5 Years renewable Permanent Residence Card (KITAP)",
    stay: "Indefinite permanent residency rights",
    processing: "30 to 60 Business Days (Kemenkumham / Imigrasi)",
    purpose: "Permanent residency status for long-term foreign workers, corporate directors, or foreign spouses",
    eligibility: "Foreigners holding KITAS continuously for 3+ years in Indonesia",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "Proof of 3 Years Continuous KITAS Residence History ⭐",
      "Tax Clearance Certificate (NPWP & Annual Tax SPT) ⭐",
      "Sponsor Company NIB / Indonesian Citizen Spouse Guarantee ⭐",
      "Kemenkumham Permanent Residence Authorization ⭐",
      "Passport Copy (valid min 36 months) & Biometric Photos",
      "KITAP Application via Official Portal / Local Immigration Office ⭐"
    ]
  },
  {
    id: "id-PR-002",
    officialCode: "ID-PR-002",
    name: "KITAP PR - Spouse Indonesian Citizen 5Y Spouse Indonesian Citizen KITAP PR Spouse ID",
    fee: "IDR 7000k KITAP PR spouse Indonesian citizen 5Y",
    validity: "5 Years renewable Permanent Residence Card",
    stay: "Indefinite permanent residency & open work rights under sponsor notification",
    processing: "30 Business Days",
    purpose: "Permanent residence for foreign spouse married to an Indonesian citizen (WNI) for 2+ years",
    eligibility: "Foreign spouses continuously married to a WNI citizen for 2+ years",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "Verification of 2+ Years Legal Marriage to WNI Citizen ⭐",
      "Akta Perkawinan / Buku Nikah & Spouse KTP / Kartu Keluarga ⭐",
      "Spouse Guarantee Letter (Surat Penjamin) ⭐",
      "KITAP Spouse Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-PR-003",
    officialCode: "ID-PR-003",
    name: "KITAP PR - Investor 5Y Investor KITAP PR Investor KITAP PR ID",
    fee: "IDR 7000k KITAP PR investor 5Y + Investment IDR 10B",
    validity: "5 Years renewable Permanent Residence Card",
    stay: "5 Years permanent investor residency",
    processing: "30 Business Days (BKPM + Imigrasi)",
    purpose: "Permanent residency for foreign directors and major shareholders of PT PMA companies",
    eligibility: "Investors holding KITAS C313 for 3+ years with minimum IDR 10B share value",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "BKPM Equity Verification & 3 Years Continuous KITAS Investor Record ⭐",
      "Company Akta Pendirian & LKPM Investment Reports ⭐",
      "Company Tax Clearance (NPWP) & Audited Statements",
      "KITAP Investor Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-PR-004",
    officialCode: "ID-PR-004",
    name: "KITAP PR - Second Home 5Y Second Home KITAP PR Second Home KITAP PR ID",
    fee: "IDR 7000k KITAP PR second home 5Y + Fixed deposit IDR 2B",
    validity: "5 Years renewable Permanent Residence Card",
    stay: "5 Years permanent residency",
    processing: "30 Business Days",
    purpose: "Permanent residence under Second Home framework for high-net-worth retirees/investors",
    eligibility: "Second Home Visa holders maintaining IDR 2 Billion deposit for 3+ years",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "Proof of Maintained Fixed Deposit (IDR 2B) in Indonesian State Bank ⭐",
      "3 Years Second Home Visa History Verification ⭐",
      "KITAP Second Home Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-SPE-001",
    officialCode: "ID-SPE-001",
    name: "Golden Visa - Second Home Extension Extension Golden Visa Second Home 5Y Extension Golden Visa Second Home ID",
    fee: "IDR 3000k Second home visa extension 5Y + Fixed deposit IDR 2B extension Second home",
    validity: "5 Years extension",
    stay: "Extended Second Home residency",
    processing: "14 Business Days",
    purpose: "5-Year extension block for Second Home / Golden Visa holders",
    eligibility: "Second Home holders maintaining IDR 2B deposit",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Fixed Deposit Verification (IDR 2B) ⭐",
      "Extension Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-SPE-002",
    officialCode: "ID-SPE-002",
    name: "Diplomat Visa Diplomat Visa Diplomat Visa Diplomat ID",
    fee: "IDR 0 Diplomat ID",
    validity: "Diplomatic posting duration",
    stay: "Diplomatic assignment",
    processing: "3 to 5 Days (MFA Kemlu)",
    purpose: "Foreign diplomats posted to accredited diplomatic missions in Indonesia",
    eligibility: "Diplomatic passport holders",
    officialSource: "https://www.kemlu.go.id",
    categoryCode: "business",
    record_type: "DIPLOMAT_VISA",
    docs: [
      "Diplomatic Note Verbale from Foreign Ministry ⭐",
      "Diplomatic Passport Copy ⭐",
      "Official Posting Letter to Embassy in Jakarta",
      "Kemlu Diplomatic Approval ⭐"
    ]
  },
  {
    id: "id-SPE-003",
    officialCode: "ID-SPE-003",
    name: "Official Visa Official Visa Official Visa Official ID",
    fee: "IDR 0 Official ID",
    validity: "Official mission duration",
    stay: "Official posting period",
    processing: "3 to 5 Days (MFA Kemlu)",
    purpose: "Foreign government officials on official state missions to Indonesia",
    eligibility: "Official passport holders",
    officialSource: "https://www.kemlu.go.id",
    categoryCode: "business",
    record_type: "OFFICIAL_VISA",
    docs: [
      "Official Note Verbale ⭐",
      "Official Passport Copy ⭐",
      "Government Delegation Orders",
      "Kemlu Official Clearance ⭐"
    ]
  },
  {
    id: "id-SPE-004",
    officialCode: "ID-SPE-004",
    name: "Courtesy Visa Courtesy Visa Courtesy Visa Courtesy ID",
    fee: "IDR 0 Courtesy ID",
    validity: "As approved on courtesy basis",
    stay: "Approved courtesy duration",
    processing: "3 to 5 Days (Kemlu / Imigrasi)",
    purpose: "Visiting dignitaries and distinguished guests of Indonesian Government",
    eligibility: "Individuals granted courtesy entry privileges",
    officialSource: "https://www.imigrasi.go.id",
    categoryCode: "business",
    record_type: "COURTESY_VISA",
    docs: [
      "Official Invitation from Indonesian Government Body ⭐",
      "Passport Copy & Courtesy Request Letter ⭐"
    ]
  },
  {
    id: "id-SPE-005",
    officialCode: "ID-SPE-005",
    name: "Crew Visa C316 Crew Visa C316 Crew ID",
    fee: "IDR 2000k Crew C316 ID",
    validity: "Up to 14 Days",
    stay: "Port / airport crew layover",
    processing: "Immediate at Port / Airport Control",
    purpose: "Airline crew and maritime vessel crew entering Indonesian ports or airports",
    eligibility: "Active commercial airline and maritime crew",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "CREW_VISA",
    docs: [
      "Valid Seaman Book / Flight Crew License ⭐",
      "General Manifest & Crew List ⭐",
      "Vessel / Aircraft Arrival Declaration ⭐"
    ]
  },
  {
    id: "id-SPE-006",
    officialCode: "ID-SPE-006",
    name: "Journalist Visa C316 Journalist Visa C316 Journalist ID",
    fee: "IDR 2000k Journalist C316 ID",
    validity: "Duration of media assignment",
    stay: "Assignment period",
    processing: "7 Business Days (Foreign Press Desk Kemlu)",
    purpose: "Foreign news correspondents and media journalists reporting from Indonesia",
    eligibility: "Accredited foreign press representatives",
    officialSource: "https://www.kemlu.go.id",
    categoryCode: "business",
    record_type: "JOURNALIST_VISA",
    docs: [
      "Foreign Press Accreditation Clearance from Kemlu ⭐",
      "Media Organization Assignment Letter ⭐",
      "Journalist Visa Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-SPE-007",
    officialCode: "ID-SPE-007",
    name: "Research Visa C316 Research Visa C316 Research ID",
    fee: "IDR 2000k Research C316 ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "10 Business Days (BRIN)",
    purpose: "Short-term scientific research or academic fieldwork",
    eligibility: "Researchers approved by BRIN",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "student",
    record_type: "RESEARCH_VISA",
    docs: [
      "BRIN Foreign Research Permit Clearance ⭐",
      "Research Plan & Host University Contract ⭐",
      "Research Visa C316 Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-SPE-008",
    officialCode: "ID-SPE-008",
    name: "Volunteer Visa C316 Volunteer Visa C316 Volunteer ID",
    fee: "IDR 2000k Volunteer C316 ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days",
    purpose: "Short-term voluntary work with registered Indonesian NGOs / Yayasan",
    eligibility: "Volunteers sponsored by registered Indonesian Yayasan",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "VOLUNTEER_VISA",
    docs: [
      "Yayasan Legal Deed & Invitation Letter ⭐",
      "Volunteer Activity Scope & Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-SPE-009",
    officialCode: "ID-SPE-009",
    name: "Sports Visa C316 Sports Visa C316 Sports ID",
    fee: "IDR 2000k Sports C316 ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days",
    purpose: "Attending athletic competitions or sporting tournaments",
    eligibility: "Sports delegates and athletes",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "SPECIAL_VISA",
    docs: [
      "KONI / Sports Event Invitation ⭐",
      "Sports Visa C316 Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-SPE-010",
    officialCode: "ID-SPE-010",
    name: "Film Visa C316 Film Visa C316 Film ID",
    fee: "IDR 2000k Film C316 ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "5 to 10 Business Days",
    purpose: "Short-term filming or documentary shooting",
    eligibility: "Film crew members",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "PERFORMER_VISA",
    docs: [
      "Kemlu / Kemenparekraf Filming Permit ⭐",
      "Film Visa C316 Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-SPE-011",
    officialCode: "ID-SPE-011",
    name: "Religious Visa C316 Religious Visa C316 Religious ID",
    fee: "IDR 2000k Religious C316 ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days (Kemenag approval)",
    purpose: "Attending religious conventions or spiritual gatherings",
    eligibility: "Religious delegates",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "SPECIAL_VISA",
    docs: [
      "Ministry of Religious Affairs (Kemenag) Support Letter ⭐",
      "Religious Body Invitation & C316 Application ⭐"
    ]
  },
  {
    id: "id-SPE-012",
    officialCode: "ID-SPE-012",
    name: "Education Visa C316 Education Visa C316 Education ID",
    fee: "IDR 2000k Education C316 ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days",
    purpose: "Short-term educational courses or exchange study",
    eligibility: "Short-term students",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "University Acceptance & Kemendikbudristek Endorsement ⭐",
      "Education C316 Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-SPE-013",
    officialCode: "ID-SPE-013",
    name: "Internship Visa C316 Internship Visa C316 Internship ID",
    fee: "IDR 2000k Internship C316 ID",
    validity: "60 days single entry",
    stay: "Max 60 days",
    processing: "3 to 5 Business Days",
    purpose: "Short-term student internship placement",
    eligibility: "Internship trainees",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "student",
    record_type: "INTERN_VISA",
    docs: [
      "Host Company Internship Contract & University Letter ⭐",
      "Internship C316 Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-SPE-014",
    officialCode: "ID-SPE-014",
    name: "KITAP PR Extension Extension KITAP PR 5Y Extension KITAP PR ID",
    fee: "IDR 7000k KITAP PR extension 5Y",
    validity: "5 Years renewal for KITAP PR",
    stay: "Continued Permanent Residence",
    processing: "14 Business Days",
    purpose: "Extending KITAP Permanent Residence Card for next 5-year term",
    eligibility: "KITAP holders maintaining residency eligibility",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "pr",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "KITAP Renewal Reason Letter & Tax Clearance ⭐",
      "Current Passport with KITAP Card",
      "KITAP Extension Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-SPE-015",
    officialCode: "ID-SPE-015",
    name: "Golden Visa - World Event 5Y World Event Golden Visa World Event Golden ID",
    fee: "IDR 15000k Golden visa world event 5Y + World event",
    validity: "5 Years residency pass",
    stay: "5 Years event residency",
    processing: "14 Business Days",
    purpose: "Special Golden Visa for major international event organizers / VIP delegates (G20, ASEAN Summit, World Water Forum)",
    eligibility: "World event delegates nominated by Indonesian Government",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Indonesian Government World Event Nomination Letter ⭐",
      "Golden Visa Application via molina.imigrasi.go.id ⭐"
    ]
  },
  {
    id: "id-SPE-016",
    officialCode: "ID-SPE-016",
    name: "Transit Without Visa TWOV Transit Without Visa TWOV Transit Without Visa ID",
    fee: "IDR 0 TWOV ID",
    validity: "Up to 24 Hours",
    stay: "Transit layover",
    processing: "Immediate at Airport",
    purpose: "Airport transit without visa for passengers staying in transit lounge",
    eligibility: "Transiting airline passengers with confirmed onward tickets",
    officialSource: "https://www.imigrasi.go.id",
    categoryCode: "tourist",
    record_type: "TRANSIT_VISA",
    docs: [
      "Confirmed Onward Flight Ticket within 24 Hours ⭐",
      "Valid Passport 6M+ ⭐",
      "Airport Transit Desk Clearance ⭐"
    ]
  },

  // SUPPORTING 15 + LEGACY 10 = 25 SUPPORTING/LEGACY ENTRIES
  {
    id: "id-SUP-001",
    officialCode: "ID-SUP-001",
    name: "Molina Authority Molina molina.imigrasi.go.id Authority Visa Molina",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Official e-Visa and e-VOA portal (molina.imigrasi.go.id)",
    eligibility: "Official Classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Molina Authority Reference (molina.imigrasi.go.id) ⭐"]
  },
  {
    id: "id-SUP-002",
    officialCode: "ID-SUP-002",
    name: "Immigration Authority Indonesia Immigration Directorate General Authority Visa Immigration",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Directorate General of Immigration (Direktorat Jenderal Imigrasi Indonesia)",
    eligibility: "Official Classification",
    officialSource: "https://www.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Directorate General of Immigration Reference (imigrasi.go.id) ⭐"]
  },
  {
    id: "id-SUP-003",
    officialCode: "ID-SUP-003",
    name: "KITAS Authority KITAS Authority Residence KITAS",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Limited Stay Permit Card (Kartu Izin Tinggal Terbatas - KITAS) framework",
    eligibility: "Official Classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["KITAS Framework Reference ⭐"]
  },
  {
    id: "id-SUP-004",
    officialCode: "ID-SUP-004",
    name: "KITAP Authority KITAP Authority PR KITAP",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Permanent Stay Permit Card (Kartu Izin Tinggal Tetap - KITAP) framework",
    eligibility: "Official Classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["KITAP Framework Reference ⭐"]
  },
  {
    id: "id-SUP-005",
    officialCode: "ID-SUP-005",
    name: "IMTA Authority Work Permit IMTA Authority Work Permit ID",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Kemnaker Work Permit (IMTA) authority",
    eligibility: "Official Classification",
    officialSource: "https://tka-online.kemnaker.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["IMTA Framework Reference ⭐"]
  },
  {
    id: "id-SUP-006",
    officialCode: "ID-SUP-006",
    name: "RPTKA Authority Foreign Worker Placement Plan Authority RPTKA",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Kemnaker RPTKA Expatriate Quota authority",
    eligibility: "Official Classification",
    officialSource: "https://tka-online.kemnaker.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["RPTKA Framework Reference ⭐"]
  },
  {
    id: "id-SUP-007",
    officialCode: "ID-SUP-007",
    name: "Golden Visa Authority Golden Visa Authority Investor Golden Visa",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Indonesian Golden Visa policy authority",
    eligibility: "Official Classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Golden Visa Framework Reference ⭐"]
  },
  {
    id: "id-SUP-008",
    officialCode: "ID-SUP-008",
    name: "e-VOA Authority e-VOA Authority Visa e-VOA",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "e-VOA Electronic Visa on Arrival system authority",
    eligibility: "Official Classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["e-VOA System Reference ⭐"]
  },
  {
    id: "id-SUP-009",
    officialCode: "ID-SUP-009",
    name: "C312 Authority C312 Work KITAS Authority Work C312",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Index C312 Work KITAS classification framework",
    eligibility: "Official Classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["C312 Framework Reference ⭐"]
  },
  {
    id: "id-SUP-010",
    officialCode: "ID-SUP-010",
    name: "C316 Authority C316 Tourist Student Authority Tourist C316",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Index C316 Tourist & Student classification framework",
    eligibility: "Official Classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["C316 Framework Reference ⭐"]
  },
  {
    id: "id-SUP-011",
    officialCode: "ID-SUP-011",
    name: "C317 Authority C317 Family KITAS Authority Family C317",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Index C317 Family KITAS classification framework",
    eligibility: "Official Classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["C317 Framework Reference ⭐"]
  },
  {
    id: "id-SUP-012",
    officialCode: "ID-SUP-012",
    name: "C2 Authority C2 Business Visa Authority Business C2",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Index C2 Business Visa classification framework",
    eligibility: "Official Classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["C2 Framework Reference ⭐"]
  },
  {
    id: "id-SUP-013",
    officialCode: "ID-SUP-013",
    name: "Second Home Authority Second Home Visa Authority Retirement Second Home",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Second Home Visa framework authority",
    eligibility: "Official Classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Second Home Framework Reference ⭐"]
  },
  {
    id: "id-SUP-014",
    officialCode: "ID-SUP-014",
    name: "Visa Free Authority Visa Free Authority Tourist Visa Free",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "ASEAN Visa Free entry framework authority",
    eligibility: "Official Classification",
    officialSource: "https://www.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Visa Free Framework Reference ⭐"]
  },
  {
    id: "id-SUP-015",
    officialCode: "ID-SUP-015",
    name: "DPKK Authority DPKK Compensation Fund Authority Work DPKK",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Kemnaker DPKK Compensation Fund framework authority",
    eligibility: "Official Classification",
    officialSource: "https://tka-online.kemnaker.go.id",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["DPKK Framework Reference ⭐"]
  },
  {
    id: "id-LEG-001",
    officialCode: "ID-LEG-001",
    name: "Legacy VOA 30 Days Old System Closed Replaced by New e-VOA 30 Days molina.imigrasi.go.id",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy paper VOA system (upgraded to online e-VOA molina.imigrasi.go.id)",
    eligibility: "Archived classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "id-LEG-002",
    officialCode: "ID-LEG-002",
    name: "Legacy Visa C316 30 Days Old System Closed Replaced by New Visa C316 60 Days 180 Days",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 30-day C316 visa (upgraded to 60–180 days system)",
    eligibility: "Archived classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "id-LEG-003",
    officialCode: "ID-LEG-003",
    name: "Legacy Business Visa C2 30 Days Old System Closed Replaced by New Visa C2 60 Days 180 Days",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 30-day C2 business visa (upgraded to 60-day extendable framework)",
    eligibility: "Archived classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "id-LEG-004",
    officialCode: "ID-LEG-004",
    name: "Legacy KITAS Work 1Y Old System Closed Replaced by New KITAS Work C312 1Y 2Y IMTA",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy manual work KITAS (replaced by Kemnaker e-RPTKA & Molina E-KITAS C312)",
    eligibility: "Archived classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "id-LEG-005",
    officialCode: "ID-LEG-005",
    name: "Legacy KITAS Investor 1Y Old System Closed Replaced by New KITAS Investor C313 2Y Investment IDR 10B",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 1-year investor KITAS (upgraded to 2-year C313 framework)",
    eligibility: "Archived classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "id-LEG-006",
    officialCode: "ID-LEG-006",
    name: "Legacy Second Home 1Y Old System Closed Replaced by New Second Home 5Y 10Y Fixed Deposit IDR 2B",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy retirement visa (upgraded to 5-10 year Second Home Visa framework)",
    eligibility: "Archived classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "id-LEG-007",
    officialCode: "ID-LEG-007",
    name: "Legacy KITAS Student 1Y Old System Closed Replaced by New KITAS Student C316 1Y",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy student visa (upgraded to C316 student KITAS)",
    eligibility: "Archived classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "id-LEG-008",
    officialCode: "ID-LEG-008",
    name: "Legacy KITAS Family 1Y Old System Closed Replaced by New KITAS Family C317 1Y 2Y",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy family KITAS (upgraded to C317 family KITAS)",
    eligibility: "Archived classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "id-LEG-009",
    officialCode: "ID-LEG-009",
    name: "Legacy KITAP 2Y Old System Closed Replaced by New KITAP PR 5Y",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 2-year KITAP (upgraded to 5-year renewable KITAP PR)",
    eligibility: "Archived classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "id-LEG-010",
    officialCode: "ID-LEG-010",
    name: "Legacy Golden Visa 1Y Old System Closed Replaced by New Golden Visa Investor 5Y 10Y USD 350k",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy investor permit (upgraded to 5-10 year Golden Visa framework)",
    eligibility: "Archived classification",
    officialSource: "https://molina.imigrasi.go.id",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  }
];

export const INDONESIA_82_VISAS: CountryVisas = {
  tourist: [],
  business: [],
  work: [],
  student: [],
  family: [],
  pr: []
};

// Populate INDONESIA_82_VISAS with dynamically generated microDetails
RAW_ID_VISAS.forEach(visa => {
  const cat = visa.categoryCode as keyof CountryVisas;
  if (!INDONESIA_82_VISAS[cat]) {
    INDONESIA_82_VISAS[cat] = [];
  }
  
  const micro = getIndonesiaMicroDetails(visa.officialCode || visa.id, cat, visa.name);
  const enrichedVisa: VisaItem = {
    ...visa,
    microDetails: micro
  };
  
  INDONESIA_82_VISAS[cat].push(enrichedVisa);
});
