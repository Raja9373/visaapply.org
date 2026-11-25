import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  GitPullRequest,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Copy,
  Check,
  Lock,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { staticCatalogClient } from '../services/staticCatalogClient';
import type { VerificationSummaryIndexPayload } from '../types/staticCatalog';
import {
  EDITORIAL_PERMISSIONS,
  EDITORIAL_ROLES,
  EDITORIAL_ROLE_PERMISSION_MATRIX,
  GITHUB_ROLE_TEAM_MAPPING,
  buildGithubReviewMarkdown,
  classifyEditorialRisk,
  isValidOfficialHttpsUrlBasic,
  type EditorialChangeProposal,
  type EditorialDecision
} from '../schemas/editorialGovernanceSchemas';

export interface EditorialReviewQueuePageProps {
  onNavigate: (path: string) => void;
  initialProposals?: EditorialChangeProposal[];
}

export const EditorialReviewQueuePage: React.FC<EditorialReviewQueuePageProps> = ({
  onNavigate,
  initialProposals = []
}) => {
  const [summary, setSummary] = useState<VerificationSummaryIndexPayload | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [proposals, setProposals] = useState<EditorialChangeProposal[]>(initialProposals);
  const [selectedId, setSelectedId] = useState<string | null>(initialProposals[0]?.proposalId ?? null);
  const [proposalJsonInput, setProposalJsonInput] = useState('');
  const [jsonLoadError, setJsonLoadError] = useState<string | null>(null);

  const [reviewerNotes, setReviewerNotes] = useState('');
  const [preparedDecision, setPreparedDecision] = useState<EditorialDecision | null>(null);
  const [preparedMarkdown, setPreparedMarkdown] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    staticCatalogClient
      .getVerificationSummary()
      .then((res) => {
        if (!active) return;
        if (res.status === 'ok' && res.data) {
          setSummary(res.data);
          setSummaryError(null);
        } else {
          setSummaryError('Static verification summary is currently unavailable.');
        }
        setLoadingSummary(false);
      })
      .catch(() => {
        if (!active) return;
        setSummaryError('Unable to load static catalog verification summary.');
        setLoadingSummary(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedProposal = proposals.find((p) => p.proposalId === selectedId) ?? null;
  const computedRisk = selectedProposal ? classifyEditorialRisk(selectedProposal.changedFields) : null;

  const handleLoadProposalJson = () => {
    setJsonLoadError(null);
    const trimmed = proposalJsonInput.trim();
    if (!trimmed) {
      setJsonLoadError('Paste a valid Phase 6 EditorialChangeProposal JSON object or array first.');
      return;
    }
    try {
      const parsed = JSON.parse(trimmed);
      const list: EditorialChangeProposal[] = Array.isArray(parsed) ? parsed : [parsed];
      const validItems = list.filter(
        (item) =>
          item &&
          typeof item === 'object' &&
          typeof item.proposalId === 'string' &&
          typeof item.recordId === 'string' &&
          typeof item.officialSourceUrl === 'string'
      );
      if (validItems.length === 0) {
        setJsonLoadError('No valid proposal records found (proposalId, recordId, and officialSourceUrl are required).');
        return;
      }
      setProposals((prev) => {
        const byId = new Map(prev.map((p) => [p.proposalId, p]));
        for (const item of validItems) byId.set(item.proposalId, item);
        return Array.from(byId.values());
      });
      setSelectedId(validItems[0].proposalId);
      setProposalJsonInput('');
    } catch {
      setJsonLoadError('Invalid JSON syntax. Please paste valid JSON from a GitHub Pull Request proposal file.');
    }
  };

  const handlePrepareGithubReview = (decision: EditorialDecision) => {
    if (!selectedProposal) return;
    const md = buildGithubReviewMarkdown({
      proposal: selectedProposal,
      decision,
      reviewerNotes
    });
    setPreparedDecision(decision);
    setPreparedMarkdown(md);
    setCopied(false);
  };

  const handleCopyMarkdown = async () => {
    if (!preparedMarkdown || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(preparedMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked in restricted iframe; text remains selectable in textarea
    }
  };

  const safePrHref =
    selectedProposal?.pullRequestRef &&
    isValidOfficialHttpsUrlBasic(selectedProposal.pullRequestRef) &&
    selectedProposal.pullRequestRef.startsWith('https://github.com/')
      ? selectedProposal.pullRequestRef
      : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/admin')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Admin Home
            </button>
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm tracking-tight">
                GitHub PR Editorial Review & Governance Workbench
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded">
            Zero-DB • GitHub Source of Truth
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Security & Authorization Boundary Notice */}
        <section
          aria-label="GitHub enforcement notice"
          className="bg-amber-50 border border-amber-300 rounded-xl p-5 flex items-start gap-3"
        >
          <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-950 space-y-1">
            <h1 className="font-bold text-base">
              Authoritative Approvals & Merges Are Enforced Exclusively by GitHub
            </h1>
            <p>
              This review interface runs without browser credentials or database writes. It inspects verified static
              catalog metadata and formats Pull Request review summaries. Final approval, high-risk sign-off,
              quarantine release, and merging are enforced by authenticated GitHub accounts,{' '}
              <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">.github/CODEOWNERS</code>, protected{' '}
              <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">main</code> branch rules, and{' '}
              <code className="font-mono text-xs bg-amber-100 px-1 py-0.5 rounded">editorial-pr-validation.yml</code>.
            </p>
          </div>
        </section>

        {/* Live Static Catalog Verification Snapshot */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="Catalog governance summary">
          {loadingSummary ? (
            <div className="col-span-4 bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
              Loading verified static catalog summary…
            </div>
          ) : summaryError ? (
            <div className="col-span-4 bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-800">
              {summaryError}
            </div>
          ) : summary ? (
            <>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Verified Available Programs
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {summary.canonicalMetrics.verifiedAvailablePrograms}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Across {summary.canonicalMetrics.verifiedActiveCountries} active hubs
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Official HTTPS Sources
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {summary.canonicalMetrics.verifiedOfficialHttpsSources}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Sovereign government domains only</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quarantined / Awaiting Review
                </div>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  {summary.canonicalMetrics.awaitingOfficialVerificationCountries +
                    summary.canonicalMetrics.expiredExcludedPrograms}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {summary.canonicalMetrics.awaitingOfficialVerificationCountries} countries •{' '}
                  {summary.canonicalMetrics.expiredExcludedPrograms} expired program
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Loaded PR Proposals
                </div>
                <div className="text-2xl font-black text-indigo-700 mt-1">{proposals.length}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {proposals.filter((p) => p.lifecycleStatus === 'PENDING_REVIEW').length} pending review
                </div>
              </div>
            </>
          ) : null}
        </section>

        {/* Pending Review Queue + Proposal Inspector */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Queue Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Pending Review Queue</h2>
                <span className="text-xs font-semibold text-slate-500">{proposals.length} loaded</span>
              </div>

              {proposals.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-4 text-sm text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-800">No active proposals loaded in browser session.</p>
                  <p className="text-xs leading-relaxed">
                    Open a GitHub Pull Request under{' '}
                    <code className="font-mono bg-slate-200 px-1 rounded">data/editorial-governance/proposals/</code> or
                    paste a proposal JSON payload below to inspect values, official evidence, and format a GitHub review.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {proposals.map((prop) => {
                    const risk = classifyEditorialRisk(prop.changedFields);
                    const isSelected = prop.proposalId === selectedId;
                    return (
                      <button
                        key={prop.proposalId}
                        type="button"
                        onClick={() => {
                          setSelectedId(prop.proposalId);
                          setPreparedDecision(null);
                          setPreparedMarkdown(null);
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold">{prop.proposalId}</span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                              risk === 'HIGH_RISK'
                                ? 'bg-rose-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {risk}
                          </span>
                        </div>
                        <div className={`text-xs mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                          {prop.recordId} ({prop.countryIso}) • {prop.lifecycleStatus}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Load PR Proposal JSON Aid */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label htmlFor="proposal-json-input" className="block text-xs font-bold text-slate-700">
                  Inspect Proposal JSON from GitHub PR
                </label>
                <textarea
                  id="proposal-json-input"
                  rows={4}
                  value={proposalJsonInput}
                  onChange={(e) => setProposalJsonInput(e.target.value)}
                  placeholder='{"proposalId":"PROP-2026-11-25-US-001","recordId":"us-h1b-specialty",...}'
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {jsonLoadError && <p className="text-xs text-rose-700 font-medium">{jsonLoadError}</p>}
                <button
                  type="button"
                  onClick={handleLoadProposalJson}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Load Proposal for Inspection
                </button>
              </div>
            </div>
          </div>

          {/* Right Proposal Detail & Review Preparation Column */}
          <div className="lg:col-span-8">
            {selectedProposal ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-black text-slate-900 font-mono">
                        {selectedProposal.proposalId}
                      </h2>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                          computedRisk === 'HIGH_RISK'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {computedRisk}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                        {selectedProposal.verificationStatus}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Record: <strong className="font-mono">{selectedProposal.recordId}</strong> ({selectedProposal.countryIso}) •
                      Fields: <span className="font-mono text-xs">{selectedProposal.changedFields.join(', ')}</span>
                    </p>
                  </div>
                  {safePrHref && (
                    <a
                      href={safePrHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-800"
                    >
                      Open GitHub PR
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Previous vs Proposed Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Previous Published Value</div>
                    <div className="text-sm font-medium text-slate-900 mt-1.5 break-words">
                      {selectedProposal.previousValue ?? 'None / Unknown'}
                    </div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-indigo-700">Proposed New Value</div>
                    <div className="text-sm font-semibold text-indigo-950 mt-1.5 break-words">
                      {selectedProposal.proposedValue}
                    </div>
                  </div>
                </div>

                {/* Official Source Evidence */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      Official Government Evidence ({selectedProposal.officialSourceId})
                    </span>
                    <span className="text-xs font-mono text-slate-600">
                      Last Checked: {selectedProposal.sourceLastCheckedTimestamp}
                    </span>
                  </div>
                  <div>
                    {isValidOfficialHttpsUrlBasic(selectedProposal.officialSourceUrl) ? (
                      <a
                        href={selectedProposal.officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-700 hover:underline font-mono text-xs break-all inline-flex items-center gap-1"
                      >
                        {selectedProposal.officialSourceUrl}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-rose-700">
                        Blocked: Invalid or non-HTTPS source URL
                      </span>
                    )}
                  </div>
                  <blockquote className="border-l-2 border-slate-400 pl-3 text-xs text-slate-700 italic">
                    “{selectedProposal.evidenceExcerpt}”
                  </blockquote>
                  {selectedProposal.conflictingSourceIds.length > 0 && (
                    <div className="bg-rose-100 border border-rose-300 text-rose-900 rounded p-2.5 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Conflicting official sources detected ({selectedProposal.conflictingSourceIds.join(', ')}). Must remain quarantined until resolved.
                    </div>
                  )}
                </div>

                {/* Reviewer Notes & GitHub PR Decision Formatter */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <label htmlFor="editorial-reviewer-notes" className="block text-sm font-bold text-slate-900">
                    Reviewer Notes (Included in GitHub PR Review & Audit Record)
                  </label>
                  <textarea
                    id="editorial-reviewer-notes"
                    rows={3}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Document official statutory verification, effective date, or reason for requesting changes / rejection..."
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={selectedProposal.conflictingSourceIds.length > 0}
                      onClick={() => handlePrepareGithubReview('APPROVE')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Prepare Approve Review
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrepareGithubReview('REQUEST_CHANGES')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Prepare Request Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrepareGithubReview('REJECT')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-700 text-white text-xs font-bold hover:bg-rose-800"
                    >
                      <XCircle className="w-4 h-4" />
                      Prepare Reject Review
                    </button>
                  </div>

                  {preparedMarkdown && preparedDecision && (
                    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-emerald-300">
                          Ready for GitHub Pull Request Review ({preparedDecision})
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyMarkdown}
                          className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-white"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'Copied' : 'Copy Review Body'}
                        </button>
                      </div>
                      <pre className="text-xs font-mono whitespace-pre-wrap text-slate-200 overflow-x-auto">
                        {preparedMarkdown}
                      </pre>
                      <p className="text-[11px] text-slate-400">
                        Submit this review using your authenticated GitHub account on the Pull Request. Branch protection
                        verifies your GitHub team role ({computedRisk === 'HIGH_RISK' ? '@visaapply-org/senior-immigration-reviewers or @visaapply-org/platform-admins' : 'authorized reviewer team'}) before allowing merge.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <h2 className="text-base font-bold text-slate-900">Select or Load a Change Proposal</h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto">
                  Paste any Pull Request proposal JSON from{' '}
                  <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                    data/editorial-governance/proposals/
                  </code>{' '}
                  to inspect previous vs proposed values, official government evidence, risk classification, and format a
                  GitHub review.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Role-Based Permission Matrix (GitHub Enforced) */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Editorial Role-Based Permission Matrix (Enforced via GitHub Teams & CODEOWNERS)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Frontend display is informational only. Repository branch protection and CODEOWNERS enforce actual review
              and merge authorization.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="p-2.5 font-bold">Role & GitHub Team</th>
                  {EDITORIAL_PERMISSIONS.map((perm) => (
                    <th key={perm} className="p-2 font-semibold">
                      {perm.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EDITORIAL_ROLES.map((role) => (
                  <tr key={role} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">{role.replace(/_/g, ' ')}</div>
                      <div className="font-mono text-[11px] text-slate-500">{GITHUB_ROLE_TEAM_MAPPING[role]}</div>
                    </td>
                    {EDITORIAL_PERMISSIONS.map((perm) => {
                      const allowed = EDITORIAL_ROLE_PERMISSION_MATRIX[role].has(perm);
                      return (
                        <td key={perm} className="p-2 text-center">
                          {allowed ? (
                            <span className="inline-block font-bold text-emerald-700">Yes</span>
                          ) : (
                            <span className="inline-block text-slate-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
