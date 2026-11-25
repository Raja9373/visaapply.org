import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  detectProhibitedPublicSecretsOrPii,
  type ClaimRecord,
  type ImmigrationProgramRecord
} from '../src/schemas/catalogSchemas';
import {
  PHASE5B_MONITORING_SCHEMA_VERSION,
  validateClaimVerificationReviewRecord,
  validateEvidenceProposalRecord,
  validateMonitoredSourceRegistryEntry,
  type ClaimVerificationReviewRecord,
  type MonitoredSourceRegistryEntry
} from '../src/schemas/sourceMonitoringSchemas';
import {
  acquireMonitoringRunLock,
  buildMonitoredRegistryFromCanonical,
  detectMissedScheduledRuns,
  getLatestScheduledSlotUtc,
  isBlockedIpAddress,
  isPathAllowedByRobots,
  normalizeOfficialContentForFingerprint,
  parseRobotsTxtForAgent,
  releaseMonitoringRunLock,
  runOfficialSourceMonitoring,
  validateOutboundMonitorUrl,
  type MonitorHttpFetcher
} from '../scripts/lib/officialSourceMonitor';
import {
  computeAffectedProgramIdsForSourceFailure,
  evaluateClaimTrustAndQuarantine,
  evaluatePublicationApprovalGate,
  processMonitoringReportForChangesAndQuarantine
} from '../scripts/lib/changeEvidenceQuarantineEngine';
import { executeSourceMonitoringPipeline } from '../scripts/monitorOfficialSources';
import { generateDataQualityReport } from '../scripts/generateDataQualityReport';
import { runSafeCatalogRegeneration } from '../scripts/runSafeCatalogRegeneration';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

