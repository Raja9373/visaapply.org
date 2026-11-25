/**
 * VISAAPPLY.ORG — PHASE 6: SECURE EDITORIAL GOVERNANCE, RBAC,
 * RISK-BASED APPROVAL, QUARANTINE RELEASE & APPEND-ONLY AUDIT SCHEMAS
 *
 * Browser-safe & Node-safe zero-dependency contracts (zero Node built-ins!).
 * Enforcement layer is GitHub Protected Branches + CODEOWNERS + CI PR Validation;
 * frontend views never act as a standalone authorization boundary.
 */

export const PHASE6_GOVERNANCE_SCHEMA_VERSION = '2.2.0' as const;

// ============================================================================
// 1. EDITORIAL ROLES & PERMISSIONS MATRIX (SECTION 3)
// ============================================================================

export const EDITORIAL_ROLES = [
  'ADMINISTRATOR',
  'SENIOR_IMMIGRATION_REVIEWER',
  'COUNTRY_EDITOR',
  'EVIDENCE_REVIEWER',
  'READ_ONLY_AUDITOR'
] as const;

export type EditorialRole = (typeof EDITORIAL_ROLES)[number];

export const EDITORIAL_PERMISSIONS = [
  'VIEW_RECORDS',
  'REVIEW_EVIDENCE',
  'PROPOSE_CHANGES',
  'EDIT_DRAFTS',
  'APPROVE_LOW_RISK_CHANGES',
  'APPROVE_HIGH_RISK_CHANGES',
  'MERGE_APPROVED_PR',
  'VIEW_AUDIT_HISTORY',
  'MANAGE_SOURCE_REGISTRY'
] as const;

export type EditorialPermission = (typeof EDITORIAL_PERMISSIONS)[number];

/**
 * Authoritative RBAC matrix mirrored into GitHub Teams & CODEOWNERS.
 * Frontend checks are informational only; real enforcement occurs in GitHub
 * branch protection, CODEOWNERS, and automated PR validation CI checks.
 */
export const EDITORIAL_ROLE_PERMISSION_MATRIX: Readonly<
  Record<EditorialRole, ReadonlySet<EditorialPermission>>
> = {
  ADMINISTRATOR: new Set<EditorialPermission>([
    'VIEW_RECORDS',
    'REVIEW_EVIDENCE',
    'PROPOSE_CHANGES',
    'EDIT_DRAFTS',
    'APPROVE_LOW_RISK_CHANGES',
    'APPROVE_HIGH_RISK_CHANGES',
    'MERGE_APPROVED_PR',
    'VIEW_AUDIT_HISTORY',
    'MANAGE_SOURCE_REGISTRY'
  ]),
  SENIOR_IMMIGRATION_REVIEWER: new Set<EditorialPermission>([
    'VIEW_RECORDS',
    'REVIEW_EVIDENCE',
    'PROPOSE_CHANGES',
    'EDIT_DRAFTS',
    'APPROVE_LOW_RISK_CHANGES',
    'APPROVE_HIGH_RISK_CHANGES',
    'MERGE_APPROVED_PR',
    'VIEW_AUDIT_HISTORY',
    'MANAGE_SOURCE_REGISTRY'
  ]),
  COUNTRY_EDITOR: new Set<EditorialPermission>([
    'VIEW_RECORDS',
    'REVIEW_EVIDENCE',
    'PROPOSE_CHANGES',
    'EDIT_DRAFTS',
    'APPROVE_LOW_RISK_CHANGES',
    'VIEW_AUDIT_HISTORY'
  ]),
  EVIDENCE_REVIEWER: new Set<EditorialPermission>([
    'VIEW_RECORDS',
    'REVIEW_EVIDENCE',
    'PROPOSE_CHANGES',
    'APPROVE_LOW_RISK_CHANGES',
    'VIEW_AUDIT_HISTORY'
  ]),
  READ_ONLY_AUDITOR: new Set<EditorialPermission>([
    'VIEW_RECORDS',
    'VIEW_AUDIT_HISTORY'
  ])
};

export const GITHUB_ROLE_TEAM_MAPPING: Readonly<Record<EditorialRole, string>> = {
  ADMINISTRATOR: '@visaapply-org/platform-admins',
  SENIOR_IMMIGRATION_REVIEWER: '@visaapply-org/senior-immigration-reviewers',
  COUNTRY_EDITOR: '@visaapply-org/country-editors',
  EVIDENCE_REVIEWER: '@visaapply-org/evidence-reviewers',
  READ_ONLY_AUDITOR: '@visaapply-org/read-only-auditors'
};

// ============================================================================
// 2. RISK CLASSIFICATION (SECTION 5)
// ============================================================================

export const EDITORIAL_RISK_LEVELS = ['LOW_RISK', 'HIGH_RISK'] as const;
export type EditorialRiskLevel = (typeof EDITORIAL_RISK_LEVELS)[number];

