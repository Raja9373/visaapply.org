import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  timingSafeEqualStrings,
  deriveAdminToken,
  verifyAdminPassword,
  verifyAdminToken,
  verifyCronAuth,
  applyRestrictedCorsHeaders,
} from '../src/utils/authSecurity';
import { sanitizeHtml, sanitizeUrl } from '../src/utils/htmlSanitizer';
import cronHandler from '../api/cron';
import adminHandler from '../api/admin';
import { OFFICIAL_SOURCE_REGISTRY_249 } from '../src/data/officialSourceRegistry';
import {
  PRIORITY1_AUDIT_PATHWAYS,
  PRIORITY1_GENUINE_PATHWAYS,
  PRIORITY1_QUARANTINED_PATHWAYS,
  PRIORITY1_AUDIT_SUMMARY,
  P1_P2_COLLISION_RECONCILIATION,
  getPublicPriority1Pathways,
} from '../src/data/priority1AuditData';
import { getPublicPriority2PathwayView } from '../src/data/priority2AuditData';
import { sanitizeVisaDetailsForPublic } from '../src/types/visaComprehensiveProfile';
import {
  evaluateVisaFreeEligibility,
  isVisaFree,
  isEVisaEligible,
  isVOAEligible,
  getVisaCount,
  getVisasForAnyRoute,
  getAnyToAnyRouteInfo,
} from '../src/data/anyToAnyMatrix';
import { renderRouteSsrPayload, ISO2_COUNTRY_NAMES } from '../src/utils/ssrRouteRenderer';
import { ALL_249_ISO_FORCED } from '../src/data/all249Countries';
import {
  NAME_MAP_249,
  FLAG_MAP_249,
  REGIONAL_GROUPINGS,
  verifyNoVisaMissed,
} from '../src/data/fullVisaDatabase';

