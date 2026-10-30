import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getVietnamMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "e-Visa DL / DN1 / VOA / Temporary Residence Card (TRC) requires proof of sufficient funds (min USD 50 per day of stay in Vietnam or bank statement of USD 2,000–3,000). Vietnam Immigration Department (Cục Quản lý xuất nhập cảnh) requires 3 months bank statements.";
  let fundsBankMonths = "Last 3 months personal bank statements stamped by bank showing liquid USD/VND balance.";
  let fundsSudden = "❌ Sudden 1-day cash deposits right before visa submission on evisa.xuatnhapcanh.gov.vn are flagged. Maintaining a steady balance over 3 months ensures fast approval.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement with USD 2,000+ liquid balance. ❌ Galat: Unexplained cash deposit 24 hours prior to application.";

  let itrYears = "Tax returns or salary slips for past 2–3 years for LD1/LD2 work permit, investor DT1–DT4, and TRC applicants.";
  let itrMatch = "Reported income must reconcile with personal bank credits and MOLISA (Ministry of Labour, Invalids and Social Affairs) work permit contract.";
  let itrNoItr = "Not required for short-term 90-day DL Tourist e-Visa or university students.";

  let bankMonths = "Last 3 months bank statements.";
  let bankReg = "Regular salary credits or steady corporate revenue.";
  let bankFd = "Fixed deposits accepted as supporting proof.";
  let bankSource = "Salary, corporate revenue, or verified parental sponsorship.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('ld1') || lowerCode.includes('ld2') || lowerCode.includes('trc') || lowerCode.includes('molisa')) {
    fundsMin = "Work Visa LD1 / LD2 requires a MOLISA (Ministry of Labour, Invalids and Social Affairs) Work Permit approval (Giấy phép lao động) + university degree + 3 years executive/expert experience certificate (Hợp pháp hóa lãnh sự) + criminal record check (Lý lịch tư pháp). Fee USD 25 e-Visa + USD 100 Work Permit + USD 155 TRC 2 Years.";
    fundsBankMonths = "MOLISA Work Permit approval, Vietnamese sponsor company contract, and 3 months bank statements.";
    fundsSudden = "Foreign degrees and 3-year experience certificates must be consularly legalized (Hợp pháp hóa lãnh sự) and translated to Vietnamese.";
    fundsEx = "✅ Sahi: MOLISA Work Permit approval + Legalized degree/experience certificate + 2-year TRC. ❌ Galat: Unlegalized foreign degree or missing MOLISA permit.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('dh')) {
    fundsMin = "Student Visa DH / TRC Student requires official Acceptance Letter from a recognized Vietnamese university (Ministry of Education and Training - MOET) + living funds proof (USD 3,000/year). TRC fee is USD 100 for 1–5 years.";
    fundsBankMonths = "3 months bank statements of student or parent sponsor showing min USD 3,000.";
    fundsSudden = "Parental guarantee letter and birth certificate required if sponsored by parents.";
    fundsEx = "✅ Sahi: Official MOET university acceptance letter + tuition receipt + USD 3,000 bank proof. ❌ Galat: Unregistered institution or missing acceptance letter.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('tt') || lowerCode.includes('vr')) {
    fundsMin = "Family Visa TT / VR / 5-Year Visa Exemption requires sponsor (foreign work permit holder for TT or Vietnamese citizen for VR/Exemption) + apostilled/legalized marriage or birth certificates. TRC TT fee USD 100–155 for 3 years.";
    fundsBankMonths = "Sponsor's work permit / TRC / Vietnamese citizen ID + past 3 salary slips and bank statements.";
    fundsSudden = "Marriage/Birth certificates must be consularly legalized with notarized Vietnamese translation.";
    fundsEx = "✅ Sahi: Consularly legalized marriage certificate + sponsor TRC/ID copy + 3-year TT TRC. ❌ Galat: Unlegalized marriage certificate.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('dn1') || lowerCode.includes('dn2') || lowerCode.includes('dt')) {
    fundsMin = "Business e-Visa DN1 / DN2 requires sponsorship letter (Công văn bảo lãnh) from a registered Vietnamese company (Enterprise Registration Certificate - ERC). Investor DT1–DT4 requires capital investment from VND 3 Billion to VND 100 Billion+.";
    fundsBankMonths = "3 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Vietnamese company must be active in official National Business Registration Portal.";
    fundsEx = "✅ Sahi: Official ERC company registration + Công văn bảo lãnh approval from Immigration Department. ❌ Galat: Unregistered sponsor company.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('prc')) {
    fundsMin = "Permanent Residence Card (PRC) requires 3 years continuous residence in Vietnam as a spouse/child of a Vietnamese citizen or person with national contribution / scientific merit.";
    fundsBankMonths = "3 years continuous residence proof, Vietnamese spouse ID, and criminal record check.";
    fundsSudden = "Continuous legal residence with stable living income required in Vietnam.";
    fundsEx = "✅ Sahi: 3 years continuous TRC residence + Vietnamese spouse ID + Lý lịch tư pháp. ❌ Galat: Gaps in residence permit.";
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

