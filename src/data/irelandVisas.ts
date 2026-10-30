import type { VisaItem, CountryVisas } from './fullVisaDatabase';

function getIrelandMicroDetails(code: string, cat: string, name: string) {
  let fundsMin = "Ireland C Short Stay Tourist / C Business / D Long Stay Employment & Study Visas require proof of sufficient funds (min EUR 3,000 liquid bank balance for C tourist/business short stay, DETE Work Permit salary of EUR 30,000+ for Critical Skills / General Employment, and EUR 7,000/year for D Study Long Stay).";
  let fundsBankMonths = "Last 6 months personal bank statements stamped by bank branch, showing regular income and liquid balance.";
  let fundsSudden = "❌ Sudden 1-day cash deposits right before visa submission on AVATS / VFS are strictly flagged and cause rejection by Irish Immigration Service Delivery (ISD) / INIS. Average balance must be maintained over 6 months.";
  let fundsEx = "✅ Sahi: Seasoned 6-month bank statement showing EUR 3,000+ liquid balance. ❌ Galat: Borrowed cash deposited 24 hours prior to application.";

  let itrYears = "P60 / Employment Detail Summary (Revenue Ireland) or Foreign Tax Return for past 2–3 years for work, business, and family join applicants.";
  let itrMatch = "Reported tax income must reconcile with personal bank credits and DETE employment contracts.";
  let itrNoItr = "Not required for short term C Tourist visitors or students sponsored by parents.";

  let bankMonths = "Last 6 months bank statements.";
  let bankReg = "Regular salary credits or steady corporate income.";
  let bankFd = "Fixed deposits accepted as supporting proof.";
  let bankSource = "Salary, corporate revenue, or verified parental sponsorship.";

  const lowerCode = code.toLowerCase();
  if (cat === 'work' || lowerCode.includes('critical-skills') || lowerCode.includes('wrk') || lowerCode.includes('dete') || lowerCode.includes('stamp-1')) {
    fundsMin = "Employment Permits require a Department of Enterprise, Trade and Employment (DETE) Work Permit approval (Critical Skills Employment Permit / General Employment Permit) + annual salary threshold of min EUR 30,000+ (or EUR 38,000+ for General) + AVATS D Visa application. IRP Stamp 1 / 1H fee is EUR 300.";
    fundsBankMonths = "DETE Employment Permit approval letter, Irish employer contract, and 6 months bank statements.";
    fundsSudden = "Employment contracts must specify gross annual salary in EUR, job code (SOC code), and CRO registration.";
    fundsEx = "✅ Sahi: Official DETE Critical Skills Permit approval + CRO registered employer contract + EUR 30k+ salary. ❌ Galat: Unregistered employer or missing DETE permit.";
  } else if (cat === 'student' || lowerCode.includes('d-study') || lowerCode.includes('stamp-2') || lowerCode.includes('stu')) {
    fundsMin = "D Study Visa requires an official Letter of Acceptance from an ILEP (Interim List of Eligible Programmes) recognized Irish university / college + full tuition fee payment receipt (min EUR 6,000) + bank statement showing min EUR 7,000 liquid balance for living costs. Stamp 2 IRP fee is EUR 300.";
    fundsBankMonths = "6 months bank statements of student or parent financial sponsor showing min EUR 7,000.";
    fundsSudden = "Parental affidavit of support and birth certificate required if using parent's bank statement.";
    fundsEx = "✅ Sahi: ILEP university acceptance letter + tuition receipt + EUR 7,000 bank proof. ❌ Galat: Unrecognized institute or unverified funding.";
  } else if (cat === 'family' || lowerCode.includes('join-family') || lowerCode.includes('stamp-4') || lowerCode.includes('fam')) {
    fundsMin = "D Join Family Visa requires sponsor to meet INIS financial threshold (sponsor earning min EUR 30,000+ net per year for spouse, higher for children) + apostilled marriage/birth certificates + host IRP card (Stamp 1, Stamp 1H, Stamp 4). Stamp 4 IRP fee is EUR 300.";
    fundsBankMonths = "P60 / Revenue Employment Detail Summary and 6 months bank statements of sponsor in Ireland.";
    fundsSudden = "Marriage/Birth certificates must be apostilled under Hague Convention with certified English translation.";
    fundsEx = "✅ Sahi: Apostilled marriage certificate + sponsor Revenue tax proof (EUR 30k+ income) + IRP copy. ❌ Galat: Uncertified civil documents or income below threshold.";
  } else if (cat === 'business' || lowerCode.includes('c-biz') || lowerCode.includes('step') || lowerCode.includes('biz')) {
    fundsMin = "C Business Short Stay requires an official invitation letter from a CRO (Companies Registration Office) registered Irish firm + foreign employer dispatch letter. STEP (Start-up Entrepreneur Programme) requires EUR 50,000 startup capital.";
    fundsBankMonths = "6 months corporate and personal bank statements.";
    fundsSudden = "Sponsoring Irish company must be active in official Companies Registration Office (CRO) registry.";
    fundsEx = "✅ Sahi: Official Irish host company invitation with CRO number + foreign employer dispatch letter. ❌ Galat: Unregistered host firm.";
  } else if (cat === 'pr' || lowerCode.includes('iip') || lowerCode.includes('stamp-5') || lowerCode.includes('pr')) {
    fundsMin = "IRP Stamp 4 Long Term Residence requires 5 years continuous legal residence in Ireland on Stamp 1 / Stamp 1H / Stamp 4. IIP Immigrant Investor Programme required EUR 1,000,000 enterprise investment. Naturalization requires 5 years reckonable residence.";
    fundsBankMonths = "5 years Revenue P60 / Employment Detail Summaries and IRP card history.";
    fundsSudden = "Reckonable residence is calculated via INIS online points calculator.";
    fundsEx = "✅ Sahi: 5 Years IRP Stamp 1/1H/4 history + Revenue tax summaries + clean Garda record. ❌ Galat: Unreckonable student stay or gap in residence.";
  }

  return {
    fundsBox: { minimum: fundsMin, bankMonths: fundsBankMonths, suddenDeposit: fundsSudden, example: fundsEx },
    itrBox: { years: itrYears, match: itrMatch, noItr: itrNoItr },
    bankBox: { months: bankMonths, regularCredit: bankReg, fd: bankFd, source: bankSource }
  };
}