function createMockRes() {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  let body: any = null;
  let ended = false;
  const res: any = {
    setHeader(k: string, v: string) {
      headers[k.toLowerCase()] = v;
      return res;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(payload: any) {
      body = payload;
      ended = true;
      return res;
    },
    end() {
      ended = true;
      return res;
    },
    get _status() {
      return statusCode;
    },
    get _headers() {
      return headers;
    },
    get _body() {
      return body;
    },
    get _ended() {
      return ended;
    },
  };
  return res;
}

test('Auth & Cron security: fail-closed CRON_SECRET, timing-safe passwords, method guards, restricted CORS', async () => {
  const prevCron = process.env.CRON_SECRET;
  const prevAdmin = process.env.ADMIN_PASSWORD;
  const prevGemini = process.env.GEMINI_API_KEY;

  try {
    // 1. Timing-safe equal handles unequal length without throwing
    assert.equal(timingSafeEqualStrings('short', 'much-longer-string'), false);
    assert.equal(timingSafeEqualStrings('exact-match-123', 'exact-match-123'), true);
    assert.equal(timingSafeEqualStrings('', ''), false);

    // 2. Cron fails closed with 503 when CRON_SECRET unset
    delete process.env.CRON_SECRET;
    delete process.env.ADMIN_PASSWORD;
    const unconfigured = verifyCronAuth({ method: 'GET', headers: {} });
    assert.equal(unconfigured.authorized, false);
    assert.equal(unconfigured.statusCode, 503);
    assert.equal(unconfigured.status, 'CONFIG_ERROR');

    // 3. Cron rejects unsupported HTTP method (405)
    process.env.CRON_SECRET = 'super-cron-secret-value';
    const badMethod = verifyCronAuth({ method: 'DELETE', headers: { authorization: 'Bearer super-cron-secret-value' } });
    assert.equal(badMethod.authorized, false);
    assert.equal(badMethod.statusCode, 405);

    // 4. Cron rejects invalid secret (401) and accepts valid secret (200)
    const badSecret = verifyCronAuth({ method: 'POST', headers: { authorization: 'Bearer wrong' } });
    assert.equal(badSecret.authorized, false);
    assert.equal(badSecret.statusCode, 401);

    const goodSecret = verifyCronAuth({ method: 'POST', headers: { 'x-cron-secret': 'super-cron-secret-value' } });
    assert.equal(goodSecret.authorized, true);
    assert.equal(goodSecret.statusCode, 200);

    // 5. api/cron.ts handler rejects missing GEMINI_API_KEY with 503 (never fabricates fake drafts)
    delete process.env.GEMINI_API_KEY;
    const cronReq: any = {
      method: 'POST',
      headers: {
        origin: 'https://evil.attacker.test',
        authorization: 'Bearer super-cron-secret-value',
      },
    };
    const cronRes = createMockRes();
    await cronHandler(cronReq, cronRes);
    assert.equal(cronRes._status, 503);
    assert.equal(cronRes._body.success, false);
    assert.equal(cronRes._headers['access-control-allow-origin'], undefined);

    // Allowed origin is reflected properly
    const allowedCorsRes = createMockRes();
    applyRestrictedCorsHeaders({ headers: { origin: 'https://www.visaapply.org' } }, allowedCorsRes);
    assert.equal(allowedCorsRes._headers['access-control-allow-origin'], 'https://www.visaapply.org');

    // 6. api/admin.ts handles malformed JSON (400), bad password (401), valid login (200) + token verify
    process.env.ADMIN_PASSWORD = 'very-secure-admin-password';
    const badJsonRes = createMockRes();
    adminHandler({ method: 'POST', headers: {}, body: '{invalid json' } as any, badJsonRes);
    assert.equal(badJsonRes._status, 400);

    const wrongPassRes = createMockRes();
    adminHandler({ method: 'POST', headers: {}, body: { password: 'nope' } } as any, wrongPassRes);
    assert.equal(wrongPassRes._status, 401);
    assert.equal(wrongPassRes._body.authenticated, false);

    const okPassRes = createMockRes();
    adminHandler({ method: 'POST', headers: {}, body: { password: 'very-secure-admin-password' } } as any, okPassRes);
    assert.equal(okPassRes._status, 200);
    assert.equal(okPassRes._body.authenticated, true);
    assert.equal(verifyAdminPassword('very-secure-admin-password'), true);
    assert.equal(verifyAdminToken(okPassRes._body.token), true);
    assert.equal(okPassRes._body.token, deriveAdminToken('very-secure-admin-password'));
  } finally {
    if (prevCron === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = prevCron;
    if (prevAdmin === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = prevAdmin;
    if (prevGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = prevGemini;
  }
});

test('XSS & URL sanitization: neutralizes scripts, handlers, javascript:/data: URLs, and protocol-relative URLs', () => {
  const dirtyHtml = `
    <h2>Guide Title</h2>
    <script>alert('xss')</script>
    <svg onload="fetch('https://evil.com')"><circle /></svg>
    <p onclick="steal()">Safe text <a href="javascript:alert(1)">Bad Link</a></p>
    <p><a href="https://www.gov.uk/scale-up-worker-visa" title="Official">UK Gov</a></p>
    <iframe src="https://evil.com"></iframe>
    <img src="x" onerror="alert(2)" />
  `;
  const clean = sanitizeHtml(dirtyHtml);
  assert.equal(clean.includes('<script'), false);
  assert.equal(clean.includes('<svg'), false);
  assert.equal(clean.includes('<iframe'), false);
  assert.equal(clean.includes('<img'), false);
  assert.equal(clean.includes('onclick'), false);
  assert.equal(clean.includes('onerror'), false);
  assert.equal(clean.includes('javascript:'), false);
  assert.equal(clean.includes('<h2>Guide Title</h2>'), true);
  assert.equal(clean.includes('href="https://www.gov.uk/scale-up-worker-visa"'), true);
  assert.equal(clean.includes('rel="noopener noreferrer"'), true);

  assert.equal(sanitizeUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeUrl('&#x6a;avascript:alert(1)'), '');
  assert.equal(sanitizeUrl('data:text/html,<script>alert(1)</script>'), '');
  assert.equal(sanitizeUrl('//evil.example/phish'), '');
  assert.equal(sanitizeUrl('/in-to-us'), '/in-to-us');
  assert.equal(sanitizeUrl('/in-to-us', { allowRelative: false }), '');
  assert.equal(sanitizeUrl('https://travel.state.gov/us-visas'), 'https://travel.state.gov/us-visas');
});

test('Codebase runtime safety checks: no chatbot dangerouslySetInnerHTML, no unauthenticated admin/audit routes, no gemini-3.8-flash/wikipedia/personal Gmail', () => {
  const root = process.cwd();
  const readRel = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf-8');

  const chatbotSrc = readRel('src/components/VisaChatbot.tsx');
  assert.equal(chatbotSrc.includes('dangerouslySetInnerHTML'), false);
  assert.equal(chatbotSrc.includes('₹6,500 ($80)'), false);

  const blogViewSrc = readRel('src/components/BlogArticleView.tsx');
  assert.equal(blogViewSrc.includes('sanitizeHtml('), true);
  assert.equal(blogViewSrc.includes('sanitizeUrl('), true);

  const appSrc = readRel('src/App.tsx');
  // All 5 admin global tabs and /audit must not render unauthenticated outside {isAnyAdminRoute ? (
  assert.equal(appSrc.includes('intendedPath="/audit"'), true);
  const adminBranchStart = appSrc.indexOf('{isAnyAdminRoute ? (');
  assert.ok(adminBranchStart > 0);
  const beforeAdminBranch = appSrc.slice(0, adminBranchStart);
  assert.equal(beforeAdminBranch.includes('<GlobalDataCoveragePage'), false);
  assert.equal(beforeAdminBranch.includes('<GlobalVerificationPilotPage'), false);
  assert.equal(beforeAdminBranch.includes('<EvidenceTraceabilityPage'), false);
  assert.equal(beforeAdminBranch.includes('<OfficialSourceMonitoringPage'), false);
  assert.equal(beforeAdminBranch.includes('<GlobalVisaCoverageAuditPage'), false);

  const serverSrc = readRel('server.ts');
  assert.equal(serverSrc.includes("cleanReqPath === '/audit'"), true);
  assert.equal(serverSrc.includes('isProtectedAdminOrAudit'), true);
  // /api/cron/slot-check must no longer synthesize slots via Math.random()
  const slotCheckSection = serverSrc.slice(serverSrc.indexOf('/api/cron/slot-check'));
  assert.equal(slotCheckSection.includes('Math.random()'), false);

  // Zero legacy gemini-3.8-flash, wikipedia.org, or hardcoded Gmail in active runtime files
  const runtimeFiles = [
    'server.ts',
    'api/cron.ts',
    'api/admin.ts',
    'src/api/faq.ts',
    'src/api/aiEligibility.ts',
    'src/data/officialSourceRegistry.ts',
    'src/services/immigrationAutoSync.ts',
    'src/pages/ImmigrationUpdatesPage.tsx',
    'src/data/immigrationChangelog.json',
  ];
  for (const rel of runtimeFiles) {
    const content = readRel(rel);
    assert.equal(content.includes('gemini-3.8-flash'), false, `Found gemini-3.8-flash in ${rel}`);
    assert.equal(content.includes('wikipedia.org'), false, `Found wikipedia.org in ${rel}`);
    assert.equal(content.includes('maddydelhi57@gmail.com'), false, `Found hardcoded personal Gmail in ${rel}`);
  }

  // Unverified countries in OFFICIAL_SOURCE_REGISTRY_249 must not invent www.gov.<cc>/immigration URLs
  assert.equal(Object.keys(OFFICIAL_SOURCE_REGISTRY_249).length, 249);
  const ugEntry = OFFICIAL_SOURCE_REGISTRY_249['UG'];
  assert.ok(ugEntry);
  assert.equal(ugEntry.primaryGovUrl, '');
  assert.equal(ugEntry.sourceAccessStatus, 'AWAITING_OFFICIAL_SOURCE_VERIFICATION');
});

test('Priority 1 quarantine & P1/P2 collision reconciliation', () => {
  assert.equal(PRIORITY1_AUDIT_PATHWAYS.length, 142);
  assert.equal(PRIORITY1_GENUINE_PATHWAYS.length, 10);
  assert.equal(PRIORITY1_QUARANTINED_PATHWAYS.length, 132);
  assert.equal(getPublicPriority1Pathways().length, 10);

  for (const synth of PRIORITY1_QUARANTINED_PATHWAYS) {
    assert.equal(synth.verificationStatus, 'QUARANTINED');
    assert.equal(synth.isQuarantined, true);
    assert.equal(synth.publicEligible, false);
    assert.equal(synth.quarantinedSynthetic, true);
    assert.equal(
      synth.sections.some((s) => s.status === 'VERIFIED'),
      false,
      `Quarantined pathway ${synth.id} must not have VERIFIED sections`
    );
  }

  assert.equal(PRIORITY1_AUDIT_SUMMARY.genuineHandAuthoredPathways, 10);
  assert.equal(PRIORITY1_AUDIT_SUMMARY.quarantinedSyntheticPathways, 132);
  assert.equal(PRIORITY1_AUDIT_SUMMARY.fullyEvidenceBackedPathways, 10);

  assert.equal(P1_P2_COLLISION_RECONCILIATION.length, 2);
  const p1Ids = P1_P2_COLLISION_RECONCILIATION.map((c) => c.priority1Id).sort();
  const p2Ids = P1_P2_COLLISION_RECONCILIATION.map((c) => c.priority2Id).sort();
  assert.deepEqual(p1Ids, ['p1-gb-scaleup', 'p1-sg-onepass']);
  assert.deepEqual(p2Ids, ['p2-sg-onepass', 'p2-uk-scaleup']);
});

test('Public sanitization: strips internal metadata, preserves normalized claims, suppresses unverified/rejected claims', () => {
  const sanitized = sanitizeVisaDetailsForPublic({
    programId: 'AU-482',
    countryName: 'Australia',
    visaName: 'Skills in Demand Visa',
    verificationStatus: 'AWAITING_VERIFICATION',
    reviewerNotes: 'SECRET INTERNAL NOTE',
    internalReviewNotes: 'DO NOT EXPOSE',
    rawOverview: 'Unverified raw paragraph that must not leak',
    overview: 'Top-level overview that must be withheld while program is AWAITING_VERIFICATION',
    claims: [
      {
        claimId: 'CLM-VERIFIED-1',
        section: 'eligibility',
        description: 'Valid statutory rule',
        status: 'VERIFIED',
        reviewer: 'internal-reviewer-99',
        reviewerNotes: 'Strip this nested note',
        evidence: [
          {
            id: 'EVD-1',
            sourceTitle: 'Home Affairs',
            sourceUrl: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing',
            issuingAuthority: 'Department of Home Affairs',
            legalInstrument: 'Migration Regulations 1994',
            accessDate: '2026-11-10',
            excerpt: 'Official rule excerpt',
            status: 'VERIFIED_OFFICIAL',
          },
        ],
      },
      {
        id: 'CLM-REJECTED-1',
        section: 'fees',
        description: 'Rejected claim',
        status: 'REJECTED',
      },
      {
        id: 'CLM-QUARANTINED-1',
        section: 'fees',
        description: 'Quarantined claim',
        status: 'VERIFIED',
        isQuarantined: true,
      },
      {
        id: 'CLM-NOT-PUBLIC',
        section: 'fees',
        description: 'Non-public claim',
        status: 'VERIFIED',
        publicEligible: false,
      },
      {
        id: 'CLM-AWAITING-1',
        section: 'processing',
        description: 'Awaiting verification claim',
        status: 'AWAITING_VERIFICATION',
      },
      {
        id: '',
        section: 'processing',
        description: 'Nameless claim',
        status: 'VERIFIED',
      },
    ],
  });

  const serialized = JSON.stringify(sanitized);
  assert.equal(serialized.includes('SECRET INTERNAL NOTE'), false);
  assert.equal(serialized.includes('DO NOT EXPOSE'), false);
  assert.equal(serialized.includes('internal-reviewer-99'), false);
  assert.equal(serialized.includes('Strip this nested note'), false);
  assert.equal(serialized.includes('Unverified raw paragraph'), false);
  assert.equal(sanitized.overview, undefined);
  assert.deepEqual(sanitized.visaOverview, {});

  assert.equal(sanitized.claims.length, 1);
  assert.equal(sanitized.claims[0].claimId, 'CLM-VERIFIED-1');
  assert.equal(sanitized.claims[0].id, 'CLM-VERIFIED-1');
  assert.equal(sanitized.claims[0].canPresentAsVerified, true);
  assert.ok(sanitized.suppressedClaimsSummary.quarantinedOrExcludedCount >= 4);
  assert.equal(sanitized.suppressedClaimsSummary.awaitingVerificationCount, 1);

  // getPublicPriority2PathwayView blocks NOT_OFFERED and strips correctiveClassificationNotes
  assert.equal(getPublicPriority2PathwayView('p2-non-existent-id'), null);
  const validP2 = getPublicPriority2PathwayView('p2-us-h2a');
  if (validP2) {
    assert.equal('correctiveClassificationNotes' in validP2, false);
  }
});

test('Route matrix & SSR honesty: zero hash-invented fees/counts, context-aware visa-free evaluation', () => {
  // 1. Unknown passport nationality / type must return false / UNKNOWN
  const unknownNat = evaluateVisaFreeEligibility('', 'th', { passportNationality: 'UNKNOWN' });
  assert.equal(unknownNat.visaFree, false);
  assert.equal(unknownNat.eligibilityStatus, 'UNKNOWN');

  const unknownType = evaluateVisaFreeEligibility('us', 'fr', { passportType: 'UNKNOWN' });
  assert.equal(unknownType.visaFree, false);
  assert.equal(unknownType.eligibilityStatus, 'UNKNOWN');

  // 2. Third-country residence permit cannot be conflated with citizenship
  const resPermit = evaluateVisaFreeEligibility('ae', 'sa', { hasThirdCountryResidencePermit: true });
  assert.equal(resPermit.visaFree, false);
  assert.equal(resPermit.eligibilityStatus, 'AWAITING_VERIFICATION');

  // 3. Work/Study/Residence purpose does not return short-stay visa-free true
  assert.equal(isVisaFree('in', 'th', { entryPurpose: 'WORK' }), false);
  assert.equal(isVisaFree('us', 'ae', { entryPurpose: 'RESIDENCE' }), false);

  // 4. Unverified arbitrary non-India corridors fail closed instead of guessing
  assert.equal(isVisaFree('br', 'jp'), false);
  assert.equal(isEVisaEligible('br', 'au'), false);
  assert.equal(isVOAEligible('br', 'th'), false);
  assert.equal(getVisaCount('gb', 'au'), 0);
  assert.equal(getVisaCount('de', 'jp'), 0);
  assert.deepEqual(getVisasForAnyRoute('gb', 'au'), []);

  // Curated corridors report exact curated record counts
  assert.equal(getVisaCount('ae', 'us'), 3);
  assert.equal(getVisasForAnyRoute('ae', 'us').length, 3);
  const routeInfo = getAnyToAnyRouteInfo('br', 'jp');
  assert.equal(routeInfo.countsVerified, false);
  assert.equal(routeInfo.eligibilityStatus, 'AWAITING_VERIFICATION');

  // 5. SSR renderer must not emit fabricated `$XX USD (Consular Base Fee)` or `$XX USD Equivalent`
  const ssrUnverified = renderRouteSsrPayload('/br-to-jp');
  assert.equal(ssrUnverified.statusCode, 200);
  assert.equal(/\$\d+ USD \(Consular Base Fee\)/i.test(ssrUnverified.ssrBodyHtml), false);
  assert.equal(/\$\d+ USD Equivalent/i.test(ssrUnverified.ssrBodyHtml), false);
  assert.equal(ssrUnverified.ssrBodyHtml.includes('Verify on Official Destination Government / Embassy Portal'), true);
});

test('Country registry alignment: exact 249 ISO 3166-1 alpha-2 codes across all registries, eu separated', () => {
  assert.equal(ALL_249_ISO_FORCED.length, 249);
  const forcedSet = new Set(ALL_249_ISO_FORCED.map((c) => c.code.toLowerCase()));
  const iso2Set = new Set(Object.keys(ISO2_COUNTRY_NAMES).map((c) => c.toLowerCase()));
  const nameMapSet = new Set(Object.keys(NAME_MAP_249).map((c) => c.toLowerCase()));
  const flagMapSet = new Set(Object.keys(FLAG_MAP_249).map((c) => c.toLowerCase()));

  assert.equal(forcedSet.size, 249);
  assert.equal(iso2Set.size, 249);
  assert.equal(nameMapSet.size, 249);
  assert.equal(flagMapSet.size, 249);

  for (const requiredCode of ['bi', 'gp', 'sv']) {
    assert.equal(forcedSet.has(requiredCode), true, `ALL_249_ISO_FORCED missing ${requiredCode}`);
    assert.equal(iso2Set.has(requiredCode), true, `ISO2_COUNTRY_NAMES missing ${requiredCode}`);
    assert.equal(nameMapSet.has(requiredCode), true, `NAME_MAP_249 missing ${requiredCode}`);
    assert.equal(flagMapSet.has(requiredCode), true, `FLAG_MAP_249 missing ${requiredCode}`);
  }

  // Regional 'eu' must be excluded from country maps and present in REGIONAL_GROUPINGS
  assert.equal(forcedSet.has('eu'), false);
  assert.equal(nameMapSet.has('eu'), false);
  assert.equal(flagMapSet.has('eu'), false);
  assert.equal(REGIONAL_GROUPINGS.eu.code, 'eu');

  // Exact set equality check
  for (const code of iso2Set) {
    assert.equal(forcedSet.has(code), true, `ALL_249_ISO_FORCED missing ${code}`);
    assert.equal(nameMapSet.has(code), true, `NAME_MAP_249 missing ${code}`);
    assert.equal(flagMapSet.has(code), true, `FLAG_MAP_249 missing ${code}`);
  }

  const dbCheck = verifyNoVisaMissed();
  assert.equal(dbCheck.isValid, true);
});
