/**
 * VISAAPPLY.ORG — PHASE 4: BROWSER-SAFE STATIC CATALOG TYPES
 *
 * Pure TypeScript type contracts matching the generated artifacts in
 * `public/catalog/manifest.json` and `public/catalog/**`.
 *
 * Strictly browser-safe: zero Node.js built-ins, zero database imports.
 */

import type { SupportedLangCode } from '../i18n/config';

export type StaticCountryRecordStatus = 'ACTIVE' | 'QUARANTINED' | 'UNINHABITED_TERRITORY';

export type StaticProgramCategory =
  | 'pr'
  | 'citizenship'
  | 'work'
  | 'student'
  | 'family'
  | 'business'
  | 'investor'
  | 'digital_nomad'
  | 'retirement'
  | 'pet_travel'
  | 'tourist'
  | 'transit';

export interface CatalogArtifactDescriptor {
  logicalId: string;
  filePath: string;
  sha256: string;
  bytes: number;
  gzipBytes: number;
}

export interface StaticCatalogManifest {
  schemaVersion: string;
  artifactRole: string;
  authoritativeSourceDir: string;
  deterministicBuildHash: string;
  supportedLanguages: SupportedLangCode[];
  legalContentLanguages: SupportedLangCode[];
  counts: {
    countriesInDirectory: number;
    activeVerifiedCountries: number;
    publishedPrograms: number;
    categoriesWithPrograms: number;
    verifiedOfficialSources: number;
    verifiedRouteOverrides: number;
    publishedVisaDetails: number;
    publishedEditorialArticles: number;
    changelogEntries: number;
    languageSearchIndexes: number;
    lazyCountryChunks: number;
    lazyVisaDetailChunks: number;
  };
  indexes: {
    countries: CatalogArtifactDescriptor;
    programs: CatalogArtifactDescriptor;
    categories: CatalogArtifactDescriptor;
    routes: CatalogArtifactDescriptor;
    officialSources: CatalogArtifactDescriptor;
    changelog: CatalogArtifactDescriptor;
    editorial: CatalogArtifactDescriptor;
    searchByLanguage: Record<string, CatalogArtifactDescriptor>;
  };
  chunks: {
    countries: Record<string, CatalogArtifactDescriptor>;
    visaDetails: Record<string, CatalogArtifactDescriptor>;
    routeOverrides: Record<string, CatalogArtifactDescriptor>;
  };
  performanceSummary: {
    initialCoreIndexBytes: number;
    initialCoreIndexGzipBytes: number;
    totalArtifactsBytes: number;
    totalArtifactsGzipBytes: number;
    monolithic61752RoutesAvoided: boolean;
  };
}

export interface CountryIndexEntry {
  iso: string;
  slug: string;
  name: string;
  flag: string;
  continent: string;
  status: StaticCountryRecordStatus;
  verifiedProgramCount: number;
  officialSourceCount: number;
  categories: StaticProgramCategory[];
  chunkPath: string | null;
}

export interface CountriesIndexPayload {
  schemaVersion: string;
  totalCountries: number;
  activeCountries: number;
  countries: CountryIndexEntry[];
}

export interface ProgramIndexEntry {
  id: string;
  countryIso: string;
  name: string;
  localName: string | null;
  category: StaticProgramCategory;
  type: string;
  status: string;
  lastVerifiedDate: string;
  officialUrl: string;
  detailChunkPath: string | null;
}

export interface ProgramsIndexPayload {
  schemaVersion: string;
  totalPrograms: number;
  legalContentLanguage: string;
  programs: ProgramIndexEntry[];
}

export interface CategoryFacetSummary {
  count: number;
  countryIsos: string[];
  programIds: string[];
}

export interface CategoriesIndexPayload {
  schemaVersion: string;
  categories: Record<string, CategoryFacetSummary>;
}

export interface OfficialSourceSummaryItem {
  id: string;
  authority: string;
  url: string;
  category: string;
  lastCheckedDate: string;
  httpStatus: string;
}

export interface OfficialSourcesIndexPayload {
  schemaVersion: string;
  verifiedCountryCount: number;
  sourcesByCountry: Record<string, OfficialSourceSummaryItem[]>;
}

