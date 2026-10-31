// ========================================================================
// UK Regional Jobs & Sponsorship Directory (Master Category 14)
// Supporting Intelligence Data — NOT a standalone visa category
// ========================================================================

export const UK_REGIONAL_WARNING_TEXT = 
  "CRITICAL: UK mein Australia ke DAMA ya designated regional visa-subclass system jaisa alag immigration programme nahi hai. " +
  "Lekin regional salary rules, eligible sponsor locations, occupation requirements aur devolved/nation-specific schemes ko " +
  "supporting data ke roop mein rakhna useful hai. Regional location apne aap visa eligibility nahi banata. Skilled Worker salary " +
  "calculation occupation going rate, general threshold, working hours aur permitted salary options par depend karti hai. Official " +
  "rules going rates ko 37.5-hour week basis par calculate/pro-rate karte hain. Regional sponsor directory ko separate visa category mat samajhna.";

export const UK_EUSS_WARNING_TEXT = 
  "Deadline past ho chuki hai (30 June 2021). Late application ke liye 'reasonable grounds' mandatory hain. Pre-settled status holders ko 2-year automatic extension milti hai lekin settled status (ILR) apply karna recommended hai. Digital status share code se verify hota hai, physical card nahi milta.";

export const UK_BNO_WARNING_TEXT = 
  "BN(O) route ko sirf ek visa record tak limit na rakhein. Permission, dependant eligibility aur settlement ko separate linked records banayein.";

export const UK_UKRAINE_WARNING_TEXT = 
  "Ukraine Schemes close ho chuki hain new applicants ke liye. Existing holders Ukraine Permission Extension (UPE) scheme ke through 18 months extend kar sakte hain (from early 2025). Free application, no IHS, no salary requirement.";

export const UK_NATIONALITY_WARNING_TEXT = 
  "Nationality and citizenship routes visa nahi hain. Registration, naturalisation aur confirmation procedures hain. Home Office fees non-refundable hain. Life in the UK test + English B1 mandatory hain settlement/citizenship ke liye.";

export const UK_ENTRY_WARNING_TEXT = 
  "Permission to Enter, Electronic Travel Authorisation (ETA) aur Direct Airside Transit alag legal instruments hain. ETA visa nahi hai - digital pre-travel authorization hai non-visa nationals ke liye. Transit without visa (TWOV) concession specific criteria par depend karta hai.";

export const UK_LEGACY_WARNING_TEXT = 
  "Legacy routes closed to new applicants, transitional only, replaced_by current route - Website par visa currently open mat dikhana.";

export interface RegionalSponsorItem {
  id: string;
  name: string;
  city: string;
  country: 'England' | 'Scotland' | 'Wales' | 'Northern Ireland';
  tierRating: 'A-rated (Eligible)' | 'B-rated';
  licensedRoutes: string[];
  sector: string;
  postcodeArea: string;
  officialRegisterUrl: string;
}

export interface RegionalSalaryRuleItem {
  socCode: string;
  jobTitle: string;
  standardGoingRate: string; // 37.5 hr week basis
  islRate: string;           // 20% concession
  newEntrantRate: string;    // 70% of going rate
  eligibleRegions: string;
  govUkSource: string;
}

