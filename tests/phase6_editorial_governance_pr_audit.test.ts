import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { detectProhibitedPublicSecretsOrPii } from '../src/schemas/catalogSchemas';
import {
  EDITORIAL_PERMISSIONS,
  EDITORIAL_ROLES,
  PHASE6_GOVERNANCE_SCHEMA_VERSION,
  buildGithubReviewMarkdown,
  classifyEditorialRisk,
  hasEditorialPermission,
  type EditorialActorIdentity,
  type EditorialAuditEvent,
  type EditorialChangeProposal,
  type QuarantineReleaseRequest
} from '../src/schemas/editorialGovernanceSchemas';
import {
  assertRolePermission,
  createSignedAuditEvent,
  evaluatePullRequestMergeAuthorization,
  evaluateQuarantineRelease,
  recordEditorialDecision,
  validateEditorialChangeProposal,
  verifyAppendOnlyAuditTrail
} from '../scripts/lib/editorialApprovalEngine';
import { validateEditorialPullRequest } from '../scripts/validateEditorialPullRequest';
import { runSafeCatalogRegeneration } from '../scripts/runSafeCatalogRegeneration';
import { EditorialReviewQueuePage } from '../src/pages/EditorialReviewQueuePage';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, 'data');

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function sha256File(fp: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(fp)).digest('hex');
}

const ADMIN_ACTOR: EditorialActorIdentity = {
  githubHandle: '@platform-admin-1',
  role: 'ADMINISTRATOR',
  isBotOrAi: false
};
const SENIOR_ACTOR: EditorialActorIdentity = {
  githubHandle: '@senior-immigration-reviewer-1',
  role: 'SENIOR_IMMIGRATION_REVIEWER',
  isBotOrAi: false
};
const COUNTRY_EDITOR: EditorialActorIdentity = {
  githubHandle: '@country-editor-us',
  role: 'COUNTRY_EDITOR',
  isBotOrAi: false
};
const EVIDENCE_REVIEWER: EditorialActorIdentity = {
  githubHandle: '@evidence-reviewer-1',
  role: 'EVIDENCE_REVIEWER',
  isBotOrAi: false
};
const AUDITOR_ACTOR: EditorialActorIdentity = {
  githubHandle: '@readonly-auditor-1',
  role: 'READ_ONLY_AUDITOR',
  isBotOrAi: false
};
const AI_BOT_ACTOR: EditorialActorIdentity = {
  githubHandle: '@visaapply-ai-bot',
  role: 'SENIOR_IMMIGRATION_REVIEWER',
  isBotOrAi: true
};

function makeProposal(overrides: Partial<EditorialChangeProposal> = {}): EditorialChangeProposal {
  return {
    schemaVersion: PHASE6_GOVERNANCE_SCHEMA_VERSION,
    proposalId: 'PROP-2026-11-25-US-001',
    recordId: 'us-h1b-specialty',
    entityType: 'program',
    countryIso: 'US',
    changedFields: ['applicationFees'],
    riskLevel: 'HIGH_RISK',
    previousValue: '$460 Form I-129 base fee',
    proposedValue: '$780 Form I-129 base fee (effective 2026-04-01)',
    finalApprovedValue: null,
    officialSourceId: 'SRC-US-USCIS-U-S-DEPARTMENT-OF-LABOR-DOL',
    officialSourceUrl: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
    evidenceExcerpt: 'Official USCIS Form I-129 fee schedule lists $780 standard filing fee.',
    evidenceRetrievedAt: '2026-11-25T03:00:00Z',
    evidenceExpiresAt: '2027-11-25T00:00:00Z',
    sourceLastCheckedTimestamp: '2026-11-25T03:00:00Z',
    verificationStatus: 'CLAIM_AWAITING_REVIEW',
    conflictingSourceIds: [],
    lifecycleStatus: 'PENDING_REVIEW',
    proposedBy: COUNTRY_EDITOR,
    proposedAt: '2026-11-25T04:00:00Z',
    pullRequestRef: 'https://github.com/visaapply-org/visaapply/pull/101',
    commitSha: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    decisions: [],
    ...overrides
  };
}

