/**
 * VISAAPPLY.ORG — PHASE 5B: CHANGE DETECTION, EVIDENCE, CLAIM VERIFICATION,
 * RECORD-LEVEL QUARANTINE & SAFE PUBLISHING APPROVAL GATES
 *
 * Implements Sections 4, 5, 6, and 7 of Phase 5B:
 * - Change detection with previous/new fingerprints & preserved published snapshot
 * - Strict status separation (`SOURCE_CHANGED` != `CLAIM_INDEPENDENTLY_VERIFIED` != `CLAIM_APPROVED_FOR_PUBLICATION`)
 * - High-risk immigration claim verification rules (authoritative gov sources only; third-party leads rejected)
 * - Record-level automated quarantine (NEVER quarantines an entire country for one transient source outage)
 * - Safe Publishing Workflow & Human Approval Gate (auto-updates allowed ONLY for deterministic low-risk metadata;
 *   ALL material legal/eligibility/fee/processing/closure/AI/unverified-translation changes blocked pending human review)
 */

import {
  deterministicShortHash,
  generateQuarantineId,
  validateOfficialHttpsUrl,
  type ClaimRecord,
  type ImmigrationProgramRecord
} from '../../src/schemas/catalogSchemas';
import {
  ALLOWED_AUTO_LOW_RISK_FIELDS,
  HIGH_RISK_IMMIGRATION_CLAIM_CATEGORIES,
  PHASE5B_MONITORING_SCHEMA_VERSION,
  validateClaimVerificationReviewRecord,
  type ChangeDetectionRecord,
  type ChangePipelineStatus,
  type ClaimVerificationReviewRecord,
  type EvidenceReviewProposal,
  type Phase5BQuarantineTriggerCode,
  type RecordLevelQuarantineAction,
  type SourceCheckResult,
  type SourceMonitoringRunReport
} from '../../src/schemas/sourceMonitoringSchemas';

// ============================================================================
// 1. CHANGE DETECTION & EVIDENCE PROPOSAL ENGINE (SECTION 4)
// ============================================================================

export interface ChangeDetectionBundle {
  changeRecords: ChangeDetectionRecord[];
  evidenceProposals: EvidenceReviewProposal[];
  recordQuarantines: RecordLevelQuarantineAction[];
}

