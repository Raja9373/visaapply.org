/**
 * VISAAPPLY.ORG — PHASE 6: EDITORIAL APPROVAL, RBAC ENFORCEMENT,
 * QUARANTINE RELEASE & APPEND-ONLY AUDIT TRAIL ENGINE
 *
 * Implements Sections 3, 5, 6, 7, and 8 of Phase 6:
 * - Strict 5-role RBAC enforcement (Administrator, Senior Immigration Reviewer,
 *   Country Editor, Evidence Reviewer, Read-only Auditor)
 * - Fail-closed LOW_RISK vs HIGH_RISK classification
 * - Duplicate-approval prevention, self-approval block on HIGH_RISK, AI-only approval block
 * - Official HTTPS evidence & expiration verification; conflicting-source quarantine lock
 * - 5-Gate Quarantine Release evaluator (NEVER auto-releases merely because site is reachable!)
 * - Tamper-evident SHA-256 chain-hashed append-only Audit Trail verification
 * - Pull Request merge authorization check
 */

import crypto from 'node:crypto';

import {
  detectProhibitedPublicSecretsOrPii,
  deterministicShortHash,
  isValidCanonicalIso2,
  isValidOfficialSourceId,
  validateOfficialHttpsUrl
} from '../../src/schemas/catalogSchemas';
import {
  EDITORIAL_DECISIONS,
  EDITORIAL_ROLES,
  PHASE6_GOVERNANCE_SCHEMA_VERSION,
  classifyEditorialRisk,
  hasEditorialPermission,
  isIsoTimestampLike,
  isValidGithubHandle,
  type EditorialActorIdentity,
  type EditorialAuditEvent,
  type EditorialChangeProposal,
  type EditorialDecision,
  type EditorialPermission,
  type EditorialReviewDecisionRecord,
  type QuarantineReleaseRequest
} from '../../src/schemas/editorialGovernanceSchemas';

// ============================================================================
// 1. RBAC AUTHORIZATION HELPERS
// ============================================================================

export function assertRolePermission(
  actor: EditorialActorIdentity,
  permission: EditorialPermission
): { allowed: true } | { allowed: false; code: string; reason: string } {
  if (!EDITORIAL_ROLES.includes(actor.role)) {
    return {
      allowed: false,
      code: 'INVALID_ROLE',
      reason: `Unrecognized editorial role "${String(actor.role)}".`
    };
  }
  if (!isValidGithubHandle(actor.githubHandle)) {
    return {
      allowed: false,
      code: 'INVALID_GITHUB_IDENTITY',
      reason: `Reviewer identity "${actor.githubHandle}" must be a valid GitHub handle without email/PII.`
    };
  }
  if (!hasEditorialPermission(actor.role, permission)) {
    return {
      allowed: false,
      code: 'UNAUTHORIZED_ROLE_ACTION',
      reason: `Role "${actor.role}" is not authorized to perform "${permission}".`
    };
  }
  return { allowed: true };
}

// ============================================================================
// 2. TAMPER-EVIDENT APPEND-ONLY AUDIT TRAIL HASHING (SECTION 7)
// ============================================================================

export function computeAuditEventHash(event: Omit<EditorialAuditEvent, 'eventHash'>): string {
  const canonicalPayload = JSON.stringify({
    schemaVersion: event.schemaVersion,
    auditEventId: event.auditEventId,
    recordId: event.recordId,
    changeProposalId: event.changeProposalId,
    countryIso: event.countryIso,
    riskLevel: event.riskLevel,
    previousValue: event.previousValue,
    proposedValue: event.proposedValue,
    finalApprovedValue: event.finalApprovedValue,
    evidenceReference: event.evidenceReference,
    reviewerIdentity: event.reviewerIdentity,
    decision: event.decision,
    decisionTimestamp: event.decisionTimestamp,
    pullRequestRef: event.pullRequestRef,
    commitSha: event.commitSha,
    reason: event.reason,
    supersedesEventId: event.supersedesEventId,
    previousEventHash: event.previousEventHash
  });
  return crypto.createHash('sha256').update(canonicalPayload, 'utf8').digest('hex');
}

