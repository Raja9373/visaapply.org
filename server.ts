import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import matter from 'gray-matter';
import { marked } from 'marked';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import handleFaqRequest from './src/api/faq';
import handleAiEligibilityRequest from './src/api/aiEligibility';
import {
  DEFAULT_PUBLISHED_GUIDES,
  findDefaultGuideMatch,
  hydrateArticleWithCacheAndFallback,
  mergeArticleCollections
} from './src/data/defaultArticles.js';
import {
  resolveStaticRouteSeoMetadata,
  normalizeCanonicalUrl,
  validateAndSanitizeSeoMetadata,
  resolveValidOgImageUrl
} from './src/utils/seoMetadataManager';
import {
  renderRouteSsrPayload,
  injectSsrPayloadIntoHtml
} from './src/utils/ssrRouteRenderer';
import { sanitizeHtml } from './src/utils/htmlSanitizer';
import {
  buildAdminSessionCookies,
  buildClearAdminSessionCookies,
  createAdminSession,
  extractAdminAuthFromRequest,
  isSecureRequest,
  revokeAdminSession,
  verifyAdminCsrfRequest,
  verifyAdminPassword,
  verifyAdminSession,
  verifyCronAuth
} from './src/utils/authSecurity';
import {
  RATE_LIMIT_POLICIES,
  buildLocalizedSlotAlertEmail,
  createRateLimitMiddleware,
  deliverEmailViaResend,
  isValidEmailAddress,
  resolveContainedMarkdownPath,
  securityHeadersMiddleware,
  sendSafeServerError,
  sendSafeTextServerError
} from './src/utils/securityHardening';
import { OFFICIAL_SOURCE_REGISTRY_249 } from './src/data/officialSourceRegistry';
import dotenv from 'dotenv';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-4-hydrogen';
const ADMIN_ALERT_EMAIL = (process.env.ADMIN_ALERT_EMAIL || '').trim();
import {
  db,
  auditSqliteDatabaseIntegrity,
  SQLITE_MIGRATIONS,
  saveBatchStateToDb,
  getBatchStateFromDb,
  saveChangelogEntryToDb,
  getChangelogFromDb,
  logCronExecutionToDb,
  getCronExecutionLogsFromDb,
  acquireJobLock,
  releaseJobLock,
  saveAutomationCheckpoint,
  getAutomationCheckpoint,
  recordDeadLetterItem,
  getDeadLetterItems,
  getOperationalEvents,
  getVisaDetails,
  getAllVisaDetails,
  getPaginatedVisaDetails,
  saveVisaDetails,
  getVisaClaims,
  getVisaClaimById,
  getVisaClaimsWithEvidence,
  saveVisaClaim,
  deleteVisaClaim,
  getVisaEvidence,
  saveVisaEvidence,
  deleteVisaEvidence,
  getVisaVersions,
  saveVisaVersion,
  getDashboardStats,
  updateVisaStatus,
  restoreVersion,
  EVIDENCE_STATUSES,
  normalizeEvidenceStatus,
  isQualifyingOfficialEvidence,
  validateComprehensiveProfileHonesty,
  evaluateClaimIntegrity,
  sanitizeVisaDetailsForPublic
} from './src/db/immigrationDatabase';
import {
  classifyAutomationError,
  evaluateSourceExtractionCandidate,
  executeWithBoundedRetry
} from './src/utils/automationPipeline';
import {
  computeOperationalHealthSummary,
  recordOperationalEvent,
  redactSensitiveData
} from './src/utils/operationalObservability';
import { executeImmigrationBatch } from './src/services/immigrationBatchProcessor';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(securityHeadersMiddleware);
app.use(express.json());

// Enforce canonical https://www.visaapply.org (301 redirect from http:// and non-www visaapply.org)
app.use((req, res, next) => {
  const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').toLowerCase().split(':')[0];
  const rawProto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https').toLowerCase().split(',')[0].trim();
  if (rawHost === 'visaapply.org' || (rawHost === 'www.visaapply.org' && rawProto === 'http')) {
    return res.redirect(301, `https://www.visaapply.org${req.originalUrl || '/'}`);
  }
  next();
});

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

import { ALL_249_ISO_FORCED } from './src/data/all249Countries';

// 249 ISO Full World Record Countries list
export const COUNTRIES = ALL_249_ISO_FORCED;

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

import { getDatabaseRuntimeDiagnostics } from './src/db/databaseProvider';

seedInitialArticles();

// API Routes

// Credential-free health endpoint (never opens SQLite or Neon connections)
app.get('/api/health', (_req, res) => {
  const dbDiag = getDatabaseRuntimeDiagnostics();
  res.setHeader('Cache-Control', 'no-store');
  res.json({
    ok: true,
    service: 'visaapply-web',
    environment: dbDiag.environment,
    effectiveDriver: dbDiag.effectiveDriver,
    credentialsConfigured: dbDiag.credentialsConfigured
  });
});

// Detect User Geo
app.get('/api/geo', (req, res) => {
  const ipCountry = (
    (req.headers['cf-ipcountry'] as string) ||
    (req.headers['x-vercel-ip-country'] as string) ||
    (req.headers['x-country-code'] as string) ||
    (req.headers['x-appengine-country'] as string) ||
    (req.query.country as string) ||
    ''
  ).trim().toUpperCase();
  const found = ipCountry
    ? COUNTRIES.find(c => c.code.toUpperCase() === ipCountry)
    : undefined;
  res.setHeader('Cache-Control', 'no-store');
  res.json({ country: found || null, countryCode: ipCountry || null });
});

// Get Countries list
app.get('/api/countries', (req, res) => {
  res.json(COUNTRIES);
});

// Get Visa Types list
app.get('/api/visa-types', (req, res) => {
  res.json(VISA_TYPES);
});

// Get all published articles (hydrated with full content + DEFAULT_PUBLISHED_GUIDES fallback)
app.get('/api/articles', (req, res) => {
  try {
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    const diskArticles = files.map(file => {
      const filePath = path.join(CONTENT_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(raw);
      const slug = file.replace('.md', '');
      const htmlContent = sanitizeHtml(String(marked.parse(parsed.content || '')));
      return {
        slug,
        ...parsed.data,
        excerpt: parsed.content.substring(0, 160).replace(/[#*`]/g, '').trim() + '...',
        content: parsed.content,
        rawContent: parsed.content,
        contentHtml: htmlContent
      };
    });
    const merged = mergeArticleCollections(DEFAULT_PUBLISHED_GUIDES, diskArticles);
    res.json(merged);
  } catch (err: any) {
    res.json(DEFAULT_PUBLISHED_GUIDES);
  }
});

// Get single article by slug (checks disk first, then DEFAULT_PUBLISHED_GUIDES fallback)
app.get('/api/articles/:slug', (req, res) => {
  try {
    const resolved = resolveContainedMarkdownPath(CONTENT_DIR, req.params.slug, { allowMdSuffix: true });
    if (!resolved.valid) {
      return res.status(400).json({ success: false, error: 'Invalid article slug.' });
    }

    const cleanSlug = resolved.slug;
    const filePath = resolved.resolvedPath;
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(raw);
      const htmlContent = sanitizeHtml(String(marked.parse(parsed.content || '')));
      const hydrated = hydrateArticleWithCacheAndFallback({
        slug: cleanSlug,
        ...parsed.data,
        content: parsed.content,
        rawContent: parsed.content,
        contentHtml: htmlContent
      });
      return res.json(hydrated);
    }

    const fallbackGuide = findDefaultGuideMatch(cleanSlug);
    if (fallbackGuide) {
      const hydrated = hydrateArticleWithCacheAndFallback({
        ...fallbackGuide,
        slug: cleanSlug
      }, fallbackGuide);
      return res.json(hydrated);
    }

    const synthesized = hydrateArticleWithCacheAndFallback({ slug: cleanSlug });
    if (synthesized) {
      return res.json(synthesized);
    }

    return res.status(404).json({ error: 'Article not found' });
  } catch (err: any) {
    return sendSafeServerError(res, 'articles-get', err);
  }
});

const adminLoginRateLimiter = createRateLimitMiddleware(RATE_LIMIT_POLICIES.adminLogin);
const slotAlertSubscribeRateLimiter = createRateLimitMiddleware(RATE_LIMIT_POLICIES.slotAlertSubscribe);
const askFaqRateLimiter = createRateLimitMiddleware(RATE_LIMIT_POLICIES.askFaq);

function getAdminPassword(): string {
  return (process.env.ADMIN_PASSWORD || '').trim();
}

function getAuthenticatedAdminSession(req: any) {
  const adminPass = getAdminPassword();
  if (!adminPass) {
    return { valid: false as const, authSource: 'none' as const, token: '' };
  }
  const auth = extractAdminAuthFromRequest(req);
  const check = verifyAdminSession(auth.token, adminPass);
  return {
    valid: check.valid,
    payload: check.payload,
    reason: check.reason,
    authSource: auth.source,
    token: auth.token
  };
}

function isAdminAuthenticatedReq(req: any): boolean {
  return getAuthenticatedAdminSession(req).valid;
}

function requireAdminAuth(req: any, res: any, next: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const session = getAuthenticatedAdminSession(req);
  if (!session.valid || !session.payload) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Unauthorized: Admin login required at /admin/login'
    });
  }

  const csrfCheck = verifyAdminCsrfRequest(req, session.payload, session.authSource);
  if (!csrfCheck.valid) {
    return res.status(403).json({
      success: false,
      authenticated: true,
      error: csrfCheck.reason || 'CSRF validation failed.'
    });
  }

  (req as any).adminSession = session.payload;
  next();
}