export function processMonitoringReportForChangesAndQuarantine(params: {
  report: SourceMonitoringRunReport;
  programs: ImmigrationProgramRecord[];
  claims: ClaimRecord[];
}): ChangeDetectionBundle {
  const { report, programs, claims } = params;

  const programsBySourceId = new Map<string, ImmigrationProgramRecord[]>();
  for (const p of programs) {
    for (const ref of p.officialSourceRefs) {
      const arr = programsBySourceId.get(ref.sourceId) ?? [];
      arr.push(p);
      programsBySourceId.set(ref.sourceId, arr);
    }
  }

  const claimsBySourceId = new Map<string, ClaimRecord[]>();
  for (const c of claims) {
    const arr = claimsBySourceId.get(c.officialSourceId) ?? [];
    arr.push(c);
    claimsBySourceId.set(c.officialSourceId, arr);
  }

  const changeRecords: ChangeDetectionRecord[] = [];
  const evidenceProposals: EvidenceReviewProposal[] = [];
  const recordQuarantines: RecordLevelQuarantineAction[] = [];

  for (const result of report.results) {
    const affectedPrograms = programsBySourceId.get(result.sourceId) ?? [];
    const affectedClaims = claimsBySourceId.get(result.sourceId) ?? [];
    const affectedProgramIds = Array.from(new Set(affectedPrograms.map((p) => p.programId))).sort();
    const affectedClaimIds = Array.from(new Set(affectedClaims.map((c) => c.claimId))).sort();

    // Case A: Content fingerprint or HTML structure changed on official source
    if (result.outcome === 'REACHABLE_CHANGED' || result.outcome === 'STRUCTURE_CHANGED') {
      const changeDetectionId = `CHG-DET-${deterministicShortHash([
        report.runId,
        result.sourceId,
        result.newFingerprint || 'none'
      ])}`;
      const proposalId = `EV-${deterministicShortHash([changeDetectionId, result.sourceUrl, result.checkedAt])}`;

      const changeRecord: ChangeDetectionRecord = {
        schemaVersion: PHASE5B_MONITORING_SCHEMA_VERSION,
        changeDetectionId,
        runId: report.runId,
        sourceId: result.sourceId,
        countryIso: result.countryIso,
        sourceUrl: result.sourceUrl,
        detectedAt: result.checkedAt,
        previousFingerprint: result.previousFingerprint,
        newFingerprint: result.newFingerprint,
        pipelineStatus: 'SOURCE_CHANGED',
        affectedProgramIds,
        affectedClaimIds,
        previousPublishedPreserved: true,
        requiresHumanReview: true,
        evidenceProposalId: proposalId,
        summary:
          result.outcome === 'STRUCTURE_CHANGED'
            ? `Official source ${result.sourceId} content fingerprint and page structure changed; previous published catalog preserved pending human legal review.`
            : `Official source ${result.sourceId} content fingerprint changed; previous published catalog preserved pending human legal review.`
      };
      changeRecords.push(changeRecord);

      evidenceProposals.push({
        schemaVersion: PHASE5B_MONITORING_SCHEMA_VERSION,
        proposalId,
        changeDetectionId,
        sourceId: result.sourceId,
        countryIso: result.countryIso,
        evidenceUrl: result.finalUrl || result.sourceUrl,
        retrievalTimestamp: result.checkedAt,
        previousFingerprint: result.previousFingerprint,
        newFingerprint: result.newFingerprint,
        extractedExcerpt: result.extractedExcerpt,
        pipelineStatus: result.extractedExcerpt ? 'SOURCE_CONTENT_EXTRACTED' : 'SOURCE_CHANGED',
        reviewerStatus: 'PENDING_HUMAN_REVIEW',
        notes:
          'Automated content change capture only. Text change is NOT verified statutory fact and requires human review before any catalog update.'
      });

      // If structure changed and no usable excerpt could be extracted, quarantine ONLY affected claim/source record
      if (result.outcome === 'STRUCTURE_CHANGED' && !result.extractedExcerpt) {
        recordQuarantines.push(
          buildRecordLevelQuarantine({
            entityType: 'source',
            entityId: result.sourceId,
            countryIso: result.countryIso,
            triggerCode: 'INCOMPLETE_CONTENT_EXTRACTION',
            reasonSummary: `Page structure changed on ${result.sourceId} with empty extracted content; quarantined at source-record level for re-review.`,
            quarantinedAt: result.checkedAt,
            runId: report.runId,
            sourceId: result.sourceId,
            changeDetectionId
          })
        );
      }
      continue;
    }

    // Case B: Suspicious or unexpected cross-domain redirect -> Record-level quarantine of affected programs/source
    if (result.outcome === 'REDIRECTED_SUSPICIOUS') {
      recordQuarantines.push(
        buildRecordLevelQuarantine({
          entityType: 'source',
          entityId: result.sourceId,
          countryIso: result.countryIso,
          triggerCode: 'SUSPICIOUS_OR_UNEXPECTED_REDIRECT',
          reasonSummary: `Official source ${result.sourceId} redirected unexpectedly to "${result.finalUrl}". Source quarantined at record level without quarantining country ${result.countryIso}.`,
          quarantinedAt: result.checkedAt,
          runId: report.runId,
          sourceId: result.sourceId
        })
      );
      for (const pid of affectedProgramIds) {
        recordQuarantines.push(
          buildRecordLevelQuarantine({
            entityType: 'program',
            entityId: pid,
            countryIso: result.countryIso,
            triggerCode: 'SUSPICIOUS_OR_UNEXPECTED_REDIRECT',
            reasonSummary: `Program "${pid}" relies on source ${result.sourceId} which triggered a suspicious redirect to "${result.finalUrl}". Quarantined at record level; other ${result.countryIso} programs unaffected.`,
            quarantinedAt: result.checkedAt,
            runId: report.runId,
            sourceId: result.sourceId
          })
        );
      }
      continue;
    }

    // Case C: Invalid/unsafe URL -> Record-level quarantine of source only (never whole country)
    if (result.outcome === 'INVALID_OR_UNSAFE_URL') {
      recordQuarantines.push(
        buildRecordLevelQuarantine({
          entityType: 'source',
          entityId: result.sourceId,
          countryIso: result.countryIso,
          triggerCode: 'UNVERIFIABLE_OFFICIAL_SOURCE',
          reasonSummary: `Source ${result.sourceId} failed official HTTPS safety validation: ${result.notes}`,
          quarantinedAt: result.checkedAt,
          runId: report.runId,
          sourceId: result.sourceId
        })
      );
    }

    // Note on HTTP 403/404/429/5xx/TIMEOUT/NETWORK_UNAVAILABLE/ANTI_BOT:
    // A single temporary outage NEVER quarantines an entire country and NEVER marks a program closed!
    // Persistent unavailability is tracked via consecutiveFailures in MonitoredSourceRegistryEntry.
  }

  return { changeRecords, evidenceProposals, recordQuarantines };
}

