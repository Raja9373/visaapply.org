import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getTurkeyMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "e-Visa / Sticker Visa / Touristic Residence requires proof of USD 50 per day of stay in Turkey (min USD 1,500–3,000 for 30–60 days). Foreigners Directorate (Göç İdaresi - e-Ikamet) requires 3–6 months personal bank statements.";
  let fundsBankMonths = "Last 3 to 6 months personal bank statements stamped by bank with USD/EUR/TRY liquid balance.";
  let fundsSudden = "❌ Sudden 1-day cash deposits right before visa submission or e-Ikamet appointment are strictly flagged and cause rejection by Göç İdaresi (Directorate General of Migration Management - DGMM). Average balance must be maintained over 3–6 months.";
  let fundsEx = "✅ Sahi: Seasoned 3-6 month bank statement with USD 3,000+ liquid balance. ❌ Galat: Unexplained cash deposit 24 hours prior to e-Ikamet appointment.";

  let itrYears = "Income tax returns or salary slips for past 2–3 years for work permit, business, and family residence applicants.";
  let itrMatch = "Reported tax income must reconcile with personal bank credits and Turkish Ministry of Labour / SGK insurance records.";
  let itrNoItr = "Not required for short-term tourist e-Visa visitors or university students sponsored by parents.";

  let bankMonths = "Last 3-6 months bank statements.";
  let bankReg = "Regular salary credits or steady corporate revenue.";
  let bankFd = "Fixed deposits accepted as supporting proof.";
  let bankSource = "Salary, corporate revenue, or verified parental sponsorship.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk') || lowerCode.includes('work-permit') || lowerCode.includes('mlss') || lowerCode.includes('turquoise')) {
    fundsMin = "Work Permit (Çalışma İzni) requires dual submission: Foreign consulate application + Turkish employer application to Ministry of Labour and Social Security (ÇSGB / MLSS) + gross monthly salary threshold (min 1.5x to 6.5x minimum wage depending on role). Work visa fee USD 80 + Work permit fee USD 100 + Residence card fee TRY 1,100.";
    fundsBankMonths = "Job contract registered in Turkey, SGK social security enrollment, and 3 months bank statements.";
    fundsSudden = "Employment contracts must specify gross monthly salary in TRY/USD and Turkish Tax Registration Number.";
    fundsEx = "✅ Sahi: Official MLSS Work Permit Approval + SGK registered employer contract. ❌ Galat: Unregistered employer or salary below MLSS statutory minimum.";
  } else if (cat === 'student' || lowerCode.includes('stu') || lowerCode.includes('student') || lowerCode.includes('education')) {
    fundsMin = "Student Residence Permit (Öğrenci İkamet İzni) requires official acceptance from a YÖK accredited Turkish university + proof of living funds (USD 500/month or USD 6,000/year) + YÖK equivalency / enrollment certificate (Öğrenci Belgesi) + Turkish health insurance (GSS / SGK). Card fee TRY 1,100.";
    fundsBankMonths = "3-6 months bank statements of student or parent sponsor showing min USD 6,000/year.";
    fundsSudden = "Parental guarantee affidavit (Noter onaylı taahhütname) and birth certificate required if using parent's bank statement.";
    fundsEx = "✅ Sahi: YÖK Öğrenci Belgesi + SGK/GSS health insurance + USD 6,000 bank proof. ❌ Galat: Unaccredited institute or missing Öğrenci Belgesi.";
  } else if (cat === 'family' || lowerCode.includes('fam') || lowerCode.includes('family') || lowerCode.includes('ikamet')) {
    fundsMin = "Family Residence Permit (Aile İkamet İzni) requires Turkish sponsor (citizen or legal resident) to earn minimum 1/3 of minimum wage per family member (min 100% statutory minimum wage total) + private health insurance for all dependents + apostilled marriage/birth certificates. Fee USD 80 + Card TRY 1,100.";
    fundsBankMonths = "Turkish sponsor's SGK insurance history, past 3 salary slips, and bank statements.";
    fundsSudden = "Marriage/Birth certificates must be apostilled or legalised with certified Turkish translation (Noter tasdikli).";
    fundsEx = "✅ Sahi: Apostilled & Notarised marriage certificate + sponsor SGK income proof + e-Ikamet application. ❌ Galat: Sponsor income below minimum wage or unnotarised marriage document.";
  } else if (cat === 'business' || lowerCode.includes('biz') || lowerCode.includes('tapu') || lowerCode.includes('investor')) {
    fundsMin = "e-Visa Business requires foreign company dispatch letter + Turkish host company invitation. Business Residence / Investor Permit requires company formation in Turkey or property ownership (Tapu) min USD 200,000 valuation for residence.";
    fundsBankMonths = "3-6 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Turkish company must be active in official Trade Registry Gazette (Ticaret Sicil Gazetesi).";
    fundsEx = "✅ Sahi: Official Turkish host invitation + Trade Registry Gazette extract + company dispatch letter. ❌ Galat: Unregistered firm.";
  } else if (cat === 'pr' || lowerCode.includes('pr') || lowerCode.includes('citizenship') || lowerCode.includes('tapu-400k')) {
    fundsMin = "Citizenship by Investment requires min USD 400,000 real estate purchase with 3-year no-sale annotation on Tapu (Title Deed) OR USD 500,000 bank deposit in Turkish bank held for 3 years. Long-Term Residence (Uzun Dönem İkamet) requires 8 years continuous legal residence in Turkey.";
    fundsBankMonths = "8 years continuous e-Ikamet residence proof, Tapu title deed valuation report (SPK approved), and bank deposit certificates.";
    fundsSudden = "Continuous residence with no absence over 180 days in a single year or 365 days total in 5 years.";
    fundsEx = "✅ Sahi: SPK approved USD 400k Tapu valuation report + 3-year non-sale annotation + Ministry Certificate of Eligibility. ❌ Galat: Unapproved valuation or unannotated title deed.";
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

const RAW_TR_VISAS: VisaItem[] = [
  // TOURIST 12 LIVE
  {
    id: "tr-TOU-001",
    officialCode: "TR-TOU-001",
    name: "e-Visa Tourist Single 90 Days 180 Days e-Visa Tourist - Most common Tourist Turkey",
    fee: "USD 60 e-Visa tourist",
    validity: "180 days validity (90 days stay)",
    stay: "Max 90 days",
    processing: "Instant to 24 Hours (Online Portal)",
    purpose: "Tourism, sightseeing, and leisure travel in Turkey",
    eligibility: "Foreign nationals eligible for official Turkish e-Visa online portal (evisa.gov.tr) holding valid passport",
    officialSource: "https://www.evisa.gov.tr",
    popular: true,
    highlight: true,
    categoryCode: "tourist",
    record_type: "TOURIST_VISA",
    docs: [
      "Valid Passport (minimum 6 months validity beyond arrival date, 1 blank page) ⭐",
      "e-Visa Application submitted online via official portal (evisa.gov.tr) ⭐",
      "Valid Credit/Debit Card for online fee payment",
      "Confirmed Return Flight Ticket / Travel Reservation",
      "Hotel Booking / Accommodation Details in Turkey",
      "Proof of Sufficient Funds: Min USD 50 per day of stay in Turkey ⭐",
      "Valid Supporting Visa/Residence Permit (from Schengen, US, UK, Ireland) if required for conditional e-Visa nationalities"
    ]
  },
  {
    id: "tr-TOU-002",officialCode: "TR-TOU-002",name: "e-Visa Tourist Multiple 90 Days 180 Days e-Visa Tourist Multiple",fee: "USD 60 e-Visa tourist multiple",validity: "180 days validity (90 days multiple stay)",stay: "Max 90 days total",processing: "Instant online",purpose: "Frequent tourist and leisure travel to Turkey over 180 days",eligibility: "Nationalities eligible for multiple entry e-Visa on evisa.gov.tr",officialSource: "https://www.evisa.gov.tr",categoryCode: "tourist",record_type: "TOURIST_VISA",docs: ["Valid Passport 6M+ ⭐","e-Visa Multiple Entry Confirmation from evisa.gov.tr ⭐","Return Flight & Hotel Booking + Bank Proof USD 50/day"]
  },
  {
    id: "tr-TOU-003",officialCode: "TR-TOU-003",name: "Sticker Visa Tourist Single 90 Days Sticker Tourist Single 90 Days Consulate",fee: "USD 60 Sticker tourist single consulate",validity: "90 days single entry",stay: "Max 90 days",processing: "10 to 15 Days",purpose: "Tourism for nationalities requiring physical sticker visa from Turkish Embassy / Consulate",eligibility: "Applicants not eligible for e-Visa submitting via Turkish consular portal (Pre-Application System)",officialSource: "https://www.mfa.gov.tr",categoryCode: "tourist",record_type: "TOURIST_VISA",docs: ["Valid Passport 6M+ ⭐","Completed Turkish Consular Online Application Form & Appointment Slip ⭐","2 Biometric Photos (50x50mm white background) ⭐","Hotel & Flight Itinerary + Bank Statements 3 months (min USD 50/day) ⭐"]
  },
  {
    id: "tr-TOU-004",officialCode: "TR-TOU-004",name: "Sticker Visa Tourist Multiple 1Y 90 Days Sticker Tourist Multiple 1Y",fee: "USD 100 Sticker tourist multiple 1Y",validity: "1 Year Multiple Entry (90 days per stay)",stay: "Max 90 days per visit",processing: "10 to 15 Days",purpose: "Frequent tourist visits via physical consular sticker visa",eligibility: "Frequent travelers with verified history of travel to Turkey",officialSource: "https://www.mfa.gov.tr",categoryCode: "tourist",record_type: "TOURIST_VISA",docs: ["Passport + Copies of previous Turkish Visas ⭐","Consular Application Form + 3 Months Bank Statements ⭐"]
  },
  {
    id: "tr-TOU-005",officialCode: "TR-TOU-005",name: "Tourist Residence 1Y Touristic Residence 1Y Touristic Residence TR",fee: "USD 80 Residence touristic 1Y + Card 110",validity: "1 Year Residence Permit (Kısa Dönem Turizm İkamet İzni)",stay: "1 Year renewable",processing: "2 to 6 Weeks (Göç İdaresi e-Ikamet)",purpose: "Extended tourist stay in Turkey beyond 90 days",eligibility: "Foreigners holding valid initial visa applying for short-term touristic residence via e-ikamet.goc.gov.tr",officialSource: "https://e-ikamet.goc.gov.tr",popular: true,categoryCode: "tourist",record_type: "RESIDENCE_PERMIT",docs: ["e-Ikamet Application Form & Göç İdaresi Appointment Document ⭐","Notarized Turkish Rental Lease Agreement (Noter onaylı kira sözleşmesi) ⭐","Tax Number (Vergi Numarası) + Private Health Insurance in Turkey ⭐","Bank Statement showing min USD 500/month or USD 6,000/year ⭐"]
  },
  {
    id: "tr-TOU-006",officialCode: "TR-TOU-006",name: "Tourist Residence Extension Extension Touristic Residence 1Y Extension Touristic Residence TR",fee: "USD 80 Residence touristic extension 1Y + Card 110",validity: "1 Year Extension",stay: "1 Year",processing: "2 to 4 Weeks",purpose: "Extending short-term touristic residence permit inside Turkey",eligibility: "Current touristic residence permit holders submitting extension on e-Ikamet prior to expiry",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "tourist",record_type: "STATUS_DOCUMENT",docs: ["e-Ikamet Extension Application + Current Residence Card Copy ⭐","Updated Notarized Lease + Bank Statement past 6 months ⭐"]
  },
  {
    id: "tr-TOU-007",officialCode: "TR-TOU-007",name: "Transit Visa 7 Days Transit Visa 7 Days Transit TR",fee: "USD 20 Transit TR",validity: "7 Days Transit",stay: "Max 7 days",processing: "5 Days",purpose: "Transiting through Turkey territory to a third destination country",eligibility: "Travelers leaving airport transit area during layover in Turkey",officialSource: "https://www.mfa.gov.tr",categoryCode: "tourist",record_type: "TRANSIT_VISA",docs: ["Valid Passport 6M+ ⭐","Onward Flight Ticket within 7 days ⭐","Valid Visa for final destination country ⭐"]
  },
  {
    id: "tr-TOU-008",officialCode: "TR-TOU-008",name: "e-Visa Tourist - Medical Treatment 90 Days Medical Treatment e-Visa Medical TR",fee: "USD 60 e-Visa medical treatment TR",validity: "90 days within 180 days",stay: "Max 90 days",processing: "Instant online",purpose: "Receiving medical treatment or health tourism in accredited Turkish hospitals",eligibility: "Health tourists traveling to USHAŞ accredited medical centers in Turkey",officialSource: "https://www.evisa.gov.tr",categoryCode: "tourist",record_type: "MEDICAL_VISA",docs: ["Acceptance / Appointment Letter from Accredited Turkish Hospital (USHAŞ) ⭐","e-Visa Online Confirmation + Proof of Medical Funds ⭐"]
  },
  {
    id: "tr-TOU-009",officialCode: "TR-TOU-009",name: "Sticker Visa Tourist - Family Friends Visit 90 Days Family Friends Visit Sticker Family Friends TR",fee: "USD 60 Sticker family friends visit TR",validity: "90 days single entry",stay: "Max 90 days",processing: "10 to 15 Days",purpose: "Visiting family members or friends residing in Turkey",eligibility: "Foreigners invited by Turkish citizen or legal resident host with notarized invitation",officialSource: "https://www.mfa.gov.tr",categoryCode: "tourist",record_type: "TOURIST_VISA",docs: ["Notarized Invitation Letter from Host in Turkey (Noter onaylı davetname) ⭐","Host's Turkish ID (Kimlik) or Residence Card Copy ⭐","Visitor Bank Statement 3 months + Flight Itinerary"]
  },
  {
    id: "tr-TOU-010",officialCode: "TR-TOU-010",name: "e-Visa Tourist - Conference 90 Days Conference e-Visa Conference TR",fee: "USD 60 e-Visa conference TR",validity: "90 days within 180 days",stay: "Max 90 days",processing: "Instant online",purpose: "Attending academic or scientific conferences, seminars, or summits in Turkey",eligibility: "Conference attendees holding official invitation pass",officialSource: "https://www.evisa.gov.tr",categoryCode: "tourist",record_type: "CONFERENCE_VISA",docs: ["Official Conference Invitation Letter in Turkey ⭐","e-Visa Online Confirmation + Hotel/Flight Booking"]
  },
  {
    id: "tr-TOU-011",officialCode: "TR-TOU-011",name: "Tourist Residence - Property Owner 1Y 2Y Property Owner Touristic Residence Property TR",fee: "USD 80 Residence property owner + Card 110 + Title deed",validity: "1 to 2 Years Residence Permit (Tapu İkameti)",stay: "1 to 2 Years renewable",processing: "2 to 4 Weeks",purpose: "Short-term residence permit based on real estate ownership in Turkey",eligibility: "Foreign property owners holding official Title Deed (Tapu) with min USD 200,000 property valuation for major cities",officialSource: "https://e-ikamet.goc.gov.tr",popular: true,categoryCode: "tourist",record_type: "RESIDENCE_PERMIT",docs: ["Official Title Deed (Tapu) from Land Registry Office ⭐","Real Estate Valuation Report (SPK Onaylı Değerleme Raporu - min USD 200k) ⭐","e-Ikamet Application + DASK Earthquake Insurance + Tax Number ⭐"]
  },
  {
    id: "tr-TOU-012",officialCode: "TR-TOU-012",name: "Tourist Residence - Yacht 1Y Yacht Touristic Residence Yacht TR",fee: "USD 80 Residence yacht + Card 110 + Yacht",validity: "Up to 1 Year Residence Permit",stay: "1 Year renewable",processing: "4 Weeks",purpose: "Residence permit for foreign yacht owners and crew docked at Turkish marinas",eligibility: "Yacht owners holding official marina mooring contract in Turkey",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "tourist",record_type: "RESIDENCE_PERMIT",docs: ["Official Marina Mooring Contract in Turkey ⭐","Yacht Ownership Documents / Vessel Registration Certificate ⭐"]
  },

  // BUSINESS 8 LIVE
  {
    id: "tr-BIZ-001",
    officialCode: "TR-BIZ-001",
    name: "e-Visa Business Single 90 Days e-Visa Business - Most common Business Turkey",
    fee: "USD 60 e-Visa business",
    validity: "180 days validity (90 days stay)",
    stay: "Max 90 days",
    processing: "Instant to 24 Hours",
    purpose: "Commercial business travel, trade meetings, corporate negotiations in Turkey",
    eligibility: "Business professionals invited by a Turkish registered enterprise",
    officialSource: "https://www.evisa.gov.tr",
    popular: true,
    highlight: true,
    categoryCode: "business",
    record_type: "BUSINESS_VISA",
    docs: [
      "Valid Passport (min 6 months validity) ⭐",
      "e-Visa Business Confirmation obtained online via evisa.gov.tr ⭐",
      "Official Business Invitation Letter from Turkish Host Company ⭐",
      "Sending Foreign Company Dispatch Letter detailing trip purpose and commercial background",
      "Bank Statement showing min USD 50/day funds",
      "Confirmed Hotel & Flight Itinerary"
    ]
  },
  {
    id: "tr-BIZ-002",officialCode: "TR-BIZ-002",name: "e-Visa Business Multiple 90 Days e-Visa Business Multiple",fee: "USD 60 e-Visa business multiple",validity: "180 days validity (90 days multiple stay)",stay: "Max 90 days total",processing: "Instant online",purpose: "Frequent commercial trips to Turkish corporate partners",eligibility: "Business executives with ongoing trade relationship in Turkey",officialSource: "https://www.evisa.gov.tr",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Passport 6M+ ⭐","e-Visa Multiple Entry Business Confirmation ⭐","Turkish Company Invitation + Foreign Employer Dispatch Letter"]
  },
  {
    id: "tr-BIZ-003",officialCode: "TR-BIZ-003",name: "Sticker Visa Business Single 90 Days Sticker Business Single Consulate",fee: "USD 60 Sticker business single consulate",validity: "90 days single entry",stay: "Max 90 days",processing: "10 to 15 Days",purpose: "Business travel via physical consular sticker visa",eligibility: "Business travelers submitting via Turkish embassy consular portal",officialSource: "https://www.mfa.gov.tr",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Passport + Consular Application Form & Appointment Slip ⭐","Turkish Host Invitation Letter + Trade Registry Gazette Extract ⭐","Foreign Employer Dispatch Letter & Corporate Financials"]
  },
  {
    id: "tr-BIZ-004",officialCode: "TR-BIZ-004",name: "Sticker Visa Business Multiple 1Y 90 Days Sticker Business Multiple 1Y",fee: "USD 100 Sticker business multiple 1Y",validity: "1 Year Multiple Entry (90 days per visit)",stay: "Max 90 days per visit",processing: "10 to 15 Days",purpose: "Long-term frequent corporate travel via consular sticker visa",eligibility: "Senior executives with frequent business engagements in Turkey",officialSource: "https://www.mfa.gov.tr",categoryCode: "business",record_type: "BUSINESS_VISA",docs: ["Passport 1Y+ + Previous Turkish Business Visas ⭐","Turkish Host Invitation + Foreign Company Dispatch Letter"]
  },
  {
    id: "tr-BIZ-005",officialCode: "TR-BIZ-005",name: "Business Residence 1Y Business Residence 1Y Business Residence TR",fee: "USD 80 Residence business 1Y + Card 110 + Company",validity: "1 Year Residence Permit (Ticari İkamet İzni)",stay: "1 Year renewable",processing: "2 to 4 Weeks",purpose: "Operating a business, establishing a company, or commercial investment in Turkey",eligibility: "Foreign business owners / shareholders registered in Turkish Trade Registry",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "business",record_type: "RESIDENCE_PERMIT",docs: ["e-Ikamet Application + Turkish Trade Registry Gazette (Ticaret Sicil Gazetesi) ⭐","Company Tax Plate (Vergi Levhası) + Signature Circular (İmza Sirküleri) ⭐","Notarized Office Rental Lease + Bank Statement 6 months"]
  },
  {
    id: "tr-BIZ-006",officialCode: "TR-BIZ-006",name: "Business Residence Extension Extension Business Residence 1Y Extension Business Residence TR",fee: "USD 80 Residence business extension 1Y + Card 110",validity: "1 Year Extension",stay: "1 Year",processing: "2 to 4 Weeks",purpose: "Extending business residence permit for company owners",eligibility: "Active company shareholders in Turkey with updated tax clearance",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "business",record_type: "STATUS_DOCUMENT",docs: ["Updated Vergi Levhası & SGK Company Insurance Clearance ⭐"]
  },
  {
    id: "tr-BIZ-007",officialCode: "TR-BIZ-007",name: "e-Visa Business - Conference 90 Days Conference e-Visa Business Conference TR",fee: "USD 60 e-Visa business conference TR",validity: "90 days within 180 days",stay: "Max 90 days",processing: "Instant online",purpose: "Attending commercial conventions, industry summits, and expos in Turkey",eligibility: "Trade delegates and corporate event participants",officialSource: "https://www.evisa.gov.tr",categoryCode: "business",record_type: "CONFERENCE_VISA",docs: ["Trade Summit Entry Registration & Invoice in Turkey ⭐","e-Visa Online Confirmation + Dispatch Letter"]
  },
  {
    id: "tr-BIZ-008",officialCode: "TR-BIZ-008",name: "Business Residence - Investor 1Y 2Y Investor Business Residence Investor TR",fee: "USD 80 Residence investor + Card 110 + Investment USD 500k",validity: "1 to 2 Years Residence Permit",stay: "1 to 2 Years",processing: "4 Weeks",purpose: "Residence permit for significant business capital investors in Turkey",eligibility: "Investors contributing capital in Turkish enterprise meeting Ministry criteria",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "business",record_type: "INVESTOR_VISA",docs: ["Proof of Foreign Direct Investment in Turkish Enterprise ⭐","Ministry Certificate of Investor Eligibility"]
  },

  // WORK 20 LIVE
  {
    id: "tr-WRK-001",
    officialCode: "TR-WRK-001",
    name: "Work Visa Work Permit 1Y Work Visa Work Permit 1Y - Most common Work Permit Turkey - Work Permit + Work Visa + Residence",
    fee: "USD 80 Work visa + Work permit USD 100 + Residence USD 80 + Card 110",
    validity: "1 Year Work Permit & Work Residence (Çalışma İzni)",
    stay: "1 Year renewable",
    processing: "4 to 6 Weeks (Dual Consulate + MLSS Submission)",
    purpose: "Formal employment with a Turkish registered company (combines work permit + residence permit)",
    eligibility: "Foreign professionals with a job offer from a Turkish company registered with MLSS (Çalışma ve Sosyal Güvenlik Bakanlığı) earning statutory minimum salary ratio",
    officialSource: "https://www.csgb.gov.tr/uab/en",
    popular: true,
    highlight: true,
    categoryCode: "work",
    record_type: "WORK_VISA",
    docs: [
      "Job Offer & Employment Contract signed with Turkish Employer (Noter onaylı iş sözleşmesi) ⭐",
      "Work Permit Approval Decision from Ministry of Labour and Social Security (ÇSGB / MLSS) ⭐",
      "Consular Work Visa Pre-Application Reference Number ⭐",
      "Employer Documents: Trade Registry Gazette, Tax Plate (Vergi Levhası), SGK Insurance Clearance",
      "Valid Passport + Educational Degree Diploma (with Turkish translation) ⭐",
      "Biometric Photographs + Work Permit Fee Payment Receipt"
    ]
  },
  {
    id: "tr-WRK-002",officialCode: "TR-WRK-002",name: "Work Residence 1Y Work Residence 1Y Work Residence TR",fee: "USD 80 Residence work 1Y + Card 110",validity: "1 Year Work Residence Card",stay: "1 Year renewable",processing: "2 to 4 Weeks",purpose: "In-country work residence card issuance upon entry with MLSS work permit",eligibility: "Foreign workers holding approved MLSS work permit",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "work",record_type: "RESIDENCE_PERMIT",docs: ["MLSS Approved Work Permit Document ⭐","BRP Address Registration & SGK Enrollment Proof"]
  },
  {
    id: "tr-WRK-003",officialCode: "TR-WRK-003",name: "Work Visa Extension Extension Work Visa Work Permit 1Y Extension Work Visa TR",fee: "USD 80 Work visa extension + Work permit extension USD 100 + Residence extension USD 80 + Card 110",validity: "2 to 3 Years Extension",stay: "2 to 3 Years",processing: "4 Weeks",purpose: "Extending MLSS work permit for continuing employment in Turkey",eligibility: "Work permit holders applying for extension within 60 days of expiry via e-izin MLSS portal",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["MLSS e-İzin Work Permit Extension Approval ⭐","Updated Employer SGK Insurance Contribution Receipts ⭐"]
  },
  {
    id: "tr-WRK-004",officialCode: "TR-WRK-004",name: "Work Residence Extension Extension Work Residence 1Y Extension Work Residence TR",fee: "USD 80 Residence work extension 1Y + Card 110",validity: "2 to 3 Years Extension",stay: "2 to 3 Years",processing: "2 to 4 Weeks",purpose: "In-country extension of work residence permit",eligibility: "Workers extending MLSS work permit status",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["Extended MLSS Work Permit Certificate + SGK Clearance"]
  },
  {
    id: "tr-WRK-005",officialCode: "TR-WRK-005",name: "Independent Work Permit 1Y Independent Work Permit 1Y Independent Work Permit TR",fee: "USD 80 Independent work permit 1Y + Residence USD 80 + Card 110 Independent TR",validity: "1 Year Independent Work Permit (Bağımsız Çalışma İzni)",stay: "1 Year renewable",processing: "6 to 8 Weeks",purpose: "Self-employed professionals and freelancers operating independently in Turkey",eligibility: "Professionals residing continuously in Turkey for min 5 years meeting MLSS economic contribution criteria",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "WORK_VISA",docs: ["Proof of 5 Years Continuous Residence in Turkey ⭐","Professional Activity Tax Plate (Vergi Levhası) & Business Plan evaluated by MLSS ⭐"]
  },
  {
    id: "tr-WRK-006",officialCode: "TR-WRK-006",name: "Exceptional Work Permit 1Y Exceptional Work Permit 1Y Exceptional Work Permit TR",fee: "USD 80 Exceptional work permit 1Y + Residence USD 80 + Card 110 Exceptional TR",validity: "1 Year Exceptional Work Permit (Istisnai Çalışma İzni)",stay: "1 Year renewable",processing: "4 Weeks",purpose: "Work permit granted under exceptional criteria (EU citizens, spouses of Turkish citizens, foreign investors)",eligibility: "Foreigners qualifying under Article 16 of International Labour Law No. 6735",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "WORK_VISA",docs: ["Exceptional Category Eligibility Certificate (e.g. Marriage to TR citizen / EU citizenship) ⭐","Employment Contract & MLSS Application Form"]
  },
  {
    id: "tr-WRK-007",officialCode: "TR-WRK-007",name: "Turquoise Card Turquoise Card Turquoise Card TR Turquoise",fee: "USD 80 Turquoise card + Residence + Turquoise TR",validity: "Indefinite Work & Residence Permit (Turkuaz Kart)",stay: "Permanent Residence & Work Rights",processing: "8 to 12 Weeks (MLSS Evaluation Board)",purpose: "Fast-track permanent work & residence rights for highly qualified scientists, athletes, artists, and major investors",eligibility: "High-level professionals scoring highly on MLSS point system (education, salary, innovation, investment)",officialSource: "https://www.csgb.gov.tr/uab/en",popular: true,categoryCode: "work",record_type: "WORK_VISA",docs: ["MLSS Point System Evaluation Certificate (Education, Salary, Research) ⭐","Proof of High-Level Academic / Scientific / Investment Achievement ⭐","Clean Criminal Record + Passport Copy"]
  },
  {
    id: "tr-WRK-008",officialCode: "TR-WRK-008",name: "Work Visa - Internship 1Y Internship Work Visa Internship Work TR",fee: "USD 80 Work visa internship + Work permit USD 50 Internship + Residence USD 80 + Card 110 Internship Work TR",validity: "Up to 1 Year",stay: "Max 1 year",processing: "4 Weeks",purpose: "Graduate or professional internship placed at a Turkish enterprise",eligibility: "Interns undertaking mandatory practical training with MLSS internship work permit",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "INTERN_VISA",docs: ["Tripartite Internship Agreement + MLSS Internship Work Permit Approval ⭐"]
  },
  {
    id: "tr-WRK-009",officialCode: "TR-WRK-009",name: "Work Visa - Researcher 1Y Researcher Work Visa Researcher Work TR",fee: "USD 80 Work visa researcher + Work permit USD 100 Researcher + Residence USD 80 + Card 110 Researcher Work TR",validity: "Up to 1 Year",stay: "1 Year renewable",processing: "4 Weeks",purpose: "Scientific researchers employed at Turkish research centers or TÜBİTAK projects",eligibility: "Researchers with MLSS work permit exemption or research work permit",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "RESEARCH_VISA",docs: ["TÜBİTAK / Research Center Project Hosting Agreement & MLSS Approval ⭐"]
  },
  {
    id: "tr-WRK-010",officialCode: "TR-WRK-010",name: "Work Visa - Artist 1Y Artist Work Visa Artist Work TR",fee: "USD 80 Work visa artist + Work permit USD 100 Artist + Residence USD 80 + Card 110 Artist Work TR",validity: "Up to 1 Year",stay: "1 Year",processing: "4 Weeks",purpose: "Performing artists, musicians, and performers employed by Turkish venues or Ministry of Culture",eligibility: "Artists with performance contract and Ministry of Culture / MLSS work permit",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "PERFORMER_VISA",docs: ["Ministry of Culture Approval Letter + MLSS Artist Work Permit ⭐"]
  },
  {
    id: "tr-WRK-011",officialCode: "TR-WRK-011",name: "Work Visa - Sports 1Y Sports Work Visa Sports Work TR",fee: "USD 80 Work visa sports + Work permit USD 100 Sports + Residence USD 80 + Card 110 Sports Work TR",validity: "Up to 1 Year",stay: "Duration of sports contract",processing: "2 to 4 Weeks",purpose: "Professional athletes and sports coaches signed by Turkish sports clubs (Süper Lig)",eligibility: "Professional athletes endorsed by Turkish Youth and Sports Ministry / TFF",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "WORK_VISA",docs: ["TFF / Youth & Sports Ministry Endorsement + Professional Sports Contract ⭐"]
  },
  {
    id: "tr-WRK-012",officialCode: "TR-WRK-012",name: "Work Visa - Engineer 1Y Engineer Work Visa Engineer Work TR",fee: "USD 80 Work visa engineer + Work permit USD 100 Engineer + Residence USD 80 + Card 110 Engineer Work TR",validity: "1 Year renewable",stay: "1 Year",processing: "4 to 6 Weeks",purpose: "Foreign engineers employed in Turkish engineering projects",eligibility: "Engineers with TMMOB (Chamber of Turkish Engineers and Architects) equivalency + MLSS permit",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "WORK_VISA",docs: ["TMMOB Chamber Equivalency Certificate + MLSS Engineer Work Permit ⭐"]
  },
  {
    id: "tr-WRK-013",officialCode: "TR-WRK-013",name: "Work Visa - Academic 1Y Academic Work Visa Academic Work TR",fee: "USD 80 Work visa academic + Work permit USD 100 Academic + Residence USD 80 + Card 110 Academic Work TR",validity: "1 Year renewable",stay: "1 Year",processing: "4 Weeks",purpose: "Foreign professors and academic lecturers employed at Turkish universities",eligibility: "Academic staff approved by YÖK (Higher Education Council) and MLSS",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "WORK_VISA",docs: ["YÖK Approval Certificate + Academic Employment Contract ⭐"]
  },
  {
    id: "tr-WRK-014",officialCode: "TR-WRK-014",name: "Work Visa - Domestic Worker 1Y Domestic Worker Work Visa Domestic Worker Work TR",fee: "USD 80 Work visa domestic worker + Work permit USD 100 Domestic worker + Residence USD 80 + Card 110 Domestic worker Work TR",validity: "1 Year renewable",stay: "1 Year",processing: "4 Weeks",purpose: "Domestic care workers and home care personnel employed by Turkish households",eligibility: "Domestic caregivers registered with MLSS e-izin portal",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "WORK_VISA",docs: ["Household Employment Contract + Employer SGK Registration & MLSS Permit ⭐"]
  },
  {
    id: "tr-WRK-015",officialCode: "TR-WRK-015",name: "Work Visa - Seasonal 6M Seasonal Work Visa Seasonal Work TR",fee: "USD 80 Work visa seasonal + Work permit USD 50 Seasonal + Residence USD 80 + Card 110 Seasonal Work TR",validity: "Up to 6 Months",stay: "Max 6 months",processing: "4 Weeks",purpose: "Seasonal employment in Turkish agriculture or tourism sectors",eligibility: "Seasonal workers with MLSS seasonal work permit clearance",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "WORK_VISA",docs: ["Seasonal Employment Contract + MLSS Seasonal Work Permit Approval ⭐"]
  },
  {
    id: "tr-WRK-016",officialCode: "TR-WRK-016",name: "MLSS Authority Ministry Labour Social Security Authority Work Permit MLSS",fee: "EUR 0 MLSS authority TR",validity: "Authority Record",stay: "N/A",processing: "N/A",purpose: "Official Ministry of Labour and Social Security (ÇSGB / MLSS) work permit classification",eligibility: "Public reference record for Turkish MLSS work permit governance",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "STATUS_DOCUMENT",docs: ["MLSS e-İzin Work Permit Governance Guidelines ⭐"]
  },
  {
    id: "tr-WRK-017",officialCode: "TR-WRK-017",name: "Work Visa - Montage Repair 3M Montage Repair Work Visa Montage Repair Work TR",fee: "USD 80 Work visa montage repair + Work permit USD 50 Montage repair + Residence USD 80 + Card 110 Montage repair Work TR",validity: "Up to 3 Months",stay: "Max 3 months",processing: "2 Weeks",purpose: "Assembly, installation, maintenance, or repair of imported machinery in Turkey",eligibility: "Technicians deployed by foreign machinery suppliers under warranty/sale agreement",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "WORK_VISA",docs: ["Montage & Repair Duty Order + Machinery Sale/Warranty Contract in Turkey ⭐"]
  },
  {
    id: "tr-WRK-018",officialCode: "TR-WRK-018",name: "Work Visa - Assigned Lecturer 1Y Assigned Lecturer Work Visa Assigned Lecturer Work TR",fee: "USD 80 Work visa assigned lecturer + Work permit USD 100 Assigned lecturer + Residence USD 80 + Card 110 Assigned lecturer Work TR",validity: "Up to 1 Year",stay: "1 Year",processing: "4 Weeks",purpose: "Visiting lecturers assigned under inter-university academic cooperation",eligibility: "Visiting academics approved by YÖK and MLSS",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "WORK_VISA",docs: ["Inter-University Academic Exchange Agreement + YÖK Assignment Letter ⭐"]
  },
  {
    id: "tr-WRK-019",officialCode: "TR-WRK-019",name: "Work Visa - Home Services 1Y Home Services Work Visa Home Services Work TR",fee: "USD 80 Work visa home services + Work permit USD 100 Home services + Residence USD 80 + Card 110 Home services Work TR",validity: "1 Year renewable",stay: "1 Year",processing: "4 Weeks",purpose: "Home healthcare and elderly care services in Turkey",eligibility: "Caregivers registered with MLSS home care framework",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "WORK_VISA",docs: ["Home Healthcare Contract + MLSS Approval & Medical Report ⭐"]
  },
  {
    id: "tr-WRK-020",officialCode: "TR-WRK-020",name: "Work Visa - Religious Affairs 1Y Religious Affairs Work Visa Religious Affairs Work TR",fee: "USD 80 Work visa religious affairs + Work permit USD 100 Religious affairs + Residence USD 80 + Card 110 Religious affairs Work TR",validity: "1 Year renewable",stay: "1 Year",processing: "4 Weeks",purpose: "Religious personnel posted to official religious foundations in Turkey",eligibility: "Ministers of religion assigned via Presidency of Religious Affairs (Diyanet)",officialSource: "https://www.csgb.gov.tr/uab/en",categoryCode: "work",record_type: "WORK_VISA",docs: ["Diyanet (Presidency of Religious Affairs) Approval Letter & Work Permit ⭐"]
  },

  // STUDENT 8 LIVE
  {
    id: "tr-STU-001",
    officialCode: "TR-STU-001",
    name: "Student Visa Student Visa Student Visa - Most common Student Turkey",
    fee: "USD 80 Student visa + Residence USD 80 + Card 110 Student",
    validity: "1 Year renewable for duration of degree (Öğrenci İkamet İzni)",
    stay: "1 Year renewable",
    processing: "2 to 4 Weeks",
    purpose: "Higher education studies (Bachelor's, Master's, PhD) at a YÖK accredited university in Turkey",
    eligibility: "Foreign students accepted at a Turkish university holding official Öğrenci Belgesi (Enrollment Certificate)",
    officialSource: "https://e-ikamet.goc.gov.tr",
    popular: true,
    highlight: true,
    categoryCode: "student",
    record_type: "STUDENT_VISA",
    docs: [
      "Official University Acceptance Letter & Student Certificate (Öğrenci Belgesi) from YÖK ⭐",
      "Consular Student Visa Approval / Pre-Application Reference Number ⭐",
      "Proof of Financial Means: Bank statement or scholarship showing min USD 500/month (USD 6,000/year) ⭐",
      "Turkish Health Insurance (SGK GSS Enrollment or Private Student Health Insurance) ⭐",
      "Valid Passport + Photos + e-Ikamet Student Appointment Document",
      "Address Proof: Dormitory Certificate (Yurt Belgesi) or Notarized Rental Lease"
    ]
  },
  {
    id: "tr-STU-002",officialCode: "TR-STU-002",name: "Student Residence 1Y Student Residence 1Y Student Residence TR",fee: "USD 80 Residence student 1Y + Card 110 Student residence TR",validity: "1 Year Student Residence Card",stay: "1 Year renewable",processing: "2 to 4 Weeks",purpose: "In-country student residence permit card issuance via e-Ikamet",eligibility: "Foreign university students in Turkey with active YÖK enrollment",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "student",record_type: "RESIDENCE_PERMIT",docs: ["YÖK Öğrenci Belgesi + e-Ikamet Student Application Document ⭐","SGK Health Insurance & Dormitory / Lease Certificate"]
  },
  {
    id: "tr-STU-003",officialCode: "TR-STU-003",name: "Student Residence Extension Extension Student Residence 1Y Extension Student Residence TR",fee: "USD 80 Residence student extension 1Y + Card 110 Student residence extension TR",validity: "1 Year Extension",stay: "1 Year",processing: "2 to 4 Weeks",purpose: "Annual extension of student residence permit during degree study",eligibility: "Students continuing degree program with updated Öğrenci Belgesi",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "student",record_type: "STATUS_DOCUMENT",docs: ["Updated YÖK Öğrenci Belgesi + Bank Statement & Health Insurance ⭐"]
  },
  {
    id: "tr-STU-004",officialCode: "TR-STU-004",name: "Student Visa Extension Extension Student Visa Student Visa Extension Student Visa TR",fee: "USD 80 Student visa extension + Residence extension USD 80 + Card 110 Student visa extension TR",validity: "1 Year Extension",stay: "1 Year",processing: "2 to 4 Weeks",purpose: "Consular student visa extension for continuing students",eligibility: "Students renewing visa status",officialSource: "https://www.mfa.gov.tr",categoryCode: "student",record_type: "STATUS_DOCUMENT",docs: ["University Enrollment Certificate & Consular Extension Application ⭐"]
  },
  {
    id: "tr-STU-005",officialCode: "TR-STU-005",name: "Student Visa - Doctoral PhD 1Y Doctoral PhD Student Visa Doctoral PhD Student TR",fee: "USD 80 Student visa doctoral PhD + Residence USD 80 + Card 110 Doctoral PhD Student TR",validity: "1 Year renewable (up to 4 years)",stay: "Duration of PhD",processing: "2 to 4 Weeks",purpose: "Pursuing doctoral PhD studies at a Turkish university",eligibility: "PhD candidates admitted to YÖK accredited university doctoral school",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["PhD Admission Letter & YÖK Doctoral Registration Certificate ⭐"]
  },
  {
    id: "tr-STU-006",officialCode: "TR-STU-006",name: "Student Visa - Language 1Y Language Student Visa Language Student TR",fee: "USD 80 Student visa language + Residence USD 80 + Card 110 Language Student TR",validity: "Up to 1 Year",stay: "1 Year",processing: "2 to 4 Weeks",purpose: "Attending official Turkish language preparation course (TÖMER)",eligibility: "Students enrolled in university-affiliated TÖMER language center",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "student",record_type: "STUDENT_VISA",docs: ["TÖMER (Turkish Language Center) Official Enrollment Certificate ⭐"]
  },
  {
    id: "tr-STU-007",officialCode: "TR-STU-007",name: "Student Visa - Internship 1Y Internship Student Visa Internship Student TR",fee: "USD 80 Student visa internship + Residence USD 80 + Card 110 Internship Student TR",validity: "Up to 1 Year",stay: "Max 1 year",processing: "4 Weeks",purpose: "Student internship placed at Turkish university or enterprise under Erasmus+",eligibility: "Erasmus+ interns with university learning agreement",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "student",record_type: "INTERN_VISA",docs: ["Erasmus+ Learning Agreement for Traineeships & Host Acceptance ⭐"]
  },
  {
    id: "tr-STU-008",officialCode: "TR-STU-008",name: "Student Visa - Scholarship 1Y Scholarship Student Visa Scholarship Student TR",fee: "USD 80 Student visa scholarship + Residence USD 80 + Card 110 Scholarship Student TR",validity: "1 Year renewable",stay: "Duration of scholarship",processing: "2 to 4 Weeks",purpose: "Türkiye Scholarships (Türkiye Bursları) government awardees",eligibility: "Students awarded official Türkiye Bursları state scholarship",officialSource: "https://tbbs.turkiyeburslari.gov.tr",popular: true,categoryCode: "student",record_type: "STUDENT_VISA",docs: ["Official Türkiye Bursları Award Certificate (covers tuition + stipend + GSS insurance) ⭐"]
  },

  // FAMILY 8 LIVE
  {
    id: "tr-FAM-001",
    officialCode: "TR-FAM-001",
    name: "Family Residence 1Y 3Y Family Residence 1Y 3Y Family Reunification - Most common Family Turkey",
    fee: "USD 80 Residence family 1Y 3Y + Card 110 Family residence TR",
    validity: "1 to 3 Years Residence Permit (Aile İkamet İzni)",
    stay: "1 to 3 Years (tied to sponsor's permit)",
    processing: "2 to 6 Weeks (Göç İdaresi e-Ikamet)",
    purpose: "Family reunification for foreign spouse and minor children of Turkish citizens or legal residence permit holders",
    eligibility: "Spouse or minor child of a Turkish citizen or foreign resident holding valid residence/work permit in Turkey (sponsor must earn min statutory minimum wage and maintain health insurance)",
    officialSource: "https://e-ikamet.goc.gov.tr",
    popular: true,
    highlight: true,
    categoryCode: "family",
    record_type: "FAMILY_VISA",
    docs: [
      "Apostilled / Legalised Marriage Certificate or Birth Certificate with certified Turkish translation (Noter onaylı) ⭐",
      "Sponsor's Turkish ID (Kimlik) or Valid Residence / Work Permit Copy ⭐",
      "Sponsor's Income Proof: SGK insurance history or bank statements showing min minimum wage income ⭐",
      "Private Health Insurance in Turkey covering all family members (SGK / Private) ⭐",
      "Sponsor's BRP Address Registration (Adres Kayıt Belgesi via e-Devlet) ⭐",
      "Valid Passports + e-Ikamet Family Application Appointment Document"
    ]
  },
  {
    id: "tr-FAM-002",officialCode: "TR-FAM-002",name: "Family Residence Extension Extension Family Residence 1Y Extension Family Residence TR",fee: "USD 80 Residence family extension 1Y + Card 110 Family residence extension TR",validity: "1 to 3 Years Extension",stay: "1 to 3 Years",processing: "2 to 4 Weeks",purpose: "Extending family residence permit in Turkey",eligibility: "Family residence permit holders maintaining continuous marriage/family status",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "family",record_type: "STATUS_DOCUMENT",docs: ["e-Ikamet Extension Form + Updated Sponsor SGK Income Slips ⭐"]
  },
  {
    id: "tr-FAM-003",officialCode: "TR-FAM-003",name: "Family Visa Family Visa Family Visa Family Visa TR",fee: "USD 80 Family visa + Residence USD 80 + Card 110 Family visa TR",validity: "90 days entry + 1 to 3 Years Residence Permit",stay: "1 to 3 Years",processing: "4 Weeks",purpose: "Consular family reunification visa for entering Turkey",eligibility: "Foreign family members applying via Turkish consulate abroad",officialSource: "https://www.mfa.gov.tr",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["Apostilled Marriage / Birth Certificate + Consular Family Visa Form ⭐"]
  },
  {
    id: "tr-FAM-004",officialCode: "TR-FAM-004",name: "Family Visa Extension Extension Family Visa Family Visa Extension Family Visa TR",fee: "USD 80 Family visa extension + Residence extension USD 80 + Card 110 Family visa extension TR",validity: "Extension up to 3 Years",stay: "3 Years",processing: "4 Weeks",purpose: "Consular extension of family visa",eligibility: "Family visa holders renewing entry status",officialSource: "https://www.mfa.gov.tr",categoryCode: "family",record_type: "STATUS_DOCUMENT",docs: ["Sponsor Income Proof + Consular Application Form"]
  },
  {
    id: "tr-FAM-005",officialCode: "TR-FAM-005",name: "Family Residence - Child 1Y 3Y Child Family Residence Child Family Residence TR",fee: "USD 80 Residence family child 1Y 3Y + Card 110 Child family residence TR",validity: "1 to 3 Years Residence Permit",stay: "Until age 18",processing: "2 to 4 Weeks",purpose: "Family residence permit for foreign minor children in Turkey",eligibility: "Minor children under 18 of Turkish citizen or resident parent",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["Apostilled Birth Certificate + Parent SGK & Address Proof ⭐"]
  },
  {
    id: "tr-FAM-006",officialCode: "TR-FAM-006",name: "Family Residence - Adoption 1Y 3Y Adoption Family Residence Adoption Family Residence TR",fee: "USD 80 Residence family adoption 1Y 3Y + Card 110 Adoption family residence TR",validity: "1 to 3 Years Residence Permit",stay: "1 to 3 Years",processing: "4 Weeks",purpose: "Family residence permit for adopted foreign child",eligibility: "Adopted children with official Turkish court adoption approval",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["Turkish Court Adoption Order + Adoptive Parent ID Copy ⭐"]
  },
  {
    id: "tr-FAM-007",officialCode: "TR-FAM-007",name: "Family Residence - Humanitarian 1Y Humanitarian Family Residence Humanitarian Family Residence TR",fee: "USD 80 Residence family humanitarian 1Y + Card 110 Humanitarian family residence TR",validity: "Up to 1 Year",stay: "1 Year",processing: "4 Weeks",purpose: "Humanitarian family residence permit granted under special protection grounds",eligibility: "Family members under humanitarian protection criteria",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["Göç İdaresi Humanitarian Protection Decision Certificate ⭐"]
  },
  {
    id: "tr-FAM-008",officialCode: "TR-FAM-008",name: "e-Visa Family Visit 90 Days e-Visa Family Visit Family Visit e-Visa TR",fee: "USD 60 e-Visa family visit TR",validity: "90 days within 180 days",stay: "Max 90 days",processing: "Instant online",purpose: "Short-term visit to family members in Turkey via online e-Visa",eligibility: "Foreign family members visiting Turkish residents short term",officialSource: "https://www.evisa.gov.tr",categoryCode: "family",record_type: "FAMILY_VISA",docs: ["e-Visa Online Confirmation + Notarized Host Invitation Letter in TR ⭐"]
  },

  // PR 6 LIVE + SPECIAL 17 LIVE = 23
  {
    id: "tr-PR-001",
    officialCode: "TR-PR-001",
    name: "Citizenship by Investment USD 400k Property Citizenship by Investment USD 400k Property - PR Turkey - Citizenship Investment USD 400k",
    fee: "USD 400k Property + Citizenship USD 1000 + Title deed",
    validity: "Direct Turkish Citizenship / Passport (Türk Vatandaşlığı)",
    stay: "Lifetime Citizenship",
    processing: "3 to 6 Months (Ministry of Environment & Urbanization + Interior Ministry)",
    purpose: "Direct acquisition of Turkish Citizenship through real estate investment of min USD 400,000",
    eligibility: "Foreign investors purchasing real estate in Turkey valued at min USD 400,000 with a 3-year no-sale annotation (şerh) on Title Deed (Tapu)",
    officialSource: "https://www.goc.gov.tr",
    popular: true,
    highlight: true,
    categoryCode: "pr",
    record_type: "PR_VISA",
    docs: [
      "Official Title Deed (Tapu) with 3-Year No-Sale Annotation (Satılamaz Şerhi) ⭐",
      "SPK Approved Real Estate Valuation Report (Değerleme Raporu - min USD 400,000) ⭐",
      "Döviz Alım Belgesi (Foreign Exchange Purchase Certificate from Central Bank) ⭐",
      "Ministry of Environment, Urbanization and Climate Change Certificate of Eligibility ⭐",
      "Apostilled Birth Certificate & Criminal Clearance Report",
      "Passport + Citizenship Application Form"
    ]
  },
  {
    id: "tr-PR-002",officialCode: "TR-PR-002",name: "Citizenship by Investment USD 500k Capital Citizenship by Investment USD 500k Capital Investment Citizenship TR",fee: "USD 500k Capital + Citizenship USD 1000 + Capital investment",validity: "Direct Turkish Citizenship",stay: "Lifetime Citizenship",processing: "3 to 6 Months",purpose: "Turkish citizenship through fixed capital investment of min USD 500,000",eligibility: "Investors contributing USD 500,000 fixed capital in Turkish enterprise verified by Ministry of Industry",officialSource: "https://www.goc.gov.tr",popular: true,categoryCode: "pr",record_type: "PR_VISA",docs: ["Ministry of Industry & Technology Certificate of Capital Eligibility (USD 500k+) ⭐","Döviz Alım Belgesi + Trade Registry Gazette Extract"]
  },
  {
    id: "tr-PR-003",officialCode: "TR-PR-003",name: "Long Term Residence 8Y Long Term Residence 8Y Long Term Residence TR",fee: "USD 80 Residence long term 8Y + Card 110 Long term residence TR",validity: "Indefinite Permanent Residence (Uzun Dönem İkamet İzni)",stay: "Indefinite / Permanent",processing: "8 to 12 Weeks",purpose: "Permanent residence in Turkey granted after 8 years continuous legal residence",eligibility: "Foreign residents living in Turkey continuously for 8 years with valid e-Ikamet without social assistance",officialSource: "https://e-ikamet.goc.gov.tr",popular: true,categoryCode: "pr",record_type: "PR_VISA",docs: ["Proof of 8 Years Uninterrupted Legal Residence in Turkey (e-Devlet İkamet Dökümü) ⭐","No Social Assistance Certificate from Social Aid Foundation ⭐","Sufficient & Regular Income Proof + Clean SAPS/Police Clearance"]
  },
  {
    id: "tr-PR-004",officialCode: "TR-PR-004",name: "Citizenship by Investment USD 500k Bank Deposit Citizenship by Investment USD 500k Bank Deposit Bank Deposit TR",fee: "USD 500k Bank deposit + Citizenship USD 1000 + Bank deposit",validity: "Direct Turkish Citizenship",stay: "Lifetime Citizenship",processing: "3 to 6 Months",purpose: "Citizenship through USD 500,000 bank deposit held for 3 years in a Turkish bank",eligibility: "Investors depositing USD 500,000 in Turkish bank certified by BDDK",officialSource: "https://www.goc.gov.tr",categoryCode: "pr",record_type: "PR_VISA",docs: ["BDDK (Banking Regulation Board) 3-Year Deposit Holding Certificate (USD 500k) ⭐"]
  },
  {
    id: "tr-PR-005",officialCode: "TR-PR-005",name: "Citizenship - Exceptional Exceptional Citizenship Exceptional Citizenship TR",fee: "USD 1000 Exceptional citizenship TR",validity: "Direct Turkish Citizenship",stay: "Lifetime Citizenship",processing: "3 to 6 Months",purpose: "Exceptional citizenship granted for industrial, scientific, artistic, or athletic contributions",eligibility: "Foreigners recommended by Presidential Cabinet for extraordinary service to Turkey",officialSource: "https://www.goc.gov.tr",categoryCode: "pr",record_type: "PR_VISA",docs: ["Presidential Cabinet Recommendation & Exceptional Contribution Portfolio ⭐"]
  },
  {
    id: "tr-PR-006",officialCode: "TR-PR-006",name: "Citizenship - General 5Y General Citizenship 5Y General Citizenship TR",fee: "USD 1000 General citizenship 5Y TR",validity: "Turkish Citizenship via Naturalization",stay: "Lifetime Citizenship",processing: "6 to 12 Months",purpose: "Acquiring Turkish citizenship through 5 years continuous legal residence",eligibility: "Legal residents living 5 continuous years in Turkey with basic Turkish language proficiency",officialSource: "https://www.goc.gov.tr",categoryCode: "pr",record_type: "PR_VISA",docs: ["Proof of 5 Years Continuous Residence in Turkey ⭐","Turkish Language Proficiency Interview Certificate ⭐","Clean Criminal Record + Income Proof"]
  },
  {
    id: "tr-SPE-001",officialCode: "TR-SPE-001",name: "Humanitarian Residence 1Y Humanitarian Residence 1Y Humanitarian Residence TR",fee: "USD 80 Residence humanitarian 1Y + Card 110 Humanitarian residence TR",validity: "1 Year Humanitarian Residence (Insani İkamet İzni)",stay: "1 Year renewable",processing: "2 to 4 Weeks",purpose: "Humanitarian residence permit issued under Article 46 of Law No. 6458",eligibility: "Foreigners facing compelling humanitarian or protection grounds in Turkey",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "pr",record_type: "HUMANITARIAN_VISA",docs: ["Göç İdaresi Humanitarian Protection Decision Certificate ⭐"]
  },
  {
    id: "tr-SPE-002",officialCode: "TR-SPE-002",name: "Victim Trafficking Residence 1Y Victim Trafficking Residence 1Y Victim Trafficking Residence TR",fee: "USD 80 Residence victim trafficking 1Y + Card 110 Victim trafficking residence TR",validity: "1 Year Residence Permit",stay: "1 Year",processing: "Immediate",purpose: "Residence permit for victims of human trafficking assisting law enforcement",eligibility: "Victims of human trafficking identified by Turkish law enforcement",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "pr",record_type: "HUMANITARIAN_VISA",docs: ["Prosecution Referral & Victim Protection Certificate ⭐"]
  },
  {
    id: "tr-SPE-003",officialCode: "TR-SPE-003",name: "Diplomat Visa Diplomat Visa Diplomat Visa Diplomat TR",fee: "USD 0 Diplomat TR",validity: "Posting Duration",stay: "Posting duration",processing: "1 to 2 Weeks",purpose: "Diplomatic accreditation for foreign embassy officials in Ankara / Istanbul",eligibility: "Accredited diplomats holding diplomatic passports",officialSource: "https://www.mfa.gov.tr",categoryCode: "pr",record_type: "DIPLOMAT_VISA",docs: ["Ministry Foreign Affairs Note Verbale & Diplomatic Passport ⭐"]
  },
  {
    id: "tr-SPE-004",officialCode: "TR-SPE-004",name: "Official Visa Official Visa Official Visa Official TR",fee: "USD 0 Official TR",validity: "Assignment Duration",stay: "Assignment duration",processing: "1 to 2 Weeks",purpose: "Government officials visiting Turkey on official state business",eligibility: "Foreign officials with official/service passports",officialSource: "https://www.mfa.gov.tr",categoryCode: "pr",record_type: "OFFICIAL_VISA",docs: ["MFA Official Note Verbale & Duty Assignment Order ⭐"]
  },
  {
    id: "tr-SPE-005",officialCode: "TR-SPE-005",name: "Courtesy Visa Courtesy Visa Courtesy Visa Courtesy TR",fee: "USD 0 Courtesy TR",validity: "Duration of visit",stay: "Visit duration",processing: "1 Week",purpose: "Courtesy visa granted to distinguished foreign guests",eligibility: "Dignitaries visiting Turkey",officialSource: "https://www.mfa.gov.tr",categoryCode: "pr",record_type: "COURTESY_VISA",docs: ["MFA Courtesy Authorization & Note Verbale ⭐"]
  },
  {
    id: "tr-SPE-006",officialCode: "TR-SPE-006",name: "Press Visa Press Visa Press Visa Press TR",fee: "USD 80 Press visa TR",validity: "Up to 1 Year",stay: "1 Year",processing: "2 to 4 Weeks",purpose: "Foreign journalists and press correspondents accredited in Turkey",eligibility: "Accredited journalists holding Directorate of Communications press card",officialSource: "https://www.iletisim.gov.tr",categoryCode: "pr",record_type: "JOURNALIST_VISA",docs: ["Directorate of Communications Foreign Press Accreditation Card ⭐"]
  },
  {
    id: "tr-SPE-007",officialCode: "TR-SPE-007",name: "Archaeological Excavation Visa 1Y Archaeological Excavation Visa 1Y Archaeological Excavation TR",fee: "USD 80 Archaeological excavation visa 1Y TR",validity: "Up to 1 Year",stay: "1 Year",processing: "4 Weeks",purpose: "Archaeologists conducting scientific excavations in Turkey",eligibility: "Archaeologists approved by Ministry of Culture and Tourism",officialSource: "https://www.mfa.gov.tr",categoryCode: "pr",record_type: "RESEARCH_VISA",docs: ["Ministry of Culture & Tourism Excavation Permit ⭐"]
  },
  {
    id: "tr-SPE-008",officialCode: "TR-SPE-008",name: "Freight Visa 3M Freight Visa 3M Freight Visa TR",fee: "USD 60 Freight visa 3M TR",validity: "3 Months Multiple Entry",stay: "Transit duration",processing: "5 Days",purpose: "Commercial freight truck drivers transiting Turkey",eligibility: "International freight drivers with UND / TIR carnet",officialSource: "https://www.mfa.gov.tr",categoryCode: "pr",record_type: "BUSINESS_VISA",docs: ["TIR Carnet / UND Freight Transport Certificate & Driver License ⭐"]
  },
  {
    id: "tr-SPE-009",officialCode: "TR-SPE-009",name: "Seafarer Visa 3M Seafarer Visa 3M Seafarer Visa TR",fee: "USD 60 Seafarer visa 3M TR",validity: "3 Months",stay: "Layover duration",processing: "5 Days",purpose: "Seamen joining vessels at Turkish ports",eligibility: "Merchant seafarers with Seaman's Book",officialSource: "https://www.mfa.gov.tr",categoryCode: "pr",record_type: "CREW_VISA",docs: ["Seaman's Discharge Book + Shipping Agent Guarantee in TR ⭐"]
  },
  {
    id: "tr-SPE-010",officialCode: "TR-SPE-010",name: "Education Visa Education Visa Education Visa Education TR",fee: "USD 80 Education visa TR",validity: "Up to 1 Year",stay: "1 Year",processing: "2 to 4 Weeks",purpose: "Primary and secondary school students studying in Turkey",eligibility: "School students admitted to accredited Turkish schools",officialSource: "https://www.mfa.gov.tr",categoryCode: "pr",record_type: "STUDENT_VISA",docs: ["Ministry of Education (MEB) School Acceptance Certificate ⭐"]
  },
  {
    id: "tr-SPE-011",officialCode: "TR-SPE-011",name: "Internship Erasmus Visa 1Y Internship Erasmus Visa 1Y Internship Erasmus TR",fee: "USD 80 Internship Erasmus visa 1Y TR",validity: "Up to 1 Year",stay: "1 Year",processing: "2 to 4 Weeks",purpose: "Erasmus+ student interns placed in Turkish universities/firms",eligibility: "Erasmus+ internship awardees",officialSource: "https://www.mfa.gov.tr",categoryCode: "pr",record_type: "INTERN_VISA",docs: ["Erasmus+ Traineeship Agreement & Host Acceptance ⭐"]
  },
  {
    id: "tr-SPE-012",officialCode: "TR-SPE-012",name: "Turkish Language Course Visa 1Y Turkish Language Course Visa 1Y Turkish Language Course TR",fee: "USD 80 Turkish language course visa 1Y TR",validity: "Up to 1 Year",stay: "1 Year",processing: "2 to 4 Weeks",purpose: "TÖMER Turkish language course students",eligibility: "Students enrolled in MEB/YÖK accredited language center",officialSource: "https://www.mfa.gov.tr",categoryCode: "pr",record_type: "STUDENT_VISA",docs: ["TÖMER Accredited Language School Certificate ⭐"]
  },
  {
    id: "tr-SPE-013",officialCode: "TR-SPE-013",name: "Citizenship by Investment - Government Bonds USD 500k Government Bonds USD 500k Citizenship Government Bonds TR",fee: "USD 500k Government bonds + Citizenship USD 1000 + Government bonds",validity: "Direct Turkish Citizenship",stay: "Lifetime Citizenship",processing: "3 to 6 Months",purpose: "Citizenship by purchasing USD 500,000 government bonds held 3 years",eligibility: "Investors holding USD 500,000 Turkish government bonds certified by Treasury Ministry",officialSource: "https://www.goc.gov.tr",categoryCode: "pr",record_type: "PR_VISA",docs: ["Ministry of Treasury & Finance 3-Year Bond Holding Certificate (USD 500k) ⭐"]
  },
  {
    id: "tr-SPE-014",officialCode: "TR-SPE-014",name: "Citizenship by Investment - Real Estate Investment Fund USD 500k Real Estate Investment Fund USD 500k Citizenship Real Estate Investment Fund TR",fee: "USD 500k Real estate investment fund + Citizenship USD 1000 + Real estate investment fund",validity: "Direct Turkish Citizenship",stay: "Lifetime Citizenship",processing: "3 to 6 Months",purpose: "Citizenship through real estate investment fund shares",eligibility: "Investors purchasing USD 500,000 real estate fund share units certified by SPK",officialSource: "https://www.goc.gov.tr",categoryCode: "pr",record_type: "PR_VISA",docs: ["SPK (Capital Markets Board) Fund Share Certificate (USD 500k) ⭐"]
  },
  {
    id: "tr-SPE-015",officialCode: "TR-SPE-015",name: "Citizenship by Investment - Venture Capital Investment Fund USD 500k Venture Capital Investment Fund USD 500k Citizenship Venture Capital Investment Fund TR",fee: "USD 500k Venture capital investment fund + Citizenship USD 1000 + Venture capital investment fund",validity: "Direct Turkish Citizenship",stay: "Lifetime Citizenship",processing: "3 to 6 Months",purpose: "Citizenship through venture capital fund shares",eligibility: "Investors purchasing USD 500,000 venture capital fund units certified by SPK",officialSource: "https://www.goc.gov.tr",categoryCode: "pr",record_type: "PR_VISA",docs: ["SPK Venture Capital Fund Certificate (USD 500k) ⭐"]
  },
  {
    id: "tr-SPE-016",officialCode: "TR-SPE-016",name: "Long Term Residence Extension Extension Long Term Residence 8Y Extension Long Term Residence TR",fee: "USD 80 Residence long term extension 8Y + Card 110 Long term residence extension TR",validity: "Indefinite Status",stay: "Permanent",processing: "4 Weeks",purpose: "Renewal / card replacement for Long-Term Residence permit holders",eligibility: "Long term residence card holders",officialSource: "https://e-ikamet.goc.gov.tr",categoryCode: "pr",record_type: "STATUS_DOCUMENT",docs: ["e-Devlet Address Certificate & Updated Card Application ⭐"]
  },
  {
    id: "tr-SPE-017",officialCode: "TR-SPE-017",name: "Citizenship - Marriage 3Y Marriage Citizenship 3Y Marriage Citizenship TR",fee: "USD 1000 Marriage citizenship 3Y TR",validity: "Turkish Citizenship via Marriage",stay: "Lifetime Citizenship",processing: "6 to 12 Months",purpose: "Acquiring Turkish citizenship through 3 years continuous marriage to Turkish citizen",eligibility: "Spouses married to Turkish citizen for 3 years living in family unity",officialSource: "https://www.goc.gov.tr",categoryCode: "pr",record_type: "PR_VISA",docs: ["Proof of 3 Years Active Marriage to Turkish Citizen (Nüfus Dökümü) ⭐","Joint Family Interview & Clean Criminal Record ⭐"]
  },

  // SUPPORTING 15 + LEGACY 10 = 25 SUPPORTING/LEGACY - NOT COUNTED IN 79 LIVE
  {id:"tr-SUP-001",officialCode:"TR-SUP-001",name:"e-Visa Authority e-Visa evisa.gov.tr Authority Visa e-Visa",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["e-Visa = Official online electronic visa portal operated by Ministry of Foreign Affairs. Website: evisa.gov.tr"]},
  {id:"tr-SUP-002",officialCode:"TR-SUP-002",name:"e-Ikamet Authority e-Ikamet e-ikamet.goc.gov.tr Authority Residence e-Ikamet",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["e-Ikamet = Official online residence permit application portal operated by Göç İdaresi (Directorate General of Migration Management). Website: e-ikamet.goc.gov.tr"]},
  {id:"tr-SUP-003",officialCode:"TR-SUP-003",name:"MLSS Authority Ministry Labour Social Security Authority Work Permit MLSS",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["MLSS = Ministry of Labour and Social Security (ÇSGB) - Official authority for Turkish work permits (Çalışma İzni). Website: csgb.gov.tr"]},
  {id:"tr-SUP-004",officialCode:"TR-SUP-004",name:"DGMM Authority Directorate General Migration Management Authority Residence DGMM",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["DGMM = Göç İdaresi Başkanlığı (Directorate General of Migration Management) - Authority governing residence permits and foreigner protection in Turkey."]},
  {id:"tr-SUP-005",officialCode:"TR-SUP-005",name:"MFA Authority Ministry Foreign Affairs Authority Visa MFA",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["MFA = Dışişleri Bakanlığı (Ministry of Foreign Affairs) - Governing consulates and entry visa rules. Website: mfa.gov.tr"]},
  {id:"tr-SUP-006",officialCode:"TR-SUP-006",name:"Tapu Authority Tapu Title Deed Authority Property Tapu",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Tapu = Official Title Deed registry certificate issued by Land Registry Directorate (Tapu ve Kadastro Genel Müdürlüğü)."]},
  {id:"tr-SUP-007",officialCode:"TR-SUP-007",name:"Turquoise Card Authority Turquoise Card Authority Work Permit Turquoise Card",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Turquoise Card (Turkuaz Kart) scheme authority under MLSS No. 6735."]},
  {id:"tr-SUP-008",officialCode:"TR-SUP-008",name:"Citizenship Authority Citizenship by Investment Authority PR Citizenship Investment",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Citizenship by Investment regulatory framework under Turkish Citizenship Law No. 5901."]},
  {id:"tr-SUP-009",officialCode:"TR-SUP-009",name:"Consulate Authority Turkish Consulate Authority Visa Consulate",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Turkish Diplomatic Missions and Consulates abroad."]},
  {id:"tr-SUP-010",officialCode:"TR-SUP-010",name:"Work Permit Authority Work Permit Authority Work Permit Work",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Work Permit (Çalışma İzni) regulations under Law No. 6735."]},
  {id:"tr-SUP-011",officialCode:"TR-SUP-011",name:"Residence Authority Residence Permit Authority Residence Residence",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Residence Permit (İkamet İzni) rules under Law No. 6458 on Foreigners and International Protection."]},
  {id:"tr-SUP-012",officialCode:"TR-SUP-012",name:"Long Term Authority Long Term Residence Authority PR Long Term",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Uzun Dönem İkamet İzni (Long-Term Residence Permit) regulations."]},
  {id:"tr-SUP-013",officialCode:"TR-SUP-013",name:"Student Authority Student Visa Authority Student Student",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Öğrenci İkamet İzni framework governed by YÖK and Göç İdaresi."]},
  {id:"tr-SUP-014",officialCode:"TR-SUP-014",name:"Family Authority Family Residence Authority Family Family",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Aile İkamet İzni framework under Law No. 6458."]},
  {id:"tr-SUP-015",officialCode:"TR-SUP-015",name:"Touristic Authority Touristic Residence Authority Tourist Touristic",fee:"-",validity:"-",categoryCode:"supporting",record_type:"SUPPORTING_CLASSIFICATION",docs:["Turistik Kısa Dönem İkamet İzni framework."]},
  {id:"tr-LEG-001",officialCode:"TR-LEG-001",name:"Legacy e-Visa Old System Closed Replaced by New e-Visa evisa.gov.tr",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Legacy e-visa portal replaced by current official evisa.gov.tr system."]},
  {id:"tr-LEG-002",officialCode:"TR-LEG-002",name:"Legacy Sticker Visa Old System Closed Replaced by New Sticker Visa Consulate",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former paper application process replaced by Consular Pre-Application Portal."]},
  {id:"tr-LEG-003",officialCode:"TR-LEG-003",name:"Legacy Work Permit Old System Closed Replaced by New Work Permit MLSS",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Legacy work permit system replaced by e-İzin MLSS portal."]},
  {id:"tr-LEG-004",officialCode:"TR-LEG-004",name:"Legacy Touristic Residence Old System Closed Replaced by New Touristic Residence e-Ikamet",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former paper residence applications replaced by e-Ikamet portal."]},
  {id:"tr-LEG-005",officialCode:"TR-LEG-005",name:"Legacy Business Residence Old System Closed Replaced by New Business Residence e-Ikamet",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Old business residence rules updated under e-Ikamet."]},
  {id:"tr-LEG-006",officialCode:"TR-LEG-006",name:"Legacy Student Residence Old System Closed Replaced by New Student Residence e-Ikamet",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Old student permit system integrated with YÖK e-Devlet data link."]},
  {id:"tr-LEG-007",officialCode:"TR-LEG-007",name:"Legacy Family Residence Old System Closed Replaced by New Family Residence e-Ikamet",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former family permit rules updated under Law No. 6458."]},
  {id:"tr-LEG-008",officialCode:"TR-LEG-008",name:"Legacy Turquoise Card Old System Closed Replaced by New Turquoise Card MLSS",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former Turquoise Card pilot regulations updated under Law No. 6735."]},
  {id:"tr-LEG-009",officialCode:"TR-LEG-009",name:"Legacy Long Term Residence Old System Closed Replaced by New Long Term Residence 8Y e-Ikamet",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Old permanent residence system replaced by 8-Year Uzun Dönem İkamet."]},
  {id:"tr-LEG-010",officialCode:"TR-LEG-010",name:"Legacy Citizenship by Investment Old System Closed Replaced by New Citizenship by Investment USD 400k",fee:"-",validity:"-",categoryCode:"supporting",record_type:"LEGACY_VISA",docs:["Former USD 1M property citizenship threshold reduced to USD 400k under current decree."]}
];

function processVisaList(items: VisaItem[]): VisaItem[] {
  return items.map(item => {
    const micro = getTurkeyMicroDetails(item.id, item.categoryCode || 'tourist', item.name);
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

const PROCESSED_TR = processVisaList(RAW_TR_VISAS);

export const TURKEY_79_VISAS: CountryVisas = {
  tourist: PROCESSED_TR.filter(v => v.categoryCode === 'tourist'),
  business: PROCESSED_TR.filter(v => v.categoryCode === 'business'),
  work: PROCESSED_TR.filter(v => v.categoryCode === 'work'),
  student: PROCESSED_TR.filter(v => v.categoryCode === 'student'),
  family: PROCESSED_TR.filter(v => v.categoryCode === 'family'),
  pr: PROCESSED_TR.filter(v => v.categoryCode === 'pr')
};