export interface StaticChangelogEntry {
  schemaVersion: string;
  changeId: string;
  affectedCountryIso: string;
  affectedProgramId: string | null;
  changeCategory: string;
  title: string;
  previousValue: string;
  newValue: string;
  sourceReference: {
    url: string;
  };
  changeDate: string;
  verificationStatus: string;
  verifiedBy: string;
  relatedEditorialSlug: string | null;
}

export interface ChangelogIndexPayload {
  schemaVersion: string;
  totalEntries: number;
  entries: StaticChangelogEntry[];
}

export interface EditorialIndexArticle {
  slug: string;
  language: string;
  title: string;
  description: string;
  publicationDate: string;
  updatedDate: string;
  originCountryIso: string;
  destinationCountryIso: string;
  category: string;
  officialReferences: string[];
}

export interface EditorialIndexPayload {
  schemaVersion: string;
  totalPublished: number;
  articles: EditorialIndexArticle[];
}

export interface SearchLanguageMeta {
  code: SupportedLangCode;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export interface SearchTranslationCoverage {
  uiShellTranslated: boolean;
  legalProgramRulesLanguage: string;
  hasVerifiedNativeLegalTranslation: boolean;
  fallbackLanguage: string;
  fallbackNotice: string | null;
}

export interface SearchIndexPayload {
  schemaVersion: string;
  language: SearchLanguageMeta;
  translationCoverage: SearchTranslationCoverage;
  uiLabels: {
    searchPlaceholder: string;
    allDestinations: string;
    openOfficialSource: string;
    emptyStateText: string;
  };
  countries: Array<{
    iso: string;
    slug: string;
    displayName: string;
    displayNameLanguage: string;
    status: StaticCountryRecordStatus;
    verifiedProgramCount: number;
  }>;
  programs: Array<{
    id: string;
    countryIso: string;
    title: string;
    localName: string | null;
    category: StaticProgramCategory;
    contentLanguage: string;
    isFallbackContent: boolean;
  }>;
  editorial: Array<{
    slug: string;
    title: string;
    contentLanguage: string;
    isFallbackContent: boolean;
  }>;
}

export interface StaticOfficialSourceRecord {
  schemaVersion: string;
  sourceId: string;
  countryIso: string;
  issuingAuthority: string;
  officialOrganizationName: string;
  officialHttpsUrl: string;
  sourceCategory: string;
  sourceLanguage: string;
  lastCheckedDate: string;
  httpAvailabilityStatus: string;
  evidenceNotes?: string | null;
}

export interface StaticProgramRecord {
  schemaVersion: string;
  programId: string;
  destinationCountryIso: string;
  programName: string;
  localLanguageName?: string | null;
  immigrationCategory: StaticProgramCategory;
  programType: string;
  eligibilitySummary: string;
  officialSourceRefs: Array<{
    sourceId: string;
    url: string;
    title?: string;
  }>;
  verificationStatus: string;
  createdDate: string;
  lastVerifiedDate: string;
  lastUpdatedDate: string;
  publicationStatus: string;
  legalBasis?: string | null;
  applyFrom?: string | null;
}

export interface StaticRouteOverrideRecord {
  schemaVersion: string;
  routeId: string;
  originCountryIso: string;
  destinationCountryIso: string;
  applicableVisaCategories: string[];
  ruleMatrixRef: string;
  verifiedOverrides: {
    visaFree: boolean;
    eVisaEligible: boolean;
    voaEligible: boolean;
    maxStayDays: number | null;
    overrideProgramIds: string[];
    scopeNote: string;
  };
  routePublicationEligible: boolean;
  verificationMetadata: {
    verificationStatus: string;
    lastVerifiedDate: string;
    officialSourceIds: string[];
  };
}

export interface CountryChunkPayload {
  schemaVersion: string;
  country: {
    schemaVersion: string;
    isoCode: string;
    slug: string;
    countryName: string;
    localizedNames?: Record<string, string>;
    officialCountryDomain: string | null;
    immigrationAuthorityRefs: string[];
    supportedLanguages: SupportedLangCode[];
    availableImmigrationCategories: StaticProgramCategory[];
    lastReviewedAt: string;
    recordStatus: StaticCountryRecordStatus;
    flag: string;
    continent: string;
    notes: string | null;
  };
  officialSources: StaticOfficialSourceRecord[];
  programs: StaticProgramRecord[];
  routeOverrides: StaticRouteOverrideRecord[];
  editorialSlugs: string[];
}

export interface VisaDetailChunkPayload {
  schemaVersion: string;
  detail: {
    schemaVersion: string;
    detailId: string;
    programId: string;
    destinationCountryIso: string;
    verificationStatus: string;
    publicationStatus: string;
    lastVerifiedDate: string;
    lastUpdatedDate: string;
    sections: {
      overview: string | null;
      eligibility: string | null;
      nationalityRestrictions: string | null;
      ageRequirements: string | null;
      educationRequirements: string | null;
      workExperience: string | null;
      financialRequirements: string | null;
      processingTime: string | null;
      validity: string | null;
      renewal: string | null;
      familyDependentProvisions: string | null;
      rightsAndRestrictions: string | null;
      requiredDocuments: string[] | null;
      applicationProcess: string[] | null;
      applicationFees: string | null;
      officialApplicationLinks: string[] | null;
      frequentlyAskedQuestions: Array<{
        question: string;
        answer: string;
        officialSourceUrl?: string | null;
      }> | null;
    };
    claimIds: string[];
    evidenceIds: string[];
  };
  claims: Array<{
    schemaVersion: string;
    claimId: string;
    programId: string;
    claimText: string;
    claimClassification: string;
    officialSourceId: string;
    sourceUrl: string;
    evidenceIds: string[];
    supportingExcerpt: string;
    accessDate: string;
    verificationDate: string;
    verificationStatus: string;
    sectionKey: string;
  }>;
  evidence: Array<{
    schemaVersion: string;
    evidenceId: string;
    claimId: string;
    officialSourceId: string;
    sourceUrl: string;
    issuingAuthority: string;
    sourceTitle: string;
    accessDate: string;
    lastVerifiedDate: string;
    supportingExcerpt: string;
    evidenceStatus: string;
  }>;
}

export interface CompactRoutesIndexPayload {
  schemaVersion: string;
  storageStrategy: string;
  totalIsoCountries: number;
  totalPossibleBilateralPairs: number;
  uninhabitedTerritoryCodes: string[];
  treatyBlocs: {
    gcc: string[];
    fullSchengenEu: string[];
    euNonSchengen: string[];
    euEeaSwissMobility: string[];
  };
  originRuleSets: Record<
    string,
    {
      visaFreeDestinations: string[];
      eVisaOrVoaDestinations: string[];
      voaVerifiedDestinations: string[];
    }
  >;
  verifiedOverrideChunks: Record<string, string>;
}

export interface RouteOverrideChunkPayload {
  schemaVersion: string;
  destinationCountryIso: string;
  overrides: StaticRouteOverrideRecord[];
}

export type RouteRuleSpecificity =
  | 'VERIFIED_COUNTRY_OVERRIDE'
  | 'GENERIC_BLOC_OR_ORIGIN_CLASSIFICATION'
  | 'UNINHABITED_TERRITORY'
  | 'AWAITING_VERIFICATION';

export interface ResolvedCompactRoute {
  routeId: string;
  fromIso: string;
  toIso: string;
  fromName: string;
  toName: string;
  fromFlag: string;
  toFlag: string;
  visaFree: boolean;
  eVisaEligible: boolean;
  voaEligible: boolean;
  maxStayDays: number | null;
  ruleSpecificity: RouteRuleSpecificity;
  classificationLabel: string;
  disclaimer: string;
  lastVerifiedDate: string | null;
  verifiedProgramCount: number;
  overrideProgramIds: string[];
  scopeNote: string | null;
  routeHref: string;
}

export type CatalogLoadStatus = 'ok' | 'empty' | 'unavailable' | 'quarantined' | 'error';

export interface CatalogLoadResult<T> {
  status: CatalogLoadStatus;
  data: T | null;
  code?: string;
  error?: string;
  retryable: boolean;
  fromCache: boolean;
  source: 'static_catalog';
}

export type StaticCatalogFeatureKey =
  | 'immigrationHub'
  | 'countryDetail'
  | 'visaDetail'
  | 'routes'
  | 'sourceVerifier'
  | 'visaComparison'
  | 'editorial'
  | 'changelog';