export function buildRecordLevelQuarantine(params: {
  entityType: RecordLevelQuarantineAction['entityType'];
  entityId: string;
  countryIso: string;
  triggerCode: Phase5BQuarantineTriggerCode;
  reasonSummary: string;
  quarantinedAt: string;
  runId?: string;
  sourceId?: string;
  changeDetectionId?: string;
}): RecordLevelQuarantineAction {
  return {
    schemaVersion: PHASE5B_MONITORING_SCHEMA_VERSION,
    quarantineId: generateQuarantineId(params.entityType, `${params.entityId}:${params.triggerCode}`),
    scope: 'RECORD_ONLY',
    entityType: params.entityType,
    entityId: params.entityId,
    countryIso: params.countryIso,
    triggerCode: params.triggerCode,
    reasonSummary: params.reasonSummary,
    quarantinedAt: params.quarantinedAt,
    recoverable: true,
    reReviewEligible: true,
    excludedFromPublicListings: true,
    excludedFromIndexableSitemaps: true,
    entireCountryQuarantined: false,
    evidenceAuditTrail: {
      ...(params.runId ? { runId: params.runId } : {}),
      ...(params.sourceId ? { sourceId: params.sourceId } : {}),
      ...(params.changeDetectionId ? { changeDetectionId: params.changeDetectionId } : {}),
      previousPublishedSnapshotPreserved: true
    }
  };
}

// ============================================================================
// 2. CLAIM VERIFICATION & AUTOMATED QUARANTINE EVALUATION (SECTIONS 5 & 6)
// ============================================================================

export interface ClaimEvaluationResult {
  claimId: string;
  programId: string;
  validSchema: boolean;
  resolvedPipelineStatus: ChangePipelineStatus;
  publishable: boolean;
  displayValueOrUnknown: string;
  quarantineAction: RecordLevelQuarantineAction | null;
  reasons: string[];
}