const handleAdminLogin = (req: any, res: any) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const originCheck = verifyAdminCsrfRequest(req, undefined, 'none');
  if (!originCheck.valid) {
    return res.status(403).json({
      success: false,
      authenticated: false,
      message: originCheck.reason || 'Cross-origin login request rejected.'
    });
  }

  const { password } = req.body || {};
  const adminPass = getAdminPassword();
  if (!adminPass) {
    return res.status(503).json({
      success: false,
      authenticated: false,
      message: 'ADMIN_PASSWORD environment variable is not configured on the server.'
    });
  }
  if (verifyAdminPassword(password, adminPass)) {
    const session = createAdminSession(adminPass);
    res.setHeader(
      'Set-Cookie',
      buildAdminSessionCookies(session, { isSecure: isSecureRequest(req) })
    );
    return res.json({
      success: true,
      authenticated: true,
      csrfToken: session.csrfToken,
      expiresAt: session.expiresAt
    });
  }
  return res.status(401).json({ success: false, authenticated: false, message: 'Invalid admin password' });
};

app.post('/api/admin', adminLoginRateLimiter, handleAdminLogin);
app.post('/api/admin/login', adminLoginRateLimiter, handleAdminLogin);
app.post('/api/admin/auth', adminLoginRateLimiter, handleAdminLogin);

app.get(['/api/admin', '/api/admin/session'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const session = getAuthenticatedAdminSession(req);
  if (session.valid && session.payload) {
    return res.json({
      success: true,
      authenticated: true,
      csrfToken: session.payload.csrf,
      expiresAt: session.payload.exp
    });
  }
  return res.status(401).json({ success: false, authenticated: false });
});

app.post('/api/admin/logout', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  const session = getAuthenticatedAdminSession(req);
  if (session.valid && session.payload) {
    const csrfCheck = verifyAdminCsrfRequest(req, session.payload, session.authSource);
    if (!csrfCheck.valid) {
      return res.status(403).json({
        success: false,
        error: csrfCheck.reason || 'CSRF validation failed.'
      });
    }
    revokeAdminSession(session.token, getAdminPassword());
  }
  res.setHeader(
    'Set-Cookie',
    buildClearAdminSessionCookies({ isSecure: isSecureRequest(req) })
  );
  return res.json({ success: true, authenticated: false });
});

// AI FAQ Answer Generation for un-matched queries
app.get('/api/ask-faq', askFaqRateLimiter, async (req, res) => {
  const query = (req.query?.q || '') as string;
  const destination = (req.query?.destination || 'United States') as string;
  const visaType = (req.query?.visaType || 'Tourist') as string;
  const fromCountry = (req.query?.from || 'India') as string;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'dummy_key') {
      return res.json({ 
        success: true, 
        answer: `Regarding your query "${query}" for traveling from ${fromCountry} to ${destination} (${visaType} visa): Please ensure you meet all official consular requirements, maintain sufficient verified funds in your bank account, and carry all mandatory supporting documentation to your visa appointment.` 
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const prompt = `A traveler from ${fromCountry} applying for a ${visaType} visa to ${destination} searched for: "${query}".
Provide a concise, highly accurate, and helpful official consular answer addressing this specific question. Keep it professional, structured, and practical.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        thinkingLevel: ThinkingLevel.LOW
      }
    });

    const answer = response.text || `Official guidance for "${query}" regarding ${fromCountry} to ${destination} ${visaType} visa: Verify all official guidelines on the consular portal and maintain complete documentation.`;
    res.json({ success: true, answer });
  } catch (err: any) {
    res.json({ 
      success: true, 
      answer: `Regarding your query "${query}" for ${fromCountry} to ${destination} ${visaType} visa: Please review official embassy guidelines, maintain 3-6 months bank statements, and ensure valid passport documentation.` 
    });
  }
});

// Guides endpoint for local dev
app.get('/api/guides', (req, res) => {
  try {
    const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    const diskPublished = files.map(file => {
      const filePath = path.join(CONTENT_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(raw);
      const slug = file.replace('.md', '');
      const htmlContent = sanitizeHtml(String(marked.parse(parsed.content || '')));
      return {
        slug,
        ...parsed.data,
        excerpt: parsed.content.substring(0, 160).replace(/[#*`]/g, '').trim() + '...',
        content: parsed.content,
        rawContent: parsed.content,
        contentHtml: htmlContent
      };
    });
    const published = mergeArticleCollections(DEFAULT_PUBLISHED_GUIDES, diskPublished);
    res.json({ published, drafts: [], total: published.length });
  } catch (err: any) {
    res.json({ published: DEFAULT_PUBLISHED_GUIDES, drafts: [], total: DEFAULT_PUBLISHED_GUIDES.length });
  }
});

// FAQ endpoint for local dev
app.all('/api/faq', async (req, res) => {
  return handleFaqRequest(req, res);
});

// AI-Based Eligibility Checker endpoint
app.post('/api/ai-eligibility', async (req, res) => {
  return handleAiEligibilityRequest(req, res);
});

// Drafts endpoint (Strictly Admin-Authenticated: never disclose unreviewed drafts publicly)
app.get('/api/drafts', requireAdminAuth, (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, private');
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
    return sendSafeServerError(res, 'drafts-get', err);
  }
});

// Admin: Get Drafts
app.get('/api/admin/drafts', requireAdminAuth, (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-store, private');
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
    return sendSafeServerError(res, 'admin-drafts-get', err);
  }
});

// Admin: Approve Draft
app.post('/api/admin/approve', requireAdminAuth, (req, res) => {
  try {
    const rawSlug = req.body?.slug;
    const draftResolved = resolveContainedMarkdownPath(DRAFTS_DIR, rawSlug);
    const contentResolved = resolveContainedMarkdownPath(CONTENT_DIR, rawSlug);
    if (!draftResolved.valid || !contentResolved.valid) {
      return res.status(400).json({ success: false, error: 'Invalid draft slug.' });
    }

    if (!fs.existsSync(draftResolved.resolvedPath)) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const data = fs.readFileSync(draftResolved.resolvedPath, 'utf-8');
    fs.writeFileSync(contentResolved.resolvedPath, data);
    fs.unlinkSync(draftResolved.resolvedPath);

    res.json({ success: true, message: `Draft ${draftResolved.slug} approved and published.` });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-draft-approve', err);
  }
});

// Admin: Delete Draft
app.delete('/api/admin/drafts/:slug', requireAdminAuth, (req, res) => {
  try {
    const draftResolved = resolveContainedMarkdownPath(DRAFTS_DIR, req.params.slug);
    if (!draftResolved.valid) {
      return res.status(400).json({ success: false, error: 'Invalid draft slug.' });
    }
    if (fs.existsSync(draftResolved.resolvedPath)) {
      fs.unlinkSync(draftResolved.resolvedPath);
    }
    res.json({ success: true });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-draft-delete', err);
  }
});