/**
 * Explicitly enumerated low-risk non-legal fields.
 * FAIL-CLOSED RULE: Any field NOT in this set is automatically classified HIGH_RISK.
 */
export const LOW_RISK_ALLOWED_FIELDS: ReadonlySet<string> = new Set([
  'displaySubtitle',
  'sourceDescription',
  'evidenceNotes',
  'formatting',
  'categorizationTag',
  'spellingCorrection',
  'lastCheckedDate',
  'lastCheckedTimestamp',
  'httpAvailabilityStatus',
  'contentFingerprint',
  'sourceTitle',
  'editorialFormatting'
]);

/**
 * Explicit high-risk legal & statutory fields that ALWAYS require explicit
 * human Senior Immigration Reviewer or Administrator approval.
 */
export const HIGH_RISK_STATUTORY_FIELDS: ReadonlySet<string> = new Set([
  'eligibility',
  'eligibilitySummary',
  'visaAvailability',
  'verificationStatus',
  'publicationStatus',
  'applicationFees',
  'governmentFees',
  'processingTime',
  'investmentThreshold',
  'incomeThreshold',
  'financialRequirements',
  'workRights',
  'familySponsorship',
  'familyDependentProvisions',
  'citizenshipRequirements',
  'permanentResidencyPathway',
  'requiredDocuments',
  'ageRequirements',
  'applicationDeadlines',
  'legalBasis',
  'statutoryRules',
  'programClosure',
  'quarantineRelease'
]);

// ============================================================================
// 3. EDITORIAL DECISION, PROPOSAL, AUDIT TRAIL & QUARANTINE RELEASE TYPES
// ============================================================================

export const EDITORIAL_DECISIONS = [
  'APPROVE',
  'REJECT',
  'REQUEST_CHANGES',
  'QUARANTINE',
  'RELEASE_FROM_QUARANTINE'
] as const;
export type EditorialDecision = (typeof EDITORIAL_DECISIONS)[number];

export const PROPOSAL_LIFECYCLE_STATUSES = [
  'PENDING_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED_READY_FOR_MERGE',
  'MERGED',
  'REJECTED',
  'QUARANTINED'
] as const;
export type ProposalLifecycleStatus = (typeof PROPOSAL_LIFECYCLE_STATUSES)[number];

export interface EditorialActorIdentity {
  githubHandle: string; // e.g., "@senior-reviewer-1" (never email/PII or credentials)
  role: EditorialRole;
  isBotOrAi: boolean;
}

export interface EditorialReviewDecisionRecord {
  decisionId: string;
  actor: EditorialActorIdentity;
  decision: EditorialDecision;
  decisionTimestamp: string; // ISO-8601 UTC
  reason: string;
  reviewerNotes: string;
}

export interface EditorialChangeProposal {
  schemaVersion: typeof PHASE6_GOVERNANCE_SCHEMA_VERSION;
  proposalId: string; // e.g., "PROP-2026-11-25-US-001"
  recordId: string; // Program ID, Claim ID, Source ID, or Route ID
  entityType: 'program' | 'claim' | 'visa_detail' | 'official_source' | 'route' | 'editorial';
  countryIso: string;
  changedFields: string[];
  riskLevel: EditorialRiskLevel;
  previousValue: string | null;
  proposedValue: string;
  finalApprovedValue: string | null;
  officialSourceId: string;
  officialSourceUrl: string;
  evidenceExcerpt: string;
  evidenceRetrievedAt: string;
  evidenceExpiresAt: string | null;
  sourceLastCheckedTimestamp: string;
  verificationStatus:
    | 'SOURCE_CHANGED'
    | 'SOURCE_CONTENT_EXTRACTED'
    | 'CLAIM_AWAITING_REVIEW'
    | 'CLAIM_INDEPENDENTLY_VERIFIED'
    | 'CLAIM_APPROVED_FOR_PUBLICATION'
    | 'CONFLICTING'
    | 'QUARANTINED';
  conflictingSourceIds: string[];
  lifecycleStatus: ProposalLifecycleStatus;
  proposedBy: EditorialActorIdentity;
  proposedAt: string;
  pullRequestRef: string | null; // e.g., "PR#42" or "https://github.com/org/repo/pull/42"
  commitSha: string | null;
  decisions: EditorialReviewDecisionRecord[];
}

/**
 * Append-only structured audit trail event (Section 7).
 * Corrections MUST append a new event referencing `supersedesEventId` rather
 * than modifying or deleting any previous audit event.
 */