function sha256File(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function makeSampleSource(overrides: Partial<MonitoredSourceRegistryEntry> = {}): MonitoredSourceRegistryEntry {
  return {
    schemaVersion: PHASE5B_MONITORING_SCHEMA_VERSION,
    sourceId: 'SRC-US-USCIS-TEST',
    countryIso: 'US',
    officialGovernmentAuthority: 'U.S. Citizenship and Immigration Services',
    sourceUrl: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
    sourceCategory: 'GOVERNMENT_VISA_PORTAL',
    language: 'en',
    sourceType: 'IMMIGRATION_DEPARTMENT',
    authorityTier: 'OFFICIAL_GOVERNMENT',
    lastCheckedTimestamp: null,
    lastSuccessfulVerificationTimestamp: null,
    httpStatus: null,
    contentFingerprint: null,
    structureSignature: null,
    currentSourceStatus: 'AWAITING_INITIAL_CHECK',
    consecutiveFailures: 0,
    redirectTargetUrl: null,
    verificationNotes: 'Test official source',
    ...overrides
  };
}

function makeSampleClaimReview(
  overrides: Partial<ClaimVerificationReviewRecord> = {}
): ClaimVerificationReviewRecord {
  return {
    schemaVersion: PHASE5B_MONITORING_SCHEMA_VERSION,
    claimId: 'CL-5BTEST0001',
    programId: 'us-h1b-specialty',
    countryIso: 'US',
    claimCategory: 'GOVERNMENT_FEES',
    riskClass: 'HIGH_RISK_LEGAL_OR_ELIGIBILITY',
    claimText: 'H-1B Form I-129 filing fee schedule verified from USCIS fee rule.',
    officialSourceId: 'SRC-US-USCIS-U-S-DEPARTMENT-OF-LABOR-DOL',
    sourceAuthorityTier: 'OFFICIAL_GOVERNMENT',
    evidenceUrl: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
    evidenceExcerpt: 'Official USCIS Form I-129 statutory filing fee guidance.',
    retrievalTimestamp: '2026-11-25T03:00:00Z',
    effectiveDate: '2026-04-01',
    verificationStatus: 'CLAIM_AWAITING_REVIEW',
    reviewerStatus: 'PENDING_HUMAN_REVIEW',
    reviewedBy: null,
    reviewedAt: null,
    previousValue: '$460',
    proposedNewValue: '$780',
    isAiGeneratedProposal: false,
    isUnverifiedTranslation: false,
    conflictingOfficialSourceIds: [],
    expiresAt: null,
    ...overrides
  };
}

const SAFE_PUBLIC_DNS = async () => ['23.56.10.20'];
const NOOP_SLEEP = async () => {};

// ============================================================================
// TEST 1: Official Source Validation & Outbound URL/IP Safety Guards
// ============================================================================
test('1. Official source validation rejects unofficial domains, non-HTTPS, credentials & private/metadata IPs', async () => {
  // Valid official sovereign source passes
  const validEntry = validateMonitoredSourceRegistryEntry(makeSampleSource());
  assert.equal(validEntry.success, true);

  // Commercial agency / blog / forum rejected as OFFICIAL_GOVERNMENT
  const agencyEntry = validateMonitoredSourceRegistryEntry(
    makeSampleSource({ sourceUrl: 'https://www.ivisa.com/usa-visa', authorityTier: 'OFFICIAL_GOVERNMENT' })
  );
  assert.equal(agencyEntry.success, false);

  const blogEntry = validateMonitoredSourceRegistryEntry(
    makeSampleSource({ sourceUrl: 'https://medium.com/visa-tips', authorityTier: 'OFFICIAL_GOVERNMENT' })
  );
  assert.equal(blogEntry.success, false);

  // Discovery leads may be stored as DISCOVERY_LEAD_ONLY, but are skipped by authoritative monitor
  const leadEntry = validateMonitoredSourceRegistryEntry(
    makeSampleSource({ sourceUrl: 'https://example-news.org/immigration-lead', authorityTier: 'DISCOVERY_LEAD_ONLY' })
  );
  assert.equal(leadEntry.success, true);

  // Private, loopback, link-local, metadata, IPv4-mapped IPv6 addresses blocked
  assert.equal(isBlockedIpAddress('127.0.0.1'), true);
  assert.equal(isBlockedIpAddress('10.0.0.5'), true);
  assert.equal(isBlockedIpAddress('172.16.4.1'), true);
  assert.equal(isBlockedIpAddress('192.168.1.10'), true);
  assert.equal(isBlockedIpAddress('169.254.169.254'), true);
  assert.equal(isBlockedIpAddress('::1'), true);
  assert.equal(isBlockedIpAddress('::ffff:127.0.0.1'), true);
  assert.equal(isBlockedIpAddress('::ffff:169.254.169.254'), true);
  assert.equal(isBlockedIpAddress('23.56.10.20'), false);

  // Outbound URL check blocks HTTP, credentials, and DNS resolving to private/metadata IPs
  const httpRes = await validateOutboundMonitorUrl('http://www.uscis.gov/', { resolveHostIps: SAFE_PUBLIC_DNS });
  assert.equal(httpRes.safe, false);

  const credsRes = await validateOutboundMonitorUrl('https://user:pass@www.uscis.gov/', { resolveHostIps: SAFE_PUBLIC_DNS });
  assert.equal(credsRes.safe, false);

  const metadataDnsRes = await validateOutboundMonitorUrl('https://www.uscis.gov/', {
    resolveHostIps: async () => ['169.254.169.254']
  });
  assert.equal(metadataDnsRes.safe, false);

  // Canonical repository registry has 61 valid official HTTPS sources
  const canonicalRegistry = buildMonitoredRegistryFromCanonical(DATA_DIR);
  assert.equal(canonicalRegistry.length, 61);
  for (const entry of canonicalRegistry) {
    assert.equal(validateMonitoredSourceRegistryEntry(entry).success, true, `Canonical source ${entry.sourceId} must validate`);
  }
});

// ============================================================================
// TEST 2: HTTP Error Handling, Timeouts, TLS, Anti-Bot/CAPTCHA (Never Closure!)
// ============================================================================
test('2. HTTP 403/404/429/5xx, timeouts, TLS errors & anti-bot/CAPTCHA are handled safely without implying closure', async () => {
  const sources = [
    makeSampleSource({ sourceId: 'SRC-US-CASE-403', sourceUrl: 'https://www.uscis.gov/case-403' }),
    makeSampleSource({ sourceId: 'SRC-US-CASE-404', sourceUrl: 'https://www.uscis.gov/case-404' }),
    makeSampleSource({ sourceId: 'SRC-US-CASE-429', sourceUrl: 'https://www.uscis.gov/case-429' }),
    makeSampleSource({ sourceId: 'SRC-US-CASE-503', sourceUrl: 'https://www.uscis.gov/case-503' }),
    makeSampleSource({ sourceId: 'SRC-US-CASE-TIMEOUT', sourceUrl: 'https://www.uscis.gov/case-timeout' }),
    makeSampleSource({ sourceId: 'SRC-US-CASE-TLS', sourceUrl: 'https://www.uscis.gov/case-tls' }),
    makeSampleSource({ sourceId: 'SRC-US-CASE-CAPTCHA', sourceUrl: 'https://www.uscis.gov/case-captcha' }),
    makeSampleSource({ sourceId: 'SRC-US-LEAD', sourceUrl: 'https://news.example.org/visa', authorityTier: 'DISCOVERY_LEAD_ONLY' })
  ];

  const mockFetcher: MonitorHttpFetcher = async (url) => {
    if (url.endsWith('/robots.txt')) return { status: 404, headers: {}, bodyText: '' };
    if (url.endsWith('/case-403')) return { status: 403, headers: {}, bodyText: 'Forbidden' };
    if (url.endsWith('/case-404')) return { status: 404, headers: {}, bodyText: 'Not Found' };
    if (url.endsWith('/case-429')) return { status: 429, headers: { 'retry-after': '120' }, bodyText: 'Too Many Requests' };
    if (url.endsWith('/case-503')) return { status: 503, headers: {}, bodyText: 'Service Temporarily Unavailable' };
    if (url.endsWith('/case-timeout')) throw new Error('AbortError: REQUEST_TIMEOUT');
    if (url.endsWith('/case-tls')) throw new Error('UNABLE_TO_VERIFY_LEAF_SIGNATURE: TLS cert expired');
    if (url.endsWith('/case-captcha')) {
      return {
        status: 403,
        headers: { 'cf-mitigated': 'challenge' },
        bodyText: '<html><title>Just a moment...</title><div>Checking your browser before accessing</div></html>'
      };
    }
    return { status: 200, headers: { 'content-type': 'text/html' }, bodyText: '<html>OK</html>' };
  };

  const { report } = await runOfficialSourceMonitoring({
    sources,
    now: new Date('2026-11-25T21:30:00Z'),
    fetcher: mockFetcher,
    resolveHostIps: SAFE_PUBLIC_DNS,
    sleep: NOOP_SLEEP,
    perHostIntervalMs: 0
  });

  const byId = new Map(report.results.map((r) => [r.sourceId, r]));
  assert.equal(byId.get('SRC-US-CASE-403')?.outcome, 'HTTP_403_FORBIDDEN');
  assert.equal(byId.get('SRC-US-CASE-404')?.outcome, 'HTTP_404_NOT_FOUND');
  assert.equal(byId.get('SRC-US-CASE-429')?.outcome, 'HTTP_429_RATE_LIMITED');
  assert.equal(byId.get('SRC-US-CASE-503')?.outcome, 'HTTP_5XX_SERVER_ERROR');
  assert.equal(byId.get('SRC-US-CASE-TIMEOUT')?.outcome, 'TIMEOUT');
  assert.equal(byId.get('SRC-US-CASE-TLS')?.outcome, 'TLS_CERTIFICATE_ERROR');
  assert.equal(byId.get('SRC-US-CASE-CAPTCHA')?.outcome, 'ANTI_BOT_OR_CAPTCHA_DETECTED');
  assert.equal(byId.get('SRC-US-CASE-CAPTCHA')?.antiBotDetected, true);
  assert.equal(byId.get('SRC-US-LEAD')?.outcome, 'DISCOVERY_LEAD_SKIPPED');

  // Critical invariant: ZERO failed checks may ever imply program closure
  for (const r of report.results) {
    assert.equal(r.impliesProgramClosure, false);
  }
});

// ============================================================================
// TEST 3: Redirect Handling (Official Same-Authority vs Suspicious Third-Party)
// ============================================================================
test('3. Redirects within official authority succeed while suspicious cross-domain redirects trigger record-level quarantine', async () => {
  const sources = [
    makeSampleSource({ sourceId: 'SRC-US-REDIR-OK', sourceUrl: 'https://uscis.gov/h1b-old' }),
    makeSampleSource({ sourceId: 'SRC-US-REDIR-BAD', sourceUrl: 'https://www.uscis.gov/hijacked-path' })
  ];

  const mockFetcher: MonitorHttpFetcher = async (url) => {
    if (url.endsWith('/robots.txt')) return { status: 404, headers: {}, bodyText: '' };
    if (url === 'https://uscis.gov/h1b-old') {
      return {
        status: 301,
        headers: { location: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations' },
        bodyText: ''
      };
    }
    if (url === 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations') {
      return { status: 200, headers: { 'content-type': 'text/html' }, bodyText: '<main><h1>H-1B Visa</h1></main>' };
    }
    if (url === 'https://www.uscis.gov/hijacked-path') {
      return { status: 302, headers: { location: 'https://www.ivisa.com/commercial-offer' }, bodyText: '' };
    }
    return { status: 404, headers: {}, bodyText: '' };
  };

  const { report } = await runOfficialSourceMonitoring({
    sources,
    now: new Date('2026-11-25T21:30:00Z'),
    fetcher: mockFetcher,
    resolveHostIps: SAFE_PUBLIC_DNS,
    sleep: NOOP_SLEEP,
    perHostIntervalMs: 0
  });

  const okRes = report.results.find((r) => r.sourceId === 'SRC-US-REDIR-OK');
  const badRes = report.results.find((r) => r.sourceId === 'SRC-US-REDIR-BAD');
  assert.equal(okRes?.outcome, 'REDIRECTED_OFFICIAL');
  assert.equal(okRes?.redirectChain.length, 1);
  assert.equal(badRes?.outcome, 'REDIRECTED_SUSPICIOUS');

  const bundle = processMonitoringReportForChangesAndQuarantine({ report, programs: [], claims: [] });
  assert.equal(bundle.recordQuarantines.length, 1);
  assert.equal(bundle.recordQuarantines[0].entityId, 'SRC-US-REDIR-BAD');
  assert.equal(bundle.recordQuarantines[0].triggerCode, 'SUSPICIOUS_OR_UNEXPECTED_REDIRECT');
  assert.equal(bundle.recordQuarantines[0].entireCountryQuarantined, false);
});

// ============================================================================
// TEST 4: Robots.txt Compliance
// ============================================================================
test('4. robots.txt Disallow rules are parsed and strictly respected without bypassing', async () => {
  const policy = parseRobotsTxtForAgent(`
User-agent: *
Disallow: /private-portal/
Allow: /private-portal/public-guide
Crawl-delay: 2
  `);
  assert.equal(isPathAllowedByRobots('/private-portal/apply', policy), false);
  assert.equal(isPathAllowedByRobots('/private-portal/public-guide', policy), true);
  assert.equal(isPathAllowedByRobots('/visas/h1b', policy), true);
  assert.equal(policy.crawlDelayMs, 2000);

  let fetchedBlockedTarget = false;
  const mockFetcher: MonitorHttpFetcher = async (url) => {
    if (url.endsWith('/robots.txt')) {
      return { status: 200, headers: { 'content-type': 'text/plain' }, bodyText: 'User-agent: *\nDisallow: /restricted/\n' };
    }
    if (url.includes('/restricted/')) fetchedBlockedTarget = true;
    return { status: 200, headers: { 'content-type': 'text/html' }, bodyText: '<main>OK</main>' };
  };

  const { report } = await runOfficialSourceMonitoring({
    sources: [makeSampleSource({ sourceId: 'SRC-US-ROBOTS', sourceUrl: 'https://www.uscis.gov/restricted/fees' })],
    now: new Date('2026-11-25T21:30:00Z'),
    fetcher: mockFetcher,
    resolveHostIps: SAFE_PUBLIC_DNS,
    sleep: NOOP_SLEEP,
    perHostIntervalMs: 0
  });

  assert.equal(fetchedBlockedTarget, false, 'Monitor must NEVER fetch a robots-disallowed path');
  assert.equal(report.results[0].outcome, 'ROBOTS_DISALLOWED');
  assert.equal(report.results[0].robotsAllowed, false);
});

// ============================================================================
// TEST 5: Fingerprint & Structure Change Detection + Evidence Record Creation
// ============================================================================
test('5. Content fingerprint changes emit ChangeDetection + EvidenceReviewProposal while preserving published data & distinct statuses', async () => {
  const v1Html = '<main><h1>H-1B Visa</h1><p>Statutory fee is $460.</p></main>';
  const v2Html = '<main><h1>H-1B Visa</h1><section><h2>Updated Fee Schedule</h2><p>Statutory fee is $780 effective April 1.</p></section></main>';
  const v1Norm = normalizeOfficialContentForFingerprint(v1Html, 'text/html');

  const source = makeSampleSource({
    sourceId: 'SRC-US-USCIS-U-S-DEPARTMENT-OF-LABOR-DOL',
    contentFingerprint: v1Norm.contentFingerprint,
    structureSignature: v1Norm.structureSignature
  });

  const mockProgram = {
    schemaVersion: '2.0.0',
    programId: 'us-h1b-specialty',
    destinationCountryIso: 'US',
    programName: 'H-1B Specialty Occupations',
    immigrationCategory: 'work',
    programType: 'Actual Immigration Program',
    eligibilitySummary: 'Specialty occupation work visa.',
    officialSourceRefs: [{ sourceId: source.sourceId, url: source.sourceUrl }],
    verificationStatus: 'AVAILABLE_VERIFIED',
    createdDate: '2026-01-01',
    lastVerifiedDate: '2026-11-10',
    lastUpdatedDate: '2026-11-10',
    publicationStatus: 'PUBLISHED'
  } as ImmigrationProgramRecord;

  const mockClaim = {
    schemaVersion: '2.0.0',
    claimId: 'CL-H1BTEST0001',
    programId: 'us-h1b-specialty',
    claimText: 'H-1B filing fee.',
    claimClassification: 'LEGAL_REQUIREMENT',
    officialSourceId: source.sourceId,
    sourceUrl: source.sourceUrl,
    evidenceIds: ['EV-H1BTEST0001'],
    accessDate: '2026-11-10',
    verificationDate: '2026-11-10',
    verificationStatus: 'AVAILABLE_VERIFIED'
  } as ClaimRecord;

  const { report, updatedRegistry } = await runOfficialSourceMonitoring({
    sources: [source],
    now: new Date('2026-11-25T21:30:00Z'),
    fetcher: async (url) =>
      url.endsWith('/robots.txt')
        ? { status: 404, headers: {}, bodyText: '' }
        : { status: 200, headers: { 'content-type': 'text/html' }, bodyText: v2Html },
    resolveHostIps: SAFE_PUBLIC_DNS,
    sleep: NOOP_SLEEP,
    perHostIntervalMs: 0
  });

  assert.equal(report.results[0].outcome, 'STRUCTURE_CHANGED');
  assert.equal(report.results[0].fingerprintChanged, true);
  assert.equal(report.results[0].previousFingerprint, v1Norm.contentFingerprint);
  assert.notEqual(report.results[0].newFingerprint, v1Norm.contentFingerprint);
  assert.equal(updatedRegistry[0].contentFingerprint, report.results[0].newFingerprint);

  const bundle = processMonitoringReportForChangesAndQuarantine({
    report,
    programs: [mockProgram],
    claims: [mockClaim]
  });

  assert.equal(bundle.changeRecords.length, 1);
  assert.equal(bundle.evidenceProposals.length, 1);
  assert.equal(bundle.changeRecords[0].pipelineStatus, 'SOURCE_CHANGED');
  assert.equal(bundle.changeRecords[0].previousPublishedPreserved, true);
  assert.equal(bundle.changeRecords[0].requiresHumanReview, true);
  assert.deepEqual(bundle.changeRecords[0].affectedProgramIds, ['us-h1b-specialty']);
  assert.deepEqual(bundle.changeRecords[0].affectedClaimIds, ['CL-H1BTEST0001']);

  // Validate evidence proposal schema & ensure status is NOT CLAIM_APPROVED_FOR_PUBLICATION
  const propVal = validateEvidenceProposalRecord(bundle.evidenceProposals[0]);
  assert.equal(propVal.success, true);
  assert.equal(bundle.evidenceProposals[0].pipelineStatus, 'SOURCE_CONTENT_EXTRACTED');
  assert.equal(bundle.evidenceProposals[0].reviewerStatus, 'PENDING_HUMAN_REVIEW');
  // Original published program object untouched
  assert.equal(mockProgram.verificationStatus, 'AVAILABLE_VERIFIED');
});

// ============================================================================
// TEST 6 & 7: Duplicate-Run Lock Prevention, Idempotency & 03:00 AM IST Missed-Run Catch-Up
// ============================================================================
test('6 & 7. Duplicate-run lock prevention, idempotent slot execution & 03:00 AM IST missed-run catch-up', async () => {
  const tmpDir = makeTempDir('visaapply-5b-lock-');
  try {
    const statePath = path.join(tmpDir, 'run-state.json');
    const slotTime = new Date('2026-11-25T21:35:00Z');
    const slotUtc = getLatestScheduledSlotUtc(slotTime);
    assert.equal(slotUtc, '2026-11-25T21:30:00.000Z');

    // Missed-run detection (last run 3 days ago => 2 missed daily slots)
    const missed = detectMissedScheduledRuns('2026-11-22T21:30:00.000Z', slotTime);
    assert.equal(missed.missedRunsCount, 2);
    assert.equal(missed.catchUpRecommended, true);

    // Acquire lock #1 succeeds; overlapping lock #2 fails with RUN_ALREADY_ACTIVE
    const lock1 = acquireMonitoringRunLock(statePath, {
      runId: 'MON-RUN-1',
      idempotencyKey: `slot:${slotUtc}:sources:1`,
      now: slotTime
    });
    assert.equal(lock1.acquired, true);

    const lock2 = acquireMonitoringRunLock(statePath, {
      runId: 'MON-RUN-2',
      idempotencyKey: `slot:${slotUtc}:sources:1`,
      now: new Date('2026-11-25T21:36:00Z')
    });
    assert.equal(lock2.acquired, false);
    if (!lock2.acquired) assert.equal(lock2.code, 'RUN_ALREADY_ACTIVE');

    // Release lock #1 after success; re-running exact same idempotency slot is cleanly skipped
    releaseMonitoringRunLock(statePath, {
      runId: 'MON-RUN-1',
      idempotencyKey: `slot:${slotUtc}:sources:1`,
      completedAt: new Date('2026-11-25T21:37:00Z'),
      succeeded: true,
      scheduledSlotUtc: slotUtc
    });

    const lock3 = acquireMonitoringRunLock(statePath, {
      runId: 'MON-RUN-3',
      idempotencyKey: `slot:${slotUtc}:sources:1`,
      now: new Date('2026-11-25T21:40:00Z')
    });
    assert.equal(lock3.acquired, false);
    if (!lock3.acquired) assert.equal(lock3.code, 'IDEMPOTENT_SLOT_ALREADY_EXECUTED');

    // Full pipeline idempotency test in isolated monitoringDir
    const monDir = path.join(tmpDir, 'monitoring');
    const source = makeSampleSource();
    const fetcher: MonitorHttpFetcher = async (url) =>
      url.endsWith('/robots.txt')
        ? { status: 404, headers: {}, bodyText: '' }
        : { status: 200, headers: { 'content-type': 'text/html' }, bodyText: '<main>Official Visa Rules</main>' };

    const firstExec = await executeSourceMonitoringPipeline({
      dataDir: DATA_DIR,
      monitoringDir: monDir,
      now: new Date('2026-11-25T21:35:00Z'),
      overrideSources: [source],
      fetcher,
      resolveHostIps: SAFE_PUBLIC_DNS,
      sleep: NOOP_SLEEP,
      perHostIntervalMs: 0
    });
    assert.equal(firstExec.skipped, false);
    assert.equal(firstExec.report?.totals.sourcesChecked, 1);

    // Second run on the exact same scheduled slot is idempotently skipped
    const secondExec = await executeSourceMonitoringPipeline({
      dataDir: DATA_DIR,
      monitoringDir: monDir,
      now: new Date('2026-11-25T21:45:00Z'),
      overrideSources: [source],
      fetcher,
      resolveHostIps: SAFE_PUBLIC_DNS,
      sleep: NOOP_SLEEP,
      perHostIntervalMs: 0
    });
    assert.equal(secondExec.skipped, true);
    assert.equal(secondExec.skipCode, 'IDEMPOTENT_SLOT_ALREADY_EXECUTED');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

// ============================================================================
// TEST 8, 9, 10, 11: Claim Status Transitions, Discovery-Lead Rejection, Conflicting & Expired Quarantine
// ============================================================================
test('8-11. High-risk claim verification enforces official evidence, rejects discovery leads & auto-quarantines conflicts/expirations', () => {
  // Third-party discovery lead attempting approval fails schema validation
  const badLeadApproval = validateClaimVerificationReviewRecord(
    makeSampleClaimReview({
      sourceAuthorityTier: 'DISCOVERY_LEAD_ONLY',
      evidenceUrl: 'https://news-portal.example.org/h1b',
      verificationStatus: 'CLAIM_APPROVED_FOR_PUBLICATION',
      reviewerStatus: 'APPROVED'
    })
  );
  assert.equal(badLeadApproval.success, false);

  // Discovery lead in pending state triggers UNVERIFIABLE_OFFICIAL_SOURCE record-level quarantine
  const leadEval = evaluateClaimTrustAndQuarantine(
    makeSampleClaimReview({
      sourceAuthorityTier: 'DISCOVERY_LEAD_ONLY',
      evidenceUrl: 'https://news-portal.example.org/h1b',
      verificationStatus: 'CLAIM_AWAITING_REVIEW',
      reviewerStatus: 'PENDING_HUMAN_REVIEW'
    })
  );
  assert.equal(leadEval.publishable, false);
  assert.equal(leadEval.quarantineAction?.triggerCode, 'UNVERIFIABLE_OFFICIAL_SOURCE');

  // Conflicting official sources trigger CONFLICTING_OFFICIAL_SOURCES quarantine
  const conflictEval = evaluateClaimTrustAndQuarantine(
    makeSampleClaimReview({
      conflictingOfficialSourceIds: ['SRC-US-CONSULAR-PORTAL'],
      verificationStatus: 'CLAIM_AWAITING_REVIEW'
    })
  );
  assert.equal(conflictEval.publishable, false);
  assert.equal(conflictEval.quarantineAction?.triggerCode, 'CONFLICTING_OFFICIAL_SOURCES');
  assert.equal(conflictEval.quarantineAction?.entireCountryQuarantined, false);

  // Expired claim triggers EXPIRED_INFORMATION quarantine
  const expiredEval = evaluateClaimTrustAndQuarantine(
    makeSampleClaimReview({
      expiresAt: '2025-12-31T00:00:00Z'
    }),
    { now: new Date('2026-11-25T00:00:00Z') }
  );
  assert.equal(expiredEval.publishable, false);
  assert.equal(expiredEval.quarantineAction?.triggerCode, 'EXPIRED_INFORMATION');

  // Missing evidence excerpt triggers MISSING_SUPPORTING_EVIDENCE quarantine
  const missingEvEval = evaluateClaimTrustAndQuarantine(
    makeSampleClaimReview({
      evidenceExcerpt: null
    })
  );
  assert.equal(missingEvEval.publishable, false);
  assert.equal(missingEvEval.quarantineAction?.triggerCode, 'MISSING_SUPPORTING_EVIDENCE');

  // Pending high-risk claim is NOT publishable until human reviewer explicitly approves
  const pendingEval = evaluateClaimTrustAndQuarantine(makeSampleClaimReview());
  assert.equal(pendingEval.publishable, false);
  assert.equal(pendingEval.resolvedPipelineStatus, 'CLAIM_AWAITING_REVIEW');

  // Explicitly human-approved claim with official evidence becomes publishable
  const approvedEval = evaluateClaimTrustAndQuarantine(
    makeSampleClaimReview({
      verificationStatus: 'CLAIM_APPROVED_FOR_PUBLICATION',
      reviewerStatus: 'APPROVED',
      reviewedBy: 'editorial-legal-reviewer-1',
      reviewedAt: '2026-11-25T10:00:00Z'
    })
  );
  assert.equal(approvedEval.publishable, true);
  assert.equal(approvedEval.quarantineAction, null);
});

// ============================================================================
// TEST 12: Record-Level Quarantine Isolation (Never Quarantines Whole Country!)
// ============================================================================
test('12. Record-level quarantine isolates only the affected program and leaves sibling programs & country active', () => {
  const usPrograms = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'programs/us.json'), 'utf8')
  ) as ImmigrationProgramRecord[];
  assert.ok(usPrograms.length >= 2, 'Expected multiple verified US programs');

  const failingSourceId = usPrograms[0].officialSourceRefs[0].sourceId;
  const mockFailedCheck = {
    checkId: 'CHK-TEST',
    runId: 'MON-TEST',
    sourceId: failingSourceId,
    countryIso: 'US',
    sourceUrl: usPrograms[0].officialSourceRefs[0].url,
    checkedAt: '2026-11-25T21:30:00Z',
    durationMs: 25,
    outcome: 'REDIRECTED_SUSPICIOUS' as const,
    pipelineStatus: 'SOURCE_UNAVAILABLE' as const,
    httpStatus: 302,
    finalUrl: 'https://www.ivisa.com/fake',
    redirectChain: [],
    previousFingerprint: null,
    newFingerprint: null,
    fingerprintChanged: false,
    previousStructureSignature: null,
    newStructureSignature: null,
    structureChanged: false,
    robotsAllowed: true,
    antiBotDetected: false,
    responseContentType: null,
    extractedExcerpt: null,
    impliesProgramClosure: false as const,
    notes: 'Suspicious redirect'
  };

  const impact = computeAffectedProgramIdsForSourceFailure(mockFailedCheck, usPrograms);
  assert.equal(impact.entireCountryQuarantined, false);
  assert.ok(impact.affectedProgramIds.includes(usPrograms[0].programId));
  assert.ok(impact.unaffectedCountryProgramIds.length >= 1, 'Sibling US programs using healthy sources must remain unaffected');
});

// ============================================================================
// TEST 13: Human Approval Gates (Low-Risk Metadata vs Material Legal / AI / Unverified Changes)
// ============================================================================
test('13. Human approval gate auto-allows deterministic low-risk metadata only & blocks material/AI/translation/closure changes', () => {
  // Deterministic low-risk metadata update allowed automatically
  const lowRiskDecision = evaluatePublicationApprovalGate({
    proposalId: 'PROP-LOW-1',
    targetEntityType: 'source',
    targetEntityId: 'SRC-US-CONSULAR-PORTAL',
    countryIso: 'US',
    changedFields: ['lastCheckedDate', 'httpAvailabilityStatus', 'contentFingerprint'],
    riskClass: 'LOW_RISK_METADATA',
    deterministicallyVerified: true,
    sourceAuthorityTier: 'OFFICIAL_GOVERNMENT',
    hasOfficialEvidence: true,
    hasConflictingClaims: false,
    isAiGeneratedRule: false,
    isUnverifiedTranslation: false,
    isProgramClosureClaim: false,
    humanApproval: { approved: false, reviewedBy: null, reviewedAt: null }
  });
  assert.equal(lowRiskDecision.allowedToAutoPublish, true);
  assert.equal(lowRiskDecision.blocked, false);
  assert.equal(lowRiskDecision.decisionCode, 'AUTO_APPROVED_LOW_RISK_METADATA');

  // Material fee/eligibility change WITHOUT human approval is blocked
  const materialUnapproved = evaluatePublicationApprovalGate({
    proposalId: 'PROP-HIGH-1',
    targetEntityType: 'program',
    targetEntityId: 'us-h1b-specialty',
    countryIso: 'US',
    changedFields: ['applicationFees', 'eligibilitySummary'],
    riskClass: 'HIGH_RISK_LEGAL_OR_ELIGIBILITY',
    deterministicallyVerified: true,
    sourceAuthorityTier: 'OFFICIAL_GOVERNMENT',
    hasOfficialEvidence: true,
    hasConflictingClaims: false,
    isAiGeneratedRule: false,
    isUnverifiedTranslation: false,
    isProgramClosureClaim: false,
    humanApproval: { approved: false, reviewedBy: null, reviewedAt: null }
  });
  assert.equal(materialUnapproved.allowedToAutoPublish, false);
  assert.equal(materialUnapproved.blocked, true);
  assert.equal(materialUnapproved.decisionCode, 'BLOCKED_HUMAN_APPROVAL_REQUIRED');

  // AI-generated immigration rule WITHOUT human review is strictly blocked
  const aiRule = evaluatePublicationApprovalGate({
    proposalId: 'PROP-AI-1',
    targetEntityType: 'program',
    targetEntityId: 'us-h1b-specialty',
    countryIso: 'US',
    changedFields: ['eligibilitySummary'],
    riskClass: 'HIGH_RISK_LEGAL_OR_ELIGIBILITY',
    deterministicallyVerified: false,
    sourceAuthorityTier: 'OFFICIAL_GOVERNMENT',
    hasOfficialEvidence: true,
    hasConflictingClaims: false,
    isAiGeneratedRule: true,
    isUnverifiedTranslation: false,
    isProgramClosureClaim: false,
    humanApproval: { approved: false, reviewedBy: null, reviewedAt: null }
  });
  assert.equal(aiRule.blocked, true);

  // Unsupported legal translation is strictly blocked
  const unverifiedTrans = evaluatePublicationApprovalGate({
    proposalId: 'PROP-TRANS-1',
    targetEntityType: 'program',
    targetEntityId: 'de-chancenkarte',
    countryIso: 'DE',
    changedFields: ['eligibilitySummary'],
    riskClass: 'HIGH_RISK_LEGAL_OR_ELIGIBILITY',
    deterministicallyVerified: true,
    sourceAuthorityTier: 'OFFICIAL_GOVERNMENT',
    hasOfficialEvidence: true,
    hasConflictingClaims: false,
    isAiGeneratedRule: false,
    isUnverifiedTranslation: true,
    isProgramClosureClaim: false,
    humanApproval: { approved: true, reviewedBy: 'reviewer-1', reviewedAt: '2026-11-25T10:00:00Z' }
  });
  assert.equal(unverifiedTrans.blocked, true);

  // Unverified program closure is strictly blocked
  const unverifiedClosure = evaluatePublicationApprovalGate({
    proposalId: 'PROP-CLOSE-1',
    targetEntityType: 'program',
    targetEntityId: 'us-h1b-specialty',
    countryIso: 'US',
    changedFields: ['verificationStatus'],
    riskClass: 'HIGH_RISK_LEGAL_OR_ELIGIBILITY',
    deterministicallyVerified: true,
    sourceAuthorityTier: 'OFFICIAL_GOVERNMENT',
    hasOfficialEvidence: true,
    hasConflictingClaims: false,
    isAiGeneratedRule: false,
    isUnverifiedTranslation: false,
    isProgramClosureClaim: true,
    humanApproval: { approved: false, reviewedBy: null, reviewedAt: null }
  });
  assert.equal(unverifiedClosure.blocked, true);

  // Material change WITH explicit human approval + official evidence passes review gate (still not auto-published)
  const materialApproved = evaluatePublicationApprovalGate({
    proposalId: 'PROP-HIGH-2',
    targetEntityType: 'program',
    targetEntityId: 'us-h1b-specialty',
    countryIso: 'US',
    changedFields: ['applicationFees'],
    riskClass: 'HIGH_RISK_LEGAL_OR_ELIGIBILITY',
    deterministicallyVerified: true,
    sourceAuthorityTier: 'OFFICIAL_GOVERNMENT',
    hasOfficialEvidence: true,
    hasConflictingClaims: false,
    isAiGeneratedRule: false,
    isUnverifiedTranslation: false,
    isProgramClosureClaim: false,
    humanApproval: { approved: true, reviewedBy: 'editorial-reviewer-1', reviewedAt: '2026-11-25T10:00:00Z' }
  });
  assert.equal(materialApproved.allowedToAutoPublish, false);
  assert.equal(materialApproved.allowedWithHumanApproval, true);
  assert.equal(materialApproved.blocked, false);
  assert.equal(materialApproved.decisionCode, 'APPROVED_BY_HUMAN_REVIEW_GATE');
});

// ============================================================================
// TEST 14 & 15: Atomic Static Catalog Regeneration, Failed-Run Recovery & Sitemap Candidate Generation
// ============================================================================
test('14 & 15. Atomic regeneration succeeds cleanly, verifies SHA-256 & preserves previous known-good output on failure', () => {
  const tmpPublic = makeTempDir('visaapply-5b-atomic-');
  try {
    const tmpCatalog = path.join(tmpPublic, 'catalog');
    const tmpSitemaps = path.join(tmpPublic, 'sitemaps-static');
    const tmpMonitoring = path.join(tmpPublic, 'monitoring');

    // Create 2 simulated legacy sitemap files in tmpPublic to verify they are NEVER modified or deleted
    fs.writeFileSync(path.join(tmpPublic, 'sitemap-index.xml'), '<sitemapindex/>', 'utf8');
    fs.writeFileSync(path.join(tmpPublic, 'sitemap-legacy-1.xml'), '<urlset><url><loc>https://www.visaapply.org/</loc></url></urlset>', 'utf8');

    // 1. First atomic regeneration succeeds
    const res1 = runSafeCatalogRegeneration({
      dataDir: DATA_DIR,
      publicDir: tmpPublic,
      catalogOutDir: tmpCatalog,
      sitemapOutDir: tmpSitemaps,
      monitoringDir: tmpMonitoring
    });
    assert.equal(res1.succeeded, true, `Errors: ${res1.errors.join('; ')}`);
    assert.equal(res1.atomicSwapPerformed, true);
    assert.ok(res1.stagedArtifactsVerified >= 35);
    assert.equal(res1.sitemapTotals?.substantiveUrlsEmitted, 56);
    assert.equal(res1.legacySitemapsCountBefore, 2);
    assert.equal(res1.legacySitemapsCountAfter, 2);

    // Marker sentinel inside known-good catalog & manifest hash before simulated failure
    const sentinelPath = path.join(tmpCatalog, '.known-good-sentinel');
    fs.writeFileSync(sentinelPath, 'KNOWN_GOOD_STATE', 'utf8');
    const manifestBeforeSha = sha256File(path.join(tmpCatalog, 'manifest.json'));

    // 2. Simulate post-build verification failure -> previous known-good output MUST be preserved untouched!
    const failedRes = runSafeCatalogRegeneration({
      dataDir: DATA_DIR,
      publicDir: tmpPublic,
      catalogOutDir: tmpCatalog,
      sitemapOutDir: tmpSitemaps,
      monitoringDir: tmpMonitoring,
      injectPostBuildFailure: true
    });
    assert.equal(failedRes.succeeded, false);
    assert.equal(failedRes.atomicSwapPerformed, false);
    assert.equal(failedRes.previousOutputPreservedOnFailure, true);
    assert.equal(fs.existsSync(sentinelPath), true, 'Previous known-good catalog directory must survive failed regeneration');
    assert.equal(sha256File(path.join(tmpCatalog, 'manifest.json')), manifestBeforeSha);
    // Ensure no leftover .staging-* directories remain
    const leftovers = fs.readdirSync(tmpPublic).filter((f) => f.startsWith('.staging-'));
    assert.equal(leftovers.length, 0, 'Staging directories must be cleaned up after failure');

    // 3. Verify candidate sitemap index uses final `/sitemaps-static/` prefix (NOT temp staging path!)
    const candidateIndexXml = fs.readFileSync(path.join(tmpSitemaps, 'sitemap-static-index.xml'), 'utf8');
    assert.ok(candidateIndexXml.includes('https://www.visaapply.org/sitemaps-static/sitemap-static-core.xml'));
    assert.equal(candidateIndexXml.includes('.staging-'), false);

    // 4. Verify real repo has all 89 legacy public/sitemap*.xml files untouched
    const realLegacyCount = fs
      .readdirSync(PUBLIC_DIR)
      .filter((f) => /^sitemap.*\.xml$/i.test(f) && !fs.statSync(path.join(PUBLIC_DIR, f)).isDirectory()).length;
    assert.equal(realLegacyCount, 89);
  } finally {
    fs.rmSync(tmpPublic, { recursive: true, force: true });
  }
});

// ============================================================================
// TEST 16: GitHub Actions Workflow YAML Validation, Data Quality Dashboard, PII & SQLite Immutability
// ============================================================================
test('16. GitHub Actions workflows, Data Quality Dashboard metrics, PII scan & SQLite DB immutability checks pass', () => {
  const wfDir = path.join(ROOT_DIR, '.github/workflows');
  const dailyPath = path.join(wfDir, 'daily-source-monitoring.yml');
  const prPath = path.join(wfDir, 'propose-catalog-refresh-pr.yml');
  const validatePath = path.join(wfDir, 'validate-and-regenerate-catalog.yml');

  for (const fp of [dailyPath, prPath, validatePath]) {
    assert.equal(fs.existsSync(fp), true, `Missing required workflow file: ${fp}`);
    const content = fs.readFileSync(fp, 'utf8');
    // Must define permissions, concurrency, and workflow_dispatch
    assert.match(content, /^permissions:/m, `${fp} must define explicit minimal permissions`);
    assert.match(content, /^concurrency:/m, `${fp} must define concurrency group to prevent duplicate runs`);
    assert.match(content, /workflow_dispatch:/m, `${fp} must support manual workflow_dispatch`);
    // Must never hardcode API keys, tokens, or DB URIs
    assert.equal(detectProhibitedPublicSecretsOrPii(content.replace(/visaapply-monitoring-bot@users\.noreply\.github\.com/g, '')).length, 0);
    // Must never auto-merge PRs
    assert.equal(/gh pr merge|--auto\b/i.test(content), false, `${fp} must never auto-merge material changes`);
  }

  // Verify daily monitoring cron is exact 03:00 AM IST = 21:30 UTC and read-only permissions
  const dailyYaml = fs.readFileSync(dailyPath, 'utf8');
  assert.ok(dailyYaml.includes("cron: '30 21 * * *'"), 'Daily schedule must be 30 21 * * * UTC (03:00 AM IST)');
  assert.match(dailyYaml, /permissions:\s*\n\s*contents:\s*read/, 'Daily monitoring workflow must have contents: read');

  // Verify Data Quality Dashboard report separates all 4 canonical metrics with zero fabricated percentages
  const { report } = generateDataQualityReport({ writeToDisk: false });
  assert.equal(report.canonicalScopeMetrics.totalCountriesAndTerritoriesInRegistry, 249);
  assert.equal(report.canonicalScopeMetrics.potentialBilateralRoutes, 61752);
  assert.equal(report.canonicalScopeMetrics.trackedSevenCategoryCoverageSlots, 1743);
  assert.equal(report.canonicalScopeMetrics.activeVerifiedCountries, 14);
  assert.equal(report.canonicalScopeMetrics.awaitingVerificationCountries, 228);
  assert.equal(report.canonicalScopeMetrics.uninhabitedTerritories, 7);
  assert.equal(report.verifiedCatalogMetrics.verifiedAvailablePrograms, 28);
  assert.equal(report.verifiedCatalogMetrics.verifiedOfficialSourcesRegistered, 61);
  assert.equal(report.reportIntegrity.noFabricatedCoveragePercentages, true);
  assert.equal(report.reportIntegrity.strictMetricSeparationEnforced, true);
  assert.equal(detectProhibitedPublicSecretsOrPii(report).length, 0);

  // Verify protected SQLite DB, WAL, SHM & Phase B.3 backup SHA-256 hashes remain 100% untouched
  const protectedHashes: Array<[string, string]> = [
    ['data_db/immigration_hub.db', '936faacbb233ab114dc9e90393ff2aa93d7a3ff4ca5c2231de1cf1d2f48820d4'],
    ['data_db/immigration_hub.db-wal', '72698faadb3e0d3e8b9525222fd544a82b37fd2ccb13940b64676e87856be09f'],
    ['data_db/immigration_hub.db-shm', '70d1f2ac7d8a9a06c39f06e8b5ced61b1f9fd9a6d3cccd28a223713bbfcd6b7f'],
    [
      'backups/phase_b3_verified_2026-11-23T10-31-07-923Z_ac57/immigration_hub_standalone.db',
      '827494c04201f9ea4adcd7530566f41e9c7f091c1507b59abd95b1d8d7fb4e03'
    ]
  ];
  for (const [relFile, expectedHash] of protectedHashes) {
    const abs = path.join(ROOT_DIR, relFile);
    if (fs.existsSync(abs)) {
      assert.equal(sha256File(abs), expectedHash, `Protected database/backup file modified: ${relFile}`);
    }
  }
});
