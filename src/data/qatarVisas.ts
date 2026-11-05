import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getQatarMicroDetails(code: string, cat: string, name: string, rawFunds?: string, rawItr?: string, rawBank?: string) {
  let fundsMin = rawFunds || "Qatar Hayya Tourist Visa (A1/A2/A3) requires proof of min QAR 5,000 - QAR 15,000 liquid balance in personal bank statements for the last 3 months + confirmed hotel booking via Discover Qatar or Hayya portal + round-trip flight ticket + Qatar mandatory health insurance.";
  let fundsBankMonths = rawBank || "Last 3 months personal bank statements with min QAR 5,000 balance (sudden large deposit rejected ❌).";
  let fundsSudden = "❌ Sudden large cash deposits immediately before Hayya or Metrash2 submission are flagged and rejected.";
  let fundsEx = "✅ Sahi: Seasoned 3-month bank statement with QAR 5,000+ balance + Hayya hotel confirmation. ❌ Galat: Unexplained lump-sum deposit right before application.";

  let itrYears = rawItr || "ITR not mandatory for Hayya Tourist A1/A2/A3, but 3-month bank statement is strictly required.";
  let itrMatch = "Bank statement credits should reflect regular salary or business income.";
  let itrNoItr = "ITR not required for Hayya Qatar Tourist visa if 3 months bank statement with min QAR 5,000+ balance is provided.";

  let bankMonths = rawBank || "Last 3 months bank statements showing min QAR 5,000 (A1), QAR 10,000 (A2), or QAR 15,000 (A3).";
  let bankReg = "Regular salary credits or consistent business turnover.";
  let bankFd = "Liquid savings/checking account balance preferred for Hayya verification.";
  let bankSource = "Personal salary, business income, or verified GCC residency/sponsor.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('wrk')) {
    fundsMin = rawFunds || "Qatar Work Visa requires an official job offer and attested employment contract from a Qatar-registered employer (CR & Computer Card / Establishment ID) + Ministry of Labour & MOI Qatar approval (min salary QAR 1,000+ for private sector).";
    fundsBankMonths = "Employment contract attested by Ministry of Labour + Employer Commercial Registration (CR) & Computer Card.";
    fundsSudden = "Employer sponsorship (Kafala / MOI Qatar) covers work permit issuance; Medical & Fingerprint completed inside Qatar or via Qatar Visa Center (QVC).";
    fundsEx = "✅ Sahi: Attested employment contract + Employer CR & Computer Card + QVC medical/biometrics. ❌ Galat: Unattested degree or expired company computer card.";
  } else if (cat === 'student' || lowerCode.includes('stu')) {
    fundsMin = rawFunds || "Qatar Student Residence Visa requires an official admission letter from an accredited institution (Qatar University, Qatar Foundation Education City, Georgetown University in Qatar, etc.) + university QID sponsorship + financial sufficiency proof.";
    fundsBankMonths = "Sponsor or scholarship financial proof + attested academic certificates.";
    fundsSudden = "University acts as official sponsor via MOI Qatar student residence portal.";
    fundsEx = "✅ Sahi: Official Qatar University / Education City admission letter + attested transcripts + medical clearance. ❌ Galat: Unattested academic documents.";
  } else if (cat === 'family' || lowerCode.includes('fam')) {
    fundsMin = rawFunds || "Qatar Family Visit / Residence Visa (RP) requires Sponsor QID with minimum monthly salary of QAR 10,000 (or QAR 15,000+ for 6M multi-entry / 5Y long-term) + MOFA-attested marriage/birth certificates + municipality-attested housing contract.";
    fundsBankMonths = "Last 3-6 months Qatar bank statements showing salary credits of QAR 10,000+ per month.";
    fundsSudden = "Metrash2 verifies salary directly via Wage Protection System (WPS) and employer salary certificate.";
    fundsEx = "✅ Sahi: Sponsor QID + QAR 10,000+ WPS salary bank statement + MOFA-attested marriage certificate. ❌ Galat: Salary below QAR 10,000 threshold or unattested marriage certificate.";
  } else if (cat === 'business' || lowerCode.includes('biz') || (cat === 'business' && lowerCode.includes('tou'))) {
    fundsMin = rawFunds || "Qatar Business / Investor Visit Visa requires an official invitation letter from a Qatari host company with valid Commercial Registration (CR) & Computer Card, or proof of QAR 100,000+ investment capability.";
    fundsBankMonths = "Last 3-6 months corporate or personal bank statements.";
    fundsSudden = "Host company must hold active Establishment Card (QID/Computer Card) on Metrash2 / Hayya portal.";
    fundsEx = "✅ Sahi: Qatari company invitation + valid CR + foreign company cover letter. ❌ Galat: Host company with expired Commercial Registration.";
  } else if (cat === 'pr' || lowerCode.includes('pr')) {
    fundsMin = rawFunds || "Qatar Real Estate / Permanent Residency requires property purchase of min QAR 730,000 ($200,000 USD) for 5-Year Residency or QAR 3,650,000 ($1,000,000 USD) for 10-Year Premium Residency in designated freehold zones (The Pearl, Lusail, West Bay Lagoon), or QAR 1M business investment.";
    fundsBankMonths = "Official Title Deed from Ministry of Justice Qatar + bank transfer proof of property purchase or business capital.";
    fundsSudden = "Property must be located in Cabinet-approved freehold zones and free of disqualifying encumbrances.";
    fundsEx = "✅ Sahi: Ministry of Justice Title Deed for QAR 730k+ ($200k) or QAR 3.65M ($1M) in Lusail/The Pearl. ❌ Galat: Property outside designated foreign ownership zones.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

export interface RawQatarItem {
  id: string;
  officialCode: string;
  name: string;
  toCountry: string;
  fromCountry: string;
  category: string;
  record_type: string;
  fee: string;
  validity: string;
  docs: string;
  fundsBox?: string;
  itrBox?: string;
  bankBox?: string;
  warningBox?: string;
}

export const QA_66: RawQatarItem[] = [
  // TOURIST 11 - Hayya Platform Tourist Visas, VOA, GCC Resident, Transit & Cruise Qatar
  {
    id: "qa-TOU-001",
    officialCode: "QA-TOU-001",
    name: "Qatar Tourist Visa A1 30 Days Single Entry Hayya Tourist Visa A1 30D Single - Most common Tourist Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "QAR 100 Tourist Visa A1 30D Single Hayya Qatar",
    validity: "30 Days Single Entry Tourist Visa A1 30D Single Hayya Qatar",
    docs: "Passport 6M validity 1 blank page + Photo white background 38x48mm Qatar + Return flight booking + Hotel Hayya approved + Hayya platform registration + Qatar insurance + Tourist A1 application Hayya platform metrash",
    fundsBox: "Bank statement 3M QAR 5000/day Tourist Visa A1 Hayya Qatar - min QAR 5000 balance = Hayya Qatar Tourist",
    itrBox: "ITR not required Hayya Qatar Tourist but bank 3M required = Hayya Qatar Tourist A1",
    bankBox: "Bank 3M last 3 months min QAR 5000 Hayya Qatar Tourist A1 - sudden large deposit reject ❌",
    warningBox: "✅ Most common tourist Qatar Hayya Tourist A1 30D Single - Hayya platform - indianapply via Hayya"
  },
  {
    id: "qa-TOU-002",
    officialCode: "QA-TOU-002",
    name: "Qatar Tourist Visa A2 60 Days Single Entry Hayya Tourist A2 60D Single Tourist Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "QAR 200 Tourist Visa A2 60D Single Hayya Qatar",
    validity: "60 Days Single Entry Tourist A2 60D Single Hayya Qatar",
    docs: "Passport 6M + Photo + Return flight + Hotel Hayya + Hayya registration + Insurance + Bank 3M QAR 10000 + Tourist A2 Hayya metrash",
    fundsBox: "Bank 3M QAR 10000 Tourist A2 Hayya Qatar"
  },
  {
    id: "qa-TOU-003",
    officialCode: "QA-TOU-003",
    name: "Qatar Tourist Visa A3 90 Days Single Entry Hayya Tourist A3 90D Single Tourist Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "QAR 300 Tourist A3 90D Single Hayya Qatar",
    validity: "90 Days Single Entry Tourist A3 90D Single Hayya Qatar",
    docs: "Passport 6M + Photo + Return flight + Hotel 90D + Hayya registration + Insurance 90D + Bank 3M QAR 15000 + Tourist A3 Hayya"
  },
  {
    id: "qa-TOU-004",
    officialCode: "QA-TOU-004",
    name: "Qatar Visa on Arrival 30 Days Tourist Visa on Arrival 30D Tourist Qatar - 95 countries eligible",
    toCountry: "qa",
    fromCountry: "us",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "QAR 100 VOA 30D Tourist Qatar VOA",
    validity: "30 Days VOA Tourist Qatar Visa on Arrival",
    docs: "Passport 6M + Return flight + Hotel + VOA eligible nationality + Qatar insurance VOA + Visa on Arrival Qatar Hamad airport",
    warningBox: "✅ Most common tourist Qatar VOA 30D - 95 countries including US UK EU AU CA - Free for India? No VOA India need Hayya"
  },
  {
    id: "qa-TOU-005",
    officialCode: "QA-TOU-005",
    name: "Qatar Visa on Arrival 90 Days Tourist Visa on Arrival 90D Tourist Qatar GCC eligible",
    toCountry: "qa",
    fromCountry: "us",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "Free VOA 90D Tourist Qatar GCC countries",
    validity: "90 Days VOA Tourist Qatar GCC",
    docs: "Passport 6M + VOA eligible + Hotel + Return flight + VOA 90D Qatar Hamad"
  },
  {
    id: "qa-TOU-006",
    officialCode: "QA-TOU-006",
    name: "Qatar GCC Resident Tourist Visa 30 Days GCC Resident Tourist 30D Tourist Qatar",
    toCountry: "qa",
    fromCountry: "ae",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "QAR 100 GCC Resident Tourist 30D Qatar",
    validity: "30 Days GCC Resident Tourist 30D Qatar",
    docs: "GCC residence permit valid 3M + Passport 6M + Profession eligible GCC + Return flight + Hotel + GCC Resident Tourist Hayya Qatar",
    fundsBox: "GCC residence valid 3M + Profession Manager Engineer Doctor GCC Resident Tourist Qatar"
  },
  {
    id: "qa-TOU-007",
    officialCode: "QA-TOU-007",
    name: "Qatar GCC Resident Tourist Visa 90 Days GCC Resident Tourist 90D Tourist Qatar",
    toCountry: "qa",
    fromCountry: "ae",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "QAR 200 GCC Resident Tourist 90D Qatar",
    validity: "90 Days GCC Resident Tourist 90D Qatar",
    docs: "GCC residence 6M + Passport 6M + Profession eligible + Return flight + Hotel + GCC Resident Tourist 90D Hayya"
  },
  {
    id: "qa-TOU-008",
    officialCode: "QA-TOU-008",
    name: "Qatar Transit Visa 96 Hours Transit Visa 96H 4 Days Transit Qatar Hamad",
    toCountry: "qa",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "Free Transit 96H Qatar Airways transit",
    validity: "96 Hours Transit 96H Transit Qatar",
    docs: "Qatar Airways ticket + Onward ticket 96H + Passport 6M + Transit 96H Hayya Qatar Airways + Hotel Discover Qatar free if layover 8H+ + Transit Qatar"
  },
  {
    id: "qa-TOU-009",
    officialCode: "QA-TOU-009",
    name: "Qatar Hayya with ETicket Hayya Entry Permit ETicket Hayya ETicket Tourist Qatar World Cup legacy",
    toCountry: "qa",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "Free Hayya ETicket Entry Permit Tourist Qatar",
    validity: "30 Days Hayya ETicket Entry Tourist Qatar",
    docs: "Hayya card + Event ticket + Passport + Photo + Hayya ETicket Hayya platform"
  },
  {
    id: "qa-TOU-010",
    officialCode: "QA-TOU-010",
    name: "Qatar Hayya Companion Tourist Hayya Companion Tourist 30D Hayya Companion Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "QAR 100 Hayya Companion Tourist 30D Qatar",
    validity: "30 Days Hayya Companion Tourist Qatar",
    docs: "Hayya primary holder + Companion proof + Passport + Photo + Hayya Companion Hayya platform"
  },
  {
    id: "qa-TOU-016",
    officialCode: "QA-TOU-016",
    name: "Qatar Hayya A3 Visa with US UK Schengen Visa Notification (ETA) 30 Days Tourist Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "tourist",
    record_type: "TOURIST_VISA",
    fee: "QAR 100 Hayya A3 Electronic Travel Authorization Qatar",
    validity: "30 Days Single/Multiple Entry Hayya A3 ETA Qatar",
    docs: "Valid US, UK, Schengen, Australia, Canada or New Zealand visa/residence + Passport 6M + Return flight + Hotel booking + Hayya A3 ETA application + Mandatory MOPH health insurance QAR 50"
  },

  // BUSINESS 5 - Qatar Business, Investor, Official & Conference Visas
  {
    id: "qa-TOU-011",
    officialCode: "QA-TOU-011",
    name: "Qatar Business Visit Visa 30 Days Business Visit 30D Business Qatar Hayya",
    toCountry: "qa",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "QAR 200 Business Visit 30D Business Qatar Hayya",
    validity: "30 Days Business Visit 30D Business Qatar",
    docs: "Qatar company invitation letter + Company registration Qatar + Commercial registration Qatar + Foreign company letter + Business card + Chamber of commerce + Business visit Hayya metrash + Bank + Company invitation"
  },
  {
    id: "qa-TOU-012",
    officialCode: "QA-TOU-012",
    name: "Qatar Business Visit Visa 90 Days Business Visit 90D Business Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "QAR 300 Business Visit 90D Business Qatar",
    validity: "90 Days Business Visit 90D Business Qatar",
    docs: "Qatar company invitation 90D + CR Qatar + Foreign company letter 90D + Business proof + Business visit 90D Hayya"
  },
  {
    id: "qa-TOU-013",
    officialCode: "QA-TOU-013",
    name: "Qatar Investor Business Visa 90 Days Investor Business 90D Business Qatar Investment",
    toCountry: "qa",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "QAR 500 Investor Business 90D Qatar",
    validity: "90 Days Investor Business 90D Business Qatar",
    docs: "Investment proof Qatar + Business plan + Company registration intent + Bank QAR 100k + Investor business Hayya"
  },
  {
    id: "qa-TOU-014",
    officialCode: "QA-TOU-014",
    name: "Qatar Official Visit Visa 30 Days Official Visit 30D Official Qatar Government",
    toCountry: "qa",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "Free Official Visit 30D Official Qatar",
    validity: "30 Days Official Visit 30D Official Qatar",
    docs: "Government invitation Qatar + Official letter + Passport + Photo + Official visit MOI Qatar"
  },
  {
    id: "qa-TOU-015",
    officialCode: "QA-TOU-015",
    name: "Qatar Conference Event Visa 30 Days Conference Event 30D Business Qatar Conference",
    toCountry: "qa",
    fromCountry: "in",
    category: "business",
    record_type: "BUSINESS_VISA",
    fee: "QAR 200 Conference Event 30D Business Qatar",
    validity: "30 Days Conference Event 30D Business Qatar",
    docs: "Conference invitation Qatar + Event registration + Organizer letter + Passport + Conference Hayya"
  },

  // WORK 20 - Qatar Work Permits & Employment Visas
  {
    id: "qa-WRK-001",
    officialCode: "QA-WRK-001",
    name: "Qatar Work Visa Private Sector 1Y Work Visa Private Sector 1Y Work Qatar - Most common Work Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 300 Work Private Sector 1Y Work Qatar",
    validity: "1 Year Work Private Sector 1Y Work Qatar",
    docs: "Job offer Qatar private + Employment contract Qatar attested + Employer QID + Company CR Qatar + Company computer card + Academic certificate attested + Medical Qatar inside + Fingerprint MOI Qatar + Work visa private sector MOI Qatar",
    fundsBox: "Salary min QAR 1000 Work Private Sector 1Y Qatar",
    warningBox: "✅ Most common work Qatar Work Private Sector 1Y - Employer sponsorship Kafala - NOC needed to change job"
  },
  {
    id: "qa-WRK-002",
    officialCode: "QA-WRK-002",
    name: "Qatar Work Visa Government Sector 1Y Work Visa Government Sector 1Y Work Qatar Government",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 300 Work Government Sector 1Y Work Qatar",
    validity: "1 Year Work Government Sector 1Y Work Qatar Government",
    docs: "Government job offer Qatar + Government employment contract + Ministry approval + Academic attested + Medical + Work government sector MOI Qatar"
  },
  {
    id: "qa-WRK-003",
    officialCode: "QA-WRK-003",
    name: "Qatar Work Visa Domestic Worker 1Y Work Visa Domestic Worker 1Y Work Qatar Housemaid Driver",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 300 Work Domestic Worker 1Y Work Qatar",
    validity: "1 Year Work Domestic Worker 1Y Work Qatar",
    docs: "Sponsor QID + Household approval + Domestic worker contract + Medical + Domestic worker MOI Qatar"
  },
  {
    id: "qa-WRK-004",
    officialCode: "QA-WRK-004",
    name: "Qatar Freelance Work Permit 1Y Freelance Work Permit 1Y Work Qatar Freelance",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 1500 Freelance Work Permit 1Y Work Qatar",
    validity: "1 Year Freelance Work Permit 1Y Work Qatar Freelance",
    docs: "Freelance license Qatar + Profession freelance + Bank QAR 20000 + Freelance permit Ministry Labour Qatar + Medical"
  },
  {
    id: "qa-WRK-005",
    officialCode: "QA-WRK-005",
    name: "Qatar Investor Work Permit 5Y Investor Work Permit 5Y Work Qatar Investor Residence",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 1000 Investor Work Permit 5Y Work Qatar",
    validity: "5 Years Investor Work Permit 5Y Work Qatar Investor",
    docs: "Company share 10% + Investment QAR 200k + CR Qatar + Investor work permit MOI + Medical"
  },
  {
    id: "qa-WRK-006",
    officialCode: "QA-WRK-006",
    name: "Qatar Real Estate Owner Work Permit 5Y Real Estate Owner Work Permit 5Y Work Qatar Property",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 1000 Real Estate Owner Work Permit 5Y Qatar",
    validity: "5 Years Real Estate Owner Work Permit 5Y Qatar Property",
    docs: "Property value QAR 730k + Title deed + Property approved area Qatar + Real estate owner work permit MOI Qatar"
  },
  {
    id: "qa-WRK-007",
    officialCode: "QA-WRK-007",
    name: "Qatar Skilled Worker Permit 2Y Skilled Worker Permit 2Y Work Qatar Skilled",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 500 Skilled Worker Permit 2Y Work Qatar",
    validity: "2 Years Skilled Worker Permit 2Y Work Qatar Skilled",
    docs: "Degree attested + 2Y experience + Job offer skilled + Skilled worker permit Qatar Ministry of Labour"
  },
  {
    id: "qa-WRK-008",
    officialCode: "QA-WRK-008",
    name: "Qatar Temporary Work Visa 6M Temporary Work Visa 6M Work Qatar Project",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 300 Temporary Work Visa 6M Work Qatar",
    validity: "6 Months Temporary Work Visa 6M Work Qatar Project",
    docs: "Project contract Qatar + Temporary work approval + Company CR + Temporary work MOI Qatar"
  },
  {
    id: "qa-WRK-009",
    officialCode: "QA-WRK-009",
    name: "Qatar Multiple Entry Work Visa 1Y Multiple Entry Work Visa 1Y Work Qatar Multiple",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 500 Multiple Entry Work Visa 1Y Work Qatar",
    validity: "1 Year Multiple Entry Work Visa 1Y Work Qatar Multiple",
    docs: "Company request multiple entry + CR Qatar + Work multiple entry MOI Qatar"
  },
  {
    id: "qa-WRK-010",
    officialCode: "QA-WRK-010",
    name: "Qatar IT Worker Permit 2Y IT Worker Permit 2Y Work Qatar IT",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 500 IT Worker Permit 2Y Work Qatar IT",
    validity: "2 Years IT Worker Permit 2Y Work Qatar IT",
    docs: "IT degree + Job offer IT Qatar + Company IT + IT worker permit Qatar"
  },
  {
    id: "qa-WRK-011",
    officialCode: "QA-WRK-011",
    name: "Qatar Healthcare & Medical Practitioner Work Visa 2Y (MOPH / DHP License) Work Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 500 Healthcare Medical Work Visa 2Y Qatar",
    validity: "2 Years Healthcare Medical Work Visa Qatar",
    docs: "MOPH DHP DataFlow verification + Prometric exam pass + Hospital/Clinic job offer Qatar + Attested medical/nursing degree + Good standing certificate + MOI Qatar work visa"
  },
  {
    id: "qa-WRK-012",
    officialCode: "QA-WRK-012",
    name: "Qatar Financial Centre (QFC) Sponsored Work & Residence Permit 2Y Work Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 1000 QFC Work & Residence Permit 2Y Qatar",
    validity: "2 Years QFC Sponsored Work Permit Qatar",
    docs: "QFC licensed firm employment contract + QFC Authority Immigration Office approval + Attested university degree + Police clearance certificate + Medical & QID biometrics"
  },
  {
    id: "qa-WRK-013",
    officialCode: "QA-WRK-013",
    name: "Qatar Science & Technology Park (QSTP) Free Zone Tech Work Visa 2Y Work Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 500 QSTP Free Zone Tech Work Visa 2Y Qatar",
    validity: "2 Years QSTP Free Zone Work Permit Qatar",
    docs: "QSTP Free Zone entity employment contract + QSTP portal sponsorship approval + Attested STEM degree + Passport 6M + Medical & fingerprint MOI Qatar"
  },
  {
    id: "qa-WRK-014",
    officialCode: "QA-WRK-014",
    name: "Qatar Energy, Oil & Gas Sector Specialized Engineer Work Visa 2Y Work Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 500 Energy Oil & Gas Work Visa 2Y Qatar",
    validity: "2 Years Oil & Gas Sector Work Permit Qatar",
    docs: "QatarEnergy / Ras Laffan / Mesaieed contractor job offer + MMUP/MME UPDA engineering registration + Attested engineering degree + Gate pass security clearance + MOI work visa"
  },
  {
    id: "qa-WRK-015",
    officialCode: "QA-WRK-015",
    name: "Qatar MMUP / UPDA Registered Engineer Work Residence Permit 2Y Work Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 500 MMUP UPDA Engineer Work Permit 2Y Qatar",
    validity: "2 Years MMUP Engineer Work Permit Qatar",
    docs: "MOFA attested Bachelor of Engineering degree + University transcripts + PCC attested + MMUP/UPDA Engineers Committee enrollment + Employer CR & Computer Card"
  },
  {
    id: "qa-WRK-016",
    officialCode: "QA-WRK-016",
    name: "Qatar Aviation & Cabin Crew Work Residence Visa 2Y (Qatar Airways / QCAA) Work Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 300 Aviation & Cabin Crew Work Visa 2Y Qatar",
    validity: "2 Years Aviation Crew Work Permit Qatar",
    docs: "Qatar Airways / Hamad Airport employment contract + QCAA aviation medical & security clearance + Passport valid 6M+ + Attested education credentials + MOI Qatar QID"
  },
  {
    id: "qa-WRK-017",
    officialCode: "QA-WRK-017",
    name: "Qatar Seafarer & Maritime Offshore Crew Work Visa 1Y Work Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 300 Seafarer Maritime Crew Work Visa 1Y Qatar",
    validity: "1 Year Seafarer & Offshore Crew Visa Qatar",
    docs: "Seaman Book (CDC) + STCW maritime certificates + Shipping agent letter in Qatar + Vessel crew list + Mwani Qatar port clearance + MOI maritime work visa"
  },
  {
    id: "qa-WRK-018",
    officialCode: "QA-WRK-018",
    name: "Qatar Hospitality, Tourism & Hotel Sector Work Visa 2Y Work Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 300 Hospitality & Hotel Sector Work Visa 2Y Qatar",
    validity: "2 Years Hospitality Work Visa Qatar",
    docs: "Qatar Tourism licensed hotel employment offer + Qatar Visa Center (QVC) medical & biometrics + Food handler health certificate (if applicable) + Employer CR + MOI work permit"
  },
  {
    id: "qa-WRK-019",
    officialCode: "QA-WRK-019",
    name: "Qatar Local Employer Change / Sponsorship Transfer Work Permit (MOL Electronic Notification) Work Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "QAR 1000 Employer Transfer Work Permit Qatar",
    validity: "1 - 2 Years Transferred Work Residence Permit Qatar",
    docs: "Current valid QID + Ministry of Labour (ADLSA/MOL) online employer change request + Notice period completion (1-2 months) + New employer CR & Computer Card + New e-Contract"
  },
  {
    id: "qa-WRK-020",
    officialCode: "QA-WRK-020",
    name: "Qatar Diplomatic, Embassy & International Organization Staff Work Visa 2Y Work Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "work",
    record_type: "WORK_VISA",
    fee: "Free Diplomatic & International Mission Work Visa Qatar",
    validity: "2 Years Diplomatic / Mission Assignment Qatar",
    docs: "Note Verbale from sending Ministry of Foreign Affairs + MOFA Qatar Protocol Department accreditation + Diplomatic/Official or Regular Passport + Mission employment letter"
  },

  // FAMILY 12 - Qatar Family Visit & Family Residence Permits (RP)
  {
    id: "qa-FAM-001",
    officialCode: "QA-FAM-001",
    name: "Qatar Family Visit Visa 1M Family Visit Visa 1M Family Qatar - Most common Family Visit Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "QAR 200 Family Visit Visa 1M Family Qatar",
    validity: "1 Month Family Visit Visa 1M Family Qatar",
    docs: "Sponsor QID Qatar + Salary certificate QAR 10000+ + Relationship proof attested + Marriage certificate attested + Birth certificate attested + Accommodation proof Qatar + Family visit visa 1M MOI Qatar metrash",
    fundsBox: "Sponsor salary min QAR 10000 Family Visit Visa 1M Qatar - QAR 5000 some cases",
    warningBox: "✅ Most common family visit Qatar Family Visit 1M - Sponsor salary QAR 10k - Metrash2 apply"
  },
  {
    id: "qa-FAM-002",
    officialCode: "QA-FAM-002",
    name: "Qatar Family Visit Visa 6M Family Visit Visa 6M Family Qatar Multiple",
    toCountry: "qa",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "QAR 500 Family Visit Visa 6M Family Qatar",
    validity: "6 Months Family Visit Visa 6M Family Qatar Multiple",
    docs: "Sponsor QID + Salary QAR 15000+ + Relationship attested + Marriage attested + Birth attested + Family visit 6M MOI Qatar"
  },
  {
    id: "qa-FAM-003",
    officialCode: "QA-FAM-003",
    name: "Qatar Family Residence Visa 1Y Family Residence Visa 1Y Family Qatar - Family RP",
    toCountry: "qa",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "QAR 500 Family Residence Visa 1Y Family Qatar",
    validity: "1 Year Family Residence Visa 1Y Family Qatar RP",
    docs: "Sponsor QID + Salary QAR 10000+ + Marriage certificate attested MOFA + Birth certificate attested + Medical family + Fingerprint family + Family residence RP MOI Qatar"
  },
  {
    id: "qa-FAM-004",
    officialCode: "QA-FAM-004",
    name: "Qatar Family Residence Visa 5Y Family Residence Visa 5Y Family Qatar Long term",
    toCountry: "qa",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "QAR 1000 Family Residence Visa 5Y Family Qatar",
    validity: "5 Years Family Residence Visa 5Y Family Qatar",
    docs: "Sponsor QID + Salary QAR 15000+ + Relationship attested + Long term family residence + Medical + Family residence 5Y MOI Qatar"
  },
  {
    id: "qa-FAM-005",
    officialCode: "QA-FAM-005",
    name: "Qatar Newborn Residence Visa Newborn Residence Visa Family Qatar Newborn",
    toCountry: "qa",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "QAR 500 Newborn Residence Visa Family Qatar Newborn",
    validity: "1 Year Newborn Residence Visa Family Qatar Newborn",
    docs: "Birth certificate Qatar + Parents QID + Marriage attested + Passport newborn + Newborn residence MOI Qatar"
  },
  {
    id: "qa-FAM-006",
    officialCode: "QA-FAM-006",
    name: "Qatar Wife Residence Visa 1Y Wife Residence Visa 1Y Family Qatar Wife RP",
    toCountry: "qa",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "QAR 500 Wife Residence Visa 1Y Family Qatar",
    validity: "1 Year Wife Residence Visa 1Y Family Qatar Wife",
    docs: "Sponsor QID husband + Salary QAR 10000+ + Marriage certificate attested MOFA Qatar + Wife passport + Medical wife + Wife residence MOI Qatar"
  },
  {
    id: "qa-FAM-007",
    officialCode: "QA-FAM-007",
    name: "Qatar Dependent Child Residence Permit (Sons Under 25 & Unmarried Daughters) 1Y Family Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "QAR 500 Dependent Child Residence Permit 1Y Qatar",
    validity: "1 - 3 Years Dependent Child RP Qatar",
    docs: "Sponsor QID + Attested birth certificate MOFA Qatar + Sponsor 6M WPS bank statement (QAR 10,000+) + Municipality attested family housing contract + Child passport & photos"
  },
  {
    id: "qa-FAM-008",
    officialCode: "QA-FAM-008",
    name: "Qatar Parents & Elderly Relatives Extended Family Visit Visa (1M Extendable to 6M) Family Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "QAR 200 initial + QAR 200/month extension Parents Visit Visa Qatar",
    validity: "1 Month extendable up to 6 Months Parents Visit Qatar",
    docs: "Sponsor QID + Birth certificate showing parent names + Sponsor salary certificate QAR 10,000+ + Medical test in Qatar for extension beyond 30 days + Return ticket + Metrash2 application"
  },
  {
    id: "qa-FAM-009",
    officialCode: "QA-FAM-009",
    name: "Qatar In-Laws & Second-Degree Relative Family Visit Visa 1MExtendable Family Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "QAR 200 In-Laws Family Visit Visa 1M Qatar",
    validity: "1 Month extendable up to 3 - 6 Months Qatar",
    docs: "Sponsor QID + Spouse QID or marriage certificate + Spouse birth certificate proving relationship to in-laws + Sponsor salary QAR 10,000+ + Metrash2 family visit application"
  },
  {
    id: "qa-FAM-010",
    officialCode: "QA-FAM-010",
    name: "Qatar Real Estate Owner & Investor Dependent Family Residence Permit 5Y Family Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "QAR 1000 Investor Family Residence Permit 5Y Qatar",
    validity: "5 Years Renewable Investor Family RP Qatar",
    docs: "Primary investor/property owner 5Y QID + Title deed (QAR 730k+) or Commercial Registration + MOFA attested marriage & birth certificates + Medical & fingerprint MOI Qatar"
  },
  {
    id: "qa-FAM-011",
    officialCode: "QA-FAM-011",
    name: "Qatar Family Sponsored Working Permission (Spouse/Daughter Transfer to Work under Family RP) Family Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "QAR 500 Family Sponsorship Work Permission Card Qatar",
    validity: "Matches Family Residence Permit (1 - 3 Years) Qatar",
    docs: "Valid Family Residence QID + Sponsor NOC on Metrash2 + Job offer & attested employment contract from Qatar company + Ministry of Labour work card approval while retaining Family RP"
  },
  {
    id: "qa-FAM-012",
    officialCode: "QA-FAM-012",
    name: "Qatar Foreign Spouse & Children of Qatari Citizen Residence Permit 5Y Family Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "family",
    record_type: "FAMILY_VISA",
    fee: "QAR 500 Qatari Citizen Spouse/Child Residence Permit Qatar",
    validity: "5 Years Renewable Family Residence Qatar",
    docs: "Qatari Citizen ID + Official Qatari Marriage Committee approval & marriage certificate + Applicant passport + Medical & PCC clearance + MOI Qatar Permanent Family Committee approval"
  },

  // STUDENT 8 - Qatar University, Education City, Language & Research Visas
  {
    id: "qa-STU-001",
    officialCode: "QA-STU-001",
    name: "Qatar Student Visa 1Y Student Visa 1Y Student Qatar - Most common Student Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "QAR 300 Student Visa 1Y Student Qatar",
    validity: "1 Year Student Visa 1Y Student Qatar",
    docs: "Admission letter Qatar University + University QID sponsor + Academic certificate attested + Medical student + Student visa MOI Qatar University sponsor",
    warningBox: "✅ Most common student Qatar Student Visa 1Y - Qatar University, Education City, Georgetown University, etc sponsor"
  },
  {
    id: "qa-STU-002",
    officialCode: "QA-STU-002",
    name: "Qatar Student Language Course Visa 6M Student Language Course Visa 6M Student Qatar Language",
    toCountry: "qa",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "QAR 300 Student Language Course 6M Student Qatar",
    validity: "6 Months Student Language Course 6M Student Qatar Language",
    docs: "Language institute admission Qatar + Language course proof + Student language visa MOI Qatar"
  },
  {
    id: "qa-STU-003",
    officialCode: "QA-STU-003",
    name: "Qatar Research Student Visa 1Y Research Student Visa 1Y Student Qatar Research",
    toCountry: "qa",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "QAR 300 Research Student Visa 1Y Student Qatar",
    validity: "1 Year Research Student Visa 1Y Student Qatar Research",
    docs: "Research proposal Qatar + University admission research + Research student visa MOI Qatar"
  },
  {
    id: "qa-STU-004",
    officialCode: "QA-STU-004",
    name: "Qatar Foundation (Education City Partner Universities) Full-Time Degree Student Visa 1Y-4Y Student Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "QAR 300 Education City Student Residence Permit Qatar",
    validity: "1 Year Renewable for 4-Year Degree Duration Qatar",
    docs: "Official admission from QF Partner University (CMU-Q, Weill Cornell, Georgetown, Northwestern, Texas A&M, HBKU, VCUarts) + QF Immigration Sponsorship Letter + Attested transcripts + Medical & QID"
  },
  {
    id: "qa-STU-005",
    officialCode: "QA-STU-005",
    name: "Qatar Government & Amiri Scholarship International Student Visa 1Y Student Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "Free (Covered by Scholarship) Student Residence Permit Qatar",
    validity: "1 Year Renewable for Scholarship Duration Qatar",
    docs: "Official Qatar Scholarship / Amiri Scholarship Award Letter + Ministry of Education & Higher Education endorsement + Attested high school/bachelor certificates + Medical clearance"
  },
  {
    id: "qa-STU-006",
    officialCode: "QA-STU-006",
    name: "Qatar University Exchange & Study Abroad Semester Visa 6M Student Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "QAR 300 Study Abroad Exchange Student Visa 6M Qatar",
    validity: "6 Months Single/Multiple Entry Exchange Student Qatar",
    docs: "Inter-university exchange nomination letter + Host university in Qatar acceptance + Home university enrollment proof + Health insurance + Bank statement 3M"
  },
  {
    id: "qa-STU-007",
    officialCode: "QA-STU-007",
    name: "Qatar Postgraduate Master & Doctoral (PhD) Student Residence Permit 1Y Student Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "QAR 300 Postgraduate Master/PhD Student RP Qatar",
    validity: "1 Year Renewable (2 - 4 Years Program) Qatar",
    docs: "Graduate admission letter (Hamad Bin Khalifa University / Qatar University / Doha Institute) + MOFA attested Bachelor/Master degree + Police Clearance Certificate + Medical & QID"
  },
  {
    id: "qa-STU-008",
    officialCode: "QA-STU-008",
    name: "Qatar Medical Residency, Clinical Elective & Academic Internship Student Visa 6M-1Y Student Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "student",
    record_type: "STUDENT_VISA",
    fee: "QAR 300 Clinical Elective & Medical Internship Visa Qatar",
    validity: "6 Months to 1 Year Clinical Training Qatar",
    docs: "Hamad Medical Corporation (HMC) / Sidra Medicine / Weill Cornell Medicine-Qatar training offer + Medical school dean letter + Immunization & medical fitness report + MOI student/trainee permit"
  },

  // PR INVESTMENT 10 - Qatar Permanent Residency, Real Estate & Talent Residency
  {
    id: "qa-PR-001",
    officialCode: "QA-PR-001",
    name: "Qatar Real Estate Investor Residence 5Y Real Estate Investor Residence 5Y PR Qatar Property Investor - QAR 730k",
    toCountry: "qa",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "QAR 1000 Real Estate Investor Residence 5Y PR Qatar Property QAR 730k",
    validity: "5 Years Real Estate Investor Residence 5Y PR Qatar Property Investor",
    docs: "Property value min QAR 730000 = $200k + Title deed Ministry Justice Qatar + Property in approved zone Lusail Pearl West Bay + Property investor residence MOI Qatar + Medical + Real Estate Investor Residence 5Y",
    fundsBox: "Property QAR 730k min = $200k Real Estate Investor Residence 5Y PR Qatar - Approved zones: Pearl, Lusail, West Bay Lagoon, Al Khor",
    warningBox: "✅ Most common investment Qatar Real Estate Investor Residence 5Y QAR 730k - Includes family - Free schools healthcare - No visa needed"
  },
  {
    id: "qa-PR-002",
    officialCode: "QA-PR-002",
    name: "Qatar Real Estate Investor Residence 10Y Real Estate Investor Residence 10Y PR Qatar Premium Property - QAR 3.65M",
    toCountry: "qa",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "QAR 2000 Real Estate Investor Residence 10Y PR Qatar Premium QAR 3.65M",
    validity: "10 Years Real Estate Investor Residence 10Y PR Qatar Premium Property",
    docs: "Property value min QAR 3650000 = $1M + Title deed + Premium property zone + Real Estate Investor Residence 10Y MOI Qatar Premium"
  },
  {
    id: "qa-PR-003",
    officialCode: "QA-PR-003",
    name: "Qatar Investor Residence 5Y Investor Residence 5Y PR Qatar Business Investor - QAR 1M Investment",
    toCountry: "qa",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "QAR 1000 Investor Residence 5Y PR Qatar Business QAR 1M",
    validity: "5 Years Investor Residence 5Y PR Qatar Business Investor",
    docs: "Company investment QAR 1M + CR Qatar + Company share 100% + Commercial registration + Investor residence 5Y MOI Qatar + Bank QAR 1M + Investor Residence 5Y Business"
  },
  {
    id: "qa-PR-004",
    officialCode: "QA-PR-004",
    name: "Qatar Permanent Residency PR 20Y Qatar Permanent Residency PR 20Y PR Qatar PR Card",
    toCountry: "qa",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "QAR 3000 Permanent Residency PR 20Y PR Qatar PR Card",
    validity: "20 Years Permanent Residency PR 20Y PR Qatar PR Card",
    docs: "Residence 20Y Qatar + Arabic + Good conduct + Permanent Residency PR 20Y Ministry Interior Qatar - Limited 100 per year + Permanent Residency PR Qatar PR Card",
    warningBox: "Qatar PR 20Y - Very limited - 100 per year only - 20 years residence + Born in Qatar or 10Y special + PR Card benefits"
  },
  {
    id: "qa-PR-005",
    officialCode: "QA-PR-005",
    name: "Qatar Mustaqel Freelance Residence 5Y Mustaqel Freelance Residence 5Y PR Qatar Freelance Investor",
    toCountry: "qa",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "QAR 1500 Mustaqel Freelance Residence 5Y PR Qatar Freelance",
    validity: "5 Years Mustaqel Freelance Residence 5Y PR Qatar Freelance Investor",
    docs: "Mustaqel license Qatar + Freelance talent proof + Bank QAR 50000 + Mustaqel freelance residence MOI Qatar"
  },
  {
    id: "qa-PR-006",
    officialCode: "QA-PR-006",
    name: "Qatar Retirement Residence 5Y Retirement Residence 5Y PR Qatar Retirement Investor",
    toCountry: "qa",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "QAR 1000 Retirement Residence 5Y PR Qatar Retirement",
    validity: "5 Years Retirement Residence 5Y PR Qatar Retirement",
    docs: "Age 55+ + Property QAR 730k or Income QAR 15000/month + Retirement proof + Retirement residence MOI Qatar + Medical + Retirement Residence 5Y"
  },
  {
    id: "qa-PR-007",
    officialCode: "QA-PR-007",
    name: "Qatar Talent Residence 5Y Talent Residence 5Y PR Qatar Talent - Sports Arts Science",
    toCountry: "qa",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "QAR 1000 Talent Residence 5Y PR Qatar Talent",
    validity: "5 Years Talent Residence 5Y PR Qatar Talent",
    docs: "Talent proof Qatar + Ministry Culture Sports approval + Talent residence MOI Qatar + Medical + Talent Residence 5Y"
  },
  {
    id: "qa-PR-008",
    officialCode: "QA-PR-008",
    name: "Qatar Free Zones Authority (QFZA - Ras Bufontas & Umm Alhoul) Investor Residence 5Y PR Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "QAR 1500 QFZA Free Zone Investor Residence 5Y Qatar",
    validity: "5 Years Renewable QFZA Investor Residence Qatar",
    docs: "QFZA Free Zone Company License + Ras Bufontas or Umm Alhoul lease agreement + Share capital certificate + Police clearance certificate + Medical & MOI Qatar Investor QID"
  },
  {
    id: "qa-PR-009",
    officialCode: "QA-PR-009",
    name: "Qatar Financial Centre (QFC) Tech Startup & Entrepreneur Residence 5Y PR Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "QAR 1500 QFC Startup & Entrepreneur Residence 5Y Qatar",
    validity: "5 Years Renewable QFC Entrepreneur Residence Qatar",
    docs: "QFC / Invest Qatar startup endorsement + Commercial registration in QFC + Audited business plan + Bank statement QAR 100,000+ + Medical & QID biometrics"
  },
  {
    id: "qa-PR-010",
    officialCode: "QA-PR-010",
    name: "Qatar Special Competency & Children of Qatari Mother Permanent Residency (Law No. 10 of 2018) PR Qatar",
    toCountry: "qa",
    fromCountry: "in",
    category: "pr",
    record_type: "PR_VISA",
    fee: "QAR 3000 Law No. 10 of 2018 Permanent Residency Card Qatar",
    validity: "Permanent Residency Card (Full Healthcare, Education & Property Rights) Qatar",
    docs: "Qatari Mother ID & Birth Certificate OR Amiri Decree for Special Services to Qatar + Clean criminal record + Arabic language proficiency + MOI Permanent Residency Committee approval"
  }
];

function convertRawToVisaItem(item: RawQatarItem): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
  const details = getQatarMicroDetails(item.id, item.category, item.name, item.fundsBox, item.itrBox, item.bankBox);

  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    category: item.category,
    toCountry: item.toCountry,
    fromCountry: item.fromCountry,
    record_type: item.record_type,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    processing: "3 - 10 Working Days (Hayya / Metrash2 / MOI Qatar)",
    icon: item.category === 'tourist' ? '🏖️' : item.category === 'work' ? '💼' : item.category === 'student' ? '🎓' : item.category === 'family' ? '👨‍👩‍👧' : item.category === 'business' ? '🤝' : '🏛️',
    purpose: `${item.name} — Official Qatar (${item.officialCode}) visa and residency pathway processed via Hayya Platform, Metrash2, and Ministry of Interior (MOI) Qatar.`,
    eligibility: `Valid passport with minimum 6 months validity, required Hayya/MOI supporting documents, verified financial sufficiency, and clean background check.`,
    popular: item.id.endsWith('-001'),
    highlight: item.id.endsWith('-001'),
    isActive: true,
    isLegacy: false,
    docs: docList,
    documents: docList,
    fundsBox: details.fundsBox,
    itrBox: details.itrBox,
    bankBox: details.bankBox,
    rawFundsBox: item.fundsBox,
    rawBankBox: item.bankBox,
    warningBox: item.warningBox,
    microDetails: details,
    infoReq: [
      "Full Name, Nationality, Date & Place of Birth matching Passport",
      "Passport Number, Issue & Expiry Date (minimum 6 months validity)",
      "Qatar Accommodation / Discover Qatar Booking or Sponsor QID & National Address",
      "Occupation, Employer / Sponsor Commercial Registration (CR) & Computer Card Details"
    ],
    steps: [
      "Verify eligibility and prepare all required documents (Passport 6M, white-background photo 38x48mm, bank statements, and hotel/sponsor proof).",
      "Submit online application via the official Hayya to Qatar portal (hayya.qa), Metrash2 app, or MOI Qatar e-Services.",
      "Complete biometrics and medical examination at Qatar Visa Center (QVC) or Medical Commission upon arrival (for work/residence visas).",
      "Pay the official QAR visa fee online and download the electronic entry permit or QID residence card."
    ],
    tips: [
      "Ensure your 3-month bank statement maintains at least QAR 5,000+ without sudden large unexplained deposits.",
      "For Hayya A1/A2/A3 tourist visas, confirm whether Discover Qatar hotel booking and MOPH mandatory health insurance (QAR 50) apply to your nationality.",
      "For Family Visit and Family RP on Metrash2, ensure the sponsor's salary (QAR 10,000+ or QAR 15,000+) is clearly reflected in WPS bank statements."
    ],
    faq: [
      {
        q: `What is the official fee and validity for ${item.name}?`,
        a: `Fee: ${item.fee}. Validity: ${item.validity}. Applications are processed electronically through Hayya, Metrash2, or MOI Qatar.`
      },
      {
        q: `What documents are required for ${item.officialCode}?`,
        a: `Required documents: ${item.docs}.`
      }
    ]
  };
}

const ALL_QA_CONVERTED = QA_66.map(convertRawToVisaItem);

export const QATAR_66_VISAS: CountryVisas = {
  tourist: ALL_QA_CONVERTED.filter(v => v.category === 'tourist'),
  work: ALL_QA_CONVERTED.filter(v => v.category === 'work'),
  student: ALL_QA_CONVERTED.filter(v => v.category === 'student'),
  family: ALL_QA_CONVERTED.filter(v => v.category === 'family'),
  business: ALL_QA_CONVERTED.filter(v => v.category === 'business'),
  pr: ALL_QA_CONVERTED.filter(v => v.category === 'pr'),
  supporting: []
};
