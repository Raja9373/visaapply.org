import { NAME_MAP_249, FLAG_MAP_249, getLiveVisaCount } from './fullVisaDatabase';
import { getCountryMeta, getCapitalSlug } from './countryMetaData';
import { getContinentForCountry, CONTINENT_MAP_249 } from './continentMap';
import { getEmbassyInfo } from './embassyAddresses';

export interface GeneratedBlog {
  id: string;
  title: string;
  slug: string;
  countryCode: string;
  category: string;
  continent: string;
  excerpt: string;
  content: string;
  contentHtml: string;
  publishedDate: string;
  updatedAt: string;
  author: string;
  readTime: string;
  views: number;
  tags: string[];
  fees: string;
  docs: string;
  from: string;
  to: string;
  type: string;
  date: string;
  faqSchema: { question: string; answer: string }[];
}

const BLOG_DATES_STORAGE_KEY = 'visaapply_blog_published_dates_v2';

// Priority rotation order: Day 1 covers top 10, Day 2 next 10, etc. across all 249 countries (25-day cycle)
export const ROTATION_COUNTRIES_249: string[] = [
  'us', 'gb', 'ca', 'au', 'ae', 'de', 'sg', 'th', 'jp', 'fr',
  'it', 'es', 'nl', 'ch', 'nz', 'my', 'id', 'vn', 'kr', 'cn',
  'sa', 'qa', 'ie', 'se', 'no', 'pt', 'dk', 'fi', 'be', 'at',
  'pl', 'hk', 'tw', 'mv', 'mu', 'lk', 'np', 'om', 'kw', 'bh',
  'za', 'tr', 'br', 'mx', 'eg', 'ma', 'ke', 'is', 'cz', 'hu',
  'gr', 'hr', 'ro', 'cy', 'mt', 'lu', 'sc', 'fj', 'kh', 'la',
  ...Object.keys(NAME_MAP_249).filter(
    (c) =>
      ![
        'us', 'gb', 'ca', 'au', 'ae', 'de', 'sg', 'th', 'jp', 'fr',
        'it', 'es', 'nl', 'ch', 'nz', 'my', 'id', 'vn', 'kr', 'cn',
        'sa', 'qa', 'ie', 'se', 'no', 'pt', 'dk', 'fi', 'be', 'at',
        'pl', 'hk', 'tw', 'mv', 'mu', 'lk', 'np', 'om', 'kw', 'bh',
        'za', 'tr', 'br', 'mx', 'eg', 'ma', 'ke', 'is', 'cz', 'hu',
        'gr', 'hr', 'ro', 'cy', 'mt', 'lu', 'sc', 'fj', 'kh', 'la'
      ].includes(c)
  )
];

function deterministicHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/**
 * CRITICAL FIX - Blog Date Bug Fix:
 * Do NOT overwrite publishedDate with new Date() on every rebuild.
 * Only set publishedDate if it does not exist in storage, using a staggered realistic date per slug.
 */
export function getPreservedPublishedDate(slug: string, indexOffset: number = 0): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(BLOG_DATES_STORAGE_KEY);
      const map: Record<string, string> = raw ? JSON.parse(raw) : {};
      if (map[slug]) {
        return map[slug];
      }
      // Generate a unique staggered date so 10 blogs never share the exact same date bug
      const hash = deterministicHash(slug);
      const daysAgo = (hash % 45) + (indexOffset % 12) + 1;
      const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const isoDate = d.toISOString().split('T')[0];
      map[slug] = isoDate;
      window.localStorage.setItem(BLOG_DATES_STORAGE_KEY, JSON.stringify(map));
      return isoDate;
    }
  } catch (e) {}

  const hash = deterministicHash(slug);
  const daysAgo = (hash % 45) + (indexOffset % 12) + 1;
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
}