// ============================================================================
// TEST 1 & 2: Role Permission Matrix & Unauthorized Action Rejection
// ============================================================================
test('1 & 2. Five-role permission matrix enforces exact capabilities and rejects unauthorized actions', () => {
  assert.equal(EDITORIAL_ROLES.length, 5);
  assert.equal(EDITORIAL_PERMISSIONS.length, 9);

  // Administrator & Senior Immigration Reviewer hold full high-risk & merge permissions
  for (const perm of EDITORIAL_PERMISSIONS) {
    assert.equal(hasEditorialPermission('ADMINISTRATOR', perm), true);
    assert.equal(hasEditorialPermission('SENIOR_IMMIGRATION_REVIEWER', perm), true);
  }

  // Country Editor cannot approve HIGH_RISK, merge PRs, or manage source registry
  assert.equal(hasEditorialPermission('COUNTRY_EDITOR', 'EDIT_DRAFTS'), true);
  assert.equal(hasEditorialPermission('COUNTRY_EDITOR', 'APPROVE_LOW_RISK_CHANGES'), true);
  assert.equal(hasEditorialPermission('COUNTRY_EDITOR', 'APPROVE_HIGH_RISK_CHANGES'), false);
  assert.equal(hasEditorialPermission('COUNTRY_EDITOR', 'MERGE_APPROVED_PR'), false);
  assert.equal(hasEditorialPermission('COUNTRY_EDITOR', 'MANAGE_SOURCE_REGISTRY'), false);

  // Evidence Reviewer can review evidence & approve low-risk, but cannot edit drafts, approve high-risk, or merge
  assert.equal(hasEditorialPermission('EVIDENCE_REVIEWER', 'REVIEW_EVIDENCE'), true);
  assert.equal(hasEditorialPermission('EVIDENCE_REVIEWER', 'APPROVE_LOW_RISK_CHANGES'), true);
  assert.equal(hasEditorialPermission('EVIDENCE_REVIEWER', 'EDIT_DRAFTS'), false);
  assert.equal(hasEditorialPermission('EVIDENCE_REVIEWER', 'APPROVE_HIGH_RISK_CHANGES'), false);
  assert.equal(hasEditorialPermission('EVIDENCE_REVIEWER', 'MERGE_APPROVED_PR'), false);

  // Read-only Auditor can ONLY view records and audit history
  assert.equal(hasEditorialPermission('READ_ONLY_AUDITOR', 'VIEW_RECORDS'), true);
  assert.equal(hasEditorialPermission('READ_ONLY_AUDITOR', 'VIEW_AUDIT_HISTORY'), true);
  assert.equal(hasEditorialPermission('READ_ONLY_AUDITOR', 'PROPOSE_CHANGES'), false);
  assert.equal(hasEditorialPermission('READ_ONLY_AUDITOR', 'REVIEW_EVIDENCE'), false);
  assert.equal(hasEditorialPermission('READ_ONLY_AUDITOR', 'APPROVE_LOW_RISK_CHANGES'), false);
  assert.equal(hasEditorialPermission('READ_ONLY_AUDITOR', 'APPROVE_HIGH_RISK_CHANGES'), false);
  assert.equal(hasEditorialPermission('READ_ONLY_AUDITOR', 'MERGE_APPROVED_PR'), false);

  // Unauthorized actor decision rejected cleanly
  const auditorAttempt = recordEditorialDecision({
    proposal: makeProposal(),
    actor: AUDITOR_ACTOR,
    decision: 'APPROVE',
    reason: 'Unauthorized auditor approval attempt',
    pullRequestRef: 'PR#101',
    commitSha: 'deadbeef0001',
    previousAuditEventHash: null
  });
  assert.equal(auditorAttempt.accepted, false);
  assert.equal(auditorAttempt.code, 'UNAUTHORIZED_ROLE_ACTION');

  // Email address disguised as reviewer identity rejected (zero PII in governance)
  const emailHandleCheck = assertRolePermission(
    { githubHandle: 'reviewer@example.com', role: 'ADMINISTRATOR', isBotOrAi: false },
    'VIEW_RECORDS'
  );
  assert.equal(emailHandleCheck.allowed, false);
});

