import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Link2Off,
  FileText,
  Save,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const A_TO_M_SECTIONS = [
  { code: 'A', key: 'countryOverview', label: 'A. Country Overview' },
  { code: 'B', key: 'visaOverview', label: 'B. Visa Overview' },
  { code: 'C', key: 'eligibility', label: 'C. Eligibility Requirements' },
  { code: 'D', key: 'financial', label: 'D. Financial Requirements, ITR & Bank Statements' },
  { code: 'E', key: 'documentChecklist', label: 'E. Document Checklist' },
  { code: 'F', key: 'applicationFields', label: 'F. Application Form Information' },
  { code: 'G', key: 'applicationSteps', label: 'G. Step-by-Step Application Process' },
  { code: 'H', key: 'interviewPrep', label: 'H. Interview Preparation' },
  { code: 'I', key: 'embassyDirectory', label: 'I. Embassy & Consulate Directory' },
  { code: 'J', key: 'refusalAppeal', label: 'J. Refusal, Appeals & Reapplication' },
  { code: 'K', key: 'afterApproval', label: 'K. After Approval & Entry' },
  { code: 'L', key: 'costCalculator', label: 'L. Cost Calculator' },
  { code: 'M', key: 'faq', label: 'M. FAQs & Official Sources' }
];

export const EVIDENCE_STATUSES = [
  'VERIFIED_OFFICIAL',
  'OFFICIAL_BUT_NOT_FULLY_CONFIRMED',
  'SECONDARY_SOURCE',
  'OUTDATED',
  'BROKEN_LINK',
  'NEEDS_REVIEW',
  'REJECTED'
] as const;

export const CLAIM_STATUSES = [
  'NEEDS_EVIDENCE',
  'AWAITING_REVIEW',
  'VERIFIED',
  'OUTDATED',
  'UNVERIFIED',
  'REJECTED'
] as const;