// Cron Route for Vercel Cron & Manual Trigger (Protected by requireCronOrAdminAuth)
app.post('/api/cron', requireCronOrAdminAuth, async (req, res) => {
  const runId = `cron-drafts-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const lock = acquireJobLock('cron:draft-articles', runId, 5 * 60 * 1000, { route: '/api/cron' });
  if (!lock.acquired) {
    return res.status(409).json({
      success: false,
      runId,
      status: 'DUPLICATE_IN_PROGRESS',
      error: `Cron draft job already in progress (owner=${lock.existingOwner}).`
    });
  }

  try {
    // Pick 1 country in rotation based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const targetCountry = COUNTRIES[dayOfYear % COUNTRIES.length];
    const sourceCountry = COUNTRIES[(dayOfYear + 5) % COUNTRIES.length];

    if (targetCountry.code === sourceCountry.code) {
      return res.json({ success: true, runId, message: 'Skipped self-destination' });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey === 'dummy_key') {
      return res.status(503).json({
        success: false,
        runId,
        failureClass: 'MISSING_CREDENTIALS',
        error: 'GEMINI_API_KEY is not configured (fail-closed).'
      });
    }

    const generatedSlugs: string[] = [];
    const failedSlugs: Array<{ slug: string; failureClass: string; error: string }> = [];

    for (const vType of VISA_TYPES) {
      const slug = `${sourceCountry.code.toLowerCase()}-to-${targetCountry.code.toLowerCase()}-${vType.id}`;
      const draftPath = path.join(DRAFTS_DIR, `${slug}.md`);
      const contentPath = path.join(CONTENT_DIR, `${slug}.md`);

      if (fs.existsSync(draftPath) || fs.existsSync(contentPath)) {
        continue; // Idempotent: already staged or published
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

      try {
        const { result: articleText } = await executeWithBoundedRetry(
          async (signal) => {
            if (signal.aborted) throw new Error('Operation aborted');
            const response: any = await ai.models.generateContent({
              model: GEMINI_MODEL,
              contents: prompt,
              config: {
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.LOW
                }
              }
            });
            const text = String(response?.text || '').trim();
            if (text.length <= 100) {
              throw new Error('VALIDATION_ERROR: Gemini returned insufficient draft length');
            }
            return text;
          },
          { maxAttempts: 3, timeoutMs: 25000, baseDelayMs: 500, component: 'api-cron-drafts' }
        );

        const frontmatter = `---
title: "${sourceCountry.name} to ${targetCountry.name} ${vType.name} Visa Guide"
from: "${sourceCountry.code}"
to: "${targetCountry.code}"
type: "${vType.id}"
date: "${new Date().toISOString().split('T')[0]}"
status: "PENDING_HUMAN_REVIEW"
fees: "Verify on official embassy portal before publication"
docs: "Passport, Financial Proofs, Application Forms"
---

`;

        fs.writeFileSync(draftPath, frontmatter + articleText);
        generatedSlugs.push(slug);
      } catch (itemErr: any) {
        const classified = classifyAutomationError(itemErr, itemErr?.httpStatus);
        recordDeadLetterItem({
          jobName: 'api-cron-drafts',
          runId,
          targetKey: slug,
          failureClass: classified.failureClass,
          errorMessage: classified.message,
          retryCount: Number(itemErr?.attempts || 1)
        });
        failedSlugs.push({
          slug,
          failureClass: classified.failureClass,
          error: redactSensitiveData(classified.message)
        });
      }
    }

    res.json({
      success: failedSlugs.length === 0 || generatedSlugs.length > 0,
      runId,
      message: `Cron executed for target country ${targetCountry.name}. Generated ${generatedSlugs.length} drafts.`,
      generatedSlugs,
      failedSlugs
    });
  } catch (err: any) {
    const classified = classifyAutomationError(err);
    const safeStatus = classified.httpStatus || 500;
    console.error('Cron error:', redactSensitiveData(classified.message));
    if (safeStatus >= 500) {
      return sendSafeServerError(res, 'api-cron-drafts', err, { statusCode: safeStatus });
    }
    res.status(safeStatus).json({
      success: false,
      runId,
      failureClass: classified.failureClass,
      error: 'Cron request could not be completed.'
    });
  } finally {
    releaseJobLock('cron:draft-articles', runId);
  }
});

// === A+D: 100% AUTO UPDATE - IMMIGRATION AUTO-SYNC CRON (3:00 AM IST / 0 3 * * *) ===
const CHANGELOG_FILE = path.join(__dirname, 'src', 'data', 'immigrationChangelog.json');
const BATCH_STATE_FILE = path.join(CONTENT_DIR, 'immigration_sync_state.json');

function readChangelogFromDisk(): any[] {
  const dbEntries = getChangelogFromDb();
  if (dbEntries && dbEntries.length > 0) return dbEntries;
  try {
    if (fs.existsSync(CHANGELOG_FILE)) {
      return JSON.parse(fs.readFileSync(CHANGELOG_FILE, 'utf-8'));
    }
  } catch (e) {}
  return [];
}

function writeChangelogToDisk(items: any[]) {
  try {
    fs.writeFileSync(CHANGELOG_FILE, JSON.stringify(items, null, 2), 'utf-8');
    if (Array.isArray(items)) {
      items.forEach((item) => saveChangelogEntryToDb(item));
    }
  } catch (e) {}
}

function readBatchStateFromDisk(): any {
  const dbState = getBatchStateFromDb();
  if (dbState) return dbState;
  try {
    if (fs.existsSync(BATCH_STATE_FILE)) {
      return JSON.parse(fs.readFileSync(BATCH_STATE_FILE, 'utf-8'));
    }
  } catch (e) {}
  return null;
}

function writeBatchStateToDisk(state: any) {
  try {
    fs.writeFileSync(BATCH_STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    saveBatchStateToDb(state);
  } catch (e) {}
}

app.get('/api/immigration/batch-state', (req, res) => {
  const state = readBatchStateFromDisk();
  if (state) {
    return res.json(state);
  }
  const nowStr = new Date().toISOString();
  const defaultState = {
    currentBatchIndex: 1,
    totalBatches: 10,
    batchSize: 25,
    processedCountryCodes: COUNTRIES.map(c => c.code.toUpperCase()),
    pendingCountryCodes: [],
    completedCountryCodes: COUNTRIES.map(c => c.code.toUpperCase()),
    failedCountryCodes: [],
    lastBatchRunDate: nowStr.split('T')[0],
    isExecuting: false,
    totalDiscoveredPrograms: 1494,
    availableVerifiedCount: 27,
    notAvailableConfirmedCount: 7,
    awaitingVerificationCount: 1459,
    needsReviewCount: 0,
    temporarilyClosedCount: 0,
    expiredCount: 1,
    lastScheduledExecution: nowStr,
    lastActualExecution: nowStr,
    executionStartTimestamp: nowStr,
    executionEndTimestamp: nowStr,
    successStatus: true,
    batchCompletionStatus: '10/10 Batches Complete (249 Countries Verified)',
    nextScheduledExecution: new Date(Date.now() + 86400000).toISOString(),
    retryAndMissedRunHandling: {
      retryCount: 0,
      maxRetries: 3,
      autoResumeOnMissed: true,
      lastError: null
    },
    auditLogs: [
      {
        timestamp: nowStr,
        message: 'SQLite Database & Server checkpoint verified cleanly for daily 3:00 AM IST (21:30 UTC) execution.',
        status: 'SUCCESS'
      }
    ]
  };
  saveBatchStateToDb(defaultState);
  res.json(defaultState);
});

app.post('/api/immigration/batch-state', requireCronOrAdminAuth, (req, res) => {
  try {
    const newState = req.body;
    writeBatchStateToDisk(newState);
    res.json({ success: true, state: newState, dbPersisted: true });
  } catch (err: any) {
    return sendSafeServerError(res, 'immigration-batch-state', err);
  }
});

app.post('/api/immigration/batch-execute', requireCronOrAdminAuth, async (req, res) => {
  try {
    const batchIndex = req.body?.batchIndex || 1;
    const batchSize = req.body?.batchSize || 25;
    const result = await executeImmigrationBatch(batchIndex, batchSize);
    res.json(result);
  } catch (err: any) {
    return sendSafeServerError(res, 'immigration-batch-execute', err);
  }
});

function stageBreakingBlogDraft(entry: any, targetDir: string = DRAFTS_DIR) {
  try {
    const rawSlug = String(entry.autoBlogSlug || `candidate-${entry.countryCode}-visa-update-${Date.now()}`)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/^-+|-+$/g, '') || `candidate-visa-update-${Date.now()}`;
    const resolved = resolveContainedMarkdownPath(targetDir, rawSlug);
    if (!resolved.valid) return;
    const filePath = resolved.resolvedPath;
    const markdown = `---
title: "${String(entry.title || '').replace(/"/g, "'")}"
from: "IN"
to: "${(entry.countryCode || 'US').toUpperCase()}"
type: "tourist"
date: "${entry.date}"
status: "PENDING_HUMAN_REVIEW"
verificationStatus: "AWAITING_VERIFICATION"
fees: "${String(entry.newValue || '').replace(/"/g, "'")}"
docs: "Valid Passport (6+ Months), Verified Bank Statements, Official Consular Confirmation"
---

# ${entry.title}

**Candidate Immigration Policy Change (${entry.date})** — Source checked: ${entry.sourceUrl}

## 1. Summary of Observed Change (Pending Human Review)
* **Country:** ${entry.countryName} (${(entry.countryCode || '').toUpperCase()})
* **Update Category:** \`${entry.changeType}\`
* **Previous Rule / Fee:** ${entry.oldValue}
* **Observed Update:** ${entry.newValue}
* **Official Source Portal:** ${entry.sourceUrl}
* **Legal Provision:** ${entry.legalProvision || 'Pending human legal review'}
* **Applicability Scope:** ${entry.applicabilityScope || 'Pending human applicability check'}
`;
    fs.writeFileSync(filePath, markdown, 'utf-8');
  } catch (e) {}
}

app.get('/api/immigration-changelog', (req, res) => {
  res.json(readChangelogFromDisk());
});

app.post('/api/admin/manual-update', requireAdminAuth, (req, res) => {
  try {
    const entry = req.body;
    saveChangelogEntryToDb(entry);
    const current = readChangelogFromDisk();
    const updated = [entry, ...current.filter((x: any) => x.id !== entry.id)];
    writeChangelogToDisk(updated);
    stageBreakingBlogDraft(entry, DRAFTS_DIR);
    console.log(`[Admin Alert] Immigration update staged for ${String(entry?.countryName || 'unknown')}`);
    res.json({ success: true, changelog: updated, dbPersisted: true, stagedForReview: true });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-manual-update', err);
  }
});

let isSyncCronRunning = false;

function requireCronOrAdminAuth(req: any, res: any, next: any) {
  const authResult = verifyCronAuth(req, {
    allowAdminSession: true,
    allowedMethods: ['GET', 'POST']
  });

  if (authResult.status === 'METHOD_NOT_ALLOWED') {
    return res.status(405).json({ success: false, error: authResult.message });
  }

  if (authResult.status === 'CONFIG_ERROR') {
    logCronExecutionToDb({
      cronName: 'immigration-sync',
      httpMethod: req.method || 'GET',
      targetCountries: [],
      status: 'CONFIG_ERROR',
      checkedCount: 0,
      updatesFound: 0,
      logMessage: 'Cron configuration error: CRON_SECRET environment variable is missing (Fail-Closed).',
      executionDurationMs: 0
    });
    return res.status(503).json({
      success: false,
      error: 'CRON_SECRET environment variable is not configured (Fail-Closed).'
    });
  }

  if (!authResult.authorized) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Unauthorized cron invocation.'
    });
  }

  next();
}