// ============================================================================
// TEST 3 & 4: High-Risk Approval Enforcement & Low-Risk Streamlined Workflow
// ============================================================================
test('3 & 4. High-risk changes block Country Editors, AI bots, self-approval & conflicts; low-risk workflow works cleanly', () => {
  // Risk classification fail-closed verification
  assert.equal(classifyEditorialRisk(['sourceDescription', 'spellingCorrection']), 'LOW_RISK');
  assert.equal(classifyEditorialRisk(['applicationFees']), 'HIGH_RISK');
  assert.equal(classifyEditorialRisk(['sourceDescription', 'eligibility']), 'HIGH_RISK');
  assert.equal(classifyEditorialRisk(['unknownUnlistedField']), 'HIGH_RISK');
  assert.equal(classifyEditorialRisk([]), 'HIGH_RISK');

  // Country Editor cannot approve HIGH_RISK change
  const ceAttempt = recordEditorialDecision({
    proposal: makeProposal(),
    actor: COUNTRY_EDITOR,
    decision: 'APPROVE',
    reason: 'Country editor trying to approve fee change',
    pullRequestRef: 'PR#101',
    commitSha: 'abc1234',
    previousAuditEventHash: null
  });
  assert.equal(ceAttempt.accepted, false);
  assert.equal(ceAttempt.code, 'UNAUTHORIZED_ROLE_ACTION');

  // AI/bot actor strictly blocked from approving HIGH_RISK change
  const aiAttempt = recordEditorialDecision({
    proposal: makeProposal(),
    actor: AI_BOT_ACTOR,
    decision: 'APPROVE',
    reason: 'Automated AI approval attempt',
    pullRequestRef: 'PR#101',
    commitSha: 'abc1234',
    previousAuditEventHash: null
  });
  assert.equal(aiAttempt.accepted, false);
  assert.equal(aiAttempt.code, 'AI_ONLY_HIGH_RISK_APPROVAL_FORBIDDEN');

  // Self-approval blocked for HIGH_RISK change
  const selfProposal = makeProposal({ proposedBy: SENIOR_ACTOR });
  const selfAttempt = recordEditorialDecision({
    proposal: selfProposal,
    actor: SENIOR_ACTOR,
    decision: 'APPROVE',
    reason: 'Proposer trying to self-approve high-risk legal change',
    pullRequestRef: 'PR#101',
    commitSha: 'abc1234',
    previousAuditEventHash: null
  });
  assert.equal(selfAttempt.accepted, false);
  assert.equal(selfAttempt.code, 'SELF_APPROVAL_FORBIDDEN_FOR_HIGH_RISK');

  // Conflicting official sources block approval
  const conflictingAttempt = recordEditorialDecision({
    proposal: makeProposal({ conflictingSourceIds: ['SRC-US-CONSULAR-PORTAL'] }),
    actor: SENIOR_ACTOR,
    decision: 'APPROVE',
    reason: 'Trying to approve unresolved conflicting sources',
    pullRequestRef: 'PR#101',
    commitSha: 'abc1234',
    previousAuditEventHash: null
  });
  assert.equal(conflictingAttempt.accepted, false);
  assert.equal(conflictingAttempt.code, 'CONFLICTING_SOURCES_MUST_REMAIN_QUARANTINED');

  // Independent Senior Immigration Reviewer approves valid HIGH_RISK proposal
  const highRiskOk = recordEditorialDecision({
    proposal: makeProposal(),
    actor: SENIOR_ACTOR,
    decision: 'APPROVE',
    reason: 'Verified against official USCIS 2026 Federal Register fee schedule.',
    pullRequestRef: 'https://github.com/visaapply-org/visaapply/pull/101',
    commitSha: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    previousAuditEventHash: null,
    now: new Date('2026-11-25T10:00:00Z')
  });
  assert.equal(highRiskOk.accepted, true);
  assert.equal(highRiskOk.updatedProposal?.lifecycleStatus, 'APPROVED_READY_FOR_MERGE');
  assert.ok(highRiskOk.auditEvent?.eventHash);

  // Streamlined LOW_RISK approval by Evidence Reviewer succeeds
  const lowRiskProposal = makeProposal({
    proposalId: 'PROP-2026-11-25-US-LOW',
    changedFields: ['sourceDescription', 'spellingCorrection'],
    riskLevel: 'LOW_RISK',
    previousValue: 'USCIS Specialty Occupation portal',
    proposedValue: 'USCIS H-1B Specialty Occupations Portal'
  });
  const lowRiskOk = recordEditorialDecision({
    proposal: lowRiskProposal,
    actor: EVIDENCE_REVIEWER,
    decision: 'APPROVE',
    reason: 'Verified non-legal display description spelling correction.',
    pullRequestRef: 'https://github.com/visaapply-org/visaapply/pull/102',
    commitSha: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    previousAuditEventHash: null,
    now: new Date('2026-11-25T10:15:00Z')
  });
  assert.equal(lowRiskOk.accepted, true);
  assert.equal(lowRiskOk.updatedProposal?.riskLevel, 'LOW_RISK');
  assert.equal(lowRiskOk.updatedProposal?.lifecycleStatus, 'APPROVED_READY_FOR_MERGE');
});

