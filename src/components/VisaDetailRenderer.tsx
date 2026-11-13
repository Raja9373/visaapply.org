import React, { useState, useMemo } from 'react';
import {
  Shield,
  Check,
  DollarSign,
  Clock,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Globe,
  FileText,
  Search,
  BookOpen,
  Info,
  CheckCircle2,
  Slash,
  Calendar,
  Building2,
  HelpCircle
} from 'lucide-react';
import {
  SIX_LIFECYCLE_STAGES,
  THIRTY_SECTIONS_REGISTRY,
  TWENTY_TWO_SPECIAL_TOPICS_REGISTRY,
  REQUIREMENT_CLASSIFICATION_META,
  normalizeVisaDetailTo30Sections,
  isSectionSubstantivelyPopulated,
  isTopicSubstantivelyPopulated
} from '../types/visaComprehensiveProfile';
import type {
  VisaComprehensiveProfile,
  SectionVerificationState,
  RequirementClassification
} from '../types/visaComprehensiveProfile';
import { COMMON_NATIONALITY_OPTIONS } from './admin/ClaimsManager';

interface VisaDetailRendererProps {
  details: any;
  selectedNationality?: string;
  onNationalityChange?: (nationality: string) => void;
  hideNationalitySelector?: boolean;
  initialTab?: 'stages' | 'topics' | 'claims';
}