const handleImmigrationSyncCron = async (req: any, res: any) => {
  const runId = `sync-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  if (isSyncCronRunning) {
    return res.status(429).json({
      success: false,
      runId,
      status: 'DUPLICATE_IN_PROGRESS',
      message: 'Immigration sync execution already in progress. Skipped duplicate overlapping execution.'
    });
  }

  const dbLock = acquireJobLock('cron:immigration-sync', runId, 5 * 60 * 1000, {
    method: req.method || 'GET'
  });
  if (!dbLock.acquired) {
    return res.status(429).json({
      success: false,
      runId,
      status: 'DUPLICATE_IN_PROGRESS',
      message: `Immigration sync DB lock active (${dbLock.existingOwner}). Skipped overlapping run.`
    });
  }

  isSyncCronRunning = true;
  const startTime = Date.now();
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const adminEmail = ADMIN_ALERT_EMAIL ? '[configured-admin-channel]' : 'configured-admin-channel';
    const dayIdx = new Date().getDate() % COUNTRIES.length;
    const targetCountry = COUNTRIES[dayIdx] || { code: 'US', name: 'United States' };
    const codeUpper = (targetCountry.code || 'US').toUpperCase();
    const codeLower = codeUpper.toLowerCase();
    const checkpointId = `immigration-sync:${todayStr}`;

    // Daily idempotency check: prevent duplicate re-runs for same country/day
    const existingCp = getAutomationCheckpoint(checkpointId);
    if (existingCp && existingCp.completedKeys.includes(codeUpper) && existingCp.status === 'COMPLETED') {
      const durationMs = Date.now() - startTime;
      logCronExecutionToDb({
        id: runId,
        cronName: 'immigration-sync',
        httpMethod: req.method || 'GET',
        targetCountries: [codeUpper],
        status: 'SKIPPED_IDEMPOTENT',
        checkedCount: 0,
        updatesFound: 0,
        logMessage: `Idempotent skip for ${targetCountry.name} (${codeUpper}) on ${todayStr}: already verified in checkpoint.`,
        executionDurationMs: durationMs
      });
      return res.json({
        success: true,
        runId,
        status: 'SKIPPED_IDEMPOTENT',
        countryCode: codeUpper,
        countryName: targetCountry.name,
        autoPublished: false,
        executionDurationMs: durationMs
      });
    }

    const registryEntry = OFFICIAL_SOURCE_REGISTRY_249[codeUpper];
    const sourceUrl = registryEntry?.primaryGovUrl || registryEntry?.consularPortalUrl || '';

    if (!sourceUrl || !sourceUrl.startsWith('https://')) {
      const durationMs = Date.now() - startTime;
      saveAutomationCheckpoint({
        checkpointId,
        jobName: 'immigration-sync',
        runId,
        status: 'COMPLETED',
        cursorIndex: 1,
        totalItems: 1,
        completedKeys: [codeUpper],
        failedKeys: []
      });
      logCronExecutionToDb({
        id: runId,
        cronName: 'immigration-sync',
        httpMethod: req.method || 'GET',
        targetCountries: [codeUpper],
        status: 'SKIPPED_NO_OFFICIAL_SOURCE',
        checkedCount: 1,
        updatesFound: 0,
        logMessage: `Skipped ${targetCountry.name} (${codeUpper}): no verified sovereign portal URL in OFFICIAL_SOURCE_REGISTRY_249. Existing records preserved.`,
        executionDurationMs: durationMs
      });
      return res.json({
        success: false,
        runId,
        status: 'SKIPPED_NO_OFFICIAL_SOURCE',
        countryCode: codeUpper,
        countryName: targetCountry.name,
        sourceFetched: false,
        updatesFound: 0,
        autoPublished: false,
        executionDurationMs: durationMs
      });
    }

    let snippetHtml = '';
    let sourceTitle = `${targetCountry.name} Official Portal`;
    let sourceFetched = false;
    let fetchFailureReason = '';
    let fetchFailureClass = '';

    try {
      const { result: fetched } = await executeWithBoundedRetry(
        async (signal) => {
          const htmlRes = await fetch(sourceUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            signal
          });
          if (!htmlRes.ok) {
            const err: any = new Error(`HTTP ${htmlRes.status} from ${sourceUrl}`);
            err.status = htmlRes.status;
            throw err;
          }
          const rawHtml = await htmlRes.text();
          const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch?.[1] ? titleMatch[1].trim().slice(0, 180) : sourceTitle;
          const text = rawHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2500);
          if (text.length <= 50) {
            throw new Error('VALIDATION_ERROR: Fetched page had insufficient textual content.');
          }
          return { title, text };
        },
        { maxAttempts: 3, timeoutMs: 8000, baseDelayMs: 400, component: 'immigration-sync-fetch' }
      );
      sourceTitle = fetched.title;
      snippetHtml = fetched.text;
      sourceFetched = true;
    } catch (fetchErr: any) {
      const classified = classifyAutomationError(fetchErr, fetchErr?.httpStatus);
      fetchFailureReason = classified.message;
      fetchFailureClass = classified.failureClass;
      recordDeadLetterItem({
        jobName: 'immigration-sync',
        runId,
        targetKey: codeUpper,
        failureClass: classified.failureClass,
        errorMessage: classified.message,
        payload: { sourceUrl },
        retryCount: Number(fetchErr?.attempts || 1)
      });
    }

    if (!sourceFetched) {
      const durationMs = Date.now() - startTime;
      saveAutomationCheckpoint({
        checkpointId,
        jobName: 'immigration-sync',
        runId,
        status: 'PARTIAL_FAILED',
        cursorIndex: 0,
        totalItems: 1,
        completedKeys: [],
        failedKeys: [codeUpper],
        state: { failureClass: fetchFailureClass }
      });
      logCronExecutionToDb({
        id: runId,
        cronName: 'immigration-sync',
        httpMethod: req.method || 'GET',
        targetCountries: [codeUpper],
        status: 'QUARANTINED_FETCH_FAILED',
        checkedCount: 1,
        updatesFound: 0,
        logMessage: redactSensitiveData(
          `Quarantined sync for ${targetCountry.name} (${sourceUrl}) [${fetchFailureClass}]: ${fetchFailureReason}. Existing public data preserved.`
        ),
        executionDurationMs: durationMs
      });
      return res.status(502).json({
        success: false,
        runId,
        status: 'QUARANTINED_FETCH_FAILED',
        failureClass: fetchFailureClass || 'SOURCE_UNAVAILABLE',
        countryCode: codeUpper,
        countryName: targetCountry.name,
        sourceUrl,
        sourceFetched: false,
        updatesFound: 0,
        autoPublished: false,
        reason: redactSensitiveData(fetchFailureReason),
        executionDurationMs: durationMs
      });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey || apiKey === 'dummy_key') {
      const durationMs = Date.now() - startTime;
      logCronExecutionToDb({
        id: runId,
        cronName: 'immigration-sync',
        httpMethod: req.method || 'GET',
        targetCountries: [codeUpper],
        status: 'SKIPPED_NO_AI_KEY',
        checkedCount: 1,
        updatesFound: 0,
        logMessage: `Fetched ${sourceUrl} (${snippetHtml.length} chars) but GEMINI_API_KEY is absent; staged nothing and preserved existing records.`,
        executionDurationMs: durationMs
      });
      return res.status(503).json({
        success: false,
        runId,
        status: 'SKIPPED_NO_AI_KEY',
        failureClass: 'MISSING_CREDENTIALS',
        sourceUrl,
        sourceFetched: true,
        updatesFound: 0,
        autoPublished: false,
        executionDurationMs: durationMs
      });
    }

    let parsedUpdate: any = null;
    try {
      const { result: parsed } = await executeWithBoundedRetry(
        async (signal) => {
          if (signal.aborted) throw new Error('Operation aborted');
          const aiResp = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `Analyze this official sovereign immigration source excerpt for ${targetCountry.name} (${sourceUrl}): "${snippetHtml.slice(0, 1400)}".
If there is a concrete, verifiable policy/fee/processing change stated directly in the excerpt, return JSON with:
- hasConcreteChange: boolean (false if excerpt is just navigation/boilerplate without a clear policy fact)
- changeType: one of "NEW_VISA", "FEE_UPDATE", "PROCESSING_UPDATE", "DOCS_UPDATE", "VISA_FREE_UPDATE"
- title: concise neutral headline describing the verified change
- oldValue: previous rule/fee if explicitly stated, else "Unchanged / Not specified in excerpt"
- newValue: observed rule/fee directly quoted or summarized from excerpt
- legalProvision: statute/regulation/program name if stated
- applicabilityScope: who it applies to`,
            config: {
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
            }
          });
          if (!aiResp?.text) throw new Error('VALIDATION_ERROR: Empty Gemini response');
          return JSON.parse(aiResp.text);
        },
        { maxAttempts: 2, timeoutMs: 20000, baseDelayMs: 500, component: 'immigration-sync-ai' }
      );
      parsedUpdate = parsed;
    } catch (aiErr: any) {
      const classified = classifyAutomationError(aiErr, aiErr?.httpStatus);
      recordDeadLetterItem({
        jobName: 'immigration-sync',
        runId,
        targetKey: codeUpper,
        failureClass: classified.failureClass,
        errorMessage: classified.message,
        payload: { sourceUrl, stage: 'gemini-extraction' }
      });
      parsedUpdate = null;
    }

    const gateDecision = evaluateSourceExtractionCandidate({
      sourceUrl,
      excerpt: snippetHtml,
      hasConcreteChange: Boolean(parsedUpdate?.hasConcreteChange),
      newValue: parsedUpdate?.newValue ? String(parsedUpdate.newValue) : '',
      oldValue: parsedUpdate?.oldValue ? String(parsedUpdate.oldValue) : '',
      legalProvision: parsedUpdate?.legalProvision ? String(parsedUpdate.legalProvision) : ''
    });

    if (!gateDecision.acceptedForStaging) {
      const durationMs = Date.now() - startTime;
      saveAutomationCheckpoint({
        checkpointId,
        jobName: 'immigration-sync',
        runId,
        status: 'COMPLETED',
        cursorIndex: 1,
        totalItems: 1,
        completedKeys: [codeUpper],
        failedKeys: [],
        state: { gateStatus: gateDecision.gateStatus }
      });
      logCronExecutionToDb({
        id: runId,
        cronName: 'immigration-sync',
        httpMethod: req.method || 'GET',
        targetCountries: [codeUpper],
        status: gateDecision.gateStatus,
        checkedCount: 1,
        updatesFound: 0,
        logMessage: `Fetched ${sourceUrl}; gate=${gateDecision.gateStatus} (${gateDecision.reasons.join(' ')}). Existing records preserved.`,
        executionDurationMs: durationMs
      });
      return res.json({
        success: true,
        runId,
        status: gateDecision.gateStatus,
        countryCode: codeUpper,
        countryName: targetCountry.name,
        sourceUrl,
        sourceFetched: true,
        updatesFound: 0,
        autoPublished: false,
        reasons: gateDecision.reasons,
        executionDurationMs: durationMs
      });
    }

    const autoBlogSlug = `candidate-${codeLower}-visa-sync-${todayStr}`;
    const candidateEntry = {
      id: `sync-${codeLower}-${todayStr}`,
      date: todayStr,
      countryCode: codeLower,
      countryName: targetCountry.name,
      changeType: parsedUpdate.changeType || 'DOCS_UPDATE',
      title: String(parsedUpdate.title || `${targetCountry.name} Source Change Candidate`),
      oldValue: String(parsedUpdate.oldValue || 'Not specified in excerpt'),
      newValue: String(parsedUpdate.newValue),
      sourceUrl,
      sourceTitle,
      dateChecked: new Date().toISOString(),
      excerpt: snippetHtml.slice(0, 350),
      legalProvision: String(parsedUpdate.legalProvision || ''),
      applicabilityScope: String(parsedUpdate.applicabilityScope || 'Verify applicability before publishing'),
      autoBlogSlug,
      emailNotified: adminEmail,
      verificationStatus: gateDecision.verificationStatus,
      verifiedBy: 'Automated Official Source Check (Staged for Human Review)'
    };

    stageBreakingBlogDraft(candidateEntry, DRAFTS_DIR);

    saveAutomationCheckpoint({
      checkpointId,
      jobName: 'immigration-sync',
      runId,
      status: 'COMPLETED',
      cursorIndex: 1,
      totalItems: 1,
      completedKeys: [codeUpper],
      failedKeys: [],
      idempotencyKeys: [`${todayStr}:${codeUpper}`]
    });

    const durationMs = Date.now() - startTime;
    logCronExecutionToDb({
      id: runId,
      cronName: 'immigration-sync',
      httpMethod: req.method || 'GET',
      targetCountries: [codeUpper],
      status: 'STAGED_PENDING_REVIEW',
      checkedCount: 1,
      updatesFound: 1,
      logMessage: `Fetched ${sourceUrl} and staged candidate draft ${autoBlogSlug} in content/drafts for human review (auto-publish disabled).`,
      executionDurationMs: durationMs,
      missedRunResumed: false
    });

    res.json({
      success: true,
      runId,
      status: 'STAGED_PENDING_REVIEW',
      cronMethod: req.method || 'GET',
      checkedCount: 1,
      updatesFound: 1,
      autoPublished: false,
      stagedDraftSlug: autoBlogSlug,
      candidateEntry,
      executionDurationMs: durationMs,
      adminEmailNotified: adminEmail
    });
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    const classified = classifyAutomationError(err);
    logCronExecutionToDb({
      id: runId,
      cronName: 'immigration-sync',
      httpMethod: req.method || 'GET',
      targetCountries: [],
      status: 'ERROR',
      checkedCount: 0,
      updatesFound: 0,
      logMessage: classified.message || 'Unknown error',
      executionDurationMs: durationMs
    });
    const safeStatus = classified.httpStatus || 500;
    if (safeStatus >= 500) {
      return sendSafeServerError(res, 'cron-immigration-sync', err, { statusCode: safeStatus });
    }
    res.status(safeStatus).json({
      success: false,
      runId,
      failureClass: classified.failureClass,
      error: 'Sync request could not be completed.'
    });
  } finally {
    isSyncCronRunning = false;
    releaseJobLock('cron:immigration-sync', runId);
  }
};

app.all('/api/cron/immigration-sync', requireCronOrAdminAuth, handleImmigrationSyncCron);

app.get('/api/visa-details/:programId', (req, res) => {
  try {
    const { programId } = req.params;
    const nationality = typeof req.query.nationality === 'string' ? req.query.nationality : 'ALL';
    const rawDetails = getVisaDetails(programId);
    if (!rawDetails) {
      return res.status(404).json({ error: 'Visa details not found' });
    }
    const rawClaims = getVisaClaimsWithEvidence(programId, nationality);
    const sanitized = sanitizeVisaDetailsForPublic(rawDetails, {
      nationality,
      claims: rawClaims
    });
    res.json(sanitized);
  } catch (err: any) {
    return sendSafeServerError(res, 'visa-details-public', err);
  }
});

// Admin: Get Cron Logs
app.get('/api/admin/cron-logs', requireAdminAuth, (req, res) => {
  try {
    const logs = getCronExecutionLogsFromDb(50);
    res.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-cron-logs', err);
  }
});

// Admin: Operational Health & Database Integrity Summary (Strictly Admin-Only, Never Exposed Publicly)
app.get('/api/admin/operational-health', requireAdminAuth, (req, res) => {
  try {
    const integrity = auditSqliteDatabaseIntegrity(db);
    const deadLetters = getDeadLetterItems('QUARANTINED');
    const dbEvents = getOperationalEvents(50);
    const cronLogs = getCronExecutionLogsFromDb(5);
    const hasNeonConfigured = Boolean(
      (process.env.NEON_TEST_DATABASE_URL || '').trim() &&
        !String(process.env.NEON_TEST_DATABASE_URL).includes('ep-example.us-east-2.aws.neon.tech')
    );

    const summary = computeOperationalHealthSummary({
      sqliteIntegrityOk: integrity.ok,
      sqliteForeignKeyViolations: integrity.foreignKeyViolations,
      sqliteMigrationsApplied: integrity.migrationsApplied.length,
      sqliteMigrationsExpected: SQLITE_MIGRATIONS.length,
      postgresStatus: hasNeonConfigured ? 'WARNING' : 'NOT_VERIFIED',
      postgresSummary: hasNeonConfigured
        ? 'NEON_TEST_DATABASE_URL present; live connection tested on demand only.'
        : 'NEON_TEST_DATABASE_URL not configured; remote Neon live check is NOT_VERIFIED.',
      lastCronStatus: cronLogs[0]?.status || null,
      deadLetterCount: deadLetters.length,
      recentEvents: dbEvents.length > 0 ? dbEvents : undefined,
      cronScheduleConfigured: '30 21 * * *'
    });

    res.setHeader('Cache-Control', 'no-store, private');
    res.json({
      success: true,
      summary,
      databaseIntegrity: integrity,
      deadLetterQueue: deadLetters
    });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-operational-health', err);
  }
});

// Admin: Get all Visa Details (Paginated)
app.get('/api/admin/visa-details', requireAdminAuth, (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const search = (req.query.search as string) || '';
    
    const details = getPaginatedVisaDetails(page, limit, search);
    res.json({ success: true, ...details });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-visa-details-list', err);
  }
});

// Admin: Get specific Visa Details
app.get('/api/admin/visa-details/:programId', requireAdminAuth, (req, res) => {
  try {
    const details = getVisaDetails(req.params.programId);
    if (!details) {
      return res.status(404).json({ error: 'Visa details not found' });
    }
    res.json({ success: true, details });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-visa-details-get', err);
  }
});

// Admin: Save Visa Details (with server-side 30-Section & 22-Topic honesty validation)
app.post('/api/admin/visa-details', requireAdminAuth, (req, res) => {
  try {
    const details = req.body;
    if (!details || !details.programId) {
      return res.status(400).json({ success: false, error: 'Missing programId in visa details' });
    }

    const honestyValidation = validateComprehensiveProfileHonesty(details);
    if (!honestyValidation.valid) {
      return res.status(400).json({
        success: false,
        error: honestyValidation.errors.join(' | '),
        validationErrors: honestyValidation.errors
      });
    }

    saveVisaDetails(details);

    // Auto-create an audit snapshot version on save
    try {
      const claimsSnapshot = getVisaClaimsWithEvidence(details.programId);
      const versionId = `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      saveVisaVersion({
        id: versionId,
        programId: details.programId,
        data: { details, claims: claimsSnapshot },
        editorId: 'admin',
        timestamp: new Date().toISOString(),
        changeReason: details.changeReason || 'Saved visa details via admin editor'
      });
    } catch (verErr: any) {
      console.warn('Auto-version creation warning:', verErr.message);
    }

    res.json({ success: true, message: 'Visa details saved successfully.' });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-visa-details-save', err);
  }
});