// ============================================================================
// TEST 5, 6 & 7: PR Validation, Missing/Expired Evidence & Invalid Source Rejection
// ============================================================================
test('5-7. PR validator rejects missing evidence, expired evidence, unofficial sources & downgraded risk, and passes valid PRs', () => {
  // Missing evidence excerpt rejected
  const noExcerpt = validateEditorialChangeProposal(makeProposal({ evidenceExcerpt: '' }));
  assert.equal(noExcerpt.valid, false);
  assert.ok(noExcerpt.errors.some((e) => e.includes('MISSING_EVIDENCE_EXCERPT')));

  // Expired evidence rejected
  const expiredEv = validateEditorialChangeProposal(
    makeProposal({ evidenceExpiresAt: '2025-01-01T00:00:00Z' }),
    { now: new Date('2026-11-25T00:00:00Z') }
  );
  assert.equal(expiredEv.valid, false);
  assert.ok(expiredEv.errors.some((e) => e.includes('EXPIRED_EVIDENCE')));

  // Commercial visa agency URL rejected
  const badUrl = validateEditorialChangeProposal(
    makeProposal({ officialSourceUrl: 'https://www.ivisa.com/us-h1b' })
  );
  assert.equal(badUrl.valid, false);
  assert.ok(badUrl.errors.some((e) => e.includes('INVALID_OFFICIAL_URL')));

  // Attempting to misclassify HIGH_RISK fee change as LOW_RISK rejected
  const downgradedRisk = validateEditorialChangeProposal(
    makeProposal({ changedFields: ['applicationFees'], riskLevel: 'LOW_RISK' })
  );
  assert.equal(downgradedRisk.valid, false);
  assert.ok(downgradedRisk.errors.some((e) => e.includes('RISK_DOWNGRADE_FORBIDDEN')));

  // End-to-end PR validator on actual repo governance directory passes cleanly
  const realPrCheck = validateEditorialPullRequest({ skipCatalogDryRun: false });
  assert.equal(realPrCheck.valid, true, `Unexpected PR check errors: ${realPrCheck.errors.join('; ')}`);
  assert.equal(realPrCheck.checks.staticCatalogValid, true);
  assert.equal(realPrCheck.checks.auditTrailValid, true);
  assert.equal(realPrCheck.checks.piiAndSecretScanClean, true);
  assert.equal(realPrCheck.checks.atomicRegenerationDryRunPassed, true);

  // Isolated temp governance dir with an invalid proposal MUST fail PR validation (block merge)
  const tmpGov = makeTempDir('visaapply-6-pr-');
  try {
    fs.mkdirSync(path.join(tmpGov, 'proposals'), { recursive: true });
    fs.writeFileSync(path.join(tmpGov, 'audit-log.json'), '[]', 'utf8');
    fs.writeFileSync(
      path.join(tmpGov, 'proposals/bad-proposal.json'),
      JSON.stringify(makeProposal({ officialSourceUrl: 'https://www.ivisa.com/fake', evidenceExcerpt: '' })),
      'utf8'
    );
    const badPrRes = validateEditorialPullRequest({
      dataDir: DATA_DIR,
      governanceDir: tmpGov,
      skipCatalogDryRun: true
    });
    assert.equal(badPrRes.valid, false);
    assert.ok(badPrRes.errors.length >= 2);
  } finally {
    fs.rmSync(tmpGov, { recursive: true, force: true });
  }
});

