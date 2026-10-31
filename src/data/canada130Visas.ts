import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getCanadaMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "₹3-5 Lakhs liquid balance in personal savings bank account (regular 6 months seasoned balance - approx $4,500 - $7,500 CAD). Per day Canada travel expense budgeted at $150-200 CAD/day (~₹9k-12k INR/day). For a 10-day trip, show ₹1.5-2 Lakhs living budget + $800-1,000 flight + $120/night hotel. For Super Visa: Medical insurance policy $100k CAD from Canadian insurance provider + Sponsor must meet LICO minimum income requirements + Sponsor NOA.";
  let fundsBankMonths = "Last 6 months continuous bank statements with bank branch stamp and authorized signature. Minimum 3-6 months seasoned balance.";
  let fundsSudden = "❌ 1 din pehle 5-10 lakh daal ke mat dikhao - 6 mahine purana balance hona chahiye. Sudden large deposits (>₹50,000 - ₹1 Lakh) without verifiable legal source (Bonus letter, property sale deed, registered gift deed) lead directly to Section A11(1) / R179(b) nonimmigrant intent refusals.";
  let fundsEx = "✅ Sahi: Jan ₹45k, Feb ₹48k, Mar ₹52k regular monthly salary credits + ₹1.5 Lakh annual bonus credited with company payslip. Total closing balance ₹4.5 Lakhs. ❌ Galat: ₹6 Lakh transferred into account 3 days before submitting Canada visa portal application.";

  let itrYears = "Last 2-3 Assessment Years Income Tax Returns (ITR-V) + Form 16 (Part A & B) + CA Computation of Income. If self-employed: Personal ITR + Company ITR + 2 years GST returns + Audited Balance Sheet. For Super Visa: Sponsor Canadian Notice of Assessment (NOA) for recent tax year meeting LICO threshold.";
  let itrMatch = "Gross taxable income on ITR must strictly reconcile with annual bank account deposits. Mismatch between ITR and banking profile is a primary trigger for visa refusal under R179(b).";
  let itrNoItr = "No ITR? Very high (>60%) risk of visa refusal for lack of demonstrated economic ties to home country.";

  let bankMonths = "Last 6 months bank statement with bank branch seal and signature on all pages. Regular salary or business income credits between 1st and 10th of every month.";
  let bankReg = "Consistent monthly salary or operational business credits. Random large cash deposits trigger verification audits.";
  let bankFd = "Fixed Deposits (FDs) must be at least 3-4 months old and completely lien-free.";
  let bankSource = "Agricultural Income: J-Form + Tehsil Land Registry + Bank Credit. Property Sale: Registered Sale Deed + Buyer Bank Payment Trail. Gift: Registered Gift Deed + Donor 2-yr ITR + Donor Bank Statement.";

  if (cat === 'student' || code.includes('student') || code.includes('sds') || code.includes('stu')) {
    fundsMin = "Minimum 1 year tuition fees (paid in full to DLI) + living expenses $20,635 CAD (updated IRCC living cost benchmark) + $2,000 travel allowance = Total $35,000 - $55,000 CAD (approx ₹22 to ₹35 Lakhs INR). SDS Stream requires mandatory GIC $20,635 CAD deposited with approved Canadian bank + 1st year tuition payment receipt.";
    fundsBankMonths = "Minimum 6 months bank statements of student or primary sponsors (Parents/Guardian). Education loan sanction letter + disbursement copy valid.";
    fundsSudden = "❌ 1 din pehle 25-30 lakh loan disburse mat dikhao - at least 1 month old loan disbursement or 4+ months seasoned family savings/FDs required.";
    fundsEx = "✅ Sahi: 1st Year Tuition $17,500 CAD paid receipt + GIC $20,635 CAD Certificate with Scotiabank + ₹15 Lakhs Fathers seasoned bank savings/FDs.";
    itrYears = "Parents/Sponsor last 2-3 years ITR with Form 16, computation of income, and CA net worth valuation certificate.";
    itrMatch = "Sponsor annual gross income in ITR should ideally be at least ₹10-15 Lakhs to prove financial ability.";
    itrNoItr = "For SDS, ITR is supplementary because GIC and 1-year tuition are mandatory.";
    bankMonths = "Last 6 months bank statement with bank branch seal and signature on all pages.";
    bankReg = "Regular salary/business credits showing financial discipline and stability.";
    bankFd = "Fixed Deposits (FDs) must be at least 4 months old, unencumbered.";
    bankSource = "GIC $20,635 certificate from eligible Canadian financial institution. Education loan sanction from nationalized or approved scheduled commercial bank.";
  } else if (cat === 'work' || code.includes('work') || code.includes('lmia') || code.includes('pgwp') || code.includes('iec') || code.includes('wrk')) {
    fundsMin = "For LMIA-based and employer-specific permits: No mandatory statutory funds threshold since Canadian employer pays certified prevailing wage. However, applicant must maintain personal bank balance of ₹2-4 Lakhs for travel and initial settlement.";
    fundsBankMonths = "Last 4-6 months personal salary bank statements showing monthly salary credits matching Form 16 and company pay slips.";
    fundsSudden = "Work experience claims must match verifiable salary credits in bank accounts. Cash salaries without bank paper trail are scrutinized strictly by IRCC.";
    fundsEx = "✅ Sahi: Monthly salary from recognized tech employer credited on 30th of each month matching pay stubs, Form 16, and EPF passbook.";
    itrYears = "Past 2-3 Assessment Years ITR with Form 16 for all claimed work experience.";
    itrMatch = "Employer name, PAN, and reported income on Form 16 and ITR must match exactly with experience certificate.";
    itrNoItr = "Unfiled ITRs create serious credibility doubts regarding declared employment history.";
    bankMonths = "Last 4-6 months salary account bank statements with bank stamp and signature.";
    bankReg = "Regular salary credits with clear employer narration tag.";
    bankFd = "Supplementary liquid savings FDs valid for demonstrating settlement buffer.";
    bankSource = "Legitimate salary earnings, verified employer bonuses, or severance pay.";
  } else if (cat === 'family' || code.includes('family') || code.includes('spouse') || code.includes('pgp') || code.includes('supervisa') || code.includes('fam')) {
    fundsMin = "For Parents & Grandparents Program (PGP): Sponsor must meet IRCC Low-Income Cut-Off (LICO) + 30% for 3 consecutive tax years. For Super Visa: Sponsor must meet LICO minimum income + applicant must hold $100,000 CAD emergency medical insurance for 1 year.";
    fundsBankMonths = "Canadian Sponsor: 6 months Canadian bank statements + 3 years CRA Notice of Assessment (NOA) + T4 slips.";
    fundsSudden = "Relationship genuineness must be backed by joint financial trails: joint bank accounts, joint tenancy/lease, shared utility bills.";
    fundsEx = "✅ Sahi: Canadian spouse CRA NOA shows $62,000 annual income, joint chequing account, and joint residential lease.";
    itrYears = "Canadian Sponsor: 3 consecutive years CRA Notice of Assessment (NOA) + T4 tax slips + employment letter.";
    itrMatch = "Declared sponsor income on Form IMM 1344 must match line 15000 of CRA Notice of Assessment.";
    itrNoItr = "Missing CRA NOA results in immediate refusal of PGP or Super Visa applications.";
    bankMonths = "Canadian Sponsor: 6 months bank statement; Applicant: 6 months bank statements with branch stamp.";
    bankReg = "Canadian payroll direct deposits for sponsor; regular salary/business credits for applicant.";
    bankFd = "Personal savings and investments demonstrating financial stability.";
    bankSource = "Verified Canadian employment income, registered investments, or lawful business distributions.";
  } else if (cat === 'business' || code.includes('business') || code.includes('startup') || code.includes('investor') || code.includes('biz')) {
    fundsMin = "Start-up Visa (SUV): Commitment letter from designated venture capital fund ($200k CAD) or angel group ($75k CAD), plus unencumbered settlement funds ($15,263+ CAD).";
    fundsBankMonths = "2 years audited corporate bank statements + 12 months personal bank statements.";
    fundsSudden = "Exhaustive lawful source-of-funds path: capital must be traced from legal origins (taxed business profits, commercial real estate sales).";
    fundsEx = "✅ Sahi: $200,000 transferred into Canadian corporate account from Indian audited parent company with RBI LRS documentation.";
    itrYears = "Past 3 years corporate ITR + Audited Balance Sheet & Profit/Loss + Past 3 years personal ITR.";
    itrMatch = "Complete reconciliation between GST returns, audited turnover, bank credits, and personal taxable income.";
    itrNoItr = "Corporate audited financials and personal tax returns are non-negotiable.";
    bankMonths = "2 years corporate bank account + 12 months personal account.";
    bankReg = "Active operational banking with verifiable commercial transactions.";
    bankFd = "Corporate treasury balances and unencumbered liquid funds in recognized schedule-1 Canadian banks.";
    bankSource = "Retained earnings from lawful business activities, verified corporate dividends, or investment capital.";
  } else if (cat === 'pr' || code.includes('pr') || code.includes('fsw') || code.includes('pnp') || code.includes('express')) {
    fundsMin = "Express Entry (FSW/FST): Minimum settlement funds updated annually by IRCC (approx $14,690 CAD for single applicant, $18,288 CAD for couple, $22,483 CAD for family of 3). Proof of funds is waived for CEC applicants and those authorized to work in Canada with a valid job offer.";
    fundsBankMonths = "Official bank letter on bank letterhead listing all bank and investment accounts, account numbers, dates accounts opened, current balances, and average balance for past 6 months.";
    fundsSudden = "Sudden borrowed deposits are strictly disqualified. Funds must be unencumbered and owned free of any debts or liabilities.";
    fundsEx = "✅ Sahi: Official IRCC-compliant bank letter with 6-month average balance CAD $16,500 + zero outstanding credit card / overdraft debts.";
    itrYears = "Past 3 years personal income tax filings + Form 16 / tax assessment notices matching claimed work experience.";
    itrMatch = "Annual gross compensation must be consistent with declared primary NOC skill level and wage rate.";
    itrNoItr = "ITR is mandatory to validate foreign skilled work experience.";
    bankMonths = "Official 6-month bank statement + IRCC format bank balance certificate.";
    bankReg = "Regular salary credits or ongoing business turnover.";
    bankFd = "Fixed deposits in applicants name fully unencumbered and immediately cashable.";
    bankSource = "Legitimate employment earnings, verified mutual funds/stocks, or ancestral property proceeds.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

export interface RawCanadaItem {
  id: string;
  officialCode: string;
  name: string;
  toCountry: string;
  fromCountry: string;
  category: 'tourist' | 'business' | 'work' | 'student' | 'family' | 'pr' | 'supporting';
  record_type: string;
  fee: string;
  validity: string;
  docs: string;
  fundsBox?: string;
  bankBox?: string;
  warningBox?: string;
}

export const CA_130_FULL: RawCanadaItem[] = [
  {
    "id": "ca-TOU-001",
    "officialCode": "CA-TOU-001",
    "name": "Canada Visitor Visa TRV 6M Visitor Visa TRV 6M - Most common Tourist Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "TOURIST_VISA",
    "fee": "CAD 100 Visitor TRV 6M Canada + Biometrics CAD 85",
    "validity": "6M visitor TRV 6M + Multiple 10Y visitor TRV Canada",
    "docs": "Passport 6M + Photo 35x45 white + Flight return + Hotel all Canada + Bank 6M + Employment + Cover letter + TRV application IRCC + Invitation if family + Visitor TRV 6M Canada + Passport 6M + Photo + Flight + Hotel + Bank + Employment + Cover letter + TRV application IRCC + Invitation if family",
    "fundsBox": "CAD 2000/month = Bank 6M CAD 2000/month = Visitor TRV Canada IRCC",
    "bankBox": "Bank 6M CAD 2000/month original + Employment + Insurance + Visitor TRV Canada",
    "warningBox": "✅ Most common tourist Canada Visitor TRV 6M - IRCC - Biometrics CAD 85"
  },
  {
    "id": "ca-TOU-002",
    "officialCode": "CA-TOU-002",
    "name": "Canada eTA 5Y Electronic Travel Authorization eTA 5Y eTA Canada - Visa Exempt",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "ETA_VISA",
    "fee": "CAD 7 eTA 5Y Canada",
    "validity": "5Y eTA 5Y eTA Canada - 6M stay per entry",
    "docs": "Passport + Photo + Flight + Hotel + eTA application canada.ca/eTA + Passport + Photo + Flight + Hotel + eTA application"
  },
  {
    "id": "ca-TOU-003",
    "officialCode": "CA-TOU-003",
    "name": "Canada Super Visa 2Y 5Y Super Visa 2Y 5Y Super Visa Parents Grandparents Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "TOURIST_VISA",
    "fee": "CAD 100 Super Visa 2Y 5Y Canada + Insurance CAD 100k",
    "validity": "2Y per entry 5Y super visa 2Y 5Y super visa Canada",
    "docs": "Invitation super visa + Host child PR citizenship + Relationship proof super visa + Birth certificate + Host financial LICO + Insurance CAD 100k 1Y + Medical exam super visa + Super visa application IRCC + Invitation super visa + Host child PR + Relationship proof + Birth certificate + Host financial LICO + Insurance CAD 100k + Medical exam + Super visa application",
    "warningBox": "MOST IMPORTANT: Super Visa - Parents Grandparents - Insurance CAD 100k + LICO + 2Y per entry"
  },
  {
    "id": "ca-TOU-004",
    "officialCode": "CA-TOU-004",
    "name": "Canada Transit Visa 48H Transit Visa 48H Transit Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "TRANSIT_VISA",
    "fee": "CAD 0 Transit 48H Canada free",
    "validity": "48H transit 48H transit Canada",
    "docs": "Passport 6M + Onward ticket within 48H + Flight within 48H + Visa third country + Transit 48H application IRCC + Passport + Onward ticket + Flight + Visa third country + Transit application"
  },
  {
    "id": "ca-TOU-005",
    "officialCode": "CA-TOU-005",
    "name": "Canada Visitor - Business Visitor 6M Business Visitor 6M Business Visitor Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "BUSINESS_VISA",
    "fee": "CAD 100 Business visitor 6M Canada",
    "validity": "6M business visitor 6M business visitor Canada",
    "docs": "Company invitation Canada business visitor + Canadian company registration + Foreign company letter + Business card + Business registration foreign + Business invitation + Business proof + Bank 6M + Business visitor application IRCC + Company invitation Canada + Canadian company registration + Foreign company letter + Business card + Business registration foreign + Business invitation + Business proof + Bank + Business visitor application"
  },
  {
    "id": "ca-TOU-006",
    "officialCode": "CA-TOU-006",
    "name": "Canada Visitor - Medical Treatment 6M Medical Treatment 6M Medical Treatment Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "MEDICAL_VISA",
    "fee": "CAD 100 Medical treatment 6M Canada",
    "validity": "6M medical treatment 6M medical treatment Canada",
    "docs": "Hospital appointment letter Canada hospital + Medical certificate + Treatment plan + Medical institution guarantee + Hospital registration + Advance payment + Bank 6M + Medical treatment application IRCC + Hospital appointment + Medical certificate + Treatment plan + Medical institution guarantee + Hospital registration + Advance payment + Bank"
  },
  {
    "id": "ca-TOU-007",
    "officialCode": "CA-TOU-007",
    "name": "Canada Visitor Extension Visitor Record Extension Visitor Record Extension Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "STATUS_DOCUMENT",
    "fee": "CAD 100 Visitor record extension Canada",
    "validity": "Extension visitor record extension Canada",
    "docs": "Extension reason letter visitor + Passport + Photo + Flight + Hotel + Bank + Visitor record extension application IRCC + Extension reason + Passport + Photo + Flight + Hotel + Bank + Visitor record extension application"
  },
  {
    "id": "ca-TOU-008",
    "officialCode": "CA-TOU-008",
    "name": "Canada Visitor - Family Friends Visit 6M Family Friends Visit 6M Family Friends Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "TOURIST_VISA",
    "fee": "CAD 100 Family friends visit 6M Canada",
    "validity": "6M family friends visit 6M family friends Canada",
    "docs": "Invitation family friends Canada + Host ID PR citizenship + Relationship proof + Host accommodation Canada + Host financial LICO + Passport + Photo + Flight + Hotel + Bank + Employment + Cover letter + Family friends visit application IRCC + Invitation + Host ID + Relationship + Host accommodation + Host financial + Passport + Photo + Flight + Hotel + Bank + Employment + Cover letter"
  },
  {
    "id": "ca-TOU-009",
    "officialCode": "CA-TOU-009",
    "name": "Canada Multiple Entry TRV 10Y Multiple Entry TRV 10Y Multiple Entry TRV Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "TOURIST_VISA",
    "fee": "CAD 100 Multiple entry TRV 10Y Canada",
    "validity": "10Y multiple entry TRV 10Y multiple entry TRV Canada - 6M per entry",
    "docs": "Passport 6M + Photo + Flight + Hotel + Bank 6M + Employment + Cover letter + Travel history + Multiple entry TRV application IRCC + Passport + Photo + Flight + Hotel + Bank + Employment + Cover letter + Travel history + Multiple entry TRV application"
  },
  {
    "id": "ca-TOU-010",
    "officialCode": "CA-TOU-010",
    "name": "Canada Single Entry TRV Single Entry TRV Single Entry TRV Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "TOURIST_VISA",
    "fee": "CAD 100 Single entry TRV Canada",
    "validity": "6M single entry TRV single entry TRV Canada",
    "docs": "Passport 6M + Photo + Flight + Hotel + Bank 6M + Employment + Cover letter + Single entry TRV application IRCC + Passport + Photo + Flight + Hotel + Bank + Employment + Cover letter + Single entry TRV application"
  },
  {
    "id": "ca-TOU-011",
    "officialCode": "CA-TOU-011",
    "name": "Canada Visitor - Conference 6M Conference Visitor 6M Conference Visitor Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "CONFERENCE_VISA",
    "fee": "CAD 100 Conference visitor 6M Canada",
    "validity": "6M conference visitor 6M conference visitor Canada",
    "docs": "Conference invitation Canada + Conference organizer registration + Conference details + Company invitation Canada + Canadian company registration + Foreign company letter + Business card + Business invitation + Business proof + Bank + Conference visitor application IRCC + Conference invitation + Conference organizer registration + Conference details + Company invitation Canada + Canadian company registration + Foreign company letter + Business card + Business invitation + Business proof + Bank"
  },
  {
    "id": "ca-TOU-012",
    "officialCode": "CA-TOU-012",
    "name": "Canada Visitor - Cultural 6M Cultural Visitor 6M Cultural Visitor Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "CULTURAL_VISA",
    "fee": "CAD 100 Cultural visitor 6M Canada",
    "validity": "6M cultural visitor 6M cultural visitor Canada",
    "docs": "Cultural invitation Canada + Cultural organization registration + Cultural details + Bank + Cultural visitor application IRCC + Cultural invitation + Cultural organization registration + Cultural details + Bank + Cultural visitor application"
  },
  {
    "id": "ca-TOU-013",
    "officialCode": "CA-TOU-013",
    "name": "Canada Visitor - Sports 6M Sports Visitor 6M Sports Visitor Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "SPECIAL_VISA",
    "fee": "CAD 100 Sports visitor 6M Canada",
    "validity": "6M sports visitor 6M sports visitor Canada",
    "docs": "Sports invitation Canada + Sports organization registration + Sports details + Bank + Sports visitor application IRCC + Sports invitation + Sports organization registration + Sports details + Bank + Sports visitor application"
  },
  {
    "id": "ca-TOU-014",
    "officialCode": "CA-TOU-014",
    "name": "Canada ETA - Transit eTA Transit eTA Transit Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "TRANSIT_VISA",
    "fee": "CAD 7 eTA transit Canada",
    "validity": "5Y eTA transit eTA transit Canada",
    "docs": "Passport + Onward ticket within 48H + Flight within 48H + Visa third country + eTA transit application canada.ca/eTA + Passport + Onward ticket + Flight + Visa third country + eTA transit application"
  },
  {
    "id": "ca-TOU-015",
    "officialCode": "CA-TOU-015",
    "name": "Canada Visitor - Official Visit 6M Official Visit 6M Official Visit Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "OFFICIAL_VISA",
    "fee": "CAD 100 Official visit 6M Canada",
    "validity": "6M official visit 6M official visit Canada",
    "docs": "Official visit invitation Canada + Official visit organization registration + Official visit proof + Official visit application IRCC + Official visit invitation + Official visit organization registration + Official visit proof + Official visit application"
  },
  {
    "id": "ca-TOU-016",
    "officialCode": "CA-TOU-016",
    "name": "Canada Visitor - Multiple Entry Super Visa 10Y Super Visa 10Y Multiple Entry Super Visa Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "TOURIST_VISA",
    "fee": "CAD 100 Super visa multiple 10Y Canada + Insurance CAD 100k",
    "validity": "10Y multiple entry super visa 10Y super visa Canada - 2Y per entry",
    "docs": "Invitation super visa multiple + Host child PR citizenship multiple + Relationship proof super visa multiple + Birth certificate multiple + Host financial LICO multiple + Insurance CAD 100k 1Y multiple + Medical exam super visa multiple + Super visa multiple application IRCC + Invitation super visa multiple + Host child PR multiple + Relationship proof multiple + Birth certificate multiple + Host financial LICO multiple + Insurance CAD 100k multiple + Medical exam multiple + Super visa multiple application"
  },
  {
    "id": "ca-TOU-017",
    "officialCode": "CA-TOU-017",
    "name": "Canada Visitor - Diplomat Official Diplomat Official Diplomat Official Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "DIPLOMAT_VISA",
    "fee": "CAD 0 Diplomat official Canada free",
    "validity": "Diplomat official visa diplomat official Canada",
    "docs": "Diplomat note verbale + Diplomat passport + Official invitation Canada + Ministry Foreign Affairs Canada + Diplomat official application IRCC + Diplomat note verbale + Diplomat passport + Official invitation Canada + Ministry Foreign Affairs Canada + Diplomat official application"
  },
  {
    "id": "ca-TOU-018",
    "officialCode": "CA-TOU-018",
    "name": "Canada Visitor - Seaman Crew 6M Seaman Crew 6M Seaman Crew Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "CREW_VISA",
    "fee": "CAD 100 Seaman crew 6M Canada",
    "validity": "6M seaman crew 6M seaman crew Canada",
    "docs": "Seaman invitation Canada + Seaman organization registration + Seaman proof + Seaman contract + Bank + Seaman crew application IRCC + Seaman invitation + Seaman organization registration + Seaman proof + Seaman contract + Bank + Seaman crew application"
  },
  {
    "id": "ca-TOU-019",
    "officialCode": "CA-TOU-019",
    "name": "Canada Visitor - Journalist 6M Journalist 6M Journalist Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "JOURNALIST_VISA",
    "fee": "CAD 100 Journalist 6M Canada",
    "validity": "6M journalist 6M journalist Canada",
    "docs": "Journalist invitation Canada + Journalist organization registration + Journalist proof + Journalist application IRCC + Journalist invitation + Journalist organization registration + Journalist proof + Journalist application"
  },
  {
    "id": "ca-TOU-020",
    "officialCode": "CA-TOU-020",
    "name": "Canada Visitor - Transit Without Visa China Indonesia TWOV China Indonesia Transit Without Visa Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "TRANSIT_VISA",
    "fee": "CAD 0 TWOV China Indonesia transit without visa Canada",
    "validity": "48H TWOV transit without visa Canada",
    "docs": "TWOV proof China Indonesia + Passport 6M + Onward ticket within 48H + Flight within 48H + Visa third country + TWOV application IRCC + TWOV proof + Passport + Onward ticket + Flight + Visa third country + TWOV application"
  },
  {
    "id": "ca-BIZ-001",
    "officialCode": "CA-BIZ-001",
    "name": "Canada Business Visitor 6M Business Visitor 6M Business Visitor Canada - Most common Business Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "BUSINESS_VISA",
    "fee": "CAD 100 Business visitor 6M Canada",
    "validity": "6M business visitor 6M business visitor Canada",
    "docs": "Company invitation Canada business visitor + Canadian company registration + Foreign company letter + Business card + Business registration foreign + Business invitation + Business proof + Bank 6M + Business visitor application IRCC + Company invitation Canada + Canadian company registration + Foreign company letter + Business card + Business registration foreign + Business invitation + Business proof + Bank + Business visitor application",
    "warningBox": "✅ Most common business Canada Business Visitor 6M - IRCC - No LMIA needed"
  },
  {
    "id": "ca-BIZ-002",
    "officialCode": "CA-BIZ-002",
    "name": "Canada Business Visitor Multiple 10Y Business Visitor Multiple 10Y Business Visitor Multiple Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "BUSINESS_VISA",
    "fee": "CAD 100 Business visitor multiple 10Y Canada",
    "validity": "10Y multiple entry business visitor 10Y business visitor multiple Canada",
    "docs": "Company invitation Canada business visitor multiple + Canadian company registration multiple + Foreign company letter multiple + Business card multiple + Business registration foreign multiple + Business invitation multiple + Business proof multiple + Bank 6M multiple + Travel history + Business visitor multiple application IRCC + Company invitation multiple + Canadian company registration multiple + Foreign company letter multiple + Business card multiple + Business registration foreign multiple + Business invitation multiple + Business proof multiple + Bank multiple + Travel history + Business visitor multiple application"
  },
  {
    "id": "ca-BIZ-003",
    "officialCode": "CA-BIZ-003",
    "name": "Canada Intra Company Transfer Work Permit ICT 1Y 3Y Intra Company Transfer ICT 1Y 3Y ICT Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "WORK_VISA",
    "fee": "CAD 155 ICT 1Y 3Y Canada + LMIA exempt",
    "validity": "1Y 3Y ICT intra company transfer 1Y 3Y ICT Canada",
    "docs": "ICT offer Canada + Employment contract Canada ICT + Employer registration + Company registration Canada ICT + Company relationship + ICT proof 1Y + Salary + Qualifications + ICT application IRCC + ICT offer + Employment contract ICT + Employer + Company registration ICT + Company relationship + ICT proof + Salary + Qualifications + ICT application"
  },
  {
    "id": "ca-BIZ-004",
    "officialCode": "CA-BIZ-004",
    "name": "Canada CUSMA USMCA Business Visitor Investor Trader CUSMA USMCA CUSMA Business Canada - US Mexico",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "BUSINESS_VISA",
    "fee": "CAD 100 CUSMA business visitor Canada + USMCA",
    "validity": "1Y CUSMA business visitor 1Y CUSMA business Canada",
    "docs": "CUSMA business visitor invitation Canada + Canadian company registration CUSMA + US company letter CUSMA + CUSMA proof US citizen + Business card CUSMA + Business invitation CUSMA + Business proof CUSMA + Bank CUSMA + CUSMA business visitor application IRCC + CUSMA invitation + Canadian company registration CUSMA + US company letter CUSMA + CUSMA proof + Business card CUSMA + Business invitation CUSMA + Business proof CUSMA + Bank CUSMA"
  },
  {
    "id": "ca-BIZ-005",
    "officialCode": "CA-BIZ-005",
    "name": "Canada CUSMA Investor 1Y CUSMA Investor 1Y CUSMA Investor Canada - US Mexico Investor",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "INVESTOR_VISA",
    "fee": "CAD 155 CUSMA investor 1Y Canada",
    "validity": "1Y CUSMA investor 1Y CUSMA investor Canada",
    "docs": "CUSMA investor business plan Canada + Company registration Canada CUSMA investor + Investment substantial + CUSMA investor proof US citizen + Business plan + Investment proof + Financial means + CUSMA investor application IRCC + CUSMA investor business plan + Company registration CUSMA investor + Investment + CUSMA investor proof + Business plan + Investment proof + Financial means + CUSMA investor application"
  },
  {
    "id": "ca-BIZ-006",
    "officialCode": "CA-BIZ-006",
    "name": "Canada Start-up Visa PR Start-up Visa PR Start-up Visa PR Canada - Designated Organization",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "ENTREPRENEUR_VISA",
    "fee": "CAD 1545 Start-up visa PR Canada + Designated organization",
    "validity": "PR start-up visa PR start-up visa PR Canada",
    "docs": "Start-up business plan Canada + Designated organization letter support + Company registration Canada start-up + Investment + Start-up proof + Business plan + Investment proof + Financial means + Start-up visa PR application IRCC + Start-up business plan + Designated organization letter + Company registration start-up + Investment + Start-up proof + Business plan + Investment proof + Financial means + Start-up visa PR application",
    "warningBox": "MOST IMPORTANT: Start-up Visa PR - Designated Organization Letter - Incubator/Angel/VC"
  },
  {
    "id": "ca-BIZ-007",
    "officialCode": "CA-BIZ-007",
    "name": "Canada Self Employed PR Self Employed PR Self Employed PR Canada - Cultural Athletic",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "ENTREPRENEUR_VISA",
    "fee": "CAD 1540 Self employed PR Canada",
    "validity": "PR self employed PR self employed PR Canada",
    "docs": "Self employed business plan Canada + Self employed cultural athletic proof + Company registration Canada self employed + Financial means self employed + Self employed proof + Clients + Self employed PR application IRCC + Self employed business plan + Self employed cultural athletic proof + Company registration self employed + Financial means self employed + Self employed proof + Clients + Self employed PR application"
  },
  {
    "id": "ca-BIZ-008",
    "officialCode": "CA-BIZ-008",
    "name": "Canada Investor Quebec QIIP 5Y Investor Quebec QIIP 5Y Investor Quebec QIIP Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "INVESTOR_VISA",
    "fee": "CAD 1M Investor Quebec QIIP 5Y Canada",
    "validity": "5Y investor Quebec QIIP 5Y investor Quebec QIIP Canada",
    "docs": "Investor Quebec business plan Canada + Company registration Canada investor Quebec + Investment CAD 1M + Investor Quebec proof + Business plan + Investment proof + Financial means + Investor Quebec QIIP application IRCC + Investor Quebec business plan + Company registration investor Quebec + Investment + Investor Quebec proof + Business plan + Investment proof + Financial means + Investor Quebec QIIP application"
  },
  {
    "id": "ca-BIZ-009",
    "officialCode": "CA-BIZ-009",
    "name": "Canada Entrepreneur Quebec Entrepreneur Quebec Entrepreneur Quebec Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "ENTREPRENEUR_VISA",
    "fee": "CAD 1099 Entrepreneur Quebec Canada",
    "validity": "2Y entrepreneur Quebec entrepreneur Quebec Canada",
    "docs": "Entrepreneur Quebec business plan Canada + Company registration Canada entrepreneur Quebec + Investment + Entrepreneur Quebec proof + Business plan + Investment proof + Financial means + Entrepreneur Quebec application IRCC + Entrepreneur Quebec business plan + Company registration entrepreneur Quebec + Investment + Entrepreneur Quebec proof + Business plan + Investment proof + Financial means + Entrepreneur Quebec application"
  },
  {
    "id": "ca-BIZ-010",
    "officialCode": "CA-BIZ-010",
    "name": "Canada Owner Operator LMIA Work Permit Owner Operator LMIA Work Permit Owner Operator LMIA Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "WORK_VISA",
    "fee": "CAD 1000 LMIA Owner operator LMIA Canada",
    "validity": "1Y 2Y owner operator LMIA work permit owner operator LMIA Canada",
    "docs": "Owner operator business plan Canada + Company registration Canada owner operator + Investment + LMIA owner operator + Job offer owner operator + Employment contract owner operator + Owner operator application IRCC + Owner operator business plan + Company registration owner operator + Investment + LMIA owner operator + Job offer owner operator + Employment contract owner operator + Owner operator application"
  },
  {
    "id": "ca-BIZ-011",
    "officialCode": "CA-BIZ-011",
    "name": "Canada Francophone Mobility Work Permit Francophone Mobility Work Permit Francophone Mobility Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "WORK_VISA",
    "fee": "CAD 155 Francophone mobility work permit Canada",
    "validity": "1Y 3Y francophone mobility work permit francophone mobility Canada",
    "docs": "Francophone mobility job offer Canada + Employment contract Canada francophone mobility + Employer registration + Company registration Canada francophone mobility + French language CLB 5 + Francophone mobility proof + Salary + Francophone mobility application IRCC + Francophone mobility job offer + Employment contract francophone mobility + Employer + Company registration francophone mobility + French language + Francophone mobility proof + Salary + Francophone mobility application"
  },
  {
    "id": "ca-BIZ-012",
    "officialCode": "CA-BIZ-012",
    "name": "Canada Global Talent Stream GTS Work Permit Global Talent Stream GTS Work Permit GTS Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "WORK_VISA",
    "fee": "CAD 1000 LMIA GTS Canada + 10 day processing",
    "validity": "1Y 3Y GTS work permit GTS Canada",
    "docs": "GTS job offer Canada + Employment contract Canada GTS + Employer registration + Company registration Canada GTS + LMIA GTS + Salary + GTS proof Category A B + GTS application IRCC + GTS job offer + Employment contract GTS + Employer + Company registration GTS + LMIA GTS + Salary + GTS proof + GTS application",
    "warningBox": "MOST IMPORTANT: Global Talent Stream GTS - 10 Day Processing - Category A B - LMIA"
  },
  {
    "id": "ca-BIZ-013",
    "officialCode": "CA-BIZ-013",
    "name": "Canada International Experience IEC Working Holiday IEC 1Y 2Y Working Holiday IEC Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "WORKING_HOLIDAY_VISA",
    "fee": "CAD 172 IEC working holiday Canada",
    "validity": "1Y 2Y IEC working holiday 1Y 2Y working holiday IEC Canada",
    "docs": "IEC invitation Canada + Age 18-35 + Financial means CAD 2500 + Insurance + IEC working holiday application IRCC + IEC invitation + Age + Financial means + Insurance + IEC working holiday application"
  },
  {
    "id": "ca-BIZ-014",
    "officialCode": "CA-BIZ-014",
    "name": "Canada Significant Benefit Work Permit Significant Benefit Work Permit Significant Benefit Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "WORK_VISA",
    "fee": "CAD 155 Significant benefit work permit Canada",
    "validity": "1Y 3Y significant benefit work permit significant benefit Canada",
    "docs": "Significant benefit proof Canada + Job offer Canada significant benefit + Employment contract Canada significant benefit + Employer registration + Company registration Canada significant benefit + Significant benefit letter + Salary + Significant benefit application IRCC + Significant benefit proof + Job offer significant benefit + Employment contract significant benefit + Employer + Company registration significant benefit + Significant benefit letter + Salary + Significant benefit application"
  },
  {
    "id": "ca-BIZ-015",
    "officialCode": "CA-BIZ-015",
    "name": "Canada Atlantic Immigration Program AIP Work Permit AIP Work Permit AIP Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "business",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 AIP work permit Canada regional",
    "validity": "1Y AIP work permit AIP work permit AIP Canada regional",
    "docs": "AIP job offer Canada + Employment contract Canada AIP + Employer designation AIP + Company registration Canada AIP + Endorsement AIP + AIP proof + Salary + AIP application IRCC + AIP job offer + Employment contract AIP + Employer designation AIP + Company registration AIP + Endorsement AIP + AIP proof + Salary + AIP application",
    "warningBox": "MOST IMPORTANT: Atlantic Immigration Program AIP - Regional - NB NS PE NL + Endorsement"
  },
  {
    "id": "ca-WRK-001",
    "officialCode": "CA-WRK-001",
    "name": "Canada Work Permit LMIA 1Y 2Y Work Permit LMIA 1Y 2Y - Most common Work Permit Canada - LMIA",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 1000 LMIA + CAD 155 Work permit LMIA Canada",
    "validity": "1Y 2Y work permit LMIA 1Y 2Y work permit LMIA Canada",
    "docs": "Job offer Canada LMIA + Employment contract Canada LMIA + Employer registration + Company registration Canada LMIA + LMIA approval + Salary + Work permit LMIA application IRCC + Job offer LMIA + Employment contract LMIA + Employer + Company registration LMIA + LMIA approval + Salary + Work permit LMIA application + Job offer LMIA + Employment contract LMIA + Employer + Company registration LMIA + LMIA approval + Salary + Work permit LMIA application",
    "warningBox": "✅ Most common work permit Canada LMIA Work Permit 1Y 2Y + LMIA CAD 1000 + ESDC"
  },
  {
    "id": "ca-WRK-002",
    "officialCode": "CA-WRK-002",
    "name": "Canada Work Permit Extension Extension Work Permit LMIA Extension Work Permit Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "STATUS_DOCUMENT",
    "fee": "CAD 155 Work permit extension Canada",
    "validity": "Extension work permit extension Canada",
    "docs": "Extension reason letter + Job offer Canada LMIA extension + Employment contract Canada LMIA extension + Employer registration + Company registration Canada LMIA extension + LMIA extension + Salary extension + Extension application IRCC + Extension reason + Job offer LMIA extension + Employment contract LMIA extension + Employer + Company registration LMIA extension + LMIA extension + Salary extension + Extension application"
  },
  {
    "id": "ca-WRK-003",
    "officialCode": "CA-WRK-003",
    "name": "Canada Work Permit - Home Child Care Provider Pilot 3Y Home Child Care Provider Pilot 3Y Home Child Care Provider Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 1000 Home child care provider pilot 3Y Canada",
    "validity": "3Y home child care provider pilot 3Y home child care provider Canada",
    "docs": "Home child care job offer Canada + Employment contract Canada home child care + Employer registration + Company registration Canada home child care + Home child care proof + Qualifications + Home child care pilot application IRCC + Home child care job offer + Employment contract home child care + Employer + Company registration home child care + Home child care proof + Qualifications + Home child care pilot application"
  },
  {
    "id": "ca-WRK-004",
    "officialCode": "CA-WRK-004",
    "name": "Canada Work Permit - Home Support Worker Pilot 3Y Home Support Worker Pilot 3Y Home Support Worker Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 1000 Home support worker pilot 3Y Canada",
    "validity": "3Y home support worker pilot 3Y home support worker Canada",
    "docs": "Home support job offer Canada + Employment contract Canada home support + Employer registration + Company registration Canada home support + Home support proof + Qualifications + Home support pilot application IRCC + Home support job offer + Employment contract home support + Employer + Company registration home support + Home support proof + Qualifications + Home support pilot application"
  },
  {
    "id": "ca-WRK-005",
    "officialCode": "CA-WRK-005",
    "name": "Canada Work Permit - Agri Food Pilot AFP 3Y Agri Food Pilot AFP 3Y Agri Food Pilot Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 Agri food pilot AFP 3Y Canada regional",
    "validity": "3Y agri food pilot AFP 3Y agri food pilot AFP Canada regional",
    "docs": "Agri food job offer Canada + Employment contract Canada agri food + Employer registration + Company registration Canada agri food + Agri food proof + Salary + Agri food pilot application IRCC + Agri food job offer + Employment contract agri food + Employer + Company registration agri food + Agri food proof + Salary + Agri food pilot application",
    "warningBox": "MOST IMPORTANT: Agri-Food Pilot AFP - Regional - Meat Processing Mushroom Greenhouse"
  },
  {
    "id": "ca-WRK-006",
    "officialCode": "CA-WRK-006",
    "name": "Canada Work Permit - Seasonal Agricultural Worker SAWP 8M Seasonal Agricultural Worker SAWP 8M SAWP Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 SAWP 8M Canada seasonal agricultural",
    "validity": "8M SAWP seasonal agricultural worker SAWP 8M SAWP Canada",
    "docs": "SAWP job offer Canada + Employment contract Canada SAWP + Employer registration + Company registration Canada SAWP + SAWP proof + Country agreement + SAWP application IRCC + SAWP job offer + Employment contract SAWP + Employer + Company registration SAWP + SAWP proof + Country agreement + SAWP application"
  },
  {
    "id": "ca-WRK-007",
    "officialCode": "CA-WRK-007",
    "name": "Canada Work Permit - Rural Community Immigration Pilot RCIP 3Y Rural Community Immigration Pilot RCIP 3Y RCIP Canada - Regional DAMA Style",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 RCIP 3Y Canada regional DAMA style",
    "validity": "3Y RCIP rural community immigration pilot 3Y RCIP Canada regional DAMA style",
    "docs": "RCIP job offer Canada + Employment contract Canada RCIP + Employer designation RCIP + Company registration Canada RCIP + Community recommendation RCIP + RCIP proof + Salary + RCIP application IRCC + RCIP job offer + Employment contract RCIP + Employer designation RCIP + Company registration RCIP + Community recommendation RCIP + RCIP proof + Salary + RCIP application",
    "warningBox": "MOST IMPORTANT: Rural Community Immigration Pilot RCIP - New 2025 - Regional DAMA Style Canada - Community Recommendation"
  },
  {
    "id": "ca-WRK-008",
    "officialCode": "CA-WRK-008",
    "name": "Canada Work Permit - Francophone Community Immigration Pilot FCIP 3Y Francophone Community Immigration Pilot FCIP 3Y FCIP Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 FCIP 3Y Canada regional francophone",
    "validity": "3Y FCIP francophone community immigration pilot 3Y FCIP Canada regional francophone",
    "docs": "FCIP job offer Canada + Employment contract Canada FCIP + Employer designation FCIP + Company registration Canada FCIP + Community recommendation FCIP + French language CLB 5 + FCIP proof + Salary + FCIP application IRCC + FCIP job offer + Employment contract FCIP + Employer designation FCIP + Company registration FCIP + Community recommendation FCIP + French language + FCIP proof + Salary + FCIP application"
  },
  {
    "id": "ca-WRK-009",
    "officialCode": "CA-WRK-009",
    "name": "Canada Work Permit - Atlantic Immigration Program AIP PR AIP PR AIP PR Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 AIP PR AIP PR Canada regional",
    "validity": "PR AIP PR AIP PR Canada regional",
    "docs": "AIP job offer Canada PR + Employment contract Canada AIP PR + Employer designation AIP PR + Company registration Canada AIP PR + Endorsement AIP PR + AIP PR proof + Salary + AIP PR application IRCC + AIP job offer PR + Employment contract AIP PR + Employer designation AIP PR + Company registration AIP PR + Endorsement AIP PR + AIP PR proof + Salary + AIP PR application"
  },
  {
    "id": "ca-WRK-010",
    "officialCode": "CA-WRK-010",
    "name": "Canada Work Permit - Provincial Nominee PNP Work Permit PNP Work Permit PNP Work Permit Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 155 PNP work permit Canada regional",
    "validity": "1Y 2Y PNP work permit PNP work permit Canada regional",
    "docs": "PNP job offer Canada + Employment contract Canada PNP + Employer registration + Company registration Canada PNP + PNP nomination + PNP work permit support letter + Salary + PNP work permit application IRCC + PNP job offer + Employment contract PNP + Employer + Company registration PNP + PNP nomination + PNP work permit support letter + Salary + PNP work permit application"
  },
  {
    "id": "ca-WRK-011",
    "officialCode": "CA-WRK-011",
    "name": "Canada Work Permit - Caregiver Work Permit Caregiver Work Permit Caregiver Work Permit Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 155 Caregiver work permit Canada",
    "validity": "1Y 2Y caregiver work permit caregiver work permit Canada",
    "docs": "Caregiver job offer Canada + Employment contract Canada caregiver + Employer registration + Company registration Canada caregiver + Caregiver proof + Qualifications + Caregiver application IRCC + Caregiver job offer + Employment contract caregiver + Employer + Company registration caregiver + Caregiver proof + Qualifications + Caregiver application"
  },
  {
    "id": "ca-WRK-012",
    "officialCode": "CA-WRK-012",
    "name": "Canada Work Permit - Live-in Caregiver LCP LCP Live-in Caregiver LCP Canada - Legacy",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 155 Live-in caregiver LCP Canada",
    "validity": "1Y 2Y live-in caregiver LCP live-in caregiver LCP Canada",
    "docs": "Live-in caregiver job offer Canada + Employment contract Canada live-in caregiver + Employer registration + Company registration Canada live-in caregiver + Live-in caregiver proof + Qualifications + Live-in caregiver LCP application IRCC + Live-in caregiver job offer + Employment contract live-in caregiver + Employer + Company registration live-in caregiver + Live-in caregiver proof + Qualifications + Live-in caregiver LCP application"
  },
  {
    "id": "ca-WRK-013",
    "officialCode": "CA-WRK-013",
    "name": "Canada Work Permit - Post Graduation Work Permit PGWP 3Y Post Graduation Work Permit PGWP 3Y PGWP Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 255 PGWP 3Y Canada",
    "validity": "3Y PGWP post graduation work permit 3Y PGWP Canada",
    "docs": "PGWP eligibility Canada + Graduation certificate Canada + Study permit Canada + Institution DLI + PGWP application IRCC + PGWP eligibility + Graduation certificate + Study permit + Institution DLI + PGWP application",
    "warningBox": "MOST IMPORTANT: Post-Graduation Work Permit PGWP 3Y - Graduate - Open Work Permit"
  },
  {
    "id": "ca-WRK-014",
    "officialCode": "CA-WRK-014",
    "name": "Canada Work Permit - Spouse Open Work Permit SOWP Spouse Open Work Permit SOWP SOWP Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 255 SOWP spouse open work permit Canada",
    "validity": "1Y 3Y SOWP spouse open work permit SOWP Canada",
    "docs": "SOWP eligibility Canada + Spouse study work permit + Relationship proof + Marriage certificate + Spouse work study proof + SOWP application IRCC + SOWP eligibility + Spouse study work permit + Relationship proof + Marriage certificate + Spouse work study proof + SOWP application"
  },
  {
    "id": "ca-WRK-015",
    "officialCode": "CA-WRK-015",
    "name": "Canada Work Permit - Bridging Open Work Permit BOWP Bridging Open Work Permit BOWP BOWP Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 255 BOWP bridging open work permit Canada",
    "validity": "1Y BOWP bridging open work permit BOWP Canada",
    "docs": "BOWP eligibility Canada + PR application + AOR + Current work permit + BOWP application IRCC + BOWP eligibility + PR application + AOR + Current work permit + BOWP application"
  },
  {
    "id": "ca-WRK-016",
    "officialCode": "CA-WRK-016",
    "name": "Canada Work Permit - Working Holiday IEC 1Y 2Y Working Holiday IEC 1Y 2Y Working Holiday IEC Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORKING_HOLIDAY_VISA",
    "fee": "CAD 172 IEC working holiday Canada",
    "validity": "1Y 2Y IEC working holiday 1Y 2Y working holiday IEC Canada",
    "docs": "IEC invitation Canada + Age 18-35 + Financial means CAD 2500 + Insurance + IEC working holiday application IRCC + IEC invitation + Age + Financial means + Insurance + IEC working holiday application"
  },
  {
    "id": "ca-WRK-017",
    "officialCode": "CA-WRK-017",
    "name": "Canada Work Permit - Young Professional IEC Young Professional IEC Young Professional IEC Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 172 Young professional IEC Canada",
    "validity": "1Y 2Y young professional IEC young professional IEC Canada",
    "docs": "Young professional job offer Canada + Employment contract Canada young professional + Employer registration + Company registration Canada young professional + Young professional proof + Qualifications + Young professional IEC application IRCC + Young professional job offer + Employment contract young professional + Employer + Company registration young professional + Young professional proof + Qualifications + Young professional IEC application"
  },
  {
    "id": "ca-WRK-018",
    "officialCode": "CA-WRK-018",
    "name": "Canada Work Permit - Co-op Work Permit Co-op Work Permit Co-op Work Permit Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "INTERN_VISA",
    "fee": "CAD 155 Co-op work permit Canada",
    "validity": "1Y co-op work permit co-op work permit Canada",
    "docs": "Co-op offer Canada + Co-op letter institution + Study permit + Institution DLI + Co-op application IRCC + Co-op offer + Co-op letter + Study permit + Institution DLI + Co-op application"
  },
  {
    "id": "ca-WRK-019",
    "officialCode": "CA-WRK-019",
    "name": "Canada Work Permit - Francophone Mobility Francophone Mobility Work Permit Francophone Mobility Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 155 Francophone mobility work permit Canada",
    "validity": "1Y 3Y francophone mobility work permit francophone mobility Canada",
    "docs": "Francophone mobility job offer Canada + Employment contract Canada francophone mobility + Employer registration + Company registration Canada francophone mobility + French language CLB 5 + Francophone mobility proof + Salary + Francophone mobility application IRCC + Francophone mobility job offer + Employment contract francophone mobility + Employer + Company registration francophone mobility + French language + Francophone mobility proof + Salary + Francophone mobility application"
  },
  {
    "id": "ca-WRK-020",
    "officialCode": "CA-WRK-020",
    "name": "Canada Work Permit - Atlantic High Skilled AIP High Skilled AIP High Skilled AIP Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 AIP high skilled Canada regional",
    "validity": "1Y AIP high skilled AIP high skilled AIP Canada regional",
    "docs": "AIP high skilled job offer Canada + Employment contract Canada AIP high skilled + Employer designation AIP high skilled + Company registration Canada AIP high skilled + Endorsement AIP high skilled + AIP high skilled proof + Salary + AIP high skilled application IRCC + AIP high skilled job offer + Employment contract AIP high skilled + Employer designation AIP high skilled + Company registration AIP high skilled + Endorsement AIP high skilled + AIP high skilled proof + Salary + AIP high skilled application"
  },
  {
    "id": "ca-WRK-021",
    "officialCode": "CA-WRK-021",
    "name": "Canada Work Permit - Atlantic Intermediate Skilled AIP Intermediate Skilled AIP Intermediate Skilled AIP Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 AIP intermediate skilled Canada regional",
    "validity": "1Y AIP intermediate skilled AIP intermediate skilled AIP Canada regional",
    "docs": "AIP intermediate skilled job offer Canada + Employment contract Canada AIP intermediate skilled + Employer designation AIP intermediate skilled + Company registration Canada AIP intermediate skilled + Endorsement AIP intermediate skilled + AIP intermediate skilled proof + Salary + AIP intermediate skilled application IRCC + AIP intermediate skilled job offer + Employment contract AIP intermediate skilled + Employer designation AIP intermediate skilled + Company registration AIP intermediate skilled + Endorsement AIP intermediate skilled + AIP intermediate skilled proof + Salary + AIP intermediate skilled application"
  },
  {
    "id": "ca-WRK-022",
    "officialCode": "CA-WRK-022",
    "name": "Canada Work Permit - Atlantic International Graduate AIP International Graduate AIP International Graduate AIP Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 AIP international graduate Canada regional",
    "validity": "1Y AIP international graduate AIP international graduate AIP Canada regional",
    "docs": "AIP international graduate job offer Canada + Employment contract Canada AIP international graduate + Employer designation AIP international graduate + Company registration Canada AIP international graduate + Endorsement AIP international graduate + Graduation certificate Atlantic + AIP international graduate proof + Salary + AIP international graduate application IRCC + AIP international graduate job offer + Employment contract AIP international graduate + Employer designation AIP international graduate + Company registration AIP international graduate + Endorsement AIP international graduate + Graduation certificate Atlantic + AIP international graduate proof + Salary + AIP international graduate application"
  },
  {
    "id": "ca-WRK-023",
    "officialCode": "CA-WRK-023",
    "name": "Canada Work Permit - Quebec QWSP Quebec QWSP Quebec Work Permit QWSP Canada - Regional Quebec",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 Quebec QWSP Canada regional Quebec",
    "validity": "1Y Quebec QWSP Quebec QWSP Canada regional Quebec",
    "docs": "Quebec QWSP job offer Canada + Employment contract Canada Quebec QWSP + Employer registration + Company registration Canada Quebec QWSP + CSQ + CAQ + Quebec QWSP proof + Salary + Quebec QWSP application IRCC + Quebec QWSP job offer + Employment contract Quebec QWSP + Employer + Company registration Quebec QWSP + CSQ + CAQ + Quebec QWSP proof + Salary + Quebec QWSP application",
    "warningBox": "MOST IMPORTANT: Quebec QWSP - CSQ + CAQ + Regional Quebec - French"
  },
  {
    "id": "ca-WRK-024",
    "officialCode": "CA-WRK-024",
    "name": "Canada Work Permit - Yukon Community Pilot YCP YCP Yukon Community Pilot YCP Canada - Regional DAMA",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 YCP Yukon community pilot YCP Canada regional DAMA",
    "validity": "2Y YCP Yukon community pilot YCP Canada regional DAMA",
    "docs": "YCP job offer Canada + Employment contract Canada YCP + Employer designation YCP + Company registration Canada YCP + Community recommendation YCP + YCP proof + Salary + YCP application IRCC + YCP job offer + Employment contract YCP + Employer designation YCP + Company registration YCP + Community recommendation YCP + YCP proof + Salary + YCP application",
    "warningBox": "MOST IMPORTANT: Yukon Community Pilot YCP - Regional DAMA Style - Yukon Community Recommendation"
  },
  {
    "id": "ca-WRK-025",
    "officialCode": "CA-WRK-025",
    "name": "Canada Work Permit - Rural Northern Immigration Pilot RNIP RNIP Rural Northern Immigration Pilot RNIP Canada - Regional DAMA Legacy Now RCIP",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 RNIP rural northern immigration pilot RNIP Canada regional DAMA legacy now RCIP",
    "validity": "RNIP rural northern immigration pilot RNIP Canada regional DAMA legacy now RCIP",
    "docs": "RNIP job offer Canada + Employment contract Canada RNIP + Employer designation RNIP + Company registration Canada RNIP + Community recommendation RNIP + RNIP proof + Salary + RNIP application IRCC + RNIP job offer + Employment contract RNIP + Employer designation RNIP + Company registration RNIP + Community recommendation RNIP + RNIP proof + Salary + RNIP application"
  },
  {
    "id": "ca-WRK-026",
    "officialCode": "CA-WRK-026",
    "name": "Canada Work Permit - LMIA Exempt C10 Significant Benefit C10 Significant Benefit C10 Significant Benefit Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 155 C10 significant benefit work permit Canada LMIA exempt",
    "validity": "1Y 3Y C10 significant benefit work permit C10 significant benefit Canada LMIA exempt",
    "docs": "C10 significant benefit proof Canada + Job offer Canada C10 + Employment contract Canada C10 + Employer registration + Company registration Canada C10 + Significant benefit letter C10 + Salary + C10 application IRCC + C10 significant benefit proof + Job offer C10 + Employment contract C10 + Employer + Company registration C10 + Significant benefit letter C10 + Salary + C10 application"
  },
  {
    "id": "ca-WRK-027",
    "officialCode": "CA-WRK-027",
    "name": "Canada Work Permit - LMIA Exempt C12 Intra Company Transfer C12 Intra Company Transfer C12 Intra Company Transfer Canada LMIA Exempt",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 155 C12 intra company transfer work permit Canada LMIA exempt",
    "validity": "1Y 3Y C12 intra company transfer work permit C12 intra company transfer Canada LMIA exempt",
    "docs": "C12 ICT offer Canada + Employment contract Canada C12 ICT + Employer registration + Company registration Canada C12 ICT + Company relationship C12 + ICT proof 1Y C12 + Salary + Qualifications C12 + C12 application IRCC + C12 ICT offer + Employment contract C12 ICT + Employer + Company registration C12 ICT + Company relationship C12 + ICT proof + Salary + Qualifications + C12 application"
  },
  {
    "id": "ca-WRK-028",
    "officialCode": "CA-WRK-028",
    "name": "Canada Work Permit - Open Work Permit Vulnerable Worker Vulnerable Worker Open Work Permit Vulnerable Worker Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 0 Vulnerable worker open work permit Canada free",
    "validity": "1Y vulnerable worker open work permit vulnerable worker Canada",
    "docs": "Vulnerable worker proof Canada + Abuse proof + Current work permit + Vulnerable worker application IRCC + Vulnerable worker proof + Abuse proof + Current work permit + Vulnerable worker application"
  },
  {
    "id": "ca-WRK-029",
    "officialCode": "CA-WRK-029",
    "name": "Canada Work Permit - Religious Worker C50 Religious Worker C50 Religious Worker C50 Canada LMIA Exempt",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 155 Religious worker C50 work permit Canada LMIA exempt",
    "validity": "1Y 2Y religious worker C50 work permit religious worker C50 Canada LMIA exempt",
    "docs": "Religious worker invitation Canada + Religious organization registration + Religious worker proof + Financial means + Accommodation + Insurance + Religious worker C50 application IRCC + Religious worker invitation + Religious organization registration + Religious worker proof + Financial means + Accommodation + Insurance + Religious worker C50 application"
  },
  {
    "id": "ca-WRK-030",
    "officialCode": "CA-WRK-030",
    "name": "Canada Work Permit - Charitable Worker Religious Charitable Worker Religious Charitable Worker Religious Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "work",
    "record_type": "WORK_VISA",
    "fee": "CAD 155 Charitable worker religious work permit Canada",
    "validity": "1Y 2Y charitable worker religious work permit charitable worker religious Canada",
    "docs": "Charitable worker invitation Canada + Charitable organization registration + Charitable worker proof + Financial means + Accommodation + Insurance + Charitable worker application IRCC + Charitable worker invitation + Charitable organization registration + Charitable worker proof + Financial means + Accommodation + Insurance + Charitable worker application"
  },
  {
    "id": "ca-STU-001",
    "officialCode": "CA-STU-001",
    "name": "Canada Study Permit Study Permit Study Permit - Most common Student Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STUDENT_VISA",
    "fee": "CAD 150 Study permit Canada + Biometrics CAD 85",
    "validity": "Study duration + 90 days study permit study permit Canada",
    "docs": "Offer of place Canada education provider LOA + Education provider registration DLI + Admission letter + Tuition fee receipt + Financial means CAD 20635/year + Accommodation + Insurance + Study permit application IRCC + Offer of place + Education provider registration + Admission letter + Tuition fee receipt + Financial means + Accommodation + Insurance + Study permit application",
    "fundsBox": "CAD 20635/year = Bank CAD 20635/year = Study permit Canada IRCC - GIC",
    "bankBox": "Bank 6M CAD 20635/year original + GIC CAD 20635 + Tuition fee receipt + Study permit Canada",
    "warningBox": "✅ Most common student Canada Study Permit + DLI LOA + CAD 20635/year + GIC + Biometrics"
  },
  {
    "id": "ca-STU-002",
    "officialCode": "CA-STU-002",
    "name": "Canada Study Permit Extension Extension Study Permit Extension Study Permit Extension Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STATUS_DOCUMENT",
    "fee": "CAD 150 Study permit extension Canada",
    "validity": "Extension study permit extension Canada",
    "docs": "Extension reason letter + Offer of place Canada extension + Education provider registration DLI extension + Admission letter extension + Tuition fee receipt extension + Financial means CAD 20635/year extension + Accommodation extension + Insurance extension + Extension application IRCC + Extension reason + Offer of place extension + Education provider registration extension + Admission letter extension + Tuition fee receipt extension + Financial means extension + Accommodation extension + Insurance extension + Extension application"
  },
  {
    "id": "ca-STU-003",
    "officialCode": "CA-STU-003",
    "name": "Canada Study Permit - SDS Student Direct Stream SDS SDS Student Direct Stream SDS Canada - Fast Track",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STUDENT_VISA",
    "fee": "CAD 150 SDS study permit Canada fast track 20 days",
    "validity": "Study duration + 90 days SDS study permit SDS Canada fast track",
    "docs": "SDS offer Canada + DLI + GIC CAD 20635 + IELTS 6.0 + Tuition fee receipt + Financial means + SDS application IRCC + SDS offer + DLI + GIC + IELTS + Tuition fee receipt + Financial means + SDS application",
    "warningBox": "MOST IMPORTANT: SDS Student Direct Stream - 20 Day Fast Track - GIC + IELTS 6.0 + India China etc"
  },
  {
    "id": "ca-STU-004",
    "officialCode": "CA-STU-004",
    "name": "Canada Study Permit - Co-op Work Permit Co-op Work Permit Co-op Work Permit Canada - Student Co-op",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "INTERN_VISA",
    "fee": "CAD 155 Co-op work permit Canada student co-op",
    "validity": "Study duration co-op work permit co-op work permit Canada student co-op",
    "docs": "Co-op offer Canada + Co-op letter institution + Study permit + Institution DLI + Co-op application IRCC + Co-op offer + Co-op letter + Study permit + Institution DLI + Co-op application"
  },
  {
    "id": "ca-STU-005",
    "officialCode": "CA-STU-005",
    "name": "Canada Study Permit - Quebec CAQ CAQ Quebec CAQ Quebec CAQ Canada - Regional Quebec",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STUDENT_VISA",
    "fee": "CAD 150 Study permit CAQ Quebec CAQ Canada regional Quebec",
    "validity": "Study duration CAQ Quebec CAQ Quebec CAQ Canada regional Quebec",
    "docs": "Quebec CAQ offer Canada + CAQ application + DLI Quebec + Admission letter Quebec + Tuition fee receipt Quebec + Financial means Quebec + CAQ study permit application IRCC + Quebec CAQ offer + CAQ application + DLI Quebec + Admission letter Quebec + Tuition fee receipt Quebec + Financial means Quebec + CAQ study permit application",
    "warningBox": "MOST IMPORTANT: Quebec CAQ - Certificat Acceptation Quebec - Required for Quebec Study"
  },
  {
    "id": "ca-STU-006",
    "officialCode": "CA-STU-006",
    "name": "Canada Study Permit - PhD Doctoral PhD Doctoral PhD Doctoral Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STUDENT_VISA",
    "fee": "CAD 150 PhD doctoral study permit Canada",
    "validity": "4Y PhD doctoral study permit PhD doctoral Canada",
    "docs": "PhD offer Canada university + University registration DLI PhD + PhD research proposal + Admission letter PhD + Tuition fee receipt PhD + Financial means PhD + Accommodation PhD + Insurance PhD + PhD study permit application IRCC + PhD offer + University registration PhD + PhD research proposal + Admission letter PhD + Tuition fee receipt PhD + Financial means PhD + Accommodation PhD + Insurance PhD + PhD study permit application"
  },
  {
    "id": "ca-STU-007",
    "officialCode": "CA-STU-007",
    "name": "Canada Study Permit - Language Course Language Course Language Course Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STUDENT_VISA",
    "fee": "CAD 150 Language course study permit Canada",
    "validity": "1Y language course study permit language course Canada",
    "docs": "Language course offer Canada + Language course registration DLI + Language course details + Financial means + Accommodation + Insurance + Language course study permit application IRCC + Language course offer + Language course registration + Language course details + Financial means + Accommodation + Insurance + Language course application"
  },
  {
    "id": "ca-STU-008",
    "officialCode": "CA-STU-008",
    "name": "Canada Study Permit - Exchange Student Exchange Student Exchange Student Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STUDENT_VISA",
    "fee": "CAD 150 Exchange student study permit Canada",
    "validity": "1Y exchange student study permit exchange student Canada",
    "docs": "Exchange offer Canada + Exchange organization registration + Exchange details + Admission letter + Financial means + Accommodation + Insurance + Exchange student study permit application IRCC + Exchange offer + Exchange organization registration + Exchange details + Admission letter + Financial means + Accommodation + Insurance + Exchange student application"
  },
  {
    "id": "ca-STU-009",
    "officialCode": "CA-STU-009",
    "name": "Canada Study Permit - Post Graduation PG Diploma PG Diploma PG Diploma Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STUDENT_VISA",
    "fee": "CAD 150 PG diploma study permit Canada",
    "validity": "2Y PG diploma study permit PG diploma Canada",
    "docs": "PG diploma offer Canada + Education provider registration DLI PG diploma + Admission letter PG diploma + Tuition fee receipt PG diploma + Financial means + Accommodation + Insurance + PG diploma study permit application IRCC + PG diploma offer + Education provider registration PG diploma + Admission letter PG diploma + Tuition fee receipt PG diploma + Financial means + Accommodation + Insurance + PG diploma application"
  },
  {
    "id": "ca-STU-010",
    "officialCode": "CA-STU-010",
    "name": "Canada Study Permit - Internship Internship Internship Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "INTERN_VISA",
    "fee": "CAD 150 Internship study permit Canada",
    "validity": "1Y internship study permit internship Canada",
    "docs": "Internship offer Canada + Internship agreement + University enrollment + Offer of place Canada + Education provider registration DLI + Financial means + Accommodation + Insurance + Internship study permit application IRCC + Internship offer + Internship agreement + University enrollment + Offer of place + Education provider registration + Financial means + Accommodation + Insurance + Internship application"
  },
  {
    "id": "ca-STU-011",
    "officialCode": "CA-STU-011",
    "name": "Canada Study Permit - Kindergarten K-12 K-12 Kindergarten K-12 K-12 Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STUDENT_VISA",
    "fee": "CAD 150 K-12 study permit Canada",
    "validity": "K-12 study duration K-12 study permit K-12 Canada",
    "docs": "K-12 offer Canada school + School registration DLI K-12 + Admission letter K-12 + Tuition fee receipt K-12 + Financial means K-12 + Accommodation K-12 + Insurance K-12 + Custodian declaration K-12 + K-12 study permit application IRCC + K-12 offer + School registration K-12 + Admission letter K-12 + Tuition fee receipt K-12 + Financial means K-12 + Accommodation K-12 + Insurance K-12 + Custodian declaration K-12 + K-12 application"
  },
  {
    "id": "ca-STU-012",
    "officialCode": "CA-STU-012",
    "name": "Canada Study Permit - Flight School Flight School Flight School Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STUDENT_VISA",
    "fee": "CAD 150 Flight school study permit Canada",
    "validity": "1Y flight school study permit flight school Canada",
    "docs": "Flight school offer Canada + Flight school registration DLI + Admission letter flight school + Tuition fee receipt flight school + Financial means + Accommodation + Insurance + Medical exam flight school + Flight school study permit application IRCC + Flight school offer + Flight school registration + Admission letter flight school + Tuition fee receipt flight school + Financial means + Accommodation + Insurance + Medical exam flight school + Flight school application"
  },
  {
    "id": "ca-STU-013",
    "officialCode": "CA-STU-013",
    "name": "Canada Study Permit - Pathway Program Pathway Program Pathway Program Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STUDENT_VISA",
    "fee": "CAD 150 Pathway program study permit Canada",
    "validity": "1Y pathway program study permit pathway program Canada",
    "docs": "Pathway offer Canada + Education provider registration DLI pathway + Admission letter pathway + Tuition fee receipt pathway + Financial means + Accommodation + Insurance + Pathway study permit application IRCC + Pathway offer + Education provider registration pathway + Admission letter pathway + Tuition fee receipt pathway + Financial means + Accommodation + Insurance + Pathway application"
  },
  {
    "id": "ca-STU-014",
    "officialCode": "CA-STU-014",
    "name": "Canada Study Permit - Francophone Studies Francophone Studies Francophone Studies Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STUDENT_VISA",
    "fee": "CAD 150 Francophone studies study permit Canada",
    "validity": "Study duration francophone studies study permit francophone studies Canada",
    "docs": "Francophone offer Canada + Education provider registration DLI francophone + Admission letter francophone + Tuition fee receipt francophone + Financial means + Accommodation + Insurance + French language + Francophone study permit application IRCC + Francophone offer + Education provider registration francophone + Admission letter francophone + Tuition fee receipt francophone + Financial means + Accommodation + Insurance + French language + Francophone application"
  },
  {
    "id": "ca-STU-015",
    "officialCode": "CA-STU-015",
    "name": "Canada Study Permit - Refused Restored Restored Study Permit Restored Study Permit Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "student",
    "record_type": "STATUS_DOCUMENT",
    "fee": "CAD 350 Restoration study permit Canada",
    "validity": "Restoration 90 days restored study permit restored Canada",
    "docs": "Restoration reason letter study permit + Offer of place Canada restoration + Education provider registration DLI restoration + Admission letter restoration + Tuition fee receipt restoration + Financial means restoration + Accommodation restoration + Insurance restoration + Restoration application IRCC + Restoration reason + Offer of place restoration + Education provider registration restoration + Admission letter restoration + Tuition fee receipt restoration + Financial means restoration + Accommodation restoration + Insurance restoration + Restoration application"
  },
  {
    "id": "ca-FAM-001",
    "officialCode": "CA-FAM-001",
    "name": "Canada Family Sponsorship Spouse Partner 1Y Family Sponsorship Spouse Partner 1Y - Most common Family Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 1080 Family sponsorship spouse partner 1Y Canada",
    "validity": "PR family sponsorship spouse partner 1Y family sponsorship spouse partner Canada",
    "docs": "Relationship proof + Canadian family member PR citizenship + Marriage certificate attested + Canadian family member PR citizenship + Financial means Canadian family member + Accommodation Canadian family member + Family sponsorship spouse partner application IRCC + Relationship proof + Canadian family member PR + Marriage certificate + Canadian family member PR + Financial means + Accommodation",
    "warningBox": "✅ Most common family Canada Family Sponsorship Spouse Partner PR - IRCC - Inland/Outland"
  },
  {
    "id": "ca-FAM-002",
    "officialCode": "CA-FAM-002",
    "name": "Canada Family Sponsorship Parents Grandparents PGP PR Parents Grandparents PGP PR Parents Grandparents PGP Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 1080 Family sponsorship parents grandparents PGP PR Canada",
    "validity": "PR family sponsorship parents grandparents PGP PR parents grandparents PGP Canada",
    "docs": "Relationship proof parents grandparents PGP + Canadian child PR citizenship PGP + Birth certificate PGP + Canadian child PR citizenship PGP + Financial means LICO 3Y PGP + PGP invitation + PGP application IRCC + Relationship proof PGP + Canadian child PR PGP + Birth certificate PGP + Canadian child PR PGP + Financial means LICO 3Y PGP + PGP invitation + PGP application"
  },
  {
    "id": "ca-FAM-003",
    "officialCode": "CA-FAM-003",
    "name": "Canada Super Visa 2Y 5Y Super Visa 2Y 5Y Super Visa Parents Grandparents Canada - Family Long Stay",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 100 Super visa 2Y 5Y Canada + Insurance CAD 100k",
    "validity": "2Y per entry 5Y super visa 2Y 5Y super visa Canada family long stay",
    "docs": "Invitation super visa + Host child PR citizenship + Relationship proof super visa + Birth certificate + Host financial LICO + Insurance CAD 100k 1Y + Medical exam super visa + Super visa application IRCC + Invitation super visa + Host child PR + Relationship proof + Birth certificate + Host financial LICO + Insurance CAD 100k + Medical exam + Super visa application"
  },
  {
    "id": "ca-FAM-004",
    "officialCode": "CA-FAM-004",
    "name": "Canada Family Sponsorship Child Dependent Child Dependent Child Dependent Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 150 Family sponsorship child dependent Canada",
    "validity": "PR family sponsorship child dependent family sponsorship child dependent Canada",
    "docs": "Relationship proof child dependent + Canadian parent PR citizenship + Birth certificate dependent + Canadian parent PR citizenship + Financial means + Accommodation + Child dependent application IRCC + Relationship proof child + Canadian parent PR + Birth certificate dependent + Canadian parent PR + Financial means + Accommodation"
  },
  {
    "id": "ca-FAM-005",
    "officialCode": "CA-FAM-005",
    "name": "Canada Family Open Work Permit Spouse SOWP Family Open Work Permit Spouse SOWP SOWP Family Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 255 SOWP spouse open work permit family Canada",
    "validity": "1Y 3Y SOWP spouse open work permit SOWP family Canada",
    "docs": "SOWP eligibility family + Spouse PR application + Relationship proof + Marriage certificate + Spouse work study proof + SOWP family application IRCC + SOWP eligibility + Spouse PR application + Relationship proof + Marriage certificate + Spouse work study proof + SOWP family application"
  },
  {
    "id": "ca-FAM-006",
    "officialCode": "CA-FAM-006",
    "name": "Canada Visitor Visa Family Reunification TRV Family Reunification TRV Family Reunification TRV Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 100 Family reunification TRV Canada",
    "validity": "6M family reunification TRV family reunification TRV Canada",
    "docs": "Invitation family reunification TRV + Host ID PR citizenship TRV + Relationship proof TRV + Birth marriage certificate TRV + Host financial TRV + Family reunification TRV application IRCC + Invitation TRV + Host ID TRV + Relationship proof TRV + Birth marriage certificate TRV + Host financial TRV + Family reunification TRV application"
  },
  {
    "id": "ca-FAM-007",
    "officialCode": "CA-FAM-007",
    "name": "Canada Family Sponsorship - Adoption Adoption Adoption Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 1080 Adoption Canada",
    "validity": "PR adoption PR adoption Canada",
    "docs": "Adoption court order Canada + Adoption proof + Canadian family member PR citizenship + Birth certificate + Canadian family member PR citizenship + Financial means + Accommodation + Adoption application IRCC + Adoption court order + Adoption proof + Canadian family member PR + Birth certificate + Canadian family member PR + Financial means + Accommodation + Adoption court order + Adoption"
  },
  {
    "id": "ca-FAM-008",
    "officialCode": "CA-FAM-008",
    "name": "Canada Family Sponsorship - Orphaned Relative Orphaned Relative Orphaned Relative Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 1080 Orphaned relative Canada",
    "validity": "PR orphaned relative PR orphaned relative Canada",
    "docs": "Orphaned relative proof Canada + Death certificate parents + Relationship proof orphaned + Canadian family member PR citizenship + Birth certificate + Canadian family member PR citizenship + Financial means + Accommodation + Orphaned relative application IRCC + Orphaned relative proof + Death certificate parents + Relationship proof orphaned + Canadian family member PR + Birth certificate + Canadian family member PR + Financial means + Accommodation"
  },
  {
    "id": "ca-FAM-009",
    "officialCode": "CA-FAM-009",
    "name": "Canada Family - Humanitarian Compassionate H&C PR Humanitarian Compassionate H&C PR H&C Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 1080 H&C PR Canada",
    "validity": "PR H&C PR H&C Canada",
    "docs": "Humanitarian reason letter Canada H&C + Humanitarian proof H&C + Financial means H&C + Accommodation H&C + H&C application IRCC + Humanitarian reason letter H&C + Humanitarian proof H&C + Financial means H&C + Accommodation H&C + H&C application"
  },
  {
    "id": "ca-FAM-010",
    "officialCode": "CA-FAM-010",
    "name": "Canada Family - Conjugal Partner Conjugal Partner Conjugal Partner Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 1080 Conjugal partner Canada",
    "validity": "PR conjugal partner PR conjugal partner Canada",
    "docs": "Conjugal partner proof Canada + Relationship proof conjugal + Barrier proof conjugal + Canadian family member PR citizenship + Financial means + Accommodation + Conjugal partner application IRCC + Conjugal partner proof + Relationship proof conjugal + Barrier proof conjugal + Canadian family member PR + Financial means + Accommodation"
  },
  {
    "id": "ca-FAM-011",
    "officialCode": "CA-FAM-011",
    "name": "Canada Family - Common Law Partner Common Law Partner Common Law Partner Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 1080 Common law partner Canada",
    "validity": "PR common law partner PR common law partner Canada",
    "docs": "Common law proof Canada + Cohabiting proof 1Y + Relationship proof common law + Canadian family member PR citizenship + Financial means + Accommodation + Common law partner application IRCC + Common law proof + Cohabiting proof + Relationship proof common law + Canadian family member PR + Financial means + Accommodation"
  },
  {
    "id": "ca-FAM-012",
    "officialCode": "CA-FAM-012",
    "name": "Canada Family - Dependent Child Over 22 Locked-in Dependent Child Over 22 Dependent Child Over 22 Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 150 Dependent child over 22 locked-in Canada",
    "validity": "PR dependent child over 22 locked-in PR dependent child over 22 Canada",
    "docs": "Dependent child over 22 proof Canada + Disability proof + Relationship proof dependent over 22 + Canadian parent PR citizenship + Birth certificate dependent over 22 + Canadian parent PR + Financial means + Accommodation + Dependent child over 22 application IRCC + Dependent child over 22 proof + Disability proof + Relationship proof dependent over 22 + Canadian parent PR + Birth certificate dependent over 22 + Canadian parent PR + Financial means + Accommodation"
  },
  {
    "id": "ca-FAM-013",
    "officialCode": "CA-FAM-013",
    "name": "Canada Family - Parents Grandparents PGP Lottery PGP Lottery PGP Lottery Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 0 PGP lottery Canada",
    "validity": "PGP lottery PGP lottery Canada",
    "docs": "PGP lottery invitation Canada + PGP interest to sponsor + PGP lottery application IRCC + PGP lottery invitation + PGP interest to sponsor + PGP lottery application"
  },
  {
    "id": "ca-FAM-014",
    "officialCode": "CA-FAM-014",
    "name": "Canada Family - Spouse Open Work Permit Inland Inland Spouse Open Work Permit Inland Spouse Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 255 Inland spouse open work permit inland spouse Canada",
    "validity": "1Y inland spouse open work permit inland spouse Canada",
    "docs": "Inland spouse eligibility Canada + Spouse PR application inland + Relationship proof inland + Marriage certificate inland + Spouse work study proof inland + Inland spouse open work permit application IRCC + Inland spouse eligibility + Spouse PR application inland + Relationship proof inland + Marriage certificate inland + Spouse work study proof inland + Inland spouse open work permit application"
  },
  {
    "id": "ca-FAM-015",
    "officialCode": "CA-FAM-015",
    "name": "Canada Family - Atlantic Immigration Program AIP Family AIP Family AIP Family Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "family",
    "record_type": "FAMILY_VISA",
    "fee": "CAD 0 AIP family Canada regional",
    "validity": "AIP family AIP family Canada regional",
    "docs": "AIP family job offer Canada + AIP family relationship + AIP family proof + AIP family application IRCC + AIP family job offer + AIP family relationship + AIP family proof + AIP family application"
  },
  {
    "id": "ca-PR-001",
    "officialCode": "CA-PR-001",
    "name": "Canada PR - Federal Skilled Worker FSW Express Entry FSW Express Entry FSW Express Entry Canada - Most common PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1365 FSW Express Entry PR Canada",
    "validity": "PR FSW express entry PR FSW express entry Canada - Most common PR",
    "docs": "Express Entry profile FSW + CRS points 67+ + IELTS CLB 7 + ECA + Work experience 1Y + Proof funds CAD 15000 + Medical + Police clearance + FSW Express Entry application IRCC + Express Entry profile FSW + CRS points + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + FSW Express Entry application",
    "warningBox": "✅ Most common PR Canada FSW Express Entry - CRS 67+ - CLB 7 - ECA - CAD 15000"
  },
  {
    "id": "ca-PR-002",
    "officialCode": "CA-PR-002",
    "name": "Canada PR - Canadian Experience Class CEC Express Entry CEC Express Entry CEC Express Entry Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1365 CEC Express Entry PR Canada",
    "validity": "PR CEC express entry PR CEC express entry Canada",
    "docs": "Express Entry profile CEC + Canadian work experience 1Y + IELTS CLB 5-7 + Proof funds + Medical + Police clearance + CEC Express Entry application IRCC + Express Entry profile CEC + Canadian work experience + IELTS + Proof funds + Medical + Police clearance + CEC Express Entry application"
  },
  {
    "id": "ca-PR-003",
    "officialCode": "CA-PR-003",
    "name": "Canada PR - Federal Skilled Trades FST Express Entry FST Express Entry FST Express Entry Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1365 FST Express Entry PR Canada",
    "validity": "PR FST express entry PR FST express entry Canada",
    "docs": "Express Entry profile FST + Job offer trades + Certificate qualification trades + IELTS CLB 5 + Work experience 2Y trades + Proof funds + Medical + Police clearance + FST Express Entry application IRCC + Express Entry profile FST + Job offer trades + Certificate qualification trades + IELTS + Work experience trades + Proof funds + Medical + Police clearance + FST Express Entry application"
  },
  {
    "id": "ca-PR-004",
    "officialCode": "CA-PR-004",
    "name": "Canada PR - Provincial Nominee PNP Express Entry PNP Express Entry PNP Express Entry Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1365 PNP Express Entry PR Canada regional",
    "validity": "PR PNP express entry PR PNP express entry Canada regional",
    "docs": "Express Entry profile PNP + PNP nomination + CRS 600+ + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + PNP Express Entry application IRCC + Express Entry profile PNP + PNP nomination + CRS + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + PNP Express Entry application",
    "warningBox": "MOST IMPORTANT: PNP Express Entry - Regional - 600 CRS Points Extra - Provincial Nomination"
  },
  {
    "id": "ca-PR-005",
    "officialCode": "CA-PR-005",
    "name": "Canada PR - Provincial Nominee PNP Non Express Entry PNP Non Express Entry PNP Non Express Entry Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1365 PNP non express entry PR Canada regional",
    "validity": "PR PNP non express entry PR PNP non express entry Canada regional",
    "docs": "PNP nomination non express entry + Job offer PNP + Employer registration + Company registration PNP + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + PNP non express entry application IRCC + PNP nomination non express entry + Job offer PNP + Employer + Company registration PNP + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + PNP non express entry application"
  },
  {
    "id": "ca-PR-006",
    "officialCode": "CA-PR-006",
    "name": "Canada PR - Quebec Skilled Worker QSW QSW Quebec Skilled Worker QSW Quebec Skilled Worker QSW Canada - Regional Quebec",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1099 QSW Quebec skilled worker PR Canada regional Quebec",
    "validity": "PR QSW Quebec skilled worker PR QSW Quebec skilled worker Canada regional Quebec",
    "docs": "QSW application Quebec + CSQ Quebec + CAQ Quebec + French language + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + QSW Quebec skilled worker application IRCC + QSW application Quebec + CSQ Quebec + CAQ Quebec + French language + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + QSW application"
  },
  {
    "id": "ca-PR-007",
    "officialCode": "CA-PR-007",
    "name": "Canada PR - Atlantic Immigration Program AIP PR AIP PR AIP PR Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1365 AIP PR AIP PR Canada regional",
    "validity": "PR AIP PR AIP PR Canada regional",
    "docs": "AIP job offer Canada PR + Employer designation AIP PR + Endorsement AIP PR + Company registration Canada AIP PR + IELTS CLB 4-5 + ECA + Work experience 1Y + Proof funds + Medical + Police clearance + AIP PR application IRCC + AIP job offer PR + Employer designation AIP PR + Endorsement AIP PR + Company registration AIP PR + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + AIP PR application"
  },
  {
    "id": "ca-PR-008",
    "officialCode": "CA-PR-008",
    "name": "Canada PR - Rural Community Immigration Pilot RCIP PR RCIP PR RCIP PR Canada - Regional DAMA Style New 2025",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1365 RCIP PR RCIP PR Canada regional DAMA style new 2025",
    "validity": "PR RCIP PR RCIP PR Canada regional DAMA style new 2025",
    "docs": "RCIP job offer Canada PR + Employer designation RCIP PR + Community recommendation RCIP PR + Company registration Canada RCIP PR + IELTS CLB 4-6 + ECA + Work experience 1Y + Proof funds + Medical + Police clearance + RCIP PR application IRCC + RCIP job offer PR + Employer designation RCIP PR + Community recommendation RCIP PR + Company registration RCIP PR + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + RCIP PR application",
    "warningBox": "MOST IMPORTANT: RCIP PR - New 2025 - Rural Community - DAMA Style - Community Recommendation"
  },
  {
    "id": "ca-PR-009",
    "officialCode": "CA-PR-009",
    "name": "Canada PR - Francophone Community Immigration Pilot FCIP PR FCIP PR FCIP PR Canada - Regional Francophone",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1365 FCIP PR FCIP PR Canada regional francophone",
    "validity": "PR FCIP PR FCIP PR Canada regional francophone",
    "docs": "FCIP job offer Canada PR + Employer designation FCIP PR + Community recommendation FCIP PR + Company registration Canada FCIP PR + French language CLB 5 + IELTS + ECA + Work experience 1Y + Proof funds + Medical + Police clearance + FCIP PR application IRCC + FCIP job offer PR + Employer designation FCIP PR + Community recommendation FCIP PR + Company registration FCIP PR + French language + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + FCIP PR application"
  },
  {
    "id": "ca-PR-010",
    "officialCode": "CA-PR-010",
    "name": "Canada PR - Agri Food Pilot AFP PR Agri Food Pilot AFP PR AFP PR Canada - Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1365 AFP PR AFP PR Canada regional",
    "validity": "PR AFP PR AFP PR Canada regional",
    "docs": "AFP job offer Canada PR + Employer registration AFP PR + Company registration Canada AFP PR + IELTS CLB 4 + ECA + Work experience 1Y non seasonal + Proof funds + Medical + Police clearance + AFP PR application IRCC + AFP job offer PR + Employer registration AFP PR + Company registration AFP PR + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + AFP PR application"
  },
  {
    "id": "ca-PR-011",
    "officialCode": "CA-PR-011",
    "name": "Canada PR - Home Child Care Provider Pilot PR Home Child Care Provider Pilot PR Home Child Care Provider Pilot PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1080 Home child care provider pilot PR Canada",
    "validity": "PR home child care provider pilot PR home child care provider pilot PR Canada",
    "docs": "Home child care job offer Canada PR + Employer registration + Company registration Canada home child care PR + Home child care proof + IELTS CLB 5 + ECA + Work experience 1Y + Proof funds + Medical + Police clearance + Home child care pilot PR application IRCC + Home child care job offer PR + Employer + Company registration home child care PR + Home child care proof + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + Home child care pilot PR application"
  },
  {
    "id": "ca-PR-012",
    "officialCode": "CA-PR-012",
    "name": "Canada PR - Home Support Worker Pilot PR Home Support Worker Pilot PR Home Support Worker Pilot PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1080 Home support worker pilot PR Canada",
    "validity": "PR home support worker pilot PR home support worker pilot PR Canada",
    "docs": "Home support job offer Canada PR + Employer registration + Company registration Canada home support PR + Home support proof + IELTS CLB 5 + ECA + Work experience 1Y + Proof funds + Medical + Police clearance + Home support pilot PR application IRCC + Home support job offer PR + Employer + Company registration home support PR + Home support proof + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + Home support pilot PR application"
  },
  {
    "id": "ca-PR-013",
    "officialCode": "CA-PR-013",
    "name": "Canada PR - Quebec Investor QIIP PR Quebec Investor QIIP PR Quebec Investor QIIP PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1M Quebec investor QIIP PR Canada",
    "validity": "PR Quebec investor QIIP PR Quebec investor QIIP PR Canada",
    "docs": "Quebec investor business plan Canada PR + Company registration Canada Quebec investor PR + Investment CAD 1M + Quebec investor proof + Business plan + Investment proof + Financial means + Medical + Police clearance + Quebec investor QIIP PR application IRCC + Quebec investor business plan PR + Company registration Quebec investor PR + Investment + Quebec investor proof + Business plan + Investment proof + Financial means + Medical + Police clearance + Quebec investor QIIP PR application"
  },
  {
    "id": "ca-PR-014",
    "officialCode": "CA-PR-014",
    "name": "Canada PR - Start-up Visa PR Start-up Visa PR Start-up Visa PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1545 Start-up visa PR Canada",
    "validity": "PR start-up visa PR start-up visa PR Canada",
    "docs": "Start-up business plan Canada PR + Designated organization letter support PR + Company registration Canada start-up PR + Investment PR + Start-up proof PR + Business plan PR + Investment proof PR + Financial means PR + Medical PR + Police clearance PR + Start-up visa PR application IRCC + Start-up business plan PR + Designated organization letter PR + Company registration start-up PR + Investment PR + Start-up proof PR + Business plan PR + Investment proof PR + Financial means PR + Medical PR + Police clearance PR + Start-up visa PR application"
  },
  {
    "id": "ca-PR-015",
    "officialCode": "CA-PR-015",
    "name": "Canada PR - Self Employed PR Self Employed PR Self Employed PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1540 Self employed PR Canada",
    "validity": "PR self employed PR self employed PR Canada",
    "docs": "Self employed business plan Canada PR + Self employed cultural athletic proof PR + Company registration Canada self employed PR + Financial means self employed PR + Self employed proof PR + Clients PR + Medical PR + Police clearance PR + Self employed PR application IRCC + Self employed business plan PR + Self employed cultural athletic proof PR + Company registration self employed PR + Financial means self employed PR + Self employed proof PR + Clients PR + Medical PR + Police clearance PR + Self employed PR application"
  },
  {
    "id": "ca-PR-016",
    "officialCode": "CA-PR-016",
    "name": "Canada PR - Family Sponsorship Spouse PR Family Sponsorship Spouse PR Family Sponsorship Spouse PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1080 Family sponsorship spouse PR Canada",
    "validity": "PR family sponsorship spouse PR family sponsorship spouse PR Canada",
    "docs": "Relationship proof + Canadian family member PR citizenship + Marriage certificate attested + Canadian family member PR citizenship + Financial means Canadian family member + Accommodation Canadian family member + Medical + Police clearance + Family sponsorship spouse PR application IRCC + Relationship proof + Canadian family member PR + Marriage certificate + Canadian family member PR + Financial means + Accommodation + Medical + Police clearance"
  },
  {
    "id": "ca-PR-017",
    "officialCode": "CA-PR-017",
    "name": "Canada PR - Parents Grandparents PGP PR Parents Grandparents PGP PR Parents Grandparents PGP PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1080 PGP PR Parents grandparents PGP PR Canada",
    "validity": "PR PGP PR parents grandparents PGP PR parents grandparents PGP PR Canada",
    "docs": "Relationship proof parents grandparents PGP PR + Canadian child PR citizenship PGP PR + Birth certificate PGP PR + Canadian child PR citizenship PGP PR + Financial means LICO 3Y PGP PR + PGP invitation PR + Medical PR + Police clearance PR + PGP PR application IRCC + Relationship proof PGP PR + Canadian child PR PGP PR + Birth certificate PGP PR + Canadian child PR PGP PR + Financial means LICO 3Y PGP PR + PGP invitation PR + Medical PR + Police clearance PR + PGP PR application"
  },
  {
    "id": "ca-PR-018",
    "officialCode": "CA-PR-018",
    "name": "Canada PR - Yukon Community Pilot YCP PR YCP PR YCP PR Canada - Regional DAMA",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1365 YCP PR YCP PR Canada regional DAMA",
    "validity": "PR YCP PR YCP PR Canada regional DAMA",
    "docs": "YCP job offer Canada PR + Employer designation YCP PR + Community recommendation YCP PR + Company registration Canada YCP PR + IELTS CLB 4-6 + ECA + Work experience 1Y + Proof funds + Medical + Police clearance + YCP PR application IRCC + YCP job offer PR + Employer designation YCP PR + Community recommendation YCP PR + Company registration YCP PR + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + YCP PR application"
  },
  {
    "id": "ca-PR-019",
    "officialCode": "CA-PR-019",
    "name": "Canada PR - Quebec Experience Program PEQ PR Quebec Experience Program PEQ PR PEQ PR Canada - Regional Quebec",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1099 PEQ PR Quebec experience program PEQ PR Canada regional Quebec",
    "validity": "PR PEQ PR Quebec experience program PEQ PR PEQ PR Canada regional Quebec",
    "docs": "PEQ application Quebec PR + CSQ Quebec PR + CAQ Quebec PR + Quebec work study experience + French language CLB 7 + Proof funds + Medical + Police clearance + PEQ PR application IRCC + PEQ application Quebec PR + CSQ Quebec PR + CAQ Quebec PR + Quebec work study experience + French language + Proof funds + Medical + Police clearance + PEQ PR application"
  },
  {
    "id": "ca-PR-020",
    "officialCode": "CA-PR-020",
    "name": "Canada PR - Humanitarian Compassionate H&C PR Humanitarian Compassionate H&C PR H&C PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1080 H&C PR Canada",
    "validity": "PR H&C PR H&C PR Canada",
    "docs": "Humanitarian reason letter Canada H&C PR + Humanitarian proof H&C PR + Financial means H&C PR + Accommodation H&C PR + Medical H&C PR + Police clearance H&C PR + H&C PR application IRCC + Humanitarian reason letter H&C PR + Humanitarian proof H&C PR + Financial means H&C PR + Accommodation H&C PR + Medical H&C PR + Police clearance H&C PR + H&C PR application"
  },
  {
    "id": "ca-PR-021",
    "officialCode": "CA-PR-021",
    "name": "Canada PR - Protected Person Refugee PR Protected Person Refugee PR Protected Person Refugee PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 0 Protected person refugee PR Canada free",
    "validity": "PR protected person refugee PR protected person refugee PR Canada",
    "docs": "Protected person proof Canada + Refugee claim approval + Financial means + Accommodation + Medical + Police clearance + Protected person refugee PR application IRCC + Protected person proof + Refugee claim approval + Financial means + Accommodation + Medical + Police clearance + Protected person refugee PR application"
  },
  {
    "id": "ca-PR-022",
    "officialCode": "CA-PR-022",
    "name": "Canada PR - Live-in Caregiver LCP PR Live-in Caregiver LCP PR Live-in Caregiver LCP PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1080 Live-in caregiver LCP PR Canada",
    "validity": "PR live-in caregiver LCP PR live-in caregiver LCP PR Canada",
    "docs": "Live-in caregiver proof Canada PR + Work experience 2Y LCP + Employer registration + Company registration Canada LCP PR + IELTS CLB 5 + ECA + Proof funds + Medical + Police clearance + Live-in caregiver LCP PR application IRCC + Live-in caregiver proof PR + Work experience LCP + Employer + Company registration LCP PR + IELTS + ECA + Proof funds + Medical + Police clearance + Live-in caregiver LCP PR application"
  },
  {
    "id": "ca-PR-023",
    "officialCode": "CA-PR-023",
    "name": "Canada PR - Caring for Children Pathway PR Caring for Children Pathway PR Caring for Children Pathway PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1080 Caring for children pathway PR Canada",
    "validity": "PR caring for children pathway PR caring for children pathway PR Canada",
    "docs": "Caring for children proof Canada PR + Work experience 1Y + Employer registration + Company registration Canada caring for children PR + IELTS CLB 5 + ECA + Proof funds + Medical + Police clearance + Caring for children pathway PR application IRCC + Caring for children proof PR + Work experience + Employer + Company registration caring for children PR + IELTS + ECA + Proof funds + Medical + Police clearance + Caring for children pathway PR application"
  },
  {
    "id": "ca-PR-024",
    "officialCode": "CA-PR-024",
    "name": "Canada PR - Caring for People with High Medical Needs Pathway PR Caring for People with High Medical Needs Pathway PR Caring for People with High Medical Needs Pathway PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1080 Caring for people with high medical needs pathway PR Canada",
    "validity": "PR caring for people with high medical needs pathway PR caring for people with high medical needs pathway PR Canada",
    "docs": "Caring for high medical needs proof Canada PR + Work experience 1Y + Employer registration + Company registration Canada caring for high medical needs PR + IELTS CLB 5 + ECA + Proof funds + Medical + Police clearance + Caring for high medical needs pathway PR application IRCC + Caring for high medical needs proof PR + Work experience + Employer + Company registration caring for high medical needs PR + IELTS + ECA + Proof funds + Medical + Police clearance + Caring for high medical needs pathway PR application"
  },
  {
    "id": "ca-PR-025",
    "officialCode": "CA-PR-025",
    "name": "Canada PR - Rural Northern Immigration Pilot RNIP PR Rural Northern Immigration Pilot RNIP PR RNIP PR Canada - Regional DAMA Legacy Now RCIP",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1365 RNIP PR RNIP PR Canada regional DAMA legacy now RCIP",
    "validity": "PR RNIP PR RNIP PR Canada regional DAMA legacy now RCIP",
    "docs": "RNIP job offer Canada PR + Employer designation RNIP PR + Community recommendation RNIP PR + Company registration Canada RNIP PR + IELTS CLB 4-6 + ECA + Work experience 1Y + Proof funds + Medical + Police clearance + RNIP PR application IRCC + RNIP job offer PR + Employer designation RNIP PR + Community recommendation RNIP PR + Company registration RNIP PR + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + RNIP PR application"
  },
  {
    "id": "ca-PR-026",
    "officialCode": "CA-PR-026",
    "name": "Canada PR - Temporary Resident to Permanent Resident TR to PR TR to PR TR to PR Canada - Legacy Pandemic",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1365 TR to PR TR to PR Canada legacy pandemic",
    "validity": "PR TR to PR TR to PR Canada legacy pandemic",
    "docs": "TR to PR eligibility Canada + Canadian work experience + IELTS + ECA + Proof funds + Medical + Police clearance + TR to PR application IRCC + TR to PR eligibility + Canadian work experience + IELTS + ECA + Proof funds + Medical + Police clearance + TR to PR application"
  },
  {
    "id": "ca-PR-027",
    "officialCode": "CA-PR-027",
    "name": "Canada PR - Quebec Self Employed PR Quebec Self Employed PR Quebec Self Employed PR Canada - Regional Quebec",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1099 Quebec self employed PR Canada regional Quebec",
    "validity": "PR Quebec self employed PR Quebec self employed PR Canada regional Quebec",
    "docs": "Quebec self employed business plan Canada PR + Company registration Canada Quebec self employed PR + Investment CAD 100k + Quebec self employed proof + Business plan + Investment proof + Financial means + Medical + Police clearance + Quebec self employed PR application IRCC + Quebec self employed business plan PR + Company registration Quebec self employed PR + Investment + Quebec self employed proof + Business plan + Investment proof + Financial means + Medical + Police clearance + Quebec self employed PR application"
  },
  {
    "id": "ca-PR-028",
    "officialCode": "CA-PR-028",
    "name": "Canada PR - Federal Self Employed PR Federal Self Employed PR Federal Self Employed PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1540 Federal self employed PR Canada",
    "validity": "PR federal self employed PR federal self employed PR Canada",
    "docs": "Federal self employed business plan Canada PR + Self employed cultural athletic proof PR + Company registration Canada federal self employed PR + Financial means federal self employed PR + Self employed proof PR + Clients PR + Medical PR + Police clearance PR + Federal self employed PR application IRCC + Federal self employed business plan PR + Self employed cultural athletic proof PR + Company registration federal self employed PR + Financial means federal self employed PR + Self employed proof PR + Clients PR + Medical PR + Police clearance PR + Federal self employed PR application"
  },
  {
    "id": "ca-PR-029",
    "officialCode": "CA-PR-029",
    "name": "Canada PR - Home Child Care Provider Pilot Direct to PR Direct to PR Home Child Care Provider Pilot Direct to PR Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 1080 Home child care provider pilot direct to PR Canada",
    "validity": "PR home child care provider pilot direct to PR PR home child care provider pilot direct to PR Canada",
    "docs": "Home child care job offer Canada direct to PR + Employer registration + Company registration Canada home child care direct to PR + Home child care proof direct to PR + IELTS CLB 5 direct to PR + ECA direct to PR + Work experience direct to PR + Proof funds direct to PR + Medical direct to PR + Police clearance direct to PR + Home child care pilot direct to PR application IRCC + Home child care job offer direct to PR + Employer + Company registration home child care direct to PR + Home child care proof direct to PR + IELTS direct to PR + ECA direct to PR + Work experience direct to PR + Proof funds direct to PR + Medical direct to PR + Police clearance direct to PR + Home child care pilot direct to PR application"
  },
  {
    "id": "ca-PR-030",
    "officialCode": "CA-PR-030",
    "name": "Canada PR - Economic Mobility Pathways Pilot EMPP PR Economic Mobility Pathways Pilot EMPP PR EMPP PR Canada - Refugee Skilled",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "PR_VISA",
    "fee": "CAD 0 EMPP PR Canada refugee skilled",
    "validity": "PR EMPP PR EMPP PR Canada refugee skilled",
    "docs": "EMPP job offer Canada + Employer registration + Company registration Canada EMPP + Refugee proof + Skills + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + EMPP PR application IRCC + EMPP job offer + Employer + Company registration EMPP + Refugee proof + Skills + IELTS + ECA + Work experience + Proof funds + Medical + Police clearance + EMPP PR application"
  },
  {
    "id": "ca-SPE-001",
    "officialCode": "CA-SPE-001",
    "name": "Canada Citizenship Naturalization 3Y Citizenship Naturalization 3Y Citizenship Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "CITIZENSHIP_VISA",
    "fee": "CAD 630 Citizenship 3Y Canada",
    "validity": "Citizenship naturalization 3Y citizenship Canada",
    "docs": "Residence history 3Y Canada citizenship + Physical presence 1095 days Canada citizenship + Language CLB 4 + Citizenship test + Tax filing 3Y + Citizenship application IRCC + Residence history 3Y + Physical presence 1095 days + Language + Citizenship test + Tax filing + Citizenship application"
  },
  {
    "id": "ca-SPE-002",
    "officialCode": "CA-SPE-002",
    "name": "Canada Permanent Resident Card Renewal PR Card Renewal PR Card Renewal Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "STATUS_DOCUMENT",
    "fee": "CAD 50 PR card renewal Canada",
    "validity": "5Y PR card renewal 5Y PR card renewal Canada",
    "docs": "PR card renewal reason + Residence history 2Y/5Y Canada PR card renewal + Physical presence 730 days/5Y Canada PR card renewal + PR card renewal application IRCC + PR card renewal reason + Residence history 2Y/5Y + Physical presence 730 days/5Y + PR card renewal application"
  },
  {
    "id": "ca-SPE-003",
    "officialCode": "CA-SPE-003",
    "name": "Canada Permanent Resident Travel Document PRTD PRTD PRTD Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "pr",
    "record_type": "STATUS_DOCUMENT",
    "fee": "CAD 50 PRTD Canada",
    "validity": "1Y PRTD PRTD Canada",
    "docs": "PRTD reason + PR status proof + Residence history 2Y/5Y Canada PRTD + Physical presence 730 days/5Y Canada PRTD + PRTD application IRCC + PRTD reason + PR status proof + Residence history 2Y/5Y + Physical presence 730 days/5Y + PRTD application"
  },
  {
    "id": "ca-SPE-009",
    "officialCode": "CA-SPE-009",
    "name": "Canada Temporary Resident Permit TRP TRP TRP Canada - Inadmissible",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "STATUS_DOCUMENT",
    "fee": "CAD 200 TRP Canada inadmissible",
    "validity": "TRP TRP Canada inadmissible",
    "docs": "TRP reason letter Canada + Inadmissibility reason + Passport + Photo + TRP application IRCC + TRP reason + Inadmissibility reason + Passport + Photo + TRP application"
  },
  {
    "id": "ca-SPE-010",
    "officialCode": "CA-SPE-010",
    "name": "Canada Refugee Claim Refugee Claim Refugee Claim Canada - Asylum",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "tourist",
    "record_type": "HUMANITARIAN_VISA",
    "fee": "CAD 0 Refugee claim Canada free asylum",
    "validity": "Refugee claim refugee claim Canada asylum",
    "docs": "Refugee claim reason letter Canada + Persecution proof + Identity + Refugee claim application IRCC + Refugee claim reason + Persecution proof + Identity + Refugee claim application"
  },
  {
    "id": "ca-SUP-001",
    "officialCode": "CA-SUP-001",
    "name": "IRCC Authority IRCC Authority Visa IRCC Canada - Immigration Refugees Citizenship Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "IRCC = Immigration Refugees Citizenship Canada - Visa + PR + Citizenship + IRCC authority + canada.ca IRCC"
  },
  {
    "id": "ca-SUP-002",
    "officialCode": "CA-SUP-002",
    "name": "LMIA Authority LMIA Authority Work LMIA Canada - Labour Market Impact Assessment",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "LMIA = Labour Market Impact Assessment - Work + LMIA + LMIA authority + ESDC + LMIA CAD 1000"
  },
  {
    "id": "ca-SUP-003",
    "officialCode": "CA-SUP-003",
    "name": "Express Entry Authority Express Entry Authority PR Express Entry Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "Express Entry = Express Entry - PR + Express Entry + Express Entry authority + FSW CEC FST + CRS"
  },
  {
    "id": "ca-SUP-004",
    "officialCode": "CA-SUP-004",
    "name": "PNP Authority PNP Authority PR PNP Canada - Provincial Nominee Program Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "PNP = Provincial Nominee Program - PR + PNP + PNP authority + Regional + 600 CRS points"
  },
  {
    "id": "ca-SUP-005",
    "officialCode": "CA-SUP-005",
    "name": "eTA Authority eTA Authority Travel eTA Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "eTA = Electronic Travel Authorization - Travel + eTA + eTA authority + eTA CAD 7 + 5Y"
  },
  {
    "id": "ca-SUP-006",
    "officialCode": "CA-SUP-006",
    "name": "TRV Authority TRV Authority Visa TRV Canada - Temporary Resident Visa",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "TRV = Temporary Resident Visa - Visa + TRV + TRV authority + Visitor Visa TRV"
  },
  {
    "id": "ca-SUP-007",
    "officialCode": "CA-SUP-007",
    "name": "Super Visa Authority Super Visa Authority Family Super Visa Canada",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "Super Visa = Super Visa - Family + Super Visa + Super Visa authority + Parents Grandparents + Insurance CAD 100k + 2Y per entry"
  },
  {
    "id": "ca-SUP-008",
    "officialCode": "CA-SUP-008",
    "name": "DLI Authority DLI Authority Student DLI Canada - Designated Learning Institution",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "DLI = Designated Learning Institution - Student + DLI + DLI authority + LOA + Study Permit"
  },
  {
    "id": "ca-SUP-009",
    "officialCode": "CA-SUP-009",
    "name": "GIC Authority GIC Authority Student GIC Canada - Guaranteed Investment Certificate",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "GIC = Guaranteed Investment Certificate - Student + GIC + GIC authority + CAD 20635 + SDS"
  },
  {
    "id": "ca-SUP-010",
    "officialCode": "CA-SUP-010",
    "name": "SDS Authority SDS Authority Student SDS Canada - Student Direct Stream Fast Track",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "SDS = Student Direct Stream - Student + SDS + SDS authority + 20 Day Fast Track + GIC + IELTS 6.0"
  },
  {
    "id": "ca-SUP-011",
    "officialCode": "CA-SUP-011",
    "name": "PGWP Authority PGWP Authority Work PGWP Canada - Post Graduation Work Permit",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "PGWP = Post Graduation Work Permit - Work + PGWP + PGWP authority + 3Y + Open Work Permit"
  },
  {
    "id": "ca-SUP-012",
    "officialCode": "CA-SUP-012",
    "name": "AIP Authority AIP Authority PR AIP Canada - Atlantic Immigration Program Regional",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "AIP = Atlantic Immigration Program - PR + AIP + AIP authority + Regional + NB NS PE NL + Endorsement"
  },
  {
    "id": "ca-SUP-013",
    "officialCode": "CA-SUP-013",
    "name": "RCIP Authority RCIP Authority PR RCIP Canada - Rural Community Immigration Pilot Regional DAMA Style New 2025",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "RCIP = Rural Community Immigration Pilot - PR + RCIP + RCIP authority + Regional + DAMA Style + New 2025 + Community Recommendation"
  },
  {
    "id": "ca-SUP-014",
    "officialCode": "CA-SUP-014",
    "name": "GTS Authority GTS Authority Work GTS Canada - Global Talent Stream",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "GTS = Global Talent Stream - Work + GTS + GTS authority + 10 Day Processing + Category A B + LMIA"
  },
  {
    "id": "ca-SUP-015",
    "officialCode": "CA-SUP-015",
    "name": "CUSMA Authority CUSMA USMCA Authority Business CUSMA Canada - US Mexico",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "CUSMA/USMCA = Canada US Mexico Agreement - Business + CUSMA/USMCA + CUSMA authority + US Mexico citizen"
  },
  {
    "id": "ca-SUP-016",
    "officialCode": "CA-SUP-016",
    "name": "LICO Authority LICO Authority Family LICO Canada - Low Income Cut Off",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "LICO = Low Income Cut Off - Family + LICO + LICO authority + Super Visa + PGP + Financial"
  },
  {
    "id": "ca-SUP-017",
    "officialCode": "CA-SUP-017",
    "name": "CRS Authority CRS Authority PR CRS Canada - Comprehensive Ranking System",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "CRS = Comprehensive Ranking System - PR + CRS + CRS authority + Express Entry + Points"
  },
  {
    "id": "ca-SUP-018",
    "officialCode": "CA-SUP-018",
    "name": "CLB Authority CLB Authority Language CLB Canada - Canadian Language Benchmark",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "CLB = Canadian Language Benchmark - Language + CLB + CLB authority + IELTS + CELPIP + TEF"
  },
  {
    "id": "ca-SUP-019",
    "officialCode": "CA-SUP-019",
    "name": "ECA Authority ECA Authority PR ECA Canada - Educational Credential Assessment",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "ECA = Educational Credential Assessment - PR + ECA + ECA authority + WES + IQAS + CES"
  },
  {
    "id": "ca-SUP-020",
    "officialCode": "CA-SUP-020",
    "name": "CSQ Authority CSQ Authority PR CSQ Canada - Quebec Selection Certificate Regional Quebec",
    "toCountry": "ca",
    "fromCountry": "us",
    "category": "supporting",
    "record_type": "SUPPORTING_CLASSIFICATION",
    "fee": "-",
    "validity": "-",
    "docs": "CSQ = Certificat Sélection Québec - PR + CSQ + CSQ authority + Regional Quebec + QSW + PEQ"
  }
];

export function convertRawToCanadaVisaItem(item: RawCanadaItem): VisaItem {
  const docList = item.docs ? item.docs.split(' + ') : [];
  const details = getCanadaMicroDetails(item.id, item.category, item.name);

  return {
    id: item.id,
    name: item.name,
    officialCode: item.officialCode,
    categoryCode: item.category,
    fee: item.fee,
    validity: item.validity,
    stay: item.validity,
    purpose: `Official ${item.category} visa and immigration entry for Canada (IRCC).`,
    eligibility: 'Valid passport with min 6 months validity, biometric submission, financial capability proof, and official IRCC application requirements.',
    popular: item.id === 'ca-TOU-001' || item.id === 'ca-TOU-002' || item.id === 'ca-TOU-003' || item.id === 'ca-BIZ-001' || item.id === 'ca-WRK-001' || item.id === 'ca-STU-001' || item.id === 'ca-FAM-001' || item.id === 'ca-PR-001',
    highlight: item.id === 'ca-TOU-001' || item.id === 'ca-WRK-001' || item.id === 'ca-STU-001' || item.id === 'ca-PR-001',
    record_type: item.record_type,
    toCountry: item.toCountry,
    fromCountry: item.fromCountry,
    warningBox: item.warningBox,
    rawFundsBox: item.fundsBox,
    rawBankBox: item.bankBox,
    docs: docList,
    fundsBox: details.fundsBox,
    itrBox: details.itrBox,
    bankBox: details.bankBox
  };
}

export const CANADA_130_ALL_ITEMS: VisaItem[] = CA_130_FULL.map(convertRawToCanadaVisaItem);

export const CANADA_130_VISAS: CountryVisas = {
  tourist: CA_130_FULL.filter(i => i.category === 'tourist').map(convertRawToCanadaVisaItem),
  business: CA_130_FULL.filter(i => i.category === 'business').map(convertRawToCanadaVisaItem),
  work: CA_130_FULL.filter(i => i.category === 'work').map(convertRawToCanadaVisaItem),
  student: CA_130_FULL.filter(i => i.category === 'student').map(convertRawToCanadaVisaItem),
  family: CA_130_FULL.filter(i => i.category === 'family').map(convertRawToCanadaVisaItem),
  pr: CA_130_FULL.filter(i => i.category === 'pr').map(convertRawToCanadaVisaItem),
  supporting: CA_130_FULL.filter(i => i.category === 'supporting').map(convertRawToCanadaVisaItem)
};