const RAW_VN_VISAS: VisaItem[] = [
  // TOURIST 14 LIVE
  {
    id: "vn-TOU-001",
    officialCode: "VN-TOU-001",
    name: "e-Visa Tourist DL Single 90 Days e-Visa DL Tourist 90 Days Single - Most common Tourist Vietnam",
    fee: "USD 25 e-Visa DL single 90 days",
    validity: "90 days single entry",
    stay: "Max 90 days",
    processing: "3 Business Days (Online Portal evisa.xuatnhapcanh.gov.vn)",
    purpose: "Tourism, sightseeing, holiday travel across all 42 international border gates of Vietnam",
    eligibility: "Citizens of all countries and territories eligible for official Vietnam 90-day single entry e-Visa",
    officialSource: "https://evisa.xuatnhapcanh.gov.vn",
    popular: true,
    highlight: true,
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport (minimum 6 months validity from arrival date, 1 blank page) ⭐",
      "Digital Passport Photo (4x6cm, white background, no glasses)",
      "Digital Passport Bio Page Scan (JPEG format)",
      "e-Visa Application submitted via official portal (evisa.xuatnhapcanh.gov.vn) ⭐",
      "Proof of Accommodation: Hotel Booking Confirmation in Vietnam",
      "Return Flight Ticket / Onward Travel Booking",
      "Bank Statement showing min USD 50 per day of stay ⭐"
    ]
  },
  {
    id: "vn-TOU-002",officialCode: "VN-TOU-002",name: "e-Visa Tourist DL Multiple 90 Days e-Visa DL Tourist 90 Days Multiple",fee: "USD 50 e-Visa DL multiple 90 days",validity: "90 days multiple entry",stay: "Max 90 days total",processing: "3 Business Days",purpose: "Frequent tourist trips to Vietnam with multiple entries over 90 days",eligibility: "Tourists planning multiple entries across land/sea/air borders in 90 days",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "tourist",record_type: "TOURIST_VISA",docs: ["Valid Passport 6M+ ⭐","Multiple Entry e-Visa Approval from evisa.xuatnhapcanh.gov.vn ⭐","Return Flight & Hotel Bookings"]
  },
  {
    id: "vn-TOU-003",officialCode: "VN-TOU-003",name: "Visa On Arrival Tourist 30 Days VOA Tourist 30 Days Approval Letter",fee: "USD 25 VOA approval letter + USD 25 stamping single",validity: "30 days single/multiple entry",stay: "Max 30 days",processing: "2 to 3 Days (Letter) + Airport Stamping",purpose: "Emergency or agency-organized tourist entry via international airports (Hanoi, HCMC, Da Nang)",eligibility: "Air travelers holding official Visa Approval Letter (Công văn nhập cảnh) issued by Immigration Department",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "tourist",record_type: "TOURIST_VISA",docs: ["Official Visa Approval Letter (Công văn nhập cảnh) from Immigration Department ⭐","NA1 Entry/Exit Form + 2 Photos (4x6cm) ⭐","Passport valid 6M+ + USD 25 cash Stamping Fee at Airport VOA Counter ⭐"]
  },
  {
    id: "vn-TOU-004",officialCode: "VN-TOU-004",name: "Visa Exemption 45 Days Visa Exemption 45 Days Visa Exemption VN",fee: "USD 0 Visa exemption 45 days VN",validity: "45 days single/multiple entry",stay: "Max 45 days",processing: "Immediate at border control",purpose: "Short holiday travel for nationals of 13 unilateral visa-exempt countries",eligibility: "Citizens of UK, Germany, France, Italy, Spain, Japan, South Korea, Russia, Sweden, Norway, Denmark, Finland, Belarus",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "tourist",record_type: "VISA_WAIVER",docs: ["Passport valid 6M+ from qualifying country ⭐","Confirmed Return Flight Ticket within 45 days ⭐"]
  },
  {
    id: "vn-TOU-005",officialCode: "VN-TOU-005",name: "Tourist Visa Extension Extension Tourist 30 Days 90 Days Extension Tourist VN",fee: "USD 50 Tourist extension 30 days 90 days VN",validity: "30 to 90 days extension",stay: "Extension of stay",processing: "5 to 7 Days",purpose: "Extending tourist stay inside Vietnam via Immigration Department or licensed agency",eligibility: "Tourists currently inside Vietnam seeking extension before current visa expires",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "tourist",record_type: "STATUS_DOCUMENT",docs: ["Passport + Current e-Visa / Visa Stamp ⭐","Immigration Extension Application Form NA5 + Local Police Temporary Residence Registration (NA17) ⭐"]
  },
  {
    id: "vn-TOU-006",officialCode: "VN-TOU-006",name: "Tourist e-Visa - Family Friends Visit 90 Days Family Friends Visit Tourist Family Friends VN",fee: "USD 25 Tourist family friends visit VN",validity: "90 days single/multiple entry",stay: "Max 90 days",processing: "3 Days",purpose: "Visiting relatives or friends residing in Vietnam",eligibility: "Foreigners visiting Vietnamese citizens or legal foreign residents",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "tourist",record_type: "TOURIST_VISA",docs: ["e-Visa Online Application Confirmation ⭐","Invitation Letter from host in Vietnam + Host Passport / ID Copy","Proof of Relationship + Accommodation Address in Vietnam"]
  },
  {
    id: "vn-TOU-007",officialCode: "VN-TOU-007",name: "Transit Visa 5 Days Transit Visa 5 Days Transit VN",fee: "USD 25 Transit VN",validity: "Up to 5 days",stay: "Max 5 days",processing: "3 Days",purpose: "Transiting through Vietnam airport leaving transit area to third country",eligibility: "Passengers leaving airport during layover in Vietnam",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "tourist",record_type: "TRANSIT_VISA",docs: ["Passport 6M+ + Onward Flight Ticket within 5 days ⭐","Valid Visa for final destination country"]
  },
  {
    id: "vn-TOU-008",officialCode: "VN-TOU-008",name: "Tourist e-Visa - Medical Treatment 90 Days Medical Treatment Tourist Medical VN",fee: "USD 25 Tourist medical treatment VN",validity: "90 days single/multiple entry",stay: "Max 90 days",processing: "3 Days",purpose: "Receiving medical care in a Vietnamese hospital or health center",eligibility: "Patients holding hospital appointment in Vietnam",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "tourist",record_type: "MEDICAL_VISA",docs: ["Hospital Appointment / Treatment Letter from Vietnamese Medical Facility ⭐","Proof of Medical Funds + e-Visa Application"]
  },
  {
    id: "vn-TOU-009",officialCode: "VN-TOU-009",name: "Tourist e-Visa - Conference 90 Days Conference Tourist Conference VN",fee: "USD 25 Tourist conference VN",validity: "90 days single/multiple entry",stay: "Max 90 days",processing: "3 Days",purpose: "Attending academic or scientific conferences and seminars in Vietnam",eligibility: "Conference delegates and speakers",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "tourist",record_type: "CONFERENCE_VISA",docs: ["Official Conference Invitation Letter in Vietnam ⭐","e-Visa Online Confirmation"]
  },
  {
    id: "vn-TOU-010",officialCode: "VN-TOU-010",name: "Tourist Visa - Phu Quoc 30 Days Phu Quoc Visa Exemption 30 Days Phu Quoc VN",fee: "USD 0 Phu Quoc visa exemption 30 days VN",validity: "30 days Phu Quoc Special Zone Waiver",stay: "Max 30 days (restricted to Phu Quoc Island)",processing: "Immediate at Phu Quoc Airport",purpose: "Tourism on Phu Quoc Island special economic zone",eligibility: "Foreign tourists flying directly or via international transit to Phu Quoc staying on island",officialSource: "https://xuatnhapcanh.gov.vn",popular: true,categoryCode: "tourist",record_type: "VISA_WAIVER",docs: ["Passport valid 6M+ ⭐","Direct or Transit Flight Ticket to Phu Quoc International Airport ⭐","Hotel Reservation on Phu Quoc Island"]
  },
  {
    id: "vn-TOU-011",officialCode: "VN-TOU-011",name: "Tourist e-Visa - Sports 90 Days Sports Tourist Sports VN",fee: "USD 25 Tourist sports VN",validity: "90 days single/multiple entry",stay: "Max 90 days",processing: "3 Days",purpose: "Participating in sporting tournaments in Vietnam",eligibility: "Athletes invited by Vietnamese sports federations",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "tourist",record_type: "SPECIAL_VISA",docs: ["Invitation from Vietnamese Sports Organizer / Federation ⭐"]
  },
  {
    id: "vn-TOU-012",officialCode: "VN-TOU-012",name: "Tourist e-Visa - Film 90 Days Film Tourist Film VN",fee: "USD 25 Tourist film VN",validity: "90 days single/multiple entry",stay: "Max 90 days",processing: "3 Days",purpose: "Film crews shooting productions in Vietnam",eligibility: "Film crew with Ministry of Culture approval",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "tourist",record_type: "PERFORMER_VISA",docs: ["Ministry of Culture, Sports and Tourism Filming Approval Permit ⭐"]
  },
  {
    id: "vn-TOU-013",officialCode: "VN-TOU-013",name: "Tourist e-Visa - Religious 90 Days Religious Tourist Religious VN",fee: "USD 25 Tourist religious VN",validity: "90 days single/multiple entry",stay: "Max 90 days",processing: "3 Days",purpose: "Attending religious ceremonies or events in Vietnam",eligibility: "Delegates invited by recognized religious bodies in Vietnam",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "tourist",record_type: "SPECIAL_VISA",docs: ["Invitation Letter from Recognized Religious Organization in Vietnam ⭐"]
  },
  {
    id: "vn-TOU-014",officialCode: "VN-TOU-014",name: "Tourist e-Visa - Journalist 90 Days Journalist Tourist Journalist VN",fee: "USD 25 Tourist journalist VN",validity: "90 days single/multiple entry",stay: "Max 90 days",processing: "3 Days",purpose: "Foreign journalists covering events in Vietnam short term",eligibility: "Journalists accredited by Ministry of Foreign Affairs Press Center",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "tourist",record_type: "JOURNALIST_VISA",docs: ["MFA Press Center Foreign Journalist Accreditation Letter ⭐"]
  },

  // BUSINESS 10 LIVE
  {
    id: "vn-BIZ-001",
    officialCode: "VN-BIZ-001",
    name: "Business e-Visa DN1 Single 90 Days Business DN1 90 Days Single - Most common Business Vietnam",
    fee: "USD 25 Business DN1 single 90 days",
    validity: "90 days single entry (DN1 Visa)",
    stay: "Max 90 days",
    processing: "3 Business Days (evisa.xuatnhapcanh.gov.vn)",
    purpose: "Business activities, commercial negotiations, working with enterprises in Vietnam holding legal status",
    eligibility: "Foreign business professionals invited by a legal Vietnamese company registered on National Business Registration Portal",
    officialSource: "https://evisa.xuatnhapcanh.gov.vn",
    popular: true,
    highlight: true,
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Valid Passport (minimum 6 months validity) ⭐",
      "e-Visa Business DN1 Approval Confirmation from evisa.xuatnhapcanh.gov.vn ⭐",
      "Official Business Sponsorship Letter (Công văn bảo lãnh) from Vietnamese Host Enterprise ⭐",
      "Enterprise Registration Certificate (Giấy chứng nhận đăng ký doanh nghiệp - ERC) of Host ⭐",
      "Sending Foreign Company Dispatch Letter detailing trip purpose",
      "Proof of Financial Means & Hotel Booking in Vietnam"
    ]
  },
  {
    id: "vn-BIZ-002",officialCode: "VN-BIZ-002",name: "Business e-Visa DN1 Multiple 90 Days Business DN1 90 Days Multiple",fee: "USD 50 Business DN1 multiple 90 days",validity: "90 days multiple entry (DN1 Visa)",stay: "Max 90 days total",processing: "3 Days",purpose: "Frequent business visits with Vietnamese enterprises",eligibility: "Executives making multiple trips to corporate partners in Vietnam",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Passport 6M+ ⭐","e-Visa DN1 Multiple Entry Approval ⭐","Vietnamese Company ERC Certificate + Sponsorship Letter"]
  },
  {
    id: "vn-BIZ-003",officialCode: "VN-BIZ-003",name: "Business e-Visa DN2 Single 90 Days Business DN2 90 Days Single DN2",fee: "USD 25 Business DN2 single 90 days",validity: "90 days single entry (DN2 Visa)",stay: "Max 90 days",processing: "3 Days",purpose: "Offering services, establishing commercial presence, or working under international treaties",eligibility: "Foreigners entering Vietnam to offer services or conduct business under treaties",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Passport + e-Visa DN2 Online Confirmation ⭐","Service Provider Contract or Treaty Engagement Proof ⭐"]
  },
  {
    id: "vn-BIZ-004",officialCode: "VN-BIZ-004",name: "Business e-Visa DN2 Multiple 90 Days Business DN2 90 Days Multiple DN2",fee: "USD 50 Business DN2 multiple 90 days",validity: "90 days multiple entry (DN2 Visa)",stay: "Max 90 days total",processing: "3 Days",purpose: "Frequent service delivery and treaty commercial travel under DN2 status",eligibility: "Service providers with multiple entries in 90 days",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Passport + Multiple Entry e-Visa DN2 Approval ⭐","Commercial Service Agreement"]
  },
  {
    id: "vn-BIZ-005",officialCode: "VN-BIZ-005",name: "Business Visa On Arrival DN1 DN2 30 Days VOA Business DN1 DN2 30 Days VOA",fee: "USD 25 VOA business approval letter + USD 95 stamping multiple",validity: "30 days single/multiple entry",stay: "Max 30 days",processing: "2 to 3 Days (Letter)",purpose: "Emergency airport business entry via Công văn bảo lãnh sponsorship",eligibility: "Business travelers sponsored by licensed Vietnamese enterprise agency",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Công văn bảo lãnh (Official Sponsorship Letter from Immigration) ⭐","NA1 Entry Form + Stamping Fee at VOA counter ⭐"]
  },
  {
    id: "vn-BIZ-006",officialCode: "VN-BIZ-006",name: "Business Visa Extension Extension Business DN1 DN2 90 Days Extension Business VN",fee: "USD 50 Business extension DN1 DN2 90 days VN",validity: "Up to 90 days extension",stay: "Extension of stay",processing: "5 to 7 Days",purpose: "Extending DN1/DN2 business visa stay inside Vietnam",eligibility: "Business visa holders sponsored by host enterprise in Vietnam",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "business",record_type: "STATUS_DOCUMENT",docs: ["NA5 Immigration Extension Form signed by Host Enterprise ⭐","Enterprise ERC Certificate + Sponsor Guarantee Letter"]
  },
  {
    id: "vn-BIZ-007",officialCode: "VN-BIZ-007",name: "Business e-Visa - Investor DT4 DT3 DT2 DT1 1Y 3Y 5Y Investor Business DT",fee: "USD 25 Business investor DT4 DT3 DT2 DT1 + Investment VND 3B 100B",validity: "1 to 5 Years Visa / TRC (ĐĐT1, ĐĐT2, ĐĐT3, ĐĐT4)",stay: "1 to 5 Years renewable",processing: "3 to 5 Days",purpose: "Foreign capital investment in Vietnamese enterprise under DT category",eligibility: "Investors contributing capital from under VND 3B (DT4) to VND 100B+ (DT1)",officialSource: "https://evisa.xuatnhapcanh.gov.vn",popular: true,categoryCode: "business",record_type: "INVESTOR_VISA",docs: ["Investment Registration Certificate (IRC) or ERC proving Capital Contribution ⭐","Proof of Capital Transfer via Vietnamese Bank ⭐","e-Visa / TRC DT Application Form"]
  },
  {
    id: "vn-BIZ-008",officialCode: "VN-BIZ-008",name: "Business e-Visa - Working with Enterprise DN1 LD LD1 LD2 LD Working Enterprise DN LD",fee: "USD 25 Business working enterprise DN1 LD",validity: "90 days single/multiple entry",stay: "Max 90 days",processing: "3 Days",purpose: "Commercial work placement prior to obtaining formal MOLISA work permit",eligibility: "Foreign experts working with host enterprise",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Host Enterprise Sponsorship Letter + ERC Copy ⭐"]
  },
  {
    id: "vn-BIZ-009",officialCode: "VN-BIZ-009",name: "Business e-Visa - Conference 90 Days Conference Business Conference VN",fee: "USD 25 Business conference VN",validity: "90 days single/multiple entry",stay: "Max 90 days",processing: "3 Days",purpose: "Attending commercial exhibitions, summits, and expos in Vietnam",eligibility: "Trade delegates and corporate event participants",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "business",record_type: "CONFERENCE_VISA",docs: ["Trade Expo Entry Registration & Host Letter ⭐"]
  },
  {
    id: "vn-BIZ-010",officialCode: "VN-BIZ-010",name: "Business e-Visa - Trade Fair 90 Days Trade Fair Business Trade Fair VN",fee: "USD 25 Business trade fair VN",validity: "90 days single/multiple entry",stay: "Max 90 days",processing: "3 Days",purpose: "Exhibiting at commercial trade fairs in Vietnam",eligibility: "Exhibitors holding confirmed booth/pass",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Exhibitor Stand Booking Invoice & Host Enterprise Letter ⭐"]
  },

  // WORK 16 LIVE
  {
    id: "vn-WRK-001",
    officialCode: "VN-WRK-001",
    name: "Work Visa LD1 LD2 2Y Work Visa LD1 LD2 2Y - Most common Work Permit Vietnam - Work Permit LD1 LD2 + Work Visa",
    fee: "USD 25 Work visa LD1 LD2 + Work permit USD 100 + TRC USD 155",
    validity: "2 Years Work Visa & Temporary Residence Card (LĐ1, LĐ2 Visa / TRC)",
    stay: "2 Years renewable",
    processing: "15 to 30 Days (MOLISA Work Permit + Immigration TRC)",
    purpose: "Formal employment with a Vietnamese enterprise (LĐ1: work permit exempt, LĐ2: work permit holder)",
    eligibility: "Foreign experts, managers, or technical workers holding MOLISA Work Permit approval (Giấy phép lao động) and 3 years experience certificate",
    officialSource: "https://molisa.gov.vn",
    popular: true,
    highlight: true,
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "MOLISA Work Permit (Giấy phép lao động) or Work Permit Exemption Certificate ⭐",
      "Consularly Legalized University Degree Diploma (Hợp pháp hóa lãnh sự) ⭐",
      "Consularly Legalized 3-Year Work Experience Certificate (Hợp pháp hóa lãnh sự) ⭐",
      "Criminal Record Certificate (Lý lịch tư pháp) issued in home country & Vietnam",
      "Health Certificate from designated hospital in Vietnam",
      "Employer ERC Certificate + NA2 / NA5 Immigration Application Form",
      "Valid Passport + Photos (4x6cm)"
    ]
  },
  {
    id: "vn-WRK-002",officialCode: "VN-WRK-002",name: "Temporary Residence Card TRC Work 2Y Temporary Residence Card TRC Work 2Y TRC Work VN",fee: "USD 155 TRC work 2Y VN",validity: "2 Years Temporary Residence Card (TRC LĐ1 / LĐ2)",stay: "2 Years renewable",processing: "5 to 7 Days",purpose: "Long-term residence permit allowing multi-entry travel without visa during work permit validity",eligibility: "Foreign workers holding valid 2-year MOLISA work permit",officialSource: "https://xuatnhapcanh.gov.vn",popular: true,categoryCode: "work",record_type: "RESIDENCE_PERMIT",docs: ["MOLISA Work Permit (Giấy phép lao động) valid min 1 year ⭐","NA6 Enterprise Guarantee + NA8 TRC Application Form ⭐","Local Police Temporary Residence Registration (NA17) ⭐"]
  },
  {
    id: "vn-WRK-003",officialCode: "VN-WRK-003",name: "Work Visa Extension Extension Work Visa LD1 LD2 2Y Extension Work Visa VN",fee: "USD 50 Work visa extension LD1 LD2 + Work permit extension USD 100 + TRC extension USD 155",validity: "2 Years Extension",stay: "2 Years",processing: "5 to 7 Days",purpose: "Extending LĐ1/LĐ2 work visa and work permit inside Vietnam",eligibility: "Foreign workers with renewed MOLISA work permit",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["Renewed MOLISA Work Permit + NA5 Immigration Extension Form ⭐"]
  },
  {
    id: "vn-WRK-004",officialCode: "VN-WRK-004",name: "TRC Work Extension Extension TRC Work 2Y Extension TRC Work VN",fee: "USD 155 TRC work extension 2Y VN",validity: "2 Years Extension",stay: "2 Years",processing: "5 to 7 Days",purpose: "In-country extension of 2-year TRC LĐ2 residence card",eligibility: "TRC holders maintaining active MOLISA work permit",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["Extended MOLISA Work Permit + Employer NA6/NA8 Forms ⭐"]
  },
  {
    id: "vn-WRK-005",officialCode: "VN-WRK-005",name: "Work Permit Exemption Work Permit Exemption Work Permit Exemption VN",fee: "USD 0 Work permit exemption VN",validity: "2 Years Exemption (LĐ1 Visa)",stay: "2 Years",processing: "10 to 15 Days",purpose: "Work permit exemption for capital contributors, board members, or intra-company transferees",eligibility: "Foreigners qualifying under Decree 152/2020/NĐ-CP (e.g. owners of LLCs, board members of JSCs, lawyers)",officialSource: "https://molisa.gov.vn",categoryCode: "work",record_type: "WORK_VISA",docs: ["MOLISA Work Permit Exemption Certificate (Xác nhận không thuộc diện cấp giấy phép lao động) ⭐","Proof of Capital Contribution or Board Appointment Document"]
  },
  {
    id: "vn-WRK-006",officialCode: "VN-WRK-006",name: "Work Permit LD1 LD2 2Y Work Permit LD1 LD2 2Y Work Permit VN",fee: "USD 100 Work permit LD1 LD2 2Y VN",validity: "2 Years Work Permit Document",stay: "Per contract validity",processing: "15 to 20 Days",purpose: "Official MOLISA work permit document required for work visa / TRC",eligibility: "Foreign experts, managers, or technicians employed by Vietnamese enterprise",officialSource: "https://molisa.gov.vn",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["MOLISA Work Permit Document (Giấy phép lao động) ⭐","Legalized Degree + Experience Certificate + Criminal Record"]
  },
  {
    id: "vn-WRK-007",officialCode: "VN-WRK-007",name: "Investor Visa DT4 DT3 DT2 DT1 1Y 3Y 5Y 10Y Investor Visa DT4 DT3 DT2 DT1 Investor VN",fee: "USD 25 Investor visa DT4 DT3 DT2 DT1 + Investment VND 3B 100B + TRC DT1 10Y",validity: "1 to 10 Years (ĐĐT1: 10Y, ĐĐT2: 5Y, ĐĐT3: 3Y, ĐĐT4: 1Y)",stay: "1 to 10 Years",processing: "5 to 10 Days",purpose: "Visa & residence for capital investors in Vietnamese enterprises",eligibility: "Investors contributing capital: ĐĐT1 (VND 100B+), ĐĐT2 (VND 50B-100B), ĐĐT3 (VND 3B-50B), ĐĐT4 (<VND 3B)",officialSource: "https://xuatnhapcanh.gov.vn",popular: true,categoryCode: "work",record_type: "INVESTOR_VISA",docs: ["Investment Registration Certificate (IRC) or ERC showing capital contribution ⭐","Bank Confirmation of Foreign Capital Transfer into Vietnam ⭐"]
  },
  {
    id: "vn-WRK-008",officialCode: "VN-WRK-008",name: "TRC Investor DT1 DT2 DT3 DT4 10Y 5Y 3Y 1Y TRC Investor DT1 DT2 DT3 DT4 TRC Investor VN",fee: "USD 155 TRC investor DT1 DT2 DT3 DT4 + Investment VND 3B 100B",validity: "1 to 10 Years TRC Card",stay: "1 to 10 Years",processing: "5 to 7 Days",purpose: "Temporary Residence Card for major foreign investors in Vietnam",eligibility: "Investors holding ĐĐT1, ĐĐT2, or ĐĐT3 status (capital VND 3B+)",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "work",record_type: "RESIDENCE_PERMIT",docs: ["ERC / IRC showing VND 3B+ capital contribution ⭐","NA6 / NA8 TRC Application Forms"]
  },
  {
    id: "vn-WRK-009",officialCode: "VN-WRK-009",name: "Work Visa - Expert 2Y Expert Work Visa Expert Work VN",fee: "USD 25 Work visa expert 2Y + Work permit USD 100 Expert + TRC USD 155 Expert Work VN",validity: "2 Years Work Visa / TRC",stay: "2 Years",processing: "15 to 20 Days",purpose: "Work permit and TRC under Expert classification (Chuyên gia)",eligibility: "Professionals with university degree and 3 years relevant work experience",officialSource: "https://molisa.gov.vn",categoryCode: "work",record_type: "WORK_VISA",docs: ["Legalized Degree + 3-Year Expert Experience Confirmation Letter ⭐"]
  },
  {
    id: "vn-WRK-010",officialCode: "VN-WRK-010",name: "Work Visa - Manager Executive 2Y Manager Executive Work Visa Manager Executive Work VN",fee: "USD 25 Work visa manager executive 2Y + Work permit USD 100 Manager executive + TRC USD 155 Manager executive Work VN",validity: "2 Years Work Visa / TRC",stay: "2 Years",processing: "15 to 20 Days",purpose: "Employment under Executive / Managing Director classification (Nhà quản lý / Giám đốc điều hành)",eligibility: "Corporate executives appointed to lead Vietnamese enterprises",officialSource: "https://molisa.gov.vn",categoryCode: "work",record_type: "WORK_VISA",docs: ["Board Resolution / Appointment Decision as Manager / Director ⭐"]
  },
  {
    id: "vn-WRK-011",officialCode: "VN-WRK-011",name: "Work Visa - Technical Worker 2Y Technical Worker Work Visa Technical Worker Work VN",fee: "USD 25 Work visa technical worker 2Y + Work permit USD 100 Technical worker + TRC USD 155 Technical worker Work VN",validity: "2 Years Work Visa / TRC",stay: "2 Years",processing: "15 to 20 Days",purpose: "Technical specialists employed in manufacturing/technology sectors (Lao động kỹ thuật)",eligibility: "Technicians with 1-year training + 3 years experience",officialSource: "https://molisa.gov.vn",categoryCode: "work",record_type: "WORK_VISA",docs: ["Technical Qualification Certificate + 3-Year Practical Experience Proof ⭐"]
  },
  {
    id: "vn-WRK-012",officialCode: "VN-WRK-012",name: "Work Visa - Internship 1Y Internship Work Visa Internship Work VN",fee: "USD 25 Work visa internship + Work permit USD 50 Internship + TRC USD 100 Internship Work VN",validity: "Up to 1 Year",stay: "1 Year",processing: "15 Days",purpose: "Corporate trainees and intern staff in Vietnamese firms",eligibility: "Interns sponsored by Vietnamese enterprise under approved training scheme",officialSource: "https://molisa.gov.vn",categoryCode: "work",record_type: "INTERN_VISA",docs: ["Tripartite Internship Contract & Training Plan ⭐"]
  },
  {
    id: "vn-WRK-013",officialCode: "VN-WRK-013",name: "Work Visa - NGO 2Y NGO Work Visa NGO Work VN",fee: "USD 25 Work visa NGO 2Y + Work permit USD 100 NGO + TRC USD 155 NGO Work VN",validity: "2 Years Work Visa / TRC",stay: "2 Years",processing: "15 Days",purpose: "Staff employed by licensed foreign non-governmental organizations in Vietnam",eligibility: "Personnel of NGOs holding Operation Registration Certificate in Vietnam",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "work",record_type: "WORK_VISA",docs: ["Foreign NGO Operation Registration Certificate in Vietnam ⭐"]
  },
  {
    id: "vn-WRK-014",officialCode: "VN-WRK-014",name: "MOLISA Authority Ministry Labour Invalids Social Affairs Authority Work Permit MOLISA",fee: "USD 0 MOLISA authority VN",validity: "Authority Classification",stay: "N/A",processing: "N/A",purpose: "Ministry of Labour, Invalids and Social Affairs work permit governance",eligibility: "Public reference for MOLISA Decree 152/2020/NĐ-CP regulations",officialSource: "https://molisa.gov.vn",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["MOLISA Decree 152 Work Permit Regulations ⭐"]
  },
  {
    id: "vn-WRK-015",officialCode: "VN-WRK-015",name: "Work Visa - Intra Company Transferee 2Y Intra Company Transferee Work Visa Intra Company Transferee Work VN",fee: "USD 25 Work visa intra company transferee 2Y + Work permit USD 100 Intra company transferee + TRC USD 155 Intra company transferee Work VN",validity: "2 Years Work Visa / TRC",stay: "2 Years",processing: "15 to 20 Days",purpose: "Intra-corporate transferee posted from foreign parent company to Vietnam subsidiary",eligibility: "Employees working min 12 months at foreign parent firm prior to transfer",officialSource: "https://molisa.gov.vn",categoryCode: "work",record_type: "WORK_VISA",docs: ["Transfer Assignment Letter from Parent Firm + Proof of 12M Employment ⭐"]
  },
  {
    id: "vn-WRK-016",officialCode: "VN-WRK-016",name: "Work Visa - Volunteer 1Y Volunteer Work Visa Volunteer Work VN",fee: "USD 25 Work visa volunteer 1Y + Work permit USD 100 Volunteer + TRC USD 100 Volunteer Work VN",validity: "1 Year Work Visa / TRC",stay: "1 Year",processing: "15 Days",purpose: "Volunteers serving with international organizations or licensed bodies in VN",eligibility: "Volunteers backed by official international cooperation agreements",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "work",record_type: "VOLUNTEER_VISA",docs: ["International Volunteer Agreement & Host Body Approval ⭐"]
  },

  // STUDENT 8 LIVE
  {
    id: "vn-STU-001",
    officialCode: "VN-STU-001",
    name: "Student Visa DH 1Y Student Visa DH 1Y - Most common Student Vietnam",
    fee: "USD 25 Student visa DH 1Y",
    validity: "1 Year Student Visa / TRC (DH Visa)",
    stay: "1 Year renewable",
    processing: "3 to 5 Days",
    purpose: "Studying or undertaking academic programs at recognized Vietnamese universities or institutes",
    eligibility: "Foreign students accepted at a Vietnamese educational institution under Ministry of Education and Training (MOET)",
    officialSource: "https://evisa.xuatnhapcanh.gov.vn",
    popular: true,
    highlight: true,
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Official University Acceptance Letter / Enrollment Certificate (DH Category) ⭐",
      "Sponsorship Letter (Công văn bảo lãnh) from Vietnamese Educational Institution ⭐",
      "Educational Diplomas & Transcripts + Proof of Financial Means (USD 3,000/year)",
      "Passport valid 6M+ + Photos (4x6cm)",
      "e-Visa DH Application Form / NA5 TRC Form"
    ]
  },
  {
    id: "vn-STU-002",officialCode: "VN-STU-002",name: "TRC Student DH 1Y 5Y TRC Student DH 1Y 5Y TRC Student VN",fee: "USD 100 TRC student DH 1Y 5Y VN",validity: "1 to 5 Years Temporary Residence Card (TRC DH)",stay: "Duration of study (up to 5 years)",processing: "5 to 7 Days",purpose: "Long-term student residence card for university students in Vietnam",eligibility: "Foreign students enrolled in full-time degree programs",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "student",record_type: "RESIDENCE_PERMIT",docs: ["University Enrollment Certificate & NA6/NA8 TRC Forms ⭐"]
  },
  {
    id: "vn-STU-003",officialCode: "VN-STU-003",name: "Student Visa Extension Extension Student Visa DH 1Y Extension Student Visa VN",fee: "USD 25 Student visa extension DH 1Y + TRC extension USD 100 Student extension VN",validity: "1 Year Extension",stay: "1 Year",processing: "5 Days",purpose: "Extending student visa status for continuing academic year",eligibility: "Students with active university enrollment",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "student",record_type: "STATUS_DOCUMENT",docs: ["Updated Enrollment Certificate & NA5 Extension Form ⭐"]
  },
  {
    id: "vn-STU-004",officialCode: "VN-STU-004",name: "TRC Student Extension Extension TRC Student DH 1Y Extension TRC Student VN",fee: "USD 100 TRC student extension DH 1Y VN",validity: "1 Year Extension",stay: "1 Year",processing: "5 Days",purpose: "In-country extension of student TRC DH card",eligibility: "Student TRC holders in Vietnam",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "student",record_type: "STATUS_DOCUMENT",docs: ["University Guarantee Letter & Academic Transcripts ⭐"]
  },
  {
    id: "vn-STU-005",officialCode: "VN-STU-005",name: "Student Visa - Doctoral PhD DH 3Y Doctoral PhD Student Visa Doctoral PhD Student VN",fee: "USD 25 Student visa doctoral PhD DH 3Y + TRC USD 100 Doctoral PhD Student VN",validity: "3 Years Student Visa / TRC",stay: "3 Years",processing: "5 Days",purpose: "Doctoral PhD research studies at a Vietnamese university",eligibility: "PhD candidates admitted to MOET accredited doctoral school",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["PhD Admission Letter & Research Proposal Approval ⭐"]
  },
  {
    id: "vn-STU-006",officialCode: "VN-STU-006",name: "Student Visa - Language DH 1Y Language Student Visa Language Student VN",fee: "USD 25 Student visa language DH 1Y + TRC USD 100 Language Student VN",validity: "Up to 1 Year",stay: "1 Year",processing: "3 Days",purpose: "Enrolling in intensive Vietnamese language courses at accredited centers",eligibility: "Students taking accredited Vietnamese language programs",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["Vietnamese Language School Acceptance Certificate ⭐"]
  },
  {
    id: "vn-STU-007",officialCode: "VN-STU-007",name: "Student Visa - Internship DH 1Y Internship Student Visa Internship Student VN",fee: "USD 25 Student visa internship DH 1Y + TRC USD 100 Internship Student VN",validity: "Up to 1 Year",stay: "1 Year",processing: "3 Days",purpose: "Academic student internship placed in Vietnamese university or enterprise",eligibility: "Students with university internship learning agreement",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "student",record_type: "INTERN_VISA",docs: ["Tripartite Student Internship Agreement ⭐"]
  },
  {
    id: "vn-STU-008",officialCode: "VN-STU-008",name: "Student Visa - Scholarship DH 1Y Scholarship Student Visa Scholarship Student VN",fee: "USD 25 Student visa scholarship DH 1Y + TRC USD 100 Scholarship Student VN",validity: "1 Year renewable",stay: "Duration of award",processing: "3 Days",purpose: "Government or university scholarship awardees studying in Vietnam",eligibility: "Students holding official state or university scholarship",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["Official Scholarship Award Certificate & University Acceptance ⭐"]
  },

  // FAMILY 8 LIVE
  {
    id: "vn-FAM-001",
    officialCode: "VN-FAM-001",
    name: "Family Visa TT 3Y Family Visa TT 3Y Family Reunification - Most common Family Vietnam",
    fee: "USD 25 Family visa TT 3Y",
    validity: "Up to 3 Years Visa & Temporary Residence Card (TT Category)",
    stay: "3 Years renewable (tied to sponsor's TRC)",
    processing: "3 to 5 Days",
    purpose: "Family reunification for spouse or minor child (under 18) of a foreign work/investor visa holder in Vietnam",
    eligibility: "Spouse or minor child of foreign worker/investor holding valid LĐ1, LĐ2, or ĐT TRC in Vietnam",
    officialSource: "https://evisa.xuatnhapcanh.gov.vn",
    popular: true,
    highlight: true,
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Consularly Legalized Marriage Certificate or Birth Certificate (Hợp pháp hóa lãnh sự) ⭐",
      "Notarized Vietnamese Translation of Civil Relationship Certificates ⭐",
      "Sponsor's Passport, Work Permit, and Temporary Residence Card (TRC LĐ2/ĐT) Copies ⭐",
      "Host Enterprise Guarantee Letter (Công văn bảo lãnh) for family dependent",
      "Passports of family members + Photos (4x6cm)",
      "NA2 / NA5 Immigration Forms"
    ]
  },
  {
    id: "vn-FAM-002",officialCode: "VN-FAM-002",name: "TRC Family TT 3Y TRC Family TT 3Y TRC Family VN",fee: "USD 100 TRC family TT 3Y VN",validity: "3 Years Temporary Residence Card (TRC TT)",stay: "3 Years renewable",processing: "5 to 7 Days",purpose: "In-country 3-year residence card for foreign dependents",eligibility: "Spouse/children holding TT visa status in Vietnam",officialSource: "https://xuatnhapcanh.gov.vn",popular: true,categoryCode: "family",record_type: "RESIDENCE_PERMIT",docs: ["Legalized Marriage / Birth Certificate + Sponsor TRC & NA6/NA8 Forms ⭐"]
  },
  {
    id: "vn-FAM-003",officialCode: "VN-FAM-003",name: "Family Visa Extension Extension Family Visa TT 3Y Extension Family Visa VN",fee: "USD 25 Family visa extension TT 3Y + TRC extension USD 100 Family extension VN",validity: "Up to 3 Years Extension",stay: "3 Years",processing: "5 Days",purpose: "Extending TT family visa inside Vietnam",eligibility: "Dependents maintaining valid relationship with active sponsor",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "family",record_type: "STATUS_DOCUMENT",docs: ["Updated Sponsor TRC + NA5 Immigration Extension Form ⭐"]
  },
  {
    id: "vn-FAM-004",officialCode: "VN-FAM-004",name: "TRC Family Extension Extension TRC Family TT 3Y Extension TRC Family VN",fee: "USD 100 TRC family extension TT 3Y VN",validity: "Up to 3 Years Extension",stay: "3 Years",processing: "5 Days",purpose: "In-country extension of 3-year TRC TT card",eligibility: "TRC TT holders extending status",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "family",record_type: "STATUS_DOCUMENT",docs: ["Extended Sponsor TRC + Sponsor Employer Guarantee ⭐"]
  },
  {
    id: "vn-FAM-005",officialCode: "VN-FAM-005",name: "Family Visa - Spouse VR 3Y Spouse VR 3Y Spouse VR VN",fee: "USD 25 Family visa spouse VR 3Y VN",validity: "3 Years Visa / TRC (VR Category)",stay: "3 Years renewable",processing: "3 to 5 Days",purpose: "Visiting or residing as spouse of a Vietnamese citizen",eligibility: "Foreign spouse married to a Vietnamese citizen",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["Marriage Certificate + Vietnamese Spouse Citizen ID (Căn cước công dân) ⭐"]
  },
  {
    id: "vn-FAM-006",officialCode: "VN-FAM-006",name: "TRC Spouse VR 3Y 5Y TRC Spouse VR 3Y 5Y TRC Spouse VN",fee: "USD 100 TRC spouse VR 3Y 5Y VN",validity: "3 to 5 Years TRC Card (TRC VR)",stay: "3 to 5 Years",processing: "5 to 7 Days",purpose: "Long-term residence card for spouse of Vietnamese citizen",eligibility: "Foreign spouse holding VR visa status",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "family",record_type: "RESIDENCE_PERMIT",docs: ["Vietnamese Marriage Certificate + Spouse Citizen ID & Police Address Registration ⭐"]
  },
  {
    id: "vn-FAM-007",officialCode: "VN-FAM-007",name: "Family Visa - Child 3Y Child Family Visa Child Family VN",fee: "USD 25 Family visa child 3Y VN",validity: "Up to 3 Years",stay: "3 Years",processing: "3 to 5 Days",purpose: "Family visa for minor children joining foreign parent in Vietnam",eligibility: "Minor children under 18 of foreign worker/investor",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["Legalized Birth Certificate + Parent Work Permit / TRC ⭐"]
  },
  {
    id: "vn-FAM-008",officialCode: "VN-FAM-008",name: "Visa Exemption 5Y 6M per stay Visa Exemption 5Y 6M per stay 5Y Visa Exemption VN",fee: "USD 20 Visa exemption 5Y VN",validity: "5 Years Multiple Entry (6 months stay per entry - Giấy miễn thị thực 5 năm)",stay: "Max 6 months per entry",processing: "5 to 7 Days",purpose: "5-Year Visa Exemption Certificate for overseas Vietnamese (Viet Kieu) and foreign spouses/children of Vietnamese citizens",eligibility: "Overseas Vietnamese or foreign spouses/children of Vietnamese citizens",officialSource: "https://evisa.xuatnhapcanh.gov.vn",popular: true,categoryCode: "family",record_type: "VISA_WAIVER",docs: ["Proof of Vietnamese Origin or Marriage / Birth Certificate to Vietnamese Citizen ⭐","Vietnamese Spouse/Parent ID Copy + Passport valid 5+ years ⭐"]
  },

  // PR 4 LIVE + SPECIAL 12 LIVE = 16
  {
    id: "vn-PR-001",
    officialCode: "VN-PR-001",
    name: "Permanent Residence Card PRC Permanent Residence Card PRC - PR Vietnam - PRC VN",
    fee: "USD 150 PRC VN",
    validity: "Permanent Residence Card (Thẻ thường trú)",
    stay: "Indefinite Permanent Residence",
    processing: "4 to 6 Months (Immigration Department)",
    purpose: "Permanent residence in Vietnam for persons with national merits, scientists, or foreign spouses/children of Vietnamese citizens",
    eligibility: "Foreigners residing continuously in Vietnam for 3+ years married to Vietnamese citizen or person with national contribution/merit",
    officialSource: "https://xuatnhapcanh.gov.vn",
    popular: true,
    highlight: true,
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "Proof of 3 Years Continuous Temporary Residence in Vietnam ⭐",
      "Marriage Certificate to Vietnamese Citizen or National Merit Certificate ⭐",
      "Vietnamese Spouse Citizen ID & BRP Address Registration",
      "Criminal Record Check (Lý lịch tư pháp) issued in home country & Vietnam",
      "Proof of Guaranteed Living Means & Accommodation in Vietnam",
      "Valid Passport + PRC Application Form"
    ]
  },
  {
    id: "vn-PR-002",officialCode: "VN-PR-002",name: "Permanent Residence - Spouse Vietnamese Citizen Spouse Vietnamese Citizen PR Spouse VN",fee: "USD 150 PR spouse Vietnamese citizen VN",validity: "Permanent Residence Status",stay: "Lifetime Residence",processing: "4 to 6 Months",purpose: "Permanent residence granted to foreign spouse of Vietnamese citizen",eligibility: "Foreign spouse residing 3+ continuous years in Vietnam with spouse",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "pr",record_type: "PR_VISA",docs: ["Marriage Certificate (3+ years) + Spouse Citizen ID ⭐","Proof of Address & Income in Vietnam"]
  },
  {
    id: "vn-PR-003",officialCode: "VN-PR-003",name: "Permanent Residence - Contribution Contribution PR Contribution PR VN",fee: "USD 150 PR contribution VN",validity: "Permanent Residence Status",stay: "Lifetime Residence",processing: "4 to 6 Months",purpose: "Permanent residence granted for outstanding contributions to Vietnam",eligibility: "Individuals awarded state medals or national honors",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "pr",record_type: "PR_VISA",docs: ["State Medal / National Honor Award Certificate ⭐"]
  },
  {
    id: "vn-PR-004",officialCode: "VN-PR-004",name: "Permanent Residence - Scientist Scientist PR Scientist PR VN",fee: "USD 150 PR scientist VN",validity: "Permanent Residence Status",stay: "Lifetime Residence",processing: "4 to 6 Months",purpose: "Permanent residence for world-class scientists and experts recommended by Minister",eligibility: "Scientists recommended by Vietnamese Ministry of Science and Technology",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "pr",record_type: "PR_VISA",docs: ["Minister Recommendation Letter & Scientific Research Award ⭐"]
  },
  {
    id: "vn-SPE-001",officialCode: "VN-SPE-001",name: "Diplomat Visa NG1 NG2 NG3 NG4 Diplomat Visa NG1 NG2 NG3 NG4 Diplomat VN",fee: "USD 0 Diplomat NG1 NG2 NG3 NG4 VN",validity: "Posting Duration (NG1, NG2, NG3, NG4)",stay: "Posting duration",processing: "1 to 2 Weeks",purpose: "Diplomatic accreditation for foreign embassy officials in Hanoi",eligibility: "Accredited diplomats holding diplomatic passports",officialSource: "https://mofa.gov.vn",categoryCode: "pr",record_type: "DIPLOMAT_VISA",docs: ["MOFA Note Verbale & Diplomatic Passport ⭐"]
  },
  {
    id: "vn-SPE-002",officialCode: "VN-SPE-002",name: "Official Visa LV1 LV2 LV Official Visa LV1 LV2 LV Official VN",fee: "USD 0 Official LV1 LV2 LV VN",validity: "Assignment Duration (LV1, LV2)",stay: "Assignment duration",processing: "1 to 2 Weeks",purpose: "Government officials working with Vietnamese state organs",eligibility: "Officials holding service/official passports",officialSource: "https://mofa.gov.vn",categoryCode: "pr",record_type: "OFFICIAL_VISA",docs: ["MOFA Official Note Verbale & Assignment Order ⭐"]
  },
  {
    id: "vn-SPE-003",officialCode: "VN-SPE-003",name: "Journalist Visa PV1 PV2 Journalist Visa PV1 PV2 Journalist VN",fee: "USD 25 Journalist PV1 PV2 VN",validity: "Up to 1 Year (PV1, PV2)",stay: "1 Year",processing: "2 to 3 Weeks",purpose: "Accredited foreign press correspondents in Vietnam",eligibility: "Journalists accredited by MOFA Foreign Press Center",officialSource: "https://mofa.gov.vn",categoryCode: "pr",record_type: "JOURNALIST_VISA",docs: ["MOFA Foreign Press Center Accreditation Card ⭐"]
  },
  {
    id: "vn-SPE-004",officialCode: "VN-SPE-004",name: "Religious Visa NN2 Religious Visa NN2 Religious VN",fee: "USD 25 Religious NN2 VN",validity: "Up to 1 Year (NN2 Category)",stay: "1 Year",processing: "2 Weeks",purpose: "Religious personnel posted to licensed religious organizations in VN",eligibility: "Ministers of religion invited by approved religious bodies",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "pr",record_type: "SPECIAL_VISA",docs: ["Government Committee for Religious Affairs Approval Letter ⭐"]
  },
  {
    id: "vn-SPE-005",officialCode: "VN-SPE-005",name: "Crew Visa NN2 Crew Visa NN2 Crew VN",fee: "USD 25 Crew NN2 VN",validity: "Duration of Layover",stay: "Max layover duration",processing: "3 Days",purpose: "Airline or maritime crew layovers in Vietnam",eligibility: "Active airline/seaman crew",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "pr",record_type: "CREW_VISA",docs: ["Seaman Book / Crew License + Shipping/Airline Guarantee ⭐"]
  },
  {
    id: "vn-SPE-006",officialCode: "VN-SPE-006",name: "E-Visa DL - Medical Treatment DL Medical Treatment DL Medical Treatment VN",fee: "USD 25 DL medical treatment VN",validity: "90 days single/multiple entry",stay: "Max 90 days",processing: "3 Days",purpose: "Short-term medical treatment under DL e-Visa",eligibility: "Patients holding hospital appointment in VN",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "pr",record_type: "MEDICAL_VISA",docs: ["Hospital Appointment Confirmation & Medical Guarantee ⭐"]
  },
  {
    id: "vn-SPE-007",officialCode: "VN-SPE-007",name: "Student Visa DH - Research DH Research DH Research VN",fee: "USD 25 Student DH research VN",validity: "Up to 1 Year",stay: "1 Year",processing: "3 Days",purpose: "Postgraduate student academic research in VN",eligibility: "Research students enrolled in MOET university project",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "pr",record_type: "RESEARCH_VISA",docs: ["MOET University Research Project Acceptance ⭐"]
  },
  {
    id: "vn-SPE-008",officialCode: "VN-SPE-008",name: "Market Research Visa DN1 DN2 Market Research Visa DN1 DN2 Market Research VN",fee: "USD 25 Market research DN1 DN2 VN",validity: "90 days single/multiple entry",stay: "Max 90 days",processing: "3 Days",purpose: "Market research and trade exploration in Vietnam",eligibility: "Business representatives carrying out market feasibility study",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "pr",record_type: "BUSINESS_VISA",docs: ["Host Enterprise Sponsorship Letter for Market Research ⭐"]
  },
  {
    id: "vn-SPE-009",officialCode: "VN-SPE-009",name: "Working Holiday Visa Working Holiday Visa Working Holiday Visa Working Holiday VN",fee: "USD 25 Working holiday VN",validity: "Up to 1 Year",stay: "1 Year",processing: "10 Days",purpose: "Working holiday youth exchange in Vietnam",eligibility: "Citizens of countries holding WHP agreement with Vietnam (e.g. Australia, NZ)",officialSource: "https://evisa.xuatnhapcanh.gov.vn",categoryCode: "pr",record_type: "WORKING_HOLIDAY_VISA",docs: ["WHP Agreement Country Passport + Bank Balance Proof ⭐"]
  },
  {
    id: "vn-SPE-010",officialCode: "VN-SPE-010",name: "Transit Visa Extension Extension Transit Visa 5 Days Extension Transit VN",fee: "USD 25 Transit extension VN",validity: "5 Days Extension",stay: "Max 5 days",processing: "3 Days",purpose: "Emergency transit extension due to flight delays",eligibility: "Transit passengers experiencing flight delays",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "pr",record_type: "STATUS_DOCUMENT",docs: ["Airline Delay Certificate & Updated Ticket ⭐"]
  },
  {
    id: "vn-SPE-011",officialCode: "VN-SPE-011",name: "APEC Business Travel Card ABTC APEC Business Travel Card ABTC APEC VN",fee: "USD 100 ABTC VN",validity: "5 Years ABTC Clearance (Multiple 60/90 days entry)",stay: "Max 60-90 days per entry",processing: "30 Days",purpose: "Fast-track business travel across APEC economies",eligibility: "Senior business executives holding valid ABTC card with VN clearance",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "pr",record_type: "BUSINESS_VISA",docs: ["Valid ABTC Card with VN Entry Clearance Stamp ⭐"]
  },
  {
    id: "vn-SPE-012",officialCode: "VN-SPE-012",name: "Temporary Residence Extension Extension Temporary Residence Extension Temporary Residence VN",fee: "USD 100 Temporary residence extension VN",validity: "1 to 3 Years Extension",stay: "1 to 3 Years",processing: "5 Days",purpose: "General extension of temporary residence card in Vietnam",eligibility: "TRC card holders extending status before expiry",officialSource: "https://xuatnhapcanh.gov.vn",categoryCode: "pr",record_type: "STATUS_DOCUMENT",docs: ["NA5 Immigration Extension Form + Local Police Residence Stamp ⭐"]
  },

  // SUPPORTING 15 + LEGACY 10 = 25 SUPPORTING/LEGACY - NOT COUNTED IN 76 LIVE
  {id:"vn-SUP-001",officialCode:"VN-SUP-001",name:"e-Visa Authority e-Visa evisa.xuatnhapcanh.gov.vn Authority Visa e-Visa",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["e-Visa = Official online electronic visa portal operated by Vietnam Immigration Department. Website: evisa.xuatnhapcanh.gov.vn"]},
  {id:"vn-SUP-002",officialCode:"VN-SUP-002",name:"Immigration Authority Vietnam Immigration Authority Visa Residence Immigration",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Cục Quản lý xuất nhập cảnh (Vietnam Immigration Department) - Official authority for visas, TRC, and PRC. Website: xuatnhapcanh.gov.vn"]},
  {id:"vn-SUP-003",officialCode:"VN-SUP-003",name:"MOLISA Authority Ministry Labour Invalids Social Affairs Authority Work Permit MOLISA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["MOLISA = Ministry of Labour, Invalids and Social Affairs governing work permits (Giấy phép lao động) under Decree 152. Website: molisa.gov.vn"]},
  {id:"vn-SUP-004",officialCode:"VN-SUP-004",name:"TRC Authority Temporary Residence Card Authority Residence TRC",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["TRC = Temporary Residence Card (Thẻ tạm trú) granting multi-entry residence rights for 1–10 years."]},
  {id:"vn-SUP-005",officialCode:"VN-SUP-005",name:"VOA Authority Visa On Arrival Authority Visa VOA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Visa On Arrival (VOA) airport stamping system operating via Immigration Department approval letters (Công văn bảo lãnh)."]},
  {id:"vn-SUP-006",officialCode:"VN-SUP-006",name:"DN1 Authority DN1 Business Visa Authority Business DN1",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["DN1 Visa Category - Issued to foreigners working with legal Vietnamese enterprises."]},
  {id:"vn-SUP-007",officialCode:"VN-SUP-007",name:"DN2 Authority DN2 Business Visa Authority Business DN2",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["DN2 Visa Category - Issued to foreigners offering services or establishing commercial presence under treaties."]},
  {id:"vn-SUP-008",officialCode:"VN-SUP-008",name:"LD Authority LD Work Visa Authority Work LD",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["LĐ1 & LĐ2 Visa Categories - Issued to foreign workers with MOLISA work permits or exemptions."]},
  {id:"vn-SUP-009",officialCode:"VN-SUP-009",name:"DT Authority DT Investor Visa Authority Investor DT",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["ĐĐT1, ĐĐT2, ĐĐT3, ĐĐT4 Visa Categories - Issued to foreign capital investors in Vietnamese firms."]},
  {id:"vn-SUP-010",officialCode:"VN-SUP-010",name:"DH Authority DH Student Visa Authority Student DH",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["DH Visa Category - Issued to students enrolled in MOET accredited Vietnamese universities."]},
  {id:"vn-SUP-011",officialCode:"VN-SUP-011",name:"TT Authority TT Family Visa Authority Family TT",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["TT Visa Category - Issued to foreign spouses and minor children of work/investor visa holders."]},
  {id:"vn-SUP-012",officialCode:"VN-SUP-012",name:"VR Authority VR Spouse Visa Authority Family VR",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["VR Visa Category - Issued to foreign spouses of Vietnamese citizens."]},
  {id:"vn-SUP-013",officialCode:"VN-SUP-013",name:"PRC Authority Permanent Residence Card Authority PR PRC",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["PRC = Permanent Residence Card (Thẻ thường trú) granted for indefinite residence."]},
  {id:"vn-SUP-014",officialCode:"VN-SUP-014",name:"DL Authority DL Tourist e-Visa Authority Tourist DL",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["DL Visa Category - Issued for short-term tourism and leisure travel."]},
  {id:"vn-SUP-015",officialCode:"VN-SUP-015",name:"Visa Exemption Authority Visa Exemption Authority Tourist Visa Exemption",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Vietnam 45-day and 5-year visa exemption regulatory framework."]},
  {id:"vn-LEG-001",officialCode:"VN-LEG-001",name:"Legacy e-Visa 30 Days Old System Closed Replaced by New e-Visa 90 Days evisa.xuatnhapcanh.gov.vn",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former 30-day e-Visa replaced by 90-day single/multiple e-Visa in August 2023."]},
  {id:"vn-LEG-002",officialCode:"VN-LEG-002",name:"Legacy VOA Tourist 15 Days Old System Closed Replaced by New VOA 30 Days Approval Letter",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Old 15-day tourist VOA system superseded by current e-Visa and 30-day VOA letters."]},
  {id:"vn-LEG-003",officialCode:"VN-LEG-003",name:"Legacy Business Visa 30 Days Old System Closed Replaced by New Business DN1 DN2 90 Days",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former 30-day business visa updated to 90-day e-Visa DN1/DN2."]},
  {id:"vn-LEG-004",officialCode:"VN-LEG-004",name:"Legacy Work Permit 1Y Old System Closed Replaced by New Work Permit LD1 LD2 2Y MOLISA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Old 1-year work permit rules updated to 2-year MOLISA work permits under Decree 152."]},
  {id:"vn-LEG-005",officialCode:"VN-LEG-005",name:"Legacy Investor Visa Old System Closed Replaced by New Investor Visa DT4 DT3 DT2 DT1 1Y 10Y",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former single investor category split into ĐĐT1, ĐĐT2, ĐĐT3, ĐĐT4 based on capital tiers."]},
  {id:"vn-LEG-006",officialCode:"VN-LEG-006",name:"Legacy Student Visa 1Y Old System Closed Replaced by New Student Visa DH 1Y 5Y TRC",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Old paper student visa replaced by DH category e-Visa and TRC DH."]},
  {id:"vn-LEG-007",officialCode:"VN-LEG-007",name:"Legacy Family Visa TT 1Y Old System Closed Replaced by New Family Visa TT 3Y TRC",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former 1-year family permit updated to 3-year TRC TT."]},
  {id:"vn-LEG-008",officialCode:"VN-LEG-008",name:"Legacy TRC 1Y Old System Closed Replaced by New TRC 2Y 3Y Work Family",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Old 1-year TRC cards upgraded to 2-year LĐ2 and 3-year TT/VR TRC cards."]},
  {id:"vn-LEG-009",officialCode:"VN-LEG-009",name:"Legacy Visa Exemption 15 Days Old System Closed Replaced by New Visa Exemption 45 Days",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former 15-day unilateral visa exemption extended to 45 days in August 2023."]},
  {id:"vn-LEG-010",officialCode:"VN-LEG-010",name:"Legacy Phu Quoc 15 Days Old System Closed Replaced by New Phu Quoc 30 Days Visa Exemption",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former 15-day Phu Quoc island waiver extended to 30 days."]}
];

function processVisaList(items: VisaItem[]): VisaItem[] {
  return items.map(item => {
    const micro = getVietnamMicroDetails(item.id, item.categoryCode || 'tourist', item.name);
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

const PROCESSED_VN = processVisaList(RAW_VN_VISAS);

export const VIETNAM_76_VISAS: CountryVisas = {
  tourist: PROCESSED_VN.filter(v => v.categoryCode === 'tourist'),
  business: PROCESSED_VN.filter(v => v.categoryCode === 'business'),
  work: PROCESSED_VN.filter(v => v.categoryCode === 'work'),
  student: PROCESSED_VN.filter(v => v.categoryCode === 'student'),
  family: PROCESSED_VN.filter(v => v.categoryCode === 'family'),
  pr: PROCESSED_VN.filter(v => v.categoryCode === 'pr')
};
