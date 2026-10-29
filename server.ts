import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { marked } from 'marked';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const CONTENT_DIR = path.join(__dirname, 'content');
const DRAFTS_DIR = path.join(__dirname, 'content/drafts');

// Ensure directories exist
if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
if (!fs.existsSync(DRAFTS_DIR)) fs.mkdirSync(DRAFTS_DIR, { recursive: true });

// Initialize AI client if key exists
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// 30 Countries list
export const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'SCH', name: 'Schengen Area', flag: '🇪🇺' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' }
];

export const VISA_TYPES = [
  { id: 'tourist', name: 'Tourist / Visitor', icon: 'Plane', desc: 'Tourism, sightseeing, and short family visits.' },
  { id: 'work', name: 'Work Visa', icon: 'Briefcase', desc: 'Employment, skilled worker, and temporary contracts.' },
  { id: 'student', name: 'Student Visa', icon: 'GraduationCap', desc: 'Degree programs, language courses, and higher education.' },
  { id: 'family', name: 'Family Reunion', icon: 'Users', desc: 'Spouse, dependent children, and family sponsorship.' },
  { id: 'business', name: 'Business Visa', icon: 'Building2', desc: 'Conferences, meetings, and commercial negotiations.' },
  { id: 'pr', name: 'PR / Golden Visa', icon: 'Award', desc: 'Permanent residency, investor visas, and citizenship paths.' }
];

// Seed initial markdown articles if none exist
function seedInitialArticles() {
  const existing = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  if (existing.length === 0) {
    const sampleArticles = [
      {
        slug: 'in-to-ca-tourist',
        frontmatter: {
          title: 'India to Canada Tourist Visa Guide (Visitor Visa)',
          from: 'IN',
          to: 'CA',
          type: 'tourist',
          date: new Date().toISOString().split('T')[0],
          fees: 'CAD $100 + CAD $85 Biometrics',
          docs: 'Valid Passport, Bank Statements ($10,000+ CAD), Return Flight Itinerary, Travel Insurance, Cover Letter'
        },
        content: `# India to Canada Tourist Visa (Visitor Visa) Complete Guide

Planning a trip from India to Canada? This comprehensive guide covers everything you need to successfully apply for a Canadian Visitor Visa (Temporary Resident Visa - TRV).

## 1. Overview & Eligibility
Citizens of India holding an ordinary passport require a TRV to enter Canada for tourism, visiting family, or short business trips. You must prove you will leave Canada at the end of your authorized stay.

## 2. Official Visa Fees
* **Application Processing Fee:** CAD $100 per person
* **Biometric Fee:** CAD $85 per person (mandatory for applicants aged 14-79)
* **Total Estimated Cost:** CAD $185 (~₹11,500 INR)

## 3. Required Document Checklist
1. **Valid Passport:** Must be valid for at least 6 months beyond your planned departure from Canada.
2. **Proof of Financial Support:** Recent bank statements for the last 4-6 months showing at least CAD $10,000 (~₹6 Lakhs INR) for personal maintenance.
3. **Travel Itinerary:** Flight reservations, hotel bookings, and a detailed day-by-day travel plan.
4. **Employment / Ties to Home Country:** Leave sanction letter, salary slips (last 3 months), tax returns (ITR for past 2 years), and business ownership proof if self-employed.
5. **Cover Letter:** Explaining the purpose of your visit and your itinerary.
6. **Medical & Police Clearance:** If requested by the visa officer.

## 4. Application Process (Step-by-Step)
1. **Create an IRCC Account:** Register online on the official Government of Canada Immigration portal.
2. **Complete Application Forms:** Fill out IMM 5257 and supporting questionnaires.
3. **Upload Documents:** Scan and upload all required PDFs (passport, financials, itinerary).
4. **Pay Fees Online:** Pay CAD $185 securely via credit card.
5. **Biometric Appointment:** Book and attend your biometrics collection at the nearest VFS Global center in India (New Delhi, Mumbai, Bengaluru, Chennai, etc.).
6. **Passport Submission:** Once approved, submit your physical passport for visa stamping.

## 5. Processing Times
Average processing time for Indian applicants ranges between **30 to 60 days**. Apply at least 3 months prior to your intended travel date.

## 6. Frequently Asked Questions (FAQ)
* **Can I work in Canada on a visitor visa?** No, unauthorized employment is strictly prohibited.
* **Can I extend my stay while in Canada?** Yes, you can apply for a visitor record extension at least 30 days before your status expires.`
      },
      {
        slug: 'us-to-uk-tourist',
        frontmatter: {
          title: 'United States to United Kingdom Standard Visitor Visa',
          from: 'US',
          to: 'UK',
          type: 'tourist',
          date: new Date().toISOString().split('T')[0],
          fees: '£115 (Standard 6 Months)',
          docs: 'Valid US Passport, Proof of Employment/Funds, Travel Itinerary'
        },
        content: `# US to UK Standard Visitor Visa Guide

Traveling from the United States to the United Kingdom? US passport holders do not require a pre-arrival visa for tourist visits under 6 months, but green card holders and other nationalities residing in the US may require a Standard Visitor Visa.

## 1. Visa Fees & Options
* **6-Month Standard Visitor:** £115
* **2-Year Long-Term Visitor:** £400
* **5-Year Long-Term Visitor:** £771
* **10-Year Long-Term Visitor:** £963

## 2. Required Documents
* Valid Passport or US Green Card / US Visa stamp
* Proof of funds (bank statements)
* Accommodation and flight booking details
* Employer letter confirming leave of absence

## 3. Step-by-Step Application Process
1. Apply online via GOV.UK.
2. Pay visa fee and healthcare surcharge (if applicable).
3. Book biometrics appointment at a US CISAC or VFS center.
4. Mail or submit passport for vignette sticker.`
      }
    ];

    sampleArticles.forEach(art => {
      const filePath = path.join(CONTENT_DIR, `${art.slug}.md`);
      const fileContent = `---\ntitle: "${art.frontmatter.title}"\nfrom: "${art.frontmatter.from}"\nto: "${art.frontmatter.to}"\ntype: "${art.frontmatter.type}"\ndate: "${art.frontmatter.date}"\nfees: "${art.frontmatter.fees}"\ndocs: "${art.frontmatter.docs}"\n---\n\n${art.content}`;
      fs.writeFileSync(filePath, fileContent);
    });
  }
}