export function evaluateClaimTrustAndQuarantine(
  claim: ClaimVerificationReviewRecord,
  options: { now?: Date } = {}
): ClaimEvaluationResult {
  const now = options.now ?? new Date();
  const reasons: string[] = [];

  // 1. Schema validation check
  const schemaRes = validateClaimVerificationReviewRecord(claim);
  if (!schemaRes.success) {
    const schemaSummary = schemaRes.issues.map((i) => `${i.code}: ${i.message}`).join('; ');
    reasons.push(`Schema validation failed: ${schemaSummary}`);
    return {
      claimId: claim.claimId,
      programId: claim.programId,
      validSchema: false,
      resolvedPipelineStatus: 'CLAIM_AWAITING_REVIEW',
      publishable: false,
      displayValueOrUnknown: 'Unknown / Awaiting Verification',
      quarantineAction: buildRecordLevelQuarantine({
        entityType: 'claim',
        entityId: claim.claimId,
        countryIso: claim.countryIso,
        triggerCode: 'SCHEMA_VALIDATION_FAILURE',
        reasonSummary: schemaSummary,
        quarantinedAt: now.toISOString(),
        sourceId: claim.officialSourceId
      }),
      reasons
    };
  }

  // 2. Reject third-party discovery leads as authoritative statutory proof
  if (claim.sourceAuthorityTier === 'DISCOVERY_LEAD_ONLY') {
    reasons.push('Third-party discovery leads cannot independently authorize statutory immigration claims.');
    return {
      claimId: claim.claimId,
      programId: claim.programId,
      validSchema: true,
      resolvedPipelineStatus: 'CLAIM_AWAITING_REVIEW',
      publishable: false,
      displayValueOrUnknown: 'Unknown / Awaiting Official Verification',
      quarantineAction: buildRecordLevelQuarantine({
        entityType: 'claim',
        entityId: claim.claimId,
        countryIso: claim.countryIso,
        triggerCode: 'UNVERIFIABLE_OFFICIAL_SOURCE',
        reasonSummary: `Claim "${claim.claimId}" cites discovery lead only (${claim.evidenceUrl}); official government confirmation required.`,
        quarantinedAt: now.toISOString(),
        sourceId: claim.officialSourceId
      }),
      reasons
    };
  }

  // 3. Conflicting official sources -> automatic record-level quarantine
  if (claim.conflictingOfficialSourceIds.length > 0) {
    reasons.push(`Conflicting official sources detected: ${claim.conflictingOfficialSourceIds.join(', ')}.`);
    return {
      claimId: claim.claimId,
      programId: claim.programId,
      validSchema: true,
      resolvedPipelineStatus: 'CLAIM_AWAITING_REVIEW',
      publishable: false,
      displayValueOrUnknown: 'Unknown / Conflicting Official Sources Under Review',
      quarantineAction: buildRecordLevelQuarantine({
        entityType: 'claim',
        entityId: claim.claimId,
        countryIso: claim.countryIso,
        triggerCode: 'CONFLICTING_OFFICIAL_SOURCES',
        reasonSummary: `Conflicting official evidence between ${claim.officialSourceId} and ${claim.conflictingOfficialSourceIds.join(', ')}.`,
        quarantinedAt: now.toISOString(),
        sourceId: claim.officialSourceId
      }),
      reasons
    };
  }

  // 4. Expired claim information -> automatic record-level quarantine
  if (claim.expiresAt && new Date(claim.expiresAt).getTime() < now.getTime()) {
    reasons.push(`Claim expired on ${claim.expiresAt}.`);
    return {
      claimId: claim.claimId,
      programId: claim.programId,
      validSchema: true,
      resolvedPipelineStatus: 'CLAIM_AWAITING_REVIEW',
      publishable: false,
      displayValueOrUnknown: 'Expired / Removed Pending Re-Verification',
      quarantineAction: buildRecordLevelQuarantine({
        entityType: 'claim',
        entityId: claim.claimId,
        countryIso: claim.countryIso,
        triggerCode: 'EXPIRED_INFORMATION',
        reasonSummary: `Claim "${claim.claimId}" passed expiration timestamp (${claim.expiresAt}); excluded from active catalog until re-verified.`,
        quarantinedAt: now.toISOString(),
        sourceId: claim.officialSourceId
      }),
      reasons
    };
  }

  // 5. Missing supporting evidence excerpt or invalid official URL -> quarantine
  const urlCheck = validateOfficialHttpsUrl(claim.evidenceUrl);
  if (!urlCheck.valid || !claim.evidenceExcerpt || claim.evidenceExcerpt.trim().length === 0) {
    reasons.push('Missing supporting official evidence URL or evidence excerpt.');
    return {
      claimId: claim.claimId,
      programId: claim.programId,
      validSchema: true,
      resolvedPipelineStatus: 'CLAIM_AWAITING_REVIEW',
      publishable: false,
      displayValueOrUnknown: 'Unknown / Awaiting Verification',
      quarantineAction: buildRecordLevelQuarantine({
        entityType: 'claim',
        entityId: claim.claimId,
        countryIso: claim.countryIso,
        triggerCode: 'MISSING_SUPPORTING_EVIDENCE',
        reasonSummary: `Claim "${claim.claimId}" lacks verified official HTTPS URL or supporting excerpt.`,
        quarantinedAt: now.toISOString(),
        sourceId: claim.officialSourceId
      }),
      reasons
    };
  }

  // 6. Strict check for high-risk legal changes awaiting human review
  const isHighRiskCategory = HIGH_RISK_IMMIGRATION_CLAIM_CATEGORIES.includes(claim.claimCategory);
  if (isHighRiskCategory && claim.reviewerStatus !== 'APPROVED') {
    reasons.push(`High-risk immigration claim (${claim.claimCategory}) awaits explicit human review.`);
    return {
      claimId: claim.claimId,
      programId: claim.programId,
      validSchema: true,
      resolvedPipelineStatus: 'CLAIM_AWAITING_REVIEW',
      publishable: false,
      displayValueOrUnknown: claim.previousValue ?? 'Unknown / Awaiting Verification',
      quarantineAction:
        claim.previousValue === null
          ? buildRecordLevelQuarantine({
              entityType: 'claim',
              entityId: claim.claimId,
              countryIso: claim.countryIso,
              triggerCode: 'MATERIAL_LEGAL_CHANGE_AWAITING_REVIEW',
              reasonSummary: `Material high-risk immigration claim (${claim.claimCategory}) awaits human review before publication.`,
              quarantinedAt: now.toISOString(),
              sourceId: claim.officialSourceId
            })
          : null,
      reasons
    };
  }

  // Approved & independently verified with official evidence
  const publishable =
    claim.verificationStatus === 'CLAIM_APPROVED_FOR_PUBLICATION' &&
    claim.reviewerStatus === 'APPROVED' &&
    Boolean(claim.reviewedBy && claim.reviewedAt);

  return {
    claimId: claim.claimId,
    programId: claim.programId,
    validSchema: true,
    resolvedPipelineStatus: publishable ? 'CLAIM_APPROVED_FOR_PUBLICATION' : claim.verificationStatus,
    publishable,
    displayValueOrUnknown: claim.proposedNewValue ?? claim.previousValue ?? 'Unknown / Awaiting Verification',
    quarantineAction: null,
    reasons: publishable ? [] : ['Claim is verified internally but has not completed final human publication approval.']
  };
}