// ============================================================================
// TEST 8: Quarantine Release 5-Gate Protection (Never Releases on Reachability Alone!)
// ============================================================================
test('8. Quarantine release enforces all 5 gates and NEVER releases merely because a government website became reachable', () => {
  const baseRelease: QuarantineReleaseRequest = {
    schemaVersion: PHASE6_GOVERNANCE_SCHEMA_VERSION,
    releaseRequestId: 'QREL-2026-11-25-001',
    quarantineId: 'QRN-PROGRAM-TEST001',
    recordId: 'us-h1b-specialty',
    entityType: 'program',
    countryIso: 'US',
    riskLevel: 'HIGH_RISK',
    triggerReason: 'HUMAN_VERIFIED_EVIDENCE_REVIEW',
    evidenceAvailable: true,
    officialSourceId: 'SRC-US-USCIS-U-S-DEPARTMENT-OF-LABOR-DOL',
    officialSourceUrl: 'https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations',
    evidenceExcerpt: 'USCIS confirms H-1B Specialty Occupations statutory cap and rules.',
    evidenceExpiresAt: '2027-11-25T00:00:00Z',
    schemaValidationPassed: true,
    staticCatalogValidationPassed: true,
    conflictingSourcesResolved: true,
    approvals: [
      {
        decisionId: 'DEC-REL-001',
        actor: SENIOR_ACTOR,
        decision: 'RELEASE_FROM_QUARANTINE',
        decisionTimestamp: '2026-11-25T10:30:00Z',
        reason: 'Verified official USCIS guidance and passed full schema & catalog checks.',
        reviewerNotes: 'All 5 quarantine release gates satisfied.'
      }
    ],
    requestedAt: '2026-11-25T10:25:00Z',
    pullRequestRef: 'https://github.com/visaapply-org/visaapply/pull/105'
  };

  // All 5 gates satisfied -> release allowed
  const okRelease = evaluateQuarantineRelease(baseRelease, { now: new Date('2026-11-25T11:00:00Z') });
  assert.equal(okRelease.releaseAllowed, true);
  assert.equal(okRelease.gates.evidenceAvailable, true);
  assert.equal(okRelease.gates.schemaValidationPassed, true);
  assert.equal(okRelease.gates.requiredReviewerApprovalObtained, true);
  assert.equal(okRelease.gates.highRiskReviewSatisfied, true);
  assert.equal(okRelease.gates.staticCatalogValidationPassed, true);

  // Triggered solely because website became reachable again -> STRICTLY BLOCKED
  const reachabilityOnly = evaluateQuarantineRelease({
    ...baseRelease,
    triggerReason: 'SOURCE_BECAME_REACHABLE_ONLY'
  });
  assert.equal(reachabilityOnly.releaseAllowed, false);
  assert.ok(reachabilityOnly.errors.some((e) => e.includes('REACHABILITY_DOES_NOT_PROVE_CLAIM_ACCURACY')));

  // Missing Senior Reviewer approval (only Country Editor approved HIGH_RISK) -> BLOCKED
  const lowRoleRelease = evaluateQuarantineRelease({
    ...baseRelease,
    approvals: [{ ...baseRelease.approvals[0], actor: COUNTRY_EDITOR }]
  });
  assert.equal(lowRoleRelease.releaseAllowed, false);
  assert.equal(lowRoleRelease.gates.highRiskReviewSatisfied, false);

  // Failed static catalog validation -> BLOCKED
  const failedCatalogRelease = evaluateQuarantineRelease({
    ...baseRelease,
    staticCatalogValidationPassed: false
  });
  assert.equal(failedCatalogRelease.releaseAllowed, false);
  assert.equal(failedCatalogRelease.gates.staticCatalogValidationPassed, false);
});