export const IRELAND_86_VISAS: CountryVisas = {
  tourist: [
    {
      id: "ie-TOU-001",
      officialCode: "IE-TOU-001",
      name: "C Tourist Short Stay Visa 90 Days (Single / Multiple Entry - AVATS Online & VFS)",
      categoryCode: "tourist",
      fee: "EUR 60 Single / EUR 100 Multiple + VFS fee (EUR 30)",
      validity: "90 days single / multiple entry",
      stay: "Up to 90 days per visit",
      purpose: "Short term tourism, sightseeing, visiting family/friends, and leisure travel in Ireland.",
      eligibility: "Valid passport with 6 months validity, 2 blank pages, confirmed flight itinerary, hotel booking OR Host Invitation Letter with Host Irish Passport / IRP Card copy, and bank proof of EUR 3,000/month.",
      popular: true,
      highlight: true,
      record_type: "TOURIST_VISA",
      docs: [
        "Valid original passport (min 6 months validity, 2 blank pages & previous passports) ⭐",
        "Completed online AVATS Visa Application Summary Sheet + VFS appointment slip ⭐",
        "2 recent passport photos (35x45mm white background)",
        "Confirmed return flight booking & hotel reservation OR Host Invitation Letter with Host Irish Passport / IRP copy ⭐",
        "Personal bank account statement for past 6 months (showing min EUR 3,000/month liquid balance with bank stamp) ⭐",
        "Employment NOC letter / Business registration & pay slips for past 6 months",
        "Personal Income Tax Return (P60 / Tax Assessment / ITR) for past 2 years",
        "Travel medical insurance policy (min EUR 30,000 coverage)"
      ],
      ...getIrelandMicroDetails("ie-TOU-001", "tourist", "C Tourist Short Stay 90D")
    },
    {
      id: "ie-TOU-002",
      officialCode: "IE-TOU-002",
      name: "C Tourist Visa 5 Years Multiple Entry (AVATS)",
      categoryCode: "tourist",
      fee: "EUR 100 Multiple",
      validity: "5 years multiple entry",
      stay: "Up to 90 days per visit",
      purpose: "Frequent leisure travel and family visits to Ireland.",
      eligibility: "Frequent travelers with a compliant history of previous Irish / UK / Schengen visas.",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid passport showing previous Irish / Schengen visa stamps ⭐",
        "AVATS online visa application summary sheet",
        "Bank statement showing 6 months seasoned balance",
        "Employment proof & travel insurance"
      ],
      ...getIrelandMicroDetails("ie-TOU-002", "tourist", "C Tourist 5Y Multiple")
    },
    {
      id: "ie-TOU-003",
      officialCode: "IE-TOU-003",
      name: "C Tourist - Family & Friends Visit Visa 90 Days",
      categoryCode: "tourist",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "Up to 90 days",
      purpose: "Visiting family members or friends residing in Ireland.",
      eligibility: "Visitors invited by Irish citizens or legal IRP resident holders.",
      record_type: "TOURIST_VISA",
      docs: [
        "Host Invitation Letter & Host Irish Passport / IRP Card copy ⭐",
        "Proof of relationship or friendship history",
        "Host proof of accommodation & bank statement in Ireland",
        "Applicant 6 months bank statement & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-TOU-003", "tourist", "C Family & Friends Visit")
    },
    {
      id: "ie-TOU-004",
      officialCode: "IE-TOU-004",
      name: "British Irish Visa Scheme (BIVS - Combined UK & Ireland Travel)",
      categoryCode: "tourist",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Common Travel Area (CTA) short stay visit allowing travel between UK and Ireland under BIVS.",
      eligibility: "Indian and Chinese passport holders holding valid UK visa with BIVS notation entering UK first.",
      record_type: "TOURIST_VISA",
      docs: [
        "Valid UK Visa stamped with BIVS notation ⭐",
        "UK entry clearance stamp in passport ⭐",
        "Confirmed transit / flight / ferry ticket between UK and Ireland",
        "Bank statement & hotel booking in Ireland"
      ],
      ...getIrelandMicroDetails("ie-TOU-004", "tourist", "British Irish Visa Scheme BIVS")
    },
    {
      id: "ie-TOU-005",
      officialCode: "IE-TOU-005",
      name: "Transit Visa 24 Hours (Airport Transit - Dublin Airport)",
      categoryCode: "tourist",
      fee: "EUR 25",
      validity: "24 hours",
      stay: "24 hours",
      purpose: "International airport transit connecting flights at Dublin Airport.",
      eligibility: "Passport holders of transit visa required countries transiting through Ireland.",
      record_type: "TRANSIT_VISA",
      docs: [
        "Valid passport & connecting flight ticket within 24 hours ⭐",
        "Visa for third country destination",
        "AVATS transit visa application sheet"
      ],
      ...getIrelandMicroDetails("ie-TOU-005", "tourist", "Transit Visa 24H")
    },
    {
      id: "ie-TOU-006",
      officialCode: "IE-TOU-006",
      name: "C Tourist Visa Extension 90 Days (ISD Burgh Quay / Police Registration)",
      categoryCode: "tourist",
      fee: "EUR 0 (Unforeseen Emergency Extension)",
      validity: "90 days extension",
      stay: "90 days",
      purpose: "Extension of short stay C tourist visa due to medical or force majeure emergency.",
      eligibility: "C visa holders experiencing unexpected emergency applying at ISD Burgh Quay / local Garda station.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Statement of reason for tourist extension",
        "Medical certificate / flight cancellation proof ⭐",
        "Valid passport & original C visa entry stamp",
        "ISD extension application"
      ],
      ...getIrelandMicroDetails("ie-TOU-006", "tourist", "C Tourist Extension ISD")
    },
    {
      id: "ie-TOU-007",
      officialCode: "IE-TOU-007",
      name: "C Tourist - Conference & Event Visa 90 Days",
      categoryCode: "tourist",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Attending international conferences, summits, or cultural events in Ireland.",
      eligibility: "Registered delegates with invitation letter from Irish event organizer.",
      record_type: "CONFERENCE_VISA",
      docs: [
        "Official Conference Invitation Letter from Irish organizer ⭐",
        "Conference registration fee receipt & agenda",
        "Applicant 6 months bank statement & employer dispatch letter",
        "AVATS application form"
      ],
      ...getIrelandMicroDetails("ie-TOU-007", "tourist", "C Conference & Event Visa")
    },
    {
      id: "ie-TOU-008",
      officialCode: "IE-TOU-008",
      name: "C Tourist - Medical Treatment Visa 90 Days",
      categoryCode: "tourist",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short-term medical diagnosis or specialized treatment at registered Irish hospitals.",
      eligibility: "Foreign patients with confirmed appointment at an Irish hospital.",
      record_type: "MEDICAL_VISA",
      docs: [
        "Hospital appointment letter from Irish medical institution ⭐",
        "Home country doctor diagnosis report",
        "Bank statement showing medical expense coverage (min EUR 5,000+)",
        "AVATS application summary"
      ],
      ...getIrelandMicroDetails("ie-TOU-008", "tourist", "C Medical Treatment Visa")
    },
    {
      id: "ie-TOU-009",
      officialCode: "IE-TOU-009",
      name: "C Tourist - Performance & Tournament Visa 90 Days",
      categoryCode: "tourist",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Non-remunerated artistic performances or amateur sports competitions.",
      eligibility: "Performers or athletes invited by Irish sports/cultural bodies.",
      record_type: "PERFORMER_VISA",
      docs: [
        "Irish event organizer invitation letter ⭐",
        "Performance venue contract & schedule",
        "Valid passport & bank statement"
      ],
      ...getIrelandMicroDetails("ie-TOU-009", "tourist", "C Performance & Tournament")
    },
    {
      id: "ie-TOU-010",
      officialCode: "IE-TOU-010",
      name: "C Tourist - Exam Visit Visa 90 Days",
      categoryCode: "tourist",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Sitting professional entrance or licensing exams in Ireland.",
      eligibility: "Candidates registered for Irish professional examinations (e.g. PRES, ACCA, FE-1).",
      record_type: "STUDENT_VISA",
      docs: [
        "Official Exam Registration & Hall Ticket from Irish board ⭐",
        "Proof of exam fee payment",
        "Valid passport & 6 months bank statement"
      ],
      ...getIrelandMicroDetails("ie-TOU-010", "tourist", "C Exam Visit Visa")
    },
    {
      id: "ie-TOU-011",
      officialCode: "IE-TOU-011",
      name: "C Tourist - Training Visit Visa 90 Days",
      categoryCode: "tourist",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short term non-remunerated vocational or corporate training under 90 days.",
      eligibility: "Corporate trainees invited by Irish training providers.",
      record_type: "TRAINING_VISA",
      docs: [
        "Irish training provider invitation & course schedule ⭐",
        "Foreign employer dispatch letter",
        "Valid passport & bank statement"
      ],
      ...getIrelandMicroDetails("ie-TOU-011", "tourist", "C Training Visit Visa")
    },
    {
      id: "ie-TOU-012",
      officialCode: "IE-TOU-012",
      name: "C Tourist - Short Unpaid Internship Visa 90 Days",
      categoryCode: "tourist",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short unpaid academic internship under 90 days.",
      eligibility: "Enrolled university students undertaking short curriculum placement.",
      record_type: "INTERN_VISA",
      docs: [
        "Irish host firm internship agreement ⭐",
        "University dispatch letter & enrollment proof",
        "Valid passport & bank statement"
      ],
      ...getIrelandMicroDetails("ie-TOU-012", "tourist", "C Unpaid Internship Visa")
    },
    {
      id: "ie-SPE-001",
      officialCode: "IE-SPE-001",
      name: "D Long Stay - Medical Treatment Visa 90 Days+",
      categoryCode: "tourist",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "Long Stay D Visa",
      stay: "Matches treatment duration",
      purpose: "Extended medical care exceeding 90 days in Irish hospitals.",
      eligibility: "Patients requiring long-term medical care certified by Irish hospital.",
      record_type: "MEDICAL_VISA",
      docs: [
        "Long-term medical treatment letter from Irish hospital ⭐",
        "Proof of full medical funding & hospital deposit",
        "Valid passport & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-SPE-001", "tourist", "D Long Stay Medical Treatment")
    },
    {
      id: "ie-SPE-005",
      officialCode: "IE-SPE-005",
      name: "IRP Stamp 0 Retired Person of Independent Means Permit 1 Year",
      categoryCode: "tourist",
      fee: "EUR 300 IRP Card Fee",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Retirement residence for self-funded foreign retirees of independent financial means.",
      eligibility: "Retirees with net income of min EUR 50,000 per person/year + lump sum liquid capital buffer (min EUR 100,000+).",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "Proof of net annual income of min EUR 50,000 per person certified by Irish accountant ⭐",
        "Proof of liquid capital buffer certified by bank",
        "Private comprehensive health insurance policy in Ireland",
        "Clean Garda / Police clearance check",
        "IRP Stamp 0 application to ISD"
      ],
      ...getIrelandMicroDetails("ie-SPE-005", "tourist", "IRP Stamp 0 Independent Means")
    }
  ],
  business: [
    {
      id: "ie-BIZ-001",
      officialCode: "IE-BIZ-001",
      name: "C Business Short Stay Visa 90 Days (Single / Multiple - CRO Registered Host)",
      categoryCode: "business",
      fee: "EUR 60 Single / EUR 100 Multiple + VFS fee (EUR 30)",
      validity: "90 days single / multiple entry",
      stay: "Up to 90 days per visit",
      purpose: "Commercial negotiations, trade meetings, corporate site visits, and auditing in Ireland.",
      eligibility: "Business representatives invited by a registered Irish enterprise holding Companies Registration Office (CRO) registration.",
      popular: true,
      highlight: true,
      record_type: "BUSINESS_VISA",
      docs: [
        "Valid original passport (min 6 months validity & 2 blank pages) ⭐",
        "Official Invitation Letter from sponsoring Irish company specifying CRO number ⭐",
        "Copy of Irish host company Companies Registration Office (CRO) certificate ⭐",
        "Foreign employer dispatch letter stating job title, salary, and purpose of business trip ⭐",
        "Foreign employer business registration copy & business card",
        "Personal or corporate bank statement for past 6 months (min EUR 3,000/month balance)",
        "Completed AVATS Visa Application Summary Sheet & VFS appointment slip"
      ],
      ...getIrelandMicroDetails("ie-BIZ-001", "business", "C Business Short Stay 90D")
    },
    {
      id: "ie-BIZ-002",
      officialCode: "IE-BIZ-002",
      name: "C Business Visa 5 Years Multiple Entry (AVATS)",
      categoryCode: "business",
      fee: "EUR 100 Multiple",
      validity: "5 years multiple entry",
      stay: "Up to 90 days per visit",
      purpose: "Frequent long-term business travel for corporate executives and managers.",
      eligibility: "Corporate executives with previous compliant Irish business travel history.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Valid passport showing previous Irish / Schengen visas ⭐",
        "Irish company invitation letter for 5Y multiple entry",
        "Irish company CRO registration copy",
        "Foreign employer corporate dispatch letter"
      ],
      ...getIrelandMicroDetails("ie-BIZ-002", "business", "C Business 5Y Multiple")
    },
    {
      id: "ie-BIZ-003",
      officialCode: "IE-BIZ-003",
      name: "C Business - Conference & Summit Visa 90 Days",
      categoryCode: "business",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Attending trade expos, tech summits (e.g. Dublin Tech Summit), or corporate conferences.",
      eligibility: "Registered delegates with invitation from Irish conference organizer.",
      record_type: "CONFERENCE_VISA",
      docs: [
        "Official Conference Invitation Letter from Irish organizer ⭐",
        "Conference pass registration receipt & agenda",
        "Foreign employer dispatch letter & business card",
        "Valid passport & bank statement"
      ],
      ...getIrelandMicroDetails("ie-BIZ-003", "business", "C Business Conference Visa")
    },
    {
      id: "ie-BIZ-004",
      officialCode: "IE-BIZ-004",
      name: "C Business - Immigrant Investor Visit Visa 90 Days (IIP Stream)",
      categoryCode: "business",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Exploring foreign direct investment opportunities or meeting IIP fund managers.",
      eligibility: "High net worth investors exploring IIP enterprise projects.",
      record_type: "INVESTOR_VISA",
      docs: [
        "IIP Investor Meeting Invitation / Enterprise Project Brief ⭐",
        "Proof of net worth & liquid investment funds (min EUR 1M+)",
        "Foreign corporate registration & bank reference",
        "Valid passport & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-BIZ-004", "business", "C Business Investor Visit")
    },
    {
      id: "ie-BIZ-005",
      officialCode: "IE-BIZ-005",
      name: "C Business - Start-up Entrepreneur Visit Visa 90 Days (STEP Stream)",
      categoryCode: "business",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Meeting Enterprise Ireland incubators or preparing STEP startup application.",
      eligibility: "Tech startup founders invited by Enterprise Ireland or Irish incubators.",
      record_type: "ENTREPRENEUR_VISA",
      docs: [
        "Enterprise Ireland / Irish Incubator Invitation Letter ⭐",
        "Innovative Startup Business Plan & pitch deck",
        "Proof of seed funding (min EUR 50,000 capital)",
        "Valid passport & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-BIZ-005", "business", "C Business STEP Entrepreneur")
    },
    {
      id: "ie-BIZ-006",
      officialCode: "IE-BIZ-006",
      name: "C Business Visa Extension 90 Days (ISD Burgh Quay)",
      categoryCode: "business",
      fee: "EUR 0",
      validity: "90 days extension",
      stay: "90 days extension",
      purpose: "Extending business visit stay for ongoing commercial negotiations or project installation.",
      eligibility: "C business visa holders with written request from Irish host firm.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Sponsoring Irish company written extension request letter (with CRO number) ⭐",
        "Irish company CRO registration copy",
        "Valid passport & ISD extension application"
      ],
      ...getIrelandMicroDetails("ie-BIZ-006", "business", "C Business Extension ISD")
    },
    {
      id: "ie-BIZ-007",
      officialCode: "IE-BIZ-007",
      name: "C Business - Trade Fair & Expo Visa 90 Days",
      categoryCode: "business",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Exhibiting or attending industrial trade shows in Dublin or Cork.",
      eligibility: "Exhibitors or trade delegates with registered booth.",
      record_type: "BUSINESS_VISA",
      docs: [
        "Trade Fair Organizer Invitation & Booth Pass Confirmation",
        "Foreign employer dispatch letter",
        "Valid passport & bank statement"
      ],
      ...getIrelandMicroDetails("ie-BIZ-007", "business", "C Business Trade Fair")
    },
    {
      id: "ie-BIZ-008",
      officialCode: "IE-BIZ-008",
      name: "C Business - Commercial Performer & Event Delegate Visa 90 Days",
      categoryCode: "business",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Commercial events, broadcast productions, or commercial performance tours.",
      eligibility: "Performers or production staff with Irish corporate contract.",
      record_type: "PERFORMER_VISA",
      docs: [
        "Irish event producer contract & CRO registration",
        "Performance venue itinerary",
        "Valid passport & dispatch letter"
      ],
      ...getIrelandMicroDetails("ie-BIZ-008", "business", "C Commercial Performer Visa")
    },
    {
      id: "ie-SPE-002",
      officialCode: "IE-SPE-002",
      name: "D Long Stay - Volunteer Visa 1 Year",
      categoryCode: "business",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "1 year renewable",
      stay: "1 year (Stamp 3 issued after entry)",
      purpose: "Long-term voluntary service with registered Irish non-profit organizations or charities.",
      eligibility: "Volunteers invited by Charities Regulator registered Irish non-profits.",
      record_type: "VOLUNTEER_VISA",
      docs: [
        "Official invitation & sponsorship letter from registered Irish charity ⭐",
        "Charities Regulator Ireland Registration Certificate copy",
        "Volunteer contract & living allowance details",
        "Valid passport & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-SPE-002", "business", "D Volunteer Visa 1Y")
    },
    {
      id: "ie-SPE-003",
      officialCode: "IE-SPE-003",
      name: "D Long Stay - Minister of Religion Visa 1 Year",
      categoryCode: "business",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "1 year renewable",
      stay: "1 year (Stamp 3 issued after entry)",
      purpose: "Pastoral work or religious ministry for recognized religious bodies in Ireland.",
      eligibility: "Ordained ministers invited by registered religious bodies.",
      record_type: "WORK_VISA",
      docs: [
        "Official invitation from registered religious body in Ireland ⭐",
        "Ordination certificate & pastoral dispatch order",
        "Sponsoring body financial guarantee & housing proof",
        "Valid passport & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-SPE-003", "business", "D Minister of Religion Visa")
    },
    {
      id: "ie-SPE-004",
      officialCode: "IE-SPE-004",
      name: "D Long Stay - Lay Volunteer Visa 1 Year",
      categoryCode: "business",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "1 year",
      stay: "1 year",
      purpose: "Lay missionary or community volunteer work.",
      eligibility: "Volunteers invited by recognized community organizations.",
      record_type: "VOLUNTEER_VISA",
      docs: [
        "Community organization invitation & contract",
        "Garda vetting clearance in Ireland",
        "Valid passport & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-SPE-004", "business", "D Lay Volunteer Visa")
    },
    {
      id: "ie-SPE-012",
      officialCode: "IE-SPE-012",
      name: "Van der Elst Business Work Permit Exemption Visa 1 Year",
      categoryCode: "business",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "1 year",
      stay: "1 year",
      purpose: "Cross-border service provision for non-EU staff legally employed by EU companies posted to Ireland.",
      eligibility: "Non-EU staff legally employed by an EU company posted temporarily to provide service in Ireland.",
      record_type: "BUSINESS_VISA",
      docs: [
        "EU Employer Company Registration & Work Permit in EU country ⭐",
        "Service Provision Contract with Irish client firm (CRO registered)",
        "Proof of legal employment in EU member state",
        "Valid passport & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-SPE-012", "business", "Van der Elst Service Visa")
    },
    {
      id: "ie-SPE-014",
      officialCode: "IE-SPE-014",
      name: "Diplomat Visa (Embassy / Consular Mission Postings)",
      categoryCode: "business",
      fee: "EUR 0",
      validity: "Duration of diplomatic posting",
      stay: "Official posting duration",
      purpose: "Diplomatic missions, embassy postings, and official bilateral state visits.",
      eligibility: "Accredited foreign diplomats and embassy officials.",
      record_type: "DIPLOMAT_VISA",
      docs: [
        "Diplomatic Note Verbale from foreign Ministry of Foreign Affairs",
        "Diplomatic Passport copy",
        "Department of Foreign Affairs Ireland diplomatic clearance"
      ],
      ...getIrelandMicroDetails("ie-SPE-014", "business", "Diplomat Visa Ireland")
    },
    {
      id: "ie-SPE-015",
      officialCode: "IE-SPE-015",
      name: "Official State Mission Visa",
      categoryCode: "business",
      fee: "EUR 0",
      validity: "Duration of official assignment",
      stay: "Official assignment duration",
      purpose: "Official state business, consular staff duties, and international government delegations.",
      eligibility: "Foreign government officials traveling on official service passports.",
      record_type: "OFFICIAL_VISA",
      docs: [
        "Official Note Verbale from foreign government ministry",
        "Official / Service Passport",
        "Department of Foreign Affairs Ireland clearance"
      ],
      ...getIrelandMicroDetails("ie-SPE-015", "business", "Official State Mission")
    },
    {
      id: "ie-SPE-016",
      officialCode: "IE-SPE-016",
      name: "Start-up Entrepreneur Programme Visa (STEP - EUR 50k Capital)",
      categoryCode: "business",
      fee: "EUR 350 STEP Application Fee",
      validity: "2 years renewable (Stamp 4 issued after entry)",
      stay: "2 years",
      purpose: "Establish high-potential tech startups in Ireland under Enterprise Ireland STEP scheme.",
      eligibility: "Startup founders with an innovative business proposal securing min EUR 50,000 funding.",
      record_type: "ENTREPRENEUR_VISA",
      docs: [
        "Enterprise Ireland STEP Approval Letter ⭐",
        "Proof of EUR 50,000 startup funding in bank account",
        "Comprehensive Business Plan & CRO company registration",
        "Valid passport & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-SPE-016", "business", "STEP Startup Entrepreneur")
    }
  ],
  work: [
    {
      id: "ie-WRK-001",
      officialCode: "IE-WRK-001",
      name: "Critical Skills Employment Permit 2 Years (DETE Approved + D Visa + Stamp 1H IRP)",
      categoryCode: "work",
      fee: "EUR 60 D Visa + EUR 1,000 DETE Permit Fee + EUR 300 IRP Card",
      validity: "2 years renewable (Path to Stamp 4 PR after 2 years)",
      stay: "2 years",
      purpose: "Skilled employment in highly demanded professional roles listed on the Critical Skills Occupations List (IT, software, engineering, healthcare, finance).",
      eligibility: "DETE Employment Permit Approval for role on Critical Skills Occupations List (min salary EUR 38,000+ with relevant degree OR EUR 64,000+ any field) + Irish employer contract.",
      popular: true,
      highlight: true,
      record_type: "WORK_VISA",
      docs: [
        "Department of Enterprise, Trade and Employment (DETE) Critical Skills Employment Permit Approval Letter ⭐",
        "Official Employment Contract signed with CRO registered Irish employer ⭐",
        "Proof of position on Critical Skills Occupations List & min EUR 38,000+ salary ⭐",
        "University Degree Certificate & Transcripts (matching critical skills role)",
        "CRO Registered Irish Employer Certificate & Tax Clearance",
        "AVATS D Long Stay Visa Application Summary Sheet & VFS receipt",
        "Valid passport, passport photos, and medical insurance"
      ],
      ...getIrelandMicroDetails("ie-WRK-001", "work", "Critical Skills Employment Permit")
    },
    {
      id: "ie-WRK-002",
      officialCode: "IE-WRK-002",
      name: "General Employment Permit 2 Years (DETE Approved - Labour Market Needs Test)",
      categoryCode: "work",
      fee: "EUR 60 D Visa + EUR 1,000 DETE Permit Fee + EUR 300 IRP Card",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "General employment across all occupations not specifically excluded on Ineligible List.",
      eligibility: "DETE General Employment Permit approval + Labour Market Needs Test (LMNT advertised on JobsIreland/EURES for 28 days) + min salary EUR 34,000+.",
      record_type: "WORK_VISA",
      docs: [
        "DETE General Employment Permit Approval Letter ⭐",
        "Proof of Labour Market Needs Test (LMNT) advertisement on JobsIreland for 28 days ⭐",
        "Irish Employer Contract & CRO registration",
        "Relevant qualifications & experience letters",
        "AVATS D Visa application sheet"
      ],
      ...getIrelandMicroDetails("ie-WRK-002", "work", "General Employment Permit DETE")
    },
    {
      id: "ie-WRK-003",
      officialCode: "IE-WRK-003",
      name: "Intra-Company Transfer Employment Permit (ICT) 2 Years",
      categoryCode: "work",
      fee: "EUR 60 D Visa + EUR 1,000 DETE Permit Fee + EUR 300 IRP",
      validity: "2 years renewable",
      stay: "Up to 5 years total",
      purpose: "Transfer of key senior management or specialist staff from foreign parent firm to Irish branch.",
      eligibility: "Senior managers / key personnel with 6+ months service at foreign parent company earning min EUR 46,000+.",
      record_type: "WORK_VISA",
      docs: [
        "DETE Intra-Company Transfer Employment Permit Approval ⭐",
        "Foreign Parent Firm Transfer Dispatch Letter & proof of 6+ months employment ⭐",
        "Irish branch CRO Registration & corporate relationship proof",
        "AVATS D Visa application summary"
      ],
      ...getIrelandMicroDetails("ie-WRK-003", "work", "Intra-Company Transfer ICT Permit")
    },
    {
      id: "ie-WRK-004",
      officialCode: "IE-WRK-004",
      name: "Contract for Services Employment Permit 2 Years",
      categoryCode: "work",
      fee: "EUR 60 D Visa + EUR 1,000 DETE Permit Fee + EUR 300 IRP",
      validity: "2 years renewable",
      stay: "Up to 5 years",
      purpose: "Foreign employees dispatched to work on a commercial service contract with an Irish client company.",
      eligibility: "Employees of foreign contractor firms performing contracted services for Irish client (min salary EUR 46,000+).",
      record_type: "WORK_VISA",
      docs: [
        "DETE Contract for Services Employment Permit Approval ⭐",
        "Commercial Service Contract between foreign contractor & Irish client (CRO registered)",
        "Foreign employer dispatch letter & salary proof",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-WRK-004", "work", "Contract for Services Permit")
    },
    {
      id: "ie-WRK-005",
      officialCode: "IE-WRK-005",
      name: "Reactivation Employment Permit 2 Years (ISD / DETE Scheme)",
      categoryCode: "work",
      fee: "EUR 60 D Visa + EUR 1,000 DETE Permit Fee",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Reactivating employment status for former permit holders who fell out of system through no fault of their own.",
      eligibility: "Former permit holders approved by ISD / DETE reactivation scheme.",
      record_type: "WORK_VISA",
      docs: [
        "DETE Reactivation Employment Permit Approval ⭐",
        "New Irish Employer Contract",
        "ISD Reactivation Scheme Eligibility Letter",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-WRK-005", "work", "Reactivation Employment Permit")
    },
    {
      id: "ie-WRK-006",
      officialCode: "IE-WRK-006",
      name: "Exchange Agreement Employment Permit 2 Years",
      categoryCode: "work",
      fee: "EUR 60 D Visa + EUR 1,000 DETE Permit Fee",
      validity: "2 years",
      stay: "2 years",
      purpose: "Employment under approved international reciprocal exchange agreements (e.g. AIESEC, Fulbright).",
      eligibility: "Participants in recognized international exchange schemes.",
      record_type: "WORK_VISA",
      docs: [
        "DETE Exchange Agreement Employment Permit Approval",
        "Official Reciprocal Exchange Scheme Contract",
        "Valid passport & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-WRK-006", "work", "Exchange Agreement Permit")
    },
    {
      id: "ie-WRK-007",
      officialCode: "IE-WRK-007",
      name: "Sports & Cultural Employment Permit 2 Years",
      categoryCode: "work",
      fee: "EUR 60 D Visa + EUR 1,000 DETE Permit Fee",
      validity: "2 years renewable",
      stay: "2 years",
      purpose: "Employment of professional sports coaches, athletes, or cultural professionals.",
      eligibility: "Professional sports or cultural personnel with national governing body endorsement.",
      record_type: "WORK_VISA",
      docs: [
        "DETE Sports & Cultural Employment Permit Approval ⭐",
        "National Sports / Cultural Governing Body Endorsement",
        "Irish sports club / cultural employer contract",
        "Valid passport & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-WRK-007", "work", "Sports & Cultural Permit")
    },
    {
      id: "ie-WRK-008",
      officialCode: "IE-WRK-008",
      name: "Internship Employment Permit 1 Year (Graduate Internship)",
      categoryCode: "work",
      fee: "EUR 60 D Visa + EUR 500 DETE Permit Fee",
      validity: "1 year non-renewable",
      stay: "1 year",
      purpose: "Paid graduate internship for full-time students enrolled in foreign higher education institutions.",
      eligibility: "Foreign higher education students gaining practical experience in key discipline (min salary EUR 30,000+).",
      record_type: "INTERN_VISA",
      docs: [
        "DETE Internship Employment Permit Approval ⭐",
        "Foreign University Enrollment / Degree Verification Letter",
        "Irish Host Employer Internship Contract (CRO registered)",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-WRK-008", "work", "Internship Employment Permit")
    },
    {
      id: "ie-WRK-009",
      officialCode: "IE-WRK-009",
      name: "D Visa Long Stay Employment Visa 90 Days Single Entry",
      categoryCode: "work",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days single (Entry Visa to obtain IRP Card in Ireland)",
      stay: "90 days",
      purpose: "Entry visa required for non-EEA nationals holding a DETE Work Permit to enter Ireland and register for IRP Card.",
      eligibility: "Holders of valid DETE Employment Permit.",
      record_type: "WORK_VISA",
      docs: [
        "Official DETE Employment Permit Approval Letter ⭐",
        "Signed Employment Contract with Irish employer",
        "AVATS Visa Summary Sheet & VFS receipt",
        "Valid passport & photo"
      ],
      ...getIrelandMicroDetails("ie-WRK-009", "work", "D Visa Long Stay Employment")
    },
    {
      id: "ie-WRK-010",
      officialCode: "IE-WRK-010",
      name: "IRP Stamp 1 Foreigner Work Residence Permit (General Employment)",
      categoryCode: "work",
      fee: "EUR 300 IRP Card Fee",
      validity: "1 to 2 years renewable",
      stay: "Matches DETE Permit validity",
      purpose: "Mandatory Irish Residence Permit (IRP) card stamped with Stamp 1 issued by Burgh Quay / Garda Station upon arrival.",
      eligibility: "General Employment Permit holders registered with ISD.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "D Visa entry stamp in passport ⭐",
        "DETE General Employment Permit Original Letter ⭐",
        "Irish Employer Contract & CRO registration",
        "Proof of Irish residential address",
        "ISD Burgh Quay / Garda IRP Registration"
      ],
      ...getIrelandMicroDetails("ie-WRK-010", "work", "IRP Stamp 1 General Work")
    },
    {
      id: "ie-WRK-011",
      officialCode: "IE-WRK-011",
      name: "IRP Stamp 1H Foreigner Work Residence Permit (Critical Skills)",
      categoryCode: "work",
      fee: "EUR 300 IRP Card Fee",
      validity: "2 years renewable (Direct pathway to Stamp 4 PR after 2Y)",
      stay: "2 years",
      purpose: "Irish Residence Permit (IRP) card stamped with Stamp 1H for Critical Skills Employment Permit holders.",
      eligibility: "Critical Skills Employment Permit holders registered with ISD.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "DETE Critical Skills Employment Permit Original Letter ⭐",
        "D Visa entry stamp in passport ⭐",
        "Signed Irish Employment Contract & pay slips",
        "ISD Burgh Quay / Garda IRP Registration"
      ],
      ...getIrelandMicroDetails("ie-WRK-011", "work", "IRP Stamp 1H Critical Skills")
    },
    {
      id: "ie-WRK-012",
      officialCode: "IE-WRK-012",
      name: "IRP Stamp 1 / 1H Renewal & Extension (ISD Portal)",
      categoryCode: "work",
      fee: "EUR 300 IRP Renewal Fee",
      validity: "1 to 2 years extension",
      stay: "1 to 2 years",
      purpose: "Annual renewal of Stamp 1 or Stamp 1H IRP card.",
      eligibility: "Current Stamp 1 / 1H holders with active employment and DETE permit renewal.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Renewed DETE Employment Permit OR Revenue Employment Detail Summary ⭐",
        "Current IRP card & passport copy",
        "3 months Irish pay slips",
        "ISD online renewal submission"
      ],
      ...getIrelandMicroDetails("ie-WRK-012", "work", "IRP Stamp 1 / 1H Renewal")
    },
    {
      id: "ie-WRK-013",
      officialCode: "IE-WRK-013",
      name: "DETE Work Permit Authorization Clearance (Department Enterprise Trade Employment)",
      categoryCode: "work",
      fee: "EUR 0",
      validity: "Prerequisite work document",
      stay: "Prerequisite document",
      purpose: "Official employment permit approval decision issued online by DETE.",
      eligibility: "Sponsoring Irish firms passing DETE labor checks.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "DETE EPOS online portal permit decision letter ⭐",
        "CRO company registration verification"
      ],
      ...getIrelandMicroDetails("ie-WRK-013", "work", "DETE Work Permit Authorization")
    },
    {
      id: "ie-WRK-014",
      officialCode: "IE-WRK-014",
      name: "Atypical Working Scheme Approval (AWS - Short Term Specialized Work 90 Days)",
      categoryCode: "work",
      fee: "EUR 250 AWS Fee + EUR 60 D Visa",
      validity: "Up to 90 days non-renewable",
      stay: "Up to 90 days",
      purpose: "Short-term specialized work, locum doctor coverage, or specialized technical dispatch under 90 days.",
      eligibility: "Specialized technicians or locum doctors approved by ISD under Atypical Working Scheme.",
      record_type: "WORK_VISA",
      docs: [
        "ISD Atypical Working Scheme (AWS) Approval Letter ⭐",
        "Irish Host Employer Contract & CRO registration",
        "Specialized qualifications / medical license",
        "AVATS D Visa application summary"
      ],
      ...getIrelandMicroDetails("ie-WRK-014", "work", "Atypical Working Scheme AWS")
    },
    {
      id: "ie-WRK-015",
      officialCode: "IE-WRK-015",
      name: "Dependant / Partner / Spouse Employment Permit (DETE Spousal Permit Scheme)",
      categoryCode: "work",
      fee: "EUR 500 DETE Fee + EUR 60 D Visa",
      validity: "Matches primary critical skills permit",
      stay: "Matches spouse",
      purpose: "Full work rights permit for spouse / partner of a Critical Skills Employment Permit or Researcher holder.",
      eligibility: "Spouse or recognized partner of Critical Skills / Researcher Stamp 1H holder with job offer in Ireland.",
      record_type: "WORK_VISA",
      docs: [
        "Spouse Critical Skills Permit / Stamp 1H IRP Card copy ⭐",
        "Apostilled Marriage / Civil Partnership Certificate ⭐",
        "DETE Dependant Employment Permit Approval Letter ⭐",
        "Irish employer job contract & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-WRK-015", "work", "Dependant Spouse Work Permit")
    },
    {
      id: "ie-WRK-016",
      officialCode: "IE-WRK-016",
      name: "Van der Elst Work Permit Exemption (EU Posted Worker)",
      categoryCode: "work",
      fee: "EUR 60 D Visa",
      validity: "1 year",
      stay: "1 year",
      purpose: "Work permit exemption for non-EU staff legally employed in another EU state posted to Ireland.",
      eligibility: "Employees of EU companies providing cross-border services in Ireland.",
      record_type: "WORK_VISA",
      docs: [
        "EU Company Employment Contract & EU Work Permit proof ⭐",
        "Irish Client Service Provision Agreement",
        "AVATS D Visa application"
      ],
      ...getIrelandMicroDetails("ie-WRK-016", "work", "Van der Elst EU Posted Work")
    },
    {
      id: "ie-WRK-017",
      officialCode: "IE-WRK-017",
      name: "Researcher Hosting Agreement Visa (EURAXESS Ireland)",
      categoryCode: "work",
      fee: "EUR 60 D Visa (Work permit fee waived)",
      validity: "2 years renewable (Path to Stamp 4 PR after 2Y)",
      stay: "2 years",
      purpose: "Academic STEM research under official EURAXESS Scientific Researcher Hosting Agreement.",
      eligibility: "Researchers entering a Hosting Agreement with an accredited Irish research institution.",
      record_type: "RESEARCH_VISA",
      docs: [
        "EURAXESS Ireland Scientific Researcher Hosting Agreement ⭐",
        "Accredited Irish University / Research Institute Employment Contract ⭐",
        "PhD / Master's degree credentials",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-WRK-017", "work", "Researcher Hosting Agreement")
    },
    {
      id: "ie-WRK-018",
      officialCode: "IE-WRK-018",
      name: "D Visa Long Stay - Volunteer Visa 90 Days Single",
      categoryCode: "work",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days single (Stamp 3 issued after entry)",
      stay: "1 year",
      purpose: "Entry visa for long-term volunteers entering Ireland.",
      eligibility: "Volunteers with registered Irish non-profit invitation.",
      record_type: "VOLUNTEER_VISA",
      docs: [
        "Irish Charity Regulator invitation & volunteer contract ⭐",
        "AVATS D Visa summary",
        "Valid passport & photo"
      ],
      ...getIrelandMicroDetails("ie-WRK-018", "work", "D Long Stay Volunteer")
    },
    {
      id: "ie-WRK-019",
      officialCode: "IE-WRK-019",
      name: "D Visa Long Stay - Minister of Religion Visa 90 Days Single",
      categoryCode: "work",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days single (Stamp 3 issued after entry)",
      stay: "1 year",
      purpose: "Entry visa for religious ministers posted to Ireland.",
      eligibility: "Ministers of religion invited by recognized religious bodies.",
      record_type: "WORK_VISA",
      docs: [
        "Religious body invitation & sponsorship in Ireland ⭐",
        "Ordination certificate & AVATS summary",
        "Valid passport"
      ],
      ...getIrelandMicroDetails("ie-WRK-019", "work", "D Minister of Religion")
    },
    {
      id: "ie-WRK-020",
      officialCode: "IE-WRK-020",
      name: "D Visa Long Stay - Internship Visa 90 Days Single",
      categoryCode: "work",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days single (Stamp 1 issued after entry)",
      stay: "1 year",
      purpose: "Entry visa for paid graduate interns holding DETE Internship Permit.",
      eligibility: "Interns holding DETE Internship Permit.",
      record_type: "INTERN_VISA",
      docs: [
        "DETE Internship Permit Approval ⭐",
        "Irish employer contract & university dispatch",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-WRK-020", "work", "D Long Stay Internship")
    },
    {
      id: "ie-FAM-011",
      officialCode: "IE-FAM-011",
      name: "D Join Family - Dependant Employment Permit Visa",
      categoryCode: "work",
      fee: "EUR 60 D Visa + EUR 500 DETE Permit Fee",
      validity: "Matches primary critical skills permit",
      stay: "Matches spouse",
      purpose: "Spousal work permit for dependents joining Critical Skills permit holders.",
      eligibility: "Dependents joining Stamp 1H holders receiving job offer in Ireland.",
      record_type: "WORK_VISA",
      docs: [
        "DETE Dependant Employment Permit ⭐",
        "Spouse Stamp 1H IRP Card & critical skills permit",
        "Apostilled marriage certificate & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-FAM-011", "work", "D Join Family Dependant Work")
    },
    {
      id: "ie-STU-008",
      officialCode: "IE-STU-008",
      name: "Third Level Graduate Programme (Stamp 1G - 2 Years Post-Study Work Permit)",
      categoryCode: "work",
      fee: "EUR 300 IRP Card Fee",
      validity: "1 to 2 years non-renewable",
      stay: "1 year for Bachelor's / 2 years for Master's/PhD",
      purpose: "Post-study work permit allowing foreign graduates of Irish universities to work up to 40 hours/week without a DETE permit.",
      eligibility: "Graduates of recognized Irish higher education institutions holding Bachelor's (Honours), Master's, or PhD degree.",
      record_type: "WORK_VISA",
      docs: [
        "Official Graduation Degree Certificate / University Transcript from Irish university ⭐",
        "Current Student IRP Stamp 2 Card & Passport ⭐",
        "Proof of job search or employment in Ireland",
        "ISD Burgh Quay / Garda Stamp 1G Registration Application"
      ],
      ...getIrelandMicroDetails("ie-STU-008", "work", "Third Level Graduate Stamp 1G")
    },
    {
      id: "ie-SPE-013",
      officialCode: "IE-SPE-013",
      name: "Atypical Working Scheme Entry Visa 90 Days",
      categoryCode: "work",
      fee: "EUR 250 AWS + EUR 60 D Visa",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short-term specialized contract work under Atypical Working Scheme.",
      eligibility: "AWS approval holders.",
      record_type: "WORK_VISA",
      docs: [
        "ISD Atypical Working Scheme Approval ⭐",
        "Employer contract & AVATS summary",
        "Valid passport"
      ],
      ...getIrelandMicroDetails("ie-SPE-013", "work", "Atypical Working Scheme Visa")
    }
  ],
  student: [
    {
      id: "ie-STU-001",
      officialCode: "IE-STU-001",
      name: "D Study Long Stay Visa 1 Year (Degree Programs - ILEP Accredited University)",
      categoryCode: "student",
      fee: "EUR 60 Single / EUR 100 Multiple + EUR 300 IRP Card Fee",
      validity: "1 year renewable (Stamp 2 Student Residence Permit)",
      stay: "Matches course duration (1 to 4 years)",
      purpose: "Full-time higher education studies, Bachelor's, Master's, or PhD at ILEP (Interim List of Eligible Programmes) accredited Irish colleges/universities.",
      eligibility: "Accepted students holding official Acceptance Letter from ILEP accredited university + full tuition payment receipt (min EUR 6,000) + bank proof of min EUR 7,000.",
      popular: true,
      highlight: true,
      record_type: "STUDENT_VISA",
      docs: [
        "Official Letter of Acceptance from ILEP accredited Irish Higher Education Institution ⭐",
        "Tuition Fee Payment Receipt (proving min EUR 6,000 / full tuition paid via Electronic Transfer / PayToStudy) ⭐",
        "Personal / Parent Bank Account Statement for past 6 months showing liquid balance of min EUR 7,000 ⭐",
        "Parental Affidavit of Support & Birth Certificate (if using parent bank statement)",
        "Highest Academic Degree Certificates & Transcripts (Apostilled / Notarized)",
        "Proof of English Language Proficiency (IELTS min 6.5 / TOEFL / Duolingo)",
        "Private Medical Insurance Policy in Ireland",
        "AVATS Visa Application Summary Sheet, passport, and photos"
      ],
      ...getIrelandMicroDetails("ie-STU-001", "student", "D Study Long Stay 1Y")
    },
    {
      id: "ie-STU-002",
      officialCode: "IE-STU-002",
      name: "C Study Short Stay Visa 90 Days (Short Course / Summer School)",
      categoryCode: "student",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "Up to 90 days",
      stay: "Up to 90 days",
      purpose: "Short-term academic courses, summer school, or training under 90 days.",
      eligibility: "Students admitted to short courses under 90 days in Ireland.",
      record_type: "STUDENT_VISA",
      docs: [
        "Official Short Course Acceptance Letter from Irish college ⭐",
        "Tuition fee receipt & accommodation details",
        "Bank statement showing min EUR 3,000 liquid balance",
        "AVATS application summary sheet"
      ],
      ...getIrelandMicroDetails("ie-STU-002", "student", "C Study Short Stay 90D")
    },
    {
      id: "ie-STU-003",
      officialCode: "IE-STU-003",
      name: "D Study Visa Extension 1 Year (ISD Burgh Quay / Stamp 2 Renewal)",
      categoryCode: "student",
      fee: "EUR 300 IRP Card Fee",
      validity: "1 year extension",
      stay: "1 year",
      purpose: "Annual extension of Stamp 2 Student IRP card for ongoing degree studies.",
      eligibility: "Current Stamp 2 student holders passing exams and maintaining 85%+ attendance.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "University Enrollment Certificate & Exam Results (proving course progression) ⭐",
        "Tuition Fee Payment Receipt for upcoming academic year ⭐",
        "Bank statement showing min EUR 4,500 living funds",
        "ISD online student IRP renewal submission"
      ],
      ...getIrelandMicroDetails("ie-STU-003", "student", "D Study Extension ISD")
    },
    {
      id: "ie-STU-004",
      officialCode: "IE-STU-004",
      name: "C Study Visa Extension 90 Days (ISD)",
      categoryCode: "student",
      fee: "EUR 0",
      validity: "90 days extension",
      stay: "90 days",
      purpose: "Extension of short-term C study visa for additional short course term.",
      eligibility: "C study holders with college extension letter.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Irish college short course extension letter",
        "Bank statement showing living funds",
        "ISD extension application"
      ],
      ...getIrelandMicroDetails("ie-STU-004", "student", "C Study Extension ISD")
    },
    {
      id: "ie-STU-005",
      officialCode: "IE-STU-005",
      name: "IRP Stamp 2 Foreign Student Residence Permit 1 Year (Full-Time Degree)",
      categoryCode: "student",
      fee: "EUR 300 IRP Card Fee",
      validity: "1 year renewable (Permits 20 hrs/wk work during term, 40 hrs/wk holidays)",
      stay: "1 year",
      purpose: "Mandatory Irish Residence Permit (IRP) card stamped with Stamp 2 issued by ISD upon arrival in Ireland.",
      eligibility: "Full-time degree students enrolled in ILEP accredited programs.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "D Study Visa entry stamp in passport ⭐",
        "Official University Acceptance Letter & tuition fee receipt ⭐",
        "Proof of Irish private medical insurance",
        "Proof of Irish residential address",
        "ISD Burgh Quay / Garda IRP Registration Application"
      ],
      ...getIrelandMicroDetails("ie-STU-005", "student", "IRP Stamp 2 Student Residence")
    },
    {
      id: "ie-STU-006",
      officialCode: "IE-STU-006",
      name: "D Study - Doctoral PhD Student Visa 4 Years",
      categoryCode: "student",
      fee: "EUR 60 D Visa + EUR 300 Stamp 2 IRP Card Fee",
      validity: "4 years renewable",
      stay: "4 years",
      purpose: "Doctoral PhD research and degree studies at Irish research universities.",
      eligibility: "Master's degree holders admitted to PhD program with university research funding.",
      record_type: "STUDENT_VISA",
      docs: [
        "PhD Acceptance Letter & Research Advisor Funding Approval ⭐",
        "Master's Degree Certificate & Transcripts (Apostilled)",
        "University research fellowship / stipend award letter",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-STU-006", "student", "D Study Doctoral PhD")
    },
    {
      id: "ie-STU-007",
      officialCode: "IE-STU-007",
      name: "D Study Language Course Visa 1 Year (ILEP English Language Schools)",
      categoryCode: "student",
      fee: "EUR 60 D Visa + EUR 300 Stamp 2 IRP Card Fee",
      validity: "25 weeks / 1 year renewable (Max 3 terms / 2 years total)",
      stay: "25 weeks",
      purpose: "Enrolling in 25-week English language courses at ILEP accredited language schools.",
      eligibility: "Students accepted for 25-week English course with 15+ hours/week tuition paid.",
      record_type: "STUDENT_VISA",
      docs: [
        "ILEP Language School Acceptance Letter (min 25-week course) ⭐",
        "Learner Protection Insurance Policy & Tuition Payment Receipt ⭐",
        "Bank statement showing min EUR 7,000 liquid balance",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-STU-007", "student", "D Study Language Course")
    },
    {
      id: "ie-STU-009",
      officialCode: "IE-STU-009",
      name: "D Study - Academic Researcher Visa 1 Year (EURAXESS)",
      categoryCode: "student",
      fee: "EUR 60 D Visa + EUR 300 Stamp 4 IRP Fee",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Academic STEM research under Hosting Agreement.",
      eligibility: "Researchers entering Hosting Agreement with accredited Irish research center.",
      record_type: "RESEARCH_VISA",
      docs: [
        "EURAXESS Scientific Researcher Hosting Agreement ⭐",
        "Irish university research contract & stipend proof",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-STU-009", "student", "D Study Academic Researcher")
    },
    {
      id: "ie-STU-010",
      officialCode: "IE-STU-010",
      name: "D Study - Long Unpaid Internship Visa 1 Year",
      categoryCode: "student",
      fee: "EUR 60 D Visa + EUR 300 Stamp 1 IRP Fee",
      validity: "1 year",
      stay: "1 year",
      purpose: "Long-term academic curriculum internship exceeding 90 days.",
      eligibility: "Enrolled university students with DETE Internship Permit approval.",
      record_type: "INTERN_VISA",
      docs: [
        "DETE Internship Permit Approval Letter ⭐",
        "University dispatch & host company contract",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-STU-010", "student", "D Study Long Internship")
    },
    {
      id: "ie-STU-011",
      officialCode: "IE-STU-011",
      name: "C Study - Erasmus+ Exchange Visa 90 Days",
      categoryCode: "student",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short exchange studies under European Union Erasmus+ Mobility scheme.",
      eligibility: "Erasmus+ grant holders admitted for exchange term in Ireland.",
      record_type: "STUDENT_VISA",
      docs: [
        "Erasmus+ Mobility Grant Certificate ⭐",
        "Irish university exchange acceptance letter",
        "AVATS application summary"
      ],
      ...getIrelandMicroDetails("ie-STU-011", "student", "C Study Erasmus+ Exchange")
    },
    {
      id: "ie-STU-012",
      officialCode: "IE-STU-012",
      name: "D Study - Government Scholarship Student Visa 1 Year (GOI-IES)",
      categoryCode: "student",
      fee: "EUR 60 D Visa",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Government of Ireland International Education Scholarship (GOI-IES) study.",
      eligibility: "Recipients of GOI-IES full tuition scholarship.",
      record_type: "STUDENT_VISA",
      docs: [
        "Government of Ireland International Education Scholarship Award Letter ⭐",
        "Irish university acceptance letter",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-STU-012", "student", "GOI-IES Scholarship Student")
    },
    {
      id: "ie-SPE-008",
      officialCode: "IE-SPE-008",
      name: "IRP Stamp 1G Graduate Post-Study Work Permit 2 Years (ISD Burgh Quay)",
      categoryCode: "student",
      fee: "EUR 300 IRP Card Fee",
      validity: "1 to 2 years non-renewable",
      stay: "1 to 2 years",
      purpose: "Post-study work permit allowing foreign graduates to work full-time in Ireland.",
      eligibility: "Graduates of recognized Irish higher education institutions holding Stamp 2.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "Official Irish University Graduation Degree Certificate ⭐",
        "Student Stamp 2 IRP Card & passport",
        "ISD Stamp 1G Registration Application"
      ],
      ...getIrelandMicroDetails("ie-SPE-008", "student", "IRP Stamp 1G Post-Study Work")
    }
  ],
  family: [
    {
      id: "ie-FAM-001",
      officialCode: "IE-FAM-001",
      name: "D Join Family Long Stay Visa 1 Year (Family Reunification - Spouse / Children)",
      categoryCode: "family",
      fee: "EUR 60 Single / EUR 100 Multiple + EUR 300 IRP Card Fee",
      validity: "1 year renewable (Stamp 4 / Stamp 3 Residence Permit issued after entry)",
      stay: "Matches sponsor's IRP validity",
      purpose: "Long-term family reunification for spouse, civil partner, or dependent children joining an Irish citizen or Stamp 1 / 1H / 4 / 5 resident.",
      eligibility: "Spouse, civil partner, or unmarried minor child joining primary sponsor residing in Ireland who meets INIS net income threshold (EUR 30,000+).",
      popular: true,
      highlight: true,
      record_type: "FAMILY_VISA",
      docs: [
        "Primary Sponsor's Irish Passport / Irish Residence Permit (IRP Stamp 1 / 1H / 4) copy ⭐",
        "Primary Sponsor's Revenue Employment Detail Summary / P60 showing min EUR 30,000+ net annual income ⭐",
        "Apostilled / Consular Authenticated Marriage Certificate (for spouse join) ⭐",
        "Apostilled / Consular Authenticated Birth Certificate (for child join) ⭐",
        "Signed Sponsor Guarantee Letter & Housing Lease Agreement in Ireland",
        "Applicant 6 months bank statement & AVATS summary sheet",
        "Valid applicant passport, photos, and medical insurance"
      ],
      ...getIrelandMicroDetails("ie-FAM-001", "family", "D Join Family Long Stay 1Y")
    },
    {
      id: "ie-FAM-002",
      officialCode: "IE-FAM-002",
      name: "D Join Family - Spouse & Civil Partner Visa 1 Year",
      categoryCode: "family",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "1 year renewable",
      stay: "1 year (Stamp 4 PR pathway after entry)",
      purpose: "Reunification for foreign spouse or civil partner of Irish citizen or Critical Skills holder.",
      eligibility: "Legally married spouse or registered civil partner meeting INIS income threshold.",
      record_type: "FAMILY_VISA",
      docs: [
        "Apostilled Marriage / Civil Partnership Certificate ⭐",
        "Irish Spouse Passport OR Resident Sponsor's Stamp 1H IRP Card ⭐",
        "Sponsor Revenue P60 / Employment Detail Summary (min EUR 30k+ income)",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-FAM-002", "family", "D Join Family Spouse")
    },
    {
      id: "ie-FAM-003",
      officialCode: "IE-FAM-003",
      name: "D Join Family - Dependent Child Visa 1 Year",
      categoryCode: "family",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Reunification for unmarried minor dependent children (under 18) joining parents in Ireland.",
      eligibility: "Unmarried minor children of primary resident in Ireland.",
      record_type: "FAMILY_VISA",
      docs: [
        "Apostilled Birth Certificate ⭐",
        "Sponsor parent IRP card & Revenue tax proof",
        "Sole custody court order / Consent letter from non-accompanying parent",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-FAM-003", "family", "D Join Family Child")
    },
    {
      id: "ie-FAM-004",
      officialCode: "IE-FAM-004",
      name: "D Join Family - Elderly Dependent Parent Visa 1 Year (Stamp 0 Stream)",
      categoryCode: "family",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "1 year renewable",
      stay: "1 year (Stamp 0 issued after entry)",
      purpose: "Reunification for elderly dependent parents joining adult children in Ireland.",
      eligibility: "Elderly parents financially dependent on adult child residing in Ireland earning min EUR 60,000+ net per year.",
      record_type: "FAMILY_VISA",
      docs: [
        "Apostilled Kinship / Birth Certificate ⭐",
        "Adult child Revenue tax returns in Ireland showing min EUR 60,000+ net income ⭐",
        "Proof of financial dependency of parent on adult child",
        "Private medical insurance policy in Ireland & AVATS summary"
      ],
      ...getIrelandMicroDetails("ie-FAM-004", "family", "D Join Family Elderly Parent")
    },
    {
      id: "ie-FAM-005",
      officialCode: "IE-FAM-005",
      name: "IRP Stamp 4 Family Residence Permit 1 to 2 Years (ISD Burgh Quay / Garda)",
      categoryCode: "family",
      fee: "EUR 300 IRP Card Fee",
      validity: "1 to 2 years renewable (Grants full work rights without DETE permit)",
      stay: "1 to 2 years",
      purpose: "Mandatory Irish Residence Permit (IRP) card stamped with Stamp 4 issued to family members of Irish citizens or Stamp 1H holders.",
      eligibility: "Family members who entered on D Join Family visa and registered with ISD.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "D Join Family Visa entry stamp in passport ⭐",
        "Apostilled Marriage / Birth Certificate ⭐",
        "Primary sponsor Irish Passport / IRP Stamp 1H copy ⭐",
        "Proof of Irish residential address",
        "ISD Burgh Quay / Garda IRP Registration Application"
      ],
      ...getIrelandMicroDetails("ie-FAM-005", "family", "IRP Stamp 4 Family Residence")
    },
    {
      id: "ie-FAM-006",
      officialCode: "IE-FAM-006",
      name: "IRP Stamp 4 Family Residence Permit Renewal 2 Years (ISD Portal)",
      categoryCode: "family",
      fee: "EUR 300 IRP Renewal Fee",
      validity: "2 years extension",
      stay: "2 years",
      purpose: "Renewal of Stamp 4 Family IRP card.",
      eligibility: "Current Stamp 4 family cardholders maintaining family relationship in Ireland.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Current Stamp 4 IRP Card & passport copy ⭐",
        "Proof of continuous cohabitation in Ireland (joint utility bills / lease)",
        "Primary sponsor IRP card / Irish passport copy",
        "ISD online renewal submission"
      ],
      ...getIrelandMicroDetails("ie-FAM-006", "family", "IRP Stamp 4 Family Renewal")
    },
    {
      id: "ie-FAM-007",
      officialCode: "IE-FAM-007",
      name: "D Join Family - Adoption Visa 1 Year",
      categoryCode: "family",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "1 year",
      stay: "1 year",
      purpose: "Entry visa for adopted foreign minor child.",
      eligibility: "Adopted minor child with Adoption Authority of Ireland declaration.",
      record_type: "FAMILY_VISA",
      docs: [
        "Adoption Authority of Ireland (AAI) Declaration Certificate ⭐",
        "Foreign adoption decree (Apostilled)",
        "Adoptive parent Irish passport / IRP card",
        "AVATS D Visa summary"
      ],
      ...getIrelandMicroDetails("ie-FAM-007", "family", "D Join Family Adoption")
    },
    {
      id: "ie-FAM-008",
      officialCode: "IE-FAM-008",
      name: "D Join Family - EU Treaty Rights Visa 5 Years (EU1 Scheme - EU National Family)",
      categoryCode: "family",
      fee: "EUR 0 (Fee waived under EU Free Movement)",
      validity: "5 years (EU1 Residence Card issued after entry)",
      stay: "5 years",
      purpose: "Family reunification for non-EEA family members of EU/EEA citizens exercising treaty rights in Ireland.",
      eligibility: "Non-EEA family members joining EU citizen working or residing in Ireland under Directive 2004/38/EC.",
      record_type: "FAMILY_VISA",
      docs: [
        "EU Citizen Family Member Passport / ID Card copy ⭐",
        "Apostilled Marriage / Birth Certificate proving family link ⭐",
        "Proof of EU citizen exercising treaty rights in Ireland (employment contract / Revenue tax proof) ⭐",
        "AVATS D Visa EU1 summary"
      ],
      ...getIrelandMicroDetails("ie-FAM-008", "family", "EU Treaty Rights EU1 Visa")
    },
    {
      id: "ie-FAM-009",
      officialCode: "IE-FAM-009",
      name: "C Join Family Short Stay Visa 90 Days",
      categoryCode: "family",
      fee: "EUR 60 Single / EUR 100 Multiple",
      validity: "90 days",
      stay: "90 days",
      purpose: "Short family visit for family members not intending long-term residency.",
      eligibility: "Family members visiting Irish residents for under 90 days.",
      record_type: "FAMILY_VISA",
      docs: [
        "Host family IRP / Irish passport copy",
        "Apostilled relation proof & invitation letter",
        "AVATS application summary"
      ],
      ...getIrelandMicroDetails("ie-FAM-009", "family", "C Join Family Short Stay")
    },
    {
      id: "ie-FAM-010",
      officialCode: "IE-FAM-010",
      name: "C Join Family Extension 90 Days (ISD)",
      categoryCode: "family",
      fee: "EUR 0",
      validity: "90 days extension",
      stay: "90 days",
      purpose: "Emergency extension of short family visit visa.",
      eligibility: "C join family holders with emergency reasons.",
      record_type: "STATUS_DOCUMENT",
      docs: [
        "Host family statement & emergency medical proof",
        "ISD extension application"
      ],
      ...getIrelandMicroDetails("ie-FAM-010", "family", "C Join Family Extension ISD")
    },
    {
      id: "ie-FAM-012",
      officialCode: "IE-FAM-012",
      name: "IRP Stamp 2A Dependant Student Child Residence Permit 1 Year",
      categoryCode: "family",
      fee: "EUR 300 IRP Fee",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Residence permit for dependent minor child of foreign student / worker in Irish secondary school.",
      eligibility: "Dependent child enrolled in Irish primary / secondary school.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "Primary parent IRP Stamp 1 / 1H / 2 Card ⭐",
        "Irish school enrollment certificate",
        "Apostilled birth certificate",
        "ISD IRP Registration Application"
      ],
      ...getIrelandMicroDetails("ie-FAM-012", "family", "IRP Stamp 2A Dependant Child")
    },
    {
      id: "ie-SPE-006",
      officialCode: "IE-SPE-006",
      name: "IRP Stamp 3 Dependant Spouse & Family Residence Permit 1 Year",
      categoryCode: "family",
      fee: "EUR 300 IRP Card Fee",
      validity: "1 year renewable (Non-working status unless DETE permit issued)",
      stay: "1 year",
      purpose: "Residence permit for non-working dependents of foreign workers (General Employment Permit / Stamp 1).",
      eligibility: "Spouse or dependent of Stamp 1 general work permit holder.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "Primary sponsor's Stamp 1 IRP Card & employment contract ⭐",
        "Apostilled Marriage / Birth Certificate ⭐",
        "Proof of joint address in Ireland",
        "ISD Burgh Quay / Garda Registration"
      ],
      ...getIrelandMicroDetails("ie-SPE-006", "family", "IRP Stamp 3 Dependant Residence")
    },
    {
      id: "ie-SPE-007",
      officialCode: "IE-SPE-007",
      name: "IRP Stamp 2A Dependant Child School Residence Permit 1 Year",
      categoryCode: "family",
      fee: "EUR 300 IRP Card Fee",
      validity: "1 year renewable",
      stay: "1 year",
      purpose: "Dependent child residence permit for secondary school students.",
      eligibility: "Minor dependent children of foreign work permit holders.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "Primary parent IRP Stamp 1 / 1H Card ⭐",
        "School attendance certificate in Ireland",
        "ISD Registration"
      ],
      ...getIrelandMicroDetails("ie-SPE-007", "family", "IRP Stamp 2A School Child")
    },
    {
      id: "ie-SPE-009",
      officialCode: "IE-SPE-009",
      name: "IRP Stamp 4 EUFAM Residence Card 5 Years (EU Treaty Rights Family)",
      categoryCode: "family",
      fee: "EUR 300 IRP Fee",
      validity: "5 years renewable (Grants full work & residence rights)",
      stay: "5 years",
      purpose: "Residence card for non-EEA family members of EU citizens residing in Ireland under EU1 scheme.",
      eligibility: "Non-EEA family members holding approved EU1 decision from ISD.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "ISD EU1 Decision Approval Letter ⭐",
        "EU citizen family member Passport & IRP Stamp 4 EUFAM Application",
        "Apostilled Marriage / Birth Certificate",
        "ISD Burgh Quay / Garda Registration"
      ],
      ...getIrelandMicroDetails("ie-SPE-009", "family", "IRP Stamp 4 EUFAM Card")
    }
  ],
  pr: [
    {
      id: "ie-PR-001",
      officialCode: "IE-PR-001",
      name: "IIP Immigrant Investor Programme EUR 1,000,000 (PR Ireland - Stamp 4 Residence)",
      categoryCode: "pr",
      fee: "EUR 1,500 IIP Application Fee + EUR 1,000,000 Enterprise Investment",
      validity: "2 years initial / 3 years renewal / Permanent (Stamp 4 PR)",
      stay: "Indefinite Permanent Residence",
      purpose: "Permanent residency for high net worth investors making approved capital investments in Ireland.",
      eligibility: "Net worth of min EUR 2,000,000 + investment of min EUR 1,000,000 into an approved Irish enterprise / fund for at least 3 years.",
      popular: true,
      highlight: true,
      record_type: "PR_VISA",
      docs: [
        "ISD Immigrant Investor Programme (IIP) Official Approval Decision Letter ⭐",
        "Proof of Net Worth of min EUR 2,000,000 certified by Irish qualified accountant ⭐",
        "Proof of Transfer of EUR 1,000,000 Investment Funds to approved Irish Enterprise / Fund ⭐",
        "Apostilled Nationwide Police Clearance Check (home country under 6 months) ⭐",
        "Valid passport & ISD Stamp 4 Registration Application"
      ],
      ...getIrelandMicroDetails("ie-PR-001", "pr", "IIP Immigrant Investor EUR 1M")
    },
    {
      id: "ie-PR-002",
      officialCode: "IE-PR-002",
      name: "IIP Enterprise Investment Stream (EUR 1,000,000 Direct Enterprise)",
      categoryCode: "pr",
      fee: "EUR 1,500 IIP Fee",
      validity: "Permanent Residence",
      stay: "Indefinite",
      purpose: "Direct investment of EUR 1M into a new or existing Irish enterprise created/expanded in Ireland.",
      eligibility: "Direct enterprise investment of EUR 1,000,000 maintained for 3 years.",
      record_type: "PR_VISA",
      docs: [
        "IIP Enterprise Investment Approval Letter ⭐",
        "Irish Enterprise CRO Business Registration & Audited Accounts",
        "Proof of EUR 1,000,000 equity investment transfer",
        "Apostilled Police Clearance Certificate"
      ],
      ...getIrelandMicroDetails("ie-PR-002", "pr", "IIP Enterprise Investment")
    },
    {
      id: "ie-PR-003",
      officialCode: "IE-PR-003",
      name: "IIP Approved Investment Fund Stream (EUR 1,000,000 Investment Fund)",
      categoryCode: "pr",
      fee: "EUR 1,500 IIP Fee",
      validity: "Permanent Residence",
      stay: "Indefinite",
      purpose: "Investment of EUR 1M into a Central Bank of Ireland regulated IIP venture capital fund.",
      eligibility: "Investment of EUR 1,000,000 into approved IIP investment fund.",
      record_type: "PR_VISA",
      docs: [
        "IIP Regulated Investment Fund Subscription Certificate ⭐",
        "Central Bank of Ireland Fund Authorization Certificate",
        "Apostilled Police Clearance Certificate",
        "ISD PR Application"
      ],
      ...getIrelandMicroDetails("ie-PR-003", "pr", "IIP Investment Fund Stream")
    },
    {
      id: "ie-PR-004",
      officialCode: "IE-PR-004",
      name: "IIP Real Estate Investment Trust (REIT Stream - EUR 2,000,000)",
      categoryCode: "pr",
      fee: "EUR 1,500 IIP Fee",
      validity: "Permanent Residence",
      stay: "Indefinite",
      purpose: "Investment of EUR 2M into an Irish Real Estate Investment Trust (REIT) listed on Irish Stock Exchange.",
      eligibility: "REIT investment of EUR 2,000,000 maintained for 3 years.",
      record_type: "PR_VISA",
      docs: [
        "Irish Stock Exchange REIT Share Holding Certificate (EUR 2M+) ⭐",
        "IIP REIT Approval Letter",
        "Apostilled Police Clearance Check",
        "ISD PR Application"
      ],
      ...getIrelandMicroDetails("ie-PR-004", "pr", "IIP Real Estate REIT Stream")
    },
    {
      id: "ie-PR-005",
      officialCode: "IE-PR-005",
      name: "IRP Stamp 4 Long Term Residence Permit (5 Years Reckonable Residence in Ireland)",
      categoryCode: "pr",
      fee: "EUR 300 IRP Card Fee",
      validity: "5 years renewable (Stamp 4 Long Term Residence)",
      stay: "Indefinite Permanent Residence",
      purpose: "Long-term permanent residence permit granted after 5 years continuous reckonable residence on Stamp 1 / Stamp 1H / Stamp 4.",
      eligibility: "5 consecutive years (60 months) reckonable legal residence in Ireland holding Stamp 1, Stamp 1H, or Stamp 4 + continuous employment & tax compliance.",
      record_type: "PR_VISA",
      docs: [
        "Proof of 5 Years Continuous Reckonable Residence in Ireland (IRP Cards / Stamp history) ⭐",
        "Revenue Employment Detail Summaries / P60 for past 5 consecutive years ⭐",
        "5 Years Irish Pay Slips & Bank Statements",
        "Clean Garda Criminal Background Check in Ireland ⭐",
        "ISD Long Term Residence Application Form"
      ],
      ...getIrelandMicroDetails("ie-PR-005", "pr", "IRP Stamp 4 Long Term Residence")
    },
    {
      id: "ie-PR-006",
      officialCode: "IE-PR-006",
      name: "Irish Citizenship by Naturalization (5 Years Reckonable Residence - Department of Justice)",
      categoryCode: "pr",
      fee: "EUR 175 Application Fee + EUR 950 Certificate Fee",
      validity: "Lifetime Irish European Union Citizenship",
      stay: "Permanent Citizen",
      purpose: "Full acquisition of Irish Citizenship and EU Passport under Irish Nationality and Citizenship Act.",
      eligibility: "5 years (1,825 days) reckonable residence in Ireland within past 8 years (including 1 year continuous residence before application) + good character + Score 150 points on ISD identity test.",
      record_type: "PR_VISA",
      docs: [
        "Proof of 1,825 Days Reckonable Residence in Ireland (calculated via ISD Online Calculator) ⭐",
        "Score 150 Points Identity & Residency Proofs (Revenue P60s, Utility Bills, Bank Statements) ⭐",
        "Original Foreign Passport & Certified Copy of Birth Certificate",
        "Clean Garda Criminal Check & Signed Declaration of Fidelity to Nation ⭐",
        "Department of Justice Naturalization Application Form 8"
      ],
      ...getIrelandMicroDetails("ie-PR-006", "pr", "Irish Citizenship Naturalization")
    },
    {
      id: "ie-SPE-010",
      officialCode: "IE-SPE-010",
      name: "IRP Stamp 5 Without Condition as to Time (8 Years Residence in Ireland)",
      categoryCode: "pr",
      fee: "EUR 300 IRP Card Fee",
      validity: "Indefinite Permanent Residence (Stamp 5)",
      stay: "Indefinite",
      purpose: "Permanent residence endorsement in passport without condition as to time.",
      eligibility: "8 years (96 months) continuous legal residence in Ireland on Stamp 1, Stamp 1H, or Stamp 4.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "Proof of 8 Years Continuous Reckonable Residence in Ireland ⭐",
        "IRP Cards & Revenue tax summaries for 8 years",
        "Clean Garda record",
        "ISD Stamp 5 Application"
      ],
      ...getIrelandMicroDetails("ie-SPE-010", "pr", "IRP Stamp 5 Without Condition")
    },
    {
      id: "ie-SPE-011",
      officialCode: "IE-SPE-011",
      name: "IRP Stamp 6 Dual Nationality Endorsement (Irish Citizen Dual Passport Holder)",
      categoryCode: "pr",
      fee: "EUR 300 IRP Fee",
      validity: "Indefinite",
      stay: "Indefinite",
      purpose: "Stamp 6 endorsement in foreign passport for dual Irish citizens.",
      eligibility: "Dual Irish citizens holding foreign passport.",
      record_type: "RESIDENCE_PERMIT",
      docs: [
        "Irish Naturalization Certificate / Irish Passport ⭐",
        "Foreign Passport copy",
        "ISD Stamp 6 Application"
      ],
      ...getIrelandMicroDetails("ie-SPE-011", "pr", "IRP Stamp 6 Dual Citizen")
    }
  ]
};