// ============================================================================
// 3. SAFE PUBLISHING WORKFLOW & HUMAN APPROVAL GATES (SECTION 7)
// ============================================================================

export interface CatalogUpdateProposal {
  proposalId: string;
  targetEntityType: 'source' | 'program' | 'claim' | 'visa_detail' | 'route';
  targetEntityId: string;
  countryIso: string;
  changedFields: string[];
  riskClass: 'LOW_RISK_METADATA' | 'HIGH_RISK_LEGAL_OR_ELIGIBILITY';
  deterministicallyVerified: boolean;
  sourceAuthorityTier: 'OFFICIAL_GOVERNMENT' | 'DISCOVERY_LEAD_ONLY';
  hasOfficialEvidence: boolean;
  hasConflictingClaims: boolean;
  isAiGeneratedRule: boolean;
  isUnverifiedTranslation: boolean;
  isProgramClosureClaim: boolean;
  humanApproval: {
    approved: boolean;
    reviewedBy: string | null;
    reviewedAt: string | null;
  };
}

export interface PublicationGateDecision {
  allowedToAutoPublish: boolean;
  allowedWithHumanApproval: boolean;
  blocked: boolean;
  decisionCode:
    | 'AUTO_APPROVED_LOW_RISK_METADATA'
    | 'APPROVED_BY_HUMAN_REVIEW_GATE'
    | 'BLOCKED_HUMAN_APPROVAL_REQUIRED'
    | 'BLOCKED_UNVERIFIED_OR_FORBIDDEN_CONTENT';
  reasons: string[];
}

/**
 * Enforces Section 7 Safe Publishing Gates:
 * - Automated updates allowed ONLY for deterministically verified LOW_RISK_METADATA fields.
 * - NEVER auto-publishes:
 *   1. AI-generated immigration rules
 *   2. Unsupported translations
 *   3. Guessed fees, processing times, or eligibility criteria
 *   4. Unverified program closures
 *   5. Conflicting claims
 *   6. Third-party discovery lead claims
 * - Material legal/eligibility changes require explicit human approval + verified official evidence.
 */