// ============================================================================
// TEST 9, 10 & 11: Append-Only Audit Trail, Duplicate Approval & Unauthorized Merge Protection
// ============================================================================
test('9-11. Append-only SHA-256 audit trail detects tampering/deletions; duplicate approvals & unauthorized merges are blocked', () => {
  const prop1 = makeProposal();
  const res1 = recordEditorialDecision({
    proposal: prop1,
    actor: SENIOR_ACTOR,
    decision: 'APPROVE',
    reason: 'Initial senior reviewer approval.',
    pullRequestRef: 'https://github.com/visaapply-org/visaapply/pull/101',
    commitSha: '1111111111111111111111111111111111111111',
    previousAuditEventHash: null,
    now: new Date('2026-11-25T10:00:00Z')
  });
  assert.equal(res1.accepted, true);
  const approvedProp = res1.updatedProposal!;
  const ev1 = res1.auditEvent!;

  // Duplicate approval by the exact same reviewer MUST be rejected
  const dupAttempt = recordEditorialDecision({
    proposal: approvedProp,
    actor: SENIOR_ACTOR,
    decision: 'APPROVE',
    reason: 'Duplicate approval attempt',
    pullRequestRef: 'https://github.com/visaapply-org/visaapply/pull/101',
    commitSha: '1111111111111111111111111111111111111111',
    previousAuditEventHash: ev1.eventHash,
    now: new Date('2026-11-25T10:05:00Z')
  });
  assert.equal(dupAttempt.accepted, false);
  assert.equal(dupAttempt.code, 'DUPLICATE_APPROVAL_REJECTED');

  // Append-only correction creates a second event referencing supersedesEventId & previousEventHash
  const ev2 = createSignedAuditEvent({
    recordId: approvedProp.recordId,
    changeProposalId: approvedProp.proposalId,
    countryIso: approvedProp.countryIso,
    riskLevel: 'HIGH_RISK',
    previousValue: approvedProp.previousValue,
    proposedValue: approvedProp.proposedValue,
    finalApprovedValue: approvedProp.proposedValue,
    evidenceReference: ev1.evidenceReference,
    reviewerIdentity: ADMIN_ACTOR,
    decision: 'APPROVE',
    decisionTimestamp: '2026-11-25T10:20:00Z',
    pullRequestRef: 'https://github.com/visaapply-org/visaapply/pull/101',
    commitSha: '2222222222222222222222222222222222222222',
    reason: 'Secondary administrator counter-signature confirming effective date.',
    supersedesEventId: ev1.auditEventId,
    previousEventHash: ev1.eventHash
  });

  // Valid 2-event append-only chain passes against [ev1] baseline
  const validChain = verifyAppendOnlyAuditTrail([ev1, ev2], [ev1]);
  assert.equal(validChain.valid, true);
  assert.equal(validChain.eventCount, 2);

  // Silent rewrite of ev1 reason MUST be detected as tampering AND append-only violation
  const tamperedEv1: EditorialAuditEvent = { ...ev1, reason: 'Silently altered history' };
  const tamperedCheck = verifyAppendOnlyAuditTrail([tamperedEv1, ev2], [ev1]);
  assert.equal(tamperedCheck.valid, false);
  assert.ok(tamperedCheck.errors.some((e) => e.includes('SHA-256 tamper mismatch')));

  // Deleting historical event MUST be detected
  const deletedCheck = verifyAppendOnlyAuditTrail([], [ev1]);
  assert.equal(deletedCheck.valid, false);
  assert.ok(deletedCheck.errors.some((e) => e.includes('APPEND_ONLY_VIOLATION')));

  // Merge authorization: Country Editor & AI Bot CANNOT merge; Senior Reviewer CAN merge when checks pass
  const unauthorizedMerge = evaluatePullRequestMergeAuthorization({
    merger: COUNTRY_EDITOR,
    proposals: [approvedProp],
    mandatoryChecksPassed: true
  });
  assert.equal(unauthorizedMerge.allowed, false);
  assert.ok(unauthorizedMerge.errors.some((e) => e.includes('UNAUTHORIZED_MERGE_ROLE')));

  const botMerge = evaluatePullRequestMergeAuthorization({
    merger: AI_BOT_ACTOR,
    proposals: [approvedProp],
    mandatoryChecksPassed: true
  });
  assert.equal(botMerge.allowed, false);
  assert.ok(botMerge.errors.some((e) => e.includes('BOT_MERGE_FORBIDDEN')));

  const failedChecksMerge = evaluatePullRequestMergeAuthorization({
    merger: SENIOR_ACTOR,
    proposals: [approvedProp],
    mandatoryChecksPassed: false
  });
  assert.equal(failedChecksMerge.allowed, false);
  assert.ok(failedChecksMerge.errors.some((e) => e.includes('MANDATORY_CHECKS_FAILED')));

  const validMerge = evaluatePullRequestMergeAuthorization({
    merger: ADMIN_ACTOR,
    proposals: [approvedProp],
    mandatoryChecksPassed: true
  });
  assert.equal(validMerge.allowed, true);
});