export function createSignedAuditEvent(
  input: Omit<EditorialAuditEvent, 'schemaVersion' | 'auditEventId' | 'eventHash'> & { auditEventId?: string }
): EditorialAuditEvent {
  const auditEventId =
    input.auditEventId ??
    `AUD-${input.decisionTimestamp.slice(0, 10)}-${deterministicShortHash([
      input.changeProposalId,
      input.recordId,
      input.reviewerIdentity.githubHandle,
      input.decision,
      input.decisionTimestamp
    ])}`;

  const body: Omit<EditorialAuditEvent, 'eventHash'> = {
    schemaVersion: PHASE6_GOVERNANCE_SCHEMA_VERSION,
    auditEventId,
    recordId: input.recordId,
    changeProposalId: input.changeProposalId,
    countryIso: input.countryIso,
    riskLevel: input.riskLevel,
    previousValue: input.previousValue,
    proposedValue: input.proposedValue,
    finalApprovedValue: input.finalApprovedValue,
    evidenceReference: input.evidenceReference,
    reviewerIdentity: input.reviewerIdentity,
    decision: input.decision,
    decisionTimestamp: input.decisionTimestamp,
    pullRequestRef: input.pullRequestRef,
    commitSha: input.commitSha,
    reason: input.reason,
    supersedesEventId: input.supersedesEventId,
    previousEventHash: input.previousEventHash
  };

  return {
    ...body,
    eventHash: computeAuditEventHash(body)
  };
}

export interface AuditTrailVerificationResult {
  valid: boolean;
  eventCount: number;
  errors: string[];
}

/**
 * Verifies append-only integrity, SHA-256 hash chaining, required fields,
 * and zero PII/secrets across the audit ledger. When `baselineEvents` is
 * supplied (e.g., from `main`), confirms no historical events were deleted or rewritten.
 */