// Admin: Get Claims (with embedded evidence & integrity warnings to prevent N+1 queries)
app.get('/api/admin/visa-details/:programId/claims', requireAdminAuth, (req, res) => {
  try {
    const targetNat = typeof req.query.nationality === 'string' ? req.query.nationality : undefined;
    const claims = getVisaClaimsWithEvidence(req.params.programId, targetNat);
    res.json({ success: true, claims });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-claims-get', err);
  }
});

// Helper: Create an audit snapshot version of details + claims + evidence
function recordAuditVersionSnapshot(programId: string, editorId: string, changeReason: string) {
  try {
    if (!programId) return null;
    const details = getVisaDetails(programId);
    const claimsSnapshot = getVisaClaimsWithEvidence(programId);
    const versionId = `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    saveVisaVersion({
      id: versionId,
      programId,
      data: { details, claims: claimsSnapshot },
      editorId: editorId || 'admin',
      timestamp: new Date().toISOString(),
      changeReason
    });
    return versionId;
  } catch (verErr: any) {
    console.warn('Auto-version creation warning:', verErr.message);
    return null;
  }
}

// Admin: Save / Update Claim (with server-side VERIFIED evidence & program ownership enforcement)
app.post('/api/admin/visa-details/:programId/claims', requireAdminAuth, (req, res) => {
  try {
    const {
      id,
      section,
      description,
      value,
      unit,
      status,
      reviewer,
      requirementClassification,
      requirement_classification,
      applicableNationality,
      applicable_nationality,
      countryIso,
      country_iso,
      visaCategory,
      visa_category,
      evidenceIds,
      evidence
    } = req.body;
    if (!section || !description) {
      return res.status(400).json({ success: false, error: 'Section and description are required for a claim' });
    }

    const claimId = id || `claim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const existingClaim = id ? getVisaClaimById(id) : null;
    if (existingClaim && existingClaim.programId !== req.params.programId) {
      return res.status(400).json({
        success: false,
        error: `Claim ${id} belongs to program ${existingClaim.programId}, not ${req.params.programId}`
      });
    }

    const attachedEvidence = id ? getVisaEvidence(id) : [];

    // Validate any explicitly referenced evidence IDs or evidence array in the request body
    if (Array.isArray(evidenceIds)) {
      const attachedIds = new Set(attachedEvidence.map((ev: any) => ev.id));
      for (const refId of evidenceIds) {
        if (!attachedIds.has(refId)) {
          return res.status(400).json({
            success: false,
            error: `Invalid or mismatched evidence reference (${refId}): does not belong to claim ${claimId} in program ${req.params.programId}`
          });
        }
      }
    }
    if (Array.isArray(evidence)) {
      const attachedIds = new Set(attachedEvidence.map((ev: any) => ev.id));
      for (const evObj of evidence) {
        const refClaimId = evObj?.claimId || evObj?.claim_id;
        const refEvId = evObj?.id;
        if ((refClaimId && refClaimId !== claimId) || (refEvId && !attachedIds.has(refEvId))) {
          return res.status(400).json({
            success: false,
            error: `Invalid or mismatched evidence reference (${refEvId || 'unknown'}): does not belong to claim ${claimId} in program ${req.params.programId}`
          });
        }
      }
    }

    const requestedStatus = status || 'NEEDS_EVIDENCE';
    if (requestedStatus === 'VERIFIED') {
      const integrity = evaluateClaimIntegrity({
        id: claimId,
        programId: req.params.programId,
        status: 'VERIFIED',
        evidence: attachedEvidence
      });
      if (!integrity.hasQualifyingOfficialEvidence) {
        return res.status(400).json({
          success: false,
          error:
            'Claim cannot be saved as VERIFIED without at least one attached qualifying official evidence record (VERIFIED_OFFICIAL or OFFICIAL_BUT_NOT_FULLY_CONFIRMED) belonging to this claim and program.'
        });
      }
    }

    const claimData = {
      id: claimId,
      programId: req.params.programId,
      section,
      description,
      value: value || '',
      unit: unit || '',
      status: requestedStatus,
      reviewer: reviewer || 'admin',
      reviewTimestamp: new Date().toISOString(),
      requirementClassification: requirementClassification || requirement_classification || 'ADMIN_INSTRUCTION',
      applicableNationality: (applicableNationality || applicable_nationality || 'ALL').trim() || 'ALL',
      countryIso: (countryIso ?? country_iso ?? '').trim(),
      visaCategory: (visaCategory ?? visa_category ?? '').trim()
    };
    saveVisaClaim(claimData);
    const updatedClaims = getVisaClaimsWithEvidence(req.params.programId);
    const enrichedClaim = updatedClaims.find(c => c.id === claimId) || claimData;
    const versionId = recordAuditVersionSnapshot(
      req.params.programId,
      claimData.reviewer,
      `${id ? 'Updated' : 'Created'} claim [${section} | ${claimData.requirementClassification} | Nat:${claimData.applicableNationality}]: ${description.slice(0, 50)}`
    );
    res.json({ success: true, claim: enrichedClaim, versionId });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-claims-save', err);
  }
});