// ============================================================================
// TEST 12, 13 & 14: GitHub Configs, PII Scan, Regeneration Rollback, UI Render & DB Immutability
// ============================================================================
test('12-14. GitHub CODEOWNERS/PR template/workflow security, UI workbench render, regeneration rollback & DB immutability', () => {
  // 1. Validate .github/CODEOWNERS, PR template, and untrusted-PR-safe workflow
  const codeownersPath = path.join(ROOT_DIR, '.github/CODEOWNERS');
  const prTemplatePath = path.join(ROOT_DIR, '.github/pull_request_template.md');
  const prWorkflowPath = path.join(ROOT_DIR, '.github/workflows/editorial-pr-validation.yml');

  assert.equal(fs.existsSync(codeownersPath), true);
  assert.equal(fs.existsSync(prTemplatePath), true);
  assert.equal(fs.existsSync(prWorkflowPath), true);

  const codeowners = fs.readFileSync(codeownersPath, 'utf8');
  assert.ok(codeowners.includes('/data/programs/'));
  assert.ok(codeowners.includes('/data/editorial-governance/'));
  assert.ok(codeowners.includes('@visaapply-org/senior-immigration-reviewers'));

  const prWorkflow = fs.readFileSync(prWorkflowPath, 'utf8');
  assert.match(prWorkflow, /pull_request:/);
  assert.equal(prWorkflow.includes('pull_request_target'), false, 'Untrusted PR workflow must NEVER use pull_request_target');
  assert.match(prWorkflow, /permissions:\s*\n\s*contents:\s*read/);
  assert.equal(prWorkflow.includes('secrets.'), false, 'Untrusted PR workflow must NOT access repository secrets');
  assert.ok(prWorkflow.includes('validateEditorialPullRequest.ts'));
  assert.equal(detectProhibitedPublicSecretsOrPii(prWorkflow).length, 0);

  // 2. Verify EditorialReviewQueuePage renders cleanly via React SSR with zero secrets & GitHub enforcement notice
  const sampleProp = makeProposal();
  const md = buildGithubReviewMarkdown({
    proposal: sampleProp,
    decision: 'APPROVE',
    reviewerNotes: 'Checked against official USCIS fee schedule.'
  });
  assert.ok(md.includes(sampleProp.proposalId));
  assert.ok(md.includes(sampleProp.officialSourceUrl));

  const html = renderToStaticMarkup(
    React.createElement(EditorialReviewQueuePage, {
      onNavigate: () => {},
      initialProposals: [sampleProp]
    })
  );
  assert.ok(html.includes('Authoritative Approvals &amp; Merges Are Enforced Exclusively by GitHub'));
  assert.ok(html.includes(sampleProp.proposalId));
  assert.ok(html.includes('Previous Published Value'));
  assert.ok(html.includes('Proposed New Value'));
  assert.ok(html.includes('Prepare Approve Review'));
  assert.ok(html.includes('@visaapply-org/senior-immigration-reviewers'));

  // 3. Static catalog regeneration after approved change & rollback preservation on validation failure
  const tmpPublic = makeTempDir('visaapply-6-regen-');
  try {
    const tmpCatalog = path.join(tmpPublic, 'catalog');
    const tmpSitemaps = path.join(tmpPublic, 'sitemaps-static');
    const tmpMon = path.join(tmpPublic, 'monitoring');

    const okRegen = runSafeCatalogRegeneration({
      dataDir: DATA_DIR,
      publicDir: tmpPublic,
      catalogOutDir: tmpCatalog,
      sitemapOutDir: tmpSitemaps,
      monitoringDir: tmpMon
    });
    assert.equal(okRegen.succeeded, true);
    const knownGoodManifestSha = sha256File(path.join(tmpCatalog, 'manifest.json'));

    // Failed validation preserves known-good catalog
    const failedRegen = runSafeCatalogRegeneration({
      dataDir: DATA_DIR,
      publicDir: tmpPublic,
      catalogOutDir: tmpCatalog,
      sitemapOutDir: tmpSitemaps,
      monitoringDir: tmpMon,
      injectPostBuildFailure: true
    });
    assert.equal(failedRegen.succeeded, false);
    assert.equal(failedRegen.previousOutputPreservedOnFailure, true);
    assert.equal(sha256File(path.join(tmpCatalog, 'manifest.json')), knownGoodManifestSha);
  } finally {
    fs.rmSync(tmpPublic, { recursive: true, force: true });
  }

  // 4. Protected SQLite DB / WAL / SHM & Phase B.3 Backup SHA-256 immutability
  const protectedFiles: Array<[string, string]> = [
    ['data_db/immigration_hub.db', '936faacbb233ab114dc9e90393ff2aa93d7a3ff4ca5c2231de1cf1d2f48820d4'],
    ['data_db/immigration_hub.db-wal', '72698faadb3e0d3e8b9525222fd544a82b37fd2ccb13940b64676e87856be09f'],
    ['data_db/immigration_hub.db-shm', '70d1f2ac7d8a9a06c39f06e8b5ced61b1f9fd9a6d3cccd28a223713bbfcd6b7f'],
    [
      'backups/phase_b3_verified_2026-11-23T10-31-07-923Z_ac57/immigration_hub_standalone.db',
      '827494c04201f9ea4adcd7530566f41e9c7f091c1507b59abd95b1d8d7fb4e03'
    ]
  ];
  for (const [rel, expected] of protectedFiles) {
    const abs = path.join(ROOT_DIR, rel);
    if (fs.existsSync(abs)) {
      assert.equal(sha256File(abs), expected, `Protected SQLite/backup file modified: ${rel}`);
    }
  }
});