export function verifyAppendOnlyAuditTrail(
  events: EditorialAuditEvent[],
  baselineEvents?: EditorialAuditEvent[]
): AuditTrailVerificationResult {
  const errors: string[] = [];
  if (!Array.isArray(events)) {
    return { valid: false, eventCount: 0, errors: ['Audit log must be a JSON array.'] };
  }

  const seenIds = new Set<string>();
  let expectedPrevHash: string | null = null;

  events.forEach((ev, idx) => {
    const pii = detectProhibitedPublicSecretsOrPii(ev);
    for (const msg of pii) {
      errors.push(`Audit event[${idx}] (${ev.auditEventId}): PII/secret detected — ${msg}`);
    }

    if (ev.schemaVersion !== PHASE6_GOVERNANCE_SCHEMA_VERSION) {
      errors.push(`Audit event[${idx}]: invalid schemaVersion "${ev.schemaVersion}".`);
    }
    if (!ev.auditEventId || seenIds.has(ev.auditEventId)) {
      errors.push(`Audit event[${idx}]: missing or duplicate auditEventId "${ev.auditEventId}".`);
    } else {
      seenIds.add(ev.auditEventId);
    }
    if (!ev.recordId || !ev.changeProposalId) {
      errors.push(`Audit event[${idx}]: recordId and changeProposalId are required.`);
    }
    if (!isValidGithubHandle(ev.reviewerIdentity?.githubHandle)) {
      errors.push(`Audit event[${idx}]: invalid reviewer GitHub handle "${ev.reviewerIdentity?.githubHandle}".`);
    }
    if (!EDITORIAL_ROLES.includes(ev.reviewerIdentity?.role)) {
      errors.push(`Audit event[${idx}]: invalid reviewer role "${ev.reviewerIdentity?.role}".`);
    }
    if (!EDITORIAL_DECISIONS.includes(ev.decision)) {
      errors.push(`Audit event[${idx}]: invalid decision "${ev.decision}".`);
    }
    if (!isIsoTimestampLike(ev.decisionTimestamp)) {
      errors.push(`Audit event[${idx}]: invalid decisionTimestamp "${ev.decisionTimestamp}".`);
    }
    if (!ev.pullRequestRef || !ev.commitSha || !ev.reason) {
      errors.push(`Audit event[${idx}]: pullRequestRef, commitSha, and reason are required.`);
    }
    if (ev.previousEventHash !== expectedPrevHash) {
      errors.push(
        `Audit event[${idx}] (${ev.auditEventId}): broken hash chain (expected previousEventHash="${expectedPrevHash}", got "${ev.previousEventHash}").`
      );
    }

    const { eventHash, ...withoutHash } = ev;
    const recomputed = computeAuditEventHash(withoutHash);
    if (eventHash !== recomputed) {
      errors.push(`Audit event[${idx}] (${ev.auditEventId}): SHA-256 tamper mismatch (expected ${recomputed}, got ${eventHash}).`);
    }

    if (ev.supersedesEventId && !seenIds.has(ev.supersedesEventId)) {
      errors.push(
        `Audit event[${idx}] (${ev.auditEventId}): supersedesEventId "${ev.supersedesEventId}" must reference an earlier audit event.`
      );
    }

    expectedPrevHash = eventHash;
  });

  // Enforce strict append-only prefix match against baseline log
  if (baselineEvents && baselineEvents.length > 0) {
    if (events.length < baselineEvents.length) {
      errors.push(
        `APPEND_ONLY_VIOLATION: Audit log shrank from ${baselineEvents.length} to ${events.length} events (historical deletion forbidden).`
      );
    } else {
      for (let i = 0; i < baselineEvents.length; i++) {
        if (
          events[i].auditEventId !== baselineEvents[i].auditEventId ||
          events[i].eventHash !== baselineEvents[i].eventHash
        ) {
          errors.push(
            `APPEND_ONLY_VIOLATION: Historical audit event[${i}] ("${baselineEvents[i].auditEventId}") was modified or rewritten.`
          );
        }
      }
    }
  }

  return { valid: errors.length === 0, eventCount: events.length, errors };
}

// ============================================================================
// 3. PROPOSAL VALIDATION & DECISION RECORDING (SECTIONS 3, 5, 7)
// ============================================================================

