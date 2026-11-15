import React, { useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  Scale,
  Building2,
  FileCheck2,
  ArrowLeft,
  AlertTriangle,
  Globe,
  Compass
} from 'lucide-react';
import {
  getPublicPriority1Pathways,
  type Priority1PathwayAudit
} from '../data/priority1AuditData';
import {
  PRIORITY2_COMPLETED_PATHWAYS,
  getPublicPriority2PathwayView,
  type Priority2PathwayAudit
} from '../data/priority2AuditData';
import { applySeoMetadataToDom } from '../utils/seoMetadataManager';

export interface ResolvedCanonicalPathway {
  priorityTier: 'PRIORITY_1' | 'PRIORITY_2';
  pathway: Priority1PathwayAudit | Omit<Priority2PathwayAudit, 'correctiveClassificationNotes'>;
}

/**
 * Resolves a public-eligible Priority 1 or Priority 2 canonical pathway by its canonical URL
 * (e.g., `/visa/japan/digital-nomad-visa` or `/visa/norway/self-employed-visa`).
 * Strictly excludes quarantined synthetic Priority 1 pathways and unverified/non-public records.
 */
export function resolvePublicCanonicalPathwayByUrl(rawUrl: string): ResolvedCanonicalPathway | null {
  const cleanUrl =
    String(rawUrl || '')
      .split('?')[0]
      .split('#')[0]
      .replace(/\/+$/, '')
      .toLowerCase() || '/';

  const p1Match = getPublicPriority1Pathways().find(
    (p) => p.canonicalUrl.replace(/\/+$/, '').toLowerCase() === cleanUrl
  );
  if (p1Match) {
    return {
      priorityTier: 'PRIORITY_1',
      pathway: p1Match
    };
  }

  const p2Candidate = PRIORITY2_COMPLETED_PATHWAYS.find(
    (p) => p.canonicalUrl.replace(/\/+$/, '').toLowerCase() === cleanUrl
  );
  if (p2Candidate) {
    const publicSafe = getPublicPriority2PathwayView(p2Candidate.id);
    if (publicSafe) {
      return {
        priorityTier: 'PRIORITY_2',
        pathway: publicSafe
      };
    }
  }

  return null;
}

interface CanonicalPathwayPageProps {
  pathwayUrl: string;
  navigate: (path: string) => void;
}