export const REGIONAL_SPONSOR_DIRECTORY: RegionalSponsorItem[] = [
  {
    id: "sp-eng-lon-01",
    name: "Imperial College Healthcare NHS Trust",
    city: "London",
    country: "England",
    tierRating: "A-rated (Eligible)",
    licensedRoutes: ["Skilled Worker", "Health and Care Worker"],
    sector: "Healthcare & Life Sciences",
    postcodeArea: "W2 1NY",
    officialRegisterUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  },
  {
    id: "sp-eng-man-02",
    name: "Manchester University NHS Foundation Trust",
    city: "Manchester",
    country: "England",
    tierRating: "A-rated (Eligible)",
    licensedRoutes: ["Skilled Worker", "Health and Care Worker"],
    sector: "Healthcare & Medical Services",
    postcodeArea: "M13 9WL",
    officialRegisterUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  },
  {
    id: "sp-eng-birm-03",
    name: "National Grid Electricity Distribution",
    city: "Birmingham",
    country: "England",
    tierRating: "A-rated (Eligible)",
    licensedRoutes: ["Skilled Worker", "Global Business Mobility"],
    sector: "Energy & Infrastructure",
    postcodeArea: "B3 3EE",
    officialRegisterUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  },
  {
    id: "sp-scot-edin-04",
    name: "NHS Lothian Health Board",
    city: "Edinburgh",
    country: "Scotland",
    tierRating: "A-rated (Eligible)",
    licensedRoutes: ["Skilled Worker", "Health and Care Worker"],
    sector: "Healthcare & Clinical Care",
    postcodeArea: "EH16 4SA",
    officialRegisterUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  },
  {
    id: "sp-scot-glas-05",
    name: "Scottish Power Energy Networks Holdings",
    city: "Glasgow",
    country: "Scotland",
    tierRating: "A-rated (Eligible)",
    licensedRoutes: ["Skilled Worker", "Global Business Mobility"],
    sector: "Renewable Energy & Utilities",
    postcodeArea: "G2 5AD",
    officialRegisterUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  },
  {
    id: "sp-scot-aber-06",
    name: "Wood Group UK Limited",
    city: "Aberdeen",
    country: "Scotland",
    tierRating: "A-rated (Eligible)",
    licensedRoutes: ["Skilled Worker", "Senior or Specialist Worker"],
    sector: "Offshore Engineering & Energy",
    postcodeArea: "AB12 3GY",
    officialRegisterUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  },
  {
    id: "sp-wales-card-07",
    name: "Cardiff and Vale University Health Board",
    city: "Cardiff",
    country: "Wales",
    tierRating: "A-rated (Eligible)",
    licensedRoutes: ["Skilled Worker", "Health and Care Worker"],
    sector: "NHS Wales Healthcare",
    postcodeArea: "CF14 4XW",
    officialRegisterUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  },
  {
    id: "sp-wales-swan-08",
    name: "Tata Steel UK Limited",
    city: "Port Talbot / Swansea",
    country: "Wales",
    tierRating: "A-rated (Eligible)",
    licensedRoutes: ["Skilled Worker", "Global Business Mobility"],
    sector: "Manufacturing & Metallurgy",
    postcodeArea: "SA13 2NG",
    officialRegisterUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  },
  {
    id: "sp-ni-belf-09",
    name: "Belfast Health and Social Care Trust",
    city: "Belfast",
    country: "Northern Ireland",
    tierRating: "A-rated (Eligible)",
    licensedRoutes: ["Skilled Worker", "Health and Care Worker"],
    sector: "HSC Northern Ireland Healthcare",
    postcodeArea: "BT9 7AB",
    officialRegisterUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  },
  {
    id: "sp-ni-derry-10",
    name: "Seagate Technology Media (Ireland)",
    city: "Derry / Londonderry",
    country: "Northern Ireland",
    tierRating: "A-rated (Eligible)",
    licensedRoutes: ["Skilled Worker", "Senior or Specialist Worker"],
    sector: "Advanced Electronics & R&D",
    postcodeArea: "BT48 0BF",
    officialRegisterUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  }
];

export const REGIONAL_SALARY_RULES: RegionalSalaryRuleItem[] = [
  {
    socCode: "2136",
    jobTitle: "Programmers and software development professionals",
    standardGoingRate: "£49,400 (£25.33/hr based on 37.5-hr week)",
    islRate: "£30,960 minimum threshold",
    newEntrantRate: "£34,580 (70% of £49,400)",
    eligibleRegions: "UK-wide (England, Scotland, Wales, Northern Ireland)",
    govUkSource: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations"
  },
  {
    socCode: "2112",
    jobTitle: "Biological scientists and biochemists",
    standardGoingRate: "£41,900 (£21.49/hr based on 37.5-hr week)",
    islRate: "£30,960 (on ISL list)",
    newEntrantRate: "£30,960 (floor)",
    eligibleRegions: "UK-wide (Scotland & England research clusters)",
    govUkSource: "https://www.gov.uk/government/publications/skilled-worker-visa-immigration-salary-list"
  },
  {
    socCode: "2121",
    jobTitle: "Civil engineers",
    standardGoingRate: "£45,500 (£23.33/hr based on 37.5-hr week)",
    islRate: "£31,850 (on ISL list)",
    newEntrantRate: "£31,850",
    eligibleRegions: "UK-wide infrastructure projects",
    govUkSource: "https://www.gov.uk/government/publications/skilled-worker-visa-immigration-salary-list"
  },
  {
    socCode: "2211",
    jobTitle: "General medical practitioners (GPs)",
    standardGoingRate: "£68,525 (National NHS Pay Scale)",
    islRate: "NHS National Pay Scale Floor",
    newEntrantRate: "NHS Trainee GP Scale",
    eligibleRegions: "All 4 UK Nations (NHS England, Scotland, Wales, HSC NI)",
    govUkSource: "https://www.gov.uk/health-care-worker-visa/your-job"
  },
  {
    socCode: "2231",
    jobTitle: "Registered nurses and midwives",
    standardGoingRate: "£28,407 to £34,581 (NHS Band 5 Scale)",
    islRate: "NHS Band 5 entry point",
    newEntrantRate: "Band 5 NHS Agenda for Change",
    eligibleRegions: "UK-wide NHS Trusts & Health Boards",
    govUkSource: "https://www.gov.uk/health-care-worker-visa/your-job"
  },
  {
    socCode: "5312",
    jobTitle: "Roofers, roof tilers and slaters",
    standardGoingRate: "£31,000 (£15.90/hr)",
    islRate: "£30,960 (on ISL list)",
    newEntrantRate: "£23,200 (floor applied)",
    eligibleRegions: "UK-wide construction",
    govUkSource: "https://www.gov.uk/government/publications/skilled-worker-visa-immigration-salary-list"
  }
];

