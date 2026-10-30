import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getMalaysiaMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "eVisa Tourist / Social Visit Pass requires proof of sufficient funds (MYR 100 per day of stay or bank statement showing MYR 3,000–5,000). Immigration Department of Malaysia (Jabatan Imigresen Malaysia - JIM) / windowmalaysia.my requires 3 months bank statements.";
  let fundsBankMonths = "Last 3 months personal bank statements stamped by bank showing liquid MYR/USD balance.";
  let fundsSudden = "❌ Sudden cash deposits prior to eVisa application on windowmalaysia.my are flagged. Maintaining a steady balance over 3 months ensures quick approval.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement with MYR 5,000+ liquid balance. ❌ Galat: Sudden cash injection 24 hours before submitting windowmalaysia.my application.";

  let itrYears = "Income Tax returns (LHDN Borang BE/B) or salary slips for past 2–3 years for Employment Pass (EP I/II/III), Residence Pass - Talent (RP-T), or MM2H/PVIP applicants.";
  let itrMatch = "Reported income must match personal bank account credits and ESD (Expatriate Services Division) / TalentCorp employment contract.";
  let itrNoItr = "Not required for short-term 90-day eVisa tourist or university student pass holders.";

  let bankMonths = "Last 3 months bank statements.";
  let bankReg = "Regular salary credits or steady corporate revenue.";
  let bankFd = "Fixed deposits required for MM2H (MYR 1M FD) and Premium Visa Programme PVIP (MYR 1M FD).";
  let bankSource = "Salary, corporate dividends, verified offshore income, or parent/sponsor funds.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('ep') || lowerCode.includes('esd') || lowerCode.includes('rpt') || lowerCode.includes('rantau')) {
    fundsMin = "Employment Pass (EP Category I/II/III) requires Expatriate Services Division (ESD) / MYXpats approval + company registration + relevant degree + minimum salary threshold (EP I: MYR 10k/mo; EP II: MYR 5k–10k/mo; EP III: MYR 3k–5k/mo). DE Rantau Digital Nomad requires USD 24,000/year income.";
    fundsBankMonths = "ESD MYXpats approval letter, Malaysian employer contract, and 3 months bank statements.";
    fundsSudden = "Employment Pass applications must be processed through ESD (esd.imi.gov.my) or MDEC for digital nomads (mdec.my).";
    fundsEx = "✅ Sahi: ESD MYXpats EP Category I approval + MYR 10k+/mo salary contract + 5-year EP pass. ❌ Galat: Submitting without ESD company endorsement.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('emgs') || lowerCode.includes('val')) {
    fundsMin = "Student Pass requires Education Malaysia Global Services (EMGS) approval + Visa Approval Letter (VAL) + offer letter from recognized Malaysian Higher Education Institution + liquid bank proof (MYR 10,000+).";
    fundsBankMonths = "3 months bank statements of student or parental sponsor showing min MYR 10,000.";
    fundsSudden = "Parental sponsorship letter and birth certificate required if funded by parents.";
    fundsEx = "✅ Sahi: Official EMGS VAL approval + institution acceptance + MYR 10k bank proof. ❌ Galat: Unregistered institution or missing EMGS approval.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('ltsvp') || lowerCode.includes('dep')) {
    fundsMin = "Dependent Pass (ESD) / Long Term Social Visit Pass (LTSVP) requires primary Employment Pass / RP-T holder or Malaysian citizen spouse sponsorship + legalized marriage/birth certificates. Fee MYR 300.";
    fundsBankMonths = "Sponsor's Employment Pass / Citizen MyKad ID + 3 months salary slips and bank statements.";
    fundsSudden = "Foreign marriage and birth certificates must be apostilled/attested by Ministry of Foreign Affairs (Wisma Putra).";
    fundsEx = "✅ Sahi: Legalized marriage certificate + EP holder ESD approval + 5-year LTSVP / Dependent Pass. ❌ Galat: Unattested certificates.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('pvp')) {
    fundsMin = "eVisa Business Single/Multiple & Professional Visit Pass (PVP) requires invitation letter from registered Malaysian company (SSM SSM Registration Certificate) + foreign employer letter. PVP processed via ESD.";
    fundsBankMonths = "3 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Malaysian company must be actively registered in ESD portal.";
    fundsEx = "✅ Sahi: Official SSM company registration + ESD Professional Visit Pass approval letter. ❌ Galat: Unregistered sponsor company.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('mm2h') || lowerCode.includes('pvip')) {
    fundsMin = "Permanent Residence (PR) / Residence Pass Talent (RP-T 10Y) / MM2H (10Y) / PVIP (20Y). MM2H requires MYR 1M Fixed Deposit + MYR 40k/month offshore income. PVIP requires MYR 200k fee + MYR 1M FD.";
    fundsBankMonths = "6 months offshore income bank statements + MYR 1M fixed deposit receipt in Malaysian bank.";
    fundsSudden = "Fixed Deposit must be placed in a licensed commercial bank in Malaysia.";
    fundsEx = "✅ Sahi: MYR 1,000,000 Fixed Deposit in Malaysian bank + MYR 40k/month income proof + MM2H/PVIP approval. ❌ Galat: Insufficient offshore income proof.";
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

