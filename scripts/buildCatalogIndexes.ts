import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

import {
  SUPPORTED_LANGUAGES_15,
  UI_TRANSLATIONS_15,
  LEGAL_CONTENT_LANGUAGES,
  type SupportedLangCode
} from '../src/i18n/config';
import {
  STATIC_CATALOG_SCHEMA_VERSION,
  isEligibleForPublicCatalogIndex,
  type BilateralRouteOverrideRecord,
  type ChangelogRecord,
  type ClaimRecord,
  type CountryRecord,
  type EditorialArticleRecord,
  type EvidenceRecord,
  type ImmigrationProgramRecord,
  type OfficialSourceRecord,
  type VisaDetailRecord
} from '../src/schemas/catalogSchemas';
import { validateStaticCatalog } from './validateStaticCatalog';
import type { CompactRouteMatrixFile } from './exportCatalogToStatic';

export interface HashedArtifactEntry {
  logicalId: string;
  filePath: string; // relative to outDir (e.g., "index-countries.a1b2c3d4e5.json")
  sha256: string;
  bytes: number;
  gzipBytes: number;
}

export interface CatalogBuildManifest {
  schemaVersion: typeof STATIC_CATALOG_SCHEMA_VERSION;
  artifactRole: 'GENERATED_STATIC_CATALOG_INDEXES';
  authoritativeSourceDir: 'data/';
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
    lazyEditorialChunks: number;
  };
  indexes: {
    countries: HashedArtifactEntry;
    programs: HashedArtifactEntry;
    categories: HashedArtifactEntry;
    routes: HashedArtifactEntry;
    officialSources: HashedArtifactEntry;
    changelog: HashedArtifactEntry;
    editorial: HashedArtifactEntry;
    verificationSummary: HashedArtifactEntry;
    searchByLanguage: Record<SupportedLangCode, HashedArtifactEntry>;
  };
  chunks: {
    countries: Record<string, HashedArtifactEntry>;
    visaDetails: Record<string, HashedArtifactEntry>;
    routeOverrides: Record<string, HashedArtifactEntry>;
    editorial: Record<string, HashedArtifactEntry>;
  };
  performanceSummary: {
    initialCoreIndexBytes: number;
    initialCoreIndexGzipBytes: number;
    totalArtifactsBytes: number;
    totalArtifactsGzipBytes: number;
    monolithic61752RoutesAvoided: true;
  };
}

export interface BuildCatalogIndexesOptions {
  dataDir?: string;
  outDir?: string;
  evaluationDate?: Date;
}