export function validateEditorialChangeProposal(
  proposal: EditorialChangeProposal,
  options: { now?: Date; knownOfficialSourceIds?: ReadonlySet<string> } = {}
): { valid: boolean; computedRiskLevel: 'LOW_RISK' | 'HIGH_RISK'; errors: string[] } {
  const now = options.now ?? new Date();
  const errors: string[] = [];

  for (const finding of detectProhibitedPublicSecretsOrPii(proposal)) {
    errors.push(`PROHIBITED_PUBLIC_DATA: ${finding}`);
  }

  if (proposal.schemaVersion !== PHASE6_GOVERNANCE_SCHEMA_VERSION) {
    errors.push(`INVALID_SCHEMA_VERSION: Expected "${PHASE6_GOVERNANCE_SCHEMA_VERSION}".`);
  }
  if (!proposal.proposalId || !/^PROP-[A-Z0-9-]+$/i.test(proposal.proposalId)) {
    errors.push(`INVALID_PROPOSAL_ID: "${proposal.proposalId}" must match PROP-<ID>.`);
  }
  if (!proposal.recordId || proposal.recordId.trim().length < 2) {
    errors.push('MISSING_RECORD_ID: recordId is required.');
  }
  if (!isValidCanonicalIso2(proposal.countryIso)) {
    errors.push(`INVALID_COUNTRY_ISO2: "${proposal.countryIso}" is not in the canonical 249-country registry.`);
  }

  // Risk classification fail-closed verification
  const computedRiskLevel = classifyEditorialRisk(proposal.changedFields);
  if (computedRiskLevel === 'HIGH_RISK' && proposal.riskLevel !== 'HIGH_RISK') {
    errors.push(
      `RISK_DOWNGRADE_FORBIDDEN: Changed fields [${proposal.changedFields.join(', ')}] are HIGH_RISK and cannot be classified as LOW_RISK.`
    );
  }

  // Official source & evidence checks
  if (!isValidOfficialSourceId(proposal.officialSourceId)) {
    errors.push(`INVALID_OFFICIAL_SOURCE_ID: "${proposal.officialSourceId}".`);
  } else if (options.knownOfficialSourceIds && !options.knownOfficialSourceIds.has(proposal.officialSourceId)) {
    errors.push(`UNKNOWN_OFFICIAL_SOURCE_REF: Source "${proposal.officialSourceId}" is not in data/official-sources/.`);
  }

  const urlCheck = validateOfficialHttpsUrl(proposal.officialSourceUrl);
  if (!urlCheck.valid) {
    errors.push(`INVALID_OFFICIAL_URL: ${urlCheck.reason}`);
  }
  if (!proposal.evidenceExcerpt || proposal.evidenceExcerpt.trim().length < 8) {
    errors.push('MISSING_EVIDENCE_EXCERPT: Supporting excerpt from official government source is required.');
  }
  if (!isIsoTimestampLike(proposal.evidenceRetrievedAt)) {
    errors.push('INVALID_EVIDENCE_TIMESTAMP: evidenceRetrievedAt must be ISO-8601.');
  }
  if (!isIsoTimestampLike(proposal.sourceLastCheckedTimestamp)) {
    errors.push('INVALID_LAST_CHECKED_TIMESTAMP: sourceLastCheckedTimestamp must be ISO-8601.');
  }
  if (proposal.evidenceExpiresAt && new Date(proposal.evidenceExpiresAt).getTime() < now.getTime()) {
    errors.push(`EXPIRED_EVIDENCE: Evidence expired at ${proposal.evidenceExpiresAt} and cannot support publication.`);
  }

  // Conflicting sources cannot be approved
  if (
    proposal.conflictingSourceIds.length > 0 &&
    (proposal.lifecycleStatus === 'APPROVED_READY_FOR_MERGE' || proposal.lifecycleStatus === 'MERGED')
  ) {
    errors.push(
      `CONFLICTING_SOURCES_QUARANTINE_REQUIRED: Proposal cites conflicting official sources [${proposal.conflictingSourceIds.join(', ')}] and must remain quarantined until resolved.`
    );
  }

  // Validate recorded decisions for duplicates, unauthorized roles, self-approval, and AI-only approval
  const approverHandles = new Set<string>();
  const proposerBare = proposal.proposedBy.githubHandle.replace(/^@/, '').toLowerCase();

  for (const dec of proposal.decisions) {
    const bareHandle = dec.actor.githubHandle.replace(/^@/, '').toLowerCase();
    if (!isValidGithubHandle(dec.actor.githubHandle)) {
      errors.push(`INVALID_REVIEWER_HANDLE: "${dec.actor.githubHandle}".`);
      continue;
    }

    if (dec.decision === 'APPROVE') {
      if (approverHandles.has(bareHandle)) {
        errors.push(`DUPLICATE_APPROVAL_REJECTED: Reviewer "${dec.actor.githubHandle}" approved proposal "${proposal.proposalId}" more than once.`);
      }
      approverHandles.add(bareHandle);

      const reqPerm: EditorialPermission =
        computedRiskLevel === 'HIGH_RISK' ? 'APPROVE_HIGH_RISK_CHANGES' : 'APPROVE_LOW_RISK_CHANGES';
      const permCheck = assertRolePermission(dec.actor, reqPerm);
      if (!permCheck.allowed) {
        errors.push(`UNAUTHORIZED_APPROVAL: ${permCheck.reason}`);
      }

      if (computedRiskLevel === 'HIGH_RISK') {
        if (dec.actor.isBotOrAi) {
          errors.push('AI_ONLY_HIGH_RISK_APPROVAL_FORBIDDEN: Bots/AI systems cannot approve HIGH_RISK immigration changes.');
        }
        if (bareHandle === proposerBare) {
          errors.push(
            `SELF_APPROVAL_FORBIDDEN_FOR_HIGH_RISK: Proposer "${dec.actor.githubHandle}" cannot self-approve HIGH_RISK change "${proposal.proposalId}".`
          );
        }
      }
    } else if (dec.decision === 'REJECT' || dec.decision === 'REQUEST_CHANGES' || dec.decision === 'QUARANTINE') {
      const permCheck = assertRolePermission(dec.actor, 'REVIEW_EVIDENCE');
      if (!permCheck.allowed) {
        errors.push(`UNAUTHORIZED_REVIEW_ACTION: ${permCheck.reason}`);
      }
    }
  }

  // High-risk proposals marked APPROVED_READY_FOR_MERGE MUST have at least one valid human Senior/Admin approval
  if (proposal.lifecycleStatus === 'APPROVED_READY_FOR_MERGE' || proposal.lifecycleStatus === 'MERGED') {
    const hasValidApproval = proposal.decisions.some((d) => {
      if (d.decision !== 'APPROVE') return false;
      if (computedRiskLevel === 'HIGH_RISK') {
        const bare = d.actor.githubHandle.replace(/^@/, '').toLowerCase();
        return (
          !d.actor.isBotOrAi &&
          bare !== proposerBare &&
          hasEditorialPermission(d.actor.role, 'APPROVE_HIGH_RISK_CHANGES')
        );
      }
      return hasEditorialPermission(d.actor.role, 'APPROVE_LOW_RISK_CHANGES');
    });

    if (!hasValidApproval) {
      errors.push(
        `MISSING_REQUIRED_APPROVAL: Proposal "${proposal.proposalId}" (${computedRiskLevel}) lacks required authorized human approval.`
      );
    }
  }

  return { valid: errors.length === 0, computedRiskLevel, errors };
}