const RAW_MY_VISAS: VisaItem[] = [
  // TOURIST 14 LIVE
  {
    id: "my-TOU-001",
    officialCode: "MY-TOU-001",
    name: "eVisa Tourist Single 90 Days eVisa Tourist - Most common Tourist Malaysia",
    fee: "MYR 200 eVisa tourist single",
    validity: "90 days single entry",
    stay: "Max 30 days per visit",
    processing: "2 to 3 Business Days (windowmalaysia.my)",
    purpose: "Tourism, vacation, family visits, sightseeing in Malaysia",
    eligibility: "Foreign nationals requiring single entry eVisa to Malaysia",
    officialSource: "https://www.windowmalaysia.my",
    popular: true,
    highlight: true,
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport (6 months validity, 1 blank page) ⭐",
      "Digital Passport Photo (35x50mm white background)",
      "Confirmed Return Flight Ticket ⭐",
      "Hotel Reservation or Proof of Accommodation",
      "Bank Statement (last 3 months, min MYR 3,000) ⭐",
      "Employment Certificate or Cover Letter",
      "eVisa Application via Official Portal (windowmalaysia.my) ⭐"
    ],
    rawFundsBox: "MYR 100/day = Bank 3M MYR 100/day = eVisa windowmalaysia.my",
    rawBankBox: "Bank 3M MYR 100/day original + Employment + eVisa",
    warningBox: "✅ Most common tourist Malaysia eVisa Tourist Single 90 Days - windowmalaysia.my"
  },
  {
    id: "my-TOU-002",
    officialCode: "MY-TOU-002",
    name: "eVisa Tourist Multiple 90 Days 1Y eVisa Tourist Multiple",
    fee: "MYR 200 eVisa tourist multiple 1Y",
    validity: "1 Year multiple entry",
    stay: "Max 30 days per visit",
    processing: "2 to 3 Business Days",
    purpose: "Frequent leisure or tourist visits to Malaysia",
    eligibility: "Frequent travelers needing multiple entry tourist visa",
    officialSource: "https://www.windowmalaysia.my",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport (6M validity) ⭐",
      "Digital Passport Photo 35x50mm",
      "Return Flight Itinerary",
      "Hotel Reservations",
      "Bank Statement (last 3 months) ⭐",
      "Cover Letter explaining multiple entry need",
      "eVisa Portal Submission (windowmalaysia.my) ⭐"
    ]
  },
  {
    id: "my-TOU-003",
    officialCode: "MY-TOU-003",
    name: "Social Visit Pass 90 Days Social Visit Pass 90 Days Social Visit",
    fee: "MYR 0 Social visit pass 90 days visa free",
    validity: "90 days single/multiple",
    stay: "Max 90 days",
    processing: "Issued on Arrival / Visa Free Entry",
    purpose: "Tourism and social visits for eligible visa-exempt nationalities",
    eligibility: "Citizens of visa-exempt countries (US, UK, EU, Australia, etc.)",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport (minimum 6 months validity) ⭐",
      "Confirmed Return or Onward Flight Ticket ⭐",
      "Hotel Booking or Host Accommodation Details",
      "Proof of Sufficient Funds (MYR 3,000+)",
      "Digital Arrival Card (MDAC - Malaysia Digital Arrival Card) ⭐"
    ]
  },
  {
    id: "my-TOU-004",
    officialCode: "MY-TOU-004",
    name: "Visa On Arrival VOA 7 Days VOA 7 Days VOA MY",
    fee: "MYR 200 VOA 7 days MY",
    validity: "7 days single entry",
    stay: "Max 7 days",
    processing: "Immediate at Airport Entry Counters (KLIA1/KLIA2/Penang/Johor)",
    purpose: "Transit or short tourist entry arriving from Singapore/Thailand/Indonesia",
    eligibility: "Selected nationalities (India, China) holding valid visa for Singapore/Thailand/Indonesia",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport (6 months validity) ⭐",
      "Valid Visa / Pass for Singapore, Thailand, or Indonesia ⭐",
      "Confirmed Return Flight Ticket within 7 Days ⭐",
      "Hotel Booking Confirmation",
      "Proof of USD 500 / MYR 2,000 cash or bank balance",
      "VOA Application Form at Airport Counter ⭐"
    ]
  },
  {
    id: "my-TOU-005",
    officialCode: "MY-TOU-005",
    name: "Social Visit Pass Extension Extension Social Visit 90 Days Extension Social Visit MY",
    fee: "MYR 100 Social visit extension 90 days MY",
    validity: "Extension up to 30–90 days",
    stay: "Extended stay duration",
    processing: "3 to 5 Business Days (Immigration Headquarters Putrajaya / State JIM)",
    purpose: "Extending social stay due to medical, emergency, or valid personal reasons",
    eligibility: "Current Social Visit Pass holders in Malaysia with valid extension justification",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "tourist",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Extension Reason Letter & Justification ⭐",
      "Current Passport with Social Visit Entry Stamp ⭐",
      "Confirmed Revised Flight Ticket ⭐",
      "Bank Statement showing funds for extended stay",
      "Immigration Extension Form (Imm. 55) ⭐"
    ]
  },
  {
    id: "my-TOU-006",
    officialCode: "MY-TOU-006",
    name: "eVisa Tourist - Medical Treatment 90 Days Medical Treatment eVisa Medical MY",
    fee: "MYR 200 eVisa medical treatment MY",
    validity: "90 days single/multiple entry",
    stay: "As approved for medical treatment",
    processing: "2 to 3 Business Days (MHTC - Malaysia Healthcare Travel Council accredited)",
    purpose: "Medical consultation, treatment, or surgery at registered Malaysian hospitals",
    eligibility: "Patients seeking healthcare in Malaysia",
    officialSource: "https://www.mhtc.org.my",
    categoryCode: "tourist",
    record_type: "MEDICAL_VISA",
    docs: [
      "Hospital Appointment Letter from registered Malaysian Healthcare Facility ⭐",
      "Medical Referral Certificate & Treatment Plan ⭐",
      "Passport Valid for 6 Months ⭐",
      "Hospital Guarantee / Advance Payment Receipt",
      "Bank Statement (last 3 months)",
      "eVisa Medical Application via windowmalaysia.my ⭐"
    ]
  },
  {
    id: "my-TOU-007",
    officialCode: "MY-TOU-007",
    name: "eVisa Tourist - Family Friends Visit 90 Days Family Friends Visit eVisa Family Friends MY",
    fee: "MYR 200 eVisa family friends visit MY",
    validity: "90 days single entry",
    stay: "Max 30 days per visit",
    processing: "2 to 3 Business Days",
    purpose: "Visiting family members or friends residing legally in Malaysia",
    eligibility: "Visitors with host invitation in Malaysia",
    officialSource: "https://www.windowmalaysia.my",
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Invitation Letter from Host in Malaysia ⭐",
      "Host's Malaysian MyKad ID / Pass Copy ⭐",
      "Proof of Relationship / Acquaintance",
      "Host Accommodation Details in Malaysia",
      "Host Financial Sponsorship Letter (if applicable)",
      "Applicant Passport + Photo + Flight + Bank 3M ⭐"
    ]
  },
  {
    id: "my-TOU-008",
    officialCode: "MY-TOU-008",
    name: "Transit Visa 120H Transit Visa 120H Transit MY",
    fee: "MYR 0 Transit 120H MY",
    validity: "120 Hours (5 Days)",
    stay: "Max 120 Hours",
    processing: "Immediate at Airport Transit Counter (KLIA1 / KLIA2)",
    purpose: "Short transit through Malaysia to a third country",
    eligibility: "Passengers transiting via Malaysia Airlines or AirAsia with confirmed onward flights within 120 hours",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "tourist",
    record_type: "TRANSIT_VISA",
    docs: [
      "Valid Passport (6 months validity) ⭐",
      "Confirmed Onward Flight Ticket to 3rd Country within 120 Hours ⭐",
      "Valid Visa for Destination Country (if required) ⭐",
      "MDAC Arrival Card",
      "Transit Pass Application at KLIA Transit Desk ⭐"
    ]
  },
  {
    id: "my-TOU-009",
    officialCode: "MY-TOU-009",
    name: "Social Visit - MM2H 10Y Malaysia My Second Home 10Y MM2H 10Y Social Visit MM2H",
    fee: "MYR 5000 MM2H 10Y + Fixed deposit MYR 1M + Income MYR 40k/month",
    validity: "10 Years renewable multiple entry",
    stay: "Long-term residency",
    processing: "30 to 60 Business Days (MM2H Centre, MOTAC / Immigration)",
    purpose: "Long-term residency in Malaysia for retirees and high-net-worth individuals",
    eligibility: "Applicants meeting MM2H financial requirements (MYR 1M Fixed Deposit + MYR 40k/mo income)",
    officialSource: "https://www.mm2h.gov.my",
    categoryCode: "tourist",
    record_type: "RETIREMENT_VISA",
    docs: [
      "MM2H Approval Letter from MM2H Centre ⭐",
      "Fixed Deposit Receipt of MYR 1,000,000 in Malaysian Bank ⭐",
      "Proof of Offshore Monthly Income MYR 40,000+ ⭐",
      "Bank Statements (last 6 months) showing liquid assets",
      "Medical Examination Report from Malaysian Clinic",
      "Health Insurance Policy valid in Malaysia",
      "Good Conduct Certificate (Criminal Record Clearance) ⭐"
    ]
  },
  {
    id: "my-TOU-010",
    officialCode: "MY-TOU-010",
    name: "eVisa Tourist - Conference 90 Days Conference eVisa Conference MY",
    fee: "MYR 200 eVisa conference MY",
    validity: "90 days single entry",
    stay: "Max 30 days",
    processing: "2 to 3 Business Days",
    purpose: "Attending international conferences, seminars, or conventions in Malaysia",
    eligibility: "Conference delegates and speakers",
    officialSource: "https://www.windowmalaysia.my",
    categoryCode: "tourist",
    record_type: "CONFERENCE_VISA",
    docs: [
      "Conference Invitation Letter from Malaysian Organizer ⭐",
      "Conference Organizer Registration Document in Malaysia",
      "Event Agenda & Registration Confirmation ⭐",
      "Passport 6M + Photo + Hotel Booking",
      "Bank Statement (last 3 months)",
      "eVisa Conference Application (windowmalaysia.my) ⭐"
    ]
  },
  {
    id: "my-TOU-011",
    officialCode: "MY-TOU-011",
    name: "Social Visit - Digital Nomad DE Rantau 1Y 2Y Digital Nomad DE Rantau 1Y 2Y Digital Nomad MY",
    fee: "MYR 1000 DE Rantau 1Y 2Y + Income USD 24k/year",
    validity: "1 Year to 2 Years renewable pass",
    stay: "Up to 24 months continuous residence",
    processing: "15 to 30 Business Days (MDEC Portal)",
    purpose: "Remote work and digital nomad lifestyle in Malaysia",
    eligibility: "IT professionals, software developers, digital marketers earning USD 24,000+/year remotely",
    officialSource: "https://mdec.my/derantau",
    categoryCode: "tourist",
    record_type: "DIGITAL_NOMAD_VISA",
    docs: [
      "DE Rantau Nomad Pass Approval from MDEC ⭐",
      "Proof of Remote Employment Contract / Freelance Client Contracts ⭐",
      "Proof of Annual Remote Income USD 24,000+ ⭐",
      "Bank Statements (last 3 months) showing regular remote earnings",
      "Updated CV / Portfolio",
      "Good Conduct Clearance Certificate ⭐"
    ]
  },
  {
    id: "my-TOU-012",
    officialCode: "MY-TOU-012",
    name: "eVisa Tourist - Sports 90 Days Sports eVisa Sports MY",
    fee: "MYR 200 eVisa sports MY",
    validity: "90 days single entry",
    stay: "Max 30 days",
    processing: "2 to 3 Business Days",
    purpose: "Participating in sporting tournaments, competitions, or athletic events",
    eligibility: "Athletes, sports delegates, and team personnel",
    officialSource: "https://www.windowmalaysia.my",
    categoryCode: "tourist",
    record_type: "SPECIAL_VISA",
    docs: [
      "Sports Event Invitation Letter from Malaysian Sports Association / Ministry ⭐",
      "Event Registration & Participant Details ⭐",
      "Official Delegation Letter from Foreign Sports Body",
      "Passport 6M + Flight + Hotel Bookings",
      "eVisa Sports Application via windowmalaysia.my ⭐"
    ]
  },
  {
    id: "my-TOU-013",
    officialCode: "MY-TOU-013",
    name: "eVisa Tourist - Film 90 Days Film eVisa Film MY",
    fee: "MYR 200 eVisa film MY",
    validity: "90 days single entry",
    stay: "Max 30 days",
    processing: "2 to 3 Business Days (PUSPAL approval required for filming)",
    purpose: "Film shooting, documentary production, or media coverage",
    eligibility: "Filmmakers, production crews, and media personnel",
    officialSource: "https://www.kkd.gov.my",
    categoryCode: "tourist",
    record_type: "PERFORMER_VISA",
    docs: [
      "PUSPAL Approval Letter from Ministry of Communications ⭐",
      "Filming Sponsor / Local Production Partner Letter in Malaysia ⭐",
      "List of Filming Equipment & Location Schedule",
      "Passport 6M + Photos + Flight Bookings",
      "eVisa Film Application (windowmalaysia.my) ⭐"
    ]
  },
  {
    id: "my-TOU-014",
    officialCode: "MY-TOU-014",
    name: "eVisa Tourist - Religious 90 Days Religious eVisa Religious MY",
    fee: "MYR 200 eVisa religious MY",
    validity: "90 days single entry",
    stay: "Max 30 days",
    processing: "2 to 3 Business Days",
    purpose: "Attending religious gatherings, pilgrimages, or spiritual events",
    eligibility: "Delegates attending registered religious events in Malaysia",
    officialSource: "https://www.windowmalaysia.my",
    categoryCode: "tourist",
    record_type: "SPECIAL_VISA",
    docs: [
      "Religious Invitation Letter from Registered Religious Body in Malaysia ⭐",
      "Registration Certificate of Religious Organization",
      "Event Details & Itinerary",
      "Passport 6M + Bank Statement 3M",
      "eVisa Religious Application via windowmalaysia.my ⭐"
    ]
  },

  // BUSINESS 10 LIVE
  {
    id: "my-BIZ-001",
    officialCode: "MY-BIZ-001",
    name: "eVisa Business Single 90 Days eVisa Business - Most common Business Malaysia",
    fee: "MYR 200 eVisa business single",
    validity: "90 days single entry",
    stay: "Max 30 days",
    processing: "2 to 3 Business Days (windowmalaysia.my)",
    purpose: "Business meetings, corporate negotiations, site visits, trade discussions",
    eligibility: "Business professionals traveling for commercial engagements",
    officialSource: "https://www.windowmalaysia.my",
    popular: true,
    highlight: true,
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Company Invitation Letter from Registered Malaysian Entity ⭐",
      "SSM Corporate Profile / Registration Certificate of Host in Malaysia ⭐",
      "Employer Dispatch / Cover Letter from Foreign Company ⭐",
      "Business Card & Foreign Company Registration",
      "Valid Passport (6 months validity) ⭐",
      "Bank Statement (last 3 months) ⭐",
      "eVisa Business Application via windowmalaysia.my ⭐"
    ],
    warningBox: "✅ Most common business Malaysia eVisa Business Single 90 Days - windowmalaysia.my"
  },
  {
    id: "my-BIZ-002",
    officialCode: "MY-BIZ-002",
    name: "eVisa Business Multiple 90 Days 1Y eVisa Business Multiple",
    fee: "MYR 200 eVisa business multiple 1Y",
    validity: "1 Year multiple entry",
    stay: "Max 30 days per visit",
    processing: "2 to 3 Business Days",
    purpose: "Frequent business trips, ongoing commercial partnerships",
    eligibility: "Executives and corporate representatives traveling repeatedly to Malaysia",
    officialSource: "https://www.windowmalaysia.my",
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Malaysian Host Invitation Letter for Multiple Entry ⭐",
      "SSM Corporate Profile of Malaysian Company ⭐",
      "Foreign Employer Endorsement & Business Profile",
      "Passport 6M + Photo + Return Flight Itinerary",
      "Bank Statement (last 3 months)",
      "eVisa Business Multiple Application (windowmalaysia.my) ⭐"
    ]
  },
  {
    id: "my-BIZ-003",
    officialCode: "MY-BIZ-003",
    name: "Professional Visit Pass PVP 1Y Professional Visit Pass PVP 1Y Professional Visit MY",
    fee: "MYR 1200 PVP 1Y MY + Company MY",
    validity: "Up to 12 Months non-renewable / renewable pass",
    stay: "Continuous stay up to 12 months",
    processing: "14 to 21 Business Days (ESD Portal esd.imi.gov.my)",
    purpose: "Technical experts, machinery installers, consultants, trainers on assignment",
    eligibility: "Foreign professionals employed by overseas companies assigned to Malaysian entity",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "PVP Approval Letter from Expatriate Services Division (ESD) ⭐",
      "Sponsorship & Guarantee Letter from Host Company in Malaysia ⭐",
      "Secondment Letter / Agreement from Foreign Employer ⭐",
      "Academic Qualifications & Resume of Expert",
      "SSM Registration of Host Company ⭐",
      "Bank Statement (last 3 months) & Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-BIZ-004",
    officialCode: "MY-BIZ-004",
    name: "Professional Visit Pass Extension Extension PVP 1Y Extension Professional Visit MY",
    fee: "MYR 1200 PVP extension 1Y MY",
    validity: "Extension up to 12 months",
    stay: "Extended assignment duration",
    processing: "10 to 14 Business Days (ESD Portal)",
    purpose: "Extending technical or professional assignment in Malaysia",
    eligibility: "Current PVP holders with host company request",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "business",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "PVP Extension Reason Letter from Host Company ⭐",
      "Updated Secondment Agreement & Assignment Scope ⭐",
      "Current Passport with Valid PVP Pass Sticker ⭐",
      "Progress Report of Technical Project",
      "PVP Extension Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-BIZ-005",
    officialCode: "MY-BIZ-005",
    name: "Business eVisa - Investor 1Y 2Y Investor eVisa Investor MY",
    fee: "MYR 200 Business investor MY + Investment MYR 500k",
    validity: "1 Year to 2 Years pass",
    stay: "Long-term business entry",
    processing: "14 to 21 Business Days (MIDA / Immigration)",
    purpose: "Foreign investors establishing manufacturing or corporate projects in Malaysia",
    eligibility: "Investors investing MYR 500,000+ in registered Malaysian business",
    officialSource: "https://www.mida.gov.my",
    categoryCode: "business",
    record_type: "INVESTOR_VISA",
    docs: [
      "MIDA / Immigration Investor Support Letter ⭐",
      "Proof of Capital Investment MYR 500,000+ in Malaysian Entity ⭐",
      "SSM Company Registration & Business License ⭐",
      "Audited Financial Statements / Bank Statements",
      "Business Plan & Commercial Scope",
      "Investor eVisa Application via windowmalaysia.my ⭐"
    ]
  },
  {
    id: "my-BIZ-006",
    officialCode: "MY-BIZ-006",
    name: "Professional Visit Pass - ICT 1Y ICT Professional Visit Pass ICT Professional Visit MY",
    fee: "MYR 1200 PVP ICT 1Y MY + Company MY ICT",
    validity: "Up to 12 Months",
    stay: "Max 12 months",
    processing: "14 to 21 Business Days (ESD Portal)",
    purpose: "Intra-corporate transferee for IT, engineering, or technical deployment",
    eligibility: "IT specialists transferred from foreign parent company to Malaysian subsidiary",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "ESD ICT PVP Approval Letter ⭐",
      "Intra-Corporate Transfer Assignment Letter ⭐",
      "Proof of Parent-Subsidiary Relationship (SSM / Corporate Registry)",
      "Technical Qualifications & CV",
      "PVP ICT Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-BIZ-007",
    officialCode: "MY-BIZ-007",
    name: "eVisa Business - Conference 90 Days Conference eVisa Business Conference MY",
    fee: "MYR 200 eVisa business conference MY",
    validity: "90 days single entry",
    stay: "Max 30 days",
    processing: "2 to 3 Business Days",
    purpose: "Attending trade conferences, industry summits, or corporate expos",
    eligibility: "Corporate delegates attending registered commercial conferences",
    officialSource: "https://www.windowmalaysia.my",
    categoryCode: "business",
    record_type: "CONFERENCE_VISA",
    docs: [
      "Trade Conference Invitation & Badge Confirmation ⭐",
      "Malaysian Conference Organizer Registration ⭐",
      "Employer Cover Letter & Foreign Company Profile",
      "Passport 6M + Bank Statement 3M",
      "eVisa Application via windowmalaysia.my ⭐"
    ]
  },
  {
    id: "my-BIZ-008",
    officialCode: "MY-BIZ-008",
    name: "eVisa Business - Trade Fair 90 Days Trade Fair eVisa Business Trade Fair MY",
    fee: "MYR 200 eVisa business trade fair MY",
    validity: "90 days single entry",
    stay: "Max 30 days",
    processing: "2 to 3 Business Days",
    purpose: "Exhibiting or visiting trade fairs, expos, and commercial exhibitions",
    eligibility: "Exhibitors and commercial trade fair buyers",
    officialSource: "https://www.windowmalaysia.my",
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Trade Fair Exhibitor/Visitor Pass & Invitation ⭐",
      "MATRADE / Event Organizer Endorsement Letter ⭐",
      "Employer Company Profile & Business Card",
      "Passport 6M + Hotel + Return Flight",
      "eVisa Application via windowmalaysia.my ⭐"
    ]
  },
  {
    id: "my-BIZ-009",
    officialCode: "MY-BIZ-009",
    name: "Professional Visit Pass - Artist 1Y Artist Professional Visit Pass Artist Professional Visit MY",
    fee: "MYR 1200 PVP artist 1Y MY + Company MY artist",
    validity: "Duration of artistic performance (up to 12 months)",
    stay: "Performance period",
    processing: "14 Business Days (PUSPAL + ESD)",
    purpose: "Foreign musical artists, performers, and entertainment troupes",
    eligibility: "Performing artists sponsored by registered Malaysian promoter",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "business",
    record_type: "PERFORMER_VISA",
    docs: [
      "PUSPAL Approval Letter from Ministry of Communications ⭐",
      "Performance Contract with Malaysian Event Promoter ⭐",
      "Host Company SSM Registration",
      "Passport 6M + Portfolio / Artist Bio",
      "PVP Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-BIZ-010",
    officialCode: "MY-BIZ-010",
    name: "Professional Visit Pass - Religious Teacher 1Y Religious Teacher PVP Religious Teacher Professional Visit MY",
    fee: "MYR 1200 PVP religious teacher 1Y MY + Company MY religious",
    validity: "Up to 12 Months",
    stay: "Max 12 months",
    processing: "21 Business Days (JAKIM / Religious Department + ESD)",
    purpose: "Teaching or conducting lectures at registered religious institutions",
    eligibility: "Qualified religious scholars and teachers invited by Malaysian body",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "business",
    record_type: "SPECIAL_VISA",
    docs: [
      "JAKIM / State Religious Department Approval Letter ⭐",
      "Invitation from Registered Religious Institution in Malaysia ⭐",
      "Teacher Credentials & Qualification Diplomas",
      "Passport 6M + Criminal Clearance",
      "PVP Application via ESD Portal ⭐"
    ]
  },

  // WORK 20 LIVE
  {
    id: "my-WRK-001",
    officialCode: "MY-WRK-001",
    name: "Employment Pass Category I EP I 5Y Employment Pass EP I 5Y - Most common Work Permit Malaysia - EP I 5Y + ESD",
    fee: "MYR 300 EP I 5Y + ESD MY + Company EP I",
    validity: "Up to 5 Years renewable pass",
    stay: "Continuous stay for pass duration",
    processing: "10 to 15 Business Days (ESD MYXpats Centre esd.imi.gov.my)",
    purpose: "Top executive, C-level, or senior technical management employment",
    eligibility: "Expatriates earning minimum monthly salary of MYR 10,000+",
    officialSource: "https://esd.imi.gov.my",
    popular: true,
    highlight: true,
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "MYXpats ESD Approval Letter for EP Category I ⭐",
      "Employment Contract with Malaysian Entity (Min Salary MYR 10,000/mo) ⭐",
      "Job Offer Letter & Detailed Job Description ⭐",
      "SSM Corporate Profile & Paid-up Capital Verification of Employer",
      "University Degree Certificates & Resume (Legalized) ⭐",
      "Passport Copy (all pages) & Passport Photo",
      "EP Category I Application submitted via ESD Portal ⭐"
    ],
    rawFundsBox: "EP I = Employment pass category I salary MYR 10k/month + 5Y + ESD",
    rawBankBox: "Bank 3M original + Employment contract MYR 10k/mo + ESD approval",
    warningBox: "✅ Most common work permit Malaysia Employment Pass Category I EP I 5Y + ESD + MYXpats + Salary MYR 10k"
  },
  {
    id: "my-WRK-002",
    officialCode: "MY-WRK-002",
    name: "Employment Pass Category II EP II 2Y Employment Pass EP II 2Y Employment Pass EP II MY",
    fee: "MYR 300 EP II 2Y + ESD MY + Company EP II",
    validity: "Up to 2 Years renewable pass",
    stay: "Continuous stay during contract",
    processing: "10 to 15 Business Days (ESD MYXpats)",
    purpose: "Managerial, technical, or professional employment in Malaysia",
    eligibility: "Expatriates earning monthly salary between MYR 5,000 and MYR 9,999",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "ESD MYXpats Approval Letter for EP Category II ⭐",
      "Employment Contract (Salary MYR 5,000 to MYR 9,999/month) ⭐",
      "Employer SSM Registration & ESD Profile ⭐",
      "University Degree / Professional Certifications",
      "Passport Copy (all pages) + Photos",
      "EP Category II Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-WRK-003",
    officialCode: "MY-WRK-003",
    name: "Employment Pass Category III EP III 1Y Employment Pass EP III 1Y EP III MY",
    fee: "MYR 300 EP III 1Y + ESD MY + Company EP III",
    validity: "Up to 1 Year renewable (max 2 renewals)",
    stay: "12 months per pass",
    processing: "14 to 21 Business Days (ESD + Ministry approval)",
    purpose: "Skilled technical or specialized administrative employment",
    eligibility: "Expatriates earning monthly salary between MYR 3,000 and MYR 4,999",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "ESD MYXpats Approval Letter for EP Category III ⭐",
      "Relevant Ministry Exemption / Approval Letter ⭐",
      "Employment Contract (Salary MYR 3,000 to MYR 4,999/month) ⭐",
      "Employer SSM Registration",
      "Technical Certifications & CV",
      "EP Category III Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-WRK-004",
    officialCode: "MY-WRK-004",
    name: "Employment Pass Extension Extension Employment Pass EP I II III Extension EP MY",
    fee: "MYR 300 EP extension + ESD MY extension + Company EP extension",
    validity: "Extension equal to initial pass validity (1–5 years)",
    stay: "Continued employment stay",
    processing: "7 to 10 Business Days (ESD MYXpats)",
    purpose: "Extending ongoing employment pass for foreign expatriates",
    eligibility: "Current EP I / II / III pass holders with active employment contract",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "work",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "EP Renewal / Extension Reason Letter from Employer ⭐",
      "Updated Employment Contract & Latest Salary Slips (3 months) ⭐",
      "Income Tax Statement (LHDN Borang EA / e-Filing) ⭐",
      "Current Passport with EP Pass Sticker",
      "ESD Portal Renewal Application ⭐"
    ]
  },
  {
    id: "my-WRK-005",
    officialCode: "MY-WRK-005",
    name: "Temporary Employment Pass TE 1Y Temporary Employment Pass TE 1Y Temporary Employment MY",
    fee: "MYR 300 TE 1Y + ESD MY + Company TE",
    validity: "1 Year renewable",
    stay: "12 months",
    processing: "14 to 21 Business Days (JIM Foreign Worker Division)",
    purpose: "Semiskilled employment in approved manufacturing, construction, agriculture sectors",
    eligibility: "Workers from approved source countries under quota approval",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "KDN Foreign Worker Quota Approval Letter ⭐",
      "Employment Contract (Salary MYR 1,500+/month) ⭐",
      "FOMEMA Medical Examination Fitness Clearance ⭐",
      "Employer Company Registration & Security Bond",
      "Pass Application via Foreign Worker Portal ⭐"
    ]
  },
  {
    id: "my-WRK-006",
    officialCode: "MY-WRK-006",
    name: "Residence Pass - Talent RP-T 10Y Residence Pass Talent RP-T 10Y Talent MY",
    fee: "MYR 1000 RP-T 10Y + Income MYR 15k/month + TalentCorp",
    validity: "10 Years renewable pass",
    stay: "10 Years continuous residence & employer flexibility",
    processing: "30 to 45 Business Days (TalentCorp MYXpats)",
    purpose: "Long-term residency and open employment for top global talent in Malaysia",
    eligibility: "High-skilled foreign professionals with 3+ years in Malaysia earning MYR 15,000+/month",
    officialSource: "https://www.talentcorp.com.my",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "TalentCorp RP-T Endorsement & Approval Letter ⭐",
      "Proof of Working Experience in Malaysia (3+ Years) ⭐",
      "Proof of Monthly Salary MYR 15,000+ (Tax Return Borang BE/EA) ⭐",
      "Highest Academic / Professional Qualifications",
      "Malaysian Tax Clearance & Bank Statements",
      "RP-T Application via TalentCorp Portal ⭐"
    ]
  },
  {
    id: "my-WRK-007",
    officialCode: "MY-WRK-007",
    name: "Residence Pass - Talent Extension Extension RP-T 10Y Extension Residence Pass Talent MY",
    fee: "MYR 1000 RP-T extension 10Y MY",
    validity: "Extension up to 10 Years",
    stay: "Extended 10-year period",
    processing: "21 Business Days (TalentCorp)",
    purpose: "Extending Residence Pass - Talent for top foreign professionals",
    eligibility: "Existing RP-T holders maintaining qualifying criteria",
    officialSource: "https://www.talentcorp.com.my",
    categoryCode: "work",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "RP-T Renewal Justification Letter ⭐",
      "Updated Income Tax Returns (LHDN EA/BE forms) for past 10 years ⭐",
      "Proof of Continued Employment / Business Ownership in Malaysia ⭐",
      "Current Passport with RP-T Pass Sticker",
      "Renewal Application via TalentCorp Portal ⭐"
    ]
  },
  {
    id: "my-WRK-008",
    officialCode: "MY-WRK-008",
    name: "PVP - Internship 6M Internship PVP 6M Internship Professional Visit MY",
    fee: "MYR 1200 PVP internship 6M MY + Company MY internship",
    validity: "Up to 6 Months",
    stay: "Max 6 months",
    processing: "14 Business Days (ESD)",
    purpose: "Industrial training or corporate internship for foreign university students",
    eligibility: "Enrolled university students undertaking practical training at Malaysian firm",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "work",
    record_type: "INTERN_VISA",
    docs: [
      "Host Company Internship Agreement & Monthly Allowance Letter ⭐",
      "Foreign University Enrollment Letter & Student Identification ⭐",
      "Academic Transcripts & Course Curriculum",
      "Passport 6M + Hotel / Accommodation Details",
      "PVP Internship Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-WRK-009",
    officialCode: "MY-WRK-009",
    name: "Employment Pass - Digital Nomad DE Rantau Professional 1Y 2Y Digital Nomad Professional DE Rantau Digital Nomad Professional MY",
    fee: "MYR 1000 DE Rantau professional 1Y 2Y + Income USD 24k/year",
    validity: "1 Year to 2 Years pass",
    stay: "Up to 24 months",
    processing: "15 to 30 Business Days (MDEC)",
    purpose: "Remote IT / digital professional living in Malaysia while working for overseas employer",
    eligibility: "Digital professionals with remote salary USD 24,000+/year",
    officialSource: "https://mdec.my/derantau",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "MDEC DE Rantau Professional Approval ⭐",
      "Remote Work Employment Contract / Foreign Tech Company Contract ⭐",
      "Annual Remote Income Proof USD 24,000+ ⭐",
      "Bank Statements (last 3 months)",
      "DE Rantau Professional Application via MDEC Portal ⭐"
    ]
  },
  {
    id: "my-WRK-010",
    officialCode: "MY-WRK-010",
    name: "Employment Pass - Researcher 1Y Researcher Employment Pass Researcher EP MY",
    fee: "MYR 300 EP researcher 1Y + ESD MY researcher + Company EP researcher",
    validity: "1 Year to 3 Years renewable",
    stay: "Research contract duration",
    processing: "14 Business Days (ESD + MOSTI)",
    purpose: "Scientific, medical, or academic research in Malaysian research institutes",
    eligibility: "Qualified researchers appointed by recognized Malaysian research center",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "work",
    record_type: "RESEARCH_VISA",
    docs: [
      "Research Grant & Appointment Letter from Malaysian Institute ⭐",
      "MOSTI / University Research Approval Document ⭐",
      "PhD / Master Degree Qualifications in Research Discipline",
      "Passport Copy + CV + Publications List",
      "EP Researcher Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-WRK-011",
    officialCode: "MY-WRK-011",
    name: "Employment Pass - Engineer 1Y 2Y Engineer Employment Pass Engineer EP MY",
    fee: "MYR 300 EP engineer 1Y 2Y + ESD MY engineer + Company EP engineer",
    validity: "1 Year to 2 Years renewable",
    stay: "Project contract duration",
    processing: "10 to 15 Business Days (ESD + BEM)",
    purpose: "Engineering consultancy, infrastructure project management, technical design",
    eligibility: "Engineers registered with Board of Engineers Malaysia (BEM) or foreign equivalent",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "ESD Approval Letter for Engineering EP ⭐",
      "Board of Engineers Malaysia (BEM) Registration Letter ⭐",
      "Engineering Employment Contract & Project Assignment",
      "Bachelor/Master Degree in Engineering & Transcripts",
      "EP Engineer Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-WRK-012",
    officialCode: "MY-WRK-012",
    name: "Employment Pass - Academic 1Y Academic Employment Pass Academic EP MY",
    fee: "MYR 300 EP academic 1Y + ESD MY academic + Company EP academic",
    validity: "1 Year to 3 Years renewable",
    stay: "Academic appointment duration",
    processing: "14 Business Days (ESD + MOHE)",
    purpose: "Professors, lecturers, and academic faculty at Malaysian universities",
    eligibility: "Academic staff recruited by Malaysian Higher Education Institutions",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Ministry of Higher Education (MOHE) Approval Letter ⭐",
      "Academic Appointment Contract with Malaysian University ⭐",
      "Postgraduate Degrees & Academic Credentials",
      "Passport Copy + Academic CV",
      "EP Academic Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-WRK-013",
    officialCode: "MY-WRK-013",
    name: "ESD Authority Expatriate Services Division Authority Employment Pass ESD",
    fee: "MYR 0 ESD authority MY",
    validity: "Official Authority Portal",
    stay: "Official Division Guidance",
    processing: "Official Regulatory Authority",
    purpose: "Primary division managing Expatriate Employment Passes and PVPs in Malaysia",
    eligibility: "Malaysian corporate employers registered with ESD",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "work",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "ESD Authority Reference Guide (esd.imi.gov.my) ⭐",
      "Company Registration with ESD Portal (SSM, Paid-up capital requirement)",
      "Expatriate Services Division Official Guidelines ⭐"
    ]
  },
  {
    id: "my-WRK-014",
    officialCode: "MY-WRK-014",
    name: "MDEC Authority Malaysia Digital Economy Corporation Authority Digital Nomad MDEC",
    fee: "MYR 0 MDEC authority MY",
    validity: "Official Authority Portal",
    stay: "Official Agency Guidance",
    processing: "Official Regulatory Body",
    purpose: "Government agency driving digital economy and DE Rantau digital nomad program",
    eligibility: "Tech firms, digital nomads, and MSC status entities",
    officialSource: "https://mdec.my",
    categoryCode: "work",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "MDEC DE Rantau Official Authority Information (mdec.my) ⭐",
      "Digital Nomad & Tech Expatriate Framework Guidelines ⭐"
    ]
  },
  {
    id: "my-WRK-015",
    officialCode: "MY-WRK-015",
    name: "Employment Pass - Artist 1Y Artist Employment Pass Artist EP MY",
    fee: "MYR 300 EP artist 1Y + ESD MY artist + Company EP artist",
    validity: "1 Year renewable",
    stay: "12 months",
    processing: "14 Business Days (ESD + PUSPAL)",
    purpose: "Long-term creative employment for creative directors, designers, and resident artists",
    eligibility: "Creatives employed full-time by Malaysian media / entertainment entities",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "work",
    record_type: "PERFORMER_VISA",
    docs: [
      "PUSPAL Approval Letter ⭐",
      "Employment Contract with Malaysian Creative Agency / Media Firm ⭐",
      "Portfolio of Work & Qualifications",
      "EP Artist Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-WRK-016",
    officialCode: "MY-WRK-016",
    name: "Employment Pass - Sports 1Y Sports Employment Pass Sports EP MY",
    fee: "MYR 300 EP sports 1Y + ESD MY sports + Company EP sports",
    validity: "1 Year to 2 Years renewable",
    stay: "Contract duration",
    processing: "14 Business Days (ESD + KBS)",
    purpose: "Professional sports coaches, technical directors, and contracted professional athletes",
    eligibility: "Sports professionals contracted by Malaysian national sports bodies or clubs",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Ministry of Youth and Sports (KBS) Support Letter ⭐",
      "Contract with Malaysian Sports Club / Association ⭐",
      "Coaching License / Professional Sports Credentials",
      "EP Sports Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-WRK-017",
    officialCode: "MY-WRK-017",
    name: "Employment Pass - Domestic Helper 1Y Domestic Helper Employment Pass Domestic Helper EP MY",
    fee: "MYR 300 EP domestic helper 1Y + ESD MY domestic helper + Company EP domestic helper",
    validity: "1 Year renewable",
    stay: "12 months",
    processing: "21 Business Days (JIM Maid Division)",
    purpose: "Domestic household assistance for EP Category I or RP-T expatriates",
    eligibility: "Domestic helpers recruited by eligible expatriates in Malaysia",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Expatriate Employer EP Category I / RP-T Pass Copy ⭐",
      "Domestic Helper Contract & Medical Fitness (FOMEMA) ⭐",
      "Embassy Clearance Letter from Helper's Home Country",
      "Maid Pass Application via JIM Portal ⭐"
    ]
  },
  {
    id: "my-WRK-018",
    officialCode: "MY-WRK-018",
    name: "Temporary Employment Pass - Foreign Worker 1Y Foreign Worker Temporary Employment Pass Foreign Worker MY",
    fee: "MYR 300 TE foreign worker 1Y + ESD MY foreign worker + Company TE foreign worker",
    validity: "1 Year renewable up to 10 years",
    stay: "12 months per pass",
    processing: "21 Business Days",
    purpose: "General labor in approved plantation, agriculture, construction, service sectors",
    eligibility: "Workers imported via approved government quota",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Ministry foreign worker quota approval ⭐",
      "Employer-worker contract (Min salary MYR 1,500) ⭐",
      "FOMEMA medical fitness report ⭐",
      "Levy payment receipt & Insurance policy",
      "Pass application via JIM Foreign Worker Portal ⭐"
    ]
  },
  {
    id: "my-WRK-019",
    officialCode: "MY-WRK-019",
    name: "Employment Pass - ICT 1Y 5Y ICT Employment Pass ICT EP MY",
    fee: "MYR 300 EP ICT 1Y 5Y + ESD MY ICT + Company EP ICT",
    validity: "1 Year to 5 Years renewable",
    stay: "Contract duration",
    processing: "10 to 15 Business Days (ESD)",
    purpose: "Long-term intra-corporate transfer of key managerial and technical talent",
    eligibility: "Transferees with 1+ year employment in foreign parent MNC",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "ESD ICT Employment Pass Approval ⭐",
      "MNC Intra-Corporate Transfer Letter ⭐",
      "Proof of Employment at Foreign Parent Entity (12+ months)",
      "Malaysian Entity SSM Registration",
      "EP ICT Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-WRK-020",
    officialCode: "MY-WRK-020",
    name: "Residence Pass - Talent Spouse RP-T Spouse RP-T Spouse Talent MY",
    fee: "MYR 1000 RP-T spouse + TalentCorp + RP-T spouse MY",
    validity: "Co-terminus with primary RP-T holder (up to 10 years)",
    stay: "Includes work permission in Malaysia",
    processing: "21 Business Days (TalentCorp)",
    purpose: "Spouse of RP-T holder allowed to reside and work without separate EP",
    eligibility: "Legally married spouse of RP-T pass holder",
    officialSource: "https://www.talentcorp.com.my",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Primary Applicant's RP-T Approval Letter ⭐",
      "Attested Marriage Certificate ⭐",
      "Work Endorsement Request from Employer (if working)",
      "RP-T Spouse Pass Application via TalentCorp ⭐"
    ]
  },

  // STUDENT 8 LIVE
  {
    id: "my-STU-001",
    officialCode: "MY-STU-001",
    name: "Student Pass 1Y Student Pass 1Y - Most common Student Malaysia",
    fee: "MYR 1000 Student pass 1Y + EMGS + VAL",
    validity: "1 Year renewable for study duration",
    stay: "Full-time study period",
    processing: "14 to 21 Business Days (EMGS Portal emgs.com.my)",
    purpose: "Full-time higher education degree programs at Malaysian universities",
    eligibility: "International students accepted by registered Malaysian universities/colleges",
    officialSource: "https://visa.educationmalaysia.gov.my",
    popular: true,
    highlight: true,
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "EMGS Visa Approval Letter (VAL) ⭐",
      "Official Offer Letter from Recognized Malaysian Higher Education Institution ⭐",
      "Academic Transcripts & Certificates (Legalized)",
      "Proof of Financial Support / Bank Statement (Min MYR 10,000) ⭐",
      "EMGS Medical Health Screening Clearance ⭐",
      "Passport Copy (valid min 18 months) & Digital Photo",
      "Student Pass Application via EMGS Portal ⭐"
    ],
    rawFundsBox: "EMGS + VAL = Education Malaysia Global Services + Visa Approval Letter = Student pass MY",
    rawBankBox: "Bank 3M original + Tuition fee receipt + EMGS + VAL",
    warningBox: "✅ Most common student Malaysia Student Pass 1Y + EMGS + VAL"
  },
  {
    id: "my-STU-002",
    officialCode: "MY-STU-002",
    name: "Student Pass Extension Extension Student Pass 1Y Extension Student Pass MY",
    fee: "MYR 1000 Student pass extension 1Y + EMGS extension + VAL extension",
    validity: "1 Year extension",
    stay: "Extended study period",
    processing: "10 to 14 Business Days (EMGS Portal)",
    purpose: "Renewing student pass for ongoing degree or diploma program",
    eligibility: "Enrolled international students maintaining CGPA and attendance requirements",
    officialSource: "https://visa.educationmalaysia.gov.my",
    categoryCode: "student",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "University Progress Report & Latest CGPA Result (Min 2.0) ⭐",
      "Attendance Record (Min 80%) ⭐",
      "University Renewal Confirmation Letter ⭐",
      "EMGS Health Insurance Renewal Proof",
      "Student Pass Extension Application via EMGS Portal ⭐"
    ]
  },
  {
    id: "my-STU-003",
    officialCode: "MY-STU-003",
    name: "Student Pass - Doctoral PhD 3Y Doctoral PhD Student Pass Doctoral PhD Student MY",
    fee: "MYR 1000 Student pass doctoral PhD 3Y + EMGS doctoral PhD + VAL doctoral PhD",
    validity: "Up to 3 Years renewable",
    stay: "Doctoral research duration",
    processing: "14 to 21 Business Days (EMGS)",
    purpose: "Doctoral research and PhD degree studies in Malaysian research universities",
    eligibility: "PhD candidates admitted to accredited doctoral programs in Malaysia",
    officialSource: "https://visa.educationmalaysia.gov.my",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "EMGS VAL Approval for PhD Track ⭐",
      "Official PhD Offer Letter & Research Proposal Approval ⭐",
      "Master's Degree Certificate & Academic Credentials",
      "Financial Guarantee / Research Fellowship Proof",
      "Student Pass PhD Application via EMGS ⭐"
    ]
  },
  {
    id: "my-STU-004",
    officialCode: "MY-STU-004",
    name: "Student Pass - Language 1Y Language Student Pass Language Student MY",
    fee: "MYR 1000 Student pass language 1Y + EMGS language + VAL language",
    validity: "Up to 1 Year",
    stay: "Language course duration",
    processing: "14 to 21 Business Days (EMGS)",
    purpose: "Intensive English or Bahasa Melayu language courses at accredited language centers",
    eligibility: "Students enrolled in Ministry-approved language centers in Malaysia",
    officialSource: "https://visa.educationmalaysia.gov.my",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Language Center Admission Offer Letter ⭐",
      "MOHE Approval Certificate of Language Center ⭐",
      "Tuition Fee Receipt & Financial Proof",
      "EMGS Medical Clearance & Passport 18M+",
      "Language Student Pass Application via EMGS ⭐"
    ]
  },
  {
    id: "my-STU-005",
    officialCode: "MY-STU-005",
    name: "Student Pass - Internship 1Y Internship Student Pass Internship Student MY",
    fee: "MYR 1000 Student pass internship 1Y + EMGS internship + VAL internship",
    validity: "Up to 1 Year",
    stay: "Academic internship duration",
    processing: "14 Business Days (EMGS)",
    purpose: "Academic student attachments and university curriculum practical training",
    eligibility: "International students completing mandatory university internship in Malaysia",
    officialSource: "https://visa.educationmalaysia.gov.my",
    categoryCode: "student",
    record_type: "INTERN_VISA",
    docs: [
      "University Mandatory Internship Letter ⭐",
      "Malaysian Host Organization Internship Agreement ⭐",
      "EMGS Internship Endorsement",
      "Student Pass Application via EMGS Portal ⭐"
    ]
  },
  {
    id: "my-STU-006",
    officialCode: "MY-STU-006",
    name: "Student Pass - Research 1Y Research Student Pass Research Student MY",
    fee: "MYR 1000 Student pass research 1Y + EMGS research + VAL research",
    validity: "1 Year renewable",
    stay: "Research duration",
    processing: "14 to 21 Business Days (EMGS)",
    purpose: "Visiting research scholars and exchange researchers at Malaysian universities",
    eligibility: "Research scholars affiliated with foreign universities visiting Malaysian institution",
    officialSource: "https://visa.educationmalaysia.gov.my",
    categoryCode: "student",
    record_type: "RESEARCH_VISA",
    docs: [
      "University Visiting Research Invitation Letter ⭐",
      "Home Institution Research Approval & Grant Letter ⭐",
      "EMGS Research VAL Clearance",
      "Student Pass Research Application via EMGS ⭐"
    ]
  },
  {
    id: "my-STU-007",
    officialCode: "MY-STU-007",
    name: "Student Pass - Scholarship 1Y Scholarship Student Pass Scholarship Student MY",
    fee: "MYR 1000 Student pass scholarship 1Y + EMGS scholarship + VAL scholarship",
    validity: "1 Year renewable for scholarship term",
    stay: "Scholarship study period",
    processing: "14 Business Days (EMGS)",
    purpose: "Recipients of Malaysian International Scholarship (MIS) or university scholarships",
    eligibility: "Scholarship awardees studying in Malaysia",
    officialSource: "https://visa.educationmalaysia.gov.my",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Official Scholarship Award Letter (MIS / MOHE / University) ⭐",
      "University Acceptance Letter ⭐",
      "EMGS VAL Approval Letter",
      "Student Pass Application via EMGS Portal ⭐"
    ]
  },
  {
    id: "my-STU-008",
    officialCode: "MY-STU-008",
    name: "EMGS Authority Education Malaysia Global Services Authority Student EMGS",
    fee: "MYR 0 EMGS authority MY",
    validity: "Official Authority Portal",
    stay: "Official Student Processing Guidance",
    processing: "Official One-Stop Agency",
    purpose: "Official government agency managing all international student visa applications in Malaysia",
    eligibility: "All international students and educational institutions in Malaysia",
    officialSource: "https://visa.educationmalaysia.gov.my",
    categoryCode: "student",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "EMGS Official Student Visa Portal Information (visa.educationmalaysia.gov.my) ⭐",
      "EMGS Visa Approval Letter (VAL) Processing Guidelines ⭐"
    ]
  },

  // FAMILY 8 LIVE
  {
    id: "my-FAM-001",
    officialCode: "MY-FAM-001",
    name: "Dependent Pass 1Y 5Y Dependent Pass 1Y 5Y Family Reunification - Most common Family Malaysia",
    fee: "MYR 300 Dependent pass 1Y 5Y MY + Company EP holder",
    validity: "Co-terminus with primary EP Category I / II or RP-T pass (1–5 years)",
    stay: "Family residency during EP duration",
    processing: "10 to 14 Business Days (ESD MYXpats Portal esd.imi.gov.my)",
    purpose: "Spouse and unmarried children under 18 of Employment Pass I/II or RP-T holders",
    eligibility: "Direct dependents of qualifying expatriate pass holders in Malaysia",
    officialSource: "https://esd.imi.gov.my",
    popular: true,
    highlight: true,
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Primary Expatriate's EP I / EP II / RP-T Approval & Pass Copy ⭐",
      "Attested Marriage Certificate (for spouse) / Birth Certificate (for children) ⭐",
      "Consular Legalization / Apostille of Certificates by Ministry ⭐",
      "Sponsoring Company Guarantee Letter ⭐",
      "Dependent Passport Copy (all pages) & Digital Photo",
      "Dependent Pass Application submitted via ESD Portal ⭐"
    ],
    warningBox: "✅ Most common family Malaysia Dependent Pass 1Y 5Y family reunification - EP holder + ESD"
  },
  {
    id: "my-FAM-002",
    officialCode: "MY-FAM-002",
    name: "Dependent Pass Extension Extension Dependent Pass 1Y Extension Dependent Pass MY",
    fee: "MYR 300 Dependent pass extension 1Y MY",
    validity: "Extension matching primary EP renewal",
    stay: "Extended dependent stay",
    processing: "7 to 10 Business Days (ESD)",
    purpose: "Extending dependent pass alongside primary expatriate's EP renewal",
    eligibility: "Existing Dependent Pass holders",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "family",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Primary Expatriate's Renewed EP Pass Copy ⭐",
      "Employer Renewal Support Letter ⭐",
      "Current Dependent Passport with Valid Pass Sticker",
      "Dependent Pass Renewal via ESD Portal ⭐"
    ]
  },
  {
    id: "my-FAM-003",
    officialCode: "MY-FAM-003",
    name: "Long Term Social Visit Pass LTSVP 5Y Long Term Social Visit Pass LTSVP 5Y LTSVP MY",
    fee: "MYR 300 LTSVP 5Y MY + Spouse MY citizen",
    validity: "Up to 5 Years renewable pass",
    stay: "Continuous residence in Malaysia",
    processing: "14 to 30 Business Days (State Immigration Department - JIM)",
    purpose: "Spouse of Malaysian citizen, unmarried adult children over 18, or parents of EP holders",
    eligibility: "Foreign family members of Malaysian citizens or expatriate pass holders",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Malaysian Citizen's MyKad ID / Expatriate EP Pass Copy ⭐",
      "Attested Marriage Certificate / Birth Certificate ⭐",
      "Sponsor's Proof of Income & Bank Statements (3 months) ⭐",
      "Sponsor Statutory Declaration (Akuan Bersumpah) ⭐",
      "Joint Accommodation Lease / Property Ownership",
      "LTSVP Application Form (Imm. 55) at State Immigration ⭐"
    ]
  },
  {
    id: "my-FAM-004",
    officialCode: "MY-FAM-004",
    name: "LTSVP Extension Extension LTSVP 5Y Extension LTSVP MY",
    fee: "MYR 300 LTSVP extension 5Y MY",
    validity: "Extension up to 5 Years",
    stay: "Extended residence",
    processing: "10 to 14 Business Days (JIM)",
    purpose: "Renewing Long Term Social Visit Pass for foreign family members",
    eligibility: "Current LTSVP holders",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "family",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "Sponsor's Renewal Declaration & MyKad/EP Copy ⭐",
      "Joint Income Tax / Bank Statement Verification ⭐",
      "Current Passport with LTSVP Pass Sticker",
      "LTSVP Extension Application at JIM Counter ⭐"
    ]
  },
  {
    id: "my-FAM-005",
    officialCode: "MY-FAM-005",
    name: "Dependent Pass - Child 1Y 5Y Child Dependent Pass Child Dependent Pass MY",
    fee: "MYR 300 Dependent pass child 1Y 5Y MY + Company EP holder child",
    validity: "Co-terminus with parent's EP (up to 5 years)",
    stay: "Child residency & schooling allowance",
    processing: "10 to 14 Business Days (ESD)",
    purpose: "Unmarried biological or legally adopted children under 18 of EP holders",
    eligibility: "Children of EP Category I / II or RP-T pass holders",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Attested Birth Certificate / Adoption Order ⭐",
      "Parent's Employment Pass Approval & Passport Copy ⭐",
      "School Enrollment Letter in Malaysia (if attending school)",
      "Child Passport & Digital Photos",
      "Child Dependent Pass Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-FAM-006",
    officialCode: "MY-FAM-006",
    name: "LTSVP - Spouse Citizen 5Y Spouse Citizen LTSVP Spouse Citizen LTSVP MY",
    fee: "MYR 300 LTSVP spouse citizen 5Y MY + Spouse MY citizen LTSVP spouse",
    validity: "5 Years renewable pass with work permission endorsement",
    stay: "5 Years continuous residence",
    processing: "30 Business Days (JIM Spouse Unit)",
    purpose: "Foreign spouse of a Malaysian citizen with work endorsement rights",
    eligibility: "Foreign nationals legally married to a Malaysian citizen",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Malaysian Marriage Registration Certificate (JPN) ⭐",
      "Malaysian Citizen Spouse MyKad & Birth Certificate ⭐",
      "Joint Bank Statements & Household Proof ⭐",
      "Spouse Permission / Work Endorsement Request Letter",
      "LTSVP Spouse Application at Immigration Department ⭐"
    ]
  },
  {
    id: "my-FAM-007",
    officialCode: "MY-FAM-007",
    name: "Dependent Pass - Parent 1Y 5Y Parent Dependent Pass Parent Dependent Pass MY",
    fee: "MYR 300 Dependent pass parent 1Y 5Y MY + Company EP holder parent",
    validity: "1 Year renewable (co-terminus with EP)",
    stay: "Parental residency",
    processing: "14 Business Days (ESD / JIM)",
    purpose: "Elderly parents or parents-in-law of EP Category I / RP-T holders",
    eligibility: "Parents of qualifying high-earning expatriates in Malaysia",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Legalized Birth Certificate of Expatriate proving parentage ⭐",
      "Primary Expatriate's EP I / RP-T Pass Copy & Salary Proof ⭐",
      "Medical Fitness & Health Insurance Policy for Parent ⭐",
      "Parent Dependent Pass Application via ESD / JIM ⭐"
    ]
  },
  {
    id: "my-FAM-008",
    officialCode: "MY-FAM-008",
    name: "eVisa Family Visit 90 Days eVisa Family Visit Family Visit eVisa MY",
    fee: "MYR 200 eVisa family visit MY",
    validity: "90 days single entry",
    stay: "Max 30 days",
    processing: "2 to 3 Business Days (windowmalaysia.my)",
    purpose: "Short-term family visits to relatives living in Malaysia",
    eligibility: "Family members visiting residents in Malaysia",
    officialSource: "https://www.windowmalaysia.my",
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Family Member Invitation Letter from Malaysia ⭐",
      "Host's IC / Passport & Residence Pass Copy ⭐",
      "Proof of Family Relationship (Birth/Marriage certificates)",
      "Applicant Passport 6M + Bank Statement 3M",
      "eVisa Family Visit Application (windowmalaysia.my) ⭐"
    ]
  },

  // PR 6 LIVE + SPECIAL 18 LIVE = 24
  {
    id: "my-PR-001",
    officialCode: "MY-PR-001",
    name: "Permanent Residence PR 5Y Permanent Residence PR 5Y - PR Malaysia - PR MY",
    fee: "MYR 5000 PR 5Y MY + Residence 5Y",
    validity: "Permanent Residency status (MyPR Red IC)",
    stay: "Indefinite permanent residency",
    processing: "6 to 12 Months (Immigration Entry Permit Division)",
    purpose: "Permanent settlement in Malaysia under Investor, Expert, Professional, or Citizen Spouse categories",
    eligibility: "Foreign nationals meeting statutory residency, investment, or expertise criteria",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "Entry Permit Application Form (Imm. 4) ⭐",
      "5 Years Continuous Legal Residence Records in Malaysia ⭐",
      "Proof of Employment / Business Ownership / High Expertise ⭐",
      "Malaysian Tax Clearance (LHDN EA/BE forms) for 5+ Years ⭐",
      "Good Conduct Clearance Certificate (Royal Malaysia Police / Home Ministry) ⭐",
      "Malaysian Sponsor MyKad Identification",
      "MyPR Entry Permit Application at Putrajaya JIM ⭐"
    ]
  },
  {
    id: "my-PR-002",
    officialCode: "MY-PR-002",
    name: "Permanent Residence - Spouse Citizen 5Y Spouse Citizen PR 5Y Spouse Citizen PR MY",
    fee: "MYR 5000 PR spouse citizen 5Y MY + Marriage 5Y",
    validity: "Permanent Residency (MyPR)",
    stay: "Indefinite permanent stay",
    processing: "6 to 12 Months (JIM Spouse PR Unit)",
    purpose: "Permanent residence for foreign spouses of Malaysian citizens after 5+ years LTSVP",
    eligibility: "Foreign spouses continuously married to a Malaysian citizen for 5+ years on LTSVP",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "5 Years LTSVP Pass Verification & Residence History ⭐",
      "Malaysian Marriage Certificate (JPN) ⭐",
      "Malaysian Citizen Spouse Sponsorship & Statutory Declaration ⭐",
      "Joint Tax Returns & Bank Statements",
      "MyPR Citizen Spouse Application at Putrajaya JIM ⭐"
    ]
  },
  {
    id: "my-PR-003",
    officialCode: "MY-PR-003",
    name: "Permanent Residence - Investor Investor PR Investor PR MY",
    fee: "MYR 5000 PR investor MY + Investment MYR 2M",
    validity: "Permanent Residency (MyPR)",
    stay: "Indefinite permanent stay",
    processing: "3 to 6 Months (JIM Investor PR Unit)",
    purpose: "Permanent residency for high-net-worth investors depositing USD/MYR 2,000,000 in Malaysian bank",
    eligibility: "High-net-worth individual placing MYR 2,000,000 fixed deposit in Malaysian bank for 5 years",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "Fixed Deposit Certificate of MYR 2,000,000 in Licensed Malaysian Bank ⭐",
      "Proof of Wealth & Offshore Capital Source Clearance ⭐",
      "Good Conduct Clearance Certificate",
      "MyPR Investor Application via Putrajaya JIM ⭐"
    ]
  },
  {
    id: "my-PR-004",
    officialCode: "MY-PR-004",
    name: "Permanent Residence - Expert Expert PR Expert PR MY",
    fee: "MYR 5000 PR expert MY + Expert",
    validity: "Permanent Residency (MyPR)",
    stay: "Indefinite permanent stay",
    processing: "6 to 12 Months (Relevant Ministry + JIM)",
    purpose: "Permanent residency for world-renowned experts, scientists, and scholars",
    eligibility: "Individuals endorsed by Malaysian agency/ministry as world-class experts",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "Recommendation Letter from Relevant Malaysian Ministry / Agency ⭐",
      "International Awards, Patents, or Scientific Credentials ⭐",
      "Good Conduct Clearance Certificate",
      "MyPR Expert Application via Putrajaya JIM ⭐"
    ]
  },
  {
    id: "my-PR-005",
    officialCode: "MY-PR-005",
    name: "Residence Pass - Talent Extension RP-T Extension 10Y RP-T Extension MY",
    fee: "MYR 1000 RP-T extension 10Y MY + TalentCorp RP-T extension",
    validity: "10 Years extension",
    stay: "Continued long-term residency",
    processing: "21 Business Days (TalentCorp)",
    purpose: "Renewing 10-Year Residence Pass - Talent for top foreign professionals",
    eligibility: "RP-T holders completing initial 10-year period",
    officialSource: "https://www.talentcorp.com.my",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "TalentCorp 10-Year Extension Endorsement ⭐",
      "Tax Compliance Clearance for past 10 years (LHDN) ⭐",
      "RP-T Extension Application via TalentCorp ⭐"
    ]
  },
  {
    id: "my-PR-006",
    officialCode: "MY-PR-006",
    name: "Malaysia Premium Visa Programme PVIP 20Y Malaysia Premium Visa Programme PVIP 20Y PVIP MY",
    fee: "MYR 200k PVIP 20Y + Fixed deposit MYR 1M + Income MYR 40k/month + PVIP MY",
    validity: "20 Years multiple entry residency pass (issued in 5-year blocks)",
    stay: "20 Years residency with work/business permissions",
    processing: "30 to 45 Business Days (PVIP Portal / JIM)",
    purpose: "Residency-by-investment for global investors, entrepreneurs, and high-net-worth individuals",
    eligibility: "Applicants paying MYR 200,000 upfront fee + MYR 1,000,000 Fixed Deposit + MYR 40,000/mo income",
    officialSource: "https://pvip.imi.gov.my",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "PVIP Official Approval Letter from Immigration Department ⭐",
      "Receipt of Upfront Participation Fee (MYR 200,000) ⭐",
      "Fixed Deposit Receipt of MYR 1,000,000 in Malaysian Bank ⭐",
      "Proof of Offshore Monthly Income MYR 40,000+ ⭐",
      "Good Conduct Certificate & Medical Clearance ⭐",
      "PVIP Application via Official PVIP Portal ⭐"
    ]
  },
  {
    id: "my-SPE-001",
    officialCode: "MY-SPE-001",
    name: "MM2H Extension Extension MM2H 10Y Extension MM2H MY",
    fee: "MYR 5000 MM2H extension 10Y + Fixed deposit MYR 1M + Income MYR 40k/month extension MM2H",
    validity: "10 Years extension",
    stay: "Continued MM2H residency",
    processing: "21 Business Days (MM2H Centre)",
    purpose: "Extending MM2H 10-Year Social Visit Pass",
    eligibility: "MM2H pass holders fulfilling financial obligations",
    officialSource: "https://www.mm2h.gov.my",
    categoryCode: "tourist",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "MM2H Extension Approval Letter ⭐",
      "Active Fixed Deposit Receipt (MYR 1M) ⭐",
      "Proof of Continued Offshore Income (MYR 40k/mo)",
      "MM2H Extension Application via Portal ⭐"
    ]
  },
  {
    id: "my-SPE-002",
    officialCode: "MY-SPE-002",
    name: "Digital Nomad DE Rantau Extension Extension DE Rantau 1Y Extension Digital Nomad DE Rantau MY",
    fee: "MYR 1000 DE Rantau extension 1Y + Income USD 24k/year extension DE Rantau",
    validity: "1 Year extension (up to 2 years max)",
    stay: "Extended digital nomad stay",
    processing: "14 Business Days (MDEC)",
    purpose: "Extending DE Rantau digital nomad pass",
    eligibility: "Digital nomads maintaining USD 24k/year income",
    officialSource: "https://mdec.my/derantau",
    categoryCode: "tourist",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "MDEC DE Rantau Extension Clearance ⭐",
      "Updated Remote Income Statements USD 24,000+ ⭐",
      "DE Rantau Extension Application via MDEC ⭐"
    ]
  },
  {
    id: "my-SPE-003",
    officialCode: "MY-SPE-003",
    name: "PVIP Extension Extension PVIP 20Y Extension PVIP MY",
    fee: "MYR 200k PVIP extension 20Y + Fixed deposit MYR 1M + Income MYR 40k/month extension PVIP",
    validity: "5 Years renewal block under 20-year PVIP framework",
    stay: "Continued PVIP residence",
    processing: "14 Business Days (PVIP Unit)",
    purpose: "Issuing next 5-year block for 20-Year PVIP holder",
    eligibility: "PVIP pass holders maintaining Fixed Deposit",
    officialSource: "https://pvip.imi.gov.my",
    categoryCode: "pr",
    record_type: "STATUS_DOCUMENT",
    docs: [
      "PVIP Pass Renewal Request ⭐",
      "Proof of Maintained Fixed Deposit (MYR 1M) ⭐",
      "PVIP Renewal Application via Portal ⭐"
    ]
  },
  {
    id: "my-SPE-004",
    officialCode: "MY-SPE-004",
    name: "Diplomat Visa Diplomat Visa Diplomat Visa Diplomat MY",
    fee: "MYR 0 Diplomat MY",
    validity: "Diplomatic posting duration",
    stay: "Diplomatic assignment",
    processing: "3 to 5 Days (MFA Wisma Putra)",
    purpose: "Foreign diplomats posted to accredited foreign missions in Malaysia",
    eligibility: "Diplomatic passport holders",
    officialSource: "https://www.kln.gov.my",
    categoryCode: "business",
    record_type: "DIPLOMAT_VISA",
    docs: [
      "Diplomatic Note Verbale from Foreign Ministry ⭐",
      "Diplomatic Passport Copy ⭐",
      "Official Posting Letter to Malaysia Mission",
      "Wisma Putra Diplomatic Endorsement ⭐"
    ]
  },
  {
    id: "my-SPE-005",
    officialCode: "MY-SPE-005",
    name: "Official Visa Official Visa Official Visa Official MY",
    fee: "MYR 0 Official MY",
    validity: "Official mission duration",
    stay: "Official posting period",
    processing: "3 to 5 Days (MFA Wisma Putra)",
    purpose: "Foreign government officials on bilateral state missions to Malaysia",
    eligibility: "Official passport holders",
    officialSource: "https://www.kln.gov.my",
    categoryCode: "business",
    record_type: "OFFICIAL_VISA",
    docs: [
      "Official Note Verbale ⭐",
      "Official Passport Copy ⭐",
      "Government Delegation Orders",
      "Wisma Putra Official Clearance ⭐"
    ]
  },
  {
    id: "my-SPE-006",
    officialCode: "MY-SPE-006",
    name: "Courtesy Visa Courtesy Visa Courtesy Visa Courtesy MY",
    fee: "MYR 0 Courtesy MY",
    validity: "As approved on courtesy basis",
    stay: "Approved courtesy duration",
    processing: "3 to 5 Days (JIM / MFA)",
    purpose: "Visiting dignitaries and guests of Malaysian Government",
    eligibility: "Individuals granted courtesy entry privileges",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "business",
    record_type: "COURTESY_VISA",
    docs: [
      "Official Invitation from Malaysian Government Body ⭐",
      "Passport Copy & Courtesy Request Letter ⭐"
    ]
  },
  {
    id: "my-SPE-007",
    officialCode: "MY-SPE-007",
    name: "Crew Visa Crew Visa Crew Visa Crew MY",
    fee: "MYR 0 Crew MY",
    validity: "Up to 14 Days",
    stay: "Port / airport crew layover",
    processing: "Immediate at Port / Airport Control",
    purpose: "Airline crew and maritime vessel crew entering Malaysian ports or airports",
    eligibility: "Active commercial airline and maritime crew",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "tourist",
    record_type: "CREW_VISA",
    docs: [
      "Valid Seaman Book / Flight Crew License ⭐",
      "General Manifest & Crew List ⭐",
      "Vessel / Aircraft Arrival Declaration ⭐"
    ]
  },
  {
    id: "my-SPE-008",
    officialCode: "MY-SPE-008",
    name: "Student Pass - Medical Medical Student Pass Medical Student MY",
    fee: "MYR 1000 Student pass medical + EMGS medical + VAL medical",
    validity: "Up to 5 Years",
    stay: "Medical degree duration",
    processing: "14 to 21 Business Days (EMGS + MMC)",
    purpose: "Medical, dental, or pharmacy studies at accredited Malaysian universities",
    eligibility: "Medical students accepted by Malaysian Medical Council (MMC) accredited schools",
    officialSource: "https://visa.educationmalaysia.gov.my",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Malaysian Medical Council (MMC) Clearance ⭐",
      "EMGS Medical Student VAL ⭐",
      "Medical School Acceptance & Transcripts ⭐"
    ]
  },
  {
    id: "my-SPE-009",
    officialCode: "MY-SPE-009",
    name: "Professional Visit Pass - Volunteer Volunteer PVP Volunteer Professional Visit MY",
    fee: "MYR 1200 PVP volunteer MY + Company MY volunteer",
    validity: "Up to 12 Months",
    stay: "Voluntary service period",
    processing: "14 Business Days (ESD)",
    purpose: "Voluntary and humanitarian work with registered Malaysian NGOs/charities",
    eligibility: "Volunteers sponsored by registered Malaysian non-profit bodies",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "business",
    record_type: "VOLUNTEER_VISA",
    docs: [
      "NGO Registration Certificate in Malaysia ⭐",
      "Volunteer Agreement & Scope of Humanitarian Service ⭐",
      "PVP Volunteer Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-SPE-010",
    officialCode: "MY-SPE-010",
    name: "APEC Business Travel Card ABTC APEC Business Travel Card ABTC APEC MY",
    fee: "MYR 100 ABTC MY",
    validity: "5 Years multiple entry",
    stay: "Max 60–90 days per visit",
    processing: "Pre-clearance via APEC scheme",
    purpose: "Fast-track business travel across APEC member economies",
    eligibility: "APEC Card holders with MY pre-clearance",
    officialSource: "https://www.apec.org",
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Valid APEC Business Travel Card with MY clearance ⭐",
      "Valid Passport (6M validity) ⭐",
      "Digital Arrival Card (MDAC) ⭐"
    ]
  },
  {
    id: "my-SPE-011",
    officialCode: "MY-SPE-011",
    name: "Employment Pass - Investor Investor EP Investor EP MY",
    fee: "MYR 300 EP investor + ESD MY investor + Company EP investor + Investment MYR 500k",
    validity: "Up to 5 Years renewable",
    stay: "Investor executive duration",
    processing: "10 to 15 Business Days (ESD)",
    purpose: "Executive employment pass for foreign business owners investing MYR 500,000+",
    eligibility: "Investor-directors of Malaysian registered Sdn Bhd companies",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "business",
    record_type: "INVESTOR_VISA",
    docs: [
      "ESD Approval for Investor EP ⭐",
      "Proof of Paid-up Capital MYR 500,000+ in SSM Corporate Profile ⭐",
      "Audited Accounts & Bank Statements",
      "EP Investor Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-SPE-012",
    officialCode: "MY-SPE-012",
    name: "Residence Pass - Investor Investor Residence Pass Investor Residence Pass MY",
    fee: "MYR 1000 Residence pass investor MY + Investment MYR 500k",
    validity: "10 Years renewable pass",
    stay: "10 Years residency",
    processing: "30 Business Days (TalentCorp / MIDA)",
    purpose: "10-Year residency pass for major foreign corporate investors",
    eligibility: "High-value foreign corporate investors",
    officialSource: "https://www.mida.gov.my",
    categoryCode: "pr",
    record_type: "INVESTOR_VISA",
    docs: [
      "MIDA Investor Endorsement Letter ⭐",
      "Proof of Major Capital Investment in Strategic Sector ⭐",
      "Residence Pass Application via MIDA / TalentCorp ⭐"
    ]
  },
  {
    id: "my-SPE-013",
    officialCode: "MY-SPE-013",
    name: "Transit Without Visa TWOV Transit Without Visa TWOV Transit Without Visa MY",
    fee: "MYR 0 TWOV MY",
    validity: "24 Hours to 120 Hours",
    stay: "Transit duration",
    processing: "Immediate at Airport",
    purpose: "Transit without visa through KLIA for selected nationalities",
    eligibility: "Transiting airline passengers with confirmed onward tickets",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "tourist",
    record_type: "TRANSIT_VISA",
    docs: [
      "Confirmed Onward Flight Ticket within 24–120 Hours ⭐",
      "Valid Passport 6M+ ⭐",
      "TWOV Application at KLIA Counter ⭐"
    ]
  },
  {
    id: "my-SPE-014",
    officialCode: "MY-SPE-014",
    name: "Social Visit - Widow Widow Social Visit Widow Social Visit MY",
    fee: "MYR 300 Widow social visit MY",
    validity: "1 Year renewable",
    stay: "Residency duration",
    processing: "14 to 21 Business Days (JIM)",
    purpose: "Foreign widow of deceased Malaysian citizen with resident children",
    eligibility: "Widows of Malaysian citizens caring for Malaysian citizen children",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "tourist",
    record_type: "FAMILY_VISA",
    docs: [
      "Death Certificate of Malaysian Citizen Husband ⭐",
      "Birth Certificates of Malaysian Citizen Children ⭐",
      "Marriage Certificate & JIM Application ⭐"
    ]
  },
  {
    id: "my-SPE-015",
    officialCode: "MY-SPE-015",
    name: "Journalist Visa Journalist Visa Journalist Visa Journalist MY",
    fee: "MYR 200 Journalist MY",
    validity: "Duration of media assignment",
    stay: "Assignment period",
    processing: "7 Business Days (Foreign Press Unit MFA)",
    purpose: "Foreign news correspondents and media journalists reporting from Malaysia",
    eligibility: "Accredited foreign press representatives",
    officialSource: "https://www.kln.gov.my",
    categoryCode: "business",
    record_type: "JOURNALIST_VISA",
    docs: [
      "Foreign Press Accreditation Pass ⭐",
      "Media Organization Assignment Letter ⭐",
      "Journalist eVisa Application via Portal ⭐"
    ]
  },
  {
    id: "my-SPE-016",
    officialCode: "MY-SPE-016",
    name: "Expatriate - Residence Pass RP 10Y Residence Pass RP 10Y Expatriate Residence Pass MY",
    fee: "MYR 1000 RP 10Y MY + TalentCorp RP",
    validity: "10 Years renewable",
    stay: "10 Years continuous residence",
    processing: "30 Business Days (TalentCorp)",
    purpose: "10-Year general Expatriate Residence Pass",
    eligibility: "Top expatriates recommended by TalentCorp",
    officialSource: "https://www.talentcorp.com.my",
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "TalentCorp RP Approval Letter ⭐",
      "Tax Compliance Clearance ⭐",
      "RP Application via TalentCorp Portal ⭐"
    ]
  },
  {
    id: "my-SPE-017",
    officialCode: "MY-SPE-017",
    name: "Employment Pass - Contract 1Y Contract EP 1Y Contract EP MY",
    fee: "MYR 300 EP contract 1Y + ESD MY contract + Company EP contract",
    validity: "1 Year renewable",
    stay: "Contract term",
    processing: "10 to 15 Business Days (ESD)",
    purpose: "Fixed-term contractual expatriate employment in Malaysian corporations",
    eligibility: "Contractual professionals recruited by ESD-registered entities",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Fixed-Term Contractual Employment Offer ⭐",
      "ESD Approval Letter ⭐",
      "Contract EP Application via ESD Portal ⭐"
    ]
  },
  {
    id: "my-SPE-018",
    officialCode: "MY-SPE-018",
    name: "Student Pass - Dependent Dependent Student Pass Dependent Student MY",
    fee: "MYR 1000 Student pass dependent + EMGS dependent + VAL dependent",
    validity: "Co-terminus with student pass",
    stay: "Student dependent stay",
    processing: "14 Business Days (EMGS)",
    purpose: "Spouse or children accompanying Master's / PhD postgraduate international students",
    eligibility: "Dependents of enrolled postgraduate Master's / PhD students",
    officialSource: "https://visa.educationmalaysia.gov.my",
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Postgraduate Student's Active Student Pass Copy ⭐",
      "Attested Marriage Certificate / Birth Certificate ⭐",
      "EMGS Dependent VAL Clearance ⭐"
    ]
  },

  // SUPPORTING 15 + LEGACY 10 = 25 SUPPORTING/LEGACY ENTRIES
  {
    id: "my-SUP-001",
    officialCode: "MY-SUP-001",
    name: "eVisa Authority eVisa windowmalaysia.my Authority Visa eVisa",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Official eVisa processing portal (windowmalaysia.my)",
    eligibility: "Official Classification",
    officialSource: "https://www.windowmalaysia.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["eVisa Authority Reference (windowmalaysia.my) ⭐"]
  },
  {
    id: "my-SUP-002",
    officialCode: "MY-SUP-002",
    name: "Immigration Authority Malaysia Immigration Department Authority Visa Immigration",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Immigration Department of Malaysia (Jabatan Imigresen Malaysia - JIM)",
    eligibility: "Official Classification",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Immigration Department Authority Reference (imi.gov.my) ⭐"]
  },
  {
    id: "my-SUP-003",
    officialCode: "MY-SUP-003",
    name: "ESD Authority Expatriate Services Division Authority Employment Pass ESD",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Expatriate Services Division (ESD) - Employment pass & PVP portal",
    eligibility: "Official Classification",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["ESD Authority Reference (esd.imi.gov.my) ⭐"]
  },
  {
    id: "my-SUP-004",
    officialCode: "MY-SUP-004",
    name: "EMGS Authority Education Malaysia Global Services Authority Student EMGS",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Education Malaysia Global Services (EMGS) - Student pass portal",
    eligibility: "Official Classification",
    officialSource: "https://visa.educationmalaysia.gov.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["EMGS Authority Reference (emgs.com.my) ⭐"]
  },
  {
    id: "my-SUP-005",
    officialCode: "MY-SUP-005",
    name: "MDEC Authority Malaysia Digital Economy Corporation Authority Digital Nomad MDEC",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Malaysia Digital Economy Corporation (MDEC) - DE Rantau portal",
    eligibility: "Official Classification",
    officialSource: "https://mdec.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["MDEC Authority Reference (mdec.my) ⭐"]
  },
  {
    id: "my-SUP-006",
    officialCode: "MY-SUP-006",
    name: "MM2H Authority Malaysia My Second Home Authority Retirement MM2H",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Malaysia My Second Home (MM2H) Centre",
    eligibility: "Official Classification",
    officialSource: "https://www.mm2h.gov.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["MM2H Authority Reference (mm2h.gov.my) ⭐"]
  },
  {
    id: "my-SUP-007",
    officialCode: "MY-SUP-007",
    name: "PVIP Authority Malaysia Premium Visa Programme Authority PR PVIP",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Malaysia Premium Visa Programme (PVIP) Center",
    eligibility: "Official Classification",
    officialSource: "https://pvip.imi.gov.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["PVIP Authority Reference (pvip.imi.gov.my) ⭐"]
  },
  {
    id: "my-SUP-008",
    officialCode: "MY-SUP-008",
    name: "TalentCorp Authority Talent Corporation Malaysia Authority Talent TalentCorp",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Talent Corporation Malaysia Berhad (TalentCorp) - RP-T agency",
    eligibility: "Official Classification",
    officialSource: "https://www.talentcorp.com.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["TalentCorp Authority Reference (talentcorp.com.my) ⭐"]
  },
  {
    id: "my-SUP-009",
    officialCode: "MY-SUP-009",
    name: "EP Authority Employment Pass Authority Work Employment Pass",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Employment Pass regulatory framework authority",
    eligibility: "Official Classification",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["EP Framework Reference ⭐"]
  },
  {
    id: "my-SUP-010",
    officialCode: "MY-SUP-010",
    name: "PVP Authority Professional Visit Pass Authority Business PVP",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Professional Visit Pass (PVP) regulatory body",
    eligibility: "Official Classification",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["PVP Framework Reference ⭐"]
  },
  {
    id: "my-SUP-011",
    officialCode: "MY-SUP-011",
    name: "Dependent Authority Dependent Pass Authority Family Dependent",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Dependent Pass regulatory framework",
    eligibility: "Official Classification",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Dependent Pass Framework Reference ⭐"]
  },
  {
    id: "my-SUP-012",
    officialCode: "MY-SUP-012",
    name: "LTSVP Authority Long Term Social Visit Pass Authority Family LTSVP",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Long Term Social Visit Pass regulatory body",
    eligibility: "Official Classification",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["LTSVP Framework Reference ⭐"]
  },
  {
    id: "my-SUP-013",
    officialCode: "MY-SUP-013",
    name: "Student Authority Student Pass Authority Student Student",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Student Pass regulatory framework",
    eligibility: "Official Classification",
    officialSource: "https://visa.educationmalaysia.gov.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["Student Pass Framework Reference ⭐"]
  },
  {
    id: "my-SUP-014",
    officialCode: "MY-SUP-014",
    name: "DE Rantau Authority DE Rantau Digital Nomad Authority Digital Nomad DE Rantau",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "DE Rantau digital nomad framework authority",
    eligibility: "Official Classification",
    officialSource: "https://mdec.my/derantau",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["DE Rantau Framework Reference ⭐"]
  },
  {
    id: "my-SUP-015",
    officialCode: "MY-SUP-015",
    name: "RP-T Authority Residence Pass Talent Authority Talent RP-T",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "-",
    purpose: "Residence Pass Talent framework authority",
    eligibility: "Official Classification",
    officialSource: "https://www.talentcorp.com.my",
    categoryCode: "supporting",
    record_type: "SUPPORTING_CLASSIFICATION",
    docs: ["RP-T Framework Reference ⭐"]
  },
  {
    id: "my-LEG-001",
    officialCode: "MY-LEG-001",
    name: "Legacy eVisa Tourist 30 Days Old System Closed Replaced by New eVisa 90 Days windowmalaysia.my",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy eVisa tourist 30-day category (system upgraded to 90 days)",
    eligibility: "Archived classification",
    officialSource: "https://www.windowmalaysia.my",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "my-LEG-002",
    officialCode: "MY-LEG-002",
    name: "Legacy Social Visit 30 Days Old System Closed Replaced by New Social Visit 90 Days",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy social visit 30-day category (upgraded to 90 days)",
    eligibility: "Archived classification",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "my-LEG-003",
    officialCode: "MY-LEG-003",
    name: "Legacy Employment Pass 2Y Old System Closed Replaced by New Employment Pass EP I II III 1Y 5Y ESD",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy generic 2-year EP (replaced by ESD EP I/II/III structure)",
    eligibility: "Archived classification",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "my-LEG-004",
    officialCode: "MY-LEG-004",
    name: "Legacy Professional Visit Pass 6M Old System Closed Replaced by New PVP 1Y ESD",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 6M PVP (replaced by 12M ESD PVP system)",
    eligibility: "Archived classification",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "my-LEG-005",
    officialCode: "MY-LEG-005",
    name: "Legacy MM2H 5Y Old System Closed Replaced by New MM2H 10Y Fixed Deposit MYR 1M",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy MM2H 5-year rules (replaced by MOTAC 10-year MM2H framework)",
    eligibility: "Archived classification",
    officialSource: "https://www.mm2h.gov.my",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "my-LEG-006",
    officialCode: "MY-LEG-006",
    name: "Legacy Student Pass 1Y Old System Closed Replaced by New Student Pass 1Y EMGS VAL",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy student visa manual processing (replaced by EMGS VAL portal)",
    eligibility: "Archived classification",
    officialSource: "https://visa.educationmalaysia.gov.my",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "my-LEG-007",
    officialCode: "MY-LEG-007",
    name: "Legacy Dependent Pass 1Y Old System Closed Replaced by New Dependent Pass 1Y 5Y ESD",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy manual dependent pass (replaced by ESD online portal)",
    eligibility: "Archived classification",
    officialSource: "https://esd.imi.gov.my",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "my-LEG-008",
    officialCode: "MY-LEG-008",
    name: "Legacy LTSVP 1Y Old System Closed Replaced by New LTSVP 5Y Immigration",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 1-year LTSVP (replaced by 5-year LTSVP framework)",
    eligibility: "Archived classification",
    officialSource: "https://www.imi.gov.my",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "my-LEG-009",
    officialCode: "MY-LEG-009",
    name: "Legacy RP-T 5Y Old System Closed Replaced by New RP-T 10Y TalentCorp",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy 5-year Residence Pass (upgraded to 10-year RP-T framework)",
    eligibility: "Archived classification",
    officialSource: "https://www.talentcorp.com.my",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  },
  {
    id: "my-LEG-010",
    officialCode: "MY-LEG-010",
    name: "Legacy PVIP 5Y Old System Closed Replaced by New PVIP 20Y Fixed Deposit MYR 1M",
    fee: "-",
    validity: "-",
    stay: "-",
    processing: "Archived / Legacy System",
    purpose: "Legacy PVIP 5-year framework (upgraded to 20-year PVIP framework)",
    eligibility: "Archived classification",
    officialSource: "https://pvip.imi.gov.my",
    categoryCode: "supporting",
    record_type: "LEGACY_VISA",
    docs: ["Archived classification record ⭐"]
  }
];

export const MALAYSIA_84_VISAS: CountryVisas = {
  tourist: [],
  business: [],
  work: [],
  student: [],
  family: [],
  pr: []
};

// Populate MALAYSIA_84_VISAS with micro details generated dynamically
RAW_MY_VISAS.forEach(visa => {
  const cat = visa.categoryCode as keyof CountryVisas;
  if (!MALAYSIA_84_VISAS[cat]) {
    MALAYSIA_84_VISAS[cat] = [];
  }
  
  const micro = getMalaysiaMicroDetails(visa.officialCode || visa.id, cat, visa.name);
  const enrichedVisa: VisaItem = {
    ...visa,
    microDetails: micro
  };
  
  MALAYSIA_84_VISAS[cat].push(enrichedVisa);
});