export const CanonicalPathwayPage: React.FC<CanonicalPathwayPageProps> = ({
  pathwayUrl,
  navigate
}) => {
  const resolved = useMemo(() => resolvePublicCanonicalPathwayByUrl(pathwayUrl), [pathwayUrl]);

  useEffect(() => {
    if (resolved) {
      const { pathway, priorityTier } = resolved;
      const tierLabel = priorityTier === 'PRIORITY_1' ? 'Priority 1 Statutory Pathway' : 'Priority 2 Statutory Pathway';
      applySeoMetadataToDom(
        {
          title: `${pathway.destination} – ${pathway.category} (${tierLabel}) | VisaApply.org`,
          description: `Verified statutory reference for ${pathway.localStatutoryName} in ${pathway.destination}, issued by ${pathway.issuingAuthority} under ${pathway.legalProvision}.`,
          canonical: `https://www.visaapply.org${pathway.canonicalUrl}`,
          ogType: 'article'
        },
        pathway.canonicalUrl
      );
    } else {
      applySeoMetadataToDom(
        {
          title: '404 – Page or Immigration Pathway Not Found | VisaApply.org',
          description:
            'The requested immigration pathway or page is either not found or quarantined pending statutory source verification on VisaApply.org.',
          noindex: true
        },
        pathwayUrl
      );
    }
  }, [resolved, pathwayUrl]);

  if (!resolved) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          role="region"
          aria-labelledby="not-found-heading"
          className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-700" aria-hidden="true" />
            <span>HTTP 404 • Unverified or Non-Existent Route</span>
          </div>
          <h1
            id="not-found-heading"
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3"
          >
            404 — Page or Statutory Pathway Not Found
          </h1>
          <p className="text-slate-700 text-base leading-relaxed mb-6">
            The URL <code className="px-2 py-0.5 bg-slate-100 rounded text-sm font-mono text-slate-900">{pathwayUrl}</code> does not correspond to an active public page or verified sovereign immigration pathway. Under VisaApply.org’s strict fail-closed publication policy, unverified or quarantined pathways are never published.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B3D91] text-white font-semibold text-sm hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Return to Homepage
            </button>
            <button
              type="button"
              onClick={() => navigate('/immigration')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-semibold text-sm hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
            >
              <Globe className="w-4 h-4" aria-hidden="true" />
              Browse Global Immigration Hub
            </button>
            <button
              type="button"
              onClick={() => navigate('/routes')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-semibold text-sm hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] focus-visible:ring-offset-2"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              Explore Bilateral Visa Routes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { pathway, priorityTier } = resolved;
  const p1Sections =
    priorityTier === 'PRIORITY_1' && 'sections' in pathway && Array.isArray(pathway.sections)
      ? pathway.sections.filter((s) => s.status === 'VERIFIED' || s.status === 'PARTIALLY_VERIFIED')
      : [];
  const p2Notice =
    priorityTier === 'PRIORITY_2' && 'officialStatusNotice' in pathway
      ? pathway.officialStatusNotice
      : undefined;
  const p2Instrument =
    priorityTier === 'PRIORITY_2' && 'legalInstrumentType' in pathway
      ? pathway.legalInstrumentType
      : undefined;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <li>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="hover:text-[#0B3D91] underline-offset-2 hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] rounded px-1"
            >
              Home
            </a>
          </li>
          <li aria-hidden="true" className="text-slate-400">
            /
          </li>
          <li>
            <a
              href="/immigration"
              onClick={(e) => {
                e.preventDefault();
                navigate('/immigration');
              }}
              className="hover:text-[#0B3D91] underline-offset-2 hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] rounded px-1"
            >
              Global Immigration Hub
            </a>
          </li>
          <li aria-hidden="true" className="text-slate-400">
            /
          </li>
          <li>
            <a
              href={`/immigration/${pathway.destCode.toLowerCase()}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/immigration/${pathway.destCode.toLowerCase()}`);
              }}
              className="hover:text-[#0B3D91] underline-offset-2 hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] rounded px-1"
            >
              {pathway.destination} ({pathway.destCode})
            </a>
          </li>
          <li aria-hidden="true" className="text-slate-400">
            /
          </li>
          <li aria-current="page" className="font-semibold text-slate-900">
            {pathway.category}
          </li>
        </ol>
      </nav>

      {/* Non-Government Disclaimer Banner */}
      <div
        role="note"
        aria-label="Independent Legal Reference Disclaimer"
        className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed"
      >
        <strong className="font-bold text-slate-900">Independent Reference Notice:</strong> VisaApply.org is an independent immigration research platform and is not affiliated with {pathway.issuingAuthority}. All statutory citations link directly to the primary government portal.
      </div>

      {/* Primary Sovereign Pathway Header Card */}
      <article className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="bg-[#0B3D91] text-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/15 text-white text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-300" aria-hidden="true" />
              {priorityTier === 'PRIORITY_1' ? 'Priority 1 Genuine Pathway' : 'Priority 2 Sovereign Pathway'}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-900/60 border border-emerald-400/40 text-emerald-100 text-xs font-semibold">
              Status: {pathway.verificationStatus}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/10 text-blue-100 text-xs font-mono">
              ID: {pathway.id}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2">
            {pathway.destination}: {pathway.category}
          </h1>
          <p className="text-blue-100 text-base sm:text-lg font-medium">
            {pathway.localStatutoryName}
          </p>
        </div>

        {/* Statutory Metadata Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-[#0B3D91] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Competent Issuing Authority
              </h2>
              <p className="text-sm sm:text-base font-semibold text-slate-900">
                {pathway.issuingAuthority}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Scale className="w-5 h-5 text-[#0B3D91] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Primary Statutory / Legal Provision
              </h2>
              <p className="text-sm sm:text-base font-semibold text-slate-900">
                {pathway.legalProvision}
              </p>
            </div>
          </div>

          {p2Instrument && (
            <div className="flex items-start gap-3">
              <FileCheck2 className="w-5 h-5 text-[#0B3D91] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Legal Instrument Classification
                </h2>
                <p className="text-sm sm:text-base font-semibold text-slate-900">
                  {p2Instrument}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-[#0B3D91] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Primary Official Government Source
              </h2>
              <a
                href={pathway.directSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm sm:text-base font-semibold text-[#0B3D91] hover:underline break-all inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91] rounded"
              >
                <span>{pathway.directSourceUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Priority 2 Official Status Notice & Traceability */}
        {p2Notice && (
          <div className="p-6 sm:p-8 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Verified Statutory Summary & Scope Notice
            </h2>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-4">
              {p2Notice}
            </p>
            <div className="flex flex-wrap gap-2">
              {pathway.evidenceIds.map((evd) => (
                <span
                  key={evd}
                  className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 text-[#0B3D91] border border-blue-200 text-xs font-mono font-semibold"
                >
                  Evidence: {evd}
                </span>
              ))}
              {pathway.claimIds.map((clm) => (
                <span
                  key={clm}
                  className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 text-xs font-mono"
                >
                  Claim: {clm}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Priority 1 30-Section Statutory Audit Table */}
        {p1Sections.length > 0 && (
          <div className="p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
              Verified 30-Section Statutory Audit Dossier ({p1Sections.length} Verified Sections)
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-100 text-slate-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Section
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Verified Statutory Requirement
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Claim Type & Applicability
                    </th>
                    <th scope="col" className="px-4 py-3 font-bold">
                      Evidence ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {p1Sections.map((sec) => (
                    <tr key={sec.sectionNum} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900 align-top">
                        {sec.sectionName}
                      </td>
                      <td className="px-4 py-3 text-slate-700 align-top">
                        <div className="font-medium text-slate-900 mb-1">{sec.storedValue}</div>
                        <div className="text-xs text-slate-600">{sec.supportingExcerpt}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-700 align-top">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono mb-1">
                          {sec.claimType}
                        </span>
                        <div className="text-slate-600">Scope: {sec.legalApplicability}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#0B3D91] align-top">
                        {sec.evidenceId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            Last Verified Timestamp:{' '}
            <span className="font-mono font-semibold text-slate-800">
              {pathway.lastVerifiedTimestamp}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/immigration/${pathway.destCode.toLowerCase()}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
            >
              <Globe className="w-4 h-4 text-[#0B3D91]" aria-hidden="true" />
              All {pathway.destination} Pathways
            </button>
            <button
              type="button"
              onClick={() => navigate(`/in-to-${pathway.destCode.toLowerCase()}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B3D91] text-white text-xs sm:text-sm font-semibold hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3D91]"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              Check Bilateral Visa Requirements
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};