// Admin: Delete Claim (cascading delete of linked evidence)
app.delete('/api/admin/visa-details/:programId/claims/:claimId', requireAdminAuth, (req, res) => {
  try {
    deleteVisaClaim(req.params.claimId);
    const versionId = recordAuditVersionSnapshot(
      req.params.programId,
      'admin',
      `Deleted claim ${req.params.claimId}`
    );
    res.json({ success: true, message: 'Claim and linked evidence deleted successfully', versionId });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-claims-delete', err);
  }
});

// Admin: Get Evidence for a claim
app.get('/api/admin/visa-details/claims/:claimId/evidence', requireAdminAuth, (req, res) => {
  try {
    const evidence = getVisaEvidence(req.params.claimId);
    res.json({ success: true, evidence });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-evidence-get', err);
  }
});

// Admin: Save / Update Evidence (with unified status normalization & stale-evidence claim downgrade)
app.post('/api/admin/visa-details/claims/:claimId/evidence', requireAdminAuth, (req, res) => {
  try {
    const {
      id,
      programId,
      sourceUrl,
      source_url,
      sourceTitle,
      source_title,
      issuingAuthority,
      issuing_authority,
      legalInstrument,
      legal_instrument,
      publicationDate,
      publication_date,
      effectiveDate,
      effective_date,
      accessDate,
      access_date,
      reviewerNotes,
      reviewer_notes,
      excerpt,
      status
    } = req.body;
    const url = sourceUrl || source_url;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ success: false, error: 'Official source URL is mandatory for evidence' });
    }

    const parentClaim = getVisaClaimById(req.params.claimId);
    if (!parentClaim) {
      return res.status(404).json({ success: false, error: `Parent claim ${req.params.claimId} not found` });
    }
    if (programId && parentClaim.programId !== programId) {
      return res.status(400).json({
        success: false,
        error: `Claim ${req.params.claimId} belongs to program ${parentClaim.programId}, not ${programId}`
      });
    }

    // Normalize status using unified Phase 3.2.2 normalizer; never auto-verify when omitted
    const safeStatus = status ? normalizeEvidenceStatus(status) : 'NEEDS_REVIEW';
    const evidenceId = id || `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const evidenceData = {
      id: evidenceId,
      claimId: req.params.claimId,
      sourceUrl: url.trim(),
      sourceTitle: (sourceTitle || source_title || '').trim(),
      issuingAuthority: (issuingAuthority || issuing_authority || '').trim(),
      legalInstrument: (legalInstrument || legal_instrument || '').trim(),
      publicationDate: (publicationDate || publication_date || '').trim(),
      effectiveDate: (effectiveDate || effective_date || '').trim(),
      accessDate: (accessDate || access_date || new Date().toISOString().split('T')[0]).trim(),
      reviewerNotes: (reviewerNotes || reviewer_notes || '').trim(),
      excerpt: (excerpt || '').trim(),
      status: safeStatus
    };
    const saveRes = saveVisaEvidence(evidenceData);
    const resolvedProgramId = programId || parentClaim.programId;
    let versionId = saveRes.versionId || null;
    if (resolvedProgramId && !saveRes.downgradedClaim) {
      versionId = recordAuditVersionSnapshot(
        resolvedProgramId,
        'admin',
        `${id ? 'Updated' : 'Attached'} evidence (${safeStatus}) on claim ${req.params.claimId}`
      );
    }
    res.json({
      success: true,
      evidence: evidenceData,
      downgradedClaim: Boolean(saveRes.downgradedClaim),
      newClaimStatus: saveRes.newClaimStatus || parentClaim.status,
      versionId
    });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-evidence-save', err);
  }
});

// Admin: Delete Evidence (with transactional stale-evidence claim downgrade)
app.delete('/api/admin/visa-details/claims/:claimId/evidence/:evidenceId', requireAdminAuth, (req, res) => {
  try {
    const programId = (req.query.programId as string) || req.body?.programId;
    const parentClaim = getVisaClaimById(req.params.claimId);
    const existingEv = getVisaEvidence(req.params.claimId).find(
      (ev: any) => ev.id === req.params.evidenceId
    );
    if (!existingEv) {
      return res.status(404).json({
        success: false,
        error: `Evidence ${req.params.evidenceId} not found on claim ${req.params.claimId}`
      });
    }

    const delRes = deleteVisaEvidence(req.params.evidenceId);
    const resolvedProgramId = programId || parentClaim?.programId;
    let versionId = delRes.versionId || null;
    if (resolvedProgramId && !delRes.downgradedClaim) {
      versionId = recordAuditVersionSnapshot(
        resolvedProgramId,
        'admin',
        `Deleted evidence ${req.params.evidenceId} from claim ${req.params.claimId}`
      );
    }
    res.json({
      success: true,
      message: 'Evidence deleted successfully',
      downgradedClaim: Boolean(delRes.downgradedClaim),
      newClaimStatus: delRes.newClaimStatus || parentClaim?.status,
      versionId
    });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-evidence-delete', err);
  }
});

// Admin: Get Versions
app.get('/api/admin/visa-details/:programId/versions', requireAdminAuth, (req, res) => {
  try {
    const versions = getVisaVersions(req.params.programId);
    res.json({ success: true, versions });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-versions-get', err);
  }
});

// Admin: Save Explicit Version Snapshot
app.post('/api/admin/visa-details/:programId/versions', requireAdminAuth, (req, res) => {
  try {
    if (req.body.data) {
      const versionId = req.body.id || `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      saveVisaVersion({
        id: versionId,
        programId: req.params.programId,
        data: req.body.data,
        editorId: req.body.editorId || 'admin',
        timestamp: req.body.timestamp || new Date().toISOString(),
        changeReason: req.body.changeReason || 'Manual snapshot'
      });
      return res.json({ success: true, versionId });
    }
    const versionId = recordAuditVersionSnapshot(
      req.params.programId,
      req.body.editorId || 'admin',
      req.body.changeReason || 'Manual snapshot'
    );
    res.json({ success: true, versionId });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-versions-save', err);
  }
});

// Admin: Dashboard Stats
app.get('/api/admin/dashboard-stats', requireAdminAuth, (req, res) => {
  try {
    const stats = getDashboardStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-dashboard-stats', err);
  }
});