seedInitialArticles();

// API Routes

// Detect User Geo
app.get('/api/geo', (req, res) => {
  const ipCountry = req.headers['x-vercel-ip-country'] as string || req.query.country as string || 'IN';
  const found = COUNTRIES.find(c => c.code.toLowerCase() === ipCountry.toLowerCase()) || COUNTRIES[10]; // Default India
  res.json({ country: found });
});

// Get Countries list
app.get('/api/countries', (req, res) => {
  res.json(COUNTRIES);
});

// Get Visa Types list
app.get('/api/visa-types', (req, res) => {
  res.json(VISA_TYPES);
});

// Get all published articles
app.get('/api/articles', (req, res) => {
  try {
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    const articles = files.map(file => {
      const filePath = path.join(CONTENT_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(raw);
      const slug = file.replace('.md', '');
      return {
        slug,
        ...parsed.data,
        excerpt: parsed.content.substring(0, 160).replace(/[#*`]/g, '') + '...'
      };
    });
    res.json(articles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single article by slug
app.get('/api/articles/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const filePath = path.join(CONTENT_DIR, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Article not found' });
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(raw);
    const htmlContent = marked.parse(parsed.content);
    res.json({
      slug,
      ...parsed.data,
      contentHtml: htmlContent,
      rawContent: parsed.content
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin', (req, res) => {
  const { password } = req.body || {};
  const adminPass = process.env.ADMIN_PASSWORD || 'Alokms98';
  if (password === adminPass) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Wrong password' });
  }
});

// Admin: Auth check
app.post('/api/admin/auth', (req, res) => {
  const { password } = req.body;
  const adminPass = process.env.ADMIN_PASSWORD || 'Alokms98';
  if (password === adminPass) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Wrong password' });
  }
});

// Guides endpoint for local dev
app.get('/api/guides', (req, res) => {
  try {
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    const published = files.map(file => {
      const filePath = path.join(CONTENT_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(raw);
      const slug = file.replace('.md', '');
      return {
        slug,
        ...parsed.data,
        excerpt: parsed.content.substring(0, 160).replace(/[#*`]/g, '') + '...'
      };
    });
    res.json({ published, drafts: [], total: published.length });
  } catch (err: any) {
    res.json({ published: [], drafts: [], total: 0 });
  }
});

// Drafts endpoint for local dev
app.get('/api/drafts', (req, res) => {
  try {
    const files = fs.readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.md'));
    const drafts = files.map(file => {
      const filePath = path.join(DRAFTS_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(raw);
      const slug = file.replace('.md', '');
      return {
        slug,
        ...parsed.data,
        content: parsed.content
      };
    });
    res.json({ drafts });
  } catch (err: any) {
    res.json({ drafts: [] });
  }
});

// Admin: Get Drafts
app.get('/api/admin/drafts', (req, res) => {
  try {
    const files = fs.readdirSync(DRAFTS_DIR).filter(f => f.endsWith('.md'));
    const drafts = files.map(file => {
      const filePath = path.join(DRAFTS_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(raw);
      const slug = file.replace('.md', '');
      return {
        slug,
        ...parsed.data,
        content: parsed.content
      };
    });
    res.json(drafts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Approve Draft
app.post('/api/admin/approve', (req, res) => {
  try {
    const { slug } = req.body;
    const draftPath = path.join(DRAFTS_DIR, `${slug}.md`);
    const contentPath = path.join(CONTENT_DIR, `${slug}.md`);

    if (!fs.existsSync(draftPath)) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const data = fs.readFileSync(draftPath, 'utf-8');
    fs.writeFileSync(contentPath, data);
    fs.unlinkSync(draftPath);

    res.json({ success: true, message: `Draft ${slug} approved and published.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete Draft
app.delete('/api/admin/drafts/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const draftPath = path.join(DRAFTS_DIR, `${slug}.md`);
    if (fs.existsSync(draftPath)) {
      fs.unlinkSync(draftPath);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cron Route for Vercel Cron & Manual Trigger
app.post('/api/cron', async (req, res) => {
  try {
    // Pick 1 country in rotation based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const targetCountry = COUNTRIES[dayOfYear % COUNTRIES.length];
    // Pick a source country (e.g. India or USA as default sender, or rotate)
    const sourceCountry = COUNTRIES[(dayOfYear + 5) % COUNTRIES.length];

    if (targetCountry.code === sourceCountry.code) {
      return res.json({ success: true, message: 'Skipped self-destination' });
    }

    const generatedSlugs = [];

    // Generate articles for 5 visa types using Gemini API
    for (const vType of VISA_TYPES) {
      const slug = `${sourceCountry.code.toLowerCase()}-to-${targetCountry.code.toLowerCase()}-${vType.id}`;
      const draftPath = path.join(DRAFTS_DIR, `${slug}.md`);
      const contentPath = path.join(CONTENT_DIR, `${slug}.md`);

      if (fs.existsSync(draftPath) || fs.existsSync(contentPath)) {
        continue; // Already exists
      }

      const prompt = `Write a comprehensive, professional 900-word SEO visa guide article for citizens of ${sourceCountry.name} applying for a ${vType.name} visa to ${targetCountry.name}. 
Include clear sections:
1. Overview & Eligibility
2. Official Visa Fees
3. Required Document Checklist
4. Application Process (Step-by-Step)
5. Processing Times & Validity
6. Frequently Asked Questions (FAQ)
Language: Simple, official English. 
Format: Markdown with clean headings.`;

      let articleText = `# ${sourceCountry.name} to ${targetCountry.name} ${vType.name} Guide\n\n## 1. Overview\nComprehensive guide for ${sourceCountry.name} citizens.\n\n## 2. Fees\nStandard government processing fees apply.\n\n## 3. Documents\nPassport, bank statements, photos.`;
      
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });
        if (response.text) {
          articleText = response.text;
        }
      } catch (aiErr) {
        console.error('Gemini API generation error in cron:', aiErr);
      }

      const frontmatter = `---
title: "${sourceCountry.name} to ${targetCountry.name} ${vType.name} Visa Guide"
from: "${sourceCountry.code}"
to: "${targetCountry.code}"
type: "${vType.id}"
date: "${new Date().toISOString().split('T')[0]}"
fees: "Standard Official Fees"
docs: "Passport, Financial Proofs, Application Forms"
---

`;

      fs.writeFileSync(draftPath, frontmatter + articleText);
      generatedSlugs.push(slug);
    }

    res.json({
      success: true,
      message: `Cron executed successfully for target country ${targetCountry.name}. Generated ${generatedSlugs.length} drafts.`,
      generatedSlugs
    });
  } catch (err: any) {
    console.error('Cron error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Dynamic Sitemap XML
app.get('/api/sitemap.xml', (req, res) => {
  try {
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    const baseUrl = process.env.APP_URL || 'https://visaapply.org';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/admin</loc><changefreq>weekly</changefreq><priority>0.3</priority></url>\n`;

    files.forEach(file => {
      const slug = file.replace('.md', '');
      xml += `  <url><loc>${baseUrl}/${slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    });

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Vite middleware for development
import { createServer as createViteServer } from 'vite';
const vite = await createViteServer({
  server: { middlewareMode: true }
});
app.use(vite.middlewares);

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`VisaApply.org running on http://localhost:${PORT}`);
});