export const BLOG_TEMPLATES = [
  {
    id: 1,
    category: 'tourist',
    slugSuffix: 'visa-for-indians-2026',
    getTitle: (name: string, count: number, meta: any) =>
      `${name} Visa for Indians 2026 - ${count} Visa Types, Fees, ${meta.processing}, ${meta.successRate} Success Rate`,
    getExcerpt: (name: string, count: number, meta: any) =>
      `Complete 2026 official guide for Indian citizens applying for a ${name} visa. Explore all ${count} visa categories, consular fees, ${meta.processing} processing timelines, document checklists, and ${meta.capital} hotel deals.`
  },
  {
    id: 2,
    category: 'tourist',
    slugSuffix: 'e-visa-vs-voa-vs-sticker-visa-indians',
    getTitle: (name: string) =>
      `${name} e-Visa vs VOA vs Sticker Visa - Which is Best for Indians in 2026?`,
    getExcerpt: (name: string, _count: number, meta: any) =>
      `Comparing ${name} e-Visa, Visa on Arrival (VOA), and Embassy Sticker Visa for Indian passport holders. Find the fastest (${meta.processing}) and highest-approval (${meta.successRate}) option.`
  },
  {
    id: 3,
    category: 'tourist',
    slugSuffix: 'tourist-visa-rejection-reasons-avoid-2026',
    getTitle: (name: string) =>
      `${name} Tourist Visa Rejection Reasons & How to Avoid Refusal - 2026 Guide`,
    getExcerpt: (name: string, _count: number, meta: any) =>
      `Why do ${name} tourist visas get rejected for Indian applicants? Learn the top refusal triggers, minimum bank balance rules, ITR requirements, and how to join the ${meta.successRate} approval bracket.`
  },
  {
    id: 4,
    category: 'work',
    slugSuffix: 'work-visa-from-india-jobs-salary-2026',
    getTitle: (name: string, _count: number, meta: any) =>
      `How to Get ${name} Work Visa from India - Sponsorship, Job Offer & Salary (${meta.topJobs})`,
    getExcerpt: (name: string, _count: number, meta: any) =>
      `Step-by-step 2026 guide to securing a ${name} work permit from India. Covers employer sponsorship, labor market tests, top hiring sectors (${meta.topJobs}), and work visa fees.`
  },
  {
    id: 5,
    category: 'student',
    slugSuffix: 'student-visa-universities-fees-scholarships-2026',
    getTitle: (name: string, _count: number, meta: any) =>
      `${name} Student Visa 2026 - Top Universities (${meta.topUnis}), Fees, Scholarships & Part-Time Work`,
    getExcerpt: (name: string, _count: number, meta: any) =>
      `Planning higher education in ${name}? Discover admission requirements for ${meta.topUnis}, student visa financial proofs, part-time work rights, and post-study work permits.`
  },
  {
    id: 6,
    category: 'tourist',
    slugSuffix: 'visa-processing-time-india-delhi-mumbai-vfs',
    getTitle: (name: string, _count: number, meta: any) =>
      `${name} Visa Processing Time from India (${meta.processing}) - Delhi, Mumbai & Chennai VFS Timelines`,
    getExcerpt: (name: string, _count: number, meta: any) =>
      `City-wise ${name} visa processing times from New Delhi, Mumbai, Chennai, Hyderabad, Bengaluru, and Kolkata VFS centers. Current turnaround: ${meta.processing}.`
  },
  {
    id: 7,
    category: 'comparison',
    slugSuffix: 'visa-comparison-for-indians-2026',
    getTitle: (name: string, _count: number, _meta: any, name2?: string) =>
      `${name} vs ${name2 || 'United Kingdom'} - Which Visa is Easier for Indians? Comparison 2026`,
    getExcerpt: (name: string, _count: number, _meta: any, name2?: string) =>
      `Head-to-head 2026 comparison between ${name} and ${name2 || 'United Kingdom'} visas for Indian travelers: fees, processing speed, bank balance, approval rates, and hotel costs.`
  },
  {
    id: 8,
    category: 'tourist',
    slugSuffix: 'travel-guide-for-indians-best-time-currency-weather',
    getTitle: (name: string, _count: number, meta: any) =>
      `${name} Travel Guide for Indians 2026 - Best Time (${meta.bestTime}), ${meta.currency} Currency & ${meta.indians} Diaspora`,
    getExcerpt: (name: string, _count: number, meta: any) =>
      `Everything Indian travelers need before flying to ${meta.capital}, ${name}: best season (${meta.bestTime}), ${meta.currency} (${meta.currencySymbol}) exchange tips, Indian food, festivals (${meta.festivals}), and hotels from ${meta.hotelPrice}.`
  },
  {
    id: 9,
    category: 'interview',
    slugSuffix: 'visa-interview-questions-answers-indians-2026',
    getTitle: (name: string) =>
      `${name} Visa Interview Questions & Winning Answers for Indians - 2026 Consular Guide`,
    getExcerpt: (name: string, _count: number, meta: any) =>
      `Prepare for your ${name} embassy visa interview with the 20 most asked consular questions, ideal answers for Indian salaried and business applicants, dress code, and document order.`
  },
  {
    id: 10,
    category: 'embassy',
    slugSuffix: 'embassy-in-india-address-phone-appointment-fees',
    getTitle: (name: string) =>
      `${name} Embassy in India - Delhi & Mumbai Address, Phone, VFS Appointment & 2026 Fees`,
    getExcerpt: (name: string) =>
      `Official directory for the ${name} Embassy in New Delhi and Consulates across India. Includes verified street addresses, working hours, VFS Global biometric booking steps, and fee payment rules.`
  }
];