export interface EditorialAuditEvent {
  schemaVersion: typeof PHASE6_GOVERNANCE_SCHEMA_VERSION;
  auditEventId: string; // e.g., "AUD-2026-11-25-..."
  recordId: string;
  changeProposalId: string;
  countryIso: string;
  riskLevel: EditorialRiskLevel;
  previousValue: string | null;
  proposedValue: string;
  finalApprovedValue: string | null;
  evidenceReference: {
    officialSourceId: string;
    officialSourceUrl: string;
    evidenceExcerpt: string;
    evidenceRetrievedAt: string;
  };
  reviewerIdentity: {
    githubHandle: string;
    role: EditorialRole;
    isBotOrAi: boolean;
  };
  decision: EditorialDecision;
  decisionTimestamp: string;
  pullRequestRef: string;
  commitSha: string;
  reason: string;
  supersedesEventId: string | null;
  previousEventHash: string | null;
  eventHash: string;
}

export interface QuarantineReleaseRequest {
  schemaVersion: typeof PHASE6_GOVERNANCE_SCHEMA_VERSION;
  releaseRequestId: string;
  quarantineId: string;
  recordId: string;
  entityType: 'country' | 'program' | 'claim' | 'visa_detail' | 'route' | 'official_source';
  countryIso: string;
  riskLevel: EditorialRiskLevel;
  triggerReason:
    | 'HUMAN_VERIFIED_EVIDENCE_REVIEW'
    | 'SOURCE_BECAME_REACHABLE_ONLY';
  evidenceAvailable: boolean;
  officialSourceId: string;
  officialSourceUrl: string;
  evidenceExcerpt: string | null;
  evidenceExpiresAt: string | null;
  schemaValidationPassed: boolean;
  staticCatalogValidationPassed: boolean;
  conflictingSourcesResolved: boolean;
  approvals: EditorialReviewDecisionRecord[];
  requestedAt: string;
  pullRequestRef: string | null;
}

// ============================================================================
// 4. BROWSER-SAFE VALIDATION HELPERS
// ============================================================================

export function isValidGithubHandle(handle: unknown): handle is string {
  if (typeof handle !== 'string') return false;
  const trimmed = handle.trim();
  // GitHub username format (optional leading @, 1-39 alphanumeric/hyphen chars, never email address)
  if (trimmed.includes('@') && !trimmed.startsWith('@')) return false;
  const bare = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(bare);
}

export function isIsoTimestampLike(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value.trim())) {
    return false;
  }
  return !Number.isNaN(new Date(value.trim()).getTime());
}

export function isValidOfficialHttpsUrlBasic(rawUrl: unknown): boolean {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return false;
  try {
    const u = new URL(rawUrl.trim());
    if (u.protocol !== 'https:') return false;
    if (u.username || u.password) return false;
    const host = u.hostname.toLowerCase();
    if (!host.includes('.') || host === 'localhost' || /^127\.|^10\.|^192\.168\.|^169\.254\./.test(host)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function hasEditorialPermission(role: EditorialRole, permission: EditorialPermission): boolean {
  const perms = EDITORIAL_ROLE_PERMISSION_MATRIX[role];
  return Boolean(perms && perms.has(permission));
}

export function classifyEditorialRisk(changedFields: readonly string[]): EditorialRiskLevel {
  if (!Array.isArray(changedFields) || changedFields.length === 0) {
    // Fail-closed: empty/unknown change scope defaults to HIGH_RISK
    return 'HIGH_RISK';
  }
  for (const field of changedFields) {
    const trimmed = String(field || '').trim();
    if (!trimmed || HIGH_RISK_STATUTORY_FIELDS.has(trimmed) || !LOW_RISK_ALLOWED_FIELDS.has(trimmed)) {
      return 'HIGH_RISK';
    }
  }
  return 'LOW_RISK';
}

export function buildGithubReviewMarkdown(params: {
  proposal: EditorialChangeProposal;
  decision: EditorialDecision;
  reviewerNotes: string;
}): string {
  const { proposal, decision, reviewerNotes } = params;
  return [
    `### VisaApply.org Editorial Review Decision`,
    `- **Decision:** \`${decision}\``,
    `- **Proposal ID:** \`${proposal.proposalId}\``,
    `- **Record ID:** \`${proposal.recordId}\` (${proposal.countryIso})`,
    `- **Risk Classification:** \`${proposal.riskLevel}\``,
    `- **Verification Status:** \`${proposal.verificationStatus}\``,
    `- **Official Source:** ${proposal.officialSourceUrl} (\`${proposal.officialSourceId}\`)`,
    `- **Source Last Checked:** ${proposal.sourceLastCheckedTimestamp}`,
    `- **Previous Value:** ${proposal.previousValue ?? 'None / Unknown'}`,
    `- **Proposed Value:** ${proposal.proposedValue}`,
    `- **Evidence Excerpt:** "${proposal.evidenceExcerpt}"`,
    `- **Reviewer Notes:** ${reviewerNotes.trim() || 'No additional notes provided.'}`,
    ``,
    `_Submitted via GitHub authenticated Pull Request review (enforced by branch protection & CODEOWNERS)._`
  ].join('\n');
}