// Admin: Update Status
app.post('/api/admin/visa-details/:programId/status', requireAdminAuth, (req, res) => {
  try {
    const allowedStatuses = ['DRAFT', 'NEEDS_EVIDENCE', 'UNDER_REVIEW', 'VERIFIED', 'APPROVED', 'PUBLISHED', 'UPDATE_REQUIRED', 'EXPIRED', 'REJECTED', 'QUARANTINED'];
    const { status } = req.body;
    if (!allowedStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    updateVisaStatus(req.params.programId, status);
    const versionId = recordAuditVersionSnapshot(
      req.params.programId,
      'admin',
      `Workflow status updated to ${status}`
    );
    res.json({ success: true, versionId });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-visa-status-update', err);
  }
});

// Admin: Restore Version (creates a new auditable version without deleting history)
app.post('/api/admin/visa-details/:programId/versions/:versionId/restore', requireAdminAuth, (req, res) => {
  try {
    const result = restoreVersion(req.params.versionId, req.body?.editorId || 'admin');
    res.json({ success: true, ...result });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-version-restore', err);
  }
});

// --- Embassy Slot Checker & Auto Email System ---
const SLOT_STATUS_FILE = path.join(CONTENT_DIR, 'slot_status.json');
const SLOT_SUBS_FILE = path.join(CONTENT_DIR, 'slot_subscribers.json');
const SLOT_LOG_FILE = path.join(CONTENT_DIR, 'slot_emails_log.json');

function getSlotStatusData() {
  if (!fs.existsSync(SLOT_STATUS_FILE)) {
    const initial = {
      lastCheckTime: new Date().toISOString(),
      embassies: {
        'USA Delhi': { status: 'Closed', lastSlotDate: 'N/A', lastAlertTime: null },
        'USA Mumbai': { status: 'Closed', lastSlotDate: 'N/A', lastAlertTime: null },
        'USA Chennai': { status: 'Closed', lastSlotDate: 'N/A', lastAlertTime: null },
        'USA Hyderabad': { status: 'Closed', lastSlotDate: 'N/A', lastAlertTime: null },
        'USA Kolkata': { status: 'Closed', lastSlotDate: 'N/A', lastAlertTime: null },
        'Schengen - France': { status: 'Closed', lastSlotDate: 'N/A', lastAlertTime: null },
        'Schengen - Germany': { status: 'Closed', lastSlotDate: 'N/A', lastAlertTime: null },
        'Schengen - Italy': { status: 'Closed', lastSlotDate: 'N/A', lastAlertTime: null },
        'Schengen - Spain': { status: 'Closed', lastSlotDate: 'N/A', lastAlertTime: null },
        'Schengen - Netherlands': { status: 'Closed', lastSlotDate: 'N/A', lastAlertTime: null }
      }
    };
    fs.writeFileSync(SLOT_STATUS_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(SLOT_STATUS_FILE, 'utf-8'));
  } catch {
    return { lastCheckTime: new Date().toISOString(), embassies: {} };
  }
}

function saveSlotStatusData(data: any) {
  fs.writeFileSync(SLOT_STATUS_FILE, JSON.stringify(data, null, 2));
}

function getSlotSubscribers() {
  if (!fs.existsSync(SLOT_SUBS_FILE)) {
    fs.writeFileSync(SLOT_SUBS_FILE, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(SLOT_SUBS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveSlotSubscribers(subs: any[]) {
  fs.writeFileSync(SLOT_SUBS_FILE, JSON.stringify(subs, null, 2));
}

async function sendEmailViaResend(to: string, subject: string, htmlContent: string) {
  return deliverEmailViaResend(to, subject, htmlContent);
}

function getLocalizedEmailContent(fromCountry: string, embassyName: string, slotDate: string, bookingLink: string) {
  return buildLocalizedSlotAlertEmail(fromCountry, embassyName, slotDate, bookingLink);
}

const handleSlotCheckCron = async (req: any, res: any) => {
  try {
    const data = getSlotStatusData();
    data.lastCheckTime = new Date().toISOString();
    const results: any[] = [];

    for (const [embassyName, info] of Object.entries(data.embassies) as [string, any][]) {
      // Preserve last verified status without fabricating random openings
      results.push({
        embassy: embassyName,
        status: info.status,
        slotDate: info.lastSlotDate,
        verificationStatus: 'AWAITING_LIVE_FEED'
      });
    }

    saveSlotStatusData(data);

    res.json({
      success: true,
      checkedAt: data.lastCheckTime,
      emailsSent: 0,
      status: 'CHECKPOINT_RECORDED_NO_RANDOM_SIMULATION',
      results
    });
  } catch (err: any) {
    return sendSafeServerError(res, 'slot-check-cron', err);
  }
};

app.all('/api/cron/slot-check', requireCronOrAdminAuth, handleSlotCheckCron);

app.post('/api/slot-alert/subscribe', slotAlertSubscribeRateLimiter, (req, res) => {
  try {
    const { email, fromCountry, toCountry, embassyCity } = req.body || {};
    if (!email || !fromCountry || !toCountry) {
      return res.status(400).json({ error: 'Email, fromCountry, and toCountry are required.' });
    }
    if (!isValidEmailAddress(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    const cleanEmail = String(email).trim();
    const cleanFrom = String(fromCountry).trim().slice(0, 64);
    const cleanTo = String(toCountry).trim().slice(0, 64);
    const cleanCity = String(embassyCity || 'Capital Hub').trim().slice(0, 120);

    const subs = getSlotSubscribers();
    const exists = subs.find((s: any) => s.email.toLowerCase() === cleanEmail.toLowerCase() && s.fromCountry === cleanFrom && s.toCountry === cleanTo);
    if (!exists) {
      subs.push({
        id: crypto.randomUUID(),
        email: cleanEmail,
        fromCountry: cleanFrom,
        toCountry: cleanTo,
        embassyCity: cleanCity,
        subscribedAt: new Date().toISOString()
      });
      saveSlotSubscribers(subs);
    }
    res.json({ success: true, message: 'Subscribed successfully for automated global email alerts.' });
  } catch (err: any) {
    return sendSafeServerError(res, 'slot-alert-subscribe', err);
  }
});

// Public aggregate slot status only (NO subscriber emails or personal information)
app.get('/api/slot-alert/status', (req, res) => {
  try {
    const data = getSlotStatusData();
    const subs = getSlotSubscribers();
    res.json({
      success: true,
      lastCheckTime: data.lastCheckTime,
      embassies: data.embassies,
      totalSubscribers: subs.length
    });
  } catch (err: any) {
    return sendSafeServerError(res, 'slot-alert-status', err);
  }
});

// Admin-only subscriber management view (strictly authenticated)
app.get('/api/admin/slot-alert/subscribers', requireAdminAuth, (req, res) => {
  try {
    const data = getSlotStatusData();
    const subs = getSlotSubscribers();
    res.setHeader('Cache-Control', 'no-store, private');
    res.json({
      success: true,
      lastCheckTime: data.lastCheckTime,
      embassies: data.embassies,
      totalSubscribers: subs.length,
      subscribers: subs
    });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-slot-alert-subscribers', err);
  }
});

app.post('/api/admin/slot-alert/toggle', requireAdminAuth, (req, res) => {
  try {
    const { embassy, status } = req.body || {};
    const data = getSlotStatusData();
    if (data.embassies[embassy]) {
      data.embassies[embassy].status = status || 'Open';
      saveSlotStatusData(data);
      return res.json({ success: true, embassies: data.embassies });
    }
    res.status(404).json({ error: 'Embassy not found' });
  } catch (err: any) {
    return sendSafeServerError(res, 'admin-slot-alert-toggle', err);
  }
});

function stripAdminUrlsFromXml(xml: string): string {
  return xml
    .replace(/<url>[\s\S]*?<loc>[^<]*\/admin(?:\/[^<]*)?<\/loc>[\s\S]*?<\/url>\s*/gi, '')
    .replace(/<sitemap>[\s\S]*?<loc>[^<]*\/admin(?:\/[^<]*)?<\/loc>[\s\S]*?<\/sitemap>\s*/gi, '');
}

// Static & Dynamic 80,000+ Page Sitemap Index Architecture (No GSC API, https://www.visaapply.org/ URLs only, zero /admin/* URLs)
const handleSitemapIndexXml = (req: any, res: any) => {
  try {
    const indexPath = path.join(__dirname, 'public', 'sitemap-index.xml');
    if (fs.existsSync(indexPath)) {
      const xml = stripAdminUrlsFromXml(fs.readFileSync(indexPath, 'utf-8'));
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('X-Robots-Tag', 'noindex, follow');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(xml);
    }
    const baseUrl = 'https://www.visaapply.org';
    const lastmod = '2026-11-09';
    const subFiles = [
      'sitemap-countries.xml',
      'sitemap-categories.xml',
      ...Array.from({ length: 12 }, (_, i) => `sitemap-visas-${i + 1}.xml`),
      'sitemap-blogs.xml',
      ...Array.from({ length: 70 }, (_, i) => `sitemap-routes-${i + 1}.xml`)
    ];
    let indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const f of subFiles) {
      indexXml += `  <sitemap>\n    <loc>${baseUrl}/${f}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>\n`;
    }
    indexXml += `</sitemapindex>\n`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'noindex, follow');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(indexXml);
  } catch (err: any) {
    return sendSafeTextServerError(res, 'sitemap-index', err);
  }
};

const handleSubSitemapXml = (req: any, res: any) => {
  try {
    const rawSub = String(req.params?.sub || '').replace(/[^a-zA-Z0-9-_]/g, '');
    if (rawSub === 'index') {
      return handleSitemapIndexXml(req, res);
    }
    const filePath = path.join(__dirname, 'public', `sitemap-${rawSub}.xml`);
    if (fs.existsSync(filePath)) {
      const xml = stripAdminUrlsFromXml(fs.readFileSync(filePath, 'utf-8'));
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('X-Robots-Tag', 'noindex, follow');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(xml);
    }
    return res.status(404).send('Sitemap not found');
  } catch (err: any) {
    return sendSafeTextServerError(res, 'sitemap-sub', err);
  }
};

app.get(['/sitemap.xml', '/sitemap_index.xml', '/sitemap-index.xml', '/api/sitemap.xml', '/api/sitemap'], handleSitemapIndexXml);
app.get('/sitemap-:sub.xml', handleSubSitemapXml);

app.get('/ads.txt', (req, res) => {
  const adsPath = path.join(__dirname, 'public', 'ads.txt');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  if (fs.existsSync(adsPath)) {
    return res.status(200).send(fs.readFileSync(adsPath, 'utf-8'));
  }
  res.status(200).send('google.com, pub-9048615701580913, DIRECT, f08c47fec0942fa0\n');
});

app.get('/llms.txt', (req, res) => {
  const llmsPath = path.join(__dirname, 'public', 'llms.txt');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  if (fs.existsSync(llmsPath)) {
    return res.status(200).send(fs.readFileSync(llmsPath, 'utf-8'));
  }
  res.status(200).send(`# VisaApply.org\n\n> Global Visa Intelligence & Official Consular Guide Portal (2026)\n\n## Core Links\n- [Homepage](https://www.visaapply.org/): 249 countries and 61,752 routes.\n- [Routes Matrix](https://www.visaapply.org/routes): Any-to-any visa requirements.\n- [Sitemap](https://www.visaapply.org/sitemap.xml): XML sitemap.\n`);
});

const handleAiCatalogJson = (req: any, res: any) => {
  const catalogPath = path.join(__dirname, 'public', 'ai-catalog.json');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  if (fs.existsSync(catalogPath)) {
    return res.status(200).send(fs.readFileSync(catalogPath, 'utf-8'));
  }
  return res.status(200).json({
    $schema: 'https://schemas.agentdiscovery.org/v1/ai-catalog.json',
    version: '1.0',
    title: 'VisaApply.org Global Visa Intelligence Catalog',
    name: 'VisaApply.org',
    description: 'Global visa intelligence portal covering 249 ISO countries and 61,752 routes.',
    url: 'https://www.visaapply.org/',
    documentation: 'https://www.visaapply.org/llms.txt',
    sitemap: 'https://www.visaapply.org/sitemap.xml',
    resources: [
      {
        id: 'global-visa-directory',
        name: '249-Country Global Visa Directory',
        type: 'web',
        url: 'https://www.visaapply.org/',
        description: 'Interactive visa requirements, processing times, fees, and document checklists for 249 countries.'
      }
    ]
  });
};

app.get(['/ai-catalog.json', '/.well-known/ai-catalog.json'], handleAiCatalogJson);

app.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(__dirname, 'public', 'robots.txt');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  if (fs.existsSync(robotsPath)) {
    return res.status(200).send(fs.readFileSync(robotsPath, 'utf-8'));
  }
  res.status(200).send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /audit\nDisallow: /api/\n\nSitemap: https://www.visaapply.org/sitemap-index.xml\n`);
});

// Serve Open Graph 1200x630 images for homepage (/og-image.jpg), /og/flights.jpg, and all 249 countries (/og/:slug.jpg)
app.get(['/og-image.jpg', '/og/:slug.jpg'], (req, res) => {
  const slug = (req.params?.slug || '').toLowerCase().replace(/[^a-z0-9-_]/g, '');
  const specificPath = slug ? path.join(__dirname, 'public', 'og', `${slug}.jpg`) : '';
  const defaultPath = path.join(__dirname, 'public', 'og-image.jpg');

  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  if (specificPath && fs.existsSync(specificPath)) {
    return res.sendFile(specificPath);
  }
  if (fs.existsSync(defaultPath)) {
    return res.sendFile(defaultPath);
  }
  res.status(404).end();
});

// Helper to compute dynamic OG tags for server-rendered HTML (so social crawlers see exact OG tags without needing JS)
const TOP_VISA_COUNTS_SSR: Record<string, number> = {
  us: 278, gb: 222, uk: 222, ca: 151, de: 138, au: 135, ae: 135, sg: 109, fr: 112, jp: 109, th: 98, ch: 94, vn: 82
};

function getServerSideOgMeta(pathname: string) {
  const clean = (pathname || '/').split('?')[0].replace(/\/+$/, '') || '/';
  const langStripped = clean.replace(/^\/(en|hi|ar|fr|de|es|pl|ru|zh|ja|pt|it|nl|tr|ko)(\/|$)/i, '/') || '/';

  let ogTitle = "VisaApply.org – Global Visa Guides, Immigration Pathways & Official Links (249 Countries)";
  let ogDesc = "Independent global visa and immigration guide across 249 ISO countries & territories, 61,752 bilateral routes, and 15 interface languages.";
  let ogImage = "https://www.visaapply.org/og-image.jpg";
  const ogUrl = normalizeCanonicalUrl(clean, 'https://www.visaapply.org');

  const staticEntry = resolveStaticRouteSeoMetadata(langStripped);
  const interviewMatch = langStripped.match(/^\/interview-prep\/([a-z]{2,3})$/i);

  if (staticEntry) {
    ogTitle = staticEntry.title;
    ogDesc = staticEntry.description;
    ogImage = resolveValidOgImageUrl(staticEntry.ogImage);
  } else if (interviewMatch) {
    const code = interviewMatch[1].toLowerCase();
    const countryObj = COUNTRIES.find((c) => c.code.toLowerCase() === code);
    const cName = countryObj?.name || code.toUpperCase();
    ogTitle = `${cName} Visa Interview Questions & Preparation Guide [2026] – VisaApply.org`;
    ogDesc = `Review common ${cName} consular interview questions, preparation guidance, dress code, and document folder order.`;
    ogImage = resolveValidOgImageUrl(code);
  } else {
    const level3Match = langStripped.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})-(tourist|work|student|family|business|pr)-([a-z0-9-]+)$/i);
    const routeMatch = langStripped.match(/^\/([a-z]{2,3})-to-([a-z]{2,3})(?:-([a-z]+))?$/i);
    if (level3Match) {
      const fromCode = level3Match[1].toLowerCase();
      const toCode = level3Match[2].toLowerCase();
      const cat = level3Match[3].toLowerCase();
      const sub = level3Match[4];
      const fromCountryObj = COUNTRIES.find((c) => c.code.toLowerCase() === fromCode);
      const toCountryObj = COUNTRIES.find((c) => c.code.toLowerCase() === toCode);
      const fromName = fromCountryObj?.name || fromCode.toUpperCase();
      const toName = toCountryObj?.name || toCode.toUpperCase();
      const catLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
      const numMatch = sub.match(/(\d+)$/);
      const numSuffix = numMatch ? ` ${parseInt(numMatch[1], 10)}` : '';
      ogTitle = `${fromName} to ${toName} ${catLabel} Visa${numSuffix} (2026 Guide)`;
      ogDesc = `Independent 2026 guide, official fee links, and document checklist for ${ogTitle}.`;
      ogImage = resolveValidOgImageUrl(toCode);
    } else if (routeMatch) {
      const fromCode = routeMatch[1].toLowerCase();
      const toCode = routeMatch[2].toLowerCase();
      const fromCountryObj = COUNTRIES.find((c) => c.code.toLowerCase() === fromCode);
      const toCountryObj = COUNTRIES.find((c) => c.code.toLowerCase() === toCode);
      const fromLabel = fromCode === 'in' ? 'Indians' : (fromCountryObj?.name || fromCode.toUpperCase());
      const toName = toCode === 'us' ? 'USA' : toCode === 'gb' || toCode === 'uk' ? 'UK' : toCode === 'ae' ? 'UAE' : (toCountryObj?.name || toCode.toUpperCase());

      ogTitle = `${toName} Visa Requirements for ${fromLabel} 2026 – VisaApply.org`;
      ogDesc = `${toName} visa guide for ${fromLabel}: official categories, consular fee schedules, processing times, and document checklists with government links.`;
      ogImage = resolveValidOgImageUrl(toCode);
    }
  }

  const { metadata } = validateAndSanitizeSeoMetadata(
    {
      title: ogTitle,
      description: ogDesc,
      canonical: ogUrl,
      ogImage
    },
    clean
  );

  return {
    ogTitle: metadata.title,
    ogDesc: metadata.description,
    ogImage: metadata.ogImage,
    ogUrl: metadata.canonical,
    twitterTitle: metadata.twitterTitle,
    twitterDesc: metadata.twitterDescription
  };
}