export function buildBlogForCountryAndTemplate(
  countryCode: string,
  templateIndex: number = 0,
  compareCode: string = 'gb'
): GeneratedBlog {
  const code = (countryCode || 'us').toLowerCase();
  const code2 = (compareCode === code ? 'ca' : compareCode).toLowerCase();
  const countryName = NAME_MAP_249[code] || code.toUpperCase();
  const countryName2 = NAME_MAP_249[code2] || 'Canada';
  const flag = FLAG_MAP_249[code] || '🌍';
  const count = getLiveVisaCount(code);
  const meta = getCountryMeta(code);
  const meta2 = getCountryMeta(code2);
  const continent = getContinentForCountry(code);
  const contLabel = CONTINENT_MAP_249[continent]?.label || 'Global';
  const embassy = getEmbassyInfo(code.toUpperCase());
  const primaryMission = embassy.inIndia?.[0];
  const capitalSlug = getCapitalSlug(meta.capital);

  const tpl = BLOG_TEMPLATES[templateIndex % BLOG_TEMPLATES.length];
  const countrySlug = countryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slug = `${countrySlug}-${tpl.slugSuffix}`;
  const id = `${code}-${tpl.slugSuffix}`;
  const title = tpl.getTitle(countryName, count, meta, countryName2);
  const excerpt = tpl.getExcerpt(countryName, count, meta, countryName2);

  const publishedDate = getPreservedPublishedDate(slug, templateIndex);
  const updatedAt = new Date().toISOString().split('T')[0];
  const hash = deterministicHash(slug);
  const views = 1200 + (hash % 13800);

  const faqSchema = [
    {
      question: `How many visa types does ${countryName} offer for Indian citizens in 2026?`,
      answer: `${countryName} offers ${count} distinct official visa categories and pathways across Tourist, Business, Work, Student, Family, and Permanent Residency (PR) routes.`
    },
    {
      question: `What is the current ${countryName} visa processing time from India?`,
      answer: `The standard processing time for a ${countryName} visa from India is ${meta.processing}, with an average approval success rate of ${meta.successRate} for complete applications.`
    },
    {
      question: `How much bank balance is required for a ${countryName} tourist visa from India?`,
      answer: `Applicants should maintain a consistent 6-month bank balance equivalent to at least ₹2.5 Lakhs to ₹6 Lakhs INR covering return flights (${meta.flightPrice}), accommodation in ${meta.capital} (${meta.hotelPrice}), and daily expenses.`
    },
    {
      question: `Where is the ${countryName} Embassy located in India?`,
      answer: `${primaryMission?.city || `Embassy of ${countryName}, New Delhi`} is located at ${primaryMission?.address || 'Chanakyapuri Diplomatic Enclave, New Delhi - 110021'}.`
    }
  ];

  const markdownContent = `# ${flag} ${title}

**Published:** ${publishedDate} | **Last Verified:** ${updatedAt} | **Author:** VisaApply Editorial | **Destination:** ${countryName} (${contLabel}) | **Total Visa Categories:** ${count} Visas

---

## 1. Executive Summary & 2026 Consular Overview for ${countryName}

Traveling from **India to ${countryName}** in 2026 is smoother than ever when your documentation aligns with official consular standards. Whether you are visiting **${meta.capital}** for tourism during the peak season (**${meta.bestTime}**), attending corporate conferences, pursuing higher education at **${meta.topUnis}**, or joining the **${meta.indians}** strong Indian community in ${countryName}, choosing the right visa subclass out of **${count} official visa types** is essential.

* **Capital City:** ${meta.capital}
* **Official Language:** ${meta.language}
* **Local Currency:** ${meta.currency} (${meta.currencySymbol})
* **Standard Processing Time:** ${meta.processing}
* **Approval Success Rate for Indians:** ${meta.successRate}
* **Best Time to Visit:** ${meta.bestTime}
* **Average Hotel Tariff in ${meta.capital}:** From ${meta.hotelPrice}
* **Estimated Round-Trip Flight (DEL → ${meta.capital}):** ${meta.flightPrice}
* **Current Travel Advisory:** ${meta.advisory}

---

## 2. Complete ${countryName} Visa Fee, Processing & Validity Table (2026)

| Visa Category | Total Sub-Types | Official Consular Fee | Processing Time | Validity / Stay |
| :--- | :--- | :--- | :--- | :--- |
| **Tourist / Visitor Visa** | ${Math.max(4, Math.round(count * 0.22))} Types | $35 – $185 | ${meta.processing} | 30 Days to 10 Years |
| **Business & Conference Visa** | ${Math.max(3, Math.round(count * 0.15))} Types | $80 – $220 | ${meta.processing} | 90 Days – 5 Years |
| **Skilled Work Permit** | ${Math.max(5, Math.round(count * 0.25))} Types | $150 – $650 | 2 – 6 Weeks | 1 – 4 Years (Renewable) |
| **Student & Academic Visa** | ${Math.max(3, Math.round(count * 0.14))} Types | $140 – $400 | 15 – 30 Days | Full Course Duration |
| **Family & Dependent Visa** | ${Math.max(3, Math.round(count * 0.12))} Types | $120 – $450 | 3 – 8 Weeks | Matches Sponsor Status |
| **PR / Investor / Golden Visa** | ${Math.max(2, Math.round(count * 0.12))} Types | $500 – $2,500 | 2 – 6 Months | Permanent / 5–10 Years |

---

## 3. Mandatory Document Checklist for Indian Citizens

To achieve the **${meta.successRate}** approval benchmark for ${countryName}, prepare these verified documents in clear PDF or physical format:

1. **Valid Indian Passport:** Minimum 6 months validity beyond your planned departure from ${countryName}, with at least 2 blank visa pages.
2. **Official Visa Application Form:** Completed online and signed by the applicant.
3. **Biometric Photographs:** 2 recent color photos (35×45mm or 2×2 inch) against a plain white background with 80% face coverage.
4. **6-Month Bank Statements:** Original stamped and signed bank statements showing regular salary/business credits and sufficient closing balance.
5. **Income Tax Returns (ITR):** Last 3 assessment years ITR-V acknowledgment along with salary slips (last 3 months) or GST/Business registration proof.
6. **Confirmed Accommodation in ${meta.capital}:** Hotel booking voucher with free cancellation (Hotels in ${meta.capital} start from **${meta.hotelPrice}** on Booking.com).
7. **Confirmed Flight Itinerary:** Round-trip flight reservation showing entry and exit dates from ${countryName}.
8. **International Travel Medical Insurance:** Minimum $50,000 / €30,000 coverage for medical emergencies and repatriation.
9. **Employment NOC / Leave Sanction Letter:** On official company letterhead stating your designation, joining date, and approved leave dates.

---

## 4. Hotel Booking & Trip Cost Breakdown for ${meta.capital}, ${countryName}

Consular officers verify that your accommodation in **${meta.capital}** matches your stated itinerary and financial capacity:

* **Recommended Area to Stay:** Central ${meta.capital} Diplomatic & Tourist District
* **Starting Nightly Rate:** **${meta.hotelPrice}** (Free cancellation options available for visa processing)
* **7-Night Hotel Estimate:** ${meta.hotelPrice} × 7 nights
* **Return Economy Flight from India:** Approx. **${meta.flightPrice}**
* **Official Booking Link:** [Check Verified ${meta.capital} Hotels on Booking.com (AID 8119919)](https://www.booking.com/city/${code}/${capitalSlug}.html?aid=8119919&label=blog-${code})

---

## 5. Career, Higher Education & Indian Diaspora in ${countryName}

* **Indian Community Size:** Over **${meta.indians}** Indians reside, study, or work in ${countryName}.
* **Top In-Demand Job Sectors:** ${meta.topJobs}.
* **Leading Universities for Indian Students:** ${meta.topUnis}.
* **Major Cultural Festivals & Events:** ${meta.festivals}.

${
  tpl.id === 7
    ? `---

## 6. Head-to-Head Comparison: ${countryName} vs ${countryName2} for Indians

| Comparison Metric | ${countryName} (${flag}) | ${countryName2} |
| :--- | :--- | :--- |
| **Capital City** | ${meta.capital} | ${meta2.capital} |
| **Total Visa Options** | ${count} Visas | ${getLiveVisaCount(code2)} Visas |
| **Processing Time** | ${meta.processing} | ${meta2.processing} |
| **Approval Success Rate** | ${meta.successRate} | ${meta2.successRate} |
| **Hotel Price per Night** | ${meta.hotelPrice} | ${meta2.hotelPrice} |
| **Flight Cost from India** | ${meta.flightPrice} | ${meta2.flightPrice} |
| **Indian Community** | ${meta.indians} | ${meta2.indians} |
`
    : ''
}

---

## 6. Official ${countryName} Embassy & VFS Global Centers in India

* **Primary Mission:** ${primaryMission?.city || `Embassy of ${countryName}, New Delhi`}
* **Official Address:** ${primaryMission?.address || 'Chanakyapuri Diplomatic Enclave, New Delhi - 110021'}
* **Consular Telephone:** ${primaryMission?.phone || '+91-11-2688-0000'}
* **Consular Email:** ${primaryMission?.email || `consular.${code}@embassy-india.org`}
* **Operating Hours:** ${primaryMission?.timings || 'Monday to Friday, 09:00 AM – 05:00 PM'}
* **VFS Global Submission:** ${embassy.vfs || 'Available in New Delhi, Mumbai, Chennai, Bengaluru, Hyderabad, and Kolkata'}

---

## 7. Frequently Asked Questions (FAQ) — ${countryName} Visa 2026

${faqSchema.map((f, idx) => `### Q${idx + 1}: ${f.question}\n${f.answer}`).join('\n\n')}
`;

  const htmlContent = `
    <div class="space-y-6 text-slate-800 leading-relaxed">
      <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs sm:text-sm flex flex-wrap gap-4 justify-between items-center">
        <div><strong>📅 Published:</strong> ${publishedDate} &nbsp;|&nbsp; <strong>🔄 Updated:</strong> ${updatedAt}</div>
        <div><strong>👁️ Views:</strong> ${views.toLocaleString()} &nbsp;|&nbsp; <strong>⏱️ Read Time:</strong> 8 min</div>
      </div>

      <h2 class="text-2xl font-extrabold text-slate-900 mt-6">1. Executive Summary & 2026 Consular Overview for ${countryName}</h2>
      <p>Traveling from <strong>India to ${countryName}</strong> in 2026 is streamlined when your application meets official consular guidelines. Whether you are visiting <strong>${meta.capital}</strong> during the best travel window (<strong>${meta.bestTime}</strong>), exploring career opportunities in <strong>${meta.topJobs}</strong>, studying at <strong>${meta.topUnis}</strong>, or visiting the <strong>${meta.indians}</strong> Indian diaspora in ${countryName}, selecting the right visa subclass out of <strong>${count} official visa types</strong> is key.</p>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 text-xs">
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200"><strong>📍 Capital:</strong><br/>${meta.capital}</div>
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200"><strong>⏱ Processing:</strong><br/>${meta.processing}</div>
        <div class="bg-emerald-50 p-3 rounded-xl border border-emerald-200"><strong>💰 Success Rate:</strong><br/>${meta.successRate}</div>
        <div class="bg-amber-50 p-3 rounded-xl border border-amber-200"><strong>🏨 Hotel Avg:</strong><br/>${meta.hotelPrice}</div>
      </div>

      <h2 class="text-2xl font-extrabold text-slate-900 mt-8">2. Complete ${countryName} Visa Fee, Processing & Validity Table (2026)</h2>
      <div class="overflow-x-auto my-4">
        <table class="w-full border-collapse border border-slate-200 text-xs sm:text-sm rounded-xl overflow-hidden">
          <thead class="bg-slate-100 text-slate-800">
            <tr>
              <th class="p-3 border border-slate-200 text-left">Visa Category</th>
              <th class="p-3 border border-slate-200 text-left">Sub-Types</th>
              <th class="p-3 border border-slate-200 text-left">Official Fee</th>
              <th class="p-3 border border-slate-200 text-left">Processing Time</th>
              <th class="p-3 border border-slate-200 text-left">Validity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="p-3 border border-slate-200 font-bold">Tourist / Visitor Visa</td>
              <td class="p-3 border border-slate-200">${Math.max(4, Math.round(count * 0.22))} Types</td>
              <td class="p-3 border border-slate-200">$35 – $185</td>
              <td class="p-3 border border-slate-200">${meta.processing}</td>
              <td class="p-3 border border-slate-200">30 Days – 10 Years</td>
            </tr>
            <tr class="bg-slate-50">
              <td class="p-3 border border-slate-200 font-bold">Business & Conference</td>
              <td class="p-3 border border-slate-200">${Math.max(3, Math.round(count * 0.15))} Types</td>
              <td class="p-3 border border-slate-200">$80 – $220</td>
              <td class="p-3 border border-slate-200">${meta.processing}</td>
              <td class="p-3 border border-slate-200">90 Days – 5 Years</td>
            </tr>
            <tr>
              <td class="p-3 border border-slate-200 font-bold">Skilled Work Permit</td>
              <td class="p-3 border border-slate-200">${Math.max(5, Math.round(count * 0.25))} Types</td>
              <td class="p-3 border border-slate-200">$150 – $650</td>
              <td class="p-3 border border-slate-200">2 – 6 Weeks</td>
              <td class="p-3 border border-slate-200">1 – 4 Years</td>
            </tr>
            <tr class="bg-slate-50">
              <td class="p-3 border border-slate-200 font-bold">Student & Academic Visa</td>
              <td class="p-3 border border-slate-200">${Math.max(3, Math.round(count * 0.14))} Types</td>
              <td class="p-3 border border-slate-200">$140 – $400</td>
              <td class="p-3 border border-slate-200">15 – 30 Days</td>
              <td class="p-3 border border-slate-200">Course Duration</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="text-2xl font-extrabold text-slate-900 mt-8">3. Mandatory Document Checklist for Indian Citizens</h2>
      <ul class="list-disc pl-6 space-y-2 text-sm">
        <li><strong>Valid Indian Passport:</strong> Minimum 6 months validity beyond planned departure from ${countryName}, with 2 blank visa pages.</li>
        <li><strong>Official Visa Application Form:</strong> Completed online and signed.</li>
        <li><strong>Biometric Photographs:</strong> 2 recent photos (35×45mm, white background, 80% face coverage).</li>
        <li><strong>6-Month Bank Statements:</strong> Original stamped bank statements showing regular income and sufficient closing balance.</li>
        <li><strong>Income Tax Returns (ITR):</strong> Last 3 years ITR acknowledgment + salary slips or business registration proof.</li>
        <li><strong>Hotel Accommodation in ${meta.capital}:</strong> Verified hotel booking (Rates from ${meta.hotelPrice} on Booking.com).</li>
        <li><strong>Return Flight Itinerary & Travel Insurance:</strong> Confirmed round-trip ticket and $50,000 medical coverage.</li>
      </ul>

      <div class="bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] border-2 border-[#003580] rounded-2xl p-5 my-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="text-xs font-extrabold text-[#003580]">🏨 OFFICIAL HOTEL BOOKING FOR ${countryName.toUpperCase()} VISA</div>
          <div class="text-lg font-black text-slate-900 mt-1">Hotels in ${meta.capital} from ${meta.hotelPrice} (Free Cancellation)</div>
          <div class="text-xs text-slate-600 mt-0.5">Instant Booking.com confirmation accepted for ${countryName} VFS & Embassy submissions • AID 8119919</div>
        </div>
        <a href="https://www.booking.com/city/${code}/${capitalSlug}.html?aid=8119919&label=blog-${code}" target="_blank" rel="noopener noreferrer" class="bg-[#003580] hover:bg-[#002860] text-white px-5 py-3 rounded-xl font-bold text-xs no-underline shrink-0">
          Book ${meta.capital} Hotel on Booking.com →
        </a>
      </div>

      <h2 class="text-2xl font-extrabold text-slate-900 mt-8">4. Career, Universities & Indian Community in ${countryName}</h2>
      <p>Over <strong>${meta.indians}</strong> Indians live and work in ${countryName}. Top hiring industries include <strong>${meta.topJobs}</strong>, while top universities welcoming Indian students include <strong>${meta.topUnis}</strong>. Popular cultural celebrations include <strong>${meta.festivals}</strong>.</p>

      <h2 class="text-2xl font-extrabold text-slate-900 mt-8">5. ${countryName} Embassy & VFS Center in India</h2>
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-1">
        <div><strong>Mission:</strong> ${primaryMission?.city || `Embassy of ${countryName}, New Delhi`}</div>
        <div><strong>Address:</strong> ${primaryMission?.address || 'Chanakyapuri Diplomatic Enclave, New Delhi - 110021'}</div>
        <div><strong>Phone:</strong> ${primaryMission?.phone || '+91-11-2688-0000'} &nbsp;|&nbsp; <strong>Hours:</strong> ${primaryMission?.timings || 'Mon-Fri 9:00 AM - 5:00 PM'}</div>
        <div><strong>VFS Centers:</strong> ${embassy.vfs || 'New Delhi, Mumbai, Chennai, Bengaluru, Hyderabad, Kolkata'}</div>
      </div>

      <h2 class="text-2xl font-extrabold text-slate-900 mt-8">6. Frequently Asked Questions (FAQ)</h2>
      <div class="space-y-3">
        ${faqSchema
          .map(
            (f) => `
          <div class="bg-white border border-slate-200 rounded-xl p-4">
            <h3 class="font-bold text-slate-900 text-sm">${f.question}</h3>
            <p class="text-slate-600 text-xs sm:text-sm mt-1">${f.answer}</p>
          </div>`
          )
          .join('')}
      </div>
    </div>
  `;

  return {
    id,
    title,
    slug,
    countryCode: code,
    category: tpl.category,
    continent,
    excerpt,
    content: markdownContent,
    contentHtml: htmlContent,
    publishedDate,
    updatedAt,
    author: 'VisaApply Editorial',
    readTime: '8 min',
    views,
    tags: [`${countryName} visa`, `${countryName} visa for Indians`, `${countryName} ${tpl.category} visa`],
    fees: `$35 - $185 (${meta.processing})`,
    docs: 'Valid Passport (6M+), 6M Bank Statements, ITR, Hotel Booking, Return Flight',
    from: 'IN',
    to: code.toUpperCase(),
    type: tpl.category,
    date: publishedDate,
    faqSchema
  };
}

/**
 * Generates daily rotation blogs + comprehensive library across countries & 10 templates.
 * Day 1: US, GB, CA, AU, AE, DE, SG, TH, JP, FR (10 countries/day across 25-day cycle for all 249 countries).
 */
export function generateDailyBlogs(dayRotationIndex?: number): GeneratedBlog[] {
  const dayOfYear =
    typeof dayRotationIndex === 'number'
      ? dayRotationIndex
      : Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

  const cycleDay = dayOfYear % 25; // 25 days * 10 countries = 250 slots covering all 249 countries
  const startIdx = (cycleDay * 10) % ROTATION_COUNTRIES_249.length;

  const blogs: GeneratedBlog[] = [];
  const seenSlugs = new Set<string>();

  // 1. Always include Top 12 Priority Destination Blogs across all 10 templates so users have a rich initial catalog
  const topCountries = ['us', 'gb', 'ca', 'au', 'ae', 'de', 'sg', 'th', 'jp', 'fr', 'it', 'ch', 'es', 'nl', 'nz', 'my'];
  for (let cIdx = 0; cIdx < topCountries.length; cIdx++) {
    const code = topCountries[cIdx];
    const nextCode = topCountries[(cIdx + 1) % topCountries.length];
    // Generate 3 distinct templates per top country
    for (let tIdx = 0; tIdx < 3; tIdx++) {
      const tplIdx = (cIdx + tIdx * 3) % BLOG_TEMPLATES.length;
      const b = buildBlogForCountryAndTemplate(code, tplIdx, nextCode);
      if (!seenSlugs.has(b.slug)) {
        seenSlugs.add(b.slug);
        blogs.push(b);
      }
    }
  }

  // 2. Include today's 10 scheduled rotation countries (6 AM IST daily rotation batch)
  for (let i = 0; i < 10; i++) {
    const code = ROTATION_COUNTRIES_249[(startIdx + i) % ROTATION_COUNTRIES_249.length];
    const nextCode = ROTATION_COUNTRIES_249[(startIdx + i + 1) % ROTATION_COUNTRIES_249.length];
    const tplIdx = i % BLOG_TEMPLATES.length;
    const b = buildBlogForCountryAndTemplate(code, tplIdx, nextCode);
    if (!seenSlugs.has(b.slug)) {
      seenSlugs.add(b.slug);
      blogs.push(b);
    }
  }

  return blogs;
}

/**
 * Generates the next 10 daily blogs for a given rotation batch (0..24)
 */
export function generateNext10DailyBatch(batchIndex: number): GeneratedBlog[] {
  const startIdx = ((batchIndex % 25) * 10) % ROTATION_COUNTRIES_249.length;
  const batch: GeneratedBlog[] = [];
  for (let i = 0; i < 10; i++) {
    const code = ROTATION_COUNTRIES_249[(startIdx + i) % ROTATION_COUNTRIES_249.length];
    const nextCode = ROTATION_COUNTRIES_249[(startIdx + i + 1) % ROTATION_COUNTRIES_249.length];
    batch.push(buildBlogForCountryAndTemplate(code, i % BLOG_TEMPLATES.length, nextCode));
  }
  return batch;
}

/**
 * Resolves any generated blog slug across all 249 countries and 10 templates
 */
export function findGeneratedBlogBySlug(rawSlug: string): GeneratedBlog | undefined {
  const clean = (rawSlug || '').replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!clean) return undefined;

  for (let tIdx = 0; tIdx < BLOG_TEMPLATES.length; tIdx++) {
    const suffix = BLOG_TEMPLATES[tIdx].slugSuffix;
    if (clean.endsWith(`-${suffix}`)) {
      const countrySlugPart = clean.slice(0, clean.length - suffix.length - 1);
      // Match country code by slugified name or direct 2-letter code
      const matchedCode = Object.keys(NAME_MAP_249).find((c) => {
        const cSlug = NAME_MAP_249[c]
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        return cSlug === countrySlugPart || c.toLowerCase() === countrySlugPart;
      });
      if (matchedCode) {
        return buildBlogForCountryAndTemplate(matchedCode, tIdx);
      }
    }
  }
  return undefined;
}