export const IMMIGRATION_SALARY_LIST_SUMMARY = [
  { code: "2111", title: "Chemical scientists (nuclear only)", concession: "20% salary discount on £38,700 general threshold (min £30,960)" },
  { code: "2112", title: "Biological scientists and biochemists", concession: "20% salary discount on £38,700 general threshold (min £30,960)" },
  { code: "2113", title: "Physical scientists", concession: "Eligible for £30,960 floor" },
  { code: "2121", title: "Civil engineers", concession: "Eligible for £31,850 floor" },
  { code: "2122", title: "Mechanical engineers", concession: "Eligible for £30,960 floor" },
  { code: "2123", title: "Electrical engineers", concession: "Eligible for £30,960 floor" },
  { code: "2124", title: "Electronics engineers", concession: "Eligible for £30,960 floor" },
  { code: "2126", title: "Design and development engineers", concession: "Eligible for £30,960 floor" },
  { code: "2127", title: "Production and process engineers", concession: "Eligible for £30,960 floor" },
  { code: "2129", title: "Engineering professionals n.e.c.", concession: "Eligible for £30,960 floor" },
  { code: "3111", title: "Laboratory technicians", concession: "Eligible for £30,960 floor" },
  { code: "5235", title: "Aircraft maintenance and related trades", concession: "Eligible for £30,960 floor" },
  { code: "5312", title: "Roofers, roof tilers and slaters", concession: "Eligible for £30,960 floor" },
  { code: "5313", title: "Bricklayers and masons", concession: "Eligible for £30,960 floor" },
  { code: "5314", title: "Carpenters and joiners", concession: "Eligible for £30,960 floor" },
  { code: "5319", title: "Construction and building trades n.e.c.", concession: "Eligible for £30,960 floor" },
  { code: "6126", title: "Boat and ship builders and repairers", concession: "Eligible for £30,960 floor" }
];

export const REGIONAL_DIRECTORY_SECTIONS = [
  {
    title: "Regional Sponsor Directory",
    dataInfo: "Approved UKVI sponsor licence records, location, address, licence rating, and eligible routes.",
    nature: "Supporting Intelligence Data (Not a Visa Category)",
    govUkUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  },
  {
    title: "Regional Salary Rules",
    dataInfo: "Occupation going rates based on 37.5-hour week, minimum thresholds (£38,700 standard / £29,000 transitional).",
    nature: "Supporting Statutory Rules (Not a Visa Category)",
    govUkUrl: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations"
  },
  {
    title: "Immigration Salary List (ISL)",
    dataInfo: "Occupations with 20% discount on the general salary threshold (min £30,960 floor). Replaces the old Shortage Occupation List (SOL).",
    nature: "Supporting Concession Rules (Not a Visa Category)",
    govUkUrl: "https://www.gov.uk/government/publications/skilled-worker-visa-immigration-salary-list"
  },
  {
    title: "Temporary Shortage List (TSL)",
    dataInfo: "Occupations under temporary review or specific transition provisions.",
    nature: "Supporting Classification (Not a Visa Category)",
    govUkUrl: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-skilled-occupations"
  },
  {
    title: "Health & Care Jobs by Region",
    dataInfo: "NHS England Trusts, NHS Scotland Health Boards, NHS Wales, and HSC Northern Ireland sponsor profiles.",
    nature: "Employer & Sector Directory (Not a Visa Category)",
    govUkUrl: "https://www.gov.uk/health-care-worker-visa"
  },
  {
    title: "Scotland Immigration & Jobs",
    dataInfo: "Scottish Enterprise clusters, NHS Scotland boards, universities, and approved Scottish sponsors.",
    nature: "Regional Information (Not a Visa Category)",
    govUkUrl: "https://www.scotland.org/live-in-scotland/visas-and-immigration"
  },
  {
    title: "Wales Immigration & Jobs",
    dataInfo: "NHS Wales Health Boards, Welsh manufacturing, creative and engineering sponsor records.",
    nature: "Regional Information (Not a Visa Category)",
    govUkUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  },
  {
    title: "Northern Ireland Immigration & Jobs",
    dataInfo: "HSC Northern Ireland Trusts, technology employers in Belfast & Derry/Londonderry.",
    nature: "Regional Information (Not a Visa Category)",
    govUkUrl: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
  },
  {
    title: "Scale-up Employers",
    dataInfo: "High-growth UK companies eligible to sponsor under the Scale-up Worker route.",
    nature: "Supporting Sponsor Directory (Not a Visa Category)",
    govUkUrl: "https://www.gov.uk/scale-up-worker-visa"
  },
  {
    title: "Seasonal Work Locations",
    dataInfo: "Horticulture and poultry production operators holding Seasonal Worker scheme operator licences.",
    nature: "Supporting Operator Directory (Not a Visa Category)",
    govUkUrl: "https://www.gov.uk/seasonal-worker-visa"
  }
];