export function ClaimsManager({ programId, onMutated }: { programId: string; onMutated?: () => void }) {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Claim modal / form state
  const [editingClaim, setEditingClaim] = useState<any | null>(null);
  const [claimDeletingId, setClaimDeletingId] = useState<string | null>(null);

  // Evidence modal / form state
  const [editingEvidence, setEditingEvidence] = useState<{ claimId: string; evidence: any } | null>(null);
  const [evidenceDeleting, setEvidenceDeleting] = useState<{ claimId: string; evidenceId: string } | null>(null);

  const loadClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/visa-details/${programId}/claims`);
      if (!res.ok) throw new Error(`Failed to fetch claims (${res.status})`);
      const data = await res.json();
      setClaims(Array.isArray(data.claims) ? data.claims : []);
    } catch (err: any) {
      setError(err.message || 'Error loading claims');
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleSaveClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClaim?.section || !editingClaim?.description) return;
    try {
      const res = await fetch(`/api/admin/visa-details/${programId}/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingClaim)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save claim');
      setEditingClaim(null);
      await loadClaims();
      if (onMutated) onMutated();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConfirmDeleteClaim = async (claimId: string) => {
    try {
      const res = await fetch(`/api/admin/visa-details/${programId}/claims/${claimId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete claim');
      setClaimDeletingId(null);
      await loadClaims();
      if (onMutated) onMutated();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvidence) return;
    const { claimId, evidence } = editingEvidence;
    if (!evidence.sourceUrl?.trim()) {
      setError('Official source URL is mandatory.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/visa-details/claims/${claimId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...evidence, programId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save evidence');
      setEditingEvidence(null);
      await loadClaims();
      if (onMutated) onMutated();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleQuickStatusUpdate = async (claimId: string, ev: any, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/visa-details/claims/${claimId}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ev, status: newStatus, programId })
      });
      if (!res.ok) throw new Error('Failed to update evidence status');
      await loadClaims();
      if (onMutated) onMutated();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConfirmDeleteEvidence = async () => {
    if (!evidenceDeleting) return;
    const { claimId, evidenceId } = evidenceDeleting;
    try {
      const res = await fetch(
        `/api/admin/visa-details/claims/${claimId}/evidence/${evidenceId}?programId=${encodeURIComponent(programId)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete evidence');
      setEvidenceDeleting(null);
      await loadClaims();
      if (onMutated) onMutated();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredClaims = claims.filter(c => sectionFilter === 'ALL' || c.section === sectionFilter);
  const totalPages = Math.max(1, Math.ceil(filteredClaims.length / pageSize));
  const paginatedClaims = filteredClaims.slice((page - 1) * pageSize, page * pageSize);

  // Summary metrics for visual warnings
  const missingEvidenceCount = claims.filter(c => !c.evidence || c.evidence.length === 0).length;
  const outdatedCount = claims.filter(c =>
    c.status === 'OUTDATED' || (c.evidence || []).some((e: any) => e.status === 'OUTDATED')
  ).length;
  const brokenLinkCount = claims.filter(c =>
    (c.evidence || []).some((e: any) => e.status === 'BROKEN_LINK')
  ).length;
  const awaitingReviewCount = claims.filter(
    c =>
      c.status === 'NEEDS_EVIDENCE' ||
      c.status === 'AWAITING_REVIEW' ||
      c.status === 'UNVERIFIED' ||
      (c.evidence || []).some((e: any) => e.status === 'NEEDS_REVIEW')
  ).length;
  const verifiedOfficialCount = claims.filter(
    c =>
      c.evidence &&
      c.evidence.length > 0 &&
      c.evidence.every((e: any) => e.status === 'VERIFIED_OFFICIAL')
  ).length;

  const getEvidenceStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED_OFFICIAL':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'OFFICIAL_BUT_NOT_FULLY_CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SECONDARY_SOURCE':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'OUTDATED':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'BROKEN_LINK':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading claims & official legal evidence...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
        <div>
          <h3 className="font-bold text-xl text-slate-900">Claim-Level Legal Evidence Manager</h3>
          <p className="text-sm text-slate-500">
            Every factual visa claim (fees, stay limits, documents, financial thresholds) must be backed by verified statutory or consular sources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadClaims}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={15} /> Reload
          </button>
          <button
            type="button"
            onClick={() =>
              setEditingClaim({
                section: 'B. Visa Overview',
                description: '',
                value: '',
                unit: '',
                status: 'NEEDS_EVIDENCE',
                reviewer: 'admin'
              })
            }
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
          >
            <Plus size={16} /> Add New Claim
          </button>
        </div>
      </div>

      {/* Visual Warning Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl border bg-rose-50 border-rose-200 flex items-center gap-2.5">
          <AlertCircle className="text-rose-600 shrink-0" size={20} />
          <div>
            <div className="text-xs font-medium text-rose-700">Missing Evidence</div>
            <div className="text-lg font-black text-rose-900">{missingEvidenceCount}</div>
          </div>
        </div>
        <div className="p-3 rounded-xl border bg-amber-50 border-amber-200 flex items-center gap-2.5">
          <Clock className="text-amber-600 shrink-0" size={20} />
          <div>
            <div className="text-xs font-medium text-amber-700">Outdated Evidence</div>
            <div className="text-lg font-black text-amber-900">{outdatedCount}</div>
          </div>
        </div>
        <div className="p-3 rounded-xl border bg-red-50 border-red-200 flex items-center gap-2.5">
          <Link2Off className="text-red-600 shrink-0" size={20} />
          <div>
            <div className="text-xs font-medium text-red-700">Broken Links</div>
            <div className="text-lg font-black text-red-900">{brokenLinkCount}</div>
          </div>
        </div>
        <div className="p-3 rounded-xl border bg-slate-50 border-slate-200 flex items-center gap-2.5">
          <ShieldAlert className="text-slate-600 shrink-0" size={20} />
          <div>
            <div className="text-xs font-medium text-slate-700">Awaiting Review</div>
            <div className="text-lg font-black text-slate-900">{awaitingReviewCount}</div>
          </div>
        </div>
        <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-200 flex items-center gap-2.5">
          <CheckCircle className="text-emerald-600 shrink-0" size={20} />
          <div>
            <div className="text-xs font-medium text-emerald-700">Verified Official</div>
            <div className="text-lg font-black text-emerald-900">{verifiedOfficialCount}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-slate-700">Filter by Section (A–M):</span>
          <select
            value={sectionFilter}
            onChange={e => {
              setSectionFilter(e.target.value);
              setPage(1);
            }}
            className="p-1.5 border border-slate-300 rounded-lg bg-white text-sm"
          >
            <option value="ALL">All Sections ({claims.length})</option>
            {A_TO_M_SECTIONS.map(sec => (
              <option key={sec.code} value={sec.label}>
                {sec.label}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-500">
          Showing {paginatedClaims.length} of {filteredClaims.length} claims
        </div>
      </div>

      {/* Add / Edit Claim Form Drawer */}
      {editingClaim && (
        <form onSubmit={handleSaveClaim} className="bg-indigo-50/60 border border-indigo-200 p-5 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-indigo-950">
              {editingClaim.id ? `Edit Claim (${editingClaim.id})` : 'Create New Visa Claim'}
            </h4>
            <button type="button" onClick={() => setEditingClaim(null)} className="text-slate-500 hover:text-slate-800">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Linked A–M Section *</label>
              <select
                required
                value={editingClaim.section}
                onChange={e => setEditingClaim({ ...editingClaim, section: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
              >
                {A_TO_M_SECTIONS.map(sec => (
                  <option key={sec.code} value={sec.label}>
                    {sec.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Claim Verification Status</label>
              <select
                value={editingClaim.status || 'NEEDS_EVIDENCE'}
                onChange={e => setEditingClaim({ ...editingClaim, status: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
              >
                {CLAIM_STATUSES.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reviewer</label>
              <input
                type="text"
                value={editingClaim.reviewer || 'admin'}
                onChange={e => setEditingClaim({ ...editingClaim, reviewer: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                placeholder="Reviewer ID"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Factual Claim Description *</label>
              <input
                type="text"
                required
                value={editingClaim.description || ''}
                onChange={e => setEditingClaim({ ...editingClaim, description: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                placeholder="e.g., Standard non-immigrant application fee for B1/B2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Claim Value</label>
              <input
                type="text"
                value={editingClaim.value || ''}
                onChange={e => setEditingClaim({ ...editingClaim, value: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                placeholder="e.g., 185"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit / Currency</label>
              <input
                type="text"
                value={editingClaim.unit || ''}
                onChange={e => setEditingClaim({ ...editingClaim, unit: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                placeholder="e.g., USD"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingClaim(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
            >
              <Save size={15} /> Save Claim
            </button>
          </div>
        </form>
      )}

      {/* Add / Edit Evidence Form Modal */}
      {editingEvidence && (
        <form onSubmit={handleSaveEvidence} className="bg-emerald-50/70 border border-emerald-300 p-5 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-emerald-950 flex items-center gap-2">
              <FileText size={18} />
              {editingEvidence.evidence.id
                ? `Edit Official Evidence (${editingEvidence.evidence.id})`
                : `Attach Evidence to Claim (${editingEvidence.claimId})`}
            </h4>
            <button type="button" onClick={() => setEditingEvidence(null)} className="text-slate-500 hover:text-slate-800">
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Note: Entering a URL does NOT automatically mark evidence as VERIFIED_OFFICIAL. Select the verified status only after confirming the primary statute or consular portal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source Title *</label>
              <input
                type="text"
                required
                value={editingEvidence.evidence.sourceTitle || ''}
                onChange={e =>
                  setEditingEvidence({
                    ...editingEvidence,
                    evidence: { ...editingEvidence.evidence, sourceTitle: e.target.value }
                  })
                }
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                placeholder="e.g., U.S. Department of State Fee Schedule"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Source URL *</label>
              <input
                type="url"
                required
                value={editingEvidence.evidence.sourceUrl || ''}
                onChange={e =>
                  setEditingEvidence({
                    ...editingEvidence,
                    evidence: { ...editingEvidence.evidence, sourceUrl: e.target.value }
                  })
                }
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                placeholder="https://travel.state.gov/..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Authority *</label>
              <input
                type="text"
                required
                value={editingEvidence.evidence.issuingAuthority || ''}
                onChange={e =>
                  setEditingEvidence({
                    ...editingEvidence,
                    evidence: { ...editingEvidence.evidence, issuingAuthority: e.target.value }
                  })
                }
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                placeholder="e.g., Bureau of Consular Affairs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exact Legal Provision / Article</label>
              <input
                type="text"
                value={editingEvidence.evidence.legalInstrument || ''}
                onChange={e =>
                  setEditingEvidence({
                    ...editingEvidence,
                    evidence: { ...editingEvidence.evidence, legalInstrument: e.target.value }
                  })
                }
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                placeholder="e.g., INA § 214(b), 22 CFR 41.31"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Publication Date</label>
              <input
                type="date"
                value={editingEvidence.evidence.publicationDate || ''}
                onChange={e =>
                  setEditingEvidence({
                    ...editingEvidence,
                    evidence: { ...editingEvidence.evidence, publicationDate: e.target.value }
                  })
                }
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Effective Date</label>
              <input
                type="date"
                value={editingEvidence.evidence.effectiveDate || ''}
                onChange={e =>
                  setEditingEvidence({
                    ...editingEvidence,
                    evidence: { ...editingEvidence.evidence, effectiveDate: e.target.value }
                  })
                }
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Access Date</label>
              <input
                type="date"
                value={editingEvidence.evidence.accessDate || ''}
                onChange={e =>
                  setEditingEvidence({
                    ...editingEvidence,
                    evidence: { ...editingEvidence.evidence, accessDate: e.target.value }
                  })
                }
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Evidence Verification Status *</label>
              <select
                value={editingEvidence.evidence.status || 'NEEDS_REVIEW'}
                onChange={e =>
                  setEditingEvidence({
                    ...editingEvidence,
                    evidence: { ...editingEvidence.evidence, status: e.target.value }
                  })
                }
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm font-medium"
              >
                {EVIDENCE_STATUSES.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reviewer Notes</label>
              <input
                type="text"
                value={editingEvidence.evidence.reviewerNotes || ''}
                onChange={e =>
                  setEditingEvidence({
                    ...editingEvidence,
                    evidence: { ...editingEvidence.evidence, reviewerNotes: e.target.value }
                  })
                }
                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                placeholder="Cross-checked against embassy fee bulletin..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingEvidence(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
            >
              <Save size={15} /> Save Evidence
            </button>
          </div>
        </form>
      )}

      {/* Claims List */}
      {paginatedClaims.length === 0 ? (
        <div className="p-8 border border-dashed border-slate-300 rounded-xl text-center text-slate-500">
          No claims recorded for this filter. Click &ldquo;Add New Claim&rdquo; to document a verifiable visa requirement.
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedClaims.map(claim => {
            const evList: any[] = Array.isArray(claim.evidence) ? claim.evidence : [];
            const hasMissing = evList.length === 0;
            const hasBroken = evList.some(e => e.status === 'BROKEN_LINK');
            const hasOutdated = claim.status === 'OUTDATED' || evList.some(e => e.status === 'OUTDATED');
            const isVerifiedOfficial = evList.length > 0 && evList.every(e => e.status === 'VERIFIED_OFFICIAL');

            return (
              <div
                key={claim.id}
                className={`border rounded-xl p-4 space-y-3 transition ${
                  hasMissing || hasBroken
                    ? 'border-rose-300 bg-rose-50/20'
                    : hasOutdated
                    ? 'border-amber-300 bg-amber-50/20'
                    : isVerifiedOfficial
                    ? 'border-emerald-300 bg-emerald-50/10'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-indigo-100 text-indigo-800">
                        {claim.section}
                      </span>
                      <span className="font-bold text-slate-900">{claim.description}</span>
                      {(claim.value || claim.unit) && (
                        <span className="px-2 py-0.5 text-xs font-mono bg-slate-100 text-slate-800 rounded border">
                          {claim.value} {claim.unit}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>
                        Claim Status: <strong className="text-slate-700">{claim.status}</strong>
                      </span>
                      {claim.reviewer && <span>Reviewer: {claim.reviewer}</span>}
                      {claim.reviewTimestamp && (
                        <span>Updated: {new Date(claim.reviewTimestamp).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Warning Badges & Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {hasMissing && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded bg-rose-100 text-rose-800">
                        <AlertCircle size={13} /> Missing Evidence
                      </span>
                    )}
                    {hasBroken && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-800">
                        <Link2Off size={13} /> Broken Link
                      </span>
                    )}
                    {hasOutdated && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-900">
                        <Clock size={13} /> Outdated
                      </span>
                    )}
                    {isVerifiedOfficial && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800">
                        <CheckCircle size={13} /> Verified Official
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setEditingEvidence({
                          claimId: claim.id,
                          evidence: {
                            sourceTitle: '',
                            sourceUrl: '',
                            issuingAuthority: '',
                            legalInstrument: '',
                            publicationDate: '',
                            effectiveDate: '',
                            accessDate: new Date().toISOString().split('T')[0],
                            reviewerNotes: '',
                            status: 'NEEDS_REVIEW'
                          }
                        })
                      }
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      <Plus size={13} /> Add Evidence
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingClaim(claim)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 rounded border border-slate-200 bg-white"
                      title="Edit Claim"
                    >
                      <Edit2 size={14} />
                    </button>

                    {claimDeletingId === claim.id ? (
                      <div className="flex items-center gap-1 bg-rose-100 px-2 py-1 rounded border border-rose-300">
                        <span className="text-xs text-rose-900 font-semibold">Confirm delete?</span>
                        <button
                          type="button"
                          onClick={() => handleConfirmDeleteClaim(claim.id)}
                          className="text-xs font-bold text-white bg-rose-600 px-2 py-0.5 rounded hover:bg-rose-700"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setClaimDeletingId(null)}
                          className="text-xs text-slate-700 px-1"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setClaimDeletingId(claim.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 rounded border border-slate-200 bg-white"
                        title="Delete Claim"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Linked Evidence Records */}
                <div className="pl-3 border-l-2 border-slate-200 space-y-2 mt-2">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Linked Evidence Records ({evList.length})
                  </div>
                  {evList.length === 0 ? (
                    <p className="text-xs text-rose-600 italic">
                      No official source linked yet. Attach an official statute, gazette, or consular webpage.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {evList.map((ev: any) => (
                        <div
                          key={ev.id}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-900">
                                {ev.sourceTitle || ev.legalInstrument || 'Official Source Document'}
                              </span>
                              {ev.issuingAuthority && (
                                <span className="text-slate-600">({ev.issuingAuthority})</span>
                              )}
                              {ev.legalInstrument && (
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded border border-indigo-200 font-mono">
                                  {ev.legalInstrument}
                                </span>
                              )}
                            </div>

                            <div>
                              <a
                                href={ev.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium break-all"
                              >
                                {ev.sourceUrl} <ExternalLink size={12} />
                              </a>
                            </div>

                            <div className="flex flex-wrap gap-3 text-slate-500">
                              {ev.publicationDate && <span>Published: {ev.publicationDate}</span>}
                              {ev.effectiveDate && <span>Effective: {ev.effectiveDate}</span>}
                              {ev.accessDate && <span>Accessed: {ev.accessDate}</span>}
                            </div>

                            {ev.reviewerNotes && (
                              <div className="text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                                <span className="font-semibold">Reviewer Note:</span> {ev.reviewerNotes}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap md:flex-col items-end justify-between gap-2 shrink-0">
                            <select
                              value={ev.status || 'NEEDS_REVIEW'}
                              onChange={e => handleQuickStatusUpdate(claim.id, ev, e.target.value)}
                              className={`px-2 py-1 rounded border text-xs font-bold ${getEvidenceStatusBadge(
                                ev.status || 'NEEDS_REVIEW'
                              )}`}
                            >
                              {EVIDENCE_STATUSES.map(st => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setEditingEvidence({ claimId: claim.id, evidence: ev })}
                                className="px-2 py-1 text-slate-700 hover:text-indigo-600 bg-white border rounded flex items-center gap-1"
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                              {evidenceDeleting?.evidenceId === ev.id ? (
                                <div className="flex items-center gap-1 bg-rose-100 px-2 py-1 rounded border border-rose-300">
                                  <button
                                    type="button"
                                    onClick={handleConfirmDeleteEvidence}
                                    className="text-white bg-rose-600 px-1.5 py-0.5 rounded font-bold"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEvidenceDeleting(null)}
                                    className="text-slate-600 px-1"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setEvidenceDeleting({ claimId: claim.id, evidenceId: ev.id })}
                                  className="px-2 py-1 text-rose-600 hover:bg-rose-50 bg-white border rounded flex items-center gap-1"
                                >
                                  <Trash2 size={12} /> Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-slate-600">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 px-3 py-1.5 border rounded-lg disabled:opacity-40"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