export interface RecordDecisionResult {
  accepted: boolean;
  code: string;
  reason: string;
  updatedProposal?: EditorialChangeProposal;
  auditEvent?: EditorialAuditEvent;
}

export function recordEditorialDecision(params: {
  proposal: EditorialChangeProposal;
  actor: EditorialActorIdentity;
  decision: EditorialDecision;
  reason: string;
  reviewerNotes?: string;
  pullRequestRef: string;
  commitSha: string;
  previousAuditEventHash: string | null;
  supersedesEventId?: string | null;
  now?: Date;
}): RecordDecisionResult {
  const now = params.now ?? new Date();
  const timestamp = now.toISOString();
  const computedRisk = classifyEditorialRisk(params.proposal.changedFields);

  // 1. Check role permission for requested decision
  const requiredPermission: EditorialPermission =
    params.decision === 'APPROVE'
      ? computedRisk === 'HIGH_RISK'
        ? 'APPROVE_HIGH_RISK_CHANGES'
        : 'APPROVE_LOW_RISK_CHANGES'
      : params.decision === 'RELEASE_FROM_QUARANTINE'
        ? 'APPROVE_HIGH_RISK_CHANGES'
        : 'REVIEW_EVIDENCE';

  const perm = assertRolePermission(params.actor, requiredPermission);
  if (!perm.allowed) {
    return { accepted: false, code: perm.code, reason: perm.reason };
  }

  if (!params.reason || params.reason.trim().length < 5) {
    return { accepted: false, code: 'REASON_REQUIRED', reason: 'A substantive review reason is required for auditability.' };
  }

  // 2. Enforce approval-specific safety gates
  if (params.decision === 'APPROVE') {
    const actorBare = params.actor.githubHandle.replace(/^@/, '').toLowerCase();
    const proposerBare = params.proposal.proposedBy.githubHandle.replace(/^@/, '').toLowerCase();

    const alreadyApproved = params.proposal.decisions.some(
      (d) => d.decision === 'APPROVE' && d.actor.githubHandle.replace(/^@/, '').toLowerCase() === actorBare
    );
    if (alreadyApproved) {
      return {
        accepted: false,
        code: 'DUPLICATE_APPROVAL_REJECTED',
        reason: `Reviewer "${params.actor.githubHandle}" has already approved proposal "${params.proposal.proposalId}".`
      };
    }

    if (computedRisk === 'HIGH_RISK' && params.actor.isBotOrAi) {
      return {
        accepted: false,
        code: 'AI_ONLY_HIGH_RISK_APPROVAL_FORBIDDEN',
        reason: 'AI/bot actors are strictly prohibited from approving HIGH_RISK legal or statutory changes.'
      };
    }

    if (computedRisk === 'HIGH_RISK' && actorBare === proposerBare) {
      return {
        accepted: false,
        code: 'SELF_APPROVAL_FORBIDDEN_FOR_HIGH_RISK',
        reason: 'Proposer cannot self-approve a HIGH_RISK immigration change; independent reviewer required.'
      };
    }

    if (params.proposal.conflictingSourceIds.length > 0) {
      return {
        accepted: false,
        code: 'CONFLICTING_SOURCES_MUST_REMAIN_QUARANTINED',
        reason: 'Conflicting official sources must be resolved before approving this proposal.'
      };
    }

    const urlCheck = validateOfficialHttpsUrl(params.proposal.officialSourceUrl);
    if (!urlCheck.valid || !params.proposal.evidenceExcerpt.trim()) {
      return {
        accepted: false,
        code: 'MISSING_OR_INVALID_OFFICIAL_EVIDENCE',
        reason: urlCheck.reason || 'Valid official HTTPS source URL and excerpt are mandatory before approval.'
      };
    }

    if (
      params.proposal.evidenceExpiresAt &&
      new Date(params.proposal.evidenceExpiresAt).getTime() < now.getTime()
    ) {
      return {
        accepted: false,
        code: 'EXPIRED_EVIDENCE_REJECTED',
        reason: `Evidence expired at ${params.proposal.evidenceExpiresAt}; fresh official verification required.`
      };
    }
  }

  const decisionRecord: EditorialReviewDecisionRecord = {
    decisionId: `DEC-${deterministicShortHash([params.proposal.proposalId, params.actor.githubHandle, params.decision, timestamp])}`,
    actor: params.actor,
    decision: params.decision,
    decisionTimestamp: timestamp,
    reason: params.reason.trim(),
    reviewerNotes: (params.reviewerNotes ?? params.reason).trim()
  };

  const nextLifecycleStatus: EditorialChangeProposal['lifecycleStatus'] =
    params.decision === 'APPROVE'
      ? 'APPROVED_READY_FOR_MERGE'
      : params.decision === 'REJECT'
        ? 'REJECTED'
        : params.decision === 'REQUEST_CHANGES'
          ? 'CHANGES_REQUESTED'
          : params.decision === 'QUARANTINE'
            ? 'QUARANTINED'
            : params.proposal.lifecycleStatus;

  const updatedProposal: EditorialChangeProposal = {
    ...params.proposal,
    riskLevel: computedRisk,
    lifecycleStatus: nextLifecycleStatus,
    finalApprovedValue:
      params.decision === 'APPROVE' ? params.proposal.proposedValue : params.proposal.finalApprovedValue,
    verificationStatus:
      params.decision === 'APPROVE'
        ? 'CLAIM_APPROVED_FOR_PUBLICATION'
        : params.decision === 'QUARANTINE'
          ? 'QUARANTINED'
          : params.proposal.verificationStatus,
    pullRequestRef: params.pullRequestRef,
    commitSha: params.commitSha,
    decisions: [...params.proposal.decisions, decisionRecord]
  };

  const auditEvent = createSignedAuditEvent({
    recordId: updatedProposal.recordId,
    changeProposalId: updatedProposal.proposalId,
    countryIso: updatedProposal.countryIso,
    riskLevel: computedRisk,
    previousValue: updatedProposal.previousValue,
    proposedValue: updatedProposal.proposedValue,
    finalApprovedValue: params.decision === 'APPROVE' ? updatedProposal.proposedValue : null,
    evidenceReference: {
      officialSourceId: updatedProposal.officialSourceId,
      officialSourceUrl: updatedProposal.officialSourceUrl,
      evidenceExcerpt: updatedProposal.evidenceExcerpt,
      evidenceRetrievedAt: updatedProposal.evidenceRetrievedAt
    },
    reviewerIdentity: {
      githubHandle: params.actor.githubHandle,
      role: params.actor.role,
      isBotOrAi: params.actor.isBotOrAi
    },
    decision: params.decision,
    decisionTimestamp: timestamp,
    pullRequestRef: params.pullRequestRef,
    commitSha: params.commitSha,
    reason: params.reason.trim(),
    supersedesEventId: params.supersedesEventId ?? null,
    previousEventHash: params.previousAuditEventHash
  });

  return {
    accepted: true,
    code: 'DECISION_RECORDED',
    reason: `Decision "${params.decision}" recorded by ${params.actor.githubHandle} (${params.actor.role}).`,
    updatedProposal,
    auditEvent
  };
}