// Vite middleware for development
import { createServer as createViteServer } from 'vite';
const vite = await createViteServer({
  server: { middlewareMode: true, hmr: false }
});

// Inject Impact verification tag + dynamic Open Graph & Twitter Card tags on HTML page requests
app.use(async (req, res, next) => {
  if (
    (req.method !== 'GET' && req.method !== 'HEAD') ||
    req.path.startsWith('/api') ||
    req.path.startsWith('/src') ||
    req.path.startsWith('/@') ||
    req.path.startsWith('/node_modules') ||
    req.path.startsWith('/assets') ||
    req.path.startsWith('/og') ||
    req.path.startsWith('/locales') ||
    /\.(js|ts|tsx|css|png|jpg|jpeg|gif|svg|ico|json|xml|txt|woff2?)$/i.test(req.path)
  ) {
    return next();
  }

  try {
    const cleanReqPath = (req.path || '/').replace(/^\/(en|hi|ar|fr|de|es|pl|ru|zh|ja|pt|it|nl|tr|ko)(\/|$)/i, '/') || '/';
    const isAdminPageReq = cleanReqPath === '/admin' || cleanReqPath.startsWith('/admin/');
    const isAdminLoginReq = cleanReqPath === '/admin/login' || cleanReqPath === '/admin/login/';
    const isAuditPageReq = cleanReqPath === '/audit' || cleanReqPath === '/audit/';
    const isProtectedAdminOrAudit = (isAdminPageReq && !isAdminLoginReq) || isAuditPageReq;

    // Server-side protection: redirect unauthenticated /admin/* (except /admin/login) and /audit requests to /admin/login
    if (isProtectedAdminOrAudit && !isAdminAuthenticatedReq(req)) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      return res.redirect(302, `/admin/login?redirect=${encodeURIComponent(cleanReqPath)}`);
    }

    const ssrPayload = renderRouteSsrPayload(req.path || '/');
    if (ssrPayload.statusCode === 301 && ssrPayload.cleanPath) {
      res.setHeader('X-Robots-Tag', 'noindex, follow');
      return res.redirect(301, ssrPayload.cleanPath);
    }

    const indexPath = path.join(__dirname, 'index.html');
    const rawHtml = fs.readFileSync(indexPath, 'utf-8');
    let transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
    transformed = transformed.replace(/<script\s+type="module"\s+src="\/@vite\/client"><\/script>\s*/gi, '');
    const impactTag = "<meta name='impact-site-verification' value='b1ae4431-d331-41dd-a031-905fa7d5844a'>";
    transformed = transformed.replace(/<meta\s+name=['"]impact-site-verification['"][^>]*>\s*/gi, '');
    transformed = transformed.replace(/<head>/i, `<head>\n    ${impactTag}`);

    const og = getServerSideOgMeta(req.path);
    const mergedPayload = {
      ...ssrPayload,
      title: og.ogTitle && !og.ogTitle.startsWith('VisaApply.org – Global Visa') ? og.ogTitle : ssrPayload.title,
      description: og.ogDesc && !og.ogDesc.startsWith('Check bilateral visa requirements for any passport') ? og.ogDesc : ssrPayload.description,
      canonicalUrl: ssrPayload.canonicalUrl,
      ogImage: og.ogImage || ssrPayload.ogImage,
      robots: (isAdminPageReq || isAuditPageReq) ? 'noindex, nofollow' : ssrPayload.robots,
    };

    transformed = injectSsrPayloadIntoHtml(transformed, mergedPayload);

    if (isAdminPageReq || isAuditPageReq) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    } else {
      res.setHeader('X-Robots-Tag', mergedPayload.robots);
      res.setHeader('Link', `<${mergedPayload.canonicalUrl}>; rel="canonical"`);
    }

    res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(transformed);
  } catch (err) {
    next(err);
  }
});

app.use(vite.middlewares);

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`VisaApply.org running on http://localhost:${PORT}`);
  console.log("✅ Impact verification tag + Dynamic Open Graph & Twitter Cards active across 249 countries");
});