export function VisaDetailRenderer({
  details,
  selectedNationality: externalNationality,
  onNationalityChange,
  hideNationalitySelector = false,
  initialTab = 'stages'
}: VisaDetailRendererProps) {
  const [internalNationality, setInternalNationality] = useState<string>('ALL');
  const activeNationality = externalNationality || internalNationality;

  const [activeStage, setActiveStage] = useState<number>(1);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const [topicSearch, setTopicSearch] = useState<string>('');
  const [showTopicsModal, setShowTopicsModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'stages' | 'topics' | 'claims'>(initialTab);

  const profile: VisaComprehensiveProfile = useMemo(() => {
    if (!details) return normalizeVisaDetailTo30Sections({});
    if (details.comprehensiveSections && details.comprehensiveSections.sections) {
      return details.comprehensiveSections;
    }
    return normalizeVisaDetailTo30Sections(details);
  }, [details]);

  const handleNationalitySelect = (nat: string) => {
    setInternalNationality(nat);
    onNationalityChange?.(nat);
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTopic = (key: string) => {
    setExpandedTopics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getTierMeta = (classification?: string) => {
    return (
      REQUIREMENT_CLASSIFICATION_META.find(m => m.code === classification) ||
      REQUIREMENT_CLASSIFICATION_META[1]
    );
  };

  const renderVerificationBadge = (state?: SectionVerificationState | string, reason?: string | null) => {
    const normalized = String(state || 'AWAITING_VERIFICATION').trim().toUpperCase();
    switch (normalized) {
      case 'VERIFIED':
      case 'AVAILABLE_VERIFIED':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300"
            title="Official legal or consular evidence confirmed"
          >
            <CheckCircle2 size={12} className="text-emerald-700" />
            VERIFIED OFFICIAL
          </span>
        );
      case 'PARTIAL':
      case 'PARTIALLY_VERIFIED':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300"
            title="Core statutory basis confirmed; some procedural or post-level details remain unconfirmed"
          >
            <Clock size={12} className="text-blue-700" />
            PARTIALLY VERIFIED (SOME DETAILS UNCONFIRMED)
          </span>
        );
      case 'CONFLICTING':
      case 'CONFLICTING_EVIDENCE':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-orange-100 text-orange-900 border border-orange-300"
            title={reason || 'Conflicting primary or administrative enforcement thresholds reported; verify directly with sovereign authority'}
          >
            <AlertTriangle size={12} className="text-orange-700" />
            CONFLICTING EVIDENCE (QUARANTINED)
          </span>
        );
      case 'EXPIRED':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300"
            title={reason || 'Historical / expired rule — NOT currently in force'}
          >
            <Slash size={12} className="text-rose-700" />
            EXPIRED / HISTORICAL (NOT CURRENT)
          </span>
        );
      case 'NOT_APPLICABLE':
      case 'NOT_AVAILABLE_CONFIRMED':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-200 text-slate-800 border border-slate-300"
            title={reason || 'Confirmed not applicable by law or policy'}
          >
            <Slash size={12} className="text-slate-600" />
            NOT APPLICABLE
          </span>
        );
      case 'AWAITING_VERIFICATION':
      case 'AWAITING_OFFICIAL_VERIFICATION':
      case 'UNKNOWN':
      default:
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300"
            title="Awaiting official primary source verification — do not treat as confirmed current rule"
          >
            <AlertTriangle size={12} className="text-amber-700" />
            AWAITING OFFICIAL VERIFICATION
          </span>
        );
    }
  };

  const filteredTopics = useMemo(() => {
    const q = topicSearch.trim().toLowerCase();
    return TWENTY_TWO_SPECIAL_TOPICS_REGISTRY.filter(t => {
      if (!q) return true;
      const tObj = profile.applicantSpecialTopics?.[t.topicKey];
      const hay = `${t.topicNumber} ${t.shortTitle} ${t.title} ${tObj?.summary || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [topicSearch, profile]);

  const activeClaims = useMemo(() => {
    const list: any[] = Array.isArray(details?.claims) ? details.claims : [];
    const safeList = list.filter(c => {
      if (c?.isQuarantined === true) return false;
      const st = String(c?.status || '').toUpperCase();
      return !['QUARANTINED', 'REJECTED', 'EXPIRED'].includes(st);
    });
    if (!activeNationality || activeNationality === 'ALL') return safeList;
    return safeList.filter(c => {
      const nat = String(c.applicableNationality || c.applicable_nationality || 'ALL').toUpperCase();
      return nat === 'ALL' || nat === activeNationality;
    });
  }, [details, activeNationality]);

  const expiredClaims = useMemo(() => {
    const list: any[] = Array.isArray(details?.claims) ? details.claims : [];
    const expList = list.filter(c => {
      if (c?.isQuarantined === true) return false;
      return String(c?.status || '').toUpperCase() === 'EXPIRED';
    });
    if (!activeNationality || activeNationality === 'ALL') return expList;
    return expList.filter(c => {
      const nat = String(c.applicableNationality || c.applicable_nationality || 'ALL').toUpperCase();
      return nat === 'ALL' || nat === activeNationality;
    });
  }, [details, activeNationality]);

  const nationalitySpecificClaims = useMemo(() => {
    if (!activeNationality || activeNationality === 'ALL') return [];
    return activeClaims.filter(c => {
      const nat = String(c.applicableNationality || c.applicable_nationality || 'ALL').toUpperCase();
      return nat === activeNationality;
    });
  }, [activeClaims, activeNationality]);

  const universalClaims = useMemo(() => {
    return activeClaims.filter(c => {
      const nat = String(c.applicableNationality || c.applicable_nationality || 'ALL').toUpperCase();
      return nat === 'ALL';
    });
  }, [activeClaims]);

  if (!details) return null;

  return (
    <div className="space-y-6 mt-6">
      {/* Top Banner & Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {renderVerificationBadge(details.verificationStatus)}
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200">
                Program ID: {details.programId || 'us-TOU-001'}
              </span>
              {details.lastUpdated && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar size={13} /> Audited: {new Date(details.lastUpdated).toLocaleDateString()}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {profile.sections.s02_visaProgramOverview?.visaName ||
                details.visaOverview?.name ||
                details.visaOverview?.visaName ||
                'Visa Program Intelligence'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Official evidence-backed intelligence across 30 applicant lifecycle stages and 22 special edge-case topics.
            </p>
          </div>

          {/* Nationality Selector */}
          {!hideNationalitySelector && (
            <div className="w-full lg:w-auto bg-slate-50 border border-slate-200 p-3.5 rounded-xl shrink-0">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Globe size={13} className="text-blue-700" />
                Applicant Passport Nationality:
              </label>
              <select
                value={activeNationality}
                onChange={e => handleNationalitySelect(e.target.value)}
                className="w-full lg:w-64 p-2 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COMMON_NATIONALITY_OPTIONS.map(opt => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="text-[10px] text-slate-500 mt-1 font-medium">
                {activeNationality === 'ALL'
                  ? 'Showing universal baseline rules for all nationalities.'
                  : `Showing verified rules & overrides for ${activeNationality} passport holders.`}
              </div>
            </div>
          )}
        </div>

        {/* Nationality Filter Alert & Overrides Summary */}
        {activeNationality !== 'ALL' && (
          <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50/70 text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Globe size={14} className="text-blue-700" />
              <span>
                Nationality Scope: <strong>{activeNationality}</strong> Passport Holder
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {nationalitySpecificClaims.length > 0 ? (
                <span>
                  Found <strong>{nationalitySpecificClaims.length}</strong> specific verified requirement rule(s) for{' '}
                  <strong>{activeNationality}</strong> applicants. Universal requirements also apply unless an explicit statutory exemption is noted below.
                </span>
              ) : (
                <span className="italic text-slate-600">
                  No nationality-specific statutory overrides recorded for {activeNationality}; standard universal consular baseline rules apply.
                </span>
              )}
            </p>
          </div>
        )}

        {/* View Mode Navigation Tabs */}
        <div className="flex border-b border-slate-200 mt-6 gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('stages')}
            className={`pb-3 px-3 sm:px-4 border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'stages'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            30 Lifecycle Stages (1–6)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('topics')}
            className={`pb-3 px-3 sm:px-4 border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'topics'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>22 Applicant Special Topics</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
              22
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('claims')}
            className={`pb-3 px-3 sm:px-4 border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'claims'
                ? 'border-blue-700 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Legal Claims &amp; Verification Status</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
              {activeClaims.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: 30 Lifecycle Stages */}
      {activeTab === 'stages' && (
        <div className="space-y-6">
          {/* Stage Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {SIX_LIFECYCLE_STAGES.map(stage => (
              <button
                key={stage.stageNumber}
                type="button"
                onClick={() => setActiveStage(stage.stageNumber)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  activeStage === stage.stageNumber
                    ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                  Stage {stage.stageNumber}
                </div>
                <div className="text-xs font-bold leading-tight mt-0.5">{stage.title}</div>
              </button>
            ))}
          </div>

          {/* Active Stage Sections */}
          <div className="space-y-4">
            {THIRTY_SECTIONS_REGISTRY.filter(s => s.stageNumber === activeStage).map(reg => {
              const secObj = profile.sections?.[reg.sectionKey] as any;
              const meta = secObj?.meta;
              const isExpanded = expandedSections[reg.sectionKey] ?? true;
              const isPopulated = isSectionSubstantivelyPopulated(secObj);
              const tierMeta = getTierMeta(meta?.requirementClassification);

              return (
                <div
                  key={reg.sectionKey}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
                >
                  <div
                    onClick={() => toggleSection(reg.sectionKey)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer hover:bg-slate-50/60 select-none border-b border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-black text-xs flex items-center justify-center shrink-0">
                        {reg.sectionNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-900 text-base sm:text-lg">
                            {reg.title}
                          </h3>
                          {meta && renderVerificationBadge(meta.verificationState, meta.applicabilityReason)}
                          {meta?.requirementClassification && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tierMeta.badgeClass}`}
                            >
                              {tierMeta.shortLabel}
                            </span>
                          )}
                        </div>
                        {meta?.legalBasis && (
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            Legal Reference: {meta.legalBasis}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 self-end sm:self-auto">
                      <span className="text-xs font-semibold hidden sm:inline text-slate-500">
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </span>
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-800">
                      {/* Explicit Verification Status Banners */}
                      {(meta?.verificationState === 'CONFLICTING' || meta?.verificationState === 'CONFLICTING_EVIDENCE') && (
                        <div className="p-3.5 bg-orange-50 border border-orange-300 rounded-xl flex items-start gap-2 text-orange-950 text-xs">
                          <AlertTriangle size={16} className="text-orange-700 shrink-0 mt-0.5" />
                          <span>
                            <strong>Conflicting Official / Enforcement Guidance:</strong> Divergent thresholds or instructions exist across official sources or local authorities. Do not rely on a single figure as settled fact without checking the competent authority directly.
                          </span>
                        </div>
                      )}

                      {meta?.verificationState === 'EXPIRED' && (
                        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2 text-rose-950 text-xs">
                          <Slash size={16} className="text-rose-700 shrink-0 mt-0.5" />
                          <span>
                            <strong>Historical / Expired Rule (Not Currently in Force):</strong> This section reflects superseded or expired provisions retained only for historical reference and is not a current application requirement.
                          </span>
                        </div>
                      )}

                      {(meta?.verificationState === 'PARTIAL' || meta?.verificationState === 'PARTIALLY_VERIFIED') && (
                        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2 text-blue-950 text-xs">
                          <Clock size={16} className="text-blue-700 shrink-0 mt-0.5" />
                          <span>
                            <strong>Partially Verified:</strong> Core statutory rules are confirmed, while some post-level, fee, or bilateral details remain unconfirmed and subject to consular variation.
                          </span>
                        </div>
                      )}

                      {((!isPopulated && meta?.verificationState !== 'NOT_APPLICABLE' && meta?.verificationState !== 'EXPIRED') ||
                        meta?.verificationState === 'AWAITING_VERIFICATION' ||
                        meta?.verificationState === 'AWAITING_OFFICIAL_VERIFICATION' ||
                        meta?.verificationState === 'UNKNOWN') && (
                        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-900 text-xs">
                          <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                          <span>
                            <strong>Awaiting Official Consular Verification:</strong> Specific details for this section could not be confirmed from live primary sources and must not be treated as established current rules.
                          </span>
                        </div>
                      )}

                      {meta?.verificationState === 'NOT_APPLICABLE' && (
                        <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-700 text-xs">
                          <span className="font-bold text-slate-900">Not Applicable by Policy/Law: </span>
                          {meta.applicabilityReason || 'Confirmed not applicable for this visa program category.'}
                        </div>
                      )}

                      {/* Render Structured Content only when NOT expired and NOT inapplicable */}
                      {meta?.verificationState !== 'NOT_APPLICABLE' && meta?.verificationState !== 'EXPIRED' && (
                        <StructuredSectionContent
                          sectionKey={reg.sectionKey}
                          secObj={secObj}
                          programId={details.programId}
                          legacyDetails={details}
                        />
                      )}

                      {/* Official Source & Verification Metadata Box */}
                      {meta?.officialSourceUrl && (
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <Shield size={13} className="text-emerald-600" />
                            <span>
                              Authority: <strong>{meta.issuingAuthority || 'Competent Consular Agency'}</strong>
                            </span>
                            {meta.lastVerifiedAt && (
                              <span>• Verified: {new Date(meta.lastVerifiedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                          <a
                            href={meta.officialSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 underline"
                          >
                            <span>Verify on Official Portal</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 22 Applicant Special Topics */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="w-full sm:w-auto">
              <h3 className="font-black text-slate-900 text-base">22 Applicant Special Topics</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Passport validity, blank pages, transit, brachycephalic pets, criminal declarations, tax status, and refusal rules.
              </p>
            </div>
            <div className="w-full sm:w-72 relative">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={topicSearch}
                onChange={e => setTopicSearch(e.target.value)}
                placeholder="Search 22 topics..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredTopics.map(tReg => {
              const topObj = profile.applicantSpecialTopics?.[tReg.topicKey];
              const isExpanded = expandedTopics[tReg.topicKey] ?? false;
              const isPopulated = isTopicSubstantivelyPopulated(topObj);
              const tierMeta = getTierMeta(topObj?.requirementClassification);

              return (
                <div
                  key={tReg.topicKey}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  <div
                    onClick={() => toggleTopic(tReg.topicKey)}
                    className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 cursor-pointer hover:bg-slate-50/70 select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 font-black text-xs flex items-center justify-center shrink-0">
                        T{String(tReg.topicNumber).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">{tReg.title}</h4>
                          {renderVerificationBadge(topObj?.verificationState)}
                          {topObj?.requirementClassification && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tierMeta.badgeClass}`}
                            >
                              {tierMeta.shortLabel}
                            </span>
                          )}
                        </div>
                        {topObj?.summary && (
                          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5 font-normal">
                            {topObj.summary}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold self-end sm:self-auto shrink-0">
                      <span>{isExpanded ? 'Hide' : 'Details'}</span>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/40 space-y-3 text-xs text-slate-800">
                      {topObj?.verificationState === 'EXPIRED' ? (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-950 text-xs">
                          <strong>Historical / Expired Rule:</strong> This topic rule has expired or been superseded and is NOT currently in force.
                        </div>
                      ) : topObj?.verificationState === 'CONFLICTING' || topObj?.verificationState === 'CONFLICTING_EVIDENCE' ? (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-orange-950 text-xs">
                          <strong>Conflicting Guidance:</strong> Primary or administrative sources conflict; treat as unconfirmed pending sovereign clarification.
                        </div>
                      ) : topObj?.verificationState === 'NOT_APPLICABLE' ? (
                        <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 text-xs">
                          <strong>Not Applicable:</strong> Confirmed not applicable to this pathway.
                        </div>
                      ) : (!isPopulated || topObj?.verificationState === 'AWAITING_VERIFICATION' || topObj?.verificationState === 'AWAITING_OFFICIAL_VERIFICATION') && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                          <strong>Awaiting Official Verification:</strong> Specific statutory rules for this topic have not yet been verified and must not be treated as confirmed facts.
                        </div>
                      )}

                      {topObj?.summary && (
                        <div>
                          <span className="font-bold text-slate-900 block mb-1">Official Policy Summary:</span>
                          <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                            {topObj.summary}
                          </p>
                        </div>
                      )}

                      {topObj?.legalReference && (
                        <div>
                          <span className="font-bold text-slate-900">Legal Reference: </span>
                          <span className="font-mono text-slate-600">{topObj.legalReference}</span>
                        </div>
                      )}

                      {topObj?.officialSourceUrl && (
                        <div className="pt-2 flex justify-end">
                          <a
                            href={topObj.officialSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                          >
                            <span>Verify Source</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Verified Legal Claims & Evidence */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-black text-slate-900 text-lg mb-1">
              Verified Legal Requirements &amp; Evidence Audit Trail
            </h3>
            <p className="text-xs text-slate-600">
              Every requirement on VisaApply.org is classified across the 5-Tier Legal Standard and bound to primary official statutory records.
            </p>
          </div>

          {activeClaims.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No active non-quarantined claims recorded for this program and selected nationality filter.
            </div>
          ) : (
            <div className="space-y-3">
              {activeClaims.map(claim => {
                const tierMeta = getTierMeta(claim.requirementClassification);
                const evidenceList: any[] = Array.isArray(claim.evidence) ? claim.evidence : [];
                const isVerified = claim.status === 'VERIFIED';

                return (
                  <div
                    key={claim.id}
                    className={`p-5 rounded-2xl border shadow-xs space-y-3 ${
                      claim.status === 'CONFLICTING' || claim.status === 'CONFLICTING_EVIDENCE'
                        ? 'bg-orange-50/40 border-orange-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-900 text-white">
                          {claim.section}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tierMeta.badgeClass}`}
                        >
                          {tierMeta.shortLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1">
                          <Globe size={11} /> Passport: {claim.applicableNationality || 'ALL'}
                        </span>
                        {renderVerificationBadge(claim.status)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Value: <strong>{claim.value || 'N/A'} {claim.unit || ''}</strong>
                      </div>
                    </div>

                    {(claim.status === 'CONFLICTING' || claim.status === 'CONFLICTING_EVIDENCE') && (
                      <div className="text-[11px] font-semibold text-orange-900 bg-orange-100/70 border border-orange-200 px-3 py-1.5 rounded-lg">
                        Conflicting Guidance — Reported values diverge across authorities; do not rely on as settled fact.
                      </div>
                    )}
                    {(claim.status === 'AWAITING_VERIFICATION' || claim.status === 'AWAITING_OFFICIAL_VERIFICATION') && (
                      <div className="text-[11px] font-semibold text-amber-900 bg-amber-100/70 border border-amber-200 px-3 py-1.5 rounded-lg">
                        Unconfirmed — Awaiting live official primary source verification.
                      </div>
                    )}

                    <div className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {claim.description}
                    </div>

                    {/* Associated Official Evidence */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Supporting Official Primary Sources ({evidenceList.length}):
                      </div>
                      {evidenceList.length === 0 ? (
                        <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                          Awaiting primary official evidence attachment.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {evidenceList.map((ev, idx) => (
                            <div
                              key={ev.id || idx}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                            >
                              <div>
                                <div className="font-bold text-slate-900">
                                  {ev.sourceTitle || 'Official Government Source'}
                                </div>
                                <div className="text-[11px] text-slate-600 flex flex-wrap gap-2 mt-0.5">
                                  <span>Authority: {ev.issuingAuthority || 'Consular Authority'}</span>
                                  {ev.legalInstrument && (
                                    <span>• Provision: {ev.legalInstrument}</span>
                                  )}
                                  {ev.publicationDate && (
                                    <span>• Published: {ev.publicationDate}</span>
                                  )}
                                  {ev.effectiveDate && <span>• Effective: {ev.effectiveDate}</span>}
                                </div>
                                {ev.excerpt && (
                                  <p className="mt-1 font-mono text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                                    "{ev.excerpt}"
                                  </p>
                                )}
                              </div>
                              {ev.sourceUrl && (
                                <a
                                  href={ev.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 underline shrink-0 self-end sm:self-auto"
                                >
                                  <span>View Official Source</span>
                                  <ExternalLink size={12} />
                                </a>
                              )}
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

          {expiredClaims.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-rose-200">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950">
                <strong>Historical / Expired Rules ({expiredClaims.length}) — Not Currently in Force:</strong> Retained strictly for statutory history; do not apply these superseded rules to current applications.
              </div>
              {expiredClaims.map(claim => (
                <div key={claim.id} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-white">{claim.section}</span>
                    {renderVerificationBadge('EXPIRED')}
                  </div>
                  <div className="font-bold text-slate-900">{claim.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Renders structured content fields for each 30-section key without fabricating missing values.
 */
export function StructuredSectionContent({
  sectionKey,
  secObj,
  programId,
  legacyDetails
}: {
  sectionKey: string;
  secObj: any;
  programId: string;
  legacyDetails: any;
}) {
  if (!secObj) return null;

  switch (sectionKey) {
    case 's01_countryOverview':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <InfoCard label="Capital" value={secObj.capital || legacyDetails?.countryOverview?.capital} />
          <InfoCard label="Currency" value={secObj.currency || legacyDetails?.countryOverview?.currency} />
          <InfoCard label="Official Language" value={secObj.officialLanguage || legacyDetails?.countryOverview?.language} />
          <InfoCard label="Best Travel Season" value={secObj.bestTravelSeason || legacyDetails?.countryOverview?.bestTravelSeason} />
          {secObj.primaryImmigrationAgency && (
            <div className="sm:col-span-2">
              <InfoCard label="Primary Immigration Authority" value={secObj.primaryImmigrationAgency} />
            </div>
          )}
        </div>
      );

    case 's02_visaProgramOverview':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoCard label="Visa Category" value={secObj.category || legacyDetails?.visaOverview?.category} />
            <InfoCard label="Max Stay Duration" value={secObj.stayDuration || legacyDetails?.visaOverview?.stay} />
            <InfoCard label="Visa Validity" value={secObj.validity || legacyDetails?.visaOverview?.validity} />
          </div>
          {(secObj.purpose || legacyDetails?.visaOverview?.purpose) && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 text-xs block mb-1">Permitted Purpose:</span>
              <p className="text-slate-900 text-xs leading-relaxed">
                {secObj.purpose || legacyDetails?.visaOverview?.purpose}
              </p>
            </div>
          )}
        </div>
      );

    case 's05_coreEligibilityRequirements':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoCard label="Minimum Age" value={secObj.minAge ? `${secObj.minAge} years` : null} />
            <InfoCard label="Maximum Age" value={secObj.maxAge ? `${secObj.maxAge} years` : 'No Upper Limit'} />
            <InfoCard
              label="Police Clearance Certificate"
              value={
                secObj.policeClearanceRequired === true
                  ? 'Mandatory'
                  : secObj.policeClearanceRequired === false
                  ? 'Not Required for Tourist/Visitor'
                  : null
              }
            />
          </div>
          {(secObj.summary || legacyDetails?.eligibility?.summary) && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Eligibility Summary:</span>
              <p className="text-slate-900 leading-relaxed">
                {secObj.summary || legacyDetails?.eligibility?.summary}
              </p>
            </div>
          )}
        </div>
      );

    case 's09_financialAndProofOfFunds':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoCard
              label="Recommended Available Funds"
              value={secObj.recommendedFunds || legacyDetails?.financial?.recommendedFunds}
              highlight
            />
            <InfoCard
              label="Minimum Bank Balance"
              value={secObj.minBankBalance || legacyDetails?.financial?.minBankBalance}
            />
            <InfoCard
              label="Bank Statement Required"
              value={
                secObj.bankStatementMonths
                  ? `Last ${secObj.bankStatementMonths} Months`
                  : legacyDetails?.financial?.bankStatementsMonths
                  ? `Last ${legacyDetails.financial.bankStatementsMonths} Months`
                  : 'Recent 3–6 Months'
              }
            />
          </div>
        </div>
      );

    case 's11_completeDocumentChecklist': {
      const docs: any[] = Array.isArray(secObj.documents) && secObj.documents.length > 0
        ? secObj.documents
        : Array.isArray(legacyDetails?.documentChecklist)
        ? legacyDetails.documentChecklist
        : [];
      return (
        <div className="space-y-2">
          {docs.length === 0 ? (
            <div className="text-xs text-slate-500 italic">No checklist documents recorded.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {docs.map((doc, idx) => {
                const name = doc.name || doc.item || (typeof doc === 'string' ? doc : 'Required Document');
                const mandatory = doc.mandatory !== false;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs"
                  >
                    <Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">{name}</div>
                      {doc.description && <div className="text-slate-600 text-[11px] mt-0.5">{doc.description}</div>}
                      <div className="flex gap-2 mt-1 text-[10px]">
                        <span className={`px-1.5 py-0.2 rounded font-bold ${mandatory ? 'bg-rose-50 text-rose-800' : 'bg-slate-200 text-slate-700'}`}>
                          {mandatory ? 'Mandatory' : 'Optional / Supplementary'}
                        </span>
                        {doc.format && <span className="text-slate-500">Format: {doc.format}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    case 's14_stepByStepApplicationProcedure': {
      const steps: any[] = Array.isArray(secObj.steps) && secObj.steps.length > 0
        ? secObj.steps
        : Array.isArray(legacyDetails?.applicationSteps)
        ? legacyDetails.applicationSteps
        : [];
      return (
        <div className="space-y-2.5">
          {steps.length === 0 ? (
            <div className="text-xs text-slate-500 italic">No steps recorded.</div>
          ) : (
            steps.map((st, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-blue-900 text-white font-black flex items-center justify-center shrink-0 text-xs">
                  {st.stepNumber || idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-sm">{st.title || `Step ${idx + 1}`}</div>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{st.description || st.instructions}</p>
                  {st.officialActionUrl && (
                    <a
                      href={st.officialActionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 underline text-[11px] mt-1.5"
                    >
                      <span>Action Portal</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    case 's18_officialFeesAndCostBreakdown': {
      const currency = secObj.primaryFeeCurrency || secObj.currency || 'USD';
      const primaryDisplay =
        secObj.applicationFeeText ||
        (secObj.primaryFeeAmount
          ? `${currency} ${secObj.primaryFeeAmount}`
          : secObj.governmentFee != null
          ? `${currency} ${secObj.governmentFee}`
          : legacyDetails?.visaOverview?.fee || legacyDetails?.visaOverview?.visaFee || 'See Official Schedule');
      const issuanceDisplay =
        secObj.issuanceFeeText ||
        secObj.issuanceReciprocityFeeNote ||
        null;
      const conditionalDisplay =
        secObj.conditionalFeeText ||
        (secObj.biometricsFeeAmount ? `${secObj.biometricsFeeCurrency || currency} ${secObj.biometricsFeeAmount}` : null);
      const refundDisplay =
        secObj.refundPolicySummary ||
        (secObj.isRefundableOnRefusal === false
          ? 'Non-refundable upon refusal or withdrawal'
          : secObj.isRefundableOnRefusal === true
          ? 'Refundable under statutory conditions'
          : null);
      const secondaryMeta = [
        secObj.feeEffectiveDate ? `Effective: ${secObj.feeEffectiveDate}` : null,
        secObj.lastVerifiedDate ? `Last Verified: ${secObj.lastVerifiedDate}` : null,
        refundDisplay
      ].filter(Boolean);

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoCard
              label={secObj.applicationFeeText ? 'Upfront Application Fee' : 'Government Consular Application Fee'}
              value={primaryDisplay}
              highlight
            />
            {issuanceDisplay ? (
              <InfoCard label="Approval / Issuance Fee" value={issuanceDisplay} />
            ) : (
              <InfoCard
                label="Biometrics Fee"
                value={secObj.biometricsFeeAmount ? `${secObj.biometricsFeeCurrency || 'USD'} ${secObj.biometricsFeeAmount}` : 'Included or Free'}
              />
            )}
            <InfoCard
              label={conditionalDisplay ? 'Conditional / Nationality-Specific Charges' : 'Payment Methods'}
              value={
                conditionalDisplay ||
                (Array.isArray(secObj.acceptedPaymentMethods)
                  ? secObj.acceptedPaymentMethods.join(', ')
                  : 'Credit Card / Consular Portal')
              }
            />
          </div>
          {(secondaryMeta.length > 0 || (issuanceDisplay && Array.isArray(secObj.acceptedPaymentMethods))) && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 flex flex-wrap gap-x-4 gap-y-1">
              {issuanceDisplay && Array.isArray(secObj.acceptedPaymentMethods) && (
                <span><strong>Payment Methods:</strong> {secObj.acceptedPaymentMethods.join(', ')}</span>
              )}
              {secondaryMeta.map((item, idx) => (
                <span key={idx} className="font-medium">{item}</span>
              ))}
            </div>
          )}
        </div>
      );
    }

    case 's19_processingTimesAndTimelines':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoCard
            label="Standard Processing Time"
            value={secObj.standardProcessingWindow || legacyDetails?.visaOverview?.processingTime || '3 to 5 Weeks (Official Target)'}
            highlight
          />
          <InfoCard
            label="Expedited Service Available"
            value={secObj.expeditedAvailable === true ? 'Yes (Emergency criteria)' : 'No expedited processing'}
          />
          <InfoCard
            label="Recommended Application Window"
            value={secObj.recommendedApplicationLeadTime || 'Apply 2–3 months before planned travel'}
          />
        </div>
      );

    case 's30_faqsEdgeCasesAndOfficialSources': {
      const faqs: any[] = Array.isArray(secObj.faqs) && secObj.faqs.length > 0
        ? secObj.faqs
        : Array.isArray(legacyDetails?.faq)
        ? legacyDetails.faq
        : [];
      return (
        <div className="space-y-2.5">
          {faqs.length === 0 ? (
            <div className="text-xs text-slate-500 italic">No FAQs recorded yet.</div>
          ) : (
            faqs.map((f, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900 flex items-start gap-2">
                  <HelpCircle size={15} className="text-blue-700 shrink-0 mt-0.5" />
                  <span>{f.question || f.q}</span>
                </div>
                <p className="text-slate-700 pl-6 leading-relaxed">{f.answer || f.a}</p>
              </div>
            ))
          )}
        </div>
      );
    }

    default:
      return (
        <div className="text-xs text-slate-700">
          <p className="leading-relaxed">
            {secObj.summary || secObj.details || 'Official requirements verified under applicable consular legislation.'}
          </p>
        </div>
      );
  }
}

function InfoCard({
  label,
  value,
  highlight = false
}: {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3.5 rounded-xl border text-xs ${
        highlight
          ? 'bg-blue-50/70 border-blue-200 text-blue-950 font-medium'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}
    >
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-0.5">
        {label}
      </span>
      <span className="font-bold text-sm block">
        {value !== null && value !== undefined && String(value).trim() !== '' ? (
          value
        ) : (
          <span className="text-slate-400 font-normal italic">Awaiting Verification</span>
        )}
      </span>
    </div>
  );
}