export function evaluatePublicationApprovalGate(proposal: CatalogUpdateProposal): PublicationGateDecision {
  const reasons: string[] = [];

  if (proposal.sourceAuthorityTier !== 'OFFICIAL_GOVERNMENT') {
    reasons.push('Third-party discovery leads are strictly blocked from publishing catalog updates.');
  }
  if (!proposal.hasOfficialEvidence) {
    reasons.push('Supporting official government HTTPS evidence is mandatory before publication.');
  }
  if (proposal.hasConflictingClaims) {
    reasons.push('Conflicting claims exist; record must be quarantined and resolved by human legal review.');
  }
  if (proposal.isAiGeneratedRule && !proposal.humanApproval.approved) {
    reasons.push('AI-generated immigration rules can never be auto-published without independent human verification.');
  }
  if (proposal.isUnverifiedTranslation) {
    reasons.push('Unsupported/unverified legal translations are blocked from publication.');
  }
  if (proposal.isProgramClosureClaim && !proposal.humanApproval.approved) {
    reasons.push('Program closures require explicit official proof and human reviewer confirmation.');
  }

  if (reasons.length > 0) {
    return {
      allowedToAutoPublish: false,
      allowedWithHumanApproval: false,
      blocked: true,
      decisionCode: 'BLOCKED_UNVERIFIED_OR_FORBIDDEN_CONTENT',
      reasons
    };
  }

  const allFieldsAreLowRisk =
    proposal.changedFields.length > 0 &&
    proposal.changedFields.every((f) => ALLOWED_AUTO_LOW_RISK_FIELDS.has(f));

  if (
    proposal.riskClass === 'LOW_RISK_METADATA' &&
    allFieldsAreLowRisk &&
    proposal.deterministicallyVerified &&
    !proposal.isAiGeneratedRule &&
    !proposal.isProgramClosureClaim
  ) {
    return {
      allowedToAutoPublish: true,
      allowedWithHumanApproval: true,
      blocked: false,
      decisionCode: 'AUTO_APPROVED_LOW_RISK_METADATA',
      reasons: ['All modified fields are deterministically verified low-risk monitoring metadata.']
    };
  }

  // Material legal / eligibility / non-metadata change requires explicit human approval gate
  const validHumanApproval =
    proposal.humanApproval.approved === true &&
    Boolean(proposal.humanApproval.reviewedBy && proposal.humanApproval.reviewedBy.trim().length > 0) &&
    Boolean(proposal.humanApproval.reviewedAt && proposal.humanApproval.reviewedAt.trim().length > 0);

  if (validHumanApproval) {
    return {
      allowedToAutoPublish: false,
      allowedWithHumanApproval: true,
      blocked: false,
      decisionCode: 'APPROVED_BY_HUMAN_REVIEW_GATE',
      reasons: [`Material change explicitly approved by human reviewer "${proposal.humanApproval.reviewedBy}".`]
    };
  }

  return {
    allowedToAutoPublish: false,
    allowedWithHumanApproval: false,
    blocked: true,
    decisionCode: 'BLOCKED_HUMAN_APPROVAL_REQUIRED',
    reasons: [
      `Material change touching [${proposal.changedFields.join(', ')}] requires explicit human review and approval before publication.`
    ]
  };
}

/**
 * Verifies that a single failed official source check NEVER quarantines an entire country
 * or other healthy programs belonging to the same country.
 */
export function computeAffectedProgramIdsForSourceFailure(
  failedCheck: SourceCheckResult,
  countryPrograms: ImmigrationProgramRecord[]
): { affectedProgramIds: string[]; unaffectedCountryProgramIds: string[]; entireCountryQuarantined: false } {
  const affectedProgramIds: string[] = [];
  const unaffectedCountryProgramIds: string[] = [];

  for (const prog of countryPrograms) {
    if (prog.destinationCountryIso !== failedCheck.countryIso) continue;
    const usesFailedSource = prog.officialSourceRefs.some((r) => r.sourceId === failedCheck.sourceId);
    if (usesFailedSource) {
      affectedProgramIds.push(prog.programId);
    } else {
      unaffectedCountryProgramIds.push(prog.programId);
    }
  }

  return {
    affectedProgramIds: affectedProgramIds.sort(),
    unaffectedCountryProgramIds: unaffectedCountryProgramIds.sort(),
    entireCountryQuarantined: false
  };
}