// ============================================================================
// 4. PULL REQUEST MERGE AUTHORIZATION GATE (SECTION 3 & 6)
// ============================================================================

export function evaluatePullRequestMergeAuthorization(params: {
  merger: EditorialActorIdentity;
  proposals: EditorialChangeProposal[];
  mandatoryChecksPassed: boolean;
  knownOfficialSourceIds?: ReadonlySet<string>;
  now?: Date;
}): { allowed: boolean; errors: string[] } {
  const errors: string[] = [];

  const perm = assertRolePermission(params.merger, 'MERGE_APPROVED_PR');
  if (!perm.allowed) {
    errors.push(`UNAUTHORIZED_MERGE_ROLE: ${perm.reason}`);
  }
  if (params.merger.isBotOrAi) {
    errors.push('BOT_MERGE_FORBIDDEN: Automated bots cannot merge editorial Pull Requests.');
  }
  if (!params.mandatoryChecksPassed) {
    errors.push('MANDATORY_CHECKS_FAILED: All required PR validation checks must pass before merging.');
  }

  for (const prop of params.proposals) {
    const val = validateEditorialChangeProposal(prop, {
      now: params.now,
      knownOfficialSourceIds: params.knownOfficialSourceIds
    });
    if (!val.valid) {
      errors.push(...val.errors.map((e) => `[${prop.proposalId}] ${e}`));
    }
    if (prop.lifecycleStatus !== 'APPROVED_READY_FOR_MERGE') {
      errors.push(
        `PROPOSAL_NOT_APPROVED: Proposal "${prop.proposalId}" is in status "${prop.lifecycleStatus}" (must be APPROVED_READY_FOR_MERGE).`
      );
    }
    const latestDecision = prop.decisions[prop.decisions.length - 1];
    if (latestDecision && latestDecision.decision === 'REQUEST_CHANGES') {
      errors.push(`UNRESOLVED_CHANGES_REQUESTED: Proposal "${prop.proposalId}" has unresolved change requests.`);
    }
  }

  return { allowed: errors.length === 0, errors };
}

