import type { VisaItem, CountryVisas } from './fullVisaDatabase';

// Helper function to build detailed UK micro details (Funds, ITR, Bank) based on category and UKVI route code
function getUkMicroDetails(code: string, cat: string, name: string) {
  const lowerCode = code.toLowerCase();

  // Default: Box 1, 2, 3 for UK Standard Visitor & Transit
  let fundsMin =
    "Minimum ₹3-5 Lakhs INR in regular personal savings bank account maintained over 6 months (NOT a 1-day ₹10 Lakh sudden deposit). Per day UK stay cost is £100–£150 (~₹10,000–₹15,000 INR/day). For a 10-day UK trip: show ₹1–1.5 Lakhs living expenses + return flight (£400–£600) + hotel (£80/day). Recommended liquid balance: ₹5 Lakhs regular savings + 6 months salary slips.";
  let fundsBankMonths =
    "Last 6 months continuous bank statements with regular monthly salary/business credits. Hotel booking for entire stay (Booking.com free cancellation accepted) + flight reservation (purchased ticket not mandatory before visa) + detailed cover letter explaining purpose, itinerary, funding, and return ties.";
  let fundsSudden =
    "❌ 1 din pehle 5 lakh daal ke mat dikhao - 6 mahine purana regular balance hona chahiye! Any sudden large deposit >₹1 Lakh requires documented legal source proof. Top UK Visitor refusal reason under Appendix V (V 4.2): Insufficient genuinely available funds + weak home country ties.";
  let fundsEx =
    "✅ Sahi: 6 months regular salary credit ₹60k–₹80k every month (5th–10th) + closing balance ₹4.5–5 Lakhs. ❌ Galat: Account balance ₹15,000 for 5 months and ₹5 Lakh deposited 2 days before VFS appointment without source proof (Direct Refusal).";

  let itrYears =
    "Last 2–3 Assessment Years Income Tax Returns (ITR-V) + Form 16 + Computation of Income + Balance Sheet (if business) ⭐ (MOST IMPORTANT for home ties). If Business: Company ITR 2–3 years + GST Returns 2 years + Personal ITR 2–3 years + Audited Balance Sheet. Agricultural Income: J-Form + Land Registry Proof + ITR.";
  let itrMatch =
    "ITR income and bank credit MUST match — e.g., ITR shows ₹10 Lakh annual income, but bank shows ₹50 Lakh unexplained credits = Mismatch = Refusal! UKVI caseworkers cross-verify tax filings against bank statement credits to test genuineness.";
  let itrNoItr =
    "No ITR = Weak case (~70% refusal risk on UK Standard Visitor). UK visitor visas require strong socio-economic home ties: stable job/business + property ownership + dependent family in home country.";

  let bankMonths =
    "6 months bank statements from a UKVI-regulated financial institution (all major Indian scheduled banks are approved). Statements must be original bank-stamped or official online statements supported by a bank verification letter, showing regular monthly salary credit between 5th–10th of each month.";
  let bankReg =
    "Regular monthly salary/income credits: ₹10k, ₹20k balance aur fir achank ek din me ₹5 Lakh deposit = Fake/Parked funds = Refusal! Closing balance should be ₹3–5 Lakhs built organically.";
  let bankFd =
    "Fixed Deposits (FDs) must be at least 3+ months old and completely lien-free (no overdraft against FD). Credit card se bank me paisa transfer karke balance mat dikhao; borrowed money without registered family gift deed is strictly rejected.";
  let bankSource =
    "Large deposit (>₹50,000) source proof mandatory: Bonus letter + Salary slip / Registered Property Sale Deed + Buyer bank payment trail / Loan Sanction + Disbursement / Registered Gift Deed + Donor ITR + Donor Bank Statement.";

  if (cat === 'student' || lowerCode.includes('uks-') || lowerCode.includes('grad') || lowerCode.includes('t4') || lowerCode.includes('tier4')) {
    fundsMin =
      "Full 1-year unpaid course tuition fee (as stated on CAS) + mandatory UKVI living maintenance for up to 9 months: £1,334/month in London (£12,006 total) OR £1,023/month outside London (£9,207 total). Total typically £20,000–£37,006 (~₹20–38 Lakhs INR). Example (London): £25,000 tuition + £12,006 living = £37,006 (~₹38 Lakhs). For Graduate Visa (in-country): No maintenance requirement, pay £822 fee + £1,035/yr IHS.";
    fundsBankMonths =
      "OFFICIAL UKVI 28-DAY RULE (MOST IMPORTANT ⭐): Required funds must be held continuously for at least 28 consecutive days, and the closing date of the bank statement must fall within 31 days of paying the online visa application fee.";
    fundsSudden =
      "❌ 1 din pehle 38 lakh loan disburse ya transfer mat dikhao — 28 days continuous balance is strictly mandatory! UKVI caseworkers check every single day's closing balance across the 28-day window; if the balance drops below the required £ threshold for even ONE day, the visa is automatically refused.";
    fundsEx =
      "✅ Sahi: ₹38 Lakhs (£37,006+) maintained continuously in Student or Parent's savings account from 1st Oct to 29th Oct without dropping below threshold on any day, or sanctioned education loan from an RBI/regulated bank. ❌ Galat: ₹38 Lakhs deposited 3 days before visa submission or held in equity shares/bonds/mutual funds.";
    itrYears =
      "Student ITR (2 years if previously employed) + Sponsor Parents' ITR for last 2–3 years + Form 16 + Computation of Income + Balance Sheet & GST Returns (if business). CAS (Confirmation of Acceptance for Studies) + 28-day funds are the #1 mandatory requirements.";
    itrMatch =
      "ITR and bank deposits should align: if Sponsor ITR is ₹10 Lakhs and bank holds ₹40 Lakhs, attach clear source proof (matured FD, property sale, retirement provident fund, or education loan letter).";
    itrNoItr =
      "While UKVI primarily assesses the strict 28-day liquid funds rule and CAS under Appendix Student, 2 years of Sponsor ITR strongly reinforces credibility during UKVI student credibility interviews.";
    bankMonths =
      "Bank statement covering at least 28 continuous days (ending within 31 days before online application date) showing account holder name, account number, bank logo, and daily balance never falling below required tuition + living amount.";
    bankReg =
      "Bank letter / statement must confirm the 28-day continuous holding period. Funds must be in cash savings (or instant-access deposit confirmed by bank letter) — shares, bonds, crypto, pensions, or locked property equity are NOT accepted.";
    bankFd =
      "Fixed Deposits (FDs) are only acceptable if liquidated into savings 28 days prior OR accompanied by an explicit bank certificate confirming the FD can be withdrawn immediately at any time without penalty blockage.";
    bankSource =
      "Education Loan: Official student loan sanction letter from a government-regulated bank/financial institution dated within 6 months of application (or loan disbursed in savings account for 28 days). If parents sponsor: Parents' 28-day bank statement + Affidavit of Support + Applicant's Birth Certificate proving relationship + Parents' ID & ITR.";
  } else if (cat === 'work' || lowerCode.includes('ukw-') || lowerCode.includes('uktw-') || lowerCode.includes('ukwo-') || lowerCode.includes('ukl-')) {
    fundsMin =
      "Skilled Worker / GBM / Sponsored Work: £0 maintenance required IF your A-rated UK employer ticks 'Sponsor certifies maintenance' on your Certificate of Sponsorship (CoS). If maintenance is NOT certified on CoS (or for Youth Mobility / HPI / Scale-up): £1,270 main applicant + £285 dependent partner + £315 first child + £200 each additional child held for 28 continuous days (Youth Mobility requires £2,530 held for 28 days). Keep ₹2–3 Lakhs personal savings for travel and ties.";
    fundsBankMonths =
      "If CoS does not certify maintenance: 28 consecutive days bank statement ending within 31 days of application showing £1,270+ (+ dependants). Plus 3–6 months salary bank statement showing regular salary credits from current employer.";
    fundsSudden =
      "❌ Do not let your account dip below £1,270 (+ dependant funds) on any single day during the 28-day window if maintenance is not certified by your UK sponsor. Work experience claims must be backed by matching bank salary credits.";
    fundsEx =
      "✅ Sahi: A-rated UK employer certifies maintenance on CoS (or £1,270+ held for 28 days) + 3 years Indian salary slips matching Form 16, ITR, and bank credits. ❌ Galat: CoS does not certify maintenance and applicant deposits £1,270 only 5 days before applying.";
    itrYears =
      "Work experience proof: Last 2–3 years ITR + Form 16 + Monthly Salary Slips + Experience Letters — ALL must show the exact same employer name! CoS (Certificate of Sponsorship) is the #1 mandatory document.";
    itrMatch =
      "ITR company name, Form 16 employer TAN/PAN, Salary slips, Experience letters, and SOC code duties on CoS MUST match 100%. Any discrepancy triggers a genuineness verification audit and refusal.";
    itrNoItr =
      "For skilled work routes, missing ITR/Form 16 for claimed skilled work history undermines occupational genuineness checks under Appendix Skilled Worker.";
    bankMonths =
      "28-day continuous bank statement for £1,270 maintenance (unless certified on CoS) + 6 months personal salary bank account showing consistent monthly salary credits.";
    bankReg =
      "Monthly salary credit matching payslips and Form 16 from regulated banking institution.";
    bankFd =
      "Cash savings or immediately accessible deposits held for 28 days in an approved financial institution.";
    bankSource =
      "Verified salary income, employer relocation allowance, or A-rated sponsor maintenance certification on CoS.";
  } else if (cat === 'family' || lowerCode.includes('ukf-') || lowerCode.includes('ukeu-') || lowerCode.includes('ukh-') || lowerCode.includes('ukc-')) {
    fundsMin =
      "Family Partner / Spouse Minimum Income Requirement (MIR under Appendix FM): UK Sponsor must earn at least £29,000 gross per year (increased in 2024 from £18,600 to £29,000). Cash Savings Route (if no employment income): £88,500 held continuously for 6 months (£16,000 base + 2.5 × £29,000 shortfall). Applicant in India should also show ₹2–3 Lakhs personal bank balance + 2 years ITR.";
    fundsBankMonths =
      "UK Sponsor: 6 months UK bank statements + 6 months payslips + UK Employer Letter + P60 (12 months if Category B variable employment). Cash Savings Route: 6 full months bank statements showing £88,500+ continuously without dropping below.";
    fundsSudden =
      "❌ Under the Cash Savings Route (Category D), funds (£88,500) must be held for 6 full continuous months prior to application date with a signed declaration of source (unless from property/investment sale held for 6+ months combined). Sudden unexplained transfers are rejected.";
    fundsEx =
      "✅ Sahi: UK Spouse earns £32,000/yr with 6 months NHS/corporate payslips, P60, employer letter, and matching UK bank salary credits (OR £88,500 cash savings held 6 months). ❌ Galat: Sponsor earns £22,000/yr with no qualifying cash savings to bridge the shortfall.";
    itrYears =
      "UK Sponsor: P60 + 6 months Payslips + Employer Letter + 6 months UK Bank Statements showing exact net salary credits. If UK Sponsor is Self-Employed (Category F/G): HMRC SA302 + Tax Year Overview + 12 months Business Bank Statements + Certified Accountant Letter. Applicant (India): 2 years Indian ITR.";
    itrMatch =
      "Every single payslip net amount must match the exact credit date and amount on the UK sponsor's bank statement under Appendix FM-SE strict evidential rules.";
    itrNoItr =
      "Appendix FM-SE has mandatory specified evidence rules — missing P60, missing SA302 (for self-employed), or missing 6 months bank statements will result in refusal unless exceptional Article 8 circumstances apply.";
    bankMonths =
      "UK Sponsor: 6 months official UK bank statements (or electronic statements stamped/verified) showing salary deposits matching payslips; Cash Savings route requires 6 months continuous statements showing £88,500+. Applicant: 6 months bank statements showing ₹2–3 Lakhs.";
    bankReg =
      "Consistent monthly salary deposits into UK Sponsor's account matching HMRC PAYE records, plus joint financial remittances/support transfers between partners.";
    bankFd =
      "Cash savings must be held in a regulated bank/savings account allowing immediate withdrawal (with or without penalty).";
    bankSource =
      "Declaration of source of cash savings (employment savings, sale of property held >6 months, inheritance, or documented family gift held for 6+ months).";
  } else if (cat === 'business' || lowerCode.includes('ukb-')) {
    fundsMin =
      "Innovator Founder Visa: Personal maintenance funds of £1,270 held for 28 consecutive days (+ £285 partner, £315 first child, £200 each additional child). Note: The old mandatory £50,000 minimum investment rule was removed under Innovator Founder, PROVIDED your business plan is endorsed as innovative, viable, and scalable — however, £50,000+ (~₹55 Lakhs+) in verifiable business/investment capital is strongly recommended to prove viability to the Endorsing Body and UKVI!";
    fundsBankMonths =
      "28 continuous days personal bank statement showing £1,270+ maintenance (ending within 31 days of application) + 6–12 months personal and corporate bank statements showing investment capital availability.";
    fundsSudden =
      "❌ Business capital and maintenance funds must have a clean, auditable source-of-wealth trail. Unexplained lump-sum deposits right before endorsement or visa filing trigger anti-money-laundering and genuineness refusals.";
    fundsEx =
      "✅ Sahi: Official Endorsement Letter from UK Home Office approved Endorsing Body + £1,270 held 28 days + £50,000+ liquid business startup capital with 2 years audited company/personal ITR. ❌ Galat: Applying without an approved Endorsing Body letter or with unverified borrowed funds.";
    itrYears =
      "Personal ITR for last 2–3 years + Corporate ITR for last 2–3 years + Form 16 + Audited Balance Sheet, Profit & Loss Statement, and 2 years GST Returns ⭐ (MOST IMPORTANT).";
    itrMatch =
      "Corporate turnover, GST filings, and personal income tax returns must reconcile with the capital declared in your endorsed Innovator Founder business plan.";
    itrNoItr =
      "Endorsing bodies and UKVI perform strict due diligence on founder track record and lawful source of seed capital.";
    bankMonths =
      "28-day personal bank statement for £1,270 maintenance + 6 months corporate and personal bank statements from a UKVI-regulated bank.";
    bankReg =
      "Active commercial and personal banking profile demonstrating clean cash flow and unencumbered startup seed funds.";
    bankFd =
      "Liquid cash savings in regulated accounts; locked assets cannot count toward the 28-day £1,270 maintenance requirement.";
    bankSource =
      "Audited business profits, personal savings, venture capital/angel funding agreements, or documented asset sales.";
  } else if (cat === 'pr' || lowerCode.includes('ukr-') || lowerCode.includes('ukn-') || lowerCode.includes('ukp-') || lowerCode.includes('ukx-')) {
    fundsMin =
      "Indefinite Leave to Remain (ILR / Settlement) & British Naturalisation: No fixed 28-day maintenance savings box, BUT applicants on Skilled Worker ILR must meet the minimum settlement salary threshold (£38,700/yr or going rate for SOC code; lower transitional/Healthcare thresholds apply), and Family Route ILR requires continuing to meet the Appendix FM financial requirement (£29,000 MIR or £18,600 transitional).";
    fundsBankMonths =
      "Last 3–6 months UK bank statements showing ongoing UK salary credits matching payslips and employer letter confirming you are still needed for the job (for Work ILR), or 6 months financial evidence (for Family ILR).";
    fundsSudden =
      "All UK earnings claimed for ILR must match HMRC PAYE records and P60 tax summaries. Absences from the UK must not exceed 180 days in any rolling 12-month period during the qualifying 5-year (or 10-year) residence period.";
    fundsEx =
      "✅ Sahi: 5 years continuous lawful UK residence + Life in the UK Test pass + B1 English + UK Employer letter confirming salary meets ILR threshold + P60s & payslips. ❌ Galat: Over 180 days absence in a 12-month period without permitted exception or unpaid tax discrepancies.";
    itrYears =
      "5 years UK HMRC P60 End-of-Year Tax Certificates + HMRC Employment History record + recent 3–6 months UK payslips. (Indian ITR if applying for Returning Resident Visa from overseas).";
    itrMatch =
      "Reported salary on CoS/employer settlement letter must match HMRC PAYE filings and UK bank account salary deposits.";
    itrNoItr =
      "HMRC tax compliance is strictly checked under Good Character and suitability requirements for both ILR and British Citizenship.";
    bankMonths =
      "Recent 3–6 months UK bank statements showing salary credits and UK residential address continuity (utility bills, council tax, tenancy/mortgage statements).";
    bankReg =
      "Regular UK payroll credits and active UK residential banking trail.";
    bankFd =
      "UK ISA / savings accounts valid if relying on cash savings for Family Route 5-year ILR.";
    bankSource =
      "Lawful UK employment, self-employment (HMRC SA302), or pension/savings income.";
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

// Helper function to build detailed 16-18 UK document checklist with MOST IMPORTANT ⭐
function getUkDocs(code: string, cat: string, name: string): string[] {
  const lowerCode = code.toLowerCase();

  if (cat === 'student' || lowerCode.includes('uks-') || lowerCode.includes('grad') || lowerCode.includes('t4') || lowerCode.includes('tier4')) {
    return [
      "Valid Original Passport (minimum 6 months validity with at least 2 blank pages + all old passports) ⭐",
      "Recent UK Biometric Specification Photographs (45mm x 35mm, plain light-grey or cream/white background)",
      "Completed Online UK Visa Application Form (GOV.UK Access UK confirmation + Document Checklist) ⭐",
      "Confirmation of Acceptance for Studies (CAS) Reference Number issued by a UKVI Licensed Student Sponsor University ⭐ (MOST IMPORTANT)",
      "Academic Technology Approval Scheme (ATAS) Clearance Certificate (mandatory for sensitive postgraduate/research subjects in STEM) ⭐ (MOST IMPORTANT)",
      "Academic Qualification Documents listed on CAS: 10th, 12th Marksheets, Bachelor's/Master's Degree Certificates & Official Transcripts ⭐",
      "Approved Secure English Language Test (SELT): IELTS for UKVI (Academic) min 6.0–6.5 overall (5.5 each band) or PTE Academic UKVI ⭐ (MOST IMPORTANT)",
      "28-Day Continuous Bank Statements showing full 1st-year unpaid Tuition + 9 months Living Maintenance (£1,334/mo London = £12,006 OR £1,023/mo outside London = £9,207; total £20k–£37k+) held for 28 consecutive days ending within 31 days of application ⭐ (MOST IMPORTANT - 28-Day Rule)",
      "Official Bank Letter / Education Loan Sanction Letter from a regulated bank confirming unconditional availability of student funds ⭐",
      "If Sponsored by Parents: Parents' Bank Statement (28 days) + Signed Affidavit of Financial Support + Applicant's Birth Certificate proving relationship + Parents' ID & Employment Proof ⭐",
      "Income Tax Returns (ITR-V) for last 2–3 years of Student (if employed) and Sponsoring Parents + Form 16 / Computation of Income",
      "Source of Funds Proof for any large deposits made prior to the 28-day window (FD liquidation receipt, property sale, EPF withdrawal)",
      "Statement of Purpose (SOP) detailing academic progression, why UK, why this specific university/course, and post-study career plan ⭐",
      "Updated Curriculum Vitae (CV) / Academic Resume & Work Experience Letters / Salary Slips (to explain any study gap after graduation)",
      "Medical Tuberculosis (TB) Clearance Certificate from a UK Home Office approved clinic (mandatory for stays >6 months from India & listed countries; valid 6 months) ⭐ (MOST IMPORTANT)",
      "Immigration Health Surcharge (IHS) Payment Receipt (£776/year for students; £1,035/year for Graduate Visa) ⭐",
      "Official Scholarship / Financial Sponsorship Award Letter (if sponsored by a government or international scholarship body)",
      "Parental Consent Letter & UK Care Arrangements Proof (mandatory if applicant is under 18 years of age)"
    ];
  }

  if (cat === 'work' || lowerCode.includes('ukw-') || lowerCode.includes('uktw-') || lowerCode.includes('ukwo-') || lowerCode.includes('ukl-')) {
    return [
      "Valid Original Passport (minimum 6 months validity, blank visa pages, and all previous passports) ⭐",
      "Recent UK Biometric Photographs (45mm x 35mm, white/off-white background)",
      "Completed Online GOV.UK Work Visa Application Form & VFS/TLS Biometric Appointment Confirmation ⭐",
      "Certificate of Sponsorship (CoS) Reference Number assigned by an A-rated UK Home Office Licensed Employer (or Global Talent Endorsement Letter) ⭐ (MOST IMPORTANT)",
      "Official UK Job Offer Letter & Signed Employment Contract specifying SOC 2020 Occupation Code, job duties, weekly hours, and gross annual salary (£38,700+ general threshold or going rate / Health & Care threshold) ⭐ (MOST IMPORTANT)",
      "UK Employer Sponsor Licence Details & Confirmation of Immigration Skills Charge (ISC) compliance",
      "Academic Degree Certificates, Marksheets & Ecctis (formerly UK NARIC) Statement of Comparability / English Proficiency Assessment ⭐ (MOST IMPORTANT)",
      "Work Experience Reference Letters (2–5 years) on company letterhead matching the sponsored SOC occupation code duties ⭐ (MOST IMPORTANT)",
      "28-Day Personal Bank Statements showing at least £1,270 maintenance funds (+ £285 partner, £315 first child) UNLESS the A-rated UK sponsor has ticked 'Sponsor certifies maintenance' on the CoS ⭐ (MOST IMPORTANT)",
      "Income Tax Returns (ITR-V) for last 2–3 years + Form 16 + Last 6 Months Salary Slips matching current employer and experience letters ⭐",
      "Approved English Language Proof at CEFR Level B1 (IELTS for UKVI 4.0+ in all 4 components, PTE UKVI, or degree taught in English verified by Ecctis) ⭐ (MOST IMPORTANT)",
      "Detailed Professional CV / Resume aligned with UK SOC code responsibilities",
      "Medical Tuberculosis (TB) Test Certificate from a UKVI-approved clinic (mandatory if moving from India/listed countries for >6 months) ⭐",
      "Overseas Criminal Record Certificate / Police Clearance Certificate (PCC) (mandatory for Health, Care, Education, and Welfare SOC codes) ⭐",
      "Immigration Health Surcharge (IHS) Payment Receipt (£1,035/year; Health and Care Worker Visa is 100% exempt from IHS)",
      "ATAS Certificate (if your skilled worker role involves academic research at PhD/postgrad level in sensitive STEM subjects)",
      "Dependant Partner & Child Documents (Marriage Certificate, Birth Certificates, relationship proof, and dependant CoS links if applying together)",
      "UK Accommodation Proof (Initial hotel booking, company-provided housing letter, or UK tenancy agreement) & Cover Letter"
    ];
  }

  if (cat === 'family' || lowerCode.includes('ukf-') || lowerCode.includes('ukeu-') || lowerCode.includes('ukh-') || lowerCode.includes('ukc-')) {
    return [
      "Valid Original Passport of Applicant + all previous passports & UK Biometric Photographs (45mm x 35mm) ⭐",
      "Completed Online Appendix FM Family Visa Application Form & VFS Biometric Appointment Confirmation ⭐",
      "Official Relationship Proof: Government Marriage Certificate / Civil Partnership Certificate (attested & translated if not in English) + 20–30 timestamped photos (wedding, family events, trips, daily life) + chat logs, call history, and joint travel tickets ⭐ (MOST IMPORTANT)",
      "Cohabitation & Genuine Subsisting Relationship Proof (mandatory if unmarried partner 2+ years): Joint bank account statements, joint tenancy/lease agreements, council tax bills, and utility bills addressed to both partners ⭐ (MOST IMPORTANT)",
      "UK Sponsor Status Proof: Copy of Sponsor's British Passport, Certificate of Naturalisation, Indefinite Leave to Remain (ILR) eVisa/BRP, or EUSS Settled Status share code ⭐ (MOST IMPORTANT)",
      "UK Sponsor Financial Requirement Proof (£29,000+ Minimum Income Requirement under Appendix FM-SE): 6 months UK Payslips + P60 + UK Employer Letter on letterhead confirming salary, employment start date, contract type, and authenticity of payslips ⭐ (MOST IMPORTANT)",
      "UK Sponsor 6 Months Personal Bank Statements showing every monthly net salary credit matching the 6 payslips (OR £88,500 cash savings held continuously for 6 full months under Category D) ⭐ (MOST IMPORTANT)",
      "If UK Sponsor is Self-Employed: HMRC SA302 Tax Calculations + Tax Year Overviews + 12 months Business Bank Statements + Audited Accounts + Accountant Letter",
      "Sponsor Invitation & Support Letter detailing the relationship timeline, how you met, wedding details, financial support, and future UK living plans ⭐ (MOST IMPORTANT)",
      "UK Adequate Accommodation Proof: Tenancy Agreement + Landlord NOC Letter OR Land Registry Title Deed + Mortgage Statement + Council Tax Bill + Property Inspection Report confirming no statutory overcrowding ⭐",
      "Approved English Language Test Certificate: IELTS Life Skills at CEFR Level A1 (for initial Partner entry), Level A2 (for 2.5-year extension), or Level B1 (for 5-year ILR) — or Ecctis-verified English degree ⭐ (MOST IMPORTANT)",
      "Medical Tuberculosis (TB) Test Certificate from a UKVI-approved panel clinic (valid for 6 months) ⭐",
      "Immigration Health Surcharge (IHS) Payment Confirmation (£1,035/year for adults; £776/year for children)",
      "Applicant Personal Bank Statements (last 6 months showing ₹3–5 Lakhs) & Applicant Indian ITR (2 years, if employed)",
      "Divorce Decree Absolute or Death Certificate of any former spouse (if either Applicant or Sponsor was previously married)",
      "Birth Certificates of Dependent Children & Sole Responsibility / Custody Court Orders (if applying with children)",
      "Police Clearance Certificate (PCC) & Full Immigration History Declaration (explaining any prior UK or international visa refusals)",
      "Comprehensive Relationship Timeline Cover Letter signed by both Applicant and UK Sponsor"
    ];
  }

  if (cat === 'business' || lowerCode.includes('ukb-')) {
    return [
      "Valid Original Passport (minimum 6 months validity, 2 blank pages, and all previous passports with travel history) ⭐",
      "Recent UK Biometric Photographs (45mm x 35mm) & Online GOV.UK Application Confirmation ⭐",
      "Official Endorsement Letter issued by a UK Home Office Approved Endorsing Body (confirming your business is Innovative, Viable, and Scalable, dated within 3 months of application) ⭐ (MOST IMPORTANT)",
      "Comprehensive Innovator Founder Business Plan (15–25 pages covering market gap, IP/innovation, 3-year financial projections, UK job creation, and scalability roadmap) ⭐ (MOST IMPORTANT)",
      "28-Day Personal Bank Statements showing at least £1,270 personal maintenance funds (+ £285 partner, £315 child) held continuously for 28 days ending within 31 days of application ⭐ (MOST IMPORTANT)",
      "Business Investment & Seed Capital Proof (£50,000+ recommended liquid startup funds in regulated bank account with full source-of-wealth documentation) ⭐ (MOST IMPORTANT)",
      "Indian / Existing Company Registration Documents: Certificate of Incorporation, MOA & AOA, GST Registration Certificate, Business PAN, and Trade License",
      "Company Financials: Last 6–12 months Corporate Bank Statements + Last 2–3 years Corporate ITR + Audited Balance Sheet, P&L Statement & GST Returns ⭐ (MOST IMPORTANT)",
      "Personal Income Tax Returns (ITR-V) for last 2–3 years + Form 16 + CA Certified Net Worth Statement ⭐ (MOST IMPORTANT)",
      "Approved English Language Qualification at CEFR Level B2 (IELTS for UKVI 5.5+ in all 4 bands, PTE UKVI, or UK/Ecctis-verified English-taught degree) ⭐",
      "Previous Business Track Record Proof: Client contracts, commercial invoices, patents/trademarks, pitch decks, and 2 years business correspondence",
      "UK Corporate Setup Docs (if already incorporated): Companies House Certificate of Incorporation, UK business address / incubator lease agreement",
      "Founder Curriculum Vitae (CV), Academic Degree Certificates, and Professional Credentials",
      "Medical Tuberculosis (TB) Clearance Certificate from a UKVI-approved clinic (if staying >6 months) ⭐",
      "Immigration Health Surcharge (IHS) Payment Receipt (£1,035/year) & Endorsing Body Assessment Fee Receipt",
      "Personal Property & Asset Ownership Deeds in home country",
      "Detailed Founder Cover Letter explaining business innovation, viability, scalability, and UK market execution plan",
      "Travel & Medical Insurance, Flight Itinerary, and Initial UK Accommodation Booking"
    ];
  }

  if (cat === 'pr' || lowerCode.includes('ukr-') || lowerCode.includes('ukn-') || lowerCode.includes('ukp-') || lowerCode.includes('ukx-')) {
    return [
      "Valid Original Passport + All Passports held during your qualifying residence period in the UK ⭐ (MOST IMPORTANT)",
      "Current UK Biometric Residence Permit (BRP) or Digital UKVI eVisa Share Code proving valid continuous leave ⭐ (MOST IMPORTANT)",
      "Official Life in the UK Test Pass Notification Letter / Unique Reference Number (mandatory for ILR and British Naturalisation for applicants aged 18–64) ⭐ (MOST IMPORTANT)",
      "Knowledge of Language Proof at CEFR Level B1 in Speaking & Listening (IELTS Life Skills B1, Trinity GESE Grade 5, or UK/Ecctis degree taught in English) ⭐ (MOST IMPORTANT)",
      "UK Employer Settlement Support Letter (for Work Route ILR): Confirming you are still required for the job for the foreseeable future, your SOC code, working hours, and that your salary meets the ILR statutory threshold (£38,700+ or going rate) ⭐ (MOST IMPORTANT)",
      "5 Years HMRC Tax & Employment History: P60 End-of-Year Certificates for all 5 qualifying years + Last 6 Months UK Payslips ⭐ (MOST IMPORTANT)",
      "Last 6 Months UK Personal Bank Statements showing monthly salary deposits matching payslips ⭐",
      "Complete UK Absence Schedule listing every single trip outside the UK during the 5-year (or 10-year Long Residence) period, confirming no more than 180 days absence in any rolling 12-month period ⭐ (MOST IMPORTANT)",
      "Employer Absence Confirmation Letter verifying that all absences from the UK were taken as paid annual leave or official business travel",
      "5 Years UK Cohabitation & Continuous Address Proof (for Family ILR / Long Residence): Council Tax bills, Tenancy Agreements / Mortgage Statements, Utility Bills, NHS letters, and DVLA records spread evenly across 2.5–5 years ⭐",
      "For British Naturalisation (Form AN): Two Official Referee Declarations (one professional referee of any nationality + one British citizen passport holder aged 25+ who has known you for 3+ years) ⭐",
      "Marriage / Civil Partnership Certificate & Spouse's British Passport / ILR proof (if applying on a Family route or 3-year spouse naturalisation)",
      "UK Police / Criminality & Good Character Declaration (declaring any traffic fixed penalty notices, cautions, or civil judgments)",
      "UKVCAS (Sopra Steria / TLScontact) Biometric Appointment Confirmation & Online SET(O) / SET(M) / SET(LR) / Form AN Application Copy",
      "Application Fee Receipt (£2,885 for ILR; £1,630 for Naturalisation)",
      "Detailed Settlement Cover Letter summarizing qualifying residence dates, SOC/financial compliance, and absence calculation"
    ];
  }

  // Default: TOURIST / STANDARD VISITOR (16+ docs with MOST IMPORTANT ⭐)
  return [
    "Valid Original Passport (valid for the entire stay in the UK with at least 2 blank pages + all old passports showing previous UK/US/Schengen/Canada visas) ⭐",
    "Recent UK Specification Photographs (45mm x 35mm, white/light background)",
    "Completed Online GOV.UK Standard Visitor Application Form (Access UK confirmation) ⭐ (MOST IMPORTANT)",
    "VFS Global / TLScontact Biometric Appointment Confirmation Letter & Visa Fee Payment Receipt (£115 for 6 months) ⭐",
    "Comprehensive Cover Letter explaining exact purpose of visit, day-by-day UK itinerary, who is funding the trip, and strong binding reasons to return to your home country ⭐ (MOST IMPORTANT)",
    "Confirmed Hotel Booking for Entire Stay (Booking.com free cancellation accepted with full UK address) OR Official Invitation Letter from UK Host ⭐ (MOST IMPORTANT)",
    "Round-Trip Flight Reservation / Travel Itinerary (reservation PNR recommended; UKVI advises not paying for non-refundable tickets before visa decision)",
    "Personal Bank Account Statements for the last 6 continuous months (original bank-stamped or with bank letter) showing ₹3–5 Lakhs regular balance & monthly salary credits ⭐ (MOST IMPORTANT)",
    "Last 6 Months Salary Slips + Form 16 matching monthly credits in your bank account ⭐",
    "Income Tax Returns (ITR-V) for the last 2–3 Assessment Years + Computation of Income + Balance Sheet (if self-employed/business) ⭐ (MOST IMPORTANT)",
    "Employment NOC & Leave Approval Letter on company letterhead (stamped & signed, stating designation, monthly salary, joining date, and approved leave dates) ⭐ (MOST IMPORTANT)",
    "If Business Visitor: Official Business Invitation Letter from UK company + Sponsor Letter/Email Chain + Origin/Indian Company Deputation Letter ⭐",
    "If Self-Employed / Business Owner: Certificate of Incorporation / Partnership Deed + GST Registration + 2 years GST Returns + 6 months Current Account Statements",
    "Home Country Economic & Family Ties Proof: Property Ownership Deeds (House, Flat, Land Registry, FDs) + Marriage Certificate + Children's Birth Certificates / School Bonafide ⭐",
    "If Sponsored / Visiting Family in UK: UK Host's Invitation Letter + Host's British Passport / BRP / eVisa Share Code + Host's 6 months UK Bank Statements + Council Tax / Tenancy Agreement + Proof of Relationship",
    "Overseas Travel Medical Insurance Policy (£50,000+ coverage recommended for medical emergencies)"
  ];
}

// -------------------------------------------------------------------------------------------------
// 111 OFFICIAL UK VISAS DEFINITIONS (PDF A TO Z MASTER DIRECTORY: UKV TO UKL)
// -------------------------------------------------------------------------------------------------

const touristVisasRaw = [
  {
    id: "in-to-gb-tourist-ukv-std",
    officialCode: "UKV-STD",
    officialName: "Standard Visitor Visa (Appendix V)",
    name: "Standard Visitor Visa (Tourism, Family & Business)",
    fee: "£115",
    validity: "6 months multiple-entry",
    stay: "Up to 6 months per visit",
    processing: "3 weeks (15 working days)",
    purpose: "Tourism, holidays, visiting family and friends, permitted business meetings/conferences, short recreational study up to 6 months, and private medical consultations.",
    eligibility: "Must be a genuine visitor under Appendix V who will leave the UK at the end of the visit, hold ₹3–5 Lakhs regular bank funds for 6 months, and have strong home country job/property/family ties.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/standard-visitor"
  },
  {
    id: "in-to-gb-tourist-ukv-ltv",
    officialCode: "UKV-LTV",
    officialName: "Long-term Standard Visitor Visa (2, 5 or 10 Years)",
    name: "Long-term Standard Visitor Visa (2, 5, 10 Years)",
    fee: "£432 (2yr) / £771 (5yr) / £963 (10yr)",
    validity: "2, 5 or 10 years multiple-entry",
    stay: "Up to 6 months on each visit",
    processing: "3 weeks",
    purpose: "Long-term multiple-entry visitor visa (2, 5 or 10-year validity) for frequent travellers visiting the UK regularly for tourism, family visits, or business meetings; each visit is limited to 6 months.",
    eligibility: "Track record of previous international/UK travel compliance, ongoing need to visit the UK regularly over several years, strong stable income, and clear intent not to live in the UK through successive visits.",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/standard-visitor/apply-standard-visitor-visa"
  },
  {
    id: "in-to-gb-tourist-ukv-med",
    officialCode: "UKV-MED",
    officialName: "Private Medical Treatment Visitor Visa",
    name: "Private Medical Treatment Visitor",
    fee: "£115 (6 mos) / £200 (11 mos)",
    validity: "6 to 11 months",
    stay: "Up to 11 months",
    processing: "3 weeks",
    purpose: "Visiting the UK to receive private medical consultations or treatment at a private UK hospital, or to act as an organ donor to a matched recipient in the UK.",
    eligibility: "Letter from a UK consultant/doctor detailing the medical condition, estimated cost, and duration of private treatment, plus proof of sufficient funds to pay all medical bills and living expenses.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/standard-visitor/visit-for-medical-reasons"
  },
  {
    id: "in-to-gb-tourist-ukv-aca",
    officialCode: "UKV-ACA",
    officialName: "Academic Visitor Visa (6 to 12 Months)",
    name: "Academic Visitor (Research & Sabbatical)",
    fee: "£115 (6 mos) / £200 (12 mos)",
    validity: "Up to 12 months",
    stay: "Up to 12 months",
    processing: "3 weeks",
    purpose: "Permitted academic activities under UK visitor rules: formal academic exchange, private research on sabbatical leave, or senior doctors/dentists taking part in clinical research or teaching.",
    eligibility: "Highly qualified academic (typically holding a PhD or senior faculty post at an overseas institution) on sabbatical or exchange, not filling a permanent UK teaching vacancy, with TB test if staying >6 months.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/standard-visitor/visit-as-an-academic"
  },
  {
    id: "in-to-gb-tourist-ukv-pls",
    officialCode: "UKV-PLS",
    officialName: "Permitted Paid Engagement (PPE) Visitor Route",
    name: "Permitted Paid Engagement Visitor",
    fee: "£115",
    validity: "6 months",
    stay: "Up to 6 months (PPE within first 30 days)",
    processing: "3 weeks",
    purpose: "Undertake a short, pre-arranged paid engagement in the UK directly related to your professional expertise (guest lecturer, academic examiner, arts performer, broadcaster, or qualified lawyer) within the first 30 days of arrival.",
    eligibility: "Formal written invitation from a qualifying UK-based organisation (university, arts body, broadcaster, or client), aged 18+, and proof the engagement relates to your full-time overseas profession.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/standard-visitor/paid-engagement-event"
  },
  {
    id: "in-to-gb-tourist-ukv-mar",
    officialCode: "UKV-MAR",
    officialName: "Marriage Visitor Visa",
    name: "Marriage Visitor Visa",
    fee: "£115",
    validity: "6 months",
    stay: "Up to 6 months",
    processing: "3 weeks",
    purpose: "Visit the UK specifically to marry or register a civil partnership, or to give official notice of marriage or civil partnership at a UK register office, without intending to settle in the UK after the ceremony.",
    eligibility: "Aged 18+, free to marry/enter civil partnership, genuine relationship, proof of ceremony/venue booking in the UK, and clear intention to depart the UK within 6 months.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/marriage-visitor"
  },
  {
    id: "in-to-gb-tourist-ukv-chv",
    officialCode: "UKV-CHV",
    officialName: "Child Visitor (Standard Visitor Under 18)",
    name: "Child Visitor (Under 18 Visitor Route)",
    fee: "£115",
    validity: "6 months",
    stay: "Up to 6 months",
    processing: "3 weeks",
    purpose: "Child under 18 visiting the UK for holidays, family visits, or short exchange stays (either accompanied by an adult named on the visa application or travelling unaccompanied with verified reception care).",
    eligibility: "Written consent from both parents/legal guardians, full contact and address details of reception carer in the UK, and financial sponsorship by parents.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/standard-visitor/if-youre-under-18"
  },
  {
    id: "in-to-gb-tourist-ukv-grp",
    officialCode: "UKV-GRP",
    officialName: "Visit for a Permitted Group Activity (ADS / School Tour)",
    name: "Visit for Permitted Group Activity (School & Tour Groups)",
    fee: "£115",
    validity: "6 months",
    stay: "Up to 30 days / 6 months",
    processing: "3 weeks",
    purpose: "Organised school tours, youth cultural exchanges, and Approved Destination Status (ADS) tourist group visits travelling on a shared group itinerary under UK visitor rules.",
    eligibility: "Member of an organised school or accredited tour group led by a designated adult group leader with confirmed group accommodation and return transport.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-v-visitor"
  },
  {
    id: "in-to-gb-tourist-ukt-air",
    officialCode: "UKT-AIR",
    officialName: "Direct Airside Transit Visa (DATV)",
    name: "Direct Airside Transit Visa (DATV)",
    fee: "£35",
    validity: "Up to 24 hours airside",
    stay: "Same-day airside transit (no border crossing)",
    processing: "3 weeks",
    purpose: "Catching a connecting international flight at a UK airport (e.g. Heathrow or Gatwick) without passing through UK border control or leaving the international airside transit lounge.",
    eligibility: "Confirmed onward flight ticket departing on the same day from the same UK airport, and valid entry visa/permission for your final destination country.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/transit-visa/direct-airside-transit-visa"
  },
  {
    id: "in-to-gb-tourist-ukt-vis",
    officialCode: "UKT-VIS",
    officialName: "Visitor in Transit Visa",
    name: "Visitor in Transit Visa (Landside 48 Hours)",
    fee: "£64",
    validity: "48 hours",
    stay: "Up to 48 hours",
    processing: "3 weeks",
    purpose: "Pass through UK border control (landside) to collect checked luggage, re-check in for a connecting flight, or transfer between different UK airports (e.g. Heathrow to Gatwick) within 48 hours.",
    eligibility: "Confirmed onward flight departing the UK within 48 hours of arrival and assured entry permission for your destination country.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/transit-visa/visitor-in-transit-visa"
  },
  {
    id: "in-to-gb-tourist-ukt-exm",
    officialCode: "UKT-EXM",
    officialName: "Transit Without Visa (TWOV) / Transit Exemptions",
    name: "Transit Without Visa (TWOV) Exemptions",
    fee: "Free",
    validity: "Until 23:59 the day after arrival",
    stay: "Airside or landside transit up to 24–48 hours",
    processing: "Instant at UK Border (if eligible)",
    purpose: "Administrative exemption allowing visa nationals to transit the UK without a transit visa if holding a valid qualifying visa/residence permit for the USA, Canada, Australia, New Zealand, or EEA/Switzerland.",
    eligibility: "Arrive and depart by air, hold a confirmed onward flight before 23:59 the next day, and hold a valid qualifying US/CA/AU/NZ/EEA visa or biometric residence permit.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/check-uk-visa"
  },
  {
    id: "in-to-gb-tourist-ukx-eta",
    officialCode: "UKX-ETA",
    officialName: "UK Electronic Travel Authorisation (ETA)",
    name: "Electronic Travel Authorisation (UK ETA)",
    fee: "£10",
    validity: "2 years (or until passport expiry)",
    stay: "Up to 6 months per visit",
    processing: "Within 3 working days (often hours via UK ETA app)",
    purpose: "Mandatory digital pre-travel authorisation for eligible non-visa nationals (GCC nationals, USA, Canada, Australia, Japan, Singapore, EU/EEA nationals, etc.) visiting or transiting the UK; not a visa.",
    eligibility: "Citizen of a UK ETA-eligible non-visa country holding a biometric passport, travelling for tourism, family, business, or short study up to 6 months.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta"
  },
  {
    id: "in-to-gb-tourist-uks-std",
    officialCode: "UKS-STD",
    officialName: "Standard Visitor – Short Study (Up to 6 Months)",
    name: "Standard Visitor Short Study (Up to 6 Months)",
    fee: "£115",
    validity: "6 months",
    stay: "Up to 6 months",
    processing: "3 weeks",
    purpose: "Permitted short-term study up to 6 months under Standard Visitor rules (accredited short courses, English language courses up to 6 months, electives, or short research abroad).",
    eligibility: "Unconditional acceptance letter from an accredited UK institution, no work or work placement outside permitted electives, and sufficient funds for course fees and stay.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/standard-visitor/visit-to-study"
  }
];

const workVisasRaw = [
  // UKW — Sponsored Work (10)
  {
    id: "in-to-gb-work-ukw-swk",
    officialCode: "UKW-SWK",
    officialName: "Skilled Worker Visa (Appendix Skilled Worker)",
    name: "Skilled Worker Visa",
    fee: "£719 - £1,639 (£464-£1,420) + IHS £1,035/yr",
    validity: "Up to 5 years (leads to ILR settlement)",
    stay: "Up to 5 years, extendable indefinitely",
    processing: "3 weeks (outside UK) / 8 weeks (inside UK)",
    purpose: "Main UK sponsored work visa for skilled professionals with an eligible job offer from a Home Office licensed UK sponsor meeting RQF Level 3+ skill and salary thresholds.",
    eligibility: "Valid Certificate of Sponsorship (CoS), eligible SOC 2020 occupation code, salary meeting £38,700 general threshold (or going rate / new entrant / PhD discount), B1 English, and £1,270 maintenance (or sponsor certification).",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/skilled-worker-visa"
  },
  {
    id: "in-to-gb-work-ukw-hcw",
    officialCode: "UKW-HCW",
    officialName: "Health and Care Worker Visa",
    name: "Health and Care Worker Visa (NHS & Social Care)",
    fee: "£284 (up to 3 yrs) / £551 (>3 yrs) — IHS Exempt",
    validity: "Up to 5 years (leads to ILR in 5 years)",
    stay: "Up to 5 years",
    processing: "3 weeks fast-track",
    purpose: "Fast-tracked, reduced-fee sponsored work visa with full Immigration Health Surcharge (IHS) exemption for doctors, nurses, pharmacists, paramedics, and eligible health/adult social care professionals.",
    eligibility: "CoS from the NHS, an NHS medical services supplier, or a CQC-registered care organisation in an eligible health/care SOC code, meeting national pay scale or £23,200–£29,000+ threshold, plus B1 English.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/health-care-worker-visa"
  },
  {
    id: "in-to-gb-work-ukw-gbm-ssw",
    officialCode: "UKW-GBM-SSW",
    officialName: "Global Business Mobility – Senior or Specialist Worker Visa",
    name: "Global Business Mobility – Senior or Specialist Worker",
    fee: "£719 - £1,639 (£464-£1,420) + IHS £1,035/yr",
    validity: "Up to 5 years (max 5 yrs in 6, or 9 yrs in 10 for high earners)",
    stay: "Up to 5 years",
    processing: "3 weeks",
    purpose: "Intra-company transfer of existing senior managers and specialist employees from an overseas corporate group entity to a linked UK branch or subsidiary.",
    eligibility: "Valid CoS from UK linked sponsor, RQF Level 6 (graduate level) occupation, minimum salary £48,500/yr (or 100% going rate), and 12+ months prior employment with the overseas group (exempt if earning £73,900+).",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/senior-specialist-worker-visa"
  },
  {
    id: "in-to-gb-work-ukw-gbm-gt",
    officialCode: "UKW-GBM-GT",
    officialName: "Global Business Mobility – Graduate Trainee Visa",
    name: "Global Business Mobility – Graduate Trainee",
    fee: "£298 + IHS £1,035/yr",
    validity: "Up to 1 year",
    stay: "Up to 12 months",
    processing: "3 weeks",
    purpose: "Intra-company transfer for overseas workers on a structured graduate training programme leading to a senior management or specialist role, undertaking a work placement in a linked UK company.",
    eligibility: "CoS from linked UK sponsor, minimum 3 months continuous employment with the overseas business immediately before applying, eligible graduate-level role, and salary at least £25,410/yr (or 70% going rate).",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/graduate-trainee-visa"
  },
  {
    id: "in-to-gb-work-ukw-gbm-uew",
    officialCode: "UKW-GBM-UEW",
    officialName: "Global Business Mobility – UK Expansion Worker Visa",
    name: "Global Business Mobility – UK Expansion Worker",
    fee: "£298 + IHS £1,035/yr",
    validity: "1 year initial (extendable to 2 years max)",
    stay: "Up to 2 years",
    processing: "3 weeks",
    purpose: "Send senior managers or specialist employees to the UK to establish the first UK commercial branch or wholly-owned subsidiary of an overseas business that has not yet started trading in the UK.",
    eligibility: "CoS from a provisional/expansion-licensed entity, UK footprint proof (Companies House registration or commercial lease), 12+ months employment with overseas parent company, and salary £48,500+ (or going rate).",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/uk-expansion-worker-visa"
  },
  {
    id: "in-to-gb-work-ukw-gbm-ss",
    officialCode: "UKW-GBM-SS",
    officialName: "Global Business Mobility – Service Supplier Visa",
    name: "Global Business Mobility – Service Supplier",
    fee: "£298",
    validity: "6 or 12 months",
    stay: "6 to 12 months",
    processing: "3 weeks",
    purpose: "Temporary assignment to the UK for contractual service suppliers (employed by an overseas company) or independent professionals delivering services covered by an eligible UK international trade agreement.",
    eligibility: "CoS from the UK contracting entity, contract registered with Home Office under a qualifying Free Trade Agreement (e.g. GATS, EU-UK TCA, CARIFORUM), 12+ months overseas employment, and university degree or technical qualification.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/service-supplier-visa"
  },
  {
    id: "in-to-gb-work-ukw-gbm-sw",
    officialCode: "UKW-GBM-SW",
    officialName: "Global Business Mobility – Secondment Worker Visa",
    name: "Global Business Mobility – Secondment Worker",
    fee: "£298",
    validity: "12 months (extendable up to 24 months)",
    stay: "Up to 2 years",
    processing: "3 weeks",
    purpose: "Secondment of overseas employees to a UK host organisation as part of a high-value commercial contract or investment worth at least £50 million.",
    eligibility: "CoS from the UK host business, Home Office registered high-value contract (£50M+), RQF Level 6 occupation, and 12+ months continuous overseas employment with the sending company.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/secondment-worker-visa"
  },
  {
    id: "in-to-gb-work-ukw-scu",
    officialCode: "UKW-SCU",
    officialName: "Scale-up Worker Visa",
    name: "Scale-up Worker Visa",
    fee: "£822 (£464-£715) + IHS £1,035/yr",
    validity: "2 years initial (+ 3 years extension; leads to ILR)",
    stay: "Up to 5 years (leads to ILR)",
    processing: "3 weeks",
    purpose: "Fast-track hybrid work route for talented individuals recruited by a high-growth UK Scale-up sponsor (20%+ annual growth); requires sponsorship for only the first 6 months, followed by full open-work flexibility.",
    eligibility: "CoS from an approved UK Scale-up sponsor for a minimum 6-month graduate-level (RQF 6) job paying at least £36,300/yr (or going rate), B1 English, and £1,270 maintenance funds.",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/scale-up-worker-visa"
  },
  {
    id: "in-to-gb-work-ukw-isp",
    officialCode: "UKW-ISP",
    officialName: "International Sportsperson Visa",
    name: "International Sportsperson Visa",
    fee: "£298 (<=12 mos) / £719 (>12 mos) + IHS",
    validity: "Up to 12 months or up to 3 years (leads to ILR)",
    stay: "Up to 3 years (extendable)",
    processing: "3 weeks",
    purpose: "Dedicated route for internationally established elite athletes and qualified sports coaches who will make a significant contribution to the development of their sport at the highest level in the UK.",
    eligibility: "Governing Body Endorsement (GBE) from the sport's approved UK governing body, CoS from the sponsoring UK sports club/body, and A1 English language proficiency (if applying for >12 months).",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/international-sportsperson-visa"
  },
  {
    id: "in-to-gb-work-ukw-t2m",
    officialCode: "UKW-T2M",
    officialName: "T2 Minister of Religion Visa",
    name: "T2 Minister of Religion",
    fee: "£719 (£464-£551) + IHS £1,035/yr",
    validity: "Up to 3 years and 1 month (leads to ILR)",
    stay: "Up to 3 years 1 month, extendable to 6 years",
    processing: "3 weeks",
    purpose: "Long-term pastoral religious appointment (leading worship, preaching, pastoral care, or missionary oversight) within a bona fide faith community in the UK.",
    eligibility: "CoS from a licensed religious sponsor, CEFR Level B2 English language proficiency in all 4 components, pay/conditions at least matching British clergy, and £1,270 maintenance.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/minister-of-religion-visa"
  },
  // UKTW — Temporary Work (6)
  {
    id: "in-to-gb-work-uktw-sea",
    officialCode: "UKTW-SEA",
    officialName: "Seasonal Worker Visa (Temporary Work)",
    name: "Seasonal Worker Visa (Horticulture & Poultry)",
    fee: "£298",
    validity: "Up to 6 months (Horticulture) / Oct–Dec (Poultry)",
    stay: "Up to 6 months",
    processing: "3 weeks",
    purpose: "Temporary seasonal employment in the UK edible/ornamental horticulture sector (picking fruit, vegetables, flowers for up to 6 months) or poultry production sector (2 October to 31 December).",
    eligibility: "Aged 18+, valid CoS from a Home Office approved Seasonal Worker scheme operator, and £1,270 held for 28 days (unless sponsor certifies maintenance).",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/seasonal-worker-visa"
  },
  {
    id: "in-to-gb-work-uktw-cha",
    officialCode: "UKTW-CHA",
    officialName: "Charity Worker Visa (Temporary Work)",
    name: "Charity Worker Visa",
    fee: "£298 + IHS £1,035/yr",
    validity: "Up to 12 months",
    stay: "Up to 12 months",
    processing: "3 weeks",
    purpose: "Undertake unpaid voluntary fieldwork directly contributing to the charitable purpose of a registered UK charity (excluding routine administrative, clerical, or fundraising roles).",
    eligibility: "Aged 18+, CoS from a licensed UK Charity Worker sponsor, unpaid role (reasonable subsistence expenses allowed), and £1,270 maintenance funds.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/temporary-worker-charity-worker-visa"
  },
  {
    id: "in-to-gb-work-uktw-cre",
    officialCode: "UKTW-CRE",
    officialName: "Creative Worker Visa (Temporary Work)",
    name: "Creative Worker Visa (Film, TV, Music & Arts)",
    fee: "£298 + IHS £1,035/yr",
    validity: "Up to 12 months (extendable to 24 months with same sponsor)",
    stay: "Up to 12–24 months",
    processing: "3 weeks",
    purpose: "Temporary work in the UK creative industries as an actor, musician, dancer, film/TV crew member, entertainer, or fashion model.",
    eligibility: "CoS from a licensed UK creative sponsor, compliance with Equity/PACT/BECTU creative codes of practice, unique contribution to the UK creative labour market, and £1,270 maintenance.",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/creative-worker-visa"
  },
  {
    id: "in-to-gb-work-uktw-gae",
    officialCode: "UKTW-GAE",
    officialName: "Government Authorised Exchange (GAE) Visa",
    name: "Government Authorised Exchange (GAE) Visa",
    fee: "£298 + IHS £1,035/yr",
    validity: "12 months (work experience) or 24 months (research/training)",
    stay: "Up to 12 or 24 months",
    processing: "3 weeks",
    purpose: "Temporary UK stay under an approved overarching Government Authorised Exchange scheme (e.g. BUNAC, Tier 5 internships, Bar Council, Medical Training Initiative, academic fellowships, or language programmes).",
    eligibility: "CoS from the overarching scheme body (not an individual employer directly), supernumerary role at RQF Level 3+, and £1,270 maintenance funds.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/government-authorised-exchange"
  },
  {
    id: "in-to-gb-work-uktw-rel",
    officialCode: "UKTW-REL",
    officialName: "Religious Worker Visa (Temporary Work)",
    name: "Religious Worker Visa",
    fee: "£298 + IHS £1,035/yr",
    validity: "Up to 24 months",
    stay: "Up to 24 months",
    processing: "3 weeks",
    purpose: "Temporary non-pastoral religious work in the UK (such as working in a religious order, monastery, temple, mosque, or translating religious texts, without leading a congregation).",
    eligibility: "Aged 18+, CoS from a licensed Religious Worker sponsor, resident labour market test / parity compliance, and £1,270 maintenance.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/religious-worker-visa"
  },
  {
    id: "in-to-gb-work-uktw-iaw",
    officialCode: "UKTW-IAW",
    officialName: "International Agreement Worker Visa (Temporary Work)",
    name: "International Agreement Worker Visa",
    fee: "£298 + IHS",
    validity: "Up to 2 years",
    stay: "6 to 24 months",
    processing: "3 weeks",
    purpose: "Work in the UK covered by international law or treaty, including employees of overseas governments, international organisations (UN/Commonwealth bodies), and private servants in diplomatic households.",
    eligibility: "Aged 18+, CoS from a licensed International Agreement sponsor (embassy, high commission, or international body), and £1,270 maintenance.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/international-agreement-worker-visa"
  },
  // UKWO — Other Work & Talent (6)
  {
    id: "in-to-gb-work-ukwo-gt",
    officialCode: "UKWO-GT",
    officialName: "Global Talent Visa",
    name: "Global Talent Visa (Tech, Science, Academia & Arts)",
    fee: "£716 (£524 endorsement + £192 visa) + IHS £1,035/yr",
    validity: "1 to 5 years (leads to ILR in 3 or 5 years)",
    stay: "Up to 5 years, open unsponsored work rights",
    processing: "Endorsement 4–8 weeks + Visa 3 weeks",
    purpose: "Prestigious unsponsored UK work visa for recognised global leaders (Exceptional Talent) and emerging leaders (Exceptional Promise) in science, engineering, medicine, humanities, digital technology (Tech Nation), or arts and culture.",
    eligibility: "Endorsement from Royal Society, Royal Academy of Engineering, British Academy, UKRI, Arts Council England, or Tech Nation — OR winner of an eligible Prestigious Prize (e.g. Nobel, Oscar, Turing, Booker).",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/global-talent"
  },
  {
    id: "in-to-gb-work-ukwo-hpi",
    officialCode: "UKWO-HPI",
    officialName: "High Potential Individual (HPI) Visa",
    name: "High Potential Individual (HPI) Visa",
    fee: "£822 + Ecctis £210 + IHS £1,035/yr",
    validity: "2 years (Bachelor/Master) / 3 years (PhD)",
    stay: "2 to 3 years (unsponsored open work)",
    processing: "3 weeks",
    purpose: "Unsponsored open work visa allowing recent graduates of the world's top 50 non-UK universities (as published annually on the GOV.UK Global Universities List) to live and work in the UK without a job offer.",
    eligibility: "Awarded an eligible bachelor's, master's, or PhD degree within the last 5 years from a university on the UKVI Global Universities List for that graduation year, B1 English, and £1,270 held for 28 days.",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/high-potential-individual-visa"
  },
  {
    id: "in-to-gb-work-ukwo-yms",
    officialCode: "UKWO-YMS",
    officialName: "Youth Mobility Scheme (YMS) Visa",
    name: "Youth Mobility Scheme Visa",
    fee: "£298 + IHS £776/yr",
    validity: "24 months (extendable to 36 months for AU/CA/NZ)",
    stay: "24 to 36 months",
    processing: "3 weeks",
    purpose: "Cultural exchange and open work visa allowing young nationals of participating countries (Australia, Canada, New Zealand, Japan, South Korea, Taiwan, Hong Kong, Singapore, Monaco, Iceland, Andorra, Uruguay) to live and work in the UK.",
    eligibility: "Aged 18–30 (or 18–35 for AU, CA, NZ, KR), citizen of an eligible YMS country or British Overseas citizen, no dependent children, and £2,530 held in savings for 28 consecutive days.",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/youth-mobility"
  },
  {
    id: "in-to-gb-work-ukwo-iyps",
    officialCode: "UKWO-IYPS",
    officialName: "India Young Professionals Scheme Visa",
    name: "India Young Professionals Scheme Visa (2,400 Ballot Places)",
    fee: "£298 + IHS £776/yr",
    validity: "24 months",
    stay: "Up to 24 months open work & study",
    processing: "3 weeks after ballot invitation",
    purpose: "Reciprocal UK-India Mobility Partnership route granting 3,000 Indian citizens aged 18–30 each year the right to live, work freely, and study in the UK for up to 2 years without employer sponsorship.",
    eligibility: "Indian citizen aged 18–30 selected in the official GOV.UK India Young Professionals Scheme ballot, holding a Bachelor's degree or above (RQF Level 6+), PCC, TB test, and £2,530 held in bank for 28 consecutive days.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/india-young-professionals-scheme-visa"
  },
  {
    id: "in-to-gb-work-ukwo-anc",
    officialCode: "UKWO-ANC",
    officialName: "UK Ancestry Visa",
    name: "UK Ancestry Visa (5-Year Work & Settlement Route)",
    fee: "£637 + IHS £1,035/yr",
    validity: "5 years (leads to ILR settlement)",
    stay: "5 years unrestricted work & study",
    processing: "3 weeks",
    purpose: "Five-year unrestricted UK work, business, and study visa leading to Indefinite Leave to Remain (ILR) for Commonwealth citizens with a UK-born grandparent.",
    eligibility: "Commonwealth citizen aged 17+, full birth certificates proving at least one grandparent was born in the UK, Channel Islands, Isle of Man (or in Ireland before 31 March 1922), and ability/intention to work in the UK.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/ancestry-visa"
  },
  {
    id: "in-to-gb-work-ukwo-odw",
    officialCode: "UKWO-ODW",
    officialName: "Overseas Domestic Worker Visa",
    name: "Overseas Domestic Worker Visa",
    fee: "£637",
    validity: "Up to 6 months",
    stay: "Up to 6 months (must return with employer)",
    processing: "3 weeks",
    purpose: "Allows private domestic staff (cleaners, chauffeurs, cooks, personal care staff, and nannies) who have worked for their overseas employer for at least 12 months to accompany their employer on a short visit to the UK.",
    eligibility: "Employed by the same employer for 12+ months outside the UK, signed Appendix Domestic Worker contract confirming UK National Minimum Wage compliance, and travelling with employer.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/domestic-workers-in-a-private-household-visa"
  },
  // UKL — Legacy & Closed Work Routes (10)
  {
    id: "in-to-gb-work-ukl-t1g",
    officialCode: "UKL-T1G",
    officialName: "Tier 1 (General) Highly Skilled Migrant Route (Closed)",
    name: "Tier 1 (General) Visa (Closed Legacy Route)",
    fee: "Closed (Legacy Route)",
    validity: "Closed to new applications & extensions",
    stay: "Historic route only",
    processing: "Closed",
    purpose: "Historic points-based unsponsored work route for highly skilled migrants; permanently closed to new applicants in 2011 and closed for settlement in 2018.",
    eligibility: "Closed legacy route; retained in directory for historical immigration status verification.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/browse/visas-immigration/work-visas"
  },
  {
    id: "in-to-gb-work-ukl-t1e",
    officialCode: "UKL-T1E",
    officialName: "Tier 1 (Entrepreneur) Work/Business Route (Closed)",
    name: "Tier 1 (Entrepreneur) (UKL Legacy Classification)",
    fee: "Closed (Legacy Route)",
    validity: "Closed",
    stay: "Historic route only",
    processing: "Closed",
    purpose: "Historic £200,000 / £50,000 points-based business & work route; closed to new applicants and replaced by the Innovator Founder Visa.",
    eligibility: "Closed legacy route; current entrepreneurs apply under Innovator Founder (UKB-IF).",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/tier-1-entrepreneur"
  },
  {
    id: "in-to-gb-work-ukl-t1ge",
    officialCode: "UKL-T1GE",
    officialName: "Tier 1 (Graduate Entrepreneur) Route (Closed)",
    name: "Tier 1 (Graduate Entrepreneur) (UKL Legacy Classification)",
    fee: "Closed (Legacy Route)",
    validity: "Closed",
    stay: "Historic route only",
    processing: "Closed",
    purpose: "Historic post-study entrepreneurship route endorsed by UK Higher Education Institutions; closed and replaced by Innovator Founder and Graduate routes.",
    eligibility: "Closed legacy route.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/tier-1-graduate-entrepreneur-visa"
  },
  {
    id: "in-to-gb-work-ukl-t2g",
    officialCode: "UKL-T2G",
    officialName: "Tier 2 (General) Sponsored Work Visa (Legacy)",
    name: "Tier 2 (General) Visa (Replaced by Skilled Worker)",
    fee: "Replaced by Skilled Worker (UKW-SWK)",
    validity: "Legacy",
    stay: "Existing leave counts toward 5-year Skilled Worker ILR",
    processing: "Replaced by UKW-SWK",
    purpose: "Pre-December 2020 sponsored skilled work route; officially replaced by the Skilled Worker Visa (UKW-SWK). Time spent on Tier 2 (General) counts toward 5-year ILR.",
    eligibility: "New applicants apply under Skilled Worker (UKW-SWK).",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/skilled-worker-visa"
  },
  {
    id: "in-to-gb-work-ukl-t2ict",
    officialCode: "UKL-T2ICT",
    officialName: "Tier 2 (Intra-Company Transfer) Visa (Legacy)",
    name: "Tier 2 Intra-Company Transfer (Replaced by GBM Routes)",
    fee: "Replaced by GBM Senior/Specialist (UKW-GBM-SSW)",
    validity: "Legacy",
    stay: "Transitional extensions only",
    processing: "Replaced by UKW-GBM-SSW",
    purpose: "Legacy Tier 2 multinational corporate transfer route; replaced in April 2022 by the Global Business Mobility – Senior or Specialist Worker and Graduate Trainee routes.",
    eligibility: "New applicants apply under Global Business Mobility (UKW-GBM-SSW / UKW-GBM-GT).",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/senior-specialist-worker-visa"
  },
  {
    id: "in-to-gb-work-ukl-t2m",
    officialCode: "UKL-T2M",
    officialName: "Tier 2 (Minister of Religion) (Legacy PBS Naming)",
    name: "Tier 2 Minister of Religion (Legacy Naming)",
    fee: "See T2 Minister of Religion (UKW-T2M)",
    validity: "Legacy naming",
    stay: "Up to 6 years",
    processing: "3 weeks",
    purpose: "Legacy Points-Based System naming for pastoral clergy sponsorship; rebranded under current Immigration Rules as T2 Minister of Religion (UKW-T2M).",
    eligibility: "Apply under T2 Minister of Religion (UKW-T2M).",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/minister-of-religion-visa"
  },
  {
    id: "in-to-gb-work-ukl-t2s",
    officialCode: "UKL-T2S",
    officialName: "Tier 2 (Sportsperson) Visa (Legacy)",
    name: "Tier 2 Sportsperson (Replaced by International Sportsperson)",
    fee: "Replaced by UKW-ISP",
    validity: "Legacy",
    stay: "Replaced by International Sportsperson",
    processing: "Replaced by UKW-ISP",
    purpose: "Legacy Tier 2 elite athlete and coach route; consolidated with Tier 5 Creative & Sporting (sporting sub-route) into the International Sportsperson Visa (UKW-ISP).",
    eligibility: "New applicants apply under International Sportsperson (UKW-ISP).",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/international-sportsperson-visa"
  },
  {
    id: "in-to-gb-work-ukl-t5",
    officialCode: "UKL-T5",
    officialName: "Tier 5 (Temporary Worker) Umbrella Route (Legacy)",
    name: "Tier 5 Temporary Worker (Replaced by UKTW Routes)",
    fee: "Replaced by UKTW (£298)",
    validity: "Legacy",
    stay: "12–24 months under UKTW",
    processing: "Replaced by UKTW",
    purpose: "Legacy Tier 5 temporary worker classification; replaced by the six dedicated Temporary Work routes (Charity, Creative, GAE, International Agreement, Religious, and Seasonal Worker).",
    eligibility: "Apply under the specific UKTW route matching your role.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/browse/visas-immigration/work-visas"
  },
  {
    id: "in-to-gb-work-ukl-ict",
    officialCode: "UKL-ICT",
    officialName: "Intra-Company Transfer (ICT) Visa (2020–2022 Legacy Route)",
    name: "Intra-Company Transfer (Legacy Transitional Route)",
    fee: "Replaced by Global Business Mobility",
    validity: "Legacy",
    stay: "Transitional extensions for existing holders",
    processing: "3–8 weeks",
    purpose: "Interim Intra-Company Transfer route operating between December 2020 and April 2022; now superseded by Global Business Mobility – Senior or Specialist Worker (UKW-GBM-SSW).",
    eligibility: "New overseas transferees apply under UKW-GBM-SSW.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/senior-specialist-worker-visa"
  },
  {
    id: "in-to-gb-work-ukl-sur",
    officialCode: "UKL-SUR",
    officialName: "Surinder Singh Route (Legacy Transitional Cases)",
    name: "Surinder Singh Route (Legacy Transitional Cases)",
    fee: "Free (Legacy Closed)",
    validity: "Closed",
    stay: "Historic transitional cases only",
    processing: "Closed",
    purpose: "Legacy EU free-movement derived route for family members who lived with a British citizen in an EEA country before Brexit; closed to new applications.",
    eligibility: "Closed except for narrow historic transitional/retained rights appeals.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/family-permit"
  }
];

const studentVisasRaw = [
  {
    id: "in-to-gb-student-uks-stu",
    officialCode: "UKS-STU",
    officialName: "Student Visa (Appendix Student)",
    name: "Student Visa (University & Higher Education)",
    fee: "£490 + IHS £776/year",
    validity: "Course duration + 4 months (if course >=12 mos)",
    stay: "Full course duration + post-course wrap-up",
    processing: "3 weeks (outside UK) / 8 weeks (inside UK)",
    purpose: "Full-time degree, postgraduate, or approved further education study in the UK at a Home Office licensed Student sponsor university or college (formerly Tier 4 General).",
    eligibility: "Aged 16+, unconditional offer with CAS reference number, B2/B1 IELTS for UKVI, ATAS (if applicable), TB certificate, and 28-day continuous funds covering 1st-year tuition + £1,334/mo (London) or £1,023/mo (outside London) for 9 months.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/student-visa"
  },
  {
    id: "in-to-gb-student-uks-chs",
    officialCode: "UKS-CHS",
    officialName: "Child Student Visa (Appendix Child Student)",
    name: "Child Student Visa (Ages 4–17 Independent Schools)",
    fee: "£490 + IHS £776/year",
    validity: "Up to 6 years (under 16) or 3 years (aged 16–17) + 4 months",
    stay: "Course duration + 4 months",
    processing: "3 weeks",
    purpose: "Full-time education for children aged between 4 and 17 at an independent fee-paying school in the UK that holds a Child Student sponsor licence.",
    eligibility: "Aged 4–17, unconditional offer & CAS from a licensed independent school, written parental consent, verified boarding/foster/parental care arrangements, and 28-day continuous maintenance funds.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/child-study-visa"
  },
  {
    id: "in-to-gb-student-uks-pch",
    officialCode: "UKS-PCH",
    officialName: "Parent of a Child Student Visa",
    name: "Parent of a Child Student Visa",
    fee: "£637 + IHS £1,035/year",
    validity: "Until the child turns 12 or finishes school",
    stay: "Matches child's permission up to age 12",
    processing: "3 weeks",
    purpose: "Allows one parent to accompany and care for a child aged between 4 and 11 who is attending an independent fee-paying day school in the UK on a Child Student visa.",
    eligibility: "Child is aged 4–11 holding/applying for a Child Student visa, the other parent lives abroad (not travelling to the UK), main home maintained outside the UK, and £1,560/month maintenance held for 28 days.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/parent-of-a-child-at-school-visa"
  },
  {
    id: "in-to-gb-student-uks-sst",
    officialCode: "UKS-SST",
    officialName: "Short-term Study Visa (English Language 6–11 Months)",
    name: "Short-term Study Visa (English Language 6–11 Months)",
    fee: "£200 + IHS £776",
    validity: "Course length + 30 days (up to 11 months max)",
    stay: "6 to 11 months",
    processing: "3 weeks",
    purpose: "Dedicated route for students aged 16+ coming to the UK solely to study an English language course lasting longer than 6 months and up to 11 months at an accredited institution.",
    eligibility: "Aged 16+, written acceptance from an accredited UK English language provider, course includes no other subjects, TB test certificate, and sufficient funds for tuition, accommodation, and return flight.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/visa-to-study-english"
  },
  {
    id: "in-to-gb-student-ukwo-grad",
    officialCode: "UKWO-GRAD",
    officialName: "Graduate Visa (Post-Study Work Route)",
    name: "Graduate Visa (2–3 Years Post-Study Work PSW)",
    fee: "£822 + IHS £1,035/year",
    validity: "2 years (Bachelor's/Master's) or 3 years (PhD)",
    stay: "2 to 3 years unsponsored open work",
    processing: "8 weeks (in-country application)",
    purpose: "Post-study unsponsored work visa allowing international graduates who have successfully completed a UK bachelor's degree, master's degree, PhD, or qualifying professional course to stay and work in any job at any skill level for 2–3 years.",
    eligibility: "Currently in the UK on a valid Student (or Tier 4) visa, university has notified the Home Office of successful course completion, and minimum study-in-UK residency requirement met.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/graduate-visa"
  },
  {
    id: "in-to-gb-student-ukl-t4",
    officialCode: "UKL-T4",
    officialName: "Tier 4 (General) Student Visa (Legacy Route)",
    name: "Tier 4 (General) Student (Replaced by Student Route)",
    fee: "Replaced by Student Visa (UKS-STU)",
    validity: "Legacy",
    stay: "Replaced by Appendix Student",
    processing: "3 weeks under UKS-STU",
    purpose: "Legacy Points-Based System student route operating until October 2020; replaced by the modern Student Visa (UKS-STU) under Appendix Student.",
    eligibility: "New students apply under the Student Visa (UKS-STU); existing Tier 4 permission holders remain eligible to switch to Graduate or Skilled Worker routes.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/student-visa"
  },
  {
    id: "in-to-gb-student-ukx-atas",
    officialCode: "UKX-ATAS",
    officialName: "ATAS Requirement (Academic Technology Approval Scheme)",
    name: "ATAS Clearance Certificate (Sensitive STEM Research)",
    fee: "Free",
    validity: "6 months to use in visa application",
    stay: "Matches course/research duration",
    processing: "20 to 30 working days",
    purpose: "Mandatory FCDO security clearance certificate (not a standalone visa) required BEFORE applying for a Student, Skilled Worker, or Academic Visitor visa if studying/researching sensitive postgraduate STEM/military-dual-use subjects (CAH3 codes).",
    eligibility: "Postgraduate master's, PhD, or visiting researcher in an ATAS-designated CAH3 subject code (aerospace, advanced materials, nuclear, cyber, biotech, mechanical/chemical engineering).",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/guidance/academic-technology-approval-scheme"
  },
  {
    id: "in-to-gb-student-ukx-s2",
    officialCode: "UKX-S2",
    officialName: "S2 Healthcare Visitor Route",
    name: "S2 Healthcare Visitor",
    fee: "Free",
    validity: "Up to 6 months",
    stay: "Up to 6 months (extendable in UK)",
    processing: "3 weeks",
    purpose: "Special healthcare visitor entry route for patients insured in an EU/EEA country or Switzerland holding a valid S2 certificate (portable document S2) for planned state-funded medical treatment in the UK, or accompanying an S2 patient.",
    eligibility: "Valid S2 certificate issued prior to Brexit transition cut-off or under covered reciprocal social security coordination arrangements.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/guidance/enter-the-uk-as-an-s2-healthcare-visitor"
  },
  {
    id: "in-to-gb-student-ukx-exm",
    officialCode: "UKX-EXM",
    officialName: "Exempt Persons / Diplomatic and Official Status",
    name: "Exempt Persons / Diplomatic & Official Vignette",
    fee: "Free",
    validity: "Duration of diplomatic/official posting",
    stay: "Duration of posting or study exemption",
    processing: "2–3 weeks",
    purpose: "Special immigration exemption vignette for foreign diplomats, consular staff, heads of state, members of international organisations, and eligible family members who are exempt from UK immigration control under the Immigration Act 1971.",
    eligibility: "Official diplomatic note (Note Verbale) from foreign Ministry of Foreign Affairs or accredited international organisation.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/exempt-vignette"
  },
  {
    id: "in-to-gb-student-uks-tier4",
    officialCode: "UKS-TIER4",
    officialName: "Tier 4 Student (Legacy Student & Child Student Route)",
    name: "Tier 4 Student (Legacy Catalogue Reference)",
    fee: "Replaced by UKS-STU / UKS-CHS",
    validity: "Legacy",
    stay: "Replaced by Student / Child Student",
    processing: "Legacy",
    purpose: "Historic Tier 4 Student & Tier 4 (Child) Student directory classification; replaced by the Student (UKS-STU) and Child Student (UKS-CHS) routes.",
    eligibility: "Apply under UKS-STU or UKS-CHS.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/student-visa"
  }
];

const familyVisasRaw = [
  // UKF — Family & Dependants (8)
  {
    id: "in-to-gb-family-ukf-part",
    officialCode: "UKF-PART",
    officialName: "Family Visa – Partner or Spouse (Appendix FM)",
    name: "Family Visa – Partner or Spouse",
    fee: "£1,846 (outside UK) / £1,258 (inside UK) + IHS £1,035/yr",
    validity: "33 months (entry clearance) / 30 months (extension)",
    stay: "2.5 years renewable (leads to ILR in 5 years)",
    processing: "12 weeks (outside UK) / 8 weeks (inside UK)",
    purpose: "Join or remain with your spouse, civil partner, or unmarried partner (2+ years durable relationship) who is a British citizen, settled in the UK (ILR/EUSS), or holds qualifying refugee/humanitarian status.",
    eligibility: "Genuine and subsisting relationship, Sponsor meets £29,000 Minimum Income Requirement (or £88,500 cash savings held 6 months), adequate UK accommodation, A1 English (A2 for extension), and TB test.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/uk-family-visa/partner-spouse"
  },
  {
    id: "in-to-gb-family-ukf-fiance",
    officialCode: "UKF-FIANCE",
    officialName: "Family Visa – Fiancé(e) or Proposed Civil Partner",
    name: "Family Visa – Fiancé(e) or Proposed Civil Partner",
    fee: "£1,846 (No IHS on initial 6-month entry)",
    validity: "6 months",
    stay: "6 months to marry, then switch to Spouse Visa in UK",
    processing: "12 weeks",
    purpose: "Enter the UK for up to 6 months to marry or form a civil partnership with your British or UK-settled partner, and then apply inside the UK to extend stay on the 5-year Spouse/Partner route.",
    eligibility: "Both partners free to marry within 6 months of arrival, met in person, £29,000 Minimum Income Requirement (or £88,500 savings), A1 English proficiency, and TB test.",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/uk-family-visa/partner-spouse"
  },
  {
    id: "in-to-gb-family-ukf-child",
    officialCode: "UKF-CHILD",
    officialName: "Family Visa – Child Dependant (Appendix FM)",
    name: "Family Visa – Child",
    fee: "£1,846 (outside UK) / £1,258 (in UK) + IHS £776/yr",
    validity: "Matches parent's permission or Indefinite Leave to Enter",
    stay: "Matches parent (leads to settlement)",
    processing: "12 weeks",
    purpose: "Allows a dependent child under 18 (or over 18 if already granted leave as a child in the UK) to join or stay with their parent(s) in the UK.",
    eligibility: "Under 18, not married or living an independent life, both parents settled/applying OR UK parent has sole responsibility, and financial/adequate maintenance requirement met.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/uk-family-visa/child"
  },
  {
    id: "in-to-gb-family-ukf-parent",
    officialCode: "UKF-PARENT",
    officialName: "Family Visa – Parent of a Child in the UK",
    name: "Family Visa – Parent",
    fee: "£1,846 (outside UK) / £1,258 (in UK) + IHS £1,035/yr",
    validity: "33 months (outside UK) / 30 months (inside UK)",
    stay: "2.5 years renewable (leads to ILR)",
    processing: "12 weeks",
    purpose: "Move to or remain in the UK to care for your child who is under 18 and is a British citizen, settled in the UK, or has lived in the UK continuously for 7+ years (where you are not in a partner relationship with the child's other parent).",
    eligibility: "Sole parental responsibility or direct in-person access rights (court order/agreement), active role in the child's upbringing, adequate maintenance & accommodation without public funds, and A1 English.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/uk-family-visa/parent"
  },
  {
    id: "in-to-gb-family-ukf-adult",
    officialCode: "UKF-ADULT",
    officialName: "Family Visa – Adult Dependent Relative (ADR)",
    name: "Family Visa – Adult Dependent Relative",
    fee: "£3,250",
    validity: "Indefinite Leave to Enter (if sponsor is British/settled)",
    stay: "Permanent / matches sponsor",
    processing: "12 to 24 weeks",
    purpose: "Allows an elderly parent, grandparent, sibling, or adult son/daughter who requires long-term personal care due to age, illness, or disability to be cared for in the UK by a British or settled relative.",
    eligibility: "Medical proof that the applicant requires long-term day-to-day personal care to perform everyday tasks, proof such care is either unavailable or unaffordable in the home country even with the UK sponsor's financial help, and a signed 5-year maintenance undertaking.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/uk-family-visa/adult-dependent-relative"
  },
  {
    id: "in-to-gb-family-ukf-depend",
    officialCode: "UKF-DEPEND",
    officialName: "Dependant Partner or Child on a Work or Study Route",
    name: "Dependant Partner / Child on Work or Study Route",
    fee: "£284 - £1,639 (matches main applicant) + IHS",
    validity: "Matches main visa holder's permission",
    stay: "Full work & study rights (with route rules)",
    processing: "3 weeks (outside UK) / 8 weeks (inside UK)",
    purpose: "Allows the spouse, civil partner, unmarried partner (2+ years), and dependent children under 18 to accompany or join a main visa holder on Skilled Worker, Global Talent, Scale-up, GBM, Innovator Founder, or eligible Postgraduate Research Student routes.",
    eligibility: "Genuine relationship with main applicant on an eligible route (Note: since 2024, new Care Workers SOC 6145/6146 and non-research Master's students cannot bring new dependants), plus £285 partner / £315 first child / £200 subsequent child maintenance.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/skilled-worker-visa/your-partner-and-children"
  },
  {
    id: "in-to-gb-family-ukf-private",
    officialCode: "UKF-PRIVATE",
    officialName: "Private Life Route (Appendix Private Life)",
    name: "Private Life Route (7-Year Child / Half-Life / 20-Year)",
    fee: "£1,258 + IHS £1,035/yr (Fee waiver available if destitute)",
    validity: "30 months or 60 months (leads to ILR)",
    stay: "2.5 or 5 years leading to settlement",
    processing: "8 to 12 months",
    purpose: "In-country permission to stay and settle based on strong private life established in the UK under Article 8 ECHR (children who have lived in the UK for 7 continuous years, young adults aged 18–24 who spent half their life in the UK, or adults with 20 years residence or very significant obstacles to integration abroad).",
    eligibility: "Meet continuous UK residence criteria under Appendix Private Life (7 years as child, half-life aged 18–24, 20 years continuous residence, or very significant obstacles to reintegration).",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/uk-family-visa/private-life"
  },
  {
    id: "in-to-gb-family-ukf-setl",
    officialCode: "UKF-SETL",
    officialName: "Family Route Settlement (ILR – Form SET(M))",
    name: "Family Route Settlement (ILR – Partner/Parent/Child)",
    fee: "£2,885",
    validity: "Indefinite Leave to Remain (Permanent)",
    stay: "Permanent settlement",
    processing: "Up to 6 months (Super Priority 24h available)",
    purpose: "Permanent settlement (Indefinite Leave to Remain) after completing 5 years (or 10 years) on a UK Family visa as a partner, spouse, parent, or dependent child.",
    eligibility: "5 years (60 months) continuous residence on the 5-year partner/parent route, continuing genuine relationship, £29,000 MIR (or £18,600 transitional if on route before 11 April 2024), Life in the UK Test pass, and B1 English.",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/indefinite-leave-to-remain-family"
  },
  // UKEU — EU, EEA & Swiss Routes (5)
  {
    id: "in-to-gb-family-ukeu-euss",
    officialCode: "UKEU-EUSS",
    officialName: "EU Settlement Scheme (EUSS) – Settled Status",
    name: "EU Settlement Scheme – Settled Status (ILR)",
    fee: "Free",
    validity: "Indefinite Leave to Remain (Permanent)",
    stay: "Permanent right to live & work in the UK",
    processing: "4 to 8 weeks",
    purpose: "Permanent Indefinite Leave to Remain under Appendix EU for EU, EEA, or Swiss citizens (who began living in the UK by 31 December 2020) and their eligible joining family members after completing 5 years continuous UK residence.",
    eligibility: "5 years continuous residence in the UK (at least 6 months in every 12-month period) as an EEA/Swiss citizen resident by 31 Dec 2020 or as their qualifying family member.",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/settled-status-eu-citizens-families"
  },
  {
    id: "in-to-gb-family-ukeu-pre",
    officialCode: "UKEU-PRE",
    officialName: "EU Settlement Scheme (EUSS) – Pre-Settled Status",
    name: "EU Settlement Scheme – Pre-Settled Status",
    fee: "Free",
    validity: "5 years (automatically extended by 5 years before expiry)",
    stay: "Limited leave leading to Settled Status after 5 years",
    processing: "4 to 8 weeks",
    purpose: "Limited permission to live, work, and study in the UK under Appendix EU for eligible EEA/Swiss citizens and joining close family members who have not yet completed 5 years continuous UK residence.",
    eligibility: "Qualifying joining family member (spouse, civil partner, durable partner, child, or dependent parent) where the family relationship existed by 31 December 2020 (or child born/adopted later) and continues to exist.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/settled-status-eu-citizens-families"
  },
  {
    id: "in-to-gb-family-ukeu-fp",
    officialCode: "UKEU-FP",
    officialName: "EU Settlement Scheme Family Permit (Appendix EU (Family Permit))",
    name: "EU Settlement Scheme (EUSS) Family Permit",
    fee: "Free",
    validity: "4 to 6 months entry clearance",
    stay: "Enter UK and apply for EUSS Pre-Settled/Settled Status within 3 months",
    processing: "6 to 12 weeks",
    purpose: "Free entry clearance permit enabling eligible non-EEA and EEA close family members living outside the UK to travel to the UK to join or accompany their EEA/Swiss sponsor who holds EUSS status.",
    eligibility: "Sponsor holds valid EUSS Settled or Pre-settled status (having resided in the UK before 31 Dec 2020), and family relationship (spouse/partner/child/dependent parent) existed by 31 Dec 2020 (or newborn child).",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/family-permit"
  },
  {
    id: "in-to-gb-family-ukeu-fw",
    officialCode: "UKEU-FW",
    officialName: "Frontier Worker Permit (Citizens' Rights Frontier Workers)",
    name: "Frontier Worker Permit (EU/EEA/Swiss Cross-Border)",
    fee: "Free",
    validity: "5 years (Workers) / 2 years (Self-employed)",
    stay: "Work in UK while remaining primarily resident outside the UK",
    processing: "3 to 4 weeks",
    purpose: "Permit for EU, EEA, and Swiss citizens who are primarily resident outside the UK (spending <180 days/yr in the UK or returning home at least once every 6 months) and were employed or self-employed in the UK before 31 December 2020.",
    eligibility: "EU/EEA/Swiss citizen, primarily resident outside the UK, carried out genuine and effective work in the UK before 31 December 2020, and continued working in the UK at least once every 12 months since.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/frontier-worker-permit"
  },
  {
    id: "in-to-gb-family-ukeu-sur",
    officialCode: "UKEU-SUR",
    officialName: "Surinder Singh / Retained Rights Cases (EUSS)",
    name: "Surinder Singh / Retained Rights Cases",
    fee: "Free",
    validity: "Legacy / Transitional EUSS cases",
    stay: "Settled or Pre-settled status if eligible",
    processing: "8 weeks",
    purpose: "Legacy transitional EUSS provisions for family members who retained a right of residence (following death of EEA sponsor, divorce after 3+ years of marriage, or domestic abuse) or historic Surinder Singh transitional cases.",
    eligibility: "Meet specific retained rights criteria under Appendix EU or transitional protection rules.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/settled-status-eu-citizens-families"
  },
  // UKH — Hong Kong BN(O) & Ukraine (5)
  {
    id: "in-to-gb-family-ukh-bno",
    officialCode: "UKH-BNO",
    officialName: "Hong Kong British National (Overseas) BN(O) Visa",
    name: "Hong Kong British National (Overseas) BN(O) Visa",
    fee: "£180 (30 months) / £250 (5 years) + IHS £1,035/yr",
    validity: "30 months or 5 years (leads to ILR & British Citizenship)",
    stay: "Up to 5 years with full work & study rights",
    processing: "12 weeks",
    purpose: "Dedicated immigration and settlement pathway for Hong Kong British National (Overseas) status holders, their adult children born on or after 1 July 1997, and their qualifying family members to live, work, and study in the UK.",
    eligibility: "BN(O) citizen (or adult child of a BN(O) citizen born on/after 1 July 1997), ordinarily resident in Hong Kong or the UK, TB test certificate, and 6 months maintenance funds.",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/british-national-overseas-bno-visa"
  },
  {
    id: "in-to-gb-family-ukh-uep",
    officialCode: "UKH-UEP",
    officialName: "Ukraine Permission Extension (UPE) Scheme",
    name: "Ukraine Permission Extension Scheme (18-Month Extension)",
    fee: "Free (IHS Exempt)",
    validity: "18 months additional permission",
    stay: "18 months with full work, study & benefits access",
    processing: "4 to 8 weeks",
    purpose: "Provides an additional 18 months of permission to stay in the UK for Ukrainian nationals and their eligible family members who were previously granted permission under one of the UK's Ukraine schemes.",
    eligibility: "Currently in the UK holding valid permission under the Homes for Ukraine Sponsorship Scheme, Ukraine Family Scheme, or Ukraine Extension Scheme, applying within the final 3 months before expiry.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/guidance/applying-to-the-ukraine-permission-extension-scheme"
  },
  {
    id: "in-to-gb-family-ukh-hf",
    officialCode: "UKH-HF",
    officialName: "Homes for Ukraine Sponsorship Scheme",
    name: "Homes for Ukraine Sponsorship Scheme",
    fee: "Free (IHS Exempt)",
    validity: "18 months (for new applications)",
    stay: "18 months with right to work, study & access public funds",
    processing: "3 weeks",
    purpose: "Humanitarian sponsorship route allowing Ukrainian nationals and their immediate family members to come to the UK when sponsored by an eligible approved host in the UK offering accommodation for at least 6 months.",
    eligibility: "Ukrainian national (or immediate family member) who was resident in Ukraine prior to 1 January 2022, with an approved UK sponsor holding British citizenship or settled status.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/guidance/apply-for-a-visa-under-the-ukraine-sponsorship-scheme"
  },
  {
    id: "in-to-gb-family-ukh-ufs",
    officialCode: "UKH-UFS",
    officialName: "Ukraine Family Scheme (Closed Historic Route)",
    name: "Ukraine Family Scheme (Closed Legacy Route)",
    fee: "Free (Closed to new applications)",
    validity: "Closed (Existing holders extend via UKH-UEP)",
    stay: "Historic 3-year permission",
    processing: "Closed",
    purpose: "Humanitarian family route that allowed Ukrainian nationals to join family members in the UK; closed to new applications on 19 February 2024 (existing holders extend via the Ukraine Permission Extension Scheme UKH-UEP).",
    eligibility: "Closed to new applications; existing holders apply under UKH-UEP.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/guidance/apply-for-a-ukraine-family-scheme-visa"
  },
  {
    id: "in-to-gb-family-ukh-ukr",
    officialCode: "UKH-UKR",
    officialName: "Ukraine Extension Scheme (Transitional Permission Cases)",
    name: "Ukraine Extension / Transitional Permission Cases",
    fee: "Free",
    validity: "Legacy / Children born in the UK only",
    stay: "Matches parent's Ukraine scheme permission",
    processing: "4 to 8 weeks",
    purpose: "Legacy Ukraine Extension Scheme; closed to most new adult applicants in May 2024, remaining open for children born in the UK to parents holding Ukraine scheme permission.",
    eligibility: "Child born in the UK to a Ukrainian parent holding permission under a Ukraine scheme (adults apply under UKH-UEP).",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/guidance/apply-to-stay-in-the-uk-under- the-ukraine-extension-scheme"
  },
  // UKC — Commonwealth & Ancestry (4)
  {
    id: "in-to-gb-family-ukc-anc",
    officialCode: "UKC-ANC",
    officialName: "UK Ancestry Visa (Commonwealth Lineage)",
    name: "UK Ancestry Visa (Commonwealth Family Lineage)",
    fee: "£637 + IHS £1,035/yr",
    validity: "5 years (leads to ILR)",
    stay: "5 years unrestricted residence & work",
    processing: "3 weeks",
    purpose: "Commonwealth lineage route allowing citizens of Commonwealth countries (including India, Canada, Australia, New Zealand, South Africa, etc.) with a UK-born grandparent to live, work, and bring family dependants to the UK.",
    eligibility: "Commonwealth citizen aged 17+, full birth & marriage certificates tracing lineage to a grandparent born in the UK, Channel Islands, or Isle of Man, and intention to work.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/ancestry-visa"
  },
  {
    id: "in-to-gb-family-ukc-bno",
    officialCode: "UKC-BNO",
    officialName: "British National (Overseas) Visa (Commonwealth Catalogue)",
    name: "British National (Overseas) Visa (UKC Route)",
    fee: "£180 (30 mos) / £250 (5 yrs) + IHS",
    validity: "30 months or 5 years",
    stay: "Up to 5 years (leads to ILR)",
    processing: "12 weeks",
    purpose: "Commonwealth & BN(O) household member route for Hong Kong BN(O) status holders and their dependent partners, children, and adult dependent relatives.",
    eligibility: "BN(O) status holder or eligible household/family member meeting ordinary residence and maintenance rules.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/british-national-overseas-bno-visa"
  },
  {
    id: "in-to-gb-family-ukc-right",
    officialCode: "UKC-RIGHT",
    officialName: "Right of Abode (Immigration Act 1971 Statutory Status)",
    name: "Right of Abode (Unrestricted UK Residence Status)",
    fee: "Free (Statutory Status)",
    validity: "Lifetime",
    stay: "Unrestricted right to live & work in the UK",
    processing: "Automatic if British Citizen; or apply for UKC-ROA-CTR",
    purpose: "Statutory immigration status under Section 2 of the Immigration Act 1971 conferring complete freedom from UK immigration control (held automatically by all British citizens and by certain Commonwealth citizens who held the right before 1 January 1983).",
    eligibility: "British citizen OR female Commonwealth citizen married before 1 Jan 1983 to a man with Right of Abode OR Commonwealth citizen born before 1 Jan 1983 to a parent born in the UK.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/right-of-abode"
  },
  {
    id: "in-to-gb-family-ukc-roa-ctr",
    officialCode: "UKC-ROA-CTR",
    officialName: "Certificate of Entitlement to the Right of Abode",
    name: "Certificate of Entitlement to Right of Abode",
    fee: "£550",
    validity: "Valid until expiry of the passport it is placed in",
    stay: "Permanent / Unrestricted",
    processing: "3 to 6 weeks",
    purpose: "Official vignette sticker placed inside a foreign/Commonwealth passport proving the holder has the statutory Right of Abode in the UK and is exempt from UK immigration control.",
    eligibility: "Hold Right of Abode in the UK, do not currently hold a valid British passport (you cannot hold both a British passport and a Certificate of Entitlement simultaneously).",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/right-of-abode/apply-for-a-certificate-of-entitlement"
  },
  // UKL & Special Family Routes (5 to reach 27)
  {
    id: "in-to-gb-family-ukl-ukfam",
    officialCode: "UKL-UKFAM",
    officialName: "UK Family Permit (Old EEA Regulations Legacy)",
    name: "UK Family Permit (Old EEA Rules – Legacy)",
    fee: "Closed (Replaced by EUSS Family Permit)",
    validity: "Closed",
    stay: "Legacy transitional cases only",
    processing: "Closed",
    purpose: "Historic EEA Family Permit issued under the Immigration (European Economic Area) Regulations 2016; closed on 30 June 2021 and replaced by the EU Settlement Scheme Family Permit (UKEU-FP).",
    eligibility: "Closed legacy route; apply under EUSS Family Permit (UKEU-FP) if eligible.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/family-permit"
  },
  {
    id: "in-to-gb-family-ukl-dv",
    officialCode: "UKL-DV",
    officialName: "Victim of Domestic Violence & Abuse Concession / Settlement",
    name: "Domestic Violence Concession & Settlement Provisions",
    fee: "Free (MVDAC 3-Month Concession) / £2,885 ILR (Fee Waiver if destitute)",
    validity: "3 months concession (MVDAC) -> Permanent ILR",
    stay: "Permanent Indefinite Leave to Remain",
    processing: "5 days (MVDAC) / 6 months (ILR)",
    purpose: "Migrant Victims of Domestic Abuse Concession (MVDAC) and Appendix Victim of Domestic Abuse settlement route allowing partners whose relationship with a British/settled citizen (or refugee/HM Forces member) permanently broke down due to domestic abuse to access public funds and apply directly for ILR.",
    eligibility: "Last granted permission as a partner/spouse of a British citizen, settled person, or qualifying sponsor, and the relationship broke down permanently as a result of domestic violence or abuse.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/indefinite-leave-to-remain-domestic-violence-abuse"
  },
  {
    id: "in-to-gb-family-ukf-reunion",
    officialCode: "UKF-REU",
    officialName: "Refugee & Humanitarian Protection Family Reunion Route",
    name: "Refugee Family Reunion Visa (Appendix Family Reunion)",
    fee: "Free (No application fee or IHS)",
    validity: "Matches sponsor's refugee/protection leave",
    stay: "Matches sponsor (leads to ILR)",
    processing: "12 to 24 weeks",
    purpose: "Allows the pre-flight spouse/partner and children under 18 of a person granted Refugee status or Humanitarian Protection in the UK to reunite with their family sponsor in the UK free of charge.",
    eligibility: "Part of the refugee sponsor's family unit before the sponsor fled their country of origin to seek asylum, with relationship proof and TB test.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/settlement-refugee-or-humanitarian-protection/family-reunion"
  },
  {
    id: "in-to-gb-family-ukf-hmf",
    officialCode: "UKF-HMF",
    officialName: "HM Armed Forces Partner & Child Family Visa (Appendix Armed Forces)",
    name: "HM Armed Forces Partner & Child Family Route",
    fee: "£1,846 + IHS",
    validity: "Up to 5 years (leads to ILR)",
    stay: "5 years leading to settlement",
    processing: "12 weeks",
    purpose: "Dedicated family route under Appendix Armed Forces for partners and dependent children of British or Commonwealth members of His Majesty's Armed Forces (or Gurkhas).",
    eligibility: "Sponsor is a serving or discharged member of HM Armed Forces, genuine relationship, £29,000 financial requirement, and A1 English.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/armed-forces-family-visa"
  },
  {
    id: "in-to-gb-family-ukf-bereaved",
    officialCode: "UKF-BRV",
    officialName: "Bereaved Partner Settlement Route (Appendix Bereaved Partner)",
    name: "Bereaved Partner Settlement (Immediate ILR)",
    fee: "£2,885 (Fee waiver available if destitute)",
    validity: "Indefinite Leave to Remain (Permanent)",
    stay: "Permanent settlement",
    processing: "Up to 6 months",
    purpose: "Grants immediate Indefinite Leave to Remain (ILR) to a person in the UK on a Partner/Spouse visa whose British citizen or settled partner has passed away before the 5-year qualifying period ended.",
    eligibility: "In the UK with permission as a partner of a British citizen or settled person (or HM Armed Forces member), the partner has died, and the relationship was genuine and subsisting at the time of death.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/visas-partner-dies"
  }
];

const businessVisasRaw = [
  {
    id: "in-to-gb-business-ukb-if",
    officialCode: "UKB-IF",
    officialName: "Innovator Founder Visa (Appendix Innovator Founder)",
    name: "Innovator Founder Visa (Endorsed Startup & Business)",
    fee: "£1,191 (£1,020-£1,284) + £1,000 Endorsement + IHS £1,035/yr",
    validity: "3 years (leads directly to ILR settlement in 3 years!)",
    stay: "3 years, extendable or direct 3-year fast-track ILR",
    processing: "Endorsement 4–6 weeks + Visa 3 weeks",
    purpose: "Primary UK entrepreneur visa to establish and run an innovative, viable, and scalable business in the UK endorsed by an approved Endorsing Body; allows secondary skilled employment and leads to ILR in just 3 years.",
    eligibility: "Official Endorsement Letter from a Home Office approved Endorsing Body (Envestors, UK Endorsing Services, Innovator International, or GEP), CEFR Level B2 English (IELTS UKVI 5.5), £1,270 personal maintenance held 28 days, and £50k+ recommended business capital.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/innovator-founder-visa"
  },
  {
    id: "in-to-gb-business-ukb-start",
    officialCode: "UKB-START",
    officialName: "Start-up Visa (Closed Historic Route)",
    name: "Start-up Visa (Closed Legacy Route)",
    fee: "Closed (Replaced by Innovator Founder)",
    validity: "Closed to new applicants",
    stay: "Historic 2-year route",
    processing: "Closed",
    purpose: "Historic 2-year early-stage startup visa; closed to new applications in July 2023 and consolidated into the single Innovator Founder Visa (UKB-IF). Existing Start-up holders can switch to Innovator Founder.",
    eligibility: "Closed to new applicants; apply under Innovator Founder (UKB-IF).",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/start-up-visa"
  },
  {
    id: "in-to-gb-business-ukb-innov",
    officialCode: "UKB-INNOV",
    officialName: "Innovator Visa (Replaced by Innovator Founder)",
    name: "Innovator Visa (Old £50k Route – Legacy)",
    fee: "Closed (Replaced by UKB-IF)",
    validity: "Legacy (Existing holders eligible for 3-year ILR)",
    stay: "3 years",
    processing: "Closed to new entries",
    purpose: "Historic 2019–2023 Innovator route that required a mandatory £50,000 minimum investment; replaced in April 2023 by the more flexible Innovator Founder Visa (UKB-IF).",
    eligibility: "New founders apply under Innovator Founder (UKB-IF); existing Innovator holders remain eligible to apply for ILR after 3 years.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/innovator-visa"
  },
  {
    id: "in-to-gb-business-ukb-t1e",
    officialCode: "UKB-T1E",
    officialName: "Tier 1 (Entrepreneur) Visa (Closed Historic Route)",
    name: "Tier 1 (Entrepreneur) Visa (Closed Legacy Route)",
    fee: "Closed (Legacy Route)",
    validity: "Closed",
    stay: "Historic cases only",
    processing: "Closed",
    purpose: "Historic £200,000 / £50,000 Tier 1 Entrepreneur business visa; closed to new applications in March 2019 and replaced by the Innovator Founder route.",
    eligibility: "Closed legacy route.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/tier-1-entrepreneur"
  },
  {
    id: "in-to-gb-business-ukb-t1i",
    officialCode: "UKB-T1I",
    officialName: "Tier 1 (Investor) Visa (£2 Million Golden Visa – Closed)",
    name: "Tier 1 (Investor) Visa (Closed £2M Route)",
    fee: "Closed (Legacy Route)",
    validity: "Closed (Transitional extensions until Feb 2026 / ILR until Feb 2028)",
    stay: "Historic investor cases only",
    processing: "Closed to new applicants",
    purpose: "Historic £2 million UK Investor ('Golden Visa') route; closed to all new applicants on 17 February 2022. Existing Tier 1 Investor holders have transitional deadlines until February 2026 (extensions) and February 2028 (ILR).",
    eligibility: "Closed to new applicants; existing Tier 1 Investors must apply for extensions by 17 Feb 2026 and ILR by 17 Feb 2028.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/tier-1-investor"
  },
  {
    id: "in-to-gb-business-ukb-t1ge",
    officialCode: "UKB-T1GE",
    officialName: "Tier 1 (Graduate Entrepreneur) Visa (Closed Historic Route)",
    name: "Tier 1 (Graduate Entrepreneur) (Closed Legacy Route)",
    fee: "Closed (Legacy Route)",
    validity: "Closed",
    stay: "Historic route only",
    processing: "Closed",
    purpose: "Historic graduate business founder route closed in July 2019; replaced by the Graduate Visa (UKWO-GRAD) and Innovator Founder Visa (UKB-IF).",
    eligibility: "Closed legacy route.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/tier-1-graduate-entrepreneur-visa"
  },
  {
    id: "in-to-gb-business-ukwo-rep",
    officialCode: "UKWO-REP",
    officialName: "Representative of an Overseas Business (Sole Rep Legacy / Media Open)",
    name: "Representative of an Overseas Business (Sole Rep / Overseas Media)",
    fee: "£719 + IHS £1,035/yr",
    validity: "3 years initial (+ 2 years extension; leads to ILR)",
    stay: "Up to 5 years (leads to ILR)",
    processing: "3 weeks",
    purpose: "Sole Representative sub-route closed to new applicants in April 2022 (replaced by GBM UK Expansion Worker UKW-GBM-UEW), while the Overseas Newspaper, News Agency or Broadcasting Organisation Employee sub-route remains open for long-term UK postings.",
    eligibility: "Open for long-term UK correspondents/journalists of overseas media organisations (A1 English + £1,270 maintenance), and open for extensions/ILR for existing Sole Representatives.",
    popular: false,
    highlight: false,
    isActive: false,
    isLegacy: true,
    officialSource: "https://www.gov.uk/representative-overseas-business"
  },
  {
    id: "in-to-gb-business-ukwo-prt",
    officialCode: "UKWO-PRT",
    officialName: "Private Servant in a Diplomatic Household",
    name: "Private Servant in a Diplomatic Household",
    fee: "£637",
    validity: "Up to 2 years (renewable up to 5 years / posting duration)",
    stay: "Up to 5 years during diplomat's posting",
    processing: "3 weeks",
    purpose: "Allows private domestic staff (aged 18+) employed directly by an accredited foreign diplomat or senior international organisation official to work in the diplomat's private household in the UK.",
    eligibility: "Aged 18+, employed directly by the diplomat (not an agency), written employment terms meeting UK National Minimum Wage, and sponsorship under Appendix International Agreement.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/international-agreement-worker-visa"
  },
  {
    id: "in-to-gb-business-ukx-vip",
    officialCode: "UKX-VIP",
    officialName: "VIP Delegate Visa (Official State Delegation Route)",
    name: "VIP Delegate Visa (Accompanying Head of State / Minister)",
    fee: "Free",
    validity: "Duration of official state visit (up to 30 days)",
    stay: "Up to 1 month",
    processing: "Expedited diplomatic processing",
    purpose: "Streamlined entry visa route for official delegates, civil servants, and trade/security staff accompanying a foreign Head of State or serving government minister on an official visit to the UK.",
    eligibility: "Named on an official Note Verbale from the visiting government's Ministry of Foreign Affairs within the capped delegation allocation (20 delegates for Head of State; 10 for Minister).",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-vip-delegate-visa"
  }
];

const prVisasRaw = [
  // UKP — Protection & Humanitarian (7)
  {
    id: "in-to-gb-pr-ukp-asy",
    officialCode: "UKP-ASY",
    officialName: "Asylum Claim (1951 Refugee Convention Protection)",
    name: "Asylum Claim (International Protection in the UK)",
    fee: "Free",
    validity: "Assessed for 5-year Refugee Permission",
    stay: "Protection stay leading to ILR after 5 years",
    processing: "6 to 12+ months (Screening + Substantive Interview)",
    purpose: "Formal claim made inside the UK (or at a UK port of entry) for international protection under the 1951 UN Refugee Convention due to a well-founded fear of persecution for reasons of race, religion, nationality, political opinion, or membership of a particular social group.",
    eligibility: "Physically present in the UK, unable to return to country of nationality due to well-founded fear of persecution where state protection is unavailable.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/claim-asylum"
  },
  {
    id: "in-to-gb-pr-ukp-ref",
    officialCode: "UKP-REF",
    officialName: "Refugee Permission / Refugee Status (5-Year Protection Route)",
    name: "Refugee Permission / Refugee Status",
    fee: "Free (Settlement ILR after 5 years also Free)",
    validity: "5 years (leads to free ILR settlement)",
    stay: "5 years with full right to work, study & family reunion",
    processing: "Granted upon successful asylum decision",
    purpose: "Refugee status and 5 years permission to stay granted following a successful UK asylum claim or resettlement, conferring full work rights, access to public funds, Refugee Travel Document eligibility, and free Settlement (ILR) after 5 years.",
    eligibility: "Recognised as a refugee by the UK Home Office under Part 11 of the Immigration Rules.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/settlement-refugee-or-humanitarian-protection"
  },
  {
    id: "in-to-gb-pr-ukp-hum",
    officialCode: "UKP-HUM",
    officialName: "Humanitarian Protection (HP Permission)",
    name: "Humanitarian Protection",
    fee: "Free",
    validity: "5 years (leads to free ILR settlement)",
    stay: "5 years with full work & public funds access",
    processing: "Assessed alongside protection claim",
    purpose: "International protection granted to individuals in the UK who do not qualify as refugees under the 1951 Convention but would face a real risk of serious harm (death penalty, torture, inhuman/degrading treatment, or indiscriminate violence in armed conflict) if returned.",
    eligibility: "Real risk of serious harm under paragraph 339C of the Immigration Rules and no exclusion grounds apply.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/settlement-refugee-or-humanitarian-protection"
  },
  {
    id: "in-to-gb-pr-ukp-dlr",
    officialCode: "UKP-DLR",
    officialName: "Discretionary Leave (DL Outside the Rules)",
    name: "Discretionary Leave",
    fee: "Free / £1,258 (renewal)",
    validity: "Typically up to 30 months (renewable; leads to ILR after 6 or 10 yrs)",
    stay: "Limited leave with work permissions",
    processing: "3 to 6 months",
    purpose: "Exceptional limited permission to stay granted outside the standard Immigration Rules on compassionate, severe medical, or modern slavery/trafficking grounds where removal would be unjustifiably harsh.",
    eligibility: "Exceptional compassionate, medical (Article 3), or trafficking/modern slavery circumstances verified by the Home Office.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/government/collections/discretionary-leave"
  },
  {
    id: "in-to-gb-pr-ukp-hp",
    officialCode: "UKP-HP",
    officialName: "Human Rights Claim (Article 8 ECHR Family & Private Life)",
    name: "Human Rights Claim (FLR(FP) / FLR(HRO))",
    fee: "£1,258 + IHS £1,035/yr (Fee waiver available if destitute)",
    validity: "30 months (10-Year Route to ILR)",
    stay: "2.5 years renewable leading to ILR after 10 years",
    processing: "6 to 12 months",
    purpose: "Application to remain in the UK based on fundamental human rights grounds under the European Convention on Human Rights (primarily Article 8 right to respect for family and private life or Article 3 medical protection).",
    eligibility: "Unjustifiably harsh consequences or insurmountable obstacles to family/private life continuing outside the UK.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/remain-in-uk-family"
  },
  {
    id: "in-to-gb-pr-ukp-ar",
    officialCode: "UKP-AR",
    officialName: "Asylum / Protection Appeal & Further Submissions (Paragraph 353)",
    name: "Asylum / Protection Appeal & Further Submissions",
    fee: "Free (Appeal £80–£140 unless legally aided/exempt)",
    validity: "Procedural protection route",
    stay: "Section 3C protection during appeal",
    processing: "3 to 9 months",
    purpose: "First-tier Tribunal (Immigration and Asylum Chamber) appeals against a protection/human rights refusal and in-person Further Submissions (Fresh Claim under Paragraph 353) presenting new evidence not previously considered.",
    eligibility: "Right of appeal against a Home Office refusal decision OR significantly different new evidence creating a realistic prospect of success.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/immigration-asylum-tribunal"
  },
  {
    id: "in-to-gb-pr-ukp-reset",
    officialCode: "UKP-RESET",
    officialName: "UK Government Refugee Resettlement Schemes (UKRS / ACRS / ARAP)",
    name: "Resettlement Routes (UKRS, ACRS & ARAP)",
    fee: "Free",
    validity: "Indefinite Leave to Enter/Remain (Permanent Settlement)",
    stay: "Immediate Permanent Settlement on arrival",
    processing: "UNHCR / MOD / FCDO referral based",
    purpose: "Government-supported refugee resettlement pathways including the UK Resettlement Scheme (UKRS via UNHCR referral), Community Sponsorship, Mandate Resettlement, Afghan Citizens Resettlement Scheme (ACRS), and Afghan Relocations and Assistance Policy (ARAP).",
    eligibility: "Official referral by UNHCR, FCDO, or Ministry of Defence under an active UK resettlement programme.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/government/collections/uk-resettlement-programmes"
  },
  // UKR — Settlement & Long Residence (7)
  {
    id: "in-to-gb-pr-ukr-ilr",
    officialCode: "UKR-ILR",
    officialName: "Indefinite Leave to Remain (ILR – UK Permanent Residency)",
    name: "Indefinite Leave to Remain (ILR – UK Permanent Settlement)",
    fee: "£2,885 (+ £500 Priority / £1,000 Super Priority optional)",
    validity: "Permanent (Indefinite)",
    stay: "Permanent right to live, work, study & access benefits in the UK",
    processing: "Up to 6 months standard (24 hours with Super Priority)",
    purpose: "Flagship UK permanent residency status (Settlement) granting indefinite permission to live, work, and study in the UK without immigration restrictions, and serving as the final stepping stone to British Citizenship after 12 months.",
    eligibility: "5 years continuous lawful residence on an eligible work, family, or ancestry route (3 years on Global Talent / Innovator Founder; 10 years on Long Residence), <=180 days absence per 12 months, Life in the UK Test pass, and B1 English.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/indefinite-leave-to-remain"
  },
  {
    id: "in-to-gb-pr-ukr-lr",
    officialCode: "UKR-LR",
    officialName: "Long Residence ILR (10 Years Continuous Lawful Residence – Form SET(LR))",
    name: "Long Residence ILR (10-Year Lawful Residence Route)",
    fee: "£2,885",
    validity: "Permanent (Indefinite Leave to Remain)",
    stay: "Permanent settlement",
    processing: "Up to 6 months (Super Priority available)",
    purpose: "Permanent settlement (ILR) under Appendix Long Residence for individuals who have lived in the UK legally and continuously for at least 10 years across any combination of eligible long-term visas (including Student, Graduate, Skilled Worker, and Family visas; excludes Visitor/Seasonal leave).",
    eligibility: "10 years continuous lawful residence in the UK, have held your current permission for at least 12 months, absences within statutory limits (<=180 days in any 12-month period for absences after 11 April 2024), Life in the UK Test pass, and B1 English.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/long-residence"
  },
  {
    id: "in-to-gb-pr-ukr-setl",
    officialCode: "UKR-SETL",
    officialName: "Settlement on Work Route (Form SET(O) – Skilled Worker / Talent / Founder)",
    name: "Settlement on Work Route (Skilled Worker, Global Talent & Innovator ILR)",
    fee: "£2,885",
    validity: "Permanent (Indefinite Leave to Remain)",
    stay: "Permanent settlement",
    processing: "Up to 6 months (5-day Priority / 24h Super Priority available)",
    purpose: "Indefinite Leave to Remain (ILR) via Form SET(O) for main applicants and dependants completing 5 years on Skilled Worker, Health & Care Worker, Scale-up, T2 Minister, International Sportsperson, or UK Ancestry — or 3 years fast-track ILR on Global Talent and Innovator Founder.",
    eligibility: "3 or 5 years qualifying residence, employer confirmation that you are still needed and meet the ILR salary threshold (£38,700+ or SOC going rate / Healthcare scale), <=180 days absence per 12 months, Life in the UK Test, and B1 English.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/indefinite-leave-to-remain-tier-2-t2-skilled-worker-visa"
  },
  {
    id: "in-to-gb-pr-ukr-fam",
    officialCode: "UKR-FAM",
    officialName: "Settlement on Family Route (5-Year SET(M) & 10-Year SET(LR/FP))",
    name: "Settlement on Family Route (Partner, Parent & Child ILR)",
    fee: "£2,885",
    validity: "Permanent (Indefinite Leave to Remain)",
    stay: "Permanent settlement",
    processing: "Up to 6 months",
    purpose: "Indefinite Leave to Remain under Appendix FM for spouses, civil partners, unmarried partners, parents, and children who have completed their 5-year (2 × 2.5 years) or 10-year family route qualifying period in the UK.",
    eligibility: "Completed 60 months (5-year route) or 120 months (10-year route) on a family visa, continuing genuine relationship, financial requirement met (for 5-year route), Life in the UK Test, and B1 English.",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/indefinite-leave-to-remain-family"
  },
  {
    id: "in-to-gb-pr-ukr-private",
    officialCode: "UKR-PRIVATE",
    officialName: "Settlement on Private Life Route (Appendix Settlement Private Life)",
    name: "Settlement on Private Life Route (5-Year Child/Young Adult & 10-Year Adult)",
    fee: "£2,885",
    validity: "Permanent (Indefinite Leave to Remain)",
    stay: "Permanent settlement",
    processing: "Up to 6 months",
    purpose: "Indefinite Leave to Remain under Appendix Private Life — including accelerated 5-year ILR for children (7-year rule) and young adults (aged 18–24 half-life rule), and 10-year ILR for adults granted leave on private life grounds.",
    eligibility: "5 years continuous permission (for child/young adult private life grants) or 10 years continuous permission (for adult private life grants), Life in the UK Test, and B1 English.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/indefinite-leave-to-remain-private-life"
  },
  {
    id: "in-to-gb-pr-ukr-return",
    officialCode: "UKR-RETURN",
    officialName: "Returning Resident Visa (Appendix Returning Resident)",
    name: "Returning Resident Visa (Restore Lapsed ILR)",
    fee: "£637",
    validity: "Restores Indefinite Leave to Enter/Remain permanently",
    stay: "Permanent settlement restored",
    processing: "3 to 6 weeks",
    purpose: "Entry clearance visa for former UK settled residents (ILR holders) whose Indefinite Leave to Remain lapsed automatically after spending more than 2 continuous years outside the UK (or 5 years for EUSS Settled / 4 years for BNO).",
    eligibility: "Previously held unconditional ILR when leaving the UK, maintained strong continuing ties to the UK (family, property, business, or prolonged service abroad), and genuinely intend to return to live permanently in the UK.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/returning-resident-visa"
  },
  {
    id: "in-to-gb-pr-ukr-roa",
    officialCode: "UKR-ROA",
    officialName: "Right of Abode & Windrush Scheme Settlement",
    name: "Right of Abode & Windrush Settlement Status",
    fee: "Free (Windrush) / £550 (ROA Certificate)",
    validity: "Lifetime / Permanent",
    stay: "Unrestricted right to live and work in the UK",
    processing: "4 to 12 weeks",
    purpose: "Confirms existing statutory Right of Abode or grants free Indefinite Leave to Remain / British citizenship documentation under the Windrush Scheme for Commonwealth citizens who settled in the UK before 1973 (or arrived before 1988) and their children.",
    eligibility: "Qualifying Commonwealth heritage under Section 2 Immigration Act 1971 or Windrush Scheme residence criteria.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/windrush-prove-your-right-to-be-in-the-uk"
  },
  // UKN — Nationality & Citizenship + UKX Special Permissions (6 to reach exact 20)
  {
    id: "in-to-gb-pr-ukn-nat",
    officialCode: "UKN-NAT",
    officialName: "British Citizenship by Naturalisation (Form AN – British Nationality Act 1981)",
    name: "British Citizenship by Naturalisation (Form AN)",
    fee: "£1,630 (£1,500 fee + £130 Citizenship Ceremony)",
    validity: "Lifetime British Citizenship (Eligible for British Passport)",
    stay: "Full British Citizen status",
    processing: "3 to 6 months",
    purpose: "Acquire full British Citizenship by naturalisation as an adult (aged 18+) after holding Indefinite Leave to Remain (ILR) or EUSS Settled Status for 12 months (or immediately upon getting ILR if married to a British citizen).",
    eligibility: "Aged 18+, lived in the UK for 5 years (or 3 years if spouse of a British citizen), held ILR/Settled Status for 12 months (waived if married to a British citizen), absences <=450 days in 5 years (<=270 in 3 years) and <=90 days in final 12 months, Life in the UK Test, B1 English, Good Character, and 2 referees.",
    popular: true,
    highlight: true,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/apply-citizenship-indefinite-leave-to-remain"
  },
  {
    id: "in-to-gb-pr-ukn-reg",
    officialCode: "UKN-REG",
    officialName: "British Citizenship by Registration (Adults & British Nationals – Form B(OS)/B(OTA)/UKM/UKF)",
    name: "British Citizenship by Registration (Eligible Adults & British Nationals)",
    fee: "£1,351 - £1,446 (£1,200-£1,500) (or £130 ceremony only for UKM/UKF)",
    validity: "Lifetime British Citizenship",
    stay: "Full British Citizen status",
    processing: "3 to 6 months",
    purpose: "Statutory registration as a British citizen for eligible adults — including BN(O)s, British Overseas Territories Citizens (BOTCs), British Overseas Citizens (BOCs), British Subjects, or persons born before 1983 to a British mother (Form UKM) or unmarried British father (Form UKF).",
    eligibility: "Hold an eligible form of British nationality with 5 years UK residence (Section 4 BNA 1981) OR qualify under historic gender/legitimacy remedial registration provisions (Forms UKM, UKF, ARD).",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/Check-if-you-can-become-a-british-citizen"
  },
  {
    id: "in-to-gb-pr-ukn-child",
    officialCode: "UKN-CHILD",
    officialName: "Child British Citizenship Registration (Form MN1 & Form T)",
    name: "Child Citizenship Registration (Form MN1)",
    fee: "£1,214 (£1,012–£1,214; Fee waiver if parent cannot afford)",
    validity: "Lifetime British Citizenship",
    stay: "Full British Citizen status",
    processing: "2 to 4 months",
    purpose: "Register a child under 18 as a British citizen — particularly children born in the UK whose parent subsequently obtains ILR or British citizenship (Section 1(3)), children born in the UK who lived there for their first 10 years (Form T), or children born abroad settling with British/ILR parents (Section 3(1)).",
    eligibility: "Under 18 on date of application, parent has acquired ILR/Settled Status or British citizenship (or child lived first 10 years in UK), and Good Character if aged 10+.",
    popular: true,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/apply-citizenship-born-uk"
  },
  {
    id: "in-to-gb-pr-ukn-desc",
    officialCode: "UKN-DESC",
    officialName: "British Citizenship by Descent, BOTC & Nationality Status (UKN-DESC / UKN-REN / UKN-BOC)",
    name: "British Citizenship by Descent, BOTC & Renunciation/Resumption",
    fee: "Free (Automatic by Descent) / £428 Status Letter (Form NS) / £372 Renunciation",
    validity: "Lifetime Nationality Status",
    stay: "Full British Citizen or BOTC status",
    processing: "4 to 12 weeks",
    purpose: "Covers automatic British citizenship by descent (born outside the UK to a British citizen 'otherwise than by descent'), British Overseas Territories Citizenship (UKN-BOC), Confirmation of Nationality Status (Form NS), and Renunciation/Resumption of British Nationality (UKN-REN Forms RN/RS1).",
    eligibility: "At least one parent was a British citizen otherwise than by descent (born, naturalised, or registered in the UK, or in Crown Service) at the time of the applicant's birth.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/apply-citizenship-british-parent"
  },
  {
    id: "in-to-gb-pr-ukx-trp",
    officialCode: "UKX-TRP",
    officialName: "Temporary Worker / Temporary Permission In-Country Extensions (FLR)",
    name: "Temporary Worker / Temporary Permission Extensions (In-Country FLR)",
    fee: "£298 - £1,258 + IHS £1,035/yr",
    validity: "Route-specific extension duration",
    stay: "Extended lawful permission to stay",
    processing: "8 weeks in-country",
    purpose: "In-country Further Leave to Remain (FLR) applications to extend existing temporary work, family, or private life permission before current leave expires (triggers Section 3C continuous lawful leave while pending).",
    eligibility: "Valid current UK permission, new CoS or continuing family/route eligibility, and application submitted before existing visa expiry date.",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/visas-and-immigration-service-and-support-centres"
  },
  {
    id: "in-to-gb-pr-ukx-trp2",
    officialCode: "UKX-TRP2",
    officialName: "Temporary Permission to Stay / Leave Outside the Rules (LOTR – Form FLR(HRO))",
    name: "Temporary Permission to Stay / Leave Outside the Rules (LOTR)",
    fee: "£1,258 + IHS £1,035/yr (Fee waiver available)",
    validity: "Typically 6 to 30 months",
    stay: "Exceptional discretionary leave",
    processing: "3 to 9 months",
    purpose: "Exceptional permission to enter or stay granted outside the standard Immigration Rules (Leave Outside the Rules / LOTR on Form FLR(HRO)) for compelling compassionate reasons, bereavement, medical emergencies, or Temporary Permission to Stay for Victims of Human Trafficking/Slavery (VTS).",
    eligibility: "Compelling compassionate circumstances not covered by any standard Appendix of the Immigration Rules, or positive Conclusive Grounds decision under the National Referral Mechanism (NRM).",
    popular: false,
    highlight: false,
    isActive: true,
    isLegacy: false,
    officialSource: "https://www.gov.uk/government/publications/application-to-extend-stay-in-the-uk-flrhro"
  }
];

function buildUkVisaItems(list: typeof touristVisasRaw, cat: string): VisaItem[] {
  return list.map(v => {
    const micro = getUkMicroDetails(v.id, cat, v.name);
    const docs = getUkDocs(v.id, cat, v.name);

    const iconMap: Record<string, string> = {
      tourist: "🇬🇧",
      work: "💼",
      student: "🎓",
      family: "👨‍👩‍👧",
      business: "🤝",
      pr: "🏛️"
    };

    return {
      id: v.id,
      officialCode: v.officialCode,
      officialName: v.officialName,
      name: v.name,
      categoryCode: cat,
      icon: v.popular ? "⭐" : (iconMap[cat] || "🇬🇧"),
      fee: v.fee,
      validity: v.validity,
      stay: v.stay,
      processing: v.processing,
      purpose: v.purpose,
      eligibility: v.eligibility,
      popular: v.popular,
      highlight: v.highlight,
      isActive: v.isActive,
      isLegacy: v.isLegacy,
      officialSource: v.officialSource,
      ...micro,
      docs,
      documents: docs,
      infoReq: [
        "1. Personal & Biographic Information (Full Legal Name, Date & Place of Birth, Nationality, National Identity Number)",
        "2. Passport & Travel Document Details (Passport Number, Issue/Expiry Dates, Issuing Authority, Previous Passports)",
        "3. UK Contact & Accommodation Details (Intended UK Arrival Date, Length of Stay, UK Postcode & Full Accommodation Address)",
        "4. Sponsor / Host / Institution Details (UK Employer CoS Number, University CAS Number, Endorsing Body Reference, or UK Family Sponsor Details)",
        "5. Employment & Financial Profile (Current Occupation, Employer Name & Address, Monthly Income, Total Savings & Trip Funding Source)",
        "6. Family & Dependants Information (Parents' Full Names & Nationalities, Spouse/Partner Details, Dependent Children)",
        "7. 10-Year UK & International Travel History (Previous UK Visits, Schengen/US/CA/AU/NZ Travel, and Any Past Visa Refusals or Deportations)",
        "8. UKVI Suitability, Security & Medical Declarations (Criminal Convictions, Civil Penalties, TB Certificate Reference, and IHS Reference Number)"
      ],
      steps: [
        "1. Verify UKVI Route Eligibility & Sponsor Reference (Confirm your CAS, CoS, Endorsement Letter, or £29,000 MIR / 28-day funds compliance on GOV.UK).",
        "2. Prepare All 16–18 Mandatory Documents (Ensure 28-day continuous bank statements or 6-month regular statements, ITRs, TB certificate, and English SELT are ready).",
        "3. Complete Online Application on GOV.UK Access UK Portal (Fill out all 8 sections accurately and double-check passport and sponsor numbers).",
        "4. Pay Mandatory Immigration Health Surcharge (IHS £1,035/yr or £776/yr if applicable) & Official UK Visa Application Fee online.",
        "5. Book Biometric Appointment & Upload Supporting Documents (Self-upload PDFs on the VFS Global or TLScontact portal or select Document Scanning Assistance).",
        "6. Attend VFS Global / TLScontact Visa Application Centre (Submit passport, provide fingerprints and digital facial photograph, or complete UK Immigration: ID Check app).",
        "7. Track UKVI Decision & Receive Vignette / Digital eVisa (Collect stamped passport or link your UKVI account to view your online eVisa status before travelling)."
      ],
      tips: [
        "Follow the UKVI 28-Day Rule strictly for Student, Work, and Business routes: your bank balance must not drop below the required threshold for even a single day across the 28-day window, and the statement must end within 31 days of your online application date.",
        "Never deposit a sudden large lump sum (e.g., ₹5–10 Lakhs) right before applying for a UK Standard Visitor visa — UKVI ECOs routinely refuse applications under Appendix V (V 4.2) for unexplained deposits that do not match your ITR and monthly salary credits.",
        "Ensure 100% consistency across your ITR, Form 16, 6 months salary slips, bank credits, and employer NOC/experience letters."
      ],
      faq: [
        {
          q: `What is the official fee and processing time for ${v.name} (${v.officialCode})?`,
          a: `The official UKVI fee for ${v.name} is ${v.fee}, and standard processing takes ${v.processing} after biometrics submission at VFS Global / TLScontact (Priority 5-day and Super Priority 24-hour services are available on eligible routes).`
        },
        {
          q: `How does the UKVI 28-day bank funds rule or financial requirement work for ${v.officialCode}?`,
          a: micro.fundsBox.minimum + " " + micro.fundsBox.bankMonths
        },
        {
          q: `What are the most important mandatory documents for ${v.name}?`,
          a: `Key mandatory documents include: ${docs.slice(0, 6).join('; ')}.`
        }
      ]
    };
  });
}

export const UK_111_VISAS: CountryVisas = {
  tourist: buildUkVisaItems(touristVisasRaw, 'tourist'),
  work: buildUkVisaItems(workVisasRaw, 'work'),
  student: buildUkVisaItems(studentVisasRaw, 'student'),
  family: buildUkVisaItems(familyVisasRaw, 'family'),
  business: buildUkVisaItems(businessVisasRaw, 'business'),
  pr: buildUkVisaItems(prVisasRaw, 'pr')
};

import { 
  UK_111_ADDITIONAL_ROUTES, 
  UK_GROUP_1_REGIONAL_WORK, 
  UK_GROUP_2_FAMILY_SPECIAL, 
  UK_GROUP_3_EUSS_ROUTES, 
  UK_GROUP_4_BNO_ROUTES, 
  UK_GROUP_5_UKRAINE_SCHEMES, 
  UK_GROUP_6_PROTECTION_STATELESS, 
  UK_GROUP_7_SETTLEMENT_ROUTES, 
  UK_GROUP_8_NATIONALITY_CITIZENSHIP, 
  UK_GROUP_9_ENTRY_STATUS, 
  UK_GROUP_10_ARMED_FORCES, 
  UK_GROUP_11_LEGACY_ROUTES,
  UK_EUSS_WARNING_TEXT,
  UK_BNO_WARNING_TEXT,
  UK_UKRAINE_WARNING_TEXT,
  UK_NATIONALITY_WARNING_TEXT,
  UK_ENTRY_WARNING_TEXT,
  UK_LEGACY_WARNING_TEXT
} from './ukAdditionalRoutes';

export { 
  UK_111_ADDITIONAL_ROUTES, 
  UK_EUSS_WARNING_TEXT, 
  UK_BNO_WARNING_TEXT, 
  UK_UKRAINE_WARNING_TEXT, 
  UK_NATIONALITY_WARNING_TEXT, 
  UK_ENTRY_WARNING_TEXT, 
  UK_LEGACY_WARNING_TEXT 
};

export { UK_REGIONAL_WARNING_TEXT } from './ukRegionalJobs';

const additionalWork = UK_GROUP_1_REGIONAL_WORK; // 11
const additionalFamily = [...UK_GROUP_2_FAMILY_SPECIAL, ...UK_GROUP_3_EUSS_ROUTES]; // 6 + 8 = 14
const additionalBiz = UK_GROUP_11_LEGACY_ROUTES.filter(v => v.categoryCode === 'business'); // 5 (HSMP, TURK-BIZ, SOLE, T1-TAL, T1-INV)
const additionalPr = [
  ...UK_GROUP_4_BNO_ROUTES, // 5
  ...UK_GROUP_5_UKRAINE_SCHEMES, // 6
  ...UK_GROUP_6_PROTECTION_STATELESS, // 8
  ...UK_GROUP_7_SETTLEMENT_ROUTES, // 11
  ...UK_GROUP_8_NATIONALITY_CITIZENSHIP, // 13
  ...UK_GROUP_9_ENTRY_STATUS, // 13
  ...UK_GROUP_10_ARMED_FORCES, // 7
  ...UK_GROUP_11_LEGACY_ROUTES.filter(v => v.categoryCode !== 'business') // 18
]; // 5+6+8+11+13+13+7+18 = 81

export const UK_222_VISAS: CountryVisas = {
  tourist: [...UK_111_VISAS.tourist], // 13
  work: [...UK_111_VISAS.work, ...additionalWork], // 32 + 11 = 43
  student: [...UK_111_VISAS.student], // 10
  family: [...UK_111_VISAS.family, ...additionalFamily], // 27 + 14 = 41
  business: [...UK_111_VISAS.business, ...additionalBiz], // 9 + 5 = 14
  pr: [...UK_111_VISAS.pr, ...additionalPr], // 20 + 81 = 101
  supporting: UK_111_ADDITIONAL_ROUTES
};

export const UK_VISAS = UK_222_VISAS;

export const UK_222_ALL_ITEMS: VisaItem[] = [
  ...UK_222_VISAS.tourist,
  ...UK_222_VISAS.work,
  ...UK_222_VISAS.student,
  ...UK_222_VISAS.family,
  ...UK_222_VISAS.business,
  ...UK_222_VISAS.pr
];