export interface BuildCatalogIndexesResult {
  manifest: CatalogBuildManifest;
  outDir: string;
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function compactJson(value: unknown): string {
  return JSON.stringify(value);
}

function sha256Hex(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function gzipSize(content: string): number {
  return zlib.gzipSync(Buffer.from(content, 'utf8'), { level: 9 }).length;
}

function readJsonFile<T>(fp: string): T {
  return JSON.parse(fs.readFileSync(fp, 'utf8')) as T;
}

function listFiles(dirPath: string, ext: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(ext) && !fs.statSync(path.join(dirPath, f)).isDirectory())
    .sort()
    .map((f) => path.join(dirPath, f));
}

function removeDirContents(dirPath: string): void {
  if (!fs.existsSync(dirPath)) return;
  for (const entry of fs.readdirSync(dirPath)) {
    const full = path.join(dirPath, entry);
    fs.rmSync(full, { recursive: true, force: true });
  }
}

export function buildCatalogIndexes(options: BuildCatalogIndexesOptions = {}): BuildCatalogIndexesResult {
  const dataDir = path.resolve(options.dataDir ?? path.join(process.cwd(), 'data'));
  const outDir = path.resolve(options.outDir ?? path.join(process.cwd(), 'public/catalog'));
  const evaluationDate = options.evaluationDate ?? new Date('2026-11-23T00:00:00.000Z');

  // Gate 1: Strict validation MUST pass before building any public index artifact
  const validation = validateStaticCatalog({ dataDir, evaluationDate });
  if (!validation.valid) {
    throw new Error(
      `CATALOG_VALIDATION_FAILED: Refusing to build public catalog indexes (${validation.summary.errorCount} validation error(s)). First error: ${validation.errors[0]?.code} — ${validation.errors[0]?.message}`
    );
  }

  // Load authoritative records from validated `data/`
  const countries: CountryRecord[] = listFiles(path.join(dataDir, 'countries'), '.json').map((fp) =>
    readJsonFile<CountryRecord>(fp)
  );
  const officialSourcesByCountry = new Map<string, OfficialSourceRecord[]>();
  for (const fp of listFiles(path.join(dataDir, 'official-sources'), '.json')) {
    const list = readJsonFile<OfficialSourceRecord[]>(fp);
    if (list.length > 0) officialSourcesByCountry.set(list[0].countryIso, list);
  }

  const claims: ClaimRecord[] = readJsonFile<ClaimRecord[]>(path.join(dataDir, 'verification/claims.json'));
  const evidence: EvidenceRecord[] = readJsonFile<EvidenceRecord[]>(path.join(dataDir, 'verification/evidence.json'));
  const claimsByProgram = new Map<string, ClaimRecord[]>();
  for (const c of claims) {
    const arr = claimsByProgram.get(c.programId) ?? [];
    arr.push(c);
    claimsByProgram.set(c.programId, arr);
  }
  const evidenceById = new Map(evidence.map((e) => [e.evidenceId, e]));

  // Strictly gate every program via isEligibleForPublicCatalogIndex()
  const eligiblePrograms: ImmigrationProgramRecord[] = [];
  const eligibleProgramsByCountry = new Map<string, ImmigrationProgramRecord[]>();
  for (const fp of listFiles(path.join(dataDir, 'programs'), '.json')) {
    const list = readJsonFile<ImmigrationProgramRecord[]>(fp);
    for (const prog of list) {
      const gate = isEligibleForPublicCatalogIndex(prog, {
        nowDate: evaluationDate,
        linkedClaims: claimsByProgram.get(prog.programId) ?? []
      });
      if (!gate.eligible) continue;
      eligiblePrograms.push(prog);
      const arr = eligibleProgramsByCountry.get(prog.destinationCountryIso) ?? [];
      arr.push(prog);
      eligibleProgramsByCountry.set(prog.destinationCountryIso, arr);
    }
  }
  eligiblePrograms.sort((a, b) => a.programId.localeCompare(b.programId));
  const eligibleProgramIdSet = new Set(eligiblePrograms.map((p) => p.programId));

  // Load eligible Visa Details (only for eligible published programs)
  const eligibleVisaDetails: VisaDetailRecord[] = [];
  for (const fp of listFiles(path.join(dataDir, 'visa-details'), '.json')) {
    const vd = readJsonFile<VisaDetailRecord>(fp);
    if (vd.publicationStatus === 'PUBLISHED' && eligibleProgramIdSet.has(vd.programId)) {
      eligibleVisaDetails.push(vd);
    }
  }
  eligibleVisaDetails.sort((a, b) => a.programId.localeCompare(b.programId));

  // Load compact route matrix + verified route overrides
  const compactMatrix = readJsonFile<CompactRouteMatrixFile>(path.join(dataDir, 'routes/matrix-compact.json'));
  const overridesByDest = new Map<string, BilateralRouteOverrideRecord[]>();
  for (const fp of listFiles(path.join(dataDir, 'routes/overrides'), '.json')) {
    const list = readJsonFile<BilateralRouteOverrideRecord[]>(fp).filter((r) => r.routePublicationEligible);
    if (list.length > 0) overridesByDest.set(list[0].destinationCountryIso, list);
  }

  // Load verified changelog
  const changelog = readJsonFile<ChangelogRecord[]>(path.join(dataDir, 'changelog/latest.json')).filter(
    (c) => c.verificationStatus === 'AVAILABLE_VERIFIED' || c.verificationStatus === 'NOT_AVAILABLE_CONFIRMED'
  );

  // Load ONLY published editorial articles (drafts are NEVER indexed!)
  const publishedEditorial: EditorialArticleRecord[] = [];
  for (const fp of listFiles(path.join(dataDir, 'editorial/published'), '.md')) {
    const parsed = matter(fs.readFileSync(fp, 'utf8'));
    if (parsed.data.editorialStatus === 'published') {
      publishedEditorial.push({
        ...(parsed.data as Omit<EditorialArticleRecord, 'markdownContent'>),
        markdownContent: parsed.content.trim()
      });
    }
  }
  publishedEditorial.sort((a, b) => a.slug.localeCompare(b.slug));

  // Count draft editorial files (strictly excluded from public catalog; count only for audit transparency)
  const draftEditorialFiles = listFiles(path.join(dataDir, 'editorial/drafts'), '.md');

  // Read quarantine summary metadata (NEVER leak preservedPayload or unverified country records)
  interface RawQuarantineRecord {
    entityType?: string;
    entityId?: string;
    countryIso?: string | null;
    verificationStatus?: string;
    reasonCode?: string;
    reasonSummary?: string;
    quarantinedAt?: string;
  }
  const quarantinePath = path.join(dataDir, 'verification/quarantine.json');
  const rawQuarantineRecords: RawQuarantineRecord[] = fs.existsSync(quarantinePath)
    ? readJsonFile<RawQuarantineRecord[]>(quarantinePath)
    : [];

  // Clean output directory for deterministic hashed filenames
  fs.mkdirSync(outDir, { recursive: true });
  removeDirContents(outDir);
  fs.mkdirSync(path.join(outDir, 'search'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'chunks/countries'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'chunks/visa-details'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'chunks/route-overrides'), { recursive: true });
  fs.mkdirSync(path.join(outDir, 'chunks/editorial'), { recursive: true });

  const allArtifacts: HashedArtifactEntry[] = [];

  const emitHashedJson = (logicalId: string, subDir: string, baseName: string, payload: unknown): HashedArtifactEntry => {
    const serialized = compactJson(payload);
    const fullHash = sha256Hex(serialized);
    const shortHash = fullHash.slice(0, 10);
    const fileName = `${baseName}.${shortHash}.json`;
    const relFilePath = subDir ? `${subDir}/${fileName}` : fileName;
    fs.writeFileSync(path.join(outDir, relFilePath), serialized, 'utf8');
    const entry: HashedArtifactEntry = {
      logicalId,
      filePath: relFilePath,
      sha256: fullHash,
      bytes: Buffer.byteLength(serialized, 'utf8'),
      gzipBytes: gzipSize(serialized)
    };
    allArtifacts.push(entry);
    return entry;
  };

  // --------------------------------------------------------------------------
  // 1. Lazy-Loadable Per-Country, Per-Visa-Detail & Per-Route-Override Chunks
  // --------------------------------------------------------------------------
  const countryChunkMap: Record<string, HashedArtifactEntry> = {};
  for (const country of countries) {
    if (country.recordStatus !== 'ACTIVE') continue;
    const iso = country.isoCode;
    const slug = country.slug;
    const chunkPayload = {
      schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
      country,
      officialSources: officialSourcesByCountry.get(iso) ?? [],
      programs: eligibleProgramsByCountry.get(iso) ?? [],
      routeOverrides: overridesByDest.get(iso) ?? [],
      editorialSlugs: publishedEditorial
        .filter((e) => e.destinationCountryIso === iso)
        .map((e) => ({ slug: e.slug, title: e.title, language: e.language }))
    };
    countryChunkMap[slug] = emitHashedJson(`chunk:country:${slug}`, 'chunks/countries', slug, chunkPayload);
  }

  const visaDetailChunkMap: Record<string, HashedArtifactEntry> = {};
  for (const vd of eligibleVisaDetails) {
    const linkedClaims = (claimsByProgram.get(vd.programId) ?? []).filter(
      (c) => c.verificationStatus === 'AVAILABLE_VERIFIED' || c.verificationStatus === 'NOT_AVAILABLE_CONFIRMED'
    );
    const linkedEvidence = vd.evidenceIds
      .map((eid) => evidenceById.get(eid))
      .filter((e): e is EvidenceRecord => Boolean(e));

    const chunkPayload = {
      schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
      detail: vd,
      claims: linkedClaims,
      evidence: linkedEvidence
    };
    visaDetailChunkMap[vd.programId] = emitHashedJson(
      `chunk:visa-detail:${vd.programId}`,
      'chunks/visa-details',
      vd.programId,
      chunkPayload
    );
  }

  const routeOverrideChunkMap: Record<string, HashedArtifactEntry> = {};
  for (const [iso, list] of Array.from(overridesByDest.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    const slug = iso.toLowerCase();
    routeOverrideChunkMap[slug] = emitHashedJson(`chunk:route-override:${slug}`, 'chunks/route-overrides', slug, {
      schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
      destinationCountryIso: iso,
      overrides: list
    });
  }

  // Lazy-loadable verified published editorial article chunks (drafts NEVER emitted)
  const editorialChunkMap: Record<string, HashedArtifactEntry> = {};
  for (const article of publishedEditorial) {
    const safeRefs = (article.officialReferences || []).filter(
      (u) => typeof u === 'string' && u.startsWith('https://')
    );
    editorialChunkMap[article.slug] = emitHashedJson(
      `chunk:editorial:${article.slug}`,
      'chunks/editorial',
      article.slug,
      {
        schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
        slug: article.slug,
        language: article.language,
        title: article.title,
        description: article.description,
        publicationDate: article.publicationDate,
        updatedDate: article.updatedDate,
        originCountryIso: article.originCountryIso ?? null,
        destinationCountryIso: article.destinationCountryIso ?? null,
        category: article.category ?? null,
        officialReferences: safeRefs,
        editorialStatus: 'published' as const,
        markdownContent: article.markdownContent
      }
    );
  }

  // --------------------------------------------------------------------------
  // 2. Core Compact Indexes
  // --------------------------------------------------------------------------
  const countryDirectoryIndex = emitHashedJson('index:countries', '', 'index-countries', {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    totalCountries: countries.length,
    countries: countries.map((c) => ({
      iso: c.isoCode,
      slug: c.slug,
      name: c.countryName,
      flag: c.flag ?? null,
      continent: c.continent ?? null,
      status: c.recordStatus,
      verifiedProgramCount: (eligibleProgramsByCountry.get(c.isoCode) ?? []).length,
      officialSourceCount: (officialSourcesByCountry.get(c.isoCode) ?? []).length,
      categories: c.availableImmigrationCategories,
      chunkPath: countryChunkMap[c.slug]?.filePath ?? null
    }))
  });

  const programIndex = emitHashedJson('index:programs', '', 'index-programs', {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    totalPrograms: eligiblePrograms.length,
    legalContentLanguage: 'en',
    programs: eligiblePrograms.map((p) => ({
      id: p.programId,
      countryIso: p.destinationCountryIso,
      name: p.programName,
      localName: p.localLanguageName ?? null,
      category: p.immigrationCategory,
      type: p.programType,
      status: p.verificationStatus,
      lastVerifiedDate: p.lastVerifiedDate,
      officialUrl: p.officialSourceRefs[0]?.url ?? null,
      detailChunkPath: visaDetailChunkMap[p.programId]?.filePath ?? null
    }))
  });

  const categoryMap: Record<string, { programIds: string[]; countryIsos: string[] }> = {};
  for (const p of eligiblePrograms) {
    if (!categoryMap[p.immigrationCategory]) {
      categoryMap[p.immigrationCategory] = { programIds: [], countryIsos: [] };
    }
    categoryMap[p.immigrationCategory].programIds.push(p.programId);
    if (!categoryMap[p.immigrationCategory].countryIsos.includes(p.destinationCountryIso)) {
      categoryMap[p.immigrationCategory].countryIsos.push(p.destinationCountryIso);
    }
  }
  const sortedCategories: Record<string, { count: number; countryIsos: string[]; programIds: string[] }> = {};
  for (const cat of Object.keys(categoryMap).sort()) {
    const entry = categoryMap[cat];
    sortedCategories[cat] = {
      count: entry.programIds.length,
      countryIsos: entry.countryIsos.sort(),
      programIds: entry.programIds.sort()
    };
  }
  const categoryIndex = emitHashedJson('index:categories', '', 'index-categories', {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    categories: sortedCategories
  });

  // Compact route lookup index (NEVER 61,752 duplicated route rows!)
  const routeIndex = emitHashedJson('index:routes', '', 'index-routes', {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    storageStrategy: compactMatrix.storageStrategy,
    totalIsoCountries: compactMatrix.totalIsoCountries,
    totalPossibleBilateralPairs: compactMatrix.totalPossibleBilateralPairs,
    uninhabitedTerritoryCodes: compactMatrix.uninhabitedTerritoryCodes,
    treatyBlocs: compactMatrix.treatyBlocs,
    originRuleSets: compactMatrix.originRuleSets,
    verifiedOverrideChunks: Object.fromEntries(
      Object.entries(routeOverrideChunkMap).map(([destSlug, art]) => [destSlug, art.filePath])
    )
  });

  const officialSourceIndex = emitHashedJson('index:official-sources', '', 'index-official-sources', {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    verifiedCountryCount: officialSourcesByCountry.size,
    sourcesByCountry: Object.fromEntries(
      Array.from(officialSourcesByCountry.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([iso, list]) => [
          iso,
          list.map((s) => ({
            id: s.sourceId,
            authority: s.issuingAuthority,
            url: s.officialHttpsUrl,
            category: s.sourceCategory,
            lastCheckedDate: s.lastCheckedDate,
            httpStatus: s.httpAvailabilityStatus
          }))
        ])
    )
  });

  const changelogIndex = emitHashedJson('index:changelog', '', 'index-changelog', {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    totalEntries: changelog.length,
    entries: changelog
  });

  const editorialIndex = emitHashedJson('index:editorial', '', 'index-editorial', {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    totalPublished: publishedEditorial.length,
    articles: publishedEditorial.map((e) => ({
      slug: e.slug,
      language: e.language,
      title: e.title,
      description: e.description,
      publicationDate: e.publicationDate,
      updatedDate: e.updatedDate,
      originCountryIso: e.originCountryIso ?? null,
      destinationCountryIso: e.destinationCountryIso ?? null,
      category: e.category ?? null,
      officialReferences: e.officialReferences,
      chunkPath: editorialChunkMap[e.slug]?.filePath ?? null
    }))
  });

  // Public verification & quarantine status summary (strictly non-PII, aggregate counts + expired statutory notices)
  const activeCountryCount = countries.filter((c) => c.recordStatus === 'ACTIVE').length;
  const quarantinedCountryCount = countries.filter((c) => c.recordStatus === 'QUARANTINED').length;
  const uninhabitedCount = countries.filter((c) => c.recordStatus === 'UNINHABITED_TERRITORY').length;
  let totalVerifiedHttpsSources = 0;
  for (const list of officialSourcesByCountry.values()) totalVerifiedHttpsSources += list.length;

  const expiredProgramNotices = rawQuarantineRecords
    .filter((q) => q.entityType === 'program' && q.reasonCode === 'EXPIRED_PROGRAM')
    .sort((a, b) => String(a.countryIso || '').localeCompare(String(b.countryIso || '')))
    .map((q) => ({
      countryIso: String(q.countryIso || '').toUpperCase(),
      status: 'EXPIRED' as const,
      reasonCode: 'EXPIRED_PROGRAM' as const,
      reasonSummary: String(
        q.reasonSummary || 'Program legally abolished or expired; excluded from active catalog and sitemaps.'
      ),
      quarantinedDate: String(q.quarantinedAt || '').slice(0, 10) || '2026-11-10'
    }));

  const verificationSummaryIndex = emitHashedJson('index:verification-summary', '', 'index-verification-summary', {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    canonicalMetrics: {
      isoCountriesRegistry: countries.length,
      potentialBilateralRoutes: countries.length * (countries.length - 1),
      trackedCoverageSlots: countries.length * 7,
      verifiedActiveCountries: activeCountryCount,
      awaitingOfficialVerificationCountries: quarantinedCountryCount,
      uninhabitedTerritories: uninhabitedCount,
      verifiedAvailablePrograms: eligiblePrograms.length,
      expiredExcludedPrograms: expiredProgramNotices.length,
      verifiedOfficialHttpsSources: totalVerifiedHttpsSources,
      verifiedChangelogEntries: changelog.length,
      publishedEditorialArticles: publishedEditorial.length,
      excludedDraftEditorialArticles: draftEditorialFiles.length
    },
    expiredProgramNotices
  });

  // --------------------------------------------------------------------------
  // 3. Per-Language Search Indexes for ALL 15 Supported Languages
  //    (Explicit language coverage, zero fake automatic legal translation!)
  // --------------------------------------------------------------------------
  const searchByLanguage = {} as Record<SupportedLangCode, HashedArtifactEntry>;

  for (const langMeta of SUPPORTED_LANGUAGES_15) {
    const lang = langMeta.code;
    const uiStrings = UI_TRANSLATIONS_15[lang];
    const isEnglish = lang === 'en';
    const fallbackNotice = uiStrings.englishFallbackNotice.replace('{lang}', langMeta.nativeName);

    const langPayload = {
      schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
      language: {
        code: lang,
        name: langMeta.name,
        nativeName: langMeta.nativeName,
        dir: langMeta.dir
      },
      translationCoverage: {
        uiShellTranslated: true,
        legalProgramRulesLanguage: 'en' as const,
        hasVerifiedNativeLegalTranslation: isEnglish,
        fallbackLanguage: 'en' as const,
        fallbackNotice: isEnglish ? null : fallbackNotice
      },
      uiLabels: {
        searchPlaceholder: uiStrings.searchPlaceholder,
        allDestinations: uiStrings.allDestinations,
        openOfficialSource: uiStrings.openOfficialSource,
        emptyStateText: uiStrings.emptyStateText
      },
      countries: countries.map((c) => {
        const localized = c.localizedNames[lang];
        return {
          iso: c.isoCode,
          slug: c.slug,
          displayName: localized ?? c.countryName,
          displayNameLanguage: localized ? lang : 'en',
          status: c.recordStatus,
          verifiedProgramCount: (eligibleProgramsByCountry.get(c.isoCode) ?? []).length
        };
      }),
      programs: eligiblePrograms.map((p) => ({
        id: p.programId,
        countryIso: p.destinationCountryIso,
        title: p.programName,
        localName: p.localLanguageName ?? null,
        category: p.immigrationCategory,
        contentLanguage: 'en' as const,
        isFallbackContent: !isEnglish
      })),
      editorial: publishedEditorial.map((e) => ({
        slug: e.slug,
        title: e.title,
        contentLanguage: e.language,
        isFallbackContent: e.language !== lang
      }))
    };

    searchByLanguage[lang] = emitHashedJson(`index:search:${lang}`, 'search', `search-${lang}`, langPayload);
  }

  // Compute performance metrics & deterministic manifest
  const initialCoreArtifacts = [countryDirectoryIndex, programIndex, categoryIndex, searchByLanguage.en];
  const initialCoreIndexBytes = initialCoreArtifacts.reduce((acc, a) => acc + a.bytes, 0);
  const initialCoreIndexGzipBytes = initialCoreArtifacts.reduce((acc, a) => acc + a.gzipBytes, 0);
  const totalArtifactsBytes = allArtifacts.reduce((acc, a) => acc + a.bytes, 0);
  const totalArtifactsGzipBytes = allArtifacts.reduce((acc, a) => acc + a.gzipBytes, 0);

  const deterministicBuildHash = sha256Hex(
    allArtifacts
      .slice()
      .sort((a, b) => a.filePath.localeCompare(b.filePath))
      .map((a) => `${a.filePath}:${a.sha256}`)
      .join('\n')
  );

  let verifiedRouteOverridesCount = 0;
  for (const list of overridesByDest.values()) verifiedRouteOverridesCount += list.length;

  let verifiedSourcesCount = 0;
  for (const list of officialSourcesByCountry.values()) verifiedSourcesCount += list.length;

  const manifest: CatalogBuildManifest = {
    schemaVersion: STATIC_CATALOG_SCHEMA_VERSION,
    artifactRole: 'GENERATED_STATIC_CATALOG_INDEXES',
    authoritativeSourceDir: 'data/',
    deterministicBuildHash,
    supportedLanguages: SUPPORTED_LANGUAGES_15.map((l) => l.code),
    legalContentLanguages: [...LEGAL_CONTENT_LANGUAGES],
    counts: {
      countriesInDirectory: countries.length,
      activeVerifiedCountries: Object.keys(countryChunkMap).length,
      publishedPrograms: eligiblePrograms.length,
      categoriesWithPrograms: Object.keys(sortedCategories).length,
      verifiedOfficialSources: verifiedSourcesCount,
      verifiedRouteOverrides: verifiedRouteOverridesCount,
      publishedVisaDetails: eligibleVisaDetails.length,
      publishedEditorialArticles: publishedEditorial.length,
      changelogEntries: changelog.length,
      languageSearchIndexes: Object.keys(searchByLanguage).length,
      lazyCountryChunks: Object.keys(countryChunkMap).length,
      lazyVisaDetailChunks: Object.keys(visaDetailChunkMap).length,
      lazyEditorialChunks: Object.keys(editorialChunkMap).length
    },
    indexes: {
      countries: countryDirectoryIndex,
      programs: programIndex,
      categories: categoryIndex,
      routes: routeIndex,
      officialSources: officialSourceIndex,
      changelog: changelogIndex,
      editorial: editorialIndex,
      verificationSummary: verificationSummaryIndex,
      searchByLanguage
    },
    chunks: {
      countries: countryChunkMap,
      visaDetails: visaDetailChunkMap,
      routeOverrides: routeOverrideChunkMap,
      editorial: editorialChunkMap
    },
    performanceSummary: {
      initialCoreIndexBytes,
      initialCoreIndexGzipBytes,
      totalArtifactsBytes,
      totalArtifactsGzipBytes,
      monolithic61752RoutesAvoided: true
    }
  };

  fs.writeFileSync(path.join(outDir, 'manifest.json'), stableJson(manifest), 'utf8');

  return { manifest, outDir };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const args = process.argv.slice(2);
  let dataDir: string | undefined;
  let outDir: string | undefined;
  let jsonOutput = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--data-dir' && args[i + 1]) dataDir = args[++i];
    else if (args[i] === '--out-dir' && args[i + 1]) outDir = args[++i];
    else if (args[i] === '--json') jsonOutput = true;
  }

  const res = buildCatalogIndexes({ dataDir, outDir });
  if (jsonOutput) {
    console.log(JSON.stringify(res.manifest, null, 2));
  } else {
    const c = res.manifest.counts;
    const p = res.manifest.performanceSummary;
    console.log('===============================================================');
    console.log('✅ STATIC CATALOG SEARCH & CHUNK INDEX BUILD COMPLETE');
    console.log(`- Output Directory:       ${res.outDir}`);
    console.log(`- Build Hash:             ${res.manifest.deterministicBuildHash}`);
    console.log(`- Countries Directory:    ${c.countriesInDirectory} (${c.activeVerifiedCountries} active lazy chunks)`);
    console.log(`- Eligible Programs:      ${c.publishedPrograms} across ${c.categoriesWithPrograms} categories`);
    console.log(`- Language Search Files:  ${c.languageSearchIndexes} (all 15 UI languages; explicit EN fallback)`);
    console.log(`- Route Override Chunks:  ${Object.keys(res.manifest.chunks.routeOverrides).length} (${c.verifiedRouteOverrides} verified corridors; 61,752 dump avoided)`);
    console.log(`- Initial Core Payload:   ${(p.initialCoreIndexBytes / 1024).toFixed(1)} KB raw / ${(p.initialCoreIndexGzipBytes / 1024).toFixed(1)} KB gzip`);
    console.log(`- Total Artifacts Size:   ${(p.totalArtifactsBytes / 1024).toFixed(1)} KB raw / ${(p.totalArtifactsGzipBytes / 1024).toFixed(1)} KB gzip`);
    console.log('===============================================================');
  }
}