// ============================================================================
// 5. QUARANTINE RELEASE 5-GATE ENFORCEMENT (SECTION 8)
// ============================================================================

export interface QuarantineReleaseEvaluation {
  releaseAllowed: boolean;
  gates: {
    evidenceAvailable: boolean;
    schemaValidationPassed: boolean;
    requiredReviewerApprovalObtained: boolean;
    highRiskReviewSatisfied: boolean;
    staticCatalogValidationPassed: boolean;
  };
  errors: string[];
}

/**
 * Enforces all 5 mandatory Quarantine Release gates (Section 8).
 * CRITICAL INVARIANT: Never releases a quarantined record merely because an
 * official website becomes reachable again (`SOURCE_BECAME_REACHABLE_ONLY`).
 */
export function evaluateQuarantineRelease(
  req: QuarantineReleaseRequest,
  options: { now?: Date } = {}
): QuarantineReleaseEvaluation {
  const now = options.now ?? new Date();
  const errors: string[] = [];

  // Hard invariant: Website reachability alone NEVER releases quarantine!
  if (req.triggerReason === 'SOURCE_BECAME_REACHABLE_ONLY') {
    errors.push(
      'REACHABILITY_DOES_NOT_PROVE_CLAIM_ACCURACY: A reachable website does not prove an immigration claim is correct; quarantined records cannot be released automatically.'
    );
  }

  // Gate 1: Verified official HTTPS evidence is available and non-expired
  const urlCheck = validateOfficialHttpsUrl(req.officialSourceUrl);
  const evidenceNotExpired =
    !req.evidenceExpiresAt || new Date(req.evidenceExpiresAt).getTime() >= now.getTime();
  const evidenceAvailable =
    req.evidenceAvailable === true &&
    isValidOfficialSourceId(req.officialSourceId) &&
    urlCheck.valid &&
    Boolean(req.evidenceExcerpt && req.evidenceExcerpt.trim().length >= 8) &&
    evidenceNotExpired &&
    req.conflictingSourcesResolved === true;

  if (!evidenceAvailable) {
    errors.push(
      'GATE_1_FAILED_EVIDENCE: Verified, non-expired official HTTPS evidence with excerpt and resolved conflicts is required.'
    );
  }

  // Gate 2: Schema validation passed
  const schemaValidationPassed = req.schemaValidationPassed === true;
  if (!schemaValidationPassed) {
    errors.push('GATE_2_FAILED_SCHEMA: Record must pass canonical static catalog schema validation.');
  }

  // Gate 3 & 4: Required reviewer approval & high-risk review requirements satisfied
  const validApprovals = req.approvals.filter((a) => {
    if (a.decision !== 'APPROVE' && a.decision !== 'RELEASE_FROM_QUARANTINE') return false;
    if (!isValidGithubHandle(a.actor.githubHandle)) return false;
    if (req.riskLevel === 'HIGH_RISK') {
      return !a.actor.isBotOrAi && hasEditorialPermission(a.actor.role, 'APPROVE_HIGH_RISK_CHANGES');
    }
    return !a.actor.isBotOrAi && hasEditorialPermission(a.actor.role, 'APPROVE_LOW_RISK_CHANGES');
  });

  const uniqueApprovers = new Set(validApprovals.map((a) => a.actor.githubHandle.replace(/^@/, '').toLowerCase()));
  const requiredReviewerApprovalObtained = uniqueApprovers.size >= 1;
  if (!requiredReviewerApprovalObtained) {
    errors.push('GATE_3_FAILED_APPROVAL: Authorized human reviewer approval is required to release from quarantine.');
  }

  const highRiskReviewSatisfied =
    req.riskLevel === 'LOW_RISK' ||
    validApprovals.some(
      (a) => !a.actor.isBotOrAi && hasEditorialPermission(a.actor.role, 'APPROVE_HIGH_RISK_CHANGES')
    );
  if (!highRiskReviewSatisfied) {
    errors.push(
      'GATE_4_FAILED_HIGH_RISK_REVIEW: High-risk quarantine release requires explicit Senior Immigration Reviewer or Administrator approval.'
    );
  }

  // Gate 5: Static catalog validation passes
  const staticCatalogValidationPassed = req.staticCatalogValidationPassed === true;
  if (!staticCatalogValidationPassed) {
    errors.push('GATE_5_FAILED_CATALOG_VALIDATION: Full static catalog validation must pass prior to quarantine release.');
  }

  return {
    releaseAllowed: errors.length === 0,
    gates: {
      evidenceAvailable,
      schemaValidationPassed,
      requiredReviewerApprovalObtained,
      highRiskReviewSatisfied,
      staticCatalogValidationPassed
    },
    errors
  };
}
